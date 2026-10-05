import { after, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { processHomeworkReference } from "@/lib/homework/processor";
import { getHomeworkMaterial, loadHomeworkSettings, checkDatabase, HomeworkError, homeworkErrorResponse, requireHomeworkId, readHomeworkBody } from "@/lib/homework/server";
import { normalizeReference, validateQuestionNumbers } from "@/lib/homework/core.mjs";

export const runtime = "nodejs";
export const maxDuration = 300;
type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  try {
    const id = requireHomeworkId((await context.params).id);
    const material = await getHomeworkMaterial(auth.supabase, id);
    if (!process.env.GEMINI_API_KEY) throw new HomeworkError(503, "숙제 AI 서버 설정이 필요합니다. 직접 첨삭은 사용할 수 있습니다.");
    if (!(await loadHomeworkSettings(auth.supabase)).aiEnabled) throw new HomeworkError(409, "AI 피드백 생성 설정을 먼저 켜 주세요.");
    // A running request is idempotent; an intentional later retry invalidates old references.
    if (material.referenceStatus === "processing") return NextResponse.json({ ok: true, processing: true });
    const { data, error } = await auth.supabase.from("homework_materials").update({ reference_status: "pending", reference_error: null, reference_approved_at: null, reference_revision: material.referenceRevision + 1, reference_lock_token: null, updated_at: new Date().toISOString() }).eq("id", id).eq("reference_revision", material.referenceRevision).select("id");
    checkDatabase(error); if (!data?.length) throw new HomeworkError(409, "기준풀이가 변경되었습니다. 새로고침해 주세요.");
    after(() => processHomeworkReference(auth.supabase, id));
    return NextResponse.json({ ok: true, processing: true }, { status: 202 });
  } catch (error) { return homeworkErrorResponse(error); }
}

export async function PATCH(request: Request, context: Context) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  try {
    const id = requireHomeworkId((await context.params).id);
    const body = await readHomeworkBody(request);
    const material = await getHomeworkMaterial(auth.supabase, id);
    if (!Number.isInteger(body.revision) || body.revision !== material.referenceRevision || typeof body.approve !== "boolean" || !Array.isArray(body.reference)) throw new HomeworkError(409, "기준풀이를 새로 불러와서 다시 확인해 주세요.");
    const numbers = validateQuestionNumbers(body.reference.map(row => (row as Record<string, unknown>)?.questionNumber));
    if (JSON.stringify(numbers) !== JSON.stringify(material.questionNumbers)) throw new HomeworkError(400, "등록한 문항번호 순서와 기준풀이 문항번호를 맞춰 주세요.");
    const reference = normalizeReference(body.reference, material.questionNumbers);
    if (reference.some(row => row.sourcePages.some(page => page > material.pdfPages))) throw new HomeworkError(400, "원본 PDF 페이지 번호를 확인해 주세요.");
    if (body.approve && reference.some(row => row.needsReview || !row.problem || !row.answer || !row.solution || !row.sourcePages.length)) throw new HomeworkError(400, "모든 문항의 문제·정답·풀이·원본 페이지와 확인 표시를 완료해 주세요.");
    const now = new Date().toISOString();
    const { data, error } = await auth.supabase.from("homework_materials").update({ reference, reference_status: body.approve ? "approved" : "draft", reference_error: null, reference_approved_at: body.approve ? now : null, reference_revision: material.referenceRevision + 1, reference_lock_token: null, updated_at: now }).eq("id", id).eq("reference_revision", material.referenceRevision).select("id");
    checkDatabase(error); if (!data?.length) throw new HomeworkError(409, "다른 기준풀이 수정이 저장되었습니다. 새로고침해 주세요.");
    return NextResponse.json({ ok: true, material: await getHomeworkMaterial(auth.supabase, id) });
  } catch (error) { return homeworkErrorResponse(error); }
}
