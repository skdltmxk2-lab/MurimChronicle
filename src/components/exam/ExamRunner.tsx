"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnswerMap, MockExam } from "@/types/exam";
import { gradeExam, formatDuration } from "@/lib/exam/grading";
import { attemptRepo, createAttemptId } from "@/lib/exam/storage";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { ScratchPad } from "@/components/exam/ScratchPad";
import { StudentExamPrintSheet } from "@/components/exam/StudentExamPrintSheet";
import { printStudentPdf } from "@/lib/print/studentPrint";

type QuestionFilter = "all" | "unanswered" | "answered";

function hasStoredAnswer(answers: AnswerMap, problemId: string) {
  const value = answers[problemId];
  return typeof value === "string" && value.trim().length > 0;
}

export function ExamRunner({ exam, retryHref }: { exam: MockExam; retryHref?: string }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [elapsedSec, setElapsedSec] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [inkMode, setInkMode] = useState(false);
  const [questionFilter, setQuestionFilter] = useState<QuestionFilter>("all");
  const answersRef = useRef<AnswerMap>({});
  const elapsedRef = useRef(0);
  const startedAtRef = useRef<number>(Date.now());
  const submittedRef = useRef(false);

  const answeredCount = useMemo(
    () => exam.problems.filter((problem) => hasStoredAnswer(answers, problem.id)).length,
    [answers, exam.problems]
  );
  const remainingSec = Math.max(exam.timeLimitSec - elapsedSec, 0);
  const visibleProblemEntries = useMemo(
    () =>
      exam.problems
        .map((problem, index) => ({ problem, index }))
        .filter(({ problem }) => {
          const answered = hasStoredAnswer(answers, problem.id);
          if (questionFilter === "answered") return answered;
          if (questionFilter === "unanswered") return !answered;
          return true;
        }),
    [answers, exam.problems, questionFilter]
  );

  const submitExam = useCallback(
    async (force = false) => {
      if (submittedRef.current) return;
      if (!force) {
        const unanswered = exam.problems
          .map((problem, index) => ({ problem, number: index + 1 }))
          .filter(({ problem }) => !hasStoredAnswer(answersRef.current, problem.id));
        if (unanswered.length > 0) {
          const preview = unanswered.slice(0, 12).map(({ number }) => number).join(", ");
          const suffix = unanswered.length > 12 ? "..." : "";
          const ok = window.confirm(
            `미응답 ${unanswered.length}문항이 있습니다.\n${preview}${suffix}\n그래도 제출하고 채점할까요?`
          );
          if (!ok) return;
        } else if (!window.confirm("시험을 제출하고 채점할까요?")) {
          return;
        }
      }

      submittedRef.current = true;
      const attemptId = createAttemptId(exam.id);
      const result = gradeExam({
        exam,
        answers: answersRef.current,
        attemptId,
        elapsedSec: Math.min(elapsedRef.current, exam.timeLimitSec),
        retryHref
      });

      await attemptRepo.saveResult(result);
      await attemptRepo.clearAnswers(exam.id);
      // 취약유형 모의고사는 별도 리포트 페이지로 진입
      if (exam.id.startsWith("weakness-")) {
        router.push(`/student/exams/weakness/report/${attemptId}`);
      } else {
        router.push(`/student/results/${attemptId}`);
      }
    },
    [exam, retryHref, router]
  );

  useEffect(() => {
    (async () => {
      let startedAt = await attemptRepo.getStartedAt(exam.id);
      let savedAnswers = await attemptRepo.loadAnswers(exam.id);
      let savedElapsed = Math.floor((Date.now() - startedAt) / 1000);

      // 옛 startedAt이 localStorage에 남아 시간 제한을 이미 초과한 경우(이전 미완 응시),
      // 진입 즉시 자동 제출되는 사고를 방지하기 위해 세션을 리셋한다.
      // clearAnswers는 answers + startedAt 둘 다 지우므로 새 진입으로 간주됨.
      if (savedElapsed >= exam.timeLimitSec) {
        await attemptRepo.clearAnswers(exam.id);
        startedAt = await attemptRepo.getStartedAt(exam.id);
        savedAnswers = {};
        savedElapsed = 0;
      }

      startedAtRef.current = startedAt;
      answersRef.current = savedAnswers;
      elapsedRef.current = savedElapsed;
      setAnswers(savedAnswers);
      setElapsedSec(savedElapsed);
      setLoaded(true);
    })();
  }, [exam.id, exam.timeLimitSec]);

  useEffect(() => {
    try {
      setInkMode(window.localStorage.getItem(`cbt:ink-mode:${exam.id}`) === "1");
    } catch {
      setInkMode(false);
    }
  }, [exam.id]);

  useEffect(() => {
    if (!loaded) return;
    answersRef.current = answers;
    void attemptRepo.saveAnswers(exam.id, answers);
  }, [answers, exam.id, loaded]);

  useEffect(() => {
    // loaded 전에는 startedAtRef.current가 초기값(Date.now())이라 timer가 돌면
    // 잠시 후 async fetch로 startedAt이 덮어쓰일 때 elapsed가 갑자기 점프해
    // 자동 제출이 발화될 수 있다. 반드시 loaded 이후에만 timer를 시작한다.
    if (!loaded) return;
    const timer = window.setInterval(() => {
      const nextElapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      elapsedRef.current = nextElapsed;
      setElapsedSec(nextElapsed);
      if (nextElapsed >= exam.timeLimitSec) {
        window.clearInterval(timer);
        void submitExam(true);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [exam.timeLimitSec, loaded, submitExam]);

  function pickAnswer(problemId: string, optionId: string) {
    setAnswers((current) => ({
      ...current,
      [problemId]: optionId
    }));
  }

  function setSubjectiveAnswer(problemId: string, value: string) {
    setAnswers((current) => {
      if (!value) {
        const next = { ...current };
        delete next[problemId];
        return next;
      }
      return { ...current, [problemId]: value };
    });
  }

  function toggleInkMode() {
    setInkMode((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(`cbt:ink-mode:${exam.id}`, next ? "1" : "0");
      } catch {
        // Ignore storage failures on restricted browsers.
      }
      return next;
    });
  }

  async function exitWithoutSubmit() {
    const keepDraft = window.confirm(
      "임시 저장 후 나갈까요?\n확인: 지금까지 고른 답안을 유지합니다.\n취소: 답안 삭제 여부를 다시 선택합니다."
    );
    if (keepDraft) {
      submittedRef.current = true;
      router.push("/student/exams");
      return;
    }

    const clearDraft = window.confirm(
      "임시 답안을 삭제하고 나갈까요?\n취소하면 시험 화면에 그대로 남습니다."
    );
    if (!clearDraft) return;

    submittedRef.current = true;
    try {
      await attemptRepo.clearAnswers(exam.id);
    } catch {
      // 무시.
    }
    router.push("/student/exams");
  }

  return (
    <>
    <main className="student-screen-only student-print-root mx-auto max-w-6xl px-4 pt-5 pb-28 sm:px-5 lg:pb-6">
      <section className="student-print-card mb-4 rounded-lg border border-line bg-white px-5 py-4 shadow-soft">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">시험 진행</p>
            <h1 className="mt-1 text-2xl font-black leading-tight text-ink">{exam.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{exam.description}</p>
          </div>
          <div className="student-print-hide flex flex-wrap gap-2 text-xs font-black text-slate-500">
            <span className="rounded-md bg-slate-50 px-2.5 py-1 ring-1 ring-line">자동 저장</span>
            <span className="rounded-md bg-slate-50 px-2.5 py-1 ring-1 ring-line">{exam.problems.length}문항</span>
          </div>
        </div>
      </section>

      <section className="student-print-hide sticky top-0 z-30 -mx-4 mb-5 border-y border-line bg-white/95 px-4 py-3 shadow-soft backdrop-blur sm:-mx-5 sm:px-5 lg:mx-0 lg:rounded-lg lg:border">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="grid grid-cols-2 gap-2 md:w-[220px]">
              <div className="rounded-md bg-slate-50 px-3 py-2 ring-1 ring-line">
                <div className="text-[11px] font-bold text-slate-500">남은 시간</div>
                <div className="mt-0.5 text-base font-black text-brand-700">{formatDuration(remainingSec)}</div>
              </div>
              <div className="rounded-md bg-slate-50 px-3 py-2 ring-1 ring-line">
                <div className="text-[11px] font-bold text-slate-500">진행</div>
                <div className="mt-0.5 text-base font-black text-ink">
                  {answeredCount}/{exam.problems.length}
                </div>
              </div>
            </div>
            <div className="inline-flex w-full rounded-md bg-slate-50 p-1 ring-1 ring-line md:w-auto">
              {([
                ["all", "전체", exam.problems.length],
                ["unanswered", "미응답", exam.problems.length - answeredCount],
                ["answered", "응답", answeredCount],
              ] as const).map(([value, label, count]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setQuestionFilter(value)}
                  className={`h-9 flex-1 whitespace-nowrap rounded px-3 text-xs font-black transition md:flex-none ${
                    questionFilter === value
                      ? "bg-white text-brand-700 shadow-sm"
                      : "text-slate-600 hover:text-ink"
                  }`}
                >
                  {label} {count}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:flex sm:justify-end">
            <button
              type="button"
              onClick={() => printStudentPdf()}
              className="h-10 whitespace-nowrap rounded-md border border-line bg-white px-3 text-xs font-black text-slate-700 transition hover:border-brand-600 hover:text-brand-700 sm:px-4 sm:text-sm"
            >
              PDF
            </button>
            <button
              type="button"
              onClick={toggleInkMode}
              className={`h-10 whitespace-nowrap rounded-md px-3 text-xs font-black transition sm:px-4 sm:text-sm ${
                inkMode
                  ? "bg-brand-600 text-white hover:bg-brand-700"
                  : "border border-line bg-white text-slate-700 hover:border-brand-600 hover:text-brand-700"
              }`}
            >
              필기
            </button>
            <button
              type="button"
              onClick={exitWithoutSubmit}
              className="h-10 whitespace-nowrap rounded-md border border-line bg-white px-3 text-xs font-black text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 sm:px-4 sm:text-sm"
            >
              나가기
            </button>
            <button
              type="button"
              onClick={() => void submitExam(false)}
              className="h-10 whitespace-nowrap rounded-md bg-brand-600 px-3 text-xs font-black text-white transition hover:bg-brand-700 sm:px-5 sm:text-sm"
            >
              제출
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
        <section className="space-y-4">
          {visibleProblemEntries.length === 0 ? (
            <div className="rounded-lg border border-line bg-white p-8 text-center shadow-soft">
              <h2 className="text-lg font-black text-ink">현재 필터에 해당하는 문제가 없습니다</h2>
              <p className="mt-2 text-sm text-slate-600">상단에서 전체 또는 다른 필터를 선택하세요.</p>
            </div>
          ) : null}
          {visibleProblemEntries.map(({ problem, index }) => {
            const selected = answers[problem.id];
            return (
              <article
                key={problem.id}
                id={problem.id}
                className="student-print-card scroll-mt-36 rounded-lg border border-line bg-white shadow-soft"
              >
                <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3.5">
                  <span className="grid size-8 place-items-center rounded-md bg-brand-600 text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <span className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-black text-brand-700">
                    {problem.subject}
                  </span>
                  {/* 단원·개념 태그는 응시 중엔 숨김 (정답 힌트 방지). 결과/해설 화면에선 노출. */}
                  <DifficultyBadge difficulty={problem.difficulty} />
                </div>
                <div className="px-5 py-5 sm:px-6">
                  <ContentRenderer
                    contentType={problem.contentType}
                    text={problem.question}
                    image={problem.questionImage}
                    imageAlt={`${index + 1}번 문제`}
                    className="text-base font-semibold leading-8 text-ink sm:text-[17px]"
                  />
                  {inkMode ? (
                    <ScratchPad
                      storageKey={`cbt:ink:${exam.id}:${problem.id}`}
                      className="mt-5"
                    />
                  ) : null}
                  <div className="mt-5 space-y-2">
                    {(problem.questionType === "subjective"
                      || ((problem.options?.length ?? 0) === 0 && (problem.answerText ?? "").length > 0)) ? (
                      <div className="rounded-md border border-line bg-slate-50 p-3">
                        <label className="block text-xs font-black text-brand-600">
                          단답형 정답 입력
                        </label>
                        <input
                          type="text"
                          inputMode="text"
                          autoComplete="off"
                          spellCheck={false}
                          value={selected ?? ""}
                          onChange={(e) => setSubjectiveAnswer(problem.id, e.target.value)}
                          placeholder="답을 입력하세요"
                          className="mt-2 w-full rounded-md border border-line bg-white px-3 py-2.5 text-base font-semibold text-ink outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10"
                        />
                      </div>
                    ) : (
                      problem.options.map((option) => {
                        const isSelected = selected === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => pickAnswer(problem.id, option.id)}
                            className={`flex w-full items-start gap-3 rounded-md border px-4 py-3.5 text-left transition ${
                              isSelected
                                ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/10"
                                : "border-line bg-white hover:border-brand-300 hover:bg-slate-50"
                            }`}
                          >
                            <span
                              className={`grid size-7 shrink-0 place-items-center rounded-full text-sm font-black ${
                                isSelected ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {option.label}
                            </span>
                            <ContentRenderer
                              contentType={option.contentType}
                              text={option.text}
                              image={option.image}
                              imageAlt={`${index + 1}번 ${option.label}번 보기`}
                              className="min-w-0 pt-0.5 text-[15px] font-semibold leading-7 text-ink"
                            />
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </article>
            );
          })}
          <div className="student-print-hide flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={exitWithoutSubmit}
              className="w-full rounded-md border border-line bg-white px-4 py-4 text-sm font-black text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 sm:w-1/3"
            >
              학습 종료
            </button>
            <button
              type="button"
              onClick={() => void submitExam(false)}
              className="w-full rounded-md bg-brand-600 px-4 py-4 text-sm font-black text-white transition hover:bg-brand-700 sm:flex-1"
            >
              제출하고 채점하기
            </button>
          </div>
        </section>

        <aside className="student-print-hide h-fit rounded-lg border border-line bg-white p-4 shadow-soft lg:sticky lg:top-24">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-sm font-black text-ink">문항 이동</div>
            <div className="text-xs font-bold text-slate-500">{answeredCount}/{exam.problems.length}</div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {exam.problems.map((problem, index) => {
              const answered = hasStoredAnswer(answers, problem.id);
              return (
                <a
                  key={problem.id}
                  href={`#${problem.id}`}
                  className={`grid size-9 place-items-center rounded-md border text-sm font-black transition ${
                    answered
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-line bg-white text-slate-600 hover:border-brand-300 hover:bg-slate-50"
                  }`}
                >
                  {index + 1}
                </a>
              );
            })}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-600 transition-all"
              style={{ width: `${Math.round((answeredCount / exam.problems.length) * 100)}%` }}
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            선택한 답안은 자동 저장됩니다.
          </p>
        </aside>
      </div>

      <nav className="student-print-hide fixed inset-x-3 bottom-3 z-40 rounded-lg border border-line bg-white/95 p-3 shadow-soft backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-black text-ink">문항 이동</div>
          <div className="text-xs font-bold text-slate-500">
            {answeredCount}/{exam.problems.length}
          </div>
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {exam.problems.map((problem, index) => {
            const answered = hasStoredAnswer(answers, problem.id);
            return (
              <a
                key={problem.id}
                href={`#${problem.id}`}
                className={`grid size-9 shrink-0 place-items-center rounded-md border text-sm font-black transition ${
                  answered
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-line bg-white text-slate-600 hover:border-brand-300 hover:bg-slate-50"
                }`}
              >
                {index + 1}
              </a>
            );
          })}
        </div>
      </nav>
    </main>
    <StudentExamPrintSheet exam={exam} />
    </>
  );
}
