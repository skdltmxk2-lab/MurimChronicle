import type { IAttemptRepository } from "@/lib/exam/IAttemptRepository";
import { supabaseAttemptRepo } from "@/lib/exam/SupabaseAttemptRepository";

export const attemptRepo: IAttemptRepository = supabaseAttemptRepo;

export function createAttemptId(_examId: string) {
  // attemptId는 URL path segment로 사용되므로 한글·콜론·슬래시 등 특수문자 없는 안전한 형식으로 생성한다.
  // examId는 AttemptResult.examId 필드에 저장되므로 attemptId에 박을 필요 없음.
  const random = Math.random().toString(36).slice(2, 10);
  return `att-${Date.now()}-${random}`;
}
