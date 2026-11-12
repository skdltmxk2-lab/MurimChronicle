"use client";

import { useEffect, useMemo, useState, type RefObject } from "react";
import { fixedPrintPages, packPrintPages, type PrintPagePlan } from "@/lib/admin/printPaginationCore.mjs";
import { buildPrintGeometryCss } from "@/lib/homework/printGeometryCss";
import type { QuestionRecord } from "@/types/question";

/**
 * 문제지 페이지를 문항 높이에 맞춰 나눈다.
 *
 * 화면 미리보기는 인쇄와 글자 크기·폭이 달라서 화면에서 잰 높이는 쓸 수 없다. 그래서 화면 밖에
 * 인쇄 지오메트리(210mm 폭, 8pt, 단 폭)를 갖춘 호스트를 잠깐 만들고, 이미 그려진 문항을 복제해
 * 넣어 실제 높이를 잰다. 잰 결과를 packPrintPages 에 넣어 "어느 문항이 어느 단·장에 가는가" 를
 * 정한다. 모두 들어가는 문제지는 예전과 같은 3 + 3 구성이고, 긴 문항이 있을 때만 달라진다.
 *
 * 같은 문제지가 두 경로로 출력된다. 브라우저 인쇄(문제지 PDF 저장)는 화면용 글꼴 규칙이 빠진
 * 문서 기본 글꼴로 찍히고, 숙제 PDF(pdf-builder)는 화면 모드의 body 글꼴로 찍힌다. 머릿말
 * 규칙도 서로 조금 다르다. 그래서 두 조건에서 모두 재고 문항은 더 큰 높이, 단은 더 작은 높이를 쓴다.
 */

/** 인쇄 때 줄바꿈이 조금 달라져도 맨 아래 문항이 잘리지 않도록 남기는 여유(px, 약 1.6mm). */
const SAFETY_PX = 6;
/** 머릿말 높이를 아직 못 쟀을 때(방금 입력한 직후)의 보수적인 가정(px, 약 12mm). */
const FALLBACK_HEADER_PX = 46;
const ASSET_WAIT_MS = 8000;

export type PrintLayout = {
  pages: PrintPagePlan[];
  /** 아직 실제 높이로 확정되지 않은 임시 구성이다. 이 동안 PDF 저장은 막는 편이 안전하다. */
  pending: boolean;
  /** 빈 단에 혼자 놓아도 안 들어가는 문항 인덱스. 인쇄하면 잘린다. */
  oversize: number[];
};

/** 지금까지 잰 결과. 문항 높이는 내용 키(measureKey)별로 두어, 바뀐 문항만 다시 잰다. */
type MeasureCache = {
  /** 글꼴 환경. 디자인을 바꿔 글꼴이 달라지면 지난 높이는 버린다. */
  env: string;
  columnHeight: number;
  gap: number;
  heights: Record<string, number>;
};

/** "print": 브라우저 인쇄와 같은 조건, "capture": 숙제 PDF 캡처와 같은 조건. */
type MeasureVariant = "print" | "capture";
const VARIANTS: MeasureVariant[] = ["print", "capture"];

const MEASURE_ATTR = "data-coaching-print-measure";
const MEASURE_STYLE_ATTR = "data-coaching-print-measure-style";

/**
 * 측정 호스트용 규칙은 처음 한 번만 문서에 넣고 계속 둔다. 규칙이 호스트 안에서만 적용되도록
 * 범위를 잡아 두었으므로 다른 화면에는 영향이 없다. 잴 때마다 <style> 을 넣고 빼면 (특히
 * `scope *` 규칙 때문에) 문서 전체 스타일을 다시 계산하게 된다.
 */
function ensureMeasureStyle() {
  if (document.head.querySelector(`style[${MEASURE_STYLE_ATTR}]`)) return;
  const scope = `[${MEASURE_ATTR}]`;
  const style = document.createElement("style");
  style.setAttribute(MEASURE_STYLE_ATTR, "");
  // print 조건의 머릿말은 AdminCoachingClient 의 @media print 규칙(8.5pt, 줄바꿈 유지)과 같게 둔다.
  // capture 조건은 buildPrintGeometryCss 그대로(= pdf-builder 와 같음)다.
  style.textContent = `${buildPrintGeometryCss(scope)}
${scope} .measure-print .coaching-page-custom-header {
  display: block !important; font-size: 8.5pt !important; line-height: 1.35 !important;
  margin: 0 0 3mm !important; min-height: 6mm !important; padding: 0 0 1.8mm !important;
  white-space: pre-wrap !important;
}
${scope} .coaching-print-grid.measure-flow .coaching-print-column { display: block !important; }
`;
  document.head.append(style);
}

/** 인쇄와 같은 지오메트리의 화면 밖 호스트. 쓰고 나면 반드시 remove() 한다. */
function createMeasureHost() {
  ensureMeasureStyle();
  const host = document.createElement("div");
  host.setAttribute(MEASURE_ATTR, "");
  host.setAttribute("aria-hidden", "true");
  Object.assign(host.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: "210mm",
    visibility: "hidden",
    pointerEvents: "none",
    zIndex: "-1",
  });
  return host;
}

