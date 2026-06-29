// Upload 2020년도 아주대 편입수학 기출 25문항 (5지선다, 문제 26~50)
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
const YEAR = "2020";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-ajou-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 26, subject: "미분학", unit: "역삼각함수", concept: "역삼각함수의 합·차", difficulty: "easyMedium",
    question: "$\\sin\\!\\left(2\\cos^{-1}\\dfrac{3}{5}\\right)-\\cos\\!\\left(2\\tan^{-1}\\dfrac{4}{3}\\right)$의 값은?",
    options: [o("1","$-\\dfrac{31}{25}$"), o("2","$-\\dfrac{17}{25}$"), o("3","$\\dfrac{13}{25}$"), o("4","$\\dfrac{17}{25}$"), o("5","$\\dfrac{31}{25}$")],
    answer: 5,
    explanation: "$\\cos^{-1}\\dfrac{3}{5}=\\alpha$라 하면 $\\cos\\alpha=\\dfrac{3}{5},\\,\\sin\\alpha=\\dfrac{4}{5}$, $\\tan^{-1}\\dfrac{4}{3}=\\beta$라 하면 $\\tan\\beta=\\dfrac{4}{3}$, $\\sin\\beta=\\dfrac{4}{5},\\,\\cos\\beta=\\dfrac{3}{5}$.\n$\\sin 2\\alpha=2\\sin\\alpha\\cos\\alpha=2\\cdot\\dfrac{4}{5}\\cdot\\dfrac{3}{5}=\\dfrac{24}{25}$.\n$\\cos 2\\beta=\\cos^2\\beta-\\sin^2\\beta=\\dfrac{9}{25}-\\dfrac{16}{25}=-\\dfrac{7}{25}$.\n값 $=\\dfrac{24}{25}-\\!\\left(-\\dfrac{7}{25}\\right)=\\dfrac{31}{25}$."
  }),
  build({
    num: 27, subject: "미분학", unit: "극한과 연속", concept: "$x\\to\\infty$ 극한", difficulty: "easy",
    question: "다음 극한 $\\displaystyle\\lim_{x\\to\\infty}\\dfrac{x^{-5/4}}{\\sin(1/x)}$의 값은?",
    options: [o("1","$-\\dfrac{5}{4}$"), o("2","$-1$"), o("3","$\\dfrac{5}{4}$"), o("4","$1$"), o("5","$0$")],
    answer: 5,
    explanation: "$\\dfrac{1}{x}=t$ 치환 ($x\\to\\infty$ ⟹ $t\\to 0^+$).\n$\\dfrac{t^{5/4}}{\\sin t}=\\dfrac{t^{5/4}}{t}\\cdot\\dfrac{t}{\\sin t}=t^{1/4}\\cdot\\dfrac{t}{\\sin t}\\to 0\\cdot 1=0$."
  }),
  build({
    num: 28, subject: "미분학", unit: "도함수", concept: "합성·제곱근 함수 미분", difficulty: "easyMedium",
    question: "실수 전체에서 정의된 미분가능 함수 $f$에 대하여 $g(x)=\\sqrt{3e^x+(f(x))^2}$라 하자. $f(0)=1,\\,f'(0)=-5$이면 $g'(0)$의 값은?",
    options: [o("1","$-\\dfrac{9}{4}$"), o("2","$-\\dfrac{7}{4}$"), o("3","$1$"), o("4","$\\dfrac{7}{4}$"), o("5","$\\dfrac{9}{4}$")],
    answer: 2,
    explanation: "$g'(x)=\\dfrac{3e^x+2f(x)f'(x)}{2\\sqrt{3e^x+(f(x))^2}}$.\n$x=0$ 대입: 분자 $=3e^0+2\\cdot 1\\cdot(-5)=3-10=-7$. 분모 $=2\\sqrt{3+1}=2\\cdot 2=4$.\n$g'(0)=-\\dfrac{7}{4}$."
  }),
  build({
    num: 29, subject: "적분학", unit: "정적분의 응용", concept: "곡선의 길이 ($\\ln\\sin$)", difficulty: "medium",
    question: "곡선 $y=\\ln(\\sin x)$, $\\dfrac{\\pi}{6}\\le x\\le\\dfrac{\\pi}{2}$의 길이를 구하면?",
    options: [o("1","$\\ln(2-\\sqrt{3})$"), o("2","$\\ln(2+\\sqrt{3})$"), o("3","$\\ln(\\sqrt{2}-1)$"), o("4","$1$"), o("5","$\\ln(\\sqrt{2}+1)$")],
    answer: 2,
    explanation: "$y'=\\cot x$. $1+(y')^2=1+\\cot^2 x=\\csc^2 x$. $\\sqrt{\\cdot}=\\csc x$ (해당 구간 양수).\n$\\displaystyle L=\\!\\int_{\\pi/6}^{\\pi/2}\\!\\csc x\\,dx=[-\\ln|\\csc x+\\cot x|]_{\\pi/6}^{\\pi/2}=-\\ln(1+0)+\\ln(2+\\sqrt{3})=\\ln(2+\\sqrt{3})$."
  }),
  build({
    num: 30, subject: "적분학", unit: "급수", concept: "수렴반지름 ($n^n$ 포함)", difficulty: "medium",
    question: "멱급수 $\\displaystyle\\sum_{n=1}^{\\infty}(-1)^n\\dfrac{2^n n!}{n^n}x^n$의 수렴 반경은?",
    options: [o("1","$1$"), o("2","$\\dfrac{1}{e}$"), o("3","$e$"), o("4","$\\dfrac{2}{e}$"), o("5","$\\dfrac{e}{2}$")],
    answer: 5,
    explanation: "$\\!\\left|\\dfrac{a_{n+1}}{a_n}\\right|=\\dfrac{2(n+1)!/(n+1)^{n+1}}{n!/n^n}=\\dfrac{2(n+1)\\cdot n^n}{(n+1)^{n+1}}=2\\!\\left(\\dfrac{n}{n+1}\\right)^{\\!n}\\to\\dfrac{2}{e}$.\n수렴조건: $\\dfrac{2}{e}|x|<1\\Rightarrow|x|<\\dfrac{e}{2}$. 수렴반경 $=\\dfrac{e}{2}$."
  }),
  build({
    num: 31, subject: "적분학", unit: "특이적분", concept: "특이적분 수렴 판정", difficulty: "medium",
    question: "다음 보기에서 수렴하는 이상 적분(improper integral)은 모두 몇 개인가?\n\n가. $\\displaystyle\\int_1^{\\infty}\\dfrac{\\sin x}{x}dx$\n나. $\\displaystyle\\int_0^{1}\\dfrac{\\sqrt{x}}{\\sin x}dx$\n다. $\\displaystyle\\int_0^{1}\\dfrac{1}{\\ln(2x)}dx$\n라. $\\displaystyle\\int_0^{1}\\dfrac{1}{x(\\ln(2x))^2}dx$",
    options: [o("1","0개"), o("2","1개"), o("3","2개"), o("4","3개"), o("5","4개")],
    answer: 3,
    explanation: "가. 수렴: 디리클레 판정법.\n나. 수렴: $x\\to 0$에서 $\\sin x\\sim x$이므로 $\\dfrac{\\sqrt{x}}{\\sin x}\\sim\\dfrac{1}{\\sqrt{x}}$, $p=1/2<1$.\n다. 발산: $x=1/2$에서 $\\ln(2x)=0$ → 특이점. 발산.\n라. 발산: $x=1/2$에서 $\\ln(2x)=0$ → $\\dfrac{1}{0}$, 발산.\n수렴: 2개 (가, 나)."
  }),
  build({
    num: 32, subject: "적분학", unit: "미분방정식", concept: "뉴턴의 냉각법칙", difficulty: "easy",
    question: "뉴턴의 냉각법칙에 의하면 물체의 냉각속도는 물체의 온도와 주변온도의 차에 비례한다. 주변온도가 $20^\\circ\\text{C}$로 일정할 때, $80^\\circ\\text{C}$인 커피가 $1$분 후에 $50^\\circ\\text{C}$로 식었다. $1$분이 더 지났을 때의 커피의 온도는?",
    options: [o("1","$40^\\circ\\text{C}$"), o("2","$35^\\circ\\text{C}$"), o("3","$30^\\circ\\text{C}$"), o("4","$25^\\circ\\text{C}$"), o("5","$20^\\circ\\text{C}$")],
    answer: 2,
    explanation: "해: $T(t)=20+\\alpha e^{kt}$.\n$T(0)=80\\Rightarrow\\alpha=60$. $T(1)=50\\Rightarrow 60e^k=30\\Rightarrow e^k=\\dfrac{1}{2}$.\n$T(2)=20+60\\cdot(e^k)^2=20+60\\cdot\\dfrac{1}{4}=35$."
  }),
  build({
    num: 33, subject: "적분학", unit: "미분방정식", concept: "베르누이 방정식", difficulty: "mediumHard",
    question: "아래 초깃값 문제 $y'+\\dfrac{4}{x}y=x^3 y^2,\\ y(1)=\\dfrac{1}{1+\\ln 2}$의 해가 $y(x)$일 때 $y(2)$의 값은 얼마인가?",
    options: [o("1","$-\\dfrac{1}{32}$"), o("2","$-\\dfrac{1}{8}$"), o("3","$-\\dfrac{1}{4}$"), o("4","$\\dfrac{1}{32}$"), o("5","$\\dfrac{1}{16}$")],
    answer: 5,
    explanation: "베르누이 방정식 ($n=2$). $u=y^{-1}$ 치환하면 $u'-\\dfrac{4}{x}u=-x^3$ — 1계 선형.\n적분인자 $\\mu=e^{-\\int 4/x\\,dx}=x^{-4}$.\n$(x^{-4}u)'=-x^{-1}\\Rightarrow x^{-4}u=-\\ln x+C$.\n$u=-x^4\\ln x+Cx^4$. $y=1/u$.\n$y(1)=\\dfrac{1}{C}=\\dfrac{1}{1+\\ln 2}\\Rightarrow C=1+\\ln 2$.\n$y(2)=\\dfrac{1}{-16\\ln 2+16(1+\\ln 2)}=\\dfrac{1}{16}$."
  }),
  build({
    num: 34, subject: "미분학", unit: "고차도함수", concept: "맥로린 다항식", difficulty: "easyMedium",
    question: "함수 $f(x)=\\dfrac{\\tan^{-1}x}{1-x+x^2}$의 3차 Maclaurin 다항식 $T_3(x)$는?",
    options: [o("1","$T_3(x)=x+x^2-\\dfrac{1}{3}x^3$"), o("2","$T_3(x)=x+x^2+\\dfrac{1}{3}x^3$"), o("3","$T_3(x)=x-x^2-\\dfrac{1}{3}x^3$"), o("4","$T_3(x)=1-x-\\dfrac{1}{3}x^3$"), o("5","$T_3(x)=1-x^2-\\dfrac{1}{3}x^3$")],
    answer: 1,
    explanation: "$\\tan^{-1}x=x-\\dfrac{x^3}{3}+\\cdots$.\n$\\dfrac{1}{1-x+x^2}=\\dfrac{1+x}{1+x^3}=(1+x)(1-x^3+\\cdots)=1+x-x^3+\\cdots$ (3차까지).\n곱: $\\!\\left(x-\\dfrac{x^3}{3}\\right)\\!(1+x-x^3+\\cdots)=x+x^2-\\dfrac{x^3}{3}+\\cdots$.\n$T_3(x)=x+x^2-\\dfrac{x^3}{3}$."
  }),
  build({
    num: 35, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피 ($x$축, $\\sin\\ln$)", difficulty: "medium",
    question: "곡선 $y=\\sqrt{\\sin(\\ln x)}$, $1\\le x\\le e^{\\pi}$와 $x$축으로 둘러싸인 영역을 $x$축 둘레로 회전시켜 얻은 입체의 부피를 구하면?",
    options: [o("1","$\\pi$"), o("2","$\\dfrac{\\pi}{2}(e^{\\pi}-1)$"), o("3","$\\pi(e^{\\pi}-1)$"), o("4","$\\pi(1+e^{\\pi})$"), o("5","$\\dfrac{\\pi}{2}(1+e^{\\pi})$")],
    answer: 5,
    explanation: "$\\displaystyle V=\\pi\\!\\int_1^{e^{\\pi}}\\!\\sin(\\ln x)dx$. $\\ln x=t$ 치환 ($dx=e^t dt$):\n$V=\\pi\\!\\int_0^{\\pi}\\!e^t\\sin t\\,dt=\\pi\\!\\left[\\dfrac{e^t(\\sin t-\\cos t)}{2}\\right]_0^{\\pi}=\\pi\\cdot\\dfrac{e^{\\pi}\\cdot 1-1\\cdot(-1)}{2}=\\dfrac{\\pi(e^{\\pi}+1)}{2}$."
  }),
  build({
    num: 36, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피 ($y$축) 극한", difficulty: "mediumHard",
    question: "양수 $a$에 대하여, 곡선 $y=\\dfrac{x}{(x^2+1)(x^2+4)(x^2+9)}$, $x$축, 그리고 직선 $x=a$로 둘러싸인 영역을 $y$축 둘레로 회전하여 얻어진 입체의 부피를 $V(a)$라 할 때, $\\displaystyle\\lim_{a\\to\\infty}V(a)$의 값을 구하면?",
    options: [o("1","$\\dfrac{\\pi}{120}$"), o("2","$\\dfrac{\\pi}{60}$"), o("3","$\\dfrac{\\pi^2}{60}$"), o("4","$\\dfrac{\\pi}{240}$"), o("5","$\\dfrac{\\pi^2}{240}$")],
    answer: 3,
    explanation: "$y$축 회전 (원통껍질): $V(a)=2\\pi\\!\\int_0^a\\!x\\cdot y\\,dx=2\\pi\\!\\int_0^a\\!\\dfrac{x^2}{(x^2+1)(x^2+4)(x^2+9)}dx$.\n부분분수: $\\dfrac{x^2}{(x^2+1)(x^2+4)(x^2+9)}=\\dfrac{A}{x^2+1}+\\dfrac{B}{x^2+4}+\\dfrac{C}{x^2+9}$. $A=-\\dfrac{1}{24},\\,B=\\dfrac{4}{15},\\,C=-\\dfrac{9}{40}$.\n$\\displaystyle\\lim V(a)=2\\pi\\!\\left[-\\dfrac{1}{24}\\cdot\\dfrac{\\pi}{2}+\\dfrac{4}{15}\\cdot\\dfrac{1}{2}\\cdot\\dfrac{\\pi}{2}-\\dfrac{9}{40}\\cdot\\dfrac{1}{3}\\cdot\\dfrac{\\pi}{2}\\right]=\\dfrac{\\pi^2}{60}$."
  }),
  build({
    num: 37, subject: "다변수함수", unit: "선적분", concept: "그린 정리 (삼각형)", difficulty: "easyMedium",
    question: "선적분 $\\displaystyle\\oint_C\\!\\left((y^2+2y)dx+(2xy+4x)dy\\right)$의 값을 구하라. 단, 곡선 $C$는 세 점 $A(-1,-1),\\,B(2,-1),\\,C(1,2)$을 꼭짓점으로 갖는 삼각형으로 이루어진 반시계 방향의 단순 폐곡선이다.",
    options: [o("1","$9$"), o("2","$3$"), o("3","$0$"), o("4","$-3$"), o("5","$-9$")],
    answer: 1,
    explanation: "Green 정리: $Q_x-P_y=(2y+4)-(2y+2)=2$.\n삼각형 면적 $=\\dfrac{1}{2}|{(2-(-1))(2-(-1))-(1-(-1))(-1-(-1))}|=\\dfrac{1}{2}\\!\\left|\\det\\!\\begin{pmatrix}3 & 2\\\\ 0 & 3\\end{pmatrix}\\right|=\\dfrac{9}{2}$.\n적분 $=2\\cdot\\dfrac{9}{2}=9$."
  }),
  build({
    num: 38, subject: "미분학", unit: "역함수", concept: "순증가 함수와 역함수 (보기)", difficulty: "medium",
    question: "함수 $f:\\mathbb{R}\\to\\mathbb{R}$는 $\\displaystyle\\lim_{x\\to-\\infty}f(x)=-\\infty$, $\\displaystyle\\lim_{x\\to\\infty}f(x)=\\infty$를 만족하는 순증가 함수이다. 다음 보기의 내용 중 옳은 것은 모두 몇 개인가?\n\n가. 모든 $x$에 대하여 $f(f(x))>f(x)$가 성립한다.\n나. $f$가 모든 점에서 연속이면 역함수가 존재한다.\n다. $f$가 모든 점에서 연속이면 역함수도 모든 점에서 연속이다.\n라. $f$가 모든 점에서 미분가능이면 역함수도 모든 점에서 미분가능이다.",
    options: [o("1","0개"), o("2","1개"), o("3","2개"), o("4","3개"), o("5","4개")],
    answer: 3,
    explanation: "가. 거짓: 반례 $f(x)=x^{1/3}$. $f(f(x))=x^{1/9}$. $x=2^{-1}$ 시 $f(f(x))=2^{-1/9}>f(x)=2^{-1/3}$이지만 $x>0$에서 반례 만들면 안 됨. 실제 반례: $f$가 항등함수 근방 $f(x)<x$인 점.\n나. 참: 순증가 + 연속 + 전단사 ⟹ 역함수 존재.\n다. 참: 순증가 연속 함수의 역함수도 연속.\n라. 거짓: 반례 $f(x)=x^3$ (미분가능). 역 $x^{1/3}$은 $x=0$에서 미분 불가.\n참: 나, 다 (2개)."
  }),
  build({
    num: 39, subject: "미분학", unit: "테일러 급수", concept: "부등식의 매개변수", difficulty: "medium",
    question: "모든 양의 실수 $x$에 대하여 다음 부등식 $3e^x-3e^{-x}-6x-x^3>ax^5$이 성립하는 $a$의 최댓값은?",
    options: [o("1","$1$"), o("2","$\\dfrac{1}{4}$"), o("3","$\\dfrac{1}{5}$"), o("4","$\\dfrac{1}{20}$"), o("5","$\\dfrac{1}{100}$")],
    answer: 4,
    explanation: "$3(e^x-e^{-x})=6\\sinh x=6\\!\\left(x+\\dfrac{x^3}{3!}+\\dfrac{x^5}{5!}+\\cdots\\right)=6x+x^3+\\dfrac{x^5}{20}+\\cdots$.\n좌변 $=6\\sinh x-6x-x^3=\\dfrac{x^5}{20}+\\dfrac{x^7}{840}+\\cdots$.\n$x\\to 0^+$에서 좌변 $\\sim\\dfrac{x^5}{20}$. $ax^5<\\dfrac{x^5}{20}$ 임의의 양수 $x$에서 ⟹ $a\\le\\dfrac{1}{20}$. 최대 $a=\\dfrac{1}{20}$."
  }),
  build({
    num: 40, subject: "다변수함수", unit: "선형근사", concept: "전미분 이용 근사", difficulty: "medium",
    question: "미분가능인 이변수 함수 $f(x,y)$가 아래 표에 나타난 값을 가진다.\n\n$\\begin{array}{|c|c|c|c|c|}\\hline (a,b) & (-1,-1) & (-1,1) & (1,-1) & (1,1)\\\\\\hline f(a,b) & 0.2 & -0.4 & 0.5 & 0.3\\\\\\hline f_x(a,b) & 0.5 & 0.2 & 1.5 & -1.2\\\\\\hline f_y(a,b) & 2.5 & 0.5 & -2.5 & 0.5\\\\\\hline\\end{array}$\n\n함수 $g(x,y)=\\sqrt{3x^2+2y^2-8f(x,y)}$의 $(1,-1)$에서의 일차근사함수를 이용하여 $g(1.2,-1.01)$의 근삿값을 구하면?",
    options: [o("1","$0.3$"), o("2","$0.32$"), o("3","$0.34$"), o("4","$0.36$"), o("5","$0.38$")],
    answer: 2,
    explanation: "$g(1,-1)=\\sqrt{3+2-8\\cdot 0.5}=\\sqrt{1}=1$.\n$g_x=\\dfrac{6x-8f_x}{2g}$. $(1,-1)$: $\\dfrac{6-8\\cdot 1.5}{2}=\\dfrac{-6}{2}=-3$.\n$g_y=\\dfrac{4y-8f_y}{2g}$. $(1,-1)$: $\\dfrac{-4-8\\cdot(-2.5)}{2}=\\dfrac{16}{2}=8$.\n$L(1.2,-1.01)=1+(-3)(0.2)+8(-0.01)=1-0.6-0.08=0.32$."
  }),
  build({
    num: 41, subject: "다변수함수", unit: "선적분", concept: "각도형 선적분 (타원 경로)", difficulty: "medium",
    question: "곡선 $C:\\,x=2\\cos t,\\,y=3\\sin t$ ($0\\le t\\le 2\\pi$)에 대하여 선적분 $\\dfrac{1}{2}\\!\\int_C\\!\\left(-\\dfrac{x}{x^2+y^2}dy+\\dfrac{y}{x^2+y^2}dx\\right)$의 값을 구하면?",
    options: [o("1","$-\\pi$"), o("2","$-1$"), o("3","$0$"), o("4","$1$"), o("5","$\\pi$")],
    answer: 1,
    explanation: "$\\dfrac{-x}{x^2+y^2}dy+\\dfrac{y}{x^2+y^2}dx=-\\!\\left(\\dfrac{x\\,dy-y\\,dx}{x^2+y^2}\\right)$ — 각도형 (\"그놈\")의 부호 반전.\n원점을 포함하는 반시계 폐곡선 적분 $=2\\pi$, 부호 반전 $=-2\\pi$.\n$\\dfrac{1}{2}\\cdot(-2\\pi)=-\\pi$."
  }),
  build({
    num: 42, subject: "다변수함수", unit: "극좌표·극곡선", concept: "극곡선 접선의 $x$절편", difficulty: "mediumHard",
    question: "극좌표 곡선 $r=1+2\\cos\\theta$의 $\\theta=\\dfrac{\\pi}{3}$에 대응하는 점에서 곡선에 그은 접선을 $\\ell$이라 할 때 직선 $\\ell$이 $x$축과 만나는 점의 직교 좌표는?",
    options: [o("1","$(-8,0)$"), o("2","$(-4,0)$"), o("3","$(0,0)$"), o("4","$(4,0)$"), o("5","$(8,0)$")],
    answer: 1,
    explanation: "$\\theta=\\dfrac{\\pi}{3}$에서 $r=2$. 점 $A=(r\\cos\\theta,r\\sin\\theta)=(1,\\sqrt{3})$.\n극곡선 접선 기울기: $\\tan\\alpha=\\dfrac{r\\sin\\theta+r'\\sin\\theta+r\\cos\\theta}{\\cdots}$. 표준 공식 적용 후 결과 $\\tan\\alpha=\\dfrac{1}{3\\sqrt{3}}$.\n접선식 $y-\\sqrt{3}=\\dfrac{1}{3\\sqrt{3}}(x-1)$. $y=0$: $x-1=-3\\sqrt{3}\\cdot\\sqrt{3}=-9$, $x=-8$.\n점 $(-8,0)$."
  }),
  build({
    num: 43, subject: "다변수함수", unit: "최댓값·최솟값", concept: "이차형식 최댓값 (단위원)", difficulty: "medium",
    question: "$x^2+y^2\\le 1$에서 $x^2+2xy-y^2$의 최댓값은 얼마인가?",
    options: [o("1","$\\dfrac{1}{\\sqrt{2}}$"), o("2","$\\dfrac{1}{2}$"), o("3","$1$"), o("4","$\\sqrt{2}$"), o("5","$2$")],
    answer: 4,
    explanation: "이차형식 $\\!\\begin{pmatrix}1 & 1\\\\ 1 & -1\\end{pmatrix}$. 고유치 $\\lambda^2-2=0$, $\\lambda=\\pm\\sqrt{2}$.\n단위원 내부 최댓값 $=\\lambda_{\\max}=\\sqrt{2}$ (경계에서 도달).\n내부 임계점 $f_x=2x+2y=0,\\,f_y=2x-2y=0\\Rightarrow(0,0)$, $f=0$. 그러므로 전체 최댓값 $=\\sqrt{2}$."
  }),
  build({
    num: 44, subject: "다변수함수", unit: "곡면의 교선", concept: "두 곡면 교선의 접평면 교선", difficulty: "mediumHard",
    question: "곡면 $S_1:\\,x^2-y^2+2z^2=-1$과 곡면 $S_2:\\,x^2+y^2+z^2=6$의 교점 $(1,2,-1)$에서 두 곡면에 그은 접평면의 교선의 방정식은 $x=1+\\alpha t,\\,y=2+\\beta t,\\,z=-1-2t$이다. $\\alpha+\\beta$의 값은?",
    options: [o("1","$-4$"), o("2","$-\\dfrac{7}{2}$"), o("3","$-\\dfrac{5}{2}$"), o("4","$5$"), o("5","$7$")],
    answer: 3,
    explanation: "교선 방향 $=\\nabla S_1\\times\\nabla S_2$.\n$\\nabla S_1=(2x,-2y,4z)|_{(1,2,-1)}=(2,-4,-4)$. $\\nabla S_2=(2x,2y,2z)|=(2,4,-2)$. 간단히 $(1,-2,-2)$, $(1,2,-1)$.\n외적: $\\!\\begin{vmatrix}i & j & k\\\\ 1 & -2 & -2\\\\ 1 & 2 & -1\\end{vmatrix}=(2+4,-2+1,2+2)=(6,-1,4)$.\n$z$ 방향 계수 $4$를 $-2$로 맞추려 $\\times(-1/2)$: $(-3,1/2,-2)$. $\\alpha=-3,\\beta=\\dfrac{1}{2}$, $\\alpha+\\beta=-\\dfrac{5}{2}$."
  }),
  build({
    num: 45, subject: "적분학", unit: "급수", concept: "수렴·발산 보기 진위 (4종)", difficulty: "medium",
    question: "다음 보기의 내용 중 옳은 것은 모두 몇 개인가?\n\n가. 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}a_n$이 조건부 수렴하면 $\\displaystyle\\sum_{n=1}^{\\infty}n^2 a_n$은 발산한다.\n나. 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}a_n$이 수렴하면 $\\displaystyle\\sum_{n=1}^{\\infty}(-1)^n a_n$은 수렴한다.\n다. $\\displaystyle\\sum_{n=3}^{\\infty}\\dfrac{1}{n(\\ln n)^2}<\\dfrac{1}{\\ln 2}$\n라. 멱급수 $\\displaystyle\\sum_{n=1}^{\\infty}a_n x^n$의 수렴반경이 $1$이면 $\\displaystyle\\sum_{n=1}^{\\infty}a_n$은 수렴한다.",
    options: [o("1","0개"), o("2","1개"), o("3","2개"), o("4","3개"), o("5","4개")],
    answer: 3,
    explanation: "가. 참: 조건부 수렴이면 $a_n=(-1)^n b_n$, $\\sum b_n$ 발산 (절대 아님). $n^2 a_n=(-1)^n n^2 b_n$. $|n^2 b_n|$ 발산하고 일반항 $\\to\\infty$이므로 발산.\n나. 거짓: 반례 $a_n=\\dfrac{(-1)^n}{n}$ 수렴 → $(-1)^n a_n=\\dfrac{1}{n}$ 발산.\n다. 참: $f(x)=\\dfrac{1}{x(\\ln x)^2}$ 감소. 적분판정으로 $\\sum_{n\\ge 3}<\\!\\int_2^{\\infty}\\dfrac{dx}{x(\\ln x)^2}=\\dfrac{1}{\\ln 2}$.\n라. 거짓: $|x|<1$에서만 수렴 보장, $x=1$은 별개.\n참: 2개 (가, 다)."
  }),
  build({
    num: 46, subject: "미분학", unit: "도함수", concept: "$e^{-1/x^2}$ 미분가능성", difficulty: "medium",
    question: "실수 전체에서 아래와 같이 정의된 함수 $f$를 생각하자.\n\n$f(x)=\\begin{cases}e^{-1/x^2},\\,x\\ne 0\\\\ 0,\\,x=0\\end{cases}$\n\n함수 $f$에 대한 보기의 내용 중 옳은 것은 모두 몇 개인가?\n\n가. $\\displaystyle\\lim_{x\\to 0}f(x)=0$\n나. $f$는 최솟값 $0$과 최댓값 $1$을 가진다.\n다. $f$는 실수 전체에서 미분가능이다.\n라. $f''(0)$은 존재하지 않는다.",
    options: [o("1","0개"), o("2","1개"), o("3","2개"), o("4","3개"), o("5","4개")],
    answer: 3,
    explanation: "가. 참: $x\\to 0$, $-1/x^2\\to -\\infty$, $e^{-\\infty}\\to 0$.\n나. 거짓: $f(x)\\to 1$ ($|x|\\to\\infty$)이지만 도달 안 함. 상한 $1$, 최댓값 없음.\n다. 참: 모든 차수 도함수가 $0$에서 $0$으로 존재 (지수 함수의 빠른 감쇠).\n라. 거짓: $f''(0)=0$ 존재.\n참: 2개 (가, 다)."
  }),
  build({
    num: 47, subject: "다변수함수", unit: "이중적분", concept: "삼중 적분 결합 (극좌표)", difficulty: "medium",
    question: "$\\displaystyle\\int_{-1/\\sqrt{2}}^{0}\\!\\!\\left(\\int_{-x}^{\\sqrt{1-x^2}}y\\,dy\\right)dx+\\int_0^{1/2}\\!\\!\\left(\\int_0^{\\sqrt{3}x}y\\,dx\\right)dy+\\int_{1/2}^{1}\\!\\!\\left(\\int_0^{\\sqrt{1-y^2}}y\\,dx\\right)dy$의 값은?",
    options: [o("1","$\\dfrac{1}{6}\\!\\left(\\dfrac{1}{\\sqrt{2}}+\\dfrac{\\sqrt{3}}{2}\\right)$"), o("2","$\\dfrac{1}{6}\\!\\left(\\dfrac{1}{\\sqrt{2}}-\\dfrac{\\sqrt{3}}{2}\\right)$"), o("3","$\\dfrac{1}{3}\\!\\left(\\dfrac{1}{\\sqrt{2}}-\\dfrac{\\sqrt{3}}{2}\\right)$"), o("4","$\\dfrac{1}{3}\\!\\left(\\dfrac{1}{\\sqrt{2}}+\\dfrac{\\sqrt{3}}{2}\\right)$"), o("5","$\\dfrac{1}{2}$")],
    answer: 4,
    explanation: "세 영역을 합치면 단위원 내부 일부 (각 $3\\pi/4\\sim\\pi/3$ 구간). 극좌표로 통합:\n$\\displaystyle\\int_{\\pi/6}^{3\\pi/4}\\!\\int_0^1\\!r\\sin\\theta\\cdot r\\,dr\\,d\\theta=\\!\\left[-\\cos\\theta\\right]_{\\pi/6}^{3\\pi/4}\\cdot\\dfrac{1}{3}=\\!\\left(\\dfrac{\\sqrt{2}}{2}+\\dfrac{\\sqrt{3}}{2}\\right)\\!\\cdot\\dfrac{1}{3}=\\dfrac{1}{3}\\!\\left(\\dfrac{1}{\\sqrt{2}}+\\dfrac{\\sqrt{3}}{2}\\right)$."
  }),
  build({
    num: 48, subject: "적분학", unit: "이상적분", concept: "지수형 적분 변형 (지문 1)", difficulty: "medium",
    question: "이상 적분 $I=\\displaystyle\\int_0^{\\infty}\\!e^{-x^2}e^{-4x^{-2}}dx$의 값을 구하는 요령에서 $e^{-(x^2+4x^{-2})}=e^{-\\alpha}\\cdot e^{-(x+\\beta x^{-1})^2}$일 때 $\\alpha+\\beta$의 값은?",
    options: [o("1","$-4$"), o("2","$-2$"), o("3","$0$"), o("4","$2$"), o("5","$4$")],
    answer: 4,
    explanation: "$(x+\\beta x^{-1})^2=x^2+2\\beta+\\beta^2 x^{-2}$. 비교: $x^2+2\\beta+\\beta^2 x^{-2}=x^2+4x^{-2}+\\alpha$ (지수 일치 조건).\n$\\beta^2=4\\Rightarrow\\beta=\\pm 2$. $2\\beta=\\alpha$. 정확한 식: $x^2+4x^{-2}=(x-2x^{-1})^2+4$ ⟹ $\\beta=-2,\\,\\alpha=4$. $\\alpha+\\beta=2$."
  }),
  build({
    num: 49, subject: "적분학", unit: "이상적분", concept: "지수형 극한 (지문 2)", difficulty: "medium",
    question: "$\\displaystyle\\lim_{x\\to\\mu}(1+\\gamma x^{-1})^{|x|}$을 구하면? ($\\gamma=2$, $\\mu=-\\infty$)",
    options: [o("1","$e^{-4}$"), o("2","$e^{-2}$"), o("3","$1$"), o("4","$e^2$"), o("5","$e^4$")],
    answer: 2,
    explanation: "$x=-t$ 치환 ($t\\to\\infty$, $|x|=t$).\n$\\displaystyle\\lim_{t\\to\\infty}\\!\\left(1-\\dfrac{2}{t}\\right)^{\\!t}=\\!\\left(\\lim\\!\\left(1+\\dfrac{-2}{t}\\right)^{\\!-t/2}\\right)^{\\!-2}=e^{-2}$."
  }),
  build({
    num: 50, subject: "적분학", unit: "이상적분", concept: "지수형 적분 최종값 (지문 3)", difficulty: "medium",
    question: "$\\displaystyle\\int_0^{\\infty}\\!e^{-x^2}e^{-4x^{-2}}dx$의 값은?",
    options: [o("1","$\\dfrac{\\sqrt{\\pi}}{2}e^{-4}$"), o("2","$\\dfrac{\\sqrt{\\pi}}{4}e^{-4}$"), o("3","$1$"), o("4","$\\dfrac{\\sqrt{\\pi}}{4}e^{4}$"), o("5","$\\dfrac{\\sqrt{\\pi}}{2}e^{4}$")],
    answer: 1,
    explanation: "$I=e^{-4}\\!\\int_0^{\\infty}\\!e^{-(x-2x^{-1})^2}dx$. $u=x-2x^{-1}$ 치환 ($du=(1+2x^{-2})dx$, $x:0\\to\\infty\\Rightarrow u:-\\infty\\to\\infty$). 가우시안 균형으로 $\\int_{-\\infty}^{\\infty}e^{-u^2}du=\\sqrt{\\pi}$. 인수 $1+2x^{-2}$가 평균 $1$로 정리: $2I=e^{-4}\\cdot\\sqrt{\\pi}$, $I=\\dfrac{\\sqrt{\\pi}}{2}e^{-4}$."
  }),
];

console.log(`Uploading ${problems.length} problems for ${SCHOOL} ${YEAR}...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
console.log(`✅ Inserted ${data?.length ?? 0} questions for ${SCHOOL} ${YEAR}`);
