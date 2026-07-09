// Apply the first manually reviewed difficulty correction batch.
//
// Usage:
//   node scripts/fix_difficulty_review_batch_20260709.mjs --dry-run
//   node scripts/fix_difficulty_review_batch_20260709.mjs
//
// Scope: obvious over-labeled questions from the P1 "probably too high" queue.
// This intentionally avoids bulk-changing the large heuristic queue.
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

const reviewedChanges = [
  {
    id: "q-2020-ewha-10",
    from: "killer",
    to: "hard",
    rationale: "점화식 구조 파악과 텔레스코핑이 필요하지만 계산 경로가 짧아 킬러보다는 상 난이도가 적절함",
  },
  {
    id: "q-2020-ewha-22",
    from: "killer",
    to: "hard",
    rationale: "극한 조건과 로피탈을 두 번 쓰는 고난도 미분 문제이나 발상형 킬러 수준은 아님",
  },
  {
    id: "q-2021-ewha-26",
    from: "killer",
    to: "mediumHard",
    rationale: "특수값 대입으로 상수 결정이 가능해 계산 부담은 중상 수준",
  },
  {
    id: "q-2021-ewha-30",
    from: "killer",
    to: "hard",
    rationale: "적분식 미분과 절댓값 미분가능 조건을 결합해야 하므로 상 난이도, 킬러로 보긴 과함",
  },
  {
    id: "q-2022-ewha-15",
    from: "killer",
    to: "hard",
    rationale: "평등연속 판별 개념 문제로 이론 숙련이 필요하지만 표준 판별 목록에 가까움",
  },
  {
    id: "q-2022-ewha-17",
    from: "killer",
    to: "hard",
    rationale: "함수열 평등수렴 명제의 반례 판단이 필요하나 정형 이론 문제임",
  },
  {
    id: "q-2022-ewha-25",
    from: "killer",
    to: "mediumHard",
    rationale: "부분적분 한 번으로 정리되는 구조라 킬러보다는 중상 난이도가 적절함",
  },
  {
    id: "q-2023-ewha-13",
    from: "killer",
    to: "hard",
    rationale: "평등연속과 불연속 판별을 함께 묻지만 표준 개념 조합이라 상 난이도가 적절함",
  },
  {
    id: "q-2024-cau-08",
    from: "hard",
    to: "mediumHard",
    rationale: "바닥함수 불연속점 개수 세기 문제로 계산량은 있으나 발상 난도는 중상 수준",
  },
  {
    id: "q-2024-ewha-14",
    from: "killer",
    to: "medium",
    rationale: "항별 미분 후 등비수열 합을 계산하는 직접형 문제로 중 난이도가 적절함",
  },
];

const ids = reviewedChanges.map((change) => change.id);
const { data: rows, error: fetchError } = await sb
  .from("questions")
  .select("id, difficulty, subject, unit, concept, question")
  .in("id", ids);
if (fetchError) throw fetchError;

const rowsById = new Map((rows ?? []).map((row) => [row.id, row]));
const missingIds = ids.filter((id) => !rowsById.has(id));
if (missingIds.length) throw new Error(`Missing DB rows: ${missingIds.join(", ")}`);

const report = {
  generatedAt: new Date().toISOString(),
  dryRun,
  scope: "manual difficulty review batch 1: over-labeled P1 candidates",
  changes: [],
};

console.log(`${dryRun ? "Dry run" : "Applying"} ${reviewedChanges.length} difficulty changes.`);
for (const change of reviewedChanges) {
  const row = rowsById.get(change.id);
  if (row.difficulty !== change.from) {
    throw new Error(`${change.id} expected difficulty ${change.from}, found ${row.difficulty}`);
  }

  const reportRow = {
    ...change,
    subject: row.subject,
    unit: row.unit,
    concept: row.concept,
    questionExcerpt: String(row.question ?? "").replace(/\s+/g, " ").slice(0, 220),
  };
  report.changes.push(reportRow);
  console.log(`- ${change.id}: ${change.from} -> ${change.to} (${change.rationale})`);

  if (dryRun) continue;
  const { error: updateError } = await sb
    .from("questions")
    .update({ difficulty: change.to, updated_at: new Date().toISOString() })
    .eq("id", change.id);
  if (updateError) throw updateError;
}

writeFileSync(
  resolve(outDir, "difficulty_manual_review_20260709_batch1.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log(dryRun ? "No rows were changed." : "Difficulty changes applied.");
