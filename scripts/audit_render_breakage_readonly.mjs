// Read-only audit: which question rows actually render broken in the app?
//
// Unlike the text-pattern audits, this one pushes every visible field through the
// real KaTeXRenderer pipeline (scripts/lib/render_pipeline.mjs) and reports what a
// student would literally see on screen: KaTeX failures, stray `$` delimiters,
// LaTeX macros leaking into body text, stems cut off mid-sentence, and figure
// references with no image attached.
//
// Outputs:
//   tmp/audit/render_breakage_report.json
//   tmp/audit/render_breakage_issues.csv
//   tmp/audit/render_breakage_review_queue.json

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  countDollarDelimiters,
  inspectRender,
  isViewMarkerStatementLine,
  normalizeContent,
  splitMath,
  splitRenderBlocks,
} from "./lib/render_pipeline.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const outDir = resolve(root, "tmp", "audit");
mkdirSync(outDir, { recursive: true });

const envText = readFileSync(resolve(root, ".env.local"), "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return [key.trim(), rest.join("=").trim()];
    }),
);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) throw new Error("Missing Supabase credentials in .env.local");

const sb = createClient(supabaseUrl, supabaseKey);
const PAGE = 1000;

async function fetchAllQuestions() {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb
      .from("questions")
      .select(
        "id, subject, unit, concept, difficulty, pool, question, content_type, question_image, question_type, options, correct_option_id, answer_text, explanation, explanation_content_type, explanation_image, tags",
      )
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows;
}

function excerpt(value, max = 300) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function csvCell(value) {
  const text = value == null ? "" : typeof value === "string" ? value : JSON.stringify(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function optionList(q) {
  return Array.isArray(q.options) ? q.options : [];
}

// LaTeX macros that are meaningless as body text — if they show up outside `$…$`
// the student sees the raw command.
const MACRO_OUTSIDE_MATH_RX =
  /\\(?:frac|dfrac|tfrac|sqrt|int|iint|iiint|oint|sum|prod|lim|log|ln|sin|cos|tan|sec|csc|cot|det|dim|ker|rank|min|max|inf|sup|left|right|begin|end|mathbb|mathbf|mathrm|mathcal|text|textbf|displaystyle|cdot|cdots|ldots|vdots|ddots|times|div|pm|mp|leq|geq|neq|approx|equiv|infty|alpha|beta|gamma|delta|theta|lambda|mu|pi|sigma|phi|omega|Delta|Gamma|Lambda|Sigma|Phi|Omega|partial|nabla|vec|hat|bar|overline|underline|binom|matrix|pmatrix|bmatrix|vmatrix|array|quad|qquad|,|;|:|!)\b/;

const DANGLING_TAIL_RX = /[+\-*/=<>^_(\[{,·:;\\|~]$/;
const SENTENCE_END_RX =
  /(?:[?？!！.。]|하시오|구하시오|하라|구하라|쓰시오|고르시오|답하시오|것은|값은|얼마인가|무엇인가|구하면|주어진다|하시오\.|오|다|가|요|\]|\)|:)$/;

// "극좌표에서" / "부표에서" must not read as "표에서", and "그래프가 같지 않은" is a
// comparison between formulas rather than a reference to a printed graph.
const FIGURE_REFERENCE_RX =
  /(?:다음|아래|위)\s*(?:그림|그래프|도형|표)|그림과\s*같|그래프가?\s*(?:주어|나타)|도형과\s*같|그림에서|(?<![가-힣])표에서|그림\s*[1-9]|<그림/;

// Statement-list markers used by <보기>-style problems. When a whole run of them
// sits on one physical line the app renders an unreadable wall of text.
// Mirrors the renderer's marker classes so the audit only reports statement runs
// the renderer could not split by itself.
const STATEMENT_MARKER_SETS = [
  { name: "korean_dot", rx: /(?<=^|\s)(가|나|다|라|마|바)[.)](?=\s)/g, order: ["가", "나", "다", "라", "마", "바"] },
  { name: "jamo_dot", rx: /(?<=^|\s)(ㄱ|ㄴ|ㄷ|ㄹ|ㅁ|ㅂ)[.)](?=\s)/g, order: ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ"] },
  { name: "choseong_dot", rx: /(?<=^|\s)(ᄀ|ᄂ|ᄃ|ᄅ|ᄆ|ᄇ)[.)](?=\s)/g, order: ["ᄀ", "ᄂ", "ᄃ", "ᄅ", "ᄆ", "ᄇ"] },
  { name: "circled_latin", rx: /(ⓐ|ⓑ|ⓒ|ⓓ|ⓔ|ⓕ)/g, order: ["ⓐ", "ⓑ", "ⓒ", "ⓓ", "ⓔ", "ⓕ"] },
  { name: "latin_lower_dot", rx: /(?<=^|\s)(a|b|c|d|e|f)[.)](?=\s)/g, order: ["a", "b", "c", "d", "e", "f"] },
  { name: "latin_upper_dot", rx: /(?<=^|\s)(A|B|C|D|E|F)[.)](?=\s)/g, order: ["A", "B", "C", "D", "E", "F"] },
  { name: "paren_latin_lower", rx: /\((a|b|c|d|e|f)\)(?=\s)/g, order: ["a", "b", "c", "d", "e", "f"] },
  { name: "paren_latin_upper", rx: /\((A|B|C|D|E|F)\)(?=\s)/g, order: ["A", "B", "C", "D", "E", "F"] },
  { name: "roman_lower", rx: /\((i|ii|iii|iv|v)\)(?=\s)/g, order: ["i", "ii", "iii", "iv", "v"] },
];

