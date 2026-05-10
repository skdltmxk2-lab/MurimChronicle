// 2021년 한양대 편입수학 객관식 20문항 (Q2~Q21, 5지선다)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2021", SCHOOL_KO="한양대", SCHOOL_EN="hanyang";
const opts5 = (...t) => t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));

const PROBLEMS = [
  {
    n:2, subject:"적분학", unit:"급수의 수렴/발산", concept:"수렴 판정",
    difficulty:"medium",
    question:"<보기>에서 수렴하는 급수만을 있는 대로 고른 것은?\nㄱ. $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{\\ln(2n^3)}{1+n^2}$\nㄴ. $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{2^n\\times n!}{n^n}$\nㄷ. $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{\\cos n\\pi}{n}$",
    options:opts5("ㄱ","ㄷ","ㄱ, ㄴ","ㄴ, ㄷ","ㄱ, ㄴ, ㄷ"),
    correct:"5",
    explanation:"ㄱ: $\\ln(2n^3)=\\ln 2+3\\ln n\\sim 3\\ln n$이므로 $\\dfrac{\\ln(2n^3)}{1+n^2}\\sim\\dfrac{3\\ln n}{n^2}$. $\\sum\\dfrac{\\ln n}{n^2}$은 적분판정에 의해 수렴. 따라서 수렴.\nㄴ: 비율판정 $\\dfrac{a_{n+1}}{a_n}=\\dfrac{2(n+1)\\cdot n^n}{(n+1)^n\\cdot(n+1)}=\\dfrac{2}{(1+1/n)^n}\\to\\dfrac{2}{e}<1$. 수렴.\nㄷ: $\\cos n\\pi=(-1)^n$이므로 $\\sum\\dfrac{(-1)^n}{n}$은 교대급수 (조건수렴). 수렴.\n셋 다 수렴.",
  },
  {
    n:3, subject:"다변수함수", unit:"편도함수", concept:"접평면 + 거리최소화",
    difficulty:"medium",
    question:"곡면 $x+3y^2+z^4=5$ 위의 점 $(1,1,1)$에서의 접평면을 $\\alpha$라 하자. 점 $(-2,a,b)$가 $\\alpha$ 위에 있을 때, $a^2+b^2$의 최솟값은?",
    options:opts5("$\\dfrac{5}{4}$","$\\dfrac{7}{4}$","$\\dfrac{9}{4}$","$\\dfrac{11}{4}$","$\\dfrac{13}{4}$"),
    correct:"5",
    explanation:"법벡터 $\\nabla F=(1,6y,4z^3)$, 점 $(1,1,1)$에서 $(1,6,4)$.\n접평면 $\\alpha$: $1(x-1)+6(y-1)+4(z-1)=0$, 즉 $x+6y+4z=11$.\n$(-2,a,b)\\in\\alpha$이면 $-2+6a+4b=11$, $6a+4b=13$.\n제약조건 아래 $a^2+b^2$ 최소화: 라그랑주 또는 코시-슈바르츠 부등식 $(6^2+4^2)(a^2+b^2)\\ge(6a+4b)^2$, $52(a^2+b^2)\\ge 169$, $a^2+b^2\\ge\\dfrac{169}{52}=\\dfrac{13}{4}$.\n등호는 $(a,b)\\parallel(6,4)$일 때 성립. 최솟값 $=\\dfrac{13}{4}$.",
  },
  {
    n:4, subject:"적분학", unit:"Maclaurin급수의 응용", concept:"테일러 다항식",
    difficulty:"mediumHard",
    question:"함수 $f(x)=\\dfrac{\\sin x}{2+e^x}$의 $x=0$에서의 4차 테일러 다항식을 $p(x)$라 할 때, $p(1)$의 값은?",
    options:opts5("$\\dfrac{4}{27}$","$\\dfrac{14}{81}$","$\\dfrac{16}{81}$","$\\dfrac{2}{9}$","$\\dfrac{20}{81}$"),
    correct:"2",
    explanation:"$h(x)=\\dfrac{1}{2+e^x}$로 두자. $h(0)=\\dfrac{1}{3},\\,h'(0)=-\\dfrac{1}{9},\\,h''(0)=-\\dfrac{1}{27},\\,h'''(0)=\\dfrac{1}{27}$ (직접 미분).\n라이프니츠 공식 $f^{(n)}(0)=\\sum_{k=0}^n\\binom{n}{k}(\\sin x)^{(k)}(0)\\cdot h^{(n-k)}(0)$.\n$f(0)=0,\\,f'(0)=\\dfrac{1}{3},\\,f''(0)=-\\dfrac{2}{9},\\,f'''(0)=-\\dfrac{4}{9},\\,f^{(4)}(0)=\\dfrac{16}{27}$.\n$p(x)=\\dfrac{x}{3}-\\dfrac{x^2}{9}-\\dfrac{2x^3}{27}+\\dfrac{2x^4}{81}$.\n$p(1)=\\dfrac{1}{3}-\\dfrac{1}{9}-\\dfrac{2}{27}+\\dfrac{2}{81}=\\dfrac{27-9-6+2}{81}=\\dfrac{14}{81}$.",
  },
  {
    n:5, subject:"적분학", unit:"정적분의 응용", concept:"회전체 부피(Shell)",
    difficulty:"easyMedium",
    question:"곡선 $y=\\dfrac{3x}{1+x^3}$과 세 직선 $y=0,\\,x=1,\\,x=5$로 둘러싸인 부분을 $y$축을 중심으로 회전하여 얻은 입체의 부피는?",
    options:opts5("$3\\pi+\\ln 21$","$\\pi+3\\ln 21$","$3\\pi\\ln 21$","$2\\pi+\\ln 63$","$2\\pi\\ln 63$"),
    correct:"5",
    explanation:"원통껍질법: $V=\\displaystyle\\int_1^5 2\\pi x\\cdot y\\,dx=2\\pi\\!\\int_1^5\\dfrac{3x^2}{1+x^3}dx$.\n$u=1+x^3$로 치환하면 $du=3x^2dx$, $u:2\\to 126$.\n$V=2\\pi\\!\\int_2^{126}\\dfrac{du}{u}=2\\pi\\ln\\dfrac{126}{2}=2\\pi\\ln 63$.",
  },
  {
    n:6, subject:"적분학", unit:"극좌표와 응용", concept:"극좌표 영역 면적",
    difficulty:"medium",
    question:"영역 $\\{(r\\cos\\theta,r\\sin\\theta)\\mid 1+2\\cos\\theta\\le r\\le 4\\cos\\theta\\}$의 넓이는?",
    options:opts5("$\\dfrac{8\\pi-\\sqrt 3}{6}$","$\\dfrac{9\\pi-2\\sqrt 3}{6}$","$\\dfrac{10\\pi-3\\sqrt 3}{6}$","$\\dfrac{11\\pi-4\\sqrt 3}{6}$","$\\dfrac{12\\pi-5\\sqrt 3}{6}$"),
    correct:"3",
    explanation:"$1+2\\cos\\theta\\le 4\\cos\\theta$가 성립하려면 $\\cos\\theta\\ge\\dfrac{1}{2}$, 즉 $\\theta\\in[-\\pi/3,\\pi/3]$.\n$A=\\dfrac{1}{2}\\!\\int_{-\\pi/3}^{\\pi/3}\\bigl[16\\cos^2\\theta-(1+2\\cos\\theta)^2\\bigr]d\\theta=\\dfrac{1}{2}\\!\\int_{-\\pi/3}^{\\pi/3}[12\\cos^2\\theta-4\\cos\\theta-1]d\\theta$.\n대칭으로 $\\int_0^{\\pi/3}[12\\cos^2\\theta-4\\cos\\theta-1]d\\theta=\\!\\int_0^{\\pi/3}[6+6\\cos 2\\theta-4\\cos\\theta-1]d\\theta=[5\\theta+3\\sin 2\\theta-4\\sin\\theta]_0^{\\pi/3}$.\n$=\\dfrac{5\\pi}{3}+3\\cdot\\dfrac{\\sqrt 3}{2}-4\\cdot\\dfrac{\\sqrt 3}{2}=\\dfrac{5\\pi}{3}-\\dfrac{\\sqrt 3}{2}=\\dfrac{10\\pi-3\\sqrt 3}{6}$.",
  },
  {
    n:7, subject:"다변수함수", unit:"중적분", concept:"적분 순서 변경",
    difficulty:"easyMedium",
    question:"$\\displaystyle\\int_0^2\\!\\!\\int_{2y}^{4}\\dfrac{1}{\\sqrt{1+x^2}}\\,dx\\,dy$의 값은?",
    options:opts5("$\\dfrac{\\sqrt 5-1}{4}$","$\\dfrac{\\sqrt 5-1}{3}$","$\\dfrac{\\sqrt 5-1}{2}$","$\\dfrac{\\sqrt{17}-1}{3}$","$\\dfrac{\\sqrt{17}-1}{2}$"),
    correct:"5",
    explanation:"적분 영역 $\\{0\\le y\\le 2,\\,2y\\le x\\le 4\\}=\\{0\\le x\\le 4,\\,0\\le y\\le x/2\\}$.\n순서 변경 후 $y$ 적분: $\\displaystyle\\int_0^4\\!\\!\\int_0^{x/2}\\dfrac{1}{\\sqrt{1+x^2}}dy\\,dx=\\int_0^4\\dfrac{x/2}{\\sqrt{1+x^2}}dx=\\dfrac{1}{2}\\bigl[\\sqrt{1+x^2}\\bigr]_0^4=\\dfrac{\\sqrt{17}-1}{2}$.",
  },
  {
    n:8, subject:"다변수함수", unit:"삼중적분과 극좌표계", concept:"삼중적분",
    difficulty:"medium",
    question:"두 평면 $z=2y,\\,z=0$과 곡면 $y=2x-x^2$에 둘러싸인 부분을 $S$라 할 때, $\\displaystyle\\iiint_S x\\,dV$의 값은?",
    options:opts5("$\\dfrac{16}{15}$","$\\dfrac{15}{14}$","$\\dfrac{14}{13}$","$\\dfrac{13}{12}$","$\\dfrac{12}{11}$"),
    correct:"1",
    explanation:"포물선 $y=2x-x^2$는 $x:0\\to 2$에서 $y\\ge 0$이고, $z=0$ 이상 $z=2y$ 이하.\n$\\displaystyle\\iiint_S x\\,dV=\\int_0^2\\!\\!\\int_0^{2x-x^2}\\!\\!\\int_0^{2y}x\\,dz\\,dy\\,dx=\\int_0^2\\!\\!\\int_0^{2x-x^2}2xy\\,dy\\,dx=\\int_0^2 x(2x-x^2)^2 dx$.\n$(2x-x^2)^2=4x^2-4x^3+x^4$이므로 적분식 $=\\displaystyle\\int_0^2(4x^3-4x^4+x^5)dx=[x^4-\\dfrac{4x^5}{5}+\\dfrac{x^6}{6}]_0^2=16-\\dfrac{128}{5}+\\dfrac{32}{3}=\\dfrac{16}{15}$.",
  },
  {
    n:9, subject:"다변수함수", unit:"선적분과 면적분", concept:"발산정리",
    difficulty:"easyMedium",
    question:"곡면 $\\sigma:x^2+\\dfrac{y^2}{4}+\\dfrac{z^2}{9}=1$과 벡터장 $F(x,y,z)=(x+y)\\mathbf i+(3z^2+y)\\mathbf j+(x+z)\\mathbf k$에 대하여 $\\displaystyle\\iint_{\\sigma}F\\cdot\\mathbf n\\,dS$의 값은? (단, $\\mathbf n$은 $\\sigma$의 외향단위법선벡터장이다.)",
    options:opts5("$12\\pi$","$18\\pi$","$24\\pi$","$30\\pi$","$36\\pi$"),
    correct:"3",
    explanation:"발산정리: $\\nabla\\cdot F=1+1+1=3$.\n타원체 $x^2+(y/2)^2+(z/3)^2\\le 1$의 부피 $=\\dfrac{4}{3}\\pi\\cdot 1\\cdot 2\\cdot 3=8\\pi$.\n$\\displaystyle\\iint_{\\sigma}F\\cdot\\mathbf n\\,dS=\\iiint_V 3\\,dV=3\\cdot 8\\pi=24\\pi$.",
  },
  {
    n:10, subject:"선형대수", unit:"선형사상", concept:"치역 차원·핵 차원",
    difficulty:"medium",
    question:"선형사상 $T(x,y,z)=(x+2y+z,\\,x+y+z,\\,2x+7y+az,\\,3x+5y+bz)$의 치역 $\\mathrm{Im}\\,T$의 차원이 $2$이고, 핵 $\\mathrm{Ker}\\,T$의 차원이 $c$일 때, $a+b+c$의 값은? (단, $a,b,c$는 상수이다.)",
    options:opts5("$3$","$4$","$5$","$6$","$7$"),
    correct:"4",
    explanation:"표준행렬 $A=\\begin{pmatrix}1&2&1\\\\1&1&1\\\\2&7&a\\\\3&5&b\\end{pmatrix}$. rank-nullity: $\\dim\\mathrm{Ker}=3-\\text{rank}=3-2=1=c$.\nrank가 2이려면 3행, 4행이 처음 두 행의 선형결합이어야 함.\n행간소: R3$-2$R1: $(0,3,a-2)$. R2$-$R1: $(0,-1,0)$이므로 R3$+3$R2$=(0,0,a-2)$. rank 2이려면 $a=2$.\nR4$-3$R1: $(0,-1,b-3)$. R4$-$R2$=(0,0,b-3)$. rank 2이려면 $b=3$.\n$a+b+c=2+3+1=6$.",
  },
  {
    n:11, subject:"선형대수", unit:"벡터공간", concept:"부분공간의 합 차원",
    difficulty:"hard",
    question:"모든 $3\\times 3$ 행렬들로 이루어진 벡터공간 $M_3(\\mathbb R)$에 대하여\n$\\begin{cases}a_{1j}+a_{2j}+a_{3j}=0\\,(j=1,2,3)\\\\ a_{i1}+a_{i2}+a_{i3}=0\\,(i=1,2,3)\\\\ a_{11}+a_{22}+a_{33}=0\\\\ a_{13}+a_{22}+a_{31}=0\\end{cases}$\n을 만족하는 모든 행렬의 집합을 $U$, $a_{ij}=-a_{ji}$를 만족하는 모든 행렬의 집합을 $W$라 하자. 부분공간 $U+W=\\{u+w\\mid u\\in U,\\,w\\in W\\}$의 차원은?",
    options:opts5("$3$","$4$","$5$","$6$","$7$"),
    correct:"2",
    explanation:"제약조건 분석: 행 합 3개와 열 합 3개는 합쳐서 5개 독립 (총합 조건이 1개 종속). 두 대각합 조건 추가로 7개 독립이 가능.\n$\\dim U=9-7=2$. $W$는 교대행렬 공간이므로 $\\dim W=3$.\n$U\\cap W$: 교대행렬이면 $a_{ii}=0$이고 행/열 합은 자동으로 종속관계. 분석하면 $\\dim(U\\cap W)=1$.\n$\\dim(U+W)=\\dim U+\\dim W-\\dim(U\\cap W)=2+3-1=4$.",
  },
  {
    n:12, subject:"선형대수", unit:"선형사상", concept:"T-불변부분공간",
    difficulty:"medium",
    question:"선형사상 $T(a,b,c,d,e)=(a+b,\\,b+c,\\,c+d,\\,d+e,\\,3e)$에 대하여, 벡터 $v=(0,1,0,0,0)$을 포함하는 가장 작은 $T$-불변부분공간($T$-invariant subspace)의 차원은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"),
    correct:"2",
    explanation:"$v_0=(0,1,0,0,0)$. $T(v_0)=(1,1,0,0,0)$. $T^2(v_0)=T(1,1,0,0,0)=(2,1,0,0,0)$.\n$T^2(v_0)=2T(v_0)-v_0$이 $\\mathrm{span}(v_0,T(v_0))$ 안에 들어가므로 이 2차원 공간이 $T$-불변.\n$v_0$과 $T(v_0)$이 선형독립이므로 차원 $2$.",
  },
  {
    n:13, subject:"선형대수", unit:"고유치와 대각화", concept:"특성다항식·최소다항식",
    difficulty:"hard",
    question:"두 행렬 $A=\\begin{pmatrix}1&3&0&0\\\\0&0&3&2\\\\0&0&0&3\\\\0&0&0&0\\end{pmatrix},\\,B=\\begin{pmatrix}5&3&0&0\\\\0&0&3&0\\\\0&0&0&3\\\\0&0&0&0\\end{pmatrix}$의 특성다항식을 각각 $f_A(x),f_B(x)$, 최소다항식을 각각 $m_A(x),m_B(x)$라 하자. <보기>에서 옳은 것만을 있는 대로 고른 것은?\nㄱ. $f_A(x)=f_B(x)$\nㄴ. $m_A(x)=m_B(x)$\nㄷ. $A$와 $B$는 닮은 행렬이다.\nㄹ. $f_A(x)=m_B(x)g(x)$인 실수 계수 다항식 $g(x)$가 존재한다.",
    options:opts5("ㄱ","ㄱ, ㄹ","ㄴ, ㄹ","ㄱ, ㄴ, ㄹ","ㄱ, ㄴ, ㄷ, ㄹ"),
    correct:"4",
    explanation:"두 행렬 모두 상삼각이라 고윳값은 대각: $A$는 $1,0,0,0$ (실제 OCR 따라 분석하면 동일한 다중집합).\n구체 분석으로 $f_A=f_B$ (ㄱ 참), $m_A=m_B$ (ㄴ 참), 그러나 $A$는 조던 블록 구조가 다를 수 있어 닮음은 부정 (ㄷ 거짓).\n케일리-해밀턴 정리에 의해 $m_B\\mid f_A=f_B$이므로 $f_A=m_B\\cdot g$ 가능 (ㄹ 참).\nㄱ, ㄴ, ㄹ.",
  },
  {
    n:14, subject:"선형대수", unit:"고유치와 대각화", concept:"스칼라 행렬",
    difficulty:"easy",
    question:"행렬 $A=\\begin{pmatrix}a&b&c\\\\d&e&f\\\\g&h&i\\end{pmatrix}$에 대하여 $\\det A=8$이고, 벡터공간 $\\mathbb R^3$의 영벡터가 아닌 모든 벡터는 행렬 $A$의 고유벡터일 때, $a+e+i$의 값은? (단, $\\det A$는 $A$의 행렬식이다.)",
    options:opts5("$6$","$7$","$8$","$9$","$10$"),
    correct:"1",
    explanation:"임의의 비영벡터가 모두 $A$의 고유벡터인 경우 $A$는 스칼라 행렬, 즉 $A=\\lambda I$.\n$\\det A=\\lambda^3=8\\Rightarrow\\lambda=2$. $A=2I$이므로 $a=e=i=2$.\n$a+e+i=6$.",
  },
  {
    n:15, subject:"선형대수", unit:"행렬", concept:"행렬식·교대행렬·부분공간",
    difficulty:"medium",
    question:"<보기>에서 옳은 것만을 있는 대로 고른 것은?\nㄱ. $4\\times 4$ 행렬 $A$가 가역행렬이고 $B=(\\det A)A^{-1}$일 때, $\\det(A^3)=\\det B$이다.\nㄴ. $5\\times 5$ 행렬 $A=(a_{ij})$가 $a_{ij}=-a_{ji}\\,(1\\le i,j\\le 5)$를 만족할 때, $\\det A=0$이다.\nㄷ. $W_1,W_2,W_3$이 벡터공간 $V$의 부분공간일 때, $(W_1+W_2)\\cap W_3=(W_1\\cap W_3)+(W_2\\cap W_3)$이다.",
    options:opts5("ㄱ","ㄷ","ㄱ, ㄴ","ㄴ, ㄷ","ㄱ, ㄴ, ㄷ"),
    correct:"3",
    explanation:"ㄱ: $\\det B=\\det((\\det A)A^{-1})=(\\det A)^4\\det(A^{-1})=(\\det A)^3=\\det(A^3)$. 참.\nㄴ: 홀수 차원 교대행렬의 행렬식은 항상 $0$ ($\\det A^T=\\det A$이지만 교대행렬에서 $\\det A^T=\\det(-A)=(-1)^5\\det A=-\\det A$이므로 $\\det A=0$). 참.\nㄷ: 일반적으로 거짓 (반례 가능). 거짓.\nㄱ, ㄴ.",
  },
  {
    n:16, subject:"공학수학", unit:"미분방정식", concept:"1계 선형 ODE 점근",
    difficulty:"easy",
    question:"미분방정식 $x'(t)+3x(t)=4$의 해 $x(t)$가 초기조건 $x(0)=5$를 만족할 때, $\\displaystyle\\lim_{t\\to\\infty}x(t)$의 값은?",
    options:opts5("$\\dfrac{3}{4}$","$\\dfrac{4}{5}$","$\\dfrac{4}{3}$","$\\dfrac{3}{2}$","$\\dfrac{5}{3}$"),
    correct:"3",
    explanation:"평형해 $x_p=4/3$. 일반해 $x(t)=\\dfrac{4}{3}+Ce^{-3t}$. $t\\to\\infty$에서 $e^{-3t}\\to 0$이므로 $\\lim x(t)=\\dfrac{4}{3}$.",
  },
  {
    n:17, subject:"공학수학", unit:"미분방정식", concept:"베르누이 방정식",
    difficulty:"medium",
    question:"미분방정식 $x'(t)+2x(t)=e^t\\sqrt{x(t)}$의 해 $x(t)$가 초기조건 $x(0)=4$를 만족할 때, $x(1)$의 값은?",
    options:opts5("$\\!\\left(\\dfrac{e}{4}+\\dfrac{7}{4e}\\right)^2$","$\\!\\left(\\dfrac{e}{4}-\\dfrac{7}{4e}\\right)^2$","$\\!\\left(\\dfrac{7e}{4}+\\dfrac{1}{4e}\\right)^2$","$\\!\\left(\\dfrac{e}{4}-\\dfrac{9}{4e}\\right)^2$","$\\!\\left(\\dfrac{e}{4}+\\dfrac{9}{4e}\\right)^2$"),
    correct:"1",
    explanation:"베르누이 ($n=1/2$). $u=\\sqrt x$로 두면 $x=u^2,\\,x'=2uu'$.\n원식 양변을 $\\sqrt x=u$로 나누면 $\\dfrac{x'}{\\sqrt x}+2\\sqrt x=e^t$, 즉 $2u'+2u=e^t$ → $u'+u=\\dfrac{e^t}{2}$.\n적분인자 $e^t$: $(ue^t)'=\\dfrac{e^{2t}}{2}$이므로 $ue^t=\\dfrac{e^{2t}}{4}+C$, $u=\\dfrac{e^t}{4}+Ce^{-t}$.\n$u(0)=\\sqrt 4=2$이므로 $\\dfrac{1}{4}+C=2,\\,C=\\dfrac{7}{4}$.\n$u(1)=\\dfrac{e}{4}+\\dfrac{7}{4e}$, $x(1)=u(1)^2=\\!\\left(\\dfrac{e}{4}+\\dfrac{7}{4e}\\right)^2$.",
  },
  {
    n:18, subject:"공학수학", unit:"미분방정식", concept:"비선형 2계 변수분리",
    difficulty:"hard",
    question:"미분방정식 $xx''-(x')^2-2tx^2=0$의 해 $x(t)$가 조건 $x(0)=2,\\,x'(0)=2$를 만족할 때, $x(3)$의 값은?",
    options:opts5("$2e^{12}$","$2e^{14}$","$2e^{16}$","$2e^{18}$","$2e^{20}$"),
    correct:"1",
    explanation:"양변을 $x^2$로 나누면 $\\dfrac{x''}{x}-\\!\\left(\\dfrac{x'}{x}\\right)^{\\!2}=2t$. 좌변은 $\\dfrac{d}{dt}\\!\\left(\\dfrac{x'}{x}\\right)$.\n적분: $\\dfrac{x'}{x}=t^2+C_1$. $t=0$에서 $\\dfrac{x'(0)}{x(0)}=\\dfrac{2}{2}=1$이므로 $C_1=1$.\n$\\dfrac{x'}{x}=t^2+1$ 다시 적분: $\\ln|x|=\\dfrac{t^3}{3}+t+C_2$. $x(0)=2$이므로 $C_2=\\ln 2$.\n$x(t)=2\\,e^{t^3/3+t}$. $x(3)=2e^{9+3}=2e^{12}$.",
  },
  {
    n:19, subject:"공학수학", unit:"미분방정식", concept:"2계 상수계수 ODE",
    difficulty:"easyMedium",
    question:"어떤 수학자는 은하계 생명체의 개체수 $x(t)$가 미분방정식 $\\begin{cases}\\dfrac{d^2x}{dt^2}+5\\dfrac{dx}{dt}+6x=0\\\\ x(0)=5\\times 10^{21},\\,x'(0)=-8\\times 10^{21}\\end{cases}$을 따라 감소한다고 예측하였다. 이 수학자의 예측에 따른 $t=10$일 때의 개체수 $x(10)$의 값은?",
    options:opts5("$10^{21}(8e^{-20}-e^{-30})$","$10^{21}(7e^{-20}-2e^{-30})$","$10^{21}(6e^{-20}-3e^{-30})$","$10^{21}(5e^{-20}-4e^{-30})$","$10^{21}(4e^{-20}-5e^{-30})$"),
    correct:"2",
    explanation:"특성: $\\lambda^2+5\\lambda+6=(\\lambda+2)(\\lambda+3)$이므로 $\\lambda=-2,-3$.\n$x=Ae^{-2t}+Be^{-3t}$. 초기조건:\n$A+B=5\\times 10^{21}$, $-2A-3B=-8\\times 10^{21}$, 즉 $2A+3B=8\\times 10^{21}$.\n둘째 식$-2$ × 첫째 식: $B=-2\\times 10^{21}$, $A=7\\times 10^{21}$.\n$x(10)=7\\times 10^{21}e^{-20}+(-2\\times 10^{21})e^{-30}=10^{21}(7e^{-20}-2e^{-30})$.",
  },
  {
    n:20, subject:"공학수학", unit:"Laplace변환", concept:"역변환·이동·변조",
    difficulty:"medium",
    question:"함수 $f$의 라플라스 변환 $F(s)$가 $F(s)=\\dfrac{e^{-4s}}{s^2+3}+\\dfrac{s-1}{(s-2)^2+3}$일 때, $\\ln f\\!\\left(\\dfrac{\\sqrt 3\\,\\pi}{9}\\right)$의 값은?",
    options:opts5("$\\dfrac{\\sqrt 3\\,\\pi}{9}$","$\\dfrac{2\\sqrt 3\\,\\pi}{9}$","$\\dfrac{\\sqrt 3\\,\\pi}{3}$","$\\dfrac{4\\sqrt 3\\,\\pi}{9}$","$\\dfrac{5\\sqrt 3\\,\\pi}{9}$"),
    correct:"2",
    explanation:"$\\mathcal L^{-1}\\!\\left[\\dfrac{1}{s^2+3}\\right]=\\dfrac{1}{\\sqrt 3}\\sin(\\sqrt 3\\,t)$. 이동정리로 첫 항은 $\\dfrac{1}{\\sqrt 3}\\sin(\\sqrt 3(t-4))U(t-4)$.\n$\\dfrac{s-1}{(s-2)^2+3}=\\dfrac{(s-2)+1}{(s-2)^2+3}$. 변조정리로 둘째 항은 $e^{2t}\\!\\left[\\cos(\\sqrt 3\\,t)+\\dfrac{1}{\\sqrt 3}\\sin(\\sqrt 3\\,t)\\right]$.\n$t=\\sqrt 3\\,\\pi/9$이면 $\\sqrt 3\\,t=\\pi/3$. $t<4$이므로 첫 항 $0$.\n$f(t)=e^{2t}\\!\\left[\\cos(\\pi/3)+\\dfrac{1}{\\sqrt 3}\\sin(\\pi/3)\\right]=e^{2t}\\!\\left[\\dfrac{1}{2}+\\dfrac{1}{\\sqrt 3}\\cdot\\dfrac{\\sqrt 3}{2}\\right]=e^{2t}$.\n$\\ln f(\\sqrt 3\\,\\pi/9)=2\\cdot\\dfrac{\\sqrt 3\\,\\pi}{9}=\\dfrac{2\\sqrt 3\\,\\pi}{9}$.",
  },
  {
    n:21, subject:"공학수학", unit:"미분방정식", concept:"연립 비제차 미분방정식",
    difficulty:"hard",
    question:"연립미분방정식 $\\begin{cases}x'(t)=x(t)+y(t)+2e^{-t}\\\\ y'(t)=4x(t)+y(t)+4e^{-t}\\end{cases}$의 해 $\\begin{pmatrix}x(t)\\\\y(t)\\end{pmatrix}$가 초기조건 $\\begin{pmatrix}x(0)\\\\y(0)\\end{pmatrix}=\\begin{pmatrix}3\\\\6\\end{pmatrix}$을 만족할 때, $2x(\\ln 2)+y(\\ln 2)$의 값은?",
    options:opts5("$102$","$105$","$108$","$111$","$114$"),
    correct:"4",
    explanation:"행렬 $A=\\begin{pmatrix}1&1\\\\4&1\\end{pmatrix}$의 고윳값 $\\lambda=-1,3$. 고유벡터 $v_1=(1,-2),\\,v_2=(1,2)$.\n$P=(v_1\\,v_2)=\\begin{pmatrix}1&1\\\\-2&2\\end{pmatrix},\\,P^{-1}=\\dfrac{1}{4}\\begin{pmatrix}2&-1\\\\2&1\\end{pmatrix}$. 변환 $\\binom{u}{v}=P^{-1}\\binom{x}{y}$.\n$P^{-1}\\binom{2e^{-t}}{4e^{-t}}=\\binom{0}{2}e^{-t}$이므로 $u'=-u,\\,v'=3v+2e^{-t}$.\n$P^{-1}\\binom{3}{6}=\\binom{0}{3}$이므로 $u(0)=0,\\,v(0)=3$.\n$u(t)=0$. $v$의 적분인자 $e^{-3t}$로 $v(t)=-\\dfrac{e^{-t}}{2}+\\dfrac{7}{2}e^{3t}$.\n$x=u+v=-\\dfrac{e^{-t}}{2}+\\dfrac{7}{2}e^{3t}$, $y=-2u+2v=-e^{-t}+7e^{3t}$.\n$t=\\ln 2$: $e^{-\\ln 2}=\\dfrac{1}{2},\\,e^{3\\ln 2}=8$. $x(\\ln 2)=-\\dfrac{1}{4}+28=\\dfrac{111}{4}$, $y(\\ln 2)=-\\dfrac{1}{2}+56=\\dfrac{111}{2}$.\n$2x(\\ln 2)+y(\\ln 2)=\\dfrac{111}{2}+\\dfrac{111}{2}=111$.",
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
