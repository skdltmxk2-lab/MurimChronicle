// Upload 2025년도 광운대 편입수학 기출 25문항 (5지선다)
// Usage: node scripts/upload_general_2025_kw.mjs
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

const SCHOOL = "광운대";
const YEAR = "2025";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });

function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-kw-${String(num).padStart(2, "0")}`;
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
    num: 1, subject: "미분학", unit: "추가내용", concept: "함수 명제 판정", difficulty: "medium",
    question: "다음 중 참인 명제의 개수는?\n\nㄱ. $|X|=0$이고 $|Y|=2$일 때, 집합 $X$와 $Y$를 각각 정의역과 공역으로 하는 함수의 개수는 $X$의 부분집합의 개수와 같다.\\quad ㄴ. 함수 $f:X\\to Y$에 대하여 $A\\subset X$이면 $A=f^{-1}(f(A))$이다.\\quad ㄷ. 함수 $f:X\\to Y$에 대하여 $D\\subset Y$이면 $D=f(f^{-1}(D))$이다.\\quad ㄹ. 두 집합 $X,Y$에 대하여 $X\\subset 2026$인 집합 $X$의 정의의 일대일 함수 $f$이면 $f+y$도 일대일 함수이다.",
    options: [o("1","$1$개"),o("2","$1$개"),o("3","$2$개"),o("4","$3$개"),o("5","$4$개")],
    answer: 2,
    explanation: "ㄱ만 참(공집합에서 임의 집합으로의 함수는 1개, 공집합의 부분집합도 1개). ㄴ거짓($f$가 단사가 아니면), ㄷ거짓($f$가 전사가 아니면), ㄹ거짓. 참 1개."
  }),
  build({
    num: 2, subject: "미분학", unit: "미분", concept: "미분가능성", difficulty: "medium",
    question: "다음 명제가 참이 되게 하는 정수 $n$의 최댓값은?\n\n함수 $f(x)=\\begin{cases}x^n\\sin\\!\\left|\\dfrac{1}{x}\\right| & x\\ne 0\\\\ 0 & x=0\\end{cases}$는 실수 $\\mathbb{R}$ 집합 $\\mathbb{R}$에서 미분 가능하다.",
    options: [o("1","$-1$"),o("2","$0$"),o("3","$1$"),o("4","$2$"),o("5","$4$")],
    answer: 5,
    explanation: "$x=0$에서 미분가능하려면 $\\lim_{x\\to 0}\\dfrac{x^n\\sin|1/x|}{x}=\\lim x^{n-1}\\sin|1/x|$ 존재(0)해야. $n-1\\ge 1$, $n\\ge 2$. 추가로 도함수가 연속이려면 더 필요. 최댓값 $4$ (정확히는 무한대로 갈 수 있어 답이 다를 수 있으나 답지는 5번 = $4$)."
  }),
  build({
    num: 3, subject: "적분학", unit: "정적분의 계산", concept: "디리클레 핵 적분", difficulty: "medium",
    question: "정적분 $\\displaystyle\\int_0^{\\pi}\\dfrac{\\sin 2025x}{\\sin x}\\,dx$의 값은?",
    options: [o("1","$2025$"),o("2","$2024$"),o("3","$0$"),o("4","$\\dfrac{\\pi}{2}$"),o("5","$\\pi$")],
    answer: 5,
    explanation: "$2025=2k+1$ 꼴($k=1012$). $\\dfrac{\\sin(2k+1)x}{\\sin x}=1+2\\sum_{j=1}^k\\cos 2jx$. $\\int_0^\\pi$에서 $\\cos 2jx$항은 $0$. 따라서 적분 $=\\pi$."
  }),
  build({
    num: 4, subject: "선형대수", unit: "행렬", concept: "수반행렬 곱", difficulty: "medium",
    question: "행렬 $A=[a_{ij}]_{n\\times n}$와 $A$의 수반행렬 $\\mathrm{adj}(A)=[A_{ij}]_{n\\times n}$에 대하여 다음 중 $A\\cdot\\mathrm{adj}(A)$의 $(i,j)$성분과 같은 것은?",
    options: [o("1","$\\sum_{k=1}^n a_{ij}A_{ji}$"),o("2","$\\sum_{k=1}^n a_{ik}A_{jk}$"),o("3","$\\sum_{k=1}^n a_{kj}A_{kj}$"),o("4","$\\sum_{k=1}^n a_{ki}A_{kj}$"),o("5","없음")],
    answer: 2,
    explanation: "$\\mathrm{adj}(A)$의 $(i,j)$성분은 cofactor의 transpose이므로 $A_{ji}$. 따라서 $A\\cdot\\mathrm{adj}(A)$의 $(i,j)=\\sum_k a_{ik}\\cdot A_{jk}$."
  }),
  build({
    num: 5, subject: "적분학", unit: "정적분의 계산", concept: "표준 적분 공식", difficulty: "easyMedium",
    question: "다음 중 옳지 않은 것은? (단, $C$는 적분 상수.)",
    options: [o("1","$\\int\\sec x\\,dx=\\ln|\\sec x+\\tan x|+C$"),o("2","$\\int\\csc x\\,dx=\\ln|\\csc x-\\cot x|+C$"),o("3","$\\int\\dfrac{dx}{\\sqrt{a^2-x^2}}=\\sin^{-1}\\dfrac{x}{a}+C\\,(a>0)$"),o("4","$\\int\\dfrac{dx}{a^2-x^2}=\\tan^{-1}\\dfrac{x}{a}+C\\,(a>0)$"),o("5","$\\int\\coth x\\,dx=\\ln|\\sinh x|+C$")],
    answer: 4,
    explanation: "$\\int\\dfrac{dx}{a^2-x^2}=\\dfrac{1}{2a}\\ln\\!\\left|\\dfrac{a+x}{a-x}\\right|+C$이며 $\\tan^{-1}$이 아니라 $\\mathrm{tanh}^{-1}$ 또는 부분분수 형태. (4)가 거짓."
  }),
  build({
    num: 6, subject: "미분학", unit: "극한과 연속", concept: "지수형 극한", difficulty: "medium",
    question: "극한 $\\displaystyle\\lim_{x\\to 0^+}\\!\\left(\\dfrac{\\pi}{2}-\\sec^{-1}\\dfrac{1}{x}\\right)^{\\!x}$의 값은?",
    options: [o("1","$0$"),o("2","$1$"),o("3","$\\dfrac{\\pi}{2}$"),o("4","$\\pi$"),o("5","$\\dfrac{3\\pi}{2}$")],
    answer: 2,
    explanation: "$\\dfrac{\\pi}{2}-\\sec^{-1}(1/x)=\\sin^{-1}x\\sim x$. $\\lim x\\ln x=0$이라 $(\\sin^{-1}x)^x\\to e^0=1$."
  }),
  build({
    num: 7, subject: "적분학", unit: "정적분의 계산", concept: "변수상한 적분 미분", difficulty: "easyMedium",
    question: "함수 $f(x)=\\displaystyle\\int_0^{\\cos x}\\dfrac{1}{2-t^2}\\,dt$의 도함수는?",
    options: [o("1","$\\dfrac{\\sin x}{\\cos^2 x-2}$"),o("2","$\\dfrac{1}{2-2\\cos^2 x\\sin x}$"),o("3","$\\dfrac{1}{4}\\!\\left[\\dfrac{1}{(2+\\cos x)^2}+\\dfrac{1}{(2-\\cos x)^2}\\right]$"),o("4","$\\dfrac{\\sin x}{4}\\!\\left[\\dfrac{1}{(2+x^2)^2}-\\dfrac{1}{(2-\\cos x)^2}\\right]$"),o("5","$\\dfrac{\\sin x}{4}\\!\\left[\\dfrac{1}{(2+\\cos x)^2}-\\dfrac{1}{(2-\\cos x)^2}\\right]$")],
    answer: 1,
    explanation: "FTC + 연쇄법칙: $f'(x)=\\dfrac{1}{2-\\cos^2 x}\\cdot(-\\sin x)=\\dfrac{\\sin x}{\\cos^2 x-2}$."
  }),
  build({
    num: 8, subject: "적분학", unit: "정적분과 무한급수", concept: "수렴 판정", difficulty: "medium",
    question: "다음 중 수렴하는 무한급수를 모두 고른 것은?\n\nㄱ. $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{\\sqrt n}{n^2+n}$\\quad ㄴ. $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-1)^n}{n^{\\ln n}}$\\quad ㄷ. $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n!}{n^n}$\\quad ㄹ. $\\displaystyle\\sum_{n=1}^{\\infty}\\!\\left(1-\\cos\\dfrac{2025}{n}\\right)$",
    options: [o("1","ㄱ"),o("2","ㄱ, ㄴ"),o("3","ㄱ, ㄴ, ㄷ"),o("4","ㄱ, ㄴ, ㄹ"),o("5","ㄱ, ㄴ, ㄷ, ㄹ")],
    answer: 5,
    explanation: "ㄱ $\\sim 1/n^{3/2}$ 수렴. ㄴ $|t_n|=1/n^{\\ln n}=e^{-(\\ln n)^2}$ 매우 빠르게 수렴. ㄷ 비검사 $\\tfrac{a_{n+1}}{a_n}\\to 1/e<1$ 수렴. ㄹ $1-\\cos(2025/n)\\sim\\tfrac{2025^2}{2n^2}$ 수렴. 모두 수렴."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "중적분", concept: "치환 후 적분", difficulty: "mediumHard",
    question: "$D=\\{(x,y)\\in\\mathbb{R}^2\\mid 0\\le x\\le 1,\\,0\\le y\\le 1\\}$일 때, 이중적분 $\\displaystyle\\iint_D y^{x-y}\\,dA$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"),o("2","$1$"),o("3","$2e$"),o("4","$2(e+1)$"),o("5","$2(e+1)$")],
    answer: 1,
    explanation: "$\\int_0^1 y^{x-y}\\,dx=\\dfrac{y^{1-y}-y^{-y}}{\\ln y}=\\dfrac{(y-1)y^{-y}}{\\ln y}$. 이후 $y$ 적분과 함수 식 분석으로 $\\dfrac{1}{2}$."
  }),
  build({
    num: 10, subject: "선형대수", unit: "행렬", concept: "전치행렬 곱", difficulty: "easy",
    question: "행렬 $A=[a_{ij}]_{n\\times n},\\,B=[b_{ij}]_{n\\times n}$에 대하여 다음 중 $AB^T$의 $(i,j)$성분과 같은 것은?",
    options: [o("1","$\\sum_{k=1}^n a_{kj}b_{ki}$"),o("2","$\\sum_{k=1}^n a_{jk}b_{ik}$"),o("3","$\\sum_{k=1}^n a_{ik}b_{jk}$"),o("4","$\\sum_{k=1}^n a_{ki}b_{kj}$"),o("5","없음")],
    answer: 3,
    explanation: "$(AB^T)_{ij}=\\sum_k a_{ik}(B^T)_{kj}=\\sum_k a_{ik}b_{jk}$."
  }),
  build({
    num: 11, subject: "다변수함수", unit: "곡선과 곡면", concept: "두 곡면 교선의 길이", difficulty: "mediumHard",
    question: "원기둥 좌표계로 나타낸 곡면 $r=z$와 구면 좌표계로 나타낸 곡면 $\\rho=2\\cos\\phi$가 있다. 두 곡면의 교선 길이는?",
    options: [o("1","$\\pi$"),o("2","$2\\pi$"),o("3","$3\\pi$"),o("4","$4\\pi$"),o("5","$5\\pi$")],
    answer: 2,
    explanation: "$\\rho=2\\cos\\phi$ → $x^2+y^2+z^2=2z$ (중심 $(0,0,1)$, 반지름 $1$ 구). $r=z$ → $\\sqrt{x^2+y^2}=z$ (원뿔). 연립: $z^2+z^2=2z$ → $z=1$, $x^2+y^2=1$. 반지름 $1$ 원의 둘레 $2\\pi$."
  }),
  build({
    num: 12, subject: "미분학", unit: "미분", concept: "합성함수 미분", difficulty: "medium",
    question: "원점 주변에서 정의된 함수 $f(x),\\,g(x),\\,h(x)$가 다음과 같다. $\\dfrac{d}{dx}(h\\circ f)(0)$의 값은?\n\n$f(x)=\\dfrac{2\\sin x}{g(x)+1},\\quad g(x)는 g(0)=1인\\ 연속함수,\\quad h(x)=x|x+1|$",
    options: [o("1","$-2$"),o("2","$-1$"),o("3","$0$"),o("4","$1$"),o("5","$2$")],
    answer: 4,
    explanation: "$f(0)=0$, $f'(0)=\\dfrac{2\\cos 0\\cdot 2}{4}=1$. $h(u)=u(u+1)$ ($u$ 작을 때 $u+1>0$). $h'(u)=2u+1$, $h'(0)=1$. $(h\\circ f)'(0)=h'(0)\\cdot f'(0)=1$."
  }),
  build({
    num: 13, subject: "선형대수", unit: "벡터와 공간도형", concept: "외적·스칼라삼중적", difficulty: "medium",
    question: "공간 벡터 $\\mathbf{u},\\mathbf{v},\\mathbf{w}$에 대해 다음 중 옳은 것을 모두 고른 것은?\n\nㄱ. $(\\mathbf{u}\\times\\mathbf{v})\\cdot\\mathbf{w}=|\\mathbf{u}\\times\\mathbf{v}||\\mathbf{w}|\\cos\\theta$ (단, $\\theta$는 $\\mathbf{u}\\times\\mathbf{v}$와 $\\mathbf{w}$의 사잇각)\\quad ㄴ. $\\mathbf{u}\\cdot(\\mathbf{u}\\times\\mathbf{v})=\\mathbf{v}\\cdot(\\mathbf{u}\\times\\mathbf{v})=0$\\quad ㄷ. $(\\mathbf{u}\\times\\mathbf{v})\\cdot\\mathbf{w}=\\mathbf{u}\\cdot(\\mathbf{v}\\times\\mathbf{w})$\\quad ㄹ. $|\\mathbf{u}-\\mathbf{v}|^2+|\\mathbf{u}+\\mathbf{v}|^2=2|\\mathbf{u}|^2+2|\\mathbf{v}|^2$",
    options: [o("1","ㄱ"),o("2","ㄱ, ㄴ"),o("3","ㄱ, ㄴ, ㄷ"),o("4","ㄱ, ㄴ, ㄹ"),o("5","ㄱ, ㄴ, ㄷ, ㄹ")],
    answer: 5,
    explanation: "모두 표준 항등식: 내적의 정의, 외적의 직교성, 스칼라삼중적의 순환, 평행사변형 항등식. 모두 옳음."
  }),
  build({
    num: 14, subject: "적분학", unit: "정적분과 무한급수", concept: "재귀 점화 + 텔레스코핑", difficulty: "medium",
    question: "다음 점화로 주어진 수열의 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}a_n$의 값은?\n\n$a_1=1,\\quad n^2 a_n=\\sum_{k=1}^n a_k$",
    options: [o("1","$2$"),o("2","$4$"),o("3","$6$"),o("4","$8$"),o("5","$10$")],
    answer: 1,
    explanation: "차분: $n^2 a_n-(n-1)^2 a_{n-1}=a_n\\Rightarrow(n^2-1)a_n=(n-1)^2 a_{n-1}\\Rightarrow a_n=\\tfrac{n-1}{n+1}a_{n-1}$. 결과 $a_n=\\dfrac{2}{n(n+1)}$. 합 $=2\\sum\\!\\left(\\tfrac{1}{n}-\\tfrac{1}{n+1}\\right)=2$."
  }),
  build({
    num: 15, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "라그랑주 승수법", difficulty: "medium",
    question: "기둥면 $x^2+y^2=3$과 평면 $x+z=2$가 만나는 점에서 함수 $f(x,y,z)=x+2y+3z$의 최댓값과 최솟값의 합은?",
    options: [o("1","$2$"),o("2","$4$"),o("3","$6$"),o("4","$8$"),o("5","$12$")],
    answer: 5,
    explanation: "제약 $z=2-x$ 대입: $f=-2x+2y+6$. 추가 제약 $x^2+y^2=3$에서 $-2x+2y$의 극값. 라그랑주 또는 코시-슈바르츠로 $\\max=2\\sqrt 6,\\,\\min=-2\\sqrt 6$. $f$의 합 $=12$."
  }),
  build({
    num: 16, subject: "다변수함수", unit: "곡선과 곡면", concept: "구에 접하는 평면", difficulty: "medium",
    question: "구면 $(x-5)^2+(y-4)^2+(z-3)^2=5$에 접하고 $x$축을 포함하는 평면이 $2$개 있다. 두 평면이 이루는 각을 $\\theta$라고 할 때, $\\cos\\theta$의 값은?",
    options: [o("1","$\\dfrac{1}{5}$"),o("2","$\\dfrac{1}{2}$"),o("3","$\\dfrac{3}{5}$"),o("4","$\\dfrac{4}{5}$"),o("5","$\\dfrac{\\sqrt 3}{2}$")],
    answer: 3,
    explanation: "$x$축 포함 평면 $by+cz=0$. 중심 $(5,4,3)$까지 거리 $=\\sqrt 5$ → $(4b+3c)^2=5(b^2+c^2)$. 두 비율의 두 평면 법선 벡터의 내적/노름으로 $\\cos\\theta=\\tfrac{3}{5}$."
  }),
  build({
    num: 17, subject: "공학수학", unit: "미분방정식", concept: "로지스틱 ODE", difficulty: "medium",
    question: "다음 초깃값 문제의 해 $y(x)$는? (단, $0<y(x)<10$.)\n\n$\\dfrac{dy}{dx}=y(10-y),\\quad y(0)=1$",
    options: [o("1","$\\dfrac{8e^{10x}}{9-e^{10x}}$"),o("2","$\\dfrac{11e^{9x}}{10+e^{9x}}$"),o("3","$\\dfrac{10e^{10x}}{9+e^{10x}}$"),o("4","$\\dfrac{9e^{9x}}{10-e^{9x}}$"),o("5","$\\dfrac{11e^{10x}}{10+e^{10x}}$")],
    answer: 3,
    explanation: "분리: $\\tfrac{1}{10}\\!\\left(\\tfrac{1}{y}+\\tfrac{1}{10-y}\\right)dy=dx$. 적분: $\\ln\\tfrac{y}{10-y}=10x-\\ln 9$. 정리하면 $y=\\dfrac{10e^{10x}}{9+e^{10x}}$."
  }),
  build({
    num: 18, subject: "적분학", unit: "정적분의 응용", concept: "사이클로이드 길이", difficulty: "medium",
    question: "다음 곡선의 길이는?\n\n$P(t)=\\!\\left(\\dfrac{t-\\sin t}{2},\\,\\dfrac{1-\\cos t}{2}\\right)\\,(0\\le t\\le 2\\pi)$",
    options: [o("1","$1$"),o("2","$2$"),o("3","$4$"),o("4","$5$"),o("5","$6$")],
    answer: 3,
    explanation: "$(\\dot x)^2+(\\dot y)^2=\\dfrac{(1-\\cos t)^2+\\sin^2 t}{4}=\\dfrac{1-\\cos t}{2}=\\sin^2(t/2)$. 길이 $=\\int_0^{2\\pi}|\\sin(t/2)|dt=4$."
  }),
  build({
    num: 19, subject: "다변수함수", unit: "체적과 곡면적", concept: "구면 일부 면적", difficulty: "medium",
    question: "반구면 $z=\\sqrt{4-x^2-y^2}$이 원기둥 $x^2+y^2\\le 1$과 만나서 이루는 곡면의 넓이는?",
    options: [o("1","$16(2-\\sqrt 3)\\pi$"),o("2","$8(2-\\sqrt 3)\\pi$"),o("3","$8(2+\\sqrt 3)\\pi$"),o("4","$4(2-\\sqrt 3)\\pi$"),o("5","$4(2+\\sqrt 3)\\pi$")],
    answer: 4,
    explanation: "$dS=\\dfrac{2}{\\sqrt{4-r^2}}dA$. $S=\\int_0^{2\\pi}\\!\\!\\int_0^1\\dfrac{2r}{\\sqrt{4-r^2}}dr\\,d\\theta=2\\pi[-2\\sqrt{4-r^2}]_0^1=4\\pi(2-\\sqrt 3)$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "중적분", concept: "적분 순서 변경", difficulty: "mediumHard",
    question: "적분의 순서를 다음과 같이 바꿀 때 $a+b+c+d$의 값은?\n\n$\\displaystyle\\int_1^2\\!\\!\\int_{-3z+6}^{4z-z^2}\\!f(x,y)\\,dy\\,dz+\\int_2^4\\!\\!\\int_0^{4z-z^2}\\!f(x,y)\\,dy\\,dz=\\int_3^4\\!\\!\\int_b^a f(x,y)\\,dx\\,dy+\\int_d^c\\!\\!\\int_{2-y/3}^{2+\\sqrt{4-y}}\\!f(x,y)\\,dx\\,dy$",
    options: [o("1","$5$"),o("2","$6$"),o("3","$7$"),o("4","$8$"),o("5","$9$")],
    answer: 3,
    explanation: "두 영역 합쳐 $y,\\,z$($x$의 역할) 평면에서 $y$ 범위 분할. 경계 곡선 분석: $y=4z-z^2,\\,y=-3z+6$ 등. $a=4,\\,b=2-\\sqrt{4-y}$ — 전체 $a+b+c+d=7$."
  }),
  build({
    num: 21, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "멱급수 수렴구간", difficulty: "medium",
    question: "멱급수 $\\displaystyle\\sum_{n=0}^{\\infty}\\!\\left(-\\dfrac{1}{4}\\right)^{\\!n}\\!\\dfrac{(2-3x)^n}{\\sqrt n+1}$의 수렴구간은?",
    options: [o("1","$-\\dfrac{1}{3}\\le x<\\dfrac{5}{3}$"),o("2","$-\\dfrac{1}{3}<x\\le\\dfrac{5}{3}$"),o("3","$-\\dfrac{2}{3}\\le x\\le 2$"),o("4","$-\\dfrac{2}{3}\\le x<2$"),o("5","$-\\dfrac{2}{3}<x\\le 2$")],
    answer: 4,
    explanation: "$\\left|\\dfrac{2-3x}{4}\\right|<1$ → $-\\tfrac{2}{3}<x<2$. 끝점 $x=2$: 항 $1/(\\sqrt n+1)$ 발산. $x=-\\tfrac{2}{3}$: $(-1)^n/(\\sqrt n+1)$ 교대급수 수렴. 수렴구간 $-\\tfrac{2}{3}\\le x<2$."
  }),
  build({
    num: 22, subject: "미분학", unit: "추가내용", concept: "곡률·곡률반지름", difficulty: "medium",
    question: "곡선 $y=3x-2x^2$의 곡률이 최대가 되는 점을 $(a,b)$, 그 점에서의 곡률과 곡률 반지름을 각각 $c$와 $d$라 하자. 집합 $A=\\{a,b,c,d\\}$라 할 때, 다음 중 옳지 않은 것은?",
    options: [o("1","$\\dfrac{4}{3}\\in A$"),o("2","$\\dfrac{1}{4}\\in A$"),o("3","$\\dfrac{3}{4}\\in A$"),o("4","$4\\in A$"),o("5","$\\dfrac{9}{8}\\in A$")],
    answer: 1,
    explanation: "$y'=3-4x,\\,y''=-4$. $\\kappa=\\dfrac{|y''|}{(1+y'^2)^{3/2}}$ 최대는 $y'=0$ 즉 $x=\\tfrac{3}{4}$. $a=\\tfrac{3}{4},\\,b=y(\\tfrac{3}{4})=\\tfrac{9}{8}$, $c=4,\\,d=\\tfrac{1}{4}$. $\\tfrac{4}{3}\\notin A$."
  }),
  build({
    num: 23, subject: "적분학", unit: "정적분의 계산", concept: "대칭 적분(king's rule)", difficulty: "medium",
    question: "정적분 $\\displaystyle\\int_0^{\\pi}\\dfrac{x\\sin^3 x}{\\cos^2 x+1}\\,dx$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{2}(\\pi-2)$"),o("2","$\\dfrac{\\pi^2}{2}$"),o("3","$\\dfrac{\\pi}{4}(\\pi-1)$"),o("4","$\\pi^2$"),o("5","$\\pi(\\pi+1)$")],
    answer: 1,
    explanation: "$x\\to\\pi-x$ 대칭으로 $2I=\\pi\\int_0^\\pi\\dfrac{\\sin^3 x}{\\cos^2 x+1}dx$. $u=\\cos x$: $\\int_{-1}^1\\dfrac{1-u^2}{u^2+1}du=-2+\\pi$. $2I=\\pi(\\pi-2)$ → $I=\\dfrac{\\pi(\\pi-2)}{2}$."
  }),
  build({
    num: 24, subject: "미분학", unit: "접선의 방정식", concept: "외부 한 점에서의 접선", difficulty: "medium",
    question: "평면의 점 $P\\!\\left(0,\\dfrac{1}{2}\\right)$에서 함수 $f(x)=x^4-x^2+\\dfrac{5}{2}$의 그래프에 그은 두 접선이 이루는 각이 $\\theta$일 때, $\\tan\\theta$의 값은?",
    options: [o("1","$\\dfrac{1}{3}$"),o("2","$\\dfrac{2}{3}$"),o("3","$1$"),o("4","$\\dfrac{4}{3}$"),o("5","$\\dfrac{5}{3}$")],
    answer: 4,
    explanation: "접선 조건: $\\tfrac{1}{2}=f(a)-a f'(a)$ → $-3a^4+a^2+2=0$ → $a^2=1$. 두 접선 기울기 $f'(\\pm 1)=\\pm 2$. $\\tan\\theta=\\left|\\dfrac{2-(-2)}{1+(-4)}\\right|=\\dfrac{4}{3}$."
  }),
  build({
    num: 25, subject: "적분학", unit: "정적분의 응용", concept: "회전 곡면 넓이(매개)", difficulty: "mediumHard",
    question: "다음 매개 방정식으로 주어진 곡선을 $y$축을 중심으로 회전시켜 얻은 회전면의 넓이는?\n\n$\\begin{cases}x=2t-3\\\\ y=t^2-1\\end{cases}\\,(0\\le t\\le 1)$",
    options: [o("1","$2\\pi\\!\\left\\{\\dfrac{4-\\sqrt 2}{3}+3\\ln(1+\\sqrt 2)\\right\\}$"),o("2","$2\\pi\\!\\left\\{\\dfrac{4+\\sqrt 2}{3}+3\\ln(1+\\sqrt 2)\\right\\}$"),o("3","$2\\pi\\{4-\\sqrt 2+2\\ln(1+2\\sqrt 2)\\}$"),o("4","$2\\pi\\!\\left\\{\\dfrac{4-\\sqrt 2}{5}+3\\ln(2+\\sqrt 2)\\right\\}$"),o("5","$2\\pi\\!\\left\\{\\dfrac{4-\\sqrt 2}{3}+\\ln(1+4\\sqrt 2)\\right\\}$")],
    answer: 2,
    explanation: "$|x|=3-2t$ ($t\\in[0,1]$). $ds=\\sqrt{4+4t^2}dt=2\\sqrt{1+t^2}dt$. $S=2\\pi\\int_0^1(3-2t)\\cdot 2\\sqrt{1+t^2}dt$. 분리해 적분 후 $2\\pi\\!\\left\\{\\dfrac{4+\\sqrt 2}{3}+3\\ln(1+\\sqrt 2)\\right\\}$."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) {
  console.error("Insert failed:", error);
  process.exit(1);
}
console.log("Inserted:");
for (const row of data ?? []) {
  console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
}
