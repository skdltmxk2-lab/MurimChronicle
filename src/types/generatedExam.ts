import type { Difficulty, ExamMode, MockExam } from "@/types/exam";

export type AdminExamMode = Extract<ExamMode, "selected" | "random" | "adaptive" | "daily">;

export type DifficultyRatio = Record<Difficulty, number>;

export type ExamGenerationConfig = {
  title: string;
  mode: AdminExamMode;
  subjects: string[];
  units: string[];
  difficultyRatio: DifficultyRatio;
  problemCount: number;
  timeLimitSec: number;
};

export type GeneratedExam = MockExam & {
  createdAt: string;
  sourceQuestionIds: string[];
  generationSummary: {
    requestedCount: number;
    matchedCount: number;
    selectedCount: number;
    difficultyCounts: DifficultyRatio;
    warnings: string[];
  };
};

export type ExamGenerationResult =
  | { ok: true; exam: GeneratedExam }
  | { ok: false; message: string };
