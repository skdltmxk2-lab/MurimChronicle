"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { EnglishWelcomeIntro, ENGLISH_INTRO_KEY } from "@/components/english/EnglishWelcomeIntro";
import { EnglishHeroCTAs } from "@/components/english/EnglishHeroCTAs";

type Feature = {
  emoji: string;
  title: string;
  desc: string;
  href?: string;
  tint: string;
  cta: string;
};

const FEATURES: Feature[] = [
  {
    emoji: "🔤",
    title: "단어 테스트",
    desc: "단어 테스트 + 단어 학습을 한 곳에서",
    href: "/student/english/words",
    tint: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100",
    cta: "text-brand-700",
  },
  {
    emoji: "✍️",
    title: "단어 문제",
    desc: "문장 속 밑줄 친 단어의 유의어·반의어 고르기",
    tint: "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-200",
    cta: "text-orange-700",
  },
  {
    emoji: "🧠",
    title: "논리 문제",
    desc: "문장 배열·추론 등 논리 유형",
    tint: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
    cta: "text-amber-700",
  },
  {
    emoji: "🧩",
    title: "문법 문제",
    desc: "핵심 문법 포인트 객관식 문제",
    tint: "bg-mint-50 text-mint-700 dark:bg-mint-500/15 dark:text-mint-200",
    cta: "text-mint-700",
  },
  {
    emoji: "📖",
    title: "독해 문제",
    desc: "짧은 지문 + 문항으로 독해 연습",
    tint: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200",
    cta: "text-sky-700",
  },
];

export default function EnglishHomePage() {
  const { user, authChecked } = useAuth();
  const [introOpen, setIntroOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    try {
      if (!localStorage.getItem(ENGLISH_INTRO_KEY)) setIntroOpen(true);
    } catch {
      // 무시
    }
  }, [user]);

  if (!authChecked) return null;

  if (!user) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-16">
        <section className="mx-auto max-w-lg rounded-2xl border border-line bg-white p-10 text-center shadow-soft">
          <div className="mb-5 text-5xl">🔒</div>
          <h1 className="text-2xl font-black text-ink">로그인이 필요합니다</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">편입영어 학습을 이용하려면 로그인해 주세요.</p>
          <Link
            href="/student/register"
            className="mt-6 inline-block rounded-md bg-brand-600 px-6 py-3 text-sm font-black text-white hover:bg-brand-700"
          >
            회원가입
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      {introOpen ? (
        <EnglishWelcomeIntro name={user.name} onClose={() => setIntroOpen(false)} />
      ) : null}

      {/* 히어로 */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 p-8 text-white shadow-soft">
        <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 size-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/70">
            루트편입 · 편입영어
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">편입영어 학습</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/85">
            {user.name}님, 단어부터 차근차근 시작해요.
          </p>
          <EnglishHeroCTAs />
        </div>
      </section>

      {/* 학습 카드 */}
      <h2 className="mb-3 mt-8 text-xs font-black uppercase tracking-[0.18em] text-brand-600">
        학습 유형
      </h2>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) =>
          f.href ? (
            <Link
              key={f.title}
              href={f.href}
              className="group flex flex-col rounded-2xl border border-line bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:border-brand-400 hover:shadow-lg"
            >
              <div className={`grid size-12 place-items-center rounded-2xl text-2xl ${f.tint}`}>{f.emoji}</div>
              <h2 className="mt-4 text-lg font-black text-ink">{f.title}</h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">{f.desc}</p>
              <div className={`mt-auto flex items-center gap-1 pt-6 text-sm font-black ${f.cta}`}>
                시작하기 <span className="transition group-hover:translate-x-0.5">→</span>
              </div>
            </Link>
          ) : (
            <div
              key={f.title}
              className="relative flex flex-col rounded-2xl border border-line bg-white/70 p-6 shadow-soft"
            >
              <span className="absolute right-4 top-4 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-400">
                준비 중
              </span>
              <div className={`grid size-12 place-items-center rounded-2xl text-2xl opacity-50 ${f.tint}`}>{f.emoji}</div>
              <h2 className="mt-4 text-lg font-black text-slate-500">{f.title}</h2>
              <p className="mt-1 text-sm leading-5 text-slate-400">{f.desc}</p>
              <div className="mt-auto pt-6 text-sm font-black text-slate-300">곧 제공됩니다</div>
            </div>
          )
        )}
      </section>
    </main>
  );
}
