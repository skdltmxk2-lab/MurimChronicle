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
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, tier, is_admin, tier_expires_at")
    .in("id", ids);
  const profileById = new Map<
    string,
    { name: string; tier: string; isAdmin: boolean; tierExpiresAt: string | null }
  >();
  for (const p of profiles ?? []) {
    profileById.set(p.id as string, {
      name: (p.name as string) ?? "",
      tier: (p.tier as string) ?? "go",
      isAdmin: Boolean(p.is_admin),
      tierExpiresAt: (p.tier_expires_at as string | null) ?? null,
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
      lastSignInAt: u.last_sign_in_at ?? null,
      tier: effectiveTier,
      tierRaw: rawTier,
      tierExpiresAt: expiresAt,
      tierExpired: expired,
      isAdmin: profile?.isAdmin ?? false,
    };
  });

  users.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return NextResponse.json({ ok: true, users });
}
