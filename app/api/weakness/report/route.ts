import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";
import { generateReport } from "@/lib/weakness/report";

export async function GET(request: Request) {
  const auth = await requireTier(request, "pro");
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const attemptId = url.searchParams.get("attemptId");
  if (!attemptId) {
    return NextResponse.json(
      { ok: false, message: "attemptId가 필요합니다." },
      { status: 400 }
    );
  }

  const report = await generateReport(auth.supabase, auth.userId, attemptId);
  if ("error" in report) {
    return NextResponse.json({ ok: false, message: report.error }, { status: 404 });
  }
  return NextResponse.json({ ok: true, report });
}
