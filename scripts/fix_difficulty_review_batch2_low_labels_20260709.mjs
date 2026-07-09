// Apply manually reviewed corrections for under-labeled easy/easyMedium questions.
//
// Usage:
//   node scripts/fix_difficulty_review_batch2_low_labels_20260709.mjs --dry-run
//   node scripts/fix_difficulty_review_batch2_low_labels_20260709.mjs
//
// Scope: current easy/easyMedium rows that are not appropriate for a low label
// after direct review of the question and solution burden.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const dryRun = process.argv.includes("--dry-run");
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const outDir = resolve(root, "tmp", "audit");
mkdirSync(outDir, { recursive: true });

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

const reviewedChanges = [
  {
    id: "q-2017-cau-26",
    from: "easyMedium",
    to: "medium",
    rationale: "두 평행직선을 포함하는 평면을 잡고 점-평면 거리까지 계산해야 하므로 중 난이도가 적절함",
  },
  {
    id: "q-2017-cau-29",
    from: "easyMedium",
    to: "medium",
    rationale: "사분원 영역 해석과 적분순서 변경이 필요해 중하보다는 중 난이도",
  },
  {
    id: "q-2017-hanyang-03",
    from: "easyMedium",
    to: "medium",
    rationale: "구간 내부 특이점을 확인해야 하는 함정형 특이적분이라 중 난이도",
  },
  {
    id: "q-2017-skku-02",
    from: "easyMedium",
    to: "medium",
    rationale: "공간곡선 곡률 공식과 외적 계산이 필요해 중 난이도",
  },
  {
    id: "q-2017-skku-05",
    from: "easy",
    to: "medium",
    rationale: "1계 선형 미분방정식의 적분인자와 초기조건 계산이 필요해 하 난이도로는 낮음",
  },
  {
    id: "q-2017-skku-07",
    from: "easy",
    to: "easyMedium",
    rationale: "3차원 평면의 절편 삼각형 면적을 외적으로 계산해야 하므로 하보다는 중하",
  },
  {
    id: "q-2017-skku-11",
    from: "easy",
    to: "easyMedium",
    rationale: "구간지시 함수의 라플라스 변환을 적분으로 구성해야 하므로 하보다는 중하",
  },
  {
    id: "q-2017-skku-17",
    from: "easyMedium",
    to: "medium",
    rationale: "그린정리 적용과 대칭성 판단이 필요해 중 난이도",
  },
  {
    id: "q-2018-cau-07",
    from: "easy",
    to: "easyMedium",
    rationale: "감마함수 공식 또는 반복 부분적분 인식이 필요해 하보다는 중하",
  },
  {
    id: "q-2018-hanyang-05",
    from: "easyMedium",
    to: "medium",
    rationale: "여러 선적분과 호길이 선적분을 비교해야 하므로 중 난이도",
  },
  {
    id: "q-2018-hanyang-13",
    from: "easyMedium",
    to: "medium",
    rationale: "부분공간 판정 보기형으로 원점, 닫힘성, 차원 불일치를 함께 확인해야 함",
  },
  {
    id: "q-2018-hanyang-19",
    from: "easy",
    to: "medium",
    rationale: "2계 상수계수 ODE 해법과 초기조건 연립 계산이 필요해 중 난이도",
  },
  {
    id: "q-2018-konkuk-39",
    from: "easyMedium",
    to: "medium",
    rationale: "폐곡선 선적분을 그린정리와 면적 해석으로 연결해야 하므로 중 난이도",
  },
  {
    id: "q-2018-kwangwoon-12",
    from: "easy",
    to: "easyMedium",
    rationale: "쌍곡함수 미분과 곡선 길이 공식을 알아야 해 하보다는 중하",
  },
  {
    id: "q-2018-kwangwoon-19",
    from: "easy",
    to: "easyMedium",
    rationale: "음함수 형태의 곡면 접평면을 기울기/법선벡터로 계산해야 함",
  },
  {
    id: "q-2018-kwangwoon-29",
    from: "easy",
    to: "easyMedium",
    rationale: "공간곡선 길이 공식 적용이 필요해 하보다는 중하",
  },
  {
    id: "q-2018-skku-01",
    from: "easy",
    to: "easyMedium",
    rationale: "내부 특이점 때문에 비고유적분으로 나누어 판단해야 하는 문제",
  },
  {
    id: "q-2018-skku-05",
    from: "easyMedium",
    to: "medium",
    rationale: "3차원 보존장 퍼텐셜을 잡아 선적분 일을 계산해야 하므로 중 난이도",
  },
  {
    id: "q-2019-ajou-33",
    from: "easyMedium",
    to: "mediumHard",
    rationale: "비교판정법의 양항 조건과 절대수렴의 대우까지 판단하는 보기형 이론 문제",
  },
  {
    id: "q-2019-ajou-38",
    from: "easy",
    to: "easyMedium",
    rationale: "무한상한 이상적분과 아크탄젠트 치환을 함께 사용해야 함",
  },
  {
    id: "q-2019-ajou-46",
    from: "easyMedium",
    to: "medium",
    rationale: "적분순서 변경 후 치환적분까지 이어지는 이중적분 문제",
  },
  {
    id: "q-2019-ajou-47",
    from: "easyMedium",
    to: "medium",
    rationale: "극좌표 면적 공식과 삼각함수 거듭제곱 적분이 필요해 중 난이도",
  },
  {
    id: "q-2019-ajou-48",
    from: "easyMedium",
    to: "medium",
    rationale: "가우시안 적분 제곱을 1사분면 극좌표 영역으로 해석해야 함",
  },
  {
    id: "q-2019-dankook-35",
    from: "easy",
    to: "easyMedium",
    rationale: "카디오이드 면적 공식 또는 극좌표 면적 적분이 필요해 하보다는 중하",
  },
  {
    id: "q-2019-dankook-38",
    from: "easy",
    to: "easyMedium",
    rationale: "3변수 함수의 그래디언트와 단위방향벡터 내적을 계산해야 함",
  },
  {
    id: "q-2019-ewha-13",
    from: "easy",
    to: "easyMedium",
    rationale: "유리함수 분해 후 정적분 계산이 필요해 하보다는 중하",
  },
  {
    id: "q-2019-ewha-15",
    from: "easy",
    to: "easyMedium",
    rationale: "부분적분을 이용한 정적분으로 하보다는 중하",
  },
  {
    id: "q-2019-gachon-08",
    from: "easyMedium",
    to: "medium",
    rationale: "극방정식을 원으로 식별하고 면적을 계산해야 하는 극좌표 응용 문제",
  },
  {
    id: "q-2019-gachon-22",
    from: "easyMedium",
    to: "medium",
    rationale: "dx/dy 형태의 미분방정식을 해석하고 초기조건의 부호 가지를 선택해야 함",
  },
  {
    id: "q-2019-hanyang-03",
    from: "easyMedium",
    to: "medium",
    rationale: "쌍곡함수 공간곡선의 곡률을 외적으로 계산해야 하므로 중 난이도",
  },
  {
    id: "q-2019-hanyang-04",
    from: "easyMedium",
    to: "mediumHard",
    rationale: "곡면적 공식과 극좌표 이중적분 계산이 필요한 다단계 문제",
  },
  {
    id: "q-2019-hanyang-21",
    from: "easyMedium",
    to: "medium",
    rationale: "오일러-코시 중근 해와 초기조건 처리가 필요해 중 난이도",
  },
  {
    id: "q-2019-hanyang-erica-06",
    from: "easy",
    to: "easyMedium",
    rationale: "아크탄젠트 매클로린 전개 계수 인식이 필요해 하보다는 중하",
  },
  {
    id: "q-2019-hanyang-erica-16",
    from: "easy",
    to: "medium",
    rationale: "다항식 집합의 일차독립성을 여러 보기에서 판정해야 해 중 난이도",
  },
  {
    id: "q-2019-hanyang-erica-20",
    from: "easy",
    to: "mediumHard",
    rationale: "복소 고유값을 구하고 역수합을 계산해야 하므로 하 난이도로는 부적절",
  },
  {
    id: "q-2019-hanyang-erica-22",
    from: "easyMedium",
    to: "medium",
    rationale: "완전미분방정식 판정과 퍼텐셜 함수 구성이 필요해 중 난이도",
  },
];

