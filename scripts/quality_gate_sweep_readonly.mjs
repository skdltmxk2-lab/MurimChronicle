// 품질 게이트 전체 뱅크 dry-run — DB 쓰기 0 (설계 DESIGN_quality_gate.md §11 단계 2)
//
// 사용법 (프로젝트 루트에서):
//   node scripts/quality_gate_sweep_readonly.mjs                 # 승인 문항 전체 검사
//   node scripts/quality_gate_sweep_readonly.mjs --ids q-2021-skku-12,q-2023-ajou-05
//                                                                # 오류 표본만 자세히 출력
//   node scripts/quality_gate_sweep_readonly.mjs --images        # 이미지 HEAD 검사 포함(느림)
//   node scripts/quality_gate_sweep_readonly.mjs --all-status    # 격리·검수대기 문항도 포함
//
// 출력:
//   tmp/audit/quality_gate_sweep_report.json   규칙별·등급별 집계 + 게이트가 enforce 였다면 할 일
//   tmp/audit/quality_gate_sweep_issues.csv    이슈 1건 = 1행 (스프레드시트로 검토)
//   tmp/audit/quality_gate_block_review.json   block 적중 전수 목록 — 사람이 전부 확인해
//                                              오탐 0 인 규칙만 block 으로 확정한다
//
// 이 스크립트는 질문 테이블을 읽기만 한다. 고치거나 격리하지 않는다.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  GATE_RULES,
  QUALITY_GATE_VERSION,
  applySafeFixes,
  checkImages,
  codesByTier,
  guardedProposals,
  inspectQuestion,
  mergeIssues,
  residualTier,
} from "../src/lib/questions/qualityGateCore.mjs";

console.warn = () => {}; // KaTeX 한글 글리프 경고

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const outDir = resolve(root, "tmp", "audit");
mkdirSync(outDir, { recursive: true });

const args = process.argv.slice(2);
const argValue = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};
const sampleIds = (argValue("--ids") ?? "").split(",").map((id) => id.trim()).filter(Boolean);
const checkImageUrls = args.includes("--images");
const allStatus = args.includes("--all-status");
const origin = argValue("--origin") ?? "https://routrans.com";
// --dump: 읽어 온 행을 tmp/scratch/gate_bank_snapshot.json 에 저장 (규칙 보정을 오프라인으로 반복하기 위함)
const dumpRows = args.includes("--dump");

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

const SELECT = [
  "id", "subject", "unit", "difficulty", "pool", "source_type", "tags",
  "question", "content_type", "question_image", "question_type", "options",
  "correct_option_id", "answer_text", "explanation", "explanation_content_type",
  "explanation_image", "quality_status", "updated_at",
].join(",");
const PAGE = 1000;

async function fetchQuestions() {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    let query = sb.from("questions").select(SELECT).order("id", { ascending: true }).range(from, from + PAGE - 1);
    if (sampleIds.length) query = query.in("id", sampleIds);
    else if (!allStatus) query = query.eq("quality_status", "approved");
    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows;
}

/**
 * 코칭 화면이 실제로 보는 모양으로 바꾼다 (src/lib/admin/coaching.ts fromQuestionDb 와 같은 규칙):
 * 선지 6개 이상 객관식은 주관식으로 취급, 주관식은 선지를 비우고 답을 선지에서 끌어온다.
 */
function asDisplayed(row) {
  const tags = row.tags ?? [];
  const stored = row.question_type ?? (tags.includes("subjective") ? "subjective" : "multiple_choice");
  const rawOptions = Array.isArray(row.options) ? row.options : row.options;
  const oversized = stored !== "subjective" && Array.isArray(rawOptions) && rawOptions.length > 5;
  const questionType = oversized ? "subjective" : stored;
  const options = questionType === "subjective" ? [] : rawOptions;
  const fromOption = Array.isArray(rawOptions)
    ? rawOptions.find((option) => option?.id === row.correct_option_id || option?.label === row.correct_option_id)?.text
    : undefined;
  const answerText = row.answer_text ?? (questionType === "subjective" ? fromOption : undefined);
  return {
    ...row,
    question_type: questionType,
    options,
    correct_option_id: questionType === "subjective" ? "" : row.correct_option_id,
    answer_text: answerText ?? "",
  };
}

