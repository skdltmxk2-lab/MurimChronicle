// Upload 2025년도 숙명여대 편입수학 기출 20문항 (5지선다)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SCHOOL = "숙명여대"; const YEAR = "2025";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-sookmyung-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "도함수", concept: "로그미분", difficulty: "easyMedium",
    question: "함수 $f(x)=x^{\\sin x}$에 대하여 $f'(\\pi)$의 값은?",
    options: [o("1","$-\\pi\\ln\\pi$"), o("2","$-\\ln\\pi$"), o("3","$\\dfrac{1}{\\pi}-\\ln\\pi$"), o("4","$\\ln\\pi$"), o("5","$\\pi\\ln\\pi$")],
    answer: 2,
    explanation: "$f(x)=e^{\\sin x\\ln x}$. $f'(x)=f(x)(\\cos x\\ln x+\\sin x/x)$. $f'(\\pi)=\\pi^0\\cdot(-\\ln\\pi+0)=-\\ln\\pi$."
  }),
  build({
    num: 2, subject: "미분학", unit: "도함수", concept: "쌍곡함수 항등식", difficulty: "medium",
    question: "$x=\\ln(\\csc\\theta+\\cot\\theta)$일 때, $\\csc\\theta$와 같은 것은?",
    options: [o("1","$\\mathrm{csch}\\,x$"), o("2","$\\sinh x$"), o("3","$\\coth x$"), o("4","$\\cosh x$"), o("5","$\\tanh x$")],
    answer: 4,
    explanation: "$e^x=\\csc\\theta+\\cot\\theta$, $e^{-x}=(\\csc\\theta+\\cot\\theta)^{-1}=\\csc\\theta-\\cot\\theta$. 합 $e^x+e^{-x}=2\\csc\\theta$ → $\\csc\\theta=\\dfrac{e^x+e^{-x}}{2}=\\cosh x$."
  }),
  build({
    num: 3, subject: "미분학", unit: "극한과 연속", concept: "1^∞ 부정형", difficulty: "easyMedium",
    question: "극한 $\\displaystyle\\lim_{x\\to\\infty}\\!\\left(\\dfrac{x+a}{x-a}\\right)^{\\!x}=e$를 만족시키는 상수 $a$의 값은? (단, $a>0$)",
    options: [o("1","$\\dfrac{1}{e}$"), o("2","$\\dfrac{1}{2}$"), o("3","$1$"), o("4","$2$"), o("5","$e$")],
    answer: 2,
    explanation: "$\\!\\left(\\dfrac{x+a}{x-a}\\right)^x=\\!\\left(1+\\dfrac{2a}{x-a}\\right)^{x}\\to e^{2a}$. $e^{2a}=e$ → $a=\\dfrac{1}{2}$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분의 응용", concept: "정적분 최댓값", difficulty: "easyMedium",
    question: "정적분 $\\displaystyle\\int_a^b(2+x-x^2)dx$의 값이 최대가 될 때, $a+b$의 값은? (단, $a<b$)",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$0$"), o("4","$1$"), o("5","$2$")],
    answer: 4,
    explanation: "피적분 $2+x-x^2>0$ ⇔ $x^2-x-2<0$ ⇔ $-1<x<2$. 따라서 $a=-1,b=2$, $a+b=1$."
  }),
  build({
    num: 5, subject: "적분학", unit: "정적분의 계산", concept: "치환적분", difficulty: "easyMedium",
    question: "정적분 $\\displaystyle\\int_0^1\\dfrac{1}{(1+\\sqrt{x})^3}dx$의 값은?",
    options: [o("1","$\\dfrac{1}{4}$"), o("2","$\\dfrac{1}{2}$"), o("3","$1$"), o("4","$2$"), o("5","$4$")],
    answer: 1,
    explanation: "$1+\\sqrt x=t$ 치환: $x=(t-1)^2,dx=2(t-1)dt$. $\\int_1^2\\dfrac{2(t-1)}{t^3}dt=2\\!\\int_1^2(t^{-2}-t^{-3})dt=2\\!\\left[-\\tfrac{1}{t}+\\tfrac{1}{2t^2}\\right]_1^2=\\dfrac{1}{4}$."
  }),
  build({
    num: 6, subject: "적분학", unit: "정적분의 계산", concept: "역삼각함수 부분적분", difficulty: "medium",
    question: "정적분 $\\displaystyle\\int_0^1\\tan^{-1}\\!\\left(\\dfrac{1}{x}\\right)dx$의 값은?",
    options: [o("1","$\\dfrac{1}{8}\\pi-\\dfrac{1}{2}\\ln 2$"), o("2","$\\dfrac{1}{4}\\pi-\\dfrac{1}{4}\\ln 2$"), o("3","$\\dfrac{1}{4}\\pi+\\dfrac{1}{4}\\ln 2$"), o("4","$\\dfrac{1}{8}\\pi+\\dfrac{1}{2}\\ln 2$"), o("5","$\\dfrac{1}{4}\\pi+\\dfrac{1}{2}\\ln 2$")],
    answer: 5,
    explanation: "부분적분: $u=\\tan^{-1}(1/x),\\,dv=dx$. $\\int=[x\\tan^{-1}(1/x)]_0^1+\\int_0^1\\dfrac{x}{1+x^2}dx=\\dfrac{\\pi}{4}+\\dfrac{1}{2}\\ln 2$."
  }),
  build({
    num: 7, subject: "적분학", unit: "정적분의 응용", concept: "성망형 넓이", difficulty: "medium",
    question: "곡선 $x=\\cos^3(2\\theta),\\,y=\\sin^3(2\\theta)$ $(0\\le\\theta\\le\\pi)$로 둘러싸인 영역의 넓이는?",
    options: [o("1","$\\dfrac{3}{32}\\pi$"), o("2","$\\dfrac{3}{16}\\pi$"), o("3","$\\dfrac{3}{8}\\pi$"), o("4","$\\dfrac{3}{4}\\pi$"), o("5","$3\\pi$")],
    answer: 3,
    explanation: "$2\\theta=t$ 치환하면 표준 성망형(astroid) $x=\\cos^3 t,\\,y=\\sin^3 t$ ($a=1$). 성망형 넓이 $\\tfrac{3\\pi a^2}{8}=\\dfrac{3\\pi}{8}$."
  }),
  build({
    num: 8, subject: "적분학", unit: "정적분의 응용", concept: "극곡선 넓이(다엽장미)", difficulty: "medium",
    question: "곡선 $r=2\\cos(3\\theta)$ $(0\\le\\theta\\le\\pi)$로 둘러싸인 영역의 넓이는?",
    options: [o("1","$\\dfrac{1}{6}\\pi$"), o("2","$\\dfrac{1}{3}\\pi$"), o("3","$\\dfrac{1}{2}\\pi$"), o("4","$\\pi$"), o("5","$3\\pi$")],
    answer: 4,
    explanation: "3엽장미. 한 잎의 넓이 $=\\tfrac{1}{2}\\!\\int_{-\\pi/6}^{\\pi/6}4\\cos^2 3\\theta\\,d\\theta=\\tfrac{\\pi}{3}$. 3잎 합 $=\\pi$."
  }),
  build({
    num: 9, subject: "적분학", unit: "급수", concept: "수렴 판정 (스털링)", difficulty: "mediumHard",
    question: "다음 급수 중 수렴하는 것을 모두 고른 것은?\n\n(가) $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n!}{n^n}$\n(나) $\\displaystyle\\sum_{n=1}^{\\infty}(-1)^n\\sin\\!\\left(\\dfrac{\\pi}{n}\\right)$\n(다) $\\displaystyle\\sum_{n=1}^{\\infty}\\!\\left(1+\\dfrac{1}{n}\\right)^{n^2}$\n(라) $\\displaystyle\\sum_{n=1}^{\\infty}(-1)^n\\dfrac{2^n n!}{5\\cdot 8\\cdot 11\\cdots(3n+2)}$",
    options: [o("1","(가), (나)"), o("2","(나), (다), (라)"), o("3","(가), (다), (라)"), o("4","(가), (나), (라)"), o("5","(가), (나), (다), (라)")],
    answer: 4,
    explanation: "(가) 비율판정 $\\to 1/e<1$ 수렴. (나) 교대급수 ($\\sin(\\pi/n)\\downarrow 0$) 수렴. (다) 일반항 $\\to e>1$ 발산. (라) 비율판정 $\\to 2/3<1$ 수렴."
  }),
  build({
    num: 10, subject: "적분학", unit: "급수", concept: "텔레스코핑", difficulty: "easyMedium",
    question: "급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n}{(n+1)!}$의 값은?",
    options: [o("1","$e-2$"), o("2","$e-1$"), o("3","$1$"), o("4","$2$"), o("5","$e+1$")],
    answer: 3,
    explanation: "$\\dfrac{n}{(n+1)!}=\\dfrac{n+1-1}{(n+1)!}=\\dfrac{1}{n!}-\\dfrac{1}{(n+1)!}$ 텔레스코핑. 합 $=1-\\lim\\tfrac{1}{(N+1)!}=1$."
  }),
  build({
    num: 11, subject: "다변수함수", unit: "벡터", concept: "꼬인 두 직선 거리", difficulty: "medium",
    question: "$L_1$을 원점과 $(2,0,-1)$을 지나는 직선이라 하고, $L_2$를 $(1,-1,1)$과 $(1,0,2)$를 지나는 직선이라 하자. 이때, $L_1$과 $L_2$ 사이의 최단 거리는?",
    options: [o("1","$\\dfrac{1}{3}$"), o("2","$\\dfrac{2}{3}$"), o("3","$1$"), o("4","$\\dfrac{4}{3}$"), o("5","$\\dfrac{5}{3}$")],
    answer: 5,
    explanation: "$L_1$ 방향 $(2,0,-1)$, $L_2$ 방향 $(0,1,1)$. $\\mathbf{n}=(2,0,-1)\\times(0,1,1)=(1,-2,2)$. $L_2$의 점 $(1,-1,1)$, $L_1$의 점 $(0,0,0)$. 거리 $=\\dfrac{|(1,-1,1)\\cdot(1,-2,2)|}{|\\mathbf{n}|}=\\dfrac{|1+2+2|}{3}=\\dfrac{5}{3}$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "경도 및 방향도함수", concept: "방향도함수", difficulty: "easyMedium",
    question: "함수 $f(x,y,z)=xe^y+ye^z+ze^x$ 위의 $(0,0,0)$에서 벡터 $\\overrightarrow{OV}=(5,1,-2)$ 방향으로의 방향 도함수는?",
    options: [o("1","$\\dfrac{4}{\\sqrt{30}}$"), o("2","$\\dfrac{6}{\\sqrt{30}}$"), o("3","$\\dfrac{8}{\\sqrt{30}}$"), o("4","$\\dfrac{10}{\\sqrt{30}}$"), o("5","$\\dfrac{12}{\\sqrt{30}}$")],
    answer: 1,
    explanation: "$\\nabla f=(e^y+ze^x,\\,xe^y+e^z,\\,ye^z+e^x)\\big|_{(0,0,0)}=(1,1,1)$. $|\\overrightarrow{OV}|=\\sqrt{30}$. $D_{\\mathbf{u}}f=\\dfrac{(1,1,1)\\cdot(5,1,-2)}{\\sqrt{30}}=\\dfrac{4}{\\sqrt{30}}$."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "편도함수", concept: "음함수 접평면", difficulty: "medium",
    question: "곡면 $e^{xz}(x^2+y^2-z)=2$ 위의 점 $P(1,-1,0)$에서 접평면의 방정식은?",
    options: [o("1","$2x+2y+z=0$"), o("2","$2x-2y+z=4$"), o("3","$2x-2y-z=4$"), o("4","$x-y+z=2$"), o("5","$x-y-z=2$")],
    answer: 2,
    explanation: "$f=e^{xz}(x^2+y^2-z)-2$. $\\nabla f=(ze^{xz}(x^2+y^2-z)+e^{xz}(2x),\\,e^{xz}(2y),\\,xe^{xz}(x^2+y^2-z)-e^{xz})$. $(1,-1,0)$ 대입: $\\nabla f=(2,-2,1)$. 접평면 $2(x-1)-2(y+1)+z=0\\Rightarrow 2x-2y+z=4$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "곡면 위 최단거리", difficulty: "medium",
    question: "점 $P(4,2,0)$에서 원뿔 $z^2=x^2+y^2$ 위의 점까지 최단 거리는?",
    options: [o("1","$\\sqrt{5}$"), o("2","$2\\sqrt{2}$"), o("3","$\\sqrt{10}$"), o("4","$\\sqrt{15}$"), o("5","$2\\sqrt{5}$")],
    answer: 3,
    explanation: "$d^2=(x-4)^2+(y-2)^2+z^2=(x-4)^2+(y-2)^2+x^2+y^2=2(x-2)^2+2(y-1)^2+10$. 최솟값 $\\sqrt{10}$."
  }),
  build({
    num: 15, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "삼각형 영역 최대/최소", difficulty: "medium",
    question: "집합 $D$는 세 점 $(0,0),(0,2),(4,0)$으로 둘러싸인 삼각형의 내부와 경계를 포함하는 영역이다. 이때, 집합 $D$에서 함수 $f(x,y)=x+y-xy$의 최댓값과 최솟값의 합은?",
    options: [o("1","$2$"), o("2","$3$"), o("3","$\\dfrac{25}{8}$"), o("4","$4$"), o("5","$5$")],
    answer: 4,
    explanation: "내부: $f_x=1-y=0,\\,f_y=1-x=0$ → $(1,1)$, $f=1$. 경계: $y=0,0\\le x\\le 4$ → $f=x$ 범위 $[0,4]$. $x=0,0\\le y\\le 2$ → $f=y$ 범위 $[0,2]$. $y=-x/2+2$ → $f$ 최댓값 $4$ ($x=0$), 최솟값 $\\tfrac{7}{8}$. 종합 최댓값 $4$, 최솟값 $0$, 합 $4$."
  }),
  build({
    num: 16, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피(셸)", difficulty: "medium",
    question: "곡선 $y=xe^{-x^2}$ $(x\\ge 0)$ 및 직선 $y=0,\\,x=a$ $(a>0)$으로 둘러싸인 영역을 $y$축을 중심으로 회전하여 만들어진 입체의 부피를 $V(a)$라 할 때, $\\displaystyle\\lim_{a\\to\\infty}V(a)$의 값은?",
    options: [o("1","$\\dfrac{\\pi\\sqrt{\\pi}}{4}$"), o("2","$\\dfrac{\\pi\\sqrt{\\pi}}{2}$"), o("3","$\\pi\\sqrt{\\pi}$"), o("4","$2\\pi\\sqrt{\\pi}$"), o("5","$4\\pi\\sqrt{\\pi}$")],
    answer: 2,
    explanation: "셸: $V(a)=2\\pi\\!\\int_0^a x\\cdot xe^{-x^2}dx=2\\pi\\!\\int_0^a x^2 e^{-x^2}dx$. $\\lim=2\\pi\\!\\int_0^{\\infty}x^2 e^{-x^2}dx=2\\pi\\cdot\\dfrac{\\sqrt\\pi}{4}=\\dfrac{\\pi\\sqrt\\pi}{2}$."
  }),
  build({
    num: 17, subject: "다변수함수", unit: "중적분", concept: "적분 순서 변경", difficulty: "easyMedium",
    question: "이중적분 $\\displaystyle\\int_0^1\\!\\!\\int_{3y}^{3}e^{x^2}dx\\,dy$의 값은?",
    options: [o("1","$\\dfrac{1}{9}e^9-1$"), o("2","$\\dfrac{1}{6}e^9-1$"), o("3","$\\dfrac{1}{6}(e^9-1)$"), o("4","$\\dfrac{2}{3}e^9-1$"), o("5","$\\dfrac{2}{3}(e^9-1)$")],
    answer: 3,
    explanation: "순서 변경: $0\\le x\\le 3,\\,0\\le y\\le x/3$. $\\int_0^3\\!\\!\\int_0^{x/3}e^{x^2}dy\\,dx=\\tfrac{1}{3}\\!\\int_0^3 xe^{x^2}dx=\\tfrac{1}{6}[e^{x^2}]_0^3=\\dfrac{e^9-1}{6}$."
  }),
  build({
    num: 18, subject: "다변수함수", unit: "중적분", concept: "극좌표 변환", difficulty: "medium",
    question: "이중적분 $\\displaystyle\\iint_R\\tan^{-1}\\!\\left(\\dfrac{y}{x}\\right)dA$의 값은? (단, $R=\\{(x,y)\\mid 1\\le x^2+y^2\\le 4,\\,0\\le y\\le x\\}$)",
    options: [o("1","$\\dfrac{3}{64}\\pi^2$"), o("2","$\\dfrac{5}{64}\\pi^2$"), o("3","$\\dfrac{7}{64}\\pi^2$"), o("4","$\\dfrac{9}{64}\\pi^2$"), o("5","$\\dfrac{11}{64}\\pi^2$")],
    answer: 1,
    explanation: "극좌표: $\\tan^{-1}(y/x)=\\theta$, $1\\le r\\le 2,\\,0\\le\\theta\\le\\pi/4$. $\\int_0^{\\pi/4}\\!\\!\\int_1^2 \\theta r\\,dr\\,d\\theta=\\dfrac{\\pi^2}{32}\\cdot\\dfrac{3}{2}=\\dfrac{3\\pi^2}{64}$."
  }),
  build({
    num: 19, subject: "적분학", unit: "정적분의 응용", concept: "극좌표 영역 넓이", difficulty: "medium",
    question: "좌표평면 위에서 곡선 $x^3+2y^3=xy$ $(x,y\\ge 0)$으로 둘러싸인 영역의 넓이는?",
    options: [o("1","$\\dfrac{1}{24}$"), o("2","$\\dfrac{1}{12}$"), o("3","$\\dfrac{1}{6}$"), o("4","$\\dfrac{1}{3}$"), o("5","$\\dfrac{1}{2}$")],
    answer: 2,
    explanation: "극좌표 변환: $r^3\\cos^3\\theta+2r^3\\sin^3\\theta=r^2\\sin\\theta\\cos\\theta$ → $r=\\dfrac{\\sin\\theta\\cos\\theta}{\\cos^3\\theta+2\\sin^3\\theta}=\\dfrac{\\sec\\theta\\tan\\theta}{1+2\\tan^3\\theta}$. $S=\\tfrac{1}{2}\\!\\int_0^{\\pi/2}r^2 d\\theta$, $\\tan\\theta=t$ 후 $1+2t^3=u$ 치환하면 $\\dfrac{1}{12}\\!\\int_1^{\\infty}\\tfrac{1}{u^2}du=\\dfrac{1}{12}$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "선적분과 면적분", concept: "보존벡터장 선적분", difficulty: "medium",
    question: "곡선 $C$가 $r(t)=(\\ln t,e^t,t)$ $\\!\\left(\\dfrac{\\pi}{2}\\le t\\le\\pi\\right)$로 주어질 때, 벡터장 $\\mathbb{F}(x,y,z)=\\!\\left(e^x,-\\dfrac{1}{y}-\\cos z,\\,y\\sin z\\right)$의 선적분 $\\displaystyle\\int_C\\mathbb{F}\\cdot d\\mathbf{r}$의 값은?",
    options: [o("1","$\\dfrac{1}{2}e^{\\pi/2}$"), o("2","$e^{\\pi/2}$"), o("3","$\\dfrac{1}{2}e^{\\pi}$"), o("4","$e^{\\pi}-1$"), o("5","$e^{\\pi}$")],
    answer: 5,
    explanation: "$\\mathrm{curl}\\,\\mathbb{F}=0$이라 보존. 포텐셜 $f=e^x-\\ln y-y\\cos z$. 시점 $r(\\pi/2)=(\\ln(\\pi/2),e^{\\pi/2},\\pi/2)$, 종점 $r(\\pi)=(\\ln\\pi,e^{\\pi},\\pi)$. 차이 계산하면 $e^{\\pi}$."
  }),
];

console.log(`Inserting ${problems.length} questions...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
