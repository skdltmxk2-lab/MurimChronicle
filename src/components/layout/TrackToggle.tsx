"use client";

import { useRouter } from "next/navigation";
import { useTrack, TRACK_KEY, type Track } from "@/lib/useTrack";

export function TrackToggle() {
  const router = useRouter();
  const current = useTrack();

  function go(track: Track) {
    if (track === current) return;
    try {
      window.localStorage.setItem(TRACK_KEY, track);
    } catch {
      // 무시
    }
    router.push(track === "english" ? "/student/english" : "/student/exams");
  }

  return (
    <div className="inline-flex rounded-full border border-line bg-slate-100 p-0.5 text-xs font-black">
      <button
        type="button"
        onClick={() => go("math")}
        className={`rounded-full px-3 py-1.5 transition ${
          current === "math" ? "bg-brand-600 text-white shadow" : "text-slate-500 hover:text-slate-700"
        }`}
      >
        편입수학
      </button>
      <button
        type="button"
        onClick={() => go("english")}
        className={`rounded-full px-3 py-1.5 transition ${
          current === "english" ? "bg-brand-600 text-white shadow" : "text-slate-500 hover:text-slate-700"
        }`}
      >
        편입영어
      </button>
    </div>
  );
}
