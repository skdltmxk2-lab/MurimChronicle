"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { adminFetch } from "@/lib/api/adminFetch";

type Q = { id: number; word: string; correct: string; choices: string[] };
type SetMeta = {
  setIndex?: number;
  size?: number;
  totalSets?: number;
  day?: number;
  maxDay?: number;
};

const SET_SIZE = 20;
const LS_NEXT_SET = "cbt:english:word-test:nextSet";

type Props = { dayMode?: number | null };

export function EnglishWordTestClient({ dayMode = null }: Props) {
  const { user, authChecked } = useAuth();
  const [totalSets, setTotalSets] = useState<number>(0);
  const [questions, setQuestions] = useState<Q[] | null>(null);
  const [setMeta, setSetMeta] = useState<SetMeta | null>(null);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongIds, setWrongIds] = useState<number[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── 자동 진행 Set 모드 ──────────────────────────────
  const readNextSet = useCallback((): number => {
    try {
      const raw = localStorage.getItem(LS_NEXT_SET);
      const n = raw ? Number(raw) : 1;
      return Number.isFinite(n) && n >= 1 ? n : 1;
    } catch {
      return 1;
    }
  }, []);

  const writeNextSet = useCallback((n: number) => {
    try {
      localStorage.setItem(LS_NEXT_SET, String(n));
    } catch {
      // 무시
    }
  }, []);

  const startAutoSet = useCallback(
    async (n: number) => {
      setLoading(true);
      setError("");
      setQuestions(null);
      setSetMeta(null);
      setIdx(0);
      setSelected(null);
      setWrongIds([]);
      setCorrectCount(0);
      setFinished(false);
      try {
        const res = await adminFetch(`/api/english/word-test?set=${n}&size=${SET_SIZE}`);
        const json = await res.json();
        if (!json.ok) {
          setError(json.message ?? "불러오는 중 오류가 발생했습니다.");
          return;
        }
        if (!json.questions?.length) {
          setError(json.message ?? "이 세트의 단어가 부족해요.");
          setQuestions([]);
          return;
        }
        setQuestions(json.questions as Q[]);
        setSetMeta((json.setMeta as SetMeta) ?? null);
      } catch {
        setError("불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const startDay = useCallback(async (day: number) => {
    setLoading(true);
    setError("");
    setQuestions(null);
    setSetMeta(null);
    setIdx(0);
    setSelected(null);
    setWrongIds([]);
    setCorrectCount(0);
    setFinished(false);
    try {
      const res = await adminFetch(`/api/english/word-test?day=${day}`);
      const json = await res.json();
      if (!json.ok) {
        setError(json.message ?? "불러오는 중 오류가 발생했습니다.");
        return;
      }
      if (!json.questions?.length) {
        setError(json.message ?? "이 Day의 단어가 부족해요.");
        setQuestions([]);
        return;
      }
      setQuestions(json.questions as Q[]);
      setSetMeta((json.setMeta as SetMeta) ?? null);
    } catch {
      setError("불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 진입 시 자동 시작
  useEffect(() => {
    if (!authChecked || !user) return;
    (async () => {
      if (dayMode != null) {
        await startDay(dayMode);
        return;
      }
      // 자동 Set 모드: 전체 세트 수 조회 후 next Set 시작
      try {
        const res = await adminFetch("/api/english/progress");
        const json = await res.json();
        if (json.ok) {
          const total = (json.total as number) ?? 0;
          const ts = Math.max(0, Math.ceil(total / SET_SIZE));
          setTotalSets(ts);
          if (ts === 0) {
            setError("등록된 단어가 부족해요.");
            return;
          }
          let n = readNextSet();
          if (n > ts) n = 1; // 한 바퀴 돌면 처음으로
          await startAutoSet(n);
        } else {
          setError(json.message ?? "정보를 불러오지 못했어요.");
        }
      } catch {
        setError("정보를 불러오지 못했어요.");
      }
    })();
  }, [authChecked, user, dayMode, readNextSet, startAutoSet, startDay]);

  function choose(c: string) {
    if (selected || !questions) return;
    setSelected(c);
    const q = questions[idx];
    if (c === q.correct) setCorrectCount((n) => n + 1);
    else setWrongIds((prev) => [...prev, q.id]);
  }

  async function next() {
    if (!questions) return;
    if (idx + 1 >= questions.length) {
      setFinished(true);
      // 자동 Set 모드라면 다음 세트로 진척도 진행
      if (dayMode == null && setMeta?.setIndex && setMeta.totalSets) {
        const next = setMeta.setIndex >= setMeta.totalSets ? 1 : setMeta.setIndex + 1;
        writeNextSet(next);
      }
      if (wrongIds.length > 0) {
        try {
          await adminFetch("/api/english/wrong-words", {
            method: "POST",
            body: JSON.stringify({ wrongIds }),
          });
        } catch {
          // 무시
        }
      }
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
  }

  function retryCurrent() {
    if (dayMode != null && setMeta?.day) startDay(setMeta.day);
    else if (setMeta?.setIndex) startAutoSet(setMeta.setIndex);
  }

  function goNextSet() {
    if (!setMeta?.setIndex || !setMeta.totalSets) return;
    const next = setMeta.setIndex >= setMeta.totalSets ? 1 : setMeta.setIndex + 1;
    startAutoSet(next);
  }

  if (!authChecked) return null;
  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16 text-center">
        <h1 className="text-2xl font-black text-ink">로그인이 필요합니다</h1>
        <Link
          href="/student/register"
          className="mt-6 inline-block rounded-md bg-brand-600 px-6 py-3 text-sm font-black text-white"
        >
          회원가입
        </Link>
      </main>
    );
  }

  const backHref = dayMode != null ? "/student/english/words/learn" : "/student/english/words";
  const backLabel = dayMode != null ? "← 단어 학습" : "← 단어";

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <Link href={backHref} className="text-xs font-black text-slate-500 hover:text-brand-700">
            {backLabel}
          </Link>
          <h1 className="mt-1 text-2xl font-black text-ink">
            📝 단어 테스트
            {dayMode != null && setMeta?.day ? (
              <span className="ml-2 text-base font-bold text-brand-600">Day {setMeta.day}</span>
            ) : null}
          </h1>
        </div>
        <Link
          href="/student/english/wrong-words"
          className="rounded-md border border-line px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50"
        >
          틀린 단어 보기
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-soft">
          <div className="text-3xl">📭</div>
          <p className="mt-2 text-sm font-bold text-slate-500">{error}</p>
          {dayMode == null ? (
            <button
              type="button"
              onClick={() => startAutoSet(readNextSet())}
              className="mt-4 rounded-md bg-brand-600 px-5 py-2.5 text-sm font-black text-white hover:bg-brand-700"
            >
              다시 시도
            </button>
          ) : null}
        </div>
      ) : loading || !questions ? (
        <p className="py-16 text-center text-sm text-slate-400">불러오는 중...</p>
      ) : finished ? (
        <section className="rounded-2xl border border-line bg-white p-8 text-center shadow-soft">
          <div className="text-4xl">{correctCount === questions.length ? "🎉" : "📊"}</div>
          <h2 className="mt-3 text-2xl font-black text-ink">
            {questions.length}문제 중 {correctCount}개 정답
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {wrongIds.length > 0
              ? `틀린 ${wrongIds.length}개 단어는 '내 틀린 단어'에 저장됐어요.`
              : "전부 맞혔어요! 멋져요."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={retryCurrent}
              className="rounded-md bg-brand-600 px-5 py-3 text-sm font-black text-white hover:bg-brand-700"
            >
              {dayMode != null ? "이 Day 다시 풀기" : "이 세트 다시 풀기"}
            </button>
            {dayMode == null && setMeta?.setIndex && setMeta.totalSets ? (
              <button
                type="button"
                onClick={goNextSet}
                className="rounded-md bg-mint-600 px-5 py-3 text-sm font-black text-white hover:bg-mint-700"
              >
                {setMeta.setIndex >= setMeta.totalSets
                  ? "처음 세트로 돌아가기 →"
                  : `다음 세트 (Set ${setMeta.setIndex + 1}) →`}
              </button>
            ) : null}
            <Link
              href="/student/english/wrong-words"
              className="rounded-md border border-line px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              틀린 단어 보기
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between text-xs font-bold text-slate-400">
            <span>
              {dayMode != null && setMeta?.day
                ? `Day ${setMeta.day}`
                : setMeta?.setIndex && setMeta.totalSets
                  ? `Set ${setMeta.setIndex} / ${setMeta.totalSets}`
                  : null}{" "}
              · {idx + 1} / {questions.length}
            </span>
            <span>정답 {correctCount}</span>
          </div>
          <p className="text-center text-3xl font-black text-ink">{questions[idx].word}</p>
          <p className="mt-1 text-center text-xs text-slate-400">알맞은 뜻을 고르세요</p>

          <div className="mt-5 space-y-2">
            {questions[idx].choices.map((c, i) => {
              const isCorrect = c === questions[idx].correct;
              const isPicked = c === selected;
              let cls = "border-line bg-white hover:border-brand-400";
              if (selected) {
                if (isCorrect) cls = "border-mint-500 bg-mint-50";
                else if (isPicked) cls = "border-coral-300 bg-coral-50";
                else cls = "border-line bg-white opacity-60";
              }
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => choose(c)}
                  disabled={!!selected}
                  className={`flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left text-sm leading-6 text-ink transition ${cls}`}
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-md bg-slate-100 text-xs font-black text-slate-600">
                    {i + 1}
                  </span>
                  <span className="flex-1 whitespace-pre-wrap">{c}</span>
                </button>
              );
            })}
          </div>

          {selected ? (
            <button
              type="button"
              onClick={next}
              className="mt-5 w-full rounded-md bg-brand-600 py-3 text-sm font-black text-white hover:bg-brand-700"
            >
              {idx + 1 >= questions.length ? "결과 보기" : "다음 →"}
            </button>
          ) : null}
        </section>
      )}

      {/* 총 진척 안내 (자동 Set 모드 / 진행 중일 때만) */}
      {!error && !finished && questions && dayMode == null && setMeta?.setIndex && totalSets > 0 ? (
        <p className="mt-3 text-center text-[11px] font-bold text-slate-400">
          다음 단어테스트는 Set {setMeta.setIndex >= totalSets ? 1 : setMeta.setIndex + 1} 부터 자동으로 이어집니다.
        </p>
      ) : null}
    </main>
  );
}
