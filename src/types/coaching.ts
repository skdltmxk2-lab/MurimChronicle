import type { QuestionRecord } from "@/types/question";

export type CoachingExtractedProblem = {
  id: string;
  sourceLabel: string;
  problemNumber?: string;
  rawTranscription: string;
  problemText: string;
  options: Array<{ label: string; text: string }>;
  figureDescription: string;
  subject: string;
  unit: string;
  concept: string;
  difficulty: string;
  keywords: string[];
  recognition: {
    complete: boolean;
    confidence: number;
    missingParts: string[];
    notes: string;
  };
};

export type CoachingRelatedGroup = {
  source: CoachingExtractedProblem;
  matches: Array<{
    question: QuestionRecord;
    similarity?: number;
  }>;
  skipped?: boolean;
  reason?: string;
};
