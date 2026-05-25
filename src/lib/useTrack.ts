"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type Track = "math" | "english";

export const TRACK_KEY = "cbt:track";

// 수학 트랙으로 간주하는 경로들 (영어 외 학습 경로)
const MATH_PREFIXES = ["/student/exams", "/student/search", "/student/results", "/student/wrong-questions"];

/**
 * 현재 트랙(math|english)을 반환.
 * - 경로가 트랙을 나타내면(/student/english… 또는 수학 학습 경로) 그걸 우선.
 * - 공유 페이지(커뮤니티·요금제·내정보 등)에선 마지막으로 선택한 트랙(localStorage)을 사용.
 */
export function useTrack(): Track {
  const pathname = usePathname();
  const [stored, setStored] = useState<Track>("math");

  useEffect(() => {
    const v = typeof window !== "undefined" ? window.localStorage.getItem(TRACK_KEY) : null;
    if (v === "english" || v === "math") setStored(v);
  }, [pathname]);

  if (pathname.startsWith("/student/english")) return "english";
  if (MATH_PREFIXES.some((p) => pathname.startsWith(p))) return "math";
  return stored;
}
