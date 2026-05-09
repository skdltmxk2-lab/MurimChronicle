import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

// 관리자 홈 대시보드용 카운터.
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const sb = auth.supabase;

  // 문의함: 신규(open) + 처리 중(in_progress) — 관리자가 액션해야 할 항목 수
  const [openCount, inProgressCount, totalQuestions, usersPage] = await Promise.all([
    sb.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "open"),
    sb.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
    sb.from("questions").select("*", { count: "exact", head: true }),
    sb.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const inquiriesPending = (openCount.count ?? 0) + (inProgressCount.count ?? 0);
  const inquiriesNew = openCount.count ?? 0;

  return NextResponse.json({
    ok: true,
    inquiriesPending,
    inquiriesNew,
    totalQuestions: totalQuestions.count ?? 0,
    totalUsers: usersPage.data?.users?.length ?? 0,
  });
}
