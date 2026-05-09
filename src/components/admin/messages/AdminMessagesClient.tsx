"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { isAdminUser } from "@/lib/auth/mockAuth";
import { adminFetch } from "@/lib/api/adminFetch";

type AdminUserRow = { id: string; email: string; name: string };
type Announcement = { id: string; title: string; content: string; created_at: string; expires_at: string | null };
type DirectMessage = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  read_at: string | null;
  created_at: string;
  user: { name: string; email: string };
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function AdminMessagesClient() {
  const { user, authChecked } = useAuth();
  const [tab, setTab] = useState<"announcement" | "direct">("announcement");

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

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <section className="mb-6 rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">관리자</p>
        <h1 className="mt-1 text-3xl font-black text-ink">공지 / 메시지</h1>
        <p className="mt-2 text-sm text-slate-600">
          전체 회원에게 공지를 띄우거나, 특정 회원에게 1대1 메시지를 보낼 수 있습니다. 회원 화면에서는 공지가 중앙 모달, 1대1은 우측 하단 토스트로 노출됩니다.
        </p>
      </section>

      <section className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("announcement")}
          className={`rounded-md border px-4 py-2 text-sm font-black ${
            tab === "announcement"
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-line bg-white text-slate-600 hover:border-brand-600"
          }`}
        >
          📢 전체 공지
        </button>
        <button
          type="button"
          onClick={() => setTab("direct")}
          className={`rounded-md border px-4 py-2 text-sm font-black ${
            tab === "direct"
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-line bg-white text-slate-600 hover:border-brand-600"
          }`}
        >
          📩 1대1 메시지
        </button>
      </section>

      {tab === "announcement" ? <AnnouncementSection /> : <DirectMessageSection />}
    </main>
  );
}

