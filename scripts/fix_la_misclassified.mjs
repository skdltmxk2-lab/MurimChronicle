// 다변수함수에 들어 있지만 본질이 선형대수인 문제 6건을 이동.
//   - 평면의 방정식 (4건)
//   - 행렬식만 묻는 문제 (1건)
//   - 벡터 내·외적만 묻는 문제 (1건)
//
// 접평면, 이차형식 최적화, 연립ODE, 곡선 속도 등은 본질이 다변수 또는
// 공학수학이므로 그대로 둔다.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const FIXES = [
  // 평면의 방정식 — 다변수 추가내용 → 선형대수 벡터와 공간도형
  { id: "q-2023-gachon-b-22", subject: "선형대수", unit: "벡터와 공간도형" },
  { id: "q-2022-gachon-16",   subject: "선형대수", unit: "벡터와 공간도형" },
  { id: "q-2021-gachon-06",   subject: "선형대수", unit: "벡터와 공간도형" },
  { id: "q-2020-gachon-09",   subject: "선형대수", unit: "벡터와 공간도형" },
  // 행렬식 → 선형대수/행렬
  { id: "q-daily-mv-r23-2",   subject: "선형대수", unit: "행렬" },
  // 벡터 내·외적 → 선형대수/벡터와 공간도형
  { id: "q-2025-mju-05",      subject: "선형대수", unit: "벡터와 공간도형" },
];

for (const f of FIXES) {
  const { data, error } = await sb
    .from("questions")
    .update({ subject: f.subject, unit: f.unit, updated_at: new Date().toISOString() })
    .eq("id", f.id)
    .select("id, subject, unit, concept");
  if (error) {
    console.error(`  ❌ ${f.id}:`, error.message);
    continue;
  }
  if (!data || data.length === 0) {
    console.log(`  ⚠️ ${f.id}: 못 찾음`);
    continue;
  }
  console.log(`  ✓ ${f.id}  →  ${f.subject}/${f.unit}  [${data[0].concept}]`);
}
console.log(`\n총 ${FIXES.length}건 처리 완료. 다음: backfill_weakness_stats.mjs --truncate`);
