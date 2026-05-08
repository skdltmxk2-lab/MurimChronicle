// Upload 2019년도 경기대 편입수학 기출 20문항 (26~45번, 4지선다)
// Usage: node scripts/upload_general_2019_kyonggi.mjs
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
const YEAR = "2019";
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
    num: 26, subject: "미분학", unit: "극한과 연속", concept: "원시함수/연속/도함수 명제", difficulty: "medium",
    question: "임의의 함수 $f:\\mathbb R\\to\\mathbb R$에 대하여, <보기>에서 옳은 것을 모두 고르면? 가. $f$의 원시함수가 $\\mathbb R$에서 존재하면 $f$는 $\\mathbb R$에서 연속함수이다. 나. $f$가 $\\mathbb R$에서 연속함수이면 $f$의 원시함수가 $\\mathbb R$에서 존재한다. 다. $f$의 도함수가 $\\mathbb R$에서 존재하면 $f$는 $\\mathbb R$에서 연속함수이다. 라. $f$가 $\\mathbb R$에서 연속함수이면 $f$의 도함수가 $\\mathbb R$에서 존재한다.",
    options: [o("1","가, 나"), o("2","다, 라"), o("3","나, 다"), o("4","가, 라")],
    answer: 3,
    explanation: "가. 거짓. 반례: $f(x)=[x]$는 $F(x)=\\int [x]dx$가 구간별 정의될 수 있지만 $f$ 자체는 불연속. 나. 참. 연속함수는 항상 원시함수(부정적분) 존재. 다. 참. 미분가능 → 연속. 라. 거짓. 연속이라고 미분가능한 것은 아니다($|x|$가 반례). 정답 나, 다."
  }),
  build({
    num: 27, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "원판 위 최댓값/최솟값", difficulty: "medium",
    question: "영역 $\\{(x,y)\\in\\mathbb R^2\\,|\\,x^2+y^2\\le 1\\}$에서 함수 $f(x,y)=x^4-y^4$의 최댓값과 최솟값의 곱은?",
    options: [o("1","$-1$"), o("2","$-\\dfrac{1}{2}$"), o("3","$0$"), o("4","$1$")],
    answer: 1,
    explanation: "내부 임계점: $f_x=4x^3=0,\\ f_y=-4y^3=0 \\Rightarrow (0,0)$, $f(0,0)=0$. 경계 $x^2+y^2=1$: $x=\\cos\\theta,y=\\sin\\theta$ 대입, $f=\\cos^4\\theta-\\sin^4\\theta=(\\cos^2-\\sin^2)(\\cos^2+\\sin^2)=\\cos 2\\theta$. 범위 $[-1,1]$. 따라서 전체 최댓값 1, 최솟값 -1. 곱 $-1$."
  }),
  build({
    num: 28, subject: "미분학", unit: "도함수의 응용", concept: "역함수의 미분", difficulty: "easyMedium",
    question: "함수 $f(x)=\\sqrt x+\\ln(x-3)$의 역함수를 $g$라 할 때, $g'(2)$의 값은?",
    options: [o("1","$\\dfrac{4}{5}$"), o("2","$\\dfrac{3}{5}$"), o("3","$\\dfrac{2}{5}$"), o("4","$\\dfrac{1}{5}$")],
    answer: 1,
    explanation: "역함수 미분: $g'(2)=\\dfrac{1}{f'(g(2))}$. $f(x)=2$인 $x$를 찾자: $\\sqrt x+\\ln(x-3)=2$. $x=4$ 시도: $2+\\ln 1=2$ ✓. 즉 $g(2)=4$. $f'(x)=\\dfrac{1}{2\\sqrt x}+\\dfrac{1}{x-3}$. $f'(4)=\\tfrac{1}{4}+1=\\tfrac{5}{4}$. $g'(2)=\\dfrac{1}{5/4}=\\dfrac{4}{5}$."
  }),
  build({
    num: 29, subject: "미분학", unit: "극한과 연속", concept: "$1^\\infty$ 형 극한", difficulty: "medium",
    question: "극한 $\\displaystyle\\lim_{x\\to\\infty}\\!\\left(\\cos\\dfrac{1}{x}\\right)^x$의 값은?",
    options: [o("1","$1$"), o("2","$e$"), o("3","$\\dfrac{1}{e}$"), o("4","$0$")],
    answer: 1,
    explanation: "$1^\\infty$ 꼴. $L=\\lim x\\ln(\\cos\\tfrac{1}{x})$. $\\tfrac{1}{x}=t$로 치환하면 $L=\\lim_{t\\to 0^+}\\dfrac{\\ln\\cos t}{t}$. 로피탈: $L=\\lim\\dfrac{-\\sin t/\\cos t}{1}=0$. 따라서 답 $e^0=1$."
  }),
  build({
    num: 30, subject: "다변수함수", unit: "추가내용", concept: "매개곡선 호의 길이", difficulty: "medium",
    question: "매개변수 방정식 $x(t)=\\sin^3 t,\\ y(t)=\\cos^3 t-3\\cos t\\ (0\\le t\\le \\pi)$로 주어진 평면곡선의 길이는?",
    options: [o("1","$3\\pi$"), o("2","$\\dfrac{3\\pi}{2}$"), o("3","$5\\pi$"), o("4","$\\dfrac{5\\pi}{2}$")],
    answer: 2,
    explanation: "$x'=3\\sin^2 t\\cos t$, $y'=-3\\cos^2 t\\sin t+3\\sin t = 3\\sin t(1-\\cos^2 t)=3\\sin^3 t$. $(x')^2+(y')^2 = 9\\sin^4 t\\cos^2 t + 9\\sin^6 t = 9\\sin^4 t(\\cos^2 t+\\sin^2 t)=9\\sin^4 t$. $\\sqrt{}=3\\sin^2 t$ ($\\sin t\\ge 0$). 호의 길이 = $\\int_0^{\\pi}3\\sin^2 t\\,dt = 3\\cdot\\dfrac{\\pi}{2}=\\dfrac{3\\pi}{2}$."
  }),
  build({
    num: 31, subject: "선형대수", unit: "고유치와 대각화", concept: "trace/det 고유치", difficulty: "easyMedium",
    question: "$2\\times 2$ 실행렬 $A$가 대칭행렬이고 $\\text{tr}(A^2)=10,\\ \\det(A)=-3$일 때, $(\\text{tr}(A))^2$의 값은?",
    options: [o("1","$1$"), o("2","$4$"), o("3","$9$"), o("4","$16$")],
    answer: 2,
    explanation: "고윳값 $a,b$로 두면 $\\text{tr}(A^2)=a^2+b^2=10$, $\\det A=ab=-3$. $(\\text{tr}A)^2 = (a+b)^2 = a^2+2ab+b^2 = 10+2\\cdot(-3) = 10-6 = 4$."
  }),
  build({
    num: 32, subject: "선형대수", unit: "행렬", concept: "선형성으로 행렬·벡터 곱", difficulty: "medium",
    question: "$3\\times 3$ 행렬 $A$에 대하여 $A\\binom{1}{1\\ 1}=\\binom{1}{2\\ 3},\\ A\\binom{-1}{1\\ -1}=\\binom{4}{5\\ 6}$일 때, 벡터 $A\\binom{-1}{5\\ -1}$의 모든 성분의 합은?",
    options: [o("1","$0$"), o("2","$13$"), o("3","$26$"), o("4","$57$")],
    answer: 4,
    explanation: "$\\binom{-1}{5\\ -1}=a\\binom{1}{1\\ 1}+b\\binom{-1}{1\\ -1}$ 풀이. 셋째 성분: $a-b=-1$. 둘째: $a+b=5$. 연립: $a=2,b=3$. 따라서 $A\\binom{-1}{5\\ -1}=2A\\binom{1}{1\\ 1}+3A\\binom{-1}{1\\ -1}=2\\binom{1}{2\\ 3}+3\\binom{4}{5\\ 6}=\\binom{14}{19\\ 24}$. 합 = $14+19+24=57$."
  }),
  build({
    num: 33, subject: "선형대수", unit: "행렬", concept: "행렬식 행/열 교환 성질", difficulty: "easyMedium",
    question: "다음 중 행렬식 $\\begin{vmatrix}a&b&c\\\\d&e&f\\\\g&h&i\\end{vmatrix}^T$과 항상 같은 것은?",
    options: [
      o("1","$\\begin{vmatrix}b&a&c\\\\e&d&f\\\\h&g&i\\end{vmatrix}$"),
      o("2","$\\begin{vmatrix}a&d&g\\\\d&f&e\\\\g&i&h\\end{vmatrix}$"),
      o("3","$\\begin{vmatrix}d&a&g\\\\e&b&h\\\\f&c&i\\end{vmatrix}$"),
      o("4","$\\begin{vmatrix}e&b&h\\\\d&a&g\\\\f&c&i\\end{vmatrix}$")
    ],
    answer: 4,
    explanation: "전치 행렬식 = 원래 행렬식 = $\\begin{vmatrix}a&d&g\\\\b&e&h\\\\c&f&i\\end{vmatrix}$. 1열과 2열을 교환(부호 -): $-\\begin{vmatrix}d&a&g\\\\e&b&h\\\\f&c&i\\end{vmatrix}$. 다시 1행과 2행을 교환(부호 -): $\\begin{vmatrix}e&b&h\\\\d&a&g\\\\f&c&i\\end{vmatrix}$. 정답 (4)."
  }),
  build({
    num: 34, subject: "선형대수", unit: "고유치와 대각화", concept: "정규직교 고유벡터 노름", difficulty: "medium",
    question: "$A$는 실대칭행렬이고 $\\vec v_1,\\vec v_2$는 각각 고윳값 1과 2에 대응하는 $A$의 단위고유벡터일 때, $|4\\vec v_1-3\\vec v_2|$의 크기는?",
    options: [o("1","$3$"), o("2","$4$"), o("3","$5$"), o("4","$6$")],
    answer: 3,
    explanation: "대칭행렬의 서로 다른 고윳값 고유벡터는 직교 → $\\vec v_1\\cdot\\vec v_2=0$. $|4\\vec v_1-3\\vec v_2|^2 = 16|\\vec v_1|^2 - 24\\vec v_1\\cdot\\vec v_2 + 9|\\vec v_2|^2 = 16+0+9=25$. $|4\\vec v_1-3\\vec v_2|=5$."
  }),
  build({
    num: 35, subject: "선형대수", unit: "행렬", concept: "행렬식 성질 판정", difficulty: "easyMedium",
    question: "임의의 정사각행렬 $A$와 $B$에 대하여 <보기>에서 옳은 것을 모두 고르면? 가. $\\det(A)=\\det(A^T)$. 나. $\\det(AB)=0$이면 $\\det(A)=0$ 또는 $\\det(B)=0$이다. 다. $\\det(A^2)=1$이면 $\\det(A)=1$이다. 라. $\\det(-A)=-\\det(A)$.",
    options: [o("1","가"), o("2","가, 나"), o("3","나, 다"), o("4","나, 다, 라")],
    answer: 2,
    explanation: "가. 참. 전치 행렬식 같음. 나. 참. $\\det(AB)=\\det A\\det B=0$이면 둘 중 적어도 하나가 0. 다. 거짓. $\\det(A^2)=(\\det A)^2=1 \\Rightarrow \\det A=\\pm 1$. 라. 거짓. $\\det(-A)=(-1)^n\\det A$, $n$ 짝수면 $\\det A$. 정답 가, 나."
  }),
  build({
    num: 36, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "지수함수 급수 (소수 자리)", difficulty: "medium",
    question: "$e^{0.1}$의 소수점 이하 셋째자리의 수는?",
    options: [o("1","$4$"), o("2","$5$"), o("3","$6$"), o("4","$7$")],
    answer: 2,
    explanation: "$e^x=1+x+\\dfrac{x^2}{2!}+\\dfrac{x^3}{3!}+\\cdots$. $x=0.1$: $1+0.1+0.005+\\dfrac{0.001}{6}+\\cdots=1.105+0.000166\\cdots = 1.1051\\cdots$. 소수점 이하 첫째자리 $1$, 둘째 $0$, 셋째 $5$."
  }),
  build({
    num: 37, subject: "적분학", unit: "정적분의 계산", concept: "이상적분 수렴/발산", difficulty: "medium",
    question: "<보기>의 이상적분 중 수렴하는 것을 모두 고르면? 가. $\\displaystyle\\int_0^1\\dfrac{1}{x(\\ln x)}dx$  나. $\\displaystyle\\int_0^1\\dfrac{1}{x(\\ln x)^2}dx$  다. $\\displaystyle\\int_0^1\\dfrac{\\sin x}{x}dx$  라. $\\displaystyle\\int_0^1\\dfrac{1}{x^{1/2}}dx$",
    options: [o("1","가, 나, 다, 라"), o("2","나, 다, 라"), o("3","다, 라"), o("4","라")],
    answer: 3,
    explanation: "가. $\\ln x=-t$ 치환($x=0\\to t=\\infty,\\ x=1\\to t=0$): $\\int_0^{\\infty}\\dfrac{1}{t}dt$ → 발산. 나. 같은 치환: $\\int_0^{\\infty}\\dfrac{1}{t^2}dt$ → $0$ 근처 발산. 발산. 다. $\\dfrac{\\sin x}{x}\\to 1$ ($x\\to 0$)이라 적분 영역에서 유한 → 수렴. 라. $p=\\tfrac{1}{2}<1$ → $0$ 근처 수렴. 정답 다, 라."
  }),
  build({
    num: 38, subject: "다변수함수", unit: "선적분과 면적분", concept: "그린정리 응용", difficulty: "mediumHard",
    question: "반시계 방향 유향곡선 $C=\\{(\\cos\\theta,\\sin\\theta)\\,|\\,0\\le\\theta\\le\\pi\\}$ 위의 선적분 $\\displaystyle\\int_C y(1+\\cos(xy))dx - \\int_C x(1-\\cos(xy))dy$의 값은?",
    options: [o("1","$\\pi/2$"), o("2","$-\\pi/2$"), o("3","$\\pi$"), o("4","$-\\pi$")],
    answer: 4,
    explanation: "곡선 $C$(반원)는 열린 곡선. $C$의 두 끝점 $(1,0),(-1,0)$을 잇는 선분 $C_2$를 추가해 폐곡선 만들고 그린정리. $M=y(1+\\cos xy),\\ N=-x(1-\\cos xy)$. $\\dfrac{\\partial N}{\\partial x}-\\dfrac{\\partial M}{\\partial y}$ 계산 후 면적분. 결과적으로 폐곡선 적분 = $-2\\cdot\\tfrac{\\pi}{2}=-\\pi$, $C_2$ 적분 = 0이므로 $C$ 적분 = $-\\pi$."
  }),
  build({
    num: 39, subject: "다변수함수", unit: "중적분", concept: "야코비안 변환(평행사변형)", difficulty: "mediumHard",
    question: "영역 $D=\\{(x,y)\\in\\mathbb R^2\\,|\\,|x|+|y|\\le 1\\}$에서 이중적분 $\\displaystyle\\iint_D \\sin(x+y)\\cos(x-y)\\,dx\\,dy$의 값은?",
    options: [o("1","$-1$"), o("2","$0$"), o("3","$1$"), o("4","$2$")],
    answer: 2,
    explanation: "치환 $u=x+y,\\ v=x-y$: 야코비안 $|J|=\\dfrac{1}{2}$. 새 영역: $|u|+|v|\\le \\cdots$이지만 영역 $|x|+|y|\\le 1$은 $-1\\le u\\le 1,-1\\le v\\le 1$의 정사각형으로 변환. 적분 = $\\dfrac{1}{2}\\int_{-1}^1\\!\\int_{-1}^1 \\sin u\\cos v\\,du\\,dv = \\dfrac{1}{2}[\\int_{-1}^1\\sin u\\,du]\\cdot[\\int_{-1}^1\\cos v\\,dv] = \\dfrac{1}{2}\\cdot 0\\cdot[\\sin v]_{-1}^1 = 0$ (sin은 기함수)."
  }),
  build({
    num: 40, subject: "다변수함수", unit: "추가내용", concept: "파푸스 정리(원 회전)", difficulty: "medium",
    question: "원 $(x-2)^2+y^2=1$의 내부를 $y$축을 회전축으로 회전시켰을 때, 얻은 입체의 부피는?",
    options: [o("1","$\\pi^2$"), o("2","$2\\pi^2$"), o("3","$3\\pi^2$"), o("4","$4\\pi^2$")],
    answer: 4,
    explanation: "파푸스 정리: $V=$ (영역 면적) × (중심의 이동거리). 영역 = 반지름 1의 원, 면적 $\\pi$. 중심 $(2,0)$의 $y$축 회전 시 이동거리 = $2\\pi\\cdot 2=4\\pi$. $V=\\pi\\cdot 4\\pi=4\\pi^2$."
  }),
  build({
    num: 41, subject: "선형대수", unit: "벡터공간", concept: "내적공간 사잇각(함수)", difficulty: "medium",
    question: "벡터공간 $\\{f:[-2,2]\\to\\mathbb R\\,|\\,f$는 연속$\\}$의 내적을 $\\langle f,g\\rangle = \\int_{-2}^2 f(x)g(x)\\,dx$로 정의하자. $f(x)=1-x,\\ g(x)=1+x$이고 $f$와 $g$의 사잇각을 $\\theta\\ (0\\le\\theta\\le\\pi)$라 할 때, $\\cos\\theta$의 값은?",
    options: [o("1","$-\\dfrac{1}{7}$"), o("2","$-\\dfrac{28}{3}$"), o("3","$\\dfrac{1}{7}$"), o("4","$\\dfrac{28}{3}$")],
    answer: 1,
    explanation: "$\\langle f,f\\rangle=\\int_{-2}^2(1-x)^2 dx = \\dfrac{28}{3}$. $\\langle g,g\\rangle=\\int_{-2}^2(1+x)^2 dx = \\dfrac{28}{3}$. $\\langle f,g\\rangle=\\int_{-2}^2(1-x^2)dx = [x-\\tfrac{x^3}{3}]_{-2}^2 = (2-\\tfrac{8}{3})-(-2+\\tfrac{8}{3}) = -\\dfrac{4}{3}$. $\\cos\\theta=\\dfrac{-4/3}{\\sqrt{28/3}\\cdot\\sqrt{28/3}}=\\dfrac{-4/3}{28/3}=-\\dfrac{1}{7}$."
  }),
  build({
    num: 42, subject: "선형대수", unit: "고유치와 대각화", concept: "외적 변환의 고유벡터", difficulty: "mediumHard",
    question: "$\\vec i=(1,0,0),\\ \\vec j=(0,1,0)$이고 선형변환 $L:\\mathbb R^3\\to\\mathbb R^3$가 $L(\\vec x)=\\vec x\\times \\vec i + \\vec x\\times\\vec j$로 주어질 때, 다음 중 $L$의 고유벡터는?",
    options: [o("1","$(1,0,0)$"), o("2","$(0,1,0)$"), o("3","$(1,1,0)$"), o("4","$(1,1,1)$")],
    answer: 3,
    explanation: "$L(\\vec x)=\\vec x\\times(\\vec i+\\vec j)=\\vec x\\times(1,1,0)$. $\\vec x=(1,1,0)$ 대입: $(1,1,0)\\times(1,1,0)=\\vec 0=0\\cdot(1,1,0)$ → 고윳값 0의 고유벡터. 정답 (3) (1,1,0)."
  }),
  build({
    num: 43, subject: "선형대수", unit: "고유치와 대각화", concept: "rank 1 행렬 고유치", difficulty: "medium",
    question: "$n\\times n$ 행렬 $\\begin{pmatrix}1&1&\\cdots&1\\\\2&2&\\cdots&2\\\\\\vdots&\\vdots&\\ddots&\\vdots\\\\n&n&\\cdots&n\\end{pmatrix}$의 서로 다른 고윳값의 개수는? (단, $n\\ge 3$)",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$n$개")],
    answer: 3,
    explanation: "행렬 $A=uv^T$ 꼴, $u=(1,2,\\ldots,n)^T,v=(1,1,\\ldots,1)^T$. rank 1 행렬. 0이 아닌 고유치는 $\\text{tr}(A)=v^T u=1+2+\\cdots+n=\\dfrac{n(n+1)}{2}$. 나머지 고유치는 모두 0 ($n-1$개). 따라서 서로 다른 고유치 = $\\{0, \\tfrac{n(n+1)}{2}\\}$ → 2개."
  }),
  build({
    num: 44, subject: "선형대수", unit: "행렬", concept: "선형사상 rank 추론", difficulty: "mediumHard",
    question: "$3\\times 3$ 실행렬 $A$가 <보기>의 성질을 만족할 때, $A$의 계수($\\text{rank}$)는? 가. 방정식 $A\\binom{x_1}{x_2\\ x_3}=\\binom{1}{2\\ \\lambda}$의 해 $\\binom{x_1}{x_2\\ x_3}$가 존재하는 실수 $\\lambda$는 유일하다. 나. 방정식 $A\\binom{x_1}{x_2\\ x_3}=\\binom{1}{\\lambda\\ 1}$의 해 $\\binom{x_1}{x_2\\ x_3}$는 어느 실수 $\\lambda$에 대해서도 존재하지 않는다.",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$")],
    answer: 2,
    explanation: "가. $b=(1,2,\\lambda)^T$가 열공간에 있는 $\\lambda$가 유일 → 열공간이 1차원 직선. 즉 rank=1. 나. $b=(1,\\lambda,1)^T$가 어떤 $\\lambda$에 대해서도 열공간에 없음 → 열공간이 $(1,\\lambda,1)$ 류 벡터를 포함 안 함. rank=1로 일관됨. (가의 조건도 만족: 어떤 직선 위에서 첫 좌표 1, 둘째 좌표 2가 정해지면 셋째 좌표가 유일하게 결정.) 정답 1."
  }),
  build({
    num: 45, subject: "선형대수", unit: "벡터공간", concept: "함수 부분공간 판정", difficulty: "medium",
    question: "<보기>에서 벡터공간을 모두 고르면? 가. $3$차 다항식의 집합  나. 이상적분 $\\int_{-\\infty}^{\\infty}f(x)dx$가 수렴하는 연속함수 $f:\\mathbb R\\to\\mathbb R$의 집합  다. 미분가능하고 도함수가 불연속인 함수 $f:\\mathbb R\\to\\mathbb R$의 집합  라. 최댓값이 $1$보다 작은 함수 $f:\\mathbb R\\to\\mathbb R$의 집합",
    options: [o("1","나"), o("2","라"), o("3","가, 나"), o("4","다, 라")],
    answer: 1,
    explanation: "가. 거짓. 3차 다항식 = $ax^3+bx^2+cx+d,a\\ne 0$이라 영함수 미포함. 나. 참. 영함수의 적분 0 수렴 + 합/스칼라곱에 대해 닫힘. 다. 거짓. 영함수는 미분가능하고 도함수도 0(연속)이라 조건 미충족. 라. 거짓. 영함수 최댓값 0 < 1 ✓이지만 합에 대해 닫힘 X (반례 가능). 정답 나만."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error(error); process.exit(1); }
console.log("Inserted:");
for (const r of data) console.log(`  - ${r.id}  [${r.subject}/${r.unit}/${r.difficulty}]`);
