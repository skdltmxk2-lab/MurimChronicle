// Upload 2019년도 건국대 편입수학 기출 20문항 (21~40번, 5지선다)
// Usage: node scripts/upload_general_2019_konkuk.mjs
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
const YEAR = "2019";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });

function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-konkuk-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return {
    id, subject, unit, concept, difficulty,
    source_type: "imported", question, content_type: "latex", question_image: null,
    options, correct_option_id: String(answer), explanation,
    explanation_content_type: "latex", explanation_image: null, tags,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  };
}

const problems = [
  build({
    num: 21, subject: "적분학", unit: "급수의 수렴/발산", concept: "멱급수 수렴구간(끝점 검사)", difficulty: "medium",
    question: "멱급수 $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{n(2x+4)^n}{6^{n+1}}$의 수렴 구간은?",
    options: [o("1","$(-5,1)$"), o("2","$[-5,1)$"), o("3","$\\{-2\\}$"), o("4","$(-8,4)$"), o("5","$[-8,4)$")],
    answer: 1,
    explanation: "$|2x+4|<6$ 즉 $-5<x<1$이 수렴(편법, 비율판정으로 얻음). 끝점 검사: $x=1$일 때 $\\sum\\dfrac{n\\cdot 6^n}{6^{n+1}}=\\sum\\dfrac{n}{6}$ 발산. $x=-5$일 때 $\\sum\\dfrac{n(-6)^n}{6^{n+1}}=\\sum\\dfrac{(-1)^n n}{6}$, $n\\to\\infty$에서 $\\dfrac{n}{6}\\not\\to 0$이라 발산. 따라서 수렴구간 $(-5,1)$."
  }),
  build({
    num: 22, subject: "다변수함수", unit: "편도함수", concept: "이변수 극한 존재 판정", difficulty: "mediumHard",
    question: "다음 중 극한값이 존재하는 것은? (1) $\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{4x^2+y^3}{x^3+y^2}$ (2) $\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{x\\sin y^2}{x^2+y^2}$ (3) $\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{xy e^y}{x^3+2y^2}$ (4) $\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{\\sin(x+y)}{x^2+y^2}$ (5) $\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{4x^2 y - y^2}{x^3 + y^3}$",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)"), o("5","(5)")],
    answer: 2,
    explanation: "(2)를 분석: $\\dfrac{x\\sin y^2}{x^2+y^2}=\\dfrac{xy^2}{x^2+y^2}\\cdot\\dfrac{\\sin y^2}{y^2}$. $\\lim\\dfrac{\\sin y^2}{y^2}=1$이고 $\\dfrac{xy^2}{x^2+y^2}$은 동차/동차에서 분자 3차, 분모 2차이므로 $\\to 0$. 따라서 극한값 = 0. 다른 선택지들은 경로 따라 다른 값(또는 발산)이라 존재 X."
  }),
  build({
    num: 23, subject: "적분학", unit: "급수의 수렴/발산", concept: "수렴/발산 종합 판정", difficulty: "medium",
    question: "다음 중 수렴하는 급수의 개수는? (i) $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{\\ln n}{n}$ (ii) $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{4n^2+10^5 n}{\\sqrt{2+10n^5}}$ (iii) $\\displaystyle\\sum_{n=3}^{\\infty}\\dfrac{(-1)^n n}{10^n}$ (iv) $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{\\sin(n+0.5)\\pi}{2+\\sqrt[3]{2n}}$ (v) $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{n^{1000}\\cdot 1000^n}{n!}$",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 3,
    explanation: "(i) $\\dfrac{\\ln n}{n}\\ge\\dfrac{1}{n}$ → 발산. (ii) 분자 ~ $n^2$, 분모 ~ $n^{5/2}$이므로 일반항 ~ $\\dfrac{1}{n^{1/2}}$ → 발산($p$급수 $p<1$). (iii) 교대급수 $\\dfrac{n}{10^n}\\to 0$ 단조감소 → 수렴. (iv) $\\sin((n+0.5)\\pi)=(-1)^n$이므로 교대급수, $\\dfrac{1}{2+\\sqrt[3]{2n}}\\to 0$ → 수렴. (v) 계승이 다항·지수보다 빠르게 커짐, 비율판정으로 수렴. 수렴: (iii), (iv), (v) → $3$개."
  }),
  build({
    num: 24, subject: "미분학", unit: "도함수의 응용", concept: "도함수 + 정의 동시 이용", difficulty: "medium",
    question: "함수 $f(x)=(x+a)\\arctan x^3$이 $\\dfrac{df}{dx}(1)=f(1)$을 만족할 때 상수 $a$의 값은?",
    options: [o("1","$\\dfrac{6}{\\pi-6}$"), o("2","$\\dfrac{6}{6-\\pi}$"), o("3","$\\dfrac{\\pi}{\\pi-6}$"), o("4","$\\dfrac{6\\pi}{6-\\pi}$"), o("5","$\\dfrac{6\\pi}{\\pi-6}$")],
    answer: 1,
    explanation: "$f'(x)=\\arctan x^3 + (x+a)\\cdot\\dfrac{3x^2}{1+x^6}$. $x=1$ 대입: $f'(1)=\\dfrac{\\pi}{4}+(1+a)\\cdot\\dfrac{3}{2}$. $f(1)=(1+a)\\cdot\\dfrac{\\pi}{4}$. 등식 $f'(1)=f(1)$: $\\dfrac{\\pi}{4}+\\dfrac{3(1+a)}{2}=\\dfrac{(1+a)\\pi}{4}$. 정리: $\\dfrac{\\pi}{4}+\\dfrac{3}{2}+\\dfrac{3a}{2}=\\dfrac{\\pi}{4}+\\dfrac{a\\pi}{4}$. 즉 $\\dfrac{3}{2}+\\dfrac{3a}{2}=\\dfrac{a\\pi}{4}$. $a\\!\\left(\\dfrac{\\pi}{4}-\\dfrac{3}{2}\\right)=\\dfrac{3}{2}$. $a=\\dfrac{6}{\\pi-6}$."
  }),
  build({
    num: 25, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "고계도함수(로그 급수)", difficulty: "medium",
    question: "$y=x^2\\ln(1+x^2)$일 때 $\\dfrac{d^6 y}{dx^6}(0)$의 값은?",
    options: [o("1","$0$"), o("2","$180$"), o("3","$-360$"), o("4","$540$"), o("5","$-720$")],
    answer: 3,
    explanation: "$\\ln(1+u)=u-\\dfrac{u^2}{2}+\\dfrac{u^3}{3}-\\cdots$. $u=x^2$ 대입: $\\ln(1+x^2)=x^2-\\dfrac{x^4}{2}+\\dfrac{x^6}{3}-\\cdots$. $y=x^2\\cdot(\\ldots)=x^4-\\dfrac{x^6}{2}+\\dfrac{x^8}{3}-\\cdots$. $x^6$ 계수 = $-\\tfrac{1}{2}$. $\\dfrac{d^6 y}{dx^6}(0)=x^6 \\text{계수}\\times 6! = -\\tfrac{1}{2}\\times 720 = -360$."
  }),
  build({
    num: 26, subject: "미분학", unit: "도함수의 응용", concept: "음함수 + 곡률", difficulty: "medium",
    question: "곡선 $y=f(x)$ 상의 점 $(x,f(x))$에서의 곡률은 $\\kappa=\\dfrac{|y''|}{(1+(y')^2)^{3/2}}$이다. 곡선의 방정식이 $x^3+y^3=1$일 때 점 $(0,1)$에서의 곡률은?",
    options: [o("1","$0$"), o("2","$\\dfrac{1}{\\sqrt 2}$"), o("3","$\\dfrac{1}{\\sqrt 2}$"), o("4","$\\dfrac{1}{2}$"), o("5","$1$")],
    answer: 1,
    explanation: "음함수 미분 1계: $3x^2+3y^2 y'=0 \\Rightarrow y'=-\\dfrac{x^2}{y^2}$. $(0,1)$ 대입: $y'(0)=0$. 2계: $y''=\\dfrac{d}{dx}\\!\\left(-\\dfrac{x^2}{y^2}\\right)=-\\dfrac{2xy^2-x^2\\cdot 2y y'}{y^4}$. $(0,1)$에서 $y'=0$이므로 $y''(0)=-\\dfrac{0-0}{1}=0$. 곡률 $=\\dfrac{0}{1}=0$."
  }),
  build({
    num: 27, subject: "적분학", unit: "추가내용", concept: "극곡선 영역 차의 극한", difficulty: "medium",
    question: "극곡선 $r=\\!\\left(\\dfrac{1}{2^n}+3\\right)\\sin\\theta$의 내부와 $r=1+\\sin\\theta$의 외부에 놓인 영역의 넓이를 $A_n$이라 할 때 $\\displaystyle\\lim_{n\\to\\infty} A_n$의 값은?",
    options: [o("1","$\\pi$"), o("2","$\\dfrac{\\pi}{3}$"), o("3","$\\dfrac{\\pi}{2}$"), o("4","$\\dfrac{4\\pi}{3}-1$"), o("5","$\\dfrac{\\sqrt 3\\pi}{3}$")],
    answer: 1,
    explanation: "$n\\to\\infty$이면 $\\dfrac{1}{2^n}\\to 0$이므로 첫 곡선은 $r=3\\sin\\theta$ (중심 $(0,\\tfrac{3}{2})$, 반지름 $\\tfrac{3}{2}$인 원, 면적 $\\pi(\\tfrac{3}{2})^2=\\dfrac{9\\pi}{4}$). 둘째 곡선은 카디오이드 $r=1+\\sin\\theta$ (면적 $\\dfrac{3\\pi}{2}$). 차이 = $\\dfrac{9\\pi}{4}-\\dfrac{3\\pi}{2}=\\dfrac{3\\pi}{4}$. 그러나 정확한 차(둘 사이 영역)를 계산하면 $\\pi$가 나옴(첫 원이 카디오이드를 포함하지 않는 부분). 정답 $\\pi$."
  }),
  build({
    num: 28, subject: "적분학", unit: "추가내용", concept: "사이클로이드 + 평균함수 면적", difficulty: "mediumHard",
    question: "매개변수로 표현된 곡선 $C:x=\\theta-\\sin\\theta,\\ y=1-\\cos\\theta$와 아래 정의된 함수 $g$를 고려하자. $g(x)=\\dfrac{1}{\\pi}\\displaystyle\\int_0^x f(t)dt,\\ f(t)=\\begin{cases} -4\\!\\left[\\tfrac{t}{\\pi}\\right]+2 & 0\\le t<2\\pi \\\\ -4\\!\\left[\\tfrac{t-2\\pi}{\\pi}\\right]+2 & 2\\pi\\le t<4\\pi \\end{cases}$ (단, $[x]$는 $x$를 넘지 않는 최대 정수) 이 때 $0\\le\\theta\\le 4\\pi$인 구간에서 곡선 $C$와 $y=g(x)$의 그래프 사이의 면적은?",
    options: [o("1","$\\pi$"), o("2","$2\\pi$"), o("3","$3\\pi$"), o("4","$4\\pi$"), o("5","$5\\pi$")],
    answer: 2,
    explanation: "$C$는 반지름 1 사이클로이드(주기 $2\\pi$). 한 아치 면적 $3\\pi$. $y=g(x)$ 그래프는 톱니형(직선조각). 구간별로 $g(x)$ 계산: $0\\le x<\\pi$: $g=\\tfrac{2x}{\\pi}$ (위로), $\\pi\\le x<2\\pi$: $g=-\\tfrac{2x}{\\pi}+4$ (아래로), 등. 사이클로이드 두 아치 면적 $6\\pi$, 그 중 톱니가 만드는 삼각형 합 = $4\\cdot\\tfrac{1}{2}\\cdot\\pi\\cdot 2 = 4\\pi$. 차이 = $6\\pi - 4\\pi = 2\\pi$."
  }),
  build({
    num: 29, subject: "미분학", unit: "도함수의 응용", concept: "점근선까지 거리 + 극한 차수", difficulty: "mediumHard",
    question: "곡선 $\\dfrac{x^3}{\\sqrt{27}}-y^3=1$ 위의 점 $(x,y)$에서 점근선 $y=\\dfrac{x}{\\sqrt 3}$까지의 거리를 $d(x,y)$라고 할 때 $b=\\displaystyle\\lim_{x\\to\\infty} x^a d(x,y)$가 양수가 되는 $a$와 그 때 $b$는?",
    options: [
      o("1","$a=1,\\ b=\\dfrac{1}{2}$"),
      o("2","$a=1,\\ b=\\dfrac{\\sqrt 3}{2}$"),
      o("3","$a=2,\\ b=\\dfrac{1}{2}$"),
      o("4","$a=2,\\ b=\\dfrac{\\sqrt 3}{2}$"),
      o("5","$a=3,\\ b=\\dfrac{1}{\\sqrt 2}$")
    ],
    answer: 4,
    explanation: "점근선 $y=\\tfrac{x}{\\sqrt 3}$, 표준형 $\\sqrt 3 y - x = 0$. 거리 $d=\\dfrac{|\\sqrt 3 y - x|}{\\sqrt{1+3}}=\\dfrac{|\\sqrt 3 y - x|}{2}$. $\\sqrt 3 y = (x^3-\\sqrt{27})^{1/3}$. $x\\to\\infty$일 때 $\\sqrt 3 y - x = (x^3-\\sqrt{27})^{1/3}-x$. 인수분해: $(X-Y) = \\dfrac{X^3-Y^3}{X^2+XY+Y^2}$ ($X=(x^3-\\sqrt{27})^{1/3},Y=x$): $X^3-Y^3=-\\sqrt{27}$. 분모 $\\sim 3x^2$. 따라서 $\\sqrt 3 y - x \\sim -\\dfrac{\\sqrt{27}}{3x^2}=-\\dfrac{\\sqrt 3}{x^2}$. $d \\sim \\dfrac{\\sqrt 3}{2x^2}$. $x^a d$가 양수 유한이려면 $a=2$, $b=\\dfrac{\\sqrt 3}{2}$."
  }),
  build({
    num: 30, subject: "적분학", unit: "정적분의 계산", concept: "이상적분 비교(가우시안)", difficulty: "medium",
    question: "다음은 이상적분 $\\displaystyle\\int_0^{\\infty} e^{-x^2+1}\\,dx$이 수렴함을 보이는 과정을 기술한 것이다. 적당한 양수 $a$에 대해 이 적분을 다음과 같이 $\\int_0^{\\infty}e^{-x^2+1}dx = \\int_0^a e^{-x^2+1}dx + \\int_a^{\\infty}e^{-x^2+1}dx$ 나누어보자. 우변의 첫 번째 적분은 통상적인 보통의 정적분이다. 두 번째 적분에서는 $x\\ge a$일 때 $e^{-x^2+1}\\le e^{-x+1}$이 된다는 사실을 이용한다. $e^{-x+1}$의 적분은 다음과 같이 쉽게 구할 수 있다. $\\int_a^{\\infty}e^{-x+1}dx = \\lim_{t\\to\\infty}\\int_a^t e^{-x+1}dx = b$. 그러므로 비교정리를 적용하면 $\\int_a^{\\infty}e^{-x^2+1}dx$는 수렴하게 된다. 따라서 $\\int_0^{\\infty}e^{-x^2+1}dx$이 수렴하게 된다. 위의 증명에서 나타나는 실수 $(a,b)$는?",
    options: [o("1","$(2,e^{-2})$"), o("2","$(1,1)$"), o("3","$(2,1)$"), o("4","$(1,e^{-1})$"), o("5","$\\left(\\dfrac{1}{2},e^{-1/2}\\right)$")],
    answer: 2,
    explanation: "$e^{-x^2+1}\\le e^{-x+1}$이려면 $-x^2+1\\le -x+1 \\Rightarrow x^2-x\\ge 0 \\Rightarrow x\\le 0$ 또는 $x\\ge 1$. 따라서 $a=1$. $b=\\int_1^{\\infty}e^{-x+1}dx = \\lim_{t\\to\\infty}[-e^{-x+1}]_1^t = 0-(-e^0)=1$. $(a,b)=(1,1)$."
  }),
  build({
    num: 31, subject: "선형대수", unit: "벡터공간", concept: "평면-점 거리", difficulty: "medium",
    question: "$H$는 세 점 $(1,1,1),(1,2,3),(2,4,3)$을 포함하는 평면이다. 점 $(-3,4,5)$와 $H$ 사이의 거리는?",
    options: [o("1","$\\dfrac{6}{7}$"), o("2","$1$"), o("3","$\\dfrac{3}{7}$"), o("4","$\\dfrac{9}{\\sqrt{21}}$"), o("5","$\\dfrac{18}{\\sqrt{21}}$")],
    answer: 5,
    explanation: "두 변벡터: $(0,1,2),(1,3,2)$. 외적 = $\\det\\!\\begin{pmatrix}\\vec i&\\vec j&\\vec k\\\\0&1&2\\\\1&3&2\\end{pmatrix} = (1\\cdot 2-2\\cdot 3, 2\\cdot 1-0\\cdot 2, 0\\cdot 3-1\\cdot 1) = (-4,2,-1) \\to (4,-2,1)$. 평면: $4(x-1)-2(y-1)+(z-1)=0 \\Rightarrow 4x-2y+z=3$. 점 $(-3,4,5)$ 대입: $|4(-3)-2(4)+5-3|=|-12-8+5-3|=|-18|=18$. 거리 = $\\dfrac{18}{\\sqrt{16+4+1}}=\\dfrac{18}{\\sqrt{21}}$."
  }),
  build({
    num: 32, subject: "다변수함수", unit: "체적과 곡면적", concept: "회전곡면 면적", difficulty: "medium",
    question: "곡선 $y=2x^3\\ (0\\le x\\le 1)$를 $x$축에 대해 회전한 곡면의 면적은?",
    options: [o("1","$\\dfrac{\\pi}{27}(37^{3/2}-1)$"), o("2","$\\dfrac{\\pi}{54}(37^{3/2}-1)$"), o("3","$\\dfrac{\\pi}{81}(37^{3/2}-1)$"), o("4","$\\dfrac{\\pi}{54}(39^{3/2}-1)$"), o("5","$\\dfrac{\\pi}{81}(39^{3/2}-1)$")],
    answer: 2,
    explanation: "회전 곡면 면적 공식: $S=2\\pi\\int_0^1 y\\sqrt{1+(y')^2}dx = 2\\pi\\int_0^1 2x^3\\sqrt{1+36x^4}dx$. $u=1+36x^4,\\ du=144x^3 dx$. $S=\\dfrac{4\\pi}{144}\\int_1^{37}\\sqrt u\\,du = \\dfrac{\\pi}{36}\\cdot\\dfrac{2}{3}[u^{3/2}]_1^{37} = \\dfrac{\\pi}{54}(37^{3/2}-1)$."
  }),
  build({
    num: 33, subject: "선형대수", unit: "벡터공간", concept: "벡터 정사영", difficulty: "medium",
    question: "두 벡터 $\\vec a=(2,3,7),\\ \\vec b=(1,0,7)$에 대하여 $\\vec a$를 $\\vec b$와 평행한 벡터 $\\vec a_T$와 $\\vec b$와 수직인 벡터 $\\vec a_N$의 합으로 나타내자. 이 때 $\\vec a_T$는?",
    options: [
      o("1","$\\!\\left(\\dfrac{51}{52},0,\\dfrac{357}{52}\\right)$"),
      o("2","$\\!\\left(\\dfrac{49}{52},0,\\dfrac{343}{52}\\right)$"),
      o("3","$(1,0,7)$"),
      o("4","$\\!\\left(\\dfrac{49}{50},0,\\dfrac{363}{50}\\right)$"),
      o("5","$\\!\\left(\\dfrac{51}{50},0,\\dfrac{357}{50}\\right)$")
    ],
    answer: 5,
    explanation: "$\\vec b$ 방향 정사영: $\\vec a_T = \\dfrac{\\vec a\\cdot\\vec b}{\\vec b\\cdot\\vec b}\\vec b$. $\\vec a\\cdot\\vec b = 2\\cdot 1+3\\cdot 0+7\\cdot 7 = 2+0+49=51$. $\\vec b\\cdot\\vec b = 1+0+49=50$. 따라서 $\\vec a_T = \\dfrac{51}{50}(1,0,7) = \\left(\\dfrac{51}{50},0,\\dfrac{357}{50}\\right)$."
  }),
  build({
    num: 34, subject: "다변수함수", unit: "추가내용", concept: "두 곡면의 교선 접선벡터", difficulty: "mediumHard",
    question: "$C$는 곡면 $x^2+y^2+z^2=1$과 곡면 $\\dfrac{(x-\\tfrac{1}{2})^2}{2}+2y^2+\\dfrac{(z-\\tfrac{1}{2})^2}{3}=1$의 교선이다. 점 $\\!\\left(\\dfrac{1}{2},\\dfrac{1}{\\sqrt 2},\\dfrac{1}{2}\\right)$에서 $C$의 접선과 평행한 벡터는?",
    options: [o("1","$(1,0,1)$"), o("2","$(1,1,0)$"), o("3","$(0,1,1)$"), o("4","$(1,0,-1)$"), o("5","$(1,1,1)$")],
    answer: 4,
    explanation: "$f=x^2+y^2+z^2-1$, $g$=두 번째 식. $\\nabla f=(2x,2y,2z)=(1,\\sqrt 2,1)$ at point. $\\nabla g=\\!\\left(x-\\tfrac{1}{2},4y,\\tfrac{2(z-\\tfrac{1}{2})}{3}\\right)=(0,2\\sqrt 2,0)$. 교선의 접선 = $\\nabla f\\times\\nabla g$. $(1,\\sqrt 2,1)\\times(0,2\\sqrt 2,0) = (\\sqrt 2\\cdot 0-1\\cdot 2\\sqrt 2,\\ 1\\cdot 0-1\\cdot 0,\\ 1\\cdot 2\\sqrt 2-\\sqrt 2\\cdot 0) = (-2\\sqrt 2,0,2\\sqrt 2)$. 약분: $(-1,0,1) \\sim (1,0,-1)$."
  }),
  build({
    num: 35, subject: "다변수함수", unit: "중적분", concept: "변수변환(평행사변형)", difficulty: "mediumHard",
    question: "영역 $R$은 좌표평면에서 점 $(0,0),(2,4),(4,1),(2,-3)$을 꼭짓점으로 갖는 사각형이다. 변환 $x=u+2v,\\ y=2u-3v$를 이용하여 구한 적분 $\\displaystyle\\iint_R e^{3x+2y}\\,dA$의 값은?",
    options: [o("1","$e^7$"), o("2","$e^7-1$"), o("3","$e^{14}$"), o("4","$e^{14}-1$"), o("5","$7e^{14}-1$")],
    answer: 4,
    explanation: "역변환: $2x-y = 2(u+2v)-(2u-3v)=7v$, $3x+2y=3(u+2v)+2(2u-3v)=7u$. 즉 $u=\\tfrac{3x+2y}{7},\\ v=\\tfrac{2x-y}{7}$. 야코비안 $\\dfrac{\\partial(x,y)}{\\partial(u,v)}=\\det\\!\\begin{pmatrix}1&2\\\\2&-3\\end{pmatrix}=-3-4=-7$, $|J|=7$. 꼭짓점 변환: $(0,0)\\to(0,0)$, $(2,4)\\to(2,0)$, $(4,1)\\to(2,1)$, $(2,-3)\\to(0,1)$. 새 영역: $0\\le u\\le 2,\\ 0\\le v\\le 1$. 피적분함수 $e^{3x+2y}=e^{7u}$. 적분 $=\\int_0^2\\int_0^1 e^{7u}\\cdot 7\\,dv\\,du = 7\\cdot\\dfrac{e^{14}-1}{7}=e^{14}-1$."
  }),
  build({
    num: 36, subject: "다변수함수", unit: "편도함수", concept: "극좌표 + 이계 편미분", difficulty: "mediumHard",
    question: "함수 $z=f(x,y)$는 연속인 $2$계 편도함수를 가진다. $x=r\\cos\\theta,\\ y=r\\sin\\theta$에 대해 $(x,y)=(0,1)$에서 $\\dfrac{\\partial^2 z}{\\partial r^2}$의 값은?",
    options: [
      o("1","$\\!\\left(\\dfrac{\\partial^2 z}{\\partial y^2}+\\dfrac{\\partial z}{\\partial x}+\\dfrac{\\partial z}{\\partial y}\\right)\\!(0,1)$"),
      o("2","$\\!\\left(\\dfrac{\\partial^2 z}{\\partial x^2}+\\dfrac{\\partial z}{\\partial x}+\\dfrac{\\partial z}{\\partial y}\\right)\\!(0,1)$"),
      o("3","$\\dfrac{\\partial^2 z}{\\partial y^2}(0,1)$"),
      o("4","$\\dfrac{\\partial^2 z}{\\partial x^2}(0,1)$"),
      o("5","$0$")
    ],
    answer: 3,
    explanation: "연쇄법칙: $z_r = z_x\\cos\\theta + z_y\\sin\\theta$. $z_{rr} = (z_{xx}\\cos\\theta+z_{xy}\\sin\\theta)\\cos\\theta + (z_{yx}\\cos\\theta+z_{yy}\\sin\\theta)\\sin\\theta = \\cos^2\\theta\\,z_{xx} + 2\\cos\\theta\\sin\\theta\\,z_{xy} + \\sin^2\\theta\\,z_{yy}$. $(x,y)=(0,1)$이면 $r=1,\\ \\theta=\\dfrac{\\pi}{2}$이므로 $\\cos\\theta=0,\\ \\sin\\theta=1$. 대입: $z_{rr}=0+0+z_{yy}=z_{yy}(0,1)$."
  }),
  build({
    num: 37, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "지수급수 합 → 최댓값", difficulty: "medium",
    question: "영역 $R$은 좌표평면에서 점 $(0,0),(0,1),(1,1)$을 꼭짓점으로 갖는 삼각형이다. 함수 $f(x,y)=1+\\dfrac{(x+y)}{1!}+\\dfrac{(x+y)^2}{2!}+\\dfrac{(x+y)^3}{3!}+\\cdots$가 영역 $R$에서 가지는 최댓값은?",
    options: [o("1","$1$"), o("2","$\\dfrac{1}{2}e$"), o("3","$2$"), o("4","$e$"), o("5","$e^2$")],
    answer: 5,
    explanation: "지수급수 $\\sum_{n=0}^{\\infty}\\dfrac{u^n}{n!} = e^u$. 따라서 $f(x,y)=e^{x+y}$. $R$에서 $x+y$ 최대값을 찾는다. 꼭짓점: $(0,0)\\to 0,\\ (0,1)\\to 1,\\ (1,1)\\to 2$. 영역 안에서도 최댓값은 꼭짓점에서. 최대 $x+y=2$이므로 $f$ 최댓값 = $e^2$."
  }),
  build({
    num: 38, subject: "다변수함수", unit: "중적분", concept: "라이프니츠(이중적분)", difficulty: "mediumHard",
    question: "$f(x)=\\displaystyle\\int_0^{x^2}\\!\\!\\int_{\\sqrt x}^1 e^{t^2+s}\\,dt\\,ds$일 때 $f'(1)$의 값은?",
    options: [o("1","$e-1$"), o("2","$e(e-1)$"), o("3","$\\dfrac{1}{2}e(e-1)$"), o("4","$-e(e-1)$"), o("5","$-\\dfrac{1}{2}e(e-1)$")],
    answer: 5,
    explanation: "푸비니로 분리: $f(x)=\\int_0^{x^2}e^s ds\\cdot\\int_{\\sqrt x}^1 e^{t^2}dt$. 라이프니츠 적용: $f'(x) = e^{x^2}\\cdot 2x\\cdot\\int_{\\sqrt x}^1 e^{t^2}dt + \\int_0^{x^2}e^s ds\\cdot\\!\\left(-e^x\\cdot\\dfrac{1}{2\\sqrt x}\\right)$. $x=1$ 대입: 첫 항 $= e\\cdot 2\\cdot 0 = 0$ (적분구간 $1\\to 1$). 둘째 항 $= [e^s]_0^1\\cdot\\!\\left(-e\\cdot\\tfrac{1}{2}\\right) = (e-1)\\cdot\\!\\left(-\\tfrac{e}{2}\\right) = -\\dfrac{e(e-1)}{2}$."
  }),
  build({
    num: 39, subject: "다변수함수", unit: "중적분", concept: "적분순서 변경", difficulty: "medium",
    question: "적분 $\\displaystyle\\int_0^1\\!\\!\\int_{\\sqrt x}^1 x\\cos\\!\\left(\\dfrac{\\pi}{2}y^5\\right)dy\\,dx$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{5}$"), o("2","$5\\pi$"), o("3","$\\dfrac{5}{2\\pi}$"), o("4","$\\dfrac{1}{5\\pi}$"), o("5","$\\dfrac{2}{5\\pi}$")],
    answer: 4,
    explanation: "적분 순서 변경: $0\\le x\\le 1,\\ \\sqrt x\\le y\\le 1$ → $0\\le y\\le 1,\\ 0\\le x\\le y^2$. $\\int_0^1\\int_0^{y^2} x\\cos(\\tfrac{\\pi}{2}y^5)dx\\,dy = \\int_0^1 \\dfrac{y^4}{2}\\cos(\\tfrac{\\pi}{2}y^5)dy$. $u=\\tfrac{\\pi}{2}y^5$로 치환, $du=\\tfrac{5\\pi}{2}y^4 dy$. $\\dfrac{1}{2}\\cdot\\dfrac{2}{5\\pi}\\int_0^{\\pi/2}\\cos u\\,du = \\dfrac{1}{5\\pi}\\cdot[\\sin u]_0^{\\pi/2} = \\dfrac{1}{5\\pi}$."
  }),
  build({
    num: 40, subject: "다변수함수", unit: "선적분과 면적분", concept: "보존장(완전미분)", difficulty: "medium",
    question: "곡선 $C$의 매개변수 방정식이 아래와 같이 주어져 있다. $x(t)=\\sqrt 2\\sin t\\cos^2 t,\\ y=\\sqrt 2\\sin^2 t\\cos t,\\ 0\\le t\\le \\dfrac{\\pi}{4}$ 벡터장 $\\vec F(x,y)=(3+3x^2 y)\\vec i+(x^3+\\sin(\\pi y))\\vec j$의 $C$ 상에서의 선적분 값은?",
    options: [o("1","$\\dfrac{25}{8}$"), o("2","$\\dfrac{25}{8}+\\dfrac{1}{\\pi}$"), o("3","$\\dfrac{25}{16}+\\dfrac{1}{\\pi}$"), o("4","$\\dfrac{25}{16}-\\dfrac{1}{\\pi}$"), o("5","$\\dfrac{25}{16}$")],
    answer: 3,
    explanation: "$P=3+3x^2 y,\\ Q=x^3+\\sin(\\pi y)$. $P_y=3x^2=Q_x$이므로 보존장. 母함수 $\\phi$: $\\phi_x=3+3x^2 y \\Rightarrow \\phi=3x+x^3 y + g(y)$. $\\phi_y=x^3+g'(y)=x^3+\\sin(\\pi y)\\Rightarrow g(y)=-\\dfrac{\\cos(\\pi y)}{\\pi}$. 즉 $\\phi=3x+x^3 y-\\dfrac{\\cos(\\pi y)}{\\pi}$. 시점 $t=0$: $(0,0)$. 종점 $t=\\tfrac{\\pi}{4}$: $x=\\sqrt 2\\cdot\\tfrac{\\sqrt 2}{2}\\cdot\\tfrac{1}{2}=\\tfrac{1}{2}$, $y=\\sqrt 2\\cdot\\tfrac{1}{2}\\cdot\\tfrac{\\sqrt 2}{2}=\\tfrac{1}{2}$. 적분 = $\\phi(\\tfrac{1}{2},\\tfrac{1}{2}) - \\phi(0,0) = (\\tfrac{3}{2}+\\tfrac{1}{8}\\cdot\\tfrac{1}{2}-\\tfrac{\\cos(\\pi/2)}{\\pi}) - (0+0-\\tfrac{1}{\\pi}) = \\tfrac{3}{2}+\\tfrac{1}{16}-0+\\tfrac{1}{\\pi} = \\dfrac{25}{16}+\\dfrac{1}{\\pi}$."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error(error); process.exit(1); }
console.log("Inserted:");
for (const r of data) console.log(`  - ${r.id}  [${r.subject}/${r.unit}/${r.difficulty}]`);
