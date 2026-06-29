// Apply the remaining reviewed hierarchy fixes from tmp/audit/subject_hierarchy_report.json.
//
// Rule:
//   미분학 < 적분학 < 선형대수 < 다변수함수 < 공학수학
//
// A problem may depend on earlier subjects, but it should be classified at the
// latest subject required by the statement. This handles the reviewed P2 cases
// left after the high-confidence bulk pass.
//
// Usage:
//   node scripts/fix_subject_hierarchy_remaining_reviewed.mjs --dry-run
//   node scripts/fix_subject_hierarchy_remaining_reviewed.mjs --apply
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const apply = process.argv.includes("--apply");
if (!apply && !process.argv.includes("--dry-run")) {
  console.error("Pass --dry-run or --apply.");
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return [key.trim(), rest.join("=").trim()];
    }),
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const report = JSON.parse(readFileSync("tmp/audit/subject_hierarchy_report.json", "utf8"));

const SUBJECT_UNITS = {
  적분학: [
    "부정적분",
    "정적분의 계산",
    "정적분과 무한급수",
    "정적분의 성질",
    "특이적분",
    "Maclaurin급수의 응용",
    "급수의 수렴/발산",
    "정적분의 응용",
    "극좌표와 응용",
    "추가내용",
  ],
  다변수함수: [
    "편도함수",
    "경도 및 방향도함수",
    "곡선과 곡면",
    "Taylor급수와 최대/최소",
    "중적분",
    "체적과 곡면적",
    "삼중적분과 극좌표계",
    "무한급수",
    "선적분과 면적분",
    "추가내용",
  ],
};

function includesAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function targetUnit(issue) {
  const text = `${issue.concept ?? ""} ${issue.excerpt ?? ""}`;

  if (issue.expectedSubject === "적분학") {
    if (includesAny(text, [/Maclaurin|매클로린/i])) return "Maclaurin급수의 응용";
    if (includesAny(text, [/리만합|\\sum|무한급수|급수/i])) return "정적분과 무한급수";
    if (includesAny(text, [/원시함수|부정적분/i])) return "부정적분";
    if (includesAny(text, [/특이적분|이상적분|\\int[^\n]*(?:\\infty|무한대)/i])) return "특이적분";
    if (includesAny(text, [/넓이|면적|부피|길이|회전체|호의\s*길이/i])) return "정적분의 응용";
    return "정적분의 계산";
  }

  if (issue.expectedSubject === "다변수함수") {
    if (includesAny(text, [/최댓값|최솟값|최대|최소|극대|극소|이차형식|라그랑주/i])) {
      return "Taylor급수와 최대/최소";
    }
    if (includesAny(text, [/경도|gradient|그래디언트|방향도함수|\\nabla|최대\s*변화율/i])) {
      return "경도 및 방향도함수";
    }
    if (includesAny(text, [/편도함수|편미분|\\partial|∂|전미분|이변수|다변수|f\s*\(\s*x\s*,\s*y/i])) {
      return "편도함수";
    }
  }

  return null;
}

function syncTags(tags, fromSubject, fromUnit, toSubject, toUnit) {
  const next = new Set((tags ?? []).filter((tag) => tag !== fromSubject && tag !== fromUnit));
  next.add(toSubject);
  next.add(toUnit);
  return Array.from(next).sort((a, b) => a.localeCompare(b, "ko"));
}

const candidateIssues = report.issues
  .filter((issue) => issue.code === "subject_underclassified")
  .filter((issue) => issue.expectedSubject === "적분학" || issue.expectedSubject === "다변수함수")
  .map((issue) => ({ ...issue, toUnit: targetUnit(issue) }))
  .filter((issue) => issue.toUnit);

for (const issue of candidateIssues) {
  if (!SUBJECT_UNITS[issue.expectedSubject]?.includes(issue.toUnit)) {
    throw new Error(`Invalid target ${issue.id}: ${issue.expectedSubject}|${issue.toUnit}`);
  }
}

console.log(`[remaining-hierarchy-fix] mode=${apply ? "APPLY" : "DRY-RUN"}`);
console.log(`[remaining-hierarchy-fix] target rows=${candidateIssues.length}`);

const ids = candidateIssues.map((issue) => issue.id);
const { data: rows, error } = await supabase
  .from("questions")
  .select("id, subject, unit, concept, tags")
  .in("id", ids);
if (error) throw error;
const rowById = new Map((rows ?? []).map((row) => [row.id, row]));

let updated = 0;
for (const issue of candidateIssues) {
  const row = rowById.get(issue.id);
  if (!row) {
    console.warn(`[MISS] ${issue.id}`);
    continue;
  }
  if (row.subject === issue.expectedSubject && row.unit === issue.toUnit) continue;

  console.log(
    `${issue.id}  ${row.subject}|${row.unit} -> ${issue.expectedSubject}|${issue.toUnit}  ${row.concept ?? ""}`,
  );

  if (apply) {
    const { error: updateError } = await supabase
      .from("questions")
      .update({
        subject: issue.expectedSubject,
        unit: issue.toUnit,
        tags: syncTags(row.tags, row.subject, row.unit, issue.expectedSubject, issue.toUnit),
        updated_at: new Date().toISOString(),
      })
      .eq("id", issue.id);
    if (updateError) throw updateError;
  }
  updated += 1;
}

console.log(`[remaining-hierarchy-fix] ${apply ? "updated" : "would update"}=${updated}`);
