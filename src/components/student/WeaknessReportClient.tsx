"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { adminFetch } from "@/lib/api/adminFetch";

type TierResult = {
  target: number;
  total: number;
  correct: number;
  percent: number;
  units: Array<{ subject: string; unit: string; accuracyInExam: number }>;
};

type Report = {
  attemptId: string;
  examTitle: string;
  score: { correct: number; total: number; percent: number };
  elapsedSec: number;
  submittedAt: string;
  tierResults: { tier1: TierResult; tier2: TierResult; tier3: TierResult; tier4: TierResult };
  improvements: Array<{ subject: string; unit: string; before: number; after: number; delta: number }>;
  needsReview: Array<{ subject: string; unit: string; accuracy: number; reason: string }>;
  nextExam: { requiredQuestions: number; suggestedUnits: Array<{ subject: string; unit: string }> };
};

const TIER_META = {
  tier1: { label: "약점 단원 보강", emoji: "🎯", color: "from-rose-500 to-rose-400" },
  tier2: { label: "미체험 유형 발굴", emoji: "🔍", color: "from-violet-500 to-violet-400" },
  tier3: { label: "오답 복습", emoji: "📝", color: "from-amber-500 to-amber-400" },
  tier4: { label: "강점 심화", emoji: "🚀", color: "from-emerald-500 to-emerald-400" },
} as const;

