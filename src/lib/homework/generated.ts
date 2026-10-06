import type { SupabaseClient } from "@supabase/supabase-js";
import { COACHING_QUESTION_SELECT, questionRowsToRecords } from "@/lib/admin/coaching";
import { isPublishableQuestion } from "@/lib/questions/standalone";
import type { HomeworkReference } from "@/types/homework";
import type { QuestionRecord } from "@/types/question";

export class GeneratedHomeworkError extends Error {
  constructor(public status: number,message: string) { super(message); }
}

export function validateGeneratedQuestionIds(value: unknown): string[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 60 || value.some(id => typeof id !== "string" || !id.trim() || id.trim().length > 200)) throw new Error("문제를 1~60개 선택해 주세요.");
  const ids = value.map(id => String(id).trim());
  if (new Set(ids).size !== ids.length) throw new Error("같은 문제가 중복되어 있습니다. 문제지를 다시 확인해 주세요.");
  return ids;
}
export function validateGeneratedQuestionPages(value: unknown, count: number, maxPages: number): number[][] {
  if (!Array.isArray(value) || value.length !== count) throw new Error("문항별 PDF 페이지 정보를 확인해 주세요.");
  return value.map(pages => {
    if (!Array.isArray(pages) || pages.length < 1 || pages.length > maxPages || pages.some(page => !Number.isInteger(page) || page < 1 || page > maxPages)) throw new Error("문항별 PDF 페이지 정보를 확인해 주세요.");
    return [...new Set(pages as number[])].sort((a,b) => a-b);
  });
}
export async function loadGeneratedHomeworkQuestions(supabase: SupabaseClient, ids: string[], versions: unknown): Promise<QuestionRecord[]> {
  if (!Array.isArray(versions) || versions.length !== ids.length || versions.some(v => typeof v !== "string" || (v !== "" && !Number.isFinite(Date.parse(v))))) throw new GeneratedHomeworkError(400,"문제의 수정 정보를 확인할 수 없습니다. 문제지를 다시 생성해 주세요.");
  const { data,error } = await supabase.from("questions").select(COACHING_QUESTION_SELECT).in("id",ids);
  if (error) throw new GeneratedHomeworkError(500,"문제를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
  const records = questionRowsToRecords((data ?? []) as unknown as Record<string,unknown>[]);
  const byId = new Map(records.map(question => [question.id,question]));
  return ids.map((id,index) => {
    const question = byId.get(id);
    if (!question || question.qualityStatus !== "approved" || !isPublishableQuestion(question)) throw new GeneratedHomeworkError(409,"선택한 문제 중 변경되었거나 사용할 수 없는 문제가 있습니다. 문제지를 다시 생성해 주세요.");
    const actualVersion = question.updatedAt ?? "";
    const expectedVersion = versions[index];
    if ((actualVersion === "" || expectedVersion === "") ? actualVersion !== expectedVersion : Date.parse(actualVersion) !== Date.parse(expectedVersion)) throw new GeneratedHomeworkError(409,"문제지를 만든 뒤 문제가 수정되었습니다. 최신 내용으로 다시 생성해 주세요.");
    return question;
  });
}
export function buildGeneratedHomeworkReference(questions: QuestionRecord[], questionPages: number[][]): HomeworkReference[] {
  return questions.map((question,index) => {
    const optionText = question.options.map(option => `${option.label}. ${option.text}`).join("\n");
    const correct = question.options.find(option => option.id === question.correctOptionId || option.label === question.correctOptionId);
    const answer = question.questionType === "subjective" ? question.answerText ?? "" : correct ? `${correct.label}. ${correct.text}` : question.answerText ?? "";
    const hasImage = Boolean(question.questionImage || question.explanationImage || question.options.some(option => option.image));
    return { questionNumber:String(index+1),problem:[question.question,optionText].filter(Boolean).join("\n").slice(0,24000),answer:answer.slice(0,12000),solution:(question.explanation ?? "").slice(0,24000),sourcePages:questionPages[index],needsReview:true,reviewReason:hasImage ? "문제지와 DB 정답·해설을 확인해 주세요. 이미지에 있는 조건이나 해설은 기준풀이에 직접 보완해 주세요." : "문제지의 번호·내용과 DB 정답·해설이 일치하는지 확인한 후 승인해 주세요." };
  });
}
