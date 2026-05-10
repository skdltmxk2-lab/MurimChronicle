// 2023년 서강대 편입수학 객관식 16문항 (5지선다) — Q17~20은 주관식이라 제외
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2023", SCHOOL_KO="서강대", SCHOOL_EN="sogang";
const opts5 = (...t) => t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));

const PROBLEMS = [
  {n:1, subject:"다변수함수", unit:"공간의 직선과 평면", concept:"꼬인 두 직선 거리",
    difficulty:"medium",
    question:"방정식 $\\dfrac{x-1}{2}=\\dfrac{y-2}{2}=z-3$으로 주어진 직선을 $L_1$이라고 하고 두 점 $(1,0,2)$와 $(2,2,2)$를 지나는 직선을 $L_2$라고 할 때, 두 직선 $L_1$과 $L_2$ 사이의 거리는?",
    options:opts5("$\\dfrac{1}{3}$","$\\dfrac{2}{3}$","$1$","$\\dfrac{4}{3}$","$\\dfrac{5}{3}$"),
    correct:"4",
    explanation:"$L_1$: 방향 $\\vec{d_1}=(2,2,1)$, 통과점 $P_1=(1,2,3)$.\n$L_2$: 방향 $\\vec{d_2}=(1,2,0)$, 통과점 $P_2=(1,0,2)$.\n$\\vec{d_1}\\times\\vec{d_2}=(-2,1,2)$, $|\\vec{d_1}\\times\\vec{d_2}|=3$.\n$\\vec{P_1P_2}=(0,-2,-1)$, $\\vec{P_1P_2}\\cdot(\\vec{d_1}\\times\\vec{d_2})=-4$.\n거리 $=\\dfrac{|-4|}{3}=\\dfrac{4}{3}$.",
  },
  {n:2, subject:"미분학", unit:"도함수", concept:"역함수 미분",
    difficulty:"medium",
    question:"함수 $f(x)=\\sinh x\\cosh x$의 역함수를 $g(x)$라고 할 때, $g'\\!\\left(\\dfrac{15}{16}\\right)$의 값은?",
    options:opts5("$\\dfrac{8}{17}$","$\\dfrac{8}{15}$","$\\dfrac{4}{5}$","$\\dfrac{32}{17}$","$\\dfrac{32}{15}$"),
    correct:"1",
    explanation:"$f(x)=\\dfrac{1}{2}\\sinh(2x)$, $f'(x)=\\cosh(2x)$.\n$f(g)=\\dfrac{15}{16}\\Rightarrow\\sinh(2g)=\\dfrac{15}{8}$. $\\cosh(2g)=\\sqrt{1+\\dfrac{225}{64}}=\\dfrac{17}{8}$.\n$g'=\\dfrac{1}{f'(g)}=\\dfrac{1}{\\cosh(2g)}=\\dfrac{8}{17}$.",
  },
  {n:3, subject:"미분학", unit:"도함수", concept:"테일러 급수 9계도함수",
    difficulty:"medium",
    question:"함수 $f(x)=\\begin{cases}\\dfrac{\\cos x^2-1}{x^3}&(x\\ne 0)\\\\0&(x=0)\\end{cases}$에 대하여 $f^{(9)}(0)$의 값은?",
    options:opts5("$-504$","$-\\dfrac{1}{720}$","$0$","$\\dfrac{1}{720}$","$504$"),
    correct:"1",
    explanation:"$\\cos x^2-1=-\\dfrac{x^4}{2}+\\dfrac{x^8}{24}-\\dfrac{x^{12}}{720}+\\cdots$.\n$f(x)=-\\dfrac{x}{2}+\\dfrac{x^5}{24}-\\dfrac{x^9}{720}+\\cdots$.\n$f^{(9)}(0)=9!\\cdot\\!\\left(-\\dfrac{1}{720}\\right)=362880\\cdot\\!\\left(-\\dfrac{1}{720}\\right)=-504$.",
  },
  {n:4, subject:"적분학", unit:"이상적분", concept:"이상적분 합",
    difficulty:"medium",
    question:"$\\displaystyle\\int_0^1\\dfrac{\\ln x}{\\sqrt{x}}\\,dx+\\displaystyle\\int_e^{\\infty}\\dfrac{1}{x(\\ln x)^2}\\,dx$의 값은?",
    options:opts5("$-5$","$-3$","$0$","$3$","$5$"),
    correct:"2",
    explanation:"첫 번째: $u=\\sqrt{x}$ 치환, $\\!\\int_0^1\\dfrac{\\ln x}{\\sqrt{x}}\\,dx=4\\!\\int_0^1\\ln u\\,du=4\\cdot(-1)=-4$.\n두 번째: $u=\\ln x$ 치환, $\\!\\int_e^{\\infty}\\dfrac{du}{u^2}=[-1/u]_1^{\\infty}=1$.\n합 $=-4+1=-3$.",
  },
  {n:5, subject:"다변수함수", unit:"편도함수", concept:"방향도함수 (limit 정의)",
    difficulty:"hard",
    question:"함수 $f(x,y)=\\begin{cases}\\dfrac{x^3+y|y|}{\\sqrt{x^2+y^2}}&(x,y)\\ne(0,0)\\\\0&(x,y)=(0,0)\\end{cases}$와 평면벡터 $\\vec{u}=\\!\\left(\\dfrac{1}{\\sqrt{2}},\\dfrac{1}{\\sqrt{2}}\\right)$에 대하여 $\\nabla f(0,0)=(a,b),\\,D_{\\vec{u}}f(0,0)=c$라고 할 때, $a+b+c$의 값은?",
    options:opts5("$0$","$1$","$\\dfrac{3}{2}$","$1+\\dfrac{1}{\\sqrt{2}}$","$2$"),
    correct:"3",
    explanation:"편도함수: $f_x(0,0)=\\!\\lim_{h\\to 0}\\dfrac{h^3/|h|}{h}=\\!\\lim |h|\\cdot\\mathrm{sgn}=0$. $f_y(0,0)=\\!\\lim_{k\\to 0}\\dfrac{k|k|/|k|}{k}=\\!\\lim\\dfrac{k}{k}=1$. $a=0,\\,b=1$.\n방향도함수 (정의): $D_{\\vec{u}}f(0,0)=\\!\\lim_{t\\to 0}\\dfrac{f(t/\\sqrt{2},t/\\sqrt{2})}{t}$.\n$f(t/\\sqrt{2},t/\\sqrt{2})=\\dfrac{t^3/(2\\sqrt{2})+t^2/2}{|t|}\\cdot\\mathrm{sgn}=\\cdots$ 계산 결과 $\\dfrac{t}{2\\sqrt{2}}+\\dfrac{1}{2}\\to\\dfrac{1}{2}$. $c=\\dfrac{1}{2}$.\n$a+b+c=0+1+\\dfrac{1}{2}=\\dfrac{3}{2}$.",
  },
  {n:6, subject:"다변수함수", unit:"편도함수의 응용", concept:"이변수 안장점",
    difficulty:"medium",
    question:"함수 $f(x,y)=(x^2-y^2-3y-3)e^{-y}$의 안장점은?",
    options:opts5("$(0,0)$","$(1,0)$","$(-1,0)$","$(0,1)$","$(0,-1)$"),
    correct:"5",
    explanation:"$f_x=2xe^{-y}=0\\Rightarrow x=0$.\n$f_y=e^{-y}(y^2+y-x^2)=0$, $x=0$ 대입: $y(y+1)=0\\Rightarrow y=0$ 또는 $y=-1$.\n임계점 $(0,0),(0,-1)$.\n$(0,0)$: $f_{xx}=2,f_{yy}=1,f_{xy}=0$, $D=2>0$, $f_{xx}>0$ ⇒ 극소.\n$(0,-1)$: $f_{xx}=2e,f_{yy}=-e,f_{xy}=0$, $D=-2e^2<0$ ⇒ **안장점**.",
  },
  {n:7, subject:"다변수함수", unit:"중적분", concept:"극좌표 적분",
    difficulty:"easy",
    question:"영역 $D=\\{(x,y)\\in\\mathbb{R}^2\\,|\\,x^2+y^2\\le 1,\\,y\\le x,\\,y\\ge 0\\}$에 대하여, 적분 $\\displaystyle\\iint_D\\sqrt{1-x^2-y^2}\\,dA$의 값은?",
    options:opts5("$\\dfrac{\\pi}{24}$","$\\dfrac{\\pi}{12}$","$\\dfrac{\\pi}{6}$","$\\dfrac{\\pi}{3}$","$\\dfrac{\\pi}{2}$"),
    correct:"2",
    explanation:"극좌표: $0\\le\\theta\\le\\dfrac{\\pi}{4}$ ($y\\le x,\\,y\\ge 0$), $0\\le r\\le 1$.\n$\\!\\iint\\sqrt{1-r^2}\\cdot r\\,dr\\,d\\theta=\\dfrac{\\pi}{4}\\cdot\\!\\left[-\\dfrac{(1-r^2)^{3/2}}{3}\\right]_0^1=\\dfrac{\\pi}{4}\\cdot\\dfrac{1}{3}=\\dfrac{\\pi}{12}$.",
  },
  {n:8, subject:"다변수함수", unit:"선적분과 면적분", concept:"곡면 넓이",
    difficulty:"hard",
    question:"영역 $D=\\{(x,y)\\in\\mathbb{R}^2\\,|\\,1\\le x\\le 2,\\,1\\le y\\le 2\\}$에 대하여, 곡면 $z=\\dfrac{2}{3}(x\\sqrt{x}+y\\sqrt{y}),\\,(x,y)\\in D$의 넓이는?",
    options:opts5("$\\dfrac{50\\sqrt{5}}{3}+6\\sqrt{3}-\\dfrac{128}{3}$","$25\\sqrt{5}+9\\sqrt{3}-64$","$10\\sqrt{5}+\\dfrac{18\\sqrt{3}}{5}-\\dfrac{128}{5}$","$\\dfrac{20\\sqrt{5}}{3}+\\dfrac{12\\sqrt{3}}{5}-\\dfrac{256}{15}$","$\\dfrac{20\\sqrt{5}}{3}-\\dfrac{12\\sqrt{3}}{5}$"),
    correct:"4",
    explanation:"$z_x=\\sqrt{x},\\,z_y=\\sqrt{y}$, $1+z_x^2+z_y^2=1+x+y$.\n넓이 $=\\!\\int_1^2\\!\\!\\int_1^2\\sqrt{1+x+y}\\,dy\\,dx=\\dfrac{2}{3}\\!\\int_1^2[(3+x)^{3/2}-(2+x)^{3/2}]\\,dx$.\n$=\\dfrac{4}{15}[5^{5/2}-2\\cdot 4^{5/2}+3^{5/2}]=\\dfrac{4}{15}[25\\sqrt{5}-64+9\\sqrt{3}]=\\dfrac{20\\sqrt{5}}{3}+\\dfrac{12\\sqrt{3}}{5}-\\dfrac{256}{15}$.",
  },
  {n:9, subject:"미분학", unit:"미분방정식", concept:"연립 ODE 고유값",
    difficulty:"medium",
    question:"$y_1(t)$와 $y_2(t)$가 초깃값 문제\n$$y_1'=4y_1-y_2,\\,y_2'=-2y_1+3y_2,\\,y_1(0)=5,\\,y_2(0)=2$$\n의 해일 때, $y_1(1)$의 값은?",
    options:opts5("$-8e+13e^2$","$e^2+\\dfrac{8}{3}e^5$","$\\dfrac{7}{4}e+\\dfrac{13}{4}e^5$","$-\\dfrac{3}{2}e+\\dfrac{13}{2}e^2$","$\\dfrac{7}{3}e^2+\\dfrac{8}{3}e^5$"),
    correct:"5",
    explanation:"행렬 $A=\\begin{pmatrix}4&-1\\\\-2&3\\end{pmatrix}$. 특성방정식 $\\lambda^2-7\\lambda+10=0$, $\\lambda=2,5$.\n$\\lambda=2$ 고유벡터 $(1,2)$, $\\lambda=5$ 고유벡터 $(1,-1)$.\n초기조건: $c_1+c_2=5,\\,2c_1-c_2=2\\Rightarrow c_1=\\dfrac{7}{3},\\,c_2=\\dfrac{8}{3}$.\n$y_1(t)=\\dfrac{7}{3}e^{2t}+\\dfrac{8}{3}e^{5t}$. $y_1(1)=\\dfrac{7}{3}e^2+\\dfrac{8}{3}e^5$.",
  },
  {n:10, subject:"선형대수", unit:"선형변환", concept:"역행렬 성분 (cofactor)",
    difficulty:"medium",
    question:"행렬 $A$가 $A\\!\\begin{bmatrix}1\\\\0\\\\0\\end{bmatrix}=\\begin{bmatrix}1\\\\1\\\\1\\end{bmatrix},\\,A\\!\\begin{bmatrix}0\\\\2\\\\0\\end{bmatrix}=\\begin{bmatrix}1\\\\2\\\\3\\end{bmatrix},\\,A\\!\\begin{bmatrix}0\\\\0\\\\3\\end{bmatrix}=\\begin{bmatrix}1\\\\-1\\\\1\\end{bmatrix}$을 만족할 때, $A^{-1}$의 $(2,3)$ 성분은?",
    options:opts5("$-1$","$\\dfrac{4}{9}$","$\\dfrac{2}{3}$","$1$","$\\dfrac{4}{3}$"),
    correct:"4",
    explanation:"$A$의 열: 첫째 $(1,1,1)$, 둘째 $\\dfrac{1}{2}(1,2,3)=(1/2,1,3/2)$, 셋째 $\\dfrac{1}{3}(1,-1,1)=(1/3,-1/3,1/3)$.\n$\\det A=\\dfrac{2}{3}$.\n$(A^{-1})_{2,3}=\\dfrac{(-1)^{3+2}\\det M_{3,2}}{\\det A}$. $M_{3,2}=\\det\\!\\begin{pmatrix}1&1/3\\\\1&-1/3\\end{pmatrix}=-\\dfrac{2}{3}$.\n$(A^{-1})_{2,3}=\\dfrac{-(-2/3)}{2/3}=1$.",
  },
  {n:11, subject:"미분학", unit:"극한과 연속", concept:"피스와이즈 함수 미분가능",
    difficulty:"hard",
    question:"함수 $f(x)=\\begin{cases}(1+x)^{1/x}+ax+b&(x>0)\\\\|x|^{3/2}\\sin\\dfrac{1}{x}&(x<0)\\\\c&(x=0)\\end{cases}$가 모든 실수에서 미분가능할 때, $a+b+c$의 값은?",
    options:opts5("$-e$","$-\\dfrac{e}{2}$","$0$","$\\dfrac{e}{2}$","$e$"),
    correct:"2",
    explanation:"연속: $\\!\\lim_{x\\to 0^-}|x|^{3/2}\\sin\\dfrac{1}{x}=0$, $\\!\\lim_{x\\to 0^+}(1+x)^{1/x}+ax+b=e+b$. 둘 다 $c$ 이므로 $c=0,\\,b=-e$.\n좌도함수: $\\!\\lim t^{1/2}\\sin\\dfrac{1}{t}=0$.\n우도함수: $(1+x)^{1/x}=e\\!\\left(1-\\dfrac{x}{2}+\\dfrac{11x^2}{24}-\\cdots\\right)$. $\\dfrac{(1+x)^{1/x}-e}{x}\\to-\\dfrac{e}{2}$.\n$a-\\dfrac{e}{2}=0\\Rightarrow a=\\dfrac{e}{2}$.\n$a+b+c=\\dfrac{e}{2}-e+0=-\\dfrac{e}{2}$.",
  },
  {n:12, subject:"다변수함수", unit:"중적분", concept:"사면체 부피 적분",
    difficulty:"medium",
    question:"네 평면 $y=0,\\,z=0,\\,y=x,\\,x+y+z=2$로 둘러싸인 사면체 $T$에 대하여, 적분 $\\displaystyle\\iiint_T y\\,dV$의 값은?",
    options:opts5("$\\dfrac{1}{6}$","$\\dfrac{1}{3}$","$\\dfrac{1}{2}$","$1$","$\\dfrac{3}{2}$"),
    correct:"1",
    explanation:"꼭짓점 $(0,0,0),(2,0,0),(1,1,0),(0,0,2)$.\n$y\\in[0,1],\\,z\\in[0,2-2y],\\,x\\in[y,2-y-z]$.\n$\\!\\int_0^1 y\\!\\int_0^{2-2y}(2-2y-z)\\,dz\\,dy=\\!\\int_0^1 y\\cdot\\dfrac{(2-2y)^2}{2}\\,dy=2\\!\\int_0^1 y(1-y)^2\\,dy=2\\cdot\\dfrac{1}{12}=\\dfrac{1}{6}$.",
  },
  {n:13, subject:"다변수함수", unit:"선적분과 면적분", concept:"발산정리",
    difficulty:"hard",
    question:"$S$가 원뿔면 $z=\\sqrt{3(x^2+y^2)}$ 위와 구 $x^2+y^2+z^2=1$ 아래에 놓인 입체의 경계곡면일 때, $S$ 위에서 벡터장 $\\vec{F}(\\vec{r})=|\\vec{r}|\\vec{r}$의 면적분의 값은? (단, $\\vec{r}=x\\vec{i}+y\\vec{j}+z\\vec{k}$이고 $S$는 바깥으로 향하는 방향을 갖는 곡면)",
    options:opts5("$\\!\\left(\\dfrac{3-\\sqrt{3}}{4}\\right)\\pi$","$\\!\\left(\\dfrac{3-\\sqrt{3}}{2}\\right)\\pi$","$\\!\\left(1-\\dfrac{\\sqrt{3}}{2}\\right)\\pi$","$(2-\\sqrt{3})\\pi$","$(3-\\sqrt{3})\\pi$"),
    correct:"4",
    explanation:"$\\nabla\\cdot(|\\vec{r}|\\vec{r})=4|\\vec{r}|$ (계산: $\\partial_i(|\\vec{r}|x_i)=|\\vec{r}|+x_i^2/|\\vec{r}|$, 합 $=4|\\vec{r}|$).\n구면좌표: 원뿔 $\\tan\\varphi=\\dfrac{1}{\\sqrt{3}}\\Rightarrow\\varphi=\\dfrac{\\pi}{6}$. 영역 $0\\le\\varphi\\le\\dfrac{\\pi}{6},\\,0\\le\\rho\\le 1$.\n$\\!\\iiint 4\\rho\\cdot\\rho^2\\sin\\varphi\\,dV=4\\cdot 2\\pi\\cdot\\!\\left(1-\\dfrac{\\sqrt{3}}{2}\\right)\\cdot\\dfrac{1}{4}=(2-\\sqrt{3})\\pi$.",
  },
  {n:14, subject:"미분학", unit:"미분방정식", concept:"이계 ODE 경곗값 (중근)",
    difficulty:"hard",
    question:"$y(x)$가 경곗값 문제 $y''+4y'+4y=e^{-2x}+2x,\\,y(0)=\\dfrac{1}{2},\\,y(1)=2e^{-2}$의 해일 때, $y(-1)$의 값은?",
    options:opts5("$-e^2-1$","$-e^2$","$e^2-1$","$e^2$","$2e^2$"),
    correct:"3",
    explanation:"특성 $(r+2)^2=0$ ⇒ 동차해 $(c_1+c_2 x)e^{-2x}$.\n특해 $y_{p1}=\\dfrac{x^2}{2}e^{-2x}$ ($e^{-2x}$ 부분), $y_{p2}=\\dfrac{x}{2}-\\dfrac{1}{2}$ ($2x$ 부분).\n$y(0)=c_1-\\dfrac{1}{2}=\\dfrac{1}{2}\\Rightarrow c_1=1$. $y(1)=\\!\\left(1+c_2+\\dfrac{1}{2}\\right)e^{-2}=2e^{-2}\\Rightarrow c_2=\\dfrac{1}{2}$.\n$y(x)=\\!\\left(1+\\dfrac{x}{2}+\\dfrac{x^2}{2}\\right)e^{-2x}+\\dfrac{x}{2}-\\dfrac{1}{2}$.\n$y(-1)=e^2-1$.",
  },
  {n:15, subject:"선형대수", unit:"선형변환", concept:"직교행렬 정사영",
    difficulty:"medium",
    question:"$4\\times 4$ 직교행렬(orthogonal matrix) $A=\\begin{bmatrix}1/2&-1/\\sqrt{6}&3/\\sqrt{20}&a_1\\\\1/2&2/\\sqrt{6}&1/\\sqrt{20}&a_2\\\\1/2&-1/\\sqrt{6}&-1/\\sqrt{20}&a_3\\\\1/2&0&-3/\\sqrt{20}&a_4\\end{bmatrix}$에 대하여 벡터 $\\vec{b}=(1,2,1,3)$의 벡터 $\\vec{a}=(a_1,a_2,a_3,a_4)$ 위로의 정사영(orthogonal projection)을 $\\vec{p}=(p_1,p_2,p_3,p_4)$라고 할 때, $p_1$의 값은?",
    options:opts5("$\\dfrac{5}{\\sqrt{30}}$","$\\dfrac{1}{3}$","$\\dfrac{2}{\\sqrt{30}}$","$\\dfrac{5}{\\sqrt{15}}$","$\\dfrac{1}{2}$"),
    correct:"2",
    explanation:"직교행렬에서 $\\vec{b}=\\!\\sum(\\vec{b}\\cdot\\vec{v_i})\\vec{v_i}$, $\\vec{a}$ 위로의 정사영은 잔여항 $\\vec{p}=\\vec{b}-(\\vec{b}\\cdot\\vec{v_1})\\vec{v_1}-(\\vec{b}\\cdot\\vec{v_2})\\vec{v_2}-(\\vec{b}\\cdot\\vec{v_3})\\vec{v_3}$.\n$\\vec{b}\\cdot\\vec{v_1}=\\dfrac{7}{2}$, $\\vec{b}\\cdot\\vec{v_2}=\\dfrac{2}{\\sqrt{6}}$, $\\vec{b}\\cdot\\vec{v_3}=-\\dfrac{5}{\\sqrt{20}}$.\n$p_1=1-\\dfrac{7}{4}+\\dfrac{1}{3}+\\dfrac{3}{4}=\\dfrac{1}{3}$.",
  },
  {n:16, subject:"선형대수", unit:"고유치와 대각화", concept:"행렬 명제 진위",
    difficulty:"medium",
    question:"$3\\times 3$ 행렬 $A$와 $0$이 아닌 벡터 $\\vec{v_1},\\vec{v_2},\\vec{v_3}$에 대하여 $A\\vec{v_1}=\\vec{v_2},\\,A\\vec{v_2}=\\vec{v_1},\\,A\\vec{v_3}=2\\vec{v_3}$일 때, 다음 \\<보기\\>에서 옳은 것을 있는 대로 고른 것은? (단, $\\vec{v_1}$과 $\\vec{v_2}$는 일차독립)\n(ㄱ) $A$의 역행렬이 존재한다.\n(ㄴ) $A^2$은 대각화 가능하다.\n(ㄷ) $A^2$의 대각합(trace)은 $6$이다.",
    options:opts5("ㄱ","ㄷ","ㄱ, ㄷ","ㄴ, ㄷ","ㄱ, ㄴ, ㄷ"),
    correct:"5",
    explanation:"$A^2\\vec{v_1}=\\vec{v_1},\\,A^2\\vec{v_2}=\\vec{v_2},\\,A^2\\vec{v_3}=4\\vec{v_3}$.\n$A$ 위 span$(\\vec{v_1},\\vec{v_2})$에서 swap 작용 ⇒ 고윳값 $\\pm 1$. $\\vec{v_3}$는 독립 (고윳값 $2$ 모순 회피).\n$A$ 고윳값 $1,-1,2$, $\\det A=-2$. **ㄱ ✓**.\n$A^2$ 고윳값 $1,1,4$. 1에 대한 고유공간 2차원, 4에 1차원. **ㄴ ✓**.\ntrace$(A^2)=1+1+4=6$. **ㄷ ✓**.\n모두 옳음.",
  },
];

const TOTAL=PROBLEMS.length;
console.log(`총 ${TOTAL}문제 준비됨`);

const rows = PROBLEMS.map(p => {
  const id = `q-${YEAR}-${SCHOOL_EN}-${String(p.n).padStart(2,"0")}`;
  return {
    id,
    subject: p.subject,
    unit: p.unit,
    concept: p.concept,
    difficulty: p.difficulty,
    source_type: "imported",
    pool: "general",
    question: p.question,
    content_type: "latex",
    question_image: null,
    options: p.options,
    correct_option_id: p.correct,
    explanation: p.explanation,
    explanation_content_type: "latex",
    explanation_image: null,
    tags: [`year:${YEAR}`, `school:${SCHOOL_KO}`, `school_slug:${SCHOOL_EN}`, "past_exam"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
});

const { data, error } = await sb.from("questions").upsert(rows, { onConflict: "id" }).select("id");
if (error) {
  console.error("업로드 실패:", error);
  process.exit(1);
}
console.log(`업로드 완료: ${data.length}건`);
