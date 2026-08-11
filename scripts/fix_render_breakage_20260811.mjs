// Fix question rows that render broken in the app.
//
// Companion to scripts/audit_render_breakage_readonly.mjs. Two kinds of change:
//
//  1. Corpus-wide normalisations that are safe to apply everywhere:
//     - standalone initial-jamo codepoints (U+1100 ᄀ) -> compatibility jamo (ㄱ)
//     - `℃` / `℉` inside math (KaTeX has no metrics, so they render mis-spaced)
//     - `$\text{ㄱ. } …$` labels lifted out of math onto their own statement line
//     - `$\mathbf{않은}$` -> `**않은**` (Korean does not belong in math mode)
//
//  2. Explicit per-row rewrites for content the transforms cannot infer:
//     markdown tables, authoring notes leaking into stems, and formulas that
//     carry Korean prose inside `$…$`.
//
// Dry run by default; pass --apply to write.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { splitMathPreserve } from "./lib/render_pipeline.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const outDir = resolve(root, "tmp", "audit");
mkdirSync(outDir, { recursive: true });

const env = Object.fromEntries(
  readFileSync(resolve(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return [key.trim(), rest.join("=").trim()];
    }),
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const APPLY = process.argv.includes("--apply");

// ---------------------------------------------------------------- transforms

const CHOSEONG_TO_COMPAT = {
  "ᄀ": "ㄱ", "ᄁ": "ㄲ", "ᄂ": "ㄴ", "ᄃ": "ㄷ", "ᄄ": "ㄸ",
  "ᄅ": "ㄹ", "ᄆ": "ㅁ", "ᄇ": "ㅂ", "ᄈ": "ㅃ", "ᄉ": "ㅅ",
  "ᄊ": "ㅆ", "ᄋ": "ㅇ", "ᄌ": "ㅈ", "ᄍ": "ㅉ", "ᄎ": "ㅊ",
  "ᄏ": "ㅋ", "ᄐ": "ㅌ", "ᄑ": "ㅍ", "ᄒ": "ㅎ",
};

/** Standalone initial jamo look like ㄱ/ㄴ/ㄷ but never match the same regex class. */
function normalizeChoseongJamo(text) {
  // A jamo followed by a medial vowel is part of a decomposed syllable — leave it.
  return text.replace(/[ᄀ-ᄒ](?![ᅡ-ᆧ])/g, (char) => CHOSEONG_TO_COMPAT[char] ?? char);
}

/** Rewrite every math segment through `fn(body, display)`. */
function mapMathSegments(text, fn) {
  return splitMathPreserve(text)
    .map((segment) => {
      if (!segment.math) return segment.raw;
      const replacement = fn(segment.text, segment.display);
      if (replacement === null) return segment.raw;
      return replacement;
    })
    .join("");
}

function fixDegreeSigns(text) {
  return mapMathSegments(text, (body, display) => {
    if (!/[℃℉]/.test(body)) return null;
    const fixed = body.replace(/℃/g, "\\,^\\circ\\mathrm{C}").replace(/℉/g, "\\,^\\circ\\mathrm{F}");
    return display ? `$$${fixed}$$` : `$${fixed}$`;
  });
}

const HANGUL_ONLY_RX = /^[가-힣\s]+$/;

/** `$\mathbf{않은}$` renders in math font; the renderer supports `**않은**` instead. */
function liftBoldHangul(text) {
  return mapMathSegments(text, (body, display) => {
    if (display) return null;
    const match = body.trim().match(/^\\(?:mathbf|textbf|mathrm|bf)\{([^{}]+)\}$/);
    if (!match || !HANGUL_ONLY_RX.test(match[1])) return null;
    return `**${match[1].trim()}**`;
  });
}

const JAMO_LABEL_RX = /\\text\s*\{\s*(\()?\s*([ㄱ-ㅎ])\s*(\))?\s*([.)])?\s*\}/g;

