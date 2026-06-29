// Normalize rendering artifacts that make math/view blocks display incorrectly.
// Updates both questions and generated_exams problem snapshots.
// Usage:
//   node scripts/fix_rendering_artifacts.mjs --dry-run
//   node scripts/fix_rendering_artifacts.mjs
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const dryRun = process.argv.includes("--dry-run");

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

const MATH_PATTERN = /((?<!\\)\$\$[\s\S]+?(?<!\\)\$\$|(?<!\\)\$[\s\S]+?(?<!\\)\$)/g;
const VIEW_MARKER = "\\((?:가|나|다|라|마|바|사|아|ㄱ|ㄴ|ㄷ|ㄹ|ㅁ|ㅂ|ㅅ|ㅇ|A|B|C|D|E|F)\\)";

async function fetchAll(table, select) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb
      .from(table)
      .select(select)
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows;
}

function countDollarDelimiters(value) {
  return (String(value ?? "").match(/(?<!\\)\$/g) ?? []).length;
}

function normalizeMathDelimiters(value) {
  let text = String(value ?? "").replace(/\r\n?/g, "\n");

  const unescapedDollarCandidate = text.replace(/\\\$/g, "$");
  if (
    unescapedDollarCandidate !== text &&
    countDollarDelimiters(unescapedDollarCandidate) >= 2 &&
    countDollarDelimiters(unescapedDollarCandidate) % 2 === 0
  ) {
    text = unescapedDollarCandidate;
  }

  return text
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, body) => `$$${body}$$`)
    .replace(/\\\(([\s\S]+?)\\\)/g, (_, body) => `$${body}$`);
}

function splitMathPreserve(value) {
  const text = String(value ?? "");
  const segments = [];
  let lastIndex = 0;
  let match;
  MATH_PATTERN.lastIndex = 0;

  while ((match = MATH_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ math: false, raw: text.slice(lastIndex, match.index) });
    }
    segments.push({ math: true, raw: match[0] });
    lastIndex = MATH_PATTERN.lastIndex;
  }
  if (lastIndex < text.length) segments.push({ math: false, raw: text.slice(lastIndex) });
  return segments;
}

function normalizeBodyTextOutsideMath(text, forceNumericBreaks = false) {
  let normalized = text
    .replace(/\s*\\q?quad\s*(?=\((?:[1-9]|가|나|다|라|마|바|ㄱ|ㄴ|ㄷ|ㄹ|ㅁ|ㅂ|A|B|C|D|E)\))/g, "\n")
    .replace(new RegExp(`[ \\t]+(${VIEW_MARKER})`, "g"), "\n$1")
    .replace(/([?？])\s+(\((?:1|가|ㄱ|A)\))/g, "$1\n\n$2");

  const numericMarkers = normalized.match(/\([1-9]\)/g) ?? [];
  if (forceNumericBreaks || numericMarkers.length >= 2) normalized = normalized.replace(/[ \t]+(\([2-9]\))/g, "\n$1");

  return normalized;
}

function normalizeBodyField(value) {
  const segments = splitMathPreserve(normalizeMathDelimiters(value));
  const outsideText = segments.filter((segment) => !segment.math).map((segment) => segment.raw).join(" ");
  const forceNumericBreaks = /\(1\)/.test(outsideText) && /\([2-9]\)/.test(outsideText);
  return segments
    .map((segment) => (segment.math ? segment.raw : normalizeBodyTextOutsideMath(segment.raw, forceNumericBreaks)))
    .join("")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeInlineField(value) {
  return normalizeMathDelimiters(value).replace(/\r\n?/g, "\n").trim();
}

function normalizeOptions(options) {
  if (!Array.isArray(options)) return options;
  let changed = false;
  const next = options.map((option) => {
    if (!option || typeof option !== "object") return option;
    const oldText = option.text ?? "";
    const newText = normalizeInlineField(oldText);
    if (newText !== oldText) changed = true;
    return newText === oldText ? option : { ...option, text: newText };
  });
  return changed ? next : options;
}

function normalizeQuestionRow(row) {
  const update = {};
  const question = normalizeBodyField(row.question ?? "");
  const explanation = normalizeBodyField(row.explanation ?? "");
  const options = normalizeOptions(row.options);
  const answerText = row.answer_text == null ? row.answer_text : normalizeInlineField(row.answer_text);

  if (question !== (row.question ?? "")) update.question = question;
  if (explanation !== (row.explanation ?? "")) update.explanation = explanation;
  if (options !== row.options) update.options = options;
  if (answerText !== row.answer_text) update.answer_text = answerText;

  return update;
}

function normalizeProblemSnapshot(problem) {
  if (!problem || typeof problem !== "object") return { problem, changed: false };
  let changed = false;
  const next = { ...problem };

  for (const key of ["question", "explanation"]) {
    if (typeof next[key] !== "string") continue;
    const normalized = normalizeBodyField(next[key]);
    if (normalized !== next[key]) {
      next[key] = normalized;
      changed = true;
    }
  }

  if (typeof next.answerText === "string") {
    const normalized = normalizeInlineField(next.answerText);
    if (normalized !== next.answerText) {
      next.answerText = normalized;
      changed = true;
    }
  }

  const options = normalizeOptions(next.options);
  if (options !== next.options) {
    next.options = options;
    changed = true;
  }

  return { problem: next, changed };
}

console.log("Fetching questions...");
const questions = await fetchAll(
  "questions",
  "id, question, options, explanation, answer_text",
);
console.log(`Fetched ${questions.length} questions.`);

console.log("Fetching generated_exams...");
const exams = await fetchAll("generated_exams", "id, problems");
console.log(`Fetched ${exams.length} generated exams.`);

let questionChanged = 0;
let examChanged = 0;
const questionExamples = [];
const examExamples = [];
const updatedAt = new Date().toISOString();

for (const row of questions) {
  const update = normalizeQuestionRow(row);
  if (Object.keys(update).length === 0) continue;
  questionChanged += 1;
  if (questionExamples.length < 20) questionExamples.push({ id: row.id, fields: Object.keys(update) });
  if (!dryRun) {
    const { error } = await sb
      .from("questions")
      .update({ ...update, updated_at: updatedAt })
      .eq("id", row.id);
    if (error) throw error;
  }
}

for (const exam of exams) {
  if (!Array.isArray(exam.problems)) continue;
  let changed = false;
  const problems = exam.problems.map((problem) => {
    const normalized = normalizeProblemSnapshot(problem);
    if (normalized.changed) changed = true;
    return normalized.problem;
  });
  if (!changed) continue;
  examChanged += 1;
  if (examExamples.length < 20) examExamples.push(exam.id);
  if (!dryRun) {
    const { error } = await sb
      .from("generated_exams")
      .update({ problems })
      .eq("id", exam.id);
    if (error) throw error;
  }
}

console.log("\n=== Rendering Artifact Fix ===");
console.log(JSON.stringify({
  dryRun,
  questionChanged,
  examChanged,
  questionExamples,
  examExamples,
}, null, 2));
