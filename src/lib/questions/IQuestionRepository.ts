import type { QuestionDraft, QuestionFilters, QuestionRecord } from "@/types/question";

export interface IQuestionRepository {
  list(): Promise<QuestionRecord[]>;
  listByUnits(subject: string, units: string[]): Promise<QuestionRecord[]>;
  listBySubject(subject: string): Promise<QuestionRecord[]>;
  listByTag(tag: string): Promise<QuestionRecord[]>;
  listByPool(pool: string): Promise<QuestionRecord[]>;
  countAll(): Promise<number>;
  countByTag(tag: string): Promise<number>;
  create(draft: QuestionDraft): Promise<QuestionRecord>;
  update(id: string, draft: QuestionDraft): Promise<void>;
  appendMany(drafts: QuestionDraft[]): Promise<QuestionRecord[]>;
  deleteQuestion(id: string): Promise<void>;
  filter(questions: QuestionRecord[], filters: QuestionFilters): QuestionRecord[];
  getFilterOptions(questions: QuestionRecord[]): { subjects: string[]; units: string[] };
  reset(): Promise<QuestionRecord[]>;
}
