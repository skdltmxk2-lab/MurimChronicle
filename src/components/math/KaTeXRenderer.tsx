"use client";

import katex from "katex";
import { Fragment, useMemo } from "react";

type KaTeXRendererProps = {
  content: string;
  className?: string;
};

type Segment = {
  text: string;
  math: boolean;
  display: boolean;
};

type RenderedSegment = Segment | (Segment & { html: string });
type RenderBlock = {
  type: "normal" | "view";
  text: string;
};
type RenderedBlock = RenderBlock & {
  segments: RenderedSegment[];
};
type RawSegment = Segment & {
  raw: string;
};

const VIEW_MARKER = "\\((?:가|나|다|라|마|바|사|아|ㄱ|ㄴ|ㄷ|ㄹ|ㅁ|ㅂ|ㅅ|ㅇ|A|B|C|D|E|F)\\)";
const VIEW_MARKER_LINE_RX = new RegExp(`^\\s*${VIEW_MARKER}\\s*`);
const VIEW_TITLE_LINE_RX = /^\s*(?:<\s*보기\s*>|\[\s*보기\s*\]|보기)\s*$/;

const MATH_PATTERN = /((?<!\\)\$\$[\s\S]+?(?<!\\)\$\$|(?<!\\)\$[\s\S]+?(?<!\\)\$)/g;

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
    .replace(/\s*\\q?quad\s*(?=\((?:[1-9]|가|나|다|라|마|바|ㄱ|ㄴ|ㄷ|ㄹ|ㅁ|ㅂ|A|B|C|D|E)\))/g, "\n")
    .replace(new RegExp(`[ \\t]+(${VIEW_MARKER})`, "g"), "\n$1")
    .replace(/([?？])\s+(\((?:1|가|ㄱ|A)\))/g, "$1\n\n$2");

  const numericMarkers = normalized.match(/\([1-9]\)/g) ?? [];
  if (forceNumericBreaks || numericMarkers.length >= 2) {
    normalized = normalized.replace(/[ \t]+(\([2-9]\))/g, "\n$1");
  }

  return normalized;
}

function normalizeContent(content: string) {
  const segments = splitMathPreserve(normalizeMathDelimiters(content));
  const outsideText = segments.filter((segment) => !segment.math).map((segment) => segment.raw).join(" ");
  const forceNumericBreaks = /\(1\)/.test(outsideText) && /\([2-9]\)/.test(outsideText);
  return segments
    .map((segment) => (segment.math ? segment.raw : normalizeTextBreaks(segment.text, forceNumericBreaks)))
    .join("");
}

function stripViewTitle(text: string) {
  const lines = text.split("\n");
  if (lines.length > 0 && VIEW_TITLE_LINE_RX.test(lines[0])) return lines.slice(1).join("\n").trim();
  return text.trim();
}

function countViewMarkerLines(lines: string[], start: number) {
  let count = 0;
  for (let i = start; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) break;
    if (VIEW_MARKER_LINE_RX.test(line)) count += 1;
  }
  return count;
}

function splitRenderBlocks(content: string): RenderBlock[] {
  const lines = content.split("\n");
  const blocks: RenderBlock[] = [];
  const normalLines: string[] = [];

  const flushNormal = () => {
    if (!normalLines.length) return;
    blocks.push({ type: "normal", text: normalLines.join("\n") });
    normalLines.length = 0;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const startsViewTitle = VIEW_TITLE_LINE_RX.test(line);
    const startsViewMarkers = VIEW_MARKER_LINE_RX.test(line) && countViewMarkerLines(lines, i) >= 2;

    if (startsViewTitle || startsViewMarkers) {
      flushNormal();
      const viewLines = [line];
      i += 1;
      while (i < lines.length && lines[i].trim()) {
        viewLines.push(lines[i]);
        i += 1;
      }
      blocks.push({ type: "view", text: stripViewTitle(viewLines.join("\n")) });
      if (i < lines.length && !lines[i].trim()) normalLines.push("");
      continue;
    }

    normalLines.push(line);
  }

  flushNormal();
  return blocks.length ? blocks : [{ type: "normal", text: content }];
}

function renderSegments(segments: Segment[]): RenderedSegment[] {
  return segments.map((segment) => {
    if (!segment.math) return segment;

    try {
      return {
        ...segment,
        html: katex.renderToString(segment.text, {
          displayMode: segment.display,
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

export function KaTeXRenderer({ content, className }: KaTeXRendererProps) {
  const renderedBlocks = useMemo<RenderedBlock[]>(() => {
    return splitRenderBlocks(normalizeContent(content)).map((block) => ({
      ...block,
      segments: renderSegments(splitMath(block.text))
    }));
  }, [content]);

  const rootClassName = [
    "min-w-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere]",
    className
  ].filter(Boolean).join(" ");

  function renderSegmentNodes(segments: RenderedSegment[], keyPrefix: string) {
    return segments.map((segment, index) => {
      if ("html" in segment) {
        const Tag = segment.display ? "div" : "span";
        return (
          <Tag
            key={`${keyPrefix}-${index}`}
            className={
              segment.display
                ? "my-3 max-w-full overflow-x-auto overflow-y-visible py-1"
                : "inline-block max-w-full overflow-x-auto overflow-y-visible py-0.5 align-middle"
            }
            dangerouslySetInnerHTML={{ __html: segment.html }}
          />
        );
      }

      const lines = segment.text.split("\n");
      return (
        <Fragment key={`${keyPrefix}-${index}`}>
          {lines.map((line, lineIndex) => (
            <Fragment key={lineIndex}>
              {lineIndex > 0 ? <br /> : null}
              {line}
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
              className="my-4 rounded-md border border-line bg-slate-50 px-5 py-4 shadow-sm"
            >
              <div className="mb-3 text-center text-base font-black text-ink">&lt;보기&gt;</div>
              <div className="min-w-0">{renderSegmentNodes(block.segments, `view-${index}`)}</div>
            </div>
          );
        }

        return <Fragment key={index}>{renderSegmentNodes(block.segments, `normal-${index}`)}</Fragment>;
      })}
    </div>
  );
}
