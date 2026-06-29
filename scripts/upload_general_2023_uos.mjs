// Upload 2023년도 서울시립대 편입수학 기출 30문항 (28객관식+2주관식, 90분)
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

const SCHOOL = "서울시립대";
const YEAR = "2023";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation, source_type, questionType = "multiple_choice", answerText = "" }) {
  const id = `q-${YEAR}-uos-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  const isSubjective = questionType === "subjective";
  return { id, subject, unit, concept, difficulty, source_type: source_type || "imported", question, content_type: "latex", question_image: null, options: isSubjective ? [] : options, correct_option_id: isSubjective ? "" : String(answer), answer_text: isSubjective ? answerText : null, question_type: questionType, explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "로피탈 정리", difficulty: "easy",
    question: "다항함수 $f(x)$가 $f(2023)=9,\\,f'(2023)=3$일 때 $\\!\\displaystyle\\lim_{x\\to 2023}\\dfrac{\\sqrt{f(x)}-3}{x-2023}$의 값은?",
    options: [o("1","$-1$"), o("2","$-\\dfrac{1}{2}$"), o("3","$0$"), o("4","$\\dfrac{1}{2}$"), o("5","$1$")],
    answer: 4,
    explanation: "$\\dfrac{0}{0}$ 꼴, 로피탈: $\\!\\lim\\dfrac{f'(x)}{2\\sqrt{f(x)}}=\\dfrac{3}{2\\sqrt 9}=\\dfrac{1}{2}$."
  }),
  build({
    num: 2, subject: "미분학", unit: "극한과 연속", concept: "변수상한 적분 극한·로피탈", difficulty: "medium",
    question: "극한 $\\!\\displaystyle\\lim_{x\\to\\infty}\\dfrac{1}{x^2}\\!\\int_0^x\\!\\ln(1+e^t)\\,dt$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$\\dfrac{3}{4}$"), o("3","$1$"), o("4","$\\dfrac{5}{4}$"), o("5","$\\dfrac{3}{2}$")],
    answer: 1,
    explanation: "$\\dfrac{\\infty}{\\infty}$ 꼴. 로피탈: $\\!\\lim\\dfrac{\\ln(1+e^x)}{2x}=\\!\\lim\\dfrac{e^x/(1+e^x)}{2}=\\dfrac{1}{2}$."
  }),
  build({
    num: 3, subject: "적분학", unit: "급수", concept: "테일러 근사(자릿수 합)", difficulty: "easy",
    question: "$e^{0.001}$의 어림값을 소수점 셋째 자리까지 구한 뒤 그 값의 모든 자릿수의 합을 구하시오. (예: $4.321$이면 $4+3+2+1=10$)",
    options: [o("1","$2$"), o("2","$3$"), o("3","$4$"), o("4","$5$"), o("5","$6$")],
    answer: 1,
    explanation: "$e^{0.001}\\approx 1+0.001+\\dfrac{0.001^2}{2}+\\cdots\\approx 1.001$. 자릿수 합 $=1+0+0+1=2$."
  }),
  build({
    num: 4, subject: "공학수학", unit: "쌍곡함수", concept: "쌍곡·역삼각 명제", difficulty: "medium",
    question: "다음 중 옳은 것의 개수는?\n\n(가) $\\cosh 2x=1+2\\sinh^2 x$\n(나) $\\dfrac{d}{dx}\\cosh x=-\\sinh x$\n(다) $\\sinh^{-1}(-x)=-\\sinh^{-1}x$\n(라) $\\sin^{-1}(-x)=\\sin^{-1}x\\;(-1\\le x\\le 1)$",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$"), o("5","$4$")],
    answer: 3,
    explanation: "(가) 참: $\\cosh 2x=1+2\\sinh^2 x$.\n(나) 거짓: $(\\cosh x)'=\\sinh x$.\n(다) 참: $\\sinh$는 기함수, 역함수도 기함수.\n(라) 거짓: $\\sin^{-1}$은 기함수 ⇒ $-\\sin^{-1}x$."
  }),
  build({
    num: 5, subject: "미분학", unit: "도함수", concept: "관련 변화율(정육면체)", difficulty: "easy",
    question: "정육면체 모양 물체의 부피가 $10\\text{cm}^3/\\text{s}$로 증가한다. 한 변의 길이가 $5\\text{cm}$일 때 겉넓이의 변화율($\\text{cm}^2/\\text{s}$)은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$4$"), o("4","$6$"), o("5","$8$")],
    answer: 5,
    explanation: "$V=x^3$, $\\dfrac{dV}{dt}=3x^2\\dfrac{dx}{dt}=10$ ⇒ $\\dfrac{dx}{dt}=\\dfrac{2}{15}$.\n$S=6x^2$, $\\dfrac{dS}{dt}=12x\\dfrac{dx}{dt}=12\\cdot 5\\cdot\\dfrac{2}{15}=8$."
  }),
  build({
    num: 6, subject: "적분학", unit: "정적분", concept: "치환적분(탄젠트)", difficulty: "easy",
    question: "정적분 $\\!\\displaystyle\\int_{\\pi/6}^{\\pi/4}\\dfrac{2\\sin x}{\\cos^3 x}dx$의 값은?",
    options: [o("1","$\\dfrac{1}{3}$"), o("2","$\\dfrac{2}{3}$"), o("3","$1$"), o("4","$2$"), o("5","$3$")],
    answer: 2,
    explanation: "$=\\!\\int 2\\tan x\\sec^2 x\\,dx=[\\tan^2 x]_{\\pi/6}^{\\pi/4}=1-\\dfrac{1}{3}=\\dfrac{2}{3}$."
  }),
  build({
    num: 7, subject: "적분학", unit: "급수", concept: "급수 수렴 판정", difficulty: "medium",
    question: "다음 급수 중 수렴하는 것을 모두 고르시오.\n\n(가) $\\!\\displaystyle\\sum_{n=1}^{\\infty}ne^{-n}$  (나) $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\!\\left(2-\\dfrac{1}{n}\\right)^n$\n(다) $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{2}{\\!\\left(1+\\dfrac{1}{n}\\right)^{n^2}}$  (라) $\\!\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{(-1)^{n+1}n^2}{n^3+2}$",
    options: [o("1","(가), (나)"), o("2","(나), (다)"), o("3","(가), (나), (다)"), o("4","(가), (다), (라)"), o("5","(나), (다), (라)")],
    answer: 4,
    explanation: "(가) 비율판정: $\\!\\lim\\dfrac{(n+1)/e^{n+1}}{n/e^n}=1/e<1$ 수렴.\n(나) 근판정: $\\!\\lim|2-1/n|=2>1$ 발산.\n(다) 근판정: $\\!\\lim 2/((1+1/n)^n)=2/e<1$ 수렴.\n(라) 교대급수: $n^2/(n^3+2)\\to 0$ 단조감소 수렴.\n수렴: (가),(다),(라)."
  }),
  build({
    num: 8, subject: "선형대수", unit: "행렬", concept: "여인수 행렬(역행렬 성분)", difficulty: "medium",
    question: "행렬 $A=\\!\\begin{pmatrix}1&2&2\\\\1&-2&2\\\\3&-1&5\\end{pmatrix}$의 역행렬을 $A^{-1}=\\!\\begin{pmatrix}a&b&c\\\\d&e&f\\\\g&h&i\\end{pmatrix}$라 할 때 $c+d+e$의 값은?",
    options: [o("1","$-1$"), o("2","$0$"), o("3","$1$"), o("4","$2$"), o("5","$3$")],
    answer: 4,
    explanation: "$|A|=4$. $c=\\dfrac{1}{4}\\!\\begin{vmatrix}2&2\\\\-2&2\\end{vmatrix}=2$. $d=\\dfrac{1}{4}(-1)\\!\\begin{vmatrix}2&2\\\\-1&5\\end{vmatrix}=\\dfrac{-12}{4}\\cdot\\dotsb=\\dfrac{1}{4}$.\n$e=\\dfrac{1}{4}\\!\\begin{vmatrix}1&2\\\\3&5\\end{vmatrix}=-\\dfrac{1}{4}$. 합 $=2+\\dfrac{1}{4}-\\dfrac{1}{4}=2$."
  }),
  build({
    num: 9, subject: "선형대수", unit: "행렬", concept: "행렬 명제(틀린 것)", difficulty: "medium",
    question: "$n\\times n$ 행렬 $A,B,C$에 대하여 다음 중 틀린 것을 모두 고르시오. (단, $n$은 임의의 자연수, $k$는 임의의 실수)\n\n(가) $A(B+C)=(B+C)A$\n(나) $k(AB)=A(kB)$\n(다) $(kA)^T=kA^T$\n(라) $A(BC)=(AB)C$\n(마) $(AB)^T=A^T B^T$",
    options: [o("1","(가), (나)"), o("2","(가), (마)"), o("3","(다), (라)"), o("4","(가), (다), (마)"), o("5","(나), (다), (라)")],
    answer: 2,
    explanation: "(가) 거짓: 교환법칙 일반적으로 성립 안 함.\n(나)(다)(라) 참.\n(마) 거짓: $(AB)^T=B^T A^T$."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "편미분", concept: "곡면 접평면", difficulty: "medium",
    question: "곡면 $S:z=-\\dfrac{2}{\\pi}\\sin(\\pi x)+e^{(x+1)y}-\\dfrac{1}{2}\\sinh(2y)$ 위의 점 $P(-1,0,1)$에서의 접평면이 $ax+by+cz=1$일 때 $a+b+c$의 값은?",
    options: [o("1","$-1$"), o("2","$1$"), o("3","$-2$"), o("4","$2$"), o("5","$0$")],
    answer: 5,
    explanation: "$F=-\\tfrac{2}{\\pi}\\sin(\\pi x)+e^{(x+1)y}-\\tfrac{1}{2}\\sinh(2y)-z$. $\\nabla F|_{(-1,0,1)}=(2,-1,-1)$.\n접평면 $2x-y-z=-3$, 정규화 $-\\dfrac{2}{3}x+\\dfrac{1}{3}y+\\dfrac{1}{3}z=1$. $a+b+c=0$."
  }),
  build({
    num: 11, subject: "적분학", unit: "정적분", concept: "사이클로이드 길이", difficulty: "medium",
    question: "곡선 $x=r(\\theta-\\sin\\theta),\\,y=r(1-\\cos\\theta)\\;(0\\le\\theta\\le 4\\pi)$의 길이가 $16$이 되는 양의 실수 $r$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 1,
    explanation: "사이클로이드 한 아치 길이 $=8r$. 두 아치 $=16r=16$ ⇒ $r=1$."
  }),
  build({
    num: 12, subject: "적분학", unit: "정적분", concept: "쉘 회전체 부피", difficulty: "medium",
    question: "곡선 $y=3\\sqrt x$와 $x=1,\\,x=4,\\,y=0$으로 둘러싸인 영역을 $y$축을 중심으로 회전시킨 회전체의 부피는?",
    options: [
      o("1","$\\dfrac{372\\pi}{5}$"),
      o("2","$\\dfrac{186\\pi}{5}$"),
      o("3","$\\dfrac{93\\pi}{5}$"),
      o("4","$\\dfrac{72\\pi}{5}$"),
      o("5","$\\dfrac{36\\pi}{5}$")
    ],
    answer: 1,
    explanation: "$V=2\\pi\\!\\int_1^4 x\\cdot 3\\sqrt x\\,dx=6\\pi\\!\\int_1^4 x^{3/2}dx=6\\pi\\cdot\\dfrac{2}{5}[x^{5/2}]_1^4=\\dfrac{12\\pi}{5}(32-1)=\\dfrac{372\\pi}{5}$."
  }),
  build({
    num: 13, subject: "적분학", unit: "정적분", concept: "극곡선(4엽 장미) 넓이", difficulty: "medium",
    question: "극방정식으로 표현된 곡선 $r=2\\cos^2\\theta-1\\;(0\\le\\theta\\le 2\\pi)$의 내부에 놓인 영역의 넓이는?",
    options: [o("1","$\\dfrac{\\pi-2}{2}$"), o("2","$\\dfrac{\\pi-1}{4}$"), o("3","$\\dfrac{\\pi}{2}$"), o("4","$\\dfrac{\\pi+1}{4}$"), o("5","$\\dfrac{\\pi+2}{2}$")],
    answer: 3,
    explanation: "$r=\\cos 2\\theta$ (4엽 장미). 넓이 $=a^2\\cdot\\dfrac{\\pi}{2}|_{a=1}=\\dfrac{\\pi}{2}$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "공간도형", concept: "두 직선 각도", difficulty: "medium",
    question: "두 평면 $x+2y-3z=1$과 $3x+4y-5z=3$의 교선을 $l_1$, 두 평면 $x+2y-3z=1$과 $2x-y-z=2$의 교선을 $l_2$라 하자. 두 교선 $l_1,l_2$가 이루는 각의 크기를 $\\theta$라 할 때 $\\sin\\theta$의 값은?",
    options: [o("1","$\\dfrac{\\sqrt 2}{3}$"), o("2","$\\dfrac{\\sqrt 3}{3}$"), o("3","$\\dfrac{\\sqrt 5}{3}$"), o("4","$\\dfrac{\\sqrt 7}{3}$"), o("5","$\\dfrac{\\sqrt 8}{3}$")],
    answer: 4,
    explanation: "$l_1$ 방향 $=(1,-2,-1)$, $l_2$ 방향 $=(1,1,1)$.\n$\\cos\\theta=\\dfrac{|(1)(1)+(-2)(1)+(-1)(1)|}{\\sqrt 6\\cdot\\sqrt 3}=\\dfrac{\\sqrt 2}{3}$.\n$\\sin\\theta=\\dfrac{\\sqrt 7}{3}$."
  }),
  build({
    num: 15, subject: "다변수함수", unit: "공간곡선", concept: "곡률 최댓값", difficulty: "mediumHard",
    question: "곡선 $\\vec r(\\theta)=\\sin\\theta\\,\\vec i+\\sin^2\\theta\\,\\vec j+2\\sin^2\\theta\\,\\vec k\\;(0\\le\\theta\\le\\pi/2)$의 곡률의 최댓값은?",
    options: [o("1","$2$"), o("2","$2\\sqrt 2$"), o("3","$2\\sqrt 3$"), o("4","$4$"), o("5","$2\\sqrt 5$")],
    answer: 5,
    explanation: "$\\sin\\theta=t$ 치환: $\\vec r(t)=(t,t^2,2t^2)$. $\\vec r'=(1,2t,4t),\\,\\vec r''=(0,2,4)$.\n$\\vec r'\\times\\vec r''=(0,-4,2)$, $|.|=\\sqrt{20}=2\\sqrt 5$.\n$\\kappa=\\dfrac{2\\sqrt 5}{(1+20t^2)^{3/2}}$. $t=0$에서 최대 $2\\sqrt 5$."
  }),
  build({
    num: 16, subject: "다변수함수", unit: "최댓값/최솟값", concept: "원기둥-평면 교선 최댓값", difficulty: "medium",
    question: "평면 $x+y+z=1$과 원기둥 $y^2+z^2=\\dfrac{5}{4}$의 교선 위에서 함수 $f(x,y,z)=x+2y+3z$의 최댓값은?",
    options: [o("1","$\\dfrac{5}{2}$"), o("2","$3$"), o("3","$\\dfrac{7}{2}$"), o("4","$4$"), o("5","$\\dfrac{9}{2}$")],
    answer: 3,
    explanation: "$y=\\tfrac{\\sqrt 5}{2}\\cos\\theta,\\,z=\\tfrac{\\sqrt 5}{2}\\sin\\theta,\\,x=1-y-z$.\n$f=1+y+2z=1+\\tfrac{\\sqrt 5}{2}\\cos\\theta+\\sqrt 5\\sin\\theta=1+\\sqrt{5/4+5}\\cos(\\theta-\\alpha)=1+\\tfrac{5}{2}$. 최대 $\\dfrac{7}{2}$."
  }),
  build({
    num: 17, subject: "다변수함수", unit: "편미분", concept: "방향도함수 최소(경도 반대방향)", difficulty: "medium",
    question: "함수 $f(x,y,z)=x^2+4xy+4y^2-z-e^{yz}$에 대하여 점 $P(1,0,2)$에서 $f$의 방향도함수 $D_{\\vec u}f$가 최소가 되도록 하는 단위벡터 $\\vec u$는?",
    options: [
      o("1","$\\!\\left\\langle-\\dfrac{2}{\\sqrt 6},-\\dfrac{1}{\\sqrt 6},\\dfrac{1}{\\sqrt 6}\\right\\rangle$"),
      o("2","$\\!\\left\\langle\\dfrac{2}{\\sqrt 6},\\dfrac{1}{\\sqrt 6},-\\dfrac{1}{\\sqrt 6}\\right\\rangle$"),
      o("3","$\\!\\left\\langle-\\dfrac{2}{3},-\\dfrac{2}{3},\\dfrac{1}{3}\\right\\rangle$"),
      o("4","$\\!\\left\\langle\\dfrac{2}{3},\\dfrac{2}{3},-\\dfrac{1}{3}\\right\\rangle$"),
      o("5","$\\!\\left\\langle\\dfrac{2}{3},\\dfrac{2}{3},\\dfrac{1}{3}\\right\\rangle$")
    ],
    answer: 3,
    explanation: "$\\nabla f=(2x+4y,\\,4x+8y-ze^{yz},\\,-1-ye^{yz})|_{(1,0,2)}=(2,2,-1)$.\n최소: $-\\nabla f/|\\nabla f|=-\\dfrac{(2,2,-1)}{3}=\\!\\left(-\\dfrac{2}{3},-\\dfrac{2}{3},\\dfrac{1}{3}\\right)$."
  }),
  build({
    num: 18, subject: "다변수함수", unit: "중적분", concept: "적분순서 교환", difficulty: "medium",
    question: "이중적분 $\\!\\displaystyle\\int_0^{1/2}\\!\\!\\int_{\\sin^{-1}x}^{\\pi/6}\\dfrac{1}{\\sqrt{1-x^2}}dy\\,dx$의 값은?",
    options: [
      o("1","$\\dfrac{\\pi^2}{9}$"),
      o("2","$\\dfrac{\\pi^2}{18}$"),
      o("3","$\\dfrac{\\pi^2}{36}$"),
      o("4","$\\dfrac{\\pi^2}{72}$"),
      o("5","$\\dfrac{\\pi^2}{144}$")
    ],
    answer: 4,
    explanation: "순서 변경: $0\\le y\\le\\pi/6,\\,0\\le x\\le\\sin y$.\n$\\!\\int_0^{\\pi/6}[\\sin^{-1}x]_0^{\\sin y}dy=\\!\\int_0^{\\pi/6}y\\,dy=\\dfrac{(\\pi/6)^2}{2}=\\dfrac{\\pi^2}{72}$."
  }),
  build({
    num: 19, subject: "공학수학", unit: "벡터적분", concept: "그린 정리", difficulty: "medium",
    question: "곡선 $C:x=2\\cos t,\\,y=2\\sin t\\;(0\\le t\\le 2\\pi)$에 대하여 선적분 $\\!\\displaystyle\\oint_C(\\sin x+y^3)dx+(\\cos^2 y-x^3)dy$의 값은?",
    options: [o("1","$-8\\pi$"), o("2","$8\\pi$"), o("3","$-16\\pi$"), o("4","$16\\pi$"), o("5","$-24\\pi$")],
    answer: 5,
    explanation: "그린: $\\!\\iint(Q_x-P_y)dA=\\!\\iint(-3x^2-3y^2)dA=-3\\!\\int_0^{2\\pi}\\!\\int_0^2 r^2\\cdot r\\,dr\\,d\\theta=-3\\cdot 2\\pi\\cdot 4=-24\\pi$."
  }),
  build({
    num: 20, subject: "미분학", unit: "도함수", concept: "음함수의 양함수화 후 미분", difficulty: "medium",
    question: "$x^2\\sqrt{1+y}=y\\sqrt{1+x^2}$일 때 $\\dfrac{dy}{dx}$는? (단, $x^2\\ne y$)",
    options: [
      o("1","$-\\dfrac{2x}{(1+x^2)^2}$"),
      o("2","$-\\dfrac{4x}{(1+x^2)^2}$"),
      o("3","$-\\dfrac{4x^2}{(1+x^2)^2}$"),
      o("4","$-\\dfrac{2x}{(1+x)^2}$"),
      o("5","$-\\dfrac{4x}{(1+x)^2}$")
    ],
    answer: 1,
    explanation: "양변 제곱: $x^4(1+y)=y^2(1+x^2)$. $y$에 대해 정리: $(1+x^2)y^2-x^4 y-x^4=0$.\n인수분해: $\\{(1+x^2)y+x^2\\}(y-x^2)=0$. $y\\ne x^2$ ⇒ $y=-\\dfrac{x^2}{1+x^2}$.\n$y'=-\\dfrac{2x(1+x^2)-x^2\\cdot 2x}{(1+x^2)^2}=-\\dfrac{2x}{(1+x^2)^2}$."
  }),
  build({
    num: 21, subject: "선형대수", unit: "벡터", concept: "육면체 부피(스칼라 삼중적)", difficulty: "medium",
    question: "좌표공간의 다섯 점 $A(2,1,3),B(1,1,1),C(3,2,4),D(2,3,4),E(3,4,3)$을 꼭짓점으로 하는 육면체의 부피는? (면: $\\triangle ABC,\\triangle ACD,\\triangle ABD,\\triangle BCE,\\triangle CDE,\\triangle BDE$)",
    options: [o("1","$2$"), o("2","$3$"), o("3","$4$"), o("4","$5$"), o("5","$6$")],
    answer: 1,
    explanation: "사면체 $ABCD+EBCD$.\n$\\vec{AB}=(-1,0,-2),\\,\\vec{AC}=(1,1,1),\\,\\vec{AD}=(0,2,1)$ ⇒ 부피 $=\\dfrac{1}{6}|\\det|=\\dfrac{1}{2}$.\n$\\vec{EB}=(-2,-3,-2),\\,\\vec{EC}=(0,-2,1),\\,\\vec{ED}=(-1,-1,1)$ ⇒ 부피 $=\\dfrac{3}{2}$.\n합 $=2$."
  }),
  build({
    num: 22, subject: "공학수학", unit: "미분방정식", concept: "변수분리(상수 결정)", difficulty: "medium",
    question: "$f(x,y)=C$가 미분방정식 $y\\ln x\\dfrac{dy}{dx}=\\dfrac{y+1}{x},\\,y(e)=1$의 해일 때 상수 $C$의 값은? (단, $f(e,0)=0$)",
    options: [o("1","$1-e$"), o("2","$1-\\ln 2$"), o("3","$0$"), o("4","$1+\\ln 2$"), o("5","$1+e$")],
    answer: 2,
    explanation: "변수분리: $\\dfrac{y}{y+1}dy=\\dfrac{dx}{x\\ln x}$. 적분: $y-\\ln(y+1)=\\ln(\\ln x)+k$.\n$y(e)=1$: $1-\\ln 2=0+k$. 정규화 $f(x,y)=y-\\ln(y+1)-\\ln(\\ln x)$일 때 $f(e,0)=0$. ⇒ $C=1-\\ln 2$."
  }),
  build({
    num: 23, subject: "공학수학", unit: "미분방정식", concept: "2계 상수계수(라플라스)", difficulty: "medium",
    question: "미분방정식 $\\dfrac{d^2 y}{dx^2}+10\\dfrac{dy}{dx}+24y=0,\\,y(0)=2,\\,y'(0)=2$의 해가 $y=\\alpha e^{bx}+c e^{dx}$일 때 $ac$의 값은?",
    options: [o("1","$-35$"), o("2","$-25$"), o("3","$-15$"), o("4","$15$"), o("5","$35$")],
    answer: 1,
    explanation: "특성: $s^2+10s+24=(s+4)(s+6)=0$ ⇒ $s=-4,-6$.\n$y=Ae^{-4x}+Be^{-6x}$. $A+B=2,\\,-4A-6B=2$ ⇒ $A=7,B=-5$. $\\alpha c=7\\cdot(-5)=-35$."
  }),
  build({
    num: 24, subject: "공학수학", unit: "라플라스변환", concept: "역라플라스·부분분수", difficulty: "medium",
    question: "함수 $f(t)=ae^{ct}+be^{dt}$의 라플라스 변환이 $F(s)=\\mathcal{L}\\{f(t)\\}=\\dfrac{4s+8}{s^2+6s+5}$일 때 $ab+cd$의 값은?",
    options: [o("1","$3$"), o("2","$5$"), o("3","$8$"), o("4","$13$"), o("5","$15$")],
    answer: 3,
    explanation: "$\\dfrac{4s+8}{(s+1)(s+5)}=\\dfrac{1}{s+1}+\\dfrac{3}{s+5}$.\n$f(t)=e^{-t}+3e^{-5t}$. $a=1,c=-1,b=3,d=-5$. $ab+cd=3+5=8$."
  }),
  build({
    num: 25, subject: "공학수학", unit: "라플라스변환", concept: "1차 이동 정리", difficulty: "easy",
    question: "함수 $f(t)=e^{-3t}\\cos 2t$의 라플라스 변환은?",
    options: [
      o("1","$\\dfrac{3}{(s+2)^2+3^2}$"),
      o("2","$\\dfrac{2}{(s+3)^2+2^2}$"),
      o("3","$\\dfrac{s+3}{(s+3)^2+2^2}$"),
      o("4","$\\dfrac{s-3}{(s-3)^2+2^2}$"),
      o("5","$\\dfrac{2}{(s-3)^2+2^2}$")
    ],
    answer: 3,
    explanation: "$\\mathcal{L}\\{\\cos 2t\\}=\\dfrac{s}{s^2+4}$. 1차 이동 $s\\to s+3$: $\\dfrac{s+3}{(s+3)^2+4}$."
  }),
  build({
    num: 26, subject: "공학수학", unit: "푸리에", concept: "푸리에 급수($2x^2$)", difficulty: "mediumHard",
    question: "주기 $2\\pi$인 함수 $f(x)=2x^2\\;(-\\pi<x<\\pi)$의 푸리에 급수 표현은?",
    options: [
      o("1","$\\dfrac{\\pi^2}{3}-4\\!\\left(\\cos x-\\dfrac{1}{4}\\cos 2x+\\dfrac{1}{9}\\cos 3x-\\cdots\\right)$"),
      o("2","$\\dfrac{\\pi^2}{3}-8\\!\\left(\\cos x-\\dfrac{1}{4}\\cos 2x+\\dfrac{1}{9}\\cos 3x-\\cdots\\right)$"),
      o("3","$\\dfrac{2\\pi^2}{3}-4\\!\\left(\\cos x-\\dfrac{1}{4}\\cos 2x+\\dfrac{1}{9}\\cos 3x-\\cdots\\right)$"),
      o("4","$\\dfrac{2\\pi^2}{3}-8\\!\\left(\\cos x-\\dfrac{1}{4}\\cos 2x+\\dfrac{1}{9}\\cos 3x-\\cdots\\right)$"),
      o("5","$\\dfrac{\\pi^3}{3}-4\\!\\left(\\cos x-\\dfrac{1}{4}\\cos 2x+\\dfrac{1}{9}\\cos 3x-\\cdots\\right)$")
    ],
    answer: 4,
    explanation: "$a_0=\\dfrac{2}{3}\\pi^2$. $a_n=(-1)^n\\dfrac{8}{n^2}$. $b_n=0$ (우함수).\n$f(x)=\\dfrac{2\\pi^2}{3}+8\\!\\sum\\dfrac{(-1)^n}{n^2}\\cos nx=\\dfrac{2\\pi^2}{3}-8(\\cos x-\\tfrac{1}{4}\\cos 2x+\\tfrac{1}{9}\\cos 3x-\\cdots)$."
  }),
  build({
    num: 27, subject: "공학수학", unit: "푸리에", concept: "푸리에 사인적분", difficulty: "mediumHard",
    question: "함수 $f(x)=\\begin{cases}1&(0<x\\le 2)\\\\ 0&(x>2)\\end{cases}$의 푸리에 사인적분 표현은?",
    options: [
      o("1","$\\dfrac{2}{\\pi}\\!\\int_0^{\\infty}\\dfrac{1+\\sin 2w}{w}\\cos\\omega x\\,d\\omega$"),
      o("2","$\\dfrac{2}{\\pi}\\!\\int_0^{\\infty}\\dfrac{1-\\cos 2w}{w}\\sin\\omega x\\,d\\omega$"),
      o("3","$\\dfrac{2}{\\pi}\\!\\int_0^{\\infty}\\dfrac{1-\\sin 2w}{w}\\cos 2\\omega x\\,d\\omega$"),
      o("4","$\\dfrac{2}{\\pi}\\!\\int_0^{\\infty}\\dfrac{\\cos 2w}{w}\\sin\\omega x\\,d\\omega$"),
      o("5","$\\dfrac{2}{\\pi}\\!\\int_0^{\\infty}\\dfrac{1-\\cos 2w}{w}\\sin 2\\omega x\\,d\\omega$")
    ],
    answer: 2,
    explanation: "$B(w)=\\dfrac{2}{\\pi}\\!\\int_0^2\\sin(wx)dx=\\dfrac{2}{\\pi}\\cdot\\dfrac{1-\\cos 2w}{w}$.\n$f(x)=\\!\\int_0^{\\infty}B(w)\\sin(wx)dw=\\dfrac{2}{\\pi}\\!\\int_0^{\\infty}\\dfrac{1-\\cos 2w}{w}\\sin(\\omega x)d\\omega$."
  }),
  build({
    num: 28, subject: "공학수학", unit: "복소함수", concept: "유수 정리", difficulty: "mediumHard",
    question: "복소평면 위의 닫힌 경로 $C:|z-1|=\\dfrac{3}{2}$에 대한 적분 $\\!\\displaystyle\\oint_C\\dfrac{e^{-zi}}{\\sin 2z}dz$의 값은? (단, $C$의 방향은 반시계 방향)",
    options: [o("1","$2\\pi(i-1)$"), o("2","$\\pi(i-1)$"), o("3","$0$"), o("4","$\\pi(i+1)$"), o("5","$2\\pi(i+1)$")],
    answer: 2,
    explanation: "$\\sin 2z=0$ ⇒ $z=0,\\pi/2$ (경로 내부).\n$\\text{Res}_{z=0}=\\dfrac{e^0}{2\\cos 0}=\\dfrac{1}{2}$. $\\text{Res}_{z=\\pi/2}=\\dfrac{e^{-i\\pi/2}}{2\\cos\\pi}=\\dfrac{-i}{-2}=\\dfrac{i}{2}$.\n$2\\pi i\\!\\left(\\dfrac{1}{2}+\\dfrac{i}{2}\\right)=\\pi(i-1)$."
  }),
  build({
    num: 29, subject: "적분학", unit: "급수", concept: "테일러 급수 6계 도함수(주관식)", difficulty: "mediumHard",
    question: "[주관식] 함수 $f(x)=\\sin(x^2)-x^2\\cos(x^2)$에 대하여 $f^{(6)}(0)$의 값은? (단, $f^{(n)}(x)$는 $n$계 도함수)",
    options: [], answer: "", questionType: "subjective", answerText: "240",
    explanation: "$\\sin(x^2)=x^2-\\dfrac{x^6}{6}+\\cdots$, $\\cos(x^2)=1-\\dfrac{x^4}{2}+\\cdots$.\n$f(x)=x^2-\\dfrac{x^6}{6}-x^2+\\dfrac{x^6}{2}+\\cdots=\\dfrac{x^6}{3}+\\cdots$.\n$f^{(6)}(0)=\\dfrac{1}{3}\\cdot 6!=240$."
  }),
  build({
    num: 30, subject: "적분학", unit: "정적분", concept: "공간곡선 길이(주관식)", difficulty: "mediumHard",
    question: "[주관식] 곡선 $\\vec r(t)=\\langle t^2,\\cos t,\\sin t\\rangle\\;(0\\le t\\le 1)$의 길이가 $\\dfrac{\\sqrt a}{2}+\\dfrac{1}{b}\\ln(c+\\sqrt d)$일 때 $a+b+c+d$의 값은? (단, $a,b,c,d$는 자연수)",
    options: [], answer: "", questionType: "subjective", answerText: "16",
    explanation: "$\\vec r'=(2t,-\\sin t,\\cos t)$, $|\\vec r'|=\\sqrt{4t^2+1}$.\n$L=\\!\\int_0^1\\!\\sqrt{4t^2+1}dt$. $2t=\\tan\\theta$ 치환 후 $L=\\dfrac{1}{4}[\\sec\\theta\\tan\\theta+\\ln|\\sec\\theta+\\tan\\theta|]$.\n$\\tan\\alpha=2,\\sec\\alpha=\\sqrt 5$: $L=\\dfrac{\\sqrt 5}{2}+\\dfrac{1}{4}\\ln(2+\\sqrt 5)$.\n$a=5,b=4,c=2,d=5$. 합 $=16$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 서울시립대):`, data.map((d) => d.id).join(", "));
