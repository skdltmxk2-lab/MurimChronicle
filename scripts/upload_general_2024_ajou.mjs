// Upload 2024년도 아주대 편입수학 기출 25문항 (5지선다, 문제 26~50)
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
const YEAR = "2024";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-ajou-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 26, subject: "미분학", unit: "도함수", concept: "음함수 미분", difficulty: "easy",
    question: "곡선 $y^2+4x=\\ln y-\\ln 2$ 위의 점 $(-1,2)$에서의 접선의 기울기는?",
    options: [o("1","$1$"), o("2","$-\\dfrac{7}{8}$"), o("3","$-\\dfrac{8}{7}$"), o("4","$\\dfrac{7}{8}$"), o("5","$\\dfrac{8}{7}$")],
    answer: 3,
    explanation: "$F(x,y)=y^2+4x-\\ln y+\\ln 2=0$이라 하면 $\\dfrac{dy}{dx}=-\\dfrac{F_x}{F_y}=-\\dfrac{4}{2y-\\dfrac{1}{y}}$.\n$(-1,2)$ 대입: $\\dfrac{dy}{dx}=-\\dfrac{4}{4-\\dfrac{1}{2}}=-\\dfrac{4}{7/2}=-\\dfrac{8}{7}$."
  }),
  build({
    num: 27, subject: "미분학", unit: "역삼각함수", concept: "$\\cos^{-1}(\\sin\\cdot)$", difficulty: "medium",
    question: "$\\cos^{-1}\\!\\left(\\sin\\dfrac{2024\\pi}{7}\\right)$의 값은?",
    options: [o("1","$\\dfrac{9\\pi}{14}$"), o("2","$\\dfrac{6\\pi}{7}$"), o("3","$\\dfrac{\\pi}{7}$"), o("4","$-\\dfrac{\\pi}{7}$"), o("5","$-\\dfrac{6\\pi}{7}$")],
    answer: 1,
    explanation: "$\\sin\\!\\dfrac{2024\\pi}{7}=\\sin\\!\\left(288\\pi+\\dfrac{8\\pi}{7}\\right)=\\sin\\!\\dfrac{8\\pi}{7}=\\sin\\!\\left(\\pi+\\dfrac{\\pi}{7}\\right)=-\\sin\\!\\dfrac{\\pi}{7}$.\n$\\cos^{-1}(-\\sin(\\pi/7))=\\pi-\\cos^{-1}(\\sin(\\pi/7))$.\n$\\cos^{-1}(\\sin x)=\\dfrac{\\pi}{2}-x$ ($0\\le x\\le\\pi/2$)이므로 $\\cos^{-1}(\\sin(\\pi/7))=\\dfrac{\\pi}{2}-\\dfrac{\\pi}{7}=\\dfrac{5\\pi}{14}$.\n$\\cos^{-1}(\\sin(2024\\pi/7))=\\pi-\\dfrac{5\\pi}{14}=\\dfrac{9\\pi}{14}$."
  }),
  build({
    num: 28, subject: "미분학", unit: "극한과 연속", concept: "$e$ 정의 극한", difficulty: "medium",
    question: "다음 극한 $\\displaystyle\\lim_{n\\to\\infty}\\!\\left(1-\\sin\\!\\dfrac{2}{\\sqrt n}\\right)^{\\!n}$의 값은?",
    options: [o("1","발산"), o("2","$0$"), o("3","$e^2$"), o("4","$e^{-2}$"), o("5","$e^{-1/2}$")],
    answer: 2,
    explanation: "$\\dfrac{1}{\\sqrt n}=t$ 치환: $n=\\dfrac{1}{t^2}$, $t\\to 0^+$.\n$(1-\\sin 2t)^{1/t^2}=\\!\\left[(1+(-\\sin 2t))^{-1/\\sin 2t}\\right]^{-\\sin(2t)/t^2}$.\n$-\\dfrac{\\sin 2t}{t^2}=-\\dfrac{\\sin 2t}{2t}\\cdot\\dfrac{2}{t}\\to-1\\cdot\\infty=-\\infty$.\n극한 $=e^{-\\infty}=0$."
  }),
  build({
    num: 29, subject: "미분학", unit: "도함수", concept: "미분 성질·롤의 정리", difficulty: "medium",
    question: "열린구간 $(-2,2)$에서 정의된 두 번 미분가능한 함수 $f$를 생각하자. 다음 보기의 내용 중 옳은 것은 모두 몇 개인가?\n\n가. 만약 $f$가 $0$에서 최댓값을 가지면, $f'(0)=0$이 성립한다.\n나. 만약 $f'(0)>0$이면, $f$는 $0$을 포함한 적당한 열린구간에서 순증가이다.\n다. $f'(0)=0$일 때, $f$가 $0$에서 극솟값을 갖기 위한 필요충분조건은 $f''(0)>0$이다.\n라. 만약 $f'(-1)=f'(1)=0$이면, $f''(c)=0$을 만족하는 $c$가 존재한다.",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개"), o("5","$4$개")],
    answer: 3,
    explanation: "가. [참] 열린구간 내부 최댓값에서는 페르마의 정리로 $f'(0)=0$.\n나. [거짓] 반례 $f(x)=-(x-1)^2$, $f'(0)=2>0$이지만 $(-1.5,1.5)$ 전체에서 순증가가 아님.\n다. [거짓] 상수함수는 $f'(0)=0$, 극소점이지만 $f''(0)=0$이므로 필요충분조건이 아님.\n라. [참] 롤의 정리: $f'$가 $-1,1$에서 같은 값이므로 $(-1,1)$ 사이에 $f''(c)=0$이 존재.\n참은 가, 라. 2개."
  }),
  build({
    num: 30, subject: "미분학", unit: "도함수", concept: "매개변수 곡선 접선의 기울기", difficulty: "easy",
    question: "매개변수 곡선 $x(t)=t-\\sin t,\\,y(t)=1-\\cos t$ 위의 점 $\\!\\left(\\dfrac{2\\pi}{3}-\\dfrac{\\sqrt 3}{2},\\,\\dfrac{3}{2}\\right)$에서의 접선의 기울기는?",
    options: [o("1","$-\\sqrt 3$"), o("2","$-\\dfrac{1}{\\sqrt 3}$"), o("3","$1$"), o("4","$\\sqrt 3$"), o("5","$\\dfrac{1}{\\sqrt 3}$")],
    answer: 5,
    explanation: "주어진 점에서 $t=\\dfrac{2\\pi}{3}$ (확인: $\\sin(2\\pi/3)=\\sqrt 3/2,\\,\\cos(2\\pi/3)=-1/2$, $x=2\\pi/3-\\sqrt 3/2,\\,y=3/2$ ✓).\n$\\dfrac{dy}{dx}=\\dfrac{y'(t)}{x'(t)}=\\dfrac{\\sin t}{1-\\cos t}\\!\\bigg|_{t=2\\pi/3}=\\dfrac{\\sqrt 3/2}{3/2}=\\dfrac{1}{\\sqrt 3}$."
  }),
  build({
    num: 31, subject: "적분학", unit: "정적분의 응용", concept: "곡선의 길이", difficulty: "mediumHard",
    question: "곡선 $y=\\displaystyle\\int_{\\pi/4}^{x}\\!\\sqrt{\\tan^6 t-1}\\,dt$ ($\\dfrac{\\pi}{4}\\le x\\le\\dfrac{\\pi}{3}$)의 길이는?",
    options: [o("1","$1-\\dfrac{1}{2}\\ln 2$"), o("2","$1+\\dfrac{1}{2}\\ln 2$"), o("3","$1-\\ln 2$"), o("4","$1+\\ln 2$"), o("5","$1$")],
    answer: 1,
    explanation: "$y'=\\sqrt{\\tan^6 x-1}$, $1+(y')^2=\\tan^6 x$, $\\sqrt{1+(y')^2}=\\tan^3 x$.\n$L=\\!\\int_{\\pi/4}^{\\pi/3}\\!\\tan^3 x\\,dx=\\!\\int\\tan x(\\sec^2 x-1)dx=\\dfrac{1}{2}\\tan^2 x+\\ln|\\cos x|\\Big|_{\\pi/4}^{\\pi/3}$\n$=\\!\\left(\\dfrac{3}{2}+\\ln\\dfrac{1}{2}\\right)-\\!\\left(\\dfrac{1}{2}+\\ln\\dfrac{1}{\\sqrt 2}\\right)=1+\\ln\\dfrac{1}{\\sqrt 2}=1-\\dfrac{1}{2}\\ln 2$."
  }),
  build({
    num: 32, subject: "적분학", unit: "급수", concept: "수렴 성질·반례", difficulty: "hard",
    question: "실수 수열 $\\{a_n\\}$에 대한 다음 보기의 내용 중 옳은 것은 모두 몇 개인가?\n\n가. 수열 $\\{|a_n|\\}$이 단조감소이고 $\\displaystyle\\lim_{n\\to\\infty}a_n=0$이면, 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}(-1)^n a_n$은 수렴한다.\n나. 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}a_n^2$이 수렴하면, 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}a_n^4$은 수렴한다.\n다. 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}a_n^2$이 발산하면, 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}a_n$은 발산한다.\n라. 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}(-1)^n a_n$이 수렴하면, 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{a_n}{2^n}$은 수렴한다.",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개"), o("5","$4$개")],
    answer: 3,
    explanation: "가. [거짓] 반례 $a_n=\\dfrac{(-1)^n}{\\sqrt n}$: $|a_n|=\\dfrac{1}{\\sqrt n}$ 단조감소, $a_n\\to 0$이지만 $(-1)^n a_n=\\dfrac{1}{\\sqrt n}$, $\\sum$ 발산.\n나. [참] $b_n=a_n^2\\ge 0$, $\\sum b_n$ 수렴 $\\Rightarrow b_n\\to 0\\Rightarrow b_n<1$ 이후 $b_n^2\\le b_n$, $\\sum b_n^2=\\sum a_n^4$ 수렴.\n다. [거짓] 반례 $a_n=\\dfrac{(-1)^n}{\\sqrt n}$: $\\sum a_n^2=\\sum\\dfrac{1}{n}$ 발산, $\\sum a_n$ 수렴.\n라. [참] $b_n=(-1)^n a_n$, $\\sum b_n$ 수렴 $\\Rightarrow b_n$ 유계. $\\!\\left|\\dfrac{a_n}{2^n}\\right|=\\dfrac{|b_n|}{2^n}\\le\\dfrac{M}{2^n}$, $\\sum\\dfrac{1}{2^n}$ 절대수렴이므로 비교판정.\n참: 나, 라. 2개."
  }),
  build({
    num: 33, subject: "적분학", unit: "정적분", concept: "가우스 기호 적분", difficulty: "hard",
    question: "실수 $t$에 대하여 $f(t)=[t]-2\\!\\left[\\dfrac{t}{\\sqrt 2}\\right]+3\\!\\left[\\dfrac{t}{\\sqrt 3}\\right]$이라 하자 ($[x]$는 $x$를 넘지 않는 가장 큰 정수). $\\displaystyle\\int_0^{3}\\!f(x)\\,dx=a+b\\sqrt 2+c\\sqrt 3$을 만족하는 유리수 $a,b,c$에 대해 $a+b+c$의 값은?",
    options: [o("1","$-3$"), o("2","$3$"), o("3","$0$"), o("4","$-1$"), o("5","$1$")],
    answer: 2,
    explanation: "$\\!\\int_0^3[x]dx=0\\cdot 1+1\\cdot 1+2\\cdot 1=3$.\n$\\!\\int_0^3\\!\\left[\\dfrac{x}{\\sqrt 2}\\right]dx$ ($u=x/\\sqrt 2$): $\\sqrt 2\\!\\int_0^{3/\\sqrt 2}[u]du=\\sqrt 2(0+1+2(3/\\sqrt 2-2))=6-3\\sqrt 2$.\n$\\!\\int_0^3\\!\\left[\\dfrac{x}{\\sqrt 3}\\right]dx$ ($u=x/\\sqrt 3$): $\\sqrt 3\\!\\int_0^{\\sqrt 3}[u]du=\\sqrt 3(0+1\\cdot(\\sqrt 3-1))=3-\\sqrt 3$.\n$\\!\\int_0^3 f(x)dx=3-2(6-3\\sqrt 2)+3(3-\\sqrt 3)=6\\sqrt 2-3\\sqrt 3$.\n$a=0,\\,b=6,\\,c=-3$, $a+b+c=3$."
  }),
  build({
    num: 34, subject: "적분학", unit: "특이적분", concept: "수렴 판정", difficulty: "hard",
    question: "다음 보기에서 수렴하는 이상 적분(improper integral)은 모두 몇 개인가?\n\n가. $\\displaystyle\\int_0^{\\pi/2}\\!\\dfrac{x\\sqrt x}{\\sin^2 x}\\,dx$  나. $\\displaystyle\\int_0^{2024}\\!\\dfrac{x\\sqrt x}{\\sin^2 x}\\,dx$  다. $\\displaystyle\\int_{2024}^{\\infty}\\!e^{-(\\ln x)^2}\\,dx$  라. $\\displaystyle\\int_0^{2024}\\!\\dfrac{\\cos x}{\\sqrt x}\\,dx$",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개"), o("5","$4$개")],
    answer: 4,
    explanation: "가. $x\\to 0$에서 $\\sin^2 x\\sim x^2$, $\\dfrac{x^{3/2}}{x^2}=\\dfrac{1}{\\sqrt x}$, $p=1/2<1$ 수렴.\n나. $x=\\pi$에서 $\\sin^2\\pi=0$, $\\dfrac{1}{(x-\\pi)^2}$ 형식, $p=2\\ge 1$ 발산.\n다. $\\ln x=t$ 치환: $\\int e^{-t^2+t}\\,dt$, 가우시안 우세로 수렴.\n라. $x\\to 0$에서 $\\dfrac{1}{\\sqrt x}$, $p=1/2<1$ 수렴.\n수렴: 가, 다, 라. 3개."
  }),
  build({
    num: 35, subject: "적분학", unit: "특이적분", concept: "치환·표적분", difficulty: "medium",
    question: "다음 이상 적분 $\\displaystyle\\int_0^{1}\\!\\dfrac{e^{-1/x}}{x^4}\\,dx$의 값은?",
    options: [o("1","발산"), o("2","$3e^{-1}$"), o("3","$3e$"), o("4","$5e^{-1}$"), o("5","$5e$")],
    answer: 4,
    explanation: "$u=\\dfrac{1}{x}$ 치환: $x=\\dfrac{1}{u},\\,dx=-\\dfrac{du}{u^2}$, $\\dfrac{1}{x^4}=u^4$.\n구간 $x:0\\to 1\\Leftrightarrow u:\\infty\\to 1$.\n$\\displaystyle\\!\\int_{\\infty}^1 e^{-u}u^4\\!\\left(-\\dfrac{du}{u^2}\\right)=\\!\\int_1^{\\infty}\\!u^2 e^{-u}\\,du$.\n표적분: $=[-(u^2+2u+2)e^{-u}]_1^{\\infty}=0+(1+2+2)e^{-1}=5e^{-1}$."
  }),
  build({
    num: 36, subject: "적분학", unit: "급수", concept: "$\\sum n^2 x^n$", difficulty: "easy",
    question: "다음 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n^2}{3^n}$의 합은?",
    options: [o("1","$\\dfrac{4}{3}$"), o("2","$\\dfrac{3}{4}$"), o("3","$\\dfrac{3}{2}$"), o("4","$\\dfrac{2}{3}$"), o("5","발산")],
    answer: 3,
    explanation: "공식 $\\displaystyle\\sum_{n=1}^{\\infty}n^2 x^n=\\dfrac{x(1+x)}{(1-x)^3}$ ($|x|<1$).\n$x=\\dfrac{1}{3}$ 대입: $\\dfrac{(1/3)(4/3)}{(2/3)^3}=\\dfrac{4/9}{8/27}=\\dfrac{4\\cdot 27}{9\\cdot 8}=\\dfrac{3}{2}$."
  }),
  build({
    num: 37, subject: "적분학", unit: "급수", concept: "테일러·sin/cos 분리", difficulty: "hard",
    question: "수열 $\\{a_n\\}$이 $n$이 짝수이면 $a_n=(-1)^{n/2}$, $n$이 홀수이면 $a_n=(-1)^{(n+1)/2}$로 정의될 때, 다음 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\!a_n\\dfrac{\\pi^n}{3^n n!}$의 합은?",
    options: [o("1","$\\dfrac{1-\\sqrt 3}{2}$"), o("2","$\\dfrac{-1-\\sqrt 3}{2}$"), o("3","$\\dfrac{1+\\sqrt 3}{2}$"), o("4","$\\dfrac{\\sqrt 2-1}{2}$"), o("5","$\\dfrac{-1-\\sqrt 2}{2}$")],
    answer: 2,
    explanation: "$r=\\dfrac{\\pi}{3}$로 두자. 홀수항($n=2k+1$): $a_{2k+1}=(-1)^{k+1}$, $\\sum_{k\\ge 0}(-1)^{k+1}\\dfrac{r^{2k+1}}{(2k+1)!}=-\\sin r$.\n짝수항($n=2k$, $k\\ge 1$): $a_{2k}=(-1)^k$, $\\sum_{k\\ge 1}(-1)^k\\dfrac{r^{2k}}{(2k)!}=\\cos r-1$.\n합 $=-\\sin\\dfrac{\\pi}{3}+\\cos\\dfrac{\\pi}{3}-1=-\\dfrac{\\sqrt 3}{2}+\\dfrac{1}{2}-1=\\dfrac{-1-\\sqrt 3}{2}$."
  }),
  build({
    num: 38, subject: "적분학", unit: "특이적분", concept: "$\\ln$ 치환·라플라스", difficulty: "medium",
    question: "다음 이상 적분 $\\displaystyle\\int_0^{1}\\!\\cos^2(\\ln x)\\,dx$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$\\dfrac{3}{5}$"), o("3","$\\dfrac{2}{3}$"), o("4","$1$"), o("5","발산")],
    answer: 2,
    explanation: "$\\ln x=-t$ 치환: $x=e^{-t},\\,dx=-e^{-t}dt$. 구간 $t:\\infty\\to 0$.\n$\\displaystyle\\!\\int_0^{\\infty}\\!\\cos^2 t\\cdot e^{-t}\\,dt=\\mathcal L\\{\\cos^2 t\\}|_{s=1}=\\mathcal L\\!\\left\\{\\dfrac{1+\\cos 2t}{2}\\right\\}\\bigg|_{s=1}=\\dfrac{1}{2}\\!\\left(\\dfrac{1}{s}+\\dfrac{s}{s^2+4}\\right)\\bigg|_{s=1}=\\dfrac{1}{2}\\!\\left(1+\\dfrac{1}{5}\\right)=\\dfrac{3}{5}$."
  }),
  build({
    num: 39, subject: "적분학", unit: "정적분", concept: "리만합", difficulty: "mediumHard",
    question: "다음 극한 $\\displaystyle\\lim_{n\\to\\infty}\\sum_{k=1}^{n}\\dfrac{\\sqrt n+k}{n^2}\\cos\\!\\left(\\dfrac{\\pi k}{2n}+\\dfrac{\\sqrt{2\\pi}}{\\sqrt n}\\right)$의 값은?",
    options: [o("1","발산"), o("2","$\\pi$"), o("3","$\\dfrac{\\pi}{2}$"), o("4","$\\dfrac{1}{\\pi}-\\dfrac{1}{\\pi^2}$"), o("5","$\\dfrac{2}{\\pi}-\\dfrac{4}{\\pi^2}$")],
    answer: 5,
    explanation: "$\\sum\\dfrac{\\sqrt n}{n^2}\\cos(\\cdots)\\to 0$. 남은: $\\sum\\dfrac{k}{n^2}\\cos(\\pi k/(2n)+\\sqrt{2\\pi}/\\sqrt n)=\\sum\\dfrac{k}{n}\\cos(\\cdot)\\cdot\\dfrac{1}{n}\\to\\!\\int_0^1 x\\cos\\dfrac{\\pi x}{2}\\,dx$.\n표적분: $\\!\\int x\\cos(\\pi x/2)dx=\\dfrac{2x}{\\pi}\\sin(\\pi x/2)+\\dfrac{4}{\\pi^2}\\cos(\\pi x/2)+C$.\n$\\!\\left[\\dfrac{2x}{\\pi}\\sin\\dfrac{\\pi x}{2}+\\dfrac{4}{\\pi^2}\\cos\\dfrac{\\pi x}{2}\\right]_0^1=\\dfrac{2}{\\pi}-\\dfrac{4}{\\pi^2}$."
  }),
  build({
    num: 40, subject: "다변수함수", unit: "다중적분", concept: "무게중심(밀도)", difficulty: "medium",
    question: "평면상의 영역 $R=\\{(x,y):1\\le x^2+y^2\\le 4,\\,y\\ge|x|\\}$ 모양의 얇은 판의 각 점에서의 밀도가 원점으로부터의 거리에 비례할 때, 이 판의 질량중심의 $y$좌표는?",
    options: [o("1","$\\dfrac{22\\sqrt 3}{7\\pi}$"), o("2","$\\dfrac{45\\sqrt 3}{14}$"), o("3","$\\dfrac{45\\sqrt 3}{14\\pi}$"), o("4","$\\dfrac{45\\sqrt 2}{14}$"), o("5","$\\dfrac{45\\sqrt 2}{14\\pi}$")],
    answer: 5,
    explanation: "극좌표: $1\\le r\\le 2,\\,\\pi/4\\le\\theta\\le 3\\pi/4$. 밀도 $\\rho=kr$.\n$\\bar y=\\dfrac{\\!\\iint y\\rho\\,dA}{\\!\\iint\\rho\\,dA}=\\dfrac{\\!\\int_{\\pi/4}^{3\\pi/4}\\!\\sin\\theta\\,d\\theta\\cdot\\!\\int_1^2 r^3\\,dr}{\\!\\int_{\\pi/4}^{3\\pi/4}\\!d\\theta\\cdot\\!\\int_1^2 r^2\\,dr}$\n$=\\dfrac{(-\\cos(3\\pi/4)+\\cos(\\pi/4))\\cdot(15/4)}{(\\pi/2)\\cdot(7/3)}=\\dfrac{\\sqrt 2\\cdot 15/4}{7\\pi/6}=\\dfrac{15\\sqrt 2/4\\cdot 6}{7\\pi}=\\dfrac{45\\sqrt 2}{14\\pi}$."
  }),
  build({
    num: 41, subject: "다변수함수", unit: "다중적분", concept: "적분순서 변경·합치기", difficulty: "medium",
    question: "다음 적분의 값은? $\\displaystyle\\int_{\\pi/6}^{\\pi/4}\\!\\int_{\\sqrt y}^{\\sqrt\\pi/2}\\!\\dfrac{y\\cos(x^2)}{x^3}\\,dx\\,dy+\\!\\int_0^{\\pi/6}\\!\\int_{\\sqrt{\\pi/6}}^{\\sqrt\\pi/2}\\!\\dfrac{y\\cos(x^2)}{x^3}\\,dx\\,dy$",
    options: [o("1","$\\dfrac{1}{4\\sqrt 2}$"), o("2","$\\dfrac{1}{8\\sqrt 2}$"), o("3","$\\dfrac{1}{8}(\\sqrt 2-1)$"), o("4","$\\dfrac{1}{8}(\\sqrt 2+1)$"), o("5","$\\dfrac{1}{4}$")],
    answer: 3,
    explanation: "피적분함수가 같으므로 정의역 합쳐서 $\\sqrt{\\pi/6}\\le x\\le\\sqrt\\pi/2,\\,0\\le y\\le x^2$로 변환.\n$\\displaystyle\\!\\int_{\\sqrt{\\pi/6}}^{\\sqrt\\pi/2}\\!\\int_0^{x^2}\\!\\dfrac{y\\cos(x^2)}{x^3}\\,dy\\,dx=\\!\\int\\dfrac{\\cos(x^2)}{x^3}\\cdot\\dfrac{x^4}{2}\\,dx=\\dfrac{1}{2}\\!\\int x\\cos(x^2)dx$\n$=\\dfrac{1}{4}[\\sin(x^2)]_{\\sqrt{\\pi/6}}^{\\sqrt\\pi/2}=\\dfrac{1}{4}(\\sin(\\pi/4)-\\sin(\\pi/6))=\\dfrac{1}{4}\\!\\left(\\dfrac{\\sqrt 2}{2}-\\dfrac{1}{2}\\right)=\\dfrac{\\sqrt 2-1}{8}$."
  }),
  build({
    num: 42, subject: "다변수함수", unit: "편도함수", concept: "접평면과 축의 교점", difficulty: "easy",
    question: "곡면 $x^2-y^2-2z^2=1$ 위의 점 $(2,1,-1)$에서의 접평면은 $z$축과 $(0,0,a)$에서 만난다. $a$의 값은?",
    options: [o("1","$-\\dfrac{1}{2}$"), o("2","$\\dfrac{5}{2}$"), o("3","$\\dfrac{3}{2}$"), o("4","$1$"), o("5","$\\dfrac{1}{2}$")],
    answer: 5,
    explanation: "$\\nabla F=(2x,-2y,-4z)$, $(2,1,-1)$에서 $(4,-2,4)\\parallel(2,-1,2)$.\n접평면: $2(x-2)-(y-1)+2(z+1)=0\\Rightarrow 2x-y+2z=1$.\n$(0,0,a)$ 대입: $2a=1\\Rightarrow a=\\dfrac{1}{2}$."
  }),
  build({
    num: 43, subject: "다변수함수", unit: "편도함수", concept: "선형근사(전미분)", difficulty: "easy",
    question: "함수 $f(x,y)=(x-2y)^4$의 $(3,1)$에서의 선형근사함수를 이용한 $f(2.9,\\,1.2)$의 근삿값은?",
    options: [o("1","$-1.0$"), o("2","$-0.5$"), o("3","$0.6$"), o("4","$0.9$"), o("5","$1.2$")],
    answer: 1,
    explanation: "$f(3,1)=(1)^4=1$. $df=4(x-2y)^3 dx-8(x-2y)^3 dy$.\n$(3,1)$에서 $(x-2y)^3=1$, $df=4dx-8dy=4(-0.1)-8(0.2)=-0.4-1.6=-2$.\n$f(2.9,1.2)\\approx 1+(-2)=-1$."
  }),
  build({
    num: 44, subject: "다변수함수", unit: "다변수함수의 극값", concept: "라그랑주(타원경계)", difficulty: "mediumHard",
    question: "영역 $\\{(x,y):3x^2+y^2\\le 1\\}$에서 정의된 함수 $f(x,y)=3x^3-y^3$의 최댓값을 $M$, 최솟값을 $m$이라 할 때 $M-m$의 값은?",
    options: [o("1","$\\sqrt[3]{2}$"), o("2","$2\\sqrt[3]{2}$"), o("3","$2\\sqrt 2$"), o("4","$1$"), o("5","$2$")],
    answer: 5,
    explanation: "내부 임계: $f_x=9x^2=0,\\,f_y=-3y^2=0\\Rightarrow(0,0),\\,f=0$.\n경계 라그랑주: $3x^2\\cdot 2y=-3y^2\\cdot 6x\\Rightarrow xy(x+y)=0$.\n$x=0$: $y=\\pm 1$, $f=\\mp 1$.\n$y=0$: $x=\\pm\\dfrac{1}{\\sqrt 3}$, $f=\\pm\\dfrac{1}{\\sqrt 3}$.\n$y=-x$: $4x^2=1$, $x=\\pm\\dfrac{1}{2}$, $y=\\mp\\dfrac{1}{2}$, $f=\\pm\\dfrac{1}{2}$.\n$M=1,\\,m=-1,\\,M-m=2$."
  }),
  build({
    num: 45, subject: "미분학", unit: "도함수", concept: "역함수의 도함수", difficulty: "easy",
    question: "실수 전체에서 정의된 미분가능 함수 $f$가 $f(1)=2,\\,f(2)=3,\\,f(3)=5$, $f'(1)=\\dfrac{1}{2},\\,f'(2)=\\dfrac{5}{2},\\,f'(3)=\\dfrac{7}{3}$, $\\displaystyle\\int_1^2 f(x)dx=\\dfrac{13}{6},\\,\\int_1^2 xf(x)dx=3$, $f'(x)>-1$을 만족한다. 함수 $f(x)+x$의 역함수를 $g$라 할 때 $g'(5)$의 값은?",
    options: [o("1","$\\dfrac{1}{7}$"), o("2","$\\dfrac{2}{7}$"), o("3","$\\dfrac{3}{7}$"), o("4","$\\dfrac{1}{5}$"), o("5","$\\dfrac{2}{5}$")],
    answer: 2,
    explanation: "$h(x)=f(x)+x$라 하면 $h(2)=3+2=5$이므로 $g(5)=2$.\n$h'(x)=f'(x)+1$, $h'(2)=\\dfrac{5}{2}+1=\\dfrac{7}{2}$.\n$g'(5)=\\dfrac{1}{h'(2)}=\\dfrac{2}{7}$."
  }),
  build({
    num: 46, subject: "적분학", unit: "정적분", concept: "역함수 적분", difficulty: "medium",
    question: "위(45번 설정)에서 정적분 $\\displaystyle\\int_3^{5}\\!g(x)\\,dx$의 값은?",
    options: [o("1","$\\dfrac{7}{3}$"), o("2","$\\dfrac{5}{2}$"), o("3","$3$"), o("4","$\\dfrac{10}{3}$"), o("5","$4$")],
    answer: 4,
    explanation: "$h(x)=f(x)+x$, $h(1)=3,\\,h(2)=5$.\n역함수 적분: $\\!\\int_1^2 h(x)dx+\\!\\int_3^5 g(y)dy=2\\cdot 5-1\\cdot 3=7$.\n$\\!\\int_1^2 h(x)dx=\\!\\int_1^2 f(x)dx+\\!\\int_1^2 x\\,dx=\\dfrac{13}{6}+\\dfrac{3}{2}=\\dfrac{13+9}{6}=\\dfrac{22}{6}=\\dfrac{11}{3}$.\n$\\!\\int_3^5 g(x)dx=7-\\dfrac{11}{3}=\\dfrac{10}{3}$."
  }),
  build({
    num: 47, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피(역함수)", difficulty: "hard",
    question: "위(45번 설정)에서 곡선 $y=g(x)$ ($3\\le x\\le 5$)를 $x$축 주위로 회전하여 얻은 입체의 부피는?",
    options: [o("1","$\\dfrac{19}{3}\\pi$"), o("2","$\\dfrac{11}{3}\\pi$"), o("3","$\\dfrac{10}{3}\\pi$"), o("4","$3\\pi$"), o("5","$2\\pi$")],
    answer: 1,
    explanation: "$V=\\pi\\!\\int_3^5 g(x)^2\\,dx$. $g=h^{-1}$, $h(t)=t,\\,dx=h'(t)dt=(f'(t)+1)dt$. $x:3\\to 5\\Leftrightarrow t:1\\to 2$.\n$V=\\pi\\!\\int_1^2 t^2(f'(t)+1)dt=\\pi\\!\\int_1^2 t^2 dt+\\pi\\!\\int_1^2 t^2 f'(t)dt$.\n$\\!\\int_1^2 t^2 dt=\\dfrac{7}{3}$.\n부분적분 $\\!\\int t^2 f'(t)dt=[t^2 f(t)]_1^2-2\\!\\int t f(t)dt=4\\cdot 3-1\\cdot 2-2\\cdot 3=4$.\n$V=\\pi(\\dfrac{7}{3}+4)=\\dfrac{19\\pi}{3}$."
  }),
  build({
    num: 48, subject: "다변수함수", unit: "벡터해석", concept: "선적분 분해(그놈+보존)", difficulty: "hard",
    question: "평면상의 벡터장 $\\mathbf F(x,y)=\\!\\left(-\\dfrac{y}{x^2+y^2}+ye^{xy}\\right)\\mathbf i+\\!\\left(\\dfrac{x}{x^2+y^2}+xe^{xy}\\right)\\mathbf j$를 생각하자. 점 $P(-1,3)$에서 $Q(-3,1)$에 이르는 선분을 $C_1$이라 할 때 $\\displaystyle\\int_{C_1}\\!\\mathbf F\\cdot d\\mathbf r$의 값은?",
    options: [o("1","$2\\tan^{-1}3-\\dfrac{\\pi}{2}$"), o("2","$2\\tan^{-1}\\dfrac{1}{3}-\\dfrac{\\pi}{2}$"), o("3","$2\\tan^{-1}3$"), o("4","$-2\\tan^{-1}3$"), o("5","$-2\\tan^{-1}\\dfrac{1}{3}$")],
    answer: 1,
    explanation: "$\\mathbf F=\\mathbf F_1+\\mathbf F_2$, $\\mathbf F_1=\\!\\left(-\\dfrac{y}{x^2+y^2},\\dfrac{x}{x^2+y^2}\\right)$ (그놈), $\\mathbf F_2=(ye^{xy},xe^{xy})=\\nabla(e^{xy})$ (보존).\n$\\mathbf F_2$ 부분: $e^{(-3)(1)}-e^{(-1)(3)}=e^{-3}-e^{-3}=0$.\n$\\mathbf F_1$ 부분 $=\\angle POQ$. $\\theta_P=\\pi-\\tan^{-1}3,\\,\\theta_Q=\\pi-\\tan^{-1}(1/3)$.\n$\\theta_Q-\\theta_P=\\tan^{-1}3-\\tan^{-1}(1/3)=\\tan^{-1}3-(\\dfrac{\\pi}{2}-\\tan^{-1}3)=2\\tan^{-1}3-\\dfrac{\\pi}{2}$.\n합: $2\\tan^{-1}3-\\dfrac{\\pi}{2}$."
  }),
  build({
    num: 49, subject: "다변수함수", unit: "벡터해석", concept: "격자 경로(파스칼)", difficulty: "hard",
    question: "위(48번 설정)에서 $A(-4,-1)$에서 $B(1,3)$에 이르는 선분을 $C_2$라 하자. $A$에서 시작하여 원점을 거치지 않고 좌표축과 나란한 직선을 따라 한 칸씩 이동하여 $B$에 이르는 최단 경로 중, $\\displaystyle\\int_C\\!\\mathbf F\\cdot d\\mathbf r=\\!\\int_{C_2}\\!\\mathbf F\\cdot d\\mathbf r$를 만족하는 것은 모두 몇 개인가?",
    options: [o("1","$25$"), o("2","$50$"), o("3","$55$"), o("4","$100$"), o("5","$105$")],
    answer: 5,
    explanation: "$A(-4,-1)\\to B(1,3)$ 최단 경로: $5$R+$4$U=$9$ 이동. 총 $\\binom{9}{4}=126$.\n원점 통과 경로: $\\binom{5}{1}\\cdot\\binom{4}{1}=20$.\n원점 안 통과 $=106$ 경로 중 $\\mathbf F_1$의 그놈 적분이 $C_2$와 같으려면 원점을 같은 방식(위쪽)으로 우회해야 함. $C_2$ 선분은 $x=0$에서 $y=11/5>0$로 원점 위로 통과.\n격자 경로가 원점 \"위\" (4R 완료 시점에 $y\\ge 1$): $\\binom{5}{2}\\cdot 3+\\binom{6}{3}\\cdot 2+\\binom{7}{4}\\cdot 1=30+40+35=105$ 경로.\n답: 105."
  }),
  build({
    num: 50, subject: "다변수함수", unit: "벡터해석", concept: "$\\oint(-ydx+xdy)=2\\cdot$면적", difficulty: "easy",
    question: "위(48번 설정)에서 $A(-4,-1)$에서 $B(1,3)$을 거쳐 $Q(-3,1)$를 지나 $A$로 돌아오는 삼각형 모양의 곡선을 $C_3$라 하자. 다음 선적분 $\\displaystyle\\int_{C_3}\\!(-y\\,dx+x\\,dy)$의 값은?",
    options: [o("1","$2$"), o("2","$4$"), o("3","$-4$"), o("4","$6$"), o("5","$-6$")],
    answer: 4,
    explanation: "$\\!\\oint(-y\\,dx+x\\,dy)=2\\cdot$(부호 있는 면적). 삼각형 $ABQ$의 면적:\n$\\overrightarrow{AB}=(5,4,0),\\,\\overrightarrow{AQ}=(1,2,0)$. $\\overrightarrow{AB}\\times\\overrightarrow{AQ}=(0,0,5\\cdot 2-4\\cdot 1)=(0,0,6)$.\n면적 $=\\dfrac{|(0,0,6)|}{2}=3$. 방향 $A\\to B\\to Q\\to A$는 반시계.\n적분 $=2\\cdot 3=6$."
  })
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (2024 아주대):`, data.map((d) => d.id).join(", "));
