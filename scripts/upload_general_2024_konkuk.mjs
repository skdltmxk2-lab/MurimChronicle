// Upload 2024년도 건국대 편입수학 기출 20문항 (21~40번, 5지선다)
// Usage: node scripts/upload_general_2024_konkuk.mjs
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
const YEAR = "2024";
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

// 34번: 정사면체 ABCD. A를 위쪽 꼭짓점, B-C-D를 밑면 삼각형으로 그린다.
const TETRAHEDRON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <!-- 밑면 삼각형 (실선) -->
  <polygon points="60,200 200,200 130,150" fill="none" stroke="#1f2937" stroke-width="1.6"/>
  <!-- 옆면 모서리 -->
  <line x1="60" y1="200" x2="120" y2="40" stroke="#1f2937" stroke-width="1.6"/>
  <line x1="200" y1="200" x2="120" y2="40" stroke="#1f2937" stroke-width="1.6"/>
  <!-- 안쪽 모서리 (점선) -->
  <line x1="130" y1="150" x2="120" y2="40" stroke="#1f2937" stroke-width="1.4" stroke-dasharray="4,3"/>
  <!-- 꼭짓점 라벨 -->
  <text x="115" y="32" font-size="14" font-weight="bold" fill="#1f2937">A</text>
  <text x="44" y="216" font-size="14" font-weight="bold" fill="#1f2937">B</text>
  <text x="206" y="216" font-size="14" font-weight="bold" fill="#1f2937">C</text>
  <text x="138" y="146" font-size="14" font-weight="bold" fill="#1f2937">D</text>