function trimExpression(value) {
  return value
    .replace(/^(?:\s|\\quad|\\qquad|\\,|\\;|\\!|\\ )+/g, "")
    .replace(/(?:\s|\\quad|\\qquad|\\,|\\;|\\!|\\ |,)+$/g, "")
    .trim();
}

/**
 * `$\text{ㄱ. } EXPR \quad \text{ㄴ. } EXPR$` renders the jamo with no font metrics,
 * so the labels are moved into plain text and each statement gets its own line.
 */
function liftJamoLabels(text) {
  return mapMathSegments(text, (body, display) => {
    if (display) return null;
    JAMO_LABEL_RX.lastIndex = 0;
    const marks = [...body.matchAll(JAMO_LABEL_RX)];
    if (!marks.length) return null;

    const pieces = [];
    const head = body.slice(0, marks[0].index).trim();
    if (head) pieces.push(`$${head}$`);

    marks.forEach((mark, index) => {
      const start = mark.index + mark[0].length;
      const end = index + 1 < marks.length ? marks[index + 1].index : body.length;
      const label = mark[1] ? `(${mark[2]})` : `${mark[2]}.`;
      const expression = trimExpression(body.slice(start, end));
      pieces.push(expression ? `${label} $${expression}$` : label);
    });

    // A lone label opening the segment continues the surrounding sentence
    // ("$\text{ㄱ. } n\times n$ 행렬 …"), so it must not force a line break; the
    // renderer splits those lines on its own.
    if (marks.length === 1 && marks[0].index === 0 && !head) return pieces[0];
    return `\n${pieces.join("\n")}\n`;
  });
}

