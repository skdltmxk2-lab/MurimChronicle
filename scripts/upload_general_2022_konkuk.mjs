// Upload 2022년도 건국대 편입수학 기출 20문항 (21~40번, 5지선다)
// Usage: node scripts/upload_general_2022_konkuk.mjs
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
const YEAR = "2022";
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

// 34번: 직육면체 ABCDEFGH. AB=1, AD=1, AE=2.
// A,B,C,D 밑면 / E,F,G,H 윗면. 평면 BDG로 잘랐을 때 점 C, E의 평면까지의 수선의 발 X, Y.
const RECT_PRISM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 280" width="320" height="280">
  <!-- 윗면 EFGH (E=upper of A, F=upper of B, G=upper of C, H=upper of D) -->
  <!-- 좌표: A(70,200), B(200,200), C(240,160), D(110,160) / 윗면은 위로 100 -->
  <!-- 밑면 -->
  <polygon points="70,200 200,200 240,160 110,160" fill="none" stroke="#1f2937" stroke-width="1.5"/>
  <!-- 윗면 -->
  <polygon points="70,100 200,100 240,60 110,60" fill="none" stroke="#1f2937" stroke-width="1.5"/>
  <!-- 수직 모서리 -->
  <line x1="70" y1="200" x2="70" y2="100" stroke="#1f2937" stroke-width="1.5"/>
  <line x1="200" y1="200" x2="200" y2="100" stroke="#1f2937" stroke-width="1.5"/>
  <line x1="240" y1="160" x2="240" y2="60" stroke="#1f2937" stroke-width="1.5"/>
  <line x1="110" y1="160" x2="110" y2="60" stroke="#1f2937" stroke-width="1.5" stroke-dasharray="4,3"/>
  <!-- 뒤쪽 모서리 (점선) -->
  <line x1="110" y1="160" x2="240" y2="160" stroke="#1f2937" stroke-width="1.5" stroke-dasharray="4,3"/>
  <!-- 라벨 -->
  <text x="56" y="216" font-size="13" font-weight="bold" fill="#1f2937">A</text>
  <text x="200" y="216" font-size="13" font-weight="bold" fill="#1f2937">B</text>
  <text x="244" y="156" font-size="13" font-weight="bold" fill="#1f2937">C</text>
  <text x="92" y="156" font-size="13" font-weight="bold" fill="#1f2937">D</text>
  <text x="56" y="96" font-size="13" font-weight="bold" fill="#1f2937">E</text>
  <text x="204" y="96" font-size="13" font-weight="bold" fill="#1f2937">F</text>
  <text x="244" y="56" font-size="13" font-weight="bold" fill="#1f2937">G</text>
  <text x="92" y="56" font-size="13" font-weight="bold" fill="#1f2937">H</text>
</svg>`;

// 35번: 직사각형 위에 반원이 올려진 도형 (Norman window). 가로 a, 세로 b, 반원 반지름 a/2.
const NORMAN_WINDOW_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 220" width="240" height="220">
  <!-- 직사각형 -->
  <rect x="60" y="100" width="120" height="80" fill="none" stroke="#1f2937" stroke-width="1.6"/>
  <!-- 반원 (중심 (120,100), 반지름 60) -->
  <path d="M 60 100 A 60 60 0 0 1 180 100" fill="none" stroke="#1f2937" stroke-width="1.6"/>
  <!-- 라벨 -->
  <text x="115" y="200" font-size="14" font-weight="bold" fill="#1f2937">a</text>
  <text x="190" y="146" font-size="14" font-weight="bold" fill="#1f2937">b</text>
</svg>`;

