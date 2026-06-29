// Upload 2021년도 홍익대 편입수학 기출 15문항 (4지 선다, 70분)
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
const YEAR = "2021";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-hongik-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "$1^\\infty$ 극한", difficulty: "easy",
    question: "극한 $\\!\\displaystyle\\lim_{x\\to 0}(1-\\sin x)^{1/x}$을 구하시오.",
    options: [o("1","$0$"), o("2","$1$"), o("3","$e$"), o("4","$\\dfrac{1}{e}$")],
    answer: 4,
    explanation: "$\\!\\lim(1+(-\\sin x))^{1/(-\\sin x)\\cdot(-\\sin x)/x}=e^{-1}$ ($\\!\\lim\\sin x/x=1$)."
  }),
  build({
    num: 2, subject: "다변수함수", unit: "중적분", concept: "무게중심(균일판)", difficulty: "easy",
    question: "다음과 같은 밀도가 균일한 얇은 판이 있다 (꼭짓점 $(0,0),(1,0),(1,1),(3,1),(3,2),(0,2)$ 형태의 L자 모양). 이 판의 무게중심의 $y$좌표를 구하시오.",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$\\dfrac{2}{3}$"), o("3","$\\dfrac{3}{4}$"), o("4","$\\dfrac{4}{5}$")],
    answer: 3,
    explanation: "면적 $=4$. $\\!\\iint y\\,dA=\\!\\int_0^1\\!\\!\\int_0^3 y\\,dx\\,dy+\\!\\int_1^2\\!\\!\\int_0^1 y\\,dx\\,dy=\\dfrac{3}{2}+\\dfrac{3}{2}=3$.\n$\\bar y=\\dfrac{3}{4}$."
  }),
  build({
    num: 3, subject: "다변수함수", unit: "공간곡선", concept: "곡면 위 곡선·길이(스프링)", difficulty: "medium",
    question: "공간곡선 $(x,y,z)=(\\cos t,\\sin t,t),\\,0\\le t\\le 2\\pi$는 식 (가)로 주어진 곡면 위의 곡선이며 이 곡선의 길이는 (나)이다. (가), (나)를 구하시오.",
    options: [
      o("1","$x^2+y^2=z^2,\\;2\\pi$"),
      o("2","$x^2+y^2=1,\\;2\\pi$"),
      o("3","$x^2+y^2=z^2,\\;2\\sqrt 2\\pi$"),
      o("4","$x^2+y^2=1,\\;2\\sqrt 2\\pi$")
    ],
    answer: 4,
    explanation: "$\\cos^2 t+\\sin^2 t=1$ ⇒ 원기둥 $x^2+y^2=1$.\n$L=\\!\\int_0^{2\\pi}\\sqrt{\\sin^2 t+\\cos^2 t+1}dt=2\\sqrt 2\\pi$."
  }),
  build({
    num: 4, subject: "미분학", unit: "도함수", concept: "관련 변화율(포물선 용기)", difficulty: "medium",
    question: "포물선 $y=x^2$을 $y$축을 중심으로 회전시킨 형태의 용기에 $3\\text{m}^3/\\text{sec}$로 매초 일정한 양의 물을 채울 때 수면의 상승속도를 생각하자. 용기의 바닥에서부터 수면의 높이가 $y_0,\\,y_1=2y_0$일 때 수면의 상승속도를 각각 $v_0,v_1$이라 하자. $\\dfrac{v_1}{v_0}$을 구하시오. (단, $y_0>0$)",
    options: [o("1","$\\dfrac{1}{4}$"), o("2","$\\dfrac{1}{2\\sqrt 2}$"), o("3","$\\dfrac{1}{2}$"), o("4","$\\dfrac{1}{\\sqrt 2}$")],
    answer: 3,
    explanation: "$V=\\dfrac{\\pi}{2}y^2$. $\\dfrac{dV}{dt}=\\pi y\\dfrac{dy}{dt}=3$ ⇒ $\\dfrac{dy}{dt}=\\dfrac{3}{\\pi y}$.\n$v_1/v_0=y_0/y_1=1/2$."
  }),
  build({
    num: 5, subject: "적분학", unit: "정적분", concept: "가우스 적분·부분적분", difficulty: "medium",
    question: "$\\!\\displaystyle\\int_0^{\\infty}e^{-x^2}dx=\\dfrac{\\sqrt\\pi}{2}$를 이용하여 $\\!\\displaystyle\\int_0^{\\infty}x^2 e^{-x^2}dx$를 구하시오.",
    options: [o("1","$\\dfrac{\\sqrt\\pi}{4}$"), o("2","$\\dfrac{1+\\sqrt\\pi}{2}$"), o("3","$\\sqrt{\\dfrac{\\pi}{2}}$"), o("4","$\\dfrac{2+\\sqrt\\pi}{4}$")],
    answer: 1,
    explanation: "부분적분 $u=x,\\,v'=xe^{-x^2}$: $v=-\\dfrac{1}{2}e^{-x^2}$.\n$=\\!\\left[-\\dfrac{x}{2}e^{-x^2}\\right]_0^{\\infty}+\\dfrac{1}{2}\\!\\int_0^{\\infty}e^{-x^2}dx=0+\\dfrac{\\sqrt\\pi}{4}$."
  }),
  build({
    num: 6, subject: "다변수함수", unit: "최댓값/최솟값", concept: "라그랑주(원뿔 절단)", difficulty: "medium",
    question: "곡선 $x^2+4xy+5y^2=6$에서 함수 $f(x,y)=x+3y$의 최댓값을 구하시오.",
    options: [o("1","$2\\sqrt 2$"), o("2","$2\\sqrt 3$"), o("3","$3+\\sqrt 2$"), o("4","$6-\\sqrt 3$")],
    answer: 2,
    explanation: "라그랑주: $\\!\\begin{vmatrix}2x+4y&4x+10y\\\\1&3\\end{vmatrix}=0$ ⇒ $x+y=0$.\n조건 대입: $x^2=3$ ⇒ $x=\\pm\\sqrt 3,y=\\mp\\sqrt 3$.\n$f=x+3y=-2\\sqrt 3,2\\sqrt 3$. 최댓값 $2\\sqrt 3$."
  }),
  build({
    num: 7, subject: "다변수함수", unit: "중적분", concept: "구면 절반 면적 비율", difficulty: "medium",
    question: "구면 $S=\\{(x,y,z)\\in\\mathbb R^3|\\,x^2+y^2+z^2=1\\}$의 $z\\ge a$인 부분의 면적이 $S$의 전체 면적의 $\\dfrac{1}{6}$이다. $a$를 구하시오.",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$\\dfrac{2}{3}$"), o("3","$\\dfrac{\\sqrt 2}{2}$"), o("4","$\\dfrac{\\sqrt 3}{2}$")],
    answer: 2,
    explanation: "구면 띠 면적 공식: $S=2\\pi rh$. 전체 면적 $4\\pi$. $z\\ge a$ 부분 면적 $=2\\pi(1-a)$.\n$2\\pi(1-a)=\\dfrac{4\\pi}{6}$ ⇒ $a=\\dfrac{2}{3}$."
  }),
  build({
    num: 8, subject: "공학수학", unit: "벡터적분", concept: "그린정리(삼각형)", difficulty: "medium",
    question: "경로 $C$는 점 $(1,0)$에서 $(0,1)$까지 선분과 $(0,1)$에서 $(-1,0)$까지 선분이다. 다음 선적분을 구하시오. $\\!\\displaystyle\\int_C(3x^2+2xy^5)dx+(5x^2 y^4+\\sin y+6x)dy$",
    options: [o("1","$4$"), o("2","$5$"), o("3","$6$"), o("4","$7$")],
    answer: 1,
    explanation: "$(-1,0)$→$(1,0)$ 선분으로 닫고 그린정리: $Q_x-P_y=10xy^4+6-10xy^4=6$.\n$\\!\\iint 6dA=6\\cdot 1=6$ (삼각형 면적 $1$).\n닫는 선분 적분: $\\!\\int_{-1}^1 3t^2 dt=2$. $\\!\\int_C=6-2=4$."
  }),
  build({
    num: 9, subject: "공학수학", unit: "미분방정식", concept: "변수분리(blow-up)", difficulty: "medium",
    question: "미분방정식 $\\dfrac{dx}{dt}=x^3,\\,x(0)=\\dfrac{1}{10}$의 해 $x(t)$에 대해 $x(t)$의 $t=a$에서의 좌극한이 무한대로 발산하는, 즉 $\\!\\displaystyle\\lim_{t\\to a^-}x(t)=\\infty$인 상수 $a>0$가 존재한다. $a$를 구하시오.",
    options: [o("1","$10$"), o("2","$30$"), o("3","$50$"), o("4","$60$")],
    answer: 3,
    explanation: "$\\dfrac{dx}{x^3}=dt$ ⇒ $-\\dfrac{1}{2x^2}=t+c$. $x(0)=1/10$: $c=-50$.\n$x^2=\\dfrac{1}{100-2t}$. $t=50$에서 발산."
  }),
  build({
    num: 10, subject: "공학수학", unit: "미분방정식", concept: "단위계단함수·라플라스", difficulty: "mediumHard",
    question: "함수 $f(t)=\\begin{cases}1,&0\\le t\\le\\pi/2\\\\0,&\\pi/2<t\\end{cases}$에 대해 미분방정식 $x''+4x=f(t),\\,x(0)=0,\\,x'(0)=0$은 구간 $[0,\\infty)$에서 $x,x'$이 연속인 해를 가진다. 이러한 해 $x(t)$에 대해 $x(\\pi)$를 구하시오.",
    options: [o("1","$-\\dfrac{1}{2}$"), o("2","$0$"), o("3","$\\dfrac{1}{4}$"), o("4","$\\dfrac{5}{6}$")],
    answer: 1,
    explanation: "$f(t)=1-u(t-\\pi/2)$. 라플라스: $X=\\dfrac{1}{s(s^2+4)}-\\dfrac{e^{-\\pi s/2}}{s(s^2+4)}$.\n$x(t)=\\dfrac{1-\\cos 2t}{4}-\\dfrac{1-\\cos(2t-\\pi)}{4}u(t-\\pi/2)$.\n$x(\\pi)=\\dfrac{1-\\cos 2\\pi}{4}-\\dfrac{1-\\cos\\pi}{4}=0-\\dfrac{2}{4}=-\\dfrac{1}{2}$."
  }),
  build({
    num: 11, subject: "공학수학", unit: "미분방정식", concept: "연립 1계 ODE(극한 비)", difficulty: "medium",
    question: "다음 연립 선형미분방정식 $\\dfrac{dx}{dt}=-7x+2y,\\,\\dfrac{dy}{dt}=-12x+7y$의 해 $x(t),y(t)$에 대해 $\\!\\displaystyle\\lim_{t\\to\\infty}\\dfrac{y(t)}{x(t)}$를 구하시오. (단, $x(0)=2021,y(0)=1.08$)",
    options: [o("1","$-5$"), o("2","$1$"), o("3","$5$"), o("4","$6$")],
    answer: 4,
    explanation: "행렬 $\\!\\begin{pmatrix}-7&2\\\\-12&7\\end{pmatrix}$의 고유값 $-5,5$, 고유벡터 $(1,1),(1,6)$.\n초기값에 $\\lambda=5$ 성분 포함 ⇒ $t\\to\\infty$에서 $\\lambda=5$ 지배.\n$\\!\\lim y/x=6$."
  }),
  build({
    num: 12, subject: "선형대수", unit: "행렬", concept: "비자명해 조건(det=0)", difficulty: "medium",
    question: "다음 행렬 $A$에 대해 $Ax=\\vec 0$인 영벡터가 아닌 $x\\in\\mathbb R^3$가 존재한다. $a$를 구하시오. (단, $a>0$)\n\n$A=\\!\\begin{pmatrix}1&2&0\\\\a&1&a\\\\2&8a&7\\end{pmatrix}$",
    options: [o("1","$\\dfrac{1}{4}$"), o("2","$\\dfrac{1}{2}$"), o("3","$\\dfrac{7}{8}$"), o("4","$\\dfrac{7}{4}$")],
    answer: 2,
    explanation: "$\\det A=0$ 필요. 계산: $8a^2+10a-7=0$ ⇒ $(2a-1)(4a+7)=0$ ⇒ $a=1/2$ ($a>0$)."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "공간도형", concept: "점의 평면 위 정사영", difficulty: "medium",
    question: "점 $P(3,4,1)$의 평면 $2x-y+z=0$ 위로의 정사영을 $Q(x_1,x_2,x_3)$이라 하자. $x_1+x_2+x_3$을 구하시오.",
    options: [o("1","$2$"), o("2","$\\dfrac{8}{3}$"), o("3","$4$"), o("4","$7$")],
    answer: 4,
    explanation: "직선 $l:(3+2t,\\,4-t,\\,1+t)$. 평면 대입: $2(3+2t)-(4-t)+(1+t)=3+6t=0$ ⇒ $t=-1/2$.\n$Q=(2,9/2,1/2)$. 합 $=2+9/2+1/2=7$."
  }),
  build({
    num: 14, subject: "공학수학", unit: "복소함수", concept: "복소수 거듭제곱 합(드 무아브르)", difficulty: "medium",
    question: "복소수 $z=\\cos\\dfrac{2\\pi}{13}+i\\sin\\dfrac{2\\pi}{13}$에 대해 $1+z+z^2+\\cdots+z^{39}$를 구하시오.",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2\\cos\\dfrac{2\\pi}{13}$"), o("4","$2i\\sin\\dfrac{2\\pi}{13}$")],
    answer: 2,
    explanation: "$z^{13}=\\cos 2\\pi+i\\sin 2\\pi=1$. $1+z+\\cdots+z^{39}=\\dfrac{z^{40}-1}{z-1}=\\dfrac{z-1}{z-1}=1$ ($z^{40}=z$)."
  }),
  build({
    num: 15, subject: "공학수학", unit: "복소함수", concept: "복소 경로적분(개수)", difficulty: "mediumHard",
    question: "원점을 중심으로 반지름 $2$인 반시계방향의 원 $C$에 대한 다음 복소함수의 경로적분들 중 적분값을 바르게 나타낸 것의 개수를 구하시오.\n\n(a) $\\!\\displaystyle\\int_C e^{z^2}dz=0$\n(b) $\\!\\displaystyle\\int_C\\dfrac{1}{z^3}dz=0$\n(c) $\\!\\displaystyle\\int_C\\dfrac{1}{z^2+1}dz=0$\n(d) $\\!\\displaystyle\\int_C 1\\,dz=4\\pi$",
    options: [o("1","$1$개"), o("2","$2$개"), o("3","$3$개"), o("4","$4$개")],
    answer: 3,
    explanation: "(a) 참: $e^{z^2}$ 해석적, 코시.\n(b) 참: 유수 $0$.\n(c) 참: $z=\\pm i$ 단극, 유수 합 $\\dfrac{1}{2i}+\\dfrac{-1}{2i}=0$.\n(d) 거짓: $1$ 해석적이므로 $\\!\\int=0$.\n참 3개."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 홍익대):`, data.map((d) => d.id).join(", "));
