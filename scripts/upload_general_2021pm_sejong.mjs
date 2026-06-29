// Upload 2021년도 세종대(오후) 편입수학 기출 25문항 (5지선다)
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
const SESSION = "오후";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation, questionType = "multiple_choice", answerText = "" }) {
  const id = `q-${YEAR}pm-sejong-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, SESSION, subject, unit, concept].filter(Boolean)));
  const isSubjective = questionType === "subjective";
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options: isSubjective ? [] : options, correct_option_id: isSubjective ? "" : String(answer), answer_text: isSubjective ? answerText : null, question_type: questionType, explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "쌍곡함수", concept: "쌍곡함수의 값", difficulty: "easy",
    question: "$\\tanh 1$의 값은?",
    options: [o("1","$\\dfrac{1}{e^2+1}$"), o("2","$\\dfrac{e^2-1}{e^2+1}$"), o("3","$\\dfrac{e^2}{e^2+1}$"), o("4","$\\dfrac{e^2}{e^2-1}$"), o("5","$\\dfrac{e^2+1}{e^2-1}$")],
    answer: 2,
    explanation: "$\\tanh x=\\dfrac{e^x-e^{-x}}{e^x+e^{-x}}=\\dfrac{e^{2x}-1}{e^{2x}+1}$.\n$x=1$ 대입: $\\tanh 1=\\dfrac{e^2-1}{e^2+1}$."
  }),
  build({
    num: 2, subject: "미분학", unit: "극한과 연속", concept: "$0\\cdot\\infty$ 부정형", difficulty: "easy",
    question: "극한 $\\displaystyle\\lim_{x\\to 0^+}x\\ln x$의 값은?",
    options: [o("1","$-\\infty$"), o("2","$0$"), o("3","$1$"), o("4","$e$"), o("5","$\\infty$")],
    answer: 2,
    explanation: "$0\\cdot\\infty$ 부정형. 표준 결과: $\\displaystyle\\lim_{x\\to 0^+}x\\ln x=0$.\n증명: $\\dfrac{\\ln x}{1/x}$ 형태로 변환 후 로피탈: $\\dfrac{1/x}{-1/x^2}=-x\\to 0$."
  }),
  build({
    num: 3, subject: "다변수함수", unit: "벡터와 공간도형", concept: "스칼라 삼중적", difficulty: "easy",
    question: "세 벡터 $a=(1,-2,3),\\,b=(2,0,1),\\,c=(0,1,2)$에 대하여 $(a\\times b)\\cdot c$의 값은?",
    options: [o("1","$9$"), o("2","$10$"), o("3","$11$"), o("4","$12$"), o("5","$13$")],
    answer: 5,
    explanation: "$(a\\times b)\\cdot c=\\det\\!\\begin{pmatrix}1 & -2 & 3\\\\ 2 & 0 & 1\\\\ 0 & 1 & 2\\end{pmatrix}$.\n1행 전개: $1(0\\cdot 2-1\\cdot 1)-(-2)(2\\cdot 2-1\\cdot 0)+3(2\\cdot 1-0\\cdot 0)=1\\cdot(-1)+2\\cdot 4+3\\cdot 2=-1+8+6=13$."
  }),
  build({
    num: 4, subject: "선형대수", unit: "선형사상", concept: "선형사상 값 외삽", difficulty: "medium",
    question: "선형사상 $L:\\mathbb{R}^2\\to\\mathbb{R}^2$에 대하여 $L(1,1)=(4,1)$이고 $L(1,-1)=(2,2)$일 때 $L(-1,3)$의 값은?",
    options: [], answer: "", questionType: "subjective", answerText: "$(0,-3)$",
    explanation: "$(-1,3)$를 $(1,1)$과 $(1,-1)$의 일차결합으로 표현: $(-1,3)=a(1,1)+b(1,-1)$ → $a+b=-1,\\,a-b=3$.\n해결: $a=1,\\,b=-2$.\n선형사상 성질: $L(-1,3)=L(1,1)-2L(1,-1)=(4,1)-2(2,2)=(4-4,\\,1-4)=(0,-3)$."
  }),
  build({
    num: 5, subject: "다변수함수", unit: "방향도함수", concept: "방향도함수 계산", difficulty: "medium",
    question: "함수 $f(x,y,z)=x\\cos(y+z^2)$의 벡터 $u$ 방향으로의 방향도함수를 $D_u f(x,y,z)$라 하자. 벡터 $u=\\dfrac{1}{\\sqrt{2}}(1,0,-1)$에 대하여 $D_u f(2,-1,1)$의 값은?",
    options: [o("1","$\\dfrac{1}{5\\sqrt{2}}$"), o("2","$\\dfrac{1}{4\\sqrt{2}}$"), o("3","$\\dfrac{1}{3\\sqrt{2}}$"), o("4","$\\dfrac{1}{2\\sqrt{2}}$"), o("5","$\\dfrac{1}{\\sqrt{2}}$")],
    answer: 5,
    explanation: "경도: $f_x=\\cos(y+z^2),\\,f_y=-x\\sin(y+z^2),\\,f_z=-2xz\\sin(y+z^2)$.\n$(2,-1,1)$에서 $y+z^2=0$이므로 $\\cos 0=1,\\,\\sin 0=0$. → $\\nabla f=(1,0,0)$.\n$D_u f=\\nabla f\\cdot u=(1,0,0)\\cdot\\dfrac{1}{\\sqrt{2}}(1,0,-1)=\\dfrac{1}{\\sqrt{2}}$."
  }),
  build({
    num: 6, subject: "적분학", unit: "정적분의 계산", concept: "치환적분 ($\\sqrt x = t$)", difficulty: "easyMedium",
    question: "정적분 $\\displaystyle\\int_1^{4}\\dfrac{1}{x+\\sqrt{x}}dx$의 값은?",
    options: [o("1","$\\ln\\dfrac{9}{4}$"), o("2","$\\ln\\dfrac{5}{2}$"), o("3","$\\ln\\dfrac{11}{4}$"), o("4","$\\ln 3$"), o("5","$\\ln\\dfrac{13}{4}$")],
    answer: 1,
    explanation: "$\\sqrt{x}=t$ 치환: $x=t^2,\\,dx=2t\\,dt$. 경계: $x=1$에서 $t=1$, $x=4$에서 $t=2$.\n$\\displaystyle\\int_1^2\\dfrac{2t}{t^2+t}dt=\\int_1^2\\dfrac{2}{t+1}dt=2[\\ln(t+1)]_1^2=2(\\ln 3-\\ln 2)=\\ln\\dfrac{9}{4}$."
  }),
  build({
    num: 7, subject: "다변수함수", unit: "접평면", concept: "접평면 위의 점", difficulty: "easyMedium",
    question: "곡면 $z=2x^2+y^2-1$ 위의 점 $(1,1,2)$에서의 접평면을 $M$이라 하자. 점 $(a,2,3)$이 $M$ 위의 점일 때 상수 $a$의 값은?",
    options: [o("1","$\\dfrac{1}{4}$"), o("2","$\\dfrac{3}{4}$"), o("3","$\\dfrac{5}{4}$"), o("4","$\\dfrac{7}{4}$"), o("5","$\\dfrac{9}{4}$")],
    answer: 2,
    explanation: "$F(x,y,z)=2x^2+y^2-1-z$ 둘 때 $\\nabla F=(4x,2y,-1)$. $(1,1,2)$에서 $(4,2,-1)$.\n접평면: $4(x-1)+2(y-1)-(z-2)=0\\Rightarrow 4x+2y-z=4$.\n$(a,2,3)$ 대입: $4a+4-3=4\\Rightarrow a=\\dfrac{3}{4}$."
  }),
  build({
    num: 8, subject: "적분학", unit: "정적분의 응용", concept: "$\\arccos$ 영역의 면적", difficulty: "medium",
    question: "좌표평면에서 곡선 $y=\\arccos x$와 직선 $x=\\dfrac{1}{\\sqrt{2}}$ 및 $x$축으로 둘러싸인 영역의 넓이는?",
    options: [o("1","$\\dfrac{\\sqrt{2}(4-\\pi)}{8}$"), o("2","$\\dfrac{\\sqrt{2}(4-\\pi)}{4}$"), o("3","$\\dfrac{\\sqrt{2}(\\pi-2)}{8}$"), o("4","$\\dfrac{\\sqrt{2}(\\pi-2)}{4}$"), o("5","$\\dfrac{\\sqrt{2}(\\pi-3)}{8}$")],
    answer: 1,
    explanation: "영역: $\\dfrac{1}{\\sqrt{2}}\\le x\\le 1$, $0\\le y\\le\\arccos x$. 면적 $\\displaystyle S=\\!\\int_{1/\\sqrt{2}}^{1}\\!\\arccos x\\,dx$.\n$\\int\\arccos x\\,dx=x\\arccos x-\\sqrt{1-x^2}+C$ (부분적분).\n$x=1$: $0-0=0$. $x=1/\\sqrt{2}$: $\\dfrac{1}{\\sqrt{2}}\\cdot\\dfrac{\\pi}{4}-\\dfrac{1}{\\sqrt{2}}=\\dfrac{\\pi-4}{4\\sqrt{2}}$.\n$S=0-\\dfrac{\\pi-4}{4\\sqrt{2}}=\\dfrac{4-\\pi}{4\\sqrt{2}}=\\dfrac{\\sqrt{2}(4-\\pi)}{8}$."
  }),
  build({
    num: 9, subject: "적분학", unit: "급수", concept: "급수 수렴 판정", difficulty: "medium",
    question: "다음 보기의 급수 중 수렴하는 것만을 있는 대로 고르면?\n\n(ㄱ) $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n+2}{n^3-n+1}$\n(ㄴ) $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{3^n}{n!}$\n(ㄷ) $\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{1}{n(\\ln n)^{1/2}}$",
    options: [o("1","ㄱ"), o("2","ㄴ"), o("3","ㄱ, ㄴ"), o("4","ㄱ, ㄷ"), o("5","ㄱ, ㄴ, ㄷ")],
    answer: 3,
    explanation: "(ㄱ) 수렴: $\\dfrac{n+2}{n^3-n+1}\\sim\\dfrac{1}{n^2}$, $p=2>1$.\n(ㄴ) 수렴: 비율판정 $\\dfrac{3^{n+1}/(n+1)!}{3^n/n!}=\\dfrac{3}{n+1}\\to 0<1$. 또는 지수함수 급수.\n(ㄷ) 발산: 적분판정 $\\displaystyle\\int^{\\infty}\\!\\dfrac{dx}{x\\sqrt{\\ln x}}=\\!\\int^{\\infty}\\!\\dfrac{du}{\\sqrt u}$ 발산 ($u=\\ln x$).\n수렴: ㄱ, ㄴ."
  }),
  build({
    num: 10, subject: "적분학", unit: "정적분의 응용", concept: "극곡선의 길이", difficulty: "medium",
    question: "극곡선 $r=\\theta^2$ ($0\\le\\theta\\le 2\\pi$)의 길이는?",
    options: [o("1","$\\dfrac{8}{3}\\!\\left\\{(\\pi^2+4)^{3/2}-1\\right\\}$"), o("2","$\\dfrac{4}{3}\\!\\left\\{(\\pi^2+1)^{3/2}-1\\right\\}$"), o("3","$\\dfrac{8}{3}\\!\\left\\{(\\pi^2+2)^{3/2}-1\\right\\}$"), o("4","$\\dfrac{1}{3}\\!\\left\\{(\\pi^2+4)^{3/2}-1\\right\\}$"), o("5","$\\dfrac{8}{3}\\!\\left\\{(\\pi^2+1)^{3/2}-1\\right\\}$")],
    answer: 5,
    explanation: "$L=\\displaystyle\\int_0^{2\\pi}\\!\\sqrt{r^2+(r')^2}\\,d\\theta=\\int_0^{2\\pi}\\!\\theta\\sqrt{\\theta^2+4}\\,d\\theta$.\n$=\\dfrac{1}{3}[(\\theta^2+4)^{3/2}]_0^{2\\pi}=\\dfrac{1}{3}\\!\\left((4\\pi^2+4)^{3/2}-8\\right)=\\dfrac{8}{3}\\!\\left((\\pi^2+1)^{3/2}-1\\right)$."
  }),
  build({
    num: 11, subject: "선형대수", unit: "행렬식", concept: "$\\det(cA)$ 성질 + 트레이스", difficulty: "medium",
    question: "$n\\times n$ 가역행렬 $A$에 대하여 $\\det(2A)=8\\det(A^t)$가 성립할 때, $n\\times n$ 단위행렬 $I_n$에 대하여 대각합 $\\operatorname{tr}(2I_n)$의 값은? (단, $\\det(A)$는 $A$의 행렬식을 의미한다.)",
    options: [o("1","$0$"), o("2","$2$"), o("3","$4$"), o("4","$6$"), o("5","$8$")],
    answer: 4,
    explanation: "$\\det(2A)=2^n\\det A$, $\\det(A^t)=\\det A$이므로 $2^n=8\\Rightarrow n=3$.\n$\\operatorname{tr}(2I_3)=2+2+2=6$."
  }),
  build({
    num: 12, subject: "미분학", unit: "고차도함수", concept: "테일러 급수 계수", difficulty: "medium",
    question: "함수 $f(x)=x^2\\sqrt{1+x^3}$에 대하여 $f^{(11)}(0)$의 값은?",
    options: [o("1","$\\dfrac{11!}{16}$"), o("2","$\\dfrac{11!}{17}$"), o("3","$\\dfrac{11!}{18}$"), o("4","$\\dfrac{11!}{19}$"), o("5","$\\dfrac{11!}{20}$")],
    answer: 1,
    explanation: "이항급수 $(1+x^3)^{1/2}=1+\\dfrac{1}{2}x^3-\\dfrac{1}{8}x^6+\\dfrac{1}{16}x^9-\\cdots$.\n$f(x)=x^2(1+x^3)^{1/2}$의 $x^{11}$ 계수는 $x^9$ 계수: $\\dfrac{1}{16}$.\n$f^{(11)}(0)=$ ($x^{11}$ 계수)$\\cdot 11!=\\dfrac{11!}{16}$."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "극좌표·극곡선", concept: "심장형 면적", difficulty: "easyMedium",
    question: "극곡선 $r=1+\\sin\\theta$로 둘러싸인 영역의 넓이는?",
    options: [o("1","$\\dfrac{\\pi}{2}$"), o("2","$\\dfrac{3\\pi}{4}$"), o("3","$\\pi$"), o("4","$\\dfrac{5\\pi}{4}$"), o("5","$\\dfrac{3\\pi}{2}$")],
    answer: 5,
    explanation: "심장형(cardioid). 표준 공식 $r=a(1+\\sin\\theta)$의 면적 $=\\dfrac{3\\pi a^2}{2}$.\n또는 직접: $\\displaystyle S=\\dfrac{1}{2}\\!\\int_0^{2\\pi}(1+\\sin\\theta)^2 d\\theta=\\dfrac{1}{2}\\!\\int(1+2\\sin\\theta+\\sin^2\\theta)d\\theta=\\dfrac{1}{2}(2\\pi+0+\\pi)=\\dfrac{3\\pi}{2}$."
  }),
  build({
    num: 14, subject: "적분학", unit: "정적분의 계산", concept: "$\\arcsin\\sin$ 톱니파 적분", difficulty: "medium",
    question: "정적분 $\\displaystyle\\int_{\\pi}^{5\\pi/2}\\arcsin(-\\sin x)\\,dx$의 값은?",
    options: [o("1","$-\\dfrac{\\pi^2}{4}$"), o("2","$-\\dfrac{\\pi^2}{8}$"), o("3","$0$"), o("4","$\\dfrac{\\pi^2}{8}$"), o("5","$\\dfrac{\\pi^2}{4}$")],
    answer: 4,
    explanation: "$\\arcsin(-\\sin x)=-\\arcsin(\\sin x)$. $\\arcsin(\\sin x)$는 톱니파.\n구간별: $[\\pi,3\\pi/2]$: $\\pi-x$, $[3\\pi/2,5\\pi/2]$: $x-2\\pi$.\n$\\displaystyle\\int_\\pi^{3\\pi/2}(\\pi-x)dx+\\int_{3\\pi/2}^{5\\pi/2}(x-2\\pi)dx$ 계산하면 $-\\pi^2/8$.\n부호 뒤집기: $-(-\\pi^2/8)=\\pi^2/8$."
  }),
  build({
    num: 15, subject: "적분학", unit: "특이적분", concept: "삼각치환 (특이적분)", difficulty: "medium",
    question: "특이적분 $\\displaystyle\\int_0^{3/2}\\dfrac{x^2}{\\sqrt{9-4x^2}}dx$의 값은?",
    options: [o("1","$\\dfrac{9}{4}\\pi$"), o("2","$\\dfrac{9}{8}\\pi$"), o("3","$\\dfrac{9}{16}\\pi$"), o("4","$\\dfrac{9}{32}\\pi$"), o("5","$\\dfrac{9}{64}\\pi$")],
    answer: 4,
    explanation: "$2x=3\\sin\\theta$ 치환: $x=\\dfrac{3}{2}\\sin\\theta,\\,dx=\\dfrac{3}{2}\\cos\\theta d\\theta$, $\\sqrt{9-4x^2}=3\\cos\\theta$.\n경계: $x=0$에서 $\\theta=0$, $x=3/2$에서 $\\theta=\\pi/2$.\n$\\displaystyle\\int_0^{\\pi/2}\\!\\dfrac{(9/4)\\sin^2\\theta}{3\\cos\\theta}\\cdot\\dfrac{3}{2}\\cos\\theta\\,d\\theta=\\dfrac{9}{8}\\!\\int_0^{\\pi/2}\\!\\sin^2\\theta\\,d\\theta=\\dfrac{9}{8}\\cdot\\dfrac{\\pi}{4}=\\dfrac{9\\pi}{32}$."
  }),
  build({
    num: 16, subject: "선형대수", unit: "LU분해", concept: "PA = LU (치환행렬 판정)", difficulty: "mediumHard",
    question: "$\\mathbb{R}^3$의 행벡터를 $1\\times 3$ 행렬로 이해할 때, $v_1=(0,1,1),\\,v_2=(1,1,0),\\,v_3=(0,1,0),\\,w_1=(2,4,8),\\,w_2=(0,1,1),\\,w_3=(0,0,2)$에 대하여 $3\\times 3$행렬 $A=\\displaystyle\\sum_{k=1}^{3}v_k^T w_k$는 $A=\\begin{pmatrix}0 & 1 & 1\\\\ 2 & 5 & 11\\\\ 2 & 4 & 8\\end{pmatrix}$이다. 다음 치환행렬 중에서 $PA$가 하삼각행렬 $L$과 상삼각행렬 $U$의 곱 $PA=LU$로 분해되게 하는 $P$가 아닌 것을 고르면?",
    options: [o("1","$\\begin{pmatrix}0 & 1 & 0\\\\ 1 & 0 & 0\\\\ 0 & 0 & 1\\end{pmatrix}$"), o("2","$\\begin{pmatrix}0 & 0 & 1\\\\ 1 & 0 & 0\\\\ 0 & 1 & 0\\end{pmatrix}$"), o("3","$\\begin{pmatrix}1 & 0 & 0\\\\ 0 & 0 & 1\\\\ 0 & 1 & 0\\end{pmatrix}$"), o("4","$\\begin{pmatrix}0 & 1 & 0\\\\ 0 & 0 & 1\\\\ 1 & 0 & 0\\end{pmatrix}$"), o("5","$\\begin{pmatrix}0 & 0 & 1\\\\ 0 & 1 & 0\\\\ 1 & 0 & 0\\end{pmatrix}$")],
    answer: 3,
    explanation: "LU 분해 가능 ⟺ 행교환 없이 사다리꼴화 가능 (즉, 모든 단계에서 피벗 $\\ne 0$).\n원래 $A$는 $a_{11}=0$이라 직접 LU 불가. $P$로 행 재배치 필요.\n각 보기 $PA$의 첫 성분 확인:\n• (1) $PA$의 1행이 $A$의 2행 $(2,5,11)$ → $a_{11}=2$ ✓ 분해 가능.\n• (2) $PA$의 1행이 $A$의 3행 $(2,4,8)$ → $a_{11}=2$ ✓.\n• (3) $PA=\\begin{pmatrix}0&1&1\\\\2&4&8\\\\2&5&11\\end{pmatrix}$ → 1행 1열이 여전히 $0$ ✗ 분해 불가.\n• (4), (5) 1행 1열 $\\ne 0$ ✓.\n답: (3)."
  }),
  build({
    num: 17, subject: "다변수함수", unit: "곡선의 곡률", concept: "공간곡선의 곡률 ($r'\\times r''$)", difficulty: "mediumHard",
    question: "곡면 $z=4x^2+y^2$과 평면 $4x+2y-z=1$의 교선을 $C$라 할 때, 점 $(1,1,5)$에서 곡선 $C$의 곡률은?",
    options: [o("1","$\\dfrac{\\sqrt{21}}{\\sqrt{5}}$"), o("2","$\\dfrac{\\sqrt{21}}{5\\sqrt{5}}$"), o("3","$\\dfrac{\\sqrt{21}}{10\\sqrt{5}}$"), o("4","$\\dfrac{\\sqrt{21}}{15\\sqrt{5}}$"), o("5","$\\dfrac{\\sqrt{21}}{20\\sqrt{5}}$")],
    answer: 3,
    explanation: "교선 식: $4x^2+y^2=4x+2y-1\\Leftrightarrow 4(x-\\tfrac{1}{2})^2+(y-1)^2=1$.\n매개변수: $x=\\tfrac{1}{2}+\\tfrac{1}{2}\\cos t,\\,y=1+\\sin t,\\,z=4x+2y-1=3+2\\cos t+2\\sin t$.\n$t=0$에서 $(1,1,5)$ ✓.\n$r'=(-\\tfrac{1}{2}\\sin t,\\cos t,-2\\sin t+2\\cos t)$. $t=0$: $r'=(0,1,2)$, $|r'|=\\sqrt{5}$.\n$r''=(-\\tfrac{1}{2}\\cos t,-\\sin t,-2\\cos t-2\\sin t)$. $t=0$: $r''=(-\\tfrac{1}{2},0,-2)$.\n$r'\\times r''=(-2,-1,\\tfrac{1}{2})$, $|r'\\times r''|=\\dfrac{\\sqrt{21}}{2}$.\n$\\kappa=\\dfrac{|r'\\times r''|}{|r'|^3}=\\dfrac{\\sqrt{21}/2}{5\\sqrt{5}}=\\dfrac{\\sqrt{21}}{10\\sqrt{5}}$."
  }),
  build({
    num: 18, subject: "다변수함수", unit: "선적분", concept: "선적분 (직접 매개화)", difficulty: "mediumHard",
    question: "좌표평면에서 곡선 $\\sqrt{x}+y=1$ 위의 점 $(1,0)$부터 점 $(0,1)$까지의 경로를 $C$라 할 때 선적분 $\\displaystyle\\int_C(\\sinh x+\\cosh y)\\,dx$의 값은?",
    options: [o("1","$3(1-\\cosh 1)$"), o("2","$3(1+\\cosh 1)$"), o("3","$0$"), o("4","$3(1-\\sinh 1)$"), o("5","$3(1+\\sinh 1)$")],
    answer: 1,
    explanation: "매개변수: $\\sqrt{x}=1-t,\\,y=t$ → $x=(1-t)^2$, $t:0\\to 1$. $dx=-2(1-t)dt$.\n$\\displaystyle\\int_C=\\int_0^1[\\sinh((1-t)^2)+\\cosh t]\\cdot(-2(1-t))\\,dt$\n$=\\underbrace{\\int_0^1-2(1-t)\\sinh((1-t)^2)dt}_{u=(1-t)^2}+\\underbrace{\\int_0^1-2(1-t)\\cosh t\\,dt}_{\\text{IBP}}$\n• 첫 항: $u=(1-t)^2$, $du=-2(1-t)dt$. $=\\int_1^0\\sinh u\\,du=[-\\cosh u]_1^0\\!\\cdot\\!(\\cdot)=1-\\cosh 1$.\n• 둘째 항: IBP, $\\int_0^1(1-t)\\cosh t dt=\\cosh 1-1$ → $-2(\\cosh 1-1)=2-2\\cosh 1$.\n합: $(1-\\cosh 1)+(2-2\\cosh 1)=3-3\\cosh 1=3(1-\\cosh 1)$."
  }),
  build({
    num: 19, subject: "선형대수", unit: "행렬의 계수", concept: "$A^t A$ 가역 (full rank)", difficulty: "mediumHard",
    question: "집합 $X=\\{1,2,3,4,5\\}$에 속하는 두 자연수 $n$과 $m$에 대해 행렬 $A$를 아래와 같이 정의할 때, $A^t A$가 가역행렬이 되는 순서쌍 $(n,m)\\in X\\times X$의 개수는?\n\n$A=\\begin{pmatrix}1 & -1 & 0 & 1\\\\ 0 & n & 1 & 2\\\\ 1 & 0 & -1 & 1\\\\ 1 & 1 & 2 & 5\\\\ 2 & 0 & 1 & m\\end{pmatrix}$",
    options: [o("1","$20$"), o("2","$21$"), o("3","$22$"), o("4","$23$"), o("5","$24$")],
    answer: 5,
    explanation: "$A$는 $5\\times 4$. $A^t A$ ($4\\times 4$)가 가역 ⟺ $\\operatorname{rank}(A^t A)=4$ ⟺ $\\operatorname{rank}(A)=4$.\n행 환산해서 마지막 행 피벗이 $0$이 되는 조건을 찾으면 특정 $(n,m)$에서만 rank 부족.\n계산 결과 $(n,m)=(5,1)$ 한 경우만 $\\operatorname{rank}(A)=3$.\n전체 $5\\times 5=25$ 쌍 중 1개 제외: $24$개."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "이중적분", concept: "극좌표 변환 (반원판)", difficulty: "medium",
    question: "이중적분 $\\displaystyle\\int_0^{2}\\!\\int_{-\\sqrt{2x-x^2}}^{0}\\!(x^2+y^2)^{3/2}dy\\,dx$의 값은?",
    options: [o("1","$\\dfrac{32}{75}$"), o("2","$\\dfrac{64}{75}$"), o("3","$\\dfrac{128}{75}$"), o("4","$\\dfrac{256}{75}$"), o("5","$\\dfrac{512}{75}$")],
    answer: 4,
    explanation: "영역: $y\\le 0$, $x^2+y^2\\le 2x$ → 중심 $(1,0)$ 반지름 $1$의 원판 중 아래 절반.\n극좌표 $r=2\\cos\\theta$ ($\\theta:-\\pi/2\\to 0$).\n$\\displaystyle\\int_{-\\pi/2}^{0}\\!\\int_0^{2\\cos\\theta}\\!r^3\\cdot r\\,dr\\,d\\theta=\\int_{-\\pi/2}^{0}\\!\\dfrac{(2\\cos\\theta)^5}{5}d\\theta=\\dfrac{32}{5}\\!\\int_0^{\\pi/2}\\!\\cos^5\\theta\\,d\\theta$\n$\\int_0^{\\pi/2}\\!\\cos^5\\theta=\\dfrac{4\\cdot 2}{5\\cdot 3}=\\dfrac{8}{15}$ (월리스).\n$\\dfrac{32}{5}\\cdot\\dfrac{8}{15}=\\dfrac{256}{75}$."
  }),
  build({
    num: 21, subject: "다변수함수", unit: "삼중적분", concept: "구면좌표 (원뿔과 반구)", difficulty: "mediumHard",
    question: "곡면 $z=3\\sqrt{x^2+y^2}$과 반구면 $z=\\sqrt{10-x^2-y^2}$에 의해 둘러싸인 영역을 $E$라 할 때 삼중적분 $\\displaystyle\\iiint_E\\sqrt{x^2+y^2+z^2}\\,dV$의 값은?",
    options: [o("1","$5\\pi(10-\\sqrt{10})$"), o("2","$10\\pi(10-\\sqrt{10})$"), o("3","$5\\pi(10-3\\sqrt{10})$"), o("4","$10\\pi(10-3\\sqrt{10})$"), o("5","$5\\pi(20-5\\sqrt{10})$")],
    answer: 3,
    explanation: "구면좌표: $z=\\rho\\cos\\phi$, $\\sqrt{x^2+y^2}=\\rho\\sin\\phi$. 원뿔 $z=3\\sqrt{x^2+y^2}$ → $\\tan\\phi=\\dfrac{1}{3}$, 반구면 → $\\rho=\\sqrt{10}$.\n영역: $0\\le\\theta\\le 2\\pi,\\,0\\le\\phi\\le\\arctan\\dfrac{1}{3},\\,0\\le\\rho\\le\\sqrt{10}$.\n$\\displaystyle\\iiint\\rho\\cdot\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta=2\\pi\\cdot\\!\\left[1-\\cos(\\arctan\\tfrac{1}{3})\\right]\\cdot\\dfrac{(\\sqrt{10})^4}{4}$\n$\\cos(\\arctan(1/3))=\\dfrac{3}{\\sqrt{10}}$. $\\!\\left(1-\\dfrac{3}{\\sqrt{10}}\\right)\\cdot 25\\cdot 2\\pi=50\\pi\\!\\left(1-\\dfrac{3}{\\sqrt{10}}\\right)=5\\pi(10-3\\sqrt{10})$."
  }),
  build({
    num: 22, subject: "적분학", unit: "정적분의 응용", concept: "회전면 넓이 ($y$축, 적분 정의 곡선)", difficulty: "mediumHard",
    question: "$y$축을 중심축으로 곡선 $y=\\displaystyle\\int_1^x\\sqrt{\\sqrt{t}-1}\\,dt$ ($1\\le x\\le 16$)을 회전시켜 얻어지는 곡면의 넓이는?",
    options: [o("1","$\\dfrac{8}{9}(2^6-1)\\pi$"), o("2","$\\dfrac{8}{9}(2^7-1)\\pi$"), o("3","$\\dfrac{8}{9}(2^8-1)\\pi$"), o("4","$\\dfrac{8}{9}(2^9-1)\\pi$"), o("5","$\\dfrac{8}{9}(2^{10}-1)\\pi$")],
    answer: 4,
    explanation: "FTC: $y'=\\sqrt{\\sqrt{x}-1}$, $(y')^2=\\sqrt{x}-1$, $1+(y')^2=\\sqrt{x}$.\n$y$축 회전면 넓이: $S=2\\pi\\!\\int x\\sqrt{1+(y')^2}\\,dx=2\\pi\\!\\int_1^{16}\\!x\\cdot x^{1/4}\\,dx=2\\pi\\!\\int_1^{16}\\!x^{5/4}\\,dx$\n$=2\\pi\\cdot\\dfrac{4}{9}[x^{9/4}]_1^{16}=\\dfrac{8\\pi}{9}(16^{9/4}-1)=\\dfrac{8\\pi}{9}(2^9-1)$."
  }),
  build({
    num: 23, subject: "다변수함수", unit: "선적분", concept: "그린 정리", difficulty: "medium",
    question: "좌표평면에서 영역 $D$는 세 직선 $x$축, $y$축, $x+y=1$로 둘러싸인 삼각형이고 $C$는 영역 $D$의 경계를 따라 움직이는 반시계방향의 경로일 때 선적분 $\\displaystyle\\int_C(y^2+\\sin^3 x)dx+(x^3+\\sqrt{y^2+1})\\,dy$의 값은?",
    options: [o("1","$-\\dfrac{1}{16}$"), o("2","$-\\dfrac{1}{14}$"), o("3","$-\\dfrac{1}{12}$"), o("4","$-\\dfrac{1}{10}$"), o("5","$-\\dfrac{1}{8}$")],
    answer: 3,
    explanation: "Green: $Q_x-P_y=3x^2-2y$.\n$\\displaystyle\\iint_D(3x^2-2y)\\,dA=\\int_0^1\\!\\int_0^{1-x}\\!(3x^2-2y)dy\\,dx=\\int_0^1[3x^2(1-x)-(1-x)^2]dx$\n$=\\int_0^1(2x^2-3x^3+2x-1)dx=\\dfrac{2}{3}-\\dfrac{3}{4}+1-1=-\\dfrac{1}{12}$."
  }),
  build({
    num: 24, subject: "다변수함수", unit: "이중적분", concept: "변수변환 ($u=x+y,\\,v=x-y$)", difficulty: "mediumHard",
    question: "좌표평면에서 영역 $D$는 꼭짓점이 $(1,0),(3,0),(0,3),(0,1)$인 사다리꼴일 때 이중적분 $\\displaystyle\\iint_D\\cosh\\!\\left(\\dfrac{x-y}{x+y}\\right)dA$의 값은?",
    options: [o("1","$2(e-e^{-1})$"), o("2","$\\dfrac{7}{4}(e-e^{-1})$"), o("3","$\\dfrac{3}{2}(e-e^{-1})$"), o("4","$\\dfrac{5}{4}(e-e^{-1})$"), o("5","$e-e^{-1}$")],
    answer: 1,
    explanation: "변수변환 $u=x+y,\\,v=x-y$. Jacobian: $\\!\\left|\\dfrac{\\partial(x,y)}{\\partial(u,v)}\\right|=\\dfrac{1}{2}$.\n꼭짓점 변환: $(1,0)\\to(1,1),(3,0)\\to(3,3),(0,3)\\to(3,-3),(0,1)\\to(1,-1)$. 새 영역: $1\\le u\\le 3,\\,-u\\le v\\le u$.\n$\\displaystyle\\iint\\cosh(v/u)\\cdot\\dfrac{1}{2}dv\\,du=\\dfrac{1}{2}\\!\\int_1^3\\!u\\!\\left[\\sinh(v/u)\\right]_{-u}^{u}du=\\dfrac{1}{2}\\!\\int_1^3 u(2\\sinh 1)du=\\sinh 1\\cdot[u^2/2]_1^3=4\\sinh 1=2(e-e^{-1})$."
  }),
  build({
    num: 25, subject: "선형대수", unit: "노름과 내적", concept: "직교행렬 곱과 행렬 노름", difficulty: "mediumHard",
    question: "벡터 $x=(x_1,\\dots,x_n)\\in\\mathbb{R}^n$의 노름을 $\\|x\\|=\\sqrt{\\sum x_k^2}$로 정의하고, $m\\times n$행렬 $A$의 노름은 $\\|A\\|=\\max\\{\\|(Ax^t)^t\\|:x\\in\\mathbb{R}^n,\\,\\|x\\|\\le 1\\}$로 정의하자. 행렬 $A=\\begin{pmatrix}2 & 1 & 0\\\\ -2 & 0 & 1\\end{pmatrix}$와 임의의 $n\\times n$ 직교행렬 $U_n$에 대하여 $\\|U_2 A U_3\\|$의 최댓값은? (단, $n\\times n$ 직교행렬 $U_n$은 $U_n U_n^t=I_n=U_n^t U_n$를 만족하는 행렬이다.)",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 3,
    explanation: "직교행렬 $U_2,U_3$를 곱해도 작용소 노름(스펙트럼 노름)은 변하지 않음 → $\\|U_2 A U_3\\|=\\|A\\|$.\n$\\|A\\|=\\sigma_{\\max}(A)=\\sqrt{\\lambda_{\\max}(A^T A)}$.\n$A^T A=\\begin{pmatrix}2 & -2\\\\ 1 & 0\\\\ 0 & 1\\end{pmatrix}\\!\\begin{pmatrix}2 & 1 & 0\\\\ -2 & 0 & 1\\end{pmatrix}=\\begin{pmatrix}8 & 2 & -2\\\\ 2 & 1 & 0\\\\ -2 & 0 & 1\\end{pmatrix}$.\n특성다항식: $\\lambda^3-10\\lambda^2+9\\lambda=\\lambda(\\lambda-1)(\\lambda-9)=0$.\n최대 $\\lambda=9$, $\\sqrt{9}=3$."
  }),
];

console.log(`Uploading ${problems.length} problems for ${SCHOOL} ${YEAR} ${SESSION}...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
console.log(`✅ Inserted ${data?.length ?? 0} questions for ${SCHOOL} ${YEAR} ${SESSION}`);
