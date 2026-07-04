"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { canUseTier } from "@/lib/auth/tierGuard";
import { AdSlot } from "@/components/ads/AdSlot";
import { adminFetch } from "@/lib/api/adminFetch";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { printStudentPdf } from "@/lib/print/studentPrint";
import { WrongQuestionsPrintSheet, type WrongPrintItem } from "@/components/student/WrongQuestionsPrintSheet";

type WrongCardItem = WrongPrintItem;

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [printingSelection, setPrintingSelection] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [retentionDays, setRetentionDays] = useState(7);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [examFilter, setExamFilter] = useState("all");

  // PRO(및 관리자)는 30일, 무료는 7일치 오답을 복습할 수 있다.
  const isPro = canUseTier(user, "pro");
  const itemList = useMemo(() => items ?? [], [items]);
  const filteredItems = useMemo(
    () =>
      itemList.filter((item) => {
        if (subjectFilter !== "all" && item.subject !== subjectFilter) return false;
        if (difficultyFilter !== "all" && item.difficulty !== difficultyFilter) return false;
        if (examFilter !== "all" && (item.examTitle || item.examId) !== examFilter) return false;
        return true;
      }),
    [difficultyFilter, examFilter, itemList, subjectFilter]
  );
  const subjectOptions = useMemo(
    () => Array.from(new Set(itemList.map((item) => item.subject).filter(Boolean))).sort(),
    [itemList]
  );
  const difficultyOptions = useMemo(
    () => Array.from(new Set(itemList.map((item) => item.difficulty).filter(Boolean))).sort(),
    [itemList]
  );
  const examOptions = useMemo(
    () => Array.from(new Set(itemList.map((item) => item.examTitle || item.examId).filter(Boolean))).sort(),
    [itemList]
  );
  const printableItems = useMemo(
    () => itemList.filter((item) => selectedIds.has(item.problemId)),
    [itemList, selectedIds]
  );
  const selectedVisibleCount = useMemo(
    () => filteredItems.filter((item) => selectedIds.has(item.problemId)).length,
    [filteredItems, selectedIds]
  );

  useEffect(() => {
    if (!authChecked) return;
    if (!user) return;
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
          setSelectedIds(new Set());
          return;
        }
        if (typeof json.retentionDays === "number") setRetentionDays(json.retentionDays);
        const nextItems = json.items as WrongCardItem[];
        setItems(nextItems);
        setSelectedIds(new Set(nextItems.map((item) => item.problemId)));
      })
      .catch(() => {
        if (cancelled) return;
        setError("불러오는 중 오류가 발생했습니다.");
        setItems([]);
        setSelectedIds(new Set());
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authChecked, user]);

  function toggle(problemId: string) {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(problemId)) next.delete(problemId);
      else next.add(problemId);
      return next;
    });
  }

  function toggleSelected(problemId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(problemId)) next.delete(problemId);
      else next.add(problemId);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(filteredItems.map((item) => item.problemId)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function selectRecommended() {
    const recommended = filteredItems.slice(0, Math.min(5, filteredItems.length));
    if (recommended.length === 0) return;
    setSelectedIds(new Set(recommended.map((item) => item.problemId)));
    setOpenItems(new Set(recommended.map((item) => item.problemId)));
  }

  function printSelected() {
    if (selectedIds.size === 0) {
      window.alert("PDF로 저장할 오답을 선택해 주세요.");
      return;
    }
    setPrintingSelection(true);
    window.setTimeout(() => {
      printStudentPdf({ afterPrint: () => setPrintingSelection(false) });
    }, 0);
  }

  async function completeProblems(problemIds: string[]) {
    const uniqueIds = Array.from(new Set(problemIds)).filter(Boolean);
    if (uniqueIds.length === 0 || completing) return;
    const ok = window.confirm(
      uniqueIds.length === 1
        ? "이 문제를 학습 완료로 처리하고 오답 목록에서 지울까요?"
        : `선택한 ${uniqueIds.length}개 문제를 학습 완료로 처리하고 오답 목록에서 지울까요?`
    );
    if (!ok) return;

    setCompleting(true);
    setError("");
    try {
      const res = await adminFetch("/api/student/recent-wrong/complete", {
        method: "POST",
        body: JSON.stringify({ problemIds: uniqueIds }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !json.ok) {
        setError(json.message ?? "학습 완료 처리 중 오류가 발생했습니다.");
        return;
      }
      const completed = new Set(uniqueIds);
      setItems((current) => current?.filter((item) => !completed.has(item.problemId)) ?? []);
      setSelectedIds((current) => {
        const next = new Set(current);
        completed.forEach((id) => next.delete(id));
        return next;
      });
      setOpenItems((current) => {
        const next = new Set(current);
        completed.forEach((id) => next.delete(id));
        return next;
      });
    } catch {
      setError("학습 완료 처리 중 오류가 발생했습니다.");
    } finally {
      setCompleting(false);
    }
  }

  if (!authChecked) return null;

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <section className="rounded-lg border border-line bg-white p-10 text-center shadow-soft">
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

  return (
    <>
    <main className="student-screen-only student-print-root mx-auto max-w-4xl px-4 py-8 sm:px-5">
      <section className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">
          복습
        </p>
        <h1 className="mt-1 text-3xl font-black text-ink">최근 틀린 문제</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          최근 <b className="text-ink">{retentionDays}일</b> 동안 응시한 시험에서 틀린 문제를 모아둡니다.
          같은 문제를 여러 번 틀렸다면 가장 최근 시도만 보여드립니다. {retentionDays}일이 지나면 목록에서
          자동으로 빠집니다.
        </p>
      </section>

      {!isPro ? (
        <section className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-mint-300 bg-mint-50 px-5 py-4">
          <p className="text-sm font-bold text-mint-800">
            ⏳ 무료는 최근 <b>7일</b>치만 복습할 수 있어요. PRO로 업그레이드하면 <b>30일</b>치까지 모아볼 수 있습니다.
          </p>
          <Link
            href="/student/pricing"
            className="shrink-0 rounded-lg bg-mint-600 px-4 py-2 text-xs font-black text-white hover:bg-mint-700"
          >
            PRO 보기 →
          </Link>
        </section>
      ) : null}

      <AdSlot slot="wrong-questions-top" className="student-print-hide mb-6" />

      {error ? (
        <div className="mb-4 rounded-md bg-coral-50 px-4 py-3 text-sm font-bold text-coral-600">
          {error}
        </div>
      ) : null}

      {items && items.length > 0 ? (
        <section className="student-print-hide mb-4 rounded-lg border border-line bg-white p-4 shadow-soft">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="block">
              <span className="text-xs font-black text-slate-500">과목</span>
              <select
                value={subjectFilter}
                onChange={(event) => setSubjectFilter(event.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-sm font-bold text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10"
              >
                <option value="all">전체 과목</option>
                {subjectOptions.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-black text-slate-500">난이도</span>
              <select
                value={difficultyFilter}
                onChange={(event) => setDifficultyFilter(event.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-sm font-bold text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10"
              >
                <option value="all">전체 난이도</option>
                {difficultyOptions.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-black text-slate-500">시험</span>
              <select
                value={examFilter}
                onChange={(event) => setExamFilter(event.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-sm font-bold text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10"
              >
                <option value="all">전체 시험</option>
                {examOptions.map((examName) => (
                  <option key={examName} value={examName}>
                    {examName}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black text-ink">오답 복습</p>
              <p className="mt-1 text-xs font-bold text-slate-500">
                현재 목록 {filteredItems.length}개 · 선택 {selectedIds.size}개
                {selectedVisibleCount !== selectedIds.size ? ` · 현재 목록 선택 ${selectedVisibleCount}개` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <button
                type="button"
                onClick={selectRecommended}
                disabled={filteredItems.length === 0}
                className="h-9 rounded-md bg-brand-600 px-3 text-xs font-black text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                오늘 5개 추천
              </button>
              <button
                type="button"
                onClick={printSelected}
                disabled={selectedIds.size === 0}
                className="h-9 rounded-md bg-ink px-3 text-xs font-black text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                PDF 저장
              </button>
              <button
                type="button"
                onClick={() => void completeProblems(Array.from(selectedIds))}
                disabled={selectedIds.size === 0 || completing}
                className="h-9 rounded-md border border-mint-300 bg-mint-50 px-3 text-xs font-black text-mint-700 hover:bg-mint-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                학습 완료
              </button>
              <button
                type="button"
                onClick={selectAll}
                className="h-9 rounded-md border border-line bg-white px-3 text-xs font-black text-slate-600 hover:border-brand-600 hover:text-brand-700"
              >
                현재 목록 선택
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="h-9 rounded-md border border-line bg-white px-3 text-xs font-black text-slate-500 hover:border-brand-600 hover:text-brand-700"
              >
                해제
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {loading && items === null ? (
        <p className="py-12 text-center text-sm text-slate-400">불러오는 중...</p>
      ) : items && items.length === 0 ? (
        <section className="rounded-lg border border-line bg-white p-10 text-center shadow-soft">
          <div className="mb-4 text-5xl">🎉</div>
          <h2 className="text-xl font-black text-ink">최근 {retentionDays}일 동안 틀린 문제가 없네요</h2>
          <p className="mt-3 text-sm text-slate-600">
            이 페이지는 시험을 풀고 채점한 뒤에 누적됩니다.
            <br />
            지금까지 풀어 보신 시험 중 오답이 있었다면 {retentionDays}일이 지나며 사라졌을 수 있어요.
          </p>
          <Link
            href="/student/exams"
            className="mt-6 inline-block rounded-md bg-brand-600 px-6 py-3 text-sm font-black text-white hover:bg-brand-700"
          >
            시험 응시하러 가기
          </Link>
        </section>
      ) : items && filteredItems.length === 0 ? (
        <section className="rounded-lg border border-line bg-white p-10 text-center shadow-soft">
          <h2 className="text-xl font-black text-ink">현재 필터에 맞는 오답이 없습니다</h2>
          <p className="mt-3 text-sm text-slate-600">
            과목, 난이도, 시험 필터를 바꾸면 다른 오답을 볼 수 있습니다.
          </p>
        </section>
      ) : items ? (
        <ul className="space-y-4">
          {filteredItems.map((it, i) => {
            const open = openItems.has(it.problemId);
            const selected = it.options.find((o) => o.id === it.selectedOptionId);
            const correct = it.options.find((o) => o.id === it.correctOptionId);
            const selectedLabel = it.questionType === "subjective"
              ? it.userAnswerText?.trim() || "미응답"
              : selected?.label ?? "—";
            const correctLabel = it.questionType === "subjective"
              ? it.answerText?.trim() || it.correctOptionId || "-"
              : correct?.label ?? it.correctOptionId;
            return (
              <li
                key={it.problemId}
                data-print-card="true"
                className={`student-print-card overflow-hidden rounded-lg border border-line bg-white shadow-soft ${
                  printingSelection && !selectedIds.has(it.problemId) ? "student-print-excluded" : ""
                }`}
              >
                <div className="border-b border-line bg-white px-5 py-4 text-xs">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="student-print-hide flex items-center gap-2 rounded-md bg-slate-50 px-2.5 py-1 font-black text-slate-600 ring-1 ring-line">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(it.problemId)}
                            onChange={() => toggleSelected(it.problemId)}
                            className="size-4 accent-brand-600"
                          />
                          선택
                        </label>
                        <span className="grid size-7 place-items-center rounded-md bg-brand-600 font-black text-white">
                          {i + 1}
                        </span>
                        <DifficultyBadge difficulty={it.difficulty} />
                        {it.wrongCount && it.wrongCount > 1 ? (
                          <span className="rounded-md bg-coral-50 px-2.5 py-1 font-black text-coral-600 ring-1 ring-coral-200">
                            반복 {it.wrongCount}회
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 truncate text-sm font-black text-ink">
                        {it.subject} · {it.unit}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-slate-500">
                        {it.concept} · {formatRelativeKor(it.submittedAt)} ·{" "}
                        <span className="text-slate-400">{it.examTitle || it.examId}</span>
                      </p>
                    </div>
                    <div className="student-print-hide flex shrink-0 gap-2">
                      <Link
                        href={`/student/exams/${it.examId}`}
                        className="rounded-md border border-line bg-white px-3 py-2 font-black text-slate-600 hover:border-brand-600 hover:text-brand-700"
                      >
                        다시 풀기
                      </Link>
                      <button
                        type="button"
                        onClick={() => void completeProblems([it.problemId])}
                        disabled={completing}
                        className="rounded-md border border-mint-300 bg-mint-50 px-3 py-2 font-black text-mint-700 hover:bg-mint-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        완료
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-5 sm:px-6">
                  <ContentRenderer
                    contentType={it.contentType ?? "latex"}
                    text={it.question}
                    image={it.questionImage ?? undefined}
                    imageAlt={`${i + 1}번 문제`}
                    className="text-base font-semibold leading-8 text-ink sm:text-[17px]"
                  />

                  {it.options.length > 0 ? (
                    <div className="mt-5 space-y-2">
                      {it.options.map((opt) => {
                        const isSelected = opt.id === it.selectedOptionId;
                        const isCorrect = opt.id === it.correctOptionId;
                        let ring = "border-line bg-white";
                        if (open && isCorrect) ring = "border-mint-500 bg-mint-50 ring-2 ring-mint-500/15";
                        else if (open && isSelected && !isCorrect)
                          ring = "border-coral-300 bg-coral-50 ring-2 ring-coral-500/15";
                        else if (isSelected) ring = "border-slate-400 bg-slate-50";
                        return (
                          <div
                            key={opt.id}
                            className={`flex items-start gap-3 rounded-md border px-4 py-3.5 ${ring}`}
                          >
                            <span
                              className={`grid size-7 shrink-0 place-items-center rounded-full text-sm font-black ${
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
                              className="flex-1 text-[15px] leading-7 text-ink"
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
                  ) : (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-md border border-line bg-slate-50 px-4 py-3">
                        <p className="text-xs font-black text-slate-500">내 답안</p>
                        <p className="mt-2 text-sm font-bold text-ink">{selectedLabel}</p>
                      </div>
                      <div className="rounded-md border border-mint-500 bg-mint-50 px-4 py-3">
                        <p className="text-xs font-black text-mint-700">정답</p>
                        <p className="mt-2 text-sm font-bold text-ink">{correctLabel}</p>
                      </div>
                    </div>
                  )}

                  {!open ? (
                    <p className="mt-3 text-xs text-slate-500">
                      내가 고른 답:{" "}
                      <b className="text-ink">{selectedLabel}</b> · 정답은
                      아래 버튼을 눌러 확인하세요.
                    </p>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => toggle(it.problemId)}
                    className="student-print-hide mt-4 w-full rounded-md border border-line bg-white py-3 text-sm font-black text-slate-700 hover:border-brand-600 hover:text-brand-700"
                  >
                    {open ? "정답·풀이 숨기기" : "정답·풀이 보기"}
                  </button>

                  {open ? (
                    <div data-print-card="true" className="student-screen-only mt-5 rounded-lg border border-brand-200 bg-brand-50 px-5 py-4">
                      <p className="text-xs font-black text-brand-600">
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
                        정답: <b className="text-ink">{correctLabel}</b>
                      </p>
                    </div>
                  ) : null}

                  <div data-print-card="true" className="student-print-only mt-5 rounded-lg border border-brand-200 bg-brand-50 px-5 py-4">
                    <p className="text-xs font-black text-brand-600">
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
                      정답: <b className="text-ink">{correctLabel}</b>
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </main>
    <WrongQuestionsPrintSheet items={printableItems} />
    </>
  );
}
