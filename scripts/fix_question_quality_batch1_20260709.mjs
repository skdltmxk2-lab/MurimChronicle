// Apply manually reviewed question-quality fixes.
//
// Usage:
//   node scripts/fix_question_quality_batch1_20260709.mjs --dry-run
//   node scripts/fix_question_quality_batch1_20260709.mjs
//
// Scope: confirmed student-facing quality issues from question_quality audit:
// draft/process wording, invalid official-answer carryovers, and explanations
// that explicitly contradicted the actual calculation.
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
    id: "q-2019-ewha-03",
    rationale: "문항 원문에 문제 오류 문구가 들어가 있었고, 실제 나머지는 2번이 맞음",
    patch: {
      question:
        "$2019^3+2018^3-1$을 $2019^2+2018^2$로 나누었을 때의 나머지를 구하시오.",
      explanation:
        "$x=2018$로 두면 나누는 수는 $(x+1)^2+x^2=2x^2+2x+1$이고, 나누어지는 수는 $(x+1)^3+x^3-1=2x^3+3x^2+3x$이다. 나머지를 $ax+b$라 하면 다항식 나눗셈으로 나머지는 $x(x+2)$이다. 따라서 $2018\\cdot2020=2019^2-1$이므로 정답은 ②이다.",
    },
  },
  {
    id: "q-2021-soongsil-19",
    rationale: "곡면 문항으로 저장되어 극값 문항 의미가 불명확해 함수 극값 문항으로 정리",
    patch: {
      question:
        "함수 $f(x,y)=x^3-y^3+3x^2+3y^2-9x$에 대해 올바른 것을 모두 고른 것은?\n\n(가) 임계점이 4개이다.\n(나) 극대점이 1개이다.\n(다) 안장점이 1개이다.\n(라) 극소점이 1개이다.",
      explanation:
        "$f_x=3x^2+6x-9=3(x+3)(x-1)$, $f_y=-3y^2+6y=-3y(y-2)$이므로 임계점은 $(-3,0),(-3,2),(1,0),(1,2)$ 네 개이다. 판별식은 $D=f_{xx}f_{yy}-f_{xy}^2=(6x+6)(-6y+6)$이다. $(-3,2)$는 극대, $(1,0)$은 극소, $(-3,0),(1,2)$는 안장점이므로 옳은 것은 (가), (나), (라)이다.",
    },
  },
  {
    id: "q-2019-dankook-34",
    rationale: "실제 수렴 조건 계산상 값이 0이라 보기와 정답 보정",
    patch: {
      options: [
        option("1", "$\\ln 2$"),
        option("2", "$\\ln 3$"),
        option("3", "$2\\ln 2$"),
        option("4", "$0$"),
      ],
      correct_option_id: "4",
      explanation:
        "무한대에서 $\\dfrac{1}{\\sqrt{x^2+4}}\\sim\\dfrac{1}{x}$, $\\dfrac{k}{x+2}\\sim\\dfrac{k}{x}$이므로 수렴하려면 $k=1$이어야 한다. 이때\n$\\displaystyle a=\\int_0^{\\infty}\\left(\\dfrac{1}{\\sqrt{x^2+4}}-\\dfrac{1}{x+2}\\right)dx$이고 원시함수는 $\\ln(x+\\sqrt{x^2+4})-\\ln(x+2)$이다. $x\\to\\infty$에서 값은 $0$, $x=0$에서도 $\\ln2-\\ln2=0$이므로 $a=0$. 따라서 $a\\times k=0$이다.",
    },
  },
  {
    id: "q-2019-dankook-41",
    rationale: "류갓티비 표현과 생략된 적분 계산 정리",
    patch: {
      explanation:
        "구면좌표에서 $\\rho=\\sqrt{x^2+y^2+z^2}$라 두면 피적분함수와 야코비안을 곱한 radial 부분은 $\\left(\\dfrac{2}{\\rho^2}-\\dfrac{2}{\\rho}\\right)\\rho^2=2-2\\rho$이다. 따라서\n$\\displaystyle I(a)=4\\pi\\int_0^a(2-2\\rho)d\\rho=4\\pi(2a-a^2)$.\n이 이차식은 $a=1$에서 최댓값을 가지며, 최댓값은 $4\\pi$이다.",
    },
  },
  {
    id: "q-2019-dankook-47",
    rationale: "검산 메모와 외부 출처 표현 제거",
    patch: {
      explanation:
        "$(2,4,-2)=av_1+bv_2+cv_3$라 두면\n$a+b+c=2$, $a+b=4$, $a=-2$이다. 따라서 $b=6$, $c=-2$이고\n$T(2,4,-2)=-2T(v_1)+6T(v_2)-2T(v_3)$이다.\n$=-2(1,0)+6(2,1)-2(4,3)=(2,0)$.",
    },
  },
  {
    id: "q-2019-sejong-18",
    rationale: "확인 필요 메모와 제곱완성 부호 표현 정리",
    patch: {
      explanation:
        "$v_1-v_2=w_2-w_1\\in V\\cap W$이다. 두 부분공간의 생성벡터를 행렬로 두고 연립하면 $V\\cap W=\\operatorname{span}\\{(0,1,0,0)\\}$이다. 따라서 $v_1-v_2=(0,t,0,0)$로 둘 수 있고\n$v_2=(3,2-t,1,3)$, $w_2=(3,3+t,3,0)$이다.\n내적은 $v_2\\cdot w_2=9+(2-t)(3+t)+3=18-t-t^2=-\\left(t+\\dfrac12\\right)^2+\\dfrac{73}{4}$이다. 최댓값은 $\\dfrac{73}{4}$이다.",
    },
  },
  {
    id: "q-2020-ajou-41",
    rationale: "비표준 표현 제거",
    patch: {
      explanation:
        "$\\dfrac{-x}{x^2+y^2}dy+\\dfrac{y}{x^2+y^2}dx=-\\dfrac{x\\,dy-y\\,dx}{x^2+y^2}$이다. $\\dfrac{x\\,dy-y\\,dx}{x^2+y^2}$는 편각 변화량 $d\\theta$와 같고, 타원 $C$는 원점을 한 번 반시계 방향으로 감싼다. 따라서 괄호 안 적분은 $-2\\pi$이고, 앞의 $\\dfrac12$를 곱하면 $-\\pi$이다.",
    },
  },
  {
    id: "q-2020-dankook-40",
    rationale: "중간 계산 끊김과 외부 출처 표현 제거",
    patch: {
      explanation:
        "$f_x=2y\\sin x$, $f_y=2y-2\\cos x$이므로 임계점에서는 $y=\\cos x$이고 $\\sin 2x=0$이다. 구간 $-\\dfrac54\\pi<x<\\dfrac54\\pi$에서 임계점은 $x=-\\pi,-\\dfrac\\pi2,0,\\dfrac\\pi2,\\pi$에 대응한다. $x=\\pm\\dfrac\\pi2$에서는 안장점이고, $x=-\\pi,0,\\pi$에서는 극값 $-1$을 갖는다. 모든 극값의 합은 $-1-1-1=-3$이다.",
    },
  },
  {
    id: "q-2020-dankook-44",
    rationale: "보존장 계산상 기존 보기에 정답이 없어 선지와 정답 보정",
    patch: {
      options: [
        option("1", "$9+2e^9$"),
        option("2", "$10+2e^9$"),
        option("3", "$11+2e^9$"),
        option("4", "$7e^{15}-2e^9-12$"),
      ],
      correct_option_id: "4",
      explanation:
        "$\\nabla\\times\\vec F=0$이므로 보존벡터장이다. 포텐셜은 $\\phi(x,y,z)=xy^2+ye^{3z}$로 둘 수 있다. 따라서 선적분은 경로와 무관하게\n$\\phi(0,7,5)-\\phi(3,2,3)=7e^{15}-(12+2e^9)=7e^{15}-2e^9-12$이다.",
    },
  },
  {
    id: "q-2020-konkuk-22",
    rationale: "극한 계산상 실제 정답이 기존 보기에 없어 선지와 정답 보정",
    patch: {
      options: [
        option("1", "$-1$"),
        option("2", "$0$"),
        option("3", "$\\dfrac{2}{1+e}$"),
        option("4", "$\\dfrac{1}{e}$"),
        option("5", "$\\dfrac{1}{1+e}$"),
      ],
      correct_option_id: "5",
      explanation:
        "$\\displaystyle\\lim_{x\\to0}\\dfrac{1}{x}\\int_x^{2x}g(t)dt$에서 적분구간의 길이는 $x$이므로 연속성에 의해 극한은 $g(0)$이다. 또 $g(x)=(f^{-1})'(x)$이므로\n$g(0)=\\dfrac{1}{f'(f^{-1}(0))}$. $f(1)=1+e-e-1=0$이므로 $f^{-1}(0)=1$, $f'(x)=1+e^x$에서 $f'(1)=1+e$이다. 따라서 극한값은 $\\dfrac{1}{1+e}$이다.",
    },
  },
  {
    id: "q-2021-skku-19",
    rationale: "확인 필요 메모 제거 및 보존장 포텐셜 설명 정리",
    patch: {
      explanation:
        "$M_y=4x^3=N_x$이므로 보존장이다. 포텐셜을 $\\Phi(x,y)=x^4y+H(x)+\\sin(y^2)$로 두면 $H'(x)=e^{x^2}$이다. 경로의 양 끝점은 $r(0)=(0,0)$, $r(1)=(0,1)$이므로 $H(x)$ 항과 $x^4y$ 항은 양 끝에서 모두 같다. 따라서\n$\\displaystyle\\int_C F\\cdot dr=\\Phi(0,1)-\\Phi(0,0)=\\sin1$이다.",
    },
  },
  {
    id: "q-2021am-dankook-34",
    rationale: "외부 출처 표현 제거",
    patch: {
      explanation:
        "ㄱ은 $x=3$에서 로그형으로 발산한다. ㄴ은 $\\int_1^{\\infty}x^{-1/2}dx$로 $p=1/2<1$이므로 발산한다. ㄷ은 무한대에서 $\\dfrac{2+e^{-x}}{x}\\sim\\dfrac2x$이므로 발산한다. ㄹ은 $x\\to\\pi/2^-$에서 $\\sec x\\to\\infty$이므로 발산한다. 수렴하는 적분은 0개이다.",
    },
  },
  {
    id: "q-2021pm-ajou-48",
    rationale: "비표준 표현 제거",
    patch: {
      explanation:
        "(1) $\\mathbf F_1$은 보존장이므로 폐곡선 적분이 $0$이다. (2) $\\partial_y(-y)=\\partial_x(-x)=-1$이므로 보존장이고 적분은 $0$이다. (3) $\\mathbf F_3=\\nabla\\left(\\frac12\\ln(x^2+y^2)\\right)$이며 $C_5$가 원점을 지나지 않으므로 적분은 $0$이다. (4)는 원점 중심 편각장인데 $C_5$는 원점을 둘러싸지 않으므로 적분은 $0$이다. (5)는 특이점이 $(2,2)$인 편각장이고, $(3,3)$과 $(2,2)$의 거리가 $\\sqrt2<r$이므로 $C_5$가 특이점을 한 번 감싸 적분값이 $2\\pi$이다. 따라서 값이 다른 것은 (5)이다.",
    },
  },
  {
    id: "q-2021pm-dankook-33",
    rationale: "외부 출처 표현 제거 및 면적 계산 보강",
    patch: {
      explanation:
        "교점은 $y=-x$와 $y=x^3$에서 $(0,0)$, $y=x+6$과 $y=x^3$에서 $(2,8)$, 두 직선에서 $(-3,3)$이다. 영역을 $x$구간 $[-3,0]$과 $[0,2]$로 나누면\n$S=\\displaystyle\\int_{-3}^{0}\\{(x+6)-(-x)\\}dx+\\int_0^2\\{(x+6)-x^3\\}dx=\\int_{-3}^{0}(2x+6)dx+\\int_0^2(x+6-x^3)dx=9+10=19$이다.",
    },
  },
  {
    id: "q-2021pm-dankook-46",
    rationale: "외부 출처 표현 제거 및 좌표 계산 보강",
    patch: {
      explanation:
        "$x^2-5x+2=a(x^2-x)+b(x-1)+c(x^2+1)$로 두면 $a+c=1$, $-a+b=-5$, $-b+c=2$이다. 풀면 $a=2$, $b=-3$, $c=-1$이다. 따라서\n$T(x^2-5x+2)=2(x-2)-3(x^2-x)-(x^2-1)=-4x^2+5x-3$이고, $\\alpha+\\beta+\\gamma=-4+5-3=-2$이다.",
    },
  },
  {
    id: "q-2022-konkuk-37",
    rationale: "비표준 표현 제거",
    patch: {
      explanation:
        "$M=-\\dfrac{y}{(x^2+y^2)^k}$, $N=\\dfrac{x}{(x^2+y^2)^k}$라 하면 닫힌곡선 적분이 항상 0이 되려면 $M_y=N_x$가 필요하다. 계산하면 이 조건은 $k=1$일 때 성립한다. $k=1$이면 벡터장은 원점 중심의 편각장이고, 곡선 $C$는 중심 $(2,0)$, 반지름 $1$인 원이므로 원점을 둘러싸지 않는다. 따라서 선적분은 $0$이고 $k=1$이다.",
    },
  },
  {
    id: "q-2022-kwangwoon-10",
    rationale: "계산 중단 메모와 외부 출처 표현 제거",
    patch: {
      explanation:
        "$\\cos2x=1-\\dfrac{(2x)^2}{2!}+\\dfrac{(2x)^4}{4!}-\\cdots+\\dfrac{(2x)^8}{8!}-\\dfrac{(2x)^{10}}{10!}+\\cdots$이다. $f(x)=(x^2+6x+9)\\cos2x$에서 $x^{10}$ 계수는\n$\\dfrac{2^8}{8!}-\\dfrac{9\\cdot2^{10}}{10!}$이다. 따라서\n$f^{(10)}(0)=10!\\left(\\dfrac{2^8}{8!}-\\dfrac{9\\cdot2^{10}}{10!}\\right)=90\\cdot2^8-9\\cdot2^{10}=2^9\\cdot3^3$이다.",
    },
  },
  {
    id: "q-2022-kwangwoon-16",
    rationale: "문항과 정답이 맞도록 로그 표기를 명확히 정리",
    patch: {
      question:
        "점 $(1,e)$에서 이변수 함수 $f(x,y)=x^3\\ln(y^2)$의 선형 근사 함수를 $L(x,y)$라고 할 때, $L(0.9,3)$의 값은?",
      explanation:
        "$f(x,y)=x^3\\ln(y^2)=2x^3\\ln y$로 해석한다. 따라서 $f(1,e)=2$, $f_x=6x^2\\ln y$, $f_y=\\dfrac{2x^3}{y}$이므로 $f_x(1,e)=6$, $f_y(1,e)=\\dfrac2e$이다. 선형근사는\n$L(x,y)=2+6(x-1)+\\dfrac2e(y-e)$이다. 그러므로\n$L(0.9,3)=2+6(-0.1)+\\dfrac2e(3-e)=\\dfrac6e-\\dfrac35$이다.",
    },
  },
  {
    id: "q-2022-kyunghee-18",
    rationale: "실제 미분방정식 계산상 기존 보기에 정답이 없어 선지와 정답 보정",
    patch: {
      options: [
        option("1", "$\\dfrac{\\pi}{4}$"),
        option("2", "$1+\\dfrac{\\pi}{3}$"),
        option("3", "$2+\\dfrac{\\pi}{2}$"),
        option("4", "$3+\\pi$"),
        option("5", "$2-\\dfrac{\\pi}{2}$"),
      ],
      correct_option_id: "5",
      explanation:
        "주어진 식은 $y'-\\dfrac{2x}{1+x^2}y=-1$이다. 적분인자는 $\\mu(x)=e^{\\int -2x/(1+x^2)dx}=\\dfrac{1}{1+x^2}$이므로\n$\\left(\\dfrac{y}{1+x^2}\\right)'=-\\dfrac{1}{1+x^2}$이다. 적분하면 $\\dfrac{y}{1+x^2}=-\\tan^{-1}x+C$이고 $y(0)=1$에서 $C=1$이다. 따라서 $y(1)=2\\left(1-\\dfrac{\\pi}{4}\\right)=2-\\dfrac{\\pi}{2}$이다.",
    },
  },
  {
    id: "q-2022am-dankook-46",
    rationale: "불필요한 메모 제거",
    patch: {
      explanation:
        "세 조건을 모두 더하면 $T(2,2,2)=(6,4)$이므로 선형성에 의해 $T(1,1,1)=(3,2)$이다. 표준행렬 $A$의 모든 성분의 합은 $A(1,1,1)^T=T(1,1,1)$의 두 성분 합과 같으므로 $3+2=5$이다.",
    },
  },
  {
    id: "q-2022am-dankook-50",
    rationale: "불필요한 메모 제거 및 행렬지수 풀이 정리",
    patch: {
      explanation:
        "$A=\\begin{pmatrix}1&2\\\\-1/2&1\\end{pmatrix}=I+B$, $B=\\begin{pmatrix}0&2\\\\-1/2&0\\end{pmatrix}$라 두면 $B^2=-I$이다. 따라서\n$e^{At}=e^t(\\cos t\\,I+\sin t\\,B)$이다. $t=\\pi/2$에서 $e^{A\\pi/2}=e^{\\pi/2}B$이므로\n$X(\\pi/2)=e^{\\pi/2}B\\binom11=e^{\\pi/2}\\binom{2}{-1/2}$이다.",
    },
  },
  {
    id: "q-2022pm-dankook-43",
    rationale: "측면 면적분 실제값이 0이라 선지와 해설 보정",
    patch: {
      options: [
        option("1", "$0$"),
        option("2", "$\\dfrac{4}{3}$"),
        option("3", "$\\dfrac{3}{2}$"),
        option("4", "$2$"),
      ],
      correct_option_id: "1",
      explanation:
        "$S$는 원기둥의 옆면이다. 옆면의 바깥쪽 법선벡터는 수평 방향 성분만 가지며, 벡터장 $\\vec F=(0,0,z)$는 수직 방향 성분만 가진다. 따라서 모든 점에서 $\\vec F\\cdot d\\vec S=0$이고\n$\\displaystyle\\iint_S\\vec F\\cdot d\\vec S=0$이다. 그러므로 $a=0$이다.",
    },
  },
  {
    id: "q-2023-gachon-a-15",
    rationale: "초기조건 계산 오류 정정",
    patch: {
      explanation:
        "우변이 다항식이므로 특수해를 $y_p=ax^2+bx+c$로 두면 $y_p''-2y_p'+y_p=x^2-x-3$에서 $y_p=x^2+3x+1$이다. 제차방정식은 $(r-1)^2=0$이므로 $y_h=(C_1+C_2x)e^x$이다.\n$y(0)=C_1+1=-2$에서 $C_1=-3$이고, $y'=((C_1+C_2)+C_2x)e^x+2x+3$이므로 $y'(0)=C_1+C_2+3=1$에서 $C_2=1$이다. 따라서\n$y(2)=(-3+2)e^2+4+6+1=11-e^2$이다.",
    },
  },
  {
    id: "q-2023-gachon-b-12",
    rationale: "극좌표 면적 계산상 실제 답은 4번이라 정답 보정",
    patch: {
      correct_option_id: "4",
      explanation:
        "두 곡선의 교점은 $3\\cos\\theta=\\sqrt3+\cos\\theta$에서 $\\cos\\theta=\\dfrac{\\sqrt3}{2}$, 즉 $\\theta=\\pm\\dfrac\\pi6$이다. 구하는 영역은 $-\\dfrac\\pi6\\le\\theta\\le\\dfrac\\pi6$에서 바깥반지름 $3\\cos\\theta$, 안쪽반지름 $\\sqrt3+\cos\\theta$ 사이의 영역이다.\n따라서\n$S=\\dfrac12\\int_{-\\pi/6}^{\\pi/6}\\{(3\\cos\\theta)^2-(\\sqrt3+\cos\\theta)^2\\}d\\theta$\n$=\\int_0^{\\pi/6}(8\\cos^2\\theta-3-2\\sqrt3\\cos\\theta)d\\theta=\\dfrac\\pi6$이다.",
    },
  },
  {
    id: "q-2023am-dankook-37",
    rationale: "중간 부호 메모 제거",
    patch: {
      explanation:
        "두 점을 지나는 직선의 방향벡터는 $(1,-11,-14)$이다. 직선을 $(x,y,z)=(2,4,-3)+t(1,-11,-14)$로 두면 $xy$평면과 만날 때 $z=0$이므로 $-3-14t=0$, 즉 $t=-\\dfrac{3}{14}$이다. 따라서\n$a=2-\\dfrac{3}{14}=\\dfrac{25}{14}$, $b=4+\\dfrac{33}{14}=\\dfrac{89}{14}$이고\n$4a-b=\\dfrac{100}{14}-\\dfrac{89}{14}=\\dfrac{11}{14}$이다.",
    },
  },
  {
    id: "q-2023am-dankook-42",
    rationale: "불필요한 메모 제거",
    patch: {
      explanation:
        "반구를 바닥 원판으로 닫아 발산정리를 적용한다. $\\nabla\\cdot\\vec F=1$이므로 닫힌 반구체 전체 flux는 $\\dfrac{2\\pi a^3}{3}$이다. 바닥 원판의 바깥쪽 법선은 $(0,0,-1)$이고, 그 flux는 $-\\iint_D x^2dA=-\\dfrac{\\pi a^4}{4}$이다. 따라서 위쪽 반구 $S$의 flux는\n$\\dfrac{2\\pi a^3}{3}+\\dfrac{\\pi a^4}{4}$이다. 이것이 $\\dfrac{a^2}{12}\\pi$와 같으므로 $3a^2+8a-1=0$이고, 양변을 $a$로 나누면 $\\dfrac1a-3a=8$이다.",
    },
  },
  {
    id: "q-2023pm-dankook-38",
    rationale: "검산 메모 제거",
    patch: {
      explanation:
        "$f_x=\sin(yz)$, $f_y=xz\\cos(yz)+\\dfrac{z}{1+(yz)^2}$, $f_z=xy\\cos(yz)+\\dfrac{y}{1+(yz)^2}$이다. $(1,3,0)$에서 $yz=0$이므로\n$\\nabla f(1,3,0)=(0,0,6)$이다. 방향벡터의 단위벡터는 $\\dfrac{1}{\\sqrt6}(1,2,-1)$이므로 방향도함수는\n$(0,0,6)\\cdot\\dfrac{(1,2,-1)}{\\sqrt6}=-\\sqrt6$이다.",
    },
  },
  {
    id: "q-2024-ajou-48",
    rationale: "비표준 표현 제거",
    patch: {
      explanation:
        "$\\mathbf F$를 $\\left(-\\dfrac{y}{x^2+y^2},\\dfrac{x}{x^2+y^2}\\right)$와 $(ye^{xy},xe^{xy})$로 나눈다. 두 번째 벡터장은 $\\nabla(e^{xy})$이므로 $P(-1,3)$과 $Q(-3,1)$에서 모두 $e^{-3}$이 되어 적분값이 $0$이다. 첫 번째 벡터장은 편각 변화량을 적분하므로\n$\\theta_Q-\theta_P=\\left(\\pi-\\tan^{-1}\\dfrac13\\right)-\\left(\\pi-\\tan^{-1}3\\right)=2\\tan^{-1}3-\\dfrac\\pi2$이다.",
    },
  },
  {
    id: "q-2024-hanyang-09",
    rationale: "정답과 맞도록 피봇 열 문항 표기 정정",
    patch: {
      question:
        "<보기>에서 옳은 것만을 있는 대로 고른 것은?\nㄱ. 벡터공간 $V$의 부분공간 $U_1,U_2,W_1,W_2$에 대해 $U_1\\le W_1,\\,U_2\\le W_2,\\,U_1\\oplus U_2=W_1\\oplus W_2$이면 $U_1=W_1,\\,U_2=W_2$이다.\nㄴ. 행렬 $A$와 $B=\\begin{pmatrix}1&2&0&3&5\\\\0&0&-4&2&7\\\\0&0&0&-1&0\\\\0&0&0&0&11\\end{pmatrix}$가 행동등(row equivalent)일 때, 행렬 $A$의 $1,3,4,5$열은 열공간의 기저를 이룬다.\nㄷ. 선형변환 $T:V\\to V$에 대해 $V=\\ker T\\oplus\\mathrm{Im}\\,T$이다.\nㄹ. $3\\times 3$ 행렬 $A$의 고윳값이 $1,2,3$이면, $A$는 가역행렬이고, $A$의 역행렬의 고윳값은 $1,\\dfrac{1}{2},\\dfrac{1}{3}$이다.",
      explanation:
        "ㄱ은 포함관계와 직접합의 차원 비교로 참이다. ㄴ은 주어진 행 사다리꼴 행렬의 피봇열이 $1,3,4,5$열이므로, 원래 행렬 $A$의 같은 열들이 열공간의 기저를 이룬다. ㄷ은 일반적으로 거짓이다. 예를 들어 멱영변환에서는 핵과 상이 직접합으로 전체 공간을 이루지 못할 수 있다. ㄹ은 고윳값이 모두 0이 아니므로 $A$는 가역이고, $A^{-1}$의 고윳값은 각 고윳값의 역수이다. 따라서 ㄱ, ㄴ, ㄹ이 옳다.",
    },
  },
  {
    id: "q-2024-hanyang-15",
    rationale: "실제 지수 계산값에 맞게 선지 보정",
    patch: {
      options: [
        option("1", "$4e^{7/3}-1$"),
        option("2", "$5e^{7/2}-2$"),
        option("3", "$6e^{7/3}-3$"),
        option("4", "$4e^{8/3}-1$"),
        option("5", "$5e^{8/3}-1$"),
      ],
      correct_option_id: "2",
      explanation:
        "$\\dfrac{dy}{dx}=4+6x+2y+3xy=(2+3x)(y+2)$이므로 분리하면\n$\\dfrac{dy}{y+2}=(2+3x)dx$이다. 적분하여 $\\ln|y+2|=2x+\\dfrac32x^2+C$이고, $y(0)=3$에서 $C=\\ln5$이다. 따라서\n$y+2=5e^{2x+3x^2/2}$, $y(1)=5e^{7/2}-2$이다.",
    },
  },
  {
    id: "q-2024-mju-25",
    rationale: "해설의 임시 말투 제거",
    patch: {
      explanation:
        "가장 깊은 곳의 물 깊이를 $h$라 하자. $0<h<1.5$에서는 경사 구간에서 수면의 길이가 $L=2h+3$이므로 수면 넓이는 $S=10(2h+3)$이다. 부피는\n$V=10\\int_0^h(2y+3)dy=10(h^2+3h)$이다. 따라서 $\\dfrac{dV}{dt}=10(2h+3)\\dfrac{dh}{dt}=1$이고, $h=1$에서 $\\dfrac{dh}{dt}=\\dfrac1{50}$이다. 그러므로 $\\dfrac{dS}{dt}=20\\dfrac{dh}{dt}=\\dfrac25$이다.",
    },
  },
  {
    id: "q-2025-dku-am-22",
    rationale: "Bernoulli 치환 부호 오류 정정",
    patch: {
      explanation:
        "$u=\\dfrac1y$로 두면 $u'=-\\dfrac{y'}{y^2}$이다. 주어진 식 $y'-xy^2+y=0$에서 $y'=xy^2-y$이므로\n$u'=-x+u$, 즉 $u'-u=-x$이다. 적분인자 $e^{-x}$를 곱하면 $(ue^{-x})'=-xe^{-x}$이고, 적분하여 $u=x+1+Ce^x$이다. $y(0)=1$이므로 $u(0)=1$에서 $C=0$이다. 따라서 $u=x+1$, $y=\\dfrac1{x+1}$이고 $x\\to-1^+$에서 $y\\to\\infty$이므로 $a=-1$이다.",
    },
  },
  {
    id: "q-2025-inha-26",
    rationale: "확인 필요 메모 제거 및 skew line 거리 공식 보강",
    patch: {
      explanation:
        "첫 직선의 한 점과 방향벡터는 $P_1=(2,-3,-1)$, $\\vec d_1=(1,-6,2)$이고, 둘째 직선은 $P_2=(3,-2,1)$, $\\vec d_2=(-1,9,-4)$이다. 두 직선 사이의 거리는\n$\\displaystyle\\frac{|(P_2-P_1)\\cdot(\\vec d_1\\times\\vec d_2)|}{|\\vec d_1\\times\\vec d_2|}$이다. $\\vec d_1\\times\\vec d_2=(6,2,3)$, $P_2-P_1=(1,1,2)$이므로 거리는 $\\dfrac{|6+2+6|}{\\sqrt{36+4+9}}=\\dfrac{14}{7}=2$이다.",
    },
  },
  {
    id: "q-2025-sogang-06",
    rationale: "검산 메모 제거",
    patch: {
      explanation:
        "$\\mathbf r(t)=(t^3,t^2,-2t)$이므로 $\\mathbf r'(t)=(3t^2,2t,-2)$이다. 경로 위에서\n$\\mathbf F(\\mathbf r(t))=(t^6-t^6,\\,t^2(-2t),\\,t^3-2t)=(0,-2t^3,t^3-2t)$이다. 따라서\n$\\mathbf F\\cdot\\mathbf r'=0\\cdot3t^2+(-2t^3)(2t)+(t^3-2t)(-2)=-4t^4-2t^3+4t$이고,\n$\\displaystyle\\int_0^1(-4t^4-2t^3+4t)dt=-\\dfrac45-\\dfrac12+2=\\dfrac7{10}$이다.",
    },
  },
  {
    id: "q-daily-int-r14-5",
    rationale: "치환적분 계산상 정답은 1번이라 정답 보정",
    patch: {
      correct_option_id: "1",
      explanation:
        "$t=\\sqrt{x}$로 치환하면 $x=t^2$, $dx=2t\\,dt$이고 적분은\n$\\displaystyle\\int_{2a}^{\\infty}\\frac{2}{t^2-a^2}dt$가 된다. 원시함수는 $\\dfrac1a\\ln\\left|\\dfrac{t-a}{t+a}\\right|$이므로\n$\\displaystyle\\int_{2a}^{\\infty}\\frac{2}{t^2-a^2}dt=0-\\dfrac1a\\ln\\dfrac{a}{3a}=\\dfrac{\ln3}{a}$이다. 이 값이 $1$이므로 $a=\ln3$이다.",
    },
  },
  {
    id: "q-ryu-self-warmup-r04-13",
    rationale: "불필요한 문구 제거",
    patch: {
      explanation:
        "적분영역은 $0\\le x\\le2$, $x\\le y\\le2$이므로 순서를 바꾸면 $0\\le y\\le2$, $0\\le x\\le y$이다. 따라서\n$\\displaystyle\\int_0^2\\int_x^2\\cos(y^2)dydx=\\int_0^2\\int_0^y\\cos(y^2)dxdy=\\int_0^2y\\cos(y^2)dy=\\dfrac12\\sin4$이다.",
    },
  },
];

