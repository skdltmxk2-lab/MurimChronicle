"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authRepo } from "@/lib/auth/mockAuth";
import type { MockUser } from "@/types/auth";
import { ExamCard } from "@/components/exam/ExamCard";
import { GeneratedExamCards } from "@/components/exam/GeneratedExamCards";
import { WelcomeScreen } from "@/components/exam/WelcomeScreen";
import { mockExams } from "@/data/mockData";

const WELCOME_KEY = "cbt:welcome:pending";

export default function StudentExamsPage() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    authRepo.getCurrentUser().then((u) => {
      setUser(u);
      setAuthChecked(true);
      if (u?.role === "student") {
        const pending = window.localStorage.getItem(WELCOME_KEY);
        if (pending === "true") {
          setShowWelcome(true);
        }
      }
    });
  }, []);

  function dismissWelcome() {
    window.localStorage.removeItem(WELCOME_KEY);
    setShowWelcome(false);
  }

  if (!authChecked) return null;

  if (showWelcome && user) {
    return <WelcomeScreen user={user} onDone={dismissWelcome} />;
  }

  if (!user || user.role === "admin") {
    return (
      <main className="mx-auto max-w-6xl px-5 py-16">
        <section className="mx-auto max-w-lg rounded-2xl border border-line bg-white p-10 text-center shadow-soft">
          <div className="mb-5 text-5xl">🔒</div>
          <h1 className="text-2xl font-black text-ink">로그인이 필요합니다</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            모의고사를 응시하려면 로그인해 주세요.
            <br />
            아직 계정이 없으시다면 지금 무료로 가입하세요!
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/student/register"
              className="rounded-md bg-brand-600 px-6 py-3 text-sm font-black text-white hover:bg-brand-700"
            >
              회원가입
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            이미 계정이 있으시면 상단에서 로그인해주세요.
          </p>
        </section>
      </main>
    );
  }

  const totalProblems = mockExams.reduce((sum, exam) => sum + exam.problems.length, 0);

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <section className="mb-6 rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">
          루트편입 CBT
        </p>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-ink">시험 목록</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {user.name}님, 오늘도 화이팅이에요! 빈출 유형 및 모의고사를 풀어보세요.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-md border border-line px-4 py-3">
              <div className="text-xs font-bold text-slate-500">시험</div>
              <div className="mt-1 text-xl font-black text-ink">{mockExams.length}</div>
            </div>
            <div className="rounded-md border border-line px-4 py-3">
              <div className="text-xs font-bold text-slate-500">문항</div>
              <div className="mt-1 text-xl font-black text-ink">{totalProblems}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-5">
        <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-500 to-amber-400 p-6 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-100">
                AI 맞춤 추천
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                {user.name}님의 취약유형 모의고사
              </h2>
              <p className="mt-2 text-sm leading-6 text-orange-100">
                {user.name}님이 자주 틀리는 유형을 분석해 만든 맞춤형 모의고사예요.
                <br />
                더 많은 문제를 풀수록 더 정밀해집니다!
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black text-white">
                  데이터 수집 중
                </span>
              </div>
            </div>
            <span className="shrink-0 text-5xl">🎯</span>
          </div>
          <button
            type="button"
            disabled
            className="mt-4 w-full cursor-not-allowed rounded-lg bg-white/20 py-3 text-sm font-black text-white/60"
          >
            문제를 더 풀면 활성화됩니다
          </button>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {mockExams.map((exam) => (
          <ExamCard key={exam.id} exam={exam} />
        ))}
      </section>
      <GeneratedExamCards />
    </main>
  );
}
