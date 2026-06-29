// Apply high-confidence hierarchy fixes from tmp/audit/subject_hierarchy_report.json.
//
// Deliberately excluded:
// - 미분학 -> 적분학 candidates where one-variable integrals appear in a derivative/limit problem.
// - 선형대수 -> 다변수함수 candidates involving quadratic forms/eigenvalue methods.
// - known false-positive complex root/Maclaurin item.
//
// Usage:
//   node scripts/fix_subject_hierarchy_high_confidence.mjs --dry-run
//   node scripts/fix_subject_hierarchy_high_confidence.mjs --apply
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const apply = process.argv.includes("--apply");
if (!apply && !process.argv.includes("--dry-run")) {
  console.error("Pass --dry-run or --apply.");
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return [key.trim(), rest.join("=").trim()];
    }),
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const report = JSON.parse(readFileSync("tmp/audit/subject_hierarchy_report.json", "utf8"));

const SUBJECT_UNITS = {
  미분학: ["함수", "극한과 연속", "미분", "도함수의 응용", "접선의 방정식", "평균값의 정리 및 로피탈 정리", "Taylor급수", "곡선의 개형", "최대/최소", "순간 변화율", "추가내용"],
  적분학: ["부정적분", "정적분의 계산", "정적분과 무한급수", "정적분의 성질", "특이적분", "Maclaurin급수의 응용", "급수의 수렴/발산", "정적분의 응용", "극좌표와 응용", "추가내용"],
  선형대수: ["행렬", "벡터와 공간도형", "벡터공간", "고유치와 대각화", "선형사상", "추가내용"],
  다변수함수: ["편도함수", "경도 및 방향도함수", "곡선과 곡면", "Taylor급수와 최대/최소", "중적분", "체적과 곡면적", "삼중적분과 극좌표계", "무한급수", "선적분과 면적분", "추가내용"],
  공학수학: ["복소수", "미분방정식", "Laplace변환", "푸리에(Fourier) 급수", "벡터해석", "추가내용"],
};

const EXCLUDE_IDS = new Set([
  // Maclaurin series of 1/(1+x^2), not complex-analysis content.
  "q-2024-soongsil-20",
]);

function includesAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function targetUnit(issue) {
  const text = `${issue.concept ?? ""} ${issue.excerpt ?? ""}`;

  if (issue.expectedSubject === "공학수학") {
    if (includesAny(text, [/라플라스|Laplace|\\math(?:cal|scr)\{L\}/i])) return "Laplace변환";
    if (includesAny(text, [/푸리에|Fourier/i])) return "푸리에(Fourier) 급수";
    if (includesAny(text, [/미분방정식|ODE\b|초깃값|초기값|분리변수|코시[-\s]*오일러|오일러[-\s]*코시/i])) return "미분방정식";
    if (includesAny(text, [/복소평면|복소\s*(?:경로|적분|함수)|해석함수|코시\s*적분|잔여|유수|residue/i])) return "복소수";
    return null;
  }

  if (issue.expectedSubject === "선형대수") {
    if (includesAny(text, [/고유|대각화|이차형식|특성다항식|특성방정식/])) return "고유치와 대각화";
    if (includesAny(text, [/벡터공간|부분공간|선형독립|일차독립|선형종속|선형결합|span|생성\s*공간|정사영/])) return "벡터공간";
    if (includesAny(text, [/선형사상|선형변환|일차변환|핵공간|상공간|영공간/])) return "선형사상";
    if (includesAny(text, [/행렬|행렬식|역행렬|rank|trace|det/])) return "행렬";
    return null;
  }

  if (issue.expectedSubject === "다변수함수") {
    if (issue.subject === "선형대수") return null;
    if (includesAny(text, [/Taylor|테일러/i])) return "Taylor급수와 최대/최소";
    if (includesAny(text, [/\\iiint|삼중적분|3\s*중적분/i])) return "삼중적분과 극좌표계";
    if (includesAny(text, [/\\iint[^\n]*(?:d\s*S|dS)|면적분|곡면적분/i])) return "선적분과 면적분";
    if (includesAny(text, [/\\iint|이중적분|중적분|다중적분/i])) return "중적분";
    if (includesAny(text, [/선적분|면적분|곡면적분|벡터장/i])) return "선적분과 면적분";
    if (includesAny(text, [/공간곡선|벡터함수|\\vec\s*r|r\s*\(\s*t\s*\)/i])) return "곡선과 곡면";
    if (includesAny(text, [/경도|gradient|그래디언트|방향도함수|\\nabla|최대\s*변화율/i])) return "경도 및 방향도함수";
    if (includesAny(text, [/최댓값|최솟값|최대|최소|극대|극소|안장점|라그랑주/i])) return "Taylor급수와 최대/최소";
    if (includesAny(text, [/편도함수|편미분|\\partial|∂|전미분|이변수|다변수|접평면|f\s*\(\s*x\s*,\s*y/i])) return "편도함수";
    return null;
  }

  return null;
}

function syncTags(tags, fromSubject, fromUnit, toSubject, toUnit) {
  const next = new Set((tags ?? []).filter((tag) => tag !== fromSubject && tag !== fromUnit));
  next.add(toSubject);
  next.add(toUnit);
  return Array.from(next).sort((a, b) => a.localeCompare(b, "ko"));
}

const candidateIssues = report.issues
  .filter((issue) => issue.code === "subject_underclassified")
  .filter((issue) => issue.expectedSubject !== "적분학")
  .filter((issue) => !EXCLUDE_IDS.has(issue.id))
  .map((issue) => ({ ...issue, toUnit: targetUnit(issue) }))
  .filter((issue) => issue.toUnit);

for (const issue of candidateIssues) {
  if (!SUBJECT_UNITS[issue.expectedSubject]?.includes(issue.toUnit)) {
    throw new Error(`Invalid target ${issue.id}: ${issue.expectedSubject}|${issue.toUnit}`);
  }
}

console.log(`[hierarchy-fix] mode=${apply ? "APPLY" : "DRY-RUN"}`);
console.log(`[hierarchy-fix] target rows=${candidateIssues.length}`);

const ids = candidateIssues.map((issue) => issue.id);
const { data: rows, error } = await supabase
  .from("questions")
  .select("id, subject, unit, concept, tags")
  .in("id", ids);
if (error) throw error;
const rowById = new Map((rows ?? []).map((row) => [row.id, row]));

let updated = 0;
for (const issue of candidateIssues) {
  const row = rowById.get(issue.id);
  if (!row) {
    console.warn(`[MISS] ${issue.id}`);
    continue;
  }
  if (row.subject === issue.expectedSubject && row.unit === issue.toUnit) continue;

  console.log(
    `${issue.id}  ${row.subject}|${row.unit} -> ${issue.expectedSubject}|${issue.toUnit}  ${row.concept ?? ""}`,
  );

  if (apply) {
    const { error: updateError } = await supabase
      .from("questions")
      .update({
        subject: issue.expectedSubject,
        unit: issue.toUnit,
        tags: syncTags(row.tags, row.subject, row.unit, issue.expectedSubject, issue.toUnit),
        updated_at: new Date().toISOString(),
      })
      .eq("id", issue.id);
    if (updateError) throw updateError;
  }
  updated += 1;
}

console.log(`[hierarchy-fix] ${apply ? "updated" : "would update"}=${updated}`);
