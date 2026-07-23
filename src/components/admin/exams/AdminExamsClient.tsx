"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Difficulty, Problem } from "@/types/exam";
import type { QuestionRecord } from "@/types/question";
import { generateExamFromQuestionBank } from "@/lib/examGenerator";
import type { AdminExamMode, DifficultyRatio, GeneratedExam } from "@/types/generatedExam";
import { authRepo, isAdminUser } from "@/lib/auth/mockAuth";
import { questionRepo } from "@/lib/questions/questionRepository";
import { isPublishableQuestion } from "@/lib/questions/standalone";
import { examRepo } from "@/lib/exams/generatedExamRepository";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import {
  DIFFICULTY_KEYS,
  DIFFICULTY_LABELS,
  SUBJECT_NAMES,
  unitsForSubject
} from "@/lib/taxonomy";

type ExamCategory = "subject" | "real";
type RealExamType = "past_exam" | "self_mock";

const modeLabels: Record<AdminExamMode, string> = {
  selected: "선택모고",
  random: "랜덤모고",
  adaptive: "맞춤모고",
  daily: "데일리테스트"
};

// 한글 학교명 후보 (questions.tags 안에 있는 것 기준).
// 새 학교 추가 시 이 리스트에 추가하거나, 옵션을 questions에서 동적으로 추출하도록 바꿀 수 있음.
const PAST_EXAM_SCHOOLS = [
  "가천대","건국대","경기대","경희대","광운대","국민대","단국대","동국대",
  "명지대","서강대","서울과기대","서울시립대","성균관대","세종대","숙명여대","숭실대",
  "아주대","인하대","중앙대","한성대","한양대","항공대","홍익대"
];
const PAST_EXAM_YEARS = ["2025","2024","2023","2022","2021","2020","2019","2018"];

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, "ko"));
}

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function questionToProblem(question: QuestionRecord): Problem {
  return {
    id: question.id,
    subject: question.subject,
    unit: question.unit,
    concept: question.concept,
    difficulty: question.difficulty,
    question: question.question,
    contentType: question.contentType,
    questionImage: question.questionImage,
    options: question.options,
    correctOptionId: question.correctOptionId,
    explanation: question.explanation,
    explanationContentType: question.explanationContentType,
    explanationImage: question.explanationImage,
    questionType: question.questionType,
    answerText: question.answerText
  };
}

function isSubjectMockExam(exam: GeneratedExam) {
  return (exam.tags ?? []).includes("과목별모의고사");
}

function roundFromSubjectMockTitle(title: string, subject: string) {
  const escapedSubject = subject.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = title.match(new RegExp(`^${escapedSubject}\\s*(?:과목별\\s*)?모의고사\\s*(\\d+)회$`));
  return match ? Number(match[1]) : null;
}

