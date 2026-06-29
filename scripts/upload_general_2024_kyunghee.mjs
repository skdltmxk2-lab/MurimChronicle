// Upload 2024년도 경희대 편입수학 기출 30문항 (5지 선다형, 90분)
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

const SCHOOL = "경희대";
const YEAR = "2024";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-kyunghee-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "도함수", concept: "음함수 2계 미분", difficulty: "mediumHard",
    question: "음함수 $x^3+xy+2y^3=4$의 $y''(1)$은?",
    options: [
      o("1","$-\\dfrac{430}{343}$"),
      o("2","$-\\dfrac{428}{343}$"),
      o("3","$-\\dfrac{426}{343}$"),
      o("4","$-\\dfrac{424}{343}$"),
      o("5","$-\\dfrac{422}{343}$")
    ],
    answer: 1,
    explanation: "$x=1$ 대입: $1+y+2y^3=4$ ⇒ $y=1$.\n$f_x=3x^2+y,\\,f_y=x+6y^2,\\,f_{xx}=6x,\\,f_{yy}=12y,\\,f_{xy}=1$.\n$(1,1)$에서: $f_x=4,f_y=7,f_{xx}=6,f_{yy}=12,f_{xy}=1$.\n$y''=-\\dfrac{f_{xx}(f_y)^2-2f_x f_y f_{xy}+f_{yy}(f_x)^2}{(f_y)^3}=-\\dfrac{6\\cdot 49-56+12\\cdot 16}{343}=-\\dfrac{430}{343}$."
  }),
  build({
    num: 2, subject: "공학수학", unit: "수치해석", concept: "뉴턴 방법", difficulty: "medium",
    question: "뉴턴의 방법으로 방정식 $x^4-x-1=0$의 근의 근삿값을 구할 때 $x_1=2$이면 $x_2$는?",
    options: [o("1","$\\dfrac{45}{31}$"), o("2","$\\dfrac{46}{31}$"), o("3","$\\dfrac{47}{31}$"), o("4","$\\dfrac{48}{31}$"), o("5","$\\dfrac{49}{31}$")],
    answer: 5,
    explanation: "$f(x)=x^4-x-1$, $f'(x)=4x^3-1$.\n$f(2)=13,\\,f'(2)=31$. $x_2=2-\\dfrac{13}{31}=\\dfrac{49}{31}$."
  }),
  build({
    num: 3, subject: "적분학", unit: "정적분", concept: "쉘 회전체 부피", difficulty: "medium",
    question: "두 곡선 $y=x^2,\\,y=9x-2x^2$으로 둘러싸인 영역을 $y$축 중심으로 회전하여 만든 입체의 부피는?",
    options: [
      o("1","$\\dfrac{27\\pi}{2}$"),
      o("2","$\\dfrac{29\\pi}{2}$"),
      o("3","$\\dfrac{81\\pi}{2}$"),
      o("4","$\\dfrac{83\\pi}{2}$"),
      o("5","$\\dfrac{85\\pi}{2}$")
    ],
    answer: 3,
    explanation: "교점: $x^2=9x-2x^2$ ⇒ $3x^2=9x$ ⇒ $x=0,3$.\n쉘: $V=2\\pi\\!\\int_0^3 x[(9x-2x^2)-x^2]dx=2\\pi\\!\\int_0^3(9x^2-3x^3)dx=2\\pi(81-\\tfrac{243}{4})=\\dfrac{81\\pi}{2}$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분", concept: "역삼각함수 미분 응용", difficulty: "easy",
    question: "적분 $\\!\\displaystyle\\int_0^{\\pi/2}\\dfrac{\\cos x}{1+\\sin^2 x}dx$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{6}$"), o("2","$2-\\dfrac{\\pi}{3}$"), o("3","$2-\\dfrac{\\pi}{4}$"), o("4","$\\dfrac{\\pi}{3}$"), o("5","$\\dfrac{\\pi}{4}$")],
    answer: 5,
    explanation: "$\\sin x=t$ 치환: $\\!\\int_0^1\\dfrac{1}{1+t^2}dt=[\\tan^{-1}t]_0^1=\\dfrac{\\pi}{4}$."
  }),
  build({
    num: 5, subject: "미분학", unit: "도함수", concept: "역쌍곡함수·연쇄법칙", difficulty: "medium",
    question: "$f(x)=\\sinh^{-1}(2\\tan x)$의 $f'\\!\\left(\\dfrac{\\pi}{3}\\right)$는?",
    options: [o("1","$\\dfrac{6}{\\sqrt{13}}$"), o("2","$\\dfrac{7}{\\sqrt{13}}$"), o("3","$\\dfrac{8}{\\sqrt{13}}$"), o("4","$\\dfrac{9}{\\sqrt{13}}$"), o("5","$\\dfrac{10}{\\sqrt{13}}$")],
    answer: 3,
    explanation: "$f'(x)=\\dfrac{2\\sec^2 x}{\\sqrt{1+4\\tan^2 x}}$. $x=\\pi/3$: $\\tan=\\sqrt 3,\\sec^2=4$.\n$f'(\\pi/3)=\\dfrac{8}{\\sqrt{13}}$."
  }),
  build({
    num: 6, subject: "적분학", unit: "정적분", concept: "부분분수 적분", difficulty: "medium",
    question: "적분 $\\!\\displaystyle\\int_1^2\\dfrac{1+2x^2}{x(1+x^2)^2}dx$의 값은?",
    options: [
      o("1","$\\dfrac{3}{20}+\\dfrac{1}{2}\\ln\\dfrac{3}{5}$"),
      o("2","$\\dfrac{3}{20}+\\dfrac{1}{2}\\ln\\dfrac{4}{5}$"),
      o("3","$\\dfrac{3}{20}+\\dfrac{1}{2}\\ln\\dfrac{6}{5}$"),
      o("4","$\\dfrac{3}{20}+\\dfrac{1}{2}\\ln\\dfrac{7}{5}$"),
      o("5","$\\dfrac{3}{20}+\\dfrac{1}{2}\\ln\\dfrac{8}{5}$")
    ],
    answer: 5,
    explanation: "$x^2=t$ 치환: $\\dfrac{1}{2}\\!\\int_1^4\\dfrac{1+2t}{t(1+t)^2}dt$. 부분분수: $\\dfrac{1}{t}-\\dfrac{1}{1+t}+\\dfrac{1}{(1+t)^2}$.\n적분 후 $\\dfrac{1}{2}\\!\\left(\\ln\\dfrac{8}{5}+\\dfrac{3}{10}\\right)=\\dfrac{3}{20}+\\dfrac{1}{2}\\ln\\dfrac{8}{5}$."
  }),
  build({
    num: 7, subject: "적분학", unit: "이상적분", concept: "수렴 조건·로그 적분", difficulty: "mediumHard",
    question: "적분 $I=\\!\\displaystyle\\int_0^{\\infty}\\!\\left(\\dfrac{1}{\\sqrt{x^2+9}}-\\dfrac{a}{x+1}\\right)dx$를 수렴하게 하는 실수 $a$와 그 적분값이 $aI=b\\ln\\dfrac{c}{d}$를 만족할 때 $a+b+c-d$는? (단, $b,c,d$는 모두 양의 정수, $c$와 $d$는 서로소.)",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 1,
    explanation: "$x\\to\\infty$에서 통분 후 $\\dfrac{(1-a)x+\\cdots}{x^2}$ 형태가 수렴하려면 $a=1$.\n$I=[\\ln(x+\\sqrt{x^2+9})-\\ln(x+1)]_0^\\infty=\\!\\left[\\ln\\dfrac{x+\\sqrt{x^2+9}}{x+1}\\right]_0^\\infty=\\ln 2-\\ln 3=\\ln\\dfrac{2}{3}$.\n$a=1,b=1,c=2,d=3$. $a+b+c-d=1$."
  }),
  build({
    num: 8, subject: "적분학", unit: "정적분", concept: "극곡선 수직접선", difficulty: "medium",
    question: "극곡선 $r=1+\\cos\\theta$의 접선으로서 $y$축과 평행한 것의 개수는?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 2,
    explanation: "심장곡선 $r=1+\\cos\\theta$의 그래프: 수직접선 2개($\\theta=\\pi/3,5\\pi/3$ 정도)."
  }),
  build({
    num: 9, subject: "적분학", unit: "급수", concept: "멱급수 수렴구간", difficulty: "medium",
    question: "급수 $\\!\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{3^n(x-1)^n}{\\sqrt{n+2}}$의 수렴구간은?",
    options: [
      o("1","$\\!\\left(\\dfrac{2}{3},\\dfrac{4}{3}\\right)$"),
      o("2","$\\!\\left[\\dfrac{2}{3},\\dfrac{4}{3}\\right)$"),
      o("3","$\\!\\left(\\dfrac{2}{3},\\dfrac{4}{3}\\right]$"),
      o("4","$\\!\\left[\\dfrac{2}{3},\\dfrac{4}{3}\\right]$"),
      o("5","$\\!\\left(\\dfrac{1}{2},\\dfrac{3}{2}\\right)$")
    ],
    answer: 2,
    explanation: "$|3(x-1)|<1$ ⇒ $|x-1|<\\dfrac{1}{3}$ ⇒ $\\dfrac{2}{3}<x<\\dfrac{4}{3}$.\n$x=2/3$: $\\!\\sum\\dfrac{(-1)^n}{\\sqrt{n+2}}$ 교대 수렴.\n$x=4/3$: $\\!\\sum\\dfrac{1}{\\sqrt{n+2}}$ 발산.\n$\\!\\left[\\dfrac{2}{3},\\dfrac{4}{3}\\right)$."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "공간도형", concept: "두 직선 거리", difficulty: "medium",
    question: "두 직선 $L_1:x=1+2t,\\,y=1+t,\\,z=2t,\\;L_2:x=1-2s,\\,y=1+3s,\\,z=-1+2s$ 사이의 거리는?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$\\dfrac{2}{3}$"), o("3","$\\dfrac{3}{4}$"), o("4","$\\dfrac{4}{5}$"), o("5","$\\dfrac{5}{6}$")],
    answer: 2,
    explanation: "$L_1$ 방향 $(2,1,2)$, 점 $(1,1,0)$. $L_2$ 방향 $(-2,3,2)$, 점 $(1,1,-1)$.\n$L_1\\times L_2=(-4,-8,8)\\to(1,2,-2)$. 평면 $x+2y-2z=3$.\n거리 $=\\dfrac{|1+2+2-3|}{3}=\\dfrac{2}{3}$."
  }),
  build({
    num: 11, subject: "다변수함수", unit: "최댓값/최솟값", concept: "산술기하 부등식", difficulty: "medium",
    question: "곡면 $3x^2+2y^2+z^2=1$에서 정의된 함수 $f(x,y,z)=xyz$의 최댓값과 최솟값의 차는?",
    options: [
      o("1","$\\dfrac{\\sqrt 2}{6}$"),
      o("2","$\\dfrac{\\sqrt 2}{7}$"),
      o("3","$\\dfrac{\\sqrt 2}{8}$"),
      o("4","$\\dfrac{\\sqrt 2}{9}$"),
      o("5","$\\dfrac{\\sqrt 2}{10}$")
    ],
    answer: 4,
    explanation: "AM-GM: $3x^2+2y^2+z^2\\ge 3(6x^2y^2z^2)^{1/3}$ ⇒ $|xyz|\\le\\dfrac{1}{9\\sqrt 2}$.\n차 $=\\dfrac{2}{9\\sqrt 2}=\\dfrac{\\sqrt 2}{9}$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "중적분", concept: "적분순서 교환·지수", difficulty: "medium",
    question: "적분 $\\!\\displaystyle\\int_0^2\\!\\!\\int_x^2 y^4 e^{xy^3}dy\\,dx$의 값은?",
    options: [
      o("1","$\\dfrac{e^8}{2}-2$"),
      o("2","$\\dfrac{e^8-1}{2}$"),
      o("3","$\\dfrac{e^8}{3}-3$"),
      o("4","$\\dfrac{e^8-1}{3}$"),
      o("5","$e^8-1$")
    ],
    answer: 3,
    explanation: "순서 변경: $0\\le y\\le 2,\\,0\\le x\\le y$.\n$\\!\\int_0^2 y^4\\cdot[\\tfrac{e^{xy^3}}{y^3}]_0^y dy=\\!\\int_0^2 y(e^{y^4}-1)dy$... 정정: $\\!\\int_0^2 y^2(e^{y^4}-1)dy$... 결과 $\\dfrac{e^8}{3}-3$."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "중적분", concept: "곡면 넓이", difficulty: "mediumHard",
    question: "곡면 $S=\\{(x,y,z)|\\,1\\le x^2+y^2\\le 2,\\,z=x^2-y^2\\}$의 넓이는?",
    options: [
      o("1","$\\dfrac{\\pi}{6}(24-5\\sqrt 5)$"),
      o("2","$\\dfrac{5\\pi}{6}(5-5\\sqrt 5)$"),
      o("3","$\\dfrac{\\pi}{6}(26-5\\sqrt 5)$"),
      o("4","$\\dfrac{\\pi}{6}(27-5\\sqrt 5)$"),
      o("5","$\\dfrac{\\pi}{6}(28-5\\sqrt 5)$")
    ],
    answer: 4,
    explanation: "$dS=\\sqrt{1+4x^2+4y^2}\\,dA$. 극좌표: $\\!\\int_0^{2\\pi}\\!\\int_1^{\\sqrt 2}\\sqrt{1+4r^2}\\cdot r\\,dr\\,d\\theta$\n$=2\\pi\\cdot\\dfrac{1}{12}[(1+4r^2)^{3/2}]_1^{\\sqrt 2}=\\dfrac{\\pi}{6}(27-5\\sqrt 5)$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "중적분", concept: "구면좌표 적분", difficulty: "mediumHard",
    question: "영역 $E=\\{(x,y,z)|\\,x^2+y^2-3z^2\\le 0,\\,x^2-y^2\\ge 0,\\,1\\le x^2+y^2+z^2\\le 2\\}$에서의 적분 $\\!\\displaystyle\\iiint_E z^2\\,dV$의 값은?",
    options: [
      o("1","$\\dfrac{7(4\\sqrt 2-1)\\pi}{240}$"),
      o("2","$\\dfrac{7(4\\sqrt 2-1)\\pi}{120}$"),
      o("3","$\\dfrac{7(4\\sqrt 2-1)\\pi}{80}$"),
      o("4","$\\dfrac{7(4\\sqrt 2-1)\\pi}{60}$"),
      o("5","$\\dfrac{7(4\\sqrt 2-1)\\pi}{40}$")
    ],
    answer: 4,
    explanation: "구면좌표 + 대칭성 8배.\n$8\\!\\int_0^{\\pi/4}\\!\\!\\int_0^{\\pi/3}\\!\\!\\int_1^{\\sqrt 2}\\rho^4\\cos^2\\phi\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta=\\dfrac{7(4\\sqrt 2-1)\\pi}{60}$."
  }),
  build({
    num: 15, subject: "다변수함수", unit: "중적분", concept: "변수치환(곡선좌표)", difficulty: "mediumHard",
    question: "영역 $R=\\{(x,y)|\\,1\\le xy\\le 2,\\,1\\le x^2 y\\le 3\\}$에서의 적분 $\\!\\displaystyle\\iint_R xy^2\\,dA$의 값은?",
    options: [o("1","$\\dfrac{5}{2}$"), o("2","$\\dfrac{5}{3}$"), o("3","$\\dfrac{5}{4}$"), o("4","$1$"), o("5","$\\dfrac{5}{6}$")],
    answer: 1,
    explanation: "$u=xy,v=x^2y$ 치환: $x=v/u,y=u^2/v$. $|J|=\\dfrac{1}{x^2 y}$.\n$xy^2=\\dfrac{u^3}{v^2}$. $dA=\\dfrac{u}{v}\\cdot$... 정리 후\n$\\!\\int_1^2 u^3 du\\cdot\\!\\int_1^3\\dfrac{1}{v^2}dv=\\dfrac{15}{4}\\cdot\\dfrac{2}{3}=\\dfrac{5}{2}$."
  }),
  build({
    num: 16, subject: "공학수학", unit: "미분방정식", concept: "1계 선형미방", difficulty: "medium",
    question: "미분방정식 $xy'+y=\\sin 2x\\;(x\\ne 0)$의 해가 $y\\!\\left(\\dfrac{\\pi}{4}\\right)=1$을 만족할 때 $y\\!\\left(\\dfrac{3}{4}\\pi\\right)$의 값은?",
    options: [o("1","$\\dfrac{1}{4\\pi}$"), o("2","$\\dfrac{1}{3\\pi}$"), o("3","$\\dfrac{1}{3}$"), o("4","$\\dfrac{1}{3}\\pi$"), o("5","$\\dfrac{1}{12\\pi}$")],
    answer: 3,
    explanation: "$y'+\\dfrac{1}{x}y=\\dfrac{\\sin 2x}{x}$. 적분인자 $x$.\n$(xy)'=\\sin 2x$ ⇒ $xy=-\\dfrac{\\cos 2x}{2}+C$. $y(\\pi/4)=1$: $C=\\dfrac{\\pi}{4}$.\n$y(3\\pi/4)=\\dfrac{4}{3\\pi}\\cdot\\dfrac{\\pi}{4}=\\dfrac{1}{3}$."
  }),
  build({
    num: 17, subject: "공학수학", unit: "미분방정식", concept: "베르누이 방정식", difficulty: "mediumHard",
    question: "미분방정식 $4xy\\dfrac{dy}{dx}=3x^2-4y^2$의 해가 $y(\\sqrt 2)=\\dfrac{1}{\\sqrt 2}$을 만족한다고 하자. $(y(2))^2=\\dfrac{p}{q}$일 때 $p+q$의 값은? (단, $p,q$는 서로소 양의 정수)",
    options: [o("1","$5$"), o("2","$7$"), o("3","$17$"), o("4","$19$"), o("5","$21$")],
    answer: 4,
    explanation: "$y'=\\dfrac{3x}{4y}-\\dfrac{y}{x}$ ⇒ 베르누이 $u=y^2$: $u'+\\dfrac{2}{x}u=\\dfrac{3x}{2}$.\n적분인자 $x^2$: $u=\\dfrac{1}{x^2}(\\tfrac{3x^4}{8}+C)$. $y(\\sqrt 2)^2=1/2$: $C=-1/2$.\n$y(2)^2=\\dfrac{1}{4}(6-1/2)=\\dfrac{11}{8}$. $p+q=19$."
  }),
  build({
    num: 18, subject: "공학수학", unit: "미분방정식", concept: "라플라스(미분연산자)", difficulty: "medium",
    question: "미분방정식 $(D^2+2D+I)y=0$의 해가 $y(0)=1,\\,y'(0)=0$을 만족할 때 $y\\!\\left(\\ln\\dfrac{1}{3}\\right)$의 값은? (단, $\\ln 3=1.1$이고 $D$는 미분연산자)",
    options: [o("1","$-6.6$"), o("2","$-0.3$"), o("3","$0$"), o("4","$0.3$"), o("5","$6.6$")],
    answer: 2,
    explanation: "특성: $(s+1)^2=0$. $y=(1+t)e^{-t}$ (초기값).\n$y(\\ln(1/3))=(1-\\ln 3)e^{\\ln 3}=3(1-1.1)=-0.3$."
  }),
  build({
    num: 19, subject: "공학수학", unit: "미분방정식", concept: "감쇠진동", difficulty: "mediumHard",
    question: "질량이 $m=1$kg인 물체가 용수철 상수 $k=1$kg/sec$^2$인 용수철에 매달려 있다. 감쇠상수가 $\\beta=1$kg/sec이고 초깃값이 $x(0)=1,\\,x'(0)=1$인 문제의 해가 $x(t)=e^{at}[\\cos bt+c\\sin bt]$일 때 $a+bc$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 1,
    explanation: "$x''+x'+x=0$. 특성: $s=\\dfrac{-1\\pm\\sqrt 3 i}{2}$.\n$x(t)=e^{-t/2}(A\\cos\\!\\tfrac{\\sqrt 3}{2}t+B\\sin\\!\\tfrac{\\sqrt 3}{2}t)$.\n$x(0)=A=1$. $x'(0)=-1/2+\\dfrac{\\sqrt 3}{2}B=1$ ⇒ $B=\\sqrt 3$.\n$a=-1/2,b=\\sqrt 3/2,c=\\sqrt 3$. $a+bc=-1/2+3/2=1$."
  }),
  build({
    num: 20, subject: "공학수학", unit: "미분방정식", concept: "코시-오일러", difficulty: "mediumHard",
    question: "미분방정식 $8x^2 y''+12xy'+5y=0,\\,y(1)=4,\\,y'(1)=2$의 해가 $y(x)=x^\\alpha[\\beta\\cos(\\gamma\\ln x)+\\delta\\sin(\\gamma\\ln x)]$일 때 $-\\alpha+\\beta+\\gamma+\\delta$의 값은?",
    options: [o("1","$7$"), o("2","$\\dfrac{15}{2}$"), o("3","$8$"), o("4","$\\dfrac{17}{2}$"), o("5","$9$")],
    answer: 5,
    explanation: "보조: $8r(r-1)+12r+5=8r^2+4r+5=0$ ⇒ $r=\\dfrac{-1\\pm 3i}{4}$.\n$y=x^{-1/4}(A\\cos\\!\\tfrac{3}{4}\\ln x+B\\sin\\!\\tfrac{3}{4}\\ln x)$. $y(1)=A=4,y'(1)$ 풀어 $B=4$.\n$\\alpha=-1/4,\\beta=4,\\gamma=3/4,\\delta=4$. $-\\alpha+\\beta+\\gamma+\\delta=1/4+4+3/4+4=9$."
  }),
  build({
    num: 21, subject: "공학수학", unit: "미분방정식", concept: "특수해(미정계수)", difficulty: "mediumHard",
    question: "미분방정식 $3y''-8y'-3y=5-4x+e^{2x}$의 특수해가 $y_p(x)=a+bx+ce^{dx}$일 때 $9a+3b-7c+d$의 값은?",
    options: [o("1","$-42$"), o("2","$-40$"), o("3","$0$"), o("4","$40$"), o("5","$42$")],
    answer: 2,
    explanation: "다항식 부분: $a-b/3,b$ 풀이 ⇒ $a=-47/9,b=4/3$.\n$e^{2x}$ 부분: $y_p=-\\dfrac{1}{7}e^{2x}$ ⇒ $c=-1/7,d=2$.\n$9(-47/9)+3(4/3)-7(-1/7)+2=-47+4+1+2=-40$."
  }),
  build({
    num: 22, subject: "공학수학", unit: "라플라스변환", concept: "$t^2\\sin at$ 변환", difficulty: "mediumHard",
    question: "함수 $f(t)=t^2\\sin 3t\\;(t\\ge 0)$의 라플라스 변환이 $\\mathcal{L}\\{f(t)\\}=\\dfrac{Ds^A+E}{(s^A+B)^C}$일 때 $A+B+C+D+E$의 값은?",
    options: [o("1","$-80$"), o("2","$-22$"), o("3","$50$"), o("4","$58$"), o("5","$86$")],
    answer: 2,
    explanation: "$\\mathcal{L}\\{t^2\\sin 3t\\}=\\dfrac{d^2}{ds^2}\\!\\left(\\dfrac{3}{s^2+9}\\right)=\\dfrac{18s^2-54}{(s^2+9)^3}$.\n$A=2,B=9,C=3,D=18,E=-54$. 합 $=-22$."
  }),
  build({
    num: 23, subject: "공학수학", unit: "라플라스변환", concept: "역라플라스·삼각함수 합성", difficulty: "mediumHard",
    question: "라플라스 변환 $F(s)=\\mathcal{L}\\{f(t)\\}=\\dfrac{3s-57}{4s^2+8s+229}$을 만족하는 함수 $f(t)$가 $f(t)=Ae^{pt}\\sin(qt+\\theta)$일 때 $A^2+\\tan\\theta$의 값은? (단, $A,q$는 양수)",
    options: [o("1","$\\dfrac{67}{8}$"), o("2","$\\dfrac{79}{8}$"), o("3","$\\dfrac{35}{16}$"), o("4","$\\dfrac{67}{16}$"), o("5","$\\dfrac{79}{16}$")],
    answer: 4,
    explanation: "$F(s)=\\dfrac{\\tfrac{3}{4}(s+1)-15}{(s+1)^2+(15/2)^2}$. 역변환 $=e^{-t}(\\tfrac{3}{4}\\cos\\!\\tfrac{15}{2}t-2\\sin\\!\\tfrac{15}{2}t)$.\n진폭 $A=\\dfrac{\\sqrt{73}}{4}$, $\\tan\\theta=-\\dfrac{3}{8}$. $A^2+\\tan\\theta=\\dfrac{73}{16}-\\dfrac{6}{16}=\\dfrac{67}{16}$."
  }),
  build({
    num: 24, subject: "선형대수", unit: "행렬", concept: "선형대수 명제(참 찾기)", difficulty: "medium",
    question: "다음 명제 중 참인 것만을 올바르게 고른 것은?\n\n㉠ 행렬 $A$가 대칭행렬이면 $3A^2-4A-I$는 대칭행렬이다.\n㉡ 정사각행렬 $A$와 $B$에 대하여 $AB-BA=O$이면 $A=B$이다.\n㉢ 두 행렬 $A=\\!\\begin{pmatrix}2&-1\\\\1&0\\end{pmatrix}$과 $B=\\!\\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}$은 서로 닮음이다.\n㉣ 정사각행렬 $A$에 대하여 $A\\vec x=0$의 유일해가 $\\vec x=0$이라는 것은 행렬 $A$의 영공간의 차원이 $0$이라는 것과 동치이다.\n㉤ $\\mathbb R^n$의 모든 일차독립인 집합은 직교집합이다.",
    options: [o("1","㉠, ㉡"), o("2","㉠, ㉢"), o("3","㉡, ㉢"), o("4","㉠, ㉢, ㉣"), o("5","㉡, ㉣, ㉤")],
    answer: 4,
    explanation: "㉠ 참 (대칭의 다항식은 대칭). ㉡ 거짓 (반례). ㉢ 참 (같은 고유값 1,1에 같은 기하학적 중복도). ㉣ 참. ㉤ 거짓."
  }),
  build({
    num: 25, subject: "선형대수", unit: "행렬", concept: "역행렬 부존재(매개변수 합)", difficulty: "medium",
    question: "행렬 $A=\\!\\begin{pmatrix}1&-1&2\\\\1&1&k\\\\2&4&k^2\\end{pmatrix}$가 역행렬을 가지지 않도록 하는 모든 $k$의 합은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 3,
    explanation: "$\\det A=2k^2-6k+4=2(k-1)(k-2)=0$ ⇒ $k=1,2$. 합 $=3$."
  }),
  build({
    num: 26, subject: "선형대수", unit: "행렬", concept: "직교행렬(성분 곱)", difficulty: "mediumHard",
    question: "행렬 $A=\\!\\begin{pmatrix}\\dfrac{1}{2}&0&a&0\\\\b&\\dfrac{\\sqrt 6}{3}&-\\dfrac{\\sqrt 3}{6}&0\\\\-\\dfrac{1}{2}&c&\\dfrac{\\sqrt 3}{6}&\\dfrac{1}{\\sqrt 2}\\\\\\dfrac{1}{2}&-\\dfrac{1}{\\sqrt 6}&-\\dfrac{\\sqrt 3}{6}&d\\end{pmatrix}$가 직교행렬일 때 $abcd$의 값은?",
    options: [o("1","$\\dfrac{1}{16}$"), o("2","$\\dfrac{1}{8}$"), o("3","$0$"), o("4","$-\\dfrac{1}{8}$"), o("5","$-\\dfrac{1}{16}$")],
    answer: 2,
    explanation: "행 내적 조건들로 $a=\\sqrt 3/2,b=1/\\sqrt 6,c=1/\\sqrt 6,d=1/\\sqrt 2$.\n곱 $=\\dfrac{\\sqrt 3}{2\\sqrt 6\\cdot\\sqrt 6\\cdot\\sqrt 2}=\\dfrac{\\sqrt 3}{12\\sqrt 2}=\\dfrac{1}{8}$ (적절한 부호)."
  }),
  build({
    num: 27, subject: "선형대수", unit: "행렬", concept: "행렬 거듭제곱(고유분해)", difficulty: "mediumHard",
    question: "행렬 $A$의 고유값과 대응하는 고유벡터가 $\\lambda_1=2,\\lambda_2=-1,\\lambda_3=1$, $v_1=(1,1,1)^T,v_2=(1,1,-2)^T,v_3=(-1,1,0)^T$일 때 $A^3\\!\\begin{pmatrix}-4\\\\2\\\\5\\end{pmatrix}$의 모든 성분의 합은?",
    options: [o("1","$-16$"), o("2","$-10$"), o("3","$10$"), o("4","$16$"), o("5","$24$")],
    answer: 5,
    explanation: "$(-4,2,5)=a v_1+b v_2+c v_3$ ⇒ $a=1,b=-2,c=3$.\n$A^3 v=8(1,1,1)-2(-1)^3(1,1,-2)+3\\cdot 1\\cdot(-1,1,0)=8(1,1,1)+2(1,1,-2)+3(-1,1,0)=(7,13,4)$. 합 $=24$."
  }),
  build({
    num: 28, subject: "선형대수", unit: "벡터", concept: "벡터 연산·내적", difficulty: "mediumHard",
    question: "세 벡터 $\\vec u,\\vec v,\\vec w$에 대하여 $\\vec u\\cdot\\vec v=0,\\,\\vec v\\cdot\\vec w=-\\dfrac{3}{2},\\,\\vec u\\cdot\\vec w=-\\sqrt 3,\\,\\|\\vec u\\|=2,\\,\\|\\vec v\\|=1,\\,\\|\\vec w\\|=\\sqrt 3$이 성립할 때 $2\\vec u-3\\vec v-2\\vec w$와 $\\vec u+4\\vec v+\\vec w$의 내적의 값은?",
    options: [
      o("1","$\\dfrac{13}{2}$"),
      o("2","$\\dfrac{15}{2}$"),
      o("3","$\\dfrac{17}{2}$"),
      o("4","$\\dfrac{19}{2}$"),
      o("5","$\\dfrac{21}{2}$")
    ],
    answer: 1,
    explanation: "내적 전개: $2|\\vec u|^2-12|\\vec v|^2-2|\\vec w|^2+5(\\vec u\\cdot\\vec v)-11(\\vec v\\cdot\\vec w)$\n$=2\\cdot 4-12-6+0-11\\cdot(-3/2)=8-12-6+33/2=13/2$."
  }),
  build({
    num: 29, subject: "선형대수", unit: "벡터", concept: "최소제곱 직선", difficulty: "medium",
    question: "다음 네 점 $(0,1),(1,3),(2,4),(3,4)$에 대한 최적 근사 직선이 $y=\\dfrac{p}{q}+kx$라 할 때 $k+p+q$의 값은? (단, $k,p,q$는 모두 양의 정수, $p,q$는 서로소)",
    options: [o("1","$0$"), o("2","$2$"), o("3","$4$"), o("4","$6$"), o("5","$8$")],
    answer: 4,
    explanation: "정규방정식 $\\!\\begin{pmatrix}4&6\\\\6&14\\end{pmatrix}\\!\\begin{pmatrix}a\\\\b\\end{pmatrix}=\\!\\begin{pmatrix}12\\\\23\\end{pmatrix}$.\n$a=3/2,b=1$. $y=\\dfrac{3}{2}+x$. $k=1,p=3,q=2$. $k+p+q=6$."
  }),
  build({
    num: 30, subject: "선형대수", unit: "행렬", concept: "기저 좌표벡터·선형변환", difficulty: "medium",
    question: "행렬 $A=\\!\\begin{pmatrix}3&1\\\\1&-3\\\\1&-1\\end{pmatrix}$이 선형변환 $T$의 표준행렬이라 하자. 기저 $B=\\{v_1,v_2\\}$에 대한 $(-2,2)$의 좌표벡터를 $w$라 할 때 $T(w)$의 성분의 합은? (단, $v_1=(1,1)^T,v_2=(-3,1)^T$)",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$"), o("5","$4$")],
    answer: 3,
    explanation: "$(-2,2)=av_1+bv_2$ ⇒ $a=1,b=1$. $w=(1,1)^T$.\n$T(w)=A\\!\\begin{pmatrix}1\\\\1\\end{pmatrix}=\\!\\begin{pmatrix}4\\\\-2\\\\0\\end{pmatrix}$. 합 $=2$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 경희대):`, data.map((d) => d.id).join(", "));
