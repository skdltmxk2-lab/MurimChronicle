// Upload 2020년도 숙명여대 편입수학 기출 20문항
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
const YEAR = "2020";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-sookmyung-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "$1^{\\infty}$ 형식", difficulty: "easy",
    question: "극한 $\\displaystyle\\lim_{x\\to 1^+}\\!x^{1/(1-x)}$의 값은?",
    options: [o("1","$-e$"), o("2","$-\\dfrac{1}{e}$"), o("3","$1$"), o("4","$\\dfrac{1}{e}$"), o("5","$e$")],
    answer: 4,
    explanation: "$x^{1/(1-x)}=e^{\\ln x/(1-x)}$. $\\displaystyle\\lim_{x\\to 1^+}\\dfrac{\\ln x}{1-x}=\\dfrac{0}{0}$, 로피탈: $\\lim\\dfrac{1/x}{-1}=-1$.\n극한 $=e^{-1}=\\dfrac{1}{e}$."
  }),
  build({
    num: 2, subject: "다변수함수", unit: "편도함수", concept: "방향도함수 최댓값", difficulty: "easy",
    question: "점 $(1,1)$에서 함수 $f(x,y)=x^2y+\\sqrt y$의 변화율의 최댓값은?",
    options: [o("1","$\\dfrac{3}{2}$"), o("2","$\\dfrac{7}{4}$"), o("3","$2$"), o("4","$\\dfrac{9}{4}$"), o("5","$\\dfrac{5}{2}$")],
    answer: 5,
    explanation: "$f_x=2xy,\\,f_y=x^2+\\dfrac{1}{2\\sqrt y}$. $(1,1)$: $f_x=2,\\,f_y=1+\\dfrac{1}{2}=\\dfrac{3}{2}$.\n$|\\nabla f|=\\sqrt{4+\\dfrac{9}{4}}=\\sqrt{\\dfrac{25}{4}}=\\dfrac{5}{2}$."
  }),
  build({
    num: 3, subject: "적분학", unit: "정적분", concept: "치환적분 응용", difficulty: "medium",
    question: "함수 $f$가 구간 $[1,2]$에서 연속이고 $\\displaystyle\\int_1^{2}\\!x^k f(x)\\,dx=2+k^2$ ($k=0,1,2$)을 만족시킬 때 $\\displaystyle\\int_1^{4}\\!f(\\sqrt x)\\,dx$의 값은?",
    options: [o("1","$3$"), o("2","$4$"), o("3","$6$"), o("4","$8$"), o("5","$11$")],
    answer: 3,
    explanation: "$\\sqrt x=t$ 치환: $x=t^2,\\,dx=2t\\,dt$. 구간 $t:1\\to 2$.\n$\\displaystyle\\!\\int_1^4 f(\\sqrt x)\\,dx=\\!\\int_1^2 f(t)\\cdot 2t\\,dt=2\\!\\int_1^2 t\\,f(t)\\,dt=2(2+1^2)=6$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분의 응용", concept: "극곡선 길이", difficulty: "easy",
    question: "곡선 $r=e^{3\\theta}$의 길이는 (단, $0\\le\\theta\\le\\pi$).",
    options: [o("1","$\\dfrac{2\\sqrt 2}{3}(e^{3\\pi}-1)$"), o("2","$3(e^{3\\pi}-1)$"), o("3","$\\dfrac{\\sqrt{10}}{3}(e^{3\\pi}-1)$"), o("4","$\\dfrac{\\sqrt{11}}{3}(e^{3\\pi}-1)$"), o("5","$\\dfrac{2\\sqrt 3}{3}(e^{3\\pi}-1)$")],
    answer: 3,
    explanation: "$L=\\!\\int_0^{\\pi}\\!\\sqrt{r^2+(r')^2}\\,d\\theta=\\!\\int_0^{\\pi}\\!\\sqrt{e^{6\\theta}+9e^{6\\theta}}\\,d\\theta=\\sqrt{10}\\!\\int_0^{\\pi}\\!e^{3\\theta}\\,d\\theta=\\dfrac{\\sqrt{10}}{3}(e^{3\\pi}-1)$."
  }),
  build({
    num: 5, subject: "다변수함수", unit: "다중적분", concept: "적분순서 변경", difficulty: "easy",
    question: "적분 $\\displaystyle\\int_0^{1}\\!\\int_{\\sqrt x}^{1}\\!e^{y^3}\\,dy\\,dx$의 값은?",
    options: [o("1","$\\dfrac{e-2}{3}$"), o("2","$\\dfrac{e-1}{3}$"), o("3","$\\dfrac{e}{3}$"), o("4","$\\dfrac{e+1}{3}$"), o("5","$\\dfrac{e+2}{3}$")],
    answer: 2,
    explanation: "적분순서 변경: $0\\le y\\le 1,\\,0\\le x\\le y^2$.\n$\\displaystyle\\!\\int_0^1\\!\\int_0^{y^2}\\!e^{y^3}\\,dx\\,dy=\\!\\int_0^1\\!y^2 e^{y^3}\\,dy=\\dfrac{1}{3}[e^{y^3}]_0^1=\\dfrac{e-1}{3}$."
  }),
  build({
    num: 6, subject: "다변수함수", unit: "벡터해석", concept: "스칼라장 선적분", difficulty: "easy",
    question: "좌표공간에서 원점 $O$와 점 $(3,1,-2)$를 잇는 선분을 $C$라 할 때 호의 길이 $s$에 대한 선적분 $\\displaystyle\\int_C\\!x^2\\,ds$의 값은?",
    options: [o("1","$3\\sqrt{14}$"), o("2","$3\\sqrt{16}$"), o("3","$9\\sqrt 2$"), o("4","$6\\sqrt 5$"), o("5","$3\\sqrt{22}$")],
    answer: 1,
    explanation: "$\\mathbf r(t)=(3t,t,-2t),\\,0\\le t\\le 1$. $|\\mathbf r'|=\\sqrt{9+1+4}=\\sqrt{14}$.\n$\\!\\int_C x^2 ds=\\!\\int_0^1(3t)^2\\sqrt{14}\\,dt=9\\sqrt{14}\\cdot\\dfrac{1}{3}=3\\sqrt{14}$."
  }),
  build({
    num: 7, subject: "미분학", unit: "도함수", concept: "관련 변화율", difficulty: "easy",
    question: "정육면체의 부피가 $10\\,\\text{cm}^3/\\text{sec}$의 비율로 증가하고 있다. 한 변의 길이가 $30\\,\\text{cm}$일 때 겉넓이의 증가율은?",
    options: [o("1","$\\dfrac{1}{3}\\,\\text{cm}^2/\\text{sec}$"), o("2","$\\dfrac{2}{3}\\,\\text{cm}^2/\\text{sec}$"), o("3","$1\\,\\text{cm}^2/\\text{sec}$"), o("4","$\\dfrac{4}{3}\\,\\text{cm}^2/\\text{sec}$"), o("5","$\\dfrac{5}{3}\\,\\text{cm}^2/\\text{sec}$")],
    answer: 4,
    explanation: "$V=l^3,\\,dV/dt=3l^2\\,dl/dt$. $l=30$에서 $10=2700\\,dl/dt\\Rightarrow dl/dt=\\dfrac{1}{270}$.\n$S=6l^2,\\,dS/dt=12l\\,dl/dt=12\\cdot 30\\cdot\\dfrac{1}{270}=\\dfrac{4}{3}$."
  }),
  build({
    num: 8, subject: "적분학", unit: "정적분의 응용", concept: "단면 부피", difficulty: "medium",
    question: "구간 $[-1,1]$에서 입체도형 $S$를 $x$축에 수직인 평면으로 자른 단면이 중심이 포물선 $y=\\dfrac{1}{2}(1-x^2)$에 있고 $x$축에 접하는 원이다. 입체도형 $S$의 부피는?",
    options: [o("1","$\\dfrac{\\pi}{15}$"), o("2","$\\dfrac{2\\pi}{15}$"), o("3","$\\dfrac{\\pi}{5}$"), o("4","$\\dfrac{4\\pi}{15}$"), o("5","$\\dfrac{\\pi}{3}$")],
    answer: 4,
    explanation: "반지름 $r=\\dfrac{1}{2}(1-x^2)$ (중심이 $y$에 있고 $x$축 접하므로). 단면 넓이 $S(x)=\\dfrac{\\pi}{4}(1-x^2)^2$.\n$V=\\dfrac{\\pi}{4}\\!\\int_{-1}^{1}(1-x^2)^2\\,dx=\\dfrac{\\pi}{4}\\cdot 2\\cdot\\dfrac{8}{15}=\\dfrac{4\\pi}{15}$."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "다중적분", concept: "극좌표 부피", difficulty: "easy",
    question: "제1공간(first octant) 내에서 원기둥 $x^2+y^2=1$의 내부와 평면 $z=y$ 아래로 공통인 영역의 부피는?",
    options: [o("1","$\\dfrac{1}{7}$"), o("2","$\\dfrac{1}{6}$"), o("3","$\\dfrac{1}{5}$"), o("4","$\\dfrac{1}{4}$"), o("5","$\\dfrac{1}{3}$")],
    answer: 5,
    explanation: "$V=\\!\\iint_D y\\,dA$ ($D:x^2+y^2\\le 1,\\,x\\ge 0,\\,y\\ge 0$).\n극좌표: $V=\\!\\int_0^{\\pi/2}\\!\\int_0^1 r\\sin\\theta\\cdot r\\,dr\\,d\\theta=1\\cdot\\dfrac{1}{3}=\\dfrac{1}{3}$."
  }),
  build({
    num: 10, subject: "적분학", unit: "정적분의 응용", concept: "들어올리는 일", difficulty: "easy",
    question: "$20\\,\\text{m}$ 높이의 절벽 꼭대기에 무게 $20\\,\\text{kg}$, 길이 $10\\,\\text{m}$의 밧줄이 매달려 있다. 이 밧줄을 절벽 꼭대기로 들어 올리는데 필요한 일은?",
    options: [o("1","$100\\,\\text{kg}\\cdot\\text{m}$"), o("2","$110\\,\\text{kg}\\cdot\\text{m}$"), o("3","$121\\,\\text{kg}\\cdot\\text{m}$"), o("4","$144\\,\\text{kg}\\cdot\\text{m}$"), o("5","$156\\,\\text{kg}\\cdot\\text{m}$")],
    answer: 1,
    explanation: "선밀도 $\\dfrac{20}{10}=2\\,\\text{kg/m}$. 깊이 $x$의 요소 $dx$ 무게 $=2\\,dx$, 들어 올림 거리 $=x$.\n$W=\\!\\int_0^{10}2\\,x\\,dx=[x^2]_0^{10}=100\\,\\text{kg}\\cdot\\text{m}$."
  }),
  build({
    num: 11, subject: "적분학", unit: "급수", concept: "수렴반경(비율판정)", difficulty: "medium",
    question: "급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(n+1)^n}{p^n n!}$이 수렴하는 자연수 $p$의 최솟값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 3,
    explanation: "$\\!\\left|\\dfrac{a_{n+1}}{a_n}\\right|=\\!\\left(\\dfrac{n+2}{n+1}\\right)^{n+1}\\cdot\\dfrac{1}{p}\\to\\dfrac{e}{p}$.\n수렴 조건: $p>e\\approx 2.718$, 최소 자연수 $p=3$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "편도함수", concept: "접평면 평행 조건", difficulty: "easy",
    question: "곡면 $x^2+y^2+2z=1$ 위의 점 $P(a,b,c)$에서의 접평면이 평면 $x+2y+z=1$과 평행할 때 $a+b+c$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 1,
    explanation: "$\\nabla F=(2x,2y,2)|_P=(2a,2b,2)$가 $(1,2,1)$과 평행 $\\Rightarrow 2a=2,\\,2b=4$, $a=1,\\,b=2$.\n$a^2+b^2+2c=1\\Rightarrow 1+4+2c=1\\Rightarrow c=-2$. $a+b+c=1$."
  }),
  build({
    num: 13, subject: "미분학", unit: "도함수", concept: "역함수의 도함수", difficulty: "medium",
    question: "함수 $f(x)=x\\sqrt{3+x^2}$에 대하여 역함수 $f^{-1}$의 미분계수 $(f^{-1})'(-2)$의 값은?",
    options: [o("1","$\\dfrac{1}{5}$"), o("2","$\\dfrac{2}{5}$"), o("3","$\\dfrac{3}{5}$"), o("4","$\\dfrac{4}{5}$"), o("5","$1$")],
    answer: 2,
    explanation: "$f(x)=-2\\Rightarrow x\\sqrt{3+x^2}=-2$, 시도 $x=-1$: $-1\\cdot 2=-2$ ✓.\n$f'(x)=\\sqrt{3+x^2}+\\dfrac{x^2}{\\sqrt{3+x^2}}=\\dfrac{3+2x^2}{\\sqrt{3+x^2}}$.\n$f'(-1)=\\dfrac{5}{2}$. $(f^{-1})'(-2)=\\dfrac{2}{5}$."
  }),
  build({
    num: 14, subject: "미분학", unit: "도함수", concept: "원과 포물선 접 조건", difficulty: "medium",
    question: "중심이 $(0,a)$이고 반지름의 길이가 $1$인 원이 포물선 $y=x^2$과 두 점에서 접할 때 $a$의 값은?",
    options: [o("1","$\\dfrac{11}{12}$"), o("2","$1$"), o("3","$\\dfrac{13}{12}$"), o("4","$\\dfrac{7}{6}$"), o("5","$\\dfrac{5}{4}$")],
    answer: 5,
    explanation: "교점: $x^2+(y-a)^2=1$에 $x^2=y$ 대입 $\\Rightarrow y+(y-a)^2=1\\Rightarrow y^2-(2a-1)y+a^2-1=0$.\n$y=t$ 두면 두 점 접하려면 판별식 $0$: $(2a-1)^2-4(a^2-1)=0\\Rightarrow-4a+5=0\\Rightarrow a=\\dfrac{5}{4}$."
  }),
  build({
    num: 15, subject: "미분학", unit: "도함수", concept: "수평접선(극곡선)", difficulty: "hard",
    question: "곡선 $r=1+\\cos\\theta$ 위의 점에서의 접선의 방정식이 $y=a$이다. 양수 $a$의 값은?",
    options: [o("1","$\\dfrac{\\sqrt{19}}{4}$"), o("2","$\\dfrac{\\sqrt{21}}{4}$"), o("3","$\\dfrac{\\sqrt{23}}{4}$"), o("4","$\\dfrac{5}{4}$"), o("5","$\\dfrac{3\\sqrt 3}{4}$")],
    answer: 5,
    explanation: "수평접선: $\\dfrac{dy}{d\\theta}=0$. $y=(1+\\cos\\theta)\\sin\\theta$, $\\dfrac{dy}{d\\theta}=\\cos\\theta+\\cos 2\\theta=2\\cos^2\\theta+\\cos\\theta-1=(2\\cos\\theta-1)(\\cos\\theta+1)$.\n$\\cos\\theta=\\dfrac{1}{2}\\Rightarrow\\theta=\\pi/3$. $y=\\dfrac{3}{2}\\cdot\\dfrac{\\sqrt 3}{2}=\\dfrac{3\\sqrt 3}{4}$."
  }),
  build({
    num: 16, subject: "적분학", unit: "급수", concept: "$\\sum n x^n$", difficulty: "easy",
    question: "급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n\\cdot 2^{n-1}}{3^n}$의 합은?",
    options: [o("1","$\\dfrac{3}{2}$"), o("2","$2$"), o("3","$\\dfrac{5}{2}$"), o("4","$3$"), o("5","$\\dfrac{7}{2}$")],
    answer: 4,
    explanation: "$\\sum_{n=1}^{\\infty}\\dfrac{n}{2}\\!\\left(\\dfrac{2}{3}\\right)^n=\\dfrac{1}{2}\\cdot\\dfrac{2/3}{(1/3)^2}=\\dfrac{1}{2}\\cdot 6=3$."
  }),
  build({
    num: 17, subject: "적분학", unit: "정적분의 응용", concept: "파푸스(이격축 회전)", difficulty: "easy",
    question: "원 $x^2+y^2=1$을 직선 $y=2$를 회전축으로 회전시켜 얻은 회전체의 겉넓이는?",
    options: [o("1","$7\\pi^2$"), o("2","$8\\pi^2$"), o("3","$9\\pi^2$"), o("4","$10\\pi^2$"), o("5","$11\\pi^2$")],
    answer: 2,
    explanation: "파푸스 정리: $S=2\\pi d\\cdot L$. $d=$ 회전축까지 거리 $=2$, $L=$ 원 둘레 $=2\\pi$.\n$S=2\\pi\\cdot 2\\cdot 2\\pi=8\\pi^2$."
  }),
  build({
    num: 18, subject: "다변수함수", unit: "다중적분", concept: "극영역 공통 넓이", difficulty: "hard",
    question: "곡선 $r=\\sqrt 2\\sin\\theta$의 내부와 곡선 $r^2=\\sin 2\\theta$의 내부로 공통인 영역의 넓이는?",
    options: [o("1","$\\dfrac{\\pi}{7}$"), o("2","$\\dfrac{\\pi}{8}$"), o("3","$\\dfrac{\\pi}{9}$"), o("4","$\\dfrac{\\pi}{10}$"), o("5","$\\dfrac{\\pi}{11}$")],
    answer: 2,
    explanation: "교점: $\\sqrt 2\\sin\\theta=\\sqrt{\\sin 2\\theta}\\Rightarrow\\theta=\\pi/4$.\n$S=\\dfrac{1}{2}\\!\\int_0^{\\pi/4}(\\sqrt 2\\sin\\theta)^2 d\\theta+\\dfrac{1}{2}\\!\\int_{\\pi/4}^{\\pi/2}\\sin 2\\theta\\,d\\theta$\n$=\\!\\int_0^{\\pi/4}\\sin^2\\theta\\,d\\theta+\\dfrac{1}{2}\\cdot\\dfrac{1}{2}[-\\cos 2\\theta]_{\\pi/4}^{\\pi/2}=\\!\\left(\\dfrac{\\pi}{8}-\\dfrac{1}{4}\\right)+\\dfrac{1}{4}=\\dfrac{\\pi}{8}$."
  }),
  build({
    num: 19, subject: "미분학", unit: "미분의 응용", concept: "접선과 삼각형 넓이 최소", difficulty: "medium",
    question: "좌표평면에서 포물선 $y=1-x^2$ 위의 점 $P$에서의 접선이 $x$축, $y$축과 만나는 점을 각각 $A,B$라 할 때 삼각형 $OAB$의 넓이의 최솟값은? (단, $O$는 원점, $P$는 제1사분면)",
    options: [o("1","$\\dfrac{2\\sqrt 3}{9}$"), o("2","$\\dfrac{\\sqrt 3}{3}$"), o("3","$\\dfrac{4\\sqrt 3}{9}$"), o("4","$\\dfrac{5\\sqrt 3}{9}$"), o("5","$\\dfrac{2\\sqrt 3}{3}$")],
    answer: 3,
    explanation: "접점 $(a,1-a^2)$, 접선 기울기 $-2a$. 접선: $y=-2ax+a^2+1$.\n$x$절편 $\\dfrac{a^2+1}{2a}$, $y$절편 $a^2+1$.\n$S(a)=\\dfrac{(a^2+1)^2}{4a}$. $S'(a)=\\dfrac{(a^2+1)(3a^2-1)}{4a^2}=0\\Rightarrow a=\\dfrac{1}{\\sqrt 3}$.\n$S=\\dfrac{(4/3)^2}{4/\\sqrt 3}=\\dfrac{16/9}{4/\\sqrt 3}=\\dfrac{4\\sqrt 3}{9}$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "다중적분", concept: "야코비안 변환", difficulty: "hard",
    question: "네 곡선 $y=x^2,\\,y=2x^2,\\,x=y^2,\\,x=3y^2$으로 둘러싸인 영역의 넓이는?",
    options: [o("1","$\\dfrac{1}{18}$"), o("2","$\\dfrac{1}{9}$"), o("3","$\\dfrac{3}{18}$"), o("4","$\\dfrac{2}{9}$"), o("5","$\\dfrac{5}{18}$")],
    answer: 2,
    explanation: "$u=\\dfrac{y}{x^2},\\,v=\\dfrac{x}{y^2}$ 치환. 경계: $u=1,2,\\,v=1,3$.\n야코비안 $J=\\partial(u,v)/\\partial(x,y)$ 계산 후 $|dxdy|=\\dfrac{1}{3u^2v^2}|du\\,dv|$.\n$\\!\\iint dxdy=\\!\\int_1^2\\!\\int_1^3\\dfrac{1}{3u^2v^2}\\,dv\\,du=\\dfrac{1}{3}\\cdot\\dfrac{1}{2}\\cdot\\dfrac{2}{3}=\\dfrac{1}{9}$."
  })
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (2020 숙명여대):`, data.map((d) => d.id).join(", "));