/**
 * 인쇄할 때는 화면 전용(@media screen) body 글꼴 규칙이 빠지므로 페이지가 문서 루트의 글꼴을
 * 물려받는다. 화면에서 그 값은 html 요소의 글꼴과 같다.
 */
function printFontFamily() {
  return getComputedStyle(document.documentElement).fontFamily;
}

/** 화면 밖 호스트가 쓰는 두 글꼴. 이 값이 바뀌면 잰 높이를 다시 써야 한다. */
function measureEnvironment() {
  return `${printFontFamily()}\u0000${getComputedStyle(document.body).fontFamily}`;
}

function buildPage(
  host: HTMLElement,
  options: { headerText?: string; flow?: boolean; variant: MeasureVariant; printFont: string }
) {
  const page = document.createElement("div");
  page.className = "coaching-print-page";
  if (options.variant === "print") {
    page.classList.add("measure-print");
    page.style.fontFamily = options.printFont;
  }
  if (options.headerText) {
    const header = document.createElement("div");
    header.className = "coaching-page-custom-header";
    header.textContent = options.headerText;
    page.append(header);
  }
  const grid = document.createElement("div");
  grid.className = options.flow ? "coaching-print-grid measure-flow" : "coaching-print-grid";
  const left = document.createElement("div");
  left.className = "coaching-print-column coaching-print-column-left";
  const right = document.createElement("div");
  right.className = "coaching-print-column coaching-print-column-right";
  grid.append(left, right);
  page.append(grid);
  host.append(page);
  return { left, right };
}

function waitFor(promise: Promise<unknown>, timeoutMs: number) {
  return new Promise<void>((resolve) => {
    const timer = window.setTimeout(resolve, timeoutMs);
    promise.then(
      () => {
        window.clearTimeout(timer);
        resolve();
      },
      () => {
        window.clearTimeout(timer);
        resolve();
      }
    );
  });
}

function imagesSettled(root: HTMLElement): Promise<void> {
  const pending = Array.from(root.querySelectorAll("img")).filter((image) => !image.complete);
  if (pending.length === 0) return Promise.resolve();
  return new Promise((resolve) => {
    let left = pending.length;
    const done = () => {
      left -= 1;
      if (left <= 0) resolve();
    };
    for (const image of pending) {
      image.addEventListener("load", done, { once: true });
      image.addEventListener("error", done, { once: true });
    }
  });
}

