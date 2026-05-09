"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { isAdminUser } from "@/lib/auth/mockAuth";
import { adminFetch } from "@/lib/api/adminFetch";

type Inquiry = {
  id: string;
  user_id: string;
  category: "complaint" | "suggestion" | "bug" | "other";
  title: string;
  content: string;
  image_url: string | null;
  status: "open" | "in_progress" | "resolved" | "closed";
  admin_reply: string | null;
  admin_reply_at: string | null;
  created_at: string;
  updated_at: string;
  user: { name: string; email: string };
};

const CATEGORY_LABELS: Record<Inquiry["category"], { label: string; color: string }> = {
  complaint:  { label: "불편사항", color: "bg-coral-50 text-coral-700" },
  suggestion: { label: "건의",     color: "bg-mint-50 text-mint-700" },
  bug:        { label: "버그",     color: "bg-amber-50 text-amber-700" },
  other:      { label: "기타",     color: "bg-slate-100 text-slate-700" },
};

const STATUS_LABELS: Record<Inquiry["status"], { label: string; color: string }> = {
  open:         { label: "신규",     color: "bg-brand-50 text-brand-700" },
  in_progress:  { label: "처리 중",  color: "bg-amber-50 text-amber-700" },
  resolved:     { label: "해결됨",   color: "bg-mint-50 text-mint-700" },
  closed:       { label: "닫힘",     color: "bg-slate-100 text-slate-500" },
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function AdminInquiriesClient() {
  const { user, authChecked } = useAuth();
  const [list, setList] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Inquiry["status"] | "all">("all");
  const [active, setActive] = useState<Inquiry | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await adminFetch("/api/admin/inquiries");
      const json = (await res.json()) as { ok: boolean; inquiries?: Inquiry[]; message?: string };
      if (!json.ok || !json.inquiries) {
        setError(json.message ?? "문의 목록을 불러오지 못했습니다.");
        return;
      }
      setList(json.inquiries);
    } catch {
      setError("문의 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authChecked) return;
    if (!isAdminUser(user)) return;
    load();
  }, [authChecked, user]);

  if (!authChecked) return null;
  if (!isAdminUser(user)) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-16">
        <section className="mx-auto max-w-lg rounded-2xl border border-line bg-white p-10 text-center shadow-soft">
          <div className="mb-5 text-5xl">🔒</div>
          <h1 className="text-2xl font-black text-ink">관리자만 접근할 수 있습니다</h1>
          <Link href="/student/exams" className="mt-6 inline-block rounded-md bg-brand-600 px-6 py-3 text-sm font-black text-white hover:bg-brand-700">
            시험 목록으로
          </Link>
        </section>
      </main>
    );
  }

  const filtered = filter === "all" ? list : list.filter((i) => i.status === filter);

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <section className="mb-6 rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">관리자</p>
        <h1 className="mt-1 text-3xl font-black text-ink">문의 관리</h1>
        <p className="mt-2 text-sm text-slate-600">회원이 보낸 불편사항·건의·버그신고를 확인하고 답변할 수 있습니다.</p>
      </section>

      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            {(["all","open","in_progress","resolved","closed"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                className={`rounded-md border px-3 py-1.5 text-xs font-black ${
                  filter === k
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-line bg-white text-slate-600 hover:border-brand-600"
                }`}
              >
                {k === "all" ? "전체" : STATUS_LABELS[k].label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="rounded-md border border-line px-3 py-1 text-xs font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? "불러오는 중..." : "새로고침"}
          </button>
        </div>

        {error ? <p className="mb-3 rounded-md bg-coral-50 px-4 py-3 text-sm font-bold text-coral-600">{error}</p> : null}

        {loading && list.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-400">불러오는 중...</p>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-400">조건에 맞는 문의가 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {filtered.map((q) => (
              <li
                key={q.id}
                onClick={() => setActive(q)}
                className="cursor-pointer rounded-md border border-line px-4 py-3 hover:border-brand-600 hover:bg-brand-50"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`rounded-full px-2 py-0.5 font-black ${CATEGORY_LABELS[q.category].color}`}>
                    {CATEGORY_LABELS[q.category].label}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 font-black ${STATUS_LABELS[q.status].color}`}>
                    {STATUS_LABELS[q.status].label}
                  </span>
                  <span className="text-slate-500">
                    {q.user.name || "—"} ({q.user.email})
                  </span>
                  <span className="ml-auto text-slate-400">{formatDateTime(q.created_at)}</span>
                </div>
                <p className="mt-2 truncate text-sm font-black text-ink">{q.title}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{q.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {active ? (
        <InquiryDetailModal
          inquiry={active}
          onClose={() => setActive(null)}
          onChanged={async () => {
            await load();
          }}
        />
      ) : null}
    </main>
  );
}

function InquiryDetailModal({
  inquiry,
  onClose,
  onChanged,
}: {
  inquiry: Inquiry;
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const [reply, setReply] = useState(inquiry.admin_reply ?? "");
  const [status, setStatus] = useState<Inquiry["status"]>(inquiry.status);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function save() {
    setSaving(true);
    setErr("");
    try {
      const res = await adminFetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, adminReply: reply }),
      });
      const json = (await res.json()) as { ok: boolean; message?: string };
      if (!json.ok) {
        setErr(json.message ?? "저장에 실패했습니다.");
        return;
      }
      await onChanged();
      onClose();
    } catch {
      setErr("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-line px-6 py-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-full px-2 py-0.5 font-black ${CATEGORY_LABELS[inquiry.category].color}`}>
              {CATEGORY_LABELS[inquiry.category].label}
            </span>
            <span className="text-slate-500">{inquiry.user.name || "—"} ({inquiry.user.email})</span>
            <span className="ml-auto text-slate-400">{formatDateTime(inquiry.created_at)}</span>
          </div>
          <h2 className="mt-2 text-lg font-black text-ink">{inquiry.title}</h2>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <p className="mb-1 text-xs font-black text-slate-500">내용</p>
            <p className="whitespace-pre-line rounded-md border border-line bg-slate-50 px-3 py-3 text-sm leading-7 text-slate-700">
              {inquiry.content}
            </p>
          </div>
          {inquiry.image_url ? (
            <div>
              <p className="mb-1 text-xs font-black text-slate-500">첨부 이미지</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={inquiry.image_url} alt="첨부 이미지" className="max-h-80 rounded-md border border-line" />
            </div>
          ) : null}

          <div>
            <p className="mb-1 text-xs font-black text-slate-500">상태</p>
            <div className="flex flex-wrap gap-2">
              {(["open","in_progress","resolved","closed"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`rounded-md border px-3 py-1 text-xs font-black ${
                    status === s
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-line bg-white text-slate-600 hover:border-brand-600"
                  }`}
                >
                  {STATUS_LABELS[s].label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-black text-slate-500">답변 (선택)</p>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={5}
              placeholder="회원에게 보여줄 답변을 입력하세요."
              className="w-full resize-y rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
            />
            <p className="mt-1 text-xs text-slate-400">
              답변은 회원의 문의 내역에서 노출됩니다 (회원이 별도 문의 내역 페이지에서 볼 수 있을 때).
            </p>
          </div>

          {err ? <p className="text-xs font-bold text-coral-600">{err}</p> : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md px-4 py-2 text-sm font-black text-slate-500 hover:text-slate-700 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-md bg-brand-600 px-5 py-2 text-sm font-black text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
