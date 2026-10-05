"use client";

import { useEffect, useRef, useState } from "react";
import { adminFetch } from "@/lib/api/adminFetch";
import type { HomeworkFeedback, HomeworkReference } from "@/types/homework";

export const inputClass = "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50";
export const buttonClass = "inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-45";
export const secondaryClass = "inline-flex items-center justify-center rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45";
export const panelClass = "rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-6";

export class HomeworkRequestError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function homeworkApi<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await adminFetch(url, init);
  const payload = await response.json().catch(() => null) as ({ ok?: boolean; message?: string } & T) | null;
  if (!response.ok || !payload?.ok) throw new HomeworkRequestError(payload?.message || "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.", response.status);
  return payload;
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "처리 중 오류가 발생했습니다.";
}

export function formatHomeworkDate(value: string | null) {
  if (!value) return "기한 없음";
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function toDeadlineInput(value: string | null) {
  if (!value) return "";
  const date = new Date(new Date(value).getTime() + 9 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 16);
}

export function deadlineIso(value: string): string | null {
  if (!value) return null;
  const date = new Date(`${value}:00+09:00`);
  if (!Number.isFinite(date.getTime())) throw new Error("제출 기한을 확인해 주세요.");
  return date.toISOString();
}

export function emptyFeedback(questionNumber: string): HomeworkFeedback {
  return { questionNumber, verdict: "review", studentWork: "", errorStep: "", reason: "", hint: "", comment: "", sourcePages: [], needsReview: true, reviewReason: "선생님 확인이 필요합니다.", verified: false };
}

export function emptyReference(questionNumber: string): HomeworkReference {
  return { questionNumber, problem: "", answer: "", solution: "", sourcePages: [], needsReview: true, reviewReason: "기준풀이를 확인해 주세요." };
}

export function useHomeworkDraftWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
}

export function Notice({ children, error = false }: { children: React.ReactNode; error?: boolean }) {
  return <div role={error ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm leading-6 ${error ? "bg-red-50 text-red-700" : "bg-brand-50 text-brand-800"}`}>{children}</div>;
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="block space-y-1.5"><span className="text-sm font-bold text-ink">{label}</span>{children}{hint && <span className="block text-xs leading-5 text-slate-500">{hint}</span>}</label>;
}

export function PageNumbersField({ value, total, onChange, onValidityChange, required = false }: { value: number[]; total: number; onChange: (pages: number[]) => void; onValidityChange?: (valid: boolean) => void; required?: boolean }) {
  const valueKey = value.join(", ");
  const [raw, setRaw] = useState(valueKey);
  const [error, setError] = useState("");
  const emitted = useRef(valueKey);
  useEffect(() => { if (valueKey !== emitted.current) { setRaw(valueKey); setError(""); } emitted.current = valueKey; }, [valueKey]);
  function change(text: string) {
    setRaw(text);
    const tokens = text.split(/[,\s]+/).filter(Boolean);
    const invalid = (required && tokens.length === 0) || tokens.some((token) => !/^\d+$/.test(token) || Number(token) < 1 || Number(token) > total);
    setError(invalid ? `1~${total} 사이의 페이지 번호를 입력해 주세요.` : "");
    const pages = invalid ? [] : [...new Set(tokens.map(Number))];
    emitted.current = pages.join(", ");
    onValidityChange?.(!invalid); onChange(pages);
  }
  return <Field label="원본 페이지" hint={`1~${total} 사이의 페이지를 쉼표로 구분해 주세요.`}><input value={raw} onChange={(e) => change(e.target.value)} aria-invalid={Boolean(error)} className={inputClass} placeholder="예: 1, 2" />{error && <span className="block text-xs text-red-600">{error}</span>}</Field>;
}

export function PdfViewer({ materialId, submissionId, title }: { materialId?: string; submissionId?: string; title: string }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let alive = true;
    setUrl(""); setError("");
    const query = submissionId ? `submissionId=${encodeURIComponent(submissionId)}` : `materialId=${encodeURIComponent(materialId || "")}`;
    homeworkApi<{ url: string }>(`/api/homework/file?${query}`).then((data) => { if (alive) setUrl(data.url); }).catch((e) => { if (alive) setError(errorMessage(e)); });
    return () => { alive = false; };
  }, [materialId, submissionId, reload]);
  return <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-slate-50">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-white px-4 py-3">
      <h3 className="text-sm font-black text-ink">{title}</h3>
      <div className="flex gap-3 text-xs font-bold"><button type="button" onClick={() => setReload((n) => n + 1)} className="text-slate-500 hover:text-brand-700">다시 열기</button>{url && <a href={url} target="_blank" rel="noopener noreferrer" className="text-brand-700">PDF 새 창으로 보기 ↗</a>}</div>
    </div>
    {error ? <div className="p-4"><Notice error>{error}</Notice></div> : url ? <iframe title={title} src={url} className="h-[480px] w-full lg:h-[720px]" /> : <p className="p-8 text-center text-sm text-slate-500">PDF를 불러오고 있습니다.</p>}
    <p className="px-4 py-2 text-xs text-slate-500">미리보기가 보이지 않으면 새 창으로 열어 주세요.</p>
  </section>;
}