function csvCell(value) {
  const text = value == null ? "" : typeof value === "string" ? value : JSON.stringify(value);
  return `"${text.replace(/"/g, '""')}"`;
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await fn(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

console.log("Fetching questions…");
const rows = await fetchQuestions();
console.log(`Fetched ${rows.length} questions.`);
if (dumpRows) {
  const scratch = resolve(root, "tmp", "scratch");
  mkdirSync(scratch, { recursive: true });
  writeFileSync(resolve(scratch, "gate_bank_snapshot.json"), JSON.stringify(rows));
  console.log("Dumped rows to tmp/scratch/gate_bank_snapshot.json");
}
if (sampleIds.length) {
  const found = new Set(rows.map((row) => row.id));
  const missing = sampleIds.filter((id) => !found.has(id));
  if (missing.length) console.log(`Not found: ${missing.join(", ")}`);
}

const startedAt = Date.now();
const entries = await mapLimit(rows, checkImageUrls ? 8 : 1, async (row) => {
  const displayed = asDisplayed(row);
  let result = inspectQuestion(displayed);
  if (checkImageUrls) {
    const imageIssues = await checkImages(displayed, (url, init) => fetch(url, init), { origin, timeoutMs: 5000 });
    result = mergeIssues(result, imageIssues);
  }
  const residual = residualTier(result);
  let fix = null;
  if (residual !== "block" && result.issues.some((issue) => issue.tier === "fix")) {
    // DB 행 기준으로 수정을 시뮬레이션한다 (실제 저장 경로와 같음)
    const outcome = applySafeFixes(row, inspectQuestion(row));
    fix = outcome ? { ok: Boolean(outcome.fixed), violations: outcome.violations, applied: outcome.applied } : null;
  }
  return { row, result, residual, fix };
});
const elapsedMs = Date.now() - startedAt;

// ── 집계
const codeCounts = {};
const tierQuestionCounts = { block: 0, suspect: 0, warn: 0, fixable: 0, clean: 0 };
const wouldDo = { quarantine: 0, autofix: 0, autofixRejected: 0, suspectRecord: 0 };
const bySubject = {};
const blockReview = [];
const csv = [["id", "subject", "unit", "difficulty", "pool", "tier", "code", "label", "field", "evidence", "meta"].map(csvCell).join(",")];

for (const { row, result, residual, fix } of entries) {
  const worst = residual === "clean" && result.worstTier === "fixable" ? "fixable" : residual;
  tierQuestionCounts[worst] = (tierQuestionCounts[worst] ?? 0) + 1;
  const subject = (bySubject[row.subject] ??= { total: 0, block: 0, suspect: 0, fixable: 0 });
  subject.total += 1;
  if (residual === "block") {
    subject.block += 1;
    wouldDo.quarantine += 1;
  } else if (residual === "suspect") {
    subject.suspect += 1;
    wouldDo.suspectRecord += 1;
  }
  if (fix) {
    subject.fixable += 1;
    if (fix.ok) wouldDo.autofix += 1;
    else wouldDo.autofixRejected += 1;
  }
  for (const issue of result.issues) {
    const bucket = (codeCounts[issue.code] ??= { tier: issue.tier, label: GATE_RULES[issue.code]?.[1] ?? "", questions: 0, sampleIds: [] });
    bucket.questions += 1;
    if (bucket.sampleIds.length < 15) bucket.sampleIds.push(row.id);
    csv.push(
      [row.id, row.subject, row.unit, row.difficulty, row.pool, issue.tier, issue.code, issue.message, issue.field, issue.evidence, issue.meta ?? ""]
        .map(csvCell)
        .join(","),
    );
  }
  if (residual === "block") {
    const tiers = codesByTier(result);
    blockReview.push({
      id: row.id,
      subject: row.subject,
      unit: row.unit,
      blockCodes: tiers.block,
      otherCodes: [...tiers.suspect, ...tiers.warn, ...tiers.fix],
      issues: result.issues.filter((issue) => issue.tier === "block"),
      proposals: guardedProposals(result),
      fingerprint: result.fingerprint,
      // 사람이 채우는 칸: "confirmed"(진짜 오류) | "false_positive"(오탐) + note
      verdict: "",
      note: "",
    });
  }
}

const sortedCodes = Object.fromEntries(
  Object.entries(codeCounts).sort((a, b) => {
    const rank = { block: 0, suspect: 1, warn: 2, fix: 3 };
    return (rank[a[1].tier] - rank[b[1].tier]) || (b[1].questions - a[1].questions);
  }),
);

const report = {
  summary: {
    generatedAt: new Date().toISOString(),
    gateVersion: QUALITY_GATE_VERSION,
    scope: sampleIds.length ? `ids(${sampleIds.length})` : allStatus ? "all statuses" : "approved",
    questionCount: rows.length,
    imageCheck: checkImageUrls,
    elapsedMs,
    msPerQuestion: rows.length ? Math.round((elapsedMs / rows.length) * 100) / 100 : 0,
    questionsByWorstTier: tierQuestionCounts,
    ifEnforced: wouldDo,
    bySubject,
  },
  codes: sortedCodes,
};

writeFileSync(resolve(outDir, "quality_gate_sweep_report.json"), `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(resolve(outDir, "quality_gate_sweep_issues.csv"), `﻿${csv.join("\n")}\n`);
writeFileSync(resolve(outDir, "quality_gate_block_review.json"), `${JSON.stringify(blockReview, null, 2)}\n`);

// ── 콘솔 요약
console.log(`\nGate ${QUALITY_GATE_VERSION} — ${rows.length} questions in ${(elapsedMs / 1000).toFixed(1)}s (${report.summary.msPerQuestion} ms/q)`);
console.log("Questions by worst tier:", tierQuestionCounts);
console.log("If enforced:", wouldDo);
console.log("\nRule hits (questions):");
for (const [code, info] of Object.entries(sortedCodes)) {
  console.log(`  ${info.tier.padEnd(7)} ${String(info.questions).padStart(5)}  ${code}  — ${info.label}`);
}
if (sampleIds.length) {
  console.log("\nSample detail:");
  for (const { row, result, residual } of entries) {
    console.log(`\n■ ${row.id}  [${residual}]`);
    if (result.issues.length === 0) console.log("   (검사기가 아무것도 찾지 못함 — 수동 신고 대상이거나 새 규칙이 필요)");
    for (const issue of result.issues) {
      console.log(`   ${issue.tier.padEnd(7)} ${issue.code} (${issue.field}) — ${issue.message}`);
      if (issue.evidence) console.log(`           ${issue.evidence}`);
    }
  }
}
console.log(`\nWrote tmp/audit/quality_gate_sweep_report.json, quality_gate_sweep_issues.csv, quality_gate_block_review.json`);
