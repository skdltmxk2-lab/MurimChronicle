import type { AnswerMap, AttemptResult, MockExam } from "@/types/exam";
import { answersMatch } from "@/lib/exam/normalize";

export function gradeExam(params: {
  exam: MockExam;
  answers: AnswerMap;
  attemptId: string;
  elapsedSec: number;
  retryHref?: string;
}): AttemptResult {
  const { exam, answers, attemptId, elapsedSec, retryHref } = params;
  const items = exam.problems.map((problem) => {
    const userValue = answers[problem.id] ?? null;
    const isSubjective =
      problem.questionType === "subjective"
      || ((problem.options?.length ?? 0) === 0 && (problem.answerText ?? "").length > 0);
    if (isSubjective) {
      const correctText = problem.answerText ?? "";
      return {
        problemId: problem.id,
        selectedOptionId: null,
        correctOptionId: "",
        isCorrect: !!userValue && answersMatch(userValue, correctText),
        questionType: "subjective" as const,
        userAnswerText: userValue,
        answerText: correctText,
      };
    }
    return {
      problemId: problem.id,
      selectedOptionId: userValue,
      correctOptionId: problem.correctOptionId,
      isCorrect: userValue === problem.correctOptionId,
      questionType: "multiple_choice" as const,
    };
  });
  const correct = items.filter((item) => item.isCorrect).length;
  const total = exam.problems.length;
  const isWeighted = exam.problems.some((problem) => problem.points !== undefined);
  const totalPoints = exam.problems.reduce((sum, problem) => sum + (problem.points ?? 1), 0);
  const earnedPoints = items.reduce((sum, item, index) => (
    item.isCorrect ? sum + (exam.problems[index].points ?? 1) : sum
  ), 0);

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
      percent: totalPoints === 0 ? 0 : Math.round((earnedPoints / totalPoints) * 100),
      ...(isWeighted ? {
        earnedPoints: Number(earnedPoints.toFixed(6)),
        totalPoints: Number(totalPoints.toFixed(6)),
      } : {}),
    },
    items
  };
}

export function formatDuration(totalSec: number) {
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