const MARKDOWN_TABLE_RX = /\|[^\n|]*\|[^\n|]*\|/;
// Notes to self, wherever they appear.
const AUTHORING_NOTE_RX = /검토\s*필요|재확인\s*필요|확인\s*바람|TODO|FIXME/;
// Provenance asides: fine inside an explanation, never in a stem or an option.
const SOURCE_ASIDE_RX =
  /원\s*PDF|원문\s*(?:표기|기준|에서는)|출제\s*오류|오타\s*(?:추정|로)|해설\s*기준으로|편집자?\s*주|\(주:/;
const MARKDOWN_EMPHASIS_RX = /\*\*[^*\n]+\*\*|(?<![\w*])\*\([^)\n]+\)\*/;
const HANGUL_RX = /[가-힣]/;

/** Hangul in math mode without a \text-like wrapper renders mis-spaced. */
function hasBareHangulInMath(mathText) {
  const stripped = String(mathText).replace(
    /\\(?:text|textbf|textit|textrm|mathrm|mbox|hbox|operatorname)\s*\{[^{}]*\}/g,
    "",
  );
  return HANGUL_RX.test(stripped);
}

/** Detect a run of statement markers crammed onto one physical line. */
function inlineStatementRun(line) {
  for (const set of STATEMENT_MARKER_SETS) {
    set.rx.lastIndex = 0;
    const hits = [...line.matchAll(set.rx)];
    const found = hits.map((m) => m[1] ?? m[0]);
    if (found.length < 2) continue;
    // Require the canonical order (가, 나, 다 …) starting at the first marker so a
    // stray "(a)" or a bare "다 " inside prose does not trip the rule.
    const indices = found.map((token) => set.order.indexOf(token));
    if (indices.some((index) => index < 0)) continue;
    const ordered = indices.every((value, i) => i === 0 || value > indices[i - 1]);
    // Adjacent markers ("따라서 ⓐ,ⓑ만 참이다") reference statements, they are not one.
    const spaced = hits.every((hit, i) => i === 0 || hit.index - hits[i - 1].index >= 6);
    if (ordered && spaced && indices[0] === 0) return { set: set.name, markers: found };
  }
  return null;
}

const MOJIBAKE_RX = /[�]|[ÃÂ][-¿]|â[-]|ì[-¿]|í[-¿]{2}/;

const issues = [];
function addIssue(issue) {
  issues.push(issue);
}

function issueBase(q) {
  return {
    id: q.id,
    subject: q.subject,
    unit: q.unit,
    concept: q.concept,
    difficulty: q.difficulty,
    pool: q.pool,
  };
}

