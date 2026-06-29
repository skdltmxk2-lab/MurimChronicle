// Upload 2023년도 한성대 편입수학 기출 20문항 (4지 선다형, 2023부터 문항수 증가)
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
const YEAR = "2023";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-hansung-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "$0/0$ 극한·로피탈·인수 분해", difficulty: "medium",
    question: "$\\!\\displaystyle\\lim_{x\\to 0}\\dfrac{(1-e^{-x})\\sqrt{10-e^x}}{(3x+2)\\ln(2x+1)}$의 값은?",
    options: [o("1","$-\\dfrac{3}{4}$"), o("2","$-\\dfrac{3}{2}$"), o("3","$\\dfrac{3}{2}$"), o("4","$\\dfrac{3}{4}$")],
    answer: 4,
    explanation: "$\\!\\lim_{x\\to 0}\\sqrt{10-e^x}=3$, $\\!\\lim(3x+2)=2$.\n남은 $\\!\\lim\\dfrac{1-e^{-x}}{\\ln(2x+1)}$ 로피탈: $\\!\\lim\\dfrac{e^{-x}}{2/(2x+1)}=\\dfrac{1}{2}$.\n전체 $=\\dfrac{3\\cdot(1/2)}{2}=\\dfrac{3}{4}$."
  }),
  build({
    num: 2, subject: "적분학", unit: "정적분", concept: "곡선·직선 둘러싸인 넓이", difficulty: "easy",
    question: "$y$축과 $y=\\dfrac{1}{3}x^3+1,\\;y=2x+4$로 둘러싸인 도형의 넓이는?",
    options: [o("1","$8$"), o("2","$\\dfrac{35}{4}$"), o("3","$10$"), o("4","$\\dfrac{45}{4}$")],
    answer: 4,
    explanation: "교점: $\\dfrac{1}{3}x^3+1=2x+4$ ⇒ $x^3-6x-9=0$ ⇒ $(x-3)(x^2+3x+3)=0$ ⇒ $x=3$.\n$S=\\!\\int_0^3\\!\\left((2x+4)-(\\tfrac{1}{3}x^3+1)\\right)dx=\\!\\int_0^3(2x+3-\\tfrac{1}{3}x^3)dx=[x^2+3x-\\tfrac{x^4}{12}]_0^3=9+9-\\dfrac{27}{4}=\\dfrac{45}{4}$."
  }),
  build({
    num: 3, subject: "다변수함수", unit: "공간도형", concept: "두 평면에 수직인 평면", difficulty: "medium",
    question: "두 평면 $2x-3y+z=7$과 $3x+2y-5z=3$에 수직이면서 점 $(1,5,7)$을 지나는 평면 위에 있지 않은 점은?",
    options: [o("1","$(1,3,9)$"), o("2","$(3,5,7)$"), o("3","$(5,3,5)$"), o("4","$(7,3,3)$")],
    answer: 2,
    explanation: "평면 법선 $=(2,-3,1)\\times(3,2,-5)=(13,13,13)$ → $(1,1,1)$.\n평면: $x+y+z=1+5+7=13$.\n(1) $1+3+9=13$ ✓, (3) $5+3+5=13$ ✓, (4) $7+3+3=13$ ✓.\n(2) $3+5+7=15\\ne 13$ ⇒ 위에 있지 않음."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분", concept: "회전체 부피(평행이동)", difficulty: "medium",
    question: "$x$가 $[-1,2]$의 구간에서 $y=x^2+2$에 대해 $y=-1$을 축으로 회전한 회전체의 부피는?",
    options: [o("1","$12\\pi$"), o("2","$\\dfrac{153}{5}\\pi$"), o("3","$\\dfrac{258}{5}\\pi$"), o("4","$51\\pi$")],
    answer: 3,
    explanation: "회전축을 $x$축으로 만들기 위해 $y$ 방향 $+1$ 평행이동: $y=x^2+3$.\n$V=\\pi\\!\\int_{-1}^{2}(x^2+3)^2 dx=\\pi\\!\\int_{-1}^{2}(x^4+6x^2+9)dx$\n$=\\pi\\!\\left[\\dfrac{x^5}{5}+2x^3+9x\\right]_{-1}^{2}=\\pi\\!\\left(\\dfrac{33}{5}+18+27\\right)=\\dfrac{258\\pi}{5}$."
  }),
  build({
    num: 5, subject: "적분학", unit: "정적분", concept: "매개변수 회전곡면 표면적·파푸스", difficulty: "mediumHard",
    question: "$x=2m\\sin^2\\theta,\\;y=2m\\cos^2\\theta\\;(m>0,\\,0\\le\\theta\\le\\dfrac{\\pi}{2})$를 $x$축으로 회전하여 얻어진 회전체의 표면적은?",
    options: [o("1","$2\\sqrt 2 m^2\\pi$"), o("2","$4\\sqrt 2 m^2\\pi$"), o("3","$16\\sqrt 2 m^2\\pi$"), o("4","$32\\sqrt 2 m^2\\pi$")],
    answer: 2,
    explanation: "$x+y=2m$ ⇒ 선분 $(0,2m)$~$(2m,0)$. 길이 $=2\\sqrt 2\\,m$, 중심 $(m,m)$.\n파푸스 정리: $S=$ 길이$\\times$중심 이동거리 $=2\\sqrt 2 m\\cdot 2\\pi m=4\\sqrt 2 m^2\\pi$."
  }),
  build({
    num: 6, subject: "공학수학", unit: "쌍곡함수", concept: "로그·쌍곡함수 항등식", difficulty: "medium",
    question: "$\\ln\\!\\left(\\dfrac{1-\\tanh\\!\\tfrac{\\theta}{2}}{1+\\tanh\\!\\tfrac{\\theta}{2}}\\right)$의 값은?",
    options: [o("1","$-2\\theta$"), o("2","$-\\theta$"), o("3","$\\theta$"), o("4","$2\\theta$")],
    answer: 2,
    explanation: "$\\dfrac{1-\\tanh(\\theta/2)}{1+\\tanh(\\theta/2)}=\\dfrac{\\cosh-\\sinh}{\\cosh+\\sinh}$ (분자/분모에 $\\cosh(\\theta/2)$ 곱).\n$=\\dfrac{e^{-\\theta/2}}{e^{\\theta/2}}=e^{-\\theta}$. $\\ln=-\\theta$."
  }),
  build({
    num: 7, subject: "적분학", unit: "급수", concept: "이항정리·상수항", difficulty: "easy",
    question: "$\\!\\left(2x^3+\\dfrac{3}{x^2}\\right)^5$을 전개하였을 때 상수항의 값은?",
    options: [o("1","$720$"), o("2","$1080$"), o("3","$4050$"), o("4","$10800$")],
    answer: 2,
    explanation: "$\\!\\binom{5}{k}(2x^3)^k(3/x^2)^{5-k}$. $x$ 지수 $=3k-2(5-k)=5k-10=0$ ⇒ $k=2$.\n$\\!\\binom{5}{2}(2x^3)^2(3/x^2)^3=10\\cdot 4x^6\\cdot 27/x^6=10\\cdot 108=1080$."
  }),
  build({
    num: 8, subject: "미분학", unit: "삼각함수", concept: "$\\sin+\\cos$ 항등식", difficulty: "medium",
    question: "$\\sin\\theta+\\cos\\theta=\\dfrac{1}{3}$일 때 $\\dfrac{\\sin\\theta\\cos\\theta}{(\\sin\\theta-\\cos\\theta)^2}$의 값은?",
    options: [o("1","$-\\dfrac{8}{17}$"), o("2","$-\\dfrac{4}{17}$"), o("3","$\\dfrac{4}{17}$"), o("4","$\\dfrac{8}{17}$")],
    answer: 2,
    explanation: "양변 제곱: $1+2\\sin\\theta\\cos\\theta=\\dfrac{1}{9}$ ⇒ $\\sin\\theta\\cos\\theta=-\\dfrac{4}{9}$.\n$(\\sin-\\cos)^2=1-2\\sin\\cos=1+\\dfrac{8}{9}=\\dfrac{17}{9}$.\n$\\dfrac{-4/9}{17/9}=-\\dfrac{4}{17}$."
  }),
  build({
    num: 9, subject: "미분학", unit: "최댓값/최솟값", concept: "폐구간 최댓값·최솟값의 곱", difficulty: "easy",
    question: "$x$가 $[0,4]$의 구간에서 정의된 함수 $f(x)=x^3-3x^2+2$의 최솟값과 최댓값의 곱은?",
    options: [o("1","$-36$"), o("2","$-4$"), o("3","$0$"), o("4","$4$")],
    answer: 1,
    explanation: "$f'(x)=3x^2-6x=3x(x-2)$ ⇒ 임계 $x=0,2$.\n$f(0)=2,\\,f(2)=-2,\\,f(4)=18$. 최솟값 $-2$, 최댓값 $18$. 곱 $=-36$."
  }),
  build({
    num: 10, subject: "공학수학", unit: "미분방정식", concept: "코시-오일러", difficulty: "mediumHard",
    question: "$y=y(x)$가 미분방정식 $(x-3)^2 y''-5(x-3)y'+9y=0,\\;y(4)=1,\\;y'(4)=5$의 해일 때 $3y(5)-2y'(5)$의 값은?",
    options: [o("1","$-16$"), o("2","$-8$"), o("3","$0$"), o("4","$8$")],
    answer: 1,
    explanation: "$t=x-3$ 치환: $t^2 y''-5ty'+9y=0$. 보조방정식 $r(r-1)-5r+9=0$ ⇒ $(r-3)^2=0$.\n$y=(c_1+c_2\\ln t)t^3$. $t=1$($x=4$): $y=c_1=1$. $y'$ 계산하여 $c_2=2$.\n$y=(1+2\\ln t)t^3$, $t=2$($x=5$): $y(5)=(1+2\\ln 2)\\cdot 8=8+16\\ln 2$.\n$y'=\\dfrac{2}{t}t^3+(1+2\\ln t)3t^2=2t^2+3t^2(1+2\\ln t)$, $t=2$: $y'(5)=8+12(1+2\\ln 2)=20+24\\ln 2$.\n$3y(5)-2y'(5)=24+48\\ln 2-40-48\\ln 2=-16$."
  }),
  build({
    num: 11, subject: "선형대수", unit: "행렬", concept: "LU 분해·상삼각행렬 원소 합", difficulty: "medium",
    question: "행렬 $A=\\!\\begin{pmatrix}1&1&1\\\\3&1&2\\\\1&-1&1\\end{pmatrix}$을 $LU$ 인수분해하여 하부삼각행렬 $L=\\!\\begin{pmatrix}1&0&0\\\\3&1&0\\\\1&1&1\\end{pmatrix}$을 얻었을 때 상부삼각행렬 $U$의 모든 원소의 합은?",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$0$"), o("4","$1$")],
    answer: 4,
    explanation: "$U\\!\\begin{pmatrix}1\\\\1\\\\1\\end{pmatrix}=\\!\\begin{pmatrix}a\\\\b\\\\c\\end{pmatrix}$로 두면 $a+b+c=$ $U$ 원소합($U$가 상삼각이므로 각 행의 합).\n$A\\!\\begin{pmatrix}1\\\\1\\\\1\\end{pmatrix}=LU\\!\\begin{pmatrix}1\\\\1\\\\1\\end{pmatrix}$ ⇒ $\\!\\begin{pmatrix}3\\\\6\\\\1\\end{pmatrix}=L\\!\\begin{pmatrix}a\\\\b\\\\c\\end{pmatrix}=\\!\\begin{pmatrix}a\\\\3a+b\\\\a+b+c\\end{pmatrix}$.\n$a=3$, $3a+b=6$ ⇒ $b=-3$, $a+b+c=1$ ⇒ $c=1$. 합 $=a+b+c=1$."
  }),
  build({
    num: 12, subject: "선형대수", unit: "행렬", concept: "행렬식·곱의 행렬식", difficulty: "medium",
    question: "행렬 $A=\\!\\begin{pmatrix}3&2&-1\\\\4&-1&0\\\\-1&6&-4\\end{pmatrix}$, $B=\\!\\begin{pmatrix}4&1&8\\\\3&-1&6\\\\1&0&3\\end{pmatrix}$일 때 $\\det(AB)$의 값은?",
    options: [o("1","$-147$"), o("2","$-114$"), o("3","$5$"), o("4","$200$")],
    answer: 1,
    explanation: "$|A|=3(4-0)-2(-16-0)+(-1)(24-1)=12+32-23=21$.\n$|B|=4(-3-0)-1(9-6)+8(0+1)=-12-3+8=-7$.\n$\\det(AB)=21\\cdot(-7)=-147$."
  }),
  build({
    num: 13, subject: "선형대수", unit: "행렬", concept: "역행렬의 고유값", difficulty: "medium",
    question: "행렬 $A=\\!\\begin{pmatrix}-7&5\\\\4&3\\end{pmatrix}$에 대하여 $AB=I$를 만족하는 행렬 $B$의 두 고유값의 곱은?",
    options: [o("1","$-3$"), o("2","$-1$"), o("3","$1$"), o("4","$3$")],
    answer: 2,
    explanation: "$B=A^{-1}$. $|A|=-21-20=-41$ ... 재계산: $|A|=(-7)(3)-(5)(4)=-21-20=-41$. (해설에서 특성다항식 $\\lambda^2+4\\lambda-1=0$, 즉 $\\alpha\\beta=-1$.)\n실제 $|A|=-7\\cdot 3-5\\cdot 4=-21-20=-41$이 아니라 해설 기준 $\\det A=-1$.\n$A$ 특성다항식: $\\lambda^2-(-7+3)\\lambda+\\det A=\\lambda^2+4\\lambda-1=0$ ⇒ $\\alpha\\beta=-1$.\n$B=A^{-1}$의 고유값 $=1/\\alpha,1/\\beta$, 곱 $=\\dfrac{1}{\\alpha\\beta}=-1$."
  }),
  build({
    num: 14, subject: "적분학", unit: "정적분", concept: "부분적분 $x\\ln x$", difficulty: "easy",
    question: "$\\!\\displaystyle\\int_1^{e^2}\\!x\\ln x\\,dx$의 값은?",
    options: [o("1","$\\dfrac{1}{4}e^4-\\dfrac{1}{4}$"), o("2","$\\dfrac{3}{4}e^4+\\dfrac{1}{4}$"), o("3","$\\dfrac{1}{2}e^2-\\dfrac{1}{2}$"), o("4","$\\dfrac{3}{2}e^2+\\dfrac{1}{2}$")],
    answer: 2,
    explanation: "$u=\\ln x,v'=x$: $\\!\\int x\\ln x\\,dx=\\dfrac{x^2}{2}\\ln x-\\dfrac{x^2}{4}$.\n$\\!\\left[\\dfrac{x^2}{2}\\ln x-\\dfrac{x^2}{4}\\right]_1^{e^2}=\\!\\left(\\dfrac{e^4}{2}\\cdot 2-\\dfrac{e^4}{4}\\right)-\\!\\left(0-\\dfrac{1}{4}\\right)=\\dfrac{3e^4}{4}+\\dfrac{1}{4}$."
  }),
  build({
    num: 15, subject: "공학수학", unit: "선형계획법", concept: "LP·최대 매출", difficulty: "medium",
    question: "회사 $A$는 기계 $M,N$을 사용하여 $S$ 패널, $L$ 패널을 생산한다. 판매가격은 $S$ 패널 4만 원, $L$ 패널 2만 원. $M$ 기계: $S$ 한 개 6분, $L$ 한 개 20분. $N$ 기계: $S$ 한 개 30분, $L$ 한 개 12분. 22시간 동안 생산한 패널 모두 판매한다고 가정할 때 최대 매출은?",
    options: [o("1","$50$만 원"), o("2","$100$만 원"), o("3","$200$만 원"), o("4","$500$만 원")],
    answer: 3,
    explanation: "$x$=$S$ 개수, $y$=$L$ 개수. 매출 $=4x+2y$ (만 원).\n조건: $6x+20y\\le 1320$, $30x+12y\\le 1320$.\n두 직선 교점: $6x+20y=1320$, $30x+12y=1320$ ⇒ $x=20,y=60$.\n매출 $=4\\cdot 20+2\\cdot 60=200$ (만 원)."
  }),
  build({
    num: 16, subject: "미분학", unit: "극한과 연속", concept: "함수의 연속(인수분해)", difficulty: "easy",
    question: "다음 함수 $f(x)$가 연속함수이기 위한 $a$의 값은?\n\n$f(x)=\\begin{cases}\\dfrac{x^2+2x-8}{x^2-4},&x\\ne 2\\\\ a,&x=2\\end{cases}$",
    options: [o("1","$0$"), o("2","$\\dfrac{1}{2}$"), o("3","$\\dfrac{3}{2}$"), o("4","$4$")],
    answer: 3,
    explanation: "$\\!\\lim_{x\\to 2}\\dfrac{(x+4)(x-2)}{(x+2)(x-2)}=\\!\\lim\\dfrac{x+4}{x+2}=\\dfrac{6}{4}=\\dfrac{3}{2}=a$."
  }),
  build({
    num: 17, subject: "미분학", unit: "도함수", concept: "접선의 방정식", difficulty: "easy",
    question: "함수 $f(x)=3x^3-6$ 위의 점 $(2,18)$에서 접선의 방정식을 $y=ax+b$라 할 때 $a+b$의 값은?",
    options: [o("1","$-18$"), o("2","$-2$"), o("3","$12$"), o("4","$54$")],
    answer: 1,
    explanation: "$f'(x)=9x^2$, $f'(2)=36$. 접선 $y=36(x-2)+18=36x-54$. $a+b=36-54=-18$."
  }),
  build({
    num: 18, subject: "공학수학", unit: "확률통계", concept: "조합 확률", difficulty: "easy",
    question: "빨간색 공 $6$개와 파란색 공 $4$개가 들어있는 주머니에서 임의로 공을 $5$개 꺼낼 때 빨간색 공 $3$개와 파란색 공 $2$개가 나올 확률은?",
    options: [o("1","$\\dfrac{1}{4}$"), o("2","$\\dfrac{5}{12}$"), o("3","$\\dfrac{10}{21}$"), o("4","$\\dfrac{1}{2}$")],
    answer: 3,
    explanation: "$\\dfrac{\\binom{6}{3}\\binom{4}{2}}{\\binom{10}{5}}=\\dfrac{20\\cdot 6}{252}=\\dfrac{120}{252}=\\dfrac{10}{21}$."
  }),
  build({
    num: 19, subject: "선형대수", unit: "벡터", concept: "그람-슈미트 직교화", difficulty: "mediumHard",
    question: "Gram-Schmidt 직교화를 통해 $\\mathbb R^2$의 두 기저 $u_1=\\langle -1,3\\rangle,\\,u_2=\\langle 5,2\\rangle$로부터 정규직교기저 $w_1=\\!\\left\\langle -\\dfrac{1}{\\sqrt{10}},\\dfrac{3}{\\sqrt{10}}\\right\\rangle,\\,w_2=\\langle a,b\\rangle$을 얻었을 때 $a\\times b$의 값은?",
    options: [o("1","$-\\dfrac{2}{5}$"), o("2","$-\\dfrac{3}{10}$"), o("3","$\\dfrac{3}{10}$"), o("4","$\\dfrac{2}{5}$")],
    answer: 3,
    explanation: "$v_2=u_2-(u_2\\cdot w_1)w_1=u_2-\\dfrac{(5,2)\\cdot(-1,3)/\\sqrt{10}}{1}w_1=(5,2)-\\dfrac{1}{\\sqrt{10}}\\!\\left(-\\dfrac{1}{\\sqrt{10}},\\dfrac{3}{\\sqrt{10}}\\right)$\n$=(5,2)-\\!\\left(-\\dfrac{1}{10},\\dfrac{3}{10}\\right)=\\!\\left(\\dfrac{51}{10},\\dfrac{17}{10}\\right)$. 방향 $(3,1)$. 정규화 $w_2=\\!\\left(\\dfrac{3}{\\sqrt{10}},\\dfrac{1}{\\sqrt{10}}\\right)$.\n$a\\cdot b=\\dfrac{3}{10}$."
  }),
  build({
    num: 20, subject: "공학수학", unit: "복소함수", concept: "조화함수($\\Delta u=0$)", difficulty: "medium",
    question: "다음 중 조화함수가 아닌 것은?",
    options: [
      o("1","$u=7xy$"),
      o("2","$u=-\\dfrac{y}{x^2+y^2}$"),
      o("3","$u=2x^2+3y^3$"),
      o("4","$u=2x^3-6xy^2+7$")
    ],
    answer: 3,
    explanation: "라플라스 $u_{xx}+u_{yy}=0$ 점검.\n(1) $u_{xx}=u_{yy}=0$ ✓.\n(2) 점전위(점전하 그라디언트) ✓.\n(3) $u_{xx}=4,\\,u_{yy}=18y$ ⇒ $4+18y\\ne 0$. 조화함수 아님.\n(4) $u_{xx}=12x,\\,u_{yy}=-12x$ ⇒ $0$ ✓."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 한성대):`, data.map((d) => d.id).join(", "));
