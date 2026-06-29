// 중복 문제 검사 (dry-run, 삭제하지 않음)
// 1) question 텍스트 정확 일치
// 2) 정규화(공백/특수문자 제거, LaTeX 단순화) 후 일치
// 3) 정답+옵션 텍스트까지 같으면 강한 중복으로 표시
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const [k, ...r] = l.split("="); return [k.trim(), r.join("=").trim()]; })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// fetch all
const all = [];
let from = 0;
const PAGE = 1000;
while (true) {
  const { data, error } = await sb.from("questions")
    .select("id, question, options, correct_option_id, tags, source_type, created_at")
    .order("id", { ascending: true })
    .range(from, from + PAGE - 1);
  if (error) { console.error(error); process.exit(1); }
  if (!data?.length) break;
  all.push(...data);
  if (data.length < PAGE) break;
  from += PAGE;
}
// 페이지 경계로 인한 중복 row 제거
const seen = new Set();
const uniq = all.filter((q) => seen.has(q.id) ? false : (seen.add(q.id), true));
console.log(`로드: ${all.length}, 고유: ${uniq.length}문항`);
all.length = 0; all.push(...uniq);

function normalize(s) {
  return (s || "")
    .replace(/\s+/g, "")          // 공백
    .replace(/[\(\)\[\]{}]/g, "") // 괄호
    .replace(/\\!/g, "")          // 좁은 공백
    .replace(/\\,/g, "")
    .replace(/\\;/g, "")
    .replace(/\\\\/g, "")
    .replace(/\\displaystyle/g, "")
    .replace(/\\dfrac/g, "\\frac")
    .replace(/[\.,;:`'"]/g, "")
    .toLowerCase();
}

function ans(q) {
  const op = (q.options || []).find((o) => String(o.id) === String(q.correct_option_id));
  return op ? normalize(op.text || op.label || "") : "";
}

// 1) 원본 일치
const groupExact = new Map();
for (const q of all) {
  const k = (q.question || "").trim();
  if (!k) continue;
  if (!groupExact.has(k)) groupExact.set(k, []);
  groupExact.get(k).push(q);
}
const exactDups = [...groupExact.values()].filter((g) => g.length > 1);

// 2) 정규화 일치
const groupNorm = new Map();
for (const q of all) {
  const k = normalize(q.question);
  if (!k || k.length < 20) continue; // 너무 짧은 정규화는 거짓양성 위험
  if (!groupNorm.has(k)) groupNorm.set(k, []);
  groupNorm.get(k).push(q);
}
const normDups = [...groupNorm.values()].filter((g) => g.length > 1);

// 3) 강한 중복: 질문 정규화 + 정답 텍스트도 같음
const strongDups = normDups.filter((g) => {
  const answers = g.map(ans);
  return new Set(answers).size === 1; // 정답 텍스트 동일
});

console.log(`\n=== A. 원본 텍스트 정확 일치 그룹: ${exactDups.length}건 ===`);
for (const g of exactDups) {
  console.log(`  [${g.length}] ${g.map((q) => q.id).join(" / ")}`);
  console.log(`    Q: ${g[0].question.slice(0, 80)}...`);
}

console.log(`\n=== B. 정규화 후 일치 그룹: ${normDups.length}건 (A 포함) ===`);
const normOnly = normDups.filter((g) => {
  const keys = g.map((q) => (q.question || "").trim());
  return new Set(keys).size > 1; // 원본은 달랐던 그룹만
});
console.log(`    → 그 중 원본 텍스트는 달랐던 그룹: ${normOnly.length}건`);
for (const g of normOnly.slice(0, 50)) {
  const sameAnswer = new Set(g.map(ans)).size === 1;
  console.log(`  [${g.length}]${sameAnswer ? " *답동일*" : ""} ${g.map((q) => q.id).join(" / ")}`);
  console.log(`    Q1: ${g[0].question.slice(0, 80)}`);
  console.log(`    Q2: ${g[1].question.slice(0, 80)}`);
}

console.log(`\n=== C. 강한 중복(정규화 일치 + 정답 동일): ${strongDups.length}건 ===`);
for (const g of strongDups.slice(0, 50)) {
  console.log(`  [${g.length}] ${g.map((q) => q.id).join(" / ")}`);
}

// 저장 (감사용)
const out = {
  total: all.length,
  exactDups: exactDups.map((g) => g.map((q) => ({ id: q.id, question: q.question, tags: q.tags }))),
  normOnly: normOnly.map((g) => g.map((q) => ({ id: q.id, question: q.question, tags: q.tags, ans: ans(q) }))),
  strongDups: strongDups.map((g) => g.map((q) => ({ id: q.id, question: q.question, tags: q.tags, ans: ans(q) }))),
};
writeFileSync(resolve(here, "_duplicates_report.json"), JSON.stringify(out, null, 2), "utf8");
console.log(`\n상세는 scripts/_duplicates_report.json 참고`);
