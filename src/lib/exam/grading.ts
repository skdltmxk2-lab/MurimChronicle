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
    if (problem.questionType === "subjective") {
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
