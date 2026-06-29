// Upload 2022년도 세종대 편입수학 기출 25문항 (5지선다)
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

const SCHOOL = "세종대";
const YEAR = "2022";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-sejong-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "다변수함수", unit: "편도함수", concept: "이계편도함수", difficulty: "easy",
    question: "$f(x,y)=x^2(2y+1)^3$에 대하여 $(x,y)=(2,1)$인 점에서의 이계편도함수 $\\dfrac{\\partial^2 f}{\\partial x\\partial y}$의 값을 구하면?",
    options: [o("1","$72$"), o("2","$108$"), o("3","$144$"), o("4","$216$"), o("5","$288$")],
    answer: 4,
    explanation: "먼저 $y$로 편미분: $f_y=x^2\\cdot 3(2y+1)^2\\cdot 2=6x^2(2y+1)^2$.\n다음 $x$로 편미분: $f_{yx}=12x(2y+1)^2$.\n$(2,1)$ 대입: $f_{yx}(2,1)=12\\cdot 2\\cdot 9=216$."
  }),
  build({
    num: 2, subject: "미분학", unit: "매개변수 미분", concept: "매개변수 함수의 2계 도함수", difficulty: "easy",
    question: "매개곡선 $x=t^4-1,\\,y=t^3-17t+1$에 대하여 $t=1$일 때, $\\dfrac{d^2 y}{dx^2}$의 값을 구하면?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$"), o("5","$4$")],
    answer: 4,
    explanation: "① 1계: $\\dfrac{dy}{dx}=\\dfrac{dy/dt}{dx/dt}=\\dfrac{3t^2-17}{4t^3}$.\n② 2계: $\\dfrac{d^2 y}{dx^2}=\\dfrac{d}{dt}\\!\\left(\\dfrac{dy}{dx}\\right)\\cdot\\dfrac{dt}{dx}$.\n$\\dfrac{d}{dt}\\!\\left(\\dfrac{3t^2-17}{4t^3}\\right)=\\dfrac{d}{dt}\\!\\left(\\dfrac{3}{4}t^{-1}-\\dfrac{17}{4}t^{-3}\\right)=-\\dfrac{3}{4}t^{-2}+\\dfrac{51}{4}t^{-4}$.\n$\\dfrac{dt}{dx}=\\dfrac{1}{4t^3}$.\n$t=1$ 대입: $\\!\\left(-\\dfrac{3}{4}+\\dfrac{51}{4}\\right)\\cdot\\dfrac{1}{4}=\\dfrac{48}{4}\\cdot\\dfrac{1}{4}=3$."
  }),
  build({
    num: 3, subject: "미분학", unit: "역삼각함수", concept: "$\\arccos$ 주치 보정", difficulty: "easyMedium",
    question: "함수 $f(x)=(x-\\sqrt{1-x^2})\\arccos x$에 대하여 $f\\!\\left(\\cos\\dfrac{4\\pi}{3}\\right)$를 구하면?",
    options: [o("1","$\\dfrac{(-1+\\sqrt{3})\\pi}{3}$"), o("2","$-\\dfrac{(1+\\sqrt{3})\\pi}{3}$"), o("3","$\\dfrac{2(-1+\\sqrt{3})\\pi}{3}$"), o("4","$-\\dfrac{2(1+\\sqrt{3})\\pi}{3}$"), o("5","$\\dfrac{2(1+\\sqrt{3})\\pi}{3}$")],
    answer: 2,
    explanation: "$\\cos\\dfrac{4\\pi}{3}=-\\dfrac{1}{2}$이므로 $f\\!\\left(-\\dfrac{1}{2}\\right)$.\n$\\arccos$의 치역은 $[0,\\pi]$이므로 $\\arccos\\!\\left(\\cos\\dfrac{4\\pi}{3}\\right)$를 구해야 함. $\\dfrac{4\\pi}{3}\\notin[0,\\pi]$이지만 $\\cos$ 짝함수성으로 $\\cos\\dfrac{4\\pi}{3}=\\cos\\dfrac{2\\pi}{3}$ → $\\arccos\\!\\left(-\\dfrac{1}{2}\\right)=\\dfrac{2\\pi}{3}$.\n또 $\\sqrt{1-x^2}$에서 $x=-\\dfrac{1}{2}$ → $\\sqrt{3/4}=\\dfrac{\\sqrt{3}}{2}$.\n$f\\!\\left(-\\dfrac{1}{2}\\right)=\\!\\left(-\\dfrac{1}{2}-\\dfrac{\\sqrt{3}}{2}\\right)\\!\\cdot\\dfrac{2\\pi}{3}=-\\dfrac{(1+\\sqrt{3})\\pi}{3}$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분의 응용", concept: "곡선의 길이", difficulty: "medium",
    question: "곡선 $y=\\dfrac{1}{3}(x^2+2)^{3/2}$ ($0\\le x\\le 3$)의 길이를 구하면?",
    options: [o("1","$16$"), o("2","$15$"), o("3","$14$"), o("4","$13$"), o("5","$12$")],
    answer: 5,
    explanation: "$y'=\\dfrac{1}{3}\\cdot\\dfrac{3}{2}(x^2+2)^{1/2}\\cdot 2x=x\\sqrt{x^2+2}$.\n$1+(y')^2=1+x^2(x^2+2)=x^4+2x^2+1=(x^2+1)^2$.\n$\\sqrt{1+(y')^2}=x^2+1$.\n$L=\\displaystyle\\int_0^3(x^2+1)dx=\\!\\left[\\dfrac{x^3}{3}+x\\right]_0^3=9+3=12$."
  }),
  build({
    num: 5, subject: "적분학", unit: "정적분의 계산", concept: "역쌍곡함수 적분", difficulty: "medium",
    question: "적분 $\\displaystyle\\int_0^1\\ln(x+\\sqrt{x^2+1})\\,dx$를 구하면?",
    options: [o("1","$1-\\sqrt{2}+\\ln(1+\\sqrt{2})$"), o("2","$1+\\sqrt{2}+\\ln(1+\\sqrt{2})$"), o("3","$3-\\sqrt{2}+\\ln(3+\\sqrt{2})$"), o("4","$3+\\sqrt{2}+\\ln(3+\\sqrt{2})$"), o("5","$1+\\sqrt{2}+\\ln(3+\\sqrt{2})$")],
    answer: 1,
    explanation: "$\\ln(x+\\sqrt{x^2+1})=\\sinh^{-1}x$. 부분적분 ($u=\\sinh^{-1}x,\\,dv=dx$):\n$u'=\\dfrac{1}{\\sqrt{1+x^2}},\\,v=x$.\n$\\displaystyle\\int_0^1\\!\\sinh^{-1}\\!x\\,dx=[x\\sinh^{-1}\\!x]_0^1-\\int_0^1\\dfrac{x}{\\sqrt{1+x^2}}dx$\n$=\\sinh^{-1}1-[\\sqrt{1+x^2}]_0^1=\\ln(1+\\sqrt{2})-(\\sqrt{2}-1)=1-\\sqrt{2}+\\ln(1+\\sqrt{2})$."
  }),
  build({
    num: 6, subject: "적분학", unit: "정적분의 응용", concept: "극곡선의 길이", difficulty: "medium",
    question: "극곡선 $r=\\theta^2$ ($0\\le\\theta\\le\\sqrt{5}$)의 길이를 구하면?",
    options: [o("1","$\\dfrac{13}{3}$"), o("2","$\\dfrac{16}{3}$"), o("3","$\\dfrac{19}{3}$"), o("4","$\\dfrac{22}{3}$"), o("5","$\\dfrac{25}{3}$")],
    answer: 3,
    explanation: "극곡선 길이: $L=\\displaystyle\\int\\sqrt{r^2+(r')^2}d\\theta$.\n$r=\\theta^2,\\,r'=2\\theta$ → $r^2+(r')^2=\\theta^4+4\\theta^2=\\theta^2(\\theta^2+4)$.\n$L=\\displaystyle\\int_0^{\\sqrt{5}}\\!\\theta\\sqrt{\\theta^2+4}\\,d\\theta=\\dfrac{1}{2}\\cdot\\dfrac{2}{3}\\!\\left[(\\theta^2+4)^{3/2}\\right]_0^{\\sqrt{5}}=\\dfrac{27-8}{3}=\\dfrac{19}{3}$."
  }),
  build({
    num: 7, subject: "적분학", unit: "정적분의 계산", concept: "역삼각함수 적분 (치환)", difficulty: "medium",
    question: "적분 $\\displaystyle\\int_{1/2}^{1}(\\arccos x)^2\\,dx$를 구하면?",
    options: [o("1","$\\dfrac{\\pi}{6}-2+\\sqrt{3}-\\dfrac{\\pi^2}{72}$"), o("2","$\\dfrac{\\pi}{6}+2+\\sqrt{3}-\\dfrac{\\pi^2}{72}$"), o("3","$\\dfrac{\\sqrt{3}\\pi}{3}+1-\\dfrac{\\pi^2}{18}$"), o("4","$\\dfrac{\\sqrt{3}\\pi}{3}-1-\\dfrac{\\pi^2}{18}$"), o("5","$\\dfrac{\\sqrt{3}\\pi}{3}-1+\\dfrac{\\pi^2}{18}$")],
    answer: 4,
    explanation: "$t=\\arccos x$ 치환: $dx=-\\sin t\\,dt$. $x=1/2$에서 $t=\\pi/3$, $x=1$에서 $t=0$.\n$\\displaystyle\\int_{\\pi/3}^{0}\\!t^2(-\\sin t)\\,dt=\\int_0^{\\pi/3}\\!t^2\\sin t\\,dt$.\n부분적분 두 번: $=[-t^2\\cos t+2t\\sin t+2\\cos t]_0^{\\pi/3}$.\n대입: $-\\dfrac{\\pi^2}{9}\\cdot\\dfrac{1}{2}+2\\cdot\\dfrac{\\pi}{3}\\cdot\\dfrac{\\sqrt{3}}{2}+2\\cdot\\dfrac{1}{2}-(0+0+2)=-\\dfrac{\\pi^2}{18}+\\dfrac{\\sqrt{3}\\pi}{3}+1-2=\\dfrac{\\sqrt{3}\\pi}{3}-1-\\dfrac{\\pi^2}{18}$."
  }),
  build({
    num: 8, subject: "적분학", unit: "정적분의 응용", concept: "회전면 넓이", difficulty: "medium",
    question: "곡선 $y=1-x^2$ ($0\\le x\\le 2$)을 $y$축을 중심으로 회전시켜 얻어지는 회전면의 넓이를 구하면?",
    options: [o("1","$\\dfrac{\\pi}{6}(17\\sqrt{17}-1)$"), o("2","$\\dfrac{\\pi}{5}(17\\sqrt{17}-1)$"), o("3","$\\dfrac{\\pi}{4}(17\\sqrt{17}-1)$"), o("4","$\\dfrac{\\pi}{3}(17\\sqrt{17}-1)$"), o("5","$\\dfrac{\\pi}{2}(17\\sqrt{17}-1)$")],
    answer: 1,
    explanation: "$y$축 회전면 넓이: $S=2\\pi\\!\\int x\\sqrt{1+(y')^2}dx$.\n$y'=-2x$ → $\\sqrt{1+4x^2}$.\n$\\displaystyle S=2\\pi\\!\\int_0^2 x\\sqrt{1+4x^2}\\,dx$.\n$u=1+4x^2$ 치환 ($du=8xdx$): $=2\\pi\\cdot\\dfrac{1}{8}\\cdot\\dfrac{2}{3}[(1+4x^2)^{3/2}]_0^2=\\dfrac{\\pi}{6}(17\\sqrt{17}-1)$."
  }),
  build({
    num: 9, subject: "선형대수", unit: "직교대각화", concept: "대칭행렬 행렬식 = 고윳값 곱", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}-1 & 1 & 1\\\\ 1 & 1 & 3\\\\ 1 & 3 & 3\\end{pmatrix}$을 직교대각화하였을 때, 주대각선에 나타나는 수들의 곱을 구하면?",
    options: [o("1","$-8$"), o("2","$-4$"), o("3","$0$"), o("4","$4$"), o("5","$8$")],
    answer: 5,
    explanation: "직교대각화 $D=P^T AP$에서 $D$의 주대각선은 $A$의 고윳값 $\\lambda_1,\\lambda_2,\\lambda_3$.\n주대각선의 곱 $=\\lambda_1\\lambda_2\\lambda_3=\\det A$.\n행렬식: 1행 전개로 $-1(3-9)-1(3-3)+1(3-1)=6-0+2=8$.\n따라서 $|A|=8$."
  }),
  build({
    num: 10, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피 (원통껍질)", difficulty: "medium",
    question: "곡선 $y=e^{-x^2}$과 세 직선 $y=0,\\,x=0,\\,x=1$로 둘러싸인 영역을 $y$축을 중심으로 회전시켜 얻은 입체의 부피를 구하면?",
    options: [o("1","$\\!\\left(1-\\dfrac{1}{e}\\right)\\!\\pi$"), o("2","$\\!\\left(1-\\dfrac{2}{e}\\right)\\!\\pi$"), o("3","$\\!\\left(2-\\dfrac{4}{e}\\right)\\!\\pi$"), o("4","$\\!\\left(2-\\dfrac{3}{e}\\right)\\!\\pi$"), o("5","$\\!\\left(3-\\dfrac{4}{e}\\right)\\!\\pi$")],
    answer: 1,
    explanation: "원통껍질법: $V=2\\pi\\!\\int_0^1 x\\,e^{-x^2}\\,dx$.\n$u=-x^2$ 치환: $du=-2x\\,dx$.\n$=\\pi\\int_0^{-1}\\!(-e^u)du=\\pi[e^{-x^2}]^0_1=\\pi(1-e^{-1})=\\!\\left(1-\\dfrac{1}{e}\\right)\\!\\pi$."
  }),
  build({
    num: 11, subject: "선형대수", unit: "양정치 행렬", concept: "양정치 행렬 (주소행렬식)", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}4 & 2 & 0\\\\ 2 & a & b\\\\ 0 & b & 1\\end{pmatrix}$이 있다. $\\mathbf{0}$이 아닌 임의의 $x\\in\\mathbb{R}^3$에 대하여 $x^T A x>0$이 성립하도록 하는 순서쌍 $(a,b)$로 옳지 않은 것을 고르면?",
    options: [o("1","$(2,0)$"), o("2","$(3,-1)$"), o("3","$(4,2)$"), o("4","$(12,-3)$"), o("5","$(18,4)$")],
    answer: 3,
    explanation: "$A$가 양정치 ⟺ 모든 주 부분행렬의 행렬식이 양수 (Sylvester 판정법).\n① $1\\times 1$: $4>0$ (자동 성립).\n② $2\\times 2$: $\\det\\!\\begin{pmatrix}4 & 2\\\\ 2 & a\\end{pmatrix}=4a-4>0\\Rightarrow a>1$.\n③ $3\\times 3$: $\\det A=4(a-b^2)-2\\cdot 2=4a-4b^2-4>0\\Rightarrow a-b^2>1$.\n각 보기 검증:\n• $(2,0)$: $a=2>1$, $a-b^2=2>1$. ✓\n• $(3,-1)$: $a=3>1$, $3-1=2>1$. ✓\n• $(4,2)$: $a=4>1$, $4-4=0\\not>1$. ✗\n• $(12,-3)$: $a=12>1$, $12-9=3>1$. ✓\n• $(18,4)$: $a=18>1$, $18-16=2>1$. ✓\n옳지 않은 것: $(4,2)$."
  }),
  build({
    num: 12, subject: "적분학", unit: "급수", concept: "테일러 급수 수렴반지름", difficulty: "medium",
    question: "다음 조건을 만족시키는 함수 $f(x)$의 $x=4$에서 테일러 급수의 수렴 반지름을 구하면?\n\n$f^{(n)}(4)=\\dfrac{(-2)^n n!}{3^n(n+1)}$",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$\\dfrac{2}{3}$"), o("3","$1$"), o("4","$\\dfrac{3}{2}$"), o("5","$2$")],
    answer: 4,
    explanation: "$x=4$에서 테일러 급수: $\\displaystyle f(x)=\\sum_{n=0}^{\\infty}\\dfrac{f^{(n)}(4)}{n!}(x-4)^n=\\sum_{n=0}^{\\infty}\\dfrac{(-2)^n}{3^n(n+1)}(x-4)^n$.\n비율판정법: $\\displaystyle\\lim\\!\\left|\\dfrac{a_{n+1}}{a_n}\\right|=\\lim\\dfrac{2}{3}\\cdot\\dfrac{n+1}{n+2}|x-4|=\\dfrac{2}{3}|x-4|$.\n수렴 조건: $\\dfrac{2}{3}|x-4|<1\\Rightarrow|x-4|<\\dfrac{3}{2}$.\n수렴반지름 $R=\\dfrac{3}{2}$."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "선적분", concept: "완전미분 (포텐셜 함수)", difficulty: "medium",
    question: "벡터마당 $F(x,y)=2xye^{2y}\\,\\hat i+x^2(2y+1)e^{2y}\\,\\hat j$와 경로 $C:r(t)=t^3\\hat i+t^2\\hat j$ ($0\\le t\\le 1$)에 대하여 선적분 $\\displaystyle\\int_C F\\cdot dr$을 구하면?",
    options: [o("1","$\\dfrac{e^2}{2}$"), o("2","$e^2$"), o("3","$\\dfrac{3e^2}{2}$"), o("4","$2e^2$"), o("5","$\\dfrac{5e^2}{2}$")],
    answer: 2,
    explanation: "완전성 검증: $\\partial_y(2xye^{2y})=2xe^{2y}+4xye^{2y}=2x(2y+1)e^{2y}=\\partial_x(x^2(2y+1)e^{2y})$. ✓\n포텐셜 함수 $\\phi$: $\\phi_x=2xye^{2y}\\Rightarrow\\phi=x^2 ye^{2y}+g(y)$.\n$\\phi_y=x^2 e^{2y}+2x^2 ye^{2y}+g'(y)=x^2(2y+1)e^{2y}\\Rightarrow g'(y)=0$.\n$\\phi(x,y)=x^2 ye^{2y}$.\n경로 시작 $r(0)=(0,0)$, 끝 $r(1)=(1,1)$.\n$\\displaystyle\\int_C F\\cdot dr=\\phi(1,1)-\\phi(0,0)=1\\cdot 1\\cdot e^2-0=e^2$."
  }),
  build({
    num: 14, subject: "선형대수", unit: "유니타리 대각화", concept: "정규행렬 조건", difficulty: "mediumHard",
    question: "실수 $a,b,c,d$에 대하여 다음 행렬이 유니타리(unitary) 대각화가 가능할 필요충분 조건은?\n\n$\\begin{pmatrix}a+bi & c+di\\\\ c+di & -a-bi\\end{pmatrix}$",
    options: [o("1","$b=0,\\,c=0$"), o("2","$a^2+b^2+c^2+d^2=1,\\,ad-bc=0$"), o("3","$ad-bc=0$"), o("4","$a^2+b^2+c^2+d^2=1$"), o("5","$a=0,\\,d=0$")],
    answer: 3,
    explanation: "유니타리 대각화 가능 ⟺ 정규행렬 ($A^* A=AA^*$).\n$A=\\begin{pmatrix}a+bi & c+di\\\\ c+di & -a-bi\\end{pmatrix}$, $A^*=\\begin{pmatrix}a-bi & c-di\\\\ c-di & -a+bi\\end{pmatrix}$ (켤레전치).\n$A^*A=\\begin{pmatrix}a^2+b^2+c^2+d^2 & 2(ad-bc)i\\\\ -2(ad-bc)i & a^2+b^2+c^2+d^2\\end{pmatrix}$.\n$AA^*=\\begin{pmatrix}a^2+b^2+c^2+d^2 & -2(ad-bc)i\\\\ 2(ad-bc)i & a^2+b^2+c^2+d^2\\end{pmatrix}$.\n둘이 같으려면 $ad-bc=0$."
  }),
  build({
    num: 15, subject: "다변수함수", unit: "이중적분", concept: "적분순서 변경 + 치환", difficulty: "medium",
    question: "반복적분 $\\displaystyle\\int_0^1\\!\\int_y^{y^{1/3}}\\!e^{-x^2}\\,dx\\,dy$를 구하면?",
    options: [o("1","$\\dfrac{1}{2e}$"), o("2","$\\dfrac{1}{3e}$"), o("3","$\\dfrac{1}{4e}$"), o("4","$\\dfrac{1}{5e}$"), o("5","$\\dfrac{1}{6e}$")],
    answer: 1,
    explanation: "영역: $0\\le y\\le 1$, $y\\le x\\le y^{1/3}$ → $0\\le x\\le 1$, $x^3\\le y\\le x$.\n순서 변경: $\\displaystyle\\int_0^1\\!\\int_{x^3}^{x}\\!e^{-x^2}dy\\,dx=\\int_0^1(x-x^3)e^{-x^2}dx$.\n$x^2=t$ 치환 ($dt=2x\\,dx$): $=\\dfrac{1}{2}\\int_0^1(1-t)e^{-t}dt$.\n부분적분: $\\int(1-t)e^{-t}dt=-(1-t)e^{-t}-e^{-t}=t e^{-t}+\\text{C}$? 다시: $\\int(1-t)e^{-t}dt=[-(1-t)e^{-t}]+\\int(-1)\\cdot e^{-t}dt$. 부호조정 후 $[t e^{-t}]_0^1=e^{-1}$.\n$\\dfrac{1}{2}\\cdot e^{-1}=\\dfrac{1}{2e}$."
  }),
  build({
    num: 16, subject: "적분학", unit: "급수", concept: "급수 수렴 판정 (4종)", difficulty: "medium",
    question: "다음 급수 중 수렴하는 것만을 있는 대로 고르면?\n\n(ㄱ) $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{\\sqrt{n+1}-\\sqrt{n-1}}{n}$\n(ㄴ) $\\displaystyle\\sum_{n=1}^{\\infty}\\ln\\!\\left(\\dfrac{n}{2n+1}\\right)$\n(ㄷ) $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-1)^n}{\\sqrt{n+1}}$\n(ㄹ) $\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{1}{n\\sqrt{\\ln n}}$",
    options: [o("1","ㄱ, ㄴ"), o("2","ㄱ, ㄷ"), o("3","ㄱ, ㄹ"), o("4","ㄴ, ㄷ"), o("5","ㄷ, ㄹ")],
    answer: 2,
    explanation: "(ㄱ) 수렴: 분자 유리화 $\\dfrac{\\sqrt{n+1}-\\sqrt{n-1}}{n}=\\dfrac{2}{n(\\sqrt{n+1}+\\sqrt{n-1})}\\sim\\dfrac{1}{n^{3/2}}$, $p=3/2>1$.\n(ㄴ) 발산: 일반항 극한 $\\ln\\!\\left(\\dfrac{n}{2n+1}\\right)\\to\\ln\\dfrac{1}{2}\\ne 0$ → 발산.\n(ㄷ) 수렴: 교대급수 판정. $\\dfrac{1}{\\sqrt{n+1}}\\to 0$, 단조감소.\n(ㄹ) 발산: $\\displaystyle\\int^{\\infty}\\!\\dfrac{dx}{x\\sqrt{\\ln x}}\\stackrel{u=\\ln x}{=}\\!\\int^{\\infty}\\!\\dfrac{du}{\\sqrt{u}}$ 발산.\n수렴: ㄱ, ㄷ."
  }),
  build({
    num: 17, subject: "다변수함수", unit: "삼중적분", concept: "이차형식 변환 + 구면좌표", difficulty: "mediumHard",
    question: "영역 $R=\\{(x,y,z)\\in\\mathbb{R}^3\\mid 4x^2+4xy+2y^2+z^2\\le 1\\}$에 대하여 삼중적분 $\\displaystyle\\iiint_R(4x^2+4xy+2y^2+z^2)^2\\,dV$를 구하면?",
    options: [o("1","$\\dfrac{5\\pi}{7}$"), o("2","$\\dfrac{4\\pi}{7}$"), o("3","$\\dfrac{3\\pi}{7}$"), o("4","$\\dfrac{2\\pi}{7}$"), o("5","$\\dfrac{\\pi}{7}$")],
    answer: 4,
    explanation: "이차형식 $Q(x,y,z)=4x^2+4xy+2y^2+z^2=v^T Av$, $A=\\begin{pmatrix}4 & 2 & 0\\\\ 2 & 2 & 0\\\\ 0 & 0 & 1\\end{pmatrix}$, $\\det A=4$.\n변수변환: $Q\\to X^2+Y^2+Z^2\\le 1$, Jacobian $=1/\\sqrt{\\det A}=1/2$.\n$\\displaystyle\\iiint_R Q^2 dV=\\dfrac{1}{2}\\!\\iiint_{\\rho\\le 1}\\!(X^2+Y^2+Z^2)^2 dXdYdZ$\n$=\\dfrac{1}{2}\\!\\int_0^{2\\pi}\\!\\int_0^{\\pi}\\!\\int_0^1\\!\\rho^4\\cdot\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta$\n$=\\dfrac{1}{2}\\cdot 2\\pi\\cdot 2\\cdot\\dfrac{1}{7}=\\dfrac{2\\pi}{7}$."
  }),
  build({
    num: 18, subject: "다변수함수", unit: "선적분", concept: "선적분 (Winding number)", difficulty: "mediumHard",
    question: "극곡선 $C:\\,r=1+2\\cos\\theta$ ($0\\le\\theta\\le 2\\pi$)와 벡터마당 $F(x,y)=\\!\\left\\langle\\dfrac{-2y}{(2x-1)^2+y^2},\\,\\dfrac{2x-1}{(2x-1)^2+y^2}\\right\\rangle$에 대하여 선적분 $\\displaystyle\\int_C F\\cdot dr$을 구하면?",
    options: [o("1","$0$"), o("2","$2\\pi$"), o("3","$4\\pi$"), o("4","$6\\pi$"), o("5","$8\\pi$")],
    answer: 3,
    explanation: "$X=2x-1,\\,Y=y$ 치환하면 $F=\\!\\left\\langle\\dfrac{-Y}{X^2+Y^2},\\,\\dfrac{X}{X^2+Y^2}\\right\\rangle$ — 표준 \"각도 $1$형식\". 특이점 $(X,Y)=(0,0)$, 즉 $(x,y)=(1/2,0)$.\n$\\displaystyle\\int_C F\\cdot dr=2\\pi\\cdot N$, 여기서 $N$은 $C$가 특이점을 도는 횟수(권회수).\n극곡선 $r=1+2\\cos\\theta$는 안쪽 고리(inner loop) 있는 리마송. $|2|>|1|$이라 외부 고리와 내부 고리가 서로 다른 방향이 아닌 같은 방향으로 권회 → 특이점 $(1/2,0)$를 두 번 감음.\n결과: $2\\cdot 2\\pi=4\\pi$."
  }),
  build({
    num: 19, subject: "다변수함수", unit: "면적분", concept: "발산정리 + 변수변환", difficulty: "mediumHard",
    question: "$S$가 곡면 $x^2+2y^2+4z^2=1$일 때, 벡터마당 $F(x,y,z)=\\langle x^3,\\,z^3,\\,y^3\\rangle$의 흐름량 $\\displaystyle\\iint_S F\\cdot n\\,dS$를 구하면?",
    options: [o("1","$\\dfrac{\\sqrt{2}\\pi}{5}$"), o("2","$\\dfrac{2\\sqrt{2}\\pi}{5}$"), o("3","$\\dfrac{3\\sqrt{2}\\pi}{5}$"), o("4","$\\dfrac{4\\sqrt{2}\\pi}{5}$"), o("5","$\\sqrt{2}\\pi$")],
    answer: 1,
    explanation: "$S$가 폐곡면, 발산정리: $\\nabla\\cdot F=3x^2+0+0=3x^2$.\n$\\displaystyle\\iint_S F\\cdot n\\,dS=\\iiint_T 3x^2\\,dV$.\n변수변환 $X=x,\\,Y=\\sqrt{2}y,\\,Z=2z$: $T^*=\\{X^2+Y^2+Z^2\\le 1\\}$, $dxdydz=\\dfrac{1}{2\\sqrt{2}}dXdYdZ$.\n$\\displaystyle=3\\cdot\\dfrac{1}{2\\sqrt{2}}\\!\\iiint_{T^*}\\!X^2 dV=\\dfrac{3}{2\\sqrt{2}}\\cdot\\dfrac{4\\pi}{15}=\\dfrac{12\\pi}{30\\sqrt{2}}=\\dfrac{\\sqrt{2}\\pi}{5}$.\n(구 위에서 $\\iiint X^2 dV=\\dfrac{4\\pi}{15}$.)"
  }),
  build({
    num: 20, subject: "적분학", unit: "특이적분", concept: "특이적분 수렴 판정 (3종)", difficulty: "medium",
    question: "다음 특이적분 중에서 수렴하는 것만을 있는 대로 고르면?\n\n(ㄱ) $\\displaystyle\\int_1^{\\infty}\\dfrac{\\ln x}{x^3}dx$\n(ㄴ) $\\displaystyle\\int_1^{\\infty}\\dfrac{\\sin x}{x}dx$\n(ㄷ) $\\displaystyle\\int_0^1(\\ln x)^2 dx$",
    options: [o("1","ㄱ"), o("2","ㄱ, ㄴ"), o("3","ㄱ, ㄷ"), o("4","ㄴ, ㄷ"), o("5","ㄱ, ㄴ, ㄷ")],
    answer: 5,
    explanation: "(ㄱ) 수렴: $\\dfrac{\\ln x}{x^3}\\le\\dfrac{1}{x^2}$ ($x$ 충분히 클 때) → 수렴.\n(ㄴ) 수렴: 디리클레 판정법. $\\!\\left|\\!\\int_1^M\\sin x\\,dx\\right|\\le 2$ 유계, $1/x$ 단조감소 → $0$.\n(ㄷ) 수렴: 부분적분 두 번. $\\displaystyle\\int_0^1(\\ln x)^2 dx=2$ (실제 값).\n모두 수렴: ㄱ, ㄴ, ㄷ."
  }),
  build({
    num: 21, subject: "다변수함수", unit: "최댓값·최솟값", concept: "Lagrange 승수 (또는 AM-GM)", difficulty: "mediumHard",
    question: "원점과 곡면 $xy^2 z^3=3$ 위의 점 $P$ 사이의 거리가 최소일 때, $P$의 $z$좌표의 최솟값을 $m$이라 하자. $m^{12}$을 구하면?",
    options: [o("1","$\\dfrac{241}{4}$"), o("2","$\\dfrac{243}{4}$"), o("3","$\\dfrac{245}{4}$"), o("4","$\\dfrac{247}{4}$"), o("5","$\\dfrac{249}{4}$")],
    answer: 2,
    explanation: "AM-GM 등호 활용. $x^2+y^2+z^2$를 최소화 (제약: $xy^2 z^3=3$).\n$x^2+\\dfrac{y^2}{2}+\\dfrac{y^2}{2}+\\dfrac{z^2}{3}+\\dfrac{z^2}{3}+\\dfrac{z^2}{3}\\ge 6\\sqrt[6]{\\dfrac{x^2 y^4 z^6}{108}}$.\n등호: $x^2=\\dfrac{y^2}{2}=\\dfrac{z^2}{3}$ → $y^2=2x^2,\\,z^2=3x^2$.\n제약 $xy^2 z^3=3$ 양변 제곱: $x^2 y^4 z^6=9$.\n$x^2=\\dfrac{z^2}{3}$, $y^2=\\dfrac{2z^2}{3}$ 대입: $\\dfrac{z^2}{3}\\cdot\\dfrac{4z^4}{9}\\cdot z^6=9\\Rightarrow\\dfrac{4 z^{12}}{27}=9\\Rightarrow z^{12}=\\dfrac{243}{4}$."
  }),
  build({
    num: 22, subject: "다변수함수", unit: "면적분", concept: "곡면 넓이 (변수변환)", difficulty: "mediumHard",
    question: "곡면 $z=x^2-2y^2$ ($x^2+4y^2\\le 1$)의 넓이를 구하면?",
    options: [o("1","$\\dfrac{(5\\sqrt{5}-9)\\pi}{12}$"), o("2","$\\dfrac{(5\\sqrt{5}-7)\\pi}{12}$"), o("3","$\\dfrac{5(\\sqrt{5}-1)\\pi}{12}$"), o("4","$\\dfrac{(5\\sqrt{5}-3)\\pi}{12}$"), o("5","$\\dfrac{(5\\sqrt{5}-1)\\pi}{12}$")],
    answer: 5,
    explanation: "$z_x=2x,\\,z_y=-4y$. 곡면 넓이: $\\displaystyle S=\\!\\iint_D\\sqrt{1+4x^2+16y^2}\\,dA$.\n$2y=Y$ 치환 → 영역 $x^2+Y^2\\le 1$, $dy=dY/2$:\n$S=\\dfrac{1}{2}\\!\\iint\\sqrt{1+4x^2+4Y^2}\\,dxdY=\\dfrac{1}{2}\\!\\int_0^{2\\pi}\\!\\int_0^1\\sqrt{1+4r^2}\\,r\\,dr\\,d\\theta$.\n$=\\dfrac{1}{2}\\cdot 2\\pi\\cdot\\dfrac{1}{8}\\cdot\\dfrac{2}{3}\\!\\left[(1+4r^2)^{3/2}\\right]_0^1=\\dfrac{\\pi}{12}(5\\sqrt{5}-1)$."
  }),
  build({
    num: 23, subject: "선형대수", unit: "선형변환", concept: "유사변환과 대칭성", difficulty: "medium",
    question: "$R:\\mathbb{R}^2\\to\\mathbb{R}^2$은 원점을 중심으로 하는 회전변환이다. $T:\\mathbb{R}^2\\to\\mathbb{R}^2$은 모든 $x,y\\in\\mathbb{R}^2$에 대하여 $T(x)\\cdot y=x\\cdot T(y)$를 만족시키는 선형변환이다. 정규직교기저에 대한 $S=R^{-1}\\circ T\\circ R$의 행렬 $[S]$에 대하여 항상 옳은 것을 고르면?",
    options: [o("1","$[S]$는 대칭행렬이다."), o("2","$[S]$는 반대칭행렬이다."), o("3","$[S]$는 대각행렬이다."), o("4","$[S]$는 직교행렬이다."), o("5","$[S]$는 가역행렬이다.")],
    answer: 1,
    explanation: "① $R$이 회전변환 → $R$의 행렬은 직교행렬, $R^{-1}=R^T$.\n② $T(x)\\cdot y=x\\cdot T(y)$ ⟺ $T$의 행렬이 대칭, 즉 $T^T=T$.\n($Au\\cdot v=u\\cdot Av\\Leftrightarrow A=A^T$.)\n$[S]=R^{-1}TR=R^T TR$.\n$[S]^T=(R^T TR)^T=R^T T^T(R^T)^T=R^T TR=[S]$.\n따라서 $[S]$는 대칭행렬."
  }),
  build({
    num: 24, subject: "다변수함수", unit: "삼중적분", concept: "입체 부피", difficulty: "medium",
    question: "좌표공간에서 곡면 $z=x^2$과 세 평면 $y=z,\\,y=0,\\,z=1$로 둘러싸인 영역의 부피를 구하면?",
    options: [o("1","$\\dfrac{3}{4}$"), o("2","$\\dfrac{4}{5}$"), o("3","$\\dfrac{5}{6}$"), o("4","$\\dfrac{6}{7}$"), o("5","$\\dfrac{7}{8}$")],
    answer: 2,
    explanation: "$z$축 단면 적분. 고정 $z\\in[0,1]$에서 $x^2\\le z\\Rightarrow-\\sqrt{z}\\le x\\le\\sqrt{z}$, $0\\le y\\le z$.\n$\\displaystyle V=\\int_0^1\\!\\int_0^z\\!\\int_{-\\sqrt{z}}^{\\sqrt{z}}dx\\,dy\\,dz=\\int_0^1\\!\\int_0^z 2\\sqrt{z}\\,dy\\,dz=\\int_0^1 2z\\sqrt{z}\\,dz$\n$=\\!\\left[\\dfrac{4 z^{5/2}}{5}\\right]_0^1=\\dfrac{4}{5}$."
  }),
  build({
    num: 25, subject: "다변수함수", unit: "벡터와 공간도형", concept: "구의 접선 + 코시-슈바르츠", difficulty: "mediumHard",
    question: "구 $S:\\,x^2+y^2+z^2=2$ 위의 점 $P$와 점 $(2,3,-4)$를 지나는 직선이 $S$에 접할 때, $P$의 $y$좌표의 최댓값과 최솟값의 합을 구하면?",
    options: [o("1","$\\dfrac{16}{29}$"), o("2","$\\dfrac{15}{29}$"), o("3","$\\dfrac{14}{29}$"), o("4","$\\dfrac{13}{29}$"), o("5","$\\dfrac{12}{29}$")],
    answer: 5,
    explanation: "접점에서 법선벡터 $\\vec{OP}=(x,y,z)$와 접선 $\\overrightarrow{P(2,3,-4)}=(x-2,y-3,z+4)$이 수직.\n$(2x,2y,2z)\\cdot(x-2,y-3,z+4)=0\\Rightarrow 2(x^2+y^2+z^2)-4x-6y+8z=0$.\n$x^2+y^2+z^2=2$ 대입: $4-4x-6y+8z=0\\Rightarrow 2x+3y-4z=2$.\n점 $P$는 평면 $2x+3y-4z=2$와 구 $x^2+y^2+z^2=2$의 교선.\n$y$의 범위: $x,z$에 코시-슈바르츠. $(2^2+4^2)(x^2+z^2)\\ge(2x-4z)^2$.\n$(2x-4z)^2=(2-3y)^2$, $x^2+z^2=2-y^2$.\n$20(2-y^2)\\ge(2-3y)^2=4-12y+9y^2\\Rightarrow 29y^2-12y-36\\le 0$.\n근의 합 $\\alpha+\\beta=\\dfrac{12}{29}$ (이차방정식 근과 계수). 따라서 $y$좌표의 최댓값+최솟값$=\\dfrac{12}{29}$."
  }),
];

console.log(`Uploading ${problems.length} problems for ${SCHOOL} ${YEAR}...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
console.log(`✅ Inserted ${data?.length ?? 0} questions for ${SCHOOL} ${YEAR}`);
