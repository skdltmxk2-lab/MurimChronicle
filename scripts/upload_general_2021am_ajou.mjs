// Upload 2021년도 아주대 편입수학(오전) 기출 25문항 (5지선다, 문제 26~50)
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

const SCHOOL = "아주대";
const YEAR = "2021am";
const YEAR_TAG = "2021";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-ajou-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR_TAG, "오전", subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 26, subject: "미분학", unit: "역삼각함수", concept: "역삼각함수의 정의·범위", difficulty: "medium",
    question: "다음 중 옳지 $\\mathbf{않은}$ 것을 고르라.\n\n(1) $-1\\le x\\le 0$이면 $\\sin(\\cos^{-1}x)\\le 0$이다.\n(2) $0\\le x\\le 1$이면 $\\sin(\\cos^{-1}x)\\ge 0$이다.\n(3) $\\tan^{-1}x$는 모든 실수 $x$에 대하여 잘 정의된다.\n(4) $\\sin^{-1}\\!\\left(\\sin\\dfrac{\\pi}{11}\\right)=\\dfrac{\\pi}{11}$이 성립한다.\n(5) 모든 실수 $x$에 대하여 $\\sin(\\sin^{-1}(\\sin x))=\\sin x$가 성립한다.",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)"), o("5","(5)")],
    answer: 1,
    explanation: "(1) $y=\\cos^{-1}x$의 치역은 $[0,\\pi]$이므로 $-1\\le x\\le 0$이면 $\\dfrac{\\pi}{2}\\le y\\le\\pi$. 이 구간에서 $\\sin y\\ge 0$이므로 $\\sin(\\cos^{-1}x)\\ge 0$이고 $\\le 0$이라고 한 진술은 거짓.\n(2) $0\\le x\\le 1$이면 $0\\le y\\le\\dfrac{\\pi}{2}$에서 $\\sin y\\ge 0$. 참.\n(3) $\\tan^{-1}$의 정의역은 $\\mathbb{R}$ 전체. 참.\n(4) $\\dfrac{\\pi}{11}\\in[-\\dfrac{\\pi}{2},\\dfrac{\\pi}{2}]$에서 $\\sin^{-1}(\\sin\\cdot)$은 항등함수. 참.\n(5) $\\sin^{-1}(\\sin x)\\in[-\\dfrac{\\pi}{2},\\dfrac{\\pi}{2}]$이고 그 $\\sin$값은 다시 $\\sin x$가 됨. 참.\n따라서 거짓은 (1)."
  }),
  build({
    num: 27, subject: "적분학", unit: "정적분", concept: "변수상한·합성함수 미분", difficulty: "medium",
    question: "폐구간 $[-2,8]$에서 함수 $y=f(x)$가 다음과 같다. $-2\\le x\\le 2$에서는 $f(x)=\\sqrt{4-x^2}$(반원의 위쪽 절반), $2\\le x\\le 4$에서는 두 점 $(2,0),\\,(4,4)$를 잇는 선분, $4\\le x\\le 8$에서는 두 점 $(4,4),\\,(8,0)$을 잇는 선분이다. $g(x)=\\displaystyle\\int_{-2}^{2x}\\!f(t)\\,dt$ ($-1\\le x\\le 4$)일 때 $(g\\circ f)'(3)$의 값은?",
    options: [o("1","$16$"), o("2","$-16$"), o("3","$4$"), o("4","$-4$"), o("5","$0$")],
    answer: 1,
    explanation: "체인룰: $(g\\circ f)'(x)=g'(f(x))\\,f'(x)$.\n$g(x)=\\int_{-2}^{2x}f(t)\\,dt$이므로 $g'(x)=2f(2x)$.\n$x=3$에서 $f$는 선분 $y=2(x-2)$ 위에 있으므로 $f(3)=2,\\ f'(3)=2$.\n$g'(f(3))=g'(2)=2f(4)=2\\cdot 4=8$ (단, $f(4)=4$는 두 선분의 꼭짓점).\n$(g\\circ f)'(3)=8\\cdot 2=16$."
  }),
  build({
    num: 28, subject: "미분학", unit: "극한과 연속", concept: "로피탈 정리(반복)", difficulty: "easy",
    question: "다음 극한 $\\displaystyle\\lim_{x\\to 1}\\dfrac{1-\\sin\\!\\dfrac{\\pi}{2}x}{(x-1)^2}$의 값은?",
    options: [o("1","발산"), o("2","$0$"), o("3","$\\dfrac{\\pi^2}{8}$"), o("4","$\\dfrac{\\pi^2}{4}$"), o("5","$\\dfrac{\\pi^2}{2}$")],
    answer: 3,
    explanation: "$\\dfrac{0}{0}$ 꼴이므로 로피탈.\n1차: $\\displaystyle\\lim_{x\\to 1}\\dfrac{-\\dfrac{\\pi}{2}\\cos\\!\\dfrac{\\pi}{2}x}{2(x-1)}=\\dfrac{0}{0}$.\n2차: $\\displaystyle\\lim_{x\\to 1}\\dfrac{(\\pi/2)^2\\sin\\!\\dfrac{\\pi}{2}x}{2}=\\dfrac{\\pi^2/4\\cdot 1}{2}=\\dfrac{\\pi^2}{8}$."
  }),
  build({
    num: 29, subject: "미분학", unit: "도함수", concept: "음함수 미분", difficulty: "easy",
    question: "곡선 $y^2+2x=\\ln y$ 위의 점 $\\!\\left(-\\dfrac{1}{2},\\,1\\right)$에서의 접선의 기울기는?",
    options: [o("1","$-4$"), o("2","$-2$"), o("3","$0$"), o("4","$2$"), o("5","$4$")],
    answer: 2,
    explanation: "$F(x,y)=y^2+2x-\\ln y=0$이라 두면 $\\dfrac{dy}{dx}=-\\dfrac{F_x}{F_y}=-\\dfrac{2}{2y-\\frac{1}{y}}$.\n$(x,y)=(-\\tfrac{1}{2},1)$ 대입: $\\dfrac{dy}{dx}=-\\dfrac{2}{2-1}=-2$."
  }),
  build({
    num: 30, subject: "적분학", unit: "특이적분", concept: "특이적분 수렴 판정", difficulty: "medium",
    question: "다음 보기에서 수렴하는 이상 적분(improper integral)은 모두 몇 개인가?\n\n가. $\\displaystyle\\int_0^{2}\\dfrac{\\sin(x-1)}{|x-1|^{3/2}}\\,dx$\n나. $\\displaystyle\\int_0^{\\infty}e^{-\\sqrt{x}}\\,x^{2021}\\,dx$\n다. $\\displaystyle\\int_0^{1}\\dfrac{1+x^{2021}}{\\sqrt{x}}\\,dx$\n라. $\\displaystyle\\int_0^{\\infty}\\dfrac{1}{1+x^4}\\,dx$",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개"), o("5","$4$개")],
    answer: 5,
    explanation: "가. $u=x-1$ 치환: $\\int_{-1}^{1}\\dfrac{\\sin u}{|u|^{3/2}}\\,du$. $u\\to 0$에서 $\\sin u\\sim u$이므로 적분의 분자분모비는 $|u|^{-1/2}$, $p=1/2<1$이라 수렴.\n나. $e^{-\\sqrt{x}}$는 $x\\to\\infty$에서 다항을 압도해 수렴.\n다. $\\dfrac{1}{\\sqrt{x}}+\\dfrac{x^{2021}}{\\sqrt{x}}$이고 $\\int_0^1 x^{-1/2}dx$는 $p=1/2<1$로 수렴, $\\int_0^1 x^{2020.5}dx$도 수렴.\n라. $x\\to\\infty$에서 $\\dfrac{1}{x^4}$로 비교, $p=4>1$이라 수렴.\n네 개 모두 수렴."
  }),
  build({
    num: 31, subject: "적분학", unit: "정적분의 응용", concept: "곡선의 길이", difficulty: "mediumHard",
    question: "곡선 $y=\\displaystyle\\int_{\\pi/4}^{x}\\!\\sqrt{\\tan^{6}t-1}\\,dt$ ($\\dfrac{\\pi}{4}\\le x\\le\\dfrac{\\pi}{3}$)의 길이를 구하면?",
    options: [o("1","$1-\\dfrac{1}{2}\\ln 2$"), o("2","$1+\\dfrac{1}{2}\\ln 2$"), o("3","$1-\\ln 2$"), o("4","$1+\\ln 2$"), o("5","$1$")],
    answer: 1,
    explanation: "$y'=\\sqrt{\\tan^6 x-1}$이므로 $1+(y')^2=\\tan^6 x$, $\\sqrt{1+(y')^2}=\\tan^3 x$ (구간 양수).\n$\\displaystyle L=\\!\\int_{\\pi/4}^{\\pi/3}\\!\\tan^3 x\\,dx=\\!\\int\\tan x(\\sec^2 x-1)\\,dx=\\dfrac{1}{2}\\tan^2 x+\\ln|\\cos x|+C$.\n$L=\\!\\left[\\dfrac{1}{2}\\tan^2 x+\\ln|\\cos x|\\right]_{\\pi/4}^{\\pi/3}=\\!\\left(\\dfrac{3}{2}+\\ln\\dfrac{1}{2}\\right)-\\!\\left(\\dfrac{1}{2}+\\ln\\dfrac{1}{\\sqrt 2}\\right)$\n$=1+\\ln\\dfrac{1/2}{1/\\sqrt 2}=1+\\ln\\dfrac{1}{\\sqrt 2}=1-\\dfrac{1}{2}\\ln 2$."
  }),
  build({
    num: 32, subject: "적분학", unit: "급수", concept: "수렴/발산 성질·수렴반경", difficulty: "hard",
    question: "다음 보기의 내용 중 옳은 것은 모두 몇 개인가?\n\n가. 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}a_n$이 조건부 수렴하면 $\\displaystyle\\sum_{n=1}^{\\infty}n\\sqrt{n}\\,a_n$은 발산한다.\n나. 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}(-1)^n a_n$이 발산하면 $\\displaystyle\\sum_{n=1}^{\\infty}a_n$은 발산한다.\n다. 무한급수 $\\displaystyle\\sum_{n=0}^{\\infty}(-2)^n a_n$이 수렴하면 멱급수 $\\displaystyle\\sum_{n=0}^{\\infty}a_n x^n$의 수렴반경은 $2$ 이상이다.\n라. 멱급수 $\\displaystyle\\sum_{n=0}^{\\infty}a_n x^n$의 수렴반경이 $2$ 이상이면 무한급수 $\\displaystyle\\sum_{n=0}^{\\infty}(-1)^n a_n$은 수렴한다.",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개"), o("5","$4$개")],
    answer: 4,
    explanation: "가. [참] 조건부수렴은 교대급수: $a_n=(-1)^n b_n$, $b_n>0$, $\\sum a_n$ 수렴 $\\Rightarrow$ $b_n\\not\\to 0$일 수 없고 $b_n\\ge \\dfrac{1}{n}$ 정도(수렴 한계). $n\\sqrt n\\,b_n\\ge\\sqrt n\\to\\infty$이므로 $\\sum n\\sqrt n\\,a_n$의 일반항이 $0$이 아니라 발산.\n나. [거짓] '($\\sum a_n$ 수렴 $\\Rightarrow$ $\\sum(-1)^n a_n$ 수렴)'의 대우는 '$\\sum(-1)^n a_n$ 발산 $\\Rightarrow$ $\\sum a_n$ 발산'이지만, 원명제 자체가 거짓이므로 대우도 거짓.\n다. [참] $|-2|<R$이어야 수렴이 보장되므로 $R\\ge 2$.\n라. [참] $R\\ge 2$이면 $|x|=1<R$에서 수렴(특히 절대수렴).\n참은 3개."
  }),
  build({
    num: 33, subject: "적분학", unit: "정적분의 응용", concept: "회전체의 부피(원주껍질)", difficulty: "medium",
    question: "곡선 $y=\\dfrac{\\sqrt{4-x^2}}{x^3}$ ($1\\le x\\le 2$), $x=1$, $x=2$와 $x$축으로 둘러싸인 영역을 $y$축 주위로 회전하여 얻은 입체의 부피는?",
    options: [o("1","$2\\pi\\!\\left(\\sqrt 3+\\dfrac{\\pi}{3}\\right)$"), o("2","$2\\pi\\!\\left(\\sqrt 3-\\dfrac{\\pi}{3}\\right)$"), o("3","$2\\pi\\!\\left(1+\\dfrac{\\pi}{3}\\right)$"), o("4","$2\\pi\\!\\left(1+\\dfrac{\\pi}{6}\\right)$"), o("5","$2\\pi\\!\\left(1-\\dfrac{\\pi}{6}\\right)$")],
    answer: 2,
    explanation: "원주껍질법: $V=2\\pi\\!\\int_1^2 x\\cdot\\dfrac{\\sqrt{4-x^2}}{x^3}\\,dx=2\\pi\\!\\int_1^2\\dfrac{\\sqrt{4-x^2}}{x^2}\\,dx$.\n$x=2\\sin\\theta$ 치환($dx=2\\cos\\theta\\,d\\theta$, 구간 $\\theta:\\pi/6\\to\\pi/2$): $\\sqrt{4-x^2}=2\\cos\\theta$, $x^2=4\\sin^2\\theta$.\n$V=2\\pi\\!\\int_{\\pi/6}^{\\pi/2}\\!\\dfrac{2\\cos\\theta}{4\\sin^2\\theta}\\cdot 2\\cos\\theta\\,d\\theta=2\\pi\\!\\int_{\\pi/6}^{\\pi/2}\\cot^2\\theta\\,d\\theta$\n$=2\\pi\\!\\int_{\\pi/6}^{\\pi/2}(\\csc^2\\theta-1)\\,d\\theta=2\\pi[-\\cot\\theta-\\theta]_{\\pi/6}^{\\pi/2}$\n$=2\\pi\\!\\left[(0-\\tfrac{\\pi}{2})-(-\\sqrt 3-\\tfrac{\\pi}{6})\\right]=2\\pi\\!\\left(\\sqrt 3-\\dfrac{\\pi}{3}\\right)$."
  }),
  build({
    num: 34, subject: "적분학", unit: "급수", concept: "교대급수·p-급수·비교판정", difficulty: "medium",
    question: "수열 $\\!\\left\\{a_n=(-1)^n\\dfrac{n^{-1/2}}{(\\ln n)^{1/3}}:n=2,3,4,\\ldots\\right\\}$에 대하여 보기에서 수렴하는 것은 모두 몇 개인가?\n\n가. $\\displaystyle\\sum_{n=2}^{\\infty}a_n$  나. $\\displaystyle\\sum_{n=2}^{\\infty}|a_n|$  다. $\\displaystyle\\sum_{n=2}^{\\infty}a_n^{\\,2}$  라. $\\displaystyle\\sum_{n=2}^{\\infty}|a_n|^3$",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개"), o("5","$4$개")],
    answer: 3,
    explanation: "가. 교대급수: $|a_n|=\\dfrac{1}{\\sqrt n(\\ln n)^{1/3}}\\to 0$이고 단조감소. 수렴.\n나. $\\sum\\dfrac{1}{\\sqrt n(\\ln n)^{1/3}}$. $\\ln n=t$ 치환($n=e^t,\\,dn=e^t dt$)하면 $\\int\\!\\dfrac{e^{t/2}}{t^{1/3}}\\,dt$, $e^{t/2}$의 발산력이 우세하여 발산.\n다. $\\sum\\dfrac{1}{n(\\ln n)^{2/3}}$: $p=2/3<1$이므로 적분판정법으로 발산.\n라. $\\sum\\dfrac{1}{n^{3/2}(\\ln n)}$: $\\sum\\dfrac{1}{n^{3/2}}$가 수렴하고 $\\dfrac{1}{\\ln n}$이 양수 단조이므로 수렴.\n수렴: 가, 라. 2개."
  }),
  build({
    num: 35, subject: "다변수함수", unit: "다중적분", concept: "무게중심(극좌표)", difficulty: "medium",
    question: "중심이 원점이고 반지름이 $2$인 원에서, 부채꼴 $\\{(r,\\theta):0\\le r\\le 2,\\,-\\dfrac{\\pi}{4}\\le\\theta\\le\\dfrac{\\pi}{4}\\}$($y=x$와 $y=-x$ 사이에 있고 점 $(2,0)$을 포함하는 부채꼴)를 제거한 영역 $D$가 있다. $D$의 무게 중심이 $(a,0)$일 때, $a$의 값은?",
    options: [o("1","$-\\dfrac{8\\sqrt 2}{9\\pi}$"), o("2","$-\\dfrac{2\\sqrt 2}{3\\pi}$"), o("3","$-\\dfrac{4\\sqrt 2}{9\\pi}$"), o("4","$-\\dfrac{\\sqrt 2}{3\\pi}$"), o("5","$0$")],
    answer: 1,
    explanation: "$\\bar x=\\dfrac{\\iint_D x\\,dA}{\\iint_D dA}$.\n$D$의 각 범위는 $\\theta\\in[\\dfrac{\\pi}{4},\\dfrac{7\\pi}{4}]$ (CCW), 반지름 $0$~$2$.\n분자: $\\!\\int_{\\pi/4}^{7\\pi/4}\\!\\int_0^2 r\\cos\\theta\\cdot r\\,dr\\,d\\theta=\\!\\int_{\\pi/4}^{7\\pi/4}\\!\\cos\\theta\\,d\\theta\\cdot\\!\\int_0^2\\!r^2\\,dr$\n$=[\\sin\\theta]_{\\pi/4}^{7\\pi/4}\\cdot\\dfrac{8}{3}=\\!\\left(-\\dfrac{\\sqrt 2}{2}-\\dfrac{\\sqrt 2}{2}\\right)\\cdot\\dfrac{8}{3}=-\\dfrac{8\\sqrt 2}{3}$.\n분모: $D$의 넓이 $=\\pi\\cdot 2^2\\cdot\\dfrac{3}{4}=3\\pi$ (전체 원의 $3/4$).\n$\\bar x=\\dfrac{-8\\sqrt 2/3}{3\\pi}=-\\dfrac{8\\sqrt 2}{9\\pi}$."
  }),
  build({
    num: 36, subject: "미분학", unit: "도함수", concept: "조각함수 고계도함수", difficulty: "mediumHard",
    question: "실수 전체에서 $f(x)=\\begin{cases}e^{-1/|x|},& x\\ne 0\\\\ 0,& x=0\\end{cases}$로 정의된 함수에 대하여 $f''(0)$의 값은?",
    options: [o("1","$0$"), o("2","$-1$"), o("3","$-\\dfrac{1}{2}$"), o("4","$1$"), o("5","존재하지 않음")],
    answer: 1,
    explanation: "$x>0$: $f(x)=e^{-1/x}$, $f'(x)=e^{-1/x}\\cdot\\dfrac{1}{x^2}$.\n$x<0$: $f(x)=e^{1/x}$, $f'(x)=e^{1/x}\\cdot\\!\\left(-\\dfrac{1}{x^2}\\right)$.\n$f'(0)$: $\\displaystyle\\lim_{h\\to 0^+}\\dfrac{e^{-1/h}-0}{h}$에서 $1/h=t$ 치환 $\\Rightarrow\\lim_{t\\to\\infty}te^{-t}=0$. 좌극한도 같은 방식으로 $0$. $\\therefore f'(0)=0$.\n$f''(0)$: $\\displaystyle\\lim_{h\\to 0^+}\\dfrac{f'(h)-0}{h}=\\lim_{h\\to 0^+}\\dfrac{e^{-1/h}}{h^3}$, $1/h=t$ 치환 $\\Rightarrow\\lim_{t\\to\\infty}t^3e^{-t}=0$. 좌극한도 동일.\n$\\therefore f''(0)=0$."
  }),
  build({
    num: 37, subject: "다변수함수", unit: "다중적분", concept: "적분순서 변경", difficulty: "medium",
    question: "다음 적분의 값은? $\\displaystyle\\int_0^{\\pi/4}\\!\\int_{\\sqrt y}^{\\sqrt{\\pi}/2}\\!\\dfrac{y\\cos(x^2)}{x^3}\\,dx\\,dy$",
    options: [o("1","$\\dfrac{1}{\\sqrt 2}$"), o("2","$\\dfrac{1}{4}$"), o("3","$\\dfrac{1}{2\\sqrt 2}$"), o("4","$\\dfrac{1}{8}$"), o("5","$\\dfrac{1}{4\\sqrt 2}$")],
    answer: 5,
    explanation: "적분영역: $0\\le y\\le\\pi/4$, $\\sqrt y\\le x\\le\\sqrt\\pi/2$. 적분순서 변경: $0\\le x\\le\\sqrt\\pi/2$, $0\\le y\\le x^2$.\n$\\displaystyle\\int_0^{\\sqrt\\pi/2}\\!\\int_0^{x^2}\\!\\dfrac{y\\cos(x^2)}{x^3}\\,dy\\,dx=\\!\\int_0^{\\sqrt\\pi/2}\\!\\dfrac{\\cos(x^2)}{x^3}\\cdot\\dfrac{x^4}{2}\\,dx$\n$=\\dfrac{1}{2}\\!\\int_0^{\\sqrt\\pi/2}\\!x\\cos(x^2)\\,dx=\\dfrac{1}{4}[\\sin(x^2)]_0^{\\sqrt\\pi/2}=\\dfrac{1}{4}\\sin\\dfrac{\\pi}{4}=\\dfrac{1}{4\\sqrt 2}$."
  }),
  build({
    num: 38, subject: "적분학", unit: "급수", concept: "테일러 급수·고계도함수", difficulty: "easy",
    question: "함수 $f(x)=\\cos\\!\\left(\\dfrac{1}{6}x^3\\right)$에 대하여 $f^{(6)}(0)$의 값은?",
    options: [o("1","$-20$"), o("2","$-10$"), o("3","$0$"), o("4","$10$"), o("5","$20$")],
    answer: 2,
    explanation: "$\\cos u=1-\\dfrac{u^2}{2!}+\\dfrac{u^4}{4!}-\\cdots$, $u=\\dfrac{x^3}{6}$ 대입.\n$f(x)=1-\\dfrac{1}{2!}\\!\\left(\\dfrac{x^3}{6}\\right)^{\\!2}+\\cdots=1-\\dfrac{x^6}{72}+\\cdots$\n$x^6$의 계수 $=-\\dfrac{1}{72}$. $\\therefore f^{(6)}(0)=-\\dfrac{1}{72}\\cdot 6!=-\\dfrac{720}{72}=-10$."
  }),
  build({
    num: 39, subject: "다변수함수", unit: "편도함수", concept: "접평면과 원점 사이 거리", difficulty: "easy",
    question: "곡면 $4x^4+5y^4+13z^4-2x^2y^2z^2=20$ 위의 점 $(1,1,1)$에서의 접평면이 원점으로부터 떨어진 거리는?",
    options: [o("1","$\\dfrac{19}{5}$"), o("2","$\\dfrac{19}{13}$"), o("3","$\\dfrac{16}{5}$"), o("4","$\\dfrac{16}{13}$"), o("5","$\\dfrac{13}{5}$")],
    answer: 2,
    explanation: "$F(x,y,z)=4x^4+5y^4+13z^4-2x^2y^2z^2-20$.\n$\\nabla F=(16x^3-4xy^2z^2,\\,20y^3-4x^2yz^2,\\,52z^3-4x^2y^2z)$.\n$(1,1,1)$ 대입: $(12,16,48)\\parallel(3,4,12)$.\n접평면: $3(x-1)+4(y-1)+12(z-1)=0\\Rightarrow 3x+4y+12z=19$.\n원점 거리 $=\\dfrac{|19|}{\\sqrt{9+16+144}}=\\dfrac{19}{\\sqrt{169}}=\\dfrac{19}{13}$."
  }),
  build({
    num: 40, subject: "다변수함수", unit: "다중적분", concept: "사면체의 부피", difficulty: "easy",
    question: "네 평면 $x+2y+z=2$, $x=2y$, $x=0$, $z=0$으로 둘러싸인 입체의 부피는?",
    options: [o("1","$\\dfrac{2}{3}$"), o("2","$\\dfrac{1}{2}$"), o("3","$\\dfrac{4}{9}$"), o("4","$\\dfrac{2}{5}$"), o("5","$\\dfrac{1}{3}$")],
    answer: 5,
    explanation: "꼭짓점: $A(0,0,2),\\,B(1,\\tfrac{1}{2},0),\\,C(0,1,0),\\,D(0,0,0)$.\n평면 $x=0$ 위의 세 점 $A,C,D$가 이루는 삼각형 넓이 $=\\dfrac{1}{2}\\cdot 1\\cdot 2=1$.\n점 $B$에서 평면 $x=0$까지의 거리 $=1$.\n부피 $=\\dfrac{1}{3}\\cdot 1\\cdot 1=\\dfrac{1}{3}$."
  }),
  build({
    num: 41, subject: "공학수학", unit: "미분방정식", concept: "2계 선형 ODE(미정계수)", difficulty: "medium",
    question: "함수 $f(x)=A\\,e^{\\alpha x}\\cos(\\beta x)+B\\,e^{\\alpha x}\\sin(\\beta x)+Cx+D$가 다음을 만족한다: $f''(x)+2f'(x)+5f(x)=9+10x$, $f'(0)=10$, $f(0)=-1$. 이때 $A+B+C+D$의 값은?",
    options: [o("1","$-4$"), o("2","$-2$"), o("3","$0$"), o("4","$2$"), o("5","$4$")],
    answer: 5,
    explanation: "특수해 $y_p=Cx+D$: $0+2C+5(Cx+D)=10x+9\\Rightarrow 5C=10,\\,2C+5D=9\\Rightarrow C=2,\\,D=1$.\n동차해: 특성방정식 $r^2+2r+5=0\\Rightarrow r=-1\\pm 2i\\Rightarrow\\alpha=-1,\\,\\beta=2$.\n$y_h=e^{-x}(A\\cos 2x+B\\sin 2x)$. 일반해 $y=y_h+y_p$.\n$y(0)=A+D=A+1=-1\\Rightarrow A=-2$.\n$y'(x)=-e^{-x}(A\\cos 2x+B\\sin 2x)+e^{-x}(-2A\\sin 2x+2B\\cos 2x)+2$.\n$y'(0)=-A+2B+2=2+2B+2=10\\Rightarrow B=3$.\n$\\therefore A+B+C+D=-2+3+2+1=4$."
  }),
  build({
    num: 42, subject: "선형대수", unit: "벡터", concept: "외적·삼각형 넓이", difficulty: "easy",
    question: "세 점 $P(1,1,1)$, $Q(5,-2,-1)$, $R(1,4,2)$를 꼭짓점으로 갖는 삼각형의 넓이는?",
    options: [o("1","$\\dfrac{5}{2}$"), o("2","$\\dfrac{5\\sqrt 3}{2}$"), o("3","$\\dfrac{13}{2}$"), o("4","$\\dfrac{15}{2}$"), o("5","$\\dfrac{15\\sqrt 3}{2}$")],
    answer: 3,
    explanation: "$\\vec{PQ}=(4,-3,-2)$, $\\vec{PR}=(0,3,1)$.\n$\\vec{PQ}\\times\\vec{PR}=\\!\\begin{vmatrix}\\mathbf i&\\mathbf j&\\mathbf k\\\\4&-3&-2\\\\0&3&1\\end{vmatrix}=((-3)(1)-(-2)(3),\\,-((4)(1)-(-2)(0)),\\,(4)(3)-(-3)(0))=(3,-4,12)$.\n$|\\vec{PQ}\\times\\vec{PR}|=\\sqrt{9+16+144}=\\sqrt{169}=13$.\n$\\text{넓이}=\\dfrac{1}{2}\\cdot 13=\\dfrac{13}{2}$."
  }),
  build({
    num: 43, subject: "다변수함수", unit: "다중적분", concept: "극좌표 적분식 해석", difficulty: "medium",
    question: "두 평면 $x=\\sqrt 3 y$, $x=y$와 타원체 $\\dfrac{x^2}{16}+\\dfrac{y^2}{16}+\\dfrac{z^2}{4}=1$로 둘러싸인 제1팔분 공간(first octant) 입체의 부피를 $\\displaystyle V=\\int_{\\alpha}^{\\beta}\\!\\int_0^{b}F(r)\\,dr\\,d\\theta$로 나타낼 때, $(\\beta-\\alpha)F\\!\\left(\\dfrac{b}{2}\\right)$의 값은? (단, $0\\le\\alpha<\\beta\\le\\dfrac{\\pi}{2}$)",
    options: [o("1","$\\dfrac{\\sqrt 3}{2}\\pi$"), o("2","$\\dfrac{1}{6\\sqrt 2}\\pi$"), o("3","$\\dfrac{\\sqrt 3}{6}\\pi$"), o("4","$\\dfrac{\\sqrt 2}{6}\\pi$"), o("5","$\\dfrac{1}{\\sqrt 3}\\pi$")],
    answer: 3,
    explanation: "곡면(상부): $z=2\\sqrt{1-(x^2+y^2)/16}$. 정의역(극좌표): $x=y\\Rightarrow\\theta=\\pi/4$, $x=\\sqrt 3 y\\Rightarrow\\tan\\theta=1/\\sqrt 3\\Rightarrow\\theta=\\pi/6$. 반지름 $0\\le r\\le 4$.\n$V=\\!\\int_{\\pi/6}^{\\pi/4}\\!\\int_0^4 2\\sqrt{1-r^2/16}\\cdot r\\,dr\\,d\\theta$.\n$\\alpha=\\pi/6,\\,\\beta=\\pi/4,\\,b=4,\\,F(r)=r\\sqrt{4(1-r^2/16)}$.\n$F(2)=2\\sqrt{4\\cdot 3/4}=2\\sqrt 3$. $\\beta-\\alpha=\\pi/4-\\pi/6=\\pi/12$.\n$(\\beta-\\alpha)F(2)=\\dfrac{\\pi}{12}\\cdot 2\\sqrt 3=\\dfrac{\\sqrt 3}{6}\\pi$."
  }),
  build({
    num: 44, subject: "다변수함수", unit: "편도함수", concept: "급수 정의 함수의 성질", difficulty: "medium",
    question: "함수 $f(x,y)=\\dfrac{\\displaystyle\\sum_{n=0}^{\\infty}(-1)^n\\dfrac{x^{2n}}{n!}}{\\displaystyle\\sum_{m=0}^{\\infty}\\dfrac{y^m}{m!}}$을 생각하자. 다음 설명 중 옳지 $\\mathbf{않은}$ 것은?\n\n(1) 함수 $f(x,y)$는 평면 전체를 정의역으로 가진다.\n(2) $f(-2,-4)=1$이 성립한다.\n(3) 함수 $f(x,y)$는 정의역의 모든 점에서 연속이다.\n(4) $\\dfrac{\\partial f}{\\partial y}(10,20)<0$\n(5) 함수 $f(x,y)$가 미분 불가인 점이 있다.",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)"), o("5","(5)")],
    answer: 5,
    explanation: "분자 $=e^{-x^2}$, 분모 $=e^y$이므로 $f(x,y)=e^{-x^2-y}$.\n(1) 모든 $(x,y)$에서 정의. 참.\n(2) $f(-2,-4)=e^{-4-(-4)}=e^0=1$. 참.\n(3) 지수함수이므로 모든 점에서 연속. 참.\n(4) $f_y=-e^{-x^2-y}<0$, 특히 $(10,20)$에서 $-e^{-120}<0$. 참.\n(5) $f_x=-2xe^{-x^2-y}$, $f_y=-e^{-x^2-y}$ 모두 연속이므로 $f$는 모든 점에서 미분가능. 거짓.\n$\\therefore$ 답은 (5)."
  }),
  build({
    num: 45, subject: "다변수함수", unit: "다변수함수의 극값", concept: "임계점 분류", difficulty: "mediumHard",
    question: "영역 $R=\\{(x,y):x^2+y^2\\le 9\\}$에서 정의된 함수 $f(x,y)=(x+y)(x^2+y^2)-6x-6y$에 관하여 답하라. $f$는 $R$의 내부에서 (가)개의 임계점을 가지며 그 중 극대점은 (나)개, 극소점은 (다)개이다. (가)+(나)+(다)의 값은?",
    options: [o("1","$3$"), o("2","$4$"), o("3","$5$"), o("4","$6$"), o("5","$7$")],
    answer: 4,
    explanation: "$f_x=(x^2+y^2)+2x(x+y)-6=3x^2+2xy+y^2-6$.\n$f_y=(x^2+y^2)+2y(x+y)-6=x^2+2xy+3y^2-6$.\n$f_x-f_y=2(x^2-y^2)=0\\Rightarrow x=\\pm y$.\n(i) $x=y$: $6x^2-6=0\\Rightarrow x=\\pm 1$. 임계점 $(1,1),(-1,-1)$.\n(ii) $x=-y$: $2x^2-6=0\\Rightarrow x=\\pm\\sqrt 3$. 임계점 $(\\sqrt 3,-\\sqrt 3),(-\\sqrt 3,\\sqrt 3)$.\n$f_{xx}=6x+2y$, $f_{yy}=2x+6y$, $f_{xy}=2x+2y$. $D=f_{xx}f_{yy}-f_{xy}^2$.\n$(1,1)$: $D=8\\cdot 8-4^2=48>0,\\,f_{xx}=8>0$: 극소.\n$(-1,-1)$: $D=64-16=48>0,\\,f_{xx}=-8<0$: 극대.\n$(\\pm\\sqrt 3,\\mp\\sqrt 3)$: $f_{xy}=0$, $D=f_{xx}f_{yy}=(4\\sqrt 3)(-4\\sqrt 3)<0$: 안장점.\n임계점 4개, 극대 1, 극소 1. 합 $=6$."
  }),
  build({
    num: 46, subject: "다변수함수", unit: "다변수함수의 극값", concept: "안장점의 함숫값", difficulty: "easy",
    question: "위 문제(45번 설정)의 영역 $R$의 내부에서 함수 $f$의 모든 안장점에서의 함숫값의 합은?",
    options: [o("1","$8$"), o("2","$4$"), o("3","$0$"), o("4","$-4$"), o("5","$-8$")],
    answer: 3,
    explanation: "안장점은 $(\\sqrt 3,-\\sqrt 3)$와 $(-\\sqrt 3,\\sqrt 3)$.\n$f(\\sqrt 3,-\\sqrt 3)=(\\sqrt 3-\\sqrt 3)(3+3)-6\\sqrt 3+6\\sqrt 3=0$.\n$f(-\\sqrt 3,\\sqrt 3)=(-\\sqrt 3+\\sqrt 3)(3+3)+6\\sqrt 3-6\\sqrt 3=0$.\n합 $=0+0=0$."
  }),
  build({
    num: 47, subject: "다변수함수", unit: "다변수함수의 극값", concept: "경계 최댓값(코시-슈바르츠)", difficulty: "medium",
    question: "위 문제(45번 설정)의 영역 $R$에서 $f$의 최댓값은?",
    options: [o("1","$15$"), o("2","$10\\sqrt 2$"), o("3","$12$"), o("4","$9\\sqrt 2$"), o("5","$8$")],
    answer: 4,
    explanation: "내부 임계점 함숫값: $f(1,1)=-8,\\,f(-1,-1)=8,\\,f(\\pm\\sqrt 3,\\mp\\sqrt 3)=0$.\n경계 $x^2+y^2=9$에서 $f=9(x+y)-6(x+y)=3(x+y)$.\n코시-슈바르츠: $(x+y)^2\\le 2(x^2+y^2)=18\\Rightarrow x+y\\le 3\\sqrt 2$ (등호: $x=y=\\dfrac{3}{\\sqrt 2}$).\n경계 최댓값 $=3\\cdot 3\\sqrt 2=9\\sqrt 2\\approx 12.7>8$.\n$\\therefore$ 전체 최댓값 $=9\\sqrt 2$."
  }),
  build({
    num: 48, subject: "다변수함수", unit: "벡터해석", concept: "선적분(각도 의존 벡터장)", difficulty: "medium",
    question: "$xy$평면 위 점 $P(2,2),\\,Q(0,1),\\,R(0,-1),\\,S(2,-2)$를 생각하자. $C_1$: $P\\to Q$ 선분, $C_2$: $Q\\to R\\to S$ 반원(원점 중심 부근), $C_3$: $S\\to P$ 선분이라 하고 $C=C_1+C_2+C_3$. 또 $C_4$: $P$에서 $S$로 가는 선분, $C_5$: 원점 중심·반지름 $1$의 반시계 방향 원이라 하자. 다음 선적분의 값은? $\\displaystyle\\int_{C_4}\\!\\left(-\\dfrac{y}{x^2+y^2}\\,dx+\\dfrac{x}{x^2+y^2}\\,dy\\right)$",
    options: [o("1","$-\\pi$"), o("2","$-\\dfrac{\\pi}{2}$"), o("3","$0$"), o("4","$\\dfrac{\\pi}{2}$"), o("5","$\\pi$")],
    answer: 2,
    explanation: "$C_4$: $\\mathbf r(t)=(2,-t),\\,-2\\le t\\le 2$ ($P$에서 $S$ 방향).\n$dx=0,\\,dy=-dt$, $x^2+y^2=4+t^2$, $y=-t,\\,x=2$.\n$\\displaystyle\\int_{C_4}\\!\\left(-\\dfrac{-t}{4+t^2}\\cdot 0+\\dfrac{2}{4+t^2}(-dt)\\right)=\\!\\int_{-2}^{2}\\!\\dfrac{-2}{4+t^2}\\,dt$\n$=-2\\cdot\\dfrac{1}{2}\\!\\left[\\tan^{-1}\\dfrac{t}{2}\\right]_{-2}^{2}=-\\!\\left(\\dfrac{\\pi}{4}-(-\\dfrac{\\pi}{4})\\right)=-\\dfrac{\\pi}{2}$."
  }),
  build({
    num: 49, subject: "다변수함수", unit: "벡터해석", concept: "원점 둘러싸는 폐곡선 적분", difficulty: "easy",
    question: "위(48번 설정)에서 다음 선적분의 값은? $\\displaystyle\\int_{C_5}\\!\\left(-\\dfrac{y}{x^2+y^2}\\,dx+\\dfrac{x}{x^2+y^2}\\,dy\\right)$",
    options: [o("1","$-4\\pi$"), o("2","$-2\\pi$"), o("3","$0$"), o("4","$2\\pi$"), o("5","$4\\pi$")],
    answer: 4,
    explanation: "$\\mathbf F=\\!\\left(-\\dfrac{y}{x^2+y^2},\\dfrac{x}{x^2+y^2}\\right)$. 원점 둘러싼 반시계 폐곡선에서 이 벡터장의 선적분은 $2\\pi$.\n검증: $\\mathbf r(t)=(\\cos t,\\sin t),\\,0\\le t\\le 2\\pi$. 적분값 $=\\!\\int_0^{2\\pi}(\\sin^2 t+\\cos^2 t)\\,dt=2\\pi$."
  }),
  build({
    num: 50, subject: "다변수함수", unit: "벡터해석", concept: "변형정리(원점 포함)", difficulty: "medium",
    question: "위(48번 설정)의 곡선 $C=C_1+C_2+C_3$에 대하여 다음 선적분의 값은? $\\displaystyle\\int_{C}\\!\\left(-\\dfrac{y}{x^2+y^2}\\,dx+\\dfrac{x}{x^2+y^2}\\,dy\\right)$",
    options: [o("1","$-\\dfrac{5\\pi}{2}$"), o("2","$-\\dfrac{3\\pi}{2}$"), o("3","$-\\dfrac{\\pi}{2}$"), o("4","$\\dfrac{3\\pi}{2}$"), o("5","$\\dfrac{5\\pi}{2}$")],
    answer: 4,
    explanation: "$C+(-C_4)$ ($C$ 뒤에 $S\\to P$ 선분 추가)는 원점을 둘러싸는 반시계 폐곡선이므로 선적분 $=2\\pi$.\n$-C_4$ 방향(즉 $S\\to P$)의 적분값은 $-(-\\pi/2)=\\pi/2$.\n$\\displaystyle\\int_C+\\dfrac{\\pi}{2}=2\\pi\\Rightarrow\\int_C=2\\pi-\\dfrac{\\pi}{2}=\\dfrac{3\\pi}{2}$."
  })
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (2021 오전 아주대):`, data.map((d) => d.id).join(", "));
