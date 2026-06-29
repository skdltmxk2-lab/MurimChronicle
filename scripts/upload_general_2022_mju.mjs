// Upload 2022년도 명지대 편입수학 기출 25문항
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
const YEAR = "2022";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-mju-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "삼각함수 합성 극한", difficulty: "easy",
    question: "$\\displaystyle\\lim_{x\\to 0}\\!\\dfrac{\\cos\\!\\left(\\dfrac{\\pi}{2}(1+x)\\right)}{\\tan(\\sin x)}$의 값은?",
    options: [o("1","$-\\dfrac{\\pi}{2}$"), o("2","$-\\dfrac{\\pi}{4}$"), o("3","$0$"), o("4","$\\dfrac{\\pi}{4}$"), o("5","$\\dfrac{\\pi}{2}$")],
    answer: 1,
    explanation: "$\\cos\\!\\left(\\dfrac{\\pi}{2}+\\dfrac{\\pi}{2}x\\right)=-\\sin\\!\\left(\\dfrac{\\pi}{2}x\\right)$.\n$\\dfrac{-\\sin(\\pi x/2)}{\\tan(\\sin x)}=-\\dfrac{\\sin(\\pi x/2)}{\\pi x/2}\\cdot\\dfrac{\\sin x}{\\tan(\\sin x)}\\cdot\\dfrac{x}{\\sin x}\\cdot\\dfrac{\\pi}{2}\\to-\\dfrac{\\pi}{2}$."
  }),
  build({
    num: 2, subject: "미분학", unit: "미분의 응용", concept: "3차 증가함수 조건(판별식)", difficulty: "easy",
    question: "함수 $f(x)=x^3+ax^2+12x+5$가 실수 전체에서 증가하도록 하는 실수 $a$의 최댓값은?",
    options: [o("1","$2$"), o("2","$4$"), o("3","$6$"), o("4","$8$"), o("5","$10$")],
    answer: 3,
    explanation: "$f'(x)=3x^2+2ax+12\\ge 0$이 모든 $x$에서 성립해야 함.\n판별식 $D/4=a^2-36\\le 0\\Rightarrow-6\\le a\\le 6$.\n최댓값 $6$."
  }),
  build({
    num: 3, subject: "선형대수", unit: "벡터", concept: "외적·단위벡터·크기 조정", difficulty: "easy",
    question: "좌표공간에서 두 벡터 $\\langle 2,-1,3\\rangle$과 $\\langle-1,2,-3\\rangle$에 모두 수직이고 크기가 $\\sqrt 3$인 벡터를 $\\langle a,b,c\\rangle$라 할 때 $ab+bc+ca$의 값은?",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$0$"), o("4","$1$"), o("5","$2$")],
    answer: 2,
    explanation: "외적 $=\\!\\begin{vmatrix}\\mathbf i&\\mathbf j&\\mathbf k\\\\2&-1&3\\\\-1&2&-3\\end{vmatrix}=(-3,3,3)\\parallel(-1,1,1)$.\n크기 $\\sqrt 3$ 벡터: $\\dfrac{\\sqrt 3}{\\sqrt 3}(-1,1,1)=(-1,1,1)$.\n$ab+bc+ca=-1+1-1=-1$."
  }),
  build({
    num: 4, subject: "다변수함수", unit: "공간곡선", concept: "벡터함수 적분(원시함수)", difficulty: "medium",
    question: "좌표공간에서 도함수 $\\mathbf r'(t)=\\langle-\\sin t,3,4\\cos 2t\\rangle$이고 $\\mathbf r(0)=\\langle 1,0,0\\rangle$인 벡터함수 $\\mathbf r(t)=\\langle f(t),g(t),h(t)\\rangle$에 대해 $f\\!\\left(\\dfrac{\\pi}{2}\\right)+g\\!\\left(\\dfrac{\\pi}{2}\\right)+h\\!\\left(\\dfrac{\\pi}{2}\\right)$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{2}$"), o("2","$\\pi$"), o("3","$\\dfrac{3\\pi}{2}$"), o("4","$2\\pi$"), o("5","$\\dfrac{5\\pi}{2}$")],
    answer: 3,
    explanation: "$\\mathbf r(t)=(\\cos t+C_1,3t+C_2,2\\sin 2t+C_3)$. $\\mathbf r(0)=(1,0,0)$이므로 $C_i=0$.\n$\\mathbf r(\\pi/2)=(0,3\\pi/2,0)$. 합 $=\\dfrac{3\\pi}{2}$."
  }),
  build({
    num: 5, subject: "미분학", unit: "도함수", concept: "매개곡선 수평접선", difficulty: "medium",
    question: "매개방정식 $x=t^2-1,\\,y=t^3-t$로 주어지는 곡선 위의 점 $(a,b)$에서의 접선이 $x$축에 평행할 때 $a^2+b^2$의 값은?",
    options: [o("1","$\\dfrac{4}{9}$"), o("2","$\\dfrac{13}{27}$"), o("3","$\\dfrac{14}{27}$"), o("4","$\\dfrac{5}{9}$"), o("5","$\\dfrac{16}{27}$")],
    answer: 5,
    explanation: "$\\dfrac{dy}{dx}=\\dfrac{3t^2-1}{2t}=0\\Rightarrow t=\\pm\\dfrac{1}{\\sqrt 3}$.\n$a=t^2-1=-\\dfrac{2}{3},\\,b=t^3-t=\\mp\\dfrac{2}{3\\sqrt 3}$.\n$a^2+b^2=\\dfrac{4}{9}+\\dfrac{4}{27}=\\dfrac{16}{27}$."
  }),
  build({
    num: 6, subject: "적분학", unit: "정적분", concept: "$\\arctan$ 적분", difficulty: "easy",
    question: "$\\displaystyle\\int_0^{3}\\!\\dfrac{1}{x^2+3}\\,dx$의 값은?",
    options: [o("1","$\\dfrac{\\sqrt 3}{12}\\pi$"), o("2","$\\dfrac{\\sqrt 3}{9}\\pi$"), o("3","$\\dfrac{\\sqrt 3}{6}\\pi$"), o("4","$\\dfrac{\\sqrt 3}{3}\\pi$"), o("5","$\\sqrt 3\\pi$")],
    answer: 2,
    explanation: "$\\!\\int\\dfrac{dx}{x^2+3}=\\dfrac{1}{\\sqrt 3}\\tan^{-1}\\dfrac{x}{\\sqrt 3}$.\n$\\!\\left[\\dfrac{1}{\\sqrt 3}\\tan^{-1}\\dfrac{x}{\\sqrt 3}\\right]_0^3=\\dfrac{1}{\\sqrt 3}\\cdot\\dfrac{\\pi}{3}=\\dfrac{\\sqrt 3}{9}\\pi$."
  }),
  build({
    num: 7, subject: "적분학", unit: "급수", concept: "수렴반지름(비율판정)", difficulty: "easy",
    question: "멱급수 $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(-4)^n x^n}{\\sqrt{n+1}}$의 수렴반지름은?",
    options: [o("1","$1$"), o("2","$\\dfrac{1}{2}$"), o("3","$\\dfrac{1}{3}$"), o("4","$\\dfrac{1}{4}$"), o("5","$\\dfrac{1}{5}$")],
    answer: 4,
    explanation: "$\\!\\left|\\dfrac{a_{n+1}}{a_n}\\right|=\\dfrac{4}{\\sqrt{n+2}/\\sqrt{n+1}}\\to 4$.\n수렴반지름 $=\\dfrac{1}{4}$."
  }),
  build({
    num: 8, subject: "미분학", unit: "극한과 연속", concept: "로피탈 정리", difficulty: "medium",
    question: "미분가능한 함수 $f(x)$가 $\\displaystyle\\lim_{x\\to 0}\\dfrac{f(2x)\\ln(1+x)}{x^2}=10$을 만족시킬 때 $f'(0)$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 5,
    explanation: "$\\ln(1+x)\\sim x$이므로 $\\lim\\dfrac{f(2x)\\cdot x}{x^2}=\\lim\\dfrac{f(2x)}{x}=10$.\n$f(0)=0$ 필요. 로피탈: $\\lim\\dfrac{2f'(2x)}{1}=2f'(0)=10\\Rightarrow f'(0)=5$."
  }),
  build({
    num: 9, subject: "미분학", unit: "도함수", concept: "역함수의 도함수", difficulty: "easy",
    question: "함수 $f(x)=e^x+\\displaystyle\\int_1^{x}\\!e^{t^2}\\,dt$의 역함수를 $g(x)$라 할 때 $g'(e)$의 값은?",
    options: [o("1","$\\dfrac{1}{4e}$"), o("2","$\\dfrac{1}{2e}$"), o("3","$\\dfrac{3}{4e}$"), o("4","$\\dfrac{1}{e}$"), o("5","$\\dfrac{5}{4e}$")],
    answer: 2,
    explanation: "$f(1)=e+0=e$이므로 $g(e)=1$. $f'(x)=e^x+e^{x^2}$, $f'(1)=e+e=2e$.\n$g'(e)=\\dfrac{1}{f'(1)}=\\dfrac{1}{2e}$."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "벡터해석", concept: "점-평면 거리", difficulty: "medium",
    question: "좌표공간의 네 점 $P(-2,1,0),\\,Q(2,3,2),\\,R(1,4,-1),\\,S(3,6,1)$에 대하여 점 $S$에서 평면 $PQR$에 이르는 거리는?",
    options: [o("1","$\\dfrac{\\sqrt 2}{5}$"), o("2","$\\dfrac{2\\sqrt 2}{5}$"), o("3","$\\dfrac{3\\sqrt 2}{5}$"), o("4","$\\dfrac{4\\sqrt 2}{5}$"), o("5","$\\sqrt 2$")],
    answer: 4,
    explanation: "$\\overrightarrow{PQ}=(4,2,2),\\,\\overrightarrow{PR}=(3,3,-1)$. 법선 $=\\overrightarrow{PQ}\\times\\overrightarrow{PR}=(-8,10,6)\\parallel(-4,5,3)$.\n평면: $-4x+5y+3z=-4(-2)+5(1)+0=13$.\n$d=\\dfrac{|-12+30+3-13|}{\\sqrt{16+25+9}}=\\dfrac{8}{5\\sqrt 2}=\\dfrac{4\\sqrt 2}{5}$."
  }),
  build({
    num: 11, subject: "미분학", unit: "극한과 연속", concept: "$0/0$ 로피탈·지수함수", difficulty: "medium",
    question: "$\\displaystyle\\lim_{x\\to 1}\\dfrac{x^x-1}{x^2+x-2}$의 값은?",
    options: [o("1","$1$"), o("2","$\\dfrac{1}{2}$"), o("3","$\\dfrac{1}{3}$"), o("4","$\\dfrac{1}{4}$"), o("5","$\\dfrac{1}{5}$")],
    answer: 3,
    explanation: "$x^x=e^{x\\ln x}$. $\\dfrac{0}{0}$ 형식, 로피탈.\n$\\lim\\dfrac{e^{x\\ln x}(\\ln x+1)}{2x+1}=\\dfrac{1\\cdot 1}{3}=\\dfrac{1}{3}$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "다변수함수의 극값", concept: "원판 최대·최소(변수축소)", difficulty: "medium",
    question: "닫힌 원판 $D=\\{(x,y):x^2+y^2\\le 3\\}$에서 정의된 이변수함수 $f(x,y)=2x^2+y^2$의 최댓값과 최솟값을 각각 $M,m$이라 할 때 $M+m$의 값은?",
    options: [o("1","$3$"), o("2","$4$"), o("3","$5$"), o("4","$6$"), o("5","$7$")],
    answer: 4,
    explanation: "내부 임계: $(0,0),\\,f=0$.\n경계 $x^2+y^2=3$: $f=2x^2+(3-x^2)=x^2+3,\\,-\\sqrt 3\\le x\\le\\sqrt 3$. 최댓값 $6$ ($x=\\pm\\sqrt 3$), 최솟값 $3$ ($x=0$).\n전체 $M=6,\\,m=0$. $M+m=6$."
  }),
  build({
    num: 13, subject: "선형대수", unit: "행렬식", concept: "비가역 조건(행렬식=0)", difficulty: "easy",
    question: "다음 행렬의 역행렬이 존재하지 않도록 하는 모든 실수 $c$의 값의 합은? $\\!\\begin{pmatrix}c&-c&c\\\\2&c&1\\\\0&0&c\\end{pmatrix}$",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$0$"), o("4","$1$"), o("5","$2$")],
    answer: 1,
    explanation: "$3$행 전개: $\\det=c\\cdot\\!\\begin{vmatrix}c&-c\\\\2&c\\end{vmatrix}=c(c^2+2c)=c^2(c+2)=0$.\n$c=0,-2$. 합 $=-2$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "다중적분", concept: "삼각형 영역 이중적분", difficulty: "medium",
    question: "$xy$평면에서 직선 $x+y=1$과 $x$축 및 $y$축에 의해 둘러싸인 영역을 $D$라 하자. 곡면 $z=x^2+y^2+1$의 아래에 있고 영역 $D$ 위에 있는 입체의 부피는?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$\\dfrac{2}{3}$"), o("3","$\\dfrac{5}{6}$"), o("4","$1$"), o("5","$\\dfrac{7}{6}$")],
    answer: 2,
    explanation: "$V=\\!\\iint_D(x^2+y^2+1)dA$. 삼각형 $D$: $x$절편 $1$, $y$절편 $1$, 면적 $1/2$.\n2차 모멘트: $\\!\\iint_D x^2 dA=\\!\\iint_D y^2 dA=\\dfrac{1^3\\cdot 1}{12}=\\dfrac{1}{12}$.\n$V=\\dfrac{1}{12}+\\dfrac{1}{12}+\\dfrac{1}{2}=\\dfrac{2}{3}$."
  }),
  build({
    num: 15, subject: "미분학", unit: "미분의 응용", concept: "매개곡선 거리 최소", difficulty: "medium",
    question: "좌표평면에서 점 $A(-1,5)$와 매개방정식 $x=t^2-2t,\\,y=t+1$로 주어지는 곡선 위의 점 $P$에 대하여 $\\overline{AP}$의 최솟값은?",
    options: [o("1","$\\sqrt 3$"), o("2","$2$"), o("3","$\\sqrt 5$"), o("4","$\\sqrt 6$"), o("5","$\\sqrt 7$")],
    answer: 3,
    explanation: "$\\overline{AP}^2=(t^2-2t+1)^2+(t-4)^2=(t-1)^4+(t-4)^2=f(t)$.\n$f'(t)=4(t-1)^3+2(t-4)=0$. 시행착오로 $t=2$.\n$f(2)=1+4=5$. $\\overline{AP}=\\sqrt 5$."
  }),
  build({
    num: 16, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피(이격축)", difficulty: "medium",
    question: "곡선 $y=1-x^4$과 직선 $y=0$에 의해 둘러싸인 영역을 직선 $x=5$를 축으로 회전시켜 얻은 입체의 부피는?",
    options: [o("1","$10\\pi$"), o("2","$12\\pi$"), o("3","$14\\pi$"), o("4","$16\\pi$"), o("5","$18\\pi$")],
    answer: 4,
    explanation: "원주껍질(축 $x=5$, 반지름 $5-x$):\n$V=2\\pi\\!\\int_{-1}^{1}(5-x)(1-x^4)dx=2\\pi\\!\\int_{-1}^{1}(5-5x^4-x+x^5)dx$.\n홀함수 항 $0$. $=4\\pi\\!\\int_0^1(5-5x^4)dx=4\\pi(5-1)=16\\pi$."
  }),
  build({
    num: 17, subject: "적분학", unit: "급수", concept: "멱급수 미분 활용", difficulty: "hard",
    question: "$\\dfrac{1}{1-x^2}=\\displaystyle\\sum_{n=0}^{\\infty}x^{2n}$ ($|x|<1$)의 미분을 이용하여 급수 $\\dfrac{1}{2}+\\dfrac{2}{2^3}+\\dfrac{3}{2^5}+\\cdots+\\dfrac{n}{2^{2n-1}}+\\cdots$의 값은?",
    options: [o("1","$\\dfrac{2}{3}$"), o("2","$\\dfrac{13}{18}$"), o("3","$\\dfrac{7}{9}$"), o("4","$\\dfrac{5}{6}$"), o("5","$\\dfrac{8}{9}$")],
    answer: 5,
    explanation: "$\\sum x^{2n}=\\dfrac{1}{1-x^2}$ 미분: $\\sum 2nx^{2n-1}=\\dfrac{2x}{(1-x^2)^2}$, $\\sum nx^{2n-1}=\\dfrac{x}{(1-x^2)^2}$.\n$x=1/2$: $\\sum\\dfrac{n}{2^{2n-1}}=\\dfrac{1/2}{(3/4)^2}=\\dfrac{1/2}{9/16}=\\dfrac{8}{9}$."
  }),
  build({
    num: 18, subject: "다변수함수", unit: "다중적분", concept: "극좌표 가우시안", difficulty: "medium",
    question: "좌표평면 영역 $R=\\{(x,y):x^2+y^2\\le a\\}$에 대하여 $\\!\\iint_R e^{x^2+y^2}\\,dA=\\pi$를 만족시키는 양수 $a$의 값은?",
    options: [o("1","$\\ln 2$"), o("2","$\\ln 3$"), o("3","$2\\ln 2$"), o("4","$\\ln 5$"), o("5","$\\ln 6$")],
    answer: 1,
    explanation: "극좌표: $\\!\\int_0^{2\\pi}\\!\\int_0^{\\sqrt a}e^{r^2}\\cdot r\\,dr\\,d\\theta=2\\pi\\cdot\\dfrac{1}{2}[e^{r^2}]_0^{\\sqrt a}=\\pi(e^a-1)=\\pi$.\n$e^a=2\\Rightarrow a=\\ln 2$."
  }),
  build({
    num: 19, subject: "다변수함수", unit: "다중적분", concept: "극영역 차집합(1사분면)", difficulty: "hard",
    question: "좌표평면에서 극곡선 $r=1+\\sin\\theta$의 내부와 극곡선 $r=3\\sin\\theta$의 외부에 놓여 있는 영역 중에서 제1사분면에 놓여 있는 영역의 넓이는?",
    options: [o("1","$1-\\dfrac{\\pi}{8}$"), o("2","$1-\\dfrac{\\pi}{7}$"), o("3","$1-\\dfrac{\\pi}{6}$"), o("4","$1-\\dfrac{\\pi}{5}$"), o("5","$1-\\dfrac{\\pi}{4}$")],
    answer: 5,
    explanation: "교점: $1+\\sin\\theta=3\\sin\\theta\\Rightarrow\\sin\\theta=1/2\\Rightarrow\\theta=\\pi/6$.\n$S=\\dfrac{1}{2}\\!\\int_0^{\\pi/6}[(1+\\sin\\theta)^2-(3\\sin\\theta)^2]d\\theta=\\dfrac{1}{2}\\!\\int(1+2\\sin\\theta-8\\sin^2\\theta)d\\theta=1-\\dfrac{\\pi}{4}$."
  }),
  build({
    num: 20, subject: "적분학", unit: "급수", concept: "$\\ln$ 부등식·비교판정", difficulty: "hard",
    question: "$3$ 이상의 자연수 $n$에 대하여 $a_n=\\dfrac{1}{n\\ln n}$, $b_n=\\dfrac{1}{n(\\ln n)^2}$, $c_n=\\dfrac{1}{\\ln(n!)}$일 때 다음 보기에서 옳은 것을 모두 고른 것은?\n\nㄱ. $b_n\\le a_n\\le c_n$  ㄴ. $\\displaystyle\\sum_{n=3}^{\\infty}b_n$은 발산한다.  ㄷ. $\\displaystyle\\sum_{n=3}^{\\infty}c_n$은 발산한다.",
    options: [o("1","ㄱ"), o("2","ㄴ"), o("3","ㄱ, ㄴ"), o("4","ㄱ, ㄷ"), o("5","ㄴ, ㄷ")],
    answer: 4,
    explanation: "ㄱ. ① $n\\ln n<n(\\ln n)^2$이면 $b_n<a_n$이지만 $\\ln n>1$ 필요. ② $\\ln(n!)=\\sum\\ln k<n\\ln n\\Rightarrow c_n>a_n$. 따라서 $b_n\\le a_n\\le c_n$. 참.\nㄴ. 적분판정 $\\!\\int\\dfrac{dx}{x(\\ln x)^2}$ 수렴. 거짓.\nㄷ. $c_n\\ge a_n$이고 $\\sum a_n$ 발산이므로 $\\sum c_n$ 발산. 참.\n참: ㄱ, ㄷ."
  }),
  build({
    num: 21, subject: "적분학", unit: "정적분", concept: "$\\int xf(\\sin x)dx$ 공식", difficulty: "easy",
    question: "연속함수 $f(x)$가 $\\displaystyle\\int_0^{\\pi}\\!xf(\\sin x)\\,dx=a\\!\\int_0^{\\pi}\\!f(\\sin x)\\,dx$를 만족시킬 때 실수 $a$의 값은?",
    options: [o("1","$1$"), o("2","$\\dfrac{\\pi}{2}$"), o("3","$2$"), o("4","$\\pi$"), o("5","$4$")],
    answer: 2,
    explanation: "표준 공식: $\\!\\int_0^{\\pi}\\!xf(\\sin x)dx=\\dfrac{\\pi}{2}\\!\\int_0^{\\pi}\\!f(\\sin x)dx$.\n$x\\to\\pi-x$ 치환으로 유도. $a=\\dfrac{\\pi}{2}$."
  }),
  build({
    num: 22, subject: "적분학", unit: "정적분", concept: "$\\cos$ 치환·부분분수", difficulty: "medium",
    question: "$\\displaystyle\\int_0^{\\pi}\\!\\dfrac{x\\sin x}{4-\\cos^2 x}\\,dx$의 값은?",
    options: [o("1","$\\dfrac{\\pi\\ln 3}{4}$"), o("2","$\\dfrac{\\pi\\ln 2}{2}$"), o("3","$\\pi\\ln 2$"), o("4","$2\\ln 3$"), o("5","$3\\ln 5$")],
    answer: 1,
    explanation: "21번 공식: $=\\dfrac{\\pi}{2}\\!\\int_0^{\\pi}\\!\\dfrac{\\sin x}{4-\\cos^2 x}dx$.\n$\\cos x=t$ 치환($-\\sin x\\,dx=dt$): $=\\dfrac{\\pi}{2}\\!\\int_{-1}^1\\!\\dfrac{dt}{4-t^2}=\\dfrac{\\pi}{2}\\cdot\\dfrac{1}{4}\\!\\left[\\ln\\!\\left|\\dfrac{2+t}{2-t}\\right|\\right]_{-1}^1=\\dfrac{\\pi}{8}(\\ln 3-\\ln(1/3))=\\dfrac{\\pi\\ln 3}{4}$."
  }),
  build({
    num: 23, subject: "적분학", unit: "부정적분", concept: "부분분수 유리함수", difficulty: "hard",
    question: "이차함수 $f(x)$가 (가) $f(0)=9$ (나) $\\displaystyle\\int\\dfrac{f(x)}{x^2(x+3)^2}\\,dx$가 유리함수임을 만족시킬 때 $f'(0)$의 값은?",
    options: [o("1","$-6$"), o("2","$-3$"), o("3","$0$"), o("4","$3$"), o("5","$6$")],
    answer: 5,
    explanation: "$\\dfrac{f(x)}{x^2(x+3)^2}=\\dfrac{A}{x}+\\dfrac{B}{x^2}+\\dfrac{C}{x+3}+\\dfrac{D}{(x+3)^2}$. 유리함수: $A=C=0$.\n$f(x)=B(x+3)^2+Dx^2=(B+D)x^2+6Bx+9B$. $f(0)=9B=9\\Rightarrow B=1$.\n$f'(0)=6B=6$."
  }),
  build({
    num: 24, subject: "다변수함수", unit: "다중적분", concept: "타원→원 변환($x^2$ 평균)", difficulty: "medium",
    question: "좌표평면에서 곡선 $\\dfrac{x^2}{4}+\\dfrac{y^2}{9}=1$로 둘러싸인 영역을 $R$이라 할 때 $\\!\\iint_R x^2\\,dA$의 값은?",
    options: [o("1","$2\\pi$"), o("2","$4\\pi$"), o("3","$6\\pi$"), o("4","$8\\pi$"), o("5","$10\\pi$")],
    answer: 3,
    explanation: "$x=2X,\\,y=3Y$ 치환: $dxdy=6\\,dX\\,dY$, $X^2+Y^2\\le 1$.\n$\\!\\iint x^2 dA=6\\!\\iint(2X)^2\\,dX\\,dY=24\\!\\iint X^2\\,dX\\,dY$.\n극좌표: $24\\!\\int_0^{2\\pi}\\cos^2\\theta\\,d\\theta\\cdot\\!\\int_0^1 r^3 dr=24\\cdot\\pi\\cdot\\dfrac{1}{4}=6\\pi$."
  }),
  build({
    num: 25, subject: "적분학", unit: "특이적분", concept: "수렴 조건·$\\ln$ 극한", difficulty: "hard",
    question: "두 실수 $a,b$에 대하여 $\\displaystyle\\int_0^{\\infty}\\!\\left(\\dfrac{a}{2x+1}-\\dfrac{x^{2021}}{x^{2022}+1}\\right)dx=b$일 때 $ab$의 값은?",
    options: [o("1","$\\ln 2$"), o("2","$2\\ln 2$"), o("3","$\\ln 5$"), o("4","$2\\ln 3$"), o("5","$3\\ln 3$")],
    answer: 2,
    explanation: "수렴 조건: $x\\to\\infty$에서 $\\dfrac{a}{2x}-\\dfrac{1}{x}$의 leading이 사라져야 함. $\\dfrac{a}{2}-1=0\\Rightarrow a=2$.\n적분: $\\!\\left[\\ln(2x+1)-\\dfrac{1}{2022}\\ln(x^{2022}+1)\\right]_0^{\\infty}=\\dfrac{1}{2022}\\lim\\ln\\dfrac{(2x+1)^{2022}}{x^{2022}+1}=\\dfrac{1}{2022}\\ln 2^{2022}=\\ln 2$.\n$b=\\ln 2$, $ab=2\\ln 2$."
  })
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (2022 명지대):`, data.map((d) => d.id).join(", "));
