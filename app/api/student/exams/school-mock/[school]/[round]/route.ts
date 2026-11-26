import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";
import { requireUser } from "@/lib/auth/requireUser";
import { gradeExam } from "@/lib/exam/grading";
import { isSchoolMockCode, schoolMockExamId, type SchoolMockCode } from "@/lib/exams/schoolMock";
import type { AnswerMap, MockExam } from "@/types/exam";

type RoundParams = { params: Promise<{ school: string; round: string }> };

const NO_CACHE = { "Cache-Control": "private, no-store" };
const ATTEMPT_ID_PATTERN = /^att-[0-9]{13}-[a-z0-9]{1,16}$/;
const NOT_FOUND = "요청한 회차가 없습니다.";
const OPEN_FAILED = "모의고사를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.";
const SUBMIT_FAILED = "답안을 제출하지 못했습니다. 잠시 후 다시 시도해 주세요.";

function json(value: object, status = 200) {
  return NextResponse.json(value, { status, headers: NO_CACHE });
}

async function readExamAddress(params: RoundParams["params"]) {
  const { school, round } = await params;
  if (!isSchoolMockCode(school) || !/^[1-9]\d{0,2}$/.test(round)) return null;
  return { school, round: Number(round) };
}

async function loadExam(supabase: SupabaseClient, school: SchoolMockCode, round: number) {
  const { data, error } = await supabase
    .from("school_mock_problem_sheets")
    .select("exam")
    .eq("school_code", school)
    .eq("round", round)
    .maybeSingle();

  if (error) return { response: json({ message: OPEN_FAILED }, 503) };
  const exam = data?.exam as MockExam | null | undefined;
  if (!exam) return { response: json({ message: NOT_FOUND }, 404) };
  if (exam.id !== schoolMockExamId(school, round) || !Array.isArray(exam.problems) || exam.problems.length === 0) {
    return { response: json({ message: OPEN_FAILED }, 503) };
  }

  const validDuration = Number.isSafeInteger(exam.timeLimitSec) && exam.timeLimitSec > 0;
  const isKonkuk = school === "konkuk";
  if ((!validDuration && !isKonkuk) || (isKonkuk && exam.problems.length !== 40)) {
    return { response: json({ message: OPEN_FAILED }, 503) };
  }
  if (exam.problems.some((problem) => !problem || !Array.isArray(problem.options)
    || (problem.points !== undefined && (!Number.isFinite(problem.points) || problem.points <= 0)))) {
    return { response: json({ message: OPEN_FAILED }, 503) };
  }

  const normalized: MockExam = {
    ...exam,
    timeLimitSec: validDuration ? exam.timeLimitSec : 3600,
    problems: isKonkuk ? exam.problems.map((problem, index) => ({
      ...problem,
      points: problem.points ?? (index < 20 ? 2 : 3),
    })) : exam.problems,
  };
  return { exam: normalized };
}

function studentExam(exam: MockExam): MockExam {
  return {
    id: exam.id,
    title: exam.title,
    description: exam.description,
    mode: exam.mode,
    timeLimitSec: exam.timeLimitSec,
    tags: exam.tags,
    problems: exam.problems.map((problem) => ({
      id: problem.id,
      sourceNumber: problem.sourceNumber,
      subject: problem.subject,
      unit: problem.unit,
      concept: problem.concept,
      difficulty: problem.difficulty,
      question: problem.question,
      contentType: problem.contentType,
      questionImage: problem.questionImage,
      questionType: problem.questionType,
      points: problem.points,
      options: problem.options.map((option) => ({
        id: option.id,
        label: option.label,
        text: option.text,
        contentType: option.contentType,
        image: option.image,
      })),
      correctOptionId: "",
      explanation: "",
    })),
  };
}

async function findAttempt(supabase: SupabaseClient, userId: string, examId: string, attemptId: string) {
  return supabase
    .from("exam_attempts")
    .select("result")
    .eq("user_id", userId)
    .eq("exam_id", examId)
    .eq("attempt_id", attemptId)
    .maybeSingle();
}

