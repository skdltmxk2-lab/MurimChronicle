// Upload 2024년도 이화여대 편입수학 기출 30문항 (5지 선다, 100분)
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
const YEAR = "2024";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-ewha-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "선형대수", unit: "행렬 거듭제곱", concept: "행렬 거듭제곱 극한", difficulty: "mediumHard",
    question: "행렬 $A=\\!\\begin{bmatrix}1/10&5/10\\\\9/10&5/10\\end{bmatrix}$, 벡터 $x=\\!\\begin{bmatrix}1\\\\2\\end{bmatrix}$에 대해 $\\!\\displaystyle\\lim_{n\\to\\infty}A^n x$를 구하시오.",
    options: [
      o("1","$\\!\\begin{bmatrix}21/20\\\\49/20\\end{bmatrix}$"),
      o("2","$\\!\\begin{bmatrix}10/37\\\\5/17\\end{bmatrix}$"),
      o("3","$\\!\\begin{bmatrix}1/20\\\\47/20\\end{bmatrix}$"),
      o("4","$\\!\\begin{bmatrix}101/314\\\\17/314\\end{bmatrix}$"),
      o("5","$\\!\\begin{bmatrix}15/14\\\\27/14\\end{bmatrix}$"),
    ],
    answer: 5,
    explanation: "고유값 $1,-2/5$, 고유벡터 $\\!\\begin{bmatrix}5\\\\9\\end{bmatrix},\\!\\begin{bmatrix}1\\\\-1\\end{bmatrix}$.\n$\\lim A^n=\\dfrac{1}{14}\\!\\begin{bmatrix}5&5\\\\9&9\\end{bmatrix}$.\n$x=(1,2)^T$ 곱: $(15/14,27/14)^T$."
  }),
  build({
    num: 2, subject: "선형대수", unit: "이차형식", concept: "타원 회전 표준화", difficulty: "medium",
    question: "$13x^2-10xy+13y^2=18$로 정의된 $2$차원 곡선과 합동인 곡선을 정의하는 방정식을 고르시오.",
    options: [
      o("1","$x^2+y^2=18/13$"),
      o("2","$xy=18/130$"),
      o("3","$9x^2+4y^2=9$"),
      o("4","$x^2-y^2=9/5$"),
      o("5","$x^2+(13/10)xy+y^2=1$"),
    ],
    answer: 3,
    explanation: "이차형식 행렬 $\\!\\begin{pmatrix}13&-5\\\\-5&13\\end{pmatrix}$ 고유값 $8,18$.\n직교대각화: $8X^2+18Y^2=18$ ⇒ $4X^2+9Y^2=9$ → $9X^2+4Y^2=9$ (회전 합동)."
  }),
  build({
    num: 3, subject: "선형대수", unit: "기저변환", concept: "기저변환행렬", difficulty: "medium",
    question: "$\\mathbb{R}^3$의 기저 $B_1=\\{(0,1,2),(-1,1,0),(1,3,4)\\}$, $B_2=\\{(1,1,0),(0,1,1),(1,0,1)\\}$에 대해 $B_1$좌표를 $B_2$좌표로 변환하는 행렬을 구하시오.",
    options: [
      o("1","$\\!\\begin{bmatrix}-1/2&0&0\\\\3/2&1&3\\\\1/2&-1&1\\end{bmatrix}$"),
      o("2","$\\!\\begin{bmatrix}1/2&1/2&-1/2\\\\-1/2&1/2&1/2\\\\1/2&-1/2&1/2\\end{bmatrix}$"),
      o("3","$\\!\\begin{bmatrix}1&-1/2&1/2\\\\1/2&1&-3/4\\\\0&-1/2&1/2\\end{bmatrix}$"),
      o("4","$\\!\\begin{bmatrix}0&-1&1\\\\1&1&3\\\\2&0&4\\end{bmatrix}$"),
      o("5","$\\!\\begin{bmatrix}-1/2&-1/2&3/4\\\\-3/2&-1/2&3/4\\\\0&1&-1/2\\end{bmatrix}$"),
    ],
    answer: 1,
    explanation: "$(0,1,2)=-\\dfrac{1}{2}(1,1,0)+\\dfrac{3}{2}(0,1,1)+\\dfrac{1}{2}(1,0,1)$ 등 세 식으로 풀이.\n결과 행렬: (1)."
  }),
  build({
    num: 4, subject: "선형대수", unit: "이차형식", concept: "레일리 몫 최솟값", difficulty: "medium",
    question: "$A=\\!\\begin{pmatrix}2&-1\\\\-1&3\\end{pmatrix}$와 영벡터 아닌 열벡터 $x$에 대해 $\\dfrac{x\\cdot Ax}{x\\cdot x}$의 최솟값을 구하시오.",
    options: [
      o("1","$\\dfrac{5+\\sqrt 5}{2}$"),
      o("2","$6$"),
      o("3","$5$"),
      o("4","$1$"),
      o("5","$\\dfrac{5-\\sqrt 5}{2}$"),
    ],
    answer: 5,
    explanation: "레일리 몫 최솟값 = 최소 고유값.\n특성다항식 $\\lambda^2-5\\lambda+5=0$ ⇒ $\\lambda=\\dfrac{5\\pm\\sqrt 5}{2}$.\n최솟값 $\\dfrac{5-\\sqrt 5}{2}$."
  }),
  build({
    num: 5, subject: "선형대수", unit: "벡터", concept: "벡터 명제 판별", difficulty: "medium",
    question: "$3$차원 벡터 $u,v,w$에 대하여 옳은 것을 모두 고르시오.\n\na. 실수 $k$에 대하여 $\\|ku\\|=k\\|u\\|$이다.\nb. $\\|u\\|=1$이면 $\\text{proj}_u v=(v\\cdot u)u$이다.\nc. $u\\perp v$이면 $\\|u\\times v\\|=\\|u\\|\\|v\\|$이다.\nd. $u\\times(v\\times w)=(u\\times v)\\times w$이다.",
    options: [o("1","a, b"), o("2","a, c"), o("3","a, d"), o("4","b, c"), o("5","b, d")],
    answer: 4,
    explanation: "a 거짓: $\\|ku\\|=|k|\\cdot\\|u\\|$.\nb 참: 단위벡터 정사영 공식.\nc 참: $\\sin\\theta=1$.\nd 거짓: 외적 결합법칙 X."
  }),
  build({
    num: 6, subject: "선형대수", unit: "행렬식 성질", concept: "행렬식 명제", difficulty: "medium",
    question: "$n\\times n$ 행렬 $A,B$에 대해 참인 명제를 모두 고르시오.\n\na. $A$가 기본행렬이면 $\\det(A)=\\pm 1$.\nb. $\\det(AB)=\\det(A)\\cdot\\det(B)$.\nc. $A$ 가역의 필요충분조건은 $\\det(A)=0$.\nd. $A$의 rank가 $n$ ⇔ $\\det(A)\\ne 0$.\ne. $\\det(A^T)=-\\det(A)$.",
    options: [o("1","a, b"), o("2","a, c, d"), o("3","a, c"), o("4","b, c, d"), o("5","b, d")],
    answer: 5,
    explanation: "a 거짓: 행 $k$배 기본행렬 $\\det=k$.\nb 참.\nc 거짓: $\\det\\ne 0$이 가역조건.\nd 참.\ne 거짓: $\\det(A^T)=\\det(A)$."
  }),
  build({
    num: 7, subject: "적분학", unit: "회전체 부피", concept: "포물선 회전체 (원주각법)", difficulty: "medium",
    question: "곡선 $y=x^2-2$와 직선 $y=x$로 둘러싸인 부분을 $x=-1$을 회전축으로 하여 회전시킬 때 생기는 회전체의 체적 $V$를 구하시오.",
    options: [
      o("1","$13\\pi$"),
      o("2","$\\dfrac{27\\pi}{2}$"),
      o("3","$14\\pi$"),
      o("4","$\\dfrac{29\\pi}{2}$"),
      o("5","$15\\pi$"),
    ],
    answer: 2,
    explanation: "교점 $x=-1,2$.\n원주각법: $V=2\\pi\\!\\int_{-1}^2(x+1)(x-(x^2-2))\\,dx=2\\pi\\!\\int_{-1}^2(-x^3+3x+2)\\,dx=\\dfrac{27\\pi}{2}$."
  }),
  build({
    num: 8, subject: "선형대수", unit: "고유값과 고유벡터", concept: "$AP-\\lambda P=V$ 최소 노름", difficulty: "killer",
    question: "$A=\\!\\begin{pmatrix}12&-9\\\\4&0\\end{pmatrix}$의 고유값 $\\lambda$, 고유벡터 $V$. $AP-\\lambda P=V$를 만족하는 열벡터 $P$에 대해 $\\|P\\|^2$의 최솟값을 구하시오. ($V\\cdot(0,1)^T=2$)",
    options: [o("1","$1/13$"), o("2","$1/9$"), o("3","$1/7$"), o("4","$13/21$"), o("5","$2/7$")],
    answer: 1,
    explanation: "특성다항식 $\\lambda^2-12\\lambda+36=0$ ⇒ $\\lambda=6$.\n고유벡터 $(3,2)$ ($V\\cdot(0,1)=2$).\n$(A-6I)P=V$ ⇒ $2a-3b=1$.\n코시-슈바르츠: $\\|P\\|^2\\ge 1/13$."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "극값", concept: "헤시안 행렬로 극솟점 판별", difficulty: "medium",
    question: "함수 $f(x,y)$가 $\\nabla f(x_i,y_i)$에 대해 헤시안 행렬 $\\nabla^2 f(x_i,y_i)$는 다음과 같다 ($i=1,2,3,4,5$):\n$\\!\\begin{pmatrix}1&3\\\\3&1\\end{pmatrix},\\!\\begin{pmatrix}-1&3\\\\3&1\\end{pmatrix},\\!\\begin{pmatrix}3&1\\\\1&3\\end{pmatrix},\\!\\begin{pmatrix}3&1\\\\1&-1\\end{pmatrix},\\!\\begin{pmatrix}-1&-3\\\\-3&-1\\end{pmatrix}$\n5개의 점들 중 극솟점은 몇 개인가?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 1,
    explanation: "$\\Delta=f_{xx}f_{yy}-f_{xy}^2$, 극소: $\\Delta>0,f_{xx}>0$.\n①$\\Delta=1-9=-8$ 안장.\n②$\\Delta=-1-9<0$ 안장.\n③$\\Delta=9-1=8>0,f_{xx}=3>0$ 극소.\n④$\\Delta=-3-1<0$ 안장.\n⑤$\\Delta=1-9<0$ 안장.\n극소 1개."
  }),
  build({
    num: 10, subject: "적분학", unit: "급수", concept: "$\\sum 1/n^3$ 부분합 범위 (적분 비교)", difficulty: "killer",
    question: "급수 $1+\\dfrac{1}{2^3}+\\dfrac{1}{3^3}+\\cdots$의 수렴값을 포함하는 구간을 고르시오. (힌트: $\\!\\int_3^{\\infty}\\dfrac{1}{x^3}dx=\\dfrac{1}{18}$)",
    options: [
      o("1","$[247/216, 255/216]$"),
      o("2","$[255/216, 263/216]$"),
      o("3","$[263/216, 271/216]$"),
      o("4","$[271/216, 278/216]$"),
      o("5","$[278/216, 280/216]$"),
    ],
    answer: 2,
    explanation: "적분판정: $\\!\\int_3^{\\infty}1/x^3 dx\\le\\!\\sum_{n=3}^{\\infty}1/n^3\\le\\!\\int_2^{\\infty}1/x^3 dx=1/8$.\n$1+1/8+1/18\\le\\!\\sum\\le 1+1/8+1/8$.\n$255/216\\le\\!\\sum\\le 263/216$."
  }),
  build({
    num: 11, subject: "적분학", unit: "급수", concept: "등호 동치성 판별", difficulty: "mediumHard",
    question: "다음 일련의 수식에서 틀린 등호를 모두 찾으시오.\n$0\\underset{a}{=}0+0+0+\\cdots=(1-1)+(1-1)+\\cdots\\underset{c}{=}1+(-1+1)+(-1+1)+\\cdots\\underset{d}{=}1+(-1+1)+(-1+1)+\\cdots=1+0+0+\\cdots=1$",
    options: [o("1","b, c, d"), o("2","b, c"), o("3","c, d"), o("4","a, e, f"), o("5","b, d")],
    answer: 3,
    explanation: "발산 급수 $\\sum(-1)^n$을 재배열한 것.\nc: $0\\ne\\sum(-1)^n$ 발산.\nd: 발산$=1$ 잘못된 등호.\n나머지는 단순 항등."
  }),
  build({
    num: 12, subject: "적분학", unit: "수열의 극한", concept: "점화식 수열", difficulty: "medium",
    question: "$x_{n+1}=3-\\dfrac{1}{x_n},\\,x_1=1$에 대해 $\\!\\lim_{n\\to\\infty}x_n$을 구하시오.",
    options: [
      o("1","$(3-\\sqrt 5)/2$"),
      o("2","$-1$"),
      o("3","$1$"),
      o("4","$3$"),
      o("5","$(3+\\sqrt 5)/2$"),
    ],
    answer: 5,
    explanation: "$a=3-1/a$ ⇒ $a^2-3a+1=0$ ⇒ $a=(3\\pm\\sqrt 5)/2$.\n그래프로 $x_n$이 큰 쪽 $(3+\\sqrt 5)/2$로 수렴."
  }),
  build({
    num: 13, subject: "미분학", unit: "극한과 연속", concept: "$1^\\infty$형 극한 (테일러)", difficulty: "easy",
    question: "극한 $\\!\\displaystyle\\lim_{x\\to 0}(e^x-\\sin x)^{1/x^3}$의 값을 구하시오.",
    options: [o("1","$e^{1/6}$"), o("2","$e^{1/3}$"), o("3","$1$"), o("4","$e$"), o("5","$e^2$")],
    answer: 1,
    explanation: "$\\ln(e^x-\\sin x)/x^3$. $e^x-\\sin x=1+x^3/6+\\cdots$.\n$\\ln(1+x^3/6)/x^3\\to 1/6$.\n$e^{1/6}$."
  }),
  build({
    num: 14, subject: "미분학", unit: "도함수", concept: "등비합 도함수", difficulty: "killer",
    question: "$f(x)=\\sin x+\\dfrac{\\sin^2 x}{2}+\\dfrac{\\sin^3 x}{3}+\\cdots+\\dfrac{\\sin^{2024}x}{2024}$에 대하여 $f'(\\pi/4)$의 값을 구하시오.",
    options: [
      o("1","$\\dfrac{2^{506}-1}{2^{506}(\\sqrt 2-1)}$"),
      o("2","$\\dfrac{2^{1012}-1}{2^{1012}(\\sqrt 2-1)}$"),
      o("3","$\\dfrac{2^{2024}-1}{2^{2024}(\\sqrt 2-1)}$"),
      o("4","$\\dfrac{2^{1012}-1}{2^{1012}(\\sqrt 3-1)}$"),
      o("5","$\\dfrac{2^{2024}-1}{2^{2024}(\\sqrt 3-1)}$"),
    ],
    answer: 2,
    explanation: "$f'(x)=\\cos x(1+\\sin x+\\sin^2 x+\\cdots+\\sin^{2023}x)$.\n$x=\\pi/4$: $\\cos=\\sin=1/\\sqrt 2$.\n등비합 $\\dfrac{1-(1/\\sqrt 2)^{2024}}{1-1/\\sqrt 2}=\\dfrac{1-(1/2)^{1012}}{1-1/\\sqrt 2}$.\n$f'(\\pi/4)=\\dfrac{1}{\\sqrt 2}\\cdot\\dfrac{1-1/2^{1012}}{1-1/\\sqrt 2}=\\dfrac{2^{1012}-1}{2^{1012}(\\sqrt 2-1)}$."
  }),
  build({
    num: 15, subject: "적분학", unit: "이상적분", concept: "이상적분 수렴 판정", difficulty: "medium",
    question: "다음 특이적분 중 수렴하는 것을 모두 고르시오.\n\na. $\\!\\int_1^{\\infty}\\dfrac{|\\sin x|}{x}\\,dx$\nb. $\\!\\int_1^9\\dfrac{1}{\\sqrt[3]{x-1}}\\,dx$\nc. $\\!\\int_0^{\\infty}\\dfrac{\\arctan(e^x)}{2+e^x}\\,dx$\nd. $\\!\\int_0^1\\dfrac{\\ln x}{x}\\,dx$",
    options: [o("1","a, b"), o("2","a, c"), o("3","a, b, d"), o("4","b, c"), o("5","b, d")],
    answer: 4,
    explanation: "a 발산: $\\sim 1/x$.\nb 수렴: $p=1/3<1$.\nc 수렴: $\\sim e^{-x}$.\nd 발산: $\\ln x=t$ 치환."
  }),
  build({
    num: 16, subject: "적분학", unit: "급수", concept: "급수 수렴 판정", difficulty: "medium",
    question: "다음 급수 중 수렴하는 것을 모두 고르시오.\n\na. $\\!\\sum_{n=1}^{\\infty}\\ln(\\dfrac{n+1}{n})$\nb. $\\!\\sum_{n=1}^{\\infty}(-1)^{n+1}\\sin(\\pi/n)$\nc. $\\!\\sum_{n=1}^{\\infty}\\dfrac{1}{n^{1+1/n}}$\nd. $\\!\\sum_{n=1}^{\\infty}(-1)^{n+1}\\dfrac{2^n n!}{5\\cdot 8\\cdots(3n+2)}$",
    options: [o("1","a, b"), o("2","a, c"), o("3","a, d"), o("4","b, c"), o("5","b, d")],
    answer: 5,
    explanation: "a 발산: $\\sim 1/n$.\nb 수렴: 교대급수.\nc 발산: $n^{1/n}\\to 1$.\nd 수렴: 비판정 $\\to 2/3<1$."
  }),
  build({
    num: 17, subject: "적분학", unit: "수열의 극한", concept: "수열 명제 판별", difficulty: "medium",
    question: "다음 중 옳은 것을 모두 고르시오.\n\na. $\\!\\lim(a_n+b_n)=\\lim a_n+\\lim b_n$.\nb. $\\lim|a_n|=0$이면 $\\lim a_n\\sin(n\\pi/6)=0$.\nc. $\\lim a_n=L$이고 $f$가 $L$에서 연속이면 $\\lim f(a_n)=f(L)$.\nd. 위로 유계인 단조수열은 수렴한다.",
    options: [o("1","a, b"), o("2","a, c"), o("3","a, d"), o("4","b, c"), o("5","b, d")],
    answer: 4,
    explanation: "a 거짓: 각각 수렴해야 함.\nb 참: 유계×0.\nc 참.\nd 거짓: 단조감소+유계 아래여야 수렴."
  }),
  build({
    num: 18, subject: "선형대수", unit: "선형연산자", concept: "수반연산자 동치 명제", difficulty: "killer",
    question: "유한차원 내적공간 $V$의 선형연산자 $T$에 대해 다음 중 한 명제만 동치가 아니다. 그 명제를 고르시오.\n\na. $T^*T=TT^*=I$\nb. 모든 $x,y\\in V$에 대해 $\\langle T(x),T(y)\\rangle=\\langle x,y\\rangle$.\nc. $T$의 모든 고윳값은 $1$이다.\nd. 모든 $x\\in V$에 대해 $\\|T(x)\\|=\\|x\\|$.\ne. $V$의 정규직교기저 $\\beta$에 대해 $T(\\beta)$도 $V$의 정규직교기저이다.",
    options: [o("1","a"), o("2","b"), o("3","c"), o("4","d"), o("5","e")],
    answer: 3,
    explanation: "a,b,d,e는 유니타리/직교 연산자의 동치 조건.\nc 거짓: 유니타리의 고유값은 $|\\lambda|=1$인 복소수, $\\lambda=1$만 아님."
  }),
  build({
    num: 19, subject: "적분학", unit: "급수", concept: "교대급수합 ($\\ln(1+x)$)", difficulty: "medium",
    question: "$\\dfrac{1}{1\\cdot 2}-\\dfrac{1}{2\\cdot 2^2}+\\dfrac{1}{3\\cdot 2^3}-\\dfrac{1}{4\\cdot 2^4}+\\cdots=\\!\\sum_{n=1}^{\\infty}\\dfrac{(-1)^{n+1}}{n\\cdot 2^n}$의 값을 구하시오.",
    options: [o("1","$\\ln(1/2)$"), o("2","$\\ln(3/2)$"), o("3","$\\sqrt 3/3$"), o("4","$1$"), o("5","$\\sqrt 3$")],
    answer: 2,
    explanation: "$\\ln(1+x)=\\!\\sum(-1)^{n+1}x^n/n$, $x=1/2$ 대입.\n$\\ln(3/2)$."
  }),
  build({
    num: 20, subject: "선형대수", unit: "고유값", concept: "고유값 곱 = 행렬식", difficulty: "medium",
    question: "실수 위의 $3$차원 벡터공간 기저 $\\{v_1,v_2,v_3\\}$에 대해 $3\\times 3$ 행렬 $A$가 $(A-2I)v_1=(A+2I)v_2=(A-4I)v_3=0$을 만족할 때 $\\det(A)$의 값을 구하시오.",
    options: [o("1","$-16$"), o("2","$-8$"), o("3","$4$"), o("4","$8$"), o("5","$16$")],
    answer: 1,
    explanation: "$A$의 고유값 $2,-2,4$.\n$\\det(A)=2\\cdot(-2)\\cdot 4=-16$."
  }),
  build({
    num: 21, subject: "선형대수", unit: "스펙트럼 분해", concept: "스펙트럼 곱 = 행렬식", difficulty: "medium",
    question: "$A=\\!\\begin{pmatrix}12&1&-1\\\\1&0&2\\\\-1&2&3\\end{pmatrix}$에 대해 단위 직교 열벡터 $u_1,u_2,u_3$와 실수 $a_1,a_2,a_3$가 $A=a_1 u_1 u_1^T+a_2 u_2 u_2^T+a_3 u_3 u_3^T$를 만족할 때 $a_1 a_2 a_3$을 구하시오.",
    options: [o("1","$-55$"), o("2","$0$"), o("3","$1$"), o("4","$3$"), o("5","$4$"), o("6","$9$"), o("7","$15$"), o("8","$1$"), o("9","$2$"), o("10","$50$"), o("16","$1+2\\sqrt 3$"), o("17","$\\pi$"), o("18","$3\\pi/2$"), o("19","$2\\pi$"), o("20","$4\\pi$")],
    answer: 1,
    explanation: "대칭행렬 스펙트럼 분해에서 $a_i$는 고유값.\n$a_1 a_2 a_3=\\det A=-55$."
  }),
  build({
    num: 22, subject: "선형대수", unit: "trace", concept: "$\\text{tr}(A^TA)$ mod 100", difficulty: "killer",
    question: "$A=\\!\\begin{pmatrix}1&2&\\cdots&10\\\\11&12&\\cdots&20\\\\\\vdots&\\vdots&\\ddots&\\vdots\\\\91&92&\\cdots&100\\end{pmatrix}$에 대해 $\\text{tr}(A^T A)$를 $100$으로 나눈 나머지를 구하시오.",
    options: [o("1","$-55$"), o("2","$0$"), o("3","$1$"), o("4","$3$"), o("5","$4$"), o("6","$9$"), o("7","$15$"), o("8","$1$"), o("9","$2$"), o("10","$50$")],
    answer: 10,
    explanation: "$\\text{tr}(A^T A)=\\sum_{i,j}a_{ij}^2=\\sum_{k=1}^{100}k^2=\\dfrac{100\\cdot 101\\cdot 201}{6}=338350$.\n$\\mod 100=50$."
  }),
  build({
    num: 23, subject: "적분학", unit: "이중적분", concept: "극좌표 (원판 위)", difficulty: "medium",
    question: "영역 $D=\\{(x,y):(x-1/2)^2+y^2\\le 1/4\\}$에 대해 $\\!\\displaystyle\\iint_D\\dfrac{x}{x^2+y^2}\\,dx\\,dy$를 구하시오.",
    options: [o("1","$-55$"), o("3","$1$"), o("4","$3$"), o("11","$1/2$"), o("12","$\\sqrt 3/2$"), o("13","$6$"), o("14","$\\pi/4$"), o("15","$\\sqrt 5/2$"), o("16","$\\pi/2$"), o("17","$\\pi$"), o("18","$3\\pi/2$"), o("19","$2\\pi$"), o("20","$4\\pi$")],
    answer: 16,
    explanation: "극좌표: $r=\\cos\\theta$, $-\\pi/2\\le\\theta\\le\\pi/2$.\n대칭으로 $2\\!\\int_0^{\\pi/2}\\!\\int_0^{\\cos\\theta}\\dfrac{\\cos\\theta}{r}r\\,dr\\,d\\theta=2\\!\\int_0^{\\pi/2}\\cos^2\\theta\\,d\\theta=\\pi/2$."
  }),
  build({
    num: 24, subject: "다변수함수", unit: "면적분", concept: "스토크스 정리 (반구)", difficulty: "killer",
    question: "곡면 $S=\\{(x,y,z):x^2+y^2+z^2=1,z\\ge 0\\}$와 벡터장 $F=\\dfrac{1}{\\sqrt{x^2+y^2+z^2}}(x,x,\\sin z)$에 대해 $\\!\\displaystyle\\iint_S(\\text{curl}F)\\cdot n\\,dS$를 구하시오.",
    options: [o("1","$-55$"), o("3","$1$"), o("4","$3$"), o("11","$1/2$"), o("12","$\\sqrt 3/2$"), o("13","$6$"), o("14","$\\pi/4$"), o("15","$\\sqrt 5/2$"), o("16","$\\pi/2$"), o("17","$\\pi$"), o("18","$3\\pi/2$"), o("19","$2\\pi$"), o("20","$4\\pi$")],
    answer: 17,
    explanation: "스토크스: $\\!\\oint_{\\partial S}F\\cdot dr$, $\\partial S$는 단위원 $z=0$.\n$F|_{z=0}=(x,x,0)$. $\\!\\oint(x,x,0)\\cdot(-\\sin t,\\cos t,0)dt=\\!\\int_0^{2\\pi}(-\\cos t\\sin t+\\cos^2 t)dt=\\pi$."
  }),
  build({
    num: 25, subject: "다변수함수", unit: "선적분", concept: "그린정리 (반원 연결)", difficulty: "medium",
    question: "$(1,0),(-1,0),(0,0)$을 중심으로 하는 반원을 이어 붙인 폐곡선 $C$. 벡터장 $F(x,y)=(\\cos(xy)y-y,\\cos(xy)x+x)$에 대해 $\\!\\int_C F\\cdot T\\,ds$를 계산하시오.",
    options: [o("1","$-55$"), o("3","$1$"), o("4","$3$"), o("11","$1/2$"), o("12","$\\sqrt 3/2$"), o("13","$6$"), o("14","$\\pi/4$"), o("15","$\\sqrt 5/2$"), o("16","$\\pi/2$"), o("17","$\\pi$"), o("18","$3\\pi/2$"), o("19","$2\\pi$"), o("20","$4\\pi$")],
    answer: 20,
    explanation: "그린정리: $\\!\\iint_D(\\partial Q/\\partial x-\\partial P/\\partial y)\\,dA=\\!\\iint 2\\,dA$.\n영역 넓이 $=2\\pi$.\n$2\\cdot 2\\pi=4\\pi$."
  }),
  build({
    num: 26, subject: "공학수학", unit: "1계 미분방정식", concept: "$(xf)'$ 형 ODE 적분", difficulty: "medium",
    question: "양의 실수에서 미분가능 함수 $f$가 $f(x)+xf'(x)=x^2-\\dfrac{1}{2\\sqrt x}$를 만족할 때 $4f(4)-f(1)$의 값을 구하시오.",
    options: [o("1","$-55$"), o("3","$1$"), o("4","$3$"), o("8","$1$"), o("9","$2$"), o("10","$50$"), o("11","$1/2$"), o("12","$\\sqrt 3/2$"), o("13","$6$"), o("14","$\\pi/4$"), o("20","$20$")],
    answer: 20,
    explanation: "$(xf)'=f+xf'=x^2-1/(2\\sqrt x)$.\n$1$부터 $4$까지 적분: $[xf]_1^4=\\!\\int_1^4(x^2-1/(2\\sqrt x))dx=63/3-(\\sqrt 4-\\sqrt 1)=21-1=20$.\n$4f(4)-f(1)=20$."
  }),
  build({
    num: 27, subject: "선형대수", unit: "스칼라 삼중적", concept: "평행육면체 부피", difficulty: "easy",
    question: "$3$차원 공간의 원점에서 벡터 $i+j-k,i-j+k,-i+j+k$를 세변으로 갖는 평행육면체의 부피를 구하시오.",
    options: [o("1","$-55$"), o("3","$1$"), o("4","$3$"), o("5","$4$"), o("6","$9$"), o("7","$15$"), o("9","$2$"), o("10","$50$")],
    answer: 5,
    explanation: "$V=|\\det\\!\\begin{pmatrix}1&1&-1\\\\1&-1&1\\\\-1&1&1\\end{pmatrix}|=|-4|=4$."
  }),
  build({
    num: 28, subject: "적분학", unit: "역함수 적분", concept: "역함수 적분 치환", difficulty: "medium",
    question: "$f(x)=\\sin x\\;(-\\pi/2\\le x\\le\\pi/2)$. $\\!\\displaystyle\\int_{-1}^1\\dfrac{\\cos^2(f^{-1}(x))}{f'(f^{-1}(x))}\\,dx$를 구하시오.",
    options: [o("1","$-55$"), o("3","$1$"), o("4","$3$"), o("11","$1/2$"), o("12","$\\sqrt 3/2$"), o("13","$6$"), o("14","$\\pi/4$"), o("15","$\\sqrt 5/2$"), o("16","$\\pi/2$"), o("17","$\\pi$"), o("18","$3\\pi/2$"), o("19","$2\\pi$"), o("20","$4\\pi$")],
    answer: 16,
    explanation: "$f^{-1}(x)=t$ 치환: $x=\\sin t,dx=\\cos t\\,dt$.\n$\\!\\int_{-\\pi/2}^{\\pi/2}\\dfrac{\\cos^2 t}{\\cos t}\\cos t\\,dt=\\!\\int\\cos^2 t\\,dt=\\pi/2$."
  }),
  build({
    num: 29, subject: "적분학", unit: "정적분과 미분", concept: "정적분 함수 합성 미분", difficulty: "medium",
    question: "$f(x)=\\!\\displaystyle\\int_0^{\\sin x}\\!\\sqrt{1+t^2}\\,dt,\\,g(x)=\\!\\int_{10}^x f(t)\\,dt$에 대해 $g''(\\pi/4)$의 값을 구하시오.",
    options: [o("1","$-55$"), o("3","$1$"), o("4","$3$"), o("11","$1/2$"), o("12","$\\sqrt 3/2$"), o("13","$6$"), o("14","$\\pi/4$"), o("16","$\\pi/2$"), o("17","$\\pi$"), o("18","$3\\pi/2$"), o("19","$2\\pi$"), o("20","$4\\pi$")],
    answer: 12,
    explanation: "$g'(x)=f(x)$, $g''(x)=f'(x)=\\sqrt{1+\\sin^2 x}\\cos x$.\n$x=\\pi/4$: $\\sqrt{1+1/2}\\cdot 1/\\sqrt 2=\\sqrt{3/2}/\\sqrt 2=\\sqrt 3/2$."
  }),
  build({
    num: 30, subject: "다변수함수", unit: "조건부 극값", concept: "평면·원기둥 교선 위 최댓값", difficulty: "medium",
    question: "평면 $3x-y+z=5$와 원기둥 $x^2+y^2=2$의 교선 위에서 $f(x,y,z)=x+y+z$의 최댓값을 구하시오.",
    options: [o("1","$-55$"), o("3","$1$"), o("4","$3$"), o("5","$4$"), o("6","$9$"), o("7","$15$"), o("8","$1$"), o("9","$2$"), o("11","$1/2$"), o("13","$6$"), o("20","$4\\pi$")],
    answer: 6,
    explanation: "$x=\\sqrt 2\\cos\\theta,y=\\sqrt 2\\sin\\theta,z=5-3\\sqrt 2\\cos\\theta+\\sqrt 2\\sin\\theta$.\n$f=-2\\sqrt 2\\cos\\theta+2\\sqrt 2\\sin\\theta+5=4\\sin(\\theta+\\alpha)+5$.\n최댓값 $9$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) { console.error("ERROR:", error); process.exit(1); }
console.log(`Inserted ${data.length} 문항 (2024 이화여대):`, data.map((d) => d.id).join(", "));
