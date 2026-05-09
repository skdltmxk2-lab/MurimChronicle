import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");

  let query = auth.supabase
    .from("inquiries")
    .select("id, user_id, category, title, content, image_url, status, admin_reply, admin_reply_at, created_at, updated_at")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data: inquiries, error } = await query;
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  // 사용자 정보 조인 (이름, 이메일)
  const userIds = [...new Set((inquiries ?? []).map((i) => i.user_id))];
  const userInfo = new Map<string, { name: string; email: string }>();
  if (userIds.length > 0) {
    const { data: usersPage } = await auth.supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const { data: profiles } = await auth.supabase.from("profiles").select("id, name").in("id", userIds);
    const profById = new Map<string, string>();
    for (const p of profiles ?? []) profById.set(p.id as string, (p.name as string) ?? "");
    for (const u of usersPage?.users ?? []) {
      if (userIds.includes(u.id)) {
        userInfo.set(u.id, { name: profById.get(u.id) ?? "", email: u.email ?? "" });
      }
    }
  }

  const enriched = (inquiries ?? []).map((i) => ({
    ...i,
    user: userInfo.get(i.user_id) ?? { name: "", email: "" },
  }));

  return NextResponse.json({ ok: true, inquiries: enriched });
}
