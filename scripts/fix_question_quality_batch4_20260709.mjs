// Expand additional short-but-fixable explanations from the quality audit.
//
// Usage:
//   node scripts/fix_question_quality_batch4_20260709.mjs --dry-run
//   node scripts/fix_question_quality_batch4_20260709.mjs
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
    id: "q-daily-la-r31-1",
    rationale: "핵 차원 계산 보강",
    patch: {
      explanation:
        "표현행렬은 $\\begin{pmatrix}3&-2&-1&-4\\\\1&1&-2&-3\\end{pmatrix}$이고 두 행은 서로 배수가 아니므로 rank가 $2$이다. 정의역의 차원은 $4$이므로 rank-nullity 정리에 의해 $\\dim\\ker T=4-2=2$이다.",
    },
  },
  {
    id: "q-daily-la-r5-4",
    rationale: "역행렬 행렬식 계산 보강",
    patch: {
      explanation:
        "$A$의 첫 행으로 전개하면 $\\det A=2\\det\\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}-2\\det\\begin{pmatrix}-2&1\\\\3&1\\end{pmatrix}=2-2(-5)=12$이다. 따라서 $\\det(A^{-1})=1/\\det A=\\frac1{12}$이다.",
    },
  },
  {
    id: "q-2020-cau-19",
    rationale: "라플라스 변환형 이상적분 설명 보강",
    patch: {
      explanation:
        "$a>0$이면 주어진 적분은 $\\cos t$의 라플라스 변환을 $s=a$에서 계산한 값이다. 표준식 $\\mathcal L\\{\\cos t\\}(s)=\\dfrac{s}{s^2+1}$을 쓰면\n$\\displaystyle\\int_0^{\\infty}e^{-at}\\cos t\\,dt=\\frac{a}{a^2+1}$이다.",
    },
  },
  {
    id: "q-daily-eng-r20-3",
    rationale: "곡선 무게중심 계산 보강",
    patch: {
      explanation:
        "사분원을 $x=\cos\\theta$, $y=\sin\\theta$ $(0\\le\\theta\\le\\pi/2)$로 두면 $ds=d\\theta$이다. 전체 길이는 $m=\\int_0^{\\pi/2}ds=\\pi/2$이고, $x$에 대한 모멘트는 $\\int_0^{\\pi/2}\\cos\\theta\,d\\theta=1$이다. 따라서 $\\bar x=1/(\\pi/2)=2/\\pi$이다.",
    },
  },
  {
    id: "q-daily-eng-r26-4",
    rationale: "발산정리 부피적분 계산 보강",
    patch: {
      explanation:
        "$\\nabla\\cdot F=6x^2+6y^2=6r^2$이다. 닫힌 곡면에 발산정리를 적용하면\n$\\displaystyle\\iiint_E6r^2\,dV=\\int_0^{2\\pi}\\int_0^2\\int_0^{4-r^2}6r^3\,dzdrd\\theta=64\\pi$이다. 바닥 원판의 플럭스는 대칭으로 $0$이므로 구하는 값도 $64\\pi$이다.",
    },
  },
  {
    id: "q-daily-mv-r5-1",
    rationale: "이변수 극한 경로 의존 설명 보강",
    patch: {
      explanation:
        "$y=mx$로 접근하면\n$\\displaystyle f(x,mx)=\\frac{1-7m+m^2}{1+3m^2}$가 되어 $m$에 따라 값이 달라진다. 예를 들어 $m=0$이면 극한값이 $1$, $m=1$이면 $-5/4$이다. 경로마다 값이 다르므로 극한은 존재하지 않는다.",
    },
  },
  {
    id: "q-daily-mv-r8-3",
    rationale: "편미분 정의 계산 보강",
    patch: {
      explanation:
        "$y=0$으로 두면 $g(x,0)=\\dfrac{x^4}{x^2}=x^2$이다. 따라서 점 $(1,0)$에서의 $x$편미분은 이 일변수 함수의 미분값과 같아 $g_x(1,0)=\\left.\\dfrac{d}{dx}x^2\\right|_{x=1}=2$이다.",
    },
  },
  {
    id: "q-2023-kyunghee-24",
    rationale: "직교행렬 명제 판정 보강",
    patch: {
      explanation:
        "직교행렬은 $Q^TQ=I$이므로 길이를 보존하고, 역행렬 $Q^{-1}=Q^T$도 직교행렬이다. 또 고유값은 절댓값이 $1$이고 행벡터들도 정규직교집합이다. 하지만 행렬식은 항상 $1$이 아니라 $\\det Q=\\pm1$이므로 ㄴ이 거짓이다.",
    },
  },
  {
    id: "q-2023-sookmyung-02",
    rationale: "역삼각함수 극한 설명 보강",
    patch: {
      explanation:
        "분자와 분모를 $x^3$으로 나누면 안쪽 분수는\n$\\displaystyle\\frac{1-1/x+1/x^3}{1+x^{-3/2}-5/x^3}\\to1$이다. $\\sin^{-1}x$는 $[-1,1]$에서 연속이므로 극한은 $\\sin^{-1}(1)=\\frac\\pi2$이다.",
    },
  },
  {
    id: "q-daily-eng-r21-4",
    rationale: "벡터 선적분 매개화 보강",
    patch: {
      explanation:
        "$r(t)=(t,t^2,t^3)$이므로 $r'(t)=(1,2t,3t^2)$이다. 이때 $F(r(t))=(t^3,t^5,t^4)$이므로\n$F(r(t))\\cdot r'(t)=t^3+2t^6+3t^6=t^3+5t^6$이다. 따라서 적분값은 $\\int_0^1(t^3+5t^6)dt=\\frac14+\\frac57=\\frac{27}{28}$이다.",
    },
  },
  {
    id: "q-daily-eng-r24-2",
    rationale: "원판 그린 정리 계산 보강",
    patch: {
      explanation:
        "그린 정리에 의해 적분값은 $\\iint_D(Q_x-P_y)dA$이다. 여기서 $Q_x=9$, $P_y=5$이므로 integrand는 $4$이다. $D$는 반지름 $2$인 원판이므로 넓이가 $4\\pi$이고, 적분값은 $4\\cdot4\\pi=16\\pi$이다.",
    },
  },
  {
    id: "q-daily-la-r32-5",
    rationale: "함수 내적 직교 조건 계산 보강",
    patch: {
      explanation:
        "$\\langle1,x+\\alpha\\rangle=2\\alpha$이므로 $\\alpha=0$이다. 또 $\\langle1,x^2+\\beta x+\\gamma\\rangle=\\frac23+2\\gamma=0$에서 $\\gamma=-\\frac13$이다. 마지막으로 $\\langle x,x^2+\\beta x-\\frac13\\rangle=\\frac23\\beta=0$이므로 $\\beta=0$이다. 따라서 합은 $-\\frac13$이다.",
    },
  },
  {
    id: "q-2023-cau-21",
    rationale: "로그 멱급수 공식 보강",
    patch: {
      explanation:
        "$|x|<1$에서 $-\\ln(1-x)=\\sum_{n=1}^{\\infty}\\dfrac{x^n}{n}$이다. 따라서 $f(x)=-\\ln(1-x)$이고,\n$f\\left(\\frac12\\right)=-\\ln\\left(1-\\frac12\\right)=-\\ln\\frac12=\\ln2$이다.",
    },
  },
  {
    id: "q-daily-eng-r17-3",
    rationale: "조각함수 단위계단 표현 보강",
    patch: {
      explanation:
        "$f(t)$는 $t=1$에서 켜지고 $t=2$에서 꺼지는 함수이므로 $f(t)=u(t-1)-u(t-2)$이다. $\\mathcal L\\{u(t-a)\\}=e^{-as}/s$를 적용하면\n$\\mathcal L\\{f(t)\\}=\\dfrac{e^{-s}}{s}-\\dfrac{e^{-2s}}{s}$이다.",
    },
  },
  {
    id: "q-daily-eng-r21-2",
    rationale: "곡선 선적분 매개화 보강",
    patch: {
      explanation:
        "$x=t$, $y=\\sqrt t$ $(0\\le t\\le1)$로 두면 $dx=dt$, $dy=\\dfrac{1}{2\\sqrt t}dt$이다. 따라서\n$(x^2+y^2)dx-2xydy=(t^2+t)dt-2t\\sqrt t\\cdot\\dfrac{1}{2\\sqrt t}dt=t^2dt$이다. 적분값은 $\\int_0^1t^2dt=\\frac13$이다.",
    },
  },
  {
    id: "q-daily-eng-r18-4",
    rationale: "Volterra 방정식 라플라스 풀이 보강",
    patch: {
      explanation:
        "합성곱 항의 라플라스 변환은 $F(s)\\cdot\\dfrac{1}{s-1}$이다. 따라서\n$F(s)=\\dfrac4{s^3}-\\dfrac{F(s)}{s-1}$이고, 정리하면 $F(s)=\\dfrac{4(s-1)}{s^4}=\\dfrac4{s^3}-\\dfrac4{s^4}$이다. 역변환하면 $f(t)=2t^2-\\frac23t^3$이다.",
    },
  },
  {
    id: "q-daily-eng-r26-2",
    rationale: "사면체 발산정리 계산 보강",
    patch: {
      explanation:
        "$\\nabla\\cdot F=\\partial_x(-y^3)+\\partial_y(xz^2)+\\partial_z(3z)=3$이다. 주어진 사면체의 부피는 $\\frac16$이므로 발산정리에 의해\n$\\displaystyle\\iint_SF\\cdot dS=\\iiint_E3\,dV=3\\cdot\\frac16=\\frac12$이다.",
    },
  },
  {
    id: "q-daily-mv-r26-1",
    rationale: "점-원뿔 거리 최소화 계산 보강",
    patch: {
      explanation:
        "곡면에서 $z^2=x^2+y^2$이므로 거리제곱은\n$D^2=(x-1)^2+(y+2)^2+z^2=(x-1)^2+(y+2)^2+x^2+y^2$이다. 이를 $x,y$에 대해 최소화하면 $4x-2=0$, $4y+4=0$에서 $x=\\frac12$, $y=-1$이다. 이때 $D^2=\\frac52$이므로 최소거리는 $\\sqrt{5/2}=\\frac{\\sqrt{10}}2$이다.",
    },
  },
];

console.log(`${dryRun ? "Dry run" : "Applying"} ${fixes.length} additional explanation fixes.`);
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
    resolve(outDir, "question_quality_manual_fixes_20260709_batch4.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        dryRun: false,
        scope: "manual short explanation fixes batch 4",
        changes,
      },
      null,
      2,
    ),
  );
  console.log("Additional explanation fixes applied.");
} else {
  console.log("No rows were changed.");
}
