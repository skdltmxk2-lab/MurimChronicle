"use client";

import { useEffect, useState } from "react";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import type { HomeworkMaterial, HomeworkReference } from "@/types/homework";
import { buttonClass, emptyReference, errorMessage, Field, homeworkApi, HomeworkRequestError, inputClass, Notice, PageNumbersField, PdfViewer, secondaryClass, useHomeworkDraftWarning } from "./HomeworkShared";

const referenceDrafts = new Map<string, { rows: HomeworkReference[]; revision: number }>();

function alignReference(material: HomeworkMaterial) {
  return material.questionNumbers.map((number) => material.reference.find((item) => item.questionNumber === number) || emptyReference(number));
}

export function HomeworkReferenceEditor({ active, material, aiAvailable, aiEnabled, refresh }: { active: boolean; material: HomeworkMaterial; aiAvailable: boolean; aiEnabled: boolean; refresh: () => Promise<void> }) {
  const [draft, setDraft] = useState<HomeworkReference[]>(() => referenceDrafts.get(material.id)?.rows || alignReference(material));
  const [revision, setRevision] = useState(() => referenceDrafts.get(material.id)?.revision ?? material.referenceRevision);
  const [dirty, setDirty] = useState(() => referenceDrafts.has(material.id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [generationStart, setGenerationStart] = useState<{ revision: number; status: HomeworkMaterial["referenceStatus"]; error: string | null } | null>(null);
  const processing = material.referenceStatus === "processing" || generationStart !== null;
  const conflict = material.referenceRevision > revision;
  useHomeworkDraftWarning(dirty);
  useEffect(() => { if (dirty) referenceDrafts.set(material.id, { rows: draft, revision }); else referenceDrafts.delete(material.id); }, [dirty, draft, revision, material.id]);
  useEffect(() => {
    if (!dirty && material.referenceRevision >= revision) { setDraft(alignReference(material)); setRevision(material.referenceRevision); }
  }, [material, revision, dirty]);
  useEffect(() => {
    if (generationStart && (material.referenceRevision > generationStart.revision || (material.referenceStatus === "failed" && (generationStart.status !== "failed" || material.referenceError !== generationStart.error)))) setGenerationStart(null);
  }, [material, generationStart]);
  useEffect(() => {
    if (!processing || !active) return;
    let alive = true; let inFlight = false;
    const timer = setInterval(async () => { if (!alive || inFlight) return; inFlight = true; try { await refresh(); } catch (e) { if (alive) setError(errorMessage(e)); } finally { inFlight = false; } }, 7000);
    return () => { alive = false; clearInterval(timer); };
  }, [processing, active, refresh]);
  useEffect(() => {
    if (!generationStart) return;
    const timer = setTimeout(() => { setGenerationStart(null); setError("기준풀이 처리가 지연되고 있습니다. 새로고침으로 상태를 확인해 주세요."); }, 330000);
    return () => clearTimeout(timer);
  }, [generationStart]);
  function edit(index: number, patch: Partial<HomeworkReference>) {
    setDraft((rows) => rows.map((row, i) => i === index ? { ...row, ...patch, needsReview: true } : row)); setDirty(true); setMessage("");
  }
  function check(index: number, done: boolean) { setDraft((rows) => rows.map((row, i) => i === index ? { ...row, needsReview: !done, reviewReason: done ? "" : "기준풀이를 확인해 주세요." } : row)); setDirty(true); }
  async function generate() {
    setBusy(true); setError(""); setMessage("");
    setGenerationStart({ revision: material.referenceRevision, status: material.referenceStatus, error: material.referenceError });
    try { await homeworkApi(`/api/admin/homework/materials/${material.id}/reference`, { method: "POST" }); await refresh(); setMessage("기준풀이 생성을 시작했습니다. 완료되면 이 화면에 표시됩니다."); }
    catch (e) { setGenerationStart(null); setError(errorMessage(e)); } finally { setBusy(false); }
  }
  async function save(approve: boolean) {
    setError(""); setMessage("");
    if (approve && draft.some((row) => row.needsReview || !row.problem.trim() || !row.answer.trim() || !row.solution.trim() || !row.sourcePages.length)) { setError("모든 문항의 문제·정답·기준풀이·원본 페이지를 확인하고 검토 완료를 표시해 주세요."); return; }
    setBusy(true);
    try {
      const result = await homeworkApi<{ material: HomeworkMaterial }>(`/api/admin/homework/materials/${material.id}/reference`, { method: "PATCH", body: JSON.stringify({ reference: draft, revision, approve }) });
      if (result.material) { setDraft(alignReference(result.material)); setRevision(result.material.referenceRevision); }
      setDirty(false); setMessage(approve ? "기준풀이를 교사 확인 완료로 저장했습니다." : "기준풀이 초안을 저장했습니다."); await refresh();
    } catch (e) { setError(errorMessage(e)); if (e instanceof HomeworkRequestError && e.status === 409) await refresh().catch(() => undefined); } finally { setBusy(false); }
  }
  const allReady = draft.every((row) => !row.needsReview && row.problem.trim() && row.answer.trim() && row.solution.trim() && row.sourcePages.length);
  return <div className="space-y-4">
    <div className="rounded-xl bg-slate-50 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-black text-ink">문항별 기준풀이</h3><p className="mt-1 text-xs leading-5 text-slate-500">문제지만 등록한 경우 AI가 정답과 풀이 초안을 만듭니다. 원본과 비교해 한 번 확인하면 학생 제출 첨삭에 사용할 수 있습니다.</p></div><button type="button" onClick={() => void generate()} disabled={busy || processing || !aiAvailable || !aiEnabled || dirty} className={secondaryClass}>{processing ? "기준풀이 생성 중..." : material.reference.length ? "AI 기준풀이 다시 생성" : "AI 기준풀이 만들기"}</button></div>
      <p className={`mt-3 text-xs font-bold ${material.referenceStatus === "approved" ? "text-brand-700" : "text-amber-700"}`}>{material.referenceStatus === "approved" ? "교사 확인 완료" : processing ? "AI 생성 중 · 완료 후 교사 확인이 필요합니다." : "초안 · 교사 확인 전"}{dirty ? " · 저장하지 않은 수정 있음" : ""}</p>
      {dirty && <p className="mt-1 text-xs text-slate-500">변경 내용을 먼저 저장한 뒤 다시 생성할 수 있습니다. 다시 생성하면 기존 기준풀이를 새 초안으로 바꿉니다.</p>}
    </div>
    {(!aiAvailable || !aiEnabled) && <Notice>{!aiAvailable ? "AI 연결이 없어 생성할 수 없습니다." : "숙제 AI 사용이 꺼져 있습니다."} 기준풀이를 직접 입력하고 확인할 수 있습니다.</Notice>}
    {material.referenceError && <Notice error>{material.referenceError}</Notice>}
    {conflict && <Notice error>다른 작업에서 기준풀이가 변경되었습니다. 수정 내용을 보관한 뒤 <button type="button" className="font-black underline" onClick={() => { setDraft(alignReference(material)); setRevision(material.referenceRevision); setDirty(false); }}>최신 기준풀이 불러오기</button>를 눌러 주세요.</Notice>}
    {error && <Notice error>{error}</Notice>}{message && <Notice>{message}</Notice>}
    <div className="grid items-start gap-5 lg:grid-cols-2"><div className="lg:sticky lg:top-4"><PdfViewer materialId={material.id} title="배부할 문제 PDF" /></div><div className="space-y-4">{draft.map((row, index) => <details key={row.questionNumber} open={index === 0} className="rounded-xl border border-line bg-white p-4"><summary className="cursor-pointer text-sm font-black text-ink">{row.questionNumber}번 <span className={`ml-2 text-xs ${row.needsReview ? "text-amber-700" : "text-brand-700"}`}>{row.needsReview ? "검토 필요" : "검토 완료"}</span></summary><fieldset disabled={busy || processing} className="mt-4 space-y-3">
      {row.reviewReason && <p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">{row.reviewReason}</p>}
      <Field label="인식한 문제"><textarea rows={3} maxLength={12000} value={row.problem} onChange={(e) => edit(index, { problem: e.target.value })} className={inputClass} /></Field>
      <Field label="정답"><textarea rows={2} maxLength={12000} value={row.answer} onChange={(e) => edit(index, { answer: e.target.value })} className={inputClass} /></Field>
      <Field label="기준풀이"><textarea rows={6} maxLength={24000} value={row.solution} onChange={(e) => edit(index, { solution: e.target.value })} className={inputClass} /></Field>
      {row.solution && <details className="rounded-lg bg-slate-50 p-3"><summary className="cursor-pointer text-xs font-bold text-slate-500">수식 미리보기</summary><div className="mt-2 text-sm"><ContentRenderer text={row.solution} /></div></details>}
      <PageNumbersField value={row.sourcePages} total={material.pdfPages} required onChange={(sourcePages) => edit(index, { sourcePages })} />
      <label className="flex items-start gap-2 rounded-lg bg-brand-50 p-3 text-sm font-bold text-brand-800"><input type="checkbox" checked={!row.needsReview} onChange={(e) => check(index, e.target.checked)} className="mt-1 h-4 w-4 accent-brand-600" /><span>이 문항의 문제·정답·기준풀이를 검토했습니다.</span></label>
    </fieldset></details>)}
    <div className="sticky bottom-3 flex flex-wrap gap-2 rounded-xl border border-line bg-white p-3 shadow-soft"><button type="button" onClick={() => void save(false)} disabled={busy || processing || conflict} className={secondaryClass}>{busy ? "저장 중..." : "기준풀이 초안 저장"}</button><button type="button" onClick={() => void save(true)} disabled={busy || processing || conflict || !allReady} className={buttonClass}>검토 완료 · 기준풀이 승인</button></div></div></div>
    <p className="text-xs leading-5 text-slate-500">자동발송은 교사가 확인한 기준풀이가 있어야 진행됩니다. 기준풀이를 수정하면 다시 승인해 주세요.</p>
  </div>;
}
