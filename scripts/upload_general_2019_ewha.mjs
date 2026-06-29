// Upload 2019년도 이화여대 편입수학 기출 30문항 (5지 선다, 100분)
// 21~30번은 원본이 공통 보기 20개에서 선택하는 형식이나, 4-5지 선다로 변환
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

const SCHOOL = "이화여대";
const YEAR = "2019";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-ewha-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "함수와 합성", concept: "역함수 합성 계산", difficulty: "easy",
    question: "함수 $f(x)=2x+1$과 $g(x)=2x$에 대하여 $(g\\circ f^{-1})(1)-(f\\circ g^{-1})(1)$의 값을 구하시오.",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$0$"), o("4","$1$"), o("5","$2$")],
    answer: 1,
    explanation: "$f^{-1}(1)=0$ ⇒ $g(0)=0$.\n$g^{-1}(1)=1/2$ ⇒ $f(1/2)=2$.\n$0-2=-2$."
  }),
  build({
    num: 2, subject: "미분학", unit: "함수의 동등성", concept: "정의역 제한 함수 동등성", difficulty: "medium",
    question: "정의역이 $X=\\{0,1\\}$일 때, 함수 $y=x$와 서로 같은 함수를 모두 찾으시오.\n\na. $y=x^2$\nb. $y=\\sin(\\pi-\\pi x)$\nc. $y=\\!\\displaystyle\\lim_{h\\to 0}\\dfrac{\\sin(hx)}{h}$",
    options: [o("1","a"), o("2","b"), o("3","c"), o("4","a, c"), o("5","a, b, c")],
    answer: 4,
    explanation: "$\\{0,1\\}$에서:\na: $0^2=0,\\,1^2=1$ ⇒ 같음.\nb: $\\sin\\pi=0,\\,\\sin 0=0$ ⇒ $y(1)=0\\ne 1$. 다름.\nc: $\\lim_{h\\to 0}\\dfrac{\\sin hx}{h}=x$ ⇒ 같음."
  }),
  build({
    num: 3, subject: "미분학", unit: "다항식 나눗셈", concept: "다항식 나머지 정리 (문제 오류)", difficulty: "medium",
    question: "$2019^3+2018^3-1$을 $2019^2+2018^2$로 나누었을 때의 나머지를 구하시오. (해설지: 정답 (2)와 (3) 모두 가능 — 문제 오류)",
    options: [o("1","$2018^2-1$"), o("2","$2019^2-1$"), o("3","$2018\\cdot 2020$"), o("4","$2020$"), o("5","$2019$")],
    answer: 2,
    explanation: "$x=2018$로 치환: $(x+1)^3+x^3-1=\\{(x+1)^2+x^2\\}Q(x)+ax+b$.\n나누면 나머지 $x(x+2)=2018\\cdot 2020=2019^2-1$.\n두 표현 모두 같은 값이지만 보기에 모두 들어가 있어 문제 오류."
  }),
  build({
    num: 4, subject: "미분학", unit: "롤·평균값 정리", concept: "고차도함수 영점 개수", difficulty: "mediumHard",
    question: "실수 전체에서 무한 번 미분 가능한 함수 $f(x)$는 다음과 같이 자연수에서 함숫값의 부호를 교대로 갖는다.\n$f(0)>0,\\,f(1)<0,\\ldots,f(2019)<0$.\n이때, 일반적으로 참인 명제들을 모두 고르시오.\n\na. $f'(x)$는 적어도 $2019$개의 근을 갖는다.\nb. $f''(x)$는 적어도 $2017$개의 근을 갖는다.\nc. 고차 미분 $f^{(2019)}(x)$는 적어도 $1$개의 근을 갖는다.",
    options: [o("1","a"), o("2","b"), o("3","c"), o("4","a, b"), o("5","a, b, c")],
    answer: 2,
    explanation: "a 거짓: 부호 변화 2019번 → 영점 최소 2019 ⇒ 극값 최소 2018, $f'$ 영점 최소 2018개 (2019 X).\nb 참: $f'$ 영점 최소 2018개 ⇒ $f''$ 영점 최소 2017개.\nc 거짓: 2019차 다항함수 반례 → $f^{(2019)}$는 상수."
  }),
  build({
    num: 5, subject: "기타", unit: "기하", concept: "정사각형 종이접기 길이", difficulty: "mediumHard",
    question: "한 변의 길이가 $1$인 정사각형 모양의 종이를 접었을 때, 선분 $\\overline{AB}$의 길이를 구하시오. (위쪽 변 $1/4$ 지점에서 대각선 방향으로 접음)",
    options: [
      o("1","$\\dfrac{25}{32}$"),
      o("2","$\\dfrac{\\sqrt{17}}{4}$"),
      o("3","$\\sqrt 2+\\sqrt 3$"),
      o("4","$\\sqrt 5-1$"),
      o("5","$\\dfrac{\\sqrt 7}{3}$"),
    ],
    answer: 2,
    explanation: "오른쪽 상단 삼각형 $y^2=x^2+(1/4)^2,\\,x+y=1$ ⇒ $x=15/32,y=17/32$.\n파란 삼각형 $b^2=a^2+1,\\,(1-a)^2+(3/4)^2=b^2$ ⇒ $a=9/32$.\n$(\\overline{AB})^2=1+(y-a)^2=1+(8/32)^2=17/16$ ⇒ $\\overline{AB}=\\sqrt{17}/4$."
  }),
  build({
    num: 6, subject: "적분학", unit: "수열의 극한", concept: "점화식 수열 진동", difficulty: "mediumHard",
    question: "다음과 같이 정의된 수열 $x_n$의 극한값 $\\!\\displaystyle\\lim_{n\\to\\infty}x_n$을 구하시오.\n\n$x_{n+1}=x_n+\\dfrac{x_n-x_n^3}{3x_n^2-1},\\;n=0,1,2,\\ldots,\\;x_0=\\dfrac{\\sqrt 5}{5}$",
    options: [o("1","$-1$"), o("2","$0$"), o("3","$1$"), o("4","존재하지 않는다"), o("5","$\\sqrt 3$")],
    answer: 4,
    explanation: "$x_0=\\sqrt 5/5$ 대입: $x_1=-\\sqrt 5/5$, $x_2=\\sqrt 5/5$ ...\n짝수항 $\\sqrt 5/5$, 홀수항 $-\\sqrt 5/5$로 진동.\n극한 존재하지 않음."
  }),
  build({
    num: 7, subject: "미분학", unit: "극한과 연속", concept: "테일러 전개 극한 ($t\\to 1$)", difficulty: "mediumHard",
    question: "극한 $\\!\\displaystyle\\lim_{t\\to 1}\\dfrac{t^2-e^{t-1}-\\ln t}{\\sin^2(\\pi t)}$의 값을 구하시오.",
    options: [
      o("1","$-1$"),
      o("2","$0$"),
      o("3","$\\dfrac{1}{\\pi^2}$"),
      o("4","$\\dfrac{1}{\\pi}$"),
      o("5","$\\dfrac{-1}{\\pi}$"),
    ],
    answer: 3,
    explanation: "$t-1=x$ 치환, 분자 테일러 전개 후 $x^2+\\cdots$.\n분모 $\\sin^2(\\pi+\\pi x)=\\sin^2\\pi x=\\pi^2 x^2+\\cdots$.\n비 $\\to\\dfrac{1}{\\pi^2}$."
  }),
  build({
    num: 8, subject: "적분학", unit: "급수", concept: "급수 수렴 판정 (네 식)", difficulty: "medium",
    question: "다음의 급수들 중 수렴하는 것을 모두 고르시오.\n\na. $\\!\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{1}{n(\\ln n)^n}$\nb. $\\!\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{(-1)^n}{\\ln n}$\nc. $\\!\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{1}{n(1+(\\ln n)^2)}$\nd. $\\!\\displaystyle\\sum_{n=6}^{\\infty}\\dfrac{1}{n^2-6n+5}$",
    options: [o("1","b, c"), o("2","a, b, d"), o("3","a, b, c"), o("4","b, c, d"), o("5","a, b, c, d")],
    answer: 5,
    explanation: "a: $n$승근 $\\to 0$ 수렴.\nb: 교대급수, $1/\\ln n\\to 0$ 수렴.\nc: 적분판정 $\\!\\int 1/(x(1+(\\ln x)^2))dx=\\arctan(\\ln x)$ 수렴.\nd: $\\sim 1/n^2$ 수렴."
  }),
  build({
    num: 9, subject: "미분학", unit: "부등식", concept: "$x-1-\\ln x>(\\ln x)^2/2$ 부등식 영역", difficulty: "medium",
    question: "실수 $x>0$에 대해 $x-1-\\ln x>\\dfrac{1}{2}(\\ln x)^2$이 성립하는 구간 중 포함범위가 가장 넓은 구간을 고르시오.",
    options: [o("1","$(0,1)$"), o("2","$(0,e)$"), o("3","$(1,e)$"), o("4","$(1,\\infty)$"), o("5","$(0,\\infty)$")],
    answer: 4,
    explanation: "$f(x)=\\dfrac{1}{2}(\\ln x)^2+\\ln x-x+1$로 두면 $f'(x)=\\dfrac{\\ln x+1-x}{x}\\le 0$, $f(1)=0$.\n$x>1$에서 $f(x)<0$ ⇒ 원 부등식 성립.\n포함 범위 가장 넓은 것 $(1,\\infty)$."
  }),
  build({
    num: 10, subject: "미분학", unit: "접선", concept: "직선과 접선의 각", difficulty: "mediumHard",
    question: "그래프 $y=x^2$의 $x=1/2$에서의 접선을 $m$이라 하자. 직선 $y=\\dfrac{3}{2}x-\\dfrac{1}{2}$과 직선 $l$은 직선 $m$과 같은 각을 이룬다. 직선 $l$의 방정식을 구하시오.",
    options: [
      o("1","$y=\\dfrac{2}{3}x-\\dfrac{1}{12}$"),
      o("2","$y=x-\\dfrac{1}{4}$"),
      o("3","$y=\\dfrac{1}{2}x$"),
      o("4","$y=\\dfrac{1}{3}x+\\dfrac{1}{12}$"),
      o("5","$y=\\dfrac{3}{4}x-\\dfrac{1}{8}$"),
    ],
    answer: 1,
    explanation: "$m: y=x-1/4$(점 $(1/2,1/4)$).\n주어진 직선을 $m$에 대해 대칭이동: $y=3x/2-1/2$ → 평행이동 후 $y=x$에 대칭이동 적용 → $y=2x/3+1/6$.\n다시 평행이동: $y=2x/3-1/12$."
  }),
  build({
    num: 11, subject: "다변수함수", unit: "조건부 극값", concept: "산술기하평균 부등식 최댓값", difficulty: "medium",
    question: "등식 $x^4+y^4=\\dfrac{3}{4}$을 만족하는 실수 $x,y$에 대해 $x^2 y$의 최댓값을 구하시오.",
    options: [
      o("1","$\\dfrac{3}{8}$"),
      o("2","$\\dfrac{2^{1/4}}{2\\sqrt 2}$"),
      o("3","$\\!\\left(\\dfrac{3}{2}\\right)^{\\!3/4}$"),
      o("4","$1$"),
      o("5","$\\dfrac{1}{2}$"),
    ],
    answer: 5,
    explanation: "산술기하: $\\dfrac{1}{2}x^4+\\dfrac{1}{2}x^4+y^4\\ge 3\\!\\left(\\dfrac{1}{4}x^8 y^4\\right)^{\\!1/3}$.\n$3/4\\ge 3(x^8 y^4/4)^{1/3}$ ⇒ $x^8 y^4\\le 1/64$ ⇒ $x^2 y\\le 1/2$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "조건부 극값", concept: "치환 후 코시 부등식 극값", difficulty: "mediumHard",
    question: "실수 $a,b,c$에 대하여 $a+2b+3c=\\sqrt 6$이고 $a^2+4b^2+9c^2=2$일 때, $a^3+8b^3+27c^3$의 값을 구하시오.",
    options: [o("1","$2-\\sqrt 6$"), o("2","$\\sqrt 6$"), o("3","$\\dfrac{2}{3}\\sqrt 6$"), o("4","$3\\sqrt 3$"), o("5","$1$")],
    answer: 3,
    explanation: "$x=a,y=2b,z=3c$ 치환: $x+y+z=\\sqrt 6$, $x^2+y^2+z^2=2$ → $x^3+y^3+z^3=?$.\n$(x+y+z)^2=2+2(xy+yz+zx)$ ⇒ $xy+yz+zx=2$.\n$x^2+y^2+z^2-xy-yz-zx=0$ ⇒ $x=y=z=\\sqrt 6/3$.\n$x^3+y^3+z^3=3\\cdot 6\\sqrt 6/27=\\dfrac{2}{3}\\sqrt 6$."
  }),
  build({
    num: 13, subject: "적분학", unit: "정적분", concept: "유리함수 적분", difficulty: "easy",
    question: "정적분 $\\!\\displaystyle\\int_0^4\\dfrac{3x}{1+2x}\\,dx$의 값을 계산하시오.",
    options: [
      o("1","$12\\ln 3$"),
      o("2","$12-3\\ln 3$"),
      o("3","$6-\\dfrac{9}{4}\\ln 3$"),
      o("4","$\\dfrac{27}{4}-\\dfrac{3}{2}\\ln 3$"),
      o("5","$6-\\dfrac{3}{2}\\ln 3$"),
    ],
    answer: 5,
    explanation: "$\\dfrac{3x}{1+2x}=\\dfrac{3}{2}-\\dfrac{3/2}{1+2x}$.\n$\\!\\int_0^4=\\dfrac{3}{2}\\cdot 4-\\dfrac{3}{4}\\ln(1+2x)\\Big|_0^4=6-\\dfrac{3}{4}\\ln 9=6-\\dfrac{3}{2}\\ln 3$."
  }),
  build({
    num: 14, subject: "적분학", unit: "정적분", concept: "월리스 공식 (cos^5)", difficulty: "medium",
    question: "정적분 $\\!\\displaystyle\\int_{\\pi/2}^{3\\pi/2}\\cos^5\\theta\\,d\\theta$의 값을 계산하시오.",
    options: [o("1","$\\dfrac{15}{16}$"), o("2","$-\\dfrac{16}{15}$"), o("3","$32$"), o("4","$-32$"), o("5","$0$")],
    answer: 2,
    explanation: "대칭으로 $\\!\\int_{\\pi/2}^{3\\pi/2}\\cos^5=-2\\!\\int_0^{\\pi/2}\\cos^5\\theta\\,d\\theta=-2\\cdot\\dfrac{4}{5}\\cdot\\dfrac{2}{3}=-\\dfrac{16}{15}$."
  }),
  build({
    num: 15, subject: "적분학", unit: "정적분", concept: "부분적분 (x²ln x)", difficulty: "easy",
    question: "정적분 $\\!\\displaystyle\\int_1^e x^2\\ln x\\,dx$의 값을 계산하시오.",
    options: [
      o("1","$\\dfrac{2e^3-8}{9}$"),
      o("2","$\\dfrac{-e^3+1}{9}$"),
      o("3","$\\dfrac{2e^3+1}{3}$"),
      o("4","$\\dfrac{2e^3+1}{9}$"),
      o("5","$\\dfrac{2e^3-1}{9}$"),
    ],
    answer: 4,
    explanation: "부분적분: $u=\\ln x,v'=x^2$.\n$\\!\\int=\\dfrac{x^3\\ln x}{3}\\Big|_1^e-\\!\\int_1^e\\dfrac{x^2}{3}dx=\\dfrac{e^3}{3}-\\dfrac{e^3-1}{9}=\\dfrac{2e^3+1}{9}$."
  }),
  build({
    num: 16, subject: "적분학", unit: "정적분", concept: "삼각치환 정적분", difficulty: "medium",
    question: "정적분 $\\!\\displaystyle\\int_0^{1/2}\\dfrac{x^2}{\\sqrt{1-x^2}}\\,dx$의 값을 계산하시오.",
    options: [
      o("1","$\\dfrac{\\sqrt 3}{2}$"),
      o("2","$\\dfrac{1}{24}$"),
      o("3","$\\dfrac{\\pi}{12}-\\dfrac{\\sqrt 3}{4}$"),
      o("4","$\\dfrac{\\pi}{12}+\\dfrac{\\sqrt 3}{8}$"),
      o("5","$\\dfrac{\\pi}{12}-\\dfrac{\\sqrt 3}{8}$"),
    ],
    answer: 5,
    explanation: "$x=\\sin\\theta$, $\\!\\int_0^{\\pi/6}\\sin^2\\theta\\,d\\theta=\\dfrac{1}{2}\\!\\left[\\theta-\\dfrac{\\sin 2\\theta}{2}\\right]_0^{\\pi/6}=\\dfrac{1}{2}\\!\\left(\\dfrac{\\pi}{6}-\\dfrac{\\sqrt 3}{4}\\right)=\\dfrac{\\pi}{12}-\\dfrac{\\sqrt 3}{8}$."
  }),
  build({
    num: 17, subject: "적분학", unit: "이상적분", concept: "이상적분 수렴 (네 식)", difficulty: "medium",
    question: "다음의 특이적분들 중 수렴하는 것을 모두 고르시오.\n\na. $\\!\\int_0^{\\infty}\\dfrac{1}{2+x^4}\\,dx$\nb. $\\!\\int_{-\\infty}^{\\infty}x^4 e^{-x^2}\\,dx$\nc. $\\!\\int_1^{\\infty}\\dfrac{\\cos(e^{x^2})}{x^2(2+\\sin x)}\\,dx$\nd. $\\!\\int_1^{\\infty}\\dfrac{(\\ln x)^2}{x^2}\\,dx$",
    options: [o("1","a"), o("2","a, b"), o("3","b, c"), o("4","a, b, c"), o("5","a, b, c, d")],
    answer: 5,
    explanation: "a: $\\sim 1/x^4$ 수렴.\nb: 가우스 적분 수렴.\nc: 절댓값 $\\le 1/x^2$ 수렴.\nd: $\\ln x=t$ 치환, $\\!\\int t^2 e^{-t}dt$ 수렴.\n모두 수렴."
  }),
  build({
    num: 18, subject: "적분학", unit: "극좌표", concept: "심장형 내부 넓이 차", difficulty: "killer",
    question: "극좌표 방정식 $r=\\dfrac{1}{2}+\\sin\\theta$로 주어지는 도형은 평면을 넓이 무한 부분 1개와 유한 부분 2개로 분할한다. 유한 두 부분의 넓이를 각각 $A,B$라 할 때 $|A-B|$를 계산하시오.",
    options: [
      o("1","$\\dfrac{3\\pi}{4}$"),
      o("2","$\\sqrt 3$"),
      o("3","$\\dfrac{3\\sqrt 3}{2}$"),
      o("4","$\\dfrac{3\\sqrt 3}{8}$"),
      o("5","$\\dfrac{9\\sqrt 3}{8}$"),
    ],
    answer: 5,
    explanation: "$r=0$ 시 $\\sin\\theta=-1/2$ ⇒ $\\theta=7\\pi/6,11\\pi/6$.\n큰 부분 $A=2\\!\\int_{\\pi/2}^{7\\pi/6}\\dfrac{1}{2}(1/2+\\sin\\theta)^2 d\\theta$ 등 계산.\n$|A-B|=\\dfrac{9\\sqrt 3}{8}$."
  }),
  build({
    num: 19, subject: "선형대수", unit: "행렬 거듭제곱", concept: "고윳값으로 trace 계산", difficulty: "medium",
    question: "행렬 $\\!\\begin{pmatrix}-8&6\\\\-9&7\\end{pmatrix}$을 $10$거듭제곱하여 얻는 행렬 $\\!\\begin{pmatrix}-8&6\\\\-9&7\\end{pmatrix}^{\\!10}$을 $\\!\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}$로 표현했을 때, 대각성분들의 합 $a+d$의 값을 구하시오.",
    options: [o("1","$1$"), o("2","$2$"), o("3","$1025$"), o("4","$2048$"), o("5","$8^{10}+7^{10}$")],
    answer: 3,
    explanation: "특성다항식 $\\lambda^2+\\lambda-2=(\\lambda+2)(\\lambda-1)=0$ ⇒ $\\lambda=-2,1$.\n$\\text{tr}(A^{10})=(-2)^{10}+1^{10}=1024+1=1025$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "선적분", concept: "벡터장 선적분 (원호)", difficulty: "mediumHard",
    question: "$x^2+y^2=9,\\,x\\ge 0,\\,y\\ge 0$로 주어지고 시계방향으로 방향이 주어진 원호를 $C$라 하자. 벡터장 $\\vec F(x,y)=x^2\\mathbf i+x\\mathbf j$에 대하여 선적분 $\\!\\displaystyle\\int_C\\vec F\\cdot d\\vec r$의 값을 구하시오.",
    options: [
      o("1","$-\\dfrac{9\\pi}{4}$"),
      o("2","$\\dfrac{9\\pi}{4}$"),
      o("3","$0$"),
      o("4","$-9\\!\\left(\\dfrac{\\pi}{4}-1\\right)$"),
      o("5","$9\\!\\left(\\dfrac{\\pi}{4}-1\\right)$"),
    ],
    answer: 4,
    explanation: "$r(t)=(3\\sin t,3\\cos t),0\\le t\\le\\pi/2$ (시계).\n$\\!\\int_0^{\\pi/2}(9\\sin^2 t,3\\sin t)\\cdot(3\\cos t,-3\\sin t)dt=\\!\\int(27\\sin^2 t\\cos t-9\\sin^2 t)dt=9-\\dfrac{9\\pi}{4}=-9(\\pi/4-1)$."
  }),
  build({
    num: 21, subject: "적분학", unit: "이중적분", concept: "적분 순서 교환 (sin x²)", difficulty: "medium",
    question: "중적분 $\\!\\displaystyle\\int_0^{\\sqrt{\\pi/2}}\\!\\int_y^{\\sqrt{\\pi/2}}\\sin(x^2)\\,dx\\,dy$의 값을 계산하시오.",
    options: [o("1","$0$"), o("2","$\\dfrac{1}{2}$"), o("3","$1$"), o("4","$\\dfrac{3}{2}$"), o("5","$2$")],
    answer: 2,
    explanation: "순서 교환: $\\!\\int_0^{\\sqrt{\\pi/2}}\\!\\int_0^x\\sin(x^2)dy\\,dx=\\!\\int_0^{\\sqrt{\\pi/2}}x\\sin(x^2)dx=\\dfrac{1}{2}[-\\cos(x^2)]_0^{\\sqrt{\\pi/2}}=\\dfrac{1}{2}$."
  }),
  build({
    num: 22, subject: "적분학", unit: "회전체 부피", concept: "$x^4+y^2\\le 1$ 영역 회전", difficulty: "mediumHard",
    question: "$xy$평면상의 $x^4+y^2\\le 1$ 영역을 $x$축을 중심으로 $360°$ 회전하여 얻어지는 $3$차원 영역의 부피를 $a\\pi$라 할 때, $a$의 값을 구하시오.",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$\\dfrac{3}{2}$"), o("3","$\\dfrac{5}{3}$"), o("4","$\\dfrac{8}{5}$"), o("5","$2$")],
    answer: 4,
    explanation: "$y^2=1-x^4$, $V=2\\!\\int_0^1\\pi y^2 dx=2\\pi\\!\\int_0^1(1-x^4)dx=2\\pi\\cdot 4/5=8\\pi/5$.\n$a=8/5$."
  }),
  build({
    num: 23, subject: "다변수함수", unit: "곡면적", concept: "구면 띠 (반지름 5, 중심 (0,0,4))", difficulty: "medium",
    question: "$3$차원 공간에서 점 $(0,0,4)$를 중심으로 하고 반지름이 $5$인 구면상의 점들 중 $y$좌표가 $3$이상인 모든 점이 모여 이루는 구면의 넓이를 $a\\pi$라 할 때, $a$의 값을 구하시오.",
    options: [o("1","$9$"), o("2","$11$"), o("3","$15$"), o("4","$20$"), o("5","$40$")],
    answer: 4,
    explanation: "구면 띠 공식: $S=2\\pi R h$, 여기서 $h=$ 높이.\n$y\\ge 3$인 구간 길이 — 중심에서 $y$방향 거리는 0, 띠 두께 $h=$ ... \n원기둥 사영: $S=2\\pi\\cdot 5\\cdot 2=20\\pi$.\n$a=20$."
  }),
  build({
    num: 24, subject: "다변수함수", unit: "접평면", concept: "음함수 접평면 비율", difficulty: "medium",
    question: "$3$차원 공간에서 방정식 $xy+y\\sin z+x^2 z=0$으로 주어지는 곡면상의 점 $(1,0,0)$을 지나고 이 곡면에 접하는 평면의 방정식을 $ax+by+cz+d=0$이라 할 때, $b/c$의 값을 구하시오.",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$"), o("5","$-1$")],
    answer: 2,
    explanation: "$\\nabla f=(y+2xz,x+\\sin z,y\\cos z+x^2)|_{(1,0,0)}=(0,1,1)$.\n접평면: $0(x-1)+(y-0)+(z-0)=0$ ⇒ $y+z=0$.\n$b=1,c=1$, $b/c=1$."
  }),
  build({
    num: 25, subject: "선형대수", unit: "스펙트럼 분해", concept: "대칭행렬 스펙트럼 합", difficulty: "killer",
    question: "$3\\times 3$ 행렬에 대해 $\\!\\begin{pmatrix}1&2&3\\\\2&4&5\\\\3&5&6\\end{pmatrix}=a u u^T+b v v^T+c w w^T$ ($u,v,w$는 정규직교 고유벡터)일 때, $a(u_1^2+u_2^2+u_3^2)+b(v_1^2+v_2^2+v_3^2)+c(w_1^2+w_2^2+w_3^2)$의 값을 구하시오.",
    options: [o("1","$9$"), o("2","$11$"), o("3","$20$"), o("4","$40$"), o("5","$46$")],
    answer: 2,
    explanation: "$u,v,w$는 단위벡터 ⇒ $|u|^2=|v|^2=|w|^2=1$.\n합 $=a+b+c=\\text{tr}\\!\\begin{pmatrix}1&2&3\\\\2&4&5\\\\3&5&6\\end{pmatrix}=1+4+6=11$."
  }),
  build({
    num: 26, subject: "다변수함수", unit: "방향도함수", concept: "최대 방향도함수 = 경도 정규화", difficulty: "medium",
    question: "$f(x,y,z)=x+xy+ye^{xz}$가 주어졌다. $3$차원 단위벡터들 $\\vec u=a\\mathbf i+b\\mathbf j+c\\mathbf k$ 중 점 $(1,1,0)$에서의 $\\vec u$ 방향에 대한 방향미분값을 가장 크게 만드는 $\\vec u$를 찾고, $a+b+c$의 값을 구하시오.",
    options: [o("1","$1$"), o("2","$\\dfrac{3}{2}$"), o("3","$\\dfrac{5}{3}$"), o("4","$\\dfrac{8}{5}$"), o("5","$2$")],
    answer: 3,
    explanation: "$\\nabla f=(1+y+yze^{xz},x+e^{xz},xye^{xz})|_{(1,1,0)}=(2,2,1)$.\n$|\\nabla f|=3$, $\\vec u=(2/3,2/3,1/3)$.\n$a+b+c=5/3$."
  }),
  build({
    num: 27, subject: "다변수함수", unit: "극값", concept: "정사각형 영역 최댓값×최솟값", difficulty: "mediumHard",
    question: "평면상에 $-1\\le x\\le 1,\\,-1\\le y\\le 1$로 주어진 영역 $T$ 위에서 함수 $f(x,y)=x^2 y+y^3$의 최댓값을 $M$, 최솟값을 $m$이라 하자. $Mm$의 값을 구하시오.",
    options: [o("1","$0$"), o("2","$-1$"), o("3","$-2$"), o("4","$-4$"), o("5","$4$")],
    answer: 4,
    explanation: "내부 임계점: $f_x=2xy=0,f_y=x^2+3y^2=0$ ⇒ $(0,0)$, $f=0$.\n경계 $y=\\pm 1$: $f=\\pm(x^2+1)$ → 최대 2, 최소 -2.\n$Mm=2\\cdot(-2)=-4$."
  }),
  build({
    num: 28, subject: "선형대수", unit: "벡터 삼중적", concept: "평행육면체 부피", difficulty: "easy",
    question: "$3$차원 공간 내의 평행육면체 $X$의 꼭짓점 중 4개가 $O(0,0,0),\\,P(1,2,3),\\,Q(-3,5,1),\\,R(2,2,4)$이며 변 세 개가 $\\overline{OP},\\overline{OQ},\\overline{OR}$이라 한다. $X$의 부피를 구하시오.",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$"), o("5","$4$")],
    answer: 3,
    explanation: "$V=|\\det\\!\\begin{pmatrix}1&2&3\\\\-3&5&1\\\\2&2&4\\end{pmatrix}|=|-2|=2$."
  }),
  build({
    num: 29, subject: "적분학", unit: "급수", concept: "$\\sum n^2/3^n$ 급수합", difficulty: "medium",
    question: "급수 $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n^2}{3^n}$의 값을 계산하시오.",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$1$"), o("3","$\\dfrac{3}{2}$"), o("4","$\\dfrac{5}{3}$"), o("5","$\\dfrac{8}{5}$")],
    answer: 3,
    explanation: "$\\!\\sum n^2 x^n=\\dfrac{x(x+1)}{(1-x)^3}$. $x=1/3$ 대입: $\\dfrac{(1/3)(4/3)}{(2/3)^3}=\\dfrac{4/9}{8/27}=\\dfrac{3}{2}$."
  }),
  build({
    num: 30, subject: "다변수함수", unit: "면적분", concept: "발산정리 (반구) - 원점 향", difficulty: "killer",
    question: "$S$가 $3$차원 공간 안에서 $x^2+y^2+z^2=9,\\,x\\ge 0$으로 주어지는 반구 모양의 곡면이고, 방향이 원점을 향한 쪽으로 주어져 있다. 벡터장 $\\vec F(x,y,z)=z\\mathbf i+xz\\mathbf j+\\mathbf k$에 대하여 면적분 $\\!\\displaystyle\\iint_S\\vec F\\cdot d\\vec S$의 값을 계산하시오.",
    options: [o("1","$0$"), o("2","$1$"), o("3","$3$"), o("4","$9$"), o("5","$-9$")],
    answer: 1,
    explanation: "$\\text{div}\\vec F=0+0+0=0$.\n반구 + 밑면(원판 $x=0$) 폐곡면에 발산정리: $\\!\\iiint 0\\,dV=0$.\n반구는 원점 향(내부), 밑면 분리: 밑면 $\\vec F\\cdot(-\\mathbf i)=-z$, $\\!\\iint_{D}-z\\,dA=0$ (중심대칭).\n$\\!\\iint_S\\vec F\\cdot d\\vec S=0$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) { console.error("ERROR:", error); process.exit(1); }
console.log(`Inserted ${data.length} 문항 (2019 이화여대):`, data.map((d) => d.id).join(", "));