export async function GET(request: Request, { params }: RoundParams) {
  const address = await readExamAddress(params);
  if (!address) return json({ message: NOT_FOUND }, 404);
  const { school, round } = address;

  const attemptId = new URL(request.url).searchParams.get("attemptId");
  const auth = attemptId === null ? await requireTier(request, "pro") : await requireUser(request);
  if (!auth.ok) {
    auth.response.headers.set("Cache-Control", NO_CACHE["Cache-Control"]);
    return auth.response;
  }

  if (attemptId !== null) {
    if (!ATTEMPT_ID_PATTERN.test(attemptId)) return json({ message: "응시 기록을 찾을 수 없습니다." }, 404);
    const { data, error } = await findAttempt(auth.supabase, auth.userId, schoolMockExamId(school, round), attemptId);
    if (error) return json({ message: OPEN_FAILED }, 503);
    if (!data) return json({ message: "응시 기록을 찾을 수 없습니다." }, 404);
  }

  const found = await loadExam(auth.supabase, school, round);
  if (found.response) return found.response;
  return json({ exam: studentExam(found.exam) });
}

function parseSubmission(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const { attemptId, answers, elapsedSec } = body as Record<string, unknown>;
  if (typeof attemptId !== "string" || !ATTEMPT_ID_PATTERN.test(attemptId)) return null;
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) return null;
  if (typeof elapsedSec !== "number" || !Number.isSafeInteger(elapsedSec) || elapsedSec < 0) return null;
  return { attemptId, answers, elapsedSec };
}

function validatedAnswers(exam: MockExam, answers: object): AnswerMap | null {
  const problems = new Map(exam.problems.map((problem) => [problem.id, problem]));
  const entries = Object.entries(answers);
  for (const [problemId, value] of entries) {
    const problem = problems.get(problemId);
    if (typeof value !== "string" || !problem) return null;
    if (problem.questionType === "subjective") {
      if (value.length > 1000) return null;
    } else if (!problem.options.some((option) => option.id === value)) {
      return null;
    }
  }
  return Object.fromEntries(entries);
}

export async function POST(request: Request, { params }: RoundParams) {
  const address = await readExamAddress(params);
  if (!address) return json({ message: NOT_FOUND }, 404);
  const { school, round } = address;
  const auth = await requireTier(request, "pro");
  if (!auth.ok) {
    auth.response.headers.set("Cache-Control", NO_CACHE["Cache-Control"]);
    return auth.response;
  }

  const submission = parseSubmission(await request.json().catch(() => null));
  if (!submission) return json({ message: "답안 형식이 올바르지 않습니다." }, 400);
  const { attemptId, elapsedSec } = submission;
  const { data: existing, error: readError } = await findAttempt(auth.supabase, auth.userId, schoolMockExamId(school, round), attemptId);
  if (readError) return json({ message: SUBMIT_FAILED }, 503);
  if (existing) return json({ result: existing.result });

  const found = await loadExam(auth.supabase, school, round);
  if (found.response) return found.response;
  const { exam } = found;
  const answers = validatedAnswers(exam, submission.answers);
  if (!answers) return json({ message: "답안에 올바르지 않은 문항 또는 선택지가 있습니다." }, 400);

  const result = gradeExam({
    exam,
    answers,
    attemptId,
    elapsedSec: Math.min(elapsedSec, exam.timeLimitSec),
    retryHref: "/student/exams/" + exam.id,
  });
  delete result.examSnapshot;

  const { error } = await auth.supabase.from("exam_attempts").insert({
    attempt_id: attemptId,
    user_id: auth.userId,
    exam_id: exam.id,
    result,
  });
  if (error?.code === "23505") {
    const { data: stored, error: retryError } = await findAttempt(auth.supabase, auth.userId, exam.id, attemptId);
    if (retryError) return json({ message: SUBMIT_FAILED }, 503);
    if (stored) return json({ result: stored.result });
    return json({ message: SUBMIT_FAILED }, 409);
  }
  if (error) return json({ message: SUBMIT_FAILED }, 503);
  return json({ result });
}
