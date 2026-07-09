"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { StudentHeader } from "@/components/layout/StudentHeader";
import { StudentFooter } from "@/components/layout/StudentFooter";

type Feature = {
  emoji: string;
  title: string;
  desc: string;
  tint: string;
};

const FEATURES: Feature[] = [
  {
    emoji: "📚",
    title: "단원별 학습",
    desc: "5과목 · 단원 골라 10·15·20문항. 한 번 본 문제는 뒤로 밀려요.",
    tint: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100",
  },
  {
    emoji: "⏱️",
    title: "과목별 모의고사",
    desc: "한 과목 20문항을 50분 안에. 시간 압박 속 실력 점검.",
    tint: "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-200",
  },
  {
    emoji: "📝",
    title: "실전 모의고사",
    desc: "5과목 × 5문항 = 25문항 실전형. 기출·학교별·파이널 4종.",
    tint: "bg-mint-50 text-mint-700 dark:bg-mint-500/15 dark:text-mint-200",
  },
  {
    emoji: "🎯",
    title: "AI 취약유형 모의고사",
    desc: "내가 자주 틀리는 유형을 분석해 25문항 맞춤 출제.",
    tint: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
  },
  {
    emoji: "📅",
    title: "데일리 테스트",
    desc: "월별 커리큘럼에 맞춰 5문항씩 매일. 누적 학습.",
    tint: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200",
  },
  {
    emoji: "🔍",
    title: "AI 문제 검색·풀이·튜터",
    desc: "캡쳐 한 장 → 유사 문제 + AI 풀이 + 1:1 질문. (PRO)",
    tint: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100",
  },
  {
    emoji: "🔤",
    title: "편입영어 단어 테스트",
    desc: "4지선다 + 틀린 단어 모음. 단어부터 차근차근.",
    tint: "bg-coral-50 text-coral-600 dark:bg-coral-50 dark:text-coral-600",
  },
  {
    emoji: "📊",
    title: "오답·학습 기록",
    desc: "최근 오답과 취약 단원을 모아 다음 학습으로 바로 이어집니다.",
    tint: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-100",
  },
];