function tidyWhitespace(text) {
  return text
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function autoFix(text) {
  if (typeof text !== "string" || !text.trim()) return text;
  const fixed = tidyWhitespace(liftBoldHangul(liftJamoLabels(fixDegreeSigns(normalizeChoseongJamo(text)))));
  return fixed;
}

// ------------------------------------------------------------ manual rewrites

const AJOU_43_TABLE = [
  "다항함수 $f(x,y)$에 대한 부분적 정보가 다음 표와 같다.",
  "",
  "$$\\begin{array}{c|c|c|c|c|c|c}",
  "(a,b) & f(a,b) & f_x & f_y & f_{xx} & f_{xy} & f_{yy} \\\\ \\hline",
  "(0,0) & 0 & 0 & 1 & 1 & 2 & 8 \\\\",
  "(1,2) & 2 & 0 & 0 & -1 & 4 & -2 \\\\",
  "(-1,1) & c & 0 & 0 & 1 & 2 & 8 \\\\",
  "(2,4) & d & 0 & 0 & -2 & -3 & -6",
  "\\end{array}$$",
  "",
  "다음 설명 중 옳은 것은 모두 몇 개인가?",
  "",
  "가. $f$는 $(0,0)$에서 극솟값을 가진다.",
  "나. $f$는 $(1,2)$에서 극댓값을 가진다.",
  "다. $c<d$",
  "라. $c=-1$",
].join("\n");

const WARMUP_05_14 = [
  "14. 미분가능한 이변수 함수 $f(x,y)$에 대하여 $w=g(u,v)=f(u+2v^2+2,\\,u^2-4v+1)$라 하자.",
  "아래 표를 이용하여 $\\left.\\dfrac{\\partial w}{\\partial u}\\right|_{(-1,0)}$의 값을 구하면?",
  "",
  "$$\\begin{array}{c|c|c|c}",
  "(x,y) & f & f_x & f_y \\\\ \\hline",
  "(-1,0) & 5 & 3 & 2 \\\\",
  "(1,2) & 8 & 6 & 4",
  "\\end{array}$$",
].join("\n");

const WARMUP_11_05 = [
  "5. $A^{T}=A^{T}A$일 때 다음 중 옳은 것을 모두 고르면?",
  "",
  "(ㄱ) $A=A^{T}$",
  "(ㄴ) $\\det(A)=1$",
  "(ㄷ) $A^{2}=A$",
  "(ㄹ) $A^{-1}=A^{T}$",
].join("\n");

const WARMUP_11_05_EXPLANATION = [
  "주어진 식 $A^T=A^TA$를 전치하면 $A=A^TA$이다.",
  "두 식의 오른쪽이 같으므로 $A=A^T$이고, 다시 $A=A^TA=A^2$가 되어 (ㄱ), (ㄷ)은 참이다.",
  "행렬식은 $\\det A=0$도 가능하므로 (ㄴ), (ㄹ)은 보장되지 않는다.",
].join("\n");

const KW_12_STEM = [
  "원점 주변에서 정의된 함수 $f(x),\\,g(x),\\,h(x)$가 다음과 같다. $\\dfrac{d}{dx}(h\\circ f)(0)$의 값은?",
  "",
  "$f(x)=\\dfrac{2\\sin x}{g(x)+1}$",
  "$g(x)$는 $g(0)=1$인 연속함수",
  "$h(x)=x|x+1|$",
].join("\n");

const EWHA_11_EXPLANATION = [
  "a. 참: 외적 $u\\times v$는 $u$와 $v$에 모두 수직이므로 $u\\cdot(u\\times v)=0$이다.",
  "b. 참: $u\\ne 0$일 때 $u\\cdot v=0$은 $v\\perp u$, $u\\times v=0$은 $v\\parallel u$를 뜻하므로 두 조건을 동시에 만족하는 $v$는 $0$뿐이다.",
  "c. 거짓: $v-w$가 $u$와 평행이면 $u\\times v=u\\times w$이면서 $v\\ne w$일 수 있다.",
  "d. 참: 스칼라 삼중적의 절댓값은 세 벡터가 만드는 평행육면체의 부피이므로 $\\|u\\|\\|v\\|\\|w\\|$ 이하이다.",
  "따라서 옳은 것은 a, b, d이다.",
].join("\n");

const SEOULTECH_01_EXPLANATION = [
  "ㄱ. 로피탈 정리로 $1$. **참**.",
  "ㄴ. $e$의 정의. **참**.",
  "ㄷ. $e$의 정의를 변형한 꼴. **참**.",
  "ㄹ. $x^{1/(x-1)}=e^{\\ln x/(x-1)}$이고 $x\\to 1$에서 $\\ln x/(x-1)\\to 1$이므로 $e$. **참**.",
  "ㅁ. $e$의 정의. **참**.",
  "ㅂ. $e^x$의 매클로린 급수에 $x=1$을 대입한 값. **참**.",
  "모두 참이므로 $6$개.",
].join("\n");

const WHITE_08_28_EXPLANATION = [
  "28) $f(x)=\\tan x-x+\\frac{\\pi}{4}-\\int_{0}^{x} f^{\\prime}(u) \\tan ^{2} u d u \\cdots$ (ㄱ)에서",
  "$$\\begin{aligned}",
  "& f^{\\prime}(x)=\\sec ^{2} x-1-f^{\\prime}(x) \\tan ^{2} x \\\\",
  "\\Rightarrow & \\left(1+\\tan ^{2} x\\right) f^{\\prime}(x)=\\sec ^{2} x-1 \\\\",
  "\\Rightarrow & 1+\\tan ^{2} x=\\sec ^{2} x",
  "\\end{aligned}$$",
  "",
  "따라서 $\\sec ^{2} x f^{\\prime}(x)=\\tan ^{2} x$ 이므로 $f^{\\prime}(x)=\\sin ^{2} x$ 이다.",
  "$$\\begin{aligned}",
  "f(x) & =\\int \\sin ^{2} x d x=\\int \\frac{1}{2}(1-\\cos 2 x) d x \\\\",
  "& =\\frac{1}{2}\\left(x-\\frac{1}{2} \\sin 2 x\\right)+C",
  "\\end{aligned}$$",
  "",
  "이고 (ㄱ)에 $x=0$ 을 대입하면",
  "$f(0)=\\tan 0-0+\\frac{\\pi}{4}-\\int_{0}^{0} f^{\\prime}(u) \\tan ^{2} u d u$ 이므로",
  "$f(0)=\\frac{\\pi}{4}$ 이다. 따라서 $f(0)=0+C$ 이므로 $C=\\frac{\\pi}{4}$ 이다.",
].join("\n");

/**
 * Per-row rewrites. Each entry maps a field to either a literal replacement or a
 * function of the current value.
 */
const MANUAL_FIXES = {
  "q-2021pm-ajou-43": { question: AJOU_43_TABLE },
  "q-ryu-self-warmup-r05-14": { question: WARMUP_05_14 },
  "q-ryu-self-warmup-r11-05": { question: WARMUP_11_05, explanation: WARMUP_11_05_EXPLANATION },
  "q-2025-kw-12": { question: KW_12_STEM },
  "q-2021-ewha-11": { explanation: EWHA_11_EXPLANATION },
  "q-2025-seoultech-01": { explanation: SEOULTECH_01_EXPLANATION },
  "q-white-final-a-r08-28": { explanation: WHITE_08_28_EXPLANATION },
  "q-2024-inha-11": {
    explanation: (value) => value.replace("\\dfrac{|外적|}{2}", "\\dfrac{|\\vec{AB}\\times\\vec{AC}|}{2}"),
  },
  "q-2025-inha-28": {
    explanation: () =>
      "폐곡선을 만들고 그린 정리를 적용한다. $\\displaystyle\\iint_D(3x^2-2xy+3y^2)\\,dA$에서 추가한 선분 위의 적분을 빼면 $\\dfrac{3}{4}\\pi-2$이다.",
  },
  // Editorial notes about the source PDF must not be shown to students. Both stems
  // below also disagreed with their own answer key, so the expression is restored
  // to the one the explanation actually evaluates.
  //   ln(sin 4x)/ln(sin 2x) -> 1, but the key and the worked solution give 2.
  "q-2022-gachon-08": {
    question: () =>
      "$\\displaystyle\\lim_{x\\to 0}\\dfrac{\\sin(\\sin 4x)}{\\ln(1+2x)}$의 값은?",
    explanation: () =>
      [
        "$x\\to 0$에서 $\\sin(\\sin 4x)\\sim\\sin 4x\\sim 4x$이고 $\\ln(1+2x)\\sim 2x$이다.",
        "",
        "$\\displaystyle\\lim_{x\\to 0}\\dfrac{\\sin(\\sin 4x)}{\\ln(1+2x)}" +
          "=\\lim_{x\\to 0}\\dfrac{\\sin(\\sin 4x)}{\\sin 4x}\\cdot\\dfrac{\\sin 4x}{4x}" +
          "\\cdot\\dfrac{2x}{\\ln(1+2x)}\\cdot 2=1\\cdot 1\\cdot 1\\cdot 2=2$",
      ].join("\n"),
  },
  //   θ 범위의 π가 누락되어 있어 [3π/2, 2π]로 복원하면 답이 4-2√2가 된다.
  "q-2023-gachon-a-04": {
    question: (value) =>
      value
        .replace(/\s*\*\([^)]*\)\*\s*$/, "")
        .replace("$\\dfrac{3}{2}\\le\\theta\\le 2\\pi$", "$\\dfrac{3\\pi}{2}\\le\\theta\\le 2\\pi$"),
    explanation: (value) =>
      value.replace(
        "**3단계 — 적분.** 해당 구간에서 적분 → $4-2\\sqrt 2$ 도출.",
        "**3단계 — 적분.** $u=\\tfrac{\\pi}{4}-\\tfrac{\\theta}{2}$로 치환하면 " +
          "$L=4\\displaystyle\\int_{-3\\pi/4}^{-\\pi/2}|\\cos u|\\,du=4-2\\sqrt 2$이다.",
      ),
  },
  "q-2018-skku-11": {
    explanation: (value) => value.replace("(주: ", "(참고: "),
  },
  // Self-contained descriptions that only mention a figure they do not need.
  "q-daily-eng-r22-2": {
    question: (value) => value.replace("그림과 같은 반원", "반원"),
  },
  // OCR turned the identity matrix into "4 / 7"; the explanation works from A^2 = 4I.
  "q-white-final-a-r04-10": {
    question: (value) => value.replace("$A^{2}=4 / 7$", "$A^{2}=4I$"),
  },
};

