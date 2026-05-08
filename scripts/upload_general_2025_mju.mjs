// Upload 2025년도 명지대 편입수학 기출 25문항 (5지선다)
// Usage: node scripts/upload_general_2025_mju.mjs
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
const YEAR = "2025";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });

function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-mju-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return {
    id, subject, unit, concept, difficulty,
    source_type: "imported", question, content_type: "latex", question_image: null,
    options, correct_option_id: String(answer), explanation,
    explanation_content_type: "latex", explanation_image: null, tags,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "도함수", concept: "매개변수 미분", difficulty: "easyMedium",
    question: "매개방정식 $x=1+t^2$, $y=2-t^3$에 대하여 $t=-1$일 때, $\\dfrac{dy}{dx}$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$1$"), o("3","$\\dfrac{3}{2}$"), o("4","$2$"), o("5","$\\dfrac{5}{2}$")],
    answer: 3,
    explanation: "$\\dfrac{dy}{dx}=\\dfrac{dy/dt}{dx/dt}=\\dfrac{-3t^2}{2t}=-\\dfrac{3t}{2}$. $t=-1$ 대입 시 $\\dfrac{3}{2}$."
  }),
  build({
    num: 2, subject: "미분학", unit: "도함수의 응용", concept: "극값과 변곡점", difficulty: "easyMedium",
    question: "함수 $f(x)=1-\\dfrac{1}{x}+\\dfrac{1}{x^2}$ $(x\\ne 0)$은 $x=a$에서 극소이고, 그 그래프의 변곡점의 $x$좌표는 $b$이다. $a+b$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 5,
    explanation: "$f'(x)=\\dfrac{1}{x^2}-\\dfrac{2}{x^3}=\\dfrac{x-2}{x^3}$ → 임계점 $x=2$, 부호 검토하면 극소 → $a=2$. $f''(x)=-\\dfrac{2}{x^3}+\\dfrac{6}{x^4}=\\dfrac{6-2x}{x^4}$ → 변곡점 $x=3$ → $b=3$. $a+b=5$."
  }),
  build({
    num: 3, subject: "적분학", unit: "정적분의 응용", concept: "곡선과 직선 사이 넓이", difficulty: "medium",
    question: "그림과 같이 실수 $a$가 $0<a<2$일 때, 포물선 $y=(x-2)^2$ 위의 점 $(a,(a-2)^2)$에서의 접선과 포물선 및 $x$축과 $y$축으로 둘러싸인 부분의 넓이를 $S(a)$라 하자. $S(a)$의 값이 최소가 되도록 하는 $a$의 값은?",
    options: [o("1","$\\dfrac{1}{6}$"), o("2","$\\dfrac{1}{3}$"), o("3","$\\dfrac{1}{2}$"), o("4","$\\dfrac{2}{3}$"), o("5","$\\dfrac{5}{6}$")],
    answer: 4,
    explanation: "포물선과 $x$축 사이 넓이는 $a$에 무관하므로 $S(a)$가 최소 ⇔ 접선과 두 축으로 둘러싸인 삼각형 넓이 최대. 접선식 $y=2(a-2)(x-a)+(a-2)^2$에서 $x$절편 $\\tfrac12 a+1$, $y$절편 $-a^2+4$. 삼각형 넓이의 1/2배 부호 등 정리 후 $S'(a)=1-\\tfrac{3}{4}a^2-a$. $3a^2+4a-4=0$ → $a=\\dfrac{2}{3}$ ($0<a<2$)."
  }),
  build({
    num: 4, subject: "적분학", unit: "급수", concept: "급수 수렴 판정", difficulty: "medium",
    question: "$\\langle$보기$\\rangle$에서 수렴하는 급수만을 있는 대로 고른 것은?\n\n$\\text{ㄱ. } \\displaystyle\\sum_{n=2}^{\\infty}(-1)^n\\dfrac{\\sqrt{n}}{\\ln n}\\quad \\text{ㄴ. } \\sum_{n=1}^{\\infty}\\dfrac{(n+1)4^n}{3^{2n+1}}\\quad \\text{ㄷ. } \\sum_{n=1}^{\\infty}\\!\\left(\\dfrac{2n+5}{3n+4}\\right)^{\\!n}$",
    options: [o("1","ㄱ"), o("2","ㄷ"), o("3","ㄱ, ㄴ"), o("4","ㄴ, ㄷ"), o("5","ㄱ, ㄴ, ㄷ")],
    answer: 4,
    explanation: "ㄱ. 교대급수이지만 $\\dfrac{\\sqrt{n}}{\\ln n}\\to\\infty$이라 일반항이 0으로 수렴하지 않아 발산. ㄴ. $=\\dfrac{1}{3}\\sum(n+1)\\!\\left(\\dfrac{4}{9}\\right)^n$, 비율 $4/9<1$이므로 수렴. ㄷ. $n$승근 판정: $\\lim\\dfrac{2n+5}{3n+4}=\\dfrac{2}{3}<1$이라 수렴."
  }),
  build({
    num: 5, subject: "다변수함수", unit: "벡터", concept: "외적과 내적", difficulty: "easyMedium",
    question: "두 벡터 $\\mathbf{u}=\\langle 1,2,\\sqrt{3}\\rangle$, $\\mathbf{v}=\\langle a,0,b\\rangle$가 $|\\mathbf{u}\\times\\mathbf{v}|=|\\mathbf{u}||\\mathbf{v}|$, $|\\mathbf{u}+\\mathbf{v}|^2=|\\mathbf{u}|^2+1$을 만족시킬 때, $\\dfrac{b^2}{a^2}$의 값은?",
    options: [o("1","$\\dfrac{1}{6}$"), o("2","$\\dfrac{1}{3}$"), o("3","$\\dfrac{1}{2}$"), o("4","$\\dfrac{2}{3}$"), o("5","$\\dfrac{5}{6}$")],
    answer: 2,
    explanation: "$|\\mathbf{u}\\times\\mathbf{v}|=|\\mathbf{u}||\\mathbf{v}|\\sin\\theta$이므로 조건은 $\\sin\\theta=1$, 즉 $\\mathbf{u}\\perp\\mathbf{v}$ → $\\mathbf{u}\\cdot\\mathbf{v}=a+\\sqrt{3}b=0$ → $a=-\\sqrt{3}b$. $|\\mathbf{u}+\\mathbf{v}|^2=|\\mathbf{u}|^2+|\\mathbf{v}|^2$ ($\\mathbf{u}\\cdot\\mathbf{v}=0$이므로) → $|\\mathbf{v}|^2=1$ → $a^2+b^2=1$ → $4b^2=1$. $\\dfrac{b^2}{a^2}=\\dfrac{1}{3}$."
  }),
  build({
    num: 6, subject: "다변수함수", unit: "경도 및 방향도함수", concept: "방향도함수", difficulty: "easyMedium",
    question: "삼변수 함수 $f(x,y,z)=x\\tan^{-1}y+z\\sin(xy)$에 대하여 점 $P\\!\\left(\\dfrac{\\pi}{2},1,1\\right)$에서 $\\mathbf{v}=\\langle 2,-2,1\\rangle$ 방향으로의 $f$의 변화율은?",
    options: [o("1","$-\\dfrac{1}{3}$"), o("2","$-\\dfrac{1}{4}$"), o("3","$0$"), o("4","$\\dfrac{1}{4}$"), o("5","$\\dfrac{1}{3}$")],
    answer: 5,
    explanation: "$\\nabla f=\\big(\\tan^{-1}y+yz\\cos(xy),\\,\\dfrac{x}{1+y^2}+xz\\cos(xy),\\,\\sin(xy)\\big)$. $P$에서 $\\nabla f=\\big(\\tfrac{\\pi}{4},\\tfrac{\\pi}{4},1\\big)$. 단위벡터 $\\mathbf{u}=\\tfrac{1}{3}\\langle 2,-2,1\\rangle$. $D_{\\mathbf{u}}f=\\tfrac{\\pi}{4}\\cdot\\tfrac{2}{3}+\\tfrac{\\pi}{4}\\cdot(-\\tfrac{2}{3})+1\\cdot\\tfrac{1}{3}=\\dfrac{1}{3}$."
  }),
  build({
    num: 7, subject: "미분학", unit: "도함수의 응용", concept: "관련 변화율", difficulty: "medium",
    question: "그림과 같이 두 직선도로가 한 지점 $O$에서 만나고, 점 $O$에서 두 도로가 이루는 각의 크기는 $60°$이다. 두 자동차 $A,B$가 점 $O$에서 동시에 출발하여 두 도로를 따라 달리고 있다. 자동차 $A$의 속도는 $80\\,\\mathrm{km/h}$이고 자동차 $B$의 속도는 $60\\,\\mathrm{km/h}$일 때, $30$분 후 두 자동차 $A,B$ 사이의 거리의 변화율은? (단, 변화율의 단위는 $\\mathrm{km/h}$이고, 도로의 폭은 무시한다.)",
    options: [o("1","$20\\sqrt{13}$"), o("2","$25\\sqrt{13}$"), o("3","$30\\sqrt{13}$"), o("4","$35\\sqrt{13}$"), o("5","$40\\sqrt{13}$")],
    answer: 1,
    explanation: "$30$분 뒤 $a=40$, $b=30$, $\\tfrac{da}{dt}=80$, $\\tfrac{db}{dt}=60$. 코사인 법칙 $c^2=a^2+b^2-ab$. 시간 미분: $2c\\tfrac{dc}{dt}=2a\\tfrac{da}{dt}+2b\\tfrac{db}{dt}-b\\tfrac{da}{dt}-a\\tfrac{db}{dt}$. $c=\\sqrt{40^2+30^2-40\\cdot 30}=\\sqrt{1300}=10\\sqrt{13}$. 대입하면 $\\tfrac{dc}{dt}=20\\sqrt{13}$."
  }),
  build({
    num: 8, subject: "미분학", unit: "도함수의 응용", concept: "선형근사(음함수)", difficulty: "medium",
    question: "$x>0$에서 미분가능한 함수 $f(x)$가 다음 조건을 만족시킨다.\n\n(가) $f(1)=-1$ \\quad (나) $x^2 f(x)+f(x)^4=0$\n\n함수 $f(x)$의 $x=1$에서의 선형화(일차근사식)을 $L(x)$라 할 때, $L(1.1)$의 값은?",
    options: [o("1","$-\\dfrac{16}{15}$"), o("2","$-\\dfrac{11}{10}$"), o("3","$-\\dfrac{17}{15}$"), o("4","$-\\dfrac{7}{6}$"), o("5","$-\\dfrac{6}{5}$")],
    answer: 1,
    explanation: "$x^2 f(x)+f(x)^4=0$ 양변 미분: $2xf(x)+x^2 f'(x)+4f(x)^3 f'(x)=0$. $x=1$, $f(1)=-1$ 대입: $-2+f'(1)-4f'(1)=0$ → $f'(1)=-\\tfrac{2}{3}$. $L(x)=-1-\\tfrac{2}{3}(x-1)$이므로 $L(1.1)=-1-\\tfrac{1}{15}=-\\dfrac{16}{15}$."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "벡터", concept: "방향코사인", difficulty: "medium",
    question: "두 벡터 $\\mathbf{u}=\\langle a,b,c\\rangle$, $\\mathbf{v}=\\langle 2,\\sqrt{2},1\\rangle$에 대하여 $\\mathbf{u}$의 방향코사인을 성분으로 하는 벡터 $\\left\\langle \\dfrac{1}{2},\\dfrac{\\sqrt{2}}{2},t\\right\\rangle$이고 $\\mathbf{u}\\cdot\\mathbf{v}=3\\sqrt{2}$일 때, $a^2+b^2+c^2$의 값은? (단, $t<0$)",
    options: [o("1","$6$"), o("2","$8$"), o("3","$10$"), o("4","$12$"), o("5","$14$")],
    answer: 2,
    explanation: "방향코사인의 크기는 $1$이므로 $\\tfrac{1}{4}+\\tfrac{1}{2}+t^2=1$ → $t=-\\tfrac{1}{2}$. $\\mathbf{u}=|\\mathbf{u}|\\!\\left\\langle \\tfrac{1}{2},\\tfrac{\\sqrt{2}}{2},-\\tfrac{1}{2}\\right\\rangle$. $\\mathbf{u}\\cdot\\mathbf{v}=|\\mathbf{u}|(1+1-\\tfrac{1}{2})=\\tfrac{3}{2}|\\mathbf{u}|=3\\sqrt{2}$ → $|\\mathbf{u}|=2\\sqrt{2}$, $a^2+b^2+c^2=|\\mathbf{u}|^2=8$."
  }),
  build({
    num: 10, subject: "적분학", unit: "정적분의 계산", concept: "부분적분", difficulty: "medium",
    question: "양의 정수 $k$에 대하여 $f(k)=\\displaystyle\\int_1^e x^{k-1}\\ln x\\,dx$라 할 때, $16f(4)-9f(3)$의 값은?",
    options: [o("1","$e^3(e-2)$"), o("2","$2e^3(e-1)$"), o("3","$e^3(3e-2)$"), o("4","$2e^4(e-1)$"), o("5","$e^4(3e-2)$")],
    answer: 3,
    explanation: "부분적분: $u=\\ln x$, $dv=x^{k-1}dx$ → $f(k)=\\tfrac{e^k}{k}-\\tfrac{e^k-1}{k^2}$, 즉 $k^2 f(k)=(k-1)e^k+1$. $16f(4)=3e^4+1$, $9f(3)=2e^3+1$. 차 $=3e^4-2e^3=e^3(3e-2)$."
  }),
  build({
    num: 11, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피(셸)", difficulty: "medium",
    question: "두 곡선 $y=x^2-2x+2$와 $y=2x-1$로 둘러싸인 영역을 $y$축으로 회전시켜 얻은 입체의 부피는?",
    options: [o("1","$\\dfrac{10}{3}\\pi$"), o("2","$4\\pi$"), o("3","$\\dfrac{14}{3}\\pi$"), o("4","$\\dfrac{16}{3}\\pi$"), o("5","$6\\pi$")],
    answer: 4,
    explanation: "교점: $x^2-4x+3=0$ → $x=1,3$. 셸 방법: $V=2\\pi\\int_1^3 x\\big[(2x-1)-(x^2-2x+2)\\big]dx=2\\pi\\int_1^3(-x^3+4x^2-3x)dx=\\dfrac{16}{3}\\pi$."
  }),
  build({
    num: 12, subject: "적분학", unit: "급수", concept: "텔레스코핑", difficulty: "medium",
    question: "$0<x<\\dfrac{\\pi}{2}$에서 정의된 두 함수 $\\tan x$, $\\cot x$의 역함수를 각각 $\\tan^{-1}x$, $\\cot^{-1}x$라 할 때, $\\displaystyle\\sum_{n=1}^{\\infty}\\!\\big(\\tan^{-1}(n+1)-\\cot^{-1}(n+1)-\\tan^{-1}n+\\cot^{-1}n\\big)$의 값은?",
    options: [o("1","$0$"), o("2","$\\dfrac{\\pi}{4}$"), o("3","$\\dfrac{\\pi}{2}$"), o("4","$\\dfrac{3}{4}\\pi$"), o("5","$\\pi$")],
    answer: 3,
    explanation: "텔레스코핑: 부분합 $=\\tan^{-1}(N+1)-\\cot^{-1}(N+1)-\\tan^{-1}1+\\cot^{-1}1$. $N\\to\\infty$일 때 $\\tan^{-1}(N+1)\\to\\tfrac{\\pi}{2}$, $\\cot^{-1}(N+1)\\to 0$, $\\tan^{-1}1=\\cot^{-1}1=\\tfrac{\\pi}{4}$. 합 $=\\tfrac{\\pi}{2}-0-\\tfrac{\\pi}{4}+\\tfrac{\\pi}{4}=\\dfrac{\\pi}{2}$."
  }),
  build({
    num: 13, subject: "적분학", unit: "정적분의 응용", concept: "극좌표 부채꼴", difficulty: "easyMedium",
    question: "좌표평면에서 두 극곡선 $C_1: r=2\\cos 2\\theta$와 $C_2: r=1$에 대하여, 곡선 $C_1$과 곡선 $C_2$가 제1사분면에서 만나는 서로 다른 두 점을 각각 $A, B$라 할 때, 부채꼴 $OAB$의 넓이는? (단, $O$는 원점이다.)",
    options: [o("1","$\\dfrac{\\pi}{12}$"), o("2","$\\dfrac{\\pi}{10}$"), o("3","$\\dfrac{\\pi}{8}$"), o("4","$\\dfrac{\\pi}{6}$"), o("5","$\\dfrac{\\pi}{4}$")],
    answer: 1,
    explanation: "교점은 $\\tfrac{\\pi}{4}$ 대칭. 제1사분면에서 $A=(1,\\tfrac{\\pi}{6})$, $B=(1,\\tfrac{\\pi}{3})$ → $\\angle AOB=\\big(\\tfrac{\\pi}{4}-\\tfrac{\\pi}{6}\\big)\\times 2=\\tfrac{\\pi}{6}$. 부채꼴 넓이 $S=\\tfrac{1}{2}r^2\\theta=\\tfrac{1}{2}\\cdot 1\\cdot\\tfrac{\\pi}{6}=\\dfrac{\\pi}{12}$."
  }),
  build({
    num: 14, subject: "적분학", unit: "정적분의 응용", concept: "극좌표 영역 넓이", difficulty: "mediumHard",
    question: "두 극곡선 $C_1: r=2\\cos 2\\theta$, $C_2: r=1$에 대하여 곡선 $C_1$의 외부와 곡선 $C_2$의 내부에 놓여있는 공통 영역의 넓이는?",
    options: [o("1","$\\dfrac{\\sqrt{3}}{2}-\\dfrac{\\pi}{6}$"), o("2","$\\sqrt{3}-\\dfrac{\\pi}{3}$"), o("3","$\\dfrac{3\\sqrt{3}}{2}-\\dfrac{\\pi}{2}$"), o("4","$2\\sqrt{3}-\\dfrac{2}{3}\\pi$"), o("5","$\\dfrac{5\\sqrt{3}}{2}-\\dfrac{5}{6}\\pi$")],
    answer: 2,
    explanation: "제1사분면에서 부채꼴 $OAB$의 넓이($\\tfrac{\\pi}{12}$)에서 4엽장미의 $\\tfrac{\\pi}{6}\\le\\theta\\le\\tfrac{\\pi}{4}$ 영역 $\\times 2$를 빼고 4배. $\\int_{\\pi/6}^{\\pi/4}4\\cos^2 2\\theta\\,d\\theta\\cdot 2=\\tfrac{\\pi}{6}-\\tfrac{\\sqrt{3}}{4}$. 1사분면 영역 $=\\tfrac{\\pi}{12}-(\\tfrac{\\pi}{6}-\\tfrac{\\sqrt{3}}{4})=\\tfrac{\\sqrt{3}}{4}-\\tfrac{\\pi}{12}$. $\\times 4=\\sqrt{3}-\\dfrac{\\pi}{3}$."
  }),
  build({
    num: 15, subject: "미분학", unit: "극한과 연속", concept: "로피탈 정리", difficulty: "medium",
    question: "함수 $f(t)=\\displaystyle\\int_{3t}^{4t}e^{-s^2}ds$에 대하여 $\\displaystyle\\lim_{x\\to 0}\\dfrac{\\int_x^{2x}f(t)\\,dt}{1-\\cos x}$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 3,
    explanation: "$0/0$, 로피탈 두 번 적용: 1차 → $\\dfrac{2f(2x)-f(x)}{\\sin x}$($f(0)=0$이므로 다시 $0/0$), 2차 → $\\dfrac{4f'(2x)-f'(x)}{\\cos x}\\to 3f'(0)$. FTC로 $f'(t)=4e^{-16t^2}-3e^{-9t^2}$ → $f'(0)=1$. 답 $=3$."
  }),
  build({
    num: 16, subject: "적분학", unit: "급수", concept: "무한등비급수 적분", difficulty: "medium",
    question: "$\\displaystyle\\lim_{n\\to\\infty}\\int_0^{1/2}(x+x^3+\\cdots+x^{2n+1})\\,dx$의 값은?",
    options: [o("1","$\\ln 2\\sqrt{3}$"), o("2","$\\ln\\dfrac{5\\sqrt{3}}{3}$"), o("3","$\\ln\\dfrac{4\\sqrt{3}}{3}$"), o("4","$\\ln\\sqrt{3}$"), o("5","$\\ln\\dfrac{2\\sqrt{3}}{3}$")],
    answer: 5,
    explanation: "초항 $x$, 공비 $x^2$인 무한등비급수의 합 $\\dfrac{x}{1-x^2}$. $\\int_0^{1/2}\\dfrac{x}{1-x^2}dx=-\\tfrac{1}{2}\\ln(1-x^2)\\big|_0^{1/2}=-\\tfrac{1}{2}\\ln\\tfrac{3}{4}=\\tfrac{1}{2}\\ln\\tfrac{4}{3}=\\ln\\dfrac{2}{\\sqrt{3}}=\\ln\\dfrac{2\\sqrt{3}}{3}$."
  }),
  build({
    num: 17, subject: "다변수함수", unit: "편도함수", concept: "연쇄법칙(2계 편미분)", difficulty: "mediumHard",
    question: "함수 $f:\\mathbb{R}\\to\\mathbb{R}$과 $g:\\mathbb{R}^2\\to\\mathbb{R}$이 $f'(0)=1$, $\\dfrac{\\partial^2 g}{\\partial v\\,\\partial u}(e,0)=\\dfrac{1}{e}$을 만족시킨다. 이변수 함수 $h(x,y)=f\\!\\left(\\dfrac{y}{x}\\right)+g(e^x,\\sin y)$에 대하여 $\\dfrac{\\partial^2 h}{\\partial y\\,\\partial x}(1,0)$의 값은? (단, $f$와 $g(u,v)$의 이계편도함수가 존재한다.)",
    options: [o("1","$0$"), o("2","$\\dfrac{1}{e}$"), o("3","$\\dfrac{2}{e}$"), o("4","$1$"), o("5","$e$")],
    answer: 1,
    explanation: "(i) $f(y/x)$ 부분: $h_x=f'(y/x)\\!\\cdot\\!(-y/x^2)$, $h_{xy}=f''(y/x)\\!\\cdot\\!\\tfrac{1}{x}\\!\\cdot\\!(-y/x^2)+f'(y/x)(-1/x^2)$. $(1,0)$ 대입 시 $-f'(0)=-1$. (ii) $g(e^x,\\sin y)$ 부분: $h_x=g_u\\cdot e^x$, $h_{xy}=g_{uv}\\cos y\\cdot e^x$. $(1,0)$, $u=e$, $v=0$ 대입 시 $g_{uv}(e,0)\\cdot 1\\cdot e=\\tfrac{1}{e}\\cdot e=1$. 합 $-1+1=0$."
  }),
  build({
    num: 18, subject: "미분학", unit: "극한과 연속", concept: "극한의 진위 판정", difficulty: "medium",
    question: "$\\langle$보기$\\rangle$에서 옳은 것만을 있는 대로 고른 것은?\n\n$\\text{ㄱ. } \\displaystyle\\lim_{x\\to\\pi-}\\dfrac{\\cos x}{1-\\sin x}=0\\quad \\text{ㄴ. } \\lim_{x\\to 0}\\dfrac{\\tan x-x}{x^2}=0\\quad \\text{ㄷ. } \\lim_{x\\to 1+}\\!\\left(\\dfrac{1}{\\ln x}-\\dfrac{1}{x-1}\\right)=\\dfrac{1}{2}$",
    options: [o("1","ㄱ"), o("2","ㄴ"), o("3","ㄷ"), o("4","ㄱ, ㄴ"), o("5","ㄴ, ㄷ")],
    answer: 5,
    explanation: "ㄱ. $\\dfrac{\\cos\\pi}{1-\\sin\\pi}=\\dfrac{-1}{1}=-1\\ne 0$. **거짓**. ㄴ. $\\tan x-x=\\tfrac{x^3}{3}+O(x^5)$이므로 $/x^2\\to 0$. **참**. ㄷ. 통분 후 로피탈 두 번 적용 시 $\\tfrac{1}{2}$. **참**."
  }),
  build({
    num: 19, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "멱급수 합", difficulty: "medium",
    question: "함수 $f(x)=\\displaystyle\\int_0^x \\sin(\\pi t^2)\\,dt$의 매클로린(Maclaurin) 급수가 $\\displaystyle\\sum_{n=0}^{\\infty}a_n x^n$일 때, 급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n}{2^n}a_n$의 값은?",
    options: [o("1","$\\sqrt{2}$"), o("2","$\\dfrac{\\sqrt{2}}{2}$"), o("3","$\\dfrac{\\sqrt{2}}{3}$"), o("4","$\\dfrac{\\sqrt{2}}{4}$"), o("5","$\\dfrac{\\sqrt{2}}{5}$")],
    answer: 4,
    explanation: "$f'(x)=\\sin(\\pi x^2)=\\sum_{n=1}^{\\infty}a_n n x^{n-1}$. 양변에 $x$ 곱하기: $x\\sin(\\pi x^2)=\\sum a_n n x^n$. $x=\\tfrac{1}{2}$ 대입: $\\tfrac{1}{2}\\sin\\tfrac{\\pi}{4}=\\sum\\tfrac{n}{2^n}a_n$. $=\\tfrac{1}{2}\\cdot\\tfrac{\\sqrt{2}}{2}=\\dfrac{\\sqrt{2}}{4}$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "벡터함수", concept: "곡선의 길이와 곡률", difficulty: "medium",
    question: "곡선 $\\mathbf{r}(t)=\\langle a\\cos t,a\\sin t,2t\\rangle$의 단위 접선 벡터 $\\mathbf{T}(t)$가 $\\dfrac{1}{|\\mathbf{v}|}\\!\\left|\\dfrac{d\\mathbf{T}}{dt}\\right|=\\dfrac{1}{4}$을 만족시킬 때, $t=0$에서 $t=5$까지 곡선 $\\mathbf{r}(t)$의 길이는? (단, $a>0$이고 $\\mathbf{v}$는 $\\mathbf{r}$의 속도벡터를 나타낸다.)",
    options: [o("1","$5\\sqrt{5}$"), o("2","$10\\sqrt{2}$"), o("3","$5\\sqrt{13}$"), o("4","$10\\sqrt{5}$"), o("5","$10\\sqrt{13}$")],
    answer: 2,
    explanation: "$\\mathbf{r}'=\\langle -a\\sin t,a\\cos t,2\\rangle$, $|\\mathbf{v}|=\\sqrt{a^2+4}$. $\\mathbf{T}=\\tfrac{1}{\\sqrt{a^2+4}}\\langle -a\\sin t,a\\cos t,2\\rangle$, $|d\\mathbf{T}/dt|=\\tfrac{a}{\\sqrt{a^2+4}}$. 조건 → $\\tfrac{a}{a^2+4}=\\tfrac{1}{4}$ → $a^2-4a+4=0$ → $a=2$. 길이 $=\\int_0^5\\sqrt{4+4}\\,dt=10\\sqrt{2}$."
  }),
  build({
    num: 21, subject: "다변수함수", unit: "극좌표", concept: "극곡선 접선각", difficulty: "mediumHard",
    question: "좌표평면에서 $f(\\theta)=1+\\sin\\theta$에 대하여 $\\theta=\\dfrac{\\pi}{3}$일 때, 극곡선 $r=f(\\theta)$ 위의 점을 $P$라 하자. 점 $P$에서 극곡선 $r=f(\\theta)$에 접하는 직선이 $x$축과 만나는 점을 $Q$라 할 때, $\\angle OPQ$의 크기는? (단, $O$는 원점이다.)",
    options: [o("1","$\\dfrac{\\pi}{4}$"), o("2","$\\dfrac{\\pi}{3}$"), o("3","$\\dfrac{5}{12}\\pi$"), o("4","$\\dfrac{\\pi}{2}$"), o("5","$\\dfrac{7}{12}\\pi$")],
    answer: 3,
    explanation: "동경과 접선이 이루는 사잇각 $\\phi$는 $\\tan\\phi=\\dfrac{r}{r'}=\\dfrac{1+\\sin\\theta}{\\cos\\theta}\\Big|_{\\theta=\\pi/3}=\\dfrac{1+\\sqrt{3}/2}{1/2}=2+\\sqrt{3}$. $\\phi=\\tan^{-1}(2+\\sqrt{3})=\\tfrac{5\\pi}{12}$. 기하적으로 $\\angle OPQ=\\tfrac{\\pi}{3}+\\tfrac{\\pi}{12}=\\dfrac{5\\pi}{12}$."
  }),
  build({
    num: 22, subject: "선형대수", unit: "고유치와 대각화", concept: "고유벡터", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}-1 & -10 & 1\\\\ 2 & 7 & -1\\\\ 2 & 2 & 0\\end{pmatrix}$의 고윳값 $\\lambda$와 이에 대응하는 고유벡터 $\\langle a,b,c\\rangle$가 다음 조건을 만족시킬 때, $ab+bc+ca$의 값은?\n\n(가) $\\lambda$는 실수이다.\n(나) $a^2+b^2+c^2=1$",
    options: [o("1","$\\dfrac{2}{5}$"), o("2","$\\dfrac{4}{5}$"), o("3","$\\dfrac{6}{5}$"), o("4","$\\dfrac{8}{5}$"), o("5","$2$")],
    answer: 1,
    explanation: "특성다항식 $\\lambda^3-6\\lambda^2+13\\lambda-8=0$. 실근 $\\lambda=1$ (나머지는 허근). $A-I$의 영공간을 구하면 고유벡터 $\\propto (1,0,2)$. 정규화: $\\tfrac{1}{\\sqrt{5}}(1,0,2)$ 또는 부호 반대. $ab+bc+ca=\\tfrac{1}{5}(1\\cdot 0+0\\cdot 2+2\\cdot 1)=\\dfrac{2}{5}$."
  }),
  build({
    num: 23, subject: "적분학", unit: "이상적분", concept: "수렴/발산 판정", difficulty: "medium",
    question: "$\\langle$보기$\\rangle$에서 수렴하는 것만을 있는 대로 고른 것은?\n\n$\\text{ㄱ. }\\displaystyle\\int_{-2}^{2}\\dfrac{1}{x^2}dx\\quad \\text{ㄴ. }\\int_{0}^{1}\\dfrac{\\ln x}{\\sqrt{x}}dx\\quad \\text{ㄷ. }\\int_{1}^{\\infty}\\dfrac{1+e^{-x}}{x}dx\\quad \\text{ㄹ. }\\int_{0}^{\\infty}\\dfrac{e^x}{e^{2x}+4}dx$",
    options: [o("1","ㄱ, ㄴ"), o("2","ㄱ, ㄷ"), o("3","ㄴ, ㄷ"), o("4","ㄴ, ㄹ"), o("5","ㄷ, ㄹ")],
    answer: 4,
    explanation: "ㄱ. $x=0$에서 특이점, $\\int 1/x^2$는 발산. ㄴ. $\\int_0^1 x^{-1/2}\\ln x\\,dx$는 $p=-1/2>-1$이므로 수렴. ㄷ. 비교판정: $\\sim 1/x$이므로 발산. ㄹ. $u=e^x$ 치환하면 $\\int_1^{\\infty}\\tfrac{1}{u^2+4}du$ 수렴. 답: ㄴ, ㄹ."
  }),
  build({
    num: 24, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "라그랑주 승수법", difficulty: "medium",
    question: "타원판 $\\{(x,y)\\mid x^2+4y^2\\le 8\\}$ 위에서 함수 $f(x,y)=x^2+2xy+4y^2$의 최댓값은?",
    options: [o("1","$10$"), o("2","$12$"), o("3","$14$"), o("4","$16$"), o("5","$18$")],
    answer: 2,
    explanation: "$Y=2y$로 치환하면 영역 $x^2+Y^2\\le 8$ 위에서 $g(x,Y)=x^2+xY+Y^2$의 최댓값. 이차형식 행렬 $\\begin{pmatrix}1 & 1/2\\\\1/2 & 1\\end{pmatrix}$의 고윳값 $\\tfrac{3}{2},\\tfrac{1}{2}$. 경계 $x^2+Y^2=8$에서 최댓값 $=\\tfrac{3}{2}\\cdot 8=12$. 내부 임계점은 $(0,0)$, $f=0$. 따라서 최댓값 $12$."
  }),
  build({
    num: 25, subject: "다변수함수", unit: "중적분", concept: "극좌표 변환", difficulty: "medium",
    question: "$x\\ge 0$에서 정의된 함수 $f(x)=\\begin{cases}x & (0\\le x\\le 1)\\\\ 0 & (1<x)\\end{cases}$에 대하여 영역 $D=\\{(x,y)\\mid x\\ge 0\\}$에서의 중적분 $\\displaystyle\\iint_D f(x)f(x^2+y^2)\\,dA$의 값은?",
    options: [o("1","$\\dfrac{1}{5}$"), o("2","$\\dfrac{3}{10}$"), o("3","$\\dfrac{2}{5}$"), o("4","$\\dfrac{1}{2}$"), o("5","$\\dfrac{3}{5}$")],
    answer: 3,
    explanation: "$f(x^2+y^2)$이 0이 아니려면 $x^2+y^2\\le 1$. 또한 $f(x)=x$ ($0\\le x\\le 1$, 그밖엔 0)이므로 적분 영역은 반원 $D^*=\\{x\\ge 0,\\,x^2+y^2\\le 1\\}$. 극좌표: $\\int_{-\\pi/2}^{\\pi/2}\\!\\!\\int_0^1 (r\\cos\\theta)(r^2)r\\,dr\\,d\\theta=\\int_{-\\pi/2}^{\\pi/2}\\cos\\theta\\,d\\theta\\cdot\\int_0^1 r^4 dr=2\\cdot\\tfrac{1}{5}=\\dfrac{2}{5}$."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) {
  console.error("Insert failed:", error);
  process.exit(1);
}
console.log("Inserted:");
for (const row of data ?? []) {
  console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
}
