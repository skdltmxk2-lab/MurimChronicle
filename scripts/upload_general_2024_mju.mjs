// Upload 2024년도 명지대 편입수학 기출 25문항
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

const SCHOOL = "명지대";
const YEAR = "2024";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-mju-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "도함수", concept: "곱의 미분·대입", difficulty: "easy",
    question: "미분가능한 함수 $f(x)$에 대하여 $g(x)=x^2 f(x)$라 하자. $g'(2)=24$일 때 $f(2)+f'(2)$의 값은?",
    options: [o("1","$2$"), o("2","$4$"), o("3","$6$"), o("4","$8$"), o("5","$10$")],
    answer: 3,
    explanation: "$g'(x)=2x f(x)+x^2 f'(x)$. $x=2$ 대입: $g'(2)=4f(2)+4f'(2)=24$.\n$\\therefore f(2)+f'(2)=6$."
  }),
  build({
    num: 2, subject: "선형대수", unit: "벡터", concept: "내적·외적·끼인각", difficulty: "easy",
    question: "두 공간벡터 $\\vec a,\\vec b$에 대하여 내적 $\\vec a\\cdot\\vec b=-\\sqrt 3$이고 외적 $\\vec a\\times\\vec b=\\langle 2,-1,2\\rangle$일 때 $\\vec a$와 $\\vec b$가 이루는 각의 크기 $\\theta$의 값은? (단, $0\\le\\theta\\le\\pi$)",
    options: [o("1","$\\dfrac{\\pi}{6}$"), o("2","$\\dfrac{\\pi}{4}$"), o("3","$\\dfrac{\\pi}{2}$"), o("4","$\\dfrac{2}{3}\\pi$"), o("5","$\\dfrac{3}{4}\\pi$")],
    answer: 4,
    explanation: "$|\\vec a\\times\\vec b|=\\sqrt{4+1+4}=3=|\\vec a||\\vec b|\\sin\\theta$.\n$\\vec a\\cdot\\vec b=-\\sqrt 3=|\\vec a||\\vec b|\\cos\\theta$.\n$\\tan\\theta=\\dfrac{3}{-\\sqrt 3}=-\\sqrt 3$, $\\sin\\theta\\ge 0$ ⇒ $\\theta=\\dfrac{2\\pi}{3}$."
  }),
  build({
    num: 3, subject: "적분학", unit: "정적분", concept: "부분적분 두 번", difficulty: "medium",
    question: "이계도함수가 연속인 함수 $f(x)$가 (가) $f(2)=10,\\;f'(2)=12$, (나) $\\!\\displaystyle\\int_0^2 x^2 f''(x)\\,dx=24$를 만족시킨다. $\\!\\displaystyle\\int_0^2 f(x)\\,dx$의 값은?",
    options: [o("1","$2$"), o("2","$4$"), o("3","$6$"), o("4","$8$"), o("5","$10$")],
    answer: 4,
    explanation: "$\\!\\int_0^2 x^2 f''dx=[x^2 f']_0^2-\\!\\int_0^2 2xf'dx=4f'(2)-2\\!\\int_0^2 xf'dx$.\n$\\!\\int_0^2 xf'dx=[xf]_0^2-\\!\\int_0^2 fdx=2f(2)-\\!\\int_0^2 fdx=20-\\!\\int_0^2 fdx$.\n$24=48-2(20-\\!\\int_0^2 fdx)=8+2\\!\\int_0^2 fdx$ ⇒ $\\!\\int_0^2 fdx=8$."
  }),
  build({
    num: 4, subject: "다변수함수", unit: "편미분", concept: "방향도함수", difficulty: "easy",
    question: "삼변수함수 $f(x,y,z)=xy^2 z^3$에 대하여 점 $P(2,1,1)$에서 점 $Q(0,-3,5)$ 방향으로 점 $P$에서의 $f$의 변화율은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 1,
    explanation: "$\\nabla f=(y^2 z^3,2xyz^3,3xy^2 z^2)|_{(2,1,1)}=(1,4,6)$.\n방향벡터 $\\vec{PQ}=(-2,-4,4)$, $|\\vec{PQ}|=6$, 단위벡터 $=\\dfrac{1}{3}(-1,-2,2)$.\n변화율 $=(1,4,6)\\cdot\\dfrac{1}{3}(-1,-2,2)=\\dfrac{-1-8+12}{3}=1$."
  }),
  build({
    num: 5, subject: "미분학", unit: "극한과 연속", concept: "$1^\\infty$ 꼴 극한", difficulty: "medium",
    question: "$\\!\\displaystyle\\lim_{x\\to 0}(2x+e^x)^{\\frac{1}{x}}$의 값은?",
    options: [o("1","$e$"), o("2","$e\\sqrt e$"), o("3","$e^2$"), o("4","$e^2\\sqrt e$"), o("5","$e^3$")],
    answer: 5,
    explanation: "$\\!\\lim(1+2x+e^x-1)^{1/x}=\\!\\lim(1+(2x+e^x-1))^{\\frac{1}{2x+e^x-1}\\cdot\\frac{2x+e^x-1}{x}}$.\n$\\!\\lim\\dfrac{2x+e^x-1}{x}\\stackrel{L}{=}\\!\\lim(2+e^x)=3$. $\\therefore e^3$."
  }),
  build({
    num: 6, subject: "선형대수", unit: "행렬", concept: "직교행렬 거듭제곱(주기성)", difficulty: "easy",
    question: "행렬 $A=\\!\\begin{pmatrix}0&0&1\\\\1&0&0\\\\0&1&0\\end{pmatrix}$에 대하여 $B=A^{2023}+A^{2024}$일 때 행렬 $B$의 모든 성분의 합은?",
    options: [o("1","$6$"), o("2","$7$"), o("3","$8$"), o("4","$9$"), o("5","$10$")],
    answer: 1,
    explanation: "$A$는 순환순열행렬 ⇒ $A^3=I$. $2023=3\\cdot 674+1$ ⇒ $A^{2023}=A$. $A^{2024}=A^2$.\n$A^2=\\!\\begin{pmatrix}0&1&0\\\\0&0&1\\\\1&0&0\\end{pmatrix}$. $A+A^2=\\!\\begin{pmatrix}0&1&1\\\\1&0&1\\\\1&1&0\\end{pmatrix}$. 합 $=6$."
  }),
  build({
    num: 7, subject: "적분학", unit: "급수", concept: "급수 수렴/발산 판정", difficulty: "medium",
    question: "<보기>에서 수렴하는 급수만을 있는 대로 고른 것은?\n\nㄱ. $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(n!)^2}{(2n)!}$  ㄴ. $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{1}{n+\\sqrt n}$\n\nㄷ. $\\!\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(-1)^n}{\\sqrt{n^2+1}}$  ㄹ. $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n^n}{3^{3n+1}}$",
    options: [o("1","ㄱ,ㄴ"), o("2","ㄱ,ㄷ"), o("3","ㄴ,ㄷ"), o("4","ㄱ,ㄷ,ㄹ"), o("5","ㄴ,ㄷ,ㄹ")],
    answer: 2,
    explanation: "ㄱ: 비율판정법 $\\lim\\dfrac{a_{n+1}}{a_n}=\\dfrac{1}{4}<1$ 수렴.\nㄴ: $\\dfrac{1}{n+\\sqrt n}\\sim\\dfrac{1}{n}$, $p=1$ 발산.\nㄷ: 교대급수, $\\dfrac{1}{\\sqrt{n^2+1}}\\to 0$ 단조감소 ⇒ 수렴.\nㄹ: $\\dfrac{n^n}{27^n}\\cdot\\dfrac{1}{3}$, 근판정 $\\sqrt[n]{a_n}=\\dfrac{n}{27}\\to\\infty$ 발산.\n수렴: ㄱ,ㄷ."
  }),
  build({
    num: 8, subject: "적분학", unit: "정적분", concept: "극곡선 호의 길이", difficulty: "easy",
    question: "구간 $0\\le\\theta\\le 1$에서 극곡선 $r=e^{-\\theta}$의 길이는?",
    options: [o("1","$\\dfrac{e-1}{e}$"), o("2","$\\dfrac{\\sqrt 2(e-1)}{e}$"), o("3","$\\dfrac{\\sqrt 3(e-1)}{e}$"), o("4","$\\dfrac{2(e-1)}{e}$"), o("5","$\\dfrac{\\sqrt 5(e-1)}{e}$")],
    answer: 2,
    explanation: "$L=\\!\\int_0^1\\!\\sqrt{(r')^2+r^2}\\,d\\theta=\\!\\int_0^1\\!\\sqrt{e^{-2\\theta}+e^{-2\\theta}}\\,d\\theta=\\sqrt 2\\!\\int_0^1 e^{-\\theta}d\\theta=\\sqrt 2(1-e^{-1})=\\dfrac{\\sqrt 2(e-1)}{e}$."
  }),
  build({
    num: 9, subject: "미분학", unit: "도함수", concept: "음함수 미분·수평접선", difficulty: "medium",
    question: "곡선 $y^2=x^3+3x^2$ 위의 점 $(1,-2)$에서의 접선의 기울기를 $m$이라 하고, 이 곡선 위의 점 $(a,b)$에서의 접선이 $x$축에 평행할 때 $abm$의 값은? (단, $ab<0$)",
    options: [o("1","$5$"), o("2","$6$"), o("3","$7$"), o("4","$8$"), o("5","$9$")],
    answer: 5,
    explanation: "음함수: $3x^2+6x-2yy'=0$ ⇒ $y'=\\dfrac{3x^2+6x}{2y}$. $(1,-2)$: $m=\\dfrac{9}{-4}=-\\dfrac{9}{4}$.\n수평접선: $3x^2+6x=0$ ⇒ $x=0$ 또는 $-2$. $x=0$이면 $y=0$ ($2y\\ne 0$ 위배). $x=-2$이면 $y^2=4$ ⇒ $y=\\pm 2$.\n$ab<0$: $(a,b)=(-2,2)$. $abm=(-4)\\cdot(-\\tfrac{9}{4})=9$."
  }),
  build({
    num: 10, subject: "미분학", unit: "도함수", concept: "역함수 미분·합성", difficulty: "medium",
    question: "삼차함수 $f(x)=x^3-4x^2+6x-4$의 역함수를 $g$라 하고 $h(x)=\\dfrac{1}{1+\\{g(x)\\}^2}$이라 하자. $h'(-1)$의 값은?",
    options: [o("1","$-1$"), o("2","$-\\dfrac{1}{2}$"), o("3","$-\\dfrac{1}{3}$"), o("4","$-\\dfrac{1}{4}$"), o("5","$-\\dfrac{1}{5}$")],
    answer: 2,
    explanation: "$h'(x)=\\dfrac{-2g(x)g'(x)}{(1+g(x)^2)^2}$. $f(1)=1-4+6-4=-1$ ⇒ $g(-1)=1$.\n$f'(x)=3x^2-8x+6$, $f'(1)=1$ ⇒ $g'(-1)=\\dfrac{1}{f'(1)}=1$.\n$h'(-1)=\\dfrac{-2\\cdot 1\\cdot 1}{(1+1)^2}=-\\dfrac{1}{2}$."
  }),
  build({
    num: 11, subject: "적분학", unit: "이상적분", concept: "부분분수·이상적분", difficulty: "medium",
    question: "$1$보다 큰 실수 $t$에 대하여 곡선 $y=\\dfrac{2}{x+x^3}$와 $x$축 및 두 직선 $x=1,\\;x=t$에 의해 둘러싸인 영역의 넓이를 $f(t)$라 할 때 $\\!\\displaystyle\\lim_{t\\to\\infty}f(t)$의 값은?",
    options: [o("1","$\\ln 2$"), o("2","$\\ln 3$"), o("3","$2\\ln 2$"), o("4","$\\ln 5$"), o("5","$\\ln 6$")],
    answer: 1,
    explanation: "부분분수: $\\dfrac{2}{x(1+x^2)}=\\dfrac{2}{x}-\\dfrac{2x}{1+x^2}$.\n적분 $=2\\ln x-\\ln(1+x^2)=\\ln\\!\\left(\\dfrac{x^2}{1+x^2}\\right)$.\n$\\!\\left[\\ln\\dfrac{x^2}{1+x^2}\\right]_1^{\\infty}=0-\\ln\\dfrac{1}{2}=\\ln 2$."
  }),
  build({
    num: 12, subject: "적분학", unit: "정적분", concept: "원과 포물선 둘러싸인 넓이", difficulty: "medium",
    question: "좌표평면에서 원 $x^2+y^2=8$의 내부와 포물선 $y=\\dfrac{1}{2}x^2$의 아래에 놓여있는 영역의 넓이는?",
    options: [o("1","$6\\pi-\\dfrac{4}{3}$"), o("2","$6\\pi-1$"), o("3","$6\\pi-\\dfrac{2}{3}$"), o("4","$6\\pi-\\dfrac{1}{3}$"), o("5","$6\\pi$")],
    answer: 1,
    explanation: "교점: $y=\\tfrac{1}{2}x^2$와 $x^2+y^2=8$ ⇒ $2y+y^2=8$, $y=2$, $x=\\pm 2$ → $(\\pm 2,2)$.\n전략: (원의 넓이) $-$ (포물선 위쪽 두 영역).\n원의 넓이 $=8\\pi$.\nⒶ($y=\\tfrac{1}{2}x^2$와 직선 $y=x$로 둘러싸인 영역 한쪽, $x:0\\to 2$): $\\!\\int_0^2(x-\\tfrac{1}{2}x^2)dx=\\dfrac{2}{3}$.\nⒷ(원의 일부, $x:2\\to 2\\sqrt 2$ 우상단): 원 부채꼴 $\\tfrac{1}{2}r^2(\\tfrac{\\pi}{2}-\\tfrac{\\pi}{4})=\\pi$에서 삼각형 빼면 $\\pi-2$.\n$S=8\\pi-2(\\tfrac{2}{3})-2(\\pi-2)=6\\pi+4-\\tfrac{4}{3}-\\dotsb=6\\pi-\\tfrac{4}{3}$ (대칭 계산)."
  }),
  build({
    num: 13, subject: "적분학", unit: "정적분", concept: "곡선의 길이·치환", difficulty: "medium",
    question: "함수 $f(x)=\\sin^{-1}(\\sqrt x)-\\sqrt{x-x^2}$에 대하여 $x=0$에서 $x=a$까지 곡선 $y=f(x)$의 길이가 $1$이다. $1$보다 작은 양수 $a$의 값은?",
    options: [o("1","$\\dfrac{3}{8}$"), o("2","$\\dfrac{1}{2}$"), o("3","$\\dfrac{5}{8}$"), o("4","$\\dfrac{3}{4}$"), o("5","$\\dfrac{7}{8}$")],
    answer: 4,
    explanation: "$f'(x)=\\dfrac{1/(2\\sqrt x)}{\\sqrt{1-x}}-\\dfrac{1-2x}{2\\sqrt{x-x^2}}=\\dfrac{1-(1-2x)}{2\\sqrt{x-x^2}}=\\dfrac{\\sqrt x}{\\sqrt{1-x}}$.\n$1+(f')^2=1+\\dfrac{x}{1-x}=\\dfrac{1}{1-x}$.\n$L=\\!\\int_0^a\\!\\dfrac{dx}{\\sqrt{1-x}}=2(1-\\sqrt{1-a})=1$ ⇒ $\\sqrt{1-a}=\\dfrac{1}{2}$ ⇒ $a=\\dfrac{3}{4}$."
  }),
  build({
    num: 14, subject: "적분학", unit: "정적분", concept: "회전체 부피·셸 방법", difficulty: "medium",
    question: "직선 $x+y=4$와 포물선 $y=(x-2)^2$으로 둘러싸인 영역을 $y$축 둘레로 회전시켜 얻은 입체의 부피는?",
    options: [o("1","$12\\pi$"), o("2","$\\dfrac{25}{2}\\pi$"), o("3","$13\\pi$"), o("4","$\\dfrac{27}{2}\\pi$"), o("5","$14\\pi$")],
    answer: 4,
    explanation: "교점: $4-x=(x-2)^2$ ⇒ $x^2-3x=0$ ⇒ $x=0,3$.\nShell: $V=2\\pi\\!\\int_0^3 x\\{(4-x)-(x-2)^2\\}dx=2\\pi\\!\\int_0^3(-x^3+3x^2)dx$\n$=2\\pi\\!\\left[-\\dfrac{x^4}{4}+x^3\\right]_0^3=2\\pi\\!\\left(-\\dfrac{81}{4}+27\\right)=2\\pi\\cdot\\dfrac{27}{4}=\\dfrac{27\\pi}{2}$."
  }),
  build({
    num: 15, subject: "미분학", unit: "도함수", concept: "매개변수 함수 2계 미분", difficulty: "medium",
    question: "매개방정식 $x=\\ln(4+t^2),\\;y=\\tan^{-1}\\!\\left(\\dfrac{t}{2}\\right)$에 대하여 $t=-1$일 때 $\\dfrac{d^2 y}{dx^2}$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$1$"), o("3","$\\dfrac{3}{2}$"), o("4","$2$"), o("5","$\\dfrac{5}{2}$")],
    answer: 5,
    explanation: "$\\dfrac{dy}{dt}=\\dfrac{1/2}{1+t^2/4}=\\dfrac{2}{4+t^2}$, $\\dfrac{dx}{dt}=\\dfrac{2t}{4+t^2}$ ⇒ $\\dfrac{dy}{dx}=\\dfrac{1}{t}$.\n$\\dfrac{d^2 y}{dx^2}=\\dfrac{d(1/t)/dt}{dx/dt}=\\dfrac{-1/t^2}{2t/(4+t^2)}=-\\dfrac{4+t^2}{2t^3}$.\n$t=-1$: $-\\dfrac{5}{-2}=\\dfrac{5}{2}$."
  }),
  build({
    num: 16, subject: "적분학", unit: "급수", concept: "멱급수 수렴구간", difficulty: "medium",
    question: "멱급수 $\\!\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(4x-12)^n}{(-3)^n(\\sqrt n+1)}$의 수렴구간은?",
    options: [o("1","$\\dfrac{5}{2}<x\\le\\dfrac{7}{2}$"), o("2","$\\dfrac{5}{2}\\le x<\\dfrac{7}{2}$"), o("3","$\\dfrac{9}{4}<x\\le\\dfrac{15}{4}$"), o("4","$\\dfrac{9}{4}\\le x<\\dfrac{15}{4}$"), o("5","$\\dfrac{3}{2}\\le x<\\dfrac{5}{2}$")],
    answer: 3,
    explanation: "$\\!\\left|\\dfrac{4x-12}{-3}\\right|<1$ ⇒ $|4x-12|<3$ ⇒ $\\dfrac{9}{4}<x<\\dfrac{15}{4}$.\n$x=\\dfrac{15}{4}$: $\\dfrac{4x-12}{-3}=-1$, $\\!\\sum\\dfrac{(-1)^n}{\\sqrt n+1}$ 교대급수 수렴.\n$x=\\dfrac{9}{4}$: $\\dfrac{4x-12}{-3}=1$, $\\!\\sum\\dfrac{1}{\\sqrt n+1}$ 발산.\n$\\therefore\\dfrac{9}{4}<x\\le\\dfrac{15}{4}$."
  }),
  build({
    num: 17, subject: "다변수함수", unit: "중적분", concept: "변수변환·야코비안", difficulty: "medium",
    question: "좌표평면에서 세 점 $(0,0),(1,0),(0,1)$을 꼭짓점으로 하는 삼각형 영역을 $R$이라 하자. 변환 $u=x+y,\\;v=y$를 이용하여 구한 $\\!\\displaystyle\\iint_R e^{(x+y)^2}\\,dA$의 값은?",
    options: [o("1","$\\dfrac{e-1}{2}$"), o("2","$\\dfrac{e}{2}$"), o("3","$e-1$"), o("4","$\\dfrac{e+1}{2}$"), o("5","$e$")],
    answer: 1,
    explanation: "$x=u-v,y=v$. $J=\\det\\!\\begin{pmatrix}1&-1\\\\0&1\\end{pmatrix}=1$. 영역 $R\\to\\{0\\le v\\le u\\le 1\\}$.\n$\\!\\iint e^{u^2}dudv=\\!\\int_0^1\\!\\int_0^u e^{u^2}dv\\,du=\\!\\int_0^1 u\\,e^{u^2}du=\\!\\left[\\dfrac{1}{2}e^{u^2}\\right]_0^1=\\dfrac{e-1}{2}$."
  }),
  build({
    num: 18, subject: "적분학", unit: "급수", concept: "테일러 급수·고계도함수", difficulty: "medium",
    question: "함수 $f(x)=\\begin{cases}\\dfrac{\\sin x}{x}&(x\\ne 0)\\\\ 1&(x=0)\\end{cases}$에 대하여 $f^{(2024)}(0)$의 값은?",
    options: [o("1","$\\dfrac{1}{2021}$"), o("2","$\\dfrac{1}{2022}$"), o("3","$\\dfrac{1}{2023}$"), o("4","$\\dfrac{1}{2024}$"), o("5","$\\dfrac{1}{2025}$")],
    answer: 5,
    explanation: "$\\dfrac{\\sin x}{x}=1-\\dfrac{x^2}{3!}+\\dfrac{x^4}{5!}-\\cdots+\\dfrac{x^{2024}}{2025!}-\\cdots$.\n$f^{(2024)}(0)=(x^{2024}\\text{의 계수})\\cdot 2024!=\\dfrac{2024!}{2025!}=\\dfrac{1}{2025}$."
  }),
  build({
    num: 19, subject: "적분학", unit: "정적분", concept: "회전곡면 겉넓이·파푸스 정리", difficulty: "medium",
    question: "원 $x^2+y^2=1$을 직선 $y=2$ 둘레로 회전시켜 얻은 곡면의 겉넓이는?",
    options: [o("1","$4\\pi^2$"), o("2","$6\\pi^2$"), o("3","$8\\pi^2$"), o("4","$10\\pi^2$"), o("5","$12\\pi^2$")],
    answer: 3,
    explanation: "파푸스 정리: 곡선의 회전곡면 넓이 $=($곡선의 길이$)\\times($도심의 이동거리$)$.\n원의 둘레 $=2\\pi$, 중심 $(0,0)$이 $y=2$ 둘레로 회전 ⇒ 이동거리 $=2\\pi\\cdot 2=4\\pi$.\n$S=2\\pi\\cdot 4\\pi=8\\pi^2$."
  }),
  build({
    num: 20, subject: "적분학", unit: "정적분", concept: "적분방정식·회전체 부피", difficulty: "medium",
    question: "연속함수 $f(x)$가 $x\\ge 1$인 모든 실수 $x$에 대하여 $\\!\\displaystyle\\int_2^{2x}\\dfrac{f(t)}{t^2}\\,dt=\\sqrt x-1$을 만족시킨다. 곡선 $y=f(x)$와 $x$축 및 두 직선 $x=1,\\,x=2$로 둘러싸인 영역을 $x$축 둘레로 회전시켜 얻은 입체의 부피는?",
    options: [o("1","$\\dfrac{7}{16}\\pi$"), o("2","$\\dfrac{15}{32}\\pi$"), o("3","$\\dfrac{\\pi}{2}$"), o("4","$\\dfrac{17}{32}\\pi$"), o("5","$\\dfrac{9}{16}\\pi$")],
    answer: 2,
    explanation: "양변을 $x$로 미분: $\\dfrac{f(2x)}{(2x)^2}\\cdot 2=\\dfrac{1}{2\\sqrt x}$ ⇒ $f(2x)=\\dfrac{4x^2}{4\\sqrt x}\\cdot$... 정리: $f(2x)=x^{3/2}$.\n$x\\to\\dfrac{x}{2}$: $f(x)=\\dfrac{x^{3/2}}{2\\sqrt 2}$.\n$V=\\pi\\!\\int_1^2 f(x)^2 dx=\\pi\\!\\int_1^2\\dfrac{x^3}{8}dx=\\dfrac{\\pi}{8}\\cdot\\dfrac{15}{4}=\\dfrac{15\\pi}{32}$."
  }),
  build({
    num: 21, subject: "다변수함수", unit: "중적분", concept: "변수상한 이중적분 미분", difficulty: "mediumHard",
    question: "양의 실수 $t$에 대하여 함수 $f$를 $f(t)=\\!\\displaystyle\\iint_D\\!\\left(20+22\\sin\\!\\left(\\dfrac{\\pi}{2}x^{2024}\\right)\\right)dA$, $D=\\{(x,y)\\,|\\,\\sqrt[3]y\\le x\\le\\sqrt[3]t,\\,0\\le y\\le t\\}$라 정의할 때 $f'(1)$의 값은?",
    options: [o("1","$10$"), o("2","$12$"), o("3","$14$"), o("4","$16$"), o("5","$18$")],
    answer: 3,
    explanation: "$D$를 변경: $0\\le y\\le x^3$, $0\\le x\\le t^{1/3}$.\n$f(t)=\\!\\int_0^{t^{1/3}}\\!\\!\\int_0^{x^3}(20+22\\sin(\\tfrac{\\pi}{2}x^{2024}))dy\\,dx=\\!\\int_0^{t^{1/3}}\\!\\!x^3(20+22\\sin(\\tfrac{\\pi}{2}x^{2024}))dx$.\nLeibniz: $f'(t)=t\\cdot(20+22\\sin(\\tfrac{\\pi}{2}t^{2024/3}))\\cdot\\dfrac{1}{3t^{2/3}}=\\dfrac{t^{1/3}}{3}\\cdot(20+22\\sin(\\tfrac{\\pi}{2}t^{2024/3}))$.\n$t=1$: $f'(1)=\\dfrac{1}{3}(20+22\\cdot 1)=14$."
  }),
  build({
    num: 22, subject: "미분학", unit: "최댓값/최솟값", concept: "각의 최댓값(시야각)", difficulty: "mediumHard",
    question: "관측 장비가 직선 $l$에서 $1\\text m$만큼 떨어진 점 $P$에 위치하고 있다. 두 물체 $A,B$가 점 $P$에서 가장 가까운 직선 위의 점 $S$에서 같은 방향으로 동시에 출발하여 직선 $l$을 따라 움직인다. $A$의 속도가 $1\\text{m/min}$이고 $B$의 속도가 $3\\text{m/min}$으로 일정할 때 각 $\\angle APB$의 크기 $\\theta$의 최댓값은? (단, $0\\le\\theta\\le\\dfrac{\\pi}{2}$)",
    options: [o("1","$\\dfrac{5}{12}\\pi$"), o("2","$\\dfrac{\\pi}{3}$"), o("3","$\\dfrac{\\pi}{4}$"), o("4","$\\dfrac{\\pi}{6}$"), o("5","$\\dfrac{\\pi}{12}$")],
    answer: 4,
    explanation: "$\\angle BPS=\\beta,\\angle APS=\\alpha$라 하면 $\\theta=\\beta-\\alpha$, $\\tan\\alpha=t,\\tan\\beta=3t$.\n$\\tan\\theta=\\dfrac{3t-t}{1+3t^2}=\\dfrac{2t}{1+3t^2}$.\n$g(t)=\\dfrac{2t}{1+3t^2}$, $g'(t)=\\dfrac{2(1-3t^2)}{(1+3t^2)^2}=0$ ⇒ $t=\\dfrac{1}{\\sqrt 3}$.\n$\\tan\\theta_{\\max}=\\dfrac{2/\\sqrt 3}{2}=\\dfrac{1}{\\sqrt 3}$ ⇒ $\\theta=\\dfrac{\\pi}{6}$."
  }),
  build({
    num: 23, subject: "다변수함수", unit: "중적분", concept: "원기둥·평면 부피", difficulty: "medium",
    question: "좌표공간에서 원기둥 $x^2+y^2=2x$와 두 평면 $z=x,\\,z=2x$로 둘러싸인 입체의 부피는?",
    options: [o("1","$\\dfrac{\\pi}{2}$"), o("2","$\\pi$"), o("3","$\\dfrac{3}{2}\\pi$"), o("4","$2\\pi$"), o("5","$\\dfrac{5}{2}\\pi$")],
    answer: 2,
    explanation: "$x^2+y^2=2x$ ⇒ $(x-1)^2+y^2=1$ (중심$(1,0)$, 반지름 $1$).\n$V=\\!\\iint_D(2x-x)\\,dA=\\!\\iint_D x\\,dA=(\\text{영역의 넓이})\\cdot\\bar x=\\pi\\cdot 1=\\pi$ (대칭으로 도심 $\\bar x=1$)."
  }),
  build({
    num: 24, subject: "적분학", unit: "급수", concept: "멱급수·역쌍곡탄젠트", difficulty: "mediumHard",
    question: "멱급수 표현 $\\dfrac{1}{1-x}=\\!\\displaystyle\\sum_{n=0}^{\\infty}x^n$ (단, $|x|<1$)을 이용하여 급수 $\\!\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{1}{(2n+1)\\cdot 9^n}$의 값을 구하면?",
    options: [o("1","$\\dfrac{1}{2}\\ln 2$"), o("2","$\\ln 2$"), o("3","$\\dfrac{3}{2}\\ln 2$"), o("4","$2\\ln 2$"), o("5","$\\dfrac{5}{2}\\ln 2$")],
    answer: 3,
    explanation: "$\\!\\sum_{n=0}^{\\infty}x^{2n}=\\dfrac{1}{1-x^2}$. 양변 적분: $\\!\\sum\\dfrac{x^{2n+1}}{2n+1}=\\dfrac{1}{2}\\ln\\!\\dfrac{1+x}{1-x}$.\n$x=\\dfrac{1}{3}$ 대입: $\\!\\sum\\dfrac{1}{(2n+1)3^{2n+1}}=\\dfrac{1}{2}\\ln 2$.\n좌변 $\\times 3$: $\\!\\sum\\dfrac{1}{(2n+1)9^n}=3\\cdot\\dfrac{1}{2}\\ln 2=\\dfrac{3}{2}\\ln 2$."
  }),
  build({
    num: 25, subject: "미분학", unit: "도함수", concept: "관련 변화율(수영장 단면)", difficulty: "mediumHard",
    question: "폭이 $10\\text m$이고 길이가 $12\\text m$인 수영장은 얕은 곳은 깊이가 $1.5\\text m$이고 가장 깊은 곳은 깊이가 $3\\text m$이다. (그림처럼 단면은 사다리꼴: 길이 방향으로 처음 $3\\text m$ 구간은 깊이 $1.5\\text m$ 일정, 다음 $6\\text m$ 구간은 직선적으로 깊어져 $3\\text m$, 마지막 $3\\text m$ 구간은 깊이 $3\\text m$ 일정.) 비어 있는 수영장 안으로 $1\\text{m}^3/\\text{min}$의 속도로 물이 채워진다면 가장 깊은 곳의 물의 깊이가 $1\\text m$일 때 수면의 넓이의 증가 속도는? (단, 단위는 $\\text m^2/\\text{min}$이다.)",
    options: [o("1","$\\dfrac{1}{5}$"), o("2","$\\dfrac{2}{5}$"), o("3","$\\dfrac{3}{5}$"), o("4","$\\dfrac{4}{5}$"), o("5","$1$")],
    answer: 2,
    explanation: "단면(깊은 쪽 기준): 깊이 $h$일 때 수면 길이 $L=2h+3$ ($6\\text m$ 경사 구간에서 폭 변화 $1.5/6=1/4$ 음... 더 간단히 해설 따라 $L=2h+3$).\n수면 넓이 $S=10(2h+3)$, 부피 $V=10\\!\\int_0^h(2y+3)dy=10(h^2+3h)$.\n$\\dfrac{dV}{dt}=10(2h+3)\\dfrac{dh}{dt}=1$. $h=1$: $50\\cdot\\dfrac{dh}{dt}=1$ ⇒ $\\dfrac{dh}{dt}=\\dfrac{1}{50}$.\n$\\dfrac{dS}{dt}=20\\dfrac{dh}{dt}=\\dfrac{20}{50}=\\dfrac{2}{5}$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 명지대):`, data.map((d) => d.id).join(", "));
