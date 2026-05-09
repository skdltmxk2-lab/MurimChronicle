"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { useAuth } from "@/lib/auth/AuthContext";
import { canUseTier, tierLockMessage } from "@/lib/auth/tierGuard";
import { adminFetch } from "@/lib/api/adminFetch";

type UnitStat = {
  subject: string; unit: string;
  total: number; wrong: number; accuracy: number;
};

type Analysis = {
  ready: boolean;
  totalAttempts: number;
  overallAccuracy: number;
  unitStats: UnitStat[];
  topWeakUnits: UnitStat[];
  subjectAccuracy: Array<{ subject: string; accuracy: number; total: number }>;
  recentTrend: Array<{ weekStart: string; accuracy: number }>;
};

type Eligibility = {
  eligible: boolean;
  tierGate: "allowed" | "requires_pro";
  reason?: "insufficient_data" | "too_soon" | "tier_locked";
  progress: {
    solvedSinceLastExam: number;
    requiredQuestions: number;
    daysSinceLastExam: number | null;
    requiredDays: number;
  };
  isFirstExam: boolean;
  examCount: number;
  recommendedAt: string | null;
};

const FIRST_REQUIRED = 200;

export function WeaknessAnalysisClient() {
  const router = useRouter();
  const { user, authChecked } = useAuth();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [showProModal, setShowProModal] = useState(false);

  useEffect(() => {
    if (!authChecked || !user) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      adminFetch("/api/weakness/analysis").then((r) => r.json()),
      adminFetch("/api/weakness/eligibility").then((r) => r.json()),
    ])
      .then(([a, e]) => {
        if (cancelled) return;
        if (a.ok) setAnalysis(a as Analysis);
        if (e.ok) setEligibility(e as Eligibility);
      })
      .catch(() => {
        if (cancelled) return;
        setError("분석 데이터를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [authChecked, user]);

  async function startWeaknessExam() {
    if (!eligibility) return;
    if (eligibility.tierGate !== "allowed") {
      setShowProModal(true);
      return;
    }
    if (!eligibility.eligible) return;
    setGenerating(true);
    setError("");
    try {
      const res = await adminFetch("/api/weakness/exam/generate", {
        method: "POST",
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.message ?? "시험 생성에 실패했습니다.");
        return;
      }
      router.push(`/student/exams/${json.examId}`);
    } catch {
      setError("시험 생성 중 오류가 발생했습니다.");
    } finally {
      setGenerating(false);
    }
  }

  if (!authChecked) return null;
  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <section className="rounded-2xl border border-line bg-white p-10 text-center shadow-soft">
          <div className="mb-4 text-5xl">🔒</div>
          <h1 className="text-2xl font-black text-ink">로그인이 필요합니다</h1>
          <Link
            href="/student/exams"
            className="mt-6 inline-block rounded-md bg-brand-600 px-6 py-3 text-sm font-black text-white"
          >
            돌아가기
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <section className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">
          AI 맞춤 분석
        </p>
        <h1 className="mt-1 text-3xl font-black text-ink">{user.name}님의 취약유형 분석</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          여러분이 푼 문제 데이터를 분석해 자주 틀리는 유형을 찾아 보여드립니다.
          더 많이 풀수록 더 정밀해져요.
        </p>
      </section>

      {error ? (
        <div className="mb-4 rounded-md bg-coral-50 px-4 py-3 text-sm font-bold text-coral-600">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="py-12 text-center text-sm text-slate-400">분석 중...</p>
      ) : !analysis ? (
        <p className="py-12 text-center text-sm text-slate-400">데이터가 없습니다.</p>
      ) : (
        <>
          {/* 종합 카드 */}
          <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="총 풀이" value={`${analysis.totalAttempts}문항`} />
            <Stat label="전체 정답률" value={`${Math.round(analysis.overallAccuracy * 100)}%`} />
            <Stat
              label="응시 횟수"
              value={`${eligibility?.examCount ?? 0}회`}
              hint={
                eligibility?.examCount === 0 ? "첫 응시 대기" : "취약유형 모의고사"
              }
            />
            <Stat
              label="자격 진행률"
              value={
                eligibility?.isFirstExam
                  ? `${Math.min(100, Math.round((analysis.totalAttempts / FIRST_REQUIRED) * 100))}%`
                  : `${Math.min(100, Math.round((eligibility?.progress.solvedSinceLastExam ?? 0) / (eligibility?.progress.requiredQuestions ?? 100) * 100))}%`
              }
              hint={
                eligibility?.isFirstExam
                  ? `${analysis.totalAttempts}/${FIRST_REQUIRED}문항`
                  : `${eligibility?.progress.solvedSinceLastExam ?? 0}/${eligibility?.progress.requiredQuestions ?? 100}`
              }
            />
          </section>

          {/* 약점 TOP 5 */}
          <section className="mb-6 rounded-2xl border border-line bg-white p-6 shadow-soft">
            <h2 className="mb-3 text-lg font-black text-ink">취약 영역 TOP 5</h2>
            {analysis.topWeakUnits.length === 0 ? (
              <p className="text-sm text-slate-500">
                표본이 충분한 단원이 아직 없어요. 단원당 5문항 이상 풀어야 분석이 시작됩니다.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={analysis.topWeakUnits.map((u) => ({
                    name: `${u.subject} · ${u.unit}`,
                    오답률: Math.round((1 - u.accuracy) * 100),
                  }))}
                  layout="vertical"
                  margin={{ left: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} unit="%" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="오답률" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>

          {/* 과목별 정답률 + 추이 */}
          <section className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
              <h2 className="mb-3 text-lg font-black text-ink">과목별 정답률</h2>
              {analysis.subjectAccuracy.length === 0 ? (
                <p className="text-sm text-slate-500">아직 데이터가 없어요.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={analysis.subjectAccuracy.map((s) => ({
                      name: s.subject,
                      정답률: Math.round(s.accuracy * 100),
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} unit="%" />
                    <Tooltip />
                    <Bar dataKey="정답률" fill="#246bfe" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
              <h2 className="mb-3 text-lg font-black text-ink">최근 4주 정답률 추이</h2>
              {analysis.recentTrend.length === 0 ? (
                <p className="text-sm text-slate-500">최근 4주 데이터가 없어요.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart
                    data={analysis.recentTrend.map((r) => ({
                      name: r.weekStart.slice(5),
                      정답률: Math.round(r.accuracy * 100),
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} unit="%" />
                    <Tooltip />
                    <Line type="monotone" dataKey="정답률" stroke="#0b8a61" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          {/* CTA */}
          <CTASection
            eligibility={eligibility}
            analysis={analysis}
            generating={generating}
            onStart={startWeaknessExam}
          />
        </>
      )}

      {showProModal ? <ProUpgradeModal onClose={() => setShowProModal(false)} /> : null}
    </main>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-white px-4 py-3 shadow-soft">
      <div className="text-xs font-bold text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-black text-ink">{value}</div>
      {hint ? <div className="mt-0.5 text-[11px] text-slate-400">{hint}</div> : null}
    </div>
  );
}

function CTASection({
  eligibility, analysis, generating, onStart,
}: {
  eligibility: Eligibility | null;
  analysis: Analysis;
  generating: boolean;
  onStart: () => void;
}) {
  if (!eligibility) return null;

  // 1) 자격 충족 + pro/max
  if (eligibility.eligible && eligibility.tierGate === "allowed") {
    return (
      <section className="rounded-2xl border-2 border-orange-400 bg-gradient-to-br from-orange-500 to-amber-400 p-6 text-white shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-100">
          준비 완료
        </p>
        <h2 className="mt-1 text-2xl font-black">맞춤 시험 응시</h2>
        <p className="mt-2 text-sm leading-6 text-orange-50">
          25문항 / 70분 / 약점 보강 + 미체험 유형 + 오답 복습 + 강점 심화
        </p>
        <button
          type="button"
          onClick={onStart}
          disabled={generating}
          className="mt-4 w-full rounded-lg bg-white px-5 py-3 text-sm font-black text-orange-600 transition hover:brightness-95 disabled:opacity-60"
        >
          {generating ? "시험 만드는 중..." : "지금 응시하기 →"}
        </button>
      </section>
    );
  }

  // 2) Pro 미만
  if (eligibility.tierGate === "requires_pro") {
    return (
      <section className="rounded-2xl border border-orange-200 bg-orange-50 p-6 shadow-soft">
        <h2 className="text-xl font-black text-ink">Pro 이상 등급부터 응시 가능합니다</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          위 분석은 모든 등급에서 보실 수 있어요. 25문항 맞춤 모의고사 응시는
          Pro 이상 등급부터 가능합니다.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="mt-4 w-full rounded-lg bg-orange-600 px-5 py-3 text-sm font-black text-white hover:bg-orange-700"
        >
          Pro 업그레이드 문의하기
        </button>
      </section>
    );
  }

  // 3) 첫 응시 자격 미달 (200문항 미만)
  if (eligibility.isFirstExam && !eligibility.eligible) {
    const progress = Math.min(100, Math.round((analysis.totalAttempts / FIRST_REQUIRED) * 100));
    return (
      <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h2 className="text-xl font-black text-ink">취약유형 모의고사 응시 자격</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          맞춤형 모의고사를 만들려면 충분한 풀이 데이터가 필요해요.
          <br />
          <b className="text-ink">{FIRST_REQUIRED}문항</b> 이상 풀이 후 응시할 수 있습니다.
        </p>
        <div className="mt-4">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-slate-600">진행률</span>
            <span className="text-orange-600">
              {analysis.totalAttempts}/{FIRST_REQUIRED}문항
            </span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-orange-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <Link
          href="/student/exams"
          className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-brand-600 px-5 py-3 text-sm font-black text-white hover:bg-brand-700"
        >
          데일리 테스트로 더 풀러가기
        </Link>
      </section>
    );
  }

  // 4) 재응시 게이트
  const need = (eligibility.progress.requiredQuestions ?? 100) -
               (eligibility.progress.solvedSinceLastExam ?? 0);
  const daysLeft = (eligibility.progress.requiredDays ?? 3) -
                    (eligibility.progress.daysSinceLastExam ?? 0);
  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
      <h2 className="text-xl font-black text-ink">다음 응시까지 조금 더!</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        직전 응시 후 <b>100문항 이상 풀이</b>하고 <b>3일 이상 경과</b>해야 다시 응시할 수 있어요.
      </p>
      <ul className="mt-3 space-y-1 text-sm text-slate-700">
        {need > 0 ? <li>· 추가 풀이 필요: {need}문항</li> : <li>· 풀이 충분 ✓</li>}
        {daysLeft > 0 ? <li>· 추가 경과 필요: {daysLeft}일</li> : <li>· 시간 충분 ✓</li>}
      </ul>
      <Link
        href="/student/exams"
        className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-brand-600 px-5 py-3 text-sm font-black text-white hover:bg-brand-700"
      >
        시험 더 풀러가기
      </Link>
    </section>
  );
}

function ProUpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-b from-orange-50 to-white px-7 pt-9 text-center">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-orange-500 text-3xl">
            🎯
          </div>
          <h2 className="text-xl font-black text-ink">{tierLockMessage("pro")}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            취약유형 모의고사로 자주 틀리는 유형을 집중 공략해 보세요.
            <br />
            업그레이드는 카카오톡 오픈채팅으로 문의해 주세요.
          </p>
        </div>
        <div className="px-7 pb-7 pt-4">
          <a
            href="https://open.kakao.com/o/sBAS3Yti"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] px-5 py-3.5 text-sm font-black text-[#191600]"
          >
            카카오톡 오픈채팅으로 문의하기
          </a>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full rounded-xl px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-600"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
