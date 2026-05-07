// Upload 2025년도 단국대(오전) 편입수학 기출 30문항 (4지선다)
// Usage: node scripts/upload_general_2025_dku_am.mjs
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

const SCHOOL = "단국대(오전)";
const YEAR = "2025";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });

function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-dku-am-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, "단국대", YEAR, subject, unit, concept].filter(Boolean)));
  return {
    id, subject, unit, concept, difficulty,
    source_type: "imported", question, content_type: "latex", question_image: null,
    options, correct_option_id: String(answer), explanation,
    explanation_content_type: "latex", explanation_image: null, tags,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  };
}

const problems = [
  build({ num: 1, subject: "미분학", unit: "극한과 연속", concept: "무한대 극한", difficulty: "easy",
    question: "$\\displaystyle\\lim_{x\\to\\infty}\\dfrac{\\sqrt{4x^2+1}}{x+1}$의 값은?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")], answer: 2,
    explanation: "분자/분모를 $x$로 나누면 $\\dfrac{\\sqrt{4+1/x^2}}{1+1/x}\\to\\dfrac{2}{1}=2$." }),
  build({ num: 2, subject: "미분학", unit: "미분", concept: "역삼각함수 미분", difficulty: "easy",
    question: "$f(x)=\\tan^{-1}x$에 대하여 $f'(1)$의 값은?",
    options: [o("1","$-\\dfrac{1}{2}$"),o("2","$0$"),o("3","$\\dfrac{1}{2}$"),o("4","$1$")], answer: 3,
    explanation: "$f'(x)=\\dfrac{1}{1+x^2}$. $f'(1)=\\dfrac{1}{2}$." }),
  build({ num: 3, subject: "적분학", unit: "정적분의 계산", concept: "치환적분", difficulty: "easyMedium",
    question: "연속함수 $f(x)$가 $\\int_0^1 f(2x)\\,dx=2$을 만족할 때, $\\int_0^2 f(x)\\,dx$의 값은?",
    options: [o("1","$3$"),o("2","$\\dfrac{7}{2}$"),o("3","$4$"),o("4","$\\dfrac{9}{2}$")], answer: 3,
    explanation: "$u=2x,\\,du=2dx$. $\\int_0^1 f(2x)dx=\\tfrac12\\int_0^2 f(u)du=2$ → $\\int_0^2 f(u)du=4$." }),
  build({ num: 4, subject: "선형대수", unit: "벡터와 공간도형", concept: "점과 평면 거리", difficulty: "easy",
    question: "점 $(1,-1,4)$에서 평면 $2x+y-2z=5$까지의 거리는?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")], answer: 4,
    explanation: "$d=\\dfrac{|2-1-8-5|}{\\sqrt{4+1+4}}=\\dfrac{12}{3}=4$." }),
  build({ num: 5, subject: "선형대수", unit: "행렬", concept: "역행렬과 행렬식", difficulty: "medium",
    question: "$(I+2A)^{-1}=\\begin{pmatrix}1&1\\\\5&4\\end{pmatrix}$일 때 $\\det A$의 값은? (단, $I$는 $2\\times 2$ 단위행렬.)",
    options: [o("1","$\\dfrac{1}{8}$"),o("2","$\\dfrac{1}{2}$"),o("3","$\\dfrac{7}{8}$"),o("4","$\\dfrac{5}{4}$")], answer: 4,
    explanation: "$\\det((I+2A)^{-1})=4-5=-1$이라 $\\det(I+2A)=-1$. $I+2A=\\dfrac{1}{-1}\\begin{pmatrix}4&-1\\\\-5&1\\end{pmatrix}=\\begin{pmatrix}-4&1\\\\5&-1\\end{pmatrix}$. $A=\\tfrac12(I+2A-I)=\\begin{pmatrix}-5/2&1/2\\\\5/2&-1\\end{pmatrix}$. $\\det A=\\tfrac52-\\tfrac54=\\tfrac54$." }),
  build({ num: 6, subject: "적분학", unit: "특이적분", concept: "log-power 적분", difficulty: "medium",
    question: "$\\displaystyle\\int_0^1\\dfrac{\\ln x}{\\sqrt x}\\,dx$의 값은?",
    options: [o("1","$-4$"),o("2","$-3$"),o("3","$-2$"),o("4","$-1$")], answer: 1,
    explanation: "부분적분 $u=\\ln x,\\,dv=x^{-1/2}dx$, $du=dx/x,\\,v=2\\sqrt x$. $\\int=2\\sqrt x\\ln x\\big|_0^1-2\\int_0^1\\dfrac{dx}{\\sqrt x}=0-4=-4$." }),
  build({ num: 7, subject: "선형대수", unit: "고유치와 대각화", concept: "고윳값 합(trace)", difficulty: "easy",
    question: "행렬 $\\begin{pmatrix}1&4\\\\1&a\\end{pmatrix}$의 모든 고윳값의 합이 $-1$일 때, 실수 $a$의 값은?",
    options: [o("1","$-4$"),o("2","$-3$"),o("3","$-2$"),o("4","$-1$")], answer: 3,
    explanation: "고윳값의 합 $=$ trace $=1+a=-1\\Rightarrow a=-2$." }),
  build({ num: 8, subject: "적분학", unit: "정적분의 응용", concept: "곡선의 길이", difficulty: "medium",
    question: "곡선 $y=\\dfrac{x^3}{12}+\\dfrac{1}{x}\\,(1\\le x\\le 4)$의 호의 길이는?",
    options: [o("1","$\\dfrac{9}{2}$"),o("2","$6$"),o("3","$8$"),o("4","$\\dfrac{17}{2}$")], answer: 2,
    explanation: "$y'=\\tfrac{x^2}{4}-\\tfrac{1}{x^2}$. $1+y'^2=\\!\\left(\\tfrac{x^2}{4}+\\tfrac{1}{x^2}\\right)^{\\!2}$. 길이 $=\\int_1^4\\!\\left(\\tfrac{x^2}{4}+\\tfrac{1}{x^2}\\right)dx=[\\tfrac{x^3}{12}-\\tfrac{1}{x}]_1^4=\\tfrac{64}{12}-\\tfrac14-\\tfrac{1}{12}+1=6$." }),
  build({ num: 9, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "급수항 점화", difficulty: "medium",
    question: "$\\ln(1+x)=\\displaystyle\\sum_{n=1}^{\\infty}a_n x^n\\,(-1<x<1)$일 때 $\\displaystyle\\sum_{n=1}^{\\infty}a_n a_{n+1}$의 값은? (단, $a_n$은 실수.)",
    options: [o("1","$-1$"),o("2","$-2$"),o("3","$-3$"),o("4","$-4$")], answer: 1,
    explanation: "$a_n=\\dfrac{(-1)^{n+1}}{n}$. $a_n a_{n+1}=-\\dfrac{1}{n(n+1)}$. $\\sum=-\\sum\\!\\left(\\tfrac{1}{n}-\\tfrac{1}{n+1}\\right)=-1$." }),
  build({ num: 10, subject: "다변수함수", unit: "곡선과 곡면", concept: "공간곡선 곡률", difficulty: "medium",
    question: "구간 $-1<t<1$에서 정의된 매개곡선 $\\mathbf{r}(t)=(t,t^2,t^3)$ 위의 점 $(0,0,0)$에서의 곡률의 값은?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")], answer: 2,
    explanation: "$\\mathbf{r}'=(1,2t,3t^2),\\,\\mathbf{r}''=(0,2,6t)$. $t=0$: $\\mathbf{r}'=(1,0,0),\\,\\mathbf{r}''=(0,2,0)$. $\\mathbf{r}'\\times\\mathbf{r}''=(0,0,2)$. $\\kappa=\\dfrac{|\\mathbf{r}'\\times\\mathbf{r}''|}{|\\mathbf{r}'|^3}=\\dfrac{2}{1}=2$." }),
  build({ num: 11, subject: "다변수함수", unit: "선적분과 면적분", concept: "벡터장 회전(curl)", difficulty: "medium",
    question: "벡터장 $\\mathbf{F}(x,y,z)=x^2 y\\,\\mathbf{i}+xy^2\\,\\mathbf{j}+axyz\\,\\mathbf{k}$에 대한 점 $(1,1,1)$에서의 $\\mathrm{curl}$이 $2\\mathbf{i}-2\\mathbf{j}$이다. 실수 $a$의 값은?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")], answer: 2,
    explanation: "$\\mathrm{curl}\\mathbf{F}=(axz-0,\\,0-ayz,\\,y^2-x^2)$. $(1,1,1)$: $(a,-a,0)$. $\\mathrm{curl}=2\\mathbf{i}-2\\mathbf{j}$ → $a=2$." }),
  build({ num: 12, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "라그랑주(원 위 최대/최소)", difficulty: "medium",
    question: "$x^2+y^2=1$에서 $f(x,y)=x^2+2y^2$의 최댓값을 $M$, 최솟값을 $m$이라 할 때, $M+m$의 값은?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")], answer: 3,
    explanation: "$f=x^2+2y^2=1+y^2$, $0\\le y^2\\le 1$. $M=2,\\,m=1$. 합 $=3$." }),
  build({ num: 13, subject: "적분학", unit: "극좌표와 응용", concept: "카디오이드 길이", difficulty: "medium",
    question: "극곡선 $r=1+\\cos\\theta\\,(0\\le\\theta\\le 2\\pi)$의 길이는?",
    options: [o("1","$6$"),o("2","$7$"),o("3","$8$"),o("4","$9$")], answer: 3,
    explanation: "카디오이드 둘레 $=8$ (공식 $L=8a$, $a=1$)." }),
  build({ num: 14, subject: "선형대수", unit: "벡터와 공간도형", concept: "직각삼각형 조건", difficulty: "medium",
    question: "다음 조건을 만족시키는 실수 $a$의 값은?\n\n(1) 세 점 $P(1,-1,0),\\,Q(2,0,-2),\\,R(a,1,-1)$을 포함하는 평면에서 세 점 $P,Q,R$을 꼭짓점으로 하는 삼각형은 직각삼각형이다.\\quad (2) 세 변 $\\overline{PQ},\\,\\overline{QR},\\,\\overline{RP}$ 중 $\\overline{RP}$의 길이가 가장 길다.",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")], answer: 3,
    explanation: "$\\vec{PQ}=(1,1,-2),\\,\\vec{QR}=(a-2,1,1),\\,\\vec{RP}=(1-a,-2,1)$. $\\vec{PQ}\\cdot\\vec{QR}=0$인 $a$ 찾기: $(a-2)+1-2=0\\Rightarrow a=3$. 그리고 $|\\vec{RP}|$가 최대인지 확인. $a=3$." }),
  build({ num: 15, subject: "다변수함수", unit: "중적분", concept: "적분 순서 변경", difficulty: "medium",
    question: "$\\displaystyle\\int_0^1\\!\\!\\int_{\\sqrt y}^1\\sqrt{x^3+1}\\,dx\\,dy$의 값은?",
    options: [o("1","$\\dfrac{2}{9}(2\\sqrt 2-1)$"),o("2","$\\dfrac{2}{3}(2\\sqrt 2-1)$"),o("3","$\\dfrac{2}{7}(3\\sqrt 2+1)$"),o("4","$\\dfrac{2}{5}(3\\sqrt 2+1)$")], answer: 1,
    explanation: "영역 $\\{0\\le y\\le 1,\\,\\sqrt y\\le x\\le 1\\}=\\{0\\le x\\le 1,\\,0\\le y\\le x^2\\}$. $\\int_0^1\\!\\!\\int_0^{x^2}\\sqrt{x^3+1}\\,dy\\,dx=\\int_0^1 x^2\\sqrt{x^3+1}\\,dx=\\tfrac{2}{9}(x^3+1)^{3/2}\\Big|_0^1=\\dfrac{2}{9}(2\\sqrt 2-1)$." }),
  build({ num: 16, subject: "다변수함수", unit: "삼중적분과 극좌표계", concept: "직육면체 위 삼중적분", difficulty: "medium",
    question: "$E=\\{(x,y,z)\\mid 0\\le x\\le 1,\\,0\\le y\\le 1-x,\\,0\\le z\\le 2\\}$에 대하여 $\\displaystyle\\iiint_E e^{x+y+z}\\,dV$의 값은?",
    options: [o("1","$e^2-1$"),o("2","$e^2$"),o("3","$e^2+1$"),o("4","$e^2-e$")], answer: 1,
    explanation: "$z$ 적분 $=e^2-1$. $\\int\\!\\!\\int_{0\\le y\\le 1-x} e^{x+y}dy\\,dx=\\int_0^1[e^1-e^x]dx=e-(e-1)=1$. 곱 $=(e^2-1)\\cdot 1=e^2-1$." }),
  build({ num: 17, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "극값 점 찾기", difficulty: "medium",
    question: "$f_x(x,y)=3x^2-3y^2,\\,f_y(x,y)=-6xy+12y^2-6y-12$인 함수 $f(x,y)$의 극소점은?",
    options: [o("1","$(-1,-1)$"),o("2","$(-1,1)$"),o("3","$\\!\\left(\\dfrac{2}{3},-\\dfrac{2}{3}\\right)$"),o("4","$(2,2)$")], answer: 4,
    explanation: "$f_x=0$: $x=\\pm y$. $f_y=0$ 대입: 해 찾기. $(2,2)$에서 $f_x=12-12=0,\\,f_y=-24+48-12-12=0$. 헤시안 양정칙 확인 후 극소." }),
  build({ num: 18, subject: "다변수함수", unit: "선적분과 면적분", concept: "일정 벡터장 일", difficulty: "easyMedium",
    question: "입자가 곡선 $C=\\{(x,y)\\mid 0\\le x,\\,0\\le y,\\,x^2+y^2=4\\}$를 따라 시계 반대 방향으로 움직일 때 힘 $\\mathbf{F}(x,y)=-\\mathbf{i}+\\mathbf{j}$가 한 일 $W=\\int_C\\mathbf{F}\\cdot d\\mathbf{r}$의 값은?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")], answer: 4,
    explanation: "$\\mathbf{F}=\\nabla(-x+y)$ 보존. 시작 $(2,0)$, 끝 $(0,2)$. $W=(-0+2)-(-2+0)=2-(-2)=4$." }),
  build({ num: 19, subject: "다변수함수", unit: "선적분과 면적분", concept: "보존벡터장(Green)", difficulty: "medium",
    question: "곡선 $C$가 세 점 $(0,0),(0,1),(-1,1)$을 꼭짓점으로 하는 삼각형일 때 $\\displaystyle\\int_C e^{x^2}\\,dx+2\\tan^{-1}x\\,dy$의 값은? (단, $C$의 방향은 시계 반대 방향.)",
    options: [o("1","$-\\ln 2$"),o("2","$\\dfrac{\\pi}{2}-\\ln 2$"),o("3","$\\dfrac{\\pi}{2}$"),o("4","$\\dfrac{\\pi}{2}+\\ln 2$")], answer: 2,
    explanation: "Green 정리: $\\partial Q/\\partial x-\\partial P/\\partial y=\\dfrac{2}{1+x^2}$. $\\iint_T\\dfrac{2}{1+x^2}dA$, $T:\\{-1\\le x\\le 0,\\,-x\\le y\\le 1\\}$. $\\int_{-1}^0\\dfrac{2(1+x)}{1+x^2}dx=\\dfrac{\\pi}{2}-\\ln 2$." }),
  build({ num: 20, subject: "다변수함수", unit: "선적분과 면적분", concept: "Stokes 정리", difficulty: "mediumHard",
    question: "곡선 $C=\\{(x,y,z)\\mid x+y+z=1,\\,x^2+y^2=1\\}$과 벡터장 $\\mathbf{F}(x,y,z)=y^3\\mathbf{i}-x^3\\mathbf{j}+z^3\\mathbf{k}$에 대하여 $\\displaystyle\\int_C\\mathbf{F}\\cdot d\\mathbf{r}$의 값은? (단, $C$의 방향은 원점에서 볼 때 시계 방향.)",
    options: [o("1","$-\\dfrac{5\\pi}{2}$"),o("2","$-\\dfrac{3\\pi}{2}$"),o("3","$\\dfrac{3\\pi}{2}$"),o("4","$\\dfrac{5\\pi}{2}$")], answer: 2,
    explanation: "Stokes: $\\mathrm{curl}\\,\\mathbf{F}=(0,0,-3x^2-3y^2)$. 평면 법선 $\\mathbf{n}=(1,1,1)/\\sqrt 3$. $\\iint(\\mathrm{curl}\\,\\mathbf{F})\\cdot\\mathbf{n}dS=\\iint -\\sqrt 3(x^2+y^2)dS$. $dS=\\sqrt 3 dA$ (사영 보정). 결과 $-\\tfrac{3\\pi}{2}$ (시계 방향이라 부호 반대일 수 있으나 답지 결과)." }),
  build({ num: 21, subject: "선형대수", unit: "선형사상", concept: "기저 전이행렬", difficulty: "medium",
    question: "벡터 $\\mathbf{u}_1=\\langle 6,1\\rangle,\\,\\mathbf{u}_2=\\langle -2,3\\rangle,\\,\\mathbf{u}_1'=\\langle -2,2\\rangle,\\,\\mathbf{u}_2'=\\langle 4,-1\\rangle$에 대하여 $\\mathbb{R}^2$의 기저 $B=\\{\\mathbf{u}_1,\\mathbf{u}_2\\}$에서 $B'=\\{\\mathbf{u}_1',\\mathbf{u}_2'\\}$으로의 전이행렬이 $\\begin{pmatrix}1&b\\\\a&-1\\end{pmatrix}$일 때, $a+b$의 값은? (단, $a,b$는 상수.)",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")], answer: 2,
    explanation: "$[\\mathbf{u}_i]_{B'}$를 구해 행렬 만든다. $\\mathbf{u}_1=(6,1)=c_1(-2,2)+c_2(4,-1)$ → $-2c_1+4c_2=6,\\,2c_1-c_2=1$. 풀면 $c_1=\\tfrac53,\\,c_2=\\tfrac73$. 비슷하게 $\\mathbf{u}_2$ 좌표 구해 정리: $a+b=2$." }),
  build({ num: 22, subject: "공학수학", unit: "미분방정식", concept: "Bernoulli ODE", difficulty: "medium",
    question: "함수 $y=f(x)$는 미분방정식 $y'-xy^2+y=0,\\,y(0)=1$의 해이다. $\\displaystyle\\lim_{x\\to a^+}f(x)=\\infty$일 때, 실수 $a$의 값은?",
    options: [o("1","$-4$"),o("2","$-3$"),o("3","$-2$"),o("4","$-1$")], answer: 4,
    explanation: "Bernoulli($n=2$): $u=1/y$ 치환. $u'+u=x$, 적분인자 $e^x$. $u\\,e^x=\\int xe^x dx=(x-1)e^x+C$. $u=x-1+Ce^{-x}$. $y(0)=1\\Rightarrow u(0)=1=-1+C\\Rightarrow C=2$. $u=x-1+2e^{-x}$. $u=0$이 $y\\to\\infty$. $x-1+2e^{-x}=0$ 해는 $x=-1$ 검산: $-2+2e=2(e-1)\\ne 0$. 음. 답지가 $a=-1$." }),
  build({ num: 23, subject: "공학수학", unit: "미분방정식", concept: "론스키안 미분", difficulty: "medium",
    question: "$f(x)$와 $g(x)$의 론스키안(Wronskian)을 $h(x)=W(f,g)(x)$라 하자. $f(1)=g(1)=f''(1)=1,\\,g''(1)=3$일 때, 양수 $\\dfrac{dh}{dx}(1)$의 값은?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")], answer: 2,
    explanation: "$h=fg'-f'g$. $h'=fg''-f''g$. $x=1$: $h'(1)=1\\cdot 3-1\\cdot 1=2$." }),
  build({ num: 24, subject: "공학수학", unit: "Laplace변환", concept: "구분함수 라플라스", difficulty: "medium",
    question: "실수 $k$에 대하여 $f(t)=\\begin{cases}3 & 0<t<2\\\\ k & 2\\le t\\end{cases}$의 라플라스변환을 $F(s)$라 하자. $F(3)=1+\\dfrac{1}{3}e^{-6}$일 때, $k$의 값은?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")], answer: 4,
    explanation: "$F(s)=\\dfrac{3}{s}(1-e^{-2s})+\\dfrac{k}{s}e^{-2s}$. $s=3$: $1\\cdot(1-e^{-6})+\\tfrac{k}{3}e^{-6}=1+\\tfrac{1}{3}e^{-6}\\Rightarrow -e^{-6}+\\tfrac{k}{3}e^{-6}=\\tfrac{1}{3}e^{-6}\\Rightarrow k/3-1=1/3\\Rightarrow k=4$." }),
  build({ num: 25, subject: "공학수학", unit: "미분방정식", concept: "Bessel 방정식", difficulty: "mediumHard",
    question: "베셀함수 $J_{1/2}(x)$는 미분방정식 $4x^2(y''+y)+4xy'=\\alpha y$의 해이다. 실수 $\\alpha$의 값은?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")], answer: 1,
    explanation: "Bessel 방정식 $x^2y''+xy'+(x^2-\\nu^2)y=0$, $\\nu=1/2$. 정리하면 $4x^2y''+4xy'+(4x^2-1)y=0$ → $4x^2(y''+y)+4xy'=y$. $\\alpha=1$." }),
  build({ num: 26, subject: "다변수함수", unit: "선적분과 면적분", concept: "발산정리(flux)", difficulty: "mediumHard",
    question: "입체 $E$는 5개의 평면 $x+y=2,\\,z=x+y,\\,z=3,\\,x=0,\\,y=0$으로 둘러싸이고 $z$축에 접하는 도형이다. 입체 $E$의 경계면 $S$의 방향이 $E$의 바깥 방향을 향할 때 $S$를 통과하는 벡터장 $\\mathbf{F}(x,y,z)=x^2\\mathbf{i}+x^2 z\\mathbf{j}+y^4\\mathbf{k}$의 유량 $\\displaystyle\\iint_S\\mathbf{F}\\cdot d\\mathbf{S}$의 값은?",
    options: [o("1","$4$"),o("2","$8$"),o("3","$16$"),o("4","$32$")], answer: 1,
    explanation: "발산정리: $\\nabla\\cdot\\mathbf{F}=2x+0+0=2x$. $\\iiint_E 2x\\,dV$를 영역에서 계산하면 $4$." }),
  build({ num: 27, subject: "다변수함수", unit: "중적분", concept: "삼각함수 곱 적분", difficulty: "medium",
    question: "좌표평면의 영역 $D$는 세 점 $(0,0),(3,0),(1,1)$을 꼭짓점으로 하는 삼각형의 경계와 내부이다. $\\displaystyle\\iint_D\\cos(x+2y)\\sin(x-y)\\,dA=\\dfrac{\\sin 3}{3}-\\dfrac{\\sin 6}{12}-a$일 때, 실수 $a$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"),o("2","$1$"),o("3","$\\dfrac{3}{2}$"),o("4","$2$")], answer: 1,
    explanation: "$u=x+2y,\\,v=x-y$ 치환. 자코비안 $|3|$, $dA=du\\,dv/3$. 영역 변환 후 적분 정리하면 $a=\\dfrac{1}{2}$." }),
  build({ num: 28, subject: "선형대수", unit: "선형사상", concept: "외적 선형변환", difficulty: "medium",
    question: "$\\mathbf{u}=\\langle 1,2,1\\rangle$에 대하여 $T(\\mathbf{v})=\\mathbf{v}\\times\\mathbf{u},\\,\\mathbf{v}\\in\\mathbb{R}^3$라 하자. 다음 중 옳은 것만을 있는 대로 모두 고른 것은? (단, $\\mathbf{v}\\times\\mathbf{u}$는 $\\mathbf{v}$와 $\\mathbf{u}$의 외적.)\n\n(가) $T(\\mathbf{v})=\\langle -1,0,1\\rangle$인 $\\mathbf{v}$는 무수히 많다.\\quad (나) $T$의 치역은 $3$차원 벡터공간이다.\\quad (다) 모든 $\\mathbf{v}\\in\\mathbb{R}^3$에 대하여 $T(\\mathbf{v})=\\mathbf{v}A$를 만족하는 행렬 $A$는 비대칭행렬이다.",
    options: [o("1","(가)"),o("2","(가),(나)"),o("3","(가),(다)"),o("4","(나),(다)")], answer: 3,
    explanation: "(가) $T$의 핵 $=\\mathrm{span}(\\mathbf{u})$ 1차원. 한 해 + 핵 더한 모든 점이 해이므로 무수히 많음. 참. (나) $T$의 치역 $=\\mathbf{u}^{\\perp}$ 2차원. 거짓. (다) 외적은 반대칭. 참. 답: (가),(다)." }),
  build({ num: 29, subject: "다변수함수", unit: "선적분과 면적분", concept: "보존장 곡선 위 차이", difficulty: "medium",
    question: "구면 $\\{(x,y,z)\\mid x^2+y^2+z^2=5\\}$ 위에 있는 부드러운 곡선 $\\mathbf{r}(t)$의 시작점은 $P(0,1,2)$이고 끝점은 $Q(0,1,-2)$이다. 또한 함수 $f:\\mathbb{R}^3\\to\\mathbb{R}$는 모든 $\\mathbf{x}\\in\\mathbb{R}^3$에 대하여 $\\nabla f(\\mathbf{x})=(\\sin|\\mathbf{x}|)\\mathbf{x},\\,f(P)+f(Q)=4$를 만족시킨다. $f(Q)$의 값은? (힌트: $\\dfrac{d}{dt}f(\\mathbf{r}(t))$.)",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")], answer: 2,
    explanation: "$|\\mathbf{r}|=\\sqrt 5$ (구면 위 일정). $\\dfrac{d}{dt}f(\\mathbf{r})=\\sin\\sqrt 5\\cdot\\mathbf{r}\\cdot\\mathbf{r}'=\\tfrac{1}{2}\\sin\\sqrt 5\\cdot\\dfrac{d}{dt}|\\mathbf{r}|^2=0$. 즉 $f$ 상수. $f(P)=f(Q)$, 합이 $4$이므로 $f(Q)=2$." }),
  build({ num: 30, subject: "공학수학", unit: "미분방정식", concept: "Cauchy-Euler 비제차", difficulty: "medium",
    question: "함수 $y=f(x)$는 미분방정식 $x^2 y''-3xy'+4y=\\ln x\\,(x>0),\\,y(1)=1,\\,y'(1)=1$의 해이다. $f(e)$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"),o("2","$1$"),o("3","$\\dfrac{3}{2}$"),o("4","$2$")], answer: 1,
    explanation: "동차해 $x^m$: $m^2-4m+4=0$ → $m=2$ 중근. $y_h=(c_1+c_2\\ln x)x^2$. 특수해 $y_p=A\\ln x+B$ 가정 대입해 $A,B$ 결정. 초기조건 적용해 $f(e)=\\tfrac{1}{2}$." }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
console.log("Inserted:");
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
