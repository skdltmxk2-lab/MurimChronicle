import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

const VALID_ENGINES = new Set(["concept", "embedding"]);

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { data } = await auth.supabase
    .from("app_settings")
    .select("value")
    .eq("key", "search_engine")
    .maybeSingle();
  const searchEngine = data?.value === "embedding" ? "embedding" : "concept";
  return NextResponse.json({ ok: true, searchEngine });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as { searchEngine?: string } | null;
  const engine = body?.searchEngine;
  if (!engine || !VALID_ENGINES.has(engine)) {
    return NextResponse.json({ ok: false, message: "searchEngine은 concept/embedding 중 하나여야 합니다." }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("app_settings")
    .upsert({ key: "search_engine", value: engine, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, searchEngine: engine });
}
