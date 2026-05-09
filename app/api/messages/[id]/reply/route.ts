import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";

// 회원이 관리자 메시지에 답장. 답장은 inquiries 테이블에 카테고리=other,
// 원본 메시지를 본문에 인용하여 저장된다. 관리자는 [문의 관리]에서 확인.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const body = (await request.json().catch(() => null)) as { content?: string } | null;
  if (!body?.content?.trim()) {
    return NextResponse.json({ ok: false, message: "답장 내용을 입력해 주세요." }, { status: 400 });
  }
  if (body.content.length > 5000) {
    return NextResponse.json({ ok: false, message: "내용이 너무 깁니다 (5000자 이내)." }, { status: 400 });
  }

  // 원본 메시지 조회 (본인 것인지 확인)
  const { data: original, error: oErr } = await auth.supabase
    .from("direct_messages")
    .select("id, title, content, user_id")
    .eq("id", id)
    .eq("user_id", auth.userId)
    .maybeSingle();
  if (oErr || !original) {
    return NextResponse.json({ ok: false, message: "원본 메시지를 찾지 못했습니다." }, { status: 404 });
  }

  // inquiry 생성 (제목·본문에 원본 인용)
  const inquiryTitle = `[메시지 답장] ${original.title}`.slice(0, 200);
  const inquiryContent = [
    "💬 관리자 원본 메시지:",
    `▶ 제목: ${original.title}`,
    `▶ 내용: ${original.content}`,
    "",
    "✉ 회원 답장:",
    body.content.trim(),
  ].join("\n");

  const { error: iErr } = await auth.supabase
    .from("inquiries")
    .insert({
      user_id: auth.userId,
      category: "other",
      title: inquiryTitle,
      content: inquiryContent,
    });
  if (iErr) {
    return NextResponse.json({ ok: false, message: iErr.message }, { status: 500 });
  }

  // 원본 메시지 읽음 처리
  await auth.supabase
    .from("direct_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.userId);

  return NextResponse.json({ ok: true });
}
