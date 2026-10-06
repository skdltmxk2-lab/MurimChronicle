import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { archiveHomeworkMaterial, HomeworkError, homeworkErrorResponse, readHomeworkBody } from "@/lib/homework/server";
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  try { return NextResponse.json(await archiveHomeworkMaterial(auth.supabase,auth.userId,(await context.params).id)); } catch (error) { return homeworkErrorResponse(error); }
}
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  try {
    if ((await readHomeworkBody(request)).restore !== true) throw new HomeworkError(400,"복구할 자료를 확인해 주세요.");
    return NextResponse.json(await archiveHomeworkMaterial(auth.supabase,auth.userId,(await context.params).id,true));
  } catch (error) { return homeworkErrorResponse(error); }
}
