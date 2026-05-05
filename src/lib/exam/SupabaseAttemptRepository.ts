import { supabase } from "@/lib/supabase/client";
import type { AnswerMap, AttemptResult } from "@/types/exam";
import type { IAttemptRepository } from "@/lib/exam/IAttemptRepository";

// In-progress exam state stays in localStorage (ephemeral).
// Only completed results are persisted to Supabase.

const ANSWER_PREFIX = "cbt:answers:";
const STARTED_PREFIX = "cbt:started:";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export const supabaseAttemptRepo: IAttemptRepository = {
  async loadAnswers(examId: string): Promise<AnswerMap> {
    if (!canUseStorage()) return {};
    const raw = window.localStorage.getItem(`${ANSWER_PREFIX}${examId}`);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as AnswerMap;
    } catch {
      return {};
    }
  },

  async saveAnswers(examId: string, answers: AnswerMap): Promise<void> {
    if (!canUseStorage()) return;
    window.localStorage.setItem(`${ANSWER_PREFIX}${examId}`, JSON.stringify(answers));
  },

  async clearAnswers(examId: string): Promise<void> {
    if (!canUseStorage()) return;
    window.localStorage.removeItem(`${ANSWER_PREFIX}${examId}`);
    window.localStorage.removeItem(`${STARTED_PREFIX}${examId}`);
  },

  async getStartedAt(examId: string): Promise<number> {
    if (!canUseStorage()) return Date.now();
    const key = `${STARTED_PREFIX}${examId}`;
    const raw = window.localStorage.getItem(key);
    if (raw) {
      const parsed = Number(raw);
      if (!Number.isNaN(parsed)) return parsed;
    }
    const now = Date.now();
    window.localStorage.setItem(key, String(now));
    return now;
  },

  async saveResult(result: AttemptResult): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();

    const { error } = await supabase.from("exam_attempts").insert({
      attempt_id: result.attemptId,
      user_id: session?.user?.id ?? null,
      exam_id: result.examId,
      result: result
    });

    if (error) throw error;
  },

  async loadResult(attemptId: string): Promise<AttemptResult | null> {
    const { data, error } = await supabase
      .from("exam_attempts")
      .select("result")
      .eq("attempt_id", attemptId)
      .single();

    if (error || !data) return null;
    return data.result as AttemptResult;
  },

  async listResults(): Promise<AttemptResult[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return [];

    const { data, error } = await supabase
      .from("exam_attempts")
      .select("result")
      .eq("user_id", session.user.id);

    if (error || !data) return [];
    return data.map((row) => row.result as AttemptResult);
  }
};
