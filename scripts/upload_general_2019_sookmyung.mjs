// Upload 2019년도 숙명여대 편입수학 기출 25문항 (5지선다)
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

const SCHOOL = "숙명여대";
const YEAR = "2019";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-sookmyung-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "도함수", concept: "로그미분(지수가 변수)", difficulty: "easy",
    question: "함수 $f(x)=x^{\\sin x}$에 대하여 $f'\\!\\left(\\dfrac{3\\pi}{2}\\right)$의 값은?",
    options: [o("1","$\\dfrac{4}{9\\pi^2}$"), o("2","$\\dfrac{5}{9\\pi^2}$"), o("3","$-\\dfrac{5}{9\\pi^2}$"), o("4","$-\\dfrac{4}{9\\pi^2}$"), o("5","$-\\dfrac{2}{9\\pi^2}$")],
    answer: 4,
    explanation: "$\\ln f(x)=\\sin x\\cdot\\ln x$. 양변 미분: $\\dfrac{f'(x)}{f(x)}=\\cos x\\cdot\\ln x+\\dfrac{\\sin x}{x}$.\n$x=\\dfrac{3\\pi}{2}$: $f\\!\\left(\\dfrac{3\\pi}{2}\\right)=\\!\\left(\\dfrac{3\\pi}{2}\\right)^{-1}=\\dfrac{2}{3\\pi}$. $\\cos\\dfrac{3\\pi}{2}=0$, $\\sin\\dfrac{3\\pi}{2}=-1$.\n$f'\\!\\left(\\dfrac{3\\pi}{2}\\right)=\\dfrac{2}{3\\pi}\\!\\left(0+\\dfrac{-1}{3\\pi/2}\\right)=\\dfrac{2}{3\\pi}\\cdot\\dfrac{-2}{3\\pi}=-\\dfrac{4}{9\\pi^2}$."
  }),
  build({
    num: 2, subject: "미분학", unit: "극한과 연속", concept: "테일러 급수 극한", difficulty: "easy",
    question: "극한 $\\displaystyle\\lim_{x\\to 0}\\!\\dfrac{x-\\sin^{-1}x}{x^3}$의 값은?",
    options: [o("1","$\\dfrac{1}{6}$"), o("2","$-\\dfrac{1}{6}$"), o("3","$\\dfrac{1}{5}$"), o("4","$-\\dfrac{1}{5}$"), o("5","$\\dfrac{1}{4}$")],
    answer: 2,
    explanation: "$\\sin^{-1}x=x+\\dfrac{x^3}{6}+\\dfrac{3x^5}{40}+\\cdots$.\n$\\dfrac{x-\\sin^{-1}x}{x^3}=\\dfrac{-x^3/6-\\cdots}{x^3}\\to-\\dfrac{1}{6}$."
  }),
  build({
    num: 3, subject: "선형대수", unit: "벡터", concept: "위치 변화량 계산", difficulty: "medium",
    question: "지상 레이더 기지로부터 상공 $1\\,\\text{km}$ 지점을 비행기가 $30°$의 각도로 상승하며 일정한 속력 $300\\,\\text{km/h}$로 지나가고 있다. 그 시점으로부터 $1$분 후, 레이더기지에서 비행기까지의 거리($\\text{km}$)는?",
    options: [o("1","$\\sqrt{27}$"), o("2","$\\sqrt{28}$"), o("3","$\\sqrt{29}$"), o("4","$\\sqrt{30}$"), o("5","$\\sqrt{31}$")],
    answer: 5,
    explanation: "$1$분간 이동거리 $=\\dfrac{300}{60}=5\\,\\text{km}$. 시작점 $(0,1)$에서 $30°$ 상승하여 도착점 $\\!\\left(5\\cos 30°,\\,1+5\\sin 30°\\right)=\\!\\left(\\dfrac{5\\sqrt 3}{2},\\,\\dfrac{7}{2}\\right)$.\n원점 거리 $=\\sqrt{\\dfrac{75}{4}+\\dfrac{49}{4}}=\\sqrt{\\dfrac{124}{4}}=\\sqrt{31}$."
  }),
  build({
    num: 4, subject: "미분학", unit: "미분의 응용", concept: "극값 조건", difficulty: "medium",
    question: "실수 $a,b$에 대하여 함수 $f(x)=axe^{bx^2}$이 최댓값 $f(2)=1$을 갖는다. 이때 $ab$의 값은?",
    options: [o("1","$-\\dfrac{\\sqrt e}{16}$"), o("2","$\\dfrac{\\sqrt e}{17}$"), o("3","$-\\dfrac{\\sqrt e}{18}$"), o("4","$\\dfrac{\\sqrt e}{19}$"), o("5","$-\\dfrac{\\sqrt e}{20}$")],
    answer: 1,
    explanation: "$f(2)=2ae^{4b}=1$. $f'(x)=ae^{bx^2}+2abx^2e^{bx^2}=ae^{bx^2}(1+2bx^2)$.\n$f'(2)=0\\Rightarrow 1+8b=0\\Rightarrow b=-\\dfrac{1}{8}$.\n$2ae^{-1/2}=1\\Rightarrow a=\\dfrac{\\sqrt e}{2}$. $ab=\\dfrac{\\sqrt e}{2}\\cdot\\!\\left(-\\dfrac{1}{8}\\right)=-\\dfrac{\\sqrt e}{16}$."
  }),
  build({
    num: 5, subject: "적분학", unit: "특이적분", concept: "수렴/발산 판정", difficulty: "medium",
    question: "다음 특이적분 중 수렴하는 것을 모두 찾으시오.\n\n(ㄱ) $\\displaystyle\\int_0^{1}\\dfrac{dx}{\\sqrt{x+x^3}}$  (ㄴ) $\\displaystyle\\int_1^{2}\\dfrac{dx}{x\\ln x}$  (ㄷ) $\\displaystyle\\int_2^{\\infty}\\dfrac{1}{x^2-x}\\,dx$",
    options: [o("1","(ㄱ),(ㄴ)"), o("2","(ㄱ),(ㄷ)"), o("3","(ㄴ),(ㄷ)"), o("4","(ㄱ),(ㄴ),(ㄷ)"), o("5","없음")],
    answer: 2,
    explanation: "(ㄱ) $\\!\\int_0^1\\dfrac{dx}{\\sqrt{x(1+x^2)}}\\approx\\!\\int_0^1\\dfrac{dx}{\\sqrt x}$, $p=1/2<1$. 수렴.\n(ㄴ) $\\ln x=t$ 치환: $\\!\\int_0^{\\ln 2}\\dfrac{dt}{t}$, $t=0$ 특이점. $p=1$. 발산.\n(ㄷ) $\\!\\int_2^{\\infty}\\dfrac{1}{x^2-x}\\,dx\\approx\\!\\int_2^{\\infty}\\dfrac{1}{x^2}\\,dx$, 수렴.\n수렴: (ㄱ), (ㄷ)."
  }),
  build({
    num: 6, subject: "적분학", unit: "정적분", concept: "삼각치환", difficulty: "medium",
    question: "적분 $\\displaystyle\\int_{1/2}^{1}\\dfrac{dx}{x^2\\sqrt{4x^2-1}}$의 값은?",
    options: [o("1","$\\sqrt 2$"), o("2","$2$"), o("3","$\\sqrt 3$"), o("4","$3$"), o("5","$\\sqrt 5$")],
    answer: 3,
    explanation: "$x=\\dfrac{1}{2}\\sec\\theta$ 치환: $dx=\\dfrac{1}{2}\\sec\\theta\\tan\\theta\\,d\\theta$. 구간 $\\theta:0\\to\\pi/3$.\n$x^2=\\dfrac{1}{4}\\sec^2\\theta,\\,\\sqrt{4x^2-1}=\\tan\\theta$.\n$\\displaystyle\\!\\int_0^{\\pi/3}\\!\\dfrac{(1/2)\\sec\\theta\\tan\\theta}{(1/4)\\sec^2\\theta\\cdot\\tan\\theta}d\\theta=2\\!\\int_0^{\\pi/3}\\!\\cos\\theta\\,d\\theta=2\\sin(\\pi/3)=\\sqrt 3$."
  }),
  build({
    num: 7, subject: "적분학", unit: "특이적분", concept: "부분분수·역삼각함수", difficulty: "medium",
    question: "적분 $\\displaystyle\\int_0^{\\infty}\\dfrac{dx}{(x+1)(x^2+1)}$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{2}$"), o("2","$\\dfrac{\\pi}{3}$"), o("3","$\\dfrac{\\pi}{4}$"), o("4","$\\dfrac{\\pi}{5}$"), o("5","$\\dfrac{\\pi}{6}$")],
    answer: 3,
    explanation: "부분분수: $\\dfrac{1}{(x+1)(x^2+1)}=\\dfrac{1}{2}\\!\\left(\\dfrac{1}{x+1}-\\dfrac{x}{x^2+1}+\\dfrac{1}{x^2+1}\\right)$.\n$\\displaystyle\\!\\int_0^{\\infty}\\cdots=\\dfrac{1}{2}\\!\\left[\\ln\\dfrac{x+1}{\\sqrt{x^2+1}}+\\tan^{-1}x\\right]_0^{\\infty}=\\dfrac{1}{2}\\!\\left(0+\\dfrac{\\pi}{2}\\right)=\\dfrac{\\pi}{4}$."
  }),
  build({
    num: 8, subject: "적분학", unit: "정적분", concept: "대칭 치환", difficulty: "medium",
    question: "$f$가 $[0,1]$에서 연속함수일 때, 적분 $\\displaystyle\\int_0^{1}\\!\\dfrac{\\sin x}{\\sin x+\\sin(1-x)}\\,dx$의 값은?",
    options: [o("1","$\\dfrac{3}{2}$"), o("2","$\\dfrac{5}{4}$"), o("3","$1$"), o("4","$\\dfrac{3}{4}$"), o("5","$\\dfrac{1}{2}$")],
    answer: 5,
    explanation: "$A=\\!\\int_0^1\\!\\dfrac{\\sin x}{\\sin x+\\sin(1-x)}\\,dx$. $1-x=t$ 치환: $A=\\!\\int_0^1\\!\\dfrac{\\sin(1-t)}{\\sin(1-t)+\\sin t}\\,dt$.\n두 식을 더하면 $2A=\\!\\int_0^1 1\\,dx=1\\Rightarrow A=\\dfrac{1}{2}$."
  }),
  build({
    num: 9, subject: "적분학", unit: "정적분의 응용", concept: "곡선의 길이", difficulty: "easy",
    question: "곡선 $y=\\displaystyle\\int_1^{x}\\!\\sqrt{\\sqrt t-1}\\,dt$ ($1\\le x\\le 16$)의 길이는?",
    options: [o("1","$\\dfrac{118}{5}$"), o("2","$\\dfrac{120}{5}$"), o("3","$\\dfrac{122}{5}$"), o("4","$\\dfrac{124}{5}$"), o("5","$\\dfrac{126}{5}$")],
    answer: 4,
    explanation: "$y'=\\sqrt{\\sqrt x-1}$. $1+(y')^2=\\sqrt x$. $\\sqrt{1+(y')^2}=x^{1/4}$.\n$L=\\!\\int_1^{16}x^{1/4}\\,dx=\\dfrac{4}{5}[x^{5/4}]_1^{16}=\\dfrac{4}{5}(32-1)=\\dfrac{124}{5}$."
  }),
  build({
    num: 10, subject: "적분학", unit: "정적분의 응용", concept: "회전곡면 넓이(이격축)", difficulty: "medium",
    question: "반원 $x^2+y^2=1$ ($y\\ge 0$)을 직선 $y=1$로 회전시켜 얻은 곡면의 겉넓이는?",
    options: [o("1","$2\\pi(\\pi-2)$"), o("2","$2\\pi(\\pi-3)$"), o("3","$2\\pi(\\pi+2)$"), o("4","$2\\pi(\\pi+3)$"), o("5","$2\\pi(\\pi+4)$")],
    answer: 1,
    explanation: "회전축 $y=1$까지 거리 $=1-\\sqrt{1-x^2}\\ge 0$. $\\sqrt{1+(y')^2}=\\dfrac{1}{\\sqrt{1-x^2}}$.\n$\\displaystyle S=2\\pi\\!\\int_{-1}^{1}(1-\\sqrt{1-x^2})\\cdot\\dfrac{1}{\\sqrt{1-x^2}}\\,dx=4\\pi\\!\\int_0^1\\!\\left(\\dfrac{1}{\\sqrt{1-x^2}}-1\\right)dx$\n$=4\\pi[\\sin^{-1}x-x]_0^1=4\\pi(\\pi/2-1)=2\\pi(\\pi-2)$."
  }),
  build({
    num: 11, subject: "미분학", unit: "도함수", concept: "쌍곡선함수 접선", difficulty: "medium",
    question: "곡선 $y=\\cosh x$ 위의 점들 중 접선의 기울기가 $1$인 점은?",
    options: [o("1","$(\\ln\\sqrt 2,\\,1)$"), o("2","$(\\ln(1+\\sqrt 2),\\,\\sqrt 2)$"), o("3","$(\\ln(1+\\sqrt 3),\\,\\sqrt 3)$"), o("4","$(\\ln 3,\\,2)$"), o("5","$(\\ln(1+\\sqrt 5),\\,\\sqrt 5)$")],
    answer: 2,
    explanation: "$y'=\\sinh x=1\\Rightarrow x=\\sinh^{-1}1=\\ln(1+\\sqrt 2)$.\n$\\cosh^2 x-\\sinh^2 x=1\\Rightarrow\\cosh x=\\sqrt 2$ ($>0$).\n점: $(\\ln(1+\\sqrt 2),\\,\\sqrt 2)$."
  }),
  build({
    num: 12, subject: "적분학", unit: "정적분", concept: "변수상한·절댓값", difficulty: "medium",
    question: "연속함수 $f$에 대하여 $g(x)=\\displaystyle\\int_{-1}^{1}\\!f(t)|x-t|\\,dt$라 하자. $-1<x<1$일 때 $g''(x)$의 값은?",
    options: [o("1","$2f(x)$"), o("2","$\\dfrac{5}{2}f(x)$"), o("3","$3f(x)$"), o("4","$\\dfrac{7}{2}f(x)$"), o("5","$4f(x)$")],
    answer: 1,
    explanation: "$g(x)=\\!\\int_{-1}^{x}\\!f(t)(x-t)\\,dt+\\!\\int_{x}^{1}\\!f(t)(t-x)\\,dt$.\n$g'(x)=\\!\\int_{-1}^x f(t)\\,dt-\\!\\int_x^1 f(t)\\,dt$ (경계항은 상쇄).\n$g''(x)=f(x)+f(x)=2f(x)$."
  }),
  build({
    num: 13, subject: "미분학", unit: "미분의 응용", concept: "임계점 없을 조건", difficulty: "hard",
    question: "함수 $f(x)=(a^2+a-6)\\cos 2x+(a-2)x+\\cos 1$이 임계점이 없을 때 $a$의 범위는?",
    options: [o("1","$\\dfrac{1}{2}<a<\\dfrac{3}{2}$"), o("2","$-\\dfrac{1}{2}<a<\\dfrac{1}{2}$"), o("3","$-\\dfrac{3}{2}<a<-\\dfrac{1}{2}$"), o("4","$-\\dfrac{5}{2}<a<-\\dfrac{3}{2}$"), o("5","$-\\dfrac{7}{2}<a<-\\dfrac{5}{2}$")],
    answer: 5,
    explanation: "$f'(x)=(a^2+a-6)\\cdot(-2\\sin 2x)+(a-2)=(a+3)(a-2)(-2\\sin 2x)+(a-2)\\ne 0$.\n$a\\ne 2,-3$일 때 $\\sin 2x\\ne\\dfrac{1}{2(a+3)}$이어야 모든 $x$에서. $\\!\\left|\\dfrac{1}{2(a+3)}\\right|>1\\Rightarrow|a+3|<\\dfrac{1}{2}\\Rightarrow-\\dfrac{7}{2}<a<-\\dfrac{5}{2}$ 또는 $-\\dfrac{5}{2}<a<-\\dfrac{3}{2}$... 범위 정리하면 $-\\dfrac{7}{2}<a<-\\dfrac{5}{2}$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "다중적분", concept: "극좌표 영역 넓이", difficulty: "easy",
    question: "곡선 $r(\\theta)=2\\cos 3\\theta$ ($0\\le\\theta\\le 2\\pi$)으로 둘러싸인 영역의 넓이는?",
    options: [o("1","$\\dfrac{\\pi}{3}$"), o("2","$\\dfrac{\\pi}{2}$"), o("3","$\\dfrac{2\\pi}{3}$"), o("4","$\\pi$"), o("5","$\\dfrac{3\\pi}{2}$")],
    answer: 4,
    explanation: "$r=a\\cos(3\\theta)$ ($a=2$)는 3-꽃잎 장미. 면적 공식 $=\\dfrac{\\pi a^2}{4}=\\dfrac{4\\pi}{4}=\\pi$."
  }),
  build({
    num: 15, subject: "미분학", unit: "도함수", concept: "매개변수 접선", difficulty: "easy",
    question: "곡선 $x=3\\sin\\theta-4,\\,y=5+2\\cos\\theta$ ($0\\le\\theta\\le 2\\pi$) 위에 있는 $\\theta=\\dfrac{5\\pi}{4}$일 때의 점에서의 접선의 방정식은?",
    options: [o("1","$y=-\\dfrac{2}{3}x-2\\sqrt 2+\\dfrac{7}{3}$"), o("2","$y=-\\dfrac{2}{3}x-\\sqrt 2+\\dfrac{5}{3}$"), o("3","$y=-\\dfrac{1}{3}x-\\sqrt 2+\\dfrac{4}{3}$"), o("4","$y=\\dfrac{2}{3}x-2\\sqrt 2+\\dfrac{2}{3}$"), o("5","$y=\\dfrac{2}{3}x-2\\sqrt 2+\\dfrac{1}{3}$")],
    answer: 1,
    explanation: "$\\theta=5\\pi/4$: $x=-\\dfrac{3\\sqrt 2}{2}-4,\\,y=5-\\sqrt 2$.\n$\\dfrac{dy}{dx}=\\dfrac{-2\\sin\\theta}{3\\cos\\theta}|_{5\\pi/4}=\\dfrac{-2\\cdot(-\\sqrt 2/2)}{3\\cdot(-\\sqrt 2/2)}=-\\dfrac{2}{3}$.\n접선: $y=-\\dfrac{2}{3}x-2\\sqrt 2+\\dfrac{7}{3}$."
  }),
  build({
    num: 16, subject: "선형대수", unit: "벡터", concept: "벡터사영", difficulty: "easy",
    question: "벡터 $2\\mathbf i-\\mathbf j+2\\mathbf k$의 벡터 $-2\\mathbf i-2\\mathbf j+2\\mathbf k$ 위로의 벡터사영(vector projection)은?",
    options: [o("1","$\\!\\left(-\\dfrac{1}{3},\\dfrac{2}{3},\\dfrac{1}{3}\\right)$"), o("2","$\\!\\left(-\\dfrac{1}{3},\\dfrac{2}{3},-\\dfrac{1}{3}\\right)$"), o("3","$\\!\\left(-\\dfrac{1}{3},-\\dfrac{1}{3},\\dfrac{1}{3}\\right)$"), o("4","$\\!\\left(-\\dfrac{1}{3},-\\dfrac{2}{3},\\dfrac{1}{3}\\right)$"), o("5","$\\!\\left(-\\dfrac{1}{3},-\\dfrac{1}{3},\\dfrac{2}{3}\\right)$")],
    answer: 3,
    explanation: "$\\text{proj}_{\\mathbf v}\\mathbf u=\\dfrac{\\mathbf u\\cdot\\mathbf v}{\\mathbf v\\cdot\\mathbf v}\\mathbf v$.\n$\\mathbf u\\cdot\\mathbf v=(2)(-2)+(-1)(-2)+(2)(2)=-4+2+4=2$. $\\mathbf v\\cdot\\mathbf v=4+4+4=12$.\n$\\text{proj}=\\dfrac{2}{12}(-2,-2,2)=\\!\\left(-\\dfrac{1}{3},-\\dfrac{1}{3},\\dfrac{1}{3}\\right)$."
  }),
  build({
    num: 17, subject: "적분학", unit: "급수", concept: "수렴반경", difficulty: "easy",
    question: "멱급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(x-5)^n}{n2^n}$이 절대수렴하는 $x$의 범위가 $a<x<b$일 때 $a+b$의 값은?",
    options: [o("1","$8$"), o("2","$9$"), o("3","$10$"), o("4","$11$"), o("5","$12$")],
    answer: 3,
    explanation: "수렴반경 $R=2$ (비율판정). $|x-5|<2\\Rightarrow 3<x<7$.\n$a+b=3+7=10$."
  }),
  build({
    num: 18, subject: "적분학", unit: "급수", concept: "Maclaurin 급수 계수", difficulty: "medium",
    question: "$\\ln(\\cos x)$의 Maclaurin 급수의 계수 중 $x^2$의 계수와 $x^3$의 계수의 합은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$-\\dfrac{1}{2}$"), o("3","$\\dfrac{3}{2}$"), o("4","$-\\dfrac{3}{2}$"), o("5","$\\dfrac{5}{2}$")],
    answer: 2,
    explanation: "$\\cos x=1-\\dfrac{x^2}{2}+\\dfrac{x^4}{24}-\\cdots$, $\\ln(\\cos x)=\\ln\\!\\left(1+\\!\\left(-\\dfrac{x^2}{2}+\\cdots\\right)\\right)$.\n$\\ln(1+u)=u-\\dfrac{u^2}{2}+\\cdots$. $x^2$의 계수: $-\\dfrac{1}{2}$. $x^3$의 계수: $0$.\n합 $=-\\dfrac{1}{2}+0=-\\dfrac{1}{2}$."
  }),
  build({
    num: 19, subject: "다변수함수", unit: "편도함수", concept: "교선 포함 평면", difficulty: "medium",
    question: "두 평면 $x+y-2z=6$과 $2x-y+z=2$의 교선을 포함하고 점 $(-2,0,1)$을 지나는 평면의 방정식을 $ax+by+cz=-2$라 할 때 $a+b+c$의 값은?",
    options: [o("1","$2$"), o("2","$3$"), o("3","$4$"), o("4","$5$"), o("5","$6$")],
    answer: 3,
    explanation: "$(x+y-2z-6)+k(2x-y+z-2)=0$에 $(-2,0,1)$ 대입: $(-2+0-2-6)+k(-4+0+1-2)=0\\Rightarrow -10-5k=0\\Rightarrow k=-2$.\n식: $(x+y-2z-6)-2(2x-y+z-2)=0\\Rightarrow-3x+3y-4z=2\\Rightarrow 3x-3y+4z=-2$.\n$a=3,b=-3,c=4$, $a+b+c=4$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "편도함수", concept: "방향도함수 최댓값", difficulty: "easy",
    question: "$f(x,y,z)=5x^2-3xy+xyz$일 때 점 $(1,1,1)$에서 방향도함수의 최댓값은?",
    options: [o("1","$\\sqrt{65}$"), o("2","$\\sqrt{66}$"), o("3","$\\sqrt{67}$"), o("4","$\\sqrt{68}$"), o("5","$\\sqrt{69}$")],
    answer: 5,
    explanation: "$\\nabla f=(10x-3y+yz,\\,-3x+xz,\\,xy)|_{(1,1,1)}=(8,-2,1)$.\n최댓값 $=|\\nabla f|=\\sqrt{64+4+1}=\\sqrt{69}$."
  }),
  build({
    num: 21, subject: "다변수함수", unit: "편도함수", concept: "두 곡면 교선 접선벡터", difficulty: "medium",
    question: "두 곡면 $z=x^2-y^2$과 $xyz+30=0$이 만나는 곡선 위의 점 $(-3,2,5)$에서의 접선 벡터는?",
    options: [o("1","$(9,-46,130)$"), o("2","$(8,45,132)$"), o("3","$(7,-44,134)$"), o("4","$(6,43,136)$"), o("5","$(5,-42,138)$")],
    answer: 1,
    explanation: "$f:x^2-y^2-z=0,\\,g:xyz+30=0$.\n$\\nabla f=(2x,-2y,-1)|_{(-3,2,5)}=(-6,-4,-1)$.\n$\\nabla g=(yz,xz,xy)|_{(-3,2,5)}=(10,-15,-6)$.\n접선벡터 $=\\nabla f\\times\\nabla g=\\!\\begin{vmatrix}\\mathbf i&\\mathbf j&\\mathbf k\\\\-6&-4&-1\\\\10&-15&-6\\end{vmatrix}=(9,-46,130)$."
  }),
  build({
    num: 22, subject: "다변수함수", unit: "다중적분", concept: "구면좌표 부피", difficulty: "medium",
    question: "곡면 $x^2+y^2+z^2=1$의 내부와 곡면 $z=\\sqrt{x^2+y^2}$의 내부에 있는 공통영역의 부피는?",
    options: [o("1","$2\\pi\\!\\left(1-\\dfrac{\\sqrt 2}{2}\\right)$"), o("2","$\\dfrac{5\\pi}{3}\\!\\left(1-\\dfrac{\\sqrt 2}{2}\\right)$"), o("3","$\\dfrac{4\\pi}{3}\\!\\left(1-\\dfrac{\\sqrt 2}{2}\\right)$"), o("4","$\\pi\\!\\left(1-\\dfrac{\\sqrt 2}{2}\\right)$"), o("5","$\\dfrac{2\\pi}{3}\\!\\left(1-\\dfrac{\\sqrt 2}{2}\\right)$")],
    answer: 5,
    explanation: "구면좌표 $0\\le\\rho\\le 1,\\,0\\le\\varphi\\le\\pi/4,\\,0\\le\\theta\\le 2\\pi$ (원뿔 $z=\\sqrt{x^2+y^2}$ 위쪽).\n$V=\\!\\int_0^{2\\pi}\\!\\int_0^{\\pi/4}\\!\\int_0^1\\!\\rho^2\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta=2\\pi\\cdot\\dfrac{1}{3}\\cdot[-\\cos\\varphi]_0^{\\pi/4}=\\dfrac{2\\pi}{3}\\!\\left(1-\\dfrac{\\sqrt 2}{2}\\right)$."
  }),
  build({
    num: 23, subject: "다변수함수", unit: "벡터해석", concept: "보존벡터장 선적분", difficulty: "easy",
    question: "곡선 $C:x(t)=\\cos t,\\,y(t)=\\sin t,\\,0\\le t\\le\\pi/2$ 위의 물체를 벡터장 $\\mathbf F(x,y)=y^2\\mathbf i+(2xy-e^y)\\mathbf j$으로 움직일 때 한 일은?",
    options: [o("1","$1+e$"), o("2","$1-e$"), o("3","$2+e$"), o("4","$2-e$"), o("5","$3+e$")],
    answer: 2,
    explanation: "$\\mathbf F=\\nabla(xy^2-e^y)$ (보존). 일 $=[xy^2-e^y]_{(1,0)}^{(0,1)}=(0-e)-(0-1)=1-e$."
  }),
  build({
    num: 24, subject: "다변수함수", unit: "다변수함수의 극값", concept: "최대수익 임계점", difficulty: "easy",
    question: "함수 $P(x,y)=-3x^2-2y^2+4x+2y-2xy+20$이 TV와 신문을 통한 광고로부터 얻는 연간이익이다. 회사가 연간 최대 이익을 내는 $x,y$값을 각각 $a,b$라 할 때 $a+b$의 값은?",
    options: [o("1","$\\dfrac{2}{5}$"), o("2","$\\dfrac{3}{5}$"), o("3","$\\dfrac{4}{5}$"), o("4","$1$"), o("5","$\\dfrac{6}{5}$")],
    answer: 3,
    explanation: "$P_x=-6x+4-2y=0,\\,P_y=-4y+2-2x=0$. 풀면 $(x,y)=\\!\\left(\\dfrac{3}{5},\\dfrac{1}{5}\\right)$.\n$a+b=\\dfrac{4}{5}$."
  }),
  build({
    num: 25, subject: "다변수함수", unit: "벡터해석", concept: "공간곡선의 곡률", difficulty: "medium",
    question: "곡선 $\\mathbf r(t)=(\\sin t\\cos t)\\mathbf i+(\\sin^2 t)\\mathbf j+(\\cos t)\\mathbf k$에서 $t=0$일 때의 곡률은?",
    options: [o("1","$\\sqrt 2$"), o("2","$\\sqrt 3$"), o("3","$2$"), o("4","$\\sqrt 5$"), o("5","$\\sqrt 6$")],
    answer: 4,
    explanation: "$\\mathbf r(t)=\\!\\left(\\dfrac{1}{2}\\sin 2t,\\sin^2 t,\\cos t\\right)$. $\\mathbf r'(t)=(\\cos 2t,\\sin 2t,-\\sin t)|_{t=0}=(1,0,0)$.\n$\\mathbf r''(t)=(-2\\sin 2t,2\\cos 2t,-\\cos t)|_{t=0}=(0,2,-1)$.\n$\\mathbf r'\\times\\mathbf r''=(0,1,2)$. $|\\mathbf r'|=1$.\n$\\kappa=\\dfrac{|\\mathbf r'\\times\\mathbf r''|}{|\\mathbf r'|^3}=\\dfrac{\\sqrt 5}{1}=\\sqrt 5$."
  })
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (2019 숙명여대):`, data.map((d) => d.id).join(", "));
