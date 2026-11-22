import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";

const headers = { "Cache-Control": "private, no-store" };

export async function GET(request: Request) {
  const auth = await requireTier(request, "pro");
  if (!auth.ok) {
    auth.response.headers.set("Cache-Control", headers["Cache-Control"]);
    return auth.response;
  }

  const { data, error } = await auth.supabase
    .from("school_mock_problem_sheets")
    .select("round")
    .eq("school_code", "konkuk")
    .order("round");
  if (error) {
    return NextResponse.json(
      { message: "등록된 문제지를 불러올 수 없습니다." },
      { status: 503, headers },
    );
  }

  return NextResponse.json({ rounds: (data ?? []).map(({ round }) => round) }, { headers });
}
