"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthContext";
import { adminFetch } from "@/lib/api/adminFetch";
import { checkBadWords } from "@/lib/moderation/badWords";

type ChatMessage = {
  id: string;
  user_id: string | null;
  user_name: string;
  content: string;
  created_at: string;
};

const MAX_LEN = 300;
const RETENTION_MS = 6 * 60 * 60 * 1000; // 6시간 지난 메시지는 표시하지 않음

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function LiveChatPanel({ className = "" }: { className?: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [dbError, setDbError] = useState(false);
  const [ready, setReady] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    // 최근 6시간 이내 메시지만 로드 (오래된 → 최신 순으로 표시)
    const cutoffIso = new Date(Date.now() - RETENTION_MS).toISOString();
    supabase
      .from("chat_messages")
      .select("*")
      .gte("created_at", cutoffIso)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setDbError(true);
          setReady(true);
          return;
        }
        const rows = ((data ?? []) as ChatMessage[]).reverse();
        rows.forEach((r) => seenIds.current.add(r.id));
        setMessages(rows);
        setReady(true);
      });

    // 실시간 신규 메시지 구독
    const channel = supabase
      .channel("live-chat-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const m = payload.new as ChatMessage;
          if (seenIds.current.has(m.id)) return;
          seenIds.current.add(m.id);
          setMessages((prev) => [...prev, m].slice(-200));
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  // 새 메시지가 오면 맨 아래로 스크롤
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // 6시간 지난 메시지는 화면에서 제거 (1분마다 점검)
  useEffect(() => {
    const id = setInterval(() => {
      const cutoff = Date.now() - RETENTION_MS;
      setMessages((prev) => prev.filter((m) => Date.parse(m.created_at) >= cutoff));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || sending || !user) return;
    const bw = checkBadWords(text);
    if (!bw.ok) {
      alert(`욕설·비방으로 감지되어 전송할 수 없습니다. (감지: "${bw.matched}")`);
      return;
    }
    setSending(true);
    try {
      const res = await adminFetch("/api/chat/send", {
        method: "POST",
        body: JSON.stringify({ content: text.slice(0, MAX_LEN), userName: user.name }),
      });
      const json = await res.json();
      if (!json.ok) {
        alert(json.message ?? "메시지 전송에 실패했어요.");
        return;
      }
      setInput("");
    } catch {
      alert("메시지 전송 중 오류가 발생했어요.");
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft ${className}`}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 border-b border-line bg-[#0D1F3C] px-4 py-3">
        <span className="text-lg">💬</span>
        <div>
          <p className="text-sm font-black text-white">실시간 채팅</p>
          <p className="text-[11px] text-slate-300">접속한 수험생들과 자유롭게 이야기해요</p>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {dbError ? (
          <div className="py-10 text-center">
            <div className="text-2xl">🚧</div>
            <p className="mt-2 text-xs font-bold text-slate-500">채팅을 준비 중입니다.</p>
          </div>
        ) : !ready ? (
          <p className="py-10 text-center text-xs text-slate-400">불러오는 중...</p>
        ) : messages.length === 0 ? (
          <p className="py-10 text-center text-xs text-slate-400">
            아직 메시지가 없어요. 첫 메시지를 남겨보세요!
          </p>
        ) : (
          messages.map((m) => {
            const mine = !!user && m.user_id === user.id;
            return (
              <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                {!mine ? (
                  <span className="mb-0.5 px-1 text-[11px] font-bold text-slate-500">
                    {m.user_name}
                  </span>
                ) : null}
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-5 ${
                    mine
                      ? "rounded-br-sm bg-brand-600 text-white"
                      : "rounded-bl-sm bg-slate-100 text-ink"
                  }`}
                >
                  {m.content}
                </div>
                <span className="mt-0.5 px-1 text-[10px] text-slate-400">{formatTime(m.created_at)}</span>
              </div>
            );
          })
        )}
      </div>

      {/* 입력 */}
      <div className="border-t border-line p-2">
        {user ? (
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              maxLength={MAX_LEN}
              placeholder="메시지를 입력하세요"
              className="min-w-0 flex-1 rounded-full border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
            />
            <button
              type="button"
              onClick={send}
              disabled={sending || !input.trim()}
              className="shrink-0 rounded-full bg-brand-600 px-4 py-2 text-sm font-black text-white hover:bg-brand-700 disabled:opacity-40"
            >
              전송
            </button>
          </div>
        ) : (
          <p className="py-2 text-center text-xs font-bold text-slate-400">
            로그인 후 채팅에 참여할 수 있어요.
          </p>
        )}
      </div>
    </div>
  );
}
