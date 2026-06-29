// Upload 2020년도 한성대 편입수학 기출 15문항 (4지 선다형)
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
const YEAR = "2020";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-hansung-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "삼각함수", concept: "역삼각함수 합성", difficulty: "easy",
    question: "$\\cos\\!\\left(\\sin^{-1}\\!\\left(-\\dfrac{x}{2}\\right)\\right)$의 값은?",
    options: [o("1","$\\dfrac{\\sqrt{1-x^2}}{2}$"), o("2","$\\dfrac{\\sqrt{1+x^2}}{2}$"), o("3","$\\dfrac{\\sqrt{4-x^2}}{2}$"), o("4","$\\dfrac{\\sqrt{4+x^2}}{2}$")],
    answer: 3,
    explanation: "$\\sin^{-1}(-x/2)=\\alpha$, $\\sin\\alpha=-x/2$, $-\\pi/2\\le\\alpha\\le\\pi/2$.\n$\\cos\\alpha=\\sqrt{1-x^2/4}=\\dfrac{\\sqrt{4-x^2}}{2}$ ($\\cos\\alpha\\ge 0$)."
  }),
  build({
    num: 2, subject: "미분학", unit: "최댓값/최솟값", concept: "원기둥 표면적 최소화", difficulty: "medium",
    question: "부피가 $1$인 원기둥의 표면적이 최소가 되기 위한 반지름과 높이의 비는?",
    options: [o("1","$1:0.5$"), o("2","$1:1$"), o("3","$1:\\sqrt 2$"), o("4","$1:2$")],
    answer: 4,
    explanation: "$V=\\pi r^2 h=1$ ⇒ $h=\\dfrac{1}{\\pi r^2}$. $S=2\\pi rh+2\\pi r^2=\\dfrac{2}{r}+2\\pi r^2$.\n$S'=-\\dfrac{2}{r^2}+4\\pi r=0$ ⇒ $r^3=\\dfrac{1}{2\\pi}$ ⇒ $r=\\!\\left(\\dfrac{1}{2\\pi}\\right)^{1/3}$.\n$h=\\dfrac{1}{\\pi r^2}=\\!\\left(\\dfrac{4}{\\pi}\\right)^{1/3}=2r$.\n$\\therefore r:h=1:2$."
  }),
  build({
    num: 3, subject: "선형대수", unit: "행렬", concept: "역행렬의 고유값 합", difficulty: "medium",
    question: "행렬 $B$를 행렬 $A=\\!\\begin{pmatrix}-2&1\\\\-3&2\\end{pmatrix}$의 역행렬이라고 할 때 행렬 $B$의 고유값 $\\lambda_1,\\lambda_2$의 합 $\\lambda_1+\\lambda_2$는?",
    options: [o("1","$-1$"), o("2","$0$"), o("3","$1$"), o("4","$2$")],
    answer: 2,
    explanation: "$A$의 특성방정식: $\\lambda^2-0\\cdot\\lambda+(-4+3)=\\lambda^2-1=0$ ⇒ $\\lambda=\\pm 1$.\n$B=A^{-1}$의 고유값 $=1/\\lambda=\\pm 1$. 합 $=0$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분", concept: "두 곡선 사이의 넓이", difficulty: "easy",
    question: "$y=x$와 $y=2x^2$로 둘러싸인 영역의 넓이는?",
    options: [o("1","$\\dfrac{1}{24}$"), o("2","$\\dfrac{1}{12}$"), o("3","$\\dfrac{1}{6}$"), o("4","$\\dfrac{1}{3}$")],
    answer: 1,
    explanation: "교점: $2x^2=x$ ⇒ $x=0,\\dfrac{1}{2}$.\n$S=\\!\\int_0^{1/2}(x-2x^2)dx=\\!\\left[\\dfrac{x^2}{2}-\\dfrac{2x^3}{3}\\right]_0^{1/2}=\\dfrac{1}{8}-\\dfrac{1}{12}=\\dfrac{1}{24}$."
  }),
  build({
    num: 5, subject: "선형대수", unit: "벡터", concept: "회전변환($30°$)", difficulty: "medium",
    question: "좌표평면 상의 점 $A(4,2)$를 원점을 중심으로 반시계방향으로 $30°$ 회전하였을 때 대응하는 점 $B$의 좌표는?",
    options: [o("1","$(2\\sqrt 3+1,\\sqrt 3-2)$"), o("2","$(\\sqrt 3+2,-2\\sqrt 3+1)$"), o("3","$(2\\sqrt 3-1,\\sqrt 3+2)$"), o("4","$(-\\sqrt 3+2,2\\sqrt 3+1)$")],
    answer: 3,
    explanation: "$R_{30°}=\\!\\begin{pmatrix}\\cos\\!\\tfrac{\\pi}{6}&-\\sin\\!\\tfrac{\\pi}{6}\\\\\\sin\\!\\tfrac{\\pi}{6}&\\cos\\!\\tfrac{\\pi}{6}\\end{pmatrix}=\\!\\begin{pmatrix}\\tfrac{\\sqrt 3}{2}&-\\tfrac{1}{2}\\\\\\tfrac{1}{2}&\\tfrac{\\sqrt 3}{2}\\end{pmatrix}$.\n$B=\\!\\begin{pmatrix}\\tfrac{\\sqrt 3}{2}\\cdot 4-\\tfrac{1}{2}\\cdot 2\\\\\\tfrac{1}{2}\\cdot 4+\\tfrac{\\sqrt 3}{2}\\cdot 2\\end{pmatrix}=\\!\\begin{pmatrix}2\\sqrt 3-1\\\\\\sqrt 3+2\\end{pmatrix}$."
  }),
  build({
    num: 6, subject: "선형대수", unit: "벡터", concept: "평행육면체 부피(스칼라 삼중곱)", difficulty: "easy",
    question: "네 점 $A=(1,2,1),B=(4,3,1),C=(2,6,3),D=(1,2,3)$을 꼭짓점으로 가지는 평행육면체의 부피는?",
    options: [o("1","$22$"), o("2","$24$"), o("3","$26$"), o("4","$28$")],
    answer: 1,
    explanation: "$\\vec{AB}=(3,1,0),\\vec{AC}=(1,4,2),\\vec{AD}=(0,0,2)$.\n$V=|\\vec{AB}\\cdot(\\vec{AC}\\times\\vec{AD})|=\\!\\left|\\det\\!\\begin{pmatrix}3&1&0\\\\1&4&2\\\\0&0&2\\end{pmatrix}\\right|=|2(12-1)|=22$."
  }),
  build({
    num: 7, subject: "미분학", unit: "최댓값/최솟값", concept: "삼각함수 최대·최소", difficulty: "medium",
    question: "함수 $f(x)=\\cos x(1-\\sin x)$ $(0\\le x\\le 2\\pi)$에서 최댓값과 최솟값은?",
    options: [o("1","$0,\\;-\\dfrac{3\\sqrt 3}{4}$"), o("2","$1,\\;0$"), o("3","$\\dfrac{3\\sqrt 3}{4},\\;0$"), o("4","$\\dfrac{3\\sqrt 3}{4},\\;-\\dfrac{3\\sqrt 3}{4}$")],
    answer: 4,
    explanation: "$f'(x)=-\\sin x(1-\\sin x)+\\cos x(-\\cos x)=2\\sin^2 x-\\sin x-1=(2\\sin x+1)(\\sin x-1)$.\n임계: $\\sin x=-\\dfrac{1}{2}$ ⇒ $x=\\dfrac{7\\pi}{6},\\dfrac{11\\pi}{6}$, $\\sin x=1$ ⇒ $x=\\dfrac{\\pi}{2}$.\n$f(\\tfrac{7\\pi}{6})=-\\dfrac{\\sqrt 3}{2}\\cdot\\dfrac{3}{2}=-\\dfrac{3\\sqrt 3}{4}$.\n$f(\\tfrac{11\\pi}{6})=\\dfrac{\\sqrt 3}{2}\\cdot\\dfrac{3}{2}=\\dfrac{3\\sqrt 3}{4}$. $f(\\tfrac{\\pi}{2})=0$, $f(0)=f(2\\pi)=1$.\n최댓값 $\\dfrac{3\\sqrt 3}{4}$ (>1?). 확인: $\\dfrac{3\\sqrt 3}{4}\\approx 1.299>1$ ⇒ 최댓값 $\\dfrac{3\\sqrt 3}{4}$, 최솟값 $-\\dfrac{3\\sqrt 3}{4}$."
  }),
  build({
    num: 8, subject: "미분학", unit: "도함수", concept: "음함수 미분(접선 기울기)", difficulty: "easy",
    question: "곡선 $y^2+xy-3x^3=3$ 위의 점 $(1,2)$에서 접선의 기울기는?",
    options: [o("1","$\\dfrac{3}{5}$"), o("2","$1$"), o("3","$\\dfrac{7}{5}$"), o("4","$\\dfrac{9}{5}$")],
    answer: 3,
    explanation: "$F(x,y)=y^2+xy-3x^3-3$. $F_x=y-9x^2,\\;F_y=2y+x$.\n$\\dfrac{dy}{dx}=-\\dfrac{F_x}{F_y}=-\\dfrac{y-9x^2}{2y+x}\\Big|_{(1,2)}=-\\dfrac{2-9}{5}=\\dfrac{7}{5}$."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "공간도형", concept: "평면-직선 평행·거리", difficulty: "medium",
    question: "평면 $-2x+2y+z=a$와 직선 $\\dfrac{x+1}{2}=y+2=\\dfrac{z-5}{b}$ 사이의 거리가 $2$일 때 두 양의 상수 $a,b$의 합 $a+b$는?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$9$"), o("4","$11$")],
    answer: 4,
    explanation: "평면 법선 $(-2,2,1)$ ⊥ 직선 방향벡터 $(2,1,b)$: $-4+2+b=0$ ⇒ $b=2$.\n직선 위의 점 $(-1,-2,5)$와 평면 거리 $=\\dfrac{|2-4+5-a|}{\\sqrt{4+4+1}}=\\dfrac{|3-a|}{3}=2$ ⇒ $|a-3|=6$ ⇒ $a=9$ (양수).\n$a+b=11$."
  }),
  build({
    num: 10, subject: "적분학", unit: "정적분", concept: "치환적분", difficulty: "easy",
    question: "정적분 $\\!\\displaystyle\\int_{-2}^{1}\\dfrac{2x}{\\sqrt{x+3}}\\,dx$의 값은?",
    options: [o("1","$-\\dfrac{16}{3}$"), o("2","$-\\dfrac{8}{3}$"), o("3","$\\dfrac{8}{3}$"), o("4","$\\dfrac{16}{3}$")],
    answer: 2,
    explanation: "$\\sqrt{x+3}=t$ 치환: $x=t^2-3$, $dx=2t\\,dt$. $x:-2\\to 1$ ⇒ $t:1\\to 2$.\n$\\!\\int_1^2\\dfrac{2(t^2-3)}{t}\\cdot 2t\\,dt=4\\!\\int_1^2(t^2-3)dt=4\\!\\left[\\dfrac{t^3}{3}-3t\\right]_1^2=4\\!\\left(\\dfrac{7}{3}-3\\right)=-\\dfrac{8}{3}$."
  }),
  build({
    num: 11, subject: "미분학", unit: "도함수", concept: "음함수 미분·초기값", difficulty: "medium",
    question: "$g(x)=e^{x+2f(x)}$이고 $g'(0)=1,\\;f'(0)=\\dfrac{1}{2}$이다. $f(0)$의 값은?",
    options: [o("1","$\\ln 2$"), o("2","$\\dfrac{1}{2}\\ln 2$"), o("3","$-\\dfrac{1}{2}\\ln 2$"), o("4","$-\\ln 2$")],
    answer: 3,
    explanation: "$g'(x)=e^{x+2f(x)}(1+2f'(x))$. $x=0$ 대입: $1=e^{2f(0)}\\cdot 2$ ⇒ $e^{2f(0)}=\\dfrac{1}{2}$.\n$2f(0)=-\\ln 2$ ⇒ $f(0)=-\\dfrac{1}{2}\\ln 2$."
  }),
  build({
    num: 12, subject: "공학수학", unit: "벡터적분", concept: "벡터장 선적분", difficulty: "medium",
    question: "$\\vec F(\\vec r)=x\\vec i+xy\\vec j+x\\vec k$이고 경로 $C$는 $\\vec r(t)=\\cos t\\,\\vec i+\\sin t\\,\\vec j+t\\,\\vec k$ $(0\\le t\\le\\pi)$로 주어진다. 주어진 경로에서의 선적분 $\\!\\displaystyle\\int_C\\vec F(\\vec r)\\cdot d\\vec r$의 값은?",
    options: [o("1","$\\dfrac{1}{3}$"), o("2","$\\dfrac{2}{3}$"), o("3","$1$"), o("4","$\\dfrac{4}{3}$")],
    answer: 2,
    explanation: "$\\vec r'(t)=(-\\sin t,\\cos t,1)$. $\\vec F(\\vec r(t))=(\\cos t,\\cos t\\sin t,\\cos t)$.\n$\\vec F\\cdot d\\vec r=-\\cos t\\sin t+\\sin t\\cos^2 t+\\cos t$.\n$\\!\\int_0^\\pi(-\\cos t\\sin t)dt=0$, $\\!\\int_0^\\pi\\cos t\\,dt=0$, $\\!\\int_0^\\pi\\sin t\\cos^2 t\\,dt=\\!\\left[-\\dfrac{\\cos^3 t}{3}\\right]_0^\\pi=\\dfrac{2}{3}$."
  }),
  build({
    num: 13, subject: "공학수학", unit: "미분방정식", concept: "오일러 코시·중근", difficulty: "mediumHard",
    question: "미분방정식 $x^2 y''+7xy'+9y=0$의 경계조건이 $y(x)|_{x=1}=1,\\;y(x)|_{x=e}=0$일 때 $y(x)|_{x=2e}$의 값은?",
    options: [o("1","$-\\dfrac{\\ln 2}{8}e^{-3}$"), o("2","$-\\dfrac{\\ln 2}{8}e^{3}$"), o("3","$\\dfrac{\\ln 2}{8}e^{-3}$"), o("4","$\\dfrac{\\ln 2}{8}e^{3}$")],
    answer: 1,
    explanation: "오일러: $t(t-1)+7t+9=0$ ⇒ $(t+3)^2=0$, $t=-3$ (중근).\n일반해 $y=c_1 x^{-3}+c_2 x^{-3}\\ln x$. $y(1)=1$ ⇒ $c_1=1$. $y(e)=e^{-3}+c_2 e^{-3}=0$ ⇒ $c_2=-1$.\n$y(2e)=(2e)^{-3}-(2e)^{-3}\\ln(2e)=(2e)^{-3}(1-\\ln(2e))=(2e)^{-3}(-\\ln 2)=-\\dfrac{\\ln 2}{8}e^{-3}$."
  }),
  build({
    num: 14, subject: "적분학", unit: "정적분", concept: "성망형(아스트로이드) 길이", difficulty: "medium",
    question: "곡선 $\\vec r(t)=\\cos^3 t\\,\\vec i+\\sin^3 t\\,\\vec j$의 경로 $(0\\le t\\le\\dfrac{\\pi}{2})$상의 전체길이는?",
    options: [o("1","$1$"), o("2","$\\dfrac{3}{2}$"), o("3","$2$"), o("4","$\\dfrac{5}{2}$")],
    answer: 2,
    explanation: "성망형 $x^{2/3}+y^{2/3}=1$의 전체길이 $=6$ ($a=1$). 1사분면은 $1/4$ ⇒ $\\dfrac{6}{4}=\\dfrac{3}{2}$."
  }),
  build({
    num: 15, subject: "공학수학", unit: "라플라스변환", concept: "역라플라스·미분 공식", difficulty: "easy",
    question: "$F(s)=\\dfrac{1}{(s+3)^2}$일 때 라플라스 역변환 관계식 $f(t)=\\mathcal{L}^{-1}\\{F(s)\\}$을 이용하여 구한 $f(t)$는?",
    options: [o("1","$te^{-3t}$"), o("2","$te^{3t}$"), o("3","$\\dfrac{t}{3}e^{-3t}$"), o("4","$\\dfrac{t}{3}e^{3t}$")],
    answer: 1,
    explanation: "$\\mathcal{L}^{-1}\\!\\left\\{\\dfrac{1}{s^2}\\right\\}=t$. 1차 이동: $\\mathcal{L}^{-1}\\!\\left\\{\\dfrac{1}{(s+3)^2}\\right\\}=e^{-3t}\\cdot t=te^{-3t}$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 한성대):`, data.map((d) => d.id).join(", "));
