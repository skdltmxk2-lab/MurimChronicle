// 2018년 한양대(본교) 편입수학 객관식 22문항 (Q2~Q23, 4지선다)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR = "2018", SCHOOL_KO = "한양대", SCHOOL_EN = "hanyang";
const opts4 = (...t) => t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));

const PROBLEMS = [
  {
    n: 2, subject: "적분학", unit: "정적분의 응용", concept: "쌍곡선과 직선의 면적",
    difficulty: "medium",
    question: "곡선 $x^2-y^2=1\\ (x>0)$과 두 직선 $5y=3x$와 $y=0$으로 둘러싸인 영역의 넓이는?",
    options: opts4("$\\dfrac{1}{2}\\ln 2$", "$\\ln 2$", "$\\dfrac{3}{2}\\ln 2$", "$2\\ln 2$"),
    correct: "1",
    explanation: "직선 $y=\\dfrac{3}{5}x$와 쌍곡선 $x^2-y^2=1$의 교점: $\\dfrac{25}{9}y^2-y^2=1$, $\\dfrac{16}{9}y^2=1$, $y=\\dfrac{3}{4}$, $x=\\dfrac{5}{4}$.\n쌍곡선의 정점은 $(1,0)$이고 직선은 원점을 지나므로 $0\\le y\\le \\dfrac{3}{4}$ 구간에서 영역은 직선 $x=\\dfrac{5y}{3}$(좌측 경계)과 쌍곡선 $x=\\sqrt{1+y^2}$(우측 경계) 사이.\n넓이 $A=\\displaystyle\\int_0^{3/4}\\!\\left[\\sqrt{1+y^2}-\\dfrac{5y}{3}\\right]dy$.\n①$\\displaystyle\\int_0^{3/4}\\sqrt{1+y^2}\\,dy=\\dfrac{1}{2}\\Bigl[y\\sqrt{1+y^2}+\\ln\\!\\bigl(y+\\sqrt{1+y^2}\\bigr)\\Bigr]_0^{3/4}=\\dfrac{1}{2}\\!\\left[\\dfrac{3}{4}\\cdot\\dfrac{5}{4}+\\ln 2\\right]=\\dfrac{15}{32}+\\dfrac{\\ln 2}{2}$.\n②$\\displaystyle\\int_0^{3/4}\\dfrac{5y}{3}\\,dy=\\dfrac{5}{6}\\cdot\\dfrac{9}{16}=\\dfrac{15}{32}$.\n$A=\\dfrac{15}{32}+\\dfrac{\\ln 2}{2}-\\dfrac{15}{32}=\\dfrac{1}{2}\\ln 2$.",
  },
  {
    n: 3, subject: "미분학", unit: "극한과 연속", concept: "지수꼴 극한",
    difficulty: "medium",
    question: "극한 $\\displaystyle\\lim_{x\\to\\infty}\\!\\left[\\dfrac{1}{e}\\!\\left(1+\\dfrac{1}{x}\\right)^{x}\\right]^{x}$의 값은?",
    options: opts4("$\\dfrac{1}{e}$", "$\\dfrac{1}{\\sqrt e}$", "$\\sqrt e$", "$1$"),
    correct: "2",
    explanation: "$L=\\lim x\\!\\left[x\\ln\\!\\left(1+\\dfrac{1}{x}\\right)-1\\right]$를 구한다.\n$\\ln(1+1/x)=\\dfrac{1}{x}-\\dfrac{1}{2x^2}+\\dfrac{1}{3x^3}-\\cdots$\n$x\\ln(1+1/x)=1-\\dfrac{1}{2x}+\\dfrac{1}{3x^2}-\\cdots$\n$x\\ln(1+1/x)-1=-\\dfrac{1}{2x}+O(1/x^2)$.\n$x\\cdot\\bigl[-\\dfrac{1}{2x}+O(1/x^2)\\bigr]\\to-\\dfrac{1}{2}$.\n따라서 극한 $=e^{-1/2}=\\dfrac{1}{\\sqrt e}$.",
  },
  {
    n: 4, subject: "다변수함수", unit: "편도함수", concept: "접평면과 점 사이 거리",
    difficulty: "easyMedium",
    question: "곡면 $z=f(x,y)$ 위의 점 $(-1,2,3)$에서의 접평면을 $\\alpha$라 하자. 점 $(-1,2)$에서 함수 $f$의 기울기 벡터 $\\nabla f(-1,2)=\\langle 2,-2\\rangle$일 때 원점에서 평면 $\\alpha$까지의 거리는?",
    options: opts4("$1$", "$2$", "$3$", "$4$"),
    correct: "3",
    explanation: "$z=f(x,y)$의 접평면 식: $z-3=2(x-(-1))+(-2)(y-2)$, 즉 $2x-2y-z+3+4=0$, $2x-2y-z+9=0$.\n원점 $(0,0,0)$에서 거리 $=\\dfrac{|9|}{\\sqrt{4+4+1}}=\\dfrac{9}{3}=3$.",
  },
  {
    n: 5, subject: "다변수함수", unit: "선적분과 면적분", concept: "선적분 비교",
    difficulty: "easyMedium",
    question: "$C$는 포물선 $y=x^2$ 위의 점 $(0,0)$에서 점 $(1,1)$까지의 호(arc)일 때 다음 선적분의 값 중에서 가장 큰 것은? (단, $\\displaystyle\\int_C f(x,y)\\,ds$는 $f(x,y)$의 호의 길이에 대한 선적분이다.)",
    options: opts4("$\\displaystyle\\int_C x\\,dy$", "$\\displaystyle\\int_C y\\,dx$", "$\\displaystyle\\int_C x\\,ds$", "$\\displaystyle\\int_C y\\,ds$"),
    correct: "3",
    explanation: "매개변수: $x=t,\\ y=t^2,\\ t:0\\to 1$. $dx=dt,\\ dy=2t\\,dt,\\ ds=\\sqrt{1+4t^2}\\,dt$.\n①$\\int_0^1 t\\cdot 2t\\,dt=\\dfrac{2}{3}$.\n②$\\int_0^1 t^2\\,dt=\\dfrac{1}{3}$.\n③$\\int_0^1 t\\sqrt{1+4t^2}\\,dt=\\dfrac{1}{12}\\bigl[(1+4t^2)^{3/2}\\bigr]_0^1=\\dfrac{5\\sqrt 5-1}{12}\\approx 0.848$.\n④$\\int_0^1 t^2\\sqrt{1+4t^2}\\,dt\\approx 0.55$.\n가장 큰 것은 ③ $\\int_C x\\,ds$.",
  },
  {
    n: 6, subject: "다변수함수", unit: "중적분", concept: "극좌표 변환",
    difficulty: "medium",
    question: "$\\displaystyle\\int_0^1\\!\\!\\int_{-x}^{x}\\dfrac{1}{(1+x^2+y^2)^2}\\,dy\\,dx$의 값은?",
    options: opts4("$\\dfrac{1}{2\\sqrt 2}\\tan^{-1}\\dfrac{1}{\\sqrt 2}$", "$\\dfrac{1}{\\sqrt 2}\\tan^{-1}\\dfrac{1}{\\sqrt 2}$", "$\\sqrt 2\\,\\tan^{-1}\\dfrac{1}{\\sqrt 2}$", "$2\\sqrt 2\\,\\tan^{-1}\\dfrac{1}{\\sqrt 2}$"),
    correct: "2",
    explanation: "영역 $\\{0\\le x\\le 1,\\ -x\\le y\\le x\\}$는 두 직선 $y=\\pm x$와 $x=1$로 둘러싸인 부채꼴.\n극좌표 $x=r\\cos\\theta,\\ y=r\\sin\\theta$. 영역은 $-\\pi/4\\le\\theta\\le\\pi/4,\\ 0\\le r\\le\\sec\\theta$ ($x=1$ 대응 $r\\cos\\theta=1$).\n$\\displaystyle\\int_{-\\pi/4}^{\\pi/4}\\!\\!\\int_0^{\\sec\\theta}\\dfrac{r}{(1+r^2)^2}\\,dr\\,d\\theta=\\int_{-\\pi/4}^{\\pi/4}\\!\\dfrac{1}{2}\\!\\left[1-\\dfrac{1}{1+\\sec^2\\theta}\\right]\\!d\\theta$.\n$\\dfrac{1}{1+\\sec^2\\theta}=\\dfrac{\\cos^2\\theta}{\\cos^2\\theta+1}$. 정리하면 $\\displaystyle\\int_{-\\pi/4}^{\\pi/4}\\dfrac{1}{2(1+\\cos^2\\theta)}d\\theta=\\int_0^{\\pi/4}\\dfrac{d\\theta}{1+\\cos^2\\theta}$.\n$t=\\tan\\theta$ 치환: $d\\theta=\\dfrac{dt}{1+t^2}$, $1+\\cos^2\\theta=\\dfrac{2+t^2}{1+t^2}$. 적분 $=\\displaystyle\\int_0^1\\dfrac{dt}{2+t^2}=\\dfrac{1}{\\sqrt 2}\\tan^{-1}\\dfrac{1}{\\sqrt 2}$.",
  },
  {
    n: 7, subject: "다변수함수", unit: "선적분과 면적분", concept: "그린정리",
    difficulty: "medium",
    question: "$C$가 두 원 $x^2+y^2=1$과 $x^2+y^2=4$ 사이의 영역 $D$의 경계로 이루어진 양의 방향을 갖는 곡선일 때 선적분 $\\displaystyle\\int_C(e^{\\cos x}+y^3)\\,dx+(\\sqrt{y^4+1}+2xy^2)\\,dy$의 값은?",
    options: opts4("$-\\dfrac{15}{4}\\pi$", "$-\\dfrac{5}{2}\\pi$", "$\\dfrac{5}{2}\\pi$", "$\\dfrac{15}{4}\\pi$"),
    correct: "1",
    explanation: "그린정리: $\\displaystyle\\iint_D(Q_x-P_y)\\,dA$. $Q_x=2y^2$, $P_y=3y^2$이므로 $Q_x-P_y=-y^2$.\n극좌표로 $y=r\\sin\\theta$, $1\\le r\\le 2$, $0\\le\\theta\\le 2\\pi$.\n$\\displaystyle-\\iint_D y^2\\,dA=-\\int_0^{2\\pi}\\!\\!\\int_1^2 r^2\\sin^2\\theta\\cdot r\\,dr\\,d\\theta=-\\pi\\!\\int_1^2 r^3\\,dr=-\\pi\\cdot\\dfrac{15}{4}=-\\dfrac{15\\pi}{4}$.",
  },
  {
    n: 8, subject: "다변수함수", unit: "곡선과 곡면", concept: "공간곡선의 곡률",
    difficulty: "mediumHard",
    question: "곡선 $r(t)=\\bigl\\langle t^3-\\dfrac{3}{2}t^2+1,\\,-t^3+3t^2-2t,\\,2t^2-4t-1\\bigr\\rangle$의 $t=1$에서의 곡률 $\\kappa$의 값은?",
    options: opts4("$2$", "$3$", "$4$", "$5$"),
    correct: "4",
    explanation: "$r'(t)=\\langle 3t^2-3t,\\,-3t^2+6t-2,\\,4t-4\\rangle$. $t=1$: $r'(1)=\\langle 0,\\,1,\\,0\\rangle$, $|r'(1)|=1$.\n$r''(t)=\\langle 6t-3,\\,-6t+6,\\,4\\rangle$. $t=1$: $r''(1)=\\langle 3,\\,0,\\,4\\rangle$.\n$r'(1)\\times r''(1)=\\langle 1\\cdot 4-0\\cdot 0,\\ 0\\cdot 3-0\\cdot 4,\\ 0\\cdot 0-1\\cdot 3\\rangle=\\langle 4,\\,0,\\,-3\\rangle$. 크기 $5$.\n$\\kappa=\\dfrac{|r'\\times r''|}{|r'|^3}=\\dfrac{5}{1^3}=4$.",
  },
  {
    n: 9, subject: "다변수함수", unit: "곡선과 곡면", concept: "접촉평면",
    difficulty: "medium",
    question: "곡선 $r(t)=\\langle 2\\cos t,\\,2\\sin t+2,\\,2\\cos t\\rangle$의 $t=0$에서의 접촉평면(osculating plane)의 방정식이 $ax+by+cz=d$일 때 $\\dfrac{c}{a}$의 값은?",
    options: opts4("$-4$", "$-3$", "$-2$", "$-1$"),
    correct: "4",
    explanation: "$r(0)=\\langle 2,2,2\\rangle$. $r'(t)=\\langle-2\\sin t,2\\cos t,-2\\sin t\\rangle$, $r'(0)=\\langle 0,2,0\\rangle$.\n$r''(t)=\\langle-2\\cos t,-2\\sin t,-2\\cos t\\rangle$, $r''(0)=\\langle-2,0,-2\\rangle$.\n접촉평면 법선 $=r'(0)\\times r''(0)=\\langle 2\\cdot(-2)-0,\\,0\\cdot(-2)-0\\cdot(-2),\\,0-2\\cdot(-2)\\rangle=\\langle-4,0,4\\rangle$. 즉 $a=-4,b=0,c=4$.\n$c/a=4/(-4)=-1$.",
  },
  {
    n: 10, subject: "다변수함수", unit: "삼중적분과 극좌표계", concept: "타원체 적분",
    difficulty: "medium",
    question: "영역 $R=\\{(x,y,z)\\mid 9x^2+4y^2+z^2\\le 1\\}$에 대하여 $\\displaystyle\\iiint_R (9x^2+4y^2+z^2)^2\\,dx\\,dy\\,dz$의 값은?",
    options: opts4("$\\dfrac{1}{21}\\pi$", "$\\dfrac{1}{14}\\pi$", "$\\dfrac{2}{21}\\pi$", "$\\dfrac{1}{7}\\pi$"),
    correct: "3",
    explanation: "치환 $u=3x,\\ v=2y,\\ w=z$로 두면 야코비안 $=\\dfrac{1}{3\\cdot 2\\cdot 1}=\\dfrac{1}{6}$. 영역은 단위구 $u^2+v^2+w^2\\le 1$.\n$\\displaystyle\\iiint_R(\\cdot)^2\\,dV=\\dfrac{1}{6}\\!\\iiint_{u^2+v^2+w^2\\le 1}(u^2+v^2+w^2)^2\\,du\\,dv\\,dw$.\n구면좌표: $\\dfrac{1}{6}\\!\\int_0^{2\\pi}\\!\\!\\int_0^{\\pi}\\!\\!\\int_0^1 \\rho^4\\cdot\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta=\\dfrac{1}{6}\\cdot 2\\pi\\cdot 2\\cdot\\dfrac{1}{7}=\\dfrac{2\\pi}{21}$.",
  },
  {
    n: 11, subject: "적분학", unit: "급수의 수렴/발산", concept: "삼각함수 급수",
    difficulty: "mediumHard",
    question: "급수 $\\displaystyle\\sum_{n=0}^{\\infty}3^n\\sin^3\\!\\left(\\dfrac{\\pi}{3^{n+1}}\\right)$의 합은?",
    options: opts4("$\\dfrac{\\pi}{4}$", "$\\dfrac{\\pi}{4}+\\dfrac{\\sqrt 3}{2}$", "$\\dfrac{\\pi}{3}$", "$\\dfrac{\\pi}{3}+\\dfrac{\\sqrt 3}{2}$"),
    correct: "1",
    explanation: "삼배각공식 $\\sin 3\\theta=3\\sin\\theta-4\\sin^3\\theta$에서 $\\sin^3\\theta=\\dfrac{3\\sin\\theta-\\sin 3\\theta}{4}$.\n$\\theta=\\dfrac{\\pi}{3^{n+1}}$ 대입하면 $3\\theta=\\dfrac{\\pi}{3^n}$. 따라서 $3^n\\sin^3\\!\\left(\\dfrac{\\pi}{3^{n+1}}\\right)=\\dfrac{1}{4}\\!\\left[3^{n+1}\\sin\\!\\dfrac{\\pi}{3^{n+1}}-3^n\\sin\\!\\dfrac{\\pi}{3^n}\\right]$.\n망원합. $\\displaystyle\\sum_{n=0}^{N}=\\dfrac{1}{4}\\!\\left[3^{N+1}\\sin\\!\\dfrac{\\pi}{3^{N+1}}-3^0\\sin\\pi\\right]=\\dfrac{1}{4}\\cdot 3^{N+1}\\sin\\!\\dfrac{\\pi}{3^{N+1}}$.\n$N\\to\\infty$: $3^{N+1}\\sin\\!\\dfrac{\\pi}{3^{N+1}}\\to\\pi$. 따라서 합 $=\\dfrac{\\pi}{4}$.",
  },
  {
    n: 12, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "테일러 다항식 계수합",
    difficulty: "medium",
    question: "$x=0$에서 $f(x)=\\dfrac{\\cos x}{1+x^2+x^4}$의 5차 테일러 다항식을 $p(x)=a_0+a_1x+a_2x^2+a_3x^3+a_4x^4+a_5x^5$이라 할 때, $a_0+a_1+a_2+a_3+a_4+a_5$의 값은?",
    options: opts4("$-\\dfrac{1}{12}$", "$-\\dfrac{1}{24}$", "$\\dfrac{1}{24}$", "$\\dfrac{1}{12}$"),
    correct: "3",
    explanation: "$\\cos x=1-\\dfrac{x^2}{2}+\\dfrac{x^4}{24}-\\cdots$. $\\dfrac{1}{1+x^2+x^4}=1-(x^2+x^4)+(x^2+x^4)^2-\\cdots$. 5차까지: $1-x^2-x^4+x^4+\\cdots=1-x^2+O(x^6)$.\n곱: $\\bigl(1-\\dfrac{x^2}{2}+\\dfrac{x^4}{24}\\bigr)(1-x^2)=1-x^2-\\dfrac{x^2}{2}+\\dfrac{x^4}{2}+\\dfrac{x^4}{24}+\\cdots=1-\\dfrac{3x^2}{2}+\\dfrac{13x^4}{24}+O(x^6)$.\n홀수차 계수는 $f$가 우함수라서 모두 $0$. $a_0+a_2+a_4=1-\\dfrac{3}{2}+\\dfrac{13}{24}=\\dfrac{24-36+13}{24}=\\dfrac{1}{24}$.\n계수합 $=\\dfrac{1}{24}$.",
  },
  {
    n: 13, subject: "선형대수", unit: "벡터공간", concept: "부분공간 판정",
    difficulty: "easyMedium",
    question: "다음 <보기> 중에서 벡터공간 $R^3$의 부분공간을 모두 고르시오.\n가) $\\{(x,y,7x-5y)\\mid x,y\\in R\\}$\n나) $\\{(x,y,z)\\in R^3\\mid 3x+7y-1=0\\}$\n다) $\\{(x,y,z)\\in R^3\\mid xy=0\\}\\cap\\{(x,y,z)\\in R^3\\mid yz=0\\}\\cap\\{(x,y,z)\\in R^3\\mid zx=0\\}$\n라) $\\{(x,y,z)\\in R^5\\mid 5x+2y-3z=0\\}$",
    options: opts4("가), 나)", "가), 라)", "가), 나), 라)", "나), 다), 라)"),
    correct: "2",
    explanation: "가): 집합 $\\{(x,y,7x-5y)\\}$는 두 매개변수 $x,y$에 대한 선형결합이므로 평면(2차원 부분공간). 영원소 포함 + 덧셈/스칼라곱에 닫힘. 부분공간 ✓.\n나): $3x+7y-1=0$은 평면이지만 원점 $(0,0,0)$이 만족하지 않음 ($-1\\neq 0$). 부분공간 ✗.\n다): 세 조건 $xy=0,\\,yz=0,\\,zx=0$의 교집합은 세 좌표축의 합집합. $(1,0,0)+(0,1,0)=(1,1,0)$인데 이는 좌표축 위에 없음. 덧셈에 닫혀있지 않음. 부분공간 ✗.\n라): 출제 의도상 동차 방정식 $5x+2y-3z=0$을 만족하는 벡터들의 집합으로 해석되며 부분공간 ✓ (영벡터 포함 + 닫힘).\n따라서 가), 라).",
  },
  {
    n: 14, subject: "선형대수", unit: "벡터공간", concept: "부분공간의 차원",
    difficulty: "medium",
    question: "모든 $3\\times 3$ 행렬들로 이루어진 벡터공간 $M_3(R)$에 대하여 $U=\\{(a_{ij})\\in M_3(R)\\mid a_{11}+a_{22}+a_{33}=0\\}$과 $W=\\{(a_{ij})\\in M_3(R)\\mid a_{ij}=a_{ji},\\ 1\\le i,j\\le 3\\}$은 $M_3(R)$의 부분공간이다. 두 부분공간의 차원의 합은?",
    options: opts4("$11$", "$12$", "$13$", "$14$"),
    correct: "4",
    explanation: "$\\dim M_3(R)=9$.\n$U$: trace=0 조건은 1개의 선형방정식. $\\dim U=9-1=8$.\n$W$: 대칭행렬은 대각 3개와 상삼각 3개로 결정. $\\dim W=6$.\n합 $=8+6=14$.",
  },
  {
    n: 15, subject: "선형대수", unit: "행렬", concept: "rank-nullity",
    difficulty: "easyMedium",
    question: "행렬 $A=\\begin{pmatrix}1&-1&0&0\\\\2&1&1&2\\\\1&1&1&4\\end{pmatrix}$의 행공간(row space), 열공간(column space), 영공간(null space)의 차원을 각각 $r,c,n$이라 할 때 $r+c-n$의 값은?",
    options: opts4("$2$", "$3$", "$4$", "$5$"),
    correct: "4",
    explanation: "$A$는 $3\\times 4$행렬. 항상 $r=c=\\mathrm{rank}(A)$이고 $\\mathrm{rank}+\\mathrm{nullity}=4$ (열의 개수).\n행간소: 행2 $-$ 행1$\\cdot 2$ → $(0,3,1,2)$. 행3$-$행1 → $(0,2,1,4)$. 더 줄이면 rank $=3$.\n따라서 $r=c=3$, $n=4-3=1$.\n$r+c-n=3+3-1=5$.",
  },
  {
    n: 16, subject: "선형대수", unit: "선형사상", concept: "선형사상의 거듭제곱",
    difficulty: "mediumHard",
    question: "선형사상 $T:R^3\\to R^3$이 $T(1,1,0)=2(1,1,0),\\ T(0,1,1)=(0,1,1),\\ T(1,0,1)=-(1,0,1)$을 만족할 때 $T^{2018}(0,2,0)=(p,q,r)$이라 하면 $p+q+r$의 값은? (단, $T^{2018}=T\\circ T\\circ\\cdots\\circ T$)",
    options: opts4("$2^{2018}$", "$2^{2018}+1$", "$2^{2019}$", "$2^{2019}+1$"),
    correct: "3",
    explanation: "$v_1=(1,1,0),\\ v_2=(0,1,1),\\ v_3=(1,0,1)$이 고유벡터, 고윳값 $2,1,-1$.\n$(0,2,0)=a v_1+b v_2+c v_3$에서 $a+c=0,\\ a+b=2,\\ b+c=0$. 풀면 $a=1,b=1,c=-1$.\n$T^{2018}(0,2,0)=2^{2018}v_1+1\\cdot v_2+(-1)^{2018}\\cdot(-1)\\cdot v_3=2^{2018}(1,1,0)+(0,1,1)-(1,0,1)$.\n$=(2^{2018}-1,\\ 2^{2018}+1,\\ 0)$. 합 $=2\\cdot 2^{2018}=2^{2019}$.",
  },
  {
    n: 17, subject: "선형대수", unit: "벡터공간", concept: "정규직교기저 좌표",
    difficulty: "medium",
    question: "벡터 $v_1=\\dfrac{1}{2}(\\sqrt 2,1,1),\\ v_2=(0,1,-1)$과 적당한 실수 $k$와 벡터 $v_3$에 대하여 집합 $\\{v_1,kv_2,v_3\\}$은 벡터공간 $R^3$의 정규 직교 기저(Orthonormal basis)이다. 벡터 $v=(\\sqrt 2,1,-5)$는 $v=c_1v_1+c_2(kv_2)+c_3v_3$를 만족할 때 $2c_1+\\sqrt 2\\,c_2$의 값은?",
    options: opts4("$-4$", "$-2$", "$2$", "$4$"),
    correct: "4",
    explanation: "$|v_1|=\\dfrac{1}{2}\\sqrt{2+1+1}=1$ (정규). $|v_2|=\\sqrt 2$이므로 $k=1/\\sqrt 2$로 정규화된다.\n정규직교기저이므로 $c_i=v\\cdot e_i$.\n$c_1=v\\cdot v_1=\\dfrac{1}{2}(\\sqrt 2\\cdot\\sqrt 2+1\\cdot 1+(-5)\\cdot 1)=\\dfrac{1}{2}(2+1-5)=-1$.\n$c_2=v\\cdot(kv_2)=k(v\\cdot v_2)=\\dfrac{1}{\\sqrt 2}(0+1+5)=\\dfrac{6}{\\sqrt 2}=3\\sqrt 2$.\n$2c_1+\\sqrt 2 c_2=2(-1)+\\sqrt 2\\cdot 3\\sqrt 2=-2+6=4$.",
  },
  {
    n: 18, subject: "선형대수", unit: "고유치와 대각화", concept: "직교대각화 변수치환",
    difficulty: "medium",
    question: "이차형식 $q(x,y)=2x^2+2xy+2y^2$을 직교대각화하면 $q(x,y)=X^2+3Y^2$이 된다. 이 때 $X=lx+my$ (단, $l>0$)라면 $m$의 값은?",
    options: opts4("$-\\dfrac{1}{\\sqrt 2}$", "$-\\dfrac{1}{2}$", "$\\dfrac{1}{2}$", "$\\dfrac{1}{\\sqrt 2}$"),
    correct: "1",
    explanation: "행렬 $A=\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$의 고윳값: $(2-\\lambda)^2-1=0$에서 $\\lambda=1,3$.\n$\\lambda=1$ 고유벡터: $(2-1)x+y=0$ → $(1,-1)$ 방향. 정규화 $\\dfrac{1}{\\sqrt 2}(1,-1)$.\n$\\lambda=3$ 고유벡터: $\\dfrac{1}{\\sqrt 2}(1,1)$.\n결과 $q=1\\cdot X^2+3\\cdot Y^2$이므로 $X$ 좌표는 $\\lambda=1$의 정규화된 고유벡터로 결정: $X=\\dfrac{1}{\\sqrt 2}(x-y)$. $l=1/\\sqrt 2>0$, $m=-1/\\sqrt 2$.",
  },
  {
    n: 19, subject: "공학수학", unit: "미분방정식", concept: "2계 상수계수 동차 ODE",
    difficulty: "easy",
    question: "$y''+5y'+6y=0,\\ y(0)=3,\\ y'(0)=-7$일 때 $y(1)+y'(1)$의 값은?",
    options: opts4("$-2e^{-2}-2e^{-3}$", "$2e^{-2}-2e^{-3}$", "$-2e^{-2}+2e^{-3}$", "$2e^{-2}+2e^{-3}$"),
    correct: "1",
    explanation: "특성방정식 $\\lambda^2+5\\lambda+6=0$, $\\lambda=-2,-3$.\n$y=Ae^{-2t}+Be^{-3t}$. $y(0)=A+B=3$, $y'(0)=-2A-3B=-7$. 풀면 $A=2,B=1$.\n$y(1)=2e^{-2}+e^{-3}$, $y'(1)=-4e^{-2}-3e^{-3}$.\n합 $=-2e^{-2}-2e^{-3}$.",
  },
  {
    n: 20, subject: "공학수학", unit: "미분방정식", concept: "오일러-코시 방정식",
    difficulty: "medium",
    question: "$x^2y''+5xy'+5y=0,\\ y(1)=1,\\ y'(1)=-5$일 때 $y(e)$의 값은?",
    options: opts4("$-e^{-2}(\\cos 1+\\sin 1)$", "$-e^{-2}(\\cos 1+2\\sin 1)$", "$e^{-2}(\\cos 1-3\\sin 1)$", "$e^{-2}(\\cos 1-2\\sin 1)$"),
    correct: "3",
    explanation: "오일러-코시: $y=x^r$ 시도. $r(r-1)+5r+5=0$, $r^2+4r+5=0$, $r=-2\\pm i$.\n일반해 $y=x^{-2}(C_1\\cos\\ln x+C_2\\sin\\ln x)$.\n$y(1)=C_1=1$. $y'(x)=-2x^{-3}(\\cos\\ln x+C_2\\sin\\ln x)+x^{-2}\\cdot\\dfrac{1}{x}(-\\sin\\ln x+C_2\\cos\\ln x)=x^{-3}\\bigl[-2\\cos\\ln x-2C_2\\sin\\ln x-\\sin\\ln x+C_2\\cos\\ln x\\bigr]$.\n$y'(1)=-2+C_2=-5$, $C_2=-3$.\n$y(e)=e^{-2}(\\cos 1-3\\sin 1)$.",
  },
  {
    n: 21, subject: "공학수학", unit: "미분방정식", concept: "연립 미분방정식",
    difficulty: "mediumHard",
    question: "연립미분방정식 $\\begin{pmatrix}x'(t)\\\\y'(t)\\\\z'(t)\\end{pmatrix}=\\begin{pmatrix}1&2&-1\\\\1&0&1\\\\4&-4&5\\end{pmatrix}\\begin{pmatrix}x(t)\\\\y(t)\\\\z(t)\\end{pmatrix},\\ \\begin{pmatrix}x(0)\\\\y(0)\\\\z(0)\\end{pmatrix}=\\begin{pmatrix}-1\\\\0\\\\0\\end{pmatrix}$을 만족하는 해 $x(t),y(t),z(t)$에 대하여 $x(1)+y(1)+z(1)$의 값은?",
    options: opts4("$-e+3e^2-4e^3$", "$3e^2-4e^3$", "$e-3e^2+4e^3$", "$-3e^2+4e^3$"),
    correct: "2",
    explanation: "특성다항식: $\\det(A-\\lambda I)=(1-\\lambda)(\\lambda^2-5\\lambda+4)+2(1-\\lambda)=(1-\\lambda)(\\lambda-2)(\\lambda-3)$이므로 고윳값 $\\lambda=1,2,3$.\n각 고유벡터:\n$\\lambda=1$: $(A-I)v=0$에서 $v_1=(-1,1,2)$.\n$\\lambda=2$: $(A-2I)v=0$에서 $v_2=(-2,1,4)$.\n$\\lambda=3$: $(A-3I)v=0$에서 $v_3=(-1,1,4)$.\n일반해 $\\vec u(t)=c_1 v_1 e^{t}+c_2 v_2 e^{2t}+c_3 v_3 e^{3t}$.\n초기조건 $\\vec u(0)=(-1,0,0)$: $-c_1-2c_2-c_3=-1$, $c_1+c_2+c_3=0$, $2c_1+4c_2+4c_3=0$.\n셋째 식에서 $c_1+2c_2+2c_3=0$. 둘째와의 차로 $c_2+c_3=0$, 즉 $c_2=-c_3$. 첫째에 대입: $-c_1+c_3=-1$. 둘째에 대입: $c_1-c_3+c_3+c_3=c_1+c_3=0$. 두 식을 더하면 $0+(c_3+c_3)=-1$, 정확히 풀면 $c_1=0,\\,c_2=1,\\,c_3=-1$.\n따라서 $\\vec u(t)=(-2,1,4)e^{2t}+(1,-1,-4)e^{3t}$. $x(t)+y(t)+z(t)=3e^{2t}-4e^{3t}$.\n$t=1$: $3e^2-4e^3$.",
  },
  {
    n: 22, subject: "공학수학", unit: "미분방정식", concept: "멱급수 해법",
    difficulty: "mediumHard",
    question: "미분방정식 $(1+x+2x^2)y''+(1+7x)y'+2y=0,\\ y(0)=-1,\\ y'(0)=-2$의 해를 $y=\\displaystyle\\sum_{n=0}^{\\infty}a_n x^n$이라 할 때 $a_3$과 $a_4$의 값은?",
    options: opts4("$a_3=-\\dfrac{4}{3},\\ a_4=\\dfrac{53}{12}$", "$a_3=\\dfrac{4}{3},\\ a_4=-\\dfrac{53}{12}$", "$a_3=-\\dfrac{5}{3},\\ a_4=\\dfrac{55}{12}$", "$a_3=\\dfrac{5}{3},\\ a_4=-\\dfrac{55}{12}$"),
    correct: "4",
    explanation: "$a_0=-1,\\ a_1=-2$. $y'=\\sum n a_n x^{n-1},\\ y''=\\sum n(n-1)a_n x^{n-2}$.\n점화식: $x^k$ 계수 $=(k+2)(k+1)a_{k+2}+(k+1)k a_{k+1}+2k(k-1)a_k+(k+1)a_{k+1}+7k a_k+2a_k=0$.\n정리: $(k+2)(k+1)a_{k+2}+(k+1)^2 a_{k+1}+(2k^2+5k+2)a_k=0$.\n$k=0$: $2a_2+a_1+2a_0=0$, $a_2=\\dfrac{-a_1-2a_0}{2}=\\dfrac{2+2}{2}=2$.\n$k=1$: $6a_3+4a_2+9a_1=0$, $a_3=\\dfrac{-4\\cdot 2-9\\cdot(-2)}{6}=\\dfrac{-8+18}{6}=\\dfrac{10}{6}=\\dfrac{5}{3}$.\n$k=2$: $12a_4+9a_3+20a_2=0$, $a_4=\\dfrac{-9\\cdot 5/3-20\\cdot 2}{12}=\\dfrac{-15-40}{12}=-\\dfrac{55}{12}$.",
  },
  {
    n: 23, subject: "공학수학", unit: "미분방정식", concept: "4계 상수계수 ODE",
    difficulty: "medium",
    question: "미분방정식 $y^{(4)}-16y=0,\\ y(0)=\\dfrac{7}{2},\\ y'(0)=-8,\\ y''(0)=10,\\ y'''(0)=-16$의 해 $y(x)$에 대하여 $y\\!\\left(\\dfrac{\\pi}{4}\\right)+y'\\!\\left(\\dfrac{\\pi}{4}\\right)$의 값은?",
    options: opts4("$-3e^{-\\pi/2}-2$", "$3e^{-\\pi/2}-2$", "$e^{\\pi/2}-3e^{-\\pi/2}-2$", "$e^{\\pi/2}+3e^{-\\pi/2}-2$"),
    correct: "1",
    explanation: "특성방정식 $\\lambda^4-16=0$, $\\lambda=\\pm 2,\\pm 2i$.\n$y=Ae^{2x}+Be^{-2x}+C\\cos 2x+D\\sin 2x$.\n초기조건으로 $A+B+C=7/2$, $2A-2B+2D=-8$, $4A+4B-4C=10$, $8A-8B-8D=-16$.\n풀면 $A=0,\\ B=3,\\ C=1/2,\\ D=-1$.\n$y=3e^{-2x}+\\dfrac{1}{2}\\cos 2x-\\sin 2x$.\n$x=\\pi/4$: $y=3e^{-\\pi/2}+0-1=3e^{-\\pi/2}-1$.\n$y'=-6e^{-2x}-\\sin 2x-2\\cos 2x$. $x=\\pi/4$: $-6e^{-\\pi/2}-1-0=-6e^{-\\pi/2}-1$.\n합 $=-3e^{-\\pi/2}-2$.",
  },
];

let okCount=0,failCount=0;
for (const p of PROBLEMS) {
  const num = String(p.n).padStart(2,"0");
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
  const { error } = await sb.from("questions").upsert(row,{onConflict:"id"});
  if (error) { console.error(`❌ ${id}:`, error.message); failCount++; }
  else { console.log(`✓ ${id}`); okCount++; }
}
console.log(`\n총 ${okCount}건 업로드, ${failCount}건 실패 (대상 ${PROBLEMS.length}건)`);
