import type { AnswerMap, AttemptResult, MockExam } from "@/types/exam";

export function gradeExam(params: {
  exam: MockExam;
  answers: AnswerMap;
  attemptId: string;
  elapsedSec: number;
  retryHref?: string;
}): AttemptResult {
  const { exam, answers, attemptId, elapsedSec, retryHref } = params;
  const items = exam.problems.map((problem) => {
    const selectedOptionId = answers[problem.id] ?? null;
    return {
      problemId: problem.id,
      selectedOptionId,
      correctOptionId: problem.correctOptionId,
      isCorrect: selectedOptionId === problem.correctOptionId
    };
  });
  const correct = items.filter((item) => item.isCorrect).length;
  const total = exam.problems.length;

  return {
    attemptId,
    examId: exam.id,
    examTitle: exam.title,
    examSnapshot: exam,
    retryHref,
    submittedAt: new Date().toISOString(),
    elapsedSec,
    answers,
    score: {
      correct,
      total,
      percent: total === 0 ? 0 : Math.round((correct / total) * 100)
    },
    items
  };
}

export function formatDuration(totalSec: number) {
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
