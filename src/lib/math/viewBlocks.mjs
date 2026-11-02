// Shared by the React renderer, print renderer and offline question audits.
// Labels are inspected outside math only. Do not rewrite mathematical content.
export const VIEW_MARKER = "\\((?:가|나|다|라|마|바|사|아|ㄱ|ㄴ|ㄷ|ㄹ|ㅁ|ㅂ|ㅅ|ㅇ)\\)(?=\\s|\\$|$)";
export const VIEW_MARKER_LINE_RX = new RegExp(`^\\s*${VIEW_MARKER}`);
export const VIEW_TITLE_LINE_RX = /^\s*(?:<\s*보기\s*>|\[\s*보기\s*\]|보기|\$\\langle\$\s*보기\s*\$\\rangle\$|\$\\langle\s*보기\s*\\rangle\$)\s*$/;
export const STATEMENT_LINE_RX = /^\s*(?:(?:가|나|다|라|마|바|사|아|ㄱ|ㄴ|ㄷ|ㄹ|ㅁ|ㅂ|ㅅ|ㅇ|ᄀ|ᄂ|ᄃ|ᄅ|ᄆ|ᄇ|[a-fA-F])\s*[.)]|[ⓐ-ⓕ㉠-㉧]|\((?:[a-fA-F]|i{1,3}|iv|v)\))(?=\s|\$|$)\s*/;

const KOREAN_SYLLABLES = ["가", "나", "다", "라", "마", "바", "사", "아"];
const KOREAN_JAMO = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ"];
const MARKER_SETS = [
  { rx: /(?<=^|\s)(가|나|다|라|마|바|사|아)[.)](?=\s|\$|$)/g, order: KOREAN_SYLLABLES, gap: 6 },
  { rx: /(?<=^|\s)(ㄱ|ㄴ|ㄷ|ㄹ|ㅁ|ㅂ|ㅅ|ㅇ)[.)](?=\s|\$|$)/g, order: KOREAN_JAMO, gap: 6 },
  { rx: /(?<=^|\s)(ᄀ|ᄂ|ᄃ|ᄅ|ᄆ|ᄇ)[.)](?=\s|\$|$)/g, order: ["ᄀ", "ᄂ", "ᄃ", "ᄅ", "ᄆ", "ᄇ"], gap: 6 },
  { rx: /(ⓐ|ⓑ|ⓒ|ⓓ|ⓔ|ⓕ)(?=\s|\$|$)/g, order: ["ⓐ", "ⓑ", "ⓒ", "ⓓ", "ⓔ", "ⓕ"], gap: 6 },
  { rx: /(㉠|㉡|㉢|㉣|㉤|㉥|㉦|㉧)(?=\s|\$|$)/g, order: ["㉠", "㉡", "㉢", "㉣", "㉤", "㉥", "㉦", "㉧"], gap: 6 },
  { rx: /\((가|나|다|라|마|바|사|아)\)(?=\s|\$|$)/g, order: KOREAN_SYLLABLES, gap: 6 },
  { rx: /\((ㄱ|ㄴ|ㄷ|ㄹ|ㅁ|ㅂ|ㅅ|ㅇ)\)(?=\s|\$|$)/g, order: KOREAN_JAMO, gap: 6 },
  { rx: /(?<=^|\s)(A|B|C|D|E|F)[.)](?=\s|\$|$)/g, order: ["A", "B", "C", "D", "E", "F"], gap: 18 },
  { rx: /(?<=^|\s)(a|b|c|d|e|f)[.)](?=\s|\$|$)/g, order: ["a", "b", "c", "d", "e", "f"], gap: 18 },
  { rx: /\((a|b|c|d|e|f)\)(?=\s|\$|$)/g, order: ["a", "b", "c", "d", "e", "f"], gap: 18 },
  { rx: /\((A|B|C|D|E|F)\)(?=\s|\$|$)/g, order: ["A", "B", "C", "D", "E", "F"], gap: 18 },
  { rx: /\((i|ii|iii|iv|v)\)(?=\s|\$|$)/g, order: ["i", "ii", "iii", "iv", "v"], gap: 18 }
];

function maskMath(content) {
  return content.replace(/(?<!\\)\$\$[\s\S]+?(?<!\\)\$\$|(?<!\\)\$[\s\S]+?(?<!\\)\$/g,
    value => " ".repeat(value.length));
}

export function statementBreakOffsets(content) {
  const masked = maskMath(content);
  const offsets = new Set();
  for (const { rx, order, gap } of MARKER_SETS) {
    rx.lastIndex = 0;
    const hits = [...masked.matchAll(rx)].map(match => ({ index: match.index, rank: order.indexOf(match[1]) }));
    let run = [];
    const flush = () => {
      if (run.length >= 2) for (const hit of run) offsets.add(hit.index);
      run = [];
    };
    for (const hit of hits) {
      const previous = run.at(-1);
      if (previous && hit.rank === previous.rank + 1 && hit.index - previous.index >= gap) run.push(hit);
      else {
        flush();
        if (hit.rank === 0) run = [hit];
      }
    }
    flush();
  }
  return [...offsets].sort((a, b) => b - a);
}