function hashString(text: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

/** 그림 주소는 data URL 일 수 있어 통째로 해시하지 않고 길이와 앞뒤만 본다. */
function imageSignature(src: string | undefined) {
  return src ? `${src.length}:${src.slice(0, 48)}:${src.slice(-48)}` : "";
}

/**
 * 인쇄 높이를 좌우하는 것만 묶은 키. 같은 키면 높이도 같다고 보고 다시 재지 않는다.
 * 문항 번호 자릿수도 넣는다(번호 칸 폭이 본문 폭을 바꾼다).
 */
function measureKey(question: QuestionRecord, index: number) {
  const layout = JSON.stringify([
    question.question,
    question.contentType ?? "",
    imageSignature(question.questionImage),
    question.options.map((option) => [option.label, option.text, option.contentType ?? "", imageSignature(option.image)]),
  ]);
  return `${question.id}\u0001${String(index + 1).length}\u0001${hashString(layout)}`;
}

/**
 * 화면에 그려진 문항 중 indices 에 해당하는 것만 복제해 두 조건에서 잰다.
 * heights 는 indices 순서다. 문항 수가 다르거나 높이가 0 이면 null.
 */
async function measureQuestions(
  area: HTMLElement,
  questionCount: number,
  indices: number[],
  isCancelled: () => boolean
): Promise<{ heights: number[]; columnHeight: number; gap: number } | null> {
  const all = Array.from(area.querySelectorAll<HTMLElement>(".coaching-print-question"));
  if (all.length !== questionCount) return null;
  const sources = indices.map((index) => all[index]);

  const host = createMeasureHost();
  const printFont = printFontFamily();
  try {
    const probe = buildPage(host, { variant: "print", printFont });
    const clonesByVariant = VARIANTS.map((variant) => {
      const flow = buildPage(host, { flow: true, variant, printFont });
      return sources.map((source) => {
        const clone = source.cloneNode(true) as HTMLElement;
        clone.querySelectorAll(".admin-screen-only, button").forEach((node) => node.remove());
        // 오른쪽 단이 왼쪽보다 약간 좁으므로(구분선) 더 보수적인 폭에서 잰다.
        flow.right.append(clone);
        return clone;
      });
    });
    document.body.append(host);

    // 폰트·이미지는 레이아웃이 한 번 돌아야 받기 시작한다.
    host.getBoundingClientRect();
    await waitFor(document.fonts?.ready ?? Promise.resolve(), ASSET_WAIT_MS);
    await waitFor(imagesSettled(host), ASSET_WAIT_MS);
    if (isCancelled()) return null;

    const heights = sources.map((_, position) =>
      Math.max(...clonesByVariant.map((clones) => clones[position].getBoundingClientRect().height))
    );
    // 높이 0 은 그려지지 않았다는 뜻이다. 잘못된 값으로 나누느니 기본 구성에 맡긴다.
    if (heights.some((height) => !(height > 0))) return null;
    const columnHeight = probe.left.getBoundingClientRect().height;
    const gap = parseFloat(getComputedStyle(probe.left).rowGap) || 0;
    if (!(columnHeight > 0)) return null;
    return { heights, columnHeight, gap };
  } finally {
    host.remove();
  }
}

/** 머릿말 글이 있는 페이지의 단 높이를 글별로 잰다(두 조건 중 더 짧은 쪽). */
function measureHeaderColumnHeights(texts: string[]): Record<string, number> {
  const result: Record<string, number> = {};
  if (texts.length === 0) return result;
  const host = createMeasureHost();
  const printFont = printFontFamily();
  try {
    const columns = texts.map((headerText) =>
      VARIANTS.map((variant) => buildPage(host, { headerText, variant, printFont }).left)
    );
    document.body.append(host);
    columns.forEach((variants, index) => {
      result[texts[index]] = Math.min(...variants.map((column) => column.getBoundingClientRect().height));
    });
  } finally {
    host.remove();
  }
  return result;
}

export function usePrintPagination({
  areaRef,
  questions,
  pageHeaders,
}: {
  areaRef: RefObject<HTMLElement | null>;
  questions: QuestionRecord[];
  pageHeaders: string[];
}): PrintLayout {
  const keys = useMemo(() => questions.map(measureKey), [questions]);
  const sheetKey = useMemo(() => keys.join("\n"), [keys]);
  const [cache, setCache] = useState<MeasureCache | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const [headerColumns, setHeaderColumns] = useState<{ key: string; heights: Record<string, number> }>({
    key: "",
    heights: {},
  });

  const headerTexts = useMemo(
    () => Array.from(new Set(pageHeaders.map((text) => text.trim()).filter(Boolean))),
    [pageHeaders]
  );
  const headerKey = useMemo(() => JSON.stringify(headerTexts), [headerTexts]);
  const questionCount = keys.length;

  // 아직 높이를 모르는 문항만 잰다. 60문항 중 하나를 교체하면 그 하나만 잰다.
  useEffect(() => {
    const area = areaRef.current;
    if (!area || questionCount === 0) return;
    const env = measureEnvironment();
    const usable = cache && cache.env === env ? cache : null;
    const missing: number[] = [];
    keys.forEach((key, index) => {
      if (!((usable?.heights[key] ?? 0) > 0)) missing.push(index);
    });
    if (usable && missing.length === 0) return;

    let cancelled = false;
    measureQuestions(area, questionCount, missing, () => cancelled).then(
      (result) => {
        if (cancelled) return;
        if (!result) {
          setFailedKey(sheetKey);
          return;
        }
        // 지금 문제지에 있는 문항만 남겨 캐시가 끝없이 커지지 않게 한다.
        const heights: Record<string, number> = {};
        keys.forEach((key) => {
          const known = usable?.heights[key];
          if (known) heights[key] = known;
        });
        missing.forEach((index, position) => {
          heights[keys[index]] = result.heights[position];
        });
        setCache({ env, columnHeight: result.columnHeight, gap: result.gap, heights });
        setFailedKey(null);
      },
      () => {
        if (!cancelled) setFailedKey(sheetKey);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [areaRef, cache, keys, sheetKey, questionCount]);

  useEffect(() => {
    if (headerTexts.length === 0) return;
    setHeaderColumns({ key: headerKey, heights: measureHeaderColumnHeights(headerTexts) });
  }, [headerKey, headerTexts]);

  return useMemo(() => {
    const ready = cache !== null && keys.every((key) => (cache.heights[key] ?? 0) > 0);
    const failed = failedKey === sheetKey && !ready;
    const pending = questionCount > 0 && !ready && !failed;
    if (!cache || failed) {
      return { pages: fixedPrintPages(questionCount), pending, oversize: [] };
    }
    // 확정 전에는 아는 높이는 그대로 쓰고 모르는 문항만 단 높이의 1/3 로 가정한다. 문항 하나를
    // 교체했을 때 화면이 기본 구성으로 튀었다가 돌아오지 않게 하려는 것이다.
    const fallback = cache.columnHeight / 3;
    const heights = keys.map((key) => cache.heights[key] ?? fallback);
    const headerHeights = headerColumns.key === headerKey ? headerColumns.heights : {};
    const { pages, oversize } = packPrintPages(heights, {
      columnHeight: (pageIndex) => {
        const text = (pageHeaders[pageIndex] ?? "").trim();
        if (!text) return cache.columnHeight;
        return headerHeights[text] ?? cache.columnHeight - FALLBACK_HEADER_PX;
      },
      gap: cache.gap,
      safety: SAFETY_PX,
    });
    return { pages, pending, oversize: ready ? oversize : [] };
  }, [cache, failedKey, sheetKey, keys, questionCount, pageHeaders, headerColumns, headerKey]);
}
