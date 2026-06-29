// Apply high-confidence subject/unit fixes found during hierarchy review.
//
// Usage:
//   node scripts/fix_subject_unit_review_round4.mjs --dry-run
//   node scripts/fix_subject_unit_review_round4.mjs --apply
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

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

const apply = process.argv.includes("--apply");
if (!apply && !process.argv.includes("--dry-run")) {
  console.error("Pass --dry-run or --apply.");
  process.exit(1);
}

const taxonomy = {
  미분학: [
    "함수",
    "극한과 연속",
    "미분",
    "도함수의 응용",
    "접선의 방정식",
    "평균값의 정리 및 로피탈 정리",
    "Taylor급수",
    "곡선의 개형",
    "최대/최소",
    "순간 변화율",
    "추가내용",
  ],
  적분학: [
    "부정적분",
    "정적분의 계산",
    "정적분과 무한급수",
    "정적분의 성질",
    "특이적분",
    "Maclaurin급수의 응용",
    "급수의 수렴/발산",
    "정적분의 응용",
    "극좌표와 응용",
    "추가내용",
  ],
  선형대수: [
    "행렬",
    "벡터와 공간도형",
    "벡터공간",
    "고유치와 대각화",
    "선형사상",
    "추가내용",
  ],
  다변수함수: [
    "편도함수",
    "경도 및 방향도함수",
    "곡선과 곡면",
    "Taylor급수와 최대/최소",
    "중적분",
    "체적과 곡면적",
    "삼중적분과 극좌표계",
    "무한급수",
    "선적분과 면적분",
    "추가내용",
  ],
  공학수학: [
    "복소수",
    "미분방정식",
    "Laplace변환",
    "푸리에(Fourier) 급수",
    "벡터해석",
    "추가내용",
  ],
};

const directRules = [
  ["다변수함수", "최대최소", "다변수함수", "Taylor급수와 최대/최소"],
  ["벡터해석", "선적분", "공학수학", "벡터해석"],
  ["벡터해석", "면적분", "공학수학", "벡터해석"],
  ["적분학", "중적분", "다변수함수", "중적분"],
  ["미분학", "음함수 미분", "미분학", "미분"],
  ["미분학", "도함수와 미분법", "미분학", "미분"],
  ["미분학", "함수의 극한", "미분학", "극한과 연속"],
  ["미분학", "함수의 극한과 연속", "미분학", "극한과 연속"],
  ["선형대수", "공간도형", "선형대수", "벡터와 공간도형"],
  ["선형대수", "평면기하", "선형대수", "벡터와 공간도형"],
  ["다변수함수", "함수의 극한", "다변수함수", "편도함수"],
  ["적분학", "삼각치환", "적분학", "정적분의 계산"],
  ["적분학", "치환적분", "적분학", "정적분의 계산"],
  ["적분학", "미적분학의 기본정리", "적분학", "정적분의 계산"],
  ["공학수학", "Laplace 변환", "공학수학", "Laplace변환"],
  ["미분학", "극좌표", "적분학", "극좌표와 응용"],
];

const idRules = [
  ["q-ryu-self-warmup-r08-04", "미분학", "극한과 연속"],
  ["q-ryu-self-warmup-r10-02", "미분학", "곡선의 개형"],
];

for (const [, , toSubject, toUnit] of directRules) {
  if (!taxonomy[toSubject]?.includes(toUnit)) {
    throw new Error(`Invalid target taxonomy: ${toSubject}|${toUnit}`);
  }
}
for (const [, toSubject, toUnit] of idRules) {
  if (!taxonomy[toSubject]?.includes(toUnit)) {
    throw new Error(`Invalid target taxonomy: ${toSubject}|${toUnit}`);
  }
}

function syncTags(tags, fromSubject, fromUnit, toSubject, toUnit) {
  const next = new Set((tags ?? []).filter((tag) => tag !== fromSubject && tag !== fromUnit));
  next.add(toSubject);
  next.add(toUnit);
  return Array.from(next).sort((a, b) => a.localeCompare(b, "ko"));
}

async function updateRows(rows, fromSubject, fromUnit, toSubject, toUnit) {
  for (const row of rows) {
    const nextTags = syncTags(row.tags, fromSubject, fromUnit, toSubject, toUnit);
    if (!apply) continue;
    const { error } = await supabase
      .from("questions")
      .update({
        subject: toSubject,
        unit: toUnit,
        tags: nextTags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    if (error) throw error;
  }
}

console.log(`[review-round4] mode=${apply ? "APPLY" : "DRY-RUN"}`);
let total = 0;

for (const [fromSubject, fromUnit, toSubject, toUnit] of directRules) {
  const { data, error } = await supabase
    .from("questions")
    .select("id, concept, tags")
    .eq("subject", fromSubject)
    .eq("unit", fromUnit);
  if (error) throw error;
  const rows = data ?? [];
  if (rows.length === 0) continue;
  total += rows.length;
  console.log(
    `${String(rows.length).padStart(4)}  ${fromSubject}|${fromUnit} -> ${toSubject}|${toUnit}  ex=${rows
      .slice(0, 4)
      .map((row) => `${row.id}:${row.concept ?? ""}`)
      .join(", ")}`,
  );
  await updateRows(rows, fromSubject, fromUnit, toSubject, toUnit);
}

for (const [id, toSubject, toUnit] of idRules) {
  const { data, error } = await supabase
    .from("questions")
    .select("id, subject, unit, concept, tags")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) continue;
  if (data.subject === toSubject && data.unit === toUnit) continue;
  total += 1;
  console.log(`   1  ${data.id} ${data.subject}|${data.unit} -> ${toSubject}|${toUnit}  ${data.concept ?? ""}`);
  await updateRows([data], data.subject, data.unit, toSubject, toUnit);
}

console.log(`[review-round4] target rows=${total}`);
