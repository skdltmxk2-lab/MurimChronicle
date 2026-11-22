"use client";

import katex from "katex";
import { Fragment, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { breakStatementLists, splitRenderBlocks } from "@/lib/math/viewBlocks.mjs";

type KaTeXRendererProps = {
  content: string;
  className?: string;
  viewBoxes?: boolean;
  expandWideMath?: boolean;
};

type Segment = {
  text: string;
  math: boolean;
  display: boolean;
};

type RenderedSegment = Segment | (Segment & { html: string }) | (Segment & { underline: string });
type RenderBlock = {
  type: "normal" | "view";
  text: string;
  showTitle?: boolean;
};
type RenderedBlock = RenderBlock & {
  segments: RenderedSegment[];
};
type RawSegment = Segment & {
  raw: string;
};

const MATH_PATTERN = /((?<!\\)\$\$[\s\S]+?(?<!\\)\$\$|(?<!\\)\$[\s\S]+?(?<!\\)\$)/g;
const LONG_INLINE_MATH = 160;
const TEXT_UNDERLINE = /^\\underline\{\\text\{([^{}\\]+)\}\}$/;

function ResponsiveFormula({ html, display, expandable }: { html: string; display: boolean; expandable: boolean }) {
  const frameRef = useRef<HTMLSpanElement>(null);
  const formulaRef = useRef<HTMLSpanElement>(null);
  const [fit, setFit] = useState<{ width: number; height: number; scale: number } | null>(null);

  useLayoutEffect(() => {
    const container = frameRef.current?.parentElement;
    const formula = formulaRef.current;
    if (!container || !formula) return;

    const measure = () => {
      const available = container.clientWidth;
      const width = formula.offsetWidth;
      if (available <= 1 || width <= available) {
        setFit(null);
        return;
      }

      const scale = (available - 1) / width;
      const height = Math.ceil(formula.offsetHeight * scale);
      setFit((current) => current?.width === available - 1 && current.height === height && current.scale === scale
        ? current
        : { width: available - 1, height, scale });
    };

    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(formula);
    return () => observer.disconnect();
  }, [html]);

  const block = display || Boolean(fit);

  return (
    <>
      <span
        ref={frameRef}
        className={`cbt-math-formula max-w-full ${block ? "my-2 block text-center [&_.katex-display]:my-0" : "inline-block align-baseline"}`}
      >
        <span
          className={`relative inline-block${fit ? " overflow-x-clip" : ""}`}
          style={fit ? { width: fit.width, height: fit.height } : undefined}
        >
          <span
            ref={formulaRef}
            className="inline-block w-max"
            style={fit ? { position: "absolute", left: 0, top: 0, transformOrigin: "top left", transform: `scale(${fit.scale})` } : undefined}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </span>
      </span>
      {expandable && fit && fit.scale < 0.7 && (
        <details className="student-print-hide group my-2 text-sm">
          <summary className="w-fit cursor-pointer list-none underline underline-offset-2 [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">수식 크게 보기</span>
            <span className="hidden group-open:inline">확대 수식 접기</span>
          </summary>
          <div
            className="cbt-math-expanded mt-2 max-w-full py-1 [overflow-x:auto] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="region"
            aria-label="확대 수식. 좌우 방향키 또는 가로로 밀어 전체를 볼 수 있습니다."
            tabIndex={0}
          >
            <span className="inline-block w-max [&_.katex-display]:my-0" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </details>
      )}
    </>
  );
}

function splitMath(content: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  MATH_PATTERN.lastIndex = 0;

  while ((match = MATH_PATTERN.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: content.slice(lastIndex, match.index),
        math: false,
        display: false
      });
    }

    const token = match[0];
    const display = token.startsWith("$$");
    segments.push({
      text: display ? token.slice(2, -2) : token.slice(1, -1),
      math: true,
      display
    });
    lastIndex = MATH_PATTERN.lastIndex;
  }

  if (lastIndex < content.length) {
    segments.push({
      text: content.slice(lastIndex),
      math: false,
      display: false
    });
  }

  return segments;
}

function splitMathPreserve(content: string): RawSegment[] {
  const segments: RawSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  MATH_PATTERN.lastIndex = 0;

  while ((match = MATH_PATTERN.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const raw = content.slice(lastIndex, match.index);
      segments.push({
        raw,
        text: raw,
        math: false,
        display: false
      });
    }

    const token = match[0];
    const display = token.startsWith("$$");
    segments.push({
      raw: token,
      text: display ? token.slice(2, -2) : token.slice(1, -1),
      math: true,
      display
    });
    lastIndex = MATH_PATTERN.lastIndex;
  }

  if (lastIndex < content.length) {
    const raw = content.slice(lastIndex);
    segments.push({
      raw,
      text: raw,
      math: false,
      display: false
    });
  }

  return segments;
}

function countDollarDelimiters(value: string) {
  return (value.match(/(?<!\\)\$/g) ?? []).length;
}

function normalizeMathDelimiters(content: string) {
  let value = content.replace(/\r\n?/g, "\n");

  const unescapedDollarCandidate = value.replace(/\\\$/g, "$");
  if (
    unescapedDollarCandidate !== value &&
    countDollarDelimiters(unescapedDollarCandidate) >= 2 &&
    countDollarDelimiters(unescapedDollarCandidate) % 2 === 0
  ) {
    value = unescapedDollarCandidate;
  }

  return value
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, body: string) => `$$${body}$$`)
    .replace(/\\\(([\s\S]+?)\\\)/g, (_, body: string) => `$${body}$`);
}

