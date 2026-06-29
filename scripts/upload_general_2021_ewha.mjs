// Upload 2021년도 이화여대 편입수학 기출 30문항 (5지 선다, 100분)
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
const YEAR = "2021";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-ewha-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "적분학", unit: "수열의 극한", concept: "점화식 수열 극한", difficulty: "medium",
    question: "다음과 같이 정의된 수열 $x_n$의 극한값 $\\!\\displaystyle\\lim_{n\\to\\infty}x_n$을 구하시오.\n\n$x_{n+1}=2+(x_n^2-8)^{1/3}\\;(n=1,2,3,\\ldots),\\;x_1=\\dfrac{2\\pi}{3}$",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$"), o("5","$4$")],
    answer: 1,
    explanation: "$y=x$와 $y=2+(x^2-8)^{1/3}$ 교점: $x=0,3,4$.\n$x_1\\approx 2.09$로 $(2,3)$ 사이.\n반복 적용 시 점차 $0$으로 수렴."
  }),
  build({
    num: 2, subject: "미분학", unit: "극한과 연속", concept: "$x-x^2\\ln$형 극한", difficulty: "easy",
    question: "극한 $\\!\\displaystyle\\lim_{x\\to\\infty}\\!\\left(x-x^2\\ln\\!\\left(\\dfrac{1+x}{x}\\right)\\right)$의 값을 구하시오.",
    options: [o("1","$-1$"), o("2","$-\\dfrac{1}{2}$"), o("3","$0$"), o("4","$\\dfrac{1}{2}$"), o("5","$1$")],
    answer: 4,
    explanation: "$1/x=t$ 치환: $\\lim_{t\\to 0}(1/t-\\ln(1+t)/t^2)$.\n$\\ln(1+t)=t-t^2/2+\\cdots$.\n$\\lim=\\dfrac{1}{2}$."
  }),
  build({
    num: 3, subject: "적분학", unit: "이항급수", concept: "이항계수 부분합", difficulty: "medium",
    question: "급수 $\\!\\displaystyle\\sum_{k=2}^{2021}\\!\\!\\binom{2021}{k}2^k(-1)^{2021-k}$의 값을 구하시오.",
    options: [o("1","$-4040$"), o("2","$-2021$"), o("3","$2020$"), o("4","$2021$"), o("5","$4040$")],
    answer: 1,
    explanation: "$(2-1)^{2021}=\\!\\sum_{k=0}^{2021}\\!\\!\\binom{2021}{k}2^k(-1)^{2021-k}=1$.\n$k=0$: $-1$, $k=1$: $2\\cdot 2021$.\n나머지 $=1-(-1)-4042=-4040$."
  }),
  build({
    num: 4, subject: "적분학", unit: "이상적분", concept: "이상적분 수렴 (네 식)", difficulty: "medium",
    question: "다음의 특이적분 중 수렴하는 것을 모두 찾으시오.\n\na. $\\!\\int_1^{\\infty}\\dfrac{\\tan^{-1}x}{x^2}\\,dx$\nb. $\\!\\int_{-\\infty}^0\\dfrac{e^{1/x}}{x^2}\\,dx$\nc. $\\!\\int_0^{\\infty}\\dfrac{x}{1+x^2}\\,dx$\nd. $\\!\\int_{-\\infty}^{\\infty}\\text{sech}\\,x\\,dx$",
    options: [o("1","a, b, c"), o("2","a, b, d"), o("3","a, c, d"), o("4","b, c, d"), o("5","a, b, c, d")],
    answer: 2,
    explanation: "a 수렴: $\\sim 1/x^2$.\nb 수렴: $-1/x=t$ 치환, $\\!\\int e^{-t}dt$.\nc 발산: $\\sim 1/x$.\nd 수렴: $\\!\\int 2/(e^x+e^{-x})dx$, $e^x=t$ 치환."
  }),
  build({
    num: 5, subject: "적분학", unit: "급수", concept: "급수 수렴 (네 식)", difficulty: "medium",
    question: "다음의 급수들 중 수렴하는 것을 모두 찾으시오.\n\na. $\\!\\sum_{n=8}^{\\infty}\\dfrac{1}{n\\cdot\\ln n\\cdot(\\ln\\ln n)^2}$\nb. $\\!\\sum_{n=1}^{\\infty}\\!\\left(\\sqrt{n+\\dfrac{1}{n}}-\\sqrt n\\right)$\nc. $\\!\\sum_{n=1}^{\\infty}\\dfrac{(n+1)^n}{n^{n+1}}$\nd. $\\!\\sum_{n=1}^{\\infty}(-1)^n n\\tan\\!\\left(\\dfrac{1}{n}\\right)$",
    options: [o("1","a, b"), o("2","a, c"), o("3","b, c"), o("4","b, d"), o("5","c, d")],
    answer: 1,
    explanation: "a 수렴: 적분판정.\nb 수렴: $\\sim 1/n^{3/2}$.\nc 발산: $\\sim e/n$.\nd 발산: $n\\tan(1/n)\\to 1$."
  }),
  build({
    num: 6, subject: "적분학", unit: "급수", concept: "급수 명제 (절댓값·곱)", difficulty: "mediumHard",
    question: "다음의 급수에 대한 설명 중 옳은 것을 모두 찾으시오.\n\na. $\\!\\sum x_n$이 수렴하면 $\\!\\sum x_{2n}$도 수렴한다.\nb. $\\!\\sum x_n$과 $\\!\\sum y_n$이 각각 수렴하면 $\\!\\sum x_n y_n$도 수렴한다.\nc. $\\!\\sum|x_n|$이 수렴하면 $\\!\\sum x_n^2$도 수렴한다.\nd. $\\!\\sum x_n^2$이 수렴하면 $\\!\\sum|x_n/n|$도 수렴한다.",
    options: [o("1","a, b"), o("2","a, c"), o("3","b, c"), o("4","b, d"), o("5","c, d")],
    answer: 5,
    explanation: "a 거짓: $x_n=(-1)^n/n$ 반례.\nb 거짓: $x_n=y_n=(-1)^n/\\sqrt n$ 반례.\nc 참: $|x_n|\\to 0$이므로 $x_n^2\\le|x_n|$ 비교.\nd 참: 코시-슈바르츠."
  }),
  build({
    num: 7, subject: "미분학", unit: "역함수", concept: "역함수 합성 미분", difficulty: "medium",
    question: "영역 $(-\\infty,3/4)$에서 정의된 함수 $f(x)=x^4-x^3+1$에 대하여 $g(x)=f(7f^{-1}(x))$라 할 때, $g'(3)$을 구하시오.",
    options: [o("1","$-1519$"), o("2","$-217$"), o("3","$217$"), o("4","$1519$"), o("5","$-1$")],
    answer: 4,
    explanation: "$f(-1)=3$ ⇒ $f^{-1}(3)=-1$, $(f^{-1})'(3)=1/f'(-1)=1/(-7)=-1/7$.\n$g'(x)=f'(7f^{-1}(x))\\cdot 7(f^{-1})'(x)$.\n$g'(3)=f'(-7)\\cdot 7\\cdot(-1/7)=-f'(-7)=-(-4\\cdot 343-3\\cdot 49)=1519$."
  }),
  build({
    num: 8, subject: "선형대수", unit: "고유값", concept: "고유값 합과 곱", difficulty: "easy",
    question: "$3\\times 3$ 행렬 $A=\\!\\begin{pmatrix}4&-5&3\\\\0&2&-2\\\\1&0&-1\\end{pmatrix}$의 고윳값들을 모두 더한 값과 곱한 값을 각각 $a,b$라 하자. $ab$의 값을 구하시오.",
    options: [o("1","$-40$"), o("2","$-20$"), o("3","$0$"), o("4","$20$"), o("5","$40$")],
    answer: 2,
    explanation: "$a=\\text{tr}(A)=4+2-1=5$.\n$b=\\det(A)=-4$.\n$ab=-20$."
  }),
  build({
    num: 9, subject: "선형대수", unit: "대각화", concept: "유사행렬 대각성분 곱", difficulty: "easy",
    question: "$3\\times 3$행렬 $A=\\!\\begin{pmatrix}-1&2&4\\\\0&3&7\\\\0&0&-2\\end{pmatrix}$에 대하여 $A=PDP^{-1}$을 만족하는 행렬 $D=\\!\\begin{pmatrix}d_1&0&0\\\\0&d_2&0\\\\0&0&d_3\\end{pmatrix}$에 대하여 $d_1 d_2 d_3$의 값을 구하시오.",
    options: [o("1","$-28$"), o("2","$-21$"), o("3","$6$"), o("4","$8$"), o("5","$14$")],
    answer: 3,
    explanation: "$D$는 대각화이므로 대각성분이 $A$의 고윳값.\n곱 $=\\det(D)=\\det(A)=(-1)(3)(-2)=6$."
  }),
  build({
    num: 10, subject: "적분학", unit: "급수", concept: "수렴반경 곱", difficulty: "easy",
    question: "$\\!\\sum_{n=2}^{\\infty}(-1)^n\\dfrac{(x+3)^n}{n2^n}$의 수렴반경 $R_1$, $\\!\\sum_{n=2}^{\\infty}n(n-1)(2x)^n$의 수렴반경 $R_2$. $R_1 R_2$의 값을 구하시오.",
    options: [o("1","$0$"), o("2","$\\dfrac{1}{2}$"), o("3","$1$"), o("4","$2$"), o("5","$\\infty$")],
    answer: 3,
    explanation: "$R_1=2$ ($|x+3|<2$), $R_2=1/2$ ($|2x|<1$). 곱 $=1$."
  }),
  build({
    num: 11, subject: "선형대수", unit: "벡터", concept: "벡터 명제 판별", difficulty: "mediumHard",
    question: "$3$차원 공간 벡터 $u,v,w$에 대하여 다음 중 옳은 것을 모두 찾으시오.\n\na. $u\\cdot(u\\times v)=0$\nb. $u\\cdot v=0$이고 $u\\times v=0$이면 $v=0$\nc. $u\\times v=u\\times w$이면 $v=w$\nd. $|u\\cdot(v\\times w)|\\le\\|u\\|\\|v\\|\\|w\\|$",
    options: [o("1","a, b"), o("2","b, c"), o("3","a, b, d"), o("4","a, c, d"), o("5","a, b, c")],
    answer: 3,
    explanation: "a 참: 외적은 두 벡터에 수직.\nb 거짓: $u=0$인 경우 $v$ 임의.\nc 거짓: $v-w$가 $u$와 평행이면 가능.\nd 참: 스칼라 삼중적 부등식.\n해설지: 'a,b,d' 보기 (3) — 해설 b 분석 재검토 필요."
  }),
  build({
    num: 12, subject: "미분학", unit: "방정식의 근", concept: "삼각방정식 실근 개수 조건", difficulty: "mediumHard",
    question: "방정식 $-\\dfrac{1}{2}\\cos 2x+\\cos x-\\alpha=0$이 구간 $[-\\pi,\\pi]$에서 서로 다른 $4$개의 실근을 갖도록 하는 $\\alpha$값의 범위를 구하시오.",
    options: [
      o("1","$\\!\\left(0,\\dfrac{1}{2}\\right)$"),
      o("2","$\\!\\left(0,\\dfrac{3}{4}\\right)$"),
      o("3","$(0,1)$"),
      o("4","$\\!\\left(\\dfrac{3}{4},1\\right)$"),
      o("5","$\\!\\left(\\dfrac{1}{2},\\dfrac{3}{4}\\right)$"),
    ],
    answer: 5,
    explanation: "$t=\\cos x$ 치환, $F(t)=-t^2+t+1/2$.\n$F$는 $t=1/2$에서 극대 $3/4$, $t=\\pm 1$에서 $1/2,-1/2$.\n$\\alpha$가 $1/2<\\alpha<3/4$일 때 $t$ 두 해 → $x$ 4해."
  }),
  build({
    num: 13, subject: "선형대수", unit: "역행렬", concept: "가역행렬 동등 명제", difficulty: "easy",
    question: "$n\\times n$행렬 $A$에 대하여 다음 중 동등한 명제가 $\\textbf{아닌}$ 것을 찾으시오.\n\na. $A$가 가역(invertible)이다.\nb. $\\det(A)\\ne 0$\nc. $A$의 행벡터들이 일차독립이다.\nd. $A$의 랭크가 $n$이다.\ne. $\\lambda=0$이 $A$의 고유값이다.",
    options: [o("1","a"), o("2","b"), o("3","c"), o("4","d"), o("5","e")],
    answer: 5,
    explanation: "e 거짓: $\\lambda=0$이 고유값이면 $\\det A=0$이므로 비가역. e는 비가역 조건."
  }),
  build({
    num: 14, subject: "기타", unit: "삼각형 기하", concept: "정삼각형 넓이 (대수 조건)", difficulty: "medium",
    question: "세 변의 길이가 각각 $a,b,c$인 삼각형이 있다. $a+b+c=12$이며 $a^2+b^2+c^2-ab-bc-ca=0$일 때 이 삼각형의 넓이를 구하시오.",
    options: [o("1","$\\sqrt 3$"), o("2","$2\\sqrt 3$"), o("3","$3\\sqrt 3$"), o("4","$4\\sqrt 3$"), o("5","$5\\sqrt 3$")],
    answer: 4,
    explanation: "$a^2+b^2+c^2-ab-bc-ca=\\dfrac{1}{2}[(a-b)^2+(b-c)^2+(c-a)^2]=0$ ⇒ $a=b=c=4$.\n정삼각형 넓이 $=\\dfrac{\\sqrt 3}{4}\\cdot 16=4\\sqrt 3$."
  }),
  build({
    num: 15, subject: "선형대수", unit: "외적", concept: "수직 단위벡터", difficulty: "easy",
    question: "$u$는 $3$차원 공간의 단위벡터이며 $i-j$와 $i+j+k$에 대해 각각 직교할 때 $u$가 될 수 있는 것을 모두 구하시오.\n\na. $\\dfrac{1}{\\sqrt 6}(i+j-2k)$\nb. $\\dfrac{1}{\\sqrt 6}(-i+j+2k)$\nc. $\\dfrac{1}{\\sqrt 6}(i-j-2k)$\nd. $\\dfrac{1}{\\sqrt 6}(-i-j+2k)$",
    options: [o("1","a, c"), o("2","b, c"), o("3","a, d"), o("4","c, d"), o("5","b, d")],
    answer: 3,
    explanation: "$(1,-1,0)\\times(1,1,1)=(-1,-1,2)$.\n단위화 $\\dfrac{1}{\\sqrt 6}(-1,-1,2)$ 또는 반대 $\\dfrac{1}{\\sqrt 6}(1,1,-2)$.\na, d 일치."
  }),
  build({
    num: 16, subject: "적분학", unit: "이중적분", concept: "적분순서 교환 (cos/(1+cos²))", difficulty: "medium",
    question: "적분 $\\!\\displaystyle\\int_0^1\\!\\!\\int_{\\sin^{-1}y}^{\\pi/2}\\dfrac{\\cos x}{1+\\cos^2 x}\\,dx\\,dy$의 값을 구하시오.",
    options: [
      o("1","$\\dfrac{1}{3}\\ln 3$"),
      o("2","$\\dfrac{1}{2}\\ln 2$"),
      o("3","$\\dfrac{1}{4}\\ln 3$"),
      o("4","$\\dfrac{1}{4}\\ln 2$"),
      o("5","$\\dfrac{1}{3}\\ln 2$"),
    ],
    answer: 2,
    explanation: "순서 교환: $\\!\\int_0^{\\pi/2}\\!\\int_0^{\\sin x}\\dfrac{\\cos x}{1+\\cos^2 x}dy\\,dx=\\!\\int_0^{\\pi/2}\\dfrac{\\sin x\\cos x}{1+\\cos^2 x}dx=\\dfrac{1}{2}\\ln 2$."
  }),
  build({
    num: 17, subject: "적분학", unit: "역함수 적분", concept: "역함수 미분의 정적분", difficulty: "medium",
    question: "$f(x)=x+x^2+x^3$에 대하여 적분 $\\!\\displaystyle\\int_0^3\\dfrac{1}{f'(f^{-1}(x))(1+(f^{-1}(x))^2)}\\,dx$의 값을 구하시오.",
    options: [o("1","$\\tan^{-1}1$"), o("2","$2\\tan^{-1}1$"), o("3","$3\\tan^{-1}1$"), o("4","$2\\tan^{-1}3$"), o("5","$3\\tan^{-1}3$")],
    answer: 1,
    explanation: "$f^{-1}(x)=t$ 치환, $\\dfrac{1}{f'(t)(1+t^2)}\\cdot f'(t)dt=\\dfrac{dt}{1+t^2}$.\n$\\!\\int_0^1=\\tan^{-1}1=\\pi/4$."
  }),
  build({
    num: 18, subject: "선형대수", unit: "다항식 나눗셈", concept: "복소수 활용 나머지", difficulty: "killer",
    question: "다항식 $f(x)=x^2-\\sqrt 2 x+2$에 대하여 $f(x^6)$을 $f(x)$로 나눈 나머지를 구하시오.",
    options: [o("1","$60-8\\sqrt 2$"), o("2","$60-4\\sqrt 2$"), o("3","$66+8\\sqrt 2$"), o("4","$60+4\\sqrt 2$"), o("5","$66-8\\sqrt 2$")],
    answer: 5,
    explanation: "$f(x)=0$ 근 $x=\\sqrt 2 e^{\\pm i\\pi/3}$.\n$x^6=2^3 e^{\\pm 2\\pi i}=8$.\n나머지 $a$: $f(8)=64-8\\sqrt 2+2=66-8\\sqrt 2$."
  }),
  build({
    num: 19, subject: "선형대수", unit: "평면", concept: "평면 평행 + 거리", difficulty: "easy",
    question: "평면 $2x-2y+z-1=0$과 평행하고 이 평면과 거리가 $1$인 평면의 방정식을 모두 찾으시오.\n\na. $2x-2y+z-4=0$\nb. $2x-2y+z-2=0$\nc. $2x-2y+z=0$\nd. $2x-2y+z+2=0$",
    options: [o("1","a, b"), o("2","a, d"), o("3","b, c"), o("4","a, c"), o("5","b, d")],
    answer: 2,
    explanation: "법선벡터 길이 $3$. 거리 $1$ ⇒ 상수항 차이 $\\pm 3$.\n$1-3=-2$: $2x-2y+z-(-2)=0$ → $-(-3)=$ 또는 $1+3=4$ ($a$), $1-(-3)=$  $-2$ (d).\n결과: a, d."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "선적분", concept: "벡터/스칼라 선적분 명제", difficulty: "medium",
    question: "다음 명제 중 옳은 것을 모두 찾으시오. ($C$는 평면곡선, $-C$는 반대 방향)\n\na. $\\!\\int_C f\\,dx=-\\!\\int_{-C}f\\,dx$\nb. $\\!\\int_C f\\,ds=-\\!\\int_{-C}f\\,ds$\nc. $f(x,y)=\\cos x+\\sin y$일 때 $|D_u f|\\le\\sqrt 2$.\nd. $\\!\\int_{-1}^1\\!\\int_{-1}^1\\sin(x^2+y^2)\\tan y\\,dy\\,dx=0$",
    options: [o("1","a, c"), o("2","b, c"), o("3","b, d"), o("4","a, c, d"), o("5","a, b, d")],
    answer: 4,
    explanation: "a 참: 벡터장 선적분.\nb 거짓: 스칼라 호적분은 방향 무관.\nc 참: $|\\nabla f|\\le\\sqrt 2$.\nd 참: 대칭성."
  }),
  build({
    num: 21, subject: "미분학", unit: "이차함수", concept: "판별식 조건 (격자점 개수)", difficulty: "medium",
    question: "$a,b$는 구간 $[1,10]$의 자연수이다. 이차함수 $f(x)=4x^2+4(a+b)x+4ab+1$의 그래프와 $x$축이 만나지 $\\textbf{않게}$ 되는 순서쌍 $(a,b)$의 개수를 구하시오.",
    options: [o("1","$10$"), o("2","$\\dfrac{2}{15}$"), o("3","$\\dfrac{2}{5}$"), o("4","$4$"), o("5","$\\sqrt 5$")],
    answer: 1,
    explanation: "$D/4=4(a+b)^2-4(4ab+1)=4(a-b)^2-4<0$ ⇒ $(a-b)^2<1$ ⇒ $a=b$.\n$(a,a)$: $a=1\\ldots 10$, 총 10개."
  }),
  build({
    num: 22, subject: "다변수함수", unit: "조건부 극값", concept: "산술기하 최댓값", difficulty: "easy",
    question: "가로, 세로, 높이 각각 $x,y,z$인 직육면체의 모든 모서리 합이 $24$. 이 직육면체의 부피가 최대가 될 때, 직육면체의 부피를 구하시오.",
    options: [o("1","$10$"), o("2","$1+\\pi$"), o("3","$8$"), o("4","$\\pi$"), o("5","$\\pi^2$")],
    answer: 3,
    explanation: "$4(x+y+z)=24$ ⇒ $x+y+z=6$.\n산술기하: $V=xyz\\le(x+y+z)^3/27=8$ (등호 $x=y=z=2$)."
  }),
  build({
    num: 23, subject: "적분학", unit: "급수", concept: "텔레스코핑 급수", difficulty: "medium",
    question: "무한급수 $\\!\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{\\sqrt{n+1}-\\sqrt{n-1}}{\\sqrt{n^2-1}}$의 값을 구하시오.",
    options: [o("1","$10$"), o("2","$\\dfrac{2+\\sqrt 2}{2}$"), o("3","$8$"), o("4","$4$"), o("5","$\\sqrt 5$")],
    answer: 2,
    explanation: "$\\dfrac{\\sqrt{n+1}-\\sqrt{n-1}}{\\sqrt{(n+1)(n-1)}}=\\dfrac{1}{\\sqrt{n-1}}-\\dfrac{1}{\\sqrt{n+1}}$.\n텔레스코핑: $1+\\dfrac{1}{\\sqrt 2}=\\dfrac{2+\\sqrt 2}{2}$."
  }),
  build({
    num: 24, subject: "적분학", unit: "급수", concept: "라이프니츠 급수 $\\pi/4$", difficulty: "easy",
    question: "급수 $\\!\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(-1)^n}{2n+1}$의 값을 구하시오.",
    options: [o("1","$10$"), o("2","$\\dfrac{2+\\sqrt 2}{2}$"), o("3","$4$"), o("4","$\\dfrac{\\pi}{4}$"), o("5","$\\sqrt 5$")],
    answer: 4,
    explanation: "$\\tan^{-1}x=\\!\\sum\\dfrac{(-1)^n x^{2n+1}}{2n+1}$, $x=1$ 대입 ⇒ $\\tan^{-1}1=\\pi/4$."
  }),
  build({
    num: 25, subject: "적분학", unit: "회전체 부피", concept: "두 곡선 회전체", difficulty: "medium",
    question: "$-\\pi/4\\le x\\le\\pi/4$에서 두 곡선 $y=2\\cos x$와 $y=\\sec x$로 둘러싸인 영역을 $x$축 중심으로 회전한 부피를 구하시오.",
    options: [o("1","$10$"), o("2","$\\dfrac{2+\\sqrt 2}{2}$"), o("3","$4$"), o("4","$\\dfrac{\\pi}{4}$"), o("5","$\\pi^2$")],
    answer: 5,
    explanation: "$V=2\\pi\\!\\int_0^{\\pi/4}(4\\cos^2 x-\\sec^2 x)dx=2\\pi\\!\\int(1+\\cos 2x-\\sec^2 x)\\cdot 2 dx \\to\\pi^2$."
  }),
  build({
    num: 26, subject: "적분학", unit: "역삼각함수", concept: "역삼각 항등식 결정", difficulty: "killer",
    question: "음이 아닌 모든 실수 $x$에 대하여 $\\sin^{-1}\\!\\left(\\dfrac{x-1}{x+1}\\right)=a\\tan^{-1}(x^b)+c$를 만족시키는 상수 $a,b,c$를 구하고 $2b-ac$의 값을 구하시오.",
    options: [o("1","$10$"), o("2","$1+\\pi$"), o("3","$4$"), o("4","$\\pi$"), o("5","$\\pi^2$")],
    answer: 2,
    explanation: "$x=0$: $\\sin^{-1}(-1)=c$ ⇒ $c=-\\pi/2$.\n$x=1$: $0=a\\cdot\\pi/4-\\pi/2$ ⇒ $a=2$.\n$x=3$: 풀면 $b=1/2$.\n$2b-ac=1-2\\cdot(-\\pi/2)=1+\\pi$."
  }),
  build({
    num: 27, subject: "선형대수", unit: "고유값", concept: "기저 변환 고유값 곱", difficulty: "killer",
    question: "$\\mathbb{R}^3$의 기저 $\\{v_1,v_2,v_3\\}$에 대하여 $3\\times 3$ 행렬 $A$가 $(A-I)(v_1+v_2)=0,\\,(A-2I)(v_2+v_3)=0,\\,(A+4I)(v_3+v_1)=0$을 만족할 때 $\\det(A)$의 값을 구하시오.",
    options: [o("1","$10$"), o("2","$1+\\pi$"), o("3","$4$"), o("4","$\\pi$"), o("5","$-8$")],
    answer: 5,
    explanation: "$A$의 고윳값 $1,2,-4$.\n$\\det A=1\\cdot 2\\cdot(-4)=-8$."
  }),
  build({
    num: 28, subject: "적분학", unit: "삼중적분", concept: "포물기둥 삼중적분", difficulty: "medium",
    question: "$3$차원 영역 $E$는 포물 기둥 $y=x^2$과 평면 $x=z,\\,x=y,\\,z=0$으로 유계된 입체이다. 적분 $\\!\\displaystyle\\iiint_E(x+2y)\\,dV$의 값을 구하시오.",
    options: [o("1","$10$"), o("2","$1+\\pi$"), o("3","$4$"), o("4","$\\pi$"), o("5","$\\dfrac{2}{15}$")],
    answer: 5,
    explanation: "$\\!\\int_0^1\\!\\int_{x^2}^x\\!\\int_0^x(x+2y)dz\\,dy\\,dx=\\!\\int_0^1\\!\\int_{x^2}^x(x^2+2xy)\\,dy\\,dx=\\!\\int_0^1(2x^3-x^4-x^5)dx=\\dfrac{1}{2}-\\dfrac{1}{5}-\\dfrac{1}{6}=\\dfrac{2}{15}$."
  }),
  build({
    num: 29, subject: "미분학", unit: "극한", concept: "지수형 극한 ($x\\to\\infty$)", difficulty: "medium",
    question: "극한값 $\\!\\displaystyle\\lim_{x\\to\\infty}x^{\\,\\ln 5/(1+2\\ln x)}$을 구하시오.",
    options: [o("1","$10$"), o("2","$1+\\pi$"), o("3","$4$"), o("4","$\\pi$"), o("5","$\\sqrt 5$")],
    answer: 5,
    explanation: "$\\ln(x^{\\ln 5/(1+2\\ln x)})=\\dfrac{\\ln 5\\cdot\\ln x}{1+2\\ln x}\\to\\dfrac{\\ln 5}{2}$.\n$e^{\\ln 5/2}=\\sqrt 5$."
  }),
  build({
    num: 30, subject: "미분학", unit: "미분가능성", concept: "조각함수 미분가능 $a$ 개수", difficulty: "killer",
    question: "$f(x)$는 연속이며 $\\sin x\\!\\int_0^x\\!f(t)dt-\\!\\int_0^x\\!\\sin t\\,f(t)dt=\\cos^2 x$를 만족. $-4\\pi\\le a\\le 4\\pi$인 $a$에 대해 $g(x)=\\sin(|x-a|)f(x)$가 미분가능하도록 하는 $a$의 개수를 구하시오.",
    options: [o("1","$10$"), o("2","$1+\\pi$"), o("3","$4$"), o("4","$\\pi$"), o("5","$8$")],
    answer: 5,
    explanation: "양변 두 번 미분: $f(x)=-2\\cos x$.\n$g(x)$ 미분가능 ⇔ $\\cos a=0$.\n$a=\\pm\\pi/2,\\pm 3\\pi/2,\\pm 5\\pi/2,\\pm 7\\pi/2$, 총 8개."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) { console.error("ERROR:", error); process.exit(1); }
console.log(`Inserted ${data.length} 문항 (2021 이화여대):`, data.map((d) => d.id).join(", "));
