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
    <div className="tz-track" role="group" aria-label="학습 과목">
      <button
        type="button"
        onClick={() => go("math")}
        className="tz-track__button"
        aria-pressed={current === "math"}
      >
        편입수학
      </button>
      <button
        type="button"
        onClick={() => go("english")}
        className="tz-track__button"
        aria-pressed={current === "english"}
      >
        편입영어
      </button>
    </div>
  );
}
