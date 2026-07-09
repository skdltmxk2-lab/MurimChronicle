// Expand confirmed ultra-short explanations from the quality audit.
//
// Usage:
//   node scripts/fix_question_quality_batch3_20260709.mjs --dry-run
//   node scripts/fix_question_quality_batch3_20260709.mjs
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
const option = (id, text, label = id) => ({ id, text, image: "", label, contentType: "latex" });

const fixes = [
  {
    id: "q-daily-eng-r10-5",
    rationale: "멱급수 점화식 유도 보강",
    patch: {
      explanation:
        "$y=\\sum_{n=0}^{\\infty}a_nx^n$이면 $y''=\\sum_{n=0}^{\\infty}(n+2)(n+1)a_{n+2}x^n$이고 $xy=\\sum_{n=1}^{\\infty}a_{n-1}x^n$이다. $x^2$의 계수를 비교하면 $12a_4-a_1=0$이므로 $a_1/a_4=12$이다.",
    },
  },
  {
    id: "q-daily-eng-r15-4",
    rationale: "선형계 임계점 분류 근거 보강",
    patch: {
      explanation:
        "계수행렬은 $A=\\begin{pmatrix}2&1\\\\5&-2\\end{pmatrix}$이다. $\\operatorname{tr}A=0$, $\\det A=-9<0$이므로 고유값의 부호가 서로 다르다. 따라서 원점은 안장점이고, 안장점은 불안정하다.",
    },
  },
  {
    id: "q-daily-int-r15-2",
    rationale: "특이적분 발산 이유 보강",
    patch: {
      explanation:
        "$x=2$가 적분구간 내부의 특이점이므로 $\\int_1^2$와 $\\int_2^4$로 나누어 보아야 한다. 원시함수는 $-\\dfrac{1}{x-2}$이고, $x\\to2^+$ 또는 $x\\to2^-$에서 적분값이 무한대로 발산한다. 따라서 적분은 수렴하지 않는다.",
    },
  },
  {
    id: "q-2022-ewha-17",
    rationale: "함수열 명제 판정 이유 보강",
    patch: {
      explanation:
        "a는 평등수렴이면 각 점에서의 수렴이 자동으로 따르므로 참이다. b는 연속함수열의 평등수렴 극한이 연속이라는 정리로 참이다. c는 곱의 평등수렴에 유계 조건이 추가로 필요하므로 일반적으로 거짓이고, d도 급수의 곱에 대한 평등수렴이 자동으로 보장되지 않는다. 따라서 a, b만 옳다.",
    },
  },
  {
    id: "q-daily-la-r19-2",
    rationale: "부분공간 차원 계산 보강",
    patch: {
      explanation:
        "$M_3(\\mathbb R)$의 차원은 $9$이다. $U$는 대각합이 $0$이라는 독립인 선형조건 하나를 만족하므로 $\\dim U=8$이다. $W$는 대칭행렬 공간이므로 대각성분 3개와 위쪽 삼각성분 3개를 자유롭게 정해 $\\dim W=6$이다. 따라서 차원의 합은 $14$이다.",
    },
  },
  {
    id: "q-daily-la-r22-4",
    rationale: "행렬식 성질 설명 보강",
    patch: {
      explanation:
        "$A$의 행렬식은 고유값의 곱과 같으므로 $\\det A=1\\cdot2\\cdot3=6$이다. 전치해도 행렬식은 변하지 않아 $a=\\det(A^T)=6$이고, 역행렬의 행렬식은 역수이므로 $b=\\det(A^{-1})=1/6$이다. 따라서 $a/b=36$이다.",
    },
  },
  {
    id: "q-white-final-a-r05-2",
    rationale: "정답만 있던 삼중적분 해설 보강",
    patch: {
      explanation:
        "적분 영역은 $0\\le x\\le y\\le z\\le1$로 바꿀 수 있다. 먼저 $x$를 적분하면 길이가 $y$가 되어\n$\\displaystyle\\int_0^1\\int_0^z yz e^{-y^2}\\,dy\\,dz$가 된다. 다시 순서를 바꾸면 $\\displaystyle\\frac12\\int_0^1 y(1-y^2)e^{-y^2}dy$이고, $u=y^2$를 대입하면 $\\displaystyle\\frac14\\int_0^1(1-u)e^{-u}du=\\frac{1}{4e}$이다.",
    },
  },
  {
    id: "q-white-final-a-r06-14",
    rationale: "정답만 있던 선형사상 표현행렬 해설 보강",
    patch: {
      explanation:
        "공역 기저를 $c_1=(1,0,0),c_2=(1,1,0),c_3=(1,1,1)$라 하자. $T(1)=(0,1,0)=-c_1+c_2$, $T(x)=(1,1/2,0)=\\frac12c_1+\\frac12c_2$이다. 또한 $T(x^2)=(2,1/3,2)=\\frac53c_1-\\frac53c_2+2c_3$이다. 표현행렬의 첫 행 합은 $-1+\\frac12+\\frac53=\\frac76$이다.",
    },
  },
  {
    id: "q-white-final-a-r09-19",
    rationale: "정답만 있던 중적분 해설 보강",
    patch: {
      explanation:
        "$f(x,y)=\\max(y,\\sin\\sqrt{x})$이다. 두 번째 적분은 $0\\le y<\\sin\\sqrt{x}$인 부분에서 $f$의 값 $\\sin\\sqrt{x}$를 다시 $y$로 바꾸는 보정항이다. 따라서 전체 식은 직사각형 $0\\le x\\le2,0\\le y\\le9$에서 $y$를 적분한 값과 같아\n$\\displaystyle\\int_0^2\\int_0^9 y\\,dy\\,dx=2\\cdot\\frac{81}{2}=81$이다.",
    },
  },
  {
    id: "q-white-final-a-r13-12",
    rationale: "정답만 있던 평면 거리 해설 보강 및 보기 꼬리 문구 제거",
    patch: {
      options: [
        option("1", "$\\frac{11}{\\sqrt{30}}$"),
        option("2", "$\\frac{13}{\\sqrt{30}}$"),
        option("3", "$\\frac{15}{\\sqrt{30}}$"),
        option("4", "$\\frac{17}{\\sqrt{30}}$"),
        option("5", "$\\frac{19}{\\sqrt{30}}$"),
      ],
      explanation:
        "$\\Pi$가 $5x+2y+z=1$에 평행하므로 $\\Pi$의 법선벡터도 $(5,2,1)$이다. 직선 위의 점 $(1+t,2-t,4-3t)$를 $5x+2y+z$에 대입하면 $13$으로 일정하므로 $\\Pi:5x+2y+z=13$이다. 원점과 이 평면 사이의 거리는 $\\dfrac{|13|}{\\sqrt{5^2+2^2+1^2}}=\\dfrac{13}{\\sqrt{30}}$이다.",
    },
  },
  {
    id: "q-white-final-a-r14-26",
    rationale: "정답만 있던 고유분해 해설 보강",
    patch: {
      explanation:
        "모든 성분의 합은 $\\mathbf1^T(4A^{-1})\\mathbf1$로 계산할 수 있다. $\\mathbf1=(1,1,1)^T$를 주어진 고유벡터 기저로 나타내면 $\\mathbf1=-\\frac38v_1+\\frac18v_2+\\frac34v_3$이다. 따라서 $4A^{-1}\\mathbf1=-\\frac34v_1+\\frac14v_2+\\frac34v_3$이고, $v_1,v_2$의 성분합은 $0$, $v_3$의 성분합은 $4$이므로 전체 합은 $3$이다.",
    },
  },
  {
    id: "q-white-final-a-r14-6",
    rationale: "정답만 있던 변곡점 극한 해설 보강",
    patch: {
      explanation:
        "$f_n(x)=\\sin^{2n}x$에 대해 $f_n''(x)=2n\\sin^{2n-2}x\\{(2n-1)\\cos^2x-\\sin^2x\\}$이다. 변곡점에서는 $(2n-1)\\cos^2a_n=\\sin^2a_n$이므로 $\\sin^2a_n=1-\\frac1{2n}$이다. 따라서 $f_n(a_n)=\\left(1-\\frac1{2n}\\right)^n\\to e^{-1/2}$이다.",
    },
  },
  {
    id: "q-daily-mv-r31-3",
    rationale: "극좌표 적분 해설 보강",
    patch: {
      explanation:
        "적분 영역은 제1사분면 전체이므로 극좌표에서 $0\\le\\theta\\le\\frac\\pi2$, $0\\le r<\\infty$이다. 따라서\n$\\displaystyle\\int_0^{\\pi/2}\\int_0^{\\infty}\\frac{r}{(1+r^2)^2}drd\\theta=\\frac\\pi2\\cdot\\frac12=\\frac\\pi4$이다.",
    },
  },
  {
    id: "q-2025-inha-27",
    rationale: "Viviani 곡면 넓이 계산 보강",
    patch: {
      explanation:
        "구면 $x^2+y^2+z^2=4$를 $x=2\\sin\\phi\\cos\\theta$, $y=2\\sin\\phi\\sin\\theta$, $z=2\\cos\\phi$로 두면 면적요소는 $4\\sin\\phi$이다. 원기둥 조건 $(x-1)^2+y^2\\le1$은 $\\sin\\phi\\le\\cos\\theta$가 된다. 따라서\n$\\displaystyle S=\\int_{-\\pi/2}^{\\pi/2}\\int_0^{\\arcsin(\cos\\theta)}4\\sin\\phi\\,d\\phi d\\theta=4(\\pi-2)=4\\pi-8$이다.",
    },
  },
  {
    id: "q-daily-eng-r19-3",
    rationale: "보존벡터장 판정 근거 보강",
    patch: {
      explanation:
        "평면 벡터장 $(P,Q)$가 어떤 스칼라함수의 그래디언트가 되려면 단순영역에서 $P_y=Q_x$가 필요하다. ①은 $P=x-y$, $Q=x-2$이므로 $P_y=-1$, $Q_x=1$로 서로 다르다. 따라서 ①은 보존벡터장이 아니며 $\\nabla f$ 꼴로 쓸 수 없다.",
    },
  },
  {
    id: "q-daily-la-r34-5",
    rationale: "최소제곱 정규방정식 계산 보강",
    patch: {
      explanation:
        "최소제곱직선 $y=mx+b$에 대해 $\\sum x_i=10$, $\\sum y_i=18$, $\\sum x_i^2=30$, $\\sum x_iy_i=54$이다. 따라서\n$m=\\dfrac{4\\cdot54-10\\cdot18}{4\\cdot30-10^2}=\\dfrac95$, $b=\\dfrac{18-m\\cdot10}{4}=0$이다. 그러므로 $m+b=\\dfrac95$이다.",
    },
  },
  {
    id: "q-daily-eng-r24-5",
    rationale: "두 선분 선적분 계산 보강",
    patch: {
      explanation:
        "$(0,0)\\to(1,0)$에서는 $y=0$이므로 $\\int_0^1x^4dx=\\frac15$이다. $(1,0)\\to(0,1)$을 $x=1-t$, $y=t$로 두면 적분은 $\\int_0^1\\{-(1-t)^4+(1-t)t\\}dt=-\\frac1{30}$이다. 합하면 $\\frac15-\\frac1{30}=\\frac16$이다.",
    },
  },
  {
    id: "q-daily-r22-1",
    rationale: "표준 지수극한 계산 보강",
    patch: {
      explanation:
        "극한값을 $L$이라 두고 로그를 취하면\n$\\log L=\\displaystyle\\lim_{x\\to0}\\frac{\\log(1+\sin2x)}{x}$이다. $\\log(1+u)\\sim u$이고 $\\sin2x\\sim2x$이므로 $\\log L=2$이다. 따라서 $L=e^2$이다.",
    },
  },
  {
    id: "q-daily-eng-r23-3",
    rationale: "그린 정리 영역 적분 보강",
    patch: {
      explanation:
        "그린 정리를 쓰면 $Q_x-P_y=3-2y$이다. 영역은 $0\\le x\\le1$, $x^2\\le y\\le\\sqrt{x}$로 나타낼 수 있으므로\n$\\displaystyle\\iint_D(3-2y)dA=\\int_0^1\\int_{x^2}^{\\sqrt{x}}(3-2y)dydx=\\frac7{10}$이다.",
    },
  },
  {
    id: "q-daily-la-r17-5",
    rationale: "벡터공간 판정 근거 보강",
    patch: {
      explanation:
        "벡터공간이 되려면 영벡터를 포함하고 덧셈과 스칼라배에 닫혀 있어야 한다. ③은 조건 $v_3-v_4=1$ 때문에 영벡터 $(0,0,0,0)$를 포함하지 않는다. 따라서 부분공간, 즉 벡터공간이 아니며 나머지 보기들은 모두 동차 조건 또는 대칭성 조건으로 닫혀 있다.",
    },
  },
  {
    id: "q-daily-la-r20-5",
    rationale: "영공간 차원 계산 보강",
    patch: {
      explanation:
        "조건은 $x_1+2x_3=0$, $x_2-x_3=0$ 두 개의 독립인 선형방정식이다. $x_3=t$로 두면 $(x_1,x_2,x_3)=(-2t,t,t)=t(-2,1,1)$이므로 자유변수는 하나뿐이다. 따라서 $W$의 차원은 $1$이다.",
    },
  },
  {
    id: "q-daily-la-r6-3",
    rationale: "연립방정식 소거 과정 보강",
    patch: {
      explanation:
        "첫째 식에서 둘째 식의 2배를 빼면 $-8x_2-x_3=2$이다. 셋째 식에서 둘째 식의 3배를 빼면 $-8x_2-x_3-4x_4=-10$이다. 두 식을 빼면 $-4x_4=-12$가 되어 $x_4=3$이다.",
    },
  },
  {
    id: "q-daily-eng-r23-5",
    rationale: "삼각형 그린 정리 계산 보강",
    patch: {
      explanation:
        "그린 정리에 의해 $\\displaystyle\\int_C x^2y\\,dx+x\\,dy=\\iint_D(1-x^2)dA$이다. 삼각형은 $0\\le x\\le1$, $0\\le y\\le2x$로 둘 수 있으므로\n$\\displaystyle\\int_0^1\\int_0^{2x}(1-x^2)dydx=\\int_0^1 2x(1-x^2)dx=\\frac12$이다.",
    },
  },
  {
    id: "q-daily-eng-r16-6",
    rationale: "라플라스 부분분수 전개 보강",
    patch: {
      explanation:
        "$u=s+1$로 두면 $Y(s)=\\dfrac{3u+1}{u(u^2+1)}=\\dfrac1u+\\dfrac{-u+3}{u^2+1}$이다. 역변환하면\n$y(t)=e^{-t}-e^{-t}\\cos t+3e^{-t}\\sin t=e^{-t}-e^{-t}(\\cos t-3\\sin t)$이다.",
    },
  },
  {
    id: "q-2022-inha-07",
    rationale: "감마함수 치환 설명 보강",
    patch: {
      explanation:
        "$\\displaystyle\\int_0^{\\infty}\\frac{e^{-x}}{\\sqrt{x}}dx=\\int_0^{\\infty}x^{1/2-1}e^{-x}dx=\\Gamma\\left(\\frac12\\right)$이다. 감마함수의 표준값 $\\Gamma\\left(\\frac12\\right)=\\sqrt\\pi$를 이용하면 적분값은 $\\sqrt\\pi$이다.",
    },
  },
  {
    id: "q-2023-hongik-11",
    rationale: "잘못된 적분 보기 판정 보강",
    patch: {
      explanation:
        "(3)의 적분은 구간 내부의 $x=1$에서 $\\dfrac{1}{(x-1)^2}$가 발산하는 특이적분이다. 따라서 $\\int_0^3$을 보통 정적분처럼 계산할 수 없고, 좌우 극한 적분은 양의 무한대로 발산한다. 그러므로 유한값 $-\\dfrac32$라고 한 (3)이 잘못된 계산이다.",
    },
  },
  {
    id: "q-daily-eng-r15-6",
    rationale: "라플라스 역변환 부분분수 보강",
    patch: {
      explanation:
        "$s^2-s-6=(s-3)(s+2)$이고\n$\\dfrac{s}{(s-3)(s+2)}=\\dfrac{A}{s-3}+\\dfrac{B}{s+2}$라 두면 $A+B=1$, $2A-3B=0$이다. 따라서 $A=\\frac35$, $B=\\frac25$이고 역변환은 $\\frac35e^{3t}+\\frac25e^{-2t}$이다.",
    },
  },
  {
    id: "q-daily-eng-r22-3",
    rationale: "보존장 선적분 계산 보강",
    patch: {
      explanation:
        "$F=(ye^{xy},xe^{xy})$는 $f(x,y)=e^{xy}$의 그래디언트이다. 따라서 선적분은 경로와 무관하게 끝점의 포텐셜 차로 계산된다. $C$의 시작점은 $(1,0)$, 끝점은 $(-1,0)$이므로 값은 $f(-1,0)-f(1,0)=1-1=0$이다.",
    },
  },
];

console.log(`${dryRun ? "Dry run" : "Applying"} ${fixes.length} question explanation fixes.`);
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
    resolve(outDir, "question_quality_manual_fixes_20260709_batch3.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        dryRun: false,
        scope: "manual ultra-short explanation fixes batch 3",
        changes,
      },
      null,
      2,
    ),
  );
  console.log("Question explanation fixes applied.");
} else {
  console.log("No rows were changed.");
}
