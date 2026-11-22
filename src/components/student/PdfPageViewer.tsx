"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from "pdfjs-dist";

const MAX_PAGE_WIDTH = 1350;

export function PdfPageViewer({ file, title }: { file: Blob; title: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pageAreaRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [renderedPage, setRenderedPage] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let loadingTask: PDFDocumentLoadingTask | undefined;

    async function open() {
      try {
        const parserUrl = new URL("pdfjs-dist/legacy/build/pdf.min.mjs", import.meta.url).toString();
        const pdfjs: typeof import("pdfjs-dist/legacy/build/pdf.mjs") = await import(/* webpackIgnore: true */ parserUrl);
        const bytes = new Uint8Array(await file.arrayBuffer());
        if (!active) return;
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
        loadingTask = pdfjs.getDocument({ data: bytes, isEvalSupported: false });
        const document = await loadingTask.promise;
        if (active) setPdf(document);
      } catch {
        if (active) setError("문제지를 불러오지 못했습니다. 목록으로 돌아가 다시 열어 주세요.");
      }
    }

    void open();
    return () => {
      active = false;
      void loadingTask?.destroy().catch(() => {});
    };
  }, [file]);

  useEffect(() => {
    const visibleCanvas = canvasRef.current;
    if (!pdf || !visibleCanvas) return;
    let active = true;
    let renderTask: RenderTask | undefined;

    async function draw() {
      if (!pdf || !visibleCanvas) return;
      try {
        const pdfPage = await pdf.getPage(page);
        if (!active) return;
        const original = pdfPage.getViewport({ scale: 1 });
        const viewport = pdfPage.getViewport({ scale: MAX_PAGE_WIDTH / original.width });
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = Math.ceil(viewport.width);
        pageCanvas.height = Math.ceil(viewport.height);
        renderTask = pdfPage.render({ canvas: pageCanvas, viewport, background: "#fff" });
        await renderTask.promise;
        if (!active) return;

        visibleCanvas.width = pageCanvas.width;
        visibleCanvas.height = pageCanvas.height;
        const context = visibleCanvas.getContext("2d");
        if (!context) throw new Error("Canvas unavailable");
        context.drawImage(pageCanvas, 0, 0);
        setRenderedPage(page);
      } catch {
        if (active) setError("이 페이지를 표시하지 못했습니다. 다른 페이지를 선택하거나 PDF를 다운로드해 주세요.");
      }
    }

    void draw();
    return () => {
      active = false;
      renderTask?.cancel();
    };
  }, [pdf, page]);

  function movePage(step: number) {
    if (!pdf) return;
    setError("");
    setPage((current) => Math.max(1, Math.min(pdf.numPages, current + step)));
    if (pageAreaRef.current) pageAreaRef.current.scrollTop = 0;
  }

  const pageVisible = renderedPage === page && !error;

  return (
    <div className="space-y-2">
      {pdf && (
        <div className="flex items-center justify-between gap-2" role="group" aria-label="문제지 페이지 이동">
          <button
            type="button"
            className="tz-study-button tz-study-button-quiet"
            disabled={page === 1}
            onClick={() => movePage(-1)}
          >
            이전 페이지
          </button>
          <p className="text-sm tabular-nums" aria-live="polite">{page} / {pdf.numPages}</p>
          <button
            type="button"
            className="tz-study-button tz-study-button-quiet"
            disabled={page === pdf.numPages}
            onClick={() => movePage(1)}
          >
            다음 페이지
          </button>
        </div>
      )}
      <div ref={pageAreaRef} className="tz-study-school-mock-page">
        {error ? (
          <p className="p-4 text-sm tz-study-accent" role="alert">{error}</p>
        ) : !pageVisible && (
          <p className="p-4 text-sm tz-study-muted" role="status">문제지를 불러오는 중…</p>
        )}
        <canvas ref={canvasRef} aria-label={`${title} ${page}페이지`} role="img" hidden={!pageVisible} />
      </div>
    </div>
  );
}
