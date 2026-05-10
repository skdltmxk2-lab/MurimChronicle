// 2017년 성균관대 편입수학 객관식 20문항 (원 26~45번을 1~20으로 매핑, 5지선다)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2017", SCHOOL_KO="성균관대", SCHOOL_EN="skku";
const opts5 = (...t) => t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));

const PROBLEMS = [
  {
    n:1, subject:"선형대수", unit:"벡터와 공간도형", concept:"평면의 방정식",
    difficulty:"easy",
    question:"좌표공간 안의 세 점 $(1,1,0),\\,(1,0,1),\\,(0,1,1)$을 지나는 평면 위에 있는 점은?",
    options:opts5("$(0,0,1)$","$(2,1,0)$","$(2,1,-1)$","$(-1,1,-1)$","$(1,0,-1)$"),
    correct:"3",
    explanation:"두 벡터 $\\vec{u}=(1,0,1)-(1,1,0)=(0,-1,1)$, $\\vec{v}=(0,1,1)-(1,1,0)=(-1,0,1)$. 법벡터 $\\vec{n}=\\vec{u}\\times\\vec{v}=(-1,-1,-1)$.\n평면 방정식: $-(x-1)-(y-1)-z=0$, 즉 $x+y+z=2$.\n각 보기 검증: $(2,1,-1)\\Rightarrow 2+1-1=2$ ✓.",
  },
  {
    n:2, subject:"다변수함수", unit:"곡선과 곡면", concept:"공간곡선 곡률",
    difficulty:"easyMedium",
    question:"곡선 $r(t)=\\langle\\sin t,\\,\\cos t,\\,2t\\rangle$ 위의 점 $(0,1,0)$에서의 곡률의 값은?",
    options:opts5("$1$","$\\dfrac{1}{2}$","$\\dfrac{1}{3}$","$\\dfrac{1}{4}$","$\\dfrac{1}{5}$"),
    correct:"5",
    explanation:"점 $(0,1,0)$은 $t=0$. $r'(t)=(\\cos t,-\\sin t,2)$, $r'(0)=(1,0,2)$, $|r'(0)|=\\sqrt 5$.\n$r''(t)=(-\\sin t,-\\cos t,0)$, $r''(0)=(0,-1,0)$.\n$r'(0)\\times r''(0)=(0\\cdot 0-2\\cdot(-1),\\,2\\cdot 0-1\\cdot 0,\\,1\\cdot(-1)-0\\cdot 0)=(2,0,-1)$, 크기 $\\sqrt 5$.\n$\\kappa=\\dfrac{|r'\\times r''|}{|r'|^3}=\\dfrac{\\sqrt 5}{(\\sqrt 5)^3}=\\dfrac{1}{5}$.",
  },
  {
    n:3, subject:"적분학", unit:"Maclaurin급수의 응용", concept:"고계도함수(라이프니츠)",
    difficulty:"medium",
    question:"함수 $f(x)=x(x+1)e^{-x}$에 대하여 $f^{(7)}(0)+f^{(8)}(0)$의 값은?",
    options:opts5("$10$","$11$","$12$","$13$","$14$"),
    correct:"4",
    explanation:"$g(x)=x(x+1)=x^2+x$. $g(0)=0,\\,g'(0)=1,\\,g''(0)=2$, 그 이상 $0$.\n라이프니츠 공식 $f^{(n)}(0)=\\sum_{k=0}^n\\binom{n}{k}g^{(k)}(0)\\cdot[(-1)^{n-k}]$:\n$f^{(n)}(0)=n\\cdot 1\\cdot(-1)^{n-1}+\\binom{n}{2}\\cdot 2\\cdot(-1)^{n-2}=(-1)^n[-n+n(n-1)]=(-1)^n n(n-2)$.\n$f^{(7)}(0)=-7\\cdot 5=-35$, $f^{(8)}(0)=8\\cdot 6=48$. 합 $=13$.",
  },
  {
    n:4, subject:"선형대수", unit:"행렬", concept:"행렬 성질 진위",
    difficulty:"medium",
    question:"실수 성분을 갖는 $n\\times n$행렬 $A$에 대하여 다음 중 옳지 않은 것은?\n(1) $A$는 두 개의 가역행렬의 합으로 쓰일 수 있다.\n(2) $A$가 대각화 가능하면 $A$와 닮은(similar) 대각행렬은 유일하다.\n(3) $A$와 닮은 모든 행렬은 고윳값이 같다.\n(4) 모든 $v\\in\\mathbb R^n$에 대하여 $\\|Av\\|=\\|v\\|$이면 행렬방정식 $Ax=b$는 모든 $b\\in\\mathbb R^n$에 대하여 유일한 해를 갖는다.\n(5) $A$가 대칭이라면 $A$의 모든 고윳값은 실수이다.",
    options:opts5("(1)","(2)","(3)","(4)","(5)"),
    correct:"2",
    explanation:"(2) 거짓: 대각행렬은 고윳값의 순서를 바꾸면 다른 대각행렬이 되므로 유일하지 않다 (예: $\\mathrm{diag}(1,2)$와 $\\mathrm{diag}(2,1)$ 모두 닮음).\n나머지는 모두 참: (1) $A=(A+I)+(-I)$ 등으로 가능, (3) 닮은 행렬의 고윳값 보존, (4) 등거리 변환은 직교행렬이므로 가역, (5) 대칭행렬 스펙트럼 정리.",
  },
  {
    n:5, subject:"공학수학", unit:"미분방정식", concept:"1계 선형 ODE",
    difficulty:"easy",
    question:"미분방정식 $y'-\\dfrac{1}{x}y=x^2$의 해 $y(x)$가 $y(2)=0$을 만족할 때 $y(1)$의 값은?",
    options:opts5("$1$","$\\dfrac{1}{2}$","$-\\dfrac{1}{2}$","$\\dfrac{3}{2}$","$-\\dfrac{3}{2}$"),
    correct:"5",
    explanation:"적분인자 $\\mu=e^{-\\int dx/x}=\\dfrac{1}{x}$. $(y/x)'=x$. 적분: $\\dfrac{y}{x}=\\dfrac{x^2}{2}+C$.\n$y(2)=0$이면 $0=2+C$, $C=-2$. $y(x)=x\\!\\left(\\dfrac{x^2}{2}-2\\right)$.\n$y(1)=1\\!\\left(\\dfrac{1}{2}-2\\right)=-\\dfrac{3}{2}$.",
  },
  {
    n:6, subject:"다변수함수", unit:"중적분", concept:"극좌표 변환",
    difficulty:"medium",
    question:"$\\displaystyle\\int_0^{\\sqrt 2}\\!\\!\\int_y^{\\sqrt{4-y^2}}x^2\\,dx\\,dy$의 값은?",
    options:opts5("$\\dfrac{\\pi}{2}$","$\\dfrac{\\pi+1}{2}$","$\\dfrac{\\pi+2}{2}$","$\\dfrac{\\pi+3}{2}$","$\\dfrac{\\pi+4}{2}$"),
    correct:"3",
    explanation:"영역 $\\{0\\le y\\le\\sqrt 2,\\,y\\le x\\le\\sqrt{4-y^2}\\}$는 $x^2+y^2\\le 4,\\,x\\ge y,\\,y\\ge 0$. 극좌표로 $0\\le\\theta\\le\\pi/4,\\,0\\le r\\le 2$.\n$\\displaystyle\\int_0^{\\pi/4}\\!\\!\\int_0^2 r^2\\cos^2\\theta\\cdot r\\,dr\\,d\\theta=\\!\\left[\\dfrac{\\theta}{2}+\\dfrac{\\sin 2\\theta}{4}\\right]_0^{\\pi/4}\\cdot 4=\\!\\left(\\dfrac{\\pi}{8}+\\dfrac{1}{4}\\right)\\cdot 4=\\dfrac{\\pi}{2}+1=\\dfrac{\\pi+2}{2}$.",
  },
  {
    n:7, subject:"다변수함수", unit:"곡선과 곡면", concept:"평면 삼각형 면적",
    difficulty:"easy",
    question:"평면 $x+2y+4z=8$에서 부등식 $x\\ge 0,\\,y\\ge 0,\\,z\\ge 0$을 모두 만족하는 부분의 넓이의 값은?",
    options:opts5("$\\sqrt{21}$","$2\\sqrt{21}$","$3\\sqrt{21}$","$4\\sqrt{21}$","$5\\sqrt{21}$"),
    correct:"4",
    explanation:"절편 세 점 $(8,0,0),\\,(0,4,0),\\,(0,0,2)$. 두 변 $\\vec u=(-8,4,0),\\,\\vec v=(-8,0,2)$.\n$\\vec u\\times\\vec v=(4\\cdot 2-0,\\,0\\cdot(-8)-(-8)\\cdot 2,\\,(-8)\\cdot 0-4\\cdot(-8))=(8,16,32)$, 크기 $\\sqrt{64+256+1024}=\\sqrt{1344}=8\\sqrt{21}$.\n삼각형 면적 $=\\dfrac{1}{2}\\cdot 8\\sqrt{21}=4\\sqrt{21}$.",
  },
  {
    n:8, subject:"선형대수", unit:"행렬", concept:"수반행렬 행렬식",
    difficulty:"mediumHard",
    question:"행렬 $A=\\begin{pmatrix}1&2&3&2\\\\1&3&2&3\\\\4&1&5&0\\\\1&2&1&2\\end{pmatrix}$에 대하여 $\\det(\\mathrm{adj}(A))$의 값은?",
    options:opts5("$0$","$-2$","$4$","$-8$","$16$"),
    correct:"4",
    explanation:"공식 $\\det(\\mathrm{adj}(A))=(\\det A)^{n-1}$, $n=4$이므로 $(\\det A)^3$.\n$A$의 행렬식을 행 연산으로 계산: R2$-$R1, R3$-4$R1, R4$-$R1로 1열 정리 후 전개하면 $\\det A=-2$.\n$\\det(\\mathrm{adj}(A))=(-2)^3=-8$.",
  },
  {
    n:9, subject:"미분학", unit:"도함수의 응용", concept:"타원 위 거리 최대",
    difficulty:"medium",
    question:"$a>1$이라 하자. $xy$-평면 위의 타원 $x^2+\\dfrac{y^2}{a^2}=1$ 위의 점들 중 $(1,0)$과 가장 멀리 떨어진 점의 $x$좌표가 $-\\dfrac{1}{3}$일 때 $a$의 값은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"),
    correct:"2",
    explanation:"점 $(x,y)$의 거리 제곱 $d^2=(x-1)^2+y^2=(x-1)^2+a^2(1-x^2)$.\n$\\dfrac{d(d^2)}{dx}=2(x-1)-2a^2 x=0\\Rightarrow x=\\dfrac{1}{1-a^2}$ (단, $a>1$이면 $1-a^2<0$).\n$x=-\\dfrac{1}{3}$이려면 $\\dfrac{1}{1-a^2}=-\\dfrac{1}{3}$, $1-a^2=-3$, $a^2=4$, $a=2$.",
  },
  {
    n:10, subject:"적분학", unit:"극좌표와 응용", concept:"극곡선 면적",
    difficulty:"hard",
    question:"부등식 $3-\\sin 3\\theta\\le r\\le 2+\\sin 3\\theta$를 만족하는 영역은 넓이가 같은 세 개의 부분으로 나뉜다. 이 전체 영역의 넓이의 값은?",
    options:opts5("$5\\sqrt 3-\\dfrac{5\\pi}{3}$","$4\\sqrt 3-\\dfrac{4\\pi}{3}$","$3\\sqrt 3-\\pi$","$2\\sqrt 3-\\dfrac{2\\pi}{3}$","$\\sqrt 3-\\dfrac{\\pi}{3}$"),
    correct:"1",
    explanation:"$3-\\sin 3\\theta\\le 2+\\sin 3\\theta$에서 $\\sin 3\\theta\\ge\\dfrac{1}{2}$, 즉 $3\\theta\\in[\\pi/6+2k\\pi,5\\pi/6+2k\\pi]$ ($k=0,1,2$). 세 부분.\n한 부분 면적 $A_1=\\dfrac{1}{2}\\!\\int_{\\pi/18}^{5\\pi/18}[(2+\\sin 3\\theta)^2-(3-\\sin 3\\theta)^2]d\\theta=\\dfrac{1}{2}\\!\\int 5(2\\sin 3\\theta-1)d\\theta=\\dfrac{5}{3}\\sqrt 3-\\dfrac{5\\pi}{9}$.\n전체 $=3A_1=5\\sqrt 3-\\dfrac{5\\pi}{3}$.",
  },
  {
    n:11, subject:"공학수학", unit:"Laplace변환", concept:"단계함수 변환",
    difficulty:"easy",
    question:"함수 $f(t)=\\begin{cases}0&(t<1)\\\\1&(1<t<2)\\\\0&(t>2)\\end{cases}$의 라플라스 변환 $\\mathcal L\\{f(t)\\}(s)$는?",
    options:opts5("$\\dfrac{1}{s}(e^{-s}-e^{-2s})$","$\\dfrac{1}{s}(e^{-s}+e^{-2s})$","$\\dfrac{2}{s}(e^{-s}-e^{-2s})$","$\\dfrac{2}{s}(e^{-s}+e^{-2s})$","$\\dfrac{-1}{s}(e^{-s}+e^{-2s})$"),
    correct:"1",
    explanation:"$\\mathcal L\\{f\\}=\\displaystyle\\int_1^2 e^{-st}dt=\\!\\left[-\\dfrac{e^{-st}}{s}\\right]_1^2=\\dfrac{e^{-s}-e^{-2s}}{s}$.",
  },
  {
    n:12, subject:"공학수학", unit:"Laplace변환", concept:"라플라스 활용 적분",
    difficulty:"medium",
    question:"$\\displaystyle\\int_0^{\\infty}t e^{-3t}\\cos t\\,dt$의 값은?",
    options:opts5("$\\dfrac{1}{25}$","$\\dfrac{2}{25}$","$\\dfrac{3}{25}$","$\\dfrac{4}{25}$","$\\dfrac{5}{25}$"),
    correct:"2",
    explanation:"$\\mathcal L\\{t\\cos t\\}(s)=-\\dfrac{d}{ds}\\!\\left[\\dfrac{s}{s^2+1}\\right]=\\dfrac{s^2-1}{(s^2+1)^2}$.\n주어진 적분 $=\\mathcal L\\{t\\cos t\\}(3)=\\dfrac{9-1}{(9+1)^2}=\\dfrac{8}{100}=\\dfrac{2}{25}$.",
  },
  {
    n:13, subject:"적분학", unit:"Maclaurin급수의 응용", concept:"$\\arctan$ 급수",
    difficulty:"mediumHard",
    question:"$\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-1)^{n-1}}{(2n-1)\\cdot 3^n}=\\dfrac{1}{1\\cdot 3^1}-\\dfrac{1}{3\\cdot 3^2}+\\dfrac{1}{5\\cdot 3^3}-\\cdots$의 합은?",
    options:opts5("$\\dfrac{\\sqrt 3\\,\\pi}{36}$","$\\dfrac{\\sqrt 3\\,\\pi}{30}$","$\\dfrac{\\sqrt 3\\,\\pi}{24}$","$\\dfrac{\\sqrt 3\\,\\pi}{18}$","$\\dfrac{\\sqrt 3\\,\\pi}{12}$"),
    correct:"4",
    explanation:"$\\arctan x=\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-1)^{n-1}x^{2n-1}}{2n-1}$. $x=\\dfrac{1}{\\sqrt 3}$이면 $\\arctan(1/\\sqrt 3)=\\dfrac{\\pi}{6}$.\n원 합 $=\\displaystyle\\sum\\dfrac{(-1)^{n-1}}{(2n-1)\\cdot 3^n}=\\dfrac{1}{\\sqrt 3}\\!\\sum\\dfrac{(-1)^{n-1}(1/\\sqrt 3)^{2n-1}}{2n-1}=\\dfrac{1}{\\sqrt 3}\\cdot\\dfrac{\\pi}{6}=\\dfrac{\\sqrt 3\\,\\pi}{18}$.",
  },
  {
    n:14, subject:"선형대수", unit:"행렬", concept:"역행렬 성분합",
    difficulty:"medium",
    question:"두 행렬 $A=\\begin{pmatrix}1&2&1\\\\0&1&0\\\\0&0&1\\end{pmatrix}$와 $B=\\begin{pmatrix}1&0&0\\\\-3&-1&0\\\\0&2&1\\end{pmatrix}$에 대하여 행렬 $(AB)^{-1}$의 모든 성분의 합은?",
    options:opts5("$-8$","$-6$","$-4$","$-2$","$0$"),
    correct:"2",
    explanation:"$AB=\\begin{pmatrix}-5&0&1\\\\-3&-1&0\\\\0&2&1\\end{pmatrix}$. $\\det(AB)=-5(-1-0)-0+1(-6-0)=5-6=-1$.\n$(AB)^{-1}=\\dfrac{1}{\\det}\\,\\mathrm{adj}(AB)$ 계산하면 모든 성분의 합 $=-6$. (성분합 공식: $\\mathbf 1^T(AB)^{-1}\\mathbf 1$로 직접 계산 가능.)",
  },
  {
    n:15, subject:"공학수학", unit:"미분방정식", concept:"4계 오일러-코시",
    difficulty:"hard",
    question:"$y=y(x)$가 다음 미분방정식과 초기조건을 만족할 때 $y(e)$의 값은?\n$x^4 y^{(4)}+4x^3 y'''+11x^2 y''-9xy'+9y=0$\n$y(1)=1,\\,y'(1)=3,\\,y''(1)=-12,\\,y'''(1)=6$",
    options:opts5("$\\cos(3)+\\sin(3)$","$\\cos(3)-\\sin(3)$","$\\cos(3)+\\sin(3)+e$","$\\cos(3)-\\sin(3)+2e$","$\\cos(3)+\\sin(3)-e$"),
    correct:"1",
    explanation:"$x=e^t$ 치환으로 $D=\\dfrac{d}{dt}$ 정의, 특성다항식 $\\lambda^4-2\\lambda^3+10\\lambda^2-18\\lambda+9=(\\lambda^2+9)(\\lambda-1)^2=0$. 근 $\\pm 3i,\\,1$ (중근).\n$y(x)=c_1\\cos(3\\ln x)+c_2\\sin(3\\ln x)+(c_3+c_4\\ln x)x$.\n초기조건으로 $c_1=c_2=1,\\,c_3+c_4=0$. $y(e)=\\cos 3+\\sin 3+(c_3+c_4)e=\\cos 3+\\sin 3$.",
  },
  {
    n:16, subject:"적분학", unit:"정적분의 응용", concept:"회전체 부피",
    difficulty:"medium",
    question:"매개변수 $-\\dfrac{\\pi}{2}\\le\\theta\\le\\dfrac{\\pi}{2}$에 대하여 곡선 $r=\\sqrt{x^2+y^2}=\\cos\\theta,\\,z=\\sin 2\\theta$이 주어져 있다. 이 곡선을 $z$축 둘레로 회전시켜 생기는 곡면을 $S$라고 할 때 $S$ 내부의 부피는?",
    options:opts5("$\\pi^2$","$\\dfrac{\\pi^2}{2}$","$\\dfrac{\\pi^2}{3}$","$\\dfrac{\\pi^2}{4}$","$\\dfrac{\\pi^2}{5}$"),
    correct:"2",
    explanation:"$V=\\displaystyle\\int\\pi r^2\\,dz=\\int_{-\\pi/2}^{\\pi/2}\\pi\\cos^2\\theta\\cdot 2\\cos 2\\theta\\,d\\theta=2\\pi\\!\\int\\cos^2\\theta\\cos 2\\theta\\,d\\theta$.\n$\\cos^2\\theta=\\dfrac{1+\\cos 2\\theta}{2}$. $V=\\pi\\!\\int(\\cos 2\\theta+\\cos^2 2\\theta)d\\theta=\\pi\\!\\left[0+\\dfrac{\\pi}{2}\\right]=\\dfrac{\\pi^2}{2}$.",
  },
  {
    n:17, subject:"다변수함수", unit:"선적분과 면적분", concept:"그린정리",
    difficulty:"easyMedium",
    question:"다음 선적분의 값은?\n$\\displaystyle\\int_C(e^x\\sin x-y)\\,dx+(x^2+\\sqrt{y^2+1})\\,dy$\n(여기서 $C:x^2+y^2=1$은 단위원이다.)",
    options:opts5("$\\dfrac{\\pi}{2}$","$\\pi$","$\\dfrac{3\\pi}{2}$","$2\\pi$","$\\dfrac{5\\pi}{2}$"),
    correct:"2",
    explanation:"그린정리: $Q_x-P_y=2x-(-1)=2x+1$.\n$\\displaystyle\\iint_D(2x+1)\\,dA=2\\!\\iint x\\,dA+\\iint dA=0+\\pi=\\pi$ (대칭성으로 $\\iint x dA=0$).",
  },
  {
    n:18, subject:"선형대수", unit:"벡터공간", concept:"내적공간 직교화",
    difficulty:"medium",
    question:"닫힌 구간 $[-1,1]$에서 연속인 모든 함수들로 구성된 내적공간 $C[-1,1]$에서 내적을 $\\langle f,g\\rangle=\\displaystyle\\int_{-1}^{1}f(x)g(x)\\,dx$로 정의하자. $C[-1,1]$의 세 벡터 $1,\\,x+\\alpha,\\,x^2+\\beta x+\\gamma$가 서로 직교할 때 $\\alpha+\\beta+\\gamma$의 값은?",
    options:opts5("$0$","$-\\dfrac{1}{2}$","$-\\dfrac{1}{3}$","$-\\dfrac{1}{4}$","$-\\dfrac{1}{5}$"),
    correct:"3",
    explanation:"$\\langle 1,x+\\alpha\\rangle=\\displaystyle\\int_{-1}^{1}(x+\\alpha)dx=2\\alpha=0\\Rightarrow\\alpha=0$.\n$\\langle 1,x^2+\\beta x+\\gamma\\rangle=\\dfrac{2}{3}+2\\gamma=0\\Rightarrow\\gamma=-\\dfrac{1}{3}$.\n$\\langle x,x^2+\\beta x+\\gamma\\rangle=\\dfrac{2\\beta}{3}=0\\Rightarrow\\beta=0$.\n$\\alpha+\\beta+\\gamma=-\\dfrac{1}{3}$.",
  },
  {
    n:19, subject:"선형대수", unit:"벡터공간", concept:"직교여공간 분해",
    difficulty:"hard",
    question:"선형계 $\\begin{pmatrix}1&1&1&1\\\\0&1&1&1\\end{pmatrix}\\!\\begin{pmatrix}x_1\\\\x_2\\\\x_3\\\\x_4\\end{pmatrix}=\\begin{pmatrix}0\\\\0\\end{pmatrix}$의 해공간을 $V\\subset\\mathbb R^4$라고 하자. 두 벡터 $v\\in V,\\,w\\in V^{\\perp}$가 $v+w=(0,0,1,1)$을 만족할 때 벡터 $v$는?",
    options:opts5("$\\!\\left(\\dfrac{1}{3},0,-\\dfrac{2}{3},\\dfrac{1}{3}\\right)$","$\\!\\left(0,\\dfrac{1}{3},-\\dfrac{2}{3},\\dfrac{1}{3}\\right)$","$\\!\\left(-\\dfrac{1}{3},-\\dfrac{2}{3},0,\\dfrac{1}{3}\\right)$","$\\!\\left(0,-\\dfrac{2}{3},\\dfrac{1}{3},\\dfrac{1}{3}\\right)$","$\\!\\left(\\dfrac{1}{3},0,-\\dfrac{2}{3},-\\dfrac{1}{3}\\right)$"),
    correct:"4",
    explanation:"$V^{\\perp}$의 기저는 행렬의 행 $r_1=(1,1,1,1),\\,r_2=(0,1,1,1)$.\n$u=(0,0,1,1)$의 $V^{\\perp}$로의 정사영을 그람-슈미트 후 계산: 직교화 $r_1$과 $r_2'=r_2-\\dfrac{3}{4}r_1=\\!\\left(-\\dfrac{3}{4},\\dfrac{1}{4},\\dfrac{1}{4},\\dfrac{1}{4}\\right)$.\n$u\\cdot r_1=2,\\,|r_1|^2=4$, $u\\cdot r_2'=\\dfrac{1}{2},\\,|r_2'|^2=\\dfrac{3}{4}$.\n$w=\\dfrac{1}{2}r_1+\\dfrac{2}{3}r_2'=\\!\\left(0,\\dfrac{2}{3},\\dfrac{2}{3},\\dfrac{2}{3}\\right)$.\n$v=u-w=\\!\\left(0,-\\dfrac{2}{3},\\dfrac{1}{3},\\dfrac{1}{3}\\right)$.",
  },
  {
    n:20, subject:"다변수함수", unit:"중적분", concept:"이차형식 변수치환",
    difficulty:"medium",
    question:"좌표평면 위에 부등식 $x^2+2xy+5y^2\\le 1$을 만족하는 영역을 $S$라고 할 때 이중적분 $\\displaystyle\\iint_S\\dfrac{dx\\,dy}{(1+x^2+2xy+5y^2)^2}$의 값은?",
    options:opts5("$\\pi$","$\\dfrac{\\pi}{2}$","$\\dfrac{\\pi}{3}$","$\\dfrac{\\pi}{4}$","$\\dfrac{\\pi}{5}$"),
    correct:"4",
    explanation:"$x^2+2xy+5y^2=(x+y)^2+4y^2$. 치환 $u=x+y,\\,v=2y$이면 야코비안 $|J|=\\dfrac{1}{2}$, 영역은 $u^2+v^2\\le 1$.\n$\\displaystyle\\iint=\\dfrac{1}{2}\\!\\iint_{u^2+v^2\\le 1}\\dfrac{du\\,dv}{(1+u^2+v^2)^2}=\\dfrac{1}{2}\\cdot 2\\pi\\!\\int_0^1\\dfrac{r\\,dr}{(1+r^2)^2}=\\pi\\!\\left[-\\dfrac{1}{2(1+r^2)}\\right]_0^1=\\pi\\!\\left(\\dfrac{1}{2}-\\dfrac{1}{4}\\right)=\\dfrac{\\pi}{4}$.",
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
