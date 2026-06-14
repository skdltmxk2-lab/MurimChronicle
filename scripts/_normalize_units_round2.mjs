// DB 분류 2차 정규화: 1차 이후 taxonomy 밖에 남은 소수 단원과
// "추가내용" 중 문제/개념명만으로 안전하게 판단 가능한 항목을 정리한다.
// 기본은 dry-run. 실제 반영은 --apply를 붙여 실행한다.
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
const apply = process.argv.includes("--apply");

const directRules = [
  ["미분학", "역삼각함수", "미분학", "함수"],
  ["다변수함수", "이차곡선", "다변수함수", "곡선과 곡면"],
  ["다변수함수", "평면곡선", "다변수함수", "곡선과 곡면"],
];

const conceptRules = [
  {
    from: ["미분학", "추가내용"],
    to: ["미분학", "최대/최소"],
    patterns: [/최대|최소|최댓값|최솟값|극값|최적화|직사각형 최대/],
  },
  {
    from: ["미분학", "추가내용"],
    to: ["미분학", "도함수의 응용"],
    patterns: [/매개변수|오목|볼록|곡률|그래프|뉴턴|관련변화율|관련 변화율/],
  },
  {
    from: ["미분학", "추가내용"],
    to: ["미분학", "평균값의 정리 및 로피탈 정리"],
    patterns: [/평균값|롤|로피탈/],
  },
  {
    from: ["미분학", "추가내용"],
    to: ["미분학", "Taylor급수"],
    patterns: [/테일러|Taylor/],
  },
  {
    from: ["적분학", "추가내용"],
    to: ["적분학", "극좌표와 응용"],
    patterns: [/극곡선|극좌표|카디오이드/],
  },
  {
    from: ["적분학", "추가내용"],
    to: ["적분학", "정적분의 계산"],
    patterns: [/적분|라이프니츠|치환|부분적분|삼각치환/],
  },
  {
    from: ["적분학", "추가내용"],
    to: ["적분학", "급수의 수렴\/발산"],
    patterns: [/급수|수렴|발산|멱급수|이항급수/],
  },
  {
    from: ["다변수함수", "추가내용"],
    to: ["다변수함수", "곡선과 곡면"],
    patterns: [/직선|평면|공간|방향코사인|곡선|곡면|거리|접선|접평면/],
  },
  {
    from: ["다변수함수", "추가내용"],
    to: ["다변수함수", "경도 및 방향도함수"],
    patterns: [/관련변화율|관련 변화율|변화율|방향도함수|그래디언트|gradient/i],
  },
  {
    from: ["다변수함수", "추가내용"],
    to: ["다변수함수", "Taylor급수와 최대/최소"],
    patterns: [/최대|최소|최댓값|최솟값|극값|라그랑주/],
  },
  {
    from: ["선형대수", "추가내용"],
    to: ["공학수학", "복소수"],
    patterns: [/단위근|복소/],
  },
  {
    from: ["선형대수", "추가내용"],
    to: ["선형대수", "행렬"],
    patterns: [/행렬|연립방정식|전치|trace|거듭제곱/],
  },
  {
    from: ["선형대수", "추가내용"],
    to: ["선형대수", "벡터공간"],
    patterns: [/선형독립|기저|부분공간|직교|내적|정규직교/],
  },
  {
    from: ["선형대수", "추가내용"],
    to: ["선형대수", "고유치와 대각화"],
    patterns: [/고유|대각화|이차형식|양정치|스펙트럼/],
  },
  {
    from: ["선형대수", "추가내용"],
    to: ["선형대수", "선형사상"],
    patterns: [/선형사상|선형변환|치역|핵|영공간/],
  },
  {
    from: ["공학수학", "추가내용"],
    to: ["공학수학", "미분방정식"],
    patterns: [/미분방정식|운동방정식/],
  },
  {
    from: ["공학수학", "추가내용"],
    to: ["공학수학", "복소수"],
    patterns: [/복소|오일러|단위근/],
  },
  {
    from: ["공학수학", "추가내용"],
    to: ["공학수학", "벡터해석"],
    patterns: [/그린|스토크스|발산|보존장|선적분|면적분|벡터장/],
  },
];

function matchesRule(row, rule) {
  const haystack = [row.concept, row.question].join("\n");
  return rule.patterns.some((pattern) => pattern.test(haystack));
}

async function updateIds(ids, subject, unit) {
  if (!apply || ids.length === 0) return;
  const { error } = await supabase
    .from("questions")
    .update({ subject, unit, updated_at: new Date().toISOString() })
    .in("id", ids);
  if (error) throw error;
}

console.log(`[normalize-units-round2] mode=${apply ? "APPLY" : "DRY-RUN"}`);
let total = 0;

for (const [fromSubject, fromUnit, toSubject, toUnit] of directRules) {
  const { data, error } = await supabase
    .from("questions")
    .select("id")
    .eq("subject", fromSubject)
    .eq("unit", fromUnit);
  if (error) throw error;
  const ids = (data ?? []).map((row) => row.id);
  if (ids.length === 0) continue;
  total += ids.length;
  console.log(
    `${String(ids.length).padStart(4)}  ${fromSubject}|${fromUnit} -> ${toSubject}|${toUnit}  ex=${ids.slice(0, 5).join(",")}`
  );
  await updateIds(ids, toSubject, toUnit);
}

const { data: miscRows, error: miscError } = await supabase
  .from("questions")
  .select("id, subject, unit, concept, question, tags")
  .eq("unit", "추가내용");
if (miscError) throw miscError;

const planned = new Map();
for (const row of miscRows ?? []) {
  const rule = conceptRules.find(
    (item) => item.from[0] === row.subject && item.from[1] === row.unit && matchesRule(row, item)
  );
  if (!rule) continue;
  const key = `${row.subject}|${row.unit} -> ${rule.to[0]}|${rule.to[1]}`;
  const item = planned.get(key) ?? { to: rule.to, ids: [] };
  item.ids.push(row.id);
  planned.set(key, item);
}

for (const [key, item] of [...planned.entries()].sort((a, b) => b[1].ids.length - a[1].ids.length)) {
  total += item.ids.length;
  console.log(`${String(item.ids.length).padStart(4)}  ${key}  ex=${item.ids.slice(0, 5).join(",")}`);
  await updateIds(item.ids, item.to[0], item.to[1]);
}

console.log(`[normalize-units-round2] target rows=${total}`);
