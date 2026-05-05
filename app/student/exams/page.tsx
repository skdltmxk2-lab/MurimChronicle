"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authRepo } from "@/lib/auth/mockAuth";
import { questionRepo } from "@/lib/questions/questionRepository";
import type { MockUser } from "@/types/auth";
import { GeneratedExamCards } from "@/components/exam/GeneratedExamCards";
import { WelcomeScreen } from "@/components/exam/WelcomeScreen";

const WELCOME_KEY = "cbt:welcome:pending";

const SUBJECTS = [
  { name: "미분학", emoji: "📐", desc: "극한, 연속, 미분, 평균값 정리, 로피탈" },
  { name: "적분학", emoji: "∫", desc: "부정적분, 정적분, 치환·부분적분, 넓이·부피" },
  { name: "선형대수학", emoji: "🔢", desc: "행렬, 행렬식, 연립방정식, 고유값·고유벡터" },
  { name: "다변수함수론", emoji: "🗺️", desc: "편미분, 방향도함수, 다중적분, 선적분" },
  { name: "공학수학", emoji: "⚙️", desc: "미분방정식, 푸리에 급수, 라플라스 변환" },
];

const SUBJECT_UNIT_MAP: Record<string, string[]> = {
  미분학: ["극한", "연속", "미분", "삼각함수", "급수", "로피탈"],
  적분학: ["부정적분", "정적분", "치환적분", "부분적분", "넓이", "부피"],
  선형대수학: ["행렬", "행렬식", "연립방정식", "고유값", "고유벡터"],
  다변수함수론: ["편미분", "방향도함수", "다중적분", "선적분"],
  공학수학: ["미분방정식", "푸리에 급수", "라플라스 변환"],
};

const COUNT_OPTIONS = [10, 15, 20];

function formatStat(count: number): string {
  if (count < 100) return "-";
  return `${Math.floor(count / 10) * 10}+`;
}

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function getTodayParam(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function StudentExamsPage() {
  const router = useRouter();
  const [user, setUser] = useState<MockUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [dailyCount, setDailyCount] = useState(0);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [pickedSubject, setPickedSubject] = useState<string | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [unitTestCount, setUnitTestCount] = useState(10);

  useEffect(() => {
    authRepo.getCurrentUser().then((u) => {
      setUser(u);
      setAuthChecked(true);
      if (u?.role === "student") {
        const pending = window.localStorage.getItem(WELCOME_KEY);
        if (pending === "true") setShowWelcome(true);
      }
    });
    questionRepo.list().then((qs) => {
      setQuestionCount(qs.length);
      setDailyCount(qs.filter((q) => q.tags.includes("daily")).length);
    });
  }, []);

  function dismissWelcome() {
    window.localStorage.removeItem(WELCOME_KEY);
    setShowWelcome(false);
  }

  function openSubjectModal() {
    setPickedSubject(null);
    setSelectedUnits([]);
    setUnitTestCount(10);
    setSubjectModalOpen(true);
  }

  function pickSubject(name: string) {
    setPickedSubject(name);
    setSelectedUnits(SUBJECT_UNIT_MAP[name] ?? []);
  }

  function toggleUnit(unit: string) {
    setSelectedUnits((prev) =>
      prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]
    );
  }

  function startUnitTest() {
    if (!pickedSubject || selectedUnits.length === 0) return;
    const params = new URLSearchParams({
      subject: pickedSubject,
      units: selectedUnits.join(","),
      count: String(unitTestCount),
    });
    router.push(`/student/exams/unit-test?${params.toString()}`);
    setSubjectModalOpen(false);
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
              <div className="text-xs font-bold text-slate-500">문항</div>
              <div className="mt-1 text-xl font-black text-ink">{formatStat(questionCount)}</div>
            </div>
            <div className="rounded-md border border-line px-4 py-3">
              <div className="text-xs font-bold text-slate-500">시험</div>
              <div className="mt-1 text-xl font-black text-ink">{formatStat(questionCount * 3)}</div>
            </div>
          </div>
        </div>

        {/* 데일리 테스트 */}
        <div className="mt-5 flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-brand-500">
              Daily Test
            </p>
            <p className="mt-0.5 text-base font-black text-ink">
              {getTodayStr()} 오늘의 데일리 테스트
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {dailyCount > 0 ? `${Math.min(5, dailyCount)}문항 · 매일 로테이션` : "준비 중"}
            </p>
          </div>
          {dailyCount > 0 ? (
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/student/exams/unit-test?mode=daily&count=5&date=${getTodayParam()}`
                )
              }
              className="shrink-0 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-black text-white hover:bg-brand-700"
            >
              풀기 →
            </button>
          ) : (
            <span className="shrink-0 rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-black text-slate-400">
              준비 중
            </span>
          )}
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
            과목별로 집중 학습하세요. 원하는 단원을 골라 10·15·20문항으로 풀 수 있어요.
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
              <div className="font-black text-ink">10~20문항</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400">시간</div>
              <div className="font-black text-ink">자유</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400">방식</div>
              <div className="font-black text-ink">단원별</div>
            </div>
          </div>
          <button
            type="button"
            onClick={openSubjectModal}
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
                Real Exam Simulation
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
                {/* 단원 + 문제 수 선택 */}
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-2xl">
                    {SUBJECTS.find((s) => s.name === pickedSubject)?.emoji}
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-ink">{pickedSubject}</h3>
                    <p className="text-xs text-slate-500">단원을 선택하고 문제 수를 정하세요</p>
                  </div>
                </div>

                {/* 단원 선택 */}
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-black text-slate-600">단원 선택</p>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedUnits(
                          selectedUnits.length === (SUBJECT_UNIT_MAP[pickedSubject] ?? []).length
                            ? []
                            : SUBJECT_UNIT_MAP[pickedSubject] ?? []
                        )
                      }
                      className="text-xs font-bold text-brand-600 hover:underline"
                    >
                      {selectedUnits.length === (SUBJECT_UNIT_MAP[pickedSubject] ?? []).length
                        ? "전체 해제"
                        : "전체 선택"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(SUBJECT_UNIT_MAP[pickedSubject] ?? []).map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => toggleUnit(unit)}
                        className={`rounded-full px-3 py-1.5 text-sm font-bold transition ${
                          selectedUnits.includes(unit)
                            ? "bg-brand-600 text-white"
                            : "border border-line bg-white text-slate-600 hover:border-brand-400"
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 문제 수 선택 */}
                <div className="mb-5">
                  <p className="mb-2 text-xs font-black text-slate-600">문제 수</p>
                  <div className="flex gap-2">
                    {COUNT_OPTIONS.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setUnitTestCount(n)}
                        className={`flex-1 rounded-lg py-2.5 text-sm font-black transition ${
                          unitTestCount === n
                            ? "bg-brand-600 text-white"
                            : "border border-line bg-white text-slate-600 hover:border-brand-400"
                        }`}
                      >
                        {n}문항
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPickedSubject(null)}
                    className="flex-1 rounded-md border border-line py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
                  >
                    ← 다른 과목
                  </button>
                  <button
                    type="button"
                    onClick={startUnitTest}
                    disabled={selectedUnits.length === 0}
                    className="flex-1 rounded-md bg-brand-600 py-3 text-sm font-black text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    시작하기 →
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
                      onClick={() => pickSubject(subject.name)}
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
