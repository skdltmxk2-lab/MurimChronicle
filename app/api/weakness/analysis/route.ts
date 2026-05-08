import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";
import { buildAnalysis } from "@/lib/weakness/report";

export async function GET(request: Request) {
  const auth = await requireTier(request, "free"); // 모든 등급 노출 (셀링 + 업그레이드 유도)
  if (!auth.ok) return auth.response;

  const analysis = await buildAnalysis(auth.supabase, auth.userId);
  return NextResponse.json({ ok: true, ...analysis });
}
