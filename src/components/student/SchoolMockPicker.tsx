"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/api/adminFetch";
import { schoolMockApi, type SchoolMockCode } from "@/lib/exams/schoolMock";

type ExamRound = { id: string; title: string; round: number };

export function SchoolMockPicker({ school }: { school: SchoolMockCode }) {
  const [exams, setExams] = useState<ExamRound[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);

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
        <li key={id} className="flex items-center justify-between gap-3 border-b tz-study-line px-2 py-3">
          <span className="font-bold tz-study-ink">{round}회 모의고사</span>
          <Link href={`/student/exams/${id}`} className="tz-study-button" aria-label={`${round}회 모의고사 응시하기`}>
            응시하기
          </Link>
        </li>
      ))}
    </ul>
  );
}
