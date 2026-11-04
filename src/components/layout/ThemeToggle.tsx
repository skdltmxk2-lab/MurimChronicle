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

  const showDark = mounted && dark;

  return (
    <button type="button" onClick={toggle} aria-pressed={dark} aria-label={dark ? "라이트 모드로 전환" : "다크 모드로 전환"} title={dark ? "라이트 모드" : "다크 모드"} className={`tz-theme ${className}`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {showDark ? <path d="M20.5 14.3A8.7 8.7 0 0 1 9.7 3.5 8.8 8.8 0 1 0 20.5 14.3Z" /> : <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>}
      </svg>
    </button>
  );
}
