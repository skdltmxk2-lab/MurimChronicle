// Upload 2020년도 이화여대 편입수학 기출 30문항 (5지 선다, 100분)
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
const YEAR = "2020";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-ewha-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "그래프 분석", concept: "유리함수·직선 교점 개수", difficulty: "mediumHard",
    question: "$0$이 아닌 실수 전체에서 정의된 두 함수 $f(x)=x^2+\\dfrac{2}{x},\\,g(x)=ax+3$의 교점에 대한 설명 중 옳은 것을 모두 고르시오. ($a$는 임의의 실수)\n\na. $f$와 $g$의 교점의 개수는 $3$개 이하이다.\nb. $f$와 $g$의 서로 다른 교점의 개수가 정확히 $2$개가 되는 실수 $a$가 존재한다.\nc. $f$와 $g$의 교점이 없는 실수 $a$가 존재한다.",
    options: [o("1","a"), o("2","b"), o("3","c"), o("4","a, c"), o("5","a, b")],
    answer: 5,
    explanation: "$h(x)=x+\\dfrac{2}{x^2}-\\dfrac{3}{x}$, $k(x)=a$ 그래프 비교.\n$h$는 $x=1$에서 극솟값 $0$, $x\\to 0^\\pm$ 무한, $x\\to\\pm\\infty$ 점근. 교점은 항상 1~3개. a,b 참, c 거짓."
  }),
  build({
    num: 2, subject: "미분학", unit: "역함수·합성", concept: "합성함수와 역함수 식별", difficulty: "mediumHard",
    question: "정의역이 $\\{x\\mid x\\ge 0\\}$이고 공역 $\\{y\\mid y\\ge 0\\}$인 함수 $f(x)=e^{x^2+x}$는 역함수를 갖는다. 최고차항의 계수가 $1$인 어떤 실수계수 이차함수 $g(x)$에 대하여 $h(x)=(f\\circ g\\circ f^{-1})(x)$로 정의할 때, $h(1)=(h\\circ h)(1)=e^{10}$을 만족한다. $g(1)$의 값을 구하시오.",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$0$"), o("4","$1$"), o("5","$2$")],
    answer: 4,
    explanation: "$g(x)=x^2+ax+b$. $h(1)=f(g(0))=e^{b^2+b}=e^{10}$ ⇒ $b=2$.\n$h(h(1))=e^{10}$에서 $a$ 풀이: $a=-2$.\n$g(1)=1+a+b=1-2+2=1$."
  }),
  build({
    num: 3, subject: "미분학", unit: "그래프 분석", concept: "바닥함수 그래프 교점", difficulty: "medium",
    question: "$[x]$는 $x$보다 크지 않은 가장 큰 정수이다. 다음 중 옳은 것을 모두 고르시오.\n\na. $y=[x]$와 $y=x-1$은 무한히 많은 교점을 갖는다.\nb. 정의역 $[-1,1]$에서 $y=[x]$와 $y=[x^3]$의 그래프는 같다.\nc. $y=[x]$와 $y=\\dfrac{2019}{2020}x$의 교점의 개수는 $2020$개다.\nd. $y=[x]$와 $y=\\dfrac{2019}{2020}x-\\dfrac{2019}{2020}$의 교점의 개수는 $2019$개다.",
    options: [o("1","a, b"), o("2","a, c"), o("3","b, c"), o("4","b, d"), o("5","c, d")],
    answer: 4,
    explanation: "a 거짓: $y=x-1$은 $[x]$의 일부 구간에서만 만남.\nb 참: $[-1,1]$에서 $[x],[x^3]$이 같은 값.\nc 거짓: 교점 2019개.\nd 참: 교점 2019개."
  }),
  build({
    num: 4, subject: "적분학", unit: "급수", concept: "$(n+1)^2/(2^n(n-2))$ 급수", difficulty: "mediumHard",
    question: "급수 $\\!\\displaystyle\\sum_{n=3}^{\\infty}\\dfrac{(n+1)^2}{2^n(n-2)}$의 값을 구하시오.",
    options: [
      o("1","$\\ln 2+\\dfrac{5}{2}$"),
      o("2","$\\dfrac{9}{4}\\ln 2+\\dfrac{11}{4}$"),
      o("3","$\\dfrac{9}{4}\\ln 2+2$"),
      o("4","$\\dfrac{5}{4}\\ln 2+\\dfrac{3}{4}$"),
      o("5","$\\dfrac{1}{4}\\ln 2+\\dfrac{13}{4}$"),
    ],
    answer: 3,
    explanation: "$n\\to n+2$: $\\!\\sum_{n=1}^\\infty\\dfrac{(n+3)^2}{n2^{n+2}}=\\dfrac{1}{4}\\!\\sum\\dfrac{n^2+6n+9}{n}(1/2)^n$.\n분해 후 합 $=\\dfrac{1}{4}(8+9\\ln 2)=2+\\dfrac{9}{4}\\ln 2$."
  }),
  build({
    num: 5, subject: "적분학", unit: "급수", concept: "이항급수 부분합", difficulty: "medium",
    question: "급수 $\\!\\displaystyle\\sum_{r=2}^8\\!\\!\\binom{8}{r}\\!2^{8-r}(-3)^r$의 값을 계산하시오. (단, $\\!\\binom{8}{r}={}_8C_r$)",
    options: [
      o("1","$9\\cdot 2^8-1$"),
      o("2","$5\\cdot 2^9-1$"),
      o("3","$5\\cdot 2^9+1$"),
      o("4","$11\\cdot 2^8+1$"),
      o("5","$13\\cdot 2^8+1$"),
    ],
    answer: 4,
    explanation: "$(2-3)^8=\\!\\sum_{r=0}^8\\!\\!\\binom{8}{r}2^{8-r}(-3)^r=1$.\n$r=0$항: $2^8$, $r=1$항: $8\\cdot 2^7\\cdot(-3)=-3\\cdot 2^{10}$.\n나머지 $=1-2^8+3\\cdot 2^{10}=1+11\\cdot 2^8$."
  }),
  build({
    num: 6, subject: "적분학", unit: "급수", concept: "급수 수렴 판정 (네 식)", difficulty: "medium",
    question: "다음 급수들 중 수렴하는 것을 모두 고르시오.\n\na. $\\!\\displaystyle\\sum_{n=3}^{\\infty}\\dfrac{\\tan(1/n)}{\\ln n}$\nb. $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{2n+(-1)^n}{n^3}$\nc. $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{2^n n!}{n^n}$\nd. $\\!\\displaystyle\\sum_{n=2}^{\\infty}\\!\\!\\left(1-\\dfrac{1}{n}\\right)^{\\!n^2}$",
    options: [o("1","b, d"), o("2","a, b, c"), o("3","b, c, d"), o("4","a, b, d"), o("5","a, b, c, d")],
    answer: 3,
    explanation: "a 발산: $\\tan(1/n)/\\ln n\\sim 1/(n\\ln n)$.\nb 수렴: $\\sim 1/n^2$.\nc 수렴: 비판정 $\\to 2/e<1$.\nd 수렴: $n$승근 $\\to e^{-1}<1$."
  }),
  build({
    num: 7, subject: "선형대수", unit: "벡터 외적", concept: "공간 세 점 삼각형 넓이", difficulty: "easy",
    question: "$3$차원 공간 상의 세 점 $P(1,1,0),\\,Q(2,1,-1),\\,R(1,-1,2)$를 꼭짓점으로 가지는 삼각형의 넓이를 구하시오.",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$1$"), o("3","$\\sqrt 3$"), o("4","$2\\sqrt 3$"), o("5","$2$")],
    answer: 3,
    explanation: "$\\vec{PQ}=(1,0,-1)$, $\\vec{PR}=(0,-2,2)$, $\\vec{PQ}\\times\\vec{PR}=(-2,-2,-2)$.\n$|\\cdot|=2\\sqrt 3$, $S=\\sqrt 3$."
  }),
  build({
    num: 8, subject: "미분학", unit: "극한과 연속", concept: "$1^\\infty$형 극한", difficulty: "easy",
    question: "극한 $\\!\\displaystyle\\lim_{x\\to 0}(1-\\tan x)^{1/x}$의 값을 구하시오.",
    options: [o("1","$-e$"), o("2","$-\\dfrac{1}{e}$"), o("3","$1$"), o("4","$e$"), o("5","$\\dfrac{1}{e}$")],
    answer: 5,
    explanation: "$\\lim(1-\\tan x)^{-1/\\tan x\\cdot(-\\tan x/x)}=e^{-1}=1/e$."
  }),
  build({
    num: 9, subject: "선형대수", unit: "벡터 평행육면체", concept: "평행육면체 부피", difficulty: "medium",
    question: "$3$차원 공간에서 집합 $\\{(1,-1,7)+r(2,1,3)+s(1,5,2)+t(-1,1,3)\\mid 1\\le r\\le 2,\\,2\\le s\\le 4,\\,0\\le t\\le a\\}$이 나타내는 영역의 부피가 $39$가 되게 하는 양수 $a$값을 구하시오.",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$1$"), o("3","$\\dfrac{3}{2}$"), o("4","$2$"), o("5","$\\dfrac{5}{2}$")],
    answer: 1,
    explanation: "변 길이 $1,2,a$의 평행육면체.\n$|\\det\\!\\begin{pmatrix}2&1&3\\\\1&5&2\\\\-1&1&3\\end{pmatrix}|=39$.\n부피 $=1\\cdot 2\\cdot a\\cdot 39=78a=39$ ⇒ $a=1/2$."
  }),
  build({
    num: 10, subject: "기타", unit: "수열·격자", concept: "이중첨자 수열 합 차", difficulty: "killer",
    question: "$0\\le k\\le l$을 만족하는 모든 정수쌍 $(k,l)$에 대하여 실수 $a_{l,k}$가 주어졌고:\n1) $a_{0,0}=1,\\,a_{l,0}=a_{l-1,0}$\n2) $a_{l,k}=a_{l,k-1}+a_{l-1,k}$ ($0<k<l$)\n3) $a_{l,l}=a_{l,l-1}$\n\n$a_{6,6}-\\!\\sum_{k=0}^{5}a_{5,k}$의 값을 구하시오.",
    options: [o("1","$5$"), o("2","$14$"), o("3","$132$"), o("4","$42$"), o("5","$0$")],
    answer: 5,
    explanation: "$a_{6,6}=a_{6,5}=a_{5,5}+a_{6,5\\to 6,4}$ ... 조건 사용 후 텔레스코핑으로 $a_{6,0}-a_{5,0}=0$."
  }),
  build({
    num: 11, subject: "선형대수", unit: "행렬식 성질", concept: "행렬식 합성 식", difficulty: "easy",
    question: "$4\\times 4$ 크기의 두 행렬 $A,B$가 $\\det(A)=2,\\,\\det(-B)=1$을 만족할 때, $\\det(2A^{-1}B^T)$의 값을 구하시오.",
    options: [o("1","$-8$"), o("2","$-1$"), o("3","$1$"), o("4","$8$"), o("5","$32$")],
    answer: 4,
    explanation: "$\\det(2A^{-1}B^T)=2^4\\cdot\\dfrac{1}{\\det A}\\cdot\\det B=16\\cdot\\dfrac{1}{2}\\cdot 1=8$ ($\\det B=\\det(-B)=1$)."
  }),
  build({
    num: 12, subject: "선형대수", unit: "행렬식", concept: "비가역 조건 (특성다항식 합)", difficulty: "medium",
    question: "다음 행렬 $A$가 비가역(not invertible)이 되게 하는 모든 $x$값들의 합을 구하시오. $A=\\!\\begin{pmatrix}-1&x&0&0\\\\x-1&x&0&2\\\\0&-1&x&-3\\\\0&0&-1&x\\end{pmatrix}$",
    options: [o("1","$-4$"), o("2","$-2$"), o("3","$0$"), o("4","$2$"), o("5","$4$")],
    answer: 3,
    explanation: "전개해서 $\\det A=-x^4+x^2-2=0$ → $x^4-x^2+2=0$.\n근과 계수 관계로 실근/복근 모두의 합 $=0$."
  }),
  build({
    num: 13, subject: "적분학", unit: "정적분", concept: "치환 후 부분분수", difficulty: "medium",
    question: "$\\!\\displaystyle\\int_1^e\\dfrac{(\\ln x)^2}{x(1+(\\ln x)^3)}\\,dx$의 값을 계산하시오.",
    options: [
      o("1","$\\dfrac{\\ln 2}{3}$"),
      o("2","$\\ln 2$"),
      o("3","$\\dfrac{\\ln(1+e^3)-\\ln 2}{3}$"),
      o("4","$\\ln(1+e^3)-\\ln 2$"),
      o("5","$\\dfrac{1}{2e}$"),
    ],
    answer: 1,
    explanation: "$\\ln x=t$ 치환, $\\!\\int_0^1\\dfrac{t^2}{1+t^3}dt=\\dfrac{1}{3}\\ln(1+t^3)|_0^1=\\dfrac{\\ln 2}{3}$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "선적분", concept: "그놈문제 (원점 둘러쌈)", difficulty: "medium",
    question: "원점을 제외한 평면에서 $P(x,y)=-\\dfrac{y}{x^2+y^2},\\,Q(x,y)=\\dfrac{x}{x^2+y^2}$. $C_1$: 중심 $(2020,2020)$, 반지름 $2020$인 원, $C_2$: 중심 $(2020,2020)$, 반지름 $4040$인 원. 시계반대방향. $\\!\\int_{C_1}P\\,dx+Q\\,dy=a_1$, $\\!\\int_{C_2}P\\,dx+Q\\,dy=a_2$. $a_1-a_2$의 값을 구하시오.",
    options: [o("1","$0$"), o("2","$-2020\\pi$"), o("3","$-4040\\pi$"), o("4","$2\\pi$"), o("5","$-2\\pi$")],
    answer: 5,
    explanation: "$C_1$: 원점 미포함 → $a_1=0$.\n$C_2$: 원점 포함 → $a_2=2\\pi$.\n차 $=-2\\pi$."
  }),
  build({
    num: 15, subject: "다변수함수", unit: "곡면적", concept: "곡면적 (xz원판)", difficulty: "medium",
    question: "$3$차원 공간상에서 $y=xz$와 $x^2+z^2\\le 1$을 만족하는 모든 점들로 이루어진 곡면의 넓이를 구하시오.",
    options: [
      o("1","$\\dfrac{2}{3}\\pi$"),
      o("2","$\\dfrac{2}{3}\\pi(2\\sqrt 2-1)$"),
      o("3","$\\dfrac{4}{3}\\pi(2\\sqrt 2-1)$"),
      o("4","$\\dfrac{2\\sqrt 2}{3}\\pi$"),
      o("5","$\\pi(2\\sqrt 2-1)$"),
    ],
    answer: 2,
    explanation: "$y_x=z,y_z=x$, $dS=\\sqrt{1+x^2+z^2}\\,dA$.\n극좌표: $\\!\\int_0^{2\\pi}\\!\\int_0^1 r\\sqrt{1+r^2}dr\\,d\\theta=\\dfrac{2\\pi}{3}(2\\sqrt 2-1)$."
  }),
  build({
    num: 16, subject: "다변수함수", unit: "조건부 극값", concept: "타원체 위의 함수 최댓값", difficulty: "killer",
    question: "$3$차원 공간 상의 영역 $x^2+2y^2+z^2\\le 4$에서 정의된 함수 $f(x,y,z)=x+yz$의 최댓값 $M$을 구하시오.",
    options: [o("1","$\\sqrt 2$"), o("2","$\\dfrac{3\\sqrt 2}{2}$"), o("3","$\\dfrac{7\\sqrt 2}{4}$"), o("4","$2\\sqrt 2$"), o("5","$2$")],
    answer: 2,
    explanation: "라그랑지: $\\nabla f=\\lambda\\nabla g$. 해 분석 후 $(√2,1/√2,1)$에서 $f=√2+1/√2=3√2/2$."
  }),
  build({
    num: 17, subject: "적분학", unit: "정적분", concept: "Wallis 공식 비율 (2020/2019)", difficulty: "mediumHard",
    question: "$\\dfrac{\\!\\int_0^{\\pi/2}(\\cos x)^{2020}\\,dx}{\\!\\int_0^{\\pi/2}(\\cos x)^{2018}\\,dx}$의 값을 계산하시오.",
    options: [
      o("1","$\\dfrac{2019}{2020}$"),
      o("2","$-\\dfrac{2019}{2020}$"),
      o("3","$\\dfrac{2019}{2}$"),
      o("4","$-\\dfrac{2019}{2}$"),
      o("5","$\\dfrac{2020}{2018}$"),
    ],
    answer: 1,
    explanation: "Wallis 점화: $\\!\\int_0^{\\pi/2}\\cos^n x\\,dx=\\dfrac{n-1}{n}\\!\\int_0^{\\pi/2}\\cos^{n-2}x\\,dx$.\n비율 $=\\dfrac{2019}{2020}$."
  }),
  build({
    num: 18, subject: "다변수함수", unit: "다변수 극한", concept: "이변수 극한 수렴 판정", difficulty: "medium",
    question: "다음 극한 중 수렴하는 것을 모두 고르시오.\n\na. $\\!\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{x\\sin(x^2+y^2)}{x^2+y^2}$\nb. $\\!\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{(x+y)(x^2+xy+y^2)}{x^2+y^2}$\nc. $\\!\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{x(x^2+y^2)}{x^2+y^4}$\nd. $\\!\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{x^2 y}{x^3+y^3}$",
    options: [o("1","a, b"), o("2","a, b, c"), o("3","a, b, c, d"), o("4","b, c"), o("5","d")],
    answer: 1,
    explanation: "a 수렴(0): $x\\to 0$, $\\sin$/. → 1.\nb 수렴(0): 3차/2차.\nc 발산: $x=y^2$ 경로 1/2.\nd 발산: 동차."
  }),
  build({
    num: 19, subject: "다변수함수", unit: "거리", concept: "평면-곡면 최소 거리 (라그랑지)", difficulty: "medium",
    question: "$3$차원 공간에서 평면 $4x-2y+z=-1$의 점과 곡면 $z=x^2+y^2+6$의 점 사이의 거리의 최솟값을 구하시오.",
    options: [
      o("1","$\\dfrac{1}{\\sqrt{21}}$"),
      o("2","$\\dfrac{2}{\\sqrt{21}}$"),
      o("3","$\\dfrac{3}{\\sqrt{21}}$"),
      o("4","$\\dfrac{5}{\\sqrt{21}}$"),
      o("5","$\\dfrac{7}{\\sqrt{21}}$"),
    ],
    answer: 2,
    explanation: "곡면 접평면 법선벡터가 평면과 평행해야 함.\n$\\nabla(z-x^2-y^2-6)=(-2x,-2y,1)\\parallel(4,-2,1)$ ⇒ $x=-2,y=1$.\n$z=11$. 거리 $=|{-8-2+11+1}|/\\sqrt{21}=2/\\sqrt{21}$."
  }),
  build({
    num: 20, subject: "선형대수", unit: "고유값", concept: "고유값 합 (대각합)", difficulty: "medium",
    question: "행렬 $\\!\\begin{pmatrix}1&2&3\\\\2&100&-1\\\\3&-1&-100\\end{pmatrix}$의 고윳값을 $\\alpha,\\beta,\\gamma$라 할 때, $\\alpha\\beta+\\beta\\gamma+\\gamma\\alpha$의 값을 구하시오.",
    options: [o("1","$0$"), o("2","$1$"), o("3","$-10000$"), o("4","$10014$"), o("5","$-10014$")],
    answer: 5,
    explanation: "$\\alpha\\beta+\\beta\\gamma+\\gamma\\alpha=$ 대각성분의 여인수 합.\n$(-10000-1)+(-100-9)+(100-4)=-10014$."
  }),
  build({
    num: 21, subject: "적분학", unit: "급수", concept: "수렴반경 곱", difficulty: "medium",
    question: "다음 세 무한급수의 수렴반경 중 가장 큰 것과 가장 작은 것의 곱을 구하시오.\na. $\\!\\sum_{n=1}^{\\infty}\\dfrac{n!x^{n+1}}{n^n}$\nb. $\\!\\sum_{n=1}^{\\infty}\\dfrac{\\sqrt n\\,x^{2n}}{9^n}$\nc. $\\!\\sum_{n=1}^{\\infty}\\dfrac{(n!)^2 x^n}{(2n)!}$",
    options: [o("1","$e^2/2$"), o("2","$e^2$"), o("3","$2e$"), o("4","$4e$"), o("5","$8e$")],
    answer: 4,
    explanation: "a: $R=e$.\nb: $R=3$ (이차항).\nc: $R=4$.\n최대 $4$, 최소 $e$. 곱 $=4e$."
  }),
  build({
    num: 22, subject: "미분학", unit: "극한과 미분", concept: "함숫값·도함수 합", difficulty: "killer",
    question: "두 번 미분가능한 $f(x)$가 $f'(1)=2f'(2)\\ne 0$, $\\!\\displaystyle\\lim_{x\\to 1}\\dfrac{(f(2x)-1)^2}{(x-1)f(x)-\\ln x}=-2$를 만족할 때, $f(1)+f(2)+f'(1)+f'(2)$의 값을 구하시오.",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$1$"), o("3","$\\dfrac{3}{2}$"), o("4","$2$"), o("5","$0$")],
    answer: 1,
    explanation: "분모 $0\\to 0$이려면 $f(2)=1$. 로피탈 후 분자/분모 모두 $0$이 되도록 $f(1)=1$.\n다시 로피탈 → $f'(1)=-1$, $f'(2)=-1/2$.\n합 $=1+1-1-1/2=1/2$."
  }),
  build({
    num: 23, subject: "미분학", unit: "평균값 정리", concept: "도함수 무한대 극한 차분", difficulty: "easy",
    question: "$f$가 미분가능하고 $\\!\\displaystyle\\lim_{x\\to\\infty}f'(x)=3$일 때, $\\!\\displaystyle\\lim_{x\\to\\infty}[f(x+2)-f(x-2)]$를 구하시오.",
    options: [o("1","$0$"), o("2","$3$"), o("3","$12$"), o("4","$6$"), o("5","$\\infty$")],
    answer: 3,
    explanation: "평균값 정리: $f(x+2)-f(x-2)=4f'(c)$, $c\\to\\infty$.\n$4\\cdot 3=12$."
  }),
  build({
    num: 24, subject: "적분학", unit: "극좌표", concept: "심장형 - 원 교차 영역", difficulty: "killer",
    question: "극좌표로 $r=1+\\sin\\theta$의 내부와 $r=\\cos\\theta$의 외부로 이루어진 영역의 넓이를 구하시오.",
    options: [o("1","$\\pi$"), o("2","$2\\pi$"), o("3","$\\dfrac{14}{3}\\pi$"), o("4","$\\pi+1$"), o("5","$3e$")],
    answer: 4,
    explanation: "심장형 전체 넓이 $=\\dfrac{3\\pi}{2}$.\n공통영역 빼고 원의 절반 빼면 $\\pi+1$."
  }),
  build({
    num: 25, subject: "선형대수", unit: "복소수·수열", concept: "복소수 합 (1+√3i)/2", difficulty: "killer",
    question: "복소수 $z=\\dfrac{1+\\sqrt 3 i}{2}$에 대하여 $\\!\\displaystyle\\sum_{n=-1886}^{2019}(-1)^{n+\\delta(n)}z^n=a+b\\sqrt 3 i$일 때, $ab$의 값을 구하시오. (단, $a,b$는 실수, $\\delta(n)=0\\,(n\\ge 0),\\,1\\,(n<0)$)",
    options: [o("1","$\\pi+1$"), o("2","$2\\pi$"), o("3","$0$"), o("4","$e^2/2$"), o("5","$1$")],
    answer: 3,
    explanation: "$-z=e^{4\\pi i/3}$, $(-z)^3=1$.\n주기 3으로 합 계산 후 $a+b\\sqrt 3 i=2+0\\cdot\\sqrt 3 i$.\n$ab=0$."
  }),
  build({
    num: 26, subject: "적분학", unit: "삼중적분", concept: "원기둥좌표 삼중적분", difficulty: "medium",
    question: "$\\!\\displaystyle\\int_0^2\\!\\int_0^{2-z}\\!\\int_0^{\\sqrt{(2-z)^2-y^2}}\\!\\sqrt{9(x^2+y^2)}\\,dx\\,dy\\,dz$의 값을 계산하시오.",
    options: [o("1","$\\pi+1$"), o("2","$\\dfrac{14}{3}\\pi$"), o("3","$e^2/2$"), o("4","$3e$"), o("5","$2\\pi$")],
    answer: 5,
    explanation: "원기둥좌표: $r\\le 2-z$, $0\\le\\theta\\le\\pi/2$.\n$\\!\\int 3r\\cdot r\\,dr\\,d\\theta\\,dz=\\dfrac{\\pi}{2}\\!\\int_0^2(2-z)^3 dz=\\dfrac{\\pi}{2}\\cdot 4=2\\pi$."
  }),
  build({
    num: 27, subject: "적분학", unit: "곡선의 길이", concept: "공간곡선 길이", difficulty: "medium",
    question: "곡선 $z=y^2/2$와 곡면 $\\sqrt 3 e^{2x}=y$가 만나서 생기는 곡선 중 $1\\le y\\le e$인 부분의 길이를 구하시오.",
    options: [o("1","$\\pi+1$"), o("2","$\\dfrac{e-1}{2}$"), o("3","$\\dfrac{e^2+1}{2}$"), o("4","$\\dfrac{e^2}{2}$"), o("5","$3e$")],
    answer: 4,
    explanation: "$x=\\dfrac{1}{2}\\ln(y/\\sqrt 3)$.\n$r(t)=(\\dfrac{1}{2}\\ln(t/\\sqrt 3),t,t^2/2)$.\n$|r'|=\\sqrt{1/(4t^2)+1+t^2}=\\sqrt{(t+1/(2t))^2}=t+1/(2t)$.\n$L=\\!\\int_1^e(t+1/(2t))dt=\\dfrac{e^2-1}{2}+\\dfrac{1}{2}=\\dfrac{e^2}{2}$."
  }),
  build({
    num: 28, subject: "적분학", unit: "삼중적분", concept: "원뿔·구 사이 부피", difficulty: "medium",
    question: "$3$차원 공간에서 곡면 $z=\\sqrt{3(x^2+y^2)}$보다 위에 있고 구면 $x^2+y^2+z^2=4z$ 안에 있는 영역의 부피를 구하시오.",
    options: [o("1","$\\pi+1$"), o("2","$2\\pi$"), o("3","$3e$"), o("4","$\\dfrac{14}{3}\\pi$"), o("5","$8\\pi$")],
    answer: 4,
    explanation: "구면좌표: $\\rho=4\\cos\\phi$, $\\phi\\le\\pi/6$.\n$V=\\!\\int_0^{2\\pi}\\!\\int_0^{\\pi/6}\\!\\int_0^{4\\cos\\phi}\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta=\\dfrac{14\\pi}{3}$."
  }),
  build({
    num: 29, subject: "적분학", unit: "이중적분", concept: "치환적분 (삼각형 영역)", difficulty: "medium",
    question: "점 $(0,0),(1,0),(2,1)$을 꼭짓점으로 가지는 삼각형 영역 $A$에 대하여 $\\!\\displaystyle\\iint_A e^{(x-y)^2}\\,dx\\,dy$를 계산하시오.",
    options: [o("1","$\\pi+1$"), o("2","$\\dfrac{e-1}{2}$"), o("3","$\\dfrac{e^2}{2}$"), o("4","$3e$"), o("5","$\\dfrac{1}{2}$")],
    answer: 2,
    explanation: "$u=x-y,v=y$ 치환, $|J|=1$.\n$\\!\\int_0^1\\!\\int_0^u e^{u^2}dv\\,du=\\!\\int_0^1 u e^{u^2}du=\\dfrac{e-1}{2}$."
  }),
  build({
    num: 30, subject: "다변수함수", unit: "접평면", concept: "접평면 이면각 동일 조건", difficulty: "killer",
    question: "곡면 $S$가 $xy+2yz+2zx=28,\\,x>0,y>0,z>0$. 점 $(x_0,y_0,z_0)$의 접평면 $P$가 $xy,yz,xz$평면과 이루는 이면각 $\\theta_1,\\theta_2,\\theta_3$가 모두 같을 때, $x_0+y_0+z_0$의 값을 구하시오.",
    options: [o("1","$\\pi+1$"), o("2","$2\\pi$"), o("3","$3e$"), o("4","$8\\pi$"), o("5","$7$")],
    answer: 5,
    explanation: "법선벡터 $(y+2z,x+2z,2y+2x)\\parallel(1,1,1)$ → $y+2z=x+2z=2y+2x$.\n해: 비례 $(2,2,3)$. $4t^2+12t^2+12t^2=28$ ⇒ $t=1$, $(2,2,3)$.\n합 $=7$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) { console.error("ERROR:", error); process.exit(1); }
console.log(`Inserted ${data.length} 문항 (2020 이화여대):`, data.map((d) => d.id).join(", "));
