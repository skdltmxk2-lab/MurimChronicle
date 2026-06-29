// Fix remaining duplicate/equivalent option text in canonical questions and exam snapshots.
// Usage:
//   node scripts/fix_remaining_duplicate_options.mjs --dry-run
//   node scripts/fix_remaining_duplicate_options.mjs
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

const fixes = new Map([
  ["q-2019-konkuk-26", [{ id: "3", text: "$\\dfrac{1}{\\sqrt 3}$" }]],
  [
    "q-2020-konkuk-39",
    [
      {
        id: "3",
        text: "$\\displaystyle\\int_{1/4}^{5/4}\\!\\!\\int_{1/4}^{3/2-u}\\dfrac{8v}{u}\\,dv\\,du$",
      },
      {
        id: "4",
        text: "$\\displaystyle\\int_{1/4}^{5/4}\\!\\!\\int_{1/4}^{3/2-u}\\dfrac{v}{8u}\\,dv\\,du$",
      },
    ],
  ],
  ["q-2024-cau-26", [{ id: "3", text: "$2^{2024}+2\\cdot 3^{2024}$" }]],
  ["q-2024-sejong-17", [{ id: "4", text: "$\\arctan\\dfrac{3}{4}+\\ln 4$" }]],
  ["q-daily-r30-2", [{ id: "4", text: "$\\sqrt[3]{\\dfrac{200}{\\pi}}$" }]],
  ["q-ryu-self-warmup-r15-15", [{ id: "2", text: "$\\frac{\\pi}{4}$" }]],
]);

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

function applyOptionFixes(options, edits) {
  if (!Array.isArray(options)) return { options, changed: false, touched: [] };
  const touched = [];
  const next = options.map((option) => {
    if (!option || typeof option !== "object") return option;
    const edit = edits.find((candidate) => String(candidate.id) === String(option.id));
    if (!edit || option.text === edit.text) return option;
    touched.push(String(option.id));
    return { ...option, text: edit.text };
  });
  return { options: next, changed: touched.length > 0, touched };
}

const ids = [...fixes.keys()];
const updatedAt = new Date().toISOString();

console.log("Fetching target questions...");
const { data: questionRows, error: questionError } = await sb
  .from("questions")
  .select("id, options")
  .in("id", ids);
if (questionError) throw questionError;

let questionChanged = 0;
const questionExamples = [];
const foundIds = new Set();

for (const row of questionRows ?? []) {
  foundIds.add(row.id);
  const edits = fixes.get(row.id);
  const result = applyOptionFixes(row.options, edits);
  if (!result.changed) continue;
  questionChanged += 1;
  questionExamples.push({ id: row.id, options: result.touched });
  if (!dryRun) {
    const { error } = await sb
      .from("questions")
      .update({ options: result.options, updated_at: updatedAt })
      .eq("id", row.id);
    if (error) throw error;
  }
}

const missingQuestions = ids.filter((id) => !foundIds.has(id));

console.log("Fetching generated exams...");
const exams = await fetchAll("generated_exams", "id, problems");

let examChanged = 0;
const examExamples = [];

for (const exam of exams) {
  if (!Array.isArray(exam.problems)) continue;
  let changed = false;
  const problems = exam.problems.map((problem) => {
    const id = problem?.id ?? problem?.question_id ?? problem?.questionId;
    const edits = fixes.get(id);
    if (!edits) return problem;
    const result = applyOptionFixes(problem.options, edits);
    if (!result.changed) return problem;
    changed = true;
    return { ...problem, options: result.options };
  });

  if (!changed) continue;
  examChanged += 1;
  examExamples.push(exam.id);
  if (!dryRun) {
    const { error } = await sb
      .from("generated_exams")
      .update({ problems })
      .eq("id", exam.id);
    if (error) throw error;
  }
}

console.log("\n=== Duplicate Option Fix ===");
console.log(JSON.stringify({
  dryRun,
  questionChanged,
  examChanged,
  questionExamples,
  examExamples,
  missingQuestions,
}, null, 2));
