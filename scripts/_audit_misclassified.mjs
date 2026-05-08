// 미분학에 들어 있는데 선형대수일 가능성이 높은 문제, 그 외 명확한 오분류 찾기.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const PAGE = 1000;
const all = [];
for (let from = 0; ; from += PAGE) {
  const { data } = await sb.from("questions").select("id, subject, unit, concept, question").range(from, from+PAGE-1);
  if (!data || data.length === 0) break;
  all.push(...data);
  if (data.length < PAGE) break;
}

// 강한 시그널: 본문에 다음 키워드가 있으면 그 과목으로 재분류 후보
const RULES = [
  // === 선형대수 시그널 ===
  {
    test: (q) => /(begin\{pmatrix|begin\{bmatrix|행렬식|행렬\b|matrix|위수\(rank|\brank\()/i.test(q.question + (q.concept ?? "")),
    targetSubject: "선형대수",
    suggestUnit: (q) => {
      const t = q.question + (q.concept ?? "");
      if (/고[유윳]치|eigen|대각화|닮음/i.test(t)) return "고유치와 대각화";
      if (/벡터공간|일차[독종]립|기저|차원|영공간/i.test(t)) return "벡터공간";
      if (/선형사상|선형변환|전사|단사|kernel|핵공간/i.test(t)) return "선형사상";
      if (/행렬|matrix|rank|위수|역행렬|전치|대칭/i.test(t)) return "행렬";
      return "행렬";
    },
    notes: "matrix/det/rank → 선형대수",
  },
  {
    test: (q) => /고[유윳]치|eigen|대각화/i.test(q.question + (q.concept ?? "")),
    targetSubject: "선형대수",
    suggestUnit: () => "고유치와 대각화",
    notes: "eigenvalue → 선형대수/고유치와 대각화",
  },
  {
    test: (q) => /(평면의\s*방정식|두\s*점.*포함하는\s*평면|평면.*수직)/i.test(q.question + (q.concept ?? "")),
    targetSubject: "선형대수",
    suggestUnit: () => "벡터와 공간도형",
    notes: "평면의 방정식 → 선형대수/벡터와 공간도형",
  },
  {
    test: (q) => /벡터.*외적|cross\s*product|\\vec[ab].*\\times|벡터.*수직|벡터.*평행|벡터.*내적|dot\s*product/i.test(q.question + (q.concept ?? "")),
    targetSubject: "선형대수",
    suggestUnit: () => "벡터와 공간도형",
    notes: "벡터 내·외적 → 선형대수/벡터와 공간도형",
  },
  {
    test: (q) => /일차[독종]립|일차결합|기저|차원\s*[(]|영공간|상공간|null\s*space|column\s*space/i.test(q.question + (q.concept ?? "")),
    targetSubject: "선형대수",
    suggestUnit: () => "벡터공간",
    notes: "일차독립/기저/차원 → 선형대수/벡터공간",
  },
  {
    test: (q) => /내적.*직교|함수.*내적|그람.*슈미트|gram[\s-]?schmidt|정규직교|orthonormal|서로\s*직교/i.test(q.question + (q.concept ?? "")),
    targetSubject: "선형대수",
    suggestUnit: () => "벡터공간",
    notes: "내적공간/직교 → 선형대수/벡터공간",
  },
];

console.log("=== 미분학에 있지만 선형대수일 가능성 높은 문제 ===\n");
const candidates = [];
for (const q of all) {
  if (q.subject === "선형대수") continue;
  for (const r of RULES) {
    if (q.subject === r.targetSubject) continue;
    if (r.test(q)) {
      candidates.push({ q, suggestSubject: r.targetSubject, suggestUnit: r.suggestUnit(q), notes: r.notes });
      break;
    }
  }
}

// 과목별 그룹
const bySubject = new Map();
for (const c of candidates) {
  if (!bySubject.has(c.q.subject)) bySubject.set(c.q.subject, []);
  bySubject.get(c.q.subject).push(c);
}

for (const [subject, list] of bySubject) {
  console.log(`\n## ${subject}에 있는 의심 문제 ${list.length}건`);
  for (const c of list) {
    const head = c.q.question.replace(/\s+/g, " ").slice(0, 80);
    console.log(`  ${c.q.id}  [${c.q.unit}/${c.q.concept ?? ""}]  → ${c.suggestSubject}/${c.suggestUnit}`);
    console.log(`    ${head}${c.q.question.length > 80 ? "..." : ""}`);
  }
}

console.log(`\n총 ${candidates.length}건 의심`);
