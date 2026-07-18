"use client";

import { supabase } from "@/lib/supabase/client";
import { mockExams } from "@/data/mockData";
import type { Problem } from "@/types/exam";
import type { QuestionDraft, QuestionFilters, QuestionRecord } from "@/types/question";
import type { IQuestionRepository } from "@/lib/questions/IQuestionRepository";
import { assertStandaloneQuestion } from "@/lib/questions/standalone";

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

function answerTextFromOption(options: QuestionRecord["options"], correctOptionId: string) {
  return options.find((option) => option.id === correctOptionId || option.label === correctOptionId)?.text;
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
    tags: unique(draft.tags.map((t) => t.trim())),
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
  // question_type 컬럼이 없으면 'subjective' 태그로 추론 (마이그레이션 이전 호환)
  const tags = (row.tags ?? []) as string[];
  const dbType = row.question_type as QuestionRecord["questionType"] | null | undefined;
  const storedQuestionType: QuestionRecord["questionType"] =
    dbType ?? (tags.includes("subjective") ? "subjective" : "multiple_choice");
  // answer_text 컬럼이 없으면 단답형의 첫 옵션 텍스트로 fallback
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
    updatedAt: row.updated_at as string
  };
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
      tags: unique(draft.tags.map((t) => t.trim())),
      createdAt,
      updatedAt: createdAt
    };
    const { error } = await supabase.from("questions").insert(toDb(record));
    if (error) throw error;
    return record;
  },

  async update(id: string, draft: QuestionDraft): Promise<void> {
    assertStandaloneQuestion(draft);
    const { error } = await supabase
      .from("questions")
      .update({ ...draftToRow(draft), updated_at: nowIso() })
      .eq("id", id);
    if (error) throw error;
  },

  async appendMany(drafts: QuestionDraft[]): Promise<QuestionRecord[]> {
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
        tags: unique(draft.tags.map((t) => t.trim())),
        createdAt,
        updatedAt: createdAt
      };
    });
    const { error } = await supabase.from("questions").insert(records.map(toDb));
    if (error) throw error;
    return records;
  },

  async deleteQuestion(id: string): Promise<void> {
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) throw error;
  },

  filter(questions: QuestionRecord[], filters: QuestionFilters): QuestionRecord[] {
    // 학교 영문 코드 → 한글명 매핑 (ID 슬러그 매칭이 hanyang-erica 같은 다중-단어
    // 슬러그에서 misfire 할 수 있어 tags 기반 매칭을 우선 사용)
    const SCHOOL_CODE_TO_KO: Record<string, string> = {
      ajou: "아주대", cau: "중앙대", dgu: "동국대", dku: "단국대",
      gachon: "가천대", hansung: "한성대", hanyang: "한양대", hongik: "홍익대",
      inha: "인하대", kau: "항공대", konkuk: "건국대", kw: "광운대",
      kyonggi: "경기대", kyunghee: "경희대", mju: "명지대", sejong: "세종대",
      seoultech: "서울과기대", skku: "성균관대", sogang: "서강대",
      sookmyung: "숙명여대", soongsil: "숭실대", uos: "시립대",
    };
    return questions.filter((q) => {
      if (filters.subject && q.subject !== filters.subject) return false;
      if (filters.unit && q.unit !== filters.unit) return false;
      if (filters.difficulty !== "all" && q.difficulty !== filters.difficulty) return false;
      if (filters.pool !== "all" && (q.pool ?? "general") !== filters.pool) return false;
      if (filters.school) {
        const schoolKo = SCHOOL_CODE_TO_KO[filters.school];
        // 한글 학교명이 태그에 정확히 일치해야 통과
        if (!schoolKo || !q.tags.includes(schoolKo)) return false;
      }
      if (filters.year) {
        // 년도는 태그에 포함된 4자리 숫자 문자열로 매칭
        if (!q.tags.includes(filters.year)) return false;
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
