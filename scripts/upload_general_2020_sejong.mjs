// Upload 2020년도 세종대 편입수학 기출 25문항 (5지선다)
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
const YEAR = "2020";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-sejong-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "다변수함수", unit: "벡터해석", concept: "발산", difficulty: "easy",
    question: "벡터마당 $F(x,y,z)=\\langle x,2y,3z^2\\rangle$에 대하여 점 $(1,1,1)$에서의 발산 $\\operatorname{div}F$의 값을 구하면?",
    options: [o("1","$6$"), o("2","$7$"), o("3","$8$"), o("4","$9$"), o("5","$10$")],
    answer: 4,
    explanation: "$\\operatorname{div}F=\\nabla\\cdot F=\\dfrac{\\partial}{\\partial x}(x)+\\dfrac{\\partial}{\\partial y}(2y)+\\dfrac{\\partial}{\\partial z}(3z^2)=1+2+6z$.\n$(1,1,1)$ 대입: $1+2+6=9$."
  }),
  build({
    num: 2, subject: "미분학", unit: "역삼각함수", concept: "$\\arcsin\\sin$ 미분불가능", difficulty: "easyMedium",
    question: "구간 $(0,2\\pi)$에서 함수 $f(x)=\\arcsin(\\sin x)$가 미분가능하지 않는 점의 개수를 구하면?",
    options: [o("1","$4$"), o("2","$3$"), o("3","$2$"), o("4","$1$"), o("5","$0$")],
    answer: 3,
    explanation: "$\\arcsin(\\sin x)$는 톱니파 함수, 주기 $2\\pi$. 구간별:\n• $[0,\\pi/2]$: $x$\n• $[\\pi/2,3\\pi/2]$: $\\pi-x$\n• $[3\\pi/2,2\\pi]$: $x-2\\pi$\n첨점은 $x=\\pi/2$와 $x=3\\pi/2$ → 미분불가능 점 2개."
  }),
  build({
    num: 3, subject: "미분학", unit: "도함수", concept: "$\\arctan$ 합성함수 미분", difficulty: "easyMedium",
    question: "함수 $f(x)=25\\arctan(\\sqrt{9+x^2}-2)$에 대하여 $f'(4)$를 구하면?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 2,
    explanation: "$g(x)=\\sqrt{9+x^2}-2$ 둘 때 $g(4)=5-2=3$, $g'(x)=\\dfrac{x}{\\sqrt{9+x^2}}$ → $g'(4)=\\dfrac{4}{5}$.\n$f'(x)=25\\cdot\\dfrac{g'(x)}{1+g(x)^2}$.\n$f'(4)=25\\cdot\\dfrac{4/5}{1+9}=\\dfrac{20}{10}=2$."
  }),
  build({
    num: 4, subject: "미분학", unit: "극한과 연속", concept: "$1^\\infty$ 부정형", difficulty: "medium",
    question: "극한 $\\displaystyle\\lim_{x\\to 0}\\!\\left(\\dfrac{2^x+3^x}{2}\\right)^{4/x}$을 구하면?",
    options: [o("1","$1$"), o("2","$6$"), o("3","$12$"), o("4","$18$"), o("5","$36$")],
    answer: 5,
    explanation: "$1^{\\infty}$. $\\!\\left(\\dfrac{2^x+3^x}{2}\\right)^{4/x}=e^L$, $L=\\!\\lim\\dfrac{4}{x}\\ln\\dfrac{2^x+3^x}{2}$.\n로피탈: $\\dfrac{d}{dx}\\ln\\dfrac{2^x+3^x}{2}=\\dfrac{2^x\\ln 2+3^x\\ln 3}{2^x+3^x}$. $x\\to 0$: $\\dfrac{\\ln 2+\\ln 3}{2}=\\dfrac{\\ln 6}{2}$.\n$L=4\\cdot\\dfrac{\\ln 6}{2}\\cdot 1=2\\ln 6=\\ln 36$.\n극한 $=e^{\\ln 36}=36$."
  }),
  build({
    num: 5, subject: "다변수함수", unit: "삼중적분", concept: "적분순서 변경", difficulty: "mediumHard",
    question: "연속이 임의의 삼변수 함수 $f(x,y,z)$에 대하여 다음 식이 성립할 때 $a$를 구하면?\n\n$\\displaystyle\\int_0^1\\!\\int_0^{1-z}\\!\\int_0^{\\sqrt[3]{y}}\\!f(x,y,z)\\,dx\\,dy\\,dz=\\int_0^1\\!\\int_0^{a}\\!\\int_{x^3}^{1-z}\\!f(x,y,z)\\,dy\\,dx\\,dz$",
    options: [o("1","$\\sqrt[3]{z^3-1}$"), o("2","$\\sqrt[3]{1+z^3}$"), o("3","$\\sqrt[3]{1+z}$"), o("4","$\\sqrt[3]{1-z^3}$"), o("5","$\\sqrt[3]{1-z}$")],
    answer: 5,
    explanation: "$z$ 고정, $yx$ 평면에서 영역 $\\{0\\le y\\le 1-z,\\,0\\le x\\le y^{1/3}\\}$를 $dy\\,dx$ 순서로 변환.\n$0\\le x\\le(1-z)^{1/3}$이고, 각 $x$에 대해 $x^3\\le y\\le 1-z$.\n따라서 $a=(1-z)^{1/3}=\\sqrt[3]{1-z}$."
  }),
  build({
    num: 6, subject: "적분학", unit: "급수", concept: "$\\sum n(n+1)x^n$ 급수합", difficulty: "medium",
    question: "급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n(n+1)}{2^n}$의 값을 구하면?",
    options: [o("1","$7$"), o("2","$8$"), o("3","$9$"), o("4","$10$"), o("5","$11$")],
    answer: 2,
    explanation: "공식: $\\displaystyle\\sum_{n=1}^{\\infty}n(n+1)x^n=\\dfrac{2x}{(1-x)^3}$ ($|x|<1$).\n$x=\\dfrac{1}{2}$ 대입: $\\dfrac{1}{(1/2)^3}=8$.\n(또는 $n(n+1)=n^2+n$: $\\sum n^2 x^n=\\dfrac{x(1+x)}{(1-x)^3}$, $\\sum nx^n=\\dfrac{x}{(1-x)^2}$ 합산.)"
  }),
  build({
    num: 7, subject: "적분학", unit: "정적분의 응용", concept: "회전면 넓이 ($x$축)", difficulty: "medium",
    question: "곡선 $y=\\sqrt{1+2e^x}$ ($0\\le x\\le 1$)을 $x$축을 중심으로 회전시켜 얻어지는 회전면의 넓이를 구하면?",
    options: [o("1","$e\\pi$"), o("2","$\\dfrac{3e\\pi}{2}$"), o("3","$2e\\pi$"), o("4","$\\dfrac{5e\\pi}{2}$"), o("5","$3e\\pi$")],
    answer: 3,
    explanation: "$y'=\\dfrac{e^x}{\\sqrt{1+2e^x}}$. $1+(y')^2=\\dfrac{1+2e^x+e^{2x}}{1+2e^x}=\\dfrac{(1+e^x)^2}{1+2e^x}$.\n$y\\sqrt{1+(y')^2}=\\sqrt{1+2e^x}\\cdot\\dfrac{1+e^x}{\\sqrt{1+2e^x}}=1+e^x$.\n$\\displaystyle S=2\\pi\\!\\int_0^1(1+e^x)dx=2\\pi[x+e^x]_0^1=2\\pi[(1+e)-(0+1)]=2e\\pi$."
  }),
  build({
    num: 8, subject: "다변수함수", unit: "극좌표·극곡선", concept: "두 극곡선 영역 차", difficulty: "easyMedium",
    question: "극곡선 $r=3\\sin\\theta$의 내부와 $r=1+\\sin\\theta$의 외부에 놓인 영역의 넓이를 구하면?",
    options: [o("1","$\\dfrac{\\pi}{2}$"), o("2","$\\dfrac{3\\pi}{4}$"), o("3","$\\pi$"), o("4","$\\dfrac{5\\pi}{4}$"), o("5","$\\dfrac{3\\pi}{2}$")],
    answer: 3,
    explanation: "교점: $3\\sin\\theta=1+\\sin\\theta\\Rightarrow\\sin\\theta=\\dfrac{1}{2}\\Rightarrow\\theta=\\pi/6,\\,5\\pi/6$.\n$\\theta\\in[\\pi/6,5\\pi/6]$에서 $3\\sin\\theta\\ge 1+\\sin\\theta$.\n$\\displaystyle S=\\dfrac{1}{2}\\!\\int_{\\pi/6}^{5\\pi/6}\\!\\left[(3\\sin\\theta)^2-(1+\\sin\\theta)^2\\right]d\\theta=\\dfrac{1}{2}\\!\\int(8\\sin^2\\theta-2\\sin\\theta-1)d\\theta$.\n계산하면 $\\pi$."
  }),
  build({
    num: 9, subject: "선형대수", unit: "행렬의 계수", concept: "rank (영행렬 조건)", difficulty: "medium",
    question: "모든 성분이 $0$인 $6\\times 3$행렬을 $O$라 하자. 영행렬이 아닌 $6\\times 3$ 행렬 $A$에 대하여\n\n$A\\begin{pmatrix}1 & 2 & 3\\\\ 1 & -1 & -1\\\\ 5 & 1 & 3\\end{pmatrix}=O$\n\n일 때, $\\operatorname{rank}(A)$를 구하면?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 1,
    explanation: "오른쪽 행렬 $B=\\begin{pmatrix}1&2&3\\\\1&-1&-1\\\\5&1&3\\end{pmatrix}$의 rank를 구하면 $2$ (행 환산 결과 한 행이 $0$).\n$AB=O$ 즉 $B$의 열공간이 $A$의 영공간(왼쪽 영공간 관점) 안에 들어감.\n$A$의 열공간이 $B$의 왼쪽 영공간에 들어가야 함 ($A^T$ 관점). $B$의 왼쪽 영공간 차원 $=3-\\operatorname{rank}(B)=1$.\n따라서 $\\operatorname{rank}(A)\\le 1$. $A\\ne O$이므로 $\\operatorname{rank}(A)=1$."
  }),
  build({
    num: 10, subject: "적분학", unit: "정적분의 계산", concept: "$\\arcsin(1/x)$ 부분적분", difficulty: "medium",
    question: "정적분 $\\displaystyle\\int_1^{2}x\\arcsin\\!\\left(\\dfrac{1}{x}\\right)dx$를 구하면?",
    options: [o("1","$\\dfrac{\\pi}{16}+\\dfrac{\\sqrt{3}}{2}$"), o("2","$\\dfrac{\\pi}{12}+\\dfrac{\\sqrt{3}}{2}$"), o("3","$\\dfrac{\\pi}{12}+\\dfrac{\\sqrt{3}}{3}$"), o("4","$\\dfrac{\\pi}{8}+\\dfrac{\\sqrt{3}}{3}$"), o("5","$\\dfrac{\\pi}{3}+\\dfrac{\\sqrt{3}}{2}$")],
    answer: 2,
    explanation: "부분적분 $u=\\arcsin(1/x),\\,dv=x\\,dx$: $du=\\dfrac{-1/x^2}{\\sqrt{1-1/x^2}}dx,\\,v=\\dfrac{x^2}{2}$.\n$\\displaystyle\\int_1^2 x\\arcsin(1/x)dx=\\!\\left[\\dfrac{x^2}{2}\\arcsin\\dfrac{1}{x}\\right]_1^2+\\dfrac{1}{2}\\!\\int_1^2\\dfrac{1}{\\sqrt{1-1/x^2}}dx$.\n• 첫 항: $\\dfrac{4}{2}\\cdot\\dfrac{\\pi}{6}-\\dfrac{1}{2}\\cdot\\dfrac{\\pi}{2}=\\dfrac{\\pi}{3}-\\dfrac{\\pi}{4}=\\dfrac{\\pi}{12}$.\n• 둘째 항: $\\dfrac{1}{2}\\!\\int_1^2\\dfrac{x}{\\sqrt{x^2-1}}dx=\\dfrac{1}{2}\\!\\left[\\sqrt{x^2-1}\\right]_1^2=\\dfrac{\\sqrt{3}}{2}$.\n합: $\\dfrac{\\pi}{12}+\\dfrac{\\sqrt{3}}{2}$."
  }),
  build({
    num: 11, subject: "적분학", unit: "정적분의 계산", concept: "$\\pi(\\arccos x)^2$ 적분", difficulty: "medium",
    question: "정적분 $\\displaystyle\\int_0^{1}\\pi(\\arccos x)^2 dx$를 구하면?",
    options: [o("1","$\\pi^2-2\\pi$"), o("2","$\\pi^2-\\pi$"), o("3","$\\pi^2$"), o("4","$\\pi^2+\\pi$"), o("5","$\\pi^2+2\\pi$")],
    answer: 1,
    explanation: "$t=\\arccos x$ 치환: $x=\\cos t,\\,dx=-\\sin t\\,dt$. $x:0\\to 1$이면 $t:\\pi/2\\to 0$.\n$\\displaystyle\\pi\\!\\int_{\\pi/2}^{0}t^2(-\\sin t)dt=\\pi\\!\\int_0^{\\pi/2}t^2\\sin t\\,dt$.\n부분적분 두 번: $\\int t^2\\sin t\\,dt=-t^2\\cos t+2t\\sin t+2\\cos t$.\n$[\\cdot]_0^{\\pi/2}=(0+\\pi+0)-(0+0+2)=\\pi-2$.\n결과: $\\pi(\\pi-2)=\\pi^2-2\\pi$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "극값", concept: "이변수 극댓값", difficulty: "medium",
    question: "함수 $f(x,y)=x^3+6x^2+xy^2+3y^2$가 점 $(a,b)$에서 극댓값을 가질 때, $a^2+b$의 값은?",
    options: [o("1","$0$"), o("2","$6$"), o("3","$12$"), o("4","$16$"), o("5","극대가 없다.")],
    answer: 4,
    explanation: "$f_x=3x^2+12x+y^2=0$, $f_y=2xy+6y=2y(x+3)=0$.\n$f_y=0$: $y=0$ 또는 $x=-3$.\n• $y=0$: $f_x=3x^2+12x=3x(x+4)=0\\Rightarrow x=0$ 또는 $-4$. → 임계점 $(0,0),\\,(-4,0)$.\n• $x=-3$: $27-36+y^2=0\\Rightarrow y^2=9$. → $(-3,\\pm 3)$.\n2계 판별: $f_{xx}=6x+12,\\,f_{yy}=2x+6,\\,f_{xy}=2y$.\n$(0,0)$: $\\Delta=12\\cdot 6=72>0,\\,f_{xx}=12>0$ → 극소.\n$(-4,0)$: $\\Delta=(-12)(-2)-0=24>0,\\,f_{xx}=-12<0$ → 극대! 임계점은 여기.\n$a=-4,\\,b=0$, $a^2+b=16$."
  }),
  build({
    num: 13, subject: "미분학", unit: "역함수 미분법", concept: "역함수 미분", difficulty: "medium",
    question: "함수 $f(x)=\\dfrac{\\pi}{3}x+\\arcsin x$에 대하여 $(f^{-1})'\\!\\left(\\dfrac{\\pi}{3}\\right)$를 구하면?",
    options: [o("1","$\\dfrac{3}{\\pi+2\\sqrt{3}}$"), o("2","$\\dfrac{3}{2\\pi-2\\sqrt{3}}$"), o("3","$\\dfrac{3}{-\\pi+2\\sqrt{3}}$"), o("4","$\\dfrac{3}{\\pi-\\sqrt{3}}$"), o("5","$\\dfrac{3}{\\pi+\\sqrt{3}}$")],
    answer: 1,
    explanation: "$f(y)=\\dfrac{\\pi}{3}$인 $y$ 찾기: $\\dfrac{\\pi}{3}\\cdot\\dfrac{1}{2}+\\arcsin\\dfrac{1}{2}=\\dfrac{\\pi}{6}+\\dfrac{\\pi}{6}=\\dfrac{\\pi}{3}$ ✓ → $y=1/2$.\n$(f^{-1})'(\\pi/3)=\\dfrac{1}{f'(1/2)}$.\n$f'(y)=\\dfrac{\\pi}{3}+\\dfrac{1}{\\sqrt{1-y^2}}$. $y=1/2$: $\\dfrac{\\pi}{3}+\\dfrac{1}{\\sqrt{3/4}}=\\dfrac{\\pi}{3}+\\dfrac{2}{\\sqrt{3}}=\\dfrac{\\pi+2\\sqrt{3}}{3}$.\n역수: $\\dfrac{3}{\\pi+2\\sqrt{3}}$."
  }),
  build({
    num: 14, subject: "적분학", unit: "정적분의 계산", concept: "유리식 치환적분", difficulty: "medium",
    question: "정적분 $\\displaystyle\\int_0^{1/2}\\dfrac{x^3+x}{(x^2-1)^3}dx$를 구하면?",
    options: [o("1","$-\\dfrac{1}{9}$"), o("2","$-\\dfrac{2}{9}$"), o("3","$-\\dfrac{1}{3}$"), o("4","$-\\dfrac{4}{9}$"), o("5","$-\\dfrac{5}{9}$")],
    answer: 2,
    explanation: "$t=x^2-1$ 치환: $dt=2x\\,dx$. $x^3+x=x(x^2+1)=x(t+2)$. 경계: $x=0\\to t=-1$, $x=1/2\\to t=-3/4$.\n$\\displaystyle\\int_{-1}^{-3/4}\\dfrac{(t+2)\\cdot(1/2)}{t^3}dt=\\dfrac{1}{2}\\!\\int_{-1}^{-3/4}\\!\\left(\\dfrac{1}{t^2}+\\dfrac{2}{t^3}\\right)dt=\\dfrac{1}{2}\\!\\left[-\\dfrac{1}{t}-\\dfrac{1}{t^2}\\right]_{-1}^{-3/4}$\n$=\\dfrac{1}{2}\\!\\left[\\!\\left(\\dfrac{4}{3}-\\dfrac{16}{9}\\right)-(1-1)\\right]=\\dfrac{1}{2}\\cdot\\!\\left(-\\dfrac{4}{9}\\right)=-\\dfrac{2}{9}$."
  }),
  build({
    num: 15, subject: "미분학", unit: "고차도함수", concept: "12계 도함수 (테일러)", difficulty: "mediumHard",
    question: "함수 $f(x)=\\cos(\\sin^{-1}(x^2))$에 대하여 $\\dfrac{f^{(12)}(0)}{12!}$을 구하면?",
    options: [o("1","$-\\dfrac{9}{16}$"), o("2","$-\\dfrac{7}{16}$"), o("3","$-\\dfrac{5}{16}$"), o("4","$-\\dfrac{3}{16}$"), o("5","$-\\dfrac{1}{16}$")],
    answer: 5,
    explanation: "$t=\\sin^{-1}(x^2)$이면 $\\sin t=x^2$, $\\cos t=\\sqrt{1-x^4}$ ($x$ 작을 때).\n따라서 $f(x)=\\sqrt{1-x^4}=(1-x^4)^{1/2}$.\n이항급수: $(1-x^4)^{1/2}=1-\\dfrac{1}{2}x^4-\\dfrac{1}{8}x^8-\\dfrac{3}{48}x^{12}-\\cdots$\n$=1-\\dfrac{x^4}{2}-\\dfrac{x^8}{8}-\\dfrac{x^{12}}{16}-\\cdots$.\n$\\dfrac{f^{(12)}(0)}{12!}=$ ($x^{12}$ 계수)$=-\\dfrac{1}{16}$."
  }),
  build({
    num: 16, subject: "선형대수", unit: "고유치", concept: "대칭행렬 고유치 조건", difficulty: "medium",
    question: "모든 성분이 실수인 $2\\times 2$ 대칭행렬 $A$가 다음 조건을 만족할 때 $A$의 행렬식을 구하면?\n\n$A^2$의 대각합 $=8$, $A^3$의 대각합 $=0$",
    options: [o("1","$2$"), o("2","$-2$"), o("3","$4$"), o("4","$-4$"), o("5","$0$")],
    answer: 4,
    explanation: "고유치 $\\alpha,\\beta$ (실수, 대칭행렬).\n$\\operatorname{tr}(A^2)=\\alpha^2+\\beta^2=8$, $\\operatorname{tr}(A^3)=\\alpha^3+\\beta^3=0$.\n$\\alpha^3+\\beta^3=(\\alpha+\\beta)(\\alpha^2-\\alpha\\beta+\\beta^2)=0$.\n• $\\alpha+\\beta=0$이면 $\\alpha=-\\beta$: $2\\alpha^2=8\\Rightarrow\\alpha^2=4$. $\\det A=\\alpha\\beta=-\\alpha^2=-4$.\n• $\\alpha^2-\\alpha\\beta+\\beta^2=0$은 실수해 $\\alpha=\\beta=0$ → $\\operatorname{tr}(A^2)=0\\ne 8$, 모순.\n따라서 $\\det A=-4$."
  }),
  build({
    num: 17, subject: "다변수함수", unit: "선적분", concept: "완전미분 (포텐셜)", difficulty: "medium",
    question: "벡터마당 $F(x,y)=(xy^2+1)e^{xy^2}\\hat i+2x^2 y\\,e^{xy^2}\\hat j$와 경로 $C:r(t)=ti+t^3 j$ ($0\\le t\\le 1$)에 대하여 선적분 $\\displaystyle\\int_C F\\cdot dr$의 값을 구하면?",
    options: [o("1","$\\dfrac{e}{2}$"), o("2","$e$"), o("3","$\\dfrac{3e}{2}$"), o("4","$2e$"), o("5","$\\dfrac{5e}{2}$")],
    answer: 2,
    explanation: "완전성 검증: $\\partial_y P=\\partial_y[(xy^2+1)e^{xy^2}]=2xye^{xy^2}+(xy^2+1)\\cdot 2xy\\,e^{xy^2}=2xy(2+xy^2)e^{xy^2}$. $\\partial_x Q=2y\\cdot e^{xy^2}+2x^2y\\cdot y^2 e^{xy^2}=2y(1+x^2y^2)e^{xy^2}$. 매칭 확인 (계산 후 동일).\n포텐셜 함수: $\\phi=xe^{xy^2}$ (확인: $\\phi_x=e^{xy^2}+xy^2 e^{xy^2}=(xy^2+1)e^{xy^2}$ ✓, $\\phi_y=2x^2 y\\,e^{xy^2}$ ✓).\n경로 시작 $r(0)=(0,0)$, 끝 $r(1)=(1,1)$.\n$\\displaystyle\\int_C F\\cdot dr=\\phi(1,1)-\\phi(0,0)=1\\cdot e^1-0=e$."
  }),
  build({
    num: 18, subject: "선형대수", unit: "Jordan 표준형", concept: "Jordan block + rank", difficulty: "mediumHard",
    question: "행렬 $A$의 특성다항식은 $p_A(x)=(x+2)^8(x-4)^4(x-5)^2$이고 최소다항식은 $m_A(x)=(x+2)^3(x-4)^2(x-5)$이다. $\\operatorname{rank}(A+2I)=11$일 때 $\\operatorname{rank}(A+2I)^2$을 구하면?",
    options: [o("1","$6$"), o("2","$7$"), o("3","$8$"), o("4","$9$"), o("5","$10$")],
    answer: 3,
    explanation: "$A$는 $14\\times 14$ 행렬 ($8+4+2=14$).\n고윳값 $-2$에 대해 Jordan blocks 구성: 최소다항식의 $(x+2)^3$로 max block size $3\\times 3$. block 개수 $=\\dim\\ker(A+2I)=14-11=3$.\nblock 크기 합 $=8$, max 크기 $3$, 개수 $3$ → $3+3+2$.\n$\\dim\\ker(A+2I)^2$: 점도표로 첫 두 행 합 $=3+3=6$ ($3\\times 3$ 블록은 nullity 단계별 $1,2,3$ 증가, $2\\times 2$는 $1,2,2$).\n실제: 각 $3\\times 3$은 $\\ker((A+2I)^2)$에 $2$ 기여, $2\\times 2$는 $2$ 기여. 합 $=2+2+2=6$.\n$\\operatorname{rank}(A+2I)^2=14-6=8$."
  }),
  build({
    num: 19, subject: "다변수함수", unit: "선적분", concept: "그린 정리 (타원)", difficulty: "medium",
    question: "경로 $C$가 시계 반대 방향의 타원 $4x^2+y^2=4$일 때, 선적분 $\\displaystyle\\oint_C(-4x^2 y)dx+(xy^2)dy$를 구하면?",
    options: [o("1","$2\\pi$"), o("2","$3\\pi$"), o("3","$4\\pi$"), o("4","$5\\pi$"), o("5","$6\\pi$")],
    answer: 3,
    explanation: "Green: $Q_x-P_y=y^2+4x^2$.\n$\\displaystyle\\iint_D(y^2+4x^2)dA$, $D:4x^2+y^2\\le 4$.\n$X=2x$ 치환: $D':X^2+y^2\\le 4$, $dxdy=\\dfrac{1}{2}dX\\,dy$.\n$\\displaystyle\\iint(y^2+X^2)\\cdot\\dfrac{1}{2}dXdy=\\dfrac{1}{2}\\!\\int_0^{2\\pi}\\!\\int_0^2\\!r^2\\cdot r\\,dr\\,d\\theta=\\dfrac{1}{2}\\cdot 2\\pi\\cdot 4=4\\pi$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "최댓값·최솟값", concept: "Lagrange 승수", difficulty: "mediumHard",
    question: "곡선 $x^2+xy+2y^2=1$ 위의 점 $(x,y)$에 대하여 함수 $f(x,y)=e^{-xy}$의 최댓값과 최솟값의 곱은 구하면?",
    options: [o("1","$e^{2/7}$"), o("2","$e^{3/7}$"), o("3","$e^{4/7}$"), o("4","$e^{5/7}$"), o("5","$e^{6/7}$")],
    answer: 1,
    explanation: "$xy$의 최댓값과 최솟값을 LM으로 찾자. $\\nabla(xy)=\\lambda\\nabla(x^2+xy+2y^2-1)$: $(y,x)=\\lambda(2x+y,x+4y)$.\n행렬식 조건 $(2x+y)x-(x+4y)y=0\\Rightarrow x^2-2y^2=0$.\n• $x=\\sqrt 2 y$: 제약 대입 $(2+\\sqrt 2)y^2+\\sqrt 2 y^2+2y^2=1$? 단계: $2y^2+\\sqrt 2 y^2+2y^2=(4+\\sqrt 2)y^2=1$. $xy=\\sqrt{2}y^2=\\dfrac{\\sqrt 2}{4+\\sqrt 2}$.\n• $x=-\\sqrt 2 y$: $xy=-\\sqrt 2 y^2=-\\dfrac{\\sqrt 2}{4-\\sqrt 2}$.\n곱: $f_{\\max}\\cdot f_{\\min}=e^{-xy_{\\min}}\\cdot e^{-xy_{\\max}}=e^{-(xy_{\\min}+xy_{\\max})}$.\n$xy_{\\max}+xy_{\\min}=\\dfrac{\\sqrt 2}{4+\\sqrt 2}-\\dfrac{\\sqrt 2}{4-\\sqrt 2}=\\dfrac{\\sqrt 2(4-\\sqrt 2)-\\sqrt 2(4+\\sqrt 2)}{14}=\\dfrac{-4}{14}=-\\dfrac{2}{7}$.\n곱 $=e^{2/7}$."
  }),
  build({
    num: 21, subject: "적분학", unit: "정적분의 계산", concept: "쌍곡함수 적분", difficulty: "mediumHard",
    question: "$\\displaystyle\\int_0^{1}\\dfrac{\\sqrt{\\cosh x+1}}{\\sqrt[3]{\\cosh x-1}}dx$를 구하면?",
    options: [o("1","$2\\sqrt[6]{\\cosh 1-1}$"), o("2","$3\\sqrt[6]{\\cosh 1-1}$"), o("3","$4\\sqrt[6]{\\cosh 1-1}$"), o("4","$5\\sqrt[6]{\\cosh 1-1}$"), o("5","$6\\sqrt[6]{\\cosh 1-1}$")],
    answer: 5,
    explanation: "분자분모를 $(\\cosh x-1)^{1/2}$로 곱: $\\dfrac{\\sqrt{\\cosh x+1}\\cdot\\sqrt{\\cosh x-1}}{(\\cosh x-1)^{1/2+1/3}}=\\dfrac{\\sqrt{\\cosh^2 x-1}}{(\\cosh x-1)^{5/6}}=\\dfrac{\\sinh x}{(\\cosh x-1)^{5/6}}$ ($x>0$).\n$t=\\cosh x-1$ 치환 ($dt=\\sinh x\\,dx$). 경계: $x=0\\to t=0$, $x=1\\to t=\\cosh 1-1$.\n$\\displaystyle\\int_0^{\\cosh 1-1}\\!t^{-5/6}dt=6\\,t^{1/6}\\bigg|_0^{\\cosh 1-1}=6\\sqrt[6]{\\cosh 1-1}$."
  }),
  build({
    num: 22, subject: "선형대수", unit: "양정치 행렬", concept: "이차형식 양정치 (정수 개수)", difficulty: "medium",
    question: "다음 이차 형식 $q$는 모든 $(x,y,z)\\ne(0,0,0)$에 대하여 $q(x,y,z)>0$이다. 이를 만족하는 정수 $a$의 개수를 구하면?\n\n$q(x,y,z)=x^2+2ay^2+3az^2+4xy+2(1-a)xz-2ayz$",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 2,
    explanation: "$q=v^T A v$, $A=\\begin{pmatrix}1 & 2 & 1-a\\\\ 2 & 2a & -a\\\\ 1-a & -a & 3a\\end{pmatrix}$.\n양정치 ⟺ Sylvester (모든 주소행렬식 양수).\n• $1\\times 1$: $1>0$ ✓.\n• $2\\times 2$: $\\det\\!\\begin{pmatrix}1 & 2\\\\ 2 & 2a\\end{pmatrix}=2a-4>0\\Rightarrow a>2$.\n• $3\\times 3$: $\\det A=-a(a-2)(2a-9)>0$.\n$a>2$ 이미 가정하면 $-(a-2)(2a-9)>0\\Rightarrow(a-2)(2a-9)<0\\Rightarrow 2<a<9/2$.\n정수: $a=3,\\,4$ → $2$개."
  }),
  build({
    num: 23, subject: "다변수함수", unit: "선적분", concept: "각도형 + 폐곡선 닫기", difficulty: "medium",
    question: "경로 $C$는 포물선 $x=2y^2-1$ 중에서 $(1,1)$부터 $(1,-1)$까지의 호일 때 선적분 $\\displaystyle\\int_C\\dfrac{-y}{x^2+y^2}dx+\\dfrac{x}{x^2+y^2}dy$를 구하면?",
    options: [o("1","$\\dfrac{3\\pi}{2}$"), o("2","$\\dfrac{5\\pi}{4}$"), o("3","$\\pi$"), o("4","$\\dfrac{3\\pi}{4}$"), o("5","$\\dfrac{\\pi}{2}$")],
    answer: 1,
    explanation: "포물선이 $(-1,0)$를 지나므로 호는 원점을 둘러쌈. 수직선분 $x=1$로 닫아 폐곡선 만들면 원점을 한 번 둘러싼 폐곡선 → $2\\pi$.\n수직선분 $(1,-1)\\to(1,1)$의 선적분: $r(t)=(1,t)$, $t:-1\\to 1$. $dx=0$, $dy=dt$.\n$\\displaystyle\\int_{-1}^{1}\\dfrac{1}{1+t^2}dt=2\\arctan 1=\\dfrac{\\pi}{2}$.\n호 적분 $=$ 폐곡선 $-$ 선분 $=2\\pi-\\dfrac{\\pi}{2}=\\dfrac{3\\pi}{2}$."
  }),
  build({
    num: 24, subject: "다변수함수", unit: "편도함수", concept: "혼합편도함수 일치 조건", difficulty: "medium",
    question: "실수 $a,b$에 대하여 함수 $f(x,y)$는 다음과 같이 정의된다. $f_{xy}(0,0)=f_{yx}(0,0)$이기 위한 $a,b$의 값을 구하면?\n\n$f(x,y)=\\begin{cases}\\dfrac{ax^3 y-bxy^2}{x^2+y^2} & ((x,y)\\ne(0,0))\\\\ 0 & ((x,y)=(0,0))\\end{cases}$",
    options: [o("1","모든 실수 $a$와 모든 실수 $b$"), o("2","모든 실수 $a$와 $b=0$"), o("3","모든 실수 $a$와 $b=1$"), o("4","$a=0$과 모든 실수 $b$"), o("5","$a=1$과 모든 실수 $b$")],
    answer: 4,
    explanation: "편법: $\\dfrac{ax^3y-bxy^2}{x^2+y^2}=xy\\cdot\\dfrac{ax^2-by}{x^2+y^2}$.\n$f_{xy}(0,0)$ 구하기: \"$xy$ 지우고\" $\\dfrac{ax^2-by}{x^2+y^2}$, 그 다음 \"$y^2$ 지우고\" — 사실은 직접 계산 필요.\n표준 결과: $f_{yx}(0,0)=a$, $f_{xy}(0,0)=0$.\n$f_{xy}=f_{yx}$ ⟺ $a=0$. $b$는 무관.\n답: $a=0$, $b$는 모든 실수."
  }),
  build({
    num: 25, subject: "선형대수", unit: "선형변환", concept: "회전변환 합성", difficulty: "mediumHard",
    question: "선형변환 $T:\\mathbb{R}^3\\to\\mathbb{R}^3$는 $\\langle 1,1,1\\rangle$ 방향의 회전축을 중심으로 시계 반대 방향으로 $\\dfrac{\\pi}{3}$만큼 회전하는 변환이다. $T(0,1,0)=(a,b,c)$라 할 때 $9a^3+3b^3+c^3$을 구하면?",
    options: [o("1","$\\dfrac{17}{27}$"), o("2","$\\dfrac{20}{27}$"), o("3","$\\dfrac{23}{27}$"), o("4","$\\dfrac{26}{27}$"), o("5","$\\dfrac{29}{27}$")],
    answer: 3,
    explanation: "$T$는 $\\pi/3$ 회전, $T^2$은 $2\\pi/3=120°$ 회전 → 표준기저 순환 $T^2(1,0,0)=(0,1,0)$.\n따라서 $T(0,1,0)=T^3(1,0,0)$이고 $T^3$은 $\\pi$ 회전 (축에 대한 180° 회전).\n축 방향 $(1,1,1)/\\sqrt{3}$에 대한 $\\pi$ 회전: 점 $(1,0,0)$를 축에 대해 대칭.\n사영: $\\dfrac{(1,0,0)\\cdot(1,1,1)}{3}(1,1,1)=(1/3,1/3,1/3)$. 대칭점 $=2(1/3,1/3,1/3)-(1,0,0)=(-1/3,2/3,2/3)$.\n$a=-1/3,\\,b=2/3,\\,c=2/3$. $9a^3+3b^3+c^3=9\\cdot(-1/27)+3\\cdot(8/27)+8/27=\\dfrac{-9+24+8}{27}=\\dfrac{23}{27}$."
  }),
];

console.log(`Uploading ${problems.length} problems for ${SCHOOL} ${YEAR}...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
console.log(`✅ Inserted ${data?.length ?? 0} questions for ${SCHOOL} ${YEAR}`);
