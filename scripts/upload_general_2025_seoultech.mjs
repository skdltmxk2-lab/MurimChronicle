// Upload 2025년도 서울과기대 편입수학 기출 20문항 (5지선다)
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

const SCHOOL = "서울과기대";
const YEAR = "2025";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });

function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-seoultech-${String(num).padStart(2, "0")}`;
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
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "e의 정의", difficulty: "easyMedium",
    question: "다음 중 옳은 식의 개수는?\n\n$\\text{ㄱ. }\\displaystyle\\lim_{h\\to 0}\\dfrac{e^h-1}{h}=1$\\quad $\\text{ㄴ. }e=\\lim_{n\\to\\infty}\\!\\left(1+\\dfrac{1}{n}\\right)^{\\!n}$\\quad $\\text{ㄷ. }e=\\lim_{n\\to\\infty}\\!\\left(1-\\dfrac{1}{n}\\right)^{\\!-n}$\\quad $\\text{ㄹ. }e=\\lim_{x\\to 1}x^{\\frac{1}{x-1}}$\\quad $\\text{ㅁ. }e=\\lim_{x\\to 0}(1+x)^{1/x}$\\quad $\\text{ㅂ. }e=\\sum_{k=0}^{\\infty}\\dfrac{1}{k!}$",
    options: [o("1","$2$"), o("2","$3$"), o("3","$4$"), o("4","$5$"), o("5","$6$")],
    answer: 5,
    explanation: "ㄱ. 로피탈로 $1$. **참**. ㄴ,ㄷ,ㅁ. $e$의 정의. **참**. ㄹ. $e^{\\ln x/(x-1)}$, $x\\to 1$에서 $\\ln x/(x-1)\\to 1$이므로 $e$. **참**. ㅂ. Maclaurin급수. **참**. 모두 참 → 6개."
  }),
  build({
    num: 2, subject: "미분학", unit: "도함수의 응용", concept: "관련 변화율", difficulty: "medium",
    question: "가로등이 $6\\,\\mathrm{m}$ 높이의 기둥의 꼭대기에 고정되어 있다. 키가 $2\\,\\mathrm{m}$인 사람이 기둥으로부터 반듯한 길을 따라 $1.5\\,\\mathrm{m/s}$의 속력으로 기둥에서 멀어져간다고 하자. 사람이 기둥에서 $10\\,\\mathrm{m}$ 떨어질 때, 그림자의 길이를 $a\\,\\mathrm{m}$, 기둥으로부터 그림자의 끝까지의 거리의 변화율을 $b\\,\\mathrm{m/s}$, 그림자의 길이의 변화율을 $c\\,\\mathrm{m/s}$라고 할 때, $a+b+c$의 값은?",
    options: [o("1","$6.5$"), o("2","$7.25$"), o("3","$8$"), o("4","$8.25$"), o("5","$8.75$")],
    answer: 3,
    explanation: "닮음: $\\dfrac{2}{y}=\\dfrac{6}{x}$ → $x=3y$. 또한 $x=y+z$, $\\tfrac{dz}{dt}=1.5$. $z=10$일 때 $y=5$, $a=5$. 미분: $\\tfrac{dx}{dt}=\\tfrac{dy}{dt}+1.5$이고 $\\tfrac{dx}{dt}=3\\tfrac{dy}{dt}$. 풀면 $\\tfrac{dy}{dt}=\\tfrac{3}{4}$, $\\tfrac{dx}{dt}=\\tfrac{9}{4}$. $a+b+c=5+\\tfrac{9}{4}+\\tfrac{3}{4}=8$."
  }),
  build({
    num: 3, subject: "적분학", unit: "정적분의 응용", concept: "Pappus 정리", difficulty: "medium",
    question: "곡선 $y=\\sin x,\\,y=\\cos x$와 직선 $x=0,\\,x=\\dfrac{\\pi}{2}$로 둘러싸인 영역을 $y$축으로 회전하여 생기는 입체의 부피는?",
    options: [o("1","$\\pi(\\sqrt{2}-1)$"), o("2","$\\pi\\!\\left(1-\\dfrac{1}{\\sqrt{2}}\\right)$"), o("3","$\\pi^2(\\sqrt{2}-1)$"), o("4","$\\pi^2\\!\\left(1-\\dfrac{1}{\\sqrt{2}}\\right)$"), o("5","$\\pi(\\sqrt{2}\\pi-4)$")],
    answer: 3,
    explanation: "$y=\\sin x,\\,y=\\cos x$는 $x=\\tfrac{\\pi}{4}$에서 선대칭이라 영역의 무게중심 $\\bar x=\\tfrac{\\pi}{4}$. 영역 넓이 $S=2\\!\\int_0^{\\pi/4}(\\cos x-\\sin x)dx=2(\\sqrt 2-1)$. Pappus 정리: $V=2\\pi\\cdot\\bar x\\cdot S=2\\pi\\cdot\\tfrac{\\pi}{4}\\cdot 2(\\sqrt 2-1)=\\pi^2(\\sqrt 2-1)$."
  }),
  build({
    num: 4, subject: "다변수함수", unit: "중적분", concept: "질량중심", difficulty: "medium",
    question: "직선 $y=x$와 포물선 $y=x^2$에 의해 둘러싸인 영역의 밀도가 일정하다고 하자. 이 영역의 질량 중심 좌표를 $(a,b)$라고 할 때, $a+b$의 값은?",
    options: [o("1","$\\dfrac{7}{10}$"), o("2","$\\dfrac{9}{10}$"), o("3","$\\dfrac{11}{10}$"), o("4","$\\dfrac{13}{10}$"), o("5","$\\dfrac{15}{10}$")],
    answer: 2,
    explanation: "영역 $D=\\{0\\le x\\le 1,\\,x^2\\le y\\le x\\}$, 면적 $\\int_0^1(x-x^2)dx=\\tfrac{1}{6}$. $\\bar x=6\\!\\int_0^1\\!\\!\\int_{x^2}^{x}x\\,dy\\,dx=6\\!\\int_0^1 x(x-x^2)dx=\\tfrac{1}{2}$. $\\bar y=6\\!\\int_0^1\\!\\!\\int_{x^2}^{x}y\\,dy\\,dx=3\\!\\int_0^1(x^2-x^4)dx=\\tfrac{2}{5}$. $a+b=\\dfrac{9}{10}$."
  }),
  build({
    num: 5, subject: "적분학", unit: "급수", concept: "수렴 판정", difficulty: "medium",
    question: "다음 두 급수를 모두 수렴하게 하는 자연수 $k$의 개수는?\n\n$\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{1}{n^{k-1}}\\,, \\quad \\sum_{n=1}^{\\infty}\\dfrac{k^n}{4^n n^2}$",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$"), o("5","$4$")],
    answer: 3,
    explanation: "$\\sum 1/n^{k-1}$ 수렴 ⇔ $k-1>1$ ⇔ $k>2$. $\\sum (k/4)^n/n^2$ 수렴 ⇔ $|k|\\le 4$ ($k=4$일 때 $\\sum 1/n^2$ 수렴). 두 조건 교집합 $2<k\\le 4$이므로 자연수 $k=3,4$ → 2개."
  }),
  build({
    num: 6, subject: "다변수함수", unit: "벡터함수", concept: "곡선의 속력", difficulty: "medium",
    question: "곡선 $x=2\\cos t+\\sin 2t$, $y=2\\sin t+\\cos 2t$를 따라 움직이는 물체의 속력이 $0$이 되는 모든 $t$값의 합은? (단, $0\\le t\\le\\pi$)",
    options: [o("1","$\\dfrac{\\pi}{6}$"), o("2","$\\dfrac{5}{6}\\pi$"), o("3","$\\dfrac{\\pi}{2}$"), o("4","$\\pi$"), o("5","$2\\pi$")],
    answer: 4,
    explanation: "$|\\mathbf{v}|^2=(\\dfrac{dx}{dt})^2+(\\dfrac{dy}{dt})^2=8-8\\sin 3t$. 속력 $=0$ ⇔ $\\sin 3t=1$. $0\\le 3t\\le 3\\pi$에서 $3t=\\tfrac{\\pi}{2},\\tfrac{5\\pi}{2}$ → $t=\\tfrac{\\pi}{6},\\tfrac{5\\pi}{6}$. 합 $=\\pi$."
  }),
  build({
    num: 7, subject: "다변수함수", unit: "벡터", concept: "점-평면 거리", difficulty: "easyMedium",
    question: "점 $(2,1,-10)$으로부터 세 점 $P(1,2,2),Q(4,1,-2),R(-2,-2,-4)$을 지나는 평면까지의 거리는?",
    options: [o("1","$4$"), o("2","$5$"), o("3","$6$"), o("4","$7$"), o("5","$8$")],
    answer: 1,
    explanation: "$\\vec{PQ}=(3,-1,-4),\\vec{PR}=(-3,-4,-6)$, $\\vec{PQ}\\times\\vec{PR}=(-10,30,-15)\\parallel(2,-6,3)$. 평면 $2x-6y+3z=-4$. 거리 $=\\dfrac{|2(2)-6(1)+3(-10)+4|}{\\sqrt{4+36+9}}=\\dfrac{|-28|}{7}=4$."
  }),
  build({
    num: 8, subject: "공학수학", unit: "미분방정식", concept: "운동방정식", difficulty: "medium",
    question: "지면으로부터 높이가 $10\\,\\mathrm{m}$인 지점에서 수평선과 $\\dfrac{\\pi}{3}$의 각도를 이루고 초기속력 $40\\,\\mathrm{m/s}$로 발사된 발사체가 있다. 발사체에 작용하는 힘은 중력뿐이라고 할 때, 발사체가 지면으로부터 가장 높이 올라갔을 때의 높이는? (단, 중력가속도 $g=10\\,\\mathrm{m/s^2}$)",
    options: [o("1","$50\\,\\mathrm{m}$"), o("2","$55\\,\\mathrm{m}$"), o("3","$60\\,\\mathrm{m}$"), o("4","$65\\,\\mathrm{m}$"), o("5","$70\\,\\mathrm{m}$")],
    answer: 5,
    explanation: "수직 초기속력 $v_0\\sin(\\pi/3)=20\\sqrt 3$. 최고점에서 $v=0$, $t=\\tfrac{20\\sqrt 3}{10}=2\\sqrt 3$. $H=h_0+\\dfrac{(v_0\\sin\\theta)^2}{2g}=10+\\dfrac{(20\\sqrt 3)^2}{20}=10+60=70\\,\\mathrm{m}$."
  }),
  build({
    num: 9, subject: "공학수학", unit: "확률과 통계", concept: "결합밀도함수의 기댓값", difficulty: "medium",
    question: "연속확률변수 $X,Y$의 결합 밀도함수가 $f(X=x,Y=y)=\\begin{cases}Ce^{x^2+y^2}, & x^2+y^2\\le 1\\\\ 0, & x^2+y^2>1\\end{cases}$일 때, $X^2+Y^2$의 기댓값 $E[X^2+Y^2]$의 값은? (단, $C$는 상수)",
    options: [o("1","$\\dfrac{1}{e}$"), o("2","$\\dfrac{1}{e+1}$"), o("3","$\\dfrac{\\pi}{2e}$"), o("4","$\\dfrac{1}{e-1}$"), o("5","$\\dfrac{e}{\\pi}$")],
    answer: 4,
    explanation: "정규화: $C\\!\\int_0^{2\\pi}\\!\\!\\int_0^1 r e^{r^2}dr\\,d\\theta=C\\pi(e-1)=1$ → $C=\\dfrac{1}{\\pi(e-1)}$. $E[X^2+Y^2]=\\dfrac{1}{\\pi(e-1)}\\!\\int_0^{2\\pi}\\!\\!\\int_0^1 r^3 e^{r^2}dr\\,d\\theta$. $\\int_0^1 r^3 e^{r^2}dr$: $u=r^2$ → $\\tfrac{1}{2}\\!\\int_0^1 u e^u du=\\tfrac{1}{2}$. 따라서 $E=\\dfrac{1}{\\pi(e-1)}\\cdot 2\\pi\\cdot\\tfrac{1}{2}=\\dfrac{1}{e-1}$. (note: $\\int u e^u=ue^u-e^u\\big|_0^1=1$, /2 = 1/2). 정확한 $E$ 계산 결과 $\\dfrac{1}{e-1}$."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "선적분과 면적분", concept: "그린정리", difficulty: "medium",
    question: "삼각형의 세 꼭짓점 $(0,0),(1,1),(0,1)$을 순서대로 잇는 닫힌 경로 $C$에 대하여 다음 선적분의 값은?\n\n$\\displaystyle\\int_C x^2\\tanh^{-1}(x)\\,dx+x\\sin(y^2)\\,dy$",
    options: [o("1","$1-\\cos(1)$"), o("2","$\\sin^2\\!\\left(\\dfrac{1}{2}\\right)$"), o("3","$1+\\cos(1)$"), o("4","$\\cos^2\\!\\left(\\dfrac{1}{2}\\right)$"), o("5","다른 보기 중에는 답 없음")],
    answer: 2,
    explanation: "그린정리: $\\oint_C P\\,dx+Q\\,dy=\\iint_D(Q_x-P_y)dA=\\iint_D \\sin(y^2)dA$. 영역 $D=\\{0\\le x\\le y\\le 1\\}$. $\\int_0^1\\!\\!\\int_0^y \\sin(y^2)dx\\,dy=\\int_0^1 y\\sin(y^2)dy=\\tfrac{1}{2}(1-\\cos 1)=\\sin^2\\!\\left(\\tfrac{1}{2}\\right)$."
  }),
  build({
    num: 11, subject: "다변수함수", unit: "선적분과 면적분", concept: "발산정리", difficulty: "mediumHard",
    question: "곡면 $S$가 $z=8-x^2-2y^2$의 그래프 중 $z\\ge 0$인 부분일 때, 벡터장 $\\vec{F}=\\langle x,y,z+1\\rangle$에 대하여 유량적분 $\\displaystyle\\iint_S \\vec{F}\\cdot d\\vec{S}$의 값은?",
    options: [o("1","$52\\sqrt{2}\\pi$"), o("2","$48\\sqrt{2}\\pi$"), o("3","$44\\sqrt{2}\\pi$"), o("4","$11\\sqrt{2}\\pi$"), o("5","다른 보기 중에는 답 없음")],
    answer: 1,
    explanation: "밑면 $S_2:z=0$ 추가 후 발산정리. $\\nabla\\cdot\\vec F=3$. $E$의 부피: $z=8-x^2-2y^2\\ge 0$ ⇔ $x^2+2y^2\\le 8$. $V=\\iint 3(8-x^2-2y^2)dA$, $y=Y/\\sqrt 2$ 치환 후 원기둥 부피의 $1/2$에 $\\tfrac{3}{\\sqrt 2}$ 곱: $V=48\\sqrt 2\\pi$. 밑면 적분: $S_2$ 하향단위벡터로 $\\iint(0,0,-1)\\cdot(x,y,1)dA=-\\iint dA=-\\pi\\cdot 8/\\sqrt 2=-4\\sqrt 2\\pi$. 따라서 $S_1$ 적분 $=48\\sqrt 2\\pi-(-4\\sqrt 2\\pi)=52\\sqrt 2\\pi$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "선적분과 면적분", concept: "보존벡터장", difficulty: "medium",
    question: "다음 중 보존적 벡터장의 개수는?\n\n$\\text{ㄱ. }\\langle x,y,z\\rangle\\quad \\text{ㄴ. }\\langle\\sin y\\cos z,x\\cos y\\cos z,-x\\sin y\\sin z\\rangle\\quad \\text{ㄷ. }\\langle 2e^{x^2}x^2 y+e^{x^2}y,e^{x^2}\\rangle\\quad \\text{ㄹ. }\\!\\left\\langle\\dfrac{y^2}{x^2+1},2y\\tan^{-1}x\\right\\rangle$",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$"), o("5","$4$")],
    answer: 4,
    explanation: "ㄱ. $\\nabla\\!\\left(\\tfrac{1}{2}(x^2+y^2+z^2)\\right)$ 보존. ㄴ. $\\nabla(x\\sin y\\cos z)$ 보존. ㄷ. $P_y=2e^{x^2}x^2+e^{x^2}\\ne Q_x=2xe^{x^2}$. **비보존**. ㄹ. $P_y=\\tfrac{2y}{x^2+1}=Q_x$. 보존. 보존 3개."
  }),
  build({
    num: 13, subject: "공학수학", unit: "미분방정식", concept: "1계 선형 ODE", difficulty: "medium",
    question: "미분방정식 $(x-3)(x-5)\\dfrac{dy}{dx}-(x-4)y=0$, $3<x<5$, $y\\!\\left(\\dfrac{9}{2}\\right)=\\dfrac{\\sqrt{3}}{2}$에 대하여, $y(4)$의 값은?",
    options: [o("1","$1$"), o("2","$i$"), o("3","$0$"), o("4","$-1$"), o("5","$-i$")],
    answer: 1,
    explanation: "$y'-\\dfrac{x-4}{(x-3)(x-5)}y=0$. 부분분수: $\\dfrac{x-4}{(x-3)(x-5)}=\\dfrac{1/2}{x-3}+\\dfrac{1/2}{x-5}$. $y=Ce^{\\tfrac{1}{2}(\\ln|x-3|+\\ln|x-5|)}=C\\sqrt{|x-3||x-5|}$. $x=\\tfrac{9}{2}$: $y=C\\sqrt{\\tfrac{3}{2}\\cdot\\tfrac{1}{2}}=C\\tfrac{\\sqrt 3}{2}=\\tfrac{\\sqrt 3}{2}$ → $C=1$. $y(4)=\\sqrt{1\\cdot 1}=1$."
  }),
  build({
    num: 14, subject: "공학수학", unit: "미분방정식", concept: "2계 동차 ODE(허근)", difficulty: "medium",
    question: "미분방정식 $y''-8y'+18y=0,\\,y(0)=1,\\,y\\!\\left(\\dfrac{\\sqrt{2}}{4}\\pi\\right)=0$에 대하여 $y\\!\\left(\\dfrac{3\\sqrt{2}}{4}\\pi\\right)$의 값은?",
    options: [o("1","$1$"), o("2","$\\dfrac{1}{2}$"), o("3","$0$"), o("4","$-1$"), o("5","$-\\dfrac{1}{2}$")],
    answer: 3,
    explanation: "특성방정식 $r^2-8r+18=0$, $r=4\\pm\\sqrt{2}i$. 일반해 $y=e^{4x}(c_1\\cos\\sqrt 2 x+c_2\\sin\\sqrt 2 x)$. $y(0)=c_1=1$. $y(\\tfrac{\\sqrt 2\\pi}{4})=e^{\\sqrt 2\\pi}(\\cos\\tfrac{\\pi}{2}+c_2\\sin\\tfrac{\\pi}{2})=c_2 e^{\\sqrt 2\\pi}=0$ → $c_2=0$. $y=e^{4x}\\cos(\\sqrt 2 x)$. $y(\\tfrac{3\\sqrt 2\\pi}{4})=e^{3\\sqrt 2\\pi}\\cos\\tfrac{3\\pi}{2}=0$."
  }),
  build({
    num: 15, subject: "공학수학", unit: "미분방정식", concept: "라플라스 변환(단계함수)", difficulty: "medium",
    question: "연속함수 $y(x)$ $(x\\ge 0)$가 다음 미분방정식을 만족한다.\n\n$\\dfrac{dy}{dx}+2y=\\begin{cases}1, & 0<x<1\\\\ 0, & x>1\\end{cases},\\quad y(0)=0$\n\n일 때, $y(2)$의 값은?",
    options: [o("1","$\\dfrac{1}{2}(e^{-5}-e^{-7})$"), o("2","$\\dfrac{1}{2}(e^{-4}-e^{-6})$"), o("3","$\\dfrac{1}{2}(e^{-3}-e^{-5})$"), o("4","$\\dfrac{1}{2}(e^{-2}-e^{-4})$"), o("5","$\\dfrac{1}{2}(e^{-1}-e^{-3})$")],
    answer: 4,
    explanation: "라플라스: $sY+2Y=\\tfrac{1-e^{-s}}{s}$ → $Y=\\tfrac{1}{s(s+2)}-\\tfrac{e^{-s}}{s(s+2)}$. 부분분수 $\\tfrac{1}{s(s+2)}=\\tfrac{1}{2}(\\tfrac{1}{s}-\\tfrac{1}{s+2})$. 역변환: $y=\\tfrac{1}{2}(1-e^{-2x})-\\tfrac{1}{2}(1-e^{-2(x-1)})u(x-1)$. $x=2$: $\\tfrac{1}{2}(1-e^{-4})-\\tfrac{1}{2}(1-e^{-2})=\\tfrac{1}{2}(e^{-2}-e^{-4})$."
  }),
  build({
    num: 16, subject: "공학수학", unit: "미분방정식", concept: "1계 선형 ODE", difficulty: "medium",
    question: "미분방정식 $x\\dfrac{dy}{dx}=3xe^x-y+6x^2$, $y(1)=5$에 대하여, $\\displaystyle\\lim_{x\\to 0}y(x)$의 값은?",
    options: [o("1","$1$"), o("2","$\\dfrac{1}{3}$"), o("3","$0$"), o("4","$-1$"), o("5","$-\\dfrac{1}{3}$")],
    answer: 3,
    explanation: "$xy'+y=3xe^x+6x^2$ 좌변은 $(xy)'$. 적분: $xy=\\int(3xe^x+6x^2)dx=(3x-3)e^x+2x^3+C$. $y(1)=5$: $5=0+2+C$ → $C=3$. $y=\\dfrac{(3x-3)e^x+2x^3+3}{x}$. $x\\to 0$ 분자 $\\to -3+0+3=0$, 0/0이지만 분자 전개 시 $-3e^x+3xe^x+2x^3+3=3(1-e^x)+3xe^x+2x^3$. $1-e^x\\sim -x$이므로 분자 $\\sim 3(-x)+3x+0=0$ — 더 정밀: $1-e^x=-x-x^2/2-\\cdots$, 분자 $\\sim -3x-3x^2/2+3x+3x^2+0=3x^2/2$, $/x\\to 0$. 답 $0$."
  }),
  build({
    num: 17, subject: "선형대수", unit: "행렬", concept: "행렬식 계산", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}1 & 0 & 1 & 0 & 0\\\\ 0 & 2 & 2 & 0 & 0\\\\ 1 & 1 & 3 & 0 & 0\\\\ 0 & 0 & 0 & 1 & 1\\\\ 0 & 0 & 0 & 1 & 2\\end{pmatrix}$의 행렬식은?",
    options: [o("1","$0$"), o("2","$2$"), o("3","$3$"), o("4","$6$"), o("5","$10$")],
    answer: 2,
    explanation: "블록 대각: $|A|=\\det\\!\\begin{pmatrix}1&0&1\\\\0&2&2\\\\1&1&3\\end{pmatrix}\\cdot\\det\\!\\begin{pmatrix}1&1\\\\1&2\\end{pmatrix}$. 첫 블록 행렬식: 첫 열 전개 $=1\\cdot(6-2)-0+1\\cdot(0-2)=4-2=2$. 둘째 $=2-1=1$. 곱 $=2$."
  }),
  build({
    num: 18, subject: "선형대수", unit: "고유치와 대각화", concept: "고유벡터 분해", difficulty: "medium",
    question: "행렬 $A$의 고유값 $\\lambda_i$와 이에 대응하는 고유벡터 $v_i$가 각각 $\\lambda_1=1,\\,\\lambda_2=2,\\,\\lambda_3=3$, $v_1=\\begin{pmatrix}1\\\\0\\\\0\\end{pmatrix}$, $v_2=\\begin{pmatrix}1\\\\-1\\\\0\\end{pmatrix}$, $v_3=\\begin{pmatrix}0\\\\-1\\\\1\\end{pmatrix}$일 때, 행렬 $A\\!\\begin{pmatrix}1\\\\1\\\\1\\end{pmatrix}$의 모든 성분의 합은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$"), o("5","$4$")],
    answer: 4,
    explanation: "$\\binom{1}{1}{1}=av_1+bv_2+cv_3$: $a+b=1,\\,-b-c=1,\\,c=1$ → $c=1,b=-2,a=3$. $A\\binom{1}{1}{1}=3v_1-2(2)v_2+(3)v_3=3(1,0,0)-4(1,-1,0)+3(0,-1,1)=(-1,1,3)$. 성분합 $=-1+1+3=3$."
  }),
  build({
    num: 19, subject: "선형대수", unit: "고유치와 대각화", concept: "직교행렬 조건", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}\\dfrac{1}{2} & \\dfrac{1}{2} & \\dfrac{1}{2} & a\\\\ \\dfrac{1}{2} & b & \\dfrac{1}{2} & -\\dfrac{1}{2}\\\\ \\dfrac{1}{2} & \\dfrac{1}{2} & c & -\\dfrac{1}{2}\\\\ d & -\\dfrac{1}{2} & -\\dfrac{1}{2} & \\dfrac{1}{2}\\end{pmatrix}$가 직교행렬일 때, $a+b+c+d$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$-1$"), o("5","$-2$")],
    answer: 1,
    explanation: "직교행렬은 행끼리 내적 0. ① 1,4행 내적: $\\tfrac{1}{2}d-\\tfrac{1}{4}-\\tfrac{1}{4}+\\tfrac{1}{2}a=0$ → $a+d=1$. ② 2,3행 내적: $\\tfrac{1}{4}+\\tfrac{1}{2}b+\\tfrac{1}{2}c+\\tfrac{1}{4}=0$ → $b+c=-1$. 합 $=0$."
  }),
  build({
    num: 20, subject: "선형대수", unit: "행렬", concept: "행렬식 성질 진위", difficulty: "easyMedium",
    question: "다음 중 참인 명제의 개수는?\n\n$\\text{ㄱ. } n\\times n$ 행렬 $A$의 두 행을 교환하여 얻은 행렬을 $B$라고 하면 $\\det A=-\\det B$이다.\n$\\text{ㄴ. } n\\times n$ 행렬 $A$의 한 행에 스칼라 $k$를 곱하여 얻은 행렬을 $B$라고 하면 $\\det A=k\\det B$이다.\n$\\text{ㄷ. } n\\times n$ 행렬 $A$의 한 행에 다른 행의 스칼라배를 더하여 얻은 행렬을 $B$라고 하면 $\\det A=\\det B$이다.\n$\\text{ㄹ. } n\\times n$ 행렬 $A$의 $\\mathrm{rank}\\,A$가 $n$보다 작으면 $\\det A=0$이다.",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$"), o("5","$4$")],
    answer: 4,
    explanation: "ㄱ. **참**(행 교환 시 부호 반전). ㄴ. $\\det B=k\\det A$이므로 $\\det A=\\tfrac{1}{k}\\det B$. **거짓**. ㄷ. **참**(행 연산 불변). ㄹ. **참**(rank<n ⇔ det=0). 참 3개."
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
