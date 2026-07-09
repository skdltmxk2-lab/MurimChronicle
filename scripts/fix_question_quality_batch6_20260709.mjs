// Expand remaining P2 ultra-short explanations from the quality audit.
//
// Usage:
//   node scripts/fix_question_quality_batch6_20260709.mjs --dry-run
//   node scripts/fix_question_quality_batch6_20260709.mjs
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
  ["p-cb01-03", "$f(x)=x^3-2x$를 미분하면 $f'(x)=3x^2-2$이다. 따라서 $x=1$을 대입하면 $f'(1)=3\\cdot1^2-2=1$이므로 정답은 ③이다."],
  ["p-la01-03", "정사각행렬 $A$가 역행렬을 가지는 필요충분조건은 $\\det A\\ne0$이다. 문제에서 $\\det A=0$이므로 $A$는 특이행렬이고 역행렬을 가지지 않는다. 따라서 항상 참인 명제는 ③이다."],
  ["p-la01-04", "대각행렬의 고유값은 주대각선의 성분이다. 실제로 $D-\\lambda I$의 행렬식은 $(2-\\lambda)(5-\\lambda)$이므로 고유값은 $2,5$이다."],
  ["q-2020-dankook-47", "행렬을 행 기본변환으로 줄이면 피벗이 3개 생기고 0이 아닌 행이 3개 남는다. 행렬의 계수(rank)는 피벗의 개수와 같으므로 주어진 행렬의 rank는 $3$이다."],
  ["q-2022-dgu-14", "행렬의 고유값의 합은 대각합(trace)과 같다. 따라서 $\\operatorname{tr}(A)=2+(-2)+(-2)=-2$이므로 세 고유값의 합은 $-2$이다."],
  ["q-2022-ewha-05", "공간 평행사변형의 넓이를 $S$라 하면 좌표평면으로의 정사영 넓이 $S_1,S_2,S_3$에 대해 $S^2=S_1^2+S_2^2+S_3^2$가 성립한다. 따라서 $S^2=1^2+4^2+8^2=81$이다."],
  ["q-2022-kyunghee-25", "구하는 좌표를 $(a,b,c)$라 두면 $a(1,2,1)+b(2,9,0)+c(3,3,4)=(5,-1,9)$이다. 연립방정식을 풀면 $a=1$, $b=-1$, $c=2$이므로 성분의 합은 $2$이다."],
  ["q-2022-seoultech-20", "영공간의 차원은 정의역 차원에서 rank를 뺀 값이다. 이 $4\\times4$ 행렬을 행 축약하면 rank가 $3$이므로 nullity는 $4-3=1$이다."],
  ["q-2024-seoultech-17", "주어진 $4\\times4$ 행렬을 행 축약하면 네 열에 모두 피벗이 생긴다. 즉 네 행이 모두 독립이므로 행렬의 계수는 $4$이다."],
  ["q-2025-cau-12", "$0<a<b$이므로 $a^n+b^n=b^n\\{(a/b)^n+1\\}$이다. 따라서 $(a^n+b^n)^{1/n}=b\\{1+(a/b)^n\\}^{1/n}$이고, $(a/b)^n\\to0$이므로 극한은 $b$이다."],
  ["q-2025-hansung-06", "분자 $x^{10}+3x-4$는 $x=1$에서 $0$이고 분모도 $0$이므로 로피탈 정리를 적용한다. 분자를 미분하면 $10x^9+3$, 분모를 미분하면 $1$이므로 극한값은 $10+3=13$이다."],
  ["q-2025-inha-10", "세 점에서 같은 거리에 있는 점을 외접원 중심이라 한다. $(3,5)$에서 세 점 $(3,0),(0,9),(7,2)$까지의 거리는 각각 $5,5,5$이므로 외접원 중심은 $(3,5)$이고 반지름은 $5$이다."],
  ["q-daily-eng-r10-3", "Cauchy-Euler형 방정식을 풀면 일반해와 특수해를 정리해 $y=-\\frac{x}{5}+\\frac{x^3}{5}$가 된다. 이 함수는 $y(1)=0$, $y'(1)=\\frac25$를 만족한다. 따라서 $y(5)=-1+25=24$이다."],
  ["q-daily-eng-r11-2", "해가 $e^{2x}(C_1\\cos3x+C_2\\sin3x)$ 꼴이면 특성근은 $2\\pm3i$이다. 이차방정식의 상수항 $b$는 두 근의 곱이므로 $b=(2+3i)(2-3i)=4+9=13$이다."],
  ["q-daily-eng-r15-2", "$f(y)=(y-1)(y-2)(y-3)$의 부호를 보면 $y=2$의 왼쪽 $(1,2)$에서는 $f(y)>0$, 오른쪽 $(2,3)$에서는 $f(y)<0$이다. 해가 양쪽에서 $y=2$로 향하므로 안정적 임계점은 $2$이다."],
  ["q-daily-int-r16-5", "부분적분으로 $u=\\ln x$, $dv=dx$를 잡으면 $\\int\\ln x\\,dx=x\\ln x-x$이다. $x\\to0^+$에서 $x\\ln x\\to0$이므로 $[x\\ln x-x]_0^1=-1$이다."],
  ["q-daily-int-r34-4", "$r=\\tan\\theta$에서 $\\theta=\\pi/6$이면 점은 $(x,y)=\\left(\\frac12,\\frac{1}{2\\sqrt3}\\right)$이다. $dx/d\\theta=\\frac{\\sqrt3}{2}$, $dy/d\\theta=\\frac76$이므로 기울기는 $\\frac{7}{3\\sqrt3}$이다. 점-기울기식을 정리하면 $7x-3\\sqrt3y=2$이다."],
  ["q-daily-int-r35-2", "$r=1-2\\sin\\theta$의 내부 루프는 $\\theta=\\pi/6$부터 $5\\pi/6$까지 생긴다. 전체 극곡선 넓이는 $\\frac12\\int_0^{2\\pi}(1-2\\sin\\theta)^2d\\theta=3\\pi$이고, 내부 루프 넓이는 $\\pi-\\frac{3\\sqrt3}{2}$이다. 외부와 내부 사이의 넓이는 $3\\pi-2\\left(\\pi-\\frac{3\\sqrt3}{2}\\right)=\\pi+3\\sqrt3$이다."],
  ["q-daily-la-r18-1", "주어진 네 벡터를 행 또는 열로 놓고 행 축약하면 피벗이 3개 생긴다. 따라서 이 벡터들이 생성하는 부분공간의 차원은 3이고, 그중 선형독립으로 고를 수 있는 벡터의 최대 개수도 $3$이다."],
  ["q-daily-la-r20-4", "행렬 $A$의 영공간 차원은 $\\operatorname{nullity}(A)=n-\\operatorname{rank}(A)$이다. 이 행렬은 열이 4개이고 행 축약하면 rank가 $2$이므로 영공간의 차원은 $4-2=2$이다."],
  ["q-daily-la-r21-4", "보기 ④의 벡터에 행렬을 곱하면 $B(1,1,-1)^T=(9,9,-7)^T$이다. 이 결과는 $(1,1,-1)^T$의 스칼라배가 아니므로 ④는 고유벡터가 아니다."],
  ["q-daily-la-r21-5", "행렬의 고윳값의 합은 대각합과 같다. 따라서 $\\lambda_1+\\lambda_2+\\lambda_3=\\operatorname{tr}(A)=2+1+3=6$이다."],
  ["q-daily-la-r21-6", "고윳값의 합은 행렬의 trace와 같다. 주어진 행렬의 대각합은 $0+(-1)+(-2)=-3$이므로 고유값들의 합도 $-3$이다."],
  ["q-daily-la-r22-6", "특성다항식이 $p(\\lambda)=\\det(\\lambda I-A)$ 꼴이면 상수항은 $(-1)^3\\det A$이다. 여기서 상수항이 $-2$이므로 $-\\det A=-2$, 따라서 $\\det A=2$이다."],
  ["q-daily-la-r27-6", "최소다항식에 $(x-2)^2$와 $(x-3)^2$가 모두 포함되어 있으려면 고유값 $2$와 $3$ 각각에 대해 크기 2 이상의 Jordan 블록이 필요하다. 따라서 가능한 최소 행렬 크기는 $2+2=4$이다."],
  ["q-daily-la-r3-1", "전치행렬은 행렬식을 바꾸지 않으므로 $\\det(C^T)=\\det C$이다. $C$의 행렬식을 전개하면 $120$이므로 $C^T$의 행렬식도 $120$이다."],
  ["q-daily-la-r3-2", "행렬식은 거듭제곱에 대해 $\\det(A^3)=(\\det A)^3$을 만족한다. 주어진 행렬을 전개하면 $\\det A=2$이므로 $\\det(A^3)=2^3=8$이다."],
  ["q-daily-la-r30-5", "$T$의 치역은 표현행렬의 열공간이다. 열벡터들이 만족하는 선형관계를 구하면 $2x-y-z=0$이므로 치역은 평면 $\\{(x,y,z):2x-y-z=0\\}$이다."],
  ["q-daily-la-r33-3", "$U$는 $y+z+w=0$이라는 하나의 동차 선형방정식으로 정의된 부분공간이다. 이 식의 계수벡터 $(0,1,1,1)$은 $U$의 모든 벡터와 직교하므로 $U^\\perp$의 기저가 된다."],
  ["q-daily-la-r35-3", "실대칭행렬은 서로 다른 고윳값에 대응하는 고유벡터들이 서로 직교한다. 따라서 $\\lambda\\ne\\mu$이면 $v^Tw=0$이므로 가능한 값은 $0$이다."],
  ["q-daily-la-r6-6", "행렬을 행 기본변환으로 줄이면 0이 아닌 행이 3개 남는다. rank는 행 축약 후 0이 아닌 행의 개수와 같으므로 주어진 행렬의 rank는 $3$이다."],
  ["q-daily-la-r7-2", "첨가행렬을 행 축약하면 마지막 조건이 $0=c-5$ 꼴로 나온다. 연립방정식이 해를 가지려면 모순이 없어야 하므로 $c-5=0$, 즉 $c=5$이다."],
  ["q-daily-la-r7-4", "동차연립방정식이 무수히 많은 해를 가지려면 계수행렬이 특이행렬이어야 한다. 계수행렬의 행렬식은 $a^3+1$이므로 $a^3+1=0$에서 실수해는 $a=-1$이다."],
  ["q-daily-mv-r14-1", "방향도함수가 최대가 되는 방향은 그래디언트 방향이다. $f_x=2xy+y^2$, $f_y=x^2+2xy$이므로 $\\nabla f(1,-2)=(0,-3)$이다. 이를 단위벡터로 만들면 $(0,-1)$이다."],
  ["q-daily-mv-r15-1", "최대 변화율은 그래디언트의 크기이다. $f_x=2x-1$, $f_y=2y-3$이므로 $\\nabla f(1,2)=(1,1)$이고, 그 크기는 $\\sqrt{1^2+1^2}=\\sqrt2$이다."],
  ["q-daily-mv-r21-4", "$(0,0)$에서 판별식이 $0$이라 2차 판정법만으로는 결론을 낼 수 없다. 그러나 $y=0$으로 두면 $f(x,0)=x^3$이라 원점 근처에서 양수와 음수를 모두 가진다. 따라서 $(0,0)$은 극솟값이 아니므로 ②가 옳지 않다."],
  ["q-daily-mv-r3-5", "곡선은 반지름 $4$, 축 방향 속도 $3$인 원형나선이다. 원형나선 $r(t)=(bt,a\\sin t,a\\cos t)$의 곡률은 $\\kappa=\\dfrac{a}{a^2+b^2}$이므로 $\\kappa=\\dfrac{4}{16+9}=\\dfrac{4}{25}$이다."],
  ["q-white-final-a-r13-13", "$A=I+J$로 볼 수 있다. 여기서 $J$는 모든 성분이 $1$인 $3\\times3$ 행렬이므로 고유값은 $3,0,0$이고, $A$의 고유값은 $4,1,1$이다. 대칭행렬이라 대각화 가능하므로 최소다항식은 $(x-4)(x-1)$이다. 따라서 $a+b+m+n=4+1+1+1=7$이다."],
];

console.log(`${dryRun ? "Dry run" : "Applying"} ${fixes.length} ultra-short explanation fixes.`);
for (const [id] of fixes) console.log(`- ${id}`);

if (!dryRun) {
  const changes = [];
  for (const [id, explanation] of fixes) {
    const { data: before, error: fetchError } = await sb
      .from("questions")
      .select("id, subject, unit, concept")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;

    const { error: updateError } = await sb
      .from("questions")
      .update({ explanation, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (updateError) throw updateError;

    changes.push({
      id,
      subject: before.subject,
      unit: before.unit,
      concept: before.concept,
      fields: ["explanation"],
    });
  }

  writeFileSync(
    resolve(outDir, "question_quality_manual_fixes_20260709_batch6.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        dryRun: false,
        scope: "manual ultra-short explanation fixes batch 6",
        changes,
      },
      null,
      2,
    ),
  );
  console.log("Ultra-short explanation fixes applied.");
} else {
  console.log("No rows were changed.");
}
