import type { SupabaseClient } from "@supabase/supabase-js";

/** AI 기능 일일 사용량 (action: "search" | "solve" | "ask"). UTC 기준 자정에 리셋. */
export type AiAction = "search" | "solve" | "ask";

export async function getDailyUsage(
  supabase: SupabaseClient,
  userId: string,
  action: AiAction
): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("ai_usage")
    .select("count")
    .eq("user_id", userId)
    .eq("used_on", today)
    .eq("action", action)
    .maybeSingle();
  return (data?.count as number | undefined) ?? 0;
}

/** 사용량 +1 (성공 시 호출, best-effort). */
export async function bumpDailyUsage(
  supabase: SupabaseClient,
  userId: string,
  action: AiAction
): Promise<void> {
  await supabase.rpc("increment_ai_usage", { p_user_id: userId, p_action: action });
}
