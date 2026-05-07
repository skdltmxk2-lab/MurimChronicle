"use client";

import { useEffect, useMemo, useState } from "react";
import { authRepo, isAdminUser } from "@/lib/auth/mockAuth";
import { questionRepo } from "@/lib/questions/questionRepository";
import { ADMIN_PASSWORD } from "@/lib/auth/constants";
import { SUBJECT_NAMES, SUBJECT_UNITS } from "@/lib/taxonomy";
import type { QuestionRecord } from "@/types/question";
import { ContentRenderer } from "@/components/content/ContentRenderer";

function getTodayParam(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const ADMIN_HEADERS = { "x-admin-password": ADMIN_PASSWORD };

export function AdminDailyClient() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allQuestions, setAllQuestions] = useState<QuestionRecord[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"today" | "pool" | "add">("today");

  // 오늘 데일리 편집 상태
  const today = getTodayParam();
  const [todayIds, setTodayIds] = useState<string[]>([]);
  const [todayLoading, setTodayLoading] = useState(true);
  const [todayMode, setTodayMode] = useState<"auto" | "manual">("auto");
  const [randomSubject, setRandomSubject] = useState<string>("");
  const [randomUnits, setRandomUnits] = useState<string[]>([]);
  const [manualSubject, setManualSubject] = useState<string>("");
  const [manualUnit, setManualUnit] = useState<string>("");
  const [manualSelected, setManualSelected] = useState<Set<string>>(new Set());
  const [manualOpen, setManualOpen] = useState(false);
  const [actionMsg, setActionMsg] = useState<string>("");

  useEffect(() => {
    authRepo.getCurrentUser().then((user) => {
      const admin = isAdminUser(user);
      setIsAdmin(admin);
      setAuthChecked(true);
      if (admin) questionRepo.list().then(setAllQuestions);
    });
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    void loadAssignment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  async function loadAssignment() {
    setTodayLoading(true);
    try {
      const res = await fetch(`/api/admin/daily-assignment?date=${today}`, { headers: ADMIN_HEADERS });
      const json = (await res.json()) as { ok: boolean; assignment?: { questionIds: string[] } | null };
      if (json.ok && json.assignment?.questionIds) {
        setTodayIds(json.assignment.questionIds);
        setTodayMode("manual");
      } else {
        setTodayIds([]);
        setTodayMode("auto");
      }
    } catch {
      setTodayIds([]);
      setTodayMode("auto");
    } finally {
      setTodayLoading(false);
    }
  }

  if (!authChecked) return null;
  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16 text-center">
        <div className="text-4xl">🔒</div>
        <h1 className="mt-4 text-xl font-black text-ink">관리자 전용 페이지입니다</h1>
      </main>
    );
  }

  const dailyQuestions = allQuestions.filter((q) => q.tags.includes("daily"));
  const dailyById = useMemo(() => new Map(dailyQuestions.map((q) => [q.id, q])), [dailyQuestions]);
  const nonDailyQuestions = allQuestions
    .filter((q) => !q.tags.includes("daily"))
    .filter((q) =>
      search.trim() === "" ||
      q.question.includes(search) ||
      q.unit.includes(search) ||
      q.subject.includes(search)
    );

  // 자동 모드일 때 미리보기 (assignment 없으면 라운드 로빈 추정 — 단순히 ID 정렬 후 5개)
  const autoPreview = useMemo(() => {
    if (dailyQuestions.length === 0) return [];
    const sorted = [...dailyQuestions].sort((a, b) => a.id.localeCompare(b.id));
    const dayIndex = Math.floor(Date.now() / 86400000);
    const n = Math.min(5, sorted.length);
    const start = (dayIndex * n) % sorted.length;
    return [...sorted.slice(start), ...sorted.slice(0, start)].slice(0, n);
  }, [dailyQuestions]);

  const todayPreview = todayMode === "manual" && todayIds.length > 0
    ? todayIds.map((id) => dailyById.get(id)).filter((q): q is QuestionRecord => Boolean(q))
    : autoPreview;

  // 수동 선택 모드 - 필터된 풀
  const manualPool = useMemo(() => {
    let pool = dailyQuestions;
    if (manualSubject) pool = pool.filter((q) => q.subject === manualSubject);
    if (manualUnit) pool = pool.filter((q) => q.unit === manualUnit);
    return pool;
  }, [dailyQuestions, manualSubject, manualUnit]);

  const manualUnitOptions = manualSubject
    ? (SUBJECT_UNITS[manualSubject as keyof typeof SUBJECT_UNITS] ?? [])
    : [];
  const randomUnitOptions = randomSubject
    ? (SUBJECT_UNITS[randomSubject as keyof typeof SUBJECT_UNITS] ?? [])
    : [];

  async function addToDaily(q: QuestionRecord) {
    setSaving(q.id);
    const draft = {
      subject: q.subject,
      unit: q.unit,
      concept: q.concept,
      difficulty: q.difficulty,
      sourceType: q.sourceType,
      question: q.question,
      contentType: q.contentType,
      questionImage: q.questionImage,
      options: q.options,
      correctOptionId: q.correctOptionId,
      explanation: q.explanation,
      explanationContentType: q.explanationContentType,
      explanationImage: q.explanationImage,
      tags: [...q.tags.filter((t) => t !== "daily"), "daily"],
    };
    await questionRepo.update(q.id, draft);
    setAllQuestions((prev) =>
      prev.map((item) => (item.id === q.id ? { ...item, tags: draft.tags } : item))
    );
    setSaving(null);
  }

  async function removeFromDaily(q: QuestionRecord) {
    setSaving(q.id);
    const draft = {
      subject: q.subject,
      unit: q.unit,
      concept: q.concept,
      difficulty: q.difficulty,
      sourceType: q.sourceType,
      question: q.question,
      contentType: q.contentType,
      questionImage: q.questionImage,
      options: q.options,
      correctOptionId: q.correctOptionId,
      explanation: q.explanation,
      explanationContentType: q.explanationContentType,
      explanationImage: q.explanationImage,
      tags: q.tags.filter((t) => t !== "daily"),
    };
    await questionRepo.update(q.id, draft);
    setAllQuestions((prev) =>
      prev.map((item) => (item.id === q.id ? { ...item, tags: draft.tags } : item))
    );
    setSaving(null);
  }

  async function randomize() {
    setActionMsg("");
    setTodayLoading(true);
    try {
      const res = await fetch("/api/admin/daily-randomize", {
        method: "POST",
        headers: { ...ADMIN_HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today,
          count: 5,
          subject: randomSubject || undefined,
          units: randomUnits.length > 0 ? randomUnits : undefined,
        }),
      });
      const json = (await res.json()) as { ok: boolean; questionIds?: string[]; message?: string; cycleStats?: { unusedCount: number; minUseCount: number } };
      if (!json.ok || !json.questionIds) {
        setActionMsg(json.message ?? "랜덤 재구성 실패");
        return;
      }
      setTodayIds(json.questionIds);
      setTodayMode("manual");
      const stats = json.cycleStats;
      setActionMsg(stats ? `재구성 완료 (안 쓴 문제 ${stats.unusedCount}개 / 최소 사용 횟수 ${stats.minUseCount}회)` : "재구성 완료");
    } catch {
      setActionMsg("랜덤 재구성 중 오류");
    } finally {
      setTodayLoading(false);
    }
  }

  async function saveManual() {
    if (manualSelected.size === 0) {
      setActionMsg("최소 1문항 이상 선택해주세요.");
      return;
    }
    setActionMsg("");
    setTodayLoading(true);
    try {
      const res = await fetch("/api/admin/daily-assignment", {
        method: "POST",
        headers: { ...ADMIN_HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify({ date: today, questionIds: [...manualSelected] }),
      });
      const json = (await res.json()) as { ok: boolean; questionIds?: string[]; message?: string };
      if (!json.ok || !json.questionIds) {
        setActionMsg(json.message ?? "저장 실패");
        return;
      }
      setTodayIds(json.questionIds);
      setTodayMode("manual");
      setManualSelected(new Set());
      setManualOpen(false);
      setActionMsg("오늘의 데일리가 저장되었습니다.");
    } catch {
      setActionMsg("저장 중 오류");
    } finally {
      setTodayLoading(false);
    }
  }

  async function clearAssignment() {
    if (!confirm("오늘의 지정 데일리를 삭제하고 자동 모드로 돌아갈까요?")) return;
    setActionMsg("");
    setTodayLoading(true);
    try {
      const res = await fetch(`/api/admin/daily-assignment?date=${today}`, {
        method: "DELETE",
        headers: ADMIN_HEADERS,
      });
      const json = (await res.json()) as { ok: boolean; message?: string };
      if (!json.ok) {
        setActionMsg(json.message ?? "초기화 실패");
        return;
      }
      setTodayIds([]);
      setTodayMode("auto");
      setActionMsg("자동 모드로 전환되었습니다.");
    } catch {
      setActionMsg("초기화 중 오류");
    } finally {
      setTodayLoading(false);
    }
  }

  async function replaceOne(idx: number) {
    // 같은 단원 내에서 다른 문제로 교체 (가장 적게 쓴 것 우선)
    const target = todayPreview[idx];
    if (!target) return;
    const candidates = dailyQuestions.filter(
      (q) => q.id !== target.id && q.subject === target.subject && q.unit === target.unit && !todayIds.includes(q.id)
    );
    if (candidates.length === 0) {
      setActionMsg(`${target.unit} 단원에 교체 가능한 다른 문제가 없습니다.`);
      return;
    }
    const next = candidates[Math.floor(Math.random() * candidates.length)];
    const newIds = [...(todayIds.length > 0 ? todayIds : todayPreview.map((q) => q.id))];
    newIds[idx] = next.id;

    setTodayLoading(true);
    try {
      const res = await fetch("/api/admin/daily-assignment", {
        method: "POST",
        headers: { ...ADMIN_HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify({ date: today, questionIds: newIds }),
      });
      const json = (await res.json()) as { ok: boolean; message?: string };
      if (!json.ok) {
        setActionMsg(json.message ?? "교체 실패");
        return;
      }
      setTodayIds(newIds);
      setTodayMode("manual");
      setActionMsg(`${idx + 1}번 문제를 같은 단원의 다른 문제로 교체했습니다.`);
    } catch {
      setActionMsg("교체 중 오류");
    } finally {
      setTodayLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      {/* 헤더 */}
      <section className="mb-6 rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">Admin</p>
        <h1 className="mt-1 text-3xl font-black text-ink">데일리 테스트 관리</h1>
        <p className="mt-2 text-sm text-slate-600">
          오늘 데일리 5문항을 직접 편집하거나, 데일리 풀 자체를 관리할 수 있습니다.
        </p>
      </section>

      {/* 탭 */}
      <div className="mb-4 flex gap-2 border-b border-line">
        <button
          type="button"
          onClick={() => setTab("today")}
          className={`px-4 py-3 text-sm font-black transition ${
            tab === "today" ? "border-b-2 border-brand-600 text-brand-600" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          오늘의 데일리 편집
        </button>
        <button
          type="button"
          onClick={() => setTab("pool")}
          className={`px-4 py-3 text-sm font-black transition ${
            tab === "pool" ? "border-b-2 border-brand-600 text-brand-600" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          데일리 풀 ({dailyQuestions.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("add")}
          className={`px-4 py-3 text-sm font-black transition ${
            tab === "add" ? "border-b-2 border-brand-600 text-brand-600" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          풀에 문제 추가
        </button>
      </div>

      {/* 오늘 편집 탭 */}
      {tab === "today" && (
        <>
          <section className="mb-5 rounded-lg border border-brand-200 bg-brand-50 p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-brand-500">Today</p>
                <h2 className="mt-0.5 text-base font-black text-ink">
                  {today} 오늘 출제 문항 ({todayPreview.length}/5)
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  {todayMode === "manual"
                    ? "관리자가 직접 지정한 문항입니다."
                    : "자동 모드 (라운드 로빈 또는 날짜 시드)"}
                </p>
              </div>
              <span className="text-3xl">📅</span>
            </div>

            {todayLoading ? (
              <p className="mt-3 text-sm text-slate-500">불러오는 중...</p>
            ) : todayPreview.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">데일리 풀이 비어있습니다. "데일리 풀" 탭에서 추가해주세요.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {todayPreview.map((q, i) => (
                  <div key={q.id} className="flex items-start gap-2 rounded-md bg-white px-3 py-2 text-sm">
                    <span className="shrink-0 font-black text-brand-600">{i + 1}.</span>
                    <span className="flex-1 line-clamp-1 text-slate-700">
                      {q.question.replace(/\$[^$]+\$/g, "[수식]")}
                    </span>
                    <span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700">
                      {q.subject}/{q.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => replaceOne(i)}
                      disabled={todayLoading}
                      className="shrink-0 rounded-md border border-line bg-white px-2 py-0.5 text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      교체
                    </button>
                  </div>
                ))}
              </div>
            )}

            {actionMsg ? (
              <p className="mt-3 rounded-md bg-white px-3 py-2 text-xs font-bold text-brand-700">{actionMsg}</p>
            ) : null}
          </section>

          {/* 랜덤 재구성 */}
          <section className="mb-5 rounded-lg border border-line bg-white p-5 shadow-soft">
            <h3 className="text-base font-black text-ink">🎲 랜덤 재구성</h3>
            <p className="mt-1 text-xs text-slate-500">
              데일리 풀에서 5문항을 자동으로 뽑습니다. 한 번 출제된 문제는 모든 문제가 출제되기 전엔 다시 나오지 않습니다.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-black text-slate-600">과목 (선택)</span>
                <select
                  value={randomSubject}
                  onChange={(e) => {
                    setRandomSubject(e.target.value);
                    setRandomUnits([]);
                  }}
                  className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
                >
                  <option value="">전체 과목</option>
                  {SUBJECT_NAMES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-black text-slate-600">단원 (다중 선택, 선택 안 하면 전체)</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {randomUnitOptions.length === 0 ? (
                    <span className="text-xs text-slate-400">먼저 과목을 선택하세요</span>
                  ) : (
                    randomUnitOptions.map((u) => {
                      const active = randomUnits.includes(u);
                      return (
                        <button
                          key={u}
                          type="button"
                          onClick={() =>
                            setRandomUnits((prev) =>
                              prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]
                            )
                          }
                          className={`rounded-full px-3 py-1 text-xs font-black transition ${
                            active
                              ? "bg-brand-600 text-white"
                              : "border border-line bg-white text-slate-600 hover:border-brand-400"
                          }`}
                        >
                          {u}
                        </button>
                      );
                    })
                  )}
                </div>
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={randomize}
                disabled={todayLoading}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-black text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {todayLoading ? "처리 중..." : "🎲 랜덤 재구성"}
              </button>
              {todayMode === "manual" ? (
                <button
                  type="button"
                  onClick={clearAssignment}
                  disabled={todayLoading}
                  className="rounded-md border border-line px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  자동 모드로 복귀
                </button>
              ) : null}
            </div>
          </section>

          {/* 수동 선택 */}
          <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-ink">✏️ 직접 선택</h3>
                <p className="mt-1 text-xs text-slate-500">
                  과목/단원으로 필터링한 후 원하는 문제를 직접 골라 5문항을 구성합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManualOpen((v) => !v)}
                className="rounded-md border border-line px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"
              >
                {manualOpen ? "닫기" : "열기"}
              </button>
            </div>

            {manualOpen && (
              <div className="mt-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    value={manualSubject}
                    onChange={(e) => {
                      setManualSubject(e.target.value);
                      setManualUnit("");
                    }}
                    className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
                  >
                    <option value="">전체 과목</option>
                    {SUBJECT_NAMES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <select
                    value={manualUnit}
                    onChange={(e) => setManualUnit(e.target.value)}
                    disabled={!manualSubject}
                    className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600 disabled:bg-slate-50"
                  >
                    <option value="">전체 단원</option>
                    {manualUnitOptions.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <p className="text-xs font-black text-slate-600">
                  선택됨: {manualSelected.size}개 (1~20개까지 가능)
                </p>

                <div className="max-h-96 space-y-2 overflow-y-auto rounded-md border border-line p-2">
                  {manualPool.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-400">조건에 맞는 데일리 풀 문제가 없습니다.</p>
                  ) : (
                    manualPool.map((q) => {
                      const checked = manualSelected.has(q.id);
                      return (
                        <label
                          key={q.id}
                          className={`flex items-start gap-2 rounded-md p-2 text-sm cursor-pointer ${
                            checked ? "bg-brand-50" : "hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setManualSelected((prev) => {
                                const next = new Set(prev);
                                if (next.has(q.id)) next.delete(q.id);
                                else if (next.size < 20) next.add(q.id);
                                return next;
                              });
                            }}
                            className="mt-1 size-4 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-1 mb-1">
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                                {q.subject}/{q.unit}
                              </span>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                                {q.concept}
                              </span>
                            </div>
                            <span className="line-clamp-1 text-sm text-slate-700">
                              {q.question.replace(/\$[^$]+\$/g, "[수식]")}
                            </span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveManual}
                    disabled={todayLoading || manualSelected.size === 0}
                    className="rounded-md bg-brand-600 px-4 py-2 text-sm font-black text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    선택한 {manualSelected.size}문항으로 오늘의 데일리 저장
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualSelected(new Set())}
                    disabled={manualSelected.size === 0}
                    className="rounded-md border border-line px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    선택 초기화
                  </button>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {/* 데일리 풀 탭 */}
      {tab === "pool" && (
        <section className="space-y-3">
          {dailyQuestions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line bg-white py-12 text-center">
              <div className="text-3xl">➕</div>
              <p className="mt-2 text-sm text-slate-500">
                데일리 풀이 비어있습니다.
                <br />
                <button
                  type="button"
                  onClick={() => setTab("add")}
                  className="font-black text-brand-600 hover:underline"
                >
                  풀에 문제 추가
                </button>
                에서 추가해 주세요.
              </p>
            </div>
          ) : (
            dailyQuestions.map((q) => (
              <div
                key={q.id}
                className="flex items-start gap-4 rounded-lg border border-line bg-white p-4 shadow-soft"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
                      {q.subject}/{q.unit}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                      {q.concept}
                    </span>
                  </div>
                  <ContentRenderer
                    contentType={q.contentType}
                    text={q.question}
                    className="text-sm font-semibold leading-6 text-ink line-clamp-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFromDaily(q)}
                  disabled={saving === q.id}
                  className="shrink-0 rounded-md border border-coral-200 px-3 py-2 text-xs font-black text-coral-600 hover:bg-coral-50 disabled:opacity-50"
                >
                  {saving === q.id ? "처리 중..." : "풀에서 제거"}
                </button>
              </div>
            ))
          )}
        </section>
      )}

      {/* 풀에 문제 추가 탭 */}
      {tab === "add" && (
        <section>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 w-full rounded-md border border-line px-3 py-3 text-sm outline-none focus:border-brand-600"
            placeholder="문제 검색 (단원, 키워드...)"
          />
          <div className="space-y-3">
            {nonDailyQuestions.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">
                {search ? "검색 결과가 없습니다." : "추가할 수 있는 문제가 없습니다."}
              </p>
            ) : (
              nonDailyQuestions.map((q) => (
                <div
                  key={q.id}
                  className="flex items-start gap-4 rounded-lg border border-line bg-white p-4 shadow-soft"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                        {q.subject}/{q.unit}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                        {q.concept}
                      </span>
                    </div>
                    <ContentRenderer
                      contentType={q.contentType}
                      text={q.question}
                      className="text-sm font-semibold leading-6 text-ink line-clamp-2"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => addToDaily(q)}
                    disabled={saving === q.id}
                    className="shrink-0 rounded-md bg-brand-600 px-3 py-2 text-xs font-black text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    {saving === q.id ? "추가 중..." : "+ 풀에 추가"}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </main>
  );
}
