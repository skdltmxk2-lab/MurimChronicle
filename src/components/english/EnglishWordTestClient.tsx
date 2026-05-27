"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { adminFetch } from "@/lib/api/adminFetch";

type Q = { id: number; word: string; correct: string; choices: string[] };
type SetMeta = { setIndex: number; size: number; totalSets: number };

const SET_SIZE = 20;
const LS_LAST_SET = "cbt:english:word-test:lastSet";

export function EnglishWordTestClient() {
  const { user, authChecked } = useAuth();
  const [totalSets, setTotalSets] = useState<number>(0);
  const [unlockedSets, setUnlockedSets] = useState<number>(0);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [selectedSet, setSelectedSet] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Q[] | null>(null);
  const [setMeta, setSetMeta] = useState<SetMeta | null>(null);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongIds, setWrongIds] = useState<number[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadMeta = useCallback(async () => {
    setError("");
    try {
      const res = await adminFetch("/api/english/progress");
      const json = await res.json();
      if (!json.ok) {
        setError(json.message ?? "정보를 불러오지 못했어요.");
        return;
      }
      const total = (json.total as number) ?? 0;
      const ts = Math.max(0, Math.ceil(total / SET_SIZE));
      setTotalSets(ts);
      // 학습 진척도 기준 잠금: currentDay 까지 학습한 단어 = currentDay * wordsPerDay 까지의 세트만 풀 수 있다.
      const day = (json.currentDay as number) ?? 1;
      const wordsPerDay = (json.wordsPerDay as number) ?? 50;
      setCurrentDay(day);
      const unlocked = Math.min(ts, Math.floor((day * wordsPerDay) / SET_SIZE));
      setUnlockedSets(Math.max(unlocked, 1));
    } catch {
      setError("정보를 불러오지 못했어요.");
    }
  }, []);

  useEffect(() => {
    if (authChecked && user) loadMeta();
  }, [authChecked, user, loadMeta]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_LAST_SET);
      if (raw) {
        const n = Number(raw);
        if (Number.isFinite(n) && n >= 1) setSelectedSet(n);
      }
    } catch {
      // 무시
    }
  }, []);

  async function startSet(n: number) {
    if (unlockedSets > 0 && n > unlockedSets) {
      setError("아직 학습하지 않은 범위의 세트예요. 단어 학습으로 해당 Day를 끝낸 뒤 풀 수 있어요.");
      return;
    }
    setLoading(true);
    setError("");
    setQuestions(null);
    setSetMeta(null);
    setIdx(0);
    setSelected(null);
    setWrongIds([]);
    setCorrectCount(0);
    setFinished(false);
    setSelectedSet(n);
    try {
      localStorage.setItem(LS_LAST_SET, String(n));
    } catch {
      // 무시
    }
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
  }

  function backToPicker() {
    setQuestions(null);
    setSetMeta(null);
    setIdx(0);
    setSelected(null);
    setWrongIds([]);
    setCorrectCount(0);
    setFinished(false);
    setError("");
  }

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

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <Link href="/student/english/words" className="text-xs font-black text-slate-500 hover:text-brand-700">
            ← 단어
          </Link>
          <h1 className="mt-1 text-2xl font-black text-ink">📝 단어 테스트</h1>
        </div>
        <Link
          href="/student/english/wrong-words"
          className="rounded-md border border-line px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50"
        >
          틀린 단어 보기
        </Link>
      </div>

      {error && !questions ? (
        <div className="mb-4 rounded-md bg-coral-50 px-4 py-3 text-sm font-bold text-coral-600">{error}</div>
      ) : null}

      {/* 세트 선택 */}
      {!questions && !loading ? (
        totalSets === 0 ? (
          <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-soft">
            <div className="text-3xl">📭</div>
            <p className="mt-2 text-sm font-bold text-slate-500">등록된 단어가 부족해요.</p>
            <button
              type="button"
              onClick={loadMeta}
              className="mt-4 rounded-md bg-brand-600 px-5 py-2.5 text-sm font-black text-white hover:bg-brand-700"
            >
              새로고침
            </button>
          </div>
        ) : (
          <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
            <p className="text-sm text-slate-600">
              총 <b className="text-ink">{totalSets}</b>개 세트(각 {SET_SIZE}개) · 현재 Day {currentDay}까지 학습해서{" "}
              <b className="text-brand-700">Set {unlockedSets}</b>까지 열려 있어요.
            </p>
            <p className="mt-1 text-[11px] font-bold text-slate-400">
              잠긴 세트는 단어 학습으로 해당 Day를 끝내면 자동으로 열립니다.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {Array.from({ length: totalSets }, (_, i) => i + 1).map((n) => {
                const isActive = selectedSet === n;
                const isLocked = n > unlockedSets;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => !isLocked && startSet(n)}
                    disabled={isLocked}
                    aria-disabled={isLocked}
                    title={isLocked ? "단어 학습으로 이 범위를 학습한 뒤 풀 수 있어요." : undefined}
                    className={`rounded-md border px-3 py-3 text-sm font-black transition ${
                      isLocked
                        ? "cursor-not-allowed border-line bg-slate-50 text-slate-300"
                        : isActive
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-line bg-white text-slate-700 hover:border-brand-400 hover:bg-brand-50/40"
                    }`}
                  >
                    {isLocked ? `🔒 Set ${n}` : `Set ${n}`}
                    <span className={`block text-[10px] font-bold ${isLocked ? "text-slate-300" : "text-slate-400"}`}>
                      {(n - 1) * SET_SIZE + 1}–{n * SET_SIZE}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )
      ) : null}

      {/* 시험 진행 */}
      {loading ? (
        <p className="py-16 text-center text-sm text-slate-400">불러오는 중...</p>
      ) : !questions ? null : finished ? (
        <section className="rounded-2xl border border-line bg-white p-8 text-center shadow-soft">
          <div className="text-4xl">{correctCount === questions.length ? "🎉" : "📊"}</div>
          <h2 className="mt-3 text-2xl font-black text-ink">
            {questions.length}문제 중 {correctCount}개 정답
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {wrongIds.length > 0
              ? `틀린 ${wrongIds.length}개 단어는 '틀린 단어'에 저장됐어요.`
              : "전부 맞혔어요! 멋져요."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => startSet(setMeta?.setIndex ?? selectedSet ?? 1)}
              className="rounded-md bg-brand-600 px-5 py-3 text-sm font-black text-white hover:bg-brand-700"
            >
              이 세트 다시 풀기
            </button>
            {setMeta && setMeta.setIndex < setMeta.totalSets ? (
              <button
                type="button"
                onClick={() => startSet(setMeta.setIndex + 1)}
                className="rounded-md bg-mint-600 px-5 py-3 text-sm font-black text-white hover:bg-mint-700"
              >
                다음 세트 →
              </button>
            ) : null}
            <button
              type="button"
              onClick={backToPicker}
              className="rounded-md border border-line px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              세트 다시 고르기
            </button>
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
              Set {setMeta?.setIndex ?? selectedSet} · {idx + 1} / {questions.length}
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
          ) : (
            <button
              type="button"
              onClick={backToPicker}
              className="mt-5 w-full rounded-md border border-line py-3 text-sm font-black text-slate-500 hover:bg-slate-50"
            >
              세트 다시 고르기
            </button>
          )}
        </section>
      )}
    </main>
  );
}
