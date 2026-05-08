// Upload 2021년도 경기대 편입수학 기출 20문항 (26~45번, 4지선다)
// Usage: node scripts/upload_general_2021_kyonggi.mjs
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

const SCHOOL = "경기대";
const YEAR = "2021";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });

function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-kyonggi-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return {
    id, subject, unit, concept, difficulty,
    source_type: "imported", question, content_type: "latex", question_image: null,
    options, correct_option_id: String(answer), explanation,
    explanation_content_type: "latex", explanation_image: null, tags,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  };
}

const problems = [
  build({
    num: 26, subject: "미분학", unit: "극한과 연속", concept: "리만합 → 적분/로피탈", difficulty: "medium",
    question: "$\\displaystyle\\lim_{n\\to\\infty} n\\int_0^{1/n}\\cos^2 x\\,dx$의 값은?",
    options: [o("1","$0$"), o("2","$\\dfrac{1}{4}$"), o("3","$\\dfrac{1}{2}$"), o("4","$1$")],
    answer: 4,
    explanation: "$\\dfrac{1}{n}=t$로 치환하면 $\\lim_{t\\to 0^+}\\dfrac{\\int_0^t \\cos^2 x\\,dx}{t}$. $\\dfrac{0}{0}$ 꼴이므로 로피탈 정리: $\\lim_{t\\to 0^+}\\cos^2 t = 1$."
  }),
  build({
    num: 27, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피(원판 메서드)", difficulty: "medium",
    question: "직선 $y=2-x$와 곡선 $y=\\sqrt x$ 그리고 $y$축으로 둘러싸인 영역을 $x$축을 회전축으로 회전시켜 얻은 입체의 부피는?",
    options: [o("1","$\\dfrac{11}{6}\\pi$"), o("2","$2\\pi$"), o("3","$\\dfrac{13}{6}\\pi$"), o("4","$\\dfrac{7}{3}\\pi$")],
    answer: 1,
    explanation: "두 곡선 교점: $\\sqrt x = 2-x \\Rightarrow x=1$. 영역은 $0\\le x\\le 1$에서 $\\sqrt x$ 위쪽 + $1\\le x\\le 2$에서 $2-x$ 형태이지만 $y$축으로 둘러싸였으므로 $0\\le x\\le 1$만 고려. 원판: 위 곡선이 $y=2-x$, 아래 곡선이 $y=\\sqrt x$. $V=\\pi\\int_0^1[(2-x)^2 - (\\sqrt x)^2]dx = \\pi\\int_0^1(4-4x+x^2-x)dx = \\pi\\int_0^1(x^2-5x+4)dx = \\pi[\\tfrac{x^3}{3}-\\tfrac{5x^2}{2}+4x]_0^1 = \\pi(\\tfrac{1}{3}-\\tfrac{5}{2}+4) = \\dfrac{11\\pi}{6}$."
  }),
  build({
    num: 28, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "테일러 계수 = $f^{(n)}(a)/n!$", difficulty: "easyMedium",
    question: "$1$에서 함수 $f(x)=x^5+3x^2+2$의 테일러 급수에 대한 $(x-1)^5$의 계수는?",
    options: [o("1","$\\dfrac{1}{5!}$"), o("2","$\\dfrac{1}{5}$"), o("3","$1$"), o("4","$5!$")],
    answer: 3,
    explanation: "테일러 급수의 $(x-1)^5$ 계수 = $\\dfrac{f^{(5)}(1)}{5!}$. $f(x)=x^5+3x^2+2$의 5계 도함수: $f^{(5)}(x)=5!=120$ (상수). 따라서 계수 = $\\dfrac{5!}{5!}=1$."
  }),
  build({
    num: 29, subject: "다변수함수", unit: "중적분", concept: "적분 순서 변경 + 치환", difficulty: "medium",
    question: "이중적분 $\\displaystyle\\int_0^1\\!\\!\\int_{2y}^2 y e^{x^3}\\,dx\\,dy$의 값은?",
    options: [o("1","$\\dfrac{1}{6}(e^4-1)$"), o("2","$\\dfrac{1}{6}(e^8-1)$"), o("3","$\\dfrac{1}{24}(e^4-1)$"), o("4","$\\dfrac{1}{24}(e^8-1)$")],
    answer: 4,
    explanation: "적분 순서 변경: $0\\le y\\le 1,\\ 2y\\le x\\le 2$ → $0\\le x\\le 2,\\ 0\\le y\\le \\tfrac{x}{2}$. $\\int_0^2\\int_0^{x/2}y e^{x^3}dy\\,dx = \\int_0^2 \\dfrac{1}{2}\\cdot\\dfrac{x^2}{4}\\cdot e^{x^3}dx = \\dfrac{1}{8}\\int_0^2 x^2 e^{x^3}dx$. $u=x^3$로 치환($du=3x^2 dx$): $\\dfrac{1}{8}\\cdot\\dfrac{1}{3}[e^{x^3}]_0^2 = \\dfrac{e^8-1}{24}$."
  }),
  build({
    num: 30, subject: "적분학", unit: "추가내용", concept: "극곡선 교점(장미 + 원)", difficulty: "easyMedium",
    question: "편각 $\\theta$에 대한 극방정식 $r=\\cos(3\\theta)\\ (0\\le\\theta\\le\\pi)$와 $r=\\dfrac{1}{3}\\ (0\\le\\theta\\le 2\\pi)$로 주어진 두 곡선의 교점의 개수는?",
    options: [o("1","$2$"), o("2","$6$"), o("3","$8$"), o("4","$12$")],
    answer: 2,
    explanation: "$r=\\cos 3\\theta$는 $0\\le\\theta\\le\\pi$에서 3엽 장미 (3개의 꽃잎). 각 꽃잎과 원 $r=\\tfrac{1}{3}$의 교점을 세자. $\\cos 3\\theta = \\tfrac{1}{3}$의 해는 한 주기에서 2개. 3엽 → 각 꽃잎당 2개 교점 = 6개."
  }),
  build({
    num: 31, subject: "선형대수", unit: "행렬", concept: "행렬 성질 종합 판정", difficulty: "medium",
    question: "$A$가 임의의 $n\\times n$ (실)행렬일 때, 다음 중 옳지 않은 것은? (1) $A+A^T=O$이면 $\\det(A)=0$이다. (단, $O$는 영행렬이다.) (2) $\\det(A^T A)\\ge 0$이다. (3) $\\det((-1)^n A)=(-1)^n\\det(A)$이다. (4) $A$의 모든 성분이 정수이고 $\\det(A)=1$이면 $A^{-1}$의 모든 성분도 정수이다.",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)")],
    answer: 1,
    explanation: "(1) 거짓. $A=-A^T$이면 $|A|=|-A^T|=(-1)^n |A^T|=(-1)^n|A|$. $n$이 짝수면 $|A|=|A|$로 항등식이 되어 $|A|=0$이라 단정 못 함 (반례: $n=2$일 때 $A=\\begin{pmatrix}0&1\\\\-1&0\\end{pmatrix}$, $|A|=1\\ne 0$). (2) 참. $|A^T A|=|A^T||A|=|A|^2\\ge 0$. (3) 참. $|(-1)^n A|=((-1)^n)^n|A|$, $n$이 짝수면 $1\\cdot|A|$, 홀수면 $-|A|=(-1)^n|A|$로 둘 다 성립. (4) 참. $A^{-1}=\\dfrac{1}{|A|}\\text{adj}(A)$, $|A|=1$이면 $\\text{adj}(A)$만 남고 정수 성분."
  }),
  build({
    num: 32, subject: "선형대수", unit: "벡터공간", concept: "대칭행렬 부분공간 차원", difficulty: "easyMedium",
    question: "$2\\times 2$ (실)행렬로 이루어진 벡터 공간 $M_{2\\times 2}$의 부분공간 $\\{B\\in M_{2\\times 2}\\,|\\,B=B^T\\}$의 차원은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 3,
    explanation: "$n\\times n$ 대칭행렬의 차원 공식: $\\dfrac{n(n+1)}{2}$. $n=2$ 대입: $\\dfrac{2\\cdot 3}{2}=3$. (대각 2개 + 상삼각 비대각 1개 = 3개의 자유도)."
  }),
  build({
    num: 33, subject: "선형대수", unit: "행렬", concept: "수반행렬 행렬식($|\\text{adj}A|$)", difficulty: "easy",
    question: "$3\\times 3$행렬 $A$에 대하여 $\\det(A)=2$일 때, $\\det(\\text{adj}\\,A)$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$2$"), o("3","$\\dfrac{1}{4}$"), o("4","$4$")],
    answer: 4,
    explanation: "공식: $|\\text{adj}\\,A| = |A|^{n-1}$ ($n\\times n$ 행렬). $n=3,|A|=2$ 대입: $|\\text{adj}\\,A|=2^2=4$."
  }),
  build({
    num: 34, subject: "선형대수", unit: "벡터공간", concept: "직선 수직(기울기 곱 = -1)", difficulty: "easy",
    question: "<보기>에서 서로 수직인 두 직선을 고르면? 가. $3x-5y=2$  나. $2x+3y=5$  다. $x-2y=4$  라. $2x+y=3$",
    options: [o("1","가, 나"), o("2","나, 다"), o("3","다, 라"), o("4","서로 수직인 두 직선은 없다.")],
    answer: 3,
    explanation: "직선 $ax+by=c$의 기울기 = $-\\tfrac{a}{b}$. 가: $\\tfrac{3}{5}$, 나: $-\\tfrac{2}{3}$, 다: $\\tfrac{1}{2}$, 라: $-2$. 두 직선이 수직이려면 기울기의 곱이 $-1$. 다·라: $\\tfrac{1}{2}\\cdot(-2)=-1$ ✓. 정답 (3)."
  }),
  build({
    num: 35, subject: "선형대수", unit: "행렬", concept: "행렬급수 수렴구간(대각)", difficulty: "medium",
    question: "$A(x)=\\begin{pmatrix}2x & 0 \\\\ 0 & 2-x\\end{pmatrix}$일 때, 행렬급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{1}{4^n n}[A(x)]^n$이 수렴하는 구간 중 옳은 것은?",
    options: [o("1","$(-2,2)$"), o("2","$[-2,2)$"), o("3","$[-2,6]$"), o("4","$(-2,6]$")],
    answer: 1,
    explanation: "대각행렬이므로 $A^n=\\begin{pmatrix}(2x)^n & 0 \\\\ 0 & (2-x)^n\\end{pmatrix}$. (1,1)성분: $\\sum\\dfrac{(2x)^n}{4^n n}=\\sum\\dfrac{(x/2)^n}{n}$, $|x/2|<1$인 $x$에서 수렴, $|x|<2$. 끝점 $x=-2$ 수렴(교대), $x=2$ 발산. 즉 $[-2,2)$. (2,2)성분: $\\sum\\dfrac{(2-x)^n}{4^n n}=\\sum\\dfrac{((2-x)/4)^n}{n}$, $|2-x|<4$ 즉 $-2<x<6$. 끝점 $x=-2$ 발산, $x=6$ 수렴. 즉 $(-2,6]$. 두 구간 교집합 $(-2,2)$."
  }),
  build({
    num: 36, subject: "적분학", unit: "정적분의 계산", concept: "이상적분/극한 명제 판정", difficulty: "mediumHard",
    question: "<보기>에서 참인 것을 모두 고르면? 가. $\\displaystyle\\lim_{n\\to\\infty}\\!\\left(\\int_{-1}^{-1/n}\\dfrac{1}{x}dx + \\int_{1/n}^{1}\\dfrac{1}{x}dx\\right)=0$이다. 나. $\\displaystyle\\int_{-1}^{1}\\dfrac{1}{x}dx=0$이다. 다. 함수 $f:(0,\\infty)\\to\\mathbb R$가 증가함수이고 이상적분 $\\int_0^{\\infty}f(x)dx$가 수렴하면 $\\displaystyle\\lim_{x\\to\\infty}f(x)=0$이다. 라. 함수 $f:(0,\\infty)\\to\\mathbb R$에 대한 이상적분 $\\int_0^{\\infty}|f(x)|dx$가 수렴하면 $\\displaystyle\\lim_{x\\to\\infty}f(x)=0$이다.",
    options: [o("1","가, 나"), o("2","가, 다"), o("3","가, 다, 라"), o("4","가, 나, 다, 라")],
    answer: 2,
    explanation: "가. 참(코시 주값). 대칭으로 두 적분 합 = 0. 나. 거짓. $\\int_{-1}^1\\tfrac{1}{x}dx$는 발산(특이점 0). 다. 참. 증가함수이면서 이상적분 수렴 → 함수 자체가 0으로 수렴해야 함. 라. 거짓. 반례: $f(x)=1$ ($x$가 자연수일 때), 0(아닐 때)이면 적분 = 0이지만 극한은 존재 X. 정답 가, 다."
  }),
  build({
    num: 37, subject: "적분학", unit: "급수의 수렴/발산", concept: "부분분수 급수", difficulty: "mediumHard",
    question: "모든 실수 $x$에 대하여 $f(x)=[x^2]$라 하고, 각 자연수 $n$에 대하여 $a_n$을 구간 $(-n,n)$에서 $f$의 불연속점의 개수라 할 때, $\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{1}{a_n}$의 값은? (단, $[x]$는 $x$를 넘지 않는 최대 정수이다.)",
    options: [o("1","$\\dfrac{3}{8}$"), o("2","$\\dfrac{1}{2}$"), o("3","$\\dfrac{5}{8}$"), o("4","$\\dfrac{3}{4}$")],
    answer: 1,
    explanation: "$f(x)=[x^2]$의 불연속점은 $x^2$이 정수가 되는 $x$. $(0,n)$에서 $x=\\sqrt 1,\\sqrt 2,\\ldots,\\sqrt{n^2-1}$의 $n^2-1$개. 우함수 대칭이라 $(-n,n)$에서 $a_n=2(n^2-1)$. $\\sum_{n=2}^{\\infty}\\dfrac{1}{2(n^2-1)} = \\dfrac{1}{4}\\sum_{n=2}^{\\infty}\\!\\left(\\dfrac{1}{n-1}-\\dfrac{1}{n+1}\\right)$ (부분분수). 망원합으로 $\\dfrac{1}{4}(1+\\tfrac{1}{2})=\\dfrac{3}{8}$."
  }),
  build({
    num: 38, subject: "미분학", unit: "도함수의 응용", concept: "샌드위치 정리 + 미분", difficulty: "medium",
    question: "세 함수 $f,g,h:\\mathbb R\\to\\mathbb R$가 <보기>의 성질을 만족할 때, $f'(1)$의 값은? 가. 모든 실수 $x$에 대하여 $g(x)\\le f(x)\\le h(x)$이다. 나. $\\displaystyle\\lim_{x\\to 1}g(x)=\\lim_{x\\to 1}h(x)$이다. 다. $f'(1)$이 존재한다. 라. 모든 실수 $x$에 대하여 $h(x)=x\\tan^{-1}x$이다.",
    options: [o("1","$\\dfrac{1}{4}+\\dfrac{\\pi}{4}$"), o("2","$\\dfrac{1}{4}+\\dfrac{\\pi}{2}$"), o("3","$\\dfrac{1}{2}+\\dfrac{\\pi}{2}$"), o("4","$\\dfrac{1}{2}+\\dfrac{\\pi}{4}$")],
    answer: 4,
    explanation: "샌드위치 정리: $g\\le f\\le h$이고 $g(1)=h(1)$이면 $f(1)$도 같음. 게다가 $f'(1)=h'(1)$가 성립할 조건은 미분의 평균값/Squeeze 정리에 의해. $h(x)=x\\tan^{-1}x$ 미분: $h'(x)=\\tan^{-1}x+\\dfrac{x}{1+x^2}$. $h'(1)=\\tan^{-1}1+\\dfrac{1}{2}=\\dfrac{\\pi}{4}+\\dfrac{1}{2}$."
  }),
  build({
    num: 39, subject: "다변수함수", unit: "편도함수", concept: "방향도함수 (연립)", difficulty: "mediumHard",
    question: "함수 $f:\\mathbb R^2\\to\\mathbb R$가 근방에서 미분 가능하고 벡터 $\\vec v=\\!\\left(\\dfrac{2}{\\sqrt 5},\\dfrac{1}{\\sqrt 5}\\right),\\ \\vec w=\\!\\left(-\\dfrac{1}{\\sqrt 2},\\dfrac{1}{\\sqrt 2}\\right)$에 대한 방향도함수가 $D_v f(0,0)=\\dfrac{3}{\\sqrt 5},\\ D_w f(0,0)=-\\dfrac{1}{\\sqrt 2}$일 때, 벡터 $\\vec u=\\!\\left(\\dfrac{3}{\\sqrt{10}},\\dfrac{1}{\\sqrt{10}}\\right)$에 대한 방향도함수 $D_u f(0,0)$의 값은?",
    options: [o("1","$\\dfrac{11}{3\\sqrt{10}}$"), o("2","$\\dfrac{4}{\\sqrt{10}}$"), o("3","$\\dfrac{13}{3\\sqrt{10}}$"), o("4","$\\dfrac{14}{3\\sqrt{10}}$")],
    answer: 3,
    explanation: "방향도함수 = 경도와 단위벡터의 내적. $D_v f = \\dfrac{2}{\\sqrt 5}f_x+\\dfrac{1}{\\sqrt 5}f_y = \\dfrac{3}{\\sqrt 5}$ → $2f_x+f_y=3$. $D_w f = -\\dfrac{1}{\\sqrt 2}f_x+\\dfrac{1}{\\sqrt 2}f_y = -\\dfrac{1}{\\sqrt 2}$ → $-f_x+f_y=-1$. 연립: $f_x=\\tfrac{4}{3},\\ f_y=\\tfrac{1}{3}$. $D_u f = \\dfrac{3}{\\sqrt{10}}\\cdot\\tfrac{4}{3}+\\dfrac{1}{\\sqrt{10}}\\cdot\\tfrac{1}{3} = \\dfrac{4}{\\sqrt{10}}+\\dfrac{1}{3\\sqrt{10}} = \\dfrac{12+1}{3\\sqrt{10}}=\\dfrac{13}{3\\sqrt{10}}$."
  }),
  build({
    num: 40, subject: "적분학", unit: "급수의 수렴/발산", concept: "비교/극한비교 정확한 조건", difficulty: "medium",
    question: "양항급수 $\\sum_{n=1}^{\\infty} a_n$이 수렴할 때, <보기>에서 항상 참인 것을 모두 고르면? 가. 모든 자연수 $n$에 대하여 $b_n\\le a_n$이면 급수 $\\sum b_n$은 수렴한다. 나. 모든 자연수 $n$에 대하여 $b_n>a_n$이면 급수 $\\sum b_n$은 발산한다. 다. 모든 자연수 $n$에 대하여 $b_n>0$이고 $\\displaystyle\\lim_{n\\to\\infty}\\dfrac{a_n}{b_n}=c$인 양수 $c$가 존재하면 급수 $\\sum b_n$은 수렴한다.",
    options: [o("1","가, 다"), o("2","다"), o("3","나"), o("4","가")],
    answer: 2,
    explanation: "가. 거짓. 비교판정법은 두 급수 모두 양항이어야 함. $b_n$이 음수일 수 있어 반례 가능. 나. 거짓. $b_n>a_n>0$이어도 작은 쪽이 수렴이라 큰 쪽은 알 수 없음. 다. 참. 극한비교판정법: 두 양항급수가 같은 수렴/발산 거동을 함. $a_n$이 수렴 → $b_n$도 수렴. 정답 다만."
  }),
  build({
    num: 41, subject: "선형대수", unit: "고유치와 대각화", concept: "닮음 행렬 성질", difficulty: "medium",
    question: "행렬 $A$와 행렬 $\\begin{pmatrix}1&0&0\\\\0&2&0\\\\0&0&2\\end{pmatrix}$가 닮음일 때, 다음 중 옳지 않은 것은? (1) $A$는 가역행렬이다. (2) $A$의 고윳값은 $1,2$이다. (3) $A$의 각 고윳값에 대응하는 고유공간의 차원은 알 수 없다. (4) $\\det(A^{-1})=\\dfrac{1}{4}$이다.",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)")],
    answer: 3,
    explanation: "닮음 → 같은 고윳값. 주어진 행렬의 $|D|=4\\ne 0$이므로 $|A|=4$, 가역. (1) 참. (2) 고윳값 $1,2,2$로 서로 다른 값 $1,2$. 참. (4) $|A^{-1}|=\\dfrac{1}{|A|}=\\dfrac{1}{4}$. 참. (3) 거짓. 닮음이면 같은 대각화 형태이므로 각 고유치의 기하학적 중복도(고유공간 차원)도 같음. $\\lambda=1$의 차원=1, $\\lambda=2$의 차원=2로 알 수 있음."
  }),
  build({
    num: 42, subject: "선형대수", unit: "고유치와 대각화", concept: "이차형식 표준형", difficulty: "mediumHard",
    question: "다음 중 곡선 $2x^2+2xy+2y^2=6$의 그래프와 합동인 그래프를 갖는 곡선의 방정식은?",
    options: [o("1","$4x^2+y^2=6$"), o("2","$3x^2+y^2=6$"), o("3","$2x^2+y^2=6$"), o("4","$x^2+y^2=6$")],
    answer: 2,
    explanation: "이차형식 $2x^2+2xy+2y^2 = (x,y)\\!\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}\\!\\binom{x}{y}$. 행렬 $\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$의 고윳값: $(2-\\lambda)^2-1=0 \\Rightarrow \\lambda=1$ 또는 $\\lambda=3$. 직교 대각화 후 새 좌표 $(X,Y)$에서 $3X^2+Y^2=6$. 합동인 표준형."
  }),
  build({
    num: 43, subject: "선형대수", unit: "고유치와 대각화", concept: "고윳값 합/제곱합", difficulty: "medium",
    question: "고윳값이 $\\lambda_1,\\lambda_2,\\lambda_3$인 $3\\times 3$행렬 $A$에 대하여 $\\text{tr}(A^2)=3$이고 $\\text{tr}(A)=1$일 때, $\\lambda_1\\lambda_2+\\lambda_1\\lambda_3+\\lambda_2\\lambda_3$의 값은?",
    options: [o("1","$-1$"), o("2","$0$"), o("3","$1$"), o("4","$3$")],
    answer: 1,
    explanation: "$\\text{tr}(A^2)=\\lambda_1^2+\\lambda_2^2+\\lambda_3^2=3$, $\\text{tr}(A)=\\lambda_1+\\lambda_2+\\lambda_3=1$. 항등식: $(\\lambda_1+\\lambda_2+\\lambda_3)^2 = \\lambda_1^2+\\lambda_2^2+\\lambda_3^2 + 2(\\lambda_1\\lambda_2+\\lambda_1\\lambda_3+\\lambda_2\\lambda_3)$. $1 = 3 + 2S \\Rightarrow S = -1$."
  }),
  build({
    num: 44, subject: "선형대수", unit: "행렬", concept: "상삼각/대칭/직교 닮음", difficulty: "medium",
    question: "(실)행렬 $A$가 상삼각행렬일 때, <보기>에서 항상 참인 것을 모두 고르면? 가. $A$가 가역행렬일 때, $A^{-1}$도 상삼각행렬이다. 나. $A$가 가역일 필요충분조건은 $A$의 주 대각성분의 곱이 $0$이 아닌 것이다. 다. $B$가 대칭행렬일 때, $A$와 $B$가 직교닮음이면 $A$는 대각행렬이다.",
    options: [o("1","가, 나"), o("2","가, 다"), o("3","나, 다"), o("4","가, 나, 다")],
    answer: 4,
    explanation: "가. 참. 상삼각의 역행렬도 상삼각(가우스 소거 패턴 보존). 나. 참. 상삼각행렬 행렬식 = 대각원소들의 곱. 다. 참. $A=P^T B P$ ($P$ 직교)이고 $B$가 대칭이면 양변 전치하면 $A^T=P^T B^T P=P^T B P=A$, 즉 $A$도 대칭. 상삼각이면서 대칭은 대각행렬."
  }),
  build({
    num: 45, subject: "선형대수", unit: "벡터공간", concept: "선형사상 단사/전사/위수", difficulty: "medium",
    question: "$A$가 $m\\times n$행렬일 때, 선형사상 $T:\\mathbb R^n\\to\\mathbb R^m$을 모든 $x\\in\\mathbb R^n$에 대하여 $T(x)=Ax$로 정의하자. 이 때, <보기>에서 항상 참인 것을 모두 고르면? 가. $m<n$이고 $A$의 위수($\\text{rank}$)가 $m$이면 $T$는 일대일(one-to-one)선형사상이다. 나. $n<m$이고 $A$의 위수($\\text{rank}$)가 $n$이면 $T$는 위로(onto)선형사상이다. 다. $m=n$이고 $A$의 위수($\\text{rank}$)가 $n$이면 $T$는 일대일대응(one-to-one correspondence)선형사상이다.",
    options: [o("1","가, 나"), o("2","다"), o("3","가, 다"), o("4","가, 나, 다")],
    answer: 2,
    explanation: "Rank-Nullity 정리: $\\text{rank}+\\text{nullity}=n$. 가. 거짓. $m<n,\\ \\text{rank}=m$이면 $\\text{nullity}=n-m>0$이라 핵 살아있음 → 단사 X. 나. 거짓. $n<m,\\ \\text{rank}=n$이면 핵=0이라 단사이지만, 상의 차원 $=n<m$이라 전사 X. 다. 참. $m=n,\\ \\text{rank}=n$이면 핵=0(단사) + 상의 차원 $=n=m$(전사) → 전단사. 정답 다만."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error(error); process.exit(1); }
console.log("Inserted:");
for (const r of data) console.log(`  - ${r.id}  [${r.subject}/${r.unit}/${r.difficulty}]`);
