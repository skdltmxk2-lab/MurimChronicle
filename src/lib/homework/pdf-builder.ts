"use client";

import { HOMEWORK_MAX_BYTES, HOMEWORK_MAX_PAGES, HOMEWORK_MAX_QUESTIONS } from "@/types/homework";

export type HomeworkPdfResult = {
  blob: Blob;
  pages: number;
  /** Indexed by displayed question number minus one; page numbers are 1-based. */
  questionPages: number[][];
};

const ASSET_TIMEOUT_MS = 25_000;
const ANSWER_SELECTOR = ".coaching-answer-print-area, .coaching-answer-sheet, .coaching-answer-item, .coaching-answer-explanation, [data-homework-answer]";
const CAPTURE_ID = "homework-question-pdf-capture";

// Match the existing coaching print stylesheet, without changing the live page
// or its dark-mode setting. Only the question sheet is mounted in this host.
const CAPTURE_CSS = `
#${CAPTURE_ID}, #${CAPTURE_ID} * { content-visibility: visible !important; contain-intrinsic-size: none !important; }
#${CAPTURE_ID} { color-scheme: light; color: #000; background: #fff; }
#${CAPTURE_ID} .admin-screen-only { display: none !important; }
#${CAPTURE_ID} .coaching-print-page {
  width: 210mm !important; height: 296mm !important; max-height: 296mm !important;
  min-height: 0 !important; padding: 12mm !important; margin: 0 !important;
  box-sizing: border-box !important; display: flex !important; flex-direction: column !important;
  border: 0 !important; border-radius: 0 !important; box-shadow: none !important;
  background: #fff !important; background-image: none !important; overflow: hidden !important;
  transform: none !important; content-visibility: visible !important; contain: none !important;
}
#${CAPTURE_ID} .coaching-print-header { display: none !important; }
#${CAPTURE_ID} .coaching-page-custom-header {
  border-bottom: 0.25mm solid #111 !important; padding: 0 0 3mm !important;
  margin: 0 !important; font-size: 10pt !important; font-weight: 900 !important;
  line-height: 1.4 !important; color: #000 !important;
}
#${CAPTURE_ID} .coaching-print-grid {
  display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  column-gap: 0 !important; flex: 1 1 auto !important; height: auto !important;
  min-height: 0 !important; padding-top: 8mm !important; box-sizing: border-box !important;
  position: relative !important; background-image: none !important;
}
#${CAPTURE_ID} .coaching-print-column {
  min-width: 0 !important; display: grid !important;
  grid-template-rows: repeat(3, minmax(max-content, 1fr)) !important;
  gap: 4mm !important; align-items: start !important;
}
#${CAPTURE_ID} .coaching-print-column-left { padding: 0 6mm 0 0 !important; }
#${CAPTURE_ID} .coaching-print-column-right { border-left: 0.35mm solid #111 !important; padding: 0 0 0 6mm !important; }
#${CAPTURE_ID} .coaching-print-divider { display: none !important; }
#${CAPTURE_ID} .coaching-print-question {
  min-height: 0 !important; overflow: visible !important; border: 0 !important;
  border-radius: 0 !important; padding: 1.6mm 0 0 !important; font-size: 8pt !important;
  line-height: 1.48 !important; background: #fff !important;
}
#${CAPTURE_ID} .coaching-print-question-body { display: flex !important; align-items: flex-start !important; gap: 2mm !important; overflow: visible !important; }
#${CAPTURE_ID} .coaching-print-question-number { flex: 0 0 auto !important; font-size: 8pt !important; line-height: 1.48 !important; }
#${CAPTURE_ID} .coaching-print-content { font-size: 8pt !important; line-height: 1.48 !important; word-break: keep-all !important; overflow-wrap: break-word !important; overflow: visible !important; }
#${CAPTURE_ID} .coaching-print-question, #${CAPTURE_ID} .coaching-print-question * { color: #000 !important; border-color: #111 !important; }
#${CAPTURE_ID} .coaching-print-question img { max-height: 36mm !important; object-fit: contain !important; }
#${CAPTURE_ID} .coaching-print-question .katex { font-size: 1em !important; white-space: normal !important; overflow: visible !important; }
#${CAPTURE_ID} .coaching-print-question :is(.katex-html, .base, .strut, .vlist-t, .vlist-r, .vlist) { overflow: visible !important; }
#${CAPTURE_ID} .coaching-print-question .katex-display { margin: 0.15em 0 !important; overflow: visible !important; text-align: left !important; }
#${CAPTURE_ID} .coaching-print-viewbox { border: 0.25mm solid #111 !important; padding: 1.8mm 2.2mm 2mm !important; margin: 1.8mm 0 1.4mm !important; background: #fff !important; }
#${CAPTURE_ID} .coaching-print-viewbox-title { margin-bottom: 1.2mm !important; }
#${CAPTURE_ID} .coaching-print-viewitems { gap: 1.2mm !important; }
#${CAPTURE_ID} .coaching-print-viewitem { gap: 1.8mm !important; }
#${CAPTURE_ID} .coaching-print-option { gap: 2mm !important; line-height: 1.45 !important; }
#${CAPTURE_ID} .coaching-print-option-label { width: 4mm !important; flex: 0 0 4mm !important; text-align: left !important; }
`;

function withTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise,
    new Promise<never>((_resolve, reject) => { timer = setTimeout(() => reject(new Error(message)), ASSET_TIMEOUT_MS); }),
  ]).finally(() => clearTimeout(timer));
}

function blobDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("문제 이미지를 변환하지 못했습니다."));
    reader.onerror = () => reject(new Error("문제 이미지를 읽지 못했습니다."));
    reader.readAsDataURL(blob);
  });
}

async function inlineImages(root: HTMLElement) {
  const cache = new Map<string, Promise<string>>();
  for (const image of Array.from(root.querySelectorAll<HTMLImageElement>("img"))) {
    const src = image.currentSrc || image.src;
    if (!src) throw new Error("문제 이미지 주소가 비어 있습니다. 해당 문제를 확인해 주세요.");
    if (!cache.has(src)) {
      cache.set(src, (async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), ASSET_TIMEOUT_MS);
        try {
          const response = await fetch(src, { mode: "cors", cache: "force-cache", signal: controller.signal });
          if (!response.ok) throw new Error("문제 이미지를 불러오지 못했습니다. 잠시 후 다시 저장해 주세요.");
          const blob = await response.blob();
          if (!blob.size) throw new Error("문제 이미지가 비어 있습니다.");
          return await blobDataUrl(blob);
        } catch {
          throw new Error("문제 이미지를 불러오지 못했습니다. 이미지 주소와 접근 권한을 확인해 주세요.");
        } finally { clearTimeout(timer); }
      })());
    }
    image.removeAttribute("srcset"); image.removeAttribute("sizes");
    image.loading = "eager";
    image.src = await cache.get(src)!;
    await withTimeout(image.decode(), "문제 이미지 준비가 지연되고 있습니다. 잠시 후 다시 저장해 주세요.");
    if (!image.naturalWidth || !image.naturalHeight) throw new Error("문제 이미지가 손상되었습니다. 해당 문제를 확인해 주세요.");
  }
}

function orderedQuestionNodes(page: HTMLElement) {
  return Array.from(page.querySelectorAll<HTMLElement>(".coaching-print-question"));
}

function getQuestionPages(pages: HTMLElement[], expectedCount?: number) {
  const questionPages: number[][] = [];
  let count = 0;
  for (const [pageIndex, page] of pages.entries()) {
    const questions = orderedQuestionNodes(page);
    if (questions.length === 0 || questions.length > 6) throw new Error("문제지 페이지 구성을 확인해 주세요. 한 페이지에는 최대 6문항이 필요합니다.");
    for (const question of questions) {
      count += 1;
      const marker = question.dataset.homeworkQuestionNumber;
      const visibleNumber = question.querySelector(".coaching-print-question-number")?.textContent?.match(/^\s*(\d+)/)?.[1];
      const number = marker || visibleNumber;
      if (number && (!/^\d+$/.test(number) || Number(number) !== count)) throw new Error("문항 번호와 현재 문제지 순서가 다릅니다. 문제지를 다시 확인해 주세요.");
      questionPages.push([pageIndex + 1]);
    }
  }
  if (count < 1 || count > HOMEWORK_MAX_QUESTIONS || (expectedCount !== undefined && count !== expectedCount)) throw new Error("모든 문항의 미리보기가 준비되지 않았습니다. 전체 문제지를 준비한 뒤 다시 저장해 주세요.");
  return questionPages;
}

