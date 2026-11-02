// Mirror of src/components/math/KaTeXRenderer.tsx text pipeline, for offline audits.
//
// Keep this file in sync with the component. Any audit or fix script that wants
// to know "how will this row actually look in the app?" should go through here
// instead of re-deriving the regexes.

import katex from "katex";

import { breakStatementLists, splitRenderBlocks } from "../../src/lib/math/viewBlocks.mjs";
export {
  VIEW_MARKER, VIEW_MARKER_LINE_RX, VIEW_TITLE_LINE_RX, STATEMENT_LINE_RX,
  statementBreakOffsets, breakStatementLists, isViewMarkerStatementLine, splitRenderBlocks
} from "../../src/lib/math/viewBlocks.mjs";
export const MATH_PATTERN = /((?<!\\)\$\$[\s\S]+?(?<!\\)\$\$|(?<!\\)\$[\s\S]+?(?<!\\)\$)/g;
export const LONG_INLINE_MATH = 160;

export function splitMathPreserve(content) {
  const segments = [];
  let lastIndex = 0;
  let match;
  MATH_PATTERN.lastIndex = 0;

  while ((match = MATH_PATTERN.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const raw = content.slice(lastIndex, match.index);
      segments.push({ raw, text: raw, math: false, display: false });
    }
    const token = match[0];
    const display = token.startsWith("$$");
    segments.push({
      raw: token,
      text: display ? token.slice(2, -2) : token.slice(1, -1),
      math: true,
      display,
    });
    lastIndex = MATH_PATTERN.lastIndex;
  }

  if (lastIndex < content.length) {
    const raw = content.slice(lastIndex);
    segments.push({ raw, text: raw, math: false, display: false });
  }

  return segments;
}

export function splitMath(content) {
  return splitMathPreserve(content).map(({ text, math, display }) => ({ text, math, display }));
}

export function countDollarDelimiters(value) {
  return (String(value ?? "").match(/(?<!\\)\$/g) ?? []).length;
}

export function normalizeMathDelimiters(content) {
  let value = String(content ?? "").replace(/\r\n?/g, "\n");

  const unescapedDollarCandidate = value.replace(/\\\$/g, "$");
  if (
    unescapedDollarCandidate !== value &&
    countDollarDelimiters(unescapedDollarCandidate) >= 2 &&
    countDollarDelimiters(unescapedDollarCandidate) % 2 === 0
  ) {
    value = unescapedDollarCandidate;
  }

  return value
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, body) => `$$${body}$$`)
    .replace(/\\\(([\s\S]+?)\\\)/g, (_, body) => `$${body}$`);
}

export function normalizeTextBreaks(text, forceNumericBreaks = false) {
  let normalized = text
    .replace(/\s*\\q?quad\s*(?=\((?:[1-9]|가|나|다|라|마|바|ㄱ|ㄴ|ㄷ|ㄹ|ㅁ|ㅂ)\))/g, "\n")
    .replace(/([?？])\s+(\((?:1|가|ㄱ|A)\))/g, "$1\n\n$2");

  const numericMarkers = normalized.match(/\([1-9]\)/g) ?? [];
  if (forceNumericBreaks || numericMarkers.length >= 2) {
    normalized = normalized.replace(/[ \t]+(\([2-9]\))/g, "\n$1");
  }

  return normalized
    .replace(/\\\\/g, "\n")
    .replace(/\\(?:qquad|quad)(?![a-zA-Z])/g, " ")
    .replace(/\\[,;:!](?![a-zA-Z])/g, " ")
    .replace(/[ \t]{2,}/g, " ");
}

export function maskMath(content) {
  return splitMathPreserve(content)
    .map((s) => (s.math ? " ".repeat(s.raw.length) : s.raw))
    .join("");
}

export function normalizeContent(content) {
  const segments = splitMathPreserve(normalizeMathDelimiters(content));
  const outsideText = segments.filter((s) => !s.math).map((s) => s.raw).join(" ");
  const forceNumericBreaks = /\(1\)/.test(outsideText) && /\([2-9]\)/.test(outsideText);
  const joined = segments
    .map((s) => (s.math ? s.raw : normalizeTextBreaks(s.text, forceNumericBreaks)))
    .join("");
  return breakStatementLists(joined);
}

/**
 * Run the full render and report what a student would actually see.
 *
 * Returns { blocks, mathErrors, literalDollarText, plainText }.
 *  - mathErrors: KaTeX failures (rendered as raw fallback text in the app)
 *  - literalDollarText: text the app prints verbatim that still carries `$`
 *    delimiters or LaTeX macros, i.e. visible broken markup
 */
export function inspectRender(content, options = {}) {
  const source = String(content ?? "");
  const normalized = normalizeContent(source);
  const blocks = splitRenderBlocks(normalized, options);
  const mathErrors = [];
  const glyphWarnings = [];
  const literalPieces = [];
  const plainPieces = [];
  const mathSegments = [];

  const originalWarn = console.warn;
  const originalError = console.error;

  for (const block of blocks) {
    for (const segment of splitMath(block.text)) {
      if (segment.math) {
        mathSegments.push(segment);
        const warnings = [];
        console.warn = (...args) => warnings.push(args.join(" "));
        console.error = (...args) => warnings.push(args.join(" "));
        try {
          katex.renderToString(segment.text, {
            displayMode: segment.display,
            throwOnError: true,
            strict: false,
          });
        } catch (error) {
          mathErrors.push({ blockType: block.type, math: segment.text, message: String(error?.message ?? error) });
        } finally {
          console.warn = originalWarn;
          console.error = originalError;
        }
        for (const warning of warnings) {
          const missing = warning.match(/No character metrics for '(.+?)'/);
          if (missing) glyphWarnings.push({ char: missing[1], math: segment.text });
        }
        plainPieces.push(" ");
      } else {
        literalPieces.push(segment.text);
        plainPieces.push(segment.text);
      }
    }
  }

  return {
    normalized,
    blocks,
    mathSegments,
    mathErrors,
    glyphWarnings,
    literalText: literalPieces.join(""),
    plainText: plainPieces.join(""),
  };
}
