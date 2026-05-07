// Upload 2025년도 건국대 편입수학 기출 20문항 (21~40번, 5지선다)
// Usage: node scripts/upload_general_2025_konkuk.mjs
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

const SCHOOL = "건국대";
const YEAR = "2025";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });

function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-konkuk-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return {
    id, subject, unit, concept, difficulty,
    source_type: "imported", question, content_type: "latex", question_image: null,
    options, correct_option_id: String(answer), explanation,
    explanation_content_type: "latex", explanation_image: null, tags,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  };
}

const problems = [
  build({
    num: 21, subject: "미분학", unit: "극한과 연속", concept: "무한대 극한(켤레식)", difficulty: "easy",
    question: "$\\displaystyle\\lim_{x\\to\\infty}\\!\\left(\\sqrt{x^2+7x}-\\sqrt{x^2+x}\\right)$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 3,
    explanation: "켤레식: $\\sqrt{x^2+7x}-\\sqrt{x^2+x}=\\dfrac{(x^2+7x)-(x^2+x)}{\\sqrt{x^2+7x}+\\sqrt{x^2+x}}=\\dfrac{6x}{\\sqrt{x^2+7x}+\\sqrt{x^2+x}}$. 분모를 $x$로 묶어 $x\\to\\infty$일 때 $\\dfrac{6x}{2x}=3$."
  }),
  build({
    num: 22, subject: "적분학", unit: "정적분의 계산", concept: "삼각함수 적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^{\\pi/4}\\dfrac{1+\\sin x}{1-\\sin x}\\,dx$의 값은?",
    options: [o("1","$2\\sqrt{2}-\\dfrac{\\pi}{4}$"), o("2","$2\\sqrt{2}+\\dfrac{\\pi}{4}$"), o("3","$4-2\\sqrt{2}-\\dfrac{\\pi}{4}$"), o("4","$4+2\\sqrt{2}-\\dfrac{\\pi}{4}$"), o("5","$4+2\\sqrt{2}+\\dfrac{\\pi}{4}$")],
    answer: 1,
    explanation: "분자/분모에 $1+\\sin x$ 곱: $\\dfrac{(1+\\sin x)^2}{\\cos^2 x}=\\sec^2 x+2\\sec x\\tan x+\\tan^2 x=2\\sec^2 x+2\\sec x\\tan x-1$. 적분 $=2\\tan x+2\\sec x-x\\,\\Big|_0^{\\pi/4}=(2+2\\sqrt 2-\\tfrac{\\pi}{4})-(0+2-0)=2\\sqrt 2-\\dfrac{\\pi}{4}$."
  }),
  build({
    num: 23, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피(원통셸)", difficulty: "easyMedium",
    question: "곡선 $y=\\sqrt{x}$와 두 직선 $y=0$, $x=2$로 둘러싸인 영역을 직선 $x=-1$을 축으로 회전하여 생기는 입체의 부피는?",
    options: [o("1","$\\dfrac{88\\sqrt{2}}{15}\\pi$"), o("2","$\\dfrac{91\\sqrt{2}}{15}\\pi$"), o("3","$\\dfrac{94\\sqrt{2}}{15}\\pi$"), o("4","$\\dfrac{97\\sqrt{2}}{15}\\pi$"), o("5","$\\dfrac{20\\sqrt{2}}{3}\\pi$")],
    answer: 1,
    explanation: "원통셸: 회전축 $x=-1$로부터 거리 $x+1$, 높이 $\\sqrt x$. $V=2\\pi\\int_0^2(x+1)\\sqrt x\\,dx=2\\pi\\int_0^2(x^{3/2}+x^{1/2})dx=2\\pi\\!\\left[\\tfrac{2}{5}x^{5/2}+\\tfrac{2}{3}x^{3/2}\\right]_0^2=2\\pi\\sqrt 2\\!\\left(\\tfrac{8}{5}+\\tfrac{4}{3}\\right)=\\dfrac{88\\sqrt 2}{15}\\pi$."
  }),
  build({
    num: 24, subject: "적분학", unit: "특이적분", concept: "수렴/발산 판정", difficulty: "medium",
    question: "다음 이상적분 중 수렴하는 것을 모두 고르면?\n\n(a) $\\displaystyle\\int_2^{\\infty}\\dfrac{1-e^{-2x}}{x}\\,dx$ \\quad (b) $\\displaystyle\\int_0^{\\infty}\\dfrac{1}{x^2+1}\\,dx$ \\quad (c) $\\displaystyle\\int_{\\pi/4}^{\\infty}\\dfrac{3+\\sin x}{2x}\\,dx$",
    options: [o("1","(a)"), o("2","(b)"), o("3","(c)"), o("4","(b),(c)"), o("5","(a),(b),(c)")],
    answer: 2,
    explanation: "(a) 큰 $x$에서 피적분함수 $\\sim 1/x$이므로 발산. (b) $\\arctan x\\,\\big|_0^{\\infty}=\\dfrac{\\pi}{2}$ 수렴. (c) $\\dfrac{3+\\sin x}{2x}\\ge\\dfrac{1}{x}$이라 $\\int 1/x$와 비교해 발산. 수렴: (b)."
  }),
  build({
    num: 25, subject: "미분학", unit: "순간 변화율", concept: "매개변수 곡선 접선", difficulty: "medium",
    question: "실수 $t$에 대하여 매개변수방정식 $x=t^2$, $y=t^3-4t$로 주어진 곡선을 $C$라 하자. $t=-2$와 $t=2$에서 각각 구한 곡선 $C$의 접선들 사이의 각의 크기가 $\\theta$일 때, $\\sin\\theta$의 값은?",
    options: [o("1","$\\dfrac{1}{5}$"), o("2","$\\dfrac{2}{5}$"), o("3","$\\dfrac{3}{5}$"), o("4","$\\dfrac{4}{5}$"), o("5","$1$")],
    answer: 4,
    explanation: "$\\dfrac{dy}{dx}=\\dfrac{3t^2-4}{2t}$. $t=-2$: $\\dfrac{8}{-4}=-2$, $t=2$: $\\dfrac{8}{4}=2$. 두 접선 기울기 $m_1=-2,\\,m_2=2$. $\\tan\\theta=\\left|\\dfrac{m_2-m_1}{1+m_1 m_2}\\right|=\\dfrac{4}{|1-4|}=\\dfrac{4}{3}$. 직각삼각 $3,4,5$에서 $\\sin\\theta=\\dfrac{4}{5}$."
  }),
  build({
    num: 26, subject: "미분학", unit: "미분", concept: "역함수의 미분", difficulty: "medium",
    question: "$x>0$일 때, $f(x)=e^x+e^{-x}$이고 $g(x)$는 $f(x)$의 역함수이다. 미분계수 $g'(4)$의 값은?",
    options: [o("1","$\\dfrac{\\sqrt{3}}{2}$"), o("2","$\\dfrac{\\sqrt{3}}{3}$"), o("3","$\\dfrac{\\sqrt{3}}{4}$"), o("4","$\\dfrac{\\sqrt{3}}{5}$"), o("5","$\\dfrac{\\sqrt{3}}{6}$")],
    answer: 5,
    explanation: "$f(a)=4$인 $a$ 찾기: $e^a+e^{-a}=4\\Rightarrow e^a=2+\\sqrt 3$. $g'(4)=\\dfrac{1}{f'(a)}=\\dfrac{1}{e^a-e^{-a}}$. $e^a-e^{-a}=\\dfrac{(e^a)^2-1}{e^a}=\\dfrac{(2+\\sqrt 3)^2-1}{2+\\sqrt 3}=\\dfrac{6+4\\sqrt 3}{2+\\sqrt 3}=2\\sqrt 3$. 따라서 $g'(4)=\\dfrac{1}{2\\sqrt 3}=\\dfrac{\\sqrt 3}{6}$."
  }),
  build({
    num: 27, subject: "적분학", unit: "극좌표와 응용", concept: "극방정식 원뿔곡선", difficulty: "medium",
    question: "극좌표 방정식 $r=\\dfrac{3}{1+2\\sin\\theta}$로 주어지는 쌍곡선의 두 점근선의 기울기가 각각 $m_1,\\,m_2$일 때 $|m_1 m_2|$의 절댓값은?",
    options: [o("1","$1$"), o("2","$\\dfrac{1}{2}$"), o("3","$\\dfrac{1}{3}$"), o("4","$\\dfrac{1}{4}$"), o("5","$\\dfrac{1}{5}$")],
    answer: 3,
    explanation: "$r=\\dfrac{ed}{1+e\\sin\\theta}$ 형, 이심률 $e=2$인 쌍곡선. 점근선의 방향은 $r\\to\\infty$, 즉 $1+2\\sin\\theta=0$인 $\\sin\\theta=-\\tfrac12$ → $\\theta=-\\tfrac{\\pi}{6}$ 또는 $\\tfrac{7\\pi}{6}$. 기울기 $m=\\tan\\theta$: $m_1=-\\tfrac{1}{\\sqrt 3}$, $m_2=\\tfrac{1}{\\sqrt 3}$. $|m_1 m_2|=\\dfrac{1}{3}$."
  }),
  build({
    num: 28, subject: "적분학", unit: "정적분과 무한급수", concept: "급수 수렴/발산 판정", difficulty: "medium",
    question: "다음 급수 중 수렴하는 것을 모두 고르면?\n\n(a) $\\displaystyle\\sum_{n=1}^{\\infty}\\!\\left(\\dfrac{n}{n+1}\\right)^{\\!n^2}$ \\quad (b) $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{\\cos(n\\pi)}{n+2}$ \\quad (c) $\\displaystyle\\sum_{n=1}^{\\infty} n\\sin^2\\!\\left(\\dfrac{1}{n}\\right)$",
    options: [o("1","(a)"), o("2","(b)"), o("3","(c)"), o("4","(a),(b)"), o("5","(a),(b),(c)")],
    answer: 4,
    explanation: "(a) $\\left(\\tfrac{n}{n+1}\\right)^{n^2}=\\left(1+\\tfrac{1}{n}\\right)^{-n^2}\\sim e^{-n}$이라 비 검사로 수렴. (b) $\\cos(n\\pi)=(-1)^n$, $\\dfrac{1}{n+2}$ 단조감소→0이라 교대급수 수렴. (c) $n\\sin^2(1/n)\\sim n\\cdot\\tfrac{1}{n^2}=\\tfrac{1}{n}$, 조화급수 비교로 발산. 수렴: (a),(b)."
  }),
  build({
    num: 29, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "멱급수 합 공식", difficulty: "medium",
    question: "급수 $\\displaystyle\\sum_{n=0}^{\\infty}(n+1)(n+2)\\!\\left(\\dfrac{1}{3}\\right)^{\\!n}$의 값은?",
    options: [o("1","$\\dfrac{25}{4}$"), o("2","$\\dfrac{27}{4}$"), o("3","$\\dfrac{29}{4}$"), o("4","$\\dfrac{31}{4}$"), o("5","$\\dfrac{33}{4}$")],
    answer: 2,
    explanation: "$\\dfrac{1}{(1-x)^3}=\\displaystyle\\sum_{n=0}^{\\infty}\\!\\binom{n+2}{2}x^n=\\sum\\dfrac{(n+1)(n+2)}{2}x^n$. 따라서 $\\sum(n+1)(n+2)x^n=\\dfrac{2}{(1-x)^3}$. $x=\\tfrac{1}{3}$: $\\dfrac{2}{(2/3)^3}=\\dfrac{2}{8/27}=\\dfrac{27}{4}$."
  }),
  build({
    num: 30, subject: "적분학", unit: "정적분과 무한급수", concept: "급수 수렴 명제 판정", difficulty: "mediumHard",
    question: "다음 설명 중 옳은 것을 모두 고르면?\n\n(a) 모든 항 $a_n$이 양수인 급수 $\\sum a_n$이 수렴하면 $\\sum\\sqrt{a_n}$도 수렴한다.\n(b) 급수 $\\sum a_n$과 $\\sum b_n$이 발산하면 $\\sum a_n b_n$도 발산한다.\n(c) 모든 항 $b_n$이 양수인 수열 $\\{b_n\\}$에 대하여 $\\displaystyle\\lim_{n\\to\\infty}b_n=\\dfrac{2}{3}$이면 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(b_n)^n\\cos(n\\pi)}{n+1}$가 절대수렴한다.",
    options: [o("1","(a)"), o("2","(b)"), o("3","(c)"), o("4","(a),(b)"), o("5","(a),(b),(c)")],
    answer: 3,
    explanation: "(a) 거짓. 반례 $a_n=\\tfrac{1}{n^2}$: $\\sum a_n$ 수렴이지만 $\\sum 1/n$ 발산. (b) 거짓. 반례 $a_n=b_n=\\tfrac{(-1)^n}{\\sqrt n}$: 둘 다 수렴(교대급수). 발산 조건 깨짐 — 제대로 된 반례 $a_n=1$, $b_n=-1$: 양쪽 발산이지만 $a_nb_n=-1$ 합도 발산만 아닌 본질은 비교 불가. 일반화 불가능. (c) $|b_n^n\\cos(n\\pi)/(n+1)|=\\dfrac{b_n^n}{n+1}$. $b_n\\to 2/3<1$이므로 큰 $n$에서 $b_n<0.7$, $b_n^n$이 지수적으로 0으로 감소. $\\sum b_n^n/(n+1)$ 수렴(비 검사). 절대수렴. 옳은 것: (c)."
  }),
  build({
    num: 31, subject: "다변수함수", unit: "추가내용", concept: "사면체 부피", difficulty: "medium",
    question: "좌표공간의 네 점 $(0,1,1)$, $(1,0,1)$, $(1,1,0)$, $(a,b,c)$를 꼭짓점으로 하는 사면체의 부피가 $1$일 때, $a+b+c$의 값은? (단, $a,b,c>0$)",
    options: [o("1","$6$"), o("2","$7$"), o("3","$8$"), o("4","$9$"), o("5","$10$")],
    answer: 3,
    explanation: "$(0,1,1)$ 기준 변벡터: $\\mathbf{u}=(1,-1,0)$, $\\mathbf{v}=(1,0,-1)$, $\\mathbf{w}=(a,b-1,c-1)$. 부피 $=\\tfrac{1}{6}|\\det[\\mathbf{u},\\mathbf{v},\\mathbf{w}]|$. 행렬식 전개하면 $a+b+c-2$. $|a+b+c-2|=6\\Rightarrow a+b+c=8$ (양수 조건)."
  }),
  build({
    num: 32, subject: "다변수함수", unit: "경도 및 방향도함수", concept: "방향도함수 합성", difficulty: "medium",
    question: "함수 $f(x,y)$는 미분가능한 함수이다. $(1,1)$에서 $f$의 방향도함수가 벡터 $\\mathbf{u}=\\mathbf{i}+2\\mathbf{j}$ 방향으로 $3$이고, 벡터 $\\mathbf{v}=2\\mathbf{i}+\\mathbf{j}$ 방향으로 $2$이다. $(1,1)$에서 벡터 $\\mathbf{w}=\\mathbf{i}+\\mathbf{j}$ 방향으로 $f$의 방향도함수는?",
    options: [o("1","$\\dfrac{1}{6}\\sqrt{10}$"), o("2","$\\dfrac{1}{3}\\sqrt{10}$"), o("3","$\\dfrac{1}{2}\\sqrt{10}$"), o("4","$\\dfrac{2}{3}\\sqrt{10}$"), o("5","$\\dfrac{5}{6}\\sqrt{10}$")],
    answer: 5,
    explanation: "$\\nabla f=(a,b)$라 두면 $\\dfrac{a+2b}{\\sqrt 5}=3$, $\\dfrac{2a+b}{\\sqrt 5}=2$ → $a+2b=3\\sqrt 5$, $2a+b=2\\sqrt 5$. 풀면 $a=\\tfrac{\\sqrt 5}{3}$, $b=\\tfrac{4\\sqrt 5}{3}$. $D_{\\mathbf{w}}f=\\dfrac{a+b}{\\sqrt 2}=\\dfrac{5\\sqrt 5/3}{\\sqrt 2}=\\dfrac{5\\sqrt{10}}{6}$."
  }),
  build({
    num: 33, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "안장점 판정(헤시안)", difficulty: "easyMedium",
    question: "다음 곡면 중 안장점(saddle point)을 가지는 것을 모두 고르면?\n\n(a) $z=2x^2+3y^2$ \\quad (b) $z=2x^2-3y^2$ \\quad (c) $z^2=2x^2+3y^2$ \\quad (d) $z=2xy$",
    options: [o("1","(a),(c)"), o("2","(b),(d)"), o("3","(c),(d)"), o("4","(a),(b),(c)"), o("5","(a),(b),(c),(d)")],
    answer: 2,
    explanation: "헤시안 판별식 $D=f_{xx}f_{yy}-f_{xy}^2$. (a): $D=24>0,\\,f_{xx}>0$ 극소. (b): $D=-24<0$ 안장점. (c): 원뿔(미분 불가능, 극값 정의 안됨). (d): $f_{xx}=f_{yy}=0,\\,f_{xy}=2,\\,D=-4<0$ 안장점. 안장점 보유: (b),(d)."
  }),
  build({
    num: 34, subject: "다변수함수", unit: "곡선과 곡면", concept: "음함수 접평면", difficulty: "easyMedium",
    question: "곡면 $x^2+4y^2-z^2=25$ 위의 점 $P(3,2,0)$에서의 접평면의 식은?",
    options: [o("1","$x+2y-z=7$"), o("2","$x+4y-z=11$"), o("3","$3x+2y-z=13$"), o("4","$3x+2y=13$"), o("5","$3x+8y=25$")],
    answer: 5,
    explanation: "$F(x,y,z)=x^2+4y^2-z^2-25$, $\\nabla F=(2x,8y,-2z)$. $P(3,2,0)$에서 $\\nabla F=(6,16,0)$. 접평면: $6(x-3)+16(y-2)+0(z-0)=0$ → $3x+8y=25$."
  }),
  build({
    num: 35, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "라그랑주 승수법", difficulty: "medium",
    question: "곡면 $y^2=xz+3x+3z+9$ 위의 점과 원점 $(0,0,0)$ 사이의 거리의 최솟값은?",
    options: [o("1","$\\sqrt{5}$"), o("2","$\\sqrt{6}$"), o("3","$\\sqrt{7}$"), o("4","$\\sqrt{8}$"), o("5","$3$")],
    answer: 2,
    explanation: "$y^2=(x+3)(z+3)$. 거리$^2=x^2+y^2+z^2$ 최소화 + 제약. 라그랑주: $2x+\\lambda(z+3)=0$, $2y(1-\\lambda)=0$, $2z+\\lambda(x+3)=0$. $\\lambda=1$에서 $x=z=-1$, $y^2=4$, 거리$^2=1+4+1=6$. 다른 분기는 더 큰 값. 최솟값 $\\sqrt 6$."
  }),
  build({
    num: 36, subject: "다변수함수", unit: "중적분", concept: "적분 순서 변경", difficulty: "medium",
    question: "$\\displaystyle\\int_0^8\\!\\!\\int_{y/2}^4 e^{x^2}\\,dx\\,dy$의 값은?",
    options: [o("1","$e^8-2$"), o("2","$e^8-1$"), o("3","$e^{16}-2$"), o("4","$e^{16}-1$"), o("5","$e^{32}-2$")],
    answer: 4,
    explanation: "영역 $\\{0\\le y\\le 8,\\,y/2\\le x\\le 4\\}=\\{0\\le x\\le 4,\\,0\\le y\\le 2x\\}$로 변경. $\\int_0^4\\!\\!\\int_0^{2x} e^{x^2}\\,dy\\,dx=\\int_0^4 2x\\,e^{x^2}dx=[e^{x^2}]_0^4=e^{16}-1$."
  }),
  build({
    num: 37, subject: "다변수함수", unit: "삼중적분과 극좌표계", concept: "원기둥/구좌표 변환", difficulty: "mediumHard",
    question: "$R=\\left\\{(x,y,z)\\,\\Big|\\,x\\ge 0,\\ x^2+\\!\\left(y-\\tfrac{1}{2}\\right)^{\\!2}\\le\\tfrac{1}{4},\\ 0\\le z\\le\\sqrt{1-x^2-y^2}\\right\\}$의 부피는?",
    options: [o("1","$\\dfrac{\\pi-3}{9}$"), o("2","$\\dfrac{\\pi-2}{9}$"), o("3","$\\dfrac{3\\pi-5}{18}$"), o("4","$\\dfrac{3\\pi-4}{18}$"), o("5","$\\dfrac{3\\pi-2}{18}$")],
    answer: 4,
    explanation: "원기둥좌표. $x^2+(y-\\tfrac12)^2\\le\\tfrac14\\Leftrightarrow x^2+y^2\\le y$, 극좌표 $r\\le\\sin\\theta$. $x\\ge 0$이라 $0\\le\\theta\\le\\tfrac{\\pi}{2}$. $V=\\int_0^{\\pi/2}\\!\\!\\int_0^{\\sin\\theta}\\sqrt{1-r^2}\\,r\\,dr\\,d\\theta$. 내적분 $=\\dfrac{1-\\cos^3\\theta}{3}$. 외적분 $=\\dfrac{1}{3}\\!\\left(\\dfrac{\\pi}{2}-\\dfrac{2}{3}\\right)=\\dfrac{3\\pi-4}{18}$."
  }),
  build({
    num: 38, subject: "다변수함수", unit: "중적분", concept: "변수 변환(자코비안)", difficulty: "medium",
    question: "$R=\\{(x,y)\\mid 1\\le xy\\le 4,\\ 0<x\\le y\\le 4x\\}$일 때, $\\displaystyle\\iint_R\\dfrac{y}{x}\\,dA$의 값은?",
    options: [o("1","$\\dfrac{9}{2}$"), o("2","$3$"), o("3","$\\dfrac{9}{4}$"), o("4","$\\dfrac{9}{5}$"), o("5","$\\dfrac{3}{2}$")],
    answer: 1,
    explanation: "$u=xy$, $v=y/x$ 치환. $\\dfrac{\\partial(u,v)}{\\partial(x,y)}=\\dfrac{2y}{x}=2v$, $dA=\\dfrac{du\\,dv}{2v}$. 영역 $1\\le u\\le 4,\\,1\\le v\\le 4$. $\\iint v\\cdot\\dfrac{1}{2v}du\\,dv=\\dfrac{1}{2}\\cdot 3\\cdot 3=\\dfrac{9}{2}$."
  }),
  build({
    num: 39, subject: "다변수함수", unit: "선적분과 면적분", concept: "보존벡터장 선적분", difficulty: "medium",
    question: "$C$는 $x=t,\\,y=t^2\\!\\left(0\\le t\\le\\dfrac{\\sqrt{\\pi}}{2}\\right)$로 주어진 곡선이다. 선적분 $\\displaystyle\\int_C 2\\sin y\\,dx+2x\\cos y\\,dy$의 값은?",
    options: [o("1","$\\dfrac{\\sqrt{2\\pi}}{4}$"), o("2","$\\dfrac{\\sqrt{2\\pi}}{3}$"), o("3","$\\dfrac{\\sqrt{2\\pi}}{2}$"), o("4","$\\sqrt{2\\pi}$"), o("5","$\\dfrac{3\\sqrt{2\\pi}}{2}$")],
    answer: 3,
    explanation: "$\\partial Q/\\partial x=2\\cos y=\\partial P/\\partial y$이므로 보존장. 포텐셜 $\\psi=2x\\sin y$. 시작점 $(0,0)$, 끝점 $(\\tfrac{\\sqrt\\pi}{2},\\tfrac{\\pi}{4})$. $\\psi(\\text{끝})-\\psi(\\text{시작})=2\\cdot\\tfrac{\\sqrt\\pi}{2}\\cdot\\sin\\tfrac{\\pi}{4}=\\sqrt\\pi\\cdot\\tfrac{\\sqrt 2}{2}=\\dfrac{\\sqrt{2\\pi}}{2}$."
  }),
  build({
    num: 40, subject: "다변수함수", unit: "선적분과 면적분", concept: "Green 정리", difficulty: "medium",
    question: "방정식 $4x^2+9y^2=36$으로 주어지는 곡선 $C$에 대하여 다음 선적분의 값은?\n\n$\\displaystyle\\int_C(3y+e^x\\sqrt{1+x^2})\\,dx+(8x-e^{y^2})\\,dy$",
    options: [o("1","$0$"), o("2","$18\\pi$"), o("3","$24\\pi$"), o("4","$30\\pi$"), o("5","$36\\pi$")],
    answer: 4,
    explanation: "Green 정리: $\\partial Q/\\partial x-\\partial P/\\partial y=8-3=5$. 타원 $\\dfrac{x^2}{9}+\\dfrac{y^2}{4}=1$ 면적 $=\\pi\\cdot 3\\cdot 2=6\\pi$. 적분 $=5\\cdot 6\\pi=30\\pi$."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) {
  console.error("Insert failed:", error);
  process.exit(1);
}
console.log("Inserted:");
for (const row of data ?? []) {
  console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
}