const ids = reviewedChanges.map((change) => change.id);
const { data: rows, error: fetchError } = await sb
  .from("questions")
  .select("id, difficulty, subject, unit, concept, question")
  .in("id", ids);
if (fetchError) throw fetchError;

const rowsById = new Map((rows ?? []).map((row) => [row.id, row]));
const missingIds = ids.filter((id) => !rowsById.has(id));
if (missingIds.length) throw new Error(`Missing DB rows: ${missingIds.join(", ")}`);

const report = {
  generatedAt: new Date().toISOString(),
  dryRun,
  scope: "manual difficulty review batch 2: under-labeled easy/easyMedium candidates",
  changes: [],
};

console.log(`${dryRun ? "Dry run" : "Applying"} ${reviewedChanges.length} difficulty changes.`);
for (const change of reviewedChanges) {
  const row = rowsById.get(change.id);
  if (row.difficulty !== change.from) {
    throw new Error(`${change.id} expected difficulty ${change.from}, found ${row.difficulty}`);
  }

  const reportRow = {
    ...change,
    subject: row.subject,
    unit: row.unit,
    concept: row.concept,
    questionExcerpt: String(row.question ?? "").replace(/\s+/g, " ").slice(0, 220),
  };
  report.changes.push(reportRow);
  console.log(`- ${change.id}: ${change.from} -> ${change.to} (${change.rationale})`);

  if (dryRun) continue;
  const { error: updateError } = await sb
    .from("questions")
    .update({ difficulty: change.to, updated_at: new Date().toISOString() })
    .eq("id", change.id);
  if (updateError) throw updateError;
}

writeFileSync(
  resolve(outDir, "difficulty_manual_review_20260709_batch2_low_labels.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log(dryRun ? "No rows were changed." : "Difficulty changes applied.");
