"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";

type Feature = { emoji: string; title: string; desc: string; href?: string };

const FEATURES: Feature[] = [
  { emoji: "🔤", title: "단어 테스트", desc: "빈출 어휘를 4지선다로 점검", href: "/student/english/words" },
  { emoji: "📌", title: "틀린 단어", desc: "테스트에서 틀린 단어 모아보기", href: "/student/english/wrong-words" },
  { emoji: "🧩", title: "문법 문제", desc: "핵심 문법 포인트 객관식 문제" },
  { emoji: "📖", title: "독해 문제", desc: "짧은 지문 + 문항으로 독해 연습" },
  { emoji: "🧠", title: "논리 문제", desc: "문장 배열·추론 등 논리 유형" },
];

export default function EnglishHomePage() {
  const { user, authChecked } = useAuth();

  if (!authChecked) return null;

  if (!user) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-16">
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
    <main className="mx-auto max-w-6xl px-5 py-8">
      <section className="mb-6 rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">루트편입 · 편입영어</p>
        <h1 className="mt-2 text-3xl font-black text-ink">편입영어 학습</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          {user.name}님, 단어부터 차근차근 준비하세요. 커뮤니티·실시간 채팅은 수학과 함께 공유돼요.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {FEATURES.map((f) =>
          f.href ? (
            <Link
              key={f.title}
              href={f.href}
              className="group flex flex-col rounded-xl border border-line bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-600 hover:shadow-lg"
            >
              <div className="text-4xl">{f.emoji}</div>
              <h2 className="mt-3 text-lg font-black text-ink">{f.title}</h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">{f.desc}</p>
              <div className="mt-auto pt-5 text-xs font-black text-brand-700 group-hover:text-brand-800">시작하기 →</div>
            </Link>
          ) : (
            <div key={f.title} className="relative flex flex-col rounded-xl border border-line bg-white p-6 shadow-soft">
              <span className="absolute right-4 top-4 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">
                준비 중
              </span>
              <div className="text-4xl">{f.emoji}</div>
              <h2 className="mt-3 text-lg font-black text-ink">{f.title}</h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">{f.desc}</p>
              <button type="button" disabled className="mt-5 cursor-not-allowed rounded-md bg-slate-100 py-2.5 text-sm font-black text-slate-400">
                곧 제공됩니다
              </button>
            </div>
          )
        )}
      </section>
    </main>
  );
}
