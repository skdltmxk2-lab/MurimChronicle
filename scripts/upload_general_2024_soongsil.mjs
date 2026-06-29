// Upload 2024년도 숭실대 편입수학 기출 25문항 (4지 선다, 90분, 원본 26~50번)
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

const SCHOOL = "숭실대";
const YEAR = "2024";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-soongsil-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "로피탈 정리", difficulty: "easy",
    question: "극한값 $\\!\\displaystyle\\lim_{x\\to 1}\\dfrac{\\ln x}{1-x}$을 구하면?",
    options: [o("1","$-1$"), o("2","$0$"), o("3","$1$"), o("4","$e$")],
    answer: 1,
    explanation: "$0/0$꼴이므로 로피탈: $\\!\\lim_{x\\to 1}\\dfrac{1/x}{-1}=-1$."
  }),
  build({
    num: 2, subject: "적분학", unit: "급수", concept: "수렴반경(비판정)", difficulty: "easy",
    question: "급수 $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-2)^n x^n}{\\sqrt[3]{n+1}}$의 수렴반경을 구하면?",
    options: [o("1","$\\dfrac{1}{4}$"), o("2","$\\dfrac{1}{2}$"), o("3","$1$"), o("4","$2$")],
    answer: 2,
    explanation: "비판정: $\\!\\lim\\!\\left|\\dfrac{(-2)^{n+1}}{(-2)^n}\\right|=2$, $R=1/2$."
  }),
  build({
    num: 3, subject: "미분학", unit: "도함수", concept: "직선·삼차곡선 교점 조건", difficulty: "mediumHard",
    question: "직선 $y=6x+k$가 곡선 $y=3x^3$과 $2$개 이상의 교점을 갖는다고 할 때, 이를 만족하는 $k$의 가장 큰 값과 가장 작은 값을 곱하면?",
    options: [
      o("1","$-\\dfrac{32}{3}$"),
      o("2","$-\\dfrac{16}{3}$"),
      o("3","$-\\dfrac{8}{3}$"),
      o("4","$-\\dfrac{4}{3}$")
    ],
    answer: 1,
    explanation: "$3x^3-6x=k$, $f(x)=3x^3-6x$의 극값.\n$f'(x)=9x^2-6$ ⇒ $x=\\pm\\sqrt{6}/3$.\n$f$ 극값 $\\pm 4\\sqrt 6/3$.\n$k$ 범위 $-4\\sqrt 6/3\\le k\\le 4\\sqrt 6/3$, 곱 $-32/3$."
  }),
  build({
    num: 4, subject: "미분학", unit: "역함수", concept: "역함수 미분", difficulty: "easy",
    question: "$f(x)=1+2x+x^3+e^x$일 때, $(f^{-1})'(2)$를 구하면?",
    options: [
      o("1","$\\dfrac{1}{2}$"),
      o("2","$\\dfrac{1}{3}$"),
      o("3","$\\dfrac{1}{4}$"),
      o("4","$\\dfrac{1}{5}$")
    ],
    answer: 2,
    explanation: "$f(0)=2$. $f'(x)=2+3x^2+e^x$, $f'(0)=3$.\n$(f^{-1})'(2)=1/3$."
  }),
  build({
    num: 5, subject: "다변수함수", unit: "연쇄법칙", concept: "합성 연쇄법칙", difficulty: "easy",
    question: "$y=\\tan u$이고, $u=v-\\dfrac{1}{v}$, $v=\\ln x$일 때, $x=e$에서 $\\dfrac{dy}{dx}$를 구하면?",
    options: [
      o("1","$\\dfrac{1}{2e}$"),
      o("2","$\\dfrac{1}{e}$"),
      o("3","$\\dfrac{2}{e}$"),
      o("4","$1$")
    ],
    answer: 3,
    explanation: "$\\dfrac{dy}{dx}=\\sec^2 u\\cdot(1+1/v^2)\\cdot(1/x)$.\n$x=e$: $v=1$, $u=0$. $\\sec^2 0=1$, $1+1=2$, $1/e$.\n$=2/e$."
  }),
  build({
    num: 6, subject: "적분학", unit: "정적분", concept: "치환을 통한 정적분", difficulty: "easy",
    question: "함수 $f$는 모든 실수구간에서 연속이고, $F'(x)=f(x)$를 만족할 때, $\\!\\displaystyle\\int_1^3 f(3x)\\,dx$의 값을 구하면?",
    options: [
      o("1","$\\dfrac{1}{3}(F(3)-F(1))$"),
      o("2","$\\dfrac{1}{3}(F(9)-F(3))$"),
      o("3","$3(F(3)-F(1))$"),
      o("4","$3(F(9)-F(3))$")
    ],
    answer: 2,
    explanation: "$u=3x$ 치환, $du=3dx$.\n$\\!\\int_1^3 f(3x)dx=\\dfrac{1}{3}\\!\\int_3^9 f(u)du=\\dfrac{1}{3}(F(9)-F(3))$."
  }),
  build({
    num: 7, subject: "적분학", unit: "급수", concept: "급수 수렴/발산", difficulty: "medium",
    question: "다음 급수의 수렴, 발산을 올바르게 고른 것은?\n\n(가) $\\!\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{\\sqrt{n+1}}{\\sqrt[3]{n^3-1}}$\n(나) $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n+2}{n^2+2}\\sin\\dfrac{n\\pi}{2}$",
    options: [
      o("1","(가): 수렴, (나): 수렴"),
      o("2","(가): 수렴, (나): 발산"),
      o("3","(가): 발산, (나): 수렴"),
      o("4","(가): 발산, (나): 발산")
    ],
    answer: 3,
    explanation: "(가) $\\sim n^{1/2}/n=1/n^{1/2}$, 발산($p=1/2<1$).\n(나) $\\sim\\dfrac{1}{n}\\sin\\!\\frac{n\\pi}{2}$, $\\sin$ 유계 + $1/n\\to 0$, 디리클레로 수렴."
  }),
  build({
    num: 8, subject: "미분학", unit: "극한과 연속", concept: "극한 명제", difficulty: "medium",
    question: "다음 중 항상 참인 것을 모두 고르면?\n\n(가) $\\!\\displaystyle\\lim_{x\\to 3}f(x)=5$이고 $\\!\\displaystyle\\lim_{x\\to 3}g(x)=0$이면, $\\!\\displaystyle\\lim_{x\\to 3}[f(x)/g(x)]$는 존재하지 않는다.\n(나) $\\!\\displaystyle\\lim_{x\\to a}f(x)$와 $\\!\\displaystyle\\lim_{x\\to a}g(x)$ 둘 다 존재하지 않으면, $\\!\\displaystyle\\lim_{x\\to a}[f(x)+g(x)]$도 존재하지 않는다.\n(다) $\\!\\displaystyle\\lim_{x\\to a}f(x)$가 존재하고 $\\!\\displaystyle\\lim_{x\\to a}g(x)$가 존재하지 않으면, $\\!\\displaystyle\\lim_{x\\to a}[f(x)+g(x)]$는 존재하지 않는다.\n(라) $\\!\\displaystyle\\lim_{x\\to 3}[f(x)g(x)]$가 존재하면, 이 극한값은 $f(3)g(3)$과 같다.",
    options: [
      o("1","(가),(나)"),
      o("2","(가),(다)"),
      o("3","(다),(라)"),
      o("4","(가),(다),(라)")
    ],
    answer: 2,
    explanation: "(가) 참: $0$이 아닌 값/$0$ 형태.\n(나) 거짓: $f=1/x$, $g=-1/x$.\n(다) 참: 만약 존재한다면 $g$ 수렴하므로 모순.\n(라) 거짓: 함숫값과 극한값은 다를 수 있다(불연속)."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "음함수 미분", concept: "음함수·법선과 곡선 교점", difficulty: "mediumHard",
    question: "$x^2-xy+y^2=3$인 곡선 $C$ 위의 점 $A(1,-1)$에서의 접선과 수직인 직선이 만나는 곡선 $C$ 위의 다른 점 $B$가 있을 때, 선분 $\\overline{AB}$의 길이를 구하면?",
    options: [o("1","$\\sqrt 2$"), o("2","$2\\sqrt 2$"), o("3","$3\\sqrt 2$"), o("4","$4\\sqrt 2$")],
    answer: 2,
    explanation: "$\\dfrac{dy}{dx}=-\\dfrac{2x-y}{2y-x}|_{(1,-1)}=1$.\n법선 기울기 $-1$, 법선 $y=-x$.\n곡선 $x^2-x(-x)+x^2=3$ ⇒ $3x^2=3$, $x=\\pm 1$.\n$B=(-1,1)$, $\\overline{AB}=\\sqrt{4+4}=2\\sqrt 2$."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "편미분", concept: "합성 편미분", difficulty: "mediumHard",
    question: "미분가능한 함수 $g(u,v)$에 대하여 $\\dfrac{\\partial g}{\\partial u}(0,v)=\\sqrt v$, $\\dfrac{\\partial g}{\\partial v}(0,v)=\\sqrt v-1$이라고 할 때, 함수 $f(x,y)=g(y\\cos x+e^x,4y^2)$에 대하여 $\\dfrac{\\partial f}{\\partial y}(0,-1)$을 구하면?",
    options: [o("1","$-6$"), o("2","$-2$"), o("3","$10$"), o("4","$34$")],
    answer: 1,
    explanation: "$u=y\\cos x+e^x$, $v=4y^2$.\n$f_y=g_u\\cdot\\cos x+g_v\\cdot 8y$.\n$(x,y)=(0,-1)$: $u=0$, $v=4$.\n$g_u(0,4)=2$, $g_v(0,4)=1$.\n$f_y=2\\cdot 1+1\\cdot(-8)=-6$."
  }),
  build({
    num: 11, subject: "적분학", unit: "회전체 부피", concept: "원주각법(y축 회전)", difficulty: "medium",
    question: "$y\\le -x^3-x^2+x+1,\\;x\\ge 0,\\;y\\ge 0$을 만족하는 영역을 $y$축 둘레로 회전시켜 얻은 입체의 부피를 $\\dfrac{a}{b}\\pi$라고 할 때, $a+b$의 값은? (단, $a,b$는 서로 약분되지 않는 자연수이다.)",
    options: [o("1","$17$"), o("2","$33$"), o("3","$53$"), o("4","$83$")],
    answer: 3,
    explanation: "$y=-x^3-x^2+x+1=(x+1)^2(1-x)$, $0\\le x\\le 1$.\n원주각법: $V=2\\pi\\!\\int_0^1 x(-x^3-x^2+x+1)dx=2\\pi(\\dfrac{-1}{5}-\\dfrac{1}{4}+\\dfrac{1}{3}+\\dfrac{1}{2})=\\dfrac{23}{30}\\pi$.\n$a+b=53$."
  }),
  build({
    num: 12, subject: "적분학", unit: "정적분", concept: "수치적분(중점규칙)", difficulty: "medium",
    question: "다음은 정적분 $\\!\\int_a^b f(x)dx$의 근삿값을 구하는 방법이다.\n구간 $[a,b]$를 길이가 $\\Delta x=(b-a)/n$로 같은 $n$개의 부분구간 $[x_{i-1},x_i]$으로 나누면, $\\!\\int_a^b f(x)dx\\approx\\!\\sum_{i=1}^n f(\\overline{x_i})\\Delta x$이다. 여기서 $\\overline{x_i}=\\dfrac{1}{2}(x_{i-1}+x_i)$는 부분구간 $[x_{i-1},x_i]$의 중점이다.\n$n=4$에 대하여 정적분 $\\!\\int_{-0.5}^{3.5}\\!\\dfrac{x^2}{x^2+1}\\,dx$의 값을 소수점 아래 첫째 자리까지 근사하면?",
    options: [o("1","$2.2$"), o("2","$2.4$"), o("3","$2.6$"), o("4","$2.8$")],
    answer: 1,
    explanation: "$\\Delta x=1$, 중점 $\\overline{x_i}=0,1,2,3$.\n$f(0)=0,f(1)=1/2,f(2)=4/5,f(3)=9/10$.\n합 $=22/10=2.2$."
  }),
  build({
    num: 13, subject: "적분학", unit: "정적분", concept: "정적분 미분 + 대칭", difficulty: "mediumHard",
    question: "함수 $f(x)$를 $f(x)=\\dfrac{d}{dx}\\!\\int_{x^2}^{2x^2}\\!\\cos^2 t\\,dt$라고 정의할 때, 정적분 $\\!\\int_0^{2\\sqrt\\pi}\\!f(s)\\,ds$의 값을 구하면?",
    options: [o("1","$\\sqrt\\pi$"), o("2","$\\pi$"), o("3","$2\\sqrt\\pi$"), o("4","$2\\pi$")],
    answer: 4,
    explanation: "$h(x)=\\!\\int_{x^2}^{2x^2}\\cos^2 t\\,dt$, $f=h'$.\n$\\!\\int_0^{2\\sqrt\\pi}h'(x)dx=h(2\\sqrt\\pi)-h(0)=\\!\\int_{4\\pi}^{8\\pi}\\!\\cos^2 t\\,dt$.\n주기 $\\pi$로 평균 $1/2$, $4\\pi\\cdot 1/2=2\\pi$."
  }),
  build({
    num: 14, subject: "적분학", unit: "이상적분", concept: "이상적분 수렴 개수", difficulty: "medium",
    question: "다음 적분 중 수렴하는 것의 개수를 구하면?\n\n(가) $\\!\\int_{-\\infty}^0 x^2 e^x\\,dx$\n(나) $\\!\\int_1^{\\infty}\\dfrac{2+e^{-2x^2}}{1+\\ln x}\\,dx$\n(다) $\\!\\int_0^{\\pi/3}\\dfrac{1}{x^2\\sqrt{\\sin x}}\\,dx$\n(라) $\\!\\int_0^{2/3}\\dfrac{1}{\\sqrt{|3x-1|}}\\,dx$",
    options: [o("1","$1$개"), o("2","$2$개"), o("3","$3$개"), o("4","$4$개")],
    answer: 2,
    explanation: "(가) $x=-t$ 치환, $\\!\\int_0^\\infty t^2 e^{-t}dt=2$, 수렴.\n(나) $\\sim 2/\\ln x$ 발산.\n(다) $\\sim 1/x^{5/2}$ $x=0$ 근방 발산.\n(라) $1/\\sqrt{|3x-1|}$ $p=1/2<1$ 수렴.\n수렴 2개."
  }),
  build({
    num: 15, subject: "적분학", unit: "이상적분", concept: "가우스 적분", difficulty: "medium",
    question: "정적분 $\\!\\!\\displaystyle\\int_{-\\infty}^{\\infty}\\!(1+x^2)e^{-x^2}\\,dx$의 값을 구하면?",
    options: [
      o("1","$\\dfrac{\\sqrt\\pi}{4}$"),
      o("2","$\\dfrac{\\sqrt\\pi}{2}$"),
      o("3","$\\dfrac{3\\sqrt\\pi}{4}$"),
      o("4","$\\dfrac{3\\sqrt\\pi}{2}$")
    ],
    answer: 4,
    explanation: "$\\!\\int_{-\\infty}^\\infty e^{-x^2}dx=\\sqrt\\pi$, $\\!\\int_{-\\infty}^\\infty x^2 e^{-x^2}dx=\\sqrt\\pi/2$.\n합 $=\\sqrt\\pi+\\sqrt\\pi/2=3\\sqrt\\pi/2$."
  }),
  build({
    num: 16, subject: "미분학", unit: "곡선 표현", concept: "극·매개·음함수 곡선 동등성", difficulty: "mediumHard",
    question: "다음 중 참인 것을 모두 고르면?\n\n(가) 극곡선 $r=\\sin 2\\theta-1$과 $r=1-\\sin 2\\theta$는 서로 다른 그래프이다.\n(나) 매개변수방정식 $x=4\\sin 3t,\\;y=4\\cos 3t\\;(0\\le t\\le 2\\pi)$, 극방정식 $r=4$, 직교방정식 $x^2+y^2=16$의 그래프는 모두 같다.\n(다) 매개변수방정식 $x=t^2,\\;y=t^4$의 그래프와 $x=t^3,\\;y=t^6$의 그래프는 서로 다르다.",
    options: [
      o("1","(가),(나)"),
      o("2","(나)"),
      o("3","(가),(다)"),
      o("4","(나),(다)")
    ],
    answer: 4,
    explanation: "(가) 거짓: $(r,\\theta)=(-r,\\theta+\\pi)$ 동일점, 두 식 같은 그래프.\n(나) 참: 모두 반지름 4 원.\n(다) 참: $t^2$형은 $x\\ge 0$, $t^3$형은 모든 실수."
  }),
  build({
    num: 17, subject: "선형대수", unit: "고유값과 고유벡터", concept: "고유벡터 검증", difficulty: "medium",
    question: "다음 중, 행렬 $A=\\!\\begin{pmatrix}4&2&2\\\\2&4&2\\\\2&2&4\\end{pmatrix}$의 고유벡터(eigenvector)로 적절하지 $\\textbf{않은}$ 것은?",
    options: [
      o("1","$\\!\\begin{pmatrix}1\\\\-1\\\\0\\end{pmatrix}$"),
      o("2","$\\!\\begin{pmatrix}0\\\\1\\\\-1\\end{pmatrix}$"),
      o("3","$\\!\\begin{pmatrix}1\\\\1\\\\1\\end{pmatrix}$"),
      o("4","$\\!\\begin{pmatrix}1\\\\1\\\\-1\\end{pmatrix}$")
    ],
    answer: 4,
    explanation: "$Av=\\lambda v$ 확인.\n(1) $\\to(2,-2,0)=2v$ ⇒ $\\lambda=2$.\n(2) $\\to(0,2,-2)=2v$.\n(3) $\\to(8,8,8)=8v$.\n(4) $\\to(4,4,0)\\ne\\lambda(1,1,-1)$.\n적절하지 않은 것은 (4)."
  }),
  build({
    num: 18, subject: "선형대수", unit: "고유값과 고유벡터", concept: "고유값/고유벡터 종합 명제", difficulty: "mediumHard",
    question: "행렬 $A$의 고윳값이 $1,6$이고 각각의 고유벡터가 $\\!\\begin{pmatrix}2\\\\1\\end{pmatrix},\\!\\begin{pmatrix}1\\\\-2\\end{pmatrix}$일 때 다음 보기 중 참인 것의 개수는? (단, $I_2$는 $2\\times 2$ 단위행렬이다.)\n\n(가) $A$는 대칭행렬이다.\n(나) $A$는 대각행렬이다.\n(다) $\\det(A)=6$\n(라) $\\det(A^3+I_2)=432$\n(마) $tr(A)=7$\n(바) $A^2$의 모든 원소의 합은 $9$이다.",
    options: [o("1","$2$개"), o("2","$3$개"), o("3","$4$개"), o("4","$5$개")],
    answer: 3,
    explanation: "$A=PDP^{-1}$로 $A=\\!\\begin{pmatrix}2&-2\\\\-2&5\\end{pmatrix}$.\n(가) 대칭 참(직교 고유벡터).\n(나) 대각 거짓.\n(다) $\\det=6$ 참.\n(라) $\\det(A^3+I)=2\\cdot 217=434$, 거짓.\n(마) $\\text{tr}=7$ 참.\n(바) $A^2$ 합 $=8-14-14+29=9$ 참.\n참: 4개."
  }),
  build({
    num: 19, subject: "공학수학", unit: "라플라스 변환", concept: "라플라스 변환 2계 ODE", difficulty: "mediumHard",
    question: "초깃값 $y(0)=5$, $y'(0)=4$를 만족하는 $2y''-5y'+2y=0$의 해가 $y(x)$일 때, $y(\\ln 4)$의 값은?",
    options: [o("1","$6$"), o("2","$12$"), o("3","$18$"), o("4","$24$")],
    answer: 4,
    explanation: "$2r^2-5r+2=0$ ⇒ $r=1/2,2$.\n$y=Ae^{x/2}+Be^{2x}$, 초기조건 $A+B=5$, $A/2+2B=4$ ⇒ $A=4,B=1$.\n$y(\\ln 4)=4\\cdot 2+16=24$."
  }),
  build({
    num: 20, subject: "적분학", unit: "급수", concept: "맥클로린 급수(문제 오류 - 해설 정답)", difficulty: "killer",
    question: "함수 $f(x)=\\dfrac{1}{1+x^2}$의 매클로린 급수를 $\\!\\displaystyle\\sum_{n=0}^{\\infty}a_n x^n$이라고 하자. 함수 $g(x),h(x)$의 매클로린 급수가 각각 $\\!\\displaystyle\\sum_{n=3}^{\\infty}a_n x^n,\\;\\!\\displaystyle\\sum_{n=5}^{\\infty}a_n x^n$과 같이 표현된다고 할 때, $g'(1)+h'(1)$의 값을 구하면? (단 $g(x),h(x)$는 해석함수이다.)",
    options: [
      o("1","$-2$"),
      o("2","$-\\dfrac{3}{2}$"),
      o("3","$-1$"),
      o("4","$-\\dfrac{1}{2}$")
    ],
    answer: 3,
    explanation: "$f(x)=1-x^2+x^4-x^6+\\cdots$ ($a_{2k}=(-1)^k$, 홀수항 $0$).\n$g(x)=x^4-x^6+x^8-\\cdots$, $h(x)=-x^6+x^8-x^{10}+\\cdots$.\n$g+h=x^4-2x^6/(1+x^2)$ 등 정리 후 $g'(1)+h'(1)=-1$. (수렴구간 경계 $x=1$에서 형식상 도출)"
  }),
  build({
    num: 21, subject: "다변수함수", unit: "극값", concept: "라그랑지 미정계수", difficulty: "killer",
    question: "곡선 $x^4+y^4=x^2+y^2$ 위의 점이 가질 수 있는 $y$좌표 중, 가장 큰 값과 가장 작은 값을 곱하면?",
    options: [
      o("1","$-\\dfrac{3}{2}$"),
      o("2","$\\dfrac{-1-\\sqrt 3}{2}$"),
      o("3","$\\dfrac{-1-\\sqrt 2}{2}$"),
      o("4","$-1$")
    ],
    answer: 3,
    explanation: "$X=x^2$로 치환: $X^2+y^4=X+y^2$.\n라그랑지: $2X-1=0$, $X=1/2$.\n$1/4+y^4-1/2-y^2=0$ ⇒ $y^4-y^2-1/4=0$.\n$y^2=(1+\\sqrt 2)/2$, 최댓값×최솟값 $=-(1+\\sqrt 2)/2=(-1-\\sqrt 2)/2$."
  }),
  build({
    num: 22, subject: "적분학", unit: "삼중적분", concept: "구·원뿔 삼중적분 차", difficulty: "mediumHard",
    question: "다음 삼중적분의 값을 각각 $A,B$라고 하자. 이 때, $A-B$의 값은?\n\n$A=\\!\\displaystyle\\int_{-2}^2\\!\\!\\int_{-\\sqrt{4-x^2}}^{\\sqrt{4-x^2}}\\!\\!\\int_{\\sqrt{x^2+y^2}}^{4-\\sqrt{x^2+y^2}}\\!\\sqrt{x^2+y^2}\\,dz\\,dy\\,dx$\n$B=\\!\\displaystyle\\int_{-1}^1\\!\\!\\int_{-\\sqrt{1-x^2}}^{\\sqrt{1-x^2}}\\!\\!\\int_{\\sqrt{x^2+y^2}}^{2-\\sqrt{x^2+y^2}}\\!\\sqrt{x^2+y^2}\\,dz\\,dy\\,dx$",
    options: [o("1","$3\\pi$"), o("2","$4\\pi$"), o("3","$5\\pi$"), o("4","$6\\pi$")],
    answer: 3,
    explanation: "$A$: $D=\\{x^2+y^2\\le 4\\}$, 극좌표 $\\!\\int_0^{2\\pi}\\!\\int_0^2 r(4-2r)\\,r\\,dr\\,d\\theta=2\\pi[\\frac{4}{3}r^3-\\frac{1}{2}r^4]_0^2=16\\pi/3$.\n$B$: $D=\\{x^2+y^2\\le 1\\}$, $\\!\\int_0^1 r(2-2r)\\,r\\,dr\\cdot 2\\pi=\\pi/3$.\n$A-B=15\\pi/3=5\\pi$."
  }),
  build({
    num: 23, subject: "다변수함수", unit: "곡면적", concept: "쌍곡포물면 곡면적", difficulty: "mediumHard",
    question: "두 원기둥 $x^2+y^2=4$와 $x^2+y^2=9$ 사이에 있는 쌍곡포물면 $z=y^2-x^2$의 곡면 넓이가 $\\dfrac{\\pi}{a}(b\\sqrt b-c\\sqrt c)$일 때, $a+b-c$의 값을 구하면? (단, $a,b,c$는 서로 약분되지 않는 자연수이다.)",
    options: [o("1","$23$"), o("2","$24$"), o("3","$25$"), o("4","$26$")],
    answer: 4,
    explanation: "$z_x=-2x$, $z_y=2y$, $1+z_x^2+z_y^2=1+4x^2+4y^2$.\n극좌표 $2\\le r\\le 3$: $S=\\!\\int_0^{2\\pi}\\!\\int_2^3\\!\\sqrt{1+4r^2}\\,r\\,dr\\,d\\theta=\\dfrac{\\pi}{6}(37\\sqrt{37}-17\\sqrt{17})$.\n$a=6,b=37,c=17$, $a+b-c=26$."
  }),
  build({
    num: 24, subject: "선형대수", unit: "내적공간", concept: "그람-슈미트 (평행육면체 부피)", difficulty: "medium",
    question: "삼차원 공간에서 세 개의 벡터 $a_1=\\langle 1,0,1\\rangle,\\;a_2=\\langle 1,1,0\\rangle,\\;a_3=\\langle 1,2,0\\rangle$으로 이루어진 기저 $\\{a_1,a_2,a_3\\}$으로부터 그람-슈미트(Gram-Schmidt) 과정을 거쳐 순서대로 만들어진 직교기저가 $\\{w_1,w_2,w_3\\}$이라고 하자. 이때, $\\|w_1\\|\\|w_2\\|\\|w_3\\|$를 구하면? (단, $\\|w\\|$는 $w$의 길이이다.)",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 1,
    explanation: "그람-슈미트 직교기저 길이 곱 = 원래 기저가 이루는 평행육면체 부피.\n$\\det\\!\\begin{pmatrix}1&0&1\\\\1&1&0\\\\1&2&0\\end{pmatrix}=|1\\cdot 0-0+1\\cdot 1|=1$."
  }),
  build({
    num: 25, subject: "공학수학", unit: "3계 미분방정식", concept: "3계 상수계수 ODE 근의 개수", difficulty: "killer",
    question: "$y=f(x)$가 초깃값 $f(0)=0,\\;f'(0)=3,\\;f''(0)=10$을 만족하는 미분방정식 $y'''-3y''+y'-3y=0$의 해라고 하자. 이때, $-1\\le x\\le 1$에서 방정식 $f(x)=0$의 근의 개수는?",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개")],
    answer: 2,
    explanation: "특성방정식 $s^3-3s^2+s-3=0=(s-3)(s^2+1)$ ⇒ $s=3,\\pm i$.\n$f(x)=e^{3x}-\\cos x$.\n$f(0)=0$. $[-1,1]$에서 $f(-1)=e^{-3}-\\cos 1\\approx 0.05-0.54<0$, $f(1)>0$.\n$x=0$만 해 ⇒ 1개."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) { console.error("ERROR:", error); process.exit(1); }
console.log(`Inserted ${data.length} 문항 (2024 숭실대):`, data.map((d) => d.id).join(", "));
