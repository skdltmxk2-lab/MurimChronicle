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
    .select("id, name, tier, is_admin")
    .in("id", ids);
  const profileById = new Map<string, { name: string; tier: string; isAdmin: boolean }>();
  for (const p of profiles ?? []) {
    profileById.set(p.id as string, {
      name: (p.name as string) ?? "",
      tier: (p.tier as string) ?? "go",
      isAdmin: Boolean(p.is_admin),
    });
  }

  const users = usersPage.users.map((u) => {
    const profile = profileById.get(u.id);
    return {
      id: u.id,
      email: u.email ?? "",
      name: profile?.name ?? (u.user_metadata?.name as string) ?? "",
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
      tier: profile?.tier ?? "go",
      isAdmin: profile?.isAdmin ?? false,
    };
  });

  users.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return NextResponse.json({ ok: true, users });
}
