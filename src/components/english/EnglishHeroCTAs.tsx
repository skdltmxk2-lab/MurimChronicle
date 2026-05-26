"use client";

import Link from "next/link";

const CTAS: { href: string; label: string }[] = [
  { href: "/student/english/wrong-words", label: "📌 내 틀린 단어" },
  { href: "/student/english/daily", label: "📅 데일리테스트" },
  { href: "/student/english/words/learn/review", label: "📖 단어학습 복습" },
];

export function EnglishHeroCTAs() {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      {CTAS.map((c) => (
        <Link
          key={c.href}
          href={c.href}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-black text-white ring-1 ring-inset ring-white/25 backdrop-blur transition hover:bg-white/25"
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}
