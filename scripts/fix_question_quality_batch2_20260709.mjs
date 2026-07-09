// Apply the second batch of manually reviewed question-quality fixes.
//
// Usage:
//   node scripts/fix_question_quality_batch2_20260709.mjs --dry-run
//   node scripts/fix_question_quality_batch2_20260709.mjs
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

const fixes = [
  {
    id: "q-2018-hanyang-13",
    rationale: "문항 보기의 R^5 오기를 R^3로 바로잡고 출제 의도 메모 제거",
    patch: {
      question:
        "다음 <보기> 중에서 벡터공간 $R^3$의 부분공간을 모두 고르시오.\n가) $\\{(x,y,7x-5y)\\mid x,y\\in R\\}$\n나) $\\{(x,y,z)\\in R^3\\mid 3x+7y-1=0\\}$\n다) $\\{(x,y,z)\\in R^3\\mid xy=0\\}\\cap\\{(x,y,z)\\in R^3\\mid yz=0\\}\\cap\\{(x,y,z)\\in R^3\\mid zx=0\\}$\n라) $\\{(x,y,z)\\in R^3\\mid 5x+2y-3z=0\\}$",
      explanation:
        "가)는 $(x,y,7x-5y)=x(1,0,7)+y(0,1,-5)$로 쓸 수 있으므로 부분공간이다. 나)는 $3x+7y-1=0$이 원점을 포함하지 않아 부분공간이 아니다. 다)는 세 좌표축의 합집합이고, 예를 들어 $(1,0,0)+(0,1,0)=(1,1,0)$이 조건을 만족하지 않으므로 덧셈에 닫혀 있지 않다. 라)는 동차 선형방정식 $5x+2y-3z=0$의 해집합이므로 부분공간이다. 따라서 부분공간은 가), 라)이다.",
    },
  },
  {
    id: "q-2023-konkuk-40",
    rationale: "비표준 표현 제거 및 편각 선적분 설명 정리",
    patch: {
      concept: "편각 선적분(원점 포함)",
      explanation:
        "$\\vec F=\\left(\\dfrac{-y}{x^2+y^2},\\dfrac{x}{x^2+y^2}\\right)$는 원점 밖에서 편각 $\\theta$의 미분 $d\\theta$에 해당한다. 곡선 $C$는 원점을 한 번 반시계 방향으로 둘러싸는 정사각형이므로 편각의 총 변화량은 $2\\pi$이다. 따라서 선적분의 값은 $2\\pi$이다.",
    },
  },
  {
    id: "q-2023-sejong-21",
    rationale: "해설의 검산 중간 메모 제거 및 겉넓이 분할 설명 정리",
    patch: {
      explanation:
        "$E$의 바닥은 $z=0$ 위의 정사각형 $[-1,1]\\times[-1,1]$이므로 넓이는 $4$이다. 윗면은 $z=\\min(1-x^2,1-y^2)$이고, $|x|\\ge |y|$인 영역에서는 $z=1-x^2$, $|y|\\ge |x|$인 영역에서는 $z=1-y^2$가 된다. 대칭성을 이용하면 윗면 넓이는\n$8\\displaystyle\\int_0^1 x\\sqrt{1+4x^2}\\,dx=8\\cdot\\dfrac{5\\sqrt5-1}{12}=\\dfrac{2(5\\sqrt5-1)}{3}$이다. 경계 $|x|=1$ 또는 $|y|=1$에서는 윗면 높이가 $0$이라 추가 옆면 넓이는 없다. 따라서 전체 겉넓이는\n$4+\\dfrac{2(5\\sqrt5-1)}{3}=\\dfrac{10}{3}(\\sqrt5+1)$이다.",
    },
  },
  {
    id: "q-2024-konkuk-40",
    rationale: "비표준 표현 제거 및 열린 곡선 편각 변화 설명 정리",
    patch: {
      concept: "편각 선적분",
      explanation:
        "$\\vec F=\\dfrac{1}{x^2+y^2}(-y,x)$에 대해 $\\vec F\\cdot d\\vec r=d\\theta$이다. 이 곡선은 $(2,0)$에서 출발해 $(-2,0)$에서 끝나는 위쪽 반타원이며 원점을 지나지 않는다. 출발점의 편각은 $0$, 끝점의 편각은 $\\pi$이므로 선적분의 값은 편각 변화량 $\\pi-0=\\pi$이다.",
    },
  },
  {
    id: "q-2024-skku-04",
    rationale: "방향장 해설의 부호 표현을 명확히 정리",
    patch: {
      explanation:
        "방향장에서 평형해는 $y=0,3$이다. 보기 ①의 $-y(y-3)^2$는 $y>3$과 $0<y<3$에서 기울기가 음수이고, $y<0$에서 기울기가 양수이다. 또한 $y=3$은 중근이라 양쪽에서 기울기 부호가 바뀌지 않는 반안정 평형이 된다. 방향장의 부호 배열과 일치하므로 정답은 ①이다.",
    },
  },
  {
    id: "q-2024am-dankook-36",
    rationale: "외부 출처 표현 제거 및 극좌표 넓이 계산 정리",
    patch: {
      explanation:
        "$\\cos2\\theta\\ge0$인 구간은 전체 길이가 $\\pi$이고, 해당 구간에서 극좌표 넓이는\n$\\displaystyle S=\\frac12\\int_{\\cos2\\theta\\ge0}\\cos^2 2\\theta\\,d\\theta$이다. $\\cos^2 2\\theta$의 평균값은 $\\frac12$이므로\n$S=\\frac12\\cdot\\frac{\\pi}{2}=\\frac{\\pi}{4}$이다.",
    },
  },
];

console.log(`${dryRun ? "Dry run" : "Applying"} ${fixes.length} question quality fixes.`);
for (const fix of fixes) {
  console.log(`- ${fix.id}: ${fix.rationale}`);
}

if (!dryRun) {
  const changes = [];
  for (const fix of fixes) {
    const { data: before, error: fetchError } = await sb
      .from("questions")
      .select("id, subject, unit, concept")
      .eq("id", fix.id)
      .single();
    if (fetchError) throw fetchError;

    const { error: updateError } = await sb
      .from("questions")
      .update({ ...fix.patch, updated_at: new Date().toISOString() })
      .eq("id", fix.id);
    if (updateError) throw updateError;

    changes.push({
      id: fix.id,
      rationale: fix.rationale,
      subject: before.subject,
      unit: before.unit,
      concept: before.concept,
      fields: Object.keys(fix.patch),
    });
  }

  writeFileSync(
    resolve(outDir, "question_quality_manual_fixes_20260709_batch2.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        dryRun: false,
        scope: "manual question quality fixes batch 2",
        changes,
      },
      null,
      2,
    ),
  );
  console.log("Question quality fixes applied.");
} else {
  console.log("No rows were changed.");
}
