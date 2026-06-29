// Upload 2024년도 홍익대 편입수학 기출 15문항 (4지 선다, 70분)
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
const YEAR = "2024";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-hongik-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "도함수", concept: "역함수 미분", difficulty: "medium",
    question: "함수 $f(x)=e^{\\sin x}+\\sin^{-1}x\\;(-1\\le x\\le 1)$에 대하여 $y=1$에서 $f^{-1}$의 도함수 값 $(f^{-1})'(1)$을 구하시오.",
    options: [o("1","$1$"), o("2","$2$"), o("3","$\\dfrac{1}{2}$"), o("4","$-\\dfrac{1}{2}$")],
    answer: 3,
    explanation: "$f(0)=1$ ⇒ $f^{-1}(1)=0$. $f'(x)=e^{\\sin x}\\cos x+\\dfrac{1}{\\sqrt{1-x^2}}$, $f'(0)=2$.\n$(f^{-1})'(1)=\\dfrac{1}{2}$."
  }),
  build({
    num: 2, subject: "적분학", unit: "급수", concept: "수렴 급수 판정(3종)", difficulty: "medium",
    question: "다음 중에서 수렴하는 급수를 모두 고르시오.\n\n(가) $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-1)^n}{n}$\n(나) $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\!\\left(\\dfrac{1}{n}-\\dfrac{1}{e^n}\\right)$\n(다) $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{1}{n}\\sinh\\dfrac{1}{\\sqrt n}$",
    options: [o("1","(가)"), o("2","(가),(나)"), o("3","(다)"), o("4","(가),(다)")],
    answer: 4,
    explanation: "(가) 교대급수 수렴.\n(나) $\\sim\\!\\sum 1/n$ 발산.\n(다) $\\dfrac{1}{n}\\sinh(1/\\sqrt n)\\sim\\dfrac{1}{n\\sqrt n}$ 수렴.\n수렴: (가),(다)."
  }),
  build({
    num: 3, subject: "적분학", unit: "급수", concept: "T-급수 계수", difficulty: "medium",
    question: "모든 실수 $x$에 대하여 $12(x-2)^{100}e^x=\\!\\displaystyle\\sum_{n=0}^{\\infty}a_n(x-2)^n$을 만족한다. $a_{105}$의 값을 구하시오.",
    options: [o("1","$\\dfrac{e^2}{12}$"), o("2","$\\dfrac{e}{12}$"), o("3","$\\dfrac{e^2}{10}$"), o("4","$\\dfrac{e}{10}$")],
    answer: 3,
    explanation: "$x\\to x+2$ 평행이동: $12x^{100}e^{x+2}=\\!\\sum a_n x^n$.\n$12e^2 x^{100}\\!\\left(1+x+\\dfrac{x^2}{2!}+\\cdots\\right)$. $x^{105}$의 계수: $12e^2\\cdot\\dfrac{1}{5!}=\\dfrac{e^2}{10}$."
  }),
  build({
    num: 4, subject: "다변수함수", unit: "편미분", concept: "이변수 함수 합성 항등식", difficulty: "medium",
    question: "$xy$평면 전체에서 정의된 함수 $f,g,h$가 $f(x,y)=\\begin{cases}1,&xy>0\\\\0,&xy=0\\\\-1,&xy<0\\end{cases},\\,g(x,y)=|xy|,\\,h(x,y)=xy$일 때 다음 중 옳은 것을 고르시오.",
    options: [
      o("1","$f(f(x,y),f(x,y))=f(x,y)$"),
      o("2","$f(g(x,y),h(x,y))=f(x,y)$"),
      o("3","$f(x,y)$는 $(0,0)$에서 연속이다."),
      o("4","$\\dfrac{h(x,y)}{x^2+y^2}$는 $(0,0)$에서 연속이다.")
    ],
    answer: 2,
    explanation: "(2) 검증: 모든 사분면에서 $f(|xy|,xy)=f(x,y)$ 성립.\n(1) 반례 존재.\n(3),(4) 거짓 (극한값 불일치)."
  }),
  build({
    num: 5, subject: "적분학", unit: "급수", concept: "거듭제곱급수 명제", difficulty: "medium",
    question: "거듭제곱급수 $\\!\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{(-1)^n}{2^n n\\ln n}x^n$에 대하여 옳은 것을 모두 고르시오.\n\n(가) 수렴반지름은 $2$이다.\n(나) $x=-2$에서 발산한다.\n(다) $x=1$에서 절대수렴한다.\n(라) 수렴범위는 $-2<x<2$이다.",
    options: [o("1","(가),(나)"), o("2","(가),(나),(다)"), o("3","(가),(나),(라)"), o("4","(나),(다),(라)")],
    answer: 2,
    explanation: "$R=2$, $x=-2$: $\\!\\sum\\dfrac{1}{n\\ln n}$ 발산, $x=2$: $\\!\\sum\\dfrac{(-1)^n}{n\\ln n}$ 교대 수렴.\n수렴범위 $-2<x\\le 2$.\n(가) 참, (나) 참, (다) $x=1$에서 절대수렴 참, (라) 거짓."
  }),
  build({
    num: 6, subject: "공학수학", unit: "미분방정식", concept: "2계 상수계수(복소근)", difficulty: "medium",
    question: "함수 $y(x)$가 $y''-4y'+(4+\\pi^2)y=0,\\,y(1)=-e^2,\\,y'(0)=2-\\pi$를 만족할 때 $y(0)$의 값을 구하시오.",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 1,
    explanation: "특성: $r^2-4r+4+\\pi^2=0$ ⇒ $r=2\\pm\\pi i$.\n$y=e^{2x}(c_1\\cos\\pi x+c_2\\sin\\pi x)$. $y(1)=e^2(-c_1)=-e^2$ ⇒ $c_1=1$.\n$y(0)=c_1=1$."
  }),
  build({
    num: 7, subject: "공학수학", unit: "미분방정식", concept: "적분미방·라플라스 극한", difficulty: "mediumHard",
    question: "초깃값 조건을 가진 미적분 방정식 $y'(t)+y(t)=1-\\!\\displaystyle\\int_0^t e^{-(t-u)}y(u)du,\\,y(0)=0$을 만족하는 $y(t)$에 대하여 $\\!\\displaystyle\\lim_{t\\to\\infty}y(t)$를 구하시오.",
    options: [o("1","$1$"), o("2","$\\dfrac{1}{2}$"), o("3","$\\dfrac{1}{3}$"), o("4","$\\dfrac{1}{4}$")],
    answer: 2,
    explanation: "라플라스: $sY+Y=\\dfrac{1}{s}-\\dfrac{Y}{s+1}$ ⇒ $Y=\\dfrac{s+1}{s(s^2+2s+2)}$.\n$\\!\\lim y=\\!\\lim sY=\\!\\lim\\dfrac{s+1}{s^2+2s+2}$ ($s\\to 0$): $\\dfrac{1}{2}$."
  }),
  build({
    num: 8, subject: "다변수함수", unit: "중적분", concept: "구면좌표 삼중적분", difficulty: "medium",
    question: "영역 $\\Omega=\\{(x,y,z)\\in\\mathbb R^3|\\,1\\le x^2+y^2+z^2\\le 4,\\,z\\ge 0\\}$에 대하여 삼중적분 $\\!\\displaystyle\\iiint_{\\Omega}e^{(x^2+y^2+z^2)^{3/2}}dxdydz$를 구하시오.",
    options: [
      o("1","$\\dfrac{2}{3}(e^6-1)\\pi$"),
      o("2","$\\dfrac{2}{3}(e^6-e)\\pi$"),
      o("3","$\\dfrac{2}{3}(e^8-1)\\pi$"),
      o("4","$\\dfrac{2}{3}(e^8-e)\\pi$")
    ],
    answer: 4,
    explanation: "구면좌표: $\\!\\int_0^{2\\pi}\\!\\!\\int_0^{\\pi/2}\\!\\!\\int_1^2 e^{\\rho^3}\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta=2\\pi\\cdot 1\\cdot\\dfrac{e^8-e}{3}=\\dfrac{2\\pi(e^8-e)}{3}$."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "중적분", concept: "극좌표 이중적분", difficulty: "medium",
    question: "이중적분 $\\!\\displaystyle\\int_0^2\\!\\!\\int_0^{\\sqrt{2y-y^2}}\\!\\sqrt{x^2+y^2}dx\\,dy$를 구하시오.",
    options: [o("1","$\\dfrac{16}{9}$"), o("2","$\\dfrac{2}{9}$"), o("3","$\\dfrac{2}{3}\\pi$"), o("4","$\\dfrac{1}{6}\\pi$")],
    answer: 1,
    explanation: "영역 $r=2\\sin\\theta$ (반원). 극좌표:\n$\\!\\int_0^{\\pi/2}\\!\\!\\int_0^{2\\sin\\theta}r^2 dr\\,d\\theta=\\dfrac{8}{3}\\!\\int_0^{\\pi/2}\\sin^3\\theta\\,d\\theta=\\dfrac{8}{3}\\cdot\\dfrac{2}{3}=\\dfrac{16}{9}$."
  }),
  build({
    num: 10, subject: "공학수학", unit: "벡터적분", concept: "보존장 선적분", difficulty: "medium",
    question: "곡선 $C:y=x^2$ ($x=0$에서 $x=1$까지)에 대하여 적분 $\\!\\displaystyle\\int_C(e^x y+e^y)dx+(e^x+xe^y)dy$를 구하시오.",
    options: [o("1","$e$"), o("2","$2e$"), o("3","$3e$"), o("4","$4e$")],
    answer: 2,
    explanation: "$P_y=e^x+e^y=Q_x$ ⇒ 완전. 모함수 $\\phi=e^x y+xe^y$.\n$\\!\\int_C=\\phi(1,1)-\\phi(0,0)=e+e-0=2e$."
  }),
  build({
    num: 11, subject: "공학수학", unit: "벡터적분", concept: "스토크스 정리·curl 결정", difficulty: "mediumHard",
    question: "$C$는 꼭짓점이 $(1,0,0),(0,1,0),(0,0,1)$인 삼각형의 경계선이며 $C$의 방향은 반시계 방향이다. 3차원 벡터장 $\\vec F$에 대하여 $\\!\\displaystyle\\oint_C\\vec F\\cdot d\\vec r=\\!\\int_0^1\\!\\!\\int_0^{1-x}(-4x-y)dy\\,dx$이 성립할 때 $\\text{curl}\\vec F$를 맞게 구한 것을 고르시오.",
    options: [
      o("1","$\\text{curl}\\vec F=-x\\vec i-2x\\vec j+(z-1)\\vec k$"),
      o("2","$\\text{curl}\\vec F=-x\\vec i-2x\\vec j+z\\vec k$"),
      o("3","$\\text{curl}\\vec F=-x\\vec i+2x\\vec j+(z-1)\\vec k$"),
      o("4","$\\text{curl}\\vec F=-x\\vec i+2x\\vec j+z\\vec k$")
    ],
    answer: 1,
    explanation: "스토크스: $\\!\\oint_C\\vec F\\cdot d\\vec r=\\!\\iint_S\\text{curl}\\vec F\\cdot\\vec n\\,dS=\\!\\iint_D\\text{curl}\\vec F\\cdot(1,1,1)\\,dA$ (정사영, $x+y+z=1$).\n$P+Q+R=-4x-y$ 만족 확인. $z=1-x-y$ 대입 시 (1)이 옳음."
  }),
  build({
    num: 12, subject: "선형대수", unit: "행렬", concept: "역행렬 특정 원소", difficulty: "medium",
    question: "행렬 $A=\\!\\begin{pmatrix}3&2&0&-2\\\\0&3&1&0\\\\0&1&0&0\\\\-2&2&-1&1\\end{pmatrix}$의 역행렬 $A^{-1}=[b_{ij}]$에서 $b_{43}$의 값을 구하시오.",
    options: [o("1","$0$"), o("2","$1$"), o("3","$7$"), o("4","$19$")],
    answer: 4,
    explanation: "$b_{43}=\\dfrac{1}{|A|}\\cdot(C_{34})=\\dfrac{1}{|A|}(-1)^{3+4}M_{34}$. $|A|=1$, $M_{34}$ 계산: $-\\!\\begin{vmatrix}3&2&0\\\\0&3&1\\\\-2&2&-1\\end{vmatrix}=19$.\n$b_{43}=19$."
  }),
  build({
    num: 13, subject: "선형대수", unit: "행렬", concept: "선형대수 명제 개수", difficulty: "medium",
    question: "다음 중 옳은 문장은 몇 개인지 고르시오.\n\n(a) 행렬 $A$가 정사각형이고 $c\\ne 0$인 실수일 때 $(cA)^{-1}=cA^{-1}$이다.\n(b) 행렬 $A$가 $2\\times 3$일 때 제차선형계 $A\\vec x=0$은 $\\text{rank}(A)$의 값에 관계없이 항상 $\\vec x\\ne 0$인 해를 갖는다.\n(c) 행렬 $A$가 $3\\times 3$일 때 제차선형계 $A\\vec x=0$은 $\\text{rank}(A)$의 값에 관계없이 항상 $\\vec x=0$만을 해로 갖는다.\n(d) 행렬 $A$가 $4\\times 3$이고 $\\text{rank}(A)=3$일 때 제차선형계 $A\\vec x=0$은 항상 $\\vec x=0$만을 해로 갖는다.\n(e) 행렬 $A$가 영행렬이 아닌 $4\\times 3$ 행렬일 때 $\\text{rank}(A)$의 최솟값은 $1$이고 최댓값은 $4$이다.",
    options: [o("1","$2$개"), o("2","$3$개"), o("3","$4$개"), o("4","$5$개")],
    answer: 1,
    explanation: "(a) 거짓: $(cA)^{-1}=\\dfrac{1}{c}A^{-1}$.\n(b) 참: $2\\times 3$이면 rank $\\le 2<3$, 핵 차원 $\\ge 1$.\n(c) 거짓: rank<3이면 비자명해 존재.\n(d) 참: rank $=3$이면 핵 $=\\{0\\}$.\n(e) 거짓: 최댓값은 $3$.\n참 2개."
  }),
  build({
    num: 14, subject: "미분학", unit: "극한과 연속", concept: "$1^\\infty$ 극한·로피탈", difficulty: "mediumHard",
    question: "함수 $f(x)=\\!\\displaystyle\\int_1^2 u^x du$에 대하여 $\\!\\displaystyle\\lim_{x\\to 0}(f(x))^{1/x}$을 구하시오.",
    options: [o("1","$\\dfrac{2}{e}$"), o("2","$2$"), o("3","$\\dfrac{4}{e}$"), o("4","$4$")],
    answer: 3,
    explanation: "$f(x)=\\dfrac{2^{x+1}-1}{x+1}$. $f(0)=1$. $(f(x))^{1/x}\\to e^{\\lim\\ln f(x)/x}$.\n로피탈: $\\!\\lim\\dfrac{2^{x+1}\\ln 2-1}{2x+1}|_{x=0}=2\\ln 2-1$.\n$=e^{2\\ln 2-1}=\\dfrac{4}{e}$."
  }),
  build({
    num: 15, subject: "공학수학", unit: "편미분방정식", concept: "라플라스 방정식(반원)", difficulty: "mediumHard",
    question: "반지름이 $1$인 반원에서 정상상태의 온도분포 $u(r,\\theta)$가 라플라스 방정식 $\\dfrac{\\partial^2 u}{\\partial r^2}+\\dfrac{1}{r}\\dfrac{\\partial u}{\\partial r}+\\dfrac{1}{r^2}\\dfrac{\\partial^2 u}{\\partial\\theta^2}=0$과 조건 $u(r,0)=0,\\,u(r,\\pi)=0,\\,u(1,\\theta)=f(\\theta)$를 만족하고 $r\\to 0$일 때 $u(r,\\theta)$는 유한하다. 해의 형태는 $u(r,\\theta)=\\!\\sum_{n=1}^{\\infty}(A_n r^n+B_n r^{-n})\\sin(n\\theta)$이다. 다음 중 옳지 않은 것을 고르시오.",
    options: [
      o("1","$A_n=\\dfrac{2}{\\pi}\\!\\int_0^{\\pi}f(\\theta)\\sin(n\\theta)d\\theta,\\,n=1,2,3,\\cdots$"),
      o("2","$B_n=0,\\,n=1,2,3,\\cdots$"),
      o("3","$f(\\theta)=\\sin\\theta$일 때 $A_1=1,\\,A_n=0,\\,n=2,3,4,\\cdots$"),
      o("4","$f(\\theta)=\\sin\\theta$일 때 $u(r,\\theta)=\\sin\\theta$")
    ],
    answer: 4,
    explanation: "(2) $r\\to 0$ 유한 ⇒ $B_n=0$.\n(3) 푸리에 사인 계산 ⇒ $A_1=1$.\n(4) 거짓: $u(r,\\theta)=r\\sin\\theta$가 옳음, $\\sin\\theta$ 아님."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 홍익대):`, data.map((d) => d.id).join(", "));
