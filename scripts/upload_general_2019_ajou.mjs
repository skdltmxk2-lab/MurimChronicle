// Upload 2019년도 아주대 편입수학 기출 25문항 (5지선다, 문제 26~50)
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

const SCHOOL = "아주대";
const YEAR = "2019";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-ajou-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 26, subject: "미분학", unit: "역삼각함수", concept: "$\\arcsin$ 합성 단순화", difficulty: "easyMedium",
    question: "$0\\le x\\le 1$인 범위에서 $\\cos\\!\\left(\\sin^{-1}(-\\sqrt{1-x})\\right)$를 간단히 하면?",
    options: [o("1","$\\sqrt{x}$"), o("2","$-\\sqrt{x}$"), o("3","$\\sqrt{1-x}$"), o("4","$-\\sqrt{1-x}$"), o("5","$-\\dfrac{\\sqrt{x}}{2}$")],
    answer: 1,
    explanation: "$\\sin^{-1}(-\\sqrt{1-x})=\\alpha$라 두면 $\\sin\\alpha=-\\sqrt{1-x}\\le 0$, 따라서 $-\\dfrac{\\pi}{2}\\le\\alpha\\le 0$.\n이 범위에서 $\\cos\\alpha\\ge 0$, $\\cos\\alpha=\\sqrt{1-\\sin^2\\alpha}=\\sqrt{1-(1-x)}=\\sqrt{x}$."
  }),
  build({
    num: 27, subject: "미분학", unit: "역함수 미분법", concept: "역함수의 도함수", difficulty: "easyMedium",
    question: "실수 전체에서 정의된 함수 $f(x)=2e^{x+1}-2x-x^2$의 역함수를 $g$라 할 때, $g'(3)$의 값은?",
    options: [o("1","$1$"), o("2","$\\dfrac{1}{2}$"), o("3","$\\dfrac{1}{3}$"), o("4","$\\dfrac{1}{6}$"), o("5","$\\dfrac{1}{7}$")],
    answer: 2,
    explanation: "$g(3)$ 찾기: $f(y)=3$ ⟹ $2e^{y+1}-2y-y^2=3$. $y=-1$ 시 $2e^0+2-1=3$ ✓. 즉 $g(3)=-1$.\n$f'(x)=2e^{x+1}-2-2x$. $f'(-1)=2e^0-2+2=2$.\n$g'(3)=\\dfrac{1}{f'(g(3))}=\\dfrac{1}{f'(-1)}=\\dfrac{1}{2}$."
  }),
  build({
    num: 28, subject: "미분학", unit: "합성함수 미분", concept: "3중 합성함수 미분", difficulty: "medium",
    question: "$f$는 실수 전체에서 정의된 미분가능한 함수이다. 함수 $f$에 대한 표의 값을 이용하여 $(f\\circ f\\circ f)'(0)$의 값을 구하면?\n\n$\\begin{array}{|c|c|c|c|c|c|c|}\\hline a & -2 & -1 & 0 & 1 & 2 & 4\\\\\\hline f(a) & 4 & 0 & 1 & -1 & 1 & 0\\\\\\hline f'(a) & 3 & 2 & -3 & 1 & 4 & 2\\\\\\hline\\end{array}$",
    options: [o("1","$-8$"), o("2","$-6$"), o("3","$-4$"), o("4","$2$"), o("5","$8$")],
    answer: 2,
    explanation: "$h(x)=f(f(f(x)))$일 때 사슬규칙: $h'(x)=f'(f(f(x)))\\cdot f'(f(x))\\cdot f'(x)$.\n$x=0$ 대입: $f(0)=1$, $f(f(0))=f(1)=-1$.\n$h'(0)=f'(f(1))\\cdot f'(1)\\cdot f'(0)=f'(-1)\\cdot 1\\cdot(-3)=2\\cdot 1\\cdot(-3)=-6$."
  }),
  build({
    num: 29, subject: "다변수함수", unit: "음함수", concept: "음함수의 미분 (접선의 기울기)", difficulty: "easy",
    question: "곡선 $x^2=y^3-y+3$ 위의 점 $(3,2)$에서의 접선의 기울기는?",
    options: [o("1","$\\dfrac{6}{11}$"), o("2","$\\dfrac{3}{11}$"), o("3","$\\dfrac{1}{2}$"), o("4","$-\\dfrac{1}{2}$"), o("5","$\\dfrac{3}{2}$")],
    answer: 1,
    explanation: "음함수 $F(x,y)=x^2-y^3+y-3=0$. $\\dfrac{dy}{dx}=-\\dfrac{F_x}{F_y}=-\\dfrac{2x}{-3y^2+1}=\\dfrac{2x}{3y^2-1}$.\n$(3,2)$ 대입: $\\dfrac{6}{12-1}=\\dfrac{6}{11}$."
  }),
  build({
    num: 30, subject: "미분학", unit: "극한과 연속", concept: "테일러 전개 극한", difficulty: "easyMedium",
    question: "극한 $\\displaystyle\\lim_{x\\to 0}\\dfrac{x(\\cos 2x-1)}{\\tan^{-1}x-x}$의 값은?",
    options: [o("1","$-6$"), o("2","$-2$"), o("3","$0$"), o("4","$2$"), o("5","$6$")],
    answer: 5,
    explanation: "테일러 전개: $\\cos 2x-1=-\\dfrac{(2x)^2}{2!}+\\dfrac{(2x)^4}{4!}-\\cdots=-2x^2+\\dfrac{2x^4}{3}-\\cdots$.\n$\\tan^{-1}x-x=-\\dfrac{x^3}{3}+\\dfrac{x^5}{5}-\\cdots$.\n분자 $\\sim x\\cdot(-2x^2)=-2x^3$, 분모 $\\sim-\\dfrac{x^3}{3}$.\n극한 $=\\dfrac{-2x^3}{-x^3/3}=6$."
  }),
  build({
    num: 31, subject: "다변수함수", unit: "선형근사", concept: "이변수 함수 일차근사", difficulty: "easyMedium",
    question: "이변수 함수 $f(x,y)=\\sqrt{x^2+3y^2}$에 대한 $(1,1)$에서의 일차 근사 함수(linear approximation, tangent plane approximation)를 이용하여 $f(1.2,0.9)$의 근삿값을 구하면?",
    options: [o("1","$1.95$"), o("2","$1.99$"), o("3","$2.01$"), o("4","$2.05$"), o("5","$2.1$")],
    answer: 1,
    explanation: "$L(x,y)=f(1,1)+f_x(1,1)(x-1)+f_y(1,1)(y-1)$.\n• $f(1,1)=\\sqrt{1+3}=2$.\n• $f_x=\\dfrac{x}{\\sqrt{x^2+3y^2}}$, $f_x(1,1)=\\dfrac{1}{2}$.\n• $f_y=\\dfrac{3y}{\\sqrt{x^2+3y^2}}$, $f_y(1,1)=\\dfrac{3}{2}$.\n$L(1.2,0.9)=2+\\dfrac{1}{2}(0.2)+\\dfrac{3}{2}(-0.1)=2+0.1-0.15=1.95$."
  }),
  build({
    num: 32, subject: "적분학", unit: "급수", concept: "분수 분해 급수 (telescoping)", difficulty: "medium",
    question: "무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n^2+3n+1}{(n+2)!}$의 값을 구하면?",
    options: [o("1","$\\dfrac{1}{4}$"), o("2","$\\dfrac{1}{3}$"), o("3","$\\dfrac{1}{2}$"), o("4","$1$"), o("5","$\\dfrac{3}{2}$")],
    answer: 5,
    explanation: "$n^2+3n+1=(n+2)(n+1)-1$. 따라서\n$\\dfrac{n^2+3n+1}{(n+2)!}=\\dfrac{(n+2)(n+1)}{(n+2)!}-\\dfrac{1}{(n+2)!}=\\dfrac{1}{n!}-\\dfrac{1}{(n+2)!}$.\n망원급수: $\\sum_{n=1}^{\\infty}\\!\\left(\\dfrac{1}{n!}-\\dfrac{1}{(n+2)!}\\right)=\\dfrac{1}{1!}+\\dfrac{1}{2!}=1+\\dfrac{1}{2}=\\dfrac{3}{2}$."
  }),
  build({
    num: 33, subject: "적분학", unit: "급수", concept: "급수 수렴 판정 (비교판정법)", difficulty: "easyMedium",
    question: "무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}a_n$의 수렴·발산 판정에 대한 다음 설명 중 옳은 것은?",
    options: [o("1","모든 $n$에 대해 $a_n\\le b_n$이고 $\\sum b_n$이 수렴하면 $\\sum a_n$은 수렴한다."), o("2","모든 $n$에 대해 $b_n\\le a_n$이고 $\\sum b_n$이 수렴하면 $\\sum a_n$은 수렴한다."), o("3","모든 $n$에 대해 $b_n\\le a_n$이고 $\\sum b_n$이 발산하면 $\\sum a_n$은 발산한다."), o("4","모든 $n$에 대해 $|b_n|\\le a_n$이고 $\\sum b_n$이 수렴하면 $\\sum a_n$은 수렴한다."), o("5","모든 $n$에 대해 $|b_n|\\le a_n$이고 $\\sum b_n$이 발산하면 $\\sum a_n$은 발산한다.")],
    answer: 5,
    explanation: "비교판정법은 $a_n,b_n\\ge 0$ 양항 조건을 요구한다. (1)(2)(3)은 부호 조건 없어 판정 불가, (4)는 반례 $b_n=\\dfrac{(-1)^n}{n^2}$, $a_n=\\dfrac{1}{n}$.\n(5) 참: $|b_n|\\le a_n$이면 $a_n\\ge 0$. $\\sum b_n$ 발산 ⟹ $\\sum|b_n|$ 발산 (절대수렴의 대우). 그런데 $|b_n|\\le a_n$에 의해 $\\sum a_n$도 발산."
  }),
  build({
    num: 34, subject: "적분학", unit: "급수", concept: "급수 발산 조건", difficulty: "medium",
    question: "다음 중 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-1)^{nq}}{n^p(\\ln(n+2019))^{q/2}}$가 발산하는 경우는?",
    options: [o("1","$p=3,\\,q=1$"), o("2","$p=2,\\,q=2019$"), o("3","$p=1,\\,q=1$"), o("4","$p=1,\\,q=2$"), o("5","$p=1,\\,q=4$")],
    answer: 4,
    explanation: "$(-1)^{nq}$: $q$ 짝수면 $1$ (양항), 홀수면 $(-1)^n$ (교대).\n• (1) $p=3,q=1$: 교대급수. 항이 $0$으로 감소 → 수렴.\n• (2) $p=2,q=2019$: 교대급수. 수렴.\n• (3) $p=1,q=1$: 교대급수. $\\dfrac{1}{n\\sqrt{\\ln(n+2019)}}\\to 0$ 감소 → 수렴.\n• (4) $p=1,q=2$: $\\sum\\dfrac{1}{n\\ln(n+2019)}$. 적분판정으로 발산.\n• (5) $p=1,q=4$: $\\sum\\dfrac{1}{n(\\ln(n+2019))^2}$. 적분판정으로 수렴."
  }),
  build({
    num: 35, subject: "적분학", unit: "급수", concept: "멱급수 변형 (미분·곱)", difficulty: "medium",
    question: "$f(x)=\\displaystyle\\sum_{n=0}^{\\infty}(n+1)x^{2n}$일 때 $\\displaystyle\\sum_{n=0}^{\\infty}n^2 x^{2n}$으로 표현되는 함수는?",
    options: [o("1","$xf'(x)-x^2 f(x)$"), o("2","$\\dfrac{x}{2}f'(x)-x^2 f(x)$"), o("3","$xf'(x)-\\dfrac{x^2}{2}f(x)$"), o("4","$2xf'(x)-x^2 f(x)$"), o("5","$2xf'(x)+x^2 f(x)$")],
    answer: 2,
    explanation: "$f'(x)=\\sum 2n(n+1)x^{2n-1}$이므로 $\\dfrac{x}{2}f'(x)=\\sum n(n+1)x^{2n}=\\sum(n^2+n)x^{2n}$.\n$x^2 f(x)=\\sum(n+1)x^{2n+2}=\\sum n\\,x^{2n}$ (index shift).\n차: $\\dfrac{x}{2}f'(x)-x^2 f(x)=\\sum(n^2+n)x^{2n}-\\sum n\\,x^{2n}=\\sum n^2 x^{2n}$."
  }),
  build({
    num: 36, subject: "다변수함수", unit: "이중적분", concept: "무게중심 (도넛형 영역)", difficulty: "medium",
    question: "평면상의 영역 $D=\\{(x,y)\\mid x^2+y^2\\le 4,\\,(x-1)^2+y^2\\ge 1\\}$의 무게 중심의 좌표는 $(a,0)$이다. 이때 $a$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$-\\dfrac{1}{2}$"), o("3","$\\dfrac{1}{3}$"), o("4","$-\\dfrac{1}{3}$"), o("5","$0$")],
    answer: 4,
    explanation: "$a=\\dfrac{\\iint_D x\\,dA}{\\iint_D dA}$.\n분모 (면적) $=4\\pi-\\pi=3\\pi$.\n분자: $\\iint_D x\\,dA=\\iint_{\\text{큰원}}x\\,dA-\\iint_{\\text{작은원}}x\\,dA$.\n큰 원 (원점 중심)의 $x$ 적분 $=0$ (대칭). 작은 원 $(x-1)^2+y^2\\le 1$의 무게중심 $x=1$, 면적 $\\pi$이므로 $\\iint x\\,dA=\\pi\\cdot 1=\\pi$.\n분자 $=0-\\pi=-\\pi$.\n$a=\\dfrac{-\\pi}{3\\pi}=-\\dfrac{1}{3}$."
  }),
  build({
    num: 37, subject: "적분학", unit: "정적분의 응용", concept: "곡선의 길이", difficulty: "medium",
    question: "곡선 $y=\\dfrac{1}{2}\\!\\left(x^2-\\dfrac{1}{2}\\ln x\\right)$, $1\\le x\\le 2$의 길이는?",
    options: [o("1","$\\dfrac{1}{2}+\\dfrac{1}{2}\\ln 2$"), o("2","$1+\\dfrac{1}{2}\\ln 2$"), o("3","$\\dfrac{3}{2}+\\dfrac{1}{2}\\ln 2$"), o("4","$\\dfrac{3}{2}+\\dfrac{1}{4}\\ln 2$"), o("5","$\\dfrac{3}{2}+\\ln 2$")],
    answer: 4,
    explanation: "$y'=x-\\dfrac{1}{4x}$. $(y')^2=x^2-\\dfrac{1}{2}+\\dfrac{1}{16x^2}$.\n$1+(y')^2=x^2+\\dfrac{1}{2}+\\dfrac{1}{16x^2}=\\!\\left(x+\\dfrac{1}{4x}\\right)^{\\!2}$.\n$\\displaystyle L=\\!\\int_1^2\\!\\left(x+\\dfrac{1}{4x}\\right)dx=\\!\\left[\\dfrac{x^2}{2}+\\dfrac{1}{4}\\ln x\\right]_1^2=\\!\\left(2+\\dfrac{\\ln 2}{4}\\right)-\\dfrac{1}{2}=\\dfrac{3}{2}+\\dfrac{\\ln 2}{4}$."
  }),
  build({
    num: 38, subject: "적분학", unit: "특이적분", concept: "$\\arctan$ 형태 이상적분", difficulty: "easy",
    question: "이상 적분 $\\displaystyle\\int_{1/2}^{\\infty}\\dfrac{dx}{1+4x^2}$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{16}$"), o("2","$\\dfrac{\\pi}{16}+1$"), o("3","$\\dfrac{\\pi}{8}$"), o("4","$\\dfrac{\\pi}{8}+1$"), o("5","$\\dfrac{\\pi}{4}+\\dfrac{1}{2}$")],
    answer: 3,
    explanation: "$\\displaystyle\\int\\dfrac{dx}{1+(2x)^2}=\\dfrac{1}{2}\\arctan(2x)+C$.\n$\\displaystyle\\int_{1/2}^{\\infty}=\\dfrac{1}{2}[\\arctan(2x)]_{1/2}^{\\infty}=\\dfrac{1}{2}\\!\\left(\\dfrac{\\pi}{2}-\\dfrac{\\pi}{4}\\right)=\\dfrac{\\pi}{8}$."
  }),
  build({
    num: 39, subject: "적분학", unit: "급수", concept: "수렴·발산 보기 진위", difficulty: "medium",
    question: "다음 보기의 내용 중 옳은 것은 모두 몇 개인가?\n\n가. $\\pi-\\dfrac{\\pi^3}{3!}+\\dfrac{\\pi^5}{5!}-\\dfrac{\\pi^7}{7!}+\\cdots$은 $0$으로 수렴한다.\n나. $\\displaystyle\\int_0^4\\dfrac{2x}{x^2-1}dx=\\ln 15$\n다. 무한급수 $S=\\displaystyle\\sum_{n=1}^{\\infty}(-1)^{n+1}\\dfrac{1}{n}$의 $2019$번째 부분합 $S_{2019}$는 $S$보다 크다.\n라. $\\displaystyle\\sum_{n=1}^{\\infty}(-1)^n\\sin^3\\!\\left(\\dfrac{1}{\\sqrt{n}}\\right)$은 절대 수렴한다.",
    options: [o("1","0개"), o("2","1개"), o("3","2개"), o("4","3개"), o("5","4개")],
    answer: 4,
    explanation: "가. 참: $\\sin x=\\sum\\dfrac{(-1)^n x^{2n+1}}{(2n+1)!}$, $x=\\pi$ 대입 $\\sin\\pi=0$. ✓\n나. 거짓: $x=1$에서 발산. (Part II 조건 위배.)\n다. 참: $S=\\ln 2$. 교대급수 부분합은 홀수 항에서 $S$보다 큼.\n라. 참: $|\\sin^3(1/\\sqrt n)|\\sim\\dfrac{1}{n^{3/2}}$, $p=3/2>1$로 절대수렴.\n참: 3개."
  }),
  build({
    num: 40, subject: "적분학", unit: "정적분의 응용", concept: "파푸스 정리 (회전체 부피)", difficulty: "medium",
    question: "$y=1-|x|$와 $x$축으로 둘러싸인 도형을 직선 $x=2$ 주위로 회전하여 얻어진 회전체의 부피는?",
    options: [o("1","$\\pi$"), o("2","$2\\pi$"), o("3","$3\\pi$"), o("4","$4\\pi$"), o("5","$5\\pi$")],
    answer: 4,
    explanation: "파푸스 정리: $V=A\\cdot d$ ($A$=도형 면적, $d$=중심이 이동한 거리).\n• 면적 $A=\\dfrac{1}{2}\\cdot 2\\cdot 1=1$.\n• 도형 중심 $(0,\\dfrac{1}{3})$.\n• $x=2$ 주위로 회전 시 중심의 이동거리 $=2\\pi\\cdot|2-0|=4\\pi$.\n$V=1\\cdot 4\\pi=4\\pi$."
  }),
  build({
    num: 41, subject: "미분학", unit: "고차도함수", concept: "테일러 다항식", difficulty: "easyMedium",
    question: "함수 $f(x)=x^5-4x^3+3x^2-2+\\sin^4(x-1)$에 대한 $x=1$에서 2차의 테일러 다항식을 $P(x)$라 할 때, $P(2)$는?",
    options: [o("1","$-4$"), o("2","$-2$"), o("3","$0$"), o("4","$2$"), o("5","$4$")],
    answer: 2,
    explanation: "$P(x)=f(1)+f'(1)(x-1)+\\dfrac{f''(1)}{2}(x-1)^2$.\n• $f(1)=1-4+3-2+0=-2$.\n• $f'(x)=5x^4-12x^2+6x+4\\sin^3(x-1)\\cos(x-1)$. $f'(1)=5-12+6+0=-1$.\n• $f''(x)=20x^3-24x+6+\\cdots$. $x=1$에서 $\\sin^4$ 항의 2차 미분도 $0$. $f''(1)=20-24+6=2$.\n$P(x)=-2-(x-1)+(x-1)^2$. $P(2)=-2-1+1=-2$."
  }),
  build({
    num: 42, subject: "다변수함수", unit: "벡터와 공간도형", concept: "꼬인 직선 사이 거리", difficulty: "medium",
    question: "꼬인 위치의 두 직선 $x-1=y+2=z-3$과 $x=\\dfrac{y+2}{2}=\\dfrac{z-3}{3}$ 사이의 거리는?",
    options: [o("1","$\\dfrac{1}{\\sqrt{42}}$"), o("2","$\\dfrac{3}{\\sqrt{42}}$"), o("3","$\\dfrac{1}{\\sqrt{6}}$"), o("4","$\\dfrac{3}{\\sqrt{6}}$"), o("5","$\\dfrac{1}{\\sqrt{21}}$")],
    answer: 3,
    explanation: "$\\ell_1$: 점 $(1,-2,3)$, 방향 $(1,1,1)$. $\\ell_2$: 점 $(0,-2,3)$, 방향 $(1,2,3)$.\n공통수직 방향 $=(1,1,1)\\times(1,2,3)=(3-2,1-3,2-1)=(1,-2,1)$, $|\\cdot|=\\sqrt{6}$.\n두 점 잇는 벡터 $(1,0,0)$.\n거리 $=\\dfrac{|(1,0,0)\\cdot(1,-2,1)|}{\\sqrt{6}}=\\dfrac{1}{\\sqrt{6}}$."
  }),
  build({
    num: 43, subject: "다변수함수", unit: "편도함수", concept: "연쇄법칙 (표값)", difficulty: "easyMedium",
    question: "미분가능한 이변수 함수 $f(u,v)$에 대하여 $w=g(x,y)=f(x+2y-1,\\,2x-y)$라 하자. 아래 표를 이용하여 $\\dfrac{\\partial w}{\\partial y}\\bigg|_{x=1,y=1}$의 값을 구하면?\n\n$\\begin{array}{|c|c|c|c|}\\hline (u,v) & f & f_u & f_v\\\\\\hline (1,1) & 1 & 1 & 2\\\\\\hline (1,2) & 3 & -2 & 1\\\\\\hline (2,1) & 2 & -1 & -1\\\\\\hline (2,2) & 1 & 2 & 2\\\\\\hline\\end{array}$",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$0$"), o("4","$1$"), o("5","$2$")],
    answer: 2,
    explanation: "$w_y=f_u\\cdot u_y+f_v\\cdot v_y=f_u\\cdot 2+f_v\\cdot(-1)$, $(u,v)=(x+2y-1,2x-y)$.\n$x=1,y=1$에서 $(u,v)=(2,1)$. 표: $f_u(2,1)=-1$, $f_v(2,1)=-1$.\n$w_y=2(-1)-(-1)=-2+1=-1$."
  }),
  build({
    num: 44, subject: "미분학", unit: "도함수", concept: "관련변화율 (회전체)", difficulty: "medium",
    question: "곡선 $y=x^4$을 $y$축 주위로 회전하여 얻어진 물탱크에 물을 넣고 있다. 물의 깊이가 $4\\,\\text{m}$일 때 수면의 높이가 $2\\,\\text{cm/sec}$의 속도로 증가하고 있다면, 그때 수면의 넓이의 변화율은 몇 $\\text{cm}^2/\\text{sec}$인가?",
    options: [o("1","$4\\pi$"), o("2","$2\\pi$"), o("3","$\\pi$"), o("4","$\\dfrac{3\\pi}{2}$"), o("5","$\\dfrac{\\pi}{2}$")],
    answer: 5,
    explanation: "수면 반지름 $x$, 깊이 $y=x^4$. 수면 넓이 $S=\\pi x^2$.\n$\\dfrac{dS}{dt}=2\\pi x\\dfrac{dx}{dt}$, $\\dfrac{dy}{dt}=4x^3\\dfrac{dx}{dt}$.\n$y=4$일 때 $x=\\sqrt{2}$. $\\dfrac{dy}{dt}=2$ (cm 단위 통일 후, 풀이 단위계로).\n$2=4(\\sqrt{2})^3\\dfrac{dx}{dt}=8\\sqrt{2}\\dfrac{dx}{dt}\\Rightarrow\\dfrac{dx}{dt}=\\dfrac{1}{4\\sqrt{2}}$.\n$\\dfrac{dS}{dt}=2\\pi\\sqrt{2}\\cdot\\dfrac{1}{4\\sqrt{2}}=\\dfrac{\\pi}{2}$."
  }),
  build({
    num: 45, subject: "다변수함수", unit: "최댓값·최솟값", concept: "조건 최적화 (AM-GM)", difficulty: "medium",
    question: "점 $(x,y)$가 $4x^2+y^2+xy=1$을 만족할 때 $e^{xy}$의 최댓값은?",
    options: [o("1","$e$"), o("2","$e^{1/3}$"), o("3","$e^{1/5}$"), o("4","$1$"), o("5","존재하지 않는다.")],
    answer: 3,
    explanation: "$e^{xy}$는 증가함수이므로 $xy$ 최댓값을 구한다.\nAM-GM: $4x^2+y^2\\ge 2\\sqrt{4x^2 y^2}=4|xy|$. 제약 $4x^2+y^2=1-xy$이므로 $1-xy\\ge 4|xy|$.\n• $xy\\ge 0$: $1-xy\\ge 4xy\\Rightarrow xy\\le\\dfrac{1}{5}$.\n• $xy<0$: $1-xy\\ge -4xy\\Rightarrow xy\\ge -\\dfrac{1}{3}$.\n범위 $-\\dfrac{1}{3}\\le xy\\le\\dfrac{1}{5}$. 최댓값 $\\dfrac{1}{5}$, $e^{xy}$의 최댓값 $=e^{1/5}$."
  }),
  build({
    num: 46, subject: "다변수함수", unit: "이중적분", concept: "적분순서 변경", difficulty: "easyMedium",
    question: "다음 $\\displaystyle\\int_0^1\\!\\left[\\int_{\\sqrt{x}}^{1}\\sin(\\pi y^3)dy\\right]dx$ 적분의 값은?",
    options: [o("1","$\\dfrac{\\pi}{2}$"), o("2","$\\dfrac{2\\pi}{3}$"), o("3","$\\dfrac{\\pi}{4}$"), o("4","$\\dfrac{1}{2\\pi}$"), o("5","$\\dfrac{2}{3\\pi}$")],
    answer: 5,
    explanation: "영역: $0\\le x\\le 1$, $\\sqrt{x}\\le y\\le 1$ ⟺ $0\\le y\\le 1$, $0\\le x\\le y^2$.\n적분순서 변경: $\\displaystyle\\int_0^1\\!\\int_0^{y^2}\\sin(\\pi y^3)dx\\,dy=\\!\\int_0^1 y^2\\sin(\\pi y^3)dy$.\n$u=\\pi y^3$ 치환 ($du=3\\pi y^2 dy$): $=\\dfrac{1}{3\\pi}\\!\\int_0^{\\pi}\\!\\sin u\\,du=\\dfrac{2}{3\\pi}$."
  }),
  build({
    num: 47, subject: "다변수함수", unit: "극좌표·극곡선", concept: "극곡선 영역의 넓이", difficulty: "easyMedium",
    question: "극좌표 방정식 $r=\\sqrt{\\sin^3\\theta}$, $0\\le\\theta\\le\\pi$로 표현되는 곡선에 의해 둘러싸인 영역의 넓이는?",
    options: [o("1","$\\dfrac{2}{3}$"), o("2","$\\dfrac{2}{3}\\pi$"), o("3","$\\dfrac{1}{3}$"), o("4","$\\dfrac{1}{3}\\pi$"), o("5","$\\pi$")],
    answer: 1,
    explanation: "$\\displaystyle S=\\dfrac{1}{2}\\!\\int_0^{\\pi}r^2 d\\theta=\\dfrac{1}{2}\\!\\int_0^{\\pi}\\!\\sin^3\\theta\\,d\\theta$.\n월리스: $\\displaystyle\\int_0^{\\pi}\\!\\sin^3\\theta\\,d\\theta=2\\!\\int_0^{\\pi/2}\\!\\sin^3\\theta\\,d\\theta=2\\cdot\\dfrac{2}{3}=\\dfrac{4}{3}$.\n$S=\\dfrac{1}{2}\\cdot\\dfrac{4}{3}=\\dfrac{2}{3}$."
  }),
  build({
    num: 48, subject: "적분학", unit: "이상적분", concept: "가우시안 변형 (지문 1)", difficulty: "easyMedium",
    question: "이상 적분 $I=\\displaystyle\\int_0^{\\infty}x^2 e^{-x^2}dx$의 값을 구하기 위하여 $I^2$을 극좌표로 변환했을 때 $I^2=\\displaystyle\\int_0^{a}\\!\\!\\left(\\int_0^{\\infty}r^m e^{-r^2}dr\\right)\\!\\sin^2\\theta\\cos^2\\theta\\,d\\theta$로 표현된다. $a$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{4}$"), o("2","$\\dfrac{\\pi}{3}$"), o("3","$\\dfrac{\\pi}{2}$"), o("4","$\\pi$"), o("5","$2\\pi$")],
    answer: 3,
    explanation: "$I^2=\\!\\left(\\int_0^{\\infty}\\!x^2 e^{-x^2}dx\\right)\\!\\!\\left(\\int_0^{\\infty}\\!y^2 e^{-y^2}dy\\right)=\\!\\iint_{x,y\\ge 0}\\!x^2 y^2 e^{-(x^2+y^2)}dxdy$.\n영역은 제1사분면 ($0\\le x<\\infty$, $0\\le y<\\infty$)이므로 극좌표에서 $0\\le\\theta\\le\\dfrac{\\pi}{2}$, $0\\le r<\\infty$.\n따라서 $a=\\dfrac{\\pi}{2}$."
  }),
  build({
    num: 49, subject: "적분학", unit: "이상적분", concept: "$\\sin^2\\cos^2$ 적분 (지문 2)", difficulty: "medium",
    question: "지문 48의 변환에서 $\\sin^2\\theta\\cos^2\\theta=\\alpha+\\beta\\cos\\gamma\\theta$일 때 $\\displaystyle\\int_0^{a}(\\alpha+\\beta\\cos\\gamma\\theta)d\\theta=c$. $c$의 값은? ($a=\\pi/2$)",
    options: [o("1","$\\dfrac{\\pi}{16}$"), o("2","$\\dfrac{\\pi}{4}$"), o("3","$1$"), o("4","$\\dfrac{\\pi^2}{4}$"), o("5","$\\dfrac{\\pi^2}{16}$")],
    answer: 1,
    explanation: "$\\sin^2\\theta\\cos^2\\theta=\\dfrac{1}{4}\\sin^2(2\\theta)=\\dfrac{1}{4}\\cdot\\dfrac{1-\\cos(4\\theta)}{2}=\\dfrac{1}{8}-\\dfrac{1}{8}\\cos(4\\theta)$.\n$\\alpha=\\dfrac{1}{8},\\,\\beta=-\\dfrac{1}{8},\\,\\gamma=4$.\n$\\displaystyle\\int_0^{\\pi/2}\\!\\left(\\dfrac{1}{8}-\\dfrac{1}{8}\\cos 4\\theta\\right)d\\theta=\\dfrac{1}{8}\\cdot\\dfrac{\\pi}{2}-0=\\dfrac{\\pi}{16}$."
  }),
  build({
    num: 50, subject: "적분학", unit: "이상적분", concept: "가우시안 결합 (지문 3)", difficulty: "medium",
    question: "$\\displaystyle\\int_0^{\\infty}x^2 e^{-x^2}dx$의 값을 구하면?",
    options: [o("1","$\\pi$"), o("2","$\\dfrac{\\pi}{2}$"), o("3","$1$"), o("4","$\\dfrac{\\sqrt{\\pi}}{2}$"), o("5","$\\dfrac{\\sqrt{\\pi}}{4}$")],
    answer: 5,
    explanation: "$b=\\displaystyle\\int_0^{\\infty}r^5 e^{-r^2}dr$. $r^2=u$ 치환 ($2r\\,dr=du$): $r^5 dr=r^4\\cdot r\\,dr=u^2\\cdot\\dfrac{du}{2}$. $b=\\dfrac{1}{2}\\!\\int_0^{\\infty}\\!u^2 e^{-u}du=\\dfrac{1}{2}\\cdot 2!=1$.\n$I^2=b\\cdot c=1\\cdot\\dfrac{\\pi}{16}=\\dfrac{\\pi}{16}$, $I=\\dfrac{\\sqrt{\\pi}}{4}$ (since $I>0$)."
  }),
];

console.log(`Uploading ${problems.length} problems for ${SCHOOL} ${YEAR}...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
console.log(`✅ Inserted ${data?.length ?? 0} questions for ${SCHOOL} ${YEAR}`);
