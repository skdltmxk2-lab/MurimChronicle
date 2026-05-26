import "server-only";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** 서버 전용: Supabase에서 행 수를 단순 조회. */
async function countRows(table: string): Promise<number> {
  if (!SUPABASE_URL || !SERVICE_ROLE) return 0;
  try {
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { count, error } = await sb
      .from(table)
      .select("id", { count: "exact", head: true });
    if (error || typeof count !== "number") return 0;
    return count;
  } catch {
    return 0;
  }
}

export async function fetchQuestionCount(): Promise<number> {
  return countRows("questions");
}

export async function fetchUserCount(): Promise<number> {
  return countRows("profiles");
}
