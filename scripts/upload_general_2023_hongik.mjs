// Upload 2023년도 홍익대 편입수학 기출 15문항 (4지 선다, 70분)
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

const SCHOOL = "홍익대";
const YEAR = "2023";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-hongik-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "선형대수", unit: "행렬", concept: "수반행렬 성질", difficulty: "medium",
    question: "행렬 $A$가 $3\\times 3$ 정칙행렬이고 $\\text{adj}A$는 행렬 $A$의 수반행렬이다. 다음 중 옳은 것을 모두 고르시오. (단, $k$는 실수)\n\n(가) $\\det(\\text{adj}A)=(\\det A)^2$\n(나) $\\text{adj}(kA)=k\\,\\text{adj}A$\n(다) $\\det(\\text{adj}(kA))=k^6\\det(\\text{adj}A)$",
    options: [o("1","(가)"), o("2","(나)"), o("3","(가), (나)"), o("4","(가), (다)")],
    answer: 4,
    explanation: "$A$가 $n\\times n$일 때 $|\\text{adj}A|=|A|^{n-1}$. $n=3$일 때 $|\\text{adj}A|=|A|^2$ ⇒ (가) 참.\n$\\text{adj}(kA)=k^{n-1}\\text{adj}A=k^2\\text{adj}A$ ⇒ (나) 거짓.\n$|\\text{adj}(kA)|=|kA|^2=k^6|A|^2=k^6|\\text{adj}A|$ ⇒ (다) 참."
  }),
  build({
    num: 2, subject: "공학수학", unit: "미분방정식", concept: "옳지 않은 명제 찾기", difficulty: "medium",
    question: "다음 중 옳지 않은 것을 고르시오.\n\n(1) 미분방정식 $y''-4y'+4y=x+1+e^x$의 연계제차방정식은 $e^{2x}$와 $xe^{2x}$를 해로 가지고 주어진 비제차방정식은 $x+1+e^x$를 특수해로 가진다.\n(2) 미분방정식 $y'''+y''=0$은 $2x+3e^{-x}$가 해인 상수계수 선형 제차방정식 중 가장 계수가 낮은 방정식이다.\n(3) 미분방정식 $(1+x)y''+xy'-y=0$은 $c_1 x+c_2 e^{-x}$를 일반해로 가진다.\n(4) 미분방정식 $y^{(4)}-y''=4x$는 $y=-\\dfrac{2}{3}(1+x+x^3+e^x+e^{-x})$을 하나의 해로 가진다.",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)")],
    answer: 1,
    explanation: "(1) 거짓: 비제차 항 $e^x$의 특수해는 $\\dfrac{1}{(D-2)^2}\\{e^x\\}=e^x$ (대입 검증 가능). $x+1$ 부분은 별도. 따라서 $x+1+e^x$ 자체가 특수해라는 진술은 부정확."
  }),
  build({
    num: 3, subject: "공학수학", unit: "미분방정식", concept: "적분방정식(컨볼루션)", difficulty: "mediumHard",
    question: "적분방정식 $f(t)=\\dfrac{1}{2}t-\\dfrac{1}{2}\\!\\displaystyle\\int_0^t(e^{\\tau}-e^{-\\tau})f(t-\\tau)d\\tau$를 만족하는 $f(t)$에 대해서 $f(1)$의 값을 구하시오.",
    options: [o("1","$\\dfrac{3}{12}$"), o("2","$\\dfrac{5}{12}$"), o("3","$\\dfrac{7}{12}$"), o("4","$\\dfrac{11}{12}$")],
    answer: 2,
    explanation: "라플라스: $F(s)=\\dfrac{1}{2s^2}-\\dfrac{1}{s^2-1}F(s)$.\n$F=\\dfrac{1}{2}\\!\\left(\\dfrac{1}{s^2}-\\dfrac{1}{s^4}\\right)$. $f(t)=\\dfrac{1}{2}\\!\\left(t-\\dfrac{t^3}{6}\\right)$.\n$f(1)=\\dfrac{1}{2}\\!\\left(1-\\dfrac{1}{6}\\right)=\\dfrac{5}{12}$."
  }),
  build({
    num: 4, subject: "공학수학", unit: "벡터적분", concept: "별모양 경로 선적분(각)", difficulty: "medium",
    question: "점 $(-1,0)$에서 시작하여 $(-2,0),(-1,-1),(-2,-3),(0,-2),(2,-3),(1,-1),(2,0),(1,0)$까지를 선분으로 차례로 잇는 경로 $C$에 대해 $\\!\\displaystyle\\int_C\\dfrac{-y\\,dx+x\\,dy}{x^2+y^2}$을 구하시오.",
    options: [o("1","$0$"), o("2","$\\dfrac{\\pi}{2}$"), o("3","$\\pi$"), o("4","$2\\pi$")],
    answer: 3,
    explanation: "$\\dfrac{-y\\,dx+x\\,dy}{x^2+y^2}=d\\theta$ (편각 변화). 경로의 끝점과 시점 사이 편각 변화량 계산: $(-1,0)$에서 시작해 $(1,0)$에서 끝남, 별 모양 아래 반평면을 휘감음. 편각 변화 $=\\pi$."
  }),
  build({
    num: 5, subject: "공학수학", unit: "벡터적분", concept: "유량(발산정리)", difficulty: "medium",
    question: "곡면 $S$는 원뿔면 $z=\\sqrt{x^2+y^2}$과 평면 $z=1$로 둘러싸인 입체의 표면이다. 벡터장 $\\vec F=xy^2\\vec i+y^3\\vec j+y^2 z\\vec k$의 곡면 $S$의 바깥방향으로의 유량 $\\!\\displaystyle\\iint_S\\vec F\\cdot\\vec n\\,dS$와 같은 것을 고르시오.",
    options: [
      o("1","$\\!\\int_0^{2\\pi}\\sin^2\\theta\\,d\\theta\\!\\int_0^1(5r^3-5r^4)dr$"),
      o("2","$\\!\\int_0^{2\\pi}\\!\\!\\int_0^{\\pi}\\!\\!\\int_0^{\\sec\\phi}5\\rho^2\\sin^2\\phi\\sin^2\\theta\\,d\\rho\\,d\\phi\\,d\\theta$"),
      o("3","$\\!\\int_{-1}^1\\!\\!\\int_{-\\sqrt{1-x^2}}^{\\sqrt{1-x^2}}\\!\\!\\int_{\\sqrt{x^2+y^2}}^1(xy^2+y^3+y^2 z)dz\\,dy\\,dx$"),
      o("4","$\\dfrac{\\pi}{8}$")
    ],
    answer: 1,
    explanation: "$\\text{div}\\vec F=y^2+3y^2+y^2=5y^2$.\n원주좌표: $\\!\\iiint 5r^2\\sin^2\\theta\\cdot r\\,dz\\,dr\\,d\\theta,\\,r\\le z\\le 1$.\n$=\\!\\int_0^{2\\pi}\\sin^2\\theta d\\theta\\!\\int_0^1 5r^3(1-r)dr=\\!\\int\\sin^2\\theta\\!\\int(5r^3-5r^4)dr$."
  }),
  build({
    num: 6, subject: "적분학", unit: "정적분", concept: "극곡선 차집합 면적", difficulty: "medium",
    question: "극좌표에서 곡선 $r^2=\\cos 2\\theta$의 외부이면서 곡선 $r=2\\cos\\theta$의 내부인 영역의 면적을 구하시오.",
    options: [o("1","$\\pi$"), o("2","$\\pi-\\dfrac{1}{2}$"), o("3","$\\pi+\\dfrac{1}{2}$"), o("4","$\\dfrac{\\pi}{2}+\\dfrac{1}{2}$")],
    answer: 2,
    explanation: "$r=2\\cos\\theta$ 원(반지름 1) 면적 $=\\pi$.\n$r^2=\\cos 2\\theta$ 렘니스케이트 면적 $=1$.\n$r^2=\\cos 2\\theta$의 우측 반쪽 (1,4사분면)이 원 내부에 들어감, 면적 $\\dfrac{1}{2}$.\n차 $=\\pi-\\dfrac{1}{2}$."
  }),
  build({
    num: 7, subject: "적분학", unit: "급수", concept: "급수 수렴 개수", difficulty: "medium",
    question: "다음 3개의 무한급수 중 수렴하는 급수의 개수를 구하시오.\n\n(가) $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\!\\left(\\dfrac{n}{n+1}\\right)^n$\n(나) $\\!\\displaystyle\\sum_{n=2}^{\\infty}\\!\\left(\\dfrac{\\ln n}{n^2}+\\dfrac{1}{n(\\ln n)^2}\\right)$\n(다) $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\!\\left(\\dfrac{(-1)^n}{\\cosh n}+\\dfrac{\\sin n}{n\\sqrt n}\\right)$",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개")],
    answer: 3,
    explanation: "(가) $\\!\\lim(n/(n+1))^n=1/e\\ne 0$ ⇒ 발산.\n(나) 두 항 모두 수렴 ⇒ 수렴.\n(다) 교대급수 + 디리클레 ⇒ 수렴.\n수렴 2개."
  }),
  build({
    num: 8, subject: "적분학", unit: "급수", concept: "테일러 급수 특정 계수($f^{(23)}$)", difficulty: "medium",
    question: "$f(x)=\\!\\displaystyle\\int_0^x e^{-t^2}dt$일 때 $f^{(23)}(0)$의 값을 구하시오.",
    options: [o("1","$0$"), o("2","$-\\dfrac{22!}{11!}$"), o("3","$\\dfrac{23!}{11!}$"), o("4","$-\\dfrac{23!}{11!}$")],
    answer: 2,
    explanation: "$e^{-t^2}=\\!\\sum\\dfrac{(-t^2)^n}{n!}$. 적분: $f(x)=\\!\\sum\\dfrac{(-1)^n x^{2n+1}}{n!(2n+1)}$.\n$x^{23}$ 계수 ($n=11$): $\\dfrac{-1}{11!\\cdot 23}$.\n$f^{(23)}(0)=\\dfrac{-1}{11!\\cdot 23}\\cdot 23!=-\\dfrac{22!}{11!}$."
  }),
  build({
    num: 9, subject: "미분학", unit: "도함수", concept: "로그미분법($x^{\\cos x}$)", difficulty: "medium",
    question: "$f(x)=x^{\\cos x},\\,x>0$일 때 $x=\\dfrac{\\pi}{2}$에서의 도함수의 값 $f'\\!\\left(\\dfrac{\\pi}{2}\\right)$를 구하시오.",
    options: [o("1","$\\ln 2-\\ln\\pi$"), o("2","$\\ln\\pi-\\ln 2$"), o("3","$\\ln\\pi+\\ln 2$"), o("4","$-\\ln\\pi-\\ln 2$")],
    answer: 1,
    explanation: "$\\ln f=\\cos x\\ln x$. $\\dfrac{f'}{f}=-\\sin x\\ln x+\\dfrac{\\cos x}{x}$.\n$x=\\pi/2$: $f(\\pi/2)=1$. $\\dfrac{f'(\\pi/2)}{1}=-\\ln(\\pi/2)+0=\\ln(2/\\pi)=\\ln 2-\\ln\\pi$."
  }),
  build({
    num: 10, subject: "미분학", unit: "도함수", concept: "조건부 명제(여러 성질)", difficulty: "mediumHard",
    question: "$x\\ge 1$에서 정의된 함수 $f(x)$가 $f(1)=1$이고 $f'(x)=\\dfrac{1}{x^2+(f(x))^2}$를 만족할 때 다음 $f(x)$의 성질 중 옳은 것의 개수를 구하시오.\n\n(가) $f'(x)\\le\\dfrac{1}{1+x^2}$\n(나) $f(x)=1+\\!\\displaystyle\\int_1^x f'(t)dt$\n(다) $\\!\\displaystyle\\lim_{x\\to\\infty}f(x)\\le 1+\\dfrac{\\pi}{4}$",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개")],
    answer: 4,
    explanation: "$f'>0$ ⇒ 증가, $f(x)\\ge 1$ ⇒ $(f)^2\\ge 1$ ⇒ $f'\\le\\dfrac{1}{x^2+1}$ ⇒ (가) 참.\n(나) 미적분 기본정리 ⇒ 참.\n(다) $\\!\\lim f\\le 1+\\!\\int_1^{\\infty}\\dfrac{dt}{1+t^2}=1+\\dfrac{\\pi}{4}$ ⇒ 참.\n모두 참."
  }),
  build({
    num: 11, subject: "적분학", unit: "정적분", concept: "적분 계산 잘못 찾기", difficulty: "medium",
    question: "다음 중 적분의 계산이 잘못된 것을 고르시오.\n\n(1) $\\!\\displaystyle\\int_1^2(\\ln x)^2 dx=2(\\ln 2)^2-4\\ln 2+2$\n(2) $\\!\\displaystyle\\int_0^{\\infty}x^5 e^{-x}dx=120$\n(3) $\\!\\displaystyle\\int_0^3\\dfrac{1}{(x-1)^2}dx=-\\dfrac{3}{2}$\n(4) $\\!\\displaystyle\\int_0^{\\pi^2/4}\\sin\\sqrt x\\,dx=2$",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)")],
    answer: 3,
    explanation: "(3) 거짓: $x=1$에서 특이점, 발산. 다른 보기들은 모두 정확."
  }),
  build({
    num: 12, subject: "적분학", unit: "정적분", concept: "회전곡면 면적($\\cosh$)", difficulty: "medium",
    question: "곡선 $y=\\cosh x,\\,0\\le x\\le 1$을 $x$축을 중심으로 회전하여 얻은 곡면의 면적을 구하시오.",
    options: [
      o("1","$2\\pi\\sinh 1$"),
      o("2","$\\dfrac{\\pi}{2}(e^2-e^{-2}+4)$"),
      o("3","$\\pi(e-e^{-1})$"),
      o("4","$\\pi\\!\\left(\\dfrac{\\sinh 2}{2}+1\\right)$")
    ],
    answer: 4,
    explanation: "$S=2\\pi\\!\\int_0^1\\cosh x\\sqrt{1+\\sinh^2 x}dx=2\\pi\\!\\int_0^1\\cosh^2 x\\,dx=2\\pi\\cdot\\dfrac{\\sinh 2+2}{4}=\\pi\\!\\left(\\dfrac{\\sinh 2}{2}+1\\right)$."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "중적분", concept: "변수변환·이중적분", difficulty: "medium",
    question: "$R$이 $y=x,\\,y=3x,\\,xy=1,\\,xy=3$을 경계로 하는 제1사분면의 영역일 때 이중적분 $\\!\\displaystyle\\iint_R xy\\,dA$를 구하시오.",
    options: [o("1","$2\\ln 2$"), o("2","$2\\ln 3$"), o("3","$3\\ln 2$"), o("4","$4\\ln 3$")],
    answer: 2,
    explanation: "$u=y/x,\\,v=xy$ 치환. $1\\le u\\le 3,\\,1\\le v\\le 3$. $|J|=\\dfrac{1}{2u}$.\n$\\!\\iint v\\cdot\\dfrac{1}{2u}du\\,dv=\\dfrac{1}{2}\\!\\int_1^3\\dfrac{du}{u}\\!\\int_1^3 v\\,dv=\\dfrac{\\ln 3}{2}\\cdot 4=2\\ln 3$."
  }),
  build({
    num: 14, subject: "공학수학", unit: "편미분방정식", concept: "직사각형 라플라스 BVP", difficulty: "mediumHard",
    question: "윗변과 아랫변 온도 $0$, 왼쪽·오른쪽 변 온도가 처음에 주어진 직사각형 판의 평형상태 온도 $u(x,y)$: $\\dfrac{\\partial^2 u}{\\partial x^2}+\\dfrac{\\partial^2 u}{\\partial y^2}=0,\\,0<x<a,\\,0<y<b$. $u(x,0)=0,\\,u(x,b)=0,\\,u(0,y)=F(y),\\,u(a,y)=G(y)$. 해의 형태가 $u(x,y)=\\!\\sum_{n=1}^{\\infty}\\!\\left(A_n\\cosh\\dfrac{n\\pi x}{b}+B_n\\sinh\\dfrac{n\\pi x}{b}\\right)\\sin\\dfrac{n\\pi y}{b}$일 때 옳지 않은 것을 고르시오.",
    options: [
      o("1","$A_n=\\dfrac{2}{b}\\!\\int_0^b F(y)\\sin\\dfrac{n\\pi y}{b}dy$"),
      o("2","$F(y)=\\sin\\dfrac{3\\pi y}{b}$이면 $A_3=1$이고 $n\\ne 3$에 대해 $A_n=0$이다."),
      o("3","$G(y)=0$이면 모든 $n$에 대해 $B_n=0$이다."),
      o("4","$F(y)=0,\\,G(y)=\\sin\\dfrac{3\\pi y}{b}$이면 $B_3=\\dfrac{1}{\\sinh\\dfrac{3\\pi a}{b}}$이고 $n\\ne 3$에 대해 $B_n=0$이다.")
    ],
    answer: 3,
    explanation: "(3) 거짓: $G(y)=0$이라도 $F(y)$가 0이 아닐 수 있으므로 $B_n$은 $A_n$의 관계식에서 결정. 일반적으로 $B_n=0$이 아님.\n나머지는 직접 계산으로 검증."
  }),
  build({
    num: 15, subject: "공학수학", unit: "미분방정식", concept: "변수치환(코시·극좌표·파동)", difficulty: "mediumHard",
    question: "(가)~(다) 중 변수 치환에 의해 식이 옳게 변형된 것의 개수를 구하시오.\n\n(가) $x=e^t$에 의해 $ax^2\\dfrac{d^2 y}{dx^2}+bx\\dfrac{dy}{dx}+cy=0$은 $a\\dfrac{d^2 y}{dt^2}+(b-a)\\dfrac{dy}{dt}+cy=0$으로 변형\n(나) $x=r\\cos\\theta,\\,y=r\\sin\\theta$에 의해 $\\dfrac{\\partial^2 u}{\\partial x^2}+\\dfrac{\\partial^2 u}{\\partial y^2}=0$은 $\\dfrac{\\partial^2 u}{\\partial r^2}+\\dfrac{1}{r}\\dfrac{\\partial u}{\\partial r}+\\dfrac{1}{r^2}\\dfrac{\\partial^2 u}{\\partial\\theta^2}=0$으로 변형\n(다) $\\xi=x+at,\\,\\eta=x-at$에 의해 $a^2\\dfrac{\\partial^2 u}{\\partial x^2}=\\dfrac{\\partial^2 u}{\\partial t^2}$은 $\\dfrac{\\partial^2 u}{\\partial\\eta\\partial\\xi}=0$으로 변형 (단, $a\\ne 0$)",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개")],
    answer: 4,
    explanation: "(가) 코시-오일러 → 상수계수: $a\\ddot y+(b-a)\\dot y+cy=0$ ⇒ 참.\n(나) 극좌표 라플라스 ⇒ 참.\n(다) 파동 방정식 D'Alembert 치환 ⇒ 참.\n모두 참."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 홍익대):`, data.map((d) => d.id).join(", "));
