// Upload 2020년도 경기대 편입수학 기출 20문항 (26~45번, 4지선다)
// Usage: node scripts/upload_general_2020_kyonggi.mjs
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

const SCHOOL = "경기대";
const YEAR = "2020";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });

function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-kyonggi-${String(num).padStart(2, "0")}`;
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
    num: 26, subject: "미분학", unit: "극한과 연속", concept: "극한 명제 판정", difficulty: "medium",
    question: "두 함수 $f,g:\\mathbb R\\to\\mathbb R$에 대하여 다음 중 항상 참인 것을 고르면? (1) 극한 $\\displaystyle\\lim_{x\\to a}\\{f(x)+g(x)\\}$가 존재하면 두 극한 $\\lim_{x\\to a}f(x),\\ \\lim_{x\\to a}g(x)$은 존재한다. (2) 극한 $\\displaystyle\\lim_{x\\to a}e^{f(x)}$가 존재하고 양수이면 극한 $\\lim_{x\\to a}f(x)$은 존재한다. (3) 좌극한 $\\displaystyle\\lim_{x\\to a^-}f(x)$과 우극한 $\\lim_{x\\to a^+}f(x)$이 존재하면 극한 $\\lim_{x\\to a}f(x)$은 존재한다. (4) 극한 $\\displaystyle\\lim_{x\\to a}\\dfrac{f(x)}{g(x)}$가 존재하고 $f$와 $g$가 모든 실수에서 미분가능하면 극한 $\\displaystyle\\lim_{x\\to a}\\dfrac{f'(x)}{g'(x)}$는 존재한다.",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)")],
    answer: 2,
    explanation: "(1) 거짓 (반례: $f=\\tfrac{1}{x},g=-\\tfrac{1}{x}$. 합은 0 수렴, 각각 발산). (2) 참. $\\lim e^{f(x)}=\\alpha>0$이면 $\\ln\\alpha$로 $\\lim f(x)$ 존재. (3) 거짓. 좌·우극한이 다를 수 있음. (4) 거짓. 로피탈은 $\\tfrac{0}{0}$ 또는 $\\tfrac{\\infty}{\\infty}$ 꼴에서만 사용 가능. 분수 극한 존재해도 도함수 비율 극한 X일 수 있음. 정답 (2)."
  }),
  build({
    num: 27, subject: "미분학", unit: "극한과 연속", concept: "Maclaurin급수 극한", difficulty: "medium",
    question: "극한 $\\displaystyle\\lim_{x\\to 0}\\dfrac{x(\\cos x-1)}{\\sin x-x}$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 3,
    explanation: "$\\dfrac{0}{0}$ 꼴이라 Maclaurin 급수: $\\cos x-1=-\\tfrac{x^2}{2}+\\tfrac{x^4}{24}-\\cdots$, $\\sin x-x=-\\tfrac{x^3}{6}+\\tfrac{x^5}{120}-\\cdots$. 분자 $x(\\cos x-1)=-\\tfrac{x^3}{2}+\\tfrac{x^5}{24}-\\cdots$. 분모 $-\\tfrac{x^3}{6}+\\cdots$. 최저차 비율: $\\dfrac{-1/2}{-1/6}=3$."
  }),
  build({
    num: 28, subject: "적분학", unit: "정적분의 계산", concept: "이상적분 수렴 조건", difficulty: "medium",
    question: "이상적분 $\\displaystyle\\int_1^2 \\dfrac{1}{x(\\ln x)^p}\\,dx$이 수렴하는 양의 실수 $p$의 범위는?",
    options: [o("1","$p>1$"), o("2","$0<p<1$"), o("3","$p>2$"), o("4","$0<p<2$")],
    answer: 2,
    explanation: "$\\ln x=t$로 치환($\\dfrac{1}{x}dx=dt$). $x=1\\to t=0$, $x=2\\to t=\\ln 2$. 식 = $\\int_0^{\\ln 2}\\dfrac{1}{t^p}dt$. 0 근처에서 수렴 조건: $p<1$. 양수 조건과 합쳐 $0<p<1$."
  }),
  build({
    num: 29, subject: "미분학", unit: "극한과 연속", concept: "0에서 미분가능성 판정", difficulty: "medium",
    question: "다음 중 $x=0$에서 미분가능하지 않은 함수를 고르면? (1) $f(x)=\\begin{cases}\\dfrac{\\sin x}{x} & x\\ne 0\\\\1 & x=0\\end{cases}$ (2) $f(x)=\\begin{cases}x^2\\cos\\!\\left(\\dfrac{1}{x^3}\\right) & x\\ne 0\\\\0 & x=0\\end{cases}$ (3) $f(x)=\\begin{cases}e^{-1/x^2} & x\\ne 0\\\\0 & x=0\\end{cases}$ (4) $f(x)=\\begin{cases}x\\tan\\!\\left(\\dfrac{1}{x}\\right) & x\\ne 0\\\\0 & x=0\\end{cases}$",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)")],
    answer: 4,
    explanation: "$f'(0)=\\lim_{h\\to 0}\\dfrac{f(0+h)-f(0)}{h}$ 검사. (1) $\\dfrac{\\sin h/h - 1}{h}=\\dfrac{\\sin h-h}{h^2}\\to 0$ (Maclaurin). 미분 가능. (2) $\\dfrac{h^2\\cos(1/h^3)}{h}=h\\cos(1/h^3)\\to 0$ (유계×0). 미분 가능. (3) $\\dfrac{e^{-1/h^2}}{h}$, $\\tfrac{1}{h}=t$로 치환하면 $t e^{-t^2}\\to 0$. 미분 가능. (4) $\\dfrac{h\\tan(1/h)}{h}=\\tan(1/h)$, $h\\to 0$일 때 $1/h\\to\\infty$로 $\\tan$가 진동·발산. $f'(0)$ 존재 X. 정답 (4)."
  }),
  build({
    num: 30, subject: "다변수함수", unit: "편도함수", concept: "최대 감소 방향 도함수", difficulty: "easyMedium",
    question: "함수 $f(x,y)=x^2+y^2$에 대해 점 $(1,1)$에서 함숫값이 가장 빨리 감소하는 방향의 단위 벡터를 $\\vec v$라 할 때, 방향미분 $D_v f(1,1)$의 값은?",
    options: [o("1","$\\sqrt 6$"), o("2","$-\\sqrt 6$"), o("3","$\\sqrt 8$"), o("4","$-\\sqrt 8$")],
    answer: 4,
    explanation: "최대 감소 방향 = 경도의 반대 방향. $\\nabla f=(2x,2y)$, $(1,1)$에서 $(2,2)$. 반대 단위벡터 $\\vec v=-\\dfrac{1}{\\sqrt 2}(1,1)$. 최대 감소 시 방향도함수 = $-|\\nabla f| = -\\sqrt{4+4}=-\\sqrt 8$."
  }),
  build({
    num: 31, subject: "선형대수", unit: "행렬", concept: "선형사상/위수 명제", difficulty: "medium",
    question: "$n\\times n$ 행렬 $A,B$에 대하여 <보기>에서 항상 참인 것을 모두 고르면? 가. $A\\ne O$이고 임의의 $x\\in\\mathbb R^n$에 대하여 $Ax=0$인 $A$가 존재한다. 나. $AB=O$이면 $A=O$ 또는 $B=O$이다. 다. $\\text{rank}(A)=n$이고 $Ax=0$이면 $x=0$이다. 라. $x=0$일 때만 $Ax=0$이면 $\\text{rank}(A)=n$이다.",
    options: [o("1","가, 나"), o("2","나, 다"), o("3","다, 라"), o("4","가, 라")],
    answer: 3,
    explanation: "가. 거짓. 모든 $x$에 대해 $Ax=0$이려면 $A=O$. 모순. 나. 거짓. 반례: $A=\\begin{pmatrix}1&0\\\\0&0\\end{pmatrix},B=\\begin{pmatrix}0&0\\\\0&1\\end{pmatrix}$이면 $AB=O$이지만 둘 다 0 아님. 다. 참. rank=$n$이면 가역, $Ax=0$의 해는 자명해뿐. 라. 참. 핵 차원 0 → rank=$n$. 정답 다, 라."
  }),
  build({
    num: 32, subject: "선형대수", unit: "고유치와 대각화", concept: "선형사상 고유공간 차원", difficulty: "mediumHard",
    question: "$P_5$가 $5$차 이하 다항식의 벡터공간이라 할 때, 선형사상 $T:P_5\\to P_5$를 임의의 $p(x)\\in P_5$에 대하여 $T(p(x))=p(-x)$로 정의하자. $T$의 고윳값 $1$에 대응하는 고유공간의 차원은?",
    options: [o("1","$2$"), o("2","$3$"), o("3","$4$"), o("4","$5$")],
    answer: 2,
    explanation: "$T(p(x))=p(-x)=p(x)$이려면 $p$가 우함수(짝수 차수항만). 5차 이하 우함수 다항식: $1, x^2, x^4$ → 차원 3."
  }),
  build({
    num: 33, subject: "선형대수", unit: "행렬", concept: "블록 대각 행렬식", difficulty: "easyMedium",
    question: "실수 $\\theta,\\psi$에 대하여 $A=\\begin{pmatrix}\\cos\\theta & -\\sin\\theta & 0 & 0\\\\\\sin\\theta & \\cos\\theta & 0 & 0\\\\0 & 0 & \\cos\\psi & -\\sin\\psi\\\\0 & 0 & \\sin\\psi & \\cos\\psi\\end{pmatrix}$일 때, $\\det(A)$의 값은?",
    options: [o("1","$1$"), o("2","$-1$"), o("3","$2$"), o("4","$-2$")],
    answer: 1,
    explanation: "블록 대각행렬이므로 $\\det A = \\det\\!\\begin{pmatrix}\\cos\\theta & -\\sin\\theta\\\\\\sin\\theta & \\cos\\theta\\end{pmatrix}\\cdot\\det\\!\\begin{pmatrix}\\cos\\psi & -\\sin\\psi\\\\\\sin\\psi & \\cos\\psi\\end{pmatrix} = (\\cos^2\\theta+\\sin^2\\theta)(\\cos^2\\psi+\\sin^2\\psi) = 1\\cdot 1 = 1$."
  }),
  build({
    num: 34, subject: "선형대수", unit: "행렬", concept: "trace/det 성질", difficulty: "medium",
    question: "$n\\times n$ 행렬 $A,B$에 대하여 <보기>에서 항상 참인 것을 모두 고르면? 가. $\\text{tr}(AB)=\\text{tr}(BA)$  나. $\\text{tr}(A+B)=\\text{tr}(A)+\\text{tr}(B)$  다. $\\det(AB)=\\det(BA)$  라. $\\det(A+B)=\\det(A)+\\det(B)$",
    options: [o("1","가, 나"), o("2","나, 다"), o("3","가, 나, 다"), o("4","나, 다, 라")],
    answer: 3,
    explanation: "가. 참. trace 순환성. 나. 참. trace 선형성. 다. 참. $\\det(AB)=\\det A\\cdot\\det B = \\det B\\cdot\\det A = \\det(BA)$. 라. 거짓. 일반적으로 행렬식은 합에 대해 분배되지 않음. 반례: $A=\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix},B=\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$. 정답 가, 나, 다."
  }),
  build({
    num: 35, subject: "선형대수", unit: "벡터공간", concept: "함수 부분공간 판정", difficulty: "easyMedium",
    question: "다음 중 함수의 벡터공간 $F(\\mathbb R)=\\{f\\,|\\,f:\\mathbb R\\to\\mathbb R\\}$의 부분공간이 될 수 없는 것은? (1) $\\{f\\in F(\\mathbb R)\\,|\\,f$는 $2$차다항식$\\}$ (2) $\\{f\\in F(\\mathbb R)\\,|\\,f$는 연속함수$\\}$ (3) $\\{f\\in F(\\mathbb R)\\,|\\,f$는 우함수$\\}$ (4) $\\{f\\in F(\\mathbb R)\\,|\\,f$는 기함수$\\}$",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)")],
    answer: 1,
    explanation: "(1) 거짓. 반례: $f_1=x^2,f_2=-x^2$이면 $f_1+f_2=0$으로 2차 함수가 아님(영함수는 0차). 즉 합에 대해 닫혀 있지 않음 + 영원소 (0)는 2차 다항식이 아니라 부분공간 아님. (2) 영함수 연속, 합·스칼라곱 닫힘 → 부분공간. (3) 영함수 우함수, 우함수의 합·스칼라배 우함수 → 부분공간. (4) 같은 이유로 부분공간."
  }),
  build({
    num: 36, subject: "적분학", unit: "급수의 수렴/발산", concept: "수렴 판정 종합", difficulty: "medium",
    question: "<보기>에서 수렴하는 급수를 모두 고르면? 가. $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-1)^n}{\\sqrt n}$  나. $\\displaystyle\\sum_{n=1}^{\\infty}\\tan\\dfrac{1}{n}$  다. $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n!}{n^n}$  라. $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n!}{(10^{10})^n}$",
    options: [o("1","가, 나"), o("2","가, 다"), o("3","나, 다"), o("4","나, 라")],
    answer: 2,
    explanation: "가. 교대급수, $\\tfrac{1}{\\sqrt n}\\to 0$ 단조감소 → 수렴. 나. $\\tan\\tfrac{1}{n}\\sim\\tfrac{1}{n}$ → 발산($\\sum\\tfrac{1}{n}$). 다. 비율판정: $\\dfrac{a_{n+1}}{a_n}=\\dfrac{(n+1)!\\cdot n^n}{n!\\cdot(n+1)^{n+1}}=\\!\\left(\\dfrac{n}{n+1}\\right)^n\\to\\dfrac{1}{e}<1$ → 수렴. 라. 비율 $\\dfrac{n+1}{10^{10}}\\to\\infty$ → 발산. 정답 가, 다."
  }),
  build({
    num: 37, subject: "적분학", unit: "급수의 수렴/발산", concept: "홀짝 분리 (1/n³)", difficulty: "medium",
    question: "$\\dfrac{\\displaystyle\\sum_{n=1,\\ n\\text{은 홀수}}^{\\infty}\\dfrac{1}{n^3}}{\\displaystyle\\sum_{n=2,\\ n\\text{은 짝수}}^{\\infty}\\dfrac{1}{n^3}}$의 값은?",
    options: [o("1","$7$"), o("2","$8$"), o("3","$9$"), o("4","$10$")],
    answer: 1,
    explanation: "전체 $\\sum_{n=1}^{\\infty}\\dfrac{1}{n^3}=k$로 두면 짝수 부분: $\\sum\\dfrac{1}{(2n)^3}=\\dfrac{1}{8}\\sum\\dfrac{1}{n^3}=\\dfrac{k}{8}$. 홀수 부분 = 전체 - 짝수 = $k-\\dfrac{k}{8}=\\dfrac{7k}{8}$. 비율 = $\\dfrac{7k/8}{k/8}=7$."
  }),
  build({
    num: 38, subject: "다변수함수", unit: "편도함수", concept: "전미분(근사값)", difficulty: "medium",
    question: "$4\\sqrt{4.01}(\\ln(0.98)+1)$의 근사 값으로 가장 적절한 것은?",
    options: [o("1","$7.84$"), o("2","$7.85$"), o("3","$7.86$"), o("4","$7.87$")],
    answer: 2,
    explanation: "$z(x,y)=4\\sqrt x(\\ln y+1)$로 두면 $z(4,1)=4\\cdot 2\\cdot 1=8$. 전미분: $dz=z_x dx+z_y dy = \\dfrac{2}{\\sqrt x}(\\ln y+1)dx+\\dfrac{4\\sqrt x}{y}dy$. $(x,y)=(4,1)$, $dx=0.01,dy=-0.02$ 대입: $dz=\\tfrac{2}{2}\\cdot 1\\cdot 0.01+\\tfrac{8}{1}\\cdot(-0.02)=0.01-0.16=-0.15$. 근사값 $\\approx 8-0.15=7.85$."
  }),
  build({
    num: 39, subject: "다변수함수", unit: "중적분", concept: "대칭성을 이용한 이중적분", difficulty: "easyMedium",
    question: "영역 $D$가 원 $x^2+(y-1)^2=1$의 내부일 때, 이중적분 $\\displaystyle\\iint_D x\\,dA$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$")],
    answer: 1,
    explanation: "원의 중심 $(0,1)$이 $y$축 위에 있어서 영역 $D$는 $y$축에 대해 대칭. 피적분함수 $f(x,y)=x$는 $x$에 대해 기함수. 대칭 영역에서 기함수 적분 = 0."
  }),
  build({
    num: 40, subject: "다변수함수", unit: "체적과 곡면적", concept: "두 포물면 사이 부피", difficulty: "medium",
    question: "두 포물면 $y=x^2+z^2$와 $y=2-x^2-z^2$로 둘러싸인 입체의 부피는?",
    options: [o("1","$\\pi$"), o("2","$2\\pi$"), o("3","$3\\pi$"), o("4","$4\\pi$")],
    answer: 1,
    explanation: "두 포물면 교선: $x^2+z^2=2-x^2-z^2 \\Rightarrow x^2+z^2=1$ ($y=1$). 영역 $D:x^2+z^2\\le 1$. 부피 $V=\\iint_D[(2-x^2-z^2)-(x^2+z^2)]dA = 2\\iint_D(1-x^2-z^2)dA$. 극좌표 $x=r\\cos\\theta,z=r\\sin\\theta$: $V=2\\int_0^{2\\pi}\\int_0^1(1-r^2)r\\,dr\\,d\\theta = 2\\cdot 2\\pi\\cdot[\\tfrac{r^2}{2}-\\tfrac{r^4}{4}]_0^1 = 4\\pi\\cdot\\tfrac{1}{4}=\\pi$."
  }),
  build({
    num: 41, subject: "선형대수", unit: "행렬", concept: "영공간 차원 (rank-nullity)", difficulty: "medium",
    question: "$3\\times 4$행렬 $A$에 대하여 $A\\binom{1\\ 0\\ 0\\ 0}{}=\\binom{0\\ 1\\ 0}{}$일 때, $A$의 영공간의 차원으로 가능한 값의 최대와 최소의 합은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 4,
    explanation: "$A$는 $3\\times 4$. Rank-Nullity: $\\text{rank}+\\text{nullity}=4$. $A\\vec e_1=(0,1,0)\\ne 0$이므로 $A\\ne O$ → $\\text{rank}\\ge 1$. 최대 rank는 $\\min(3,4)=3$이므로 nullity 최소 = $4-3=1$. 최소 rank는 1 (위 조건 때문) → nullity 최대 = $4-1=3$. 합 = $1+3=4$."
  }),
  build({
    num: 42, subject: "선형대수", unit: "행렬", concept: "선형사상의 위수(rank)", difficulty: "mediumHard",
    question: "주어진 벡터 $\\vec v\\in\\mathbb R^3\\ (\\vec v\\ne 0)$에 대하여 선형사상 $T:\\mathbb R^3\\to\\mathbb R^3$를 $T(\\vec x)=\\vec x\\times\\vec v+(\\vec x\\cdot\\vec v)\\vec v$로 정의 할 때, $T$의 위수($\\text{rank}$)는?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$")],
    answer: 4,
    explanation: "$\\vec v=(1,0,0)$로 두자(일반성 잃지 않음). $\\vec x=(a,b,c)$이면 $\\vec x\\times\\vec v=(0,c,-b)$, $(\\vec x\\cdot\\vec v)\\vec v=(a,0,0)$. 합: $T(a,b,c)=(a,c,-b)$. 행렬 $T=\\begin{pmatrix}1&0&0\\\\0&0&1\\\\0&-1&0\\end{pmatrix}$. $\\det=1\\cdot(0\\cdot 0-1\\cdot(-1))=1\\ne 0$ → rank 3."
  }),
  build({
    num: 43, subject: "선형대수", unit: "고유치와 대각화", concept: "$\\text{tr}(A^{-1})$ (고윳값 역수)", difficulty: "medium",
    question: "$4\\times 4$행렬 $A$의 특성(고유)다항식이 $(\\lambda-1)(\\lambda-2)(\\lambda-3)(\\lambda-6)$일 때, $\\text{tr}(A^{-1})$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 2,
    explanation: "$A$의 고윳값 $1,2,3,6$. $A^{-1}$의 고윳값은 $\\dfrac{1}{1},\\dfrac{1}{2},\\dfrac{1}{3},\\dfrac{1}{6}$. $\\text{tr}(A^{-1})=$ 고윳값의 합 = $1+\\tfrac{1}{2}+\\tfrac{1}{3}+\\tfrac{1}{6}=\\dfrac{6+3+2+1}{6}=\\dfrac{12}{6}=2$."
  }),
  build({
    num: 44, subject: "선형대수", unit: "고유치와 대각화", concept: "rank 1 행렬 고윳값", difficulty: "medium",
    question: "$4\\times 4$행렬 $A=\\begin{pmatrix}1\\\\2\\\\3\\\\4\\end{pmatrix}\\!(1\\ 2\\ 3\\ 4)$에 대하여 $0$이 아닌 모든 고윳값의 곱은?",
    options: [o("1","$10$"), o("2","$20$"), o("3","$30$"), o("4","$40$")],
    answer: 3,
    explanation: "$A=uv^T$ 꼴(rank 1). 0이 아닌 고윳값은 $\\text{tr}(A) = u^T v = 1+4+9+16=30$ (단 한 개). 정답 30."
  }),
  build({
    num: 45, subject: "선형대수", unit: "고유치와 대각화", concept: "직교 대각화 가능성", difficulty: "medium",
    question: "$n\\times n$ (실)행렬 $A$에 대하여 <보기>에서 항상 참인 것을 모두 고르면? 가. $A$가 $n$개의 (실)고유벡터로 이루어진 직교집합을 가지면 $A$는 대칭행렬이다. 나. $A^T A$는 직교대각화 가능하다. 다. $A+A^T$는 직교 대각화 가능하다. 라. $A$가 대각화 가능하면 직교대각화 가능하다.",
    options: [o("1","가, 나"), o("2","나, 다"), o("3","가, 나, 다"), o("4","나, 다, 라")],
    answer: 3,
    explanation: "가. 참. 직교 고유벡터로 분해 가능 ↔ 대칭. 나. 참. $(A^T A)^T = A^T A$ → 대칭 → 직교 대각화. 다. 참. $(A+A^T)^T = A+A^T$ → 대칭 → 직교 대각화. 라. 거짓. 대각화 가능해도 직교 대각화 가능은 더 강한 조건(대칭 필요). 정답 가, 나, 다."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error(error); process.exit(1); }
console.log("Inserted:");
for (const r of data) console.log(`  - ${r.id}  [${r.subject}/${r.unit}/${r.difficulty}]`);
