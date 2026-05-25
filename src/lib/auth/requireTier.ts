import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { USER_TIER_ORDER, normalizeTier, type UserTier } from "@/types/auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export type TierCheckResult =
  | {
      ok: true;
      userId: string;
      tier: UserTier;
      isAdmin: boolean;
      supabase: SupabaseClient;
    }
  | { ok: false; response: NextResponse };

function tierAtLeast(userTier: UserTier, required: UserTier): boolean {
  return USER_TIER_ORDER.indexOf(userTier) >= USER_TIER_ORDER.indexOf(required);
}

/**
 * API 라우트에서 사용자 등급(tier)을 검증한다.
 * - Authorization: Bearer {access_token} 헤더로 사용자 식별.
 * - profiles.tier가 required 이상이면 통과.
 * - is_admin = true이면 등급 무관 통과.
 * - tier_expires_at이 만료된 경우 effective tier = 'free'로 평가.
 */
export async function requireTier(
  request: Request,
  required: UserTier
): Promise<TierCheckResult> {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "로그인이 필요합니다." },
        { status: 401 }
      ),
    };
  }
  const token = auth.slice(7).trim();
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "로그인이 필요합니다." },
        { status: 401 }
      ),
    };
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "세션이 만료되었습니다. 다시 로그인해 주세요." },
        { status: 401 }
      ),
    };
  }

  // tier_expires_at 컬럼이 아직 없는 환경 대비 fallback (1-D 안전망과 동일 패턴).
  let row: Record<string, unknown> | null = null;
  const newQuery = await supabase
    .from("profiles")
    .select("tier, is_admin, tier_expires_at")
    .eq("id", user.id)
    .maybeSingle();
  if (newQuery.error) {
    const fallback = await supabase
      .from("profiles")
      .select("tier, is_admin")
      .eq("id", user.id)
      .maybeSingle();
    row = (fallback.data as Record<string, unknown> | null) ?? null;
  } else {
    row = (newQuery.data as Record<string, unknown> | null) ?? null;
  }

  const isAdmin = Boolean(row?.is_admin);
  const rawTier = (row?.tier as string | undefined) ?? "free";
  const expiresAt = (row?.tier_expires_at as string | null | undefined) ?? null;
  const expired = expiresAt !== null && Date.parse(expiresAt) <= Date.now();
  const effectiveTier: UserTier = expired ? "free" : normalizeTier(rawTier);

  if (!isAdmin && !tierAtLeast(effectiveTier, required)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          ok: false,
          message: `${required.toUpperCase()} 등급 이상에서만 이용 가능합니다.`,
        },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true,
    userId: user.id,
    tier: effectiveTier,
    isAdmin,
    supabase,
  };
}
