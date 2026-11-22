"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/api/adminFetch";
import { PdfPageViewer } from "@/components/student/PdfPageViewer";
import { konkukProblemSheetName } from "@/lib/exams/konkukSchoolMock";

const SHEETS_API = "/api/student/exams/school-mock/konkuk";
type SheetAction = "view" | "download";

export function KonkukProblemSheets() {
  const [rounds, setRounds] = useState<number[] | null>(null);
  const [listError, setListError] = useState("");
  const [listAttempt, setListAttempt] = useState(0);
  const [loading, setLoading] = useState<{ round: number; action: SheetAction } | null>(null);
  const [preview, setPreview] = useState<{ round: number; file: Blob } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadRounds() {
      try {
        const response = await adminFetch(SHEETS_API, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Problem sheet list unavailable");
        const data = await response.json() as { rounds: number[] };
        if (!Array.isArray(data.rounds)) throw new Error("Problem sheet list unavailable");
        if (!controller.signal.aborted) setRounds(data.rounds);
      } catch {
        if (!controller.signal.aborted) setListError("회차 목록을 불러오지 못했습니다.");
      }
    }
    void loadRounds();
    return () => controller.abort();
  }, [listAttempt]);

  async function openSheet(round: number, action: SheetAction) {
    setLoading({ round, action });
    setError("");
    try {
      const response = await adminFetch(`${SHEETS_API}/${round}`, { cache: "no-store" });
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

  if (listError) {
    return (
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm tz-study-accent" role="alert">{listError}</p>
        <button
          type="button"
          className="tz-study-text-link"
          onClick={() => { setListError(""); setListAttempt((attempt) => attempt + 1); }}
        >
          다시 시도
        </button>
      </div>
    );
  }
  if (!rounds) return <p className="text-sm tz-study-muted" role="status">회차 목록을 불러오는 중…</p>;
  if (rounds.length === 0) return <p className="text-sm tz-study-muted">등록된 문제지가 없습니다.</p>;

  return (
    <div className="space-y-2">
      {rounds.map((round) => (
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
