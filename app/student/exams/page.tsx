"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { questionRepo } from "@/lib/questions/questionRepository";
import { attemptRepo } from "@/lib/exam/storage";
import { examRepo } from "@/lib/exams/generatedExamRepository";
import { useAuth } from "@/lib/auth/AuthContext";
import { canUseTier, tierLockMessage } from "@/lib/auth/tierGuard";
import { WelcomeScreen } from "@/components/exam/WelcomeScreen";
import { SUBJECTS, SUBJECT_UNITS } from "@/lib/taxonomy";
import type { GeneratedExam } from "@/types/generatedExam";
import type { UserTier } from "@/types/auth";

const WELCOME_KEY = "cbt:welcome:pending";

const SUBJECT_UNIT_MAP: Record<string, readonly string[]> = SUBJECT_UNITS;

const COUNT_OPTIONS = [10, 15, 20];

function formatStat(count: number): string {
  if (count <= 0) return "-";
  if (count < 10) return String(count);
  return `${Math.floor(count / 10) * 10}+`;
}

// 운영 초기 단계에서는 통계 카드를 임계값 아래로 내려가지 않도록 고정한다.
// 실제 등록 문항이 5000개를 넘기는 순간부터 자동으로 실제 카운트가 노출된다.
const QUESTIONS_FLOOR = 5000;
const EXAMS_FLOOR = 500;
function formatQuestionStat(count: number): string {
  if (count >= QUESTIONS_FLOOR) return formatStat(count);
  return `${QUESTIONS_FLOOR}+`;
}
function formatExamStat(count: number): string {
  // '시험'은 count/10으로 산출되므로 5000을 넘는 순간 500을 자동으로 넘는다.
  const exams = Math.floor(count / 10);
  if (exams >= EXAMS_FLOOR) return formatStat(exams);
  return `${EXAMS_FLOOR}+`;
}

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function getTodayParam(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isSubjectGeneratedExam(exam: GeneratedExam) {
  return (exam.tags ?? []).includes("과목별모의고사");
}

function isRealGeneratedExam(exam: GeneratedExam) {
  const tags = exam.tags ?? [];
  return tags.includes("기출유형") || tags.includes("자체모고") || tags.includes("유형3") || tags.includes("유형4");
}

function requiredTierForGeneratedExam(exam: GeneratedExam): UserTier {
  const tags = exam.tags ?? [];
  if (tags.includes("자체모고") || tags.includes("유형3") || tags.includes("유형4")) return "pro";
  return "plus";
}

function GeneratedExamOption({
  exam,
  accent,
  allowed,
  lockLabel,
  onStart,
}: {
  exam: GeneratedExam;
  accent: "orange" | "mint";
  allowed: boolean;
  lockLabel: string;
  onStart: () => void;
}) {
  const color =
    accent === "orange"
      ? {
          hover: "hover:border-orange-400 hover:bg-orange-50",
          button: "bg-orange-500 hover:bg-orange-600",
          text: "text-orange-600",
        }
      : {
          hover: "hover:border-mint-400 hover:bg-mint-50",
          button: "bg-mint-600 hover:bg-mint-700",
          text: "text-mint-600",
        };

  return (
    <article className={`rounded-xl border border-line px-4 py-3 ${allowed ? color.hover : "bg-slate-50"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className={`text-sm font-black ${allowed ? "text-ink" : "text-slate-400"}`}>
            {exam.title}
          </h4>
          <p className="mt-1 text-xs font-bold text-slate-500">
            {exam.problems.length}문항 · {Math.floor(exam.timeLimitSec / 60)}분
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(exam.tags ?? []).slice(0, 4).map((tag) => (
              <span key={tag} className={`rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black ${color.text}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        {allowed ? (
          <button
            type="button"
            onClick={onStart}
            className={`shrink-0 rounded-md px-3 py-2 text-xs font-black text-white ${color.button}`}
          >
            시작
          </button>
        ) : (
          <span className="shrink-0 rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-black text-slate-600">
            🔒 {lockLabel}
          </span>
        )}
      </div>
    </article>
  );
}

export default function StudentExamsPage() {
  const router = useRouter();
  const { user, authChecked } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [dailyCount, setDailyCount] = useState(0);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [pickedSubject, setPickedSubject] = useState<string | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [unitTestCount, setUnitTestCount] = useState(10);
  const [realExamOpen, setRealExamOpen] = useState(false);
  const [subjectExamOpen, setSubjectExamOpen] = useState(false);
  const [selectedMockSubject, setSelectedMockSubject] = useState<string | null>(null);
  const [generatedExams, setGeneratedExams] = useState<GeneratedExam[]>([]);

  // 데일리 테스트는 free 등급도 이용 가능. 커뮤니티도 등급 가드 없음.
  const canDaily = true;
  const canSubjectMock = canUseTier(user, "go");
  // 단원별 학습: 모든 등급 가능.
  // Free: 주1회·10문항 / Go: 일1회 / Plus 이상: 무제한
  const canUnitPractice = !!user;
  const isFreeRestricted = !!user && user.role !== "admin" && user.tier === "free";
  const isGoRestricted = !!user && user.role !== "admin" && user.tier === "go";

  // 단원별 학습: 마지막 응시 시각 (등급별 제한 검사)
  const [lastUnitTestAt, setLastUnitTestAt] = useState<number | null>(null);
  useEffect(() => {
    if (!user || (!isFreeRestricted && !isGoRestricted)) {
      setLastUnitTestAt(null);
      return;
    }
    let cancelled = false;
    attemptRepo.listResults().then((rows) => {
      if (cancelled) return;
      const unit = rows.filter((r) => r.examId?.startsWith("unit-test-"));
      if (unit.length === 0) {
        setLastUnitTestAt(null);
        return;
      }
      const latest = Math.max(...unit.map((r) => Date.parse(r.submittedAt)));
      setLastUnitTestAt(Number.isFinite(latest) ? latest : null);
    });
    return () => {
      cancelled = true;
    };
  }, [user, isFreeRestricted, isGoRestricted]);

  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const freeBlockedUntil =
    isFreeRestricted && lastUnitTestAt !== null && Date.now() - lastUnitTestAt < ONE_WEEK_MS
      ? new Date(lastUnitTestAt + ONE_WEEK_MS)
      : null;
  // Go 일1회: 마지막 응시가 오늘이면 차단. 다음 가능은 내일 0시.
  const goBlockedToday = (() => {
    if (!isGoRestricted || lastUnitTestAt === null) return false;
    const last = new Date(lastUnitTestAt);
    const now = new Date();
    return (
      last.getFullYear() === now.getFullYear() &&
      last.getMonth() === now.getMonth() &&
      last.getDate() === now.getDate()
    );
  })();
  const goNextAvailable = goBlockedToday
    ? (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(0, 0, 0, 0);
        return d;
      })()
    : null;
  // 실전 모의고사 카드 자체는 plus 이상에서만 클릭 가능
  // (모달 안의 가장 낮은 카테고리=기출기반이 plus).
  const canRealExam = canUseTier(user, "plus");
  const subjectGeneratedExams = generatedExams.filter(isSubjectGeneratedExam);
  const selectedSubjectGeneratedExams = selectedMockSubject
    ? subjectGeneratedExams.filter((exam) => (exam.tags ?? []).includes(selectedMockSubject))
    : [];
  const realGeneratedExams = generatedExams.filter(isRealGeneratedExam);

  useEffect(() => {
    let cancelled = false;
    Promise.all([questionRepo.countAll(), questionRepo.countByTag("daily"), examRepo.listGenerated()])
      .then(([total, daily, exams]) => {
        if (cancelled) return;
        setQuestionCount(total);
        setDailyCount(daily);
        setGeneratedExams(exams.filter((exam) => !(exam.tags ?? []).includes("weakness")));
      })
      .catch(() => {
        if (cancelled) return;
        setQuestionCount(0);
        setDailyCount(0);
        setGeneratedExams([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (user?.role === "student") {
      const pending = window.localStorage.getItem(WELCOME_KEY);
      if (pending === "true") setShowWelcome(true);
    }
  }, [user]);

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
    setSelectedUnits([...(SUBJECT_UNIT_MAP[name] ?? [])]);
  }

  function toggleUnit(unit: string) {
    setSelectedUnits((prev) =>
      prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]
    );
  }

  function startUnitTest() {
    if (!pickedSubject || selectedUnits.length === 0) return;
    if (freeBlockedUntil) {
      const ts = freeBlockedUntil.toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
      window.alert(`Free 등급은 단원별 학습을 주 1회만 응시할 수 있어요.\n다음 가능: ${ts}\n\n무제한 이용은 Plus 이상 등급에서 가능합니다.`);
      return;
    }
    if (goNextAvailable) {
      const ts = goNextAvailable.toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
      window.alert(`Go 등급은 단원별 학습을 하루 1회만 응시할 수 있어요.\n다음 가능: ${ts}\n\n무제한 이용은 Plus 이상 등급에서 가능합니다.`);
      return;
    }
    const enforcedCount = isFreeRestricted ? 10 : unitTestCount;
    const params = new URLSearchParams({
      subject: pickedSubject,
      units: selectedUnits.join(","),
      count: String(enforcedCount),
      seed: String(Date.now()),
    });
    router.push(`/student/exams/unit-test?${params.toString()}`);
    setSubjectModalOpen(false);
  }

  if (!authChecked) return null;
  if (showWelcome && user) return <WelcomeScreen user={user} onDone={dismissWelcome} />;

  if (!user) {
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
          루트매쓰 CBT
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
              <div className="mt-1 text-xl font-black text-ink">{formatQuestionStat(questionCount)}</div>
            </div>
            <div className="rounded-md border border-line px-4 py-3">
              <div className="text-xs font-bold text-slate-500">시험</div>
              <div className="mt-1 text-xl font-black text-ink">{formatExamStat(questionCount)}</div>
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
          {dailyCount === 0 ? (
            <span className="shrink-0 rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-black text-slate-400">
              준비 중
            </span>
          ) : canDaily ? (
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
              🔒 {tierLockMessage("go")}
            </span>
          )}
        </div>

        {/* Pro 복습: 최근 7일 틀린 문제 */}
        <div
          className="mt-3 flex items-center justify-between rounded-xl px-5 py-4 shadow-soft"
          style={{
            backgroundColor: "#dcfce7",
            border: "2px solid #0b8a61",
          }}
        >
          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-mint-600">
              PRO+ · 복습
            </p>
            <p className="mt-0.5 text-base font-black text-ink">최근 틀린 문제 다시 보기</p>
            <p className="mt-0.5 text-xs text-slate-700">
              지난 7일 동안 틀린 문제만 모아 복습 (Pro 이상)
            </p>
          </div>
          {canUseTier(user, "pro") ? (
            <Link
              href="/student/wrong-questions"
              className="shrink-0 rounded-lg px-5 py-2.5 text-sm font-black text-white hover:opacity-90"
              style={{ backgroundColor: "#0b8a61" }}
            >
              열람 →
            </Link>
          ) : (
            <span className="shrink-0 rounded-lg bg-slate-200 px-5 py-2.5 text-sm font-black text-slate-500">
              🔒 {tierLockMessage("pro")}
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
                {user.name}님이 자주 틀리는 유형을 분석해 만든 25문항 맞춤형 모의고사예요.
                <br />
                약점 보강 + 미체험 유형 + 오답 복습 + 강점 심화 4단계로 출제됩니다.
              </p>
            </div>
            <span className="shrink-0 text-5xl">🎯</span>
          </div>
          <Link
            href="/student/exams/weakness/analysis"
            className="mt-4 flex w-full items-center justify-center rounded-lg bg-white py-3 text-sm font-black text-orange-600 transition hover:brightness-95"
          >
            분석 보기 / 응시하기 →
          </Link>
        </div>
      </section>

      {/* 단원별 학습 + 과목별 모의고사 */}
      <section className="mb-5 grid gap-5 md:grid-cols-2">
        {/* 단원별 학습 */}
        <div className="flex flex-col rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-2xl">
              📚
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-brand-600">
                Unit Practice
              </p>
              <h2 className="mt-0.5 text-lg font-black text-ink">단원별 학습</h2>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            과목별로 집중 학습하세요. 원하는 단원을 골라 10·15·20문항으로 풀 수 있어요. 한 번 본 문제는 뒤로 밀려요.
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
          {canUnitPractice ? (
            <button
              type="button"
              onClick={openSubjectModal}
              className="mt-4 w-full rounded-md bg-brand-600 py-3 text-sm font-black text-white hover:bg-brand-700"
            >
              과목 선택하기
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="mt-4 w-full cursor-not-allowed rounded-md bg-slate-100 py-3 text-sm font-black text-slate-400"
            >
              🔒 {tierLockMessage("plus")}
            </button>
          )}
        </div>

        {/* 과목별 모의고사 */}
        <div className="flex flex-col rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange-50 text-2xl">
              ⏱️
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-orange-600">
                Subject Mock Exam
              </p>
              <h2 className="mt-0.5 text-lg font-black text-ink">과목별 모의고사</h2>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            한 과목을 골라 20문항을 50분 안에 푸는 과목별 모의고사예요. 시간 압박 속에서 실력을 점검해 보세요.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SUBJECTS.map((s) => (
              <span
                key={s.name}
                className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600"
              >
                {s.name}
              </span>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4 text-center text-sm">
            <div>
              <div className="text-xs font-bold text-slate-400">문항</div>
              <div className="font-black text-ink">20문항</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400">시간</div>
              <div className="font-black text-ink">50분</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400">방식</div>
              <div className="font-black text-ink">과목별</div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            {canSubjectMock ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedMockSubject(null);
                  setSubjectExamOpen(true);
                }}
                className="flex-1 rounded-md bg-orange-500 py-3 text-sm font-black text-white hover:bg-orange-600"
              >
                모의고사 선택하기
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="flex-1 cursor-not-allowed rounded-md bg-slate-100 py-3 text-sm font-black text-slate-400"
              >
                🔒 {tierLockMessage("go")}
              </button>
            )}
            <Link
              href="/student/results?type=subject_mock"
              className="rounded-md border border-orange-300 bg-white px-4 py-3 text-sm font-black text-orange-600 hover:bg-orange-50"
            >
              📊 지난 성적
            </Link>
          </div>
        </div>
      </section>

      {/* 실전 모의고사 */}
      <section className="mb-5">
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
                {s.name}
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
          <div className="mt-4 space-y-2">
            {canRealExam ? (
              <button
                type="button"
                onClick={() => setRealExamOpen(true)}
                className="w-full rounded-md bg-mint-600 py-3 text-sm font-black text-white hover:bg-mint-700"
              >
                모의고사 선택하기 →
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-md bg-slate-100 py-3 text-sm font-black text-slate-400"
              >
                🔒 {tierLockMessage("plus")}
              </button>
            )}
            <Link
              href="/student/results?type=real"
              className="flex w-full items-center justify-center rounded-md border border-mint-300 bg-white px-4 py-3 text-sm font-black text-mint-600 hover:bg-mint-50"
            >
              📊 지난 성적 보기
            </Link>
            <p className="text-center text-xs leading-5 text-slate-500">
              기출기반·학교별·파이널 등 4종 모의고사를 응시할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

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
                            : [...(SUBJECT_UNIT_MAP[pickedSubject] ?? [])]
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
                    {COUNT_OPTIONS.map((n) => {
                      const locked = isFreeRestricted && n !== 10;
                      const active = (isFreeRestricted ? 10 : unitTestCount) === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => !locked && setUnitTestCount(n)}
                          disabled={locked}
                          title={locked ? "Free 등급은 10문항만 가능합니다" : undefined}
                          className={`flex-1 rounded-lg py-2.5 text-sm font-black transition ${
                            active
                              ? "bg-brand-600 text-white"
                              : locked
                                ? "cursor-not-allowed border border-dashed border-line bg-slate-50 text-slate-400"
                                : "border border-line bg-white text-slate-600 hover:border-brand-400"
                          }`}
                        >
                          {n}문항{locked ? " 🔒" : ""}
                        </button>
                      );
                    })}
                  </div>
                  {isFreeRestricted ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Free 등급은 주 1회 · 10문항만 가능합니다.
                      {freeBlockedUntil ? (
                        <span className="ml-1 font-black text-coral-600">
                          다음 가능: {freeBlockedUntil.toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      ) : null}
                    </p>
                  ) : isGoRestricted ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Go 등급은 하루 1회만 가능합니다.
                      {goNextAvailable ? (
                        <span className="ml-1 font-black text-coral-600">
                          다음 가능: {goNextAvailable.toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      ) : null}
                    </p>
                  ) : null}
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
                  <h3 className="text-xl font-black text-ink">단원별 학습</h3>
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

      {/* 과목별 모의고사 선택 모달 */}
      {subjectExamOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-4 pb-6 sm:items-center sm:pb-0"
          onClick={() => setSubjectExamOpen(false)}
        >
          <div
            className="max-h-[82vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5">
              <h3 className="text-xl font-black text-ink">과목별 모의고사</h3>
              <p className="mt-1 text-sm text-slate-500">
                {selectedMockSubject ? `${selectedMockSubject} 모의고사를 선택하세요` : "응시할 과목을 선택하세요"}
              </p>
            </div>
            {subjectGeneratedExams.length === 0 ? (
              <div className="rounded-xl border border-line bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">
                등록된 과목별 모의고사가 없습니다.
              </div>
            ) : !selectedMockSubject ? (
              <div className="space-y-2">
                {SUBJECTS.map((subject) => {
                  const examCount = subjectGeneratedExams.filter((exam) => (exam.tags ?? []).includes(subject.name)).length;
                  return (
                    <button
                      key={subject.name}
                      type="button"
                      onClick={() => setSelectedMockSubject(subject.name)}
                      className="flex w-full items-center justify-between rounded-xl border border-line px-4 py-3 text-left hover:border-orange-400 hover:bg-orange-50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="text-2xl">{subject.emoji}</span>
                        <div>
                          <div className="text-sm font-black text-ink">{subject.name}</div>
                          <div className="text-xs text-slate-500">{examCount}개 모의고사</div>
                        </div>
                      </div>
                      <span className="text-xs font-black text-orange-600">보기 →</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <>
                {selectedSubjectGeneratedExams.length === 0 ? (
                  <div className="rounded-xl border border-line bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">
                    {selectedMockSubject}에 등록된 모의고사가 없습니다.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedSubjectGeneratedExams.map((exam) => (
                      <GeneratedExamOption
                        key={exam.id}
                        exam={exam}
                        accent="orange"
                        allowed={canUseTier(user, requiredTierForGeneratedExam(exam))}
                        lockLabel={tierLockMessage(requiredTierForGeneratedExam(exam))}
                        onStart={() => {
                          setSubjectExamOpen(false);
                          setSelectedMockSubject(null);
                          router.push(`/student/exams/${exam.id}`);
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
            <div className="mt-4 flex gap-2">
              {selectedMockSubject ? (
                <button
                  type="button"
                  onClick={() => setSelectedMockSubject(null)}
                  className="flex-1 rounded-md border border-line py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
                >
                  ← 과목 선택
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setSubjectExamOpen(false);
                  setSelectedMockSubject(null);
                }}
                className="flex-1 rounded-md border border-line py-3 text-sm font-black text-slate-600 hover:bg-slate-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 실전 모의고사 선택 모달 */}
      {realExamOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-4 pb-6 sm:items-center sm:pb-0"
          onClick={() => setRealExamOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5">
              <h3 className="text-xl font-black text-ink">실전 모의고사</h3>
              <p className="mt-1 text-sm text-slate-500">응시할 모의고사를 선택하세요</p>
            </div>
            {realGeneratedExams.length === 0 ? (
              <div className="rounded-xl border border-line bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">
                등록된 실전 모의고사가 없습니다.
              </div>
            ) : (
              <div className="space-y-2">
                {realGeneratedExams.map((exam) => (
                  <GeneratedExamOption
                    key={exam.id}
                    exam={exam}
                    accent="mint"
                    allowed={canUseTier(user, requiredTierForGeneratedExam(exam))}
                    lockLabel={tierLockMessage(requiredTierForGeneratedExam(exam))}
                    onStart={() => {
                      setRealExamOpen(false);
                      router.push(`/student/exams/${exam.id}`);
                    }}
                  />
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setRealExamOpen(false)}
              className="mt-4 w-full rounded-md border border-line py-3 text-sm font-black text-slate-600 hover:bg-slate-50"
            >
              닫기
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
