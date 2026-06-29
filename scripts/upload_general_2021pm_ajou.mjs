// Upload 2021년도 아주대 편입수학(오후) 기출 25문항 (5지선다, 문제 26~50)
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
const YEAR = "2021pm";
const YEAR_TAG = "2021";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-ajou-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR_TAG, "오후", subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 26, subject: "미분학", unit: "극한과 연속", concept: "극한의 성질·정의 검증", difficulty: "medium",
    question: "다음 중 옳지 $\\mathbf{않은}$ 것을 고르라.\n\n(1) 실수 전체에서 연속인 함수 $f$에 대하여 $f(1)=1$이면 $\\displaystyle\\lim_{x\\to 1}\\ln(f(x))=0$이다.\n(2) $\\displaystyle\\lim_{x\\to\\infty}\\tan^{-1}x=\\dfrac{\\pi}{2}$\n(3) $\\displaystyle\\lim_{x\\to 1}(\\sin x)^{-1}=\\dfrac{\\pi}{2}$\n(4) 모든 실수 $x$에 대하여 $\\tan(\\tan^{-1}x)=x$가 성립한다.\n(5) $0<x<\\dfrac{\\pi}{2}$이면 $\\sin x>\\sin^2 x$가 성립한다.",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)"), o("5","(5)")],
    answer: 3,
    explanation: "(1) $f$가 연속, $f(1)=1$이면 $\\ln(f(1))=\\ln 1=0$. 참.\n(2) $\\tan^{-1}$의 점근값. 참.\n(3) $\\displaystyle\\lim_{x\\to 1}\\dfrac{1}{\\sin x}=\\dfrac{1}{\\sin 1}\\ne\\dfrac{\\pi}{2}$. 거짓.\n(4) $\\tan^{-1}$의 치역이 $(-\\pi/2,\\pi/2)$이고 $\\tan$이 이 구간의 단조이므로 합성은 항등. 참.\n(5) $0<x<\\pi/2$에서 $0<\\sin x<1$이므로 $\\sin x>\\sin^2 x$. 참."
  }),
  build({
    num: 27, subject: "미분학", unit: "역삼각함수", concept: "$\\sin(\\cos^{-1}\\cdot)$", difficulty: "easy",
    question: "$\\sin\\!\\left(\\cos^{-1}\\!\\left(-\\dfrac{1}{3}\\right)\\right)$의 값은?",
    options: [o("1","$-\\dfrac{2\\sqrt 2}{3}$"), o("2","$-\\dfrac{\\sqrt 2}{3}$"), o("3","$-\\dfrac{1}{3}$"), o("4","$\\dfrac{\\sqrt 2}{3}$"), o("5","$\\dfrac{2\\sqrt 2}{3}$")],
    answer: 5,
    explanation: "$\\cos^{-1}\\!\\left(-\\dfrac{1}{3}\\right)=\\alpha$라 하면 $\\alpha\\in[0,\\pi]$이고 $\\cos\\alpha=-\\dfrac{1}{3}$. $\\sin\\alpha\\ge 0$이므로 $\\sin\\alpha=\\sqrt{1-\\dfrac{1}{9}}=\\sqrt{\\dfrac{8}{9}}=\\dfrac{2\\sqrt 2}{3}$."
  }),
  build({
    num: 28, subject: "미분학", unit: "극한과 연속", concept: "$e^{\\cdot}$ 꼴 극한", difficulty: "medium",
    question: "다음 극한 $\\displaystyle\\lim_{n\\to\\infty}\\!\\left(1-\\sin\\!\\dfrac{1}{3n}\\right)^{\\!2n}$의 값은?",
    options: [o("1","발산"), o("2","$e^{-2/3}$"), o("3","$e^{2/3}$"), o("4","$e^{-3/2}$"), o("5","$e^{3/2}$")],
    answer: 2,
    explanation: "$\\dfrac{1}{3n}=x$로 치환하면 $n=\\dfrac{1}{3x}$, $n\\to\\infty\\Leftrightarrow x\\to 0^+$.\n$(1-\\sin x)^{2/(3x)}=\\!\\left[(1+(-\\sin x))^{-1/\\sin x}\\right]^{-\\sin x\\cdot\\frac{2}{3x}}$.\n안쪽 $\\to e$, 지수 $\\to-\\dfrac{2}{3}\\cdot 1=-\\dfrac{2}{3}$.\n극한 $=e^{-2/3}$."
  }),
  build({
    num: 29, subject: "미분학", unit: "도함수", concept: "음함수 2계 미분", difficulty: "medium",
    question: "곡선 $x^4+y^2=4$ 위의 점 $(-1,\\sqrt 3)$에서 $\\dfrac{d^2y}{dx^2}$의 값은?",
    options: [o("1","$-\\dfrac{22}{3\\sqrt 3}$"), o("2","$-22\\sqrt 3$"), o("3","$0$"), o("4","$22\\sqrt 3$"), o("5","$\\dfrac{22}{3\\sqrt 3}$")],
    answer: 1,
    explanation: "음함수 미분: $4x^3+2y\\,y'=0\\Rightarrow y'=-\\dfrac{2x^3}{y}$.\n$(-1,\\sqrt 3)$에서 $y'=-\\dfrac{-2}{\\sqrt 3}=\\dfrac{2}{\\sqrt 3}$.\n2계 미분: $y''=\\dfrac{d}{dx}\\!\\left(-\\dfrac{2x^3}{y}\\right)=-\\dfrac{6x^2 y-2x^3 y'}{y^2}=\\dfrac{-6x^2 y+2x^3 y'}{y^2}$.\n대입: 분자 $=-6\\cdot 1\\cdot\\sqrt 3+2\\cdot(-1)\\cdot\\dfrac{2}{\\sqrt 3}=-6\\sqrt 3-\\dfrac{4}{\\sqrt 3}=-\\dfrac{18\\sqrt 3+4\\sqrt 3}{3}\\cdot\\ldots$\n정리: $-6\\sqrt 3-\\dfrac{4}{\\sqrt 3}=-\\dfrac{18+4}{\\sqrt 3}=-\\dfrac{22}{\\sqrt 3}$.\n분모 $y^2=3$. $\\therefore y''=-\\dfrac{22}{3\\sqrt 3}$."
  }),
  build({
    num: 30, subject: "다변수함수", unit: "편도함수", concept: "두 곡면 교선의 접선", difficulty: "medium",
    question: "두 곡면 $S_1:\\,\\dfrac{x^2}{4}+y^2-\\dfrac{z}{2}=1$, $S_2:\\,x^2+y^2+z^2=9$의 교선을 $C$라 할 때, 곡선 $C$ 위의 점 $(2,1,2)$에서의 접선을 매개변수 방정식으로 옳게 표현한 것은? (단, $t$는 실수)\n\n(1) $\\begin{cases}x=2+t\\\\ y=1+2t\\\\ z=2-t\\end{cases}$\n(2) $\\begin{cases}x=2-t\\\\ y=1+2t\\\\ z=2-t\\end{cases}$\n(3) $\\begin{cases}x=2+3t\\\\ y=1+2t\\\\ z=2-2t\\end{cases}$\n(4) $\\begin{cases}x=2+3t\\\\ y=1-2t\\\\ z=2-2t\\end{cases}$\n(5) $\\begin{cases}x=2+2t\\\\ y=1+t\\\\ z=2-2t\\end{cases}$",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)"), o("5","(5)")],
    answer: 4,
    explanation: "접선의 방향벡터 $=\\nabla S_1\\times\\nabla S_2$ at $(2,1,2)$.\n$\\nabla S_1=\\!\\left(\\dfrac{x}{2},2y,-\\dfrac{1}{2}\\right)\\!|_{(2,1,2)}=(1,2,-\\tfrac{1}{2})$, $\\nabla S_2=(2x,2y,2z)|_{(2,1,2)}=(4,2,4)\\parallel(2,1,2)$.\n$(1,2,-\\tfrac{1}{2})\\times(2,1,2)=(2\\cdot 2-(-\\tfrac{1}{2})\\cdot 1,\\,-(1\\cdot 2-(-\\tfrac{1}{2})\\cdot 2),\\,1\\cdot 1-2\\cdot 2)=(\\tfrac{9}{2},-3,-3)\\parallel(3,-2,-2)$.\n$\\therefore\\,x=2+3t,\\,y=1-2t,\\,z=2-2t$."
  }),
  build({
    num: 31, subject: "적분학", unit: "정적분의 응용", concept: "회전곡면의 넓이", difficulty: "medium",
    question: "곡선 $y=2\\sqrt{x}$ ($3\\le x\\le 8$)를 $x$축 주위로 회전하여 얻은 곡면의 넓이는?",
    options: [o("1","$\\dfrac{76\\pi}{5}$"), o("2","$\\dfrac{152\\pi}{5}$"), o("3","$\\dfrac{76\\pi}{3}$"), o("4","$\\dfrac{152\\pi}{3}$"), o("5","$38\\pi$")],
    answer: 4,
    explanation: "$\\dfrac{dy}{dx}=\\dfrac{1}{\\sqrt x}$이므로 $1+(y')^2=\\dfrac{x+1}{x}$, $\\sqrt{1+(y')^2}=\\dfrac{\\sqrt{x+1}}{\\sqrt x}$.\n$\\displaystyle S=2\\pi\\!\\int_3^8 y\\cdot\\dfrac{\\sqrt{x+1}}{\\sqrt x}\\,dx=2\\pi\\!\\int_3^8 2\\sqrt x\\cdot\\dfrac{\\sqrt{x+1}}{\\sqrt x}\\,dx=4\\pi\\!\\int_3^8\\!\\sqrt{x+1}\\,dx$.\n$=4\\pi\\cdot\\dfrac{2}{3}[(x+1)^{3/2}]_3^8=\\dfrac{8\\pi}{3}(27-8)=\\dfrac{152\\pi}{3}$."
  }),
  build({
    num: 32, subject: "적분학", unit: "급수", concept: "수렴 성질·반례", difficulty: "hard",
    question: "다음 보기의 내용 중 옳은 것은 모두 몇 개인가?\n\n가. 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}a_n$이 수렴하면 $\\displaystyle\\sum_{n=1}^{\\infty}(-1)^n a_n$은 수렴한다.\n나. 무한급수 $\\displaystyle\\sum_{n=1}^{\\infty}(-1)^n a_n$이 수렴하면 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{a_n}{n\\sqrt n}$은 수렴한다.\n다. 멱급수 $\\displaystyle\\sum_{n=0}^{\\infty}a_n x^n$의 수렴 반경이 $2$ 이상이면 무한급수 $\\displaystyle\\sum_{n=0}^{\\infty}(-2)^n a_n$은 수렴한다.\n라. 무한급수 $\\displaystyle\\sum_{n=0}^{\\infty}(-2)^n a_n$이 수렴하면 멱급수 $\\displaystyle\\sum_{n=0}^{\\infty}a_n x^n$의 수렴 반경은 $2$ 이하이다.",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개"), o("5","$4$개")],
    answer: 2,
    explanation: "가. [거짓] 반례 $a_n=\\dfrac{(-1)^n}{n}$: $\\sum a_n$ 수렴(교대), $\\sum(-1)^n a_n=\\sum\\dfrac{1}{n}$ 발산.\n나. [참] $b_n=(-1)^n a_n$, $\\sum b_n$ 수렴(즉 유계). $\\sum\\dfrac{a_n}{n\\sqrt n}=\\sum\\dfrac{(-1)^n b_n}{n\\sqrt n}$이고 $\\sum\\dfrac{1}{n\\sqrt n}$이 절대수렴(p=3/2)이므로 디리클레/아벨 판정으로 수렴.\n다. [거짓] 반경이 정확히 $2$일 때 경계점 $x=-2$에서 수렴이 보장되지 않는다.\n라. [거짓] $|-2|<R$이어야 수렴이 보장되므로 $R\\ge 2$ (이상). 답은 1개."
  }),
  build({
    num: 33, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피(원주껍질, 이격축)", difficulty: "medium",
    question: "곡선 $y=\\sqrt x$와 $y=\\dfrac{x}{2}$로 둘러싸인 영역을 직선 $x=-1$을 축으로 회전하여 얻은 입체의 부피는?",
    options: [o("1","$\\dfrac{16}{5}\\pi$"), o("2","$\\dfrac{64}{5}\\pi$"), o("3","$\\dfrac{104}{15}\\pi$"), o("4","$\\dfrac{128}{15}\\pi$"), o("5","$\\dfrac{64}{5}\\pi$")],
    answer: 3,
    explanation: "교점: $\\sqrt x=\\dfrac{x}{2}\\Rightarrow x=0,4$.\n원주껍질법(축 $x=-1$): 껍질 반지름 $x-(-1)=x+1$.\n$\\displaystyle V=2\\pi\\!\\int_0^4(x+1)\\!\\left(\\sqrt x-\\dfrac{x}{2}\\right)dx=2\\pi\\!\\int_0^4\\!\\left(x^{3/2}+x^{1/2}-\\dfrac{x^2}{2}-\\dfrac{x}{2}\\right)dx$\n$=2\\pi\\!\\left[\\dfrac{2}{5}x^{5/2}+\\dfrac{2}{3}x^{3/2}-\\dfrac{x^3}{6}-\\dfrac{x^2}{4}\\right]_0^4=2\\pi\\!\\left(\\dfrac{64}{5}+\\dfrac{16}{3}-\\dfrac{32}{3}-4\\right)$\n$=2\\pi\\!\\left(\\dfrac{192-80-60}{15}\\right)=2\\pi\\cdot\\dfrac{52}{15}=\\dfrac{104\\pi}{15}$."
  }),
  build({
    num: 34, subject: "적분학", unit: "급수", concept: "교대급수·p-급수 비교", difficulty: "medium",
    question: "수열 $\\!\\left\\{a_n=(-1)^n\\dfrac{1}{(\\ln(n+1))^{1/3}}\\right\\}$에 대하여 보기에서 수렴하는 것은 모두 몇 개인가?\n\n가. $\\displaystyle\\sum_{n=1}^{\\infty}a_n$  나. $\\displaystyle\\sum_{n=1}^{\\infty}a_n^2$  다. $\\displaystyle\\sum_{n=1}^{\\infty}n\\,a_n^3$  라. $\\displaystyle\\sum_{n=1}^{\\infty}(-1)^n a_n^{2021}$",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개"), o("5","$4$개")],
    answer: 2,
    explanation: "가. 교대급수: $|a_n|=\\dfrac{1}{(\\ln(n+1))^{1/3}}\\to 0$, 단조감소. 수렴.\n나. $\\sum\\dfrac{1}{(\\ln(n+1))^{2/3}}$: $\\dfrac{1}{(\\ln n)^p}>\\dfrac{1}{n}$ (큰 $n$에서)이므로 발산.\n다. $\\sum n\\,a_n^3=\\sum\\dfrac{(-1)^n n}{\\ln(n+1)}$: 일반항이 $\\to\\infty$이므로 발산.\n라. $\\sum(-1)^n a_n^{2021}$: $a_n^{2021}=\\dfrac{(-1)^{2021n}}{(\\ln(n+1))^{2021/3}}=\\dfrac{(-1)^n}{(\\ln(n+1))^{2021/3}}$이므로 $(-1)^n a_n^{2021}=\\dfrac{1}{(\\ln(n+1))^{2021/3}}$. $\\dfrac{1}{(\\ln n)^p}>\\dfrac{1}{n}$ 형태이므로 발산.\n수렴: 가 1개."
  }),
  build({
    num: 35, subject: "다변수함수", unit: "다중적분", concept: "무게중심 $\\bar y$", difficulty: "medium",
    question: "곡선 $y=x^2-2$와 직선 $y=2$로 둘러싸인 영역의 무게중심이 $(0,b)$이다. $b$의 값은?",
    options: [o("1","$\\dfrac{1}{10}$"), o("2","$\\dfrac{1}{5}$"), o("3","$\\dfrac{2}{5}$"), o("4","$\\dfrac{3}{5}$"), o("5","$\\dfrac{7}{10}$")],
    answer: 3,
    explanation: "$\\bar y=\\dfrac{\\iint_D y\\,dA}{\\iint_D dA}$. 영역: $-2\\le x\\le 2,\\,x^2-2\\le y\\le 2$.\n분자: $\\!\\int_{-2}^{2}\\!\\int_{x^2-2}^{2}\\!y\\,dy\\,dx=\\!\\int_{-2}^{2}\\!\\dfrac{4-(x^2-2)^2}{2}\\,dx=\\!\\int_{-2}^{2}\\!\\dfrac{-x^4+4x^2}{2}\\,dx=2\\!\\int_0^2(4x^2-x^4)\\cdot\\dfrac{1}{2}\\cdot\\ldots$\n간단히: $=\\!\\int_0^{2}(4x^2-x^4)\\,dx=\\!\\left[\\dfrac{4x^3}{3}-\\dfrac{x^5}{5}\\right]_0^2=\\dfrac{32}{3}-\\dfrac{32}{5}=\\dfrac{160-96}{15}=\\dfrac{64}{15}$.\n분모(넓이): $\\!\\int_{-2}^{2}(4-x^2)\\,dx=2\\!\\int_0^2(4-x^2)\\,dx=2(8-\\tfrac{8}{3})=\\dfrac{32}{3}$.\n$\\bar y=\\dfrac{64/15}{32/3}=\\dfrac{64}{15}\\cdot\\dfrac{3}{32}=\\dfrac{2}{5}$."
  }),
  build({
    num: 36, subject: "적분학", unit: "정적분", concept: "변수상한·절댓값 적분의 미분", difficulty: "hard",
    question: "실수 전체에서 $f(x)=\\displaystyle\\int_0^{x^2}|\\cos t|\\,dt$로 정의된 함수에 대하여 $f''\\!\\!\\left(\\sqrt{\\dfrac{\\pi}{2}}\\right)$의 값은?",
    options: [o("1","존재하지 않음"), o("2","$-2$"), o("3","$2$"), o("4","$-2\\pi$"), o("5","$2\\pi$")],
    answer: 1,
    explanation: "$f'(x)=|\\cos(x^2)|\\cdot 2x=2x|\\cos(x^2)|$.\n$0<x^2<\\pi/2$에서 $\\cos(x^2)>0$: $f''(x)=2\\cos(x^2)-4x^2\\sin(x^2)$.\n$\\pi/2<x^2<3\\pi/2$에서 $\\cos(x^2)<0$: $f''(x)=-2\\cos(x^2)+4x^2\\sin(x^2)$.\n$x=\\sqrt{\\pi/2}$ ($x^2=\\pi/2$)에서 좌극한 $\\to 2\\cdot 0-4\\cdot\\dfrac{\\pi}{2}\\cdot 1=-2\\pi$, 우극한 $\\to 0+2\\pi=2\\pi$.\n좌·우 극한이 다르므로 $f''(\\sqrt{\\pi/2})$는 존재하지 않는다."
  }),
  build({
    num: 37, subject: "다변수함수", unit: "다중적분", concept: "적분순서 변경", difficulty: "medium",
    question: "다음 적분의 값은? $\\displaystyle\\int_0^{1}\\!\\int_{\\sqrt[3]{x}}^{1}\\!\\sqrt{1+y^4}\\,dy\\,dx$",
    options: [o("1","$\\dfrac{1}{6}(\\sqrt 2-1)$"), o("2","$\\dfrac{1}{6}(2\\sqrt 2-1)$"), o("3","$\\dfrac{1}{3}(\\sqrt 2-1)$"), o("4","$\\dfrac{1}{3}(2\\sqrt 2-1)$"), o("5","$\\dfrac{1}{3}$")],
    answer: 2,
    explanation: "영역: $0\\le x\\le 1,\\,\\sqrt[3]{x}\\le y\\le 1\\Leftrightarrow 0\\le y\\le 1,\\,0\\le x\\le y^3$.\n$\\displaystyle\\int_0^1\\!\\int_0^{y^3}\\!\\sqrt{1+y^4}\\,dx\\,dy=\\!\\int_0^1 y^3\\sqrt{1+y^4}\\,dy$.\n$u=1+y^4,\\,du=4y^3\\,dy$: $=\\dfrac{1}{4}\\!\\int_1^2\\sqrt u\\,du=\\dfrac{1}{4}\\cdot\\dfrac{2}{3}[u^{3/2}]_1^2=\\dfrac{1}{6}(2\\sqrt 2-1)$."
  }),
  build({
    num: 38, subject: "적분학", unit: "급수", concept: "이항급수·테일러 다항식", difficulty: "medium",
    question: "함수 $f(x)=\\sqrt{1-\\dfrac{x^3}{2}}$의 $x=0$에서 $6$차 테일러 다항식을 $P_6(x)$라 할 때 $P_6(1)$의 값은?",
    options: [o("1","$1$"), o("2","$\\dfrac{3}{4}$"), o("3","$\\dfrac{23}{32}$"), o("4","$\\dfrac{5}{8}$"), o("5","$\\dfrac{3}{8}$")],
    answer: 3,
    explanation: "$(1+u)^{1/2}=1+\\dfrac{u}{2}-\\dfrac{u^2}{8}+\\cdots$, $u=-\\dfrac{x^3}{2}$ 대입:\n$f(x)=1+\\dfrac{1}{2}\\!\\left(-\\dfrac{x^3}{2}\\right)-\\dfrac{1}{8}\\!\\left(-\\dfrac{x^3}{2}\\right)^{\\!2}+\\cdots=1-\\dfrac{x^3}{4}-\\dfrac{x^6}{32}+\\cdots$\n$P_6(x)=1-\\dfrac{x^3}{4}-\\dfrac{x^6}{32}$. $P_6(1)=1-\\dfrac{1}{4}-\\dfrac{1}{32}=\\dfrac{32-8-1}{32}=\\dfrac{23}{32}$."
  }),
  build({
    num: 39, subject: "다변수함수", unit: "편도함수", concept: "선형근사(전미분)", difficulty: "easy",
    question: "함수 $f(x,y)=\\sin\\!\\left(\\dfrac{\\pi}{2}xy\\right)+2x-y^2$의 $(1,1)$에서의 선형근사함수(linear approximation)를 이용하여 $f(1.1,\\,0.95)$를 근사한 값은?",
    options: [o("1","$2.3$"), o("2","$2.15$"), o("3","$2.05$"), o("4","$1.95$"), o("5","$1.85$")],
    answer: 1,
    explanation: "$f(1,1)=\\sin\\dfrac{\\pi}{2}+2-1=2$.\n$f_x=\\dfrac{\\pi}{2}y\\cos\\!\\left(\\dfrac{\\pi}{2}xy\\right)+2$, $f_x(1,1)=0+2=2$.\n$f_y=\\dfrac{\\pi}{2}x\\cos\\!\\left(\\dfrac{\\pi}{2}xy\\right)-2y$, $f_y(1,1)=0-2=-2$.\n$L(x,y)=2+2(x-1)-2(y-1)$. $L(1.1,0.95)=2+2(0.1)-2(-0.05)=2+0.2+0.1=2.3$."
  }),
  build({
    num: 40, subject: "적분학", unit: "급수", concept: "수렴반경(비율판정)", difficulty: "medium",
    question: "다음 멱급수의 수렴 반경은? $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-1)^n n^2(n!)^3}{(3n)!}x^n$",
    options: [o("1","$\\dfrac{1}{81}$"), o("2","$\\dfrac{1}{27}$"), o("3","$1$"), o("4","$27$"), o("5","$81$")],
    answer: 4,
    explanation: "$\\displaystyle\\lim_{n\\to\\infty}\\!\\left|\\dfrac{a_n}{a_{n+1}}\\right|=\\lim\\dfrac{n^2(n!)^3}{(3n)!}\\cdot\\dfrac{(3n+3)!}{(n+1)^2((n+1)!)^3}$\n$=\\lim\\dfrac{n^2}{(n+1)^2}\\cdot\\dfrac{(3n+3)(3n+2)(3n+1)}{(n+1)^3}=1\\cdot 27=27$.\n수렴반경 $R=27$."
  }),
  build({
    num: 41, subject: "선형대수", unit: "벡터", concept: "꼬인 두 직선 사이의 거리", difficulty: "medium",
    question: "매개변수 방정식으로 주어진 두 직선 $l_1:\\,x=4t,\\,y=-3t,\\,z=-2t$ ($t\\in\\mathbb R$)과 $l_2:\\,x=3,\\,y=3s+1,\\,z=s+5$ ($s\\in\\mathbb R$) 사이의 거리는?",
    options: [o("1","$2$"), o("2","$3$"), o("3","$4$"), o("4","$5$"), o("5","$6$")],
    answer: 4,
    explanation: "$\\vec d_1=(4,-3,-2),\\,\\vec d_2=(0,3,1)$. $\\vec n=\\vec d_1\\times\\vec d_2=(-3,-4,12)\\to|\\vec n|=\\sqrt{9+16+144}=13$.\n사실: $\\vec d_1\\times\\vec d_2=(-3\\cdot 1-(-2)\\cdot 3,\\,-(4\\cdot 1-(-2)\\cdot 0),\\,4\\cdot 3-(-3)\\cdot 0)=(3,-4,12)$.\n$l_1$의 점 $P=(0,0,0)$, $l_2$의 점 $Q=(3,1,5)$, $\\overrightarrow{PQ}=(3,1,5)$.\n$d=\\dfrac{|\\overrightarrow{PQ}\\cdot\\vec n|}{|\\vec n|}=\\dfrac{|9-4+60|}{13}=\\dfrac{65}{13}=5$."
  }),
  build({
    num: 42, subject: "다변수함수", unit: "다변수함수의 극값", concept: "조건부 극값(산술기하)", difficulty: "medium",
    question: "곡선 $\\{(x,y):x^2+2y^2=1\\}$ 위에서 함수 $f(x,y)=x^2y$의 최댓값은?",
    options: [o("1","$\\dfrac{1}{3}$"), o("2","$\\dfrac{\\sqrt 2}{3}$"), o("3","$\\dfrac{\\sqrt 6}{3}$"), o("4","$\\dfrac{\\sqrt 2}{6}$"), o("5","$\\dfrac{\\sqrt 6}{9}$")],
    answer: 5,
    explanation: "$y\\ge 0$에서 최대. 산술기하: $\\dfrac{x^2}{2}+\\dfrac{x^2}{2}+2y^2\\ge 3\\!\\sqrt[3]{\\dfrac{x^2}{2}\\cdot\\dfrac{x^2}{2}\\cdot 2y^2}=3\\!\\sqrt[3]{\\dfrac{x^4 y^2}{2}}$.\n좌변 $=x^2+2y^2=1$이므로 $1\\ge 3\\!\\sqrt[3]{\\dfrac{x^4 y^2}{2}}\\Rightarrow\\dfrac{x^4 y^2}{2}\\le\\dfrac{1}{27}\\Rightarrow x^4 y^2\\le\\dfrac{2}{27}$.\n$\\therefore x^2 y\\le\\sqrt{\\dfrac{2}{27}}=\\dfrac{\\sqrt 2}{3\\sqrt 3}=\\dfrac{\\sqrt 6}{9}$."
  }),
  build({
    num: 43, subject: "다변수함수", unit: "다변수함수의 극값", concept: "임계점·극값 판정", difficulty: "medium",
    question: "다항함수 $f(x,y)$에 대한 부분적 정보가 다음 표와 같다:\n\n| $(a,b)$ | $f(a,b)$ | $f_x$ | $f_y$ | $f_{xx}$ | $f_{xy}$ | $f_{yy}$ |\n|---|---|---|---|---|---|---|\n| $(0,0)$ | $0$ | $0$ | $1$ | $1$ | $2$ | $8$ |\n| $(1,2)$ | $2$ | $0$ | $0$ | $-1$ | $4$ | $-2$ |\n| $(-1,1)$ | $c$ | $0$ | $0$ | $1$ | $2$ | $8$ |\n| $(2,4)$ | $d$ | $0$ | $0$ | $-2$ | $-3$ | $-6$ |\n\n다음 설명 중 옳은 것은 모두 몇 개인가?\n\n가. $f$는 $(0,0)$에서 극솟값을 가진다.\n나. $f$는 $(1,2)$에서 극댓값을 가진다.\n다. $c<d$\n라. $c=-1$",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개"), o("5","$4$개")],
    answer: 1,
    explanation: "가. [거짓] $f_y(0,0)=1\\ne 0$이므로 임계점이 아니다.\n나. [거짓] $(1,2)$는 임계점이고 $\\Delta=f_{xx}f_{yy}-f_{xy}^2=(-1)(-2)-16=-14<0$이므로 안장점.\n다. [거짓] $(-1,1)$: $\\Delta=1\\cdot 8-4=4>0,\\,f_{xx}=1>0$ → 극소. $(2,4)$: $\\Delta=(-2)(-6)-9=3>0,\\,f_{xx}=-2<0$ → 극대. 극댓값과 극솟값의 대소는 주어진 정보로 판단 불가.\n라. [거짓] $c$ 값을 결정할 정보가 없다.\n옳은 것은 없음."
  }),
  build({
    num: 44, subject: "다변수함수", unit: "다중적분", concept: "두 곡면 사이 부피(극좌표)", difficulty: "medium",
    question: "두 곡면 $z=12-x^2-y^2$와 $z=2x^2+2y^2$로 둘러싸인 입체의 부피는?",
    options: [o("1","$3\\pi$"), o("2","$6\\pi$"), o("3","$12\\pi$"), o("4","$24\\pi$"), o("5","$36\\pi$")],
    answer: 4,
    explanation: "교선: $12-x^2-y^2=2x^2+2y^2\\Rightarrow x^2+y^2=4$.\n$V=\\!\\iint_D[(12-x^2-y^2)-(2x^2+2y^2)]\\,dA=3\\!\\iint_D(4-x^2-y^2)\\,dA$ (단, $D:x^2+y^2\\le 4$).\n극좌표: $=3\\!\\int_0^{2\\pi}\\!\\int_0^2(4-r^2)\\,r\\,dr\\,d\\theta=6\\pi\\!\\left[2r^2-\\dfrac{r^4}{4}\\right]_0^2=6\\pi(8-4)=24\\pi$."
  }),
  build({
    num: 45, subject: "다변수함수", unit: "벡터해석", concept: "곡면의 넓이(원통 내부)", difficulty: "medium",
    question: "반구면 $x^2+y^2+z^2=4$ ($z>0$)의 원통 $x^2+y^2=1$ 내부에 속하는 부분의 겉넓이는?",
    options: [o("1","$2(2-\\sqrt 3)\\pi$"), o("2","$4(2-\\sqrt 3)\\pi$"), o("3","$\\!\\left(1+\\dfrac{\\sqrt 3}{2}\\right)\\!\\pi$"), o("4","$(1+\\sqrt 3)\\pi$"), o("5","$(2+\\sqrt 3)\\pi$")],
    answer: 2,
    explanation: "$z=\\sqrt{4-x^2-y^2}$, $\\sqrt{1+z_x^2+z_y^2}=\\dfrac{2}{\\sqrt{4-x^2-y^2}}$.\n$\\displaystyle S=\\!\\iint_{D:x^2+y^2\\le 1}\\!\\dfrac{2}{\\sqrt{4-x^2-y^2}}\\,dA=\\!\\int_0^{2\\pi}\\!\\int_0^1\\!\\dfrac{2r}{\\sqrt{4-r^2}}\\,dr\\,d\\theta$\n$=2\\pi\\cdot 2[-\\sqrt{4-r^2}]_0^1=4\\pi(2-\\sqrt 3)$."
  }),
  build({
    num: 46, subject: "적분학", unit: "특이적분", concept: "이상적분 수렴 판정·부분적분", difficulty: "medium",
    question: "이상 적분에 관한 다음 사실을 상기하라.\n甲. $\\displaystyle\\int_0^1 x^{-p}dx$ 수렴$\\Leftrightarrow p<1$\n乙. $\\displaystyle\\int_1^{\\infty}x^{-p}dx$ 수렴$\\Leftrightarrow p>1$\n丙. (비교판정법, $0\\le f_1\\le f_2$, $\\int f_2$ 수렴 $\\Rightarrow\\int f_1$ 수렴)\n丁. $\\int|f|$ 수렴 $\\Rightarrow\\int f$ 수렴\n\n다음 식의 변형 $\\displaystyle\\int_1^{\\infty}\\!\\dfrac{\\sin x}{x}\\,dx=\\!\\lim_{b\\to\\infty}\\!\\left\\{-\\dfrac{\\cos b}{b}+\\cos 1-\\!\\int_1^{b}\\!\\dfrac{\\cos x}{x^2}\\,dx\\right\\}$의 (*) 과정에 대해, 다음 보기에서 옳은 것은 모두 몇 개인가?\n\n가. 위 (*)과정에서 부분적분이 사용되었다.\n나. $\\displaystyle\\int_1^{\\infty}\\!\\dfrac{\\cos x}{x^2}\\,dx$는 수렴한다.\n다. $\\displaystyle\\int_1^{\\infty}\\!\\dfrac{|\\cos x|}{x^2}\\,dx$는 乙, 丙에 의하여 수렴한다.\n라. $\\displaystyle\\int_1^{\\infty}\\!\\dfrac{\\sin x}{x}\\,dx$는 수렴한다.",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개"), o("5","$4$개")],
    answer: 5,
    explanation: "가. [참] $u'=\\sin x,\\,v=\\dfrac{1}{x}$로 부분적분.\n나. [참] $\\left|\\dfrac{\\cos x}{x^2}\\right|\\le\\dfrac{1}{x^2}$이고 $\\int\\dfrac{1}{x^2}$ 수렴(乙). 절대수렴이므로 수렴(丁).\n다. [참] $\\dfrac{|\\cos x|}{x^2}\\le\\dfrac{1}{x^2}$, 乙·丙에 의해 수렴.\n라. [참] 위 변형식의 우변이 모두 유한이므로 수렴(또는 디리클레 판정).\n네 개 모두 참."
  }),
  build({
    num: 47, subject: "적분학", unit: "특이적분", concept: "디리클레 판정·치환", difficulty: "medium",
    question: "다음 보기에서 수렴하는 이상 적분은 모두 몇 개인가?\n\n가. $\\displaystyle\\int_1^{\\infty}\\!\\dfrac{\\cos x}{x}\\,dx$  나. $\\displaystyle\\int_1^{\\infty}\\!\\dfrac{\\cos x}{\\sqrt x}\\,dx$  다. $\\displaystyle\\int_{\\pi}^{\\infty}\\!\\sin(x^2)\\,dx$  라. $\\displaystyle\\int_0^{\\infty}\\!\\dfrac{\\sqrt x}{x+x^2}\\,dx$",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개"), o("5","$4$개")],
    answer: 5,
    explanation: "가. 디리클레: $\\left|\\int_1^t\\cos x\\,dx\\right|\\le 2$ 유계, $\\dfrac{1}{x}$ 단조→0. 수렴.\n나. 같은 방식, $\\dfrac{1}{\\sqrt x}$ 단조→0. 수렴.\n다. $u=x^2,\\,du=2x\\,dx,\\,dx=\\dfrac{du}{2\\sqrt u}$. $\\int\\dfrac{\\sin u}{2\\sqrt u}\\,du$, 디리클레로 수렴.\n라. $\\int_0^1\\dfrac{\\sqrt x}{x(x+1)}\\,dx\\approx\\int_0^1\\dfrac{1}{\\sqrt x}\\,dx$ 수렴 + $\\int_1^{\\infty}\\dfrac{\\sqrt x}{x^2}\\,dx=\\int\\dfrac{1}{x^{3/2}}$ 수렴.\n네 개 모두 수렴."
  }),
  build({
    num: 48, subject: "다변수함수", unit: "벡터해석", concept: "보존장·특이점 둘러쌈 판정", difficulty: "mediumHard",
    question: "중심이 $(3,3)$이고 반지름이 $r$인 반시계 방향의 원을 $C_5$라 하자. 단 $\\sqrt 2<r<3\\sqrt 2$. 다섯 벡터장 $\\mathbf F_1=x\\mathbf i+y\\mathbf j$, $\\mathbf F_2=-y\\mathbf i-x\\mathbf j$, $\\mathbf F_3=\\dfrac{x}{x^2+y^2}\\mathbf i+\\dfrac{y}{x^2+y^2}\\mathbf j$, $\\mathbf F_4=-\\dfrac{2y}{x^2+y^2}\\mathbf i+\\dfrac{2x}{x^2+y^2}\\mathbf j$, $\\mathbf F_5=-\\dfrac{y-2}{(x-2)^2+(y-2)^2}\\mathbf i+\\dfrac{x-2}{(x-2)^2+(y-2)^2}\\mathbf j$. 다음 중 그 값이 다른 것 하나는?\n\n(1) $\\displaystyle\\int_{C_5}\\mathbf F_1\\cdot d\\mathbf r$\n(2) $\\displaystyle\\int_{C_5}\\mathbf F_2\\cdot d\\mathbf r$\n(3) $\\displaystyle\\int_{C_5}\\mathbf F_3\\cdot d\\mathbf r$\n(4) $\\displaystyle\\int_{C_5}\\mathbf F_4\\cdot d\\mathbf r$\n(5) $\\displaystyle\\int_{C_5}\\mathbf F_5\\cdot d\\mathbf r$",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)"), o("5","(5)")],
    answer: 5,
    explanation: "(1) $\\mathbf F_1$: $\\partial_y x=\\partial_x y=0$이므로 보존장. 폐곡선 적분 $=0$.\n(2) $\\mathbf F_2$: $\\partial_y(-y)=-1=\\partial_x(-x)$이므로 보존장. 적분 $=0$.\n(3) $\\mathbf F_3=\\nabla\\!\\left(\\dfrac{1}{2}\\ln(x^2+y^2)\\right)$, 폐곡선 적분 $=0$ ($C_5$가 원점을 둘러싸지 않음).\n(4) $\\mathbf F_4=2\\cdot$\"그놈\"(원점 중심 와인딩장). $C_5$는 원점($\\sqrt{18}=3\\sqrt 2$ 떨어짐)을 둘러싸지 않으므로 적분 $=0$.\n(5) $\\mathbf F_5$는 \"그놈\"을 $(2,2)$로 평행이동. $(3,3)$과 $(2,2)$의 거리는 $\\sqrt 2$이므로 $r>\\sqrt 2$이면 $C_5$가 $(2,2)$를 둘러쌈. 적분 $=2\\pi$.\n나머지는 모두 $0$이고 (5)만 $2\\pi$이므로 답은 (5)."
  }),
  build({
    num: 49, subject: "다변수함수", unit: "벡터해석", concept: "선적분(매개변수)", difficulty: "easy",
    question: "포물선 $y=x^2$을 따라 $(1,1)$에서 $(2,4)$에 이르는 곡선을 $\\widetilde C$라 하자. $\\mathbf F_2(x,y)=-y\\mathbf i-x\\mathbf j$에 대해 $\\displaystyle\\int_{\\widetilde C}\\!\\mathbf F_2\\cdot d\\mathbf r$의 값은?",
    options: [o("1","$-7$"), o("2","$-4$"), o("3","$0$"), o("4","$4$"), o("5","$7$")],
    answer: 1,
    explanation: "$\\mathbf r(t)=(t,t^2),\\,1\\le t\\le 2$. $\\mathbf r'=(1,2t)$. $\\mathbf F_2(\\mathbf r(t))=(-t^2,-t)$.\n$\\displaystyle\\int_{\\widetilde C}\\!\\mathbf F_2\\cdot d\\mathbf r=\\!\\int_1^{2}(-t^2-2t^2)\\,dt=-3\\!\\int_1^{2}t^2\\,dt=-3\\cdot\\dfrac{7}{3}=-7$."
  }),
  build({
    num: 50, subject: "다변수함수", unit: "벡터해석", concept: "큰 폐곡선 극한(특이점 포함)", difficulty: "easy",
    question: "위(48번 설정)의 $\\mathbf F_4$와 원 $C_5$ (중심 $(3,3)$, 반지름 $r$, 반시계)에 대해 $\\displaystyle\\lim_{r\\to\\infty}\\!\\int_{C_5}\\!\\mathbf F_4\\cdot d\\mathbf r$의 값은?",
    options: [o("1","$0$"), o("2","$2\\pi$"), o("3","$4\\pi$"), o("4","$8\\pi$"), o("5","$\\infty$")],
    answer: 3,
    explanation: "$r\\to\\infty$이면 $C_5$가 원점을 둘러쌈. $\\mathbf F_4=2\\cdot$\"그놈\"이므로 적분 $=2\\cdot 2\\pi=4\\pi$."
  })
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (2021 오후 아주대):`, data.map((d) => d.id).join(", "));
