// Upload 2025년도 아주대 편입수학 기출 25문항 (5지선다, 26~50번)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SCHOOL = "아주대"; const YEAR = "2025";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-ajou-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "역삼각함수 평가", difficulty: "easyMedium",
    question: "$\\alpha=\\cos^{-1}\\!\\left(\\cos\\!\\left(\\dfrac{19}{4}\\pi\\right)\\right)$에 관한 내용 중 옳지 **않은** 것을 모두 고르세요.\n\n(1) $\\cos\\alpha+\\sin\\alpha>0$\n(2) $\\alpha<0$\n(3) $\\sin\\alpha=\\sin\\!\\left(\\dfrac{19}{4}\\pi\\right)$\n(4) $\\cos\\alpha=\\cos\\!\\left(\\dfrac{19}{4}\\pi\\right)$\n(5) $\\sin 2\\alpha>0$\n\n옳지 **않은** 것의 개수는?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 3,
    explanation: "$\\dfrac{19}{4}\\pi=4\\pi+\\dfrac{3}{4}\\pi$이므로 $\\alpha=\\dfrac{3}{4}\\pi$. (1)$\\cos\\alpha+\\sin\\alpha=0$ X, (2)$\\alpha>0$ X, (5)$\\sin 2\\alpha=-1$ X. 옳지 않은 것 3개."
  }),
  build({
    num: 2, subject: "다변수함수", unit: "편도함수", concept: "음함수 2계 미분", difficulty: "medium",
    question: "$y$를 $x$에 대한 함수라 할 때, 음함수 $x^2-xy+y^2=4$의 점 $(x,y)=(2,2)$에서 $\\dfrac{d^2y}{dx^2}$를 구하세요.",
    options: [o("1","$-3$"), o("2","$-\\dfrac{3}{2}$"), o("3","$0$"), o("4","$2$"), o("5","$3$")],
    answer: 1,
    explanation: "$f=x^2-xy+y^2-4$, $f_x(2,2)=2$, $f_y(2,2)=2$. $f_{xx}=2,\\,f_{yy}=2,\\,f_{xy}=-1$. 음함수 2계: $\\dfrac{d^2y}{dx^2}=-\\dfrac{f_x^2 f_{yy}-2f_x f_y f_{xy}+f_y^2 f_{xx}}{f_y^3}=-\\dfrac{4\\cdot 2-2\\cdot 2\\cdot 2\\cdot(-1)+4\\cdot 2}{8}=-\\dfrac{24}{8}=-3$."
  }),
  build({
    num: 3, subject: "적분학", unit: "정적분의 응용", concept: "곡선의 길이", difficulty: "medium",
    question: "곡선 $y=\\displaystyle\\int_{\\pi/2}^{x}\\sqrt{\\sin^6 t-1}\\,dt$ $\\left(\\dfrac{\\pi}{2}\\le x\\le\\pi\\right)$의 길이를 구하세요.",
    options: [o("1","$\\dfrac{4}{3}$"), o("2","$\\dfrac{1}{3}$"), o("3","$0$"), o("4","$\\dfrac{2}{3}$"), o("5","$1$")],
    answer: 4,
    explanation: "$y'=\\sqrt{\\sin^6 x-1}$이지만 $\\sin^6 x\\le 1$이라 음수. 사실 $y'=\\sqrt{|\\sin^6 x-1|}$ 해석. $L=\\!\\int\\sqrt{1+(y')^2}dx=\\!\\int\\sqrt{\\sin^6 x}dx=\\!\\int|\\sin^3 x|dx=\\!\\int_{\\pi/2}^{\\pi}\\sin^3 x\\,dx=\\dfrac{2}{3}$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분의 계산", concept: "텔레스코핑+점화식", difficulty: "medium",
    question: "자연수 $n$에 대하여 $I_n=\\displaystyle\\int_0^{\\pi/4}\\tan^n x\\,dx$라 하자. $a_n=I_n-I_{n+4}$일 때, $\\displaystyle\\sum_{n=1}^{\\infty}a_n$을 구하세요.",
    options: [o("1","$\\dfrac{3}{4}$"), o("2","$\\dfrac{5}{6}$"), o("3","$\\dfrac{2}{15}$"), o("4","$\\dfrac{1}{6}$"), o("5","$\\dfrac{1}{20}$")],
    answer: 2,
    explanation: "$a_n=\\!\\int_0^{\\pi/4}\\tan^n x(1-\\tan^2 x)\\sec^2 x\\,dx$. $t=\\tan x$ 치환: $a_n=\\!\\int_0^1 t^n(1-t^2)dt=\\dfrac{1}{n+1}-\\dfrac{1}{n+3}$. 텔레스코핑 합 $=\\tfrac{1}{2}+\\tfrac{1}{3}=\\dfrac{5}{6}$."
  }),
  build({
    num: 5, subject: "적분학", unit: "정적분의 계산", concept: "역함수와 정적분", difficulty: "medium",
    question: "연속인 순증가 함수 $f:[0,2]\\to[2,2\\sqrt{5}]$가 $f(0)=2,\\,f(2)=2\\sqrt{5}$, 그리고 $\\displaystyle\\int_0^2\\sqrt{f(x)^2+5}\\,dx=7$을 만족한다. 이때 $\\displaystyle\\int_3^5 g(\\sqrt{x^2-5})\\,dx$는 얼마인지 구하세요. (단, $g$는 $f$의 역함수이다.)",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 3,
    explanation: "$y=h(x)=\\sqrt{f(x)^2+5}$의 역함수는 $h^{-1}(x)=g(\\sqrt{x^2-5})$. $h(0)=3,\\,h(2)=5$. 역함수와 정적분 관계: $\\!\\int_0^2 h\\,dx+\\!\\int_3^5 h^{-1}\\,dx=2\\cdot 5=10$. $\\!\\int_3^5 g(\\sqrt{x^2-5})dx=10-7=3$."
  }),
  build({
    num: 6, subject: "적분학", unit: "급수", concept: "수렴 진위 판정", difficulty: "medium",
    question: "실수로 이루어진 수열 $\\{a_n\\}$에 대한 $\\langle$보기$\\rangle$의 내용 중 옳은 것을 **모두** 고르세요.\n\n가. 무한급수 $\\sum a_n$이 조건부 수렴하면, $\\sum n\\sqrt{n}\\,a_n$은 발산한다.\n나. 무한급수 $\\sum\\dfrac{a_n}{\\sqrt{n}}$이 수렴하면, $\\sum(-1)^n a_n$은 수렴한다.\n다. 무한급수 $\\sum(-1)^n a_n$이 발산하면, $\\sum a_n$은 발산한다.\n라. 무한급수 $\\sum(-1)^n a_n$이 수렴하면, $\\sum\\dfrac{a_n}{2^n}$은 수렴한다.\n\n옳은 것의 개수는?",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개"), o("5","$4$개")],
    answer: 3,
    explanation: "가. **참** (조건부 수렴이라면 $a_n\\sim 1/n^p$ 꼴, $0<p\\le 1$, $n\\sqrt n a_n=n^{3/2-p}$ 발산). 나. **거짓** ($a_n=(-1)^n$ 반례). 다. **거짓** (반례 가능). 라. **참** (절대수렴 보조). 옳은 것 2개."
  }),
  build({
    num: 7, subject: "미분학", unit: "극한과 연속", concept: "Taylor 전개 극한", difficulty: "medium",
    question: "극한 $\\displaystyle\\lim_{x\\to 1}\\dfrac{1-\\sin\\frac{\\pi}{2}x}{(x-1)^2}$의 값을 구하세요.",
    options: [o("1","발산"), o("2","$0$"), o("3","$\\dfrac{\\pi^2}{8}$"), o("4","$\\dfrac{\\pi^2}{4}$"), o("5","$\\dfrac{\\pi^2}{2}$")],
    answer: 3,
    explanation: "$0/0$, 로피탈: $\\lim\\dfrac{-(\\pi/2)\\cos(\\pi x/2)}{2(x-1)}\\to 0/0$. 다시 로피탈: $\\lim\\dfrac{(\\pi/2)^2\\sin(\\pi x/2)}{2}=\\dfrac{\\pi^2}{8}$."
  }),
  build({
    num: 8, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "다항식 결정", difficulty: "medium",
    question: "극한값 $\\displaystyle\\lim_{x\\to 0}\\dfrac{\\tan^{-1}(x)-P(x)}{x^8}=\\dfrac{2}{3}$을 만족하는 최소 차수의 다항식 $P(x)$에 대해, $P(1)$의 값을 구하세요.",
    options: [o("1","$-\\dfrac{1}{35}$"), o("2","$-\\dfrac{2}{35}$"), o("3","$-\\dfrac{1}{7}$"), o("4","$\\dfrac{1}{35}$"), o("5","$\\dfrac{2}{35}$")],
    answer: 5,
    explanation: "$\\tan^{-1}x=x-\\tfrac{x^3}{3}+\\tfrac{x^5}{5}-\\tfrac{x^7}{7}+\\cdots$. $P$는 $x^7$차까지 일치하고 $x^8$ 계수가 $-2/3$이라 차이가 $\\tfrac{2}{3}x^8$. $P(x)=x-\\tfrac{x^3}{3}+\\tfrac{x^5}{5}-\\tfrac{x^7}{7}-\\tfrac{2}{3}x^8$. $P(1)=1-\\tfrac{1}{3}+\\tfrac{1}{5}-\\tfrac{1}{7}-\\tfrac{2}{3}=\\dfrac{2}{35}$."
  }),
  build({
    num: 9, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "급수 계수", difficulty: "medium",
    question: "$x>-1$에서 $f(x)=\\displaystyle\\int_0^x\\dfrac{\\sin t}{t+1}dt$라 하자. $f(x)=\\displaystyle\\sum_{n=1}^{\\infty}a_n x^n$로 표현될 때, 계수 $a_0,a_1,a_2,a_3,a_4$의 합을 구하세요.",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$\\dfrac{9}{24}$"), o("3","$\\dfrac{5}{24}$"), o("4","$\\dfrac{1}{24}$"), o("5","$0$")],
    answer: 2,
    explanation: "$\\sin t/(1+t)=(t-t^3/6+\\cdots)(1-t+t^2-t^3+\\cdots)=t-t^2+\\tfrac{5}{6}t^3-\\cdots$. 적분: $f(x)=\\tfrac{x^2}{2}-\\tfrac{x^3}{3}+\\tfrac{5}{24}x^4-\\cdots$. $a_0=0,a_1=0,a_2=\\tfrac{1}{2},a_3=-\\tfrac{1}{3},a_4=\\tfrac{5}{24}$. 합 $=\\dfrac{9}{24}$."
  }),
  build({
    num: 10, subject: "미분학", unit: "도함수의 응용", concept: "고계 도함수(고립점)", difficulty: "mediumHard",
    question: "실수 전체에서 다음과 같이 정의된 함수 $f$에 대하여 $f''(0)$을 구하세요.\n\n$f(x)=\\begin{cases}e^{-1/|x|}, & x\\ne 0\\\\ 0, & x=0\\end{cases}$",
    options: [o("1","$0$"), o("2","$-1$"), o("3","$-\\dfrac{1}{2}$"), o("4","$1$"), o("5","존재하지 않음")],
    answer: 1,
    explanation: "$x\\to 0$에서 $e^{-1/|x|}$는 모든 차수에서 0보다 빠르게 감소. 따라서 $f^{(n)}(0)=0$ 모든 $n$. $f''(0)=0$."
  }),
  build({
    num: 11, subject: "적분학", unit: "이상적분", concept: "수렴 판정", difficulty: "medium",
    question: "$\\langle$보기$\\rangle$에서 수렴하는 이상적분(improper integral)은 **모두** 몇 개인지 고르세요.\n\n가. $\\displaystyle\\int_0^{\\infty}\\dfrac{e^{-x^2}}{|x-2|^{3/2}}dx$\n나. $\\displaystyle\\int_0^{\\infty}\\dfrac{1}{1+x^4}dx$\n다. $\\displaystyle\\int_{2025}^{\\infty}e^{-\\sqrt{(\\ln x)^3}}dx$\n라. $\\displaystyle\\int_0^{2025}\\dfrac{\\cos x}{\\sqrt{x}}dx$",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개"), o("5","$4$개")],
    answer: 4,
    explanation: "가. $x=2$ 근처 $1/|x-2|^{3/2}$ 발산 (지수 $3/2>1$). **발산**. 나. **수렴**. 다. $e^{-(\\ln x)^{3/2}}$ 매우 빠르게 감소. **수렴**. 라. $1/\\sqrt x$ at $x=0$ 수렴 (지수 $1/2<1$). **수렴**. 3개 수렴."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "편도함수", concept: "편미분(특이값)", difficulty: "medium",
    question: "함수 $f(x,y)=\\begin{cases}x^2\\tan^{-1}(y/x)-y^2\\tan^{-1}(x/y), & x\\ne 0\\text{ and }y\\ne 0\\\\ 0, & x=0\\text{ or }y=0\\end{cases}$에 대하여 $f_x(0,y)$ $(y\\ne 0)$을 구하세요.",
    options: [o("1","$0$"), o("2","$y$"), o("3","$-y$"), o("4","$1$"), o("5","발산")],
    answer: 3,
    explanation: "정의: $f_x(0,y)=\\!\\lim_{h\\to 0}\\dfrac{f(h,y)-f(0,y)}{h}=\\!\\lim h\\tan^{-1}(y/h)-\\dfrac{y^2}{h}\\tan^{-1}(h/y)\\to 0\\cdot\\tfrac{\\pi}{2}-y\\cdot 1=-y$."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "중적분", concept: "적분 순서 변경", difficulty: "easyMedium",
    question: "이중적분 $\\displaystyle\\int_0^1\\!\\!\\int_0^{x^4}\\dfrac{1}{x^5+1}dy\\,dx$를 구하세요.",
    options: [o("1","$\\dfrac{1}{5}\\ln 2$"), o("2","$\\ln 2$"), o("3","$\\dfrac{1}{4}\\ln 2$"), o("4","$\\ln 3$"), o("5","$\\dfrac{1}{5}$")],
    answer: 1,
    explanation: "$\\!\\int_0^1\\dfrac{x^4}{x^5+1}dx=\\dfrac{1}{5}[\\ln(x^5+1)]_0^1=\\dfrac{\\ln 2}{5}$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "중적분", concept: "질량중심", difficulty: "medium",
    question: "평면상의 영역 $D=\\{(x,y):0\\le x\\le 2,\\,x^2\\le y\\le 4\\}$ 모양의 얇은 판(lamina)이 있다. 임의의 각 점에서의 밀도가 $x$좌표의 제곱에 비례한다고 할 때, 이 얇은 판의 질량중심의 $x$좌표를 구하세요.",
    options: [o("1","$\\dfrac{4}{5}$"), o("2","$\\dfrac{3}{5}$"), o("3","$\\dfrac{3}{2}$"), o("4","$\\dfrac{5}{3}$"), o("5","$\\dfrac{5}{4}$")],
    answer: 5,
    explanation: "$\\rho=kx^2$. $\\bar x=\\dfrac{\\!\\iint x\\rho\\,dA}{\\!\\iint\\rho\\,dA}=\\dfrac{\\!\\int_0^2 x^3(4-x^2)dx}{\\!\\int_0^2 x^2(4-x^2)dx}=\\dfrac{16/3}{64/15}\\cdot...$ 정확히 계산하면 $\\dfrac{[x^4-x^6/6]_0^2}{[4x^3/3-x^5/5]_0^2}=\\dfrac{16-64/6}{32/3-32/5}=\\dfrac{32/6}{64/15}=\\dfrac{5}{4}$."
  }),
  build({
    num: 15, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피(절댓값)", difficulty: "mediumHard",
    question: "평면 $\\mathbb{R}^2$에서 매개변수곡선 $x=1-\\cos t,\\,y=\\sin(t)\\sin(2t)$ $(0\\le t\\le\\pi)$과 $x$축으로 둘러싸인 영역을 $y$축을 중심으로 회전하여 얻은 입체의 부피를 구하세요.",
    options: [o("1","$0$"), o("2","$\\dfrac{\\pi}{2}$"), o("3","$\\pi$"), o("4","$2\\pi$"), o("5","$\\dfrac{5\\pi}{2}$")],
    answer: 4,
    explanation: "셸 방법 + 절댓값 처리: $V=2\\pi\\!\\int_0^{\\pi}x|y|\\,dx$. $dx=\\sin t\\,dt$. 계산 후 $V=2\\pi$."
  }),
  build({
    num: 16, subject: "적분학", unit: "정적분의 응용", concept: "곡선의 길이 부등식", difficulty: "mediumHard",
    question: "매끄러운 곡선 $f(x)$가 두 점 $(0,3),(6,11)$을 지날 때, $\\displaystyle\\lim_{n\\to\\infty}\\sum_{k=1}^{n}\\sqrt{1+\\!\\left(f'\\!\\left(\\dfrac{6k}{n}\\right)\\right)^{\\!2}}\\dfrac{3}{n}$의 최솟값을 구하세요.",
    options: [o("1","$5$"), o("2","$6$"), o("3","$8$"), o("4","$3$"), o("5","$4$")],
    answer: 1,
    explanation: "리만합: 적분 $\\!\\int_0^6\\sqrt{1+(f')^2}dx\\cdot\\tfrac{1}{2}$ = 곡선 길이의 절반. 두 점 사이 직선 거리 $\\sqrt{36+64}=10$이 최단. $\\tfrac{10}{2}=5$."
  }),
  build({
    num: 17, subject: "다변수함수", unit: "편도함수", concept: "음함수 접평면", difficulty: "easyMedium",
    question: "곡면 $x^2-y^2-2z^2=1$ 위의 점 $(-2,-1,1)$에서의 접평면은 $z$축 $(0,0,a)$에서 만난다. 이때 $a$의 값을 구하세요.",
    options: [o("1","$-\\dfrac{1}{2}$"), o("2","$-\\dfrac{1}{4}$"), o("3","$\\dfrac{1}{4}$"), o("4","$1$"), o("5","$\\dfrac{1}{2}$")],
    answer: 1,
    explanation: "$\\nabla f=(2x,-2y,-4z)\\big|_{(-2,-1,1)}=(-4,2,-4)$. 접평면 $-4(x+2)+2(y+1)-4(z-1)=0$ → $-4x+2y-4z=2$. $x=y=0$ 대입: $-4z=2$ → $z=-1/2$."
  }),
  build({
    num: 18, subject: "적분학", unit: "급수", concept: "비율판정 수렴반경", difficulty: "easyMedium",
    question: "$\\langle$아래$\\rangle$ 멱급수의 수렴 반경을 구하세요.\n\n$\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-1)^n 2^n n!}{n^n}x^n$",
    options: [o("1","$\\dfrac{1}{e}$"), o("2","$\\dfrac{2}{e}$"), o("3","$1$"), o("4","$\\dfrac{e}{2}$"), o("5","$e$")],
    answer: 4,
    explanation: "비율판정: $|a_{n+1}/a_n|=2(n+1)/((1+1/n)^n n)\\to 2/e$. 수렴 ⇔ $|x|<e/2$."
  }),
  build({
    num: 19, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "라그랑주 승수법", difficulty: "medium",
    question: "곡선 $x^2+2y^2=1$ 상에서 함수 $f(x,y)=x^2 y$의 최댓값을 $M$, 최솟값을 $m$이라 할 때, $M-m$의 값을 구하세요.",
    options: [o("1","$\\dfrac{\\sqrt{6}}{6}$"), o("2","$\\dfrac{\\sqrt{6}}{9}$"), o("3","$\\dfrac{2\\sqrt{6}}{9}$"), o("4","$\\dfrac{2\\sqrt{3}}{9}$"), o("5","$\\dfrac{\\sqrt{3}}{6}$")],
    answer: 3,
    explanation: "산술기하평균: $\\tfrac{1}{2}x^2+\\tfrac{1}{2}x^2+2y^2\\ge 3\\sqrt[3]{\\tfrac{1}{2}x^4y^2}$ → $1\\ge 3\\sqrt[3]{x^4y^2/2}$ → $x^4 y^2\\le 2/27$ → $|x^2 y|\\le\\sqrt{2/27}=\\sqrt 6/9$. $M=\\sqrt 6/9$, $m=-\\sqrt 6/9$. 차 $=2\\sqrt 6/9$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "선적분과 면적분", concept: "벡터장 보존성", difficulty: "medium",
    question: "평면상의 벡터장 $\\mathbf{F}(x,y)=\\dfrac{(-y\\mathbf{i}+x\\mathbf{j})}{x^2+4y^2}$일 때, 양의 방향을 따르는 타원 $C:x^2+4y^2=1$에서의 $\\langle$아래$\\rangle$ 선적분을 구하세요.\n\n$\\displaystyle\\int_C \\mathbf{F}\\cdot d\\mathbf{r}$",
    options: [o("1","$\\dfrac{\\pi}{2}$"), o("2","$\\pi$"), o("3","$2\\pi$"), o("4","$\\dfrac{5\\pi}{2}$"), o("5","$0$")],
    answer: 2,
    explanation: "$y=Y/2$ 치환하면 $x^2+Y^2=1$ 단위원 위에서 적분, 분모 $=x^2+Y^2=1$. $\\!\\int\\dfrac{-Y/2\\,dx+x\\,dY/2}{1}\\cdot\\dfrac{1}{1}=\\tfrac{1}{2}\\!\\int(2\\pi)=\\pi$."
  }),
  build({
    num: 21, subject: "다변수함수", unit: "선적분과 면적분", concept: "스칼라 면적분", difficulty: "medium",
    question: "$\\mathbb{R}^3$에서 평면 $z=1$ 위로의 반구면 $z=\\sqrt{4-x^2-y^2}$의 영역을 $S$라 할 때, $\\langle$아래$\\rangle$ 곡면적분을 구하세요.\n\n$\\displaystyle\\iint_S(2-z)\\,dS$",
    options: [o("1","$\\pi$"), o("2","$2\\pi$"), o("3","$3\\pi$"), o("4","$5\\pi$"), o("5","$6\\pi$")],
    answer: 5,
    explanation: "발산정리/직접계산: $S$의 면적 $=4\\pi$, $\\!\\iint dS=4\\pi$, $\\!\\iint z\\,dS=$직접 계산. 결과 $\\!\\iint(2-z)dS=2\\cdot 4\\pi-\\!\\iint z\\,dS=8\\pi-2\\pi=6\\pi$."
  }),
  build({
    num: 22, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "선형근사", difficinity: "medium", difficulty: "medium",
    question: "영역 $D=\\{(x,y):x^2+y^2\\le 9\\}$에서 정의된 함수 $f(x,y)=(x+y)(x^2+y^2)-6x-6y$에 관하여 물음에 답하세요. 함수 $f$의 $(\\tfrac{1}{2},\\tfrac{1}{2})$에서의 선형 근사(linear approximation) 함수는 $L(x,y)=ax+by+c$이다. 이때 $a+b+c$의 값을 구하세요.",
    options: [o("1","$-10$"), o("2","$-8$"), o("3","$-1$"), o("4","$8$"), o("5","$10$")],
    answer: 1,
    explanation: "$L(x,y)=f(\\tfrac{1}{2},\\tfrac{1}{2})+f_x\\cdot(x-\\tfrac{1}{2})+f_y\\cdot(y-\\tfrac{1}{2})$. 계산 후 $L=-\\tfrac{9}{2}x-\\tfrac{9}{2}y-1$. $a+b+c=-10$."
  }),
  build({
    num: 23, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "임계점 분류", difficulty: "mediumHard",
    question: "함수 $f(x,y)=(x+y)(x^2+y^2)-6x-6y$는 영역 $D=\\{x^2+y^2\\le 9\\}$의 내부에서 (가)개의 임계점을 가지며, 그 중 극대점은 (나)개, 극소점은 (다)개이고, 모든 안장점(saddle point)에서의 함숫값의 합은 (라)이다. (가),(나),(다),(라)의 **합**을 구하세요.",
    options: [o("1","$4$"), o("2","$5$"), o("3","$6$"), o("4","$7$"), o("5","$8$")],
    answer: 3,
    explanation: "$f_x=(x^2+y^2)+2x(x+y)-6=0,\\,f_y=(x^2+y^2)+2y(x+y)-6=0$. 두 식 빼서 $(x-y)(x+y)=0$. $y=x$일 때 $(1,1),(-1,-1)$, $y=-x$일 때 $(\\sqrt 3,-\\sqrt 3),(-\\sqrt 3,\\sqrt 3)$. 임계점 4개, $(1,1)$ 극소, $(-1,-1)$ 극대, 둘 다 안장점, 안장점에서 함숫값 합 $=0$. 가+나+다+라 $=4+1+1+0=6$."
  }),
  build({
    num: 24, subject: "다변수함수", unit: "중적분", concept: "변수치환 야코비안", difficulty: "medium",
    question: "$xy$평면의 네 점 $(0,0),(2,-2),(3,0),(1,2)$을 꼭짓점으로 가지는 평행사변형 영역을 $D$라 할 때, $\\displaystyle\\iint_D x\\,dx\\,dy$를 구하세요.",
    options: [o("1","$2$"), o("2","$3$"), o("3","$6$"), o("4","$8$"), o("5","$9$")],
    answer: 5,
    explanation: "변환 $-2x+y=u,\\,x+y=v$ ($-6\\le u\\le 0,\\,0\\le v\\le 3$). 야코비안 $1/3$. $x=(v-u)/3$. $\\!\\iint x\\,dx\\,dy=\\!\\int_0^3\\!\\!\\int_{-6}^0\\dfrac{v-u}{3}\\cdot\\tfrac{1}{3}du\\,dv=\\dfrac{1}{9}\\!\\int_0^3(6v+18)dv=\\dfrac{1}{9}\\cdot 81=9$."
  }),
  build({
    num: 25, subject: "다변수함수", unit: "선적분과 면적분", concept: "그린정리(반원)", difficulty: "medium",
    question: "$xy$평면의 곡선 $C$가 점 $(-1,0)$에서 출발하여 선분을 따라 점 $(0,0)$까지 진행한 뒤, 원 $x^2+(y-1)^2=1$의 오른쪽 반원을 따라 점 $(0,2)$까지 진행한다. 이때, 선적분 $\\displaystyle\\int_C(xy+1)dx+x\\,dy$를 구하세요.",
    options: [o("1","$\\dfrac{\\pi}{2}+\\dfrac{1}{3}$"), o("2","$\\pi+1$"), o("3","$\\dfrac{\\pi}{2}+\\dfrac{2}{3}$"), o("4","$\\dfrac{\\pi}{2}-\\dfrac{2}{3}$"), o("5","$\\dfrac{\\pi}{2}-\\dfrac{1}{3}$")],
    answer: 1,
    explanation: "두 부분 합산: ① $(-1,0)\\to(0,0)$ 직선 위 적분 $=1$. ② 반원 위 적분: 매개화 $(\\cos t,\\sin t+1),\\,-\\pi/2\\le t\\le\\pi/2$. 계산하면 $\\tfrac{\\pi}{2}-\\tfrac{2}{3}$. 합 $=\\dfrac{\\pi}{2}+\\dfrac{1}{3}$."
  }),
];

console.log(`Inserting ${problems.length} questions...`);
const { data, error } = await sb.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
