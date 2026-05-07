"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { attemptRepo } from "@/lib/exam/storage";
import type { AttemptResult } from "@/types/exam";

type Tab = "subject_mock" | "real";

function isSubjectMock(examId: string) {
  return examId.startsWith("subject-mock:");
}
function isDaily(examId: string) {
  return examId.startsWith("unit-daily-");
}
function isUnitPractice(examId: string) {
  return examId.startsWith("unit-test-");
}

function parseSubjectMockId(examId: string): { subject: string; round: number } | null {
  const parts = examId.split(":");
  if (parts.length !== 3) return null;
  const round = Number(parts[2]);
  if (!Number.isFinite(round)) return null;
  return { subject: parts[1], round };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function StudentResultsList() {
  const searchParams = useSearchParams();
  const { user, authChecked } = useAuth();
  const initialTab = (searchParams.get("type") === "real" ? "real" : "subject_mock") as Tab;
  const [tab, setTab] = useState<Tab>(initialTab);
  const [results, setResults] = useState<AttemptResult[] | null>(null);

  useEffect(() => {
    if (!authChecked || !user) return;
    let cancelled = false;
    attemptRepo.listResults().then((rows) => {
      if (!cancelled) setResults(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [authChecked, user]);

  const filtered = useMemo(() => {
    if (!results) return null;
    const sorted = [...results].sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
    if (tab === "subject_mock") {
      return sorted.filter((r) => isSubjectMock(r.examId));
    }
    // 실전: subject_mock / daily / unit-practice 가 아닌 것
    return sorted.filter(
      (r) => !isSubjectMock(r.examId) && !isDaily(r.examId) && !isUnitPractice(r.examId)
    );
  }, [results, tab]);

  if (!authChecked) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-10">
        <section className="rounded-lg border border-line bg-white p-6 text-sm font-bold text-slate-600 shadow-soft">
          로그인 상태를 확인하는 중입니다...
        </section>
      </main>
    );
  }
  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-10">
        <section className="rounded-lg border border-line bg-white p-8 text-center shadow-soft">
          <div className="mb-4 text-4xl">🔒</div>
          <h1 className="text-xl font-black text-ink">로그인이 필요합니다</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">지난 성적을 보려면 상단에서 로그인해 주세요.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <section className="mb-5 rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">
          MY RESULTS
        </p>
        <h1 className="mt-2 text-2xl font-black text-ink">지난 성적 보기</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          내가 응시한 모의고사 회차의 점수와 결과를 다시 확인할 수 있어요. 백분위와 등수는 집계 후 표시됩니다.
        </p>
      </section>

      <div className="mb-4 flex gap-2 border-b border-line">
        {(
          [
            { key: "subject_mock", label: "과목별 모의고사" },
            { key: "real", label: "실전 모의고사" },
          ] as { key: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-black ${
              tab === t.key ? "border-b-2 border-brand-600 text-brand-700" : "text-slate-500 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered === null ? (
        <section className="rounded-lg border border-line bg-white p-6 text-sm text-slate-500 shadow-soft">
          불러오는 중입니다...
        </section>
      ) : filtered.length === 0 ? (
        <section className="rounded-lg border border-line bg-white p-8 text-center shadow-soft">
          <div className="mb-3 text-4xl">📭</div>
          <h2 className="text-lg font-black text-ink">아직 응시 기록이 없어요</h2>
          <p className="mt-2 text-sm text-slate-500">
            {tab === "subject_mock"
              ? "과목별 모의고사를 한 회차 풀어보면 여기에 점수가 누적돼요."
              : "실전 모의고사를 응시하면 여기에서 다시 볼 수 있어요."}
          </p>
          <Link
            href="/student/exams"
            className="mt-5 inline-flex rounded-md bg-brand-600 px-4 py-3 text-sm font-black text-white hover:bg-brand-700"
          >
            시험 목록으로
          </Link>
        </section>
      ) : (
        <section className="space-y-3">
          {filtered.map((r) => {
            const meta = isSubjectMock(r.examId) ? parseSubjectMockId(r.examId) : null;
            const headline = meta
              ? `${meta.subject} 과목별 모의고사 ${meta.round}회`
              : r.examTitle || r.examId;
            return (
              <Link
                key={r.attemptId}
                href={`/student/results/${r.attemptId}`}
                className="flex items-center justify-between rounded-lg border border-line bg-white p-5 shadow-soft hover:border-brand-400 hover:bg-brand-50/40"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <div className="text-sm font-black text-ink">{headline}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {formatDate(r.submittedAt)} 응시
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs font-bold text-slate-500">점수</div>
                  <div className="text-lg font-black text-ink">
                    {r.score.correct}/{r.score.total}
                    <span className="ml-1 text-sm font-bold text-slate-500">
                      ({r.score.percent}%)
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </main>
  );
}
