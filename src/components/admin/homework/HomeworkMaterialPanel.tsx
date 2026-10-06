"use client";

import { useEffect, useState } from "react";
import { AdminCoachingClient } from "@/components/admin/coaching/AdminCoachingClient";
import type { HomeworkMaterial } from "@/types/homework";
import { HomeworkPdfImport } from "./HomeworkPdfImport";
import { HomeworkReferenceEditor } from "./HomeworkReferenceEditor";
import { buttonClass, errorMessage, homeworkApi, Notice, panelClass, secondaryClass } from "./HomeworkShared";

const referenceLabels: Record<HomeworkMaterial["referenceStatus"], string> = { pending: "기준풀이 준비 전", processing: "기준풀이 생성 중", draft: "기준풀이 검토 대기", approved: "기준풀이 교사 확인 완료", failed: "기준풀이 생성 실패" };

export function HomeworkMaterialPanel({ active, materials, aiAvailable, aiEnabled, refresh, onAssign }: { active: boolean; materials: HomeworkMaterial[]; aiAvailable: boolean; aiEnabled: boolean; refresh: () => Promise<void>; onAssign: (id: string) => void }) {
  const [selectedId, setSelectedId] = useState(materials[0]?.id || "");
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  const [deleted, setDeleted] = useState<HomeworkMaterial | null>(null);
  const selected = materials.find((m) => m.id === selectedId);
  useEffect(() => { if (!materials.some((m) => m.id === selectedId)) setSelectedId(materials[0]?.id || ""); }, [materials, selectedId]);
  useEffect(() => { const id = new URLSearchParams(window.location.search).get("material"); if (id) setSelectedId(id); }, []);
  async function remove(material: HomeworkMaterial) {
    if (busyId) return;
    setBusyId(material.id); setError(""); setMessage("");
    try { await homeworkApi(`/api/admin/homework/materials/${material.id}`, { method: "DELETE" }); setDeleted(material); await refresh(); }
    catch (e) { setError(errorMessage(e)); }
    finally { setBusyId(""); }
  }
  async function restore() {
    if (!deleted || busyId) return;
    setBusyId(deleted.id); setError("");
    try { await homeworkApi(`/api/admin/homework/materials/${deleted.id}`, { method: "PATCH", body: JSON.stringify({ restore: true }) }); setSelectedId(deleted.id); setDeleted(null); await refresh(); setMessage("자료함으로 되돌렸습니다."); }
    catch (e) { setError(errorMessage(e)); }
    finally { setBusyId(""); }
  }
  async function saved(material: HomeworkMaterial, distribute: boolean) {
    await refresh(); setSelectedId(material.id);
    if (distribute) onAssign(material.id);
    else { setBuilding(false); setMessage("단원별 모고 문제지를 자료함에 저장했습니다."); }
  }
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black text-ink">{building ? "단원별 모고로 자료 만들기" : "자료함"}</h2><p className="mt-1 text-sm text-slate-500">코칭 스튜디오에서 문항을 구성하고, 저장하거나 학생에게 바로 배부하세요.</p></div><button type="button" onClick={() => setBuilding(!building)} className={building ? secondaryClass : buttonClass}>{building ? "← 자료함 보기" : "+ 단원별 모고로 새 자료 만들기"}</button></div>
    {error && <Notice error>{error}</Notice>}{message && <Notice>{message}</Notice>}
    {deleted && <Notice>‘{deleted.title}’을 자료함에서 삭제했습니다. 이미 배부한 숙제와 제출물은 유지됩니다. <button type="button" disabled={Boolean(busyId)} onClick={() => void restore()} className="ml-2 font-black underline">삭제 되돌리기</button></Notice>}
    <div hidden={!building}><AdminCoachingClient homeworkMode onHomeworkSaved={saved} invalidatedHomeworkMaterialId={deleted?.id} /></div>
    <div hidden={building} className="space-y-6">
      <section className={panelClass}>
        <div className="flex items-center justify-between"><h3 className="font-black text-ink">저장한 자료</h3><span className="text-xs text-slate-500">{materials.length}개 자료</span></div>
        {materials.length === 0 ? <div className="py-12 text-center"><p className="text-sm font-bold text-ink">저장한 자료가 없습니다.</p><button type="button" onClick={() => setBuilding(true)} className={`${secondaryClass} mt-4`}>단원별 모고 만들기</button></div> : <div className="mt-4 grid max-h-[520px] gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">{materials.map((material) => <article key={material.id} className={`rounded-xl border p-4 ${selectedId === material.id ? "border-brand-400 bg-brand-50" : "border-line"}`}>
          <button type="button" onClick={() => setSelectedId(material.id)} aria-pressed={selectedId === material.id} className="w-full text-left"><div className="flex items-start justify-between gap-2"><p className="font-black text-ink">{material.title}</p><span className="shrink-0 rounded-md bg-white px-2 py-1 text-[11px] font-bold text-slate-500">{material.kind === "daily" ? "데일리" : "숙제"}</span></div><p className="mt-2 text-xs text-slate-500">{material.subject || "과목 미지정"} · {material.questionNumbers.length}문항 · {material.pdfPages}페이지</p><p className={`mt-2 text-xs font-bold ${material.referenceStatus === "approved" ? "text-brand-700" : material.referenceStatus === "failed" ? "text-red-600" : "text-amber-700"}`}>{referenceLabels[material.referenceStatus]}</p></button>
          <div className="mt-4 flex justify-between gap-3 border-t border-line pt-3"><button type="button" onClick={() => onAssign(material.id)} className="text-xs font-black text-brand-700">학생에게 배부 →</button><button type="button" aria-label={`${material.title} 자료함에서 삭제`} disabled={Boolean(busyId)} onClick={() => void remove(material)} className="text-xs font-bold text-red-600 disabled:opacity-40">{busyId === material.id ? "처리 중..." : "삭제"}</button></div>
        </article>)}</div>}
      </section>
      <details className={panelClass}><summary className="cursor-pointer text-sm font-black text-slate-600">보유한 문제 PDF 가져오기</summary><div className="mt-5"><HomeworkPdfImport refresh={refresh} onRegistered={setSelectedId} /></div></details>
      {selected && <section className={panelClass}><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black text-ink">{selected.title}</h2><p className="mt-1 text-sm text-slate-500">{selected.description || selected.pdfName}</p></div><button type="button" onClick={() => onAssign(selected.id)} className={secondaryClass}>이 자료 학생에게 배부 →</button></div><HomeworkReferenceEditor key={selected.id} active={active && !building} material={selected} aiAvailable={aiAvailable} aiEnabled={aiEnabled} refresh={refresh} /></section>}
    </div>
  </div>;
}
