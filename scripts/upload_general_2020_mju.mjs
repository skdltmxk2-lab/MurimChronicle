// Upload 2020년도 명지대 편입수학 기출 25문항
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

const SCHOOL = "명지대";
const YEAR = "2020";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-mju-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "다변수함수", unit: "편도함수", concept: "이변수 함수 편미분", difficulty: "easy",
    question: "함수 $f(x,y)=(x^2-y^2)e^{x^2+y^2}$에 대하여 $\\dfrac{\\partial f}{\\partial y}(1,-1)$의 값은?",
    options: [o("1","$1$"), o("2","$e$"), o("3","$2e$"), o("4","$e^2$"), o("5","$2e^2$")],
    answer: 5,
    explanation: "$f(1,y)=(1-y^2)e^{1+y^2}$. $f_y(1,y)=(-2y)e^{1+y^2}+(1-y^2)e^{1+y^2}(2y)$.\n$y=-1$ 대입: $f_y(1,-1)=2e^2+0=2e^2$."
  }),
  build({
    num: 2, subject: "선형대수", unit: "행렬식", concept: "$\\det(A^T A)=\\det(A)^2$", difficulty: "easy",
    question: "연립방정식 $\\begin{cases}x+2y=3\\\\ 3x+4y=5\\end{cases}$를 행렬을 이용해 나타내면 $A\\!\\begin{pmatrix}x\\\\y\\end{pmatrix}=\\!\\begin{pmatrix}3\\\\5\\end{pmatrix}$이다. 행렬 $A^{T}A$의 행렬식 $\\det(A^{T}A)$의 값은? (단, $A^T$는 $A$의 전치행렬)",
    options: [o("1","$4$"), o("2","$9$"), o("3","$16$"), o("4","$25$"), o("5","$36$")],
    answer: 1,
    explanation: "$A=\\!\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}$, $\\det A=4-6=-2$.\n$\\det(A^T A)=\\det(A^T)\\det(A)=(\\det A)^2=4$."
  }),
  build({
    num: 3, subject: "선형대수", unit: "벡터", concept: "스칼라 삼중적 성질", difficulty: "easy",
    question: "3차원 벡터 $\\vec u,\\vec v,\\vec w$에 대하여 $\\vec u\\cdot(\\vec v\\times\\vec w)=1$일 때 $3\\vec v\\cdot(\\vec v\\times\\vec w)-2(\\vec w\\times\\vec v)\\cdot\\vec u$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 2,
    explanation: "$\\vec v\\cdot(\\vec v\\times\\vec w)=0$ ($\\vec v\\perp(\\vec v\\times\\vec w)$).\n$(\\vec w\\times\\vec v)\\cdot\\vec u=-(\\vec v\\times\\vec w)\\cdot\\vec u=-1$.\n$3\\cdot 0-2\\cdot(-1)=2$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분", concept: "부분분수 적분", difficulty: "easy",
    question: "$\\displaystyle\\int_1^{2}\\!\\dfrac{3x+1}{x^2+x}\\,dx$의 값은?",
    options: [o("1","$\\ln 3$"), o("2","$\\ln\\dfrac{7}{2}$"), o("3","$\\ln 4$"), o("4","$\\ln\\dfrac{9}{2}$"), o("5","$\\ln 5$")],
    answer: 4,
    explanation: "$\\dfrac{3x+1}{x(x+1)}=\\dfrac{1}{x}+\\dfrac{2}{x+1}$ (부분분수: $A=1,\\,B=2$).\n$[\\ln|x|+2\\ln|x+1|]_1^2=(\\ln 2+2\\ln 3)-(0+2\\ln 2)=2\\ln 3-\\ln 2=\\ln\\dfrac{9}{2}$."
  }),
  build({
    num: 5, subject: "미분학", unit: "도함수", concept: "$(\\sin^{-1}x)^2$의 2계 미분", difficulty: "easy",
    question: "$f(x)=(\\sin^{-1}x)^2$일 때 $f''(0)$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 2,
    explanation: "$f'(x)=\\dfrac{2\\sin^{-1}x}{\\sqrt{1-x^2}}$.\n$f''(x)=\\dfrac{(2/\\sqrt{1-x^2})\\sqrt{1-x^2}-2\\sin^{-1}x\\cdot(-x/\\sqrt{1-x^2})}{1-x^2}$.\n$x=0$ 대입: $f''(0)=\\dfrac{2-0}{1}=2$."
  }),
  build({
    num: 6, subject: "적분학", unit: "정적분", concept: "변수상한 함수의 오목성", difficulty: "medium",
    question: "함수 $f(x)=\\displaystyle\\int_3^{x^2}\\!(1-t)e^t\\,dt$에 대하여 곡선 $y=f(x)$가 위로 오목(아래로 볼록)인 구간에 속하는 정수는?",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$0$"), o("4","$1$"), o("5","$2$")],
    answer: 3,
    explanation: "$f'(x)=(1-x^2)e^{x^2}\\cdot 2x=2x(1-x^2)e^{x^2}$.\n$f''(x)=-2e^{x^2}(2x^4+x^2-1)$. $f''>0\\Leftrightarrow 2x^4+x^2-1<0\\Leftrightarrow(2x^2-1)(x^2+1)<0\\Leftrightarrow|x|<\\dfrac{1}{\\sqrt 2}$.\n정수 $0$만 해당."
  }),
  build({
    num: 7, subject: "적분학", unit: "급수", concept: "수렴반지름(편법)", difficulty: "easy",
    question: "멱급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{\\ln n}{n^2}x^n$의 수렴반지름은?",
    options: [o("1","$\\dfrac{1}{e}$"), o("2","$\\dfrac{1}{2}$"), o("3","$\\dfrac{1}{\\sqrt e}$"), o("4","$\\dfrac{\\sqrt 2}{2}$"), o("5","$1$")],
    answer: 5,
    explanation: "$\\!\\left|\\dfrac{a_{n+1}}{a_n}\\right|=\\dfrac{\\ln(n+1)}{(n+1)^2}\\cdot\\dfrac{n^2}{\\ln n}\\to 1$.\n수렴반지름 $=\\dfrac{1}{1}=1$."
  }),
  build({
    num: 8, subject: "적분학", unit: "정적분의 응용", concept: "극곡선 길이(원의 합성)", difficulty: "medium",
    question: "극곡선 $r=\\sin\\theta+2\\cos\\theta$ ($0\\le\\theta\\le\\pi/2$)의 길이는?",
    options: [o("1","$\\dfrac{\\sqrt 5}{2}\\pi$"), o("2","$\\dfrac{\\sqrt 6}{2}\\pi$"), o("3","$\\dfrac{\\sqrt 7}{2}\\pi$"), o("4","$\\sqrt 2\\pi$"), o("5","$\\dfrac{3}{2}\\pi$")],
    answer: 1,
    explanation: "$r=\\sin\\theta+2\\cos\\theta=\\sqrt 5\\sin(\\theta+\\alpha)$ — 직경 $\\sqrt 5$인 원.\n$0\\le\\theta\\le\\pi/2$는 반원이므로 $L=\\dfrac{1}{2}\\cdot\\pi\\sqrt 5=\\dfrac{\\sqrt 5}{2}\\pi$."
  }),
  build({
    num: 9, subject: "적분학", unit: "급수", concept: "수렴 판정", difficulty: "medium",
    question: "다음 보기에서 수렴하는 급수만을 있는 대로 고른 것은?\n\nㄱ. $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{10^n}{n!}$  ㄴ. $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{\\ln n}{e^n}$  ㄷ. $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n^n}{n!}$",
    options: [o("1","ㄱ"), o("2","ㄴ"), o("3","ㄷ"), o("4","ㄱ, ㄴ"), o("5","ㄴ, ㄷ")],
    answer: 4,
    explanation: "ㄱ. $\\sum\\dfrac{10^n}{n!}=e^{10}-1$ 수렴(절대수렴).\nㄴ. 비율판정: $\\dfrac{\\ln(n+1)}{e^{n+1}}\\cdot\\dfrac{e^n}{\\ln n}\\to\\dfrac{1}{e}<1$. 수렴.\nㄷ. $\\dfrac{n^n}{n!}\\to\\infty$이므로 일반항이 $0$이 아님. 발산.\n수렴: ㄱ, ㄴ."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "공간곡선", concept: "$f(t)=|\\mathbf r(t)|$ 미분", difficulty: "medium",
    question: "좌표공간에서 미분가능한 벡터함수 $\\mathbf r(t)$에 대하여 $\\mathbf r(0)=\\langle 1,1,1\\rangle$이고 $\\mathbf r'(0)=\\langle 1,2,3\\rangle$이다. $f(t)=|\\mathbf r(t)|$일 때 $f'(0)$의 값은?",
    options: [o("1","$\\sqrt 2$"), o("2","$\\sqrt 3$"), o("3","$2\\sqrt 2$"), o("4","$2\\sqrt 3$"), o("5","$3\\sqrt 3$")],
    answer: 4,
    explanation: "$f(t)=\\sqrt{x^2+y^2+z^2}$. $f'(t)=\\dfrac{xx'+yy'+zz'}{f(t)}$.\n$f(0)=\\sqrt 3$. $f'(0)=\\dfrac{1\\cdot 1+1\\cdot 2+1\\cdot 3}{\\sqrt 3}=\\dfrac{6}{\\sqrt 3}=2\\sqrt 3$."
  }),
  build({
    num: 11, subject: "선형대수", unit: "벡터", concept: "극좌표 두 점 거리", difficulty: "medium",
    question: "좌표평면에서 극좌표 $(r,\\theta)$로 나타낸 두 점 $\\!\\left(-2,\\dfrac{2\\pi}{3}\\right)$, $\\!\\left(\\sqrt 3,\\dfrac{\\pi}{6}\\right)$ 사이의 거리는?",
    options: [o("1","$\\sqrt 3$"), o("2","$2$"), o("3","$\\sqrt 5$"), o("4","$\\sqrt 6$"), o("5","$\\sqrt 7$")],
    answer: 5,
    explanation: "직교좌표 변환: $P_1=(-2\\cos(2\\pi/3),\\,-2\\sin(2\\pi/3))=(1,-\\sqrt 3)$.\n$P_2=(\\sqrt 3\\cos(\\pi/6),\\,\\sqrt 3\\sin(\\pi/6))=\\!\\left(\\dfrac{3}{2},\\dfrac{\\sqrt 3}{2}\\right)$.\n$d^2=\\!\\left(1-\\dfrac{3}{2}\\right)^{\\!2}+\\!\\left(-\\sqrt 3-\\dfrac{\\sqrt 3}{2}\\right)^{\\!2}=\\dfrac{1}{4}+\\dfrac{27}{4}=7$.\n$d=\\sqrt 7$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "편도함수", concept: "두 곡면 교선의 접선", difficulty: "medium",
    question: "좌표공간에서 두 이차곡면 $y=x^2$과 $z=4x^2+y^2$의 교선 위의 점 $(1,1,5)$에서의 접선의 방정식은?",
    options: [o("1","$x-1=\\dfrac{y-1}{2}=\\dfrac{z-5}{12}$"), o("2","$\\dfrac{x-1}{2}=\\dfrac{y-1}{3}=\\dfrac{z-5}{10}$"), o("3","$\\dfrac{x-1}{3}=\\dfrac{y-1}{4}=\\dfrac{z-5}{8}$"), o("4","$\\dfrac{x-1}{4}=\\dfrac{y-1}{5}=\\dfrac{z-5}{6}$"), o("5","$\\dfrac{x-1}{5}=\\dfrac{y-1}{6}=\\dfrac{z-5}{4}$")],
    answer: 1,
    explanation: "$\\nabla(y-x^2)=(-2x,1,0)|_{(1,1,5)}=(-2,1,0)$. $\\nabla(z-4x^2-y^2)=(-8x,-2y,1)|_{(1,1,5)}=(-8,-2,1)$.\n방향벡터 $=\\nabla F\\times\\nabla G=(1,2,12)$.\n접선: $\\dfrac{x-1}{1}=\\dfrac{y-1}{2}=\\dfrac{z-5}{12}$."
  }),
  build({
    num: 13, subject: "적분학", unit: "특이적분", concept: "$\\tan^{-1}$ 치환", difficulty: "medium",
    question: "$A=\\displaystyle\\int_0^{\\infty}\\!\\dfrac{x\\sqrt{\\tan^{-1}(x^2)}}{1+x^4}\\,dx$일 때 $A^2$의 값은?",
    options: [o("1","$\\dfrac{\\pi^3}{24}$"), o("2","$\\dfrac{\\pi^3}{36}$"), o("3","$\\dfrac{\\pi^3}{72}$"), o("4","$\\dfrac{\\pi^3}{144}$"), o("5","$\\dfrac{\\pi^3}{216}$")],
    answer: 3,
    explanation: "$u=\\tan^{-1}(x^2),\\,du=\\dfrac{2x}{1+x^4}dx$. 구간 $u:0\\to\\pi/2$.\n$A=\\!\\int_0^{\\pi/2}\\!\\sqrt u\\cdot\\dfrac{1}{2}\\,du=\\dfrac{1}{2}\\cdot\\dfrac{2}{3}[u^{3/2}]_0^{\\pi/2}=\\dfrac{1}{3}(\\pi/2)^{3/2}$.\n$A^2=\\dfrac{1}{9}\\cdot\\dfrac{\\pi^3}{8}=\\dfrac{\\pi^3}{72}$."
  }),
  build({
    num: 14, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피(이격축)", difficulty: "medium",
    question: "곡선 $y=x^2-x^3$과 직선 $y=0$으로 둘러싸인 영역을 직선 $x=-1$을 축으로 회전하여 생기는 입체의 부피는?",
    options: [o("1","$\\dfrac{4}{15}\\pi$"), o("2","$\\dfrac{\\pi}{3}$"), o("3","$\\dfrac{2}{5}\\pi$"), o("4","$\\dfrac{7}{15}\\pi$"), o("5","$\\dfrac{8}{15}\\pi$")],
    answer: 1,
    explanation: "교점: $x^2(1-x)=0\\Rightarrow x=0,1$.\n원주껍질 (반지름 $x+1$): $V=2\\pi\\!\\int_0^1(x+1)(x^2-x^3)dx=2\\pi\\!\\int_0^1(x^2-x^4)dx$\n$=2\\pi\\!\\left[\\dfrac{x^3}{3}-\\dfrac{x^5}{5}\\right]_0^1=2\\pi\\!\\left(\\dfrac{1}{3}-\\dfrac{1}{5}\\right)=\\dfrac{4\\pi}{15}$."
  }),
  build({
    num: 15, subject: "미분학", unit: "도함수", concept: "극곡선 접선의 기울기", difficulty: "medium",
    question: "극곡선 $r=3+4\\sin\\theta$ 위의 $\\theta=\\dfrac{\\pi}{6}$에 대응하는 점에서 접선의 기울기는?",
    options: [o("1","$\\sqrt 3$"), o("2","$3\\sqrt 3$"), o("3","$5\\sqrt 3$"), o("4","$7\\sqrt 3$"), o("5","$9\\sqrt 3$")],
    answer: 4,
    explanation: "$\\alpha=\\theta+\\varphi$. $\\theta=\\pi/6$: $\\tan\\theta=\\dfrac{1}{\\sqrt 3}$. $\\tan\\varphi=\\dfrac{r}{r'}=\\dfrac{3+4\\sin\\theta}{4\\cos\\theta}|_{\\pi/6}=\\dfrac{5}{2\\sqrt 3}$.\n$\\tan\\alpha=\\dfrac{1/\\sqrt 3+5/(2\\sqrt 3)}{1-1/\\sqrt 3\\cdot 5/(2\\sqrt 3)}=\\dfrac{7/(2\\sqrt 3)}{1/6}=\\dfrac{7\\cdot 6}{2\\sqrt 3}=7\\sqrt 3$."
  }),
  build({
    num: 16, subject: "미분학", unit: "도함수", concept: "관련 변화율(각도)", difficulty: "medium",
    question: "자동차가 시속 $60\\,\\text{km}$의 속도로 높이가 $300\\,\\text{m}$인 탑을 향해 가고 있다. 자동차가 탑에서 $3\\,\\text{km}$ 떨어진 지점에 도달했을 때 탑의 꼭대기를 올려다본 각의 시간에 따른 변화율은? (단, 단위 $\\text{rad/h}$)",
    options: [o("1","$\\dfrac{100}{101}$"), o("2","$\\dfrac{200}{101}$"), o("3","$\\dfrac{300}{101}$"), o("4","$\\dfrac{400}{101}$"), o("5","$\\dfrac{500}{101}$")],
    answer: 2,
    explanation: "$\\tan\\theta=\\dfrac{0.3}{x}$ ($300\\text{m}=0.3\\text{km}$로 통일).\n$\\theta=\\tan^{-1}(0.3/x)$. $\\dfrac{d\\theta}{dt}=\\dfrac{-0.3/x^2}{1+(0.3/x)^2}\\cdot\\dfrac{dx}{dt}=\\dfrac{-0.3}{x^2+0.09}\\cdot\\dfrac{dx}{dt}$.\n$x=3,\\,dx/dt=-60$: $\\dfrac{d\\theta}{dt}=\\dfrac{-0.3}{9.09}\\cdot(-60)=\\dfrac{18}{9.09}=\\dfrac{200}{101}$."
  }),
  build({
    num: 17, subject: "적분학", unit: "급수", concept: "멱급수 수렴구간(경계 포함)", difficulty: "medium",
    question: "멱급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-1)^n}{n2^n}(x-3)^n$의 수렴구간은?",
    options: [o("1","$-5\\le x\\le-1$"), o("2","$-1<x\\le 1$"), o("3","$-1\\le x<1$"), o("4","$1<x\\le 5$"), o("5","$1\\le x<5$")],
    answer: 4,
    explanation: "수렴반경 $R=2$. $|x-3|<2\\Rightarrow 1<x<5$.\n$x=1$: $\\sum\\dfrac{(-1)^n}{n2^n}(-2)^n=\\sum\\dfrac{1}{n}$ 발산.\n$x=5$: $\\sum\\dfrac{(-1)^n}{n2^n}2^n=\\sum\\dfrac{(-1)^n}{n}$ 수렴.\n수렴구간: $1<x\\le 5$."
  }),
  build({
    num: 18, subject: "다변수함수", unit: "다중적분", concept: "적분순서 변경·$\\arctan$", difficulty: "medium",
    question: "$\\displaystyle\\int_0^{1}\\!\\int_{\\sqrt y}^{1}\\!\\dfrac{x}{x^8+1}\\,dx\\,dy$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{16}$"), o("2","$\\dfrac{3}{32}\\pi$"), o("3","$\\dfrac{\\pi}{8}$"), o("4","$\\dfrac{5}{32}\\pi$"), o("5","$\\dfrac{3}{16}\\pi$")],
    answer: 1,
    explanation: "순서 변경: $0\\le x\\le 1,\\,0\\le y\\le x^2$.\n$\\!\\int_0^1\\!\\int_0^{x^2}\\!\\dfrac{x}{x^8+1}\\,dy\\,dx=\\!\\int_0^1\\!\\dfrac{x^3}{x^8+1}\\,dx$.\n$u=x^4,\\,du=4x^3 dx$: $=\\dfrac{1}{4}\\!\\int_0^1\\!\\dfrac{du}{u^2+1}=\\dfrac{1}{4}\\cdot\\dfrac{\\pi}{4}=\\dfrac{\\pi}{16}$."
  }),
  build({
    num: 19, subject: "미분학", unit: "도함수", concept: "평균값 정리 응용", difficulty: "hard",
    question: "실수 전체에서 미분가능한 두 함수 $f,g$와 두 실수 $a,b$ ($0<a<b$)에 대하여 다음 보기에서 옳은 것을 모두 고른 것은?\n\nㄱ. $f(x)=\\cos x$이면 $|f(b)-f(a)|\\le b-a$이다.\nㄴ. $f(a)=g(a)$이고 $a<x<b$인 모든 $x$에 대하여 $f'(x)<g'(x)$이면 $f(b)<g(b)$이다.\nㄷ. 모든 실수 $x$에 대하여 $f(-x)=-f(x)$이면 $f'(c)=\\dfrac{f(b)}{b}$를 만족시키는 실수 $c$가 열린구간 $(-b,b)$에 적어도 하나 존재한다.",
    options: [o("1","ㄱ"), o("2","ㄷ"), o("3","ㄱ, ㄴ"), o("4","ㄴ, ㄷ"), o("5","ㄱ, ㄴ, ㄷ")],
    answer: 5,
    explanation: "ㄱ. 평균값 정리: $f(b)-f(a)=-\\sin c\\cdot(b-a)$, $|\\sin c|\\le 1$ → 참.\nㄴ. $h=f-g$, $h(a)=0,\\,h'<0$ → $h(b)<0$ → $f(b)<g(b)$. 참.\nㄷ. $f$ 홀함수, $f(-b)=-f(b)$. $(-b,b)$에서 평균값 정리: $\\dfrac{f(b)-f(-b)}{2b}=\\dfrac{2f(b)}{2b}=\\dfrac{f(b)}{b}=f'(c)$. 참.\n모두 참."
  }),
  build({
    num: 20, subject: "적분학", unit: "급수", concept: "$\\ln$·$\\sin$ 포함 수렴 판정", difficulty: "hard",
    question: "다음 보기에서 수렴하는 급수만을 있는 대로 고른 것은?\n\nㄱ. $\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{1}{n(\\ln n)^2}$  ㄴ. $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{1}{1+(\\ln n)^2}$  ㄷ. $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{1}{\\ln(n+1)}\\sin\\!\\left(\\dfrac{1}{n^2}\\right)$",
    options: [o("1","ㄱ"), o("2","ㄴ"), o("3","ㄱ, ㄷ"), o("4","ㄴ, ㄷ"), o("5","ㄱ, ㄴ, ㄷ")],
    answer: 3,
    explanation: "ㄱ. 적분판정 $\\!\\int\\dfrac{dx}{x(\\ln x)^2}=-\\dfrac{1}{\\ln x}$ 수렴. 참.\nㄴ. $(\\ln n)^2$의 증가가 느려 $\\dfrac{1}{1+(\\ln n)^2}\\to 0$이지만 $\\sum$ 발산.\nㄷ. $\\sin(1/n^2)\\sim 1/n^2$, 그래서 $\\sim\\dfrac{1}{n^2\\ln n}$. 극한비교로 $\\sum\\dfrac{1}{n^2\\ln n}$ 수렴.\n수렴: ㄱ, ㄷ."
  }),
  build({
    num: 21, subject: "다변수함수", unit: "다중적분", concept: "극영역 차집합 넓이", difficulty: "hard",
    question: "원 $r=2$의 내부와 극곡선 $r=3-2\\sin\\theta$의 외부에 놓인 영역의 넓이는?",
    options: [o("1","$-3\\pi+\\dfrac{11\\sqrt 3}{2}$"), o("2","$-\\dfrac{7}{3}\\pi+\\dfrac{9\\sqrt 3}{2}$"), o("3","$-\\dfrac{7}{3}\\pi+\\dfrac{11\\sqrt 3}{2}$"), o("4","$-\\dfrac{7}{3}\\pi+\\dfrac{13\\sqrt 3}{2}$"), o("5","$-\\dfrac{5}{3}\\pi+\\dfrac{13\\sqrt 3}{2}$")],
    answer: 3,
    explanation: "교점: $3-2\\sin\\theta=2\\Rightarrow\\sin\\theta=1/2\\Rightarrow\\theta=\\pi/6,5\\pi/6$. $\\sin\\theta>1/2$ 구간에서 곡선이 원 내부.\n$S=\\dfrac{1}{2}\\!\\int_{\\pi/6}^{5\\pi/6}[4-(3-2\\sin\\theta)^2]d\\theta=\\dfrac{1}{2}\\!\\int(-5+12\\sin\\theta-4\\sin^2\\theta)d\\theta$\n$=\\dfrac{1}{2}\\!\\int(-7+12\\sin\\theta+2\\cos 2\\theta)d\\theta=\\dfrac{1}{2}[-7\\theta-12\\cos\\theta+\\sin 2\\theta]_{\\pi/6}^{5\\pi/6}=-\\dfrac{7\\pi}{3}+\\dfrac{11\\sqrt 3}{2}$."
  }),
  build({
    num: 22, subject: "다변수함수", unit: "다중적분", concept: "원기둥·원뿔·평면(극좌표)", difficulty: "hard",
    question: "좌표공간에서 집합 $K=\\{(x,y,z)\\in\\mathbb R^3:x^2+y^2\\le y,\\,\\sqrt{x^2+y^2}\\le z\\le 1\\}$이 나타내는 입체 도형의 부피는?",
    options: [o("1","$\\dfrac{\\pi}{4}-\\dfrac{2}{3}$"), o("2","$\\dfrac{\\pi}{4}-\\dfrac{4}{9}$"), o("3","$\\dfrac{\\pi}{4}-\\dfrac{1}{3}$"), o("4","$\\dfrac{\\pi}{3}-\\dfrac{4}{9}$"), o("5","$\\dfrac{\\pi}{3}-\\dfrac{1}{3}$")],
    answer: 2,
    explanation: "$x^2+y^2\\le y$: 극좌표 $r\\le\\sin\\theta,\\,0\\le\\theta\\le\\pi$. 원뿔 $z=r$과 평면 $z=1$ 사이.\n$V=\\!\\int_0^{\\pi}\\!\\int_0^{\\sin\\theta}(1-r)r\\,dr\\,d\\theta=\\!\\int_0^{\\pi}\\!\\left(\\dfrac{\\sin^2\\theta}{2}-\\dfrac{\\sin^3\\theta}{3}\\right)d\\theta=\\dfrac{1}{2}\\cdot\\dfrac{\\pi}{2}-\\dfrac{1}{3}\\cdot\\dfrac{4}{3}=\\dfrac{\\pi}{4}-\\dfrac{4}{9}$."
  }),
  build({
    num: 23, subject: "적분학", unit: "정적분", concept: "Wallis 공식 비율", difficulty: "hard",
    question: "$\\dfrac{\\displaystyle\\int_0^1(1-x^2)^{2020}dx}{\\displaystyle\\int_0^1(1-x^2)^{2019}dx}$의 값은?",
    options: [o("1","$\\dfrac{1010}{1011}$"), o("2","$\\dfrac{2019}{2020}$"), o("3","$\\dfrac{2020}{2021}$"), o("4","$\\dfrac{4039}{4040}$"), o("5","$\\dfrac{4040}{4041}$")],
    answer: 5,
    explanation: "$x=\\sin\\theta$ 치환: $\\!\\int_0^1(1-x^2)^n dx=\\!\\int_0^{\\pi/2}\\cos^{2n+1}\\theta\\,d\\theta$.\nWallis: $\\dfrac{\\!\\int\\cos^{n}}{\\!\\int\\cos^{n-2}}=\\dfrac{n-1}{n}$. $n=4041,\\,n-2=4039$: 비율 $=\\dfrac{4040}{4041}$."
  }),
  build({
    num: 24, subject: "다변수함수", unit: "편도함수", concept: "곡면 위 접선벡터·코시슈바르츠", difficulty: "hard",
    question: "곡면 $ze^x\\sin y=1$ 위의 점 $P\\!\\left(0,\\dfrac{\\pi}{2},1\\right)$에서의 단위 접선벡터를 $\\vec v$라 하자. 함수 $f(x,y,z)=y+z^2$에 대해 $D_{\\vec v}f(P)$의 최댓값은? (단, $D_{\\vec v}f$는 $\\vec v$ 방향 방향도함수)",
    options: [o("1","$\\sqrt 3$"), o("2","$\\sqrt 6$"), o("3","$2\\sqrt 3$"), o("4","$2\\sqrt 6$"), o("5","$4\\sqrt 3$")],
    answer: 1,
    explanation: "$F=ze^x\\sin y-1$, $\\nabla F|_P=(1,0,1)$. 접선벡터 $\\vec v=(a,b,c)\\perp(1,0,1)\\Rightarrow a+c=0$, $a^2+b^2+c^2=1$.\n$\\nabla f|_P=(0,1,2)$. $D_{\\vec v}f=b+2c$. $c=-a$이므로 $2a^2+b^2=1,\\,b-2a$ 최대화.\n코시-슈바르츠: $(b-2a)^2\\le(1+2)(b^2+2a^2)=3$. 최댓값 $\\sqrt 3$."
  }),
  build({
    num: 25, subject: "적분학", unit: "급수", concept: "$a^{\\ln n}=n^{\\ln a}$ p-급수", difficulty: "medium",
    question: "양항급수 $\\displaystyle\\sum_{n=1}^{\\infty}a^{\\ln n}$이 $0<a<r$일 때 수렴하도록 하는 실수 $r$의 최댓값은?",
    options: [o("1","$\\dfrac{1}{2e}$"), o("2","$\\dfrac{1}{e}$"), o("3","$\\dfrac{2}{e}$"), o("4","$1$"), o("5","$e$")],
    answer: 2,
    explanation: "$a^{\\ln n}=e^{\\ln a\\cdot\\ln n}=n^{\\ln a}$. p-급수 수렴 조건: $-\\ln a>1\\Leftrightarrow\\ln a<-1\\Leftrightarrow a<\\dfrac{1}{e}$.\n$r$의 최댓값 $=\\dfrac{1}{e}$."
  })
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (2020 명지대):`, data.map((d) => d.id).join(", "));
