import { NextResponse, after } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { finalizeHomeworkSubmission, homeworkErrorResponse, readHomeworkBody } from "@/lib/homework/server";
import { processHomeworkSubmission } from "@/lib/homework/processor";
export const maxDuration = 300;
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request); if (!auth.ok) return auth.response;
  try {
    const result = await finalizeHomeworkSubmission(auth.supabase, auth.userId, (await context.params).id, await readHomeworkBody(request));
    after(() => processHomeworkSubmission(auth.supabase, result.submissionId));
    return NextResponse.json(result);
  } catch (error) { return homeworkErrorResponse(error); }
}
