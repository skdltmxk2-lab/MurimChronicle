"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authRepo } from "@/lib/auth/mockAuth";
import { questionRepo } from "@/lib/questions/questionRepository";
import type { MockUser } from "@/types/auth";
import { ExamCard } from "@/components/exam/ExamCard";
import { GeneratedExamCards } from "@/components/exam/GeneratedExamCards";
import { WelcomeScreen } from "@/components/exam/WelcomeScreen";
import { mockExams } from "@/data/mockData";

const WELCOME_KEY = "cbt:welcome:pending";

const SUBJECTS = [
  { name: "미분학", emoji: "📐", desc: "극한, 연속, 미분, 평균값 정리, 로피탈" },
  { name: "적분학", emoji: "∫", desc: "부정적분, 정적분, 치환·부분적분, 넓이·부피" },
  { name: "선형대수학", emoji: "🔢", desc: "행렬, 행렬식, 연립방정식, 고유값·고유벡터" },
  { name: "다변수함수론", emoji: "🗺️", desc: "편미분, 방향도함수, 다중적분, 선적분" },
  { name: "공학수학", emoji: "⚙️", desc: "미분방정식, 푸리에 급수, 라플라스 변환" },
];

function formatStat(count: number): string {
  if (count < 100) return "-";
  return `${Math.floor(count / 10) * 10}+`;
}

export default function StudentExamsPage() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [pickedSubject, setPickedSubject] = useState<string | null>(null);

  useEffect(() => {
    authRepo.getCurrentUser().then((u) => {
      setUser(u);
      setAuthChecked(true);
      if (u?.role === "student") {
        const pending = window.localStorage.getItem(WELCOME_KEY);
        if (pending === "true") setShowWelcome(true);
      }
    });
    questionRepo.list().then((qs) => setQuestionCount(qs.length));
  }, []);

  function dismissWelcome() {
    window.localStorage.removeItem(WELCOME_KEY);
    setShowWelcome(false);
  }

  if (!authChecked) return null;
  if (showWelcome && user) return <WelcomeScreen user={user} onDone={dismissWelcome} />;

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

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      {/* 헤더 */}
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
              <div className="mt-1 text-xl font-black text-ink">
                {formatStat(mockExams.length * 50)}
              </div>
            </div>
            <div className="rounded-md border border-line px-4 py-3">
              <div className="text-xs font-bold text-slate-500">문항</div>
              <div className="mt-1 text-xl font-black text-ink">
                {formatStat(questionCount)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 취약유형 모의고사 */}
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

      {/* 단원별 테스트 + 실전 모의고사 */}
      <section className="mb-5 grid gap-5 md:grid-cols-2">
        {/* 단원별 테스트 */}
        <div className="flex flex-col rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-2xl">
              📚
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-brand-600">
                Unit Test
              </p>
              <h2 className="mt-0.5 text-lg font-black text-ink">단원별 테스트</h2>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            과목별로 집중 학습하세요. 미분학·적분학·선형대수학·다변수함수론·공학수학 중 원하는 단원을 골라 풀어볼 수 있어요.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SUBJECTS.map((s) => (
              <span
                key={s.name}
                className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600"
              >
                {s.name}
              </span>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4 text-center text-sm">
            <div>
              <div className="text-xs font-bold text-slate-400">문항</div>
              <div className="font-black text-ink">10문항</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400">시간</div>
              <div className="font-black text-ink">20분</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400">방식</div>
              <div className="font-black text-ink">단원별</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { setPickedSubject(null); setSubjectModalOpen(true); }}
            className="mt-4 w-full rounded-md bg-brand-600 py-3 text-sm font-black text-white hover:bg-brand-700"
          >
            과목 선택하기
          </button>
        </div>

        {/* 실전 모의고사 */}
        <div className="flex flex-col rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mint-50 text-2xl">
              📝
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-mint-600">
                Full Mock Test
              </p>
              <h2 className="mt-0.5 text-lg font-black text-ink">실전 모의고사</h2>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            5개 과목에서 각 5문항씩, 총 25문항으로 구성된 실전형 모의고사예요. 편입시험과 동일한 형식으로 풀어보세요.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SUBJECTS.map((s) => (
              <span
                key={s.name}
                className="rounded-full bg-mint-50 px-2.5 py-1 text-xs font-bold text-mint-600"
              >
                {s.name} 5문항
              </span>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4 text-center text-sm">
            <div>
              <div className="text-xs font-bold text-slate-400">문항</div>
              <div className="font-black text-ink">25문항</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400">시간</div>
              <div className="font-black text-ink">60분</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400">방식</div>
              <div className="font-black text-ink">실전형</div>
            </div>
          </div>
          <button
            type="button"
            disabled
            className="mt-4 w-full cursor-not-allowed rounded-md bg-slate-100 py-3 text-sm font-black text-slate-400"
          >
            문제 업데이트 후 오픈 예정
          </button>
        </div>
      </section>

      {/* 기존 모의고사 */}
      <section className="grid gap-5 md:grid-cols-2">
        {mockExams.map((exam) => (
          <ExamCard key={exam.id} exam={exam} />
        ))}
      </section>
      <GeneratedExamCards />

      {/* 과목 선택 모달 */}
      {subjectModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-4 pb-6 sm:items-center sm:pb-0"
          onClick={() => setSubjectModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            {pickedSubject ? (
              <>
                <div className="text-center">
                  <div className="mb-3 text-4xl">
                    {SUBJECTS.find((s) => s.name === pickedSubject)?.emoji}
                  </div>
                  <h3 className="text-xl font-black text-ink">{pickedSubject} 단원별 테스트</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {SUBJECTS.find((s) => s.name === pickedSubject)?.desc}
                  </p>
                  <div className="mt-4 rounded-lg bg-brand-50 px-4 py-4 text-sm font-bold text-brand-700">
                    문제를 열심히 업로드 중이에요!
                    <br />
                    <span className="font-black">곧 오픈됩니다 🚀</span>
                  </div>
                </div>
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPickedSubject(null)}
                    className="flex-1 rounded-md border border-line py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
                  >
                    ← 다른 과목
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubjectModalOpen(false)}
                    className="flex-1 rounded-md bg-brand-600 py-3 text-sm font-black text-white hover:bg-brand-700"
                  >
                    닫기
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-5">
                  <h3 className="text-xl font-black text-ink">단원별 테스트</h3>
                  <p className="mt-1 text-sm text-slate-500">학습할 과목을 선택하세요</p>
                </div>
                <div className="space-y-2">
                  {SUBJECTS.map((subject) => (
                    <button
                      key={subject.name}
                      type="button"
                      onClick={() => setPickedSubject(subject.name)}
                      className="flex w-full items-center gap-4 rounded-xl border border-line px-4 py-3 text-left hover:border-brand-400 hover:bg-brand-50"
                    >
                      <span className="text-2xl">{subject.emoji}</span>
                      <div>
                        <div className="text-sm font-black text-ink">{subject.name}</div>
                        <div className="text-xs text-slate-500">{subject.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSubjectModalOpen(false)}
                  className="mt-4 w-full rounded-md border border-line py-3 text-sm font-black text-slate-600 hover:bg-slate-50"
                >
                  닫기
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
