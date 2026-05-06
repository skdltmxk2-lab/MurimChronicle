export type Difficulty = "easy" | "medium" | "hard";

export type ExamMode = "selected" | "random" | "adaptive" | "custom" | "daily";

export type ContentType = "latex" | "image" | "mixed";

export type ProblemOption = {
  id: string;
  label: string;
  text: string;
  contentType?: ContentType;
  image?: string;
};

export type Problem = {
  id: string;
  subject: string;
  unit: string;
  concept: string;
  difficulty: Difficulty;
  question: string;
  contentType?: ContentType;
  questionImage?: string;
  options: ProblemOption[];
  correctOptionId: string;
  explanation: string;
  explanationContentType?: ContentType;
  explanationImage?: string;
};

export type MockExam = {
  id: string;
  title: string;
  description: string;
  mode: ExamMode;
  timeLimitSec: number;
  tags: string[];
  problems: Problem[];
};

export type AnswerMap = Record<string, string>;

export type AttemptReviewItem = {
  problemId: string;
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
};

export type AttemptScore = {
  correct: number;
  total: number;
  percent: number;
};

export type AttemptResult = {
  attemptId: string;
  examId: string;
  examTitle: string;
  examSnapshot?: MockExam;
  retryHref?: string;
  submittedAt: string;
  elapsedSec: number;
  answers: AnswerMap;
  score: AttemptScore;
  items: AttemptReviewItem[];
};
