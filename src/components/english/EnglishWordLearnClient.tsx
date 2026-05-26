"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { adminFetch } from "@/lib/api/adminFetch";

type Item = { id: number; word: string; meaning: string };

export function EnglishWordLearnClient() {
  const { user, authChecked } = useAuth();
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [maxDay, setMaxDay] = useState<number>(1);
  const [day, setDay] = useState<number | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hideAnswer, setHideAnswer] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const loadProgress = useCallback(async () => {
    try {
      const res = await adminFetch("/api/english/progress");
      const json = await res.json();
      if (!json.ok) {
        setError(json.message ?? "진척도를 불러오지 못했어요.");
        return null;
      }
      setCurrentDay(json.currentDay as number);
      setMaxDay(json.maxDay as number);
      return json as { currentDay: number; maxDay: number };
    } catch {
      setError("진척도를 불러오지 못했어요.");
      return null;
    }
  }, []);

  const loadDay = useCallback(async (n: number) => {
    setLoading(true);
    setError("");
    setItems(null);
    setRevealed(new Set());
    try {
      const res = await adminFetch(`/api/english/word-learn?day=${n}`);
      const json = await res.json();
      if (!json.ok) {
        setError(json.message ?? "단어를 불러오지 못했어요.");
        return;
      }
      setItems(json.items as Item[]);
      setDay(json.day as number);
      setMaxDay(json.maxDay as number);
    } catch {
      setError("단어를 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authChecked || !user) return;
    (async () => {
      const p = await loadProgress();
      if (p) await loadDay(p.currentDay);
    })();
  }, [authChecked, user, loadProgress, loadDay]);

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

  async function saveProgress(n: number) {
    setSaving(true);
    setSavedMsg("");
    try {
      const res = await adminFetch("/api/english/progress", {
        method: "POST",
        body: JSON.stringify({ currentDay: n }),
      });
      const json = await res.json();
      if (json.ok) {
        setCurrentDay(json.currentDay as number);
        setSavedMsg("진척도가 저장됐어요.");
        window.setTimeout(() => setSavedMsg(""), 2200);
      }
    } finally {
      setSaving(false);
    }
  }

  async function finishDay() {
    if (day == null) return;
    const next = Math.min(day + 1, maxDay);
    await saveProgress(next);
    if (next > day) await loadDay(next);
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

  const isReviewingPast = day != null && currentDay != null && day < currentDay;

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href="/student/english/words" className="text-xs font-black text-slate-500 hover:text-brand-700">
            ← 단어
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black text-ink">📚 단어 학습</h1>
            {items && items.length > 0 ? (
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
            ) : null}
          </div>
          {currentDay != null ? (
            <p className="mt-1 text-xs font-bold text-slate-500">
              현재 진척도: Day {currentDay} / {maxDay}
            </p>
          ) : null}
        </div>
        <Link
          href="/student/english/words/learn/review"
          className="shrink-0 rounded-md border border-line px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50"
        >
          이전 day 복습 →
        </Link>
      </div>

      {error ? (
        <div className="mb-4 rounded-md bg-coral-50 px-4 py-3 text-sm font-bold text-coral-600">{error}</div>
      ) : null}

      {/* Day 선택 */}
      <section className="mb-4 rounded-2xl border border-line bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => day != null && day > 1 && loadDay(day - 1)}
              disabled={day == null || day <= 1 || loading}
              className="rounded-md border border-line px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              ← 이전 Day
            </button>
            <button
              type="button"
              onClick={() => day != null && day < maxDay && loadDay(day + 1)}
              disabled={day == null || day >= maxDay || loading}
              className="rounded-md border border-line px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              다음 Day →
            </button>
          </div>
          <p className="text-sm font-black text-ink">
            {day != null ? `Day ${day}` : "—"} <span className="text-xs font-bold text-slate-400">/ {maxDay}</span>
          </p>
        </div>
        {isReviewingPast ? (
          <p className="mt-2 text-[11px] font-bold text-amber-600">
            지난 Day를 복습 중이에요. 진척도는 그대로 유지됩니다.
          </p>
        ) : null}
      </section>

      {loading || items == null ? (
        <p className="py-16 text-center text-sm text-slate-400">불러오는 중...</p>
      ) : items.length === 0 ? (
        <section className="rounded-2xl border border-line bg-white p-10 text-center shadow-soft">
          <div className="text-4xl">📭</div>
          <p className="mt-2 text-sm font-bold text-slate-600">이 day에 단어가 아직 없어요.</p>
        </section>
      ) : (
        <>
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

          {/* 액션 */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4 shadow-soft">
            <div className="text-xs font-bold text-slate-500">
              {savedMsg ? <span className="text-mint-700">{savedMsg}</span> : "오늘 day를 끝내면 다음 day로 이어집니다."}
            </div>
            <div className="flex flex-wrap gap-2">
              {day != null && currentDay != null && day === currentDay && day < maxDay ? (
                <button
                  type="button"
                  onClick={finishDay}
                  disabled={saving}
                  className="rounded-md bg-mint-600 px-5 py-2.5 text-sm font-black text-white hover:bg-mint-700 disabled:opacity-50"
                >
                  {saving ? "저장 중..." : `Day ${day} 끝내고 Day ${day + 1}로 →`}
                </button>
              ) : null}
              {day != null && currentDay != null && day === currentDay && day >= maxDay ? (
                <span className="rounded-md bg-amber-50 px-4 py-2.5 text-sm font-black text-amber-700">
                  마지막 Day에 도달했어요! 🎉
                </span>
              ) : null}
              <Link
                href={`/student/english/words/test`}
                className="rounded-md border border-line px-5 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                이 범위로 단어 테스트 →
              </Link>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
