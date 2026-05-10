// 2019년 성균관대 편입수학 객관식 20문항 (원 26~45번을 1~20으로 매핑, 5지선다)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2019", SCHOOL_KO="성균관대", SCHOOL_EN="skku";
const opts5 = (...t) => t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));

const PROBLEMS = [
  {
    n:1, subject:"미분학", unit:"극한과 연속", concept:"$\\ln$ 비교 극한",
    difficulty:"easy",
    question:"극한 $\\displaystyle\\lim_{x\\to\\infty}\\dfrac{(\\ln(x+1))^3}{x\\ln x}$의 값은?",
    options:opts5("$0$","$e$","$1$","$\\dfrac{1}{2}$","$\\dfrac{1}{e}$"),
    correct:"1",
    explanation:"$x\\to\\infty$에서 $\\ln(x+1)\\sim\\ln x$이므로 $\\dfrac{(\\ln(x+1))^3}{x\\ln x}\\sim\\dfrac{(\\ln x)^3}{x\\ln x}=\\dfrac{(\\ln x)^2}{x}\\to 0$.\n로피탈 또는 $\\ln x=t$ 치환으로 확인 가능.",
  },
  {
    n:2, subject:"다변수함수", unit:"선적분과 면적분", concept:"그린정리",
    difficulty:"easyMedium",
    question:"닫힌 곡선 $C$가 좌표평면에서 식 $x^2+y^2=16$으로 정의되고 반시계 방향을 갖는다고 할 때, 다음 선적분의 값은?\n$\\displaystyle\\oint_C(3y-\\sin x)\\,dx+(7x+y^{2019})\\,dy$",
    options:opts5("$16\\pi$","$32\\pi$","$48\\pi$","$64\\pi$","$80\\pi$"),
    correct:"4",
    explanation:"그린정리: $P=3y-\\sin x,\\,Q=7x+y^{2019}$. $Q_x-P_y=7-3=4$.\n$\\displaystyle\\oint_C P\\,dx+Q\\,dy=\\iint_D 4\\,dA=4\\cdot\\pi\\cdot 4^2=64\\pi$.",
  },
  {
    n:3, subject:"적분학", unit:"부정적분", concept:"부분적분 (로그)",
    difficulty:"medium",
    question:"상수 $a,b,c$에 대하여 다음의 식이 성립할 때 합 $a+b+c$의 값은?\n$\\displaystyle\\int\\!\\left(2x+\\dfrac{1}{x}\\right)\\ln x\\,dx=ax^2\\ln x+b(\\ln x)^2+cx^2+(\\text{적분상수})$",
    options:opts5("$-1$","$-\\dfrac{1}{2}$","$0$","$\\dfrac{1}{2}$","$1$"),
    correct:"5",
    explanation:"분리: $\\displaystyle\\int 2x\\ln x\\,dx+\\int\\dfrac{\\ln x}{x}dx$.\n첫째: 부분적분 $u=\\ln x,\\,dv=2x\\,dx$로 $x^2\\ln x-\\!\\int x\\,dx=x^2\\ln x-\\dfrac{x^2}{2}$.\n둘째: $\\dfrac{(\\ln x)^2}{2}$.\n합 $=x^2\\ln x+\\dfrac{(\\ln x)^2}{2}-\\dfrac{x^2}{2}+C$. $a=1,\\,b=\\dfrac{1}{2},\\,c=-\\dfrac{1}{2}$.\n$a+b+c=1$.",
  },
  {
    n:4, subject:"공학수학", unit:"미분방정식", concept:"분리형 ODE",
    difficulty:"easy",
    question:"$y$가 미분방정식 $y'+ty=0$의 해이고 $y(0)=1$일 때 $\\dfrac{\\sqrt{y(2)}}{(y(1))^2}$의 값은?",
    options:opts5("$0$","$1$","$\\dfrac{\\sqrt 2}{4}$","$\\dfrac{\\sqrt 3}{3}$","$\\dfrac{\\sqrt e}{9}$"),
    correct:"2",
    explanation:"$\\dfrac{dy}{y}=-t\\,dt\\Rightarrow\\ln y=-\\dfrac{t^2}{2}+C$. $y(0)=1$이면 $C=0$. $y(t)=e^{-t^2/2}$.\n$\\sqrt{y(2)}=\\sqrt{e^{-2}}=e^{-1}$. $(y(1))^2=(e^{-1/2})^2=e^{-1}$.\n비 $=\\dfrac{e^{-1}}{e^{-1}}=1$.",
  },
  {
    n:5, subject:"미분학", unit:"도함수의 응용", concept:"평면곡선 곡률",
    difficulty:"easy",
    question:"평면 위의 곡선 $y=x^2$ 위의 점 $(1,1)$에서 곡률의 값은?",
    options:opts5("$\\dfrac{1}{5}$","$\\dfrac{2}{5\\sqrt 7}$","$\\dfrac{3}{5}$","$\\dfrac{2}{5\\sqrt 5}$","$1$"),
    correct:"4",
    explanation:"$y'=2x,\\,y''=2$. $(1,1)$: $y'=2$.\n$\\kappa=\\dfrac{|y''|}{(1+y'^2)^{3/2}}=\\dfrac{2}{(1+4)^{3/2}}=\\dfrac{2}{5\\sqrt 5}$.",
  },
  {
    n:6, subject:"공학수학", unit:"미분방정식", concept:"로지스틱 방정식",
    difficulty:"medium",
    question:"$y$가 미분방정식 $y'=y(1-y),\\,y(0)=\\dfrac{1}{2}$의 해일 때 $y(1)$의 값은?",
    options:opts5("$1$","$e$","$\\dfrac{e}{e+1}$","$\\dfrac{e+1}{e}$","$0$"),
    correct:"3",
    explanation:"로지스틱 해 $y=\\dfrac{1}{1+Ce^{-t}}$. $y(0)=\\dfrac{1}{1+C}=\\dfrac{1}{2}\\Rightarrow C=1$.\n$y(t)=\\dfrac{1}{1+e^{-t}}$. $y(1)=\\dfrac{1}{1+e^{-1}}=\\dfrac{e}{e+1}$.",
  },
  {
    n:7, subject:"선형대수", unit:"행렬", concept:"행렬 성질 진위",
    difficulty:"medium",
    question:"실수 성분을 갖는 행렬 $A$에 대하여, 다음 중 옳지 <u>않은</u> 것은?\n(1) $A$가 대칭행렬일 때, $A$의 열공간(column space)과 영공간(null space)은 서로 직교(orthogonal)한다.\n(2) 행렬 $A=\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix}$는 대각화가능(diagonalizable) 하지 않다.\n(3) 행렬식 $Ax=b$의 해가 존재하지 않는다면, 행렬식 $Ax=0$은 자명해(trivial solution)만을 가진다.\n(4) 가역행렬 $A$와 $A^{-1}$의 성분이 모두 정수라면, $\\det(A)$의 값은 $1$ 또는 $-1$이다.\n(5) $A$와 단위행렬 $I$가 서로 닮은(similar) 행렬이면, $A=I$이다.",
    options:opts5("(1)","(2)","(3)","(4)","(5)"),
    correct:"3",
    explanation:"(3) 거짓: $Ax=b$의 해 존재성과 $Ax=0$의 자명해 여부는 별개. 예를 들어 $A$가 정방행렬이 아니면 둘 다 비자명해를 가질 수 있음.\n나머지: (1) 대칭행렬은 $\\mathrm{Im}(A)=(\\ker A)^{\\perp}$. (2) Jordan block 비대각화. (4) $\\det A\\cdot\\det A^{-1}=1$이고 둘 다 정수. (5) $A=PIP^{-1}=I$.",
  },
  {
    n:8, subject:"적분학", unit:"Maclaurin급수의 응용", concept:"고계도함수 합",
    difficulty:"medium",
    question:"함수 $f(x)=\\cos(x^3)$에 대하여 $\\displaystyle\\sum_{i=1}^{15}\\dfrac{f^{(i)}(0)}{i!}$의 값은?",
    options:opts5("$-\\dfrac{29}{24}$","$-\\dfrac{23}{24}$","$-\\dfrac{17}{24}$","$-\\dfrac{11}{24}$","$-\\dfrac{5}{24}$"),
    correct:"4",
    explanation:"$\\cos(x^3)=1-\\dfrac{x^6}{2!}+\\dfrac{x^{12}}{4!}-\\cdots=\\sum a_i x^i$, 여기서 $a_i=\\dfrac{f^{(i)}(0)}{i!}$.\n비영 항: $a_0=1,\\,a_6=-\\dfrac{1}{2},\\,a_{12}=\\dfrac{1}{24}$, 그 외는 $0$ ($i\\le 15$).\n$\\displaystyle\\sum_{i=1}^{15}a_i=-\\dfrac{1}{2}+\\dfrac{1}{24}=\\dfrac{-12+1}{24}=-\\dfrac{11}{24}$.",
  },
  {
    n:9, subject:"공학수학", unit:"미분방정식", concept:"적분방정식 → 2계 ODE",
    difficulty:"medium",
    question:"$y$가 미분방정식 $y'(t)=y(t)+1+2\\!\\displaystyle\\int_0^t y(s)\\,ds,\\,y'(0)=2$의 해일 때 $y(1)$의 값은?",
    options:opts5("$e^2$","$e$","$\\sqrt e$","$e-e^2$","$e+e^2$"),
    correct:"1",
    explanation:"양변을 미분: $y''=y'+2y$. 즉 $y''-y'-2y=0$.\n원식 $t=0$ 대입: $y'(0)=y(0)+1+0\\Rightarrow y(0)=2-1=1$.\n특성 $\\lambda^2-\\lambda-2=(\\lambda-2)(\\lambda+1)$. 일반해 $y=Ae^{2t}+Be^{-t}$.\n$A+B=1,\\,2A-B=2\\Rightarrow A=1,\\,B=0$. $y(t)=e^{2t}$. $y(1)=e^2$.",
  },
  {
    n:10, subject:"선형대수", unit:"고유치와 대각화", concept:"행렬 거듭제곱 trace",
    difficulty:"medium",
    question:"행렬 $A=\\begin{bmatrix}0&1&1&1\\\\1&0&1&1\\\\1&1&0&1\\\\1&1&1&0\\end{bmatrix}$에 대하여, $A^6$의 대각합 $\\mathrm{tr}(A^6)$의 값은?",
    options:opts5("$731$","$732$","$733$","$734$","$735$"),
    correct:"2",
    explanation:"$A=J-I$ (단, $J$는 $4\\times 4$ 모두 1인 행렬). $J$의 고윳값은 $4$ (1중복), $0$ (3중복).\n$A=J-I$의 고윳값은 $3$ (1중복), $-1$ (3중복).\n$\\mathrm{tr}(A^6)=3^6+3\\cdot(-1)^6=729+3=732$.",
  },
  {
    n:11, subject:"다변수함수", unit:"체적과 곡면적", concept:"구면 캡 면적",
    difficulty:"easy",
    question:"좌표공간 내의 곡면 $x^2+y^2+z^2=1$에서 $z\\ge 0$인 부분 중, 평면 $z=\\dfrac{1}{2}$의 윗부분에 놓인 곡면의 넓이의 값은?",
    options:opts5("$\\pi$","$\\dfrac{3\\pi}{2}$","$2\\pi$","$\\dfrac{5\\pi}{2}$","$3\\pi$"),
    correct:"1",
    explanation:"구면 캡 면적 공식 $S=2\\pi Rh$ ($h$는 캡의 높이).\n$R=1,\\,h=1-\\dfrac{1}{2}=\\dfrac{1}{2}$. $S=2\\pi\\cdot 1\\cdot\\dfrac{1}{2}=\\pi$.",
  },
  {
    n:12, subject:"선형대수", unit:"벡터공간", concept:"부분공간 정사영",
    difficulty:"medium",
    question:"벡터공간 $\\mathbb R^4$에서 선형방정식 $2x_1-x_3+x_4=0$의 해공간(solution space)을 $W$라고 할 때, 점 $(1,1,1,1)$을 $W$로 직교사영(orthogonal projection) 시킨 점은?",
    options:opts5("$\\!\\left(-\\dfrac{1}{3},1,\\dfrac{2}{3},\\dfrac{4}{3}\\right)$","$\\!\\left(\\dfrac{1}{3},1,\\dfrac{2}{3},\\dfrac{4}{3}\\right)$","$\\!\\left(\\dfrac{2}{3},1,\\dfrac{1}{3},\\dfrac{4}{3}\\right)$","$\\!\\left(\\dfrac{2}{3},1,-\\dfrac{1}{3},\\dfrac{1}{3}\\right)$","$\\!\\left(\\dfrac{1}{3},1,\\dfrac{4}{3},\\dfrac{2}{3}\\right)$"),
    correct:"5",
    explanation:"법선벡터 $\\mathbf n=(2,0,-1,1)$, $|\\mathbf n|^2=6$. 점 $\\mathbf p=(1,1,1,1)$.\n$\\mathbf p\\cdot\\mathbf n=2-1+1=2$. 사영 보정 $\\dfrac{2}{6}\\mathbf n=\\!\\left(\\dfrac{2}{3},0,-\\dfrac{1}{3},\\dfrac{1}{3}\\right)$.\n$W$ 사영 $=\\mathbf p-$보정 $=\\!\\left(\\dfrac{1}{3},1,\\dfrac{4}{3},\\dfrac{2}{3}\\right)$.",
  },
  {
    n:13, subject:"공학수학", unit:"Laplace변환", concept:"초기값 정리",
    difficulty:"easy",
    question:"$y$는 미분방정식 $2y''-3y'+y=0,\\,y(0)=y'(0)=1$의 해이다. $y$의 라플라스 변환을 $L[y](s)$라 할 때 $\\displaystyle\\lim_{s\\to\\infty}\\{sL[y](s)\\}$의 값은?",
    options:opts5("$-1$","$0$","$e$","$1$","$\\pi$"),
    correct:"4",
    explanation:"라플라스 초기값 정리: $\\displaystyle\\lim_{s\\to\\infty}sY(s)=y(0^+)$.\n$y(0)=1$이므로 극한 $=1$.",
  },
  {
    n:14, subject:"다변수함수", unit:"중적분", concept:"변수치환(평행사변형)",
    difficulty:"medium",
    question:"네 개의 직선 $2x-y=0,\\,2x-y=2,\\,x-2y=1,\\,x-2y=3$에 의해 둘러싸인 영역 $R$에 대하여, $\\displaystyle\\iint_R\\!\\left(\\dfrac{2x-y}{x-2y}\\right)dA$의 값은?",
    options:opts5("$\\dfrac{\\ln 3}{3}$","$\\dfrac{2\\ln 3}{3}$","$\\ln 3$","$\\dfrac{4\\ln 3}{3}$","$\\dfrac{5\\ln 3}{3}$"),
    correct:"2",
    explanation:"$u=2x-y,\\,v=x-2y$로 치환. 야코비안 $\\dfrac{\\partial(u,v)}{\\partial(x,y)}=\\det\\!\\begin{pmatrix}2&-1\\\\1&-2\\end{pmatrix}=-3$, $|J|^{-1}=\\dfrac{1}{3}$.\n$\\displaystyle\\iint_R\\dfrac{u}{v}\\cdot\\dfrac{1}{3}\\,du\\,dv=\\dfrac{1}{3}\\!\\int_0^2\\!\\!\\int_1^3\\dfrac{u}{v}dv\\,du=\\dfrac{1}{3}\\!\\left[\\dfrac{u^2}{2}\\right]_0^2[\\ln v]_1^3=\\dfrac{1}{3}\\cdot 2\\cdot\\ln 3=\\dfrac{2\\ln 3}{3}$.",
  },
  {
    n:15, subject:"선형대수", unit:"고유치와 대각화", concept:"성분합과 고유벡터",
    difficulty:"medium",
    question:"행렬 $A=\\begin{bmatrix}1&4\\\\2&3\\end{bmatrix}$와 자연수 $n$에 대하여, $A^n$의 모든 성분의 합을 $a_n$이라고 할 때, $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{1}{a_n}$의 값은?",
    options:opts5("$\\dfrac{1}{8}$","$\\dfrac{1}{4}$","$\\dfrac{3}{8}$","$\\dfrac{1}{2}$","$\\dfrac{5}{8}$"),
    correct:"1",
    explanation:"$\\mathbf 1=(1,1)^T$. $A\\mathbf 1=(5,5)^T=5\\mathbf 1$이므로 $\\mathbf 1$은 고유값 $5$의 고유벡터.\n$A^n\\mathbf 1=5^n\\mathbf 1$. 성분합 $a_n=\\mathbf 1^T A^n\\mathbf 1=5^n\\cdot 2=2\\cdot 5^n$.\n$\\displaystyle\\sum_{n=1}^\\infty\\dfrac{1}{2\\cdot 5^n}=\\dfrac{1}{2}\\cdot\\dfrac{1/5}{1-1/5}=\\dfrac{1}{2}\\cdot\\dfrac{1}{4}=\\dfrac{1}{8}$.",
  },
  {
    n:16, subject:"공학수학", unit:"미분방정식", concept:"완전 미분방정식 해집합",
    difficulty:"easyMedium",
    question:"다음 중 미분방정식 $(e^{2y}-y)\\dfrac{dy}{dx}=\\sin x,\\,y(0)=0$의 해집합 위에 있는 점은?",
    options:opts5("$(1,2)$","$(2,3)$","$(2\\pi,0)$","$(2\\pi,1)$","$(\\pi,2)$"),
    correct:"3",
    explanation:"분리형: $(e^{2y}-y)\\,dy=\\sin x\\,dx$. 적분: $\\dfrac{e^{2y}}{2}-\\dfrac{y^2}{2}=-\\cos x+C$.\n$y(0)=0$: $\\dfrac{1}{2}-0=-1+C$, $C=\\dfrac{3}{2}$.\n점 $(2\\pi,0)$ 검증: 좌변 $\\dfrac{1}{2}-0=\\dfrac{1}{2}$, 우변 $-1+\\dfrac{3}{2}=\\dfrac{1}{2}$ ✓.",
  },
  {
    n:17, subject:"다변수함수", unit:"선적분과 면적분", concept:"발산정리(반구)",
    difficulty:"hard",
    question:"곡면 $S$는 단위구면 $x^2+y^2+z^2=1$에서 $z$좌표의 값이 $0$ 이상인 부분이고, $S$의 방향(orientation)은 위쪽을 향한다. 벡터장 $F=\\langle y+xz^2,\\,x(xy+z^2),\\,zy^2+x^2\\rangle$가 곡면 $S$를 통과하는 유량(flux)은?",
    options:opts5("$\\dfrac{9\\pi}{20}$","$\\dfrac{11\\pi}{20}$","$\\dfrac{13\\pi}{20}$","$\\dfrac{3\\pi}{4}$","$\\dfrac{17\\pi}{20}$"),
    correct:"3",
    explanation:"$F=\\langle y+xz^2,\\,x^2 y+xz^2,\\,y^2 z+x^2\\rangle$. $\\nabla\\cdot F=z^2+x^2+y^2$.\n반구체에 발산정리: $\\displaystyle\\iint_{S}+\\iint_{D_{z=0}}=\\iiint(\\rho^2)dV$ ($D$는 $z=0$ 디스크, 외향 $-z$).\n$\\iiint\\rho^2 dV$ over 단위반구 $=\\!\\int_0^{2\\pi}\\!\\int_0^{\\pi/2}\\!\\int_0^1\\rho^4\\sin\\phi\\,d\\rho d\\phi d\\theta=2\\pi\\cdot 1\\cdot\\dfrac{1}{5}=\\dfrac{2\\pi}{5}$.\n디스크 적분 ($z=0$, $\\hat n=-\\hat k$): $\\iint(-x^2)dA=-\\dfrac{\\pi}{4}$ (단위 디스크 위 $x^2$ 평균).\n$\\iint_S=\\dfrac{2\\pi}{5}-(-\\dfrac{\\pi}{4})=\\dfrac{8\\pi+5\\pi}{20}=\\dfrac{13\\pi}{20}$.",
  },
  {
    n:18, subject:"적분학", unit:"급수의 수렴/발산", concept:"수렴 구간 판정",
    difficulty:"medium",
    question:"다음 중 구간 $-2<x<-1$에서 수렴하는 수열을 모두 고르면?\n(가) $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(-2)^n x^n}{\\sqrt{n+1}}$\n(나) $\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{(x-1)^n}{\\ln n}$\n(다) $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{n(x+1)^n}{2^{n+1}}$",
    options:opts5("(가),(나)","(나),(다)","(가)","(나)","(다)"),
    correct:"5",
    explanation:"(가) 비율 $|2x|>2$ ($-2<x<-1$이면 $-4<-2x<-2$, $|2x|\\in(2,4)$). 발산.\n(나) $|x-1|\\in(2,3)>1$. 발산.\n(다) 비율 $\\dfrac{|x+1|}{2}<\\dfrac{1}{2}$ ($|x+1|<1$). 절대수렴.",
  },
  {
    n:19, subject:"다변수함수", unit:"선적분과 면적분", concept:"평면 위 면적분",
    difficulty:"medium",
    question:"평면 $z=x+2$와 원통 $x^2+y^2=1$의 내부와의 공통 영역으로 이루어진 면을 $S$라고 할 때, 면적분 $\\displaystyle\\iint_S z\\,dS$의 값은?",
    options:opts5("$\\dfrac{\\sqrt 2}{3}\\pi$","$\\dfrac{\\sqrt 2}{2}\\pi$","$\\sqrt 2\\,\\pi$","$2\\sqrt 2\\,\\pi$","$3\\sqrt 2\\,\\pi$"),
    correct:"4",
    explanation:"평면 $z=x+2$ 위의 면. $dS=\\sqrt{1+z_x^2+z_y^2}\\,dA=\\sqrt{1+1+0}\\,dA=\\sqrt 2\\,dA$.\n$\\iint_S z\\,dS=\\sqrt 2\\!\\iint_{x^2+y^2\\le 1}(x+2)\\,dA=\\sqrt 2\\!\\left[\\iint x\\,dA+2\\iint dA\\right]=\\sqrt 2(0+2\\pi)=2\\sqrt 2\\,\\pi$.",
  },
  {
    n:20, subject:"선형대수", unit:"행렬", concept:"최소제곱해(Least squares)",
    difficulty:"hard",
    question:"원 $a(x^2+y^2)+b(x+y)=1$이 네 개의 점 $(0,1),(-1,0),(1,-1),(1,1)$에 대한 최소제곱해(least squares solution)일 때, 이 원의 넓이는?",
    options:opts5("$\\dfrac{155\\pi}{98}$","$\\dfrac{160\\pi}{98}$","$\\dfrac{165\\pi}{98}$","$\\dfrac{170\\pi}{98}$","$\\dfrac{175\\pi}{98}$"),
    correct:"1",
    explanation:"각 점에서 행렬 식 $(x_i^2+y_i^2)\\,a+(x_i+y_i)\\,b=1$. $A=\\begin{pmatrix}1&1\\\\1&-1\\\\2&0\\\\2&2\\end{pmatrix},\\,\\mathbf b=(1,1,1,1)^T$.\n$A^T A=\\begin{pmatrix}10&4\\\\4&6\\end{pmatrix},\\,A^T\\mathbf b=(6,2)^T,\\,\\det=44$.\n$(a,b)=\\dfrac{1}{44}(28,-4)=\\!\\left(\\dfrac{7}{11},-\\dfrac{1}{11}\\right)$.\n원: $x^2+y^2-\\dfrac{1}{7}(x+y)=\\dfrac{11}{7}$. 완성: $\\!\\left(x-\\dfrac{1}{14}\\right)^2+\\!\\left(y-\\dfrac{1}{14}\\right)^2=\\dfrac{11}{7}+\\dfrac{2}{196}=\\dfrac{154+1}{98}=\\dfrac{155}{98}$.\n넓이 $=\\pi\\cdot\\dfrac{155}{98}=\\dfrac{155\\pi}{98}$.",
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
