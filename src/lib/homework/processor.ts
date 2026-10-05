import type { SupabaseClient } from "@supabase/supabase-js";
import { GEMINI_MODEL } from "@/lib/ai/gemini";
import { generateHomeworkFeedback, generateHomeworkReference } from "@/lib/homework/ai";
import { loadHomeworkSettings } from "@/lib/homework/server";
import { normalizeReference, validateQuestionNumbers } from "@/lib/homework/core.mjs";
import { HOMEWORK_BUCKET, HOMEWORK_MAX_BYTES } from "@/types/homework";

export function homeworkAiError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (/API.key|API_KEY|credentials|401|403/i.test(message)) return "숙제 AI 서버 설정을 확인해 주세요. 직접 첨삭은 계속 사용할 수 있습니다.";
  if (/429|RESOURCE_EXHAUSTED|quota/i.test(message)) return "AI 사용 한도에 도달했습니다. 잠시 후 다시 시도하거나 직접 첨삭해 주세요.";
  if (/timeout|deadline|abort|503|500|UNAVAILABLE/i.test(message)) return "AI 처리가 지연되거나 중단되었습니다. 재시도하거나 직접 첨삭해 주세요.";
  if (/AI 응답/.test(message)) return message.slice(0, 200);
  return "AI 피드백을 생성하지 못했습니다. 재시도하거나 직접 첨삭해 주세요.";
}

async function downloadPdf(supabase: SupabaseClient, path: string): Promise<Buffer> {
  const { data, error } = await supabase.storage.from(HOMEWORK_BUCKET).download(path);
  if (error || !data) throw new Error("PDF를 읽지 못했습니다.");
  if (data.size < 8 || data.size > HOMEWORK_MAX_BYTES) throw new Error("PDF 크기를 확인해 주세요.");
  const buffer = Buffer.from(await data.arrayBuffer());
  if (!buffer.subarray(0, 1024).includes(Buffer.from("%PDF-"))) throw new Error("PDF 형식을 확인해 주세요.");
  return buffer;
}

export async function processHomeworkReference(supabase: SupabaseClient, materialId: string): Promise<void> {
  const lock = crypto.randomUUID();
  const { data: claimed, error: claimError } = await supabase.rpc("homework_claim_reference", { p_material_id: materialId, p_lock_token: lock });
  if (claimError || claimed !== true) return;
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("AI_KEY missing");
    if (!(await loadHomeworkSettings(supabase)).aiEnabled) throw new Error("AI 처리가 중단되었습니다.");
    const { data: material, error } = await supabase.from("homework_materials").select("*").eq("id", materialId).single();
    if (error || !material) throw new Error("자료를 찾지 못했습니다.");
    const revision = Number(material.reference_revision);
    const numbers = validateQuestionNumbers(material.question_numbers);
    const pdf = await downloadPdf(supabase, material.pdf_path);
    const generated = await generateHomeworkReference(pdf, numbers);
    const reference = generated.map(row => ({ ...row, needsReview: true,
      sourcePages: row.sourcePages.filter(page => page <= material.pdf_pages),
      reviewReason: [row.reviewReason, row.sourcePages.some(page => page > material.pdf_pages) ? "원본 페이지를 확인해 주세요." : "", "AI가 만든 기준풀이입니다. 원본 문제·정답·풀이를 선생님이 확인해 주세요."].filter(Boolean).join(" "),
    }));
    if (!(await loadHomeworkSettings(supabase)).aiEnabled) throw new Error("AI 처리가 중단되었습니다.");
    const saved = await supabase.from("homework_materials").update({ reference, reference_status: "draft", reference_error: null, reference_approved_at: null, reference_revision: revision + 1, reference_lock_token: null, updated_at: new Date().toISOString() }).eq("id", materialId).eq("reference_lock_token", lock).eq("reference_revision", revision);
    if (saved.error) throw saved.error;
  } catch (error) {
    await supabase.from("homework_materials").update({ reference_status: "failed", reference_error: homeworkAiError(error), reference_lock_token: null, updated_at: new Date().toISOString() }).eq("id", materialId).eq("reference_lock_token", lock);
  }
}

