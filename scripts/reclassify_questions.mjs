// Re-classify all existing questions to the new taxonomy.
// Usage: node scripts/reclassify_questions.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(here, "..", ".env.local");
const envText = readFileSync(envPath, "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const [k, ...rest] = line.split("=");
      return [k.trim(), rest.join("=").trim()];
    })
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Supabase URL/KEY missing in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Mapping: id -> { subject, unit, concept, difficulty? (optional override), tagsAdd?, tagsRemove? }
// Concept stays as-is unless reassignment needed; difficulty preserved unless explicitly noted.
const M = {
  // === Calc basic mock (p-cb01-XX) ===
  "p-cb01-01": { subject: "미분학", unit: "극한과 연속", concept: "다항함수 극한" },
  "p-cb01-02": { subject: "미분학", unit: "극한과 연속", concept: "연속 조건" },
  "p-cb01-03": { subject: "미분학", unit: "미분", concept: "미분계수" },
  "p-cb01-04": { subject: "미분학", unit: "미분", concept: "합성함수 미분" },
  "p-cb01-05": { subject: "미분학", unit: "접선의 방정식", concept: "접선의 기울기" },
  "p-cb01-06": { subject: "미분학", unit: "미분", concept: "로그 미분법" },

  // === Linear algebra mock (p-la01-XX) ===
  "p-la01-01": { subject: "선형대수", unit: "행렬", concept: "행렬 곱" },
  "p-la01-02": { subject: "선형대수", unit: "행렬", concept: "행렬식" },
  "p-la01-03": { subject: "선형대수", unit: "행렬", concept: "역행렬" },
  "p-la01-04": { subject: "선형대수", unit: "고유치와 대각화", concept: "고유값" },
  "p-la01-05": { subject: "선형대수", unit: "벡터공간", concept: "선형독립" },

  // === 모의고사1회 (q-import-1778062406488-* and q-import-1778062408507-*) ===
  // First import batch (...406488-*)
  "q-import-1778062406488-0-0o6y": { subject: "미분학", unit: "극한과 연속", concept: "삼각함수 극한" },
  "q-import-1778062406488-1-pq7a": { subject: "미분학", unit: "곡선의 개형", concept: "함수의 증가·감소" },
  "q-import-1778062406488-2-ypqu": { subject: "미분학", unit: "접선의 방정식", concept: "매개변수 미분" },
  "q-import-1778062406488-3-u5qa": { subject: "미분학", unit: "미분", concept: "미분계수의 정의" },
  "q-import-1778062406488-4-aal2": { subject: "미분학", unit: "접선의 방정식", concept: "로그 미분법" },
  "q-import-1778062406488-5-nbmi": { subject: "미분학", unit: "미분", concept: "매개변수 이계미분" },
  "q-import-1778062406488-6-0z92": { subject: "미분학", unit: "순간 변화율", concept: "관련 변화율" },
  "q-import-1778062406488-7-0omj": { subject: "미분학", unit: "최대/최소", concept: "최적화 문제" },
  "q-import-1778062406488-8-mx3m": { subject: "미분학", unit: "극한과 연속", concept: "수열의 극한" },
  "q-import-1778062406488-9-jimi": { subject: "미분학", unit: "미분", concept: "선형근사" },
  "q-import-1778062406488-10-9412": { subject: "미분학", unit: "곡선의 개형", concept: "점근선" },
  "q-import-1778062406488-11-dpan": { subject: "미분학", unit: "최대/최소", concept: "최대·최소" },
  "q-import-1778062406488-12-nc6p": { subject: "미분학", unit: "극한과 연속", concept: "삼각함수 극한" },
  "q-import-1778062406488-13-mfbm": { subject: "미분학", unit: "순간 변화율", concept: "관련 변화율" },
  "q-import-1778062406488-14-spja": { subject: "미분학", unit: "함수", concept: "역삼각함수" },
  "q-import-1778062406488-15-mhfp": { subject: "미분학", unit: "극한과 연속", concept: "수열의 극한" },
  "q-import-1778062406488-16-afmf": { subject: "미분학", unit: "Taylor급수", concept: "테일러 급수" },
  "q-import-1778062406488-17-tj4x": { subject: "미분학", unit: "극한과 연속", concept: "수열의 극한" },
  "q-import-1778062406488-18-pfk8": { subject: "미분학", unit: "최대/최소", concept: "최대·최소" },
  "q-import-1778062406488-19-aigu": { subject: "미분학", unit: "미분", concept: "로그 미분법" },

  // Second import batch (...408506/507-*) — duplicate set
  "q-import-1778062408506-0-0kgk": { subject: "미분학", unit: "극한과 연속", concept: "삼각함수 극한" },
  "q-import-1778062408507-1-r54b": { subject: "미분학", unit: "곡선의 개형", concept: "함수의 증가·감소" },
  "q-import-1778062408507-2-ev6t": { subject: "미분학", unit: "접선의 방정식", concept: "매개변수 미분" },
  "q-import-1778062408507-3-ww10": { subject: "미분학", unit: "미분", concept: "미분계수의 정의" },
  "q-import-1778062408507-4-f2iu": { subject: "미분학", unit: "접선의 방정식", concept: "로그 미분법" },
  "q-import-1778062408507-5-bt1g": { subject: "미분학", unit: "미분", concept: "매개변수 이계미분" },
  "q-import-1778062408507-6-g4mw": { subject: "미분학", unit: "순간 변화율", concept: "관련 변화율" },
  "q-import-1778062408507-7-07z3": { subject: "미분학", unit: "최대/최소", concept: "최적화 문제" },
  "q-import-1778062408507-8-bifl": { subject: "미분학", unit: "극한과 연속", concept: "수열의 극한" },
  "q-import-1778062408507-9-y3me": { subject: "미분학", unit: "미분", concept: "선형근사" },
  "q-import-1778062408507-11-srp8": { subject: "미분학", unit: "최대/최소", concept: "최대·최소" },
  "q-import-1778062408507-12-mkx2": { subject: "미분학", unit: "극한과 연속", concept: "삼각함수 극한" },
  "q-import-1778062408507-13-um9f": { subject: "미분학", unit: "순간 변화율", concept: "관련 변화율" },
  "q-import-1778062408507-14-afsl": { subject: "미분학", unit: "함수", concept: "역삼각함수" },
  "q-import-1778062408507-15-bewo": { subject: "미분학", unit: "극한과 연속", concept: "수열의 극한" },
  "q-import-1778062408507-16-mvwz": { subject: "미분학", unit: "Taylor급수", concept: "테일러 급수" },
  "q-import-1778062408507-17-yrbi": { subject: "미분학", unit: "극한과 연속", concept: "수열의 극한" },
  "q-import-1778062408507-18-frjp": { subject: "미분학", unit: "최대/최소", concept: "최대·최소" },
  "q-import-1778062408507-19-xoce": { subject: "미분학", unit: "미분", concept: "로그 미분법" },
  "q-import-1778062408507-10-ss9r": { subject: "미분학", unit: "곡선의 개형", concept: "점근선" },

  // === q-sample (이미 미분학으로 분류돼 있던 6개) — unit 정정 ===
  "q-sample-1778085491269-0": { subject: "미분학", unit: "미분", concept: "합성함수 미분" },
  "q-sample-1778085491269-1": { subject: "미분학", unit: "미분", concept: "합성함수 미분" },
  "q-sample-1778085491269-2": { subject: "미분학", unit: "미분", concept: "역함수 미분" },
  "q-sample-1778085491269-3": { subject: "미분학", unit: "미분", concept: "합성함수 미분" },
  "q-sample-1778085491269-4": { subject: "미분학", unit: "미분", concept: "로그함수 미분" },
  "q-sample-1778085491269-5": { subject: "미분학", unit: "미분", concept: "로그함수 미분" }
};

