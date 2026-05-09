"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/lib/auth/AuthContext";
import { adminFetch } from "@/lib/api/adminFetch";

type Announcement = { id: string; title: string; content: string; created_at: string };
type DirectMessage = { id: string; title: string; content: string; created_at: string };

const SUB_FLAG_KEY = "cbt:promo:inquiry:show";

// 결제유도 팝업이 뜨려고 하는지(또는 떠 있는지) 짐작.
// 결제유도는 마운트 직후 sessionStorage flag를 비우므로,
// 마운트 직후 flag가 "1"이면 곧 뜬다. 그 외에는 "이미 닫힘 또는 안 뜸"으로 간주.
function shouldDeferForSubscription(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(SUB_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

export function UserNotifications() {
  const { user, authChecked } = useAuth();
  const [ready, setReady] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);

  // 결제유도가 끝난 후에야 알림 표시.
  useEffect(() => {
    if (!authChecked || !user) return;
    if (!shouldDeferForSubscription()) {
      setReady(true);
      return;
    }
    // 결제유도가 마운트되면 flag를 비움. 1.2s 후 다시 체크.
    const t = window.setTimeout(() => setReady(true), 1200);
    return () => window.clearTimeout(t);
  }, [authChecked, user]);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [aRes, mRes] = await Promise.all([
        adminFetch("/api/announcements"),
        adminFetch("/api/messages"),
      ]);
      const aJson = (await aRes.json()) as { ok: boolean; announcements?: Announcement[] };
      const mJson = (await mRes.json()) as { ok: boolean; messages?: DirectMessage[] };
      setAnnouncements(aJson.ok && aJson.announcements ? aJson.announcements : []);
      setMessages(mJson.ok && mJson.messages ? mJson.messages : []);
    } catch {
      // 무시 — 다음 트리거에서 재시도
    }
  }, [user]);

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready, load]);

  async function dismissAnnouncement(id: string) {
    setAnnouncements((cur) => cur.filter((a) => a.id !== id));
    try {
      await adminFetch(`/api/announcements/${id}/dismiss`, { method: "POST" });
    } catch {
      // 실패해도 화면에서는 사라진 상태 유지 — 다음 로드에서 다시 보일 수 있음
    }
  }

  async function readMessage(id: string) {
    setMessages((cur) => cur.filter((m) => m.id !== id));
    try {
      await adminFetch(`/api/messages/${id}/read`, { method: "POST" });
    } catch {
      // 무시
    }
  }

  if (!authChecked || !user) return null;
  if (typeof document === "undefined") return null;

  const currentAnnouncement = announcements[0] ?? null;
  const currentMessage = messages[0] ?? null;

  const node = (
    <>
      {currentAnnouncement ? (
        <AnnouncementModal
          announcement={currentAnnouncement}
          onClose={() => dismissAnnouncement(currentAnnouncement.id)}
        />
      ) : null}
      {currentMessage ? (
        <DirectMessageToast
          message={currentMessage}
          onRead={() => readMessage(currentMessage.id)}
        />
      ) : null}
    </>
  );
  return createPortal(node, document.body);
}

function AnnouncementModal({
  announcement,
  onClose,
}: {
  announcement: Announcement;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-b from-brand-50 to-white px-7 pt-7 pb-3 text-center">
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-brand-600 text-2xl text-white">
            📢
          </div>
          <div className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">공지</div>
          <h2 className="mt-1 text-xl font-black text-ink">{announcement.title}</h2>
        </div>
        <div className="whitespace-pre-line px-7 py-5 text-sm leading-7 text-slate-700">
          {announcement.content}
        </div>
        <div className="border-t border-line bg-slate-50 px-6 py-4 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-brand-600 px-5 py-2 text-sm font-black text-white hover:bg-brand-700"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

function DirectMessageToast({
  message,
  onRead,
}: {
  message: DirectMessage;
  onRead: () => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function sendReply() {
    if (!replyText.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await adminFetch(`/api/messages/${message.id}/reply`, {
        method: "POST",
        body: JSON.stringify({ content: replyText.trim() }),
      });
      const json = (await res.json()) as { ok: boolean; message?: string };
      if (!json.ok) {
        setError(json.message ?? "답장 전송에 실패했습니다.");
        return;
      }
      setDone(true);
      // 답장 보내면 서버가 read_at도 같이 찍어줌. 잠시 후 토스트 닫기.
      window.setTimeout(() => onRead(), 1500);
    } catch {
      setError("답장 전송 중 오류가 발생했습니다.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      role="status"
      className="fixed bottom-5 right-5 z-40 w-[360px] max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-xl border border-line bg-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.4)]"
    >
      <div className="flex items-center justify-between border-b border-line bg-brand-50 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-base">📩</span>
          <span className="text-xs font-black uppercase tracking-[0.18em] text-brand-700">관리자 메시지</span>
        </div>
        <button
          type="button"
          onClick={onRead}
          aria-label="닫기"
          className="grid size-6 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          ×
        </button>
      </div>
      <div className="px-4 py-3">
        <h3 className="text-sm font-black text-ink">{message.title}</h3>
        <p className="mt-2 max-h-40 overflow-y-auto whitespace-pre-line text-xs leading-6 text-slate-700">
          {message.content}
        </p>
      </div>
      {done ? (
        <div className="border-t border-line bg-mint-50 px-4 py-3 text-center text-xs font-black text-mint-700">
          ✅ 답장이 관리자에게 전달되었습니다.
        </div>
      ) : replyOpen ? (
        <div className="border-t border-line px-4 py-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="관리자에게 보낼 답장"
            rows={3}
            maxLength={5000}
            disabled={sending}
            className="w-full resize-y rounded-md border border-line px-2 py-1.5 text-xs outline-none focus:border-brand-600 disabled:opacity-50"
          />
          {error ? <p className="mt-1 text-xs font-bold text-coral-600">{error}</p> : null}
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setReplyOpen(false);
                setReplyText("");
                setError("");
              }}
              disabled={sending}
              className="rounded-md px-2 py-1 text-xs font-black text-slate-500 hover:text-slate-700 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={sendReply}
              disabled={sending || !replyText.trim()}
              className="rounded-md bg-brand-600 px-3 py-1 text-xs font-black text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {sending ? "전송 중..." : "보내기"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-2 border-t border-line bg-slate-50 px-4 py-2">
          <button
            type="button"
            onClick={() => setReplyOpen(true)}
            className="rounded-md border border-brand-300 px-3 py-1 text-xs font-black text-brand-700 hover:bg-brand-50"
          >
            답장
          </button>
          <button
            type="button"
            onClick={onRead}
            className="rounded-md bg-brand-600 px-3 py-1 text-xs font-black text-white hover:bg-brand-700"
          >
            확인
          </button>
        </div>
      )}
    </div>
  );
}
