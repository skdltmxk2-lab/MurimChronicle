// Upload 2021년도 한성대 편입수학 기출 15문항 (4지 선다형)
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

const SCHOOL = "한성대";
const YEAR = "2021";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-hansung-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "선형대수", unit: "행렬", concept: "LU 분해·행렬식", difficulty: "medium",
    question: "행렬 $A=\\!\\begin{pmatrix}2&3&4\\\\1&2&3\\\\0&1&1\\end{pmatrix}$의 $LU$ 분해가 $A=LU$ 형태이고 $L$이 단위하삼각행렬(대각 성분 모두 $1$)일 때 $\\det U$의 값은?",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$1$"), o("4","$2$")],
    answer: 2,
    explanation: "$|A|=|L|\\cdot|U|$. 단위하삼각행렬 $L$의 대각합 곱 $|L|=1$이므로 $|U|=|A|$.\n$|A|=\\!\\begin{vmatrix}2&3&4\\\\1&2&3\\\\0&1&1\\end{vmatrix}=2(2-3)-3(1-0)+4(1-0)=-2-3+4=-1$."
  }),
  build({
    num: 2, subject: "선형대수", unit: "행렬", concept: "선형변환의 선형성", difficulty: "easy",
    question: "행렬 $X,Y,Z$와 선형변환 $T:\\mathbb R^2\\to\\mathbb R^2$에 대해 $T(Z)=2X$가 성립할 때 $T(2X)+T(2Y)$를 구하면? (단, $X=\\!\\begin{pmatrix}1\\\\1\\end{pmatrix},Y=\\!\\begin{pmatrix}2\\\\1\\end{pmatrix},Z=\\!\\begin{pmatrix}3\\\\2\\end{pmatrix}$)",
    options: [o("1","$\\!\\begin{pmatrix}1\\\\1\\end{pmatrix}$"), o("2","$\\!\\begin{pmatrix}2\\\\2\\end{pmatrix}$"), o("3","$\\!\\begin{pmatrix}3\\\\3\\end{pmatrix}$"), o("4","$\\!\\begin{pmatrix}4\\\\4\\end{pmatrix}$")],
    answer: 4,
    explanation: "$T(2X)+T(2Y)=2T(X+Y)=2T(Z)=2(2X)=4X=\\!\\begin{pmatrix}4\\\\4\\end{pmatrix}$ ($X+Y=Z$)."
  }),
  build({
    num: 3, subject: "적분학", unit: "급수", concept: "급수 수렴조건·발산판정", difficulty: "easy",
    question: "$\\!\\displaystyle\\sum_{n=1}^{\\infty}\\!\\left(\\dfrac{2na_n+a_n-n}{2n+1}\\right)$이 수렴할 때 $\\!\\displaystyle\\lim_{n\\to\\infty}a_n$의 값은?",
    options: [o("1","$\\dfrac{1}{4}$"), o("2","$\\dfrac{1}{2}$"), o("3","$\\dfrac{3}{4}$"), o("4","$1$")],
    answer: 2,
    explanation: "급수 수렴 ⇒ 일반항 $\\to 0$.\n$\\dfrac{(2n+1)a_n-n}{2n+1}=a_n-\\dfrac{n}{2n+1}\\to 0$ ⇒ $a_n\\to\\!\\lim\\dfrac{n}{2n+1}=\\dfrac{1}{2}$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분", concept: "역함수 적분·넓이", difficulty: "easy",
    question: "곡선 $y=\\ln(2x-1)$과 직선 $y=1$, $x$축, $y$축으로 둘러싸인 도형의 넓이는?",
    options: [o("1","$\\dfrac{1}{8}e$"), o("2","$\\dfrac{1}{4}e$"), o("3","$\\dfrac{1}{2}e$"), o("4","$e$")],
    answer: 3,
    explanation: "$x=\\dfrac{1}{2}(e^y+1)$. $dy$ 적분: $S=\\!\\int_0^1\\dfrac{1}{2}(e^y+1)\\,dy=\\dfrac{1}{2}[e^y+y]_0^1=\\dfrac{1}{2}(e+1-1)=\\dfrac{e}{2}$."
  }),
  build({
    num: 5, subject: "미분학", unit: "도함수", concept: "삼차함수 극값의 합", difficulty: "easy",
    question: "함수 $f(x)=-2x^3-3x^2+2$의 두 극값의 합은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 3,
    explanation: "$f'(x)=-6x^2-6x=-6x(x+1)$. 임계 $x=0,-1$.\n$f(0)=2,\\;f(-1)=2-(-2)-3=2+2-3=1$. 합 $=3$."
  }),
  build({
    num: 6, subject: "미분학", unit: "도함수", concept: "교점 두 개 조건(이차방정식 판별)", difficulty: "medium",
    question: "방정식 $e^x=x+k$가 서로 다른 두 실근을 갖도록 하는 $k$의 값은?",
    options: [o("1","$-1$"), o("2","$0$"), o("3","$1$"), o("4","$2$")],
    answer: 4,
    explanation: "$g(x)=e^x-x$ ⇒ $g'(x)=e^x-1=0$ ⇒ $x=0$ (극소).\n$g(0)=1$. $y=g(x)$와 직선 $y=k$가 두 교점을 가질 조건: $k>1$.\n보기 중 만족: $k=2$."
  }),
  build({
    num: 7, subject: "공학수학", unit: "확률통계", concept: "확률밀도함수·평균", difficulty: "easy",
    question: "연속확률변수 $X$가 구간 $[0,1]$에서 임의의 실수 값을 취하고 $X$의 확률밀도함수 $f(x)=mx$일 때 $X$의 평균 $E[X]$의 값은?",
    options: [o("1","$\\dfrac{1}{3}$"), o("2","$\\dfrac{2}{3}$"), o("3","$1$"), o("4","$\\dfrac{4}{3}$")],
    answer: 2,
    explanation: "$\\!\\int_0^1 mx\\,dx=\\dfrac{m}{2}=1$ ⇒ $m=2$. $f(x)=2x$.\n$E[X]=\\!\\int_0^1 x\\cdot 2x\\,dx=\\!\\left[\\dfrac{2x^3}{3}\\right]_0^1=\\dfrac{2}{3}$."
  }),
  build({
    num: 8, subject: "공학수학", unit: "확률통계", concept: "표본평균의 평균=모평균", difficulty: "easy",
    question: "주머니에 각각 $2,4,k$가 적힌 공 세 개가 있다. 복원추출로 공을 $2$개 꺼낼 때 공에 적힌 숫자를 확률변수 $X_1,X_2$라 하면 표본평균 $\\overline X=\\dfrac{X_1+X_2}{2}$가 된다. 표본평균 $\\overline X$의 평균 $E[\\overline X]=4$라고 하면 $k$의 값은?",
    options: [o("1","$3$"), o("2","$4$"), o("3","$5$"), o("4","$6$")],
    answer: 4,
    explanation: "$E[\\overline X]=E[X]=\\dfrac{2+4+k}{3}=4$ ⇒ $k=6$."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "편미분", concept: "전미분으로부터 $f$ 복원", difficulty: "medium",
    question: "함수 $f(x,y)$에 대해 $df=(3x^2-2y^2)\\,dx+(3y^2-4xy)\\,dy$이고 $f(0,1)=1$일 때 $f(1,1)$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$")],
    answer: 1,
    explanation: "$f_x=3x^2-2y^2$ ⇒ $f=x^3-2xy^2+g(y)$.\n$f_y=-4xy+g'(y)=3y^2-4xy$ ⇒ $g'(y)=3y^2$ ⇒ $g(y)=y^3+C$.\n$f(0,1)=1+C=1$ ⇒ $C=0$. $f(1,1)=1-2+1=0$."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "편미분", concept: "연쇄법칙(다변수)", difficulty: "medium",
    question: "함수 $f(x,y,z)=e^{x+2y+z}$이며 $x=s^2 t,\\,y=s+t,\\,z=st^2$일 때 $(x,y,z)=(1,2,1)$에서 $\\dfrac{\\partial f}{\\partial s}$의 값은?",
    options: [o("1","$2e^6$"), o("2","$3e^6$"), o("3","$4e^6$"), o("4","$5e^6$")],
    answer: 4,
    explanation: "$(x,y,z)=(1,2,1)$ ⇒ $(s,t)=(1,1)$.\n$\\dfrac{\\partial f}{\\partial s}=f_x x_s+f_y y_s+f_z z_s=e^{x+2y+z}(2st+2+t^2)$.\n$(s,t)=(1,1)$ 대입: $e^6(2+2+1)=5e^6$."
  }),
  build({
    num: 11, subject: "다변수함수", unit: "편미분", concept: "방향도함수·경도의 크기", difficulty: "medium",
    question: "함수 $f(x,y)$의 임의의 점 $P_0$에서 벡터 $\\vec u_1=(1,1)$ 방향으로의 방향도함수는 $1$이고 벡터 $\\vec u_2=(1,-1)$ 방향으로의 방향도함수는 $2$일 때 점 $P_0$에서 함수 $f(x,y)$의 최대 변화율은?",
    options: [o("1","$\\sqrt 5$"), o("2","$\\sqrt 6$"), o("3","$\\sqrt 7$"), o("4","$\\sqrt 8$")],
    answer: 1,
    explanation: "$\\nabla f=(a,b)$로 두면 $(a,b)\\cdot\\!\\left(\\dfrac{1}{\\sqrt 2},\\dfrac{1}{\\sqrt 2}\\right)=\\dfrac{a+b}{\\sqrt 2}=1$, $(a,b)\\cdot\\!\\left(\\dfrac{1}{\\sqrt 2},-\\dfrac{1}{\\sqrt 2}\\right)=\\dfrac{a-b}{\\sqrt 2}=2$.\n$a+b=\\sqrt 2,\\;a-b=2\\sqrt 2$ ⇒ $a=\\dfrac{3\\sqrt 2}{2},\\,b=-\\dfrac{\\sqrt 2}{2}$.\n최대 변화율 $=\\|\\nabla f\\|=\\sqrt{\\dfrac{9}{2}+\\dfrac{1}{2}}=\\sqrt 5$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "편미분", concept: "유계영역 최대/최소(라그랑주)", difficulty: "medium",
    question: "영역 $\\{(x,y)\\,|\\,1\\le x^2+y^2\\le 9\\}$에서 함수 $f(x,y)=x^2+y^2-4y$의 최댓값과 최솟값의 합은?",
    options: [o("1","$15$"), o("2","$16$"), o("3","$17$"), o("4","$18$")],
    answer: 3,
    explanation: "$x^2+y^2-4y=k$ ⇒ $x^2+(y-2)^2=k+4$. 중심 $(0,2)$, 반지름 $\\sqrt{k+4}$.\n경계 원과의 접점: $k$ 최소 시 반지름 $=0$ ⇒ $k=-4$.\n원점 중심 반지름 $3$의 원 위 가장 먼 점 $(0,-3)$: $k=9-4(-3)=21$.\n합 $=21+(-4)=17$."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "중적분", concept: "공간의 부피·이중적분", difficulty: "medium",
    question: "평면 $x-y=0,\\;z=0$과 곡면 $\\sqrt x-y=0,\\;z=2x^2 y+4y$로 둘러싸인 공간의 부피는?",
    options: [o("1","$\\dfrac{13}{60}$"), o("2","$\\dfrac{17}{60}$"), o("3","$\\dfrac{19}{60}$"), o("4","$\\dfrac{23}{60}$")],
    answer: 4,
    explanation: "정의역 $D$: $y=\\sqrt x$와 $y=x$로 둘러싸인 부분 ($0\\le x\\le 1$).\n$V=\\!\\iint_D(2x^2 y+4y)\\,dA=\\!\\int_0^1\\!\\!\\int_x^{\\sqrt x}(2x^2+4)y\\,dy\\,dx$\n$=\\!\\int_0^1(x^2+2)(x-x^2)dx=\\!\\int_0^1(-x^4+x^3-2x^2+2x)dx$\n$=-\\dfrac{1}{5}+\\dfrac{1}{4}-\\dfrac{2}{3}+1=\\dfrac{-12+15-40+60}{60}=\\dfrac{23}{60}$."
  }),
  build({
    num: 14, subject: "공학수학", unit: "미분방정식", concept: "2계 상수계수 비제차", difficulty: "mediumHard",
    question: "이계 미분방정식 $y''-ay'=2x$의 해 $y(x)$가 $y(0)=0,\\;y'(0)=0,\\;y''(1)=\\dfrac{2}{a}$를 만족할 때 상수 $a$의 값은?",
    options: [o("1","$\\ln 2$"), o("2","$\\ln 3$"), o("3","$\\ln 4$"), o("4","$\\ln 5$")],
    answer: 1,
    explanation: "보조해 $y_c=c_1+c_2 e^{ax}$. 특수해 시도 $y_p=Ax^2+Bx$: $y_p''-ay_p'=2A-a(2Ax+B)=2x$ ⇒ $A=-\\dfrac{1}{a},\\,B=-\\dfrac{2}{a^2}$.\n일반해 $y=c_1+c_2 e^{ax}-\\dfrac{x^2}{a}-\\dfrac{2x}{a^2}$.\n$y(0)=c_1+c_2=0$, $y'(0)=ac_2-\\dfrac{2}{a^2}=0$ ⇒ $c_2=\\dfrac{2}{a^3}$, $c_1=-\\dfrac{2}{a^3}$.\n$y''=a^2 c_2 e^{ax}-\\dfrac{2}{a}=\\dfrac{2}{a}e^{ax}-\\dfrac{2}{a}$.\n$y''(1)=\\dfrac{2}{a}(e^a-1)=\\dfrac{2}{a}$ ⇒ $e^a=2$ ⇒ $a=\\ln 2$."
  }),
  build({
    num: 15, subject: "공학수학", unit: "라플라스변환", concept: "역라플라스·초기값", difficulty: "medium",
    question: "함수 $f(t)$가 $t\\ge 0$에서 연속인 함수일 때 $f(t)$의 라플라스 변환은 $\\mathcal{L}\\{f(t)\\}=\\!\\int_0^{\\infty}e^{-st}f(t)\\,dt$로 정의된다. $\\mathcal{L}\\{f(t)\\}=-\\dfrac{4+s+s^2}{(s+1)(s^2+2s+5)}$인 함수 $f(t)$에 대하여 $f(0)$의 값은?",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$0$"), o("4","$1$")],
    answer: 2,
    explanation: "부분분수: $-\\dfrac{s^2+s+4}{(s+1)(s^2+2s+5)}=-\\dfrac{1}{s+1}+\\dfrac{1}{s^2+2s+5}$.\n$\\dfrac{1}{s^2+2s+5}=\\dfrac{1}{(s+1)^2+4}=\\dfrac{1}{2}\\cdot\\dfrac{2}{(s+1)^2+2^2}$ ⇒ $\\dfrac{1}{2}e^{-t}\\sin 2t$.\n$f(t)=-e^{-t}+\\dfrac{1}{2}e^{-t}\\sin 2t$. $f(0)=-1+0=-1$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 한성대):`, data.map((d) => d.id).join(", "));
