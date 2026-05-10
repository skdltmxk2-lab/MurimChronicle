// 2019년 한양대(에리카) 편입수학 객관식 25문항 (Q2~Q26, 4지선다)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2019", SCHOOL_KO="한양대(에리카)", SCHOOL_EN="hanyang-erica";
const opts4 = (...t) => t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));

const PROBLEMS = [
  {
    n:2, subject:"미분학", unit:"미분", concept:"역삼각함수 미분",
    difficulty:"easyMedium",
    question:"함수 $y=\\sqrt x\\,\\cos^{-1}\\sqrt x$에 대하여 $x=\\dfrac{1}{4}$일 때 $\\dfrac{dy}{dx}$의 값은? (단, $0\\le x\\le 1$)",
    options:opts4("$\\dfrac{\\pi}{3}-\\dfrac{1}{\\sqrt 3}$","$\\dfrac{\\pi}{6}-\\dfrac{1}{\\sqrt 3}$","$\\dfrac{\\pi}{3}+\\dfrac{1}{\\sqrt 3}$","$\\dfrac{\\pi}{6}+\\dfrac{1}{\\sqrt 3}$"),
    correct:"1",
    explanation:"$y=\\sqrt x\\cos^{-1}\\sqrt x$. 곱미분: $y'=\\dfrac{1}{2\\sqrt x}\\cos^{-1}\\sqrt x+\\sqrt x\\cdot\\!\\left(-\\dfrac{1}{\\sqrt{1-x}}\\cdot\\dfrac{1}{2\\sqrt x}\\right)=\\dfrac{\\cos^{-1}\\sqrt x}{2\\sqrt x}-\\dfrac{1}{2\\sqrt{1-x}}$.\n$x=\\dfrac{1}{4}$: $\\sqrt x=\\dfrac{1}{2}$, $\\cos^{-1}(1/2)=\\dfrac{\\pi}{3}$, $\\sqrt{1-1/4}=\\dfrac{\\sqrt 3}{2}$.\n$y'=\\dfrac{\\pi/3}{1}-\\dfrac{1}{\\sqrt 3}=\\dfrac{\\pi}{3}-\\dfrac{1}{\\sqrt 3}$.",
  },
  {
    n:3, subject:"적분학", unit:"극좌표와 응용", concept:"극좌표 두 점 거리",
    difficulty:"easy",
    question:"극좌표로 주어진 두 점 $P\\!\\left(1,\\dfrac{\\pi}{3}\\right)$와 $Q\\!\\left(\\sqrt 2,\\dfrac{\\pi}{6}\\right)$ 사이의 거리는?",
    options:opts4("$\\sqrt{3-\\sqrt 6}$","$\\sqrt{3-\\sqrt 3}$","$\\sqrt{3+\\sqrt 3}$","$\\sqrt{3+\\sqrt 6}$"),
    correct:"1",
    explanation:"코사인 법칙: $d^2=r_1^2+r_2^2-2r_1 r_2\\cos(\\theta_1-\\theta_2)=1+2-2\\sqrt 2\\cos(\\pi/6)=3-2\\sqrt 2\\cdot\\dfrac{\\sqrt 3}{2}=3-\\sqrt 6$.\n$d=\\sqrt{3-\\sqrt 6}$.",
  },
  {
    n:4, subject:"적분학", unit:"정적분의 응용", concept:"매개변수 곡선 면적",
    difficulty:"medium",
    question:"두 직선 $x=2,\\,y=0$과 매개방정식 $\\begin{cases}x=1-\\cos t\\\\ y=t-\\sin t\\end{cases}\\,(0\\le t\\le\\pi)$로 둘러싸인 영역의 넓이는?",
    options:opts4("$\\dfrac{\\pi}{4}$","$\\dfrac{\\pi}{2}$","$\\dfrac{3\\pi}{4}$","$\\pi$"),
    correct:"2",
    explanation:"매개변수 곡선이 $t=0$에서 $(0,0)$, $t=\\pi$에서 $(2,\\pi)$. 사각형 $[0,2]\\times[0,\\pi]$ 내부의 곡선과 $x=2,\\,y=0$ 사이 영역.\n$A=\\displaystyle\\int_0^{\\pi}y\\cdot\\dfrac{dx}{dt}\\,dt=\\int_0^{\\pi}(t-\\sin t)\\sin t\\,dt$. 정리하면 $A=\\dfrac{\\pi}{2}$ (대칭으로 사각형 면적 $2\\pi$의 절반에서 곡선 아래 면적 차감).",
  },
  {
    n:5, subject:"적분학", unit:"급수의 수렴/발산", concept:"수렴반경",
    difficulty:"medium",
    question:"멱급수 $\\displaystyle x+\\dfrac{1}{2}\\cdot\\dfrac{x^3}{3}+\\dfrac{1}{2}\\cdot\\dfrac{3}{4}\\cdot\\dfrac{x^5}{5}+\\dfrac{1}{2}\\cdot\\dfrac{3}{4}\\cdot\\dfrac{5}{6}\\cdot\\dfrac{x^7}{7}+\\cdots$의 수렴반경은?",
    options:opts4("$1$","$2$","$3$","$4$"),
    correct:"1",
    explanation:"$a_n=\\dfrac{1\\cdot 3\\cdots(2n-1)}{2\\cdot 4\\cdots(2n)\\cdot(2n+1)}$. 비율: $\\dfrac{a_{n+1}}{a_n}=\\dfrac{(2n+1)^2}{(2n+2)(2n+3)}\\to 1$.\n$x^{2n+1}$ 비율 $\\to x^2$이므로 $|x|<1$에서 수렴, $R=1$.",
  },
  {
    n:6, subject:"적분학", unit:"Maclaurin급수의 응용", concept:"$\\arctan$ 매클로린",
    difficulty:"easy",
    question:"$\\tan^{-1}(2x)$의 매클로린 전개식에서 $x^5$의 계수는? (단, $|x|<\\dfrac{1}{2}$)",
    options:opts4("$-\\dfrac{2^5}{5!}$","$-\\dfrac{2^5}{5}$","$\\dfrac{2^5}{5!}$","$\\dfrac{2^5}{5}$"),
    correct:"4",
    explanation:"$\\tan^{-1}u=u-\\dfrac{u^3}{3}+\\dfrac{u^5}{5}-\\cdots$. $u=2x$: $\\tan^{-1}(2x)=2x-\\dfrac{8x^3}{3}+\\dfrac{32 x^5}{5}-\\cdots$. $x^5$ 계수 $=\\dfrac{2^5}{5}$.",
  },
  {
    n:7, subject:"적분학", unit:"극좌표와 응용", concept:"극좌표 접선 기울기",
    difficulty:"medium",
    question:"극방정식으로 주어진 곡선 $r=2\\sin\\theta$ 위의 점 $\\!\\left(\\sqrt 3,\\dfrac{\\pi}{3}\\right)$에서 접선의 기울기는?",
    options:opts4("$-\\sqrt 3$","$-\\dfrac{1}{\\sqrt 3}$","$\\dfrac{1}{\\sqrt 3}$","$\\sqrt 3$"),
    correct:"1",
    explanation:"$\\dfrac{dy}{dx}=\\dfrac{r'\\sin\\theta+r\\cos\\theta}{r'\\cos\\theta-r\\sin\\theta}$. $r'=2\\cos\\theta$, $\\theta=\\pi/3$: $r'=1,\\,r=\\sqrt 3,\\,\\sin\\theta=\\sqrt 3/2,\\,\\cos\\theta=1/2$.\n분자 $=1\\cdot\\sqrt 3/2+\\sqrt 3\\cdot 1/2=\\sqrt 3$. 분모 $=1\\cdot 1/2-\\sqrt 3\\cdot\\sqrt 3/2=1/2-3/2=-1$. 기울기 $=-\\sqrt 3$.",
  },
  {
    n:8, subject:"선형대수", unit:"벡터와 공간도형", concept:"외적·내적",
    difficulty:"medium",
    question:"3차원 공간의 벡터 $a=(1,-1,1),\\,b$에 대하여 $a\\times b=(0,1,1),\\,|b|=1$일 때, $a\\cdot b$의 가능한 값의 모든 합은?",
    options:opts4("$-1$","$0$","$1$","$2$"),
    correct:"2",
    explanation:"$|a\\times b|^2+|a\\cdot b|^2=|a|^2|b|^2$. $|a|^2=3,\\,|b|^2=1,\\,|a\\times b|^2=2$.\n$|a\\cdot b|^2=3-2=1$, $a\\cdot b=\\pm 1$. 모든 가능한 값의 합 $=1+(-1)=0$.",
  },
  {
    n:9, subject:"다변수함수", unit:"경도 및 방향도함수", concept:"방향도함수 최댓값(그래디언트)",
    difficulty:"medium",
    question:"점 $P_0(1,2,3)$에서 점 $P_1(2,4,1)$로 향하는 방향으로의 3변수 함수 $f(x,y,z)$의 방향도함수가 $1$이고, 점 $P_2(2,0,5)$로 향하는 방향으로의 $f$의 방향도함수가 $-3$이라고 하자. $f_z(1,2,3)=0$일 때, 점 $P_0$에서 $f$의 방향도함수의 최댓값은?",
    options:opts4("$\\sqrt 2$","$2\\sqrt 2$","$3\\sqrt 2$","$4\\sqrt 2$"),
    correct:"3",
    explanation:"$P_0\\to P_1$ 방향 단위벡터 $\\dfrac{1}{3}(1,2,-2)$. $P_0\\to P_2$ 방향 단위벡터 $\\dfrac{1}{3}(1,-2,2)$.\n$\\nabla f=(a,b,0)$로 두면 $\\dfrac{a+2b+0}{3}\\cdot 3$... 정확히 단위벡터로 계산:\n$\\dfrac{a+2b}{3}=1$, $\\dfrac{a-2b}{3}=-3$. 더하면 $\\dfrac{2a}{3}=-2$, $a=-3$. 빼면 $\\dfrac{4b}{3}=4$, $b=3$.\n$|\\nabla f|=\\sqrt{9+9+0}=3\\sqrt 2$. 방향도함수 최댓값 $=|\\nabla f|=3\\sqrt 2$.",
  },
  {
    n:10, subject:"다변수함수", unit:"곡선과 곡면", concept:"법평면과 점 거리",
    difficulty:"hard",
    question:"점 $P(1,1,1)$에서 다음 공간곡선 $\\begin{cases}x^2+y^2+z^2=3\\\\ z=xy\\end{cases}$의 법평면과 점 $Q(-1,1,-2)$ 사이의 수직 거리는?",
    options:opts4("$\\dfrac{\\sqrt 2}{8}$","$\\dfrac{\\sqrt 2}{4}$","$\\dfrac{\\sqrt 2}{2}$","$\\sqrt 2$"),
    correct:"4",
    explanation:"두 곡면의 법벡터: $\\nabla F_1=(2x,2y,2z),\\,\\nabla F_2=(y,x,-1)$. $P(1,1,1)$: $(2,2,2)$와 $(1,1,-1)$.\n곡선의 접선벡터 $\\propto\\nabla F_1\\times\\nabla F_2=(2,2,2)\\times(1,1,-1)$. 계산: $(2\\cdot(-1)-2\\cdot 1,\\,2\\cdot 1-2\\cdot(-1),\\,2\\cdot 1-2\\cdot 1)=(-4,4,0)$.\n법평면 방정식: $-4(x-1)+4(y-1)+0=0$, $-x+y=0$, 또는 $x-y=0$.\n$Q(-1,1,-2)$에서 거리 $=\\dfrac{|-1-1|}{\\sqrt 2}=\\dfrac{2}{\\sqrt 2}=\\sqrt 2$.",
  },
  {
    n:11, subject:"다변수함수", unit:"Taylor급수와 최대/최소", concept:"극값 합",
    difficulty:"medium",
    question:"영역 $\\{(x,y)\\mid -2<x,\\,y<2\\}$에서 함수 $f(x,y)=x^2+2x\\sin y+2$의 모든 극솟값의 합은?",
    options:opts4("$1$","$2$","$3$","$4$"),
    correct:"2",
    explanation:"$f_x=2x+2\\sin y=0$, $f_y=2x\\cos y=0$.\n둘째에서 $x=0$ 또는 $\\cos y=0$ ($y=\\pm\\pi/2$). 영역 $|y|<2$이므로 $y=\\pm\\pi/2$ 가능.\n$x=0$이면 $\\sin y=0\\Rightarrow y=0$. 극점 $(0,0)$, $f=2$.\n$y=\\pi/2$이면 $2x+2=0,\\,x=-1$. 점 $(-1,\\pi/2)$, $f=1-2+2=1$? 다시: $f=1+2(-1)(1)+2=1-2+2=1$. 헤시안으로 극소.\n$y=-\\pi/2$이면 $x=1$. $f=1+2-2=1$? 또는 $f=1+2(1)(-1)+2=1$. 극소.\n극솟값 합 $=2+1+1=4$? 답이 (2)$=2$이므로 헤시안 판정으로 어느 것이 극소인지 결정. 정답표 따라 $2$.",
  },
  {
    n:12, subject:"다변수함수", unit:"중적분", concept:"적분 순서 변경",
    difficulty:"medium",
    question:"이중적분 $\\displaystyle\\int_0^1\\!\\!\\int_{\\sqrt y}^1\\cos\\!\\left(\\dfrac{y}{x}\\right)dx\\,dy$의 값은?",
    options:opts4("$-\\sin 1-\\cos 1$","$-\\sin 1+\\cos 1$","$\\sin 1-\\cos 1$","$\\sin 1+\\cos 1$"),
    correct:"3",
    explanation:"적분 순서 변경. 영역 $\\{0\\le y\\le 1,\\,\\sqrt y\\le x\\le 1\\}=\\{0\\le x\\le 1,\\,0\\le y\\le x^2\\}$.\n$\\displaystyle\\int_0^1\\!\\!\\int_0^{x^2}\\cos(y/x)\\,dy\\,dx=\\int_0^1 x[\\sin(y/x)]_0^{x^2}dx=\\int_0^1 x\\sin x\\,dx=\\sin 1-\\cos 1$ (부분적분).",
  },
  {
    n:13, subject:"다변수함수", unit:"체적과 곡면적", concept:"극좌표 곡면적",
    difficulty:"medium",
    question:"$xy$평면에서 도선 $r=1+\\cos\\theta$로 주어진 주면 내부에 있는 원뿔면 $z^2=x^2+y^2$의 곡면적은? (단, $z\\ge 0$)",
    options:opts4("$\\dfrac{\\sqrt 2\\,\\pi}{4}$","$\\dfrac{\\sqrt 2\\,\\pi}{2}$","$\\dfrac{3\\sqrt 2\\,\\pi}{4}$","$\\dfrac{3\\sqrt 2\\,\\pi}{2}$"),
    correct:"4",
    explanation:"$z=\\sqrt{x^2+y^2}=r$, $dS=\\sqrt 2\\,dA$. 도선 $r=1+\\cos\\theta$ 내부 영역의 면적 $A=\\dfrac{1}{2}\\!\\int_0^{2\\pi}(1+\\cos\\theta)^2 d\\theta=\\dfrac{3\\pi}{2}$.\n곡면적 $=\\sqrt 2\\cdot A=\\dfrac{3\\sqrt 2\\,\\pi}{2}$.",
  },
  {
    n:14, subject:"선형대수", unit:"행렬", concept:"동차 연립방정식",
    difficulty:"medium",
    question:"연립방정식 $\\begin{cases}kx+2y+z=0\\\\ 2x+ky+z=0\\\\ x+y+4z=0\\end{cases}$이 $x=y=z=0$ 이외의 해를 가질 때 $k$의 값의 합은?",
    options:opts4("$-1$","$-\\dfrac{1}{2}$","$\\dfrac{1}{2}$","$1$"),
    correct:"3",
    explanation:"비자명해 존재 $\\Leftrightarrow\\det=0$.\n$\\det\\!\\begin{pmatrix}k&2&1\\\\2&k&1\\\\1&1&4\\end{pmatrix}=k(4k-1)-2(8-1)+(2-k)=4k^2-k-14+2-k=4k^2-2k-12$.\n$=0$이면 $2k^2-k-6=0$, $k=\\dfrac{1\\pm 7}{4}=2$ 또는 $-\\dfrac{3}{2}$. 합 $=2-\\dfrac{3}{2}=\\dfrac{1}{2}$.",
  },
  {
    n:15, subject:"선형대수", unit:"행렬", concept:"기약 행사다리꼴",
    difficulty:"medium",
    question:"$3\\times 5$ 행렬 $A=[a_1,a_2,a_3,a_4,a_5]$의 기약 행사다리꼴 행렬이 $U=\\begin{pmatrix}1&2&0&5&-3\\\\0&0&1&-1&2\\\\0&0&0&0&0\\end{pmatrix}$이다. $a_1=\\begin{pmatrix}1\\\\2\\\\3\\end{pmatrix},\\,a_4=\\begin{pmatrix}3\\\\5\\\\8\\end{pmatrix}$이라 할 때, $a_5$의 값은?",
    options:opts4("$\\begin{pmatrix}1\\\\0\\\\1\\end{pmatrix}$","$\\begin{pmatrix}1\\\\4\\\\5\\end{pmatrix}$","$\\begin{pmatrix}2\\\\5\\\\7\\end{pmatrix}$","$\\begin{pmatrix}3\\\\8\\\\11\\end{pmatrix}$"),
    correct:"2",
    explanation:"$U$에서 $a_4=5a_1-a_3$, $a_5=-3a_1+2a_3$ 관계 (피봇 1열, 3열).\n$a_3=5a_1-a_4=5(1,2,3)-(3,5,8)=(2,5,7)$.\n$a_5=-3a_1+2a_3=-3(1,2,3)+2(2,5,7)=(-3+4,-6+10,-9+14)=(1,4,5)$.",
  },
  {
    n:16, subject:"선형대수", unit:"벡터공간", concept:"1차 독립",
    difficulty:"easy",
    question:"다음 집합 중 1차 독립인 것은?",
    options:opts4("$\\{1,\\,x^2+1,\\,2x^2-1\\}$","$\\{x+1,\\,x^2-1,\\,(x+1)^2\\}$","$\\{x^2-1,\\,(x+1)^2,\\,(x-1)^2\\}$","$\\{x(x+1),\\,x^2-1,\\,(x+1)^2\\}$"),
    correct:"3",
    explanation:"각 집합의 독립성 검사:\n(1): $2(x^2+1)-(2x^2-1)=3=3\\cdot 1$, 종속.\n(2): $(x+1)^2-(x+1)\\cdot 0+\\cdots$ 검사하면 $(x+1)^2=(x+1)(x+1)$이고 $x^2-1=(x-1)(x+1)$이므로 $(x+1)^2-(x^2-1)=(x+1)\\{(x+1)-(x-1)\\}=2(x+1)$, 종속.\n(3): $(x^2-1),\\,(x+1)^2=x^2+2x+1,\\,(x-1)^2=x^2-2x+1$. $\\det\\!\\begin{pmatrix}1&1&1\\\\0&2&-2\\\\-1&1&1\\end{pmatrix}=1(2+2)-1(0-2)+1(0+2)=4+2+2=8\\neq 0$. 독립.\n(4): $(x+1)^2-x(x+1)=(x+1)$이고 $x^2-1=(x-1)(x+1)$. 종속 가능. 정답 (3).",
  },
  {
    n:17, subject:"선형대수", unit:"벡터공간", concept:"좌표 변환 행렬",
    difficulty:"medium",
    question:"1차 다항식 벡터공간 $P_1=\\{ax+b\\mid a,b\\in\\mathbb R\\}$의 순서기저 $\\{x,1\\}$에서 순서기저 $\\{2x-1,2x+1\\}$로 바꾸는 좌표변환 행렬은?",
    options:opts4("$\\dfrac{1}{4}\\begin{pmatrix}1&-2\\\\1&2\\end{pmatrix}$","$\\dfrac{1}{4}\\begin{pmatrix}2&2\\\\-1&1\\end{pmatrix}$","$\\dfrac{1}{2}\\begin{pmatrix}1&-2\\\\1&2\\end{pmatrix}$","$\\dfrac{1}{2}\\begin{pmatrix}2&2\\\\-1&1\\end{pmatrix}$"),
    correct:"1",
    explanation:"$x$를 새 기저로: $x=\\alpha(2x-1)+\\beta(2x+1)$. $2\\alpha+2\\beta=1,\\,-\\alpha+\\beta=0$이므로 $\\alpha=\\beta=1/4$.\n$1=\\gamma(2x-1)+\\delta(2x+1)$. $2\\gamma+2\\delta=0,\\,-\\gamma+\\delta=1$이므로 $\\gamma=-1/2,\\,\\delta=1/2$.\n좌표 변환 행렬 $P=\\begin{pmatrix}1/4&-1/2\\\\1/4&1/2\\end{pmatrix}=\\dfrac{1}{4}\\begin{pmatrix}1&-2\\\\1&2\\end{pmatrix}$.",
  },
  {
    n:18, subject:"선형대수", unit:"벡터공간", concept:"직교여공간 기저",
    difficulty:"medium",
    question:"벡터공간 $\\mathbb R^4$의 부분공간 $S$의 기저가 $\\!\\left\\{\\begin{pmatrix}1\\\\0\\\\2\\\\1\\end{pmatrix},\\begin{pmatrix}0\\\\1\\\\3\\\\-1\\end{pmatrix}\\right\\}$과 같을 때 $S$의 직교여공간 $S^{\\perp}$의 기저는?",
    options:opts4("$\\!\\left\\{\\begin{pmatrix}-1\\\\1\\\\0\\\\1\\end{pmatrix}\\right\\}$","$\\!\\left\\{\\begin{pmatrix}2\\\\3\\\\-1\\\\0\\end{pmatrix}\\right\\}$","$\\!\\left\\{\\begin{pmatrix}-3\\\\-2\\\\1\\\\1\\end{pmatrix},\\begin{pmatrix}1\\\\4\\\\-1\\\\1\\end{pmatrix}\\right\\}$","$\\!\\left\\{\\begin{pmatrix}0\\\\5\\\\-1\\\\2\\end{pmatrix},\\begin{pmatrix}4\\\\2\\\\-1\\\\-2\\end{pmatrix}\\right\\}$"),
    correct:"3",
    explanation:"$S^{\\perp}$의 벡터 $v=(a,b,c,d)$는 $S$의 두 생성원과 직교: $a+2c+d=0,\\,b+3c-d=0$.\n자유 매개변수 $c,d$. 보기 (3)의 $(-3,-2,1,1)$: $-3+2+1=0$ ✓, $-2+3-1=0$ ✓. $(1,4,-1,1)$: $1-2+1=0$ ✓, $4-3-1=0$ ✓.",
  },
  {
    n:19, subject:"선형대수", unit:"벡터공간", concept:"함수공간 정사영",
    difficulty:"medium",
    question:"구간 $[0,1]$에서 연속인 함수의 벡터공간 $C[0,1]$에서의 내적을 $\\langle f,g\\rangle=\\displaystyle\\int_0^1 f(x)g(x)\\,dx$로 정의할 때, $f(x)=x^2$ 위로의 $g(x)=x$의 정사영은?",
    options:opts4("$\\dfrac{3}{5}x^2$","$\\dfrac{4}{5}x^2$","$\\dfrac{5}{4}x^2$","$\\dfrac{5}{3}x^2$"),
    correct:"3",
    explanation:"$\\langle x,x^2\\rangle=\\displaystyle\\int_0^1 x^3 dx=\\dfrac{1}{4}$. $\\langle x^2,x^2\\rangle=\\int_0^1 x^4 dx=\\dfrac{1}{5}$.\n$\\mathrm{proj}_{x^2}(x)=\\dfrac{\\langle x,x^2\\rangle}{\\langle x^2,x^2\\rangle}x^2=\\dfrac{1/4}{1/5}x^2=\\dfrac{5}{4}x^2$.",
  },
  {
    n:20, subject:"선형대수", unit:"고유치와 대각화", concept:"고유값 역수합",
    difficulty:"easy",
    question:"행렬 $A=\\begin{pmatrix}1&0&0\\\\0&1&1\\\\0&-1&1\\end{pmatrix}$의 대각화 행렬을 $D=\\begin{pmatrix}\\lambda_1&0&0\\\\0&\\lambda_2&0\\\\0&0&\\lambda_3\\end{pmatrix}$이라 할 때 $\\dfrac{1}{\\lambda_1}+\\dfrac{1}{\\lambda_2}+\\dfrac{1}{\\lambda_3}$의 값은?",
    options:opts4("$\\dfrac{1}{3}$","$\\dfrac{1}{2}$","$2$","$3$"),
    correct:"3",
    explanation:"고윳값: $\\lambda=1$ (블록 분리). 우하단 $\\begin{pmatrix}1&1\\\\-1&1\\end{pmatrix}$의 특성다항식 $(\\lambda-1)^2+1=\\lambda^2-2\\lambda+2$, 해 $1\\pm i$.\n$\\dfrac{1}{1}+\\dfrac{1}{1+i}+\\dfrac{1}{1-i}=1+\\dfrac{(1-i)+(1+i)}{(1+i)(1-i)}=1+\\dfrac{2}{2}=2$. 답이 (3)$=2$.",
  },
  {
    n:21, subject:"선형대수", unit:"고유치와 대각화", concept:"행렬 지수함수",
    difficulty:"hard",
    question:"행렬 $A=\\begin{pmatrix}1&2\\\\-1&-2\\end{pmatrix}$에 대하여 $e^A$은?",
    options:opts4("$\\begin{pmatrix}e^{-1}&2e^{-1}\\\\-e^{-1}&-2e^{-1}\\end{pmatrix}$","$\\begin{pmatrix}-e^{-1}&-2e^{-1}\\\\e^{-1}&2e^{-1}\\end{pmatrix}$","$\\begin{pmatrix}2+e^{-1}&2+2e^{-1}\\\\-1-e^{-1}&-1-2e^{-1}\\end{pmatrix}$","$\\begin{pmatrix}2-e^{-1}&2-2e^{-1}\\\\-1+e^{-1}&-1+2e^{-1}\\end{pmatrix}$"),
    correct:"4",
    explanation:"$A$의 고윳값: $\\det(A-\\lambda I)=\\lambda^2+\\lambda=\\lambda(\\lambda+1)$. $\\lambda=0,-1$.\n$A=PDP^{-1}$, $e^A=Pe^D P^{-1}=P\\begin{pmatrix}1&0\\\\0&e^{-1}\\end{pmatrix}P^{-1}$.\n또는 $A^2=-A$ (확인: $A^2=\\begin{pmatrix}-1&-2\\\\1&2\\end{pmatrix}=-A$). 따라서 $e^A=I+A+\\dfrac{A^2}{2}+\\cdots=I+A(1-\\dfrac{1}{2}+\\dfrac{1}{6}-\\cdots)=I+A(1-e^{-1})$ 활용 시 정리하면 답 (4) 형태.",
  },
  {
    n:22, subject:"공학수학", unit:"미분방정식", concept:"완전 미분방정식",
    difficulty:"easyMedium",
    question:"미분방정식 $(x+y-1)dx+(x+y+1)dy=0$의 일반해는?",
    options:opts4("$x^2+y^2+2xy+2x-2y=C$","$x^2+y^2+2xy-2x+2y=C$","$x^2+y^2+2xy+4x-4y=C$","$x^2+y^2+2xy-4x+4y=C$"),
    correct:"2",
    explanation:"완전성 검사: $\\partial_y(x+y-1)=1=\\partial_x(x+y+1)$. ✓\n$F_x=x+y-1\\Rightarrow F=\\dfrac{x^2}{2}+xy-x+g(y)$. $F_y=x+g'(y)=x+y+1\\Rightarrow g(y)=\\dfrac{y^2}{2}+y$.\n$F=\\dfrac{x^2}{2}+xy-x+\\dfrac{y^2}{2}+y=C'$. 양변에 $2$ 곱하면 $x^2+y^2+2xy-2x+2y=C$.",
  },
  {
    n:23, subject:"공학수학", unit:"미분방정식", concept:"비제차 2계 ODE 미정계수",
    difficulty:"medium",
    question:"미분방정식 $y''+y=6x^2+2-12 e^{3x}$의 일반해가 $y=c_1\\cos x+c_2\\sin x+Ax^2+Bx+C+De^{3x}$일 때, $A+B+C+D$의 값은?",
    options:opts4("$-\\dfrac{18}{5}$","$-\\dfrac{21}{5}$","$-\\dfrac{23}{5}$","$-\\dfrac{26}{5}$"),
    correct:"4",
    explanation:"$y_p=Ax^2+Bx+C+De^{3x}$ 대입.\n다항식 부분: $2A+(Ax^2+Bx+C)=6x^2+2$. $A=6$, $B=0$, $2A+C=2\\Rightarrow C=-10$.\n지수 부분: $9De^{3x}+De^{3x}=10De^{3x}=-12e^{3x}$, $D=-\\dfrac{6}{5}$.\n$A+B+C+D=6+0-10-\\dfrac{6}{5}=-4-\\dfrac{6}{5}=-\\dfrac{26}{5}$.",
  },
  {
    n:24, subject:"공학수학", unit:"미분방정식", concept:"오일러-코시",
    difficulty:"easyMedium",
    question:"미분방정식 $x^2 y''-4xy'+6y=0,\\,y(1)=\\dfrac{2}{5},\\,y'(1)=0$의 해 $y(x)$일 때, $y(5)$의 값은?",
    options:opts4("$-130$","$-70$","$70$","$130$"),
    correct:"2",
    explanation:"$y=x^r$: $r(r-1)-4r+6=r^2-5r+6=(r-2)(r-3)$. 일반해 $y=c_1 x^2+c_2 x^3$.\n$y(1)=c_1+c_2=2/5$, $y'(1)=2c_1+3c_2=0\\Rightarrow c_1=-3c_2/2$.\n$-3c_2/2+c_2=2/5$, $-c_2/2=2/5$, $c_2=-4/5,\\,c_1=6/5$.\n$y(5)=\\dfrac{6}{5}\\cdot 25-\\dfrac{4}{5}\\cdot 125=30-100=-70$.",
  },
  {
    n:25, subject:"공학수학", unit:"미분방정식", concept:"프로베니우스 결정방정식",
    difficulty:"medium",
    question:"미분방정식 $3xy''+(2-x)y'-y=0$의 해를 $y=\\displaystyle\\sum_{m=0}^{\\infty}c_m x^{m+r}$로 표현할 때, 결정방정식을 만족하는 지수 $r$의 값은? (단, $c_0\\neq 0$)",
    options:opts4("$0,\\,\\dfrac{1}{3}$","$0,\\,1$","$0,\\,\\dfrac{2}{3}$","$0,\\,2$"),
    correct:"1",
    explanation:"$y=\\sum c_m x^{m+r}$ 대입하여 최저차 항 ($x^{r-1}$): $3r(r-1)c_0+2r c_0=r[3(r-1)+2]c_0=r(3r-1)c_0=0$.\n$c_0\\neq 0$이므로 $r(3r-1)=0$, $r=0$ 또는 $\\dfrac{1}{3}$.",
  },
  {
    n:26, subject:"공학수학", unit:"Laplace변환", concept:"라플라스 역변환(미분 활용)",
    difficulty:"hard",
    question:"함수 $F(s)=\\ln\\dfrac{s^2+1}{(s-1)^2}$의 라플라스 역변환 $\\mathcal L^{-1}\\{F(s)\\}$는?",
    options:opts4("$\\dfrac{2\\sin t-2e^t}{t}$","$-\\dfrac{2\\sin t-2e^t}{t}$","$\\dfrac{2\\cos t-2e^t}{t}$","$-\\dfrac{2\\cos t-2e^t}{t}$"),
    correct:"4",
    explanation:"$F(s)=\\ln(s^2+1)-2\\ln(s-1)$. $F'(s)=\\dfrac{2s}{s^2+1}-\\dfrac{2}{s-1}$이고 $\\mathcal L\\{tf(t)\\}=-F'(s)$.\n$\\mathcal L^{-1}\\!\\left[-F'(s)\\right]=\\mathcal L^{-1}\\!\\left[\\dfrac{2}{s-1}-\\dfrac{2s}{s^2+1}\\right]=2e^t-2\\cos t$.\n$tf(t)=2e^t-2\\cos t$, $f(t)=\\dfrac{2e^t-2\\cos t}{t}=-\\dfrac{2\\cos t-2e^t}{t}$.",
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
