import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

/**
 * 관리자 전용: 게시글/댓글 작성자(user_id) → 실명(profiles.name) 매핑 반환.
 * 일반 클라이언트에는 실명이 내려가지 않도록 관리자만 호출 가능.
 */
export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as { ids?: unknown } | null;
  const ids = Array.isArray(body?.ids)
    ? (body!.ids as unknown[]).filter((x): x is string => typeof x === "string").slice(0, 300)
    : [];
  if (ids.length === 0) return NextResponse.json({ ok: true, names: {} });

  const { data, error } = await auth.supabase.from("profiles").select("id, name").in("id", ids);
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  const names: Record<string, string> = {};
  for (const r of data ?? []) names[r.id as string] = (r.name as string) ?? "";
  return NextResponse.json({ ok: true, names });
}
