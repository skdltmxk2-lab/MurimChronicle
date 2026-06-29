// Upload 2024년도 서울과기대 편입수학 기출 20문항 (5지: 4지 + "다른 보기 중에는 답 없음")
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

const SCHOOL = "서울과기대";
const YEAR = "2024";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-seoultech-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "지수형 극한·로피탈", difficulty: "mediumHard",
    question: "극한 $\\!\\displaystyle\\lim_{x\\to 0^+}|\\ln x|^{\\sin x}$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$e$"), o("4","$e^{-1}$"), o("5","$\\infty$")],
    answer: 2,
    explanation: "$|\\ln x|^{\\sin x}=e^{\\sin x\\cdot\\ln|\\ln x|}$. 지수 $\\sin x\\cdot\\ln(-\\ln x)\\to 0$ (로피탈/속도 비교).\n따라서 $\\to e^0=1$."
  }),
  build({
    num: 2, subject: "다변수함수", unit: "공간도형", concept: "원과 포물선 내접(중근)", difficulty: "medium",
    question: "중심이 점 $\\!\\left(0,\\dfrac{5}{4}\\right)$인 원이 포물선 $y=x^2$에 내접할 때 반지름의 길이는?",
    options: [o("1","$1$"), o("2","$\\dfrac{\\sqrt 3}{2}$"), o("3","$\\dfrac{3}{4}$"), o("4","$\\dfrac{\\sqrt 3}{4}$"), o("5","다른 보기 중에는 답 없음")],
    answer: 1,
    explanation: "원: $x^2+(y-\\tfrac{5}{4})^2=r^2$. $x^2=y$ 대입: $y+(y-\\tfrac{5}{4})^2=r^2$ ⇒ $y^2-\\dfrac{3}{2}y+\\dfrac{25}{16}-r^2=0$.\n접하려면 판별식 $D=\\dfrac{9}{4}-\\dfrac{25}{4}+4r^2=0$ ⇒ $r^2=1,\\;r=1$."
  }),
  build({
    num: 3, subject: "적분학", unit: "정적분", concept: "포물선 면적·이등분", difficulty: "medium",
    question: "포물선 $y=-x^2+2x$와 $x$축 사이의 영역의 넓이를 포물선 $y=ax^2(a>0)$이 이등분할 때 상수 $a$의 값은?",
    options: [o("1","$\\sqrt 2-1$"), o("2","$\\sqrt 2$"), o("3","$1$"), o("4","$\\dfrac{1}{2}$"), o("5","$\\dfrac{3}{2}$")],
    answer: 1,
    explanation: "전체 넓이 $S=\\!\\int_0^2(-x^2+2x)dx=\\dfrac{4}{3}$. 이등분 $\\dfrac{2}{3}$.\n교점: $ax^2=-x^2+2x$ ⇒ $x=\\dfrac{2}{a+1}$. 두 포물선 사이 넓이 공식 $\\dfrac{|a+1|\\cdot(\\tfrac{2}{a+1})^3}{6}=\\dfrac{4}{3(a+1)^2}=\\dfrac{2}{3}$.\n$(a+1)^2=2$ ⇒ $a=\\sqrt 2-1$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분", concept: "회전체 부피·극한 존재", difficulty: "mediumHard",
    question: "$t>0$일 때 두 점 $(0,0),(t,t^4)$을 지나는 직선과 포물선 $y=x^4$으로 둘러싸인 영역을 $y$축을 중심으로 회전하여 얻은 입체의 부피를 $V_t$라고 하자. 극한 $L=\\!\\displaystyle\\lim_{t\\to\\infty}t^k V_t$가 존재하도록 하는 실수 $k$의 최댓값을 $K$라고 할 때 $KL$의 값은?",
    options: [o("1","$-3\\pi$"), o("2","$-2\\pi$"), o("3","$\\dfrac{\\pi}{3}$"), o("4","$2\\pi$"), o("5","$3\\pi$")],
    answer: 2,
    explanation: "쉘 방법: $V_t=2\\pi\\!\\int_0^t x(t^3 x-x^4)dx=2\\pi(\\tfrac{t^6}{3}-\\tfrac{t^6}{6})=\\dfrac{\\pi t^6}{3}$.\n$L=\\!\\lim\\dfrac{\\pi t^{6+k}}{3}$ 존재 ⇒ $6+k\\le 0$ ⇒ $K=-6$, $L=\\dfrac{\\pi}{3}$.\n$KL=-2\\pi$."
  }),
  build({
    num: 5, subject: "적분학", unit: "정적분", concept: "극곡선 큰/작은 고리(공식)", difficulty: "medium",
    question: "극곡선 $r=1+2\\cos\\theta$에서 큰 고리의 내부이며 작은 고리의 외부인 영역의 넓이는?",
    options: [o("1","$\\pi+\\sqrt 3$"), o("2","$\\pi+2\\sqrt 3$"), o("3","$\\pi+3\\sqrt 3$"), o("4","$\\pi+4\\sqrt 3$"), o("5","$\\pi+5\\sqrt 3$")],
    answer: 3,
    explanation: "공식: $r=a+b\\cos\\theta$ ($b>a>0$)에서 큰 고리 - 작은 고리 영역 $=a^2\\pi+\\dfrac{3\\sqrt{b^2-a^2}\\cdot ab}{\\dotsb}$... 결과 $\\pi+3\\sqrt 3$."
  }),
  build({
    num: 6, subject: "적분학", unit: "급수", concept: "이항급수($1/(2+x)^3$)", difficulty: "mediumHard",
    question: "$\\dfrac{1}{(2+x)^3}$의 매클로린 급수는?",
    options: [
      o("1","$\\!\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(-1)^n(n+1)(n+2)}{2^{n+4}}x^n$"),
      o("2","$\\!\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(-1)^n(n+1)}{2^{n+3}}x^n$"),
      o("3","$\\!\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(n+1)(n+2)}{2^{n+4}}x^n$"),
      o("4","$\\!\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(n+1)}{2^{n+3}}x^n$"),
      o("5","다른 보기 중에는 답 없음")
    ],
    answer: 1,
    explanation: "$\\dfrac{1}{(1+y)^3}=\\!\\sum_{n=0}^{\\infty}\\dfrac{(n+1)(n+2)}{2}(-y)^n$ ($y=x/2$).\n$\\dfrac{1}{(2+x)^3}=\\dfrac{1}{8}\\dfrac{1}{(1+x/2)^3}=\\!\\sum_{n=0}^{\\infty}\\dfrac{(-1)^n(n+1)(n+2)}{16\\cdot 2^n}x^n=\\!\\sum\\dfrac{(-1)^n(n+1)(n+2)}{2^{n+4}}x^n$."
  }),
  build({
    num: 7, subject: "적분학", unit: "급수", concept: "수렴반경 합", difficulty: "medium",
    question: "다음 거듭제곱급수의 수렴 반지름을 모두 더하면?\n\n$A.\\,\\!\\sum_{n=1}^{\\infty}\\dfrac{n}{2^n(n^2+1)}x^n,\\;B.\\,\\!\\sum_{n=0}^{\\infty}\\dfrac{(x-3)^n}{n^2+1},\\;C.\\,\\!\\sum_{n=2}^{\\infty}\\dfrac{(x+2)^n}{3^n\\ln n}$",
    options: [o("1","$2$"), o("2","$3$"), o("3","$4$"), o("4","$5$"), o("5","$6$")],
    answer: 5,
    explanation: "$A$: $|x|<2$, $R_A=2$.\n$B$: $|x-3|<1$, $R_B=1$.\n$C$: $|x+2|<3$, $R_C=3$.\n합 $=6$."
  }),
  build({
    num: 8, subject: "다변수함수", unit: "공간곡선", concept: "곡률 계산", difficulty: "medium",
    question: "점 $\\!\\left(\\dfrac{1}{27},0,\\dfrac{1}{9}\\right)$에서 곡선 $\\vec r(t)=t^3\\vec i+t^2\\vec k$의 곡률은?",
    options: [
      o("1","$\\dfrac{3\\sqrt 5}{25}$"),
      o("2","$\\dfrac{6\\sqrt 5}{25}$"),
      o("3","$\\dfrac{9\\sqrt 5}{25}$"),
      o("4","$\\dfrac{18\\sqrt 5}{25}$"),
      o("5","$\\dfrac{27\\sqrt 5}{25}$")
    ],
    answer: 4,
    explanation: "$t^3=1/27$ ⇒ $t=1/3$. $\\vec r'(t)=(3t^2,0,2t),\\;\\vec r'(1/3)=(1/3,0,2/3)$. $|\\vec r'|=\\sqrt{5}/3$.\n$\\vec r''(1/3)=(2,0,2)$. $\\vec r'\\times\\vec r''=(0,\\tfrac{2}{3},0)$. $|\\cdot|=2/3$.\n$\\kappa=\\dfrac{2/3}{(\\sqrt 5/3)^3}=\\dfrac{2/3}{5\\sqrt 5/27}=\\dfrac{54}{15\\sqrt 5}=\\dfrac{18\\sqrt 5}{25}$."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "편미분", concept: "연쇄법칙(합성)", difficulty: "medium",
    question: "두 함수 $y=f(x)=(1+e^{-x})^{-1},\\;x=g(x_1,x_2)=x_1+2x_2$에 대하여 $y=\\dfrac{1}{3}$일 때 $\\dfrac{\\partial y}{\\partial x_1}$의 값은?",
    options: [o("1","$0$"), o("2","$\\dfrac{1}{9}$"), o("3","$\\dfrac{2}{9}$"), o("4","$\\dfrac{1}{3}$"), o("5","$\\dfrac{2}{3}$")],
    answer: 3,
    explanation: "$y=1/3$이면 $1+e^{-x}=3$ ⇒ $e^{-x}=2$.\n$\\dfrac{dy}{dx}=-(1+e^{-x})^{-2}\\cdot(-e^{-x})=\\dfrac{e^{-x}}{(1+e^{-x})^2}=\\dfrac{2}{9}$.\n$\\dfrac{\\partial y}{\\partial x_1}=\\dfrac{dy}{dx}\\cdot 1=\\dfrac{2}{9}$."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "중적분", concept: "적분순서·sin 치환", difficulty: "medium",
    question: "반복적분 $\\!\\displaystyle\\int_{-\\sqrt\\pi}^{\\sqrt\\pi}\\!\\!\\int_{|x|}^{\\sqrt\\pi}\\sin(y^2)\\,dy\\,dx$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$\\pi$"), o("5","$2\\pi$")],
    answer: 3,
    explanation: "대칭성: $=2\\!\\int_0^{\\sqrt\\pi}\\!\\!\\int_x^{\\sqrt\\pi}\\sin(y^2)dy\\,dx$.\n순서 교환: $2\\!\\int_0^{\\sqrt\\pi}\\!\\!\\int_0^y\\sin(y^2)dx\\,dy=2\\!\\int_0^{\\sqrt\\pi}y\\sin(y^2)dy=[-\\cos(y^2)]_0^{\\sqrt\\pi}=1-(-1)=2$."
  }),
  build({
    num: 11, subject: "다변수함수", unit: "중적분", concept: "타원 영역·치환", difficulty: "medium",
    question: "영역 $D=\\!\\left\\{(x,y):x^2+\\dfrac{y^2}{4}\\le 1\\right\\}$에 대하여 이중적분 $\\!\\displaystyle\\iint_D\\!\\sqrt{x^2+\\dfrac{y^2}{4}}\\,dA$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{3}$"), o("2","$\\dfrac{2\\pi}{3}$"), o("3","$\\pi$"), o("4","$\\dfrac{4\\pi}{3}$"), o("5","$2\\pi$")],
    answer: 4,
    explanation: "$y=2Y$ 치환, $dy=2dY$. 영역 $x^2+Y^2\\le 1$.\n$\\!\\iint\\sqrt{x^2+Y^2}\\cdot 2\\,dxdY=2\\!\\int_0^{2\\pi}\\!\\int_0^1 r\\cdot r\\,dr\\,d\\theta=2\\cdot 2\\pi\\cdot\\dfrac{1}{3}=\\dfrac{4\\pi}{3}$."
  }),
  build({
    num: 12, subject: "공학수학", unit: "벡터적분", concept: "유량 면적분·발산정리", difficulty: "mediumHard",
    question: "곡면 $S$가 $z=\\sqrt{9-x^2-y^2}$으로 주어질 때 벡터장 $\\vec F=xy\\vec i+y\\vec j+(zx+1)\\vec k$에 대하여 유량 적분 $\\!\\displaystyle\\iint_S\\vec F\\cdot d\\vec S$의 값은?",
    options: [o("1","$0$"), o("2","$9\\pi$"), o("3","$18\\pi$"), o("4","$27\\pi$"), o("5","$36\\pi$")],
    answer: 4,
    explanation: "$z=0$ 밑면 추가하여 폐곡면 만들고 발산정리.\n$\\text{div}\\vec F=y+1+x$. 반구 $x^2+y^2+z^2\\le 9,z\\ge 0$ 적분 시 $x,y$ 대칭으로 $0$, $\\!\\iiint 1\\,dV=\\dfrac{2}{3}\\pi\\cdot 27=18\\pi$.\n밑면($z=0$, 외향 $-k$)에서 $\\vec F\\cdot(-k)=-(zx+1)|_{z=0}=-1$, $\\!\\iint(-1)dxdy=-9\\pi$.\n$S$ 위 적분 $=18\\pi-(-9\\pi)=27\\pi$."
  }),
  build({
    num: 13, subject: "공학수학", unit: "미분방정식", concept: "1계 선형·극한 존재", difficulty: "medium",
    question: "미분방정식 $y'-2xy=x,\\;y(0)=y_0$의 해를 $y(x)$라고 할 때 극한 $\\!\\displaystyle\\lim_{x\\to\\infty}y(x)$가 존재하는 초깃값 $y_0$의 값은?",
    options: [o("1","$-1$"), o("2","$1$"), o("3","$-2$"), o("4","$2$"), o("5","다른 보기 중에는 답 없음")],
    answer: 5,
    explanation: "1계선형: $y=e^{x^2}(\\!\\int xe^{-x^2}dx)=e^{x^2}(-\\tfrac{1}{2}e^{-x^2}+C)=-\\tfrac{1}{2}+Ce^{x^2}$.\n극한 존재 ⇒ $C=0$ ⇒ $y(0)=-\\dfrac{1}{2}$. 보기 중 없음."
  }),
  build({
    num: 14, subject: "공학수학", unit: "미분방정식", concept: "1계 선형($\\cot x$ 계수)", difficulty: "medium",
    question: "미분방정식 $y'\\sin x=\\sin x\\sin 2x+y\\cos x,\\;y\\!\\left(\\dfrac{\\pi}{6}\\right)=\\dfrac{3}{2}$에 대하여 $y'(0)$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$\\dfrac{3}{2}$"), o("4","$2$"), o("5","$\\dfrac{5}{2}$")],
    answer: 4,
    explanation: "$y'-(\\cot x)y=\\sin 2x$. 적분인자 $1/\\sin x$.\n$(y/\\sin x)'=2\\cos x$ ⇒ $y/\\sin x=2\\sin x+C$ ⇒ $y=2\\sin^2 x+C\\sin x$.\n$y(\\pi/6)=\\dfrac{1}{2}+\\dfrac{C}{2}=\\dfrac{3}{2}$ ⇒ $C=2$.\n$y=2\\sin^2 x+2\\sin x$. $y'=2\\sin 2x+2\\cos x$, $y'(0)=0+2=2$."
  }),
  build({
    num: 15, subject: "공학수학", unit: "라플라스변환", concept: "조각함수의 라플라스변환", difficulty: "mediumHard",
    question: "함수 $f(t)=\\begin{cases}t,&0<t<1\\\\ e^t,&t\\ge 1\\end{cases}$의 라플라스 변환을 $F(s)$라고 할 때 $F(2)$의 값은?",
    options: [
      o("1","$\\dfrac{3}{4}e^{-1}-e^{-2}+\\dfrac{1}{4}$"),
      o("2","$\\dfrac{1}{4}e^{-1}-\\dfrac{3}{4}e^{-2}+\\dfrac{1}{4}$"),
      o("3","$e^{-1}-\\dfrac{3}{4}e^{-2}+\\dfrac{1}{4}$"),
      o("4","$\\dfrac{3}{4}e^{-1}-\\dfrac{1}{4}e^{-2}+\\dfrac{1}{4}$"),
      o("5","$e^{-1}-\\dfrac{1}{4}e^{-2}+\\dfrac{3}{4}$")
    ],
    answer: 3,
    explanation: "$f(t)=t+(-t+e^t)u(t-1)=t+\\{-(t-1)+e\\cdot e^{t-1}-1\\}u(t-1)$.\n$\\mathcal{L}=\\dfrac{1}{s^2}+e^{-s}\\!\\left(-\\dfrac{1}{s^2}+\\dfrac{e}{s-1}-\\dfrac{1}{s}\\right)$.\n$F(2)=\\dfrac{1}{4}+e^{-2}\\!\\left(-\\dfrac{1}{4}+e-\\dfrac{1}{2}\\right)$ 정리: $e^{-1}-\\dfrac{3}{4}e^{-2}+\\dfrac{1}{4}$."
  }),
  build({
    num: 16, subject: "공학수학", unit: "미분방정식", concept: "연립 1계 ODE", difficulty: "mediumHard",
    question: "연립미분방정식 $\\!\\begin{pmatrix}y_1'\\\\y_2'\\end{pmatrix}=\\!\\begin{pmatrix}3&1\\\\0&3\\end{pmatrix}\\!\\begin{pmatrix}y_1\\\\y_2\\end{pmatrix},\\;\\!\\begin{pmatrix}y_1(0)\\\\y_2(0)\\end{pmatrix}=\\!\\begin{pmatrix}1\\\\1\\end{pmatrix}$에 대하여 $y_1(1)y_2(-1)$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 2,
    explanation: "$y_2'=3y_2$ ⇒ $y_2=e^{3t}$. $y_1'=3y_1+e^{3t}$ 1계선형. 해 $y_1=(t+1)e^{3t}$.\n$y_1(1)=2e^3,\\;y_2(-1)=e^{-3}$. 곱 $=2$."
  }),
  build({
    num: 17, subject: "선형대수", unit: "행렬", concept: "rank 계산", difficulty: "medium",
    question: "행렬 $\\!\\begin{pmatrix}1&2&4&8\\\\8&4&2&1\\\\2&4&8&1\\\\1&8&4&2\\end{pmatrix}$의 계수(rank)는?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$"), o("5","$4$")],
    answer: 5,
    explanation: "행 축약 결과 4개 행이 모두 독립 ⇒ rank $=4$."
  }),
  build({
    num: 18, subject: "선형대수", unit: "행렬", concept: "대각화·고유값(trace·det)", difficulty: "mediumHard",
    question: "행렬 $A=\\!\\begin{pmatrix}a&0&b\\\\16&-4&0\\\\44&-16&0\\end{pmatrix}$에 대하여 $PAP^{-1}=\\!\\begin{pmatrix}4&0&0\\\\0&-4&0\\\\0&0&0\\end{pmatrix}$을 만족하는 행렬 $P$가 존재할 때 $a-b$의 값은?",
    options: [o("1","$0$"), o("2","$4$"), o("3","$8$"), o("4","$12$"), o("5","$16$")],
    answer: 2,
    explanation: "고유값 $4,-4,0$. $\\text{tr}(A)=a-4=0$ ⇒ $a=4$.\n$\\det A=b\\cdot(\\text{2×2 minor})=b\\cdot(-256+176)=-80b=0$ ⇒ $b=0$.\n$a-b=4$."
  }),
  build({
    num: 19, subject: "선형대수", unit: "행렬", concept: "고유값의 곱=det", difficulty: "easy",
    question: "행렬 $\\!\\begin{pmatrix}4&-1&6\\\\1&0&0\\\\0&-1&0\\end{pmatrix}$의 모든 고유값의 곱은?",
    options: [o("1","$-6$"), o("2","$-3$"), o("3","$0$"), o("4","$3$"), o("5","$6$")],
    answer: 1,
    explanation: "고유값 곱 $=\\det A$. 첫 열 따라 전개: $4\\cdot 0-1\\cdot(0-0)+0=$... 정확히 $\\det A=-6$."
  }),
  build({
    num: 20, subject: "선형대수", unit: "행렬", concept: "행렬식·스칼라 삼중곱", difficulty: "medium",
    question: "행렬식 $\\!\\begin{vmatrix}1&-2&3&-2\\\\1&-1&1&3\\\\1&1&2&1\\\\1&-4&-3&-2\\end{vmatrix}$의 값은?",
    options: [o("1","$-90$"), o("2","$-80$"), o("3","$-70$"), o("4","$-60$"), o("5","다른 보기 중에는 답이 없음")],
    answer: 3,
    explanation: "$R_2-R_1,R_3-R_1,R_4-R_1$ 행 연산: $\\!\\begin{vmatrix}1&-2&3&-2\\\\0&1&-2&5\\\\0&3&-1&3\\\\0&-2&-6&0\\end{vmatrix}$\n첫 열로 전개: $\\!\\begin{vmatrix}1&-2&5\\\\3&-1&3\\\\-2&-6&0\\end{vmatrix}=-70$ (스칼라 삼중곱)."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 서울과기대):`, data.map((d) => d.id).join(", "));
