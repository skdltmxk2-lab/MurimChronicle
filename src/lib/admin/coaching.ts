import type { SupabaseClient } from "@supabase/supabase-js";
import type { QuestionDraft, QuestionRecord } from "@/types/question";
import { assertStandaloneQuestion } from "@/lib/questions/standalone";

type DbRow = Record<string, unknown>;

function nowIso() {
  return new Date().toISOString();
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "ko")
  );
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
  const isSubjective = draft.questionType === "subjective";
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
    options: isSubjective ? [] : normalizeOptions(draft.options),
    correct_option_id: isSubjective ? "" : draft.correctOptionId,
    answer_text: isSubjective ? (draft.answerText?.trim() ?? "") : null,
    explanation: draft.explanation,
    explanation_content_type: draft.explanationContentType ?? null,
    explanation_image: draft.explanationImage ?? null,
    tags: unique(draft.tags),
  };
}

export const COACHING_QUESTION_SELECT = [
  "id",
  "subject",
  "unit",
  "concept",
  "difficulty",
  "source_type",
  "pool",
  "question",
  "content_type",
  "question_image",
  "question_type",
  "options",
  "correct_option_id",
  "answer_text",
  "explanation",
  "explanation_content_type",
  "explanation_image",
  "tags",
  "created_at",
  "updated_at",
].join(", ");

export function questionRowsToRecords(rows: Record<string, unknown>[]): QuestionRecord[] {
  return rows.map(fromQuestionDb);
}

function answerTextFromOption(options: QuestionRecord["options"], correctOptionId: string) {
  return options.find((option) => option.id === correctOptionId || option.label === correctOptionId)?.text;
}

export function fromQuestionDb(row: DbRow): QuestionRecord {
  const tags = (row.tags ?? []) as string[];
  const dbType = row.question_type as QuestionRecord["questionType"] | null | undefined;
  const storedQuestionType: QuestionRecord["questionType"] =
    dbType ?? (tags.includes("subjective") ? "subjective" : "multiple_choice");
  const rawOptions = (row.options ?? []) as QuestionRecord["options"];
  const correctOptionId = (row.correct_option_id as string) ?? "";
  const oversizedOptionBank = storedQuestionType !== "subjective" && rawOptions.length > 5;
  const questionType: QuestionRecord["questionType"] =
    oversizedOptionBank ? "subjective" : storedQuestionType;
  const options = questionType === "subjective" ? [] : rawOptions;
  const dbAnswer = (row.answer_text ?? null) as string | null;
  const answerText =
    dbAnswer ??
    (questionType === "subjective" ? answerTextFromOption(rawOptions, correctOptionId) : undefined);

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
    correctOptionId: questionType === "subjective" ? "" : correctOptionId,
    answerText: answerText ?? undefined,
    explanation: row.explanation as string,
    explanationContentType: (row.explanation_content_type ?? undefined) as QuestionRecord["explanationContentType"],
    explanationImage: (row.explanation_image ?? undefined) as string | undefined,
    tags,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function createCoachingQuestion(
  supabase: SupabaseClient,
  draft: QuestionDraft
): Promise<QuestionRecord> {
  assertStandaloneQuestion(draft);
  const createdAt = nowIso();
  const isSubjective = draft.questionType === "subjective";
  const record: QuestionRecord = {
    ...draft,
    id: `q-coaching-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    questionType: draft.questionType ?? "multiple_choice",
    options: isSubjective ? [] : normalizeOptions(draft.options),
    correctOptionId: isSubjective ? "" : draft.correctOptionId,
    answerText: isSubjective ? (draft.answerText?.trim() ?? "") : undefined,
    tags: unique(draft.tags),
    createdAt,
    updatedAt: createdAt,
  };
  const { error } = await supabase.from("questions").insert({
    id: record.id,
    ...draftToRow(record),
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  });
  if (error) throw error;
  return record;
}

export function questionSearchText(question: QuestionRecord | QuestionDraft): string {
  const options = Array.isArray(question.options)
    ? question.options.map((option) => `${option.label}. ${option.text}`).join("\n")
    : "";
  return [
    question.subject,
    question.unit,
    question.concept,
    question.question,
    options,
    "answerText" in question ? question.answerText : "",
    question.explanation,
    Array.isArray(question.tags) ? question.tags.join(" ") : "",
  ]
    .filter(Boolean)
    .join("\n");
}