function normalizeTextBreaks(text: string, forceNumericBreaks = false) {
  let normalized = text
    .replace(/\s*\\q?quad\s*(?=\((?:[1-9]|가|나|다|라|마|바|ㄱ|ㄴ|ㄷ|ㄹ|ㅁ|ㅂ)\))/g, "\n")
    .replace(/([?？])\s+(\((?:1|가|ㄱ|A)\))/g, "$1\n\n$2");

  const numericMarkers = normalized.match(/\([1-9]\)/g) ?? [];
  if (forceNumericBreaks || numericMarkers.length >= 2) {
    normalized = normalized.replace(/[ \t]+(\([2-9]\))/g, "\n$1");
  }

  // Spacing macros that leaked outside `$…$` would otherwise be printed verbatim.
  return normalized
    .replace(/\\\\/g, "\n")
    .replace(/\\(?:qquad|quad)(?![a-zA-Z])/g, " ")
    .replace(/\\[,;:!](?![a-zA-Z])/g, " ")
    .replace(/[ \t]{2,}/g, " ");
}

function normalizeContent(content: string) {
  const segments = splitMathPreserve(normalizeMathDelimiters(content));
  const outsideText = segments.filter((segment) => !segment.math).map((segment) => segment.raw).join(" ");
  const forceNumericBreaks = /\(1\)/.test(outsideText) && /\([2-9]\)/.test(outsideText);
  const joined = segments
    .map((segment) => (segment.math ? segment.raw : normalizeTextBreaks(segment.text, forceNumericBreaks)))
    .join("");
  return breakStatementLists(joined);
}

function renderSegments(segments: Segment[]): RenderedSegment[] {
  return segments.map((segment) => {
    if (!segment.math) return segment;

    const underline = !segment.display && TEXT_UNDERLINE.exec(segment.text);
    if (underline) return { ...segment, underline: underline[1] };

    const display = segment.display || segment.text.length > LONG_INLINE_MATH;

    try {
      return {
        ...segment,
        display,
        html: katex.renderToString(segment.text, {
          displayMode: display,
          throwOnError: false,
          strict: false
        })
      };
    } catch {
      return {
        ...segment,
        math: false,
        text: segment.text
      };
    }
  });
}

const BOLD_PATTERN = /\*\*([^*\n]+)\*\*/g;

/** Minimal `**bold**` support; the source content uses it inside explanations. */
function renderTextLine(line: string, keyPrefix: string) {
  BOLD_PATTERN.lastIndex = 0;
  if (!BOLD_PATTERN.test(line)) return line;

  BOLD_PATTERN.lastIndex = 0;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = BOLD_PATTERN.exec(line)) !== null) {
    if (match.index > lastIndex) nodes.push(line.slice(lastIndex, match.index));
    nodes.push(
      <strong key={`${keyPrefix}-b${match.index}`} className="font-bold">
        {match[1]}
      </strong>
    );
    lastIndex = BOLD_PATTERN.lastIndex;
  }
  if (lastIndex < line.length) nodes.push(line.slice(lastIndex));

  return nodes;
}

export function KaTeXRenderer({ content, className, viewBoxes = true, expandWideMath = true }: KaTeXRendererProps) {
  const renderedBlocks = useMemo<RenderedBlock[]>(() => {
    return splitRenderBlocks(normalizeContent(content), { viewBoxes }).map((block) => ({
      ...block,
      segments: renderSegments(splitMath(block.text))
    }));
  }, [content, viewBoxes]);

  const rootClassName = [
    "min-w-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere]",
    className
  ].filter(Boolean).join(" ");

  function renderSegmentNodes(segments: RenderedSegment[], keyPrefix: string) {
    return segments.map((segment, index) => {
      if ("underline" in segment) return <u key={`${keyPrefix}-${index}`} className="underline-offset-2">{segment.underline}</u>;
      if ("html" in segment) return <ResponsiveFormula key={`${keyPrefix}-${index}`} html={segment.html} display={segment.display} expandable={expandWideMath} />;

      const lines = segment.text.split("\n");
      return (
        <Fragment key={`${keyPrefix}-${index}`}>
          {lines.map((line, lineIndex) => (
            <Fragment key={lineIndex}>
              {lineIndex > 0 ? <br /> : null}
              {renderTextLine(line, `${keyPrefix}-${index}-${lineIndex}`)}
            </Fragment>
          ))}
        </Fragment>
      );
    });
  }

  return (
    <div className={rootClassName}>
      {renderedBlocks.map((block, index) => {
        if (block.type === "view") {
          return (
            <div
              key={index}
              data-view-box="true"
              className="my-4 rounded-md border border-line bg-slate-50 px-5 py-4 shadow-sm"
            >
              {block.showTitle ? <div className="mb-3 text-center text-base font-black text-ink">&lt;보기&gt;</div> : null}
              <div className="min-w-0">{renderSegmentNodes(block.segments, `view-${index}`)}</div>
            </div>
          );
        }

        return <Fragment key={index}>{renderSegmentNodes(block.segments, `normal-${index}`)}</Fragment>;
      })}
    </div>
  );
}