// ------------------------------------------------------------------- run

const PAGE = 1000;
async function fetchAll() {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb
      .from("questions")
      .select("id, question, options, explanation, answer_text")
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows;
}

console.log("Fetching questions...");
const questions = await fetchAll();
console.log(`Fetched ${questions.length} questions.`);

function applyManual(id, field, value) {
  const rule = MANUAL_FIXES[id]?.[field];
  if (rule === undefined) return value;
  return typeof rule === "function" ? rule(value) : rule;
}

const updates = [];
const changeLog = [];

for (const q of questions) {
  const patch = {};

  const question = autoFix(applyManual(q.id, "question", q.question ?? ""));
  if (question !== (q.question ?? "")) patch.question = question;

  const explanation = autoFix(applyManual(q.id, "explanation", q.explanation ?? ""));
  if (explanation !== (q.explanation ?? "")) patch.explanation = explanation;

  const answerText = autoFix(applyManual(q.id, "answer_text", q.answer_text ?? ""));
  if (q.answer_text != null && answerText !== q.answer_text) patch.answer_text = answerText;

  const options = Array.isArray(q.options) ? q.options : null;
  if (options) {
    let optionChanged = false;
    const nextOptions = options.map((option) => {
      const text = option?.text;
      if (typeof text !== "string" || !text.trim()) return option;
      const fixed = autoFix(text);
      if (fixed === text) return option;
      optionChanged = true;
      return { ...option, text: fixed };
    });
    if (optionChanged) patch.options = nextOptions;
  }

  if (!Object.keys(patch).length) continue;

  updates.push({ id: q.id, patch });
  changeLog.push({
    id: q.id,
    fields: Object.keys(patch),
    before: {
      question: patch.question !== undefined ? q.question : undefined,
      explanation: patch.explanation !== undefined ? q.explanation : undefined,
      options: patch.options !== undefined ? options.map((o) => o.text) : undefined,
      answer_text: patch.answer_text !== undefined ? q.answer_text : undefined,
    },
    after: {
      question: patch.question,
      explanation: patch.explanation,
      options: patch.options?.map((o) => o.text),
      answer_text: patch.answer_text,
    },
  });
}

writeFileSync(resolve(outDir, "render_breakage_fixes.json"), `${JSON.stringify(changeLog, null, 2)}\n`, "utf8");

console.log(`\nRows to update: ${updates.length}`);
const fieldCounts = changeLog.reduce((acc, entry) => {
  for (const field of entry.fields) acc[field] = (acc[field] ?? 0) + 1;
  return acc;
}, {});
console.log("Field counts:", fieldCounts);

const unmatchedManual = Object.keys(MANUAL_FIXES).filter((id) => !updates.some((u) => u.id === id));
if (unmatchedManual.length) console.log("WARNING: manual fixes that produced no change:", unmatchedManual);

if (!APPLY) {
  console.log("\nDry run. Re-run with --apply to write.");
  console.log(`Diff written to ${resolve(outDir, "render_breakage_fixes.json")}`);
  process.exit(0);
}

let done = 0;
for (const { id, patch } of updates) {
  const { error } = await sb.from("questions").update(patch).eq("id", id);
  if (error) throw new Error(`${id}: ${error.message}`);
  done += 1;
  if (done % 25 === 0) console.log(`  updated ${done}/${updates.length}`);
}
console.log(`\nUpdated ${done} rows.`);
