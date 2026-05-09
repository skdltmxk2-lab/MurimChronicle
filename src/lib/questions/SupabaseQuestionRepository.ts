"use client";

import { supabase } from "@/lib/supabase/client";
import { mockExams } from "@/data/mockData";
import type { Problem } from "@/types/exam";
import type { QuestionDraft, QuestionFilters, QuestionRecord } from "@/types/question";
import type { IQuestionRepository } from "@/lib/questions/IQuestionRepository";

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
    image: option.image
  }));
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
    tags: unique([problem.unit, problem.concept, examTitle]),
    createdAt,
    updatedAt: createdAt
  };
}

function getSeedQuestions(): QuestionRecord[] {
  return mockExams.flatMap((exam) =>
    exam.problems.map((problem) => problemToRecord(problem, exam.title))
  );
}

type DbRow = Record<string, unknown>;

function fromDb(row: DbRow): QuestionRecord {
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
    options: row.options as QuestionRecord["options"],
    correctOptionId: row.correct_option_id as string,
    explanation: row.explanation as string,
    explanationContentType: (row.explanation_content_type ?? undefined) as QuestionRecord["explanationContentType"],
    explanationImage: (row.explanation_image ?? undefined) as string | undefined,
    tags: (row.tags ?? []) as string[],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string
  };
}

function toDb(record: QuestionRecord) {
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
    options: record.options,
    correct_option_id: record.correctOptionId,
    explanation: record.explanation,
    explanation_content_type: record.explanationContentType ?? null,
    explanation_image: record.explanationImage ?? null,
    tags: record.tags,
    created_at: record.createdAt,
    updated_at: record.updatedAt
  };
}

export const supabaseQuestionRepo: IQuestionRepository = {
  async list(): Promise<QuestionRecord[]> {
    // Supabase 기본 row 한도 1000을 넘는 컬렉션을 위해 페이지 단위로 누적 조회
    const PAGE = 1000;
    const all: DbRow[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, from + PAGE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      all.push(...(data as DbRow[]));
      if (data.length < PAGE) break;
    }
    if (all.length === 0) return this.reset();
    return all.map(fromDb);
  },

  async listByUnits(subject: string, units: string[]): Promise<QuestionRecord[]> {
    if (units.length === 0) return [];
    const PAGE = 1000;
    const all: DbRow[] = [];
    for (let from = 0; ; from += PAGE) {
      let query = supabase
        .from("questions")
        .select("*")
        .in("unit", units)
        .order("created_at", { ascending: false })
        .range(from, from + PAGE - 1);
      if (subject) query = query.eq("subject", subject);
      const { data, error } = await query;
      if (error) throw error;
      if (!data || data.length === 0) break;
      all.push(...(data as DbRow[]));
      if (data.length < PAGE) break;
    }
    return all.map(fromDb);
  },

  async listBySubject(subject: string): Promise<QuestionRecord[]> {
    if (!subject) return [];
    const PAGE = 1000;
    const all: DbRow[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("subject", subject)
        .order("created_at", { ascending: false })
        .range(from, from + PAGE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      all.push(...(data as DbRow[]));
      if (data.length < PAGE) break;
    }
    return all.map(fromDb);
  },

  async listByTag(tag: string): Promise<QuestionRecord[]> {
    const PAGE = 1000;
    const all: DbRow[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .contains("tags", [tag])
        .order("created_at", { ascending: false })
        .range(from, from + PAGE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      all.push(...(data as DbRow[]));
      if (data.length < PAGE) break;
    }
    return all.map(fromDb);
  },

  async listByPool(pool: string): Promise<QuestionRecord[]> {
    const PAGE = 1000;
    const all: DbRow[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("pool", pool)
        .order("created_at", { ascending: false })
        .range(from, from + PAGE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      all.push(...(data as DbRow[]));
      if (data.length < PAGE) break;
    }
    return all.map(fromDb);
  },

  async countAll(): Promise<number> {
    const { count, error } = await supabase
      .from("questions")
      .select("id", { count: "exact", head: true });
    if (error) throw error;
    return count ?? 0;
  },

  async countByTag(tag: string): Promise<number> {
    const { count, error } = await supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .contains("tags", [tag]);
    if (error) throw error;
    return count ?? 0;
  },

  async create(draft: QuestionDraft): Promise<QuestionRecord> {
    const createdAt = nowIso();
    const record: QuestionRecord = {
      ...draft,
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      options: normalizeOptions(draft.options),
      tags: unique(draft.tags.map((t) => t.trim())),
      createdAt,
      updatedAt: createdAt
    };
    const { error } = await supabase.from("questions").insert(toDb(record));
    if (error) throw error;
    return record;
  },

  async update(id: string, draft: QuestionDraft): Promise<void> {
    const { error } = await supabase
      .from("questions")
      .update({
        subject: draft.subject,
        unit: draft.unit,
        concept: draft.concept,
        difficulty: draft.difficulty,
        source_type: draft.sourceType,
        pool: draft.pool ?? "general",
        question: draft.question,
        content_type: draft.contentType ?? null,
        question_image: draft.questionImage ?? null,
        options: normalizeOptions(draft.options),
        correct_option_id: draft.correctOptionId,
        explanation: draft.explanation,
        explanation_content_type: draft.explanationContentType ?? null,
        explanation_image: draft.explanationImage ?? null,
        tags: unique(draft.tags.map((t) => t.trim())),
        updated_at: nowIso()
      })
      .eq("id", id);
    if (error) throw error;
  },

  async appendMany(drafts: QuestionDraft[]): Promise<QuestionRecord[]> {
    const createdAt = nowIso();
    const records = drafts.map((draft, index): QuestionRecord => ({
      ...draft,
      id: `q-import-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
      options: normalizeOptions(draft.options),
      tags: unique(draft.tags.map((t) => t.trim())),
      createdAt,
      updatedAt: createdAt
    }));
    const { error } = await supabase.from("questions").insert(records.map(toDb));
    if (error) throw error;
    return records;
  },

  async deleteQuestion(id: string): Promise<void> {
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) throw error;
  },

  filter(questions: QuestionRecord[], filters: QuestionFilters): QuestionRecord[] {
    return questions.filter((q) => {
      if (filters.subject && q.subject !== filters.subject) return false;
      if (filters.unit && q.unit !== filters.unit) return false;
      if (filters.difficulty !== "all" && q.difficulty !== filters.difficulty) return false;
      if (filters.pool !== "all" && (q.pool ?? "general") !== filters.pool) return false;
      if (filters.school || filters.year) {
        const m = q.id.match(/^q-(\d{4})-([a-z-]+?)-/);
        if (!m) return false; // 학교/년도 없는 문제는 학교/년도 필터 시 제외
        const [, year, school] = m;
        if (filters.year && year !== filters.year) return false;
        if (filters.school && school !== filters.school) return false;
      }
      return true;
    });
  },

  getFilterOptions(questions: QuestionRecord[]) {
    return {
      subjects: unique(questions.map((q) => q.subject)),
      units: unique(questions.map((q) => q.unit))
    };
  },

  async reset(): Promise<QuestionRecord[]> {
    await supabase.from("questions").delete().not("id", "is", null);
    const seeds = getSeedQuestions();
    const { error } = await supabase.from("questions").insert(seeds.map(toDb));
    if (error) throw error;
    return seeds;
  }
};