function formatDur(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}분 ${s}초`;
}

export function WeaknessReportClient({ attemptId }: { attemptId: string }) {
  const { user, authChecked } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authChecked || !user) return;
    let cancelled = false;
    adminFetch(`/api/weakness/report?attemptId=${attemptId}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (!j.ok) {
          setError(j.message ?? "리포트를 불러오지 못했습니다.");
          return;
        }
        setReport(j.report as Report);
      })
      .catch(() => {
        if (cancelled) return;
        setError("리포트를 불러오는 중 오류가 발생했습니다.");
      });
    return () => { cancelled = true; };
  }, [authChecked, user, attemptId]);

  if (!authChecked) return null;
  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16 text-center">
        <p>로그인이 필요합니다.</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <div className="rounded-2xl border border-line bg-white p-10 text-center shadow-soft">
          <div className="mb-4 text-5xl">⚠️</div>
          <h1 className="text-xl font-black text-ink">{error}</h1>
          <Link
            href="/student/exams"
            className="mt-6 inline-block rounded-md bg-brand-600 px-6 py-3 text-sm font-black text-white"
          >
            시험 목록으로
          </Link>
        </div>
      </main>
    );
  }

  if (!report) {
    return <main className="mx-auto max-w-5xl px-5 py-12 text-center text-sm text-slate-400">리포트 생성 중...</main>;
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      {/* 종합 헤드 */}
      <section className="mb-6 rounded-2xl border border-line bg-white p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">
          취약유형 모의고사 결과
        </p>
        <h1 className="mt-1 text-3xl font-black text-ink">{report.examTitle}</h1>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-line px-4 py-3 text-center">
            <div className="text-xs font-bold text-slate-500">정답</div>
            <div className="mt-1 text-2xl font-black text-ink">
              {report.score.correct}/{report.score.total}
            </div>
          </div>
          <div className="rounded-xl border border-line px-4 py-3 text-center">
            <div className="text-xs font-bold text-slate-500">정답률</div>
            <div className="mt-1 text-2xl font-black text-ink">{report.score.percent}%</div>
          </div>
          <div className="rounded-xl border border-line px-4 py-3 text-center">
            <div className="text-xs font-bold text-slate-500">소요</div>
            <div className="mt-1 text-2xl font-black text-ink">{formatDur(report.elapsedSec)}</div>
          </div>
          <div className="rounded-xl border border-line px-4 py-3 text-center">
            <div className="text-xs font-bold text-slate-500">응시 일시</div>
            <div className="mt-1 text-sm font-black text-ink">
              {new Date(report.submittedAt).toLocaleString("ko-KR", {
                month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4 tier 결과 */}
      <section className="mb-6 grid gap-4 md:grid-cols-2">
        {(["tier1", "tier2", "tier3", "tier4"] as const).map((k) => {
          const t = report.tierResults[k];
          const meta = TIER_META[k];
          return (
            <div
              key={k}
              className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft"
            >
              <div className={`bg-gradient-to-r ${meta.color} px-5 py-4 text-white`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{meta.emoji}</span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide opacity-90">{k.toUpperCase()}</p>
                    <h2 className="text-lg font-black">{meta.label}</h2>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-2xl font-black">{t.percent}%</div>
                    <div className="text-xs opacity-90">{t.correct}/{t.total ?? t.target}</div>
                  </div>
                </div>
              </div>
              <div className="px-5 py-4">
                {t.units.length === 0 ? (
                  <p className="text-sm text-slate-500">출제된 단원이 없습니다.</p>
                ) : (
                  <ul className="space-y-1.5 text-sm">
                    {t.units.map((u, i) => (
                      <li key={`${u.subject}|${u.unit}|${i}`} className="flex items-center justify-between gap-2">
                        <span className="text-slate-700">
                          <b className="text-ink">{u.subject}</b> · {u.unit}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-black ${
                            u.accuracyInExam >= 0.7 ? "bg-mint-50 text-mint-600"
                            : u.accuracyInExam >= 0.4 ? "bg-amber-50 text-amber-600"
                            : "bg-coral-50 text-coral-600"
                          }`}
                        >
                          {Math.round(u.accuracyInExam * 100)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* 종합 변화 */}
      <section className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h2 className="text-lg font-black text-ink">🔥 개선된 영역</h2>
          {report.improvements.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              이번 시험으로 통계 변화가 +20%p 이상인 단원은 아직 없어요.
              한 번 더 풀이하면 데이터가 더 정밀해져요.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {report.improvements.map((i, idx) => (
                <li key={idx} className="rounded-md bg-mint-50 px-3 py-2 text-sm">
                  <b className="text-ink">{i.subject} · {i.unit}</b>
                  <div className="mt-0.5 text-xs text-slate-600">
                    {Math.round(i.before * 100)}% → {Math.round(i.after * 100)}%{" "}
                    <span className="font-black text-mint-600">(+{Math.round(i.delta * 100)}%p)</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h2 className="text-lg font-black text-ink">⚠️ 추가 복습 권장</h2>
          {report.needsReview.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              이번 시험에서 정답률 60% 이하인 단원이 없어요. 좋아요!
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {report.needsReview.map((n, idx) => (
                <li key={idx} className="rounded-md bg-coral-50 px-3 py-2 text-sm">
                  <b className="text-ink">{n.subject} · {n.unit}</b>
                  <div className="mt-0.5 text-xs text-slate-600">
                    {Math.round(n.accuracy * 100)}% — {n.reason}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* 다음 응시 박스 */}
      <section className="rounded-2xl border-2 border-orange-300 bg-orange-50 p-6 shadow-soft">
        <h2 className="text-lg font-black text-ink">📅 다음 응시까지</h2>
        <p className="mt-2 text-sm text-slate-700">
          다음 취약유형 모의고사를 응시하려면 <b>{report.nextExam.requiredQuestions}문항</b> 추가 풀이 + <b>3일</b> 경과가 필요해요.
        </p>
        {report.nextExam.suggestedUnits.length > 0 ? (
          <>
            <p className="mt-4 text-sm font-bold text-slate-700">추천 학습 단원</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {report.nextExam.suggestedUnits.map((s, i) => (
                <span
                  key={i}
                  className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700 ring-1 ring-orange-300"
                >
                  {s.subject} · {s.unit}
                </span>
              ))}
            </div>
          </>
        ) : null}
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Link
            href="/student/exams"
            className="rounded-lg bg-brand-600 px-5 py-3 text-center text-sm font-black text-white hover:bg-brand-700"
          >
            시험 목록으로
          </Link>
          <Link
            href="/student/exams/weakness/analysis"
            className="rounded-lg border border-orange-400 bg-white px-5 py-3 text-center text-sm font-black text-orange-600 hover:bg-orange-100"
          >
            분석 다시 보기
          </Link>
        </div>
      </section>
    </main>
  );
}
