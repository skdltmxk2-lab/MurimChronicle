"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { questionRepo } from "@/lib/questions/questionRepository";
import { attemptRepo } from "@/lib/exam/storage";
import { examRepo } from "@/lib/exams/generatedExamRepository";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthContext";
import type { Difficulty, MockExam, Problem } from "@/types/exam";
import type { QuestionRecord } from "@/types/question";
import { ExamRunner } from "@/components/exam/ExamRunner";
import { buildSubjectMockRounds } from "@/lib/exam/buildSubjectMockRounds";
import { DIFFICULTY_KEYS } from "@/lib/taxonomy";

export const SUBJECT_MOCK_ROUNDS = 3;
export const SUBJECT_MOCK_PER_ROUND = 20;
export const SUBJECT_MOCK_TIME_SEC = 50 * 60;

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = ((s * 1664525) + 1013904223) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const DIFFICULTY_INDEX: Record<Difficulty, number> = Object.fromEntries(
  DIFFICULTY_KEYS.map((d, i) => [d, i])
) as Record<Difficulty, number>;

// 난이도 오름차순(easy→killer)으로 정렬하되 같은 난이도 안에서는 시드 셔플
function sortByDifficultyAsc(arr: QuestionRecord[], seed: number): QuestionRecord[] {
  const groups = new Map<number, QuestionRecord[]>();
  for (const q of arr) {
    const idx = DIFFICULTY_INDEX[q.difficulty as Difficulty] ?? DIFFICULTY_KEYS.length;
    if (!groups.has(idx)) groups.set(idx, []);
    groups.get(idx)!.push(q);
  }
  const sortedKeys = [...groups.keys()].sort((a, b) => a - b);
  const result: QuestionRecord[] = [];
  sortedKeys.forEach((k, i) => {
    result.push(...seededShuffle(groups.get(k)!, seed + i));
  });
  return result;
}

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) & 0x7fffffff;
  }
  return hash || 1;
}

function toProblems(records: QuestionRecord[]): Problem[] {
  return records.map((q) => ({
    id: q.id,
    subject: q.subject,
    unit: q.unit,
    concept: q.concept,
    difficulty: q.difficulty,
    question: q.question,
    contentType: q.contentType,
    questionImage: q.questionImage,
    options: q.options,
    correctOptionId: q.correctOptionId,
    explanation: q.explanation,
    explanationContentType: q.explanationContentType,
    explanationImage: q.explanationImage,
    questionType: q.questionType,
    answerText: q.answerText,
  }));
}

function isSubjectOrRealMock(tags: string[]) {
  return (
    tags.includes("과목별모의고사") ||
    tags.includes("기출유형") ||
    tags.includes("자체모고") ||
    tags.includes("유형3") ||
    tags.includes("유형4")
  );
}

