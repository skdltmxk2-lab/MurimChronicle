// Upload 2019년도 명지대 편입수학 기출 25문항
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

const SCHOOL = "명지대";
const YEAR = "2019";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-mju-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "지배항 극한", difficulty: "easy",
    question: "$\\displaystyle\\lim_{n\\to\\infty}\\!\\sqrt[n]{2^n+3^n}$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 3,
    explanation: "$\\sqrt[n]{2^n+3^n}=3\\!\\sqrt[n]{(2/3)^n+1}\\to 3\\cdot 1=3$ ($(2/3)^n\\to 0$).\n지수가 큰 항이 지배하므로 결과 $=\\max(2,3)=3$."
  }),
  build({
    num: 2, subject: "미분학", unit: "도함수", concept: "역함수의 도함수", difficulty: "easy",
    question: "함수 $f$와 그 역함수 $f^{-1}$가 모두 미분가능하고 $f(0)=3$, $(f^{-1})'(3)=\\dfrac{1}{2}$일 때 $f'(0)$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 2,
    explanation: "$(f^{-1})'(y)=\\dfrac{1}{f'(x)}$이고 $y=3$일 때 $x=0$.\n$(f^{-1})'(3)=\\dfrac{1}{f'(0)}=\\dfrac{1}{2}\\Rightarrow f'(0)=2$."
  }),
  build({
    num: 3, subject: "적분학", unit: "급수", concept: "멱급수 수렴반지름", difficulty: "easy",
    question: "멱급수 $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(n!)^2}{(2n)!}x^n$의 수렴반지름은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 4,
    explanation: "비율판정: $\\left|\\dfrac{a_{n+1}}{a_n}\\right|=\\dfrac{((n+1)!)^2(2n)!}{(2n+2)!(n!)^2}=\\dfrac{(n+1)^2}{(2n+1)(2n+2)}=\\dfrac{n+1}{2(2n+1)}\\to\\dfrac{1}{4}$.\n수렴반지름 $R=4$."
  }),
  build({
    num: 4, subject: "미분학", unit: "극한과 연속", concept: "지수꼴 극한($\\infty^0$)", difficulty: "easy",
    question: "$\\displaystyle\\lim_{x\\to\\infty}x^{1/(3+\\ln x)}$의 값은?",
    options: [o("1","$e^{-2}$"), o("2","$e^{-1}$"), o("3","$1$"), o("4","$e$"), o("5","$e^2$")],
    answer: 4,
    explanation: "$x^{1/(3+\\ln x)}=e^{\\ln x/(3+\\ln x)}$. $\\displaystyle\\lim_{x\\to\\infty}\\dfrac{\\ln x}{3+\\ln x}=1$.\n극한 $=e^1=e$."
  }),
  build({
    num: 5, subject: "다변수함수", unit: "편도함수", concept: "합성함수 미분 (연쇄법칙)", difficulty: "easy",
    question: "미분가능한 이변수함수 $f(x,y)$와 미분가능한 함수 $g(t),\\,h(t)$가 (가) $f_x(3,1)=2,\\,f_y(3,1)=1$, (나) $g(2)=3,\\,g'(2)=-1,\\,h(2)=1,\\,h'(2)=5$를 만족한다. $p(t)=f(g(t),h(t))$일 때 $p'(2)$의 값은?",
    options: [o("1","$-3$"), o("2","$-1$"), o("3","$0$"), o("4","$1$"), o("5","$3$")],
    answer: 5,
    explanation: "$p'(t)=f_x(g(t),h(t))g'(t)+f_y(g(t),h(t))h'(t)$.\n$p'(2)=f_x(3,1)\\cdot g'(2)+f_y(3,1)\\cdot h'(2)=2\\cdot(-1)+1\\cdot 5=3$."
  }),
  build({
    num: 6, subject: "미분학", unit: "도함수", concept: "매개변수 2계 미분", difficulty: "easy",
    question: "매개곡선 $x=t^2+1,\\,y=t^2+t$ 위의 점 $(5,6)$에서 $\\dfrac{d^2y}{dx^2}$의 값은?",
    options: [o("1","$-\\dfrac{1}{16}$"), o("2","$-\\dfrac{1}{32}$"), o("3","$0$"), o("4","$\\dfrac{1}{32}$"), o("5","$\\dfrac{1}{16}$")],
    answer: 2,
    explanation: "$(5,6)$에서 $t^2+1=5\\Rightarrow t=2$ (확인: $y=4+2=6$ ✓).\n$\\dfrac{dy}{dx}=\\dfrac{2t+1}{2t}$. $\\dfrac{d^2y}{dx^2}=\\dfrac{d}{dt}\\!\\left(\\dfrac{2t+1}{2t}\\right)\\cdot\\dfrac{dt}{dx}=\\dfrac{-1}{2t^2}\\cdot\\dfrac{1}{2t}=-\\dfrac{1}{4t^3}$.\n$t=2$ 대입: $-\\dfrac{1}{32}$."
  }),
  build({
    num: 7, subject: "적분학", unit: "정적분", concept: "유리함수 적분(부분분수)", difficulty: "easy",
    question: "$\\displaystyle\\int_1^2\\!\\dfrac{x^2+1}{3x-x^2}\\,dx=a+b\\ln 2$일 때 $a+b$의 값은? (단, $a,b$는 유리수)",
    options: [o("1","$\\dfrac{4}{3}$"), o("2","$2$"), o("3","$\\dfrac{8}{3}$"), o("4","$\\dfrac{10}{3}$"), o("5","$4$")],
    answer: 3,
    explanation: "다항식 나눗셈: $\\dfrac{x^2+1}{3x-x^2}=-1+\\dfrac{3x+1}{x(3-x)}$.\n부분분수: $\\dfrac{3x+1}{x(3-x)}=\\dfrac{1/3}{x}+\\dfrac{10/3}{3-x}$.\n$\\!\\int\\!=-x+\\dfrac{1}{3}\\ln|x|-\\dfrac{10}{3}\\ln|3-x|+C$.\n$\\!\\int_1^2=-1+\\dfrac{1}{3}\\ln 2+\\dfrac{10}{3}\\ln 2=-1+\\dfrac{11}{3}\\ln 2$.\n$a=-1,\\,b=\\dfrac{11}{3}$, $a+b=\\dfrac{8}{3}$."
  }),
  build({
    num: 8, subject: "선형대수", unit: "벡터", concept: "두 평면 교선의 방향벡터(외적)", difficulty: "easy",
    question: "좌표공간에서 두 평면 $3x-2y+z=1,\\,2x+y+7z=9$의 교선의 방향벡터를 $\\langle a,b,c\\rangle$라 할 때 $\\dfrac{a}{b}$의 값은?",
    options: [o("1","$\\dfrac{11}{19}$"), o("2","$\\dfrac{13}{19}$"), o("3","$\\dfrac{15}{19}$"), o("4","$\\dfrac{17}{19}$"), o("5","$1$")],
    answer: 3,
    explanation: "법선벡터 $(3,-2,1)$, $(2,1,7)$. 교선 방향 $=$ 외적.\n$(3,-2,1)\\times(2,1,7)=((-2)(7)-(1)(1),\\,(1)(2)-(3)(7),\\,(3)(1)-(-2)(2))=(-15,-19,7)$.\n$\\dfrac{a}{b}=\\dfrac{-15}{-19}=\\dfrac{15}{19}$."
  }),
  build({
    num: 9, subject: "적분학", unit: "특이적분", concept: "치환($\\sqrt{x}=t$)·$\\arctan$", difficulty: "medium",
    question: "$\\displaystyle\\int_1^{\\infty}\\!\\dfrac{dx}{\\sqrt x(1+x)}$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{6}$"), o("2","$\\dfrac{\\pi}{4}$"), o("3","$\\dfrac{\\pi}{3}$"), o("4","$\\dfrac{\\pi}{2}$"), o("5","$\\pi$")],
    answer: 4,
    explanation: "$\\sqrt x=t$ 치환: $x=t^2,\\,dx=2t\\,dt$. 구간 $t:1\\to\\infty$.\n$\\displaystyle\\int_1^{\\infty}\\!\\dfrac{2t}{t(1+t^2)}\\,dt=2\\!\\int_1^{\\infty}\\!\\dfrac{dt}{1+t^2}=2[\\tan^{-1}t]_1^{\\infty}=2\\!\\left(\\dfrac{\\pi}{2}-\\dfrac{\\pi}{4}\\right)=\\dfrac{\\pi}{2}$."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "공간곡선", concept: "접선벡터·축과의 각", difficulty: "medium",
    question: "벡터함수 $\\mathbf r(t)=\\langle e^{-t}\\cos t,\\,e^{-t}\\sin t,\\,e^{-t}\\rangle$에 대하여 $t=0$일 때의 접선벡터가 $x$축의 양의 방향과 이루는 각을 $\\theta$라 하자. $\\cos\\theta$의 값은?",
    options: [o("1","$-\\dfrac{\\sqrt 3}{3}$"), o("2","$-\\dfrac{\\sqrt 2}{3}$"), o("3","$0$"), o("4","$\\dfrac{\\sqrt 2}{3}$"), o("5","$\\dfrac{\\sqrt 3}{3}$")],
    answer: 1,
    explanation: "$\\mathbf r'(t)=\\langle -e^{-t}\\cos t-e^{-t}\\sin t,\\,-e^{-t}\\sin t+e^{-t}\\cos t,\\,-e^{-t}\\rangle$.\n$\\mathbf r'(0)=\\langle-1,1,-1\\rangle$, $|\\mathbf r'(0)|=\\sqrt 3$.\n$\\cos\\theta=\\dfrac{\\mathbf r'(0)\\cdot(1,0,0)}{|\\mathbf r'(0)|}=\\dfrac{-1}{\\sqrt 3}=-\\dfrac{\\sqrt 3}{3}$."
  }),
  build({
    num: 11, subject: "다변수함수", unit: "다중적분", concept: "극좌표 두 원 공통영역", difficulty: "medium",
    question: "극방정식 $r=4\\cos\\theta,\\,r=4\\sin\\theta$로 주어진 두 곡선에 의해 둘러싸인 공통부분의 넓이는?",
    options: [o("1","$2\\pi-5$"), o("2","$2\\pi-4$"), o("3","$2\\pi-3$"), o("4","$2\\pi-2$"), o("5","$2\\pi-1$")],
    answer: 2,
    explanation: "교점: $4\\cos\\theta=4\\sin\\theta\\Rightarrow\\theta=\\pi/4$.\n대칭으로 $S=2\\cdot\\dfrac{1}{2}\\!\\int_0^{\\pi/4}(4\\sin\\theta)^2 d\\theta=16\\!\\int_0^{\\pi/4}\\sin^2\\theta\\,d\\theta=8\\!\\int_0^{\\pi/4}(1-\\cos 2\\theta)d\\theta$\n$=8\\!\\left[\\theta-\\dfrac{\\sin 2\\theta}{2}\\right]_0^{\\pi/4}=8\\!\\left(\\dfrac{\\pi}{4}-\\dfrac{1}{2}\\right)=2\\pi-4$."
  }),
  build({
    num: 12, subject: "미분학", unit: "도함수", concept: "관련 변화율", difficulty: "medium",
    question: "좌표평면의 점 $P(x,y)$가 원점을 출발하여 곡선 $y=2\\sin(\\pi x)$ ($x\\ge 0$)을 따라 움직이고 $x$는 $\\sqrt 7\\,\\text{cm/s}$의 속력으로 일정하게 움직인다. $x=\\dfrac{1}{3}$일 때 원점에서 $P$까지의 거리의 변화율은? (단, 단위는 $\\text{cm/s}$)",
    options: [o("1","$\\dfrac{1+3\\sqrt 3\\pi}{5}$"), o("2","$\\dfrac{1+3\\sqrt 3\\pi}{4}$"), o("3","$\\dfrac{1+3\\sqrt 3\\pi}{3}$"), o("4","$\\dfrac{1+3\\sqrt 3\\pi}{2}$"), o("5","$1+3\\sqrt 3\\pi$")],
    answer: 4,
    explanation: "$L=\\sqrt{x^2+y^2}=\\sqrt{x^2+4\\sin^2(\\pi x)}$. $x=\\dfrac{1}{3}$에서 $y=\\sqrt 3$, $L=\\dfrac{2\\sqrt 7}{3}$.\n$\\dfrac{dL}{dt}=\\dfrac{x\\,dx/dt+y\\,dy/dt}{L}$. $\\dfrac{dy}{dt}=2\\pi\\cos(\\pi x)\\cdot\\dfrac{dx}{dt}=2\\pi\\cdot\\dfrac{1}{2}\\cdot\\sqrt 7=\\pi\\sqrt 7$.\n분자 $=\\dfrac{\\sqrt 7}{3}+\\sqrt 3\\cdot\\pi\\sqrt 7=\\sqrt 7\\!\\left(\\dfrac{1}{3}+\\pi\\sqrt 3\\right)$.\n$\\dfrac{dL}{dt}=\\dfrac{\\sqrt 7(1/3+\\pi\\sqrt 3)}{2\\sqrt 7/3}=\\dfrac{1+3\\sqrt 3\\pi}{2}$."
  }),
  build({
    num: 13, subject: "선형대수", unit: "벡터", concept: "내적·외적·크기 성질", difficulty: "medium",
    question: "영벡터가 아닌 3차원 벡터 $\\vec a,\\vec b,\\vec c$에 대하여 다음 중 옳은 것은?\n\n(1) $\\vec a\\cdot\\vec b=\\vec a\\cdot\\vec c$이면 $\\vec b=\\vec c$이다.\n(2) $\\vec a\\times\\vec b=\\vec a\\times\\vec c$이면 $\\vec b=\\vec c$이다.\n(3) $(\\vec a\\times\\vec b)\\times\\vec c=\\vec a\\times(\\vec b\\times\\vec c)$이다.\n(4) $|\\vec a|=|\\vec b|$이면 $\\vec a=\\vec b$ 또는 $\\vec a=-\\vec b$이다.\n(5) $\\vec a+\\vec b$와 $\\vec a-\\vec b$가 직교하면 $|\\vec a|=|\\vec b|$이다.",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)"), o("5","(5)")],
    answer: 5,
    explanation: "(1) $\\vec a\\perp(\\vec b-\\vec c)$인 경우도 성립. 거짓.\n(2) $\\vec a\\parallel(\\vec b-\\vec c)$인 경우도 성립. 거짓.\n(3) 외적은 결합법칙이 성립하지 않음. 거짓.\n(4) 크기 같다고 같은 방향이거나 반대 방향일 필요 없음. 거짓.\n(5) $(\\vec a+\\vec b)\\cdot(\\vec a-\\vec b)=|\\vec a|^2-|\\vec b|^2=0\\Rightarrow|\\vec a|=|\\vec b|$. 참."
  }),
  build({
    num: 14, subject: "적분학", unit: "정적분의 응용", concept: "심장형 곡선의 길이", difficulty: "medium",
    question: "극방정식 $r=2(1-\\cos\\theta)$로 주어진 곡선의 길이는?",
    options: [o("1","$8$"), o("2","$10$"), o("3","$12$"), o("4","$14$"), o("5","$16$")],
    answer: 5,
    explanation: "심장형 $r=a(1\\pm\\cos\\theta)$의 전체 길이 $=8a$.\n$a=2$이므로 $L=16$."
  }),
  build({
    num: 15, subject: "적분학", unit: "급수", concept: "p-급수 수렴 조건", difficulty: "medium",
    question: "급수 $\\displaystyle\\sum_{n=0}^{\\infty}(n+1)^{\\ln\\sqrt a}$이 수렴하는 실수 $a$의 범위는?",
    options: [o("1","$0<a<\\dfrac{1}{e^2}$"), o("2","$\\dfrac{1}{e^2}<a<\\dfrac{1}{e}$"), o("3","$\\dfrac{1}{e}<a<\\dfrac{1}{\\sqrt e}$"), o("4","$\\dfrac{1}{\\sqrt e}<a<\\dfrac{1}{\\sqrt[4]{e}}$"), o("5","$\\dfrac{1}{\\sqrt[4]{e}}<a<1$")],
    answer: 1,
    explanation: "$(n+1)^{\\ln\\sqrt a}=\\dfrac{1}{(n+1)^{-\\ln\\sqrt a}}$. p-급수 수렴 조건: $-\\ln\\sqrt a>1\\Leftrightarrow\\ln\\sqrt a<-1\\Leftrightarrow\\dfrac{\\ln a}{2}<-1\\Leftrightarrow\\ln a<-2\\Leftrightarrow a<e^{-2}$.\n$a>0$이므로 $0<a<\\dfrac{1}{e^2}$."
  }),
  build({
    num: 16, subject: "적분학", unit: "정적분의 응용", concept: "영역 이등분 조건", difficulty: "medium",
    question: "곡선 $y=\\dfrac{1}{x^2}$과 $x$축 및 두 직선 $x=1,\\,x=9$로 둘러싸인 영역을 $R$이라 하자. 직선 $y=a$에 의해 영역 $R$이 이등분될 때 상수 $a$의 값은?",
    options: [o("1","$\\dfrac{1}{6}$"), o("2","$\\dfrac{1}{7}$"), o("3","$\\dfrac{1}{8}$"), o("4","$\\dfrac{1}{9}$"), o("5","$\\dfrac{1}{10}$")],
    answer: 4,
    explanation: "$R$ 넓이 $=\\!\\int_1^9\\dfrac{dx}{x^2}=\\!\\left[-\\dfrac{1}{x}\\right]_1^9=\\dfrac{8}{9}$. 이등분 $=\\dfrac{4}{9}$.\n곡선 위쪽 영역 ($y\\ge a$): $\\!\\int_a^1(1/\\sqrt y-1)\\,dy+$ (사각형 부분 보정).\n$2\\sqrt a-a=\\dfrac{5}{9}$. 객관식 대입: $a=\\dfrac{1}{9}\\Rightarrow\\dfrac{2}{3}-\\dfrac{1}{9}=\\dfrac{5}{9}$ ✓."
  }),
  build({
    num: 17, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피 비율", difficulty: "medium",
    question: "곡선 $y=2x-x^2$과 $x$축으로 둘러싸인 영역을 $x$축과 $y$축 둘레로 각각 회전시킬 때 생기는 입체의 부피는 $V_x,\\,V_y$라 하자. $\\dfrac{V_x}{V_y}$의 값은?",
    options: [o("1","$\\dfrac{1}{5}$"), o("2","$\\dfrac{2}{5}$"), o("3","$\\dfrac{3}{5}$"), o("4","$\\dfrac{4}{5}$"), o("5","$1$")],
    answer: 2,
    explanation: "교점 $0,2$.\n$V_x=\\pi\\!\\int_0^2(2x-x^2)^2 dx=\\pi\\!\\left[\\dfrac{x^5}{5}-x^4+\\dfrac{4x^3}{3}\\right]_0^2=\\dfrac{16\\pi}{15}$.\n$V_y=2\\pi\\!\\int_0^2 x(2x-x^2)dx=2\\pi\\!\\int_0^2(2x^2-x^3)dx=\\dfrac{8\\pi}{3}$.\n$\\dfrac{V_x}{V_y}=\\dfrac{16/15}{8/3}=\\dfrac{2}{5}$."
  }),
  build({
    num: 18, subject: "다변수함수", unit: "다변수함수의 극값", concept: "산술기하 부등식 응용", difficulty: "hard",
    question: "영역 $D:x^2+y^2\\le 8$에서 정의된 이변수함수 $f(x,y)=e^{xy}$의 최댓값을 $M$, 최솟값을 $m$이라 할 때 $\\ln\\dfrac{M}{m}$의 값은?",
    options: [o("1","$4$"), o("2","$5$"), o("3","$6$"), o("4","$7$"), o("5","$8$")],
    answer: 5,
    explanation: "$e^{xy}$ 단조증가이므로 $g(x,y)=xy$의 최대·최소를 구함.\n내부 임계: $g_x=y=0,\\,g_y=x=0\\Rightarrow(0,0),\\,g=0$.\n경계 $x^2+y^2=8$: 산술기하 $\\dfrac{x^2+y^2}{2}\\ge|xy|\\Rightarrow 4\\ge|xy|$.\n$-4\\le xy\\le 4\\Rightarrow M=e^4,\\,m=e^{-4}$.\n$\\ln\\dfrac{M}{m}=\\ln e^8=8$."
  }),
  build({
    num: 19, subject: "적분학", unit: "정적분", concept: "변수상한 미분(2회)", difficulty: "hard",
    question: "$f(1)=-1$이고 도함수 $f'$가 연속인 함수 $f$에 대하여 $\\displaystyle\\int_{1/2}^{1}\\!f'(x)\\,dx=5$이다. 함수 $g(x)=\\displaystyle\\int_0^{x}\\!\\left(\\int_0^{\\cos t}\\!f(u)\\,du\\right)dt$일 때 $g''\\!\\left(\\dfrac{\\pi}{3}\\right)$의 값은?",
    options: [o("1","$3\\sqrt 3$"), o("2","$3$"), o("3","$\\sqrt 3$"), o("4","$1$"), o("5","$\\dfrac{\\sqrt 3}{3}$")],
    answer: 1,
    explanation: "$g'(x)=\\!\\int_0^{\\cos x}\\!f(u)\\,du$.\n$g''(x)=f(\\cos x)\\cdot(-\\sin x)$.\n$x=\\pi/3$: $g''(\\pi/3)=f(1/2)\\cdot(-\\sqrt 3/2)$.\n$\\!\\int_{1/2}^1 f'(x)dx=f(1)-f(1/2)=5\\Rightarrow-1-f(1/2)=5\\Rightarrow f(1/2)=-6$.\n$g''(\\pi/3)=(-6)\\cdot(-\\sqrt 3/2)=3\\sqrt 3$."
  }),
  build({
    num: 20, subject: "적분학", unit: "급수", concept: "기하급수 2계 미분", difficulty: "hard",
    question: "기하급수 $\\displaystyle\\sum_{n=0}^{\\infty}x^n=\\dfrac{1}{1-x}$ ($|x|<1$)을 이용할 때 $\\displaystyle\\sum_{n=2}^{\\infty}n(n-1)\\!\\left(\\dfrac{1}{3}\\right)^{\\!n-2}$의 값은?",
    options: [o("1","$6$"), o("2","$\\dfrac{25}{4}$"), o("3","$\\dfrac{13}{2}$"), o("4","$\\dfrac{27}{4}$"), o("5","$7$")],
    answer: 4,
    explanation: "$\\dfrac{d^2}{dx^2}\\!\\left(\\dfrac{1}{1-x}\\right)=\\dfrac{2}{(1-x)^3}=\\sum_{n=2}^{\\infty}n(n-1)x^{n-2}$.\n$x=1/3$: $\\dfrac{2}{(2/3)^3}=\\dfrac{2}{8/27}=\\dfrac{27}{4}$."
  }),
  build({
    num: 21, subject: "적분학", unit: "급수", concept: "$\\sum n^2 x^n$", difficulty: "hard",
    question: "$\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n^2}{3^n}$의 값은?",
    options: [o("1","$\\dfrac{5}{4}$"), o("2","$\\dfrac{3}{2}$"), o("3","$\\dfrac{7}{4}$"), o("4","$2$"), o("5","$\\dfrac{9}{4}$")],
    answer: 2,
    explanation: "공식 $\\displaystyle\\sum_{n=1}^{\\infty}n^2 x^n=\\dfrac{x(1+x)}{(1-x)^3}$.\n$x=\\dfrac{1}{3}$: $\\dfrac{(1/3)(4/3)}{(2/3)^3}=\\dfrac{4/9}{8/27}=\\dfrac{3}{2}$."
  }),
  build({
    num: 22, subject: "다변수함수", unit: "다중적분", concept: "포물면 부피(극좌표)", difficulty: "hard",
    question: "좌표공간에서 평면 $x=0$과 포물면 $x=1-y^2-z^2$으로 둘러싸인 입체의 부피는?",
    options: [o("1","$\\dfrac{\\pi}{2}$"), o("2","$\\pi$"), o("3","$\\dfrac{3\\pi}{2}$"), o("4","$2\\pi$"), o("5","$\\dfrac{5\\pi}{2}$")],
    answer: 1,
    explanation: "$V=\\!\\iint_{y^2+z^2\\le 1}(1-y^2-z^2)dA$. 극좌표 ($y=r\\cos\\theta,\\,z=r\\sin\\theta$):\n$=\\!\\int_0^{2\\pi}\\!\\int_0^1(1-r^2)r\\,dr\\,d\\theta=2\\pi\\!\\left[\\dfrac{r^2}{2}-\\dfrac{r^4}{4}\\right]_0^1=2\\pi\\cdot\\dfrac{1}{4}=\\dfrac{\\pi}{2}$."
  }),
  build({
    num: 23, subject: "적분학", unit: "정적분의 응용", concept: "회전곡면 넓이($y$축)", difficulty: "hard",
    question: "곡선 $y=\\dfrac{1}{4}x^2-\\dfrac{1}{2}\\ln x$ ($1\\le x\\le 2$)를 $y$축 둘레로 회전시킬 때 생기는 곡면의 넓이는?",
    options: [o("1","$2\\pi$"), o("2","$\\dfrac{7\\pi}{3}$"), o("3","$\\dfrac{8\\pi}{3}$"), o("4","$3\\pi$"), o("5","$\\dfrac{10\\pi}{3}$")],
    answer: 5,
    explanation: "$y'=\\dfrac{x}{2}-\\dfrac{1}{2x}$. $1+(y')^2=\\!\\left(\\dfrac{x}{2}+\\dfrac{1}{2x}\\right)^{\\!2}$, $\\sqrt{1+(y')^2}=\\dfrac{x}{2}+\\dfrac{1}{2x}$.\n$\\displaystyle S=2\\pi\\!\\int_1^2\\!x\\!\\left(\\dfrac{x}{2}+\\dfrac{1}{2x}\\right)dx=\\pi\\!\\int_1^2(x^2+1)\\,dx=\\pi\\!\\left[\\dfrac{x^3}{3}+x\\right]_1^2=\\pi\\!\\left(\\dfrac{7}{3}+1\\right)=\\dfrac{10\\pi}{3}$."
  }),
  build({
    num: 24, subject: "적분학", unit: "급수", concept: "수렴 판정(절대/조건부/발산)", difficulty: "hard",
    question: "다음 보기에서 절대수렴하는 급수의 개수를 $a$, 조건부수렴하는 급수의 개수를 $b$, 발산하는 급수의 개수를 $c$라 할 때 $a+b-c$의 값은?\n\n(가) $\\displaystyle\\sum_{n=1}^{\\infty}(-1)^n\\dfrac{\\ln n}{\\sqrt n}$  (나) $\\displaystyle\\sum_{n=1}^{\\infty}\\tan\\dfrac{1}{n}$  (다) $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{\\sqrt[3]{n}-1}{n(\\sqrt n+1)}$  (라) $\\displaystyle\\sum_{n=1}^{\\infty}(-1)^n\\dfrac{(2n+1)^n}{n^{2n}}$  (마) $\\displaystyle\\sum_{n=1}^{\\infty}(-1)^n\\dfrac{10^n n^2}{n!}$",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 3,
    explanation: "(가) $\\sum|\\cdot|=\\sum\\ln n/\\sqrt n$ 발산, $\\lim\\ln n/\\sqrt n=0$ → 조건부 수렴.\n(나) 극한비교 $\\tan(1/n)\\sim 1/n$, $\\sum 1/n$ 발산 → 발산.\n(다) $\\dfrac{n^{1/3}}{n^{3/2}}=\\dfrac{1}{n^{7/6}}$, $p>1$ → 절대수렴.\n(라) 근판정 $|a_n|^{1/n}=(2n+1)/n^2\\to 0$ → 절대수렴.\n(마) 비율판정 $|a_{n+1}/a_n|=10(n+1)/n^2\\to 0$ → 절대수렴.\n$a=3,\\,b=1,\\,c=1$. $a+b-c=3$."
  }),
  build({
    num: 25, subject: "다변수함수", unit: "다중적분", concept: "야코비안 변환(사다리꼴)", difficulty: "hard",
    question: "좌표평면에서 네 점 $(1,0),(2,0),(0,-2),(0,-1)$을 꼭짓점으로 하는 사다리꼴 영역을 $R$이라 할 때 $\\displaystyle\\iint_R\\!2\\cos\\!\\left(\\dfrac{y+x}{y-x}\\right)dA$의 값은?",
    options: [o("1","$\\sin 1$"), o("2","$\\cos 1$"), o("3","$3\\sin 1$"), o("4","$3\\cos 1$"), o("5","$5\\sin 1$")],
    answer: 3,
    explanation: "$u=x+y,\\,v=y-x$ 치환. 꼭짓점 대응:\n$(1,0)\\to(1,-1),\\,(2,0)\\to(2,-2),\\,(0,-2)\\to(-2,-2),\\,(0,-1)\\to(-1,-1)$.\n$|J|=2$이므로 $dxdy=\\dfrac{1}{2}dudv$. 영역: $-2\\le v\\le-1,\\,v\\le u\\le-v$.\n$\\displaystyle\\!\\iint 2\\cos(u/v)\\cdot\\dfrac{1}{2}\\,du\\,dv=\\!\\int_{-2}^{-1}\\!\\int_v^{-v}\\!\\cos(u/v)\\,du\\,dv$\n내부: $[v\\sin(u/v)]_v^{-v}=v(\\sin(-1)-\\sin 1)=-2v\\sin 1$.\n$\\displaystyle\\!\\int_{-2}^{-1}\\!-2v\\sin 1\\,dv=-2\\sin 1\\cdot\\dfrac{v^2}{2}\\bigg|_{-2}^{-1}=-\\sin 1\\cdot(1-4)=3\\sin 1$."
  })
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (2019 명지대):`, data.map((d) => d.id).join(", "));
