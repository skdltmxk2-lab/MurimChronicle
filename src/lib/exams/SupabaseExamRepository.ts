"use client";

import { supabase } from "@/lib/supabase/client";
import { getMockExam } from "@/data/mockData";
import type { MockExam } from "@/types/exam";
import type { GeneratedExam } from "@/types/generatedExam";
import type { IExamRepository } from "@/lib/exams/IExamRepository";

type DbRow = Record<string, unknown>;

function fromDb(row: DbRow): GeneratedExam {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description ?? "") as string,
    mode: row.mode as GeneratedExam["mode"],
    timeLimitSec: row.time_limit_sec as number,
    tags: (row.tags ?? []) as string[],
    problems: row.problems as GeneratedExam["problems"],
    createdAt: row.created_at as string,
    sourceQuestionIds: (row.source_question_ids ?? []) as string[],
    generationSummary: row.generation_summary as GeneratedExam["generationSummary"]
  };
}

function toDb(exam: GeneratedExam) {
  return {
    id: exam.id,
    title: exam.title,
    description: exam.description,
    mode: exam.mode,
    time_limit_sec: exam.timeLimitSec,
    tags: exam.tags,
    problems: exam.problems,
    created_at: exam.createdAt,
    source_question_ids: exam.sourceQuestionIds,
    generation_summary: exam.generationSummary
  };
}

export const supabaseExamRepo: IExamRepository = {
  async listGenerated(): Promise<GeneratedExam[]> {
    const { data, error } = await supabase
      .from("generated_exams")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map((row) => fromDb(row as DbRow));
  },

  async findById(id: string): Promise<MockExam | GeneratedExam | null> {
    const mock = getMockExam(id);
    if (mock) return mock;

    const { data, error } = await supabase
      .from("generated_exams")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return fromDb(data as DbRow);
  },

  async addGenerated(exam: GeneratedExam): Promise<void> {
    const { error } = await supabase.from("generated_exams").insert(toDb(exam));
    if (error) throw error;
  },

  async updateGenerated(exam: GeneratedExam): Promise<void> {
    const { error } = await supabase
      .from("generated_exams")
      .update(toDb(exam))
      .eq("id", exam.id);
    if (error) throw error;
  },

  async deleteGenerated(id: string): Promise<void> {
    const { error } = await supabase.from("generated_exams").delete().eq("id", id);
    if (error) throw error;
  }
};
