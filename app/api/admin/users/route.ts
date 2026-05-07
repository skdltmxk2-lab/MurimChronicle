import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const FALLBACK_ADMIN_PASSWORD = "routeroute";

function checkAdmin(request: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD || FALLBACK_ADMIN_PASSWORD;
  const provided = request.headers.get("x-admin-password");
  return Boolean(provided) && provided === expected;
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: Request) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ ok: false, message: "관리자 권한이 필요합니다." }, { status: 401 });
  }

  const supabase = adminClient();

  const { data: usersPage, error: usersError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
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
