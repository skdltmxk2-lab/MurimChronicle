// 응시하지 않은 weakness 모의고사 정리
//
// 정책: generated_exams의 weakness 태그 행 중 exam_attempts에 응시 기록이 없는
// 것만 삭제. 응시한 시험은 보존(나중에 본문 추적/회고용).
// 부수적으로 weakness_exam_snapshots의 고아 행도 같이 정리.
//
// 사용: node scripts/_cleanup_unused_weakness_exams.mjs [--dry-run]
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const [k, ...r] = l.split("="); return [k.trim(), r.join("=").trim()]; })
);
// service role 키가 있으면 RLS 우회, 없으면 anon 키로 시도
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const dryRun = process.argv.includes("--dry-run");

console.log(`[cleanup] mode: ${dryRun ? "DRY-RUN" : "EXECUTE"}`);

// 1) weakness 태그를 가진 generated_exams 모두 조회 (페이지네이션)
async function fetchAllWeaknessExams() {
  const all = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("generated_exams")
      .select("id, title, tags, created_at")
      .contains("tags", ["weakness"])
      .order("created_at", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE) break;
  }
  return all;
}

const weaknessExams = await fetchAllWeaknessExams();
console.log(`[cleanup] weakness 시험 총 ${weaknessExams.length}개 발견`);

// 2) 각 exam에 대해 exam_attempts 매칭 여부 확인
//    exam_attempts.exam_id 컬럼이 generated_exams.id를 참조한다고 가정
const toDelete = [];
const toKeep = [];
for (const exam of weaknessExams) {
  const { count, error } = await supabase
    .from("exam_attempts")
    .select("attempt_id", { count: "exact", head: true })
    .eq("exam_id", exam.id);
  if (error) {
    console.warn(`[cleanup] attempts 조회 실패 ${exam.id}: ${error.message}`);
    continue;
  }
  if ((count ?? 0) === 0) toDelete.push(exam);
  else toKeep.push({ exam, attemptCount: count });
}

console.log(`[cleanup] 응시 안 함 → 삭제 대상: ${toDelete.length}개`);
console.log(`[cleanup] 응시 있음 → 보존: ${toKeep.length}개`);
if (toKeep.length > 0) {
  console.log(`[cleanup] 보존 예시 5개:`);
  toKeep.slice(0, 5).forEach((k) => {
    console.log(`  - ${k.exam.id} (응시 ${k.attemptCount}회, ${k.exam.created_at})`);
  });
}

if (dryRun) {
  console.log(`[cleanup] DRY-RUN 종료. --dry-run 빼고 실행하면 실제 삭제됨`);
  process.exit(0);
}

if (toDelete.length === 0) {
  console.log(`[cleanup] 삭제할 게 없음`);
  process.exit(0);
}

// 3) 삭제 진행
//    먼저 weakness_exam_snapshots (FK가 있을 수 있어 자식부터)
const ids = toDelete.map((e) => e.id);

console.log(`[cleanup] weakness_exam_snapshots 정리 중...`);
const { error: snapErr } = await supabase
  .from("weakness_exam_snapshots")
  .delete()
  .in("exam_id", ids);
if (snapErr) {
  console.error(`[cleanup] snapshot 삭제 실패: ${snapErr.message}`);
  process.exit(1);
}

console.log(`[cleanup] generated_exams 정리 중...`);
const { error: examErr } = await supabase
  .from("generated_exams")
  .delete()
  .in("id", ids);
if (examErr) {
  console.error(`[cleanup] generated_exams 삭제 실패: ${examErr.message}`);
  process.exit(1);
}

console.log(`[cleanup] ${toDelete.length}개 삭제 완료.`);
