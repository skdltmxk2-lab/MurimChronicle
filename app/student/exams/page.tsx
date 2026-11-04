"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { questionRepo } from "@/lib/questions/questionRepository";
import { examRepo } from "@/lib/exams/generatedExamRepository";
import { useAuth } from "@/lib/auth/AuthContext";
import { canUseTier, tierLockMessage } from "@/lib/auth/tierGuard";
import { AdSlot } from "@/components/ads/AdSlot";
import { WelcomeScreen } from "@/components/exam/WelcomeScreen";
import { SUBJECTS, SUBJECT_UNITS } from "@/lib/taxonomy";
import { formatQuestionStat, formatExamStat } from "@/lib/stats/displayed";
import type { GeneratedExam } from "@/types/generatedExam";
import type { UserTier } from "@/types/auth";

const WELCOME_KEY = "cbt:welcome:pending";

const SUBJECT_UNIT_MAP: Record<string, readonly string[]> = SUBJECT_UNITS;

// 통계 포맷터는 src/lib/stats/displayed.ts 한 곳에서 관리.
// FLOOR 만 바꾸면 랜딩·시험·메타·OG 이미지가 동시에 갱신된다.

const COUNT_OPTIONS = [10, 15, 20];

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
  // 과목별 모의고사는 무료 개방. 실전 모의고사(기출유형·자체모고·파이널)는 PRO 전용.
  if (tags.includes("과목별모의고사")) return "free";
  return "pro";
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
          hover: "tz-study-hover-line tz-study-hover-paper",
          button: "tz-study-ink-fill tz-study-hover-ink",
          text: "tz-study-accent",
        }
      : {
          hover: "tz-study-hover-line tz-study-hover-paper",
          button: "tz-study-ink-fill tz-study-hover-ink",
          text: "tz-study-accent",
        };

  return (
    <article className={`tz-study-square border tz-study-line px-4 py-3 ${allowed ? color.hover : "tz-study-paper-2"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className={`text-sm font-bold ${allowed ? "tz-study-ink" : "tz-study-muted"}`}>
            {exam.title}
          </h4>
          <p className="mt-1 text-xs font-bold tz-study-muted">
            {exam.problems.length}문항, {Math.floor(exam.timeLimitSec / 60)}분
          </p>
        </div>
        {allowed ? (
          <button
            type="button"
            onClick={onStart}
            className={`shrink-0 tz-study-square px-3 py-2 text-xs font-bold tz-study-on-ink ${color.button}`}
          >
            시작
          </button>
        ) : (
          <span className="shrink-0 tz-study-square tz-study-paper-3 px-2.5 py-1 text-xs font-bold tz-study-muted">
            {lockLabel}
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
  const [selectedRealType, setSelectedRealType] = useState<"past" | "school" | "finalA" | "finalB" | null>(null);
  const [generatedExams, setGeneratedExams] = useState<GeneratedExam[]>([]);

  // 무료 개방 기능: 데일리·단원별 학습·과목별 모의고사·취약유형 모의고사·커뮤니티는
  // 등급 제한 없이 로그인만 하면 이용할 수 있다 (이 페이지는 비로그인 시 early return).
  // 실전 모의고사는 PRO 전용.
  const canRealExam = canUseTier(user, "pro");
  // 오답 복습은 모든 로그인 사용자에게 열려 있고, 보관 기간만 등급별로 다르다 (무료 7일 / PRO 30일).
  const isPro = canUseTier(user, "pro");
  const subjectGeneratedExams = generatedExams.filter(isSubjectGeneratedExam);
  const selectedSubjectGeneratedExams = selectedMockSubject
    ? subjectGeneratedExams.filter((exam) => (exam.tags ?? []).includes(selectedMockSubject))
    : [];
  const realGeneratedExams = generatedExams.filter(isRealGeneratedExam);
  const selectedRealGeneratedExams = selectedRealType
    ? realGeneratedExams.filter((exam) => {
        const tags = exam.tags ?? [];
        if (selectedRealType === "past") return tags.includes("기출유형");
        if (selectedRealType === "school") return tags.includes("자체모고");
        if (selectedRealType === "finalA") return tags.includes("유형3");
        return tags.includes("유형4");
      })
    : [];

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
    const params = new URLSearchParams({
      subject: pickedSubject,
      units: selectedUnits.join(","),
      count: String(unitTestCount),
      seed: String(Date.now()),
    });
    router.push(`/student/exams/unit-test?${params.toString()}`);
    setSubjectModalOpen(false);
  }

  if (!authChecked) return null;
  if (showWelcome && user) return <WelcomeScreen user={user} onDone={dismissWelcome} />;

  if (!user) {
    return (
      <main className="tz-study tz-study-guest">
        <section className="tz-study-login">

          <h1 className="text-2xl font-bold tz-study-ink">로그인이 필요합니다</h1>
          <p className="mt-3 text-sm leading-7 tz-study-muted">
            모의고사를 응시하려면 로그인해 주세요.
            <br />
            아직 계정이 없으시다면 지금 무료로 가입하세요!
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/student/register"
              className="tz-study-square tz-study-ink-fill px-6 py-3 text-sm font-bold tz-study-on-ink tz-study-hover-ink"
            >
              회원가입
            </Link>
          </div>
          <p className="mt-4 text-xs tz-study-muted">
            이미 계정이 있으시면 상단에서 로그인해주세요.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="tz-study">
      <header className="tz-study-heading">
        <div>
          <h1>시험 목록</h1>
          <p>{user.name}님, 오늘도 화이팅이에요! 빈출 유형 및 모의고사를 풀어보세요.</p>
        </div>
        <dl className="tz-study-counts">
          <div><dt>문항</dt><dd>{formatQuestionStat(questionCount)}</dd></div>
          <div><dt>시험</dt><dd>{formatExamStat(questionCount)}</dd></div>
        </dl>
      </header>

      <section className="tz-study-today" aria-label="오늘의 학습">
        <article className="tz-study-daily">
          <div className="tz-study-daily-main">
            <h2>오늘의 <br />데일리 테스트</h2>
            <time>{getTodayStr()}</time>
          </div>
          <div className="tz-study-daily-bottom">
            <div className="tz-study-daily-count">
              {dailyCount > 0 ? <><strong>{Math.min(5, dailyCount)}</strong><span>문항</span></> : <strong className="tz-study-preparing">준비 중</strong>}
              <p>{dailyCount > 0 ? "매일 로테이션" : "준비 중"}</p>
            </div>
            {dailyCount === 0 ? (
              <span className="tz-study-disabled">준비 중</span>
            ) : (
              <button type="button" onClick={() =>
                router.push(
                  `/student/exams/unit-test?mode=daily&count=5&date=${getTodayParam()}`
                )
              } className="tz-study-button">데일리 테스트 풀기</button>
            )}
          </div>
        </article>
        <article className="tz-study-review">
          <div>
            <h2>최근 틀린 문제 <br />다시 보기</h2>
            <p>{isPro ? "지난 30일 동안 틀린 문제를 모아 복습할 수 있어요." : "무료는 최근 7일, PRO는 30일치 오답을 모아 복습해요."}</p>
          </div>
          <Link href="/student/wrong-questions" className="tz-study-button tz-study-button-quiet">오답 열람</Link>
        </article>
      </section>

      <AdSlot slot="exams-top" className="tz-study-ad" />

      <section className="tz-study-methods" aria-labelledby="tz-study-methods-title">
        <div className="tz-study-section-heading"><h2 id="tz-study-methods-title">과목과 목적에 맞는 학습</h2><span>단원별, 과목별</span></div>
        <div className="tz-study-method-grid">
          <article className="tz-study-method tz-study-method-unit">
            <div className="tz-study-method-top"><h3>단원별 학습</h3><p className="tz-study-figure">10~20<span>문항</span></p></div>
            <p className="tz-study-description">과목별로 집중 학습하세요. 원하는 단원을 골라 10, 15, 20문항으로 풀 수 있어요. 한 번 본 문제는 뒤로 밀려요.</p>
            <div className="tz-study-subjects">{SUBJECTS.map((s) => <span key={s.name}>{s.name}</span>)}</div>
            <dl className="tz-study-specs"><div><dt>문항</dt><dd>10~20문항</dd></div><div><dt>시간</dt><dd>자유</dd></div><div><dt>방식</dt><dd>단원별</dd></div></dl>
            <button type="button" onClick={openSubjectModal} className="tz-study-button tz-study-button-wide">과목 선택하기</button>
          </article>
          <article className="tz-study-method tz-study-method-subject">
            <div className="tz-study-method-top"><h3>과목별 모의고사</h3><p className="tz-study-figure">50<span>분</span></p></div>
            <p className="tz-study-description">한 과목을 골라 20문항을 50분 안에 푸는 과목별 모의고사예요. 시간 압박 속에서 실력을 점검해 보세요.</p>
            <div className="tz-study-subjects">{SUBJECTS.map((s) => <span key={s.name}>{s.name}</span>)}</div>
            <dl className="tz-study-specs"><div><dt>문항</dt><dd>20문항</dd></div><div><dt>시간</dt><dd>50분</dd></div><div><dt>방식</dt><dd>과목별</dd></div></dl>
            <div className="tz-study-method-actions">
              <button type="button" onClick={() => { setSelectedMockSubject(null); setSubjectExamOpen(true); }} className="tz-study-button">모의고사 선택하기</button>
              <Link href="/student/results?type=subject_mock" className="tz-study-text-link">지난 성적</Link>
            </div>
          </article>
        </div>
      </section>

      <section className="tz-study-advanced" aria-labelledby="tz-study-real-title">
        <div className="tz-study-advanced-title"><h2 id="tz-study-real-title">실전 모의고사</h2><p className="tz-study-advanced-figure">25<span>문항</span></p></div>
        <div className="tz-study-advanced-body">
          <p>5개 과목에서 각 5문항씩, 총 25문항으로 구성된 실전형 모의고사예요. 편입시험과 동일한 형식으로 풀어보세요.</p>
          <p className="tz-study-availability">매년 9월~1월 업로드됩니다.</p>
          <div className="tz-study-subjects">{SUBJECTS.map((s) => <span key={s.name}>{s.name}</span>)}</div>
          <dl className="tz-study-specs"><div><dt>문항</dt><dd>25문항</dd></div><div><dt>시간</dt><dd>60분</dd></div><div><dt>방식</dt><dd>실전형</dd></div></dl>
          <div className="tz-study-method-actions">
            {canRealExam ? (
              <button type="button" onClick={() => { setSelectedRealType(null); setRealExamOpen(true); }} className="tz-study-button">모의고사 선택하기</button>
            ) : (
              <Link href="/student/pricing" className="tz-study-button tz-study-button-quiet">{tierLockMessage("pro")} 요금제 보기</Link>
            )}
            <Link href="/student/results?type=real" className="tz-study-text-link">지난 성적 보기</Link>
          </div>
          <p className="tz-study-footnote">기출기반, 학교별, 파이널 등 4종 모의고사를 응시할 수 있습니다.</p>
        </div>
      </section>

      <section className="tz-study-weakness">
        <div><h2>{user.name}님의 취약유형 모의고사</h2><p>{user.name}님이 자주 틀리는 유형을 분석해 만든 25문항 맞춤형 모의고사예요.</p><p className="tz-study-footnote">약점 보강 + 미체험 유형 + 오답 복습 + 강점 심화 4단계로 출제됩니다.</p></div>
        <Link href="/student/exams/weakness/analysis" className="tz-study-button tz-study-button-quiet">분석 보기 / 응시하기</Link>
      </section>

      {/* 과목 선택 모달 */}
      {subjectModalOpen && (
        <div
          className="tz-study-modal-layer"
          onClick={() => setSubjectModalOpen(false)}
        >
          <div
            className="tz-study-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {pickedSubject ? (
              <>
                {/* 단원 + 문제 수 선택 */}
                <div className="mb-4 flex items-center gap-3">
                  <div>
                    <h3 className="text-lg font-bold tz-study-ink">{pickedSubject}</h3>
                    <p className="text-xs tz-study-muted">단원을 선택하고 문제 수를 정하세요</p>
                  </div>
                </div>

                {/* 단원 선택 */}
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold tz-study-muted">단원 선택</p>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedUnits(
                          selectedUnits.length === (SUBJECT_UNIT_MAP[pickedSubject] ?? []).length
                            ? []
                            : [...(SUBJECT_UNIT_MAP[pickedSubject] ?? [])]
                        )
                      }
                      className="text-xs font-bold tz-study-accent hover:underline"
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
                        className={`tz-study-square px-3 py-1.5 text-sm font-bold transition ${
                          selectedUnits.includes(unit)
                            ? "tz-study-ink-fill tz-study-on-ink"
                            : "border tz-study-line tz-study-plate tz-study-muted tz-study-hover-line"
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 문제 수 선택 */}
                <div className="mb-5">
                  <p className="mb-2 text-xs font-bold tz-study-muted">문제 수</p>
                  <div className="flex gap-2">
                    {COUNT_OPTIONS.map((n) => {
                      const active = unitTestCount === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setUnitTestCount(n)}
                          className={`flex-1 tz-study-square py-2.5 text-sm font-bold transition ${
                            active
                              ? "tz-study-ink-fill tz-study-on-ink"
                              : "border tz-study-line tz-study-plate tz-study-muted tz-study-hover-line"
                          }`}
                        >
                          {n}문항
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPickedSubject(null)}
                    className="flex-1 tz-study-square border tz-study-line py-3 text-sm font-bold tz-study-ink tz-study-hover-paper"
                  >
                    다른 과목
                  </button>
                  <button
                    type="button"
                    onClick={startUnitTest}
                    disabled={selectedUnits.length === 0}
                    className="flex-1 tz-study-square tz-study-ink-fill py-3 text-sm font-bold tz-study-on-ink tz-study-hover-ink disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    시작하기
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-5">
                  <h3 className="text-xl font-bold tz-study-ink">단원별 학습</h3>
                  <p className="mt-1 text-sm tz-study-muted">학습할 과목을 선택하세요</p>
                </div>
                <div className="space-y-2">
                  {SUBJECTS.map((subject) => (
                    <button
                      key={subject.name}
                      type="button"
                      onClick={() => pickSubject(subject.name)}
                      className="flex w-full items-center gap-4 tz-study-square border tz-study-line px-4 py-3 text-left tz-study-hover-line tz-study-hover-paper"
                    >

                      <div>
                        <div className="text-sm font-bold tz-study-ink">{subject.name}</div>
                        <div className="text-xs tz-study-muted">{subject.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSubjectModalOpen(false)}
                  className="mt-4 w-full tz-study-square border tz-study-line py-3 text-sm font-bold tz-study-muted tz-study-hover-paper"
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
          className="tz-study-modal-layer"
          onClick={() => setSubjectExamOpen(false)}
        >
          <div
            className="tz-study-modal tz-study-modal-wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5">
              <h3 className="text-xl font-bold tz-study-ink">과목별 모의고사</h3>
              <p className="mt-1 text-sm tz-study-muted">
                {selectedMockSubject ? `${selectedMockSubject} 모의고사를 선택하세요` : "응시할 과목을 선택하세요"}
              </p>
            </div>
            {subjectGeneratedExams.length === 0 ? (
              <div className="tz-study-square border tz-study-line tz-study-paper-2 p-5 text-center text-sm font-bold tz-study-muted">
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
                      className="flex w-full items-center justify-between tz-study-square border tz-study-line px-4 py-3 text-left tz-study-hover-line tz-study-hover-paper"
                    >
                      <div className="flex min-w-0 items-center gap-3">

                        <div>
                          <div className="text-sm font-bold tz-study-ink">{subject.name}</div>
                          <div className="text-xs tz-study-muted">{examCount}개 모의고사</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold tz-study-accent">보기</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <>
                {selectedSubjectGeneratedExams.length === 0 ? (
                  <div className="tz-study-square border tz-study-line tz-study-paper-2 p-5 text-center text-sm font-bold tz-study-muted">
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
                  className="flex-1 tz-study-square border tz-study-line py-3 text-sm font-bold tz-study-ink tz-study-hover-paper"
                >
                  과목 선택
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setSubjectExamOpen(false);
                  setSelectedMockSubject(null);
                }}
                className="flex-1 tz-study-square border tz-study-line py-3 text-sm font-bold tz-study-muted tz-study-hover-paper"
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
          className="tz-study-modal-layer"
          onClick={() => setRealExamOpen(false)}
        >
          <div
            className="tz-study-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5">
              <h3 className="text-xl font-bold tz-study-ink">실전 모의고사</h3>
              <p className="mt-1 text-sm tz-study-muted">
                {selectedRealType ? "응시할 모의고사를 선택하세요" : "응시할 모의고사 종류를 선택하세요"}
              </p>
            </div>
            {!selectedRealType ? (
              <div className="space-y-2">
                {[
                  { key: "past", label: "기출기반 모의고사", desc: "역대 기출 문제 기반", req: "pro" as const, tag: "기출유형" },
                  { key: "school", label: "학교별 모의고사", desc: "학교별 출제 경향 반영", req: "pro" as const, tag: "자체모고" },
                  { key: "finalA", label: "파이널 모의고사 A", desc: "실전 난이도", req: "pro" as const, tag: "유형3" },
                  { key: "finalB", label: "파이널 모의고사 B", desc: "최고 난이도", req: "pro" as const, tag: "유형4" },
                ].map((item) => {
                  const allowed = canUseTier(user, item.req);
                  const examCount = realGeneratedExams.filter((exam) => (exam.tags ?? []).includes(item.tag)).length;
                  return (
                    <div
                      key={item.key}
                      className={`flex items-center justify-between tz-study-square border px-4 py-3 ${
                        allowed
                          ? "tz-study-line tz-study-hover-line tz-study-hover-paper"
                          : "tz-study-line tz-study-paper-2"
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <div className={`text-sm font-bold ${allowed ? "tz-study-ink" : "tz-study-muted"}`}>
                          {item.label}
                        </div>
                        <div className="text-xs tz-study-muted">{item.desc}, {examCount}개</div>
                      </div>
                      {!allowed ? (
                        <span className="shrink-0 tz-study-square tz-study-paper-3 px-2.5 py-1 text-xs font-bold tz-study-muted">
                          {tierLockMessage(item.req)}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedRealType(item.key as "past" | "school" | "finalA" | "finalB")}
                          className="shrink-0 tz-study-square tz-study-ink-fill px-3 py-1.5 text-xs font-bold tz-study-on-ink tz-study-hover-ink"
                        >
                          보기
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : selectedRealGeneratedExams.length === 0 ? (
              <div className="tz-study-square border tz-study-line tz-study-paper-2 p-5 text-center text-sm font-bold tz-study-muted">
                등록된 실전 모의고사가 없습니다.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedRealGeneratedExams.map((exam) => (
                  <GeneratedExamOption
                    key={exam.id}
                    exam={exam}
                    accent="mint"
                    allowed={canUseTier(user, requiredTierForGeneratedExam(exam))}
                    lockLabel={tierLockMessage(requiredTierForGeneratedExam(exam))}
                    onStart={() => {
                      setRealExamOpen(false);
                      setSelectedRealType(null);
                      router.push(`/student/exams/${exam.id}`);
                    }}
                  />
                ))}
              </div>
            )}
            <div className="mt-4 flex gap-2">
              {selectedRealType ? (
                <button
                  type="button"
                  onClick={() => setSelectedRealType(null)}
                  className="flex-1 tz-study-square border tz-study-line py-3 text-sm font-bold tz-study-ink tz-study-hover-paper"
                >
                  종류 선택
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setRealExamOpen(false);
                  setSelectedRealType(null);
                }}
                className="flex-1 tz-study-square border tz-study-line py-3 text-sm font-bold tz-study-muted tz-study-hover-paper"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
