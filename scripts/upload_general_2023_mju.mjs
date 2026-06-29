// Upload 2023년도 명지대 편입수학 기출 25문항
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
const YEAR = "2023";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-mju-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "도함수", concept: "변수상한 미분(로피탈)", difficulty: "easy",
    question: "$f(x)=\\displaystyle\\lim_{t\\to x}\\dfrac{\\tan^{-1}t-\\tan^{-1}x}{t-x}$일 때 $f'(-1)$의 값은?",
    options: [o("1","$-1$"), o("2","$-\\dfrac{1}{2}$"), o("3","$0$"), o("4","$\\dfrac{1}{2}$"), o("5","$1$")],
    answer: 4,
    explanation: "$\\dfrac{0}{0}$ 꼴, 로피탈 ($t$에 대해): $f(x)=\\dfrac{1}{1+x^2}$.\n$f'(x)=-\\dfrac{2x}{(1+x^2)^2}$. $f'(-1)=\\dfrac{2}{4}=\\dfrac{1}{2}$."
  }),
  build({
    num: 2, subject: "적분학", unit: "정적분", concept: "역삼각함수·치환 적분 분리", difficulty: "easy",
    question: "$\\displaystyle\\int_0^1\\!\\left(\\dfrac{1}{\\sqrt{4-x^2}}+\\sqrt{1-x}\\right)dx$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{12}+\\dfrac{1}{2}$"), o("2","$\\dfrac{\\pi}{12}+\\dfrac{2}{3}$"), o("3","$\\dfrac{\\pi}{6}+\\dfrac{1}{3}$"), o("4","$\\dfrac{\\pi}{6}+\\dfrac{1}{2}$"), o("5","$\\dfrac{\\pi}{6}+\\dfrac{2}{3}$")],
    answer: 5,
    explanation: "①: $\\!\\int_0^1\\dfrac{dx}{\\sqrt{4-x^2}}=\\!\\left[\\sin^{-1}\\dfrac{x}{2}\\right]_0^1=\\dfrac{\\pi}{6}$.\n②: $\\!\\int_0^1\\sqrt{1-x}\\,dx=\\dfrac{2}{3}[-(1-x)^{3/2}]_0^1=\\dfrac{2}{3}$.\n합 $=\\dfrac{\\pi}{6}+\\dfrac{2}{3}$."
  }),
  build({
    num: 3, subject: "적분학", unit: "정적분", concept: "리만합·반원 면적", difficulty: "easy",
    question: "$\\displaystyle\\lim_{n\\to\\infty}\\dfrac{2}{n}\\sum_{k=1}^{n}\\sqrt{4-\\!\\left(\\dfrac{2k}{n}\\right)^2}$의 값은?",
    options: [o("1","$\\pi$"), o("2","$\\dfrac{5}{4}\\pi$"), o("3","$\\dfrac{3}{2}\\pi$"), o("4","$\\dfrac{7}{4}\\pi$"), o("5","$2\\pi$")],
    answer: 1,
    explanation: "$=2\\!\\int_0^1\\!\\sqrt{4-(2x)^2}\\,dx$. $2x=t$ 치환: $=\\!\\int_0^2\\!\\sqrt{4-t^2}\\,dt$ (중심이 원점, 반지름 2 상반원의 1/4 영역) $=\\dfrac{1}{4}\\cdot\\pi\\cdot 2^2=\\pi$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분", concept: "삼각치환", difficulty: "medium",
    question: "$\\displaystyle\\int_1^{3}\\!\\dfrac{1}{x^2\\sqrt{9-x^2}}\\,dx$의 값은?",
    options: [o("1","$\\dfrac{\\sqrt 2}{9}$"), o("2","$\\dfrac{2\\sqrt 2}{9}$"), o("3","$\\dfrac{\\sqrt 2}{3}$"), o("4","$\\dfrac{4\\sqrt 2}{9}$"), o("5","$\\dfrac{5\\sqrt 2}{9}$")],
    answer: 2,
    explanation: "$x=3\\sin\\theta$ 치환. 구간 $\\theta:\\sin^{-1}(1/3)\\to\\pi/2$.\n$\\!\\int\\dfrac{1}{9\\sin^2\\theta\\cdot 3\\cos\\theta}\\cdot 3\\cos\\theta\\,d\\theta=\\dfrac{1}{9}\\!\\int\\csc^2\\theta\\,d\\theta=\\dfrac{1}{9}[-\\cot\\theta]$.\n$\\sin\\alpha=1/3,\\cos\\alpha=\\dfrac{2\\sqrt 2}{3}$. $\\cot\\alpha=2\\sqrt 2$.\n$=\\dfrac{1}{9}(0-(-2\\sqrt 2))=\\dfrac{2\\sqrt 2}{9}$."
  }),
  build({
    num: 5, subject: "미분학", unit: "극한과 연속", concept: "유리화 극한·합", difficulty: "medium",
    question: "함수 $f(x)=\\begin{cases}x\\sin(1/x)& (x\\ne 0)\\\\ 1& (x=0)\\end{cases}$과 자연수 $n$에 대하여 $a_n=\\displaystyle\\lim_{x\\to 0}\\dfrac{\\sqrt{n^2+f(x)}-n}{f(x)}$일 때 $a_3+a_6$의 값은?",
    options: [o("1","$1$"), o("2","$\\dfrac{1}{2}$"), o("3","$\\dfrac{1}{3}$"), o("4","$\\dfrac{1}{4}$"), o("5","$\\dfrac{1}{5}$")],
    answer: 4,
    explanation: "$\\lim f(x)=0$ ($x\\sin(1/x)$이 $|x|$로 유계). 유리화: $\\lim\\dfrac{f(x)}{f(x)(\\sqrt{n^2+f(x)}+n)}=\\dfrac{1}{2n}$.\n$a_n=\\dfrac{1}{2n}$. $a_3+a_6=\\dfrac{1}{6}+\\dfrac{1}{12}=\\dfrac{1}{4}$."
  }),
  build({
    num: 6, subject: "적분학", unit: "정적분", concept: "$|x-1|$ 절댓값 적분", difficulty: "easy",
    question: "실수 전체에서 미분가능한 함수 $f(x)$에 대하여 $f'(x)=|x-1|$, $f(2)=3$일 때 $f(-1)$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$1$"), o("3","$\\dfrac{3}{2}$"), o("4","$2$"), o("5","$\\dfrac{5}{2}$")],
    answer: 1,
    explanation: "$\\!\\int_{-1}^2 f'(x)dx=f(2)-f(-1)$. $\\!\\int_{-1}^2|x-1|dx=$ 삼각형 두 개: $\\dfrac{1}{2}\\cdot 1\\cdot 1+\\dfrac{1}{2}\\cdot 2\\cdot 2=\\dfrac{5}{2}$.\n$3-f(-1)=\\dfrac{5}{2}\\Rightarrow f(-1)=\\dfrac{1}{2}$."
  }),
  build({
    num: 7, subject: "미분학", unit: "도함수", concept: "음함수 2계 미분", difficulty: "medium",
    question: "곡선 $x^3-y^3=2$에 대하여 $x=1$에서 $y''$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 4,
    explanation: "$3x^2-3y^2 y'=0\\Rightarrow y'=\\dfrac{x^2}{y^2}$. $x=1$일 때 $y=-1$, $y'=1$.\n$y''=\\dfrac{2xy^2-x^2\\cdot 2y y'}{y^4}=\\dfrac{2(1)(1)-2(1)(-1)(1)}{1}=2+2=4$."
  }),
  build({
    num: 8, subject: "선형대수", unit: "벡터", concept: "극좌표 동일점 판정", difficulty: "easy",
    question: "좌표평면의 점을 극좌표 $(r,\\theta)$로 나타낼 때 다음 중 같은 점이 $\\mathbf{아닌}$ 것은?\n\n(1) $\\!\\left(\\sqrt 2,-\\dfrac{\\pi}{4}\\right)$  (2) $\\!\\left(\\sqrt 2,\\dfrac{7\\pi}{4}\\right)$  (3) $\\!\\left(-\\sqrt 2,\\dfrac{\\pi}{4}\\right)$  (4) $\\!\\left(-\\sqrt 2,\\dfrac{3\\pi}{4}\\right)$  (5) $\\!\\left(-\\sqrt 2,-\\dfrac{5\\pi}{4}\\right)$",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)"), o("5","(5)")],
    answer: 3,
    explanation: "(1),(2),(4),(5): 모두 직교좌표 $(1,-1)$로 같은 4사분면 점.\n(3) $r=-\\sqrt 2$, $\\theta=\\pi/4\\Rightarrow$ 실제 점 $\\!\\left(\\sqrt 2,\\pi/4+\\pi\\right)=(-1,-1)$ (3사분면). 다른 점."
  }),
  build({
    num: 9, subject: "미분학", unit: "곡선의 개형", concept: "사선점근선·근호", difficulty: "medium",
    question: "좌표평면에서 곡선 $y=\\sqrt{x^2+x+1}$의 두 사선점근선을 각각 $y=ax+b,\\,y=cx+d$라 할 때 $|a|+|b|+|c|+|d|$의 값은? (단, $a,b,c,d$는 상수)",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 3,
    explanation: "$y^2=x^2+x+1$. 사점근선 $y=mx+n$: $\\lim(\\sqrt{x^2+x+1}-(mx+n))=0$.\n$(1-m^2)x^2+(1-2mn)x+(1-n^2)\\to 0$ 필요: $m^2=1,\\,2mn=1$.\n$m=1\\Rightarrow n=1/2,\\,y=x+1/2$. $m=-1\\Rightarrow n=-1/2,\\,y=-x-1/2$.\n$|a|+|b|+|c|+|d|=1+1/2+1+1/2=3$."
  }),
  build({
    num: 10, subject: "미분학", unit: "극한과 연속", concept: "$1^{\\infty}$ 형식·지수", difficulty: "medium",
    question: "$\\displaystyle\\lim_{x\\to\\infty}\\!\\left(\\dfrac{x+2a}{x-1}\\right)^{\\!x}=e^{2023}$일 때 상수 $a$의 값은?",
    options: [o("1","$1011$"), o("2","$1013$"), o("3","$1015$"), o("4","$1017$"), o("5","$1019$")],
    answer: 1,
    explanation: "$=\\lim\\!\\left(1+\\dfrac{2a+1}{x-1}\\right)^{\\!x}=e^{2a+1}$ (지수 부분 $(2a+1)x/(x-1)\\to 2a+1$).\n$2a+1=2023\\Rightarrow a=1011$."
  }),
  build({
    num: 11, subject: "적분학", unit: "정적분", concept: "삼각함수 합성·절댓값", difficulty: "medium",
    question: "$\\displaystyle\\int_0^{\\pi}\\!|\\sin x-\\sqrt 3\\cos x|\\,dx$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 4,
    explanation: "$\\sin x-\\sqrt 3\\cos x=2\\sin(x-\\pi/3)$.\n$\\!\\int_0^{\\pi}\\!|2\\sin(x-\\pi/3)|dx=2\\!\\int_{-\\pi/3}^{2\\pi/3}|\\sin u|du=2\\!\\left(\\!\\int_{-\\pi/3}^0\\!(-\\sin u)du+\\!\\int_0^{2\\pi/3}\\!\\sin u\\,du\\right)$\n$=2[(1-1/2)+(1+1/2)]=2\\cdot 2=4$."
  }),
  build({
    num: 12, subject: "선형대수", unit: "벡터", concept: "원점-3차원 직선 거리", difficulty: "medium",
    question: "원점에서 두 평면 $2x-z=0,\\,x+y-z=6$의 교선까지의 거리는?",
    options: [o("1","$2\\sqrt 6$"), o("2","$3\\sqrt 3$"), o("3","$\\sqrt{30}$"), o("4","$\\sqrt{33}$"), o("5","$6$")],
    answer: 3,
    explanation: "교선 방향 $=(2,0,-1)\\times(1,1,-1)=(1,1,2)$. 점 $(-6,0,-12)$ ($y=0$ 대입).\n매개: $(t-6,t,2t-12)$. 원점 수선 조건 $(t-6,t,2t-12)\\cdot(1,1,2)=0\\Rightarrow 6t-30=0,\\,t=5$.\n수선의 발 $H(-1,5,-2)$. 거리 $=\\sqrt{1+25+4}=\\sqrt{30}$."
  }),
  build({
    num: 13, subject: "적분학", unit: "정적분의 응용", concept: "극곡선 길이($r=\\theta^2$)", difficulty: "medium",
    question: "구간 $0\\le\\theta\\le a$에서 극곡선 $r=\\theta^2$의 길이가 $\\dfrac{19}{3}$일 때 양수 $a$의 값은?",
    options: [o("1","$1$"), o("2","$\\sqrt 2$"), o("3","$\\sqrt 3$"), o("4","$2$"), o("5","$\\sqrt 5$")],
    answer: 5,
    explanation: "$L=\\!\\int_0^a\\!\\sqrt{\\theta^4+4\\theta^2}d\\theta=\\!\\int_0^a\\theta\\sqrt{\\theta^2+4}d\\theta=\\dfrac{1}{3}[(\\theta^2+4)^{3/2}]_0^a=\\dfrac{1}{3}((a^2+4)^{3/2}-8)$.\n$\\dfrac{19}{3}\\Rightarrow (a^2+4)^{3/2}=27\\Rightarrow a^2+4=9\\Rightarrow a=\\sqrt 5$."
  }),
  build({
    num: 14, subject: "선형대수", unit: "행렬", concept: "행렬 성질 판정", difficulty: "hard",
    question: "$2$차 정사각행렬 $A$에 대하여 다음 보기에서 옳은 것을 모두 고른 것은? (단 $I$ 단위행렬, $O$ 영행렬)\n\nㄱ. $A^2=A$이면 $A=I$이거나 $A=O$이다.\nㄴ. $\\det(A)=\\dfrac{1}{2}$이면 $\\displaystyle\\sum_{n=1}^{\\infty}\\det(A^n)=1$이다.\nㄷ. 실수 $c$에 대하여 $cA$가 역행렬을 가지면 $A$도 역행렬을 갖는다.\nㄹ. $\\det(A)\\ne 0$이고 $A\\ne I$이면 $\\det(A+I)\\ne 0$이다.",
    options: [o("1","ㄱ, ㄴ"), o("2","ㄴ, ㄷ"), o("3","ㄴ, ㄹ"), o("4","ㄱ, ㄷ, ㄹ"), o("5","ㄴ, ㄷ, ㄹ")],
    answer: 2,
    explanation: "ㄱ. 거짓: $A(A-I)=O$의 해는 $A=O$, $A=I$ 외에 영인자 행렬도 가능.\nㄴ. 참: 등비급수 합 $\\dfrac{1/2}{1-1/2}=1$.\nㄷ. 참: $c|A|\\ne 0\\Rightarrow|A|\\ne 0$.\nㄹ. 거짓: $A=\\!\\begin{pmatrix}-1&0\\\\0&-1\\end{pmatrix}$이면 $|A|=1\\ne 0,\\,A\\ne I,\\,|A+I|=0$.\n참: ㄴ, ㄷ."
  }),
  build({
    num: 15, subject: "적분학", unit: "정적분", concept: "역함수 적분 공식", difficulty: "easy",
    question: "실수 전체에서 미분가능한 함수 $f$가 (가) 모든 실수 $x$에서 $f'(x)>0$ (나) $f(1)=3,\\,f(4)=6$을 만족시킨다. $\\displaystyle\\int_1^{4}\\!f(x)dx+\\!\\int_3^{6}\\!f^{-1}(x)dx$의 값은?",
    options: [o("1","$9$"), o("2","$12$"), o("3","$15$"), o("4","$18$"), o("5","$21$")],
    answer: 5,
    explanation: "역함수 적분: $\\!\\int_a^b f\\,dx+\\!\\int_{f(a)}^{f(b)}f^{-1}dy=b f(b)-a f(a)$.\n$=4\\cdot 6-1\\cdot 3=21$."
  }),
  build({
    num: 16, subject: "적분학", unit: "급수", concept: "수렴 판정 모음", difficulty: "medium",
    question: "다음 보기에서 수렴하는 급수만을 있는 대로 고른 것은?\n\nㄱ. $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n}{n^3+1}$  ㄴ. $\\displaystyle\\sum_{n=1}^{\\infty}(-1)^n\\dfrac{\\sqrt n}{n+1}$  ㄷ. $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{2^n+3^n}{e^n}$  ㄹ. $\\displaystyle\\sum_{n=1}^{\\infty}(\\sqrt{n+1}-\\sqrt n)$",
    options: [o("1","ㄱ, ㄴ"), o("2","ㄱ, ㄷ"), o("3","ㄴ, ㄷ"), o("4","ㄱ, ㄴ, ㄷ"), o("5","ㄱ, ㄴ, ㄹ")],
    answer: 1,
    explanation: "ㄱ. $\\sim 1/n^2$ 수렴.\nㄴ. 교대급수 $\\sqrt n/(n+1)\\to 0$ 단조감소. 수렴.\nㄷ. $(3/e)^n>1$이라 발산.\nㄹ. $\\sqrt{n+1}-\\sqrt n=\\dfrac{1}{\\sqrt{n+1}+\\sqrt n}\\sim\\dfrac{1}{\\sqrt n}$ 발산.\n수렴: ㄱ, ㄴ."
  }),
  build({
    num: 17, subject: "적분학", unit: "정적분의 응용", concept: "$y=e^{ax}$와 직선 사이 넓이", difficulty: "medium",
    question: "양수 $a$와 $b>1$인 실수 $b$에 대하여 곡선 $y=e^{ax}$과 $y$축 및 직선 $y=b$에 의해 둘러싸인 부분의 넓이를 $S(a,b)$라 할 때 $S(1,e)$의 값은?",
    options: [o("1","$\\dfrac{e}{2}-1$"), o("2","$\\dfrac{1}{2}$"), o("3","$\\dfrac{e-1}{2}$"), o("4","$1$"), o("5","$e-1$")],
    answer: 4,
    explanation: "$y=e^x\\Leftrightarrow x=\\ln y$. $S=\\!\\int_1^e\\!\\ln y\\,dy=[y\\ln y-y]_1^e=(e-e)-(0-1)=1$."
  }),
  build({
    num: 18, subject: "적분학", unit: "정적분의 응용", concept: "두 지수곡선·직선 사이 넓이", difficulty: "medium",
    question: "두 곡선 $y=e^x,\\,y=e^{2x}$과 두 직선 $y=e,\\,y=e^2$에 의해 둘러싸인 부분의 넓이는?",
    options: [o("1","$e^2$"), o("2","$\\dfrac{e^2}{2}$"), o("3","$\\dfrac{e^2}{3}$"), o("4","$\\dfrac{e^2}{4}$"), o("5","$\\dfrac{e^2}{5}$")],
    answer: 2,
    explanation: "$y=e^x\\Rightarrow x=\\ln y$. $y=e^{2x}\\Rightarrow x=\\ln y/2$.\n$S=\\!\\int_e^{e^2}\\!\\left(\\ln y-\\dfrac{\\ln y}{2}\\right)dy=\\dfrac{1}{2}\\!\\int_e^{e^2}\\!\\ln y\\,dy=\\dfrac{1}{2}[y\\ln y-y]_e^{e^2}=\\dfrac{1}{2}(2e^2-e^2)=\\dfrac{e^2}{2}$."
  }),
  build({
    num: 19, subject: "적분학", unit: "급수", concept: "Maclaurin 급수·9계 도함수", difficulty: "hard",
    question: "Maclaurin 급수를 이용하여 $x=0$에서 함수 $f(x)=x\\cos(x^2)$의 9계 미분계수 $f^{(9)}(0)$의 값은?",
    options: [o("1","$\\dfrac{9!}{2!}$"), o("2","$\\dfrac{9!}{3!}$"), o("3","$\\dfrac{9!}{4!}$"), o("4","$\\dfrac{9!}{5!}$"), o("5","$\\dfrac{9!}{6!}$")],
    answer: 3,
    explanation: "$\\cos(x^2)=1-\\dfrac{x^4}{2!}+\\dfrac{x^8}{4!}-\\cdots$. $f(x)=x-\\dfrac{x^5}{2!}+\\dfrac{x^9}{4!}-\\cdots$.\n$x^9$의 계수 $=\\dfrac{1}{4!}$. $f^{(9)}(0)=\\dfrac{9!}{4!}$."
  }),
  build({
    num: 20, subject: "적분학", unit: "급수", concept: "수렴반지름·수렴구간", difficulty: "medium",
    question: "멱급수 $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(-2)^n x^n}{\\sqrt{n+1}}$의 수렴반지름을 $R$, 멱급수 $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(x-2)^n}{n^2+1}$의 수렴구간을 $[a,b]$라 할 때 $\\dfrac{ab}{R}$의 값은?",
    options: [o("1","$2$"), o("2","$4$"), o("3","$6$"), o("4","$8$"), o("5","$10$")],
    answer: 3,
    explanation: "(I) $\\!\\left|\\dfrac{a_{n+1}}{a_n}\\right|=\\dfrac{2}{\\sqrt{n+2}/\\sqrt{n+1}}\\to 2$. $R=\\dfrac{1}{2}$.\n(II) $|x-2|<1\\Rightarrow 1<x<3$. 양 끝점 모두 $\\sum 1/(n^2+1)$ 형태로 수렴. 구간 $[1,3]$, $ab=3$.\n$\\dfrac{ab}{R}=\\dfrac{3}{1/2}=6$."
  }),
  build({
    num: 21, subject: "다변수함수", unit: "다중적분", concept: "적분순서 변경·$\\sin$ 치환", difficulty: "hard",
    question: "$\\displaystyle\\int_{\\ln(\\pi/2)}^{\\ln\\pi}\\!\\int_{e^x}^{\\pi}\\!y e^x\\sin(e^x)\\,dy\\,dx$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{4}$"), o("2","$\\dfrac{\\pi}{8}+1$"), o("3","$\\dfrac{\\pi}{2}$"), o("4","$\\dfrac{\\pi}{4}+1$"), o("5","$\\dfrac{\\pi}{2}+1$")],
    answer: 5,
    explanation: "$y$ 먼저 적분: $\\dfrac{1}{2}\\!\\int_{\\ln(\\pi/2)}^{\\ln\\pi}\\!e^x\\sin(e^x)(\\pi^2-e^{2x})dx$.\n$e^x=t$ 치환 ($e^x dx=dt$, $t:\\pi/2\\to\\pi$): $\\dfrac{1}{2}\\!\\int_{\\pi/2}^{\\pi}(\\pi^2-t^2)\\sin t\\,dt$.\n부분적분으로 계산하면 결과 $\\dfrac{\\pi}{2}+1$."
  }),
  build({
    num: 22, subject: "다변수함수", unit: "다중적분", concept: "극영역 차집합 넓이", difficulty: "hard",
    question: "극곡선 $r=a(1+\\cos\\theta)$의 내부와 극곡선 $r=3a\\cos\\theta$의 외부에 놓인 영역의 넓이가 $\\pi$일 때 양수 $a$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$1$"), o("3","$\\dfrac{3}{2}$"), o("4","$2$"), o("5","$\\dfrac{5}{2}$")],
    answer: 4,
    explanation: "심장형 $r=a(1+\\cos\\theta)$ 면적 $=\\dfrac{3\\pi a^2}{2}$. 두 곡선 공통 면적 $=\\dfrac{5\\pi a^2}{4}$.\n$r=a(1+\\cos\\theta)$ 내부 ∩ $r=3a\\cos\\theta$ 외부 $=\\dfrac{3\\pi a^2}{2}-\\dfrac{5\\pi a^2}{4}=\\dfrac{\\pi a^2}{4}=\\pi\\Rightarrow a^2=4\\Rightarrow a=2$."
  }),
  build({
    num: 23, subject: "적분학", unit: "급수", concept: "$\\ln$ 멱급수·미분", difficulty: "hard",
    question: "함수 $f(x)=x\\ln(1+2x^2)$에 대하여 도함수 $f'(x)$의 멱급수 표현을 $\\displaystyle\\sum_{n=0}^{\\infty}c_n x^n$이라 하자. $c_0+c_2+c_4$의 값은? (단 $|x|<\\dfrac{\\sqrt 2}{2}$)",
    options: [o("1","$-4$"), o("2","$-2$"), o("3","$0$"), o("4","$2$"), o("5","$4$")],
    answer: 1,
    explanation: "$\\ln(1+2x^2)=2x^2-\\dfrac{(2x^2)^2}{2}+\\dfrac{(2x^2)^3}{3}-\\cdots=2x^2-2x^4+\\dfrac{8}{3}x^6-\\cdots$.\n$f(x)=2x^3-2x^5+\\dfrac{8}{3}x^7-\\cdots$. $f'(x)=6x^2-10x^4+\\cdots$.\n$c_0=0,\\,c_2=6,\\,c_4=-10$. 합 $=-4$."
  }),
  build({
    num: 24, subject: "다변수함수", unit: "편도함수", concept: "방향도함수 최댓값·연쇄법칙", difficulty: "hard",
    question: "미분가능한 두 이변수함수 $f(x,y),\\,g(x,y)$가 두 점 $P(1,2),\\,Q(2,2)$에서 $g(1,2)=2$이고 표 정보 $f(1,2)=2,\\,f_x(1,2)=-3,\\,f_y(1,2)=1,\\,g_x(1,2)=-3,\\,g_y(1,2)=2$, $f(2,2)=3,\\,f_x(2,2)=-1,\\,f_y(2,2)=-2,\\,g(2,2)=3,\\,g_x(2,2)=2,\\,g_y(2,2)=1$를 만족한다. 점 $P$에서 $F(x,y)=f(g(x,y),xy)$가 가장 빨리 증가하는 방향의 단위벡터를 $\\vec v$라 할 때 $D_{\\vec v}F(P)$의 값은?",
    options: [o("1","$4$"), o("2","$\\sqrt{17}$"), o("3","$3\\sqrt 2$"), o("4","$\\sqrt{19}$"), o("5","$2\\sqrt 5$")],
    answer: 2,
    explanation: "$F(x,y)=f(s,t),\\,s=g(x,y),\\,t=xy$.\n$F_x=f_s g_x+f_t y$. $P(1,2)$: $s=g(1,2)=2,\\,t=2$이므로 $f_s(2,2)=-1,\\,f_t(2,2)=-2$.\n$F_x=(-1)(-3)+(-2)(2)=-1$. $F_y=f_s g_y+f_t x=(-1)(2)+(-2)(1)=-4$.\n최댓값 $=|\\nabla F|=\\sqrt{1+16}=\\sqrt{17}$."
  }),
  build({
    num: 25, subject: "다변수함수", unit: "다중적분", concept: "야코비안(평행사변형)", difficulty: "hard",
    question: "좌표평면에서 네 점 $(4,2),(5,-1),(-2,-1),(-1,-4)$를 꼭짓점으로 하는 사각형을 $R$이라 할 때 $\\displaystyle\\iint_R\\!\\dfrac{x-2y+1}{(3x+y+8)^2}\\,dA$의 값은?",
    options: [o("1","$\\dfrac{181}{44}$"), o("2","$\\dfrac{183}{44}$"), o("3","$\\dfrac{185}{44}$"), o("4","$\\dfrac{17}{4}$"), o("5","$\\dfrac{189}{44}$")],
    answer: 5,
    explanation: "$u=x-2y,\\,v=3x+y$ 치환. 꼭짓점 변환: $(4,2)\\to(0,14),(5,-1)\\to(7,14),(-2,-1)\\to(0,-7),(-1,-4)\\to(7,-7)$. 직사각형 $0\\le u\\le 7,\\,-7\\le v\\le 14$.\n야코비안 $\\!\\begin{vmatrix}1&-2\\\\3&1\\end{vmatrix}=7$, $dxdy=\\dfrac{1}{7}dudv$.\n$\\!\\iint=\\dfrac{1}{7}\\!\\int_0^7(u+1)du\\!\\int_{-7}^{14}\\dfrac{dv}{(v+8)^2}=\\dfrac{1}{7}\\cdot\\dfrac{63}{2}\\cdot\\!\\left[-\\dfrac{1}{v+8}\\right]_{-7}^{14}=\\dfrac{9}{2}\\cdot\\!\\left(1-\\dfrac{1}{22}\\right)=\\dfrac{9}{2}\\cdot\\dfrac{21}{22}=\\dfrac{189}{44}$."
  })
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (2023 명지대):`, data.map((d) => d.id).join(", "));