function assertNoClippedQuestions(page: HTMLElement, pageIndex: number) {
  const pageRect = page.getBoundingClientRect();
  const style = getComputedStyle(page);
  const bottom = pageRect.bottom - parseFloat(style.paddingBottom);
  const tolerance = 2;
  for (const question of orderedQuestionNodes(page)) {
    const number = question.dataset.homeworkQuestionNumber || question.querySelector(".coaching-print-question-number")?.textContent?.trim() || "";
    const rect = question.getBoundingClientRect();
    const column = question.closest<HTMLElement>(".coaching-print-column");
    const columnRect = column?.getBoundingClientRect();
    const columnStyle = column ? getComputedStyle(column) : null;
    const right = columnRect ? columnRect.right - parseFloat(columnStyle?.paddingRight || "0") : pageRect.right - parseFloat(style.paddingRight);
    const left = columnRect ? columnRect.left + parseFloat(columnStyle?.paddingLeft || "0") : pageRect.left + parseFloat(style.paddingLeft);
    const visible = [question, ...Array.from(question.querySelectorAll<HTMLElement>(".coaching-print-question-body, .coaching-print-content, .coaching-print-option, .coaching-print-viewbox, .katex, img"))];
    const overflow = rect.height <= 0 || visible.some((node) => {
      const box = node.getBoundingClientRect();
      return box.width > 0 && (box.bottom > bottom + tolerance || box.right > right + tolerance || box.left < left - tolerance || node.scrollWidth > node.clientWidth + tolerance && node.clientWidth > 0);
    });
    if (overflow) throw new Error(`${pageIndex + 1}페이지 ${number} 문항이 인쇄 영역을 넘습니다. 긴 문제를 교체하거나 구성을 조정한 뒤 저장해 주세요.`);
  }
}

function canvasJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("PDF 페이지 이미지를 만들지 못했습니다.")), "image/jpeg", 0.95));
}

