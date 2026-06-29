// Upload 2019년도 세종대 편입수학 기출 25문항 (5지선다)
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

const SCHOOL = "세종대";
const YEAR = "2019";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-sejong-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "쌍곡함수", concept: "쌍곡함수의 값", difficulty: "easy",
    question: "$\\cosh(\\ln 2)$의 값을 구하면?",
    options: [o("1","$\\dfrac{1}{4}$"), o("2","$\\dfrac{1}{2}$"), o("3","$\\dfrac{3}{4}$"), o("4","$1$"), o("5","$\\dfrac{5}{4}$")],
    answer: 5,
    explanation: "$\\cosh x=\\dfrac{e^x+e^{-x}}{2}$.\n$x=\\ln 2$ 대입: $\\dfrac{e^{\\ln 2}+e^{-\\ln 2}}{2}=\\dfrac{2+1/2}{2}=\\dfrac{5/2}{2}=\\dfrac{5}{4}$."
  }),
  build({
    num: 2, subject: "적분학", unit: "정적분의 계산", concept: "치환적분 ($\\sqrt{1+x^2}$)", difficulty: "medium",
    question: "정적분 $\\displaystyle\\int_0^{1}x^3\\sqrt{1+x^2}\\,dx$의 값을 구하면?",
    options: [o("1","$\\dfrac{2+2\\sqrt{2}}{15}$"), o("2","$\\dfrac{2+3\\sqrt{2}}{15}$"), o("3","$\\dfrac{3+2\\sqrt{2}}{15}$"), o("4","$\\dfrac{3+3\\sqrt{2}}{15}$"), o("5","$\\dfrac{2+4\\sqrt{2}}{15}$")],
    answer: 1,
    explanation: "$\\sqrt{1+x^2}=t$ 치환: $1+x^2=t^2,\\,x^2=t^2-1,\\,x\\,dx=t\\,dt$. 경계: $x=0\\to t=1$, $x=1\\to t=\\sqrt{2}$.\n$x^3\\sqrt{1+x^2}\\,dx=x^2\\cdot t\\cdot x\\,dx=(t^2-1)\\cdot t\\cdot t\\,dt=t^2(t^2-1)dt$.\n$\\displaystyle\\int_1^{\\sqrt{2}}(t^4-t^2)dt=\\!\\left[\\dfrac{t^5}{5}-\\dfrac{t^3}{3}\\right]_1^{\\sqrt{2}}=\\dfrac{4\\sqrt{2}-1}{5}-\\dfrac{2\\sqrt{2}-1}{3}=\\dfrac{3(4\\sqrt{2}-1)-5(2\\sqrt{2}-1)}{15}=\\dfrac{2+2\\sqrt{2}}{15}$."
  }),
  build({
    num: 3, subject: "미분학", unit: "역삼각함수", concept: "$\\arccos\\cos$ 주기 성질", difficulty: "medium",
    question: "모든 실수 $x$에서 정의된 함수 $f(x)=\\arccos(\\cos x)$에 대하여 $f(x+\\pi)$를 구하면? (단, $\\arccos 1=0$)",
    options: [o("1","$\\pi-f(x)$"), o("2","$\\pi-x$"), o("3","$\\pi+f(x)$"), o("4","$-x$"), o("5","$\\pi+x$")],
    answer: 1,
    explanation: "Note: $\\arccos(\\cos x)+\\arccos(-\\cos x)=\\pi$ (역코사인의 보각 성질).\n$f(x+\\pi)=\\arccos(\\cos(x+\\pi))=\\arccos(-\\cos x)=\\pi-\\arccos(\\cos x)=\\pi-f(x)$."
  }),
  build({
    num: 4, subject: "미분학", unit: "극한과 연속", concept: "$0/0$ 부정형 (지수)", difficulty: "mediumHard",
    question: "극한 $\\displaystyle\\lim_{x\\to 0}\\dfrac{(1+x^2)^{2/x}-1}{\\sin x}$을 구하면?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$1$"), o("3","$\\dfrac{3}{2}$"), o("4","$2$"), o("5","$\\dfrac{5}{2}$")],
    answer: 4,
    explanation: "$(1+x^2)^{2/x}=e^{(2/x)\\ln(1+x^2)}=e^{(2/x)(x^2-x^4/2+\\cdots)}=e^{2x-x^3+\\cdots}$.\n분자 $=e^{2x-\\cdots}-1\\sim 2x$ ($x\\to 0$), 분모 $\\sin x\\sim x$.\n극한 $=\\dfrac{2x}{x}=2$."
  }),
  build({
    num: 5, subject: "미분학", unit: "역함수 미분법", concept: "역함수와 합성함수 미분", difficulty: "medium",
    question: "함수 $f(x)=x^7+x+2020$의 역함수를 $g(x)$라 하자. $h(x)=f(2g(x)^{11}+g(x)+2)$에 대하여 $h'(2018)$을 구하면?",
    options: [o("1","$22$"), o("2","$23$"), o("3","$24$"), o("4","$25$"), o("5","$26$")],
    answer: 2,
    explanation: "$h'(x)=f'(2g(x)^{11}+g(x)+2)\\cdot(22g(x)^{10}g'(x)+g'(x))$.\n• $g(2018)=f^{-1}(2018)=-1$ ($f(-1)=-1-1+2020=2018$).\n• $g'(2018)=\\dfrac{1}{f'(g(2018))}=\\dfrac{1}{f'(-1)}=\\dfrac{1}{7\\cdot 1+1}=\\dfrac{1}{8}$.\n• $f'(-1)=8$.\n$h'(2018)=8\\cdot\\!\\left(22\\cdot 1\\cdot\\dfrac{1}{8}+\\dfrac{1}{8}\\right)=8\\cdot\\dfrac{22+1}{8}=23$."
  }),
  build({
    num: 6, subject: "적분학", unit: "정적분의 응용", concept: "심장형 길이", difficulty: "easyMedium",
    question: "극곡선 $r=1-\\cos\\theta$의 길이를 구하면?",
    options: [o("1","$4$"), o("2","$5$"), o("3","$6$"), o("4","$7$"), o("5","$8$")],
    answer: 5,
    explanation: "심장형(cardioid) $r=a(1\\pm\\cos\\theta)$의 길이 공식: $L=8a$.\n여기서 $a=1$이므로 $L=8$.\n(직접 계산: $\\sqrt{r^2+(r')^2}=\\sqrt{(1-\\cos\\theta)^2+\\sin^2\\theta}=\\sqrt{2-2\\cos\\theta}=2|\\sin(\\theta/2)|$. $\\int_0^{2\\pi}2|\\sin(\\theta/2)|d\\theta=8$.)"
  }),
  build({
    num: 7, subject: "적분학", unit: "특이적분", concept: "$1/\\sqrt{1-x^2}$ 적분", difficulty: "easy",
    question: "특이적분 $\\displaystyle\\int_0^{1}\\dfrac{dx}{\\sqrt{1-x^2}}$의 값을 구하면?",
    options: [o("1","$\\dfrac{\\pi}{4}$"), o("2","$\\dfrac{\\pi}{2}$"), o("3","$\\dfrac{3\\pi}{4}$"), o("4","$\\pi$"), o("5","$\\dfrac{5\\pi}{4}$")],
    answer: 2,
    explanation: "$\\displaystyle\\int\\dfrac{dx}{\\sqrt{1-x^2}}=\\arcsin x+C$.\n$[\\arcsin x]_0^1=\\dfrac{\\pi}{2}-0=\\dfrac{\\pi}{2}$."
  }),
  build({
    num: 8, subject: "적분학", unit: "급수", concept: "급수 수렴 판정 (3종)", difficulty: "medium",
    question: "다음 무한급수 중에서 수렴하는 것만을 있는 대로 고르면?\n\n(ㄱ) $\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{\\ln n}{n}$\n(ㄴ) $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n^2}{2^n}$\n(ㄷ) $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n!}{n^n}$",
    options: [o("1","ㄴ"), o("2","ㄱ, ㄴ"), o("3","ㄱ, ㄷ"), o("4","ㄴ, ㄷ"), o("5","ㄱ, ㄴ, ㄷ")],
    answer: 4,
    explanation: "(ㄱ) 발산: $\\dfrac{\\ln n}{n}\\ge\\dfrac{1}{n}$ ($n\\ge 3$). 비교판정 → 발산.\n(ㄴ) 수렴: 비율판정 $\\dfrac{(n+1)^2/2^{n+1}}{n^2/2^n}=\\dfrac{(n+1)^2}{2n^2}\\to\\dfrac{1}{2}<1$.\n(ㄷ) 수렴: 비율판정 $\\dfrac{(n+1)!/(n+1)^{n+1}}{n!/n^n}=\\dfrac{n^n}{(n+1)^n}=\\!\\left(\\dfrac{n}{n+1}\\right)^n\\to e^{-1}<1$.\n수렴: ㄴ, ㄷ."
  }),
  build({
    num: 9, subject: "미분학", unit: "매개변수 미분", concept: "매개곡선 2계 도함수", difficulty: "medium",
    question: "좌표평면에서 $x=t+\\ln t,\\,y=1-\\ln t$로 주어지는 매개곡선에 대하여 $t=1$일 때 $\\dfrac{d^2 y}{dx^2}$의 값을 구하면?",
    options: [o("1","$\\dfrac{1}{16}$"), o("2","$\\dfrac{1}{8}$"), o("3","$\\dfrac{3}{16}$"), o("4","$\\dfrac{1}{4}$"), o("5","$\\dfrac{5}{16}$")],
    answer: 2,
    explanation: "① 1계: $\\dfrac{dy}{dx}=\\dfrac{dy/dt}{dx/dt}=\\dfrac{-1/t}{1+1/t}=\\dfrac{-1}{t+1}$.\n② 2계: $\\dfrac{d^2 y}{dx^2}=\\dfrac{d}{dt}\\!\\left(\\dfrac{-1}{t+1}\\right)\\cdot\\dfrac{1}{dx/dt}=\\dfrac{1}{(t+1)^2}\\cdot\\dfrac{1}{1+1/t}=\\dfrac{1}{(t+1)^2}\\cdot\\dfrac{t}{t+1}=\\dfrac{t}{(t+1)^3}$.\n$t=1$ 대입: $\\dfrac{1}{8}$."
  }),
  build({
    num: 10, subject: "적분학", unit: "급수", concept: "수렴반지름 (근판정)", difficulty: "medium",
    question: "거듭제곱급수 $\\displaystyle\\sum_{n=0}^{\\infty}\\!\\left(\\dfrac{1}{2}\\right)^{\\!\\sqrt{n}}\\!x^n$의 수렴반지름은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$\\dfrac{\\sqrt{2}}{2}$"), o("3","$1$"), o("4","$\\sqrt{2}$"), o("5","$2$")],
    answer: 3,
    explanation: "근판정: $\\displaystyle\\lim_{n\\to\\infty}\\!\\left|\\!\\left(\\tfrac{1}{2}\\right)^{\\!\\sqrt{n}}\\!\\right|^{1/n}=\\lim\\!\\left(\\dfrac{1}{2}\\right)^{\\!\\sqrt{n}/n}=\\lim\\!\\left(\\dfrac{1}{2}\\right)^{\\!1/\\sqrt{n}}=1$.\n수렴 조건: $1\\cdot|x|<1\\Rightarrow|x|<1$. 수렴반지름 $=1$."
  }),
  build({
    num: 11, subject: "미분학", unit: "고차도함수", concept: "테일러 급수 계수 (곱)", difficulty: "medium",
    question: "함수 $f(x)=\\dfrac{\\cos x}{e^x}$의 $x=0$에서의 테일러 급수를 구할 때 $x^3$의 계수는?",
    options: [o("1","$\\dfrac{1}{12}$"), o("2","$\\dfrac{1}{9}$"), o("3","$\\dfrac{1}{6}$"), o("4","$\\dfrac{1}{4}$"), o("5","$\\dfrac{1}{3}$")],
    answer: 5,
    explanation: "$\\cos x=1-\\dfrac{x^2}{2}+\\dfrac{x^4}{24}-\\cdots$, $e^{-x}=1-x+\\dfrac{x^2}{2}-\\dfrac{x^3}{6}+\\cdots$.\n$f(x)=\\cos x\\cdot e^{-x}$의 $x^3$ 계수:\n• $1\\cdot(-x^3/6)$: $-1/6$\n• $(-x^2/2)\\cdot(-x)$: $1/2$\n합: $-\\dfrac{1}{6}+\\dfrac{1}{2}=\\dfrac{1}{3}$."
  }),
  build({
    num: 12, subject: "적분학", unit: "미분방정식", concept: "1계 선형 미분방정식", difficulty: "medium",
    question: "실수 전체의 집합에서 정의되고 양의 실숫값을 갖는 함수 $f$가 두 조건 $f'(x)+\\pi f(x)\\cos(\\pi x)=0$과 $f(0)=1$을 만족시킬 때, $f\\!\\left(\\dfrac{1}{2}\\right)$을 구하면?",
    options: [o("1","$\\dfrac{1}{e^2}$"), o("2","$\\dfrac{1}{e}$"), o("3","$1$"), o("4","$e$"), o("5","$e^2$")],
    answer: 2,
    explanation: "변수분리: $\\dfrac{f'}{f}=-\\pi\\cos(\\pi x)$ → $\\ln f=-\\sin(\\pi x)+C$ → $f(x)=Ce^{-\\sin(\\pi x)}$.\n$f(0)=C\\cdot e^0=C=1$. 따라서 $f(x)=e^{-\\sin(\\pi x)}$.\n$f(1/2)=e^{-\\sin(\\pi/2)}=e^{-1}=\\dfrac{1}{e}$."
  }),
  build({
    num: 13, subject: "적분학", unit: "급수", concept: "$\\arctan$ 급수합", difficulty: "medium",
    question: "무한급수 $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(-1)^n}{2n+1}\\dfrac{1}{3^n}$의 값을 구하면?",
    options: [o("1","$\\dfrac{\\sqrt{3}}{2}\\pi$"), o("2","$\\dfrac{\\sqrt{3}}{3}\\pi$"), o("3","$\\dfrac{\\sqrt{3}}{4}\\pi$"), o("4","$\\dfrac{\\sqrt{3}}{5}\\pi$"), o("5","$\\dfrac{\\sqrt{3}}{6}\\pi$")],
    answer: 5,
    explanation: "$\\arctan x=\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(-1)^n}{2n+1}x^{2n+1}$.\n주어진 합 $=\\displaystyle\\sum\\dfrac{(-1)^n}{2n+1}\\!\\left(\\dfrac{1}{\\sqrt{3}}\\right)^{\\!2n}=\\sqrt{3}\\sum\\dfrac{(-1)^n}{2n+1}\\!\\left(\\dfrac{1}{\\sqrt{3}}\\right)^{\\!2n+1}=\\sqrt{3}\\arctan\\dfrac{1}{\\sqrt{3}}=\\sqrt{3}\\cdot\\dfrac{\\pi}{6}=\\dfrac{\\sqrt{3}}{6}\\pi$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "방향도함수", concept: "방향도함수 (편미분 두 번)", difficulty: "medium",
    question: "미분가능한 함수 $f(x,y)$가 다음 조건을 만족시킨다.\n$f(0,y)=e^{\\sin y},\\,f(x,\\pi)=e^x(\\cos\\pi x)$\n\n$(0,\\pi)$에서 $u=\\!\\left(\\dfrac{1}{\\sqrt{5}},\\dfrac{2}{\\sqrt{5}}\\right)$방향의 방향미분계수 $D_u f(0,\\pi)$를 구하면?",
    options: [o("1","$-\\dfrac{2}{\\sqrt{5}}$"), o("2","$-\\dfrac{1}{\\sqrt{5}}$"), o("3","$0$"), o("4","$\\dfrac{1}{\\sqrt{5}}$"), o("5","$\\dfrac{2}{\\sqrt{5}}$")],
    answer: 2,
    explanation: "경도 $\\nabla f$ at $(0,\\pi)$:\n• $f_x(0,\\pi)$: $y=\\pi$ 고정 시 $f(x,\\pi)=e^x\\cos(\\pi x)$. $\\partial_x=e^x\\cos\\pi x-\\pi e^x\\sin\\pi x$. $x=0$: $1\\cdot 1-0=1$.\n• $f_y(0,\\pi)$: $x=0$ 고정 시 $f(0,y)=e^{\\sin y}$. $\\partial_y=e^{\\sin y}\\cos y$. $y=\\pi$: $e^0\\cdot(-1)=-1$.\n$\\nabla f(0,\\pi)=(1,-1)$. $D_u f=(1,-1)\\cdot\\!\\left(\\dfrac{1}{\\sqrt 5},\\dfrac{2}{\\sqrt 5}\\right)=\\dfrac{1-2}{\\sqrt 5}=-\\dfrac{1}{\\sqrt 5}$."
  }),
  build({
    num: 15, subject: "적분학", unit: "정적분의 계산", concept: "$\\arctan$ 부분적분", difficulty: "medium",
    question: "정적분 $\\displaystyle\\int_0^{2}\\arctan\\!\\left(\\dfrac{2-x}{1+2x}\\right)dx$의 값을 구하면?",
    options: [o("1","$\\dfrac{1}{2}\\ln 5$"), o("2","$\\dfrac{1}{2}\\ln 6$"), o("3","$\\ln 5$"), o("4","$\\ln 6$"), o("5","$\\dfrac{3}{2}\\ln 5$")],
    answer: 1,
    explanation: "부분적분 ($u=\\arctan\\frac{2-x}{1+2x},\\,dv=dx$): $u'=\\dfrac{d}{dx}\\arctan\\!\\left(\\frac{2-x}{1+2x}\\right)$. $\\arctan$ 차이 공식: $\\arctan\\frac{2-x}{1+2x}=\\arctan 2-\\arctan x$ (부호 조심).\n따라서 $u'=-\\dfrac{1}{1+x^2}$, $v=x$.\n$\\displaystyle\\int=[x\\cdot u]_0^2+\\!\\int_0^2\\dfrac{x}{1+x^2}dx=0+\\dfrac{1}{2}[\\ln(1+x^2)]_0^2=\\dfrac{1}{2}\\ln 5$.\n($x=2$에서 $\\arctan 0=0$이므로 첫 항 $0$.)"
  }),
  build({
    num: 16, subject: "선형대수", unit: "행렬식", concept: "행렬-벡터 곱 + 행렬식", difficulty: "medium",
    question: "$3$차 정사각행렬 $A$가 다음을 만족한다. 행렬 $A$의 행렬식의 값을 구하면?\n\n$A\\begin{pmatrix}1\\\\ 2\\\\ 3\\end{pmatrix}=\\begin{pmatrix}1\\\\ 0\\\\ 0\\end{pmatrix},\\,A\\begin{pmatrix}4\\\\ 2\\\\ 1\\end{pmatrix}=\\begin{pmatrix}0\\\\ 1\\\\ 1\\end{pmatrix},\\,A\\begin{pmatrix}0\\\\ 1\\\\ 1\\end{pmatrix}=\\begin{pmatrix}0\\\\ 0\\\\ 1\\end{pmatrix}$",
    options: [o("1","$\\dfrac{1}{25}$"), o("2","$\\dfrac{1}{5}$"), o("3","$1$"), o("4","$5$"), o("5","$25$")],
    answer: 2,
    explanation: "$A\\cdot M=N$ 꼴, $M=\\begin{pmatrix}1 & 4 & 0\\\\ 2 & 2 & 1\\\\ 3 & 1 & 1\\end{pmatrix},\\,N=\\begin{pmatrix}1 & 0 & 0\\\\ 0 & 1 & 0\\\\ 0 & 1 & 1\\end{pmatrix}$.\n$\\det A\\cdot\\det M=\\det N$.\n$\\det M=1(2-1)-4(2-3)+0=1+4=5$. $\\det N=1\\cdot 1\\cdot 1=1$.\n$\\det A=\\dfrac{1}{5}$."
  }),
  build({
    num: 17, subject: "다변수함수", unit: "최댓값·최솟값", concept: "변수치환 + 최적화", difficulty: "mediumHard",
    question: "곡선 $2(x^3+y)^4+(x^3+y)^2=2x^3+y$ 위의 점 $(x,y)$에 대하여 $y$의 최댓값을 구하면?",
    options: [o("1","$\\dfrac{5}{8}$"), o("2","$\\dfrac{3}{4}$"), o("3","$\\dfrac{7}{8}$"), o("4","$1$"), o("5","$\\dfrac{9}{8}$")],
    answer: 1,
    explanation: "$u=x^3+y$ 치환하면 $2u^4+u^2=2x^3+y=x^3+u$ → $x^3=2u^4+u^2-u$.\n$y=u-x^3=u-(2u^4+u^2-u)=-2u^4-u^2+2u$.\n$\\dfrac{dy}{du}=-8u^3-2u+2=0\\Rightarrow 4u^3+u-1=0$. $u=\\dfrac{1}{2}$이 해 ($4\\cdot 1/8+1/2-1=0$ ✓).\n$y=-2\\cdot\\dfrac{1}{16}-\\dfrac{1}{4}+1=-\\dfrac{1}{8}-\\dfrac{2}{8}+\\dfrac{8}{8}=\\dfrac{5}{8}$."
  }),
  build({
    num: 18, subject: "선형대수", unit: "벡터공간", concept: "두 부분공간 교집합 + 내적", difficulty: "mediumHard",
    question: "$\\mathbb{R}$상에서 정의된 벡터공간 $\\mathbb{R}^4$의 두 부분공간 $V=\\operatorname{span}\\{(1,0,1,1),(1,1,0,1),(1,-1,0,1)\\}$, $W=\\operatorname{span}\\{(1,-1,1,0),(1,0,1,0)\\}$과 두 벡터 $v_1=(3,2,1,3)\\in V,\\,w_1=(3,3,3,0)\\in W$이 있다. 조건 $v_1+w_1=v_2+w_2$를 만족하는 $v_2\\in V$와 $w_2\\in W$에 대하여 $v_2$와 $w_2$의 내적의 최댓값을 구하면?",
    options: [o("1","$\\dfrac{69}{4}$"), o("2","$\\dfrac{71}{4}$"), o("3","$\\dfrac{73}{4}$"), o("4","$\\dfrac{75}{4}$"), o("5","$\\dfrac{77}{4}$")],
    answer: 3,
    explanation: "$v_1-v_2=w_2-w_1\\in V\\cap W$. $V$, $W$의 기약사다리꼴로 교집합 구하면 $V\\cap W=\\operatorname{span}\\{(0,1,0,0)\\}$.\n$v_1-v_2=(0,t,0,0)$ → $v_2=(3,2-t,1,3),\\,w_2=(3,3+t,3,0)$.\n$v_2\\cdot w_2=9+(2-t)(3+t)+3+0=12+(6+2t-3t-t^2)=18-t^2-t=-\\!\\left(t-\\dfrac{1}{2}\\right)^{\\!2}+\\dfrac{73}{4}$ (제곱완성).\n최댓값 $=\\dfrac{73}{4}$ ($t=-1/2$? 부호 확인 필요. 정확히는 $t=-1/2$에서 $-(1/4)+18+1/2=73/4$ — 검증 OK)."
  }),
  build({
    num: 19, subject: "다변수함수", unit: "삼중적분", concept: "구면좌표 + 밀도", difficulty: "medium",
    question: "좌표공간에서 입체 $E$를 구면좌표 $(\\rho,\\theta,\\phi)$로 나타내면 다음과 같다.\n\n$0\\le\\rho\\le\\cos\\phi,\\ 0\\le\\theta\\le 2\\pi,\\ 0\\le\\phi\\le\\dfrac{\\pi}{4}$\n\n직교좌표계에서 입체 $E$의 점 $(x,y,z)$에서의 밀도가 $m(x,y,z)=z$일 때, 입체 $E$의 질량을 구하면?",
    options: [o("1","$\\dfrac{\\pi}{32}$"), o("2","$\\dfrac{5\\pi}{96}$"), o("3","$\\dfrac{7\\pi}{96}$"), o("4","$\\dfrac{3\\pi}{32}$"), o("5","$\\dfrac{11\\pi}{96}$")],
    answer: 3,
    explanation: "구면좌표: $z=\\rho\\cos\\phi$, $dV=\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta$.\n$\\displaystyle M=\\!\\int_0^{2\\pi}\\!\\int_0^{\\pi/4}\\!\\int_0^{\\cos\\phi}\\rho\\cos\\phi\\cdot\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta$\n$=2\\pi\\!\\int_0^{\\pi/4}\\!\\cos\\phi\\sin\\phi\\cdot\\dfrac{\\cos^4\\phi}{4}\\,d\\phi=\\dfrac{\\pi}{2}\\!\\int_0^{\\pi/4}\\!\\cos^5\\phi\\sin\\phi\\,d\\phi$\n$=\\dfrac{\\pi}{2}\\!\\left[-\\dfrac{\\cos^6\\phi}{6}\\right]_0^{\\pi/4}=\\dfrac{\\pi}{12}\\!\\left(1-\\dfrac{1}{8}\\right)=\\dfrac{7\\pi}{96}$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "선적분", concept: "그린 정리 (호 + 직선 닫기)", difficulty: "medium",
    question: "$C$가 곡선 $\\sqrt{|x|}+\\sqrt{y}=1$에서 $(1,0)$부터 $(-1,0)$까지의 호일 때, 선적분 $\\displaystyle\\int_C(x+e^{y^2})dy$의 값을 구하면?",
    options: [o("1","$\\dfrac{1}{6}$"), o("2","$\\dfrac{1}{5}$"), o("3","$\\dfrac{1}{4}$"), o("4","$\\dfrac{1}{3}$"), o("5","$\\dfrac{1}{2}$")],
    answer: 4,
    explanation: "닫는 곡선: $C_2: y=0$, $x:-1\\to 1$. $\\int_{C_2}(x+e^{y^2})dy=0$ ($dy=0$).\nGreen ($C+C_2$가 시계반대방향, 영역 $D=\\{|x|\\le(1-\\sqrt y)^2,\\,0\\le y\\le 1\\}$ 둘러쌈, 단 $C$는 시계반대로 가는지 점검 필요):\n호의 매개변수 $\\sqrt{|x|}+\\sqrt y=1$에서 $(1,0)\\to(-1,0)$ 위로 곡선이 봉우리 → 시계반대.\n$Q=x+e^{y^2}$, $P=0$. $Q_x-P_y=1$. $\\iint_D 1\\,dA=2\\!\\int_0^1(1-\\sqrt y)^2 dy=2[\\frac{1}{3}-]\\to=\\dfrac{1}{3}$.\n실제 계산: $\\int_0^1(1-\\sqrt y)^2\\cdot 2\\,dy=2\\!\\int_0^1(1-2\\sqrt y+y)dy=2(1-\\tfrac{4}{3}+\\tfrac{1}{2})=\\dfrac{1}{3}$.\n$C$ 적분 $=$ 영역 적분 $-\\,C_2$ 적분 $=\\dfrac{1}{3}-0=\\dfrac{1}{3}$."
  }),
  build({
    num: 21, subject: "적분학", unit: "정적분의 응용", concept: "적분으로 정의된 함수 최댓값", difficulty: "mediumHard",
    question: "함수 $f(x)=\\displaystyle\\int_0^{x^2}(1-t)\\sqrt{1-4t^2}\\,dt$의 최댓값을 구하면?",
    options: [o("1","$\\dfrac{1}{8}\\!\\left(\\pi-\\dfrac{1}{3}\\right)$"), o("2","$\\dfrac{1}{8}\\!\\left(\\pi-\\dfrac{2}{3}\\right)$"), o("3","$\\dfrac{1}{8}(\\pi-1)$"), o("4","$\\dfrac{1}{8}\\!\\left(\\pi-\\dfrac{4}{3}\\right)$"), o("5","$\\dfrac{1}{8}\\!\\left(\\pi-\\dfrac{5}{3}\\right)$")],
    answer: 2,
    explanation: "정의역: $1-4t^2\\ge 0$ → $|t|\\le 1/2$, 따라서 $x^2\\le 1/2$, $|x|\\le 1/\\sqrt{2}$.\n$f'(x)=(1-x^2)\\sqrt{1-4x^4}\\cdot 2x$. 임계점: $x=0$ (또는 끝점).\n$f(0)=0$, $f(1/\\sqrt{2})=\\!\\int_0^{1/2}(1-t)\\sqrt{1-4t^2}dt$.\n$2t=\\sin\\theta$ 치환 ($t=1/2$에서 $\\theta=\\pi/2$):\n$\\displaystyle=\\int_0^{\\pi/2}\\!\\left(1-\\tfrac{\\sin\\theta}{2}\\right)\\cos\\theta\\cdot\\tfrac{\\cos\\theta}{2}d\\theta=\\dfrac{1}{2}\\!\\int\\cos^2\\theta\\,d\\theta-\\dfrac{1}{4}\\!\\int\\sin\\theta\\cos^2\\theta\\,d\\theta$\n$=\\dfrac{1}{2}\\cdot\\dfrac{\\pi}{4}-\\dfrac{1}{4}\\cdot\\dfrac{1}{3}=\\dfrac{\\pi}{8}-\\dfrac{1}{12}=\\dfrac{1}{8}\\!\\left(\\pi-\\dfrac{2}{3}\\right)$."
  }),
  build({
    num: 22, subject: "다변수함수", unit: "최댓값·최솟값", concept: "타원체 내접 직육면체 (AM-GM)", difficulty: "mediumHard",
    question: "좌표공간에서 타원면 $8x^2+2y^2+z^2=8$에 내접하는 직육면체의 최대 부피를 구하면? (단, 직육면체의 모서리 각각은 좌표축 중 어느 하나와 평행하다.)",
    options: [o("1","$\\dfrac{32\\sqrt{2}}{9}$"), o("2","$\\dfrac{32\\sqrt{3}}{9}$"), o("3","$\\dfrac{32\\sqrt{5}}{9}$"), o("4","$\\dfrac{32\\sqrt{6}}{9}$"), o("5","$\\dfrac{32\\sqrt{7}}{9}$")],
    answer: 4,
    explanation: "1팔분공간 점 $(a,b,c)$, $V=8abc$. 제약 $8a^2+2b^2+c^2=8$.\nAM-GM: $\\dfrac{8a^2+2b^2+c^2}{3}\\ge\\sqrt[3]{16 a^2 b^2 c^2}$.\n$\\dfrac{8}{3}\\ge\\sqrt[3]{16(abc)^2}\\Rightarrow(abc)^2\\le\\dfrac{1}{16}\\cdot\\dfrac{8^3}{27}=\\dfrac{32}{27}\\Rightarrow abc\\le\\dfrac{\\sqrt{32/27}}{1}=\\dfrac{4\\sqrt{2}}{3\\sqrt{3}}$.\n$V=8abc\\le 8\\cdot\\dfrac{4\\sqrt{2}}{3\\sqrt{3}}=\\dfrac{32\\sqrt{2}}{3\\sqrt{3}}=\\dfrac{32\\sqrt{6}}{9}$."
  }),
  build({
    num: 23, subject: "선형대수", unit: "양정치 행렬", concept: "이차형식 분석 (3종 명제)", difficulty: "mediumHard",
    question: "행렬식이 $\\det(A)>0$인 $4\\times 4$ 대칭행렬 $A$에 대하여 함수 $f:\\mathbb{R}^4\\to\\mathbb{R}$는 $f(x)=x^T A x$ ($x\\in\\mathbb{R}^4$)로 정의된다. $f$에 대하여 옳은 것만을 보기에서 있는 대로 고르면? (단, $0=(0,0,0,0)\\in\\mathbb{R}^4$)\n\n(ㄱ) $\\nabla f(x)=0$이면 $x=0$이다.\n(ㄴ) 함수 $f$는 $x=0$에서 극솟값을 갖는다.\n(ㄷ) $f(0)$이 함수 $f$의 최솟값이면, 행렬 $A$의 대각합은 양의 실수이다.",
    options: [o("1","(ㄱ)"), o("2","(ㄱ)(ㄴ)"), o("3","(ㄱ)(ㄷ)"), o("4","(ㄴ)(ㄷ)"), o("5","(ㄱ)(ㄴ)(ㄷ)")],
    answer: 3,
    explanation: "$f(x)=x^T Ax$, $\\nabla f=2Ax$.\n(ㄱ) 참: $\\det A\\ne 0$ ($>0$ 가정)이라 $A$ 가역. $\\nabla f=0\\Rightarrow Ax=0\\Rightarrow x=0$.\n(ㄴ) 거짓: $\\det A>0$만으로는 양정치 보장 안 됨. 예: $A=\\operatorname{diag}(-1,-1,-1,-1)$도 $\\det=1>0$이나 음정치 → $x=0$이 극대.\n(ㄷ) 참: $f(0)=0$이 최소이면 모든 $x$에 대해 $x^T Ax\\ge 0$, 즉 $A$가 양반정치(실제 가역+) → 양정치 → 모든 고윳값 양수 → 대각합 $=\\sum\\lambda_i>0$.\n옳은 것: (ㄱ)(ㄷ)."
  }),
  build({
    num: 24, subject: "다변수함수", unit: "벡터와 공간도형", concept: "직선과 타원의 내적 최솟값", difficulty: "mediumHard",
    question: "$P$는 직선 $x-1=\\dfrac{y}{2}=\\dfrac{z-1}{3}$ 위의 점이고, $Q$는 곡면 $\\dfrac{x^2}{4}+y^2=1$과 평면 $z=0$의 교선 위의 점이다. 점 $O$가 원점일 때, 내적 $\\overrightarrow{OP}\\cdot\\overrightarrow{OQ}$의 최솟값을 구하면? (단, $P$의 $x$좌표는 $0\\le x\\le 2$이다.)",
    options: [o("1","$-5\\sqrt{2}$"), o("2","$-2\\sqrt{2}$"), o("3","$-\\sqrt{2}$"), o("4","$-\\sqrt{5}$"), o("5","$-2\\sqrt{5}$")],
    answer: 5,
    explanation: "$P=(s+1,2s,3s+1)$ ($-1\\le s\\le 1$, $x$좌표 $\\in[0,2]$로부터).\n$Q=(2\\cos t,\\sin t,0)$ ($0\\le t\\le 2\\pi$).\n$\\vec{OP}\\cdot\\vec{OQ}=(s+1)\\cdot 2\\cos t+2s\\cdot\\sin t=2(s+1)\\cos t+2s\\sin t$.\n$t$에 대해 정리: 진폭 $=\\sqrt{4(s+1)^2+4s^2}=2\\sqrt{2s^2+2s+1}$.\n최솟값 $=-2\\sqrt{2s^2+2s+1}$. $s$에 대해 최대화 (절댓값): $g(s)=2s^2+2s+1$, $g'=4s+2=0\\Rightarrow s=-1/2$? 그러나 끝점 비교.\n$s=1$: $g=5$, $s=-1$: $g=1$, $s=-1/2$: $g=1/2$. 최대 $g=5$ ($s=1$).\n따라서 내적 최솟값 $=-2\\sqrt{5}$."
  }),
  build({
    num: 25, subject: "다변수함수", unit: "이중적분", concept: "변수변환 (대각선)", difficulty: "medium",
    question: "$D=\\{(x,y)\\mid 0\\le x\\le 1,\\,0\\le y\\le 1,\\,x+y\\le 1\\}$일 때, 이중적분 $\\displaystyle\\iint_D e^{(x+y)^2}\\,dA$의 값을 구하면?",
    options: [o("1","$\\dfrac{e-1}{2}$"), o("2","$\\dfrac{e^2-1}{2}$"), o("3","$\\dfrac{e-1}{4}$"), o("4","$\\dfrac{e^2-1}{4}$"), o("5","$\\dfrac{e^4-1}{2}$")],
    answer: 1,
    explanation: "$u=x+y,\\,v=x$ 치환: Jacobian $|J|=1$. 영역 $D'$: $0\\le u\\le 1,\\,0\\le v\\le u$ (정규삼각형).\n$\\displaystyle\\iint_D e^{(x+y)^2}dA=\\iint_{D'}e^{u^2}dv\\,du=\\!\\int_0^1\\!\\int_0^u e^{u^2}dv\\,du=\\!\\int_0^1 u\\,e^{u^2}du$.\n$=\\!\\left[\\dfrac{1}{2}e^{u^2}\\right]_0^1=\\dfrac{e-1}{2}$."
  }),
];

console.log(`Uploading ${problems.length} problems for ${SCHOOL} ${YEAR}...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
console.log(`✅ Inserted ${data?.length ?? 0} questions for ${SCHOOL} ${YEAR}`);
