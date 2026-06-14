"use client";

import { useEffect, useMemo, useRef, useState, type ClipboardEvent } from "react";
import { adminFetch } from "@/lib/api/adminFetch";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import {
  blobToBase64,
  dataUrlToBlob,
  normalizeImageBlob,
  renderPdfPage,
  type NormalizedImage,
} from "@/lib/admin/coachingImage";
import {
  DIFFICULTY_KEYS,
  DIFFICULTY_LABELS,
  SUBJECT_NAMES,
  SUBJECT_UNITS,
} from "@/lib/taxonomy";
import type { Difficulty } from "@/types/exam";
import type { QuestionDraft, QuestionPool, QuestionRecord } from "@/types/question";
import type { CoachingExtractedProblem, CoachingRelatedGroup } from "@/types/coaching";

const MAX_UPLOAD_PAGES = 8;

type Tab = "related" | "unit" | "twin";
type PoolFilter = "all" | QuestionPool;

type UploadPage = {
  id: string;
  name: string;
  sourceLabel: string;
  blob: Blob;
  url: string;
  mediaType: "image/png" | "image/jpeg" | "image/webp";
  width: number;
  height: number;
};

type PrintSheet = {
  title: string;
  subtitle: string;
  questions: QuestionRecord[];
  sourceLabel?: string;
};

type TwinResult = {
  draft: QuestionDraft;
  question?: QuestionRecord;
  embedded?: boolean;
};

function hasExtension(file: File, extensions: string[]): boolean {
  const name = file.name.toLowerCase();
  return extensions.some((extension) => name.endsWith(extension));
}

function isSupportedClipboardFile(file: File): boolean {
  return (
    file.type.startsWith("image/") ||
    file.type === "application/pdf" ||
    hasExtension(file, [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff", ".pdf"])
  );
}

function mediaTypeOf(blob: Blob): UploadPage["mediaType"] {
  return blob.type === "image/jpeg" || blob.type === "image/webp" ? blob.type : "image/png";
}

function pageFromImage(image: NormalizedImage, name: string, sourceLabel: string): UploadPage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    sourceLabel,
    blob: image.blob,
    url: URL.createObjectURL(image.blob),
    mediaType: mediaTypeOf(image.blob),
    width: image.width,
    height: image.height,
  };
}

function releasePages(pages: UploadPage[]) {
  pages.forEach((page) => URL.revokeObjectURL(page.url));
}

function draftToRecord(draft: QuestionDraft, id = "twin-preview"): QuestionRecord {
  const now = new Date().toISOString();
  return {
    ...draft,
    id,
    createdAt: now,
    updatedAt: now,
  };
}

function answerLabel(question: QuestionRecord): string {
  if (question.questionType === "subjective") return question.answerText || "";
  const option = question.options.find((item) => item.id === question.correctOptionId);
  return option ? option.label : question.correctOptionId;
}

function chunk<T>(values: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < values.length; i += size) chunks.push(values.slice(i, i + size));
  return chunks;
}

async function ensureOk<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => null)) as ({ ok?: boolean; message?: string } & T) | null;
  if (!res.ok || json?.ok === false || !json) {
    throw new Error(json?.message ?? `HTTP ${res.status}`);
  }
  return json as T;
}

