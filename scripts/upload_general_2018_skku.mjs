// 2018년 성균관대 편입수학 객관식 20문항 (원 26~45번을 1~20으로 매핑, 5지선다)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2018", SCHOOL_KO="성균관대", SCHOOL_EN="skku";
const opts5 = (...t) => t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));

const PROBLEMS = [
  {
    n:1, subject:"적분학", unit:"특이적분", concept:"발산 판정",
    difficulty:"easy",
    question:"특이적분 $\\displaystyle\\int_1^4\\dfrac{dx}{(x-2)^2}$의 값은?",
    options:opts5("$\\dfrac{1}{2}$","$\\ln 2$","$-\\infty$","$\\infty$","$3$"),
    correct:"4",
    explanation:"피적분함수가 $x=2$에서 발산하고 적분구간 $[1,4]$ 내부에 있다.\n$\\displaystyle\\int_1^2\\dfrac{dx}{(x-2)^2}=\\lim_{b\\to 2^-}\\!\\left[-\\dfrac{1}{x-2}\\right]_1^b=\\lim_{b\\to 2^-}\\!\\left(-\\dfrac{1}{b-2}-1\\right)=\\infty$.\n따라서 전체 적분은 발산 ($\\infty$).",
  },
  {
    n:2, subject:"선형대수", unit:"고유치와 대각화", concept:"특성다항식과 rank",
    difficulty:"medium",
    question:"대각화 가능하며 실수 성분을 가지는 행렬 $A$의 특성(characteristic) 다항식이 $p(t)=(t-1)(t-2)^3(t-3)^6$일 때 행렬 $3I-A$의 계수(rank)는?",
    options:opts5("$3$","$4$","$6$","$8$","$10$"),
    correct:"2",
    explanation:"$A$는 $10\\times 10$ 행렬, 고윳값 $1$ (중복도 1), $2$ (중복도 3), $3$ (중복도 6).\n대각화 가능하므로 기하적 중복도와 대수적 중복도가 같다.\n$3I-A$의 고윳값은 $3-1=2,\\,3-2=1,\\,3-3=0$. $0$ 고윳값의 중복도가 $6$이므로 nullity=6.\n$\\mathrm{rank}(3I-A)=10-6=4$.",
  },
  {
    n:3, subject:"적분학", unit:"특이적분", concept:"수렴/발산 판정",
    difficulty:"medium",
    question:"다음의 특이적분 중 수렴하는 것을 모두 고른 것은?\n(가) $\\displaystyle\\int_1^{\\infty}\\dfrac{1}{x+e^x}dx$\n(나) $\\displaystyle\\int_1^{e}\\dfrac{1}{x(\\ln x)^2}dx$\n(다) $\\displaystyle\\int_{2\\pi}^{\\infty}\\dfrac{x\\cos^2 x+1}{x^3}dx$",
    options:opts5("(가)","(나)","(다)","(가),(나)","(가),(다)"),
    correct:"5",
    explanation:"(가): $x+e^x\\sim e^x$이므로 $\\int_1^\\infty e^{-x}dx$와 비교, 수렴 ✓.\n(나): $x\\to 1^+$에서 $\\ln x\\to 0$, 피적분함수 $\\sim 1/(\\ln x)^2$, $\\int 1/u^2 du$ 형태로 발산 ✗.\n(다): $\\dfrac{x\\cos^2 x+1}{x^3}\\le\\dfrac{x+1}{x^3}\\le\\dfrac{2}{x^2}$ ($x\\ge 2\\pi$), $\\int 2/x^2$ 수렴 ✓.\n(가),(다).",
  },
  {
    n:4, subject:"공학수학", unit:"미분방정식", concept:"자율 1계 ODE 평형점",
    difficulty:"easy",
    question:"미분방정식 $y'=y^2-4y+3$의 해 $y(t)$가 $1<y(0)<3$을 만족할 때 $\\displaystyle\\lim_{t\\to\\infty}y(t)$은?",
    options:opts5("$0$","$1$","$2$","$3$","$\\infty$"),
    correct:"2",
    explanation:"$y'=(y-1)(y-3)$. 평형점 $y=1,\\,y=3$.\n$1<y<3$ 구간에서 $y'<0$이므로 $y$는 감소. 안정 평형점은 $y=1$.\n따라서 $\\lim_{t\\to\\infty}y(t)=1$.",
  },
  {
    n:5, subject:"다변수함수", unit:"선적분과 면적분", concept:"보존장 일",
    difficulty:"easyMedium",
    question:"공간에서 물체가 점 $P(1,1,1)$에서 점 $Q(2,2,2)$로 움직일 때 힘 $F=x^2\\mathbf i+y^2\\mathbf j+z^2\\mathbf k$이 한 일은?",
    options:opts5("$-1$","$1$","$3$","$5$","$7$"),
    correct:"5",
    explanation:"$F=\\nabla\\Phi$, $\\Phi=\\dfrac{x^3+y^3+z^3}{3}$ (보존장).\n$W=\\Phi(2,2,2)-\\Phi(1,1,1)=\\dfrac{24}{3}-\\dfrac{3}{3}=8-1=7$.",
  },
  {
    n:6, subject:"다변수함수", unit:"편도함수", concept:"선형근사",
    difficulty:"easyMedium",
    question:"$f(x,y)=e^{x-1}\\cos((x-1)(y-2))$일 때 점 $(1,2)$에서 선형근사(linear approximation)식 $L(x,y)$를 구하고 이 식을 이용하여 점 $(1.1,1.9)$에서 $f$의 함수 값을 근사하시오.",
    options:opts5("$L(x,y)=x,\\,1.1$","$L(x,y)=y,\\,-0.1$","$L(x,y)=x,\\,0.1$","$L(x,y)=y,\\,1.9$","$L(x,y)=x+y,\\,3$"),
    correct:"1",
    explanation:"$f(1,2)=1$. $f_x=e^{x-1}\\cos((x-1)(y-2))-e^{x-1}(y-2)\\sin((x-1)(y-2))$. $(1,2)$: $f_x=1$.\n$f_y=-e^{x-1}(x-1)\\sin((x-1)(y-2))$. $(1,2)$: $f_y=0$.\n$L(x,y)=1+1\\cdot(x-1)+0\\cdot(y-2)=x$. $L(1.1,1.9)=1.1$.",
  },
  {
    n:7, subject:"선형대수", unit:"행렬", concept:"행렬 성질 진위",
    difficulty:"medium",
    question:"실수 성분을 갖는 $n\\times n$ 행렬 $A,B,C$에 대하여 다음 중 옳지 <u>않은</u> 것은?\n(1) $AB$와 $BA$는 동일한 고윳값을 가진다.\n(2) $AB-BA=I$는 성립하지 않는다.\n(3) $A$는 두 개의 가역행렬의 합으로 쓰일 수 있다.\n(4) 영행렬이 아닌 $C$에 대하여 $AC=BC$이면 $A=B$이다.\n(5) $n$이 홀 수일 때 $\\mathrm{rank}(A)$와 $\\mathrm{nullity}(A)$는 같지 않다.",
    options:opts5("(1)","(2)","(3)","(4)","(5)"),
    correct:"4",
    explanation:"(4) 거짓: $C$가 가역이 아니면 $AC=BC$여도 $A\\neq B$ 가능 (예: $C$가 영공간을 갖는 경우).\n나머지는 모두 참: (1) $AB,BA$는 같은 비영 고윳값, (2) trace 비교로 모순, (3) 분해 가능, (5) 홀수 차원에서 $\\mathrm{rank}+\\mathrm{nullity}=n$이 홀수이므로 같을 수 없다.",
  },
  {
    n:8, subject:"적분학", unit:"정적분의 응용", concept:"회전체 부피(워셔)",
    difficulty:"medium",
    question:"좌표평면 위에 곡선 $y=9-x^2$과 두 개의 직선 $x=1,\\,y=5$에 의해 둘러싸인 영역을 직선 $y=5$ 둘레로 회전시켜 생기는 입체의 부피는?",
    options:opts5("$\\dfrac{53}{13}\\pi$","$\\dfrac{53}{14}\\pi$","$\\dfrac{53}{15}\\pi$","$\\dfrac{53}{16}\\pi$","$\\dfrac{53}{17}\\pi$"),
    correct:"3",
    explanation:"$y=9-x^2$와 $y=5$의 교점: $x=\\pm 2$. 영역은 $1\\le x\\le 2$.\nDisk: $V=\\pi\\!\\int_1^2(9-x^2-5)^2 dx=\\pi\\!\\int_1^2(4-x^2)^2 dx=\\pi\\!\\int_1^2(16-8x^2+x^4)dx$\n$=\\pi\\!\\left[16x-\\dfrac{8x^3}{3}+\\dfrac{x^5}{5}\\right]_1^2=\\pi\\!\\left[\\!\\left(32-\\dfrac{64}{3}+\\dfrac{32}{5}\\right)-\\!\\left(16-\\dfrac{8}{3}+\\dfrac{1}{5}\\right)\\right]=\\dfrac{53\\pi}{15}$.",
  },
  {
    n:9, subject:"적분학", unit:"정적분의 응용", concept:"확률밀도함수 기댓값",
    difficulty:"medium",
    question:"확률 변수(random variable) $X$의 확률밀도(probability density)함수 $f(x)$가 $f(x)=\\begin{cases}\\dfrac{c}{(1+x)^3},&x\\ge 0\\\\ 0,&x<0\\end{cases}$이라 할 때 $X$의 기댓값(expected value)은? (단, $c$는 상수)",
    options:opts5("$1$","$2$","$3$","$4$","$5$"),
    correct:"1",
    explanation:"정규화: $c\\!\\int_0^\\infty\\dfrac{dx}{(1+x)^3}=c\\!\\left[-\\dfrac{1}{2(1+x)^2}\\right]_0^\\infty=\\dfrac{c}{2}=1\\Rightarrow c=2$.\n$E[X]=2\\!\\int_0^\\infty\\dfrac{x}{(1+x)^3}dx$. $u=1+x$ 치환: $2\\!\\int_1^\\infty\\dfrac{u-1}{u^3}du=2\\!\\left[-\\dfrac{1}{u}+\\dfrac{1}{2u^2}\\right]_1^\\infty=2\\!\\left(0-\\!\\left(-1+\\dfrac{1}{2}\\right)\\right)=2\\cdot\\dfrac{1}{2}=1$.",
  },
  {
    n:10, subject:"다변수함수", unit:"선적분과 면적분", concept:"발산정리",
    difficulty:"medium",
    question:"폐곡선 $x^2+y^2+z^2=1$을 $S$라 하고 $S$의 방향(orientation)이 바깥쪽을 향할 때 벡터장 $F(x,y,z)=\\sin^2 x\\,\\mathbf i+6y\\,\\mathbf j-z\\sin 2x\\,\\mathbf k$이 곡면 $S$를 통과하는 유량(Flux)은?",
    options:opts5("$0$","$\\dfrac{4}{3}\\pi$","$4\\pi$","$-\\dfrac{3}{4}\\pi$","$8\\pi$"),
    correct:"5",
    explanation:"발산정리: $\\nabla\\cdot F=2\\sin x\\cos x+6-\\sin 2x=\\sin 2x+6-\\sin 2x=6$.\n단위구 부피 $\\dfrac{4\\pi}{3}$. Flux $=6\\cdot\\dfrac{4\\pi}{3}=8\\pi$.",
  },
  {
    n:11, subject:"적분학", unit:"Maclaurin급수의 응용", concept:"$\\sin$ 급수 활용",
    difficulty:"hard",
    question:"무한급수 $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(-1)^n}{(2n+1)!}\\!\\int_0^{\\sqrt{\\pi/2}}x^{4n+3}\\,dx$의 합은?",
    options:opts5("$-1$","$-\\dfrac{1}{2}$","$0$","$\\dfrac{1}{2}$","$1$"),
    correct:"4",
    explanation:"내부 적분 $\\displaystyle\\int_0^{\\sqrt{\\pi/2}}x^{4n+3}dx=\\dfrac{(\\pi/2)^{2n+2}}{4n+4}=\\dfrac{(\\pi/2)^{2n+2}}{4(n+1)}$.\n원 합 $=\\displaystyle\\sum_{n=0}^\\infty\\dfrac{(-1)^n}{(2n+1)!\\cdot 4(n+1)}\\!\\left(\\dfrac{\\pi}{2}\\right)^{2(n+1)}$.\n부분적분: $\\int_0^{\\sqrt{\\pi/2}}x\\sin(x^2)dx=\\dfrac{1}{2}[1-\\cos(\\pi/2)]=\\dfrac{1}{2}$. (주: $\\sin u=\\sum(-1)^n u^{2n+1}/(2n+1)!$ 활용으로 합 $=\\dfrac{1}{2}$.)",
  },
  {
    n:12, subject:"선형대수", unit:"고유치와 대각화", concept:"케일리-해밀턴",
    difficulty:"medium",
    question:"행렬 $A=\\begin{pmatrix}1&0&0\\\\3&-1&0\\\\4&2&-2\\end{pmatrix}$와 실수 $a_0,a_1,a_2$에 대하여 $A^5=a_2 A^2+a_1 A+a_0 I$일 때 합 $a_0+a_1+a_2$의 값은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"),
    correct:"1",
    explanation:"하삼각이라 고윳값 $1,-1,-2$. 특성다항식 $(\\lambda-1)(\\lambda+1)(\\lambda+2)=\\lambda^3+2\\lambda^2-\\lambda-2$.\n케일리-해밀턴: $A^3=-2A^2+A+2I$. $A^4=A\\cdot A^3=-2A^3+A^2+2A=-2(-2A^2+A+2I)+A^2+2A=5A^2-4I$.\n$A^5=A\\cdot A^4=5A^3-4A=5(-2A^2+A+2I)-4A=-10A^2+A+10I$.\n$a_2=-10,\\,a_1=1,\\,a_0=10$. 합 $=1$.",
  },
  {
    n:13, subject:"선형대수", unit:"벡터공간", concept:"내적공간 직교분해",
    difficulty:"medium",
    question:"$C[-1,1]$의 부분공간 $P_1=\\mathrm{span}\\{1,x\\}$에 대하여 두 함수 $h_1\\in P_1,\\,h_2\\in P_1^{\\perp}$가 $h_1(x)+h_2(x)=e^x$을 만족할 때 $h_1(1)$의 값은?",
    options:opts5("$\\dfrac{e}{2}+\\dfrac{1}{2e}$","$\\dfrac{e}{2}+\\dfrac{1}{e}$","$\\dfrac{e}{2}+\\dfrac{3}{2e}$","$\\dfrac{e}{2}+\\dfrac{2}{e}$","$\\dfrac{e}{2}+\\dfrac{5}{2e}$"),
    correct:"5",
    explanation:"$h_1=\\mathrm{proj}_{P_1}(e^x)$. 직교기저 $\\{1,x\\}$ ($\\langle 1,x\\rangle=0$).\n$\\langle e^x,1\\rangle=\\int_{-1}^1 e^x dx=e-e^{-1}$, $\\|1\\|^2=2$. 첫 계수 $\\dfrac{e-e^{-1}}{2}$.\n$\\langle e^x,x\\rangle=\\int_{-1}^1 xe^x dx=2e^{-1}$ (부분적분), $\\|x\\|^2=\\dfrac{2}{3}$. 둘째 계수 $\\dfrac{3}{e}$.\n$h_1(x)=\\dfrac{e-e^{-1}}{2}+\\dfrac{3x}{e}$. $h_1(1)=\\dfrac{e}{2}-\\dfrac{1}{2e}+\\dfrac{3}{e}=\\dfrac{e}{2}+\\dfrac{5}{2e}$.",
  },
  {
    n:14, subject:"공학수학", unit:"미분방정식", concept:"안정상태해(특수해)",
    difficulty:"medium",
    question:"미분방정식 $y''+2y'+2y=\\cos 2t$의 해가 $y(0)=1,\\,y'(0)=0$을 만족할 때 안정상태해(Steady state solution)의 $t=\\dfrac{\\pi}{2}$에서의 함숫값은?",
    options:opts5("$\\dfrac{13}{10}e^{-\\pi/2}+\\dfrac{1}{10}$","$\\dfrac{13}{10}e^{-\\pi/2}$","$\\dfrac{1}{10}$","$-\\dfrac{2}{10}$","$\\dfrac{11}{13}e^{-\\pi/2}-\\dfrac{2}{10}$"),
    correct:"3",
    explanation:"동차해 $e^{-t}(c_1\\cos t+c_2\\sin t)$는 $t\\to\\infty$에서 $\\to 0$ (transient).\n안정상태해 = 특수해 $y_p=A\\cos 2t+B\\sin 2t$. $-4A+4B+2A=1,\\,-4B-4A+2B=0$.\n$-2A+4B=1,\\,-4A-2B=0\\Rightarrow B=-2A$. $-2A-8A=1\\Rightarrow A=-\\dfrac{1}{10},\\,B=\\dfrac{1}{5}$.\n$y_p(\\pi/2)=A\\cos\\pi+B\\sin\\pi=-A=\\dfrac{1}{10}$.",
  },
  {
    n:15, subject:"다변수함수", unit:"삼중적분과 극좌표계", concept:"드럼통 표면적분",
    difficulty:"hard",
    question:"좌표공간에 부등식 $x^2+y^2\\le z^2+1$과 $|z|\\le 2$를 만족하는 영역의 입체를 고려하자. 이 입체의 경계곡면(Boundary surface)과 같은 형태의 속이 빈 닫힌 드럼통이 있고 이 드럼통의 밀도함수가 $\\rho(x,y,z)=3|z|$일 때 드럼통의 질량은?",
    options:opts5("$110\\pi$","$111\\pi$","$112\\pi$","$113\\pi$","$114\\pi$"),
    correct:"3",
    explanation:"경계곡면 = (옆면 회전곡면) + (위/아래 디스크).\n옆면: $r=\\sqrt{z^2+1}$, $-2\\le z\\le 2$. $dS=\\sqrt{1+(dr/dz)^2}\\cdot 2\\pi r\\,dz=2\\pi\\sqrt{z^2+1}\\sqrt{1+\\dfrac{z^2}{z^2+1}}dz=2\\pi\\sqrt{2z^2+1}\\,dz$.\n질량_옆 $=2\\!\\int_0^2 3z\\cdot 2\\pi\\sqrt{2z^2+1}dz=12\\pi\\!\\int_0^2 z\\sqrt{2z^2+1}dz=12\\pi\\cdot\\dfrac{1}{6}[(2z^2+1)^{3/2}]_0^2=2\\pi(27-1)=52\\pi$.\n디스크 (위/아래): $z=\\pm 2$, $r\\le\\sqrt 5$. $\\rho=3\\cdot 2=6$. 질량_디스크 $=2\\cdot 6\\cdot\\pi\\cdot 5=60\\pi$.\n총 $=52\\pi+60\\pi=112\\pi$.",
  },
  {
    n:16, subject:"선형대수", unit:"선형사상", concept:"좌측 곱 변환의 trace",
    difficulty:"medium",
    question:"벡터공간 $V$는 실수 성분을 갖는 모든 $2\\times 2$ 행렬의 집합일 때 행렬 $M=\\begin{pmatrix}2&-1\\\\3&1\\end{pmatrix}$에 대하여 선형변환 $T:V\\to V$를 $T(A)=MA$로 정의하자. 이 때 $T$의 $\\mathrm{trace}$의 값은?",
    options:opts5("$6$","$7$","$8$","$9$","$10$"),
    correct:"1",
    explanation:"$T(A)=MA$에 대한 표준기저 $\\{E_{11},E_{12},E_{21},E_{22}\\}$의 행렬 표현은 블록 대각 $\\mathrm{diag}(M,M)$.\n$\\mathrm{tr}(T)=2\\cdot\\mathrm{tr}(M)=2(2+1)=6$.",
  },
  {
    n:17, subject:"다변수함수", unit:"중적분", concept:"3중적분 부피",
    difficulty:"medium",
    question:"공간에서 영역 $R$이 두 곡면 $y=x^2,\\,x=y^2$과 두 평면 $z=0,\\,z=x+y$로 둘러싸여 있을 때 영역의 체적은?",
    options:opts5("$\\dfrac{1}{3}$","$\\dfrac{3}{10}$","$\\dfrac{2}{3}$","$\\dfrac{1}{9}$","$\\dfrac{5}{3}$"),
    correct:"2",
    explanation:"$xy$ 평면 영역 $D=\\{0\\le x\\le 1,\\,x^2\\le y\\le\\sqrt x\\}$.\n$V=\\displaystyle\\iint_D(x+y)\\,dA=\\int_0^1\\!\\!\\int_{x^2}^{\\sqrt x}(x+y)dy\\,dx=\\int_0^1\\!\\left[xy+\\dfrac{y^2}{2}\\right]_{x^2}^{\\sqrt x}dx$.\n$=\\displaystyle\\int_0^1\\!\\left(x^{3/2}+\\dfrac{x}{2}-x^3-\\dfrac{x^4}{2}\\right)dx=\\dfrac{2}{5}+\\dfrac{1}{4}-\\dfrac{1}{4}-\\dfrac{1}{10}=\\dfrac{4-1}{10}=\\dfrac{3}{10}$.",
  },
  {
    n:18, subject:"적분학", unit:"급수의 수렴/발산", concept:"sin 합 (Lagrange 항등식)",
    difficulty:"hard",
    question:"$\\sin\\!\\dfrac{\\pi}{12}+\\sin\\!\\dfrac{2\\pi}{12}+\\cdots+\\sin\\!\\dfrac{11\\pi}{12}$의 값은?",
    options:opts5("$\\cot\\!\\dfrac{\\pi}{12}$","$\\tan\\!\\dfrac{\\pi}{12}$","$\\cot\\!\\dfrac{\\pi}{24}$","$\\tan\\!\\dfrac{\\pi}{24}$","$1$"),
    correct:"3",
    explanation:"$\\displaystyle\\sum_{k=1}^{N}\\sin(kx)=\\dfrac{\\sin(Nx/2)\\sin((N+1)x/2)}{\\sin(x/2)}$.\n$N=11,\\,x=\\pi/12$: 합 $=\\dfrac{\\sin(11\\pi/24)\\sin(12\\pi/24)}{\\sin(\\pi/24)}=\\dfrac{\\sin(11\\pi/24)\\cdot 1}{\\sin(\\pi/24)}=\\dfrac{\\cos(\\pi/24)}{\\sin(\\pi/24)}=\\cot\\!\\dfrac{\\pi}{24}$ (∵ $\\sin(11\\pi/24)=\\cos(\\pi/24)$).",
  },
  {
    n:19, subject:"적분학", unit:"급수의 수렴/발산", concept:"교대 망원급수",
    difficulty:"medium",
    question:"다음 무한급수의 합은?\n$\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-1)^{n+1}}{n(n+1)}=\\dfrac{1}{1\\cdot 2}-\\dfrac{1}{2\\cdot 3}+\\dfrac{1}{3\\cdot 4}-\\cdots$",
    options:opts5("$\\ln 2$","$\\ln 2+1$","$2\\ln 2$","$2\\ln 2-1$","$3\\ln 2-2$"),
    correct:"4",
    explanation:"$\\dfrac{1}{n(n+1)}=\\dfrac{1}{n}-\\dfrac{1}{n+1}$.\n$\\displaystyle\\sum(-1)^{n+1}\\!\\left[\\dfrac{1}{n}-\\dfrac{1}{n+1}\\right]=\\sum\\dfrac{(-1)^{n+1}}{n}-\\sum\\dfrac{(-1)^{n+1}}{n+1}$.\n첫째 합 $=\\ln 2$. 둘째 합 $=\\sum_{m=2}^\\infty\\dfrac{(-1)^m}{m}=-(\\ln 2-1)=1-\\ln 2$.\n전체 $=\\ln 2-(1-\\ln 2)=2\\ln 2-1$.",
  },
  {
    n:20, subject:"공학수학", unit:"미분방정식", concept:"복소 고윳값 연립 ODE",
    difficulty:"medium",
    question:"다음 연립 미분방정식 $\\begin{cases}y_1'=2y_1-2y_2\\\\ y_2'=2y_1+2y_2\\end{cases}$은 $(y_1(0),y_2(0))=(1,1)$을 만족한다. $\\!\\left(y_1\\!\\left(\\dfrac{\\pi}{2}\\right),y_2\\!\\left(\\dfrac{\\pi}{2}\\right)\\right)$의 값은?",
    options:opts5("$(-e^{\\pi},-e^{\\pi})$","$(-e^{\\pi},e^{\\pi})$","$(-e^{\\pi/2},-e^{\\pi/2})$","$(e^{\\pi/2},-e^{\\pi/2})$","$(e^{\\pi/2},e^{\\pi/2})$"),
    correct:"1",
    explanation:"$A=\\begin{pmatrix}2&-2\\\\2&2\\end{pmatrix}=2I+2J$ ($J=\\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix}$, 회전).\n$e^{tA}=e^{2t}\\cdot R(2t)$ ($R$은 회전행렬).\n$\\binom{y_1}{y_2}=e^{2t}R(2t)\\binom{1}{1}=e^{2t}\\binom{\\cos 2t-\\sin 2t}{\\sin 2t+\\cos 2t}$.\n$t=\\pi/2$: $e^{\\pi}\\binom{\\cos\\pi-\\sin\\pi}{\\sin\\pi+\\cos\\pi}=e^{\\pi}\\binom{-1}{-1}=(-e^{\\pi},-e^{\\pi})$.",
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
