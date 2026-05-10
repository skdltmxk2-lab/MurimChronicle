// 2022년 한양대(본교) 편입수학 객관식 19문항 (Q2~Q20, 5지선다). Q21은 모두 정답 처리되어 제외.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2022", SCHOOL_KO="한양대", SCHOOL_EN="hanyang";
const opts5 = (...t) => t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));

const PROBLEMS = [
  {
    n:2, subject:"미분학", unit:"미분", concept:"합성함수의 미분",
    difficulty:"medium",
    question:"함수 $f(x)=\\arctan(\\arcsin\\sqrt x)$에 대해 $f'\\!\\left(\\dfrac{1}{4}\\right)=\\dfrac{a}{b+\\pi^2}\\cdot\\dfrac{1}{\\sqrt 3}$일 때, $a+b$의 값은? (단, $a,b$는 정수이다.)",
    options:opts5("$84$","$96$","$108$","$120$","$136$"),
    correct:"3",
    explanation:"$f'(x)=\\dfrac{1}{1+\\arcsin^2\\sqrt x}\\cdot\\dfrac{1}{\\sqrt{1-x}}\\cdot\\dfrac{1}{2\\sqrt x}$.\n$x=\\dfrac{1}{4}$이면 $\\sqrt x=\\dfrac{1}{2},\\,\\arcsin(1/2)=\\dfrac{\\pi}{6}$, $\\sqrt{1-1/4}=\\dfrac{\\sqrt 3}{2}$.\n$f'(1/4)=\\dfrac{1}{1+\\pi^2/36}\\cdot\\dfrac{2}{\\sqrt 3}\\cdot 1=\\dfrac{36}{36+\\pi^2}\\cdot\\dfrac{2}{\\sqrt 3}=\\dfrac{72}{36+\\pi^2}\\cdot\\dfrac{1}{\\sqrt 3}$.\n$a=72,\\,b=36$이므로 $a+b=108$.",
  },
  {
    n:3, subject:"적분학", unit:"정적분의 응용", concept:"회전체 부피(Shell)",
    difficulty:"easyMedium",
    question:"$x=2$에서 $x=\\pi+2$까지의 곡선 $y=\\sin(x-2)$와 $x$축으로 둘러싸인 영역을 $y$축을 중심으로 회전하여 얻은 입체의 부피는?",
    options:opts5("$2\\pi(2\\pi+1)$","$2\\pi(2\\pi+2)$","$2\\pi(2\\pi+3)$","$2\\pi(\\pi+3)$","$2\\pi(\\pi+4)$"),
    correct:"5",
    explanation:"원통껍질법: $V=\\displaystyle\\int_2^{\\pi+2}2\\pi x\\sin(x-2)\\,dx$. $u=x-2$로 치환: $V=2\\pi\\!\\int_0^{\\pi}(u+2)\\sin u\\,du$.\n$\\int_0^{\\pi}u\\sin u\\,du=[-u\\cos u+\\sin u]_0^{\\pi}=\\pi$. $\\int_0^{\\pi}2\\sin u\\,du=4$.\n$V=2\\pi(\\pi+4)$.",
  },
  {
    n:4, subject:"적분학", unit:"정적분의 계산", concept:"반각·삼각치환",
    difficulty:"easyMedium",
    question:"정적분 $\\displaystyle\\int_{\\pi/3}^{\\pi/2}\\dfrac{1}{\\cos x-1}\\,dx$의 값은?",
    options:opts5("$1+\\sqrt 3$","$-1+\\sqrt 3$","$-1-\\sqrt 3$","$1-\\sqrt 3$","$\\dfrac{-1+\\sqrt 3}{2}$"),
    correct:"4",
    explanation:"$\\cos x-1=-2\\sin^2(x/2)$이므로 $\\dfrac{1}{\\cos x-1}=-\\dfrac{1}{2}\\csc^2(x/2)$.\n$\\displaystyle\\int-\\dfrac{1}{2}\\csc^2(x/2)\\,dx=\\cot(x/2)+C$ ($u=x/2$ 치환).\n$\\bigl[\\cot(x/2)\\bigr]_{\\pi/3}^{\\pi/2}=\\cot(\\pi/4)-\\cot(\\pi/6)=1-\\sqrt 3$.",
  },
  {
    n:5, subject:"적분학", unit:"급수의 수렴/발산", concept:"수렴반경",
    difficulty:"easy",
    question:"모든 실수에 대해 수렴하는 멱급수는?",
    options:opts5("$\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(x-3)^n}{n}$","$\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(-1)^n x^{2n}}{2^{2n}(n!)^2}$","$\\displaystyle\\sum_{n=0}^{\\infty}x^n$","$\\displaystyle\\sum_{n=0}^{\\infty}(-1)^n\\dfrac{x^{2n+1}}{2n+1}$","$\\displaystyle\\sum_{n=1}^{\\infty}(-1)^{n-1}\\dfrac{x^n}{n}$"),
    correct:"2",
    explanation:"각 멱급수의 수렴반경:\n(1) $R=1$ ($\\ln$형). (2) 비율판정 $\\dfrac{a_{n+1}}{a_n}=\\dfrac{1}{4(n+1)^2}\\to 0$, $R=\\infty$. (3) 기하급수 $R=1$. (4) $\\arctan x$의 급수, $R=1$. (5) $\\ln(1+x)$의 급수, $R=1$.\n오직 (2)만 모든 실수에서 수렴 (실은 베셀함수 $J_0$의 변형).",
  },
  {
    n:6, subject:"적분학", unit:"Maclaurin급수의 응용", concept:"이항급수 계수",
    difficulty:"medium",
    question:"$x=0$ 근방에서 함수 $f(x)=\\dfrac{1}{\\sqrt{1-x}}$의 테일러 급수를 $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{b_n}{a_n}x^n$이라 할 때, $|a_3|+|b_3|$의 값은? (단, $a_3$과 $b_3$은 서로소인 정수이다.)",
    options:opts5("$3$","$7$","$11$","$21$","$65$"),
    correct:"4",
    explanation:"이항급수 $(1-x)^{-1/2}=\\displaystyle\\sum_{n=0}^{\\infty}\\binom{-1/2}{n}(-x)^n=\\sum_{n=0}^{\\infty}\\dfrac{(2n)!}{4^n(n!)^2}x^n$.\n$x^3$ 계수: $\\dfrac{6!}{4^3\\cdot(3!)^2}=\\dfrac{720}{64\\cdot 36}=\\dfrac{720}{2304}=\\dfrac{5}{16}$.\n$\\dfrac{b_3}{a_3}=\\dfrac{5}{16}$이고 서로소이므로 $|a_3|=16,\\,|b_3|=5$. 합 $=21$.",
  },
  {
    n:7, subject:"다변수함수", unit:"곡선과 곡면", concept:"공간곡선 곡률",
    difficulty:"easyMedium",
    question:"곡선 $r(t)=\\langle 2\\cos t,\\,2\\sin t,\\,t^2\\rangle$의 점 $(2,0,0)$에서의 곡률은?",
    options:opts5("$1$","$\\dfrac{1}{\\sqrt 2}$","$\\dfrac{1}{2\\sqrt 2}$","$\\dfrac{1}{\\sqrt 6}$","$\\dfrac{4\\sqrt 2}{3}$"),
    correct:"2",
    explanation:"점 $(2,0,0)$은 $t=0$에 해당. $r'(t)=(-2\\sin t,2\\cos t,2t)$, $r'(0)=(0,2,0)$, $|r'(0)|=2$.\n$r''(t)=(-2\\cos t,-2\\sin t,2)$, $r''(0)=(-2,0,2)$.\n$r'(0)\\times r''(0)=(0,2,0)\\times(-2,0,2)=(4,0,4)$, 크기 $=4\\sqrt 2$.\n$\\kappa=\\dfrac{4\\sqrt 2}{2^3}=\\dfrac{\\sqrt 2}{2}=\\dfrac{1}{\\sqrt 2}$.",
  },
  {
    n:8, subject:"다변수함수", unit:"편도함수", concept:"음함수 미분",
    difficulty:"medium",
    question:"$yz+x\\ln y=z^2,\\,z>0$일 때, $(x,y)=(0,e)$에서 $\\dfrac{\\partial z}{\\partial y}$의 값은?",
    options:opts5("$1$","$2$","$e$","$\\dfrac{e}{2e-1}$","$\\dfrac{e^2}{3}$"),
    correct:"1",
    explanation:"$(x,y)=(0,e)$ 대입: $ze+0=z^2$, $z(z-e)=0$이고 $z>0$이므로 $z=e$.\n양변을 $y$로 편미분 ($x$ 고정): $z+y\\,z_y+\\dfrac{x}{y}=2z\\,z_y$.\n$(0,e,z=e)$ 대입: $e+e\\,z_y+0=2e\\,z_y$이므로 $e=e\\,z_y$, $z_y=1$.",
  },
  {
    n:9, subject:"다변수함수", unit:"편도함수", concept:"법선벡터",
    difficulty:"easy",
    question:"점 $(2,1,1)$에서 곡면 $2x^2+3y^2-5z^2=6$의 법선벡터는?",
    options:opts5("$\\langle 4,2,5\\rangle$","$\\langle 4,3,-5\\rangle$","$\\langle 2,1,\\dfrac{3}{2}\\rangle$","$\\langle 2,\\dfrac{3}{2},5\\rangle$","$\\langle 3,2,-4\\rangle$"),
    correct:"2",
    explanation:"$F(x,y,z)=2x^2+3y^2-5z^2$의 그래디언트 $\\nabla F=(4x,6y,-10z)$.\n$(2,1,1)$ 대입: $(8,6,-10)=2\\langle 4,3,-5\\rangle$. 법선벡터 $\\langle 4,3,-5\\rangle$.",
  },
  {
    n:10, subject:"선형대수", unit:"고유치와 대각화", concept:"고유값·고유벡터",
    difficulty:"medium",
    question:"행렬 $A=\\begin{pmatrix}4&0&1\\\\-2&1&0\\\\-2&0&1\\end{pmatrix}$의 고윳값 $\\lambda_1,\\lambda_2,\\lambda_3$에 대응하는 고유벡터를 각각 $a=\\begin{pmatrix}a_1\\\\1\\\\a_3\\end{pmatrix},\\,b=\\begin{pmatrix}b_1\\\\b_2\\\\2\\end{pmatrix},\\,c=\\begin{pmatrix}3\\\\c_2\\\\c_3\\end{pmatrix}$이라 할 때, $\\lambda_1+\\lambda_2+\\lambda_3+a_1+b_2+c_3$의 값은? (단, $\\lambda_1<\\lambda_2<\\lambda_3$)",
    options:opts5("$3$","$4$","$5$","$6$","$7$"),
    correct:"3",
    explanation:"특성다항식 (2열 따라 전개): $(1-\\lambda)[(4-\\lambda)(1-\\lambda)+2]=(1-\\lambda)(\\lambda-2)(\\lambda-3)$. 고윳값 $1,2,3$.\n$\\lambda=1$: $(A-I)v=0$에서 $a=(0,1,0)^T$이므로 $a_1=0$.\n$\\lambda=2$: $(A-2I)v=0$에서 $z=-2x,\\,y=-2x$. $z=2$에서 $x=-1$, $y=2$이므로 $b_2=2$.\n$\\lambda=3$: $(A-3I)v=0$에서 $z=-x,\\,y=-x$. $x=3$이면 $z=-3$이므로 $c_3=-3$.\n합 $=1+2+3+0+2-3=5$.",
  },
  {
    n:11, subject:"선형대수", unit:"고유치와 대각화", concept:"이차형식 직교대각화",
    difficulty:"medium",
    question:"이차형식 $3x^2-4xy+3y^2+5z^2$을 직교대각화하면 $aX^2+bY^2+5Z^2$이다. 이때, $X=\\alpha x+\\beta y+\\gamma z$이면 $a^2+b^2+\\alpha^2+\\beta^2+\\gamma^2$의 값은? (단, $a<b\\le 5$)",
    options:opts5("$24$","$25$","$26$","$27$","$28$"),
    correct:"4",
    explanation:"행렬 $M=\\begin{pmatrix}3&-2&0\\\\-2&3&0\\\\0&0&5\\end{pmatrix}$. 좌상단 $2\\times 2$ 부분의 고윳값: $(3-\\lambda)^2-4=0$에서 $\\lambda=1,5$. 전체 고윳값 $1,5,5$.\n$a<b\\le 5$이므로 $a=1,\\,b=5$.\n$\\lambda=1$ 고유벡터 ($X$): $\\begin{pmatrix}2&-2&0\\\\-2&2&0\\\\0&0&4\\end{pmatrix}v=0$에서 $z=0,\\,x=y$. 정규화 $(\\alpha,\\beta,\\gamma)=\\dfrac{1}{\\sqrt 2}(1,1,0)$.\n$a^2+b^2+\\alpha^2+\\beta^2+\\gamma^2=1+25+\\dfrac{1}{2}+\\dfrac{1}{2}+0=27$.",
  },
  {
    n:12, subject:"선형대수", unit:"선형사상", concept:"선형사상의 행렬표현",
    difficulty:"medium",
    question:"모든 $2\\times 2$ 행렬들로 이루어진 벡터공간 $M_2(\\mathbb R)$와 행렬 $A=\\begin{pmatrix}1&3\\\\2&-1\\end{pmatrix}$에 대하여, 선형사상 $T:M_2(\\mathbb R)\\to M_2(\\mathbb R)$는 $T(B)=AB$로 정의된다. 표준기저 $\\{E_{11},E_{12},E_{21},E_{22}\\}$에 대한 $T$의 행렬표현을 $P=(p_{ij})_{4\\times 4}$라 할 때, $p_{13}+p_{24}$의 값은?",
    options:opts5("$5$","$6$","$7$","$8$","$9$"),
    correct:"2",
    explanation:"$T(E_{11})=AE_{11}=E_{11}+2E_{21}$, $T(E_{12})=AE_{12}=E_{12}+2E_{22}$, $T(E_{21})=AE_{21}=3E_{11}-E_{21}$, $T(E_{22})=AE_{22}=3E_{12}-E_{22}$.\n각 열을 좌표로 적으면 $P=\\begin{pmatrix}1&0&3&0\\\\0&1&0&3\\\\2&0&-1&0\\\\0&2&0&-1\\end{pmatrix}$.\n$p_{13}=3,\\,p_{24}=3$이므로 $p_{13}+p_{24}=6$.",
  },
  {
    n:13, subject:"선형대수", unit:"벡터공간", concept:"부분공간 정사영",
    difficulty:"medium",
    question:"$T:M_2(\\mathbb R)\\to M_2(\\mathbb R)$를 행렬 $\\begin{pmatrix}1&0\\\\0&0\\end{pmatrix}$과 $\\begin{pmatrix}1&1\\\\1&0\\end{pmatrix}$이 생성하는 부분공간 $W$로의 정사영(orthogonal projection)이라 하자. 행렬 $C=\\begin{pmatrix}4&2\\\\3&1\\end{pmatrix}$의 $W$ 위로의 정사영을 $T(C)=\\begin{pmatrix}\\alpha&\\beta\\\\\\gamma&\\delta\\end{pmatrix}$라 할 때, $\\alpha+\\beta+\\gamma+\\delta$의 값은?",
    options:opts5("$5$","$6$","$7$","$8$","$9$"),
    correct:"5",
    explanation:"내적 $\\langle A,B\\rangle=a_{11}b_{11}+a_{12}b_{12}+a_{21}b_{21}+a_{22}b_{22}$. 그람-슈미트로 $W$의 직교기저 만들기:\n$u_1=E_{11}$, $u_2=(E_{11}+E_{12}+E_{21})-\\langle\\cdot,u_1\\rangle u_1=E_{12}+E_{21}$. $\\|u_2\\|^2=2$.\n$T(C)=\\langle C,u_1\\rangle u_1+\\dfrac{\\langle C,u_2\\rangle}{2}u_2=4E_{11}+\\dfrac{2+3}{2}(E_{12}+E_{21})=\\begin{pmatrix}4&5/2\\\\5/2&0\\end{pmatrix}$.\n합 $=4+\\dfrac{5}{2}+\\dfrac{5}{2}+0=9$.",
  },
  {
    n:14, subject:"선형대수", unit:"벡터공간", concept:"정사영 행렬·행렬식",
    difficulty:"medium",
    question:"제시문의 행렬 $P=(p_{ij})_{4\\times 4}$에 대하여 $p_{11}+p_{22}+p_{33}+p_{44}+\\det P$의 값은? (단, $\\det P$는 $P$의 행렬식이다.)",
    options:opts5("$2$","$3$","$4$","$5$","$6$"),
    correct:"1",
    explanation:"표준기저에 대한 $T$의 행렬표현: $T(E_{11})=E_{11}$, $T(E_{12})=\\dfrac{1}{2}(E_{12}+E_{21})$, $T(E_{21})=\\dfrac{1}{2}(E_{12}+E_{21})$, $T(E_{22})=0$.\n$P=\\begin{pmatrix}1&0&0&0\\\\0&1/2&1/2&0\\\\0&1/2&1/2&0\\\\0&0&0&0\\end{pmatrix}$.\n대각합 $=1+\\dfrac{1}{2}+\\dfrac{1}{2}+0=2$. $\\det P=0$ (마지막 행이 영행).\n합 $=2+0=2$.",
  },
  {
    n:15, subject:"선형대수", unit:"행렬", concept:"직교행렬·내적 보존",
    difficulty:"hard",
    question:"행렬 $A=\\begin{pmatrix}\\sqrt 3/2&0&-1/2\\\\0&-1&0\\\\1/2&0&\\sqrt 3/2\\end{pmatrix}$와 두 벡터 $x=(0,1,1)^T,\\,y=\\!\\left(-\\dfrac{1}{2},0,\\dfrac{\\sqrt 3}{2}\\right)^T\\!\\!\\in\\mathbb R^3$에 대하여 내적 $(A^{2022}x)\\cdot(A^{2021}y)$의 값은?",
    options:opts5("$0$","$1$","$1011$","$2021$","$2022$"),
    correct:"2",
    explanation:"$A$는 직교행렬 ($A^TA=I$ 검증). 직교행렬은 내적 보존: $(Au)\\cdot(Av)=u\\cdot v$.\n따라서 $(A^{2022}x)\\cdot(A^{2021}y)=(A^{2021}x)\\cdot(A^{2020}y)=\\cdots=(Ax)\\cdot y=x\\cdot(A^{-1}y)$? 더 간단히 $(A^{2022}x)\\cdot(A^{2021}y)=x^T A^{2022^T}A^{2021}y=x^T A^{-1}y$.\n$A^{-1}=A^T$ 계산: $A^{-1}y=\\begin{pmatrix}-\\sqrt 3/4+\\sqrt 3/4\\\\0\\\\1/4+3/4\\end{pmatrix}=(0,0,1)^T$.\n$x\\cdot A^{-1}y=(0,1,1)\\cdot(0,0,1)=1$.",
  },
  {
    n:16, subject:"선형대수", unit:"고유치와 대각화", concept:"케일리-해밀턴 정리",
    difficulty:"hard",
    question:"행렬 $A=\\begin{pmatrix}0&-1&0&0\\\\1&-2&0&0\\\\0&0&3&0\\\\0&0&0&5\\end{pmatrix}$와 벡터 $v=(1,0,0,0)^T$에 대하여 $(3A^7+7A^6+13A^3+5A^2-4A)v=(p,q,r,s)^T$일 때, $p+q+r+s$의 값은?",
    options:opts5("$8$","$10$","$13$","$17$","$22$"),
    correct:"1",
    explanation:"좌상단 $2\\times 2$ 블록 $A_1=\\begin{pmatrix}0&-1\\\\1&-2\\end{pmatrix}$의 특성다항식 $\\lambda^2+2\\lambda+1=(\\lambda+1)^2$. 케일리: $A_1^2=-2A_1-I$.\n점화: $A_1^n=(-1)^{n-1}(nA_1+(n-1)I)$. $A_1^2=-2A_1-I$, $A_1^3=3A_1+2I$, $A_1^6=-6A_1-5I$, $A_1^7=7A_1+6I$.\n$3A_1^7+7A_1^6+13A_1^3+5A_1^2-4A_1=(21-42+39-10-4)A_1+(18-35+26-5)I=4A_1+4I$.\n$v$의 처음 두 성분 $\\binom{1}{0}$에 적용: $4A_1\\binom{1}{0}+4\\binom{1}{0}=4\\binom{0}{1}+4\\binom{1}{0}=\\binom{4}{4}$. 나머지 성분 $0$.\n$p+q+r+s=4+4+0+0=8$.",
  },
  {
    n:17, subject:"공학수학", unit:"미분방정식", concept:"1계 선형 ODE",
    difficulty:"medium",
    question:"미분방정식 $t^2 x'(t)+2(1+t)x(t)=\\dfrac{1}{t^2}e^{2/t}$의 해 $x(t)$가 조건 $x(1)=2e^2$을 만족할 때, $x(2)$의 값은?",
    options:opts5("$\\dfrac{3}{8}e$","$\\dfrac{1}{2}e$","$\\dfrac{5}{8}e$","$\\dfrac{3}{4}e$","$\\dfrac{7}{8}e$"),
    correct:"3",
    explanation:"표준형 $x'+\\dfrac{2(1+t)}{t^2}x=\\dfrac{1}{t^4}e^{2/t}$. 적분인자 $\\mu=e^{\\int(2/t^2+2/t)dt}=e^{-2/t+2\\ln t}=t^2 e^{-2/t}$.\n$(\\mu x)'=t^2 e^{-2/t}\\cdot\\dfrac{1}{t^4}e^{2/t}=\\dfrac{1}{t^2}$. 적분: $\\mu x=-\\dfrac{1}{t}+C$.\n$x(t)=\\dfrac{e^{2/t}}{t^2}\\!\\left(C-\\dfrac{1}{t}\\right)$. $x(1)=e^2(C-1)=2e^2\\Rightarrow C=3$.\n$x(2)=\\dfrac{e}{4}\\!\\left(3-\\dfrac{1}{2}\\right)=\\dfrac{e}{4}\\cdot\\dfrac{5}{2}=\\dfrac{5e}{8}$.",
  },
  {
    n:18, subject:"공학수학", unit:"미분방정식", concept:"로지스틱 방정식",
    difficulty:"medium",
    question:"미분방정식 $x'(t)=x(t)(3-4x(t))$의 해 $x(t)$가 초기조건 $x(0)=3$을 만족할 때, $x(3)$의 값은?",
    options:opts5("$\\dfrac{e^3}{\\frac{4}{3}e^3-1}$","$\\dfrac{e^4}{\\frac{4}{3}e^4-1}$","$\\dfrac{e^7}{\\frac{4}{3}e^7-1}$","$\\dfrac{e^8}{\\frac{4}{3}e^8-1}$","$\\dfrac{e^9}{\\frac{4}{3}e^9-1}$"),
    correct:"5",
    explanation:"분리 + 부분분수: $\\dfrac{1}{x(3-4x)}=\\dfrac{1}{3x}+\\dfrac{4}{3(3-4x)}$.\n$\\dfrac{1}{3}\\ln\\!\\left|\\dfrac{x}{3-4x}\\right|=t+C$, $\\dfrac{x}{3-4x}=Ae^{3t}$. $x(0)=3$이면 $\\dfrac{3}{-9}=A=-\\dfrac{1}{3}$.\n$x=\\dfrac{-e^{3t}}{1-(4/3)e^{3t}}=\\dfrac{e^{3t}}{(4/3)e^{3t}-1}$.\n$x(3)=\\dfrac{e^9}{(4/3)e^9-1}$.",
  },
  {
    n:19, subject:"공학수학", unit:"미분방정식", concept:"동차 1계 ODE",
    difficulty:"medium",
    question:"미분방정식 $y'(t)=\\dfrac{2t^2+y(t)^2}{t\\,y(t)},\\,t\\,y(t)\\neq 0$의 해 $y(t)$가 조건 $y(1)=6$을 만족할 때, $y(e)$의 값은?",
    options:opts5("$e\\sqrt 6$","$e\\sqrt{10}$","$2e\\sqrt 6$","$2e\\sqrt{10}$","$3e\\sqrt 6$"),
    correct:"4",
    explanation:"동차 ODE. $v=y/t$로 두면 $y=tv,\\,y'=v+tv'$. 원식: $v+tv'=\\dfrac{2+v^2}{v}$, $tv'=\\dfrac{2}{v}$.\n분리: $v\\,dv=\\dfrac{2}{t}dt$, $\\dfrac{v^2}{2}=2\\ln|t|+C_0$, $v^2=4\\ln|t|+C_1$.\n$y(1)=6$이면 $v(1)=6$, $36=0+C_1$. $v^2=4\\ln|t|+36$.\n$v(e)=\\sqrt{4+36}=2\\sqrt{10}$. $y(e)=e\\cdot v(e)=2e\\sqrt{10}$.",
  },
  {
    n:20, subject:"공학수학", unit:"미분방정식", concept:"2차 동차 연립 ODE 중근",
    difficulty:"mediumHard",
    question:"연립미분방정식 $\\begin{cases}x'(t)=y(t)\\\\ y'(t)=-x(t)-2y(t)\\end{cases}$의 해 $\\binom{x(t)}{y(t)}$가 초기조건 $\\binom{x(0)}{y(0)}=\\binom{1}{2}$를 만족할 때, $x(2)+y(2)$의 값은?",
    options:opts5("$-2e^{-2}$","$-e^{-2}$","$e^{-2}$","$2e^{-2}$","$3e^{-2}$"),
    correct:"5",
    explanation:"행렬 $A=\\begin{pmatrix}0&1\\\\-1&-2\\end{pmatrix}$의 특성다항식 $(\\lambda+1)^2$. 중근 $\\lambda=-1$.\n고유벡터: $(A+I)v=0$에서 $v=(1,-1)^T$. 일반화 고유벡터 $w$: $(A+I)w=v$에서 $w=(0,1)^T$.\n해 $\\binom{x}{y}=e^{-t}[c_1 v+c_2(tv+w)]$. 초기조건 $c_1=1,\\,c_2=3$.\n$\\binom{x(t)}{y(t)}=e^{-t}\\binom{1+3t}{2-3t}$. $x(t)+y(t)=3e^{-t}$.\n$x(2)+y(2)=3e^{-2}$.",
  },
];

let okCount=0,failCount=0;
for (const p of PROBLEMS) {
  const num=String(p.n).padStart(2,"0");
  const id=`q-${YEAR}-${SCHOOL_EN}-${num}`;
  const tags=[YEAR,SCHOOL_KO,p.subject,p.unit,p.concept].filter(Boolean);
  const row={id,subject:p.subject,unit:p.unit,concept:p.concept,difficulty:p.difficulty,
    source_type:"imported",pool:"general",
    question:p.question,content_type:"latex",question_image:null,
    options:p.options,correct_option_id:p.correct,
    explanation:p.explanation,explanation_content_type:"latex",explanation_image:null,
    tags,created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
  const{error}=await sb.from("questions").upsert(row,{onConflict:"id"});
  if(error){console.error(`❌ ${id}:`,error.message);failCount++;}
  else{console.log(`✓ ${id}`);okCount++;}
}
console.log(`\n총 ${okCount}건 업로드, ${failCount}건 실패 (대상 ${PROBLEMS.length}건)`);
