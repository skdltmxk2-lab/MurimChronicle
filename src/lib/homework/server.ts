import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_HOMEWORK_SETTINGS, HOMEWORK_BUCKET, HOMEWORK_MAX_BYTES, HOMEWORK_MAX_PAGES,
  type HomeworkAssignment, type HomeworkFeedback, type HomeworkMaterial, type HomeworkSettings,
  type HomeworkSubmission, type StudentHomework,
} from "@/types/homework";
import { validateQuestionNumbers, validateSettings } from "@/lib/homework/core.mjs";
import { inspectHomeworkPdf } from "@/lib/homework/pdf-server";

type Row = Record<string, unknown>;
const MATERIAL_SELECT = "id,title,kind,subject,description,question_numbers,pdf_path,pdf_name,pdf_size,pdf_pages,reference,reference_status,reference_error,reference_revision,reference_started_at,created_at";
const SETTINGS_KEY = "homework_ai_settings";
const INTERRUPTED_MESSAGE = "AI 처리가 중단되었습니다. 다시 생성하거나 직접 첨삭해 주세요.";

export class HomeworkError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function homeworkErrorResponse(error: unknown) {
  return NextResponse.json({ ok: false, message: error instanceof HomeworkError ? error.message : "숙제 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." }, { status: error instanceof HomeworkError ? error.status : 500 });
}
export function checkDatabase(error: { code?: string; message?: string } | null) {
  if (!error) return;
  const message = error.message ?? "";
  if (["42P01", "42883", "PGRST202", "PGRST205"].includes(error.code ?? "")) throw new HomeworkError(503, "숙제 기능을 준비 중입니다. 관리자에게 알려 주세요.");
  if (message.includes("HOMEWORK_REVISION_CONFLICT")) throw new HomeworkError(409, "다른 수정 사항이 저장되었습니다. 새로고침 후 다시 확인해 주세요.");
  if (message.includes("HOMEWORK_STALE_SUBMISSION")) throw new HomeworkError(409, "학생이 새 풀이를 제출했습니다. 최신 제출을 확인해 주세요.");
  if (message.includes("HOMEWORK_UPLOAD_INVALID")) throw new HomeworkError(409, "업로드가 만료되었거나 이미 사용되었습니다. PDF를 다시 선택해 주세요.");
  if (message.includes("HOMEWORK_SUBMISSION_RATE")) throw new HomeworkError(429, "풀이 제출은 1분 간격, 하루 최대 20회 가능합니다. 잠시 후 다시 제출해 주세요.");
  if (message.includes("HOMEWORK_UPLOAD_RATE")) throw new HomeworkError(429, "PDF 업로드 한도에 도달했습니다. 학생은 1시간 10회, 하루 30회까지 업로드할 수 있습니다.");
  if (message.includes("HOMEWORK_FEEDBACK_NOT_READY")) throw new HomeworkError(400, "모든 문항의 피드백과 확인 표시를 완료한 후 보내 주세요.");
  if (message.includes("HOMEWORK_STUDENTS_INVALID")) throw new HomeworkError(400, "가입된 학생을 선택해 주세요. 관리자 계정에는 숙제를 배부할 수 없습니다.");
  if (message.includes("HOMEWORK_FORBIDDEN") || error.code === "42501") throw new HomeworkError(403, "이 숙제에 접근할 권한이 없습니다.");
  if (message.includes("HOMEWORK_NOT_FOUND") || error.code === "23503") throw new HomeworkError(404, "숙제 또는 학생 정보를 찾을 수 없습니다.");
  throw new HomeworkError(500, "숙제 정보를 저장하거나 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
}
export function requireHomeworkId(value: unknown): string {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) throw new HomeworkError(400, "올바른 숙제 정보를 선택해 주세요.");
  return value;
}
export async function readHomeworkBody(request: Request): Promise<Row> {
  const raw = await request.json().catch(() => null);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new HomeworkError(400, "입력 내용을 확인해 주세요.");
  return raw as Row;
}
function text(value: unknown, max: number, required = false): string {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new HomeworkError(400, `입력 내용은 ${max}자 이내로 작성해 주세요.`);
  return value.trim();
}
function dueDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(value) || !Number.isFinite(Date.parse(value))) throw new HomeworkError(400, "마감일을 확인해 주세요.");
  return new Date(value).toISOString();
}
function array<T>(value: unknown): T[] { return Array.isArray(value) ? value as T[] : []; }
export function homeworkProcessingState<T extends string>(status: T, startedAt: unknown, createdAt: unknown, now = Date.now()): { status: T | "failed"; interrupted: boolean } {
  const timestamp = Date.parse(String(status === "processing" ? startedAt : createdAt));
  const interrupted = status === "processing" ? !Number.isFinite(timestamp) || now - timestamp >= 15 * 60 * 1000 : status === "pending" && Number.isFinite(timestamp) && now - timestamp >= 15 * 60 * 1000;
  return { status: interrupted ? "failed" : status, interrupted };
}
export function mapMaterial(row: Row): HomeworkMaterial {
  const state = homeworkProcessingState(row.reference_status as HomeworkMaterial["referenceStatus"],row.reference_started_at,row.created_at);
  return { id: String(row.id), title: String(row.title ?? ""), kind: row.kind === "daily" ? "daily" : "homework", subject: String(row.subject ?? ""), description: String(row.description ?? ""), questionNumbers: array<string>(row.question_numbers), pdfName: String(row.pdf_name ?? ""), pdfSize: Number(row.pdf_size), pdfPages: Number(row.pdf_pages), reference: array<HomeworkMaterial["reference"][number]>(row.reference), referenceStatus: state.status, referenceError: state.interrupted ? INTERRUPTED_MESSAGE : typeof row.reference_error === "string" ? row.reference_error : null, referenceRevision: Number(row.reference_revision ?? 0), createdAt: String(row.created_at) };
}
export async function getHomeworkMaterial(supabase: SupabaseClient, id: string): Promise<HomeworkMaterial> {
  const { data, error } = await supabase.from("homework_materials").select(MATERIAL_SELECT).eq("id", requireHomeworkId(id)).maybeSingle();
  checkDatabase(error); if (!data) throw new HomeworkError(404, "자료를 찾을 수 없습니다."); return mapMaterial(data as Row);
}
export async function loadHomeworkSettings(supabase: SupabaseClient): Promise<HomeworkSettings> {
  const { data, error } = await supabase.from("app_settings").select("value").eq("key", SETTINGS_KEY).maybeSingle();
  checkDatabase(error);
  if (!data) return { ...DEFAULT_HOMEWORK_SETTINGS };
  try { return validateSettings(JSON.parse(String(data.value))); } catch { throw new HomeworkError(503, "AI 피드백 설정을 다시 저장해 주세요."); }
}
async function isAdmin(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", userId).maybeSingle();
  checkDatabase(error); return data?.is_admin === true;
}
async function recipient(supabase: SupabaseClient, assignmentId: string, userId: string) {
  const { data, error } = await supabase.from("homework_recipients").select("assignment_id,user_id,latest_submission_id").eq("assignment_id", assignmentId).eq("user_id", userId).maybeSingle();
  checkDatabase(error); if (!data) throw new HomeworkError(404, "배부된 숙제를 찾을 수 없습니다."); return data as Row;
}
async function assignments(supabase: SupabaseClient, id?: string): Promise<HomeworkAssignment[]> {
  let query = supabase.from("homework_assignments").select("id,material_id,instructions,due_at,ai_enabled,release_mode,created_at").order("created_at", { ascending: false });
  if (id) query = query.eq("id", requireHomeworkId(id));
  const { data, error } = await query; checkDatabase(error); if (!data?.length) return [];
  const ids = data.map(row => row.id); const materialIds = [...new Set(data.map(row => row.material_id))];
  const [materialResult, recipientResult] = await Promise.all([
    supabase.from("homework_materials").select(MATERIAL_SELECT).in("id", materialIds),
    supabase.from("homework_recipients").select("assignment_id,latest_submission_id").in("assignment_id", ids),
  ]);
  checkDatabase(materialResult.error); checkDatabase(recipientResult.error);
  const materials = new Map((materialResult.data ?? []).map(row => [row.id, mapMaterial(row as Row)]));
  return data.map(row => {
    const material = materials.get(row.material_id); if (!material) throw new HomeworkError(404, "배부 자료를 찾을 수 없습니다.");
    const recipients = (recipientResult.data ?? []).filter(r => r.assignment_id === row.id);
    return { id: row.id, materialId: row.material_id, material, instructions: row.instructions, dueAt: row.due_at, aiEnabled: row.ai_enabled, releaseMode: row.release_mode, createdAt: row.created_at, recipientCount: recipients.length, submittedCount: recipients.filter(r => r.latest_submission_id !== null).length } as HomeworkAssignment;
  });
}
export async function listHomeworkAdmin(supabase: SupabaseClient) {
  const [materials, assignmentList, settings] = await Promise.all([
    supabase.from("homework_materials").select(MATERIAL_SELECT).order("created_at", { ascending: false }), assignments(supabase), loadHomeworkSettings(supabase),
  ]);
  checkDatabase(materials.error);
  return { ok: true, materials: (materials.data ?? []).map(row => mapMaterial(row as Row)), assignments: assignmentList, settings, aiAvailable: Boolean(process.env.GEMINI_API_KEY) };
}
async function checkedUpload(supabase: SupabaseClient, actorId: string, uploadId: unknown, purpose: string) {
  const { data, error } = await supabase.from("homework_uploads").select("*").eq("id", requireHomeworkId(uploadId)).eq("owner_id", actorId).eq("purpose", purpose).maybeSingle();
  checkDatabase(error);
  if (!data || data.consumed_at || Date.parse(data.created_at) < Date.now() - 2 * 60 * 60 * 1000) throw new HomeworkError(409, "업로드가 만료되었거나 이미 사용되었습니다. PDF를 다시 선택해 주세요.");
  const file = await supabase.storage.from(HOMEWORK_BUCKET).download(data.pdf_path);
  if (file.error || !file.data) throw new HomeworkError(400, "PDF 업로드가 완료되지 않았습니다. 다시 업로드해 주세요.");
  const bytes = new Uint8Array(await file.data.arrayBuffer());
  if (bytes.byteLength !== data.pdf_size) throw new HomeworkError(400, "PDF 파일 용량이 업로드 정보와 일치하지 않습니다. 다시 업로드해 주세요.");
  let pages: number;
  try { pages = await inspectHomeworkPdf(bytes,Number(data.pdf_pages)); } catch (error) { throw new HomeworkError(400,error instanceof Error ? error.message : "PDF 파일을 확인할 수 없습니다."); }
  if (pages !== data.pdf_pages) {
    const verified = await supabase.from("homework_uploads").update({ pdf_pages:pages }).eq("id",data.id).eq("owner_id",actorId).is("consumed_at",null); checkDatabase(verified.error);
    data.pdf_pages = pages;
  }
  return data as Row;
}
export async function createHomeworkMaterial(supabase: SupabaseClient, actorId: string, body: Row) {
  const title = text(body.title,120,true); const kind = body.kind;
  if (kind !== "homework" && kind !== "daily") throw new HomeworkError(400, "자료 종류를 선택해 주세요.");
  let numbers: string[]; try { numbers = validateQuestionNumbers(body.questionNumbers); } catch (error) { throw new HomeworkError(400,error instanceof Error ? error.message : "문항 번호를 확인해 주세요."); }
  const subject = text(body.subject ?? "",80); const description = text(body.description ?? "",5000);
  await checkedUpload(supabase,actorId,body.uploadId,"material");
  const { data, error } = await supabase.rpc("homework_create_material", { p_upload_id: body.uploadId,p_actor_id: actorId,p_title: title,p_kind: kind,p_subject: subject,p_description: description,p_question_numbers: numbers });
  checkDatabase(error); return { ok: true, material: await getHomeworkMaterial(supabase,String(data)) };
}
export async function createHomeworkAssignment(supabase: SupabaseClient, actorId: string, body: Row) {
  const materialId = requireHomeworkId(body.materialId);
  if (!Array.isArray(body.studentIds) || body.studentIds.length < 1 || body.studentIds.length > 1000) throw new HomeworkError(400,"학생을 1명 이상 선택해 주세요.");
  const studentIds = [...new Set(body.studentIds.map(requireHomeworkId))];
  if (typeof body.aiEnabled !== "boolean" || !["review","auto"].includes(String(body.releaseMode))) throw new HomeworkError(400,"AI와 피드백 공개 설정을 확인해 주세요.");
  const { data, error } = await supabase.rpc("homework_create_assignment", { p_actor_id: actorId,p_material_id: materialId,p_student_ids: studentIds,p_instructions: text(body.instructions ?? "",5000),p_due_at: dueDate(body.dueAt),p_ai_enabled: body.aiEnabled,p_release_mode: body.releaseMode });
  checkDatabase(error); const assignment = (await assignments(supabase,String(data)))[0]; return { ok: true, assignment };
}
export async function patchHomeworkAssignment(supabase: SupabaseClient, id: string, body: Row) {
  const updates: Row = {};
  if ("aiEnabled" in body) { if (typeof body.aiEnabled !== "boolean") throw new HomeworkError(400,"AI 설정을 확인해 주세요."); updates.ai_enabled = body.aiEnabled; }
  if ("releaseMode" in body) { if (!["review","auto"].includes(String(body.releaseMode))) throw new HomeworkError(400,"공개 방식을 확인해 주세요."); updates.release_mode = body.releaseMode; }
  if ("dueAt" in body) updates.due_at = dueDate(body.dueAt);
  if (!Object.keys(updates).length) throw new HomeworkError(400,"변경할 설정을 선택해 주세요.");
  const { data, error } = await supabase.from("homework_assignments").update(updates).eq("id",requireHomeworkId(id)).select("id").maybeSingle();
  checkDatabase(error); if (!data) throw new HomeworkError(404,"숙제를 찾을 수 없습니다."); return { ok: true,assignment: (await assignments(supabase,id))[0] };
}
export async function getHomeworkAssignmentDetail(supabase: SupabaseClient, id: string) {
  const assignment = (await assignments(supabase,id))[0]; if (!assignment) throw new HomeworkError(404,"숙제를 찾을 수 없습니다.");
  const [submissionResult, recipientResult] = await Promise.all([
    supabase.from("homework_submissions").select("*").eq("assignment_id",id).order("created_at",{ ascending:false }),
    supabase.from("homework_recipients").select("user_id,latest_submission_id").eq("assignment_id",id),
  ]);
  checkDatabase(submissionResult.error); checkDatabase(recipientResult.error);
  const userIds = [...new Set((recipientResult.data ?? []).map(row => row.user_id))];
  const profiles = userIds.length ? await supabase.from("profiles").select("id,name").in("id",userIds) : { data: [],error:null };
  checkDatabase(profiles.error); const names = new Map((profiles.data ?? []).map(row => [row.id,row.name]));
  const latest = new Set((recipientResult.data ?? []).map(row => row.latest_submission_id));
  const submissions: HomeworkSubmission[] = (submissionResult.data ?? []).map(row => {
    const state = homeworkProcessingState(row.ai_status as HomeworkSubmission["aiStatus"],row.ai_started_at,row.created_at);
    return { id:row.id,assignmentId:row.assignment_id,userId:row.user_id,studentName:names.get(row.user_id) || "학생",attemptNumber:row.attempt_number,pdfName:row.pdf_name,pdfSize:row.pdf_size,pdfPages:row.pdf_pages,aiStatus:state.status,aiError:state.interrupted ? INTERRUPTED_MESSAGE : row.ai_error,aiModel:row.ai_model,draftFeedback:array<HomeworkFeedback>(row.draft_feedback),publishedFeedback:row.published_feedback === null ? null : array<HomeworkFeedback>(row.published_feedback),publishedAt:row.published_at,publishedBy:row.published_by,feedbackRevision:row.feedback_revision,isLatest:latest.has(row.id),isLate:assignment.dueAt !== null && Date.parse(row.created_at) > Date.parse(assignment.dueAt),createdAt:row.created_at };
  });
  return { ok:true,assignment,submissions };
}
export async function saveHomeworkSettings(supabase: SupabaseClient, body: Row) {
  let settings: HomeworkSettings; try { settings = validateSettings(body); } catch (error) { throw new HomeworkError(400,error instanceof Error ? error.message : "AI 설정을 확인해 주세요."); }
  const { error } = await supabase.from("app_settings").upsert({ key:SETTINGS_KEY,value:JSON.stringify(settings),updated_at:new Date().toISOString() });
  checkDatabase(error); return { ok:true,settings };
}
export async function createHomeworkUpload(supabase: SupabaseClient, actorId: string, body: Row) {
  const purpose = body.purpose;
  if (purpose !== "material" && purpose !== "submission") throw new HomeworkError(400,"업로드 종류를 확인해 주세요.");
  const name = text(body.name,200,true);
  if (!/\.pdf$/i.test(name) || !Number.isInteger(body.size) || Number(body.size) < 5 || Number(body.size) > HOMEWORK_MAX_BYTES || !Number.isInteger(body.pages) || Number(body.pages) < 1 || Number(body.pages) > HOMEWORK_MAX_PAGES) throw new HomeworkError(400,"PDF는 15MB, 50페이지 이내로 업로드해 주세요.");
  let assignmentId: string | null = null;
  if (purpose === "material") { if (!await isAdmin(supabase,actorId)) throw new HomeworkError(403,"관리자만 자료를 등록할 수 있습니다."); }
  else { assignmentId = requireHomeworkId(body.assignmentId); await recipient(supabase,assignmentId,actorId); }
  const uploadId = randomUUID(); const path = purpose === "material" ? `materials/${uploadId}.pdf` : `submissions/${actorId}/${assignmentId}/${uploadId}.pdf`;
  const { error } = await supabase.rpc("homework_issue_upload",{ p_upload_id:uploadId,p_actor_id:actorId,p_purpose:purpose,p_assignment_id:assignmentId,p_pdf_path:path,p_pdf_name:name,p_pdf_size:body.size,p_pdf_pages:body.pages });
  checkDatabase(error); const signed = await supabase.storage.from(HOMEWORK_BUCKET).createSignedUploadUrl(path,{ upsert:false });
  if (signed.error || !signed.data) { await supabase.from("homework_uploads").delete().eq("id",uploadId).eq("owner_id",actorId); throw new HomeworkError(503,"PDF 저장소 설치가 필요하거나 연결되지 않았습니다. 관리자에게 알려 주세요."); }
  return { ok:true,uploadId,bucket:HOMEWORK_BUCKET,path,token:signed.data.token };
}
export async function getHomeworkFile(supabase: SupabaseClient, actorId: string, params: URLSearchParams) {
  const admin = await isAdmin(supabase,actorId); const assignmentId = params.get("assignmentId"); const materialId = params.get("materialId"); const submissionId = params.get("submissionId");
  if ([assignmentId,materialId,submissionId].filter(Boolean).length !== 1) throw new HomeworkError(400,"열람할 PDF를 선택해 주세요.");
  let path = "";
  if (submissionId) {
    let query = supabase.from("homework_submissions").select("pdf_path,user_id,assignment_id").eq("id",requireHomeworkId(submissionId)); if (!admin) query = query.eq("user_id",actorId);
    const { data,error } = await query.maybeSingle(); checkDatabase(error); if (!data) throw new HomeworkError(404,"제출 PDF를 찾을 수 없습니다."); if (!admin) await recipient(supabase,data.assignment_id,actorId); path = data.pdf_path;
  } else {
    let targetMaterial = materialId;
    if (assignmentId) {
      requireHomeworkId(assignmentId); if (!admin) await recipient(supabase,assignmentId,actorId);
      const { data,error } = await supabase.from("homework_assignments").select("material_id").eq("id",assignmentId).maybeSingle(); checkDatabase(error); if (!data) throw new HomeworkError(404,"배부 자료를 찾을 수 없습니다."); targetMaterial = data.material_id;
    } else if (!admin) {
      const { data,error } = await supabase.from("homework_assignments").select("id").eq("material_id",requireHomeworkId(materialId)); checkDatabase(error);
      const ids = (data ?? []).map(row => row.id); if (!ids.length) throw new HomeworkError(404,"배부 자료를 찾을 수 없습니다.");
      const allowed = await supabase.from("homework_recipients").select("assignment_id").eq("user_id",actorId).in("assignment_id",ids).limit(1); checkDatabase(allowed.error); if (!allowed.data?.length) throw new HomeworkError(404,"배부 자료를 찾을 수 없습니다.");
    }
    const { data,error } = await supabase.from("homework_materials").select("pdf_path").eq("id",requireHomeworkId(targetMaterial)).maybeSingle(); checkDatabase(error); if (!data) throw new HomeworkError(404,"자료 PDF를 찾을 수 없습니다."); path = data.pdf_path;
  }
  const { data,error } = await supabase.storage.from(HOMEWORK_BUCKET).createSignedUrl(path,300); if (error || !data) throw new HomeworkError(503,"PDF를 열 수 없습니다. 잠시 후 다시 시도해 주세요."); return { ok:true,url:data.signedUrl };
}
export async function listStudentHomework(supabase: SupabaseClient, actorId: string) {
  const recipients = await supabase.from("homework_recipients").select("assignment_id").eq("user_id",actorId); checkDatabase(recipients.error);
  const ids = (recipients.data ?? []).map(row => row.assignment_id); if (!ids.length) return { ok:true,homework:[] };
  const [assignmentResult, submissionResult] = await Promise.all([
    supabase.from("homework_assignments").select("id,material_id,instructions,due_at,created_at").in("id",ids).order("created_at",{ ascending:false }),
    supabase.from("homework_submissions").select("id,assignment_id,attempt_number,pdf_name,ai_status,ai_started_at,published_feedback,published_at,created_at").eq("user_id",actorId).in("assignment_id",ids).order("attempt_number",{ ascending:false }),
  ]);
  checkDatabase(assignmentResult.error); checkDatabase(submissionResult.error);
  const materialIds = [...new Set((assignmentResult.data ?? []).map(row => row.material_id))];
  const materials = materialIds.length ? await supabase.from("homework_materials").select("id,title,kind,subject,question_numbers,pdf_name").in("id",materialIds) : { data:[],error:null };
  checkDatabase(materials.error); const byId = new Map((materials.data ?? []).map(row => [row.id,row]));
  const homework: StudentHomework[] = (assignmentResult.data ?? []).map(row => {
    const material = byId.get(row.material_id); if (!material) throw new HomeworkError(404,"배부 자료를 찾을 수 없습니다.");
    return { id:row.id,title:material.title,kind:material.kind,subject:material.subject,instructions:row.instructions,questionNumbers:array<string>(material.question_numbers),dueAt:row.due_at,pdfName:material.pdf_name,createdAt:row.created_at,
      submissions:(submissionResult.data ?? []).filter(s => s.assignment_id === row.id).map(s => ({ id:s.id,attemptNumber:s.attempt_number,pdfName:s.pdf_name,aiStatus:homeworkProcessingState(s.ai_status,s.ai_started_at,s.created_at).status,publishedFeedback:s.published_at && s.published_feedback ? array<HomeworkFeedback>(s.published_feedback) : null,publishedAt:s.published_at,createdAt:s.created_at,isLate:row.due_at !== null && Date.parse(s.created_at) > Date.parse(row.due_at) })) } as StudentHomework;
  });
  return { ok:true,homework };
}
export async function finalizeHomeworkSubmission(supabase: SupabaseClient, actorId: string, assignmentId: string, body: Row) {
  requireHomeworkId(assignmentId); await recipient(supabase,assignmentId,actorId);
  const ticket = await checkedUpload(supabase,actorId,body.uploadId,"submission"); if (ticket.assignment_id !== assignmentId) throw new HomeworkError(400,"이 숙제에 업로드한 PDF를 선택해 주세요.");
  const { data,error } = await supabase.rpc("homework_finalize_submission",{ p_upload_id:body.uploadId,p_actor_id:actorId }); checkDatabase(error); return { ok:true,submissionId:String(data) };
}
export async function saveHomeworkFeedback(supabase: SupabaseClient, actorId: string, submissionId: string, body: Row) {
  requireHomeworkId(submissionId);
  if (!Number.isInteger(body.revision) || Number(body.revision) < 0 || typeof body.publish !== "boolean" || !Array.isArray(body.feedback)) throw new HomeworkError(400,"피드백 저장 정보를 확인해 주세요.");
  const submission = await supabase.from("homework_submissions").select("assignment_id,pdf_pages").eq("id",submissionId).maybeSingle(); checkDatabase(submission.error); if (!submission.data) throw new HomeworkError(404,"제출을 찾을 수 없습니다.");
  const assignment = (await assignments(supabase,submission.data.assignment_id))[0];
  const raw = body.feedback as unknown[]; let numbers: string[];
  try { numbers = validateQuestionNumbers(raw.map(row => row && typeof row === "object" ? (row as Row).questionNumber : null)); } catch { throw new HomeworkError(400,"문항 번호가 누락되었거나 중복되었습니다."); }
  if (numbers.length !== assignment.material.questionNumbers.length || numbers.some(n => !assignment.material.questionNumbers.includes(n))) throw new HomeworkError(400,"배부한 모든 문항의 피드백을 작성해 주세요.");
  const verdicts = ["correct","partial","incorrect","unreadable","missing","review"];
  const feedback = raw.map(value => {
    const row = value as Row;
    if (!verdicts.includes(String(row.verdict)) || typeof row.needsReview !== "boolean" || typeof row.verified !== "boolean" || !Array.isArray(row.sourcePages) || row.sourcePages.some(p => !Number.isInteger(p) || Number(p) < 1 || Number(p) > Number(submission.data?.pdf_pages))) throw new HomeworkError(400,"문항별 판정과 확인 표시를 점검해 주세요.");
    const item: Row = { questionNumber:row.questionNumber,verdict:row.verdict,needsReview:row.needsReview,verified:row.verified,sourcePages:row.sourcePages };
    for (const key of ["studentWork","errorStep","reason","hint","comment","reviewReason"]) item[key] = text(row[key],key === "studentWork" ? 24000 : 12000);
    if (body.publish && (!String(item.comment).trim() || item.needsReview !== false || item.verified !== true)) throw new HomeworkError(400,"모든 문항에 피드백을 작성하고 확인 완료를 표시해 주세요.");
    return item;
  });
  const { data,error } = await supabase.rpc("homework_save_feedback",{ p_submission_id:submissionId,p_actor_id:actorId,p_feedback:feedback,p_expected_revision:body.revision,p_publish:body.publish }); checkDatabase(error); return { ok:true,revision:Number(data),published:body.publish };
}
