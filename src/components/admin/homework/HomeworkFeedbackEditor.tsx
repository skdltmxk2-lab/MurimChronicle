"use client";

import { useEffect, useState } from "react";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import { HOMEWORK_VERDICT_LABELS, type HomeworkAssignment, type HomeworkFeedback, type HomeworkSubmission, type HomeworkVerdict } from "@/types/homework";
import { buttonClass, emptyFeedback, errorMessage, Field, formatHomeworkDate, homeworkApi, HomeworkRequestError, inputClass, Notice, PageNumbersField, PdfViewer, secondaryClass, useHomeworkDraftWarning } from "./HomeworkShared";

const feedbackDrafts = new Map<string, { rows: HomeworkFeedback[]; revision: number }>();

function alignFeedback(submission: HomeworkSubmission, assignment: HomeworkAssignment) {
  return assignment.material.questionNumbers.map((number) => submission.draftFeedback.find((row) => row.questionNumber === number) || emptyFeedback(number));
}

export function HomeworkFeedbackEditor({ submission, assignment, aiAvailable, globallyEnabled, refresh }: { submission: HomeworkSubmission; assignment: HomeworkAssignment; aiAvailable: boolean; globallyEnabled: boolean; refresh: () => Promise<void> }) {
  const [draft, setDraft] = useState<HomeworkFeedback[]>(() => feedbackDrafts.get(submission.id)?.rows || alignFeedback(submission, assignment));
  const [revision, setRevision] = useState(() => feedbackDrafts.get(submission.id)?.revision ?? submission.feedbackRevision);
  const [dirty, setDirty] = useState(() => feedbackDrafts.has(submission.id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [invalidPages, setInvalidPages] = useState<Record<string, boolean>>({});
  const processing = submission.aiStatus === "pending" || submission.aiStatus === "processing";
  const conflict = submission.feedbackRevision > revision;
  const canPublish = submission.isLatest && !conflict && !Object.values(invalidPages).some(Boolean) && draft.every((row) => !row.needsReview && row.verified && row.comment.trim());
  useHomeworkDraftWarning(dirty);
  useEffect(() => { if (dirty) feedbackDrafts.set(submission.id, { rows: draft, revision }); else feedbackDrafts.delete(submission.id); }, [dirty, draft, revision, submission.id]);
  useEffect(() => { if (!dirty && submission.feedbackRevision >= revision) { setDraft(alignFeedback(submission, assignment)); setRevision(submission.feedbackRevision); } }, [submission, assignment, revision, dirty]);
  function edit(index: number, patch: Partial<HomeworkFeedback>) { setDraft((rows) => rows.map((row, i) => i === index ? { ...row, ...patch, needsReview: true, verified: false } : row)); setDirty(true); setMessage(""); }
  function check(index: number, done: boolean) { setDraft((rows) => rows.map((row, i) => i === index ? { ...row, needsReview: !done, verified: done, reviewReason: done ? "" : "선생님 확인이 필요합니다." } : row)); setDirty(true); }
  async function save(publish: boolean) {
    setError(""); setMessage("");
    if (Object.values(invalidPages).some(Boolean)) { setError("원본 페이지 입력을 확인해 주세요."); return; }
    if (publish && !canPublish) { setError("최신 제출의 모든 문항에 학생용 피드백을 작성하고 검토 완료를 표시해 주세요."); return; }
    setBusy(true);
    try {
      const result = await homeworkApi<{ revision: number }>(`/api/admin/homework/submissions/${submission.id}/feedback`, { method: "POST", body: JSON.stringify({ feedback: draft, revision, publish }) });
      setRevision(result.revision); setDirty(false); setMessage(publish ? "문항별 피드백을 학생에게 발송했습니다." : "피드백 초안을 저장했습니다. 학생에게는 아직 보내지 않았습니다."); await refresh();
    } catch (e) { setError(errorMessage(e)); if (e instanceof HomeworkRequestError && e.status === 409) await refresh().catch(() => undefined); } finally { setBusy(false); }
  }
  async function retryAi() {
    setBusy(true); setError(""); setMessage("");
    try { await homeworkApi(`/api/admin/homework/submissions/${submission.id}/ai`, { method: "POST" }); await refresh(); setMessage("AI 첨삭을 시작했습니다. 완료되면 초안을 확인할 수 있습니다."); }
    catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  const reviewed = draft.filter((row) => !row.needsReview && row.comment.trim()).length;
  return <div className="space-y-4 border-t border-line pt-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-black text-ink">{submission.studentName || "학생"} · {submission.attemptNumber}차 제출</h3><p className="mt-1 text-xs text-slate-500">{submission.pdfPages}페이지 · {submission.pdfName} · 검토 {reviewed}/{draft.length}문항</p></div><button type="button" onClick={() => void retryAi()} disabled={busy || processing || dirty || !submission.isLatest || !aiAvailable || !globallyEnabled || !assignment.aiEnabled} className={secondaryClass}>{processing ? "AI 분석 중..." : submission.draftFeedback.length ? "AI 첨삭 다시 생성" : "AI 첨삭 생성"}</button></div>
    {!submission.isLatest && <Notice>이 파일은 이전 제출입니다. 기록을 열람할 수 있으며, 첨삭 생성과 발송은 최신 제출에서 진행해 주세요.</Notice>}
    {processing && <Notice>AI가 풀이를 분석하고 있습니다. 직접 첨삭도 가능합니다. 직접 작성한 초안을 저장하면 이후 AI 결과가 수정 내용을 덮어쓰지 않습니다.</Notice>}
    {!aiAvailable && <Notice>AI 연결이 없어 생성할 수 없습니다. 원본을 보며 직접 피드백을 작성할 수 있습니다.</Notice>}
    {submission.aiError && <Notice error>{submission.aiError}</Notice>}
    {dirty && <p className="text-xs font-bold text-amber-700">저장하지 않은 수정이 있습니다. 수정 내용을 저장한 뒤 AI를 다시 생성할 수 있습니다.</p>}
    {conflict && <Notice error>새 피드백이 저장되어 화면의 수정본과 버전이 다릅니다. 필요한 내용을 보관한 뒤 <button type="button" onClick={() => { setDraft(alignFeedback(submission, assignment)); setRevision(submission.feedbackRevision); setDirty(false); }} className="font-black underline">최신 초안 불러오기</button>를 눌러 주세요.</Notice>}
    {submission.publishedAt && <Notice>최근 발송: {formatHomeworkDate(submission.publishedAt)}. 수정한 초안을 다시 발송하면 학생이 보는 피드백도 갱신됩니다.</Notice>}
    {error && <Notice error>{error}</Notice>}{message && <Notice>{message}</Notice>}
    <div className="grid items-start gap-5 lg:grid-cols-2"><div className="space-y-3 lg:sticky lg:top-4"><PdfViewer submissionId={submission.id} title="학생이 제출한 풀이 PDF" /><details className="rounded-xl border border-line p-3"><summary className="cursor-pointer text-xs font-bold text-brand-700">배부한 문제 PDF 확인</summary><div className="mt-3"><PdfViewer materialId={assignment.material.id} title="배부한 문제 PDF" /></div></details></div>
      <div className="space-y-4">{draft.map((row, index) => <details key={row.questionNumber} open={index === 0} className="rounded-xl border border-line p-4"><summary className="cursor-pointer text-sm font-black text-ink">{row.questionNumber}번 <span className={`ml-2 text-xs ${row.needsReview ? "text-amber-700" : "text-brand-700"}`}>{row.needsReview ? "검토 필요" : "검토 완료"}</span></summary><fieldset disabled={busy || !submission.isLatest} className="mt-4 space-y-3">
        {row.reviewReason && <p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-700">{row.reviewReason}</p>}
        <details className="rounded-lg bg-slate-50 p-3"><summary className="cursor-pointer text-xs font-bold text-slate-500">학생 풀이 판독과 원본 위치 확인{row.sourcePages.length ? ` · ${row.sourcePages.join(", ")}페이지` : ""}</summary><div className="mt-3 space-y-3"><Field label="AI가 읽은 학생 풀이" hint="원본과 다르게 읽힌 부분은 정정할 수 있습니다. 직접 첨삭에서는 비워 두어도 됩니다."><textarea rows={4} maxLength={24000} value={row.studentWork} onChange={(e) => edit(index, { studentWork: e.target.value })} className={inputClass} /></Field>{row.studentWork && <div className="text-sm"><ContentRenderer text={row.studentWork} /></div>}<PageNumbersField value={row.sourcePages} total={submission.pdfPages} onChange={(sourcePages) => edit(index, { sourcePages })} onValidityChange={(valid) => setInvalidPages((previous) => ({ ...previous, [row.questionNumber]: !valid }))} /></div></details>
        <Field label="판정"><select value={row.verdict} onChange={(e) => edit(index, { verdict: e.target.value as HomeworkVerdict })} className={inputClass}>{Object.entries(HOMEWORK_VERDICT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
        <Field label="처음 잘못된 단계"><input maxLength={4000} value={row.errorStep} onChange={(e) => edit(index, { errorStep: e.target.value })} className={inputClass} placeholder="오류가 없다면 비워 두세요." /></Field>
        <Field label="이유"><textarea rows={2} maxLength={12000} value={row.reason} onChange={(e) => edit(index, { reason: e.target.value })} className={inputClass} /></Field>
        <Field label="다음 풀이 힌트"><textarea rows={2} maxLength={12000} value={row.hint} onChange={(e) => edit(index, { hint: e.target.value })} className={inputClass} /></Field>
        <Field label="학생에게 보낼 피드백 (필수)"><textarea rows={4} maxLength={12000} value={row.comment} onChange={(e) => edit(index, { comment: e.target.value })} className={inputClass} placeholder="선생님이 직접 작성하거나 AI 초안을 수정해 주세요." /></Field>
        {row.comment && <details className="rounded-lg bg-brand-50 p-3"><summary className="cursor-pointer text-xs font-bold text-brand-700">학생용 피드백 미리보기</summary><div className="mt-2 text-sm"><ContentRenderer text={row.comment} /></div></details>}
        <label className="flex items-start gap-2 rounded-lg bg-brand-50 p-3 text-sm font-bold text-brand-700"><input type="checkbox" checked={!row.needsReview} onChange={(e) => check(index, e.target.checked)} className="mt-1 h-4 w-4 accent-brand-600" /><span>이 문항의 원본 풀이와 피드백을 검토했습니다.</span></label>
      </fieldset></details>)}
      <div className="sticky bottom-3 space-y-2 rounded-xl border border-line bg-white p-3 shadow-soft"><div className="flex flex-wrap gap-2"><button type="button" onClick={() => void save(false)} disabled={busy || conflict || !submission.isLatest} className={secondaryClass}>{busy ? "저장 중..." : "피드백 초안 저장"}</button><button type="button" onClick={() => void save(true)} disabled={busy || !canPublish} className={buttonClass}>검토 완료 · 학생에게 발송</button></div>{!canPublish && submission.isLatest && <p className="text-xs leading-5 text-slate-500">모든 문항의 학생용 피드백과 검토 완료 표시가 필요합니다.</p>}</div>
      {submission.publishedFeedback && <details className="rounded-xl border border-line p-4"><summary className="cursor-pointer text-sm font-bold text-slate-600">학생에게 발송한 피드백 보기</summary><div className="mt-3 space-y-3">{submission.publishedFeedback.map((row) => <div key={row.questionNumber} className="rounded-lg bg-slate-50 p-3 text-sm"><p className="mb-2 font-bold text-ink">{row.questionNumber}번 · {HOMEWORK_VERDICT_LABELS[row.verdict]}</p><ContentRenderer text={row.comment} /></div>)}</div></details>}
      </div>
    </div>
  </div>;
}
