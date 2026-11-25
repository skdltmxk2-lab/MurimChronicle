import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";
import { isSchoolMockCode, schoolMockProblemSheetName } from "@/lib/exams/schoolMock";

const NO_CACHE = { "Cache-Control": "private, no-store" };
const NOT_FOUND = "요청한 회차의 문제지가 없습니다.";
const DOWNLOAD_FAILED = "문제지를 다운로드할 수 없습니다. 잠시 후 다시 시도해 주세요.";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ message }, { status, headers: NO_CACHE });
}

export async function GET(request: Request, { params }: { params: Promise<{ school: string; round: string }> }) {
  const { school, round: roundParam } = await params;
  if (!isSchoolMockCode(school) || !/^[1-9]\d{0,2}$/.test(roundParam)) {
    return errorResponse(NOT_FOUND, 404);
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
    .eq("school_code", school)
    .eq("round", round)
    .not("exam", "is", null)
    .maybeSingle();
  if (catalogError) return errorResponse(DOWNLOAD_FAILED, 503);
  if (!sheet) return errorResponse(NOT_FOUND, 404);

  const filenamePattern = new RegExp("^round-" + round + "(-v[1-9][0-9]*)?\\.pdf$");
  if (!filenamePattern.test(sheet.object_name)) return errorResponse(DOWNLOAD_FAILED, 503);

  const path = ["school-mocks", school, sheet.object_name].join("/");
  const { data: pdf, error } = await auth.supabase.storage.from("homework-pdfs").download(path);
  if (error || !pdf?.size) return errorResponse(DOWNLOAD_FAILED, 503);

  const encodedFilename = encodeURIComponent(schoolMockProblemSheetName(school, round));
  return new Response(pdf, {
    headers: {
      ...NO_CACHE,
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=\"" + school + "-mock-" + round + ".pdf\"; filename*=UTF-8''" + encodedFilename,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
