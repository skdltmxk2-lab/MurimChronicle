"use client";

import { useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { parseQuestionNumbers } from "@/lib/homework/core.mjs";
import { SUBJECTS } from "@/lib/taxonomy";
import { HOMEWORK_MAX_BYTES, HOMEWORK_MAX_PAGES, type HomeworkMaterial } from "@/types/homework";
import { buttonClass, errorMessage, Field, homeworkApi, inputClass, Notice, panelClass, useHomeworkDraftWarning } from "./HomeworkShared";

async function validatePdf(file: File) {
  if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== "application/pdf")) throw new Error("PDF 파일만 등록할 수 있습니다.");
  if (file.size === 0 || file.size > HOMEWORK_MAX_BYTES) throw new Error("PDF는 15MB 이하로 올려 주세요.");
  const header = new TextDecoder("latin1").decode(await file.slice(0, 1024).arrayBuffer());
  if (!header.includes("%PDF-")) throw new Error("올바른 PDF 파일이 아닙니다.");
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  try {
    const document = await task.promise;
    if (document.numPages < 1 || document.numPages > HOMEWORK_MAX_PAGES) throw new Error("PDF는 최대 50페이지까지 등록할 수 있습니다.");
    return document.numPages;
  } catch (error) {
    if (error instanceof Error && error.name === "PasswordException") throw new Error("비밀번호를 해제한 PDF를 올려 주세요.");
    throw error;
  } finally { await task.destroy(); }
}

export function HomeworkPdfImport({ refresh, onRegistered }: { refresh: () => Promise<void>; onRegistered: (id: string) => void }) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<HomeworkMaterial["kind"]>("homework");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [numbersText, setNumbersText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState(0);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const fileSequence = useRef(0);
  useHomeworkDraftWarning(Boolean(title || description || numbersText || file));
  const questionPreview = useMemo(() => { try { return { numbers: parseQuestionNumbers(numbersText), error: "" }; } catch (e) { return { numbers: [], error: numbersText ? errorMessage(e) : "" }; } }, [numbersText]);
  async function chooseFile(next: File | undefined) {
    const sequence = ++fileSequence.current;
    setFile(null); setPages(0); setError("");
    if (!next) { setChecking(false); return; }
    setChecking(true);
    try { const count = await validatePdf(next); if (sequence === fileSequence.current) { setFile(next); setPages(count); } }
    catch (e) { if (sequence === fileSequence.current) { setError(errorMessage(e)); if (fileInput.current) fileInput.current.value = ""; } }
    finally { if (sequence === fileSequence.current) setChecking(false); }
  }
  async function register(event: React.FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    if (!file || !pages) { setError("문제 PDF를 먼저 선택해 주세요."); return; }
    let questionNumbers: string[];
    try { questionNumbers = parseQuestionNumbers(numbersText); } catch (e) { setError(errorMessage(e)); return; }
    setBusy(true);
    try {
      const upload = await homeworkApi<{ uploadId: string; bucket: string; path: string; token: string }>("/api/homework/upload", { method: "POST", body: JSON.stringify({ purpose: "material", name: file.name, size: file.size, pages }) });
      const result = await supabase.storage.from(upload.bucket).uploadToSignedUrl(upload.path, upload.token, file, { contentType: "application/pdf" });
      if (result.error) throw new Error("PDF 업로드에 실패했습니다. 다시 시도해 주세요.");
      const created = await homeworkApi<{ material: HomeworkMaterial }>("/api/admin/homework/materials", { method: "POST", body: JSON.stringify({ uploadId: upload.uploadId, title: title.trim(), kind, subject, description: description.trim(), questionNumbers }) });
      if (created.material?.id) onRegistered(created.material.id);
      setTitle(""); setDescription(""); setNumbersText(""); setFile(null); setPages(0); if (fileInput.current) fileInput.current.value = "";
      setMessage("자료를 등록했습니다. 기준풀이를 준비하거나 바로 학생에게 배부할 수 있습니다.");
      try { await refresh(); } catch { setError("등록은 완료했습니다. 목록을 보려면 새로고침해 주세요."); }
    } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  return <form onSubmit={register} className={`${panelClass} space-y-4`}>
        <h2 className="text-lg font-black text-ink">보유 PDF 등록</h2>
        <Field label="자료 이름"><input required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 미분학 2주차 숙제" className={inputClass} /></Field>
        <div className="grid grid-cols-2 gap-3"><Field label="자료 종류"><select value={kind} onChange={(e) => setKind(e.target.value as HomeworkMaterial["kind"])} className={inputClass}><option value="homework">숙제</option><option value="daily">데일리 테스트</option></select></Field><Field label="과목"><select value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass}><option value="">과목 선택</option>{SUBJECTS.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></Field></div>
        <Field label="설명"><textarea rows={2} maxLength={3000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="학생에게 보여줄 자료 설명" className={inputClass} /></Field>
        <Field label="문항 번호" hint="예: 1-10 또는 1,3,5 · 최대 60문항. 페이지마다 번호가 다시 시작하면 A1, B1처럼 구분하세요."><input required maxLength={2000} value={numbersText} onChange={(e) => setNumbersText(e.target.value)} placeholder="1-10" className={inputClass} /></Field>
        {questionPreview.numbers.length > 0 && <p className="break-words text-xs leading-5 text-brand-700">총 {questionPreview.numbers.length}문항 · {questionPreview.numbers.join(", ")}</p>}{questionPreview.error && <p className="text-xs text-red-600">{questionPreview.error}</p>}
        <Field label="문제 PDF" hint="문제지만 있어도 됩니다. PDF 전체가 배부됩니다. 최대 15MB · 50페이지."><input ref={fileInput} type="file" accept=".pdf,application/pdf" disabled={busy || checking} onChange={(e) => void chooseFile(e.target.files?.[0])} className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1 file:text-brand-700`} /></Field>
        {checking && <p role="status" className="text-xs text-slate-500">PDF 페이지 수를 확인하고 있습니다.</p>}{file && <p className="text-xs text-brand-700">{pages}페이지 · {(file.size / 1024 / 1024).toFixed(1)}MB · 확인 완료</p>}
        {error && <Notice error>{error}</Notice>}{message && <Notice>{message}</Notice>}
        <button type="submit" disabled={busy || checking || !file || !title.trim() || questionPreview.numbers.length === 0} className={`${buttonClass} w-full`}>{busy ? "PDF 업로드 및 등록 중..." : "자료 등록"}</button>
      </form>;
}
