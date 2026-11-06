"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import { KaTeXRenderer } from "@/components/math/KaTeXRenderer";
import { adminFetch } from "@/lib/api/adminFetch";
import { ALL_UNIT_VALUE } from "@/lib/admin/unitMockSelection";
import { DIFFICULTY_KEYS, DIFFICULTY_LABELS, SUBJECT_NAMES, unitsForSubject } from "@/lib/taxonomy";
import type { Difficulty } from "@/types/exam";
import type { QuestionPool, QuestionRecord } from "@/types/question";

const BROWSE_URL = "/api/admin/coaching/unit-mock/browse";
const PAGE_SIZE = 30;
const SEARCH_DEBOUNCE_MS = 350;

type BrowseItem = {
  id: string;
  subject: string;
  unit: string;
  concept: string;
  difficulty: Difficulty;
  pool: QuestionPool;
  question: string;
  hasImage: boolean;
  isSubjective: boolean;
  coachingUseCount: number;
  coachingUsedStudentCount: number;
  coachingLastUsedAt: string | null;
};

type BrowseListResponse = {
  total: number;
  offset: number;
  hasMore: boolean;
  unitCounts: Record<string, number>;
  items: BrowseItem[];
};

async function readJson<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => null)) as ({ ok?: boolean; message?: string } & T) | null;
  if (!res.ok || !json || json.ok === false) {
    throw new Error(json?.message ?? `HTTP ${res.status}`);
  }
  return json as T;
}

type OtherPartPickerProps = {
  /** 교체하려던 문제. 과목·난이도 안내와 처음 보여 줄 과목을 여기서 가져온다. */
  target: QuestionRecord;
  /** 문제지에서 몇 번째 문제인지(1부터). */
  targetNumber: number;
  studentIds: string[];
  forHomework: boolean;
  pool: "all" | QuestionPool;
  /** 화면에서 '사용한 문제 다시 사용하지 않기'가 켜져 있으면 처음부터 미사용만 보여 준다. */
  defaultOnlyUnused: boolean;
  /** 이미 문제지에 있거나 이번에 뺀 문제. 목록에서 감춘다. */
  excludeIds: string[];
  /** 문제를 넘겨받아 문제지에 넣는다. 넣을 수 없으면 사유를 돌려주고, 성공하면 null 을 돌려주며 창을 닫는다. */
  onPick: (question: QuestionRecord) => string | null;
  onClose: () => void;
};

/**
 * [이 문제 교체] 가 자동으로 교체 문제를 못 찾았을 때, 다른 단원·다른 과목의 문제를
 * 직접 찾아 그 자리에 가져오는 선택창이다.
 */
