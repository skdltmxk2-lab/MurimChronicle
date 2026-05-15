import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const supabase = auth.supabase;
  const { data: usersPage, error: usersError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (usersError) {
    return NextResponse.json({ ok: false, message: usersError.message }, { status: 500 });
  }

  const ids = usersPage.users.map((u) => u.id);
  // tier_expires_at 컬럼이 아직 없는 환경에서도 admin이 박탈돼 보이지 않도록
  // 새 컬럼 SELECT가 실패하면 옛 컬럼 셋으로 한 번 더 조회한다.
  let profiles: Array<Record<string, unknown>> | null = null;
  // 새 컬럼(last_seen_at, student_group)이 아직 없는 환경에서도 동작하도록 단계적 fallback.
  const newestQuery = await supabase
    .from("profiles")
    .select("id, name, tier, is_admin, tier_expires_at, student_group, last_seen_at")
    .in("id", ids);
  if (newestQuery.error) {
    const newQuery = await supabase
      .from("profiles")
      .select("id, name, tier, is_admin, tier_expires_at, student_group")
      .in("id", ids);
    if (newQuery.error) {
      const midQuery = await supabase
        .from("profiles")
        .select("id, name, tier, is_admin, tier_expires_at")
        .in("id", ids);
      if (midQuery.error) {
        const fallback = await supabase
          .from("profiles")
          .select("id, name, tier, is_admin")
          .in("id", ids);
        profiles = (fallback.data as Array<Record<string, unknown>> | null) ?? [];
      } else {
        profiles = (midQuery.data as Array<Record<string, unknown>> | null) ?? [];
      }
    } else {
      profiles = (newQuery.data as Array<Record<string, unknown>> | null) ?? [];
    }
  } else {
    profiles = (newestQuery.data as Array<Record<string, unknown>> | null) ?? [];
  }
  const profileById = new Map<
    string,
    {
      name: string;
      tier: string;
      isAdmin: boolean;
      tierExpiresAt: string | null;
      studentGroup: string;
      lastSeenAt: string | null;
    }
  >();
  for (const p of profiles ?? []) {
    profileById.set(p.id as string, {
      name: (p.name as string) ?? "",
      tier: (p.tier as string) ?? "go",
      isAdmin: Boolean(p.is_admin),
      tierExpiresAt: (p.tier_expires_at as string | null | undefined) ?? null,
      studentGroup: (p.student_group as string | undefined) ?? "external",
      lastSeenAt: (p.last_seen_at as string | null | undefined) ?? null,
    });
  }

  const now = Date.now();
  const users = usersPage.users.map((u) => {
    const profile = profileById.get(u.id);
    const rawTier = profile?.tier ?? "go";
    const expiresAt = profile?.tierExpiresAt ?? null;
    // 만료된 등급은 effectiveTier='free'로 노출. raw는 별도로 같이 보낸다.
    const expired = expiresAt !== null && Date.parse(expiresAt) <= now;
    const effectiveTier = expired ? "free" : rawTier;
    return {
      id: u.id,
      email: u.email ?? "",
      name: profile?.name ?? (u.user_metadata?.name as string) ?? "",
      createdAt: u.created_at,
      lastSignInAt: mostRecentIso(u.last_sign_in_at ?? null, profile?.lastSeenAt ?? null),
      lastSeenAt: profile?.lastSeenAt ?? null,
      tier: effectiveTier,
      tierRaw: rawTier,
      tierExpiresAt: expiresAt,
      tierExpired: expired,
      isAdmin: profile?.isAdmin ?? false,
      studentGroup: profile?.studentGroup ?? "external",
    };
  });

  users.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return NextResponse.json({ ok: true, users });
}

function mostRecentIso(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return Date.parse(a) >= Date.parse(b) ? a : b;
}