</svg>`;

const problems = [
  build({
    num: 21, subject: "미분학", unit: "극한과 연속", concept: "Maclaurin급수 극한", difficulty: "medium",
    question: "$\\displaystyle\\lim_{x\\to 0^+}\\dfrac{x^2\\int_0^x \\tan t\\,dt}{\\cos(x^2)-1}$의 값은?",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$0$"), o("4","$1$"), o("5","$2$")],
    answer: 2,
    explanation: "Maclaurin 급수로 풀자. 분자: $\\int_0^x \\tan t\\,dt = \\int_0^x (t+\\tfrac{1}{3}t^3+\\cdots)dt = \\tfrac{1}{2}x^2+\\tfrac{1}{12}x^4+\\cdots$ 이므로 $x^2\\cdot(\\cdots) = \\tfrac{1}{2}x^4 + \\tfrac{1}{12}x^6 + \\cdots$. 분모: $\\cos(x^2)-1 = -\\tfrac{1}{2}x^4+\\tfrac{1}{24}x^8-\\cdots$. 따라서 최저차항 비교: $\\dfrac{\\tfrac{1}{2}x^4}{-\\tfrac{1}{2}x^4} = -1$."
  }),
  build({
    num: 22, subject: "적분학", unit: "정적분의 계산", concept: "삼각치환 + 부분분수", difficulty: "medium",
    question: "$\\displaystyle\\int_0^2 \\dfrac{4x+8}{(x^2+4)^2}\\,dx$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{8}+\\dfrac{1}{4}$"), o("2","$\\dfrac{\\pi}{8}+\\dfrac{1}{2}$"), o("3","$\\dfrac{\\pi}{8}+1$"), o("4","$\\dfrac{\\pi}{4}+\\dfrac{1}{2}$"), o("5","$\\dfrac{\\pi}{4}+1$")],
    answer: 2,
    explanation: "$x=2\\tan\\theta$로 치환하면 $dx=2\\sec^2\\theta\\,d\\theta$, $x^2+4=4\\sec^2\\theta$. 적분구간은 $0\\to\\tfrac{\\pi}{4}$. 식 정리하면 $\\int_0^{\\pi/4}\\dfrac{8\\tan\\theta+8}{16\\sec^4\\theta}\\cdot 2\\sec^2\\theta\\,d\\theta = \\int_0^{\\pi/4}\\dfrac{\\tan\\theta+1}{\\sec^2\\theta}d\\theta = \\int_0^{\\pi/4}(\\sin\\theta\\cos\\theta+\\cos^2\\theta)d\\theta$. 첫째 항 $\\tfrac{1}{2}[\\sin^2\\theta]_0^{\\pi/4}=\\tfrac{1}{4}$, 둘째 항 $\\tfrac{\\pi}{8}+\\tfrac{1}{4}$. 합: $\\tfrac{\\pi}{8}+\\tfrac{1}{2}$."
  }),
  build({
    num: 23, subject: "미분학", unit: "도함수의 응용", concept: "로그미분법(접선의 기울기)", difficulty: "medium",
    question: "곡선 $y=(3x-1)^{x^2+1}$의 $x=1$에서의 접선의 기울기는?",
    options: [o("1","$2\\ln 2 + 1$"), o("2","$4\\ln 2 + 2$"), o("3","$4\\ln 2 + 6$"), o("4","$8\\ln 2 + 4$"), o("5","$8\\ln 2 + 12$")],
    answer: 5,
    explanation: "$y=(3x-1)^{x^2+1}$의 양변에 $\\ln$을 취하면 $\\ln y = (x^2+1)\\ln(3x-1)$. 양변 미분하면 $\\dfrac{y'}{y} = 2x\\ln(3x-1) + (x^2+1)\\cdot\\dfrac{3}{3x-1}$. $x=1$ 대입: $y(1)=2^2=4$, $\\dfrac{y'(1)}{4} = 2\\ln 2 + 2\\cdot\\dfrac{3}{2} = 2\\ln 2 + 3$. 따라서 $y'(1) = 4(2\\ln 2+3) = 8\\ln 2 + 12$."
  }),
  build({
    num: 24, subject: "적분학", unit: "정적분의 계산", concept: "부분적분(이상적분)", difficulty: "easy",
    question: "이상적분 $\\displaystyle\\int_0^1 x^2\\ln x\\,dx$의 값은?",
    options: [o("1","$-\\dfrac{1}{9}$"), o("2","$-\\dfrac{1}{6}$"), o("3","$-\\dfrac{1}{2}$"), o("4","$-1$"), o("5","$-\\dfrac{3}{2}$")],
    answer: 1,
    explanation: "부분적분: $u=\\ln x,\\ dv=x^2 dx$ 두면 $du=\\tfrac{1}{x}dx,\\ v=\\tfrac{x^3}{3}$. 따라서 $\\int x^2\\ln x\\,dx = \\tfrac{x^3}{3}\\ln x - \\int \\tfrac{x^2}{3}dx = \\tfrac{x^3}{3}\\ln x - \\tfrac{x^3}{9}$. $0\\to 1$ 대입: $\\left[\\tfrac{1}{3}\\cdot 0 - \\tfrac{1}{9}\\right] - 0 = -\\dfrac{1}{9}$ (이때 $x\\to 0^+$에서 $x^3\\ln x\\to 0$)."
  }),
  build({
    num: 25, subject: "다변수함수", unit: "추가내용", concept: "파푸스 정리(회전체)", difficulty: "mediumHard",
    question: "$y=x^2$와 $y=x$로 둘러싸인 영역을 $y=x$를 축으로 회전하여 생기는 입체의 부피는?",
    options: [o("1","$\\dfrac{\\sqrt{2}}{90}\\pi$"), o("2","$\\dfrac{\\sqrt{2}}{60}\\pi$"), o("3","$\\dfrac{\\sqrt{2}}{30}\\pi$"), o("4","$\\dfrac{\\sqrt{3}}{90}\\pi$"), o("5","$\\dfrac{\\sqrt{3}}{60}\\pi$")],
    answer: 2,
    explanation: "파푸스 정리: $V = (\\text{영역의 넓이}) \\times (\\text{중심이 이동한 거리})$. (1) 영역의 넓이: $\\int_0^1 (x-x^2)dx = \\tfrac{1}{6}$. (2) 영역의 무게중심: $\\bar x=\\tfrac{1}{2},\\ \\bar y=\\tfrac{2}{5}$ (직접 계산 또는 암기). (3) 회전축 $y=x$와 중심 $(\\tfrac{1}{2},\\tfrac{2}{5})$ 사이 거리: $d=\\dfrac{|\\tfrac{1}{2}-\\tfrac{2}{5}|}{\\sqrt{2}} = \\dfrac{\\sqrt{2}}{20}$. (4) 따라서 $V = \\tfrac{1}{6}\\times 2\\pi\\times\\tfrac{\\sqrt{2}}{20} = \\dfrac{\\sqrt{2}}{60}\\pi$."
  }),
  build({
    num: 26, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "고계 도함수 (이항급수)", difficulty: "mediumHard",
    question: "$f(x)=\\dfrac{4}{7}x\\sqrt{4+2x^2}$일 때 $f^{(7)}(0)$의 값은?",
    options: [o("1","$0$"), o("2","$18$"), o("3","$27$"), o("4","$36$"), o("5","$45$")],
    answer: 5,
    explanation: "목표는 $f(x)$의 Maclaurin급수에서 $x^7$의 계수를 구하고 $7!$을 곱하는 것. $\\sqrt{4+2x^2} = 2(1+\\tfrac{1}{2}x^2)^{1/2}$. 이항급수로 전개: $2\\left[1 + \\tfrac{1}{2}\\cdot\\tfrac{x^2}{2} + \\tfrac{1}{2!}\\cdot\\tfrac{1}{2}\\cdot(-\\tfrac{1}{2})\\left(\\tfrac{x^2}{2}\\right)^2 + \\tfrac{1}{3!}\\cdot\\tfrac{1}{2}\\cdot(-\\tfrac{1}{2})\\cdot(-\\tfrac{3}{2})\\left(\\tfrac{x^2}{2}\\right)^3 + \\cdots\\right]$. $x^6$의 계수 = $\\tfrac{1}{64}$. 따라서 $\\tfrac{4}{7}x\\sqrt{4+2x^2}$에서 $x^7$ 계수 = $\\tfrac{4}{7}\\cdot\\tfrac{1}{64}=\\dfrac{1}{112}$. 결과: $f^{(7)}(0) = \\tfrac{1}{112}\\times 7! = 45$."
  }),
  build({
    num: 27, subject: "적분학", unit: "추가내용", concept: "극곡선 접선/넓이", difficulty: "mediumHard",
    question: "극곡선 $r=1+\\sin\\theta$의 $\\theta=\\dfrac{\\pi}{3}$일 때의 접선을 $\\ell_1$, $\\theta=\\dfrac{2\\pi}{3}$일 때의 접선을 $\\ell_2$라 하자. 두 직선 $\\ell_1,\\ell_2$와 $x$축으로 둘러싸인 삼각형 영역의 넓이는?",
    options: [o("1","$3+2\\sqrt{3}$"), o("2","$\\dfrac{3+2\\sqrt{3}}{4}$"), o("3","$\\dfrac{26+15\\sqrt{3}}{8}$"), o("4","$\\dfrac{26+15\\sqrt{3}}{4}$"), o("5","$\\dfrac{26+15\\sqrt{3}}{2}$")],
    answer: 3,
    explanation: "대칭성으로 두 접선의 교점은 $y$축 위에 있다. $\\theta=\\tfrac{\\pi}{3}$에서 $r=1+\\tfrac{\\sqrt{3}}{2}$이므로 점 $A$의 직교좌표 $\\left(\\tfrac{1}{2}+\\tfrac{\\sqrt{3}}{4},\\ \\tfrac{\\sqrt{3}}{2}+\\tfrac{3}{4}\\right)$. 접선 기울기: $\\tan\\phi = \\dfrac{dy/d\\theta}{dx/d\\theta}$ 공식으로 계산하면 $\\theta=\\tfrac{\\pi}{3}$에서 $\\tan\\alpha = -1$ (즉 $\\ell_1$의 기울기). $\\ell_1$: $y - (\\tfrac{\\sqrt{3}}{2}+\\tfrac{3}{4}) = -(x - (\\tfrac{1}{2}+\\tfrac{\\sqrt{3}}{4}))$. $y$절편 = $x$절편 = $\\tfrac{5}{4}+\\tfrac{3\\sqrt{3}}{4}$. 대칭성으로 삼각형 넓이 = $2\\cdot \\tfrac{1}{2}\\cdot\\left(\\tfrac{5+3\\sqrt{3}}{4}\\right)^2 = \\dfrac{26+15\\sqrt{3}}{8}$."
  }),
  build({
    num: 28, subject: "적분학", unit: "추가내용", concept: "극곡선 영역 넓이", difficulty: "medium",
    question: "극곡선 $r=4+2\\sin\\theta$의 내부와 극곡선 $r=4\\sin\\theta$의 외부에 놓인 영역의 넓이는?",
    options: [o("1","$10\\pi$"), o("2","$11\\pi$"), o("3","$12\\pi$"), o("4","$13\\pi$"), o("5","$14\\pi$")],
    answer: 5,
    explanation: "두 영역의 차로 푼다. (1) $r=4+2\\sin\\theta$의 내부면적 = $\\tfrac{1}{2}\\int_{-\\pi/2}^{\\pi/2}(4+2\\sin\\theta)^2 \\cdot 2\\,d\\theta$ (대칭). $(4+2\\sin\\theta)^2 = 16+16\\sin\\theta+4\\sin^2\\theta$. 우함수 $\\sin\\theta$ 성분은 $-\\pi/2\\sim\\pi/2$에서 0이고, $\\sin^2$은 $\\tfrac{1-\\cos 2\\theta}{2}$로 적분하면 합산해서 $18\\pi$. (2) $r=4\\sin\\theta$는 중심 $(0,2)$, 반지름 $2$인 원이므로 면적 $4\\pi$. (3) 차: $18\\pi-4\\pi=14\\pi$ (원이 카디오이드 안에 완전히 들어가므로 빼면 됨)."
  }),
  build({
    num: 29, subject: "적분학", unit: "급수의 수렴/발산", concept: "비교판정/극한비교", difficulty: "medium",
    question: "다음 급수 중 수렴하는 것을 모두 고르면?\\\\(a) $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n^{1/n}}{n}$\\quad (b) $\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{1}{n^{\\sqrt{2}}\\ln n}$\\quad (c) $\\displaystyle\\sum_{n=1}^{\\infty}\\tan\\dfrac{1}{n}$",
    options: [o("1","(a)"), o("2","(b)"), o("3","(c)"), o("4","(a), (b)"), o("5","(a), (b), (c)")],
    answer: 2,
    explanation: "(a) $\\lim_{n\\to\\infty} n^{1/n}=1$이므로 $\\dfrac{n^{1/n}}{n}\\sim\\dfrac{1}{n}$. 극한비교로 발산($\\sum \\tfrac{1}{n}$ 발산). (b) $\\ln n=t$로 치환하면 $n=e^t$, 식이 $\\sum \\dfrac{e^{(1-\\sqrt 2)t}}{t}$로 변형. $1-\\sqrt 2<0$이므로 지수항이 빠르게 0으로 가서 수렴. 또는 $p$급수와 비교: $n^{\\sqrt 2}\\ln n$의 분자가 $n^{\\sqrt 2}$보다 빠르게 커지지만 $\\sqrt 2>1$이라 자체로 수렴. (c) $\\tan\\tfrac{1}{n}\\sim \\tfrac{1}{n}$이므로 발산. 따라서 수렴은 (b)뿐."
  }),
  build({
    num: 30, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "지수급수의 합", difficulty: "medium",
    question: "급수 $\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{(\\ln 7)^n}{n!}$의 합은?",
    options: [o("1","$6-\\ln 7$"), o("2","$6$"), o("3","$7-\\ln 7$"), o("4","$7$"), o("5","$7+\\ln 7$")],
    answer: 1,
    explanation: "$e^x=\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{x^n}{n!}$. $x=\\ln 7$ 대입: $e^{\\ln 7}=7=\\sum_{n=0}^{\\infty}\\dfrac{(\\ln 7)^n}{n!} = 1+\\ln 7+\\sum_{n=2}^{\\infty}\\dfrac{(\\ln 7)^n}{n!}$. 따라서 $\\sum_{n=2}^{\\infty}\\dfrac{(\\ln 7)^n}{n!} = 7-1-\\ln 7 = 6-\\ln 7$."
  }),
  build({
    num: 31, subject: "다변수함수", unit: "체적과 곡면적", concept: "곡면적(극좌표)", difficulty: "mediumHard",
    question: "곡면 $z=x^2+y^2+4,\\ x\\ge 0,\\ 1\\le x^2+y^2\\le 3$의 넓이는?",
    options: [o("1","$\\dfrac{\\pi}{12}(13\\sqrt{13}-5\\sqrt{5})$"), o("2","$\\dfrac{\\pi}{12}(17\\sqrt{17}-13\\sqrt{13})$"), o("3","$\\dfrac{\\pi}{6}(13\\sqrt{13}-5\\sqrt{5})$"), o("4","$\\dfrac{\\pi}{6}(17\\sqrt{17}-13\\sqrt{13})$"), o("5","$\\dfrac{\\pi}{6}(17\\sqrt{17}-5\\sqrt{5})$")],
    answer: 1,
    explanation: "곡면적 공식: $S=\\iint_D \\sqrt{1+z_x^2+z_y^2}\\,dA = \\iint_D \\sqrt{1+4x^2+4y^2}\\,dA$. 영역 $D$는 반원환 $x\\ge 0,\\ 1\\le r\\le \\sqrt 3$. 극좌표로 바꾸면 $S=\\int_{-\\pi/2}^{\\pi/2}\\int_1^{\\sqrt 3} r\\sqrt{1+4r^2}\\,dr\\,d\\theta = \\pi\\cdot\\int_1^{\\sqrt 3} r\\sqrt{1+4r^2}\\,dr$. $u=1+4r^2$로 치환하면 $du=8r\\,dr$. $r=1$일 때 $u=5$, $r=\\sqrt 3$일 때 $u=13$. 적분 = $\\tfrac{1}{8}\\cdot\\tfrac{2}{3}[u^{3/2}]_5^{13} = \\tfrac{1}{12}(13\\sqrt{13}-5\\sqrt 5)$. 따라서 $S=\\dfrac{\\pi}{12}(13\\sqrt{13}-5\\sqrt 5)$."
  }),
  build({
    num: 32, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "라그랑주 승수법", difficulty: "mediumHard",
    question: "곡면 $2x^2+2y^2+3z^2=6$에서 함수 $f(x,y,z)=4xy+6z$의 최댓값은?",
    options: [o("1","$5$"), o("2","$6$"), o("3","$6\\sqrt{2}$"), o("4","$6\\sqrt{3}$"), o("5","$9$")],
    answer: 5,
    explanation: "라그랑주 승수법: $\\nabla f = \\lambda \\nabla g$, $g=2x^2+2y^2+3z^2-6$. $f_x=4y=4\\lambda x$, $f_y=4x=4\\lambda y$, $f_z=6=6\\lambda z$. 첫 두 식에서 $y=\\lambda x,\\ x=\\lambda y \\Rightarrow x=\\lambda^2 x$, $\\lambda=\\pm 1$ (또는 $x=y=0$). $\\lambda=1$이면 $y=x$. $\\lambda z=1 \\Rightarrow z=1$. 제약식 대입: $4x^2+3=6,\\ x^2=\\tfrac{3}{4},\\ x=\\pm\\tfrac{\\sqrt 3}{2}$. $f=4\\cdot\\tfrac{3}{4}+6=9$. $\\lambda=-1,\\ y=-x,\\ z=-1$도 동일하게 $f=4(-x^2)+6(-1)$로 음수. 따라서 최댓값 $9$."
  }),
  build({
    num: 33, subject: "다변수함수", unit: "중적분", concept: "이중적분(영역)", difficulty: "medium",
    question: "$R$은 $y=x^2$과 $y=\\dfrac{x^2}{2}+\\dfrac{1}{2}$로 둘러싸인 영역이다. $\\displaystyle\\iint_R (x-y)\\,dA$의 값은?",
    options: [o("1","$-\\dfrac{4}{5}$"), o("2","$-\\dfrac{4}{15}$"), o("3","$\\dfrac{4}{5}$"), o("4","$\\dfrac{4}{15}$"), o("5","$\\dfrac{2}{3}$")],
    answer: 2,
    explanation: "두 곡선 교점: $x^2=\\tfrac{x^2}{2}+\\tfrac{1}{2} \\Rightarrow x=\\pm 1$. 영역은 $-1\\le x\\le 1$, $x^2\\le y\\le \\tfrac{x^2+1}{2}$. (1) $\\iint_R x\\,dA = 0$ ($x$에 대한 우함수 영역에서 기함수 적분). (2) $\\iint_R y\\,dA = \\int_{-1}^1\\int_{x^2}^{(x^2+1)/2} y\\,dy\\,dx = \\int_{-1}^1 \\tfrac{1}{2}\\left[\\left(\\tfrac{x^2+1}{2}\\right)^2 - x^4\\right]dx$. 전개: $\\tfrac{1}{2}\\cdot\\tfrac{1}{4}(x^4+2x^2+1) - \\tfrac{1}{2}x^4 = \\tfrac{x^4+2x^2+1}{8}-\\tfrac{x^4}{2} = \\tfrac{1-3x^4+2x^2}{8}$. $-1\\to 1$ 적분: $\\tfrac{1}{8}\\cdot 2\\left(1-\\tfrac{3}{5}+\\tfrac{2}{3}\\right) = \\tfrac{1}{4}\\cdot\\tfrac{16}{15}=\\tfrac{4}{15}$. 따라서 $\\iint(x-y)dA = 0-\\tfrac{4}{15}=-\\dfrac{4}{15}$."
  }),
  build({
    num: 34, subject: "선형대수", unit: "벡터공간", concept: "삼중곱(BAC-CAB)", difficulty: "mediumHard",
    question: "모서리의 길이가 $1$인 정사면체 $ABCD$가 있다. 다음 중 벡터 $\\vec{AB}\\times(\\vec{AC}\\times\\vec{AD})$와 같은 벡터는?",
    options: [o("1","$\\dfrac{1}{3}\\vec{BC}$"), o("2","$\\dfrac{1}{3}\\vec{CD}$"), o("3","$\\dfrac{1}{2}\\vec{CD}$"), o("4","$\\dfrac{1}{2}\\vec{DC}$"), o("5","$\\dfrac{1}{2}\\vec{DB}$")],
    answer: 4,
    explanation: "BAC-CAB 공식: $\\vec a\\times(\\vec b\\times\\vec c) = \\vec b(\\vec a\\cdot\\vec c) - \\vec c(\\vec a\\cdot\\vec b)$. 정사면체에서 모서리 길이 $1$이므로 $|\\vec{AB}|=|\\vec{AC}|=|\\vec{AD}|=1$, 인접 모서리 사잇각 $60^\\circ$이므로 $\\vec{AB}\\cdot\\vec{AC}=\\vec{AB}\\cdot\\vec{AD}=\\tfrac{1}{2}$. 따라서 $\\vec{AB}\\times(\\vec{AC}\\times\\vec{AD}) = \\vec{AC}\\cdot\\tfrac{1}{2} - \\vec{AD}\\cdot\\tfrac{1}{2} = \\tfrac{1}{2}(\\vec{AC}-\\vec{AD}) = \\tfrac{1}{2}\\vec{DC}$.",
    questionImage: svgToDataUrl(TETRAHEDRON_SVG)
  }),
  build({
    num: 35, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "임계점/극값 판정", difficulty: "mediumHard",
    question: "함수 $f(x,y)=x^4+y^4-2xy$에 대한 다음 설명 중 옳은 것을 모두 고르면?\\\\(a) $\\left(\\dfrac{1}{\\sqrt 2},\\dfrac{1}{\\sqrt 2}\\right)$에서 $f$는 극솟값을 갖는다.\\\\(b) $\\left(-\\dfrac{1}{\\sqrt 2},-\\dfrac{1}{\\sqrt 2}\\right)$에서 $f$는 극댓값을 갖는다.\\\\(c) $(0,0)$에서 $f$는 극솟값을 갖는다.",
    options: [o("1","(a)"), o("2","(b)"), o("3","(c)"), o("4","(a),(b)"), o("5","(a),(c)")],
    answer: 1,
    explanation: "$f_x=4x^3-2y,\\ f_y=4y^3-2x$. 임계점은 $4x^3=2y,\\ 4y^3=2x \\Rightarrow x=2y^3,\\ y=2x^3$. $\\left(\\tfrac{1}{\\sqrt 2},\\tfrac{1}{\\sqrt 2}\\right),\\ \\left(-\\tfrac{1}{\\sqrt 2},-\\tfrac{1}{\\sqrt 2}\\right),\\ (0,0)$ 모두 임계점. 헤시안: $f_{xx}=12x^2,\\ f_{yy}=12y^2,\\ f_{xy}=-2$. $\\Delta=144 x^2 y^2 - 4$. (a) $x^2y^2=\\tfrac{1}{4}\\Rightarrow\\Delta=36-4=32>0$, $f_{xx}=6>0$이므로 극솟값. ✓ (b) 같은 계산으로 $\\Delta>0$, $f_{xx}>0$이므로 극솟값(극댓값 아님). ✗ (c) $\\Delta(0,0)=-4<0$, 안장점. ✗ 정답 (a)."
  }),
  build({
    num: 36, subject: "다변수함수", unit: "중적분", concept: "변수 t로 미분(라이프니츠)", difficulty: "medium",
    question: "$f(t)=\\displaystyle\\int_0^t\\!\\!\\int_{\\sqrt y}^{\\sqrt t} e^{x^2}\\,dx\\,dy$일 때 미분계수 $f'(4)$의 값은?",
    options: [o("1","$1$"), o("2","$e$"), o("3","$e^2$"), o("4","$e^3$"), o("5","$e^4$")],
    answer: 5,
    explanation: "이중적분의 적분순서 바꾸기. 영역 $0\\le y\\le t,\\ \\sqrt y\\le x\\le \\sqrt t$를 다시 그리면 $0\\le x\\le \\sqrt t,\\ 0\\le y\\le x^2$. 따라서 $f(t)=\\int_0^{\\sqrt t}\\int_0^{x^2} e^{x^2}\\,dy\\,dx = \\int_0^{\\sqrt t} x^2 e^{x^2}\\,dx$. 양변을 $t$로 미분 (라이프니츠): $f'(t) = (\\sqrt t)^2 e^t \\cdot \\dfrac{1}{2\\sqrt t} = \\dfrac{t \\cdot e^t}{2\\sqrt t} = \\dfrac{\\sqrt t\\cdot e^t}{2}\\cdot 2 \\to$ 정리하면 $t\\cdot e^t \\cdot \\tfrac{1}{2\\sqrt t}$. $t=4$ 대입: $\\tfrac{4\\cdot e^4}{2\\cdot 2} = e^4$."
  }),
  build({
    num: 37, subject: "다변수함수", unit: "중적분", concept: "Jacobian 변환", difficulty: "mediumHard",
    question: "$R$은 $(1,1),(2,0),(4,0),(2,2)$을 꼭짓점으로 하는 사각형 영역이다. $\\displaystyle\\iint_R e^{(y-x)/(y+x)}\\,dA$의 값은?",
    options: [o("1","$2e$"), o("2","$3e$"), o("3","$2(e-1)$"), o("4","$3\\!\\left(1-\\dfrac{1}{e}\\right)$"), o("5","$2\\!\\left(e-\\dfrac{1}{e}\\right)$")],
    answer: 4,
    explanation: "치환 $u=y-x,\\ v=y+x$. 야코비안 $\\dfrac{\\partial(x,y)}{\\partial(u,v)}=\\det\\!\\begin{pmatrix}-\\tfrac{1}{2}&\\tfrac{1}{2}\\\\\\tfrac{1}{2}&\\tfrac{1}{2}\\end{pmatrix}^{-1}$의 절댓값 = $\\tfrac{1}{2}$이므로 $dA=\\tfrac{1}{2}du\\,dv$. 사각형 꼭짓점 변환: $(1,1)\\to(0,2),\\ (2,0)\\to(-2,2),\\ (4,0)\\to(-4,4),\\ (2,2)\\to(0,4)$. 새 영역은 $-v\\le u\\le 0,\\ 2\\le v\\le 4$. 적분 = $\\tfrac{1}{2}\\int_2^4\\int_{-v}^0 e^{u/v}\\,du\\,dv = \\tfrac{1}{2}\\int_2^4 [v\\,e^{u/v}]_{-v}^0\\,dv = \\tfrac{1}{2}\\int_2^4 v(1-e^{-1})\\,dv = \\tfrac{1}{2}(1-e^{-1})\\cdot\\tfrac{16-4}{2} = 3(1-\\tfrac{1}{e})$."
  }),
  build({
    num: 38, subject: "다변수함수", unit: "추가내용", concept: "매개변수 곡면 접평면", difficulty: "medium",
    question: "매개변수 방정식 $x=u+v,\\ y=3u^2,\\ z=u-v$로 주어진 곡면의 점 $(2,3,0)$에서의 접평면이 $\\alpha$일 때 원점에서 평면 $\\alpha$에 이르는 거리는?",
    options: [o("1","$\\dfrac{3}{\\sqrt{19}}$"), o("2","$\\dfrac{5}{\\sqrt{19}}$"), o("3","$\\dfrac{3}{\\sqrt{17}}$"), o("4","$\\dfrac{7}{\\sqrt{17}}$"), o("5","$\\dfrac{7}{\\sqrt{15}}$")],
    answer: 1,
    explanation: "점 $(2,3,0)$ 대입하면 $u=1,v=1$. 편미분 벡터: $\\vec r_u=(1,6u,1)=(1,6,1)$, $\\vec r_v=(1,0,-1)$. 법선벡터 $\\vec n=\\vec r_u\\times\\vec r_v = \\det\\!\\begin{pmatrix}\\vec i&\\vec j&\\vec k\\\\1&6&1\\\\1&0&-1\\end{pmatrix} = (6\\cdot(-1)-0,\\ 1\\cdot 1-1\\cdot(-1),\\ 0-6) = (-6,2,-6)$. 약분해 $(3,-1,3)$. 접평면: $3(x-2)-(y-3)+3z=0 \\Rightarrow 3x-y+3z=3$. 원점까지 거리 = $\\dfrac{|3|}{\\sqrt{9+1+9}}=\\dfrac{3}{\\sqrt{19}}$."
  }),
  build({
    num: 39, subject: "다변수함수", unit: "선적분과 면적분", concept: "발산정리(닫힌면 보조)", difficulty: "mediumHard",
    question: "$S$는 곡면 $x^2+y^2+z^2=1,\\ x+y+z\\ge 1$이다. $\\vec F(x,y,z)=(z+1,\\,0,\\,x+y)$일 때 $\\left|\\displaystyle\\iint_S \\vec F\\cdot d\\vec S\\right|$의 값은?",
    options: [o("1","$\\dfrac{\\sqrt 3}{9}\\pi$"), o("2","$\\dfrac{2\\sqrt 3}{9}\\pi$"), o("3","$\\dfrac{\\sqrt 3}{3}\\pi$"), o("4","$\\dfrac{4\\sqrt 3}{9}\\pi$"), o("5","$\\dfrac{5\\sqrt 3}{9}\\pi$")],
    answer: 4,
    explanation: "$S$는 구면을 평면 $x+y+z=1$로 자른 작은 캡. 캡 $S$와 평면 $S_2$($x+y+z=1$의 원판)을 합치면 닫힌면이 되어 발산정리 적용 가능. $\\nabla\\cdot\\vec F = 0$이므로 $\\iint_{S\\cup S_2}\\vec F\\cdot d\\vec S = 0$. 따라서 $\\iint_S = -\\iint_{S_2}\\vec F\\cdot d\\vec S$ (방향 주의). $S_2$의 단위 법선 = $\\tfrac{1}{\\sqrt 3}(1,1,1)$ (원점 반대 방향이 외향). 적분: $\\iint_{S_2}\\vec F\\cdot d\\vec S = \\tfrac{1}{\\sqrt 3}\\iint_{S_2}(z+1+x+y)dA = \\tfrac{1}{\\sqrt 3}\\iint 2\\,dA$ (평면 위에서 $x+y+z=1$). $S_2$는 평면원판, 반지름 $r=\\sqrt{1-d^2}=\\sqrt{2/3}$ ($d=\\tfrac{1}{\\sqrt 3}$이 원점에서 평면까지 거리). 면적 $\\pi r^2 = \\tfrac{2\\pi}{3}$. 따라서 $\\iint_{S_2}=\\tfrac{2}{\\sqrt 3}\\cdot\\tfrac{2\\pi}{3}=\\tfrac{4\\sqrt 3}{9}\\pi$. 절댓값 $\\dfrac{4\\sqrt 3}{9}\\pi$."
  }),
  build({
    num: 40, subject: "다변수함수", unit: "선적분과 면적분", concept: "그놈 적분(각도)", difficulty: "medium",
    question: "$C$는 $x=2\\cos t,\\ y=3\\sin t,\\ 0\\le t\\le \\pi$로 주어진 곡선이다. 다음 선적분의 값은?\\\\ $\\displaystyle\\int_C \\dfrac{-y}{x^2+y^2}\\,dx + \\dfrac{x}{x^2+y^2}\\,dy$",
    options: [o("1","$0$"), o("2","$\\dfrac{\\pi}{4}$"), o("3","$\\dfrac{\\pi}{3}$"), o("4","$\\dfrac{\\pi}{2}$"), o("5","$\\pi$")],
    answer: 5,
    explanation: "벡터장 $\\vec F = \\dfrac{1}{x^2+y^2}(-y,x)$의 선적분은 폐곡선이 아닌 경우 시점과 종점의 편각 차에 의존한다(이른바 '그놈 적분' 또는 각도 적분). 이 식 자체가 $d\\theta$ ($\\theta$ = 편각). 시점 $t=0$: $(2,0)$, 편각 $\\theta_1=0$. 종점 $t=\\pi$: $(-2,0)$, 편각 $\\theta_2=\\pi$. 따라서 적분값 = $\\theta_2-\\theta_1 = \\pi$."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error(error); process.exit(1); }
console.log("Inserted:");
for (const r of data) console.log(`  - ${r.id}  [${r.subject}/${r.unit}/${r.difficulty}]`);