export function breakStatementLists(content) {
  let value = content;
  for (const offset of statementBreakOffsets(content)) {
    const before = value.slice(0, offset).replace(/[ \t]+$/, "");
    if (!before || before.endsWith("\n") || before.length - (before.lastIndexOf("\n") + 1) < 4) continue;
    value = `${before}\n${value.slice(offset)}`;
  }
  return value;
}

function statementLabel(line) {
  const masked = maskMath(line);
  for (let family = 0; family < MARKER_SETS.length; family += 1) {
    const { rx, order } = MARKER_SETS[family];
    rx.lastIndex = 0;
    const match = rx.exec(masked.trimStart());
    if (!match || match.index !== 0) continue;
    const body = line.trimStart().slice(match[0].length).trim();
    if (body) return { family, rank: order.indexOf(match[1]) };
  }
  return null;
}

export function isViewMarkerStatementLine(line, allowPlainLabels = false) {
  if (!allowPlainLabels && !VIEW_MARKER_LINE_RX.test(line)) return false;
  return statementLabel(line) !== null;
}

function isPromptLine(line) {
  const text = maskMath(line).trim();
  return /^(?:따라서|그러므로|그러면|이때|이 때|정답\s*[:：]|답은|모두\s*(?:옳|참|거짓)|옳은\s*것|구하(?:면|시오))/.test(text)
    || /[?？]\s*$/.test(text);
}

function nextNonblank(lines, start) {
  let i = start;
  while (i < lines.length && !lines[i].trim()) i += 1;
  return i;
}

function hasStatementPair(lines, start) {
  const first = statementLabel(lines[start]);
  if (!first) return false;
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) {
      const next = nextNonblank(lines, i + 1);
      if (next >= lines.length || !statementLabel(lines[next])) return false;
      i = next - 1;
      continue;
    }
    const label = statementLabel(line);
    if (label) return label.family === first.family && label.rank === first.rank + 1;
    if (isPromptLine(line) || VIEW_TITLE_LINE_RX.test(line)) return false;
  }
  return false;
}

// Only detach a same-line question after a complete sentence and an explicit
// question introducer. Ambiguous trailing clauses remain unchanged for review.
function splitQuestionTail(line) {
  const masked = maskMath(line);
  const match = /[.。]\s+((?:이때|이 때|따라서|그러면)\s[\s\S]*(?:[?？]|구하시오[.]?))\s*$/.exec(masked);
  if (!match) return null;
  const offset = match.index + match[0].indexOf(match[1]);
  return { statement: line.slice(0, offset).trimEnd(), tail: line.slice(offset).trimStart() };
}

export function splitRenderBlocks(content, { viewBoxes = true } = {}) {
  if (!viewBoxes) return [{ type: "normal", text: content }];
  const lines = content.split("\n");
  const blocks = [];
  const normalLines = [];
  const mentionsView = /보기/.test(maskMath(content));
  const flushNormal = () => {
    if (normalLines.length) blocks.push({ type: "normal", text: normalLines.join("\n") });
    normalLines.length = 0;
  };
  for (let i = 0; i < lines.length;) {
    const titled = VIEW_TITLE_LINE_RX.test(lines[i]);
    const start = titled ? nextNonblank(lines, i + 1) : i;
    const inferred = !titled && hasStatementPair(lines, i);
    if (!titled && !inferred) { normalLines.push(lines[i]); i += 1; continue; }
    // Keep a dangling heading visible as ordinary text; never create an empty box.
    if (start >= lines.length || VIEW_TITLE_LINE_RX.test(lines[start]) || (!statementLabel(lines[start]) && isPromptLine(lines[start]))) {
      normalLines.push(lines[i]); i += 1; continue;
    }
    const viewLines = [];
    let cursor = start;
    let tail = null;
    while (cursor < lines.length) {
      const line = lines[cursor];
      if (VIEW_TITLE_LINE_RX.test(line)) break;
      if (!line.trim()) {
        const next = nextNonblank(lines, cursor + 1);
        if (next < lines.length && statementLabel(lines[next])) { viewLines.push(""); cursor = next; continue; }
        break;
      }
      if (!statementLabel(line) && isPromptLine(line)) break;
      const split = splitQuestionTail(line);
      if (split) { viewLines.push(split.statement); tail = split.tail; cursor += 1; break; }
      viewLines.push(line);
      cursor += 1;
    }
    const text = viewLines.join("\n").trim();
    if (!text) { normalLines.push(lines[i]); i += 1; continue; }
    flushNormal();
    blocks.push({ type: "view", text, showTitle: titled || mentionsView });
    if (tail) normalLines.push(tail);
    i = cursor;
  }
  flushNormal();
  return blocks.length ? blocks : [{ type: "normal", text: content }];
}
