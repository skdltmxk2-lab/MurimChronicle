import type { MockExam } from "@/types/exam";
import type { GeneratedExam } from "@/types/generatedExam";

export interface IExamRepository {
  listGenerated(): Promise<GeneratedExam[]>;
  findById(id: string): Promise<MockExam | GeneratedExam | null>;
  addGenerated(exam: GeneratedExam): Promise<void>;
}
