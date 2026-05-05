"use client";

import { useEffect, useState } from "react";
import type { MockUser } from "@/types/auth";

const DELAY_MS = 750;

export function WelcomeScreen({ user, onDone }: { user: MockUser; onDone: () => void }) {
  const messages = [
    `안녕하세요, ${user.name}님!`,
    `${user.name}님이 많이 틀리시는 유형을 학습해`,
    "최적의 편입수학 공부를 돕는",
    "루트매쓰 CBT입니다!",
    "함께 공부를 시작해볼까요?",
  ];

  const [visibleCount, setVisibleCount] = useState(0);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (visibleCount < messages.length) {
      const timer = setTimeout(() => setVisibleCount((n) => n + 1), DELAY_MS);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setShowButton(true), 400);
    return () => clearTimeout(timer);
  }, [visibleCount, messages.length]);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-white px-5">
      <div className="w-full max-w-lg text-center">
        <div className="mb-10 space-y-5">
          {messages.map((msg, i) => (
            <p
              key={msg}
              className={`transition-all duration-500 ${
                i === 0
                  ? "text-3xl font-black text-brand-600"
                  : i === messages.length - 1
                    ? "text-xl font-black text-brand-500"
                    : "text-xl font-black text-ink"
              } ${
                i < visibleCount
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              {msg}
            </p>
          ))}
        </div>
        <button
          type="button"
          onClick={onDone}
          className={`rounded-xl bg-brand-600 px-10 py-4 text-base font-black text-white shadow-soft transition-all duration-500 hover:bg-brand-700 ${
            showButton ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          시작하기 →
        </button>
      </div>
    </main>
  );
}
