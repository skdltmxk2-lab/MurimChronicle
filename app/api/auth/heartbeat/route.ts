import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";

// 로그인된 사용자의 last_seen_at을 현재 시각으로 갱신.
// 클라이언트가 30초마다 호출 → admin 화면에서 1분 이내면 접속 중으로 판정.
export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const { error } = await auth.supabase
    .from("profiles")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", auth.userId);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
