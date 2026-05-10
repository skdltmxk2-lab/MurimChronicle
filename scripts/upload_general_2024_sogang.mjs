// 2024년 서강대 편입수학 객관식 16문항 (5지선다) — Q17~20은 주관식이라 제외
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2024", SCHOOL_KO="서강대", SCHOOL_EN="sogang";
const opts5 = (...t) => t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));

const PROBLEMS = [
  {n:1, subject:"미분학", unit:"극한과 연속", concept:"역함수 극한",
    difficulty:"medium",
    question:"함수 $f(x)=x^2+e^{2x}-1$의 역함수를 $g(x)$라고 할 때, 극한 $\\displaystyle\\lim_{x\\to 0}\\dfrac{g(x)}{xg'(x)}$의 값은?",
    options:opts5("$-2$","$-1$","$0$","$1$","$2$"),
    correct:"4",
    explanation:"$f(0)=0\\Rightarrow g(0)=0$. $f'(0)=2\\Rightarrow g'(0)=\\dfrac{1}{2}$.\n$g(x)\\sim g'(0)x=\\dfrac{x}{2}$, $g'(x)\\to g'(0)=\\dfrac{1}{2}$.\n$\\dfrac{g(x)}{xg'(x)}\\to\\dfrac{x/2}{x\\cdot 1/2}=1$.",
  },
  {n:2, subject:"미분학", unit:"도함수", concept:"테일러 급수 2계도함수",
    difficulty:"medium",
    question:"구간 $(-1,1)$에서 정의된 함수 $f(x)=\\begin{cases}\\dfrac{(1-x)\\ln(1-x)}{x}&(x\\ne 0)\\\\-1&(x=0)\\end{cases}$에 대하여 $f''(0)$의 값은?",
    options:opts5("$\\dfrac{1}{3}$","$-\\dfrac{1}{3}$","$-\\dfrac{1}{6}$","$\\dfrac{1}{2}$","$1$"),
    correct:"1",
    explanation:"$\\ln(1-x)=-x-\\dfrac{x^2}{2}-\\dfrac{x^3}{3}-\\cdots$.\n$(1-x)\\ln(1-x)=-x+\\dfrac{x^2}{2}+\\dfrac{x^3}{6}+\\dfrac{x^4}{12}+\\cdots$.\n$f(x)=-1+\\dfrac{x}{2}+\\dfrac{x^2}{6}+\\cdots$.\n$f''(0)=2!\\cdot\\dfrac{1}{6}=\\dfrac{1}{3}$.",
  },
  {n:3, subject:"미분학", unit:"극한과 연속", concept:"테일러 전개 극한",
    difficulty:"medium",
    question:"극한 $\\displaystyle\\lim_{x\\to 0}\\dfrac{1}{x^2}\\ln\\!\\left(\\dfrac{\\tan x}{x}\\right)$의 값은?",
    options:opts5("$\\dfrac{1}{2}$","$0$","$\\dfrac{1}{6}$","$1$","$\\dfrac{1}{3}$"),
    correct:"5",
    explanation:"$\\dfrac{\\tan x}{x}=1+\\dfrac{x^2}{3}+\\dfrac{2x^4}{15}+\\cdots$.\n$\\ln\\!\\left(1+\\dfrac{x^2}{3}+\\cdots\\right)=\\dfrac{x^2}{3}+O(x^4)$.\n$\\dfrac{1}{x^2}\\ln(\\cdots)\\to\\dfrac{1}{3}$.",
  },
  {n:4, subject:"다변수함수", unit:"공간의 직선과 평면", concept:"두 직선 포함 평면",
    difficulty:"medium",
    question:"한 점에서 만나는 두 직선 $\\dfrac{x-2}{3}=\\dfrac{y-6}{-2}=\\dfrac{z+1}{4},\\,\\dfrac{x-1}{2}=\\dfrac{y+2}{3}=\\dfrac{z-7}{-2}$을 포함하는 평면의 방정식이 $ax+by+cz+55=0$이라고 할 때, $a+b+c$의 값은? (단, $a,b,c$는 상수)",
    options:opts5("$-19$","$19$","$-9$","$9$","$35$"),
    correct:"1",
    explanation:"교점: 매개변수 풀면 $(5,4,3)$.\n법선 $\\vec{d_1}\\times\\vec{d_2}=(3,-2,4)\\times(2,3,-2)=(-8,14,13)$.\n평면 $-8x+14y+13z+d=0$, 통과점 $(5,4,3)\\Rightarrow d=-55$.\n방정식 $8x-14y-13z+55=0$. $a+b+c=8-14-13=-19$.",
  },
  {n:5, subject:"다변수함수", unit:"극한과 연속", concept:"이변수 극한 판정",
    difficulty:"medium",
    question:"다음 \\<보기\\>에서 옳은 것만을 있는 대로 고른 것은?\n(가) $\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{x^2y}{x^2+y^2}=0$\n(나) $\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{xy}{x^2+4y^2}=0$\n(다) $\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{x^2y}{x^4+y^2}=0$\n(라) $\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{xy^2}{x^4+y^2}=0$",
    options:opts5("가, 나","가, 다","가, 라","나, 라","가, 다, 라"),
    correct:"3",
    explanation:"(가) $\\!\\left|\\dfrac{x^2y}{x^2+y^2}\\right|\\le|y|\\to 0$. **참**.\n(나) 경로 $y=x$: $\\dfrac{x^2}{5x^2}=\\dfrac{1}{5}\\ne 0$. **거짓**.\n(다) 경로 $y=x^2$: $\\dfrac{x^4}{2x^4}=\\dfrac{1}{2}\\ne 0$. **거짓**.\n(라) $\\!\\left|\\dfrac{xy^2}{x^4+y^2}\\right|\\le|x|\\to 0$. **참**.\n따라서 (가), (라).",
  },
  {n:6, subject:"다변수함수", unit:"편도함수", concept:"라이프니츠 적분 미분",
    difficulty:"hard",
    question:"두 함수 $f(x,y)=\\displaystyle\\int_0^y e^{t^2 x}\\,dt,\\,g(x)=\\displaystyle\\int_0^{x^2} e^{t^2 x}\\,dt$에 대하여 $(\\alpha,\\beta)=\\nabla f(1,1),\\,\\gamma=g'(1)$이라고 할 때, $\\alpha+\\beta-\\gamma$의 값은?",
    options:opts5("$e$","$-e$","$0$","$2e$","$-2e$"),
    correct:"2",
    explanation:"$f_x=\\!\\int_0^y t^2 e^{t^2 x}\\,dt$, $f_y=e^{y^2 x}$.\n$\\alpha=\\!\\int_0^1 t^2 e^{t^2}\\,dt$, $\\beta=e$.\n$g'(x)=e^{x^5}\\cdot 2x+\\!\\int_0^{x^2}t^2 e^{t^2 x}\\,dt$.\n$\\gamma=2e+\\!\\int_0^1 t^2 e^{t^2}\\,dt$.\n$\\alpha+\\beta-\\gamma=\\alpha+e-2e-\\alpha=-e$.",
  },
  {n:7, subject:"적분학", unit:"이상적분", concept:"가우스 적분 비율",
    difficulty:"medium",
    question:"자연수 $n$에 대하여 $a_n=\\displaystyle\\int_{-n}^n e^{-x^2}\\,dx,\\,b_n=\\displaystyle\\int_{-n}^n\\!\\!\\int_x^n e^{x-y^2}\\,dy\\,dx$라고 할 때, 극한 $\\displaystyle\\lim_{n\\to\\infty}\\dfrac{b_n}{a_n}$의 값은?",
    options:opts5("$e$","$e^{1/4}$","$e^{1/2}$","$1$","$\\infty$"),
    correct:"2",
    explanation:"적분순서 변경: $b_n=\\!\\int_{-n}^n e^{-y^2}(e^y-e^{-n})\\,dy$.\n$\\!\\int_{-n}^n e^{y-y^2}\\,dy=e^{1/4}\\!\\int_{-n}^n e^{-(y-1/2)^2}\\,dy\\to e^{1/4}\\sqrt{\\pi}$.\n$e^{-n}a_n\\to 0$. $a_n\\to\\sqrt{\\pi}$.\n$\\dfrac{b_n}{a_n}\\to e^{1/4}$.",
  },
  {n:8, subject:"다변수함수", unit:"선적분과 면적분", concept:"매개곡면 면적분",
    difficulty:"medium",
    question:"$S$가 벡터방정식 $\\vec{r}(u,v)=u\\vec{i}+u^3\\vec{j}+v\\vec{k}\\;(0\\le u\\le 2,\\,0\\le v\\le 3)$로 주어진 곡면이라고 하자. $S$ 위에서 벡터장 $\\vec{F}(x,y,z)=z\\vec{i}+3\\vec{j}+xz\\vec{k}$의 면적분의 값은?",
    options:opts5("$6$","$9$","$18$","$21$","$24$"),
    correct:"3",
    explanation:"$\\vec{r}_u=(1,3u^2,0),\\,\\vec{r}_v=(0,0,1)$, $\\vec{r}_u\\times\\vec{r}_v=(3u^2,-1,0)$.\n$\\vec{F}\\cdot(\\vec{r}_u\\times\\vec{r}_v)=3u^2 z-3=3u^2 v-3$ ($x=u,\\,z=v$).\n$\\!\\int_0^2\\!\\!\\int_0^3(3u^2 v-3)\\,dv\\,du=\\!\\int_0^2\\!\\left(\\dfrac{27u^2}{2}-9\\right)du=36-18=18$.",
  },
  {n:9, subject:"미분학", unit:"미분방정식", concept:"공명항 ODE",
    difficulty:"medium",
    question:"$y(x)$가 초깃값 문제 $y''+y=2\\cos x,\\,y(0)=1,\\,y'(0)=-1$의 해일 때, $y(\\pi)$의 값은?",
    options:opts5("$-1$","$0$","$1$","$-2$","$2$"),
    correct:"1",
    explanation:"동차해 $y_h=c_1\\cos x+c_2\\sin x$. 공명: $y_p=x\\sin x$ (대입 검증 $y_p''+y_p=2\\cos x$).\n$y(x)=c_1\\cos x+c_2\\sin x+x\\sin x$.\n$y(0)=c_1=1$. $y'(0)=c_2=-1$.\n$y(\\pi)=-1-0+\\pi\\cdot 0=-1$.",
  },
  {n:10, subject:"선형대수", unit:"행렬", concept:"크라메르 공식",
    difficulty:"medium",
    question:"행렬 $A=\\begin{bmatrix}a&-3&4\\\\3&1&-1\\\\-4&2&3\\end{bmatrix}$의 행렬식이 $65$라고 하자. $\\begin{bmatrix}x\\\\y\\\\z\\end{bmatrix}$가 행렬 방정식 $A\\begin{bmatrix}x\\\\y\\\\z\\end{bmatrix}=\\begin{bmatrix}17\\\\2\\\\-11\\end{bmatrix}$의 해라고 할 때, $y$의 값은?",
    options:opts5("$2$","$-2$","$3$","$-3$","$1$"),
    correct:"4",
    explanation:"$\\det A=5a+55=65\\Rightarrow a=2$.\n크라메르: $y=\\dfrac{\\det A_y}{\\det A}$. $A_y$는 2열을 $\\vec{b}$로 대체.\n$\\det A_y=\\det\\!\\begin{pmatrix}2&17&4\\\\3&2&-1\\\\-4&-11&3\\end{pmatrix}=-195$.\n$y=\\dfrac{-195}{65}=-3$.",
  },
  {n:11, subject:"적분학", unit:"정적분의 응용", concept:"파푸스 정리 토러스",
    difficulty:"easy",
    question:"원 $x^2+(y-2)^2=1$을 $x$축을 중심으로 회전하여 얻은 회전체의 겉넓이는?",
    options:opts5("$2\\pi^2$","$4\\pi^2$","$8\\pi^2$","$10\\pi^2$","$12\\pi^2$"),
    correct:"3",
    explanation:"파푸스 제1정리: $S=2\\pi\\bar{y}\\cdot L$. 원 중심 $(0,2)$이므로 $\\bar{y}=2$. 둘레 $L=2\\pi\\cdot 1=2\\pi$.\n$S=2\\pi\\cdot 2\\cdot 2\\pi=8\\pi^2$.",
  },
  {n:12, subject:"다변수함수", unit:"편도함수의 응용", concept:"제약영역 최대최소 합",
    difficulty:"medium",
    question:"영역 $D=\\{(x,y)\\in\\mathbb{R}^2\\,|\\,x^2+y^2\\le 1\\}$에서 정의된 함수 $f(x,y)=x^2+y^2+x+y$의 최댓값과 최솟값의 합은?",
    options:opts5("$1+\\sqrt{2}$","$2\\sqrt{2}$","$\\dfrac{1}{2}-\\sqrt{2}$","$\\dfrac{1}{2}+\\sqrt{2}$","$2$"),
    correct:"4",
    explanation:"내부 임계점: $\\nabla f=(2x+1,2y+1)=0\\Rightarrow(x,y)=\\!\\left(-\\dfrac{1}{2},-\\dfrac{1}{2}\\right)$, $f=-\\dfrac{1}{2}$.\n경계 $x^2+y^2=1$: $f=1+\\cos\\theta+\\sin\\theta\\in[1-\\sqrt{2},1+\\sqrt{2}]$.\n최대 $1+\\sqrt{2}$, 최소 $-\\dfrac{1}{2}$. 합 $=\\dfrac{1}{2}+\\sqrt{2}$.",
  },
  {n:13, subject:"다변수함수", unit:"공간의 직선과 평면", concept:"교차곡선 접선",
    difficulty:"medium",
    question:"공간에서 평면 $y+z=3$과 곡면 $x^2+y^2=5$가 만나는 곡선을 $C$라고 하자. 곡선 $C$ 위의 점 $(1,2,1)$에서의 접선의 방정식은?",
    options:opts5("$\\dfrac{x-1}{2}=\\dfrac{y-2}{1}=\\dfrac{z-1}{1}$","$\\dfrac{x-1}{2}=\\dfrac{y-2}{-1}=\\dfrac{z-1}{-1}$","$\\dfrac{x-1}{-2}=\\dfrac{y-2}{-1}=\\dfrac{z-1}{2}$","$\\dfrac{x-1}{2}=\\dfrac{y-2}{1}=\\dfrac{z-1}{2}$","$\\dfrac{x-1}{2}=\\dfrac{y-2}{-1}=\\dfrac{z-1}{1}$"),
    correct:"5",
    explanation:"$\\nabla F=(0,1,1)$, $\\nabla G=(2x,2y,0)\\big|_{(1,2,1)}=(2,4,0)$.\n접선 방향 $\\nabla F\\times\\nabla G=(-4,2,-2)\\parallel(2,-1,1)$.\n접선: $\\dfrac{x-1}{2}=\\dfrac{y-2}{-1}=\\dfrac{z-1}{1}$.",
  },
  {n:14, subject:"다변수함수", unit:"중적분", concept:"원기둥 좌표 적분",
    difficulty:"medium",
    question:"공간에서 평면 $x=2$와 곡면 $x=\\sqrt{y^2+z^2}$으로 둘러싸인 영역을 $E$라고 할 때, 적분 $\\displaystyle\\iiint_E(y^2+z^2)\\,dV$의 값은?",
    options:opts5("$\\dfrac{8}{5}\\pi$","$\\dfrac{16}{5}\\pi$","$\\dfrac{16}{9}(9-4\\sqrt{2})\\pi$","$\\dfrac{8}{9}(9-4\\sqrt{2})\\pi$","$\\dfrac{18}{5}\\pi$"),
    correct:"2",
    explanation:"원기둥좌표 $y=r\\cos\\theta,\\,z=r\\sin\\theta$. 영역 $r\\le x\\le 2,\\,0\\le r\\le 2,\\,0\\le\\theta\\le 2\\pi$.\n$\\!\\iiint r^2\\cdot r\\,dr\\,dx\\,d\\theta=2\\pi\\!\\int_0^2 r^3(2-r)\\,dr=2\\pi\\!\\left(8-\\dfrac{32}{5}\\right)=\\dfrac{16\\pi}{5}$.",
  },
  {n:15, subject:"미분학", unit:"미분방정식", concept:"적분인자 / 보존",
    difficulty:"hard",
    question:"$y(x)$가 초깃값 문제 $(3xy-2y^2)\\,dx+(x^2-2xy)\\,dy=0,\\,y(2)=\\dfrac{2+\\sqrt{3}}{2}$의 해일 때, $y(\\sqrt{2})$의 값은?",
    options:opts5("$-\\dfrac{1}{2}$","$-2$","$0$","$\\sqrt{2}$","$\\dfrac{1}{\\sqrt{2}}$"),
    correct:"5",
    explanation:"$M_y-N_x=x-2y$, $\\dfrac{M_y-N_x}{N}=\\dfrac{1}{x}$ ($x$만의 함수). 적분인자 $\\mu=x$.\n곱: $(3x^2y-2xy^2)dx+(x^3-2x^2y)dy=0$. 완전.\n포텐셜 $F=x^3y-x^2y^2=C$.\n$y(2)=(2+\\sqrt{3})/2$ 대입 $\\Rightarrow C=1$.\n$y(\\sqrt{2})$: $2\\sqrt{2}y-2y^2=1\\Rightarrow 2y^2-2\\sqrt{2}y+1=0\\Rightarrow y=\\dfrac{\\sqrt{2}}{2}=\\dfrac{1}{\\sqrt{2}}$.",
  },
  {n:16, subject:"선형대수", unit:"행렬", concept:"순환행렬 행렬식",
    difficulty:"medium",
    question:"행렬 $A=\\begin{bmatrix}a&b&b&b\\\\b&a&b&b\\\\b&b&a&b\\\\b&b&b&a\\end{bmatrix}$의 행렬식을 계산하면?",
    options:opts5("$(a-b)^3(a+3b)$","$(a-b)^3(a+b)$","$(a-b)^3(a+2b)$","$(b-a)^3(a+3b)$","$(b-a)^3(a+2b)$"),
    correct:"1",
    explanation:"$A=(a-b)I+bJ$ ($J$: 모두 1인 $4\\times 4$ 행렬).\n$J$의 고윳값: $4$ (1번), $0$ (3번).\n$A$의 고윳값: $a+3b$ (1번), $a-b$ (3번).\n$\\det A=(a+3b)(a-b)^3$.",
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
