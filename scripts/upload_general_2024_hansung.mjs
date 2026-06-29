// Upload 2024년도 한성대 편입수학 기출 20문항 (4지 선다형)
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

const SCHOOL = "한성대";
const YEAR = "2024";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-hansung-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "공학수학", unit: "미분방정식", concept: "변수분리형", difficulty: "easy",
    question: "다음 상미분방정식의 일반해는?\n\n$(e^x\\cos y)dx-(e^x\\sin y)dy=0$",
    options: [o("1","$e^x\\sin y=c$"), o("2","$e^x\\tan y=c$"), o("3","$e^x\\cos y=c$"), o("4","$e^x(\\sin y+\\cos y)=c$")],
    answer: 3,
    explanation: "$e^x\\cos y\\,dx-e^x\\sin y\\,dy=0$. $M_y=-e^x\\sin y=N_x$ ⇒ 완전.\n$\\!\\int e^x\\cos y\\,dx=e^x\\cos y$. 해: $e^x\\cos y=c$."
  }),
  build({
    num: 2, subject: "다변수함수", unit: "공간도형", concept: "점과 평면의 거리", difficulty: "medium",
    question: "점 $(2,2,2)$에서 세 점 $(1,0,0),(2,1,0),(3,3,1)$을 포함하는 평면에 내린 수선의 길이는?",
    options: [o("1","$\\sqrt 3$"), o("2","$\\dfrac{\\sqrt 3}{3}$"), o("3","$1$"), o("4","$2$")],
    answer: 2,
    explanation: "두 벡터 $(1,1,0),(2,3,1)$의 외적 $=(1,-1,1)$. 평면: $x-y+z=1$.\n$d=\\dfrac{|2-2+2-1|}{\\sqrt 3}=\\dfrac{1}{\\sqrt 3}=\\dfrac{\\sqrt 3}{3}$."
  }),
  build({
    num: 3, subject: "선형대수", unit: "행렬", concept: "직교행렬 조건", difficulty: "medium",
    question: "행렬 $A=\\!\\begin{pmatrix}\\dfrac{3}{5}&a\\\\\\dfrac{4}{5}&b\\end{pmatrix}$이 직교행렬이 되기 위해 가능한 $a,b$ 값은?",
    options: [
      o("1","$a=\\dfrac{4}{5},\\;b=-\\dfrac{3}{5}$"),
      o("2","$a=\\dfrac{4}{5},\\;b=\\dfrac{3}{5}$"),
      o("3","$a=\\dfrac{3}{5},\\;b=-\\dfrac{4}{5}$"),
      o("4","$a=\\dfrac{3}{5},\\;b=\\dfrac{4}{5}$")
    ],
    answer: 1,
    explanation: "직교행렬: 각 행/열 단위벡터 + 서로 수직.\n행 크기 $=1$: $a^2+9/25=1$ ⇒ $a=\\pm 4/5$, $b^2+9/25=$... 아니 두 번째 열은 $(a,b)$로 $a^2+b^2=1$.\n수직 $\\dfrac{3}{5}a+\\dfrac{4}{5}b=0$ ⇒ $b=-\\dfrac{3}{4}a$. $a=\\dfrac{4}{5}$이면 $b=-\\dfrac{3}{5}$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분", concept: "직선·포물선 영역의 넓이", difficulty: "medium",
    question: "$y=2x+2$와 $y=x^2-1$로 둘러싸인 영역 중 $x\\ge 0,\\;y\\ge 0$에 있는 부분의 넓이는?",
    options: [o("1","$\\dfrac{21}{3}$"), o("2","$\\dfrac{23}{3}$"), o("3","$\\dfrac{25}{3}$"), o("4","$\\dfrac{27}{3}$")],
    answer: 3,
    explanation: "교점: $2x+2=x^2-1$ ⇒ $x^2-2x-3=0$ ⇒ $x=3$ (양). 포물선과 $x$축 교점: $x=1$.\n사다리꼴 $S_1=\\dfrac{1}{2}(2+8)\\cdot 3=15$ ($x\\in[0,3]$, $y\\in$직선 아래·$x$축 위).\n$y=x^2-1$이 $x$축 아래 부분 $S_2=\\!\\int_1^3(x^2-1)dx$... 해설 따라: $S=S_1-S_2=15-20/3=25/3$."
  }),
  build({
    num: 5, subject: "공학수학", unit: "미분방정식", concept: "극한과 1계 미분방정식", difficulty: "medium",
    question: "$2f''(x)+f'(x)=1$을 만족하는 $f(x)$에 대해 $\\!\\displaystyle\\lim_{x\\to\\infty}f'(x)$의 가능한 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$")],
    answer: 2,
    explanation: "$g=f'$, $2g'+g=1$의 해 $g=1+Ce^{-x/2}$. $\\!\\lim_{x\\to\\infty}g(x)=1$."
  }),
  build({
    num: 6, subject: "적분학", unit: "급수", concept: "기하급수·초항·공비", difficulty: "easy",
    question: "수열 $a_n$에 대하여 $a_n=\\!\\left(\\dfrac{1}{2}\\right)^{n-1}$일 경우 $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{a_n}{2^m}$이 $\\dfrac{1}{2}$이 되도록 하는 $m$의 값은?",
    options: [o("1","$2$"), o("2","$1$"), o("3","$-2$"), o("4","$-1$")],
    answer: 1,
    explanation: "$\\!\\sum_{n=1}^{\\infty}\\dfrac{(1/2)^{n-1}}{2^m}=\\dfrac{1}{2^m}\\cdot\\dfrac{1}{1-1/2}=\\dfrac{2}{2^m}=\\dfrac{1}{2^{m-1}}=\\dfrac{1}{2}$ ⇒ $m-1=1$ ⇒ $m=2$."
  }),
  build({
    num: 7, subject: "미분학", unit: "극한과 연속", concept: "$(1-\\cdot)^x$ 극한", difficulty: "medium",
    question: "$\\!\\displaystyle\\lim_{x\\to\\infty}\\!\\left(1-\\dfrac{e^{-x}}{x}\\right)^x$의 값은?",
    options: [o("1","$e$"), o("2","$e^{-1}$"), o("3","$0$"), o("4","$1$")],
    answer: 4,
    explanation: "$\\!\\left(1-\\dfrac{1}{xe^x}\\right)^x=\\!\\left[\\!\\left(1-\\dfrac{1}{xe^x}\\right)^{xe^x}\\right]^{x/(xe^x)}=e^{-1/e^x}\\to e^0=1$."
  }),
  build({
    num: 8, subject: "미분학", unit: "도함수", concept: "합성함수 2계 미분", difficulty: "medium",
    question: "두 번 미분가능한 함수 $f(x),g(x)$에 대하여 $\\dfrac{d^2}{dx^2}\\{f(g(x))\\}=f(x)+g(x),\\;g(1)=g'(1)=g''(1)=1,\\;f(1)=1,\\;f'(1)=2$를 만족할 경우 $f''(1)$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$")],
    answer: 1,
    explanation: "$\\dfrac{d^2}{dx^2}\\{f(g(x))\\}=f''(g(x))[g'(x)]^2+f'(g(x))g''(x)$.\n$x=1$: $f''(1)\\cdot 1+f'(1)\\cdot 1=f(1)+g(1)$ ⇒ $f''(1)+2=2$ ⇒ $f''(1)=0$."
  }),
  build({
    num: 9, subject: "미분학", unit: "도함수", concept: "두 곡선의 수직 교차", difficulty: "medium",
    question: "두 곡선 $f(x)=\\dfrac{1}{3}x^3-\\dfrac{2}{3}$와 $g(x)=ax^2+b$가 $x=2$에서 서로 수직으로 교차하기 위한 $4a+b$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 2,
    explanation: "조건 ①: $f(2)=g(2)$: $\\dfrac{8}{3}-\\dfrac{2}{3}=4a+b$ ⇒ $4a+b=2$."
  }),
  build({
    num: 10, subject: "선형대수", unit: "행렬", concept: "고유공간 기저(고유벡터)", difficulty: "medium",
    question: "행렬 $A=\\!\\begin{pmatrix}2&2&0\\\\2&2&0\\\\0&0&2\\end{pmatrix}$의 고유공간에 대한 기저벡터에 해당하는 것은?",
    options: [
      o("1","$\\!\\begin{pmatrix}0\\\\0\\\\1\\end{pmatrix}$"),
      o("2","$\\!\\begin{pmatrix}1\\\\0\\\\0\\end{pmatrix}$"),
      o("3","$\\!\\begin{pmatrix}\\dfrac{1}{\\sqrt 2}\\\\0\\\\\\dfrac{1}{\\sqrt 2}\\end{pmatrix}$"),
      o("4","$\\!\\begin{pmatrix}\\dfrac{1}{\\sqrt 2}\\\\0\\\\-\\dfrac{1}{\\sqrt 2}\\end{pmatrix}$")
    ],
    answer: 1,
    explanation: "$A(0,0,1)^T=(0,0,2)^T=2(0,0,1)^T$ ⇒ $\\lambda=2$의 고유벡터. 다른 보기는 $A\\vec v$가 $\\vec v$의 상수배가 아님."
  }),
  build({
    num: 11, subject: "공학수학", unit: "미분방정식", concept: "2계 비제차(특수해+보조해)", difficulty: "mediumHard",
    question: "미분방정식 $y''+4y=-12\\sin(2x),\\;y(0)=1,\\;y'(0)=1$에 대하여 $y\\!\\left(\\dfrac{\\pi}{2}\\right)$의 값은?",
    options: [o("1","$1+\\dfrac{3\\pi}{2}$"), o("2","$1-\\dfrac{3\\pi}{2}$"), o("3","$-1+\\dfrac{3\\pi}{2}$"), o("4","$-1-\\dfrac{3\\pi}{2}$")],
    answer: 4,
    explanation: "공명: $y_p=3x\\cos 2x$ (소멸연산자). 보조 $y_c=A\\cos 2x+B\\sin 2x$.\n초기: $y(0)=A=1$, $y'(0)=2B+3=1$ ⇒ $B=-1$.\n$y=\\cos 2x-\\sin 2x+3x\\cos 2x$. $x=\\pi/2$: $\\cos\\pi-\\sin\\pi+\\tfrac{3\\pi}{2}\\cos\\pi=-1-0-\\tfrac{3\\pi}{2}$."
  }),
  build({
    num: 12, subject: "공학수학", unit: "라플라스변환", concept: "역라플라스 (1차 이동·중근)", difficulty: "medium",
    question: "함수 $f(t)$의 라플라스 변환 $L\\{f(t)\\}=G(s),\\;G(s)=\\dfrac{s^2+2}{(s+1)^3}$일 때 $f(1)$의 값은?",
    options: [o("1","$\\dfrac{1}{2}e$"), o("2","$\\dfrac{3}{2}e$"), o("3","$\\dfrac{1}{2}e^{-1}$"), o("4","$\\dfrac{3}{2}e^{-1}$")],
    answer: 3,
    explanation: "$\\dfrac{s^2+2}{(s+1)^3}=\\dfrac{(s+1)^2-2(s+1)+3}{(s+1)^3}=\\dfrac{1}{s+1}-\\dfrac{2}{(s+1)^2}+\\dfrac{3}{(s+1)^3}$.\n역변환: $f(t)=e^{-t}(1-2t+\\tfrac{3}{2}t^2)$.\n$f(1)=e^{-1}(1-2+\\tfrac{3}{2})=\\dfrac{1}{2}e^{-1}$."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "중적분", concept: "삼중적분", difficulty: "medium",
    question: "$\\!\\displaystyle\\int_V\\sin(2x)\\cos(2y)\\,dV$의 값은? (단, $0\\le x\\le\\dfrac{\\pi}{4},\\;\\dfrac{\\pi}{4}-x\\le y\\le\\dfrac{\\pi}{4},\\;0\\le z\\le 6,\\;dV=dx\\,dy\\,dz$)",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$\\dfrac{2}{3}$"), o("3","$\\dfrac{3}{4}$"), o("4","$1$")],
    answer: 3,
    explanation: "$z$ 적분 $=6$. $\\!\\int_0^{\\pi/4}\\sin 2x\\!\\int_{\\pi/4-x}^{\\pi/4}\\cos 2y\\,dy\\,dx$.\n내부 $=\\tfrac{1}{2}[\\sin 2y]_{\\pi/4-x}^{\\pi/4}=\\tfrac{1}{2}(1-\\sin(\\tfrac{\\pi}{2}-2x))=\\tfrac{1}{2}(1-\\cos 2x)$.\n$6\\cdot\\!\\int_0^{\\pi/4}\\sin 2x\\cdot\\tfrac{1}{2}(1-\\cos 2x)dx=3\\cdot\\!\\left[\\tfrac{1}{2}\\cos 2x+\\tfrac{1}{4}\\cos^2 2x\\right]$... 결과 $\\dfrac{3}{4}$."
  }),
  build({
    num: 14, subject: "적분학", unit: "정적분", concept: "공간곡선의 길이", difficulty: "easy",
    question: "벡터함수 $\\vec r(t)=(\\cos 2t)\\vec i+(\\sin 2t)\\vec j+(t)\\vec k$에 대하여 $0\\le t\\le 3$ 사이의 곡선의 길이는?",
    options: [o("1","$\\sqrt 5$"), o("2","$3\\sqrt 5$"), o("3","$3$"), o("4","$5$")],
    answer: 2,
    explanation: "$\\vec r'=(-2\\sin 2t,2\\cos 2t,1)$, $|\\vec r'|=\\sqrt{4+1}=\\sqrt 5$.\n$L=\\!\\int_0^3\\sqrt 5\\,dt=3\\sqrt 5$."
  }),
  build({
    num: 15, subject: "선형대수", unit: "벡터", concept: "좌표축 회전", difficulty: "medium",
    question: "$2$차원 $xy$평면에 정의된 벡터 $\\vec u=\\langle 1,\\sqrt 3\\rangle$이 있다. 원점을 지나는 수직축에 대해 반시계 방향으로 $30°$ 회전한 좌표축을 $x'y'$이라고 할 때 $x'y'$ 좌표축에 대한 벡터 $\\vec u$의 성분은?",
    options: [o("1","$\\langle\\sqrt 3,1\\rangle$"), o("2","$\\langle-\\sqrt 3,1\\rangle$"), o("3","$\\langle 2,0\\rangle$"), o("4","$\\langle-2,0\\rangle$")],
    answer: 1,
    explanation: "축 회전 시 좌표는 반대 회전. $\\vec u'=R_{-30°}\\vec u$.\n$R_{-30°}=\\!\\begin{pmatrix}\\cos\\!\\tfrac{\\pi}{6}&\\sin\\!\\tfrac{\\pi}{6}\\\\-\\sin\\!\\tfrac{\\pi}{6}&\\cos\\!\\tfrac{\\pi}{6}\\end{pmatrix}=\\!\\begin{pmatrix}\\tfrac{\\sqrt 3}{2}&\\tfrac{1}{2}\\\\-\\tfrac{1}{2}&\\tfrac{\\sqrt 3}{2}\\end{pmatrix}$.\n$\\vec u'=\\!\\begin{pmatrix}\\tfrac{\\sqrt 3}{2}+\\tfrac{\\sqrt 3}{2}\\\\-\\tfrac{1}{2}+\\tfrac{3}{2}\\end{pmatrix}=\\!\\begin{pmatrix}\\sqrt 3\\\\1\\end{pmatrix}$."
  }),
  build({
    num: 16, subject: "선형대수", unit: "행렬", concept: "$\\det(A^2)=(\\det A)^2$", difficulty: "medium",
    question: "행렬 $A=\\!\\begin{pmatrix}1&2&3&0&2\\\\2&1&1&0&1\\\\4&1&2&0&3\\\\2&5&1&2&0\\\\0&1&0&0&0\\end{pmatrix}$에 대하여 $\\det(A^2)$의 값은?",
    options: [o("1","$49$"), o("2","$81$"), o("3","$81$"), o("4","$100$")],
    answer: 4,
    explanation: "5행에 $1$이 하나(2열) → 2열 따라 전개. 결과적으로 $\\det A=-10$.\n$\\det(A^2)=(\\det A)^2=100$."
  }),
  build({
    num: 17, subject: "공학수학", unit: "미분방정식", concept: "연립 1계 ODE(행렬·라플라스)", difficulty: "mediumHard",
    question: "연립 방정식 $y_1'=2y_1+y_2,\\;y_2'=2y_1+3y_2$는 $y_1(0)=3,\\;y_2(0)=0$을 만족한다. $y_2(1)$의 값은?",
    options: [o("1","$-2e+2e^2$"), o("2","$-2e-2e^2$"), o("3","$-2e+2e^4$"), o("4","$-2e-2e^4$")],
    answer: 3,
    explanation: "$y_2''-5y_2'+4y_2=0$, $y_2(0)=0$, $y_2'(0)=2y_1(0)+3y_2(0)=6$.\n특성방정식 $s^2-5s+4=0$ ⇒ $s=1,4$.\n$y_2=c_1 e^t+c_2 e^{4t}$. $c_1+c_2=0$, $c_1+4c_2=6$ ⇒ $c_2=2,c_1=-2$.\n$y_2(1)=-2e+2e^4$."
  }),
  build({
    num: 18, subject: "공학수학", unit: "벡터적분", concept: "벡터장 선적분", difficulty: "medium",
    question: "$\\vec F=(2x)\\vec i+(-z)\\vec j+(2y)\\vec k$이고 $\\vec r(t)$의 경로 $C$는 $(1,0,0)$에서 $(2,1,1)$까지 가는 직선경로이다. $\\!\\displaystyle\\int_C\\vec F\\cdot d\\vec r$의 값은?",
    options: [o("1","$\\dfrac{7}{2}$"), o("2","$\\dfrac{9}{2}$"), o("3","$\\dfrac{11}{2}$"), o("4","$\\dfrac{13}{2}$")],
    answer: 1,
    explanation: "$\\vec r(t)=(t+1,t,t),\\;0\\le t\\le 1$. $\\vec r'=(1,1,1)$.\n$\\vec F(\\vec r)=(2(t+1),-t,2t)$. $\\vec F\\cdot\\vec r'=2t+2-t+2t=3t+2$.\n$\\!\\int_0^1(3t+2)dt=\\dfrac{3}{2}+2=\\dfrac{7}{2}$."
  }),
  build({
    num: 19, subject: "적분학", unit: "급수", concept: "급수 수렴/발산 판정", difficulty: "medium",
    question: "다음 중 수렴하는 급수의 개수는?\n\nㄱ) $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{1}{n(n+1)}$  ㄴ) $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n}{3^n}$\n\nㄷ) $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n^n}{n!}$  ㄹ) $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{1}{\\sqrt n}$",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 2,
    explanation: "ㄱ) $\\sim\\sum 1/n^2$ 수렴.\nㄴ) 비율판정: $\\!\\lim\\dfrac{n+1}{3n}=\\dfrac{1}{3}<1$ 수렴.\nㄷ) $a_{n+1}/a_n=(1+1/n)^n\\to e>1$ 발산.\nㄹ) $p=1/2$ 발산.\n수렴 2개."
  }),
  build({
    num: 20, subject: "적분학", unit: "정적분", concept: "심장곡선(카디오이드) 넓이", difficulty: "easy",
    question: "$r-\\theta$ 좌표계의 곡선 $r=2(1+\\cos\\theta)$의 내부의 면적은?",
    options: [o("1","$2\\pi$"), o("2","$4\\pi$"), o("3","$6\\pi$"), o("4","$8\\pi$")],
    answer: 3,
    explanation: "카디오이드 $r=a(1+\\cos\\theta)$의 넓이 $=\\dfrac{3\\pi}{2}a^2$. $a=2$: $S=\\dfrac{3\\pi}{2}\\cdot 4=6\\pi$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 한성대):`, data.map((d) => d.id).join(", "));
