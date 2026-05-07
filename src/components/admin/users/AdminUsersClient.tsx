"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { isAdminUser } from "@/lib/auth/mockAuth";
import { ADMIN_PASSWORD } from "@/lib/auth/constants";

type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastSignInAt: string | null;
  tier: string;
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const TIER_LABEL: Record<string, string> = {
  go: "GO · 무료",
  plus: "PLUS",
  pro: "PRO",
  max: "MAX",
};

export function AdminUsersClient() {
  const { user, authChecked } = useAuth();
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        headers: { "x-admin-password": ADMIN_PASSWORD },
      });
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

  async function deleteUser(target: AdminUserRow) {
    const ok = window.confirm(`정말 ${target.email} 회원을 삭제하시겠습니까?\n모든 풀이 기록이 함께 삭제됩니다.`);
    if (!ok) return;
    setDeletingId(target.id);
    try {
      const res = await fetch(`/api/admin/users/${target.id}`, {
        method: "DELETE",
        headers: { "x-admin-password": ADMIN_PASSWORD },
      });
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
          가입된 회원 목록을 확인하고, 필요 시 회원을 삭제할 수 있습니다.
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
                  <th className="px-3 py-3">가입일</th>
                  <th className="px-3 py-3">최근 로그인</th>
                  <th className="px-3 py-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-b border-line/50 hover:bg-slate-50">
                    <td className="px-3 py-3 font-bold text-ink">{row.email || "—"}</td>
                    <td className="px-3 py-3 text-slate-700">{row.name || "—"}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-700">
                        {TIER_LABEL[row.tier] ?? row.tier}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">{formatDateTime(row.createdAt)}</td>
                    <td className="px-3 py-3 text-xs text-slate-500">{formatDateTime(row.lastSignInAt)}</td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => deleteUser(row)}
                        disabled={deletingId === row.id}
                        className="rounded-md border border-red-300 px-3 py-1 text-xs font-black text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === row.id ? "삭제 중..." : "삭제"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
