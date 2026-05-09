import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";

const ALLOWED_CATEGORIES = new Set(["complaint", "suggestion", "bug", "other"]);
const MAX_TITLE_LEN = 200;
const MAX_CONTENT_LEN = 5000;
// Base64 이미지 5MB 제한 (대략적, 토큰 길이 기준)
const MAX_IMAGE_LEN = 7_000_000;

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as {
    category?: string;
    title?: string;
    content?: string;
    imageUrl?: string;
  } | null;
  if (!body) {
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  }
  const { category, title, content, imageUrl } = body;
  if (!category || !ALLOWED_CATEGORIES.has(category)) {
    return NextResponse.json({ ok: false, message: "카테고리를 선택해 주세요." }, { status: 400 });
  }
  if (!title || !title.trim() || title.length > MAX_TITLE_LEN) {
    return NextResponse.json({ ok: false, message: "제목을 입력해 주세요 (200자 이내)." }, { status: 400 });
  }
  if (!content || !content.trim() || content.length > MAX_CONTENT_LEN) {
    return NextResponse.json({ ok: false, message: "내용을 입력해 주세요 (5000자 이내)." }, { status: 400 });
  }
  if (imageUrl && imageUrl.length > MAX_IMAGE_LEN) {
    return NextResponse.json({ ok: false, message: "이미지 용량이 너무 큽니다 (5MB 이내)." }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("inquiries")
    .insert({
      user_id: auth.userId,
      category,
      title: title.trim(),
      content: content.trim(),
      image_url: imageUrl || null,
    })
    .select("id")
    .single();
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: data.id });
}

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("inquiries")
    .select("id, category, title, content, image_url, status, admin_reply, admin_reply_at, created_at")
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, inquiries: data ?? [] });
}
