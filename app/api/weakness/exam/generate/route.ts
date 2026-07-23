import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";
import {
  fetchUnitStats,
  fetchProblemHistory,
  buildUserStateSnapshot,
  totalAttemptsFromUnitStats,
} from "@/lib/weakness/score";
import { assembleWeaknessExam } from "@/lib/weakness/select";

const TARGET_DURATION_SEC = 70 * 60; // 70분
const FIRST_REQUIRED = 200;
const REPEAT_REQUIRED_QUESTIONS = 100;
const REPEAT_REQUIRED_DAYS = 3;

export async function POST(request: Request) {
  // 취약유형 모의고사는 무료 개방. 자격(풀이량/기간)만 검증한다.
  const auth = await requireTier(request, "free");
  if (!auth.ok) return auth.response;

  // 1) 자격 재검증
  const stats = await fetchUnitStats(auth.supabase, auth.userId);
  const history = await fetchProblemHistory(auth.supabase, auth.userId);
  const totalSolved = totalAttemptsFromUnitStats(stats);

  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("last_weakness_exam_at, weakness_exam_count")
    .eq("id", auth.userId)
    .maybeSingle();
  const lastAt = (profile?.last_weakness_exam_at as string | null) ?? null;
  const examCount = (profile?.weakness_exam_count as number | null) ?? 0;
  const isFirst = examCount === 0;

  // 관리자는 자격 검증(200문항/3일/100문항)을 우회한다 — 테스트/디버깅 목적.
  if (!auth.isAdmin) {
    if (isFirst) {
      if (totalSolved < FIRST_REQUIRED) {
        return NextResponse.json(
          {
            ok: false,
            message: `취약유형 모의고사는 ${FIRST_REQUIRED}문항 이상 풀이 후 응시할 수 있어요. (현재 ${totalSolved}문항)`,
          },
          { status: 400 }
        );
      }
    } else {
      if (lastAt) {
        const daysSince = (Date.now() - Date.parse(lastAt)) / 86400_000;
        if (daysSince < REPEAT_REQUIRED_DAYS) {
          return NextResponse.json(
            {
              ok: false,
              message: `직전 응시 후 ${REPEAT_REQUIRED_DAYS}일이 지나야 다시 응시할 수 있어요. (현재 ${daysSince.toFixed(1)}일)`,
            },
            { status: 400 }
          );
        }
        const { count } = await auth.supabase
          .from("user_problem_history")
          .select("problem_id", { count: "exact", head: true })
          .eq("user_id", auth.userId)
          .gt("last_attempt_at", lastAt);
        if ((count ?? 0) < REPEAT_REQUIRED_QUESTIONS) {
          return NextResponse.json(
            {
              ok: false,
              message: `직전 응시 후 ${REPEAT_REQUIRED_QUESTIONS}문항을 더 풀이한 뒤에 응시할 수 있어요. (현재 ${count ?? 0}문항)`,
            },
            { status: 400 }
          );
        }
      }
    }
  }

  // 2) 4-tier 추출
  const result = await assembleWeaknessExam(auth.supabase, auth.userId, stats, history, {
    isFirstWeaknessExam: isFirst,
  });
  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.reason }, { status: 400 });
  }

  // 3) 문제 본문/옵션/풀이 한 번에 fetch (단답형 필드 question_type, answer_text 포함)
  const ids = result.assignments.map((a) => a.problemId);
  const { data: questions, error: qErr } = await auth.supabase
    .from("questions")
    .select(
      "id, subject, unit, concept, difficulty, question, content_type, question_image, options, correct_option_id, explanation, explanation_content_type, explanation_image, question_type, answer_text"
    )
    .in("id", ids)
    .eq("quality_status", "approved");
  if (qErr) {
    return NextResponse.json({ ok: false, message: qErr.message }, { status: 500 });
  }
  const qById = new Map<string, Record<string, unknown>>();
  for (const q of questions ?? []) qById.set(q.id as string, q);

  // 4) Problem[] 재구성 (assignments 순서 유지)
  const problems = result.assignments
    .map((a) => qById.get(a.problemId))
    .filter((q): q is Record<string, unknown> => q !== undefined)
    .map((q) => ({
      id: q.id as string,
      subject: q.subject as string,
      unit: q.unit as string,
      concept: q.concept as string,
      difficulty: q.difficulty as string,
      question: q.question as string,
      contentType: (q.content_type as string | null) ?? "latex",
      questionImage: (q.question_image as string | null) ?? undefined,
      options: q.options,
      correctOptionId: q.correct_option_id as string,
      explanation: q.explanation as string,
      explanationContentType: (q.explanation_content_type as string | null) ?? "latex",
      explanationImage: (q.explanation_image as string | null) ?? undefined,
      questionType: (q.question_type as "multiple_choice" | "subjective" | null) ?? "multiple_choice",
      answerText: (q.answer_text as string | null) ?? undefined,
    }));

  if (problems.length < 25) {
    return NextResponse.json(
      { ok: false, message: "문제 본문 조회 중 일부 누락되어 시험을 만들 수 없습니다." },
      { status: 500 }
    );
  }

  // 5) examId 생성 + generated_exams 형식으로 저장
  const examId = `weakness-${auth.userId}-${Date.now()}`;
  const examTitle = `취약유형 모의고사 #${examCount + 1}`;
  const exam = {
    id: examId,
    title: examTitle,
    description:
      "AI가 분석한 약점 단원과 미체험 유형, 오답 복습, 강점 심화로 구성한 25문항 맞춤형 모의고사입니다.",
    mode: "adaptive",
    timeLimitSec: TARGET_DURATION_SEC,
    tags: ["weakness", `count:${examCount + 1}`],
    problems,
  };
  const sourceQuestionIds = problems.map((p) => p.id);

  // generated_exams 테이블 패턴 차용 (이미 [examId] 페이지가 이 테이블도 조회함)
  const { error: insertErr } = await auth.supabase.from("generated_exams").insert({
    id: examId,
    title: examTitle,
    description: exam.description,
    mode: exam.mode,
    time_limit_sec: TARGET_DURATION_SEC,
    tags: exam.tags,
    problems: problems,
    source_question_ids: sourceQuestionIds,
    generation_summary: {
      requestedCount: 25,
      matchedCount: problems.length,
      selectedCount: problems.length,
      tierBreakdown: result.ratio,
      warnings: [],
    },
    created_at: new Date().toISOString(),
  });
  if (insertErr) {
    return NextResponse.json(
      { ok: false, message: `시험 저장 실패: ${insertErr.message}` },
      { status: 500 }
    );
  }

  // 6) 출제 의도 + 사용자 상태 스냅샷 저장 (응시 후 리포트용)
  // weakness_exam_snapshots는 exam_id를 PK로 사용하고, 응시 완료 후
  // exam_attempts insert 트리거가 attempt_id를 link한다 (snapshot fix 마이그레이션 참조).
  // 스냅샷이 저장돼야만 응시 후 리포트가 동작하므로, 실패 시 생성된 exam도 롤백한다.
  const userStateBefore = buildUserStateSnapshot(stats);
  const { error: snapErr } = await auth.supabase
    .from("weakness_exam_snapshots")
    .insert({
      exam_id: examId,
      user_id: auth.userId,
      tier_breakdown: result.breakdown,
      user_state_before: userStateBefore,
    });
  if (snapErr) {
    console.error("[weakness] snapshot insert failed:", snapErr.message);
    // 짝이 안 맞으면 응시 후 "취약유형 모의고사가 아닙니다" 오류가 뜨므로
    // 생성된 generated_exams 행도 같이 제거해 사용자가 깨끗하게 재시도하게 한다.
    await auth.supabase.from("generated_exams").delete().eq("id", examId);
    return NextResponse.json(
      { ok: false, message: `취약유형 시험 스냅샷 저장 실패: ${snapErr.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    examId,
    examTitle,
    durationSec: TARGET_DURATION_SEC,
    tierSummary: result.ratio,
  });
}
