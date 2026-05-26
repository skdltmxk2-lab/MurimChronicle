"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const ROTATE: { href: string; label: string }[] = [
  { href: "/student/english/wrong-words", label: "📌 내 틀린 단어" },
  { href: "/student/english/daily", label: "📅 데일리테스트" },
];

const ROTATE_INTERVAL_MS = 3800;

export function EnglishHeroCTAs() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => {
      setI((prev) => (prev + 1) % ROTATE.length);
    }, ROTATE_INTERVAL_MS);
    return () => window.clearInterval(t);
  }, []);

  const active = ROTATE[i];

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      {/* 회전 CTA: 내 틀린 단어 ↔ 데일리테스트 */}
      <Link
        key={active.href}
        href={active.href}
        className="animate-hero-cta-swap inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-black text-white ring-1 ring-inset ring-white/25 backdrop-blur transition hover:bg-white/25"
      >
        {active.label}
      </Link>

      {/* 단어학습 복습 */}
      <Link
        href="/student/english/words/learn/review"
        className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white/95 ring-1 ring-inset ring-white/20 backdrop-blur transition hover:bg-white/20"
      >
        📖 단어학습 복습
      </Link>

      {/* 페이지네이션 점 */}
      <span className="ml-1 inline-flex items-center gap-1.5">
        {ROTATE.map((r, idx) => (
          <span
            key={r.href}
            aria-hidden="true"
            className={`inline-block size-1.5 rounded-full transition ${
              idx === i ? "bg-white" : "bg-white/35"
            }`}
          />
        ))}
      </span>
    </div>
  );
}
