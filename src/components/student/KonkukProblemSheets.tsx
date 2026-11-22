"use client";

import { useState } from "react";
import { adminFetch } from "@/lib/api/adminFetch";
import { PdfPageViewer } from "@/components/student/PdfPageViewer";
import {
  KONKUK_SCHOOL_MOCK_ROUNDS,
  konkukProblemSheetName,
  type KonkukSchoolMockRound,
} from "@/lib/exams/konkukSchoolMock";

type SheetAction = "view" | "download";

export function KonkukProblemSheets() {
  const [loading, setLoading] = useState<{ round: KonkukSchoolMockRound; action: SheetAction } | null>(null);
  const [preview, setPreview] = useState<{ round: KonkukSchoolMockRound; file: Blob } | null>(null);
  const [error, setError] = useState("");

  async function openSheet(round: KonkukSchoolMockRound, action: SheetAction) {
    setLoading({ round, action });
    setError("");
    try {
      const response = await adminFetch(`/api/student/exams/school-mock/konkuk/${round}`, { cache: "no-store" });
      if (response.status === 401) {
        setError("세션이 만료되었습니다. 다시 로그인해 주세요.");
        return;
      }
      if (response.status === 403) {
        setError("PRO 등급 이상에서 문제지를 이용할 수 있습니다.");
        return;
      }
      if (!response.ok || !response.headers.get("Content-Type")?.startsWith("application/pdf")) {
        throw new Error("PDF response unavailable");
      }

      const file = await response.blob();
      if (action === "view") {
        setPreview({ round, file });
        return;
      }

      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = konkukProblemSheetName(round);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch {
      setError("문제지를 열 수 없습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(null);
    }
  }

  if (preview) {
    const title = `${preview.round}회 문제지`;
    return (
      <div className="tz-study-school-mock-viewer space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="!text-base">{title}</h4>
          <button type="button" className="tz-study-text-link" onClick={() => setPreview(null)}>회차 목록</button>
        </div>
        <PdfPageViewer file={preview.file} title={title} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {KONKUK_SCHOOL_MOCK_ROUNDS.map((round) => (
        <article key={round} className="flex flex-wrap items-center justify-between gap-2 border px-2 py-3">
          <h4 className="text-sm font-bold tz-study-ink">{round}회 문제지</h4>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-label={`${round}회 문제지 사이트에서 보기`}
              className="tz-study-button !px-3"
              disabled={loading !== null}
              onClick={() => void openSheet(round, "view")}
            >
              {loading?.round === round && loading.action === "view" ? "여는 중…" : "사이트에서 보기"}
            </button>
            <button
              type="button"
              aria-label={`${round}회 문제지 다운로드`}
              className="tz-study-button tz-study-button-quiet !px-3"
              disabled={loading !== null}
              onClick={() => void openSheet(round, "download")}
            >
              {loading?.round === round && loading.action === "download" ? "다운로드 중…" : "PDF 다운로드"}
            </button>
          </div>
        </article>
      ))}
      {error && <p className="text-sm tz-study-accent" role="alert">{error}</p>}
    </div>
  );
}
