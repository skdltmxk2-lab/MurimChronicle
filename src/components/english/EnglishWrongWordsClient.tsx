"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { adminFetch } from "@/lib/api/adminFetch";

type Item = { wordId: number; word: string; meaning: string; wrongCount: number; lastWrongAt: string };

export function EnglishWrongWordsClient() {
  const { user, authChecked } = useAuth();
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<number | null>(null);

  async function load() {
    setError("");
    try {
      const res = await adminFetch("/api/english/wrong-words");
      const json = await res.json();
      if (!json.ok) {
        setError(json.message ?? "불러오는 중 오류가 발생했습니다.");
        setItems([]);
        return;
      }
      setItems(json.items as Item[]);
    } catch {
      setError("불러오는 중 오류가 발생했습니다.");
      setItems([]);
    }
  }

  useEffect(() => {
    if (authChecked && user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, user]);

  async function remove(wordId: number) {
    setRemoving(wordId);
    try {
      const res = await adminFetch("/api/english/wrong-words", {
        method: "POST",
        body: JSON.stringify({ remove: wordId }),
      });
      const json = await res.json();
      if (json.ok) setItems((prev) => (prev ?? []).filter((x) => x.wordId !== wordId));
    } catch {
      // 무시
    } finally {
      setRemoving(null);
    }
  }

  if (!authChecked) return null;
  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16 text-center">
        <h1 className="text-2xl font-black text-ink">로그인이 필요합니다</h1>
        <Link href="/student/register" className="mt-6 inline-block rounded-md bg-brand-600 px-6 py-3 text-sm font-black text-white">
          회원가입
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <Link href="/student/english" className="text-xs font-black text-slate-500 hover:text-brand-700">← 편입영어</Link>
          <h1 className="mt-1 text-2xl font-black text-ink">📌 틀린 단어</h1>
        </div>
        <Link href="/student/english/words" className="rounded-md bg-brand-600 px-3 py-2 text-xs font-black text-white hover:bg-brand-700">
          단어 테스트
        </Link>
      </div>

      {error ? (
        <div className="mb-4 rounded-md bg-coral-50 px-4 py-3 text-sm font-bold text-coral-600">{error}</div>
      ) : null}

      {!items ? (
        <p className="py-16 text-center text-sm text-slate-400">불러오는 중...</p>
      ) : items.length === 0 ? (
        <section className="rounded-2xl border border-line bg-white p-10 text-center shadow-soft">
          <div className="text-4xl">🎉</div>
          <p className="mt-2 text-sm font-bold text-slate-600">틀린 단어가 없어요!</p>
          <Link href="/student/english/words" className="mt-5 inline-block rounded-md bg-brand-600 px-5 py-3 text-sm font-black text-white hover:bg-brand-700">
            단어 테스트 하러 가기
          </Link>
        </section>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.wordId} className="flex items-start justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3 shadow-soft">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-ink">{it.word}</span>
                  {it.wrongCount > 1 ? (
                    <span className="rounded-full bg-coral-50 px-2 py-0.5 text-[10px] font-black text-coral-600">{it.wrongCount}회 틀림</span>
                  ) : null}
                </div>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-600">{it.meaning}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(it.wordId)}
                disabled={removing === it.wordId}
                className="shrink-0 rounded-md border border-line px-3 py-1.5 text-xs font-black text-slate-500 hover:border-mint-500 hover:text-mint-600 disabled:opacity-50"
              >
                {removing === it.wordId ? "..." : "외웠어요"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
