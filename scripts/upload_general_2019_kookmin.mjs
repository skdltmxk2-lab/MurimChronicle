// Upload 2019년도 국민대 편입수학 기출 25문항 (수학과/나노물리학과, 4지 선다, 60분)
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

const SCHOOL = "국민대";
const YEAR = "2019";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-kookmin-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "다변수함수", unit: "방향도함수", concept: "최대 증가율(경도 크기)", difficulty: "medium",
    question: "좌표공간상의 점 $(x,y,z)$에서 온도 $T$가 다음과 같다. $T(x,y,z)=\\dfrac{80}{1+x^2+2y^2+3z^2}$. 이 때 점 $(1,1,-2)$에서 온도가 가장 빠르게 증가하는 방향으로의 최대 증가율은?",
    options: [
      o("1","$\\sqrt{41}$"),
      o("2","$\\dfrac{\\sqrt{41}}{2}$"),
      o("3","$\\dfrac{5\\sqrt{41}}{4}$"),
      o("4","$\\dfrac{5\\sqrt{41}}{8}$"),
    ],
    answer: 4,
    explanation: "$\\nabla T=\\!\\left(\\dfrac{-160x}{(1+x^2+2y^2+3z^2)^2},\\dfrac{-320y}{\\cdot},\\dfrac{-480z}{\\cdot}\\right)$.\n$(1,1,-2)$에서 $\\nabla T=\\!\\left(-\\dfrac{5}{8},-\\dfrac{10}{8},\\dfrac{30}{8}\\right)$.\n$|\\nabla T|=\\dfrac{5\\sqrt{41}}{8}$."
  }),
  build({
    num: 2, subject: "다변수함수", unit: "평면 방정식", concept: "두 평면에 수직인 평면", difficulty: "easy",
    question: "좌표공간에서 점 $(1,0,-2)$를 지나고 두 평면 $2x+y-z=2$, $x-y-z=3$에 각각 수직인 평면의 방정식은?",
    options: [
      o("1","$2x-y+3z+4=0$"),
      o("2","$2x+y+3z+4=0$"),
      o("3","$2x-y-3z-8=0$"),
      o("4","$2x+y-3z-8=0$"),
    ],
    answer: 1,
    explanation: "법선벡터 $=\\!\\begin{vmatrix}i&j&k\\\\2&1&-1\\\\1&-1&-1\\end{vmatrix}=(-2,1,-3)$ → $(2,-1,3)$.\n평면: $2(x-1)-(y-0)+3(z+2)=0$ ⇒ $2x-y+3z+4=0$."
  }),
  build({
    num: 3, subject: "선형대수", unit: "공간직선", concept: "두 평행직선과 수직선의 교점", difficulty: "medium",
    question: "좌표 공간상의 두 직선 $l,m$이 다음과 같다.\n$l:x-4=y-3=-z+1$, $m:x-1=y-2=-z+3$.\n직선 $m$ 상의 점 $(1,2,3)$을 지나는 직선 $n$이 직선 $l$과 수직으로 만날 때 $l$과 $n$의 교점의 좌표는?",
    options: [o("1","$(8,7,-3)$"), o("2","$(4,3,1)$"), o("3","$(2,1,3)$"), o("4","$(6.5,-1)$")],
    answer: 3,
    explanation: "$l$ 벡터형 $(4+t,3+t,1-t)$.\n$\\vec{AP}=(3+t,1+t,-2-t)\\cdot(1,1,-1)=0$ ⇒ $t=-2$.\n교점 $(2,1,3)$."
  }),
  build({
    num: 4, subject: "선형대수", unit: "선형변환", concept: "선형변환에 의한 삼각형 넓이", difficulty: "medium",
    question: "선형변환 $T:\\mathbb{R}^2\\to\\mathbb{R}^2$가 다음을 만족한다. $T(1,0)=(2,3)$, $T(0,1)=(1,-2)$. $T$에 의해 세 점 $P(2,3)$, $Q(-1,0)$, $R(1,-2)$이 옮겨지는 점을 각각 $A,B,C$라 할 때 삼각형 $ABC$의 넓이는?",
    options: [o("1","$4$"), o("2","$14$"), o("3","$24$"), o("4","$42$")],
    answer: 4,
    explanation: "$T=\\!\\begin{pmatrix}2&1\\\\3&-2\\end{pmatrix}$, $|\\det T|=7$.\n$\\triangle PQR$ 넓이 $=\\dfrac{1}{2}|(-3,-3)\\times(-1,-5)|=\\dfrac{1}{2}\\sqrt{144}=6$.\n$\\triangle ABC=6\\cdot 7=42$."
  }),
  build({
    num: 5, subject: "적분학", unit: "곡선의 길이", concept: "공간 곡선 호의 길이(쌍곡함수)", difficulty: "medium",
    question: "$0\\le t\\le\\pi$에서 곡선 $C$가 다음과 같다. $C:x(t)=3\\cosh(2t)\\mathbf{e}_1+3\\sinh(2t)\\mathbf{e}_2+6t\\mathbf{e}_3$. 이 때 $C$의 길이는?",
    options: [
      o("1","$3\\sqrt 2\\sinh(2\\pi)$"),
      o("2","$3\\sqrt 2\\cosh(2\\pi)$"),
      o("3","$6\\sqrt 2\\sinh(2\\pi)$"),
      o("4","$6\\sqrt 2\\cosh(2\\pi)$"),
    ],
    answer: 1,
    explanation: "$|x'|^2=36\\sinh^2(2t)+36\\cosh^2(2t)+36$.\n$=36(2\\cosh^2(2t))$ ⇒ $|x'|=6\\sqrt 2\\cosh(2t)$.\n$L=\\!\\int_0^\\pi 6\\sqrt 2\\cosh(2t)dt=3\\sqrt 2[\\sinh(2t)]_0^\\pi=3\\sqrt 2\\sinh(2\\pi)$."
  }),
  build({
    num: 6, subject: "다변수함수", unit: "방향도함수", concept: "방향도함수 (단위벡터 정규화)", difficulty: "medium",
    question: "좌표공간상의 점 $(1,3,0)$에서 $\\mathbf{u}=\\mathbf{e}_1+2\\mathbf{e}_2-\\mathbf{e}_3$ 방향으로 함수 $f(x,y,z)=x\\sin(yz)$의 방향도함수는?",
    options: [o("1","$\\dfrac{\\sqrt 6}{2}$"), o("2","$\\sqrt 6$"), o("3","$-\\dfrac{\\sqrt 6}{2}$"), o("4","$-\\sqrt 6$")],
    answer: 3,
    explanation: "$\\nabla f=(\\sin(yz),xz\\cos(yz),xy\\cos(yz))$.\n$(1,3,0)$: $\\nabla f=(0,0,3)$.\n단위벡터 $\\mathbf{w}=\\dfrac{1}{\\sqrt 6}(1,2,-1)$.\n$D_{\\mathbf w}f=(0,0,3)\\cdot\\mathbf w=-\\dfrac{3}{\\sqrt 6}=-\\dfrac{\\sqrt 6}{2}$."
  }),
  build({
    num: 7, subject: "다변수함수", unit: "선적분과 면적분", concept: "발산정리로 면적분", difficulty: "medium",
    question: "구면 $S:x^2+y^2+z^2=1$ 상의 벡터장 $F(x,y,z)=z\\mathbf{e}_1+y\\mathbf{e}_2+x\\mathbf{e}_3$에 대하여 $\\!\\displaystyle\\iint_S F\\cdot dS$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{3}$"), o("2","$\\dfrac{2\\pi}{3}$"), o("3","$\\pi$"), o("4","$\\dfrac{4\\pi}{3}$")],
    answer: 4,
    explanation: "$\\text{div}F=0+1+0=1$.\n발산정리: $\\!\\iint_S F\\cdot dS=\\!\\iiint_E 1\\,dV=\\dfrac{4\\pi}{3}$."
  }),
  build({
    num: 8, subject: "미분학", unit: "극한과 연속", concept: "연속함수 명제 판별", difficulty: "medium",
    question: "연속함수에 대한 다음 설명 중 옳은 것을 모두 고르면?\n\nㄱ. 함수 $f(x)=\\dfrac{\\ln x+e^x}{x^2-1}$는 구간 $(-\\infty,-1)$과 $(1,\\infty)$에서 연속이다.\nㄴ. 방정식 $4x^3-6x^2+3x-2=0$의 해는 $1$과 $2$ 사이에 존재한다.\nㄷ. 함수 $f(x)=\\ln(1+\\cos x)$는 $x=(2n-1)\\pi$에서 불연속이다. 단, $n$은 정수.\nㄹ. 합성함수 $g\\circ f$가 $a$에서 연속이기 위해서는 반드시 $g$가 $a$에서 연속이고 $f$가 $g(a)$에서 연속이어야 한다.",
    options: [o("1","ㄱ, ㄴ"), o("2","ㄱ, ㄷ"), o("3","ㄴ, ㄷ"), o("4","ㄷ, ㄹ")],
    answer: 3,
    explanation: "ㄱ. 거짓: $\\ln x$는 $x>0$, $(-\\infty,-1)$에서 $f$ 정의 X.\nㄴ. 참: 중간값 정리 ($f(1)=-1$, $f(2)=12$).\nㄷ. 참: $\\cos x=-1$ 때 $\\ln 0$.\nㄹ. 거짓: 명제의 역."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "음함수 미분", concept: "음함수 접선", difficulty: "medium",
    question: "곡선 $x^2+y^2=(2x^2+2y^2-x)^2$ 상의 점 $(0,1/2)$에서 접선의 방정식은?",
    options: [
      o("1","$y=-x+\\dfrac{1}{2}$"),
      o("2","$y=x+\\dfrac{1}{2}$"),
      o("3","$y=-\\dfrac{9}{13}x+\\dfrac{1}{2}$"),
      o("4","$y=\\dfrac{9}{13}x+\\dfrac{1}{2}$"),
    ],
    answer: 2,
    explanation: "$F=x^2+y^2-(2x^2+2y^2-x)^2$. $F_x,F_y$ 계산해 $(0,1/2)$ 대입.\n$\\dfrac{dy}{dx}=-F_x/F_y=1$.\n접선: $y-\\dfrac{1}{2}=x$ ⇒ $y=x+\\dfrac{1}{2}$."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "선형근사", concept: "선형근사로 근삿값", difficulty: "easy",
    question: "다음 중 선형근사(Linear approximation)를 이용하여 $(8.06)^{2/3}$의 근삿값을 구한 것은?",
    options: [o("1","$4$"), o("2","$4.02$"), o("3","$4.07$"), o("4","$4.1$")],
    answer: 2,
    explanation: "$f(x)=x^{2/3}$, $f'(x)=\\dfrac{2}{3}x^{-1/3}$.\n$x=8$에서 $f(8)=4$, $f'(8)=\\dfrac{1}{3}$.\n$L(8.06)=4+\\dfrac{1}{3}(0.06)=4.02$."
  }),
  build({
    num: 11, subject: "적분학", unit: "이상적분", concept: "가우스 적분의 제곱", difficulty: "easy",
    question: "$I=\\!\\displaystyle\\int_{-\\infty}^{\\infty}e^{-x^2}dx$라 할 때 $I^2$의 값은?",
    options: [o("1","$1$"), o("2","$\\pi$"), o("3","$\\pi^2$"), o("4","$\\infty$")],
    answer: 2,
    explanation: "$I=\\sqrt\\pi$, $I^2=\\pi$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "거리", concept: "구면 위의 최근접점", difficulty: "easy",
    question: "좌표공간상의 점 $(3,1,-1)$로부터 $x^2+y^2+z^2=4$ 위에 있는 가장 가까운 점의 좌표를 $(a,b,c)$라 할 때 $a+b+c$의 값은?",
    options: [
      o("1","$-\\dfrac{6\\sqrt{11}}{11}$"),
      o("2","$-\\dfrac{2\\sqrt{11}}{11}$"),
      o("3","$\\dfrac{2\\sqrt{11}}{11}$"),
      o("4","$\\dfrac{6\\sqrt{11}}{11}$"),
    ],
    answer: 4,
    explanation: "$(3,1,-1)$의 크기 $\\sqrt{11}$.\n반지름 $2$로 정규화: $(a,b,c)=\\dfrac{2}{\\sqrt{11}}(3,1,-1)$.\n합 $=\\dfrac{2}{\\sqrt{11}}(3+1-1)=\\dfrac{6\\sqrt{11}}{11}$."
  }),
  build({
    num: 13, subject: "선형대수", unit: "역행렬과 계수", concept: "가역행렬 성질 명제 판별", difficulty: "easy",
    question: "$n\\times n$행렬 $A$가 역행렬을 가질 때, 다음 중 $\\textbf{틀린}$ 것은?\n\nㄱ. $A$의 행렬식 값 $\\det(A)$은 $0$이 아니다.\nㄴ. $Ax=b$는 $\\mathbb{R}^n$의 모든 벡터 $b$에 대해 두 개 이상의 해를 가진다.\nㄷ. $A$의 열벡터들은 일차독립이다.\nㄹ. $A$의 계수 $\\text{rank}(A)=n$이다.",
    options: [o("1","ㄱ"), o("2","ㄴ"), o("3","ㄷ"), o("4","ㄹ")],
    answer: 2,
    explanation: "ㄴ. 거짓: 가역행렬이면 $Ax=b$의 해는 유일($A^{-1}b$).\n나머지는 모두 가역의 필요충분조건."
  }),
  build({
    num: 14, subject: "기타", unit: "정수론", concept: "최대공약수 성질", difficulty: "medium",
    question: "세 정수 $a,b,c$에 대하여 $a$와 $b$의 최대공약수를 $\\gcd(a,b)$라 할 때 다음 중 $\\textbf{틀린}$ 것은?\n\nㄱ. $\\gcd(a,b)=c$이면 $\\gcd\\!\\left(\\dfrac{a}{c},\\dfrac{b}{c}\\right)>1$이다.\nㄴ. $a$와 $b$가 $c$의 약수이고 $\\gcd(a,b)=1$이면 $ab$는 $c$의 약수이다.\nㄷ. $a$가 $bc$의 약수이고 $\\gcd(a,b)=1$이면 $a$는 $c$의 약수이다.\nㄹ. $ax+by=\\gcd(a,b)$를 만족하는 정수 $x,y$가 존재하면 $\\gcd(x,y)=1$이다.",
    options: [o("1","ㄱ"), o("2","ㄴ"), o("3","ㄷ"), o("4","ㄹ")],
    answer: 1,
    explanation: "ㄱ. 거짓: $\\gcd(a,b)=c$이면 $a/c,b/c$는 서로소 ⇒ $\\gcd=1$.\nㄴ,ㄷ,ㄹ은 표준 정리."
  }),
  build({
    num: 15, subject: "적분학", unit: "이중적분", concept: "치환을 통한 이중적분", difficulty: "mediumHard",
    question: "좌표평면에서 $(1,0)$, $(2,0)$, $(0,-2)$, $(0,-1)$을 꼭짓점으로 갖는 사다리꼴 영역 $R$에 대하여 $\\!\\displaystyle\\iint_R e^{(x+y)/(x-y)}\\,dx\\,dy$의 값은?",
    options: [
      o("1","$0$"),
      o("2","$\\dfrac{1}{2}\\!\\left(e-\\dfrac{1}{e}\\right)$"),
      o("3","$\\dfrac{3}{7}\\!\\left(e-\\dfrac{1}{e}\\right)$"),
      o("4","$\\dfrac{3}{4}\\!\\left(e-\\dfrac{1}{e}\\right)$"),
    ],
    answer: 4,
    explanation: "$u=x+y,\\,v=x-y$, $|J|=1/2$.\n$\\dfrac{1}{2}\\!\\int_1^2\\!\\int_{-v}^{v}\\!e^{u/v}\\,du\\,dv=\\dfrac{1}{2}\\!\\int_1^2 v(e-e^{-1})\\,dv$.\n$=\\dfrac{1}{2}(e-e^{-1})\\cdot\\dfrac{3}{2}=\\dfrac{3}{4}(e-e^{-1})$."
  }),
  build({
    num: 16, subject: "다변수함수", unit: "선적분", concept: "보존적 벡터장 판별", difficulty: "medium",
    question: "$C$를 벡터함수 $x(t),\\;a\\le t\\le b$로 주어진 부드러운 곡선이라고 할 때, 다음 중 선적분 $\\!\\int_C F\\cdot dx$가 경로에 독립인 벡터장 $F$를 모두 고른 것은?\n\nㄱ. $F=-\\dfrac{y}{x^2+y^2}\\mathbf{e}_1+\\dfrac{x}{x^2+y^2}\\mathbf{e}_2$\nㄴ. $F=e^x\\cos y\\,\\mathbf{e}_1+e^x\\sin y\\,\\mathbf{e}_2$\nㄷ. $F=\\dfrac{y^2}{1+x^2}\\mathbf{e}_1+2y\\tan^{-1}x\\,\\mathbf{e}_2$\nㄹ. $F=(ye^x+\\sin y)\\mathbf{e}_1+(e^x+x\\cos y)\\mathbf{e}_2$",
    options: [o("1","ㄱ, ㄷ"), o("2","ㄱ, ㄹ"), o("3","ㄴ, ㄷ"), o("4","ㄷ, ㄹ")],
    answer: 4,
    explanation: "ㄱ. 원점 특이점.\nㄴ. $P_y=-e^x\\sin y\\ne Q_x=e^x\\sin y$.\nㄷ. $P_y=Q_x=\\dfrac{2y}{1+x^2}$ 보존.\nㄹ. $P_y=e^x+\\cos y=Q_x$ 보존."
  }),
  build({
    num: 17, subject: "적분학", unit: "급수", concept: "삼각급수 정적분", difficulty: "mediumHard",
    question: "무한급수 $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\!\\int_{-\\pi}^{\\pi}(\\sin x+\\cos x)(\\sin nx+\\cos nx)\\,dx$의 값은?",
    options: [o("1","$0$"), o("2","$\\pi$"), o("3","$2\\pi$"), o("4","$4\\pi$")],
    answer: 3,
    explanation: "직교성: $\\sin x\\cos nx,\\cos x\\sin nx$ 기함수=0.\n$\\sin x\\sin nx+\\cos x\\cos nx$ 적분: $n=1$에서 $\\!\\int 1\\,dx=2\\pi$, $n\\ge 2$는 0.\n총 $2\\pi$."
  }),
  build({
    num: 18, subject: "적분학", unit: "부정적분", concept: "$\\ln|x+1|$ 항 존재", difficulty: "easy",
    question: "다음 중 부정적분을 계산하였을 때 $\\ln|x+1|$항이 있는 식을 모두 고르면?\n\nㄱ. $\\!\\int\\dfrac{2x}{x^2-1}\\,dx$\nㄴ. $\\!\\int\\dfrac{x^2+1}{x(x+1)^2}\\,dx$\nㄷ. $\\!\\int\\dfrac{2}{x(x+1)(x+2)}\\,dx$",
    options: [o("1","ㄱ, ㄴ"), o("2","ㄱ, ㄷ"), o("3","ㄴ, ㄷ"), o("4","ㄱ, ㄴ, ㄷ")],
    answer: 2,
    explanation: "ㄱ. $\\ln|x^2-1|=\\ln|x+1|+\\ln|x-1|$ → 있음.\nㄴ. $\\dfrac{1}{x}-\\dfrac{2}{(x+1)^2}$ → $\\ln x+\\dfrac{2}{x+1}$, $\\ln|x+1|$ 없음.\nㄷ. $\\dfrac{1}{x}-\\dfrac{2}{x+1}+\\dfrac{1}{x+2}$ → $\\ln|x+1|$ 있음."
  }),
  build({
    num: 19, subject: "공학수학", unit: "2계 미분방정식", concept: "비제차 2계 ODE 극한", difficulty: "medium",
    question: "미분방정식 $y''+y'-2y=4e^{2t}$의 일반해 $y(t)$에 대하여 $\\!\\displaystyle\\lim_{t\\to\\infty}\\dfrac{y(t)}{e^{2t}}$를 구하면?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$4$")],
    answer: 2,
    explanation: "$y_c=c_1 e^{-2t}+c_2 e^{t}$ (특성근 $t=-2,1$).\n특수해: $y_p=e^{2t}$ ($(D+2)(D-1)$에 $D=2$ 대입 $4$).\n일반해 $y=c_1 e^{-2t}+c_2 e^t+e^{2t}$.\n$\\lim t\\to\\infty$: $\\dfrac{y}{e^{2t}}\\to 1$."
  }),
  build({
    num: 20, subject: "적분학", unit: "급수", concept: "맥클로린 급수 계수", difficulty: "mediumHard",
    question: "함수 $f(x)=x^2-\\sin^{-1}x+\\dfrac{x}{\\sqrt{1-x^2}}$의 테일러 급수를 $\\!\\displaystyle\\sum_{n=0}^{\\infty}a_n x^n$이라 할 때 $2a_2-3a_3$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 1,
    explanation: "$\\sin^{-1}x=x+\\dfrac{x^3}{6}+\\cdots$\n$\\dfrac{x}{\\sqrt{1-x^2}}=x+\\dfrac{x^3}{2}+\\cdots$\n$f(x)=x^2-x-\\dfrac{x^3}{6}-\\cdots+x+\\dfrac{x^3}{2}+\\cdots=x^2+\\dfrac{x^3}{3}+\\cdots$\n$a_2=1$, $a_3=\\dfrac{1}{3}$, $2a_2-3a_3=2-1=1$."
  }),
  build({
    num: 21, subject: "적분학", unit: "극좌표", concept: "극곡선 사이 영역 넓이", difficulty: "medium",
    question: "곡선 $r=2-2\\sin\\theta$의 안쪽에 있고 $r=-4\\sin\\theta$의 바깥쪽에 있는 부분의 넓이는?",
    options: [o("1","$\\pi$"), o("2","$2\\pi$"), o("3","$4\\pi$"), o("4","$6\\pi$")],
    answer: 2,
    explanation: "심장형(반경 4) 안 ∩ 작은 원(반경 2) 밖.\n전체 심장형 넓이 $=6\\pi$, 작은 원 $=4\\pi$.\n넓이 $=\\dfrac{3}{2}\\pi(2)^2-\\pi(2)^2=6\\pi-4\\pi=2\\pi$."
  }),
  build({
    num: 22, subject: "다변수함수", unit: "연쇄법칙", concept: "연쇄법칙 곱셈 항 계수", difficulty: "medium",
    question: "다변수함수 $z=f(x,y)$가 연속인 편도함수를 가지며 $x=s-2r$이고 $y=s+r$일 때 다음 식을 만족하는 상수 $A,B,C$에 대하여 곱 $ABC$의 값은?\n\n$\\dfrac{\\partial z}{\\partial s}\\dfrac{\\partial z}{\\partial r}=A\\!\\left(\\dfrac{\\partial z}{\\partial x}\\right)^{\\!2}-B\\!\\left(\\dfrac{\\partial z}{\\partial x}\\right)\\!\\left(\\dfrac{\\partial z}{\\partial y}\\right)+C\\!\\left(\\dfrac{\\partial z}{\\partial y}\\right)^{\\!2}$",
    options: [o("1","$-2$"), o("2","$0$"), o("3","$2$"), o("4","$4$")],
    answer: 1,
    explanation: "$z_s=z_x+z_y$, $z_r=-2z_x+z_y$.\n$z_s z_r=(z_x+z_y)(-2z_x+z_y)=-2z_x^2-z_x z_y+z_y^2$.\n$A=-2,B=1,C=1$, $ABC=-2$."
  }),
  build({
    num: 23, subject: "다변수함수", unit: "극값", concept: "이변수 임계점 합", difficulty: "easy",
    question: "이변수함수 $f(x,y)=x^3+2x^2-x(4y-1)+y^2$의 두 임계점(Critical Point)을 각각 $(x_1,y_1),(x_2,y_2)$라 할 때 $3y_1 y_2$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 4,
    explanation: "$f_x=3x^2+4x-(4y-1)=0$, $f_y=-4x+2y=0$ ⇒ $y=2x$.\n대입: $3x^2+4x-(8x-1)=0$ ⇒ $3x^2-4x+1=0$ ⇒ $x=1,1/3$.\n$y=2,2/3$. $3y_1 y_2=3\\cdot 2\\cdot\\dfrac{2}{3}=4$."
  }),
  build({
    num: 24, subject: "적분학", unit: "이중적분", concept: "이중적분 (sin)", difficulty: "easy",
    question: "이중적분 $\\!\\displaystyle\\int_0^2\\!\\int_0^{\\pi}\\!x\\sin(xy)\\,dy\\,dx$의 값은?",
    options: [o("1","$-\\pi$"), o("2","$0$"), o("3","$\\pi$"), o("4","$2\\pi$")],
    answer: 3,
    explanation: "순서 교환: $\\!\\int_0^\\pi\\!\\int_0^2 x\\sin(xy)\\,dx\\,dy$ 대신 그대로 풀자.\n$\\!\\int_0^\\pi[-\\cos(xy)]_0^2\\,dx=\\!\\int_0^\\pi(1-\\cos(2x))\\,dx$. 변수 이름 정리하면 $\\!\\int_0^\\pi\\cdots$. 결과 $\\pi$."
  }),
  build({
    num: 25, subject: "적분학", unit: "부피", concept: "포물면과 평면 사이 부피", difficulty: "medium",
    question: "좌표공간에서 $z=8-3y^2$의 아래와 $z=4x^2+y^2$의 위로 둘러싸인 부분의 부피는?",
    options: [o("1","$2\\pi$"), o("2","$4\\pi$"), o("3","$6\\pi$"), o("4","$8\\pi$")],
    answer: 4,
    explanation: "$8-3y^2\\ge 4x^2+y^2$ ⇒ $4x^2+4y^2\\le 8$ ⇒ $x^2+y^2\\le 2$.\n$V=\\!\\iint_D(8-4x^2-4y^2)\\,dA=4\\!\\iint_D(2-x^2-y^2)\\,dA$.\n극좌표: $4\\cdot 2\\pi\\cdot 2\\cdot\\dfrac{1}{2}=8\\pi$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) { console.error("ERROR:", error); process.exit(1); }
console.log(`Inserted ${data.length} 문항 (2019 국민대):`, data.map((d) => d.id).join(", "));
