// Upload 2024년도 숙명여대 편입수학 기출 20문항
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
const YEAR = "2024";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-sookmyung-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "$\\infty^0$ 형식", difficulty: "easy",
    question: "$\\displaystyle\\lim_{x\\to\\infty}\\!(5x)^{3/\\ln x}$의 값은?",
    options: [o("1","$e^{3/5}$"), o("2","$e$"), o("3","$e^{5/3}$"), o("4","$e^3$"), o("5","$e^5$")],
    answer: 4,
    explanation: "$(5x)^{3/\\ln x}=e^{3\\ln(5x)/\\ln x}=e^{3(\\ln 5+\\ln x)/\\ln x}\\to e^{3\\cdot 1}=e^3$ ($\\ln x\\to\\infty$이므로 $\\ln 5/\\ln x\\to 0$)."
  }),
  build({
    num: 2, subject: "미분학", unit: "도함수", concept: "함수방정식 미분", difficulty: "medium",
    question: "함수 $f$가 $f(x+y)=f(x)+f(y)+xy(x+y)$를 만족시키고 $f'(0)=2$일 때 $f'(2)$의 값은?",
    options: [o("1","$-2$"), o("2","$0$"), o("3","$2$"), o("4","$4$"), o("5","$6$")],
    answer: 5,
    explanation: "$x$로 편미분: $f'(x+y)=f'(x)+y(x+y)+xy=f'(x)+2xy+y^2$. $x=0$ 대입: $f'(y)=f'(0)+y^2=2+y^2$.\n$f'(2)=2+4=6$."
  }),
  build({
    num: 3, subject: "미분학", unit: "극한과 연속", concept: "한쪽 극한", difficulty: "medium",
    question: "$\\displaystyle\\lim_{x\\to 0^+}f(x)=A,\\,\\lim_{x\\to 0^-}f(x)=B$일 때, $\\displaystyle\\lim_{x\\to 0^-}f(x^2-x)-\\lim_{x\\to 1^-}f(x^2-x)$의 값은?",
    options: [o("1","$2A-B$"), o("2","$A-B$"), o("3","$-A+B$"), o("4","$A+B$"), o("5","$A-2B$")],
    answer: 2,
    explanation: "$x\\to 0^-$: $x<0\\Rightarrow x^2-x>0$ (i.e., $x^2-x\\to 0^+$). $\\lim f(x^2-x)=A$.\n$x\\to 1^-$: $x<1\\Rightarrow x^2-x=x(x-1)<0$ (i.e., $x^2-x\\to 0^-$). $\\lim f(x^2-x)=B$.\n차 $=A-B$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분의 응용", concept: "극곡선 길이", difficulty: "medium",
    question: "극방정식 $r=\\theta^2$ ($0\\le\\theta\\le 2\\pi$)으로 나타나는 곡선의 길이는?",
    options: [o("1","$\\dfrac{4}{3}((\\pi+1)^{1/2}-1)$"), o("2","$\\dfrac{4}{3}((\\pi^2+1)^{3/2}-1)$"), o("3","$\\dfrac{8}{3}((\\pi+1)^{1/2}-1)$"), o("4","$\\dfrac{8}{3}((\\pi^2+1)^{3/2}-1)$"), o("5","$\\dfrac{8}{3}((\\pi+1)^{3/2}-1)$")],
    answer: 4,
    explanation: "$L=\\!\\int_0^{2\\pi}\\!\\sqrt{r^2+(r')^2}d\\theta=\\!\\int_0^{2\\pi}\\!\\sqrt{\\theta^4+4\\theta^2}d\\theta=\\!\\int_0^{2\\pi}\\!\\theta\\sqrt{\\theta^2+4}d\\theta$.\n$u=\\theta^2+4$ 치환: $=\\dfrac{1}{2}\\cdot\\dfrac{2}{3}[u^{3/2}]_4^{4\\pi^2+4}=\\dfrac{1}{3}((4\\pi^2+4)^{3/2}-8)=\\dfrac{8}{3}((\\pi^2+1)^{3/2}-1)$."
  }),
  build({
    num: 5, subject: "미분학", unit: "미분의 응용", concept: "임계점·최댓값", difficulty: "easy",
    question: "구간 $[0,\\infty)$에서 함수 $f(x)=\\dfrac{x+1}{x^2+x+9}$의 최댓값은?",
    options: [o("1","$\\dfrac{1}{5}$"), o("2","$\\dfrac{2}{5}$"), o("3","$\\dfrac{3}{5}$"), o("4","$\\dfrac{4}{5}$"), o("5","$1$")],
    answer: 1,
    explanation: "$f'(x)=\\dfrac{(x^2+x+9)-(x+1)(2x+1)}{(x^2+x+9)^2}=\\dfrac{-(x+4)(x-2)}{(\\cdots)^2}$.\n$f'=0$에서 $x=2$ (정의역 내). $f(2)=\\dfrac{3}{15}=\\dfrac{1}{5}$.\n$f(0)=\\dfrac{1}{9}<\\dfrac{1}{5}$. 최댓값 $\\dfrac{1}{5}$."
  }),
  build({
    num: 6, subject: "미분학", unit: "극한과 연속", concept: "로피탈(변수상한 적분)", difficulty: "medium",
    question: "$\\displaystyle\\lim_{x\\to\\pi/3}\\!\\left(\\dfrac{x}{x-\\pi/3}\\!\\int_{\\pi/3}^{x}\\!\\dfrac{\\cos t}{t}\\,dt\\right)$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$1$"), o("3","$\\dfrac{3}{2}$"), o("4","$2$"), o("5","$\\dfrac{5}{2}$")],
    answer: 1,
    explanation: "$\\dfrac{x}{x-\\pi/3}\\!\\int_{\\pi/3}^x\\dfrac{\\cos t}{t}dt$. $x\\to\\pi/3$이면 $x\\to\\pi/3$ 한쪽. 로피탈:\n$\\dfrac{\\pi}{3}\\cdot\\lim_{x\\to\\pi/3}\\dfrac{\\cos x/x}{1}=\\dfrac{\\pi}{3}\\cdot\\dfrac{\\cos(\\pi/3)}{\\pi/3}=\\dfrac{\\pi}{3}\\cdot\\dfrac{1/2}{\\pi/3}=\\dfrac{1}{2}$."
  }),
  build({
    num: 7, subject: "다변수함수", unit: "다중적분", concept: "원·포물선 접·넓이", difficulty: "hard",
    question: "반지름의 길이가 $1$인 원이 곡선 $y=x^2$과 서로 다른 두 점에서 접한다. 원과 곡선으로 둘러싸인 음영으로 표시된 부분의 넓이는?",
    options: [o("1","$\\dfrac{\\sqrt 3}{2}-\\dfrac{\\pi}{3}$"), o("2","$\\dfrac{3\\sqrt 3}{4}-\\dfrac{\\pi}{3}$"), o("3","$\\sqrt 3-\\dfrac{\\pi}{3}$"), o("4","$\\dfrac{5\\sqrt 3}{4}-\\dfrac{\\pi}{3}$"), o("5","$\\dfrac{3\\sqrt 3}{2}-\\dfrac{\\pi}{3}$")],
    answer: 2,
    explanation: "원과 $y=x^2$의 접점 분석: 원 중심 $(0,a)$, 반지름 1. 접점 $(t,t^2)$에서 기울기 $2t$, 중심-접점 기울기 $\\dfrac{a-t^2}{-t}$. 수직 조건 + 거리 1: $a=\\dfrac{5}{4},\\,t=\\pm\\dfrac{\\sqrt 3}{2}$.\n넓이 계산 (직접 적분): $\\dfrac{3\\sqrt 3}{4}-\\dfrac{\\pi}{3}$."
  }),
  build({
    num: 8, subject: "적분학", unit: "정적분", concept: "변수상한 미분", difficulty: "medium",
    question: "실수 전체에서 연속인 함수 $f$가 모든 $x$에 대하여 $\\displaystyle\\int_0^{x^3}\\!f(t)\\,dt=x\\cos(\\pi x)$를 만족시킬 때 $f(1)$의 값은?",
    options: [o("1","$-1$"), o("2","$-\\dfrac{1}{2}$"), o("3","$-\\dfrac{1}{3}$"), o("4","$-\\dfrac{1}{4}$"), o("5","$-\\dfrac{1}{5}$")],
    answer: 3,
    explanation: "양변 미분: $3x^2 f(x^3)=\\cos(\\pi x)-\\pi x\\sin(\\pi x)$.\n$x=1$ 대입: $3f(1)=\\cos\\pi-\\pi\\sin\\pi=-1$. $f(1)=-\\dfrac{1}{3}$."
  }),
  build({
    num: 9, subject: "적분학", unit: "특이적분", concept: "치환 후 $\\arctan$", difficulty: "easy",
    question: "$\\displaystyle\\int_0^{\\infty}\\!\\dfrac{1}{\\sqrt x(1+x)}\\,dx$의 값은?",
    options: [o("1","$\\sqrt\\pi$"), o("2","$\\dfrac{3}{2}\\pi$"), o("3","$\\pi$"), o("4","$\\sqrt{2\\pi}$"), o("5","$2\\pi$")],
    answer: 3,
    explanation: "$u=\\sqrt x,\\,x=u^2,\\,dx=2u\\,du$. $\\!\\int_0^{\\infty}\\dfrac{2u}{u(1+u^2)}du=2\\!\\int_0^{\\infty}\\dfrac{du}{1+u^2}=2\\cdot\\dfrac{\\pi}{2}=\\pi$."
  }),
  build({
    num: 10, subject: "적분학", unit: "급수", concept: "$-\\ln(1-x)$", difficulty: "easy",
    question: "급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{1}{n\\cdot 2^n}$의 합은?",
    options: [o("1","$\\ln 2$"), o("2","$\\ln 3$"), o("3","$2\\ln 2$"), o("4","$\\ln 6$"), o("5","$2\\ln 3$")],
    answer: 1,
    explanation: "$-\\ln(1-x)=\\sum_{n=1}^{\\infty}\\dfrac{x^n}{n}$. $x=\\dfrac{1}{2}$: $-\\ln(1/2)=\\ln 2$."
  }),
  build({
    num: 11, subject: "선형대수", unit: "벡터", concept: "두 평면 각", difficulty: "easy",
    question: "두 평면 $x+2y+3z=1$과 $x-2y+2z=1$이 이루는 각이 $\\theta$일 때 $\\cos\\theta$의 값은?",
    options: [o("1","$\\dfrac{\\sqrt{14}}{28}$"), o("2","$\\dfrac{\\sqrt{14}}{21}$"), o("3","$\\dfrac{\\sqrt{14}}{14}$"), o("4","$\\dfrac{\\sqrt{14}}{7}$"), o("5","$\\dfrac{\\sqrt{14}}{2}$")],
    answer: 3,
    explanation: "법선벡터 $(1,2,3),(1,-2,2)$. $\\cos\\theta=\\dfrac{1-4+6}{\\sqrt{14}\\cdot 3}=\\dfrac{3}{3\\sqrt{14}}=\\dfrac{1}{\\sqrt{14}}=\\dfrac{\\sqrt{14}}{14}$."
  }),
  build({
    num: 12, subject: "미분학", unit: "도함수", concept: "관련 변화율", difficulty: "easy",
    question: "자동차 $A$는 $80\\,\\text{km/h}$의 속도로 서쪽으로 달리고, 자동차 $B$는 $100\\,\\text{km/h}$의 속도로 북쪽으로 달린다. 두 자동차가 교차점을 지나 교차점으로부터 자동차 $A$는 $60\\,\\text{m}$, 자동차 $B$는 $80\\,\\text{m}$의 거리에 있을 때 두 자동차가 서로 멀어지는 속도는?",
    options: [o("1","$113\\,\\text{km/h}$"), o("2","$118\\,\\text{km/h}$"), o("3","$123\\,\\text{km/h}$"), o("4","$128\\,\\text{km/h}$"), o("5","$133\\,\\text{km/h}$")],
    answer: 4,
    explanation: "$z^2=x^2+y^2$. $z\\cdot dz/dt=x\\cdot dx/dt+y\\cdot dy/dt$.\n$x=60,\\,y=80,\\,z=100$. $dx/dt=80,\\,dy/dt=100$.\n$100\\cdot dz/dt=60\\cdot 80+80\\cdot 100=4800+8000=12800$. $dz/dt=128$."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "편도함수", concept: "음함수 편미분", difficulty: "hard",
    question: "두 함수 $z=f(x,y),\\,w=g(x,y)$는 $x,y$에 대해 미분가능하고 $xw^3+yz^2+z^3=-1,\\,zw^3-xz^3+y^2w=1$이다. $(x,y)=(1,-1)$에서 $z=-1,\\,w=1$일 때 $\\dfrac{\\partial z}{\\partial x}$의 값은?",
    options: [o("1","$-\\dfrac{1}{2}$"), o("2","$-\\dfrac{3}{4}$"), o("3","$-1$"), o("4","$-\\dfrac{5}{4}$"), o("5","$-\\dfrac{3}{2}$")],
    answer: 4,
    explanation: "첫 식 $x$로 편미분: $w^3+3xw^2 w_x+2yz z_x+3z^2 z_x=0\\Rightarrow 1+3w_x+2z_x+3z_x=0$, $3w_x+5z_x=-1$.\n둘째 식 $x$로 편미분: $z_x w^3+3zw^2 w_x-z^3-3xz^2 z_x+y^2 w_x=0\\Rightarrow z_x-3w_x+1-3z_x+w_x=0\\Rightarrow-2w_x-2z_x=-1$.\n$2w_x+2z_x=1$. 연립: $w_x=1/2-z_x$, $3(1/2-z_x)+5z_x=-1\\Rightarrow 2z_x=-5/2\\Rightarrow z_x=-\\dfrac{5}{4}$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "다중적분", concept: "반원판 적분(극)", difficulty: "medium",
    question: "이중적분 $\\displaystyle\\int_0^{3}\\!\\int_{-\\sqrt{9-x^2}}^{\\sqrt{9-x^2}}\\!(x^3+xy^2)\\,dy\\,dx$의 값은?",
    options: [o("1","$\\dfrac{466}{5}$"), o("2","$\\dfrac{471}{5}$"), o("3","$\\dfrac{476}{5}$"), o("4","$\\dfrac{481}{5}$"), o("5","$\\dfrac{486}{5}$")],
    answer: 5,
    explanation: "영역: 반원 $r\\le 3,\\,-\\pi/2\\le\\theta\\le\\pi/2$ (오른쪽 반).\n극좌표: $\\!\\int_{-\\pi/2}^{\\pi/2}\\!\\int_0^3 r^3\\cos\\theta(\\cos^2\\theta+\\sin^2\\theta)\\cdot r\\,dr\\,d\\theta=\\!\\int_{-\\pi/2}^{\\pi/2}\\cos\\theta d\\theta\\cdot\\dfrac{243}{5}=2\\cdot\\dfrac{243}{5}=\\dfrac{486}{5}$."
  }),
  build({
    num: 15, subject: "다변수함수", unit: "다중적분", concept: "대칭 영역 적분", difficulty: "medium",
    question: "영역 $D=\\!\\left\\{(x,y):|x-y|\\le\\dfrac{3}{4},\\,0\\le x\\le 1,\\,0\\le y\\le 1\\right\\}$일 때 $\\displaystyle\\iint_D\\!(1+x-y)\\,dA$의 값은?",
    options: [o("1","$\\dfrac{7}{16}$"), o("2","$\\dfrac{9}{16}$"), o("3","$\\dfrac{11}{16}$"), o("4","$\\dfrac{13}{16}$"), o("5","$\\dfrac{15}{16}$")],
    answer: 5,
    explanation: "$\\!\\iint_D(x-y)dA=0$ (대칭, $x\\leftrightarrow y$ 교환에 영역 불변).\n$D$ 면적: 단위정사각형($=1$)에서 $|x-y|>3/4$인 두 삼각형(각 면적 $(1/2)(1/4)^2=1/32$) 제외 $\\Rightarrow 1-1/16=15/16$.\n적분값 $=15/16+0=15/16$."
  }),
  build({
    num: 16, subject: "적분학", unit: "정적분", concept: "적분의 평균값", difficulty: "easy",
    question: "구간 $[0,1]$에서 함수 $f(x)=\\displaystyle\\int_x^{1}\\!\\cos(t^2)\\,dt$의 평균값은?",
    options: [o("1","$\\dfrac{\\sin 1}{2}$"), o("2","$\\sin 1$"), o("3","$\\dfrac{3\\sin 1}{2}$"), o("4","$2\\sin 1$"), o("5","$\\dfrac{5}{2\\sin 1}$")],
    answer: 1,
    explanation: "평균 $=\\!\\int_0^1 f(x)dx=\\!\\int_0^1\\!\\int_x^1\\!\\cos(t^2)\\,dt\\,dx$. 적분순서 변경: $0\\le t\\le 1,\\,0\\le x\\le t$.\n$=\\!\\int_0^1 t\\cos(t^2)dt=\\dfrac{1}{2}[\\sin(t^2)]_0^1=\\dfrac{\\sin 1}{2}$."
  }),
  build({
    num: 17, subject: "다변수함수", unit: "편도함수", concept: "접평면", difficulty: "easy",
    question: "타원면 $\\dfrac{x^2}{4}+y^2+\\dfrac{z^2}{9}=6$ 위의 점 $(-2,1,-6)$에서의 접평면의 방정식은?",
    options: [o("1","$3x-6y+4z=-18$"), o("2","$3x-6y+4z=18$"), o("3","$3x-6y+4z=-36$"), o("4","$3x-6y+2z=36$"), o("5","$3x-6y+2z=-36$")],
    answer: 3,
    explanation: "$\\nabla F=\\!\\left(\\dfrac{x}{2},2y,\\dfrac{2z}{9}\\right)|_{(-2,1,-6)}=(-1,2,-\\dfrac{4}{3})\\parallel(3,-6,4)$ (×$-3$).\n접평면: $3(x+2)-6(y-1)+4(z+6)=0\\Rightarrow 3x-6y+4z=-36$."
  }),
  build({
    num: 18, subject: "다변수함수", unit: "다변수함수의 극값", concept: "산술기하 최댓값", difficulty: "medium",
    question: "구면 $x^2+y^2+z^2=4$ 위에서 함수 $f(x,y,z)=xy^2z$의 최댓값이 $a$, 최솟값이 $b$이다. $a-b$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 4,
    explanation: "산술기하: $x^2+\\dfrac{y^2}{2}+\\dfrac{y^2}{2}+z^2\\ge 4\\!\\left(\\dfrac{x^2 y^4 z^2}{4}\\right)^{1/4}$.\n$4\\ge 4(x^2y^4z^2/4)^{1/4}\\Rightarrow x^2y^4z^2\\le 4\\Rightarrow|xy^2z|\\le 2$.\n$a=2,b=-2,a-b=4$."
  }),
  build({
    num: 19, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피(원주껍질)", difficulty: "easy",
    question: "곡선 $y=x^3(2-x)$와 $x$축으로 둘러싸인 영역을 $y$축을 회전축으로 회전시켜 생기는 입체의 부피는?",
    options: [o("1","$\\dfrac{61\\pi}{15}$"), o("2","$\\dfrac{64\\pi}{15}$"), o("3","$\\dfrac{67\\pi}{15}$"), o("4","$\\dfrac{14\\pi}{3}$"), o("5","$\\dfrac{73\\pi}{15}$")],
    answer: 2,
    explanation: "교점: $x^3(2-x)=0\\Rightarrow x=0,2$.\n원주껍질: $V=2\\pi\\!\\int_0^2 x\\cdot x^3(2-x)dx=2\\pi\\!\\int_0^2(2x^4-x^5)dx=2\\pi\\!\\left[\\dfrac{2x^5}{5}-\\dfrac{x^6}{6}\\right]_0^2=2\\pi\\!\\left(\\dfrac{64}{5}-\\dfrac{64}{6}\\right)=\\dfrac{64\\pi}{15}$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "다중적분", concept: "극영역 넓이(빈 영역)", difficulty: "hard",
    question: "곡선 $r=1+\\tan\\theta$ ($0\\le\\theta\\le\\pi/2$)는 점 $P$에서 극축과 만나고, 곡선 $r=1+\\tan\\theta$와 $r=4\\cos^2\\theta$ ($0\\le\\theta\\le\\pi/2$)는 점 $Q$에서 만난다. 직선 $PQ$와 곡선 $r=1+\\tan\\theta$로 둘러싸인 부분의 넓이는?",
    options: [o("1","$\\dfrac{\\ln 2}{2}$"), o("2","$\\dfrac{1+\\ln 2}{2}$"), o("3","$1+\\dfrac{\\ln 2}{2}$"), o("4","$\\dfrac{3+\\ln 2}{2}$"), o("5","$2+\\dfrac{\\ln 2}{2}$")],
    answer: 2,
    explanation: "$P$: $\\theta=0$에서 $r=1$, $P=(1,0)$.\n$Q$: $1+\\tan\\theta=4\\cos^2\\theta$ at $\\theta=\\pi/4$ (확인: $2=2$). $Q$ 극좌표 $(2,\\pi/4)\\to(\\sqrt 2,\\sqrt 2)$.\n원점-곡선 면적 $\\dfrac{1}{2}\\!\\int_0^{\\pi/4}(1+\\tan\\theta)^2 d\\theta=\\dfrac{1}{2}(1+\\ln 2)$. 삼각형 $OPQ$ 면적 $\\dfrac{\\sqrt 2}{2}$.\n구하는 면적 $=\\dfrac{1+\\ln 2}{2}-\\dfrac{\\sqrt 2}{2}$. (출제 결함: 선지에 $-\\sqrt 2/2$ 항 누락. 공식 채점 (2))."
  })
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (2024 숙명여대):`, data.map((d) => d.id).join(", "));
