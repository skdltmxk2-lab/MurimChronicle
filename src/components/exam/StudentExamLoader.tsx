"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { examRepo } from "@/lib/exams/generatedExamRepository";
import { useAuth } from "@/lib/auth/AuthContext";
import type { MockExam } from "@/types/exam";
import { ExamRunner } from "@/components/exam/ExamRunner";

export function StudentExamLoader({ examId }: { examId: string }) {
  const { user, authChecked } = useAuth();
  const [exam, setExam] = useState<MockExam | null | undefined>(undefined);

  useEffect(() => {
    if (!authChecked) return;
    if (!user) {
      setExam(undefined);
      return;
    }
    let cancelled = false;

    setExam(undefined);
    examRepo.findById(examId).then((found) => {
      if (!cancelled) setExam(found as MockExam | null);
    });

    return () => {
      cancelled = true;
    };
  }, [authChecked, user, examId]);

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
          <h1 className="text-xl font-black text-ink">시험을 찾을 수 없습니다</h1>
          <p className="mt-2 text-sm text-slate-600">
            존재하지 않는 시험이거나 다른 브라우저에서 생성된 시험입니다.
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

  return <ExamRunner exam={exam} retryHref={`/student/exams/${exam.id}`} />;
}
