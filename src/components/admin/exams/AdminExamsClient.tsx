"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Difficulty } from "@/types/exam";
import type { QuestionRecord } from "@/types/question";
import { generateExamFromQuestionBank } from "@/lib/examGenerator";
import type { AdminExamMode, DifficultyRatio, GeneratedExam } from "@/types/generatedExam";
import { authRepo, isAdminUser } from "@/lib/auth/mockAuth";
import { questionRepo } from "@/lib/questions/questionRepository";
import { examRepo } from "@/lib/exams/generatedExamRepository";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";

const difficultyLabels: Record<Difficulty, string> = {
  easy: "하",
  medium: "중",
  hard: "상"
};

const modeLabels: Record<AdminExamMode, string> = {
  selected: "선택모고",
  random: "랜덤모고",
  adaptive: "맞춤모고",
  daily: "데일리테스트"
};

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, "ko"));
}

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function AdminExamsClient() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [generatedExams, setGeneratedExams] = useState<GeneratedExam[]>([]);

  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<AdminExamMode>("selected");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);
  const [difficultyRatio, setDifficultyRatio] = useState<DifficultyRatio>({
    easy: 30,
    medium: 50,
    hard: 20
  });
  const [problemCount, setProblemCount] = useState(10);
  const [timeLimitMin, setTimeLimitMin] = useState(30);
  const [message, setMessage] = useState("");
  const [lastExam, setLastExam] = useState<GeneratedExam | null>(null);

  useEffect(() => {
    authRepo.getCurrentUser().then((user) => {
      const admin = isAdminUser(user);
      setIsAdmin(admin);
      setAuthChecked(true);
      if (admin) {
        Promise.all([questionRepo.list(), examRepo.listGenerated()]).then(([qs, es]) => {
          setQuestions(qs);
          setGeneratedExams(es);
        });
      }
    });
  }, []);

  const subjectOptions = useMemo(
    () => unique(questions.map((question) => question.subject)),
    [questions]
  );

  const unitOptions = useMemo(() => {
    const scoped = subjects.length
      ? questions.filter((question) => subjects.includes(question.subject))
      : questions;
    return unique(scoped.map((question) => question.unit));
  }, [questions, subjects]);

  const matchedCount = useMemo(() => {
    return questions.filter((question) => {
      const subjectOk = subjects.length === 0 || subjects.includes(question.subject);
      const unitOk = units.length === 0 || units.includes(question.unit);
      return subjectOk && unitOk;
    }).length;
  }, [questions, subjects, units]);

  async function submitAdminLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const admin = authRepo.loginAdmin(password);
    if (!admin) {
      setAuthError("관리자 비밀번호가 올바르지 않습니다.");
      return;
    }
    setIsAdmin(true);
    const [qs, es] = await Promise.all([questionRepo.list(), examRepo.listGenerated()]);
    setQuestions(qs);
    setGeneratedExams(es);
    setPassword("");
    setAuthError("");
  }

  function updateRatio(difficulty: Difficulty, value: number) {
    setDifficultyRatio((current) => ({
      ...current,
      [difficulty]: Math.max(0, value)
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = generateExamFromQuestionBank(questions, {
      title,
      mode,
      subjects,
      units,
      difficultyRatio,
      problemCount,
      timeLimitSec: timeLimitMin * 60
    });

    if (!result.ok) {
      setMessage(result.message);
      setLastExam(null);
      return;
    }

    await examRepo.addGenerated(result.exam);
    setGeneratedExams(await examRepo.listGenerated());
    setLastExam(result.exam);
    setMessage("모의고사를 생성했습니다.");
  }

  if (!authChecked) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-8">
        <section className="rounded-lg border border-line bg-white p-6 text-sm font-bold text-slate-600 shadow-soft">
          관리자 권한을 확인하는 중입니다.
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-8">
        <section className="max-w-xl rounded-lg border border-line bg-white p-6 shadow-soft">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">
            Admin Login
          </p>
          <h1 className="mt-1 text-2xl font-black text-ink">관리자 로그인이 필요합니다</h1>
          <form onSubmit={submitAdminLogin} className="mt-5 flex gap-2">
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-w-0 flex-1 rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ink"
              placeholder="관리자 비밀번호"
              type="password"
            />
            <button
              type="submit"
              className="rounded-md bg-ink px-4 py-2 text-sm font-black text-white hover:bg-slate-700"
            >
              로그인
            </button>
          </form>
          {authError ? <p className="mt-3 text-sm font-bold text-coral-600">{authError}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <section className="mb-5 rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">
          Admin Exam Builder
        </p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-ink">모의고사 생성</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Supabase 문제은행에서 조건에 맞는 문제를 추출해 selected/random/adaptive/daily
              시험을 생성합니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-md border border-line px-4 py-3">
              <div className="text-xs font-bold text-slate-500">문제은행</div>
              <div className="mt-1 text-xl font-black text-ink">{questions.length}</div>
            </div>
            <div className="rounded-md border border-line px-4 py-3">
              <div className="text-xs font-bold text-slate-500">조건 매칭</div>
              <div className="mt-1 text-xl font-black text-brand-700">{matchedCount}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
        <form onSubmit={submit} className="space-y-5 rounded-lg border border-line bg-white p-5 shadow-soft">
          <label className="block">
            <span className="text-xs font-black text-slate-600">시험 제목</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-3 text-sm outline-none focus:border-brand-600"
              placeholder="예: 미분학 약점 보완 20문항"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black text-slate-600">시험 유형</span>
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value as AdminExamMode)}
              className="mt-1 w-full rounded-md border border-line px-3 py-3 text-sm outline-none focus:border-brand-600"
            >
              <option value="selected">selected - 선택모고</option>
              <option value="random">random - 랜덤모고</option>
              <option value="adaptive">adaptive - 맞춤모고</option>
              <option value="daily">daily - 데일리테스트</option>
            </select>
          </label>

          <section>
            <div className="text-xs font-black text-slate-600">과목 다중 선택</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {subjectOptions.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => {
                    const nextSubjects = toggleValue(subjects, subject);
                    setSubjects(nextSubjects);
                    setUnits((current) =>
                      current.filter((unit) =>
                        questions.some(
                          (question) =>
                            question.unit === unit &&
                            (nextSubjects.length === 0 || nextSubjects.includes(question.subject))
                        )
                      )
                    );
                  }}
                  className={`rounded-full px-3 py-2 text-sm font-black ${
                    subjects.includes(subject)
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-brand-50"
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="text-xs font-black text-slate-600">단원 다중 선택</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {unitOptions.map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setUnits((current) => toggleValue(current, unit))}
                  className={`rounded-full px-3 py-2 text-sm font-black ${
                    units.includes(unit)
                      ? "bg-ink text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="text-xs font-black text-slate-600">난이도 비율</div>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {(["easy", "medium", "hard"] as Difficulty[]).map((difficulty) => (
                <label key={difficulty} className="rounded-md border border-line p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-black text-ink">{difficultyLabels[difficulty]}</span>
                    <DifficultyBadge difficulty={difficulty} />
                  </div>
                  <input
                    value={difficultyRatio[difficulty]}
                    onChange={(event) => updateRatio(difficulty, Number(event.target.value))}
                    className="mt-3 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
                    min={0}
                    type="number"
                  />
                </label>
              ))}
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-black text-slate-600">문제 수</span>
              <input
                value={problemCount}
                onChange={(event) => setProblemCount(Number(event.target.value))}
                className="mt-1 w-full rounded-md border border-line px-3 py-3 text-sm outline-none focus:border-brand-600"
                min={1}
                type="number"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black text-slate-600">제한 시간</span>
              <div className="mt-1 flex items-center gap-2">
                <input
                  value={timeLimitMin}
                  onChange={(event) => setTimeLimitMin(Number(event.target.value))}
                  className="min-w-0 flex-1 rounded-md border border-line px-3 py-3 text-sm outline-none focus:border-brand-600"
                  min={1}
                  type="number"
                />
                <span className="text-sm font-black text-slate-600">분</span>
              </div>
            </label>
          </div>

          {message ? (
            <div className="rounded-md bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700">
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-md bg-brand-600 px-4 py-3 text-sm font-black text-white hover:bg-brand-700"
          >
            모의고사 생성
          </button>
        </form>

        <aside className="space-y-5">
          <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <h2 className="text-lg font-black text-ink">최근 생성 결과</h2>
            {lastExam ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-md bg-slate-50 p-4">
                  <div className="text-sm font-black text-ink">{lastExam.title}</div>
                  <div className="mt-1 text-xs font-bold text-slate-500">
                    {modeLabels[lastExam.mode as AdminExamMode]} / {lastExam.problems.length}문항 /{" "}
                    {Math.floor(lastExam.timeLimitSec / 60)}분
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {(["easy", "medium", "hard"] as Difficulty[]).map((difficulty) => (
                    <div key={difficulty} className="rounded-md border border-line p-3">
                      <div className="text-xs font-bold text-slate-500">
                        {difficultyLabels[difficulty]}
                      </div>
                      <div className="mt-1 text-lg font-black text-ink">
                        {lastExam.generationSummary.difficultyCounts[difficulty]}
                      </div>
                    </div>
                  ))}
                </div>
                {lastExam.generationSummary.warnings.length ? (
                  <div className="rounded-md bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-700">
                    {lastExam.generationSummary.warnings.map((warning) => (
                      <div key={warning}>{warning}</div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-600">아직 생성된 시험이 없습니다.</p>
            )}
          </section>

          <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <h2 className="text-lg font-black text-ink">저장된 모의고사</h2>
            <div className="mt-4 space-y-3">
              {generatedExams.map((exam) => (
                <article key={exam.id} className="rounded-md border border-line p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-ink">{exam.title}</h3>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {modeLabels[exam.mode as AdminExamMode]} / {exam.problems.length}문항 /{" "}
                        {Math.floor(exam.timeLimitSec / 60)}분
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">
                      {exam.mode}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {exam.tags.slice(0, 5).map((tag) => (
                      <span key={tag} className="rounded-full bg-brand-50 px-2 py-1 text-xs font-bold text-brand-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
              {generatedExams.length === 0 ? (
                <p className="text-sm leading-6 text-slate-600">저장된 생성 시험이 없습니다.</p>
              ) : null}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
