import type { SupabaseClient } from "@supabase/supabase-js";
import { mockExams } from "@/data/mockData";
import type { Problem } from "@/types/exam";
import type { QuestionDraft, QuestionRecord } from "@/types/question";
import { assertStandaloneQuestion } from "@/lib/questions/standalone";

type DbRow = Record<string, unknown>;

function nowIso() {
  return new Date().toISOString();
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, "ko"));
}

function normalizeOptions(options: QuestionDraft["options"]) {
  return options.map((option, index) => ({
    id: String(index + 1),
    label: String(index + 1),
    text: option.text.trim(),
    contentType: option.contentType ?? (option.image ? "image" : "latex"),
    image: option.image,
  }));
}

function draftToRow(draft: QuestionDraft) {
  const isSubj = draft.questionType === "subjective";
  return {
    subject: draft.subject,
    unit: draft.unit,
    concept: draft.concept,
    difficulty: draft.difficulty,
    source_type: draft.sourceType,
    pool: draft.pool ?? "general",
    question: draft.question,
    content_type: draft.contentType ?? null,
    question_image: draft.questionImage ?? null,
    question_type: draft.questionType ?? "multiple_choice",
    options: isSubj ? [] : normalizeOptions(draft.options),
    correct_option_id: isSubj ? "" : draft.correctOptionId,
    answer_text: isSubj ? (draft.answerText?.trim() ?? "") : null,
    explanation: draft.explanation,
    explanation_content_type: draft.explanationContentType ?? null,
    explanation_image: draft.explanationImage ?? null,
    tags: unique(draft.tags.map((tag) => tag.trim())),
  };
}

function problemToRecord(problem: Problem, examTitle: string): QuestionRecord {
  const createdAt = nowIso();
  return {
    id: problem.id,
    subject: problem.subject,
    unit: problem.unit,
    concept: problem.concept,
    difficulty: problem.difficulty,
    sourceType: "mock",
    pool: "general",
    question: problem.question,
    contentType: problem.contentType ?? "latex",
    questionImage: problem.questionImage,
    options: problem.options,
    correctOptionId: problem.correctOptionId,
    explanation: problem.explanation,
    explanationContentType: problem.explanationContentType ?? "latex",
    explanationImage: problem.explanationImage,
    questionType: problem.questionType,
    answerText: problem.answerText,
    tags: unique([problem.unit, problem.concept, examTitle]),
    createdAt,
    updatedAt: createdAt,
  };
}

function getSeedQuestions(): QuestionRecord[] {
  return mockExams.flatMap((exam) =>
    exam.problems.map((problem) => problemToRecord(problem, exam.title))
  );
}

function toDb(record: QuestionRecord) {
  const isSubj = record.questionType === "subjective";
  return {
    id: record.id,
    subject: record.subject,
    unit: record.unit,
    concept: record.concept,
    difficulty: record.difficulty,
    source_type: record.sourceType,
    pool: record.pool ?? "general",
    question: record.question,
    content_type: record.contentType ?? null,
    question_image: record.questionImage ?? null,
    question_type: record.questionType ?? "multiple_choice",
    options: isSubj ? [] : record.options,
    correct_option_id: isSubj ? "" : record.correctOptionId,
    answer_text: isSubj ? (record.answerText ?? "") : null,
    explanation: record.explanation,
    explanation_content_type: record.explanationContentType ?? null,
    explanation_image: record.explanationImage ?? null,
    tags: record.tags,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}

export function fromQuestionDb(row: DbRow): QuestionRecord {
  const tags = (row.tags ?? []) as string[];
  const dbType = row.question_type as QuestionRecord["questionType"] | null | undefined;
  const questionType: QuestionRecord["questionType"] =
    dbType ?? (tags.includes("subjective") ? "subjective" : "multiple_choice");
  const options = (row.options ?? []) as QuestionRecord["options"];
  const dbAnswer = (row.answer_text ?? null) as string | null;
  const answerText =
    dbAnswer ??
    (questionType === "subjective" && options.length > 0 ? options[0]?.text : undefined);

  return {
    id: row.id as string,
    subject: row.subject as string,
    unit: row.unit as string,
    concept: row.concept as string,
    difficulty: row.difficulty as QuestionRecord["difficulty"],
    sourceType: row.source_type as QuestionRecord["sourceType"],
    pool: ((row.pool as QuestionRecord["pool"] | null) ?? "general"),
    question: row.question as string,
    contentType: (row.content_type ?? undefined) as QuestionRecord["contentType"],
    questionImage: (row.question_image ?? undefined) as string | undefined,
    questionType,
    options,
    correctOptionId: row.correct_option_id as string,
    answerText: answerText ?? undefined,
    explanation: row.explanation as string,
    explanationContentType: (row.explanation_content_type ?? undefined) as QuestionRecord["explanationContentType"],
    explanationImage: (row.explanation_image ?? undefined) as string | undefined,
    tags,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function createQuestion(supabase: SupabaseClient, draft: QuestionDraft) {
  assertStandaloneQuestion(draft);
  const createdAt = nowIso();
  const isSubj = draft.questionType === "subjective";
  const record: QuestionRecord = {
    ...draft,
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    questionType: draft.questionType ?? "multiple_choice",
    options: isSubj ? [] : normalizeOptions(draft.options),
    correctOptionId: isSubj ? "" : draft.correctOptionId,
    answerText: isSubj ? (draft.answerText?.trim() ?? "") : undefined,
    tags: unique(draft.tags.map((tag) => tag.trim())),
    createdAt,
    updatedAt: createdAt,
  };
  const { error } = await supabase.from("questions").insert(toDb(record));
  if (error) throw error;
  return record;
}

export async function updateQuestion(supabase: SupabaseClient, id: string, draft: QuestionDraft) {
  assertStandaloneQuestion(draft);
  const { error } = await supabase
    .from("questions")
    .update({ ...draftToRow(draft), updated_at: nowIso() })
    .eq("id", id);
  if (error) throw error;
}

export async function appendQuestions(supabase: SupabaseClient, drafts: QuestionDraft[]) {
  drafts.forEach((draft, index) => {
    try {
      assertStandaloneQuestion(draft);
    } catch (error) {
      const message = error instanceof Error ? error.message : "단독 출제 가능 여부를 확인해 주세요.";
      throw new Error(`가져오기 ${index + 1}번 문제: ${message}`);
    }
  });
  const createdAt = nowIso();
  const records = drafts.map((draft, index): QuestionRecord => {
    const isSubj = draft.questionType === "subjective";
    return {
      ...draft,
      id: `q-import-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
      questionType: draft.questionType ?? "multiple_choice",
      options: isSubj ? [] : normalizeOptions(draft.options),
      correctOptionId: isSubj ? "" : draft.correctOptionId,
      answerText: isSubj ? (draft.answerText?.trim() ?? "") : undefined,
      tags: unique(draft.tags.map((tag) => tag.trim())),
      createdAt,
      updatedAt: createdAt,
    };
  });
  const { error } = await supabase.from("questions").insert(records.map(toDb));
  if (error) throw error;
  return records;
}

export async function deleteQuestion(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) throw error;
}

export async function resetQuestions(supabase: SupabaseClient) {
  await supabase.from("questions").delete().not("id", "is", null);
  const seeds = getSeedQuestions();
  const { error } = await supabase.from("questions").insert(seeds.map(toDb));
  if (error) throw error;
  return seeds;
}