function assertEmbeddedFonts(root: HTMLElement, css: string) {
  // html-to-image can return an empty URL after a failed font fetch. Do not
  // silently save fallback glyphs in place of the mathematics the teacher saw.
  const urls = Array.from(css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/gi));
  if (urls.some((match) => !/^data:[^,]*,[\s\S]+/.test((match[1] ?? match[2] ?? match[3]).trim()))) {
    throw new Error("글꼴 파일을 불러오지 못했습니다. 잠시 후 다시 저장해 주세요.");
  }
  const embedded = new Set(Array.from(css.matchAll(/font-family\s*:\s*([^;}]+)/gi), (match) => match[1].trim().replace(/["']/g, "")));
  for (const node of Array.from(root.querySelectorAll<HTMLElement>(".katex, .katex *"))) {
    for (const family of getComputedStyle(node).fontFamily.split(",")) {
      const name = family.trim().replace(/["']/g, "");
      if (name.startsWith("KaTeX_") && !embedded.has(name)) throw new Error("수식 글꼴을 PDF에 포함하지 못했습니다. 잠시 후 다시 저장해 주세요.");
    }
  }
}

export async function buildHomeworkPdf(rootElement: HTMLElement): Promise<HomeworkPdfResult> {
  if (typeof document === "undefined") throw new Error("문제지 PDF는 브라우저에서 생성해 주세요.");
  if (document.getElementById(CAPTURE_ID)) throw new Error("이미 문제지 PDF를 만들고 있습니다. 완료될 때까지 기다려 주세요.");
  const area = rootElement.matches(".coaching-question-print-area") ? rootElement : rootElement.querySelector<HTMLElement>(".coaching-question-print-area");
  if (!area || area.matches(ANSWER_SELECTOR) || area.querySelector(ANSWER_SELECTOR)) throw new Error("문제지 영역만 PDF로 저장할 수 있습니다. 해답지 화면은 저장 대상이 아닙니다.");
  const sourcePages = Array.from(area.querySelectorAll<HTMLElement>("[data-coaching-print-page]"));
  if (!sourcePages.length || sourcePages.length > HOMEWORK_MAX_PAGES) throw new Error("PDF는 1~50페이지로 구성해 주세요.");
  const headerCount = sourcePages[0].querySelector(".coaching-print-header > p")?.textContent?.match(/\d+\s*\/\s*(\d+)/)?.[1];
  if (headerCount && Number(headerCount) !== sourcePages.length) throw new Error("문제지의 모든 페이지가 준비되지 않았습니다. 전체 미리보기를 준비한 뒤 다시 저장해 주세요.");
  const countMarker = area.dataset.homeworkQuestionCount || rootElement.dataset.homeworkQuestionCount;
  const expectedCount = countMarker ? Number(countMarker) : undefined;
  if (expectedCount !== undefined && (!Number.isInteger(expectedCount) || expectedCount < 1)) throw new Error("문항 수 정보를 확인해 주세요.");

  const host = document.createElement("div");
  host.id = CAPTURE_ID;
  host.setAttribute("aria-hidden", "true");
  Object.assign(host.style, { position: "fixed", left: "-10000px", top: "0", width: "210mm", pointerEvents: "none", zIndex: "-1" });
  const css = document.createElement("style"); css.textContent = CAPTURE_CSS; host.append(css);
  const pages = sourcePages.map((source) => {
    const clone = source.cloneNode(true) as HTMLElement;
    clone.removeAttribute("id"); clone.removeAttribute("data-coaching-cv");
    clone.querySelectorAll(".admin-screen-only, button, input, textarea, select, script, iframe, object, embed").forEach((node) => node.remove());
    host.append(clone);
    return clone;
  });
  document.body.append(host);
  try {
    const [{ toCanvas, getFontEmbedCSS }, { PDFDocument, PageSizes }] = await Promise.all([import("html-to-image"), import("pdf-lib")]);
    await withTimeout(document.fonts.ready, "수식과 글꼴 준비가 지연되고 있습니다. 다시 저장해 주세요.");
    await inlineImages(host);
    const questionPages = getQuestionPages(pages, expectedCount);
    const fontEmbedCSS = await withTimeout(getFontEmbedCSS(host, { preferredFontFormat: "woff2", includeQueryParams: true }), "글꼴을 PDF에 포함하지 못했습니다. 잠시 후 다시 저장해 주세요.");
    assertEmbeddedFonts(host, fontEmbedCSS);
    const pdf = await PDFDocument.create();
    pdf.setTitle("루트편입 숙제 문제지");
    pdf.setCreator("루트편입 CBT");
    for (const [pageIndex, node] of pages.entries()) {
      assertNoClippedQuestions(node, pageIndex);
      const canvas = await withTimeout(toCanvas(node, {
        backgroundColor: "#ffffff", pixelRatio: 2.5, fontEmbedCSS, includeQueryParams: true, skipAutoScale: false,
        filter: (element) => !(element instanceof HTMLElement && (element.matches(ANSWER_SELECTOR) || element.classList.contains("admin-screen-only"))),
        onImageErrorHandler: () => { throw new Error("PDF에 문제 이미지를 포함하지 못했습니다. 해당 문제를 확인해 주세요."); },
      }), `${pageIndex + 1}페이지 PDF 생성이 지연되고 있습니다. 잠시 후 다시 저장해 주세요.`);
      if (!canvas.width || !canvas.height) throw new Error("빈 PDF 페이지가 생성되었습니다. 문제지를 다시 확인해 주세요.");
      const jpeg = await canvasJpeg(canvas);
      const image = await pdf.embedJpg(await jpeg.arrayBuffer());
      const page = pdf.addPage(PageSizes.A4);
      const width = page.getWidth();
      const height = width * canvas.height / canvas.width;
      if (height > page.getHeight() + 1) throw new Error("PDF 페이지 크기가 A4를 넘습니다. 문제지 구성을 확인해 주세요.");
      page.drawImage(image, { x: 0, y: Math.max(0, page.getHeight() - height), width, height });
      canvas.width = 0; canvas.height = 0;
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
    const bytes = await pdf.save();
    const blob = new Blob([Uint8Array.from(bytes)], { type: "application/pdf" });
    if (!blob.size || blob.size > HOMEWORK_MAX_BYTES) throw new Error("생성한 PDF가 15MB를 넘습니다. 문항 수를 줄여 다시 저장해 주세요.");
    return { blob, pages: pages.length, questionPages };
  } finally { host.remove(); }
}
