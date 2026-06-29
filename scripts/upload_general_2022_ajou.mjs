// Upload 2022년도 아주대 편입수학 기출 25문항 (5지선다, 문제 26~50)
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
const YEAR = "2022";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-ajou-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 26, subject: "미분학", unit: "역삼각함수", concept: "$\\sin^{-1}$ 합성·삼각함수 식", difficulty: "medium",
    question: "$\\alpha=\\sin^{-1}\\!\\left(\\sin\\!\\dfrac{11}{7}\\pi\\right)$에 관한 다음 내용 중 옳지 $\\mathbf{않은}$ 것을 고르라.\n\n(1) $\\cos\\alpha+\\sin\\alpha>0$\n(2) $\\alpha<0$\n(3) $\\sin\\alpha=\\sin\\!\\dfrac{11}{7}\\pi$\n(4) $\\cos\\alpha=\\cos\\!\\dfrac{11}{7}\\pi$\n(5) $\\cos 2\\alpha<0$",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)"), o("5","(5)")],
    answer: 1,
    explanation: "$\\sin\\!\\dfrac{11}{7}\\pi=\\sin\\!\\left(\\dfrac{11}{7}\\pi-2\\pi\\right)=\\sin\\!\\left(-\\dfrac{3}{7}\\pi\\right)$이고 $-\\dfrac{3}{7}\\pi\\in[-\\dfrac{\\pi}{2},\\dfrac{\\pi}{2}]$이므로 $\\alpha=-\\dfrac{3}{7}\\pi$.\n(1) $\\cos\\alpha+\\sin\\alpha=\\sqrt 2\\sin\\!\\left(\\alpha+\\dfrac{\\pi}{4}\\right)=\\sqrt 2\\sin\\!\\left(-\\dfrac{3}{7}\\pi+\\dfrac{\\pi}{4}\\right)=\\sqrt 2\\sin\\!\\left(-\\dfrac{5}{28}\\pi\\right)<0$. 거짓.\n(2)~(5) 모두 참."
  }),
  build({
    num: 27, subject: "미분학", unit: "극한과 연속", concept: "$e^{\\cdot}$ 꼴 극한", difficulty: "medium",
    question: "다음 극한 $\\displaystyle\\lim_{n\\to\\infty}\\!\\left(1-\\sin\\!\\left(\\dfrac{2}{\\sqrt n}\\right)\\right)^{\\!n}$의 값은?",
    options: [o("1","$e^{-2}$"), o("2","$e^{-1/2}$"), o("3","$e^{2}$"), o("4","발산"), o("5","$0$")],
    answer: 5,
    explanation: "$\\dfrac{1}{\\sqrt n}=t$ 치환($n\\to\\infty\\Leftrightarrow t\\to 0^+$, $n=1/t^2$).\n$(1-\\sin(2t))^{1/t^2}=\\!\\left[(1+(-\\sin 2t))^{-1/\\sin 2t}\\right]^{-\\sin(2t)/t^2}$.\n안쪽 $\\to e$. 지수 $-\\dfrac{\\sin 2t}{t^2}=-2\\cdot\\dfrac{\\sin 2t}{2t}\\cdot\\dfrac{1}{t}\\to-2\\cdot 1\\cdot\\infty=-\\infty$.\n극한 $=e^{-\\infty}=0$."
  }),
  build({
    num: 28, subject: "적분학", unit: "특이적분", concept: "수렴/발산 판정", difficulty: "medium",
    question: "다음 보기에서 수렴하는 이상 적분(improper integral)은 모두 몇 개인가?\n\n가. $\\displaystyle\\int_0^{\\infty}\\!\\dfrac{e^{-x^2}}{|x-2|^{3/2}}\\,dx$  나. $\\displaystyle\\int_0^{\\infty}\\!\\dfrac{1+x^{2022}}{\\sqrt x}\\,dx$  다. $\\displaystyle\\int_0^{\\infty}\\!e^{-(\\ln x)^2}\\,dx$  라. $\\displaystyle\\int_0^{\\infty}\\!\\dfrac{x}{1+2x+x^2}\\,dx$",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개"), o("5","$4$개")],
    answer: 2,
    explanation: "가. $x=2$에서 $|x-2|^{3/2}$의 $p=3/2\\ge 1$이므로 발산.\n나. $x\\to\\infty$에서 $\\dfrac{x^{2022}}{\\sqrt x}=x^{2021.5}$, 발산.\n다. $\\ln x=t$ 치환: $\\int_{-\\infty}^{\\infty}e^{-t^2}\\cdot e^t\\,dt=\\int e^{-(t-1/2)^2+1/4}\\,dt$는 가우시안 적분으로 수렴.\n라. $\\dfrac{x}{(1+x)^2}\\sim\\dfrac{1}{x}$ ($x\\to\\infty$)이므로 발산.\n수렴은 다. 1개."
  }),
  build({
    num: 29, subject: "적분학", unit: "급수", concept: "테일러 다항식·고계 도함수", difficulty: "medium",
    question: "함수 $f(x)=\\dfrac{2}{1+2x-x^2}$에 대한 $x=1$에서의 $8$차 테일러 다항식을 $P(x)$라 할 때 $P^{(6)}(1)$의 값은?",
    options: [o("1","$30$"), o("2","$-45$"), o("3","$45$"), o("4","$-90$"), o("5","$90$")],
    answer: 5,
    explanation: "$f(x)=\\dfrac{2}{2-(x-1)^2}=\\dfrac{1}{1-\\frac{(x-1)^2}{2}}$.\n등비급수 전개: $f(x)=1+\\dfrac{(x-1)^2}{2}+\\dfrac{(x-1)^4}{4}+\\dfrac{(x-1)^6}{8}+\\cdots$.\n$(x-1)^6$의 계수 $=\\dfrac{1}{8}$이므로 $P^{(6)}(1)=\\dfrac{1}{8}\\cdot 6!=\\dfrac{720}{8}=90$."
  }),
  build({
    num: 30, subject: "다변수함수", unit: "편도함수", concept: "선형근사(전미분)", difficulty: "easy",
    question: "함수 $f(x,y)=(x+2y)^3$의 $(-1,1)$에서의 선형근사함수를 이용한 $f(-1.1,\\,1.1)$의 근삿값은?",
    options: [o("1","$1.1$"), o("2","$1.2$"), o("3","$1.3$"), o("4","$1.4$"), o("5","$1.5$")],
    answer: 3,
    explanation: "$f(-1,1)=(1)^3=1$.\n$df=3(x+2y)^2\\,dx+6(x+2y)^2\\,dy$. $(-1,1)$에서 $(x+2y)^2=1$이므로 $df=3\\,dx+6\\,dy$.\n$dx=-0.1,\\,dy=0.1$ 대입: $df=-0.3+0.6=0.3$.\n근삿값 $=1+0.3=1.3$."
  }),
  build({
    num: 31, subject: "적분학", unit: "급수", concept: "수렴 성질·반례", difficulty: "hard",
    question: "실수 수열 $\\{a_n\\}$에 대한 다음 보기의 내용 중 옳은 것은 모두 몇 개인가?\n\n가. 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}a_n$이 수렴하면 $\\displaystyle\\sum_{n=1}^{\\infty}a_n^2$은 수렴한다.\n나. 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}a_n^2$이 수렴하면 $\\displaystyle\\sum_{n=1}^{\\infty}a_n^3$은 수렴한다.\n다. 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}a_n$이 수렴하면 $\\displaystyle\\sum_{n=1}^{\\infty}(-1)^n\\dfrac{a_n}{\\sqrt n}$은 수렴한다.\n라. 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{a_n}{\\sqrt n}$이 수렴하면 $\\displaystyle\\sum_{n=1}^{\\infty}(-1)^n a_n$은 수렴한다.",
    options: [o("1","$4$개"), o("2","$3$개"), o("3","$2$개"), o("4","$1$개"), o("5","$0$개")],
    answer: 4,
    explanation: "가. [거짓] 반례 $a_n=\\dfrac{(-1)^n}{\\sqrt n}$: $\\sum a_n$ 수렴(교대), $\\sum a_n^2=\\sum\\dfrac{1}{n}$ 발산.\n나. [참] $\\sum a_n^2$ 수렴 $\\Rightarrow a_n\\to 0\\Rightarrow$ 큰 $n$에서 $|a_n|<1$, $|a_n^3|=|a_n|\\cdot a_n^2\\le a_n^2$. $\\sum a_n^2$ 절대수렴이므로 $\\sum a_n^3$ 절대수렴.\n다. [거짓] 반례 $a_n=\\dfrac{(-1)^n}{\\sqrt n}$: $\\sum a_n$ 수렴, $(-1)^n\\dfrac{a_n}{\\sqrt n}=\\dfrac{1}{n}$이므로 $\\sum$ 발산.\n라. [거짓] $b_n=\\dfrac{a_n}{\\sqrt n}$ 치환하면 $(-1)^n a_n=(-1)^n\\sqrt n\\,b_n$; $\\sum b_n$ 수렴이라도 $\\sqrt n\\,b_n$의 부호변경 합이 수렴 보장 안 됨. 반례 동일.\n참은 1개."
  }),
  build({
    num: 32, subject: "적분학", unit: "급수", concept: "p-급수·적분판정", difficulty: "medium",
    question: "수열 $\\!\\left\\{a_n=\\dfrac{1}{n^{1/3}(\\ln n)^{2/5}}:n=2,3,4,\\ldots\\right\\}$에 대하여 다음 보기에서 수렴하는 것은 모두 몇 개인가?\n\n가. $\\displaystyle\\sum_{n=2}^{\\infty}a_n$  나. $\\displaystyle\\sum_{n=2}^{\\infty}a_n^2$  다. $\\displaystyle\\sum_{n=2}^{\\infty}a_n^3$  라. $\\displaystyle\\sum_{n=2}^{\\infty}a_n^4$",
    options: [o("1","$4$개"), o("2","$3$개"), o("3","$2$개"), o("4","$1$개"), o("5","$0$개")],
    answer: 3,
    explanation: "$a_n^k=\\dfrac{1}{n^{k/3}(\\ln n)^{2k/5}}$. 적분판정: $\\ln n=t,\\,dn=e^t dt$로 치환.\n가. $\\sum\\dfrac{1}{n^{1/3}(\\ln n)^{2/5}}\\to\\int\\dfrac{e^t}{e^{t/3}t^{2/5}}\\,dt=\\int e^{2t/3}t^{-2/5}\\,dt$ 발산.\n나. $k=2$: $\\sum\\dfrac{1}{n^{2/3}(\\ln n)^{4/5}}\\to\\int e^{t/3}t^{-4/5}\\,dt$ 발산.\n다. $k=3$: $\\sum\\dfrac{1}{n(\\ln n)^{6/5}}$, $p=6/5>1$이므로 수렴(p-급수 적분판정).\n라. $k=4$: $\\sum\\dfrac{1}{n^{4/3}(\\ln n)^{8/5}}$, $n^{4/3}$이 $n$보다 발산력 우세하므로 수렴.\n수렴: 다, 라. 2개."
  }),
  build({
    num: 33, subject: "다변수함수", unit: "다변수함수의 극값", concept: "라그랑주(타원경계)", difficulty: "mediumHard",
    question: "영역 $\\{(x,y):x^2+2y^2\\le 1\\}$에서 정의된 함수 $f(x,y)=x^3-2y^3$의 최댓값을 $M$, 최솟값을 $m$이라 할 때 $M-m$의 값은?",
    options: [o("1","$\\sqrt 2$"), o("2","$\\sqrt 3$"), o("3","$2\\sqrt 2$"), o("4","$2\\sqrt 3$"), o("5","$2$")],
    answer: 5,
    explanation: "내부 임계점: $f_x=3x^2=0,\\,f_y=-6y^2=0\\Rightarrow(0,0)$, $f=0$.\n경계 $x^2+2y^2=1$에서 라그랑주: $3x^2\\cdot 4y=-6y^2\\cdot 2x\\Rightarrow xy(x+y)=0$.\n(i) $x=0$: $2y^2=1$, $y=\\pm\\dfrac{1}{\\sqrt 2}$. $f=-2y^3=\\mp\\dfrac{1}{\\sqrt 2}$.\n(ii) $y=0$: $x=\\pm 1$. $f=\\pm 1$.\n(iii) $y=-x$: $3x^2=1$, $x=\\pm\\dfrac{1}{\\sqrt 3}$. $f=x^3+2x^3=3x^3=\\pm\\dfrac{1}{\\sqrt 3}\\cdot\\sqrt 3=\\pm\\dfrac{1}{\\sqrt 3}\\cdot$... 계산: $3x^3=3\\cdot\\dfrac{\\pm 1}{3\\sqrt 3}=\\dfrac{\\pm 1}{\\sqrt 3}$.\n최댓값 $M=1$, 최솟값 $m=-1$. $M-m=2$."
  }),
  build({
    num: 34, subject: "적분학", unit: "정적분", concept: "역함수 적분", difficulty: "easy",
    question: "다음 적분 $\\displaystyle\\int_0^{1}\\sin^{-1}x\\,dx$의 값은?",
    options: [o("1","존재하지 않음"), o("2","$\\dfrac{\\pi}{2}-1$"), o("3","$1$"), o("4","$\\dfrac{\\pi}{3}$"), o("5","$\\dfrac{\\pi}{2}$")],
    answer: 2,
    explanation: "역함수 적분 공식: $\\displaystyle\\int_0^{\\pi/2}\\!\\sin y\\,dy+\\!\\int_0^{1}\\!\\sin^{-1}x\\,dx=\\dfrac{\\pi}{2}\\cdot 1$ (사각형 넓이 $=$ 두 영역의 합).\n$\\int_0^{\\pi/2}\\sin y\\,dy=[-\\cos y]_0^{\\pi/2}=1$.\n$\\therefore\\int_0^1\\sin^{-1}x\\,dx=\\dfrac{\\pi}{2}-1$."
  }),
  build({
    num: 35, subject: "공학수학", unit: "라플라스변환", concept: "라플라스/직접계산", difficulty: "easy",
    question: "다음 적분 $\\displaystyle\\int_0^{\\infty}\\!e^{-x}\\sin(2x)\\,dx$의 값은?",
    options: [o("1","$\\dfrac{2}{5}$"), o("2","$\\dfrac{1}{5}$"), o("3","$-\\dfrac{1}{10}$"), o("4","$-\\dfrac{1}{5}$"), o("5","$-\\dfrac{2}{5}$")],
    answer: 1,
    explanation: "라플라스: $\\mathcal L\\{\\sin 2t\\}|_{s=1}=\\dfrac{2}{s^2+4}|_{s=1}=\\dfrac{2}{5}$.\n또는 직접: $\\!\\int_0^{\\infty}e^{-x}\\sin 2x\\,dx=\\!\\left[\\dfrac{e^{-x}}{5}(-\\sin 2x-2\\cos 2x)\\right]_0^{\\infty}=0-\\dfrac{1}{5}(0-2)=\\dfrac{2}{5}$."
  }),
  build({
    num: 36, subject: "다변수함수", unit: "다중적분", concept: "적분순서 변경", difficulty: "medium",
    question: "다음 적분의 값은? $\\displaystyle\\int_0^{81}\\!\\int_{\\sqrt[4]{x}}^{3}\\!\\cos\\!\\left(\\dfrac{\\pi}{1458}y^5\\right)dy\\,dx$",
    options: [o("1","$1$"), o("2","$\\dfrac{1}{\\sqrt 2}$"), o("3","$\\dfrac{729}{5\\pi}$"), o("4","$\\dfrac{1458}{5\\pi}$"), o("5","$\\dfrac{486}{\\pi}$")],
    answer: 3,
    explanation: "영역 $0\\le x\\le 81,\\,x^{1/4}\\le y\\le 3$를 $0\\le y\\le 3,\\,0\\le x\\le y^4$로 변경.\n$\\displaystyle\\int_0^3\\!\\int_0^{y^4}\\!\\cos\\!\\left(\\dfrac{\\pi}{1458}y^5\\right)dx\\,dy=\\!\\int_0^3 y^4\\cos\\!\\left(\\dfrac{\\pi}{1458}y^5\\right)dy$.\n$u=\\dfrac{\\pi}{1458}y^5,\\,du=\\dfrac{5\\pi}{1458}y^4\\,dy$: $\\dfrac{1458}{5\\pi}[\\sin u]_0^{\\pi/6}=\\dfrac{1458}{5\\pi}\\cdot\\dfrac{1}{2}=\\dfrac{729}{5\\pi}$."
  }),
  build({
    num: 37, subject: "선형대수", unit: "벡터", concept: "꼬인 두 직선 사이의 거리", difficulty: "medium",
    question: "다음 꼬인 위치의 두 직선 $l_1:\\,x-1=\\dfrac{y-2}{2}=-\\dfrac{z}{3}$, $l_2:\\,x=-z,\\,y=0$ 사이의 거리는?",
    options: [o("1","$\\sqrt 3$"), o("2","$\\dfrac{1}{\\sqrt 3}$"), o("3","$\\sqrt 5$"), o("4","$\\dfrac{1}{\\sqrt 5}$"), o("5","$1$")],
    answer: 1,
    explanation: "$l_1$: 점 $(1,2,0)$, 방향 $\\vec d_1=(1,2,-3)$. $l_2$: 점 $(0,0,0)$, 방향 $\\vec d_2=(1,0,-1)$.\n$\\vec n=\\vec d_1\\times\\vec d_2=\\!\\begin{vmatrix}\\mathbf i&\\mathbf j&\\mathbf k\\\\1&2&-3\\\\1&0&-1\\end{vmatrix}=(2\\cdot(-1)-(-3)\\cdot 0,\\,-(1\\cdot(-1)-(-3)\\cdot 1),\\,1\\cdot 0-2\\cdot 1)=(-2,-2,-2)\\parallel(1,1,1)$.\n$l_1$을 포함하고 $l_2$에 평행한 평면: $x+y+z=1+2+0=3$.\n$l_2$ 위 점 $(0,0,0)$과의 거리 $=\\dfrac{|0+0+0-3|}{\\sqrt 3}=\\sqrt 3$."
  }),
  build({
    num: 38, subject: "다변수함수", unit: "벡터해석", concept: "곡면의 넓이", difficulty: "medium",
    question: "곡면 $z=x^2+2y$의 일부 $S$는 $xy$-평면 상의 세 점 $O(0,0),\\,A(1,0),\\,B(1,1)$을 꼭짓점으로 갖는 삼각형(내부 포함)을 정사영으로 가진다. $S$의 넓이는?",
    options: [o("1","$\\dfrac{9}{4}-\\dfrac{5}{8}\\sqrt 5$"), o("2","$\\dfrac{9}{4}-\\dfrac{5}{12}\\sqrt 5$"), o("3","$\\dfrac{5}{4}-\\dfrac{5}{12}\\sqrt 5$"), o("4","$\\dfrac{3}{2}$"), o("5","$\\dfrac{5}{4}$")],
    answer: 2,
    explanation: "$z_x=2x,\\,z_y=2$. $\\sqrt{1+z_x^2+z_y^2}=\\sqrt{1+4x^2+4}=\\sqrt{5+4x^2}$.\n정의역 $D$: $0\\le x\\le 1,\\,0\\le y\\le x$.\n$\\displaystyle S=\\!\\int_0^1\\!\\int_0^{x}\\!\\sqrt{5+4x^2}\\,dy\\,dx=\\!\\int_0^1 x\\sqrt{5+4x^2}\\,dx$.\n$u=5+4x^2,\\,du=8x\\,dx$: $=\\dfrac{1}{8}\\cdot\\dfrac{2}{3}[u^{3/2}]_5^9=\\dfrac{1}{12}(27-5\\sqrt 5)=\\dfrac{9}{4}-\\dfrac{5\\sqrt 5}{12}$."
  }),
  build({
    num: 39, subject: "다변수함수", unit: "다중적분", concept: "구면좌표 삼중적분", difficulty: "hard",
    question: "다음 적분의 값은? $\\displaystyle\\int_{-1}^{1}\\!\\int_0^{\\sqrt{1-x^2}}\\!\\int_{\\sqrt{3(x^2+y^2)}}^{\\sqrt{1-x^2-y^2}}\\!y\\sqrt{x^2+y^2+z^2}\\,dz\\,dy\\,dx$",
    options: [o("1","$\\dfrac{1}{5}$"), o("2","$\\dfrac{\\pi}{30}-\\dfrac{\\sqrt 3}{40}$"), o("3","$\\dfrac{\\pi}{30}+\\dfrac{\\sqrt 3}{40}$"), o("4","$\\dfrac{\\pi}{30}-\\dfrac{\\sqrt 3}{20}$"), o("5","$\\dfrac{\\pi}{30}+\\dfrac{\\sqrt 3}{20}$")],
    answer: 4,
    explanation: "(주의: 출제자 발표 기준 정사영 영역에 오류 가능성이 지적된 문제. 문제 그대로 풀이.)\n구면좌표 $x=\\rho\\sin\\varphi\\cos\\theta,\\,y=\\rho\\sin\\varphi\\sin\\theta,\\,z=\\rho\\cos\\varphi$. $y\\sqrt{x^2+y^2+z^2}\\,dV=\\rho^4\\sin^2\\varphi\\sin\\theta\\,d\\rho\\,d\\varphi\\,d\\theta$.\n범위: 구 $\\rho\\le 1$, 원뿔 $z=\\sqrt 3\\sqrt{x^2+y^2}\\Leftrightarrow\\varphi\\le\\pi/6$, $y\\ge 0\\Leftrightarrow\\theta\\in[0,\\pi]$.\n$\\displaystyle=\\!\\int_0^{\\pi}\\!\\sin\\theta\\,d\\theta\\cdot\\!\\int_0^{\\pi/6}\\!\\sin^2\\varphi\\,d\\varphi\\cdot\\!\\int_0^1\\!\\rho^4\\,d\\rho=2\\cdot\\!\\left(\\dfrac{\\pi}{12}-\\dfrac{\\sqrt 3}{8}\\right)\\cdot\\dfrac{1}{5}=\\dfrac{\\pi}{30}-\\dfrac{\\sqrt 3}{20}$."
  }),
  build({
    num: 40, subject: "미분학", unit: "도함수", concept: "역함수 값", difficulty: "easy",
    question: "실수 전체에서 정의된 함수 $f(x)=\\dfrac{1}{3}x^3+\\dfrac{2}{3}x+1$과 $f$의 역함수 $g$에 대하여 $g(5)$의 값은?",
    options: [o("1","$\\dfrac{3}{2}$"), o("2","$2$"), o("3","$\\dfrac{7}{3}$"), o("4","$\\dfrac{5}{2}$"), o("5","$3$")],
    answer: 2,
    explanation: "$f(2)=\\dfrac{8}{3}+\\dfrac{4}{3}+1=4+1=5$이므로 $g(5)=2$."
  }),
  build({
    num: 41, subject: "미분학", unit: "도함수", concept: "역함수의 도함수", difficulty: "easy",
    question: "위(40번 설정)에서 $g'(5)$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$\\dfrac{3}{7}$"), o("3","$\\dfrac{3}{10}$"), o("4","$\\dfrac{3}{14}$"), o("5","$\\dfrac{1}{5}$")],
    answer: 4,
    explanation: "$g'(5)=\\dfrac{1}{f'(g(5))}=\\dfrac{1}{f'(2)}$. $f'(x)=x^2+\\dfrac{2}{3}$, $f'(2)=4+\\dfrac{2}{3}=\\dfrac{14}{3}$.\n$g'(5)=\\dfrac{3}{14}$."
  }),
  build({
    num: 42, subject: "적분학", unit: "정적분", concept: "역함수 적분 공식", difficulty: "medium",
    question: "위(40번 설정)에서 다음 정적분 $\\displaystyle\\int_2^{5}\\!g(x)\\,dx$의 값은?",
    options: [o("1","$\\dfrac{20}{3}$"), o("2","$6$"), o("3","$\\dfrac{16}{3}$"), o("4","$5$"), o("5","$\\dfrac{19}{4}$")],
    answer: 5,
    explanation: "역함수 적분: $\\!\\int_1^{2}\\!f(x)\\,dx+\\!\\int_2^{5}\\!g(x)\\,dx=2\\cdot 5-1\\cdot 2=8$ ($f(1)=2,\\,f(2)=5$).\n$\\!\\int_1^2 f(x)dx=\\!\\left[\\dfrac{x^4}{12}+\\dfrac{x^2}{3}+x\\right]_1^2=\\!\\left(\\dfrac{16}{12}+\\dfrac{4}{3}+2\\right)-\\!\\left(\\dfrac{1}{12}+\\dfrac{1}{3}+1\\right)=\\dfrac{15}{12}+1+1=\\dfrac{13}{4}$.\n$\\!\\int_2^5 g(x)dx=8-\\dfrac{13}{4}=\\dfrac{19}{4}$."
  }),
  build({
    num: 43, subject: "다변수함수", unit: "다중적분", concept: "극방정식 변환", difficulty: "easy",
    question: "곡선 $x^2+y^2=x+y$는 원이다. 이를 극방정식 $r=$ (가)로 나타낼 때 (가)에 적합한 식은?",
    options: [o("1","$\\cos\\theta$"), o("2","$\\sin\\theta$"), o("3","$\\cos\\theta+\\sin\\theta$"), o("4","$\\dfrac{1}{2}\\cos\\theta+\\dfrac{1}{2}\\sin\\theta$"), o("5","$2\\cos\\theta+2\\sin\\theta$")],
    answer: 3,
    explanation: "$x=r\\cos\\theta,\\,y=r\\sin\\theta$ 대입: $r^2=r\\cos\\theta+r\\sin\\theta$.\n$r\\ne 0$이면 $r=\\cos\\theta+\\sin\\theta$."
  }),
  build({
    num: 44, subject: "다변수함수", unit: "다중적분", concept: "극좌표 영역 넓이", difficulty: "medium",
    question: "위(43번 설정)에서 영역 $\\!\\left\\{(x,y):x^2+y^2\\le x+y,\\,y\\le\\sqrt 3 x,\\,y\\ge\\dfrac{1}{\\sqrt 3}x\\right\\}$의 넓이는?",
    options: [o("1","$\\dfrac{\\pi}{12}+\\dfrac{1}{4}$"), o("2","$\\dfrac{\\pi}{24}+\\dfrac{1}{8}$"), o("3","$\\dfrac{\\pi}{12}+\\dfrac{1}{8}$"), o("4","$\\dfrac{\\pi}{24}+\\dfrac{1}{4}$"), o("5","$\\dfrac{1}{2}$")],
    answer: 1,
    explanation: "각도 범위: $\\tan\\theta\\le\\sqrt 3\\Rightarrow\\theta\\le\\pi/3$, $\\tan\\theta\\ge 1/\\sqrt 3\\Rightarrow\\theta\\ge\\pi/6$.\n넓이 $\\displaystyle=\\dfrac{1}{2}\\!\\int_{\\pi/6}^{\\pi/3}\\!r^2\\,d\\theta=\\dfrac{1}{2}\\!\\int_{\\pi/6}^{\\pi/3}(\\cos\\theta+\\sin\\theta)^2\\,d\\theta=\\dfrac{1}{2}\\!\\int_{\\pi/6}^{\\pi/3}(1+\\sin 2\\theta)\\,d\\theta$\n$=\\dfrac{1}{2}\\!\\left[\\theta+\\sin^2\\theta\\right]_{\\pi/6}^{\\pi/3}=\\dfrac{1}{2}\\!\\left[\\!\\left(\\dfrac{\\pi}{3}+\\dfrac{3}{4}\\right)-\\!\\left(\\dfrac{\\pi}{6}+\\dfrac{1}{4}\\right)\\right]=\\dfrac{1}{2}\\!\\left(\\dfrac{\\pi}{6}+\\dfrac{1}{2}\\right)=\\dfrac{\\pi}{12}+\\dfrac{1}{4}$."
  }),
  build({
    num: 45, subject: "적분학", unit: "정적분의 응용", concept: "곡선의 길이 함수", difficulty: "medium",
    question: "양의 실수 $a$에 대하여 곡선 $y=e^{-x}$ ($0\\le x\\le a$)의 길이를 $L(a)$, 이 곡선을 $x$축 주위로 회전시켜 얻은 곡면의 넓이를 $A(a)$, 영역 $\\{(x,y):0\\le y\\le e^{-x},\\,0\\le x\\le a\\}$를 $y$축 주위로 회전시켜 얻은 입체의 부피를 $V(a)$라 하자. 다음 중 옳지 $\\mathbf{않은}$ 것은?\n\n(1) $L(a)$는 증가함수이다.\n(2) 모든 양수 $a$에 대하여 $L(a)\\ge a$가 성립한다.\n(3) 모든 양수 $a$에 대하여 $L(a)\\le\\sqrt 2\\,a$가 성립한다.\n(4) $L'(1)=\\sqrt 2$\n(5) $\\displaystyle\\lim_{a\\to\\infty}\\dfrac{L(a)}{a}=1$",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)"), o("5","(5)")],
    answer: 4,
    explanation: "$L(a)=\\!\\int_0^a\\!\\sqrt{1+e^{-2x}}\\,dx$, $L'(a)=\\sqrt{1+e^{-2a}}$.\n(1) $L'>0$이므로 증가. 참.\n(2)(3) $0\\le x\\le a$에서 $0\\le e^{-2x}\\le 1$이므로 $1\\le L'(x)\\le\\sqrt 2$. 적분하면 $a\\le L(a)\\le\\sqrt 2\\,a$. 참.\n(4) $L'(1)=\\sqrt{1+e^{-2}}\\ne\\sqrt 2$. 거짓.\n(5) $\\lim L'(a)=1$이므로 로피탈로 $\\lim L(a)/a=1$. 참."
  }),
  build({
    num: 46, subject: "적분학", unit: "정적분의 응용", concept: "회전곡면 넓이의 극한", difficulty: "mediumHard",
    question: "위(45번 설정)에서 극한 $\\displaystyle\\lim_{a\\to\\infty}\\!\\dfrac{A(a)}{\\pi}$의 값은?",
    options: [o("1","$\\sqrt 2+\\ln(\\sqrt 2+1)$"), o("2","$\\sqrt 2-\\ln(\\sqrt 2+1)$"), o("3","$\\sqrt 2\\ln(\\sqrt 2+1)$"), o("4","$\\sqrt 2\\ln(\\sqrt 2-1)$"), o("5","$\\infty$")],
    answer: 1,
    explanation: "$A(a)=2\\pi\\!\\int_0^a e^{-x}\\sqrt{1+e^{-2x}}\\,dx$. $\\dfrac{A(a)}{\\pi}\\to 2\\!\\int_0^{\\infty}\\!e^{-x}\\sqrt{1+e^{-2x}}\\,dx$.\n$t=e^{-x},\\,dt=-e^{-x}dx$: $=2\\!\\int_0^1\\!\\sqrt{1+t^2}\\,dt$.\n$t=\\tan\\theta$ 치환: $=2\\!\\int_0^{\\pi/4}\\!\\sec^3\\theta\\,d\\theta=2\\cdot\\dfrac{1}{2}[\\sec\\theta\\tan\\theta+\\ln|\\sec\\theta+\\tan\\theta|]_0^{\\pi/4}=\\sqrt 2+\\ln(\\sqrt 2+1)$."
  }),
  build({
    num: 47, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피의 극한", difficulty: "easy",
    question: "위(45번 설정)에서 극한 $\\displaystyle\\lim_{a\\to\\infty}\\!V(a)$의 값은?",
    options: [o("1","$\\pi$"), o("2","$2\\pi$"), o("3","$3\\pi$"), o("4","$4\\pi$"), o("5","$\\infty$")],
    answer: 2,
    explanation: "원주껍질법: $V(a)=2\\pi\\!\\int_0^a x\\,e^{-x}\\,dx$.\n$\\lim_{a\\to\\infty}V(a)=2\\pi\\!\\int_0^{\\infty}\\!xe^{-x}\\,dx=2\\pi\\cdot 1!=2\\pi$."
  }),
  build({
    num: 48, subject: "다변수함수", unit: "벡터해석", concept: "그린 정리(면적 공식)", difficulty: "mediumHard",
    question: "점 $A(2,2)$에서 출발하여 $B(1,1),\\,C(0,2),\\,D(-1,2),\\,E(-2,1),\\,F(-2,-1),\\,G(-1,0),\\,H(1,-2)$를 거쳐 $I(2,-2)$에 이르는 선분들로 구성된 곡선을 $C_1$이라 하고, $A(2,2)$에서 $I(2,-2)$에 이르는 선분을 $C_2$라 하자. 다음 선적분 $\\displaystyle\\int_{C_1}\\!(-y\\,dx+x\\,dy)$의 값은?",
    options: [o("1","$-2$"), o("2","$6$"), o("3","$14$"), o("4","$22$"), o("5","$30$")],
    answer: 3,
    explanation: "$C=C_1\\cup(-C_2)$로 닫힌 다각형. $\\!\\oint_C(-y\\,dx+x\\,dy)=2\\cdot(\\text{면적})$.\n신발끈공식으로 면적 $=11$이므로 $\\!\\oint_C=22$.\n$C_2$ 적분: $\\mathbf r(t)=(2,-t),\\,-2\\le t\\le 2$. $\\!\\int_{C_2}=\\!\\int_{-2}^2(t,2)\\cdot(0,-1)\\,dt=\\!\\int_{-2}^2(-2)\\,dt=-8$.\n$\\!\\int_{C_1}=\\!\\oint_C+\\!\\int_{C_2}=22+(-8)=14$."
  }),
  build({
    num: 49, subject: "다변수함수", unit: "벡터해석", concept: "선적분(그놈)", difficulty: "medium",
    question: "위(48번 설정)에서 다음 선적분의 값은? $\\displaystyle\\int_{C_2}\\!\\left(-\\dfrac{y}{x^2+y^2}\\,dx+\\dfrac{x}{x^2+y^2}\\,dy\\right)$",
    options: [o("1","$\\dfrac{\\pi}{2}$"), o("2","$\\dfrac{\\pi}{4}$"), o("3","$0$"), o("4","$-\\dfrac{\\pi}{4}$"), o("5","$-\\dfrac{\\pi}{2}$")],
    answer: 5,
    explanation: "$\\mathbf r(t)=(2,-t),\\,-2\\le t\\le 2$. $x=2,\\,y=-t,\\,x^2+y^2=4+t^2,\\,dx=0,\\,dy=-dt$.\n$\\displaystyle\\int=\\!\\int_{-2}^2\\!\\dfrac{2}{4+t^2}(-dt)=-2\\cdot\\dfrac{1}{2}[\\tan^{-1}(t/2)]_{-2}^2=-\\!\\left(\\dfrac{\\pi}{4}+\\dfrac{\\pi}{4}\\right)=-\\dfrac{\\pi}{2}$."
  }),
  build({
    num: 50, subject: "다변수함수", unit: "벡터해석", concept: "원점 둘러싸는 닫힘 변형", difficulty: "medium",
    question: "위(48번 설정)에서 다음 선적분의 값은? $\\displaystyle\\int_{C_1}\\!\\left(-\\dfrac{y}{x^2+y^2}\\,dx+\\dfrac{x}{x^2+y^2}\\,dy\\right)$",
    options: [o("1","$-\\dfrac{5\\pi}{2}$"), o("2","$-\\dfrac{3\\pi}{2}$"), o("3","$-\\dfrac{\\pi}{2}$"), o("4","$\\dfrac{3\\pi}{2}$"), o("5","$\\dfrac{5\\pi}{2}$")],
    answer: 4,
    explanation: "$C=C_1\\cup(-C_2)$는 원점을 둘러싸는 반시계 폐곡선이므로 \"그놈\" 적분 $=2\\pi$.\n$\\!\\int_{C_1}-\\!\\int_{C_2}=2\\pi\\Rightarrow\\!\\int_{C_1}=2\\pi+\\!\\int_{C_2}=2\\pi+\\!\\left(-\\dfrac{\\pi}{2}\\right)=\\dfrac{3\\pi}{2}$."
  })
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (2022 아주대):`, data.map((d) => d.id).join(", "));
