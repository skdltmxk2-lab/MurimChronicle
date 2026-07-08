import type { ContentType, Difficulty, ProblemOption, QuestionType } from "@/types/exam";

export type QuestionSourceType = "mock" | "manual" | "imported" | "ai";
export type QuestionPool = "general" | "daily" | "self_mock";

export const POOL_LABELS: Record<QuestionPool, string> = {
  general: "일반",
  daily: "데일리",
  self_mock: "자체 모의고사",
};

export type QuestionRecord = {
  id: string;
  subject: string;
  unit: string;
  concept: string;
  difficulty: Difficulty;
  sourceType: QuestionSourceType;
  pool?: QuestionPool;
  question: string;
  contentType?: ContentType;
  questionImage?: string;
  questionType?: QuestionType;
  options: ProblemOption[];
  correctOptionId: string;
  answerText?: string;
  explanation: string;
  explanationContentType?: ContentType;
  explanationImage?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  coachingUseCount?: number;
  coachingLastUsedAt?: string | null;
};

export type QuestionDraft = {
  subject: string;
  unit: string;
  concept: string;
  difficulty: Difficulty;
  sourceType: QuestionSourceType;
  pool?: QuestionPool;
  question: string;
  contentType?: ContentType;
  questionImage?: string;
  questionType?: QuestionType;
  options: ProblemOption[];
  correctOptionId: string;
  answerText?: string;
  explanation: string;
  explanationContentType?: ContentType;
  explanationImage?: string;
  tags: string[];
};

export type QuestionFilters = {
  subject: string;
  unit: string;
  difficulty: "all" | Difficulty;
  pool: "all" | QuestionPool;
  school: string; // 빈 문자열이면 전체
  year: string;   // 빈 문자열이면 전체
};
