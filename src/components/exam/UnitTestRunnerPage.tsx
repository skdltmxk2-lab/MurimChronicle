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
import { allowedSubjectsForMonth, monthFromDateString } from "@/lib/daily/schedule";

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
const UNIT_OVERLAP_DIFFICULTIES = new Set<Difficulty>(["easyMedium", "medium", "mediumHard"]);

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

function orderForUnitPractice(
  candidates: QuestionRecord[],
  seenProblemIds: Set<string>,
  seed: number
) {
  const unseen = candidates.filter((q) => !seenProblemIds.has(q.id));
  const seen = candidates.filter((q) => seenProblemIds.has(q.id));
  return [
    ...sortByDifficultyAsc(unseen, seed),
    ...sortByDifficultyAsc(seen, seed + 1000)
  ];
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

        // 2) 관리자 지정이 없으면 날짜 기반 결정적 로테이션으로 출제.
        //    주의: daily_usage(use_count)는 학생 응시 시 증가하지 않아(관리자 페이지에서만 갱신)
        //    이에 의존해 정렬하면 매일 같은 문제(use_count 0 → id 최소)만 나온다.
        //    → 풀 전체를 날짜로 순환시켜, 모두에게 동일하되 매일 다른 5문항을 출제한다.
        if (!pickedIds || pickedIds.length === 0) {
          // 데일리 정책: 하(easy)/중하(easyMedium)만 출제 (중 이상 금지).
          //   풀에 중급 이상이 섞여 있어도 자동 출제에서는 제외한다.
          //   (관리자가 명시적으로 지정한 assignment 경로는 위에서 통과하므로 영향 없음.)
          const DAILY_DIFFICULTIES = new Set(["easy", "easyMedium"]);
          const easyPool = dailyPool.filter((q) => DAILY_DIFFICULTIES.has(q.difficulty));
          // 월별 학습 범위로 데일리 풀 좁히기 (아직 안 배운 과목 제외).
          const allowedSubjects = new Set<string>(allowedSubjectsForMonth(monthFromDateString(dateParam)));
          const scopedPool = easyPool.filter((q) => allowedSubjects.has(q.subject));
          // 범위 내 문제가 0개면 난이도 조건 → 전체 데일리 순으로 폴백 (서비스 중단 방지).
          const rotationPool = scopedPool.length > 0 ? scopedPool : easyPool.length > 0 ? easyPool : dailyPool;
          const ordered = [...rotationPool].sort((a, b) => a.id.localeCompare(b.id));
          const pickCount = Math.min(5, ordered.length);
          // 풀을 pickCount 크기 블록으로 나눠 하루에 한 블록씩 순환 출제.
          // 연속한 날은 겹치지 않는 다음 블록을 받으므로 풀을 모두 소진하기 전엔 중복이 없다.
          const dayIndex = Math.floor(new Date(`${dateParam}T00:00:00`).getTime() / 86400000);
          const blockCount = Math.max(1, Math.ceil(ordered.length / pickCount));
          const block = ((dayIndex % blockCount) + blockCount) % blockCount;
          const start = block * pickCount;
          const window = ordered.slice(start, start + pickCount);
          if (window.length < pickCount) {
            window.push(...ordered.slice(0, pickCount - window.length));
          }
          pickedIds = window.map((q) => q.id);
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
        const seenProblemIds = new Set<string>();
        for (const result of attempts) {
          for (const item of result.items) seenProblemIds.add(item.problemId);
        }
        const localSeed = Math.floor(Date.now() % 0x7fffffff);
        const unitOnlyPool = pool.filter((q) => !reservedProblemIds.has(q.id));
        const overlapPool = pool.filter(
          (q) => reservedProblemIds.has(q.id) && UNIT_OVERLAP_DIFFICULTIES.has(q.difficulty)
        );
        const overlapTarget = Math.round(count * 0.2);
        const overlapCount = Math.min(overlapTarget, overlapPool.length);
        const unitOnlyCount = count - overlapCount;
        const orderedUnitOnly = orderForUnitPractice(unitOnlyPool, seenProblemIds, localSeed);
        const pickedUnitOnly = orderedUnitOnly.slice(0, unitOnlyCount);
        const orderedOverlap = orderForUnitPractice(
          overlapPool.filter((q) => !pickedUnitOnly.some((picked) => picked.id === q.id)),
          seenProblemIds,
          localSeed + 2000
        );
        const pickedOverlap = orderedOverlap.slice(0, overlapCount);
        filtered = seededShuffle([...pickedUnitOnly, ...pickedOverlap], localSeed + 3000);
        if (filtered.length === 0) {
          const unitStr = selectedUnits.join(", ");
          fail(`선택한 단원(${unitStr})의 출제 가능한 문제가 없습니다.\n문제 업로드 후 다시 시도해 주세요.`);
          return;
        }
        const unitStr = selectedUnits.join(", ");
        const unseen = [...pickedUnitOnly, ...pickedOverlap].filter((q) => !seenProblemIds.has(q.id));
        const cycleNote = unseen.length === 0 ? " (한 사이클 완료, 재출제)" : "";
        title = `${subject} 단원별 학습${cycleNote}`;
        description = `${unitStr} · ${filtered.length}문항 · 모고 중복 ${pickedOverlap.length}/${filtered.length}문항 · 중복 난이도 중하~중상`;
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