const ids = fixes.map((fix) => fix.id);
const { data: rows, error: fetchError } = await sb
  .from("questions")
  .select("id, subject, unit, concept, question, options, correct_option_id, explanation")
  .in("id", ids);
if (fetchError) throw fetchError;

const rowsById = new Map((rows ?? []).map((row) => [row.id, row]));
const missingIds = ids.filter((id) => !rowsById.has(id));
if (missingIds.length) throw new Error(`Missing DB rows: ${missingIds.join(", ")}`);

const report = {
  generatedAt: new Date().toISOString(),
  dryRun,
  scope: "manual question quality fixes batch 1",
  changes: [],
};

console.log(`${dryRun ? "Dry run" : "Applying"} ${fixes.length} question quality fixes.`);
for (const fix of fixes) {
  const row = rowsById.get(fix.id);
  const patch = { ...fix.patch, updated_at: new Date().toISOString() };
  report.changes.push({
    id: fix.id,
    rationale: fix.rationale,
    subject: row.subject,
    unit: row.unit,
    concept: row.concept,
    fields: Object.keys(fix.patch),
  });
  console.log(`- ${fix.id}: ${fix.rationale}`);
  if (dryRun) continue;
  const { error: updateError } = await sb.from("questions").update(patch).eq("id", fix.id);
  if (updateError) throw updateError;
}

writeFileSync(
  resolve(outDir, "question_quality_manual_fixes_20260709_batch1.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log(dryRun ? "No rows were changed." : "Question quality fixes applied.");
