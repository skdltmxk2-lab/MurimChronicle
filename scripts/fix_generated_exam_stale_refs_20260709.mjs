// Repair generated_exams rows whose problem IDs point to deleted/imported question IDs.
//
// The generated exam still contains full problem snapshots, so the safe repair is:
// - match the snapshot's normalized question text to the current questions table
// - replace stale problem.id and source_question_ids only when there is exactly one match
// - leave ambiguous or unmatched rows unchanged and write them to a report
//
// Usage:
//   node scripts/fix_generated_exam_stale_refs_20260709.mjs --dry-run
//   node scripts/fix_generated_exam_stale_refs_20260709.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const dryRun = process.argv.includes("--dry-run");
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

function normalizeQuestion(value) {
  return String(value ?? "")
    .replace(/\$\$/g, "$")
    .replace(/\s+/g, "")
    .slice(0, 2000);
}

function hasUsableSnapshot(problem) {
  if (!problem) return false;
  const opts = Array.isArray(problem.options) ? problem.options : [];
  const correct = String(problem.correctOptionId ?? problem.correct_option_id ?? "").trim();
  const answer = String(problem.answerText ?? problem.answer_text ?? "").trim();
  return Boolean(String(problem.question ?? "").trim() && (answer || (opts.length >= 2 && correct)));
}

const questions = await fetchAll("questions", "id, question");
const questionIds = new Set(questions.map((question) => String(question.id)));
const byQuestionText = new Map();
for (const question of questions) {
  const key = normalizeQuestion(question.question);
  if (!key) continue;
  if (!byQuestionText.has(key)) byQuestionText.set(key, []);
  byQuestionText.get(key).push(String(question.id));
}

const exams = await fetchAll("generated_exams", "id, problems, source_question_ids");
const report = {
  generatedAt: new Date().toISOString(),
  dryRun,
  updatedExamCount: 0,
  repairedReferenceCount: 0,
  unchangedExamCount: 0,
  repairs: [],
  unresolved: [],
};

for (const exam of exams) {
  const problems = Array.isArray(exam.problems) ? exam.problems : [];
  const sourceIds = Array.isArray(exam.source_question_ids) ? exam.source_question_ids.map(String) : [];
  const staleIds = new Set(
    [...sourceIds, ...problems.map((problem) => String(problem?.id ?? ""))]
      .filter(Boolean)
      .filter((id) => !questionIds.has(id)),
  );
  if (staleIds.size === 0) continue;

  const idMap = new Map();
  for (const problem of problems) {
    const oldId = String(problem?.id ?? "");
    if (!staleIds.has(oldId)) continue;
    if (!hasUsableSnapshot(problem)) {
      report.unresolved.push({ examId: exam.id, oldId, reason: "snapshot_not_usable" });
      continue;
    }
    const matches = byQuestionText.get(normalizeQuestion(problem.question)) ?? [];
    if (matches.length === 1) {
      idMap.set(oldId, matches[0]);
    } else {
      report.unresolved.push({
        examId: exam.id,
        oldId,
        reason: matches.length === 0 ? "no_current_question_match" : "ambiguous_current_question_match",
        matches,
      });
    }
  }

  if (idMap.size === 0) {
    report.unchangedExamCount += 1;
    continue;
  }

  const nextProblems = problems.map((problem) => {
    const oldId = String(problem?.id ?? "");
    const nextId = idMap.get(oldId);
    return nextId ? { ...problem, id: nextId } : problem;
  });
  const nextSourceIds = sourceIds.map((id) => idMap.get(id) ?? id);

  report.updatedExamCount += 1;
  report.repairedReferenceCount += idMap.size;
  report.repairs.push({
    examId: exam.id,
    idMap: Object.fromEntries(idMap.entries()),
  });

  if (!dryRun) {
    const { error } = await sb
      .from("generated_exams")
      .update({
        problems: nextProblems,
        source_question_ids: nextSourceIds,
      })
      .eq("id", exam.id);
    if (error) throw error;
  }
}

writeFileSync(
  resolve(outDir, "generated_exam_stale_ref_fixes_20260709.json"),
  JSON.stringify(report, null, 2),
);

console.log(JSON.stringify(report, null, 2));
