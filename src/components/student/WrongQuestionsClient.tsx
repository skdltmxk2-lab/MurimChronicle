"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { canUseTier, tierLockMessage } from "@/lib/auth/tierGuard";
import { adminFetch } from "@/lib/api/adminFetch";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import type { Difficulty, ProblemOption } from "@/types/exam";

type WrongCardItem = {
  problemId: string;
  attemptId: string;
  examId: string;
  examTitle: string;
  submittedAt: string;
  selectedOptionId: string | null;
  subject: string;
  unit: string;
  concept: string;
  difficulty: Difficulty;
  question: string;
  contentType: "latex" | "image" | "mixed" | null;
  questionImage: string | null;
  options: ProblemOption[];
  correctOptionId: string;
  explanation: string;
  explanationContentType: "latex" | "image" | "mixed" | null;
  explanationImage: string | null;
};

function formatRelativeKor(iso: string): string {
  const diff = Date.now() - Date.parse(iso);
  const days = Math.floor(diff / 86400_000);
  if (days <= 0) return "오늘";
  if (days === 1) return "어제";
  return `${days}일 전`;
}

export function WrongQuestionsClient() {
  const { user, authChecked } = useAuth();
  const [items, setItems] = useState<WrongCardItem[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const allowed = canUseTier(user, "pro");

  useEffect(() => {
    if (!authChecked) return;
    if (!user) return;
    if (!allowed) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    adminFetch("/api/student/recent-wrong")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (!json.ok) {
          setError(json.message ?? "불러오는 중 오류가 발생했습니다.");
          setItems([]);
          return;
        }
        setItems(json.items as WrongCardItem[]);
      })
      .catch(() => {
        if (cancelled) return;
        setError("불러오는 중 오류가 발생했습니다.");
        setItems([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authChecked, user, allowed]);

  function toggle(problemId: string) {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(problemId)) next.delete(problemId);
      else next.add(problemId);
      return next;
    });
  }

  if (!authChecked) return null;

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <section className="rounded-2xl border border-line bg-white p-10 text-center shadow-soft">
          <div className="mb-4 text-5xl">🔒</div>
          <h1 className="text-2xl font-black text-ink">로그인이 필요합니다</h1>
          <Link
            href="/student/exams"
            className="mt-6 inline-block rounded-md bg-brand-600 px-6 py-3 text-sm font-black text-white hover:bg-brand-700"
          >
            돌아가기
          </Link>
        </section>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <section className="rounded-2xl border border-line bg-white p-10 text-center shadow-soft">
          <div className="mb-4 text-5xl">🔒</div>
          <h1 className="text-2xl font-black text-ink">{tierLockMessage("pro")}</h1>
          <p className="mt-3 text-sm text-slate-600">
            최근 7일 동안 틀린 문제 다시 보기는 Pro 이상 등급부터 제공됩니다.
          </p>
          <Link
            href="/student/exams"
            className="mt-6 inline-block rounded-md bg-brand-600 px-6 py-3 text-sm font-black text-white hover:bg-brand-700"
          >
            시험 목록으로
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <section className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">
          Pro · 복습
        </p>
        <h1 className="mt-1 text-3xl font-black text-ink">최근 틀린 문제</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          최근 <b className="text-ink">7일</b> 동안 응시한 시험에서 틀린 문제를 모아둡니다.
          같은 문제를 여러 번 틀렸다면 가장 최근 시도만 보여드립니다. 7일이 지나면 목록에서
          자동으로 빠집니다.
        </p>
      </section>

      {error ? (
        <div className="mb-4 rounded-md bg-coral-50 px-4 py-3 text-sm font-bold text-coral-600">
          {error}
        </div>
      ) : null}

      {loading && items === null ? (
        <p className="py-12 text-center text-sm text-slate-400">불러오는 중...</p>
      ) : items && items.length === 0 ? (
        <section className="rounded-2xl border border-line bg-white p-10 text-center shadow-soft">
          <div className="mb-4 text-5xl">🎉</div>
          <h2 className="text-xl font-black text-ink">최근 7일 동안 틀린 문제가 없네요</h2>
          <p className="mt-3 text-sm text-slate-600">
            이 페이지는 시험을 풀고 채점한 뒤에 누적됩니다.
            <br />
            지금까지 풀어 보신 시험 중 오답이 있었다면 7일이 지나며 사라졌을 수 있어요.
          </p>
          <Link
            href="/student/exams"
            className="mt-6 inline-block rounded-md bg-brand-600 px-6 py-3 text-sm font-black text-white hover:bg-brand-700"
          >
            시험 응시하러 가기
          </Link>
        </section>
      ) : items ? (
        <ul className="space-y-4">
          {items.map((it, i) => {
            const open = openItems.has(it.problemId);
            const selected = it.options.find((o) => o.id === it.selectedOptionId);
            const correct = it.options.find((o) => o.id === it.correctOptionId);
            return (
              <li
                key={it.problemId}
                className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft"
              >
                <div className="flex flex-wrap items-center gap-2 border-b border-line bg-slate-50 px-5 py-3 text-xs">
                  <span className="rounded-full bg-white px-2.5 py-1 font-black text-slate-600 ring-1 ring-line">
                    {i + 1}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 font-bold text-slate-600 ring-1 ring-line">
                    {it.subject}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 font-bold text-slate-600 ring-1 ring-line">
                    {it.unit}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 font-bold text-slate-600 ring-1 ring-line">
                    {it.concept}
                  </span>
                  <DifficultyBadge difficulty={it.difficulty} />
                  <span className="ml-auto text-slate-500">
                    {formatRelativeKor(it.submittedAt)} ·{" "}
                    <span className="text-slate-400">{it.examTitle || it.examId}</span>
                  </span>
                </div>

                <div className="px-5 py-5">
                  <ContentRenderer
                    contentType={it.contentType ?? "latex"}
                    text={it.question}
                    image={it.questionImage ?? undefined}
                    imageAlt={`${i + 1}번 문제`}
                    className="text-base font-semibold leading-8 text-ink"
                  />

                  <div className="mt-5 space-y-2">
                    {it.options.map((opt) => {
                      const isSelected = opt.id === it.selectedOptionId;
                      const isCorrect = opt.id === it.correctOptionId;
                      let ring = "border-line bg-white";
                      if (open && isCorrect) ring = "border-mint-500 bg-mint-50 ring-2 ring-mint-500/20";
                      else if (open && isSelected && !isCorrect)
                        ring = "border-coral-300 bg-coral-50 ring-2 ring-coral-500/20";
                      else if (isSelected) ring = "border-slate-400 bg-slate-50";
                      return (
                        <div
                          key={opt.id}
                          className={`flex items-start gap-3 rounded-md border px-4 py-3 ${ring}`}
                        >
                          <span
                            className={`grid size-7 shrink-0 place-items-center rounded-md text-sm font-black ${
                              open && isCorrect
                                ? "bg-mint-500 text-white"
                                : isSelected
                                  ? "bg-slate-200 text-slate-700"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {opt.label}
                          </span>
                          <ContentRenderer
                            contentType={opt.contentType ?? "latex"}
                            text={opt.text}
                            image={opt.image}
                            imageAlt={`보기 ${opt.label}`}
                            className="flex-1 text-sm leading-7 text-ink"
                          />
                          {open && isCorrect ? (
                            <span className="ml-2 shrink-0 rounded-full bg-mint-500 px-2 py-0.5 text-[10px] font-black text-white">
                              정답
                            </span>
                          ) : null}
                          {open && isSelected && !isCorrect ? (
                            <span className="ml-2 shrink-0 rounded-full bg-coral-500 px-2 py-0.5 text-[10px] font-black text-white">
                              내 답
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  {!open ? (
                    <p className="mt-3 text-xs text-slate-500">
                      내가 고른 답:{" "}
                      <b className="text-ink">{selected?.label ?? "—"}</b> · 정답은
                      아래 버튼을 눌러 확인하세요.
                    </p>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => toggle(it.problemId)}
                    className="mt-4 w-full rounded-md border border-line bg-white py-2.5 text-sm font-black text-slate-700 hover:border-brand-600 hover:text-brand-700"
                  >
                    {open ? "정답·풀이 숨기기" : "정답·풀이 보기"}
                  </button>

                  {open ? (
                    <div className="mt-5 rounded-xl border border-brand-200 bg-brand-50 px-5 py-4">
                      <p className="text-xs font-black uppercase tracking-[0.15em] text-brand-600">
                        풀이
                      </p>
                      <div className="mt-2 text-sm leading-7 text-ink">
                        <ContentRenderer
                          contentType={it.explanationContentType ?? "latex"}
                          text={it.explanation}
                          image={it.explanationImage ?? undefined}
                          imageAlt="풀이"
                        />
                      </div>
                      <p className="mt-3 text-xs text-slate-500">
                        정답: <b className="text-ink">{correct?.label ?? it.correctOptionId}</b>
                      </p>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </main>
  );
}
