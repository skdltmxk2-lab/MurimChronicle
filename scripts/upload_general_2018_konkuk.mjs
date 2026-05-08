// Upload 2018년도 건국대 편입수학 기출 20문항 (21~40번, 5지선다)
// Usage: node scripts/upload_general_2018_konkuk.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const [k, ...r] = l.split("="); return [k.trim(), r.join("=").trim()]; })
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SCHOOL = "건국대";
const YEAR = "2018";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });

function svgToDataUrl(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}

function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation, questionImage }) {
  const id = `q-${YEAR}-konkuk-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return {
    id, subject, unit, concept, difficulty,
    source_type: "imported", question,
    content_type: questionImage ? "mixed" : "latex",
    question_image: questionImage ?? null,
    options, correct_option_id: String(answer), explanation,
    explanation_content_type: "latex", explanation_image: null, tags,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  };
}

// 38번: (-1,0)→(0,1)→(1,0) 꺾인 직선.
const PATH_SVG_38 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 200" width="240" height="200">
  <defs>
    <marker id="arr38" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#1f2937"/>
    </marker>
  </defs>
  <!-- 축 -->
  <line x1="20" y1="120" x2="220" y2="120" stroke="#1f2937" stroke-width="1.4" marker-end="url(#arr38)"/>
  <line x1="120" y1="180" x2="120" y2="20" stroke="#1f2937" stroke-width="1.4" marker-end="url(#arr38)"/>
  <text x="225" y="124" font-size="11" fill="#1f2937">x</text>
  <text x="125" y="20" font-size="11" fill="#1f2937">y</text>
  <!-- 꺾인 직선 (-1,0)→(0,1)→(1,0). 좌표 환산 (60,120)→(120,60)→(180,120) -->
  <polyline points="60,120 120,60 180,120" fill="none" stroke="#0ea5e9" stroke-width="2.4"/>
  <!-- 진행 화살표 -->
  <polygon points="88,84 96,80 92,92" fill="#0ea5e9"/>
  <polygon points="148,80 156,92 144,92" fill="#0ea5e9"/>
  <!-- 점 -->
  <circle cx="60" cy="120" r="3" fill="#0ea5e9"/>
  <circle cx="120" cy="60" r="3" fill="#0ea5e9"/>
  <circle cx="180" cy="120" r="3" fill="#0ea5e9"/>
  <!-- 라벨 -->
  <text x="38" y="138" font-size="10" fill="#1f2937">(-1,0)</text>
  <text x="124" y="56" font-size="10" fill="#1f2937">(0,1)</text>
  <text x="174" y="138" font-size="10" fill="#1f2937">(1,0)</text>
</svg>`;

// 39번: 마름모 (1,0),(0,1),(-1,0),(0,-1) 반시계 방향.
const RHOMBUS_SVG_39 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs>
    <marker id="arr39" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#1f2937"/>
    </marker>
  </defs>
  <line x1="20" y1="120" x2="220" y2="120" stroke="#1f2937" stroke-width="1.4" marker-end="url(#arr39)"/>
  <line x1="120" y1="220" x2="120" y2="20" stroke="#1f2937" stroke-width="1.4" marker-end="url(#arr39)"/>
  <text x="225" y="124" font-size="11" fill="#1f2937">x</text>
  <text x="125" y="20" font-size="11" fill="#1f2937">y</text>
  <!-- 마름모 -->
  <polygon points="180,120 120,60 60,120 120,180" fill="none" stroke="#0ea5e9" stroke-width="2.4"/>
  <!-- 진행 화살표 (반시계) -->
  <polygon points="148,84 156,90 144,96" fill="#0ea5e9"/>
  <polygon points="88,84 96,96 84,90" fill="#0ea5e9"/>
  <polygon points="92,148 84,156 96,144" fill="#0ea5e9"/>
  <polygon points="148,156 156,150 144,144" fill="#0ea5e9"/>
  <!-- 점 -->
  <circle cx="180" cy="120" r="3" fill="#0ea5e9"/>
  <circle cx="120" cy="60" r="3" fill="#0ea5e9"/>
  <circle cx="60" cy="120" r="3" fill="#0ea5e9"/>
  <circle cx="120" cy="180" r="3" fill="#0ea5e9"/>
  <text x="184" y="138" font-size="10" fill="#1f2937">(1,0)</text>
  <text x="124" y="56" font-size="10" fill="#1f2937">(0,1)</text>
  <text x="34" y="138" font-size="10" fill="#1f2937">(-1,0)</text>
  <text x="124" y="200" font-size="10" fill="#1f2937">(0,-1)</text>
</svg>`;

const problems = [
  build({
    num: 21, subject: "미분학", unit: "극한과 연속", concept: "구분 함수의 미분가능성", difficulty: "easyMedium",
    question: "다음과 같이 정의된 함수 $f(x)$가 모든 실수 $x$에 대하여 미분가능할 때 $a-b$의 값은? $f(x)=\\begin{cases} ax & x<1 \\\\ ax^2+bx+4 & x\\ge 1 \\end{cases}$",
    options: [o("1","$5$"), o("2","$6$"), o("3","$7$"), o("4","$8$"), o("5","$9$")],
    answer: 4,
    explanation: "$x=1$에서 (i) 연속: $a=a+b+4 \\Rightarrow b=-4$. (ii) 미분가능: 좌도함수 $a$, 우도함수 $2ax+b|_{x=1}=2a+b$. 같음: $a=2a+b=2a-4 \\Rightarrow a=4$. 따라서 $a-b=4-(-4)=8$."
  }),
  build({
    num: 22, subject: "미분학", unit: "도함수의 응용", concept: "역함수의 미분", difficulty: "easyMedium",
    question: "함수 $f(x)=3e^x+2x^3-2$의 역함수를 $g(x)$라 할 때 $g'(1)$의 값은?",
    options: [o("1","$\\dfrac{1}{3}$"), o("2","$\\dfrac{1}{2}$"), o("3","$1$"), o("4","$2$"), o("5","$3$")],
    answer: 1,
    explanation: "역함수 미분 공식: $g'(1)=\\dfrac{1}{f'(g(1))}$. $f(0)=3+0-2=1$이므로 $g(1)=0$. $f'(x)=3e^x+6x^2$, $f'(0)=3$. 따라서 $g'(1)=\\dfrac{1}{3}$."
  }),
  build({
    num: 23, subject: "적분학", unit: "급수의 수렴/발산", concept: "멱급수 수렴구간", difficulty: "medium",
    question: "멱급수 $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(3-2x)^{2n}}{\\sqrt{2n+1}}$의 수렴구간은?",
    options: [o("1","$(1,2)$"), o("2","$[1,2)$"), o("3","$(1,2]$"), o("4","$[1,2]$"), o("5","$(-\\infty,\\infty)$")],
    answer: 1,
    explanation: "$|(3-2x)^2|<1 \\Rightarrow |3-2x|<1 \\Rightarrow -1<2x-3<1 \\Rightarrow 1<x<2$. 끝점: $x=1$ 또는 $x=2$일 때 $(3-2x)^2=1$, 식 $\\sum\\dfrac{1}{\\sqrt{2n+1}}$이 되어 $p$급수 $p=\\tfrac{1}{2}<1$이라 발산. 따라서 수렴구간 $(1,2)$."
  }),
  build({
    num: 24, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "교대급수 합(자연로그)", difficulty: "medium",
    question: "급수 $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(-1)^n}{n+1}\\!\\left(\\dfrac{1}{2}\\right)^n$의 합은?",
    options: [o("1","$\\ln\\dfrac{3}{2}$"), o("2","$\\ln 2$"), o("3","$\\ln\\dfrac{9}{4}$"), o("4","$\\ln 3$"), o("5","$\\ln 4$")],
    answer: 3,
    explanation: "공식 $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{x^n}{n+1}=\\dfrac{-\\ln(1-x)}{x}$. 식 변형: $\\sum\\dfrac{(-1)^n}{n+1}\\!\\left(\\tfrac{1}{2}\\right)^n = \\sum\\dfrac{(-\\tfrac{1}{2})^n}{n+1} = \\dfrac{-\\ln(1-(-\\tfrac{1}{2}))}{-\\tfrac{1}{2}} = \\dfrac{-\\ln(\\tfrac{3}{2})}{-\\tfrac{1}{2}} = 2\\ln\\dfrac{3}{2}=\\ln\\dfrac{9}{4}$."
  }),
  build({
    num: 25, subject: "적분학", unit: "급수의 수렴/발산", concept: "수렴 비교판정", difficulty: "medium",
    question: "모든 항이 양수인 수열 $\\{n a_n\\}$이 $2$로 수렴하는 증가수열일 때 다음 급수 중 반드시 수렴하는 것을 모두 고르면? (a) $\\displaystyle\\sum_{n=1}^{\\infty} a_n$ (b) $\\displaystyle\\sum_{n=1}^{\\infty} a_n^2$ (c) $\\displaystyle\\sum_{n=1}^{\\infty}\\!\\left(\\dfrac{1}{2}\\right)^{a_n}$",
    options: [o("1","(a)"), o("2","(b)"), o("3","(c)"), o("4","(b),(c)"), o("5","(a),(b),(c)")],
    answer: 2,
    explanation: "$na_n=b_n\\to 2$이므로 $a_n=\\dfrac{b_n}{n}\\sim\\dfrac{2}{n}$, $a_n\\to 0$. (a) $\\sum a_n \\sim \\sum\\dfrac{2}{n}$ → 발산. (b) $\\sum a_n^2 \\sim \\sum\\dfrac{4}{n^2}$ → 수렴(p-급수 $p=2$). (c) $a_n\\to 0$이므로 $(\\tfrac{1}{2})^{a_n}\\to 1\\ne 0$ → 발산정리. 정답 (b)뿐."
  }),
  build({
    num: 26, subject: "선형대수", unit: "벡터공간", concept: "수선의 발(평면)", difficulty: "medium",
    question: "점 $(1,1,1)$에서 세 점 $(0,0,0),(1,0,1),(0,1,1)$을 포함하는 평면에 내린 수선의 발의 좌표는?",
    options: [
      o("1","$\\!\\left(\\dfrac{1}{6},\\dfrac{1}{6},\\dfrac{1}{3}\\right)$"),
      o("2","$\\!\\left(\\dfrac{1}{4},\\dfrac{1}{4},\\dfrac{1}{2}\\right)$"),
      o("3","$\\!\\left(\\dfrac{1}{2},\\dfrac{1}{2},1\\right)$"),
      o("4","$\\!\\left(\\dfrac{2}{3},\\dfrac{2}{3},\\dfrac{4}{3}\\right)$"),
      o("5","$(1,1,2)$")
    ],
    answer: 4,
    explanation: "평면의 법선벡터: $(1,0,1)\\times(0,1,1) = (-1,-1,1)$ → 약분 $(1,1,-1)$. 평면(원점 통과): $x+y-z=0$. 수선 직선: 점 $(1,1,1)$에서 방향 $(1,1,-1)$로 $x=1+t,y=1+t,z=1-t$. 평면 대입: $(1+t)+(1+t)-(1-t)=0 \\Rightarrow 1+3t=0 \\Rightarrow t=-\\dfrac{1}{3}$. 수선의 발: $(1-\\tfrac{1}{3},1-\\tfrac{1}{3},1+\\tfrac{1}{3})=(\\dfrac{2}{3},\\dfrac{2}{3},\\dfrac{4}{3})$."
  }),
  build({
    num: 27, subject: "적분학", unit: "정적분의 계산", concept: "삼각치환", difficulty: "medium",
    question: "정적분 $\\displaystyle\\int_{-2}^{-1}\\dfrac{x}{((x+2)^2+1)^2}dx$의 값은?",
    options: [o("1","$-\\dfrac{1}{4}(\\pi+1)$"), o("2","$-\\dfrac{\\pi}{2}+\\dfrac{1}{2}\\ln 2$"), o("3","$-\\dfrac{1}{2}(\\pi+1)$"), o("4","$-\\pi+\\ln 2$"), o("5","$-\\pi+1$")],
    answer: 1,
    explanation: "$x+2=\\tan\\theta$로 치환: $x=\\tan\\theta-2,\\ dx=\\sec^2\\theta\\,d\\theta$. $x=-2\\to\\theta=0$, $x=-1\\to\\theta=\\tfrac{\\pi}{4}$. 식 = $\\int_0^{\\pi/4}\\dfrac{\\tan\\theta-2}{\\sec^4\\theta}\\sec^2\\theta\\,d\\theta = \\int_0^{\\pi/4}\\cos^2\\theta(\\tan\\theta-2)d\\theta = \\int_0^{\\pi/4}(\\sin\\theta\\cos\\theta - 2\\cos^2\\theta)d\\theta$. 첫 항 $\\tfrac{1}{2}[\\sin^2\\theta]_0^{\\pi/4}=\\tfrac{1}{4}$. 둘째 항 $-\\int 1+\\cos 2\\theta\\,d\\theta = -[\\theta+\\tfrac{1}{2}\\sin 2\\theta]_0^{\\pi/4}=-(\\tfrac{\\pi}{4}+\\tfrac{1}{2})$. 합 = $\\tfrac{1}{4}-\\tfrac{\\pi}{4}-\\tfrac{1}{2}=-\\dfrac{\\pi+1}{4}$."
  }),
  build({
    num: 28, subject: "적분학", unit: "추가내용", concept: "극곡선 접선 기울기", difficulty: "medium",
    question: "극좌표로 $r=1+\\cos\\theta$로 표시되는 곡선이 있다. $\\theta=\\dfrac{\\pi}{6}$로 지정된 점에서 이 곡선의 접선의 기울기는?",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$-\\dfrac{1}{3}$"), o("4","$-\\dfrac{1}{2}$"), o("5","$-\\dfrac{\\sqrt 3}{2}$")],
    answer: 2,
    explanation: "$\\tan\\phi = \\dfrac{r}{r'}\\Big|$ 또는 직접: $\\dfrac{dy}{dx}=\\dfrac{r'\\sin\\theta + r\\cos\\theta}{r'\\cos\\theta - r\\sin\\theta}$. $r'=-\\sin\\theta$. $\\theta=\\tfrac{\\pi}{6}$: $r=1+\\tfrac{\\sqrt 3}{2}$, $r'=-\\tfrac{1}{2}$. 분자 $= -\\tfrac{1}{2}\\cdot\\tfrac{1}{2}+(1+\\tfrac{\\sqrt 3}{2})\\cdot\\tfrac{\\sqrt 3}{2}=-\\tfrac{1}{4}+\\tfrac{\\sqrt 3}{2}+\\tfrac{3}{4}=\\tfrac{1}{2}+\\tfrac{\\sqrt 3}{2}$. 분모 $=-\\tfrac{1}{2}\\cdot\\tfrac{\\sqrt 3}{2}-(1+\\tfrac{\\sqrt 3}{2})\\cdot\\tfrac{1}{2}=-\\tfrac{\\sqrt 3}{4}-\\tfrac{1}{2}-\\tfrac{\\sqrt 3}{4}=-\\tfrac{1}{2}-\\tfrac{\\sqrt 3}{2}$. 비율 = $-1$."
  }),
  build({
    num: 29, subject: "적분학", unit: "정적분의 계산", concept: "이상적분(부분분수)", difficulty: "medium",
    question: "이상적분 $\\displaystyle\\int_{e^2}^{\\infty}\\dfrac{1}{x((\\ln x)^2+\\ln x)}dx$의 값은?",
    options: [o("1","$1$"), o("2","$\\ln\\dfrac{3}{2}$"), o("3","$\\ln 2$"), o("4","$\\ln 3$"), o("5","$\\infty$")],
    answer: 2,
    explanation: "$\\ln x=t$로 치환, $\\dfrac{1}{x}dx=dt$. $x=e^2\\to t=2$, $x\\to\\infty\\to t\\to\\infty$. 식 = $\\int_2^{\\infty}\\dfrac{1}{t^2+t}dt = \\int_2^{\\infty}\\!\\left(\\dfrac{1}{t}-\\dfrac{1}{t+1}\\right)dt = [\\ln\\tfrac{t}{t+1}]_2^{\\infty} = \\ln 1 - \\ln\\tfrac{2}{3}=\\ln\\dfrac{3}{2}$."
  }),
  build({
    num: 30, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "고계도함수(가우시안)", difficulty: "mediumHard",
    question: "함수 $f(x)=\\displaystyle\\int_0^{x^2} e^{-t^2}dt$에 대해 $f^{(10)}(0)$의 값은?",
    options: [o("1","$-\\dfrac{9!}{2}$"), o("2","$-9!$"), o("3","$8!$"), o("4","$\\dfrac{8!}{2}$"), o("5","$9!$")],
    answer: 5,
    explanation: "$f'(x)=2x e^{-x^4}$. $e^{-x^4}=1-x^4+\\dfrac{x^8}{2!}-\\cdots$. $f'(x)=2x(1-x^4+\\tfrac{x^8}{2}-\\cdots)=2x-2x^5+x^9-\\cdots$. 적분: $f(x)=\\int f'\\,dx=x^2-\\tfrac{x^6}{3}+\\tfrac{x^{10}}{10}-\\cdots$. $x^{10}$의 계수 = $\\tfrac{1}{10}$. $f^{(10)}(0) = \\tfrac{1}{10}\\times 10! = 9!$."
  }),
  build({
    num: 31, subject: "선형대수", unit: "벡터공간", concept: "두 직선 거리합 = 정사각형", difficulty: "mediumHard",
    question: "좌표평면 위에 직선 $\\ell_1: x-y=0$과 $\\ell_2: x+y=0$이 있다. 직선 $\\ell_1$까지 거리와 직선 $\\ell_2$까지 거리의 합이 $4$인 점들이 그리는 곡선의 길이는?",
    options: [o("1","$8\\sqrt 2$"), o("2","$8\\sqrt 3$"), o("3","$16$"), o("4","$16\\sqrt 2$"), o("5","$32$")],
    answer: 4,
    explanation: "$\\ell_1$까지 거리 = $\\dfrac{|x-y|}{\\sqrt 2}$, $\\ell_2$까지 거리 = $\\dfrac{|x+y|}{\\sqrt 2}$. 합 $=4 \\Rightarrow |x-y|+|x+y|=4\\sqrt 2$. 사분면별 분석으로 정사각형 $\\max(|x|,|y|)=2\\sqrt 2$ 모양. 한 변의 길이 = $4\\sqrt 2$, 둘레 = $4\\cdot 4\\sqrt 2 = 16\\sqrt 2$."
  }),
  build({
    num: 32, subject: "다변수함수", unit: "편도함수", concept: "전미분(오차)", difficulty: "easy",
    question: "가로, 세로, 높이가 각각 $40\\,\\text{cm},\\ 40\\,\\text{cm},\\ 60\\,\\text{cm}$인 직육면체가 있다. 각 변의 길이를 최대 $0.1\\,\\text{cm}$의 오차 범위 내에서 측정하였을 때, 전미분을 이용하여 구한 직육면체 부피의 최대오차는?",
    options: [o("1","$580\\,\\text{cm}^3$"), o("2","$600\\,\\text{cm}^3$"), o("3","$620\\,\\text{cm}^3$"), o("4","$640\\,\\text{cm}^3$"), o("5","$680\\,\\text{cm}^3$")],
    answer: 4,
    explanation: "$V=xyz$. $dV=yz\\,dx+xz\\,dy+xy\\,dz$. $x=40,y=40,z=60$, $dx=dy=dz=0.1$. $dV = 40\\cdot 60\\cdot 0.1 + 40\\cdot 60\\cdot 0.1 + 40\\cdot 40\\cdot 0.1 = 240+240+160=640$."
  }),
  build({
    num: 33, subject: "다변수함수", unit: "중적분", concept: "적분 순서변경", difficulty: "medium",
    question: "미분가능한 함수 $f(x)$의 도함수 $f'(x)=\\displaystyle\\int_x^1 e^{t^2}dt$이다. $f(0)=0$일 때 $f(1)$의 값은?",
    options: [o("1","$e$"), o("2","$e-\\dfrac{1}{2}$"), o("3","$e-1$"), o("4","$\\dfrac{e-1}{2}$"), o("5","$\\dfrac{1}{2}e-1$")],
    answer: 4,
    explanation: "$f(1)-f(0)=\\int_0^1 f'(x)dx = \\int_0^1\\!\\int_x^1 e^{t^2}dt\\,dx$. 적분순서 변경: $0\\le x\\le 1,\\ x\\le t\\le 1$ → $0\\le t\\le 1,\\ 0\\le x\\le t$. = $\\int_0^1\\!\\int_0^t e^{t^2}dx\\,dt = \\int_0^1 t e^{t^2}dt = \\dfrac{1}{2}[e^{t^2}]_0^1 = \\dfrac{e-1}{2}$. $f(0)=0$이므로 $f(1)=\\dfrac{e-1}{2}$."
  }),
  build({
    num: 34, subject: "다변수함수", unit: "편도함수", concept: "동차함수 오일러 공식", difficulty: "mediumHard",
    question: "실수값을 갖는 미분가능한 이변수함수 $f$에 대하여 $w=e^{x^2}f\\!\\left(\\dfrac{y}{x},\\dfrac{z}{x}\\right)$라 하자. $x w_x + y w_y + z w_z$를 구하면?",
    options: [o("1","$e^{x^2} w$"), o("2","$x^2 w$"), o("3","$2x w$"), o("4","$2x^2 w$"), o("5","$2x e^{x^2} w$")],
    answer: 4,
    explanation: "$w=e^{x^2} f(u,v)$, $u=y/x,\\ v=z/x$. $w_x = 2x e^{x^2} f + e^{x^2}(f_u\\cdot(-y/x^2)+f_v\\cdot(-z/x^2))$. $w_y=e^{x^2}f_u\\cdot\\tfrac{1}{x}$, $w_z=e^{x^2}f_v\\cdot\\tfrac{1}{x}$. $xw_x+yw_y+zw_z = 2x^2 e^{x^2}f - e^{x^2}(\\tfrac{y}{x}f_u + \\tfrac{z}{x}f_v) + e^{x^2}\\tfrac{y}{x}f_u + e^{x^2}\\tfrac{z}{x}f_v = 2x^2 e^{x^2}f = 2x^2 w$."
  }),
  build({
    num: 35, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "산술-기하평균 최댓값", difficulty: "mediumHard",
    question: "원 $x^2+y^2=1$ 위에서 함수 $f(x,y)=9x^2 y$의 최댓값은?",
    options: [o("1","$\\sqrt 2$"), o("2","$\\sqrt 3$"), o("3","$2$"), o("4","$2\\sqrt 2$"), o("5","$2\\sqrt 3$")],
    answer: 5,
    explanation: "산술-기하평균: $\\dfrac{1}{2}x^2+\\dfrac{1}{2}x^2+y^2 \\ge 3\\!\\left(\\tfrac{1}{4}x^4 y^2\\right)^{1/3}$. 좌변 $=1$. 따라서 $\\dfrac{1}{3}\\ge\\!\\left(\\tfrac{x^4 y^2}{4}\\right)^{1/3} \\Rightarrow x^4 y^2\\le \\tfrac{4}{27} \\Rightarrow |x^2 y| \\le \\tfrac{2}{3\\sqrt 3}$. 양변에 9 곱: $|9x^2 y|\\le \\tfrac{18}{3\\sqrt 3}=\\tfrac{6}{\\sqrt 3}=2\\sqrt 3$. 최댓값 $2\\sqrt 3$."
  }),
  build({
    num: 36, subject: "다변수함수", unit: "편도함수", concept: "연쇄법칙(매개변수)", difficulty: "medium",
    question: "$x=r^2+s^2,\\ y=2rs$이고 $z=2x^2-xy+y^2-y$이라고 하자. $r=1,s=0$일 때 $\\dfrac{\\partial z}{\\partial s}$의 값은?",
    options: [o("1","$-4$"), o("2","$-2$"), o("3","$0$"), o("4","$2$"), o("5","$4$")],
    answer: 1,
    explanation: "$z_s = z_x\\cdot x_s + z_y\\cdot y_s = (4x-y)\\cdot 2s + (-x+2y-1)\\cdot 2r$. $r=1,s=0$일 때 $x=1,y=0$. $z_s = (4-0)\\cdot 0 + (-1+0-1)\\cdot 2 = 0 + (-2)\\cdot 2 = -4$."
  }),
  build({
    num: 37, subject: "다변수함수", unit: "선적분과 면적분", concept: "구면 면적분(스칼라)", difficulty: "mediumHard",
    question: "$\\Sigma$가 곡면 $x^2+y^2+z^2=1,\\ x\\ge 0,\\ y\\ge 0,\\ z\\ge\\sqrt{x^2+y^2}$일 때 면적분 $\\displaystyle\\iint_{\\Sigma} 24yz\\,dS$의 값은?",
    options: [o("1","$\\sqrt 2$"), o("2","$\\sqrt 3$"), o("3","$2\\sqrt 2$"), o("4","$2\\sqrt 3$"), o("5","$4$")],
    answer: 3,
    explanation: "구면 매개변수 $\\vec r(\\phi,\\theta)=(\\sin\\phi\\cos\\theta,\\sin\\phi\\sin\\theta,\\cos\\phi)$. $z\\ge\\sqrt{x^2+y^2}$는 $\\phi\\le\\tfrac{\\pi}{4}$. $x,y\\ge 0$은 $0\\le\\theta\\le\\tfrac{\\pi}{2}$. $|\\vec r_\\phi\\times\\vec r_\\theta|=\\sin\\phi$. $24yz = 24\\sin\\phi\\sin\\theta\\cos\\phi$. 적분 = $\\int_0^{\\pi/2}\\!\\int_0^{\\pi/4} 24\\sin\\phi\\sin\\theta\\cos\\phi\\cdot\\sin\\phi\\,d\\phi\\,d\\theta = 24\\int_0^{\\pi/2}\\sin\\theta\\,d\\theta\\cdot\\int_0^{\\pi/4}\\sin^2\\phi\\cos\\phi\\,d\\phi = 24\\cdot 1\\cdot\\dfrac{1}{3}\\cdot\\!\\left(\\tfrac{\\sqrt 2}{2}\\right)^3 = 24\\cdot\\dfrac{\\sqrt 2}{12} = 2\\sqrt 2$."
  }),
  build({
    num: 38, subject: "다변수함수", unit: "선적분과 면적분", concept: "보존장(완전미분)", difficulty: "medium",
    question: "좌표평면에서 곡선 $C$가 점 $(-1,0)$에서 시작하여 점 $(0,1)$을 거쳐 점 $(1,0)$으로 이어지는 꺾인 직선일 때, 선적분 $\\displaystyle\\int_C (1-y e^{-x})dx + e^{-x}dy$의 값을 구하면?",
    options: [o("1","$0$"), o("2","$e^{-1}$"), o("3","$1$"), o("4","$2$"), o("5","$e$")],
    answer: 4,
    explanation: "$M=1-y e^{-x},\\ N=e^{-x}$. $M_y=-e^{-x}=N_x$이므로 보존장. 母함수 $\\phi$: $\\phi_x=1-y e^{-x} \\Rightarrow \\phi=x+y e^{-x}+g(y)$. $\\phi_y=e^{-x}+g'(y)=e^{-x} \\Rightarrow g(y)=0$. 즉 $\\phi=x+y e^{-x}$. 적분 = $\\phi(1,0)-\\phi(-1,0) = (1+0)-(-1+0)=2$.",
    questionImage: svgToDataUrl(PATH_SVG_38)
  }),
  build({
    num: 39, subject: "다변수함수", unit: "선적분과 면적분", concept: "그린정리(면적)", difficulty: "easyMedium",
    question: "곡선 $C$는 좌표평면에서 점 $(1,0),(0,1),(-1,0),(0,-1)$을 꼭짓점으로 갖는 사각형이다. 선적분 $\\displaystyle\\oint_C -y\\,dx + x\\,dy$의 값은?",
    options: [o("1","$0$"), o("2","$-1$"), o("3","$2$"), o("4","$3$"), o("5","$4$")],
    answer: 5,
    explanation: "그린정리: $\\oint_C -y\\,dx+x\\,dy = 2\\cdot(\\text{영역 면적})$. 마름모 면적 = $\\dfrac{1}{2}\\times d_1\\times d_2 = \\dfrac{1}{2}\\times 2\\times 2 = 2$. 따라서 적분값 = $2\\times 2 = 4$.",
    questionImage: svgToDataUrl(RHOMBUS_SVG_39)
  }),
  build({
    num: 40, subject: "다변수함수", unit: "중적분", concept: "야코비안 변환", difficulty: "mediumHard",
    question: "영역 $R$이 좌표평면에서 점 $(0,0),(0,2),(-2,1),(-2,3)$을 꼭짓점으로 갖는 사각형이라 하자. 주어진 연속함수 $f(x,y)$에 대하여 적분 $\\displaystyle\\iint_R f(x,y)\\,dA$와 항상 같은 값을 갖는 것은?",
    options: [
      o("1","$\\displaystyle\\int_0^1\\!\\int_0^1 f(-2v,2u+v)\\,du\\,dv$"),
      o("2","$4\\displaystyle\\int_0^1\\!\\int_0^1 f(-2v,2u+v)\\,du\\,dv$"),
      o("3","$\\displaystyle\\int_0^1\\!\\int_0^{1/2} f(-2v,2u+v)\\,du\\,dv$"),
      o("4","$4\\displaystyle\\int_0^1\\!\\int_0^{1/2} f(-2v,2u+v)\\,du\\,dv$"),
      o("5","$4\\displaystyle\\int_0^{1/2}\\!\\int_0^1 f(-2v,2u+v)\\,du\\,dv$")
    ],
    answer: 2,
    explanation: "치환 $x=-2v,\\ y=2u+v$. 야코비안 $|J|=\\det\\!\\begin{pmatrix}0&-2\\\\2&1\\end{pmatrix}=|0-(-4)|=4$. 꼭짓점 변환: $(0,0)\\to(0,0)$, $(0,2)\\to(1,0)$, $(-2,1)\\to(0,1)$, $(-2,3)\\to(1,1)$. 새 영역은 $0\\le u\\le 1,\\ 0\\le v\\le 1$. 적분 = $\\int_0^1\\!\\int_0^1 f(-2v,2u+v)\\cdot 4\\,du\\,dv = 4\\int_0^1\\!\\int_0^1 f(-2v,2u+v)\\,du\\,dv$."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error(error); process.exit(1); }
console.log("Inserted:");
for (const r of data) console.log(`  - ${r.id}  [${r.subject}/${r.unit}/${r.difficulty}]`);
