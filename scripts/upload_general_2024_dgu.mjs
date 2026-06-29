// Upload 2024년도 동국대 편입수학 기출 20문항 (5지 선다형, 90분)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const [k, ...r] = l.split("="); return [k.trim(), r.join("=").trim()]; })
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SCHOOL = "동국대";
const YEAR = "2024";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-dgu-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "도함수", concept: "음함수 접선·절편", difficulty: "medium",
    question: "곡선 $y^2+x^2 y+\\sin(xy)=1$ 위의 점 $(0,1)$에서의 접선이 $x$축과 만나는 점의 $x$좌표는?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 2,
    explanation: "$F=y^2+x^2 y+\\sin(xy)-1$. $\\dfrac{dy}{dx}=-\\dfrac{2xy+y\\cos(xy)}{2y+x^2+x\\cos(xy)}\\bigg|_{(0,1)}=-\\dfrac{1}{2}$.\n접선: $y=-\\dfrac{1}{2}x+1$. $y=0$ ⇒ $x=2$."
  }),
  build({
    num: 2, subject: "미분학", unit: "도함수", concept: "변수상한 적분·역함수 미분", difficulty: "medium",
    question: "함수 $f(x)=\\!\\displaystyle\\int_1^x\\!\\sqrt{2+t^2}\\,dt$일 때 역함수의 미분값 $(f^{-1})'(0)$은?",
    options: [o("1","$\\sqrt 3$"), o("2","$\\sqrt 2$"), o("3","$1$"), o("4","$\\dfrac{1}{\\sqrt 2}$"), o("5","$\\dfrac{1}{\\sqrt 3}$")],
    answer: 5,
    explanation: "$f(1)=0$ ⇒ $f^{-1}(0)=1$. $f'(x)=\\sqrt{2+x^2}$, $f'(1)=\\sqrt 3$.\n$(f^{-1})'(0)=\\dfrac{1}{\\sqrt 3}$."
  }),
  build({
    num: 3, subject: "미분학", unit: "도함수", concept: "기함수 최대-최소 차", difficulty: "medium",
    question: "함수 $f(x)=\\dfrac{x}{2+x^2}$의 최댓값을 $M$과 최솟값을 $m$이라고 할 때 $M-m$의 값은?",
    options: [o("1","$\\dfrac{\\sqrt 2}{2}$"), o("2","$1$"), o("3","$\\dfrac{1}{2\\sqrt 2}$"), o("4","$\\dfrac{1}{1+\\sqrt 2}$"), o("5","$\\dfrac{1}{4}$")],
    answer: 1,
    explanation: "$f'(x)=\\dfrac{2-x^2}{(2+x^2)^2}=0$ ⇒ $x=\\pm\\sqrt 2$.\n$M=f(\\sqrt 2)=\\dfrac{\\sqrt 2}{4}$, $m=-\\dfrac{\\sqrt 2}{4}$.\n$M-m=\\dfrac{\\sqrt 2}{2}$."
  }),
  build({
    num: 4, subject: "미분학", unit: "도함수", concept: "매개함수 2계 미분", difficulty: "medium",
    question: "함수 $x=t^2+1,\\,y=\\cos t$일 때 $t=\\pi$에서 $\\dfrac{d^2 y}{dx^2}$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{2}$"), o("2","$\\dfrac{1}{4}$"), o("3","$\\dfrac{1}{2}$"), o("4","$\\dfrac{1}{2\\pi}$"), o("5","$\\dfrac{1}{4\\pi^2}$")],
    answer: 5,
    explanation: "$\\dfrac{dy}{dx}=\\dfrac{-\\sin t}{2t}$. $\\dfrac{d^2 y}{dx^2}=\\dfrac{d}{dt}\\!\\left(\\dfrac{-\\sin t}{2t}\\right)\\cdot\\dfrac{1}{2t}=-\\dfrac{2t\\cos t-2\\sin t}{(2t)^2}\\cdot\\dfrac{1}{2t}$.\n$t=\\pi$: $-\\dfrac{-2\\pi}{4\\pi^2}\\cdot\\dfrac{1}{2\\pi}=\\dfrac{1}{4\\pi^2}$."
  }),
  build({
    num: 5, subject: "다변수함수", unit: "최댓값/최솟값", concept: "타원체 내접 직육면체 부피", difficulty: "mediumHard",
    question: "좌표공간에서 주어진 영역 $x^2+3y^2+3z^2\\le 3,\\,z\\ge 0$의 내부에 포함되어 있는 직육면체의 최대 부피는?",
    options: [o("1","$\\dfrac{2}{3}$"), o("2","$\\dfrac{4}{3}$"), o("3","$\\dfrac{6}{3}$"), o("4","$\\dfrac{8}{3}$"), o("5","$\\dfrac{12}{3}$")],
    answer: 2,
    explanation: "1팔분면 점 $(a,b,c)$, $V=4abc$ (밑면 $2a\\times 2b$, 높이 $c$).\nAM-GM: $a^2+3b^2+3c^2\\ge 3(9a^2 b^2 c^2)^{1/3}$.\n$3\\ge 3(3abc)^{2/3}$ ⇒ $abc\\le 1/3$. $V\\le 4/3$."
  }),
  build({
    num: 6, subject: "다변수함수", unit: "편미분", concept: "방향도함수 최대 방향", difficulty: "mediumHard",
    question: "점 $(1,1)$에서 벡터 $(1,1)$ 방향으로의 이변수함수 $f(x,y)$의 방향도함수 값은 $\\sqrt 2$이고 벡터 $(1,2)$ 방향으로의 방향도함수 값은 $\\dfrac{1}{\\sqrt 5}$이다. 이때 $f(x,y)$의 방향도함수 값이 최대가 되는 방향은?",
    options: [
      o("1","$\\!\\left(\\dfrac{-1}{\\sqrt 2},\\dfrac{1}{\\sqrt 2}\\right)$"),
      o("2","$\\!\\left(\\dfrac{-2}{\\sqrt 5},\\dfrac{1}{\\sqrt 5}\\right)$"),
      o("3","$\\!\\left(\\dfrac{2}{\\sqrt 5},\\dfrac{-1}{\\sqrt 5}\\right)$"),
      o("4","$\\!\\left(\\dfrac{-1}{\\sqrt{10}},\\dfrac{3}{\\sqrt{10}}\\right)$"),
      o("5","$\\!\\left(\\dfrac{3}{\\sqrt{10}},\\dfrac{-1}{\\sqrt{10}}\\right)$")
    ],
    answer: 5,
    explanation: "$\\nabla f=(a,b)$로 두면 $\\dfrac{a+b}{\\sqrt 2}=\\sqrt 2,\\,\\dfrac{a+2b}{\\sqrt 5}=\\dfrac{1}{\\sqrt 5}$.\n$a+b=2,\\,a+2b=1$ ⇒ $a=3,b=-1$.\n최대 방향 단위벡터 $=\\dfrac{(3,-1)}{\\sqrt{10}}$."
  }),
  build({
    num: 7, subject: "미분학", unit: "도함수", concept: "변수상한 적분 미분(다중)", difficulty: "medium",
    question: "함수 $f(x)=\\!\\displaystyle\\int_x^{x^2+1}t^2 e^{t^2}dt$에 대하여 $f'(1)$의 값은?",
    options: [o("1","$2e^2-e$"), o("2","$4e^2-e$"), o("3","$2e^4-e$"), o("4","$4e^4-e$"), o("5","$8e^4-e$")],
    answer: 5,
    explanation: "$f'(x)=(x^2+1)^2 e^{(x^2+1)^2}\\cdot 2x-x^2 e^{x^2}\\cdot 1$.\n$x=1$: $4e^4\\cdot 2-e=8e^4-e$."
  }),
  build({
    num: 8, subject: "적분학", unit: "정적분", concept: "리만합·정적분", difficulty: "medium",
    question: "극한 $\\!\\displaystyle\\lim_{n\\to\\infty}\\!\\sum_{k=0}^{n-1}\\dfrac{k}{n^2}\\sin\\!\\left(\\dfrac{k}{n}\\right)$의 값은?",
    options: [o("1","$\\cos 1$"), o("2","$\\sin 1$"), o("3","$\\sin 1+\\cos 1$"), o("4","$2\\sin 1-1$"), o("5","$\\sin 1-\\cos 1$")],
    answer: 5,
    explanation: "$=\\!\\int_0^1 x\\sin x\\,dx=[-x\\cos x+\\sin x]_0^1=\\sin 1-\\cos 1$."
  }),
  build({
    num: 9, subject: "적분학", unit: "정적분", concept: "쉘 회전체 부피", difficulty: "medium",
    question: "포물선 $y^2=2x$와 직선 $y=x$로 둘러싸인 영역을 $y$축으로 회전하여 얻은 입체의 부피는?",
    options: [o("1","$\\dfrac{15}{16}\\pi$"), o("2","$\\dfrac{16}{15}\\pi$"), o("3","$\\pi$"), o("4","$\\dfrac{14}{15}\\pi$"), o("5","$\\dfrac{15}{14}\\pi$")],
    answer: 2,
    explanation: "교점: $\\sqrt{2x}=x$ ⇒ $x=0,2$. 쉘: $V=2\\pi\\!\\int_0^2 x(\\sqrt{2x}-x)dx=2\\pi\\!\\left(\\dfrac{2\\sqrt 2}{5}x^{5/2}-\\dfrac{x^3}{3}\\right)\\Big|_0^2$\n$=2\\pi\\!\\left(\\dfrac{16}{5}-\\dfrac{8}{3}\\right)=2\\pi\\cdot\\dfrac{8}{15}=\\dfrac{16\\pi}{15}$."
  }),
  build({
    num: 10, subject: "적분학", unit: "급수", concept: "급수 수렴(적분판정)", difficulty: "medium",
    question: "다음 급수 중 수렴하는 것을 모두 고르시오.\n\n가. $\\!\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{1}{n\\log n}$  나. $\\!\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{1}{n(\\log n)^2}$  다. $\\!\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{\\log n}{n^2}$",
    options: [o("1","가, 나, 다"), o("2","가, 다"), o("3","나, 다"), o("4","나"), o("5","다")],
    answer: 3,
    explanation: "가: 적분판정 $\\!\\int\\dfrac{dx}{x\\ln x}=\\ln\\ln x$ 발산.\n나: 적분판정 $-\\dfrac{1}{\\ln x}$ 수렴.\n다: $\\sim\\dfrac{1}{n^2}$ 수렴 (속도)."
  }),
  build({
    num: 11, subject: "적분학", unit: "정적분", concept: "치환·부분분수", difficulty: "medium",
    question: "적분 $\\!\\displaystyle\\int_0^1\\dfrac{x}{(x-3)^2}dx$의 값은?",
    options: [
      o("1","$\\dfrac{1}{2}+\\ln\\dfrac{3}{2}$"),
      o("2","$\\dfrac{1}{2}+\\ln\\dfrac{2}{3}$"),
      o("3","$\\dfrac{2}{3}+\\ln\\dfrac{3}{2}$"),
      o("4","$\\dfrac{2}{3}+\\ln\\dfrac{2}{3}$"),
      o("5","$\\dfrac{1}{3}+\\ln\\dfrac{2}{3}$")
    ],
    answer: 2,
    explanation: "$x-3=t$ 치환: $\\!\\int_{-3}^{-2}\\dfrac{t+3}{t^2}dt=\\!\\int\\!\\left(\\dfrac{1}{t}+\\dfrac{3}{t^2}\\right)dt=[\\ln|t|-\\tfrac{3}{t}]_{-3}^{-2}$\n$=\\ln 2-(-3/2)-(\\ln 3-(-1))=\\ln(2/3)+\\dfrac{1}{2}$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "중적분", concept: "무게중심·구면좌표", difficulty: "mediumHard",
    question: "좌표공간에 부등식 $\\sqrt{x^2+y^2}\\le z$와 $x^2+y^2+z^2\\le 1$을 만족하는 입체영역 $D$에 밀도함수 $\\rho(x,y,z)=z$가 주어질 때 영역 $D$의 무게중심 $(0,0,\\alpha)$의 $\\alpha$값은?",
    options: [
      o("1","$\\dfrac{2}{15}(4-\\sqrt 2)$"),
      o("2","$\\dfrac{4}{15}(4-\\sqrt 2)$"),
      o("3","$\\dfrac{6}{15}(4-\\sqrt 2)$"),
      o("4","$\\dfrac{8}{15}(4-\\sqrt 2)$"),
      o("5","$\\dfrac{2}{3}(4-\\sqrt 2)$")
    ],
    answer: 2,
    explanation: "구면좌표 $\\phi\\le\\pi/4,\\rho\\le 1$.\n분자 $\\!\\iiint z^2 dV=\\!\\int_0^{2\\pi}\\!\\!\\int_0^{\\pi/4}\\!\\!\\int_0^1\\rho^4\\cos^2\\phi\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta$.\n분모 $\\!\\iiint z\\,dV$.\n계산 결과 $\\alpha=\\dfrac{4}{15}(4-\\sqrt 2)$."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "중적분", concept: "변수변환·평행사변형", difficulty: "mediumHard",
    question: "곡선 $y=e^x,\\,y=e^x+1,\\,y=1-e^x,\\,y=2-e^x$으로 둘러싸인 영역 $R$에서 $\\!\\displaystyle\\iint_R\\dfrac{2e^x}{y+e^x}dx\\,dy$의 값은?",
    options: [o("1","$\\ln 2$"), o("2","$\\ln 3$"), o("3","$\\ln 4$"), o("4","$\\ln 5$"), o("5","$\\ln 6$")],
    answer: 1,
    explanation: "$u=e^x-y,\\,v=e^x+y$ 치환: $-1\\le u\\le 0,\\,1\\le v\\le 2$. $|J|=2e^x$.\n$\\dfrac{2e^x}{y+e^x}=\\dfrac{2e^x}{v}$. $dxdy=\\dfrac{1}{2e^x}du\\,dv$.\n$\\!\\iint\\dfrac{1}{v}du\\,dv=\\!\\int_{-1}^0 du\\!\\int_1^2\\dfrac{dv}{v}=\\ln 2$."
  }),
  build({
    num: 14, subject: "선형대수", unit: "행렬", concept: "역행렬 고유값 합", difficulty: "medium",
    question: "행렬 $A=\\!\\begin{pmatrix}5&0&0\\\\1&2&1\\\\1&1&2\\end{pmatrix}$가 주어질 때 역행렬 $A^{-1}$의 고유값의 합은?",
    options: [o("1","$9$"), o("2","$\\dfrac{1}{9}$"), o("3","$\\dfrac{23}{15}$"), o("4","$\\dfrac{21}{15}$"), o("5","$\\dfrac{9}{15}$")],
    answer: 3,
    explanation: "$A$의 고유값: $5,3,1$ (대각합 + 행렬식으로 검증).\n$A^{-1}$의 고유값: $1/5,1/3,1$. 합 $=\\dfrac{3+5+15}{15}=\\dfrac{23}{15}$."
  }),
  build({
    num: 15, subject: "선형대수", unit: "벡터", concept: "선형사상 상공간 차원", difficulty: "medium",
    question: "다음과 같이 선형사상 $T:\\mathbb R^3\\to\\mathbb R^5$이 주어질 때 선형사상 $T$의 상공간 $\\text{Im}(T)$의 차원은?\n\n$T(a,b,c)=(a+c,\\,a+b+2c,\\,b+c,\\,a+c,\\,b+c)$",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 2,
    explanation: "표준행렬 행 축약: 독립 행 2개. $\\dim\\text{Im}(T)=\\text{rank}=2$."
  }),
  build({
    num: 16, subject: "선형대수", unit: "벡터", concept: "정사영 크기(해공간)", difficulty: "mediumHard",
    question: "벡터 $(1,1,1)$을 행렬 방정식 $\\!\\begin{pmatrix}2&-1&1\\\\1&2&1\\end{pmatrix}\\!\\begin{pmatrix}x\\\\y\\\\z\\end{pmatrix}=\\!\\begin{pmatrix}0\\\\0\\end{pmatrix}$의 해공간으로 정사영한 벡터의 크기는?",
    options: [o("1","$\\dfrac{1}{\\sqrt{27}}$"), o("2","$\\dfrac{1}{\\sqrt{45}}$"), o("3","$\\dfrac{1}{\\sqrt 6}$"), o("4","$\\dfrac{1}{\\sqrt{35}}$"), o("5","$\\dfrac{1}{\\sqrt{15}}$")],
    answer: 4,
    explanation: "해공간은 1차원, 방향벡터 $=(2,-1,1)\\times(1,2,1)=(-3,-1,5)\\to(3,1,-5)$.\n$(1,1,1)$의 그 방향 정사영 $=\\dfrac{3+1-5}{35}(3,1,-5)=-\\dfrac{1}{35}(3,1,-5)$.\n크기 $=\\dfrac{1}{35}\\sqrt{35}=\\dfrac{1}{\\sqrt{35}}$."
  }),
  build({
    num: 17, subject: "적분학", unit: "급수", concept: "텔레스코핑 급수", difficulty: "mediumHard",
    question: "다음 조건을 만족하는 수열 $\\{a_n\\}$의 초기항 $a_1$의 값은?\n\n$\\!\\displaystyle\\lim_{n\\to\\infty}n^2 a_n=5,\\,\\!\\sum_{n=1}^{\\infty}a_n=2,\\,\\!\\sum_{n=1}^{\\infty}na_n=3,\\,\\!\\sum_{n=1}^{\\infty}(n+1)^2(a_{n+1}-a_n)=1$",
    options: [o("1","$-4$"), o("2","$-3$"), o("3","$-1$"), o("4","$1$"), o("5","$2$")],
    answer: 1,
    explanation: "$\\!\\sum(n+1)^2 a_{n+1}-n^2 a_n-2na_n-a_n=1$. $b_n=n^2 a_n$.\n$\\!\\sum(b_{n+1}-b_n)=1+2\\!\\sum na_n+\\!\\sum a_n=1+6+2=9$.\n텔레스코핑: $-b_1+\\!\\lim b_n=9$. $\\!\\lim b_n=5,\\,b_1=a_1$ ⇒ $-a_1+5=9$ ⇒ $a_1=-4$."
  }),
  build({
    num: 18, subject: "적분학", unit: "급수", concept: "수렴반경(우세항)", difficulty: "medium",
    question: "멱급수 $\\!\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{2^n+5^n}{4^n+6^n}x^n$의 수렴반경은?",
    options: [o("1","$\\dfrac{5}{4}$"), o("2","$\\dfrac{4}{5}$"), o("3","$\\dfrac{5}{6}$"), o("4","$\\dfrac{6}{5}$"), o("5","$\\dfrac{1}{3}$")],
    answer: 4,
    explanation: "큰 항 비율 $\\dfrac{5^n}{6^n}=(5/6)^n$. $|x|<\\dfrac{6}{5}$."
  }),
  build({
    num: 19, subject: "공학수학", unit: "벡터적분", concept: "그린 정리(사분원)", difficulty: "medium",
    question: "제1사분면에서 부등식 $x^2+y^2\\le 4$를 만족하는 영역의 경계를 따라 반시계 방향으로 매개화한 곡선 $C$에 대해 선적분 $\\!\\displaystyle\\oint_C(xy^2+x^2)dx+(4x-1)dy$의 값은?",
    options: [o("1","$2\\pi-2$"), o("2","$4\\pi-2$"), o("3","$4\\pi-4$"), o("4","$4\\pi-6$"), o("5","$4\\pi-8$")],
    answer: 3,
    explanation: "그린: $\\!\\iint_D(4-2xy)dA$.\n$\\!\\iint 4\\,dA=4\\cdot\\dfrac{\\pi\\cdot 4}{4}=4\\pi$.\n$\\!\\iint 2xy\\,dA=2\\!\\int_0^{\\pi/2}\\!\\!\\int_0^2 r^2\\cos\\theta\\sin\\theta\\cdot r\\,dr\\,d\\theta=2\\cdot 4\\cdot\\dfrac{1}{2}=4$.\n결과 $4\\pi-4$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "중적분", concept: "적분순서 교환", difficulty: "medium",
    question: "이중적분 $\\!\\displaystyle\\int_0^4\\!\\!\\int_{\\sqrt x}^2\\dfrac{1}{1+y^3}dy\\,dx$의 값은?",
    options: [
      o("1","$\\dfrac{1}{3}\\ln 2$"),
      o("2","$\\dfrac{2}{3}\\ln 2$"),
      o("3","$\\dfrac{1}{3}\\ln 3$"),
      o("4","$\\dfrac{2}{3}\\ln 3$"),
      o("5","$\\dfrac{2}{3}\\ln 6$")
    ],
    answer: 4,
    explanation: "순서 변경: $0\\le y\\le 2,\\,0\\le x\\le y^2$.\n$\\!\\int_0^2\\dfrac{y^2}{1+y^3}dy=\\dfrac{1}{3}\\ln(1+y^3)|_0^2=\\dfrac{1}{3}\\ln 9=\\dfrac{2}{3}\\ln 3$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 동국대):`, data.map((d) => d.id).join(", "));
