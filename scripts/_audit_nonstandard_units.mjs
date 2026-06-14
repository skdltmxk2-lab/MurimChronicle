import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return [key.trim(), rest.join("=").trim()];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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

const data = [];
const pageSize = 1000;
for (let from = 0; ; from += pageSize) {
  const { data: page, error } = await supabase
    .from("questions")
    .select("id, subject, unit, concept, question")
    .range(from, from + pageSize - 1);
  if (error) throw error;
  if (!page?.length) break;
  data.push(...page);
  if (page.length < pageSize) break;
}

const groups = new Map();
for (const q of data ?? []) {
  if (taxonomy[q.subject]?.includes(q.unit)) continue;
  const key = `${q.subject}|${q.unit}`;
  const item = groups.get(key) ?? { count: 0, examples: [] };
  item.count += 1;
  if (item.examples.length < 3) {
    item.examples.push({
      id: q.id,
      concept: q.concept,
      question: String(q.question).replace(/\s+/g, " ").slice(0, 140),
    });
  }
  groups.set(key, item);
}

let total = 0;
for (const [, item] of groups) total += item.count;

console.log(`nonstandard groups=${groups.size}`);
console.log(`nonstandard rows=${total}`);
for (const [key, item] of [...groups.entries()].sort((a, b) => b[1].count - a[1].count)) {
  console.log(`\n${String(item.count).padStart(4)} ${key}`);
  for (const example of item.examples) {
    console.log(`  - ${example.id} / ${example.concept} / ${example.question}`);
  }
}
