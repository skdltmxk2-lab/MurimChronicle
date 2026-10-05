import { after, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { loadHomeworkSettings, checkDatabase, HomeworkError, homeworkErrorResponse, requireHomeworkId } from "@/lib/homework/server";
import { processHomeworkSubmission } from "@/lib/homework/processor";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  try {
    const id = requireHomeworkId((await context.params).id);
    if (!process.env.GEMINI_API_KEY) throw new HomeworkError(503, "숙제 AI 서버 설정이 필요합니다. 직접 첨삭은 사용할 수 있습니다.");
    if (!(await loadHomeworkSettings(auth.supabase)).aiEnabled) throw new HomeworkError(409, "AI 피드백 생성 설정을 먼저 켜 주세요.");
    const { data: submission, error } = await auth.supabase.from("homework_submissions").select("assignment_id,user_id,ai_status,ai_started_at,feedback_revision,published_at").eq("id", id).maybeSingle();
    checkDatabase(error); if (!submission) throw new HomeworkError(404, "제출물을 찾지 못했습니다.");
    const { data: recipient, error: recipientError } = await auth.supabase.from("homework_recipients").select("latest_submission_id").eq("assignment_id", submission.assignment_id).eq("user_id", submission.user_id).maybeSingle(); checkDatabase(recipientError);
    if (recipient?.latest_submission_id !== id) throw new HomeworkError(409, "최신 제출물을 선택해 주세요.");
    const { data: assignment, error: assignmentError } = await auth.supabase.from("homework_assignments").select("ai_enabled").eq("id", submission.assignment_id).single(); checkDatabase(assignmentError);
    if (!assignment?.ai_enabled) throw new HomeworkError(409, "이 숙제의 AI 피드백 설정을 먼저 켜 주세요.");
    if (submission.ai_status === "processing" && submission.ai_started_at && Date.parse(submission.ai_started_at) > Date.now() - 15 * 60 * 1000) return NextResponse.json({ ok: true, processing: true });
    // AI must not replace feedback that has already been released by the teacher.
    if (submission.published_at) throw new HomeworkError(409, "이미 발송한 제출물입니다. 새 제출물에서 검토해 주세요.");
    const { data: saved, error: saveError } = await auth.supabase.from("homework_submissions").update({ ai_status: "pending", ai_error: null, ai_lock_token: null, feedback_revision: submission.feedback_revision + 1 }).eq("id", id).eq("feedback_revision", submission.feedback_revision).is("published_at", null).select("id");
    checkDatabase(saveError); if (!saved?.length) throw new HomeworkError(409, "피드백이 변경되었습니다. 새로고침해 주세요.");
    after(() => processHomeworkSubmission(auth.supabase, id));
    return NextResponse.json({ ok: true, processing: true }, { status: 202 });
  } catch (error) { return homeworkErrorResponse(error); }
}
