"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { adminFetch } from "@/lib/api/adminFetch";

type Q = { id: number; word: string; correct: string; choices: string[] };

const LS_LAST_DAILY_SEED = "cbt:english:daily:lastSeed";

export function EnglishDailyClient() {
  const { user, authChecked } = useAuth();
  const [questions, setQuestions] = useState<Q[] | null>(null);
  const [seed, setSeed] = useState<number | null>(null);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongIds, setWrongIds] = useState<number[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setQuestions(null);
    setIdx(0);
    setSelected(null);
    setWrongIds([]);
    setCorrectCount(0);
    setFinished(false);
    try {
      const res = await adminFetch("/api/english/daily");
      const json = await res.json();
      if (!json.ok) {
        setError(json.message ?? "불러오는 중 오류가 발생했습니다.");
        return;
      }
      if (!json.questions?.length) {
        setError(json.message ?? "오늘은 출제할 단어가 부족해요.");
        setQuestions([]);
        return;
      }
      setQuestions(json.questions as Q[]);
      setSeed((json.seed as number) ?? null);
      try {
        const lastSeed = localStorage.getItem(LS_LAST_DAILY_SEED);
        if (lastSeed && Number(lastSeed) === json.seed) setAlreadyDone(true);
      } catch {
        // 무시
      }
    } catch {
      setError("불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authChecked && user) load();
  }, [authChecked, user, load]);

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
      if (seed != null) {
        try {
          localStorage.setItem(LS_LAST_DAILY_SEED, String(seed));
        } catch {
          // 무시
        }
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
          <Link href="/student/english" className="text-xs font-black text-slate-500 hover:text-brand-700">
            ← 편입영어
          </Link>
          <h1 className="mt-1 text-2xl font-black text-ink">📅 데일리테스트</h1>
          <p className="mt-1 text-xs font-bold text-slate-500">매일 다른 영단어 10개 — 가볍게 워밍업해요.</p>
        </div>
        <Link
          href="/student/english/wrong-words"
          className="rounded-md border border-line px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50"
        >
          틀린 단어 보기
        </Link>
      </div>

      {alreadyDone && !finished && questions && questions.length > 0 ? (
        <div className="mb-4 rounded-md bg-mint-50 px-4 py-3 text-sm font-bold text-mint-700">
          오늘 데일리테스트는 이미 풀었어요. 한 번 더 풀어도 좋아요!
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-soft">
          <div className="text-3xl">📭</div>
          <p className="mt-2 text-sm font-bold text-slate-500">{error}</p>
          <button
            type="button"
            onClick={load}
            className="mt-4 rounded-md bg-brand-600 px-5 py-2.5 text-sm font-black text-white hover:bg-brand-700"
          >
            다시 시도
          </button>
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
              ? `틀린 ${wrongIds.length}개 단어는 '틀린 단어'에 저장됐어요.`
              : "전부 맞혔어요! 멋져요."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={load}
              className="rounded-md bg-brand-600 px-5 py-3 text-sm font-black text-white hover:bg-brand-700"
            >
              다시 풀기
            </button>
            <Link
              href="/student/english/words"
              className="rounded-md border border-line px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              단어 학습하러 가기
            </Link>
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
              {idx + 1} / {questions.length}
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
    </main>
  );
}
