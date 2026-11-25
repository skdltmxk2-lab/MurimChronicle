"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/api/adminFetch";
import { schoolMockApi, schoolMockProblemSheetName, type SchoolMockCode } from "@/lib/exams/schoolMock";

type ExamRound = { id: string; title: string; round: number };
type DownloadState = { round: number; status: "pending" | "failed" };

export function SchoolMockPicker({ school }: { school: SchoolMockCode }) {
  const [exams, setExams] = useState<ExamRound[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [download, setDownload] = useState<DownloadState | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadExams() {
      try {
        const response = await adminFetch(schoolMockApi(school), { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error("School exams unavailable");
        const data = await response.json() as { exams: ExamRound[] };
        if (!Array.isArray(data.exams)) throw new Error("School exams unavailable");
        if (!controller.signal.aborted) setExams(data.exams);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      }
    }

    void loadExams();
    return () => controller.abort();
  }, [school, retry]);

  async function downloadProblemSheet(round: number) {
    setDownload({ round, status: "pending" });
    try {
      const response = await adminFetch(`${schoolMockApi(school)}/${round}/pdf`, { cache: "no-store" });
      const contentType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
      if (!response.ok || contentType !== "application/pdf") throw new Error("Problem sheet unavailable");

      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = schoolMockProblemSheetName(school, round);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setDownload(null);
    } catch {
      setDownload({ round, status: "failed" });
    }
  }

  if (failed) {
    return (
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm tz-study-muted" role="alert">회차를 불러오지 못했습니다.</p>
        <button type="button" className="tz-study-text-link" onClick={() => { setFailed(false); setRetry(retry + 1); }}>
          다시 시도
        </button>
      </div>
    );
  }
  if (!exams) return <p className="text-sm tz-study-muted" role="status">모의고사를 불러오는 중입니다.</p>;
  if (exams.length === 0) return <p className="text-sm tz-study-muted">응시 가능한 회차가 없습니다.</p>;

  return (
    <ul className="space-y-2">
      {exams.map(({ id, round }) => (
        <li key={id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b tz-study-line px-2 py-3">
          <span className="font-bold tz-study-ink">{round}회 모의고사</span>
          <div className="ml-auto flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="tz-study-button tz-study-button-quiet whitespace-nowrap"
              aria-label={`${round}회 문제지 PDF 다운로드`}
              aria-busy={download?.round === round && download.status === "pending"}
              disabled={download?.status === "pending"}
              onClick={() => { void downloadProblemSheet(round); }}
            >
              {download?.round === round && download.status === "pending" ? "다운로드 중" : "PDF 다운로드"}
            </button>
            <Link href={`/student/exams/${id}`} className="tz-study-button whitespace-nowrap" aria-label={`${round}회 모의고사 응시하기`}>
              응시하기
            </Link>
          </div>
          {download?.round === round && download.status === "failed" && (
            <p className="basis-full text-sm tz-study-muted" role="alert">문제지를 다운로드하지 못했습니다. 다시 시도해 주세요.</p>
          )}
        </li>
      ))}
    </ul>
  );
}
