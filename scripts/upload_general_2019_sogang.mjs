// 2019년 서강대 편입수학 객관식 16문항 (5지선다) — Q17~20은 주관식이라 제외
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2019", SCHOOL_KO="서강대", SCHOOL_EN="sogang";
const opts5 = (...t) => t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));

const PROBLEMS = [
  {n:1, subject:"미분학", unit:"극한과 연속", concept:"도함수 정의 활용",
    difficulty:"easyMedium",
    question:"극한 $\\displaystyle\\lim_{a\\to 0}\\dfrac{\\sqrt[4]{81+a}-3}{a}$의 값은?",
    options:opts5("$\\dfrac{1}{81}$","$\\dfrac{1}{92}$","$\\dfrac{1}{108}$","$\\dfrac{1}{120}$","$\\dfrac{1}{135}$"),
    correct:"3",
    explanation:"$\\dfrac{d}{da}(81+a)^{1/4}\\bigg|_{a=0}=\\dfrac{1}{4}\\cdot 81^{-3/4}=\\dfrac{1}{4\\cdot 27}=\\dfrac{1}{108}$.\n또는 분자유리화: $\\dfrac{(81+a)-81}{a\\cdot[(\\sqrt[4]{81+a})^3+\\cdots]}\\to\\dfrac{1}{4\\cdot 27}=\\dfrac{1}{108}$.",
  },
  {n:2, subject:"미분학", unit:"극한과 연속", concept:"미분가능·연속 명제",
    difficulty:"hard",
    question:"다음 \\<보기\\>에서 옳은 것만을 있는 대로 고른 것은?\n(ㄱ) $x=0$에서 미분가능한 함수 $f(x)$와 미분가능하지 않은 함수 $g(x)$를 더한 함수 $f(x)+g(x)$는 $x=0$에서 미분가능하지 않으나, 곱한 함수 $f(x)\\cdot g(x)$는 $x=0$에서 미분가능할 수도 있다.\n(ㄴ) 모든 실수 $x$에 대하여 $|h(x)-x^2|\\le\\sqrt[3]{x^2}$을 만족하는 함수 $h(x)$는 $x=0$에서 미분가능하다.\n(ㄷ) $|x-2|<\\delta$이면 $|x^3-2x-4|<\\dfrac{1}{10}$을 만족하는 양의 실수 $\\delta$가 존재한다.",
    options:opts5("ㄱ","ㄱ, ㄷ","ㄱ, ㄴ","ㄴ, ㄷ","ㄱ, ㄴ, ㄷ"),
    correct:"2",
    explanation:"(ㄱ) $f(x)=x,\\,g(x)=|x|$ 예: $f+g$는 $0$에서 미분 X, $fg=x|x|$는 $0$에서 미분가능. **참**.\n(ㄴ) 반례 $h(x)=x^2+x^{2/3}$. $|h-x^2|=x^{2/3}\\le x^{2/3}$ ✓. 그러나 $\\dfrac{h(x)-h(0)}{x}=x+x^{-1/3}\\to\\pm\\infty$. 미분 X. **거짓**.\n(ㄷ) $f(x)=x^3-2x$는 연속이고 $f(2)=4$. 연속의 $\\varepsilon\\delta$ 정의로 $\\delta$ 존재. **참**.\n따라서 (ㄱ), (ㄷ).",
  },
  {n:3, subject:"적분학", unit:"부정적분", concept:"선형 근사",
    difficulty:"medium",
    question:"함수 $f(x)=2+\\displaystyle\\int_{2-x}^{x^2}\\dfrac{1}{1+t+t^5}\\,dt$에 대하여 $x=1$에서의 선형 근사식을 이용하여 구한 $f(0.99)$의 근삿값은?",
    options:opts5("$1.97$","$1.976$","$1.98$","$1.99$","$1.996$"),
    correct:"4",
    explanation:"$f(1)=2+\\!\\int_1^1\\cdots\\,dt=2$.\n$f'(x)=\\dfrac{2x}{1+x^2+x^{10}}+\\dfrac{1}{1+(2-x)+(2-x)^5}$.\n$f'(1)=\\dfrac{2}{3}+\\dfrac{1}{3}=1$.\n선형근사 $f(0.99)\\approx 2+1\\cdot(-0.01)=1.99$.",
  },
  {n:4, subject:"미분학", unit:"도함수", concept:"역함수 단조 부등식",
    difficulty:"medium",
    question:"함수 $f(x)=2x^3-3x^2+2x+1$과 그 역함수 $g(x)$에 대하여 다음 \\<보기\\>에서 옳은 것만을 있는 대로 고른 것은?\n(ㄱ) 모든 실수 $x$에 대하여 $f'(x)\\ge\\dfrac{1}{2}$이다.\n(ㄴ) 모든 실수 $x$에 대하여 $0<g'(x)\\le 2$이다.\n(ㄷ) $x<y$인 모든 실수 $x,y$에 대하여 $0<g(y)-g(x)\\le 2(y-x)$이다.",
    options:opts5("ㄱ","ㄱ, ㄴ","ㄱ, ㄷ","ㄴ, ㄷ","ㄱ, ㄴ, ㄷ"),
    correct:"5",
    explanation:"$f'(x)=6x^2-6x+2=6\\!\\left(x-\\dfrac{1}{2}\\right)^2+\\dfrac{1}{2}\\ge\\dfrac{1}{2}$. (ㄱ) **참**.\n$g'(y)=\\dfrac{1}{f'(g(y))}\\in\\!\\left(0,\\dfrac{1}{1/2}\\right]=(0,2]$. (ㄴ) **참**.\n평균값정리: $g(y)-g(x)=g'(c)(y-x)$, $g'(c)\\in(0,2]$. (ㄷ) **참**.\n모두 옳음.",
  },
  {n:5, subject:"적분학", unit:"정적분의 응용", concept:"두 곡선 사이 넓이",
    difficulty:"medium",
    question:"두 곡선 $y=\\sin\\!\\left(\\dfrac{\\pi x}{4}\\right),\\,y=x^2-4x$로 둘러싸인 영역의 넓이는?",
    options:opts5("$\\dfrac{10}{\\pi}+\\dfrac{64}{3}$","$\\dfrac{12}{\\pi}+\\dfrac{64}{3}$","$\\dfrac{10}{\\pi}+\\dfrac{32}{3}$","$\\dfrac{8}{\\pi}+\\dfrac{32}{3}$","$\\dfrac{8}{\\pi}+\\dfrac{64}{3}$"),
    correct:"4",
    explanation:"교점: $\\sin\\!\\left(\\dfrac{\\pi x}{4}\\right)=x(x-4)\\Rightarrow x=0,\\,x=4$.\n구간 $[0,4]$에서 $\\sin\\ge 0,\\,x^2-4x\\le 0$.\n$A=\\!\\int_0^4\\!\\left[\\sin\\!\\left(\\dfrac{\\pi x}{4}\\right)-(x^2-4x)\\right]dx$.\n$\\!\\int_0^4\\sin\\!\\left(\\dfrac{\\pi x}{4}\\right)dx=\\dfrac{8}{\\pi}$, $\\!\\int_0^4(x^2-4x)\\,dx=-\\dfrac{32}{3}$.\n$A=\\dfrac{8}{\\pi}+\\dfrac{32}{3}$.",
  },
  {n:6, subject:"적분학", unit:"급수의 수렴/발산", concept:"급수 수렴판정",
    difficulty:"medium",
    question:"다음 \\<보기\\>의 급수 중에서 수렴하는 것만을 있는 대로 고른 것은?\n(ㄱ) $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n!}{2^n}$\n(ㄴ) $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{1}{n+1}\\cos\\!\\left(\\dfrac{\\pi}{n}\\right)$\n(ㄷ) $\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{\\ln n}{(n+1)(n+2)}$",
    options:opts5("ㄱ","ㄴ","ㄷ","ㄴ, ㄷ","ㄱ, ㄴ, ㄷ"),
    correct:"3",
    explanation:"(ㄱ) $\\dfrac{n!}{2^n}\\to\\infty$, 항조차 $\\to 0$이 아님. **발산**.\n(ㄴ) $\\cos\\!\\left(\\dfrac{\\pi}{n}\\right)\\to 1$, 항 $\\sim\\dfrac{1}{n}$. **발산**.\n(ㄷ) $\\dfrac{\\ln n}{(n+1)(n+2)}\\sim\\dfrac{\\ln n}{n^2}$. 적분판정 또는 비교 $\\dfrac{1}{n^{3/2}}$로 **수렴**.\n따라서 (ㄷ).",
  },
  {n:7, subject:"적분학", unit:"이상적분", concept:"이상적분 수렴판정",
    difficulty:"medium",
    question:"다음 \\<보기\\>의 이상적분(improper integral) 중에서 수렴하는 것만을 있는 대로 고른 것은?\n(ㄱ) $\\displaystyle\\int_0^{\\infty}x^2 e^{-\\sqrt{x}}\\,dx$\n(ㄴ) $\\displaystyle\\int_0^1\\dfrac{\\sin(\\pi x)}{1-x}\\,dx$\n(ㄷ) $\\displaystyle\\int_0^1\\dfrac{1}{x\\ln x}\\,dx$",
    options:opts5("ㄱ","ㄴ","ㄱ, ㄴ","ㄴ, ㄷ","ㄱ, ㄴ, ㄷ"),
    correct:"3",
    explanation:"(ㄱ) $u=\\sqrt{x}$ 치환: $2\\!\\int_0^{\\infty}u^5 e^{-u}\\,du=2\\Gamma(6)=240$. **수렴**.\n(ㄴ) $x\\to 1$에서 $\\dfrac{\\sin\\pi x}{1-x}=\\dfrac{\\sin(\\pi(1-u))}{u}=\\dfrac{\\sin\\pi u}{u}\\to\\pi$ (정칙). **수렴**.\n(ㄷ) $u=\\ln x$ 치환: $\\!\\int\\dfrac{du}{u}=\\ln|u|$. $x\\to 0^+$에서 $u\\to-\\infty$로 발산. **발산**.\n따라서 (ㄱ), (ㄴ).",
  },
  {n:8, subject:"적분학", unit:"이상적분", concept:"가우스 적분 활용",
    difficulty:"medium",
    question:"$\\displaystyle\\int_{-\\infty}^{\\infty}e^{-x^2}\\,dx=\\sqrt{\\pi}$를 이용하여 $\\displaystyle\\int_0^{\\infty}x^2 e^{-x^2}\\,dx$의 값을 구하면?",
    options:opts5("$\\dfrac{\\sqrt{\\pi}}{4}$","$\\dfrac{\\sqrt{\\pi}}{2}$","$\\dfrac{\\sqrt{\\pi}}{2\\sqrt{2}}$","$\\dfrac{\\sqrt{\\pi}}{\\sqrt{2}}$","$\\sqrt{\\pi}$"),
    correct:"1",
    explanation:"부분적분: $\\!\\int x^2 e^{-x^2}dx$. $u=x,\\,dv=xe^{-x^2}dx,\\,v=-\\dfrac{1}{2}e^{-x^2}$.\n$=\\!\\left[-\\dfrac{x}{2}e^{-x^2}\\right]_0^{\\infty}+\\dfrac{1}{2}\\!\\int_0^{\\infty}e^{-x^2}dx=0+\\dfrac{1}{2}\\cdot\\dfrac{\\sqrt{\\pi}}{2}=\\dfrac{\\sqrt{\\pi}}{4}$.",
  },
  {n:9, subject:"미분학", unit:"미분방정식", concept:"열방정식 자기유사해",
    difficulty:"hard",
    question:"실수 전체의 집합 $\\mathbb{R}$에서 두 번 미분가능한 함수 $f(y)$에 대하여 이변수함수 $u(x,t)=\\dfrac{1}{\\sqrt{t}}f\\!\\left(\\dfrac{x}{\\sqrt{t}}\\right)$가 영역 $D=\\{(x,t)\\in\\mathbb{R}^2\\,|\\,t>0\\}$에서 $\\dfrac{\\partial u}{\\partial t}=\\dfrac{\\partial^2 u}{\\partial x^2}$를 만족할 때, 함수 $f(y)$가 만족하는 식은?",
    options:opts5("$f''(y)+yf'(y)+f(y)=0$","$f''(y)+2yf'(y)+f(y)=0$","$2f''(y)+2yf'(y)-f(y)=0$","$2f''(y)+yf'(y)-f(y)=0$","$2f''(y)+yf'(y)+f(y)=0$"),
    correct:"5",
    explanation:"$u=t^{-1/2}f(y),\\,y=xt^{-1/2}$.\n$u_t=-\\dfrac{1}{2}t^{-3/2}f-t^{-1/2}f'\\!\\cdot\\dfrac{x}{2}t^{-3/2}=-\\dfrac{t^{-3/2}}{2}\\!\\left[f+yf'\\right]$.\n$u_x=t^{-1}f'(y)$, $u_{xx}=t^{-3/2}f''(y)$.\n$u_t=u_{xx}\\Rightarrow-\\dfrac{f+yf'}{2}=f''$이므로 $2f''+yf'+f=0$.",
  },
  {n:10, subject:"다변수함수", unit:"중적분", concept:"타원형 변수변환",
    difficulty:"medium",
    question:"영역 $D=\\{(x,y)\\in\\mathbb{R}^2\\,|\\,1\\le x^2+4y^2\\le 4\\}$에 대하여 이중적분 $\\displaystyle\\iint_D\\sqrt{x^2+4y^2}\\,dx\\,dy$의 값은?",
    options:opts5("$\\dfrac{7\\pi}{6}$","$\\dfrac{7\\pi}{3}$","$\\dfrac{28\\pi}{3}$","$\\dfrac{3\\pi}{4}$","$\\dfrac{3\\pi}{2}$"),
    correct:"2",
    explanation:"치환 $x=r\\cos\\theta,\\,2y=r\\sin\\theta$. 자코비안 $\\dfrac{r}{2}$, $x^2+4y^2=r^2$.\n영역 $1\\le r\\le 2,\\,0\\le\\theta\\le 2\\pi$.\n$\\!\\iint_D r\\cdot\\dfrac{r}{2}\\,dr\\,d\\theta=\\dfrac{1}{2}\\cdot 2\\pi\\!\\int_1^2 r^2\\,dr=\\pi\\cdot\\dfrac{7}{3}=\\dfrac{7\\pi}{3}$.",
  },
  {n:11, subject:"다변수함수", unit:"공간의 직선과 평면", concept:"회전곡면 접평면",
    difficulty:"medium",
    question:"$xz$평면 내의 곡선 $z=x^2+1,\\,x\\ge 0$을 $z$축 둘레로 회전시켰을 때 생기는 곡면의 점 $(1,1,3)$에서의 접평면을 $z=ax+by+c$라 할 때 $3a+4b+c$의 값은?",
    options:opts5("$11$","$13$","$15$","$16$","$17$"),
    correct:"2",
    explanation:"회전곡면: $z=x^2+y^2+1$. 점 $(1,1,3)$에서 $F(x,y,z)=z-x^2-y^2-1$, $\\nabla F=(-2x,-2y,1)\\big|_{(1,1,3)}=(-2,-2,1)$.\n접평면: $-2(x-1)-2(y-1)+(z-3)=0\\Rightarrow z=2x+2y-1$.\n$a=2,\\,b=2,\\,c=-1$. $3a+4b+c=6+8-1=13$.",
  },
  {n:12, subject:"다변수함수", unit:"선적분과 면적분", concept:"발산정리",
    difficulty:"medium",
    question:"원기둥 $x^2+y^2=1$과 두 평면 $z=10,\\,z=x$로 둘러싸인 3차원 영역의 경계면 $S$가 바깥으로 향하는 방향을 가지고 있다고 하자. 벡터장 $\\vec{F}=y\\vec{i}+(z+\\cos x)\\vec{j}+(e^{x^2}+z)\\vec{k}$에 대하여 적분 $\\displaystyle\\iint_S\\vec{F}\\cdot d\\vec{S}$의 값은?",
    options:opts5("$4\\pi$","$6\\pi$","$8\\pi$","$10\\pi$","$12\\pi$"),
    correct:"4",
    explanation:"$\\nabla\\cdot\\vec{F}=0+0+1=1$. 발산정리에 의해 $\\!\\iint_S\\vec{F}\\cdot d\\vec{S}=\\!\\iiint_V dV=V$.\n$V=\\!\\iint_{x^2+y^2\\le 1}(10-x)\\,dA=10\\pi-0=10\\pi$ (대칭으로 $\\!\\iint x\\,dA=0$).",
  },
  {n:13, subject:"미분학", unit:"미분방정식", concept:"연립ODE 고유값 해",
    difficulty:"medium",
    question:"다음 연립미분방정식에 대한 초깃값 문제의 해는?\n$$\\begin{bmatrix}y_1'\\\\y_2'\\end{bmatrix}=\\begin{bmatrix}0&1\\\\2&-1\\end{bmatrix}\\!\\begin{bmatrix}y_1\\\\y_2\\end{bmatrix},\\;\\begin{bmatrix}y_1(0)\\\\y_2(0)\\end{bmatrix}=\\begin{bmatrix}1\\\\2\\end{bmatrix}$$",
    options:opts5("$\\dfrac{1}{2}e^t\\!\\begin{bmatrix}1\\\\1\\end{bmatrix}+\\dfrac{1}{2}e^{-2t}\\!\\begin{bmatrix}1\\\\3\\end{bmatrix}$","$\\dfrac{4}{3}e^{-2t}\\!\\begin{bmatrix}1\\\\1\\end{bmatrix}+\\dfrac{1}{3}e^t\\!\\begin{bmatrix}-1\\\\2\\end{bmatrix}$","$\\dfrac{4}{3}e^t\\!\\begin{bmatrix}1\\\\1\\end{bmatrix}+\\dfrac{1}{3}e^{-2t}\\!\\begin{bmatrix}-1\\\\2\\end{bmatrix}$","$\\dfrac{1}{2}e^t\\!\\begin{bmatrix}1\\\\3\\end{bmatrix}+\\dfrac{1}{2}e^{-2t}\\!\\begin{bmatrix}1\\\\1\\end{bmatrix}$","$\\dfrac{4}{3}e^{-t}\\!\\begin{bmatrix}1\\\\1\\end{bmatrix}+\\dfrac{1}{3}e^{2t}\\!\\begin{bmatrix}-1\\\\2\\end{bmatrix}$"),
    correct:"3",
    explanation:"특성방정식 $\\lambda^2+\\lambda-2=0\\Rightarrow\\lambda=1,-2$.\n$\\lambda=1$ 고유벡터 $(1,1)$, $\\lambda=-2$ 고유벡터 $(-1,2)$.\n$y=c_1 e^t(1,1)+c_2 e^{-2t}(-1,2)$. 초기조건: $c_1-c_2=1,\\,c_1+2c_2=2\\Rightarrow c_1=\\dfrac{4}{3},\\,c_2=\\dfrac{1}{3}$.",
  },
  {n:14, subject:"미분학", unit:"미분방정식", concept:"적분인자",
    difficulty:"medium",
    question:"완전 미분방정식(exact differential equation)이 아닌 일계 미분방정식 $(4x^3\\cot y)\\,dx=(\\csc^2 y)\\,dy$를 완전 미분방정식으로 변환하는 적분인자(integrating factor)가 될 수 있는 것은? (단, 아래에서 $\\exp(t)=e^t$이다.)",
    options:opts5("$\\exp(4x^2)$","$\\exp(-2x^2)$","$\\exp(4x^3)$","$\\exp(x^4)$","$\\exp(-x^4)$"),
    correct:"4",
    explanation:"$(4x^3\\cot y)\\,dx-(\\csc^2 y)\\,dy=0$. $M=4x^3\\cot y,\\,N=-\\csc^2 y$.\n$M_y=-4x^3\\csc^2 y,\\,N_x=0$. $\\dfrac{M_y-N_x}{N}=\\dfrac{-4x^3\\csc^2 y}{-\\csc^2 y}=4x^3$ ($x$만의 함수).\n적분인자 $\\mu(x)=\\exp\\!\\left(\\!\\int 4x^3\\,dx\\right)=\\exp(x^4)$.",
  },
  {n:15, subject:"선형대수", unit:"고유치와 대각화", concept:"닮음 변환 trace·det",
    difficulty:"easy",
    question:"행렬 $A=\\begin{bmatrix}0&1&0\\\\4&0&0\\\\0&1&1\\end{bmatrix}$는 어떤 대각행렬 $D$와 가역행렬 $S$에 대하여 $A=S^{-1}DS$를 만족한다. $D$의 대각합(trace)과 행렬식(determinant)의 합은?",
    options:opts5("$-3$","$4$","$-4$","$2$","$-1$"),
    correct:"1",
    explanation:"$A$와 $D$가 닮음이므로 trace와 det이 보존된다.\n$\\mathrm{tr}(A)=0+0+1=1$.\n$\\det(A)$: 3열 전개 $1\\cdot\\det\\!\\begin{pmatrix}0&1\\\\4&0\\end{pmatrix}=1\\cdot(-4)=-4$.\n합 $=1+(-4)=-3$.",
  },
  {n:16, subject:"선형대수", unit:"행렬", concept:"rank-nullity 정리",
    difficulty:"medium",
    question:"행렬 $A=\\begin{bmatrix}1&8&4&1&2\\\\1&4&2&1&0\\\\0&2&1&0&1\\end{bmatrix}$에 대하여, $A$의 계급수(rank)를 $r$, $A$의 영공간(nullspace)의 차원을 $n$, $A$의 열공간(column space)의 차원을 $c$라고 할 때, $r+2n+3c$의 값은?",
    options:opts5("$12$","$14$","$15$","$16$","$18$"),
    correct:"2",
    explanation:"행축약: $R_1-R_2=(0,4,2,0,2)$. $R_3=(0,2,1,0,1)$로 비례 $\\Rightarrow R_1-R_2=2R_3$.\n독립행 2개 ⇒ $r=2$. nullity $n=5-2=3$, 열공간 차원 $c=r=2$.\n$r+2n+3c=2+6+6=14$.",
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
