// Upload 2023년도 경희대 편입수학 기출 30문항 (5지 선다형, 90분)
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

const SCHOOL = "경희대";
const YEAR = "2023";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-kyunghee-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "적분학", unit: "정적분", concept: "회전곡면 넓이(쌍곡함수)", difficulty: "medium",
    question: "곡선 $y=3+\\dfrac{1}{2}\\cosh 2x\\;\\!\\left(0\\le x\\le\\dfrac{1}{2}\\right)$을 $y$축을 중심으로 회전하여 얻은 곡면의 넓이는?",
    options: [
      o("1","$\\dfrac{\\pi(e+1)}{2e}$"),
      o("2","$\\dfrac{\\pi(e-1)}{2e}$"),
      o("3","$\\dfrac{\\pi(e+1)}{e}$"),
      o("4","$\\dfrac{\\pi(e-1)}{e}$"),
      o("5","$\\dfrac{\\pi(2e-1)}{e}$")
    ],
    answer: 2,
    explanation: "$S=2\\pi\\!\\int_0^{1/2}x\\sqrt{1+\\sinh^2 2x}\\,dx=2\\pi\\!\\int_0^{1/2}x\\cosh 2x\\,dx$.\n부분적분: $=2\\pi\\!\\left[\\dfrac{x}{2}\\sinh 2x-\\dfrac{1}{4}\\cosh 2x\\right]_0^{1/2}=2\\pi\\!\\left(\\dfrac{1-e^{-1}}{4}\\right)=\\dfrac{\\pi(e-1)}{2e}$."
  }),
  build({
    num: 2, subject: "적분학", unit: "정적분", concept: "부분분수 적분(정수계수 합)", difficulty: "medium",
    question: "적분 $\\!\\displaystyle\\int_1^{\\sqrt 3}\\dfrac{36(x^2-x+6)}{x^3+3x}\\,dx$가 정수 $a,b,c,d$에 의하여 $a\\sqrt b\\pi+c\\ln d$로 표현될 때 $a+b+c+d$는?",
    options: [o("1","$22$"), o("2","$23$"), o("3","$24$"), o("4","$25$"), o("5","$26$")],
    answer: 5,
    explanation: "부분분수: $\\dfrac{72}{x}-\\dfrac{36(x+1)}{x^2+3}$. 적분 후 $=-\\sqrt 3\\pi+18\\ln 6$.\n$a=-1,b=3,c=18,d=6$. 합 $=26$."
  }),
  build({
    num: 3, subject: "적분학", unit: "이상적분", concept: "$\\!\\int_0^\\infty 1/x^p$ 수렴", difficulty: "easy",
    question: "적분 $\\!\\displaystyle\\int_0^\\infty\\dfrac{1}{x^p}\\,dx$에 관한 설명으로 옳은 것은?",
    options: [
      o("1","$0<p<1$일 때만 수렴한다."),
      o("2","$1<p$일 때만 수렴한다."),
      o("3","$p\\ne 1$일 때만 수렴한다."),
      o("4","$0<p$이면 수렴한다."),
      o("5","$0<p$이면 수렴하지 않는다.")
    ],
    answer: 5,
    explanation: "$[0,1]$에서는 $p<1$이어야 수렴, $[1,\\infty)$에서는 $p>1$이어야 수렴. 둘 다 만족하는 $p$ 없음 ⇒ 항상 발산."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분", concept: "극곡선 교점 개수", difficulty: "medium",
    question: "극곡선 $r=1+\\sin\\theta$와 $r=3\\sin\\theta$의 교점의 개수는?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 3,
    explanation: "$1+\\sin\\theta=3\\sin\\theta$ ⇒ $\\sin\\theta=1/2$, 두 점. 추가로 원점도 두 곡선 모두 통과. 총 $3$개."
  }),
  build({
    num: 5, subject: "적분학", unit: "급수", concept: "거듭제곱급수 표현", difficulty: "medium",
    question: "함수 $f(x)=\\dfrac{x^2+x}{(1-x)^3}$의 거듭제곱급수 표현이 $\\!\\displaystyle\\sum_{n=1}^{\\infty}(an+b)^c x^n$이면 $a+b+c$는?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 3,
    explanation: "$\\dfrac{x(x+1)}{(1-x)^3}=\\!\\sum n^2 x^n$. ⇒ $a=1,b=0,c=2$. 합 $=3$."
  }),
  build({
    num: 6, subject: "다변수함수", unit: "공간도형", concept: "직선·평면 만나지 않음", difficulty: "medium",
    question: "직선 $L_1:x=1-y=\\dfrac{z-2}{3}$을 품고 직선 $L_2:\\dfrac{x-2}{2}=\\dfrac{y-3}{-2}=\\dfrac{z}{7}$와 만나지 않는 평면의 방정식이 $ax+by+cz=1$이면 $a+b+c$는?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 2,
    explanation: "$L_1$ 위의 점 $(0,1,2)$. 법선: $L_1$ 방향 $(1,-1,3)\\times L_2$ 방향 $(2,-2,7)=(−1,−1,0)\\to(1,1,0)$.\n평면 $x+y=1$. $a=1,b=1,c=0$. 합 $=2$."
  }),
  build({
    num: 7, subject: "다변수함수", unit: "공간곡선", concept: "접촉원 방정식", difficulty: "mediumHard",
    question: "매개곡선 $\\vec r(t)=(-1+2t,\\,2t-2t^2)$의 $t=\\dfrac{1}{2}$에서의 접촉원의 방정식이 $(x-a)^2+(y-b)^2=c^2$이면 $a+b+c$는?",
    options: [o("1","$-\\dfrac{1}{2}$"), o("2","$0$"), o("3","$\\dfrac{1}{2}$"), o("4","$1$"), o("5","$\\dfrac{3}{2}$")],
    answer: 3,
    explanation: "$P=\\vec r(1/2)=(0,1/2)$. $\\vec r'=(2,0),\\,\\vec r''=(0,-4)$. $|\\vec r'\\times\\vec r''|=8$. $\\kappa=8/8=1$, 반경 $=1$.\n법선 단위벡터 $=(0,-1)$ ⇒ 중심 $=P+1\\cdot(0,-1)=(0,-1/2)$.\n$a=0,b=-1/2,c=1$. 합 $=1/2$."
  }),
  build({
    num: 8, subject: "다변수함수", unit: "편미분", concept: "선형근사(전미분)", difficulty: "easy",
    question: "함수 $f(x,y)=\\sqrt{y+\\cos^2 x}$에 대한 $f(0.2,0.1)$의 선형근사값은?",
    options: [o("1","$1$"), o("2","$1.05$"), o("3","$1.1$"), o("4","$1.15$"), o("5","$1.2$")],
    answer: 2,
    explanation: "$f(0,0)=1$. $f_x=\\dfrac{-\\sin x\\cos x}{\\sqrt{y+\\cos^2 x}}|_0=0$, $f_y=\\dfrac{1}{2\\sqrt{y+\\cos^2 x}}|_0=\\dfrac{1}{2}$.\n$f\\approx 1+0\\cdot 0.2+\\dfrac{1}{2}\\cdot 0.1=1.05$."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "편미분", concept: "연쇄법칙", difficulty: "medium",
    question: "함수 $z=xe^{ty},\\,x=u^2 v,\\,y=v^2 w,\\,t=w^2 u$에 대하여 $(u,v,w)=(-1,2,1)$일 때 $\\dfrac{\\partial z}{\\partial u}=ae^b$이면 $a-b$는?",
    options: [o("1","$5$"), o("2","$6$"), o("3","$7$"), o("4","$8$"), o("5","$9$")],
    answer: 4,
    explanation: "$z_u=z_x x_u+z_t t_u=e^{ty}(2uv)+xye^{ty}(w^2)$.\n$(u,v,w)=(-1,2,1)$: $x=2,y=4,t=-1$, $ty=-4$. $z_u=e^{-4}(-4)+8e^{-4}(1)=4e^{-4}$.\n$a=4,b=-4$. $a-b=8$."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "편미분", concept: "임계점 분류(극대·극소·안장)", difficulty: "mediumHard",
    question: "함수 $f(x,y)=y^3+3x^2 y-6x^2-6y^2+2$의 극댓값, 극솟값, 안장점의 위치를 순서대로 나열한 것은?",
    options: [
      o("1","$(4,0),(0,0),(2,-2)$"),
      o("2","$(0,0),(0,4),(2,2)$"),
      o("3","$(4,0),(0,4),(2,2)$"),
      o("4","$(0,0),(0,4),(2,-2)$"),
      o("5","$(4,0),(0,4),(2,-2)$")
    ],
    answer: 2,
    explanation: "$f_x=6xy-12x=0$, $f_y=3y^2+3x^2-12y=0$. 임계점 $(0,0),(0,4),(2,2),(2,-2)$.\n$f_{xx}=6y-12,f_{yy}=6y-12,f_{xy}=6x$. 판별:\n$(0,0)$: $\\Delta=144>0,f_{xx}<0$ 극대.\n$(0,4)$: $\\Delta=144>0,f_{xx}>0$ 극소.\n$(2,\\pm 2)$: $\\Delta<0$ 안장점."
  }),
  build({
    num: 11, subject: "다변수함수", unit: "최댓값/최솟값", concept: "라그랑주(타원체)", difficulty: "mediumHard",
    question: "제약조건 $x+y+z=0,\\,x^2+2z^2=1$을 만족하는 함수 $f(x,y,z)=3x+y-3z$의 최댓값을 $a$, 최솟값을 $b$라 할 때 $ab$는?",
    options: [o("1","$-12$"), o("2","$-6$"), o("3","$0$"), o("4","$6$"), o("5","$12$")],
    answer: 1,
    explanation: "매개변수화: $x=\\cos t,z=\\sin t/\\sqrt 2,y=-\\cos t-\\sin t/\\sqrt 2$.\n$f=2\\cos t-2\\sqrt 2\\sin t=\\sqrt{12}\\sin(t+\\alpha)$.\n최대 $\\sqrt{12}$, 최소 $-\\sqrt{12}$. 곱 $=-12$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "중적분", concept: "적분순서 교환", difficulty: "medium",
    question: "적분 $\\!\\displaystyle\\int_0^1\\!\\!\\int_{\\sqrt x}^1\\dfrac{1}{y^3+1}\\,dy\\,dx$는?",
    options: [o("1","$\\ln 3$"), o("2","$\\dfrac{\\ln 3}{2}$"), o("3","$\\dfrac{\\ln 2}{3}$"), o("4","$\\ln 2$"), o("5","$2$")],
    answer: 3,
    explanation: "순서 변경: $0\\le y\\le 1,\\,0\\le x\\le y^2$.\n$\\!\\int_0^1\\dfrac{y^2}{y^3+1}dy=\\dfrac{1}{3}\\ln(y^3+1)|_0^1=\\dfrac{\\ln 2}{3}$."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "중적분", concept: "사면체 무게중심", difficulty: "medium",
    question: "네 평면 $x=0,y=0,z=0,4x+2y+z=4$로 둘러싸인 사면체 $E$에서 $\\!\\displaystyle\\iiint_E x\\,dV$는?",
    options: [o("1","$1$"), o("2","$\\dfrac{1}{2}$"), o("3","$\\dfrac{1}{3}$"), o("4","$\\dfrac{1}{4}$"), o("5","$\\dfrac{1}{5}$")],
    answer: 3,
    explanation: "꼭짓점 $(0,0,0),(1,0,0),(0,2,0),(0,0,4)$. $\\bar x=\\dfrac{1}{4}$. 부피 $=\\dfrac{1}{6}\\cdot 1\\cdot 2\\cdot 4=\\dfrac{4}{3}$.\n$\\!\\iiint x\\,dV=\\bar x\\cdot V=\\dfrac{1}{4}\\cdot\\dfrac{4}{3}=\\dfrac{1}{3}$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "중적분", concept: "구면좌표 삼중적분", difficulty: "mediumHard",
    question: "적분 $\\!\\displaystyle\\iiint_E zdV$는? 단, $E=\\{(x,y,z)|\\,x^2+y^2+z^2\\le 1,\\,z\\ge\\sqrt{3(x^2+y^2)},\\,y\\ge 0\\}$",
    options: [o("1","$\\dfrac{\\pi}{4}$"), o("2","$\\dfrac{\\pi}{8}$"), o("3","$\\dfrac{\\pi}{16}$"), o("4","$\\dfrac{\\pi}{32}$"), o("5","$\\dfrac{\\pi}{64}$")],
    answer: 4,
    explanation: "구면좌표: $\\rho\\le 1,\\phi\\le\\pi/6,0\\le\\theta\\le\\pi$.\n$\\!\\int_0^\\pi\\!\\!\\int_0^{\\pi/6}\\!\\!\\int_0^1\\rho\\cos\\phi\\cdot\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta=\\pi\\cdot\\dfrac{1}{8}\\cdot\\dfrac{1}{4}=\\dfrac{\\pi}{32}$."
  }),
  build({
    num: 15, subject: "다변수함수", unit: "중적분", concept: "평행사변형·변수치환", difficulty: "medium",
    question: "네 직선 $2x+y=0,\\,2x+y=2,\\,3x-y=1,\\,3x-y=4$로 둘러싸인 평행사변형 $R$에서 $\\!\\displaystyle\\iint_R\\dfrac{2x+y}{(3x-y)^2}dA=\\dfrac{a}{b}$이면 $a+b$는? (단, $a,b$는 서로소인 자연수)",
    options: [o("1","$13$"), o("2","$14$"), o("3","$15$"), o("4","$16$"), o("5","$17$")],
    answer: 1,
    explanation: "$u=2x+y,\\,v=3x-y$: $|J|=5$.\n$\\dfrac{1}{5}\\!\\int_1^4\\!\\!\\int_0^2\\dfrac{u}{v^2}du\\,dv=\\dfrac{1}{5}\\cdot 2\\cdot(1-1/4)\\cdot\\dotsb=\\dfrac{3}{10}$.\n$a=3,b=10$. 합 $=13$."
  }),
  build({
    num: 16, subject: "공학수학", unit: "미분방정식", concept: "2계 비선형(DGR)", difficulty: "mediumHard",
    question: "미분방정식 $yy''+(y+1)(y')^2=0$의 해가 $y(0)=1,\\,y'(0)=2$를 만족할 때 $y\\!\\left(\\dfrac{e}{2}\\right)$의 값은?",
    options: [o("1","$2$"), o("2","$4$"), o("3","$6$"), o("4","$8$"), o("5","$10$")],
    answer: 1,
    explanation: "$\\dfrac{y''}{y'}+y'+\\dfrac{y'}{y}=0$. 적분: $\\ln y'+y+\\ln y=C$. $y(0)=1,y'(0)=2$: $C=1+\\ln 2$.\n$yy'=2e^{1-y}$ ⇒ $ye^y dy=2e\\,dx$. 적분: $ye^y-e^y=2ex+C'$. 초기값 $C'=0$.\n$x=e/2$: $ye^y-e^y=e^2$ ⇒ $y=2$ 검증."
  }),
  build({
    num: 17, subject: "공학수학", unit: "미분방정식", concept: "동차 미방", difficulty: "medium",
    question: "미분방정식 $(y+\\sqrt{x^2+y^2})dx-xdy=0$의 해가 $y(1)=0$을 만족할 때 $y(2)$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$1$"), o("3","$\\dfrac{3}{2}$"), o("4","$2$"), o("5","$\\dfrac{5}{2}$")],
    answer: 3,
    explanation: "동차형 $u=y/x$. 변수분리 ⇒ $\\sinh^{-1}u=\\ln x+C$. $y(1)=0$: $C=0$.\n$y=x\\sinh(\\ln x)=\\dfrac{1}{2}(x^2-1)$. $y(2)=\\dfrac{3}{2}$."
  }),
  build({
    num: 18, subject: "공학수학", unit: "미분방정식", concept: "적분인수·완전미방", difficulty: "mediumHard",
    question: "미분방정식 $2\\sin(y^2)dx+xy\\cos(y^2)dy=0$의 해 $y(x)$에 대해 $y(1)=\\sqrt{\\pi/2}$를 만족할 때 $\\sin(y^2)(2)$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$\\dfrac{1}{4}$"), o("3","$\\dfrac{1}{8}$"), o("4","$\\dfrac{1}{16}$"), o("5","$\\dfrac{1}{32}$")],
    answer: 4,
    explanation: "적분인수 $x^3$ 곱: $2x^3\\sin(y^2)dx+x^4 y\\cos(y^2)dy=0$ 완전.\n해: $\\dfrac{x^4}{2}\\sin(y^2)=C$. $y(1)=\\sqrt{\\pi/2}$, $\\sin(\\pi/2)=1$: $C=1/2$.\n$x=2$: $8\\sin(y^2)=1/2$ ⇒ $\\sin(y^2)=1/16$."
  }),
  build({
    num: 19, subject: "공학수학", unit: "미분방정식", concept: "1계 선형(고차계수)", difficulty: "mediumHard",
    question: "미분방정식 $(x^2+1)y'+4xy=x$의 해가 $y(2)=1$을 만족할 때 $y(4)=\\dfrac{a}{b}$이면 $b-3a$의 값은?",
    options: [o("1","$-16$"), o("2","$-8$"), o("3","$0$"), o("4","$8$"), o("5","$16$")],
    answer: 5,
    explanation: "$y'+\\dfrac{4x}{x^2+1}y=\\dfrac{x}{x^2+1}$. 적분인자 $(x^2+1)^2$.\n해: $y=\\dfrac{1}{(x^2+1)^2}\\!\\left(\\dfrac{x^4}{4}+\\dfrac{x^2}{2}+C\\right)$. $y(2)=1$: $C=19$.\n$y(4)=\\dfrac{64+8+19}{289}=\\dfrac{91}{289}$. $a=91,b=289$. $b-3a=289-273=16$."
  }),
  build({
    num: 20, subject: "공학수학", unit: "미분방정식", concept: "2계 비제차 특수해", difficulty: "mediumHard",
    question: "미분방정식 $y''-2y'-3y=2e^x-10\\sin x$의 해가 $y(0)=2,\\,y'(0)=4$를 만족할 때 $y(\\pi)=\\dfrac{1}{2}e^{-\\pi}(ae^{4\\pi}+b+ce^{2\\pi})+d$이면 $abcd$의 값은?",
    options: [o("1","$-24$"), o("2","$-12$"), o("3","$0$"), o("4","$12$"), o("5","$24$")],
    answer: 2,
    explanation: "$y_p=-\\dfrac{1}{2}e^x+2\\sin x-\\cos x$. $y_c=Ae^{3x}+Be^{-x}$.\n초기값: $A=3/2,B=2$. $y(\\pi)$ 계산: $a=3,b=4,c=-1,d=1$. $abcd=-12$."
  }),
  build({
    num: 21, subject: "공학수학", unit: "미분방정식", concept: "코시-오일러", difficulty: "mediumHard",
    question: "$y=x^2(a\\sin(3\\ln x)+b\\cos(3\\ln x))$가 $y(1)=-1,\\,y'(1)=1$을 만족하고 미분방정식 $x^2 y''+cxy'+dy=0$의 해일 때 $a+b+c+d$의 값은?",
    options: [o("1","$4$"), o("2","$6$"), o("3","$8$"), o("4","$10$"), o("5","$12$")],
    answer: 4,
    explanation: "보조: $r^2+(c-1)r+d=0$ 해 $r=2\\pm 3i$. $c-1=-4$ ⇒ $c=-3$. $d=4+9=13$.\n$y(1)=b=-1$. $y'(1)=2b+3a=1$ ⇒ $a=1$. 합 $=1-1-3+13=10$."
  }),
  build({
    num: 22, subject: "공학수학", unit: "라플라스변환", concept: "초깃값 정리", difficulty: "easy",
    question: "라플라스변환이 $F(s)=\\mathcal{L}\\{f(t)\\}=\\dfrac{3s^2+7s+6}{(s+1)(s^2+4s+5)}$인 함수 $f(t)$에 대하여 $f(0)$의 값은?",
    options: [o("1","$-3$"), o("2","$-1$"), o("3","$0$"), o("4","$1$"), o("5","$3$")],
    answer: 5,
    explanation: "$f(0)=\\!\\lim_{s\\to\\infty}sF(s)=\\!\\lim\\dfrac{3s^3}{s^3}=3$."
  }),
  build({
    num: 23, subject: "공학수학", unit: "라플라스변환", concept: "라플라스 변환 표현(매개변수)", difficulty: "medium",
    question: "함수 $f(t)=e^{-t}t\\cos 2t\\;(t\\ge 0)$의 라플라스변환이 $\\mathcal{L}\\{f(t)\\}=\\dfrac{(s-a)^b+c}{((s-a)^b+d)^e}$일 때 $a+b+c+d+e$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 3,
    explanation: "$\\mathcal{L}\\{t\\cos 2t\\}=\\dfrac{s^2-4}{(s^2+4)^2}$. 이동 $s\\to s+1$: $\\dfrac{(s+1)^2-4}{((s+1)^2+4)^2}$.\n$a=-1,b=2,c=-4,d=4,e=2$. 합 $=3$."
  }),
  build({
    num: 24, subject: "선형대수", unit: "행렬", concept: "직교행렬 명제 판정", difficulty: "medium",
    question: "직교행렬 $Q$에 관한 다음 명제 중 거짓인 것은?\n\nㄱ. $\\mathbb R^n$의 모든 $\\vec x$에 대하여 $\\|Q\\vec x\\|=\\|\\vec x\\|$.\nㄴ. $\\det Q=1$이다.\nㄷ. $Q^{-1}$은 직교행렬이다.\nㄹ. $\\lambda$가 $Q$의 고유값이면 $|\\lambda|=1$이다.\nㅁ. $Q$의 행벡터들은 정규직교집합이다.",
    options: [o("1","ㄱ"), o("2","ㄴ"), o("3","ㄷ"), o("4","ㄹ"), o("5","ㅁ")],
    answer: 2,
    explanation: "ㄴ 거짓: $\\det Q=\\pm 1$. 나머지는 모두 직교행렬의 기본 성질."
  }),
  build({
    num: 25, subject: "선형대수", unit: "행렬", concept: "행렬식 선형성·행 연산", difficulty: "medium",
    question: "네 행렬 $A=\\!\\begin{pmatrix}a&b&c\\\\ d&e&f\\\\ g&h&i\\end{pmatrix},\\;P=\\!\\begin{pmatrix}a&b&c\\\\ d&e&f\\\\ 5g&5h&5i\\end{pmatrix},\\;Q=\\!\\begin{pmatrix}a&b&c\\\\ g&h&i\\\\ d&e&f\\end{pmatrix},\\;R=\\!\\begin{pmatrix}a&b&c\\\\ 2d+a&2e+b&2f+c\\\\ g&h&i\\end{pmatrix}$에 대하여 $\\det A=7$일 때 $\\det P+\\det Q+\\det R$의 값은?",
    options: [o("1","$42$"), o("2","$44$"), o("3","$46$"), o("4","$48$"), o("5","$50$")],
    answer: 1,
    explanation: "$\\det P=5\\det A=35$. $\\det Q=-\\det A=-7$. $\\det R=2\\det A=14$.\n합 $=35-7+14=42$."
  }),
  build({
    num: 26, subject: "선형대수", unit: "행렬", concept: "고유공간 기저", difficulty: "medium",
    question: "행렬 $A=\\!\\begin{pmatrix}-2&2&-3\\\\2&1&-6\\\\-1&-2&0\\end{pmatrix}$에 대하여 고유값 $\\lambda=-3$에 대응되는 고유공간을 $\\text{span}\\!\\left\\{\\!\\begin{pmatrix}-a\\\\1\\\\0\\end{pmatrix},\\!\\begin{pmatrix}b\\\\0\\\\1\\end{pmatrix}\\right\\}$이라 할 때 $a+b$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 5,
    explanation: "$A+3I$ 영공간 = 고유공간. 행 축약 ⇒ $x+2y-3z=0$.\n$(-a,1,0)$ 대입: $-a+2=0$ ⇒ $a=2$. $(b,0,1)$: $b-3=0$ ⇒ $b=3$.\n합 $=5$."
  }),
  build({
    num: 27, subject: "선형대수", unit: "행렬", concept: "LU분해·기본행렬", difficulty: "mediumHard",
    question: "행렬 $A=\\!\\begin{pmatrix}2&1&3\\\\4&-1&3\\\\-2&5&5\\end{pmatrix}$의 $LU$ 분해를 구하는 과정에서 $E_3 E_2 E_1 A=U$를 만족하는 기본행렬 $E_1,E_2,E_3$와 하삼각행렬 $L$, 상삼각행렬 $U$로 옳지 않은 것은?",
    options: [
      o("1","$E_1=\\!\\begin{pmatrix}1&0&0\\\\-2&1&0\\\\0&0&1\\end{pmatrix}$"),
      o("2","$E_2=\\!\\begin{pmatrix}1&0&0\\\\0&1&0\\\\1&0&1\\end{pmatrix}$"),
      o("3","$E_3=\\!\\begin{pmatrix}1&0&0\\\\0&1&0\\\\0&2&1\\end{pmatrix}$"),
      o("4","$L=\\!\\begin{pmatrix}1&0&0\\\\2&1&0\\\\1&-2&1\\end{pmatrix}$"),
      o("5","$U=\\!\\begin{pmatrix}2&1&3\\\\0&-3&-3\\\\0&0&2\\end{pmatrix}$")
    ],
    answer: 4,
    explanation: "$L=(E_3 E_2 E_1)^{-1}=E_1^{-1}E_2^{-1}E_3^{-1}=\\!\\begin{pmatrix}1&0&0\\\\2&1&0\\\\-1&-2&1\\end{pmatrix}$. 보기 (4)는 부호가 다름."
  }),
  build({
    num: 28, subject: "선형대수", unit: "연립방정식", concept: "비자명해 조건", difficulty: "medium",
    question: "연립일차방정식 $\\begin{cases}x_1+kx_2=1\\\\ x_2+kx_3=1\\\\ x_3+kx_4=1\\\\ x_4+kx_1=1\\end{cases}$의 해가 존재하지 않도록 하는 $k$의 값은?",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$0$"), o("4","$1$"), o("5","$2$")],
    answer: 2,
    explanation: "네 식 합: $(1+k)(x_1+x_2+x_3+x_4)=4$. $k=-1$이면 좌변 $=0\\ne 4$ ⇒ 해 없음."
  }),
  build({
    num: 29, subject: "선형대수", unit: "벡터", concept: "최소제곱해", difficulty: "medium",
    question: "$A=\\!\\begin{pmatrix}4&0\\\\0&2\\\\1&1\\end{pmatrix},\\;\\vec b=\\!\\begin{pmatrix}2\\\\0\\\\11\\end{pmatrix}$일 때 해를 가지지 않는 방정식 $A\\vec x=\\vec b$에 대한 최소제곱해를 $\\vec x=\\!\\begin{pmatrix}a\\\\b\\end{pmatrix}$라 하면 $b-a$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 1,
    explanation: "정규방정식 $A^T A\\vec x=A^T\\vec b$: $\\!\\begin{pmatrix}17&1\\\\1&5\\end{pmatrix}\\!\\begin{pmatrix}a\\\\b\\end{pmatrix}=\\!\\begin{pmatrix}19\\\\11\\end{pmatrix}$.\n해: $a=1,b=2$. $b-a=1$."
  }),
  build({
    num: 30, subject: "선형대수", unit: "행렬", concept: "행렬 거듭제곱(고유분해)", difficulty: "mediumHard",
    question: "$A=\\!\\begin{pmatrix}4&-3\\\\-1&2\\end{pmatrix},\\;\\vec x=\\!\\begin{pmatrix}5\\\\1\\end{pmatrix}$에 대해 $A^{100}\\vec x=\\!\\begin{pmatrix}a+b\\cdot c^{100}\\\\ a-c^{100}\\end{pmatrix}$이라 할 때 $abc$의 값은?",
    options: [o("1","$10$"), o("2","$20$"), o("3","$30$"), o("4","$40$"), o("5","$50$")],
    answer: 3,
    explanation: "고유값 $1,5$, 고유벡터 $(1,1),(3,-1)$.\n$(5,1)=2(1,1)+(3,-1)$. $A^{100}(5,1)=2(1,1)+5^{100}(3,-1)=(2+3\\cdot 5^{100},\\,2-5^{100})$.\n$a=2,b=3,c=5$. $abc=30$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 경희대):`, data.map((d) => d.id).join(", "));
