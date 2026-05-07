"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { authRepo, isAdminUser } from "@/lib/auth/mockAuth";
import { questionRepo } from "@/lib/questions/questionRepository";
import { buildQuestionDraftsFromCsv, type ImportRowResult } from "@/lib/importQuestions";
import { readFileAsDataUrl } from "@/lib/files/readFileAsDataUrl";
import type { QuestionRecord } from "@/types/question";

export function AdminImportsClient() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [imageMap, setImageMap] = useState<Map<string, string>>(new Map());
  const [results, setResults] = useState<ImportRowResult[]>([]);
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    authRepo.getCurrentUser().then((user) => {
      const admin = isAdminUser(user);
      setIsAdmin(admin);
      setAuthChecked(true);
      if (admin) questionRepo.list().then(setQuestions);
    });
  }, []);

  const validDrafts = useMemo(
    () => results.filter((result) => result.ok).map((result) => result.draft),
    [results]
  );
  const invalidRows = useMemo(() => results.filter((result) => !result.ok), [results]);

  async function loadCsv(file: File | undefined) {
    if (!file) return;
    setCsvText(await file.text());
  }

  async function loadImages(files: FileList | null) {
    if (!files) return;
    const next = new Map(imageMap);
    for (const file of Array.from(files)) {
      next.set(file.name, await readFileAsDataUrl(file));
    }
    setImageMap(next);
  }

  function preview() {
    const parsed = buildQuestionDraftsFromCsv({ csv: csvText, imageMap });
    setResults(parsed);
    setMessage(`${parsed.length}개 행을 검토했습니다.`);
  }

  async function importValidRows() {
    if (validDrafts.length === 0) {
      setMessage("등록할 정상 행이 없습니다.");
      return;
    }
    await questionRepo.appendMany(validDrafts);
    setQuestions(await questionRepo.list());
    setMessage(`${validDrafts.length}개 문제를 문제은행에 등록했습니다.`);
  }

  if (!authChecked) return null;

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-8">
        <section className="max-w-xl rounded-lg border border-line bg-white p-8 text-center shadow-soft">
          <div className="mb-4 text-5xl">🔒</div>
          <h1 className="text-2xl font-black text-ink">관리자만 접근할 수 있습니다</h1>
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
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">
          Bulk Import
        </p>
        <h1 className="mt-1 text-3xl font-black text-ink">CSV + 이미지 대량 업로드</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          CSV의 이미지 파일명과 선택한 이미지 파일들을 매칭합니다. 이미지는 base64로 처리됩니다.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5 rounded-lg border border-line bg-white p-5 shadow-soft">
          <label className="block">
            <span className="text-xs font-black text-slate-600">CSV 파일</span>
            <input
              className="mt-2 block w-full text-sm"
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => loadCsv(event.target.files?.[0])}
            />
          </label>
          <label className="block">
            <span className="text-xs font-black text-slate-600">이미지 파일 여러 개</span>
            <input
              className="mt-2 block w-full text-sm"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => loadImages(event.target.files)}
            />
          </label>
          <label className="block">
            <span className="text-xs font-black text-slate-600">CSV 내용</span>
            <textarea
              value={csvText}
              onChange={(event) => setCsvText(event.target.value)}
              className="mt-2 h-72 w-full rounded-md border border-line px-3 py-2 font-mono text-xs leading-5 outline-none focus:border-brand-600"
              placeholder="subject,unit,concept,difficulty,question_image,option_1,option_2,option_3,option_4,answer,tags"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={preview}
              className="rounded-md border border-line px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              미리보기/검증
            </button>
            <button
              type="button"
              onClick={importValidRows}
              className="rounded-md bg-brand-600 px-4 py-3 text-sm font-black text-white hover:bg-brand-700"
            >
              정상 행 등록
            </button>
          </div>
          {message ? (
            <div className="rounded-md bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700">
              {message}
            </div>
          ) : null}
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <h2 className="text-lg font-black text-ink">검증 결과</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-md border border-line p-3">
                <div className="text-xs font-bold text-slate-500">정상</div>
                <div className="mt-1 text-2xl font-black text-mint-600">{validDrafts.length}</div>
              </div>
              <div className="rounded-md border border-line p-3">
                <div className="text-xs font-bold text-slate-500">오류</div>
                <div className="mt-1 text-2xl font-black text-coral-600">{invalidRows.length}</div>
              </div>
            </div>
            <div className="mt-4 text-sm font-bold text-slate-600">
              선택 이미지: {imageMap.size}개 / 현재 문제은행: {questions.length}개
            </div>
          </section>

          <section className="max-h-[520px] overflow-y-auto rounded-lg border border-line bg-white p-5 shadow-soft">
            <h2 className="text-lg font-black text-ink">오류 행</h2>
            <div className="mt-3 space-y-2">
              {invalidRows.map((result) => (
                <div
                  key={result.rowNumber}
                  className="rounded-md bg-coral-50 px-3 py-2 text-xs font-bold leading-5 text-coral-600"
                >
                  {result.rowNumber}행: {result.message}
                </div>
              ))}
              {invalidRows.length === 0 ? (
                <p className="text-sm text-slate-500">아직 오류가 없거나 검증 전입니다.</p>
              ) : null}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
