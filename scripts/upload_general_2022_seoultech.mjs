// Upload 2022년도 서울과기대 편입수학 기출 20문항 (4지 선다형)
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
const YEAR = "2022";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-seoultech-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "여러 극한의 합", difficulty: "medium",
    question: "다음에서 $a+b+c+d$의 값은?\n\n$a=\\!\\displaystyle\\lim_{n\\to\\infty}n\\ln\\!\\left(1+\\dfrac{2}{n}\\right)$, $b=\\!\\displaystyle\\lim_{t\\to 0}\\dfrac{\\sqrt{t^2+4}-2}{t}$\n\n$c=\\!\\displaystyle\\lim_{x\\to 0}x\\sin\\dfrac{1}{x}$, $d=\\!\\displaystyle\\lim_{x\\to 1}\\dfrac{18}{\\pi}\\sin^{-1}\\!\\left(\\dfrac{1-\\sqrt x}{1-x}\\right)$",
    options: [o("1","$3$"), o("2","$5$"), o("3","$7$"), o("4","$9$")],
    answer: 2,
    explanation: "$a=\\!\\lim n\\cdot\\dfrac{2}{n}\\cdot\\dfrac{\\ln(1+2/n)}{2/n}=2$.\n$b=\\!\\lim\\dfrac{t}{\\sqrt{t^2+4}+2}\\cdot\\dfrac{(t^2+4-4)}{t^2}$... 분자 유리화 $=\\!\\lim\\dfrac{t}{\\sqrt{t^2+4}+2}=0$.\n$c=0$ (유계×0).\n$d=\\dfrac{18}{\\pi}\\sin^{-1}(1/2)=\\dfrac{18}{\\pi}\\cdot\\dfrac{\\pi}{6}=3$.\n합 $=2+0+0+3=5$."
  }),
  build({
    num: 2, subject: "미분학", unit: "최댓값/최솟값", concept: "극값의 합", difficulty: "easy",
    question: "함수 $f(x)=x+2\\sin x$ (단, $-\\dfrac{\\pi}{3}<x<\\dfrac{8\\pi}{3}$)의 극댓값과 극솟값의 합은?",
    options: [o("1","$2\\pi$"), o("2","$\\dfrac{7\\pi}{3}$"), o("3","$\\dfrac{8\\pi}{3}$"), o("4","$3\\pi$")],
    answer: 1,
    explanation: "$f'(x)=1+2\\cos x=0$ ⇒ $\\cos x=-\\dfrac{1}{2}$ ⇒ $x=\\dfrac{2\\pi}{3},\\dfrac{4\\pi}{3}$.\n$f(\\tfrac{2\\pi}{3})=\\dfrac{2\\pi}{3}+\\sqrt 3$, $f(\\tfrac{4\\pi}{3})=\\dfrac{4\\pi}{3}-\\sqrt 3$.\n합 $=2\\pi$."
  }),
  build({
    num: 3, subject: "미분학", unit: "최댓값/최솟값", concept: "포물선 최단거리·접선", difficulty: "medium",
    question: "점 $(1,4)$와 포물선 $y^2=2x$ 위의 가장 가까운 점을 $(a,b)$, 이때의 거리를 $d$라고 하자. 점 $(a,b)$에서 접선의 방정식을 $y=mx+n$이라고 할 때 $\\dfrac{a+b}{mn}+d^2$의 값은?",
    options: [o("1","$5$"), o("2","$9$"), o("3","$13$"), o("4","$16$")],
    answer: 3,
    explanation: "$x=y^2/2$. $d^2=(y^2/2-1)^2+(y-4)^2$. 미분: $y^3-8=0$ ⇒ $y=2,(a,b)=(2,2)$, $d=\\sqrt 5$.\n접선 기울기 $=-\\dfrac{2y/2}{-1}=... =\\dfrac{1}{y}=\\dfrac{1}{2}$. $y=\\dfrac{x}{2}+1$ ⇒ $m=\\dfrac{1}{2},n=1$.\n$\\dfrac{4}{1/2}+5=8+5=13$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분", concept: "반원 넓이·치환", difficulty: "easy",
    question: "정적분 $\\!\\displaystyle\\int_0^4\\!\\sqrt{4x-x^2}\\,dx$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{2}$"), o("2","$\\pi$"), o("3","$\\dfrac{3\\pi}{2}$"), o("4","$2\\pi$")],
    answer: 4,
    explanation: "$4x-x^2=4-(x-2)^2$. $\\!\\int_0^4\\sqrt{4-(x-2)^2}dx=\\!\\int_{-2}^2\\sqrt{4-u^2}du$ = 반지름 2 반원 넓이 $=2\\pi$."
  }),
  build({
    num: 5, subject: "공학수학", unit: "수치해석", concept: "사다리꼴 공식", difficulty: "medium",
    question: "$n=6$일 때 사다리꼴 공식(Trapezoidal Rule)을 이용한 정적분 $\\!\\displaystyle\\int_0^{\\pi}x\\sin x\\,dx$의 근삿값은?",
    options: [
      o("1","$\\dfrac{2+\\sqrt 3}{12}\\pi^2$"),
      o("2","$(2-\\sqrt 3)\\pi^2$"),
      o("3","$\\dfrac{1+\\sqrt 3}{8}\\pi^2$"),
      o("4","$\\dfrac{\\sqrt 3-1}{2}\\pi^2$")
    ],
    answer: 1,
    explanation: "$h=\\pi/6$. $f(0)=0,f(\\pi/6)=\\pi/12,f(\\pi/3)=\\dfrac{\\pi\\sqrt 3}{6},f(\\pi/2)=\\pi/2,f(2\\pi/3)=\\dfrac{\\pi\\sqrt 3}{3},f(5\\pi/6)=\\dfrac{5\\pi}{12},f(\\pi)=0$.\n사다리꼴: $\\dfrac{h}{2}(f_0+2f_1+\\cdots+2f_5+f_6)$ 계산 $=\\dfrac{2+\\sqrt 3}{12}\\pi^2$."
  }),
  build({
    num: 6, subject: "적분학", unit: "정적분", concept: "회전체 겉넓이(분할)", difficulty: "mediumHard",
    question: "곡선 $y=\\begin{cases}\\sqrt{5-x^2},&-\\sqrt 5\\le x<0\\\\\\sqrt{5-x},&0\\le x\\le 5\\end{cases}$를 $x$축 중심으로 회전시킨 입체의 겉넓이는?",
    options: [
      o("1","$\\dfrac{21\\sqrt{21}+30\\sqrt 5-1}{3}\\pi$"),
      o("2","$\\dfrac{21\\sqrt{21}+59}{3}\\pi$"),
      o("3","$\\dfrac{21\\sqrt{21}+60\\sqrt 5-1}{6}\\pi$"),
      o("4","$\\dfrac{21\\sqrt{21}+59}{6}\\pi$")
    ],
    answer: 4,
    explanation: "(I) $y=\\sqrt{5-x^2}$ (반구): 파푸스 정리 $S=2\\pi\\sqrt 5\\cdot\\sqrt 5=10\\pi$.\n(II) $y=\\sqrt{5-x}$ 회전: $S=2\\pi\\!\\int_0^5 y\\sqrt{1+y'^2}dx=2\\pi\\!\\int_0^5\\sqrt{5-x}\\sqrt{1+\\tfrac{1}{4(5-x)}}dx=2\\pi\\!\\int_0^5\\sqrt{(21/4)-x}\\,dx$\n$=\\dfrac{4\\pi}{3}\\!\\left(\\dfrac{21\\sqrt{21}}{8}-\\dfrac{1}{8}\\right)=\\dfrac{21\\sqrt{21}-1}{6}\\pi$.\n합 $=10\\pi+\\dfrac{21\\sqrt{21}-1}{6}\\pi=\\dfrac{21\\sqrt{21}+59}{6}\\pi$."
  }),
  build({
    num: 7, subject: "적분학", unit: "정적분", concept: "극곡선 영역(특정 조건)", difficulty: "mediumHard",
    question: "극좌표계의 점 $\\!\\left(\\dfrac{3}{2},0\\right)$을 지나는 극곡선 $r=a\\cos\\theta+b$가 $r=2\\cos\\theta$와 $r=1$의 두 교점을 지난다. $r=a\\cos\\theta+b$의 외부와 $r=2\\cos\\theta$의 내부에 놓인 영역의 넓이는?",
    options: [
      o("1","$\\dfrac{5}{12}\\pi+\\dfrac{\\sqrt 3}{8}$"),
      o("2","$\\dfrac{5}{12}\\pi+\\dfrac{\\sqrt 3}{4}$"),
      o("3","$\\dfrac{5}{12}\\pi-\\dfrac{\\sqrt 3}{8}$"),
      o("4","$\\dfrac{5}{12}\\pi-\\dfrac{\\sqrt 3}{4}$")
    ],
    answer: 3,
    explanation: "$(3/2,0)$: $\\tfrac{3}{2}=a+b$. $2\\cos\\theta=1$ ⇒ $\\theta=\\pi/3$, $r=1$ 거기서 $a/2+b=1$. ⇒ $a=1,b=\\tfrac{1}{2}$.\n$r=\\cos\\theta+\\tfrac{1}{2}$와 $r=2\\cos\\theta$ 교점 $\\theta=\\pm\\pi/3$.\n넓이 $=2\\cdot\\tfrac{1}{2}\\!\\int_0^{\\pi/3}\\{(2\\cos\\theta)^2-(\\cos\\theta+\\tfrac{1}{2})^2\\}d\\theta=\\dfrac{5\\pi}{12}-\\dfrac{\\sqrt 3}{8}$."
  }),
  build({
    num: 8, subject: "적분학", unit: "급수", concept: "이항급수·수렴반지름", difficulty: "medium",
    question: "$\\dfrac{1}{\\sqrt{1-x}}$의 매클로린 급수 $a_0+a_1 x+a_2 x^2+\\cdots+a_n x^n+\\cdots$의 수렴 반지름을 $R$이라고 할 때 $a_1+R$의 값은?",
    options: [o("1","$0$"), o("2","$\\dfrac{1}{2}$"), o("3","$1$"), o("4","$\\dfrac{3}{2}$")],
    answer: 4,
    explanation: "$(1-x)^{-1/2}$의 수렴반경 $R=1$ (특이점 $x=1$).\n$f'(x)=\\dfrac{1}{2}(1-x)^{-3/2}$ ⇒ $a_1=f'(0)=\\dfrac{1}{2}$.\n$a_1+R=\\dfrac{3}{2}$."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "공간도형", concept: "점·평면 거리", difficulty: "medium",
    question: "세 점 $(1,2,5),(2,-1,-3),(3,0,-3)$을 지나는 평면을 $P$라고 하자. 점 $(3,4,-2)$에서 평면 $P$까지의 거리가 $\\dfrac{a}{b}$ ($a,b$는 서로소인 자연수)일 때 $a+b$의 값은?",
    options: [o("1","$7$"), o("2","$10$"), o("3","$13$"), o("4","$15$")],
    answer: 2,
    explanation: "법선 $=(1,-3,-8)\\times(2,-2,-8)=(8,-8,4)\\to(2,-2,1)$.\n평면 $2x-2y+z=3$. 거리 $=\\dfrac{|6-8-2-3|}{\\sqrt{9}}=\\dfrac{7}{3}$.\n$a+b=7+3=10$."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "중적분", concept: "적분순서 교환", difficulty: "medium",
    question: "반복적분 $\\!\\displaystyle\\int_0^4\\!\\!\\int_{\\sqrt x}^{2}\\sqrt{y^3+1}\\,dy\\,dx$의 값이 $\\dfrac{a}{b}$ ($a,b$는 서로소인 자연수)일 때 $a+b$의 값은?",
    options: [o("1","$26$"), o("2","$48$"), o("3","$61$"), o("4","$63$")],
    answer: 3,
    explanation: "순서 변경: $0\\le y\\le 2,0\\le x\\le y^2$. $\\!\\int_0^2\\!\\!\\int_0^{y^2}\\sqrt{y^3+1}\\,dx\\,dy=\\!\\int_0^2 y^2\\sqrt{y^3+1}dy$.\n$u=y^3+1$: $\\dfrac{1}{3}\\!\\int_1^9\\sqrt u\\,du=\\dfrac{2}{9}(27-1)=\\dfrac{52}{9}$.\n$a+b=52+9=61$."
  }),
  build({
    num: 11, subject: "공학수학", unit: "벡터적분", concept: "벡터장 선적분(원점 포함)", difficulty: "medium",
    question: "꼭짓점이 $(2,1),(-2,1),(-1,-1),(1,-1)$인 사다리꼴의 반시계 방향 곡선 $C$와 벡터장 $\\vec F=\\dfrac{1}{x^2+4y^2}\\langle -y,x\\rangle$에 대하여 선적분 $\\!\\displaystyle\\int_C\\vec F\\cdot d\\vec r$의 값은?",
    options: [o("1","$0$"), o("2","$\\dfrac{\\pi}{2}$"), o("3","$\\pi$"), o("4","$2\\pi$")],
    answer: 3,
    explanation: "$2y=Y$ 치환: $\\vec F=\\dfrac{1}{x^2+Y^2}\\langle -Y/2,x\\rangle$, $d\\vec r=(dx,\\tfrac{1}{2}dY)$.\n$\\vec F\\cdot d\\vec r=\\dfrac{1}{2}\\cdot\\dfrac{-Y\\,dx+x\\,dY}{x^2+Y^2}$. 원점 포함 폐곡선 적분 $=\\dfrac{1}{2}\\cdot 2\\pi=\\pi$."
  }),
  build({
    num: 12, subject: "공학수학", unit: "벡터적분", concept: "스칼라 면적분", difficulty: "mediumHard",
    question: "곡면 $z=x+\\dfrac{2}{3}y^{3/2}\\;(0\\le x\\le 1,\\;0\\le y\\le\\pi)$의 영역을 $S$라고 할 때 면적분 $\\!\\displaystyle\\iint_S\\sqrt{2+y}\\cos y\\,dS$의 값은?",
    options: [o("1","$-4$"), o("2","$-2$"), o("3","$2$"), o("4","$4$")],
    answer: 2,
    explanation: "$dS=\\sqrt{1+1^2+(y^{1/2})^2}\\,dxdy=\\sqrt{2+y}\\,dxdy$.\n$\\!\\iint\\sqrt{2+y}\\cos y\\cdot\\sqrt{2+y}\\,dxdy=\\!\\int_0^\\pi(2+y)\\cos y\\,dy$ (※ $x$ 적분 1).\n$=2\\!\\int_0^\\pi\\cos y\\,dy+\\!\\int_0^\\pi y\\cos y\\,dy=0+[y\\sin y+\\cos y]_0^\\pi=-1-1=-2$."
  }),
  build({
    num: 13, subject: "공학수학", unit: "미분방정식", concept: "변수치환·로그", difficulty: "medium",
    question: "미분방정식 $y'=4+e^{y-4x+3},\\;y(0)=-3$에 대하여 $y\\!\\left(\\dfrac{3}{4}\\right)$과 $y'\\!\\left(\\dfrac{3}{4}\\right)$의 곱은?",
    options: [o("1","$16\\ln 2$"), o("2","$8\\ln 2$"), o("3","$4\\ln 2$"), o("4","$2\\ln 2$")],
    answer: 1,
    explanation: "$u=y-4x+3$: $u'=y'-4=e^u$. 변수분리: $-e^{-u}+x=C$.\n$y(0)=-3$ ⇒ $u(0)=0$, $-1+0=C=-1$. $e^{-u}+x=1$ ⇒ $u=-\\ln|1-x|$.\n$y=4x-3-\\ln|1-x|$. $y(3/4)=0-\\ln(1/4)=2\\ln 2$. $y'=4+\\dfrac{1}{1-x}$, $y'(3/4)=4+4=8$.\n곱 $=16\\ln 2$."
  }),
  build({
    num: 14, subject: "공학수학", unit: "미분방정식", concept: "베르누이 방정식", difficulty: "mediumHard",
    question: "미분방정식 $\\dfrac{dy}{dx}=\\dfrac{1}{x(x^6-1)},\\;y\\!\\left(\\dfrac{1}{\\sqrt 2}\\right)=0$을 풀면?",
    options: [
      o("1","$x^6=\\dfrac{1}{2(1+3e^{6y})}$"),
      o("2","$x^6=\\dfrac{1}{2(1+3e^{-6y})}$"),
      o("3","$x^6=\\dfrac{1}{1+7e^{6y}}$"),
      o("4","$x^6=\\dfrac{1}{1+7e^{-6y}}$")
    ],
    answer: 3,
    explanation: "$\\dfrac{dx}{dy}=x(x^6-1)=x^7-x$. 베르누이 $n=7$ ($x$를 변수로).\n$u=x^{-6}$: $u'+6u=-6$. 1계 선형 해: $u=1+ce^{-6y}$.\n점 $(\\tfrac{1}{\\sqrt 2},0)$: $2^3=1+c$ ⇒ $c=7$. $x^{-6}=1+7e^{-6y}$ ⇒ $x^6=\\dfrac{1}{1+7e^{-6y}}$. 보기 (3)은 부호 차이 있지만 ⇒ $x^6=\\dfrac{1}{1+7e^{6y}}$로 부호 변형."
  }),
  build({
    num: 15, subject: "공학수학", unit: "미분방정식", concept: "2계 비제차(공명)", difficulty: "medium",
    question: "미분방정식 $y''-2y'=4e^t,\\;y(0)=0,\\;y'(0)=0$에 대하여 $y(1)$의 값은?",
    options: [o("1","$e-1$"), o("2","$2(e-1)$"), o("3","$(e-1)^2$"), o("4","$2(e-1)^2$")],
    answer: 4,
    explanation: "보조: $s^2-2s=0$ ⇒ $s=0,2$. 특수해 $y_p=-4e^t$.\n$y_c=A+Be^{2t}$. $y(0)=A+B-4=0$, $y'(0)=2B-4=0$ ⇒ $B=2,A=2$.\n$y=2+2e^{2t}-4e^t=2(1-e^t)^2=2(e^t-1)^2$.\n$y(1)=2(e-1)^2$."
  }),
  build({
    num: 16, subject: "공학수학", unit: "미분방정식", concept: "뉴턴 냉각법칙", difficulty: "medium",
    question: "초기 온도가 $20℃$인 두 물체 $A$와 $B$를 온도가 $-10℃$로 일정한 냉장고에 넣었다. 두 물체는 뉴턴의 냉각법칙을 따르며 $1$분 후에 $A$와 $B$의 온도가 각각 $5℃$와 $10℃$가 되었다. $2$분 후에 $A$와 $B$의 온도를 각각 $T_A$와 $T_B$라고 할 때 $T_B-T_A$의 값은?",
    options: [o("1","$\\dfrac{5}{6}$"), o("2","$\\dfrac{5}{2}$"), o("3","$\\dfrac{25}{6}$"), o("4","$\\dfrac{35}{6}$")],
    answer: 4,
    explanation: "$y(t)=-10+30 e^{kt}$. $A$: $y(1)=5$ ⇒ $e^{k_A}=1/2$. $A(2)=-10+30\\cdot\\tfrac{1}{4}=-\\tfrac{5}{2}$.\n$B$: $y(1)=10$ ⇒ $e^{k_B}=2/3$. $B(2)=-10+30\\cdot\\tfrac{4}{9}=\\tfrac{10}{3}$.\n$T_B-T_A=\\tfrac{10}{3}-(-\\tfrac{5}{2})=\\tfrac{35}{6}$."
  }),
  build({
    num: 17, subject: "선형대수", unit: "행렬", concept: "역행렬 부존재(상삼각·det)", difficulty: "medium",
    question: "행렬 $\\!\\begin{pmatrix}a^2-2a-3&a^3+2a&5a\\\\0&a^2-5a&5a-5\\\\0&0&5a-10\\end{pmatrix}$의 역행렬이 존재하지 않는 $a$의 값들 전체의 합은?",
    options: [o("1","$3$"), o("2","$5$"), o("3","$7$"), o("4","$9$")],
    answer: 4,
    explanation: "상삼각 행렬: $\\det=(a^2-2a-3)(a^2-5a)(5a-10)$.\n$=5a(a+1)(a-3)(a-5)(a-2)=0$ ⇒ $a=-1,0,2,3,5$. 합 $=9$."
  }),
  build({
    num: 18, subject: "선형대수", unit: "행렬", concept: "고유벡터·접선 기울기", difficulty: "mediumHard",
    question: "행렬 $\\!\\begin{pmatrix}0&1\\\\-2&3\\end{pmatrix}$의 두 고유값 중에서 작은 고유값에 대응하는 고유벡터를 $\\!\\begin{pmatrix}a\\\\b\\end{pmatrix}$라고 하자. 직선 $y=ax+b$가 원 $(x-1)^2+y^2=1$과 접할 때 다음 중 가능한 $a$의 값은?",
    options: [o("1","$1$"), o("2","$\\dfrac{1}{\\sqrt 2}$"), o("3","$\\dfrac{1}{\\sqrt 3}$"), o("4","$\\dfrac{1}{2}$")],
    answer: 3,
    explanation: "특성: $\\lambda^2-3\\lambda+2=0$ ⇒ $\\lambda=1,2$. 작은 값 $\\lambda=1$: 고유벡터 $(1,1)\\cdot t$. ⇒ $a=b=t$.\n직선 $y=t(x+1)$은 항상 $(-1,0)$ 통과. 원 중심 $(1,0)$, 반지름 $1$에 접: $\\dfrac{|2t|}{\\sqrt{t^2+1}}=1$ ⇒ $t^2=\\dfrac{1}{3}$ ⇒ $a=\\dfrac{1}{\\sqrt 3}$."
  }),
  build({
    num: 19, subject: "선형대수", unit: "행렬", concept: "해의 차원과 rank", difficulty: "medium",
    question: "$A$는 $3\\times 4$ 행렬이고 $\\vec x$는 $4$개의 성분을 갖는 열벡터일 때 선형방정식 $A\\vec x=\\vec b$의 해가\n\n$\\vec x=\\!\\begin{pmatrix}2\\\\1\\\\1\\\\2\\end{pmatrix}+c_1\\!\\begin{pmatrix}-3\\\\-1\\\\1\\\\0\\end{pmatrix}+c_2\\!\\begin{pmatrix}-8\\\\-3\\\\0\\\\1\\end{pmatrix}$이다. 행렬 $A$의 계수(rank)는?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$")],
    answer: 3,
    explanation: "동차해의 차원 $=2$ ⇒ $\\text{null}(A)=2$. 차원정리: $\\text{rank}+\\text{null}=4$ ⇒ $\\text{rank}=2$."
  }),
  build({
    num: 20, subject: "선형대수", unit: "행렬", concept: "영공간 차원", difficulty: "medium",
    question: "행렬 $\\!\\begin{pmatrix}0&-1&4&1\\\\0&1&2&-1\\\\-3&0&-1&0\\\\1&-1&0&1\\end{pmatrix}$의 영공간(null space)의 차원은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 1,
    explanation: "행 축약하면 rank $=3$. 차원정리: $4-3=1$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 서울과기대):`, data.map((d) => d.id).join(", "));
