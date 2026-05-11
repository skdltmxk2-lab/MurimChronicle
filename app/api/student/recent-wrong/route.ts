import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";
import type { AttemptResult } from "@/types/exam";

const RETENTION_DAYS = 7;

type WrongCardItem = {
  problemId: string;
  attemptId: string;
  examId: string;
  examTitle: string;
  submittedAt: string;
  selectedOptionId: string | null;
  // questions 테이블에서 join한 본문/메타
  subject: string;
  unit: string;
  concept: string;
  difficulty: string;
  question: string;
  contentType: string | null;
  questionImage: string | null;
  options: unknown;
  correctOptionId: string;
  explanation: string;
  explanationContentType: string | null;
  explanationImage: string | null;
  questionType: "multiple_choice" | "subjective";
  answerText: string | null;
};

export async function GET(request: Request) {
  const auth = await requireTier(request, "pro");
  if (!auth.ok) return auth.response;

  // exam_attempts 테이블은 submitted_at이 별도 컬럼이 아니라 result JSON 내부에 있다.
  // 본인 attempts 전부 가져온 뒤 result.submittedAt 기준으로 7일 필터링.
  const { data: attempts, error: attemptsErr } = await auth.supabase
    .from("exam_attempts")
    .select("attempt_id, exam_id, result")
    .eq("user_id", auth.userId);
  if (attemptsErr) {
    return NextResponse.json(
      { ok: false, message: attemptsErr.message },
      { status: 500 }
    );
  }

  const cutoff = Date.now() - RETENTION_DAYS * 86400_000;
  const recent = (attempts ?? []).filter((row) => {
    const r = row.result as AttemptResult | null;
    if (!r?.submittedAt) return false;
    return Date.parse(r.submittedAt) >= cutoff;
  });
  // 가장 최근 시도부터 처리하기 위해 내림차순 정렬
  recent.sort((a, b) => {
    const ar = (a.result as AttemptResult).submittedAt;
    const br = (b.result as AttemptResult).submittedAt;
    return ar < br ? 1 : ar > br ? -1 : 0;
  });

  // 같은 문제를 여러 번 틀렸다면 가장 최근 시도 1개만 남긴다.
  const seen = new Set<string>();
  const wrongs: Array<{
    problemId: string;
    attemptId: string;
    examId: string;
    examTitle: string;
    submittedAt: string;
    selectedOptionId: string | null;
  }> = [];

  for (const a of recent) {
    const r = a.result as AttemptResult;
    for (const it of r.items ?? []) {
      if (it.isCorrect) continue;
      if (seen.has(it.problemId)) continue;
      seen.add(it.problemId);
      wrongs.push({
        problemId: it.problemId,
        attemptId: r.attemptId,
        examId: r.examId,
        examTitle: r.examTitle ?? "",
        submittedAt: r.submittedAt,
        selectedOptionId: it.selectedOptionId,
      });
    }
  }

  if (wrongs.length === 0) {
    return NextResponse.json({ ok: true, items: [] as WrongCardItem[], retentionDays: RETENTION_DAYS });
  }

  // 문제 본문/풀이를 한 번에 가져오기 (in 절). 단답형 필드(question_type, answer_text)도 포함.
  const ids = wrongs.map((w) => w.problemId);
  const { data: questions, error: qErr } = await auth.supabase
    .from("questions")
    .select(
      "id, subject, unit, concept, difficulty, question, content_type, question_image, options, correct_option_id, explanation, explanation_content_type, explanation_image, question_type, answer_text"
    )
    .in("id", ids);
  if (qErr) {
    return NextResponse.json({ ok: false, message: qErr.message }, { status: 500 });
  }

  const byId = new Map<string, Record<string, unknown>>();
  for (const q of questions ?? []) byId.set(q.id as string, q);

  const items: WrongCardItem[] = wrongs
    .map((w): WrongCardItem | null => {
      const q = byId.get(w.problemId);
      if (!q) return null;
      return {
        problemId: w.problemId,
        attemptId: w.attemptId,
        examId: w.examId,
        examTitle: w.examTitle,
        submittedAt: w.submittedAt,
        selectedOptionId: w.selectedOptionId,
        subject: (q.subject as string) ?? "",
        unit: (q.unit as string) ?? "",
        concept: (q.concept as string) ?? "",
        difficulty: (q.difficulty as string) ?? "",
        question: (q.question as string) ?? "",
        contentType: (q.content_type as string | null) ?? null,
        questionImage: (q.question_image as string | null) ?? null,
        options: q.options ?? [],
        correctOptionId: (q.correct_option_id as string) ?? "",
        explanation: (q.explanation as string) ?? "",
        explanationContentType: (q.explanation_content_type as string | null) ?? null,
        explanationImage: (q.explanation_image as string | null) ?? null,
        questionType: (q.question_type as "multiple_choice" | "subjective" | null) ?? "multiple_choice",
        answerText: (q.answer_text as string | null) ?? null,
      };
    })
    .filter((x): x is WrongCardItem => x !== null);

  return NextResponse.json({ ok: true, items, retentionDays: RETENTION_DAYS });
}
