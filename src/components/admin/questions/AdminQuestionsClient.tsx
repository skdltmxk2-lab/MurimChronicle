"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type {
  QuestionDraft,
  QuestionFilters,
  QuestionPool,
  QuestionRecord,
  QuestionSourceType,
} from "@/types/question";

// 22개 한글 학교명을 영문 ID 코드로 매핑 (q-YEAR-CODE-* 패턴).
const SCHOOL_OPTIONS: Array<{ code: string; ko: string }> = [
  { code: "ajou", ko: "아주대" }, { code: "cau", ko: "중앙대" }, { code: "dgu", ko: "동국대" },
  { code: "dku", ko: "단국대" }, { code: "gachon", ko: "가천대" }, { code: "hansung", ko: "한성대" },
  { code: "hanyang", ko: "한양대" }, { code: "hongik", ko: "홍익대" }, { code: "inha", ko: "인하대" },
  { code: "kau", ko: "항공대" }, { code: "konkuk", ko: "건국대" }, { code: "kw", ko: "광운대" },
  { code: "kyonggi", ko: "경기대" }, { code: "kyunghee", ko: "경희대" }, { code: "mju", ko: "명지대" },
  { code: "sejong", ko: "세종대" }, { code: "seoultech", ko: "서울과기대" }, { code: "skku", ko: "성균관대" },
  { code: "sogang", ko: "서강대" }, { code: "sookmyung", ko: "숙명여대" }, { code: "soongsil", ko: "숭실대" },
  { code: "uos", ko: "시립대" },
];
const YEAR_OPTIONS = ["2025","2024","2023","2022","2021","2020","2019","2018","2017","2016"];
import { questionRepo } from "@/lib/questions/questionRepository";
import { adminFetch } from "@/lib/api/adminFetch";
import { authRepo, isAdminUser } from "@/lib/auth/mockAuth";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { QuestionModal } from "@/components/admin/questions/QuestionModal";
import {
  DIFFICULTY_KEYS,
  DIFFICULTY_LABELS,
  SUBJECT_NAMES,
  unitsForSubject
} from "@/lib/taxonomy";

const sourceTypeStyles: Record<QuestionSourceType, string> = {
  mock: "bg-slate-100 text-slate-700",
  manual: "bg-brand-50 text-brand-700",
  imported: "bg-amber-50 text-amber-700",
  ai: "bg-mint-50 text-mint-600"
};

const PAGE_SIZE = 100;

async function ensureOk(res: Response) {
  const json = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
  if (!res.ok || json?.ok === false) {
    throw new Error(json?.message ?? `HTTP ${res.status}`);
  }
  return json;
}

