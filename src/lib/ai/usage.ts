import type { SupabaseClient } from "@supabase/supabase-js";

/** AI 기능 일일 사용량 (action: "search" | "solve" | "ask"). UTC 기준 자정에 리셋. */
export type AiAction = "search" | "solve" | "ask";

/**
 * 일일 한도를 원자적으로 선점한다(check-and-increment).
 * - 한도 미만이면 +1 후 ok:true 반환(동시 요청에도 한도 우회 불가).
 * - 한도 도달이면 증가하지 않고 ok:false 반환 → 호출부는 429 응답.
 * AI 호출이 실패하면 refundDailyUsage 로 선점분을 되돌린다.
 */
export async function reserveDailyUsage(
  supabase: SupabaseClient,
  userId: string,
  action: AiAction,
  limit: number
): Promise<{ ok: true; count: number } | { ok: false }> {
  const { data, error } = await supabase.rpc("consume_ai_usage", {
    p_user_id: userId,
    p_action: action,
    p_limit: limit,
  });
  if (error) {
    // 사용량 집계 실패로 기능 자체를 막지 않는다(best-effort). 한도 검사만 건너뜀.
    return { ok: true, count: 0 };
  }
  const count = typeof data === "number" ? data : -1;
  if (count < 0) return { ok: false };
  return { ok: true, count };
}

/** 선점한 사용량 1회를 되돌린다(AI 호출 실패 시, best-effort). */
export async function refundDailyUsage(
  supabase: SupabaseClient,
  userId: string,
  action: AiAction
): Promise<void> {
  await supabase.rpc("refund_ai_usage", { p_user_id: userId, p_action: action });
}
