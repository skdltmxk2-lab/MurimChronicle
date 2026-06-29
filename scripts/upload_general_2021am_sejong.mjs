// Upload 2021년도 세종대(오전) 편입수학 기출 25문항 (5지선다)
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

const SCHOOL = "세종대";
const YEAR = "2021";
const SESSION = "오전";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}am-sejong-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, SESSION, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "역삼각함수", concept: "$\\arcsin\\sqrt{x}$ 미분", difficulty: "easy",
    question: "함수 $f(x)=\\arcsin\\sqrt{x}$에 대하여 $f'\\!\\left(\\dfrac{1}{2}\\right)$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$\\dfrac{\\sqrt{2}}{2}$"), o("3","$\\dfrac{\\sqrt{3}}{2}$"), o("4","$1$"), o("5","$\\dfrac{\\sqrt{5}}{2}$")],
    answer: 4,
    explanation: "사슬규칙: $f'(x)=\\dfrac{1}{\\sqrt{1-(\\sqrt{x})^2}}\\cdot\\dfrac{1}{2\\sqrt{x}}=\\dfrac{1}{2\\sqrt{x(1-x)}}$.\n$x=\\dfrac{1}{2}$ 대입: $\\dfrac{1}{2\\sqrt{1/4}}=\\dfrac{1}{2\\cdot 1/2}=1$."
  }),
  build({
    num: 2, subject: "미분학", unit: "극한과 연속", concept: "$\\infty\\cdot 0$ 부정형", difficulty: "easyMedium",
    question: "극한 $\\displaystyle\\lim_{x\\to\\infty}\\!\\left(xe^{1/x}-x\\right)$의 값은?",
    options: [o("1","$-\\infty$"), o("2","$0$"), o("3","$1$"), o("4","$e$"), o("5","$\\infty$")],
    answer: 3,
    explanation: "$\\dfrac{1}{x}=t$ 치환 ($x\\to\\infty$ → $t\\to 0^+$):\n$\\displaystyle\\lim_{t\\to 0}\\!\\left(\\dfrac{e^t}{t}-\\dfrac{1}{t}\\right)=\\lim\\dfrac{e^t-1}{t}\\stackrel{\\text{L'H}}{=}\\lim e^t=1$.\n(또는 $e^t-1\\sim t$ 이용.)"
  }),
  build({
    num: 3, subject: "다변수함수", unit: "극좌표·극곡선", concept: "극좌표 → 직교좌표", difficulty: "easy",
    question: "극곡선 $r\\sin^2\\theta=\\cos\\theta$가 나타내는 곡선은?",
    options: [o("1","직선"), o("2","원"), o("3","타원"), o("4","포물선"), o("5","쌍곡선")],
    answer: 4,
    explanation: "양변에 $r$ 곱: $r^2\\sin^2\\theta=r\\cos\\theta\\Rightarrow y^2=x$.\n포물선 $x=y^2$."
  }),
  build({
    num: 4, subject: "다변수함수", unit: "벡터와 공간도형", concept: "수선의 발", difficulty: "medium",
    question: "점 $(1,2,-2)$에서 평면 $3x+2y-z=1$에 내린 수선의 발을 $(a,b,c)$라 할 때, $a+b+c$의 값은?",
    options: [o("1","$-\\dfrac{13}{7}$"), o("2","$-\\dfrac{12}{7}$"), o("3","$-\\dfrac{11}{7}$"), o("4","$-\\dfrac{10}{7}$"), o("5","$-\\dfrac{9}{7}$")],
    answer: 5,
    explanation: "점 $(1,2,-2)$를 지나고 평면 법선벡터 $(3,2,-1)$ 방향 직선:\n$(x,y,z)=(1+3t,\\,2+2t,\\,-2-t)$.\n평면식 대입: $3(1+3t)+2(2+2t)-(-2-t)=1\\Rightarrow 9+14t=1\\Rightarrow t=-\\dfrac{4}{7}$.\n$a+b+c=(1+3t)+(2+2t)+(-2-t)=1+4t=1-\\dfrac{16}{7}=-\\dfrac{9}{7}$."
  }),
  build({
    num: 5, subject: "적분학", unit: "급수", concept: "수렴반지름", difficulty: "easyMedium",
    question: "거듭제곱급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(x-1)^{2n}}{3^n}$의 수렴 반지름은?",
    options: [o("1","$3$"), o("2","$\\sqrt{3}$"), o("3","$1$"), o("4","$\\dfrac{1}{\\sqrt{3}}$"), o("5","$\\dfrac{1}{3}$")],
    answer: 2,
    explanation: "비율판정: $\\dfrac{(x-1)^{2(n+1)}/3^{n+1}}{(x-1)^{2n}/3^n}=\\dfrac{(x-1)^2}{3}$.\n수렴 조건: $\\dfrac{(x-1)^2}{3}<1\\Rightarrow|x-1|<\\sqrt{3}$. 수렴반지름 $\\sqrt{3}$."
  }),
  build({
    num: 6, subject: "선형대수", unit: "선형사상", concept: "선형사상 판정", difficulty: "medium",
    question: "실수 성분 $n\\times n$행렬로 이루어진 벡터공간을 $M_n$이라 하고, 행렬 $A\\in M_n$의 $i$행 $j$열 성분을 $a_{ij}$라 하자. 다음 보기의 함수 중 $M_n$에서 $\\mathbb{R}$로 가는 선형사상인 것만을 있는 대로 고르면? (단, $\\operatorname{tr}$은 대각합, $\\det$는 행렬식을 의미한다.)\n\n(ㄱ) $F(A)=a_{ij}$\n(ㄴ) $F(A)=\\operatorname{tr}(A)$\n(ㄷ) $F(A)=\\det(A)$",
    options: [o("1","ㄱ"), o("2","ㄴ"), o("3","ㄱ, ㄴ"), o("4","ㄱ, ㄷ"), o("5","ㄱ, ㄴ, ㄷ")],
    answer: 3,
    explanation: "선형사상 조건 $T(u+v)=T(u)+T(v),\\,T(cu)=cT(u)$ 검증.\n(ㄱ) 참: 성분 $a_{ij}$의 추출은 합과 스칼라배에 분배적.\n(ㄴ) 참: $\\operatorname{tr}$는 대각성분의 합이라 선형.\n(ㄷ) 거짓: $\\det(cA)=c^n\\det A$이라서 $c\\ne 1$이면 일반적으로 $\\det(cA)\\ne c\\det A$. 또 $\\det(A+B)\\ne\\det A+\\det B$.\n선형사상: ㄱ, ㄴ."
  }),
  build({
    num: 7, subject: "다변수함수", unit: "음함수", concept: "음함수 편미분", difficulty: "easyMedium",
    question: "$x^3+y^3+z^3+12xyz=3$일 때, 편도함수 $\\dfrac{\\partial z}{\\partial x}$를 구하면?",
    options: [o("1","$-\\dfrac{x^2+4xy}{x^2+4yz}$"), o("2","$-\\dfrac{x^2+4yz}{z^2+4xy}$"), o("3","$-\\dfrac{z^2+3xy}{x^2+3yz}$"), o("4","$-\\dfrac{x^2+3yz}{z^2+3xy}$"), o("5","$-\\dfrac{z^2+2xy}{x^2+2yz}$")],
    answer: 2,
    explanation: "$F(x,y,z)=x^3+y^3+z^3+12xyz-3$.\n$F_x=3x^2+12yz$, $F_z=3z^2+12xy$.\n$\\dfrac{\\partial z}{\\partial x}=-\\dfrac{F_x}{F_z}=-\\dfrac{3x^2+12yz}{3z^2+12xy}=-\\dfrac{x^2+4yz}{z^2+4xy}$."
  }),
  build({
    num: 8, subject: "적분학", unit: "급수", concept: "$\\sum n x^n$ 합산공식", difficulty: "easyMedium",
    question: "급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n}{2^n}$의 값은?",
    options: [o("1","$2$"), o("2","$\\dfrac{9}{4}$"), o("3","$\\dfrac{5}{2}$"), o("4","$\\dfrac{11}{4}$"), o("5","$3$")],
    answer: 1,
    explanation: "공식 $\\displaystyle\\sum_{n=1}^{\\infty}n x^n=\\dfrac{x}{(1-x)^2}$ ($|x|<1$).\n$x=\\dfrac{1}{2}$ 대입: $\\dfrac{1/2}{(1/2)^2}=\\dfrac{1/2}{1/4}=2$."
  }),
  build({
    num: 9, subject: "선형대수", unit: "영공간", concept: "영공간 차원 (Rank-Nullity)", difficulty: "mediumHard",
    question: "다음과 같이 주어지는 행렬 $A$의 영공간(null space)의 차원을 $m$, $A^2$의 영공간의 차원을 $n$이라 할 때, $m+n$의 값은?\n\n$A=\\begin{pmatrix}0 & 1 & 0 & 0\\\\ 0 & 0 & 2 & 0\\\\ 0 & 0 & 0 & 3\\\\ 0 & 0 & 0 & 0\\end{pmatrix}$",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 3,
    explanation: "$A$는 nilpotent (위삼각, 대각 $0$). $\\operatorname{rank}(A)=3$ (영아닌 행 3개). 차원정리: $m=\\dim\\ker A=4-3=1$.\n$A^2=\\begin{pmatrix}0 & 0 & 2 & 0\\\\ 0 & 0 & 0 & 6\\\\ 0 & 0 & 0 & 0\\\\ 0 & 0 & 0 & 0\\end{pmatrix}$, $\\operatorname{rank}(A^2)=2$, $n=4-2=2$.\n$m+n=3$."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "극좌표·극곡선", concept: "장미곡선 한 잎 면적", difficulty: "easyMedium",
    question: "극곡선 $r=\\sin 2\\theta$의 한 고리로 둘러싸인 영역의 넓이는?",
    options: [o("1","$\\dfrac{\\pi}{32}$"), o("2","$\\dfrac{\\pi}{16}$"), o("3","$\\dfrac{3\\pi}{32}$"), o("4","$\\dfrac{\\pi}{8}$"), o("5","$\\dfrac{5\\pi}{32}$")],
    answer: 4,
    explanation: "$r=\\sin 2\\theta$는 4잎 장미. 한 잎의 넓이:\n$\\displaystyle S=\\dfrac{1}{2}\\!\\int_0^{\\pi/2}\\!\\sin^2 2\\theta\\,d\\theta=\\dfrac{1}{2}\\cdot\\dfrac{\\pi}{4}=\\dfrac{\\pi}{8}$.\n(공식: 짝수 $n$엽 장미의 한 잎 넓이는 $\\dfrac{\\pi a^2}{4n}\\cdot 2=\\dfrac{\\pi a^2}{2n}$ — 여기서 $r=a\\sin 2\\theta$의 한 잎 넓이는 $\\dfrac{\\pi}{8}$.)"
  }),
  build({
    num: 11, subject: "선형대수", unit: "고유치", concept: "트레이스와 행렬식", difficulty: "medium",
    question: "실수 성분을 갖는 $2\\times 2$ 대칭행렬 $A$의 대각합이 $3$, 행렬식이 $1$이다. 행렬 $B$를 $B=3A^3-2A$라 할 때, $B$의 대각합은?",
    options: [o("1","$45$"), o("2","$48$"), o("3","$51$"), o("4","$54$"), o("5","$57$")],
    answer: 2,
    explanation: "고윳값 $a,b$: $a+b=3,\\,ab=1$.\n$\\operatorname{tr}(A^3)=a^3+b^3=(a+b)^3-3ab(a+b)=27-9=18$.\n$\\operatorname{tr}(B)=3\\operatorname{tr}(A^3)-2\\operatorname{tr}(A)=3\\cdot 18-2\\cdot 3=48$."
  }),
  build({
    num: 12, subject: "미분학", unit: "고차도함수", concept: "$e^{-x^2}$의 100계 도함수", difficulty: "medium",
    question: "함수 $f(x)=e^{-x^2}$에 대하여 $f^{(100)}(0)$의 값은?",
    options: [o("1","$-\\dfrac{100!}{50!}$"), o("2","$-\\dfrac{100!}{49!}$"), o("3","$0$"), o("4","$\\dfrac{100!}{49!}$"), o("5","$\\dfrac{100!}{50!}$")],
    answer: 5,
    explanation: "맥로린: $\\displaystyle e^{-x^2}=\\sum_{n=0}^{\\infty}\\dfrac{(-x^2)^n}{n!}=\\sum\\dfrac{(-1)^n x^{2n}}{n!}$.\n$x^{100}$의 계수: $n=50$일 때 $\\dfrac{(-1)^{50}}{50!}=\\dfrac{1}{50!}$.\n$f^{(100)}(0)=$ ($x^{100}$ 계수)$\\times 100!=\\dfrac{100!}{50!}$."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "등위곡선", concept: "단위 접선벡터 (gradient에 수직)", difficulty: "medium",
    question: "함수 $f(x,y)=x-2y^2+4y-2$에 대하여 등위곡선 $f(x,y)=1$ 위의 한 점을 $P(x,2)$라 하자. 다음 중 점 $P$에서 등위곡선의 단위 접선 벡터인 것은?",
    options: [o("1","$\\!\\left(\\dfrac{4}{\\sqrt{17}},\\dfrac{1}{\\sqrt{17}}\\right)$"), o("2","$\\!\\left(-\\dfrac{4}{\\sqrt{17}},\\dfrac{1}{\\sqrt{17}}\\right)$"), o("3","$\\!\\left(\\dfrac{5}{\\sqrt{34}},\\dfrac{3}{\\sqrt{34}}\\right)$"), o("4","$\\!\\left(-\\dfrac{5}{\\sqrt{34}},\\dfrac{3}{\\sqrt{34}}\\right)$"), o("5","$\\!\\left(\\dfrac{3}{\\sqrt{34}},\\dfrac{5}{\\sqrt{34}}\\right)$")],
    answer: 1,
    explanation: "점 $P$의 $x$좌표: $f(x,2)=x-8+8-2=x-2=1\\Rightarrow x=3$. $P=(3,2)$.\n경도: $\\nabla f=(f_x,f_y)=(1,\\,-4y+4)$. $P$에서 $\\nabla f=(1,-4)$.\n등위곡선의 접선벡터는 경도와 수직 → $(4,1)$ 방향 (혹은 $(-4,-1)$).\n단위벡터: $\\dfrac{1}{\\sqrt{17}}(4,1)$."
  }),
  build({
    num: 14, subject: "선형대수", unit: "행렬식", concept: "외적 형태 합 + 행렬식", difficulty: "mediumHard",
    question: "$\\mathbb{R}^3$의 행벡터를 $1\\times 3$행렬로 이해할 때, $v_1=(1,a_1,a_2),\\,v_2=(0,2,a_3),\\,v_3=(0,0,1)$, $w_1=(b_1,b_2,3),\\,w_2=(0,1,b_3),\\,w_3=(0,0,2)$에 대하여 $3\\times 3$행렬 $A=\\displaystyle\\sum_{i=1}^{3}v_i^T w_i$의 행렬식이 $60$이다. $b_1$의 값은?",
    options: [o("1","$5$"), o("2","$10$"), o("3","$15$"), o("4","$20$"), o("5","$30$")],
    answer: 3,
    explanation: "$v_i^T w_i$는 외적: 1열 $i$의 $v_i^T$, 1행 $i$의 $w_i$의 곱셈으로 만들어진 rank-1 행렬.\n$A=v_1^T w_1+v_2^T w_2+v_3^T w_3$는 행렬곱 $V^T\\cdot W$ 형태($V,W$는 행으로 $v_i,w_i$를 쌓은 행렬).\n$V=\\begin{pmatrix}1 & a_1 & a_2\\\\ 0 & 2 & a_3\\\\ 0 & 0 & 1\\end{pmatrix},\\,W=\\begin{pmatrix}b_1 & b_2 & 3\\\\ 0 & 1 & b_3\\\\ 0 & 0 & 2\\end{pmatrix}$.\n$\\det A=\\det V^T\\cdot\\det W=(1\\cdot 2\\cdot 1)(b_1\\cdot 1\\cdot 2)=4b_1$.\n$4b_1=60\\Rightarrow b_1=15$."
  }),
  build({
    num: 15, subject: "적분학", unit: "정적분의 계산", concept: "역함수 적분 (치환)", difficulty: "mediumHard",
    question: "함수 $f(x)=x+e^x$에 대하여 정적분 $\\displaystyle\\int_1^{1+e}\\!f^{-1}(x)\\!\\left\\{x-f^{-1}(x)\\right\\}dx$의 값은?",
    options: [o("1","$\\dfrac{1}{4}e^2+\\dfrac{5}{4}$"), o("2","$\\dfrac{1}{2}e^2+\\dfrac{5}{4}$"), o("3","$\\dfrac{3}{4}e^2+\\dfrac{5}{4}$"), o("4","$e^2+\\dfrac{5}{4}$"), o("5","$\\dfrac{5}{4}e^2+\\dfrac{5}{4}$")],
    answer: 1,
    explanation: "$f^{-1}(x)=t$ 치환 → $x=f(t)=t+e^t$, $dx=(1+e^t)dt$. 경계: $x=1$에서 $t=0$, $x=1+e$에서 $t=1$.\n$x-f^{-1}(x)=f(t)-t=e^t$.\n$\\displaystyle=\\int_0^1 t\\cdot e^t\\cdot(1+e^t)dt=\\int_0^1 te^t\\,dt+\\int_0^1 te^{2t}dt$.\n• $\\int_0^1 te^t dt=[te^t-e^t]_0^1=1$.\n• $\\int_0^1 te^{2t}dt=\\!\\left[\\dfrac{t}{2}e^{2t}-\\dfrac{1}{4}e^{2t}\\right]_0^1=\\dfrac{e^2}{2}-\\dfrac{e^2}{4}+\\dfrac{1}{4}=\\dfrac{e^2}{4}+\\dfrac{1}{4}$.\n합: $1+\\dfrac{e^2}{4}+\\dfrac{1}{4}=\\dfrac{e^2}{4}+\\dfrac{5}{4}$."
  }),
  build({
    num: 16, subject: "적분학", unit: "정적분의 계산", concept: "삼각치환 ($\\arccos$)", difficulty: "medium",
    question: "정적분 $\\displaystyle\\int_0^1\\!\\sin(2\\arccos x)\\,dx$의 값은?",
    options: [o("1","$\\dfrac{2}{3}$"), o("2","$\\dfrac{7}{12}$"), o("3","$\\dfrac{1}{2}$"), o("4","$\\dfrac{5}{12}$"), o("5","$\\dfrac{1}{3}$")],
    answer: 1,
    explanation: "$\\sin(2\\arccos x)=2\\sin(\\arccos x)\\cos(\\arccos x)=2x\\sqrt{1-x^2}$.\n$\\displaystyle\\int_0^1 2x\\sqrt{1-x^2}\\,dx$. $u=1-x^2$ 치환 ($du=-2xdx$):\n$=\\int_0^1 \\sqrt{u}\\,du=\\!\\left[\\dfrac{2}{3}u^{3/2}\\right]_0^1=\\dfrac{2}{3}$."
  }),
  build({
    num: 17, subject: "다변수함수", unit: "최댓값·최솟값", concept: "코시-슈바르츠 (타원체 위 일차식)", difficulty: "medium",
    question: "곡면 $x^2+10y^2+z^2=5$에서 정의되는 함수 $f(x,y,z)=8x-4z$의 최댓값은?",
    options: [o("1","$16$"), o("2","$17$"), o("3","$18$"), o("4","$19$"), o("5","$20$")],
    answer: 5,
    explanation: "코시-슈바르츠: $(8x+0\\cdot y-4z)^2\\le(8^2+0+4^2)(x^2+y^2+z^2)$? 직접은 $y$ 계수가 안 맞음. 대신 $10y^2$ 분배:\n$(8x-4z)^2\\le(8^2+0+(-4)^2)(x^2+10y^2+z^2)=80\\cdot 5=400$.\n(엄밀히: $(8x-4z)^2\\le(8^2+0+4^2)(x^2+0+z^2)\\le 80(x^2+10y^2+z^2)$.)\n$|8x-4z|\\le 20$. 최댓값 $20$."
  }),
  build({
    num: 18, subject: "다변수함수", unit: "선적분", concept: "선적분 (직접 계산)", difficulty: "medium",
    question: "힘마당 $F(x,y)=(x^2,-xy)$가 곡선 $r(t)=(\\cos t,\\sin t)$ ($0\\le t\\le\\pi/2$)를 따라 입자를 움직일 때 한 일의 값은?",
    options: [o("1","$-\\dfrac{1}{6}$"), o("2","$-\\dfrac{1}{3}$"), o("3","$-\\dfrac{1}{2}$"), o("4","$-\\dfrac{2}{3}$"), o("5","$-\\dfrac{5}{6}$")],
    answer: 4,
    explanation: "$\\displaystyle\\int_C F\\cdot dr=\\int_0^{\\pi/2}(\\cos^2 t,-\\cos t\\sin t)\\cdot(-\\sin t,\\cos t)\\,dt$\n$=\\int_0^{\\pi/2}(-\\sin t\\cos^2 t-\\sin t\\cos^2 t)\\,dt=-2\\!\\int_0^{\\pi/2}\\!\\sin t\\cos^2 t\\,dt$\n$=-2\\!\\left[-\\dfrac{\\cos^3 t}{3}\\right]_0^{\\pi/2}=-2\\cdot\\dfrac{1}{3}=-\\dfrac{2}{3}$."
  }),
  build({
    num: 19, subject: "미분학", unit: "곡선의 곡률", concept: "곡률 최댓값", difficulty: "mediumHard",
    question: "곡선 $y=\\ln x$의 곡률의 최댓값은?",
    options: [o("1","$\\dfrac{\\sqrt{3}}{9}$"), o("2","$\\dfrac{2\\sqrt{3}}{9}$"), o("3","$\\dfrac{\\sqrt{3}}{3}$"), o("4","$\\dfrac{4\\sqrt{3}}{9}$"), o("5","$\\dfrac{5\\sqrt{3}}{9}$")],
    answer: 2,
    explanation: "곡률 $\\kappa(x)=\\dfrac{|y''|}{(1+(y')^2)^{3/2}}$. $y'=1/x,\\,y''=-1/x^2$.\n$\\kappa(x)=\\dfrac{1/x^2}{(1+1/x^2)^{3/2}}=\\dfrac{x}{(x^2+1)^{3/2}}$.\n$\\kappa'(x)=0$: $\\dfrac{(x^2+1)^{3/2}-x\\cdot\\frac{3}{2}(x^2+1)^{1/2}\\cdot 2x}{(x^2+1)^3}=0\\Rightarrow x^2+1-3x^2=0\\Rightarrow x=\\dfrac{1}{\\sqrt{2}}$.\n대입: $\\kappa=\\dfrac{1/\\sqrt{2}}{(3/2)^{3/2}}=\\dfrac{1/\\sqrt{2}}{3\\sqrt{3}/(2\\sqrt{2})}=\\dfrac{2}{3\\sqrt{3}}=\\dfrac{2\\sqrt{3}}{9}$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "삼중적분", concept: "적분순서 변경", difficulty: "medium",
    question: "임의의 연속함수 $f:\\mathbb{R}^3\\to\\mathbb{R}$에 대하여 다음 등식이 성립할 때, $a+b+c+d$의 값은?\n\n$\\displaystyle\\int_0^1\\!\\int_0^{y^{1/3}}\\!\\int_0^{1-y}\\!f(x,y,z)\\,dz\\,dy\\,dx=\\int_0^1\\!\\int_a^b\\!\\int_c^d\\!f(x,y,z)\\,dx\\,dy\\,dz$",
    options: [o("1","$y^3-x+2$"), o("2","$y^3+x-2$"), o("3","$y^3-y+2$"), o("4","$y^3+z-2$"), o("5","$y^3-z+2$")],
    answer: 5,
    explanation: "원래 영역: $0\\le x\\le 1,\\,0\\le y\\le x^{1/3}\\Leftrightarrow y^3\\le x\\le 1,\\,0\\le z\\le 1-y$.\n순서 $dx\\,dy\\,dz$로 변경:\n• $z$ 외부: $0\\le z$. $z\\le 1-y$이므로 $y\\le 1-z$.\n• $y$: $0\\le y\\le 1-z$.\n• $x$: $y^3\\le x\\le 1$.\n변경 결과: $\\displaystyle\\int_0^1\\!\\int_0^{1-z}\\!\\int_{y^3}^{1}f\\,dx\\,dy\\,dz$.\n비교: $a=0,\\,b=1-z,\\,c=y^3,\\,d=1$. $a+b+c+d=0+(1-z)+y^3+1=y^3-z+2$."
  }),
  build({
    num: 21, subject: "적분학", unit: "정적분의 계산", concept: "부분분수 (원시함수가 유리함수)", difficulty: "mediumHard",
    question: "함수 $f(x)=x^3+2x^2+ax+1$에 대하여 부정적분 $\\displaystyle\\int\\dfrac{f(x)}{x^3(x+1)^2}dx$가 유리함수 $g(x)$일 때, $g'(0)$의 값은? (단, $a$는 상수이다.)",
    options: [o("1","$\\dfrac{3}{2}$"), o("2","$\\dfrac{7}{4}$"), o("3","$2$"), o("4","$\\dfrac{9}{4}$"), o("5","$\\dfrac{5}{2}$")],
    answer: 5,
    explanation: "원시함수가 유리함수가 되려면 $\\ln$ 항이 나오면 안 됨 → 부분분수에서 $\\dfrac{?}{x}$나 $\\dfrac{?}{x+1}$ 항 부재.\n$\\dfrac{f(x)}{x^3(x+1)^2}=\\dfrac{A}{x^2}+\\dfrac{B}{x^3}+\\dfrac{C}{(x+1)^2}$ 형태.\n공통분모: $A x(x+1)^2+B(x+1)^2+C x^3=(A+C)x^3+(2A+B)x^2+(A+2B)x+B$.\n$f(x)=x^3+2x^2+ax+1$과 비교: $A+C=1,\\,2A+B=2,\\,A+2B=a,\\,B=1$.\n$A=1/2,\\,B=1,\\,C=1/2,\\,a=5/2$.\n$f(x)=x^3+2x^2+\\tfrac{5}{2}x+1$. $f'(0)=$ ($x$의 계수)$=\\dfrac{5}{2}$.\n($g'(0)$ 표기 오류 — 실제론 $f'(0)$ or $a$. 답 $\\dfrac{5}{2}$.)"
  }),
  build({
    num: 22, subject: "적분학", unit: "정적분의 응용", concept: "회전면 넓이 ($x$축)", difficulty: "mediumHard",
    question: "$x$축을 중심축으로 곡선 $x=\\dfrac{1}{8}y^4+\\dfrac{1}{4y^2}$ ($1\\le y\\le\\sqrt{2}$)를 회전시켜 얻어지는 곡면의 넓이는?",
    options: [o("1","$\\dfrac{\\pi}{10}(8-3\\sqrt{2})$"), o("2","$\\dfrac{\\pi}{5}(8-3\\sqrt{2})$"), o("3","$\\dfrac{\\pi}{5}(4+3\\sqrt{2})$"), o("4","$\\dfrac{\\pi}{10}(8+3\\sqrt{2})$"), o("5","$\\dfrac{\\pi}{5}(8+3\\sqrt{2})$")],
    answer: 4,
    explanation: "변수를 바꿔 $y$ 대신 $x$ 사용 (기호 통일). $S=2\\pi\\!\\int y\\,ds$ ($y$가 $x$축까지 거리).\n$\\dfrac{dx}{dy}=\\dfrac{y^3}{2}-\\dfrac{1}{2y^3}$, $1+(dx/dy)^2=\\!\\left(\\dfrac{y^3}{2}+\\dfrac{1}{2y^3}\\right)^2$.\n$\\sqrt{\\cdot}=\\dfrac{y^3}{2}+\\dfrac{1}{2y^3}$.\n$\\displaystyle S=2\\pi\\!\\int_1^{\\sqrt{2}}y\\!\\left(\\dfrac{y^3}{2}+\\dfrac{1}{2y^3}\\right)\\!dy=2\\pi\\!\\int_1^{\\sqrt{2}}\\!\\left(\\dfrac{y^4}{2}+\\dfrac{1}{2y^2}\\right)dy$\n$=2\\pi\\!\\left[\\dfrac{y^5}{10}-\\dfrac{1}{2y}\\right]_1^{\\sqrt{2}}=2\\pi\\!\\left[\\dfrac{4\\sqrt{2}}{10}-\\dfrac{\\sqrt{2}}{4}-\\dfrac{1}{10}+\\dfrac{1}{2}\\right]$\n정리: $=\\dfrac{\\pi}{10}(8+3\\sqrt{2})$."
  }),
  build({
    num: 23, subject: "다변수함수", unit: "선적분", concept: "선적분 (특이점 회전수)", difficulty: "medium",
    question: "곡선 $C:r(t)=(3\\cos t,\\,3\\sin t)$ ($0\\le t\\le 2\\pi$)에 대하여 선적분 $\\displaystyle\\int_C\\dfrac{y-1}{x^2+(y-1)^2}dx+\\dfrac{-x}{x^2+(y-1)^2}dy$의 값은?",
    options: [o("1","$-4\\pi$"), o("2","$-2\\pi$"), o("3","$0$"), o("4","$2\\pi$"), o("5","$4\\pi$")],
    answer: 2,
    explanation: "$y$축 $-1$ 평행이동 ($Y=y-1$)하면 분모 $x^2+Y^2$. $C$가 점 $(0,1)$ 즉 $(x,Y)=(0,0)$를 포함.\n특이점이 있는 표준 \"각도 $1$형식\" 변형. 부호: $\\dfrac{Y}{x^2+Y^2}dx+\\dfrac{-x}{x^2+Y^2}dY$, 즉 $-\\!\\left(\\dfrac{-Y}{x^2+Y^2}dx+\\dfrac{x}{x^2+Y^2}dY\\right)$.\n괄호 안은 $d\\arctan(Y/x)$ 형태로 반시계 1회전 시 $2\\pi$.\n$C$는 반지름 $3$짜리 원 (반시계방향) → $-1\\cdot 2\\pi=-2\\pi$."
  }),
  build({
    num: 24, subject: "다변수함수", unit: "삼중적분", concept: "회전체 + 원기둥좌표", difficulty: "mediumHard",
    question: "좌표공간의 $yz$평면에서 세 직선 $z=-1$, $z=1$, $z$축과 곡선 $y=f(z)=2-\\sqrt{1-z^2}$에 둘러싸인 영역을 $D$라 하자. $z$축을 중심축으로 $D$를 회전시켜 얻은 영역을 $E$라 할 때, 다음 삼중적분의 값은?\n\n$\\displaystyle\\iiint_E\\dfrac{3x^2}{(f(z))^4}dV$",
    options: [o("1","$\\dfrac{\\pi}{2}$"), o("2","$\\dfrac{3\\pi}{4}$"), o("3","$\\pi$"), o("4","$\\dfrac{5\\pi}{4}$"), o("5","$\\dfrac{3\\pi}{2}$")],
    answer: 5,
    explanation: "$z\\in[-1,1]$ 고정, 단면은 반지름 $f(z)$짜리 원판.\n원기둥좌표 $x=r\\cos\\theta,\\,y=r\\sin\\theta$:\n$\\displaystyle\\iint_{r\\le f(z)}\\!\\dfrac{3r^2\\cos^2\\theta}{f(z)^4}r\\,dr\\,d\\theta=\\dfrac{3}{f(z)^4}\\!\\int_0^{2\\pi}\\!\\cos^2\\theta\\,d\\theta\\!\\int_0^{f(z)}r^3 dr=\\dfrac{3}{f(z)^4}\\cdot\\pi\\cdot\\dfrac{f(z)^4}{4}=\\dfrac{3\\pi}{4}$.\n$z$ 적분: $\\displaystyle\\int_{-1}^{1}\\dfrac{3\\pi}{4}dz=\\dfrac{3\\pi}{2}$."
  }),
  build({
    num: 25, subject: "선형대수", unit: "노름과 내적", concept: "행렬 작용 + 고윳값", difficulty: "mediumHard",
    question: "벡터 $x=(x_1,x_2,\\dots,x_n)\\in\\mathbb{R}^n$의 노름(norm)을 $\\|x\\|=\\sqrt{\\displaystyle\\sum_{k=1}^{n}x_k^2}$로 정의한다. 행렬 $A=\\begin{pmatrix}1 & 1 & 1\\\\ 2 & -1 & 1\\end{pmatrix}$과 $\\|x\\|=1$을 만족하는 임의의 $x\\in\\mathbb{R}^3$에 대하여 $\\|(A x^T)^T\\|$의 최댓값은?",
    options: [o("1","$2$"), o("2","$\\sqrt{5}$"), o("3","$\\sqrt{6}$"), o("4","$\\sqrt{7}$"), o("5","$2\\sqrt{2}$")],
    answer: 4,
    explanation: "$\\|Ax\\|^2=x^T A^T A x$. $\\|x\\|=1$ 위 최댓값은 $A^T A$의 최대 고윳값.\n$A^T A=\\begin{pmatrix}1 & 2\\\\ 1 & -1\\\\ 1 & 1\\end{pmatrix}\\begin{pmatrix}1 & 1 & 1\\\\ 2 & -1 & 1\\end{pmatrix}=\\begin{pmatrix}5 & -1 & 3\\\\ -1 & 2 & 0\\\\ 3 & 0 & 2\\end{pmatrix}$.\n특성다항식: $\\lambda^3-9\\lambda^2+14\\lambda=\\lambda(\\lambda^2-9\\lambda+14)=\\lambda(\\lambda-2)(\\lambda-7)=0$.\n최대 $\\lambda=7$. 최댓값 $\\sqrt{7}$."
  }),
];

console.log(`Uploading ${problems.length} problems for ${SCHOOL} ${YEAR} ${SESSION}...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
console.log(`✅ Inserted ${data?.length ?? 0} questions for ${SCHOOL} ${YEAR} ${SESSION}`);
