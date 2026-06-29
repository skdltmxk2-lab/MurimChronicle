// Upload 2023년도 서울과기대 편입수학 기출 20문항 (5지: 4지 + "다른 보기 중에는 답 없음")
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

const SCHOOL = "서울과기대";
const YEAR = "2023";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
const NONE = o("5", "다른 보기 중에는 답 없음");
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-seoultech-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  const opts = [...options, NONE];
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options: opts, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "도함수", concept: "관련 변화율(원뿔 수조)", difficulty: "medium",
    question: "밑면은 반지름이 $20cm$인 원이고 높이가 $50cm$인 직원뿔 모양의 수조가 있다. 물을 $16cm^3/s$의 속도로 주입할 때 밑면으로부터 수면의 높이가 $10cm$인 순간 수면 높이의 증가속도는? (단, 물은 밑면에서부터 차오른다.)",
    options: [o("1","$\\dfrac{1}{16\\pi}cm/s$"), o("2","$\\dfrac{3}{16\\pi}cm/s$"), o("3","$\\dfrac{1}{4\\pi}cm/s$"), o("4","$\\dfrac{3}{4\\pi}cm/s$")],
    answer: 1,
    explanation: "밑에서부터 차오르므로 수면 반지름은 $h$에 대해 $r=\\dfrac{1}{5}(100-2h)$ (직원뿔 단면).\n$V=\\pi\\!\\int_0^h\\!\\!\\left(\\dfrac{100-2y}{5}\\right)^2 dy$.\n$\\dfrac{dV}{dt}=\\pi\\!\\left(\\dfrac{100-2h}{5}\\right)^2\\dfrac{dh}{dt}$. $h=10$: $16=\\pi(16)^2\\dfrac{dh}{dt}$ ⇒ $\\dfrac{dh}{dt}=\\dfrac{1}{16\\pi}$."
  }),
  build({
    num: 2, subject: "적분학", unit: "정적분", concept: "회전체 부피·파푸스", difficulty: "medium",
    question: "곡선 $y=x-x^3$의 그래프와 $x$축으로 둘러싸인 영역을 $x=1$을 중심으로 회전하여 얻은 입체의 부피는?",
    options: [o("1","$\\dfrac{7}{60}\\pi$"), o("2","$\\dfrac{7}{30}\\pi$"), o("3","$\\dfrac{23}{30}\\pi$"), o("4","$\\pi$")],
    answer: 4,
    explanation: "$y=x-x^3$ 대칭(원점에 대해). 영역 두 조각의 중심 $(0,0)$, 면적 합 $=2\\!\\int_0^1(x-x^3)dx=\\dfrac{1}{2}$.\n파푸스: $V=2\\pi\\cdot 1\\cdot\\dfrac{1}{2}=\\pi$."
  }),
  build({
    num: 3, subject: "적분학", unit: "급수", concept: "수렴 급수 판정", difficulty: "medium",
    question: "다음에 대하여 수렴하는 급수를 모두 나열한 것은?\n\nA. $\\!\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{1}{n\\ln n}$  B. $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{1}{n^{1/n}}$\n\nC. $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n!}{n^n}$  D. $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{1}{e^n\\sin(1/n)}$",
    options: [o("1","A,B"), o("2","A,C"), o("3","A,C,D"), o("4","B,C,D")],
    answer: 5,
    explanation: "A: 적분판정 $\\!\\int\\dfrac{dx}{x\\ln x}=\\ln\\ln x$ → 발산.\nB: $n^{1/n}\\to 1$ ⇒ 발산.\nC: $\\dfrac{(n+1)!/(n+1)^{n+1}}{n!/n^n}\\to\\dfrac{1}{e}<1$ 수렴.\nD: $\\sim ne^{-n}$ 수렴.\n수렴: C, D ⇒ 보기 중 없음."
  }),
  build({
    num: 4, subject: "적분학", unit: "급수", concept: "테일러·매클로린 급수", difficulty: "medium",
    question: "다음에 대하여 옳은 것을 모두 나열한 것은?\n\nA. 모든 실수 $x$에 대하여 $\\sin x=\\dfrac{\\sqrt 3}{2}\\!\\sum_{n=0}^{\\infty}\\dfrac{(-1)^n}{(2n)!}\\!\\left(x-\\tfrac{\\pi}{3}\\right)^{2n}+\\dfrac{1}{2}\\!\\sum_{n=0}^{\\infty}\\dfrac{(-1)^n}{(2n+1)!}\\!\\left(x-\\tfrac{\\pi}{3}\\right)^{2n+1}$\nB. $|x|<1$인 실수 $x$에 대하여 $\\arcsin x=\\!\\int_0^x\\!\\left[\\sum_{n=0}^{\\infty}(-1)^n\\!\\binom{-1/2}{n}t^{2n}\\right]dt$\nC. $0<x<4$인 실수 $x$에 대하여 $\\dfrac{1}{4-x}=\\!\\sum_{n=0}^{\\infty}\\dfrac{1}{2^{n+1}}(x-2)^n$",
    options: [o("1","B"), o("2","B,C"), o("3","A,C"), o("4","A,B,C")],
    answer: 4,
    explanation: "A: $\\sin x=\\sin\\!\\left(\\tfrac{\\pi}{3}+(x-\\tfrac{\\pi}{3})\\right)=\\dfrac{\\sqrt 3}{2}\\cos(x-\\tfrac{\\pi}{3})+\\dfrac{1}{2}\\sin(x-\\tfrac{\\pi}{3})$ ✓.\nB: 이항급수로 $(1-t^2)^{-1/2}$ 전개 후 적분 ✓.\nC: $\\dfrac{1}{4-x}=\\dfrac{1/2}{1-(x-2)/2}$ 기하급수 ✓.\n모두 옳음 ⇒ A,B,C."
  }),
  build({
    num: 5, subject: "적분학", unit: "정적분", concept: "극곡선 직교좌표 변환", difficulty: "easy",
    question: "극곡선 $r^2\\sin 2\\theta=1$의 직교좌표방정식은?",
    options: [o("1","$x^2-y^2=1$"), o("2","$x^2+y^2=1$"), o("3","$y=\\dfrac{1}{x}$"), o("4","$y=\\dfrac{1}{2x}$")],
    answer: 4,
    explanation: "$r^2\\sin 2\\theta=2r^2\\sin\\theta\\cos\\theta=2xy=1$ ⇒ $y=\\dfrac{1}{2x}$."
  }),
  build({
    num: 6, subject: "다변수함수", unit: "공간도형", concept: "꼬임 두 직선 거리", difficulty: "medium",
    question: "다음 두 직선 $x=\\dfrac{y-1}{2}=\\dfrac{z-2}{3},\\;x+3=y-1=\\dfrac{z-1}{2}$ 사이의 거리는?",
    options: [o("1","$\\dfrac{\\sqrt 3}{3}$"), o("2","$\\dfrac{2\\sqrt 3}{3}$"), o("3","$\\sqrt 3$"), o("4","$\\dfrac{5\\sqrt 3}{3}$")],
    answer: 2,
    explanation: "$L_1$ 방향 $(1,2,3)$, 점 $(0,1,2)$. $L_2$ 방향 $(1,1,2)$, 점 $(-3,1,1)$.\n$L_1\\times L_2=(1,1,-1)$. 평면 $x+y-z=-1$.\n거리 $=\\dfrac{|-3+1-1+1|}{\\sqrt 3}=\\dfrac{2}{\\sqrt 3}=\\dfrac{2\\sqrt 3}{3}$."
  }),
  build({
    num: 7, subject: "다변수함수", unit: "공간곡선", concept: "곡률 계산", difficulty: "medium",
    question: "곡선 $\\vec r(t)=3t^2\\vec i+2t\\vec j+t^3\\vec k$의 $t=0$에서의 곡률은?",
    options: [o("1","$\\dfrac{\\sqrt 3}{4}$"), o("2","$\\dfrac{\\sqrt 6}{2}$"), o("3","$\\dfrac{3}{2}$"), o("4","$3\\sqrt 2$")],
    answer: 3,
    explanation: "$\\vec r'(0)=(0,2,0)$, $|\\vec r'|=2$. $\\vec r''(0)=(6,0,0)$. $\\vec r'\\times\\vec r''=(0,0,-12)$. $|.|=12$.\n$\\kappa=\\dfrac{12}{8}=\\dfrac{3}{2}$."
  }),
  build({
    num: 8, subject: "다변수함수", unit: "편미분", concept: "극값·안장점(2변수)", difficulty: "mediumHard",
    question: "함수 $f(x,y)=8x^3-12xy+y^3$의 극댓값들의 합을 $a$, 극솟값들의 합을 $b$, 안장점에서의 함숫값들의 합을 $c$라 할 때 $a+2b+3c$의 값은?\n(단, 극댓값을 갖지 않으면 $a=0$, 극솟값을 갖지 않으면 $b=0$, 안장점이 없으면 $c=0$으로 한다.)",
    options: [o("1","$-16$"), o("2","$-8$"), o("3","$0$"), o("4","$8$")],
    answer: 1,
    explanation: "$f_x=24x^2-12y=0$ ⇒ $y=2x^2$. $f_y=-12x+3y^2=0$ ⇒ $-12x+12x^4=0$ ⇒ $x=0,1$.\n임계점 $(0,0),(1,2)$.\n$f_{xx}=48x,\\,f_{yy}=6y,\\,f_{xy}=-12$.\n$(0,0)$: $\\Delta=0-144<0$ 안장점, $f=0$.\n$(1,2)$: $\\Delta=48\\cdot 12-144>0$, $f_{xx}>0$ 극소, $f(1,2)=8-24+8=-8$.\n$a=0,b=-8,c=0$. $a+2b+3c=-16$."
  }),
  build({
    num: 9, subject: "공학수학", unit: "벡터적분", concept: "벡터장 선적분(직선 경로)", difficulty: "medium",
    question: "질점이 점 $(0,0,1)$에서 $(2,1,0)$까지 선분을 따라 움직이는데 힘의 장 $\\vec F(x,y,z)=(x-y^2)\\vec i+(y-z^2)\\vec j+(z-x^2)\\vec k$가 하는 일은?",
    options: [o("1","$\\dfrac{7}{3}$"), o("2","$\\dfrac{8}{3}$"), o("3","$3$"), o("4","$\\dfrac{10}{3}$")],
    answer: 1,
    explanation: "$\\vec r(t)=(2t,t,-t+1),\\;0\\le t\\le 1$. $\\vec r'=(2,1,-1)$.\n$\\vec F=(2t-t^2,t-(t-1)^2,-t+1-4t^2)$.\n$\\vec F\\cdot\\vec r'=2(2t-t^2)+(t-(t-1)^2)-(-t+1-4t^2)=t^2+8t-2$.\n$\\!\\int_0^1(t^2+8t-2)dt=\\dfrac{1}{3}+4-2=\\dfrac{7}{3}$."
  }),
  build({
    num: 10, subject: "공학수학", unit: "벡터적분", concept: "발산정리·열린 곡면 보정", difficulty: "mediumHard",
    question: "곡면 $z=1-x^2-y^2\\;(x^2+y^2\\le 1)$의 영역을 $S$라고 하고 $\\vec F(x,y,z)=(2x^3+y^3)\\vec i+(y^3+z^3)\\vec j+3y^2 z\\vec k$일 때 면적분 $\\!\\displaystyle\\iint_S\\vec F\\cdot d\\vec S$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{2}$"), o("2","$\\dfrac{4}{5}\\pi$"), o("3","$\\pi$"), o("4","$\\dfrac{8}{5}\\pi$")],
    answer: 3,
    explanation: "$z=0$ 평면으로 닫고 발산정리.\n$\\text{div}\\vec F=6x^2+3y^2+3y^2=6x^2+6y^2$.\n$\\!\\iiint(6x^2+6y^2)dV=6\\!\\int_0^{2\\pi}\\!\\int_0^1 r^2\\cdot r(1-r^2)dr\\,d\\theta=12\\pi\\!\\int_0^1(r^3-r^5)dr=\\pi$.\n$z=0$ 면적분 $=0$ (성분 분석).\n결과 $\\pi$."
  }),
  build({
    num: 11, subject: "다변수함수", unit: "중적분", concept: "스칼라 면적분", difficulty: "medium",
    question: "곡면 $z=x+2y\\;(0\\le x\\le 1,\\;0\\le y\\le x)$의 영역을 $S$라고 할 때 면적분 $\\!\\displaystyle\\iint_S(x+y+z)dS$의 값은?",
    options: [o("1","$\\dfrac{5\\sqrt 6}{6}$"), o("2","$\\dfrac{7\\sqrt 6}{6}$"), o("3","$\\dfrac{5\\sqrt 6}{3}$"), o("4","$\\dfrac{7\\sqrt 6}{3}$")],
    answer: 2,
    explanation: "$z_x=1,z_y=2$. $dS=\\sqrt 6\\,dxdy$. $x+y+z=2x+3y$.\n$\\!\\int_0^1\\!\\!\\int_0^x(2x+3y)\\sqrt 6\\,dy\\,dx=\\sqrt 6\\!\\int_0^1\\!\\!\\left(2x\\cdot x+\\dfrac{3x^2}{2}\\right)dx=\\sqrt 6\\cdot\\dfrac{7}{6}=\\dfrac{7\\sqrt 6}{6}$."
  }),
  build({
    num: 12, subject: "공학수학", unit: "미분방정식", concept: "변수분리형", difficulty: "easy",
    question: "미분방정식 $-y^2\\sin x\\,dx+dy=0,\\;y(\\pi)=1$에 대하여 $y\\!\\left(\\dfrac{\\pi}{4}\\right)$는?",
    options: [o("1","$\\dfrac{2}{4-\\sqrt 2}$"), o("2","$\\dfrac{2}{4+\\sqrt 2}$"), o("3","$\\dfrac{2}{2-\\sqrt 2}$"), o("4","$\\dfrac{2}{2+\\sqrt 2}$")],
    answer: 2,
    explanation: "$\\dfrac{dy}{y^2}=\\sin x\\,dx$. $-\\dfrac{1}{y}=-\\cos x+C$. $y(\\pi)=1$: $-1=1+C$ ⇒ $C=-2$.\n$\\dfrac{1}{y}=\\cos x+2$. $y(\\pi/4)=\\dfrac{1}{\\cos(\\pi/4)+2}=\\dfrac{1}{\\sqrt 2/2+2}=\\dfrac{2}{\\sqrt 2+4}=\\dfrac{2}{4+\\sqrt 2}$."
  }),
  build({
    num: 13, subject: "공학수학", unit: "미분방정식", concept: "코시-오일러(복소근)", difficulty: "mediumHard",
    question: "미분방정식 $x^2 y''-3xy'+5y=0,\\;y(e^{\\pi/2})=e^{\\pi},\\;y(e^{\\pi})=2e^{2\\pi}$에 대하여 $y\\!\\left(e^{\\pi/4}\\right)$은?",
    options: [
      o("1","$-\\sqrt 2 e^{\\pi/4}$"),
      o("2","$-\\dfrac{1}{\\sqrt 2}e^{\\pi/4}$"),
      o("3","$-\\sqrt 2 e^{\\pi/2}$"),
      o("4","$-\\dfrac{1}{\\sqrt 2}e^{\\pi/2}$")
    ],
    answer: 4,
    explanation: "보조: $r(r-1)-3r+5=r^2-4r+5=0$ ⇒ $r=2\\pm i$.\n$y=x^2\\{c_1\\cos(\\ln x)+c_2\\sin(\\ln x)\\}$.\n$y(e^{\\pi/2})=e^\\pi\\{c_1\\cos(\\pi/2)+c_2\\sin(\\pi/2)\\}=e^\\pi c_2=e^\\pi$ ⇒ $c_2=1$.\n$y(e^\\pi)=e^{2\\pi}\\{c_1\\cos\\pi+c_2\\sin\\pi\\}=-e^{2\\pi}c_1=2e^{2\\pi}$ ⇒ $c_1=-2$.\n$y(e^{\\pi/4})=e^{\\pi/2}\\{-2\\cos(\\pi/4)+\\sin(\\pi/4)\\}=e^{\\pi/2}\\cdot\\dfrac{\\sqrt 2}{2}(-2+1)=-\\dfrac{1}{\\sqrt 2}e^{\\pi/2}$."
  }),
  build({
    num: 14, subject: "공학수학", unit: "미분방정식", concept: "2계 비제차(미정계수)", difficulty: "mediumHard",
    question: "미분방정식 $y''-4y'+3y=10\\cos x,\\;y(0)=1,\\;y'(0)=0$에 대하여 $y'\\!\\left(\\dfrac{\\pi}{2}\\right)$는?",
    options: [
      o("1","$-e^{\\pi/2}+e^{3\\pi/2}-1$"),
      o("2","$-e^{\\pi/2}+e^{3\\pi/2}-2$"),
      o("3","$-e^{\\pi/2}+3e^{3\\pi/2}-1$"),
      o("4","$-e^{\\pi/2}+3e^{3\\pi/2}-2$")
    ],
    answer: 3,
    explanation: "$y_p=-2\\sin x+\\cos x$ (미정계수). $y_c=Ae^x+Be^{3x}$.\n$y(0)=A+B+1=1$ ⇒ $A+B=0$. $y'(0)=A+3B-2=0$ ⇒ $A=-1,B=1$.\n$y=-e^x+e^{3x}-2\\sin x+\\cos x$.\n$y'=-e^x+3e^{3x}-2\\cos x-\\sin x$.\n$y'(\\pi/2)=-e^{\\pi/2}+3e^{3\\pi/2}-0-1=-e^{\\pi/2}+3e^{3\\pi/2}-1$."
  }),
  build({
    num: 15, subject: "공학수학", unit: "미분방정식", concept: "연립 1계(비제차)", difficulty: "mediumHard",
    question: "연립미분방정식 $y_1'=4y_2-8\\cos 4t,\\;y_2'=-3y_1-9\\sin 4t,\\;y_1(0)=0,\\;y_2(0)=3$에 대하여 $y_1\\!\\left(-\\dfrac{\\pi}{8}\\right)+y_2\\!\\left(\\dfrac{\\pi}{8}\\right)$는?",
    options: [o("1","$1$"), o("2","$3$"), o("3","$-1$"), o("4","$-3$")],
    answer: 3,
    explanation: "$y_1$ 미방 정리: $y_1''+12y_1=...$ 해석 후 $y_1=\\sin 4t$.\n$y_2=2\\cos 4t+\\dfrac{1}{4}y_1'=2\\cos 4t+\\cos 4t=3\\cos 4t$.\n$y_1(-\\pi/8)=\\sin(-\\pi/2)=-1,\\;y_2(\\pi/8)=3\\cos(\\pi/2)=0$.\n합 $=-1$."
  }),
  build({
    num: 16, subject: "공학수학", unit: "미분방정식", concept: "혼합 농도·극한값", difficulty: "medium",
    question: "물탱크에 $20kg$의 소금이 용해된 $100L$의 소금물이 들어있다. $L$당 $0.25kg$의 소금이 용해된 소금물이 분당 $20L$씩 물탱크 안으로 공급된다. 그리고 완전히 섞인 후 분당 $20L$씩 물탱크 밖으로 소금물이 흘러나간다. 물탱크 안의 소금의 양이 그것의 극한값$(t\\to\\infty)$의 $90\\%$에 이르는데 걸리는 시간은?",
    options: [o("1","$\\ln 2$"), o("2","$2\\ln 2$"), o("3","$5\\ln 2$"), o("4","$10\\ln 2$")],
    answer: 3,
    explanation: "$y'=5-\\dfrac{1}{5}y$. 해 $y=25-5e^{-t/5}$. 극한 $=25$. $0.9\\cdot 25=22.5$.\n$25-5e^{-t/5}=22.5$ ⇒ $e^{-t/5}=1/2$ ⇒ $t=5\\ln 2$."
  }),
  build({
    num: 17, subject: "선형대수", unit: "행렬", concept: "역행렬의 원소 합", difficulty: "medium",
    question: "행렬 $\\!\\begin{pmatrix}1&3&-1\\\\0&1&0\\\\-1&2&2\\end{pmatrix}^{-1}$의 모든 원소의 합은?",
    options: [o("1","$-2$"), o("2","$-4$"), o("3","$-6$"), o("4","$-8$")],
    answer: 5,
    explanation: "$A^{-1}\\!\\begin{pmatrix}1\\\\1\\\\1\\end{pmatrix}=(a,b,c)^T$. $\\!\\begin{pmatrix}1\\\\1\\\\1\\end{pmatrix}=A\\!\\begin{pmatrix}a\\\\b\\\\c\\end{pmatrix}$.\n$a+3b-c=1,\\;b=1,\\;-a+2b+2c=1$ ⇒ $a-c=-2,\\;-a+2c=-1$. $c=-3,a=-5$.\n원소 합 $=a+b+c=-7$ ⇒ 보기 중 없음."
  }),
  build({
    num: 18, subject: "선형대수", unit: "행렬", concept: "행렬식·고유값 합(trace)", difficulty: "medium",
    question: "두 행렬 $A=\\!\\begin{pmatrix}a&a+1&a+2\\\\a+1&a+2&a+3\\\\a+2&a+3&a+4\\end{pmatrix},\\;B=\\!\\begin{pmatrix}b&1&3\\\\0&c-b&b\\\\0&0&3-c\\end{pmatrix}$이다. 행렬 $A$의 행렬식을 $\\alpha$라 하고 행렬 $B$의 모든 고유값들의 합을 $\\beta$라 할 때 $\\alpha+\\beta$는? (단, 행렬 $B$의 고유값들은 서로 다르다고 가정한다.)",
    options: [o("1","$2$"), o("2","$3$"), o("3","$4$"), o("4","$5$")],
    answer: 2,
    explanation: "$A$: 행 차이가 일정($R_2-R_1=R_3-R_2=(1,1,1)$) ⇒ 행 종속 ⇒ $\\det A=0$. $\\alpha=0$.\n$B$ 상삼각: 고유값 $b,c-b,3-c$. 합 $=3$. $\\beta=3$.\n$\\alpha+\\beta=3$."
  }),
  build({
    num: 19, subject: "선형대수", unit: "행렬", concept: "고유값 합·매개변수", difficulty: "easy",
    question: "다음 행렬 $(x^2-1)\\!\\begin{pmatrix}1&2\\\\4&3\\end{pmatrix}$의 고유값들의 합이 $12$일 때 $x$값들의 곱은?",
    options: [o("1","$-4$"), o("2","$-2$"), o("3","$2$"), o("4","$4$")],
    answer: 1,
    explanation: "고유값 합 $=\\text{tr}=(x^2-1)\\cdot 4=12$ ⇒ $x^2-1=3$ ⇒ $x^2=4$ ⇒ $x=\\pm 2$. 곱 $=-4$."
  }),
  build({
    num: 20, subject: "선형대수", unit: "행렬", concept: "고유분해 거듭제곱", difficulty: "mediumHard",
    question: "$2\\times 2$ 행렬 $A$가 $A\\!\\begin{pmatrix}2\\\\1\\end{pmatrix}=4\\!\\begin{pmatrix}2\\\\1\\end{pmatrix},\\;A\\!\\begin{pmatrix}1\\\\-3\\end{pmatrix}=-3\\!\\begin{pmatrix}1\\\\-3\\end{pmatrix}$을 만족할 때 $A^3\\!\\begin{pmatrix}3\\\\5\\end{pmatrix}$의 모든 원소의 합은?",
    options: [o("1","$180$"), o("2","$230$"), o("3","$280$"), o("4","$330$")],
    answer: 4,
    explanation: "고유벡터 분해: $(3,5)=a(2,1)+b(1,-3)$ ⇒ $2a+b=3,\\;a-3b=5$ ⇒ $a=2,b=-1$.\n$A^3(3,5)=2\\cdot 4^3(2,1)-(-3)^3(1,-3)=128(2,1)+27(1,-3)=(256+27,128-81)=(283,47)$.\n합 $=330$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 서울과기대):`, data.map((d) => d.id).join(", "));
