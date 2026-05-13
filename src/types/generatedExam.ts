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
  // 이미 다른 admin 모의고사에 들어간 문제 ID들. 풀 분리 정책: 가능한 한 이 문제들은
  // 피하고 신선한 문제로 채운다. 부족하면 재사용 fallback (warning 첨부).
  excludeIds?: Set<string>;
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
