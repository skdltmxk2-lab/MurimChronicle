// Upload 2025년도 홍익대 편입수학 기출 15문항 (4지선다, 26~40번)
// Usage: node scripts/upload_general_2025_hongik.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SCHOOL = "홍익대"; const YEAR = "2025";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-hongik-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return {
    id, subject, unit, concept, difficulty,
    source_type: "imported", question, content_type: "latex", question_image: null,
    options, correct_option_id: String(answer), explanation,
    explanation_content_type: "latex", explanation_image: null, tags,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "값 비교(극한/적분)", difficulty: "medium",
    question: "다음 (1)~(4) 중 값이 다른 것을 고르시오.\n\n(1) $\\displaystyle\\lim_{x\\to 0}\\dfrac{\\!\\int_0^{2x}\\sin(\\tan t)\\,dt}{2x^2}$\n\n(2) $y=x^{\\sin x}$일 때, $\\displaystyle\\dfrac{dy}{dx}\\bigg|_{x=\\pi/2}$\n\n(3) $\\displaystyle\\lim_{x\\to\\infty}(e^x+x)^{1/x}$\n\n(4) $\\displaystyle\\dfrac{1}{2}\\!\\int_0^{\\pi^2/4}\\dfrac{\\cos\\sqrt{x}}{\\sqrt{x}}\\,dx$",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)")],
    answer: 3,
    explanation: "(1) 로피탈 후 $\\sin(\\tan 2x)/(2x)\\to 1$. (2) $\\ln y=\\sin x\\ln x$, $y'(\\pi/2)=(\\pi/2)(2/\\pi)=1$. (3) $\\lim e^{\\ln(e^x+x)/x}=e^1=e$. (4) $u=\\sqrt x$ 치환: $\\!\\int_0^{\\pi/2}\\cos u\\,du=1$. (3)만 $e$로 다른 값."
  }),
  build({
    num: 2, subject: "적분학", unit: "정적분의 계산", concept: "리만합과 정적분", difficulty: "medium",
    question: "극한 $\\displaystyle\\lim_{n\\to\\infty}\\sum_{k=1}^{n}\\dfrac{1}{2\\sqrt{nk}+k}$의 값을 구하시오.",
    options: [o("1","$2\\ln\\dfrac{3}{2}$"), o("2","$2\\ln\\dfrac{2}{3}$"), o("3","$2\\ln\\dfrac{3}{4}$"), o("4","$2\\ln\\dfrac{4}{3}$")],
    answer: 1,
    explanation: "$\\dfrac{1}{n}\\sum\\dfrac{1}{2\\sqrt{k/n}+k/n}\\to\\!\\int_0^1\\dfrac{dx}{2\\sqrt x+x}$. $t=\\sqrt x$ 치환: $\\!\\int_0^1\\dfrac{2t}{2t+t^2}dt=\\!\\int_0^1\\dfrac{2}{2+t}dt=2\\ln\\dfrac{3}{2}$."
  }),
  build({
    num: 3, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "급수 합 비교", difficulty: "medium",
    question: "다음 급수 중 수렴값이 가장 큰 것을 고르시오.\n\n(1) $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n}{2^n}$\n(2) $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(-1)^n}{2n+1}$\n(3) $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{1}{n!}$\n(4) $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(-1)^n}{n+1}$",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)")],
    answer: 3,
    explanation: "(1) $\\sum nx^n=\\dfrac{x}{(1-x)^2}$ at $x=1/2$ → $2$. (2) $\\tan^{-1}1=\\pi/4\\approx 0.785$. (3) $e\\approx 2.718$. (4) $\\ln 2\\approx 0.693$. 최댓값은 (3) $e$."
  }),
  build({
    num: 4, subject: "선형대수", unit: "행렬", concept: "유일해 조건", difficulty: "easyMedium",
    question: "다음 선형계(linear system: 1차 연립방정식)\n\n$\\begin{cases}x+y+3z=2\\\\x-2y+6z=8\\\\x-3y+az=b\\end{cases}$\n\n가 유일한 해를 가질 필요충분조건을 바르게 구한 것을 고르시오.",
    options: [o("1","$a\\ne 7$"), o("2","$a\\ne 7,\\,b\\ne 10$"), o("3","$a\\ne 7,\\,b=10$"), o("4","$a=7,\\,b=10$")],
    answer: 1,
    explanation: "유일해 조건은 계수행렬의 행렬식 $\\ne 0$. $\\det=\\begin{vmatrix}1&1&3\\\\1&-2&6\\\\1&-3&a\\end{vmatrix}=-3a+21\\ne 0\\Rightarrow a\\ne 7$. ($b$ 값에는 무관.)"
  }),
  build({
    num: 5, subject: "선형대수", unit: "행렬", concept: "직교행렬과 역행렬", difficulty: "medium",
    question: "행렬 $A=\\dfrac{1}{2}\\!\\begin{pmatrix}1&1&1&1\\\\1&1&-1&-1\\\\1&-1&1&-1\\\\1&-1&-1&1\\end{pmatrix}$의 역행렬 $A^{-1}=[b_{ij}]$의 모든 원소의 합 $\\displaystyle\\sum_{i=1}^{4}\\sum_{j=1}^{4}b_{ij}$와 행렬식 $\\det(A^{-1})$의 값을 각각 바르게 구한 것을 고르시오.",
    options: [o("1","$1,\\,-1$"), o("2","$1,\\,1$"), o("3","$2,\\,-1$"), o("4","$2,\\,1$")],
    answer: 3,
    explanation: "$A$의 행/열은 모두 단위벡터이고 서로 직교 → 직교행렬, $A^{-1}=A^T$. 따라서 $A^{-1}$의 모든 원소합 $=A$의 모든 원소합 $=\\tfrac{1}{2}(4+0+0+0)=2$. $\\det A=-1$이므로 $\\det A^{-1}=-1$."
  }),
  build({
    num: 6, subject: "미분학", unit: "추가내용", concept: "극방정식과 그래프", difficulty: "medium",
    question: "다음 극방정식 중에서 그래프가 같지 않은 것으로 짝지어진 것을 고르시오.\n\n(1) $\\begin{cases}r=1+\\cos\\theta\\\\r=-1+\\cos\\theta\\end{cases}$\n(2) $\\begin{cases}r=\\cos 2\\theta\\\\r=-\\cos 2\\theta\\end{cases}$\n(3) $\\begin{cases}r^2=\\cos\\theta\\\\r^2=-\\cos\\theta\\end{cases}$\n(4) $\\begin{cases}r^2=\\cos 2\\theta\\\\r^2=-\\cos 2\\theta\\end{cases}$",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)")],
    answer: 4,
    explanation: "$\\theta\\to\\theta+\\pi,\\,r\\to -r$ 변환으로 동일 그래프 확인. (1)~(3)은 모두 같은 그래프. (4) $r^2=\\cos 2\\theta$에 같은 변환 적용 시 $r^2=\\cos 2\\theta$로 자기자신, $r^2=-\\cos 2\\theta$를 얻을 수 없음 → 다른 그래프."
  }),
  build({
    num: 7, subject: "다변수함수", unit: "편도함수", concept: "음함수 편미분", difficulty: "medium",
    question: "$x,y$에 대한 이변수함수 $z$가 $xe^y-z-\\arctan(yz)=0$로 정의된다. $(x,y,z)=(-1,0,-1)$일 때 $\\dfrac{\\partial z}{\\partial x}$의 값을 구하시오.",
    options: [o("1","$-1$"), o("2","$0$"), o("3","$\\dfrac{2}{3}$"), o("4","$1$")],
    answer: 4,
    explanation: "$F=xe^y-z-\\arctan(yz)$. $F_x=e^y$, $F_z=-1-\\dfrac{y}{1+(yz)^2}$. $(-1,0,-1)$ 대입: $F_x=1,\\,F_z=-1$. $\\dfrac{\\partial z}{\\partial x}=-\\dfrac{F_x}{F_z}=1$."
  }),
  build({
    num: 8, subject: "다변수함수", unit: "중적분", concept: "적분변수 변환", difficulty: "mediumHard",
    question: "평면 영역 $R$은 $|x|+|y|\\le 1$로 정의된다. 이중적분 $\\displaystyle\\iint_R\\dfrac{(x-y)^2}{\\sqrt{(y+x)^2+4}}\\,dA$의 값을 구하시오.",
    options: [
      o("1","$\\dfrac{1}{3}\\ln\\!\\left(\\dfrac{\\sqrt{5}+1}{\\sqrt{5}-1}\\right)$"),
      o("2","$\\dfrac{2}{3}\\ln\\!\\left(\\dfrac{\\sqrt{5}+1}{\\sqrt{5}-1}\\right)$"),
      o("3","$\\dfrac{1}{3}\\ln\\!\\left(\\dfrac{\\sqrt{5}}{2}+\\dfrac{1}{2}\\right)$"),
      o("4","$\\dfrac{2}{3}\\ln\\!\\left(\\dfrac{\\sqrt{5}}{2}+\\dfrac{1}{2}\\right)$")
    ],
    answer: 4,
    explanation: "$u=x-y,\\,v=x+y$ 치환: 야코비안 $1/2$, 영역 $-1\\le u\\le 1,\\,-1\\le v\\le 1$. $\\tfrac{1}{2}\\!\\int_{-1}^1 u^2 du\\cdot\\!\\int_{-1}^1\\dfrac{dv}{\\sqrt{v^2+4}}=\\tfrac{1}{2}\\cdot\\tfrac{2}{3}\\cdot\\ln\\dfrac{\\sqrt 5+1}{\\sqrt 5-1}=\\tfrac{1}{3}\\ln\\dfrac{(\\sqrt 5+1)^2}{4}=\\tfrac{2}{3}\\ln\\dfrac{\\sqrt 5+1}{2}$."
  }),
  build({
    num: 9, subject: "공학수학", unit: "미분방정식", concept: "1계 선형 ODE 진위", difficulty: "medium",
    question: "초깃값 문제 $y'+y\\tan x=\\sec x,\\ y(0)=1$의 해 $y(x)$에 대해서 다음 중 옳지 **않은** 것을 고르시오.\n\n(1) $y\\!\\left(\\dfrac{\\pi}{6}\\right)=\\dfrac{1+\\sqrt{3}}{2}$\n(2) $y'\\!\\left(\\dfrac{\\pi}{4}\\right)=\\sqrt{2}$\n(3) $y''+y=0$\n(4) $\\sqrt{2}\\sin\\!\\left(x+\\dfrac{\\pi}{4}\\right)$와 같다.",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)")],
    answer: 2,
    explanation: "적분인자 $\\sec x$로 풀면 $y=\\sin x+\\cos x=\\sqrt 2\\sin(x+\\pi/4)$. (1) $y(\\pi/6)=\\tfrac{1}{2}+\\tfrac{\\sqrt 3}{2}$ ✓. (2) $y'=\\cos x-\\sin x$, $y'(\\pi/4)=0\\ne\\sqrt 2$ → 거짓. (3),(4) ✓."
  }),
  build({
    num: 10, subject: "공학수학", unit: "미분방정식", concept: "미정계수법(이중공명)", difficulty: "medium",
    question: "미분방정식 $y''-ay'+by=4e^x$에 대해 $y_p=kx^2 e^x$가 하나의 특수해가 될 때, $a+b+k$의 값을 구하시오.",
    options: [o("1","$-1$"), o("2","$1$"), o("3","$3$"), o("4","$5$")],
    answer: 4,
    explanation: "$y_p=kx^2 e^x$가 특수해이려면 $r=1$이 보조방정식의 중근. $(r-1)^2=r^2-2r+1=0\\Rightarrow a=2,\\,b=1$. $y_p$ 대입하면 $2ke^x=4e^x\\Rightarrow k=2$. $a+b+k=5$."
  }),
  build({
    num: 11, subject: "적분학", unit: "정적분의 성질", concept: "대칭성과 컨볼루션", difficulty: "mediumHard",
    question: "다음 (가)~(라) 중 등식이 성립하는 것을 모두 고르시오. (단, $\\mathcal{L}\\{f\\}=\\!\\int_0^{\\infty}e^{-st}f(t)\\,dt$)\n\n(가) $\\displaystyle\\int_0^{\\pi/2}\\dfrac{\\sqrt{1-\\sin^2\\theta}}{\\sqrt{1-\\sin\\theta}}\\,d\\theta=\\!\\int_{\\pi/2}^{\\pi}\\dfrac{\\sqrt{1-\\sin^2\\theta}}{\\sqrt{1-\\sin\\theta}}\\,d\\theta$\n\n(나) $\\displaystyle\\int_0^{\\pi/2}\\dfrac{\\sqrt{1-\\sin^2\\theta}}{\\sqrt{1-\\sin\\theta}}\\,d\\theta=\\!\\int_{-\\pi/2}^{0}\\dfrac{\\sqrt{1-\\sin^2\\theta}}{\\sqrt{1-\\sin\\theta}}\\,d\\theta$\n\n(다) $\\mathcal{L}\\!\\left\\{\\!\\int_0^t e^{\\tau}f(\\tau)\\,d\\tau\\right\\}=\\mathcal{L}\\!\\left\\{e^t\\!\\int_0^t f(\\tau)\\,d\\tau\\right\\}$\n\n(라) $\\displaystyle\\int_0^t e^{\\tau}\\cos(t-\\tau)\\,d\\tau=e^t\\!\\int_0^t e^{-\\tau}\\cos\\tau\\,d\\tau$",
    options: [o("1","(라)"), o("2","(가), (라)"), o("3","(나), (다)"), o("4","(가), (나), (라)")],
    answer: 2,
    explanation: "(가) 피적분함수가 $\\theta=\\pi/2$ 선대칭 ✓. (나) $y=\\sin^2\\theta$가 $\\theta=0$ 선대칭이 아님 → ✗. (다) 좌변 $=\\dfrac{1}{s}F(s-1)$, 우변 $=\\dfrac{1}{s-1}F(s-1)$ → ✗. (라) 컨볼루션 $f*g=g*f$이므로 $e^t*\\cos t=\\!\\int_0^t e^{t-\\tau}\\cos\\tau\\,d\\tau=e^t\\!\\int_0^t e^{-\\tau}\\cos\\tau\\,d\\tau$ ✓."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "선적분과 면적분", concept: "Green 정리(면적 공식)", difficulty: "medium",
    question: "평면 영역 $R$의 경계 곡선 $C$가 조각별 매끄러운 단순 닫힌곡선일 때 (가)~(다) 중 $R$의 면적을 나타내는 것의 개수를 구하시오. (단, 선적분은 양의 방향으로 수행된다.)\n\n(가) $\\displaystyle\\oint_C 2024y\\,dx+2025x\\,dy$\n(나) $\\displaystyle\\oint_C\\!\\left(\\dfrac{\\ln y}{x}+y^2\\right)dx+\\!\\left(\\dfrac{\\ln x}{y}+x^2\\right)dy$\n(다) $\\displaystyle\\oint_C ye^x\\,dx+(e^x+x)\\,dy$",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개")],
    answer: 3,
    explanation: "Green: $\\oint P\\,dx+Q\\,dy=\\!\\iint_R(Q_x-P_y)\\,dA$. (가) $Q_x-P_y=2025-2024=1$ → 면적 ✓. (나) $Q_x-P_y=2x-2y\\ne 1$ → ✗. (다) $Q_x-P_y=(e^x+1)-e^x=1$ → 면적 ✓. 2개."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "선적분과 면적분", concept: "발산정리(부피)", difficulty: "mediumHard",
    question: "평면 $z=y$와 포물면 $z=x^2+y^2$으로 둘러싸인 입체 영역의 경계 곡면 $S$에 대해 벡터장 $\\mathbf{F}=(x^2 y-2xyz)\\mathbf{i}+(y^2z+y(1-2xz))\\mathbf{j}+(z^2x-2xyz)\\mathbf{k}$의 면적분 $\\displaystyle\\iint_S\\mathbf{F}\\cdot\\mathbf{n}\\,dS$의 값을 구하시오. (단, $\\mathbf{n}$은 $S$의 바깥 방향 단위 법선 벡터이다.)",
    options: [o("1","$\\dfrac{\\pi}{4}$"), o("2","$\\dfrac{\\pi}{8}$"), o("3","$\\dfrac{\\pi}{16}$"), o("4","$\\dfrac{\\pi}{32}$")],
    answer: 4,
    explanation: "$\\nabla\\cdot\\mathbf{F}=(2xy-2yz)+(2yz+1-2xz)+(2zx-2xy)=1$. 부피 계산: $\\!\\iint_D(y-x^2-y^2)dA$, $D:\\,x^2+y^2\\le y$ (반지름 $1/2$ 원). $u=x,\\,v=y-1/2$: $\\!\\int_0^{2\\pi}\\!\\!\\int_0^{1/2}(1/4-r^2)r\\,dr\\,d\\theta=2\\pi\\cdot\\tfrac{1}{64}=\\dfrac{\\pi}{32}$."
  }),
  build({
    num: 14, subject: "공학수학", unit: "라플라스 변환", concept: "푸리에 코사인/사인 변환", difficulty: "mediumHard",
    question: "모든 실수 $x$에 대해 두 함수 $f(x)$와 $g(x)$가 $f(x)=\\dfrac{2}{\\pi}\\!\\int_0^{\\infty}\\dfrac{\\cos\\alpha x}{1+\\alpha^2}\\,d\\alpha$, $g(x)=\\dfrac{2}{\\pi}\\!\\int_0^{\\infty}\\dfrac{\\alpha\\sin\\alpha x}{1+\\alpha^2}\\,d\\alpha$로 정의될 때 다음 중 옳지 **않은** 것을 고르시오.\n\n(1) $x>0$일 때 $f(x)=g(x)$이다.\n(2) $x<0$일 때 $g(x)=-e^{-x}$이다.\n(3) $x<0$일 때 $f(x)=e^x$이다.\n(4) $\\displaystyle\\int_0^{\\infty}f(x)\\sin\\alpha x\\,dx=\\dfrac{\\alpha}{1+\\alpha^2}$이다.",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)")],
    answer: 2,
    explanation: "$f(x)=e^{-|x|}$, $g(x)=\\mathrm{sgn}(x)\\,e^{-|x|}$. (1) $x>0$: $f=g=e^{-x}$ ✓. (2) $x<0$: $g=-e^x$인데 보기는 $-e^{-x}$ → 거짓. (3) $x<0$: $f=e^x$ ✓. (4) $\\!\\int_0^{\\infty}e^{-x}\\sin\\alpha x\\,dx=\\dfrac{\\alpha}{1+\\alpha^2}$ ✓."
  }),
  build({
    num: 15, subject: "공학수학", unit: "라플라스 변환", concept: "파동방정식 라플라스 변환", difficulty: "hard",
    question: "파동방정식 $\\dfrac{\\partial^2 u}{\\partial t^2}=\\dfrac{\\partial^2 u}{\\partial x^2}$이 경계조건 $u(0,t)=u(1,t)=0$을 만족한다. 고정된 $x$에 대해서 $u(x,t)$의 라플라스 변환을 $\\mathcal{L}\\{u(x,t)\\}=\\!\\int_0^{\\infty}e^{-st}u(x,t)\\,dt=U(x,s)$라고 할 때 다음 중 옳지 **않은** 것을 고르시오.\n\n(1) 초기조건 $u(x,0)=\\sin\\pi x,\\,u_t(x,0)=0$이 주어졌을 때 라플라스 변환을 취하면 $\\dfrac{d^2 U}{dx^2}-s^2 U=-s\\sin\\pi x$이다.\n\n(2) 초기조건 $u(x,0)=0,\\,u_t(x,0)=\\sin\\pi x$이 주어졌을 때 라플라스 변환을 취하면 $\\dfrac{d^2 U}{dx^2}-s^2 U=\\sin\\pi x$이다.\n\n(3) 초기조건 $u(x,0)=\\sin\\pi x,\\,u_t(x,0)=0$이 주어지면 파동방정식의 해는 $u(x,t)=\\cos(\\pi t)\\sin(\\pi x)$이다.\n\n(4) 초기조건 $u(x,0)=0,\\,u_t(x,0)=\\sin\\pi x$이 주어지면 파동방정식의 해는 $u(x,t)=\\dfrac{1}{\\pi}\\sin(\\pi t)\\sin(\\pi x)$이다.",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)")],
    answer: 2,
    explanation: "$\\mathcal{L}\\{u_{tt}\\}=s^2 U-s u(x,0)-u_t(x,0)$이므로 $U_{xx}-s^2 U=-s u(x,0)-u_t(x,0)$. (1) $-s\\sin\\pi x-0=-s\\sin\\pi x$ ✓. (2) $0-\\sin\\pi x=-\\sin\\pi x$인데 보기는 $+\\sin\\pi x$ → 거짓. (3),(4) 직접 검증 ✓."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
console.log("Inserted:");
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
