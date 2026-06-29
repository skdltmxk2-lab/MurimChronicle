// Upload 2023년도 숙명여대 편입수학 기출 20문항
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

const SCHOOL = "숙명여대";
const YEAR = "2023";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-sookmyung-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "$\\infty/\\infty$ 형식", difficulty: "easy",
    question: "극한 $\\displaystyle\\lim_{x\\to\\infty}\\!\\dfrac{e^x-1}{\\cosh x}$의 값은?",
    options: [o("1","$0$"), o("2","$\\dfrac{1}{2}$"), o("3","$1$"), o("4","$2$"), o("5","$\\infty$")],
    answer: 4,
    explanation: "$\\cosh x=\\dfrac{e^x+e^{-x}}{2}$. $\\dfrac{e^x-1}{(e^x+e^{-x})/2}=\\dfrac{2(e^x-1)}{e^x+e^{-x}}\\to\\dfrac{2\\cdot 1}{1+0}=2$ (분자분모를 $e^x$로 나눔)."
  }),
  build({
    num: 2, subject: "미분학", unit: "극한과 연속", concept: "$\\sin^{-1}$ 형식", difficulty: "easy",
    question: "극한 $\\displaystyle\\lim_{x\\to\\infty}\\!\\sin^{-1}\\!\\left(\\dfrac{x^3-x^2+1}{x^3+x\\sqrt x-5}\\right)$의 값은?",
    options: [o("1","$0$"), o("2","$\\dfrac{\\pi}{4}$"), o("3","$\\dfrac{\\pi}{2}$"), o("4","$-\\dfrac{\\pi}{4}$"), o("5","$-\\dfrac{\\pi}{2}$")],
    answer: 3,
    explanation: "분수 $\\to 1$. $\\sin^{-1}(1)=\\dfrac{\\pi}{2}$."
  }),
  build({
    num: 3, subject: "미분학", unit: "도함수", concept: "조각함수 미분가능 조건", difficulty: "easy",
    question: "함수 $f(x)=\\begin{cases}x^a+1,& x\\ge 0\\\\ 1,& x<0\\end{cases}$이 $x=0$에서 미분가능하게 되는 양수 $a$의 값이 $\\mathbf{아닌}$ 것은?",
    options: [o("1","$1$"), o("2","$1.5$"), o("3","$2$"), o("4","$4$"), o("5","$10$")],
    answer: 1,
    explanation: "$f'(0+)=\\lim ax^{a-1}|_{x\\to 0^+}$. $a>1$이면 $0$, $a=1$이면 $1$. 좌측 $f'(0-)=0$.\n$a>1$일 때 미분가능. $a=1$은 미분불가능."
  }),
  build({
    num: 4, subject: "미분학", unit: "도함수", concept: "로그미분", difficulty: "medium",
    question: "함수 $y=x^{2\\ln x}$의 도함수는?",
    options: [o("1","$\\dfrac{4x^{\\ln x^2}\\ln x}{x}$"), o("2","$4x^{\\ln x^2}\\ln x$"), o("3","$\\dfrac{2x^{\\ln x}\\ln x}{x}$"), o("4","$2x^{\\ln x^2}\\ln x$"), o("5","$\\dfrac{2x^{\\ln x^2}\\ln x}{x}$")],
    answer: 1,
    explanation: "$\\ln y=2(\\ln x)\\cdot\\ln x=2(\\ln x)^2$.\n$y'/y=4(\\ln x)/x$. $y'=x^{2\\ln x}\\cdot 4\\ln x/x=4x^{\\ln x^2}\\ln x/x$ (여기서 $\\ln x^2=2\\ln x$이므로 $x^{2\\ln x}=x^{\\ln x^2}$)."
  }),
  build({
    num: 5, subject: "미분학", unit: "도함수", concept: "매개변수 접선", difficulty: "medium",
    question: "$t=1$일 때 곡선 $x=e^{t^2},\\,y=\\ln t^3-2t$ 위의 점에서의 접선의 방정식은?",
    options: [o("1","$y=-\\dfrac{3}{2}-\\dfrac{1}{2e}x$"), o("2","$y=-3+\\dfrac{1}{e}x$"), o("3","$y=-\\dfrac{5}{2}+\\dfrac{1}{2e}x$"), o("4","$y=-1-\\dfrac{1}{e}x$"), o("5","$y=-\\dfrac{7}{2}+\\dfrac{3}{2e}x$")],
    answer: 3,
    explanation: "$t=1$: $x=e,\\,y=0-2=-2$.\n$dy/dx=(dy/dt)/(dx/dt)=\\dfrac{3/t-2}{2te^{t^2}}|_{t=1}=\\dfrac{1}{2e}$.\n접선: $y+2=\\dfrac{1}{2e}(x-e)\\Rightarrow y=-\\dfrac{5}{2}+\\dfrac{x}{2e}$."
  }),
  build({
    num: 6, subject: "다변수함수", unit: "편도함수", concept: "연쇄법칙", difficulty: "medium",
    question: "$z=x^3-\\dfrac{1}{2}x^2y,\\,x=\\dfrac{1}{3}s^2t^2,\\,y=s^2+st$일 때 $s=1,\\,t=-1$에서의 $\\dfrac{\\partial z}{\\partial s}$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$\\dfrac{1}{3}$"), o("3","$\\dfrac{1}{4}$"), o("4","$\\dfrac{1}{5}$"), o("5","$\\dfrac{1}{6}$")],
    answer: 5,
    explanation: "$s=1,t=-1$: $x=\\dfrac{1}{3},\\,y=0$.\n$z_x=3x^2-xy=\\dfrac{1}{3},\\,z_y=-\\dfrac{x^2}{2}=-\\dfrac{1}{18}$.\n$x_s=\\dfrac{2}{3}st^2=\\dfrac{2}{3},\\,y_s=2s+t=1$.\n$z_s=\\dfrac{1}{3}\\cdot\\dfrac{2}{3}+(-\\dfrac{1}{18})\\cdot 1=\\dfrac{2}{9}-\\dfrac{1}{18}=\\dfrac{3}{18}=\\dfrac{1}{6}$."
  }),
  build({
    num: 7, subject: "다변수함수", unit: "편도함수", concept: "최대 감소 방향", difficulty: "easy",
    question: "다변수함수 $f(x,y)=x^2+3y^4$가 점 $(1,1)$에서 가장 빠르게 감소하는 방향은?",
    options: [o("1","$(-1,-6)$"), o("2","$(1,-6)$"), o("3","$(0,0)$"), o("4","$(-1,6)$"), o("5","$(1,6)$")],
    answer: 1,
    explanation: "$\\nabla f=(2x,12y^3)|_{(1,1)}=(2,12)$.\n가장 빨리 감소 방향: $-\\nabla f\\parallel(-1,-6)$."
  }),
  build({
    num: 8, subject: "다변수함수", unit: "편도함수", concept: "2차 테일러 다항식", difficulty: "hard",
    question: "점 $(0,0)$에서 다변수함수 $f(x,y)=-(x+y)+\\ln(1+e^{x+y})$의 테일러 2차 근사다항식을 이용하여 $f(0,1)$의 근삿값은?",
    options: [o("1","$0$"), o("2","$-\\dfrac{3}{8}$"), o("3","$\\ln 2$"), o("4","$\\dfrac{3}{8}$"), o("5","$\\ln 2-\\dfrac{3}{8}$")],
    answer: 5,
    explanation: "$f(0,0)=\\ln 2$. $f_x=f_y=-1+\\dfrac{e^{x+y}}{1+e^{x+y}}$, $(0,0)$에서 $-\\dfrac{1}{2}$.\n$f_{xx}=f_{xy}=f_{yy}=\\dfrac{e^{x+y}}{(1+e^{x+y})^2}|_{(0,0)}=\\dfrac{1}{4}$.\n$P_2(x,y)=\\ln 2-\\dfrac{x+y}{2}+\\dfrac{(x+y)^2}{8}$.\n$P_2(0,1)=\\ln 2-\\dfrac{1}{2}+\\dfrac{1}{8}=\\ln 2-\\dfrac{3}{8}$."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "다변수함수의 극값", concept: "타원 조건부 극값", difficulty: "medium",
    question: "영역 $\\{(x,y):x^2+4y^2\\le 4\\}$ 위의 점 $(x,y)$에 대하여 함수 $f(x,y)=xy$의 최댓값과 최솟값의 곱은?",
    options: [o("1","$-4$"), o("2","$-1$"), o("3","$0$"), o("4","$1$"), o("5","$4$")],
    answer: 2,
    explanation: "매개변수화: $x=2\\cos\\theta,y=\\sin\\theta$. $xy=\\sin 2\\theta$. 최대 $1$, 최소 $-1$.\n내부 임계: $\\nabla f=(y,x)=0\\Rightarrow(0,0),\\,f=0$.\n$M=1,\\,m=-1$. $Mm=-1$."
  }),
  build({
    num: 10, subject: "적분학", unit: "급수", concept: "$\\ln(2-x)$ 멱급수", difficulty: "medium",
    question: "함수 $f(x)=\\ln(2-x)$를 멱급수로 나타내면?",
    options: [o("1","$-\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{x^n}{n2^{n+1}}+\\ln 2$"), o("2","$-\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{x^{n+1}}{(n+1)2^{n+1}}+\\ln 2$"), o("3","$-\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{x^n}{(n+1)2^{n+1}}+\\ln 2$"), o("4","$-\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{x^n}{n2^{n+2}}+\\ln 2$"), o("5","$-\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{x^{n+1}}{(n+1)2^n}+\\ln 2$")],
    answer: 2,
    explanation: "$\\ln(2-x)=\\ln 2+\\ln(1-x/2)=\\ln 2-\\sum_{n=1}^{\\infty}\\dfrac{(x/2)^n}{n}=\\ln 2-\\sum_{n=0}^{\\infty}\\dfrac{x^{n+1}}{(n+1)2^{n+1}}$."
  }),
  build({
    num: 11, subject: "적분학", unit: "급수", concept: "수렴반경(고차)", difficulty: "medium",
    question: "멱급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(x+2)^{4n}}{16^n}$의 수렴반경은?",
    options: [o("1","$1$"), o("2","$\\sqrt[4]{2}$"), o("3","$\\sqrt[3]{2}$"), o("4","$\\sqrt 2$"), o("5","$2$")],
    answer: 5,
    explanation: "$u=(x+2)^4$로 두면 $\\sum u^n/16^n$ 수렴 조건: $|u|<16\\Leftrightarrow|x+2|<2$.\n수렴반경 $2$."
  }),
  build({
    num: 12, subject: "적분학", unit: "급수", concept: "$\\ln$ 급수값 추정", difficulty: "medium",
    question: "급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\!-\\dfrac{(-\\ln 2)^n}{n}$의 값이 속하는 구간은?",
    options: [o("1","$(-2,-1)$"), o("2","$(-1,0)$"), o("3","$(0,1)$"), o("4","$(1,2)$"), o("5","$(2,3)$")],
    answer: 3,
    explanation: "$\\sum_{n=1}^{\\infty}\\dfrac{(-1)^{n+1}(\\ln 2)^n}{n}=\\ln(1+\\ln 2)$.\n$\\ln 2\\approx 0.693$, $\\ln(1.693)\\approx 0.527\\in(0,1)$."
  }),
  build({
    num: 13, subject: "적분학", unit: "부정적분", concept: "삼각함수·부분분수", difficulty: "medium",
    question: "$\\displaystyle\\int\\!\\left(2\\cos^2 x+\\dfrac{1}{x(x-1)}\\right)dx$의 부정적분은?",
    options: [o("1","$x+\\dfrac{\\sin 2x}{2}-\\ln|x|+\\ln|x-1|+C$"), o("2","$-x+\\dfrac{\\cos 2x}{2}-\\ln|x|+\\ln|x-1|+C$"), o("3","$x+\\dfrac{\\cos 2x}{2}-\\ln|x|+\\ln|x-1|+C$"), o("4","$x-\\dfrac{\\sin 2x}{2}-\\ln|x|+\\ln|x-1|+C$"), o("5","$x-\\dfrac{\\cos x}{3}-\\ln|x|+\\ln|x-1|+C$")],
    answer: 1,
    explanation: "$2\\cos^2 x=1+\\cos 2x$. $\\dfrac{1}{x(x-1)}=\\dfrac{1}{x-1}-\\dfrac{1}{x}$.\n적분: $x+\\dfrac{\\sin 2x}{2}+\\ln|x-1|-\\ln|x|+C$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "다중적분", concept: "적분순서 변경", difficulty: "easy",
    question: "$\\displaystyle\\int_0^{\\pi/2}\\!\\int_x^{\\pi/2}\\!\\dfrac{\\cos y}{y}\\,dy\\,dx$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$1$"), o("3","$\\dfrac{3}{2}$"), o("4","$\\dfrac{2}{3}$"), o("5","$\\dfrac{4}{5}$")],
    answer: 2,
    explanation: "적분순서 변경: $0\\le y\\le\\pi/2,\\,0\\le x\\le y$.\n$\\displaystyle\\!\\int_0^{\\pi/2}\\!\\int_0^y\\!\\dfrac{\\cos y}{y}\\,dx\\,dy=\\!\\int_0^{\\pi/2}\\!\\cos y\\,dy=\\sin(\\pi/2)=1$."
  }),
  build({
    num: 15, subject: "적분학", unit: "정적분의 응용", concept: "두 곡선 사이 넓이", difficulty: "easy",
    question: "두 곡선 $x=y^2+1,\\,x-y=3$에 의하여 둘러싸인 부분의 넓이는?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$\\dfrac{7}{3}$"), o("3","$\\dfrac{4}{3}$"), o("4","$\\dfrac{9}{2}$"), o("5","$\\dfrac{2}{5}$")],
    answer: 4,
    explanation: "교점: $y^2+1=y+3\\Rightarrow y^2-y-2=0\\Rightarrow y=-1,2$.\n$S=\\!\\int_{-1}^{2}(y+3-y^2-1)\\,dy=\\!\\left[\\dfrac{y^2}{2}+2y-\\dfrac{y^3}{3}\\right]_{-1}^{2}=\\dfrac{9}{2}$."
  }),
  build({
    num: 16, subject: "적분학", unit: "정적분의 응용", concept: "곡선의 길이", difficulty: "easy",
    question: "곡선 $y=\\dfrac{1}{2}+\\dfrac{2}{3}x^{3/2}$ ($1\\le x\\le 2$)의 길이는?",
    options: [o("1","$\\dfrac{1}{27}(3^{1/2}-2^{1/2})$"), o("2","$\\dfrac{1}{9}(3^{1/3}-2^{1/3})$"), o("3","$\\dfrac{1}{9}(3^{5/2}-2^{5/2})$"), o("4","$\\dfrac{2}{3}(3^{1/2}-2^{1/2})$"), o("5","$\\dfrac{2}{3}(3^{3/2}-2^{3/2})$")],
    answer: 5,
    explanation: "$y'=x^{1/2}=\\sqrt x$. $1+(y')^2=1+x$.\n$L=\\!\\int_1^2\\sqrt{1+x}\\,dx=\\dfrac{2}{3}[(1+x)^{3/2}]_1^2=\\dfrac{2}{3}(3^{3/2}-2^{3/2})$."
  }),
  build({
    num: 17, subject: "다변수함수", unit: "다중적분", concept: "삼각형 영역 적분", difficulty: "easy",
    question: "영역 $R=\\{(x,y):0<x<y<1\\}$에서 함수 $f(x,y)=8xy$의 이중적분의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$"), o("5","$4$")],
    answer: 2,
    explanation: "$\\!\\int_0^1\\!\\int_0^y 8xy\\,dx\\,dy=\\!\\int_0^1 4y\\cdot y^2\\,dy=\\!\\int_0^1 4y^3\\,dy=1$."
  }),
  build({
    num: 18, subject: "다변수함수", unit: "벡터해석", concept: "보존벡터장 선적분", difficulty: "easy",
    question: "시작점이 원점이고 끝점이 $(3,2,1)$인 선분을 따라서 포텐셜 함수 $f(x,y,z)=x+yz$에 대응되는 벡터장을 선적분한 값은?",
    options: [o("1","$0$"), o("2","$3$"), o("3","$5$"), o("4","$6$"), o("5","$10$")],
    answer: 3,
    explanation: "보존벡터장. $\\!\\int_C\\nabla f\\cdot d\\mathbf r=f(3,2,1)-f(0,0,0)=(3+2)-0=5$."
  }),
  build({
    num: 19, subject: "다변수함수", unit: "벡터해석", concept: "발산정리(0 회전 발산)", difficulty: "medium",
    question: "구 $S$가 $x^2+y^2+z^2=1$이고 $S$의 표면 바깥으로 흐르는 유량이 $\\mathbf F=\\langle 2^y,xz,xy^3\\rangle$일 때, 면적분 $\\displaystyle\\iint_S\\!\\mathbf F\\cdot d\\mathbf S$의 값은?",
    options: [o("1","$0$"), o("2","$\\dfrac{\\sqrt 3}{4}\\pi$"), o("3","$\\dfrac{\\sqrt 3}{2}\\pi$"), o("4","$\\sqrt 3\\pi$"), o("5","$2\\sqrt 3\\pi$")],
    answer: 1,
    explanation: "$\\text{div}\\,\\mathbf F=\\dfrac{\\partial}{\\partial x}(2^y)+\\dfrac{\\partial}{\\partial y}(xz)+\\dfrac{\\partial}{\\partial z}(xy^3)=0+0+0=0$.\n발산정리: $\\!\\iint_S\\mathbf F\\cdot d\\mathbf S=\\!\\iiint_V 0\\,dV=0$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "다중적분", concept: "원판 적분", difficulty: "easy",
    question: "중심이 $(0,0)$이고 반지름이 $1$인 원으로 둘러싸인 영역을 $A$라 하자. 적분 $\\displaystyle\\iint_A(x^2+4y^2)\\,dxdy$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{4}$"), o("2","$\\dfrac{\\pi}{2}$"), o("3","$\\dfrac{3}{4}\\pi$"), o("4","$\\pi$"), o("5","$\\dfrac{5}{4}\\pi$")],
    answer: 5,
    explanation: "대칭성으로 $\\!\\iint x^2 dA=\\!\\iint y^2 dA=\\dfrac{1}{2}\\!\\iint(x^2+y^2)dA=\\dfrac{1}{2}\\cdot 2\\pi\\cdot\\dfrac{1}{4}=\\dfrac{\\pi}{4}$.\n$\\!\\iint(x^2+4y^2)dA=\\dfrac{\\pi}{4}+4\\cdot\\dfrac{\\pi}{4}=\\dfrac{5\\pi}{4}$."
  })
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (2023 숙명여대):`, data.map((d) => d.id).join(", "));
