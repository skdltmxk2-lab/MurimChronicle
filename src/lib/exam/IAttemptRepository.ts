import type { AnswerMap, AttemptResult } from "@/types/exam";

export interface IAttemptRepository {
  loadAnswers(examId: string): Promise<AnswerMap>;
  saveAnswers(examId: string, answers: AnswerMap): Promise<void>;
  clearAnswers(examId: string): Promise<void>;
  getStartedAt(examId: string): Promise<number>;
  saveResult(result: AttemptResult): Promise<void>;
  loadResult(attemptId: string): Promise<AttemptResult | null>;
}
