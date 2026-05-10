export type Difficulty =
  | "easy"
  | "easyMedium"
  | "medium"
  | "mediumHard"
  | "hard"
  | "killer";

export type ExamMode = "selected" | "random" | "adaptive" | "custom" | "daily";

export type ContentType = "latex" | "image" | "mixed";
export type QuestionType = "multiple_choice" | "subjective";

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
  questionType?: QuestionType;
  options: ProblemOption[];
  correctOptionId: string;
  answerText?: string; // 단답형 정답 (LaTeX 가능)
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
  // 단답형용
  questionType?: QuestionType;
  userAnswerText?: string | null;
  answerText?: string;
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
