import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";

// 회원이 안 닫은(active) 공지 목록을 가져온다.
export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const nowIso = new Date().toISOString();
  const { data: list, error } = await auth.supabase
    .from("announcements")
    .select("id, title, content, created_at, expires_at")
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  // 본인이 dismiss한 것 제외
  const { data: dismissed } = await auth.supabase
    .from("announcement_reads")
    .select("announcement_id")
    .eq("user_id", auth.userId);
  const dismissedSet = new Set((dismissed ?? []).map((d) => d.announcement_id));
  const active = (list ?? []).filter((a) => !dismissedSet.has(a.id));
  return NextResponse.json({ ok: true, announcements: active });
}
