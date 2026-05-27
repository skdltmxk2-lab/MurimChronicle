"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { adminFetch } from "@/lib/api/adminFetch";

type Item = { id: number; word: string; meaning: string };
type LearnMode = "card" | "list";

const LS_MODE_KEY = "cbt:english:learn:mode";

export function EnglishWordLearnClient() {
  const { user, authChecked } = useAuth();
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [maxDay, setMaxDay] = useState<number>(1);
  const [day, setDay] = useState<number | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 카드 모드 상태
  const [cardIdx, setCardIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // 리스트 모드 상태
  const [hideAnswer, setHideAnswer] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Set<number>>(new Set());

  // 학습 모드(카드 / 단어표)
  const [mode, setMode] = useState<LearnMode>("card");

  // 다시 볼 단어 마킹 — 기존 english_wrong_words 와 같은 풀을 사용한다.
  const [markedIds, setMarkedIds] = useState<Set<number>>(new Set());
  const [markingId, setMarkingId] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  // 모드 localStorage 복구
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_MODE_KEY);
      if (saved === "list" || saved === "card") setMode(saved);
    } catch {
      // 무시
    }
  }, []);

  function switchMode(m: LearnMode) {
    setMode(m);
    try {
      localStorage.setItem(LS_MODE_KEY, m);
    } catch {
      // 무시
    }
  }

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
    setCardIdx(0);
    setRevealed(false);
    setRevealedIds(new Set());
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

  const loadMarked = useCallback(async () => {
    try {
      const res = await adminFetch("/api/english/wrong-words");
      const json = await res.json();
      if (!json.ok) return;
      const ids = new Set<number>(
        (json.items as { wordId: number }[]).map((it) => it.wordId)
      );
      setMarkedIds(ids);
    } catch {
      // 무시 — 마킹 목록 로드 실패는 학습 자체를 막지 않음
    }
  }, []);

  useEffect(() => {
    if (!authChecked || !user) return;
    (async () => {
      const p = await loadProgress();
      if (p) await loadDay(p.currentDay);
      await loadMarked();
    })();
  }, [authChecked, user, loadProgress, loadDay, loadMarked]);

  async function toggleMark(wordId: number) {
    if (markingId === wordId) return;
    setMarkingId(wordId);
    const already = markedIds.has(wordId);
    try {
      const res = await adminFetch("/api/english/wrong-words", {
        method: "POST",
        body: JSON.stringify(already ? { remove: wordId } : { wrongIds: [wordId] }),
      });
      const json = await res.json();
      if (!json.ok) return;
      setMarkedIds((prev) => {
        const next = new Set(prev);
        if (already) next.delete(wordId);
        else next.add(wordId);
        return next;
      });
    } finally {
      setMarkingId(null);
    }
  }

  const goPrev = useCallback(() => {
    setCardIdx((i) => {
      if (i <= 0) return i;
      setRevealed(false);
      return i - 1;
    });
  }, []);
  const goNext = useCallback(() => {
    setCardIdx((i) => {
      if (!items || i >= items.length - 1) return i;
      setRevealed(false);
      return i + 1;
    });
  }, [items]);

  // 키보드 단축키: 카드 모드일 때만
  useEffect(() => {
    if (mode !== "card") return;
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setRevealed((r) => !r);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, goPrev, goNext]);

  function toggleHideList() {
    setHideAnswer((prev) => {
      if (prev) setRevealedIds(new Set());
      return !prev;
    });
  }
  function revealOneList(id: number) {
    setRevealedIds((prev) => {
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
  const item = items && cardIdx < items.length ? items[cardIdx] : null;
  const onLast = items != null && items.length > 0 && cardIdx === items.length - 1;
  const onFirst = cardIdx === 0;

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href="/student/english/words" className="text-xs font-black text-slate-500 hover:text-brand-700">
            ← 단어
          </Link>
          <h1 className="mt-1 text-2xl font-black text-ink">📚 단어 학습</h1>
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

      {/* Day 선택 + 모드 토글 */}
      <section className="mb-4 rounded-2xl border border-line bg-white p-4 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
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
            <p className="ml-2 text-sm font-black text-ink">
              {day != null ? `Day ${day}` : "—"}{" "}
              <span className="text-xs font-bold text-slate-400">/ {maxDay}</span>
            </p>
          </div>

          {/* 모드 토글 */}
          <div className="inline-flex rounded-full border border-line bg-slate-50 p-1 text-xs font-black">
            <button
              type="button"
              onClick={() => switchMode("card")}
              className={`rounded-full px-3 py-1.5 transition ${
                mode === "card"
                  ? "bg-brand-600 text-white shadow"
                  : "text-slate-500 hover:text-brand-700"
              }`}
            >
              📇 카드
            </button>
            <button
              type="button"
              onClick={() => switchMode("list")}
              className={`rounded-full px-3 py-1.5 transition ${
                mode === "list"
                  ? "bg-brand-600 text-white shadow"
                  : "text-slate-500 hover:text-brand-700"
              }`}
            >
              📋 단어표
            </button>
          </div>
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
      ) : mode === "card" && item ? (
        <>
          {/* 진행 인디케이터 + 마킹 토글 */}
          <div className="mb-3 flex items-center justify-between gap-2 text-xs font-bold text-slate-500">
            <span>
              {cardIdx + 1} / {items.length}
            </span>
            <div className="flex items-center gap-2">
              {item ? (
                <button
                  type="button"
                  onClick={() => toggleMark(item.id)}
                  disabled={markingId === item.id}
                  aria-pressed={markedIds.has(item.id)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-black transition disabled:opacity-50 ${
                    markedIds.has(item.id)
                      ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                      : "border border-line text-slate-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700"
                  }`}
                >
                  {markedIds.has(item.id) ? "🔖 다시 볼 단어 (해제)" : "🔖 다시 볼 단어"}
                </button>
              ) : null}
              <span className="hidden text-slate-400 sm:inline">
                탭 / Space: 뜻 보기 · ← → : 단어 이동
              </span>
            </div>
          </div>

          {/* 카드 + 좌우 화살표 */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRevealed((r) => !r)}
              className={`group flex min-h-[280px] w-full flex-col items-center justify-center rounded-3xl border bg-white px-14 py-8 text-center shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg sm:px-20 ${
                markedIds.has(item.id)
                  ? "border-amber-300 ring-2 ring-amber-100 hover:border-amber-400"
                  : "border-line hover:border-brand-400"
              }`}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brand-500">
                Day {day} · {String(cardIdx + 1).padStart(2, "0")}
              </p>
              <p className="mt-4 break-words text-4xl font-black text-ink sm:text-5xl">
                {item.word}
              </p>
              {revealed ? (
                <p className="mt-6 whitespace-pre-wrap text-base leading-7 text-slate-700">
                  {item.meaning}
                </p>
              ) : (
                <p className="mt-6 inline-flex items-center gap-1 rounded-full border border-dashed border-line px-3 py-1.5 text-[11px] font-black text-slate-400 transition group-hover:border-brand-400 group-hover:text-brand-600">
                  👁️ 카드를 눌러 뜻 보기
                </p>
              )}
            </button>

            {/* 좌측 화살표 */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              disabled={onFirst}
              aria-label="이전 단어"
              className="absolute left-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-2xl font-black text-slate-700 shadow-soft transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line disabled:hover:bg-white disabled:hover:text-slate-700 sm:left-4 sm:size-12"
            >
              ‹
            </button>

            {/* 우측 화살표 */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              disabled={onLast}
              aria-label="다음 단어"
              className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-2xl font-black text-slate-700 shadow-soft transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line disabled:hover:bg-white disabled:hover:text-slate-700 sm:right-4 sm:size-12"
            >
              ›
            </button>
          </div>

          {/* 액션 */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4 shadow-soft">
            <div className="text-xs font-bold text-slate-500">
              {savedMsg ? (
                <span className="text-mint-700">{savedMsg}</span>
              ) : onLast ? (
                "마지막 카드예요. Day를 마무리해 보세요!"
              ) : (
                "마지막 카드에서 Day를 끝낼 수 있어요."
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {day != null && currentDay != null && day === currentDay && day < maxDay && onLast ? (
                <button
                  type="button"
                  onClick={finishDay}
                  disabled={saving}
                  className="rounded-md bg-mint-600 px-5 py-2.5 text-sm font-black text-white hover:bg-mint-700 disabled:opacity-50"
                >
                  {saving ? "저장 중..." : `Day ${day} 끝내고 Day ${day + 1}로 →`}
                </button>
              ) : null}
              {day != null && currentDay != null && day === currentDay && day >= maxDay && onLast ? (
                <span className="rounded-md bg-amber-50 px-4 py-2.5 text-sm font-black text-amber-700">
                  마지막 Day에 도달했어요! 🎉
                </span>
              ) : null}
              <Link
                href="/student/english/wrong-words"
                className="rounded-md border border-line px-4 py-2.5 text-sm font-black text-slate-700 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700"
              >
                📌 내 틀린 단어
                {markedIds.size > 0 ? (
                  <span className="ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">
                    {markedIds.size}
                  </span>
                ) : null}
              </Link>
              <Link
                href="/student/english/words/test"
                className="rounded-md border border-line px-5 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                이 범위로 단어 테스트 →
              </Link>
            </div>
          </div>
        </>
      ) : mode === "list" ? (
        <>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-black text-ink">Day {day} 단어 {items.length}개</p>
            <button
              type="button"
              onClick={toggleHideList}
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
            {items.map((it, i) => {
              const marked = markedIds.has(it.id);
              return (
                <li
                  key={it.id}
                  className={`flex items-start justify-between gap-3 rounded-xl border bg-white px-4 py-3 shadow-soft ${
                    marked ? "border-amber-300 ring-1 ring-amber-100" : "border-line"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[10px] font-black text-slate-400">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-base font-black text-ink">{it.word}</span>
                    </div>
                    {hideAnswer && !revealedIds.has(it.id) ? (
                      <button
                        type="button"
                        onClick={() => revealOneList(it.id)}
                        className="mt-1 inline-flex items-center gap-1 rounded-md border border-dashed border-line px-2 py-1 text-[11px] font-black text-slate-500 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
                      >
                        👁️ 뜻 보기
                      </button>
                    ) : (
                      <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-600">{it.meaning}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleMark(it.id)}
                    disabled={markingId === it.id}
                    aria-pressed={marked}
                    title={marked ? "다시 볼 단어 해제" : "다시 볼 단어로 표시"}
                    className={`shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-black transition disabled:opacity-50 ${
                      marked
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                        : "border border-line text-slate-500 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700"
                    }`}
                  >
                    {marked ? "🔖 표시됨" : "🔖 표시"}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4 shadow-soft">
            <div className="text-xs font-bold text-slate-500">
              {savedMsg ? (
                <span className="text-mint-700">{savedMsg}</span>
              ) : (
                "다 외웠으면 이 Day를 마무리해 주세요."
              )}
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
                href="/student/english/wrong-words"
                className="rounded-md border border-line px-4 py-2.5 text-sm font-black text-slate-700 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700"
              >
                📌 내 틀린 단어
                {markedIds.size > 0 ? (
                  <span className="ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">
                    {markedIds.size}
                  </span>
                ) : null}
              </Link>
              <Link
                href="/student/english/words/test"
                className="rounded-md border border-line px-5 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                이 범위로 단어 테스트 →
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </main>
  );
}
