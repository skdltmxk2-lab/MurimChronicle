"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { QuestionRecord } from "@/types/question";
import type { HomeworkMaterial } from "@/types/homework";
import { buttonClass, errorMessage, Field, homeworkApi, inputClass, Notice, panelClass, secondaryClass } from "./HomeworkShared";

type Sheet = { title: string; subtitle: string; questions: QuestionRecord[] };
export function HomeworkSheetActions({ sheet, pageHeaders, getWorkspace, disabled, onBusyChange, onSaved }: {
  sheet: Sheet; pageHeaders: string[]; getWorkspace: () => HTMLElement | null; disabled: boolean;
  onBusyChange: (busy: boolean) => void;
  onSaved?: (material: HomeworkMaterial, distribute: boolean) => Promise<void>;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(sheet.title);
  const [kind, setKind] = useState<HomeworkMaterial["kind"]>("homework");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<HomeworkMaterial | null>(null);
  const signature = JSON.stringify([sheet.title, sheet.questions.map((q) => [q.id, q.updatedAt]), pageHeaders]);
  useEffect(() => { setSaved(null); setError(""); }, [signature, title, kind, description]);
  useEffect(() => { setTitle(sheet.title); }, [sheet.title]);

  async function save(distribute: boolean) {
    if (busyRef.current || disabled || !title.trim() || !sheet.questions.length) return;
    busyRef.current = true; setBusy(true); onBusyChange(true); setError("");
    try {
      let material = saved;
      if (!material) {
        const workspace = getWorkspace();
        if (!workspace) throw new Error("문제지 미리보기를 찾지 못했습니다. 다시 만들어 주세요.");
        const { buildHomeworkPdf } = await import("@/lib/homework/pdf-builder");
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        const pdf = await buildHomeworkPdf(workspace);
        const fileName = `${title.trim().replace(/[\\/:*?"<>|]/g, "_").slice(0, 100)}.pdf`;
        const upload = await homeworkApi<{ uploadId: string; bucket: string; path: string; token: string }>("/api/homework/upload", { method: "POST", body: JSON.stringify({ purpose: "material", name: fileName, size: pdf.blob.size, pages: pdf.pages }) });
        const uploaded = await supabase.storage.from(upload.bucket).uploadToSignedUrl(upload.path, upload.token, pdf.blob, { contentType: "application/pdf" });
        if (uploaded.error) throw new Error("문제 PDF 저장에 실패했습니다. 다시 시도해 주세요.");
        const result = await homeworkApi<{ material: HomeworkMaterial }>("/api/admin/homework/materials/generated", { method: "POST", body: JSON.stringify({ uploadId: upload.uploadId, title: title.trim(), kind, subject: [...new Set(sheet.questions.map((q) => q.subject))].join(" · "), description: description.trim(), questionIds: sheet.questions.map((q) => q.id), questionUpdatedAts: sheet.questions.map((q) => q.updatedAt), questionPages: pdf.questionPages }) });
        material = result.material;
        setSaved(material);
      }
      if (onSaved) await onSaved(material, distribute);
      else if (distribute) router.push(`/admin/homework?material=${encodeURIComponent(material.id)}&tab=assignments`);
    } catch (e) { setError(errorMessage(e)); }
    finally { busyRef.current = false; setBusy(false); onBusyChange(false); }
  }
  return <section aria-label="만든 문제지 저장과 배부" className={`${panelClass} admin-screen-only mt-5 space-y-4`}>
    <div><h2 className="text-lg font-black text-ink">만든 문제지 저장 · 배부</h2><p className="mt-1 text-sm text-slate-500">구성한 {sheet.questions.length}문항을 PDF로 만듭니다. 바로 배부를 누르면 가입 학생을 선택할 수 있습니다.</p></div>
    <div className="grid gap-4 sm:grid-cols-[1fr_180px]"><Field label="자료 이름"><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} disabled={busy} className={inputClass} /></Field><Field label="자료 종류"><select value={kind} onChange={(e) => setKind(e.target.value as HomeworkMaterial["kind"])} disabled={busy} className={inputClass}><option value="homework">숙제</option><option value="daily">데일리 테스트</option></select></Field></div>
    <Field label="자료 설명 (선택)"><textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={3000} rows={2} disabled={busy} placeholder="학생에게 보여줄 설명" className={inputClass} /></Field>
    {error && <Notice error>{error}</Notice>}
    {saved && <Notice>자료함에 저장했습니다. <a href={`/admin/homework?material=${encodeURIComponent(saved.id)}`} className="font-black underline">자료 확인</a></Notice>}
    <div className="flex flex-wrap gap-3"><button type="button" disabled={busy || disabled || !title.trim() || !sheet.questions.length} onClick={() => void save(false)} className={secondaryClass}>{busy ? "문제지 PDF 만드는 중..." : saved ? "자료함에 저장됨" : "자료함에 저장"}</button><button type="button" disabled={busy || disabled || !title.trim() || !sheet.questions.length} onClick={() => void save(true)} className={buttonClass}>{busy ? "저장 중..." : "바로 학생에게 배부 →"}</button></div>
  </section>;
}
