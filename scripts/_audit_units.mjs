// 문제 데이터의 단원 카테고리 검증
//  - 사용 중인 unit 목록과 빈도 출력
//  - taxonomy 정의에 없는 unit 표시
//  - "변화율" 키워드를 가진 문제들이 어느 unit에 있는지 분포 확인

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// taxonomy.ts 동일 정의 (이 스크립트만 ESM로 가독성 위해 복제)
const SUBJECT_UNITS = {
  "미분학": ["함수","극한과 연속","미분","접선의 방정식","평균값의 정리 및 로피탈 정리","Taylor급수","곡선의 개형","최대/최소","순간 변화율","추가내용","도함수의 응용"],
  "적분학": ["부정적분","정적분의 계산","정적분과 무한급수","정적분의 성질","특이적분","Maclaurin급수의 응용","정적분의 응용","극좌표와 응용","급수의 수렴/발산","추가내용"],
  "선형대수": ["행렬","벡터와 공간도형","벡터공간","고유치와 대각화","선형사상","추가내용"],
  "다변수함수": ["편도함수","경도 및 방향도함수","곡선과 곡면","Taylor급수와 최대/최소","중적분","체적과 곡면적","삼중적분과 극좌표계","무한급수","선적분과 면적분","추가내용"],
  "공학수학": ["복소수","미분방정식","Laplace변환","푸리에(Fourier) 급수","벡터해석","라플라스 변환"],
};

const PAGE = 1000;
const all = [];
for (let from = 0; ; from += PAGE) {
  const { data, error } = await sb.from("questions").select("id, subject, unit, concept, question").range(from, from+PAGE-1);
  if (error) { console.error(error); process.exit(1); }
  if (!data || data.length === 0) break;
  all.push(...data);
  if (data.length < PAGE) break;
}

console.log(`총 ${all.length}문항\n`);

// 1. (subject, unit) 빈도
const counter = new Map();
for (const q of all) {
  const key = `${q.subject}|||${q.unit}`;
  counter.set(key, (counter.get(key) ?? 0) + 1);
}
const entries = Array.from(counter.entries()).sort((a,b)=>b[1]-a[1]);

console.log("=== (과목, 단원) 빈도 ===");
for (const [k, n] of entries) {
  const [subject, unit] = k.split("|||");
  const known = SUBJECT_UNITS[subject]?.includes(unit) ?? false;
  console.log(`  ${known ? "✓" : "⚠️"}  ${subject.padEnd(8)} ${unit.padEnd(20)} ${n}`);
}

// 2. taxonomy에 없는 unit
console.log("\n=== taxonomy 미정의 unit (⚠️) ===");
let unknown = 0;
for (const [k, n] of entries) {
  const [subject, unit] = k.split("|||");
  if (!(SUBJECT_UNITS[subject]?.includes(unit))) {
    console.log(`  ${subject} / ${unit}  (${n}문항)`);
    unknown++;
  }
}
if (unknown === 0) console.log("  없음");

// 3. "변화율" 키워드 문제 분포
console.log("\n=== '변화율' 키워드 문제 분포 ===");
const rateProblems = all.filter(q =>
  /변화율|순간\s*변화율|평균\s*변화율|관련\s*변화율/.test(q.question + " " + (q.concept ?? ""))
);
console.log(`  총 ${rateProblems.length}문항`);
const rateUnit = new Map();
for (const q of rateProblems) {
  const key = `${q.subject}|||${q.unit}|||${q.concept}`;
  rateUnit.set(key, (rateUnit.get(key) ?? 0) + 1);
}
for (const [k, n] of Array.from(rateUnit.entries()).sort((a,b)=>b[1]-a[1])) {
  const [subject, unit, concept] = k.split("|||");
  console.log(`  ${subject.padEnd(8)} ${unit.padEnd(15)} [${concept}]  ${n}`);
}

// 4. concept 값 분포 — 너무 자유로워서 표준화 안 된 케이스 발견
console.log("\n=== concept 값 빈도 TOP 30 (오타/표기 불일치 발견용) ===");
const conceptCounter = new Map();
for (const q of all) {
  conceptCounter.set(q.concept, (conceptCounter.get(q.concept) ?? 0) + 1);
}
const conceptEntries = Array.from(conceptCounter.entries()).sort((a,b)=>b[1]-a[1]);
for (const [c, n] of conceptEntries.slice(0, 30)) {
  console.log(`  ${(c ?? "(null)").padEnd(35)} ${n}`);
}

// 5. 잘못 분류된 의심 케이스 — 키워드 vs unit 불일치
console.log("\n=== 의심 케이스: 키워드와 unit 불일치 ===");
const suspect = [];
const KW_TO_UNITS = [
  { keyword: /순간\s*변화율|미분계수|미분.*값을 묻|f'\(/, expectedUnits: ["미분", "도함수의 응용", "순간 변화율", "접선의 방정식"], notes: "미분/순간변화율" },
  { keyword: /접선|tangent/, expectedUnits: ["접선의 방정식", "도함수의 응용"], notes: "접선" },
  { keyword: /로피탈|로피탈정리|L.Hopital/, expectedUnits: ["평균값의 정리 및 로피탈 정리", "극한과 연속"], notes: "로피탈" },
  { keyword: /테일러|Taylor.*급수/, expectedUnits: ["Taylor급수", "Maclaurin급수의 응용", "Taylor급수와 최대/최소"], notes: "테일러급수" },
  { keyword: /이중적분|중적분/, expectedUnits: ["중적분", "체적과 곡면적", "삼중적분과 극좌표계"], notes: "중적분" },
  { keyword: /선적분|line integral/, expectedUnits: ["선적분과 면적분"], notes: "선적분" },
  { keyword: /고유치|고윳값|eigenvalue/, expectedUnits: ["고유치와 대각화"], notes: "고유치" },
  { keyword: /라플라스|Laplace/, expectedUnits: ["Laplace변환", "라플라스 변환"], notes: "라플라스" },
  { keyword: /미분방정식/, expectedUnits: ["미분방정식"], notes: "미분방정식" },
];
for (const q of all) {
  const text = `${q.question} ${q.concept ?? ""}`;
  for (const r of KW_TO_UNITS) {
    if (r.keyword.test(text) && !r.expectedUnits.includes(q.unit)) {
      suspect.push({ id: q.id, subject: q.subject, unit: q.unit, concept: q.concept, hit: r.notes });
      break;
    }
  }
}
console.log(`  총 ${suspect.length}건`);
for (const s of suspect.slice(0, 30)) {
  console.log(`  ${s.id}  ${s.subject}/${s.unit}  [${s.concept}]  ← ${s.hit}`);
}
if (suspect.length > 30) console.log(`  ... 외 ${suspect.length - 30}건 더`);
