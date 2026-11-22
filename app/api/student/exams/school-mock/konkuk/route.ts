import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";
import { konkukExamId } from "@/lib/exams/konkukSchoolMock";

const headers = { "Cache-Control": "private, no-store" };

export async function GET(request: Request) {
  const auth = await requireTier(request, "pro");
  if (!auth.ok) {
    auth.response.headers.set("Cache-Control", headers["Cache-Control"]);
    return auth.response;
  }

  const { data, error } = await auth.supabase
    .from("school_mock_problem_sheets")
    .select("round,title:exam->>title")
    .eq("school_code", "konkuk")
    .not("exam", "is", null)
    .order("round");
  if (error) {
    return NextResponse.json(
      { message: "등록된 모의고사를 불러올 수 없습니다." },
      { status: 503, headers },
    );
  }

  const exams = (data ?? [])
    .filter(({ title }) => typeof title === "string" && title.trim().length > 0)
    .map(({ round, title }) => ({ round, id: konkukExamId(round), title }));
  return NextResponse.json({ exams }, { headers });
}
