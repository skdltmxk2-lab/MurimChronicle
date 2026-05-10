// 2020년 한양대(본교) 편입수학 객관식 20문항 (Q2~Q21, 5지선다)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2020", SCHOOL_KO="한양대", SCHOOL_EN="hanyang";
const opts5 = (...t) => t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));

const PROBLEMS = [
  {
    n:2, subject:"적분학", unit:"급수의 수렴/발산", concept:"수렴반경",
    difficulty:"medium",
    question:"급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n^n\\,n!}{\\{1\\cdot 5\\cdot 9\\cdots(4n-3)\\}^2}\\,x^{2n-1}$이 수렴하도록 하는 자연수 $x$의 개수는?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"),
    correct:"2",
    explanation:"비율판정. $a_n=\\dfrac{n^n n!}{[1\\cdot 5\\cdots(4n-3)]^2}$로 두면\n$\\dfrac{a_{n+1}}{a_n}=\\dfrac{(n+1)^{n+1}(n+1)}{n^n}\\cdot\\dfrac{1}{(4n+1)^2}=(n+1)\\!\\left(\\dfrac{n+1}{n}\\right)^n\\cdot\\dfrac{n+1}{(4n+1)^2}\\to e\\cdot\\dfrac{1}{16}$.\n$\\displaystyle\\lim\\!\\left|\\dfrac{a_{n+1}x^{2n+1}}{a_n x^{2n-1}}\\right|=\\dfrac{e}{16}x^2<1\\Rightarrow x^2<\\dfrac{16}{e}\\approx 5.886$, 즉 $|x|<\\sqrt{16/e}\\approx 2.426$.\n자연수 $x$는 $1,2$ 두 개.",
  },
  {
    n:3, subject:"미분학", unit:"도함수의 응용", concept:"곡률",
    difficulty:"easy",
    question:"곡선 $y=\\cosh x$ 위의 점 $(a,\\cosh a)$에서의 곡률이 $\\dfrac{1}{4}$일 때, $|a|$의 값은?",
    options:opts5("$\\ln(1+\\sqrt 3)$","$\\ln(2-\\sqrt 3)$","$\\ln(2+\\sqrt 3)$","$\\ln(3-\\sqrt 3)$","$\\ln(3+\\sqrt 3)$"),
    correct:"3",
    explanation:"$y'=\\sinh x,\\,y''=\\cosh x$. 곡률 $\\kappa=\\dfrac{|y''|}{(1+y'^2)^{3/2}}=\\dfrac{\\cosh x}{(1+\\sinh^2 x)^{3/2}}=\\dfrac{\\cosh x}{\\cosh^3 x}=\\dfrac{1}{\\cosh^2 x}$.\n$\\dfrac{1}{\\cosh^2 a}=\\dfrac{1}{4}\\Rightarrow\\cosh a=2$. $|a|=\\cosh^{-1}2=\\ln(2+\\sqrt{4-1})=\\ln(2+\\sqrt 3)$.",
  },
  {
    n:4, subject:"다변수함수", unit:"선적분과 면적분", concept:"그린정리",
    difficulty:"easyMedium",
    question:"원 $x^2+y^2=4$를 시계반대방향으로 한 바퀴 도는 곡선을 $C$라 할 때, $\\displaystyle\\oint_C(x-y^3)\\,dx+x^3\\,dy$의 값은?",
    options:opts5("$12\\pi$","$15\\pi$","$18\\pi$","$21\\pi$","$24\\pi$"),
    correct:"5",
    explanation:"그린정리: $P=x-y^3,\\,Q=x^3$. $Q_x-P_y=3x^2-(-3y^2)=3(x^2+y^2)$.\n$\\displaystyle\\iint_D 3(x^2+y^2)\\,dA=3\\!\\int_0^{2\\pi}\\!\\int_0^2 r^2\\cdot r\\,dr\\,d\\theta=3\\cdot 2\\pi\\cdot\\dfrac{2^4}{4}=3\\cdot 2\\pi\\cdot 4=24\\pi$.",
  },
  {
    n:5, subject:"적분학", unit:"정적분의 응용", concept:"회전체의 부피",
    difficulty:"medium",
    question:"두 점 $(1,0,0),\\,(1,1,1)$을 양 끝점으로 하는 선분을 $z$축을 중심으로 회전시켜 얻은 곡면을 $S$라 하자. 곡면 $S$와 두 평면 $z=0,\\,z=1$로 둘러싸인 입체의 부피는?",
    options:opts5("$\\dfrac{\\pi}{3}$","$\\dfrac{2}{3}\\pi$","$\\pi$","$\\dfrac{4}{3}\\pi$","$\\dfrac{5}{3}\\pi$"),
    correct:"4",
    explanation:"선분 매개변수: $(1,t,t),\\,t\\in[0,1]$. 점 $(1,t,t)$에서 $z$축까지의 거리 $=\\sqrt{1^2+t^2}=\\sqrt{1+t^2}$.\n각 $z=t$ 단면은 반지름 $\\sqrt{1+t^2}$인 원판. 부피 $V=\\displaystyle\\int_0^1\\pi(1+t^2)\\,dt=\\pi\\!\\left[t+\\dfrac{t^3}{3}\\right]_0^1=\\pi\\cdot\\dfrac{4}{3}=\\dfrac{4\\pi}{3}$.",
  },
  {
    n:6, subject:"다변수함수", unit:"경도 및 방향도함수", concept:"방향도함수 (정의)",
    difficulty:"medium",
    question:"함수 $f(x,y)$를 $f(x,y)=\\begin{cases}\\dfrac{2x^2\\sin y}{x^2+y^2}&(x,y)\\neq(0,0)\\\\ 0&(x,y)=(0,0)\\end{cases}$이라 하자. 점 $(0,0)$에서 벡터 $(1,1)$ 방향에 대한 $f(x,y)$의 방향도함수의 값은?",
    options:opts5("$-\\sqrt 2$","$-\\dfrac{1}{\\sqrt 2}$","$0$","$\\dfrac{1}{\\sqrt 2}$","$\\sqrt 2$"),
    correct:"4",
    explanation:"단위벡터 $\\mathbf u=(1,1)/\\sqrt 2$. 정의에 의해\n$D_{\\mathbf u}f(0,0)=\\displaystyle\\lim_{h\\to 0}\\dfrac{f(h/\\sqrt 2,\\,h/\\sqrt 2)-f(0,0)}{h}$.\n$f(t,t)=\\dfrac{2t^2\\sin t}{2t^2}=\\sin t$. 따라서 $f(h/\\sqrt 2,h/\\sqrt 2)=\\sin(h/\\sqrt 2)$.\n$\\displaystyle\\lim_{h\\to 0}\\dfrac{\\sin(h/\\sqrt 2)}{h}=\\dfrac{1}{\\sqrt 2}$.",
  },
  {
    n:7, subject:"적분학", unit:"정적분의 응용", concept:"사이클로이드",
    difficulty:"medium",
    question:"원 $x^2+(y-1)^2=1$을 $x$축을 따라 한 바퀴 굴릴 때, 원 위의 점 $P(0,0)$이 그리는 곡선을 $C$라 하자. 곡선 $C$의 길이를 $L$, 곡선 $C$와 $x$축으로 둘러싸인 부분의 넓이를 $A$라 할 때, $\\dfrac{A}{L}$의 값은?",
    options:opts5("$\\dfrac{\\pi}{8}$","$\\dfrac{\\pi}{4}$","$\\dfrac{3\\pi}{8}$","$\\dfrac{\\pi}{2}$","$\\dfrac{5\\pi}{8}$"),
    correct:"3",
    explanation:"사이클로이드 매개변수: $x=\\theta-\\sin\\theta,\\,y=1-\\cos\\theta,\\,\\theta:0\\to 2\\pi$.\n$L=\\displaystyle\\int_0^{2\\pi}\\sqrt{(1-\\cos\\theta)^2+\\sin^2\\theta}\\,d\\theta=\\int_0^{2\\pi}\\sqrt{2-2\\cos\\theta}\\,d\\theta=\\int_0^{2\\pi}2\\sin(\\theta/2)\\,d\\theta=8$.\n$A=\\displaystyle\\int_0^{2\\pi}y\\,dx=\\int_0^{2\\pi}(1-\\cos\\theta)^2\\,d\\theta=\\int_0^{2\\pi}\\!\\left(\\dfrac{3}{2}-2\\cos\\theta+\\dfrac{\\cos 2\\theta}{2}\\right)d\\theta=3\\pi$.\n$\\dfrac{A}{L}=\\dfrac{3\\pi}{8}$.",
  },
  {
    n:8, subject:"적분학", unit:"특이적분", concept:"수렴/발산 판정",
    difficulty:"medium",
    question:"<보기>에서 수렴하는 특이적분(improper integral)을 있는 대로 모두 고른 것은?\nㄱ. $\\displaystyle\\int_0^{\\pi/2}\\dfrac{\\sqrt x}{\\sin x}\\,dx$\nㄴ. $\\displaystyle\\int_0^{\\pi}\\dfrac{x}{1-\\cos x}\\,dx$\nㄷ. $\\displaystyle\\int_{-\\infty}^{\\infty}\\dfrac{x}{(x^2+2)\\ln(x^2+2)}\\,dx$",
    options:opts5("ㄱ","ㄴ","ㄱ, ㄴ","ㄱ, ㄷ","ㄴ, ㄷ"),
    correct:"1",
    explanation:"ㄱ: $x\\to 0$에서 $\\sin x\\sim x$이므로 $\\dfrac{\\sqrt x}{\\sin x}\\sim x^{-1/2}$. $\\int_0 x^{-1/2}dx$는 수렴($p=1/2<1$). 위 끝 $\\pi/2$는 정상값. 수렴.\nㄴ: $x\\to 0$에서 $1-\\cos x\\sim x^2/2$이므로 $\\dfrac{x}{1-\\cos x}\\sim\\dfrac{2}{x}$. $\\int_0\\dfrac{1}{x}dx$ 발산. 발산.\nㄷ: $x\\to\\infty$에서 $\\dfrac{|x|}{(x^2+2)\\ln(x^2+2)}\\sim\\dfrac{1}{2x\\ln x}$. $\\int\\dfrac{dx}{x\\ln x}=\\ln\\ln x$로 발산. 절대수렴 안 함.\n수렴은 ㄱ만.",
  },
  {
    n:9, subject:"적분학", unit:"정적분과 무한급수", concept:"리만합",
    difficulty:"mediumHard",
    question:"$\\displaystyle\\lim_{n\\to\\infty}\\!\\left\\{\\!\\left(\\sum_{k=1}^{n}\\sqrt{1+\\cos\\dfrac{\\pi k}{2n}}\\right)\\sqrt{1-\\cos\\dfrac{\\pi}{2n}}\\right\\}$의 값은?",
    options:opts5("$1$","$\\sqrt 2$","$2$","$2\\sqrt 2$","$4$"),
    correct:"2",
    explanation:"항등식 $\\sqrt{1+\\cos\\theta}=\\sqrt 2\\cos(\\theta/2),\\,\\sqrt{1-\\cos\\theta}=\\sqrt 2\\sin(\\theta/2)$ ($0\\le\\theta\\le\\pi$).\n식 $=\\!\\left(\\sqrt 2\\sum_{k=1}^n\\cos\\dfrac{\\pi k}{4n}\\right)\\!\\sqrt 2\\sin\\dfrac{\\pi}{4n}=2\\sin\\dfrac{\\pi}{4n}\\sum_{k=1}^n\\cos\\dfrac{\\pi k}{4n}$.\n$=2\\cdot\\dfrac{\\pi}{4n}\\cdot\\dfrac{\\sin(\\pi/(4n))}{\\pi/(4n)}\\cdot n\\cdot\\dfrac{1}{n}\\sum_{k=1}^n\\cos\\dfrac{\\pi k}{4n}\\to 2\\cdot\\dfrac{\\pi}{4}\\cdot 1\\cdot\\!\\int_0^1\\cos\\dfrac{\\pi x}{4}dx=\\dfrac{\\pi}{2}\\cdot\\dfrac{4}{\\pi}\\sin\\dfrac{\\pi}{4}=2\\cdot\\dfrac{\\sqrt 2}{2}=\\sqrt 2$.",
  },
  {
    n:10, subject:"선형대수", unit:"행렬", concept:"연립방정식",
    difficulty:"easy",
    question:"연립방정식 $\\begin{cases}x+2y+z=4\\\\ 2x-y+z=9\\\\ -x+y+2z=5\\end{cases}$의 해가 $x=a,\\,y=b,\\,z=c$일 때, $a^2+b^2+c^2$의 값은?",
    options:opts5("$21$","$24$","$27$","$30$","$33$"),
    correct:"1",
    explanation:"R2$-2$R1: $(0,-5,-1)|1$. R3$+$R1: $(0,3,3)|9$.\nR3$+\\dfrac{3}{5}$R2: $(0,0,3-\\dfrac{3}{5})=(0,0,\\dfrac{12}{5})|9+\\dfrac{3}{5}=\\dfrac{48}{5}$. $c=\\dfrac{48/5}{12/5}=4$.\n$-5b-4=1\\Rightarrow b=-1$. $a+2(-1)+4=4\\Rightarrow a=2$.\n$a^2+b^2+c^2=4+1+16=21$.",
  },
  {
    n:11, subject:"선형대수", unit:"선형사상", concept:"치역(상공간)",
    difficulty:"medium",
    question:"선형사상 $T(x,y,z)=\\begin{pmatrix}1&2&2\\\\0&3&6\\\\1&1&0\\end{pmatrix}\\!\\begin{pmatrix}x\\\\y\\\\z\\end{pmatrix}$에 대하여 $\\mathrm{Im}\\,T=\\!\\left\\{(x,y,z)\\,\\middle|\\,ax+by+3z=0\\right\\}$일 때, $a^2+b^2$의 값은? (단, $a,b$는 상수이고 $\\mathrm{Im}\\,T$는 $T$의 치역이다.)",
    options:opts5("$5$","$8$","$10$","$13$","$17$"),
    correct:"3",
    explanation:"$\\mathrm{Im}\\,T$는 행렬의 열공간. 열들 $\\mathbf c_1=(1,0,1),\\,\\mathbf c_2=(2,3,1),\\,\\mathbf c_3=(2,6,0)$. $\\mathbf c_3=2\\mathbf c_2-2\\mathbf c_1$이므로 종속.\n$\\mathrm{Im}\\,T=\\mathrm{span}(\\mathbf c_1,\\mathbf c_2)$, 법선벡터 $\\mathbf n=\\mathbf c_1\\times\\mathbf c_2=(0\\cdot 1-1\\cdot 3,\\,1\\cdot 2-1\\cdot 1,\\,1\\cdot 3-0\\cdot 2)=(-3,1,3)$.\n평면 $-3x+y+3z=0$. 주어진 형태 $ax+by+3z=0$과 비교: $a=-3,\\,b=1$.\n$a^2+b^2=9+1=10$.",
  },
  {
    n:12, subject:"선형대수", unit:"선형사상", concept:"미분 연산자의 행렬표현",
    difficulty:"easyMedium",
    question:"차수가 $2$보다 작거나 같은 다항식들의 벡터공간 $P_2$에 대하여 $P_2$에서 $P_2$로의 선형사상 $T$를 $T(f)=f'+f''$이라 하자. $P_2$의 기저 $B=\\{1,\\,x,\\,x^2\\}$에 대한 $T$의 행렬표현을 $A$라 할 때, $A$의 모든 성분들의 합은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"),
    correct:"5",
    explanation:"$T(1)=0+0=0$, $T(x)=1+0=1$, $T(x^2)=2x+2$.\n행렬 표현 (각 열은 기저 원소의 상): $A=\\begin{pmatrix}0&1&2\\\\0&0&2\\\\0&0&0\\end{pmatrix}$.\n성분 합 $=0+1+2+0+0+2+0+0+0=5$.",
  },
  {
    n:13, subject:"선형대수", unit:"고유치와 대각화", concept:"최소다항식",
    difficulty:"mediumHard",
    question:"행렬 $\\begin{pmatrix}1&0&1&1\\\\0&1&0&0\\\\0&0&1&0\\\\0&0&0&2\\end{pmatrix}$의 최소다항식(minimal polynomial)은?",
    options:opts5("$x^2-3x+2$","$x^3-4x^2+5x-2$","$x^3-5x^2+8x-4$","$x^4-5x^3+9x^2-7x+2$","$x^4-6x^3+13x^2-12x+4$"),
    correct:"2",
    explanation:"상삼각이라 고윳값은 대각: $1,1,1,2$. $\\lambda=1$의 대수적 중복도 3, $\\lambda=2$의 중복도 1.\n$A-I=\\begin{pmatrix}0&0&1&1\\\\0&0&0&0\\\\0&0&0&0\\\\0&0&0&1\\end{pmatrix}$. rank$=2$이므로 nullity$=4-2=2$ (기하적 중복도 $2$).\n조던 블록 구조: $\\lambda=1$에 블록 $\\{2,1\\}$. 최소다항식의 $(\\lambda-1)$ 차수 $=$ 가장 큰 블록 크기 $=2$.\n$m(\\lambda)=(\\lambda-1)^2(\\lambda-2)=\\lambda^3-4\\lambda^2+5\\lambda-2$.",
  },
  {
    n:14, subject:"선형대수", unit:"벡터공간", concept:"정사영 행렬",
    difficulty:"medium",
    question:"두 벡터 $\\begin{pmatrix}1\\\\1\\\\1\\\\1\\end{pmatrix},\\,\\begin{pmatrix}1\\\\-1\\\\-1\\\\1\\end{pmatrix}$이 생성하는 $\\mathbb R^4$의 부분공간을 $W$라 하고, $\\mathbb R^4$에서 $W$로 가는 정사영(orthogonal projection)을 $P$라 하자. $\\mathbb R^4$의 표준기저에 대한 $P$의 행렬표현을 $M$이라 할 때, $M$의 모든 성분들의 합은?",
    options:opts5("$4$","$5$","$6$","$7$","$8$"),
    correct:"1",
    explanation:"$\\mathbf u_1=(1,1,1,1),\\,\\mathbf u_2=(1,-1,-1,1)$. $\\mathbf u_1\\cdot\\mathbf u_2=1-1-1+1=0$ (직교). $|\\mathbf u_1|^2=|\\mathbf u_2|^2=4$.\n$M=\\dfrac{\\mathbf u_1\\mathbf u_1^T}{4}+\\dfrac{\\mathbf u_2\\mathbf u_2^T}{4}=\\dfrac{1}{2}\\begin{pmatrix}1&0&0&1\\\\0&1&1&0\\\\0&1&1&0\\\\1&0&0&1\\end{pmatrix}$.\n성분 합 $=\\dfrac{1}{2}\\cdot 8=4$.",
  },
  {
    n:15, subject:"선형대수", unit:"고유치와 대각화", concept:"rank 1 행렬의 고윳값",
    difficulty:"easyMedium",
    question:"행렬 $\\begin{pmatrix}1&2&3&4&5\\\\2&4&6&8&10\\\\3&6&9&12&15\\\\4&8&12&16&20\\\\5&10&15&20&25\\end{pmatrix}$의 서로 다른 고윳값의 개수를 $a$라 하고 서로 다른 고윳값의 합을 $b$라 할 때, $a+b$의 값은?",
    options:opts5("$49$","$51$","$53$","$55$","$57$"),
    correct:"5",
    explanation:"행렬은 $\\mathbf v=(1,2,3,4,5)^T$와 $\\mathbf v^T$의 외적 $\\mathbf v\\mathbf v^T$. rank $=1$.\n$\\mathbf v\\mathbf v^T$의 고윳값은 $|\\mathbf v|^2=1+4+9+16+25=55$ (1중)와 $0$ (4중).\n서로 다른 고윳값: $55,\\,0$. $a=2,\\,b=55+0=55$. $a+b=57$.",
  },
  {
    n:16, subject:"공학수학", unit:"Laplace변환", concept:"기본 공식",
    difficulty:"easy",
    question:"함수 $f(t)=1-e^{-t}+e^{-2t}$의 라플라스변환(Laplace transform)을 $G(s)$라 할 때, $G(4)$의 값은?",
    options:opts5("$\\dfrac{3}{20}$","$\\dfrac{1}{6}$","$\\dfrac{11}{60}$","$\\dfrac{1}{5}$","$\\dfrac{13}{60}$"),
    correct:"5",
    explanation:"$\\mathcal L\\{1\\}=\\dfrac{1}{s},\\,\\mathcal L\\{e^{-t}\\}=\\dfrac{1}{s+1},\\,\\mathcal L\\{e^{-2t}\\}=\\dfrac{1}{s+2}$.\n$G(s)=\\dfrac{1}{s}-\\dfrac{1}{s+1}+\\dfrac{1}{s+2}$. $G(4)=\\dfrac{1}{4}-\\dfrac{1}{5}+\\dfrac{1}{6}=\\dfrac{30-24+20}{120}=\\dfrac{26}{120}=\\dfrac{13}{60}$.",
  },
  {
    n:17, subject:"공학수학", unit:"미분방정식", concept:"연립 미분방정식",
    difficulty:"medium",
    question:"연립미분방정식 $\\begin{pmatrix}x'(t)\\\\y'(t)\\end{pmatrix}=\\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix}\\!\\begin{pmatrix}x(t)\\\\y(t)\\end{pmatrix}+\\begin{pmatrix}3\\\\0\\end{pmatrix}$의 해 $\\begin{pmatrix}x(t)\\\\y(t)\\end{pmatrix}$가 초기조건 $\\begin{pmatrix}x(0)\\\\y(0)\\end{pmatrix}=\\begin{pmatrix}3\\\\-4\\end{pmatrix}$를 만족할 때, $-x(\\pi)+3y(\\pi)$의 값은?",
    options:opts5("$11$","$22$","$33$","$44$","$55$"),
    correct:"3",
    explanation:"방정식: $x'=-y+3,\\,y'=x$. 특수해 $(x_p,y_p)=(0,3)$ ($x'=0=-3+3,\\,y'=0=0$).\n동차해는 회전: $x_h=A\\cos t+B\\sin t,\\,y_h=A\\sin t-B\\cos t$. 일반해 $x=A\\cos t+B\\sin t,\\,y=A\\sin t-B\\cos t+3$.\n$x(0)=A=3$. $y(0)=-B+3=-4\\Rightarrow B=7$.\n$x(t)=3\\cos t+7\\sin t,\\,y(t)=3\\sin t-7\\cos t+3$.\n$x(\\pi)=-3,\\,y(\\pi)=0+7+3=10$. $-x(\\pi)+3y(\\pi)=3+30=33$.",
  },
  {
    n:18, subject:"공학수학", unit:"미분방정식", concept:"비제차 ODE 점근",
    difficulty:"mediumHard",
    question:"미분방정식 $y''-y=e^x\\cos x$의 해 $y=y(x)$가 조건 $y(0)=y'(0)=2020$을 만족할 때, $\\displaystyle\\lim_{x\\to-\\infty}e^{x}y(x)$의 값은?",
    options:opts5("$-\\dfrac{1}{3}$","$-\\dfrac{1}{5}$","$0$","$\\dfrac{1}{5}$","$\\dfrac{1}{3}$"),
    correct:"4",
    explanation:"동차해 $y_h=c_1 e^x+c_2 e^{-x}$. 특수해 $y_p=e^x(A\\cos x+B\\sin x)$ 시도하면 $2B-A=1,\\,2A+B=0$, 풀면 $A=-1/5,\\,B=2/5$.\n$y(x)=c_1 e^x+c_2 e^{-x}+\\dfrac{e^x}{5}(-\\cos x+2\\sin x)$.\n$y(0)=c_1+c_2-1/5=2020$. $y'(0)=c_1-c_2+1/5=2020$. (직접 미분 후 $x=0$ 대입.)\n두 식을 빼면 $2c_2=2/5\\cdot(-1)+\\cdots$ 정리하면 $c_2=\\dfrac{1}{5}$.\n$x\\to-\\infty$: $e^x y(x)=c_1 e^{2x}+c_2+\\dfrac{e^{2x}}{5}(\\cdots)\\to c_2=\\dfrac{1}{5}$.",
  },
  {
    n:19, subject:"공학수학", unit:"미분방정식", concept:"방사성 붕괴",
    difficulty:"easy",
    question:"탄소 동위원수 $^{14}C$의 반감기는 약 $5730$년이다. 어떤 화석 안에 $^{14}C$가 원래 있었던 양의 $1\\%$만 남아 있을 때, 이 화석의 나이는? (단, $\\ln 2=0.693,\\,\\ln 100=4.605\\cdots$)",
    options:opts5("약 35000년","약 38000년","약 41000년","약 44000년","약 47000년"),
    correct:"2",
    explanation:"$N(t)=N_0 e^{-kt}$. 반감기 조건 $\\dfrac{1}{2}=e^{-k\\cdot 5730}\\Rightarrow k=\\dfrac{\\ln 2}{5730}$.\n$\\dfrac{N(t)}{N_0}=0.01$이면 $kt=\\ln 100=4.605$.\n$t=\\dfrac{4.605}{\\ln 2/5730}=\\dfrac{4.605\\cdot 5730}{0.693}\\approx 6.645\\cdot 5730\\approx 38076$년 ≈ $38000$년.",
  },
  {
    n:20, subject:"공학수학", unit:"미분방정식", concept:"완전 미분방정식",
    difficulty:"medium",
    question:"미분방정식 $y\\cosh(xy)\\,dx+\\{x\\cosh(xy)+e^y\\}\\,dy=0$의 해 $y=y(x)$가 초기조건 $y(0)=\\ln 2$를 만족할 때, $y(1)$의 값은?",
    options:opts5("$\\ln\\dfrac{1+\\sqrt 7}{5}$","$\\ln\\dfrac{1+\\sqrt 7}{3}$","$\\ln\\dfrac{2+\\sqrt 7}{5}$","$\\ln\\dfrac{2+\\sqrt 7}{3}$","$\\ln\\dfrac{3+\\sqrt 7}{5}$"),
    correct:"4",
    explanation:"완전성 검사: $\\partial_y[y\\cosh(xy)]=\\cosh(xy)+xy\\sinh(xy)=\\partial_x[x\\cosh(xy)+e^y]$. 완전.\n$F(x,y)$ 찾기: $F_x=y\\cosh(xy)$이므로 $F=\\sinh(xy)+g(y)$. $F_y=x\\cosh(xy)+g'(y)=x\\cosh(xy)+e^y$이므로 $g(y)=e^y$.\n$F=\\sinh(xy)+e^y=C$. $y(0)=\\ln 2$ 대입: $0+e^{\\ln 2}=2=C$.\n$y(1)$: $\\sinh y+e^y=2$, 즉 $\\dfrac{e^y-e^{-y}}{2}+e^y=2$, $3e^y-e^{-y}=4$. $u=e^y$로 두면 $3u^2-4u-1=0$이므로 $u=\\dfrac{2+\\sqrt 7}{3}$ (양수).\n$y(1)=\\ln\\dfrac{2+\\sqrt 7}{3}$.",
  },
  {
    n:21, subject:"공학수학", unit:"미분방정식", concept:"차수 감소법",
    difficulty:"hard",
    question:"미분방정식 $(x^2+1)y''-xy'+y=0$의 해 $y=y(x)$가 초기조건 $y(0)=1,\\,y'(0)=0$을 만족할 때, $y(1)$의 값은?",
    options:opts5("$\\sqrt 2-\\ln(1+\\sqrt 2)$","$2\\sqrt 2-\\ln(1+\\sqrt 2)$","$3\\sqrt 2-\\ln(1+\\sqrt 2)$","$4\\sqrt 2-\\ln(1+\\sqrt 2)$","$5\\sqrt 2-\\ln(1+\\sqrt 2)$"),
    correct:"1",
    explanation:"$y_1=x$가 명백한 해 (대입 확인: $0-x+x=0$). 차수 감소법으로 $y_2=x v(x)$ 시도하면 $w=v'$에 대해 $\\dfrac{w'}{w}=-\\dfrac{2}{x}+\\dfrac{x}{x^2+1}$.\n적분: $w=\\dfrac{\\sqrt{x^2+1}}{x^2}$. $v=\\!\\int w\\,dx=-\\dfrac{\\sqrt{x^2+1}}{x}+\\ln(x+\\sqrt{x^2+1})+C$.\n$y_2=xv=-\\sqrt{x^2+1}+x\\ln(x+\\sqrt{x^2+1})$.\n일반해 $y=c_1 x+c_2[-\\sqrt{x^2+1}+x\\ln(x+\\sqrt{x^2+1})]$.\n$y(0)=c_2(-1)=1\\Rightarrow c_2=-1$. $y_2'(x)=\\ln(x+\\sqrt{x^2+1})$이므로 $y_2'(0)=0$. $y'(0)=c_1=0$.\n$y(x)=\\sqrt{x^2+1}-x\\ln(x+\\sqrt{x^2+1})$. $y(1)=\\sqrt 2-\\ln(1+\\sqrt 2)$.",
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