function AnnouncementSection() {
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [expires, setExpires] = useState<string>(""); // "YYYY-MM-DD" 빈 문자열은 영구
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/announcements");
      const json = (await res.json()) as { ok: boolean; announcements?: Announcement[] };
      setList(json.ok && json.announcements ? json.announcements : []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function post() {
    if (!title.trim() || !content.trim()) return;
    setPosting(true);
    setError("");
    try {
      const expiresAt = expires ? new Date(`${expires}T23:59:59`).toISOString() : null;
      const res = await adminFetch("/api/admin/announcements", {
        method: "POST",
        body: JSON.stringify({ title, content, expiresAt }),
      });
      const json = (await res.json()) as { ok: boolean; message?: string };
      if (!json.ok) {
        setError(json.message ?? "등록 실패");
        return;
      }
      setTitle(""); setContent(""); setExpires("");
      await load();
    } finally {
      setPosting(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("이 공지를 삭제할까요?")) return;
    await adminFetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-black text-ink">새 공지 작성</h2>
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="공지 내용"
            rows={5}
            className="w-full resize-y rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
          />
          <div className="flex items-center gap-2 text-xs">
            <span className="font-black text-slate-500">만료일 (선택)</span>
            <input
              type="date"
              value={expires}
              onChange={(e) => setExpires(e.target.value)}
              className="rounded-md border border-line px-2 py-1 text-xs"
            />
            {expires ? (
              <button type="button" onClick={() => setExpires("")} className="text-slate-400 hover:text-slate-700">지움</button>
            ) : (
              <span className="text-slate-400">비워두면 영구</span>
            )}
          </div>
          {error ? <p className="text-xs font-bold text-coral-600">{error}</p> : null}
          <div className="text-right">
            <button
              type="button"
              onClick={post}
              disabled={posting || !title.trim() || !content.trim()}
              className="rounded-md bg-brand-600 px-5 py-2 text-sm font-black text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {posting ? "등록 중..." : "공지 등록"}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-black text-ink">기존 공지</h2>
        {loading ? (
          <p className="py-6 text-center text-sm text-slate-400">불러오는 중...</p>
        ) : list.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">아직 공지가 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {list.map((a) => (
              <li key={a.id} className="rounded-md border border-line px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-ink">{a.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      등록: {formatDateTime(a.created_at)}
                      {a.expires_at ? ` · 만료: ${formatDateTime(a.expires_at)}` : " · 영구"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(a.id)}
                    className="rounded-md border border-red-300 px-3 py-1 text-xs font-black text-red-600 hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
                <p className="mt-2 line-clamp-2 whitespace-pre-line text-xs text-slate-600">{a.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function DirectMessageSection() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState<DirectMessage[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  async function loadUsers() {
    const res = await adminFetch("/api/admin/users");
    const json = (await res.json()) as { ok: boolean; users?: AdminUserRow[] };
    setUsers(json.ok && json.users ? json.users : []);
  }

  async function loadRecent() {
    setLoadingRecent(true);
    try {
      const res = await adminFetch("/api/admin/messages");
      const json = (await res.json()) as { ok: boolean; messages?: DirectMessage[] };
      setRecent(json.ok && json.messages ? json.messages : []);
    } finally {
      setLoadingRecent(false);
    }
  }

  useEffect(() => { loadUsers(); loadRecent(); }, []);

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter((u) => u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q));
  }, [users, search]);

  function toggle(id: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function pickAllFiltered() {
    setPicked(new Set(filtered.map((u) => u.id)));
  }
  function clearAll() {
    setPicked(new Set());
  }

  async function send() {
    if (picked.size === 0 || !title.trim() || !content.trim()) return;
    setPosting(true);
    setError("");
    try {
      const res = await adminFetch("/api/admin/messages", {
        method: "POST",
        body: JSON.stringify({ userIds: [...picked], title, content }),
      });
      const json = (await res.json()) as { ok: boolean; sent?: number; message?: string };
      if (!json.ok) {
        setError(json.message ?? "발송 실패");
        return;
      }
      setTitle(""); setContent("");
      clearAll();
      await loadRecent();
      window.alert(`${json.sent}명에게 메시지를 발송했습니다.`);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-black text-ink">받을 사람 ({picked.size}명 선택)</h3>
            <div className="flex gap-2 text-xs">
              <button onClick={pickAllFiltered} className="rounded border border-line px-2 py-0.5 font-black text-slate-600 hover:bg-slate-50">전체 선택</button>
              <button onClick={clearAll} className="rounded border border-line px-2 py-0.5 font-black text-slate-600 hover:bg-slate-50">초기화</button>
            </div>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름/이메일 검색"
            className="mb-2 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
          />
          <div className="max-h-80 overflow-y-auto rounded-md border border-line">
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">검색 결과 없음</p>
            ) : (
              <ul>
                {filtered.map((u) => {
                  const on = picked.has(u.id);
                  return (
                    <li
                      key={u.id}
                      onClick={() => toggle(u.id)}
                      className={`flex cursor-pointer items-center gap-2 border-b border-line/50 px-3 py-2 text-sm last:border-b-0 ${
                        on ? "bg-brand-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <input type="checkbox" checked={on} readOnly />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-black text-ink">{u.name || "—"}</div>
                        <div className="truncate text-xs text-slate-500">{u.email}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <h3 className="mb-3 text-sm font-black text-ink">메시지 작성</h3>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="mb-2 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용"
            rows={6}
            className="w-full resize-y rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
          />
          {error ? <p className="mt-2 text-xs font-bold text-coral-600">{error}</p> : null}
          <div className="mt-3 text-right">
            <button
              type="button"
              onClick={send}
              disabled={posting || picked.size === 0 || !title.trim() || !content.trim()}
              className="rounded-md bg-brand-600 px-5 py-2 text-sm font-black text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {posting ? "발송 중..." : `${picked.size}명에게 발송`}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <h3 className="mb-3 text-sm font-black text-ink">최근 발송 (최대 200건)</h3>
        {loadingRecent ? (
          <p className="py-6 text-center text-xs text-slate-400">불러오는 중...</p>
        ) : recent.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">발송 내역 없음</p>
        ) : (
          <ul className="divide-y divide-line/50">
            {recent.map((m) => (
              <li key={m.id} className="py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-black text-ink">
                      {m.title}
                      {m.read_at ? (
                        <span className="ml-2 rounded-full bg-mint-50 px-2 py-0.5 text-[10px] font-black text-mint-700">읽음</span>
                      ) : (
                        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500">안 읽음</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">
                      → {m.user.name || "—"} ({m.user.email}) · {formatDateTime(m.created_at)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