export function AdminExamsClient() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [generatedExams, setGeneratedExams] = useState<GeneratedExam[]>([]);

  const [title, setTitle] = useState("");
  const [examCategory, setExamCategory] = useState<ExamCategory>("subject");
  const [realExamType, setRealExamType] = useState<RealExamType>("past_exam");
  const [pastSchool, setPastSchool] = useState<string>("");
  const [pastYear, setPastYear] = useState<string>("");
  const [mode, setMode] = useState<AdminExamMode>("selected");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);
  const [difficultyRatio, setDifficultyRatio] = useState<DifficultyRatio>({
    easy: 15,
    easyMedium: 20,
    medium: 25,
    mediumHard: 20,
    hard: 15,
    killer: 5
  });
  const [problemCount, setProblemCount] = useState(10);
  const [timeLimitMin, setTimeLimitMin] = useState(30);
  const [message, setMessage] = useState("");
  const [lastExam, setLastExam] = useState<GeneratedExam | null>(null);
  const [customTitle, setCustomTitle] = useState(false);
  const [editingExam, setEditingExam] = useState<GeneratedExam | null>(null);
  const [editingMessage, setEditingMessage] = useState("");

  useEffect(() => {
    authRepo.getCurrentUser().then((user) => {
      const admin = isAdminUser(user);
      setIsAdmin(admin);
      setAuthChecked(true);
      if (admin) {
        Promise.all([questionRepo.list(), examRepo.listGenerated()]).then(([qs, es]) => {
          setQuestions(qs.filter(isPublishableQuestion));
          setGeneratedExams(es);
        });
      }
    });
  }, []);

  const subjectOptions = useMemo(() => SUBJECT_NAMES, []);

  const subjectMockSubject = examCategory === "subject" && subjects.length === 1 ? subjects[0] : "";

  const nextSubjectMockTitle = useMemo(() => {
    if (!subjectMockSubject) return "";
    const rounds = generatedExams
      .filter((exam) => isSubjectMockExam(exam) && (exam.tags ?? []).includes(subjectMockSubject))
      .map((exam) => roundFromSubjectMockTitle(exam.title, subjectMockSubject))
      .filter((round): round is number => Number.isFinite(round) && round !== null);
    const nextRound = rounds.length > 0 ? Math.max(...rounds) + 1 : 1;
    return `${subjectMockSubject} 모의고사 ${nextRound}회`;
  }, [generatedExams, subjectMockSubject]);

  useEffect(() => {
    if (examCategory !== "subject" || customTitle) return;
    setTitle(nextSubjectMockTitle);
  }, [customTitle, examCategory, nextSubjectMockTitle]);

  const unitOptions = useMemo(() => {
    if (subjects.length === 0) return [];
    return unique(subjects.flatMap((subject) => Array.from(unitsForSubject(subject))));
  }, [subjects]);

  // 실전 모의고사 (기출유형) 필터: id가 q-{year}-{school}-* 패턴이고
  // 학교/년도가 선택되어 있으면 그것까지 매칭.
  const isPastExamId = (id: string) => /^q-\d{4}-[a-z-]+?-/.test(id);
  function matchesPastExam(question: QuestionRecord) {
    if (!isPastExamId(question.id)) return false;
    if (pastSchool && !(question.tags ?? []).includes(pastSchool)) return false;
    if (pastYear && !(question.tags ?? []).includes(pastYear)) return false;
    return true;
  }

  const matchedCount = useMemo(() => {
    return questions.filter((question) => {
      if (examCategory === "real") {
        if (realExamType === "past_exam") return matchesPastExam(question);
        if (realExamType === "self_mock") return (question.pool ?? "general") === "self_mock";
      }
      // 과목별: pool='general'에서만 + 과목/단원 필터
      if ((question.pool ?? "general") !== "general") return false;
      const subjectOk = subjects.length === 0 || subjects.includes(question.subject);
      const unitOk = units.length === 0 || units.includes(question.unit);
      return subjectOk && unitOk;
    }).length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, subjects, units, examCategory, realExamType, pastSchool, pastYear]);

  function updateRatio(difficulty: Difficulty, value: number) {
    setDifficultyRatio((current) => ({
      ...current,
      [difficulty]: Math.max(0, value)
    }));
  }

  function changeExamCategory(category: ExamCategory) {
    setExamCategory(category);
    setTitle("");
    setCustomTitle(false);
    setSubjects([]);
    setUnits([]);
    setMessage("");
    setLastExam(null);
  }

  function pickSubject(subject: string) {
    if (examCategory === "subject") {
      setSubjects([subject]);
      setUnits([]);
      setCustomTitle(false);
      return;
    }

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
  }

  function enableCustomTitle() {
    setCustomTitle(true);
    if (!title && nextSubjectMockTitle) setTitle(nextSubjectMockTitle);
  }

  function resetAutoTitle() {
    setCustomTitle(false);
    setTitle(nextSubjectMockTitle);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // 카테고리에 따라 사용할 문제 풀과 mode 결정
    const isReal = examCategory === "real";
    const isSubjectMock = examCategory === "subject";
    if (isSubjectMock && subjects.length !== 1) {
      setMessage("과목별 모의고사는 과목을 하나만 선택해주세요.");
      setLastExam(null);
      return;
    }

    let pool: typeof questions;
    if (isReal && realExamType === "past_exam") {
      pool = questions.filter(matchesPastExam);
    } else if (isReal && realExamType === "self_mock") {
      pool = questions.filter((q) => (q.pool ?? "general") === "self_mock");
    } else {
      // 과목별: 일반 풀만 사용 (데일리/자체 제외)
      pool = questions.filter((q) => (q.pool ?? "general") === "general");
    }
    const effectiveMode: AdminExamMode = isReal ? "random" : mode;
    // 실전은 학교/년도/풀이 곧 필터이므로 subjects/units는 비워서 전달.
    const effectiveSubjects = isReal ? [] : subjects;
    const effectiveUnits = isReal ? [] : units;

    // 풀 분리: 기존 admin 모의고사(weakness 제외)에 이미 들어간 문제는 가능한 한 피한다.
    // generatedExams는 ResultViewer/StudentExamLoader에서 학생들이 응시한 시험이라
    // 같은 문제가 또 나오면 학습 효과가 떨어지기 때문.
    const excludeIds = new Set<string>();
    for (const exam of generatedExams) {
      if ((exam.tags ?? []).includes("weakness")) continue; // 학생 본인의 취약유형 시험은 제외
      for (const id of exam.sourceQuestionIds ?? []) excludeIds.add(id);
    }

    const finalTitle = isSubjectMock && !customTitle ? nextSubjectMockTitle : title;
    const result = generateExamFromQuestionBank(pool, {
      title: finalTitle,
      mode: effectiveMode,
      subjects: effectiveSubjects,
      units: effectiveUnits,
      difficultyRatio,
      problemCount,
      timeLimitSec: timeLimitMin * 60,
      excludeIds
    });

    if (!result.ok) {
      setMessage(result.message);
      setLastExam(null);
      return;
    }

    // 학생 측에서 sub-type별 등급 게이트를 걸기 위해 카테고리 마커 태그를 부여.
    let categoryTag: string | null = null;
    if (isReal && realExamType === "past_exam") categoryTag = "기출유형";
    else if (isReal && realExamType === "self_mock") categoryTag = "자체모고";
    else categoryTag = "과목별모의고사";
    if (categoryTag && !result.exam.tags.includes(categoryTag)) {
      result.exam.tags = [categoryTag, ...result.exam.tags];
    }

    await examRepo.addGenerated(result.exam);
    setGeneratedExams(await examRepo.listGenerated());
    setLastExam(result.exam);
    setMessage("모의고사를 생성했습니다.");
  }

  async function refreshGeneratedExams() {
    const rows = await examRepo.listGenerated();
    setGeneratedExams(rows);
    return rows;
  }

  async function saveEditedExam(nextExam: GeneratedExam, successMessage: string) {
    try {
      await examRepo.updateGenerated(nextExam);
      const rows = await refreshGeneratedExams();
      setEditingExam(rows.find((exam) => exam.id === nextExam.id) ?? nextExam);
      setLastExam((current) => (current?.id === nextExam.id ? nextExam : current));
      setEditingMessage(successMessage);
    } catch (error) {
      setEditingMessage(error instanceof Error ? error.message : "모의고사 저장에 실패했습니다.");
    }
  }

  async function deleteGeneratedExam(exam: GeneratedExam) {
    if (!window.confirm(`"${exam.title}" 모의고사를 삭제할까요?`)) return;
    try {
      await examRepo.deleteGenerated(exam.id);
      await refreshGeneratedExams();
      setEditingExam(null);
      setLastExam((current) => (current?.id === exam.id ? null : current));
      setMessage("모의고사를 삭제했습니다.");
    } catch (error) {
      const failMessage = error instanceof Error ? error.message : "모의고사 삭제에 실패했습니다.";
      setMessage(failMessage);
      setEditingMessage(failMessage);
    }
  }

  async function replaceProblemInExam(exam: GeneratedExam, problem: Problem) {
    const usedIds = new Set(exam.problems.map((item) => item.id));
    const pools = [
      questions.filter(
        (q) =>
          q.id !== problem.id &&
          !usedIds.has(q.id) &&
          (q.pool ?? "general") === "general" &&
          q.subject === problem.subject &&
          q.unit === problem.unit &&
          q.difficulty === problem.difficulty
      ),
      questions.filter(
        (q) =>
          q.id !== problem.id &&
          !usedIds.has(q.id) &&
          (q.pool ?? "general") === "general" &&
          q.subject === problem.subject &&
          q.unit === problem.unit
      ),
      questions.filter(
        (q) =>
          q.id !== problem.id &&
          !usedIds.has(q.id) &&
          (q.pool ?? "general") === "general" &&
          q.subject === problem.subject
      )
    ];
    const candidates = pools.find((pool) => pool.length > 0) ?? [];
    if (candidates.length === 0) {
      setEditingMessage("교체 가능한 문항이 없습니다.");
      return;
    }

    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    const nextProblems = exam.problems.map((item) =>
      item.id === problem.id ? questionToProblem(picked) : item
    );
    const difficultyCounts = { ...exam.generationSummary.difficultyCounts };
    for (const difficulty of DIFFICULTY_KEYS) {
      difficultyCounts[difficulty] = nextProblems.filter((item) => item.difficulty === difficulty).length;
    }
    const nextExam: GeneratedExam = {
      ...exam,
      problems: nextProblems,
      sourceQuestionIds: nextProblems.map((item) => item.id),
      generationSummary: {
        ...exam.generationSummary,
        selectedCount: nextProblems.length,
        difficultyCounts
      }
    };

    await saveEditedExam(nextExam, `${problem.id} 문항을 ${picked.id} 문항으로 교체했습니다.`);
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
        <section className="max-w-xl rounded-lg border border-line bg-white p-8 text-center shadow-soft">
          <div className="mb-4 text-5xl">🔒</div>
          <h1 className="text-2xl font-black text-ink">관리자만 접근할 수 있습니다</h1>
          <Link
            href="/student/exams"
            className="mt-6 inline-block rounded-md bg-brand-600 px-6 py-3 text-sm font-black text-white hover:bg-brand-700"
          >
            시험 목록으로
          </Link>
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
              Supabase 문제은행에서 조건에 맞는 문제를 추출해 과목별/실전 CBT
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
          {/* 1단계: 큰 카테고리 */}
          <section>
            <div className="text-xs font-black text-slate-600">모의고사 종류</div>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => changeExamCategory("subject")}
                className={`rounded-md border px-4 py-3 text-left ${
                  examCategory === "subject"
                    ? "border-brand-600 bg-brand-50 ring-2 ring-brand-600/10"
                    : "border-line bg-white hover:border-brand-500"
                }`}
              >
                <div className="text-sm font-black text-ink">⏱️ 과목별 모의고사</div>
                <div className="mt-1 text-xs text-slate-500">과목·난이도 중심으로 구성</div>
              </button>
              <button
                type="button"
                onClick={() => changeExamCategory("real")}
                className={`rounded-md border px-4 py-3 text-left ${
                  examCategory === "real"
                    ? "border-brand-600 bg-brand-50 ring-2 ring-brand-600/10"
                    : "border-line bg-white hover:border-brand-500"
                }`}
              >
                <div className="text-sm font-black text-ink">🎯 실전 모의고사</div>
                <div className="mt-1 text-xs text-slate-500">기출 또는 실전형 풀로 구성</div>
              </button>
            </div>
          </section>

          {examCategory !== "real" ? (
            <>
              <section>
                <div className="text-xs font-black text-slate-600">과목 선택</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {subjectOptions.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => pickSubject(subject)}
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

              <label className="block">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-black text-slate-600">시험 제목</span>
                  {examCategory === "subject" && subjectMockSubject ? (
                    customTitle ? (
                      <button
                        type="button"
                        onClick={resetAutoTitle}
                        className="text-xs font-black text-brand-700 hover:underline"
                      >
                        회차 제목으로 되돌리기
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={enableCustomTitle}
                        className="text-xs font-black text-brand-700 hover:underline"
                      >
                        이름 바꾸기
                      </button>
                    )
                  ) : null}
                </div>
                <input
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    if (examCategory === "subject") setCustomTitle(true);
                  }}
                  readOnly={examCategory === "subject" && !!subjectMockSubject && !customTitle}
                  className="mt-1 w-full rounded-md border border-line px-3 py-3 text-sm outline-none focus:border-brand-600 read-only:bg-slate-50 read-only:font-black"
                  placeholder={
                    subjectMockSubject
                        ? nextSubjectMockTitle
                        : "과목을 선택하면 다음 회차 제목이 자동으로 들어갑니다"
                  }
                />
                {examCategory === "subject" && subjectMockSubject && !customTitle ? (
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    저장된 과목별 모의고사 중 제목이 &quot;{subjectMockSubject} 모의고사 N회&quot;인 시험만 회차로 계산합니다.
                  </p>
                ) : null}
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
                <div className="text-xs font-black text-slate-600">단원 다중 선택 (선택)</div>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  과목별 모의고사는 단원을 비워두면 선택 과목 전체에서 출제합니다.
                </p>
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
            </>
          ) : (
            <>
              {/* 2단계: 실전 하위 유형 */}
              <section>
                <div className="text-xs font-black text-slate-600">실전 모의고사 종류</div>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setRealExamType("past_exam")}
                    className={`rounded-md border px-3 py-2 text-left ${
                      realExamType === "past_exam"
                        ? "border-brand-600 bg-brand-50 ring-2 ring-brand-600/10"
                        : "border-line bg-white hover:border-brand-500"
                    }`}
                  >
                    <div className="text-sm font-black text-ink">기출유형 모의고사</div>
                    <div className="mt-0.5 text-xs text-slate-500">학교·년도별 기출 문제</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRealExamType("self_mock")}
                    className={`rounded-md border px-3 py-2 text-left ${
                      realExamType === "self_mock"
                        ? "border-brand-600 bg-brand-50 ring-2 ring-brand-600/10"
                        : "border-line bg-white hover:border-brand-500"
                    }`}
                  >
                    <div className="text-sm font-black text-ink">자체 모의고사</div>
                    <div className="mt-0.5 text-xs text-slate-500">자체 풀에서 랜덤 출제</div>
                  </button>
                  <button
                    type="button"
                    disabled
                    className="cursor-not-allowed rounded-md border border-dashed border-line bg-slate-50 px-3 py-2 text-left opacity-60"
                  >
                    <div className="text-sm font-black text-slate-400">유형 3</div>
                    <div className="mt-0.5 text-xs text-slate-400">준비 중</div>
                  </button>
                  <button
                    type="button"
                    disabled
                    className="cursor-not-allowed rounded-md border border-dashed border-line bg-slate-50 px-3 py-2 text-left opacity-60"
                  >
                    <div className="text-sm font-black text-slate-400">유형 4</div>
                    <div className="mt-0.5 text-xs text-slate-400">준비 중</div>
                  </button>
                </div>
              </section>

              {realExamType === "past_exam" ? (
                <section className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-black text-slate-600">학교 (선택)</span>
                    <select
                      value={pastSchool}
                      onChange={(e) => setPastSchool(e.target.value)}
                      className="mt-1 w-full rounded-md border border-line px-3 py-3 text-sm outline-none focus:border-brand-600"
                    >
                      <option value="">전체 학교</option>
                      {PAST_EXAM_SCHOOLS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-black text-slate-600">년도 (선택)</span>
                    <select
                      value={pastYear}
                      onChange={(e) => setPastYear(e.target.value)}
                      className="mt-1 w-full rounded-md border border-line px-3 py-3 text-sm outline-none focus:border-brand-600"
                    >
                      <option value="">전체 년도</option>
                      {PAST_EXAM_YEARS.map((y) => (
                        <option key={y} value={y}>{y}년</option>
                      ))}
                    </select>
                  </label>
                </section>
              ) : null}

              <label className="block">
                <span className="text-xs font-black text-slate-600">시험 제목</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="mt-1 w-full rounded-md border border-line px-3 py-3 text-sm outline-none focus:border-brand-600"
                  placeholder="예: 2025년 가천대 기출 모의고사"
                />
              </label>
            </>
          )}

          <section>
            <div className="text-xs font-black text-slate-600">난이도 비율</div>
            <div className="mt-2 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
              {DIFFICULTY_KEYS.map((difficulty) => (
                <label key={difficulty} className="rounded-md border border-line p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-black text-ink">{DIFFICULTY_LABELS[difficulty]}</span>
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
                <div className="grid grid-cols-3 gap-2 text-center lg:grid-cols-6">
                  {DIFFICULTY_KEYS.map((difficulty) => (
                    <div key={difficulty} className="rounded-md border border-line p-3">
                      <div className="text-xs font-bold text-slate-500">
                        {DIFFICULTY_LABELS[difficulty]}
                      </div>
                      <div className="mt-1 text-lg font-black text-ink">
                        {lastExam.generationSummary.difficultyCounts[difficulty] ?? 0}
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
              {/*
                학생 본인이 생성한 취약유형 모의고사(weakness 태그)는 admin이 만든
                것이 아니므로 이 목록에서 제외한다. 학생 측 GeneratedExamCards와 동일 정책.
              */}
              {generatedExams
                .filter((exam) => !(exam.tags ?? []).includes("weakness"))
                .map((exam) => (
                <article key={exam.id} className="rounded-md border border-line p-4">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingExam(exam);
                        setEditingMessage("");
                      }}
                      className="min-w-0 flex-1 text-left"
                    >
                      <h3 className="text-sm font-black text-ink">{exam.title}</h3>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {modeLabels[exam.mode as AdminExamMode]} / {exam.problems.length}문항 /{" "}
                        {Math.floor(exam.timeLimitSec / 60)}분
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteGeneratedExam(exam)}
                      className="rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-slate-600 hover:bg-coral-50 hover:text-coral-600"
                    >
                      삭제
                    </button>
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
              {generatedExams.filter((exam) => !(exam.tags ?? []).includes("weakness")).length === 0 ? (
                <p className="text-sm leading-6 text-slate-600">저장된 생성 시험이 없습니다.</p>
              ) : null}
            </div>
          </section>
        </aside>
      </div>

      {editingExam ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-4 pb-6 sm:items-center sm:pb-0"
          onClick={() => setEditingExam(null)}
        >
          <section
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-5 shadow-soft"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">
                  Exam Editor
                </p>
                <h2 className="mt-1 text-xl font-black text-ink">{editingExam.title}</h2>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  {editingExam.problems.length}문항 / {Math.floor(editingExam.timeLimitSec / 60)}분
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => deleteGeneratedExam(editingExam)}
                  className="rounded-md bg-coral-50 px-4 py-2 text-xs font-black text-coral-600 hover:brightness-95"
                >
                  모고 삭제
                </button>
                <button
                  type="button"
                  onClick={() => setEditingExam(null)}
                  className="rounded-md border border-line px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-50"
                >
                  닫기
                </button>
              </div>
            </div>

            {editingMessage ? (
              <div className="mt-4 rounded-md bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700">
                {editingMessage}
              </div>
            ) : null}

            <div className="mt-4 space-y-2">
              {editingExam.problems.map((problem, index) => (
                <article key={problem.id} className="rounded-md border border-line p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">
                          {index + 1}번
                        </span>
                        <DifficultyBadge difficulty={problem.difficulty} />
                        <span className="text-xs font-bold text-slate-500">
                          {problem.subject} / {problem.unit}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm font-bold leading-6 text-ink">
                        {problem.question || problem.concept || problem.id}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{problem.id}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => replaceProblemInExam(editingExam, problem)}
                      className="shrink-0 rounded-md bg-brand-600 px-4 py-2 text-xs font-black text-white hover:bg-brand-700"
                    >
                      문항 교체
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
