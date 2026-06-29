"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminFetch } from "@/lib/api/adminFetch";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import { ProblemImageEditor } from "@/components/student/ProblemImageEditor";
import {
  blobToBase64,
  dataUrlToBlob,
  normalizeImageBlob,
  renderPdfPage,
  rotateImageBlob,
  type NormalizedImage,
  type PreparedProblemImage,
} from "@/lib/images/problemImage";

type Extracted = {
  rawTranscription?: string;
  problemText: string;
  options?: Array<{ label: string; text: string }>;
  figureDescription?: string;
  subject: string;
  unit: string;
  concept: string;
  difficulty: string;
  keywords: string[];
  recognition?: {
    complete: boolean;
    confidence: number;
    visibleOptionCount: number;
    missingParts: string[];
    notes: string;
  };
};

type Option = { id: string; label: string; text: string; contentType?: string | null; image?: string | null };

type MatchItem = {
  id: string;
  subject: string;
  unit: string;
  concept: string;
  difficulty: string;
  question: string;
  content_type: string | null;
  question_image: string | null;
  options: Option[];
  correct_option_id: string;
  explanation: string;
  explanation_content_type: string | null;
  explanation_image: string | null;
  question_type: "multiple_choice" | "subjective";
  answer_text: string | null;
};

type ChatTurn = { role: "user" | "assistant"; content: string };
type AnswerState = { selected: string | null; revealed: boolean };

type ImageSource = NormalizedImage & {
  url: string;
  name: string;
  pdfFile?: File;
  pageNumber?: number;
  pageCount?: number;
};

function hasExtension(file: File, extensions: string[]): boolean {
  const name = file.name.toLowerCase();
  return extensions.some((extension) => name.endsWith(extension));
}

