"use client";

import { useState } from "react";
import { adminFetch } from "@/lib/api/adminFetch";
import {
  KONKUK_SCHOOL_MOCK_ROUNDS,
  konkukProblemSheetName,
  type KonkukSchoolMockRound,
} from "@/lib/exams/konkukSchoolMock";

export function KonkukProblemSheets() {
  const [downloading, setDownloading] = useState<KonkukSchoolMockRound | null>(null);
  const [error, setError] = useState("");

  async function downloadSheet(round: KonkukSchoolMockRound) {
    setDownloading(round);
    setError("");
    try {
      const response = await adminFetch(`/api/student/exams/school-mock/konkuk/${round}`, { cache: "no-store" });
      if (response.status === 401) {
        setError("세션이 만료되었습니다. 다시 로그인해 주세요.");
        return;
      }
      if (response.status === 403) {
        setError("PRO 등급 이상에서 문제지를 다운로드할 수 있습니다.");
        return;
      }
      if (!response.ok || !response.headers.get("Content-Type")?.startsWith("application/pdf")) {
        throw new Error("PDF response unavailable");
      }

      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = konkukProblemSheetName(round);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch {
      setError("문제지를 다운로드할 수 없습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="space-y-2">
      {KONKUK_SCHOOL_MOCK_ROUNDS.map((round) => (
        <article key={round} className="flex items-center justify-between gap-3 border px-4 py-3">
          <h4 className="text-sm font-bold tz-study-ink">{round}회 문제지</h4>
          <button
            type="button"
            aria-label={`${round}회 문제지 다운로드`}
            className="tz-study-button shrink-0"
            disabled={downloading !== null}
            onClick={() => void downloadSheet(round)}
          >
            {downloading === round ? "다운로드 중…" : "PDF 다운로드"}
          </button>
        </article>
      ))}
      {error && <p className="text-sm tz-study-accent" role="alert">{error}</p>}
    </div>
  );
}