const problems = [
  build({
    num: 21, subject: "미분학", unit: "도함수의 응용", concept: "임계점과 최댓값", difficulty: "medium",
    question: "좌표평면의 원점에서 두 점 $A$와 $B$가 출발하여 각각 $x$축과 $y$축을 따라 움직인다. $t$초 후의 두 점 $A,B$의 위치가 각각 $(10t-t^2,0)$과 $(0,6t-t^2)$이다. $0\\le t\\le 7$인 범위에서 두 점 사이의 거리가 최대가 되는 $t$의 값은?",
    options: [o("1","$5-\\sqrt 3$"), o("2","$5-\\sqrt 2$"), o("3","$6-\\sqrt 3$"), o("4","$6-\\sqrt 2$"), o("5","$7$")],
    answer: 4,
    explanation: "두 점 사이 거리의 제곱 $f(t)=(10t-t^2)^2+(6t-t^2)^2$로 두면 거리의 최대 = $f$의 최대. $f'(t)=2(10t-t^2)(10-2t)+2(6t-t^2)(6-2t) = 8t(t^2-12t+34)$. $f'(t)=0$의 해: $t=0$ 또는 $t^2-12t+34=0 \\Rightarrow t=6\\pm\\sqrt 2$. 구간 $[0,7]$에 들어가는 임계점은 $t=6-\\sqrt 2$. 양 끝값과 비교하면 이 점에서 극대(최대)."
  }),
  build({
    num: 22, subject: "미분학", unit: "도함수의 응용", concept: "로그미분(접선의 기울기)", difficulty: "easyMedium",
    question: "곡선 $y=(2x+1)^x$ 위의 점 $(1,3)$에서의 접선의 기울기는?",
    options: [o("1","$3\\ln 3-2$"), o("2","$3\\ln 3-1$"), o("3","$3\\ln 3$"), o("4","$3\\ln 3+1$"), o("5","$3\\ln 3+2$")],
    answer: 5,
    explanation: "$y=(2x+1)^x = e^{x\\ln(2x+1)}$. 미분: $y' = e^{x\\ln(2x+1)}\\cdot\\left(\\ln(2x+1)+\\dfrac{2x}{2x+1}\\right)$. $x=1$ 대입: $e^{\\ln 3}=3$, 괄호 안 = $\\ln 3 + \\dfrac{2}{3}$. 따라서 $y'(1)=3\\left(\\ln 3+\\dfrac{2}{3}\\right)=3\\ln 3 + 2$."
  }),
  build({
    num: 23, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피(셸 메서드)", difficulty: "medium",
    question: "곡선 $y=\\dfrac{\\ln x}{x}\\ (x>0)$와 직선 $x=e$, 직선 $y=0$으로 둘러싸인 영역을 직선 $x=-3$을 축으로 회전하여 만들어진 입체의 부피는?",
    options: [o("1","$4\\pi-e$"), o("2","$4\\pi$"), o("3","$4\\pi+e$"), o("4","$5\\pi$"), o("5","$5\\pi+e$")],
    answer: 4,
    explanation: "원주각법(셸 메서드, 회전축 $x=-3$): $V=2\\pi\\int_1^e (x-(-3))\\cdot\\dfrac{\\ln x}{x}dx = 2\\pi\\int_1^e \\dfrac{(x+3)\\ln x}{x}dx = 2\\pi\\int_1^e \\ln x + \\dfrac{3\\ln x}{x}dx$. 첫 적분 $\\int_1^e \\ln x\\,dx = [x\\ln x-x]_1^e = 1$. 둘째 $3\\int_1^e \\dfrac{\\ln x}{x}dx = 3\\cdot\\dfrac{(\\ln e)^2}{2}=\\dfrac{3}{2}$. 합 = $\\dfrac{5}{2}$. $V=2\\pi\\cdot\\dfrac{5}{2}=5\\pi$."
  }),
  build({
    num: 24, subject: "다변수함수", unit: "추가내용", concept: "파푸스 정리(회전체)", difficulty: "mediumHard",
    question: "직선 $y=x$와 포물선 $y=x^2$에 의하여 둘러싸인 영역을 직선 $y=x$를 축으로 회전하여 만들어진 입체의 부피는?",
    options: [o("1","$\\dfrac{1}{90}\\pi$"), o("2","$\\dfrac{\\sqrt 2}{90}\\pi$"), o("3","$\\dfrac{\\sqrt 2}{60}\\pi$"), o("4","$\\dfrac{1}{30}\\pi$"), o("5","$\\dfrac{\\sqrt 2}{30}\\pi$")],
    answer: 3,
    explanation: "파푸스 정리: $V=(\\text{영역 넓이})\\times(\\text{중심의 이동거리})$. (1) 영역 넓이 $\\int_0^1(x-x^2)dx=\\dfrac{1}{6}$. (2) 무게중심 $(\\bar x,\\bar y)=(\\tfrac{1}{2},\\tfrac{2}{5})$. (3) 직선 $y=x$와 중심 사이 거리 $d=\\dfrac{|1/2-2/5|}{\\sqrt 2}=\\dfrac{\\sqrt 2}{20}$. (4) 회전 시 중심이 그리는 원둘레 $= 2\\pi d$. 따라서 $V=\\dfrac{1}{6}\\cdot 2\\pi\\cdot\\dfrac{\\sqrt 2}{20}=\\dfrac{\\sqrt 2}{60}\\pi$."
  }),
  build({
    num: 25, subject: "다변수함수", unit: "추가내용", concept: "곡선 속력(코사인 합)", difficulty: "medium",
    question: "위치벡터가 $\\vec r(t)=(2\\cos t+\\cos(10t),\\ 2\\sin t+\\sin(10t))$인 물체의 속력이 최소가 되는 $t$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{9}$"), o("2","$\\dfrac{\\pi}{8}$"), o("3","$\\dfrac{\\pi}{7}$"), o("4","$\\dfrac{\\pi}{6}$"), o("5","$\\dfrac{\\pi}{5}$")],
    answer: 1,
    explanation: "$\\vec r'(t)=(-2\\sin t-10\\sin(10t),\\ 2\\cos t+10\\cos(10t))$. 속력의 제곱: $|\\vec r'|^2 = (2\\sin t+10\\sin 10t)^2 + (2\\cos t+10\\cos 10t)^2 = 4+100+40(\\cos t\\cos 10t + \\sin t\\sin 10t) = 104+40\\cos(10t-t)=104+40\\cos 9t$. 최솟값은 $\\cos 9t=-1$, 즉 $9t=\\pi \\Rightarrow t=\\dfrac{\\pi}{9}$."
  }),
  build({
    num: 26, subject: "적분학", unit: "추가내용", concept: "극곡선 영역 차", difficulty: "medium",
    question: "극곡선 $r=\\sqrt{2\\cos\\theta+3}$의 외부 영역과 원 $r=2$의 내부 영역의 공통부분의 넓이는?",
    options: [o("1","$\\dfrac{2}{3}\\pi-\\sqrt 3$"), o("2","$\\dfrac{4}{3}\\pi-\\sqrt 3$"), o("3","$\\dfrac{2}{3}\\pi+\\sqrt 3$"), o("4","$\\dfrac{4}{3}\\pi+\\sqrt 3$"), o("5","$6\\pi$")],
    answer: 3,
    explanation: "$r^2=2\\cos\\theta+3$과 $r=2$ ($r^2=4$)의 교점: $2\\cos\\theta+3=4 \\Rightarrow \\cos\\theta=\\tfrac{1}{2} \\Rightarrow \\theta=\\pm\\tfrac{\\pi}{3}$. $\\theta\\in[\\tfrac{\\pi}{3},\\tfrac{5\\pi}{3}]$에서 원이 곡선 외부. 대칭으로 $\\theta\\in[\\tfrac{\\pi}{3},\\pi]$ 적분 후 2배: $S=2\\cdot\\tfrac{1}{2}\\int_{\\pi/3}^{\\pi}(4-(2\\cos\\theta+3))d\\theta = \\int_{\\pi/3}^{\\pi}(1-2\\cos\\theta)d\\theta = [\\theta-2\\sin\\theta]_{\\pi/3}^{\\pi} = \\pi - (\\tfrac{\\pi}{3}-\\sqrt 3) = \\dfrac{2\\pi}{3}+\\sqrt 3$."
  }),
  build({
    num: 27, subject: "미분학", unit: "도함수의 응용", concept: "매개변수 이계도함수", difficulty: "mediumHard",
    question: "다음 매개곡선에 대하여 $t=\\dfrac{\\pi}{3}$에서 $\\dfrac{d^2y}{dx^2}$의 값은?\\\\ $\\begin{cases} x = t-3\\sin t \\\\ y = 3-2\\cos t \\end{cases}$",
    options: [o("1","$-15\\sqrt 3-26$"), o("2","$-40$"), o("3","$0$"), o("4","$40$"), o("5","$15\\sqrt 3-26$")],
    answer: 4,
    explanation: "1계: $\\dfrac{dx}{dt}=1-3\\cos t,\\ \\dfrac{dy}{dt}=2\\sin t \\Rightarrow \\dfrac{dy}{dx}=\\dfrac{2\\sin t}{1-3\\cos t}$. 2계: $\\dfrac{d^2y}{dx^2}=\\dfrac{d}{dt}\\!\\left(\\dfrac{dy}{dx}\\right)\\cdot\\dfrac{1}{dx/dt}$. $\\dfrac{d}{dt}\\!\\left(\\dfrac{2\\sin t}{1-3\\cos t}\\right) = \\dfrac{2\\cos t(1-3\\cos t)-2\\sin t(3\\sin t)}{(1-3\\cos t)^2}=\\dfrac{2\\cos t-6}{(1-3\\cos t)^2}$. 따라서 $\\dfrac{d^2y}{dx^2}=\\dfrac{2\\cos t-6}{(1-3\\cos t)^3}$. $t=\\tfrac{\\pi}{3}$ 대입: $\\cos t=\\tfrac{1}{2}$, 분자 $=2\\cdot\\tfrac{1}{2}-6=-5$, 분모 $=(1-\\tfrac{3}{2})^3=-\\tfrac{1}{8}$. 결과 $\\dfrac{-5}{-1/8}=40$."
  }),
  build({
    num: 28, subject: "적분학", unit: "급수의 수렴/발산", concept: "수렴판정 비교", difficulty: "medium",
    question: "다음 급수 중 수렴하는 것을 모두 고르면?\\\\ (a) $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{\\ln n}{n}$\\quad (b) $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{1}{n}\\sin\\!\\left(\\dfrac{1}{n}\\right)$\\quad (c) $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{1}{n}\\sin\\!\\left(\\arctan\\dfrac{1}{n}\\right)$",
    options: [o("1","(a)"), o("2","(b)"), o("3","(a),(b)"), o("4","(a),(c)"), o("5","(b),(c)")],
    answer: 5,
    explanation: "(a) $\\dfrac{\\ln n}{n} \\ge \\dfrac{1}{n}$ ($n\\ge 3$)이거나 적분판정법으로 $\\int \\dfrac{\\ln x}{x}dx=\\dfrac{(\\ln x)^2}{2}\\to\\infty$ → 발산. (b) $\\sin\\tfrac{1}{n}\\sim\\tfrac{1}{n}$이므로 일반항 $\\sim \\tfrac{1}{n^2}$ → 극한비교 $\\sum\\tfrac{1}{n^2}$과 비교, 수렴. (c) $\\sin(\\arctan\\tfrac{1}{n})\\sim\\arctan\\tfrac{1}{n}\\sim\\tfrac{1}{n}$이므로 일반항 $\\sim\\tfrac{1}{n^2}$ → 수렴. 정답 (b),(c)."
  }),
  build({
    num: 29, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "코사인 하이퍼볼릭 급수", difficulty: "medium",
    question: "급수 $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{3^n}{4^n(2n)!}$의 합은?",
    options: [
      o("1","$\\cos\\!\\left(\\dfrac{\\sqrt 3}{2}\\right)$"),
      o("2","$\\sin\\!\\left(\\dfrac{\\sqrt 3}{2}\\right)$"),
      o("3","$\\dfrac{e^{\\sqrt 3/2}-e^{-\\sqrt 3/2}}{4}$"),
      o("4","$\\dfrac{e^{\\sqrt 3/2}+e^{-\\sqrt 3/2}}{4}$"),
      o("5","$\\dfrac{e^{\\sqrt 3/2}+e^{-\\sqrt 3/2}}{2}$")
    ],
    answer: 5,
    explanation: "$\\dfrac{3^n}{4^n}=\\left(\\dfrac{\\sqrt 3}{2}\\right)^{2n}$. 따라서 $\\sum_{n=0}^{\\infty}\\dfrac{(\\sqrt 3/2)^{2n}}{(2n)!}$. 이는 $\\cosh x = \\sum_{n=0}^{\\infty}\\dfrac{x^{2n}}{(2n)!} = \\dfrac{e^x+e^{-x}}{2}$의 $x=\\dfrac{\\sqrt 3}{2}$ 대입. 따라서 합 = $\\dfrac{e^{\\sqrt 3/2}+e^{-\\sqrt 3/2}}{2}$."
  }),
  build({
    num: 30, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "고계 도함수(이항급수)", difficulty: "medium",
    question: "$f(x)=2x^2\\sqrt{3+x^2}$일 때 $f^{(6)}(0)$의 값은?",
    options: [o("1","$-20\\sqrt 3$"), o("2","$-15\\sqrt 3$"), o("3","$5\\sqrt 3$"), o("4","$15\\sqrt 3$"), o("5","$20\\sqrt 3$")],
    answer: 1,
    explanation: "$\\sqrt{3+x^2}=\\sqrt 3(1+\\tfrac{x^2}{3})^{1/2}$. 이항급수 전개: $\\sqrt 3\\!\\left(1+\\tfrac{1}{2}\\cdot\\tfrac{x^2}{3}+\\tfrac{1}{2!}\\cdot\\tfrac{1}{2}(-\\tfrac{1}{2})\\!\\left(\\tfrac{x^2}{3}\\right)^2+\\cdots\\right)$. $x^4$의 계수 $=\\sqrt 3\\cdot\\tfrac{1}{2}\\cdot(-\\tfrac{1}{2})\\cdot\\tfrac{1}{2}\\cdot\\tfrac{1}{9}=-\\tfrac{\\sqrt 3}{72}$. $f(x)=2x^2\\sqrt{3+x^2}$의 $x^6$ 계수 = $2\\cdot(-\\tfrac{\\sqrt 3}{72})=-\\tfrac{\\sqrt 3}{36}$. 따라서 $f^{(6)}(0)=x^6$ 계수 $\\times 6!=-\\tfrac{\\sqrt 3}{36}\\times 720=-20\\sqrt 3$."
  }),
  build({
    num: 31, subject: "선형대수", unit: "벡터공간", concept: "정사영 도형 넓이", difficulty: "medium",
    question: "점 $A(1,2,2),\\ B(3,2,3),\\ C(4,1,0),\\ D(2,3,0)$를 꼭짓점으로 하는 사면체 $ABCD$를 $xy$-평면으로 정사영하여 얻은 도형의 넓이는?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 2,
    explanation: "$xy$평면 정사영은 $z$좌표를 0으로 바꾸는 것: $A'(1,2),\\ B'(3,2),\\ C'(4,1),\\ D'(2,3)$. 4점을 평면에 찍으면 $B'$이 직선 $C'D'$ 위에 있어 사면체 정사영은 결국 삼각형 $A'C'D'$. $\\vec{A'C'}=(3,-1),\\ \\vec{A'D'}=(1,1)$. 외적의 크기 = $|3\\cdot 1-(-1)\\cdot 1|=4$. 넓이 = $\\dfrac{1}{2}\\cdot 4=2$."
  }),
  build({
    num: 32, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "삼각형 넓이 최소(평면 거리)", difficulty: "mediumHard",
    question: "점 $A$는 평면 $x+y=1$과 평면 $z=0$의 교선 위에서 움직이고, 점 $B$는 평면 $x=1$과 평면 $z=1$의 교선 위에서 움직인다. 삼각형 $OAB$의 넓이의 최솟값은? (단, $O$는 원점)",
    options: [o("1","$\\dfrac{\\sqrt 2}{4}$"), o("2","$\\dfrac{\\sqrt 2}{3}$"), o("3","$\\dfrac{\\sqrt 2}{2}$"), o("4","$\\dfrac{2\\sqrt 2}{3}$"), o("5","$\\sqrt 2$")],
    answer: 1,
    explanation: "$A$는 $z=0$, $x+y=1$ 위 → $A=(t,1-t,0)$. $B$는 $x=1, z=1$ 위 → $B=(1,s,1)$. $|OA|=\\sqrt{t^2+(1-t)^2}$, $A$가 원점에서 가장 가까울 때는 $\\bar A=(\\tfrac{1}{2},\\tfrac{1}{2},0)$, $|OA|_{\\min}=\\dfrac{1}{\\sqrt 2}$. 같은 평면 ($y$방향 직선) 안에 있을 때 $B$의 높이는 1로 고정 (수선 길이 1). 따라서 최소 넓이 = $\\dfrac{1}{2}\\cdot\\dfrac{1}{\\sqrt 2}\\cdot 1=\\dfrac{\\sqrt 2}{4}$."
  }),
  build({
    num: 33, subject: "다변수함수", unit: "추가내용", concept: "관련변화율(원통)", difficulty: "easyMedium",
    question: "원통의 밑면의 반지름은 $3\\,\\text{cm/sec}$의 일정한 속도로 증가하고 높이는 $4\\,\\text{cm/sec}$의 일정한 속도로 감소하고 있다. 반지름과 높이가 $10\\,\\text{cm}$로 같게 되는 순간의 원통의 부피의 변화율은?",
    options: [o("1","$100\\pi\\,\\text{cm}^3/\\text{sec}$"), o("2","$200\\pi\\,\\text{cm}^3/\\text{sec}$"), o("3","$300\\pi\\,\\text{cm}^3/\\text{sec}$"), o("4","$400\\pi\\,\\text{cm}^3/\\text{sec}$"), o("5","$500\\pi\\,\\text{cm}^3/\\text{sec}$")],
    answer: 2,
    explanation: "$V=\\pi r^2 h$. 양변 $t$로 미분: $\\dfrac{dV}{dt}=2\\pi r h\\dfrac{dr}{dt}+\\pi r^2 \\dfrac{dh}{dt}$. $r=h=10$, $\\dfrac{dr}{dt}=3$, $\\dfrac{dh}{dt}=-4$ 대입: $\\dfrac{dV}{dt}=2\\pi\\cdot 10\\cdot 10\\cdot 3 + \\pi\\cdot 100\\cdot(-4) = 600\\pi-400\\pi=200\\pi$."
  }),
  build({
    num: 34, subject: "다변수함수", unit: "추가내용", concept: "평면 위 정사영의 거리", difficulty: "mediumHard",
    question: "그림과 같이 $\\overline{AB}=1,\\ \\overline{AD}=1,\\ \\overline{AE}=2$인 직육면체 $ABCDEFGH$가 있다. 점 $B,D,G$를 지나는 평면을 $\\alpha$라 하고, 점 $C$와 $E$에서 평면 $\\alpha$에 내린 수선의 발은 각각 $X$와 $Y$라 하자. 선분 $\\overline{XY}$의 길이는?",
    options: [o("1","$\\dfrac{\\sqrt 2}{2}$"), o("2","$\\dfrac{\\sqrt 3}{2}$"), o("3","$1$"), o("4","$\\sqrt 2$"), o("5","$\\sqrt 3$")],
    answer: 4,
    explanation: "좌표 설정: $A=(0,0,0),\\ B=(1,0,0),\\ C=(1,1,0),\\ D=(0,1,0),\\ E=(0,0,2),\\ F=(1,0,2),\\ G=(1,1,2),\\ H=(0,1,2)$. 평면 $\\alpha$는 $B,D,G$ 통과: 절편형 $\\dfrac{x}{1}+\\dfrac{y}{1}+\\dfrac{z}{2}=1$, 즉 $2x+2y+z=2$, 법선벡터 $(2,2,1)$, $|\\vec n|=3$. 점 $C=(1,1,0)$에서 평면까지 정사영(거리·방향): $\\vec{CX}=-\\dfrac{(1,1,0)\\cdot(2,2,1)-2}{9}(2,2,1)=-\\dfrac{2}{9}(2,2,1)$ → $X=(1-\\tfrac{4}{9},1-\\tfrac{4}{9},-\\tfrac{2}{9})=(\\tfrac{5}{9},\\tfrac{5}{9},-\\tfrac{2}{9})$. 점 $E=(0,0,2)$ 정사영: $\\vec{EY}=-\\dfrac{(0,0,2)\\cdot(2,2,1)-2}{9}(2,2,1)=0$ → $Y=E=(0,0,2)$. 거리 $|XY|=\\sqrt{\\tfrac{25}{81}+\\tfrac{25}{81}+\\tfrac{400}{81}}=\\sqrt{\\tfrac{450}{81}}=\\sqrt 2$. (해설서 결과와 일치)",
    questionImage: svgToDataUrl(RECT_PRISM_SVG)
  }),
  build({
    num: 35, subject: "미분학", unit: "도함수의 응용", concept: "최적화(Norman window)", difficulty: "medium",
    question: "그림과 같이 직사각형 위에 반원을 올려놓은 형태의 도형이 있으며, 이 도형의 둘레의 길이가 $l$로 일정하다. 이 도형의 넓이가 최대가 될 때 직사각형의 가로 $a$와 세로 $b$의 비 $\\dfrac{a}{b}$의 값은?",
    options: [o("1","$\\dfrac{1}{\\pi}$"), o("2","$\\dfrac{1}{2}$"), o("3","$1$"), o("4","$2$"), o("5","$\\pi$")],
    answer: 4,
    explanation: "둘레: 밑변 $a$ + 두 세로 $2b$ + 반원 호 $\\pi\\cdot\\tfrac{a}{2}=l$, 즉 $a+2b+\\dfrac{\\pi a}{2}=l$. 넓이 $S=ab+\\dfrac{\\pi a^2}{8}$. 제약식에서 $b=\\dfrac{l-a-\\pi a/2}{2}$. $S$에 대입 후 $a$로 미분 = 0 풀면 $a=\\dfrac{2l}{\\pi+4}$, $b=\\dfrac{l}{\\pi+4}$. 따라서 $\\dfrac{a}{b}=2$.",
    questionImage: svgToDataUrl(NORMAN_WINDOW_SVG)
  }),
  build({
    num: 36, subject: "다변수함수", unit: "중적분", concept: "반복적분(부분적분)", difficulty: "mediumHard",
    question: "다음 반복적분의 값은?\\\\ $\\displaystyle\\int_\\pi^{2\\pi}\\!\\!\\int_{1/x}^{1} y\\sin(xy)\\,dy\\,dx$",
    options: [o("1","$\\dfrac{-\\sin 1-\\cos 1}{\\pi}$"), o("2","$\\dfrac{-\\sin 1+\\cos 1}{\\pi}$"), o("3","$\\dfrac{-\\sin 1+\\cos 1}{2\\pi}$"), o("4","$\\dfrac{\\sin 1+\\cos 1}{2\\pi}$"), o("5","$\\dfrac{\\cos 1}{2\\pi}$")],
    answer: 3,
    explanation: "내부 적분 $\\int y\\sin(xy)dy$는 $u=y,\\ dv=\\sin(xy)dy$로 부분적분: $=-\\dfrac{y\\cos(xy)}{x}+\\dfrac{\\sin(xy)}{x^2}+C$. $y=1/x \\to 1$에서 평가: $\\left[-\\dfrac{y\\cos(xy)}{x}+\\dfrac{\\sin(xy)}{x^2}\\right]_{1/x}^{1} = -\\dfrac{\\cos x}{x}+\\dfrac{\\sin x}{x^2}-\\left(-\\dfrac{\\cos 1}{x^2}+\\dfrac{\\sin 1}{x^2}\\right)$. 이를 $\\pi$~$2\\pi$로 적분. $-\\int_{\\pi}^{2\\pi}\\dfrac{\\cos x}{x}dx + \\int\\dfrac{\\sin x}{x^2}dx + (\\cos 1-\\sin 1)\\int\\dfrac{1}{x^2}dx$. 첫 두 항은 부분적분으로 합치면 사라지고, 마지막: $(\\cos 1-\\sin 1)\\cdot[-\\tfrac{1}{x}]_{\\pi}^{2\\pi}=(\\cos 1-\\sin 1)\\cdot\\dfrac{1}{2\\pi}$. 정리하면 $\\dfrac{-\\sin 1+\\cos 1}{2\\pi}$."
  }),
  build({
    num: 37, subject: "다변수함수", unit: "선적분과 면적분", concept: "그놈(원점 포함 여부)", difficulty: "mediumHard",
    question: "벡터장 $\\vec F(x,y)=-\\dfrac{y}{(x^2+y^2)^k}\\vec i+\\dfrac{x}{(x^2+y^2)^k}\\vec j$이고, 곡선 $C$는 중심이 $(2,0)$이고 반지름이 $1$인 원이다. 선적분 $\\displaystyle\\int_C \\vec F\\cdot d\\vec r=0$일 때 $k$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$1$"), o("3","$\\dfrac{3}{2}$"), o("4","$2$"), o("5","$\\dfrac{5}{2}$")],
    answer: 2,
    explanation: "$\\vec F$가 보존장(완전미분)이면 닫힌곡선 적분이 0. $M=-\\dfrac{y}{(x^2+y^2)^k},\\ N=\\dfrac{x}{(x^2+y^2)^k}$. $M_y=N_x$ 조건은 $k=1$일 때만 성립('그놈'). 더 정확히, $k=1$일 때만 정의역(원점 제외)에서 폐곡선이 원점을 둘러싸지 않으면 적분이 0. $C$는 원점을 포함하지 않으므로 $k=1$이면 0. 다른 $k$에서는 $M_y\\ne N_x$라 일반적으로 0 아님."
  }),
  build({
    num: 38, subject: "다변수함수", unit: "선적분과 면적분", concept: "보존장(완전미분)", difficulty: "medium",
    question: "곡선 $C$가 $\\vec r(t)=(\\sin t,\\ t),\\ 0\\le t\\le \\dfrac{\\pi}{2}$로 주어졌을 때 선적분 $\\displaystyle\\int_C (4y^2+e^x)\\,dx + (8xy+\\cos y)\\,dy$의 값은?",
    options: [o("1","$\\pi-e$"), o("2","$\\pi+e$"), o("3","$2\\pi-e$"), o("4","$2\\pi+e$"), o("5","$\\pi^2+e$")],
    answer: 5,
    explanation: "$M=4y^2+e^x,\\ N=8xy+\\cos y$. $M_y=8y=N_x$이므로 보존장. 母함수 $\\phi$: $\\phi_x=4y^2+e^x \\Rightarrow \\phi=4xy^2+e^x+g(y)$. $\\phi_y=8xy+g'(y)=8xy+\\cos y \\Rightarrow g(y)=\\sin y$. 즉 $\\phi=4xy^2+e^x+\\sin y$. 시점 $t=0$: $(0,0)$. 종점 $t=\\tfrac{\\pi}{2}$: $(1,\\tfrac{\\pi}{2})$. 적분 = $\\phi(1,\\tfrac{\\pi}{2})-\\phi(0,0) = (4\\cdot 1\\cdot\\tfrac{\\pi^2}{4}+e+1)-(0+1+0) = \\pi^2+e$."
  }),
  build({
    num: 39, subject: "다변수함수", unit: "선적분과 면적분", concept: "발산정리(반구 보조)", difficulty: "medium",
    question: "벡터장 $\\vec F(x,y,z)=(1,1,1)$과 반구면 $S:x^2+y^2+z^2=1,\\ z\\ge 0$에 대하여 면적분 $\\left|\\displaystyle\\iint_S \\vec F\\cdot d\\vec S\\right|$의 절댓값은?",
    options: [o("1","$1$"), o("2","$\\pi$"), o("3","$4$"), o("4","$\\dfrac{3}{2}\\pi$"), o("5","$9$")],
    answer: 2,
    explanation: "반구면은 닫혀있지 않다. 밑면 원판 $D:z=0,\\ x^2+y^2\\le 1$을 더해 닫고 발산정리. $\\nabla\\cdot\\vec F=0$이므로 $\\iint_{S\\cup D}\\vec F\\cdot d\\vec S=0$. 따라서 $\\iint_S = -\\iint_D$. 밑면의 외향 단위법선은 $-\\hat k=(0,0,-1)$: $\\iint_D \\vec F\\cdot(0,0,-1)dA = -\\iint_D 1\\,dA = -\\pi$ (원판 넓이 $\\pi$). 따라서 $\\iint_S = -(-\\pi)=\\pi$. 절댓값 $\\pi$."
  }),
  build({
    num: 40, subject: "다변수함수", unit: "선적분과 면적분", concept: "발산정리(구)", difficulty: "mediumHard",
    question: "벡터장 $\\vec F(x,y,z)=(xz+e^y,\\ x^2+yz^2,\\ z+e^x)$이고 $S$는 구면 $x^2+y^2+z^2=1$일 때 면적분 $\\left|\\displaystyle\\iint_S \\vec F\\cdot d\\vec S\\right|$의 절댓값은?",
    options: [o("1","$\\dfrac{4\\pi}{15}$"), o("2","$\\dfrac{8\\pi}{5}$"), o("3","$\\dfrac{8\\pi}{3}$"), o("4","$3\\pi$"), o("5","$4\\pi$")],
    answer: 2,
    explanation: "발산정리: $\\iint_S \\vec F\\cdot d\\vec S = \\iiint_T \\nabla\\cdot\\vec F\\,dV$. $\\nabla\\cdot\\vec F = z + z^2 + 1$. $T$는 단위공. (1) $\\iiint_T z\\,dV = 0$ (대칭). (2) $\\iiint_T 1\\,dV = \\dfrac{4}{3}\\pi$ (구의 부피). (3) $\\iiint_T z^2\\,dV$: 구면좌표 $z=\\rho\\cos\\phi$, $\\iiint = \\int_0^{2\\pi}\\!\\int_0^\\pi\\!\\int_0^1 \\rho^4\\cos^2\\phi\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta = 2\\pi\\cdot\\dfrac{1}{5}\\cdot\\left[-\\dfrac{\\cos^3\\phi}{3}\\right]_0^\\pi = \\dfrac{2\\pi}{5}\\cdot\\dfrac{2}{3}=\\dfrac{4\\pi}{15}$. 합: $0+\\dfrac{4\\pi}{15}+\\dfrac{4\\pi}{3}=\\dfrac{4\\pi+20\\pi}{15}=\\dfrac{24\\pi}{15}=\\dfrac{8\\pi}{5}$."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error(error); process.exit(1); }
console.log("Inserted:");
for (const r of data) console.log(`  - ${r.id}  [${r.subject}/${r.unit}/${r.difficulty}]`);
