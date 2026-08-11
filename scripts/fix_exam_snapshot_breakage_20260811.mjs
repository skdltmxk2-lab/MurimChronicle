// Fix exam snapshots that still carry the pre-repair question text.
//
// `generated_exams.problems` and `exam_attempts.result.examSnapshot.problems` copy
// question content at generation/submission time, so repairs applied to the
// `questions` table never reach them. This script applies the same transforms from
// scripts/lib/content_fixes.mjs, and for rows that needed a hand-written rewrite it
// re-copies the corrected text from the source question.
//
// Only visible text is touched — option ids, correct answers and grading results
// are left exactly as they were.
//
// Dry run by default; pass --apply to write.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { autoFix, MANUAL_FIXES } from "./lib/content_fixes.mjs";
import { inspectRender } from "./lib/render_pipeline.mjs";

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

const MANUAL_IDS = new Set(Object.keys(MANUAL_FIXES));

console.log("Loading source questions...");
const sourceById = new Map();
for (let from = 0; ; from += 1000) {
  const { data, error } = await sb
    .from("questions")
    .select("id, question, options, explanation, answer_text")
    .order("id", { ascending: true })
    .range(from, from + 999);
  if (error) throw error;
  if (!data?.length) break;
  for (const row of data) sourceById.set(row.id, row);
  if (data.length < 1000) break;
}
console.log(`Loaded ${sourceById.size} source questions.`);

// A snapshot that never received the real question text, only its title.
const PLACEHOLDER_STEM_RX = /모의고사\s*\d+\s*회\s*\d+\s*번\s*[-–—]/;
// Source markup the renderer prints verbatim.
const RAW_MARKUP_RX = /\\begin\{tabular\}|\\(?:quad|qquad)(?![a-zA-Z])|\|[^\n|]*\|[^\n|]*\|/;

/** Does this text render broken enough to justify replacing it wholesale? */
function rendersBroken(text) {
  const value = String(text ?? "");
  if (!value.trim()) return false;
  if (PLACEHOLDER_STEM_RX.test(value) && value.length < 80) return true;
  const report = inspectRender(value);
  if (report.mathErrors.length || report.glyphWarnings.length) return true;
  if (/(?<!\\)\$/.test(report.literalText)) return true;
  return RAW_MARKUP_RX.test(report.literalText);
}

const changeLog = [];

/**
 * Return a repaired copy of one problem snapshot, or null when nothing changed.
 * `origin` is only used for the change log.
 */
function repairProblem(problem, origin) {
  if (!problem || typeof problem !== "object") return null;

  const sourceRow = sourceById.get(problem.id);
  // Take the source text wholesale when the row was hand-corrected, or when this
  // snapshot is stale enough to render broken while the source no longer does.
  const staleSnapshot =
    sourceRow &&
    (rendersBroken(problem.question) || rendersBroken(problem.explanation)) &&
    !rendersBroken(sourceRow.question) &&
    !rendersBroken(sourceRow.explanation);
  const source = sourceRow && (MANUAL_IDS.has(problem.id) || staleSnapshot) ? sourceRow : undefined;
  const next = { ...problem };
  const changedFields = [];

  const textField = (snapshotKey, sourceKey) => {
    const current = typeof problem[snapshotKey] === "string" ? problem[snapshotKey] : "";
    if (!current.trim() && !source) return;
    const candidate = source && typeof source[sourceKey] === "string" ? source[sourceKey] : autoFix(current);
    if (candidate === current || typeof candidate !== "string") return;
    next[snapshotKey] = candidate;
    changedFields.push(snapshotKey);
  };

  textField("question", "question");
  textField("explanation", "explanation");
  textField("answerText", "answer_text");

  if (Array.isArray(problem.options)) {
    const sourceOptions = Array.isArray(source?.options) ? source.options : null;
    let optionsChanged = false;
    const nextOptions = problem.options.map((option, index) => {
      const current = typeof option?.text === "string" ? option.text : "";
      if (!current.trim() && !sourceOptions) return option;
      const sourceText = sourceOptions?.find((o) => String(o?.id) === String(option?.id))?.text;
      const candidate = typeof sourceText === "string" ? sourceText : autoFix(current);
      if (candidate === current || typeof candidate !== "string") return option;
      optionsChanged = true;
      return { ...option, text: candidate };
    });
    if (optionsChanged) {
      next.options = nextOptions;
      changedFields.push("options");
    }
  }

  if (!changedFields.length) return null;
  changeLog.push({
    origin,
    problemId: problem.id,
    fields: changedFields,
    resyncedFromSource: Boolean(source),
    before: { question: problem.question, options: problem.options?.map((o) => o?.text) },
    after: { question: next.question, options: next.options?.map((o) => o?.text) },
  });
  return next;
}

