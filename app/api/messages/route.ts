import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";

// 회원 본인의 안 읽은 1대1 메시지 목록.
export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("direct_messages")
    .select("id, title, content, created_at, read_at")
    .eq("user_id", auth.userId)
    .is("read_at", null)
    .order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, messages: data ?? [] });
}
