"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { adminFetch } from "@/lib/api/adminFetch";

const CATEGORIES: Array<{ id: "complaint" | "suggestion" | "bug" | "other"; label: string; emoji: string; desc: string }> = [
  { id: "complaint",  label: "불편사항", emoji: "😵",  desc: "사용 중 불편하거나 어려운 점" },
  { id: "suggestion", label: "건의하기", emoji: "💡", desc: "있었으면 하는 기능이나 개선안" },
  { id: "bug",        label: "버그신고", emoji: "🐛", desc: "오류, 멈춤, 깨진 화면 등" },
  { id: "other",      label: "기타",     emoji: "💬", desc: "문의/의견 등 그 외" },
];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export function InquiryModal({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState<typeof CATEGORIES[number]["id"] | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string>("");
  const [imageError, setImageError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  function pickImage(e: ChangeEvent<HTMLInputElement>) {
    setImageError("");
    const file = e.target.files?.[0];
    if (!file) {
      setImageDataUrl("");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("이미지는 5MB 이내로 첨부해 주세요.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      setImageDataUrl(dataUrl);
    };
    reader.onerror = () => setImageError("이미지를 읽지 못했습니다.");
    reader.readAsDataURL(file);
  }

  async function submit() {
    if (!category) return;
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await adminFetch("/api/inquiries", {
        method: "POST",
        body: JSON.stringify({ category, title, content, imageUrl: imageDataUrl || null }),
      });
      const json = (await res.json()) as { ok: boolean; message?: string };
      if (!json.ok) {
        setError(json.message ?? "문의 전송에 실패했습니다.");
        return;
      }
      setDone(true);
    } catch {
      setError("문의 전송 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-900/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-line px-6 py-4">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-brand-600">문의하기</p>
          <h2 className="mt-1 text-lg font-black text-ink">
            {done ? "문의가 접수되었습니다" : category ? CATEGORIES.find((c) => c.id === category)?.label : "어떤 문의이신가요?"}
          </h2>
        </div>

        {done ? (
          <div className="px-6 py-8 text-center">
            <div className="mb-4 text-5xl">✅</div>
            <p className="text-sm leading-7 text-slate-600">
              문의가 관리자에게 전달되었습니다.
              <br />
              빠른 시일 내에 확인 후 답변드리겠습니다.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-md bg-brand-600 px-6 py-2 text-sm font-black text-white hover:bg-brand-700"
            >
              닫기
            </button>
          </div>
        ) : !category ? (
          <div className="grid grid-cols-2 gap-3 px-6 py-5">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className="rounded-lg border border-line p-4 text-left transition hover:border-brand-600 hover:bg-brand-50"
              >
                <div className="text-2xl">{c.emoji}</div>
                <div className="mt-2 text-sm font-black text-ink">{c.label}</div>
                <div className="mt-1 text-xs text-slate-500">{c.desc}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4 px-6 py-5">
            <div>
              <label className="mb-1 block text-xs font-black text-slate-500">제목</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="간단한 한 줄 요약"
                maxLength={200}
                className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-black text-slate-500">내용</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                maxLength={5000}
                placeholder="자세한 상황이나 의견을 남겨 주세요."
                className="w-full resize-y rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-black text-slate-500">사진 첨부 (선택, 5MB 이내)</label>
              <input type="file" accept="image/*" onChange={pickImage} className="text-xs" />
              {imageError ? <p className="mt-1 text-xs font-bold text-coral-600">{imageError}</p> : null}
              {imageDataUrl ? (
                <div className="mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageDataUrl} alt="첨부 미리보기" className="max-h-40 rounded-md border border-line" />
                  <button
                    type="button"
                    onClick={() => setImageDataUrl("")}
                    className="mt-1 text-xs font-bold text-slate-500 hover:text-coral-600"
                  >
                    제거
                  </button>
                </div>
              ) : null}
            </div>
            {error ? <p className="text-xs font-bold text-coral-600">{error}</p> : null}
          </div>
        )}

        {!done && category ? (
          <div className="flex items-center justify-between gap-2 border-t border-line bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={() => setCategory(null)}
              disabled={submitting}
              className="text-xs font-black text-slate-500 hover:text-slate-700 disabled:opacity-50"
            >
              ← 카테고리 다시 고르기
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-md px-4 py-2 text-sm font-black text-slate-500 hover:text-slate-700 disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={submitting || !title.trim() || !content.trim()}
                className="rounded-md bg-brand-600 px-5 py-2 text-sm font-black text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {submitting ? "전송 중..." : "보내기"}
              </button>
            </div>
          </div>
        ) : !done ? (
          <div className="flex items-center justify-end border-t border-line bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-black text-slate-500 hover:text-slate-700"
            >
              닫기
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
