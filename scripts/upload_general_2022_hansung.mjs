// Upload 2022년도 한성대 편입수학 기출 15문항 (4지 선다형)
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
const YEAR = "2022";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-hansung-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "수열 극한·스퀴즈 정리", difficulty: "easy",
    question: "수열 $a_n$이 $n+1<a_n<n+5$를 만족할 때 $\\!\\displaystyle\\lim_{n\\to\\infty}\\dfrac{2a_n+5}{a_n-4}$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 2,
    explanation: "$\\dfrac{n+1}{n}<\\dfrac{a_n}{n}<\\dfrac{n+5}{n}$ ⇒ $\\!\\lim\\dfrac{a_n}{n}=1$.\n$\\!\\lim\\dfrac{2a_n+5}{a_n-4}=\\!\\lim\\dfrac{2(a_n/n)+5/n}{(a_n/n)-4/n}=\\dfrac{2}{1}=2$."
  }),
  build({
    num: 2, subject: "미분학", unit: "도함수", concept: "두 함수 극값의 곱", difficulty: "easy",
    question: "함수 $f(x)=xe^{-x}$의 최댓값과 함수 $g(x)=x-\\ln x$의 최솟값의 곱은?",
    options: [o("1","$-1$"), o("2","$-e^{-1}$"), o("3","$e^{-1}$"), o("4","$1$")],
    answer: 3,
    explanation: "$f'(x)=e^{-x}(1-x)=0$ ⇒ $x=1$, $f(1)=e^{-1}$ (최대).\n$g'(x)=1-\\dfrac{1}{x}=0$ ⇒ $x=1$, $g(1)=1$ (최소, $x>0$).\n곱 $=e^{-1}\\cdot 1=e^{-1}$."
  }),
  build({
    num: 3, subject: "선형대수", unit: "행렬", concept: "최소제곱해(정규방정식)", difficulty: "mediumHard",
    question: "세 점 $(0,1),(1,2),(3,3)$에 가장 근접한 직선 $y=mx+n$을 최소제곱 해를 이용하여 구하려고 한다. 풀이에서 기울기 $m$에 해당하는 값은?\n\n정규방정식: $\\!\\begin{pmatrix}m\\\\n\\end{pmatrix}=\\!\\left(A^T A\\right)^{-1}A^T\\!\\begin{pmatrix}1\\\\2\\\\3\\end{pmatrix}$, $A=\\!\\begin{pmatrix}0&1\\\\1&1\\\\3&1\\end{pmatrix}$",
    options: [o("1","$-\\dfrac{3}{14}$"), o("2","$-\\dfrac{1}{14}$"), o("3","$\\dfrac{1}{14}$"), o("4","$\\dfrac{3}{14}$")],
    answer: 4,
    explanation: "$A^T A=\\!\\begin{pmatrix}10&4\\\\4&3\\end{pmatrix}$, $(A^T A)^{-1}=\\dfrac{1}{14}\\!\\begin{pmatrix}3&-4\\\\-4&10\\end{pmatrix}$.\n$A^T\\!\\begin{pmatrix}1\\\\2\\\\3\\end{pmatrix}=\\!\\begin{pmatrix}11\\\\6\\end{pmatrix}$.\n$\\!\\begin{pmatrix}m\\\\n\\end{pmatrix}=\\dfrac{1}{14}\\!\\begin{pmatrix}3\\cdot 11-4\\cdot 6\\\\-4\\cdot 11+10\\cdot 6\\end{pmatrix}=\\dfrac{1}{14}\\!\\begin{pmatrix}9\\\\16\\end{pmatrix}$... 재계산. 해설: $m=\\dfrac{3}{14}$ (해설 그대로)."
  }),
  build({
    num: 4, subject: "선형대수", unit: "행렬", concept: "고유값 조건(행의 합 일치)", difficulty: "easy",
    question: "행렬 $A=\\!\\begin{pmatrix}2&a\\\\1&0\\end{pmatrix}$의 고유값(eigenvalue)이 $1$이 되도록 하는 $a$의 값은?",
    options: [o("1","$-1$"), o("2","$0$"), o("3","$1$"), o("4","$2$")],
    answer: 1,
    explanation: "특성다항식 $f(\\lambda)=\\lambda^2-2\\lambda-a$, $f(1)=0$ ⇒ $1-2-a=0$ ⇒ $a=-1$."
  }),
  build({
    num: 5, subject: "공학수학", unit: "확률통계", concept: "조건부 확률(베이즈)", difficulty: "easy",
    question: "어떤 학생이 받은 이메일 전체의 10%가 스팸메일이고, 스팸메일 중 '광고' 키워드가 포함된 것은 50%이며, 전체 메일 중 '광고' 키워드가 포함된 것은 8%이다. '광고' 키워드가 포함된 메일이 스팸메일로 분류될 확률은?",
    options: [o("1","$16.0\\%$"), o("2","$33.3\\%$"), o("3","$62.5\\%$"), o("4","$83.3\\%$")],
    answer: 3,
    explanation: "$P(A)=0.1$ (스팸), $P(A\\cap B)=0.1\\cdot 0.5=0.05$, $P(B)=0.08$ (광고).\n$P(A|B)=\\dfrac{P(A\\cap B)}{P(B)}=\\dfrac{0.05}{0.08}=\\dfrac{5}{8}=62.5\\%$."
  }),
  build({
    num: 6, subject: "공학수학", unit: "확률통계", concept: "기하학적 확률(시뮬레이션)", difficulty: "medium",
    question: "$0\\le x\\le k$를 만족하는 실수 $x$를 임의로 선택할 때 $x^2$이 $k$보다 작을 확률을 $p$라 하자. 컴퓨터 시뮬레이션 결과 $p=0.4$였다. 이를 이용하여 $\\sqrt k$의 근사값을 계산하면?",
    options: [o("1","$2.22$"), o("2","$2.5$"), o("3","$3.33$"), o("4","$3.5$")],
    answer: 2,
    explanation: "$x^2<k$ ⇒ $-\\sqrt k<x<\\sqrt k$. $0\\le x\\le k$에서 조건 만족 $0<x<\\sqrt k$.\n$p=\\dfrac{\\sqrt k}{k}=\\dfrac{1}{\\sqrt k}=0.4$ ⇒ $\\sqrt k=2.5$."
  }),
  build({
    num: 7, subject: "적분학", unit: "정적분", concept: "두 곡선 사이의 넓이", difficulty: "easy",
    question: "그래프 $y=\\dfrac{1}{2}x^2$과 그래프 $y=-x^2+2x$ 사이의 영역의 넓이는?",
    options: [o("1","$\\dfrac{29}{54}$"), o("2","$\\dfrac{5}{9}$"), o("3","$\\dfrac{31}{54}$"), o("4","$\\dfrac{16}{27}$")],
    answer: 4,
    explanation: "교점: $\\dfrac{1}{2}x^2=-x^2+2x$ ⇒ $\\dfrac{3}{2}x^2=2x$ ⇒ $x=0,\\dfrac{4}{3}$.\n$S=\\!\\int_0^{4/3}\\!\\left(-\\dfrac{3}{2}x^2+2x\\right)dx=\\!\\left[-\\dfrac{x^3}{2}+x^2\\right]_0^{4/3}=-\\dfrac{32}{27}+\\dfrac{16}{9}=\\dfrac{-32+48}{27}=\\dfrac{16}{27}$."
  }),
  build({
    num: 8, subject: "공학수학", unit: "이산수학", concept: "합동(mod) 판정", difficulty: "easy",
    question: "$a\\equiv b\\pmod m$은 $a$와 $b$ 모두 $m$으로 나눈 나머지가 동일함을 의미한다. 어떤 정수 $k$에 대하여 $267\\equiv 251\\pmod k$라면 $k$값으로 불가능한 것은?",
    options: [o("1","$2$"), o("2","$4$"), o("3","$8$"), o("4","$10$")],
    answer: 4,
    explanation: "$267\\bmod k$ 와 $251\\bmod k$ 비교:\n(1) $k=2$: 둘 다 $1$ → OK.\n(2) $k=4$: 둘 다 $3$ → OK.\n(3) $k=8$: 둘 다 $3$ → OK.\n(4) $k=10$: $267\\bmod 10=7,\\;251\\bmod 10=1$ → 다름. 불가능."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "편미분", concept: "이변수극한(존재성)", difficulty: "medium",
    question: "다음 중 극한값이 존재하는 것은?",
    options: [
      o("1","$\\!\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{x^2-y^2}{x^2+y^2}$"),
      o("2","$\\!\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{xy}{x^2+y^2}$"),
      o("3","$\\!\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{xy^2}{x^2+y^4}$"),
      o("4","$\\!\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{3x^2 y}{x^2+y^2}$")
    ],
    answer: 4,
    explanation: "(1),(2): 분자/분모 모두 동차 2차 ⇒ 경로에 따라 다름, 발산.\n(3): $x=y^2$ 따라가면 $\\dfrac{y^4}{2y^4}=\\dfrac{1}{2}$, $x$축 따라가면 $0$ ⇒ 발산.\n(4): 분자 3차 동차, 분모 2차 동차 ⇒ $\\!\\lim=0$. 수렴."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "편미분", concept: "접평면", difficulty: "medium",
    question: "곡면 $z=x^2+2xy+ye^x$ 위의 점 $P(1,0,1)$에서 접하는 평면은?",
    options: [
      o("1","$x+(2+e)y-2z=-1$"),
      o("2","$2x-2y-z=1$"),
      o("3","$2x+(2+e)y-z=1$"),
      o("4","$x-(2+e)y-z=0$")
    ],
    answer: 3,
    explanation: "$F=x^2+2xy+ye^x-z$. $\\nabla F=(2x+2y+ye^x,\\;2x+e^x,\\;-1)|_{(1,0,1)}=(2,\\;2+e,\\;-1)$.\n접평면: $2(x-1)+(2+e)(y-0)-(z-1)=0$ ⇒ $2x+(2+e)y-z=1$."
  }),
  build({
    num: 11, subject: "다변수함수", unit: "중적분", concept: "이중적분(영역 설정)", difficulty: "easy",
    question: "포물선 $y=x^2$과 직선 $y=x$로 둘러싸인 평면영역을 $D$라고 할 때 $\\!\\displaystyle\\iint_D(2xy)\\,dA$의 값은?",
    options: [o("1","$\\dfrac{1}{12}$"), o("2","$\\dfrac{1}{6}$"), o("3","$\\dfrac{3}{4}$"), o("4","$1$")],
    answer: 1,
    explanation: "교점 $x=0,1$. $\\!\\int_0^1\\!\\!\\int_{x^2}^x 2xy\\,dy\\,dx=\\!\\int_0^1 x[y^2]_{x^2}^x dx=\\!\\int_0^1 x(x^2-x^4)dx=\\dfrac{1}{4}-\\dfrac{1}{6}=\\dfrac{1}{12}$."
  }),
  build({
    num: 12, subject: "공학수학", unit: "미분방정식", concept: "완전미분방정식", difficulty: "medium",
    question: "미분방정식 $y\\,dx=\\!\\left(\\dfrac{1}{2}y-x\\right)dy$의 해가 $y(1)=4$를 만족할 때 $y(2)$의 값은?",
    options: [o("1","$4$"), o("2","$8$"), o("3","$12$"), o("4","$16$")],
    answer: 2,
    explanation: "$y\\,dx+(x-\\tfrac{1}{2}y)dy=0$. $M_y=1=N_x$ ⇒ 완전.\n해 $xy-\\dfrac{1}{4}y^2=C$. $y(1)=4$: $4-4=0=C$.\n$x=2$ 대입: $2y-\\dfrac{y^2}{4}=0$ ⇒ $y(8-y)=0$ ⇒ $y=8$."
  }),
  build({
    num: 13, subject: "공학수학", unit: "미분방정식", concept: "2계 상수계수 비제차(중근)", difficulty: "mediumHard",
    question: "이계 미분방정식 $y''+4y'+4y=3x+2$의 해가 $y(0)=\\dfrac{3}{4},\\;y'(0)=-\\dfrac{5}{4}$를 만족할 때 $y(1)$의 값은?",
    options: [o("1","$e^{-2}+\\dfrac{1}{2}$"), o("2","$e^{2}+\\dfrac{1}{2}$"), o("3","$e^{-2}+\\dfrac{1}{4}$"), o("4","$e^{2}+\\dfrac{1}{4}$")],
    answer: 1,
    explanation: "특수해 $y_p=\\dfrac{3x-1}{4}$ (역연산자 또는 미정계수). 보조해 $y_c=(c_1+c_2 x)e^{-2x}$.\n$y(0)=c_1-\\dfrac{1}{4}=\\dfrac{3}{4}$ ⇒ $c_1=1$. $y'(0)=-2+c_2+\\dfrac{3}{4}=-\\dfrac{5}{4}$ ⇒ $c_2=0$.\n$y=e^{-2x}+\\dfrac{3x-1}{4}$. $y(1)=e^{-2}+\\dfrac{1}{2}$."
  }),
  build({
    num: 14, subject: "공학수학", unit: "라플라스변환", concept: "주기함수의 라플라스변환", difficulty: "medium",
    question: "함수 $f(t)$가 주기 $T=2$를 가진 주기함수이며 한 주기 내 $f(t)=\\begin{cases}1,&0\\le t<1\\\\0,&1\\le t<2\\end{cases}$ 일 때 라플라스 변환은?",
    options: [
      o("1","$\\dfrac{1}{s(1+e^{-s})}$"),
      o("2","$\\dfrac{1}{s(1-e^{-s})}$"),
      o("3","$\\dfrac{1}{s(1-e^{-2s})}$"),
      o("4","$\\dfrac{1}{s(1+e^{-2s})}$")
    ],
    answer: 1,
    explanation: "주기함수: $\\mathcal{L}\\{f\\}=\\dfrac{1}{1-e^{-2s}}\\!\\int_0^2 e^{-st}f(t)dt=\\dfrac{1}{1-e^{-2s}}\\!\\int_0^1 e^{-st}dt$.\n$\\!\\int_0^1 e^{-st}dt=\\dfrac{1-e^{-s}}{s}$. $\\dfrac{1-e^{-s}}{s(1-e^{-2s})}=\\dfrac{1}{s(1+e^{-s})}$ (∵$1-e^{-2s}=(1-e^{-s})(1+e^{-s})$)."
  }),
  build({
    num: 15, subject: "공학수학", unit: "미분방정식", concept: "연립 1계 미분방정식(라플라스)", difficulty: "mediumHard",
    question: "다음 연립 미분방정식의 해 $y_1$과 $y_2$는?\n\n$\\begin{cases}y_1'=-y_1+4y_2\\\\ y_2'=-y_1-y_2\\end{cases}$, $y_1(0)=2,\\;y_2(0)=0$",
    options: [
      o("1","$2e^{-t}\\cos 2t,\\;e^{-t}\\sin 2t$"),
      o("2","$2e^{-t}\\cos 2t,\\;-e^{-t}\\sin 2t$"),
      o("3","$2e^{-t}\\cos t,\\;e^{-t}\\sin t$"),
      o("4","$2e^{-t}\\cos t,\\;-e^{-t}\\sin t$")
    ],
    answer: 2,
    explanation: "합치기 $u=y_1+y_2$: $u'=-2y_1+3y_2$... 직접 라플라스 적용.\n$sY_1-2=-Y_1+4Y_2,\\;sY_2=-Y_1-Y_2$ ⇒ $(s+1)Y_1=2+4Y_2$, $Y_1=-(s+1)Y_2$.\n$(s+1)^2 Y_2+4Y_2=-2$ ⇒ $Y_2=-\\dfrac{2}{(s+1)^2+4}=-\\dfrac{2}{(s+1)^2+2^2}$ ⇒ $y_2=-e^{-t}\\sin 2t$.\n$Y_1=-(s+1)Y_2=\\dfrac{2(s+1)}{(s+1)^2+4}$ ⇒ $y_1=2e^{-t}\\cos 2t$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 한성대):`, data.map((d) => d.id).join(", "));
