import type { IAttemptRepository } from "@/lib/exam/IAttemptRepository";
import { supabaseAttemptRepo } from "@/lib/exam/SupabaseAttemptRepository";

export const attemptRepo: IAttemptRepository = supabaseAttemptRepo;

export function createAttemptId(examId: string) {
  const random = Math.random().toString(36).slice(2, 8);
  return `${examId}-${Date.now()}-${random}`;
}
