// subject 분류 오류 일괄 정리
//
// 1. 미분학|미분방정식 → 공학수학|미분방정식
// 2. 적분학|라플라스 변환 → 공학수학|Laplace변환 (unit 명도 표준화)
// 3. 편입수학|미분 → 미분학|미분
// 4. 편입수학|극한 → 미분학|극한과 연속
//
// 사용: node scripts/_fix_subject_classification.mjs [--dry-run]
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
const here = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(resolve(here, "..", ".env.local"), "utf8").split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const [k, ...r] = l.split("="); return [k.trim(), r.join("=").trim()]; })
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const dryRun = process.argv.includes("--dry-run");

const rules = [
  { from: { subject: "미분학", unit: "미분방정식" }, to: { subject: "공학수학", unit: "미분방정식" } },
  { from: { subject: "적분학", unit: "라플라스 변환" }, to: { subject: "공학수학", unit: "Laplace변환" } },
  { from: { subject: "편입수학", unit: "미분" }, to: { subject: "미분학", unit: "미분" } },
  { from: { subject: "편입수학", unit: "극한" }, to: { subject: "미분학", unit: "극한과 연속" } },
];

console.log(`[fix-subject] mode: ${dryRun ? "DRY-RUN" : "EXECUTE"}\n`);

let totalUpdated = 0;
for (const rule of rules) {
  const { data: targets, error } = await supabase
    .from("questions")
    .select("id, subject, unit")
    .eq("subject", rule.from.subject)
    .eq("unit", rule.from.unit);
  if (error) {
    console.error(`[fix-subject] 조회 실패 ${JSON.stringify(rule.from)}: ${error.message}`);
    continue;
  }
  console.log(`[${rule.from.subject}|${rule.from.unit}] → [${rule.to.subject}|${rule.to.unit}] : ${targets.length}개`);
  if (targets.length === 0) continue;
  console.log(`  예시 5개: ${targets.slice(0, 5).map((t) => t.id).join(", ")}`);
  if (dryRun) continue;
  const ids = targets.map((t) => t.id);
  const { error: updErr } = await supabase
    .from("questions")
    .update({ subject: rule.to.subject, unit: rule.to.unit, updated_at: new Date().toISOString() })
    .in("id", ids);
  if (updErr) {
    console.error(`  업데이트 실패: ${updErr.message}`);
    continue;
  }
  totalUpdated += ids.length;
  console.log(`  ✓ ${ids.length}개 수정 완료\n`);
}

if (dryRun) {
  console.log(`\n[fix-subject] DRY-RUN 종료. --dry-run 빼고 실행하면 실제 수정.`);
} else {
  console.log(`[fix-subject] 총 ${totalUpdated}개 수정 완료.`);
}