// 목록에서 KaTeX 렌더링은 비싸므로 본문/풀이의 LaTeX 수식을 평문 [수식]으로 치환.
// 클릭 시 미리보기 모달에서 ContentRenderer로 정상 렌더링.
function stripLatexForPreview(text: string): string {
  if (!text) return "";
  return text
    .replace(/\$\$[\s\S]+?\$\$/g, "[수식]")
    .replace(/\$[^$\n]+?\$/g, "[수식]")
    .replace(/\\\\/g, " ");
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function hasQuestionImageHint(question: QuestionRecord) {
  return Boolean(question.questionImage) || question.contentType === "image" || question.contentType === "mixed";
}

export function AdminQuestionsClient() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState("");
  const [filters, setFilters] = useState<QuestionFilters>({
    subject: "",
    unit: "",
    difficulty: "all",
    pool: "all",
    school: "",
    year: "",
  });
  const [view, setView] = useState<QuestionPool>("general");
  const [page, setPage] = useState(1);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuestionRecord | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<QuestionRecord | null>(null);

  useEffect(() => {
    authRepo.getCurrentUser().then((user) => {
      const admin = isAdminUser(user);
      setIsAdmin(admin);
      setAuthChecked(true);
      if (admin) void loadQuestions();
    });
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filters, view]);

  const filterUnitOptions = useMemo(
    () => unitsForSubject(filters.subject),
    [filters.subject]
  );
  // pool 컬럼 기준으로 분류 (pool 미설정 = 'general'로 간주, daily 태그도 fallback)
  const poolOf = (q: QuestionRecord): QuestionPool => {
    if (q.pool) return q.pool;
    if ((q.tags ?? []).includes("daily")) return "daily";
    return "general";
  };
  const viewQuestions = useMemo(
    () => questions.filter((q) => poolOf(q) === view),
    [questions, view]
  );
  const generalCount = useMemo(
    () => questions.filter((q) => poolOf(q) === "general").length,
    [questions]
  );
  const dailyCount = useMemo(
    () => questions.filter((q) => poolOf(q) === "daily").length,
    [questions]
  );
  const selfMockCount = useMemo(
    () => questions.filter((q) => poolOf(q) === "self_mock").length,
    [questions]
  );
  const visibleQuestions = useMemo(
    () => questionRepo.filter(viewQuestions, filters),
    [filters, viewQuestions]
  );
  const totalPages = Math.max(1, Math.ceil(visibleQuestions.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedQuestions = useMemo(
    () => visibleQuestions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [currentPage, visibleQuestions]
  );

  async function loadQuestions() {
    setListLoading(true);
    try {
      const json = (await ensureOk(await adminFetch("/api/admin/questions"))) as {
        questions?: QuestionRecord[];
      };
      setQuestions(json.questions ?? []);
    } catch (error) {
      setActionMsg(errorMessage(error, "문제 목록을 불러오지 못했습니다."));
    } finally {
      setListLoading(false);
    }
  }

  async function fetchQuestionDetail(id: string) {
    const json = (await ensureOk(await adminFetch(`/api/admin/questions/${encodeURIComponent(id)}`))) as {
      question?: QuestionRecord;
    };
    if (!json.question) throw new Error("문제를 찾을 수 없습니다.");
    return json.question;
  }

  async function openPreviewModal(question: QuestionRecord) {
    setActionMsg("");
    setDetailLoadingId(question.id);
    try {
      setPreviewQuestion(await fetchQuestionDetail(question.id));
    } catch (error) {
      setActionMsg(errorMessage(error, "문제 상세를 불러오지 못했습니다."));
    } finally {
      setDetailLoadingId(null);
    }
  }

  function openCreateModal() {
    setEditingQuestion(null);
    setModalMode("create");
  }

  async function openEditModal(question: QuestionRecord) {
    setActionMsg("");
    setDetailLoadingId(question.id);
    try {
      setEditingQuestion(await fetchQuestionDetail(question.id));
      setModalMode("edit");
    } catch (error) {
      setActionMsg(errorMessage(error, "문제 상세를 불러오지 못했습니다."));
    } finally {
      setDetailLoadingId(null);
    }
  }

  function closeModal() {
    setModalMode(null);
    setEditingQuestion(null);
  }

  async function saveDraft(draft: QuestionDraft) {
    setActionMsg("");
    try {
      if (modalMode === "edit" && editingQuestion) {
        await ensureOk(await adminFetch(`/api/admin/questions/${editingQuestion.id}`, {
          method: "PUT",
          body: JSON.stringify({ draft }),
        }));
      } else {
        await ensureOk(await adminFetch("/api/admin/questions", {
          method: "POST",
          body: JSON.stringify({ draft }),
        }));
      }
      await loadQuestions();
      closeModal();
      setActionMsg("문제 저장을 완료했습니다.");
    } catch (error) {
      setActionMsg(errorMessage(error, "문제 저장에 실패했습니다."));
    }
  }

  async function resetData() {
    if (!window.confirm("문제 데이터를 mockData 기준으로 초기화할까요?")) return;
    setActionMsg("");
    try {
      const res = await adminFetch("/api/admin/questions/reset", { method: "POST" });
      await ensureOk(res);
      await loadQuestions();
      setFilters({
        subject: "",
        unit: "",
        difficulty: "all",
        pool: "all",
        school: "",
        year: "",
      });
      setActionMsg("문제 데이터를 초기화했습니다.");
    } catch (error) {
      setActionMsg(errorMessage(error, "문제 초기화에 실패했습니다."));
    }
  }

  async function deleteQuestion(id: string) {
    if (!window.confirm("이 문제를 삭제할까요?")) return;
    setActionMsg("");
    try {
      await ensureOk(await adminFetch(`/api/admin/questions/${id}`, { method: "DELETE" }));
      setQuestions((current) => current.filter((q) => q.id !== id));
      setActionMsg("문제를 삭제했습니다.");
    } catch (error) {
      setActionMsg(errorMessage(error, "문제 삭제에 실패했습니다."));
    }
  }

  if (!authChecked) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-8">
        <section className="rounded-lg border border-line bg-white p-6 text-sm font-bold text-slate-600 shadow-soft">
          관리자 권한을 확인하는 중입니다.
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-8">
        <section className="max-w-xl rounded-lg border border-line bg-white p-8 text-center shadow-soft">
          <div className="mb-4 text-5xl">🔒</div>
          <h1 className="text-2xl font-black text-ink">관리자만 접근할 수 있습니다</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            관리자 권한이 부여된 계정으로 로그인해 주세요.
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
    <main className="mx-auto max-w-7xl px-5 py-8">
      <section className="mb-5 rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">
              Admin Question Bank
            </p>
            <h1 className="mt-1 text-3xl font-black text-ink">문제 관리</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              모의고사·일반 문제와 데일리 테스트 전용 문제를 분리해서 관리합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetData}
              className="rounded-md border border-line bg-white px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              mockData 초기화
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-md bg-brand-600 px-4 py-3 text-sm font-black text-white hover:bg-brand-700"
            >
              문제 추가
            </button>
          </div>
        </div>
        {actionMsg ? (
          <div className="mt-4 rounded-md bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700">
            {actionMsg}
          </div>
        ) : null}
      </section>

      <section className="mb-5 flex gap-2 rounded-lg border border-line bg-white p-2 shadow-soft">
        <button
          type="button"
          onClick={() => setView("general")}
          className={`flex-1 rounded-md px-4 py-3 text-sm font-black transition ${
            view === "general"
              ? "bg-brand-600 text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          일반 문제 <span className="ml-1 text-xs opacity-80">({generalCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setView("daily")}
          className={`flex-1 rounded-md px-4 py-3 text-sm font-black transition ${
            view === "daily"
              ? "bg-amber-500 text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          데일리 문제 <span className="ml-1 text-xs opacity-80">({dailyCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setView("self_mock")}
          className={`flex-1 rounded-md px-4 py-3 text-sm font-black transition ${
            view === "self_mock"
              ? "bg-coral-600 text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          자체 모의고사 <span className="ml-1 text-xs opacity-80">({selfMockCount})</span>
        </button>
      </section>

      <section className="mb-5 rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          <label className="block">
            <span className="text-xs font-black text-slate-600">과목</span>
            <select
              value={filters.subject}
              onChange={(event) =>
                setFilters({ ...filters, subject: event.target.value, unit: "" })
              }
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
            >
              <option value="">전체</option>
              {SUBJECT_NAMES.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-black text-slate-600">단원</span>
            <select
              value={filters.unit}
              onChange={(event) => setFilters({ ...filters, unit: event.target.value })}
              disabled={!filters.subject}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600 disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">전체</option>
              {filterUnitOptions.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-black text-slate-600">난이도</span>
            <select
              value={filters.difficulty}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  difficulty: event.target.value as QuestionFilters["difficulty"]
                })
              }
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
            >
              <option value="all">전체</option>
              {DIFFICULTY_KEYS.map((key) => (
                <option key={key} value={key}>
                  {DIFFICULTY_LABELS[key]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-black text-slate-600">학교</span>
            <select
              value={filters.school}
              onChange={(event) =>
                setFilters({ ...filters, school: event.target.value })
              }
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
            >
              <option value="">전체</option>
              {SCHOOL_OPTIONS.map((s) => (
                <option key={s.code} value={s.code}>{s.ko}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-black text-slate-600">년도</span>
            <select
              value={filters.year}
              onChange={(event) =>
                setFilters({ ...filters, year: event.target.value })
              }
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
            >
              <option value="">전체</option>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-line bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="text-sm font-black text-ink">
            문제 목록 <span className="text-brand-600">{visibleQuestions.length}</span>
            <span className="text-slate-400"> / {viewQuestions.length}</span>
          </div>
          <div className="text-xs font-bold text-slate-500">
            {listLoading
              ? "목록 불러오는 중"
              : `${currentPage} / ${totalPages}페이지 · ${pagedQuestions.length}개 표시`}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead className="bg-slate-50 text-xs font-black text-slate-500">
              <tr>
                <th className="w-[90px] px-4 py-3">source</th>
                <th className="w-[110px] px-4 py-3">과목</th>
                <th className="w-[120px] px-4 py-3">단원</th>
                <th className="w-[90px] px-4 py-3">난이도</th>
                <th className="px-4 py-3">문제</th>
                <th className="w-[220px] px-4 py-3">태그</th>
                <th className="w-[90px] px-4 py-3">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pagedQuestions.map((question) => (
                <tr
                  key={question.id}
                  className={`align-top cursor-pointer hover:bg-slate-50/70 ${
                    detailLoadingId === question.id ? "opacity-60" : ""
                  }`}
                  onClick={() => void openPreviewModal(question)}
                >
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-black ${sourceTypeStyles[question.sourceType]}`}
                    >
                      {question.sourceType}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">{question.subject}</td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-black text-ink">{question.unit}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">{question.concept}</div>
                  </td>
                  <td className="px-4 py-4">
                    <DifficultyBadge difficulty={question.difficulty} />
                    <div className="sr-only">{DIFFICULTY_LABELS[question.difficulty]}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="line-clamp-2 text-sm font-semibold leading-6 text-ink">
                      {stripLatexForPreview(question.question)}
                      {hasQuestionImageHint(question) ? (
                        <span className="ml-1 rounded-full bg-mint-50 px-1.5 py-0.5 text-[10px] font-black text-mint-600">
                          그림
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-slate-500">
                      {question.contentType ?? "latex"} /{" "}
                      {question.questionType === "subjective"
                        ? `단답형 (정답 ${question.answerText ?? "?"})`
                        : `정답 ${question.correctOptionId}번`}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {question.tags.slice(0, 5).map((tag, i) => (
                        <span
                          key={`${tag}-${i}`}
                          className="rounded-full bg-brand-50 px-2 py-1 text-xs font-bold text-brand-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {question.tags.length > 5 ? (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
                          +{question.tags.length - 5}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => void openEditModal(question)}
                        disabled={detailLoadingId === question.id}
                        className="rounded-md border border-line px-3 py-2 text-xs font-black text-slate-700 hover:bg-white"
                      >
                        {detailLoadingId === question.id ? "로딩" : "수정"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteQuestion(question.id)}
                        className="rounded-md border border-coral-200 px-3 py-2 text-xs font-black text-coral-600 hover:bg-coral-50"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleQuestions.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-sm font-bold text-slate-500" colSpan={7}>
                    {listLoading ? "문제 목록을 불러오는 중입니다." : "조건에 맞는 문제가 없습니다."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {visibleQuestions.length > PAGE_SIZE ? (
          <div className="flex items-center justify-between border-t border-line px-5 py-3">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage <= 1}
              className="rounded-md border border-line px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              이전
            </button>
            <span className="text-xs font-bold text-slate-500">
              {((currentPage - 1) * PAGE_SIZE) + 1}-
              {Math.min(currentPage * PAGE_SIZE, visibleQuestions.length)} / {visibleQuestions.length}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={currentPage >= totalPages}
              className="rounded-md border border-line px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              다음
            </button>
          </div>
        ) : null}
      </section>

      {modalMode ? (
        <QuestionModal
          mode={modalMode}
          question={editingQuestion}
          onClose={closeModal}
          onSave={saveDraft}
        />
      ) : null}

      {previewQuestion ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8"
          onClick={() => setPreviewQuestion(null)}
        >
          <div
            className="max-h-full w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">문제 미리보기</p>
                <h2 className="mt-1 text-base font-black text-ink">
                  {previewQuestion.subject} · {previewQuestion.unit}
                  {previewQuestion.concept ? ` · ${previewQuestion.concept}` : ""}
                </h2>
                <p className="mt-1 text-xs text-slate-400">{previewQuestion.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewQuestion(null)}
                className="shrink-0 rounded-md border border-line px-3 py-1 text-xs font-black text-slate-600 hover:bg-slate-50"
              >
                닫기
              </button>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <DifficultyBadge difficulty={previewQuestion.difficulty} />
              <span className={`rounded-full px-2 py-0.5 text-xs font-black ${sourceTypeStyles[previewQuestion.sourceType]}`}>
                {previewQuestion.sourceType}
              </span>
              <span className="text-xs text-slate-500">
                {previewQuestion.questionType === "subjective"
                  ? "단답형"
                  : `정답 ${previewQuestion.correctOptionId}번`}
              </span>
            </div>

            <div className="mb-5 rounded-lg border border-line bg-slate-50 p-4">
              <p className="mb-2 text-xs font-black text-slate-500">문제</p>
              <ContentRenderer
                contentType={previewQuestion.contentType}
                text={previewQuestion.question}
                image={previewQuestion.questionImage}
                imageAlt="문제 이미지"
                className="text-sm leading-7 text-ink"
              />
            </div>

            {previewQuestion.questionType === "subjective" ? (
              <div className="mb-5 rounded-lg border border-mint-200 bg-mint-50/50 p-4">
                <p className="text-xs font-black text-mint-600">단답형 정답</p>
                <ContentRenderer
                  contentType="latex"
                  text={previewQuestion.answerText ?? "-"}
                  className="mt-2 text-sm leading-7 text-ink"
                />
              </div>
            ) : (
            <div className="mb-5 space-y-2">
              <p className="text-xs font-black text-slate-500">보기</p>
              {previewQuestion.options.map((opt) => {
                const isAnswer = opt.id === previewQuestion.correctOptionId;
                return (
                  <div
                    key={opt.id}
                    className={`rounded-lg border p-3 text-sm ${
                      isAnswer
                        ? "border-mint-200 bg-mint-50/50"
                        : "border-line bg-white"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-black ${
                        isAnswer ? "bg-mint-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}>
                        {opt.label}
                      </span>
                      {isAnswer ? <span className="text-xs font-black text-mint-600">정답</span> : null}
                    </div>
                    <ContentRenderer
                      contentType={opt.contentType}
                      text={opt.text}
                      image={opt.image}
                      imageAlt={`보기 ${opt.label} 이미지`}
                    />
                  </div>
                );
              })}
            </div>
            )}

            {previewQuestion.explanation ? (
              <div className="mb-3 rounded-lg border border-line bg-amber-50/30 p-4">
                <p className="mb-2 text-xs font-black text-amber-700">풀이</p>
                <ContentRenderer
                  contentType={previewQuestion.explanationContentType}
                  text={previewQuestion.explanation}
                  image={previewQuestion.explanationImage}
                  imageAlt="풀이 이미지"
                  className="text-sm leading-7 text-slate-700"
                />
              </div>
            ) : null}

            {previewQuestion.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {previewQuestion.tags.map((t, i) => (
                  <span
                    key={`${t}-${i}`}
                    className="rounded-full bg-brand-50 px-2 py-1 text-xs font-bold text-brand-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-5 flex gap-2 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => {
                  const target = previewQuestion;
                  setPreviewQuestion(null);
                  setEditingQuestion(target);
                  setModalMode("edit");
                }}
                className="rounded-md border border-line px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                수정하기
              </button>
              <button
                type="button"
                onClick={() => setPreviewQuestion(null)}
                className="ml-auto rounded-md bg-brand-600 px-4 py-2 text-sm font-black text-white hover:bg-brand-700"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