export function UnitTestRunnerPage() {
  const searchParams = useSearchParams();
  const { user, authChecked } = useAuth();
  const [exam, setExam] = useState<MockExam | null | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mode = searchParams.get("mode");
  const subject = searchParams.get("subject") ?? "";
  const unitsParam = searchParams.get("units") ?? "";
  const count = Math.min(20, Math.max(1, Number(searchParams.get("count") ?? "10")));
  const dateParam = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const round = Math.max(1, Number(searchParams.get("round") ?? "1"));
  const seed = Number(searchParams.get("seed")) || hashSeed(`${mode ?? "unit"}:${subject}:${unitsParam}:${dateParam}`);
  const retryHref = `/student/exams/unit-test?${searchParams.toString()}`;

  useEffect(() => {
    if (!authChecked) return;
    if (!user) {
      setExam(undefined);
      setErrorMsg(null);
      return;
    }
    let cancelled = false;

    setExam(undefined);
    setErrorMsg(null);

    const fail = (message: string) => {
      if (!cancelled) setErrorMsg(message);
    };

    if (mode === "real") {
      fail("실전 모의고사는 관리자가 등록한 시험만 응시할 수 있습니다.\n시험 목록 페이지의 등록 모의고사를 선택해주세요.");
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      try {
      let filtered: QuestionRecord[];
      let title: string;
      let description: string;
      let examId: string;
      let tags: string[];

      if (mode === "daily") {
        const dailyPool = await questionRepo.listByTag("daily");
        if (cancelled) return;
        if (dailyPool.length === 0) {
          fail("오늘의 데일리 테스트 문제가 아직 없습니다.\n관리자에서 데일리 문제를 추가해 주세요.");
          return;
        }
        const dailyCount = Math.min(5, dailyPool.length);
        const dailyById = new Map(dailyPool.map((q) => [q.id, q]));

        // 1) 관리자가 지정한 오늘의 assignment 우선
        let pickedIds: string[] | null = null;
        try {
          const { data: assignment } = await supabase
            .from("daily_assignments")
            .select("question_ids")
            .eq("date", dateParam)
            .maybeSingle();
          if (assignment?.question_ids && Array.isArray(assignment.question_ids) && assignment.question_ids.length > 0) {
            pickedIds = (assignment.question_ids as string[]).filter((id) => dailyById.has(id));
          }
        } catch {
          // 네트워크 오류 시 폴백 알고리즘으로 진행
        }

        // 2) assignment 없으면 라운드 로빈 (use_count 적은 문제 우선)
        if (!pickedIds || pickedIds.length === 0) {
          let usageMap = new Map<string, { useCount: number; lastUsedDate: string }>();
          try {
            const { data: usageRows } = await supabase
              .from("daily_usage")
              .select("question_id, last_used_date, use_count")
              .in("question_id", dailyPool.map((q) => q.id));
            for (const row of usageRows ?? []) {
              usageMap.set(row.question_id as string, {
                useCount: (row.use_count as number) ?? 0,
                lastUsedDate: (row.last_used_date as string) ?? "0000-00-00",
              });
            }
          } catch {
            usageMap = new Map();
          }
          // 폴백: 사용 이력 정보가 모두 비어있으면 기존 날짜 시드 알고리즘 유지
          if (usageMap.size === 0) {
            const sorted = [...dailyPool].sort((a, b) => a.id.localeCompare(b.id));
            const dayIndex = Math.floor(new Date(`${dateParam}T00:00:00`).getTime() / 86400000);
            const start = (dayIndex * dailyCount) % sorted.length;
            pickedIds = [...sorted.slice(start), ...sorted.slice(0, start)].slice(0, dailyCount).map((q) => q.id);
          } else {
            const sortedPool = [...dailyPool].sort((a, b) => {
              const ua = usageMap.get(a.id);
              const ub = usageMap.get(b.id);
              const ca = ua?.useCount ?? 0;
              const cb = ub?.useCount ?? 0;
              if (ca !== cb) return ca - cb;
              const da = ua?.lastUsedDate ?? "0000-00-00";
              const db = ub?.lastUsedDate ?? "0000-00-00";
              if (da !== db) return da < db ? -1 : 1;
              return a.id.localeCompare(b.id);
            });
            pickedIds = sortedPool.slice(0, dailyCount).map((q) => q.id);
          }
        }

        filtered = pickedIds.map((id) => dailyById.get(id)!).filter(Boolean);
        if (filtered.length === 0) {
          fail("오늘의 데일리 테스트 문제가 아직 없습니다.\n관리자에서 데일리 문제를 추가해 주세요.");
          return;
        }
        title = `데일리 테스트 · ${dateParam}`;
        description = "오늘의 엄선 문제입니다.";
        examId = `unit-daily-${dateParam}`;
        tags = ["daily"];
      } else if (mode === "subject_mock") {
        if (!subject) {
          fail("과목 정보가 없습니다.\n시험 목록에서 다시 선택해 주세요.");
          return;
        }
        const pool = await questionRepo.listBySubject(subject);
        if (cancelled) return;
        if (pool.length === 0) {
          fail(`${subject} 과목의 문제가 아직 없습니다.\n관리자에 문의해 주세요.`);
          return;
        }
        const allRounds = buildSubjectMockRounds(pool, {
          rounds: SUBJECT_MOCK_ROUNDS,
          perRound: SUBJECT_MOCK_PER_ROUND,
        });
        const roundIndex = round - 1;
        if (roundIndex < 0 || roundIndex >= allRounds.length) {
          fail(`${subject} ${round}회 모의고사가 아직 준비되지 않았습니다.`);
          return;
        }
        filtered = allRounds[roundIndex];
        title = `${subject} 과목별 모의고사 ${round}회`;
        description = `${filtered.length}문항 · 50분 · 단원·난이도 균형 출제`;
        examId = `subject-mock:${subject}:${round}`;
        tags = [subject, "과목별 모의고사", `${round}회`];
      } else {
        const selectedUnits = unitsParam.split(",").filter(Boolean);
        const [pool, attempts, generatedExams] = await Promise.all([
          questionRepo.listByUnits(subject, selectedUnits),
          attemptRepo.listResults(),
          examRepo.listGenerated(),
        ]);
        if (cancelled) return;
        if (pool.length === 0) {
          const unitStr = selectedUnits.join(", ");
          fail(`선택한 단원(${unitStr})의 문제가 아직 없습니다.\n문제 업로드 후 다시 시도해 주세요.`);
          return;
        }
        const reservedProblemIds = new Set<string>();
        for (const generatedExam of generatedExams) {
          if ((generatedExam.tags ?? []).includes("weakness")) continue;
          if (!isSubjectOrRealMock(generatedExam.tags ?? [])) continue;
          for (const id of generatedExam.sourceQuestionIds ?? []) reservedProblemIds.add(id);
          for (const problem of generatedExam.problems ?? []) reservedProblemIds.add(problem.id);
        }
        const unitOnlyPool = pool.filter((q) => !reservedProblemIds.has(q.id));
        if (unitOnlyPool.length === 0) {
          const unitStr = selectedUnits.join(", ");
          fail(`선택한 단원(${unitStr})에서 과목별/실전 모의고사에 쓰이지 않은 문제가 없습니다.\n문제 업로드 후 다시 시도해 주세요.`);
          return;
        }
        const seenProblemIds = new Set<string>();
        for (const result of attempts) {
          for (const item of result.items) seenProblemIds.add(item.problemId);
        }
        const localSeed = Math.floor(Date.now() % 0x7fffffff);
        // 안 본 문제 우선 배치 → 한 사이클이 끝나면(전부 본 상태) 본 문제들을 다시 노출.
        // 각 그룹 안에서는 난이도 오름차순(쉬움→어려움), 같은 난이도 안에서는 시드 셔플.
        const unseen = unitOnlyPool.filter((q) => !seenProblemIds.has(q.id));
        const seen = unitOnlyPool.filter((q) => seenProblemIds.has(q.id));
        const ordered = [
          ...sortByDifficultyAsc(unseen, localSeed),
          ...sortByDifficultyAsc(seen, localSeed + 1000)
        ];
        filtered = ordered.slice(0, count);
        const unitStr = selectedUnits.join(", ");
        const cycleNote = unseen.length === 0 ? " (한 사이클 완료, 재출제)" : "";
        title = `${subject} 단원별 학습${cycleNote}`;
        description = `${unitStr} · ${filtered.length}문항 · 모고 미사용 문제 우선 · 안 본 문제 ${unseen.length}개`;
        examId = `unit-test-${localSeed}`;
        tags = [subject, ...selectedUnits].filter(Boolean);
      }

      const problems = toProblems(filtered);
      if (cancelled) return;
      setExam({
        id: examId,
        title,
        description,
        mode: mode === "daily" ? "daily" : "custom",
        timeLimitSec:
          mode === "real" ? 60 * 60
          : mode === "subject_mock" ? 50 * 60
          : filtered.length * 3 * 60,
        tags,
        problems,
      });
      } catch {
        fail("시험을 불러오는 중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authChecked, user, mode, subject, unitsParam, count, dateParam, round, seed]);

  if (!authChecked) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-10">
        <section className="rounded-lg border border-line bg-white p-6 text-sm font-bold text-slate-600 shadow-soft">
          로그인 상태를 확인하는 중입니다...
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-10">
        <section className="rounded-lg border border-line bg-white p-8 text-center shadow-soft">
          <div className="mb-4 text-4xl">🔒</div>
          <h1 className="text-xl font-black text-ink">로그인이 필요합니다</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            시험을 계속 보려면 상단에서 로그인해 주세요.
          </p>
          <Link
            href="/student/exams"
            className="mt-6 inline-flex rounded-md bg-brand-600 px-4 py-3 text-sm font-black text-white hover:bg-brand-700"
          >
            시험 목록으로
          </Link>
        </section>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-10">
        <section className="rounded-lg border border-line bg-white p-8 text-center shadow-soft">
          <div className="mb-4 text-4xl">🚧</div>
          <h1 className="text-xl font-black text-ink">문제가 없습니다</h1>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{errorMsg}</p>
          <Link
            href="/student/exams"
            className="mt-6 inline-flex rounded-md bg-brand-600 px-4 py-3 text-sm font-black text-white hover:bg-brand-700"
          >
            시험 목록으로
          </Link>
        </section>
      </main>
    );
  }

  if (exam === undefined) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-10">
        <section className="rounded-lg border border-line bg-white p-6 text-sm font-bold text-slate-600 shadow-soft">
          문제를 불러오는 중입니다...
        </section>
      </main>
    );
  }

  if (!exam) return null;
  return <ExamRunner exam={exam} retryHref={retryHref} />;
}
