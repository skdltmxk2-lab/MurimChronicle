// Fix `questions` rows that render broken in the app.
//
// Companion to scripts/audit_render_breakage_readonly.mjs; the repairs themselves
// live in scripts/lib/content_fixes.mjs so that the exam-snapshot fixer
// (scripts/fix_exam_snapshot_breakage_20260811.mjs) applies exactly the same ones.
//
// Dry run by default; pass --apply to write.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { autoFix, applyManualFix, MANUAL_FIXES } from "./lib/content_fixes.mjs";

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

const applyManual = applyManualFix;

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
