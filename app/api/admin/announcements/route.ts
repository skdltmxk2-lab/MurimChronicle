import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("announcements")
    .select("id, title, content, created_at, expires_at, created_by")
    .order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, announcements: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as {
    title?: string;
    content?: string;
    expiresAt?: string | null;
  } | null;
  if (!body) {
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  }
  if (!body.title?.trim() || body.title.length > 200) {
    return NextResponse.json({ ok: false, message: "제목을 입력해 주세요 (200자 이내)." }, { status: 400 });
  }
  if (!body.content?.trim() || body.content.length > 5000) {
    return NextResponse.json({ ok: false, message: "내용을 입력해 주세요 (5000자 이내)." }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("announcements")
    .insert({
      title: body.title.trim(),
      content: body.content.trim(),
      expires_at: body.expiresAt ?? null,
      created_by: auth.userId,
    })
    .select("id")
    .single();
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: data.id });
}