// ------------------------------------------------------------ generated_exams

const { data: exams, error: examError } = await sb.from("generated_exams").select("id, title, problems");
if (examError) throw examError;

const examUpdates = [];
for (const exam of exams ?? []) {
  if (!Array.isArray(exam.problems)) continue;
  let changed = false;
  const problems = exam.problems.map((problem) => {
    const repaired = repairProblem(problem, `generated_exams:${exam.id}`);
    if (!repaired) return problem;
    changed = true;
    return repaired;
  });
  if (changed) examUpdates.push({ id: exam.id, title: exam.title, problems });
}

// ------------------------------------------------------------- exam_attempts

const { data: attempts, error: attemptError } = await sb.from("exam_attempts").select("attempt_id, result");
if (attemptError) throw attemptError;

const attemptUpdates = [];
for (const attempt of attempts ?? []) {
  const snapshot = attempt.result?.examSnapshot;
  if (!snapshot || !Array.isArray(snapshot.problems)) continue;
  let changed = false;
  const problems = snapshot.problems.map((problem) => {
    const repaired = repairProblem(problem, `exam_attempts:${attempt.attempt_id}`);
    if (!repaired) return problem;
    changed = true;
    return repaired;
  });
  if (!changed) continue;
  attemptUpdates.push({
    attemptId: attempt.attempt_id,
    result: { ...attempt.result, examSnapshot: { ...snapshot, problems } },
  });
}

writeFileSync(
  resolve(outDir, "exam_snapshot_fixes.json"),
  `${JSON.stringify({ examUpdates: examUpdates.map((e) => e.id), attemptUpdates: attemptUpdates.map((a) => a.attemptId), changeLog }, null, 2)}\n`,
  "utf8",
);

console.log(`\ngenerated_exams to update : ${examUpdates.length} (of ${exams?.length ?? 0})`);
console.log(`exam_attempts to update   : ${attemptUpdates.length} (of ${attempts?.length ?? 0})`);
console.log(`problem snapshots repaired: ${changeLog.length}`);
console.log(`  re-synced from source   : ${changeLog.filter((c) => c.resyncedFromSource).length}`);

if (!APPLY) {
  console.log("\nDry run. Re-run with --apply to write.");
  console.log(`Diff written to ${resolve(outDir, "exam_snapshot_fixes.json")}`);
  process.exit(0);
}

for (const exam of examUpdates) {
  const { error } = await sb.from("generated_exams").update({ problems: exam.problems }).eq("id", exam.id);
  if (error) throw new Error(`generated_exams ${exam.id}: ${error.message}`);
}
console.log(`Updated ${examUpdates.length} generated exams.`);

for (const attempt of attemptUpdates) {
  const { error } = await sb
    .from("exam_attempts")
    .update({ result: attempt.result })
    .eq("attempt_id", attempt.attemptId);
  if (error) throw new Error(`exam_attempts ${attempt.attemptId}: ${error.message}`);
}
console.log(`Updated ${attemptUpdates.length} exam attempts.`);
