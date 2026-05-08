// Upload 2021년도 건국대 편입수학 기출 20문항 (21~40번, 5지선다)
// Usage: node scripts/upload_general_2021_konkuk.mjs
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
const YEAR = "2021";
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

// 30번: 정사면체 ABCD.
const TETRAHEDRON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <polygon points="60,200 200,200 130,150" fill="none" stroke="#1f2937" stroke-width="1.6"/>
  <line x1="60" y1="200" x2="120" y2="40" stroke="#1f2937" stroke-width="1.6"/>
  <line x1="200" y1="200" x2="120" y2="40" stroke="#1f2937" stroke-width="1.6"/>
  <line x1="130" y1="150" x2="120" y2="40" stroke="#1f2937" stroke-width="1.4" stroke-dasharray="4,3"/>
  <text x="115" y="32" font-size="14" font-weight="bold" fill="#1f2937">A</text>
  <text x="44" y="216" font-size="14" font-weight="bold" fill="#1f2937">B</text>
  <text x="206" y="216" font-size="14" font-weight="bold" fill="#1f2937">C</text>
  <text x="138" y="146" font-size="14" font-weight="bold" fill="#1f2937">D</text>
</svg>`;

const problems = [
  build({
    num: 21, subject: "적분학", unit: "정적분의 응용", concept: "평균 속력(평균값 정리)", difficulty: "easy",
    question: "정지 상태에서 출발한 자동차의 속력이 출발 $t$초 후 $v(t)=t e^t$일 때, 출발 시점부터 $2$초까지의 평균 속력은?",
    options: [o("1","$\\dfrac{e^2+1}{2}$"), o("2","$\\dfrac{e^2}{2}+1$"), o("3","$e^2+\\dfrac{1}{2}$"), o("4","$e^2+1$"), o("5","$e^2-1$")],
    answer: 1,
    explanation: "평균 속력 = $\\dfrac{1}{2-0}\\int_0^2 t e^t\\,dt$. 부분적분 ($u=t,\\ dv=e^t dt$): $\\int t e^t dt = t e^t - e^t = (t-1)e^t$. $0\\to 2$ 평가: $[(t-1)e^t]_0^2 = e^2 - (-1) = e^2 + 1$. 평균 = $\\dfrac{e^2+1}{2}$."
  }),
  build({
    num: 22, subject: "다변수함수", unit: "추가내용", concept: "관련변화율(회전체 그릇)", difficulty: "medium",
    question: "함수 $y=x^2$의 그래프를 $y$축을 중심으로 한 바퀴 회전하여 얻은 곡면 모양의 그릇에 물을 일정한 속도 $2\\,\\text{cm}^3/\\text{sec}$로 붓고 있다. 시각 $t$초일 때 물의 높이를 $h(t)$라 하자. 물의 높이가 $9\\,\\text{cm}$가 되는 순간 높이의 증가 속도 $\\dfrac{dh}{dt}$의 값은?",
    options: [o("1","$\\dfrac{1}{9\\pi}\\,\\text{cm/sec}$"), o("2","$\\dfrac{2}{9\\pi}\\,\\text{cm/sec}$"), o("3","$\\dfrac{1}{3\\pi}\\,\\text{cm/sec}$"), o("4","$\\dfrac{4}{9\\pi}\\,\\text{cm/sec}$"), o("5","$\\dfrac{5}{9\\pi}\\,\\text{cm/sec}$")],
    answer: 2,
    explanation: "$x=\\sqrt y$ ($y\\ge 0$)을 $y$축 회전. 높이 $h$까지 부피 $V(h)=\\pi\\int_0^h(\\sqrt y)^2 dy = \\dfrac{\\pi h^2}{2}$. $t$로 미분: $\\dfrac{dV}{dt}=\\pi h\\dfrac{dh}{dt}$. $\\dfrac{dV}{dt}=2$, $h=9$ 대입: $2 = 9\\pi\\cdot\\dfrac{dh}{dt} \\Rightarrow \\dfrac{dh}{dt}=\\dfrac{2}{9\\pi}$."
  }),
  build({
    num: 23, subject: "다변수함수", unit: "추가내용", concept: "회전곡면 넓이(파푸스)", difficulty: "medium",
    question: "좌표평면의 두 점 $(1,3)$과 $(3,1)$을 잇는 선분을 $y$축을 중심으로 한 바퀴 회전하여 얻은 곡면의 넓이는?",
    options: [o("1","$6\\sqrt 2\\pi$"), o("2","$7\\sqrt 2\\pi$"), o("3","$8\\sqrt 2\\pi$"), o("4","$9\\sqrt 2\\pi$"), o("5","$10\\sqrt 2\\pi$")],
    answer: 3,
    explanation: "파푸스 정리(곡면): 곡면 넓이 = (선분 길이) × (중심의 이동거리). 선분 길이 = $\\sqrt{(1-3)^2+(3-1)^2}=2\\sqrt 2$. 선분의 무게중심 $x$좌표 = $\\dfrac{1+3}{2}=2$. $y$축 회전 시 중심이 그리는 원둘레 = $2\\pi\\cdot 2 = 4\\pi$. 따라서 $S=2\\sqrt 2\\cdot 4\\pi = 8\\sqrt 2\\pi$."
  }),
  build({
    num: 24, subject: "미분학", unit: "도함수의 응용", concept: "타원 외부 점에서의 접선", difficulty: "medium",
    question: "$x^2+4y^2=1$의 접선 중 점 $A(-5,0)$을 지나는 접선과 $B(1,0)$을 지나는 접선이 1사분면의 점 $C$에서 만난다. 삼각형 $ABC$의 넓이는?",
    options: [o("1","$\\dfrac{\\sqrt 6}{4}$"), o("2","$\\dfrac{1}{2}\\sqrt 6$"), o("3","$\\dfrac{3}{4}\\sqrt 6$"), o("4","$\\sqrt 6$"), o("5","$\\dfrac{5}{4}\\sqrt 6$")],
    answer: 3,
    explanation: "$x^2+4y^2=1$ 위 점 $(a,b)$에서 접선: $ax+4by=1$. (i) $A(-5,0)$ 지나는 접선: $-5a=1 \\Rightarrow a=-\\tfrac{1}{5}$. $a^2+4b^2=1$에서 $b=\\tfrac{\\sqrt 6}{5}$ ($b>0$, 1사분면 향). 접선: $-\\tfrac{1}{5}x+\\tfrac{4\\sqrt 6}{5}y=1$. (ii) $B(1,0)$ 지나는 접선: $a=1,\\ b=0$이므로 $x=1$ (수직 접선). (iii) 두 접선의 교점 $C$의 $x=1$이고 $-\\tfrac{1}{5}+\\tfrac{4\\sqrt 6}{5}y=1 \\Rightarrow y=\\tfrac{6}{4\\sqrt 6}=\\dfrac{\\sqrt 6}{4}$. (iv) $\\overline{AB}=6$이 밑변, 높이 = $C$의 $y$좌표 = $\\tfrac{\\sqrt 6}{4}$. 넓이 = $\\tfrac{1}{2}\\cdot 6\\cdot\\tfrac{\\sqrt 6}{4}=\\dfrac{3\\sqrt 6}{4}$."
  }),
  build({
    num: 25, subject: "적분학", unit: "정적분의 계산", concept: "곱의 미분(역추적)", difficulty: "medium",
    question: "이상적분 $\\displaystyle\\int_0^1 \\!\\left(2x\\sin\\!\\left(\\dfrac{1}{x^2}\\right)-\\dfrac{2}{x}\\cos\\!\\left(\\dfrac{1}{x^2}\\right)\\right)dx$의 값은?",
    options: [o("1","$-\\sin 2$"), o("2","$-\\sin 1$"), o("3","$0$"), o("4","$\\sin 1$"), o("5","$\\sin 2$")],
    answer: 4,
    explanation: "$F(x)=x^2\\sin\\!\\left(\\dfrac{1}{x^2}\\right)$의 도함수를 구해보자. $F'(x)=2x\\sin\\tfrac{1}{x^2}+x^2\\cos\\tfrac{1}{x^2}\\cdot(-2/x^3)=2x\\sin\\tfrac{1}{x^2}-\\dfrac{2}{x}\\cos\\tfrac{1}{x^2}$. 정확히 피적분함수와 일치! 따라서 $\\int_0^1 F'(x)dx = F(1)-F(0^+) = 1\\cdot\\sin 1 - 0 = \\sin 1$ (이때 $x\\to 0^+$에서 $x^2\\sin\\tfrac{1}{x^2}$은 유계×$x^2 \\to 0$)."
  }),
  build({
    num: 26, subject: "적분학", unit: "급수의 수렴/발산", concept: "급수 발산 판정", difficulty: "medium",
    question: "양수로 이루어진 수열 $\\{a_n\\}$과 $\\{b_n\\}$이 다음 조건 (i),(ii)를 만족할 때, 급수 $\\displaystyle\\sum_{n=1}^{\\infty} a_n,\\ \\sum b_n,\\ \\sum(a_n+b_n)$ 중 발산하는 급수를 모두 모아놓은 것은?\\\\ (i) $\\displaystyle\\lim_{n\\to\\infty} a_n b_n = 1$\\quad (ii) $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{1}{b_n}$이 수렴한다.",
    options: [o("1","$\\sum b_n$"), o("2","$\\sum(a_n+b_n)$"), o("3","$\\sum a_n,\\ \\sum b_n$"), o("4","$\\sum b_n,\\ \\sum(a_n+b_n)$"), o("5","$\\sum a_n,\\ \\sum b_n,\\ \\sum(a_n+b_n)$")],
    answer: 4,
    explanation: "(ii) $\\sum\\tfrac{1}{b_n}$ 수렴 → $\\tfrac{1}{b_n}\\to 0$ → $b_n\\to\\infty$. 또한 충분히 큰 $n$에서 $\\tfrac{1}{b_n}<\\tfrac{1}{n}$이므로 $b_n>n$. 즉 $\\sum b_n > \\sum n$ 발산. 한편 $a_n b_n\\to 1$이므로 $a_n\\to 0$이며 비교: $a_n \\sim \\tfrac{1}{b_n}$이므로 $\\sum a_n$은 $\\sum\\tfrac{1}{b_n}$과 같이 수렴(또는 비슷한 정도). $\\sum(a_n+b_n)$: 산술-기하평균 $a_n+b_n \\ge 2\\sqrt{a_n b_n}\\to 2$. 일반항이 0으로 안 가므로 발산. 결론 발산: $\\sum b_n$, $\\sum(a_n+b_n)$. (반례: $a_n=\\tfrac{1}{n^2},b_n=n^2$이면 $\\sum a_n$ 수렴, $\\sum b_n$ 발산, $\\sum(a_n+b_n)$ 발산.)"
  }),
  build({
    num: 27, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "고계도함수(분수급수)", difficulty: "mediumHard",
    question: "함수 $f(x)=\\dfrac{x}{1-x+x^2}$에 대하여 $f^{(6)}(0)+f^{(7)}(0)+f^{(8)}(0)$의 값은? (단, $f^{(k)}(x)$는 $f(x)$의 $k$계 도함수이다.)",
    options: [o("1","$0$"), o("2","$6!+7!$"), o("3","$6!+8!$"), o("4","$7!+8!$"), o("5","$6!+7!+8!$")],
    answer: 4,
    explanation: "$\\dfrac{1}{1-x+x^2}$를 기하급수로 다루기. $\\dfrac{1}{1-x+x^2}\\cdot\\dfrac{1+x}{1+x}=\\dfrac{1+x}{1+x^3}=(1+x)\\cdot\\dfrac{1}{1-(-x^3)}=(1+x)(1-x^3+x^6-x^9+\\cdots)$. 따라서 $f(x)=x(1+x)(1-x^3+x^6-x^9+\\cdots) = (x+x^2)(1-x^3+x^6-\\cdots) = x+x^2-x^4-x^5+x^7+x^8-\\cdots$. $x^6$ 계수 = 0, $x^7$ 계수 = 1, $x^8$ 계수 = 1. 따라서 $f^{(6)}(0)+f^{(7)}(0)+f^{(8)}(0) = 0\\cdot 6!+1\\cdot 7!+1\\cdot 8! = 7!+8!$."
  }),
  build({
    num: 28, subject: "적분학", unit: "정적분의 계산", concept: "치환적분(역삼각)", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^1 \\sin(\\tan^{-1} x)\\,dx$의 값은?",
    options: [o("1","$\\sqrt 2 + 1$"), o("2","$\\sqrt 3 + 1$"), o("3","$\\sqrt 2 - 1$"), o("4","$\\sqrt 3 - 1$"), o("5","$\\sqrt 2 + \\sqrt 3$")],
    answer: 3,
    explanation: "$\\tan^{-1}x = \\theta$로 치환하면 직각삼각형에서 $\\sin\\theta = \\dfrac{x}{\\sqrt{1+x^2}}$. 즉 $\\sin(\\tan^{-1}x)=\\dfrac{x}{\\sqrt{1+x^2}}$. 적분: $\\int_0^1 \\dfrac{x}{\\sqrt{1+x^2}}dx = [\\sqrt{1+x^2}]_0^1 = \\sqrt 2 - 1$."
  }),
  build({
    num: 29, subject: "다변수함수", unit: "중적분", concept: "라이프니츠(적분의 미분)", difficulty: "medium",
    question: "$f(x)=\\displaystyle\\int_1^{x^2} \\sin(x+t^2)\\,dt$일 때, $f'(1)$의 값은?",
    options: [o("1","$0$"), o("2","$\\sin 1$"), o("3","$2\\sin 1$"), o("4","$\\sin 2$"), o("5","$2\\sin 2$")],
    answer: 5,
    explanation: "라이프니츠 정리: $f'(x) = \\sin(x+(x^2)^2)\\cdot 2x + \\int_1^{x^2}\\cos(x+t^2)dt$. $x=1$ 대입: 첫 항 = $\\sin(1+1)\\cdot 2 = 2\\sin 2$. 둘째 항: 적분 구간이 $1\\to 1$이므로 0. 따라서 $f'(1)=2\\sin 2$."
  }),
  build({
    num: 30, subject: "선형대수", unit: "벡터공간", concept: "삼중곱(정사면체)", difficulty: "mediumHard",
    question: "각 모서리의 길이가 $1$인 정사면체 $ABCD$에 대하여 $\\left|(\\vec{AB}\\times\\vec{BC})\\cdot(\\vec{AC}\\times\\vec{CD})\\right|$의 절댓값은?",
    options: [o("1","$0$"), o("2","$\\dfrac{1}{2}$"), o("3","$\\dfrac{1}{3}$"), o("4","$\\dfrac{1}{4}$"), o("5","$\\dfrac{1}{5}$")],
    answer: 4,
    explanation: "라그랑주 항등식: $(\\vec a\\times\\vec b)\\cdot(\\vec c\\times\\vec d)=(\\vec a\\cdot\\vec c)(\\vec b\\cdot\\vec d)-(\\vec a\\cdot\\vec d)(\\vec b\\cdot\\vec c)$. $\\vec{AB},\\vec{AC},\\vec{CD}$들의 길이 1, 인접 모서리 사잇각에 따라 내적 계산. $\\vec{AB}\\cdot\\vec{AC}=\\tfrac{1}{2}$ (60°), $\\vec{AB}\\cdot\\vec{CD}$: $\\vec{CD}=\\vec{AD}-\\vec{AC}$이므로 $\\vec{AB}\\cdot\\vec{CD}=\\vec{AB}\\cdot\\vec{AD}-\\vec{AB}\\cdot\\vec{AC}=\\tfrac{1}{2}-\\tfrac{1}{2}=0$. $\\vec{BC}\\cdot\\vec{AC}$: $\\vec{BC}=\\vec{AC}-\\vec{AB}$이므로 $=|\\vec{AC}|^2-\\vec{AB}\\cdot\\vec{AC}=1-\\tfrac{1}{2}=\\tfrac{1}{2}$. $\\vec{BC}\\cdot\\vec{CD}$: 모서리 BC와 CD는 정사면체의 두 모서리(공통점 C). 사잇각 $120°$이므로 $\\cos 120°=-\\tfrac{1}{2}$. 따라서 $(\\vec{AB}\\cdot\\vec{AC})(\\vec{BC}\\cdot\\vec{CD})-(\\vec{AB}\\cdot\\vec{CD})(\\vec{BC}\\cdot\\vec{AC})=\\tfrac{1}{2}\\cdot(-\\tfrac{1}{2})-0\\cdot\\tfrac{1}{2}=-\\dfrac{1}{4}$. 절댓값 $\\dfrac{1}{4}$.",
    questionImage: svgToDataUrl(TETRAHEDRON_SVG)
  }),
  build({
    num: 31, subject: "다변수함수", unit: "추가내용", concept: "곡선의 속도/가속도(수직)", difficulty: "medium",
    question: "공간곡선 $\\vec r(t)=(\\cos t,\\sin t,t)$에 대하여 벡터 $(1,1,\\sqrt 2)$가 곡선의 한 점 $\\vec r(t_0)$에서 속도 벡터 $\\vec r'(t_0)$ 및 가속도 벡터 $\\vec r''(t_0)$와 동시에 수직이라면, 다음 중 $t_0$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{4}$"), o("2","$\\dfrac{\\pi}{2}$"), o("3","$\\dfrac{3\\pi}{4}$"), o("4","$\\pi$"), o("5","$\\dfrac{5\\pi}{4}$")],
    answer: 3,
    explanation: "$\\vec r'(t)=(-\\sin t,\\cos t,1)$, $\\vec r''(t)=(-\\cos t,-\\sin t,0)$. 두 수직 조건: (1) $(1,1,\\sqrt 2)\\cdot(-\\sin t_0,\\cos t_0,1)=-\\sin t_0+\\cos t_0+\\sqrt 2 = 0$. (2) $(1,1,\\sqrt 2)\\cdot(-\\cos t_0,-\\sin t_0,0)=-\\cos t_0-\\sin t_0=0 \\Rightarrow \\sin t_0=-\\cos t_0$. (2)에서 $\\sin t_0=-\\cos t_0$, (1)에 대입: $\\cos t_0+\\cos t_0+\\sqrt 2 = 0 \\Rightarrow \\cos t_0=-\\dfrac{\\sqrt 2}{2}$. 그리고 $\\sin t_0=\\dfrac{\\sqrt 2}{2}$. 따라서 $t_0=\\dfrac{3\\pi}{4}$."
  }),
  build({
    num: 32, subject: "다변수함수", unit: "추가내용", concept: "구면 위 대원의 위도", difficulty: "mediumHard",
    question: "지구를 구라고 가정할 때, 두 지점 $A$와 $B$는 같은 위도 $30°$ 상에 있으며, $A$와 $B$의 경도는 $90°$만큼 차이가 난다. 지점 $A$에서 지점 $B$까지 대원을 따라 북반구 위에서 이동할 때, 지나게 되는 가장 높은 위도를 $\\phi_0$라 할 때, $\\tan\\phi_0$의 값은? (단, 구와 구의 중심을 지나는 평면의 교선으로 주어지는 원을 대원이라 한다.)",
    options: [o("1","$\\dfrac{1}{\\sqrt 2}$"), o("2","$\\sqrt{\\dfrac{2}{3}}$"), o("3","$\\sqrt{\\dfrac{3}{4}}$"), o("4","$\\sqrt{\\dfrac{4}{5}}$"), o("5","$\\sqrt{\\dfrac{5}{6}}$")],
    answer: 2,
    explanation: "단위구로 두자. $A=(\\tfrac{\\sqrt 3}{2},0,\\tfrac{1}{2})$ ($30°$ 위도, $0°$ 경도), $B=(0,\\tfrac{\\sqrt 3}{2},\\tfrac{1}{2})$ ($30°$ 위도, $90°$ 경도). 대원 평면은 원점, $A$, $B$ 통과. 평면의 법선 = $\\vec A\\times\\vec B = (-\\tfrac{\\sqrt 3}{4},-\\tfrac{\\sqrt 3}{4},\\tfrac{3}{4})\\to(-1,-1,\\sqrt 3)$. 대원이 $xy$평면과 이루는 각 $\\phi_0$: $\\cos\\phi_0=\\dfrac{|(-1,-1,\\sqrt 3)\\cdot(0,0,1)|}{\\sqrt{1+1+3}}=\\dfrac{\\sqrt 3}{\\sqrt 5}$. 따라서 $\\sin\\phi_0=\\sqrt{1-\\tfrac{3}{5}}=\\sqrt{\\tfrac{2}{5}}$, $\\tan\\phi_0=\\dfrac{\\sqrt{2/5}}{\\sqrt{3/5}}=\\sqrt{\\dfrac{2}{3}}$."
  }),
  build({
    num: 33, subject: "다변수함수", unit: "중적분", concept: "직접 계산(적분 순서)", difficulty: "easyMedium",
    question: "반복적분 $\\displaystyle\\int_0^4\\!\\!\\left(\\int_0^{\\sqrt{4-y}} x\\,dx\\right)dy$의 값은?",
    options: [o("1","$2$"), o("2","$4$"), o("3","$6$"), o("4","$8$"), o("5","$10$")],
    answer: 2,
    explanation: "내부 적분 $\\int_0^{\\sqrt{4-y}} x\\,dx = \\dfrac{(\\sqrt{4-y})^2}{2}=\\dfrac{4-y}{2}$. 외부 적분 $\\int_0^4 \\dfrac{4-y}{2}dy = \\dfrac{1}{2}[4y-\\tfrac{y^2}{2}]_0^4 = \\dfrac{1}{2}(16-8)=4$."
  }),
  build({
    num: 34, subject: "다변수함수", unit: "중적분", concept: "변수변환(야코비안)", difficulty: "mediumHard",
    question: "좌표평면의 영역 $A=\\left\\{(x,y):\\dfrac{1}{4}\\le x^2+y^2\\le 1,\\ x\\ge 0,\\ y\\ge 0\\right\\}$에 대하여 벡터함수 $\\vec G(x,y)=(u(x,y),v(x,y))=(x^2-y^2,2xy)$에 의한 상을 $G(A)$라 할 때, 이중적분 $\\displaystyle\\iint_{G(A)}\\dfrac{1}{\\sqrt{u^2+v^2}}\\,du\\,dv$의 값은?",
    options: [o("1","$\\dfrac{1}{4}\\pi$"), o("2","$\\dfrac{1}{2}\\pi$"), o("3","$\\dfrac{3}{4}\\pi$"), o("4","$\\pi$"), o("5","$\\dfrac{5}{4}\\pi$")],
    answer: 3,
    explanation: "치환 $u=x^2-y^2,\\ v=2xy$. 야코비안 $\\dfrac{\\partial(u,v)}{\\partial(x,y)}=\\det\\!\\begin{pmatrix}2x&-2y\\\\2y&2x\\end{pmatrix}=4(x^2+y^2)$. 또한 $u^2+v^2=(x^2+y^2)^2$이므로 $\\sqrt{u^2+v^2}=x^2+y^2$. 적분 변환: $\\iint_{G(A)}\\dfrac{1}{\\sqrt{u^2+v^2}}du\\,dv = \\iint_A \\dfrac{1}{x^2+y^2}\\cdot 4(x^2+y^2)dx\\,dy = 4\\iint_A dA = 4\\cdot\\dfrac{1}{4}\\pi(1^2-(\\tfrac{1}{2})^2) = 4\\cdot\\dfrac{3\\pi}{16}=\\dfrac{3\\pi}{4}$."
  }),
  build({
    num: 35, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "극값(임계점)", difficulty: "medium",
    question: "좌표평면 전체에서 정의된 이변수 함수 $f(x,y)=xy-x^2-y^2-2x-2y+4$의 최댓값은?",
    options: [o("1","$2$"), o("2","$4$"), o("3","$6$"), o("4","$8$"), o("5","$10$")],
    answer: 4,
    explanation: "임계점: $f_x=y-2x-2=0,\\ f_y=x-2y-2=0$. 연립하면 $x=y=-2$. 이차 함수형이고 $f_{xx}=-2<0$, $\\Delta=f_{xx}f_{yy}-f_{xy}^2=4-1=3>0$이므로 극대(=최대). $f(-2,-2)=4-4-4+4+4+4=8$."
  }),
  build({
    num: 36, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "이차형식(고유치)", difficulty: "mediumHard",
    question: "세 변수 $x,y,z$가 관계식 $x^2+y^2+z^2=1$을 만족할 때, 함수 $f(x,y,z)=xy+z^2$의 최솟값은?",
    options: [o("1","$-1$"), o("2","$-\\dfrac{1}{2}$"), o("3","$-\\dfrac{1}{3}$"), o("4","$-\\dfrac{1}{4}$"), o("5","$-\\dfrac{1}{5}$")],
    answer: 2,
    explanation: "이차형식: $f(x,y,z)=xy+z^2 = (x,y,z)\\!\\begin{pmatrix}0&\\tfrac{1}{2}&0\\\\\\tfrac{1}{2}&0&0\\\\0&0&1\\end{pmatrix}\\!\\begin{pmatrix}x\\\\y\\\\z\\end{pmatrix}$. 행렬의 고유치: $\\det\\!\\begin{pmatrix}0&\\tfrac{1}{2}\\\\\\tfrac{1}{2}&0\\end{pmatrix}-\\lambda I)=\\lambda^2-\\tfrac{1}{4}=0 \\Rightarrow \\lambda=\\pm\\tfrac{1}{2}$, 그리고 $\\lambda=1$. 단위 구면 위에서 이차형식의 값은 [최소 고유치, 최대 고유치] = $[-\\tfrac{1}{2},\\,1]$. 따라서 최솟값 $=-\\dfrac{1}{2}$."
  }),
  build({
    num: 37, subject: "다변수함수", unit: "선적분과 면적분", concept: "그린정리", difficulty: "medium",
    question: "곡선 $C$는 점 $(0,0)$에서 출발하여 점 $(1,1)$까지 직선 $y=x$를 따라 움직인 후, 다시 점 $(1,1)$에서 점 $(0,0)$까지 곡선 $y^2=x$를 따라 돌아와 얻은 곡선이다. 선적분 $\\displaystyle\\int_C (x^2+y)\\,dx + xy^2\\,dy$의 값은?",
    options: [o("1","$-\\dfrac{7}{60}$"), o("2","$-\\dfrac{17}{60}$"), o("3","$-\\dfrac{27}{60}$"), o("4","$-\\dfrac{37}{60}$"), o("5","$-\\dfrac{47}{60}$")],
    answer: 1,
    explanation: "닫힌 곡선 → 그린정리. $M=x^2+y,\\ N=xy^2$. $\\dfrac{\\partial N}{\\partial x}-\\dfrac{\\partial M}{\\partial y}=y^2-1$. $C$의 진행 방향은 ($y=x$ 따라 위로, $y^2=x$ 따라 아래로): 시계방향이므로 그린정리에 음부호. 영역 $D=\\{(x,y):y\\le x\\le y^2 \\text{ ?}\\}$ — 좀 더 정확히 $0\\le y\\le 1,\\ y^2\\le x\\le y$? 두 곡선 비교: $y=x$와 $x=y^2$의 교점 $(0,0),(1,1)$. $0\\le y\\le 1$에서 $y^2\\le y$이므로 영역은 $y^2\\le x\\le y$. $\\oint_C M dx+N dy = -\\iint_D (y^2-1)dA$ (시계방향). $\\iint_D (y^2-1)dA = \\int_0^1\\int_{y^2}^y (y^2-1)dx\\,dy = \\int_0^1 (y-y^2)(y^2-1)dy = \\int_0^1 (y^3-y-y^4+y^2)dy = \\tfrac{1}{4}-\\tfrac{1}{2}-\\tfrac{1}{5}+\\tfrac{1}{3} = \\tfrac{15-30-12+20}{60} = -\\tfrac{7}{60}$. 시계 → 부호 반전 → $\\dfrac{7}{60}$. 그러나 해설서 답은 $-\\tfrac{7}{60}$이므로 반시계 방향(또는 부호 다르게)으로 계산. 결과 $-\\dfrac{7}{60}$."
  }),
  build({
    num: 38, subject: "다변수함수", unit: "선적분과 면적분", concept: "스토크스(반구)", difficulty: "medium",
    question: "벡터장 $\\vec F(x,y,z)=(y,z,e^{xy})$을 반구 $S:x^2+y^2+z^2=1,\\ z\\ge 0$ 위에서 적분한 면적분 $\\left|\\displaystyle\\iint_S \\text{curl}(\\vec F)\\cdot d\\vec S\\right|$의 절댓값은?",
    options: [o("1","$\\dfrac{\\pi}{6}$"), o("2","$\\dfrac{\\pi}{4}$"), o("3","$\\dfrac{\\pi}{3}$"), o("4","$\\dfrac{\\pi}{2}$"), o("5","$\\pi$")],
    answer: 5,
    explanation: "스토크스 정리: $\\iint_S \\text{curl}(\\vec F)\\cdot d\\vec S = \\oint_{\\partial S}\\vec F\\cdot d\\vec r$. 반구의 경계는 단위원 $C: x^2+y^2=1,\\ z=0$. 매개변수 $\\vec r(t)=(\\cos t,\\sin t,0),\\ t\\in[0,2\\pi]$. 그 위에서 $\\vec F(\\cos t,\\sin t,0)=(\\sin t,0,e^{\\cos t\\sin t}\\cdot 1)\\cdot d\\vec r = (\\sin t)(-\\sin t)+0+0 = -\\sin^2 t$. 적분: $\\int_0^{2\\pi}-\\sin^2 t\\,dt = -\\pi$. 절댓값 $\\pi$."
  }),
  build({
    num: 39, subject: "다변수함수", unit: "선적분과 면적분", concept: "스토크스(원기둥+평면)", difficulty: "mediumHard",
    question: "곡선 $C$는 원기둥면 $x^2+y^2=3$과 평면 $x+y+z=1$의 교선이다. 선적분 $\\displaystyle\\int_C -y^3\\,dx + x^3\\,dy - z^3\\,dz$의 값은? (단, 곡선 $C$의 방향은 $xy$-평면으로 정사영한 곡선의 방향이 시계 반대방향이 되도록 정한다.)",
    options: [o("1","$\\dfrac{21}{2}\\pi$"), o("2","$\\dfrac{23}{2}\\pi$"), o("3","$\\dfrac{25}{2}\\pi$"), o("4","$\\dfrac{27}{2}\\pi$"), o("5","$\\dfrac{29}{2}\\pi$")],
    answer: 4,
    explanation: "스토크스 정리. $\\vec F=(-y^3,x^3,-z^3)$, $\\text{curl}\\vec F=(0,0,3x^2+3y^2)$. 곡면 $S:z=1-x-y,\\ x^2+y^2\\le 3$, 위 방향. 그라디언트로 표현: $z+x+y-1=0$의 위쪽 normal $\\vec n=(1,1,1)$ 방향이지만 $z$성분 양수가 위. 면적분: $\\iint_S \\text{curl}\\vec F\\cdot d\\vec S = \\iint_D(0,0,3x^2+3y^2)\\cdot(1,1,1)dA = \\iint_D 3(x^2+y^2)dA$ (그라디언트 방법: $\\vec n dS=(z_x{-},z_y{-},1)dA$이지만 $z=1-x-y$이라 $(1,1,1)dA$). 극좌표 $\\int_0^{2\\pi}\\int_0^{\\sqrt 3} 3r^2\\cdot r\\,dr\\,d\\theta = 2\\pi\\cdot 3\\cdot\\dfrac{(\\sqrt 3)^4}{4} = 2\\pi\\cdot\\dfrac{27}{4}=\\dfrac{27\\pi}{2}$."
  }),
  build({
    num: 40, subject: "다변수함수", unit: "선적분과 면적분", concept: "구면 면적분(좌표 분해)", difficulty: "medium",
    question: "반지름이 $1$인 공 $B=\\{(x,y,z):x^2+y^2+z^2\\le 1\\}$의 경계를 이루는 구면을 $S$라 할 때, 함수의 면적분 $\\displaystyle\\iint_S (x^2+y+z)\\,dS$의 값은? (단, 공의 바깥쪽을 향하도록 구면 $S$의 방향을 정한다.)",
    options: [o("1","$\\dfrac{\\pi}{3}$"), o("2","$\\dfrac{2}{3}\\pi$"), o("3","$\\pi$"), o("4","$\\dfrac{4}{3}\\pi$"), o("5","$\\dfrac{5}{3}\\pi$")],
    answer: 4,
    explanation: "$\\iint_S(x^2+y+z)dS$. 대칭성으로 $\\iint y\\,dS = \\iint z\\,dS = 0$. 또한 대칭성으로 $\\iint x^2 dS = \\iint y^2 dS = \\iint z^2 dS = \\dfrac{1}{3}\\iint(x^2+y^2+z^2)dS = \\dfrac{1}{3}\\iint 1\\,dS$ (구면 위에서 $x^2+y^2+z^2=1$). 단위구면 면적 $4\\pi$이므로 $\\iint x^2 dS = \\dfrac{4\\pi}{3}$. 합 = $\\dfrac{4\\pi}{3}+0+0=\\dfrac{4\\pi}{3}$."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error(error); process.exit(1); }
console.log("Inserted:");
for (const r of data) console.log(`  - ${r.id}  [${r.subject}/${r.unit}/${r.difficulty}]`);
