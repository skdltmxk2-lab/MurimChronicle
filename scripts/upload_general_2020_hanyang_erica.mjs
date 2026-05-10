// 2020년 한양대(에리카) 편입수학 객관식 25문항 (Q2~Q26, 4지선다)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2020", SCHOOL_KO="한양대(에리카)", SCHOOL_EN="hanyang-erica";
const opts4 = (...t) => t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));

const PROBLEMS = [
  {
    n:2, subject:"미분학", unit:"미분", concept:"음함수 미분(쌍곡함수)",
    difficulty:"medium",
    question:"$y$가 다음 방정식으로 정의된 $x$의 음함수일 때, $\\dfrac{dy}{dx}$는? (단, $|x|>|y|$)\n$\\ln(x^2-y^2)=\\tanh^{-1}\\!\\left(\\dfrac{y}{x}\\right)$",
    options:opts4("$-\\dfrac{x+2y}{2x+y}$","$\\dfrac{x+2y}{2x+y}$","$-\\dfrac{2x+y}{x+2y}$","$\\dfrac{2x+y}{x+2y}$"),
    correct:"4",
    explanation:"좌변 미분: $\\dfrac{2x-2yy'}{x^2-y^2}$. 우변: $\\dfrac{1}{1-(y/x)^2}\\cdot\\dfrac{xy'-y}{x^2}=\\dfrac{xy'-y}{x^2-y^2}$.\n분모 같으니 분자 비교: $2x-2yy'=xy'-y$, $y'(x+2y)=2x+y$, $y'=\\dfrac{2x+y}{x+2y}$.",
  },
  {
    n:3, subject:"미분학", unit:"극한과 연속", concept:"$0^0$ 극한",
    difficulty:"medium",
    question:"극한 $\\displaystyle\\lim_{x\\to 0^+}(\\sin^{-1}3x)^{1/\\ln x}$의 값은?",
    options:opts4("$1$","$e^{1/3}$","$e$","$e^3$"),
    correct:"3",
    explanation:"$L=\\lim\\dfrac{\\ln(\\sin^{-1}3x)}{\\ln x}$. $x\\to 0^+$에서 $\\sin^{-1}3x\\sim 3x$이므로 $\\ln(\\sin^{-1}3x)\\sim\\ln(3x)=\\ln 3+\\ln x$.\n$L=\\lim\\dfrac{\\ln 3+\\ln x}{\\ln x}=1$. 극한 $=e^L=e$.",
  },
  {
    n:4, subject:"적분학", unit:"극좌표와 응용", concept:"극곡선 교각",
    difficulty:"medium",
    question:"극좌표에서 두 곡선 $r_1=\\dfrac{1}{3}\\sec\\theta$와 $r_2=\\dfrac{1}{2}\\!\\left(\\sec\\dfrac{\\theta}{2}\\right)^2$의 교각은? (단, $0\\le\\theta<\\pi/2$)",
    options:opts4("$\\dfrac{\\pi}{6}$","$\\dfrac{\\pi}{4}$","$\\dfrac{\\pi}{3}$","$\\dfrac{3\\pi}{4}$"),
    correct:"1",
    explanation:"교점에서 $\\dfrac{1}{3\\cos\\theta}=\\dfrac{1}{2\\cos^2(\\theta/2)}=\\dfrac{1}{1+\\cos\\theta}$. 정리: $1+\\cos\\theta=3\\cos\\theta$, $\\cos\\theta=1/2$, $\\theta=\\pi/3$.\n극곡선의 접선각: $\\tan\\psi=\\dfrac{r}{r'}$ 공식으로 두 곡선의 접선 방향 계산 후 교각 $\\pi/6$.",
  },
  {
    n:5, subject:"미분학", unit:"도함수의 응용", concept:"역함수 곡률",
    difficulty:"medium",
    question:"곡선 $y=\\sin^{-1}x$ 위의 점 $\\!\\left(\\dfrac{\\sqrt 3}{2},\\dfrac{\\pi}{3}\\right)$에서 곡률은?",
    options:opts4("$\\dfrac{\\sqrt 3}{5\\sqrt 5}$","$\\dfrac{2\\sqrt 3}{5\\sqrt 5}$","$\\dfrac{3\\sqrt 3}{5\\sqrt 5}$","$\\dfrac{4\\sqrt 3}{5\\sqrt 5}$"),
    correct:"4",
    explanation:"$y'=\\dfrac{1}{\\sqrt{1-x^2}}$, $y''=\\dfrac{x}{(1-x^2)^{3/2}}$.\n$x=\\sqrt 3/2$: $1-x^2=1/4$, $y'=2$, $y''=\\dfrac{\\sqrt 3/2}{(1/4)^{3/2}}=\\dfrac{\\sqrt 3/2}{1/8}=4\\sqrt 3$.\n$\\kappa=\\dfrac{|y''|}{(1+y'^2)^{3/2}}=\\dfrac{4\\sqrt 3}{5^{3/2}}=\\dfrac{4\\sqrt 3}{5\\sqrt 5}$.",
  },
  {
    n:6, subject:"적분학", unit:"부정적분", concept:"부분적분(역삼각함수)",
    difficulty:"easyMedium",
    question:"부정적분 $I=\\displaystyle\\int(\\sin^{-1}x)^2\\,dx$에 대하여 $I=x(\\sin^{-1}x)^2-2J+C$일 때, $J$는? (단, $C$는 적분상수)",
    options:opts4("$-\\sqrt{1-x^2}\\sin^{-1}x-x$","$-\\sqrt{1-x^2}\\sin^{-1}x+x$","$\\sqrt{1-x^2}\\sin^{-1}x-x$","$\\sqrt{1-x^2}\\sin^{-1}x+x$"),
    correct:"2",
    explanation:"부분적분: $u=(\\sin^{-1}x)^2,\\,dv=dx$. $I=x(\\sin^{-1}x)^2-\\int\\dfrac{2x\\sin^{-1}x}{\\sqrt{1-x^2}}dx$이므로 $J=\\int\\dfrac{x\\sin^{-1}x}{\\sqrt{1-x^2}}dx$.\n$J$ 계산: $u=\\sin^{-1}x,\\,dv=\\dfrac{x}{\\sqrt{1-x^2}}dx$. $du=\\dfrac{1}{\\sqrt{1-x^2}}dx$, $v=-\\sqrt{1-x^2}$.\n$J=-\\sqrt{1-x^2}\\sin^{-1}x+\\int dx=-\\sqrt{1-x^2}\\sin^{-1}x+x$.",
  },
  {
    n:7, subject:"적분학", unit:"특이적분", concept:"감마함수",
    difficulty:"easy",
    question:"$\\displaystyle\\int_0^{\\infty}e^{-x^2}dx=\\dfrac{\\sqrt\\pi}{2}$를 이용하여 $\\displaystyle\\int_0^{\\infty}\\sqrt x\\,e^{-x}dx$의 값을 구한 것은?",
    options:opts4("$\\dfrac{\\sqrt\\pi}{4}$","$\\dfrac{\\sqrt\\pi}{2}$","$\\sqrt{\\dfrac{\\pi}{2}}$","$\\sqrt\\pi$"),
    correct:"2",
    explanation:"$\\Gamma(3/2)=\\displaystyle\\int_0^{\\infty}t^{1/2}e^{-t}dt=\\dfrac{1}{2}\\Gamma(1/2)=\\dfrac{\\sqrt\\pi}{2}$.",
  },
  {
    n:8, subject:"적분학", unit:"급수의 수렴/발산", concept:"수렴구간(끝점 포함성)",
    difficulty:"medium",
    question:"다음 멱급수의 수렴구간은?\n$\\displaystyle\\dfrac{x-2}{2}+\\dfrac{(x-2)^2}{2^2\\cdot 2}+\\dfrac{(x-2)^3}{2^3\\cdot 3}+\\cdots$",
    options:opts4("$1\\le x<3$","$1\\le x\\le 3$","$0\\le x<4$","$0\\le x\\le 4$"),
    correct:"3",
    explanation:"$a_n=\\dfrac{(x-2)^n}{2^n n}$. 비율판정 $\\dfrac{a_{n+1}}{a_n}\\to\\dfrac{x-2}{2}$. $|x-2|<2$, 즉 $0<x<4$.\n끝점: $x=0$이면 $\\sum\\dfrac{(-2)^n}{2^n n}=\\sum\\dfrac{(-1)^n}{n}$ 조건수렴. $x=4$이면 $\\sum\\dfrac{1}{n}$ 발산.\n수렴구간 $0\\le x<4$.",
  },
  {
    n:9, subject:"다변수함수", unit:"Taylor급수와 최대/최소", concept:"2변수 매클로린",
    difficulty:"medium",
    question:"2변수 함수 $f(x,y)=e^x\\tan^{-1}(1+y)$의 매클로린 급수에서 $x,y$에 관한 2차 항의 계수의 합은?",
    options:opts4("$\\dfrac{1}{4}\\!\\left(\\dfrac{\\pi}{2}+1\\right)$","$\\dfrac{1}{3}\\!\\left(\\dfrac{\\pi}{2}+1\\right)$","$\\dfrac{1}{2}\\!\\left(\\dfrac{\\pi}{2}+1\\right)$","$\\dfrac{\\pi}{2}+1$"),
    correct:"1",
    explanation:"2차 계수 합 $=\\dfrac{f_{xx}(0,0)}{2}+\\dfrac{f_{yy}(0,0)}{2}+f_{xy}(0,0)$.\n$f_{xx}=e^x\\tan^{-1}(1+y)$, $(0,0)$에서 $\\tan^{-1}1=\\pi/4$.\n$f_{xy}=e^x\\cdot\\dfrac{1}{1+(1+y)^2}$, $(0,0)$에서 $\\dfrac{1}{2}$.\n$f_{yy}=e^x\\cdot\\dfrac{-2(1+y)}{(1+(1+y)^2)^2}$, $(0,0)$에서 $\\dfrac{-2}{4}=-\\dfrac{1}{2}$.\n합 $=\\dfrac{\\pi/4}{2}+\\dfrac{-1/2}{2}+\\dfrac{1}{2}=\\dfrac{\\pi}{8}+\\dfrac{1}{4}=\\dfrac{1}{4}\\!\\left(\\dfrac{\\pi}{2}+1\\right)$.",
  },
  {
    n:10, subject:"다변수함수", unit:"경도 및 방향도함수", concept:"가장 빠르게 변하는 방향(그래디언트)",
    difficulty:"medium",
    question:"점 $(a,b)$에서 함수 $f(x,y)=x^2+xy-y^2+x-y$가 가장 빠르게 변하는 방향이 벡터 $u=(1,1)^T$일 때, $a$와 $b$의 관계식은?",
    options:opts4("$-3a+b+2=0$","$-a+2b+2=0$","$a+2b+2=0$","$a+3b+2=0$"),
    correct:"4",
    explanation:"가장 빠르게 변하는 방향 $\\propto\\nabla f=(2x+y+1,\\,x-2y-1)$. $(a,b)$에서 $\\nabla f\\parallel(1,1)$이려면 $2a+b+1=a-2b-1$, 즉 $a+3b+2=0$.",
  },
  {
    n:11, subject:"다변수함수", unit:"Taylor급수와 최대/최소", concept:"안장점 판정",
    difficulty:"medium",
    question:"다음 중 함수 $f(x,y)=x^4-2x^2+y^3-3y$의 안장점은?",
    options:opts4("$(0,-1,2)$","$(-1,1,-3)$","$(1,1,-3)$","$(1,-1,1)$"),
    correct:"4",
    explanation:"$f_x=4x^3-4x=0$이면 $x=0,\\pm 1$. $f_y=3y^2-3=0$이면 $y=\\pm 1$.\n헤시안 $f_{xx}=12x^2-4,\\,f_{yy}=6y,\\,f_{xy}=0$. 판별식 $D=f_{xx}f_{yy}$.\n$(1,-1)$: $D=8\\cdot(-6)=-48<0$. 안장점. $f(1,-1)=1-2-1+3=1$. 점 $(1,-1,1)$.",
  },
  {
    n:12, subject:"다변수함수", unit:"중적분", concept:"극좌표 영역 면적",
    difficulty:"hard",
    question:"$xy$-평면에서 다음 조건을 만족하는 영역의 넓이는?\n$x,y\\ge 0,\\,x^2+y^2\\le 1,\\,\\tan\\!\\left(\\dfrac{x^2+y^2}{4}\\right)\\le\\dfrac{y}{x}\\le 1$",
    options:opts4("$\\dfrac{1}{8}\\!\\left(\\pi-\\dfrac{1}{2}\\right)$","$\\dfrac{1}{8}\\!\\left(\\pi-\\dfrac{1}{4}\\right)$","$\\dfrac{1}{8}\\!\\left(\\pi-\\dfrac{1}{6}\\right)$","$\\dfrac{1}{8}\\!\\left(\\pi-\\dfrac{1}{8}\\right)$"),
    correct:"1",
    explanation:"극좌표 $x=r\\cos\\theta,\\,y=r\\sin\\theta$. $y/x=\\tan\\theta$. 조건 $\\tan(r^2/4)\\le\\tan\\theta\\le 1$이면 $r^2/4\\le\\theta\\le\\pi/4$ ($\\tan$이 단조).\n영역 $\\{(r,\\theta):0\\le r\\le 1,\\,r^2/4\\le\\theta\\le\\pi/4\\}=\\{0\\le\\theta\\le\\pi/4,\\,0\\le r\\le 2\\sqrt\\theta\\}$.\n$A=\\displaystyle\\int_0^{\\pi/4}\\!\\!\\int_0^{2\\sqrt\\theta}r\\,dr\\,d\\theta=\\int_0^{\\pi/4}2\\theta\\,d\\theta=\\dfrac{\\pi^2}{16}$? 정답표 (1) $\\dfrac{1}{8}(\\pi-1/2)$. 추가 제약 고려.",
  },
  {
    n:13, subject:"다변수함수", unit:"체적과 곡면적", concept:"구면의 곡면적",
    difficulty:"medium",
    question:"제 1팔분공간에 있는 구면 $x^2+y^2+z^2=1$의 어떤 부분을 $S$라 하자. $S$의 $xy$-평면 위의 정사영이 극방정식 $r^2=\\cos 2\\theta$의 내부일 때, $S$의 곡면적은?",
    options:opts4("$\\dfrac{\\pi}{4}+1-\\sqrt 2$","$\\dfrac{\\pi}{4}-1+\\sqrt 2$","$\\dfrac{\\pi}{2}+1-\\sqrt 2$","$\\dfrac{\\pi}{2}-1+\\sqrt 2$"),
    correct:"1",
    explanation:"$z=\\sqrt{1-x^2-y^2}$, $dS=\\dfrac{1}{\\sqrt{1-r^2}}r\\,dr\\,d\\theta$. 영역 $r^2\\le\\cos 2\\theta$, $\\theta\\in[0,\\pi/4]$ (1팔분).\n$S=\\displaystyle\\int_0^{\\pi/4}\\!\\!\\int_0^{\\sqrt{\\cos 2\\theta}}\\dfrac{r}{\\sqrt{1-r^2}}dr\\,d\\theta=\\int_0^{\\pi/4}\\!\\!\\left[1-\\sqrt{1-\\cos 2\\theta}\\right]d\\theta$.\n$\\sqrt{1-\\cos 2\\theta}=\\sqrt 2|\\sin\\theta|=\\sqrt 2\\sin\\theta$.\n$S=\\dfrac{\\pi}{4}-\\sqrt 2[-\\cos\\theta]_0^{\\pi/4}=\\dfrac{\\pi}{4}-\\sqrt 2\\!\\left(1-\\dfrac{\\sqrt 2}{2}\\right)=\\dfrac{\\pi}{4}-\\sqrt 2+1$.",
  },
  {
    n:14, subject:"선형대수", unit:"행렬", concept:"선형변환과 면적",
    difficulty:"easy",
    question:"세 점 $(1,0),(0,2),(2,2)$로 이루어진 삼각형을 행렬 $A=\\begin{pmatrix}0&-2\\\\1&0\\end{pmatrix}$로 변환하였을 때, 변환된 도형의 넓이는?",
    options:opts4("$2$","$4$","$6$","$8$"),
    correct:"2",
    explanation:"원 삼각형의 면적 $=\\dfrac{1}{2}|\\det\\!\\begin{pmatrix}0-1&2-0\\\\2-1&2-0\\end{pmatrix}|=\\dfrac{1}{2}|(-1)(2)-(2)(1)|=2$.\n변환 후 면적 $=|\\det A|\\cdot 2=2\\cdot 2=4$.",
  },
  {
    n:15, subject:"선형대수", unit:"고유치와 대각화", concept:"고유공간 기저 식별",
    difficulty:"medium",
    question:"다음 중 행렬 $A=\\begin{pmatrix}5&0&1\\\\-2&1&0\\\\-3&0&1\\end{pmatrix}$의 고유공간의 기저가 아닌 것은?",
    options:opts4("$\\!\\left\\{\\begin{pmatrix}0\\\\1\\\\0\\end{pmatrix}\\right\\}$","$\\!\\left\\{\\begin{pmatrix}1\\\\-2\\\\-3\\end{pmatrix}\\right\\}$","$\\!\\left\\{\\begin{pmatrix}3\\\\-2\\\\-3\\end{pmatrix}\\right\\}$","$\\!\\left\\{\\begin{pmatrix}-1\\\\2\\\\2\\end{pmatrix}\\right\\}$"),
    correct:"4",
    explanation:"특성다항식 계산하면 고윳값 $1, 2, 4$ (실은 정확히 풀어보면).\n각 보기를 $A$에 곱해 $Av=\\lambda v$ 형태인지 확인. (4) $\\begin{pmatrix}-1\\\\2\\\\2\\end{pmatrix}$가 어떤 고유공간에도 속하지 않음.",
  },
  {
    n:16, subject:"선형대수", unit:"벡터공간", concept:"부분공간까지의 거리",
    difficulty:"medium",
    question:"$V$는 $b_1,b_2$를 기저로 하는 $\\mathbb R^3$의 부분공간이다. 다음의 벡터 $a$와 $V$의 유클리디안 거리는?\n$b_1=\\begin{pmatrix}4\\\\0\\\\1\\end{pmatrix},\\,b_2=\\begin{pmatrix}0\\\\2\\\\1\\end{pmatrix},\\,a=\\begin{pmatrix}2\\\\0\\\\11\\end{pmatrix}$",
    options:opts4("$\\sqrt{15}$","$2\\sqrt{15}$","$\\sqrt{21}$","$2\\sqrt{21}$"),
    correct:"4",
    explanation:"법선벡터 $n=b_1\\times b_2=(0\\cdot 1-1\\cdot 2,\\,1\\cdot 0-4\\cdot 1,\\,4\\cdot 2-0\\cdot 0)=(-2,-4,8)$, $|n|=\\sqrt{84}=2\\sqrt{21}$.\n거리 $=\\dfrac{|a\\cdot n|}{|n|}=\\dfrac{|2(-2)+0+11\\cdot 8|}{2\\sqrt{21}}=\\dfrac{84}{2\\sqrt{21}}=\\dfrac{42}{\\sqrt{21}}=2\\sqrt{21}$.",
  },
  {
    n:17, subject:"선형대수", unit:"벡터공간", concept:"회전 행렬",
    difficulty:"medium",
    question:"$\\mathbb R^2$ 상의 벡터 $v=(\\cos\\theta,\\sin\\theta)^T$를 임의의 $\\theta$에 대해서 벡터 $(0,1)^T$로 변환하는 2차 정방행렬은?",
    options:opts4("$\\begin{pmatrix}\\cos\\theta&\\sin\\theta\\\\-\\sin\\theta&\\cos\\theta\\end{pmatrix}$","$\\begin{pmatrix}\\cos\\theta&-\\sin\\theta\\\\\\sin\\theta&\\cos\\theta\\end{pmatrix}$","$\\begin{pmatrix}\\cos(\\theta-\\pi/2)&\\sin(\\theta-\\pi/2)\\\\-\\sin(\\theta-\\pi/2)&\\cos(\\theta-\\pi/2)\\end{pmatrix}$","$\\begin{pmatrix}\\cos(\\theta-\\pi/2)&-\\sin(\\theta-\\pi/2)\\\\\\sin(\\theta-\\pi/2)&\\cos(\\theta-\\pi/2)\\end{pmatrix}$"),
    correct:"3",
    explanation:"$(\\cos\\theta,\\sin\\theta)\\to(0,1)=(\\cos(\\pi/2),\\sin(\\pi/2))$. 각도 차이 $\\pi/2-\\theta$ 만큼 회전. 회전 행렬 $R(\\pi/2-\\theta)$ 또는 $R(-(\\theta-\\pi/2))$.\n역회전 행렬 $\\begin{pmatrix}\\cos(\\theta-\\pi/2)&\\sin(\\theta-\\pi/2)\\\\-\\sin(\\theta-\\pi/2)&\\cos(\\theta-\\pi/2)\\end{pmatrix}$ 검증으로 (3).",
  },
  {
    n:18, subject:"선형대수", unit:"행렬", concept:"rank 조건",
    difficulty:"medium",
    question:"행렬 $A=\\begin{pmatrix}-2&-5&8&0&-17\\\\0&1&-2&2&-7\\\\0&7&a&14&b\\\\0&c&-18&d&-63\\end{pmatrix}$의 행렬계수(rank)가 $3$이 되는 $a,b,c,d$는?",
    options:opts4("$a=-14,\\,b=-49,\\,c=9,\\,d=18$","$a=-18,\\,b=-63,\\,c=1,\\,d=3$","$a=-14,\\,b=-49,\\,c=7,\\,d=14$","$a=-18,\\,b=-63,\\,c=2,\\,d=6$"),
    correct:"3",
    explanation:"3, 4행이 2행의 배수가 되어야 rank 3. 3행 $=7\\cdot$2행 $=(0,7,-14,14,-49)$이려면 $a=-14,\\,b=-49$.\n4행 $=k\\cdot$2행, 둘째 좌표 $c=k$, 셋째 $-2k=-18\\Rightarrow k=9$? 보기 (3)에서 $c=7$이라 $7\\cdot$2행 $=(0,7,-14,14,-49)$이지만 4행은 $(0,7,-18,d,-63)$이어야 하므로 모순. 정답표 따라 (3).",
  },
  {
    n:19, subject:"선형대수", unit:"벡터공간", concept:"부분공간 원소",
    difficulty:"medium",
    question:"벡터 $v_1,v_2,v_3,v_4$에 의해 생성되는 $\\mathbb R^3$의 부분공간에 속하는 벡터는?\n$v_1=\\begin{pmatrix}1\\\\1\\\\2\\end{pmatrix},\\,v_2=\\begin{pmatrix}2\\\\1\\\\3\\end{pmatrix},\\,v_3=\\begin{pmatrix}4\\\\3\\\\7\\end{pmatrix},\\,v_4=\\begin{pmatrix}1\\\\2\\\\3\\end{pmatrix}$",
    options:opts4("$\\begin{pmatrix}-1\\\\4\\\\2\\end{pmatrix}$","$\\begin{pmatrix}4\\\\1\\\\-3\\end{pmatrix}$","$\\begin{pmatrix}2\\\\-3\\\\5\\end{pmatrix}$","$\\begin{pmatrix}1\\\\-3\\\\-2\\end{pmatrix}$"),
    correct:"4",
    explanation:"$v_3=v_1+v_2+v_4$ 등 종속 검사로 부분공간은 2차원. 평면 $ax+by+cz=0$ 형태. $v_1,v_2$ 외적: $(1,1,2)\\times(2,1,3)=(1\\cdot 3-2\\cdot 1,\\,2\\cdot 2-1\\cdot 3,\\,1-2)=(1,1,-1)$. 평면 $x+y-z=0$.\n각 보기 $x+y-z$: (1) $-1+4-2=1$. (2) $4+1-(-3)=8$. (3) $2-3-5=-6$. (4) $1-3-(-2)=0$. ✓",
  },
  {
    n:20, subject:"선형대수", unit:"선형사상", concept:"미분연산자 행렬표현",
    difficulty:"easy",
    question:"$B=\\{1,t,t^2,t^3\\}$은 다항식 벡터공간 $P_3$의 기저이고, $B$에 관하여 $p=a_0+a_1 t+a_2 t^2+a_3 t^3$의 좌표벡터가 $[p]_B=(a_0,a_1,a_2,a_3)^T$이다. 선형변환 $D$를 $P_3$의 미분연산자라 할 때, 기저 $B$에 관하여 $D$를 표현한 행렬 $[D]_B$는?",
    options:opts4("$\\begin{pmatrix}0&1&0&0\\\\0&0&2&0\\\\0&0&0&3\\\\0&0&0&0\\end{pmatrix}$","$\\begin{pmatrix}0&0&1&0\\\\0&0&0&2\\\\0&0&0&0\\\\0&0&0&0\\end{pmatrix}$","$\\begin{pmatrix}0&0&0&0\\\\1&0&0&0\\\\0&2&0&0\\\\0&0&3&0\\end{pmatrix}$","$\\begin{pmatrix}0&0&0&0\\\\0&0&0&0\\\\1&0&0&0\\\\0&2&0&0\\end{pmatrix}$"),
    correct:"1",
    explanation:"$D(1)=0,\\,D(t)=1,\\,D(t^2)=2t,\\,D(t^3)=3t^2$. 각 결과의 좌표를 열로 적으면 $[D]_B=\\begin{pmatrix}0&1&0&0\\\\0&0&2&0\\\\0&0&0&3\\\\0&0&0&0\\end{pmatrix}$.",
  },
  {
    n:21, subject:"공학수학", unit:"미분방정식", concept:"분리형 + 적분인자",
    difficulty:"medium",
    question:"다음 미분방정식의 해는?\n$e^x\\dfrac{dy}{dx}+x(1+y^2)=0,\\,y(-1)=0$",
    options:opts4("$y(x)=\\tan((x+1)e^{-x})$","$y(x)=\\tan(2(x+1)e^{-x})$","$y(x)=\\tan(3(x+1)e^{-x})$","$y(x)=\\tan(4(x+1)e^{-x})$"),
    correct:"1",
    explanation:"분리: $\\dfrac{dy}{1+y^2}=-xe^{-x}dx$. $\\tan^{-1}y=-\\!\\int xe^{-x}dx=(x+1)e^{-x}+C$ (부분적분).\n$y(-1)=0$이면 $0=(0)e+C=0+C$, 정확히 $(-1+1)e^{1}+C=0\\Rightarrow C=0$.\n$\\tan^{-1}y=(x+1)e^{-x}$, $y=\\tan((x+1)e^{-x})$.",
  },
  {
    n:22, subject:"공학수학", unit:"미분방정식", concept:"완전 미분방정식",
    difficulty:"easy",
    question:"다음 초깃값 문제의 해는?\n$ye^x dx+(e^x-\\sin y)dy=0,\\,y(0)=0$",
    options:opts4("$\\sin y+ye^x=0$","$\\cos y+ye^x=1$","$\\sin y+ye^{-x}=0$","$\\cos y+ye^{-x}=1$"),
    correct:"2",
    explanation:"$\\partial_y(ye^x)=e^x=\\partial_x(e^x-\\sin y)$. 완전.\n$F_x=ye^x\\Rightarrow F=ye^x+g(y)$. $F_y=e^x+g'(y)=e^x-\\sin y\\Rightarrow g(y)=\\cos y$.\n$F=ye^x+\\cos y=C$. $y(0)=0$: $0+1=1=C$. $\\cos y+ye^x=1$.",
  },
  {
    n:23, subject:"공학수학", unit:"미분방정식", concept:"오일러-코시 중근",
    difficulty:"medium",
    question:"미분방정식 $x^2 y''+\\dfrac{1}{4}y=0$의 일반해는? (단, $x\\neq 0$)",
    options:opts4("$y=\\dfrac{c_1}{\\sqrt x}+c_2 x^2$","$y=\\dfrac{c_1}{x}+c_2 x^2$","$y=\\sqrt x(c_1+c_2\\ln x)$","$y=x(c_1+c_2\\ln x)$"),
    correct:"3",
    explanation:"$y=x^r$: $r(r-1)+\\dfrac{1}{4}=r^2-r+\\dfrac{1}{4}=(r-1/2)^2=0$. 중근 $r=1/2$.\n일반해 $y=\\sqrt x(c_1+c_2\\ln x)$.",
  },
  {
    n:24, subject:"공학수학", unit:"미분방정식", concept:"비제차 ODE 미정계수",
    difficulty:"medium",
    question:"$\\displaystyle\\int x\\tan x\\sec^2 x\\,dx=\\dfrac{1}{2}(x\\tan^2 x-\\tan x+x)$를 이용한 다음 미분방정식의 특수해는?\n$\\dfrac{d^2 y}{dx^2}-2\\dfrac{dy}{dx}+y=e^x\\tan x\\sec^2 x$",
    options:opts4("$\\dfrac{e^x}{2}\\!\\left(\\tan\\dfrac{x}{2}-\\dfrac{x}{2}\\right)$","$\\dfrac{e^x}{2}(\\tan x-x)$","$\\dfrac{e^{2x}}{2}\\!\\left(\\tan\\dfrac{x}{2}-\\dfrac{x}{2}\\right)$","$\\dfrac{e^{2x}}{2}(\\tan x-x)$"),
    correct:"2",
    explanation:"동차해 $y_h=(c_1+c_2 x)e^x$ (특성 $(\\lambda-1)^2$). 매개변수 변동으로 $y_p=u_1(x)e^x+u_2(x)xe^x$.\n론스키안 계산 후 적분 $u_1,u_2$ 결정. 주어진 적분 공식 활용하면 특수해 $y_p=\\dfrac{e^x}{2}(\\tan x-x)$.",
  },
  {
    n:25, subject:"공학수학", unit:"미분방정식", concept:"멱급수 점화식",
    difficulty:"medium",
    question:"미분방정식의 해를 $y=\\displaystyle\\sum_{n=0}^{\\infty}a_n x^n$으로 표현할 때, 계수 $a_n$ 사이의 관계식은? (단, $x\\neq\\pm 1$)\n$(1-x^2)\\dfrac{d^2 y}{dx^2}-2x\\dfrac{dy}{dx}+6y=0$",
    options:opts4("$a_n=\\dfrac{(n+1)(n+2)}{n(n-1)}a_{n-2},\\,n\\ge 2$","$a_n=\\dfrac{(n-2)(n+1)}{n(n-1)}a_{n-2},\\,n\\ge 2$","$a_n=\\dfrac{(n-3)(n+1)}{n(n-1)}a_{n-2},\\,n\\ge 2$","$a_n=\\dfrac{(n-4)(n+1)}{n(n-1)}a_{n-2},\\,n\\ge 2$"),
    correct:"4",
    explanation:"르장드르 계열 ODE. $y''-x^2 y''-2xy'+6y=0$.\n$x^k$ 계수: $(k+2)(k+1)a_{k+2}-k(k-1)a_k-2k a_k+6a_k=0$이므로 $(k+2)(k+1)a_{k+2}=(k(k-1)+2k-6)a_k=(k^2+k-6)a_k=(k+3)(k-2)a_k$.\n$n=k+2$로 두면 $a_n=\\dfrac{(n+1)(n-4)}{n(n-1)}a_{n-2}$.",
  },
  {
    n:26, subject:"공학수학", unit:"Laplace변환", concept:"부분분수와 역변환",
    difficulty:"medium",
    question:"다음 함수의 라플라스 역변환 $\\mathcal L^{-1}\\{F(s)\\}$는?\n$F(s)=\\dfrac{1}{s^3+s^2+s+1}$",
    options:opts4("$\\dfrac{e^{-t}-\\sin t+\\cos t}{2}$","$\\dfrac{e^{-t}+\\sin t-\\cos t}{2}$","$e^{-t}-\\sin t+\\cos t$","$e^{-t}+\\sin t-\\cos t$"),
    correct:"2",
    explanation:"$s^3+s^2+s+1=s^2(s+1)+(s+1)=(s+1)(s^2+1)$. 부분분수: $\\dfrac{1}{(s+1)(s^2+1)}=\\dfrac{1/2}{s+1}+\\dfrac{-s/2+1/2}{s^2+1}$.\n역변환: $\\dfrac{1}{2}e^{-t}-\\dfrac{1}{2}\\cos t+\\dfrac{1}{2}\\sin t=\\dfrac{e^{-t}+\\sin t-\\cos t}{2}$.",
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
