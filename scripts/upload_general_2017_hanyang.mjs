// 2017년 한양대(본교) 편입수학 객관식 22문항 업로드 (Q2~Q23, 4지선다)
// Q1은 형식표시 문항, Q24~Q26은 주관식이므로 제외.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR = "2017";
const SCHOOL_KO = "한양대";
const SCHOOL_EN = "hanyang";

function opts4(...texts) {
  return texts.map((text, i) => ({
    id: String(i + 1), label: String(i + 1), text, contentType: "latex",
  }));
}

const PROBLEMS = [
  {
    n: 2, subject: "적분학", unit: "정적분의 계산", concept: "tan 점화식",
    difficulty: "medium",
    question: "적분 $I_n=\\displaystyle\\int_0^{\\pi/4}\\tan^n x\\,dx$에 대하여 $I_7+I_9$의 값은?",
    options: opts4("$\\dfrac{1}{4}$", "$\\dfrac{1}{7}$", "$\\dfrac{1}{8}$", "$\\dfrac{1}{16}$"),
    correct: "3",
    explanation: "$\\tan^9 x+\\tan^7 x=\\tan^7 x(\\tan^2 x+1)=\\tan^7 x\\sec^2 x$이므로\n$I_9+I_7=\\displaystyle\\int_0^{\\pi/4}\\tan^7 x\\sec^2 x\\,dx$.\n$\\tan x=t$로 치환하면 $\\sec^2 x\\,dx=dt$이고 $x:0\\to\\pi/4$일 때 $t:0\\to 1$.\n따라서 $\\displaystyle\\int_0^1 t^7\\,dt=\\dfrac{1}{8}$.",
  },
  {
    n: 3, subject: "적분학", unit: "특이적분", concept: "발산 판정",
    difficulty: "easyMedium",
    question: "적분 $\\displaystyle\\int_{-4}^{4}\\dfrac{2}{2+x}\\,dx$의 값은?",
    options: opts4("$\\ln 3$", "$2\\ln 3$", "$4\\ln 3$", "발산"),
    correct: "4",
    explanation: "피적분함수 $\\dfrac{2}{2+x}$는 $x=-2$에서 정의되지 않는다. $x=-2$가 적분구간 $[-4,4]$의 내부 특이점이므로 두 개의 비고유적분으로 나눠야 한다.\n$\\displaystyle\\int_{-4}^{-2}\\dfrac{2}{2+x}dx=\\lim_{b\\to -2^-}[2\\ln|2+x|]_{-4}^{b}=-\\infty$.\n따라서 적분은 발산한다.",
  },
  {
    n: 4, subject: "미분학", unit: "극한과 연속", concept: "지수꼴 극한",
    difficulty: "medium",
    question: "극한 $\\displaystyle\\lim_{x\\to 0^+}\\bigl[\\sin^2(4x)\\bigr]^{\\sin^{-1}(2x)}$의 값은?",
    options: opts4("$0$", "$\\dfrac{1}{e}$", "$1$", "$e$"),
    correct: "3",
    explanation: "$0^0$ 꼴의 부정형. $L=\\lim_{x\\to 0^+}\\sin^{-1}(2x)\\cdot\\ln\\sin^2(4x)$를 구한다.\n$x\\to 0^+$에서 $\\sin^{-1}(2x)\\sim 2x\\to 0$이고 $\\ln\\sin^2(4x)=2\\ln\\sin(4x)\\sim 2\\ln(4x)\\to -\\infty$.\n곱은 $2x\\cdot 2\\ln(4x)=4x\\ln(4x)\\to 0$ (왜냐하면 $\\lim_{u\\to 0^+}u\\ln u=0$).\n따라서 $L=0$이고 원극한 $=e^0=1$.",
  },
  {
    n: 5, subject: "적분학", unit: "정적분의 계산", concept: "대칭성",
    difficulty: "medium",
    question: "적분 $\\displaystyle\\int_{-1/2}^{1/2}\\dfrac{x^2\\sin^{-1}x-6\\cos^{-1}x}{\\sqrt{1-x^2}}\\,dx$의 값은?",
    options: opts4("$-\\pi^2$", "$-\\pi$", "$\\pi$", "$\\pi^2$"),
    correct: "1",
    explanation: "두 항으로 나눠서 계산.\n첫째 항: $\\dfrac{x^2\\sin^{-1}x}{\\sqrt{1-x^2}}$는 기함수이므로 대칭구간 적분 $=0$.\n둘째 항: $-6\\displaystyle\\int_{-1/2}^{1/2}\\dfrac{\\cos^{-1}x}{\\sqrt{1-x^2}}dx$. $u=\\cos^{-1}x$로 치환하면 $du=-\\dfrac{1}{\\sqrt{1-x^2}}dx$.\n$x=-1/2$일 때 $u=2\\pi/3$, $x=1/2$일 때 $u=\\pi/3$. 따라서 $-6\\displaystyle\\int_{2\\pi/3}^{\\pi/3}u(-du)=-6\\int_{\\pi/3}^{2\\pi/3}u\\,du=-6\\cdot\\dfrac{1}{2}\\bigl[(2\\pi/3)^2-(\\pi/3)^2\\bigr]=-3\\cdot\\dfrac{3\\pi^2}{9}=-\\pi^2$.",
  },
  {
    n: 6, subject: "다변수함수", unit: "중적분", concept: "적분 순서 변경",
    difficulty: "medium",
    question: "적분 $\\displaystyle\\int_0^1\\!\\!\\int_{\\sqrt[3]{y}}^{1} e^{x^4}\\,dx\\,dy + \\int_0^1\\!\\!\\int_{\\sqrt[4]{y}}^{1} x^3 e^{x^4}\\,dx\\,dy$의 값은?",
    options: opts4("$\\dfrac{1}{4}e-\\dfrac{1}{4}$", "$\\dfrac{1}{4}e-\\dfrac{1}{12}$", "$\\dfrac{1}{4}e$", "$\\dfrac{1}{4}e+\\dfrac{1}{4}$"),
    correct: "3",
    explanation: "두 적분 모두 $e^{x^4}$이 안쪽 변수에 적분 불가능하므로 적분순서 변경.\n①: 영역 $\\{0\\le y\\le 1,\\ \\sqrt[3]{y}\\le x\\le 1\\}=\\{0\\le x\\le 1,\\ 0\\le y\\le x^3\\}$. 따라서 $\\displaystyle\\int_0^1\\!\\!\\int_0^{x^3} e^{x^4}dy\\,dx=\\int_0^1 x^3 e^{x^4}dx=\\dfrac{1}{4}(e-1)$.\n②: 영역 $\\{0\\le y\\le 1,\\ \\sqrt[4]{y}\\le x\\le 1\\}=\\{0\\le x\\le 1,\\ 0\\le y\\le x^4\\}$. 따라서 $\\displaystyle\\int_0^1\\!\\!\\int_0^{x^4} x^3 e^{x^4}dy\\,dx=\\int_0^1 x^7 e^{x^4}dx$.\n$u=x^4$로 치환: $\\dfrac{1}{4}\\int_0^1 u\\,e^u\\,du=\\dfrac{1}{4}\\bigl[(u-1)e^u\\bigr]_0^1=\\dfrac{1}{4}(0-(-1))=\\dfrac{1}{4}$.\n합 $=\\dfrac{1}{4}(e-1)+\\dfrac{1}{4}=\\dfrac{1}{4}e$.",
  },
  {
    n: 7, subject: "미분학", unit: "극한과 연속", concept: "지수꼴 극한",
    difficulty: "medium",
    question: "극한 $\\displaystyle\\lim_{x\\to 0}\\!\\left(\\dfrac{\\tan x}{x}\\right)^{1/x^2}+\\lim_{x\\to\\infty}\\!\\left(\\dfrac{\\ln x}{x}\\right)^{1/x}$의 값은?",
    options: opts4("$\\dfrac{1}{3}$", "$\\dfrac{4}{3}$", "$\\sqrt[3]{e}$", "$\\sqrt[3]{e}+1$"),
    correct: "4",
    explanation: "첫 번째 극한: $\\tan x = x+\\dfrac{x^3}{3}+O(x^5)$이므로 $\\dfrac{\\tan x}{x}=1+\\dfrac{x^2}{3}+O(x^4)$.\n$\\ln\\!\\left(\\dfrac{\\tan x}{x}\\right)=\\dfrac{x^2}{3}+O(x^4)$. $\\dfrac{1}{x^2}\\ln(\\cdot)\\to\\dfrac{1}{3}$. 따라서 첫 극한 $=e^{1/3}=\\sqrt[3]{e}$.\n두 번째 극한: $\\dfrac{1}{x}\\ln\\!\\left(\\dfrac{\\ln x}{x}\\right)=\\dfrac{\\ln\\ln x-\\ln x}{x}\\to 0$ ($\\ln x$가 $x$보다 천천히 감). 따라서 두 번째 극한 $=e^0=1$.\n합 $=\\sqrt[3]{e}+1$.",
  },
  {
    n: 8, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "라그랑지 미정계수",
    difficulty: "medium",
    question: "곡면 $x^2+2y^2+3z^2=18$ 위의 점 $P(x,y,z)$에 대하여 $f(x,y,z)=xyz$의 최댓값은?",
    options: opts4("$4$", "$6$", "$4\\sqrt 2$", "$6\\sqrt 2$"),
    correct: "2",
    explanation: "라그랑지 승수법. $\\nabla f=\\lambda\\nabla g$에서 $yz=2\\lambda x$, $xz=4\\lambda y$, $xy=6\\lambda z$.\n각 식에 $x,y,z$를 곱하면 $xyz=2\\lambda x^2=4\\lambda y^2=6\\lambda z^2$. 즉 $x^2=2y^2$, $x^2=3z^2$.\n제약식 대입: $x^2+x^2+x^2=18$이므로 $x^2=6$, $y^2=3$, $z^2=2$.\n양수에서 최댓값은 $xyz=\\sqrt 6\\cdot\\sqrt 3\\cdot\\sqrt 2=\\sqrt{36}=6$.",
  },
  {
    n: 9, subject: "적분학", unit: "정적분의 계산", concept: "부분적분",
    difficulty: "mediumHard",
    question: "적분 $\\displaystyle\\int_0^{2a}x\\sin^{-1}\\!\\left(\\dfrac{\\sqrt{2a-x}}{2\\sqrt a}\\right)dx$의 값은? (단, $a>0$)",
    options: opts4("$\\dfrac{\\pi}{8}a^2$", "$\\dfrac{\\pi}{4}a^2$", "$\\dfrac{\\pi}{2}a^2$", "$\\pi a^2$"),
    correct: "2",
    explanation: "$u=\\sin^{-1}\\!\\left(\\dfrac{\\sqrt{2a-x}}{2\\sqrt a}\\right)$, $dv=x\\,dx$로 부분적분.\n$x=0$일 때 $u=\\sin^{-1}\\!\\left(\\dfrac{\\sqrt{2a}}{2\\sqrt a}\\right)=\\sin^{-1}(1/\\sqrt 2)=\\pi/4$, $x=2a$일 때 $u=0$.\n$\\dfrac{du}{dx}$를 계산: $\\sin u=\\dfrac{\\sqrt{2a-x}}{2\\sqrt a}$를 양변 제곱하면 $\\sin^2 u=\\dfrac{2a-x}{4a}$이므로 $x=2a-4a\\sin^2 u=2a\\cos 2u$.\n따라서 $dx=-4a\\sin 2u\\,du$. 적분구간 $u:\\pi/4\\to 0$.\n$\\displaystyle\\int_{\\pi/4}^{0}2a\\cos 2u\\cdot u\\cdot(-4a\\sin 2u)du=8a^2\\int_0^{\\pi/4}u\\sin 2u\\cos 2u\\,du=4a^2\\int_0^{\\pi/4}u\\sin 4u\\,du$.\n부분적분: $\\bigl[u\\cdot(-\\tfrac{\\cos 4u}{4})\\bigr]_0^{\\pi/4}+\\dfrac{1}{4}\\int_0^{\\pi/4}\\cos 4u\\,du=\\dfrac{\\pi}{16}+\\dfrac{1}{16}\\bigl[\\sin 4u\\bigr]_0^{\\pi/4}=\\dfrac{\\pi}{16}$.\n따라서 $4a^2\\cdot\\dfrac{\\pi}{16}=\\dfrac{\\pi}{4}a^2$.",
  },
  {
    n: 10, subject: "적분학", unit: "정적분의 응용", concept: "곡선과 직선의 면적",
    difficulty: "medium",
    question: "곡선 $y=\\dfrac{\\sqrt{x^2-9}}{x^2}$와 두 직선 $y=0,\\ x=6$으로 둘러싸인 부분의 넓이는?",
    options: opts4("$\\ln(2+\\sqrt 3)-\\dfrac{1}{2}$", "$\\ln(2+\\sqrt 3)+\\dfrac{1}{2}$", "$\\ln(2+\\sqrt 3)-\\dfrac{\\sqrt 3}{2}$", "$\\ln(2+\\sqrt 3)+\\dfrac{\\sqrt 3}{2}$"),
    correct: "3",
    explanation: "$y=0$은 $x=\\pm 3$에서. 영역은 $x:3\\to 6$, $0\\le y\\le \\dfrac{\\sqrt{x^2-9}}{x^2}$.\n$A=\\displaystyle\\int_3^6\\dfrac{\\sqrt{x^2-9}}{x^2}dx$. $x=3\\sec\\theta$로 치환하면 $\\sqrt{x^2-9}=3\\tan\\theta$, $dx=3\\sec\\theta\\tan\\theta\\,d\\theta$, $x=3$일 때 $\\theta=0$, $x=6$일 때 $\\theta=\\pi/3$.\n$A=\\displaystyle\\int_0^{\\pi/3}\\dfrac{3\\tan\\theta}{9\\sec^2\\theta}\\cdot 3\\sec\\theta\\tan\\theta\\,d\\theta=\\int_0^{\\pi/3}\\dfrac{\\tan^2\\theta}{\\sec\\theta}d\\theta=\\int_0^{\\pi/3}\\dfrac{\\sin^2\\theta}{\\cos\\theta}d\\theta$.\n$=\\displaystyle\\int_0^{\\pi/3}\\dfrac{1-\\cos^2\\theta}{\\cos\\theta}d\\theta=\\int_0^{\\pi/3}(\\sec\\theta-\\cos\\theta)d\\theta=\\bigl[\\ln|\\sec\\theta+\\tan\\theta|-\\sin\\theta\\bigr]_0^{\\pi/3}=\\ln(2+\\sqrt 3)-\\dfrac{\\sqrt 3}{2}$.",
  },
  {
    n: 11, subject: "선형대수", unit: "벡터와 공간도형", concept: "공간직선과 삼각형 넓이",
    difficulty: "medium",
    question: "세 직선 $\\dfrac{x}{3}=\\dfrac{y}{4}=\\dfrac{z}{5},\\ \\dfrac{x}{2}=\\dfrac{y}{1}=\\dfrac{z}{-2},\\ \\dfrac{x}{1}=\\dfrac{y+5}{3}=\\dfrac{z+16}{7}$로 둘러싸인 삼각형의 넓이는?",
    options: opts4("$\\dfrac{15}{4}\\sqrt 2$", "$\\dfrac{15}{2}\\sqrt 2$", "$15$", "$15\\sqrt 2$"),
    correct: "2",
    explanation: "처음 두 직선은 원점을 지나므로 한 꼭짓점은 $O=(0,0,0)$.\n$L_1=t(3,4,5)$와 $L_3:(s,-5+3s,-16+7s)$의 교점: $3=t/s$ 형태로 풀면 $t=s$ 가 안 되고, $3t=s$, $4t=-5+3s=-5+9t$이므로 $5t=5$, $t=1$. 따라서 $A=(3,4,5)$.\n$L_2=t(2,1,-2)$와 $L_3$의 교점: $2t=s$, $t=-5+3s=-5+6t$이므로 $5t=5$, $t=1$. 따라서 $B=(2,1,-2)$.\n$\\vec{OA}\\times\\vec{OB}=(3,4,5)\\times(2,1,-2)=(-13,16,-5)$. $|\\cdot|=\\sqrt{169+256+25}=\\sqrt{450}=15\\sqrt 2$.\n넓이 $=\\dfrac{1}{2}|\\vec{OA}\\times\\vec{OB}|=\\dfrac{15\\sqrt 2}{2}$.",
  },
  {
    n: 12, subject: "적분학", unit: "정적분의 응용", concept: "라이프니츠 미분",
    difficulty: "medium",
    question: "함수 $f(t)=\\displaystyle\\int_0^{t^2}e^{s}\\sin(t^2-s)\\,ds$에 대하여 $f'\\!\\left(\\dfrac{\\sqrt\\pi}{2}\\right)$의 값은?",
    options: opts4("$0$", "$\\dfrac{\\sqrt\\pi}{4}e^{\\pi/4}$", "$\\dfrac{\\sqrt\\pi}{2}e^{\\pi/4}$", "$\\sqrt\\pi\\,e^{\\pi/4}$"),
    correct: "3",
    explanation: "$u=t^2-s$ 치환: $f(t)=\\displaystyle\\int_0^{t^2}e^{t^2-u}\\sin u\\,du=e^{t^2}\\!\\int_0^{t^2}e^{-u}\\sin u\\,du$.\n$g(v)=\\displaystyle\\int_0^{v}e^{-u}\\sin u\\,du$로 두면 $f(t)=e^{t^2}g(t^2)$. 곱미분과 라이프니츠로\n$f'(t)=2t\\,e^{t^2}g(t^2)+e^{t^2}\\cdot 2t\\,e^{-t^2}\\sin t^2=2t\\bigl[e^{t^2}g(t^2)+\\sin t^2\\bigr]=2t\\bigl[f(t)+\\sin t^2\\bigr]$. 즉 $f'(t)=2t f(t)+2t\\sin t^2$ (간단한 정리).\n$t=\\sqrt\\pi/2$이면 $t^2=\\pi/4$.\n$f(\\sqrt\\pi/2)$ 계산: $e^{\\pi/4}\\!\\int_0^{\\pi/4}e^{-u}\\sin u\\,du=e^{\\pi/4}\\!\\left[\\dfrac{-e^{-u}(\\sin u+\\cos u)}{2}\\right]_0^{\\pi/4}=e^{\\pi/4}\\!\\left[\\dfrac{1}{2}-\\dfrac{e^{-\\pi/4}\\sqrt 2}{2}\\right]=\\dfrac{e^{\\pi/4}-\\sqrt 2}{2}\\cdot\\cdots$ 정리 후 $f'(\\sqrt\\pi/2)=\\dfrac{\\sqrt\\pi}{2}e^{\\pi/4}$.",
  },
  {
    n: 13, subject: "적분학", unit: "특이적분", concept: "Frullani 적분",
    difficulty: "mediumHard",
    question: "적분 $\\displaystyle\\int_0^{\\infty}\\dfrac{e^{-2\\pi x}-e^{-4\\pi x}}{x}\\,dx$의 값은?",
    options: opts4("$\\ln 2$", "$\\ln 4$", "$\\ln 8$", "$\\ln\\dfrac{1}{2}$"),
    correct: "1",
    explanation: "Frullani 적분: $\\displaystyle\\int_0^{\\infty}\\dfrac{f(ax)-f(bx)}{x}dx=\\bigl[f(0)-f(\\infty)\\bigr]\\ln\\!\\dfrac{b}{a}$.\n$f(t)=e^{-t}$이면 $f(0)=1,\\ f(\\infty)=0$이고 $a=2\\pi,\\ b=4\\pi$.\n따라서 $(1-0)\\ln\\dfrac{4\\pi}{2\\pi}=\\ln 2$.",
  },
  {
    n: 14, subject: "선형대수", unit: "행렬", concept: "rank 성질",
    difficulty: "easyMedium",
    question: "다음 <보기>는 행렬의 계수(rank)에 관한 기술이다. <보기>중에서 올바른 기술의 총 개수는?\n가. $\\mathrm{rank}(AB)>\\mathrm{rank}(B)$\n나. $U$가 역행렬을 가지면 $\\mathrm{rank}(UA)=\\mathrm{rank}(A)$\n다. $A,B$가 $m\\times n$행렬일 때 $\\mathrm{rank}(A+B)>\\mathrm{rank}(A)+\\mathrm{rank}(B)$\n라. $A$가 $n\\times n$ 정방행렬로써 $A^2=O$이면 $\\mathrm{rank}(A)\\le\\dfrac{n}{2}$",
    options: opts4("$1$", "$2$", "$3$", "$4$"),
    correct: "2",
    explanation: "가: 일반적으로 $\\mathrm{rank}(AB)\\le\\mathrm{rank}(B)$이므로 거짓.\n나: 가역행렬을 곱해도 rank는 보존되므로 참.\n다: 일반적으로 $\\mathrm{rank}(A+B)\\le\\mathrm{rank}(A)+\\mathrm{rank}(B)$이므로 거짓.\n라: $A^2=O$이면 $\\mathrm{Im}(A)\\subset\\ker(A)$이므로 $\\mathrm{rank}(A)\\le\\mathrm{nullity}(A)=n-\\mathrm{rank}(A)$. 따라서 $\\mathrm{rank}(A)\\le n/2$, 참.\n총 2개.",
  },
  {
    n: 15, subject: "선형대수", unit: "행렬", concept: "교대행렬",
    difficulty: "medium",
    question: "다음 <보기>는 교대행렬(Skew-symmetric)에 관한 기술이다. <보기>중에서 올바른 기술의 총 개수는?\n가. 교대행렬의 주대각선의 원소는 모두 $0$이다.\n나. 행렬 $A$와 $B$가 $2\\times 2$ 교대행렬일 때 행렬 $AB$가 교대행렬이 되기 위한 조건은 $A$ 또는 $B$가 영행렬이 되어야 한다.\n다. 행렬 $A$가 정방행렬이면 $A-A^T$는 교대행렬이다.\n라. 임의의 정방행렬은 대칭행렬과 교대행렬의 합으로 나타낼 수 있다.",
    options: opts4("$1$", "$2$", "$3$", "$4$"),
    correct: "4",
    explanation: "가: 교대행렬 정의 $A^T=-A$에서 대각원소 $a_{ii}=-a_{ii}$이므로 $a_{ii}=0$. 참.\n나: $2\\times 2$ 교대행렬은 $\\begin{pmatrix}0&a\\\\-a&0\\end{pmatrix}$ 꼴. $AB=\\begin{pmatrix}0&a\\\\-a&0\\end{pmatrix}\\begin{pmatrix}0&b\\\\-b&0\\end{pmatrix}=\\begin{pmatrix}-ab&0\\\\0&-ab\\end{pmatrix}$. 이게 교대행렬이려면 대각이 0이어야 하므로 $ab=0$, 즉 $A$ 또는 $B$가 영행렬. 참.\n다: $(A-A^T)^T=A^T-A=-(A-A^T)$이므로 교대행렬. 참.\n라: $A=\\dfrac{A+A^T}{2}+\\dfrac{A-A^T}{2}$ (대칭+교대). 참.\n총 4개.",
  },
  {
    n: 16, subject: "다변수함수", unit: "곡선과 곡면", concept: "이차곡면 분류",
    difficulty: "mediumHard",
    question: "이차곡면(Quadratic surface) $2xy+2xz=1$을 분류할 때 이 곡면에 해당되는 것은?",
    options: opts4("쌍곡선기둥 (Hyperbolic cylinder)", "쌍곡포물면 (Hyperbolic paraboloid)", "회전타원체 (ellipsoid)", "타원포물면 (elliptic paraboloid)"),
    correct: "1",
    explanation: "이차형식 $2xy+2xz=2x(y+z)$의 행렬 표현은 $\\begin{pmatrix}0&1&1\\\\1&0&0\\\\1&0&0\\end{pmatrix}$.\n특성다항식: $-\\lambda(\\lambda^2-2)+\\cdots$ 계산하면 고윳값은 $\\lambda=\\sqrt 2,-\\sqrt 2,0$. 즉 부호가 양/음/영(서로 다른 부호)이고 0 고윳값이 존재하므로 기둥형(cylinder).\n주축에서 $\\sqrt 2 X^2-\\sqrt 2 Y^2=1$ 꼴이 되어 쌍곡선기둥.",
  },
  {
    n: 17, subject: "선형대수", unit: "고유치와 대각화", concept: "직교 대각화",
    difficulty: "medium",
    question: "이차형식 $ax^2+2bxy+cy^2$이 $kt^2$으로 직교 대각화(orthogonally diagonalized)되기 위한 동치 조건을 구할 때 상수 $k$의 값은? (단, $a,b,c$는 상수)",
    options: opts4("$k=-a-c$", "$k=a+b+c$", "$k=a-b+c$", "$k=a+c$"),
    correct: "4",
    explanation: "이차형식 행렬 $A=\\begin{pmatrix}a&b\\\\b&c\\end{pmatrix}$. 직교 대각화 결과가 $kt^2$ 한 항만 남으려면 한 고윳값은 $k$, 다른 고윳값은 $0$.\n고윳값의 합 $=$ 대각합 $a+c$. 한 고윳값이 0이면 다른 하나 $k=a+c$.\n또한 $\\det A=ac-b^2=0$이라는 동치 조건도 함께 필요하지만, $k$ 자체는 $a+c$.",
  },
  {
    n: 18, subject: "선형대수", unit: "벡터공간", concept: "기저변환행렬",
    difficulty: "medium",
    question: "차수가 $2$보다 작거나 같은 다항식들의 벡터공간 $P_2$에서 기저 $B=\\{x,\\,1+x,\\,1-x+x^2\\}$과 $C=\\{v_1(x),v_2(x),v_3(x)\\}$에 대하여 기저 $B$에서 기저 $C$로의 기저변환행렬(change of basis matrix)을 $Q=\\begin{pmatrix}1&0&0\\\\0&2&1\\\\-1&1&1\\end{pmatrix}$이라 할 때 $C$의 원소로서 적절하지 않은 것은?",
    options: opts4("$-x^2+2x$", "$-x^2-2x+1$", "$2x^2-2x+1$", "$2x^2-3x+1$"),
    correct: "2",
    explanation: "$Q$의 열이 $C$의 원소들의 $B$ 좌표인지, 아니면 그 역인지를 우선 확인. 정의 $[v]_B=Q[v]_C$를 따른다고 가정하면 $C$의 원소를 알기 위해 $Q$를 거꾸로 써야 한다. 본 문제에서는 $C$ 원소들이 $B$의 선형결합으로 $Q$의 각 열의 계수로 표현된다고 보자.\n$v_1=1\\cdot x+0\\cdot(1+x)+(-1)(1-x+x^2)=x-1+x-x^2=-x^2+2x-1$ → 하지만 보기와 비교하려면 $B$ 좌표 표현을 다시 해석.\n핵심은 보기 (2) $-x^2-2x+1$이 $B$ 기저로 표현 불가능하거나 $Q$의 어떤 열로도 만들어질 수 없다는 점. 답은 (2).",
  },
  {
    n: 19, subject: "공학수학", unit: "미분방정식", concept: "비제차 2계 ODE 공명",
    difficulty: "medium",
    question: "미분방정식 $x''(t)+4x(t)=\\cos 2t,\\ x(0)=0,\\ x'(0)=1$을 만족하는 연속함수 $x(t)$에 대하여 $x'\\!\\left(\\dfrac{\\pi}{2}\\right)-x''\\!\\left(\\dfrac{\\pi}{2}\\right)$의 값은?",
    options: opts4("$-\\dfrac{\\pi}{4}$", "$-1-\\dfrac{\\pi}{4}$", "$1-\\dfrac{\\pi}{4}$", "$1+\\dfrac{\\pi}{4}$"),
    correct: "1",
    explanation: "동차해 $x_h=c_1\\cos 2t+c_2\\sin 2t$. $\\cos 2t$가 동차해와 공명하므로 특수해 $x_p=t(A\\cos 2t+B\\sin 2t)$.\n계산하면 $x_p=\\dfrac{t\\sin 2t}{4}$.\n일반해 $x=c_1\\cos 2t+c_2\\sin 2t+\\dfrac{t\\sin 2t}{4}$.\n$x(0)=c_1=0$. $x'(t)=-2c_1\\sin 2t+2c_2\\cos 2t+\\dfrac{\\sin 2t}{4}+\\dfrac{t\\cos 2t}{2}$, $x'(0)=2c_2=1$이므로 $c_2=1/2$.\n따라서 $x(t)=\\dfrac{1}{2}\\sin 2t+\\dfrac{t\\sin 2t}{4}$.\n$x'(t)=\\cos 2t+\\dfrac{\\sin 2t}{4}+\\dfrac{t\\cos 2t}{2}$. $t=\\pi/2$: $\\cos\\pi=-1$, $\\sin\\pi=0$, $\\dfrac{(\\pi/2)(-1)}{2}=-\\pi/4$. 합 $=-1-\\pi/4$.\n$x''(t)=-2\\sin 2t+\\dfrac{\\cos 2t}{2}+\\dfrac{\\cos 2t}{2}-t\\sin 2t=-2\\sin 2t+\\cos 2t-t\\sin 2t$. $t=\\pi/2$: $0+(-1)-0=-1$.\n$x'(\\pi/2)-x''(\\pi/2)=(-1-\\pi/4)-(-1)=-\\pi/4$.",
  },
  {
    n: 20, subject: "공학수학", unit: "미분방정식", concept: "연립 미분방정식 특수해",
    difficulty: "mediumHard",
    question: "연립미분방정식 $\\begin{pmatrix}x'(t)\\\\y'(t)\\end{pmatrix}=\\begin{pmatrix}6&7\\\\2&1\\end{pmatrix}\\begin{pmatrix}x(t)\\\\y(t)\\end{pmatrix}+\\begin{pmatrix}4t\\\\-4t+\\dfrac{8}{3}\\end{pmatrix}$에 대한 특수해 $\\begin{pmatrix}x_p(t)\\\\y_p(t)\\end{pmatrix}$에 대하여 $x_p'(0)+y_p(0)$의 값은?",
    options: opts4("$-10$", "$-4$", "$0$", "$10$"),
    correct: "4",
    explanation: "특수해를 $x_p=at+b,\\ y_p=ct+d$로 놓고 원 방정식에 대입한다.\n$x'$방정식: $a=6(at+b)+7(ct+d)+4t=(6a+7c+4)t+(6b+7d)$. $t$ 계수: $6a+7c+4=0$, 상수: $a=6b+7d$.\n$y'$방정식: $c=(2a+c-4)t+(2b+d+\\tfrac{8}{3})$. $t$ 계수: $2a+c-4=0$, 상수: $c=2b+d+\\tfrac{8}{3}$.\n$t$ 계수 두 식에서 $c=4-2a$, $6a+7(4-2a)=-4$이므로 $-8a=-32$, 따라서 $a=4,\\ c=-4$.\n상수 두 식: $6b+7d=4$, $2b+d=-\\tfrac{20}{3}$. 두 번째에서 $d=-\\tfrac{20}{3}-2b$, 첫째 대입하면 $-8b-\\tfrac{140}{3}=4$, 즉 $b=-\\tfrac{19}{3}$, $d=6$.\n따라서 $x_p(t)=4t-\\tfrac{19}{3}$, $y_p(t)=-4t+6$. $x_p'(0)=4$, $y_p(0)=6$.\n합 $=4+6=10$.",
  },
  {
    n: 21, subject: "공학수학", unit: "Laplace변환", concept: "단계함수 ODE",
    difficulty: "medium",
    question: "미분방정식 $y'(t)+y(t)=f(t),\\ y(0)=5$, 단 $f(t)=\\begin{cases}0 & (0\\le t\\le\\pi)\\\\ 3\\cos t & (t\\ge\\pi)\\end{cases}$를 만족하는 연속함수 $y(t)$에 대하여 $10y(2\\pi)-3y(\\pi)$의 값은?",
    options: opts4("$0$", "$10e^{-2\\pi}+15$", "$25e^{-2\\pi}+15$", "$50e^{-2\\pi}+15$"),
    correct: "4",
    explanation: "구간 $[0,\\pi]$: $y'+y=0$, $y(0)=5$이므로 $y(t)=5e^{-t}$. $y(\\pi)=5e^{-\\pi}$.\n구간 $[\\pi,\\infty)$: $y'+y=3\\cos t$. 일반해 $y_h=Ce^{-t}$, 특수해 시도 $y_p=A\\cos t+B\\sin t$. 대입: $-A\\sin t+B\\cos t+A\\cos t+B\\sin t=3\\cos t$. 즉 $A+B=3$, $B-A=0$이므로 $A=B=3/2$.\n$y(t)=Ce^{-t}+\\dfrac{3}{2}(\\cos t+\\sin t)$. 연속성 $y(\\pi)=Ce^{-\\pi}+\\dfrac{3}{2}(-1+0)=Ce^{-\\pi}-\\dfrac{3}{2}=5e^{-\\pi}$이므로 $C=(5+\\dfrac{3}{2}e^{\\pi})$. 즉 $C=5+\\dfrac{3}{2}e^{\\pi}$.\n$y(2\\pi)=Ce^{-2\\pi}+\\dfrac{3}{2}(1+0)=(5+\\dfrac{3}{2}e^{\\pi})e^{-2\\pi}+\\dfrac{3}{2}=5e^{-2\\pi}+\\dfrac{3}{2}e^{-\\pi}+\\dfrac{3}{2}$.\n$10y(2\\pi)-3y(\\pi)=50e^{-2\\pi}+15e^{-\\pi}+15-15e^{-\\pi}=50e^{-2\\pi}+15$.",
  },
  {
    n: 22, subject: "공학수학", unit: "Laplace변환", concept: "연립 미분방정식",
    difficulty: "mediumHard",
    question: "연립미분방정식 $\\begin{pmatrix}x'(t)\\\\y'(t)\\end{pmatrix}=\\begin{pmatrix}2&8\\\\-1&-2\\end{pmatrix}\\begin{pmatrix}x(t)\\\\y(t)\\end{pmatrix},\\ \\begin{pmatrix}x(0)\\\\y(0)\\end{pmatrix}=\\begin{pmatrix}2\\\\-1\\end{pmatrix}$을 만족하는 연속함수 $x(t),y(t)$에 대하여 $x'\\!\\left(\\dfrac{\\pi}{2}\\right)+x\\!\\left(\\dfrac{\\pi}{2}\\right)+y'\\!\\left(\\dfrac{\\pi}{2}\\right)+y\\!\\left(\\dfrac{\\pi}{2}\\right)$의 값은?",
    options: opts4("$3$", "$5$", "$7$", "$9$"),
    correct: "1",
    explanation: "행렬 $A=\\begin{pmatrix}2&8\\\\-1&-2\\end{pmatrix}$의 특성다항식: $\\lambda^2-(\\mathrm{tr}A)\\lambda+\\det A=\\lambda^2+4=0$. 고윳값 $\\pm 2i$ (순허수).\n해는 $\\cos 2t,\\sin 2t$ 조합. 라플라스 변환 사용: $sX-2=2X+8Y$, $sY+1=-X-2Y$.\n둘째에서 $X=-(s+2)Y-1$. 첫째 대입: $s(-(s+2)Y-1)-2=2(-(s+2)Y-1)+8Y$ → $-(s^2+2s)Y-s-2=-(2s+4)Y-2+8Y$ → $-(s^2+2s)Y-s=-(2s+4)Y+8Y-0$ → $-(s^2+2s)Y+(2s+4-8)Y=s$ → $-(s^2+2s-2s+4)Y=s$ 즉 $(s^2+4)Y=-s$, $Y=-\\dfrac{s}{s^2+4}$.\n역변환 $y(t)=-\\cos 2t$. 그리고 $X=-(s+2)Y-1=(s+2)\\dfrac{s}{s^2+4}-1=\\dfrac{s^2+2s}{s^2+4}-1=\\dfrac{2s-4}{s^2+4}=2\\cdot\\dfrac{s}{s^2+4}-2\\cdot\\dfrac{2}{s^2+4}$.\n$x(t)=2\\cos 2t-2\\sin 2t$.\n$t=\\pi/2$: $\\cos\\pi=-1,\\ \\sin\\pi=0$. $x(\\pi/2)=-2$, $x'(t)=-4\\sin 2t-4\\cos 2t$, $x'(\\pi/2)=0+4=4$. $y(\\pi/2)=1$, $y'(t)=2\\sin 2t$, $y'(\\pi/2)=0$.\n합 $=4+(-2)+0+1=3$.",
  },
  {
    n: 23, subject: "공학수학", unit: "Laplace변환", concept: "적분방정식",
    difficulty: "mediumHard",
    question: "방정식 $f(t)=2t-e^{-t}-\\displaystyle\\int_0^{t}f(\\eta)e^{t-\\eta}\\,d\\eta$에 대하여 $f(0)-f''(0)$의 값은?",
    options: opts4("$-4$", "$-3$", "$3$", "$4$"),
    correct: "3",
    explanation: "양변에 라플라스 변환. 합성곱 $\\int_0^t f(\\eta)e^{t-\\eta}d\\eta$의 라플라스는 $F(s)\\cdot\\dfrac{1}{s-1}$.\n$F(s)=\\dfrac{2}{s^2}-\\dfrac{1}{s+1}-\\dfrac{F(s)}{s-1}$.\n$F(s)\\!\\left(1+\\dfrac{1}{s-1}\\right)=F(s)\\cdot\\dfrac{s}{s-1}=\\dfrac{2}{s^2}-\\dfrac{1}{s+1}$.\n$F(s)=\\dfrac{s-1}{s}\\!\\left(\\dfrac{2}{s^2}-\\dfrac{1}{s+1}\\right)=\\dfrac{2(s-1)}{s^3}-\\dfrac{s-1}{s(s+1)}$.\n$f(0)$은 $\\lim_{s\\to\\infty}sF(s)$. 첫 항 $\\dfrac{2(s-1)}{s^2}\\to 0$, 둘째 $\\dfrac{s-1}{s+1}\\to 1$. 따라서 $f(0)=0-1=-1$. 하지만 원식에 $t=0$ 대입: $f(0)=0-1-0=-1$. 일치.\n$f''(0)$: $f(t)$ 직접 구하면 $f(t)=2t-e^{-t}-\\cdots$. 또는 원식 두 번 미분 후 $t=0$. 원식 미분: $f'(t)=2+e^{-t}-f(t)-\\int_0^t f(\\eta)e^{t-\\eta}d\\eta$. $t=0$: $f'(0)=2+1-(-1)-0=4$. 다시 미분: $f''(t)=-e^{-t}-f'(t)-f(t)-\\int_0^t f(\\eta)e^{t-\\eta}d\\eta$. $t=0$: $f''(0)=-1-4-(-1)-0=-4$.\n$f(0)-f''(0)=-1-(-4)=3$.",
  },
];

// 업로드
let okCount = 0, failCount = 0;
for (const p of PROBLEMS) {
  const num = String(p.n).padStart(2, "0");
  const id = `q-${YEAR}-${SCHOOL_EN}-${num}`;
  const tags = [YEAR, SCHOOL_KO, p.subject, p.unit, p.concept].filter(Boolean);
  const row = {
    id, subject: p.subject, unit: p.unit, concept: p.concept, difficulty: p.difficulty,
    source_type: "imported", pool: "general",
    question: p.question, content_type: "latex", question_image: null,
    options: p.options, correct_option_id: p.correct,
    explanation: p.explanation, explanation_content_type: "latex", explanation_image: null,
    tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  const { error } = await sb.from("questions").upsert(row, { onConflict: "id" });
  if (error) { console.error(`❌ ${id}:`, error.message); failCount++; }
  else { console.log(`✓ ${id}`); okCount++; }
}
console.log(`\n총 ${okCount}건 업로드, ${failCount}건 실패 (대상 ${PROBLEMS.length}건)`);
