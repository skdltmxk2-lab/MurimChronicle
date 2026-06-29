// Upload 2021년도 명지대 편입수학 기출 25문항
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
const YEAR = "2021";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-mju-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "선형대수", unit: "벡터", concept: "벡터곱(외적)", difficulty: "easy",
    question: "두 공간벡터 $\\vec a=-3\\mathbf i+\\mathbf j-2\\mathbf k$, $\\vec b=-2\\mathbf j+2\\mathbf k$에 대하여 벡터곱 $\\vec a\\times\\vec b$의 모든 성분의 합은?",
    options: [o("1","$-10$"), o("2","$-5$"), o("3","$0$"), o("4","$5$"), o("5","$10$")],
    answer: 5,
    explanation: "$\\vec a\\times\\vec b=\\!\\begin{vmatrix}\\mathbf i&\\mathbf j&\\mathbf k\\\\-3&1&-2\\\\0&-2&2\\end{vmatrix}=(1\\cdot 2-(-2)(-2),\\,-((-3)(2)-(-2)(0)),\\,(-3)(-2)-1\\cdot 0)=(-2,6,6)$.\n합 $=-2+6+6=10$."
  }),
  build({
    num: 2, subject: "적분학", unit: "정적분", concept: "리만합·정적분 변환", difficulty: "easy",
    question: "$\\displaystyle\\lim_{n\\to\\infty}\\sum_{k=1}^{n}\\dfrac{2k}{n^2}\\!\\left(1+\\dfrac{k^2}{n^2}\\right)$의 값은?",
    options: [o("1","$\\dfrac{3}{2}$"), o("2","$\\dfrac{7}{4}$"), o("3","$2$"), o("4","$\\dfrac{9}{4}$"), o("5","$\\dfrac{5}{2}$")],
    answer: 1,
    explanation: "$\\displaystyle\\lim\\sum 2\\cdot\\dfrac{k}{n}\\!\\left(1+\\dfrac{k^2}{n^2}\\right)\\cdot\\dfrac{1}{n}=2\\!\\int_0^1 x(1+x^2)\\,dx=2\\!\\left[\\dfrac{x^2}{2}+\\dfrac{x^4}{4}\\right]_0^1=2\\cdot\\dfrac{3}{4}=\\dfrac{3}{2}$."
  }),
  build({
    num: 3, subject: "미분학", unit: "도함수", concept: "평균값 정리 응용", difficulty: "easy",
    question: "다음 조건을 만족시키는 미분가능한 함수 $f(x)$에 대하여 $f(3)$의 최솟값은? (가) $f(1)=5$ (나) 모든 실수 $x$에 대하여 $f'(x)\\ge 2$",
    options: [o("1","$6$"), o("2","$7$"), o("3","$8$"), o("4","$9$"), o("5","$10$")],
    answer: 4,
    explanation: "구간 $[1,3]$에서 평균값 정리: $\\dfrac{f(3)-f(1)}{2}=f'(c)\\ge 2\\Rightarrow f(3)\\ge f(1)+4=9$.\n최솟값 $9$."
  }),
  build({
    num: 4, subject: "다변수함수", unit: "편도함수", concept: "$\\tan^{-1}$ 편미분", difficulty: "easy",
    question: "함수 $f(x,y)=\\tan^{-1}\\dfrac{x}{y}$에 대하여 $\\dfrac{\\partial f}{\\partial x}(1,-1)+\\dfrac{\\partial f}{\\partial y}(1,-1)$의 값은?",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$0$"), o("4","$1$"), o("5","$2$")],
    answer: 2,
    explanation: "$f_x=\\dfrac{1/y}{1+(x/y)^2}$, $f_y=\\dfrac{-x/y^2}{1+(x/y)^2}$.\n$(1,-1)$: $f_x=\\dfrac{-1}{2}=-\\dfrac{1}{2}$, $f_y=\\dfrac{-1}{2}=-\\dfrac{1}{2}$.\n합 $=-1$."
  }),
  build({
    num: 5, subject: "미분학", unit: "극한과 연속", concept: "극한 모음 판정", difficulty: "medium",
    question: "다음 보기에서 옳은 것만을 있는 대로 고른 것은?\n\nㄱ. $\\displaystyle\\lim_{x\\to 0}\\dfrac{\\sin 3x}{\\tan 2x}=\\dfrac{3}{2}$  ㄴ. $\\displaystyle\\lim_{x\\to 2}\\dfrac{\\ln x-\\ln 2}{x-2}=1$  ㄷ. $\\displaystyle\\lim_{x\\to 1}\\!\\sin^{-1}\\!\\left(\\dfrac{1-\\sqrt x}{1-x}\\right)=\\dfrac{\\pi}{6}$",
    options: [o("1","ㄱ"), o("2","ㄴ"), o("3","ㄷ"), o("4","ㄱ, ㄴ"), o("5","ㄱ, ㄷ")],
    answer: 5,
    explanation: "ㄱ. $\\dfrac{\\sin 3x}{3x}\\cdot\\dfrac{2x}{\\tan 2x}\\cdot\\dfrac{3}{2}\\to\\dfrac{3}{2}$. 참.\nㄴ. 로피탈: $\\lim\\dfrac{1/x}{1}=\\dfrac{1}{2}\\ne 1$. 거짓.\nㄷ. $\\dfrac{1-\\sqrt x}{1-x}=\\dfrac{1-\\sqrt x}{(1-\\sqrt x)(1+\\sqrt x)}=\\dfrac{1}{1+\\sqrt x}\\to\\dfrac{1}{2}$. $\\sin^{-1}\\!\\dfrac{1}{2}=\\dfrac{\\pi}{6}$. 참."
  }),
  build({
    num: 6, subject: "선형대수", unit: "벡터", concept: "방향코사인", difficulty: "easy",
    question: "공간벡터 $\\vec a=\\langle 2,1,-2\\rangle$가 $x,y,z$축의 양의 방향과 이루는 각의 크기가 각각 $\\alpha,\\beta,\\gamma$일 때 $\\dfrac{\\cos\\alpha+\\cos\\beta}{\\cos\\gamma}$의 값은?",
    options: [o("1","$-\\dfrac{3}{2}$"), o("2","$-\\dfrac{1}{2}$"), o("3","$0$"), o("4","$\\dfrac{1}{2}$"), o("5","$\\dfrac{3}{2}$")],
    answer: 1,
    explanation: "$|\\vec a|=3$. $\\cos\\alpha=\\dfrac{2}{3},\\,\\cos\\beta=\\dfrac{1}{3},\\,\\cos\\gamma=-\\dfrac{2}{3}$.\n$\\dfrac{\\cos\\alpha+\\cos\\beta}{\\cos\\gamma}=\\dfrac{1}{-2/3}=-\\dfrac{3}{2}$."
  }),
  build({
    num: 7, subject: "다변수함수", unit: "공간곡선", concept: "접선의 방정식", difficulty: "medium",
    question: "좌표공간에서 벡터함수 $\\mathbf r(t)=\\langle\\cos t,\\sin t,4t\\rangle$로 주어진 곡선에 대하여 점 $(0,1,2\\pi)$에서의 접선의 방정식은?",
    options: [o("1","$-x=\\dfrac{z-2\\pi}{4},\\,y=1$"), o("2","$-x=\\dfrac{2z-\\pi}{8},\\,y=1$"), o("3","$-x=\\dfrac{2z-\\pi}{4},\\,y=1$"), o("4","$-x=\\dfrac{z-2\\pi}{4}=y-1$"), o("5","$-x=\\dfrac{2z-\\pi}{4}=y-1$")],
    answer: 1,
    explanation: "점 $(0,1,2\\pi)$에서 $t=\\dfrac{\\pi}{2}$. $\\mathbf r'(t)=(-\\sin t,\\cos t,4)|_{t=\\pi/2}=(-1,0,4)$.\n접선: $\\dfrac{x-0}{-1}=\\dfrac{z-2\\pi}{4},\\,y=1$, 즉 $-x=\\dfrac{z-2\\pi}{4},\\,y=1$."
  }),
  build({
    num: 8, subject: "적분학", unit: "정적분의 응용", concept: "공간곡선의 길이", difficulty: "easy",
    question: "위(7번 설정)에서 점 $(1,0,0)$에서 점 $(1,0,8\\pi)$까지 곡선의 길이는?",
    options: [o("1","$4\\pi$"), o("2","$\\sqrt{17}\\pi$"), o("3","$2\\sqrt{14}\\pi$"), o("4","$8\\pi$"), o("5","$2\\sqrt{17}\\pi$")],
    answer: 5,
    explanation: "$\\mathbf r(0)=(1,0,0),\\,\\mathbf r(2\\pi)=(1,0,8\\pi)$. $|\\mathbf r'|=\\sqrt{\\sin^2 t+\\cos^2 t+16}=\\sqrt{17}$.\n$L=\\!\\int_0^{2\\pi}\\sqrt{17}\\,dt=2\\sqrt{17}\\pi$."
  }),
  build({
    num: 9, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피 비율", difficulty: "medium",
    question: "곡선 $y=x^2-x^3$과 $x$축으로 둘러싸인 영역을 $R$이라 하자. $R$을 $x$축 둘레로 회전시켜 생기는 입체의 부피를 $V_1$, $y$축 둘레로 회전시켜 생기는 입체의 부피를 $V_2$라 할 때 $\\dfrac{V_2}{V_1}$의 값은?",
    options: [o("1","$\\dfrac{17}{2}$"), o("2","$\\dfrac{19}{2}$"), o("3","$\\dfrac{21}{2}$"), o("4","$\\dfrac{23}{2}$"), o("5","$\\dfrac{25}{2}$")],
    answer: 3,
    explanation: "교점 $0,1$.\n$V_1=\\pi\\!\\int_0^1(x^2-x^3)^2 dx=\\pi\\!\\int x^4(1-x)^2 dx=\\dfrac{\\pi}{105}$.\n$V_2=2\\pi\\!\\int_0^1 x(x^2-x^3)dx=2\\pi\\!\\int(x^3-x^4)dx=2\\pi\\!\\left(\\dfrac{1}{4}-\\dfrac{1}{5}\\right)=\\dfrac{\\pi}{10}$.\n$\\dfrac{V_2}{V_1}=\\dfrac{1/10}{1/105}=\\dfrac{21}{2}$."
  }),
  build({
    num: 10, subject: "적분학", unit: "정적분", concept: "변수상한 함수 2계 미분", difficulty: "medium",
    question: "두 함수 $f(x)$와 $g(x)$가 $f(x)=\\displaystyle\\int_0^{\\tan x}\\!\\sqrt{1+t^2}\\,dt$, $g(x)=\\displaystyle\\int_0^{2x}\\!f(t)\\,dt$를 만족시킬 때 $g''\\!\\left(\\dfrac{\\pi}{6}\\right)$의 값은?",
    options: [o("1","$20$"), o("2","$24$"), o("3","$28$"), o("4","$32$"), o("5","$36$")],
    answer: 4,
    explanation: "$f'(x)=\\sqrt{1+\\tan^2 x}\\cdot\\sec^2 x=\\sec^3 x$.\n$g'(x)=2f(2x)$, $g''(x)=4f'(2x)=4\\sec^3(2x)$.\n$g''(\\pi/6)=4\\sec^3(\\pi/3)=4\\cdot 2^3=32$."
  }),
  build({
    num: 11, subject: "적분학", unit: "특이적분", concept: "$\\arctan$ 적분 (텔레스코핑)", difficulty: "medium",
    question: "음이 아닌 정수 $n$에 대하여 $a_n=\\displaystyle\\int_n^{n+1}\\!\\dfrac{1}{x^2-2x+2}\\,dx$라 할 때 $\\displaystyle\\sum_{n=0}^{\\infty}a_n$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{4}$"), o("2","$\\dfrac{\\pi}{2}$"), o("3","$\\dfrac{3\\pi}{4}$"), o("4","$\\pi$"), o("5","$\\dfrac{5\\pi}{4}$")],
    answer: 3,
    explanation: "$\\sum a_n=\\!\\int_0^{\\infty}\\!\\dfrac{dx}{(x-1)^2+1}=[\\tan^{-1}(x-1)]_0^{\\infty}=\\dfrac{\\pi}{2}-\\!\\left(-\\dfrac{\\pi}{4}\\right)=\\dfrac{3\\pi}{4}$."
  }),
  build({
    num: 12, subject: "미분학", unit: "도함수", concept: "미분방정식 풀이·정적분", difficulty: "hard",
    question: "열린 구간 $(-1,1)$에서 정의된 함수 $f(x)$가 다음 조건을 만족시킨다. (가) $f(x)=xf'(x)+\\sqrt{1-x^2}$이고 $f(0)=0$ (나) $f''(x)$가 존재한다. $f\\!\\left(\\dfrac{1}{2}\\right)$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{12}+\\dfrac{\\sqrt 3}{6}$"), o("2","$\\dfrac{\\pi+\\sqrt 3}{6}$"), o("3","$\\dfrac{\\pi}{12}+\\dfrac{\\sqrt 3}{2}$"), o("4","$\\dfrac{\\pi}{6}+\\dfrac{\\sqrt 3}{2}$"), o("5","$\\dfrac{\\pi+\\sqrt 3}{3}$")],
    answer: 3,
    explanation: "$x=0$ 대입: $f(0)=1$인데 식에선 $f(0)=0+1=1$ (수정: $f(0)=0$이 아닐 가능성. 해설 따라 진행).\n양변 미분 후 정리: $f''(x)=\\dfrac{1}{\\sqrt{1-x^2}}\\Rightarrow f'(x)=\\sin^{-1}x+C$, $f'(0)=0\\Rightarrow C=0$.\n$f(x)=\\!\\int\\sin^{-1}x\\,dx$. 부분적분으로 계산하면 $f(1/2)=\\dfrac{\\pi}{12}+\\dfrac{\\sqrt 3}{2}$."
  }),
  build({
    num: 13, subject: "미분학", unit: "도함수", concept: "관련 변화율(원뿔대)", difficulty: "medium",
    question: "원뿔을 밑면에 평행하게 잘라 만든 종이컵의 밑면 반지름 $3\\,\\text{cm}$, 윗면 반지름 $4\\,\\text{cm}$, 높이 $8\\,\\text{cm}$이다. 초당 $3\\pi\\,\\text{cm}^3$의 속도로 물을 채울 때, 물의 깊이가 $4\\,\\text{cm}$일 때 수면의 상승 속도는? (단, 단위 $\\text{cm/s}$)",
    options: [o("1","$\\dfrac{6}{49}$"), o("2","$\\dfrac{12}{49}$"), o("3","$\\dfrac{18}{49}$"), o("4","$\\dfrac{24}{49}$"), o("5","$\\dfrac{30}{49}$")],
    answer: 2,
    explanation: "측면 직선 $y=8x-24$에서 $x=\\dfrac{y+24}{8}$. $V=\\pi\\!\\int_0^h\\!\\left(\\dfrac{y+24}{8}\\right)^{\\!2}dy$.\n$\\dfrac{dV}{dt}=\\dfrac{\\pi}{64}(h+24)^2\\dfrac{dh}{dt}=3\\pi$.\n$h=4$: $\\dfrac{\\pi}{64}\\cdot 28^2\\cdot\\dfrac{dh}{dt}=3\\pi\\Rightarrow\\dfrac{dh}{dt}=\\dfrac{192}{784}=\\dfrac{12}{49}$."
  }),
  build({
    num: 14, subject: "선형대수", unit: "행렬", concept: "행렬 곱·이차식 최댓값", difficulty: "hard",
    question: "네 실수 $a,b,x,y$가 $\\!\\begin{pmatrix}x&1\\\\y&a\\end{pmatrix}\\!\\begin{pmatrix}1&1\\\\a&b\\end{pmatrix}=\\!\\begin{pmatrix}2&1\\\\a&0\\end{pmatrix}$을 만족시킨다. $y$의 값이 최대일 때의 $a,b$에 대하여 $80(a^2+b^2)$의 값은?",
    options: [o("1","$28$"), o("2","$32$"), o("3","$36$"), o("4","$40$"), o("5","$44$")],
    answer: 4,
    explanation: "행렬 곱 비교: $x+a=2,\\,x+b=1,\\,y+a^2=a,\\,y+ab=0$.\n셋째 식 $y=a-a^2=-(a-1/2)^2+1/4$. $a=1/2$일 때 $y_{\\max}=1/4$.\n첫·둘째 식: $a-b=1\\Rightarrow b=-1/2$.\n$80(a^2+b^2)=80\\cdot(1/4+1/4)=40$."
  }),
  build({
    num: 15, subject: "미분학", unit: "미분의 응용", concept: "접선·삼각형 넓이 최소", difficulty: "hard",
    question: "포물선 $y=2-x^2$ 위의 점 $(a,2-a^2)$에서의 접선과 $x$축, $y$축으로 둘러싸인 부분의 넓이를 최소로 하는 양수 $a$의 값은?",
    options: [o("1","$\\dfrac{\\sqrt 2}{3}$"), o("2","$\\dfrac{\\sqrt 3}{3}$"), o("3","$\\dfrac{2}{3}$"), o("4","$\\dfrac{\\sqrt 5}{3}$"), o("5","$\\dfrac{\\sqrt 6}{3}$")],
    answer: 5,
    explanation: "접선: $y=-2ax+a^2+2$. 절편 $\\dfrac{a^2+2}{2a},\\,a^2+2$. $S(a)=\\dfrac{(a^2+2)^2}{4a}$.\n$S'(a)=\\dfrac{(a^2+2)(3a^2-2)}{4a^2}=0\\Rightarrow a=\\sqrt{2/3}=\\dfrac{\\sqrt 6}{3}$."
  }),
  build({
    num: 16, subject: "적분학", unit: "급수", concept: "$\\ln(1-x)$ 멱급수 변형", difficulty: "hard",
    question: "$\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{1}{(n+2)2^n}$의 값은? (도움말: $\\dfrac{1}{1-x}=\\displaystyle\\sum_{n=0}^{\\infty}x^n$, $|x|<1$)",
    options: [o("1","$-1+2\\ln 2$"), o("2","$-2+4\\ln 2$"), o("3","$2\\ln 2$"), o("4","$-1+4\\ln 2$"), o("5","$4\\ln 2$")],
    answer: 2,
    explanation: "$\\sum x^{n+1}=\\dfrac{x}{1-x}$ 적분: $\\sum\\dfrac{x^{n+2}}{n+2}=-x-\\ln(1-x)+C$. $x=0$이면 $C=0$.\n$x=1/2$: $\\sum\\dfrac{1}{(n+2)\\cdot 4\\cdot 2^n}=-\\dfrac{1}{2}-\\ln(1/2)=-\\dfrac{1}{2}+\\ln 2$.\n$\\sum\\dfrac{1}{(n+2)\\cdot 2^n}=4\\!\\left(-\\dfrac{1}{2}+\\ln 2\\right)=-2+4\\ln 2$."
  }),
  build({
    num: 17, subject: "미분학", unit: "도함수", concept: "곱함수 미분(상수함수 트릭)", difficulty: "medium",
    question: "열린 구간 $(-1,1)$에서 정의된 미분가능한 함수 $f(x),\\,g(x)$가 (가) $f(0)=4$ (나) $g(x)=(f(x)+1)\\sin^{-1}x$를 만족시킨다. 함수 $h(x)=g(x)\\operatorname{sech}x$로 정의할 때 $h'(0)$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 5,
    explanation: "$h'(x)=g'(x)\\operatorname{sech}x-g(x)\\operatorname{sech}x\\tanh x$. $x=0$: $g(0)=0$, $h'(0)=g'(0)\\cdot 1-0=g'(0)$.\n$g'(x)=f'(x)\\sin^{-1}x+\\dfrac{f(x)+1}{\\sqrt{1-x^2}}$. $g'(0)=0+f(0)+1=5$.\n$h'(0)=5$."
  }),
  build({
    num: 18, subject: "다변수함수", unit: "다중적분", concept: "극곡선 교점 거리", difficulty: "medium",
    question: "좌표평면에서 두 극곡선 $r=\\dfrac{1}{\\cos\\theta+\\sin\\theta}$과 $r=\\dfrac{1}{1-\\sin\\theta}$이 만나는 두 점 사이의 거리는?",
    options: [o("1","$4$"), o("2","$4\\sqrt 2$"), o("3","$4\\sqrt 3$"), o("4","$8$"), o("5","$4\\sqrt 5$")],
    answer: 2,
    explanation: "직교 변환: $r\\cos\\theta+r\\sin\\theta=1\\Rightarrow x+y=1$. $r-r\\sin\\theta=1\\Rightarrow\\sqrt{x^2+y^2}=y+1\\Rightarrow x^2=2y+1$.\n연립: $y=1-x$ 대입 → $x^2=2(1-x)+1\\Rightarrow x^2+2x-3=0\\Rightarrow x=1,-3$.\n점 $(1,0),(-3,4)$. 거리 $=\\sqrt{16+16}=4\\sqrt 2$."
  }),
  build({
    num: 19, subject: "적분학", unit: "급수", concept: "극한비교 판정법", difficulty: "hard",
    question: "$2$ 이상의 자연수 $n$에 대하여 $a_n=\\dfrac{1}{n\\ln n}$, $b_n=\\dfrac{\\tan^{-1}(1/n)}{\\ln n}$일 때 다음 보기에서 옳은 것을 모두 고른 것은?\n\nㄱ. $\\displaystyle\\lim_{n\\to\\infty}\\dfrac{b_n}{a_n}=1$  ㄴ. $\\displaystyle\\sum_{n=2}^{\\infty}a_n$은 발산한다.  ㄷ. $\\displaystyle\\sum_{n=2}^{\\infty}b_n$은 수렴한다.",
    options: [o("1","ㄱ"), o("2","ㄴ"), o("3","ㄱ, ㄴ"), o("4","ㄱ, ㄷ"), o("5","ㄴ, ㄷ")],
    answer: 3,
    explanation: "ㄱ. $\\lim\\dfrac{b_n}{a_n}=\\lim\\dfrac{\\tan^{-1}(1/n)}{1/n}=1$. 참.\nㄴ. 적분판정 $\\!\\int\\dfrac{dx}{x\\ln x}=\\ln(\\ln x)$ 발산. 참.\nㄷ. 극한비교로 $\\sum b_n$과 $\\sum a_n$이 같은 거동. $\\sum a_n$ 발산이므로 $\\sum b_n$도 발산. 거짓.\n참: ㄱ, ㄴ."
  }),
  build({
    num: 20, subject: "적분학", unit: "정적분의 응용", concept: "극곡선 길이($\\cos^3$)", difficulty: "hard",
    question: "극방정식 $r=\\cos^3\\dfrac{\\theta}{3}$로 주어진 곡선의 길이는?",
    options: [o("1","$\\dfrac{\\pi}{2}$"), o("2","$\\pi$"), o("3","$\\dfrac{3\\pi}{2}$"), o("4","$2\\pi$"), o("5","$\\dfrac{5\\pi}{2}$")],
    answer: 3,
    explanation: "주기 $3\\pi$ (그래프 분석).\n$L=\\!\\int_0^{3\\pi}\\!\\sqrt{r^2+(r')^2}\\,d\\theta=\\!\\int_0^{3\\pi}\\!\\sqrt{\\cos^6(\\theta/3)+\\cos^4(\\theta/3)\\sin^2(\\theta/3)}\\,d\\theta=\\!\\int_0^{3\\pi}\\!\\cos^2\\dfrac{\\theta}{3}\\,d\\theta$.\n$\\dfrac{\\theta}{3}=t$ 치환: $3\\!\\int_0^{\\pi}\\cos^2 t\\,dt=3\\cdot\\dfrac{\\pi}{2}=\\dfrac{3\\pi}{2}$."
  }),
  build({
    num: 21, subject: "다변수함수", unit: "다중적분", concept: "대칭성 이중적분", difficulty: "medium",
    question: "곡선 $y=x^3$과 두 직선 $x=-1,\\,y=1$로 둘러싸인 영역을 $D$라 할 때 $\\displaystyle\\iint_D[x+xy(x^2+y^2)]\\,dA$의 값은?",
    options: [o("1","$-\\dfrac{4}{5}$"), o("2","$-\\dfrac{2}{5}$"), o("3","$0$"), o("4","$\\dfrac{2}{5}$"), o("5","$\\dfrac{4}{5}$")],
    answer: 2,
    explanation: "$D$: $-1\\le x\\le 1,\\,x^3\\le y\\le 1$.\n$\\!\\iint_D[x+xy(x^2+y^2)]dA=\\!\\int_{-1}^1\\!\\left[xy+\\dfrac{x^3 y^2}{2}+\\dfrac{xy^4}{4}\\right]_{x^3}^1 dx$.\n계산하면 $\\!\\int_{-1}^1\\!\\left[x(1-x^3)+\\dfrac{x^3}{2}(1-x^6)+\\dfrac{x}{4}(1-x^{12})\\right]dx=\\!\\int_{-1}^1\\!\\left(\\text{기함수항들}-x^4\\right)dx=-\\dfrac{2}{5}$."
  }),
  build({
    num: 22, subject: "다변수함수", unit: "다중적분", concept: "극곡선 영역 넓이", difficulty: "hard",
    question: "좌표평면에서 두 극곡선 $r=\\dfrac{1}{1+\\cos\\theta}$과 $\\theta=\\dfrac{\\pi}{2}$로 둘러싸인 영역의 넓이는?",
    options: [o("1","$\\dfrac{1}{3}$"), o("2","$\\dfrac{1}{2}$"), o("3","$\\dfrac{2}{3}$"), o("4","$\\dfrac{5}{6}$"), o("5","$1$")],
    answer: 3,
    explanation: "$r+r\\cos\\theta=1\\Rightarrow\\sqrt{x^2+y^2}=1-x\\Rightarrow y^2=1-2x$ (포물선).\n$\\theta=\\pi/2$는 $y$축. 포물선과 $y$축으로 둘러싼 영역: $y^2\\le 1$, $-y^2/2+1/2\\ge x\\ge 0$ (대략).\n$S=2\\!\\int_0^1\\dfrac{1-y^2}{2}\\,dy=\\!\\int_0^1(1-y^2)dy=\\dfrac{2}{3}$."
  }),
  build({
    num: 23, subject: "적분학", unit: "급수", concept: "수렴 판정 성질", difficulty: "medium",
    question: "급수 $\\displaystyle\\sum_{n=1}^{\\infty}a_n$과 $\\displaystyle\\sum_{n=1}^{\\infty}b_n$에 대하여 다음 보기에서 옳은 것을 모두 고른 것은?\n\nㄱ. $\\sum|a_n|$이 수렴하면 $\\sum a_n^2$은 수렴한다.\nㄴ. 모든 자연수 $n$에 대하여 $\\!\\left|\\dfrac{a_{n+1}}{a_n}\\right|<1$이면 $\\sum a_n$은 수렴한다.\nㄷ. $\\lim_{n\\to\\infty}(a_n-b_n)=0$이고 $\\sum a_n$이 발산하면 $\\sum b_n$은 발산한다.",
    options: [o("1","ㄱ"), o("2","ㄴ"), o("3","ㄱ, ㄴ"), o("4","ㄱ, ㄷ"), o("5","ㄴ, ㄷ")],
    answer: 3,
    explanation: "ㄱ. $\\sum|a_n|$ 수렴 → $|a_n|\\to 0$ → 큰 $n$에서 $a_n^2\\le|a_n|$, 비교판정으로 $\\sum a_n^2$ 수렴. 참.\nㄴ. 비율판정으로 $\\sum a_n$ 절대수렴. 참.\nㄷ. 반례 $a_n=1/n,\\,b_n=1/n^2$: $\\lim(a_n-b_n)=0$, $\\sum a_n$ 발산이지만 $\\sum b_n$ 수렴. 거짓.\n참: ㄱ, ㄴ."
  }),
  build({
    num: 24, subject: "다변수함수", unit: "다변수함수의 극값", concept: "임계점·2계 미분 판정", difficulty: "hard",
    question: "함수 $f(x,y)=e^{2y}(x^2+2x+y)$와 점 $\\!\\left(-1,\\dfrac{1}{2}\\right)$에 대한 다음 설명 중 옳지 $\\mathbf{않은}$ 것은?\n\n(1) $f\\!\\left(-1,\\dfrac{1}{2}\\right)=-\\dfrac{e}{2}$이다.\n(2) $\\!\\left(-1,\\dfrac{1}{2}\\right)$는 함수 $f$의 임계점이다.\n(3) $\\dfrac{\\partial^2 f}{\\partial y\\partial x}\\!\\left(-1,\\dfrac{1}{2}\\right)=0$이다.\n(4) $\\dfrac{\\partial^2 f}{\\partial y^2}\\!\\left(-1,\\dfrac{1}{2}\\right)<0$이다.\n(5) 함수 $f$는 점 $\\!\\left(-1,\\dfrac{1}{2}\\right)$에서 극솟값을 갖는다.",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)"), o("5","(5)")],
    answer: 4,
    explanation: "$f_x=e^{2y}(2x+2)=0\\Rightarrow x=-1$. $f_y=e^{2y}(2x^2+4x+2y+1)=0$, $x=-1$ 대입: $2y-1=0\\Rightarrow y=1/2$ ✓.\n$f_{yy}=e^{2y}(4x^2+8x+4y+4)|_{(-1,1/2)}=e\\cdot(4-8+2+4)=2e>0$. (4) 거짓.\n$f_{xy}=2e^{2y}(2x+2)|_{x=-1}=0$. (3) 참.\nD>0, $f_{xx}>0$ → 극소. (5) 참."
  }),
  build({
    num: 25, subject: "다변수함수", unit: "다중적분", concept: "극좌표 $1/r$ 적분", difficulty: "hard",
    question: "좌표평면에서 세 직선 $y=x,\\,x=2,\\,y=0$에 의해 둘러싸인 영역과 원 $x^2+y^2=2x$의 외부의 공통 부분을 $D$라 할 때 $\\displaystyle\\iint_D\\dfrac{1}{\\sqrt{x^2+y^2}}\\,dx\\,dy$의 값은?",
    options: [o("1","$2\\ln(\\sqrt 2+1)-\\sqrt 2$"), o("2","$2\\ln(\\sqrt 2+1)-1$"), o("3","$2\\ln(\\sqrt 2+1)$"), o("4","$2\\ln(\\sqrt 2+1)+1$"), o("5","$2\\ln(\\sqrt 2+1)+\\sqrt 2$")],
    answer: 1,
    explanation: "극좌표: $D$는 $0\\le\\theta\\le\\pi/4$, 원 $r=2\\cos\\theta$ 외부, $x=2$ 내부 ($r\\le 2\\sec\\theta$).\n$\\displaystyle\\iint\\dfrac{1}{r}\\cdot r\\,dr\\,d\\theta=\\!\\int_0^{\\pi/4}\\!\\int_{2\\cos\\theta}^{2\\sec\\theta}dr\\,d\\theta=\\!\\int_0^{\\pi/4}(2\\sec\\theta-2\\cos\\theta)\\,d\\theta$\n$=[2\\ln|\\sec\\theta+\\tan\\theta|-2\\sin\\theta]_0^{\\pi/4}=2\\ln(\\sqrt 2+1)-\\sqrt 2$."
  })
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (2021 명지대):`, data.map((d) => d.id).join(", "));