export function AiSearchClient() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<ImageSource | null>(null);
  const [prepared, setPrepared] = useState<PreparedProblemImage | null>(null);
  const [inputLoading, setInputLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recognitionWarning, setRecognitionWarning] = useState("");
  const [extracted, setExtracted] = useState<Extracted | null>(null);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});

  // 업로드 문제에 대한 AI 풀이
  const [solution, setSolution] = useState<string | null>(null);
  const [solving, setSolving] = useState(false);
  const [withSolution, setWithSolution] = useState(false);

  // AI 튜터 채팅
  const [chat, setChat] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [asking, setAsking] = useState(false);

  const debugImages = process.env.NODE_ENV !== "production";

  function clearResults() {
    setExtracted(null);
    setMatches([]);
    setAnswers({});
    setChat([]);
    setSolution(null);
    setRecognitionWarning("");
  }

  const commitSource = useCallback(
    (
      image: NormalizedImage,
      name: string,
      pdf?: { file: File; pageNumber: number; pageCount: number }
    ) => {
      const url = URL.createObjectURL(image.blob);
      setSource({
        ...image,
        url,
        name,
        pdfFile: pdf?.file,
        pageNumber: pdf?.pageNumber,
        pageCount: pdf?.pageCount,
      });
      setPrepared(null);
      clearResults();
    },
    []
  );

  const loadFile = useCallback(
    async (file: File | null) => {
      if (!file) return;
      setInputLoading(true);
      setError("");
      try {
        if (hasExtension(file, [".hwp", ".hwpx"])) {
          throw new Error(
            "HWP/HWPX 원본은 브라우저에서 직접 열 수 없습니다. 한컴오피스에서 PDF 또는 PNG/JPG로 내보낸 뒤 업로드해 주세요."
          );
        }

        const isPdf = file.type === "application/pdf" || hasExtension(file, [".pdf"]);
        if (isPdf) {
          const page = await renderPdfPage(file, 1);
          commitSource(page, file.name, {
            file,
            pageNumber: page.pageNumber,
            pageCount: page.pageCount,
          });
          return;
        }

        const image = await normalizeImageBlob(file);
        commitSource(image, file.name || "clipboard-image.png");
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "이미지를 읽지 못했습니다.");
      } finally {
        setInputLoading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [commitSource]
  );

  useEffect(() => {
    return () => {
      if (source?.url) URL.revokeObjectURL(source.url);
    };
  }, [source]);

  async function loadPdfPage(pageNumber: number) {
    if (!source?.pdfFile || inputLoading) return;
    setInputLoading(true);
    setError("");
    try {
      const page = await renderPdfPage(source.pdfFile, pageNumber);
      commitSource(page, source.name, {
        file: source.pdfFile,
        pageNumber: page.pageNumber,
        pageCount: page.pageCount,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "PDF 페이지를 읽지 못했습니다.");
    } finally {
      setInputLoading(false);
    }
  }

  async function rotateSource() {
    if (!source || inputLoading) return;
    setInputLoading(true);
    setError("");
    try {
      const rotated = await rotateImageBlob(source.blob);
      commitSource(rotated, source.name, source.pdfFile && source.pageNumber && source.pageCount
        ? { file: source.pdfFile, pageNumber: source.pageNumber, pageCount: source.pageCount }
        : undefined);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "이미지를 회전하지 못했습니다.");
    } finally {
      setInputLoading(false);
    }
  }

  // 클립보드 붙여넣기(Ctrl+V)
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const clipboard = e.clipboardData;
      if (!clipboard) return;

      const files = Array.from(clipboard.files);
      const pastedFile = files.find(
        (file) =>
          file.type.startsWith("image/") ||
          file.type === "application/pdf" ||
          hasExtension(file, [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff", ".pdf"])
      );
      if (pastedFile) {
        e.preventDefault();
        void loadFile(pastedFile);
        return;
      }

      for (const item of Array.from(clipboard.items)) {
        if (item.kind !== "file") continue;
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          void loadFile(file);
          return;
        }
      }

      const html = clipboard.getData("text/html");
      const src = html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
      if (!src) return;
      e.preventDefault();
      void dataUrlToBlob(src)
        .then((blob) => new File([blob], "clipboard-image", { type: blob.type || "image/png" }))
        .then(loadFile)
        .catch(() => setError("클립보드 이미지를 읽지 못했습니다. 이미지 파일로 저장한 뒤 업로드해 주세요."));
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [loadFile]);

  async function solve(problem: Extracted) {
    setSolving(true);
    setSolution(null);
    try {
      const res = await adminFetch("/api/search/solve", {
        method: "POST",
        body: JSON.stringify({ problem }),
      });
      const json = await res.json();
      setSolution(json.ok ? (json.solution as string) : `⚠️ ${json.message ?? "풀이를 불러오지 못했어요."}`);
    } catch {
      setSolution("⚠️ 풀이를 불러오지 못했어요.");
    } finally {
      setSolving(false);
    }
  }

  async function runSearch() {
    if (!prepared || loading) return;
    setLoading(true);
    setError("");
    setRecognitionWarning("");
    setExtracted(null);
    setMatches([]);
    setAnswers({});
    setChat([]);
    setSolution(null);
    try {
      const base64 = await blobToBase64(prepared.blob);
      if (debugImages) {
        console.groupCollapsed("[AI search image]");
        console.table({
          cropWidth: prepared.cropSize.width,
          cropHeight: prepared.cropSize.height,
          outputWidth: prepared.outputSize.width,
          outputHeight: prepared.outputSize.height,
          mimeType: prepared.mediaType,
          bytes: prepared.blob.size,
        });
        console.log("selection", prepared.selection);
        console.log("preprocessing", prepared.preprocessing);
        console.groupEnd();
      }
      const res = await adminFetch("/api/search", {
        method: "POST",
        body: JSON.stringify({
          imageBase64: base64,
          mediaType: prepared.mediaType,
          debug: debugImages
            ? {
                selection: prepared.selection,
                cropSize: prepared.cropSize,
                outputSize: prepared.outputSize,
                preprocessing: prepared.preprocessing,
              }
            : undefined,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.message ?? "검색에 실패했습니다.");
        return;
      }
      const ex = json.extracted as Extracted;
      setExtracted(ex);
      setRecognitionWarning(typeof json.recognitionWarning === "string" ? json.recognitionWarning : "");
      setMatches((json.matches ?? []) as MatchItem[]);
      // 토글이 켜져 있을 때만 검색과 함께 AI 풀이 생성
      if (withSolution) solve(ex);
    } catch (e) {
      setError(e instanceof Error ? e.message : "검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function selectOption(id: string, optId: string) {
    setAnswers((prev) => {
      const cur = prev[id];
      if (cur?.revealed) return prev;
      return { ...prev, [id]: { selected: optId, revealed: false } };
    });
  }

  function reveal(id: string) {
    setAnswers((prev) => ({ ...prev, [id]: { selected: prev[id]?.selected ?? null, revealed: true } }));
  }

  async function ask() {
    const q = input.trim();
    if (!q || asking || !extracted) return;
    const next = [...chat, { role: "user" as const, content: q }];
    setChat(next);
    setInput("");
    setAsking(true);
    try {
      const recommendations = matches.map((m, i) => ({
        n: i + 1,
        question: m.question,
        answer:
          m.question_type === "subjective"
            ? m.answer_text ?? ""
            : m.options?.find((o) => o.id === m.correct_option_id)?.label ?? m.correct_option_id,
        explanation: m.explanation,
      }));
      const res = await adminFetch("/api/search/ask", {
        method: "POST",
        body: JSON.stringify({
          problem: {
            problemText: extracted.problemText,
            rawTranscription: extracted.rawTranscription,
            options: extracted.options?.map((option) => `${option.label} ${option.text}`).join("\n"),
            figureDescription: extracted.figureDescription,
            subject: extracted.subject,
            unit: extracted.unit,
            solution: solution && !solution.startsWith("⚠️") ? solution : undefined,
            recommendations,
          },
          messages: next,
        }),
      });
      const json = await res.json();
      setChat([
        ...next,
        { role: "assistant", content: json.ok ? (json.answer as string) : `⚠️ ${json.message ?? "응답 실패"}` },
      ]);
    } catch {
      setChat([...next, { role: "assistant", content: "⚠️ 네트워크 오류로 답변을 받지 못했어요." }]);
    } finally {
      setAsking(false);
    }
  }

  return (
    <main className={`mx-auto px-5 py-10 ${extracted ? "max-w-6xl" : "max-w-3xl"}`}>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-2xl bg-[#0D1F3C] text-3xl">
          🔍
        </div>
        <h1 className="text-2xl font-black text-ink">AI 문제 검색</h1>
        <p className="mt-1 text-sm text-slate-500">
          문제를 캡쳐해 올리면 AI 풀이와 비슷한 문제를 찾아주고, 풀이도 물어볼 수 있어요.
        </p>
      </div>

      <div className={extracted ? "lg:flex lg:items-start lg:gap-6" : ""}>
        <div className={extracted ? "lg:min-w-0 lg:flex-1" : ""}>
          {/* 업로드 */}
          <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf,.pdf,.hwp,.hwpx"
              className="hidden"
              onChange={(e) => void loadFile(e.target.files?.[0] ?? null)}
            />
            {source ? (
              <div className="space-y-3">
                {source.pdfFile && source.pageNumber && source.pageCount ? (
                  <div className="flex items-center justify-between rounded-lg border border-line bg-slate-50 px-3 py-2">
                    <button
                      type="button"
                      disabled={inputLoading || source.pageNumber <= 1}
                      onClick={() => void loadPdfPage(source.pageNumber! - 1)}
                      className="rounded border border-line bg-white px-3 py-1.5 text-xs font-black disabled:opacity-40"
                    >
                      이전 페이지
                    </button>
                    <span className="text-xs font-bold text-slate-600">
                      PDF {source.pageNumber} / {source.pageCount} 페이지
                    </span>
                    <button
                      type="button"
                      disabled={inputLoading || source.pageNumber >= source.pageCount}
                      onClick={() => void loadPdfPage(source.pageNumber! + 1)}
                      className="rounded border border-line bg-white px-3 py-1.5 text-xs font-black disabled:opacity-40"
                    >
                      다음 페이지
                    </button>
                  </div>
                ) : null}
                <ProblemImageEditor
                  sourceBlob={source.blob}
                  sourceUrl={source.url}
                  sourceSize={{ width: source.width, height: source.height }}
                  sourceMeta={{
                    sourceWidth: source.sourceWidth,
                    sourceHeight: source.sourceHeight,
                    sourceType: source.sourceType,
                    scaledDown: source.scaledDown,
                  }}
                  debug={debugImages}
                  onPrepared={setPrepared}
                  onRotate={() => void rotateSource()}
                />
                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-line px-3 py-2.5">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-slate-600">🧠 AI 풀이도 함께 생성</span>
                  <input
                    type="checkbox"
                    checked={withSolution}
                    onChange={(e) => setWithSolution(e.target.checked)}
                    className="size-4 accent-mint-600"
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex-1 rounded-md border border-line py-2.5 text-sm font-black text-slate-600 hover:bg-slate-50"
                  >
                    다른 파일
                  </button>
                  <button
                    type="button"
                    onClick={runSearch}
                    disabled={loading || inputLoading || !prepared}
                    className="flex-[2] rounded-md bg-brand-600 py-2.5 text-sm font-black text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    {loading ? "분석 중..." : inputLoading || !prepared ? "이미지 준비 중..." : "이 문제로 검색"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center hover:border-brand-400"
              >
                <span className="text-3xl">📷</span>
                <span className="text-sm font-bold text-slate-600">
                  {inputLoading ? "문서를 읽는 중입니다..." : "문제 이미지나 PDF를 업로드하거나 붙여넣으세요"}
                </span>
                <span className="text-xs text-slate-400">
                  PNG · JPG · WEBP · PDF · 클립보드 붙여넣기(Ctrl+V)
                </span>
                <span className="text-[11px] text-slate-400">HWP/HWPX는 한컴오피스에서 PDF 또는 이미지로 내보내 주세요.</span>
              </button>
            )}
          </section>

          {error ? (
            <div className="mt-4 rounded-md bg-coral-50 px-4 py-3 text-sm font-bold text-coral-600">{error}</div>
          ) : null}
          {recognitionWarning ? (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              {recognitionWarning}
            </div>
          ) : null}

          {/* 인식된 문제 */}
          {extracted ? (
            <section className="mt-6 rounded-2xl border border-brand-200 bg-brand-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-brand-600">인식된 문제</p>
              <div className="mt-2 text-sm leading-7 text-ink">
                <ContentRenderer contentType="latex" text={extracted.problemText} />
              </div>
              {extracted.options?.length ? (
                <div className="mt-3 space-y-1 rounded-lg border border-brand-100 bg-white/70 p-3 text-sm text-ink">
                  {extracted.options.map((option, index) => (
                    <div key={`${option.label}-${index}`} className="flex gap-2">
                      <span className="font-black text-brand-700">{option.label}</span>
                      <ContentRenderer contentType="latex" text={option.text} />
                    </div>
                  ))}
                </div>
              ) : null}
              {extracted.figureDescription ? (
                <p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-xs leading-6 text-slate-600">
                  그림/표: {extracted.figureDescription}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[extracted.subject, extracted.unit, extracted.concept, extracted.difficulty]
                  .filter(Boolean)
                  .map((t, i) => (
                    <span key={i} className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-brand-700 ring-1 ring-brand-200">
                      {t}
                    </span>
                  ))}
              </div>
            </section>
          ) : null}

          {/* AI 풀이 */}
          {extracted ? (
            <section data-print-section="true" className="mt-6 rounded-2xl border border-mint-200 bg-white shadow-soft">
              <div className="flex items-center gap-2 border-b border-line bg-mint-50 px-5 py-3">
                <span className="text-lg">🧠</span>
                <p className="text-sm font-black text-mint-800">AI 풀이</p>
              </div>
              <div className="px-5 py-4 text-sm leading-7 text-ink">
                {solving ? (
                  <p className="py-4 text-center text-xs text-slate-400">AI가 풀이를 작성 중이에요...</p>
                ) : solution ? (
                  <ContentRenderer contentType="latex" text={solution} />
                ) : (
                  <button
                    type="button"
                    onClick={() => solve(extracted)}
                    className="w-full rounded-md bg-mint-600 py-2.5 text-sm font-black text-white hover:bg-mint-700"
                  >
                    🧠 AI 풀이 생성하기
                  </button>
                )}
              </div>
            </section>
          ) : null}

          {/* 추천 문제 (직접 풀어보기) */}
          {extracted ? (
            <section className="mt-6">
              <h2 className="mb-3 text-lg font-black text-ink">추천 문제 {matches.length > 0 ? `(${matches.length})` : ""}</h2>
              {matches.length === 0 ? (
                <div className="rounded-xl border border-line bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">
                  같은 유형(개념)의 등록 문제가 없어요. 오른쪽 AI 튜터에게 풀이를 물어보세요.
                </div>
              ) : (
                <ul className="space-y-3">
                  {matches.map((m, i) => {
                    const a = answers[m.id] ?? { selected: null, revealed: false };
                    const correct = m.options?.find((o) => o.id === m.correct_option_id);
                    const isMC = m.question_type !== "subjective" && Array.isArray(m.options) && m.options.length > 0;
                    const isRight = a.selected === m.correct_option_id;
                    return (
                      <li
                        key={m.id}
                        data-print-card="true"
                        className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft"
                      >
                        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-slate-50 px-4 py-2.5 text-xs">
                          <span className="rounded-full bg-brand-600 px-2.5 py-0.5 font-black text-white">문제 {i + 1}</span>
                          <span className="rounded-full bg-white px-2 py-0.5 font-bold text-slate-600 ring-1 ring-line">{m.subject}</span>
                          <span className="rounded-full bg-white px-2 py-0.5 font-bold text-slate-600 ring-1 ring-line">{m.unit}</span>
                          {m.concept ? <span className="rounded-full bg-white px-2 py-0.5 font-bold text-slate-600 ring-1 ring-line">{m.concept}</span> : null}
                        </div>
                        <div className="px-4 py-4">
                          <ContentRenderer
                            contentType={(m.content_type as "latex" | "image" | "mixed" | null) ?? "latex"}
                            text={m.question}
                            image={m.question_image ?? undefined}
                            imageAlt="문제"
                            className="text-sm font-semibold leading-7 text-ink"
                          />

                          {/* 보기 (직접 선택) */}
                          {isMC ? (
                            <div className="mt-3 space-y-2">
                              {m.options.map((opt) => {
                                const isSelected = a.selected === opt.id;
                                const isCorrect = opt.id === m.correct_option_id;
                                let ring = "border-line bg-white hover:border-brand-400";
                                if (a.revealed && isCorrect) ring = "border-mint-500 bg-mint-50";
                                else if (a.revealed && isSelected && !isCorrect) ring = "border-coral-300 bg-coral-50";
                                else if (isSelected) ring = "border-brand-500 bg-brand-50";
                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => selectOption(m.id, opt.id)}
                                    disabled={a.revealed}
                                    className={`flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left transition ${ring} disabled:cursor-default`}
                                  >
                                    <span
                                      className={`grid size-6 shrink-0 place-items-center rounded-md text-xs font-black ${
                                        a.revealed && isCorrect
                                          ? "bg-mint-500 text-white"
                                          : isSelected
                                            ? "bg-brand-600 text-white"
                                            : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {opt.label}
                                    </span>
                                    <ContentRenderer
                                      contentType={(opt.contentType as "latex" | "image" | "mixed" | null) ?? "latex"}
                                      text={opt.text}
                                      image={opt.image ?? undefined}
                                      imageAlt={`보기 ${opt.label}`}
                                      className="flex-1 text-sm leading-7 text-ink"
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          ) : null}

                          {!a.revealed ? (
                            <button
                              type="button"
                              onClick={() => reveal(m.id)}
                              disabled={isMC && !a.selected}
                              className="mt-3 w-full rounded-md bg-brand-600 py-2 text-sm font-black text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {isMC ? "정답 확인" : "정답·해설 보기"}
                            </button>
                          ) : (
                            <div data-print-card="true" className="mt-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
                              {isMC ? (
                                <p className={`text-sm font-black ${isRight ? "text-mint-700" : "text-coral-600"}`}>
                                  {isRight ? "정답입니다! 🎉" : "오답이에요."} 정답: {correct?.label ?? m.correct_option_id}
                                </p>
                              ) : (
                                <p className="text-sm font-bold text-ink">정답: {m.answer_text ?? "—"}</p>
                              )}
                              <p className="mt-2 text-xs font-black text-brand-600">해설</p>
                              <div className="mt-0.5 text-sm leading-7 text-ink">
                                <ContentRenderer
                                  contentType={(m.explanation_content_type as "latex" | "image" | "mixed" | null) ?? "latex"}
                                  text={m.explanation}
                                  image={m.explanation_image ?? undefined}
                                  imageAlt="해설"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ) : null}
        </div>

        {/* 오른쪽: AI 튜터 (검색 후 표시) */}
        {extracted ? (
          <div className="mt-6 lg:mt-0 lg:w-96 lg:shrink-0">
            <div className="lg:sticky lg:top-4">
              <section className="rounded-2xl border border-line bg-white shadow-soft">
                <div className="flex items-center gap-2 border-b border-line bg-[#0D1F3C] px-4 py-3">
                  <span className="text-lg">🤖</span>
                  <div>
                    <p className="text-sm font-black text-white">AI 튜터에게 질문</p>
                    <p className="text-[11px] text-slate-300">&ldquo;3번 문제 풀어줘&rdquo; 처럼 번호로 물어볼 수 있어요</p>
                  </div>
                </div>
                <div className="h-[55vh] space-y-3 overflow-y-auto px-4 py-4">
                  {chat.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-400">
                      예: &ldquo;이 문제 풀이 알려줘&rdquo;, &ldquo;2번 문제 어떻게 풀어?&rdquo;
                    </p>
                  ) : (
                    chat.map((m, i) => (
                      <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-7 ${
                            m.role === "user"
                              ? "rounded-br-sm bg-brand-600 text-white"
                              : "rounded-bl-sm bg-slate-200/70 text-slate-800 dark:bg-slate-700 dark:text-slate-50"
                          }`}
                        >
                          {m.role === "assistant" ? <ContentRenderer contentType="latex" text={m.content} /> : m.content}
                        </div>
                      </div>
                    ))
                  )}
                  {asking ? <p className="text-center text-xs text-slate-400">답변 작성 중...</p> : null}
                </div>
                <div className="border-t border-line p-2">
                  <div className="flex items-center gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          ask();
                        }
                      }}
                      placeholder="풀이에 대해 질문하기"
                      className="min-w-0 flex-1 rounded-full border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
                    />
                    <button
                      type="button"
                      onClick={ask}
                      disabled={asking || !input.trim()}
                      className="shrink-0 rounded-full bg-brand-600 px-4 py-2 text-sm font-black text-white hover:bg-brand-700 disabled:opacity-40"
                    >
                      전송
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
