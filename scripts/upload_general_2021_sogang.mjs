// 2021년 서강대 편입수학 객관식 16문항 (5지선다) — Q17~20은 주관식이라 제외
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2021", SCHOOL_KO="서강대", SCHOOL_EN="sogang";
const opts5 = (...t) => t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));

const PROBLEMS = [
  {n:1, subject:"미분학", unit:"극한과 연속", concept:"역함수 테일러 극한",
    difficulty:"medium",
    question:"함수 $f(x)=x-\\sin x$의 역함수를 $g(x)$라고 할 때, 극한 $\\displaystyle\\lim_{x\\to 0}\\dfrac{\\{g(x)\\}^3}{3x}$의 값은?",
    options:opts5("$0$","$1$","$2$","$6$","$\\infty$"),
    correct:"3",
    explanation:"$f(x)=x-\\sin x=\\dfrac{x^3}{6}-\\dfrac{x^5}{120}+\\cdots\\sim\\dfrac{x^3}{6}$ ($x\\to 0$).\n역함수: $f(x)=y\\Rightarrow x\\sim(6y)^{1/3}$이므로 $g(x)\\sim(6x)^{1/3}$, $\\{g(x)\\}^3\\sim 6x$.\n$\\dfrac{\\{g(x)\\}^3}{3x}\\to\\dfrac{6x}{3x}=2$.",
  },
  {n:2, subject:"적분학", unit:"부정적분", concept:"역삼각함수 적분 합",
    difficulty:"easy",
    question:"$f(x)=\\displaystyle\\int_0^x\\cos^{-1}t\\,dt,\\,g(x)=\\displaystyle\\int_0^x\\sin^{-1}t\\,dt\\;(-1\\le x\\le 1)$일 때, $f\\!\\left(\\dfrac{1}{3}\\right)+g\\!\\left(-\\dfrac{1}{3}\\right)$의 값은? (단, 모든 $t\\in[-1,1]$에 대하여 $-\\dfrac{\\pi}{2}\\le\\sin^{-1}t\\le\\dfrac{\\pi}{2},\\,0\\le\\cos^{-1}t\\le\\pi$)",
    options:opts5("$-\\dfrac{\\pi}{3}$","$-\\dfrac{\\pi}{6}$","$0$","$\\dfrac{\\pi}{6}$","$\\dfrac{\\pi}{3}$"),
    correct:"4",
    explanation:"$\\sin^{-1}$이 홀함수이므로 $g(-x)=g(x)$ (즉 $g$는 짝함수). $g\\!\\left(-\\dfrac{1}{3}\\right)=g\\!\\left(\\dfrac{1}{3}\\right)=\\!\\int_0^{1/3}\\sin^{-1}t\\,dt$.\n$\\sin^{-1}t+\\cos^{-1}t=\\dfrac{\\pi}{2}$이므로\n$f\\!\\left(\\dfrac{1}{3}\\right)+g\\!\\left(-\\dfrac{1}{3}\\right)=\\!\\int_0^{1/3}(\\cos^{-1}t+\\sin^{-1}t)\\,dt=\\dfrac{\\pi}{2}\\cdot\\dfrac{1}{3}=\\dfrac{\\pi}{6}$.",
  },
  {n:3, subject:"적분학", unit:"급수의 수렴/발산", concept:"극한 비교판정",
    difficulty:"medium",
    question:"급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\sqrt{4n+n^2}\\,\\tan\\!\\left(\\dfrac{1}{n^p}\\right)$이 수렴하는 양의 실수 $p$의 범위는?",
    options:opts5("$p>\\dfrac{1}{2}$","$p>1$","$p>\\dfrac{3}{2}$","$p>2$","$p>\\dfrac{5}{2}$"),
    correct:"4",
    explanation:"$n\\to\\infty$에서 $\\sqrt{4n+n^2}\\sim n$, $\\tan\\!\\left(\\dfrac{1}{n^p}\\right)\\sim\\dfrac{1}{n^p}$.\n항 $\\sim\\dfrac{n}{n^p}=\\dfrac{1}{n^{p-1}}$. 수렴 $\\Leftrightarrow p-1>1\\Leftrightarrow p>2$.",
  },
  {n:4, subject:"다변수함수", unit:"중적분", concept:"변형 구면좌표 자코비안",
    difficulty:"medium",
    question:"$x=2\\rho\\sin\\varphi\\cos\\theta,\\,y=2\\rho\\sin\\varphi\\sin\\theta,\\,z=\\rho\\cos\\varphi$일 때, 다음 행렬식을 계산하면?\n$$\\begin{vmatrix}\\dfrac{\\partial x}{\\partial\\rho}&\\dfrac{\\partial x}{\\partial\\theta}&\\dfrac{\\partial x}{\\partial\\varphi}\\\\\\dfrac{\\partial y}{\\partial\\rho}&\\dfrac{\\partial y}{\\partial\\theta}&\\dfrac{\\partial y}{\\partial\\varphi}\\\\\\dfrac{\\partial z}{\\partial\\rho}&\\dfrac{\\partial z}{\\partial\\theta}&\\dfrac{\\partial z}{\\partial\\varphi}\\end{vmatrix}$$",
    options:opts5("$-2\\rho^2\\sin\\varphi$","$-4\\rho^2\\sin\\varphi$","$4\\rho^2\\sin\\varphi$","$2\\rho^2\\sin\\theta$","$4\\rho^2\\sin\\theta$"),
    correct:"2",
    explanation:"표준 구면좌표 $(\\rho,\\theta,\\varphi)$의 자코비안 $-\\rho^2\\sin\\varphi$ (열 순서에 따라 부호).\n여기서 $x,y$가 각각 $2$배 스케일되었으므로 $|\\det|$이 $4$배.\n전개 결과 $-4\\rho^2\\sin\\varphi$.",
  },
  {n:5, subject:"다변수함수", unit:"편도함수의 응용", concept:"AM-GM 또는 라그랑주 최대",
    difficulty:"medium",
    question:"음이 아닌 세 실수 $p,q,r$가 $p+2q+3r=1$을 만족할 때, $A=p^{1/6}q^{1/3}r^{1/2}$의 최댓값은?",
    options:opts5("$\\dfrac{1}{6}$","$\\dfrac{1}{3}$","$\\dfrac{1}{2}$","$1$","$2$"),
    correct:"1",
    explanation:"라그랑주 또는 가중 AM-GM. $\\ln A=\\dfrac{1}{6}\\ln p+\\dfrac{1}{3}\\ln q+\\dfrac{1}{2}\\ln r$ 최대화.\n임계점: $p=q=r=\\dfrac{1}{6}$ (제약 $p+2q+3r=6p=1$).\n$A=\\!\\left(\\dfrac{1}{6}\\right)^{1/6+1/3+1/2}=\\dfrac{1}{6}$.",
  },
  {n:6, subject:"다변수함수", unit:"선적분과 면적분", concept:"3차원 곡선 선적분",
    difficulty:"medium",
    question:"곡선 $C$가 매개변수방정식 $x=4\\cos t,\\,y=3t,\\,z=4\\sin t\\;(0\\le t\\le 2\\pi)$로 정의될 때, $C$ 위에서 벡터장 $\\vec{F}(x,y,z)=(x-y)\\vec{i}+(y-z)\\vec{j}+(z-x)\\vec{k}$의 선적분의 값은?",
    options:opts5("$16\\pi^2+30\\pi$","$16\\pi^2-30\\pi$","$30\\pi^2+16\\pi$","$18\\pi^2+40\\pi$","$18\\pi^2-40\\pi$"),
    correct:"5",
    explanation:"$\\vec{r}\\,'(t)=(-4\\sin t,3,4\\cos t)$, $\\vec{F}(\\vec{r})=(4\\cos t-3t,\\,3t-4\\sin t,\\,4\\sin t-4\\cos t)$.\n$\\vec{F}\\cdot\\vec{r}\\,'=12t\\sin t+9t-12\\sin t-16\\cos^2 t$.\n$\\!\\int_0^{2\\pi}12t\\sin t\\,dt=-24\\pi,\\,\\!\\int_0^{2\\pi}9t\\,dt=18\\pi^2,\\,\\!\\int_0^{2\\pi}-16\\cos^2 t\\,dt=-16\\pi$.\n합 $=18\\pi^2-40\\pi$.",
  },
  {n:7, subject:"다변수함수", unit:"선적분과 면적분", concept:"그린정리 극좌표",
    difficulty:"hard",
    question:"곡선 $C$가 $P(1,0)$에서 $Q(2,0)$까지의 선분, $Q$에서 $R(0,2)$까지의 중심이 원점이고 반지름이 $2$인 원의 호, $R$에서 $S(0,1)$까지의 선분, 그리고 $S$에서 $P$까지의 중심이 원점이고 반지름이 $1$인 원의 호로 이루어진 곡선일 때, 선적분 $\\displaystyle\\int_C(2x^2y^2+y^4)\\,dx+(ye^{-2y})\\,dy$의 값은?",
    options:opts5("$-\\dfrac{124}{5}$","$-15$","$0$","$15$","$\\dfrac{124}{5}$"),
    correct:"1",
    explanation:"$P=2x^2y^2+y^4,\\,Q=ye^{-2y}$. $Q_x-P_y=-(4x^2y+4y^3)=-4y(x^2+y^2)$.\n그린정리 (반시계 양의 방향): $\\!\\oint=\\!\\iint_D Q_x-P_y\\,dA$.\n$D$: 1사분면, $1\\le r\\le 2$. 극좌표로 $-4y(x^2+y^2)=-4r^3\\sin\\theta$.\n$\\!\\iint=\\!\\int_0^{\\pi/2}\\!\\!\\int_1^2-4r^4\\sin\\theta\\,dr\\,d\\theta=-4\\cdot 1\\cdot\\dfrac{31}{5}=-\\dfrac{124}{5}$.",
  },
  {n:8, subject:"다변수함수", unit:"선적분과 면적분", concept:"발산정리",
    difficulty:"medium",
    question:"$A(1,2,3),\\,B(2,2,3),\\,C(1,4,3),\\,D(2,4,6)$을 꼭짓점으로 갖는 사면체의 경계면 $S$가 바깥으로 향하는 방향을 가지고 있다고 하자. $S$ 위에서 벡터장 $\\vec{F}(x,y,z)=(3x+y)\\vec{i}+(2yz)\\vec{j}+(e^x-z^2)\\vec{k}$의 면적분의 값은?",
    options:opts5("$1$","$2$","$3$","$6$","$18$"),
    correct:"3",
    explanation:"$\\nabla\\cdot\\vec{F}=3+2z-2z=3$.\n사면체 부피: $\\vec{AB}=(1,0,0),\\,\\vec{AC}=(0,2,0),\\,\\vec{AD}=(1,2,3)$.\n$V=\\dfrac{1}{6}|\\det(\\vec{AB},\\vec{AC},\\vec{AD})|=\\dfrac{1}{6}|6|=1$.\n발산정리: $\\!\\iint_S\\vec{F}\\cdot d\\vec{S}=\\!\\iiint_V 3\\,dV=3\\cdot 1=3$.",
  },
  {n:9, subject:"선형대수", unit:"고유치와 대각화", concept:"고유벡터 결정",
    difficulty:"medium",
    question:"행렬 $A=\\begin{bmatrix}1&0&1\\\\0&1&a\\\\2&1&1\\end{bmatrix}$에 대하여, $(1,b,-2)$가 $A$의 고유벡터라고 하자. $A$의 고윳값 중 가장 큰 것을 $c$라고 할 때, $a+b+c$의 값은?",
    options:opts5("$3$","$4$","$5$","$6$","$7$"),
    correct:"5",
    explanation:"$A(1,b,-2)^T=\\lambda(1,b,-2)^T$.\n행1: $1+0-2=-1=\\lambda\\Rightarrow\\lambda=-1$.\n행3: $2+b-2=b=-2\\lambda=2\\Rightarrow b=2$.\n행2: $0+b-2a=-b\\Rightarrow 2b=2a\\Rightarrow a=2$.\n특성방정식 $(1-\\lambda)[(1-\\lambda)^2-4]=0$: $\\lambda=1,-1,3$. $c=3$.\n$a+b+c=2+2+3=7$.",
  },
  {n:10, subject:"미분학", unit:"미분방정식", concept:"라플라스 초깃값 정리",
    difficulty:"easy",
    question:"$L$을 라플라스 변환(Laplace transform)이라고 하고 $L^{-1}$를 $L$의 역변환이라고 하자. $f(t)=L^{-1}\\!\\left[\\dfrac{s+15}{s^3+2s^2+5s}\\right]\\!(t)$라고 할 때, $f(0)$의 값은?",
    options:opts5("$0$","$1$","$2$","$3$","$6$"),
    correct:"1",
    explanation:"라플라스 초깃값 정리: $f(0^+)=\\!\\lim_{s\\to\\infty}sF(s)$.\n$sF(s)=\\dfrac{s(s+15)}{s^3+2s^2+5s}=\\dfrac{s+15}{s^2+2s+5}\\to 0$.",
  },
  {n:11, subject:"미분학", unit:"극한과 연속", concept:"테일러 급수 3계도함수",
    difficulty:"medium",
    question:"함수 $f(x)=\\begin{cases}\\dfrac{2(e^{-x}-1+x)}{x^2}&(x\\ne 0)\\\\1&(x=0)\\end{cases}$에 대하여 $f'''(0)$의 값은?",
    options:opts5("$-\\dfrac{1}{60}$","$-\\dfrac{1}{20}$","$-\\dfrac{1}{10}$","$\\dfrac{1}{10}$","$\\dfrac{1}{20}$"),
    correct:"3",
    explanation:"$e^{-x}-1+x=\\dfrac{x^2}{2}-\\dfrac{x^3}{6}+\\dfrac{x^4}{24}-\\dfrac{x^5}{120}+\\cdots$.\n$\\dfrac{2(e^{-x}-1+x)}{x^2}=1-\\dfrac{x}{3}+\\dfrac{x^2}{12}-\\dfrac{x^3}{60}+\\cdots$.\n$f'''(0)=3!\\cdot[\\text{$x^3$ 계수}]=6\\cdot\\!\\left(-\\dfrac{1}{60}\\right)=-\\dfrac{1}{10}$.",
  },
  {n:12, subject:"적분학", unit:"급수의 수렴/발산", concept:"푸리에 계수 수렴",
    difficulty:"hard",
    question:"자연수 $n$에 대하여 $a_n=\\displaystyle\\int_0^4 x\\sin\\dfrac{n\\pi x}{4}\\,dx,\\,b_n=\\displaystyle\\int_0^2 x\\cos\\dfrac{n\\pi x}{2}\\,dx$라고 할 때, 다음 \\<보기\\>에서 옳은 것만을 있는 대로 고른 것은?\n(ㄱ) $\\displaystyle\\sum_{n=1}^{\\infty}a_n$은 수렴한다.\n(ㄴ) $\\displaystyle\\sum_{n=1}^{\\infty}b_n$은 수렴한다.\n(ㄷ) $\\displaystyle\\sum_{n=1}^{\\infty}a_n$은 절대수렴한다.\n(ㄹ) $\\displaystyle\\sum_{n=1}^{\\infty}b_n$은 절대수렴한다.",
    options:opts5("ㄱ, ㄴ","ㄱ, ㄷ","ㄴ, ㄹ","ㄱ, ㄴ, ㄷ","ㄱ, ㄴ, ㄹ"),
    correct:"5",
    explanation:"$a_n=(-1)^{n+1}\\dfrac{16}{n\\pi}$. $\\!\\sum a_n$ 교대급수로 수렴, $|a_n|\\sim\\dfrac{1}{n}$로 절대수렴 X.\n$b_n=\\dfrac{4}{(n\\pi)^2}((-1)^n-1)$. 홀수 $n$만 비영, $\\sim\\dfrac{1}{n^2}$로 절대수렴.\n(ㄱ) ✓ (ㄴ) ✓ (ㄷ) X (ㄹ) ✓.",
  },
  {n:13, subject:"다변수함수", unit:"중적분", concept:"적분순서 변경",
    difficulty:"hard",
    question:"적분 $\\displaystyle\\int_0^1\\!\\!\\int_0^{1-z^2}\\!\\!\\int_0^{1-z}2e^{(1-x)^2}\\,dx\\,dy\\,dz$의 값은?",
    options:opts5("$-e-\\dfrac{4}{3}$","$-e+\\dfrac{4}{3}$","$1$","$e-\\dfrac{4}{3}$","$e+\\dfrac{4}{3}$"),
    correct:"4",
    explanation:"$x$ 적분이 $y,z$에 의존하지 않으므로 적분순서 변경: $x\\in[0,1],\\,z\\in[0,1-x],\\,y\\in[0,1-z^2]$.\n$\\!\\int_0^1 2e^{(1-x)^2}\\!\\!\\int_0^{1-x}(1-z^2)\\,dz\\,dx$.\n$u=1-x$ 치환: $\\!\\int_0^1 2e^{u^2}\\!\\left(u-\\dfrac{u^3}{3}\\right)du$.\n$\\!\\int_0^1 2u e^{u^2}du=e-1$, $\\!\\int_0^1\\dfrac{2u^3}{3}e^{u^2}du=\\dfrac{1}{3}$.\n합 $=(e-1)-\\dfrac{1}{3}=e-\\dfrac{4}{3}$.",
  },
  {n:14, subject:"선형대수", unit:"선형변환", concept:"직교행렬 역행렬 성분",
    difficulty:"medium",
    question:"$\\vec{v}_1=\\dfrac{1}{\\sqrt{3}}(1,1,1),\\,\\vec{v}_2=\\dfrac{1}{\\sqrt{2}}(1,0,-1),\\,\\vec{v}_3=(a,b,c)$가 공간 $\\mathbb{R}^3$의 직교정규기저(orthonormal basis)를 이룬다고 하자. 세 벡터 $\\vec{v}_1,\\vec{v}_2,\\vec{v}_3$를 첫 번째, 두 번째, 세 번째 열로 가지는 행렬 $A$에 대하여, $A^{-1}$의 $(3,2)$ 성분은? (단, $a$는 양의 실수)",
    options:opts5("$-\\dfrac{\\sqrt{6}}{2}$","$-\\dfrac{\\sqrt{6}}{3}$","$0$","$\\dfrac{\\sqrt{6}}{3}$","$\\dfrac{\\sqrt{6}}{2}$"),
    correct:"2",
    explanation:"$A$가 직교행렬이므로 $A^{-1}=A^T$. $(A^{-1})_{32}=A_{23}=v_3$의 두 번째 성분 $=b$.\n$\\vec{v}_3$는 $\\vec{v}_1\\times\\vec{v}_2$ 방향: $(1,1,1)\\times(1,0,-1)=(-1,2,-1)$.\n$a>0$ 조건에서 $\\vec{v}_3=\\dfrac{1}{\\sqrt{6}}(1,-2,1)$. $b=-\\dfrac{2}{\\sqrt{6}}=-\\dfrac{\\sqrt{6}}{3}$.",
  },
  {n:15, subject:"미분학", unit:"미분방정식", concept:"베르누이 미분방정식",
    difficulty:"medium",
    question:"$y(t)$가 초깃값 문제 $y'-2y=-4y^2,\\,y(0)=\\dfrac{1}{4}$의 해일 때, $y(\\ln 2)$의 값은?",
    options:opts5("$\\dfrac{1}{10}$","$\\dfrac{1}{5}$","$\\dfrac{1}{3}$","$\\dfrac{2}{5}$","$\\dfrac{2}{3}$"),
    correct:"4",
    explanation:"베르누이형. $u=\\dfrac{1}{y}$ 치환: $u'=-\\dfrac{y'}{y^2}=-\\dfrac{2y-4y^2}{y^2}=-2u+4$.\n$u'+2u=4$. 적분인자 $e^{2t}$: $u\\cdot e^{2t}=2e^{2t}+C$. $u=2+Ce^{-2t}$.\n$u(0)=4=2+C\\Rightarrow C=2$. $y(t)=\\dfrac{1}{2+2e^{-2t}}$.\n$y(\\ln 2)=\\dfrac{1}{2+1/2}=\\dfrac{2}{5}$.",
  },
  {n:16, subject:"미분학", unit:"미분방정식", concept:"2D 라플라스 방정식 라디알 해",
    difficulty:"hard",
    question:"함수 $f(r)$가 구간 $(0,\\infty)$에서 두 번 미분가능하고 $f(1)=0,\\,f'(1)=1$이라고 하자. 이변수함수 $u(x,y)=f(\\sqrt{x^2+y^2})$이 원점 $(0,0)$을 제외한 모든 점 $(x,y)$에서 $u_{xx}(x,y)+u_{yy}(x,y)=0$을 만족할 때, 이상적분 $\\displaystyle\\int_0^1 f(r)\\,dr$의 값은?",
    options:opts5("$-2$","$-1$","$0$","$1$","$2$"),
    correct:"2",
    explanation:"방사형 함수 라플라시안: $f''(r)+\\dfrac{f'(r)}{r}=0\\Rightarrow(rf'(r))'=0\\Rightarrow f'(r)=\\dfrac{C}{r}$.\n$f'(1)=1\\Rightarrow C=1$, $f'(r)=\\dfrac{1}{r}$, $f(r)=\\ln r+D$. $f(1)=0\\Rightarrow D=0$.\n$\\!\\int_0^1\\ln r\\,dr=[r\\ln r-r]_0^1=0-1-0=-1$.",
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