export async function processHomeworkSubmission(supabase: SupabaseClient, submissionId: string): Promise<void> {
  const lock = crypto.randomUUID();
  const { data: claimed, error: claimError } = await supabase.rpc("homework_claim_submission", { p_submission_id: submissionId, p_lock_token: lock });
  if (claimError || claimed !== true) return;
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("AI_KEY missing");
    const { data: submission, error } = await supabase.from("homework_submissions").select("*").eq("id", submissionId).single();
    if (error || !submission) throw new Error("제출물을 찾지 못했습니다.");
    const { data: assignment } = await supabase.from("homework_assignments").select("*").eq("id", submission.assignment_id).single();
    const settings = await loadHomeworkSettings(supabase);
    if (!assignment || !assignment.ai_enabled || !settings.aiEnabled) {
      await supabase.from("homework_submissions").update({ ai_status: "disabled", ai_lock_token: null }).eq("id", submissionId).eq("ai_lock_token", lock);
      return;
    }
    const { data: material } = await supabase.from("homework_materials").select("*").eq("id", assignment.material_id).single();
    if (!material) throw new Error("문제 자료를 찾지 못했습니다.");
    const numbers = validateQuestionNumbers(material.question_numbers);
    const referenceRevision = Number(material.reference_revision);
    const startedRevision = Number(submission.feedback_revision);
    const [questionPdf, submissionPdf] = await Promise.all([downloadPdf(supabase, material.pdf_path), downloadPdf(supabase, submission.pdf_path)]);
    const feedback = await generateHomeworkFeedback({ questionPdf, submissionPdf, numbers, reference: normalizeReference(material.reference, numbers), referenceApproved: material.reference_status === "approved", settings, submissionPages: submission.pdf_pages });
    const currentSettings = await loadHomeworkSettings(supabase);
    const { data: currentAssignment } = await supabase.from("homework_assignments").select("ai_enabled").eq("id", assignment.id).single();
    const { data: recipient } = await supabase.from("homework_recipients").select("latest_submission_id").eq("assignment_id", assignment.id).eq("user_id", submission.user_id).single();
    if (!currentSettings.aiEnabled || !currentAssignment?.ai_enabled || recipient?.latest_submission_id !== submissionId) {
      await supabase.from("homework_submissions").update({ ai_status: "disabled", ai_lock_token: null }).eq("id", submissionId).eq("ai_lock_token", lock).eq("feedback_revision", startedRevision);
      return;
    }
    const finalFeedback = feedback.map(row => {
      const reason = JSON.stringify(currentSettings) !== JSON.stringify(settings) ? "처리 중 AI 설정이 변경되었습니다." : assignment.release_mode === "review" ? "선생님 검토 후 발송하는 숙제입니다." : "";
      return reason ? { ...row, needsReview: true, reviewReason: [row.reviewReason, reason].filter(Boolean).join(" ") } : row;
    });
    const saved = await supabase.from("homework_submissions").update({ draft_feedback: finalFeedback, ai_status: "draft", ai_error: null, ai_model: GEMINI_MODEL, reference_revision: referenceRevision, settings_snapshot: settings }).eq("id", submissionId).eq("ai_status", "processing").eq("ai_lock_token", lock).eq("feedback_revision", startedRevision).select("id");
    if (saved.error) throw saved.error;
    if (!saved.data?.length) return; // The teacher edited this submission while AI was running.
    const publication = await supabase.rpc("homework_publish_feedback", { p_submission_id: submissionId, p_expected_revision: startedRevision, p_lock_token: lock, p_reference_revision: referenceRevision });
    if (publication.error || publication.data !== true) {
      await supabase.from("homework_submissions").update({ draft_feedback: finalFeedback.map(row => ({ ...row, needsReview: true, reviewReason: row.reviewReason || "선생님이 확인한 후 발송해 주세요." })), ai_lock_token: null }).eq("id", submissionId).eq("feedback_revision", startedRevision).eq("ai_lock_token", lock).is("published_at", null);
    }
  } catch (error) {
    await supabase.from("homework_submissions").update({ ai_status: "failed", ai_error: homeworkAiError(error), ai_lock_token: null }).eq("id", submissionId).eq("ai_lock_token", lock).eq("ai_status", "processing");
  }
}
