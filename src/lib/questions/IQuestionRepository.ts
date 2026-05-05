import type { QuestionDraft, QuestionFilters, QuestionRecord } from "@/types/question";

export interface IQuestionRepository {
  list(): Promise<QuestionRecord[]>;
  create(draft: QuestionDraft): Promise<QuestionRecord>;
  update(id: string, draft: QuestionDraft): Promise<void>;
  appendMany(drafts: QuestionDraft[]): Promise<QuestionRecord[]>;
  filter(questions: QuestionRecord[], filters: QuestionFilters): QuestionRecord[];
  getFilterOptions(questions: QuestionRecord[]): { subjects: string[]; units: string[] };
  reset(): Promise<QuestionRecord[]>;
}
