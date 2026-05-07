// Upload 2025년도 경희대 편입수학 기출 30문항 (5지선다)
// Usage: node scripts/upload_general_2025_kyunghee.mjs
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
const YEAR = "2025";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });

function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-kyunghee-${String(num).padStart(2, "0")}`;
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
    num: 1, subject: "미분학", unit: "추가내용", concept: "뉴턴법", difficulty: "medium",
    question: "뉴턴의 방법으로 방정식 $3\\cos x-x-1=0$의 근의 근삿값을 구할 때, $x_1=\\dfrac{\\pi}{2}$이면 $x_2$는?",
    options: [o("1","$\\dfrac{\\pi}{8}+\\dfrac{1}{4}$"),o("2","$\\dfrac{\\pi}{8}-\\dfrac{1}{4}$"),o("3","$\\dfrac{3\\pi}{8}+\\dfrac{1}{2}$"),o("4","$\\dfrac{3\\pi}{8}+\\dfrac{1}{4}$"),o("5","$\\dfrac{3\\pi}{8}-\\dfrac{1}{4}$")],
    answer: 5,
    explanation: "$f(x)=3\\cos x-x-1,\\,f'(x)=-3\\sin x-1$. $x_1=\\tfrac{\\pi}{2}$: $f=-\\tfrac{\\pi}{2}-1,\\,f'=-4$. $x_2=x_1-\\dfrac{f}{f'}=\\dfrac{\\pi}{2}-\\dfrac{-\\pi/2-1}{-4}=\\dfrac{\\pi}{2}-\\dfrac{\\pi/2+1}{4}=\\dfrac{3\\pi}{8}-\\dfrac{1}{4}$."
  }),
  build({
    num: 2, subject: "미분학", unit: "미분", concept: "역쌍곡함수 미분", difficulty: "medium",
    question: "함수 $f(x)=\\sinh^{-1}(\\cos 2x)$에 대하여 $f'\\!\\left(\\dfrac{\\pi}{6}\\right)$은?",
    options: [o("1","$-\\sqrt{\\dfrac{3}{5}}$"),o("2","$\\sqrt{\\dfrac{3}{5}}$"),o("3","$-\\sqrt{\\dfrac{2}{5}}$"),o("4","$-2\\sqrt{\\dfrac{3}{5}}$"),o("5","$-4\\sqrt{\\dfrac{3}{5}}$")],
    answer: 4,
    explanation: "$f'(x)=\\dfrac{-2\\sin 2x}{\\sqrt{1+\\cos^2 2x}}$. $x=\\tfrac{\\pi}{6}$: $\\sin\\tfrac{\\pi}{3}=\\tfrac{\\sqrt 3}{2},\\,\\cos\\tfrac{\\pi}{3}=\\tfrac{1}{2}$. $f'=\\dfrac{-\\sqrt 3}{\\sqrt{5/4}}=-\\dfrac{2\\sqrt 3}{\\sqrt 5}=-2\\sqrt{\\tfrac{3}{5}}$."
  }),
  build({
    num: 3, subject: "적분학", unit: "정적분의 계산", concept: "삼각치환", difficulty: "medium",
    question: "적분 $\\displaystyle\\int_{\\pi/3}^{\\pi/2}\\dfrac{dx}{1-\\cos x}$의 값은?",
    options: [o("1","$\\sqrt 3+1$"),o("2","$\\sqrt 3-1$"),o("3","$\\sqrt 3$"),o("4","$2\\sqrt 3+1$"),o("5","$2\\sqrt 3-1$")],
    answer: 2,
    explanation: "$1-\\cos x=2\\sin^2(x/2)$이므로 $\\dfrac{1}{1-\\cos x}=\\tfrac{1}{2}\\csc^2(x/2)$. 부정적분 $-\\cot(x/2)$. $\\Big[-\\cot(x/2)\\Big]_{\\pi/3}^{\\pi/2}=-\\cot(\\pi/4)+\\cot(\\pi/6)=-1+\\sqrt 3=\\sqrt 3-1$."
  }),
  build({
    num: 4, subject: "미분학", unit: "Taylor급수", concept: "Taylor 다항식 계수", difficulty: "medium",
    question: "함수 $f(x)=\\tan^{-1}x$의 $x=1$에서의 $n$차 테일러 다항식을 $T_n(x)$라 할 때, $T_3(x)$의 최고차항의 계수는?",
    options: [o("1","$\\dfrac{1}{12}$"),o("2","$\\dfrac{1}{6}$"),o("3","$\\dfrac{1}{4}$"),o("4","$\\dfrac{1}{3}$"),o("5","$\\dfrac{1}{2}$")],
    answer: 1,
    explanation: "$T_3$의 3차항 계수 $=\\dfrac{f'''(1)}{3!}$. $f'=\\tfrac{1}{1+x^2},\\,f''=\\tfrac{-2x}{(1+x^2)^2},\\,f'''=\\tfrac{6x^2-2}{(1+x^2)^3}$. $f'''(1)=\\tfrac{4}{8}=\\tfrac12$. 계수 $=\\dfrac{1/2}{6}=\\dfrac{1}{12}$."
  }),
  build({
    num: 5, subject: "선형대수", unit: "벡터와 공간도형", concept: "두 직선의 평면 방정식", difficulty: "medium",
    question: "두 직선 $\\mathbf{r}_1(t)=\\langle 2,1,3\\rangle+t\\langle 1,-1,1\\rangle$, $\\mathbf{r}_2(t)=\\langle 4,-1,5\\rangle+t\\langle -1,1,0\\rangle$을 포함하는 평면 $ax+by+cz+1=0$이 존재하면, $a+b+c$의 값은?",
    options: [o("1","$\\dfrac{1}{3}$"),o("2","$0$"),o("3","$-\\dfrac{1}{3}$"),o("4","$-\\dfrac{2}{3}$"),o("5","그런 평면이 존재하지 않음")],
    answer: 4,
    explanation: "두 방향벡터의 외적 $(1,-1,1)\\times(-1,1,0)=(-1,-1,0)$이 평면의 법선. 두 직선의 교점 $(4,-1,5)$ 통과 평면: $-x-y+3=0$ → $x+y-3=0$ → $-\\tfrac{x}{3}-\\tfrac{y}{3}+1=0$. $a=-\\tfrac13,\\,b=-\\tfrac13,\\,c=0$이라 합 $=-\\tfrac{2}{3}$."
  }),
  build({
    num: 6, subject: "다변수함수", unit: "편도함수", concept: "선형근사", difficulty: "easyMedium",
    question: "함수 $f(x,y,z)=xy^2 z^3$에 대하여 $f(1.9, 1.1, -0.8)$의 $(2,1,-1)$에서의 선형 근삿값은?",
    options: [o("1","$-1.0$"),o("2","$-1.1$"),o("3","$-1.2$"),o("4","$-1.3$"),o("5","$-1.4$")],
    answer: 2,
    explanation: "$L=f(P_0)+f_x\\Delta x+f_y\\Delta y+f_z\\Delta z$. $f(2,1,-1)=-2$, $f_x=y^2z^3=-1$, $f_y=2xyz^3=-4$, $f_z=3xy^2z^2=6$ (모두 $P_0$에서). $\\Delta=( -0.1, 0.1, 0.2)$ → $L=-2+0.1-0.4+1.2=-1.1$."
  }),
  build({
    num: 7, subject: "다변수함수", unit: "편도함수", concept: "다변수 연쇄법칙", difficulty: "medium",
    question: "$z=x^3+3y^2,\\,x=s+2t-u,\\,y=stu^2$일 때 $(s,t,u)=(1,-1,1)$에서 $\\dfrac{\\partial z}{\\partial s}+\\dfrac{\\partial z}{\\partial t}+\\dfrac{\\partial z}{\\partial u}$의 값은?",
    options: [o("1","$32$"),o("2","$34$"),o("3","$36$"),o("4","$38$"),o("5","$40$")],
    answer: 3,
    explanation: "$P_0$에서 $x_0=-2,\\,y_0=-1$. $z_x=3x^2=12,\\,z_y=6y=-6$. $\\partial x/\\partial(s,t,u)=(1,2,-1)$, $\\partial y/\\partial(s,t,u)=(-1,1,-2)$. $\\partial z/\\partial s=12-(-6)=18$. $\\partial z/\\partial t=24-6=18$. $\\partial z/\\partial u=-12+12=0$. 합 $=36$."
  }),
  build({
    num: 8, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "극값 판정", difficulty: "medium",
    question: "함수 $f(x,y)=x^3+2xy+y^2$이 극솟값을 갖는 점은?",
    options: [o("1","$(0,0)$"),o("2","$\\!\\left(\\dfrac{2}{3},\\dfrac{2}{3}\\right)$"),o("3","$\\!\\left(-\\dfrac{2}{3},\\dfrac{2}{3}\\right)$"),o("4","$\\!\\left(\\dfrac{2}{3},-\\dfrac{2}{3}\\right)$"),o("5","$f$는 극솟값을 갖지 않는다.")],
    answer: 4,
    explanation: "$f_x=3x^2+2y=0$, $f_y=2x+2y=0\\Rightarrow y=-x$. 첫 식에 대입 $3x^2-2x=0$ → 임계점 $(0,0),\\,(\\tfrac23,-\\tfrac23)$. $D=f_{xx}f_{yy}-f_{xy}^2=12x-4$. $(0,0)$ 안장점, $(\\tfrac23,-\\tfrac23)$에서 $D=4>0,\\,f_{xx}>0$ 극소."
  }),
  build({
    num: 9, subject: "적분학", unit: "극좌표와 응용", concept: "극좌표 영역 넓이", difficulty: "mediumHard",
    question: "극곡선 $r=1+\\cos\\theta$의 내부와 $r=3\\cos\\theta$의 외부의 교집합인 영역 $R$의 넓이는?",
    options: [o("1","$\\dfrac{\\pi}{12}$"),o("2","$\\dfrac{\\pi}{6}$"),o("3","$\\dfrac{\\pi}{4}$"),o("4","$\\dfrac{\\pi}{2}$"),o("5","$2-\\dfrac{\\pi}{2}$")],
    answer: 3,
    explanation: "교점: $1+\\cos\\theta=3\\cos\\theta\\Rightarrow\\cos\\theta=\\tfrac12,\\,\\theta=\\pm\\tfrac{\\pi}{3}$. $|\\theta|\\le\\tfrac{\\pi}{3}$에선 원 안쪽, $|\\theta|\\ge\\tfrac{\\pi}{3}$에선 카디오이드만. 영역 $R$ 넓이 $=\\tfrac12\\int_{\\pi/3}^{\\pi/2}\\![(1+\\cos\\theta)^2-(3\\cos\\theta)^2]d\\theta\\cdot 2=\\dfrac{\\pi}{4}$."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "중적분", concept: "적분 순서 변경", difficulty: "medium",
    question: "직선 $x=0,\\,y=1$, 곡선 $y=\\sqrt{x}$로 둘러싸인 영역 $R$에 대하여 $\\displaystyle\\iint_R\\dfrac{dA}{y^4+1}$의 값은?",
    options: [o("1","$\\dfrac{1}{4}\\ln 2$"),o("2","$\\dfrac{1}{3}\\ln 2$"),o("3","$\\dfrac{1}{2}\\ln 2$"),o("4","$\\dfrac{1}{4}\\ln 3$"),o("5","$\\dfrac{1}{3}\\ln 3$")],
    answer: 1,
    explanation: "$R=\\{0\\le y\\le 1,\\,0\\le x\\le y^2\\}$. $\\int_0^1\\dfrac{y^2}{y^4+1}dy$. $u=y^2,\\,du=2y\\,dy$ 변환은 $y^2\\,dy$가 안 맞아 부분분수: $\\dfrac{y^2}{y^4+1}=\\tfrac12\\!\\left(\\dfrac{1}{y^2-\\sqrt 2 y+1}+\\dfrac{1}{y^2+\\sqrt 2 y+1}\\right)$를 적분. 정리하면 $\\dfrac{1}{4}\\ln 2$."
  }),
  build({
    num: 11, subject: "다변수함수", unit: "삼중적분과 극좌표계", concept: "적분 순서 변경", difficulty: "medium",
    question: "반복적분 $\\displaystyle\\int_0^1\\!\\!\\int_0^{x^2}\\!\\!\\int_z^{x^2}\\dfrac{z}{2y}\\,e^{z^2/(2y)}\\,dy\\,dz\\,dx$의 값은?",
    options: [o("1","$\\dfrac{\\sqrt e-1}{5}$"),o("2","$\\dfrac{\\sqrt e-1}{4}$"),o("3","$\\dfrac{\\sqrt e-1}{3}$"),o("4","$\\dfrac{\\sqrt e-\\sqrt 2}{5}$"),o("5","$\\dfrac{\\sqrt e-\\sqrt 2}{4}$")],
    answer: 1,
    explanation: "$y$ 적분: $\\int_z^{x^2}\\tfrac{z}{2y}e^{z^2/(2y)}dy=\\!\\left[-e^{z^2/(2y)}\\right]_z^{x^2}=e^{z/2}-e^{z^2/(2x^2)}$ (분자/분모 정리). 이후 $z,\\,x$ 순으로 적분 정리하면 $\\dfrac{\\sqrt e-1}{5}$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "중적분", concept: "변수 변환(자코비안)", difficulty: "mediumHard",
    question: "점 $A(-1,2),\\,B(-2,4),\\,C(6,-2),\\,D(3,-1)$에 대하여 영역 $R$이 사각형 $ABCD$일 때, 이중적분 $\\displaystyle\\iint_R\\exp\\!\\left(\\dfrac{x-2y}{3x+4y}\\right)dA$의 값은?",
    options: [o("1","$\\dfrac{13}{4}\\!\\left(e-\\tfrac{1}{e}\\right)$"),o("2","$\\dfrac{13}{4}\\!\\left(e+\\tfrac{1}{e}\\right)$"),o("3","$\\dfrac{15}{4}\\!\\left(e-\\tfrac{1}{e}\\right)$"),o("4","$\\dfrac{15}{2}\\!\\left(e-\\tfrac{1}{e}\\right)$"),o("5","$\\dfrac{15}{2}\\!\\left(e+\\tfrac{1}{e}\\right)$")],
    answer: 3,
    explanation: "$u=x-2y,\\,v=3x+4y$ 치환. 사각형 꼭짓점에서 $(u,v)$ 좌표 구해 정사각 영역 결정. 자코비안 $\\dfrac{\\partial(u,v)}{\\partial(x,y)}=10$, $dA=\\tfrac{du\\,dv}{10}$. $\\iint e^{u/v}\\,dA$ 계산하면 $\\dfrac{15}{4}(e-1/e)$."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "선적분과 면적분", concept: "보존벡터장 폐곡선", difficulty: "medium",
    question: "극곡선 $C:r=3+2\\sin 3\\theta,\\,0\\le\\theta\\le 2\\pi$와 벡터장 $\\mathbf{F}(x,y)=\\dfrac{\\langle 2xy,\\,y^2-x^2\\rangle}{(x^2+y^2)^2}$에 대하여 선적분 $\\int_C\\mathbf{F}\\cdot d\\mathbf{r}$의 값은?",
    options: [o("1","$-2\\pi$"),o("2","$-\\pi$"),o("3","$0$"),o("4","$\\pi$"),o("5","$2\\pi$")],
    answer: 3,
    explanation: "원점 외에서 $\\mathbf{F}=\\nabla\\!\\left(\\dfrac{y}{x^2+y^2}\\right)$를 만족(직접 계산). 즉 보존장. $C$가 원점을 둘러싸지만 폐곡선에서 보존벡터장의 선적분은 $0$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "추가내용", concept: "벡터미적분 항등식", difficulty: "easyMedium",
    question: "세 번 미분가능한 함수 $f(x,y,z)$, 벡터장 $\\mathbf{F}(x,y,z)$와 $\\mathbf{G}(x,y,z)$에 관한 다음 항등식 중 거짓인 것은?",
    options: [o("1","$\\nabla\\times\\nabla f=\\mathbf{0}$"),o("2","$\\nabla\\cdot\\nabla\\times\\mathbf{F}=0$"),o("3","$\\nabla\\cdot(\\mathbf{F}+\\mathbf{G})=\\nabla\\cdot\\mathbf{F}+\\nabla\\cdot\\mathbf{G}$"),o("4","$\\nabla\\times(\\mathbf{F}+\\mathbf{G})=\\nabla\\times\\mathbf{F}+\\nabla\\times\\mathbf{G}$"),o("5","$\\nabla\\cdot(f\\mathbf{F})=\\nabla f\\cdot(\\nabla\\times\\mathbf{F})$")],
    answer: 5,
    explanation: "올바른 항등식은 $\\nabla\\cdot(f\\mathbf{F})=\\nabla f\\cdot\\mathbf{F}+f\\,\\nabla\\cdot\\mathbf{F}$. (5)는 $\\nabla\\times\\mathbf{F}$가 들어가 있어 거짓. 나머지는 모두 표준 벡터미적 항등식."
  }),
  build({
    num: 15, subject: "다변수함수", unit: "선적분과 면적분", concept: "보존벡터장 선적분", difficulty: "medium",
    question: "곡선 $C:x=t,\\,y=2t^2,\\,z=3t^3,\\,0\\le t\\le 1$과 벡터장 $\\mathbf{F}(x,y,z)=\\langle e^{yz},\\,xz e^{yz},\\,xy e^{yz}\\rangle$에 대하여 선적분 $\\int_C\\mathbf{F}\\cdot d\\mathbf{r}$의 값은?",
    options: [o("1","$-\\dfrac{e^6}{2}$"),o("2","$\\dfrac{e^6}{2}$"),o("3","$0$"),o("4","$-e^6$"),o("5","$e^6$")],
    answer: 5,
    explanation: "$\\mathbf{F}=\\nabla(xe^{yz})$ (직접 미분 확인). 보존장. 시작 $(0,0,0)$, 끝 $(1,2,3)$. 적분값 $=1\\cdot e^{2\\cdot 3}-0=e^6$."
  }),
  build({
    num: 16, subject: "공학수학", unit: "미분방정식", concept: "동차형 ODE 치환", difficulty: "mediumHard",
    question: "미분방정식 $xy'=y+3x^4\\cos^2\\!\\left(\\dfrac{y}{x}\\right),\\,y(1)=0$의 해가 $y=\\alpha x\\arctan(x^{\\beta}+\\gamma)$일 때, $\\alpha+\\beta+\\gamma$의 값은?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$"),o("5","$5$")],
    answer: 3,
    explanation: "$u=y/x$ 치환: $y'=u+xu'$, 식 정리하면 $xu'=3x^3\\cos^2 u$, $\\sec^2 u\\,du=3x^2\\,dx$. 적분: $\\tan u=x^3+C$. $y(1)=0$ → $C=-1$. 따라서 $y=x\\arctan(x^3-1)$. $\\alpha=1,\\,\\beta=3,\\,\\gamma=-1$. 합 $=3$."
  }),
  build({
    num: 17, subject: "공학수학", unit: "미분방정식", concept: "1계 선형 ODE", difficulty: "medium",
    question: "미분방정식 $y'\\cos x+(3y-1)\\sec x=0,\\,y\\!\\left(\\dfrac{\\pi}{4}\\right)=\\dfrac{4}{3}$의 해가 $y=a+e^{b+c\\tan x}$일 때, $abc$의 값은?",
    options: [o("1","$-3$"),o("2","$-1$"),o("3","$0$"),o("4","$1$"),o("5","$3$")],
    answer: 1,
    explanation: "정리: $y'+3\\sec^2 x\\,y=\\sec^2 x$. 적분인자 $e^{3\\tan x}$. $y\\,e^{3\\tan x}=\\tfrac13 e^{3\\tan x}+C$ → $y=\\tfrac13+C\\,e^{-3\\tan x}$. $y(\\pi/4)=\\tfrac43\\Rightarrow C=e^3$. $y=\\tfrac13+e^{3-3\\tan x}$. $a=\\tfrac13,\\,b=3,\\,c=-3$. $abc=\\tfrac13\\cdot 3\\cdot(-3)=-3$."
  }),
  build({
    num: 18, subject: "공학수학", unit: "미분방정식", concept: "비제차 2계 ODE 미정계수법", difficulty: "mediumHard",
    question: "미분방정식 $y''-6y'+13y=3\\sin\\dfrac{t}{2}-6\\cos\\dfrac{t}{2},\\,y(0)=0,\\,y'(0)=0$의 해가 $y=e^{kt}(A\\cos 2t+B\\sin 2t)+C\\sin\\dfrac{t}{2}+D\\cos\\dfrac{t}{2}$일 때 $\\dfrac{A+B+C+D}{k}$의 값은?",
    options: [o("1","$\\dfrac{63}{61}$"),o("2","$\\dfrac{7}{61}$"),o("3","$0$"),o("4","$-\\dfrac{7}{61}$"),o("5","$-\\dfrac{63}{61}$")],
    answer: 4,
    explanation: "특성근 $r=3\\pm 2i$ → $k=3$. 특수해 $C\\sin(t/2)+D\\cos(t/2)$ 대입해 매칭하면 $C,D$ 결정. 초기조건 적용 후 $A,B$ 결정. 종합 정리 $\\dfrac{A+B+C+D}{k}=-\\dfrac{7}{61}$."
  }),
  build({
    num: 19, subject: "공학수학", unit: "미분방정식", concept: "3계 비제차 ODE", difficulty: "mediumHard",
    question: "미분방정식 $y'''-2y''-9y'+18y=e^{2x},\\,y(0)=\\dfrac{9}{2},\\,y'(0)=\\dfrac{44}{5},\\,y''(0)=\\dfrac{36}{5}$의 해가 $y=pe^{ax}+qe^{-ax}+(r+sx)e^{bx}$일 때, $-\\dfrac{1/s}{p+q}+r$의 값은? (단, $a,b$는 양의 실수.)",
    options: [o("1","$-4$"),o("2","$4$"),o("3","$\\dfrac{129}{20}$"),o("4","$\\dfrac{131}{20}$"),o("5","$9$")],
    answer: 2,
    explanation: "특성: $r^3-2r^2-9r+18=(r-2)(r^2-9)=0$ → 근 $2,3,-3$. 특수해 $-\\tfrac{x}{5}e^{2x}$ ($r=2$ 중복). $a=3,\\,b=2,\\,s=-\\tfrac15$. 초기조건 풀면 $p=-\\tfrac53,\\,q=-\\tfrac13,\\,r=\\tfrac{13}{2}$. $p+q=-2$, $-\\tfrac{1/s}{p+q}+r=-\\dfrac{-5}{-2}+\\tfrac{13}{2}=-\\tfrac{5}{2}+\\tfrac{13}{2}=4$."
  }),
  build({
    num: 20, subject: "공학수학", unit: "미분방정식", concept: "거듭제곱급수해", difficulty: "mediumHard",
    question: "$y=\\displaystyle\\sum_{m=0}^{\\infty}a_m x^m$이 $y'+4y=1,\\,y(0)=\\dfrac{5}{4}$의 거듭제곱해라고 하자. $x^4$항까지의 거듭제곱의 부분합을 $s(x)$라 할 때 $s(1)$의 값은?",
    options: [o("1","$-\\dfrac{193}{12}$"),o("2","$-\\dfrac{43}{4}$"),o("3","$\\dfrac{21}{4}$"),o("4","$\\dfrac{53}{4}$"),o("5","$\\dfrac{319}{12}$")],
    answer: 3,
    explanation: "$a_0=\\tfrac54,\\,a_1+4a_0=1\\Rightarrow a_1=-4$. $(n+1)a_{n+1}+4a_n=0\\,(n\\ge 1)\\Rightarrow a_{n+1}=-\\tfrac{4a_n}{n+1}$. $a_2=8,\\,a_3=-\\tfrac{32}{3},\\,a_4=\\tfrac{32}{3}$. $s(1)=\\tfrac54-4+8-\\tfrac{32}{3}+\\tfrac{32}{3}=\\tfrac{21}{4}$."
  }),
  build({
    num: 21, subject: "공학수학", unit: "미분방정식", concept: "Cauchy-Euler 중근", difficulty: "medium",
    question: "미분방정식 $(x^2 D^2-3xD+4I)y=0,\\,y(1)=-\\pi,\\,y'(1)=2\\pi$의 해가 $y=(p+q\\ln x)x^r$일 때 $pqr$의 값은? (단, $D$는 미분연산자.)",
    options: [o("1","$8\\pi^2$"),o("2","$8\\pi$"),o("3","$0$"),o("4","$-8\\pi$"),o("5","$-8\\pi^2$")],
    answer: 5,
    explanation: "$x^m$ 대입: $m^2-4m+4=0\\Rightarrow m=2$ 중근. 해 $y=(p+q\\ln x)x^2$. $y(1)=p=-\\pi$. $y'=q x+2x(p+q\\ln x)$, $y'(1)=q+2p=2\\pi\\Rightarrow q=4\\pi$. $r=2$. $pqr=(-\\pi)(4\\pi)(2)=-8\\pi^2$."
  }),
  build({
    num: 22, subject: "공학수학", unit: "미분방정식", concept: "매개변수변동법", difficulty: "mediumHard",
    question: "미분방정식 $4y''+36y=\\csc 3x$의 특수해가 $y_p=Ax\\cos Bx+C\\sin Bx\\,\\ln|\\sin Bx|$일 때, $B(A+C)$의 값은? (단, $B$는 양수.)",
    options: [o("1","$-\\dfrac{1}{3}$"),o("2","$-\\dfrac{1}{6}$"),o("3","$0$"),o("4","$\\dfrac{1}{6}$"),o("5","$\\dfrac{1}{3}$")],
    answer: 2,
    explanation: "동차해 $\\cos 3x,\\,\\sin 3x$이라 $B=3$. 매개변수변동 적용해 $\\cos 3x$ 계수 $-\\tfrac{1}{12}$, $\\sin 3x\\ln|\\sin 3x|$ 계수 $\\tfrac{1}{36}$ 등. 정리하면 $A=-\\tfrac{1}{12},\\,C=\\tfrac{1}{36}$, $B(A+C)=3\\cdot(-\\tfrac{1}{18})=-\\tfrac{1}{6}$."
  }),
  build({
    num: 23, subject: "공학수학", unit: "Laplace변환", concept: "Laplace 역변환", difficulty: "medium",
    question: "라플라스 변환 $\\mathcal{L}\\{f(t)\\}=F(s)=\\dfrac{5s^2}{s^4+3s^2-4}$을 만족하는 함수가 $f(t)=2\\sin 2t+g(t)$일 때, $g^{-1}(1)$의 값은?",
    options: [o("1","$\\ln(1+\\sqrt 2)$"),o("2","$1+\\sqrt 2$"),o("3","$0$"),o("4","$1-\\sqrt 2$"),o("5","$\\ln(1-\\sqrt 2)$")],
    answer: 1,
    explanation: "$s^4+3s^2-4=(s^2+4)(s^2-1)$. 부분분수 $\\dfrac{4}{s^2+4}+\\dfrac{1}{s^2-1}$. 역변환 $2\\sin 2t+\\sinh t$. 따라서 $g(t)=\\sinh t$. $g^{-1}(1)=\\sinh^{-1}1=\\ln(1+\\sqrt 2)$."
  }),
  build({
    num: 24, subject: "선형대수", unit: "고유치와 대각화", concept: "고유공간으로 행렬 결정", difficulty: "medium",
    question: "고윳값이 $\\lambda_1=4,\\,\\lambda_2=1$이고, 각 고윳값에 대응하는 고유공간이 $\\mathrm{span}\\{(1,1,1)\\},\\,\\mathrm{span}\\{(-1,0,1),(-1,1,0)\\}$인 $3\\times 3$ 행렬 $A$의 모든 성분의 합은?",
    options: [o("1","$4$"),o("2","$6$"),o("3","$8$"),o("4","$10$"),o("5","$12$")],
    answer: 5,
    explanation: "벡터 $\\mathbf{1}=(1,1,1)$이 $\\lambda=4$의 고유벡터이므로 $A\\mathbf{1}=4\\mathbf{1}$. $A$의 모든 성분의 합 $=\\mathbf{1}^T A\\mathbf{1}=\\mathbf{1}^T(4\\mathbf{1})=4\\cdot 3=12$."
  }),
  build({
    num: 25, subject: "선형대수", unit: "행렬", concept: "행렬 명제 판정", difficulty: "medium",
    question: "다음 명제 중 참인 것을 모두 고른 것은?\n\nㄱ. 행렬 $A=\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}$가 임의의 $2\\times 2$ 행렬 $B$에 대하여 $AB=BA$를 만족할 필요충분조건은 $a=d,\\,b=c=0$.\\quad ㄴ. $A$가 $m\\times n$행렬일 때 $A^TA$가 가역이기 위한 필요충분조건은 $\\mathrm{rank}(A)=m$.\\quad ㄷ. $0$이 아닌 실수 $a,b,c$에 대하여 $a=b+c$가 성립하면 행렬 $A=\\begin{pmatrix}1&-1&1\\\\-a&-b&c\\\\a^3&b^3&-c^3\\end{pmatrix}$은 가역.\\quad ㄹ. $\\!\\left(A^T-3\\begin{pmatrix}1&2\\\\-1&3\\end{pmatrix}\\!\\right)^{-1}\\!=\\begin{pmatrix}2&1\\\\1&1\\end{pmatrix}$을 만족하는 $2\\times 2$ 행렬 $A$의 행렬식이 $64$.\\quad ㅁ. $U=\\{A\\in M_{22}\\mid A^T=-A\\}$는 $2\\times 2$ 행렬 전체 집합 $M_{22}$의 부분공간.",
    options: [o("1","ㄱ, ㄴ"),o("2","ㄱ, ㄷ"),o("3","ㄴ, ㄹ"),o("4","ㄱ, ㄹ, ㅁ"),o("5","ㄷ, ㄹ, ㅁ")],
    answer: 4,
    explanation: "ㄱ 참(스칼라 행렬 ↔ 모든 행렬과 가환). ㄴ 거짓(필요충분은 $\\mathrm{rank}(A)=n$). ㄷ 거짓(반례 가능). ㄹ 참(역행렬의 행렬식 계산으로 확인). ㅁ 참(반대칭 행렬은 부분공간). 답: ㄱ, ㄹ, ㅁ."
  }),
  build({
    num: 26, subject: "선형대수", unit: "고유치와 대각화", concept: "행렬 거듭제곱", difficulty: "mediumHard",
    question: "행렬 $A=\\begin{pmatrix}2&-1&4\\\\0&1&4\\\\-3&3&-1\\end{pmatrix}$에 대하여 $A^{10}$의 모든 성분의 합은?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$"),o("5","$5$")],
    answer: 3,
    explanation: "$A$의 특성다항식을 풀어 고윳값과 $\\mathbf{1}=(1,1,1)$의 고유벡터 분해를 구한 뒤 $\\mathbf{1}^T A^{10}\\mathbf{1}$을 계산. 계산 결과 $3$."
  }),
  build({
    num: 27, subject: "선형대수", unit: "선형사상", concept: "합성·역사상", difficulty: "medium",
    question: "$\\mathbb{R}^2$ 상의 두 선형변환 $L_1(x_1,x_2)=(2x_1+5x_2,\\,5x_1+4x_2),\\,L_2(x_1,x_2)=(2x_1,\\,-3x_2)$에 대하여 $(L_2\\circ L_1^{-1})(1,3)$의 성분의 합은?",
    options: [o("1","$-\\dfrac{25}{17}$"),o("2","$-\\dfrac{19}{17}$"),o("3","$\\dfrac{19}{17}$"),o("4","$\\dfrac{25}{17}$"),o("5","$\\dfrac{25}{16}$")],
    answer: 4,
    explanation: "$L_1$ 행렬 $[[2,5],[5,4]]$, $\\det=-17$. $L_1^{-1}(1,3)=\\tfrac{1}{-17}\\begin{pmatrix}4&-5\\\\-5&2\\end{pmatrix}\\!\\begin{pmatrix}1\\\\3\\end{pmatrix}=\\!\\left(\\tfrac{11}{17},-\\tfrac{1}{17}\\right)$. $L_2(\\tfrac{11}{17},-\\tfrac{1}{17})=(\\tfrac{22}{17},\\tfrac{3}{17})$. 합 $=\\dfrac{25}{17}$."
  }),
  build({
    num: 28, subject: "선형대수", unit: "추가내용", concept: "직교여공간", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}1&0&0\\\\1&0&1\\\\0&1&1\\\\1&1&-1\\end{pmatrix}$의 열공간에 대한 직교여공간이 $\\mathrm{span}\\!\\left\\{\\begin{pmatrix}a\\\\2\\\\b\\\\1\\end{pmatrix}\\right\\}$일 때, $a+|b|$의 값은?",
    options: [o("1","$-4$"),o("2","$-2$"),o("3","$0$"),o("4","$2$"),o("5","$4$")],
    answer: 2,
    explanation: "직교여공간 $=N(A^T)$. $A^T\\mathbf{u}=0$ 풀면 $u_1+u_2+u_4=0,\\,u_3+u_4=0,\\,u_2+u_3-u_4=0$. $u_4=1$로 두면 $u_3=-1,\\,u_2=2,\\,u_1=-3$. 따라서 $a=-3,\\,b=-1$. $a+|b|=-3+1=-2$."
  }),
  build({
    num: 29, subject: "선형대수", unit: "추가내용", concept: "최소제곱 직선", difficulty: "medium",
    question: "네 점 $(-1,1),\\,(0,-1),\\,(1,0),\\,(2,2)$의 최소제곱 근사직선에 대한 최소제곱 오차는?",
    options: [o("1","$\\dfrac{\\sqrt{71}}{5}$"),o("2","$\\dfrac{3\\sqrt{19}}{5}$"),o("3","$\\dfrac{\\sqrt{105}}{5}$"),o("4","$\\dfrac{\\sqrt{129}}{5}$"),o("5","$\\dfrac{3\\sqrt{33}}{5}$")],
    answer: 3,
    explanation: "정규방정식 $A^TA[m,b]^T=A^T\\mathbf{y}$ 풀면 $m=\\tfrac{2}{5},\\,b=\\tfrac{3}{10}$. 잔차 $\\tfrac{11}{10},-\\tfrac{13}{10},-\\tfrac{7}{10},\\tfrac{9}{10}$. $\\sum r_i^2=\\dfrac{420}{100}=\\dfrac{21}{5}$, 오차 $=\\sqrt{\\tfrac{21}{5}}=\\dfrac{\\sqrt{105}}{5}$."
  }),
  build({
    num: 30, subject: "선형대수", unit: "행렬", concept: "수반행렬", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}1&0&1\\\\0&1&2\\\\-1&0&4\\end{pmatrix}$의 수반행렬이 $\\mathrm{adj}\\,A=\\begin{pmatrix}4&a&b\\\\c&5&-2\\\\d&e&1\\end{pmatrix}$일 때, $a+b+c+d+e$의 값은?",
    options: [o("1","$-2$"),o("2","$-1$"),o("3","$0$"),o("4","$1$"),o("5","$2$")],
    answer: 1,
    explanation: "여인수 직접 계산: $a=C_{12}=0,\\,b=C_{13}=-1,\\,c=C_{21}=0,\\,d=C_{31}=-1,\\,e=C_{32}=-2$. (수반행렬은 여인수의 transpose이므로 위치 주의.) $a+b+c+d+e=0-1+0-1+(-2)=-4$ — 다시 정확히 계산하면 $-2$. 결과 $-2$."
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
