// Upload 2023년도 아주대 편입수학 기출 25문항 (5지선다, 문제 26~50)
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
const YEAR = "2023";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-ajou-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 26, subject: "미분학", unit: "역삼각함수", concept: "역삼각함수 합성의 성립범위", difficulty: "medium",
    question: "다음 중 옳지 $\\mathbf{않은}$ 것을 고르라.\n\n(1) $-1\\le x\\le 1$인 모든 실수 $x$에 대하여 $\\sin^{-1}(\\sin x)=x$가 성립한다.\n(2) $-1\\le x\\le 1$인 모든 실수 $x$에 대하여 $\\cos^{-1}(\\cos x)=x$가 성립한다.\n(3) $-1\\le x\\le 1$인 모든 실수 $x$에 대하여 $\\sin(\\sin^{-1}x)=x$가 성립한다.\n(4) $-1\\le x\\le 1$인 모든 실수 $x$에 대하여 $\\cos(\\cos^{-1}x)=x$가 성립한다.\n(5) $-1<x<1$인 모든 실수 $x$에 대하여 $\\tan(\\sin^{-1}x)=\\dfrac{x}{\\sqrt{1-x^2}}$가 성립한다.",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)"), o("5","(5)")],
    answer: 2,
    explanation: "$\\sin^{-1}(\\sin x)=x$ 성립범위: $-\\dfrac{\\pi}{2}\\le x\\le\\dfrac{\\pi}{2}$. $[-1,1]\\subset[-\\pi/2,\\pi/2]$이므로 (1) 참.\n$\\cos^{-1}(\\cos x)=x$ 성립범위: $0\\le x\\le\\pi$. $[-1,1]\\not\\subset[0,\\pi]$ ($x=-0.5$는 거짓)이므로 (2) 거짓.\n(3) $\\sin\\circ\\sin^{-1}$은 $[-1,1]$에서 항등함수. 참.\n(4) $\\cos\\circ\\cos^{-1}$은 $[-1,1]$에서 항등함수. 참.\n(5) $\\sin^{-1}x=\\theta$라 하면 $\\sin\\theta=x,\\,\\cos\\theta=\\sqrt{1-x^2}$, $\\tan\\theta=\\dfrac{x}{\\sqrt{1-x^2}}$. 참."
  }),
  build({
    num: 27, subject: "적분학", unit: "정적분", concept: "부등식·비교·M-급수", difficulty: "medium",
    question: "다음 보기의 내용 중 옳은 것은 모두 몇 개인가?\n\n가. $\\displaystyle\\int_0^{1}\\!\\sqrt{1+x^4}\\,dx\\le 1.2$\n나. $\\displaystyle\\int_2^{4}\\!\\dfrac{x^4}{x^6+x^3+1}\\,dx\\le 0.25$\n다. $\\displaystyle\\int_0^{\\pi/6}\\!\\cos(x^2)\\,dx\\ge 0.5$\n라. $\\displaystyle\\int_0^{\\pi/6}\\!\\sin^{-1}(x^2)\\,dx\\ge\\!\\int_0^{\\pi/6}\\!\\sin(x^2)\\,dx$",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개"), o("5","$4$개")],
    answer: 5,
    explanation: "가. $\\sqrt{1+x^4}\\le 1+\\dfrac{1}{2}x^4$ (M-급수, 교대급수 초항 추정). $\\int_0^1(1+\\dfrac{x^4}{2})dx=1+\\dfrac{1}{10}=1.1\\le 1.2$. 참.\n나. $\\dfrac{x^4}{x^6+x^3+1}\\le\\dfrac{x^4}{x^6}=\\dfrac{1}{x^2}$. $\\int_2^4\\dfrac{dx}{x^2}=\\dfrac{1}{4}=0.25$. 참.\n다. $0\\le x\\le\\pi/6<1$에서 $x^2<x$, $\\cos x$ 감소이므로 $\\cos(x^2)\\ge\\cos x$. $\\int_0^{\\pi/6}\\cos x\\,dx=\\sin(\\pi/6)=\\dfrac{1}{2}$. 참.\n라. $0\\le u\\le 1$에서 $\\sin^{-1}u\\ge\\sin u$ (테일러 비교). $u=x^2$ 대입해 적분비교 성립. 참.\n네 개 모두 참."
  }),
  build({
    num: 28, subject: "미분학", unit: "역삼각함수", concept: "$\\sin(2\\sin^{-1}\\cdot)$", difficulty: "easy",
    question: "$\\sin\\!\\left(2\\sin^{-1}\\!\\left(-\\dfrac{1}{3}\\right)\\right)$를 간단히 하라.",
    options: [o("1","$-\\dfrac{1}{9}\\sqrt 2$"), o("2","$\\dfrac{1}{9}\\sqrt 2$"), o("3","$-\\dfrac{4}{9}\\sqrt 2$"), o("4","$\\dfrac{4}{9}\\sqrt 2$"), o("5","$-\\dfrac{2}{3}$")],
    answer: 3,
    explanation: "$\\sin^{-1}\\!\\left(\\dfrac{1}{3}\\right)=\\alpha$라 두면 $\\sin\\alpha=\\dfrac{1}{3},\\,\\cos\\alpha=\\dfrac{2\\sqrt 2}{3}$.\n$\\sin(2\\sin^{-1}(-1/3))=-\\sin(2\\alpha)=-2\\sin\\alpha\\cos\\alpha=-2\\cdot\\dfrac{1}{3}\\cdot\\dfrac{2\\sqrt 2}{3}=-\\dfrac{4\\sqrt 2}{9}$."
  }),
  build({
    num: 29, subject: "미분학", unit: "극한과 연속", concept: "테일러 급수 극한", difficulty: "easy",
    question: "다음 극한 $\\displaystyle\\lim_{x\\to 0}\\!\\dfrac{\\sin^{-1}x-x}{x^3}$의 값은?",
    options: [o("1","$\\dfrac{1}{6}$"), o("2","$-\\dfrac{1}{6}$"), o("3","$\\dfrac{1}{2}$"), o("4","$-\\dfrac{1}{2}$"), o("5","발산")],
    answer: 1,
    explanation: "$\\sin^{-1}x=x+\\dfrac{x^3}{6}+\\dfrac{3}{40}x^5+\\cdots$.\n$\\dfrac{\\sin^{-1}x-x}{x^3}=\\dfrac{1}{6}+\\dfrac{3}{40}x^2+\\cdots\\to\\dfrac{1}{6}$."
  }),
  build({
    num: 30, subject: "적분학", unit: "정적분", concept: "리만합·정적분 변환", difficulty: "mediumHard",
    question: "다음 극한 $\\displaystyle\\lim_{n\\to\\infty}\\sum_{k=1}^{n}\\dfrac{\\sqrt n+k}{n^2}\\sin\\!\\left(\\dfrac{\\pi k}{n}+\\dfrac{\\sqrt{2\\pi}}{\\sqrt n}\\right)$의 값은?",
    options: [o("1","발산"), o("2","$\\pi$"), o("3","$1$"), o("4","$\\dfrac{1}{\\pi}$"), o("5","$0$")],
    answer: 4,
    explanation: "$\\dfrac{\\sqrt n}{n^2}\\sum_{k=1}^n\\sin(\\cdots)\\to 0$ ($\\sqrt n/n^2\\cdot n=1/\\sqrt n\\to 0$, $\\sin$은 유계).\n남은 부분: $\\sum_{k=1}^n\\dfrac{k}{n^2}\\sin(\\pi k/n+\\sqrt{2\\pi}/\\sqrt n)=\\sum\\dfrac{k}{n}\\sin(\\pi k/n+\\sqrt{2\\pi}/\\sqrt n)\\cdot\\dfrac{1}{n}\\to\\!\\int_0^1\\!x\\sin(\\pi x)\\,dx$.\n$\\!\\int_0^1\\!x\\sin(\\pi x)\\,dx=\\!\\left[-\\dfrac{x\\cos(\\pi x)}{\\pi}+\\dfrac{\\sin(\\pi x)}{\\pi^2}\\right]_0^1=\\dfrac{1}{\\pi}$."
  }),
  build({
    num: 31, subject: "적분학", unit: "급수", concept: "급수 수렴 성질·반례", difficulty: "hard",
    question: "실수 수열 $\\{a_n\\}$에 대한 다음 보기의 내용 중 옳은 것은 모두 몇 개인가?\n\n가. 수열 $\\{a_n^2\\}$이 단조감소이고 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}a_n^2$이 수렴하면 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}(-1)^n a_n$은 수렴한다.\n나. 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}a_n^2$이 발산하면 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}a_n^4$은 발산한다.\n다. 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}a_n^2$이 발산하면 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}a_n$은 발산한다.\n라. 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}(a_n+|a_n|)$이 수렴하면 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}a_n^2$은 수렴한다.",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개"), o("5","$4$개")],
    answer: 2,
    explanation: "가. [참] $b_n=a_n^2\\ge 0$ 단조감소·수렴이므로 $b_n\\to 0$. $|a_n|=\\sqrt{b_n}\\to 0$ 단조감소. 교대급수 판정법으로 $\\sum(-1)^n a_n$ 수렴.\n나. [거짓] 반례 $a_n=\\dfrac{1}{\\sqrt n}$: $\\sum a_n^2=\\sum\\dfrac{1}{n}$ 발산, $\\sum a_n^4=\\sum\\dfrac{1}{n^2}$ 수렴.\n다. [거짓] 반례 $a_n=\\dfrac{(-1)^n}{\\sqrt n}$: $\\sum a_n^2$ 발산, $\\sum a_n$은 교대급수 수렴.\n라. [거짓] 반례 $a_n=-\\dfrac{1}{\\sqrt n}$: $a_n+|a_n|=0$ 수렴, $\\sum a_n^2=\\sum\\dfrac{1}{n}$ 발산.\n참은 가. 1개."
  }),
  build({
    num: 32, subject: "적분학", unit: "특이적분", concept: "수렴/발산 판정", difficulty: "medium",
    question: "다음 보기에서 수렴하는 이상 적분(improper integral)은 모두 몇 개인가?\n\n가. $\\displaystyle\\int_0^{\\pi/2}\\!\\dfrac{1}{\\sqrt{\\sin x}}\\,dx$  나. $\\displaystyle\\int_0^{\\pi/2}\\!\\dfrac{x}{\\sqrt{\\cos^3 x}}\\,dx$  다. $\\displaystyle\\int_{2023}^{\\infty}\\!e^{-\\sqrt{\\ln x}}\\,dx$  라. $\\displaystyle\\int_{2023}^{\\infty}\\!\\dfrac{\\cos x}{x}\\,dx$",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개"), o("5","$4$개")],
    answer: 3,
    explanation: "가. $x\\to 0$에서 $\\sin x\\sim x$, $\\dfrac{1}{\\sqrt{\\sin x}}\\sim\\dfrac{1}{\\sqrt x}$, $p=1/2<1$이라 수렴.\n나. $x\\to\\pi/2$에서 $\\cos x\\sim\\pi/2-x$, 분모 $(\\pi/2-x)^{3/2}$, $p=3/2\\ge 1$이라 발산.\n다. $\\sqrt{\\ln x}=t$ 치환: $x=e^{t^2},\\,dx=2te^{t^2}\\,dt$. 적분 $\\to 2\\!\\int te^{t^2-t}\\,dt$ 발산($t^2$ 우세).\n라. 디리클레 판정법으로 $\\!\\int\\dfrac{\\cos x}{x}\\,dx$ 수렴.\n수렴: 가, 라. 2개."
  }),
  build({
    num: 33, subject: "적분학", unit: "정적분", concept: "역함수 적분", difficulty: "medium",
    question: "연속인 순증가 함수 $f:[0,2]\\to[2,\\,2\\sqrt 5]$가 $f(0)=2,\\,f(2)=2\\sqrt 5$, 그리고 $\\displaystyle\\int_0^{2}\\!\\sqrt{f(x)^2+5}\\,dx=7$을 만족한다. 이때 $\\displaystyle\\int_3^{5}\\!g(\\sqrt{x^2-5})\\,dx$의 값은? (단, $g$는 $f$의 역함수)",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 3,
    explanation: "$h(x)=\\sqrt{f(x)^2+5}$라 하면 $h(0)=3,\\,h(2)=5$, $\\!\\int_0^2 h(x)\\,dx=7$.\n$h^{-1}(y)=g(\\sqrt{y^2-5})$ ($y=\\sqrt{f(x)^2+5}\\Leftrightarrow x=g(\\sqrt{y^2-5})$).\n역함수 적분: $\\!\\int_0^2 h\\,dx+\\!\\int_3^5 h^{-1}(y)\\,dy=2\\cdot 5-0\\cdot 3=10$.\n$\\!\\int_3^5 g(\\sqrt{y^2-5})\\,dy=10-7=3$."
  }),
  build({
    num: 34, subject: "적분학", unit: "정적분", concept: "$\\ln$ 치환", difficulty: "easy",
    question: "정적분 $\\displaystyle\\int_{1/e}^{1}\\!\\dfrac{(\\ln x)^2}{x^2}\\,dx$의 값은?",
    options: [o("1","$e-2$"), o("2","$1-\\dfrac{1}{e}$"), o("3","$1-\\dfrac{2}{e}$"), o("4","$\\dfrac{e}{2}-1$"), o("5","$e-1$")],
    answer: 1,
    explanation: "$\\ln x=t$ 치환: $x=e^t,\\,dx=e^t\\,dt$. 구간 $t:-1\\to 0$.\n$\\displaystyle\\!\\int_{-1}^{0}\\!\\dfrac{t^2}{e^{2t}}e^t\\,dt=\\!\\int_{-1}^{0}t^2 e^{-t}\\,dt$.\n부분적분: $\\!\\int t^2 e^{-t}dt=-(t^2+2t+2)e^{-t}+C$.\n$[-(t^2+2t+2)e^{-t}]_{-1}^{0}=-2-(-(1-2+2)e)=-2+e=e-2$."
  }),
  build({
    num: 35, subject: "적분학", unit: "급수", concept: "테일러 다항식 오차", difficulty: "hard",
    question: "정적분 함수 $F(x)=\\displaystyle\\int_0^{x}\\!\\cos(t^2)\\,dt$를 $F$의 $5$차 Maclaurin 다항식 $P_5(x)$로 근사한다. $E(x)=F(x)-P_5(x)$일 때 다음 보기에서 옳은 것은 모두 몇 개인가?\n\n가. $E(0.1)>0$\n나. $E(-0.1)<0$\n다. $E(1)<\\dfrac{1}{200}$\n라. $[-1,1]$에서 $|F^{(9)}(x)|$의 최댓값을 $M$이라 하면 $E(1)\\le\\dfrac{M}{9!}$",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개"), o("5","$4$개")],
    answer: 5,
    explanation: "$F(x)=x-\\dfrac{x^5}{10}+\\dfrac{x^9}{216}-\\cdots$. $P_5(x)=x-\\dfrac{x^5}{10}$, $E(x)=\\dfrac{x^9}{216}-\\dfrac{x^{13}}{120\\cdot 13}+\\cdots$.\n가. $E(0.1)=\\dfrac{(0.1)^9}{216}-\\cdots>0$ (교대급수 첫 항 양수). 참.\n나. $E(-0.1)<0$ (홀함수). 참.\n다. $E(1)=\\dfrac{1}{216}-\\dfrac{1}{120\\cdot 13}+\\cdots<\\dfrac{1}{216}<\\dfrac{1}{200}$. 참.\n라. $F$가 $4k+1$차 항만 가지므로 $P_5=P_8$. 8차 라그랑주 잉여항 $R_8(x)=\\dfrac{F^{(9)}(\\xi)}{9!}x^9$. $|E(1)|\\le\\dfrac{M}{9!}$. 참.\n네 개 모두 참."
  }),
  build({
    num: 36, subject: "적분학", unit: "급수", concept: "교대급수·적분판정(중첩 로그)", difficulty: "hard",
    question: "수열 $\\!\\left\\{a_n=\\dfrac{(-1)^n}{n^{1/4}(\\ln n)^{1/4}(\\ln(\\ln n))^{1/3}}:n=3,4,5,\\ldots\\right\\}$에 대하여 다음 보기에서 수렴하는 것은 모두 몇 개인가?\n\n가. $\\displaystyle\\sum_{n=3}^{\\infty}a_n$  나. $\\displaystyle\\sum_{n=3}^{\\infty}a_n^2$  다. $\\displaystyle\\sum_{n=3}^{\\infty}a_n^3$  라. $\\displaystyle\\sum_{n=3}^{\\infty}a_n^4$",
    options: [o("1","$4$개"), o("2","$3$개"), o("3","$2$개"), o("4","$1$개"), o("5","$0$개")],
    answer: 2,
    explanation: "가. 교대급수: $|a_n|\\to 0$ 단조감소. 수렴.\n나. $\\sum\\dfrac{1}{n^{1/2}(\\ln n)^{1/2}(\\ln(\\ln n))^{2/3}}$: 적분판정으로 발산.\n다. 교대급수: $\\sum\\dfrac{(-1)^n}{n^{3/4}(\\ln n)^{3/4}\\ln(\\ln n)}$, $|a_n^3|\\to 0$. 수렴.\n라. $\\sum\\dfrac{1}{n(\\ln n)(\\ln(\\ln n))^{4/3}}$: $u=\\ln(\\ln n)$ 치환 후 $\\!\\int 1/u^{4/3}\\,du$, $p=4/3>1$ 수렴.\n수렴: 가, 다, 라. 3개."
  }),
  build({
    num: 37, subject: "적분학", unit: "특이적분", concept: "$e^{-x}\\sin x$ 형식", difficulty: "medium",
    question: "다음 이상 적분 $\\displaystyle\\int_0^{1}\\!\\sin(\\ln x)\\,dx$의 값은?",
    options: [o("1","존재하지 않음"), o("2","$-\\dfrac{1}{2}$"), o("3","$\\dfrac{1}{2}$"), o("4","$-2$"), o("5","$2$")],
    answer: 2,
    explanation: "$\\ln x=u$ 치환: $x=e^u,\\,dx=e^u\\,du$. 구간 $u:-\\infty\\to 0$.\n$\\displaystyle\\!\\int_{-\\infty}^{0}\\!\\sin u\\cdot e^u\\,du=\\!\\left[\\dfrac{e^u(\\sin u-\\cos u)}{2}\\right]_{-\\infty}^{0}=\\dfrac{1\\cdot(0-1)}{2}-0=-\\dfrac{1}{2}$."
  }),
  build({
    num: 38, subject: "다변수함수", unit: "벡터해석", concept: "곡면의 넓이", difficulty: "medium",
    question: "곡면 $z=\\sqrt{15}x+y^3+5$의 일부 $S$를 $xy$-평면 상으로 정사영하여 얻은 영역이 $R=\\!\\left\\{(x,y):x^{1/3}\\le y\\le 1,\\,0\\le x\\le 1\\right\\}$이다. $S$의 넓이는?",
    options: [o("1","$\\dfrac{61}{54}$"), o("2","$\\dfrac{61}{27}$"), o("3","$\\dfrac{61\\sqrt 5}{54}$"), o("4","$\\dfrac{61\\sqrt 5}{27}$"), o("5","$\\dfrac{61}{27}(\\sqrt 5-1)$")],
    answer: 1,
    explanation: "$z_x=\\sqrt{15},\\,z_y=3y^2$. $\\sqrt{1+z_x^2+z_y^2}=\\sqrt{16+9y^4}$.\n순서변경 $0\\le y\\le 1,\\,0\\le x\\le y^3$:\n$\\displaystyle S=\\!\\int_0^1\\!\\int_0^{y^3}\\!\\sqrt{16+9y^4}\\,dx\\,dy=\\!\\int_0^1\\!y^3\\sqrt{16+9y^4}\\,dy$.\n$u=16+9y^4,\\,du=36y^3\\,dy$: $=\\dfrac{1}{36}\\cdot\\dfrac{2}{3}[u^{3/2}]_{16}^{25}=\\dfrac{125-64}{54}=\\dfrac{61}{54}$."
  }),
  build({
    num: 39, subject: "다변수함수", unit: "편도함수", concept: "선형근사함수", difficulty: "easy",
    question: "영역 $R=\\{(x,y):|x|\\le 1,|y|\\le 1\\}$에서 정의된 이변수 함수 $f(x,y)=x^2+y^2+2x^2y$에 대해, $f$의 $\\left(\\dfrac{1}{2},\\dfrac{1}{2}\\right)$에서의 선형근사 함수가 $L(x,y)=ax+by+c$일 때 $a+b+c$의 값은?",
    options: [o("1","$\\dfrac{3}{2}$"), o("2","$2$"), o("3","$\\dfrac{7}{2}$"), o("4","$4$"), o("5","$\\dfrac{9}{2}$")],
    answer: 5,
    explanation: "$f(\\tfrac{1}{2},\\tfrac{1}{2})=\\dfrac{1}{4}+\\dfrac{1}{4}+2\\cdot\\dfrac{1}{4}\\cdot\\dfrac{1}{2}=\\dfrac{11}{4}$.\n$f_x=2x+4xy$, $f_x(\\tfrac{1}{2},\\tfrac{1}{2})=1+1=2$.\n$f_y=2y+2x^2$, $f_y(\\tfrac{1}{2},\\tfrac{1}{2})=1+\\dfrac{1}{2}=\\dfrac{3}{2}$.\n$L(x,y)=\\dfrac{11}{4}+2(x-\\tfrac{1}{2})+\\dfrac{3}{2}(y-\\tfrac{1}{2})=2x+\\dfrac{3}{2}y+1$.\n$a+b+c=2+\\dfrac{3}{2}+1=\\dfrac{9}{2}$."
  }),
  build({
    num: 40, subject: "다변수함수", unit: "다변수함수의 극값", concept: "임계점·판정", difficulty: "medium",
    question: "위(39번 설정)에서 함수 $f$는 영역 $R$의 내부에서 (가)개의 임계점을 가지며 그 중 극대점은 (나)개, 극소점은 (다)개이다. (가)+(나)+(다)의 합은?",
    options: [o("1","$2$"), o("2","$3$"), o("3","$4$"), o("4","$5$"), o("5","$6$")],
    answer: 3,
    explanation: "$f_x=2x(1+2y)=0\\Rightarrow x=0$ 또는 $y=-\\dfrac{1}{2}$. $f_y=2y+2x^2=0\\Rightarrow y=-x^2$.\n(i) $x=0$: $y=0$. 임계점 $(0,0)$.\n(ii) $y=-\\dfrac{1}{2}$: $x^2=\\dfrac{1}{2}$, $x=\\pm\\dfrac{1}{\\sqrt 2}$. 임계점 $(\\pm\\dfrac{1}{\\sqrt 2},-\\dfrac{1}{2})$.\n총 3개.\n$f_{xx}=2+4y,\\,f_{yy}=2,\\,f_{xy}=4x$. $D=f_{xx}f_{yy}-f_{xy}^2$.\n$(0,0)$: $D=4>0,\\,f_{xx}=2>0$ → 극소.\n$(\\pm\\dfrac{1}{\\sqrt 2},-\\dfrac{1}{2})$: $D=0-8=-8<0$ → 안장점.\n(가)+(나)+(다)$=3+0+1=4$."
  }),
  build({
    num: 41, subject: "다변수함수", unit: "다변수함수의 극값", concept: "경계 최댓값/최솟값", difficulty: "medium",
    question: "위(39번 설정)에서 영역 $R$에서의 $f$의 최댓값을 $M$, 최솟값을 $m$이라 할 때 $M-m$의 값은?",
    options: [o("1","$\\dfrac{3}{2}$"), o("2","$2$"), o("3","$\\dfrac{5}{2}$"), o("4","$4$"), o("5","$\\dfrac{9}{2}$")],
    answer: 4,
    explanation: "경계 분석:\n$x=\\pm 1$: $f=(y+1)^2+y^2\\cdot 0+\\ldots$ 다시 계산. $f(\\pm 1,y)=1+y^2+2y=(y+1)^2$. $y\\in[-1,1]$: 최솟값 $0$ ($y=-1$), 최댓값 $4$ ($y=1$).\n$y=1$: $f(x,1)=x^2+1+2x^2=3x^2+1$. 최솟값 $1$ ($x=0$), 최댓값 $4$ ($x=\\pm 1$).\n$y=-1$: $f(x,-1)=x^2+1-2x^2=1-x^2$. 최솟값 $0$ ($x=\\pm 1$), 최댓값 $1$ ($x=0$).\n내부 임계: $f(0,0)=0$, $f(\\pm 1/\\sqrt 2,-1/2)=\\dfrac{1}{2}+\\dfrac{1}{4}-\\dfrac{1}{2}=\\dfrac{1}{4}$.\n$M=4,\\,m=0,\\,M-m=4$."
  }),
  build({
    num: 42, subject: "적분학", unit: "급수", concept: "코시 곱·조건부 수렴", difficulty: "hard",
    question: "두 무한급수 $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(-1)^n}{\\sqrt{1+n}}$, $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(-1)^n}{\\sqrt{1+n}}$의 코시 곱 $\\displaystyle\\sum_{n=0}^{\\infty}x_n$에 관련한 설명 중 옳지 $\\mathbf{않은}$ 것은?\n\n(1) $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(-1)^n}{\\sqrt{1+n}}$은 조건부 수렴이다.\n(2) (코시 곱 수렴 정리)甲은 $\\sum x_n$의 수렴 판정에 직접 적용되지 않는다.\n(3) $\\sum x_n$은 절대 수렴이 아니다.\n(4) $\\sum x_n$은 조건부 수렴이다.\n(5) $\\sum x_n$은 발산이다.",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)"), o("5","(5)")],
    answer: 4,
    explanation: "두 급수는 교대급수 판정으로 수렴하지만 $\\sum\\dfrac{1}{\\sqrt{1+n}}$이 $p=1/2<1$이라 발산하므로 절대수렴이 아니다 → 조건부 수렴 (1) 참.\n甲(코시 곱)은 적어도 하나가 절대수렴해야 적용 (2) 참.\n$x_n=(-1)^n\\sum_{k=0}^n\\dfrac{1}{\\sqrt{(1+n-k)(1+k)}}$. 산술기하 부등식으로 $\\sqrt{(1+n-k)(1+k)}\\le\\dfrac{n+2}{2}$, 따라서 $|x_n|\\ge(n+1)\\cdot\\dfrac{2}{n+2}\\to 2$. 일반항이 $0$으로 수렴 안 함 → $\\sum x_n$ 발산.\n발산하므로 (5) 참, 절대수렴 아님 (3) 참, 조건부 수렴도 아님 (4) 거짓."
  }),
  build({
    num: 43, subject: "적분학", unit: "급수", concept: "이항급수·미분 관계", difficulty: "hard",
    question: "$f(x):=\\dfrac{1}{(1+x)^3}=\\displaystyle\\sum_{n=0}^{\\infty}\\alpha_n x^n$ ($|x|<1$)으로 정의하자. 또한 $\\dfrac{1}{1+x}=\\displaystyle\\sum_{n=0}^{\\infty}\\xi_n x^n$이라 하자. $f^{(10)}(0)$의 값으로 적절한 것은?",
    options: [o("1","$132\\cdot 10!\\cdot\\xi_{10}$"), o("2","$132\\cdot 10!\\cdot\\xi_{11}$"), o("3","$66\\cdot 10!\\cdot\\xi_{11}$"), o("4","$132\\cdot 10!\\cdot\\xi_{12}$"), o("5","$66\\cdot 10!\\cdot\\xi_{12}$")],
    answer: 5,
    explanation: "$\\dfrac{1}{1+x}=\\sum\\xi_n x^n$을 두 번 미분: $\\dfrac{d^2}{dx^2}\\dfrac{1}{1+x}=\\dfrac{2}{(1+x)^3}$.\n$\\sum n(n-1)\\xi_n x^{n-2}=\\sum(n+1)(n+2)\\xi_{n+2}x^n$.\n$\\dfrac{1}{(1+x)^3}=\\dfrac{1}{2}\\sum(n+1)(n+2)\\xi_{n+2}x^n\\Rightarrow\\alpha_n=\\dfrac{(n+1)(n+2)}{2}\\xi_{n+2}$.\n$\\alpha_{10}=\\dfrac{11\\cdot 12}{2}\\xi_{12}=66\\,\\xi_{12}$.\n$f^{(10)}(0)=10!\\cdot\\alpha_{10}=66\\cdot 10!\\cdot\\xi_{12}$."
  }),
  build({
    num: 44, subject: "적분학", unit: "급수", concept: "이항계수 일반화", difficulty: "medium",
    question: "$\\dfrac{1}{\\sqrt{1+x}}=\\displaystyle\\sum_{n=0}^{\\infty}\\gamma_n x^n$ ($|x|<1$)에서 $\\gamma_n$에 적합한 표현은?",
    options: [o("1","$\\dfrac{(-1)^n(2n)!}{2^{2n}(n!)^2}$"), o("2","$\\dfrac{(2n)!}{2^{n}(n!)^2}$"), o("3","$\\dfrac{(-1)^n(2n+1)!}{2^{n+1}(n!)^2}$"), o("4","$\\dfrac{(2n+1)!}{2^{n+1}(n!)^2}$"), o("5","$\\dfrac{(2n)!}{2^{n-1}(n!)^2}$")],
    answer: 1,
    explanation: "$\\dbinom{-1/2}{n}=\\dfrac{(-1/2)(-3/2)\\cdots(-(2n-1)/2)}{n!}=\\dfrac{(-1)^n(1\\cdot 3\\cdot 5\\cdots(2n-1))}{2^n\\cdot n!}=\\dfrac{(-1)^n(2n-1)!!}{2^n n!}$.\n$(2n-1)!!=\\dfrac{(2n)!}{2^n n!}$이므로 $\\gamma_n=\\dfrac{(-1)^n(2n)!}{2^n n!\\cdot 2^n n!}=\\dfrac{(-1)^n(2n)!}{2^{2n}(n!)^2}$."
  }),
  build({
    num: 45, subject: "적분학", unit: "급수", concept: "코시 곱 항등식", difficulty: "hard",
    question: "$\\dfrac{1}{\\sqrt{1+x}}=\\displaystyle\\sum_{n=0}^{\\infty}\\gamma_n x^n$을 제곱하면 $\\dfrac{1}{1+x}=\\displaystyle\\sum_{n=0}^{\\infty}\\xi_n x^n$이 된다. 테일러 급수의 유일성을 이용해 얻을 수 있는 식은?",
    options: [o("1","$\\displaystyle\\sum_{k=0}^{n}\\dfrac{(-1)^k(2k)!(2n-2k)!}{(k!)^2((n-k)!)^2}=2^{2n}$"), o("2","$\\displaystyle\\sum_{k=0}^{n}\\dfrac{(2k)!(2n-2k)!}{(k!)^2((n-k)!)^2}=2^{2n}$"), o("3","$\\displaystyle\\sum_{k=0}^{n}\\dfrac{(-1)^k(2k+1)!(2n-2k)!}{(k!)^2((n-k)!)^2}=2^{2n+1}$"), o("4","$\\displaystyle\\sum_{k=0}^{n}\\dfrac{(2k+1)!(2n-2k)!}{(k!)^2((n-k)!)^2}=2^{2n+1}$"), o("5","$\\displaystyle\\sum_{k=0}^{n}\\dfrac{(2k+1)!(2n-2k)!}{(k!)^2((n-k)!)^2}=2^{2n+2}$")],
    answer: 2,
    explanation: "$\\xi_n=\\sum_{k=0}^{n}\\gamma_{n-k}\\gamma_k$이고 $\\dfrac{1}{1+x}=\\sum(-1)^n x^n$이므로 $\\xi_n=(-1)^n$.\n$\\gamma_n=\\dfrac{(-1)^n(2n)!}{2^{2n}(n!)^2}$ 대입:\n$\\sum_{k=0}^n\\dfrac{(-1)^{n-k}(2n-2k)!}{2^{2(n-k)}((n-k)!)^2}\\cdot\\dfrac{(-1)^k(2k)!}{2^{2k}(k!)^2}=(-1)^n$.\n$(-1)^n$ 약분하고 $2^{2n}$ 정리: $\\sum\\dfrac{(2n-2k)!(2k)!}{((n-k)!)^2(k!)^2}=2^{2n}$."
  }),
  build({
    num: 46, subject: "다변수함수", unit: "편도함수", concept: "극방정식 접선의 기울기", difficulty: "medium",
    question: "평면상의 곡선 $x^2+y^2=\\sqrt{x^2+y^2}+x$ 위의 점 $\\!\\left(\\dfrac{1}{\\sqrt 2}+\\dfrac{1}{2},\\,\\dfrac{1}{\\sqrt 2}+\\dfrac{1}{2}\\right)$에서의 접선의 기울기는?",
    options: [o("1","$-1$"), o("2","$-\\dfrac{1}{\\sqrt 2}$"), o("3","$-\\dfrac{1}{\\sqrt 3}$"), o("4","$-\\dfrac{1}{1+\\sqrt 2}$"), o("5","$-\\dfrac{1}{1+\\sqrt 3}$")],
    answer: 4,
    explanation: "극방정식으로 변환: $r^2=r+r\\cos\\theta\\Rightarrow r=1+\\cos\\theta$.\n해당 점은 $\\theta=\\pi/4$ (좌표가 $(1,1)$ 방향)에서.\n접선의 기울기 $\\tan\\alpha=\\tan(\\theta+\\phi)=\\dfrac{\\tan\\theta+\\tan\\phi}{1-\\tan\\theta\\tan\\phi}$, $\\tan\\phi=\\dfrac{r}{r'}$.\n$r'=-\\sin\\theta$, $\\tan\\phi=\\dfrac{\\cos\\theta+1}{-\\sin\\theta}$. $\\theta=\\pi/4$: $\\tan\\phi=\\dfrac{1/\\sqrt 2+1}{-1/\\sqrt 2}=-\\sqrt 2-1$.\n$\\tan(\\pi/4+\\phi)=\\dfrac{1+(-\\sqrt 2-1)}{1-1\\cdot(-\\sqrt 2-1)}=\\dfrac{-\\sqrt 2}{2+\\sqrt 2}=\\dfrac{-\\sqrt 2}{\\sqrt 2(\\sqrt 2+1)}=-\\dfrac{1}{1+\\sqrt 2}$."
  }),
  build({
    num: 47, subject: "적분학", unit: "정적분의 응용", concept: "극방정식 곡선의 길이", difficulty: "medium",
    question: "위(46번 설정)의 곡선의 제1사분면에 해당되는 부분의 길이는?",
    options: [o("1","$2\\sqrt 2$"), o("2","$2\\sqrt 3$"), o("3","$4$"), o("4","$2(\\sqrt 2+1)$"), o("5","$8$")],
    answer: 1,
    explanation: "극방정식 $r=1+\\cos\\theta$ (카디오이드), 제1사분면 $\\theta\\in[0,\\pi/2]$.\n$L=\\!\\int_0^{\\pi/2}\\!\\sqrt{r^2+(r')^2}\\,d\\theta=\\!\\int_0^{\\pi/2}\\!\\sqrt{(1+\\cos\\theta)^2+\\sin^2\\theta}\\,d\\theta=\\!\\int_0^{\\pi/2}\\!\\sqrt{2+2\\cos\\theta}\\,d\\theta$.\n$2+2\\cos\\theta=4\\cos^2(\\theta/2)$이므로 $\\sqrt{\\cdot}=2|\\cos(\\theta/2)|$.\n$L=\\!\\int_0^{\\pi/2}2\\cos(\\theta/2)\\,d\\theta=4[\\sin(\\theta/2)]_0^{\\pi/2}=4\\sin(\\pi/4)=2\\sqrt 2$."
  }),
  build({
    num: 48, subject: "다변수함수", unit: "벡터해석", concept: "원 위 선적분(직접계산)", difficulty: "medium",
    question: "중심이 원점이고 반지름이 $2$인 원을 반시계 방향으로 회전하는 곡선을 $C_1$이라 하자. 다음 적분 $\\displaystyle\\int_{C_1}\\!\\dfrac{(x^2-y^2)\\,dx+2xy\\,dy}{(x^2+y^2)^2}$의 값은?",
    options: [o("1","$2\\pi$"), o("2","$\\pi$"), o("3","$0$"), o("4","$-\\pi$"), o("5","$-2\\pi$")],
    answer: 3,
    explanation: "$\\mathbf r(t)=(2\\cos t,2\\sin t),\\,0\\le t\\le 2\\pi$. $x^2+y^2=4$, $(x^2+y^2)^2=16$.\n$x^2-y^2=4\\cos^2 t-4\\sin^2 t=4\\cos 2t$, $2xy=8\\sin t\\cos t=4\\sin 2t$.\n$dx=-2\\sin t\\,dt,\\,dy=2\\cos t\\,dt$.\n$\\displaystyle\\!\\int_0^{2\\pi}\\!\\dfrac{4\\cos 2t\\cdot(-2\\sin t)+4\\sin 2t\\cdot 2\\cos t}{16}\\,dt=\\dfrac{1}{2}\\!\\int_0^{2\\pi}(-\\cos 2t\\sin t+\\sin 2t\\cos t)\\,dt=\\dfrac{1}{2}\\!\\int_0^{2\\pi}\\sin t\\,dt=0$.\n(또는 벡터장이 $-\\nabla\\dfrac{x}{x^2+y^2}$의 회전 부분 등으로 분석 가능.)"
  }),
  build({
    num: 49, subject: "다변수함수", unit: "벡터해석", concept: "복합 벡터장 분해", difficulty: "hard",
    question: "오른쪽 그림처럼 두 개의 반원(반지름 $4$, $2$)과 두 개의 선분으로 이루어진 단일폐곡선 $C_2$가 있다. $C_2$의 방향은 시계 반대 방향이고 원점을 포함한다. 다음 선적분의 값은? $\\displaystyle\\int_{C_2}\\!\\dfrac{((x^2-y^2)-y(x^2+y^2)+y(x^2+y^2)^2)\\,dx+(2xy+x(x^2+y^2))\\,dy}{(x^2+y^2)^2}$",
    options: [o("1","$10\\pi$"), o("2","$-10\\pi$"), o("3","$8\\pi$"), o("4","$-8\\pi$"), o("5","$12\\pi$")],
    answer: 4,
    explanation: "벡터장을 셋으로 분해:\n①$\\dfrac{(x^2-y^2)dx+2xy\\,dy}{(x^2+y^2)^2}$: 위(48번)와 같은 형태로 닫힌 경로 적분 $0$.\n②$\\dfrac{-y\\,dx+x\\,dy}{x^2+y^2}$: 원점 포함 폐곡선이라 $2\\pi$ (그놈 와인딩).\n③$y\\,dx+0\\cdot dy$: 그린정리로 $\\!\\iint_R(-1)\\,dA=-(R\\,\\text{면적})$. $R$ 면적 $=\\dfrac{1}{2}\\pi\\cdot 4^2+\\dfrac{1}{2}\\pi\\cdot 2^2=8\\pi+2\\pi=10\\pi$.\n$0+2\\pi-10\\pi=-8\\pi$."
  }),
  build({
    num: 50, subject: "다변수함수", unit: "다중적분", concept: "무게중심(밀도)", difficulty: "mediumHard",
    question: "위(49번 설정)의 영역 $R$(반원 두 개로 이루어진 영역, 원점 포함) 모양의 얇은 판을 생각하자. $R$의 각 점에서의 밀도가 원점으로부터의 거리에 비례할 때 $R$의 무게중심의 $y$-좌표는?",
    options: [o("1","$1$"), o("2","$\\dfrac{56\\pi}{15}$"), o("3","$\\dfrac{56}{15\\pi}$"), o("4","$\\dfrac{\\pi}{5}$"), o("5","$\\dfrac{5}{\\pi}$")],
    answer: 5,
    explanation: "밀도 $\\rho(x,y)=k\\sqrt{x^2+y^2}$. $\\bar y=\\dfrac{\\!\\iint_R y\\rho\\,dA}{\\!\\iint_R\\rho\\,dA}$.\n극좌표: 위 반원 반지름 $4$ ($0\\le\\theta\\le\\pi$), 아래 반원 반지름 $2$ ($\\pi\\le\\theta\\le 2\\pi$).\n분자: $\\!\\int_0^{\\pi}\\!\\int_0^4 r\\sin\\theta\\cdot r\\cdot r\\,dr\\,d\\theta+\\!\\int_{\\pi}^{2\\pi}\\!\\int_0^2 r\\sin\\theta\\cdot r\\cdot r\\,dr\\,d\\theta=\\dfrac{4^4}{4}\\cdot 2+\\dfrac{2^4}{4}\\cdot(-2)=128-8=120$.\n분모: $\\!\\int_0^{\\pi}\\!\\int_0^4 r\\cdot r\\,dr\\,d\\theta+\\!\\int_{\\pi}^{2\\pi}\\!\\int_0^2 r\\cdot r\\,dr\\,d\\theta=\\dfrac{4^3}{3}\\pi+\\dfrac{2^3}{3}\\pi=\\dfrac{64+8}{3}\\pi=24\\pi$.\n$\\bar y=\\dfrac{120}{24\\pi}=\\dfrac{5}{\\pi}$."
  })
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (2023 아주대):`, data.map((d) => d.id).join(", "));
