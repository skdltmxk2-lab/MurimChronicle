"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { isAdminUser } from "@/lib/auth/mockAuth";
import { adminFetch } from "@/lib/api/adminFetch";
import { USER_TIER_ORDER, USER_TIER_LABELS, type UserTier } from "@/types/auth";

type StudentGroup = "external" | "private" | "routemath";

type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastSignInAt: string | null;
  tier: string;             // effective tier (만료 반영)
  tierRaw: string;          // DB의 원본 등급
  tierExpiresAt: string | null;
  tierExpired: boolean;
  isAdmin: boolean;
  studentGroup: StudentGroup;
};

const STUDENT_GROUP_ORDER: StudentGroup[] = ["external", "private", "routemath"];
const STUDENT_GROUP_LABELS: Record<StudentGroup, string> = {
  external: "외부",
  private: "과외",
  routemath: "루트",
};
const STUDENT_GROUP_STYLES: Record<StudentGroup, string> = {
  external: "bg-slate-100 text-slate-600",
  private: "bg-amber-50 text-amber-700",
  routemath: "bg-brand-50 text-brand-700",
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const diffMs = Date.parse(iso) - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

const PRESET_MONTHS: Array<{ label: string; value: number | null }> = [
  { label: "영구", value: null },
  { label: "1개월", value: 1 },
  { label: "3개월", value: 3 },
  { label: "6개월", value: 6 },
  { label: "12개월", value: 12 },
];

export function AdminUsersClient() {
  const { user, authChecked } = useAuth();
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState<StudentGroup | "all">("all");
  const [editingTier, setEditingTier] = useState<AdminUserRow | null>(null);

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

  async function patchUser(
    target: AdminUserRow,
    patch: {
      tier?: UserTier;
      tierMonths?: number | null;
      isAdmin?: boolean;
      studentGroup?: StudentGroup;
    }
  ) {
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
      // 변경 성공 → 화면 상태 동기화
      await load();
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

  const filtered = rows.filter((r) => {
    if (groupFilter !== "all" && r.studentGroup !== groupFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return r.email.toLowerCase().includes(q) || r.name.toLowerCase().includes(q);
  });
  const groupCounts = rows.reduce<Record<StudentGroup, number>>(
    (acc, r) => {
      acc[r.studentGroup] = (acc[r.studentGroup] ?? 0) + 1;
      return acc;
    },
    { external: 0, private: 0, routemath: 0 }
  );

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <section className="mb-6 rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">관리자</p>
        <h1 className="mt-1 text-3xl font-black text-ink">회원 관리</h1>
        <p className="mt-2 text-sm text-slate-600">
          가입된 회원의 등급(개월 수 포함)과 관리자 권한을 변경할 수 있습니다. 만료일이 지난
          유료 등급은 자동으로 Free로 회귀됩니다.
        </p>
      </section>

      <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
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

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-black text-slate-500">분류</span>
          <button
            type="button"
            onClick={() => setGroupFilter("all")}
            className={`rounded-full border px-3 py-1 text-xs font-black transition ${
              groupFilter === "all"
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-line bg-white text-slate-600 hover:border-brand-600"
            }`}
          >
            전체 ({rows.length})
          </button>
          {STUDENT_GROUP_ORDER.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGroupFilter(g)}
              className={`rounded-full border px-3 py-1 text-xs font-black transition ${
                groupFilter === g
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-line bg-white text-slate-600 hover:border-brand-600"
              }`}
            >
              {STUDENT_GROUP_LABELS[g]} ({groupCounts[g] ?? 0})
            </button>
          ))}
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
                  <th className="px-3 py-3">분류</th>
                  <th className="px-3 py-3">등급</th>
                  <th className="px-3 py-3">만료</th>
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
                  const remaining = daysUntil(row.tierExpiresAt);
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
                        <div className="flex items-center gap-1">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-black ${STUDENT_GROUP_STYLES[row.studentGroup] ?? STUDENT_GROUP_STYLES.external}`}
                          >
                            {STUDENT_GROUP_LABELS[row.studentGroup] ?? "외부"}
                          </span>
                          <select
                            value={row.studentGroup}
                            disabled={isSaving}
                            onChange={(e) =>
                              patchUser(row, { studentGroup: e.target.value as StudentGroup })
                            }
                            className="rounded-md border border-line bg-white px-1 py-0.5 text-[11px] font-black text-slate-500 outline-none hover:border-brand-600 focus:border-brand-600 disabled:opacity-50"
                            title="분류 변경"
                          >
                            {STUDENT_GROUP_ORDER.map((g) => (
                              <option key={g} value={g}>
                                {STUDENT_GROUP_LABELS[g]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                              row.tier === "free"
                                ? "bg-slate-100 text-slate-600"
                                : "bg-brand-50 text-brand-700"
                            }`}
                          >
                            {USER_TIER_LABELS[row.tier as UserTier] ?? row.tier}
                          </span>
                          {row.tierExpired && row.tierRaw !== "free" ? (
                            <span className="rounded-full bg-coral-50 px-2 py-0.5 text-[10px] font-black text-coral-600">
                              만료됨
                            </span>
                          ) : null}
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => setEditingTier(row)}
                            className="rounded-md border border-line px-2 py-0.5 text-[11px] font-black text-slate-500 hover:border-brand-600 hover:text-brand-700 disabled:opacity-50"
                          >
                            변경
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {row.tierRaw === "free" || !row.tierExpiresAt ? (
                          <span className="text-slate-400">영구</span>
                        ) : remaining !== null && remaining > 0 ? (
                          <span className="text-slate-700">
                            {formatDate(row.tierExpiresAt)}
                            <span className="ml-1 text-slate-400">({remaining}일 남음)</span>
                          </span>
                        ) : (
                          <span className="text-coral-600">{formatDate(row.tierExpiresAt)} 지남</span>
                        )}
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
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/users/${row.id}`}
                            className="rounded-md border border-brand-300 px-3 py-1 text-xs font-black text-brand-700 hover:bg-brand-50"
                          >
                            상세
                          </Link>
                          <button
                            type="button"
                            onClick={() => deleteUser(row)}
                            disabled={isDeleting || isSelf}
                            title={isSelf ? "본인 계정은 삭제할 수 없습니다" : "회원 삭제"}
                            className="rounded-md border border-red-300 px-3 py-1 text-xs font-black text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {isDeleting ? "삭제 중..." : "삭제"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editingTier ? (
        <TierEditModal
          row={editingTier}
          onClose={() => setEditingTier(null)}
          onSave={async (tier, months) => {
            await patchUser(editingTier, { tier, tierMonths: months });
            setEditingTier(null);
          }}
        />
      ) : null}
    </main>
  );
}

function TierEditModal({
  row,
  onClose,
  onSave,
}: {
  row: AdminUserRow;
  onClose: () => void;
  onSave: (tier: UserTier, months: number | null) => Promise<void>;
}) {
  const [tier, setTier] = useState<UserTier>((row.tierRaw as UserTier) ?? "free");
  // 현재 row의 잔여 개월에 가장 가까운 preset을 초기값으로.
  const [months, setMonths] = useState<number | null>(() => {
    if (row.tierRaw === "free" || !row.tierExpiresAt) return null;
    const d = daysUntil(row.tierExpiresAt);
    if (d === null || d <= 0) return 1;
    if (d <= 35) return 1;
    if (d <= 100) return 3;
    if (d <= 200) return 6;
    return 12;
  });
  const [submitting, setSubmitting] = useState(false);

  const isFree = tier === "free";

  async function submit() {
    setSubmitting(true);
    try {
      await onSave(tier, isFree ? null : months);
    } finally {
      setSubmitting(false);
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
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-line px-6 py-4">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-brand-600">등급 변경</p>
          <h2 className="mt-1 truncate text-lg font-black text-ink">{row.email || row.name}</h2>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <label className="mb-2 block text-xs font-black text-slate-500">등급</label>
            <div className="flex flex-wrap gap-2">
              {USER_TIER_ORDER.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTier(t)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-black transition ${
                    tier === t
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-line bg-white text-slate-600 hover:border-brand-600 hover:text-brand-700"
                  }`}
                >
                  {USER_TIER_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-black text-slate-500">기간</label>
            <div className={`flex flex-wrap gap-2 ${isFree ? "opacity-50" : ""}`}>
              {PRESET_MONTHS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  disabled={isFree}
                  onClick={() => setMonths(p.value)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-black transition ${
                    months === p.value && !isFree
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-line bg-white text-slate-600 hover:border-brand-600"
                  } disabled:cursor-not-allowed`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span>또는 직접 입력 (개월):</span>
              <input
                type="number"
                min={1}
                max={120}
                disabled={isFree}
                value={months ?? ""}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!Number.isFinite(v) || v <= 0) setMonths(null);
                  else setMonths(Math.min(120, v));
                }}
                placeholder="영구"
                className="w-20 rounded-md border border-line px-2 py-1 text-center text-xs font-bold text-ink outline-none focus:border-brand-600 disabled:bg-slate-50"
              />
            </div>
            {!isFree ? (
              <p className="mt-2 text-xs text-slate-500">
                {months === null
                  ? "→ 만료일 없음(영구). 관리자가 다시 변경하기 전까지 유지됩니다."
                  : `→ 약 ${months}개월 후(${formatDate(addMonthsIso(months))})에 자동으로 Free로 회귀합니다.`}
              </p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">→ Free 등급은 만료 개념이 없습니다.</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line bg-slate-50 px-6 py-4">
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
            disabled={submitting}
            className="rounded-md bg-brand-600 px-5 py-2 text-sm font-black text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}

function addMonthsIso(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}
