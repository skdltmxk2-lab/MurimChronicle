import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { homeworkErrorResponse, readHomeworkBody, saveHomeworkFeedback } from "@/lib/homework/server";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  try { return NextResponse.json(await saveHomeworkFeedback(auth.supabase, auth.userId, (await context.params).id, await readHomeworkBody(request))); } catch (error) { return homeworkErrorResponse(error); }
}
