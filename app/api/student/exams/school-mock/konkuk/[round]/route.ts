import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";
import { konkukProblemSheetName } from "@/lib/exams/konkukSchoolMock";

const NO_CACHE = { "Cache-Control": "private, no-store" };

export async function GET(request: Request, { params }: { params: Promise<{ round: string }> }) {
  const { round: roundParam } = await params;
  if (!/^[1-9]\d{0,2}$/.test(roundParam)) {
    return NextResponse.json({ message: "요청한 회차가 없습니다." }, { status: 404, headers: NO_CACHE });
  }
  const round = Number(roundParam);

  const auth = await requireTier(request, "pro");
  if (!auth.ok) {
    auth.response.headers.set("Cache-Control", NO_CACHE["Cache-Control"]);
    return auth.response;
  }

  const { data: sheet, error: catalogError } = await auth.supabase
    .from("school_mock_problem_sheets")
    .select("object_name")
    .eq("school_code", "konkuk")
    .eq("round", round)
    .maybeSingle();
  if (!catalogError && !sheet) {
    return NextResponse.json({ message: "요청한 회차가 없습니다." }, { status: 404, headers: NO_CACHE });
  }
  if (catalogError || !sheet || !new RegExp(`^round-${round}(-v[1-9][0-9]*)?\\.pdf$`).test(sheet.object_name)) {
    return NextResponse.json(
      { message: "문제지를 열 수 없습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503, headers: NO_CACHE },
    );
  }
  const { data, error } = await auth.supabase.storage
    .from("homework-pdfs")
    .download(`school-mocks/konkuk/${sheet.object_name}`);
  if (error || !data) {
    return NextResponse.json(
      { message: "문제지를 열 수 없습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503, headers: NO_CACHE },
    );
  }

  return new Response(data, {
    headers: {
      ...NO_CACHE,
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="konkuk-mock-${round}.pdf"; filename*=UTF-8''${encodeURIComponent(konkukProblemSheetName(round))}`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
