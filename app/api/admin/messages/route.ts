import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { data: messages, error } = await auth.supabase
    .from("direct_messages")
    .select("id, user_id, title, content, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  // 수신자 정보 첨부
  const userIds = [...new Set((messages ?? []).map((m) => m.user_id))];
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

  const enriched = (messages ?? []).map((m) => ({
    ...m,
    user: userInfo.get(m.user_id) ?? { name: "", email: "" },
  }));
  return NextResponse.json({ ok: true, messages: enriched });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as {
    userIds?: string[];
    title?: string;
    content?: string;
  } | null;
  if (!body) {
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  }
  const { userIds, title, content } = body;
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json({ ok: false, message: "수신자를 선택해 주세요." }, { status: 400 });
  }
  if (!title?.trim() || title.length > 200) {
    return NextResponse.json({ ok: false, message: "제목을 입력해 주세요 (200자 이내)." }, { status: 400 });
  }
  if (!content?.trim() || content.length > 5000) {
    return NextResponse.json({ ok: false, message: "내용을 입력해 주세요 (5000자 이내)." }, { status: 400 });
  }

  const rows = userIds.map((uid) => ({
    user_id: uid,
    created_by: auth.userId,
    title: title.trim(),
    content: content.trim(),
  }));
  const { error } = await auth.supabase.from("direct_messages").insert(rows);
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, sent: rows.length });
}