export function OtherPartPicker({
  target,
  targetNumber,
  studentIds,
  forHomework,
  pool,
  defaultOnlyUnused,
  excludeIds,
  onPick,
  onClose,
}: OtherPartPickerProps) {
  const [subject, setSubject] = useState(target.subject);
  const [unit, setUnit] = useState<string>(ALL_UNIT_VALUE);
  const [difficulty, setDifficulty] = useState<"all" | Difficulty>("all");
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [onlyUnused, setOnlyUnused] = useState(!forHomework && defaultOnlyUnused);

  const [items, setItems] = useState<BrowseItem[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [unitCounts, setUnitCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [openPreviewId, setOpenPreviewId] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, QuestionRecord>>({});
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
  const [pickingId, setPickingId] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

  // 필터를 바꾸는 사이 늦게 도착한 옛 응답이 목록을 덮어쓰지 않게 요청마다 번호를 매긴다.
  const requestSeq = useRef(0);
  const latest = useRef({ studentIds, excludeIds, forHomework, pool });
  latest.current = { studentIds, excludeIds, forHomework, pool };
  const itemCountRef = useRef(0);
  itemCountRef.current = items.length;

  const units = unitsForSubject(subject);

  const requestBody = useCallback(
    (extra: Record<string, unknown>) =>
      JSON.stringify({
        studentIds: latest.current.studentIds,
        forHomework: latest.current.forHomework,
        pool: latest.current.pool,
        excludeIds: latest.current.excludeIds,
        subject,
        unit,
        difficulty,
        query,
        onlyUnused,
        limit: PAGE_SIZE,
        ...extra,
      }),
    [subject, unit, difficulty, query, onlyUnused]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(queryInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [queryInput]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pickingId) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, pickingId]);

  // 필터가 바뀌면 처음부터 다시 불러온다.
  useEffect(() => {
    const seq = ++requestSeq.current;
    setLoading(true);
    setError("");
    void (async () => {
      try {
        const json = await readJson<BrowseListResponse>(
          await adminFetch(BROWSE_URL, {
            method: "POST",
            body: requestBody({ action: "list", offset: 0 }),
          })
        );
        if (seq !== requestSeq.current) return;
        setItems(json.items);
        setTotal(json.total);
        setHasMore(json.hasMore);
        setUnitCounts(json.unitCounts);
      } catch (loadError) {
        if (seq !== requestSeq.current) return;
        setItems([]);
        setTotal(0);
        setHasMore(false);
        setError(loadError instanceof Error ? loadError.message : "문제 목록을 불러오지 못했습니다.");
      } finally {
        if (seq === requestSeq.current) setLoading(false);
      }
    })();
  }, [requestBody]);

  async function loadMore() {
    if (loading || loadingMore || !hasMore) return;
    const seq = requestSeq.current;
    setLoadingMore(true);
    setError("");
    try {
      const json = await readJson<BrowseListResponse>(
        await adminFetch(BROWSE_URL, {
          method: "POST",
          body: requestBody({ action: "list", offset: itemCountRef.current }),
        })
      );
      if (seq !== requestSeq.current) return;
      setItems((current) => {
        const known = new Set(current.map((item) => item.id));
        return [...current, ...json.items.filter((item) => !known.has(item.id))];
      });
      setTotal(json.total);
      setHasMore(json.hasMore);
    } catch (loadError) {
      if (seq !== requestSeq.current) return;
      setError(loadError instanceof Error ? loadError.message : "문제 목록을 더 불러오지 못했습니다.");
    } finally {
      setLoadingMore(false);
    }
  }

  async function togglePreview(item: BrowseItem) {
    if (openPreviewId === item.id) {
      setOpenPreviewId(null);
      return;
    }
    setOpenPreviewId(item.id);
    if (previews[item.id]) return;
    setPreviewLoadingId(item.id);
    setRowErrors((current) => ({ ...current, [item.id]: "" }));
    try {
      const json = await readJson<{ question: QuestionRecord }>(
        await adminFetch(BROWSE_URL, {
          method: "POST",
          body: requestBody({ action: "preview", questionId: item.id }),
        })
      );
      setPreviews((current) => ({ ...current, [item.id]: json.question }));
    } catch (previewError) {
      setRowErrors((current) => ({
        ...current,
        [item.id]: previewError instanceof Error ? previewError.message : "미리보기를 불러오지 못했습니다.",
      }));
    } finally {
      setPreviewLoadingId((current) => (current === item.id ? null : current));
    }
  }

  async function pick(item: BrowseItem) {
    if (pickingId) return;
    setPickingId(item.id);
    setRowErrors((current) => ({ ...current, [item.id]: "" }));
    try {
      const json = await readJson<{ question: QuestionRecord }>(
        await adminFetch(BROWSE_URL, {
          method: "POST",
          body: requestBody({ action: "pick", questionId: item.id }),
        })
      );
      const refusal = onPick(json.question);
      if (refusal) {
        setRowErrors((current) => ({ ...current, [item.id]: refusal }));
        setPickingId(null);
      }
    } catch (pickError) {
      setRowErrors((current) => ({
        ...current,
        [item.id]: pickError instanceof Error ? pickError.message : "문제를 가져오지 못했습니다.",
      }));
      setPickingId(null);
    }
  }

  const busy = pickingId !== null;

  return (
    <div
      className="admin-screen-only fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="other-part-picker-title"
      onClick={() => {
        if (!busy) onClose();
      }}
    >
      <div
        className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.4)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-brand-600">다른 파트에서 가져오기</p>
            <h2 id="other-part-picker-title" className="mt-1 text-lg font-black text-ink">
              {targetNumber}번 문제를 대신할 문제 고르기
            </h2>
            <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
              원래 문제: {target.subject} · {target.unit} · 난이도 {DIFFICULTY_LABELS[target.difficulty]}. 이미 문제지에 있는
              문제는 목록에서 빠집니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="shrink-0 rounded-md border border-line px-3 py-1.5 text-xs font-black text-slate-600 transition hover:border-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            닫기
          </button>
        </div>

        <div className="grid gap-3 border-b border-line bg-slate-50 px-5 py-4 sm:grid-cols-2">
          <label className="text-xs font-black text-slate-500">
            과목
            <select
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);
                setUnit(ALL_UNIT_VALUE);
              }}
              className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm font-normal text-ink"
            >
              {SUBJECT_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                  {name === target.subject ? " (현재 문제)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-black text-slate-500">
            단원
            <select
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm font-normal text-ink"
            >
              <option value={ALL_UNIT_VALUE}>
                전체 단원 ({Object.values(unitCounts).reduce((sum, count) => sum + count, 0)})
              </option>
              {units.map((name) => (
                <option key={name} value={name}>
                  {name} ({unitCounts[name] ?? 0})
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-black text-slate-500">
            난이도
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as "all" | Difficulty)}
              className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm font-normal text-ink"
            >
              <option value="all">전체</option>
              {DIFFICULTY_KEYS.map((key) => (
                <option key={key} value={key}>
                  {DIFFICULTY_LABELS[key]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-black text-slate-500">
            검색
            <input
              type="search"
              value={queryInput}
              onChange={(event) => setQueryInput(event.target.value)}
              placeholder="개념·단원·학교·본문 키워드"
              className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm font-normal text-ink"
            />
          </label>
          {!forHomework ? (
            <label className="flex items-center gap-2 text-xs font-black text-slate-600 sm:col-span-2">
              <input
                type="checkbox"
                checked={onlyUnused}
                onChange={(event) => setOnlyUnused(event.target.checked)}
                className="size-4 rounded border-line"
              />
              선택한 학생에게 아직 쓰지 않은 문제만 보기
            </label>
          ) : null}
        </div>

        <div className="min-h-[12rem] flex-1 overflow-y-auto px-5 py-4">
          {error ? (
            <p className="mb-3 rounded-md bg-coral-50 px-3 py-2 text-xs font-bold text-coral-600">{error}</p>
          ) : null}
          {loading ? (
            <p className="py-10 text-center text-sm font-bold text-slate-400">문제를 찾는 중...</p>
          ) : items.length === 0 && !error ? (
            <p className="py-10 text-center text-sm font-bold text-slate-400">
              조건에 맞는 문제가 없습니다. 단원·난이도를 바꾸거나 검색어를 지워 보세요.
            </p>
          ) : (
            <ol className="space-y-2">
              {items.map((item) => {
                const isOpen = openPreviewId === item.id;
                const preview = previews[item.id];
                const used = item.coachingUseCount > 0;
                const rowError = rowErrors[item.id];
                return (
                  <li key={item.id} className="rounded-md border border-line bg-white p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-black text-slate-500">
                        {item.subject} · {item.unit}
                      </p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-700">
                        {DIFFICULTY_LABELS[item.difficulty]}
                      </span>
                      {item.hasImage ? (
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-black text-brand-700">
                          그림 포함
                        </span>
                      ) : null}
                      {item.isSubjective ? (
                        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-black text-violet-700">
                          주관식
                        </span>
                      ) : null}
                      {!forHomework ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                            used ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {used
                            ? `사용됨 · ${item.coachingUsedStudentCount}명 · 총 ${item.coachingUseCount}회`
                            : "선택 학생 모두 미사용"}
                        </span>
                      ) : null}
                    </div>
                    {item.concept ? (
                      <p className="mt-1 text-[11px] font-bold text-slate-400">{item.concept}</p>
                    ) : null}
                    <div className="mt-1 line-clamp-3 text-xs leading-5 text-slate-700">
                      <KaTeXRenderer content={item.question} viewBoxes={false} />
                    </div>

                    {isOpen ? (
                      <div className="mt-3 rounded-md border border-line bg-slate-50 p-3 text-sm">
                        {preview ? (
                          <>
                            <ContentRenderer
                              contentType={preview.contentType}
                              text={preview.question}
                              image={preview.questionImage}
                              className="text-sm leading-6 text-ink"
                            />
                            {preview.options.length > 0 ? (
                              <ol className="mt-3 space-y-1.5">
                                {preview.options.map((option) => (
                                  <li key={option.id} className="flex gap-2">
                                    <span className="font-black text-slate-500">{option.label}</span>
                                    <ContentRenderer
                                      viewBoxes={false}
                                      imagePlacement="after"
                                      contentType={option.contentType}
                                      text={option.text}
                                      image={option.image}
                                      className="min-w-0 flex-1"
                                    />
                                  </li>
                                ))}
                              </ol>
                            ) : null}
                          </>
                        ) : previewLoadingId === item.id ? (
                          <p className="text-xs font-bold text-slate-400">불러오는 중...</p>
                        ) : (
                          <p className="text-xs font-bold text-slate-400">미리보기를 불러오지 못했습니다.</p>
                        )}
                      </div>
                    ) : null}

                    <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                      {rowError ? (
                        <span className="mr-auto text-[11px] font-bold text-coral-600">{rowError}</span>
                      ) : null}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void togglePreview(item)}
                        className="rounded-md border border-line px-2 py-1 text-[11px] font-black text-slate-600 transition hover:border-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isOpen ? "미리보기 닫기" : "미리보기"}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void pick(item)}
                        className="rounded-md bg-brand-600 px-3 py-1 text-[11px] font-black text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {pickingId === item.id ? "가져오는 중..." : `${targetNumber}번 자리에 가져오기`}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
          <p className="text-xs font-bold text-slate-500">
            {loading ? "" : `조건에 맞는 문제 ${total}개 중 ${items.length}개 표시`}
          </p>
          {hasMore ? (
            <button
              type="button"
              disabled={loading || loadingMore || busy}
              onClick={() => void loadMore()}
              className="rounded-md border border-line bg-white px-3 py-1.5 text-xs font-black text-slate-600 transition hover:border-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loadingMore ? "불러오는 중..." : "더 보기"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
