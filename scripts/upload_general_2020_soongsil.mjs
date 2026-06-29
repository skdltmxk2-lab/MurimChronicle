// Upload 2020년도 숭실대 편입수학 기출 25문항 (4지 선다, 90분, 원본 26~50번)
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
const YEAR = "2020";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-soongsil-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "$1^\\infty$ 극한", difficulty: "easy",
    question: "극한값 $\\!\\displaystyle\\lim_{x\\to 0}(1+\\tan 2x)^{\\frac{1}{2x^2+x}}$은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$1$"), o("3","$e$"), o("4","$e^2$")],
    answer: 4,
    explanation: "$\\!\\lim(1+\\tan 2x)^{1/\\tan 2x\\cdot\\tan 2x/(x+2x^2)}=e^{\\lim 2x/(x+2x^2)}=e^2$ ($\\tan 2x\\sim 2x$)."
  }),
  build({
    num: 2, subject: "미분학", unit: "도함수", concept: "음함수 법선의 방정식", difficulty: "easy",
    question: "$2x^3+2y^3=9xy$의 그래프 위의 점 $(1,2)$에서의 법선의 방정식을 구하면?",
    options: [
      o("1","$4x-5y+6=0$"),
      o("2","$5x+4y-13=0$"),
      o("3","$4x+5y-14=0$"),
      o("4","$5x-4y+3=0$")
    ],
    answer: 2,
    explanation: "$\\dfrac{dy}{dx}=-\\dfrac{6x^2-9y}{6y^2-9x}|_{(1,2)}=\\dfrac{4}{5}$. 법선 기울기 $-\\dfrac{5}{4}$.\n$y-2=-\\dfrac{5}{4}(x-1)$ ⇒ $5x+4y-13=0$."
  }),
  build({
    num: 3, subject: "적분학", unit: "정적분", concept: "이상적분 수렴 판정", difficulty: "medium",
    question: "다음 이상적분 중 수렴하는 것을 모두 고르면?\n\n(가) $\\!\\int_1^{\\infty}e^{-x^2}dx$\n(나) $\\!\\int_0^{\\infty}\\dfrac{1+e^{-x}}{x}dx$\n(다) $\\!\\int_0^1\\dfrac{1}{x-1}dx$\n(라) $\\!\\int_{-\\infty}^{\\infty}\\dfrac{1}{1+x^2}dx$",
    options: [o("1","(가), (나)"), o("2","(나), (다)"), o("3","(다), (라)"), o("4","(가), (라)")],
    answer: 4,
    explanation: "(가) $e^{-x^2}\\le e^{-x}$, 수렴.\n(나) $x\\to 0$에서 $1/x$ 발산.\n(다) $x=1$ 발산.\n(라) $\\pi$ 수렴.\n수렴: (가),(라)."
  }),
  build({
    num: 4, subject: "적분학", unit: "급수", concept: "수렴 급수 판정", difficulty: "easy",
    question: "다음 중 수렴하는 급수는?",
    options: [
      o("1","$\\!\\sum_{n=1}^{\\infty}\\!\\left(\\dfrac{1}{n}+\\dfrac{1}{n+1}\\right)$"),
      o("2","$\\!\\sum_{n=1}^{\\infty}\\!\\left(\\dfrac{1}{n}-\\dfrac{1}{n+1}\\right)$"),
      o("3","$\\!\\sum_{n=1}^{\\infty}\\!\\left(\\dfrac{1}{n^2}+\\dfrac{1}{n+1}\\right)$"),
      o("4","$\\!\\sum_{n=1}^{\\infty}\\!\\left(\\dfrac{1}{n^2}-\\dfrac{1}{n+1}\\right)$")
    ],
    answer: 2,
    explanation: "(2) 텔레스코핑: $1$ 수렴.\n(1),(3),(4) $\\sum 1/n$ 또는 $\\sum 1/(n+1)$ 발산항 포함."
  }),
  build({
    num: 5, subject: "다변수함수", unit: "편미분", concept: "접평면 법선벡터", difficulty: "easy",
    question: "다음 중 곡면 $z=x^2+xy+y^3$ 위의 점 $(1,-1,-1)$에서의 접평면의 법선벡터는?",
    options: [
      o("1","$\\langle 0,0,1\\rangle$"),
      o("2","$\\langle-1,-4,1\\rangle$"),
      o("3","$\\langle 2,1,3\\rangle$"),
      o("4","$\\langle-2,1,2\\rangle$")
    ],
    answer: 2,
    explanation: "$F=x^2+xy+y^3-z$. $\\nabla F=(2x+y,\\,x+3y^2,\\,-1)|_{(1,-1,-1)}=(1,4,-1)\\sim(-1,-4,1)$."
  }),
  build({
    num: 6, subject: "선형대수", unit: "행렬", concept: "일대일 선형사상 판정", difficulty: "medium",
    question: "다음 중 $\\mathbb R^3$에서 $T_A\\!\\begin{pmatrix}x\\\\y\\\\z\\end{pmatrix}=A\\!\\begin{pmatrix}x\\\\y\\\\z\\end{pmatrix}$로 정의되는 선형사상이 일대일 함수가 아닌 행렬 $A$는?",
    options: [
      o("1","$A=\\!\\begin{pmatrix}1&1&1\\\\1&2&3\\\\1&4&9\\end{pmatrix}$"),
      o("2","$A=\\!\\begin{pmatrix}1&1&2\\\\1&2&3\\\\2&3&4\\end{pmatrix}$"),
      o("3","$A=\\!\\begin{pmatrix}1&2&3\\\\2&3&4\\\\3&4&5\\end{pmatrix}$"),
      o("4","$A=\\!\\begin{pmatrix}1&1&1\\\\1&-1&1\\\\1&-1&-1\\end{pmatrix}$")
    ],
    answer: 3,
    explanation: "(3) rank $=2$ (행 사이 등차) ⇒ 핵 차원 $=1$ ⇒ 일대일 아님.\n나머지는 모두 rank $=3$."
  }),
  build({
    num: 7, subject: "미분학", unit: "도함수", concept: "선형근사(역코탄젠트)", difficulty: "medium",
    question: "$x=1$에서 $f(x)=\\cot^{-1}x$의 접선에 대한 선형근사식을 이용하여 $f(1.1)$의 근삿값을 구하면?",
    options: [o("1","$\\dfrac{\\pi}{4}-0.05$"), o("2","$\\dfrac{\\pi}{4}+0.05$"), o("3","$\\dfrac{\\pi}{2}-0.05$"), o("4","$\\dfrac{\\pi}{2}+0.05$")],
    answer: 1,
    explanation: "$f(1)=\\pi/4$, $f'(x)=-\\dfrac{1}{1+x^2}$, $f'(1)=-\\dfrac{1}{2}$.\n$L(1.1)=\\dfrac{\\pi}{4}-\\dfrac{1}{2}\\cdot 0.1=\\dfrac{\\pi}{4}-0.05$."
  }),
  build({
    num: 8, subject: "미분학", unit: "도함수", concept: "tanh 접선", difficulty: "easy",
    question: "곡선 $y=\\tanh^{-1}(2x)$의 $x=0$에서의 접선의 방정식을 구하면?",
    options: [o("1","$y=-2x$"), o("2","$y=\\dfrac{1}{2}x$"), o("3","$y=x$"), o("4","$y=2x$")],
    answer: 4,
    explanation: "$y'=\\dfrac{2}{1-(2x)^2}$, $y'(0)=2$. $y(0)=0$. 접선 $y=2x$."
  }),
  build({
    num: 9, subject: "미분학", unit: "도함수", concept: "매개함수 2계 미분", difficulty: "easy",
    question: "$x=2t,\\,y=t^2-3$일 때 $\\dfrac{d^2 y}{dx^2}$의 값은?",
    options: [o("1","$-\\dfrac{1}{2}$"), o("2","$-1$"), o("3","$\\dfrac{1}{2}$"), o("4","$1$")],
    answer: 3,
    explanation: "$\\dfrac{dy}{dx}=\\dfrac{2t}{2}=t$. $\\dfrac{d^2 y}{dx^2}=\\dfrac{d(t)/dt}{dx/dt}=\\dfrac{1}{2}$."
  }),
  build({
    num: 10, subject: "적분학", unit: "정적분", concept: "치환적분($\\sqrt x$)", difficulty: "easy",
    question: "적분 $\\!\\displaystyle\\int_0^4 e^{\\sqrt x}dx$의 값은?",
    options: [o("1","$2(e^2+1)$"), o("2","$e^2+1$"), o("3","$e^2$"), o("4","$e^2-1$")],
    answer: 1,
    explanation: "$\\sqrt x=t$ 치환: $\\!\\int_0^2 e^t\\cdot 2t\\,dt=2[te^t-e^t]_0^2=2(2e^2-e^2+1)=2(e^2+1)$."
  }),
  build({
    num: 11, subject: "적분학", unit: "정적분", concept: "역함수 적분 변환", difficulty: "medium",
    question: "$f(x)=2x+\\cos x$일 때 적분 $\\!\\displaystyle\\int_1^{2\\pi-1}f^{-1}(x)dx$의 값은?",
    options: [o("1","$\\pi^2-\\pi$"), o("2","$\\pi^2-1$"), o("3","$2\\pi+1$"), o("4","$\\dfrac{\\pi^2}{2}+1$")],
    answer: 1,
    explanation: "정적분 역함수 공식: $\\!\\int_a^b f^{-1}(x)dx=bf^{-1}(b)-af^{-1}(a)-\\!\\int_{f^{-1}(a)}^{f^{-1}(b)}f(y)dy$.\n$f(0)=1,\\,f(\\pi)=2\\pi-1$. 계산: $(2\\pi-1)\\pi-0-\\!\\int_0^{\\pi}(2y+\\cos y)dy=2\\pi^2-\\pi-\\pi^2=\\pi^2-\\pi$."
  }),
  build({
    num: 12, subject: "적분학", unit: "정적분", concept: "조각함수 적분(증감)", difficulty: "medium",
    question: "함수 $f(t),F(x)$가 다음과 같을 때 $F(x)$에 대한 설명 중 옳지 않은 것은?\n\n$f(t)=\\begin{cases}2t,&0\\le t\\le 1\\\\2-t,&1\\le t\\le 3\\end{cases},\\;F(x)=\\!\\displaystyle\\int_0^x f(t)dt$",
    options: [
      o("1","구간 $[0,3]$에서 연속이다."),
      o("2","$x=1$에서 미분불가능하다."),
      o("3","구간 $[1,3]$에서 감소한다."),
      o("4","$x=2$에서 최댓값을 갖는다.")
    ],
    answer: 3,
    explanation: "(3) 거짓: $[1,2]$에서 $f(t)>0$ ⇒ $F$ 증가, $[2,3]$에서 $f<0$ ⇒ 감소.\n$[1,3]$ 전체에서 감소 아님."
  }),
  build({
    num: 13, subject: "적분학", unit: "정적분", concept: "곡선의 길이($\\int\\sqrt{t^3-1}$)", difficulty: "medium",
    question: "$x=1$과 $x=4$ 사이의 곡선 $y=\\!\\displaystyle\\int_1^x\\!\\sqrt{t^3-1}dt$의 길이는?",
    options: [o("1","$\\dfrac{62}{5}$"), o("2","$\\dfrac{14}{3}$"), o("3","$\\dfrac{\\pi}{6}$"), o("4","$\\dfrac{2\\sqrt 2\\pi}{5}$")],
    answer: 1,
    explanation: "$y'=\\sqrt{x^3-1}$, $1+(y')^2=x^3$.\n$L=\\!\\int_1^4 x^{3/2}dx=\\dfrac{2}{5}[x^{5/2}]_1^4=\\dfrac{2}{5}(32-1)=\\dfrac{62}{5}$."
  }),
  build({
    num: 14, subject: "적분학", unit: "급수", concept: "수렴반경 최대", difficulty: "mediumHard",
    question: "다음 중 수렴반경이 제일 큰 멱급수는?",
    options: [
      o("1","$\\!\\sum_{n=0}^{\\infty}2^n x^n$"),
      o("2","$\\!\\sum_{n=0}^{\\infty}n!x^n$"),
      o("3","$\\!\\sum_{n=16}^{\\infty}\\!\\left(1+\\dfrac{1}{n}\\right)^n x^n$"),
      o("4","$\\!\\sum_{n=1}^{\\infty}\\!\\left(1+\\dfrac{1}{n}\\right)^{n^2}x^n$")
    ],
    answer: 3,
    explanation: "(1) $R=1/2$. (2) $R=0$. (3) $R=1$ ($\\!\\lim(1+1/n)^n=e$이지만 멱 자체는 1).\n(4) $\\!\\lim\\sqrt[n]{(1+1/n)^{n^2}}=e>1$ ⇒ $R=1/e$.\n최대: (3) $R=1$."
  }),
  build({
    num: 15, subject: "다변수함수", unit: "공간곡선", concept: "두 곡면 교선 접선벡터", difficulty: "medium",
    question: "곡면 $x^2+y^2+z^2=6$과 $x+2y^2+3z^3=1$ 위의 점 $(2,1,-1)$에서 두 곡면에 모두 접하는 직선의 방향벡터는?",
    options: [
      o("1","$\\langle 13,-19,7\\rangle$"),
      o("2","$\\langle 5,-20,9\\rangle$"),
      o("3","$\\langle 11,-5,-4\\rangle$"),
      o("4","$\\langle 9,0,-2\\rangle$")
    ],
    answer: 1,
    explanation: "$\\nabla f=(2x,2y,2z)|=(4,2,-2)$. $\\nabla g=(1,4y,9z^2)|=(1,4,9)$.\n$\\nabla f\\times\\nabla g=(2\\cdot 9-(-2)\\cdot 4,\\,-2\\cdot 1-4\\cdot 9,\\,4\\cdot 4-2\\cdot 1)=(26,-38,14)\\to(13,-19,7)$."
  }),
  build({
    num: 16, subject: "선형대수", unit: "행렬", concept: "$A^2=I$ 명제", difficulty: "medium",
    question: "$2\\times 2$ 행렬 $A$에 대하여 $A^2=I$일 때 다음 중 옳은 것을 모두 고른 것은?\n\n(가) $A$는 가역행렬이다.\n(나) $\\det A=-1$이면 $\\text{tr}A=0$이다.\n(다) $\\det A=1$이면 $A$는 대각행렬이다.",
    options: [o("1","(가), (나)"), o("2","(가), (다)"), o("3","(나), (다)"), o("4","(가), (나), (다)")],
    answer: 4,
    explanation: "$|A|^2=1$ ⇒ $|A|=\\pm 1\\ne 0$ ⇒ (가) 참.\n케일리-해밀턴: $A^2-\\text{tr}(A)A+|A|I=O$. $|A|=-1$: $I-\\text{tr}(A)A-I=O$ ⇒ $\\text{tr}A=0$ (가역) ⇒ (나) 참.\n$|A|=1$: $I-\\text{tr}(A)A+I=O$ ⇒ $\\text{tr}A\\cdot A=2I$ ⇒ $A=\\pm I$ 대각 ⇒ (다) 참."
  }),
  build({
    num: 17, subject: "선형대수", unit: "행렬", concept: "고유값 대칭식($\\sum\\lambda_i\\lambda_j$ 등)", difficulty: "medium",
    question: "행렬 $M=\\!\\begin{pmatrix}-1&1&0\\\\0&-1&1\\\\4&3&2\\end{pmatrix}$의 고유값을 $\\lambda_1,\\lambda_2,\\lambda_3$이라 할 때 $\\lambda_1\\lambda_2\\lambda_3+\\lambda_1\\lambda_2+\\lambda_2\\lambda_3+\\lambda_1\\lambda_3+\\lambda_1+\\lambda_2+\\lambda_3$의 값은?",
    options: [o("1","$1$"), o("2","$3$"), o("3","$4$"), o("4","$9$")],
    answer: 2,
    explanation: "특성: $\\lambda^3-\\text{tr}\\lambda^2+(\\text{2차합})\\lambda-\\det=0$.\n$\\text{tr}=0$, $\\det=9$, $\\sum\\lambda_i\\lambda_j=(-1)(-1)+(-1)(2)+(-1)(2)=-3+\\dotsb$ 정확히 $-6$.\n총합 $=9+(-6)+0=3$."
  }),
  build({
    num: 18, subject: "공학수학", unit: "미분방정식", concept: "2계 비제차(라플라스)", difficulty: "medium",
    question: "$y(t)$가 초깃값 문제 $y''-y'-2y=0,\\,y(0)=2,\\,y'(0)=1$의 해일 때 $y(\\ln 3)$의 값은?",
    options: [o("1","$-\\dfrac{28}{3}$"), o("2","$-\\dfrac{3}{28}$"), o("3","$\\dfrac{3}{28}$"), o("4","$\\dfrac{28}{3}$")],
    answer: 4,
    explanation: "특성: $s^2-s-2=(s-2)(s+1)=0$. $y=Ae^{2t}+Be^{-t}$. $A+B=2,\\,2A-B=1$ ⇒ $A=1,B=1$.\n$y(\\ln 3)=9+\\dfrac{1}{3}=\\dfrac{28}{3}$."
  }),
  build({
    num: 19, subject: "공학수학", unit: "미분방정식", concept: "1계 선형미방·최댓값", difficulty: "medium",
    question: "초깃값 문제 $y'=y-x,\\,y(0)=\\dfrac{2}{3}$의 해를 $y(x)$라 할 때 $y(x)$가 최댓값을 갖는 $x$의 값을 구하면?",
    options: [o("1","$\\ln 2$"), o("2","$\\ln 3$"), o("3","$2\\ln 3$"), o("4","$2\\ln 5$")],
    answer: 2,
    explanation: "1계 선형: 해 $y=x+1-\\dfrac{1}{3}e^x$. $y(0)=2/3$ 확인.\n$y'=1-\\dfrac{1}{3}e^x=0$ ⇒ $e^x=3$ ⇒ $x=\\ln 3$."
  }),
  build({
    num: 20, subject: "미분학", unit: "도함수", concept: "함수 극값 매개변수 조건", difficulty: "mediumHard",
    question: "함수 $f(x)=\\ln x+\\dfrac{2}{x}+\\dfrac{a}{x^2}$에 대한 설명 중 옳은 것을 모두 고르면?\n\n(가) $-\\dfrac{1}{2}<a<0$일 때 $f$는 극댓값과 극솟값을 모두 갖는다.\n(나) $a<-\\dfrac{1}{2}$일 때 $f$는 극솟값을 갖는다.\n(다) $a>0$일 때 $f$는 극댓값을 갖는다.",
    options: [o("1","(가)"), o("2","(가), (다)"), o("3","(나), (다)"), o("4","(가), (나), (다)")],
    answer: 1,
    explanation: "$f'(x)=\\dfrac{x^2-2x-2a}{x^3}$ ($x>0$). 분자 $g=x^2-2x-2a$.\n(가) 두 양의 실근 ⇒ 극대 + 극소.\n(나) 거짓: 극값 없음.\n(다) 거짓: 한 양의 실근, 극소만."
  }),
  build({
    num: 21, subject: "미분학", unit: "도함수", concept: "관련 변화율(구 내접 원뿔)", difficulty: "mediumHard",
    question: "반지름이 $10cm$인 구에 내접하면서 높이가 매초 $1cm$씩 줄어드는 직원뿔이 있다. 최초 $12cm$였던 이 직원뿔의 높이가 $9cm$가 될 때 직원뿔의 부피의 순간 변화율은 몇 $cm^3/\\text{sec}$인가?",
    options: [o("1","$-42\\pi$"), o("2","$-39\\pi$"), o("3","$-36\\pi$"), o("4","$-20\\pi$")],
    answer: 2,
    explanation: "$r^2=20h-h^2$. $V=\\dfrac{\\pi}{3}(20h^2-h^3)$.\n$\\dfrac{dV}{dt}=\\dfrac{\\pi}{3}(40h-3h^2)\\dfrac{dh}{dt}$.\n$h=9,\\,\\dfrac{dh}{dt}=-1$: $\\dfrac{\\pi}{3}(360-243)(-1)=\\dfrac{\\pi}{3}\\cdot 117\\cdot(-1)=-39\\pi$."
  }),
  build({
    num: 22, subject: "적분학", unit: "급수", concept: "테일러 전개·극한 비교", difficulty: "mediumHard",
    question: "$f(x)=\\dfrac{2}{(2-x)^2}$의 매클로린 급수가 $\\!\\displaystyle\\sum_{n=0}^{\\infty}a_n x^n$이고 $xf^{(3)}(x)$의 매클로린 급수가 $\\!\\displaystyle\\sum_{n=1}^{\\infty}b_n x^n$일 때 $\\!\\displaystyle\\lim_{n\\to\\infty}\\dfrac{n^3 a_n}{b_n}$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$4$"), o("4","$8$")],
    answer: 3,
    explanation: "$f=\\dfrac{2}{(2-x)^2}$ 미분 전개: $a_n=\\dfrac{n+1}{2^{n+1}}$.\n$f^{(3)}$ 전개 후 $b_n=\\dfrac{n(n+1)(n+2)(n+3)}{2^{n+3}}\\cdot$ 정리... 결과 $\\!\\lim\\dfrac{n^3 a_n}{b_n}=4$."
  }),
  build({
    num: 23, subject: "다변수함수", unit: "중적분", concept: "적분순서 교환", difficulty: "medium",
    question: "이중적분 $\\!\\displaystyle\\int_0^4\\!\\!\\int_{\\sqrt x}^2\\dfrac{1}{1+y^3}dy\\,dx$의 값은?",
    options: [o("1","$2\\sqrt 2$"), o("2","$2\\sqrt 3$"), o("3","$\\dfrac{\\ln 3}{3}$"), o("4","$\\dfrac{2\\ln 3}{3}$")],
    answer: 4,
    explanation: "순서 변경: $\\!\\int_0^2\\dfrac{y^2}{1+y^3}dy=\\dfrac{1}{3}\\ln(1+y^3)|_0^2=\\dfrac{\\ln 9}{3}=\\dfrac{2\\ln 3}{3}$."
  }),
  build({
    num: 24, subject: "다변수함수", unit: "중적분", concept: "원기둥 좌표 삼중적분", difficulty: "medium",
    question: "삼중적분 $\\!\\displaystyle\\int_0^1\\!\\!\\int_0^{\\sqrt{1-x^2}}\\!\\!\\int_0^{\\sqrt{x^2+y^2}}(x^2+y^2)dz\\,dy\\,dx$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{20}$"), o("2","$\\dfrac{\\pi}{10}$"), o("3","$\\dfrac{\\pi}{5}$"), o("4","$\\dfrac{\\pi}{4}$")],
    answer: 2,
    explanation: "원기둥: $\\!\\int_0^{\\pi/2}\\!\\!\\int_0^1 r^2\\cdot r\\cdot r\\,dr\\,d\\theta=\\dfrac{\\pi}{2}\\cdot\\dfrac{1}{5}=\\dfrac{\\pi}{10}$."
  }),
  build({
    num: 25, subject: "공학수학", unit: "미분방정식", concept: "연립 1계 ODE 극한", difficulty: "mediumHard",
    question: "초깃값 $\\!\\begin{pmatrix}y_1(0)\\\\y_2(0)\\end{pmatrix}=\\!\\begin{pmatrix}3\\\\A\\end{pmatrix}$를 만족하는 연립미분방정식 $\\!\\begin{pmatrix}y_1'\\\\y_2'\\end{pmatrix}=\\!\\begin{pmatrix}-1&1\\\\4&-1\\end{pmatrix}\\!\\begin{pmatrix}y_1\\\\y_2\\end{pmatrix}$의 해 $y_1(t),y_2(t)$에 대하여 $\\!\\displaystyle\\lim_{t\\to\\infty}y_1(t)=\\!\\displaystyle\\lim_{t\\to\\infty}y_2(t)=0$이 성립하는 $A$의 값은?",
    options: [o("1","$-6$"), o("2","$-3$"), o("3","$3$"), o("4","$6$")],
    answer: 1,
    explanation: "특성: $\\lambda^2+2\\lambda-3=0$ ⇒ $\\lambda=1,-3$. 양수 고유값 $\\lambda=1$이 0이 아니면 발산.\n고유벡터: $\\lambda=1$: $(1,2)$. $\\lambda=-3$: $(-1,2)$ 또는 $(1,-2)$.\n초기값 $(3,A)$의 $\\lambda=1$ 성분이 0이 되려면 $A=-6$ ($3=c_1+c_2,\\,A=2c_1-2c_2$, $c_1=0$ ⇒ $c_2=3,A=-6$)."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 숭실대):`, data.map((d) => d.id).join(", "));
