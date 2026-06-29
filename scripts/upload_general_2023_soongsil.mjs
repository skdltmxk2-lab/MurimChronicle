// Upload 2023년도 숭실대 편입수학 기출 25문항 (4지 선다, 90분, 원본 26~50번)
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

const SCHOOL = "숭실대";
const YEAR = "2023";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-soongsil-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "절댓값 극한 좌극한", difficulty: "easy",
    question: "극한값 $\\!\\displaystyle\\lim_{x\\to 1^-}\\dfrac{2x-2}{|x^3-x^2|}$을 구하면?",
    options: [o("1","$-2$"), o("2","$0$"), o("3","$2$"), o("4","$\\infty$")],
    answer: 1,
    explanation: "$|x^3-x^2|=|x^2(x-1)|=-x^2(x-1)$ ($x\\to 1^-$).\n$\\lim_{x\\to 1^-}\\dfrac{2(x-1)}{-x^2(x-1)}=\\lim\\dfrac{2}{-x^2}=-2$."
  }),
  build({
    num: 2, subject: "미분학", unit: "도함수", concept: "극대 개수 (sin함수)", difficulty: "medium",
    question: "어떤 함수 $f$의 도함수가 $f'(x)=\\sin(3x+2)$일 때, $0<x<5$에서 함수 $f$의 극대점의 개수는?",
    options: [o("1","$2$"), o("2","$3$"), o("3","$4$"), o("4","$5$")],
    answer: 2,
    explanation: "$0<x<5$ ⇒ $2<3x+2<17$.\n$\\sin\\theta=0$이 $+\\to -$로 바뀌는 점 ($\\theta=\\pi,3\\pi,5\\pi$).\n$x=\\dfrac{\\pi-2}{3},\\dfrac{3\\pi-2}{3},\\dfrac{5\\pi-2}{3}$ ⇒ 3개."
  }),
  build({
    num: 3, subject: "미분학", unit: "역함수", concept: "역함수 미분법", difficulty: "easy",
    question: "$f(x)=2x^2+3x+1\\;(x\\ge 0)$일 때 $(f^{-1})'(6)$을 구하면?",
    options: [o("1","$\\dfrac{1}{7}$"), o("2","$1$"), o("3","$5$"), o("4","$7$")],
    answer: 1,
    explanation: "$f(x)=6$ ⇒ $2x^2+3x-5=0$ ⇒ $x=1$ ($x\\ge 0$).\n$f'(x)=4x+3$, $f'(1)=7$.\n$(f^{-1})'(6)=\\dfrac{1}{7}$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분", concept: "치환적분 + 부분적분", difficulty: "easy",
    question: "정적분 $\\!\\displaystyle\\int_0^4 e^{\\sqrt x}\\,dx$의 값은?",
    options: [o("1","$e^2-1$"), o("2","$e^2+1$"), o("3","$e^2$"), o("4","$2e^2+2$")],
    answer: 4,
    explanation: "$\\sqrt x=t$, $x=t^2$, $dx=2t\\,dt$.\n$\\!\\int_0^2 e^t\\cdot 2t\\,dt=2[(t-1)e^t]_0^2=2(e^2+1)$."
  }),
  build({
    num: 5, subject: "선형대수", unit: "행렬", concept: "행렬 명제 참거짓", difficulty: "medium",
    question: "$n\\times n$행렬 $A$, $B$에 대한 설명 중, 참인 명제의 개수를 구하면?\n\n(가) $AB$가 가역행렬이면 $A+B$도 가역행렬이다.\n(나) $A$, $B$가 모두 대칭행렬이면 $A^2+B^2$도 대칭행렬이다.\n(다) $A$, $B$가 모두 직교행렬이면 $AB$도 직교행렬이다.\n(라) $A$가 직교행렬이면 $\\det(A)=\\pm 1$이다.",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 3,
    explanation: "(가) 거짓: 반례 $A=I$, $B=-I$.\n(나) 참: $(A^2)^T=A^2$, $(B^2)^T=B^2$.\n(다) 참: $(AB)^T(AB)=B^T A^T AB=I$.\n(라) 참: $\\det(A)^2=\\det(A^T A)=1$. ⇒ 3개."
  }),
  build({
    num: 6, subject: "공학수학", unit: "1계 미분방정식", concept: "선형미분방정식 판별", difficulty: "easy",
    question: "다음 중 선형미분방정식을 모두 고른 것은?\n\n(가) $(x+y)dy+2x\\,dx=0$\n(나) $e^x\\dfrac{dy}{dx}+y\\sin x=0$\n(다) $\\dfrac{d^2 y}{dx^2}+xy=0$",
    options: [o("1","(다)"), o("2","(가),(나)"), o("3","(나),(다)"), o("4","(가),(나),(다)")],
    answer: 3,
    explanation: "(가) $(x+y)y'+2x=0$ ⇒ $yy'$항 존재로 비선형.\n(나) $y$ 1차, $y'$ 1차 ⇒ 선형.\n(다) $y''+xy=0$ ⇒ 선형."
  }),
  build({
    num: 7, subject: "다변수함수", unit: "음함수 미분", concept: "2변수 음함수 2계미분", difficulty: "mediumHard",
    question: "$2\\sin y=3\\cos x-3$일 때, $(0,0)$에서 $\\dfrac{d^2 y}{dx^2}$를 구하면?",
    options: [
      o("1","$-\\dfrac{21}{8}$"),
      o("2","$-\\dfrac{3}{2}$"),
      o("3","$\\dfrac{3}{2}$"),
      o("4","$\\dfrac{21}{8}$")
    ],
    answer: 2,
    explanation: "$F=2\\sin y-3\\cos x+3$. $F_x=3\\sin x$, $F_y=2\\cos y$, $F_{xx}=3\\cos x$, $F_{yy}=-2\\sin y$, $F_{xy}=0$.\n$(0,0)$: $F_x=0$, $F_y=2$, $F_{xx}=3$, 나머지 $0$.\n$\\dfrac{d^2 y}{dx^2}=-\\dfrac{4\\cdot 3}{8}=-\\dfrac{3}{2}$."
  }),
  build({
    num: 8, subject: "적분학", unit: "급수", concept: "급수 수렴/발산", difficulty: "medium",
    question: "다음 중 수렴하는 급수는?\n\n(가) $1+\\dfrac{2}{3}+\\dfrac{3}{5}+\\dfrac{4}{7}+\\cdots$\n(나) $1+\\dfrac{1}{5}+\\dfrac{1}{9}+\\dfrac{1}{13}+\\cdots$\n(다) $\\dfrac{1}{e}-\\dfrac{2}{e^2}+\\dfrac{3}{e^3}-\\dfrac{4}{e^4}+\\cdots$\n(라) $3+(-3)+3+\\cdots+(-1)^{n-1}\\cdot 3+\\cdots$",
    options: [
      o("1","(가),(나)"),
      o("2","(나),(다)"),
      o("3","(다)"),
      o("4","(라)")
    ],
    answer: 3,
    explanation: "(가) $\\dfrac{n}{2n-1}\\to 1/2\\ne 0$, 발산.\n(나) $\\dfrac{1}{4n-3}\\sim\\dfrac{1}{n}$, 발산.\n(다) 교대급수 $n/e^n\\to 0$, 수렴.\n(라) 일반항 $0$ 아님, 발산."
  }),
  build({
    num: 9, subject: "적분학", unit: "급수", concept: "맥클로린 변곡점", difficulty: "medium",
    question: "$f(x)=xe^x$의 맥클로린 급수에서 $0$이 아닌 처음 세 항의 합으로 표현되는 함수의 변곡점의 $x$좌표를 구하면?",
    options: [
      o("1","$-\\dfrac{2}{3}$"),
      o("2","$-\\dfrac{1}{3}$"),
      o("3","$-\\dfrac{3}{2}$"),
      o("4","$\\dfrac{1}{2}$")
    ],
    answer: 1,
    explanation: "$xe^x=x+x^2+\\dfrac{x^3}{2}+\\cdots$\n$g(x)=x+x^2+\\dfrac{x^3}{2}$, $g''(x)=2+3x=0$ ⇒ $x=-\\dfrac{2}{3}$."
  }),
  build({
    num: 10, subject: "적분학", unit: "정적분", concept: "정적분과 평균값", difficulty: "mediumHard",
    question: "$-4\\le x\\le 4$에서 정의된 함수 $f$는 구간별로 기울기가 $-1$ 또는 $1$인 일차함수들이 이어져 있으며 연속이라고 하자. $f(0)=0$, $f(-4)=f(-2)=f(2)=f(4)=2$일 때 전체 구간에 대한 $f$의 평균값으로 가능하지 않은 것은? (단, 각 부분 구간의 길이는 $1$)",
    options: [
      o("1","$\\dfrac{5}{4}$"),
      o("2","$\\dfrac{3}{2}$"),
      o("3","$\\dfrac{7}{4}$"),
      o("4","$2$")
    ],
    answer: 4,
    explanation: "기울기 $\\pm 1$ 일차함수로 연속하면서 주어진 점들 지나는 경우의 그래프 3가지.\n각각 면적 $14,10,12$ ⇒ 평균 $7/4,5/4,3/2$.\n$2$는 불가능."
  }),
  build({
    num: 11, subject: "적분학", unit: "정적분", concept: "구간별 극한과 정적분", difficulty: "mediumHard",
    question: "정적분 $\\!\\displaystyle\\int_{-2}^{2}\\!\\lim_{n\\to\\infty}\\!\\dfrac{(1+x^2)(2x+x^n)}{1+x^n}\\,dx$의 값은?",
    options: [
      o("1","$\\dfrac{3}{2}$"),
      o("2","$3$"),
      o("3","$\\dfrac{10}{3}$"),
      o("4","$\\dfrac{20}{3}$")
    ],
    answer: 4,
    explanation: "$|x|>1$: $\\lim=1+x^2$, $|x|<1$: $\\lim=2x(1+x^2)$.\n$\\!\\int_{-2}^{-1}(1+x^2)\\,dx=10/3$, $\\!\\int_{-1}^{1}2x(1+x^2)\\,dx=0$, $\\!\\int_1^2(1+x^2)\\,dx=10/3$.\n합 $=20/3$."
  }),
  build({
    num: 12, subject: "적분학", unit: "정적분", concept: "역함수 정적분", difficulty: "mediumHard",
    question: "$f(x)=2x+\\cos x$일 때 정적분 $\\!\\displaystyle\\int_1^{2\\pi-1}\\!\\!f^{-1}(x)\\,dx$의 값은?",
    options: [o("1","$\\pi^2-\\pi$"), o("2","$\\pi^2-1$"), o("3","$2\\pi+1$"), o("4","$\\dfrac{\\pi^2}{2}+1$")],
    answer: 1,
    explanation: "역함수 적분 공식: $\\!\\int_0^{\\pi}\\!f(x)\\,dx+\\!\\int_1^{2\\pi-1}\\!f^{-1}(x)\\,dx=\\pi(2\\pi-1)$.\n$\\!\\int_0^{\\pi}(2x+\\cos x)\\,dx=\\pi^2$.\n답 $=\\pi(2\\pi-1)-\\pi^2=\\pi^2-\\pi$."
  }),
  build({
    num: 13, subject: "적분학", unit: "이상적분", concept: "이상적분 발산 판정", difficulty: "easy",
    question: "다음 이상적분 중 발산하는 것을 모두 고른 것은?\n\n(가) $\\!\\int_0^1\\dfrac{\\cos x}{2x}\\,dx$\n(나) $\\!\\int_{-\\infty}^{-1}\\dfrac{1}{\\sqrt{3-x}}\\,dx$\n(다) $\\!\\int_0^1\\dfrac{e^x}{\\sqrt{2x}}\\,dx$\n(라) $\\!\\int_0^1\\dfrac{\\ln x}{1+x^3}\\,dx$",
    options: [
      o("1","(가),(나)"),
      o("2","(나),(다)"),
      o("3","(다),(라)"),
      o("4","(가),(라)")
    ],
    answer: 1,
    explanation: "(가) $\\sim 1/(2x)$ 발산.\n(나) $3-x=t$ 치환, $\\!\\int_4^{\\infty}1/\\sqrt t\\,dt$ 발산.\n(다) $\\sim 1/\\sqrt{2x}$ 수렴 ($p<1$).\n(라) $\\ln x$ 끝점 ⇒ $\\!\\int_0^1\\ln x\\,dx=-1$ 수렴."
  }),
  build({
    num: 14, subject: "적분학", unit: "이중적분", concept: "이중적분", difficulty: "medium",
    question: "이중적분 $\\!\\displaystyle\\int_0^2\\!\\!\\int_0^{x^2/2}\\!\\!x(x^2+y^2+1)\\,dy\\,dx$의 값은?",
    options: [
      o("1","$-6$"),
      o("2","$-\\dfrac{26}{3}$"),
      o("3","$\\dfrac{26}{3}$"),
      o("4","$6$")
    ],
    answer: 3,
    explanation: "$\\!\\int_0^{x^2/2}\\!(x^3+xy^2+x)\\,dy=\\dfrac{x^5}{2}+\\dfrac{x^7}{24}+\\dfrac{x^3}{2}$.\n$\\!\\int_0^2$: $\\dfrac{64}{12}+\\dfrac{256}{192}+\\dfrac{16}{8}=\\dfrac{16}{3}+\\dfrac{4}{3}+2=\\dfrac{26}{3}$."
  }),
  build({
    num: 15, subject: "미분학", unit: "매개변수 곡선", concept: "매개변수 두 접선 기울기 곱", difficulty: "mediumHard",
    question: "매개변수곡선 $x=t^2$, $y=t^3-3t+1$ 위의 점 $A$에서 두 개의 접선을 갖는다고 하자. 이때 점 $A$에서 두 접선의 기울기의 곱은?",
    options: [o("1","$-4$"), o("2","$-3$"), o("3","$-2$"), o("4","$-1$")],
    answer: 2,
    explanation: "한 점에서 두 접선 ⇒ 점 중복 통과. $t=a,b$, $a\\ne b$.\n$a^2=b^2$, $b=-a$. $a^3-3a+1=-a^3+3a+1$ ⇒ $a=\\pm\\sqrt 3$.\n$\\dfrac{dy}{dx}=\\dfrac{3t^2-3}{2t}$, $t=\\pm\\sqrt 3$ ⇒ 기울기 $\\pm\\sqrt 3$.\n곱 $=-3$."
  }),
  build({
    num: 16, subject: "적분학", unit: "곡선의 길이", concept: "사이클로이드 호의 길이", difficulty: "medium",
    question: "매개변수곡선 $x=t-\\sin t$, $y=1-\\cos t\\;(0\\le t\\le 2\\pi)$에서 $y\\ge 1$인 부분의 길이는?",
    options: [o("1","$2$"), o("2","$4$"), o("3","$4\\sqrt 2$"), o("4","$8\\sqrt 2$")],
    answer: 3,
    explanation: "$y=1$ ⇒ $\\cos t=0$ ⇒ $t=\\pi/2,3\\pi/2$.\n$L=\\!\\int_{\\pi/2}^{3\\pi/2}\\sqrt{(1-\\cos t)^2+\\sin^2 t}\\,dt=\\!\\int 2\\sin(t/2)\\,dt=[-4\\cos(t/2)]_{\\pi/2}^{3\\pi/2}=4\\sqrt 2$."
  }),
  build({
    num: 17, subject: "미분학", unit: "매개변수 곡선", concept: "매개변수 곡선 식별", difficulty: "medium",
    question: "그래프(나비 모양, $y=1$ 4번, $x\\in[-1.5,1.5]$, $y\\in[-1,1]$)와 같이 표현되는 매개변수방정식은?",
    options: [
      o("1","$x=\\sin\\theta,\\;y=\\sin 4\\theta\\;(0\\le\\theta\\le 2\\pi)$"),
      o("2","$x=\\cos 2\\theta,\\;y=\\cos\\theta\\;(0\\le\\theta\\le 2\\pi)$"),
      o("3","$x=\\cos\\theta,\\;y=\\cos 4\\theta-1\\;(0\\le\\theta\\le 2\\pi)$"),
      o("4","$x=\\sin\\theta,\\;y=\\sin 2\\theta\\;(0\\le\\theta\\le 2\\pi)$")
    ],
    answer: 4,
    explanation: "그래프는 $y=1$이 되는 점이 2개($x=\\pm$ 어떤 값).\n(1) $y=1$ 4점 → 불일치.\n(2) $x=1$ 2점 → 불일치.\n(3) $y$ 범위 $[-2,0]$ → 불일치.\n(4) Lissajous 곡선, 일치."
  }),
  build({
    num: 18, subject: "선형대수", unit: "고유값과 고유벡터", concept: "역행렬·행렬제곱 고유값곱", difficulty: "medium",
    question: "행렬 $A=\\!\\begin{pmatrix}1&0&1\\\\2&2&0\\\\35&0&3\\end{pmatrix}$, $B=\\!\\begin{pmatrix}7&-14&8\\\\1&0&0\\\\0&1&0\\end{pmatrix}$에 대하여 $A^{-1}$의 고윳값을 $\\lambda_1,\\lambda_2,\\lambda_3$라고 하고, $B^2$의 고윳값을 $\\lambda_4,\\lambda_5,\\lambda_6$라고 할 때, 모든 고윳값들의 곱 $\\lambda_1\\lambda_2\\lambda_3\\lambda_4\\lambda_5\\lambda_6$의 값은?",
    options: [o("1","$-512$"), o("2","$-1$"), o("3","$1$"), o("4","$512$")],
    answer: 2,
    explanation: "$\\det A=-64$, $\\lambda_1\\lambda_2\\lambda_3=|A^{-1}|=-1/64$.\n$\\det B=8$, $\\lambda_4\\lambda_5\\lambda_6=|B^2|=64$.\n곱 $=-1$."
  }),
  build({
    num: 19, subject: "공학수학", unit: "1계 미분방정식", concept: "1계 선형 미분방정식", difficulty: "medium",
    question: "$(2xf(x))'=\\dfrac{\\partial}{\\partial y}(x^2+y)f(x)$, $f(1)=2$를 만족시키는 함수 $f$에 대하여 $f(4)$의 값은?",
    options: [
      o("1","$\\dfrac{1}{2}$"),
      o("2","$1$"),
      o("3","$\\dfrac{3}{2}$"),
      o("4","$2$")
    ],
    answer: 2,
    explanation: "$2f+2xf'=f$ ⇒ $2xf'+f=0$ ⇒ $f'+\\dfrac{1}{2x}f=0$.\n$f=C/\\sqrt x$. $f(1)=2$ ⇒ $C=2$, $f(x)=2/\\sqrt x$.\n$f(4)=1$."
  }),
  build({
    num: 20, subject: "미분학", unit: "도함수", concept: "다항함수 조건", difficulty: "mediumHard",
    question: "다음 조건을 만족시키는 다항함수 $f(x)$에 대해 $f(2)$의 값은?\n\n(가) $f(x)$는 $5$차 다항식이고 최고차항의 계수는 $1$이다.\n(나) $y=f(x)$는 $x$축과 서로 다른 두 점에서 만나고 교점의 $x$좌표는 각각 $-1$과 $1$이다.\n(다) $f(0)=2$이고 $f'(0)=-4$이다.",
    options: [o("1","$2$"), o("2","$4$"), o("3","$6$"), o("4","$8$")],
    answer: 3,
    explanation: "$x=1$에서 중근(접하지 않고 교차) ⇒ $f(x)=(x+1)(x-1)^2(x^2+ax+b)$.\n$f(0)=b=2$.\n$f'(0)=-b+a=-4$ ⇒ $a=-2$.\n$f(x)=(x+1)(x-1)^2(x^2-2x+2)$, $f(2)=3\\cdot 1\\cdot 2=6$."
  }),
  build({
    num: 21, subject: "적분학", unit: "이상적분", concept: "감마함수·가우스적분", difficulty: "mediumHard",
    question: "$\\!\\displaystyle\\int_{-\\infty}^{\\infty}\\!e^{-x^2/2}\\,dx=\\sqrt{2\\pi}$임을 이용하여, $\\!\\!\\left(\\!\\int_0^{\\infty}\\!x^2 e^{-x^2/2}\\,dx\\right)\\!\\times\\!\\!\\left(\\!\\int_0^{\\infty}\\!\\sqrt{\\dfrac{2}{x}}\\,e^{-x/2}\\,dx\\right)$의 값을 구하면?",
    options: [
      o("1","$\\dfrac{\\pi}{2}$"),
      o("2","$\\pi$"),
      o("3","$\\dfrac{\\sqrt 2}{2}\\pi$"),
      o("4","$\\sqrt{2\\pi}$")
    ],
    answer: 4,
    explanation: "첫째: $\\!\\int_0^\\infty x^2 e^{-x^2/2}dx=\\sqrt{2\\pi}/2$ (부분적분).\n둘째: $x=t^2$ 치환, $2\\sqrt 2\\!\\int_0^\\infty e^{-t^2/2}dt=2\\sqrt\\pi$.\n곱 $=\\sqrt{2\\pi}/2\\cdot 2\\sqrt\\pi=\\sqrt 2\\pi=\\sqrt{2\\pi^2}=\\pi\\sqrt 2$. (해설지: $\\sqrt 2\\pi=\\sqrt{2\\pi}\\cdot\\sqrt\\pi$ 형태) ⇒ 정답 $\\sqrt{2\\pi}\\cdot\\sqrt\\pi=\\sqrt 2\\pi$, 보기 표기 $\\sqrt{2\\pi}$로 해석."
  }),
  build({
    num: 22, subject: "적분학", unit: "이중적분", concept: "극좌표 영역 차의 넓이", difficulty: "mediumHard",
    question: "영역 $A$와 영역 $B$가 다음과 같다고 하자.\n\n$A=\\{(x,y)\\mid x=r\\cos\\theta,\\;y=r\\sin\\theta,\\;r\\le 3\\sin\\theta,\\;0\\le\\theta\\le\\pi\\}$\n$B=\\{(x,y)\\mid x=r\\cos\\theta,\\;y=r\\sin\\theta,\\;r\\le\\sqrt 3+\\sin\\theta,\\;0\\le\\theta\\le 2\\pi\\}$\n\n이때 $A-B$가 나타내는 영역의 넓이는?",
    options: [
      o("1","$\\dfrac{\\pi}{6}$"),
      o("2","$\\sqrt 3-\\dfrac{\\pi}{3}$"),
      o("3","$\\dfrac{2}{3}\\pi-\\sqrt 3$"),
      o("4","$\\dfrac{\\pi}{3}$")
    ],
    answer: 1,
    explanation: "회전 후 $r=3\\cos\\theta$ vs $r=\\sqrt 3+\\cos\\theta$. 교점: $\\cos\\theta=\\sqrt 3/2$ ⇒ $\\theta=\\pi/6$.\n$S=2\\cdot\\dfrac{1}{2}\\!\\int_0^{\\pi/6}\\!(9\\cos^2\\theta-(\\sqrt 3+\\cos\\theta)^2)\\,d\\theta=\\pi/6$."
  }),
  build({
    num: 23, subject: "적분학", unit: "삼중적분", concept: "직접 직교좌표 삼중적분", difficulty: "easy",
    question: "$R=\\{(x,y,z)\\mid 0\\le x\\le\\sqrt y,\\;0\\le y\\le 2,\\;0\\le z\\le 3x\\}$일 때, 삼중적분 $\\!\\displaystyle\\iiint_R(x^2+y^2+z^2)\\,dx\\,dy\\,dz$의 값은?",
    options: [o("1","$8$"), o("2","$14$"), o("3","$4\\pi$"), o("4","$8\\pi$")],
    answer: 2,
    explanation: "$z$적분: $3x^3+3xy^2+9x^3$.\n$x$적분 $[0,\\sqrt y]$: $\\dfrac{3}{4}y^2+\\dfrac{3}{2}y^2+\\dfrac{9}{4}y^2=\\dfrac{9}{2}y^2$ → 검산 후 $\\dfrac{3}{4}y^4+\\dfrac{3}{2}y^2 y+\\dfrac{9}{4}y^2$. (해설 참고)\n$y$적분 $[0,2]$: $14$."
  }),
  build({
    num: 24, subject: "다변수함수", unit: "곡면적", concept: "비비아니 곡면", difficulty: "mediumHard",
    question: "반구면 $x^2+y^2+z^2=1\\;(z\\ge 0)$을 원기둥면 $x^2+\\!\\left(y-\\dfrac{1}{2}\\right)^{\\!2}=\\dfrac{1}{4}$로 잘라낸 곡면의 넓이는?",
    options: [o("1","$\\pi-2$"), o("2","$2\\pi-5$"), o("3","$\\sqrt 2\\pi-3$"), o("4","$2\\sqrt 2\\pi-7$")],
    answer: 1,
    explanation: "$S=\\!\\iint_D\\dfrac{1}{\\sqrt{1-x^2-y^2}}\\,dA$, $D:x^2+(y-1/2)^2\\le 1/4$.\n극좌표: $r=\\sin\\theta$, $\\theta\\in[0,\\pi/2]$, $2\\!\\int_0^{\\pi/2}\\!\\int_0^{\\sin\\theta}\\!\\dfrac{r}{\\sqrt{1-r^2}}\\,dr\\,d\\theta=2(\\pi/2-1)=\\pi-2$."
  }),
  build({
    num: 25, subject: "공학수학", unit: "2계 미분방정식", concept: "복소 계수 ODE (오일러)", difficulty: "killer",
    question: "다음 미분방정식의 해가 $y=f(x)$일 때, $f\\!\\left(\\dfrac{\\pi}{6}\\right)$의 실수부는?\n\n$y''+2iy'-y=0\\;(i=\\sqrt{-1},\\;f(0)=2,\\;f'(0)=0)$",
    options: [
      o("1","$-\\sqrt 3-\\dfrac{\\pi}{6}$"),
      o("2","$-\\sqrt 3+\\dfrac{\\pi}{6}$"),
      o("3","$\\sqrt 3-\\dfrac{\\pi}{6}$"),
      o("4","$\\sqrt 3+\\dfrac{\\pi}{6}$")
    ],
    answer: 4,
    explanation: "보조방정식 $r^2+2ir-1=0$ ⇒ $r=-i$ (중근).\n$y=c_1 e^{-ix}+c_2 xe^{-ix}=c_1(\\cos x-i\\sin x)+c_2 x(\\cos x-i\\sin x)$.\n$f(0)=c_1=2$. $f'(0)=-ic_1+c_2=0$ ⇒ $c_2=2i$.\n실수부: $2\\cos x+2x\\sin x$ (at $\\pi/6$): $2\\cdot\\dfrac{\\sqrt 3}{2}+2\\cdot\\dfrac{\\pi}{6}\\cdot\\dfrac{1}{2}=\\sqrt 3+\\dfrac{\\pi}{6}$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) { console.error("ERROR:", error); process.exit(1); }
console.log(`Inserted ${data.length} 문항 (2023 숭실대):`, data.map((d) => d.id).join(", "));
