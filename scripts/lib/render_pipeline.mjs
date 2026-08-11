// Mirror of src/components/math/KaTeXRenderer.tsx text pipeline, for offline audits.
//
// Keep this file in sync with the component. Any audit or fix script that wants
// to know "how will this row actually look in the app?" should go through here
// instead of re-deriving the regexes.

import katex from "katex";

export const VIEW_MARKER = "\\((?:가|나|다|라|마|바|사|아|ㄱ|ㄴ|ㄷ|ㄹ|ㅁ|ㅂ|ㅅ|ㅇ)\\)";
export const VIEW_MARKER_LINE_RX = new RegExp(`^\\s*${VIEW_MARKER}\\s*`);
export const VIEW_TITLE_LINE_RX = /^\s*(?:<\s*보기\s*>|\[\s*보기\s*\]|보기)\s*$/;
export const STATEMENT_LINE_RX =
  /^\s*(?:(?:가|나|다|라|마|바|사|아|ㄱ|ㄴ|ㄷ|ㄹ|ㅁ|ㅂ|ㅅ|ㅇ|ᄀ|ᄂ|ᄃ|ᄅ|ᄆ|ᄇ|[a-fA-F])\s*[.)]|[ⓐ-ⓕ]|\((?:[a-fA-F]|i{1,3}|iv|v)\))\s+/;
export const MATH_PATTERN = /((?<!\\)\$\$[\s\S]+?(?<!\\)\$\$|(?<!\\)\$[\s\S]+?(?<!\\)\$)/g;

export const LONG_INLINE_MATH = 160;

const KOREAN_STATEMENT_GAP = 6;
const LATIN_STATEMENT_GAP = 18;

const STATEMENT_MARKER_SETS = [
  { rx: /(?<=^|\s)(가|나|다|라|마|바)[.)](?=\s)/g, order: ["가", "나", "다", "라", "마", "바"], gap: KOREAN_STATEMENT_GAP },
  { rx: /(?<=^|\s)(ㄱ|ㄴ|ㄷ|ㄹ|ㅁ|ㅂ)[.)](?=\s)/g, order: ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ"], gap: KOREAN_STATEMENT_GAP },
  { rx: /(?<=^|\s)(ᄀ|ᄂ|ᄃ|ᄅ|ᄆ|ᄇ)[.)](?=\s)/g, order: ["ᄀ", "ᄂ", "ᄃ", "ᄅ", "ᄆ", "ᄇ"], gap: KOREAN_STATEMENT_GAP },
  { rx: /(ⓐ|ⓑ|ⓒ|ⓓ|ⓔ|ⓕ)/g, order: ["ⓐ", "ⓑ", "ⓒ", "ⓓ", "ⓔ", "ⓕ"], gap: KOREAN_STATEMENT_GAP },
  { rx: /(?<=^|\s)(A|B|C|D|E|F)[.)](?=\s)/g, order: ["A", "B", "C", "D", "E", "F"], gap: LATIN_STATEMENT_GAP },
  { rx: /(?<=^|\s)(a|b|c|d|e|f)[.)](?=\s)/g, order: ["a", "b", "c", "d", "e", "f"], gap: LATIN_STATEMENT_GAP },
  { rx: /\((a|b|c|d|e|f)\)(?=\s)/g, order: ["a", "b", "c", "d", "e", "f"], gap: LATIN_STATEMENT_GAP },
  { rx: /\((A|B|C|D|E|F)\)(?=\s)/g, order: ["A", "B", "C", "D", "E", "F"], gap: LATIN_STATEMENT_GAP },
  { rx: /\((i|ii|iii|iv|v)\)(?=\s)/g, order: ["i", "ii", "iii", "iv", "v"], gap: LATIN_STATEMENT_GAP },
];

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
    .replace(new RegExp(`[ \\t]+(${VIEW_MARKER})`, "g"), "\n$1")
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

export function statementBreakOffsets(content) {
  const masked = maskMath(content);
  const offsets = new Set();

  for (const { rx, order, gap: minGap } of STATEMENT_MARKER_SETS) {
    rx.lastIndex = 0;
    const hits = [];
    let match;
    while ((match = rx.exec(masked)) !== null) {
      const rank = order.indexOf(match[1] ?? match[0]);
      if (rank >= 0) hits.push({ index: match.index, rank });
    }

    let run = [];
    const flush = () => {
      if (run.length >= 2) for (const hit of run) offsets.add(hit.index);
      run = [];
    };

    for (const hit of hits) {
      const previous = run[run.length - 1];
      const continues =
        previous && hit.rank === previous.rank + 1 && hit.index - previous.index >= minGap;
      if (continues) {
        run.push(hit);
        continue;
      }
      flush();
      if (hit.rank === 0) run = [hit];
    }
    flush();
  }

  return [...offsets].sort((a, b) => b - a);
}

export function breakStatementLists(content) {
  let value = content;
  for (const offset of statementBreakOffsets(content)) {
    const before = value.slice(0, offset).replace(/[ \t]+$/, "");
    if (!before || before.endsWith("\n")) continue;
    if (before.length - (before.lastIndexOf("\n") + 1) < 4) continue;
    value = `${before}\n${value.slice(offset)}`;
  }
  return value;
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

function stripViewTitle(text) {
  const lines = text.split("\n");
  if (lines.length > 0 && VIEW_TITLE_LINE_RX.test(lines[0])) return lines.slice(1).join("\n").trim();
  return text.trim();
}

export function isViewMarkerStatementLine(line, allowPlainLabels = false) {
  const markerRx = allowPlainLabels && STATEMENT_LINE_RX.test(line) ? STATEMENT_LINE_RX : VIEW_MARKER_LINE_RX;
  if (!markerRx.test(line)) return false;
  const body = line
    .replace(markerRx, "")
    .replace(/^[,，、/]+|[,，、/]+$/g, "")
    .trim();
  return body.length >= 3;
}

function countViewMarkerLines(lines, start, allowPlainLabels) {
  let count = 0;
  for (let i = start; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) break;
    if (isViewMarkerStatementLine(line, allowPlainLabels)) count += 1;
  }
  return count;
}

export function splitRenderBlocks(content) {
  const lines = content.split("\n");
  const blocks = [];
  const normalLines = [];
  const allowPlainLabels = /보기/.test(content);

  const flushNormal = () => {
    if (!normalLines.length) return;
    blocks.push({ type: "normal", text: normalLines.join("\n") });
    normalLines.length = 0;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const startsViewTitle = VIEW_TITLE_LINE_RX.test(line);
    const startsViewMarkers =
      isViewMarkerStatementLine(line, allowPlainLabels) &&
      countViewMarkerLines(lines, i, allowPlainLabels) >= 2;

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

/**
 * Run the full render and report what a student would actually see.
 *
 * Returns { blocks, mathErrors, literalDollarText, plainText }.
 *  - mathErrors: KaTeX failures (rendered as raw fallback text in the app)
 *  - literalDollarText: text the app prints verbatim that still carries `$`
 *    delimiters or LaTeX macros, i.e. visible broken markup
 */
export function inspectRender(content) {
  const source = String(content ?? "");
  const normalized = normalizeContent(source);
  const blocks = splitRenderBlocks(normalized);
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