export function LandingClient({
  displayedUsers,
  questionStat,
}: {
  displayedUsers: number;
  questionStat: string;
}) {
  const router = useRouter();
  const { user, authChecked } = useAuth();

  const STATS = [
    { label: "등록 문항", value: questionStat },
    { label: "기출 학교", value: "28개" },
    { label: "사용 중인 학생", value: `${displayedUsers.toLocaleString("ko-KR")}명` },
    { label: "문항·해설 품질 점검", value: "상시" },
  ];

  // 이미 로그인된 사용자는 마케팅 랜딩 대신 학습 페이지로
  useEffect(() => {
    if (authChecked && user) {
      router.replace("/student/exams");
    }
  }, [authChecked, user, router]);

  // 로그인 상태 판정 전엔 빈 화면 (FOUC 방지)
  if (!authChecked) return null;
  if (user) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <StudentHeader />

      <main className="flex-1">
        {/* ─────── HERO ─────── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-600 to-mint-600" />
          <div className="pointer-events-none absolute -left-20 top-10 size-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 bottom-0 size-80 rounded-full bg-mint-200/25 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-5 py-20 text-white sm:py-28">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/75">
              ROUTE · 편입수학 · 편입영어
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
              편입 합격까지, <br className="sm:hidden" />
              가장 빠른 길.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
              편입수학·편입영어 <b className="font-black">{questionStat} 문항</b> ·
              <b className="font-black">AI 풀이·검색·튜터</b> ·{" "}
              <b className="font-black">취약유형 맞춤 모의고사</b>까지 한 곳에서.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/student/register"
                className="rounded-full bg-white px-7 py-3.5 text-sm font-black text-brand-700 shadow-xl transition hover:scale-[1.04]"
              >
                무료로 시작하기 →
              </Link>
              <Link
                href="/student/pricing"
                className="rounded-full border border-white/40 px-7 py-3.5 text-sm font-black text-white/95 transition hover:bg-white/10"
              >
                PRO 알아보기
              </Link>
            </div>

            {/* 통계 */}
            <div className="mt-10 grid max-w-3xl grid-cols-2 gap-4 border-t border-white/20 pt-5 sm:grid-cols-4 sm:gap-5">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-black text-white sm:text-3xl">{s.value}</div>
                  <div className="mt-1 text-[11px] font-bold leading-snug text-white/75">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────── FEATURES ─────── */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <h2 className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">
            All-in-one
          </h2>
          <p className="mt-2 text-3xl font-black leading-tight text-ink sm:text-4xl">
            필요한 모든 학습 도구, <br className="sm:hidden" />
            한 사이트에.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            단원별 학습부터 실전 모의고사, AI 도우미와 단어 테스트까지 — 별도 앱·교재 없이 끝.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-line bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-lg"
              >
                <div className={`grid size-12 place-items-center rounded-2xl text-2xl ${f.tint}`}>
                  {f.emoji}
                </div>
                <h3 className="mt-4 text-lg font-black text-ink">{f.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─────── 학습 흐름 ─────── */}
        <section className="bg-slate-50 py-16 dark:bg-white/[0.02] sm:py-20">
          <div className="mx-auto max-w-5xl px-5">
            <h2 className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">
              Study Flow
            </h2>
            <p className="mt-2 text-3xl font-black leading-tight text-ink sm:text-4xl">
              풀고, 확인하고, <br className="sm:hidden" />
              다시 뽑는 흐름.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ["01", "단원별 문제 풀이", "과목과 단원을 고르면 바로 문제를 풀 수 있습니다."],
                ["02", "오답·해설 확인", "틀린 문제는 해설과 함께 다시 볼 수 있습니다."],
                ["03", "취약유형 재구성", "누적 기록을 바탕으로 다음 모의고사를 구성합니다."],
              ].map(([step, title, desc]) => (
                <div key={step} className="rounded-lg border border-line bg-white p-5 shadow-soft">
                  <div className="text-xs font-black text-brand-600">{step}</div>
                  <h3 className="mt-3 text-lg font-black text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────── PRICING ─────── */}
        <section className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
          <div className="text-center">
            <h2 className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">
              Pricing
            </h2>
            <p className="mt-2 text-3xl font-black leading-tight text-ink sm:text-4xl">
              핵심은 무료, 실전은 PRO.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {/* Free */}
            <div className="rounded-2xl border-2 border-slate-300 bg-slate-100 p-7 shadow-soft">
              <div className="text-3xl">🌱</div>
              <h3 className="mt-2 text-2xl font-black text-slate-700">Free</h3>
              <p className="mt-1 text-sm text-slate-600">핵심 학습 기능을 무료로</p>
              <div className="mt-4 text-3xl font-black text-slate-700">무료</div>
              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                <li>✓ 단원별 학습 (무제한)</li>
                <li>✓ 과목별 모의고사</li>
                <li>✓ 데일리 테스트</li>
                <li>✓ AI 취약유형 모의고사</li>
                <li>✓ 오답 복습 7일</li>
              </ul>
            </div>

            {/* PRO */}
            <div className="relative rounded-2xl border-2 border-amber-400 bg-amber-50 p-7 shadow-lg ring-2 ring-amber-200">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black tracking-wider text-white shadow-md">
                ⭐ 추천
              </span>
              <div className="text-3xl">🏆</div>
              <h3 className="mt-2 text-2xl font-black text-amber-700">Pro</h3>
              <p className="mt-1 text-sm text-slate-600">광고 없이, 모든 기능을 한 번에</p>
              <div className="mt-4 text-3xl font-black text-amber-700">월 29,900원</div>
              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                <li>✓ Free 모든 기능</li>
                <li>✓ 실전 모의고사 (기출·학교별·파이널)</li>
                <li>✓ AI 문제 검색·풀이·튜터</li>
                <li>✓ 광고 제거</li>
                <li>✓ 오답 복습 30일</li>
                <li>✓ 실전 학습 기록 확장</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/student/pricing"
              className="text-sm font-black text-brand-700 hover:underline"
            >
              가격 자세히 비교하기 →
            </Link>
          </div>
        </section>

        {/* ─────── 최종 CTA ─────── */}
        <section className="mx-auto max-w-5xl px-5 pb-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 p-10 text-center text-white shadow-soft sm:p-14">
            <div className="pointer-events-none absolute -right-12 -top-12 size-60 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-10 size-56 rounded-full bg-mint-200/20 blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl font-black leading-tight sm:text-4xl">
                지금 무료로 시작하고, <br className="sm:hidden" />
                오늘부터 한 걸음 더.
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/85 sm:text-base">
                가입 1분 · 신용카드 불필요 · 데일리 5문항 바로 시작
              </p>
              <Link
                href="/student/register"
                className="mt-7 inline-block rounded-full bg-white px-8 py-4 text-sm font-black text-brand-700 shadow-xl transition hover:scale-[1.04]"
              >
                무료로 시작하기 →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <StudentFooter />
    </div>
  );
}
