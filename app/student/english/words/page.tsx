"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";

type SubMenu = {
  emoji: string;
  title: string;
  desc: string;
  href: string;
  tint: string;
  cta: string;
};

const MENUS: SubMenu[] = [
  {
    emoji: "📝",
    title: "단어 테스트",
    desc: "20개씩 끊어 문제로 풀어요 (등록 순서대로)",
    href: "/student/english/words/test",
    tint: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100",
    cta: "text-brand-700",
  },
  {
    emoji: "📚",
    title: "단어 학습",
    desc: "50개씩 day로 끊어서 외워요. 진척도가 저장됩니다.",
    href: "/student/english/words/learn",
    tint: "bg-mint-50 text-mint-700 dark:bg-mint-500/15 dark:text-mint-100",
    cta: "text-mint-700",
  },
];

export default function EnglishWordsMenuPage() {
  const { user, authChecked } = useAuth();

  if (!authChecked) return null;
  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16 text-center">
        <h1 className="text-2xl font-black text-ink">로그인이 필요합니다</h1>
        <Link
          href="/student/register"
          className="mt-6 inline-block rounded-md bg-brand-600 px-6 py-3 text-sm font-black text-white"
        >
          회원가입
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <div className="mb-5">
        <Link href="/student/english" className="text-xs font-black text-slate-500 hover:text-brand-700">
          ← 편입영어
        </Link>
        <h1 className="mt-1 text-2xl font-black text-ink">🔤 단어</h1>
        <p className="mt-2 text-sm text-slate-600">
          단어 테스트(문제 풀이)와 단어 학습(외우기) 중에서 골라보세요.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        {MENUS.map((m) => (
          <Link
            key={m.title}
            href={m.href}
            className="group flex flex-col rounded-2xl border border-line bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:border-brand-400 hover:shadow-lg"
          >
            <div className={`grid size-12 place-items-center rounded-2xl text-2xl ${m.tint}`}>
              {m.emoji}
            </div>
            <h2 className="mt-4 text-lg font-black text-ink">{m.title}</h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">{m.desc}</p>
            <div className={`mt-auto flex items-center gap-1 pt-6 text-sm font-black ${m.cta}`}>
              시작하기 <span className="transition group-hover:translate-x-0.5">→</span>
            </div>
          </Link>
        ))}
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/student/english/wrong-words"
          className="rounded-full border border-line px-4 py-2 text-xs font-black text-slate-600 hover:border-brand-400 hover:text-brand-700"
        >
          📌 내 틀린 단어
        </Link>
        <Link
          href="/student/english/words/learn/review"
          className="rounded-full border border-line px-4 py-2 text-xs font-black text-slate-600 hover:border-brand-400 hover:text-brand-700"
        >
          📖 단어학습 복습
        </Link>
        <Link
          href="/student/english/daily"
          className="rounded-full border border-line px-4 py-2 text-xs font-black text-slate-600 hover:border-brand-400 hover:text-brand-700"
        >
          📅 데일리테스트
        </Link>
      </div>
    </main>
  );
}
