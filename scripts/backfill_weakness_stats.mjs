// 취약유형 모의고사 — 기존 exam_attempts로부터 user_unit_stats /
// user_problem_history를 일괄 재생성한다.
//
// 동작:
//  1) (옵션) 두 테이블 truncate (idempotent)
//  2) exam_attempts 전수 조회 (페이지 1000개 단위)
//  3) result.items[]를 펼쳐 problemId → questions 조인
//  4) user_unit_stats / user_problem_history에 누적 upsert
//
// Usage:
//   node scripts/backfill_weakness_stats.mjs              (default)
//   node scripts/backfill_weakness_stats.mjs --truncate   (먼저 truncate)
//
// ⚠️ Service role key가 필요하므로 .env.local에
//   SUPABASE_SERVICE_ROLE_KEY 가 있어야 한다 (관리자가 admin 페이지에서
//   이미 사용 중이므로 보통 있음).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const [k, ...r] = l.split("=");
      return [k.trim(), r.join("=").trim()];
    })
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 없습니다.");
  process.exit(1);
}
const supabase = createClient(url, serviceKey);

const shouldTruncate = process.argv.includes("--truncate");

async function main() {
  if (shouldTruncate) {
    console.log("🧹 truncate user_unit_stats / user_problem_history ...");
    const { error: e1 } = await supabase.rpc("exec_sql", {
      sql: "TRUNCATE public.user_unit_stats; TRUNCATE public.user_problem_history;",
    });
    if (e1) {
      // exec_sql 함수가 없을 수 있으므로 직접 delete fallback
      await supabase.from("user_unit_stats").delete().not("user_id", "is", null);
      await supabase.from("user_problem_history").delete().not("user_id", "is", null);
    }
  }

  // 1) questions 메타 (id → subject, unit) 한 번에 캐싱
  console.log("📚 question 메타 캐싱 ...");
  const PAGE = 1000;
  const qMeta = new Map(); // id → { subject, unit }
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("questions")
      .select("id, subject, unit")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const q of data) qMeta.set(q.id, { subject: q.subject, unit: q.unit });
    if (data.length < PAGE) break;
  }
  console.log(`   ${qMeta.size}개 문제 메타 캐싱 완료`);

  // 2) exam_attempts 전수 순회
  console.log("📊 exam_attempts 순회 + 통계 누적 ...");
  // 누적 키:
  //   unitStats: `${userId}:${subject}:${unit}` → { total, wrong, last_attempt_at }
  //   problemHistory: `${userId}:${problemId}` → { attempts, wrongs, last_correct, last_attempt_at }
  const unitStats = new Map();
  const problemHistory = new Map();

  let total = 0;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("exam_attempts")
      .select("user_id, result")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const row of data) {
      total++;
      const userId = row.user_id;
      const result = row.result;
      if (!userId || !result?.items) continue;
      const submittedAt = result.submittedAt ?? new Date().toISOString();
      for (const it of result.items) {
        const meta = qMeta.get(it.problemId);
        if (!meta) continue; // 삭제된 문제 스킵
        // unitStats
        const usKey = `${userId}|${meta.subject}|${meta.unit}`;
        let us = unitStats.get(usKey);
        if (!us) {
          us = { user_id: userId, subject: meta.subject, unit: meta.unit, total: 0, wrong: 0, last_attempt_at: submittedAt };
          unitStats.set(usKey, us);
        }
        us.total += 1;
        if (!it.isCorrect) us.wrong += 1;
        if (submittedAt > us.last_attempt_at) us.last_attempt_at = submittedAt;
        // problemHistory
        const phKey = `${userId}|${it.problemId}`;
        let ph = problemHistory.get(phKey);
        if (!ph) {
          ph = {
            user_id: userId,
            problem_id: it.problemId,
            attempts: 0,
            wrongs: 0,
            last_correct: it.isCorrect,
            last_attempt_at: submittedAt,
          };
          problemHistory.set(phKey, ph);
        }
        ph.attempts += 1;
        if (!it.isCorrect) ph.wrongs += 1;
        // 최신 시도 기준으로 last_correct 갱신
        if (submittedAt >= ph.last_attempt_at) {
          ph.last_attempt_at = submittedAt;
          ph.last_correct = it.isCorrect;
        }
      }
    }
    if (data.length < PAGE) break;
  }
  console.log(`   ${total}건 attempts 처리 완료`);
  console.log(`   unitStats 키 ${unitStats.size}개, problemHistory 키 ${problemHistory.size}개`);

  // 3) bulk upsert (배치 500건씩)
  const BATCH = 500;
  const usRows = Array.from(unitStats.values()).map((r) => ({
    user_id: r.user_id,
    subject: r.subject,
    unit: r.unit,
    total: r.total,
    wrong: r.wrong,
    last_attempt_at: r.last_attempt_at,
    updated_at: new Date().toISOString(),
  }));
  console.log(`💾 user_unit_stats upsert ${usRows.length}건 ...`);
  for (let i = 0; i < usRows.length; i += BATCH) {
    const slice = usRows.slice(i, i + BATCH);
    const { error } = await supabase
      .from("user_unit_stats")
      .upsert(slice, { onConflict: "user_id,subject,unit" });
    if (error) {
      console.error("  upsert error:", error.message);
      process.exit(1);
    }
    process.stdout.write(`   ${Math.min(i + BATCH, usRows.length)}/${usRows.length}\r`);
  }
  console.log("");

  const phRows = Array.from(problemHistory.values());
  console.log(`💾 user_problem_history upsert ${phRows.length}건 ...`);
  for (let i = 0; i < phRows.length; i += BATCH) {
    const slice = phRows.slice(i, i + BATCH);
    const { error } = await supabase
      .from("user_problem_history")
      .upsert(slice, { onConflict: "user_id,problem_id" });
    if (error) {
      console.error("  upsert error:", error.message);
      process.exit(1);
    }
    process.stdout.write(`   ${Math.min(i + BATCH, phRows.length)}/${phRows.length}\r`);
  }
  console.log("");

  console.log("✅ 완료");
}

await main();