// Fetch existing rows so we can also rewrite tags consistently.
const { data: existing, error: fetchErr } = await supabase
  .from("questions")
  .select("id, subject, unit, tags");
if (fetchErr) {
  console.error("Fetch error:", fetchErr);
  process.exit(1);
}

const existingById = new Map(existing.map((r) => [r.id, r]));

let updated = 0;
let skipped = 0;
const failures = [];

for (const [id, mapping] of Object.entries(M)) {
  const before = existingById.get(id);
  if (!before) {
    skipped += 1;
    failures.push({ id, reason: "row not found" });
    continue;
  }

  // Tag rewrite: drop legacy "편입수학", drop old unit value, ensure new subject + unit are present.
  const oldUnitValues = new Set(["미분학", "선형대수", "극한", "미분", "급수", "삼각함수"]);
  const cleanedTags = (before.tags ?? [])
    .filter((tag) => tag !== "편입수학")
    .filter((tag) => !(oldUnitValues.has(tag) && tag !== mapping.unit));

  const tagSet = new Set(cleanedTags);
  tagSet.add(mapping.subject);
  tagSet.add(mapping.unit);
  if (mapping.concept) tagSet.add(mapping.concept);
  const tags = Array.from(tagSet).sort((a, b) => a.localeCompare(b, "ko"));

  const update = {
    subject: mapping.subject,
    unit: mapping.unit,
    concept: mapping.concept,
    tags,
    updated_at: new Date().toISOString()
  };
  if (mapping.difficulty) update.difficulty = mapping.difficulty;

  const { error: upErr } = await supabase.from("questions").update(update).eq("id", id);
  if (upErr) {
    failures.push({ id, reason: upErr.message });
    continue;
  }
  updated += 1;
  console.log(`[${updated}] ${id} → ${mapping.subject} / ${mapping.unit} / ${mapping.concept}`);
}

console.log(`\nDone. updated=${updated}, skipped=${skipped}, failures=${failures.length}`);
if (failures.length) {
  console.log("Failures:");
  for (const f of failures) console.log(` - ${f.id}: ${f.reason}`);
}

// Report any DB rows we did NOT classify (just in case).
const mappedIds = new Set(Object.keys(M));
const unclassified = existing.filter((r) => !mappedIds.has(r.id));
if (unclassified.length) {
  console.log(`\nUnclassified rows (${unclassified.length}):`);
  for (const r of unclassified) console.log(` - ${r.id} (subject=${r.subject}, unit=${r.unit})`);
}
