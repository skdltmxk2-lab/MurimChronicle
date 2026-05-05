import type { ContentType, Difficulty, ProblemOption } from "@/types/exam";

export type QuestionSourceType = "mock" | "manual" | "imported" | "ai";

export type QuestionRecord = {
  id: string;
  subject: string;
  unit: string;
  concept: string;
  difficulty: Difficulty;
  sourceType: QuestionSourceType;
  question: string;
  contentType?: ContentType;
  questionImage?: string;
  options: ProblemOption[];
  correctOptionId: string;
  explanation: string;
  explanationContentType?: ContentType;
  explanationImage?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type QuestionDraft = {
  subject: string;
  unit: string;
  concept: string;
  difficulty: Difficulty;
  sourceType: QuestionSourceType;
  question: string;
  contentType?: ContentType;
  questionImage?: string;
  options: ProblemOption[];
  correctOptionId: string;
  explanation: string;
  explanationContentType?: ContentType;
  explanationImage?: string;
  tags: string[];
};

export type QuestionFilters = {
  subject: string;
  unit: string;
  difficulty: "all" | Difficulty;
  sourceType: "all" | QuestionSourceType;
};
