"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { adminFetch } from "@/lib/api/adminFetch";

type Item = { id: number; word: string; meaning: string };

export function EnglishWordLearnReviewClient() {
  const { user, authChecked } = useAuth();
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [maxDay, setMaxDay] = useState<number>(1);
  const [day, setDay] = useState<number | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hideAnswer, setHideAnswer] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const loadProgress = useCallback(async () => {
    try {
      const res = await adminFetch("/api/english/progress");
      const json = await res.json();
      if (!json.ok) {
        setError(json.message ?? "정보를 불러오지 못했어요.");
        return;
      }
      setCurrentDay(json.currentDay as number);
      setMaxDay(json.maxDay as number);
    } catch {
      setError("정보를 불러오지 못했어요.");
    }
  }, []);

  useEffect(() => {
    if (authChecked && user) loadProgress();
  }, [authChecked, user, loadProgress]);

  async function loadDay(n: number) {
    setLoading(true);
    setError("");
    setItems(null);
    setRevealed(new Set());
    setDay(n);
    try {
      const res = await adminFetch(`/api/english/word-learn?day=${n}`);
      const json = await res.json();
      if (!json.ok) {
        setError(json.message ?? "단어를 불러오지 못했어요.");
        return;
      }
      setItems(json.items as Item[]);
    } catch {
      setError("단어를 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }

  function toggleHide() {
    setHideAnswer((prev) => {
      if (prev) setRevealed(new Set());
      return !prev;
    });
  }
  function revealOne(id: number) {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
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

  const reviewableMax = Math.min(currentDay, maxDay);
  const days = Array.from({ length: reviewableMax }, (_, i) => i + 1);

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <div className="mb-5">
        <Link href="/student/english" className="text-xs font-black text-slate-500 hover:text-brand-700">
          ← 편입영어
        </Link>
        <h1 className="mt-1 text-2xl font-black text-ink">📖 단어학습 복습</h1>
        <p className="mt-1 text-xs font-bold text-slate-500">
          지금까지 학습한 Day 1 ~ Day {reviewableMax} 까지 다시 볼 수 있어요.
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-md bg-coral-50 px-4 py-3 text-sm font-bold text-coral-600">{error}</div>
      ) : null}

      {/* Day 선택 */}
      <section className="mb-4 rounded-2xl border border-line bg-white p-4 shadow-soft">
        <p className="mb-3 text-xs font-black text-slate-500">복습할 Day를 골라주세요</p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {days.map((n) => {
            const isActive = day === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => loadDay(n)}
                className={`rounded-md border px-3 py-2 text-xs font-black transition ${
                  isActive
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-line bg-white text-slate-700 hover:border-brand-400 hover:bg-brand-50/40"
                }`}
              >
                Day {n}
              </button>
            );
          })}
        </div>
      </section>

      {day == null ? (
        <p className="py-12 text-center text-sm text-slate-400">위에서 Day를 선택해 주세요.</p>
      ) : loading || items == null ? (
        <p className="py-16 text-center text-sm text-slate-400">불러오는 중...</p>
      ) : items.length === 0 ? (
        <section className="rounded-2xl border border-line bg-white p-10 text-center shadow-soft">
          <div className="text-4xl">📭</div>
          <p className="mt-2 text-sm font-bold text-slate-600">이 day에 단어가 없어요.</p>
        </section>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-black text-ink">Day {day} 단어 {items.length}개</p>
            <button
              type="button"
              onClick={toggleHide}
              aria-pressed={hideAnswer}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black transition ${
                hideAnswer
                  ? "bg-brand-600 text-white hover:bg-brand-700"
                  : "border border-line text-slate-600 hover:border-brand-400 hover:text-brand-700"
              }`}
            >
              {hideAnswer ? "🙈 답 보이기" : "👁️ 답 가리기"}
            </button>
          </div>
          <ul className="space-y-2">
            {items.map((it, i) => (
              <li
                key={it.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3 shadow-soft"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-black text-slate-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-base font-black text-ink">{it.word}</span>
                  </div>
                  {hideAnswer && !revealed.has(it.id) ? (
                    <button
                      type="button"
                      onClick={() => revealOne(it.id)}
                      className="mt-1 inline-flex items-center gap-1 rounded-md border border-dashed border-line px-2 py-1 text-[11px] font-black text-slate-500 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
                    >
                      👁️ 뜻 보기
                    </button>
                  ) : (
                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-600">{it.meaning}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
