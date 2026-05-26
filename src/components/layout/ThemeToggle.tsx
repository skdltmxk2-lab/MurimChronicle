"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "cbt:theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    const root = document.documentElement;
    if (next) root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {
      // 무시
    }
  }

  // 서버/클라이언트 초기 렌더 일치를 위해 마운트 전엔 placeholder
  const label = !mounted ? "🌙" : dark ? "☀️" : "🌙";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      title={dark ? "라이트 모드" : "다크 모드"}
      className={`grid size-9 shrink-0 place-items-center rounded-full border border-line bg-white text-base shadow-soft transition hover:scale-105 hover:border-brand-400 ${className}`}
    >
      <span suppressHydrationWarning>{label}</span>
    </button>
  );
}
