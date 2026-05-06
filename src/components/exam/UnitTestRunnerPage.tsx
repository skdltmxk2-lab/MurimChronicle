"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { questionRepo } from "@/lib/questions/questionRepository";
import { attemptRepo } from "@/lib/exam/storage";
import type { MockExam, Problem } from "@/types/exam";
import type { QuestionRecord } from "@/types/question";
import { ExamRunner } from "@/components/exam/ExamRunner";
import { SUBJECT_NAMES } from "@/lib/taxonomy";

const REAL_EXAM_SUBJECTS = SUBJECT_NAMES;
const REAL_EXAM_PER_SUBJECT = 5;

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
  }));
}

export function UnitTestRunnerPage() {
  const searchParams = useSearchParams();
  const [exam, setExam] = useState<MockExam | null | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mode = searchParams.get("mode");
  const subject = searchParams.get("subject") ?? "";
  const unitsParam = searchParams.get("units") ?? "";
  const count = Math.min(20, Math.max(1, Number(searchParams.get("count") ?? "10")));
  const dateParam = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const seed = Number(searchParams.get("seed")) || hashSeed(`${mode ?? "unit"}:${subject}:${unitsParam}:${dateParam}`);
  const retryHref = `/student/exams/unit-test?${searchParams.toString()}`;

  useEffect(() => {
    Promise.all([questionRepo.list(), attemptRepo.listResults()]).then(([allQuestions, attempts]) => {
      const seenProblemIds = new Set<string>();
      for (const result of attempts) {
        for (const item of result.items) seenProblemIds.add(item.problemId);
      }

      let filtered: QuestionRecord[];
      let title: string;
      let description: string;
      let examId: string;
      let tags: string[];

      if (mode === "daily") {
        filtered = allQuestions.filter((q) => q.tags.includes("daily"));
        if (filtered.length === 0) {
          setErrorMsg("오늘의 데일리 테스트 문제가 아직 없습니다.\n관리자에서 데일리 문제를 추가해 주세요.");
          return;
        }
        filtered.sort((a, b) => a.id.localeCompare(b.id));
        const dailyCount = Math.min(5, filtered.length);
        const dayIndex = Math.floor(new Date(`${dateParam}T00:00:00`).getTime() / 86400000);
        const start = (dayIndex * dailyCount) % filtered.length;
        filtered = [...filtered.slice(start), ...filtered.slice(0, start)].slice(0, dailyCount);
        title = `데일리 테스트 · ${dateParam}`;
        description = "오늘의 엄선 문제입니다. 매일 새 문제가 로테이션됩니다.";
        examId = `unit-daily-${dateParam}`;
        tags = ["daily"];
      } else if (mode === "real") {
        const picked: QuestionRecord[] = [];
        for (const [index, subjectName] of REAL_EXAM_SUBJECTS.entries()) {
          const pool = allQuestions.filter((q) => q.subject === subjectName);
          picked.push(...seededShuffle(pool, seed + index + 1).slice(0, REAL_EXAM_PER_SUBJECT));
        }

        const pickedIds = new Set(picked.map((q) => q.id));
        const fallback = seededShuffle(
          allQuestions.filter((q) => !pickedIds.has(q.id)),
          seed + 991
        );
        filtered = [...picked];
        for (const question of fallback) {
          if (filtered.length >= 25) break;
          filtered.push(question);
        }

        if (filtered.length === 0) {
          setErrorMsg("실전 모의고사로 출제할 문제가 아직 없습니다.\n문제 업로드 후 다시 시도해 주세요.");
          return;
        }

        title = "실전 모의고사";
        description = `${filtered.length}문항 · 60분 · 5개 과목 통합`;
        examId = `unit-real-${seed}`;
        tags = ["실전", ...REAL_EXAM_SUBJECTS];
      } else {
        const selectedUnits = unitsParam.split(",").filter(Boolean);
        const pool = allQuestions.filter((q) => selectedUnits.includes(q.unit));
        if (pool.length === 0) {
          const unitStr = selectedUnits.join(", ");
          setErrorMsg(`선택한 단원(${unitStr})의 문제가 아직 없습니다.\n문제 업로드 후 다시 시도해 주세요.`);
          return;
        }
        const localSeed = Math.floor(Date.now() % 0x7fffffff);
        // Push previously-seen problems to the back so unseen ones come first.
        // Once the cycle completes (all seen), shuffled seen ones are surfaced again.
        const unseen = pool.filter((q) => !seenProblemIds.has(q.id));
        const seen = pool.filter((q) => seenProblemIds.has(q.id));
        const ordered = [
          ...seededShuffle(unseen, localSeed),
          ...seededShuffle(seen, localSeed + 1)
        ];
        filtered = ordered.slice(0, count);
        const unitStr = selectedUnits.join(", ");
        const cycleNote = unseen.length === 0 ? " (한 사이클 완료, 재출제)" : "";
        title = `${subject} 단원별 학습${cycleNote}`;
        description = `${unitStr} · ${filtered.length}문항 · 안 본 문제 ${unseen.length}개 우선`;
        examId = `unit-test-${localSeed}`;
        tags = [subject, ...selectedUnits].filter(Boolean);
      }

      const problems = toProblems(filtered);
      setExam({
        id: examId,
        title,
        description,
        mode: mode === "daily" ? "daily" : "custom",
        timeLimitSec: mode === "real" ? 60 * 60 : filtered.length * 3 * 60,
        tags,
        problems,
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
