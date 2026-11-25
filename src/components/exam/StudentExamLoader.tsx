"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/api/adminFetch";
import { examRepo } from "@/lib/exams/generatedExamRepository";
import { SCHOOL_MOCK_NAMES, schoolMockApi, schoolMockFromExamId } from "@/lib/exams/schoolMock";
import { useAuth } from "@/lib/auth/AuthContext";
import { canUseTier } from "@/lib/auth/tierGuard";
import type { AnswerMap, AttemptResult, MockExam } from "@/types/exam";
import { ExamRunner } from "@/components/exam/ExamRunner";

export function StudentExamLoader({ examId }: { examId: string }) {
  const { user, authChecked } = useAuth();
  const [exam, setExam] = useState<MockExam | null | undefined>(undefined);
  const [loadError, setLoadError] = useState("");
  const schoolExam = schoolMockFromExamId(examId);
  const schoolExamUrl = schoolExam ? `${schoolMockApi(schoolExam.school)}/${schoolExam.round}` : null;
  const schoolLocked = schoolExam !== null && !canUseTier(user, "pro");

  useEffect(() => {
    if (!authChecked) return;
    if (!user || schoolLocked) {
      setExam(undefined);
      return;
    }
    let cancelled = false;
    const controller = new AbortController();

    setExam(undefined);
    setLoadError("");
    const loadExam = schoolExamUrl === null ? examRepo.findById(examId) : (async () => {
      const response = await adminFetch(schoolExamUrl, {
        signal: controller.signal,
        cache: "no-store",
      });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("시험을 불러오지 못했습니다.");
      const data = await response.json() as { exam: MockExam };
      return data.exam;
    })();
    loadExam.then((found) => { if (!cancelled) setExam(found); }).catch(() => {
      if (!cancelled) {
        setExam(null);
        setLoadError("시험을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
    });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [authChecked, user, examId, schoolExamUrl, schoolLocked]);

  const submitSchoolAttempt = useCallback(async (input: {
    attemptId: string;
    answers: AnswerMap;
    elapsedSec: number;
  }) => {
    if (!schoolExamUrl) throw new Error("학교별 모의고사를 찾을 수 없습니다.");
    const response = await adminFetch(schoolExamUrl, {
      method: "POST",
      body: JSON.stringify(input),
    });
    const data = await response.json().catch(() => null) as { result?: AttemptResult; message?: string } | null;
    if (!response.ok || !data?.result) throw new Error(data?.message ?? "시험을 제출하지 못했습니다.");
    return data.result;
  }, [schoolExamUrl]);

  if (!authChecked) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-10">
        <section className="rounded-lg border border-line bg-white p-6 text-sm font-bold text-slate-600 shadow-soft">
          로그인 상태를 확인하는 중입니다.
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-10">
        <section className="rounded-lg border border-line bg-white p-8 text-center shadow-soft">
          <div className="mb-4 text-4xl">🔒</div>
          <h1 className="text-xl font-black text-ink">로그인이 필요합니다</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            시험을 보려면 상단에서 로그인해 주세요.
          </p>
          <Link
            href="/student/exams"
            className="mt-6 inline-flex rounded-md bg-brand-600 px-4 py-3 text-sm font-black text-white"
          >
            시험 목록으로
          </Link>
        </section>
      </main>
    );
  }

  if (schoolLocked && schoolExam) {
    return (
      <main className="tz-study tz-study-guest">
        <section className="tz-study-login">
          <h1>PRO 전용 모의고사입니다</h1>
          <p>{SCHOOL_MOCK_NAMES[schoolExam.school]} 모의고사는 PRO 등급 이상에서 응시할 수 있습니다.</p>
          <Link href="/student/exams" className="tz-study-button tz-study-button-quiet">시험 목록으로</Link>
        </section>
      </main>
    );
  }

  if (exam === undefined) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-10">
        <section className="rounded-lg border border-line bg-white p-6 text-sm font-bold text-slate-600 shadow-soft">
          시험을 불러오는 중입니다.
        </section>
      </main>
    );
  }

  if (!exam) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-10">
        <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
          <h1 className="text-xl font-black text-ink">{loadError ? "시험을 열 수 없습니다" : "시험을 찾을 수 없습니다"}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {loadError || "존재하지 않는 시험이거나 다른 브라우저에서 생성된 시험입니다."}
          </p>
          <Link
            href="/student/exams"
            className="mt-5 inline-flex rounded-md bg-brand-600 px-4 py-3 text-sm font-black text-white"
          >
            시험 목록으로
          </Link>
        </section>
      </main>
    );
  }

  return (
    <ExamRunner
      key={exam.id}
      exam={exam}
      retryHref={`/student/exams/${exam.id}`}
      enablePaperLayout={schoolExam !== null}
      submitAttempt={schoolExam !== null ? submitSchoolAttempt : undefined}
    />
  );
}
