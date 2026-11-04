"use client";

import Link from "next/link";

const CTAS: { href: string; label: string }[] = [
  { href: "/student/english/wrong-words", label: "내 틀린 단어" },
  { href: "/student/english/daily", label: "데일리테스트" },
  { href: "/student/english/words/learn/review", label: "단어학습 복습" },
];

export function EnglishHeroCTAs() {
  return (
    <div className="tz-english-shortcuts">
      {CTAS.map((c) => (
        <Link
          key={c.href}
          href={c.href}
          className="tz-english-shortcuts__link"
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}
