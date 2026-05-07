"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { isAdminUser } from "@/lib/auth/mockAuth";
import { adminFetch } from "@/lib/api/adminFetch";
import { USER_TIER_ORDER, USER_TIER_LABELS, type UserTier } from "@/types/auth";

type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastSignInAt: string | null;
  tier: string;
  isAdmin: boolean;
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function AdminUsersClient() {
  const { user, authChecked } = useAuth();
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await adminFetch("/api/admin/users");
      const json = (await res.json()) as { ok: boolean; users?: AdminUserRow[]; message?: string };
      if (!json.ok || !json.users) {
        setError(json.message ?? "회원 목록을 불러오지 못했습니다.");
        setRows([]);
        return;
      }
      setRows(json.users);
    } catch {
      setError("회원 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authChecked) return;
    if (!isAdminUser(user)) return;
    load();
  }, [authChecked, user]);

  async function patchUser(target: AdminUserRow, patch: { tier?: UserTier; isAdmin?: boolean }) {
    setSavingId(target.id);
    try {
      const res = await adminFetch(`/api/admin/users/${target.id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      const json = (await res.json()) as { ok: boolean; message?: string };
      if (!json.ok) {
        alert(json.message ?? "변경 중 오류가 발생했습니다.");
        return;
      }
      setRows((prev) =>
        prev.map((r) =>
          r.id === target.id
            ? {
                ...r,
                tier: patch.tier ?? r.tier,
                isAdmin: typeof patch.isAdmin === "boolean" ? patch.isAdmin : r.isAdmin,
              }
            : r
        )
      );
    } catch {
      alert("변경 중 오류가 발생했습니다.");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteUser(target: AdminUserRow) {
    const ok = window.confirm(
      `정말 ${target.email} 회원을 삭제하시겠습니까?\n모든 풀이 기록이 함께 삭제됩니다.`
    );
    if (!ok) return;
    setDeletingId(target.id);
    try {
      const res = await adminFetch(`/api/admin/users/${target.id}`, { method: "DELETE" });
      const json = (await res.json()) as { ok: boolean; message?: string };
      if (!json.ok) {
        alert(json.message ?? "삭제 중 오류가 발생했습니다.");
        return;
      }
      setRows((prev) => prev.filter((r) => r.id !== target.id));
    } catch {
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  }

  if (!authChecked) return null;

  if (!isAdminUser(user)) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-16">
        <section className="mx-auto max-w-lg rounded-2xl border border-line bg-white p-10 text-center shadow-soft">
          <div className="mb-5 text-5xl">🔒</div>
          <h1 className="text-2xl font-black text-ink">관리자만 접근할 수 있습니다</h1>
          <Link
            href="/student/exams"
            className="mt-6 inline-block rounded-md bg-brand-600 px-6 py-3 text-sm font-black text-white hover:bg-brand-700"
          >
            시험 목록으로
          </Link>
        </section>
      </main>
    );
  }

  const filtered = search
    ? rows.filter(
        (r) =>
          r.email.toLowerCase().includes(search.toLowerCase()) ||
          r.name.toLowerCase().includes(search.toLowerCase())
      )
    : rows;

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <section className="mb-6 rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">관리자</p>
        <h1 className="mt-1 text-3xl font-black text-ink">회원 관리</h1>
        <p className="mt-2 text-sm text-slate-600">
          가입된 회원의 등급과 관리자 권한을 변경할 수 있습니다. 본인 계정의 관리자 권한 해제와
          삭제는 자기-락아웃 방지를 위해 막혀 있습니다.
        </p>
      </section>

      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이메일 또는 이름 검색"
            className="w-full max-w-sm rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
          />
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="rounded-md bg-slate-100 px-2 py-1 font-black text-slate-700">
              총 {rows.length}명
            </span>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="rounded-md border border-line px-3 py-1 font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {loading ? "불러오는 중..." : "새로고침"}
            </button>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-md bg-coral-50 px-4 py-3 text-sm font-bold text-coral-600">
            {error}
          </div>
        ) : null}

        {loading && rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">불러오는 중...</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            {rows.length === 0 ? "가입된 회원이 없습니다." : "검색 결과가 없습니다."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line text-left text-xs font-black uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3">이메일</th>
                  <th className="px-3 py-3">이름</th>
                  <th className="px-3 py-3">등급</th>
                  <th className="px-3 py-3">권한</th>
                  <th className="px-3 py-3">가입일</th>
                  <th className="px-3 py-3">최근 로그인</th>
                  <th className="px-3 py-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const isSelf = row.id === user?.id;
                  const isSaving = savingId === row.id;
                  const isDeleting = deletingId === row.id;
                  return (
                    <tr key={row.id} className="border-b border-line/50 hover:bg-slate-50">
                      <td className="px-3 py-3 font-bold text-ink">
                        {row.email || "—"}
                        {isSelf ? (
                          <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-black text-brand-700">
                            나
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 text-slate-700">{row.name || "—"}</td>
                      <td className="px-3 py-3">
                        <select
                          value={row.tier}
                          disabled={isSaving}
                          onChange={(e) => patchUser(row, { tier: e.target.value as UserTier })}
                          className="rounded-md border border-line bg-white px-2 py-1 text-xs font-black text-slate-700 outline-none focus:border-brand-600 disabled:opacity-50"
                        >
                          {USER_TIER_ORDER.map((t) => (
                            <option key={t} value={t}>
                              {USER_TIER_LABELS[t]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        {row.isAdmin ? (
                          <button
                            type="button"
                            disabled={isSelf || isSaving}
                            onClick={() => patchUser(row, { isAdmin: false })}
                            className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-black text-white hover:bg-slate-700 disabled:opacity-50"
                            title={isSelf ? "본인 권한은 해제할 수 없습니다" : "관리자 해제"}
                          >
                            ADMIN
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => patchUser(row, { isAdmin: true })}
                            className="rounded-full border border-line bg-white px-2.5 py-0.5 text-xs font-black text-slate-500 hover:border-ink hover:text-ink disabled:opacity-50"
                          >
                            임명
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-500">{formatDateTime(row.createdAt)}</td>
                      <td className="px-3 py-3 text-xs text-slate-500">{formatDateTime(row.lastSignInAt)}</td>
                      <td className="px-3 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => deleteUser(row)}
                          disabled={isDeleting || isSelf}
                          title={isSelf ? "본인 계정은 삭제할 수 없습니다" : "회원 삭제"}
                          className="rounded-md border border-red-300 px-3 py-1 text-xs font-black text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {isDeleting ? "삭제 중..." : "삭제"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
