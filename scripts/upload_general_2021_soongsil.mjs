// Upload 2021년도 숭실대 편입수학 기출 25문항 (4지 선다, 90분, 원본 26~50번)
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

const SCHOOL = "숭실대";
const YEAR = "2021";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-soongsil-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "로피탈 정리", difficulty: "easy",
    question: "극한값 $\\!\\displaystyle\\lim_{x\\to 0^+}\\dfrac{4e^x+3\\ln x+x^2}{e^x+2\\ln x+3x^2}$의 값은?",
    options: [o("1","$4$"), o("2","$\\dfrac{3}{2}$"), o("3","$\\dfrac{1}{3}$"), o("4","$\\dfrac{4}{3}$")],
    answer: 2,
    explanation: "$\\dfrac{\\infty}{\\infty}$꼴이므로 $\\ln x$의 계수만 비교하면 $\\dfrac{3}{2}$.\n로피탈 한 번 후: $\\dfrac{4xe^x+3+2x^2}{xe^x+2+6x^2}\\Big|_{x\\to 0}=\\dfrac{3}{2}$."
  }),
  build({
    num: 2, subject: "미분학", unit: "극한과 연속", concept: "로피탈 정리(매개변수)", difficulty: "easy",
    question: "극한 $\\!\\displaystyle\\lim_{h\\to 0}\\dfrac{\\sin x(\\cos h-1)+\\cos x\\,\\sin h}{h}$의 값은?",
    options: [o("1","$0$"), o("2","$\\sin x$"), o("3","$\\cos x$"), o("4","$1$")],
    answer: 3,
    explanation: "$h$에 대해 로피탈: 분자의 미분 $=\\sin x\\cdot(-\\sin h)+\\cos x\\cdot\\cos h$.\n$h=0$ 대입: $0+\\cos x=\\cos x$.\n원식은 $\\sin(x+h)$의 미분 정의와 같다."
  }),
  build({
    num: 3, subject: "미분학", unit: "극한과 연속", concept: "테일러 전개 극한", difficulty: "medium",
    question: "극한 $\\!\\displaystyle\\lim_{x\\to 0}\\dfrac{4x^2-\\sin^2(2x)}{x^4}$의 값은?",
    options: [o("1","$2$"), o("2","$\\dfrac{2}{3}$"), o("3","$\\dfrac{4}{3}$"), o("4","$\\dfrac{16}{3}$")],
    answer: 4,
    explanation: "$\\sin 2x=2x-\\dfrac{(2x)^3}{6}+\\cdots$\n$\\sin^2 2x=4x^2-\\dfrac{16}{3}x^4+\\cdots$\n원식 $=\\dfrac{\\frac{16}{3}x^4}{x^4}=\\dfrac{16}{3}$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분", concept: "유리함수 적분", difficulty: "easy",
    question: "정적분 $\\!\\displaystyle\\int_0^1\\dfrac{x^4}{x^5-2}\\,dx$의 값은?",
    options: [o("1","$-\\dfrac{1}{5}\\ln 2$"), o("2","$\\dfrac{1}{5}\\ln 2$"), o("3","$\\dfrac{1}{5}\\ln 3$"), o("4","$5\\ln 3$")],
    answer: 1,
    explanation: "$u=x^5-2$, $du=5x^4\\,dx$.\n$\\dfrac{1}{5}\\!\\int_{-2}^{-1}\\dfrac{1}{u}\\,du=\\dfrac{1}{5}[\\ln|x^5-2|]_0^1=\\dfrac{1}{5}(\\ln 1-\\ln 2)=-\\dfrac{1}{5}\\ln 2$."
  }),
  build({
    num: 5, subject: "적분학", unit: "급수", concept: "급수 수렴/발산 판정", difficulty: "mediumHard",
    question: "다음 중 수렴하는 급수를 모두 고른 것은?\n\n(가) $\\!\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{1}{n\\ln n}$\n(나) $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-1)^n}{\\sqrt{n}}$\n(다) $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\!\\left(\\dfrac{n+3}{n}\\right)^{n^2}$\n(라) $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n^{1/n}}{(n+1)^2}$",
    options: [o("1","(가), (나)"), o("2","(나), (라)"), o("3","(가), (다), (라)"), o("4","(나), (다), (라)")],
    answer: 2,
    explanation: "(가) 적분판정: $\\!\\int\\!\\frac{1}{n\\ln n}\\to\\ln\\ln n$ 발산.\n(나) 교대급수 + $1/\\sqrt n\\to 0$, 수렴.\n(다) $n$승근 $\\!\\to e^3>1$, 발산.\n(라) $n^{1/n}\\to 1$, $\\sum 1/(n+1)^2$와 비교 수렴."
  }),
  build({
    num: 6, subject: "선형대수", unit: "고유값과 고유벡터", concept: "닮은 행렬의 불변량", difficulty: "easyMedium",
    question: "크기가 같은 정사각행렬 $A$, $B$가 $A=P^{-1}BP$를 만족할 때, 다음 중 두 행렬이 공유하지 $\\textbf{않는}$ 것은?",
    options: [o("1","고윳값"), o("2","고유벡터"), o("3","고유다항식"), o("4","최소다항식")],
    answer: 2,
    explanation: "닮은 행렬은 고유값, 고유다항식, 최소다항식이 같다.\n그러나 고유벡터는 일반적으로 $P^{-1}$로 변환된 벡터가 되므로 같지 않다."
  }),
  build({
    num: 7, subject: "미분학", unit: "도함수", concept: "적분으로 정의된 함수 접선", difficulty: "medium",
    question: "곡선 $y=\\!\\displaystyle\\int_0^{\\sqrt{x}}\\!\\sqrt{1-t^2}\\,dt$의 $x=\\dfrac{1}{2}$에서의 접선의 방정식은?",
    options: [
      o("1","$y=\\dfrac{1}{2}x+\\dfrac{\\pi}{8}$"),
      o("2","$y=\\dfrac{1}{\\sqrt{2}}x+\\dfrac{\\pi}{2}$"),
      o("3","$y=\\dfrac{1}{2}x+\\dfrac{\\pi+2}{8}$"),
      o("4","$y=\\dfrac{1}{\\sqrt{2}}x+\\dfrac{\\pi-\\sqrt{2}}{2}$")
    ],
    answer: 1,
    explanation: "$x=1/2$ 대입: $t=\\sin\\theta$ 치환으로 $y=\\!\\int_0^{\\pi/4}\\cos^2 t\\,dt=\\dfrac{\\pi}{8}+\\dfrac{1}{4}$.\n$y'=\\dfrac{1}{2\\sqrt x}\\sqrt{1-x}\\Big|_{1/2}=\\dfrac{1}{2}$.\n접선: $y-(\\pi/8+1/4)=\\dfrac{1}{2}(x-1/2)$ ⇒ $y=\\dfrac{1}{2}x+\\dfrac{\\pi}{8}$."
  }),
  build({
    num: 8, subject: "미분학", unit: "도함수", concept: "지수형 함수 미분", difficulty: "easy",
    question: "$f(x)=\\dfrac{1}{4}(x^3+1)^{3x}$일 때, $f'(1)$의 값은?",
    options: [
      o("1","$\\dfrac{3}{2}+\\ln 2$"),
      o("2","$9+6\\ln 2$"),
      o("3","$\\dfrac{3}{2}+3\\ln 2$"),
      o("4","$9+3\\ln 2$")
    ],
    answer: 2,
    explanation: "$f(x)=\\dfrac{1}{4}e^{3x\\ln(x^3+1)}$.\n$f'(x)=\\dfrac{1}{4}(x^3+1)^{3x}\\!\\left(3\\ln(x^3+1)+\\dfrac{9x^3}{x^3+1}\\right)$.\n$x=1$: $\\dfrac{1}{4}\\cdot 2^3\\!\\left(3\\ln 2+\\dfrac{9}{2}\\right)=9+6\\ln 2$."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "음함수 미분", concept: "음함수 2계 도함수", difficulty: "mediumHard",
    question: "$\\dfrac{1}{2}x^2-\\dfrac{1}{3}y^3=\\dfrac{1}{4}$일 때, $\\dfrac{d^2y}{dx^2}$의 값은?",
    options: [
      o("1","$\\dfrac{x}{y^2}$"),
      o("2","$\\dfrac{y-2x}{y^3}$"),
      o("3","$\\dfrac{y^3-2x^2}{y^5}$"),
      o("4","$\\dfrac{y^3+2x^2}{y}$")
    ],
    answer: 3,
    explanation: "$F=\\dfrac{1}{2}x^2-\\dfrac{1}{3}y^3-\\dfrac{1}{4}$, $F_x=x$, $F_y=-y^2$, $F_{xx}=1$, $F_{yy}=-2y$, $F_{xy}=0$.\n$\\dfrac{d^2y}{dx^2}=-\\dfrac{F_y^2 F_{xx}-2F_xF_y F_{xy}+F_x^2 F_{yy}}{F_y^3}=-\\dfrac{y^4-2x^2 y}{-y^6}=\\dfrac{y^3-2x^2}{y^5}$."
  }),
  build({
    num: 10, subject: "미분학", unit: "매개변수 곡선", concept: "매개변수 미분 = 1/2", difficulty: "mediumHard",
    question: "다음 매개변수방정식이 나타내는 곡선에서 $\\dfrac{dy}{dx}=\\dfrac{1}{2}$를 만족하는 $t$의 개수는?\n\n$\\begin{cases}y=e^t\\sin t\\\\ x=e^t\\cos t\\end{cases},\\;0\\le t\\le 4\\pi$",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$4$")],
    answer: 4,
    explanation: "$\\dfrac{dy}{dx}=\\dfrac{\\sin t+\\cos t}{\\cos t-\\sin t}=\\dfrac{1}{2}$ ⇒ $3\\sin t+\\cos t=0$, $\\tan t=-\\dfrac{1}{3}$.\n$[0,4\\pi]$에서 해는 주기 $\\pi$로 $4$개."
  }),
  build({
    num: 11, subject: "다변수함수", unit: "연쇄법칙", concept: "합성함수 연쇄법칙", difficulty: "medium",
    question: "$y=\\sin u$, $u=\\dfrac{v}{2}-\\dfrac{2}{v}$, $v=\\ln x^2$일 때, $x=e$에서 $\\dfrac{dy}{dx}$의 값은?",
    options: [o("1","$0$"), o("2","$\\dfrac{1}{e}$"), o("3","$1$"), o("4","$\\dfrac{2}{e}$")],
    answer: 4,
    explanation: "$\\dfrac{dy}{dx}=\\cos u\\cdot\\!\\left(\\dfrac{1}{2}+\\dfrac{2}{v^2}\\right)\\!\\cdot\\dfrac{2}{x}$.\n$x=e$: $v=2$, $u=0$.\n$\\dfrac{dy}{dx}=1\\cdot 1\\cdot\\dfrac{2}{e}=\\dfrac{2}{e}$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "음함수 미분", concept: "두 곡선 사이의 각", difficulty: "mediumHard",
    question: "다음 두 곡선의 한 교점에서 각 곡선에 접하는 직선 사이의 각을 $\\theta$라고 할 때, $|\\tan\\theta|$의 값은?\n\n$x^2+y^2=1$,$\\;8(x-1)^2+4y^2=5$",
    options: [
      o("1","$\\dfrac{\\sqrt{3}}{5}$"),
      o("2","$\\dfrac{\\sqrt{3}}{3}$"),
      o("3","$\\sqrt{3}$"),
      o("4","$3\\sqrt{3}$")
    ],
    answer: 4,
    explanation: "교점: $x=1/2$, $y=\\pm\\sqrt 3/2$.\n원의 접선기울기 $m=-\\dfrac{x}{y}=-\\dfrac{1}{\\sqrt 3}$.\n타원 접선기울기 $n=-\\dfrac{2(x-1)}{y}=\\dfrac{2}{\\sqrt 3}$.\n$|\\tan\\theta|=\\!\\left|\\dfrac{m-n}{1+mn}\\right|=3\\sqrt 3$."
  }),
  build({
    num: 13, subject: "적분학", unit: "정적분", concept: "두 곡선 사이의 넓이", difficulty: "easy",
    question: "함수 $f(x)=x^2-3$과 $g(x)=x-1$로 둘러싸인 영역의 넓이는?",
    options: [o("1","$\\dfrac{9}{2}$"), o("2","$5$"), o("3","$\\dfrac{11}{2}$"), o("4","$6$")],
    answer: 1,
    explanation: "교점: $x^2-3=x-1$ ⇒ $x=-1,2$.\n$S=\\!\\int_{-1}^{2}\\!\\big((x-1)-(x^2-3)\\big)\\,dx=\\!\\int_{-1}^2(-x^2+x+2)\\,dx=\\dfrac{9}{2}$."
  }),
  build({
    num: 14, subject: "적분학", unit: "이중적분", concept: "적분 순서 교환", difficulty: "medium",
    question: "이중적분 $\\!\\displaystyle\\int_0^1\\!\\!\\int_{\\arcsin y}^{\\pi/2}\\!\\dfrac{1}{1+\\cos^2 x}\\,dx\\,dy$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$\\dfrac{\\pi}{4}$"), o("4","$\\dfrac{\\pi}{2}$")],
    answer: 3,
    explanation: "순서 교환: $\\!\\int_0^{\\pi/2}\\!\\!\\int_0^{\\sin x}\\!\\dfrac{1}{1+\\cos^2 x}\\,dy\\,dx=\\!\\int_0^{\\pi/2}\\!\\dfrac{\\sin x}{1+\\cos^2 x}\\,dx$.\n$\\cos x=t$ 치환: $\\!\\int_0^1\\!\\dfrac{1}{1+t^2}\\,dt=\\dfrac{\\pi}{4}$."
  }),
  build({
    num: 15, subject: "적분학", unit: "이상적분", concept: "이상적분 수렴 판정", difficulty: "easy",
    question: "다음 이상적분의 수렴, 발산을 올바르게 고른 것은?\n\n(가) $\\!\\int_1^{\\infty}\\!\\dfrac{x}{x^3+1}\\,dx$\n(나) $\\!\\int_0^1\\!\\dfrac{1}{\\sqrt x}\\,dx$",
    options: [
      o("1","(가) 수렴, (나) 수렴"),
      o("2","(가) 발산, (나) 수렴"),
      o("3","(가) 수렴, (나) 발산"),
      o("4","(가) 발산, (나) 발산")
    ],
    answer: 1,
    explanation: "(가) $\\dfrac{x}{x^3+1}\\sim\\dfrac{1}{x^2}$ 수렴.\n(나) $p=1/2<1$이므로 수렴."
  }),
  build({
    num: 16, subject: "공학수학", unit: "1계 미분방정식", concept: "변수분리", difficulty: "easy",
    question: "$\\dfrac{dy}{dx}=4x^3 y$일 때, 다음 중 $y(x)$가 될 수 있는 것은?",
    options: [
      o("1","$e^{-x^4}$"),
      o("2","$2e^{x^4}$"),
      o("3","$3e^{2x^4}$"),
      o("4","$4e^{-2x^4}$")
    ],
    answer: 2,
    explanation: "$\\dfrac{dy}{y}=4x^3\\,dx$ ⇒ $\\ln|y|=x^4+C$ ⇒ $y=ce^{x^4}$.\n보기 중 형태가 맞는 것은 $2e^{x^4}$."
  }),
  build({
    num: 17, subject: "공학수학", unit: "2계 미분방정식", concept: "상수계수 동차", difficulty: "easy",
    question: "$y''-2y'-3y=0$, $y(0)=6$, $y'(0)=2$의 해가 $y(x)$일 때, $y(2)$의 값은?",
    options: [
      o("1","$2e^6+4e^{-2}$"),
      o("2","$2e^3+4e^{-1}$"),
      o("3","$4e^6+4e^{-2}$"),
      o("4","$2e^6+4e^{-4}$")
    ],
    answer: 1,
    explanation: "특성근 $r=3,-1$, $y=Ae^{3x}+Be^{-x}$.\n초기조건: $A+B=6$, $3A-B=2$ ⇒ $A=2$, $B=4$.\n$y(2)=2e^6+4e^{-2}$."
  }),
  build({
    num: 18, subject: "공학수학", unit: "급수해", concept: "멱급수 해법", difficulty: "mediumHard",
    question: "$y''+xy=0$, $y(0)=0$, $y'(0)=1$의 해가 멱급수 $\\!\\displaystyle\\sum_{n=0}^{\\infty}a_n x^n$일 때, 멱급수 계수의 쌍 $(a_3,a_4)$의 값은?",
    options: [
      o("1","$\\!\\left(1,-\\dfrac{1}{4}\\right)$"),
      o("2","$\\!\\left(0,\\dfrac{1}{4}\\right)$"),
      o("3","$\\!\\left(0,\\dfrac{1}{12}\\right)$"),
      o("4","$\\!\\left(0,-\\dfrac{1}{12}\\right)$")
    ],
    answer: 4,
    explanation: "$a_0=0$, $a_1=1$.\n$y''+xy=0$의 미분 후 $x=0$ 대입: $2a_2=0$ ⇒ $a_2=0$.\n3계: $6a_3+a_0=0$ ⇒ $a_3=0$.\n4계: $24a_4+2a_1=0$ ⇒ $a_4=-\\dfrac{1}{12}$."
  }),
  build({
    num: 19, subject: "다변수함수", unit: "극값", concept: "다변수 극값(문제 오류)", difficulty: "medium",
    question: "다음 중 곡면 $x^3-y^3+3x^2+3y^2-9x=5$에 대해 올바른 것을 모두 고른 것은? (해설지 문제 오류 — $f(x,y)=x^3-y^3+3x^2+3y^2-9x$의 극값 분석으로 해석)\n\n(가) 임계점이 4개이다.\n(나) 극대점이 1개이다.\n(다) 안장점이 1개이다.\n(라) 극소점이 1개이다.",
    options: [
      o("1","(가), (다)"),
      o("2","(나), (라)"),
      o("3","(가), (나), (다)"),
      o("4","(가), (나), (라)")
    ],
    answer: 4,
    explanation: "해설지에서 곡선·곡면 표기 오류로 정답 없음.\n$f(x,y)=x^3-y^3+3x^2+3y^2-9x$로 해석 시: $f_x=3(x+3)(x-1)$, $f_y=-3y(y-2)$ ⇒ 임계점 4개.\n$D=(6x+6)(-6y+6)$: $(-3,2)$ 극대, $(1,0)$ 극소, $(-3,0),(1,2)$ 안장 2개.\n따라서 (가),(나),(라)."
  }),
  build({
    num: 20, subject: "선형대수", unit: "행렬식", concept: "특이행렬의 열벡터", difficulty: "medium",
    question: "행렬식이 $0$인 $3\\times 3$ 행렬 $M$의 열벡터를 각각 $v_1,v_2,v_3$라고 할 때, 다음 중 올바른 것을 모두 고른 것은?\n\n(가) $v_1\\times v_2$와 $v_3$은 서로 수직이다.\n(나) $av_1+bv_2=v_3$을 만족하는 $a$, $b$를 항상 찾을 수 있다.\n(다) $\\{v_1,v_2,v_3\\}$은 $\\mathbb{R}^3$의 기저가 될 수 없다.",
    options: [
      o("1","(가), (나)"),
      o("2","(나), (다)"),
      o("3","(가), (다)"),
      o("4","(가), (나), (다)")
    ],
    answer: 3,
    explanation: "$\\det M=0$ ⇒ 열벡터들은 일차종속, 한 평면 위에 있음.\n(가) 참: $v_1\\times v_2$는 평면에 수직, $v_3$은 평면 안.\n(나) 거짓: $v_1\\parallel v_2$인 경우 $v_3$ 표현 불가.\n(다) 참: 종속이므로 기저 불가능."
  }),
  build({
    num: 21, subject: "다변수함수", unit: "접평면", concept: "타원체 접평면 - 원점 통과", difficulty: "mediumHard",
    question: "곡면 $(x-1)^2+2(y-2)^2+3(z-3)^2=1$ 위의 점 $P$에서의 접평면이 원점을 지날 때, 이러한 $P$를 모두 포함하는 평면의 방정식은?",
    options: [
      o("1","$x+y+z=4$"),
      o("2","$4x-2y+z=1$"),
      o("3","$x-2y+3z=10$"),
      o("4","$x+4y+9z=35$")
    ],
    answer: 4,
    explanation: "$P=(x_1,y_1,z_1)$에서 접평면: $(x-1)(x_1-1)+2(y-2)(y_1-2)+3(z-3)(z_1-3)=1$.\n원점 통과: $(0-1)(x_1-1)+2(0-2)(y_1-2)+3(0-3)(z_1-3)=1$ ⇒ $x_1+4y_1+9z_1=35$.\n따라서 $x+4y+9z=35$."
  }),
  build({
    num: 22, subject: "적분학", unit: "삼중적분", concept: "구·원뿔 사이 부피(구면좌표)", difficulty: "mediumHard",
    question: "좌표공간에서 다음을 만족하는 영역의 부피는?\n\n$x^2+y^2+z^2\\le b^2,\\;x^2+y^2\\le 3z^2$",
    options: [
      o("1","$\\dfrac{(2-\\sqrt 3)\\pi}{3}b^3$"),
      o("2","$\\dfrac{\\pi}{3}b^3$"),
      o("3","$\\dfrac{(4-2\\sqrt 3)\\pi}{3}b^3$"),
      o("4","$\\dfrac{2\\pi}{3}b^3$")
    ],
    answer: 4,
    explanation: "구 안 + 원뿔($z$축 기준 위·아래 양쪽).\n구면좌표: $\\phi\\in[0,\\pi/3]\\cup[2\\pi/3,\\pi]$, $\\rho\\in[0,b]$.\n$V=8\\!\\int_0^{2\\pi}\\!\\!\\int_0^{\\pi/3}\\!\\!\\int_0^b\\!\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta\\cdot\\dfrac{1}{4}$ 형태로 계산하면 $\\dfrac{2\\pi}{3}b^3$."
  }),
  build({
    num: 23, subject: "적분학", unit: "관련 변화율", concept: "구·원기둥 부피 변화율", difficulty: "mediumHard",
    question: "반지름이 $2$인 구슬을 관통하는 원통형의 구멍이 있다. 구멍을 제외한 구슬의 남은 부분의 부피를 $V$라고 하자. 구멍을 넓혀 반지름이 $1$이 될 때, 부피의 변화율 $\\dfrac{dV}{dt}$의 값은? (단, 원통형 구멍의 중심축은 구슬의 중심을 지나며, 구멍의 반지름 $r$의 변화율은 $\\dfrac{dr}{dt}=\\sqrt{3}$로 일정)",
    options: [o("1","$-\\pi$"), o("2","$-4\\pi$"), o("3","$-6\\pi$"), o("4","$-12\\pi$")],
    answer: 4,
    explanation: "원주각법: $V=2\\cdot 2\\pi\\!\\int_r^2\\!x\\sqrt{4-x^2}\\,dx$.\n$\\dfrac{dV}{dt}=-4\\pi r\\sqrt{4-r^2}\\cdot\\dfrac{dr}{dt}$.\n$r=1$, $dr/dt=\\sqrt 3$: $-4\\pi\\cdot 1\\cdot\\sqrt 3\\cdot\\sqrt 3=-12\\pi$."
  }),
  build({
    num: 24, subject: "적분학", unit: "정적분", concept: "적분 부등식", difficulty: "mediumHard",
    question: "함수 $f$와 $g$가 구간 $[a,b]$에서 연속함수일 때, 다음 중 올바른 것을 모두 고른 것은?\n\n(가) $\\!\\left(\\!\\int_a^b\\!f(x)\\,dx\\right)^{\\!2}\\le\\!\\int_a^b\\!(f(x))^2\\,dx$\n(나) $\\!\\int_a^b\\!f(x)\\,dx\\le\\!\\int_a^b\\!\\left(\\dfrac{f(x)+g(x)}{2}+\\dfrac{|f(x)-g(x)|}{2}\\right)dx$\n(다) $\\!\\left|\\!\\int_a^b\\!f(x)\\,dx\\right|\\le\\!\\int_a^b\\!|f(x)|\\,dx$",
    options: [
      o("1","(가), (나)"),
      o("2","(가), (다)"),
      o("3","(나), (다)"),
      o("4","(가), (나), (다)")
    ],
    answer: 3,
    explanation: "(가) 거짓: 코시-슈바르츠는 $b-a=1$일 때만 단순화. 반례 $\\!\\int_0^2\\dfrac{1}{2}dx)^2=1\\le\\!\\int_0^2\\dfrac{1}{4}dx=\\dfrac{1}{2}$ 성립 X.\n(나) 참: 적분값이 $\\max(f,g)$.\n(다) 참: 절댓값 부등식 표준."
  }),
  build({
    num: 25, subject: "공학수학", unit: "연립미분방정식", concept: "선형연립 1계 ODE", difficulty: "mediumHard",
    question: "다음 선형 연립 미분방정식이 초깃값 $y_1(0)=0$, $y_2(0)=2$를 만족할 때, $y_1(1)-y_2(1)$의 값은?\n\n$\\begin{cases}y_1{'}=y_1+12 y_2\\\\ y_2{'}=3y_1+y_2\\end{cases}$",
    options: [
      o("1","$3e^7-e^{-5}$"),
      o("2","$e^7-3e^{-5}$"),
      o("3","$e^{-7}-e^5$"),
      o("4","$3e^7-3e^{-5}$")
    ],
    answer: 2,
    explanation: "행렬 $\\!\\begin{pmatrix}1&12\\\\3&1\\end{pmatrix}$의 고유값 $\\lambda=7,-5$.\n$y_1-y_2=Ae^{7t}+Be^{-5t}$, $y_1(0)-y_2(0)=-2$, $(y_1-y_2)'(0)=22$.\n$A+B=-2$, $7A-5B=22$ ⇒ $A=1, B=-3$.\n$y_1(1)-y_2(1)=e^7-3e^{-5}$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) { console.error("ERROR:", error); process.exit(1); }
console.log(`Inserted ${data.length} 문항 (2021 숭실대):`, data.map((d) => d.id).join(", "));
