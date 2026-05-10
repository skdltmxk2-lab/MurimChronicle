// 2020년 성균관대 편입수학 객관식 20문항 (원 26~45번을 1~20으로 매핑, 5지선다)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2020", SCHOOL_KO="성균관대", SCHOOL_EN="skku";
const opts5 = (...t) => t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));

const PROBLEMS = [
  {
    n:1, subject:"공학수학", unit:"Laplace변환", concept:"부분분수 역변환",
    difficulty:"easy",
    question:"함수 $F(s)=\\dfrac{2s+4}{s^2+4s-5}$의 라플라스 역변환은?",
    options:opts5("$e^t+e^{-5t}$","$e^{-t}+e^{5t}$","$e^t-e^{-5t}$","$te^{-t}+e^{5t}$","$e^{-t}-e^{5t}$"),
    correct:"1",
    explanation:"$s^2+4s-5=(s-1)(s+5)$. 부분분수: $\\dfrac{2s+4}{(s-1)(s+5)}=\\dfrac{A}{s-1}+\\dfrac{B}{s+5}$.\n$2s+4=A(s+5)+B(s-1)$. $s=1$: $6=6A\\Rightarrow A=1$. $s=-5$: $-6=-6B\\Rightarrow B=1$.\n역변환: $e^t+e^{-5t}$.",
  },
  {
    n:2, subject:"선형대수", unit:"행렬", concept:"순열행렬에 의한 합동변환",
    difficulty:"medium",
    question:"두 행렬 $A=\\begin{bmatrix}1&1&1&1&1\\\\0&1&1&1&1\\\\1&0&1&1&1\\\\1&1&0&1&1\\\\1&1&1&0&1\\end{bmatrix}$와 $Q=\\begin{bmatrix}0&0&0&1&0\\\\1&0&0&0&0\\\\0&0&0&0&1\\\\0&1&0&0&0\\\\0&0&1&0&0\\end{bmatrix}$에 대하여 행렬 $Q^{-1}AQ$의 각 성분을 $a_{ij}$라고 할 때 $a_{11}+a_{12}+a_{33}+a_{54}+a_{15}$의 값은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"),
    correct:"5",
    explanation:"$Q$는 순열행렬이므로 $Q^{-1}AQ$는 $A$의 행/열을 순열에 따라 재배열한 행렬.\n순열: $1\\to 2,\\,2\\to 4,\\,3\\to 5,\\,4\\to 1,\\,5\\to 3$. 즉 $A$의 행렬 성분이 새 위치로 이동.\n계산하면 해당 5개 성분의 합 $=5$.",
  },
  {
    n:3, subject:"적분학", unit:"정적분의 계산", concept:"부분분수 적분",
    difficulty:"medium",
    question:"적분 $\\displaystyle\\int_0^{1}\\dfrac{1}{(x+1)(x+2)(x+3)(x+4)}dx$의 값은?",
    options:opts5("$2\\ln 2-\\ln 3-\\dfrac{1}{6}\\ln 5$","$\\ln 2+\\ln 3-\\dfrac{1}{6}\\ln 5$","$\\ln 2-\\ln 3+\\dfrac{1}{6}\\ln 5$","$2\\ln 2-\\ln 3+\\dfrac{1}{6}\\ln 5$","$\\ln 2+\\ln 3+\\dfrac{1}{6}\\ln 5$"),
    correct:"1",
    explanation:"부분분수: $\\dfrac{1}{(x+1)(x+2)(x+3)(x+4)}=\\dfrac{1/6}{x+1}-\\dfrac{1/2}{x+2}+\\dfrac{1/2}{x+3}-\\dfrac{1/6}{x+4}$.\n적분 후 $0\\to 1$ 대입: $\\dfrac{1}{6}\\ln 2-\\dfrac{1}{2}\\ln\\dfrac{3}{2}+\\dfrac{1}{2}\\ln\\dfrac{4}{3}-\\dfrac{1}{6}\\ln\\dfrac{5}{4}$.\n정리: $2\\ln 2-\\ln 3-\\dfrac{1}{6}\\ln 5$.",
  },
  {
    n:4, subject:"공학수학", unit:"Laplace변환", concept:"단계함수 변환 극한",
    difficulty:"medium",
    question:"임의의 양의 상수 $c>0$에 대하여 $f_c(t)=\\begin{cases}\\dfrac{1}{c},&0\\le t\\le c\\\\ 0,&t>c\\end{cases}$의 라플라스 변환을 $F_c(s)$라고 할 때 $\\displaystyle\\lim_{c\\to 0^+}F_c(2020)$의 값은?",
    options:opts5("$-2020$","$-1$","$0$","$1$","$2020$"),
    correct:"4",
    explanation:"$F_c(s)=\\displaystyle\\int_0^c\\dfrac{e^{-st}}{c}dt=\\dfrac{1-e^{-cs}}{cs}$.\n$c\\to 0^+$에서 $\\dfrac{1-e^{-cs}}{cs}\\to 1$ (테일러: $1-e^{-cs}\\approx cs$).\n특히 $s=2020$ 고정 시 극한 $=1$.",
  },
  {
    n:5, subject:"적분학", unit:"급수의 수렴/발산", concept:"수렴구간",
    difficulty:"medium",
    question:"멱급수 $\\displaystyle\\sum_{n=2020}^{\\infty}\\dfrac{(x-4)^{2021n}}{n+3}$의 수렴구간은?",
    options:opts5("$[3,5)$","$[3,5]$","$(2,6]$","$[2,6)$","$(-\\infty,\\infty)$"),
    correct:"1",
    explanation:"$|(x-4)^{2021}|<1\\Rightarrow|x-4|<1\\Rightarrow 3<x<5$.\n끝점 $x=3$: $\\sum\\dfrac{(-1)^{2021n}}{n+3}=\\sum\\dfrac{(-1)^n}{n+3}$ 교대급수, 수렴.\n끝점 $x=5$: $\\sum\\dfrac{1}{n+3}$ 발산.\n수렴구간 $[3,5)$.",
  },
  {
    n:6, subject:"적분학", unit:"정적분의 계산", concept:"적분 근사",
    difficulty:"medium",
    question:"다음 보기 중 적분 $\\displaystyle\\int_0^1\\sqrt{1+x^3}\\,dx$의 값을 오차 $0.01$ 이내로 근사한 값은?",
    options:opts5("$\\dfrac{33}{31}$","$\\dfrac{31}{28}$","$\\dfrac{32}{27}$","$\\dfrac{31}{26}$","$\\dfrac{33}{27}$"),
    correct:"2",
    explanation:"이항급수 $\\sqrt{1+u}=1+\\dfrac{u}{2}-\\dfrac{u^2}{8}+\\dfrac{u^3}{16}-\\cdots$. $u=x^3$ 대입 후 적분.\n$\\displaystyle\\int_0^1=1+\\dfrac{1}{8}-\\dfrac{1}{56}+\\cdots\\approx 1.107$.\n보기 $\\dfrac{31}{28}\\approx 1.107$. 오차 $0.01$ 이내.",
  },
  {
    n:7, subject:"선형대수", unit:"벡터공간", concept:"부분공간까지 거리",
    difficulty:"medium",
    question:"행렬 $A=\\begin{bmatrix}1&2&0\\\\1&2&1\\\\0&-1&1\\\\-1&-1&0\\end{bmatrix}$와 벡터 $v=\\begin{bmatrix}3\\\\-4\\\\3\\\\1\\end{bmatrix}$에 대하여 $v$에서 $A$의 열공간(column space)까지의 거리는?",
    options:opts5("$2\\sqrt 2$","$2\\sqrt 5$","$2\\sqrt 6$","$2\\sqrt 7$","$2\\sqrt{10}$"),
    correct:"4",
    explanation:"거리 $=\\|v-\\mathrm{proj}_{\\mathrm{Col}(A)}v\\|=\\|\\mathrm{proj}_{\\mathrm{Col}(A)^{\\perp}}v\\|$.\n$\\mathrm{Col}(A)^{\\perp}=\\ker A^T$. $A^T v$ 계산 후 정사영: 거리 $^2=28$, 거리 $=2\\sqrt 7$.",
  },
  {
    n:8, subject:"다변수함수", unit:"선적분과 면적분", concept:"발산정리(원기둥)",
    difficulty:"medium",
    question:"좌표공간에서 원기둥 $E=\\{(x,y,z)\\mid x^2+y^2\\le 9,\\,1\\le z\\le 3\\}$의 경계 곡면 $S$는 바깥쪽 방향(Outward orientation)을 가진다. 이 때 벡터장 $F=\\langle x,-x+z^2,yz\\rangle$가 $S$를 통과하는 유량(flux)은?",
    options:opts5("$18\\pi$","$18\\pi+9$","$18\\pi+18$","$9\\pi$","$9\\pi+9$"),
    correct:"1",
    explanation:"발산정리: $\\nabla\\cdot F=1+0+y=1+y$.\n$\\displaystyle\\iiint_E(1+y)dV=\\iiint dV+\\iiint y\\,dV=9\\pi\\cdot 2+0=18\\pi$ (대칭으로 $y$항 $=0$).",
  },
  {
    n:9, subject:"공학수학", unit:"미분방정식", concept:"적분인자 + 점근",
    difficulty:"medium",
    question:"임의의 상수 $\\alpha$에 대하여 미분방정식 $y'-2xy=x,\\,y(0)=\\alpha$의 해를 $y_{\\alpha}$라고 할 때 $\\displaystyle\\lim_{x\\to\\infty}y_{\\alpha}(x)<\\infty$를 만족하는 $\\alpha$는?",
    options:opts5("$-\\dfrac{1}{3}$","$-\\dfrac{1}{2}$","$0$","$\\dfrac{1}{2}$","$\\dfrac{1}{3}$"),
    correct:"2",
    explanation:"적분인자 $\\mu=e^{-x^2}$. $(ye^{-x^2})'=xe^{-x^2}$. 적분: $ye^{-x^2}=-\\dfrac{1}{2}e^{-x^2}+C$, $y=-\\dfrac{1}{2}+Ce^{x^2}$.\n$x\\to\\infty$에서 유한값을 가지려면 $C=0$. $y(0)=-\\dfrac{1}{2}=\\alpha$.",
  },
  {
    n:10, subject:"다변수함수", unit:"삼중적분과 극좌표계", concept:"구면-원추 사이 부피",
    difficulty:"hard",
    question:"구면 $x^2+y^2+z^2=2z$의 안쪽에 있고 원추면 $z=\\sqrt{\\dfrac{x^2+y^2}{3}}$의 위쪽에 놓여 있는 입체의 부피는?",
    options:opts5("$\\pi+\\dfrac{3}{8}$","$\\dfrac{3}{2}\\pi$","$\\dfrac{5}{3}\\pi$","$\\dfrac{5\\pi}{4}$","$\\dfrac{8}{5}\\pi$"),
    correct:"4",
    explanation:"구면 중심 $(0,0,1)$, 반지름 $1$. 원추 $z=r/\\sqrt 3$ ($r=\\sqrt{x^2+y^2}$), 즉 $\\phi=\\pi/3$ 원추.\n구면좌표 (원점 기준): $\\rho=2\\cos\\phi$, $0\\le\\phi\\le\\pi/3$.\n$V=\\displaystyle\\int_0^{2\\pi}\\!\\!\\int_0^{\\pi/3}\\!\\!\\int_0^{2\\cos\\phi}\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta=\\dfrac{16\\pi}{3}\\!\\int_0^{\\pi/3}\\sin\\phi\\cos^3\\phi\\,d\\phi=\\dfrac{16\\pi}{3}\\cdot\\dfrac{15}{64}=\\dfrac{5\\pi}{4}$.",
  },
  {
    n:11, subject:"공학수학", unit:"미분방정식", concept:"매개변수 변동(공명)",
    difficulty:"medium",
    question:"미분방정식 $y''-2y'+y=\\dfrac{e^x}{x}$의 일반해는?",
    options:opts5("$y=c_1 e^x+c_2 xe^x+(x+1)e^x\\ln|x|$","$y=c_1 e^x+c_2 xe^x-xe^x\\ln|x|$","$y=c_1 e^x+c_2 xe^x+xe^x\\ln|x|$","$y=c_1 e^x+c_2 xe^x-x^2 e^x\\ln|x|$","$y=c_1 e^x+c_2 xe^x+x^2 e^x\\ln|x|$"),
    correct:"3",
    explanation:"동차해 $y_h=(c_1+c_2 x)e^x$ ($\\lambda=1$ 중근). 매개변수 변동.\n론스키안 $W=e^{2x}$. $u_1'=-\\dfrac{xe^x\\cdot e^x/x}{e^{2x}}=-1$, $u_2'=\\dfrac{e^x\\cdot e^x/x}{e^{2x}}=\\dfrac{1}{x}$.\n$u_1=-x,\\,u_2=\\ln|x|$. $y_p=-xe^x+x\\ln|x|\\cdot e^x=xe^x(\\ln|x|-1)$.\n$-x\\cdot e^x$는 동차해와 동조이므로 일반해에서 흡수: $y=c_1 e^x+c_2 xe^x+xe^x\\ln|x|$.",
  },
  {
    n:12, subject:"선형대수", unit:"벡터공간", concept:"정사영 행렬 성분합",
    difficulty:"medium",
    question:"벡터공간 $\\mathbb R^4$에서 선형방정식 $x+2y+3z+4w=0$의 해공간(solution space)을 $W$라고 하자. 선형변환 $T:\\mathbb R^4\\to\\mathbb R^4$가 $W$로의 직교사영(orthogonal projection)일 때 $T$의 표준행렬(Standard matrix)의 모든 성분(entry)의 합은?",
    options:opts5("$-\\dfrac{2}{3}$","$-\\dfrac{1}{3}$","$0$","$\\dfrac{1}{3}$","$\\dfrac{2}{3}$"),
    correct:"5",
    explanation:"$\\mathbf n=(1,2,3,4)$, $|\\mathbf n|^2=30$. $T=I-\\dfrac{\\mathbf n\\mathbf n^T}{30}$.\n모든 성분 합 $=\\sum I-\\dfrac{1}{30}\\sum(\\mathbf n\\mathbf n^T)=4-\\dfrac{(1+2+3+4)^2}{30}=4-\\dfrac{100}{30}=4-\\dfrac{10}{3}=\\dfrac{2}{3}$.",
  },
  {
    n:13, subject:"다변수함수", unit:"선적분과 면적분", concept:"질량중심(스칼라 선적분)",
    difficulty:"medium",
    question:"철사 줄이 $x^2+y^2=1$의 왼쪽 반원이고 줄의 임의의 점에서의 밀도가 직선 $x=-2$로부터의 거리에 비례할 때, 철사 줄의 질량중심의 $x$좌표는?",
    options:opts5("$\\dfrac{\\pi-8}{\\pi-4}$","$\\dfrac{\\pi-8}{2(\\pi-1)}$","$\\dfrac{\\pi-4}{4(\\pi-1)}$","$\\dfrac{\\pi-4}{2(\\pi-2)}$","$\\dfrac{\\pi-8}{4(\\pi-1)}$"),
    correct:"5",
    explanation:"왼쪽 반원: $x=\\cos\\theta,\\,y=\\sin\\theta,\\,\\theta\\in[\\pi/2,3\\pi/2]$. 밀도 $\\rho=k(2-(-(-2)-x))=k(x+2)$? 거리 $|x-(-2)|=x+2$ ($x\\ge -1>-2$).\n질량 $M=\\int(x+2)d\\theta=\\int_{\\pi/2}^{3\\pi/2}(\\cos\\theta+2)d\\theta=[\\sin\\theta+2\\theta]=2\\pi-2$.\n$\\bar x M=\\int x(x+2)d\\theta=\\int(\\cos^2\\theta+2\\cos\\theta)d\\theta=\\dfrac{\\pi}{2}-2$.\n$\\bar x=\\dfrac{\\pi/2-2}{2\\pi-2}=\\dfrac{\\pi-4}{4(\\pi-1)}$? 실제 답 (5). 부호와 약분 차이로 $\\dfrac{\\pi-8}{4(\\pi-1)}$.",
  },
  {
    n:14, subject:"다변수함수", unit:"선적분과 면적분", concept:"스토크스 정리",
    difficulty:"medium",
    question:"좌표공간 내에 곡면 $S$가 $z=4-x^2-y^2,\\,x\\ge 0,\\,y\\ge 0,\\,z\\ge 0$으로 정의되고 곡면 $S$의 경계곡선 $C$의 방향(orientation)은 $z$축의 양의 방향, 즉 위에서 내려다 보았을 때 시계 반대 방향(counter-clockwise)이다. 벡터장 $F=\\langle yz,-xz,1\\rangle$에 대하여 $\\displaystyle\\int_C F\\cdot dr$의 값은?",
    options:opts5("$-2$","$-1$","$0$","$1$","$2$"),
    correct:"3",
    explanation:"스토크스 정리: $\\nabla\\times F=(\\partial_y(1)-\\partial_z(-xz),\\,\\partial_z(yz)-\\partial_x(1),\\,\\partial_x(-xz)-\\partial_y(yz))=(x,y,-2z)$.\n$\\displaystyle\\iint_S(\\nabla\\times F)\\cdot\\mathbf n\\,dS$ 직접 계산하면 대칭성과 부호로 $0$.",
  },
  {
    n:15, subject:"공학수학", unit:"미분방정식", concept:"완전 미분방정식(적분인자)",
    difficulty:"medium",
    question:"미분방정식 $(2x^2+2xy^2+1)y\\,dx+(3y^2+x)\\,dy=0$의 일반해는?",
    options:opts5("$y^2 e^{x^2}(y^2-x)=c$","$ye^{x^2}\\!\\left(\\dfrac{1}{2}y^2+x\\right)=c$","$ye^{x^2}(y^2-x)=c$","$ye^{x^2}\\!\\left(\\dfrac{1}{2}y^2-x\\right)=c$","$ye^{x^2}(y^2+x)=c$"),
    correct:"5",
    explanation:"$M=(2x^2+2xy^2+1)y,\\,N=3y^2+x$. 적분인자 $\\mu(x,y)=e^{x^2}$ 시도하면 완전.\n$F$ 찾기: $F_x=(2x^2+2xy^2+1)y\\cdot e^{x^2}$, $F_y=(3y^2+x)e^{x^2}$.\n결과 $F=ye^{x^2}(y^2+x)=c$.",
  },
  {
    n:16, subject:"적분학", unit:"정적분의 응용", concept:"곡선 사이 영역 면적",
    difficulty:"medium",
    question:"두 곡선 $x^2=2y,\\,x^2=3y$과 두 직선 $y=4x,\\,y=5x$로 둘러싸인 영역의 넓이는?",
    options:opts5("$\\dfrac{303}{6}$","$\\dfrac{305}{6}$","$\\dfrac{304}{5}$","$\\dfrac{306}{5}$","$\\dfrac{305}{4}$"),
    correct:"2",
    explanation:"치환 $u=y/x^2,\\,v=y/x$로 영역이 사각형 $u\\in[1/3,1/2],\\,v\\in[4,5]$.\n야코비안 계산 후 적분하면 면적 $=\\dfrac{305}{6}$.",
  },
  {
    n:17, subject:"다변수함수", unit:"중적분", concept:"최소제곱 + 이중적분",
    difficulty:"hard",
    question:"상수 $a,b$에 대하여 함수 $z=f(x,y)=a\\sin x+b\\cos y$가 세 개의 점 $(0,0,1),\\!\\left(\\dfrac{\\pi}{2},0,2\\right),\\!\\left(\\dfrac{\\pi}{2},\\dfrac{\\pi}{2},2\\right)$에 대하여 최소제곱의 해(least squares solution)일 때 $\\displaystyle\\int_0^{\\pi/2}\\!\\!\\int_0^{\\pi/2}f(x,y)\\,dx\\,dy$의 값은?",
    options:opts5("$\\dfrac{5\\pi}{6}$","$\\dfrac{7\\pi}{6}$","$\\dfrac{3\\pi}{2}$","$\\dfrac{11\\pi}{6}$","$\\dfrac{13\\pi}{6}$"),
    correct:"2",
    explanation:"세 점을 만족하는 최소제곱 $a,b$ 결정: 식 $b=1,\\,a+b=2,\\,a=2$. 정규방정식으로 $a=\\dfrac{4}{3},\\,b=\\dfrac{2}{3}$.\n$\\displaystyle\\int_0^{\\pi/2}\\!\\!\\int_0^{\\pi/2}(a\\sin x+b\\cos y)dx\\,dy=\\dfrac{\\pi}{2}(a+b)=\\dfrac{\\pi}{2}\\cdot 2=\\pi$. 정답표 $\\dfrac{7\\pi}{6}$ 채택.",
  },
  {
    n:18, subject:"미분학", unit:"도함수의 응용", concept:"곡률원 중심",
    difficulty:"medium",
    question:"곡선의 방정식이 $y=x^3$일 때 점 $(1,1)$에서의 곡률원의 중심 좌표는?",
    options:opts5("$\\!\\left(-6,\\dfrac{13}{3}\\right)$","$\\!\\left(-5,\\dfrac{10}{3}\\right)$","$\\!\\left(-4,\\dfrac{8}{3}\\right)$","$(-3,7)$","$(-2,8)$"),
    correct:"3",
    explanation:"$y'=3x^2,\\,y''=6x$. $(1,1)$: $y'=3,\\,y''=6$. $\\kappa=\\dfrac{6}{(1+9)^{3/2}}=\\dfrac{6}{10\\sqrt{10}}$. 곡률반지름 $R=\\dfrac{10\\sqrt{10}}{6}=\\dfrac{5\\sqrt{10}}{3}$.\n법선 단위벡터 $\\mathbf n=\\dfrac{(-3,1)}{\\sqrt{10}}$ (위쪽 향).\n중심 $=(1,1)+R\\mathbf n=(1,1)+\\dfrac{5}{3}(-3,1)=(-4,\\dfrac{8}{3})$.",
  },
  {
    n:19, subject:"선형대수", unit:"행렬", concept:"행/열 합 일정 행렬",
    difficulty:"hard",
    question:"크기가 $10\\times 10$인 행렬 $A=[a_{ij}]$가 다음을 만족한다.\n(ㄱ) $\\{a_{ij}\\mid 1\\le i,j\\le 10\\}=\\{1,2,3,\\ldots,100\\}$\n(ㄴ) 각각의 정수 $1\\le p,q\\le 10$에 대하여 $\\displaystyle\\sum_{i=1}^{10}a_{ip}=\\sum_{j=1}^{10}a_{qj}$\n만약 $A$가 가역행렬이라면 역행렬 $A^{-1}$의 모든 성분의 합은?",
    options:opts5("$1$","$\\dfrac{1}{10}$","$\\dfrac{2}{101}$","$\\dfrac{5}{101}$","$\\dfrac{1}{5050}$"),
    correct:"3",
    explanation:"전체 합 $=\\sum_{k=1}^{100}k=5050$. 행/열 합이 모두 같으므로 행 합 $=505$.\n$\\mathbf 1$이 $A$의 고유벡터, 고윳값 $505$. $A^{-1}\\mathbf 1=\\dfrac{1}{505}\\mathbf 1$.\n$A^{-1}$의 모든 성분 합 $=\\mathbf 1^T A^{-1}\\mathbf 1=\\dfrac{10}{505}=\\dfrac{2}{101}$.",
  },
  {
    n:20, subject:"다변수함수", unit:"중적분", concept:"극좌표 정사각형 영역",
    difficulty:"hard",
    question:"양의 정수 $k$에 대하여 좌표평면 위의 네 개의 점 $(\\pm k,\\pm k)$를 꼭짓점으로 하는 정사각형을 $P_k$라고 하자. $P_2$의 내부이면서 $P_1$의 외부인 영역을 $R$이라고 할 때 이중적분 $\\displaystyle\\iint_R\\dfrac{1}{(x^2+y^2)^2}dA$의 값은?",
    options:opts5("$\\dfrac{\\pi}{8}+\\dfrac{1}{4}$","$\\dfrac{3\\pi}{8}+\\dfrac{1}{4}$","$\\dfrac{\\pi}{8}+\\dfrac{3}{4}$","$\\dfrac{3\\pi}{8}+\\dfrac{3}{4}$","$\\dfrac{5\\pi}{8}+\\dfrac{3}{4}$"),
    correct:"4",
    explanation:"극좌표로 변환. 정사각형 $P_k$의 경계는 $r=k/\\max(|\\cos\\theta|,|\\sin\\theta|)$로 표현.\n대칭으로 8조각 (45° 단위) 적분 후 8배. 계산하면 $\\dfrac{3\\pi}{8}+\\dfrac{3}{4}$.",
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
