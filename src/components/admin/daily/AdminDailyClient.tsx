"use client";

import { useEffect, useState } from "react";
import { authRepo, isAdminUser } from "@/lib/auth/mockAuth";
import { questionRepo } from "@/lib/questions/questionRepository";
import type { QuestionRecord } from "@/types/question";
import { ContentRenderer } from "@/components/content/ContentRenderer";

function getTodayParam(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDailyPreview(dailyQuestions: QuestionRecord[], count = 5): QuestionRecord[] {
  if (dailyQuestions.length === 0) return [];
  const sorted = [...dailyQuestions].sort((a, b) => a.id.localeCompare(b.id));
  const n = Math.min(count, sorted.length);
  const dayIndex = Math.floor(Date.now() / 86400000);
  const start = (dayIndex * n) % sorted.length;
  return [...sorted.slice(start), ...sorted.slice(0, start)].slice(0, n);
}

export function AdminDailyClient() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allQuestions, setAllQuestions] = useState<QuestionRecord[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"daily" | "all">("daily");

  useEffect(() => {
    authRepo.getCurrentUser().then((user) => {
      const admin = isAdminUser(user);
      setIsAdmin(admin);
      setAuthChecked(true);
      if (admin) questionRepo.list().then(setAllQuestions);
    });
  }, []);

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
  const nonDailyQuestions = allQuestions
    .filter((q) => !q.tags.includes("daily"))
    .filter((q) =>
      search.trim() === "" ||
      q.question.includes(search) ||
      q.unit.includes(search) ||
      q.subject.includes(search)
    );
  const todayPreview = getDailyPreview(dailyQuestions);

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

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      {/* 헤더 */}
      <section className="mb-6 rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">Admin</p>
        <h1 className="mt-1 text-3xl font-black text-ink">데일리 테스트 관리</h1>
        <p className="mt-2 text-sm text-slate-600">
          데일리 풀에 등록된 문제들이 매일 로테이션으로 학생에게 출제됩니다 (최대 5문항/일).
        </p>
      </section>

      {/* 오늘 미리보기 */}
      <section className="mb-6 rounded-lg border border-brand-200 bg-brand-50 p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-brand-500">
              Today Preview
            </p>
            <h2 className="mt-0.5 text-base font-black text-ink">
              {getTodayParam()} 오늘 출제 문항 ({todayPreview.length}문항)
            </h2>
          </div>
          <span className="text-3xl">📅</span>
        </div>
        {todayPreview.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">데일리 풀에 문제가 없습니다. 아래에서 추가해 주세요.</p>
        ) : (
          <div className="mt-3 space-y-1">
            {todayPreview.map((q, i) => (
              <div key={q.id} className="flex items-start gap-2 text-sm">
                <span className="shrink-0 font-black text-brand-600">{i + 1}.</span>
                <span className="line-clamp-1 text-slate-700">{q.question.replace(/\$[^$]+\$/g, "[수식]")}</span>
                <span className="ml-auto shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700">
                  {q.unit}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 탭 */}
      <div className="mb-4 flex gap-2 border-b border-line">
        <button
          type="button"
          onClick={() => setTab("daily")}
          className={`px-4 py-3 text-sm font-black transition ${
            tab === "daily"
              ? "border-b-2 border-brand-600 text-brand-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          데일리 풀 ({dailyQuestions.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("all")}
          className={`px-4 py-3 text-sm font-black transition ${
            tab === "all"
              ? "border-b-2 border-brand-600 text-brand-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          문제 추가하기
        </button>
      </div>

      {tab === "daily" ? (
        <section className="space-y-3">
          {dailyQuestions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line bg-white py-12 text-center">
              <div className="text-3xl">➕</div>
              <p className="mt-2 text-sm text-slate-500">
                데일리 풀이 비어있습니다.
                <br />
                <button
                  type="button"
                  onClick={() => setTab("all")}
                  className="font-black text-brand-600 hover:underline"
                >
                  문제 추가하기
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
                      {q.unit}
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
                  {saving === q.id ? "처리 중..." : "제거"}
                </button>
              </div>
            ))
          )}
        </section>
      ) : (
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
                        {q.unit}
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
                    {saving === q.id ? "추가 중..." : "+ 데일리 추가"}
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
