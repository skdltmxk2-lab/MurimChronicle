// 비표준 unit 표기를 taxonomy 표준에 맞게 일괄 변환.
// 변경 후 user_unit_stats를 재계산해야 함 (백필 스크립트 재실행).
//
// Usage: node scripts/fix_unit_categories.mjs

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];})
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 누락");
  process.exit(1);
}
const sb = createClient(url, serviceKey);

// (subject, fromUnit) -> (toUnit). subject가 같으면 unit만 교체.
const RENAMES = [
  { subject: "적분학",     from: "이상적분",      to: "특이적분" },
  { subject: "적분학",     from: "급수",          to: "급수의 수렴/발산" },
  { subject: "적분학",     from: "정적분의 정의", to: "정적분의 계산" },
  { subject: "적분학",     from: "이심률",        to: "극좌표와 응용" },
  { subject: "미분학",     from: "도함수",        to: "미분" },
  { subject: "다변수함수", from: "벡터",          to: "곡선과 곡면" },
  { subject: "다변수함수", from: "벡터함수",      to: "곡선과 곡면" },
  { subject: "다변수함수", from: "극좌표",        to: "삼중적분과 극좌표계" },
  { subject: "공학수학",   from: "푸리에급수",    to: "푸리에(Fourier) 급수" },
  { subject: "공학수학",   from: "라플라스 변환", to: "Laplace변환" },
  { subject: "공학수학",   from: "확률과 통계",   to: "추가내용" },
  { subject: "선형대수",   from: "벡터",          to: "벡터와 공간도형" },
];

let totalChanged = 0;
for (const r of RENAMES) {
  const { data, error } = await sb
    .from("questions")
    .update({ unit: r.to, updated_at: new Date().toISOString() })
    .eq("subject", r.subject)
    .eq("unit", r.from)
    .select("id");
  if (error) {
    console.error(`  ❌ ${r.subject}/${r.from} → ${r.to}:`, error.message);
    continue;
  }
  const n = (data ?? []).length;
  console.log(`  ✓ ${r.subject}/${r.from.padEnd(15)} → ${r.to.padEnd(20)}  ${n}건`);
  totalChanged += n;
}

console.log(`\n총 ${totalChanged}문항의 unit 표기 정리 완료.`);
console.log(`다음 단계: node scripts/backfill_weakness_stats.mjs --truncate`);
console.log(`(user_unit_stats를 새 unit 분류로 다시 빌드해야 합니다.)`);
