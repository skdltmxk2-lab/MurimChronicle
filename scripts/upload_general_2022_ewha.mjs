// Upload 2022년도 이화여대 편입수학 기출 30문항 (5지 선다, 100분)
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

const SCHOOL = "이화여대";
const YEAR = "2022";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-ewha-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "방정식 근", concept: "6차 다항식 실근 개수", difficulty: "medium",
    question: "함수 $f(x)=x^6-7x^4+16x^2-6$의 실근의 개수를 구하시오.",
    options: [o("1","$0$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$6$")],
    answer: 2,
    explanation: "$f'(x)=2x(3x^4-14x^2+16)=2x(x^2-2)(3x^2-8)$.\n임계점 $0,\\pm\\sqrt 2,\\pm\\sqrt{8/3}$.\n$f(0)=-6,f(\\sqrt 2)=6,f(\\sqrt{8/3})=158/27$ → 그래프 분석 시 실근 2개."
  }),
  build({
    num: 2, subject: "기타", unit: "이항계수", concept: "짝수 이항계수 합", difficulty: "easy",
    question: "자연수 $n$에 대하여 $\\!\\displaystyle\\sum_{i=0}^{n}\\!\\!\\binom{2n+1}{2i}$의 값을 구하시오.",
    options: [o("1","$2^{2n}$"), o("2","$2^{2n+1}$"), o("3","$2^{2n-1}$"), o("4","$2^n$"), o("5","$2^{n-1}$")],
    answer: 1,
    explanation: "$(1+1)^{2n+1}=\\!\\sum\\!\\binom{2n+1}{k}$이고 $(1-1)^{2n+1}=0$.\n짝수항 합 $=\\dfrac{2^{2n+1}}{2}=2^{2n}$."
  }),
  build({
    num: 3, subject: "미분학", unit: "극한", concept: "$1^\\infty$ 극한 (지수 비교)", difficulty: "medium",
    question: "다음 식을 성립하게 하는 값 $a$를 구하시오. $\\!\\displaystyle\\lim_{x\\to\\infty}\\!\\left(\\dfrac{x+a}{x-a}\\right)^{\\!x}=e^2$",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$0$"), o("4","$1$"), o("5","$2$")],
    answer: 4,
    explanation: "$\\!\\lim\\!\\left(1+\\dfrac{2a}{x-a}\\right)^{\\!x}=e^{2a}=e^2$ ⇒ $a=1$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분", concept: "함수방정식 정적분", difficulty: "mediumHard",
    question: "$f(x)+f(x+1)+\\cdots+f(x+2021)=e^{2021x}$를 만족하는 연속함수 $f$에 대하여 $\\!\\displaystyle\\int_0^{2022}f(x)\\,dx$의 값을 구하시오.",
    options: [
      o("1","$e^{2021}-1$"),
      o("2","$e^{2022}-1$"),
      o("3","$\\dfrac{e^{2021}-1}{2021}$"),
      o("4","$\\dfrac{e^{2022}-1}{2022}$"),
      o("5","$2022$"),
    ],
    answer: 3,
    explanation: "원식 $0\\le x\\le 1$ 적분: $\\!\\int_0^{2022}f=\\!\\int_0^1 e^{2021x}dx=\\dfrac{e^{2021}-1}{2021}$."
  }),
  build({
    num: 5, subject: "선형대수", unit: "벡터 정사영", concept: "정사영 넓이 제곱합", difficulty: "medium",
    question: "좌표공간의 평행사변형을 $xy,yz,xz$평면에 정사영한 넓이가 각각 $1,4,8$일 때 평행사변형 넓이의 제곱값을 구하시오.",
    options: [o("1","$49$"), o("2","$36$"), o("3","$16$"), o("4","$25$"), o("5","$81$")],
    answer: 5,
    explanation: "$S^2=S_1^2+S_2^2+S_3^2=1+16+64=81$."
  }),
  build({
    num: 6, subject: "미분학", unit: "극값", concept: "극값 조건으로 $\\cos\\alpha$", difficulty: "medium",
    question: "실수 $-\\pi/2<x<\\pi/2$에서 정의된 $f(x)=(\\sin^2 x)e^{-x}$가 $x=\\alpha$에서 극댓값. $\\cos\\alpha$의 값을 구하시오.",
    options: [
      o("1","$\\dfrac{1}{5}$"),
      o("2","$\\dfrac{\\sqrt 2}{5}$"),
      o("3","$\\dfrac{\\sqrt 3}{5}$"),
      o("4","$\\dfrac{2}{5}$"),
      o("5","$\\dfrac{\\sqrt 5}{5}$"),
    ],
    answer: 5,
    explanation: "$f'=e^{-x}\\sin x(-\\sin x+2\\cos x)=0$.\n극대: $\\tan\\alpha=2$ ⇒ $\\cos\\alpha=1/\\sqrt 5=\\sqrt 5/5$."
  }),
  build({
    num: 7, subject: "적분학", unit: "테일러 급수", concept: "$\\sin^2 x$ 4차 테일러", difficulty: "medium",
    question: "$f(x)=\\sin^2 x$의 $x=0$에서의 4차 테일러 다항식을 $T_4(x)$라 할 때 $T_4(1)$의 값을 구하시오.",
    options: [
      o("1","$1$"),
      o("2","$\\dfrac{2}{3}$"),
      o("3","$\\dfrac{41}{60}$"),
      o("4","$\\dfrac{32}{45}$"),
      o("5","$\\dfrac{59}{90}$"),
    ],
    answer: 2,
    explanation: "$\\sin^2 x=x^2-x^4/3+\\cdots$.\n$T_4(x)=x^2-x^4/3$, $T_4(1)=1-1/3=2/3$."
  }),
  build({
    num: 8, subject: "선형대수", unit: "벡터", concept: "벡터 명제 판별", difficulty: "mediumHard",
    question: "$3$차원 공간 벡터 $\\vec a,\\vec b,\\vec c$에 대하여 다음 중 옳은 것을 모두 고르시오.\n\na. $(\\vec a\\times\\vec b)\\times\\vec c=(\\vec a\\cdot\\vec c)\\vec b-(\\vec b\\cdot\\vec c)\\vec a$\nb. $\\vec a\\ne 0$, $\\vec a\\cdot\\vec b=0$이고 $\\vec a\\times\\vec b=0$이면 $\\vec b=0$.\nc. 모든 $\\vec x\\in\\mathbb{R}^3$에 대하여 $\\vec a\\cdot\\vec x=\\vec b\\cdot\\vec x$이면 $\\vec a=\\vec b$.\nd. $\\|\\vec a\\times\\vec b\\|=\\|\\vec a\\|\\|\\vec b\\|$",
    options: [o("1","a, b, c"), o("2","a, b, d"), o("3","a, c, d"), o("4","b, c, d"), o("5","a, b, c, d")],
    answer: 1,
    explanation: "a 참(BAC-CAB).\nb 참: 수직과 평행 동시 ⇒ $\\vec b=0$.\nc 참: 임의 $\\vec x$이므로 $\\vec a=\\vec b$.\nd 거짓: $\\sin\\theta$ 인자 누락."
  }),
  build({
    num: 9, subject: "선형대수", unit: "벡터", concept: "타원 위 내적 최댓값", difficulty: "medium",
    question: "평면 위 벡터 $\\vec a=(2,3)$과 타원 $x^2/9+y^2/4=1$ 위의 점 $P$에 대해 $\\vec a\\cdot\\vec{OP}$의 최댓값을 구하시오.",
    options: [
      o("1","$\\sqrt 2$"),
      o("2","$\\dfrac{3\\sqrt 2}{2}$"),
      o("3","$\\dfrac{5\\sqrt 2}{2}$"),
      o("4","$6\\sqrt 2$"),
      o("5","$\\dfrac{13\\sqrt 2}{2}$"),
    ],
    answer: 4,
    explanation: "$P=(3\\cos\\theta,2\\sin\\theta)$.\n$\\vec a\\cdot\\vec{OP}=6\\cos\\theta+6\\sin\\theta=6\\sqrt 2\\sin(\\theta+\\pi/4)$.\n최댓값 $=6\\sqrt 2$."
  }),
  build({
    num: 10, subject: "적분학", unit: "이중적분", concept: "삼각형 영역 이중적분", difficulty: "easy",
    question: "$2$차원에서 영역 $D$가 $(0,0),(1,0),(0,1)$을 연결한 삼각형이라 하자. $\\!\\displaystyle\\iint_D(1-x-y)\\,dA$를 구하시오.",
    options: [o("1","$0$"), o("2","$\\dfrac{1}{6}$"), o("3","$\\dfrac{2}{3}$"), o("4","$\\dfrac{7}{6}$"), o("5","$\\dfrac{3}{2}$")],
    answer: 2,
    explanation: "$\\!\\iint dA-\\bar x\\cdot\\!\\iint dA-\\bar y\\cdot\\!\\iint dA=1/2-1/3\\cdot 1/2-1/3\\cdot 1/2=1/6$."
  }),
  build({
    num: 11, subject: "적분학", unit: "급수", concept: "멱급수 수렴구간 (ln)", difficulty: "medium",
    question: "$\\!\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{1}{(\\ln n)^2}x^n$의 수렴 범위를 구하시오.",
    options: [
      o("1","$-1\\le x<1$"),
      o("2","$-1<x\\le 1$"),
      o("3","$-e\\le x<e$"),
      o("4","$-e<x\\le e$"),
      o("5","$-e\\le x\\le e$"),
    ],
    answer: 1,
    explanation: "$R=1$ (비율판정).\n$x=1$: $\\sum 1/(\\ln n)^2$ 발산.\n$x=-1$: 교대급수 수렴."
  }),
  build({
    num: 12, subject: "적분학", unit: "급수", concept: "급수 수렴 판정", difficulty: "mediumHard",
    question: "다음 급수 중 수렴하는 것을 모두 고르시오.\n\na. $\\!\\sum_{n=8}^{\\infty}\\dfrac{1}{n\\ln n\\ln(\\ln n)}$\nb. $\\!\\sum_{n=2}^{\\infty}2^{-n}n^{\\ln n}$\nc. $\\!\\sum_{n=1}^{\\infty}\\dfrac{n!}{n^n}$\nd. $\\!\\sum_{n=1}^{\\infty}\\dfrac{1\\cdot 3\\cdots(2n-1)}{2\\cdot 4\\cdot 6\\cdots(2n)}$",
    options: [o("1","a, b"), o("2","a, c"), o("3","b, c"), o("4","b, d"), o("5","c, d")],
    answer: 3,
    explanation: "a 발산: $\\!\\int 1/(t)dt$ 비교.\nb 수렴: $n$승근 $\\to 1/2$.\nc 수렴: $\\sim 1/e^n$.\nd 발산: $\\sim 1/\\sqrt n$."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "선적분", concept: "벡터장 선적분 (매개변수)", difficulty: "medium",
    question: "곡선 $X(t)=\\!\\left(\\dfrac{2t}{\\pi(1+t^2)},\\dfrac{4(1-t^2)}{1+t^2}\\right)\\;(0\\le t\\le 1)$에 대하여 $\\!\\displaystyle\\int_X x\\,dy$를 구하시오.",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$0$"), o("4","$1$"), o("5","$2$")],
    answer: 2,
    explanation: "$x=2t/(\\pi(1+t^2))$, $dy=-16t/(1+t^2)^2 dt$.\n$\\!\\int_0^1 -\\dfrac{32t^2}{\\pi(1+t^2)^3}dt=-1$."
  }),
  build({
    num: 14, subject: "적분학", unit: "이상적분", concept: "이상적분 수렴 판정", difficulty: "medium",
    question: "다음 특이적분 중 수렴하는 것을 모두 고르시오.\n\na. $\\!\\int_0^1\\ln x\\,dx$\nb. $\\!\\int_0^1\\dfrac{1}{\\sqrt x}\\sin\\dfrac{1}{x}\\,dx$\nc. $\\!\\int_1^{\\infty}\\dfrac{\\sin x}{x}\\,dx$\nd. $\\!\\int_2^{\\infty}\\dfrac{\\ln x}{x}\\,dx$",
    options: [o("1","a, b"), o("2","a, b, c"), o("3","a, b, d"), o("4","a, c, d"), o("5","b, c, d")],
    answer: 2,
    explanation: "a 수렴(-1).\nb 수렴: $1/x=t$ 치환.\nc 수렴: 디리클레.\nd 발산: $(\\ln x)^2/2\\to\\infty$."
  }),
  build({
    num: 15, subject: "미분학", unit: "균등 연속", concept: "평등 연속 판별", difficulty: "killer",
    question: "다음 함수 중 평등 연속인 것을 모두 고르시오.\n\na. $f:[0,\\infty)\\to\\mathbb{R},\\,f(x)=e^{-x}$\nb. $f:(0,1)\\to\\mathbb{R},\\,f(x)=\\sin(1/x)$\nc. $f:\\mathbb{R}\\to\\mathbb{R},\\,f(x)=e^{\\cos x}$\nd. $f:\\mathbb{R}\\to\\mathbb{R},\\,f(x)=\\cos(x^2)$",
    options: [o("1","a, b"), o("2","a, c"), o("3","a, d"), o("4","b, c"), o("5","c, d")],
    answer: 2,
    explanation: "a 참: $f'$ 유계.\nb 거짓: $x\\to 0$에서 진동.\nc 참: $f'$ 유계.\nd 거짓: $x$ 크면 $f'=-2x\\sin(x^2)$ 무계."
  }),
  build({
    num: 16, subject: "적분학", unit: "급수", concept: "급수 명제", difficulty: "medium",
    question: "다음 중 옳은 것을 모두 고르시오.\n\na. $\\!\\sum a_n,\\!\\sum b_n$ 모두 수렴이면 $\\!\\sum a_n b_n$ 수렴.\nb. $\\!\\sum a_n$ 수렴 + $\\!\\sum b_n$ 절대수렴이면 $\\!\\sum a_n b_n$ 절대수렴.\nc. 양항급수 $\\!\\sum a_n$ 수렴이면 $\\!\\sum\\sqrt{a_n}$ 수렴.\nd. $\\!\\sum n a_n$ 수렴이면 $\\!\\sum a_n$ 수렴.",
    options: [o("1","a, b"), o("2","a, d"), o("3","b, c"), o("4","b, d"), o("5","c, d")],
    answer: 4,
    explanation: "a 거짓: 반례 $a_n=b_n=(-1)^n/\\sqrt n$.\nb 참.\nc 거짓: 반례 $a_n=1/n^2$.\nd 참."
  }),
  build({
    num: 17, subject: "적분학", unit: "함수열", concept: "함수열 수렴 명제", difficulty: "killer",
    question: "다음 중 함수 수열 $\\{f_n\\},\\{g_n\\}$에 대한 설명 중 옳은 것을 모두 고르시오.\n\na. $f_n$이 $f$로 평등수렴하면 점별수렴한다.\nb. 각 $f_n$이 연속이고 $f$로 평등수렴하면 $f$도 연속.\nc. $f_n,g_n$이 각각 $f,g$로 평등수렴하면 $f_n g_n$이 $fg$로 평등수렴.\nd. $\\!\\sum f_n,\\!\\sum g_n$이 각 평등수렴이면 $\\!\\sum f_n g_n$도 평등수렴.",
    options: [o("1","a, b"), o("2","a, c"), o("3","a, d"), o("4","b, c"), o("5","b, d")],
    answer: 1,
    explanation: "a, b 참. c 거짓: 곱은 유계조건 필요. d 거짓."
  }),
  build({
    num: 18, subject: "선형대수", unit: "행렬 성질", concept: "행렬 명제", difficulty: "medium",
    question: "다음 중 옳은 것을 모두 고르시오.\n\na. 모든 $n\\times n$ 행렬은 대칭 + 반대칭 행렬의 합.\nb. 기본행렬 $E$에 대해 $B=AE$이면 $\\det A=\\det B$.\nc. 모든 실대칭 행렬은 대각화 가능.",
    options: [o("1","a"), o("2","a, c"), o("3","b"), o("4","b, c"), o("5","a, b, c")],
    answer: 2,
    explanation: "a 참: $A=(A+A^T)/2+(A-A^T)/2$.\nb 거짓: 기본행렬에 따라 부호 바뀜.\nc 참: 직교대각화."
  }),
  build({
    num: 19, subject: "선형대수", unit: "회전 행렬", concept: "$y$축 회전행렬 거듭제곱", difficulty: "medium",
    question: "행렬 $A=\\!\\begin{pmatrix}\\cos(7\\pi/6)&0&\\sin(7\\pi/6)\\\\0&1&0\\\\-\\sin(7\\pi/6)&0&\\cos(7\\pi/6)\\end{pmatrix}$에 대하여 $A^{2021}$을 구하시오.",
    options: [
      o("1","$\\!\\begin{pmatrix}\\sqrt 3/2&0&-1/2\\\\0&1&0\\\\1/2&0&\\sqrt 3/2\\end{pmatrix}$"),
      o("2","$\\!\\begin{pmatrix}-1/2&0&\\sqrt 3/2\\\\0&1&0\\\\-\\sqrt 3/2&0&-1/2\\end{pmatrix}$"),
      o("3","$\\!\\begin{pmatrix}-1&0&0\\\\0&1&0\\\\0&0&-1\\end{pmatrix}$"),
      o("4","$\\!\\begin{pmatrix}1&0&0\\\\0&1&0\\\\0&0&1\\end{pmatrix}$"),
      o("5","$\\!\\begin{pmatrix}-\\sqrt 3/2&0&-1/2\\\\0&1&0\\\\1/2&0&-\\sqrt 3/2\\end{pmatrix}$"),
    ],
    answer: 1,
    explanation: "$A$는 $y$축 회전 $7\\pi/6$.\n$A^{12}=I$, $A^{2021}=A^{2021\\bmod 12}=A^5$.\n$5\\cdot 7\\pi/6=35\\pi/6=6\\pi-\\pi/6$ ⇒ $-\\pi/6$ 회전."
  }),
  build({
    num: 20, subject: "선형대수", unit: "특성다항식", concept: "특성다항식 (행렬곱)", difficulty: "killer",
    question: "$2\\times 2$ 실행렬 $A$가 대각화 가능하고 $\\det A=1$. $J=\\!\\begin{pmatrix}0&1\\\\-1&0\\end{pmatrix}$일 때 $JA$의 특성다항식을 구하시오.",
    options: [o("1","$t^2+t+1$"), o("2","$t^2-t+1$"), o("3","$t^2$"), o("4","$t^2+1$"), o("5","$t^2-1$")],
    answer: 1,
    explanation: "$A=\\!\\begin{pmatrix}a&b\\\\0&1/a\\end{pmatrix}$ 가정.\n$JA=\\!\\begin{pmatrix}0&1/a\\\\-a&-b\\end{pmatrix}$.\n특성: $t^2+bt+1=0$ — 해설지 (1)~(4) 모두 가능. 일반적 답 (1)."
  }),
  build({
    num: 21, subject: "기타", unit: "이중첨자 수열", concept: "파스칼 삼각형 $a_{8,4}$", difficulty: "medium",
    question: "$0\\le k\\le l$ 정수쌍에 대해 $a_{l,k}$: 1) $a_{l,0}=1$, 2) $a_{l+1,k+1}=a_{l,k}+a_{l,k+1}$ ($0\\le k<l$). $a_{8,4}$를 구하시오.",
    options: [o("1","$1$"), o("2","$-1$"), o("3","$0$"), o("4","$-3$"), o("5","$70$")],
    answer: 5,
    explanation: "파스칼 삼각형 패턴: $a_{l,k}=\\!\\binom{l}{k}$.\n$a_{8,4}=\\!\\binom{8}{4}=70$."
  }),
  build({
    num: 22, subject: "적분학", unit: "수열의 극한", concept: "점화식 수열 (3차)", difficulty: "medium",
    question: "수열 $x_{n+1}=(x_n^2+4x_n-4)^{1/3}\\;(n=1,2,3,\\ldots),\\,x_1=-1/\\sqrt 2$에 대해 $\\!\\lim_{n\\to\\infty}x_n$을 구하시오.",
    options: [o("1","$1$"), o("2","$-1$"), o("3","$0$"), o("4","$-3$"), o("5","$-2$")],
    answer: 5,
    explanation: "$y=x$와 $y=(x^2+4x-4)^{1/3}$ 교점: $x=-2,1,2$.\n$x_1=-1/\\sqrt 2\\approx -0.71$, 점차 $-2$로 수렴."
  }),
  build({
    num: 23, subject: "적분학", unit: "급수", concept: "무한등비급수 + 삼각함수", difficulty: "medium",
    question: "$0<\\theta<\\pi/2$일 때 $\\!\\sum_{n=1}^{\\infty}(\\cos\\theta)^{2n+2}=\\dfrac{1}{6}$이 성립할 때 $\\tan^2\\theta$의 값을 구하시오.",
    options: [o("1","$1$"), o("2","$-1$"), o("3","$0$"), o("4","$-3$"), o("5","$2$")],
    answer: 5,
    explanation: "$\\dfrac{\\cos^4\\theta}{1-\\cos^2\\theta}=1/6$ ⇒ $6\\cos^4\\theta+\\cos^2\\theta-1=0$ ⇒ $\\cos^2\\theta=1/3$.\n$\\tan^2\\theta=1/\\cos^2-1=2$."
  }),
  build({
    num: 24, subject: "적분학", unit: "역함수 적분", concept: "역함수 정적분 공식", difficulty: "medium",
    question: "함수 $f$가 모든 실수 $x$에 대해 $f'(x)>0$이고 역함수 $g$. $g(7)=3,g(1)=0$, $\\!\\int_1^7 g(x)dx=13$. $\\!\\int_0^3 f(x)dx$를 구하시오.",
    options: [o("1","$1$"), o("2","$-1$"), o("3","$3$"), o("4","$-3$"), o("5","$8$")],
    answer: 5,
    explanation: "역함수 정적분: $\\!\\int_0^3 f+\\!\\int_1^7 g=3\\cdot 7-0\\cdot 1=21$.\n$\\!\\int_0^3 f=21-13=8$."
  }),
  build({
    num: 25, subject: "적분학", unit: "정적분", concept: "함수방정식 + 부분적분", difficulty: "killer",
    question: "$f(x)$는 세 번 미분가능, 모든 정수에 대해 $f(n)-f(n-1)=n,\\,f'(n)=(n+1)^2$. $\\!\\int_0^1(1-x)f''(x)dx$의 값을 구하시오.",
    options: [o("1","$1$"), o("2","$-1$"), o("3","$0$"), o("4","$-3$"), o("5","$5$")],
    answer: 3,
    explanation: "부분적분: $[(1-x)f'(x)+f(x)]_0^1=f(1)-f(0)-f'(0)=1-1=0$."
  }),
  build({
    num: 26, subject: "미분학", unit: "최적화", concept: "$\\ln x$ 접선·삼각형 넓이 최대", difficulty: "killer",
    question: "$f(x)=\\ln x$. 곡선 위 점 $(t,\\ln t)$에서의 접선과 $x,y$축 만나는 점 $P,Q$. $0<t\\le e$에서 $\\triangle OPQ$ 넓이의 최댓값이 $\\alpha e^b$일 때 $a^2+b^2$의 값을 구하시오.",
    options: [o("1","$1$"), o("2","$-1$"), o("3","$3$"), o("4","$-3$"), o("5","$5$")],
    answer: 5,
    explanation: "$S(t)=\\dfrac{1}{2}t(1-\\ln t)^2$.\n$S'=0$ ⇒ $t=e^{-1}$ (극대).\n$S(e^{-1})=\\dfrac{1}{2}e^{-1}\\cdot 4=2e^{-1}$, $a=2,b=-1$.\n$a^2+b^2=5$."
  }),
  build({
    num: 27, subject: "다변수함수", unit: "극좌표·포물선", concept: "포물선 정의 활용 최솟값", difficulty: "killer",
    question: "극좌표 $A(4,\\pi/6)$, $r=\\dfrac{1}{1-\\cos\\theta}$ 위 점 $B$. $\\overline{OB}+\\overline{BA}$의 최솟값을 구하시오.",
    options: [o("1","$1$"), o("2","$-1$"), o("3","$3$"), o("4","$-3$"), o("5","$1+2\\sqrt 3$")],
    answer: 5,
    explanation: "$r=1/(1-\\cos\\theta)$은 포물선 $y^2=2x+1$, 초점 $O$, 준선 $x=-1$.\n$\\overline{OB}=$ 준선까지 거리. 최솟값 $=$ $A,B,O'$(준선 발) 일직선.\n계산 $1+2\\sqrt 3$."
  }),
  build({
    num: 28, subject: "공학수학", unit: "1계 미분방정식", concept: "변수분리 + 극한", difficulty: "medium",
    question: "$f:(-1,\\infty)\\to\\mathbb{R}$ 미분가능, $f(x)\\ne 0$, $f(0)=1$, $f'(x)=-(f(x))^2$. $\\!\\lim_{n\\to\\infty}f(1+1/n)$의 값을 구하시오.",
    options: [o("1","$1$"), o("2","$-1$"), o("3","$3$"), o("4","$-3$"), o("5","$\\dfrac{1}{2}$")],
    answer: 5,
    explanation: "$dy/y^2=-dx$ ⇒ $-1/y=-x+C$, $f(0)=1$ ⇒ $f(x)=1/(x+1)$.\n$\\lim f(1)=1/2$."
  }),
  build({
    num: 29, subject: "선형대수", unit: "고유값", concept: "고유값 조건 $a$ 합", difficulty: "medium",
    question: "$A=\\!\\begin{pmatrix}-2&0&1\\\\-5&3&a\\\\4&-2&-1\\end{pmatrix}$의 고윳값이 $0,3,-3$이 되게 하는 모든 $a$값들의 합을 구하시오.",
    options: [o("1","$1$"), o("2","$-1$"), o("3","$3$"), o("4","$-3$"), o("5","$5$")],
    answer: 1,
    explanation: "특성다항식 $f(\\lambda)=\\lambda^3+(-11+2a)\\lambda+4a-4$.\n$f(0)=0$ ⇒ $a=1$.\n$f(3)=0,f(-3)=0$ 모두 $a=1$로 동일."
  }),
  build({
    num: 30, subject: "적분학", unit: "리만-스틸체스", concept: "Riemann-Stieltjes 적분", difficulty: "medium",
    question: "$\\!\\displaystyle\\int_0^2 x^2 d[x]$의 값을 구하시오. ($[x]$는 최대정수함수)",
    options: [o("1","$1$"), o("2","$-1$"), o("3","$3$"), o("4","$-3$"), o("5","$5$")],
    answer: 5,
    explanation: "공식: $\\!\\int_m^n f(x)d[x]=\\!\\sum_{k=m+1}^n f(k)=f(1)+f(2)=1+4=5$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) { console.error("ERROR:", error); process.exit(1); }
console.log(`Inserted ${data.length} 문항 (2022 이화여대):`, data.map((d) => d.id).join(", "));