/** Field-level render checks shared by question / options / explanation. */
function checkField(q, field, rawText, { isStem = false } = {}) {
  const text = String(rawText ?? "");
  if (!text.trim()) return;

  const report = inspectRender(text);

  for (const err of report.mathErrors) {
    addIssue({
      severity: "P0",
      category: "render",
      code: "math_render_error",
      ...issueBase(q),
      field,
      message: "KaTeX cannot compile this expression; the app falls back to raw source text.",
      evidence: excerpt(err.math, 160),
      meta: { katexError: err.message, blockType: err.blockType },
    });
  }

  const missingGlyphs = [...new Set(report.glyphWarnings.map((w) => w.char))];
  if (missingGlyphs.length) {
    addIssue({
      severity: "P0",
      category: "render",
      code: "math_missing_glyph",
      ...issueBase(q),
      field,
      message: "KaTeX has no metrics for these characters inside math; they render blank or overlapping.",
      evidence: excerpt(report.glyphWarnings[0].math, 160),
      meta: { chars: missingGlyphs },
    });
  }

  for (const segment of report.mathSegments) {
    if (hasBareHangulInMath(segment.text)) {
      addIssue({
        severity: "P1",
        category: "render",
        code: "hangul_inside_math",
        ...issueBase(q),
        field,
        message: "Korean text sits inside `$…$` without \\text{}; it renders with broken spacing.",
        evidence: excerpt(segment.text, 160),
      });
      break;
    }
  }

  // A `$` surviving into rendered body text means a delimiter never paired up.
  if (/(?<!\\)\$/.test(report.literalText)) {
    const totalDollars = countDollarDelimiters(text);
    addIssue({
      severity: "P0",
      category: "render",
      code: totalDollars % 2 === 1 ? "unbalanced_math_delimiter" : "math_delimiter_split_by_block",
      ...issueBase(q),
      field,
      message:
        totalDollars % 2 === 1
          ? "Odd number of `$` delimiters; a math region never closes and `$` is printed literally."
          : "Delimiters are balanced overall but a line/view split cuts a math region, printing `$` literally.",
      evidence: excerpt(text),
      meta: { dollarCount: totalDollars, visibleLiteral: excerpt(report.literalText, 160) },
    });
  }

  const macroMatch = report.literalText.match(MACRO_OUTSIDE_MATH_RX);
  if (macroMatch) {
    addIssue({
      severity: "P0",
      category: "render",
      code: "latex_macro_outside_math",
      ...issueBase(q),
      field,
      message: "A LaTeX macro sits outside `$…$` and is printed as raw text.",
      evidence: excerpt(text),
      meta: { macro: macroMatch[0], visibleLiteral: excerpt(report.literalText, 160) },
    });
  }

  if (/₩/.test(text)) {
    addIssue({
      severity: "P0",
      category: "encoding",
      code: "won_sign_for_backslash",
      ...issueBase(q),
      field,
      message: "Won sign (₩) stands where a LaTeX backslash should be (CP949 conversion artifact).",
      evidence: excerpt(text),
    });
  }

  if (MOJIBAKE_RX.test(text)) {
    addIssue({
      severity: "P0",
      category: "encoding",
      code: "mojibake_or_replacement_char",
      ...issueBase(q),
      field,
      message: "Text contains replacement characters or mis-decoded bytes.",
      evidence: excerpt(text),
    });
  }

  if (MARKDOWN_TABLE_RX.test(report.literalText)) {
    addIssue({
      severity: "P1",
      category: "render",
      code: "markdown_table_in_text",
      ...issueBase(q),
      field,
      message: "Markdown table pipes are printed literally; the renderer has no table support.",
      evidence: excerpt(text),
    });
  }

  const asideForbidden = field !== "explanation";
  if (AUTHORING_NOTE_RX.test(report.literalText) || (asideForbidden && SOURCE_ASIDE_RX.test(report.literalText))) {
    addIssue({
      severity: "P1",
      category: "content",
      code: "authoring_note_visible",
      ...issueBase(q),
      field,
      message: "Editorial/authoring note is shown to students inside the visible content.",
      evidence: excerpt(text),
    });
  }

  // `**bold**` and long inline formulas are handled by the renderer, so only the
  // markdown forms it cannot express (italics, tables) are reported here.
  if (MARKDOWN_EMPHASIS_RX.test(report.literalText.replace(/\*\*[^*\n]+\*\*/g, ""))) {
    addIssue({
      severity: "P2",
      category: "render",
      code: "markdown_emphasis_literal",
      ...issueBase(q),
      field,
      message: "Markdown emphasis markers are printed literally.",
      evidence: excerpt(text),
    });
  }

  if (/\\\\/.test(report.literalText)) {
    addIssue({
      severity: "P1",
      category: "render",
      code: "backslash_break_outside_math",
      ...issueBase(q),
      field,
      message: "A LaTeX line break (\\\\) sits outside math and is printed literally.",
      evidence: excerpt(text),
    });
  }

  for (const line of report.normalized.split("\n")) {
    // Markers inside `$…$` (e.g. \mathrm{rank}(A)+\mathrm{rank}(B)) are not
    // statement labels, so compare against the literal text only.
    const literalLine = splitMath(line)
      .map((segment) => (segment.math ? " ⟨식⟩ " : segment.text))
      .join("");
    const run = inlineStatementRun(literalLine);
    if (run && line.trim().length > 110) {
      addIssue({
        severity: "P1",
        category: "readability",
        code: "inline_statement_list",
        ...issueBase(q),
        field,
        message: "A 보기-style statement list is crammed onto one line instead of separate lines.",
        evidence: excerpt(line),
        meta: { markerSet: run.set, markers: run.markers },
      });
      break;
    }
  }

  if (/&(?:amp|lt|gt|quot|#\d+);/.test(text)) {
    addIssue({
      severity: "P1",
      category: "render",
      code: "html_entity_in_text",
      ...issueBase(q),
      field,
      message: "HTML entity appears in content and is shown literally.",
      evidence: excerpt(text),
    });
  }

  // Truncation: the visible sentence just stops.
  const visible = report.plainText.replace(/\s+/g, " ").trim();
  const stemTail = text.trim();
  if (isStem) {
    const endsDangling = DANGLING_TAIL_RX.test(stemTail);
    // A stem whose last line is a choice item still asks its question earlier on.
    const asksSomewhere = /[?？]|하시오|구하시오|고르시오|고른\s*것|하라|쓰시오/.test(stemTail);
    const endsSentence = SENTENCE_END_RX.test(visible) || asksSomewhere;
    if (endsDangling) {
      addIssue({
        severity: "P1",
        category: "truncation",
        code: "stem_ends_mid_expression",
        ...issueBase(q),
        field,
        message: "Stem ends on a dangling operator or bracket; text looks cut off.",
        evidence: excerpt(text),
      });
    } else if (!endsSentence && visible.length > 0) {
      addIssue({
        severity: "P1",
        category: "truncation",
        code: "stem_missing_question_ending",
        ...issueBase(q),
        field,
        message: "Stem has no question/imperative ending; likely truncated mid-sentence.",
        evidence: excerpt(text),
        meta: { visibleTail: visible.slice(-60) },
      });
    }
  }

}

console.log("Fetching questions...");
const questions = await fetchAllQuestions();
console.log(`Fetched ${questions.length} questions.`);

for (const q of questions) {
  checkField(q, "question", q.question, { isStem: true });
  checkField(q, "explanation", q.explanation);
  checkField(q, "answer_text", q.answer_text);

  const opts = optionList(q);
  opts.forEach((option, index) => {
    checkField(q, `option:${option?.id ?? index + 1}`, option?.text);
  });

  // Structural gaps that make a problem unanswerable on screen.
  const stem = String(q.question ?? "");
  const hasImage = Boolean(String(q.question_image ?? "").trim());
  const hasDrawnMath = /\\begin\{(?:tikzpicture|picture|array|tabular)\}/.test(stem);
  if (FIGURE_REFERENCE_RX.test(stem) && !hasImage && !hasDrawnMath) {
    addIssue({
      severity: "P1",
      category: "missing_asset",
      code: "figure_reference_without_image",
      ...issueBase(q),
      field: "question_image",
      message: "Stem refers to a figure/graph/table but no image is attached.",
      evidence: excerpt(stem),
    });
  }

  const mentionsView = /<\s*보기\s*>|\[\s*보기\s*\]|보기\s*(?:에서|중|의|를|가)/.test(stem);
  // Ask the renderer itself whether the stem produces a 보기 block or at least a
  // set of separate statement lines.
  const stemBlocks = stem.trim() ? splitRenderBlocks(normalizeContent(stem)) : [];
  const statementLines = normalizeContent(stem)
    .split("\n")
    .filter((line) => isViewMarkerStatementLine(line, true)).length;
  const hasViewBlock = stemBlocks.some((block) => block.type === "view") || statementLines >= 2;
  // "다음 보기 중 …" often just points at the answer options rather than a 보기 box.
  const viewMeansOptions = /보기\s*(?:중|에서|의)/.test(stem) && statementLines === 0 && opts.length > 0;
  if (mentionsView && !hasViewBlock && !hasImage && !viewMeansOptions) {
    addIssue({
      severity: "P1",
      category: "missing_asset",
      code: "view_reference_without_view_block",
      ...issueBase(q),
      field: "question",
      message: "Stem refers to <보기> but no 보기 statements are present.",
      evidence: excerpt(stem),
    });
  }

  if (q.question_type !== "subjective" && opts.length > 0) {
    opts.forEach((option, index) => {
      const optionText = String(option?.text ?? "").trim();
      const optionImage = String(option?.image ?? "").trim();
      if (!optionText && !optionImage) {
        addIssue({
          severity: "P0",
          category: "render",
          code: "empty_option",
          ...issueBase(q),
          field: `option:${option?.id ?? index + 1}`,
          message: "Option has neither text nor image; renders blank.",
          evidence: "",
        });
      }
    });

    const seen = new Map();
    opts.forEach((option, index) => {
      const key = String(option?.text ?? "").replace(/\s+/g, "").trim();
      if (!key) return;
      if (seen.has(key)) {
        addIssue({
          severity: "P1",
          category: "content",
          code: "duplicate_option_text",
          ...issueBase(q),
          field: `option:${option?.id ?? index + 1}`,
          message: "Two options render identically, so one of them can never be correct.",
          evidence: excerpt(option?.text),
          meta: { duplicateOf: seen.get(key) },
        });
      } else {
        seen.set(key, option?.id ?? String(index + 1));
      }
    });

    // When every option is just a pointer ("①", "②, ③"), the stem is *supposed* to
    // carry the list — that is the 보기 layout, not duplicated choices.
    const optionsArePointers = opts.every((option) =>
      /^(?:[①②③④⑤⑥⑦⑧⑨](?:\s*[,，]\s*[①②③④⑤⑥⑦⑧⑨])*(?:\s*(?:만|뿐|모두))?|모두[^\n]{0,12})$/u.test(
        String(option?.text ?? "").trim(),
      ),
    );
    const circledInStem = (stem.match(/[①②③④⑤⑥⑦⑧⑨]/g) ?? []).length;
    if (circledInStem >= 3 && !optionsArePointers) {
      addIssue({
        severity: "P1",
        category: "content",
        code: "options_inlined_in_stem",
        ...issueBase(q),
        field: "question",
        message: "Answer choices are duplicated inside the stem while the option list also exists.",
        evidence: excerpt(stem),
        meta: { circledInStem },
      });
    }
  }

  // content_type gates what ContentRenderer actually shows.
  const questionType = String(q.content_type ?? "latex");
  if ((questionType === "image" || questionType === "mixed") && !hasImage) {
    addIssue({
      severity: questionType === "image" ? "P0" : "P1",
      category: "render",
      code: "content_type_image_without_image",
      ...issueBase(q),
      field: "content_type",
      message:
        questionType === "image"
          ? "content_type is 'image' but question_image is empty; the stem renders as '내용 없음'."
          : "content_type is 'mixed' but question_image is empty.",
      evidence: excerpt(stem),
      meta: { contentType: questionType },
    });
  }
  if (questionType === "latex" && hasImage) {
    addIssue({
      severity: "P1",
      category: "render",
      code: "content_type_hides_image",
      ...issueBase(q),
      field: "content_type",
      message: "question_image is set but content_type is 'latex', so the image is never displayed.",
      evidence: excerpt(String(q.question_image ?? ""), 160),
    });
  }

  const explanationType = String(q.explanation_content_type ?? "latex");
  const hasExplanationImage = Boolean(String(q.explanation_image ?? "").trim());
  if (explanationType === "image" && !hasExplanationImage) {
    addIssue({
      severity: "P1",
      category: "render",
      code: "explanation_content_type_without_image",
      ...issueBase(q),
      field: "explanation_content_type",
      message: "explanation_content_type is 'image' but explanation_image is empty; the explanation renders empty.",
      evidence: excerpt(q.explanation),
    });
  }
  if (explanationType === "latex" && hasExplanationImage) {
    addIssue({
      severity: "P2",
      category: "render",
      code: "explanation_image_hidden",
      ...issueBase(q),
      field: "explanation_content_type",
      message: "explanation_image is set but explanation_content_type is 'latex', so the image is never displayed.",
      evidence: excerpt(String(q.explanation_image ?? ""), 160),
    });
  }
}

const severityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
issues.sort((a, b) => {
  const bySeverity = (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9);
  if (bySeverity) return bySeverity;
  const byCode = a.code.localeCompare(b.code);
  if (byCode) return byCode;
  return String(a.id).localeCompare(String(b.id));
});

const countBy = (items, keyFn) =>
  items.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

const questionById = new Map(questions.map((q) => [q.id, q]));
const issuesByQuestion = new Map();
for (const issue of issues) {
  if (!issuesByQuestion.has(issue.id)) issuesByQuestion.set(issue.id, []);
  issuesByQuestion.get(issue.id).push(issue);
}

const reviewQueue = [...issuesByQuestion.entries()]
  .map(([id, rowIssues]) => {
    const q = questionById.get(id);
    return {
      id,
      severities: [...new Set(rowIssues.map((i) => i.severity))].sort(),
      codes: [...new Set(rowIssues.map((i) => i.code))].sort(),
      issues: rowIssues,
      subject: q?.subject,
      unit: q?.unit,
      concept: q?.concept,
      pool: q?.pool,
      tags: q?.tags,
      question: q?.question,
      question_image: q?.question_image,
      options: q?.options,
      correct_option_id: q?.correct_option_id,
      answer_text: q?.answer_text,
      explanation: q?.explanation,
    };
  })
  .sort((a, b) => (severityRank[a.severities[0]] ?? 9) - (severityRank[b.severities[0]] ?? 9));

const summary = {
  generatedAt: new Date().toISOString(),
  questionCount: questions.length,
  issueCount: issues.length,
  affectedQuestionCount: reviewQueue.length,
  severityCounts: countBy(issues, (i) => i.severity),
  categoryCounts: countBy(issues, (i) => i.category),
  codeCounts: countBy(issues, (i) => i.code),
  codeByAffectedRows: Object.fromEntries(
    [...new Set(issues.map((i) => i.code))].map((code) => [
      code,
      new Set(issues.filter((i) => i.code === code).map((i) => i.id)).size,
    ]),
  ),
  poolCounts: countBy(issues, (i) => i.pool ?? "unknown"),
};

const reportPath = resolve(outDir, "render_breakage_report.json");
const csvPath = resolve(outDir, "render_breakage_issues.csv");
const queuePath = resolve(outDir, "render_breakage_review_queue.json");

writeFileSync(reportPath, `${JSON.stringify({ summary, issues }, null, 2)}\n`, "utf8");
writeFileSync(queuePath, `${JSON.stringify(reviewQueue, null, 2)}\n`, "utf8");
writeFileSync(
  csvPath,
  [
    ["severity", "category", "code", "id", "pool", "subject", "unit", "field", "message", "evidence", "meta"]
      .map(csvCell)
      .join(","),
    ...issues.map((issue) =>
      [
        issue.severity,
        issue.category,
        issue.code,
        issue.id,
        issue.pool,
        issue.subject,
        issue.unit,
        issue.field,
        issue.message,
        issue.evidence,
        issue.meta ?? {},
      ]
        .map(csvCell)
        .join(","),
    ),
  ].join("\n"),
  "utf8",
);

console.log("\n=== Render Breakage Audit ===");
console.log(JSON.stringify(summary, null, 2));
console.log(`\nReport: ${reportPath}`);
console.log(`CSV: ${csvPath}`);
console.log(`Review queue: ${queuePath}`);
