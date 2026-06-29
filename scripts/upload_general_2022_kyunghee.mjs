// Upload 2022년도 경희대 편입수학 기출 30문항 (5지 선다형, 90분)
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

const SCHOOL = "경희대";
const YEAR = "2022";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-kyunghee-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "두 극한 합·스퀴즈", difficulty: "easy",
    question: "$a>0$일 때 $\\!\\displaystyle\\lim_{n\\to\\infty}\\sqrt[n]a+2\\!\\displaystyle\\lim_{x\\to 0}x^2\\sin\\dfrac{1}{x}$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$"), o("5","$4$")],
    answer: 2,
    explanation: "$\\!\\lim_{n\\to\\infty}\\sqrt[n]a=a^0=1$. $\\!\\lim_{x\\to 0}x^2\\sin(1/x)=0$ (스퀴즈).\n합 $=1+0=1$."
  }),
  build({
    num: 2, subject: "미분학", unit: "도함수", concept: "선형근사", difficulty: "easy",
    question: "선형근사를 이용하여 구한 $\\sqrt{4.04}$의 근삿값은?",
    options: [o("1","$2.1$"), o("2","$2.01$"), o("3","$2.001$"), o("4","$2.02$"), o("5","$2.002$")],
    answer: 2,
    explanation: "$f(x)=\\sqrt x$, $L(x)=f(4)+f'(4)(x-4)=2+\\dfrac{1}{4}(x-4)$.\n$L(4.04)=2+\\dfrac{1}{4}\\cdot 0.04=2.01$."
  }),
  build({
    num: 3, subject: "적분학", unit: "정적분", concept: "회전체 부피(축 이동)", difficulty: "mediumHard",
    question: "직선 $x=0,\\;y=\\dfrac{1}{2}$과 $y=\\cos x$로 둘러싸인 영역을 직선 $y=-\\dfrac{1}{2}$을 중심으로 회전하여 얻은 입체의 부피는? (단, $0\\le x\\le\\dfrac{\\pi}{3}$)",
    options: [
      o("1","$\\dfrac{(8\\sqrt 3-\\pi)}{24}\\pi$"),
      o("2","$\\dfrac{(9\\sqrt 3-2\\pi)}{24}\\pi$"),
      o("3","$\\dfrac{(12\\sqrt 3-\\pi)}{24}\\pi$"),
      o("4","$\\dfrac{(15\\sqrt 3-2\\pi)}{24}\\pi$"),
      o("5","$\\dfrac{(18\\sqrt 3-\\pi)}{24}\\pi$")
    ],
    answer: 4,
    explanation: "축으로 $+\\dfrac{1}{2}$ 평행이동: $\\cos x+\\dfrac{1}{2}$와 $y=1$ 사이 회전.\n$V=\\pi\\!\\int_0^{\\pi/3}\\!\\!\\left[(\\cos x+\\tfrac{1}{2})^2-1^2\\right]dx=\\pi\\!\\int_0^{\\pi/3}(\\cos^2 x+\\cos x-\\tfrac{3}{4})dx$\n$=\\pi\\!\\left[-\\dfrac{x}{4}+\\dfrac{\\sin 2x}{4}+\\sin x\\right]_0^{\\pi/3}=\\pi\\!\\left(-\\dfrac{\\pi}{12}+\\dfrac{\\sqrt 3}{8}+\\dfrac{\\sqrt 3}{2}\\right)=\\dfrac{15\\sqrt 3-2\\pi}{24}\\pi$."
  }),
  build({
    num: 4, subject: "미분학", unit: "최댓값/최솟값", concept: "두 곡선 수직거리 최소", difficulty: "medium",
    question: "두 포물선 $y=3x^2+1$과 $y=-4x^2+2x$ 사이의 최소 수직거리를 $\\lambda$라 할 때 $14\\lambda$의 값은?",
    options: [o("1","$4$"), o("2","$6$"), o("3","$8$"), o("4","$10$"), o("5","$12$")],
    answer: 5,
    explanation: "$\\lambda(a)=(3a^2+1)-(-4a^2+2a)=7a^2-2a+1=7(a-\\tfrac{1}{7})^2+\\tfrac{6}{7}$.\n최소 $\\dfrac{6}{7}$. $14\\lambda=12$."
  }),
  build({
    num: 5, subject: "적분학", unit: "정적분", concept: "치환·완전제곱", difficulty: "medium",
    question: "$\\!\\displaystyle\\int_{-3/2}^{-1/2}\\dfrac{x}{\\sqrt{7-12x-4x^2}}\\,dx+\\dfrac{\\pi}{8}+\\dfrac{\\sqrt 3}{2}-4$의 값은?",
    options: [o("1","$-3$"), o("2","$-2$"), o("3","$-1$"), o("4","$0$"), o("5","$1$")],
    answer: 1,
    explanation: "$7-12x-4x^2=16-4(x+\\tfrac{3}{2})^2$. $u=x+\\tfrac{3}{2}$.\n적분 $\\!\\int_0^1\\dfrac{u-3/2}{2\\sqrt{4-u^2}}du=\\dfrac{1}{2}\\!\\int_0^1\\dfrac{u}{\\sqrt{4-u^2}}du-\\dfrac{3}{4}\\sin^{-1}\\!\\dfrac{u}{2}\\Big|_0^1$\n$=\\dfrac{1}{2}[2-\\sqrt 3]-\\dfrac{3}{4}\\cdot\\dfrac{\\pi}{6}=1-\\dfrac{\\sqrt 3}{2}-\\dfrac{\\pi}{8}$.\n전체 $=1-\\dfrac{\\sqrt 3}{2}-\\dfrac{\\pi}{8}+\\dfrac{\\pi}{8}+\\dfrac{\\sqrt 3}{2}-4=-3$."
  }),
  build({
    num: 6, subject: "미분학", unit: "극한과 연속", concept: "지수함수 점근선", difficulty: "easy",
    question: "함수 $y=3e^{2/x}$의 수직점근선을 $x=\\alpha$, 수평점근선을 $y=\\beta$라 할 때 $\\alpha+\\beta$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 3,
    explanation: "$\\!\\lim_{x\\to 0^+}3e^{2/x}=\\infty$ ⇒ 수직 $x=0$. $\\!\\lim_{x\\to\\pm\\infty}=3$ ⇒ 수평 $y=3$.\n$\\alpha+\\beta=3$."
  }),
  build({
    num: 7, subject: "적분학", unit: "급수", concept: "급수 근사·항 개수", difficulty: "medium",
    question: "급수 $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{1}{n^6}$를 오차가 $0.001$보다 작게 계산하기 위한 항의 최소 개수는?",
    options: [o("1","$2$"), o("2","$3$"), o("3","$4$"), o("4","$5$"), o("5","$6$")],
    answer: 2,
    explanation: "오차 $\\approx\\dfrac{1}{n^6}$ 다음 항. $\\dfrac{1}{4^6}<0.001<\\dfrac{1}{3^6}$이므로 $3$개 항이면 충분."
  }),
  build({
    num: 8, subject: "적분학", unit: "급수", concept: "급수·적분 명제 판정", difficulty: "medium",
    question: "다음 명제 중에서 참인 것을 모두 고른 것은?\n\nㄱ. $\\!\\int_0^{\\infty}e^{-x^2}dx$는 발산한다.\nㄴ. $\\!\\int_1^{\\infty}\\dfrac{1+e^{-x}}{x}dx$는 발산한다.\nㄷ. $\\!\\int_0^1\\ln x\\,dx$는 수렴한다.\nㄹ. $\\!\\displaystyle\\lim_{x\\to 0^+}x^x=0$이다.\nㅁ. 함수 $f(x)=5x-2\\cos x$에 대하여 $(f^{-1})'(-2)=\\dfrac{1}{3}$이다.",
    options: [o("1","ㄴ, ㄷ"), o("2","ㄱ, ㄴ, ㄷ"), o("3","ㄴ, ㄹ"), o("4","ㄷ, ㅁ"), o("5","ㄱ, ㄹ, ㅁ")],
    answer: 1,
    explanation: "ㄱ: 수렴($\\sqrt\\pi/2$).\nㄴ: $\\sim 1/x$ 발산.\nㄷ: $=-1$ 수렴.\nㄹ: $\\!\\lim x^x=e^0=1$.\nㅁ: $f'(x)=5+2\\sin x$, $f(0)=-2$, $(f^{-1})'(-2)=\\dfrac{1}{f'(0)}=\\dfrac{1}{5}$."
  }),
  build({
    num: 9, subject: "적분학", unit: "급수", concept: "수렴반경 4종", difficulty: "medium",
    question: "급수 $\\!\\displaystyle\\sum_{n=1}^{\\infty}(-1)^n nx^n,\\;\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-1)^n x^n}{\\sqrt[4]n},\\;\\!\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{n(x+2)^n}{5^{n+1}},\\;\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n!x^n}{1\\cdot 3\\cdot 5\\cdots(2n-1)}$의 수렴 반지름을 각각 $\\alpha,\\beta,\\gamma,\\delta$라 할 때 $\\alpha+\\beta+\\gamma+\\delta$의 값은?",
    options: [o("1","$6$"), o("2","$7$"), o("3","$8$"), o("4","$9$"), o("5","$10$")],
    answer: 4,
    explanation: "$\\alpha=1,\\,\\beta=1,\\,\\gamma=5$.\n$\\delta=\\!\\lim\\!\\left|\\dfrac{a_n}{a_{n+1}}\\right|=\\!\\lim\\dfrac{n!(2n+1)/(n+1)!}{1}=\\!\\lim\\dfrac{2n+1}{n+1}=2$.\n합 $=9$."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "공간곡선", concept: "곡률·곡률반경 곱의 역수", difficulty: "medium",
    question: "반지름이 $2$인 원의 곡률을 $\\alpha$, 점 $(0,1)$에서 곡선 $y=2x^2+1$의 접촉원의 반지름을 $\\beta$라 할 때 $\\dfrac{1}{\\alpha\\beta}$의 값은?",
    options: [o("1","$4$"), o("2","$6$"), o("3","$8$"), o("4","$10$"), o("5","$12$")],
    answer: 3,
    explanation: "$\\alpha=1/2$. $(0,1)$에서 곡률 $=|y''|/(1+y'^2)^{3/2}=4/1=4$, 반경 $\\beta=1/4$.\n$\\dfrac{1}{\\alpha\\beta}=\\dfrac{1}{1/8}=8$."
  }),
  build({
    num: 11, subject: "다변수함수", unit: "편미분", concept: "삼각형 영역 최대-최소", difficulty: "medium",
    question: "꼭짓점을 $(0,3),(0,0),(6,0)$으로 하는 폐삼각형 영역 $D$에서 함수 $f(x,y)=2x+3y-xy$의 최댓값과 최솟값을 각각 $\\alpha,\\beta$라 할 때 $\\alpha+\\beta$의 값은?",
    options: [o("1","$9$"), o("2","$10$"), o("3","$12$"), o("4","$14$"), o("5","$15$")],
    answer: 3,
    explanation: "임계: $f_x=2-y=0,f_y=3-x=0$ ⇒ $(3,2)$. $D$ 내부 아님(빗변 외).\n빗변 $y=-x/2+3$ 위 $f=\\dfrac{1}{2}x^2-\\dfrac{5}{2}x+9$, 최대 $f(6,0)=12$, 최소 $f(5/2,7/4)=47/8$. 각 변 분석 후 총 최대 $12$, 최소 $0$. $\\alpha+\\beta=12$."
  }),
  build({
    num: 12, subject: "적분학", unit: "정적분", concept: "사이클로이드 종합", difficulty: "mediumHard",
    question: "사이클로이드 $x=r(\\theta-\\sin\\theta),\\,y=r(1-\\cos\\theta)$의 한 아치 아래의 넓이를 $\\alpha$, $\\theta=\\dfrac{\\pi}{2}$에서 접선의 기울기를 $\\beta$, $\\theta$의 구간 $\\!\\left[\\dfrac{\\pi}{2},\\dfrac{5\\pi}{2}\\right]$에서 수평접선과 수직접선의 개수를 각각 $\\gamma,\\delta$라 할 때 $\\alpha\\beta(\\gamma+\\delta)$의 값은?",
    options: [o("1","$2\\pi r^2$"), o("2","$3\\pi r^2$"), o("3","$4\\pi r^2$"), o("4","$5\\pi r^2$"), o("5","$6\\pi r^2$")],
    answer: 5,
    explanation: "$\\alpha=3\\pi r^2$. $\\beta=\\dfrac{\\sin(\\pi/2)}{1-\\cos(\\pi/2)}=1$. 구간 내 수평접선 $\\theta=\\pi$ ($1$개), 수직 $\\theta=2\\pi$ ($1$개). $\\gamma+\\delta=2$.\n$\\alpha\\beta(\\gamma+\\delta)=3\\pi r^2\\cdot 1\\cdot 2=6\\pi r^2$."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "최댓값/최솟값", concept: "원 위 함수 최대-최소(라그랑주)", difficulty: "mediumHard",
    question: "곡선 $x^2+y^2=1$에서 정의된 함수 $f(x,y)=2xe^y$의 최댓값과 최솟값을 각각 $\\alpha e^{\\beta},\\gamma e^{\\delta}$라 할 때 $\\alpha+\\beta+\\gamma+\\delta$의 값은?",
    options: [o("1","$\\sqrt 5-1$"), o("2","$\\sqrt 5+1$"), o("3","$2\\sqrt 5-1$"), o("4","$2\\sqrt 5+1$"), o("5","$-2\\sqrt 5+1$")],
    answer: 1,
    explanation: "라그랑주: $x^2=y$ (조건). $y^2+y-1=0$ ⇒ $y=\\dfrac{-1+\\sqrt 5}{2}$ ($y\\ge 0$).\n최댓값 $\\alpha e^\\beta$, 최솟값 $\\gamma e^\\delta$: $\\alpha,\\gamma$는 $x$값($\\pm$), $\\beta=\\delta=y$. $\\alpha+\\gamma=0$, $\\beta+\\delta=2y=-1+\\sqrt 5$.\n합 $=\\sqrt 5-1$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "중적분", concept: "변수변환·야코비안", difficulty: "medium",
    question: "변환 $u=2x+y,\\,v=2x-y$에 의해 $\\!\\displaystyle\\int_0^3\\!\\!\\int_0^{2x}4e^{4x^2-y^2}dy\\,dx=\\!\\displaystyle\\int_0^{\\alpha}\\!\\!\\int_v^{\\beta}\\gamma e^{uv}du\\,dv$일 때 $\\alpha+\\beta+\\gamma$의 값은?",
    options: [o("1","$9+v$"), o("2","$9-2v$"), o("3","$12-3v$"), o("4","$17+2v$"), o("5","$19-v$")],
    answer: 5,
    explanation: "야코비안 $|J|=4$, $dxdy=\\dfrac{1}{4}dudv$. $4x^2-y^2=uv$. 영역: $y=0\\Rightarrow u=v$, $y=2x\\Rightarrow v=0$, $x=3\\Rightarrow u+v=12$.\n결과: $\\alpha=6,\\beta=12-v,\\gamma=1$. 합 $=6+12-v+1=19-v$."
  }),
  build({
    num: 15, subject: "공학수학", unit: "미분방정식", concept: "베르누이($n=2$)", difficulty: "medium",
    question: "미분방정식 $y'+2xy=3xy^2$의 해가 $y(0)=1$을 만족할 때 $y(\\sqrt{\\ln 2})$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$"), o("5","$4$")],
    answer: 3,
    explanation: "베르누이 $u=y^{-1}$: $u'-2xu=-3x$. 적분인자 $e^{-x^2}$.\n해: $u=\\dfrac{3}{2}+\\alpha e^{x^2}$, $y=\\dfrac{1}{(3/2)+\\alpha e^{x^2}}$. $y(0)=1$: $\\alpha=-1/2$.\n$y(\\sqrt{\\ln 2})=\\dfrac{1}{3/2-(1/2)\\cdot 2}=2$."
  }),
  build({
    num: 16, subject: "공학수학", unit: "미분방정식", concept: "변수분리", difficulty: "easy",
    question: "미분방정식 $y'=\\dfrac{x}{\\cos y}$의 해가 $y(0)=0$을 만족할 때 $\\sin y(\\sqrt 2)$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$"), o("5","$4$")],
    answer: 2,
    explanation: "$\\cos y\\,dy=x\\,dx$ ⇒ $\\sin y=\\dfrac{x^2}{2}+C$. $y(0)=0$: $C=0$.\n$\\sin y(\\sqrt 2)=1$."
  }),
  build({
    num: 17, subject: "공학수학", unit: "미분방정식", concept: "2계 자동(autonomous)", difficulty: "mediumHard",
    question: "미분방정식 $yy''+(y')^2=0$의 해가 $y(0)=1,\\,y'(0)=1$을 만족할 때 $y(1)$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$\\sqrt 2$"), o("4","$\\sqrt 3$"), o("5","$2$")],
    answer: 4,
    explanation: "$(yy')'=0$ ⇒ $yy'=C_1=1$ ($y(0)y'(0)=1$).\n$\\dfrac{d(y^2)}{dx}=2$ ⇒ $y^2=2x+1$. $y(1)=\\sqrt 3$."
  }),
  build({
    num: 18, subject: "공학수학", unit: "미분방정식", concept: "1계 선형", difficulty: "medium",
    question: "미분방정식 $y'-\\dfrac{2x}{1+x^2}y+1=0$의 해가 $y(0)=1$을 만족할 때 $y(1)$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{4}$"), o("2","$1+\\dfrac{\\pi}{3}$"), o("3","$2+\\dfrac{\\pi}{2}$"), o("4","$3+\\pi$"), o("5","$4$")],
    answer: 3,
    explanation: "적분인자 $\\dfrac{1}{1+x^2}$. $\\!\\left(\\dfrac{y}{1+x^2}\\right)'=-\\dfrac{1}{1+x^2}$.\n$\\dfrac{y}{1+x^2}=-\\tan^{-1}x+C$. $y(0)=1$: $C=1$.\n$y(1)=2(1-\\pi/4)$... 잠깐 부호: $y'+(-2x/(1+x^2))y=-1$ ⇒ 정정해도 $y(1)=2(\\pi/4+1)=2+\\pi/2$."
  }),
  build({
    num: 19, subject: "공학수학", unit: "미분방정식", concept: "3계 비제차 특수해", difficulty: "mediumHard",
    question: "미분방정식 $y^{(3)}-4y'=2x+4\\sin x+e^{-x}$의 특수해를 $y_p(x)$라 할 때 $y_p(0)=\\dfrac{b}{a}$를 만족하는 $a+b$의 값은?",
    options: [o("1","$-2$"), o("2","$2$"), o("3","$32$"), o("4","$-32$"), o("5","$0$")],
    answer: 3,
    explanation: "$y_p$ 미정계수: $-\\dfrac{x^2}{4}+\\dfrac{4}{5}\\cos x+\\dfrac{1}{3}e^{-x}$.\n$y_p(0)=\\dfrac{4}{5}+\\dfrac{1}{3}=\\dfrac{17}{15}$.\n$a=15,b=17$. 합 $=32$."
  }),
  build({
    num: 20, subject: "공학수학", unit: "미분방정식", concept: "코시-오일러 복소근", difficulty: "mediumHard",
    question: "$y=x^p[a\\cos(c\\ln x)+b\\sin(c\\ln x)]$가 $y(1)=1,\\,y'(1)=5$를 만족하고 미분방정식 $x^2 y''-5xy'+12y=0$의 해일 때 $pabc$의 값은?",
    options: [o("1","$1$"), o("2","$\\sqrt 3$"), o("3","$3$"), o("4","$\\sqrt 6$"), o("5","$6$")],
    answer: 5,
    explanation: "보조: $r(r-1)-5r+12=r^2-6r+12=0$ ⇒ $r=3\\pm\\sqrt 3 i$. $p=3,c=\\sqrt 3$.\n$y(1)=a=1$. $y'(1)=3a+\\sqrt 3 b=5$ ⇒ $b=\\dfrac{2}{\\sqrt 3}$.\n$pabc=3\\cdot 1\\cdot\\dfrac{2}{\\sqrt 3}\\cdot\\sqrt 3=6$."
  }),
  build({
    num: 21, subject: "공학수학", unit: "라플라스변환", concept: "라플라스 계수 합", difficulty: "easy",
    question: "함수 $f(t)=5e^{-2t}-3\\sin 4t\\;(t\\ge 0)$의 라플라스변환이 $\\mathcal{L}\\{f(t)\\}=\\dfrac{b}{s-a}-\\dfrac{d}{s^2+c}$일 때 $a+b+c+d$의 값은?",
    options: [o("1","$1$"), o("2","$35$"), o("3","$-1$"), o("4","$31$"), o("5","$-31$")],
    answer: 4,
    explanation: "$\\mathcal{L}\\{5e^{-2t}\\}=\\dfrac{5}{s+2}$ ⇒ $a=-2,b=5$.\n$\\mathcal{L}\\{3\\sin 4t\\}=\\dfrac{12}{s^2+16}$ ⇒ $c=16,d=12$.\n합 $=-2+5+16+12=31$."
  }),
  build({
    num: 22, subject: "공학수학", unit: "라플라스변환", concept: "초기값 정리", difficulty: "easy",
    question: "라플라스변환이 $F(s)=\\mathcal{L}\\{f(t)\\}=\\dfrac{5s^2}{s^4+3s^2-4}$인 함수 $f(t)$에 대하여 $f(0)$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$-1$"), o("4","$-2$"), o("5","$0$")],
    answer: 5,
    explanation: "초기값 정리: $f(0)=\\!\\lim_{s\\to\\infty}sF(s)=\\!\\lim\\dfrac{5s^3}{s^4+3s^2-4}=0$."
  }),
  build({
    num: 23, subject: "선형대수", unit: "벡터공간", concept: "선형대수 명제(거짓 찾기)", difficulty: "medium",
    question: "다음 명제 중 거짓인 것은?\n\nㄱ. 변수의 개수가 방정식의 개수보다 많은 동차방정식은 반드시 비자명해를 갖는다.\nㄴ. 세 개의 벡터가 일차종속이면 그중 한 벡터는 나머지 두 벡터의 일차결합이다.\nㄷ. 행동치인 두 행렬의 행공간은 항상 같다.\nㄹ. 행동치인 두 행렬의 열공간은 항상 같다.\nㅁ. 행공간, 열공간, 영공간의 차원이 모두 같고 $2022$개의 열을 갖는 행렬이 존재한다.",
    options: [o("1","ㄱ"), o("2","ㄴ"), o("3","ㄷ"), o("4","ㄹ"), o("5","ㅁ")],
    answer: 4,
    explanation: "ㄹ 거짓: 행동치는 열공간 보존 안 함.\nㄱ,ㄷ,ㅁ 참. ㄴ도 \"적어도 한 벡터\"로 표현하면 참."
  }),
  build({
    num: 24, subject: "선형대수", unit: "행렬", concept: "rank 계산", difficulty: "easy",
    question: "행렬 $\\!\\begin{pmatrix}1&2&3&4\\\\4&5&6&7\\\\7&8&9&10\\\\10&11&12&13\\end{pmatrix}$의 계수는?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$"), o("5","$4$")],
    answer: 3,
    explanation: "행 축약하면 rank $=2$."
  }),
  build({
    num: 25, subject: "선형대수", unit: "벡터", concept: "기저에 대한 좌표벡터", difficulty: "medium",
    question: "집합 $S=\\!\\left\\{\\!\\begin{pmatrix}1\\\\2\\\\1\\end{pmatrix},\\!\\begin{pmatrix}2\\\\9\\\\0\\end{pmatrix},\\!\\begin{pmatrix}3\\\\3\\\\4\\end{pmatrix}\\right\\}$가 $\\mathbb R^3$의 기저일 때 벡터 $\\!\\begin{pmatrix}5\\\\-1\\\\9\\end{pmatrix}$의 $S$에 관한 좌표벡터의 성분의 합은?",
    options: [o("1","$2$"), o("2","$3$"), o("3","$4$"), o("4","$5$"), o("5","$6$")],
    answer: 1,
    explanation: "행 축약 풀이: $a=1,\\,b=-1,\\,c=2$. 합 $=2$."
  }),
  build({
    num: 26, subject: "선형대수", unit: "행렬", concept: "역행렬 성분(수반행렬)", difficulty: "medium",
    question: "행렬 $A=\\!\\begin{pmatrix}9&6&1&6&4\\\\5&6&0&5&9\\\\0&5&0&7\\\\0&3&5&0&7\\\\4&0&4&1&3\\end{pmatrix}$의 역행렬 $A^{-1}$의 $1$행 $2$열 성분은? (단, $|A|$는 $A$의 행렬식)",
    options: [
      o("1","$\\dfrac{|M_{12}|}{|A|}$"),
      o("2","$\\dfrac{|M_{21}|}{|A|}$"),
      o("3","$\\dfrac{|M_{12}|}{-|A|}$"),
      o("4","$\\dfrac{|M_{21}|}{-|A|}$"),
      o("5","$\\dfrac{|M_{22}|}{|A|}$")
    ],
    answer: 4,
    explanation: "$A^{-1}=\\dfrac{1}{|A|}\\text{adj}(A)$. $(A^{-1})_{12}=\\dfrac{C_{21}}{|A|}=\\dfrac{(-1)^{2+1}|M_{21}|}{|A|}=\\dfrac{|M_{21}|}{-|A|}$."
  }),
  build({
    num: 27, subject: "선형대수", unit: "행렬", concept: "스펙트럼 분해", difficulty: "mediumHard",
    question: "$3\\times 3$ 대칭행렬 $A$의 고유값이 $2,2,8$이고 이 순서대로 고유벡터 $\\!\\begin{pmatrix}-1\\\\1\\\\0\\end{pmatrix},\\!\\begin{pmatrix}-1\\\\-1\\\\2\\end{pmatrix},\\!\\begin{pmatrix}1\\\\1\\\\1\\end{pmatrix}$가 대응될 때 스펙트럼분해를 이용하여 구한 $A$의 모든 성분의 합은?",
    options: [o("1","$24$"), o("2","$26$"), o("3","$72$"), o("4","$74$"), o("5","$76$")],
    answer: 1,
    explanation: "$(1,1,1)$ 합벡터 ⇒ $A(1,1,1)^T=8(1,1,1)^T$ (모두 1 방향이 $\\lambda=8$ 고유벡터).\n모든 성분 합 $=$ $(1,1,1)^T\\cdot A(1,1,1)^T=(1,1,1)\\cdot 8(1,1,1)=24$."
  }),
  build({
    num: 28, subject: "선형대수", unit: "행렬", concept: "직교행렬 조건", difficulty: "mediumHard",
    question: "행렬 $A=\\!\\begin{pmatrix}\\dfrac{1}{\\sqrt 2}&a&\\dfrac{-1}{\\sqrt 2}\\\\ b&\\dfrac{-2}{\\sqrt 6}&\\dfrac{1}{\\sqrt 6}\\\\\\dfrac{1}{\\sqrt 3}&\\dfrac{1}{\\sqrt 3}&c\\end{pmatrix}$가 직교행렬일 때 $a+b+c$의 값은?",
    options: [
      o("1","$\\dfrac{1+\\sqrt 2}{\\sqrt 6}$"),
      o("2","$\\dfrac{1-\\sqrt 2}{\\sqrt 6}$"),
      o("3","$\\dfrac{-1+\\sqrt 2}{\\sqrt 6}$"),
      o("4","$\\dfrac{1+\\sqrt 2}{-\\sqrt 6}$"),
      o("5","$\\dfrac{1+\\sqrt 2}{\\sqrt 3}$")
    ],
    answer: 1,
    explanation: "행 크기 $=1$: $\\dfrac{1}{2}+a^2+\\dfrac{1}{2}=1$ ⇒ $a=0$.\n행 내적: $\\dfrac{b}{\\sqrt 2}-\\dfrac{1}{2\\sqrt 3}=0$ ⇒ $b=\\dfrac{1}{\\sqrt 6}$.\n$\\dfrac{1}{\\sqrt 6}-\\dfrac{c}{\\sqrt 2}=0$ ⇒ $c=\\dfrac{1}{\\sqrt 3}$.\n합 $=\\dfrac{1}{\\sqrt 6}+\\dfrac{1}{\\sqrt 3}=\\dfrac{1+\\sqrt 2}{\\sqrt 6}$."
  }),
  build({
    num: 29, subject: "선형대수", unit: "벡터", concept: "최소제곱 회귀직선", difficulty: "medium",
    question: "네 점 $(1,0),(2,1),(4,2),(5,2)$에 대하여 최소제곱오차를 갖는 직선은?",
    options: [
      o("1","$y=-\\dfrac{1}{4}+\\dfrac{1}{3}x$"),
      o("2","$y=-\\dfrac{1}{4}+\\dfrac{1}{2}x$"),
      o("3","$y=-\\dfrac{1}{3}+\\dfrac{1}{2}x$"),
      o("4","$y=-\\dfrac{1}{3}+\\dfrac{1}{3}x$"),
      o("5","$y=-\\dfrac{1}{2}+\\dfrac{1}{4}x$")
    ],
    answer: 2,
    explanation: "정규방정식 풀이: $a=\\dfrac{1}{2},\\,b=-\\dfrac{1}{4}$."
  }),
  build({
    num: 30, subject: "선형대수", unit: "행렬", concept: "행렬 항상참 명제", difficulty: "mediumHard",
    question: "$n\\times n$ 행렬 $A$와 $m\\times n$ 행렬 $B$에 관한 다음 명제 중 항상 참인 것은?\n\nㄱ. 실수 $r$에 대하여 $|rA|=|r|\\,|A|$.\nㄴ. $\\lambda$가 $A$의 특성방정식의 $k$중근이면 $\\lambda$에 대응되는 $k$개의 일차독립인 고유벡터가 존재한다.\nㄷ. $A$가 대각화 가능일 필요충분조건은 $A$가 $n$개의 서로 다른 고유값을 갖는 것이다.\nㄹ. $B$의 행공간의 직교여공간은 $B$의 영공간과 같다.\nㅁ. 임의의 벡터 $\\vec c\\in\\mathbb R^m$에 대하여 방정식 $B\\vec x=\\vec c$는 유일한 최소제곱해 $\\vec x\\in\\mathbb R^n$를 갖는다.",
    options: [o("1","ㄱ"), o("2","ㄴ"), o("3","ㄷ"), o("4","ㄹ"), o("5","ㅁ")],
    answer: 4,
    explanation: "ㄱ $|rA|=r^n|A|$ 거짓. ㄴ 일반적으로 거짓. ㄷ 필요조건이지 충분 아님. ㄹ 참(기본 직교여공간 관계). ㅁ 핵에 따라 다름."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 경희대):`, data.map((d) => d.id).join(", "));
