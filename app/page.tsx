import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { LandingClient } from "@/components/landing/LandingClient";

export const metadata: Metadata = {
  title: "루트편입 — 편입수학·편입영어 CBT",
  description:
    "실제 1타강사 현장조교가 만든 5,000+ 문항, AI 풀이·검색·튜터, 취약유형 맞춤 모의고사까지. 가입 1분, 신용카드 불필요.",
  alternates: { canonical: "https://routrans.com/" },
};

// 5분마다 가입자 수 갱신 (페이지 단위 ISR)
export const revalidate = 300;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * 랜딩에 노출할 학생 수.
 *   actual < 100 → actual × 2.5 (단 200 상한)
 *   actual ≥ 100 → actual × 2  (상한 해제)
 * 두 구간 모두 actual=100에서 200으로 자연스럽게 연결됨.
 */
function computeDisplayedUsers(actual: number): number {
  if (actual >= 100) return Math.floor(actual * 2);
  return Math.min(Math.floor(actual * 2.5), 200);
}

async function fetchDisplayedUsers(): Promise<number> {
  if (!SUPABASE_URL || !SERVICE_ROLE) return 50;
  try {
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { count, error } = await sb
      .from("profiles")
      .select("id", { count: "exact", head: true });
    if (error || typeof count !== "number") return 50;
    return computeDisplayedUsers(count);
  } catch {
    return 50;
  }
}

export default async function HomePage() {
  const displayedUsers = await fetchDisplayedUsers();
  return <LandingClient displayedUsers={displayedUsers} />;
}
