// Upload 2021년도 가천대 편입수학 기출 25문항 (4지선다)
// Usage: node scripts/upload_general_2021_gachon.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SCHOOL = "가천대"; const YEAR = "2021";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function svgToDataUrl(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation, questionImage }) {
  const id = `q-${YEAR}-gachon-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return {
    id, subject, unit, concept, difficulty,
    source_type: "imported", question, content_type: "latex",
    question_image: questionImage ?? null,
    options, correct_option_id: String(answer), explanation,
    explanation_content_type: "latex", explanation_image: null, tags,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  };
}

// 13번 그래프: 피스와이즈 선형 함수 y=f(x). (0,0)→(2,2)→(3,0)→(5,-2). 격자 + 축 라벨.
const PROBLEM_13_GRAPH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" width="320" height="240">
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="320" height="240" fill="url(#grid)"/>
  <!-- 좌표축 (원점 = (40, 120)) -->
  <line x1="20" y1="120" x2="310" y2="120" stroke="#374151" stroke-width="1.5" marker-end="url(#arr)"/>
  <line x1="40" y1="220" x2="40" y2="20" stroke="#374151" stroke-width="1.5" marker-end="url(#arr)"/>
  <defs>
    <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="#374151"/>
    </marker>
  </defs>
  <!-- 축 라벨 (1격자 = 40px = 1단위) -->
  <text x="80" y="135" font-size="12" fill="#374151" text-anchor="middle">1</text>
  <text x="120" y="135" font-size="12" fill="#374151" text-anchor="middle">2</text>
  <text x="160" y="135" font-size="12" fill="#374151" text-anchor="middle">3</text>
  <text x="200" y="135" font-size="12" fill="#374151" text-anchor="middle">4</text>
  <text x="240" y="135" font-size="12" fill="#374151" text-anchor="middle">5</text>
  <text x="32" y="84" font-size="12" fill="#374151" text-anchor="end">1</text>
  <text x="32" y="44" font-size="12" fill="#374151" text-anchor="end">2</text>
  <text x="32" y="164" font-size="12" fill="#374151" text-anchor="end">−1</text>
  <text x="32" y="204" font-size="12" fill="#374151" text-anchor="end">−2</text>
  <text x="305" y="115" font-size="13" fill="#374151" font-style="italic">x</text>
  <text x="48" y="28" font-size="13" fill="#374151" font-style="italic">y</text>
  <!-- y = f(x): (0,0)→(2,2)→(3,0)→(5,-2) 피스와이즈 -->
  <polyline points="40,120 120,40 160,120 240,200" fill="none" stroke="#0284c7" stroke-width="2.5"/>
  <text x="180" y="60" font-size="13" fill="#0284c7" font-weight="bold">y = f(x)</text>
</svg>`;

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "$1^{\\infty}$ 부정형", difficulty: "easyMedium",
    question: "극한 $\\displaystyle\\lim_{x\\to 0}(\\cosh x)^{1/x}$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$e$")],
    answer: 2,
    explanation: "$1^{\\infty}$ 꼴이라 $\\ln$ 사용.\n\n**1단계 — 변형.** $(\\cosh x)^{1/x}=\\exp\\!\\left(\\dfrac{\\ln\\cosh x}{x}\\right)$.\n\n**2단계 — 지수 극한.** $\\lim_{x\\to 0}\\dfrac{\\ln\\cosh x}{x}$. 분모 분자 $\\to 0$. 로피탈:\n\n$\\dfrac{\\sinh x/\\cosh x}{1}=\\tanh x\\to 0$.\n\n**3단계 — 결과.** $\\exp(0)=1$."
  }),
  build({
    num: 2, subject: "미분학", unit: "추가내용", concept: "역삼각함수 합성 미분", difficulty: "easyMedium",
    question: "함수 $f(x)=(\\arctan x)^2$에 대하여 $f'(-\\sqrt{3})$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{6}$"), o("2","$\\dfrac{\\pi}{12}$"), o("3","$-\\dfrac{\\pi}{6}$"), o("4","$-\\dfrac{\\pi}{12}$")],
    answer: 3,
    explanation: "**연쇄법칙.** $f'(x)=2\\arctan x\\cdot\\dfrac{1}{1+x^2}$.\n\n**$x=-\\sqrt 3$ 대입.** $\\arctan(-\\sqrt 3)=-\\dfrac{\\pi}{3}$. $1+x^2=4$.\n\n$f'(-\\sqrt 3)=2\\cdot\\!\\left(-\\dfrac{\\pi}{3}\\right)\\cdot\\dfrac{1}{4}=-\\dfrac{\\pi}{6}$."
  }),
  build({
    num: 3, subject: "적분학", unit: "정적분의 계산", concept: "삼각치환", difficulty: "medium",
    question: "$\\displaystyle\\int_1^2\\dfrac{\\sqrt{x^2-1}}{x}\\,dx$의 값은?",
    options: [o("1","$\\sqrt{3}-\\dfrac{\\pi}{3}$"), o("2","$\\sqrt{3}-\\dfrac{\\pi}{6}$"), o("3","$2\\sqrt{3}-\\dfrac{\\pi}{3}$"), o("4","$2\\sqrt{3}-\\dfrac{\\pi}{6}$")],
    answer: 1,
    explanation: "**1단계 — 치환.** $x=\\sec\\theta$, $dx=\\sec\\theta\\tan\\theta\\,d\\theta$. $x:1\\to 2$이면 $\\theta:0\\to\\dfrac{\\pi}{3}$.\n\n$\\sqrt{x^2-1}=\\tan\\theta$.\n\n**2단계 — 적분.** $\\!\\int\\dfrac{\\tan\\theta}{\\sec\\theta}\\cdot\\sec\\theta\\tan\\theta\\,d\\theta=\\!\\int\\tan^2\\theta\\,d\\theta=\\!\\int(\\sec^2\\theta-1)d\\theta=\\tan\\theta-\\theta$.\n\n**3단계 — 정적분.** $[\\tan\\theta-\\theta]_0^{\\pi/3}=\\sqrt 3-\\dfrac{\\pi}{3}$."
  }),
  build({
    num: 4, subject: "다변수함수", unit: "편도함수", concept: "음함수 접선", difficulty: "easyMedium",
    question: "점 $(1,2)$에서 곡선 $x^2+4xy+y^2=13$의 접선이 $x$축과 만나는 점의 좌표를 $(a,0)$이라 할 때, $a$의 값은?",
    options: [o("1","$\\dfrac{13}{5}$"), o("2","$\\dfrac{11}{5}$"), o("3","$\\dfrac{9}{5}$"), o("4","$\\dfrac{7}{5}$")],
    answer: 1,
    explanation: "**1단계 — 음함수 미분.** $F=x^2+4xy+y^2-13$. $\\dfrac{dy}{dx}=-\\dfrac{F_x}{F_y}=-\\dfrac{2x+4y}{4x+2y}$.\n\n$(1,2)$에서 $-\\dfrac{2+8}{4+4}=-\\dfrac{10}{8}=-\\dfrac{5}{4}$.\n\n**2단계 — 접선식.** $y-2=-\\dfrac{5}{4}(x-1)$.\n\n**3단계 — $x$절편.** $y=0$ 대입: $-2=-\\dfrac{5}{4}(x-1)$, $x-1=\\dfrac{8}{5}$, $x=\\dfrac{13}{5}$."
  }),
  build({
    num: 5, subject: "적분학", unit: "정적분의 정의", concept: "리만합", difficulty: "medium",
    question: "$\\displaystyle\\lim_{n\\to\\infty}\\dfrac{1+2\\sqrt{2}+\\cdots+n\\sqrt n}{n^2\\sqrt n}$의 값은?",
    options: [o("1","$\\dfrac{1}{10}$"), o("2","$\\dfrac{1}{5}$"), o("3","$\\dfrac{2}{5}$"), o("4","$\\dfrac{2}{3}$")],
    answer: 3,
    explanation: "**1단계 — 합의 형태 정리.** 분자 $=\\sum_{k=1}^n k\\sqrt k$. 분모 $n^2\\sqrt n=n^{5/2}$.\n\n$\\dfrac{1}{n^{5/2}}\\sum_{k=1}^n k\\sqrt k=\\sum_{k=1}^n\\dfrac{k\\sqrt k}{n\\cdot n^{3/2}}=\\dfrac{1}{n}\\sum_{k=1}^n\\!\\left(\\dfrac{k}{n}\\right)^{\\!3/2}$.\n\n**2단계 — 리만합.** $\\to\\!\\int_0^1 x^{3/2}\\,dx=\\!\\left[\\dfrac{2x^{5/2}}{5}\\right]_0^1=\\dfrac{2}{5}$."
  }),
  build({
    num: 6, subject: "다변수함수", unit: "추가내용", concept: "두 평면의 교선 + 점 통과", difficulty: "medium",
    question: "점 $(2,2,1)$를 지나고 두 평면 $x+y-z=2$와 $2x-y+3z=-1$의 교선을 포함하는 평면의 방정식이 $ax+by-9z=13$이다. $a+b$의 값은?",
    options: [o("1","$10$"), o("2","$11$"), o("3","$21$"), o("4","$22$")],
    answer: 2,
    explanation: "**핵심 — 평면다발.** 두 평면의 교선을 포함하는 평면은 $\\alpha(x+y-z-2)+\\beta(2x-y+3z+1)=0$ 형태.\n\n**1단계 — 점 대입.** $(2,2,1)$: $\\alpha(2+2-1-2)+\\beta(4-2+3+1)=\\alpha+6\\beta=0\\Rightarrow\\alpha=-6\\beta$.\n\n$\\beta=1,\\,\\alpha=-6$ 선택.\n\n**2단계 — 식 정리.** $-6(x+y-z-2)+(2x-y+3z+1)=0$ → $-4x-7y+9z+13=0$, 즉 $4x+7y-9z=13$.\n\n**3단계 — 계수.** $a=4,\\,b=7$. 합 $=11$."
  }),
  build({
    num: 7, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "수렴반경", difficulty: "medium",
    question: "멱급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\!\\left(1+\\dfrac{1}{n}\\right)^{\\!n^2}\\!x^n$의 수렴 반지름은?",
    options: [o("1","$\\dfrac{1}{e}$"), o("2","$1$"), o("3","$e$"), o("4","$\\infty$")],
    answer: 1,
    explanation: "**$n$승근 판정법.** $\\lim\\sqrt[n]{|a_n x^n|}=\\lim\\!\\left(1+\\dfrac{1}{n}\\right)^{\\!n}\\cdot|x|=e\\cdot|x|$.\n\n수렴 조건: $e|x|<1\\Rightarrow|x|<\\dfrac{1}{e}$.\n\n수렴반경 $=\\dfrac{1}{e}$."
  }),
  build({
    num: 8, subject: "선형대수", unit: "고유치와 대각화", concept: "선형변환 행렬과 고유값", difficulty: "easyMedium",
    question: "선형변환 $T:\\mathbb R^2\\to\\mathbb R^2$가 $T(x,y)=(20x-21y,\\,21y)$로 정의되었고 행렬 $A$가 $T\\mathbf v=A\\mathbf v$를 만족시킬 때, 행렬 $A$의 모든 고윳값의 합은?",
    options: [o("1","$-1$"), o("2","$20$"), o("3","$-21$"), o("4","$41$")],
    answer: 4,
    explanation: "**1단계 — 행렬 $A$.** $T(x,y)=(20x-21y,\\,21y)$이라 $A=\\begin{pmatrix}20&-21\\\\0&21\\end{pmatrix}$.\n\n**2단계 — 고유값의 합 = 트레이스.** $\\mathrm{tr}(A)=20+21=41$.\n\n(상삼각이라 고유값은 대각성분 $20,21$이고 합 $41$.)"
  }),
  build({
    num: 9, subject: "미분학", unit: "추가내용", concept: "유계구간 최댓값(평행이동)", difficulty: "medium",
    question: "구간 $[0,2]$에서 함수 $f(x)=\\dfrac{\\ln(1+x)}{(1+x)^2}$의 최댓값은?",
    options: [o("1","$\\dfrac{\\ln 2}{4}$"), o("2","$\\dfrac{\\ln 3}{9}$"), o("3","$\\dfrac{1}{2e}$"), o("4","$\\dfrac{1}{e}$")],
    answer: 3,
    explanation: "**1단계 — 평행이동.** $u=1+x$로 두면 $u\\in[1,3]$이고 $g(u)=\\dfrac{\\ln u}{u^2}$.\n\n**2단계 — 임계점.** $g'(u)=\\dfrac{u-2u\\ln u}{u^4}=\\dfrac{1-2\\ln u}{u^3}=0\\Rightarrow\\ln u=\\dfrac{1}{2}\\Rightarrow u=\\sqrt e\\approx 1.65$.\n\n**3단계 — 함숫값 비교.**\n\n$g(1)=0$, $g(3)=\\dfrac{\\ln 3}{9}\\approx 0.122$.\n\n$g(\\sqrt e)=\\dfrac{1/2}{e}=\\dfrac{1}{2e}\\approx 0.184$.\n\n최댓값 $=\\dfrac{1}{2e}$."
  }),
  build({
    num: 10, subject: "적분학", unit: "정적분의 응용", concept: "심장형 + 원 영역 차", difficulty: "medium",
    question: "심장선 $r=2+2\\sin\\theta$의 내부와 원 $r=4\\sin\\theta$의 외부에 놓인 영역의 넓이는?",
    options: [o("1","$\\pi$"), o("2","$2\\pi$"), o("3","$\\dfrac{2}{5}\\pi$"), o("4","$\\dfrac{4}{7}\\pi$")],
    answer: 2,
    explanation: "**1단계 — 두 곡선의 형태.** 심장선 $r=2+2\\sin\\theta$의 면적 $=\\dfrac{3}{2}\\pi a^2=\\dfrac{3}{2}\\pi\\cdot 4=6\\pi$.\n\n원 $r=4\\sin\\theta$는 직교좌표로 $x^2+(y-2)^2=4$, 반지름 $2$의 원이라 면적 $=4\\pi$.\n\n**2단계 — 교점.** $2+2\\sin\\theta=4\\sin\\theta$이라 $\\sin\\theta=1$, $\\theta=\\pi/2$. 그리고 원점($\\theta=0,\\pi$).\n\n**3단계 — 영역 분석.** 원 $r=4\\sin\\theta$가 심장선 안에 완전히 포함되어 있음. 따라서 \"심장선 내부 + 원 외부\" = 심장선 면적 - 원 면적 = $6\\pi-4\\pi=2\\pi$."
  }),
  build({
    num: 11, subject: "다변수함수", unit: "체적과 곡면적", concept: "회전곡면 넓이(매개)", difficulty: "medium",
    question: "곡선 $x=5\\cos^3 t,\\,y=5\\sin^3 t\\,\\!\\left(0\\le t\\le\\dfrac{\\pi}{2}\\right)$을 $x$축을 중심으로 회전해서 생기는 회전곡면의 넓이는?",
    options: [o("1","$15\\pi$"), o("2","$20\\pi$"), o("3","$25\\pi$"), o("4","$30\\pi$")],
    answer: 4,
    explanation: "**공식.** $S=2\\pi\\!\\int y\\sqrt{(dx/dt)^2+(dy/dt)^2}\\,dt$.\n\n**1단계 — 도함수.** $x'=-15\\cos^2 t\\sin t$, $y'=15\\sin^2 t\\cos t$.\n\n$\\sqrt{x'^2+y'^2}=15\\sin t\\cos t\\sqrt{\\cos^2 t+\\sin^2 t}=15\\sin t\\cos t$.\n\n**2단계 — 적분.** $S=2\\pi\\!\\int_0^{\\pi/2}5\\sin^3 t\\cdot 15\\sin t\\cos t\\,dt=150\\pi\\!\\int_0^{\\pi/2}\\sin^4 t\\cos t\\,dt$.\n\n$u=\\sin t$ 치환: $150\\pi\\!\\int_0^1 u^4 du=150\\pi\\cdot\\dfrac{1}{5}=30\\pi$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "쌍곡선 위 최단거리", difficulty: "medium",
    question: "쌍곡선 $xy=8$의 점 중에서 점 $(3,0)$에 가장 가까운 점을 $(a,b)$라 할 때, $3a+b$의 값은?",
    options: [o("1","$14$"), o("2","$12$"), o("3","$11$"), o("4","$10$")],
    answer: 1,
    explanation: "**1단계 — 거리² 최소화.** $y=\\dfrac{8}{x}$ 대입: $d^2(x)=(x-3)^2+\\dfrac{64}{x^2}$.\n\n**2단계 — 미분.** $\\dfrac{d(d^2)}{dx}=2(x-3)-\\dfrac{128}{x^3}=\\dfrac{2(x^4-3x^3-64)}{x^3}=0$.\n\n$x^4-3x^3-64=0$. $x=4$ 시도: $256-192-64=0$ ✓.\n\n**3단계 — 점.** $x=4,\\,y=2$. $3a+b=12+2=14$."
  }),
  build({
    num: 13, subject: "적분학", unit: "정적분의 계산", concept: "$F(x)=\\int_0^{x^2}f(t)dt$ 미분", difficulty: "medium",
    question: "다음은 함수 $f$의 그래프이다. $F(x)=\\displaystyle\\int_0^{x^2}f(t)\\,dt$라 할 때, $F''(\\sqrt{3})$의 값은?",
    questionImage: svgToDataUrl(PROBLEM_13_GRAPH),
    options: [o("1","$-2$"), o("2","$-12$"), o("3","$-24$"), o("4","$-72$")],
    answer: 3,
    explanation: "**1단계 — $F'(x)$.** $F(x)=\\!\\int_0^{x^2}f(t)dt$이라 $F'(x)=f(x^2)\\cdot 2x$.\n\n**2단계 — $F''(x)$.** 곱의 미분 + 합성:\n\n$F''(x)=2f(x^2)+2x\\cdot f'(x^2)\\cdot 2x=2f(x^2)+4x^2 f'(x^2)$.\n\n**3단계 — $x=\\sqrt 3$ 대입.** $x^2=3$이라 $f(3)$, $f'(3)$ 필요.\n\n그래프에서 점 $(3,0)$이 곡선 위에 있고 그 부근 기울기 $-2$. 즉 $f(3)=0,\\,f'(3)=-2$.\n\n$F''(\\sqrt 3)=2\\cdot 0+4\\cdot 3\\cdot(-2)=-24$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "경도 및 방향도함수", concept: "최대 변화율 = 경도 크기", difficulty: "easyMedium",
    question: "점 $(2,1)$에서 함수 $f(x,y)=x^2 y+\\sqrt{y}$의 값이 가장 빨리 증가하는 방향의 단위벡터를 $\\mathbf u$라 할 때, 방향도함수 $D_{\\mathbf u}f(2,1)$의 값은?",
    options: [o("1","$\\dfrac{17}{2}$"), o("2","$7$"), o("3","$\\dfrac{\\sqrt{155}}{2}$"), o("4","$\\dfrac{\\sqrt{145}}{2}$")],
    answer: 4,
    explanation: "**핵심.** 가장 빨리 증가 → 그 방향 단위벡터는 경도 방향 정규화이고, 그때 방향도함수 값 = $\\|\\nabla f\\|$.\n\n**1단계 — 경도.** $f_x=2xy$, $f_y=x^2+\\dfrac{1}{2\\sqrt y}$. $(2,1)$에서 $f_x=4,\\,f_y=4+\\dfrac{1}{2}=\\dfrac{9}{2}$.\n\n**2단계 — 크기.** $\\|\\nabla f\\|=\\sqrt{16+\\dfrac{81}{4}}=\\sqrt{\\dfrac{145}{4}}=\\dfrac{\\sqrt{145}}{2}$."
  }),
  build({
    num: 15, subject: "선형대수", unit: "벡터공간", concept: "Rank 조건", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}-2&-2&4&6\\\\3&3&-6&-9\\\\-4&-4&4&4\\\\1&1&-2&\\alpha\\end{pmatrix}$의 행렬 계수(rank)가 $2$일 때, $\\alpha$의 값은?",
    options: [o("1","$-4$"), o("2","$-3$"), o("3","$-2$"), o("4","$-1$")],
    answer: 2,
    explanation: "**1단계 — 행 관찰.** $R_1=-2 R_4$ 형태로 비교: $-2\\cdot 1=-2,\\,-2\\cdot 1=-2,\\,-2\\cdot(-2)=4,\\,-2\\alpha$. 즉 $R_1$의 4성분 $6$과 일치하려면 $-2\\alpha=6\\Rightarrow\\alpha=-3$.\n\n또 $R_2=-3 R_4$: $-3,-3,6,-3\\alpha$이지만 $R_2=(3,3,-6,-9)$이라 부호 반대. $R_2=3 R_4$가 맞아야: $(3,3,-6,3\\alpha)=(3,3,-6,-9)$ → $\\alpha=-3$.\n\n또 $R_3=-4 R_4$: $(-4,-4,8,-4\\alpha)$이지만 $R_3=(-4,-4,4,4)$이라 일치 안 함. 다른 방법으로 행 사다리꼴.\n\n**핵심 결론:** 행 사다리꼴 변환 후 비영행이 정확히 2개가 되려면 $\\alpha=-3$이라 4행이 1행/2행과 비례."
  }),
  build({
    num: 16, subject: "다변수함수", unit: "편도함수", concept: "연쇄법칙", difficulty: "medium",
    question: "$w=xy+yz+zx,\\ x=r\\cos\\theta,\\ y=r\\sin\\theta,\\ z=r\\theta$일 때, $r=2,\\,\\theta=\\dfrac{\\pi}{2}$에서 $\\dfrac{\\partial w}{\\partial\\theta}$의 값은?",
    options: [o("1","$\\pi$"), o("2","$-\\pi$"), o("3","$2\\pi$"), o("4","$-2\\pi$")],
    answer: 4,
    explanation: "**1단계 — 편미분 (대칭).** $w_x=y+z$, $w_y=x+z$, $w_z=x+y$.\n\n**2단계 — $\\theta$에 대한 편미분.** $x_\\theta=-r\\sin\\theta$, $y_\\theta=r\\cos\\theta$, $z_\\theta=r$.\n\n**3단계 — 점에서 값.** $r=2,\\,\\theta=\\pi/2$: $x=0,\\,y=2,\\,z=\\pi$. $x_\\theta=-2,\\,y_\\theta=0,\\,z_\\theta=2$.\n\n$w_x=2+\\pi,\\,w_y=0+\\pi=\\pi,\\,w_z=0+2=2$.\n\n**4단계 — 연쇄법칙.** $w_\\theta=(2+\\pi)(-2)+\\pi\\cdot 0+2\\cdot 2=-4-2\\pi+4=-2\\pi$."
  }),
  build({
    num: 17, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "구면 위 곱 최대/최소(AM-GM)", difficulty: "mediumHard",
    question: "구면 $x^2+y^2+z^2=3$에서 정의된 함수 $f(x,y,z)=xyz$의 최댓값을 $a$, 최솟값을 $b$라 할 때, $ab$의 값은?",
    options: [o("1","$-4$"), o("2","$-1$"), o("3","$0$"), o("4","$1$")],
    answer: 2,
    explanation: "**1단계 — AM-GM.** $\\dfrac{x^2+y^2+z^2}{3}\\ge\\sqrt[3]{x^2 y^2 z^2}$. 좌변 $=1$이라 $1\\ge(xyz)^{2/3}$.\n\n양변 $3/2$승: $1\\ge(xyz)^2$, 즉 $|xyz|\\le 1$.\n\n**2단계 — 등호.** $x^2=y^2=z^2=1$일 때 $|xyz|=1$ 달성.\n\n최댓값 $a=1$ (예: $(1,1,1)$), 최솟값 $b=-1$ (예: $(-1,1,1)$).\n\n$ab=-1$."
  }),
  build({
    num: 18, subject: "선형대수", unit: "벡터공간", concept: "벡터 등식 진위", difficulty: "medium",
    question: "$\\mathbf u,\\mathbf v,\\mathbf w$가 $3$차원 공간 $\\mathbb R^3$의 벡터이고, $\\mathbf u$가 단위벡터일 때, 다음 $\\langle$보기$\\rangle$에서 옳은 것의 개수는?\n\n(가) $\\mathbf u\\cdot\\mathbf v=\\mathbf u\\cdot\\mathbf w$이고 $\\mathbf v,\\mathbf w$가 모두 단위벡터이면 $\\mathbf v=\\mathbf w$이다.\n\n(나) $\\mathbf u\\times\\mathbf v=\\mathbf u\\times\\mathbf w$이고 $\\mathbf v,\\mathbf w$가 모두 영벡터가 아니면 $\\mathbf v=\\mathbf w$이다.\n\n(다) $\\mathbf u\\cdot\\mathbf v=\\mathbf u\\cdot\\mathbf w$이고 $\\mathbf u\\times\\mathbf v=\\mathbf u\\times\\mathbf w$이면 $\\mathbf v=\\mathbf w$이다.",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$")],
    answer: 2,
    explanation: "(가) **거짓.** $\\mathbf u\\cdot(\\mathbf v-\\mathbf w)=0$만 의미. $\\mathbf v-\\mathbf w$가 $\\mathbf u$에 수직이면 됨. 단위벡터여도 두 가지 가능.\n\n(나) **거짓.** $\\mathbf u\\times(\\mathbf v-\\mathbf w)=0$만 의미. $\\mathbf v-\\mathbf w\\parallel\\mathbf u$이면 됨.\n\n(다) **참.** 두 조건 다 만족: $\\mathbf v-\\mathbf w$가 $\\mathbf u$에 수직 + 평행. 두 조건 동시에 만족하는 벡터는 $\\mathbf 0$밖에 없음. 따라서 $\\mathbf v=\\mathbf w$.\n\n참 1개."
  }),
  build({
    num: 19, subject: "다변수함수", unit: "선적분과 면적분", concept: "발산정리(구)", difficulty: "medium",
    question: "$S$가 단위 구면 $x^2+y^2+z^2=1$이고 $\\mathbf F(x,y,z)=(x^2\\sin y,\\,x\\cos y,\\,-xz\\sin y)$일 때, $\\displaystyle\\iint_S\\mathbf F\\cdot d\\mathbf S$의 값은?",
    options: [o("1","$-\\dfrac{3}{2}\\pi$"), o("2","$-\\pi$"), o("3","$-\\dfrac{3}{4}\\pi$"), o("4","$0$")],
    answer: 4,
    explanation: "**발산정리.** $\\iint_S\\mathbf F\\cdot d\\mathbf S=\\!\\iiint_T\\nabla\\cdot\\mathbf F\\,dV$.\n\n**1단계 — 발산.** $\\nabla\\cdot\\mathbf F=2x\\sin y+(-x\\sin y)+(-x\\sin y)=2x\\sin y-2x\\sin y=0$.\n\n**2단계 — 적분.** $0$의 적분 $=0$."
  }),
  build({
    num: 20, subject: "선형대수", unit: "행렬", concept: "행렬식 스칼라/특수형", difficulty: "medium",
    question: "$3\\times 3$ 행렬(차 정사각행렬) $A$의 행렬식이 $2$일 때, 다음 중 행렬식이 가장 큰 행렬은? (단, $A^{-1}$은 $A$의 역행렬, $A^T$은 $A$의 전치행렬, $\\mathrm{adj}A$는 $A$의 딸림(수반)행렬)",
    options: [o("1","$2A^{-1}$"), o("2","$(2A)^{-1}$"), o("3","$2A^T$"), o("4","$2(\\mathrm{adj}A)$")],
    answer: 4,
    explanation: "**핵심 공식.** $n\\times n$에서 $\\det(cM)=c^n\\det M$, $\\det A^{-1}=\\dfrac{1}{\\det A}$, $\\det A^T=\\det A$, $\\det(\\mathrm{adj}A)=(\\det A)^{n-1}$.\n\n각 보기:\n\n(1) $\\det(2A^{-1})=2^3\\cdot\\dfrac{1}{2}=4$.\n\n(2) $\\det((2A)^{-1})=\\dfrac{1}{2^3\\cdot 2}=\\dfrac{1}{16}$.\n\n(3) $\\det(2A^T)=2^3\\cdot 2=16$.\n\n(4) $\\det(2\\,\\mathrm{adj}A)=2^3\\cdot(\\det A)^2=8\\cdot 4=32$.\n\n최댓값: (4) $32$."
  }),
  build({
    num: 21, subject: "다변수함수", unit: "선적분과 면적분", concept: "Green 정리(원)", difficulty: "easyMedium",
    question: "$C$가 단위원일 때, $\\displaystyle\\oint_C(-2y)\\,dx+x^2\\,dy$의 값은?",
    options: [o("1","$0$"), o("2","$\\pi$"), o("3","$2\\pi$"), o("4","$4\\pi$")],
    answer: 3,
    explanation: "**Green 정리.** $\\oint(P\\,dx+Q\\,dy)=\\!\\iint_D(Q_x-P_y)dA$.\n\n$P=-2y$, $Q=x^2$. $Q_x=2x$, $P_y=-2$. 차 $=2x+2$.\n\n**적분.** $\\!\\iint_D(2x+2)dA$. 단위원 영역에서 $\\!\\iint x\\,dA=0$ (대칭). $\\!\\iint 2\\,dA=2\\pi$.\n\n결과 $=2\\pi$."
  }),
  build({
    num: 22, subject: "다변수함수", unit: "체적과 곡면적", concept: "타원면 + 원기둥 부피", difficulty: "mediumHard",
    question: "타원면 $4x^2+4y^2+z^2=16$ 안쪽과 기둥 $x^2+y^2=1$ 바깥에 놓인 입체의 부피는?",
    options: [o("1","$\\sqrt{3}\\pi$"), o("2","$2\\sqrt{3}\\pi$"), o("3","$4\\sqrt{3}\\pi$"), o("4","$8\\sqrt{3}\\pi$")],
    answer: 4,
    explanation: "**1단계 — 영역.** 타원면 $z^2=16-4x^2-4y^2$, 즉 $|z|\\le 2\\sqrt{4-x^2-y^2}$. 원기둥 $x^2+y^2\\ge 1$.\n\n원기둥 외부 ∩ 타원면 내부, 즉 $1\\le x^2+y^2\\le 4$ (왜냐 $4-x^2-y^2\\ge 0$).\n\n**2단계 — 부피.** $V=\\!\\iint_{1\\le r^2\\le 4}2\\cdot 2\\sqrt{4-r^2}\\,dA$.\n\n극좌표: $V=4\\!\\int_0^{2\\pi}\\!\\!\\int_1^2 r\\sqrt{4-r^2}\\,dr\\,d\\theta=8\\pi\\!\\int_1^2 r\\sqrt{4-r^2}\\,dr$.\n\n$u=4-r^2,\\,du=-2r\\,dr$: $-4\\pi\\!\\int_3^0\\sqrt u\\,du=4\\pi\\cdot\\dfrac{2}{3}\\cdot 3^{3/2}=8\\sqrt 3\\pi$."
  }),
  build({
    num: 23, subject: "공학수학", unit: "라플라스 변환", concept: "라플라스 역변환(시간이동)", difficulty: "medium",
    question: "함수 $f(t)$의 라플라스 변환이 $\\mathcal{L}\\{f\\}=\\dfrac{e^{-\\pi s}}{s^2+4}$일 때, $f\\!\\left(\\dfrac{5}{4}\\pi\\right)$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$\\dfrac{\\sqrt{3}}{2}$"), o("3","$1$"), o("4","$2$")],
    answer: 1,
    explanation: "**1단계 — 시간이동 정리.** $\\mathcal L^{-1}\\!\\left\\{e^{-as}G(s)\\right\\}=g(t-a)\\cdot u(t-a)$.\n\n여기서 $G(s)=\\dfrac{1}{s^2+4}$이라 $g(t)=\\dfrac{1}{2}\\sin 2t$.\n\n$f(t)=\\dfrac{1}{2}\\sin\\!\\left(2(t-\\pi)\\right)\\cdot u(t-\\pi)=\\dfrac{1}{2}\\sin(2t-2\\pi)\\cdot u(t-\\pi)=\\dfrac{1}{2}\\sin 2t\\cdot u(t-\\pi)$ ($t\\ge\\pi$일 때).\n\n**2단계 — 대입.** $t=\\dfrac{5\\pi}{4}>\\pi$이라 $u(t-\\pi)=1$.\n\n$f\\!\\left(\\dfrac{5\\pi}{4}\\right)=\\dfrac{1}{2}\\sin\\!\\left(\\dfrac{5\\pi}{2}\\right)=\\dfrac{1}{2}\\sin\\!\\left(\\dfrac{\\pi}{2}\\right)=\\dfrac{1}{2}$."
  }),
  build({
    num: 24, subject: "공학수학", unit: "미분방정식", concept: "변수분리형", difficulty: "medium",
    question: "$y=y(x)$가 미분방정식 $(1+e^{-y})\\sin x\\,dx-(1+\\cos x)\\,dy=0,\\ y(0)=0$의 해일 때, $y\\!\\left(\\dfrac{\\pi}{2}\\right)$의 값은?",
    options: [o("1","$\\ln 3$"), o("2","$\\ln 2$"), o("3","$0$"), o("4","$-\\ln 2$")],
    answer: 1,
    explanation: "**1단계 — 변수분리.** $\\dfrac{\\sin x}{1+\\cos x}dx=\\dfrac{1}{1+e^{-y}}dy=\\dfrac{e^y}{e^y+1}dy$.\n\n**2단계 — 적분.** 좌변 $=-\\ln(1+\\cos x)$. 우변 $=\\ln(e^y+1)$.\n\n$-\\ln(1+\\cos x)=\\ln(e^y+1)+C$ → $\\ln(1+\\cos x)+\\ln(e^y+1)=C'$.\n\n**3단계 — 초기조건.** $y(0)=0$, $x=0$: $\\ln 2+\\ln 2=2\\ln 2=C'$.\n\n$(1+\\cos x)(e^y+1)=4$.\n\n**4단계 — $x=\\pi/2$.** $\\cos(\\pi/2)=0$이라 $1\\cdot(e^y+1)=4$, $e^y=3$, $y=\\ln 3$."
  }),
  build({
    num: 25, subject: "다변수함수", unit: "중적분", concept: "적분순서 변경", difficulty: "medium",
    question: "$\\displaystyle\\int_0^1\\!\\!\\int_{\\sqrt{x}}^1\\dfrac{2xe^{y^2}}{y^3}\\,dy\\,dx$의 값은?",
    options: [o("1","$e$"), o("2","$\\dfrac{1}{2}e$"), o("3","$\\dfrac{1}{2}(e-1)$"), o("4","$\\dfrac{1}{4}(e-1)$")],
    answer: 3,
    explanation: "**1단계 — 영역.** $\\sqrt x\\le y\\le 1,\\,0\\le x\\le 1$ → $0\\le x\\le y^2,\\,0\\le y\\le 1$.\n\n**2단계 — 순서 변경.** $\\!\\int_0^1\\!\\!\\int_0^{y^2}\\dfrac{2xe^{y^2}}{y^3}dx\\,dy$.\n\n$x$ 적분 (안쪽): $\\dfrac{e^{y^2}}{y^3}\\!\\int_0^{y^2}2x\\,dx=\\dfrac{e^{y^2}}{y^3}\\cdot y^4=ye^{y^2}$.\n\n**3단계 — $y$ 적분.** $\\!\\int_0^1 ye^{y^2}dy$. $u=y^2$, $du=2y\\,dy$:\n\n$=\\dfrac{1}{2}\\!\\int_0^1 e^u du=\\dfrac{e-1}{2}$."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
console.log("Inserted:");
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
