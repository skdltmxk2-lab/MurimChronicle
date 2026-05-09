"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { isAdminUser } from "@/lib/auth/mockAuth";
import { adminFetch } from "@/lib/api/adminFetch";
import { USER_TIER_LABELS, type UserTier } from "@/types/auth";

type Category = "weakness" | "subject-mock" | "unit-test" | "daily" | "real";

type StatsResponse = {
  ok: true;
  user: { id: string; email: string; name: string; tier: string; isAdmin: boolean };
  summary: {
    totalAttempts: number;
    totalProblems: number;
    totalCorrect: number;
    totalWrong: number;
    accuracy: number;
    categoryCounts: Record<Category, number>;
    categoryLabels: Record<Category, string>;
  };
  recentAttempts: Array<{
    attemptId: string;
    examId: string;
    category: Category;
    categoryLabel: string;
    title: string;
    problems: number;
    correct: number;
    wrong: number;
    accuracy: number;
    takenAt: string;
  }>;
  weakness: {
    bySubject: Array<{ subject: string; total: number; wrong: number; correct: number; accuracy: number }>;
    weakestUnits: Array<{ subject: string; unit: string; total: number; wrong: number; accuracy: number; last_attempt_at: string }>;
    bestUnits: Array<{ subject: string; unit: string; total: number; wrong: number; accuracy: number; last_attempt_at: string }>;
    allUnits: Array<{ subject: string; unit: string; total: number; wrong: number; accuracy: number; last_attempt_at: string }>;
  };
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function pct(v: number): string {
  return `${Math.round(v * 100)}%`;
}

const CATEGORY_COLORS: Record<Category, string> = {
  weakness: "bg-coral-50 text-coral-700",
  "subject-mock": "bg-amber-50 text-amber-700",
  "unit-test": "bg-mint-50 text-mint-700",
  daily: "bg-brand-50 text-brand-700",
  real: "bg-slate-100 text-slate-700",
};

export function AdminUserDetailClient({ userId }: { userId: string }) {
  const { user, authChecked } = useAuth();
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await adminFetch(`/api/admin/users/${userId}/stats`);
      const json = (await res.json()) as StatsResponse | { ok: false; message?: string };
      if (!("ok" in json) || !json.ok) {
        setError(("message" in json && json.message) || "학습 통계를 불러오지 못했습니다.");
        return;
      }
      setData(json);
    } catch {
      setError("학습 통계를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authChecked) return;
    if (!isAdminUser(user)) return;
    load();
  }, [authChecked, user, userId]);

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

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <section className="mb-6 rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link href="/admin/users" className="text-xs font-black text-slate-500 hover:text-brand-700">
              ← 회원 관리
            </Link>
            <h1 className="mt-2 text-3xl font-black text-ink">
              {data?.user.name || "—"}
              <span className="ml-2 text-sm font-bold text-slate-500">{data?.user.email}</span>
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              {data?.user.tier ? (
                <span
                  className={`rounded-full px-2 py-0.5 font-black ${
                    data.user.tier === "free"
                      ? "bg-slate-100 text-slate-600"
                      : "bg-brand-50 text-brand-700"
                  }`}
                >
                  {USER_TIER_LABELS[data.user.tier as UserTier] ?? data.user.tier}
                </span>
              ) : null}
              {data?.user.isAdmin ? (
                <span className="rounded-full bg-ink px-2 py-0.5 font-black text-white">ADMIN</span>
              ) : null}
            </div>
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
      </section>

      {error ? (
        <div className="mb-4 rounded-md bg-coral-50 px-4 py-3 text-sm font-bold text-coral-600">{error}</div>
      ) : null}

      {!data && loading ? (
        <p className="py-12 text-center text-sm text-slate-400">불러오는 중...</p>
      ) : !data ? null : (
        <>
          {/* 요약 카드 */}
          <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryCard label="시험 응시" value={`${data.summary.totalAttempts}회`} />
            <SummaryCard label="푼 문제" value={`${data.summary.totalProblems}문제`} />
            <SummaryCard label="정답" value={`${data.summary.totalCorrect}개`} sub={`오답 ${data.summary.totalWrong}`} />
            <SummaryCard label="누적 정답률" value={pct(data.summary.accuracy)} />
          </section>

          {/* 시험 유형별 카운트 */}
          <section className="mb-6 rounded-lg border border-line bg-white p-6 shadow-soft">
            <h2 className="mb-4 text-lg font-black text-ink">시험 유형별 응시 현황</h2>
            {data.summary.totalAttempts === 0 ? (
              <p className="text-sm text-slate-400">아직 응시한 시험이 없습니다.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {(Object.keys(data.summary.categoryLabels) as Category[]).map((cat) => (
                  <div
                    key={cat}
                    className={`rounded-lg border border-line px-4 py-3 ${
                      data.summary.categoryCounts[cat] > 0 ? "" : "opacity-50"
                    }`}
                  >
                    <div className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-black ${CATEGORY_COLORS[cat]}`}>
                      {data.summary.categoryLabels[cat]}
                    </div>
                    <div className="mt-2 text-2xl font-black text-ink">
                      {data.summary.categoryCounts[cat]}
                      <span className="ml-1 text-xs font-bold text-slate-500">회</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 최근 응시 */}
          <section className="mb-6 rounded-lg border border-line bg-white p-6 shadow-soft">
            <h2 className="mb-4 text-lg font-black text-ink">최근 응시 (최대 10개)</h2>
            {data.recentAttempts.length === 0 ? (
              <p className="text-sm text-slate-400">기록 없음</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-line text-left text-xs font-black uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">유형</th>
                      <th className="px-3 py-2">시험</th>
                      <th className="px-3 py-2 text-right">문제 수</th>
                      <th className="px-3 py-2 text-right">정답률</th>
                      <th className="px-3 py-2 text-right">응시 시각</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentAttempts.map((a) => (
                      <tr key={a.attemptId} className="border-b border-line/50">
                        <td className="px-3 py-2">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${CATEGORY_COLORS[a.category]}`}>
                            {a.categoryLabel}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-700">{a.title}</td>
                        <td className="px-3 py-2 text-right font-bold text-ink">
                          {a.correct}/{a.problems}
                        </td>
                        <td className="px-3 py-2 text-right font-black text-brand-700">
                          {pct(a.accuracy)}
                        </td>
                        <td className="px-3 py-2 text-right text-xs text-slate-500">
                          {formatDateTime(a.takenAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* 과목별 정답률 */}
          <section className="mb-6 rounded-lg border border-line bg-white p-6 shadow-soft">
            <h2 className="mb-4 text-lg font-black text-ink">과목별 정답률</h2>
            {data.weakness.bySubject.length === 0 ? (
              <p className="text-sm text-slate-400">아직 데이터 없음</p>
            ) : (
              <div className="space-y-3">
                {data.weakness.bySubject.map((s) => (
                  <div key={s.subject}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-black text-ink">{s.subject}</span>
                      <span className="text-xs text-slate-500">
                        {s.correct}/{s.total} (오답 {s.wrong})
                        <span className="ml-2 font-black text-brand-700">{pct(s.accuracy)}</span>
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-brand-600 transition-all"
                        style={{ width: `${Math.round(s.accuracy * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 취약·강점 단원 */}
          <section className="mb-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-line bg-white p-6 shadow-soft">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-coral-700">
                <span>🎯</span>
                <span>가장 취약한 단원 (Top 5)</span>
              </h2>
              {data.weakness.weakestUnits.length === 0 ? (
                <p className="text-sm text-slate-400">시도 ≥ 3 단원이 아직 부족합니다.</p>
              ) : (
                <ul className="space-y-2">
                  {data.weakness.weakestUnits.map((u, i) => (
                    <li
                      key={`${u.subject}-${u.unit}`}
                      className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-coral-50 px-2 py-0.5 text-[10px] font-black text-coral-700">
                            #{i + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-500">{u.subject}</span>
                        </div>
                        <div className="mt-1 truncate font-black text-ink">{u.unit}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">{u.total - u.wrong}/{u.total}</div>
                        <div className="text-sm font-black text-coral-600">{pct(u.accuracy)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-lg border border-line bg-white p-6 shadow-soft">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-mint-700">
                <span>💪</span>
                <span>가장 잘하는 단원 (Top 5)</span>
              </h2>
              {data.weakness.bestUnits.length === 0 ? (
                <p className="text-sm text-slate-400">시도 ≥ 3 단원이 아직 부족합니다.</p>
              ) : (
                <ul className="space-y-2">
                  {data.weakness.bestUnits.map((u, i) => (
                    <li
                      key={`${u.subject}-${u.unit}`}
                      className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-mint-50 px-2 py-0.5 text-[10px] font-black text-mint-700">
                            #{i + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-500">{u.subject}</span>
                        </div>
                        <div className="mt-1 truncate font-black text-ink">{u.unit}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">{u.total - u.wrong}/{u.total}</div>
                        <div className="text-sm font-black text-mint-700">{pct(u.accuracy)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* 전체 단원 분포 */}
          <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
            <h2 className="mb-4 text-lg font-black text-ink">전체 단원별 정답률 (정답률 낮은 순)</h2>
            {data.weakness.allUnits.length === 0 ? (
              <p className="text-sm text-slate-400">아직 데이터 없음</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-line text-left text-xs font-black uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">과목</th>
                      <th className="px-3 py-2">단원</th>
                      <th className="px-3 py-2 text-right">시도</th>
                      <th className="px-3 py-2 text-right">오답</th>
                      <th className="px-3 py-2 text-right">정답률</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.weakness.allUnits.map((u) => (
                      <tr key={`${u.subject}-${u.unit}`} className="border-b border-line/50">
                        <td className="px-3 py-2 text-xs font-bold text-slate-500">{u.subject}</td>
                        <td className="px-3 py-2 font-bold text-ink">{u.unit}</td>
                        <td className="px-3 py-2 text-right">{u.total}</td>
                        <td className="px-3 py-2 text-right text-coral-600">{u.wrong}</td>
                        <td
                          className={`px-3 py-2 text-right font-black ${
                            u.accuracy < 0.4
                              ? "text-coral-600"
                              : u.accuracy < 0.7
                                ? "text-amber-700"
                                : "text-mint-700"
                          }`}
                        >
                          {pct(u.accuracy)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
      <div className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-black text-ink">{value}</div>
      {sub ? <div className="mt-0.5 text-xs text-slate-500">{sub}</div> : null}
    </div>
  );
}
