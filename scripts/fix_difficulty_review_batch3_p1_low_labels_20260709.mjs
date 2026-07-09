// Apply manually reviewed corrections for remaining P1 under-labeled difficulty rows.
//
// Usage:
//   node scripts/fix_difficulty_review_batch3_p1_low_labels_20260709.mjs --dry-run
//   node scripts/fix_difficulty_review_batch3_p1_low_labels_20260709.mjs
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
    id: "q-2019-inha-25",
    from: "easyMedium",
    to: "mediumHard",
    rationale: "원기둥좌표 영역 해석과 삼중적분 세팅이 필요해 중하보다 높음",
  },
  {
    id: "q-2019-inha-29",
    from: "easyMedium",
    to: "mediumHard",
    rationale: "발산정리 적용과 구면 대칭 적분 판단이 필요한 유속 문제",
  },
  {
    id: "q-2021-inha-29",
    from: "easyMedium",
    to: "mediumHard",
    rationale: "복합 입체 영역에서 발산정리와 원기둥/구면 경계 해석이 필요함",
  },
  {
    id: "q-2023-soongsil-23",
    from: "easy",
    to: "mediumHard",
    rationale: "직교좌표 삼중적분의 적분순서와 다항식 계산량이 있어 하 난이도로 부적절",
  },
  {
    id: "q-ryu-self-warmup-r15-20",
    from: "easy",
    to: "mediumHard",
    rationale: "사면체 영역에서 발산정리와 삼중적분을 구성해야 하는 벡터해석 문제",
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
  scope: "manual difficulty review batch 3: remaining P1 under-labeled low difficulty rows",
  changes: [],
};

console.log(`${dryRun ? "Dry run" : "Applying"} ${reviewedChanges.length} difficulty changes.`);
for (const change of reviewedChanges) {
  const row = rowsById.get(change.id);
  if (row.difficulty !== change.from) {
    throw new Error(`${change.id} expected difficulty ${change.from}, found ${row.difficulty}`);
  }

  report.changes.push({
    ...change,
    subject: row.subject,
    unit: row.unit,
    concept: row.concept,
    questionExcerpt: String(row.question ?? "").replace(/\s+/g, " ").slice(0, 220),
  });
  console.log(`- ${change.id}: ${change.from} -> ${change.to} (${change.rationale})`);

  if (dryRun) continue;
  const { error: updateError } = await sb
    .from("questions")
    .update({ difficulty: change.to, updated_at: new Date().toISOString() })
    .eq("id", change.id);
  if (updateError) throw updateError;
}

writeFileSync(
  resolve(outDir, "difficulty_manual_review_20260709_batch3_p1_low_labels.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log(dryRun ? "No rows were changed." : "Difficulty changes applied.");
