import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";
import { generateReport } from "@/lib/weakness/report";

export async function GET(request: Request) {
  // 취약유형 모의고사가 무료 개방되었으므로 응시 후 리포트도 무료로 열람 가능.
  const auth = await requireTier(request, "free");
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
