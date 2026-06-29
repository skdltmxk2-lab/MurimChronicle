// Upload 2021년도 경희대 편입수학 기출 30문항 (5지 선다형, 90분)
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
const YEAR = "2021";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-kyunghee-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "두 극한 합·로피탈", difficulty: "easy",
    question: "$\\!\\displaystyle\\lim_{x\\to 0}2x\\cot 3x+\\!\\displaystyle\\lim_{x\\to 5}\\dfrac{4\\sin(x-5)}{3x^2-18x+15}$의 값은?",
    options: [o("1","$\\dfrac{2}{3}$"), o("2","$1$"), o("3","$\\dfrac{4}{3}$"), o("4","$\\dfrac{5}{3}$"), o("5","$2$")],
    answer: 2,
    explanation: "① $\\!\\lim\\dfrac{2x}{\\tan 3x}=\\!\\lim\\dfrac{3x}{\\tan 3x}\\cdot\\dfrac{2}{3}=\\dfrac{2}{3}$.\n② 로피탈: $\\!\\lim\\dfrac{4\\cos(x-5)}{6x-18}=\\dfrac{4}{12}=\\dfrac{1}{3}$.\n합 $=1$."
  }),
  build({
    num: 2, subject: "미분학", unit: "극한과 연속", concept: "유리함수 점근선", difficulty: "easy",
    question: "$x\\in[0,\\infty)$일 때 곡선 $y=\\dfrac{3x^2}{x^2-1}$의 수직점근선과 수평점근선을 각각 $x=\\alpha,\\;y=\\beta$라 하면 $\\alpha-\\beta$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$-1$"), o("4","$2$"), o("5","$-2$")],
    answer: 5,
    explanation: "수직: $x^2-1=0$, $x\\ge 0$이므로 $x=1$ ⇒ $\\alpha=1$.\n수평: $\\!\\lim_{x\\to\\infty}\\dfrac{3x^2}{x^2-1}=3$ ⇒ $\\beta=3$.\n$\\alpha-\\beta=-2$."
  }),
  build({
    num: 3, subject: "적분학", unit: "급수", concept: "테일러 급수 특정 계수", difficulty: "medium",
    question: "$f(x)=\\dfrac{3}{x}$을 중심이 $-2$인 테일러 급수로 나타낼 때 $(x+2)^2$항의 계수는?",
    options: [o("1","$\\dfrac{3}{4}$"), o("2","$-\\dfrac{3}{4}$"), o("3","$\\dfrac{3}{8}$"), o("4","$-\\dfrac{3}{8}$"), o("5","$-\\dfrac{5}{16}$")],
    answer: 4,
    explanation: "$(x+2)^2$ 계수 $=\\dfrac{f''(-2)}{2!}$. $f'(x)=-\\dfrac{3}{x^2},\\;f''(x)=\\dfrac{6}{x^3}$.\n$f''(-2)=\\dfrac{6}{-8}=-\\dfrac{3}{4}$. 계수 $=\\dfrac{-3/4}{2}=-\\dfrac{3}{8}$."
  }),
  build({
    num: 4, subject: "미분학", unit: "도함수", concept: "참 명제 판정", difficulty: "medium",
    question: "다음 중 참인 명제는?",
    options: [
      o("1","$\\!\\lim_{n\\to\\infty}a_n=0$이면 급수 $\\!\\sum_{n=1}^{\\infty}a_n$은 수렴한다."),
      o("2","급수 $\\!\\sum_{n=1}^{\\infty}\\dfrac{1}{n^p}$은 $p\\ge 1$이면 수렴한다."),
      o("3","방정식 $x^3+x-1=0$은 단 한 개의 실근을 갖는다."),
      o("4","함수의 극댓값은 극솟값보다 크거나 같다."),
      o("5","$\\!\\int_1^{\\infty}\\dfrac{1}{x}dx$는 수렴한다.")
    ],
    answer: 3,
    explanation: "(3) $f(x)=x^3+x-1$, $f'=3x^2+1>0$ ⇒ 증가, $f(-\\infty)=-\\infty,\\,f(\\infty)=\\infty$ ⇒ 정확히 한 번 $x$축과 만남.\n(1) 조화급수 반례.\n(2) $p>1$일 때만 수렴.\n(4) $y=x+1/x$ 반례.\n(5) $\\ln x$ 발산."
  }),
  build({
    num: 5, subject: "적분학", unit: "정적분", concept: "접촉원(곡률반지름)", difficulty: "medium",
    question: "포물선 $y=\\dfrac{x^2}{4}+2$ 위의 점 $(0,2)$에서 접촉원의 방정식을 $x^2+y^2+ax+by+c=0$ ($a,b,c$는 실수)이라 할 때 $a+b+c$의 값은?",
    options: [o("1","$2$"), o("2","$4$"), o("3","$6$"), o("4","$8$"), o("5","$10$")],
    answer: 2,
    explanation: "$(0,2)$에서 곡률 $\\kappa=\\dfrac{1}{2}$ (계산: $y'=\\tfrac{x}{2},y''=\\tfrac{1}{2}$, $\\kappa=\\dfrac{|y''|}{(1+y'^2)^{3/2}}=\\dfrac{1}{2}$).\n반경 $r=2$, 중심 $(0,4)$ ($y$축 위, 위쪽).\n원: $x^2+(y-4)^2=4$ ⇒ $x^2+y^2-8y+12=0$.\n$a=0,b=-8,c=12$, 합 $=4$."
  }),
  build({
    num: 6, subject: "다변수함수", unit: "편미분", concept: "원판영역 최대/최소", difficulty: "medium",
    question: "영역 $R=\\{(x,y)\\in\\mathbb R^2|\\,x\\ge 0,\\,y\\ge 0,\\,x^2+y^2\\le 25\\}$에서 함수 $f(x,y)=2x^2+3y^2-8x-5$의 최댓값을 $\\alpha$, 최솟값을 $\\beta$라 할 때 $\\alpha+6\\beta$의 값은?",
    options: [o("1","$0$"), o("2","$2$"), o("3","$-2$"), o("4","$8$"), o("5","$-8$")],
    answer: 5,
    explanation: "임계: $f_x=4x-8=0,\\,f_y=6y=0$ ⇒ $(2,0)$, $f=-13$.\n경계 1: $y=0,\\,0\\le x\\le 5$, $f=2x^2-8x-5=2(x-2)^2-13$, 최대 $f(5)=5$, 최소 $f(2)=-13$.\n경계 2: $x^2+y^2=25$ ($y\\ge 0,x\\ge 0$), $f=-x^2-8x+70$, $x\\in[0,5]$, 최대 $f(0)=70$, 최소 $f(5)=5$.\n경계 3: $x=0$: $f=3y^2-5$, 최대 $f(5)=70$, 최소 $f(0)=-5$.\n총 최대 $\\alpha=70$, 최소 $\\beta=-13$. $\\alpha+6\\beta=70-78=-8$."
  }),
  build({
    num: 7, subject: "적분학", unit: "정적분", concept: "리만합·정적분 변환", difficulty: "medium",
    question: "$\\!\\displaystyle\\lim_{n\\to\\infty}\\!\\left(\\dfrac{8}{n}+\\dfrac{8n}{n^2+1}+\\dfrac{8n}{n^2+4}+\\dfrac{8n}{n^2+9}+\\cdots+\\dfrac{8n}{2n^2-2n+1}\\right)$의 값은?",
    options: [o("1","$\\pi$"), o("2","$2\\pi$"), o("3","$3\\pi$"), o("4","$4\\pi$"), o("5","$5\\pi$")],
    answer: 2,
    explanation: "$=\\!\\lim\\!\\sum_{k=0}^{n-1}\\dfrac{8n}{n^2+k^2}=\\!\\lim\\!\\sum\\dfrac{8}{1+(k/n)^2}\\cdot\\dfrac{1}{n}=\\!\\int_0^1\\dfrac{8}{1+x^2}dx=8\\cdot\\dfrac{\\pi}{4}=2\\pi$."
  }),
  build({
    num: 8, subject: "다변수함수", unit: "편미분", concept: "이변수 혼합편미분", difficulty: "medium",
    question: "2변수 함수 $f(x,y)=\\begin{cases}\\dfrac{xy(x^2-y^2)}{x^2+y^2},&(x,y)\\ne(0,0)\\\\ 0,&(x,y)=(0,0)\\end{cases}$에 대해 $\\dfrac{\\partial}{\\partial y}\\!\\left(\\dfrac{\\partial f}{\\partial x}\\right)(0,0)+3\\dfrac{\\partial}{\\partial x}\\!\\left(\\dfrac{\\partial f}{\\partial y}\\right)(0,0)$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$-1$"), o("4","$2$"), o("5","$-2$")],
    answer: 4,
    explanation: "$f_{xy}(0,0)=-1$, $f_{yx}(0,0)=1$ (혼합편미분 불일치 경우의 고전 예).\n$-1+3\\cdot 1=2$."
  }),
  build({
    num: 9, subject: "적분학", unit: "정적분", concept: "쉘 회전체 부피", difficulty: "medium",
    question: "$xy$평면에서 $y=2\\sqrt x,\\;y=0,\\;x=2$로 둘러싸인 영역을 $x=-2$ 둘레로 회전시킬 때 생기는 입체의 부피는?",
    options: [
      o("1","$\\dfrac{84}{5}\\pi$"),
      o("2","$\\dfrac{84\\sqrt 2}{5}\\pi$"),
      o("3","$\\dfrac{254}{15}\\pi$"),
      o("4","$\\dfrac{254\\sqrt 2}{15}\\pi$"),
      o("5","$\\dfrac{256\\sqrt 2}{15}\\pi$")
    ],
    answer: 5,
    explanation: "쉘 방법, 회전축 $x=-2$, 반지름 $x+2$: $V=2\\pi\\!\\int_0^2(x+2)(2\\sqrt x)dx=2\\pi\\!\\int_0^2(2x\\sqrt x+4\\sqrt x)dx$\n$=2\\pi\\!\\left[\\dfrac{4}{5}x^{5/2}+\\dfrac{8}{3}x^{3/2}\\right]_0^2=2\\pi\\!\\left(\\dfrac{16\\sqrt 2}{5}+\\dfrac{16\\sqrt 2}{3}\\right)=2\\pi\\cdot\\dfrac{128\\sqrt 2}{15}=\\dfrac{256\\sqrt 2}{15}\\pi$."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "최댓값/최솟값", concept: "구속 최단거리(구·평면)", difficulty: "medium",
    question: "함수 $f(x,y,z)=(x-1)^2+(y-3)^2+(z-5)^2$에 대해 조건 $x-y+z=5$를 만족하는 점 $(x,y,z)$ 중에 $f(x,y,z)$가 최소가 되는 점을 $(a,b,c)$라 할 때 $a+b$의 값은?",
    options: [o("1","$0$"), o("2","$2$"), o("3","$4$"), o("4","$6$"), o("5","$8$")],
    answer: 3,
    explanation: "법선 $(1,-1,1)$ 방향으로 중심 $(1,3,5)$에서 평면까지 거리.\n매개변수 직선: $(1+t,3-t,5+t)$ 평면 대입: $(1+t)-(3-t)+(5+t)=3+3t=5$ ⇒ $t=2/3$.\n점 $(5/3,7/3,17/3)$. $a+b=4$."
  }),
  build({
    num: 11, subject: "적분학", unit: "급수", concept: "멱급수 수렴구간", difficulty: "medium",
    question: "급수 $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-1)^n(5x-1)^n}{n\\cdot 3^n}$의 수렴 구간은?",
    options: [
      o("1","$\\!\\left[-\\dfrac{2}{3},\\dfrac{4}{3}\\right)$"),
      o("2","$\\!\\left[-\\dfrac{2}{3},\\dfrac{4}{3}\\right]$"),
      o("3","$\\!\\left[-\\dfrac{2}{5},\\dfrac{4}{5}\\right)$"),
      o("4","$\\!\\left(-\\dfrac{2}{5},\\dfrac{4}{5}\\right]$"),
      o("5","$\\!\\left[-\\dfrac{2}{7},\\dfrac{4}{7}\\right)$")
    ],
    answer: 4,
    explanation: "$|5x-1|<3$ ⇒ $-\\dfrac{2}{5}<x<\\dfrac{4}{5}$.\n$x=-2/5$: $(5x-1)=-3$, $\\!\\sum\\dfrac{(-1)^n(-3)^n}{n\\cdot 3^n}=\\!\\sum\\dfrac{1}{n}$ 발산.\n$x=4/5$: $(5x-1)=3$, $\\!\\sum\\dfrac{(-1)^n}{n}$ 교대 수렴.\n수렴구간 $\\!\\left(-\\dfrac{2}{5},\\dfrac{4}{5}\\right]$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "중적분", concept: "적분순서 교환", difficulty: "medium",
    question: "$\\!\\displaystyle\\int_0^{\\sqrt\\pi}\\!\\int_y^{\\sqrt\\pi}\\cos(2x^2)dx\\,dy$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$-1$"), o("4","$2$"), o("5","$-2$")],
    answer: 1,
    explanation: "순서변경: $0\\le y\\le x,\\,0\\le x\\le\\sqrt\\pi$.\n$\\!\\int_0^{\\sqrt\\pi}x\\cos(2x^2)dx=\\dfrac{1}{4}[\\sin(2x^2)]_0^{\\sqrt\\pi}=\\dfrac{1}{4}\\sin 2\\pi=0$."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "중적분", concept: "타원 영역 이중적분(치환)", difficulty: "mediumHard",
    question: "영역 $R=\\{(x,y)\\in\\mathbb R^2|\\,x\\ge 0,\\,y\\ge 0,\\,16x^2+9y^2\\le 1\\}$에 대해 적분 $\\!\\displaystyle\\iint_R\\sin(16x^2+9y^2)\\,dA$의 값은?",
    options: [
      o("1","$\\dfrac{\\pi}{48}(1-\\cos 1)$"),
      o("2","$\\dfrac{\\pi}{48}(\\cos 1-1)$"),
      o("3","$\\dfrac{\\pi}{24}(1-\\cos 1)$"),
      o("4","$\\dfrac{\\pi}{24}(\\cos 1-1)$"),
      o("5","$\\dfrac{\\pi}{12}(2-\\cos 1)$")
    ],
    answer: 1,
    explanation: "$x=u/4,\\,y=v/3$ 치환: $|J|=1/12$. 영역 $u^2+v^2\\le 1$의 1사분면.\n$=\\dfrac{1}{12}\\!\\int_0^{\\pi/2}\\!\\!\\int_0^1\\sin(r^2)r\\,dr\\,d\\theta=\\dfrac{1}{12}\\cdot\\dfrac{\\pi}{2}\\cdot\\dfrac{1-\\cos 1}{2}=\\dfrac{\\pi}{48}(1-\\cos 1)$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "편미분", concept: "삼각형 영역 최대값", difficulty: "medium",
    question: "세 꼭짓점이 $(1,0),(4,0),(1,3)$인 폐삼각형 영역 $D$에서 함수 $f(x,y)=6+xy-2x-2y$의 최댓값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 4,
    explanation: "임계점 $f_x=y-2=0,\\,f_y=x-2=0$ ⇒ $(2,2)$ ($D$ 내부).\n빗변 $y=-x+4$: $f(x,-x+4)=-(x-2)^2+2$, 최대 $f(2,2)=2$.\n변 $y=0$: $f=6-2x$, 최대 $f(1,0)=4$. 변 $x=1$: $f=4-y$, 최대 $f(1,0)=4$.\n최댓값 $=4$."
  }),
  build({
    num: 15, subject: "공학수학", unit: "미분방정식", concept: "완전미방", difficulty: "medium",
    question: "미분방정식 $(y^3\\cos x-y\\sin x)dx+(3y^2\\sin x+\\cos x)dy=0$의 해 $y(x)$에 대해 $y(0)=1$일 때 $\\!\\left(y\\!\\left(\\dfrac{\\pi}{2}\\right)\\right)^3$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$-1$"), o("4","$2$"), o("5","$-2$")],
    answer: 2,
    explanation: "$M_y=3y^2\\cos x-\\sin x=N_x$ ⇒ 완전.\n해: $y^3\\sin x+y\\cos x=C$. $y(0)=1$: $0+1=1=C$.\n$x=\\pi/2$: $y^3\\cdot 1+y\\cdot 0=1$ ⇒ $y^3=1$."
  }),
  build({
    num: 16, subject: "공학수학", unit: "미분방정식", concept: "연립 1계 ODE", difficulty: "mediumHard",
    question: "미분방정식 $y_1'=2y_1+y_2,\\;y_2'=y_1+2y_2$의 해 $y_1(x),y_2(x)$에 대해 $y_1(0)=1,\\,y_2(0)=3$일 때 $y_1(1)+y_2(1)$의 값은?",
    options: [o("1","$e$"), o("2","$2e$"), o("3","$4e$"), o("4","$2e^3$"), o("5","$4e^3$")],
    answer: 5,
    explanation: "$u=y_1+y_2$: $u'=3y_1+3y_2=3u$. $u(0)=4$ ⇒ $u(x)=4e^{3x}$.\n$u(1)=4e^3$."
  }),
  build({
    num: 17, subject: "공학수학", unit: "미분방정식", concept: "1계 선형미방", difficulty: "medium",
    question: "미분방정식 $y'+\\dfrac{x}{\\sqrt{x^2+1}}y=2xe^{-\\sqrt{x^2+1}}$의 해 $y(x)$에 대해 $y(0)=0$일 때 $y(\\sqrt 3)$의 값은?",
    options: [o("1","$\\dfrac{1}{e^2}$"), o("2","$\\dfrac{3}{e^2}$"), o("3","$e^2$"), o("4","$3e^2$"), o("5","$3$")],
    answer: 2,
    explanation: "적분인자 $e^{\\sqrt{x^2+1}}$. $(e^{\\sqrt{x^2+1}}y)'=2x$ ⇒ $e^{\\sqrt{x^2+1}}y=x^2+C$.\n$y(0)=0$: $0=0+C\\cdot e^{-1}$... $C=0$. $y=x^2 e^{-\\sqrt{x^2+1}}$.\n$y(\\sqrt 3)=3e^{-2}$."
  }),
  build({
    num: 18, subject: "공학수학", unit: "미분방정식", concept: "적분방정식·라플라스", difficulty: "mediumHard",
    question: "방정식 $\\dfrac{dy}{dt}=1-2\\!\\int_0^t y(\\tau)d\\tau$의 해 $y(t)$에 대해 $y(0)=2$일 때 $y\\!\\left(\\dfrac{\\pi}{2\\sqrt 2}\\right)$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$\\dfrac{\\sqrt 2}{2}$"), o("4","$\\sqrt 2$"), o("5","$2\\sqrt 2$")],
    answer: 3,
    explanation: "라플라스: $sY-2=\\dfrac{1}{s}-\\dfrac{2Y}{s}$ ⇒ $(s^2+2)Y=2s+1$.\n$Y=\\dfrac{2s}{s^2+2}+\\dfrac{1}{\\sqrt 2}\\dfrac{\\sqrt 2}{s^2+2}$ ⇒ $y=2\\cos\\sqrt 2 t+\\dfrac{1}{\\sqrt 2}\\sin\\sqrt 2 t$.\n$t=\\pi/(2\\sqrt 2)$: $2\\cos(\\pi/2)+\\dfrac{1}{\\sqrt 2}\\sin(\\pi/2)=\\dfrac{1}{\\sqrt 2}=\\dfrac{\\sqrt 2}{2}$."
  }),
  build({
    num: 19, subject: "공학수학", unit: "미분방정식", concept: "코시-오일러 3계", difficulty: "mediumHard",
    question: "$y=c_1 x^2+x^2(c_2\\cos(\\sqrt 3\\ln x)+c_3\\sin(\\sqrt 3\\ln x))$가 미분방정식 $x^3 y'''+ax^2 y''+bxy'+cy=0$ ($a,b,c$는 실수)의 일반해일 때 $a-b-c$의 값은?",
    options: [o("1","$1$"), o("2","$-1$"), o("3","$2$"), o("4","$-2$"), o("5","$3$")],
    answer: 1,
    explanation: "보조: $r(r-1)(r-2)+ar(r-1)+br+c=0$. 근 $r=2,\\,2\\pm\\sqrt 3 i$.\n$(r-2)(r^2-4r+7)=r^3-6r^2+15r-14$ vs $r^3+(a-3)r^2+(b-a+2)r+c$.\n$a-3=-6$ ⇒ $a=-3$. $b-a+2=15$ ⇒ $b=10$. $c=-14$.\n$a-b-c=-3-10+14=1$."
  }),
  build({
    num: 20, subject: "공학수학", unit: "라플라스변환", concept: "역라플라스·부분분수", difficulty: "mediumHard",
    question: "$f(t)=\\mathcal{L}^{-1}\\!\\left\\{\\dfrac{32}{s^4(s^4-16)}\\right\\}=c_1\\sinh c_2 t+c_3\\sin c_4 t+c_5 t^{c_6}$일 때 $c_1 c_2+c_3 c_4+c_5 c_6$의 값은?",
    options: [o("1","$1$"), o("2","$-1$"), o("3","$2$"), o("4","$6$"), o("5","$-6$")],
    answer: 2,
    explanation: "$\\dfrac{32}{s^4(s^4-16)}=\\dfrac{2}{s^2-4}\\cdot\\dfrac{1}{(s^2+4)}\\cdot\\dotsb$ 부분분수 분해.\n결과: $\\dfrac{1}{8}\\sinh 2t-\\dfrac{1}{8}\\sin 2t-\\dfrac{1}{3}t^3$.\n$c_1c_2+c_3c_4+c_5c_6=\\dfrac{1}{4}-\\dfrac{1}{4}-1=-1$."
  }),
  build({
    num: 21, subject: "공학수학", unit: "미분방정식", concept: "2계 비제차 공명", difficulty: "mediumHard",
    question: "미분방정식 $y''-8y'+16y=12xe^{4x}$의 해 $y(x)$에 대해 $y(0)=0,\\,y'(0)=1$일 때 $y(1)$의 값은?",
    options: [o("1","$e^4$"), o("2","$2e^4$"), o("3","$3e^4$"), o("4","$6e^4$"), o("5","$8e^4$")],
    answer: 3,
    explanation: "특성: $(s-4)^2=0$. $y_p=2x^3 e^{4x}$ (2차 공명).\n$y_c=(c_1+c_2 x)e^{4x}$. $y(0)=c_1=0,\\,y'(0)=c_2=1$.\n$y=xe^{4x}+2x^3 e^{4x}$. $y(1)=e^4+2e^4=3e^4$."
  }),
  build({
    num: 22, subject: "공학수학", unit: "라플라스변환", concept: "이상적분·라플라스 응용", difficulty: "medium",
    question: "$\\!\\displaystyle\\int_0^{\\infty}te^{-t}\\sin 3t\\,dt$의 값은?",
    options: [o("1","$0.02$"), o("2","$0.03$"), o("3","$0.04$"), o("4","$0.05$"), o("5","$0.06$")],
    answer: 5,
    explanation: "$=\\mathcal{L}\\{t\\sin 3t\\}(s=1)=\\dfrac{6s}{(s^2+9)^2}\\bigg|_{s=1}=\\dfrac{6}{100}=0.06$."
  }),
  build({
    num: 23, subject: "다변수함수", unit: "공간도형", concept: "직선·평면 수직", difficulty: "medium",
    question: "$\\mathbb R^3$에서 두 점 $(3,1,4),(a,0,b)$를 지나는 직선이 세 점 $(0,0,0),(1,2,1),(5,4,3)$을 포함하는 평면에 수직일 때 $b-a$의 값은?",
    options: [o("1","$-1$"), o("2","$1$"), o("3","$3$"), o("4","$5$"), o("5","$7$")],
    answer: 4,
    explanation: "직선 방향벡터 $(3-a,1,4-b)$. 평면 법선벡터 $(1,2,1)\\times(5,4,3)=(2,2,-6)\\to(1,1,-3)$.\n평행: $(3-a,1,4-b)=k(1,1,-3)$ ⇒ $k=1,a=2,b=7$.\n$b-a=5$."
  }),
  build({
    num: 24, subject: "선형대수", unit: "연립방정식", concept: "해 존재 조건(매개변수)", difficulty: "medium",
    question: "연립일차방정식 $\\begin{cases}x+y+z=a^2\\\\ x+2y+3z=a^4\\\\ 3x+5y+7z=3\\end{cases}$의 해가 존재하도록 하는 정수 $a$의 개수는?",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개"), o("5","$4$개")],
    answer: 3,
    explanation: "확대행렬 행 축약: $\\text{rank}(A)=\\text{rank}(A|B)$.\n$3-3a^2-2a^4+2a^2=0$ ⇒ $-2a^4-a^2+3=0$ ⇒ $(2a^2+3)(a^2-1)=0$ ⇒ $a=\\pm 1$.\n정수 2개."
  }),
  build({
    num: 25, subject: "선형대수", unit: "벡터", concept: "선형변환 표준행렬", difficulty: "medium",
    question: "세 벡터 $u_1=\\!\\begin{pmatrix}1\\\\0\\\\1\\end{pmatrix},u_2=\\!\\begin{pmatrix}1\\\\1\\\\0\\end{pmatrix},u_3=\\!\\begin{pmatrix}0\\\\1\\\\1\\end{pmatrix}$에 대해 $\\mathbb R^3$에서 $\\mathbb R^2$로의 선형변환 $T$가 $T(u_1)=\\!\\begin{pmatrix}2\\\\3\\end{pmatrix},\\,T(u_2)=\\!\\begin{pmatrix}4\\\\-2\\end{pmatrix},\\,T(u_3)=\\!\\begin{pmatrix}-6\\\\1\\end{pmatrix}$일 때 $T$의 표준행렬의 모든 성분의 합은?",
    options: [o("1","$1$"), o("2","$-1$"), o("3","$2$"), o("4","$-2$"), o("5","$3$")],
    answer: 1,
    explanation: "$T(u_1+u_2+u_3)=T(2,2,2)^T=(0,2)^T$. $T(1,1,1)^T=(0,1)^T$.\n표준행렬 각 행의 합 $=(0,1)$, 전체 합 $=1$."
  }),
  build({
    num: 26, subject: "선형대수", unit: "행렬", concept: "행렬 거듭제곱 극한", difficulty: "mediumHard",
    question: "$A=\\!\\begin{pmatrix}\\dfrac{20}{41}&\\dfrac{21}{41}\\\\\\dfrac{21}{41}&\\dfrac{20}{41}\\end{pmatrix},\\;X=\\!\\begin{pmatrix}2\\\\1\\end{pmatrix}$에 대해 $\\!\\displaystyle\\lim_{n\\to\\infty}A^n X=\\!\\begin{pmatrix}a\\\\b\\end{pmatrix}$일 때 $a-b$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$-1$"), o("4","$2$"), o("5","$-2$")],
    answer: 1,
    explanation: "$A$의 고유값: $\\lambda=1,\\,-\\dfrac{1}{41}$. $|\\lambda|<1$ 성분 사라짐.\n$X=\\dfrac{3}{2}(1,1)^T+\\dfrac{1}{2}(1,-1)^T$.\n$\\!\\lim A^n X=\\dfrac{3}{2}(1,1)^T=(\\tfrac{3}{2},\\tfrac{3}{2})^T$.\n$a-b=0$."
  }),
  build({
    num: 27, subject: "선형대수", unit: "벡터", concept: "정사영(평면 위로)", difficulty: "medium",
    question: "$\\mathbb R^3$의 부분공간 $W=\\{(x,y,z)^T|\\,2x-z=0\\}$ 위로의 $y=(3,2,1)^T$의 정사영이 $(a,b,c)^T$일 때 $a+b+c$의 값은?",
    options: [o("1","$5$"), o("2","$10$"), o("3","$\\sqrt 5$"), o("4","$2\\sqrt 5$"), o("5","$5\\sqrt 2$")],
    answer: 1,
    explanation: "법선 $\\vec n=(2,0,-1)/\\sqrt 5$. $y$의 $\\vec n$ 방향 성분 $=\\dfrac{(3,2,1)\\cdot(2,0,-1)}{5}(2,0,-1)=(2,0,-1)$.\n$W$ 위 정사영 $=(3,2,1)-(2,0,-1)=(1,2,2)$. 합 $=5$."
  }),
  build({
    num: 28, subject: "선형대수", unit: "행렬", concept: "영공간 최대 차원", difficulty: "medium",
    question: "$5\\times 3$ 행렬 $A$의 영공간이 가질 수 있는 가장 큰 차원을 $a$라 하고 $6\\times 10$ 행렬 $B$의 영공간이 가질 수 있는 가장 큰 차원을 $b$라 할 때 $a+b$의 값은? (단, $A$와 $B$가 영행렬은 아니다.)",
    options: [o("1","$6$"), o("2","$7$"), o("3","$9$"), o("4","$11$"), o("5","$12$")],
    answer: 4,
    explanation: "$A$: 정의역 차원 3, 최소 rank 1 (영행렬 아님) ⇒ $\\text{null}\\le 2$. $a=2$.\n$B$: 정의역 차원 10, 최소 rank 1 ⇒ $\\text{null}\\le 9$. $b=9$.\n$a+b=11$."
  }),
  build({
    num: 29, subject: "선형대수", unit: "행렬", concept: "행렬식 합(고유값)", difficulty: "medium",
    question: "두 행렬 $A=\\!\\begin{pmatrix}2&1&1&1\\\\1&2&1&1\\\\1&1&2&1\\\\1&1&1&2\\end{pmatrix},\\;B=\\!\\begin{pmatrix}0&1&1&1\\\\1&0&1&1\\\\1&1&0&1\\\\1&1&1&0\\end{pmatrix}$에 대해 $\\det A+\\det B$의 값은?",
    options: [o("1","$0$"), o("2","$2$"), o("3","$-2$"), o("4","$4$"), o("5","$-4$")],
    answer: 2,
    explanation: "$A=J+I$ ($J$=모두 1 행렬). 고유값: 5,1,1,1. $\\det A=5$.\n$B=J-I$. 고유값: 3,-1,-1,-1. $\\det B=-3$.\n합 $=2$."
  }),
  build({
    num: 30, subject: "선형대수", unit: "행렬", concept: "고유값 곱(상삼각화)", difficulty: "medium",
    question: "$A=\\!\\begin{pmatrix}1&0&0&1\\\\0&2&0&0\\\\0&0&-1&0\\\\1&0&0&-2\\end{pmatrix}$의 네 고유값을 $\\lambda_1,\\lambda_2,\\lambda_3,\\lambda_4$라 할 때 네 고유값의 곱 $\\lambda_1\\lambda_2\\lambda_3\\lambda_4$의 값은?",
    options: [o("1","$2$"), o("2","$4$"), o("3","$-4$"), o("4","$6$"), o("5","$-6$")],
    answer: 4,
    explanation: "$\\lambda_1\\lambda_2\\lambda_3\\lambda_4=\\det A$. $R_4-R_1$ 후 상삼각: 대각 $1,2,-1,-3$. $\\det=6$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 경희대):`, data.map((d) => d.id).join(", "));
