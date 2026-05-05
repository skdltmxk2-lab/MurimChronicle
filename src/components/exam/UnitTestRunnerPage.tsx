"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { questionRepo } from "@/lib/questions/questionRepository";
import type { MockExam, Problem } from "@/types/exam";
import type { QuestionRecord } from "@/types/question";
import { ExamRunner } from "@/components/exam/ExamRunner";

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

  useEffect(() => {
    questionRepo.list().then((allQuestions) => {
      let filtered: QuestionRecord[];
      let title: string;
      let description: string;

      if (mode === "daily") {
        filtered = allQuestions.filter((q) => q.tags.includes("daily"));
        if (filtered.length === 0) {
          setErrorMsg("오늘의 데일리 테스트 문제가 아직 없습니다.\n관리자에서 데일리 문제를 추가해 주세요.");
          return;
        }
        filtered.sort((a, b) => a.id.localeCompare(b.id));
        const dailyCount = Math.min(5, filtered.length);
        const dayIndex = Math.floor(Date.now() / 86400000);
        const start = (dayIndex * dailyCount) % filtered.length;
        filtered = [...filtered.slice(start), ...filtered.slice(0, start)].slice(0, dailyCount);
        title = `데일리 테스트 · ${dateParam}`;
        description = "오늘의 엄선 문제입니다. 매일 새 문제가 로테이션됩니다.";
      } else {
        const selectedUnits = unitsParam.split(",").filter(Boolean);
        filtered = allQuestions.filter((q) => selectedUnits.includes(q.unit));
        if (filtered.length === 0) {
          const unitStr = selectedUnits.join(", ");
          setErrorMsg(`선택한 단원(${unitStr})의 문제가 아직 없습니다.\n문제 업로드 후 다시 시도해 주세요.`);
          return;
        }
        const seed = Math.floor(Date.now() % 0x7fffffff);
        filtered = seededShuffle(filtered, seed).slice(0, count);
        const unitStr = selectedUnits.join(", ");
        title = `${subject} 단원별 테스트`;
        description = `${unitStr} · ${filtered.length}문항`;
      }

      const problems = toProblems(filtered);
      setExam({
        id: `unit-${mode === "daily" ? "daily" : "test"}-${Date.now()}`,
        title,
        description,
        mode: mode === "daily" ? "daily" : "custom",
        timeLimitSec: filtered.length * 3 * 60,
        tags: mode === "daily" ? ["daily"] : [subject],
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
  return <ExamRunner exam={exam} />;
}
