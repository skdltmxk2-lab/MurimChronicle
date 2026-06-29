// Upload 2023년도 세종대 편입수학 기출 25문항 (5지선다)
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
const YEAR = "2023";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-sejong-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "다변수함수", unit: "편도함수", concept: "편미분 (역삼각함수)", difficulty: "easy",
    question: "함수 $f(x,y)=x\\arctan(xy)$에 대하여 편미분계수 $f_x(1,-1)$을 구하면?",
    options: [o("1","$\\dfrac{\\pi}{4}+\\dfrac{1}{2}$"), o("2","$\\dfrac{\\pi}{4}-\\dfrac{1}{2}$"), o("3","$\\dfrac{\\pi}{4}$"), o("4","$-\\dfrac{\\pi}{4}+\\dfrac{1}{2}$"), o("5","$-\\dfrac{\\pi}{4}-\\dfrac{1}{2}$")],
    answer: 5,
    explanation: "곱의 미분: $f_x=\\arctan(xy)+x\\cdot\\dfrac{y}{1+(xy)^2}$.\n$(1,-1)$ 대입: $\\arctan(-1)+1\\cdot\\dfrac{-1}{1+1}=-\\dfrac{\\pi}{4}-\\dfrac{1}{2}$."
  }),
  build({
    num: 2, subject: "미분학", unit: "극한과 연속", concept: "$0/0$ 부정형 (로피탈)", difficulty: "medium",
    question: "극한 $\\displaystyle\\lim_{x\\to 0}\\dfrac{\\sin(\\sqrt{x^2+4}-2)}{\\cos(xe^x)-1}$를 구하면?",
    options: [o("1","$\\dfrac{1}{4}$"), o("2","$-\\dfrac{1}{4}$"), o("3","$\\dfrac{1}{2}$"), o("4","$-\\dfrac{1}{2}$"), o("5","$1$")],
    answer: 4,
    explanation: "분자 안 인수 $\\sqrt{x^2+4}-2$를 유리화: $\\dfrac{x^2}{\\sqrt{x^2+4}+2}$.\n$x\\to 0$에서 $\\sin u\\sim u$이므로 분자$\\sim\\dfrac{x^2}{4}$.\n분모: $\\cos v-1\\sim-\\dfrac{v^2}{2}$, $v=xe^x\\sim x$이므로 분모$\\sim-\\dfrac{x^2}{2}$.\n극한 $=\\dfrac{x^2/4}{-x^2/2}=-\\dfrac{1}{2}$."
  }),
  build({
    num: 3, subject: "적분학", unit: "정적분의 계산", concept: "tanh·sech 적분", difficulty: "medium",
    question: "정적분 $\\displaystyle\\int_0^1\\tanh^3 x\\,dx$를 구하면?",
    options: [o("1","$\\ln(\\cosh 1)-\\dfrac{\\tanh^2 1}{2}$"), o("2","$\\ln(\\cosh 1)+\\dfrac{\\tanh^2 1}{2}$"), o("3","$\\dfrac{\\ln(\\cosh 1)}{2}-\\dfrac{\\tanh^2 1}{3}$"), o("4","$\\dfrac{\\ln(\\cosh 1)}{2}+\\dfrac{\\tanh^2 1}{3}$"), o("5","$\\ln(\\cosh 1)-\\dfrac{\\tanh^2 1}{3}$")],
    answer: 1,
    explanation: "$\\tanh^3 x=\\tanh x(1-\\operatorname{sech}^2 x)$ 이용:\n$\\displaystyle\\int_0^1\\tanh x\\,dx-\\int_0^1\\tanh x\\operatorname{sech}^2 x\\,dx$.\n• $\\displaystyle\\int_0^1\\dfrac{\\sinh x}{\\cosh x}dx=[\\ln\\cosh x]_0^1=\\ln\\cosh 1$.\n• $t=\\tanh x$ 치환, $dt=\\operatorname{sech}^2 x\\,dx$: $\\displaystyle\\int_0^{\\tanh 1}\\!t\\,dt=\\dfrac{\\tanh^2 1}{2}$.\n결과: $\\ln(\\cosh 1)-\\dfrac{\\tanh^2 1}{2}$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분의 응용", concept: "극곡선의 길이", difficulty: "medium",
    question: "극곡선 $r=\\theta^2$ ($0\\le\\theta\\le\\sqrt{5}$)의 길이를 구하면?",
    options: [o("1","$5$"), o("2","$\\dfrac{16}{3}$"), o("3","$\\dfrac{17}{3}$"), o("4","$6$"), o("5","$\\dfrac{19}{3}$")],
    answer: 5,
    explanation: "극곡선 길이: $L=\\displaystyle\\int_a^b\\sqrt{r^2+(r')^2}\\,d\\theta$.\n$r=\\theta^2,\\,r'=2\\theta$ → $r^2+(r')^2=\\theta^4+4\\theta^2=\\theta^2(\\theta^2+4)$.\n$\\sqrt{\\cdot}=\\theta\\sqrt{\\theta^2+4}$.\n$L=\\displaystyle\\int_0^{\\sqrt{5}}\\!\\theta\\sqrt{\\theta^2+4}\\,d\\theta=\\dfrac{1}{2}\\cdot\\dfrac{2}{3}\\!\\left[(\\theta^2+4)^{3/2}\\right]_0^{\\sqrt{5}}=\\dfrac{1}{3}(27-8)=\\dfrac{19}{3}$."
  }),
  build({
    num: 5, subject: "다변수함수", unit: "최댓값·최솟값", concept: "유계영역 최적화", difficulty: "medium",
    question: "영역 $D=\\{(x,y)\\mid x+y\\le 1,\\,x\\ge 0,\\,y\\ge 0\\}$에서 함수 $f(x,y)=e^{x^2-2y^2}$의 최댓값과 최솟값의 곱을 구하면?",
    options: [o("1","$\\dfrac{1}{e^2}$"), o("2","$\\dfrac{1}{e}$"), o("3","$1$"), o("4","$e$"), o("5","$e^2$")],
    answer: 2,
    explanation: "지수 $g(x,y)=x^2-2y^2$의 영역 위 최대·최소를 찾자.\n① 내부 임계점: $g_x=2x=0,\\,g_y=-4y=0\\Rightarrow(0,0)$, $g(0,0)=0$.\n② 경계:\n• $y=0$: $g=x^2$, $x\\in[0,1]$ → 최대 $1$, 최소 $0$.\n• $x=0$: $g=-2y^2$, $y\\in[0,1]$ → 최대 $0$, 최소 $-2$.\n• $y=1-x$: $g=x^2-2(1-x)^2=-x^2+4x-2$, $x\\in[0,1]$ → 정점 $x=2$ 영역 밖. $x=0$: $-2$, $x=1$: $1$.\n전체: 지수 최대 $1$, 최소 $-2$. $f$ 최대 $e$, 최소 $e^{-2}$. 곱 $=e\\cdot e^{-2}=\\dfrac{1}{e}$."
  }),
  build({
    num: 6, subject: "다변수함수", unit: "최댓값·최솟값", concept: "AM-GM 부등식", difficulty: "medium",
    question: "곡선 $\\dfrac{x^2}{4}+y^2=1$ 위에서 함수 $f(x,y)=x^3 y$의 최댓값을 구하면?",
    options: [o("1","$\\dfrac{\\sqrt{3}}{2}$"), o("2","$\\sqrt{3}$"), o("3","$\\dfrac{3\\sqrt{3}}{2}$"), o("4","$2\\sqrt{3}$"), o("5","$\\dfrac{5\\sqrt{3}}{2}$")],
    answer: 3,
    explanation: "$\\dfrac{x^2}{4}+y^2=\\dfrac{x^2}{12}+\\dfrac{x^2}{12}+\\dfrac{x^2}{12}+y^2=1$ (AM-GM 적용을 위해 4개로 분배).\n네 항에 산술-기하평균 부등식: $1\\ge 4\\sqrt[4]{\\dfrac{x^2}{12}\\cdot\\dfrac{x^2}{12}\\cdot\\dfrac{x^2}{12}\\cdot y^2}=4\\sqrt[4]{\\dfrac{x^6 y^2}{12^3}}$.\n$\\Rightarrow\\dfrac{1}{4^4}\\ge\\dfrac{x^6 y^2}{12^3}\\Rightarrow x^6 y^2\\le\\dfrac{12^3}{4^4}=\\dfrac{27}{4}$.\n$|x^3 y|\\le\\sqrt{\\dfrac{27}{4}}=\\dfrac{3\\sqrt{3}}{2}$. 최댓값 $\\dfrac{3\\sqrt{3}}{2}$."
  }),
  build({
    num: 7, subject: "적분학", unit: "급수", concept: "교대급수합 (로그·아크탄)", difficulty: "mediumHard",
    question: "급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-1)^{n-1}}{2n(2n-1)\\,3^n}$의 값을 구하면?",
    options: [o("1","$\\dfrac{\\sqrt{3}}{18}\\pi-\\dfrac{1}{2}\\ln\\dfrac{4}{3}$"), o("2","$\\dfrac{\\sqrt{3}}{6}\\pi-\\dfrac{1}{2}\\ln\\dfrac{2}{3}$"), o("3","$\\dfrac{\\sqrt{3}}{18}\\pi-\\dfrac{1}{2}\\ln\\dfrac{2}{3}$"), o("4","$\\dfrac{\\sqrt{3}}{6}\\pi-\\dfrac{1}{2}\\ln\\dfrac{4}{3}$"), o("5","$\\dfrac{\\sqrt{3}}{18}\\pi-\\dfrac{1}{2}\\ln\\dfrac{1}{3}$")],
    answer: 1,
    explanation: "Note: $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{x^n}{n}=-\\ln(1-x)$, $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(-1)^n}{2n+1}x^{2n+1}=\\arctan x$.\n부분분수 $\\dfrac{1}{2n(2n-1)}=\\dfrac{1}{2n-1}-\\dfrac{1}{2n}$의 변형이지만 여기선 $\\dfrac{1}{2n}-\\dfrac{1}{2n-1}$ 형태가 잘 맞음(부호조정).\n주어진 합 $=\\sum(-1)^{n-1}\\!\\left(\\dfrac{1}{2n-1}-\\dfrac{1}{2n}\\right)\\!\\dfrac{1}{3^n}$로 변형 (단순화 위해).\n실제 풀이: $\\dfrac{1}{2n(2n-1)}=\\dfrac{1}{2n-1}-\\dfrac{1}{2n}$ 분리하여 두 급수로 나눔.\n① $-\\dfrac{1}{2}\\!\\sum(-1)^{n-1}\\!\\dfrac{1}{n}(1/3)^n=-\\dfrac{1}{2}\\ln\\dfrac{4}{3}$ (로그급수).\n② $\\sum\\dfrac{(-1)^{n-1}}{2n-1}(1/3)^n$를 $\\arctan(1/\\sqrt{3})=\\pi/6$로 정리 → $\\dfrac{\\sqrt{3}}{18}\\pi$.\n합: $\\dfrac{\\sqrt{3}}{18}\\pi-\\dfrac{1}{2}\\ln\\dfrac{4}{3}$."
  }),
  build({
    num: 8, subject: "선형대수", unit: "행렬의 거듭제곱", concept: "케일리-해밀턴 정리", difficulty: "medium",
    question: "$3\\times 3$ 행렬 $A$의 특성다항식이 $\\lambda^3-\\lambda^2+\\lambda-1$일 때, $A^{101}$을 구하면?",
    options: [o("1","$A$"), o("2","$-A$"), o("3","$A^2$"), o("4","$-A^2$"), o("5","$A^2-A+I$")],
    answer: 1,
    explanation: "특성다항식 $\\lambda^3-\\lambda^2+\\lambda-1=(\\lambda-1)(\\lambda^2+1)$의 근은 $1,\\pm i$ (복소근).\n케일리-해밀턴 정리: $A^3-A^2+A-I=O$ → $A^3=A^2-A+I$.\n$A^4=A\\cdot A^3=A(A^2-A+I)=A^3-A^2+A=(A^2-A+I)-A^2+A=I$.\n주기 $4$: $A^{101}=A^{4\\cdot 25+1}=I^{25}\\cdot A=A$."
  }),
  build({
    num: 9, subject: "적분학", unit: "특이적분", concept: "특이적분 수렴 판정", difficulty: "medium",
    question: "다음 특이적분 중에서 수렴하는 것만을 있는 대로 고르면?\n\n(ㄱ) $\\displaystyle\\int_0^1\\ln x\\,dx$\n(ㄴ) $\\displaystyle\\int_{-\\infty}^{\\infty}\\dfrac{x}{x^2+1}dx$\n(ㄷ) $\\displaystyle\\int_1^{\\infty}\\dfrac{\\ln x}{x^2}dx$",
    options: [o("1","ㄱ"), o("2","ㄱ,ㄴ"), o("3","ㄱ,ㄷ"), o("4","ㄴ,ㄷ"), o("5","ㄱ,ㄴ,ㄷ")],
    answer: 3,
    explanation: "(ㄱ) 수렴: $\\displaystyle\\int_0^1\\ln x\\,dx=[x\\ln x-x]_0^1=-1$ (유한값).\n(ㄴ) 발산: 무한대 양쪽 극한 분리 시 $\\displaystyle\\int_0^{\\infty}\\dfrac{x}{x^2+1}dx\\sim\\!\\int^{\\infty}\\dfrac{1}{x}dx$ → 발산. (주값은 $0$이지만 표준 정의 발산.)\n(ㄷ) 수렴: 부분적분 $\\displaystyle\\int_1^{\\infty}\\dfrac{\\ln x}{x^2}dx=\\!\\left[-\\dfrac{\\ln x}{x}\\right]_1^{\\infty}+\\!\\int_1^{\\infty}\\dfrac{dx}{x^2}=0+1=1$ → 수렴.\n수렴: ㄱ, ㄷ."
  }),
  build({
    num: 10, subject: "적분학", unit: "정적분의 계산", concept: "삼각치환", difficulty: "medium",
    question: "정적분 $\\displaystyle\\int_0^1\\dfrac{1}{(x^2+1)^2}dx$를 구하면?",
    options: [o("1","$\\dfrac{1}{2}+\\dfrac{\\pi}{6}$"), o("2","$\\dfrac{1}{3}+\\dfrac{\\pi}{7}$"), o("3","$\\dfrac{1}{4}+\\dfrac{\\pi}{8}$"), o("4","$\\dfrac{1}{5}+\\dfrac{\\pi}{9}$"), o("5","$\\dfrac{1}{6}+\\dfrac{\\pi}{10}$")],
    answer: 3,
    explanation: "$x=\\tan\\theta$ 치환: $dx=\\sec^2\\theta\\,d\\theta$, $1+x^2=\\sec^2\\theta$.\n$\\displaystyle\\int_0^{\\pi/4}\\!\\dfrac{\\sec^2\\theta}{\\sec^4\\theta}d\\theta=\\int_0^{\\pi/4}\\!\\cos^2\\theta\\,d\\theta=\\!\\left[\\dfrac{\\theta}{2}+\\dfrac{\\sin 2\\theta}{4}\\right]_0^{\\pi/4}=\\dfrac{\\pi}{8}+\\dfrac{1}{4}$."
  }),
  build({
    num: 11, subject: "선형대수", unit: "에르미트 행렬", concept: "에르미트 행렬 성질 판정", difficulty: "medium",
    question: "다음 행렬 $A$에 관한 설명 중 옳지 않은 것을 고르면?\n\n$A=\\begin{pmatrix}1 & i & 0 & 2\\\\ -i & -1 & 1 & 1+i\\\\ 0 & 1 & -1 & 4\\\\ 2 & 1-i & 4 & 1\\end{pmatrix}$",
    options: [o("1","$A^*=A$"), o("2","$A$는 유니타리 대각화가 가능하다."), o("3","$A$의 고윳값은 모두 실수이다."), o("4","$v$가 $A$의 고유벡터이면 $A^* v$도 $A$의 고유벡터이다."), o("5","$A$의 고윳값의 절댓값은 모두 $1$이다.")],
    answer: 5,
    explanation: "$A$가 에르미트 행렬임 확인: $A^*$ (켤레전치) $=A$. → (1) 참.\n(2) 참: 에르미트 행렬은 항상 유니타리 대각화 가능 (스펙트럼 정리).\n(3) 참: 에르미트 행렬의 고윳값은 모두 실수.\n(4) 참: $A=A^*$이므로 $Av=\\lambda v\\Rightarrow A^*v=\\lambda v$, 즉 $A^*v$도 같은 $\\lambda$의 고유벡터.\n(5) 거짓: \"고윳값의 절댓값이 모두 $1$\"은 유니타리(또는 직교) 행렬의 성질이지 에르미트 행렬의 성질이 아님."
  }),
  build({
    num: 12, subject: "미분학", unit: "고차도함수", concept: "테일러 전개 계수", difficulty: "medium",
    question: "$f(x)=e^x\\!\\left\\{\\sin(x^2)+\\sin(x^3)\\right\\}$에 대하여 $f^{(6)}(0)$의 값을 구하면? (단, $f^{(n)}(x)$는 $f(x)$의 $n$계 도함수를 의미한다.)",
    options: [o("1","$10$"), o("2","$20$"), o("3","$30$"), o("4","$40$"), o("5","$50$")],
    answer: 3,
    explanation: "맥로린 전개를 사용: $e^x=\\sum\\dfrac{x^n}{n!}$, $\\sin u=u-\\dfrac{u^3}{6}+\\cdots$.\n$\\sin(x^2)=x^2-\\dfrac{x^6}{6}+\\cdots$, $\\sin(x^3)=x^3-\\cdots$ (6차 이하만).\n$\\sin(x^2)+\\sin(x^3)=x^2+x^3-\\dfrac{x^6}{6}+\\cdots$.\n$e^x\\cdot(\\cdot)$의 $x^6$ 계수:\n• $x^2$항 × $e^x$의 $x^4/4!$항: $1\\cdot\\dfrac{1}{24}=\\dfrac{1}{24}$.\n• $x^3$항 × $e^x$의 $x^3/3!$항: $1\\cdot\\dfrac{1}{6}=\\dfrac{1}{6}$.\n• $-x^6/6$항 × $e^x$의 $1$항: $-\\dfrac{1}{6}$.\n합: $\\dfrac{1}{24}+\\dfrac{1}{6}-\\dfrac{1}{6}=\\dfrac{1}{24}$.\n$f^{(6)}(0)=$ ($x^6$ 계수)$\\times 6!=\\dfrac{720}{24}=30$."
  }),
  build({
    num: 13, subject: "적분학", unit: "정적분의 응용", concept: "파푸스 정리 (회전면 넓이)", difficulty: "easyMedium",
    question: "중심이 $(0,1)$이고 반지름의 길이가 $1$인 원을 $x$축을 중심으로 회전시켜 얻은 회전면의 넓이를 구하면?",
    options: [o("1","$4\\pi^2-8\\pi$"), o("2","$4\\pi^2$"), o("3","$8\\pi$"), o("4","$4\\pi^2+8\\pi$"), o("5","$6\\pi^2$")],
    answer: 2,
    explanation: "파푸스(Pappus) 정리: 회전면의 넓이 $S=$ (회전곡선의 길이) $\\times$ (도형 중심이 회전 시 이동거리).\n원의 둘레: $2\\pi\\cdot 1=2\\pi$.\n중심 $(0,1)$이 $x$축으로부터 $1$ 떨어져 있으므로, 중심이 회전하며 그리는 원의 둘레: $2\\pi\\cdot 1=2\\pi$.\n$S=2\\pi\\cdot 2\\pi=4\\pi^2$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "극좌표·극곡선", concept: "두 카디오이드 공통 영역", difficulty: "mediumHard",
    question: "다음 두 극곡선의 내부에 공통으로 놓인 영역의 넓이를 구하면?\n\n$r=1-\\cos\\theta,\\quad r=1+\\cos\\theta$",
    options: [o("1","$\\dfrac{3\\pi}{2}-\\dfrac{9}{2}$"), o("2","$\\dfrac{3\\pi}{2}-4$"), o("3","$\\dfrac{3\\pi}{2}-\\dfrac{7}{2}$"), o("4","$\\dfrac{5\\pi}{2}-\\dfrac{15}{2}$"), o("5","$\\dfrac{5\\pi}{2}-7$")],
    answer: 2,
    explanation: "두 카디오이드는 $y$축 대칭으로 마주봄. 교점: $1-\\cos\\theta=1+\\cos\\theta\\Rightarrow\\theta=\\pi/2,\\,3\\pi/2$.\n공통 영역의 1/4(첫 사분면 위쪽)을 $r=1+\\cos\\theta$ ($\\theta:\\pi/2\\to\\pi$)로 적분.\n$S=4\\cdot\\dfrac{1}{2}\\!\\int_{\\pi/2}^{\\pi}\\!(1+\\cos\\theta)^2 d\\theta=2\\!\\int_{\\pi/2}^{\\pi}\\!(1+2\\cos\\theta+\\cos^2\\theta)d\\theta$\n$=2\\!\\int_{\\pi/2}^{\\pi}\\!\\left(\\dfrac{3}{2}+2\\cos\\theta+\\dfrac{\\cos 2\\theta}{2}\\right)d\\theta=2\\!\\left[\\dfrac{3\\theta}{2}+2\\sin\\theta+\\dfrac{\\sin 2\\theta}{4}\\right]_{\\pi/2}^{\\pi}$\n$=2\\!\\left[\\dfrac{3\\pi}{4}-2\\right]=\\dfrac{3\\pi}{2}-4$."
  }),
  build({
    num: 15, subject: "미분학", unit: "역삼각함수", concept: "곡선 그래프와 직선의 교점", difficulty: "medium",
    question: "곡선 $y=\\arccos(\\sin x)$와 직선 $y=-\\dfrac{x}{2}+\\dfrac{\\pi}{2}$의 교점의 개수를 구하면?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 3,
    explanation: "$x$축으로 $-\\pi/2$ 평행이동(교점 개수 불변):\n$y=\\arccos(\\sin(x+\\pi/2))=\\arccos(\\cos x)=|x|$의 주기적 톱니파.\n직선: $y=-\\dfrac{x}{2}+\\dfrac{\\pi}{4}$.\n주기 $2\\pi$ 톱니의 골은 $y=0$ ($x=2k\\pi$), 마루는 $y=\\pi$ ($x=(2k+1)\\pi$).\n직선이 $y$축 절편 $\\pi/4$, 기울기 $-1/2$. 평면에 그래프 그리면 직선이 톱니 모양과 만나는 곳은 정확히 $3$개."
  }),
  build({
    num: 16, subject: "선형대수", unit: "고유치", concept: "고윳값 제곱합 (Newton 항등식)", difficulty: "mediumHard",
    question: "다음 행렬의 모든 고윳값의 제곱의 합을 $f(a)$라 하자. 다항식 $f(a)$의 모든 계수의 합을 구하면?\n\n$\\begin{pmatrix}2 & 4 & a\\\\ 4 & a & 2\\\\ a & 2 & 4\\end{pmatrix}$",
    options: [o("1","$30$"), o("2","$41$"), o("3","$52$"), o("4","$63$"), o("5","$74$")],
    answer: 4,
    explanation: "고윳값 $\\lambda_1,\\lambda_2,\\lambda_3$ 둘 때 Newton 항등식:\n$\\sum\\lambda_i^2=(\\sum\\lambda_i)^2-2\\!\\sum_{i<j}\\lambda_i\\lambda_j$.\n• $\\sum\\lambda_i=\\operatorname{tr}A=2+a+4=6+a$.\n• $\\sum_{i<j}\\lambda_i\\lambda_j=$ 2차 주소행렬식의 합:\n  $\\det\\!\\begin{pmatrix}2&4\\\\4&a\\end{pmatrix}+\\det\\!\\begin{pmatrix}a&2\\\\2&4\\end{pmatrix}+\\det\\!\\begin{pmatrix}2&a\\\\a&4\\end{pmatrix}$\n  $=(2a-16)+(4a-4)+(8-a^2)=-a^2+6a-12$.\n$f(a)=(6+a)^2-2(-a^2+6a-12)=3a^2+60$.\n계수의 합 $=f(1)=3+60=63$."
  }),
  build({
    num: 17, subject: "다변수함수", unit: "면적분", concept: "발산정리", difficulty: "medium",
    question: "곡면 $S:\\,x^2+y^2+z^2=9$와 벡터마당 $F(x,y,z)=\\langle x+x^2\\sin y,\\,x\\cos y,\\,-xz\\sin y\\rangle$에 대하여 면적분 $\\displaystyle\\iint_S F\\cdot n\\,dS$를 구하면? (단, $n$은 곡면 $S$의 각 점에서 바깥쪽을 향하는 단위법선벡터이다.)",
    options: [o("1","$36\\pi$"), o("2","$42\\pi$"), o("3","$48\\pi$"), o("4","$54\\pi$"), o("5","$60\\pi$")],
    answer: 1,
    explanation: "발산: $\\nabla\\cdot F=(1+2x\\sin y)+(-x\\sin y)+(-x\\sin y)=1$.\nGauss 발산정리: $\\displaystyle\\iint_S F\\cdot n\\,dS=\\iiint_E 1\\,dV=$ 반지름 $3$ 구의 부피 $=\\dfrac{4}{3}\\pi\\cdot 27=36\\pi$."
  }),
  build({
    num: 18, subject: "다변수함수", unit: "편도함수", concept: "혼합편도함수 (피스조각 정의 함수)", difficulty: "mediumHard",
    question: "다음 함수 $f$에 대하여 $f_{yx}(0,0)$의 값을 구하면?\n\n$f(x,y)=\\begin{cases}\\dfrac{2x^3 y}{x^2+y^2} & ((x,y)\\ne(0,0))\\\\ 0 & ((x,y)=(0,0))\\end{cases}$",
    options: [o("1","존재하지 않는다"), o("2","$0$"), o("3","$1$"), o("4","$2$"), o("5","$6$")],
    answer: 4,
    explanation: "$y$ 먼저 미분 후 $x$ 미분.\n$y\\ne 0$ 영역: $f_y=\\dfrac{2x^3(x^2+y^2)-2x^3 y\\cdot 2y}{(x^2+y^2)^2}=\\dfrac{2x^3(x^2-y^2)}{(x^2+y^2)^2}$.\n$y=0$ 위에서: $f_y(x,0)=\\dfrac{2x^3\\cdot x^2}{x^4}=2x$ ($x\\ne 0$).\n$f_y(0,0)=\\lim_{h\\to 0}\\dfrac{f(0,h)-0}{h}=\\lim\\dfrac{0}{h}=0$.\n따라서 $f_y(x,0)=2x$ (모든 $x$).\n$f_{yx}(0,0)=\\dfrac{d}{dx}[f_y(x,0)]\\big|_{x=0}=2$."
  }),
  build({
    num: 19, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피로부터 곡선 길이", difficulty: "mediumHard",
    question: "$x\\ge 0$에서 정의된 연속 함수 $f(x)$는 $f(x)\\ge 0$을 만족시킨다. 모든 양의 실수 $a$에 대하여 곡선 $y=f(x)$, $x$축, $y$축 및 직선 $x=a$로 둘러싸인 영역을 $y$축을 중심으로 회전시켜 얻은 입체의 부피는 $a^4$이다. $0\\le x\\le\\dfrac{\\pi}{3}$에서 곡선 $y=f(x)$의 길이를 구하면?",
    options: [o("1","$\\dfrac{\\sqrt{2}}{8}\\pi+\\dfrac{\\pi}{8}\\ln(1+\\sqrt{2})$"), o("2","$\\dfrac{5}{18}\\pi+\\dfrac{\\pi}{8}\\ln 3$"), o("3","$\\dfrac{\\sqrt{5}}{4}\\pi+\\dfrac{\\pi}{8}\\ln(2+\\sqrt{5})$"), o("4","$\\dfrac{\\sqrt{17}}{2}\\pi+\\dfrac{\\pi}{8}\\ln(4+\\sqrt{17})$"), o("5","$\\sqrt{65}\\pi+\\dfrac{\\pi}{8}\\ln(8+\\sqrt{65})$")],
    answer: 2,
    explanation: "원통껍질법: $V(a)=\\displaystyle\\int_0^a 2\\pi x f(x)\\,dx=a^4$.\n양변 $a$로 미분: $2\\pi a f(a)=4a^3\\Rightarrow f(a)=\\dfrac{2a^2}{\\pi}$, 즉 $f(x)=\\dfrac{2x^2}{\\pi}$.\n곡선 길이: $f'(x)=\\dfrac{4x}{\\pi}$, $L=\\displaystyle\\int_0^{\\pi/3}\\!\\sqrt{1+\\dfrac{16x^2}{\\pi^2}}\\,dx=\\!\\int_0^{\\pi/3}\\!\\dfrac{1}{\\pi}\\sqrt{\\pi^2+16x^2}\\,dx$.\n$x=\\dfrac{\\pi}{4}\\tan\\theta$ 치환 ($x=\\pi/3$에서 $\\tan\\theta=4/3,\\,\\sec\\theta=5/3$):\n$L=\\dfrac{\\pi}{4}\\!\\int_0^{\\arctan(4/3)}\\!\\sec^3\\theta\\,d\\theta=\\dfrac{\\pi}{4}\\cdot\\dfrac{1}{2}[\\sec\\theta\\tan\\theta+\\ln|\\sec\\theta+\\tan\\theta|]$\n$=\\dfrac{\\pi}{8}\\!\\left(\\dfrac{5}{3}\\cdot\\dfrac{4}{3}+\\ln 3\\right)=\\dfrac{5\\pi}{18}+\\dfrac{\\pi}{8}\\ln 3$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "선적분", concept: "그린 정리", difficulty: "medium",
    question: "곡선 $C$가 $(-2,0)$부터 $(2,0)$까지의 반원 $y=-\\sqrt{4-x^2}$일 때, 다음 선적분을 구하면?\n\n$\\displaystyle\\int_C(4y-3x^2)dx+(6x+\\sqrt{y^2+1})\\,dy$",
    options: [o("1","$8\\pi-16$"), o("2","$6\\pi$"), o("3","$6\\pi+4$"), o("4","$4\\pi-16$"), o("5","$4\\pi+4$")],
    answer: 4,
    explanation: "$C$를 $x$축 선분 $C'$ ($(2,0)\\to(-2,0)$)으로 닫아 폐곡선 $C\\cup C'$ 만들면 반시계방향, 영역 $D$는 아래반원판.\nGreen: $\\partial_x Q-\\partial_y P=6-4=2$.\n$\\displaystyle\\oint(P\\,dx+Q\\,dy)=\\iint_D 2\\,dA=2\\cdot 2\\pi=4\\pi$ ($D$의 면적 $=2\\pi$).\n$\\displaystyle\\int_{C'}P\\,dx=\\int_2^{-2}(-3x^2)dx=-(-8-8)=16$ ($y=0$ 위라 $Q\\,dy=0$).\n따라서 $\\displaystyle\\int_C+16=4\\pi\\Rightarrow\\int_C=4\\pi-16$."
  }),
  build({
    num: 21, subject: "다변수함수", unit: "면적분", concept: "곡면 겉넓이 (대칭 분할)", difficulty: "mediumHard",
    question: "좌표공간에서 다음과 같이 정의되는 입체 $E$의 겉넓이를 구하면?\n\n$E=\\{(x,y,z)\\mid 0\\le z\\le 1-x^2,\\ 0\\le z\\le 1-y^2\\}$",
    options: [o("1","$\\dfrac{10}{3}(\\sqrt{5}+1)$"), o("2","$4\\sqrt{5}+3$"), o("3","$\\dfrac{4}{3}(5\\sqrt{5}-3)$"), o("4","$\\dfrac{5}{3}(5\\sqrt{5}-4)$"), o("5","$10\\sqrt{5}-11$")],
    answer: 1,
    explanation: "$E$의 윗면은 $z=\\min(1-x^2,1-y^2)$, 옆 4면은 직사각형 측면. 베이스는 정사각형 $[-1,1]^2$이지만 윗덮개 활성영역만.\n① 윗면 ($z=1-x^2$, 영역 $|y|\\le|x|\\le 1$): 1/8 대칭이라\n$S_1=8\\!\\iint_{0\\le y\\le x\\le 1}\\!\\sqrt{1+4x^2}\\,dy\\,dx=8\\!\\int_0^1\\!x\\sqrt{1+4x^2}dx=8\\cdot\\dfrac{(5\\sqrt{5}-1)}{12}=\\dfrac{2(5\\sqrt{5}-1)}{3}$.\n($z=1-y^2$ 영역과 합산은 이미 대칭에 포함.)\n② 옆 4면 (예: $x=1$ 면 위 $0\\le z\\le 1-y^2$ 영역): 한 면당 $\\int_{-1}^1(1-y^2)dy=4/3$? 잠깐 — 옆면은 직사각형이 아니라 곡선 잘려.\n실제: 측면은 $x=\\pm 1$, $y=\\pm 1$ 의 평면 위 $z\\le 0$ 영역만 → 면적 $0$. $E$는 측면 직사각형이 없음.\n결과: $S_1=\\dfrac{2(5\\sqrt{5}-1)}{3}+ S_2$. $S_2$ (밑면 $z=0$): 정사각형 면적 $4$.\n총 $\\dfrac{10\\sqrt{5}-2}{3}+4=\\dfrac{10\\sqrt{5}+10}{3}=\\dfrac{10}{3}(\\sqrt{5}+1)$."
  }),
  build({
    num: 22, subject: "다변수함수", unit: "선적분", concept: "스토크스 정리 (평면+원기둥 교선)", difficulty: "mediumHard",
    question: "곡선 $C$가 평면 $x-y+z=1$과 원기둥 $x^2+y^2=1$의 교선일 때, 선적분 $\\displaystyle\\int_C 2z\\,dx-x\\,dy+e^{z^2}dz$의 값을 구하면? (단, $C$의 방향은 위에서 봤을 때 시계 반대 방향이다.)",
    options: [o("1","$-\\pi$"), o("2","$-2\\pi$"), o("3","$-3\\pi$"), o("4","$-4\\pi$"), o("5","$-5\\pi$")],
    answer: 3,
    explanation: "스토크스 정리: $\\displaystyle\\oint_C F\\cdot dr=\\iint_S\\operatorname{curl}F\\cdot n\\,dS$.\n$F=(2z,-x,e^{z^2})$ → $\\operatorname{curl}F=(0,2,-1)$.\n곡면 $S$: 평면 $z=1-x+y$ (원판 $x^2+y^2\\le 1$ 위쪽). 위방향 법선소: $\\vec n\\,dS=(1,-1,1)\\,dx\\,dy$.\n$\\operatorname{curl}F\\cdot\\vec n\\,dS=(0,2,-1)\\cdot(1,-1,1)=-2-1=-3$.\n$\\displaystyle\\iint_D(-3)\\,dA=-3\\pi$ (단위원의 면적)."
  }),
  build({
    num: 23, subject: "다변수함수", unit: "면적분", concept: "스토크스 정리 (반타원체)", difficulty: "mediumHard",
    question: "벡터마당 $F(x,y,z)=\\langle 3y,\\,x,\\,e^{z^2}\\rangle$이고, 곡면 $S$는 타원면 $x^2+2y^2+3z^2=1$ 중에서 $z\\ge 0$인 부분일 때, 면적분 $\\displaystyle\\iint_S\\operatorname{curl}F\\cdot n\\,dS$를 구하면? (단, $n$은 곡면 $S$의 각 점에서 위쪽을 향하는 단위법선벡터이다.)",
    options: [o("1","$-\\pi$"), o("2","$-\\sqrt{2}\\,\\pi$"), o("3","$-\\sqrt{3}\\,\\pi$"), o("4","$-2\\pi$"), o("5","$-\\sqrt{5}\\,\\pi$")],
    answer: 2,
    explanation: "$\\partial S$는 $z=0$, $x^2+2y^2=1$ 타원 (위쪽 $n$이라 반시계방향).\n매개변수: $x=\\cos t,\\,y=\\dfrac{\\sin t}{\\sqrt{2}},\\,z=0$, $t:0\\to 2\\pi$.\n$F\\cdot dr=(3y,x,1)\\cdot(-\\sin t,\\dfrac{\\cos t}{\\sqrt{2}},0)dt=\\!\\left(-\\dfrac{3\\sin^2 t}{\\sqrt{2}}+\\dfrac{\\cos^2 t}{\\sqrt{2}}\\right)dt$.\n적분: $\\displaystyle\\int_0^{2\\pi}\\!\\left(-\\dfrac{3}{\\sqrt{2}}\\sin^2 t+\\dfrac{1}{\\sqrt{2}}\\cos^2 t\\right)dt=-\\dfrac{3}{\\sqrt{2}}\\pi+\\dfrac{1}{\\sqrt{2}}\\pi=-\\dfrac{2\\pi}{\\sqrt{2}}=-\\sqrt{2}\\,\\pi$."
  }),
  build({
    num: 24, subject: "다변수함수", unit: "이중적분", concept: "이차형식 변환 + 극좌표", difficulty: "mediumHard",
    question: "좌표 평면에서 다음과 같이 정의되는 영역 $R$에 대하여 이중적분 $\\displaystyle\\iint_R e^{-4x^2+4xy-7y^2}dA$를 구하면?\n\n(단, $R=\\{(x,y)\\in\\mathbb{R}^2\\mid 4x^2-4xy+7y^2\\le 1\\}$)",
    options: [o("1","$\\dfrac{\\pi\\sqrt{3}}{9}\\!\\left(1-\\dfrac{1}{e}\\right)$"), o("2","$\\dfrac{\\pi}{5}\\!\\left(1-\\dfrac{1}{e}\\right)$"), o("3","$\\dfrac{\\pi\\sqrt{5}}{11}\\!\\left(1-\\dfrac{1}{e}\\right)$"), o("4","$\\dfrac{\\pi\\sqrt{6}}{12}\\!\\left(1-\\dfrac{1}{e}\\right)$"), o("5","$\\dfrac{\\pi\\sqrt{7}}{13}\\!\\left(1-\\dfrac{1}{e}\\right)$")],
    answer: 4,
    explanation: "이차형식 $Q(x,y)=4x^2-4xy+7y^2=(x\\,\\,y)\\!\\begin{pmatrix}4&-2\\\\-2&7\\end{pmatrix}\\!\\binom{x}{y}$, $\\det=24$.\n적분영역과 피적분식이 둘 다 $Q$로 표현 → 변수변환 $Q\\to u^2+v^2$. Jacobian $=1/\\sqrt{\\det}=1/\\sqrt{24}$.\n$\\displaystyle\\iint_R e^{-Q}dA=\\dfrac{1}{\\sqrt{24}}\\!\\iint_{u^2+v^2\\le 1}\\!e^{-(u^2+v^2)}du\\,dv$.\n극좌표: $\\displaystyle=\\dfrac{1}{2\\sqrt{6}}\\!\\int_0^{2\\pi}\\!d\\theta\\!\\int_0^1\\!e^{-r^2}r\\,dr=\\dfrac{1}{2\\sqrt{6}}\\cdot 2\\pi\\cdot\\dfrac{1-e^{-1}}{2}=\\dfrac{\\pi}{2\\sqrt{6}}\\!\\left(1-\\dfrac{1}{e}\\right)=\\dfrac{\\pi\\sqrt{6}}{12}\\!\\left(1-\\dfrac{1}{e}\\right)$."
  }),
  build({
    num: 25, subject: "선형대수", unit: "행렬식", concept: "피보나치 행렬 정리", difficulty: "mediumHard",
    question: "자연수 $n$에 대하여 $n\\times n$ 행렬 $A_n$의 $(i,j)$ 성분 $a_{ij}$는 다음과 같이 주어진다.\n\n$a_{ij}=\\begin{cases}-j & (i=j-1)\\\\ j & (i=j\\text{ or }i=j+1)\\\\ 0 & (\\text{그 외})\\end{cases}$\n\n$\\dfrac{\\det(A_{10})}{\\det(A_9)}$를 구하면?",
    options: [o("1","$\\dfrac{174}{11}$"), o("2","$\\dfrac{175}{11}$"), o("3","$\\dfrac{176}{11}$"), o("4","$\\dfrac{177}{11}$"), o("5","$\\dfrac{178}{11}$")],
    answer: 5,
    explanation: "직접 계산을 통해 패턴 발견: $\\dfrac{|A_n|}{n!}=F_n$ (피보나치 수열, $F_1=1,F_2=2,F_{n+2}=F_{n+1}+F_n$).\n$|A_1|=1=1\\cdot 1!$, $|A_2|=4=2\\cdot 2!$, $|A_3|=18=3\\cdot 3!$, $|A_4|=120=5\\cdot 4!$, $|A_5|=8\\cdot 5!$, ...\n계산: $F_5=8,F_6=13,F_7=21,F_8=34,F_9=55,F_{10}=89$.\n따라서 $\\dfrac{\\det(A_{10})}{\\det(A_9)}=\\dfrac{F_{10}\\cdot 10!}{F_9\\cdot 9!}=\\dfrac{89\\cdot 10}{55}=\\dfrac{890}{55}=\\dfrac{178}{11}$."
  }),
];

console.log(`Uploading ${problems.length} problems for ${SCHOOL} ${YEAR}...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
console.log(`✅ Inserted ${data?.length ?? 0} questions for ${SCHOOL} ${YEAR}`);
