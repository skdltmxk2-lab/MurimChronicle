// 2023년 한양대(본교) 편입수학 객관식 20문항 (Q2~Q21, 5지선다)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2023", SCHOOL_KO="한양대", SCHOOL_EN="hanyang";
const opts5 = (...t) => t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));

const PROBLEMS = [
  {
    n:2, subject:"미분학", unit:"순간 변화율", concept:"관련 변화율(반구)",
    difficulty:"medium",
    question:"반지름이 $10\\,m$인 반구 모양의 수조에 $3\\,m^3/\\sec$의 속도로 물을 채운다. 수위가 $5\\,m$일 때 물이 차오르는 속도는 $v\\,m/\\sec$이다. $\\dfrac{1}{v\\pi}$의 값은?",
    options:opts5("$10$","$15$","$25$","$30$","$35$"),
    correct:"3",
    explanation:"반지름 $R=10$인 반구에서 수위 $h$일 때 부피 $V=\\pi h^2(R-h/3)=\\pi h^2(10-h/3)$.\n$\\dfrac{dV}{dt}=\\pi[20h-h^2]\\dfrac{dh}{dt}$. $h=5$ 대입: $3=\\pi\\cdot 5\\cdot 15\\cdot v=75\\pi v$이므로 $v=\\dfrac{1}{25\\pi}$.\n$\\dfrac{1}{v\\pi}=25$.",
  },
  {
    n:3, subject:"적분학", unit:"Maclaurin급수의 응용", concept:"급수와 정적분",
    difficulty:"medium",
    question:"$f(x)=\\displaystyle\\sum_{n=0}^{\\infty}(-1)^n\\dfrac{x^{2n+1}}{n!}$에 대해 $\\displaystyle\\int_0^{\\sqrt{\\ln 4}}f(x)\\,dx$의 값은?",
    options:opts5("$\\dfrac{3}{8}$","$\\dfrac{4}{9}$","$\\dfrac{2}{3}$","$\\dfrac{3}{4}$","$\\dfrac{3}{2}$"),
    correct:"1",
    explanation:"$\\displaystyle\\sum_{n=0}^{\\infty}(-1)^n\\dfrac{x^{2n}}{n!}=e^{-x^2}$이므로 $f(x)=x e^{-x^2}$.\n$\\displaystyle\\int_0^{\\sqrt{\\ln 4}}x e^{-x^2}dx$. $u=x^2$로 치환: $\\dfrac{1}{2}\\int_0^{\\ln 4}e^{-u}du=\\dfrac{1}{2}\\!\\left[1-e^{-\\ln 4}\\right]=\\dfrac{1}{2}\\!\\left(1-\\dfrac{1}{4}\\right)=\\dfrac{3}{8}$.",
  },
  {
    n:4, subject:"다변수함수", unit:"편도함수", concept:"연쇄법칙",
    difficulty:"easyMedium",
    question:"미분가능한 함수 $f$에 대하여 $g(s,t)=f(s^3-t^3,\\,t^3-s^3)$이다. $g_s(1,2)=3$일 때 $\\dfrac{\\partial g}{\\partial t}(1,2)$의 값은?",
    options:opts5("$-12$","$-9$","$-6$","$-3$","$0$"),
    correct:"1",
    explanation:"$g_s=3s^2 f_1+(-3s^2)f_2=3s^2(f_1-f_2)$. $(1,2)$ 대입: $3(f_1-f_2)=3$이므로 $f_1-f_2=1$.\n$g_t=-3t^2 f_1+3t^2 f_2=-3t^2(f_1-f_2)$. $(1,2)$: $-12\\cdot 1=-12$.",
  },
  {
    n:5, subject:"다변수함수", unit:"곡선과 곡면", concept:"토러스(원환면) 법선벡터",
    difficulty:"medium",
    question:"$xz$평면 위에 중심이 $(2,0,0)$이고 반지름이 $1$인 원을 $z$축 중심으로 회전하여 얻은 곡면을 $S$라 하자. $S$ 위의 점 $\\!\\left(\\dfrac{5\\sqrt 3}{4},\\,\\dfrac{5}{4},\\,\\dfrac{\\sqrt 3}{2}\\right)$에서의 단위법선벡터를 $\\langle a,b,c\\rangle$라 할 때 $|2a+b-c|$의 값은?",
    options:opts5("$\\dfrac{1}{8}$","$\\dfrac{1}{7}$","$\\dfrac{1}{6}$","$\\dfrac{1}{4}$","$\\dfrac{1}{3}$"),
    correct:"4",
    explanation:"점에서 $z$축까지 거리 $\\sqrt{(5\\sqrt 3/4)^2+(5/4)^2}=\\dfrac{5}{2}$. 단위 동경 $\\hat e_r=(\\sqrt 3/2,1/2,0)$.\n해당 점이 속한 작은 원의 중심은 $z$축에서 거리 $2$인 위치 $2\\hat e_r=(\\sqrt 3,1,0)$.\n법선 = (점)$-$(중심) $=(\\sqrt 3/4,\\,1/4,\\,\\sqrt 3/2)$, 크기 $1$ (작은 원 반지름).\n$|2a+b-c|=|2\\cdot\\sqrt 3/4+1/4-\\sqrt 3/2|=|1/4|=\\dfrac{1}{4}$.",
  },
  {
    n:6, subject:"다변수함수", unit:"중적분", concept:"변수치환 사다리꼴",
    difficulty:"medium",
    question:"점 $(1,0),(2,0),(0,1),(0,2)$을 꼭짓점으로 가지는 평면 위의 사다리꼴 영역을 $D$라 할 때 $\\displaystyle\\iint_D e^{(y-x)/(y+x)}dA=\\dfrac{q}{p}(e-e^{-1})$이다. 서로소인 두 자연수 $p,q$에 대하여 $p\\times q$의 값은?",
    options:opts5("$6$","$10$","$12$","$18$","$21$"),
    correct:"3",
    explanation:"치환 $u=y-x,\\,v=y+x$. 야코비안 $|J|=\\dfrac{1}{2}$. 영역은 $\\{1\\le v\\le 2,\\,-v\\le u\\le v\\}$.\n$\\displaystyle\\iint=\\dfrac{1}{2}\\!\\int_1^2\\!\\!\\int_{-v}^v e^{u/v}du\\,dv=\\dfrac{1}{2}\\!\\int_1^2 v(e-e^{-1})dv=\\dfrac{e-e^{-1}}{2}\\cdot\\dfrac{3}{2}=\\dfrac{3}{4}(e-e^{-1})$.\n$p=4,\\,q=3$이므로 $p\\times q=12$.",
  },
  {
    n:7, subject:"다변수함수", unit:"선적분과 면적분", concept:"스칼라 선적분",
    difficulty:"medium",
    question:"$\\alpha(t)=\\langle 2\\sin t,\\,2\\cos t,\\,t\\rangle,\\,0\\le t\\le\\pi/2$로 표현되는 매개변수 곡선 $C$에 대해 $\\displaystyle\\int_C 15x^3 y^2\\,ds$의 값은?",
    options:opts5("$16\\sqrt 5$","$32\\sqrt 5$","$64\\sqrt 5$","$84\\sqrt 5$","$128\\sqrt 5$"),
    correct:"3",
    explanation:"$|\\alpha'|=\\sqrt{4\\cos^2 t+4\\sin^2 t+1}=\\sqrt 5$, $ds=\\sqrt 5\\,dt$.\n$x^3 y^2=(2\\sin t)^3(2\\cos t)^2=32\\sin^3 t\\cos^2 t$. $\\int_0^{\\pi/2}\\sin^3 t\\cos^2 t\\,dt=\\dfrac{2}{15}$ (베타함수 또는 $u=\\cos t$ 치환).\n$\\displaystyle\\int_C=15\\cdot 32\\cdot\\sqrt 5\\cdot\\dfrac{2}{15}=64\\sqrt 5$.",
  },
  {
    n:8, subject:"다변수함수", unit:"선적분과 면적분", concept:"보존장 선적분",
    difficulty:"medium",
    question:"$r(t)=\\langle e^t\\sin t,\\,e^t\\cos t,\\,t\\rangle,\\,0\\le t\\le\\pi$로 표현되는 곡선 $C$와 벡터장 $F(x,y,z)=\\langle y^3,\\,3xy^2+2ye^z,\\,y^2 e^z\\rangle$에 대해 $(0,1,0)$에서 $(0,-e^\\pi,\\pi)$로의 선적분 $\\displaystyle\\int_C F\\cdot dr$의 값은?",
    options:opts5("$e^{3\\pi}-1$","$e^{4\\pi}+1$","$e^{5\\pi}-1$","$e^{6\\pi}+1$","$e^{7\\pi}-1$"),
    correct:"1",
    explanation:"$F$의 보존장 검사: $\\Phi_x=y^3\\Rightarrow\\Phi=xy^3+g(y,z)$. $\\Phi_y=3xy^2+g_y=3xy^2+2ye^z\\Rightarrow g=y^2 e^z+h(z)$. $\\Phi_z=y^2 e^z+h'=y^2 e^z\\Rightarrow h$=상수.\n$\\Phi(x,y,z)=xy^3+y^2 e^z$.\n$\\Phi(0,-e^{\\pi},\\pi)-\\Phi(0,1,0)=(0+e^{2\\pi}\\cdot e^{\\pi})-(0+1)=e^{3\\pi}-1$.",
  },
  {
    n:9, subject:"다변수함수", unit:"선적분과 면적분", concept:"스토크스 정리",
    difficulty:"medium",
    question:"평면 $y+z=2$와 원기둥 $x^2+y^2=1$의 교차곡선 $C$와 벡터장 $F(x,y,z)=(y^3,\\,x,\\,z^4)$에 대한 선적분 $\\displaystyle\\int_C F\\cdot dr$의 값은? (단, $C$는 $xy$평면 위에서 바라보았을 때 시계 반대 방향인 향을 가진다.)",
    options:opts5("$\\dfrac{\\pi}{8}$","$\\dfrac{\\pi}{4}$","$\\dfrac{\\pi}{2}$","$\\pi$","$\\dfrac{3}{2}\\pi$"),
    correct:"2",
    explanation:"스토크스 정리: $\\nabla\\times F=(0,0,1-3y^2)$. 디스크 $S$ ($y+z=2$ 위, 원기둥에 의해 잘림), 외향법선 $\\hat n=(0,1,1)/\\sqrt 2$, $dS=\\sqrt 2\\,dA$ ($xy$평면 투영).\n$\\displaystyle\\iint_S(\\nabla\\times F)\\cdot\\hat n\\,dS=\\iint_{x^2+y^2\\le 1}(1-3y^2)\\,dA=\\pi-3\\cdot\\dfrac{\\pi}{4}=\\dfrac{\\pi}{4}$.",
  },
  {
    n:10, subject:"선형대수", unit:"선형사상", concept:"기저변환에 의한 행렬표현",
    difficulty:"hard",
    question:"차수가 $3$ 이하인 다항식들의 벡터공간 $P_3$에 대하여 $T:P_3\\to P_3$를 $T(a_3 x^3+a_2 x^2+a_1 x+a_0)=(a_0+a_1)x^3+2a_2 x^2+(a_3-a_0)x+3a_1-a_2$라 하자. $P_3$의 기저 $\\{x^3+x^2,\\,x^2,\\,x+1,\\,1\\}$에 대한 $T$의 행렬표현 $A$의 두 번째 행의 모든 성분들의 합은?",
    options:opts5("$0$","$1$","$2$","$3$","$4$"),
    correct:"2",
    explanation:"각 기저원소의 상을 새 기저로 좌표 표현:\n$T(x^3+x^2)=2x^2+x-1$의 좌표 $(0,2,1,-2)$. $T(x^2)=2x^2-1$의 좌표 $(0,2,0,-1)$. $T(x+1)=2x^3-x+3$의 좌표 $(2,-2,-1,4)$. $T(1)=x^3-x$의 좌표 $(1,-1,-1,1)$.\n$A=\\begin{pmatrix}0&0&2&1\\\\2&2&-2&-1\\\\1&0&-1&-1\\\\-2&-1&4&1\\end{pmatrix}$. 두 번째 행 합 $=2+2-2-1=1$.",
  },
  {
    n:11, subject:"선형대수", unit:"행렬", concept:"영공간(Null space) 기저",
    difficulty:"medium",
    question:"행렬 $\\begin{pmatrix}1&2&1&0\\\\2&-1&0&1\\\\1&-3&-1&1\\\\2&9&4&-1\\end{pmatrix}$의 영공간(Null space)의 기저가 $\\{(a,b,5,0),\\,(c,d,0,1)\\}$이면 $\\dfrac{b}{a}+\\dfrac{d}{c}$의 값은?",
    options:opts5("$-\\dfrac{3}{2}$","$-\\dfrac{2}{3}$","$0$","$\\dfrac{2}{3}$","$\\dfrac{3}{2}$"),
    correct:"5",
    explanation:"첫 두 행으로 충분 (3,4행은 종속). $(a,b,5,0)$: $a+2b+5=0,\\,2a-b=0$. 풀면 $a=-1,\\,b=-2$.\n$(c,d,0,1)$: $c+2d=0,\\,2c-d+1=0$. 풀면 $c=-2/5,\\,d=1/5$.\n$\\dfrac{b}{a}+\\dfrac{d}{c}=2+\\!\\left(\\dfrac{1/5}{-2/5}\\right)=2-\\dfrac{1}{2}=\\dfrac{3}{2}$.",
  },
  {
    n:12, subject:"선형대수", unit:"고유치와 대각화", concept:"케일리-해밀턴",
    difficulty:"medium",
    question:"$A=\\begin{pmatrix}1&0&0&0\\\\0&0&-9&0\\\\0&1&-6&0\\\\0&0&0&-2\\end{pmatrix}$와 벡터 $v=\\begin{pmatrix}0\\\\1\\\\0\\\\0\\end{pmatrix}$에 대하여 $A^3v=a_1 Av+a_0 v$일 때, $a_0-a_1$의 값은?",
    options:opts5("$21$","$24$","$27$","$30$","$31$"),
    correct:"3",
    explanation:"$Av=(0,0,1,0)^T$ ($A$의 두 번째 열). $A^2v=A(0,0,1,0)^T=(0,-9,-6,0)^T$ (세 번째 열). $A^3v=A(0,-9,-6,0)^T=-9\\cdot(0,0,1,0)+(-6)(0,-9,-6,0)=(0,54,-9+36,0)=(0,54,27,0)$.\n$A^3 v=a_1\\cdot Av+a_0\\cdot v=(0,a_0,a_1,0)$이므로 $a_0=54,\\,a_1=27$.\n$a_0-a_1=27$.",
  },
  {
    n:13, subject:"선형대수", unit:"고유치와 대각화", concept:"직교대각화 좌표",
    difficulty:"medium",
    question:"직교행렬 $U=\\begin{pmatrix}a&0&b\\\\c&0&d\\\\0&1&0\\end{pmatrix}$을 이용하여 행렬 $A=\\begin{pmatrix}2&1&0\\\\1&2&0\\\\0&0&2\\end{pmatrix}$를 대각화할 수 있다 ($a,b>0$). $a+b+c+d$의 값은?",
    options:opts5("$-\\sqrt 2$","$-2+\\sqrt 2$","$0$","$2-\\sqrt 2$","$\\sqrt 2$"),
    correct:"5",
    explanation:"$A$의 고윳값: 좌상단 $\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$의 고윳값 $1,3$, 우하단 $2$. 즉 $\\lambda_1=1,\\,\\lambda_2=2,\\,\\lambda_3=3$.\n$U$의 둘째 열이 $(0,0,1)^T$이므로 $\\lambda_2=2$ 대응. 1열은 $\\lambda_1=1$ ($a>0$ 조건으로 $\\dfrac{1}{\\sqrt 2}(1,-1,0)$), 3열은 $\\lambda_3=3$ ($b>0$ 조건으로 $\\dfrac{1}{\\sqrt 2}(1,1,0)$).\n$a=\\dfrac{1}{\\sqrt 2},\\,c=-\\dfrac{1}{\\sqrt 2},\\,b=\\dfrac{1}{\\sqrt 2},\\,d=\\dfrac{1}{\\sqrt 2}$. 합 $=\\dfrac{2}{\\sqrt 2}=\\sqrt 2$.",
  },
  {
    n:14, subject:"선형대수", unit:"고유치와 대각화", concept:"스펙트럼 분해",
    difficulty:"hard",
    question:"실대칭행렬 $A=\\begin{pmatrix}2&1&0\\\\1&2&0\\\\0&0&2\\end{pmatrix}$의 스펙트럼 분해 $A=\\lambda_1 P_1+\\lambda_2 P_2+\\lambda_3 P_3$ ($\\lambda_1<\\lambda_2<\\lambda_3$)와 $A^{2023}=\\mu_1 Q_1+\\mu_2 Q_2+\\mu_3 Q_3$ ($\\mu_1<\\mu_2<\\mu_3$)에 대하여, $\\det Q_1-\\lambda_2+\\mu_3$의 값은? (단, $\\det Q_1$은 $Q_1$의 행렬식이다.)",
    options:opts5("$3^{2023}-5$","$3^{2023}-4$","$3^{2023}-3$","$3^{2023}-2$","$3^{2023}-1$"),
    correct:"4",
    explanation:"$\\lambda_1=1,\\,\\lambda_2=2,\\,\\lambda_3=3$이고 $A^{2023}$의 고윳값은 $1,2^{2023},3^{2023}$. $\\mu_1<\\mu_2<\\mu_3$이므로 $\\mu_1=1,\\,\\mu_2=2^{2023},\\,\\mu_3=3^{2023}$. $Q_1=P_1$.\n$P_1$은 1차원 고유공간 $\\lambda=1$로의 직교 투영이므로 rank $1$, $\\det P_1=0$.\n$\\det Q_1-\\lambda_2+\\mu_3=0-2+3^{2023}=3^{2023}-2$.",
  },
  {
    n:15, subject:"선형대수", unit:"행렬", concept:"행렬식(반대각 형태)",
    difficulty:"medium",
    question:"행렬 $\\begin{pmatrix}3&0&0&0&0&2\\\\0&0&0&0&3&2\\\\0&0&0&4&3&3\\\\0&0&5&4&4&4\\\\0&6&5&5&5&5\\\\1&0&0&0&0&1\\end{pmatrix}$의 행렬식의 값은?",
    options:opts5("$-720$","$-360$","$-180$","$180$","$360$"),
    correct:"5",
    explanation:"첫 열은 $(3,0,0,0,0,1)^T$. 1열 따라 라플라스 전개: $\\det=3\\cdot M_{11}-1\\cdot M_{61}$ (부호 $(-1)^{i+j}$).\n$M_{11}$의 5×5 행렬식 계산하면 $360$, $M_{61}$의 5×5 행렬식 $720$.\n$\\det=3\\cdot 360-720=1080-720=360$.",
  },
  {
    n:16, subject:"공학수학", unit:"미분방정식", concept:"완전 미분방정식",
    difficulty:"medium",
    question:"미분방정식 $3x^2+4xy+(2y+2x^2)\\dfrac{dy}{dx}=0$의 해 $y(x)$가 초기조건 $y(0)=1$을 만족할 때, $\\{y(2)\\}^2+8y(2)$의 값은?",
    options:opts5("$-12$","$-7$","$-2$","$3$","$8$"),
    correct:"2",
    explanation:"완전성 검사: $\\partial_y(3x^2+4xy)=4x=\\partial_x(2y+2x^2)$. ✓\n$F_x=3x^2+4xy\\Rightarrow F=x^3+2x^2 y+g(y)$. $F_y=2x^2+g'(y)=2y+2x^2\\Rightarrow g(y)=y^2$.\n$F=x^3+2x^2 y+y^2=C$. $y(0)=1$이면 $C=1$.\n$x=2$에서 $8+8y+y^2=1$, $y^2+8y+7=0$, $y=-1$ 또는 $-7$.\n어느 해든 $y^2+8y=(y^2+8y+7)-7=-7$.",
  },
  {
    n:17, subject:"공학수학", unit:"미분방정식", concept:"공명 비제차 ODE(2중 공명)",
    difficulty:"medium",
    question:"미분방정식 $\\dfrac{d^2 y}{dt^2}+2\\dfrac{dy}{dt}+y=e^{-t}$의 해 $y(t)$가 조건 $y(0)=3,\\,y'(0)=3$을 만족할 때, $y(1)$의 값은?",
    options:opts5("$5e^{-1}$","$\\dfrac{13}{2}e^{-1}$","$8e^{-1}$","$\\dfrac{19}{2}e^{-1}$","$11e^{-1}$"),
    correct:"4",
    explanation:"특성 $(\\lambda+1)^2=0$, 중근 $\\lambda=-1$. 동차해 $y_h=(c_1+c_2 t)e^{-t}$.\n$\\lambda=-1$이 동차해와 2중 공명. 특수해 $y_p=At^2 e^{-t}$. 대입하면 $2A e^{-t}=e^{-t}$, $A=\\dfrac{1}{2}$.\n$y(t)=(c_1+c_2 t+\\dfrac{t^2}{2})e^{-t}$. $y(0)=c_1=3$. $y'(0)=c_2-c_1=3$이므로 $c_2=6$.\n$y(1)=\\!\\left(3+6+\\dfrac{1}{2}\\right)e^{-1}=\\dfrac{19}{2}e^{-1}$.",
  },
  {
    n:18, subject:"공학수학", unit:"미분방정식", concept:"열방정식(분리변수)",
    difficulty:"medium",
    question:"길이가 $1$인 일정한 단면을 갖는 균질한 철사의 양 끝의 온도가 $0\\,^\\circ\\!\\mathrm C$로 고정된다고 하자. 철사의 열 확산율은 $\\dfrac{1}{\\pi^2}$이고 초기 온도가 $2\\sin(3\\pi x)+5\\sin(8\\pi x),\\,(0\\le x\\le 1)$이라고 한다. 열 방정식의 해가 $u(x,t)$일 때, $u\\!\\left(\\dfrac{1}{2},1\\right)$의 값은?",
    options:opts5("$-3e^{-9}$","$-2e^{-9}$","$-e^{-8}$","$2e^{-3}$","$5e^{-3}$"),
    correct:"2",
    explanation:"$u_t=\\dfrac{1}{\\pi^2}u_{xx}$, $u(0,t)=u(1,t)=0$. 분리해 $u=\\sum b_n e^{-(n\\pi)^2/\\pi^2\\cdot t}\\sin(n\\pi x)=\\sum b_n e^{-n^2 t}\\sin(n\\pi x)$.\n초기조건 매칭: $b_3=2,\\,b_8=5$, 나머지 $0$.\n$u(x,t)=2e^{-9t}\\sin(3\\pi x)+5e^{-64t}\\sin(8\\pi x)$.\n$u(1/2,1)=2e^{-9}\\sin(3\\pi/2)+5e^{-64}\\sin(4\\pi)=-2e^{-9}+0=-2e^{-9}$.",
  },
  {
    n:19, subject:"공학수학", unit:"미분방정식", concept:"오일러-코시 비제차",
    difficulty:"medium",
    question:"미분방정식 $x^2 y''+xy'+y=\\ln x\\,(x>0)$의 해 $y(x)$가 조건 $y(1)=e,\\,y(e^{\\pi/2})=\\pi$을 만족할 때, $y(e^{\\pi})$의 값은?",
    options:opts5("$\\pi-2e$","$\\pi-e$","$\\pi+2e$","$2\\pi+e$","$2\\pi+2e$"),
    correct:"2",
    explanation:"$x=e^s$로 치환하면 $\\dfrac{d^2 y}{ds^2}+y=s$ (오일러-코시는 $s$좌표에서 상수계수).\n동차해 $\\cos s,\\sin s$. 특수해 $y_p=s$. 일반해 $y(s)=c_1\\cos s+c_2\\sin s+s$, 즉 $y(x)=c_1\\cos\\ln x+c_2\\sin\\ln x+\\ln x$.\n$y(1)=c_1=e$. $y(e^{\\pi/2})=c_1\\cdot 0+c_2\\cdot 1+\\pi/2=\\pi$이므로 $c_2=\\pi/2$.\n$y(e^{\\pi})=e\\cos\\pi+(\\pi/2)\\sin\\pi+\\pi=-e+0+\\pi=\\pi-e$.",
  },
  {
    n:20, subject:"공학수학", unit:"Laplace변환", concept:"라플라스 + $t$-인수",
    difficulty:"hard",
    question:"미분방정식 $ty''-ty'+y=2$의 해 $y(t)$가 조건 $y(0)=2,\\,y'(0)=-4$를 만족할 때, $y(-5)+y(5)$의 값은?",
    options:opts5("$-2$","$0$","$2$","$4$","$6$"),
    correct:"4",
    explanation:"라플라스: $\\mathcal L\\{ty''\\}=-\\dfrac{d}{ds}[s^2 Y-sy(0)-y'(0)]=-2sY-s^2Y'+y(0)$, $\\mathcal L\\{ty'\\}=-Y-sY'$.\n원식 변환 후 정리: $sY'+2Y=\\dfrac{2}{s}$, 즉 $\\dfrac{d}{ds}(s^2 Y)=2$. $s^2 Y=2s+C$, $Y=\\dfrac{2}{s}+\\dfrac{C}{s^2}$.\n역변환 $y(t)=2+Ct$. $y(0)=2$이고 $y'(0)=C=-4$이므로 $y(t)=2-4t$.\n$y(-5)+y(5)=(2+20)+(2-20)=22-18=4$.",
  },
  {
    n:21, subject:"공학수학", unit:"미분방정식", concept:"1계 선형 ODE 점근비",
    difficulty:"hard",
    question:"미분방정식 $y'=0.02y+10^5\\sin t$의 해 $y(t)$가 초기조건 $y(0)=10^6$을 만족할 때, $\\displaystyle\\lim_{t\\to\\infty}\\dfrac{y(t)}{10^5\\times e^{0.02t}}$의 값은?",
    options:opts5("$\\dfrac{27450}{2503}$","$\\dfrac{27485}{2503}$","$\\dfrac{27485}{2501}$","$\\dfrac{27500}{2501}$","$\\dfrac{27510}{2501}$"),
    correct:"5",
    explanation:"적분인자 $e^{-0.02t}$. $1.0004=\\dfrac{2501}{2500}$임에 주목.\n$y(t)=10^5\\cdot\\dfrac{-0.02\\sin t-\\cos t}{1.0004}+Ce^{0.02t}$.\n$y(0)=10^6$: $-\\dfrac{10^5}{1.0004}+C=10^6$이므로 $C=10^6+\\dfrac{10^5\\cdot 2500}{2501}=\\dfrac{2501\\cdot 10^6+2.5\\cdot 10^8}{2501}=\\dfrac{2751\\cdot 10^6}{2501}$.\n$\\lim\\dfrac{y(t)}{10^5 e^{0.02t}}=\\dfrac{C}{10^5}=\\dfrac{2751\\cdot 10}{2501}=\\dfrac{27510}{2501}$.",
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
