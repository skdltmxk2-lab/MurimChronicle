import type { SupabaseClient } from "@supabase/supabase-js";

// 특정 user_id 가 windowSec 초 안에 limit 건을 초과해 인서트하지 못하게 한다.
// service_role 클라이언트 기준으로 호출.
export async function checkRateLimit(
  supabase: SupabaseClient,
  opts: { table: string; userId: string; windowSec: number; limit: number }
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  const since = new Date(Date.now() - opts.windowSec * 1000).toISOString();
  const { count, error } = await supabase
    .from(opts.table)
    .select("id", { count: "exact", head: true })
    .eq("user_id", opts.userId)
    .gte("created_at", since);
  if (error) {
    // 카운트 실패 시 차단하지 않음(서비스 장애 회피).
    return { ok: true };
  }
  if ((count ?? 0) >= opts.limit) {
    return { ok: false, retryAfterSec: opts.windowSec };
  }
  return { ok: true };
}
