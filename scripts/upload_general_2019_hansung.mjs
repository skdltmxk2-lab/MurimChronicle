// Upload 2019년도 한성대 편입수학 기출 15문항 (4지 선다형)
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
const YEAR = "2019";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-hansung-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "선형대수", unit: "벡터", concept: "일차결합 계수 합", difficulty: "easy",
    question: "벡터 $\\vec p=(3,3,3)$이 벡터 $\\vec a=(1,2,0),\\;\\vec b=(0,1,2),\\;\\vec c=(2,0,1)$의 일차결합 $\\vec p=\\alpha\\vec a+\\beta\\vec b+\\gamma\\vec c$로 표현될 때 $\\alpha+\\beta+\\gamma$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 3,
    explanation: "$\\alpha(1,2,0)+\\beta(0,1,2)+\\gamma(2,0,1)=(3,3,3)$.\n$\\alpha+2\\gamma=3,\\;2\\alpha+\\beta=3,\\;2\\beta+\\gamma=3$ ⇒ $\\alpha=\\beta=\\gamma=1$.\n$\\alpha+\\beta+\\gamma=3$."
  }),
  build({
    num: 2, subject: "미분학", unit: "삼각함수", concept: "역삼각함수·직각삼각형", difficulty: "easy",
    question: "$\\sin\\!\\left(\\tan^{-1}\\!\\dfrac{x}{2}\\right)$의 값은?",
    options: [o("1","$\\dfrac{x}{\\sqrt{x^2+4}}$"), o("2","$\\dfrac{2}{\\sqrt{x^2+4}}$"), o("3","$\\dfrac{\\sqrt{x^2+4}}{x}$"), o("4","$\\dfrac{\\sqrt{x^2+4}}{2}$")],
    answer: 1,
    explanation: "$\\tan^{-1}\\!\\dfrac{x}{2}=\\alpha$, $\\tan\\alpha=\\dfrac{x}{2}$.\n빗변 $=\\sqrt{x^2+4}$, 대변 $=x$ ⇒ $\\sin\\alpha=\\dfrac{x}{\\sqrt{x^2+4}}$."
  }),
  build({
    num: 3, subject: "선형대수", unit: "벡터", concept: "두 직선이 이루는 각", difficulty: "easy",
    question: "두 직선 $l_1:2x+y=3,\\;l_2:x-y=1$이 이루는 예각을 $\\theta$라 할 때 $\\cos\\theta$의 값은?",
    options: [o("1","$\\dfrac{1}{\\sqrt{10}}$"), o("2","$\\dfrac{2}{\\sqrt{10}}$"), o("3","$\\dfrac{3}{\\sqrt{10}}$"), o("4","$\\dfrac{4}{\\sqrt{10}}$")],
    answer: 1,
    explanation: "$l_1$ 기울기 $=-2$, $l_2$ 기울기 $=1$.\n$\\tan\\theta=\\!\\left|\\dfrac{1-(-2)}{1+1\\cdot(-2)}\\right|=3$.\n직각삼각형: 빗변 $\\sqrt{10}$, 밑변 $1$ ⇒ $\\cos\\theta=\\dfrac{1}{\\sqrt{10}}$."
  }),
  build({
    num: 4, subject: "선형대수", unit: "행렬", concept: "케일리-해밀턴·행렬 거듭제곱", difficulty: "medium",
    question: "행렬 $A=\\!\\begin{pmatrix}2&1\\\\1&a\\end{pmatrix}$에 대하여 $A^2-5A+5I=O$를 만족한다. $A^3$의 모든 원소의 합은? (단, $I$는 단위행렬, $O$는 영행렬)",
    options: [o("1","$34$"), o("2","$54$"), o("3","$90$"), o("4","$148$")],
    answer: 3,
    explanation: "케일리-해밀턴: $A^2-(\\text{tr}A)A+(\\det A)I=O$.\n$\\text{tr}A=2+a=5$ ⇒ $a=3$. $A=\\!\\begin{pmatrix}2&1\\\\1&3\\end{pmatrix}$.\n$A^2=\\!\\begin{pmatrix}5&5\\\\5&10\\end{pmatrix}$, $A^3=A\\cdot A^2=\\!\\begin{pmatrix}15&20\\\\20&35\\end{pmatrix}$.\n원소 합 $=15+20+20+35=90$."
  }),
  build({
    num: 5, subject: "미분학", unit: "극한과 연속", concept: "로피탈·역탄젠트 극한", difficulty: "medium",
    question: "$\\!\\displaystyle\\lim_{x\\to\\infty}\\dfrac{\\tan^{-1}x-\\dfrac{\\pi}{2}}{\\dfrac{1}{x}}$의 값은?",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$0$"), o("4","$1$")],
    answer: 2,
    explanation: "$\\dfrac{0}{0}$ 꼴. 로피탈: $\\!\\lim_{x\\to\\infty}\\dfrac{1/(1+x^2)}{-1/x^2}=\\!\\lim_{x\\to\\infty}-\\dfrac{x^2}{1+x^2}=-1$."
  }),
  build({
    num: 6, subject: "적분학", unit: "정적분", concept: "부분적분 $x\\ln x$", difficulty: "medium",
    question: "$\\!\\displaystyle\\int_0^e x\\ln x\\,dx$의 값은?",
    options: [o("1","$-\\dfrac{e^2}{2}$"), o("2","$0$"), o("3","$\\dfrac{e^2}{4}$"), o("4","$\\dfrac{e^2}{2}$")],
    answer: 3,
    explanation: "$u=\\ln x,\\,v'=x$: $u'=1/x,\\,v=x^2/2$.\n$\\!\\left[\\dfrac{x^2}{2}\\ln x\\right]_0^e-\\!\\int_0^e\\dfrac{x}{2}dx=\\dfrac{e^2}{2}-\\dfrac{e^2}{4}=\\dfrac{e^2}{4}$.\n(${\\lim_{x\\to 0^+}}x^2\\ln x=0$.)"
  }),
  build({
    num: 7, subject: "미분학", unit: "도함수", concept: "여러 함수의 도함수 비교", difficulty: "medium",
    question: "다음 함수들의 미분값의 크기가 올바르게 표현된 것은?\n\n$f_1(x)=\\dfrac{x+1}{x-2}$, $f_1'(1)$\n$f_2(x)=x\\ln(3x)$, $f_2'(e)$\n$f_3(x)=e^x\\ln x$, $f_3'(1)$\n$f_4(x)=\\sin^{-1}(x)$, $f_4'(0)$",
    options: [
      o("1","$f_1'(1)<f_2'(e)<f_3'(1)<f_4'(0)$"),
      o("2","$f_1'(1)<f_3'(1)<f_2'(e)<f_4'(0)$"),
      o("3","$f_1'(1)<f_4'(0)<f_3'(1)<f_2'(e)$"),
      o("4","$f_4'(0)<f_3'(1)<f_2'(e)<f_1'(1)$")
    ],
    answer: 3,
    explanation: "$f_1'(x)=\\dfrac{-3}{(x-2)^2}$ ⇒ $f_1'(1)=-3$.\n$f_2'(x)=\\ln(3x)+1$ ⇒ $f_2'(e)=\\ln(3e)+1=\\ln 3+2\\approx 3.1$.\n$f_3'(x)=e^x\\ln x+\\dfrac{e^x}{x}$ ⇒ $f_3'(1)=0+e=e\\approx 2.72$.\n$f_4'(x)=\\dfrac{1}{\\sqrt{1-x^2}}$ ⇒ $f_4'(0)=1$.\n$-3<1<e<\\ln 3+2$ ⇒ $f_1'<f_4'<f_3'<f_2'$."
  }),
  build({
    num: 8, subject: "선형대수", unit: "행렬", concept: "고유값 합 = 대각합", difficulty: "easy",
    question: "행렬 $A=\\!\\begin{pmatrix}1&3\\\\2&2\\end{pmatrix}$의 고유값을 $\\lambda_1,\\lambda_2$라고 할 때 $\\lambda_1+\\lambda_2$는?",
    options: [o("1","$-4$"), o("2","$-3$"), o("3","$3$"), o("4","$4$")],
    answer: 3,
    explanation: "고유값의 합 $=\\text{tr}(A)=1+2=3$."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "공간도형", concept: "점과 평면 사이의 거리", difficulty: "easy",
    question: "점 $P(1,2,3)$과 평면 $2x+y+2z-3=0$ 사이의 거리는?",
    options: [o("1","$\\dfrac{3}{7}$"), o("2","$\\dfrac{\\sqrt 2}{\\sqrt 7}$"), o("3","$\\dfrac{\\sqrt 7}{\\sqrt 2}$"), o("4","$\\dfrac{7}{3}$")],
    answer: 4,
    explanation: "$d=\\dfrac{|2\\cdot 1+1\\cdot 2+2\\cdot 3-3|}{\\sqrt{2^2+1^2+2^2}}=\\dfrac{7}{3}$."
  }),
  build({
    num: 10, subject: "미분학", unit: "최댓값/최솟값", concept: "점과 곡선의 최단거리", difficulty: "medium",
    question: "점 $A(5,0)$과 포물선 $y=x^2+1$ 위의 동점 $P$ 사이의 거리를 $l$이라 할 때 $l$의 최솟값은?",
    options: [o("1","$\\sqrt 5$"), o("2","$2\\sqrt 5$"), o("3","$3\\sqrt 5$"), o("4","$4\\sqrt 5$")],
    answer: 2,
    explanation: "$l^2=(x-5)^2+(x^2+1)^2=:f(x)$.\n$f'(x)=2(x-5)+2(x^2+1)(2x)=2(2x^3+3x-5)=2(x-1)(2x^2+2x+5)$.\n임계점 $x=1$. $l(1)=\\sqrt{16+4}=\\sqrt{20}=2\\sqrt 5$."
  }),
  build({
    num: 11, subject: "미분학", unit: "도함수", concept: "합성함수 미분(매개)", difficulty: "easy",
    question: "$y=e^{2x^2+3x+1}$, $x=\\sin t$일 때 $t=0$에서 $\\dfrac{dy}{dt}$의 값은?",
    options: [o("1","$1$"), o("2","$2e$"), o("3","$3e$"), o("4","$4e$")],
    answer: 3,
    explanation: "$\\dfrac{dy}{dt}=\\dfrac{dy}{dx}\\cdot\\dfrac{dx}{dt}=e^{2x^2+3x+1}(4x+3)\\cdot\\cos t$.\n$t=0$이면 $x=0$, $\\cos 0=1$ ⇒ $e^1\\cdot 3\\cdot 1=3e$."
  }),
  build({
    num: 12, subject: "적분학", unit: "급수", concept: "멱급수 수렴구간 (p=2)", difficulty: "medium",
    question: "멱급수 $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(x+3)^{n-1}}{n^2}$의 수렴 구간은?",
    options: [o("1","$x>-4$"), o("2","$-4<x<-2$"), o("3","$-4\\le x\\le -2$"), o("4","$x\\le -2$")],
    answer: 3,
    explanation: "$|x+3|<1$ ⇒ $-4<x<-2$.\n$x=-4$: $\\sum\\dfrac{(-1)^{n-1}}{n^2}$ 수렴 ($p=2$).\n$x=-2$: $\\sum\\dfrac{1}{n^2}$ 수렴.\n$\\therefore -4\\le x\\le -2$."
  }),
  build({
    num: 13, subject: "적분학", unit: "급수", concept: "테일러 급수·특정 계수", difficulty: "medium",
    question: "함수 $f(x)=x\\sin(2x)$를 $x=0$에서 테일러 급수로 전개할 때 $x^6$의 계수는?",
    options: [o("1","$\\dfrac{1}{120}$"), o("2","$\\dfrac{4}{45}$"), o("3","$\\dfrac{4}{15}$"), o("4","$\\dfrac{2}{15}$")],
    answer: 3,
    explanation: "$\\sin(2x)=2x-\\dfrac{(2x)^3}{3!}+\\dfrac{(2x)^5}{5!}-\\cdots$.\n$f(x)=x\\sin(2x)$의 $x^6$ 계수 $=\\dfrac{(2)^5}{5!}=\\dfrac{32}{120}=\\dfrac{4}{15}$."
  }),
  build({
    num: 14, subject: "공학수학", unit: "라플라스변환", concept: "역라플라스·1차 이동", difficulty: "medium",
    question: "다음은 라플라스 변환 문제이다. $f(t)=\\mathcal{L}^{-1}\\!\\left\\{\\dfrac{s-1}{(s+2)^2+3^2}\\right\\}$일 때 $f\\!\\left(\\dfrac{\\pi}{2}\\right)$의 값은?",
    options: [o("1","$e^{-\\pi}$"), o("2","$1$"), o("3","$e^{\\pi}$"), o("4","$e^{2\\pi}$")],
    answer: 1,
    explanation: "$\\dfrac{s-1}{(s+2)^2+3^2}=\\dfrac{(s+2)-3}{(s+2)^2+3^2}$.\n$\\mathcal{L}^{-1}=e^{-2t}(\\cos 3t-\\sin 3t)$.\n$t=\\pi/2$: $e^{-\\pi}(\\cos\\!\\tfrac{3\\pi}{2}-\\sin\\!\\tfrac{3\\pi}{2})=e^{-\\pi}(0-(-1))=e^{-\\pi}$."
  }),
  build({
    num: 15, subject: "다변수함수", unit: "중적분", concept: "이중적분·순서 교환", difficulty: "medium",
    question: "곡선 $y=x^2$, 직선 $x=1$ 및 $y=0$으로 둘러싸인 영역 $R$에 대하여 $\\!\\displaystyle\\iint_R\\dfrac{\\sin x}{x}\\,dy\\,dx$는?",
    options: [o("1","$\\sin 1+\\cos 1$"), o("2","$\\sin 1-\\cos 1$"), o("3","$-\\sin 1+\\cos 1$"), o("4","$-\\sin 1-\\cos 1$")],
    answer: 2,
    explanation: "$\\!\\int_0^1\\!\\!\\int_0^{x^2}\\dfrac{\\sin x}{x}dy\\,dx=\\!\\int_0^1 x^2\\cdot\\dfrac{\\sin x}{x}dx=\\!\\int_0^1 x\\sin x\\,dx$.\n부분적분 ($u=x,v'=\\sin x$): $[-x\\cos x]_0^1+\\!\\int_0^1\\cos x\\,dx=-\\cos 1+\\sin 1=\\sin 1-\\cos 1$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 한성대):`, data.map((d) => d.id).join(", "));
