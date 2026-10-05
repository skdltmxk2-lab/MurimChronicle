import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getHomeworkAssignmentDetail, homeworkErrorResponse, patchHomeworkAssignment, readHomeworkBody } from "@/lib/homework/server";
export const dynamic = "force-dynamic";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  try { return NextResponse.json(await getHomeworkAssignmentDetail(auth.supabase, (await context.params).id), { headers: { "Cache-Control": "private, no-store" } }); } catch (error) { return homeworkErrorResponse(error); }
}
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  try { return NextResponse.json(await patchHomeworkAssignment(auth.supabase, (await context.params).id, await readHomeworkBody(request))); } catch (error) { return homeworkErrorResponse(error); }
}
