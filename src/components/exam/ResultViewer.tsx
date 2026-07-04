"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDuration } from "@/lib/exam/grading";
import { examRepo } from "@/lib/exams/generatedExamRepository";
import { attemptRepo } from "@/lib/exam/storage";
import type { AttemptResult, MockExam } from "@/types/exam";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { AdSlot } from "@/components/ads/AdSlot";
import { printStudentPdf } from "@/lib/print/studentPrint";

export function ResultViewer({ attemptId }: { attemptId: string }) {
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [exam, setExam] = useState<MockExam | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    attemptRepo.loadResult(attemptId).then((r) => {
      setResult(r);
      setLoaded(true);
    });
  }, [attemptId]);

  useEffect(() => {
    if (!result) return;
    if (result.examSnapshot) {
      setExam(result.examSnapshot);
      return;
    }
    examRepo.findById(result.examId).then((found) => setExam(found as MockExam | null));
  }, [result]);

  if (!loaded) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-10">
        <div className="rounded-lg border border-line bg-white p-8 text-sm font-bold text-slate-600 shadow-soft">
          결과를 불러오는 중입니다.
        </div>
      </main>
    );
  }

  if (!result || !exam) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-10">
        <div className="rounded-lg border border-line bg-white p-8 shadow-soft">
          <h1 className="text-xl font-black text-ink">결과를 찾을 수 없습니다</h1>
          <p className="mt-2 text-sm text-slate-600">
            응시 결과가 없거나 시험 데이터가 변경되었습니다.
          </p>
          <Link
            href="/student/exams"
            className="mt-5 inline-flex rounded-md bg-brand-600 px-4 py-3 text-sm font-black text-white"
          >
            시험 목록으로
          </Link>
        </div>
      </main>
    );
  }

  const reviewMap = new Map(result.items.map((item) => [item.problemId, item]));

  return (
    <main className="student-print-root mx-auto max-w-6xl px-5 py-6">
      <section data-print-section="true" className="student-print-card rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">채점 결과</p>
            <h1 className="mt-1 text-2xl font-black text-ink">{result.examTitle}</h1>
            <p className="mt-2 text-sm text-slate-600">제출 시간: {new Date(result.submittedAt).toLocaleString()}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-md bg-brand-600 px-5 py-4 text-white">
              <div className="text-xs font-bold text-white/80">점수</div>
              <div className="mt-1 text-3xl font-black">{result.score.percent}%</div>
            </div>
            <div className="rounded-md border border-line px-5 py-4">
              <div className="text-xs font-bold text-slate-500">정답</div>
              <div className="mt-1 text-2xl font-black text-ink">
                {result.score.correct}/{result.score.total}
              </div>
            </div>
            <div className="rounded-md border border-line px-5 py-4">
              <div className="text-xs font-bold text-slate-500">소요</div>
              <div className="mt-1 text-2xl font-black text-ink">{formatDuration(result.elapsedSec)}</div>
            </div>
          </div>
        </div>
        <div className="student-print-hide mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => printStudentPdf()}
            className="rounded-md border border-line bg-white px-4 py-2 text-sm font-black text-ink hover:border-brand-600 hover:text-brand-700"
          >
            PDF 저장
          </button>
          {result.retryHref ? (
            <Link
              href={result.retryHref}
              className="rounded-md border border-line bg-white px-4 py-2 text-sm font-black text-ink hover:bg-slate-50"
            >
              다시 풀기
            </Link>
          ) : null}
          <Link
            href="/student/exams"
            className="rounded-md bg-ink px-4 py-2 text-sm font-black text-white hover:bg-slate-700"
          >
            시험 목록
          </Link>
        </div>
      </section>

      {/* 광고 슬롯 (무료 사용자에게만 노출) */}
      <AdSlot slot="result-top" className="student-print-hide mt-5" />

      <section className="mt-5 space-y-4">
        {exam.problems.map((problem, index) => {
          const review = reviewMap.get(problem.id);
          const isSubjective = problem.questionType === "subjective";
          const selected = isSubjective
            ? null
            : problem.options.find((option) => option.id === review?.selectedOptionId);
          const correct = isSubjective
            ? null
            : problem.options.find((option) => option.id === problem.correctOptionId);
          const userText = isSubjective ? (review?.userAnswerText ?? null) : null;
          const correctText = isSubjective ? (problem.answerText ?? "") : null;

          return (
            <article
              key={problem.id}
              data-print-card="true"
              className="student-print-card rounded-lg border border-line bg-white shadow-soft"
            >
              <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-4">
                <span className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-black text-white">
                  {index + 1}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-black ${
                    review?.isCorrect ? "bg-mint-50 text-mint-600" : "bg-coral-50 text-coral-600"
                  }`}
                >
                  {review?.isCorrect ? "정답" : "오답"}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                  {problem.concept}
                </span>
                <DifficultyBadge difficulty={problem.difficulty} />
              </div>
              <div className="px-5 py-5">
                <ContentRenderer
                  contentType={problem.contentType}
                  text={problem.question}
                  image={problem.questionImage}
                  imageAlt={`${index + 1}번 문제`}
                  className="text-base font-semibold leading-8 text-ink"
                />
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div data-print-card="true" className="rounded-md border border-line bg-slate-50 p-4">
                    <div className="text-xs font-black text-slate-500">내 답안</div>
                    <div className="mt-2 text-sm font-bold text-ink">
                      {isSubjective ? (
                        userText ? (
                          <span className="font-mono">{userText}</span>
                        ) : (
                          "미응답"
                        )
                      ) : selected ? (
                        <ContentRenderer
                          contentType={selected.contentType}
                          text={`${selected.label}. ${selected.text}`}
                          image={selected.image}
                          imageAlt={`내 답안 ${selected.label}번`}
                        />
                      ) : (
                        "미응답"
                      )}
                    </div>
                  </div>
                  <div data-print-card="true" className="rounded-md border border-mint-600/20 bg-mint-50 p-4">
                    <div className="text-xs font-black text-mint-600">정답</div>
                    <div className="mt-2 text-sm font-bold text-ink">
                      {isSubjective ? (
                        <ContentRenderer contentType="latex" text={correctText ?? "-"} />
                      ) : correct ? (
                        <ContentRenderer
                          contentType={correct.contentType}
                          text={`${correct.label}. ${correct.text}`}
                          image={correct.image}
                          imageAlt={`정답 ${correct.label}번`}
                        />
                      ) : (
                        "-"
                      )}
                    </div>
                  </div>
                </div>
                <div data-print-card="true" className="mt-4 rounded-md border border-brand-100 bg-brand-50 p-4">
                  <div className="text-xs font-black text-brand-700">해설</div>
                  <ContentRenderer
                    contentType={problem.explanationContentType}
                    text={problem.explanation}
                    image={problem.explanationImage}
                    imageAlt={`${index + 1}번 해설`}
                    className="mt-2 text-sm font-semibold leading-7 text-ink"
                  />
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