export function AdminCoachingClient() {
  const relatedFileRef = useRef<HTMLInputElement>(null);
  const twinFileRef = useRef<HTMLInputElement>(null);
  const pagesRef = useRef<UploadPage[]>([]);
  const twinImageRef = useRef<UploadPage | null>(null);

  const [tab, setTab] = useState<Tab>("related");
  const [pages, setPages] = useState<UploadPage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [matching, setMatching] = useState(false);
  const [relatedMsg, setRelatedMsg] = useState("");
  const [extracted, setExtracted] = useState<CoachingExtractedProblem[]>([]);
  const [perProblem, setPerProblem] = useState(2);
  const [relatedGroups, setRelatedGroups] = useState<CoachingRelatedGroup[]>([]);

  const [unitSubject, setUnitSubject] = useState<string>(SUBJECT_NAMES[0]);
  const [unit, setUnit] = useState<string>(SUBJECT_UNITS[SUBJECT_NAMES[0]][0]);
  const [unitCount, setUnitCount] = useState(12);
  const [unitDifficulty, setUnitDifficulty] = useState<"all" | Difficulty>("all");
  const [unitPool, setUnitPool] = useState<PoolFilter>("all");
  const [unitLoading, setUnitLoading] = useState(false);
  const [unitMsg, setUnitMsg] = useState("");

  const [twinImage, setTwinImage] = useState<UploadPage | null>(null);
  const [twinSourceText, setTwinSourceText] = useState("");
  const [twinInstruction, setTwinInstruction] = useState("");
  const [twinSave, setTwinSave] = useState(false);
  const [twinLoading, setTwinLoading] = useState(false);
  const [twinMsg, setTwinMsg] = useState("");
  const [twinResult, setTwinResult] = useState<TwinResult | null>(null);

  const [sheet, setSheet] = useState<PrintSheet | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  const unitOptions = useMemo(
    () => SUBJECT_UNITS[unitSubject as keyof typeof SUBJECT_UNITS] ?? [],
    [unitSubject]
  );
  const relatedSelected = useMemo(
    () => relatedGroups.flatMap((group) => group.matches.map((match) => match.question)),
    [relatedGroups]
  );

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  useEffect(() => {
    twinImageRef.current = twinImage;
  }, [twinImage]);

  useEffect(() => {
    return () => {
      releasePages(pagesRef.current);
      if (twinImageRef.current) URL.revokeObjectURL(twinImageRef.current.url);
    };
  }, []);

  function replacePages(next: UploadPage[]) {
    setPages((prev) => {
      releasePages(prev);
      return next;
    });
    setExtracted([]);
    setRelatedGroups([]);
    setRelatedMsg("");
  }

  async function buildPagesFromFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setUploading(true);
    setRelatedMsg("");
    try {
      const next: UploadPage[] = [];
      for (const file of list) {
        if (next.length >= MAX_UPLOAD_PAGES) break;
        if (hasExtension(file, [".hwp", ".hwpx"])) {
          throw new Error("HWP/HWPX는 PDF 또는 이미지로 변환해서 올려 주세요.");
        }

        const isPdf = file.type === "application/pdf" || hasExtension(file, [".pdf"]);
        if (isPdf) {
          const first = await renderPdfPage(file, 1);
          const pageCount = Math.min(first.pageCount, MAX_UPLOAD_PAGES - next.length);
          next.push(pageFromImage(first, file.name, `${file.name} · ${first.pageNumber}p`));
          for (let pageNumber = 2; pageNumber <= pageCount; pageNumber++) {
            const page = await renderPdfPage(file, pageNumber);
            next.push(pageFromImage(page, file.name, `${file.name} · ${page.pageNumber}p`));
          }
          continue;
        }

        if (!file.type.startsWith("image/")) {
          throw new Error("PDF 또는 이미지 파일만 올릴 수 있습니다.");
        }
        const image = await normalizeImageBlob(file);
        next.push(pageFromImage(image, file.name || "image", file.name || "image"));
      }
      replacePages(next);
      if (next.length === MAX_UPLOAD_PAGES) {
        setRelatedMsg(`한 번에 ${MAX_UPLOAD_PAGES}페이지까지만 불러왔습니다.`);
      }
    } catch (error) {
      setRelatedMsg(error instanceof Error ? error.message : "파일을 읽지 못했습니다.");
    } finally {
      setUploading(false);
      if (relatedFileRef.current) relatedFileRef.current.value = "";
    }
  }

  async function loadClipboardFile(file: File) {
    if (tab === "twin") {
      await loadTwinFile(file);
      return;
    }

    setTab("related");
    await buildPagesFromFiles([file]);
  }

  async function handlePaste(event: ClipboardEvent<HTMLElement>) {
    const clipboard = event.clipboardData;
    if (!clipboard) return;

    const files = Array.from(clipboard.files);
    const pastedFile = files.find(isSupportedClipboardFile);
    if (pastedFile) {
      event.preventDefault();
      await loadClipboardFile(pastedFile);
      return;
    }

    for (const item of Array.from(clipboard.items)) {
      if (item.kind !== "file") continue;
      const file = item.getAsFile();
      if (!file || !isSupportedClipboardFile(file)) continue;
      event.preventDefault();
      await loadClipboardFile(file);
      return;
    }

    const html = clipboard.getData("text/html");
    const src = html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
    if (!src) return;

    event.preventDefault();
    try {
      const blob = await dataUrlToBlob(src);
      const file = new File([blob], "clipboard-image", { type: blob.type || "image/png" });
      await loadClipboardFile(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : "클립보드 이미지를 읽지 못했습니다.";
      if (tab === "twin") setTwinMsg(message);
      else setRelatedMsg(message);
    }
  }

  async function extractProblems() {
    if (pages.length === 0 || extracting) return;
    setExtracting(true);
    setRelatedMsg("");
    setRelatedGroups([]);
    try {
      const images = await Promise.all(
        pages.map(async (page) => ({
          id: page.id,
          imageBase64: await blobToBase64(page.blob),
          mediaType: page.mediaType,
          sourceLabel: page.sourceLabel,
        }))
      );
      const json = await ensureOk<{ problems: CoachingExtractedProblem[]; count: number }>(
        await adminFetch("/api/admin/coaching/extract", {
          method: "POST",
          body: JSON.stringify({ images }),
        })
      );
      setExtracted(json.problems ?? []);
      setRelatedMsg(`인식된 문제: ${json.count ?? json.problems?.length ?? 0}개`);
    } catch (error) {
      setRelatedMsg(error instanceof Error ? error.message : "문제 인식에 실패했습니다.");
    } finally {
      setExtracting(false);
    }
  }

  async function findRelated() {
    if (extracted.length === 0 || matching) return;
    setMatching(true);
    setRelatedMsg("");
    setRelatedGroups([]);
    try {
      const json = await ensureOk<{
        groups: CoachingRelatedGroup[];
        selectedCount: number;
        skippedCount: number;
      }>(
        await adminFetch("/api/admin/coaching/related", {
          method: "POST",
          body: JSON.stringify({ problems: extracted, perProblem }),
        })
      );
      setRelatedGroups(json.groups ?? []);
      const selected = json.selectedCount ?? 0;
      const skipped = json.skippedCount ?? 0;
      setRelatedMsg(`문제지 구성: ${selected}문항${skipped ? ` · 건너뜀 ${skipped}개` : ""}`);
      if (selected > 0) {
        setSheet({
          title: "관련문제 데일리 테스트",
          subtitle: `업로드 ${extracted.length}문제 · 문제당 ${perProblem}개`,
          questions: (json.groups ?? []).flatMap((group) => group.matches.map((match) => match.question)),
          sourceLabel: "vector-related",
        });
      }
    } catch (error) {
      setRelatedMsg(error instanceof Error ? error.message : "관련문제 검색에 실패했습니다.");
    } finally {
      setMatching(false);
    }
  }

  async function generateUnitMock() {
    if (unitLoading) return;
    setUnitLoading(true);
    setUnitMsg("");
    try {
      const json = await ensureOk<{
        questions: QuestionRecord[];
        available: number;
        requestedCount: number;
      }>(
        await adminFetch("/api/admin/coaching/unit-mock", {
          method: "POST",
          body: JSON.stringify({
            subject: unitSubject,
            unit,
            count: unitCount,
            difficulty: unitDifficulty,
            pool: unitPool,
          }),
        })
      );
      setUnitMsg(`DB ${json.available}문항 중 ${json.questions.length}문항을 뽑았습니다.`);
      setSheet({
        title: `${unit} 단원 모의고사`,
        subtitle: `${unitSubject} · ${unitDifficulty === "all" ? "전체 난이도" : DIFFICULTY_LABELS[unitDifficulty]}`,
        questions: json.questions,
        sourceLabel: "unit-mock",
      });
    } catch (error) {
      setUnitMsg(error instanceof Error ? error.message : "단원별 모고 생성에 실패했습니다.");
    } finally {
      setUnitLoading(false);
    }
  }

  async function loadTwinFile(file: File | null) {
    if (!file) return;
    setTwinMsg("");
    try {
      let image: NormalizedImage;
      if (file.type === "application/pdf" || hasExtension(file, [".pdf"])) {
        image = await renderPdfPage(file, 1);
      } else if (file.type.startsWith("image/")) {
        image = await normalizeImageBlob(file);
      } else {
        throw new Error("PDF 또는 이미지 파일만 올릴 수 있습니다.");
      }
      const next = pageFromImage(image, file.name || "source", file.name || "source");
      setTwinImage((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return next;
      });
      setTwinResult(null);
    } catch (error) {
      setTwinMsg(error instanceof Error ? error.message : "파일을 읽지 못했습니다.");
    } finally {
      if (twinFileRef.current) twinFileRef.current.value = "";
    }
  }

  async function generateTwin() {
    if (twinLoading) return;
    setTwinLoading(true);
    setTwinMsg("");
    setTwinResult(null);
    try {
      const imagePayload = twinImage
        ? {
            imageBase64: await blobToBase64(twinImage.blob),
            mediaType: twinImage.mediaType,
          }
        : {};
      const json = await ensureOk<TwinResult>(
        await adminFetch("/api/admin/coaching/twin", {
          method: "POST",
          body: JSON.stringify({
            ...imagePayload,
            sourceText: twinSourceText,
            instruction: twinInstruction,
            save: twinSave,
          }),
        })
      );
      setTwinResult(json);
      const preview = json.question ?? draftToRecord(json.draft);
      setSheet({
        title: "쌍둥이 문제",
        subtitle: json.question ? `DB 저장됨 · ${json.question.id}` : "미저장 미리보기",
        questions: [preview],
        sourceLabel: "twin",
      });
      setTwinMsg(json.question ? `문제를 저장했습니다.${json.embedded ? " 임베딩도 생성했습니다." : ""}` : "쌍둥이 문제를 생성했습니다.");
    } catch (error) {
      setTwinMsg(error instanceof Error ? error.message : "쌍둥이 문제 생성에 실패했습니다.");
    } finally {
      setTwinLoading(false);
    }
  }

  function printSheet() {
    window.print();
  }

  return (
    <main className="coaching-workspace mx-auto max-w-7xl px-5 py-8" onPaste={handlePaste}>
      <style jsx global>{`
        @page {
          size: A4;
          margin: 0;
        }
        .coaching-print-area {
          display: block;
        }
        @media print {
          body {
            background: #ffffff !important;
          }
          header,
          .admin-screen-only {
            display: none !important;
          }
          .coaching-workspace {
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .coaching-print-area {
            margin: 0 !important;
          }
          .coaching-print-page {
            width: 210mm;
            min-height: 297mm;
            padding: 12mm;
            break-after: page;
            page-break-after: always;
            border: 0 !important;
            box-shadow: none !important;
          }
          .coaching-print-page:last-child {
            break-after: auto;
            page-break-after: auto;
          }
          .coaching-print-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            grid-template-rows: repeat(3, minmax(0, 1fr));
            gap: 5mm;
            height: 255mm;
          }
          .coaching-print-question {
            min-height: 0;
            overflow: hidden;
            break-inside: avoid;
            page-break-inside: avoid;
            border: 1px solid #d7deea;
            padding: 4mm;
            font-size: 9.5pt;
            line-height: 1.42;
          }
          .coaching-print-question img {
            max-height: 36mm !important;
          }
          .coaching-print-question .katex {
            font-size: 0.98em;
          }
        }
      `}</style>

      <section className="admin-screen-only mb-6 rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">관리자 콘솔</p>
        <div className="mt-1 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-ink">학생지도</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              업로드 문제 인식은 Gemini Vision, 관련문제 검색은 임베딩 벡터, 문제 출력은 인쇄용 PDF 화면을 사용합니다.
            </p>
          </div>
          {sheet ? (
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-xs font-black text-slate-600">
                <input
                  type="checkbox"
                  checked={showAnswers}
                  onChange={(event) => setShowAnswers(event.target.checked)}
                />
                정답 표시
              </label>
              <button
                type="button"
                onClick={printSheet}
                className="rounded-md bg-ink px-4 py-2 text-xs font-black text-white hover:bg-slate-800"
              >
                PDF 저장/인쇄
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <section className="admin-screen-only mb-5 flex flex-wrap gap-2 rounded-lg border border-line bg-white p-2 shadow-soft">
        {[
          { id: "related" as const, label: "관련문제 문제지" },
          { id: "unit" as const, label: "단원별 모고" },
          { id: "twin" as const, label: "쌍둥이 문제" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-md px-4 py-2 text-sm font-black ${
              tab === item.id
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </section>

      <section className="admin-screen-only">
        {tab === "related" ? (
          <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
            <aside className="rounded-lg border border-line bg-white p-5 shadow-soft">
              <h2 className="text-lg font-black text-ink">1. 업로드 문제 분석</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                PDF는 앞에서부터 최대 {MAX_UPLOAD_PAGES}페이지까지 이미지로 변환해 Gemini가 문제 단위로 분리합니다.
              </p>
              <input
                ref={relatedFileRef}
                type="file"
                accept="image/*,application/pdf,.pdf"
                multiple
                className="mt-4 block w-full rounded-md border border-line bg-white px-3 py-2 text-sm"
                onChange={(event) => {
                  if (event.target.files) void buildPagesFromFiles(event.target.files);
                }}
              />
              <button
                type="button"
                disabled={pages.length === 0 || extracting || uploading}
                onClick={extractProblems}
                className="mt-3 w-full rounded-md bg-brand-600 px-4 py-3 text-sm font-black text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {extracting ? "문제 인식 중..." : uploading ? "파일 읽는 중..." : "문제 갯수 확인"}
              </button>

              <div className="mt-5 border-t border-line pt-5">
                <label className="text-xs font-black text-slate-600">원문 1문제당 관련문제 수</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={perProblem}
                  onChange={(event) => setPerProblem(Math.max(1, Math.min(6, Number(event.target.value) || 1)))}
                  className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  disabled={extracted.length === 0 || matching}
                  onClick={findRelated}
                  className="mt-3 w-full rounded-md bg-ink px-4 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {matching ? "벡터 검색 중..." : "관련문제 문제지 구성"}
                </button>
              </div>

              {relatedMsg ? (
                <p className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">{relatedMsg}</p>
              ) : null}
            </aside>

            <div className="space-y-5">
              {pages.length > 0 ? (
                <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
                  <h3 className="text-sm font-black text-ink">업로드 페이지</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {pages.map((page) => (
                      <div key={page.id} className="rounded-lg border border-line bg-slate-50 p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={page.url} alt={page.sourceLabel} className="h-36 w-full rounded-md bg-white object-contain" />
                        <p className="mt-2 truncate text-xs font-bold text-slate-600">{page.sourceLabel}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-black text-ink">인식 결과</h3>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-black text-brand-700">
                    {extracted.length}문제
                  </span>
                </div>
                {extracted.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">PDF/이미지를 올리고 문제 갯수를 확인해 주세요.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {extracted.map((problem, index) => (
                      <div key={problem.id} className="rounded-lg border border-line p-4">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-black text-slate-500">
                          <span>#{index + 1}</span>
                          <span>{problem.sourceLabel}</span>
                          <span>{problem.subject || "과목 미확정"}</span>
                          <span>{problem.unit || "단원 미확정"}</span>
                          <span>신뢰도 {Math.round(problem.recognition.confidence * 100)}%</span>
                        </div>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink">{problem.problemText}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {relatedGroups.length > 0 ? (
                <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-black text-ink">관련문제 구성 결과</h3>
                    <button
                      type="button"
                      disabled={relatedSelected.length === 0}
                      onClick={() =>
                        setSheet({
                          title: "관련문제 데일리 테스트",
                          subtitle: `업로드 ${extracted.length}문제 · 문제당 ${perProblem}개`,
                          questions: relatedSelected,
                        })
                      }
                      className="rounded-md border border-line px-3 py-2 text-xs font-black text-slate-600 hover:border-brand-600 hover:text-brand-700 disabled:opacity-40"
                    >
                      미리보기 갱신
                    </button>
                  </div>
                  <div className="mt-4 space-y-4">
                    {relatedGroups.map((group, index) => (
                      <div key={group.source.id} className="rounded-lg border border-line p-4">
                        <p className="text-xs font-black text-slate-500">원문 #{index + 1}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-ink">{group.source.problemText}</p>
                        {group.skipped ? (
                          <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs font-black text-amber-700">
                            {group.reason}
                          </p>
                        ) : (
                          <ol className="mt-3 space-y-2">
                            {group.matches.map((match, matchIndex) => (
                              <li key={match.question.id} className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                <b className="text-ink">{matchIndex + 1}. {match.question.unit}</b>
                                <span className="ml-2">{match.question.concept}</span>
                                {typeof match.similarity === "number" ? (
                                  <span className="ml-2 text-slate-400">유사도 {match.similarity.toFixed(3)}</span>
                                ) : null}
                              </li>
                            ))}
                          </ol>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        ) : null}

        {tab === "unit" ? (
          <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
            <h2 className="text-lg font-black text-ink">단원별 모고 PDF</h2>
            <p className="mt-1 text-sm text-slate-500">
              DB에 저장된 문제를 과목/단원 기준으로 뽑아 6문항 단위 인쇄용 문제지로 만듭니다.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <label className="text-xs font-black text-slate-600">
                과목
                <select
                  value={unitSubject}
                  onChange={(event) => {
                    const next = event.target.value;
                    setUnitSubject(next);
                    setUnit(SUBJECT_UNITS[next as keyof typeof SUBJECT_UNITS]?.[0] ?? "");
                  }}
                  className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm font-normal"
                >
                  {SUBJECT_NAMES.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-black text-slate-600">
                단원
                <select
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                  className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm font-normal"
                >
                  {unitOptions.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-black text-slate-600">
                문항 수
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={unitCount}
                  onChange={(event) => setUnitCount(Math.max(1, Math.min(60, Number(event.target.value) || 1)))}
                  className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm font-normal"
                />
              </label>
              <label className="text-xs font-black text-slate-600">
                난이도
                <select
                  value={unitDifficulty}
                  onChange={(event) => setUnitDifficulty(event.target.value as "all" | Difficulty)}
                  className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm font-normal"
                >
                  <option value="all">전체</option>
                  {DIFFICULTY_KEYS.map((key) => (
                    <option key={key} value={key}>{DIFFICULTY_LABELS[key]}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-black text-slate-600">
                문제 풀
                <select
                  value={unitPool}
                  onChange={(event) => setUnitPool(event.target.value as PoolFilter)}
                  className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm font-normal"
                >
                  <option value="all">전체</option>
                  <option value="general">일반</option>
                  <option value="daily">데일리</option>
                  <option value="self_mock">자체 모고</option>
                </select>
              </label>
            </div>
            <button
              type="button"
              onClick={generateUnitMock}
              disabled={unitLoading}
              className="mt-5 rounded-md bg-brand-600 px-5 py-3 text-sm font-black text-white hover:bg-brand-700 disabled:bg-slate-300"
            >
              {unitLoading ? "문제 뽑는 중..." : "단원별 모고 만들기"}
            </button>
            {unitMsg ? <p className="mt-4 text-sm font-bold text-slate-600">{unitMsg}</p> : null}
          </section>
        ) : null}

        {tab === "twin" ? (
          <section className="grid gap-5 lg:grid-cols-[420px_1fr]">
            <div className="rounded-lg border border-line bg-white p-6 shadow-soft">
              <h2 className="text-lg font-black text-ink">쌍둥이 문제 생성</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                원문 이미지 또는 텍스트와 변경 요청을 Gemini에 보내 새 문제를 만듭니다.
              </p>
              <input
                ref={twinFileRef}
                type="file"
                accept="image/*,application/pdf,.pdf"
                className="mt-4 block w-full rounded-md border border-line bg-white px-3 py-2 text-sm"
                onChange={(event) => void loadTwinFile(event.target.files?.[0] ?? null)}
              />
              {twinImage ? (
                <div className="mt-3 rounded-lg border border-line bg-slate-50 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={twinImage.url} alt="원문 문제" className="max-h-56 w-full rounded-md bg-white object-contain" />
                  <p className="mt-2 truncate text-xs font-bold text-slate-600">{twinImage.name}</p>
                </div>
              ) : null}
              <label className="mt-4 block text-xs font-black text-slate-600">
                원문 텍스트
                <textarea
                  value={twinSourceText}
                  onChange={(event) => setTwinSourceText(event.target.value)}
                  rows={5}
                  className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm font-normal"
                  placeholder="이미지가 없거나 보완 설명이 필요할 때 원문을 붙여넣으세요."
                />
              </label>
              <label className="mt-4 block text-xs font-black text-slate-600">
                바꿀 부분
                <textarea
                  value={twinInstruction}
                  onChange={(event) => setTwinInstruction(event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm font-normal"
                  placeholder="예: 숫자는 더 깔끔하게, 최대/최소 조건은 유지, 정답은 2번이 되게 바꿔줘."
                />
              </label>
              <label className="mt-4 flex items-center gap-2 text-xs font-black text-slate-600">
                <input
                  type="checkbox"
                  checked={twinSave}
                  onChange={(event) => setTwinSave(event.target.checked)}
                />
                생성 후 DB에 저장
              </label>
              <button
                type="button"
                onClick={generateTwin}
                disabled={twinLoading}
                className="mt-4 w-full rounded-md bg-brand-600 px-5 py-3 text-sm font-black text-white hover:bg-brand-700 disabled:bg-slate-300"
              >
                {twinLoading ? "생성 중..." : "쌍둥이 문제 생성"}
              </button>
              {twinMsg ? <p className="mt-4 text-sm font-bold text-slate-600">{twinMsg}</p> : null}
            </div>

            <div className="rounded-lg border border-line bg-white p-6 shadow-soft">
              <h3 className="text-sm font-black text-ink">생성 결과</h3>
              {!twinResult ? (
                <p className="mt-4 text-sm text-slate-500">원문과 변경 요청을 입력하면 생성 결과가 표시됩니다.</p>
              ) : (
                <QuestionPreview
                  question={twinResult.question ?? draftToRecord(twinResult.draft)}
                  showAnswer
                />
              )}
            </div>
          </section>
        ) : null}
      </section>

      {sheet ? (
        <PrintableSheet sheet={sheet} showAnswers={showAnswers} />
      ) : (
        <section className="admin-screen-only mt-6 rounded-lg border border-dashed border-line bg-white/70 p-8 text-center text-sm text-slate-500">
          문제지를 만들면 이곳에 인쇄 미리보기가 표시됩니다.
        </section>
      )}
    </main>
  );
}

function QuestionPreview({ question, showAnswer }: { question: QuestionRecord; showAnswer: boolean }) {
  return (
    <article className="rounded-lg border border-line bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-black text-slate-500">
        <span>{question.subject}</span>
        <span>{question.unit}</span>
        <span>{question.concept}</span>
        <span>{DIFFICULTY_LABELS[question.difficulty]}</span>
      </div>
      <ContentRenderer
        contentType={question.contentType}
        text={question.question}
        image={question.questionImage}
        className="text-sm leading-6 text-ink"
      />
      {question.options.length > 0 ? (
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {question.options.map((option) => (
            <li key={option.id} className="flex gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm">
              <span className="font-black text-slate-500">{option.label}</span>
              <ContentRenderer contentType={option.contentType} text={option.text} image={option.image} />
            </li>
          ))}
        </ol>
      ) : null}
      {showAnswer ? (
        <div className="mt-4 rounded-md bg-brand-50 px-3 py-2 text-sm font-bold text-brand-700">
          정답: {answerLabel(question) || "-"}
        </div>
      ) : null}
    </article>
  );
}

function PrintableSheet({ sheet, showAnswers }: { sheet: PrintSheet; showAnswers: boolean }) {
  const pages = chunk(sheet.questions, 6);
  return (
    <section className="coaching-print-area mt-6 space-y-6">
      {pages.map((questions, pageIndex) => (
        <div key={`${sheet.sourceLabel ?? sheet.title}-${pageIndex}`} className="coaching-print-page rounded-lg border border-line bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-end justify-between border-b border-line pb-3">
            <div>
              <h2 className="text-xl font-black text-ink">{sheet.title}</h2>
              <p className="mt-1 text-xs font-bold text-slate-500">{sheet.subtitle}</p>
            </div>
            <p className="text-xs font-black text-slate-500">
              {pageIndex + 1} / {pages.length}
            </p>
          </div>
          <div className="coaching-print-grid grid gap-4 lg:grid-cols-2">
            {questions.map((question, index) => (
              <div key={question.id} className="coaching-print-question rounded-lg border border-line p-4">
                <div className="mb-2 flex items-start gap-2">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-xs font-black text-white">
                    {pageIndex * 6 + index + 1}
                  </span>
                  <div className="min-w-0 text-[11px] font-bold text-slate-500">
                    {question.unit} · {question.concept}
                  </div>
                </div>
                <ContentRenderer
                  contentType={question.contentType}
                  text={question.question}
                  image={question.questionImage}
                  className="text-sm leading-6 text-ink"
                />
                {question.options.length > 0 ? (
                  <ol className="mt-3 space-y-1.5">
                    {question.options.map((option) => (
                      <li key={option.id} className="flex gap-2 text-xs leading-5">
                        <span className="font-black text-slate-600">{option.label}</span>
                        <ContentRenderer contentType={option.contentType} text={option.text} image={option.image} />
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="mt-4 border-t border-dashed border-slate-300 pt-3 text-xs text-slate-400">
                    답:
                  </div>
                )}
                {showAnswers ? (
                  <div className="mt-3 rounded bg-slate-100 px-2 py-1 text-xs font-black text-slate-700">
                    정답 {answerLabel(question) || "-"}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
