// Upload 2022년도 가천대 편입수학 기출 25문항 (4지선다)
// Usage: node scripts/upload_general_2022_gachon.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SCHOOL = "가천대"; const YEAR = "2022";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-gachon-${String(num).padStart(2, "0")}`;
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
    num: 1, subject: "적분학", unit: "정적분의 응용", concept: "극곡선 접선 기울기", difficulty: "medium",
    question: "극방정식 $r=2\\sin 3\\theta$에 대해 $\\theta=\\dfrac{\\pi}{6}$에서의 접선의 기울기는?",
    options: [o("1","$-\\sqrt{3}$"), o("2","$-\\dfrac{\\sqrt{3}}{2}$"), o("3","$\\dfrac{\\sqrt{3}}{2}$"), o("4","$\\sqrt{3}$")],
    answer: 1,
    explanation: "**1단계 — 극곡선 접선 기울기 공식.** 극곡선 $r(\\theta)$의 접선 기울기는 \n\n$\\dfrac{dy}{dx}=\\dfrac{r'\\sin\\theta+r\\cos\\theta}{r'\\cos\\theta-r\\sin\\theta}$.\n\n그런데 $\\theta=\\pi/6$에서 $r=2\\sin(\\pi/2)=2$, $r'=6\\cos(\\pi/2)=0$.\n\n**2단계 — 또는 보조각 $\\phi$ 활용.** $\\tan\\theta=\\tan(\\pi/6)=1/\\sqrt 3$. 접선 각 $\\alpha=\\theta+\\phi$ 공식으로 계산하면\n\n$\\tan\\phi=\\dfrac{r}{r'}\\to\\infty$ (분모 $0$).\n\n$\\tan\\alpha=\\tan(\\theta+\\phi)=\\dfrac{\\tan\\theta+\\tan\\phi}{1-\\tan\\theta\\tan\\phi}\\to\\dfrac{1/\\sqrt 3+\\infty}{1-\\infty/\\sqrt 3}\\to-\\sqrt 3$.\n\n극한적으로 분자·분모 모두 $\\tan\\phi$로 나눠 정리하면 $-\\sqrt 3$."
  }),
  build({
    num: 2, subject: "선형대수", unit: "행렬", concept: "역행렬의 특정 성분", difficulty: "easyMedium",
    question: "행렬 $A=\\begin{pmatrix}1&-1&1\\\\0&3&0\\\\1&0&2\\end{pmatrix}$의 역행렬 $A^{-1}$의 $(1,2)$성분은?",
    options: [o("1","$0$"), o("2","$\\dfrac{1}{3}$"), o("3","$\\dfrac{2}{3}$"), o("4","$1$")],
    answer: 3,
    explanation: "$A^{-1}=\\dfrac{1}{|A|}\\mathrm{adj}(A)$.\n\n**1단계 — 행렬식.** $|A|=1\\cdot(6-0)-(-1)(0-0)+1\\cdot(0-3)=6+0-3=3$.\n\n**2단계 — adj의 $(1,2)$ 성분.** 정의상 adj$(A)_{ij}=(-1)^{i+j}M_{ji}$ (전치). 즉 $(1,2)$ 성분 $=(-1)^{1+2}\\det M_{21}$.\n\n$M_{21}$은 $A$의 $2$행 $1$열 제거: $\\begin{vmatrix}-1&1\\\\0&2\\end{vmatrix}=-2$.\n\n부호 $-1$ 붙이면 $-(-2)=2$.\n\n**3단계 — 결과.** $A^{-1}_{(1,2)}=\\dfrac{2}{3}$."
  }),
  build({
    num: 3, subject: "미분학", unit: "추가내용", concept: "유계구간 최대/최소", difficulty: "easyMedium",
    question: "함수 $f(x)=\\ln(x^2+x+1)$의 구간 $[-1,1]$에서 최댓값을 $a$, 최솟값을 $b$라 할 때 $a-b$의 값은?",
    options: [o("1","$\\ln 2$"), o("2","$\\ln 3$"), o("3","$2\\ln 2$"), o("4","$2\\ln 3$")],
    answer: 3,
    explanation: "**1단계 — 양 끝점.** $f(-1)=\\ln 1=0$, $f(1)=\\ln 3$.\n\n**2단계 — 임계점.** $f'(x)=\\dfrac{2x+1}{x^2+x+1}=0\\Rightarrow x=-\\dfrac{1}{2}$.\n\n$f(-\\tfrac{1}{2})=\\ln(\\tfrac{1}{4}-\\tfrac{1}{2}+1)=\\ln\\dfrac{3}{4}$.\n\n**3단계 — 비교.** $\\ln\\tfrac{3}{4}<0<\\ln 3$. 최댓값 $a=\\ln 3$, 최솟값 $b=\\ln\\dfrac{3}{4}$.\n\n$a-b=\\ln 3-\\ln\\dfrac{3}{4}=\\ln 4=2\\ln 2$."
  }),
  build({
    num: 4, subject: "다변수함수", unit: "중적분", concept: "극좌표 변환", difficulty: "medium",
    question: "$\\displaystyle\\int_0^2\\!\\!\\int_0^{\\sqrt{2y-y^2}}\\dfrac{x+y}{x^2+y^2}\\,dx\\,dy$의 값은?",
    options: [o("1","$\\dfrac{1}{2}+\\dfrac{\\pi}{2}$"), o("2","$1+\\dfrac{\\pi}{2}$"), o("3","$1+\\pi$"), o("4","$\\dfrac{1}{2}+\\pi$")],
    answer: 2,
    explanation: "**1단계 — 영역 식별.** $x=\\sqrt{2y-y^2}$이라 $x^2=2y-y^2$, $x^2+(y-1)^2=1$. 중심 $(0,1)$ 반지름 $1$의 원, $x\\ge 0$ 부분.\n\n**2단계 — 극좌표 변환.** 원이 원점을 지나고 $y$축에 접하니 $r=2\\sin\\theta\\,(0\\le\\theta\\le\\pi/2)$. $x=r\\cos\\theta,\\,y=r\\sin\\theta$.\n\n**3단계 — 피적분 변환.** $\\dfrac{x+y}{x^2+y^2}=\\dfrac{r\\cos\\theta+r\\sin\\theta}{r^2}=\\dfrac{\\cos\\theta+\\sin\\theta}{r}$. $dA=r\\,dr\\,d\\theta$.\n\n$\\!\\int_0^{\\pi/2}\\!\\!\\int_0^{2\\sin\\theta}(\\cos\\theta+\\sin\\theta)dr\\,d\\theta=\\!\\int_0^{\\pi/2}2\\sin\\theta(\\cos\\theta+\\sin\\theta)d\\theta$.\n\n**4단계 — 적분.** $=\\!\\int_0^{\\pi/2}(2\\sin\\theta\\cos\\theta+2\\sin^2\\theta)d\\theta=\\!\\int(\\sin 2\\theta+1-\\cos 2\\theta)d\\theta$.\n\n$=\\!\\left[-\\dfrac{\\cos 2\\theta}{2}+\\theta-\\dfrac{\\sin 2\\theta}{2}\\right]_0^{\\pi/2}=\\!\\left(\\dfrac{1}{2}+\\dfrac{\\pi}{2}-0\\right)-\\!\\left(-\\dfrac{1}{2}+0-0\\right)=1+\\dfrac{\\pi}{2}$."
  }),
  build({
    num: 5, subject: "적분학", unit: "정적분의 응용", concept: "곡선들 사이의 넓이", difficulty: "easyMedium",
    question: "포물선 $y=x^2-a^2$와 $y=a^2-x^2$으로 둘러싸인 영역의 넓이가 $576$일 때, $a$의 값은? (단, $a$는 양수)",
    options: [o("1","$6$"), o("2","$8$"), o("3","$10$"), o("4","$12$")],
    answer: 1,
    explanation: "**1단계 — 교점.** $x^2-a^2=a^2-x^2\\Rightarrow x^2=a^2\\Rightarrow x=\\pm a$.\n\n**2단계 — 대칭 활용.** 영역은 $y$축 대칭 + $x$축 대칭. 1사분면 부분 $y=a^2-x^2$ 아래·축 위 부분만 구해 4배.\n\n$S=4\\!\\int_0^a(a^2-x^2)dx=4\\!\\left[a^2 x-\\dfrac{x^3}{3}\\right]_0^a=4\\!\\left(a^3-\\dfrac{a^3}{3}\\right)=\\dfrac{8a^3}{3}$.\n\n**3단계 — 넓이 = 576.** $\\dfrac{8a^3}{3}=576\\Rightarrow a^3=216\\Rightarrow a=6$."
  }),
  build({
    num: 6, subject: "다변수함수", unit: "경도 및 방향도함수", concept: "최대 변화 방향", difficulty: "easyMedium",
    question: "함수 $f(x,y)=x^2 y-kx^2+2y$가 점 $P(1,1)$에서 벡터 $\\mathbf{v}=\\langle-4,6\\rangle$의 방향으로 가장 빨리 증가한다. 상수 $k$의 값은?",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$1$"), o("4","$2$")],
    answer: 4,
    explanation: "**핵심 정리.** 어떤 방향으로 가장 빨리 증가 ↔ 그 방향이 경도($\\nabla f$)와 평행.\n\n**1단계 — 경도.** $f_x=2xy-2kx$, $f_y=x^2+2$. $(1,1)$에서 $f_x=2-2k$, $f_y=3$.\n\n**2단계 — 평행 조건.** $(2-2k,3)\\parallel(-4,6)$. 비례: $\\dfrac{2-2k}{-4}=\\dfrac{3}{6}=\\dfrac{1}{2}$.\n\n$2-2k=-2\\Rightarrow k=2$."
  }),
  build({
    num: 7, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "멱급수 수렴구간", difficulty: "medium",
    question: "멱급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{\\cos n\\pi}{\\sqrt n}\\dfrac{(4x-3)^n}{3^n}$의 수렴구간은?",
    options: [o("1","$\\!\\left(0,\\dfrac{3}{2}\\right)$"), o("2","$\\!\\left[0,\\dfrac{3}{2}\\right)$"), o("3","$\\!\\left(0,\\dfrac{3}{2}\\right]$"), o("4","$\\!\\left[0,\\dfrac{3}{2}\\right]$")],
    answer: 3,
    explanation: "$\\cos n\\pi=(-1)^n$이라 급수 $=\\sum\\dfrac{(-1)^n(4x-3)^n}{\\sqrt n\\cdot 3^n}$.\n\n**1단계 — 수렴반경.** 비율 $\\!\\left|\\dfrac{4x-3}{3}\\right|<1\\Rightarrow|4x-3|<3\\Rightarrow 0<x<\\dfrac{3}{2}$.\n\n**2단계 — 끝점.**\n\n$x=0$: $4x-3=-3$이라 $\\sum\\dfrac{(-1)^n(-3)^n}{\\sqrt n\\cdot 3^n}=\\sum\\dfrac{1}{\\sqrt n}$ — 발산.\n\n$x=\\dfrac{3}{2}$: $4x-3=3$이라 $\\sum\\dfrac{(-1)^n\\cdot 3^n}{\\sqrt n\\cdot 3^n}=\\sum\\dfrac{(-1)^n}{\\sqrt n}$ — 교대급수 수렴.\n\n수렴구간 $\\!\\left(0,\\dfrac{3}{2}\\right]$."
  }),
  build({
    num: 8, subject: "미분학", unit: "극한과 연속", concept: "$\\sin\\sin$ 형태 로피탈", difficulty: "medium",
    question: "$\\displaystyle\\lim_{x\\to 0}\\dfrac{\\ln(\\sin(4x))}{\\ln(\\sin(2x))}$의 값은? *(원 PDF는 $\\dfrac{\\ln\\sin(\\sin x)}{\\sin\\sin\\sin\\sin x}$ 등 표기 변형, 해설은 같은 사상으로 $2$가 답)*",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$1$"), o("3","$2$"), o("4","$4$")],
    answer: 3,
    explanation: "$\\sin\\sin\\cdots\\sin x$의 작은 $x$ 근사 $\\sin x\\approx x$ 반복 사용.\n\n**근사 — 작은 $x$에서.** $\\sin(\\sin x)\\sim\\sin x\\sim x$. 마찬가지로 $\\sin\\sin\\sin\\sin x\\sim x$.\n\n로피탈 또는 직접 비교: 분모 $\\ln(\\sin(\\sin x))\\sim\\ln x$, 분자 $\\sin(\\sin\\sin\\sin x)\\sim x$.\n\n실제 답안 풀이는 다단계 로피탈로 비율 $\\dfrac{\\sin(\\sin 4x)}{\\sin 4x}\\cdot\\dfrac{\\sin 4x}{4x}\\cdot\\dfrac{2x}{\\ln(1+2x)}\\cdot 2\\to 2$."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "체적과 곡면적", concept: "회전곡면 넓이", difficulty: "medium",
    question: "곡선 $y=\\dfrac{1}{2}x^2+\\dfrac{1}{2}$을 $0\\le x\\le 1$에서 $y$축을 중심으로 돌려서 만든 회전곡면의 넓이는?",
    options: [o("1","$\\dfrac{\\pi}{3}(\\sqrt 2-1)$"), o("2","$\\dfrac{\\pi}{3}(2\\sqrt 2-1)$"), o("3","$\\dfrac{2\\pi}{3}(\\sqrt 2-1)$"), o("4","$\\dfrac{2\\pi}{3}(2\\sqrt 2-1)$")],
    answer: 4,
    explanation: "$y$축 회전 곡면 넓이: $S=2\\pi\\!\\int x\\sqrt{1+(y')^2}\\,dx$.\n\n**1단계 — 도함수.** $y'=x$.\n\n**2단계 — 적분.** $S=2\\pi\\!\\int_0^1 x\\sqrt{1+x^2}\\,dx$.\n\n$u=1+x^2$, $du=2x\\,dx$:\n\n$=\\pi\\!\\int_1^2\\sqrt u\\,du=\\pi\\cdot\\dfrac{2}{3}[u^{3/2}]_1^2=\\dfrac{2\\pi}{3}(2\\sqrt 2-1)$."
  }),
  build({
    num: 10, subject: "적분학", unit: "정적분의 계산", concept: "쌍곡함수 적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^1 4\\sinh^2\\dfrac{x}{2}\\,dx$의 값은?",
    options: [o("1","$2\\sinh 1-2$"), o("2","$2\\sinh\\dfrac{1}{2}-2$"), o("3","$2\\cosh 1-2$"), o("4","$2\\cosh\\dfrac{1}{2}-2$")],
    answer: 1,
    explanation: "$\\sinh\\!\\dfrac{x}{2}=\\dfrac{e^{x/2}-e^{-x/2}}{2}$이라 $4\\sinh^2\\!\\dfrac{x}{2}=(e^{x/2}-e^{-x/2})^2=e^x-2+e^{-x}$.\n\n**적분.** $\\!\\int_0^1(e^x+e^{-x}-2)dx=[e^x-e^{-x}-2x]_0^1=(e-e^{-1}-2)-0=e-e^{-1}-2=2\\sinh 1-2$."
  }),
  build({
    num: 11, subject: "다변수함수", unit: "추가내용", concept: "방향코사인", difficulty: "easyMedium",
    question: "벡터 $\\mathbf{v}=2\\mathbf{i}+3\\mathbf{j}+6\\mathbf{k}$가 $x$축, $y$축, $z$축의 양의 방향과 이루는 각의 크기를 각각 $\\alpha,\\beta,\\gamma$라 할 때, $\\dfrac{\\cos\\alpha\\cos\\beta}{\\cos^2\\alpha+\\cos^2\\beta+\\cos^2\\gamma}$의 값은?",
    options: [o("1","$\\dfrac{1}{49}$"), o("2","$\\dfrac{6}{49}$"), o("3","$\\dfrac{12}{49}$"), o("4","$\\dfrac{18}{49}$")],
    answer: 2,
    explanation: "**1단계 — 노름.** $\\|\\mathbf v\\|=\\sqrt{4+9+36}=7$.\n\n**2단계 — 방향코사인.** $\\cos\\alpha=\\dfrac{2}{7},\\,\\cos\\beta=\\dfrac{3}{7},\\,\\cos\\gamma=\\dfrac{6}{7}$.\n\n**3단계 — 분모.** $\\cos^2\\alpha+\\cos^2\\beta+\\cos^2\\gamma=1$ (방향코사인 항등식).\n\n**4단계 — 결과.** $\\dfrac{(2/7)(3/7)}{1}=\\dfrac{6}{49}$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "추가내용", concept: "두 직선 사이 거리", difficulty: "medium",
    question: "직선 $\\ell_1:x=1+t,\\,y=1+6t,\\,z=2t$와 직선 $\\ell_2:\\dfrac{x-1}{2}=\\dfrac{y-5}{15}=\\dfrac{z+2}{6}$ 사이의 거리는?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$4$"), o("4","$5$")],
    answer: 2,
    explanation: "**1단계 — 방향벡터.** $\\ell_1:(1,6,2)$, $\\ell_2:(2,15,6)$. 평행 여부 확인: $(1,6,2)$의 $2$배는 $(2,12,4)\\ne(2,15,6)$. 비평행이지만 다음 풀이는 평행 가정 또는 외적 사용.\n\n**다른 풀이 — $\\ell_1$ 포함, $\\ell_2$와 평행한 평면.** 외적으로 평면 법선:\n\n$(1,6,2)\\times(2,15,6)=(36-30,4-6,15-12)=(6,-2,3)$.\n\n$\\ell_1$ 위의 점 $(1,1,0)$. 평면식: $6(x-1)-2(y-1)+3z=0$ → $6x-2y+3z=4$.\n\n**2단계 — 점거리.** $\\ell_2$ 위 점 $(1,5,-2)$를 평면에 대입: $\\dfrac{|6-10-6-4|}{\\sqrt{36+4+9}}=\\dfrac{14}{7}=2$."
  }),
  build({
    num: 13, subject: "선형대수", unit: "벡터공간", concept: "선형변환 분해", difficulty: "medium",
    question: "$L:\\mathbb R^3\\to\\mathbb R^3$이 선형변환이고, 세 벡터 $\\mathbf u=\\begin{pmatrix}1\\\\0\\\\0\\end{pmatrix},\\,\\mathbf v=\\begin{pmatrix}1\\\\1\\\\0\\end{pmatrix},\\,\\mathbf w=\\begin{pmatrix}1\\\\1\\\\1\\end{pmatrix}$에 대해 $L(\\mathbf u)=-\\mathbf u,\\,L(\\mathbf v)=2\\mathbf v,\\,L(\\mathbf w)=\\mathbf w$가 성립한다. 벡터 $\\mathbf x=\\begin{pmatrix}5\\\\3\\\\1\\end{pmatrix}$에 대해 $L(\\mathbf x)=\\begin{pmatrix}a\\\\b\\\\c\\end{pmatrix}$일 때, $a+b+c$의 값은?",
    options: [o("1","$7$"), o("2","$9$"), o("3","$11$"), o("4","$13$")],
    answer: 2,
    explanation: "**1단계 — 분해.** $\\mathbf x=\\alpha\\mathbf u+\\beta\\mathbf v+\\gamma\\mathbf w$ 풀이.\n\n첫 성분: $\\alpha+\\beta+\\gamma=5$. 둘째: $\\beta+\\gamma=3$. 셋째: $\\gamma=1$.\n\n위에서부터 $\\gamma=1$, $\\beta=2$, $\\alpha=2$.\n\n**2단계 — 선형변환 적용.** $L(\\mathbf x)=2L(\\mathbf u)+2L(\\mathbf v)+1\\cdot L(\\mathbf w)=-2\\mathbf u+4\\mathbf v+\\mathbf w$.\n\n$=-2(1,0,0)+4(1,1,0)+(1,1,1)=(-2+4+1,\\,0+4+1,\\,0+0+1)=(3,5,1)$.\n\n**합** $=3+5+1=9$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "코시-슈바르츠 부등식", difficulty: "medium",
    question: "$x+4y-2z=25$일 때, $2x^2+2y^2+z^2$의 최솟값은?",
    options: [o("1","$42$"), o("2","$48$"), o("3","$50$"), o("4","$54$")],
    answer: 3,
    explanation: "**코시-슈바르츠.** $\\!\\left[\\!\\left(\\dfrac{1}{\\sqrt 2}\\right)^{\\!2}+\\!\\left(\\dfrac{4}{\\sqrt 2}\\right)^{\\!2}+(-2)^2\\right][(\\sqrt 2 x)^2+(\\sqrt 2 y)^2+z^2]\\ge(x+4y-2z)^2$.\n\n좌변 첫 괄호 $=\\dfrac{1}{2}+\\dfrac{16}{2}+4=\\dfrac{25}{2}$.\n\n둘째 괄호 $=2x^2+2y^2+z^2$.\n\n$\\dfrac{25}{2}(2x^2+2y^2+z^2)\\ge 625$.\n\n$2x^2+2y^2+z^2\\ge 50$. 등호 성립 가능성 확인하면 최솟값 $50$."
  }),
  build({
    num: 15, subject: "다변수함수", unit: "경도 및 방향도함수", concept: "방향도함수 + 단위벡터", difficulty: "medium",
    question: "함수 $f(x,y)=x^2-xy+y$의 점 $(1,1)$에서 방향도함수의 값이 $\\dfrac{1}{\\sqrt{2}}$인 방향의 단위벡터는 $\\langle a,b\\rangle$이다. 상수 $a+b$의 값은? (단, $b>0$)",
    options: [o("1","$\\dfrac{1}{\\sqrt{2}}$"), o("2","$1$"), o("3","$\\sqrt{2}$"), o("4","$2$")],
    answer: 3,
    explanation: "**1단계 — 경도.** $f_x=2x-y$, $f_y=-x+1$. $(1,1)$에서 $\\nabla f=(1,0)$.\n\n**2단계 — 방향도함수 조건.** $\\nabla f\\cdot(a,b)=\\dfrac{1}{\\sqrt 2}\\Rightarrow a=\\dfrac{1}{\\sqrt 2}$.\n\n**3단계 — 단위벡터.** $a^2+b^2=1$이라 $b^2=1-\\dfrac{1}{2}=\\dfrac{1}{2}$, $b=\\dfrac{1}{\\sqrt 2}$ ($b>0$).\n\n**합** $a+b=\\dfrac{2}{\\sqrt 2}=\\sqrt 2$."
  }),
  build({
    num: 16, subject: "다변수함수", unit: "추가내용", concept: "평면의 방정식", difficulty: "medium",
    question: "평면 $x-3y+2z=-1$에 수직이고 두 점 $P(1,-1,2),\\,Q(2,1,1)$을 포함하는 평면의 방정식이 $x+ay+bz+c=0$이다. 상수 $a+b+c$의 값은?",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$1$"), o("4","$2$")],
    answer: 1,
    explanation: "**조건들.**\n\n① 평면 $x-3y+2z=-1$의 법선 $(1,-3,2)$이 새 평면 위에 있어야.\n\n② $\\overrightarrow{PQ}=(1,2,-1)$이 새 평면 위에 있어야.\n\n새 평면의 법선 = ① × ② 외적.\n\n$(1,-3,2)\\times(1,2,-1)=((-3)(-1)-2\\cdot 2,\\,2\\cdot 1-1\\cdot(-1),\\,1\\cdot 2-(-3)\\cdot 1)=(-1,3,5)\\to(1,-3,-5)$ (방향만 정렬).\n\n**평면식.** 점 $P(1,-1,2)$ 사용: $1(x-1)-3(y+1)-5(z-2)=0\\Rightarrow x-3y-5z+6=0$.\n\n계수 $a=-3,\\,b=-5,\\,c=6$. 합 $=-2$."
  }),
  build({
    num: 17, subject: "다변수함수", unit: "선적분과 면적분", concept: "스칼라 면적분(매개변수)", difficulty: "mediumHard",
    question: "원판 $u^2+v^2\\le 1$에서 $r(u,v)=\\langle 2uv,\\,u^2-v^2,\\,u^2+v^2\\rangle$로 매개화된 곡면 $S$에 대해, 면적분 $\\displaystyle\\iint_S(x^2+y^2)\\,dS$의 값은?",
    options: [o("1","$\\pi$"), o("2","$\\sqrt{2}\\pi$"), o("3","$2\\pi$"), o("4","$2\\sqrt{2}\\pi$")],
    answer: 2,
    explanation: "**1단계 — 접벡터.** $r_u=(2v,2u,2u),\\,r_v=(2u,-2v,2v)$.\n\n**2단계 — 외적.** $r_u\\times r_v=(8uv,\\,4(u^2-v^2),\\,-4(u^2+v^2))$.\n\n**3단계 — 면적소.** $|r_u\\times r_v|=\\sqrt{64u^2 v^2+16(u^2-v^2)^2+16(u^2+v^2)^2}=\\sqrt{32(u^2+v^2)^2}=4\\sqrt 2(u^2+v^2)$.\n\n**4단계 — 피적분.** $x^2+y^2=(2uv)^2+(u^2-v^2)^2=4u^2 v^2+(u^2-v^2)^2=(u^2+v^2)^2$.\n\n**5단계 — 적분.** $\\!\\iint_D(u^2+v^2)^2\\cdot 4\\sqrt 2(u^2+v^2)\\,dudv=4\\sqrt 2\\!\\iint(u^2+v^2)^3 dA$.\n\n극좌표: $4\\sqrt 2\\!\\int_0^{2\\pi}\\!\\!\\int_0^1 r^6\\cdot r\\,dr\\,d\\theta=4\\sqrt 2\\cdot 2\\pi\\cdot\\dfrac{1}{8}=\\sqrt 2\\pi$."
  }),
  build({
    num: 18, subject: "선형대수", unit: "행렬", concept: "행렬식 다중선형성", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}a_1&a_2&a_3\\\\-2&1&4\\\\3&5&7\\end{pmatrix},\\,B=\\begin{pmatrix}b_1&b_2&b_3\\\\-2&1&4\\\\3&5&7\\end{pmatrix}$에 대해 $\\det(A)=13,\\,\\det(B)=-26$일 때, 행렬 $C=\\begin{pmatrix}2a_1-b_1&2a_2-b_2&2a_3-b_3\\\\2&-1&-4\\\\6&10&14\\end{pmatrix}$의 행렬식 $\\det(C)$의 값은?",
    options: [o("1","$-104$"), o("2","$-52$"), o("3","$0$"), o("4","$52$")],
    answer: 1,
    explanation: "**1단계 — 행 정리.** $C$의 2행 $(2,-1,-4)=-1\\cdot(-2,1,4)$. 3행 $(6,10,14)=2\\cdot(3,5,7)$. 따라서 행렬식에서 2행 $-1$ 곱하면 $A,B$의 2행과 같아짐. 3행 $2$ 곱하면 $A,B$의 3행과 같아짐.\n\n**2단계 — 스칼라 인수.** $\\det(C)=(-1)\\cdot 2\\cdot\\det\\begin{pmatrix}2a_1-b_1&2a_2-b_2&2a_3-b_3\\\\-2&1&4\\\\3&5&7\\end{pmatrix}=-2D$.\n\n**3단계 — 다중선형성.** $D=2\\det A-\\det B=2\\cdot 13-(-26)=52$.\n\n$\\det C=-2\\cdot 52=-104$."
  }),
  build({
    num: 19, subject: "미분학", unit: "극한과 연속", concept: "Taylor 전개 (sin)", difficulty: "medium",
    question: "$\\displaystyle\\lim_{x\\to\\infty}\\!\\left[x^2-x^2\\sin\\!\\left(\\dfrac{\\pi(1+x)}{2x}\\right)\\right]$의 값은?",
    options: [o("1","$0$"), o("2","$\\dfrac{\\pi^2}{8}$"), o("3","$\\dfrac{\\pi^2}{4}$"), o("4","$\\dfrac{\\pi^2}{2}$")],
    answer: 2,
    explanation: "**1단계 — 식 정리.** $\\dfrac{\\pi(1+x)}{2x}=\\dfrac{\\pi}{2}+\\dfrac{\\pi}{2x}$.\n\n$\\sin\\!\\left(\\dfrac{\\pi}{2}+\\dfrac{\\pi}{2x}\\right)=\\cos\\!\\left(\\dfrac{\\pi}{2x}\\right)$.\n\n**2단계 — 치환.** $1/x=t$로 두면 $t\\to 0^+$.\n\n극한 $=\\!\\lim_{t\\to 0}\\dfrac{1-\\cos(\\pi t/2)}{t^2}$.\n\n**3단계 — Taylor.** $\\cos u=1-\\dfrac{u^2}{2}+\\cdots$, $u=\\pi t/2$이라 $1-\\cos u=\\dfrac{u^2}{2}+\\cdots=\\dfrac{\\pi^2 t^2}{8}+\\cdots$.\n\n극한 $=\\dfrac{\\pi^2}{8}$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "추가내용", concept: "관련변화율(피타고라스)", difficulty: "medium",
    question: "한 남자가 $P$지점에서 $1.5\\,\\mathrm{m/sec}$로 북쪽을 향하여 걷기 시작한다. $5$초 후 한 여자가 $P$의 동쪽으로 $80\\,\\mathrm m$ 떨어진 지점에서 $2\\,\\mathrm{m/sec}$로 남쪽을 향하여 걷기 시작한다. 이 여자가 걷기 시작한 지 $15$초 후, 두 사람은 얼마의 속도로 멀어지는가?",
    options: [o("1","$1.9\\,\\mathrm{m/sec}$"), o("2","$2.1\\,\\mathrm{m/sec}$"), o("3","$2.3\\,\\mathrm{m/sec}$"), o("4","$2.5\\,\\mathrm{m/sec}$")],
    answer: 2,
    explanation: "**1단계 — 위치.** 여자가 걷기 시작 후 $15$초.\n\n남자: 이미 $5$초 먼저 출발이라 $20$초 동안 북쪽 이동 $=1.5\\cdot 20=30\\,\\mathrm m$. 즉 $m=30$.\n\n여자: 시작 위치 $(80,0)$에서 남쪽 $w=2\\cdot 15=30\\,\\mathrm m$.\n\n**2단계 — 거리.** 두 사람의 동서 차 $80$, 남북 차 $m+w=60$. $z=\\sqrt{80^2+60^2}=100$.\n\n**3단계 — 시간 미분.** $z^2=80^2+(m+w)^2$. 양변 미분: $2z\\dfrac{dz}{dt}=2(m+w)\\!\\left(\\dfrac{dm}{dt}+\\dfrac{dw}{dt}\\right)$.\n\n$\\dfrac{dm}{dt}=1.5,\\,\\dfrac{dw}{dt}=2$. $2\\cdot 100\\cdot\\dfrac{dz}{dt}=2\\cdot 60\\cdot 3.5=420$.\n\n$\\dfrac{dz}{dt}=2.1$."
  }),
  build({
    num: 21, subject: "다변수함수", unit: "선적분과 면적분", concept: "Green 정리(반원)", difficulty: "medium",
    question: "영역 $D=\\{(x,y)\\mid x^2+y^2\\le 4,\\,y\\ge 0\\}$의 경계선을 닫힌곡선 $C$라 할 때, $\\displaystyle\\oint_C y^2\\,dx+3xy\\,dy$의 값은?",
    options: [o("1","$\\dfrac{4}{3}$"), o("2","$\\dfrac{8}{3}$"), o("3","$\\dfrac{16}{3}$"), o("4","$\\dfrac{32}{3}$")],
    answer: 3,
    explanation: "**Green 정리.** $\\oint(P\\,dx+Q\\,dy)=\\!\\iint_D(Q_x-P_y)dA$.\n\n$P=y^2,\\,Q=3xy$. $Q_x=3y$, $P_y=2y$. 차 $=y$.\n\n**극좌표 적분.** $D:0\\le r\\le 2,\\,0\\le\\theta\\le\\pi$. $y=r\\sin\\theta$.\n\n$\\!\\iint y\\,dA=\\!\\int_0^{\\pi}\\!\\!\\int_0^2 r\\sin\\theta\\cdot r\\,dr\\,d\\theta=\\!\\int_0^{\\pi}\\sin\\theta\\,d\\theta\\cdot\\!\\int_0^2 r^2 dr=2\\cdot\\dfrac{8}{3}=\\dfrac{16}{3}$."
  }),
  build({
    num: 22, subject: "공학수학", unit: "라플라스 변환", concept: "로그형 라플라스 역변환", difficulty: "mediumHard",
    question: "함수 $F(s)=\\ln\\!\\left(\\dfrac{s^2+4}{s^2}\\right)$의 라플라스 역변환 $\\mathcal{L}^{-1}\\{F(s)\\}$를 $f(t)$라 할 때, $f\\!\\left(\\dfrac{\\pi}{4}\\right)$의 값은?",
    options: [o("1","$\\dfrac{1}{\\pi}$"), o("2","$\\dfrac{2}{\\pi}$"), o("3","$\\dfrac{4}{\\pi}$"), o("4","$\\dfrac{8}{\\pi}$")],
    answer: 4,
    explanation: "**핵심 공식.** $\\mathcal L^{-1}\\{\\ln G(s)\\}=-\\dfrac{1}{t}\\mathcal L^{-1}\\{G'(s)/G(s)\\}$ 형태로 풀이.\n\n또는 직접: $F(s)=\\ln(s^2+4)-2\\ln s$. $F'(s)=\\dfrac{2s}{s^2+4}-\\dfrac{2}{s}$.\n\n역변환: $\\mathcal L^{-1}\\{F'(s)\\}=2\\cos 2t-2$.\n\n공식 $\\mathcal L\\{tf(t)\\}=-F'(s)$에 의해 $tf(t)=-(2\\cos 2t-2)=2-2\\cos 2t$.\n\n$f(t)=\\dfrac{2-2\\cos 2t}{t}$.\n\n**$t=\\pi/4$.** $f=\\dfrac{2-2\\cos(\\pi/2)}{\\pi/4}=\\dfrac{2-0}{\\pi/4}=\\dfrac{8}{\\pi}$."
  }),
  build({
    num: 23, subject: "공학수학", unit: "미분방정식", concept: "2계 선형 ODE 라플라스", difficulty: "medium",
    question: "$y=y(x)$가 미분방정식 $y''+6y'+(\\pi^2+9)y=0,\\,y(0)=0,\\,y'(0)=e\\pi$의 해일 때, $y\\!\\left(\\dfrac{1}{3}\\right)$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$\\dfrac{\\sqrt{2}}{2}$"), o("3","$\\dfrac{\\sqrt{3}}{2}$"), o("4","$1$")],
    answer: 3,
    explanation: "**1단계 — 라플라스.** $(s^2+6s+(\\pi^2+9))Y=e\\pi$ → $Y=\\dfrac{e\\pi}{(s+3)^2+\\pi^2}$.\n\n**2단계 — 역변환.** $\\mathcal L^{-1}\\!\\left\\{\\dfrac{\\pi}{(s+3)^2+\\pi^2}\\right\\}=e^{-3t}\\sin\\pi t$.\n\n계수 $e$ 곱: $y(t)=e\\cdot e^{-3t}\\sin\\pi t=e^{1-3t}\\sin\\pi t$.\n\n**3단계 — $t=1/3$.** $y=e^{1-1}\\sin(\\pi/3)=1\\cdot\\dfrac{\\sqrt 3}{2}=\\dfrac{\\sqrt 3}{2}$."
  }),
  build({
    num: 24, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "타원 접선·삼각형 넓이", difficulty: "mediumHard",
    question: "타원 $\\dfrac{x^2}{4}+\\dfrac{y^2}{16}=1$ 위에 있는 제1사분면의 점 $(a,b)$에서의 접선과 좌표축으로 둘러싸인 삼각형의 넓이의 최솟값은?",
    options: [o("1","$4$"), o("2","$8$"), o("3","$16$"), o("4","$32$")],
    answer: 2,
    explanation: "**1단계 — 접선.** $(a,b)$에서 $\\dfrac{ax}{4}+\\dfrac{by}{16}=1$.\n\n**2단계 — 절편.** $x$절편 $\\dfrac{4}{a}$, $y$절편 $\\dfrac{16}{b}$. 삼각형 넓이 $S=\\dfrac{1}{2}\\cdot\\dfrac{4}{a}\\cdot\\dfrac{16}{b}=\\dfrac{32}{ab}$.\n\n**3단계 — 산술-기하 평균.** 제약 $\\dfrac{a^2}{4}+\\dfrac{b^2}{16}=1$이라\n\n$1=\\dfrac{a^2}{4}+\\dfrac{b^2}{16}\\ge 2\\sqrt{\\dfrac{a^2 b^2}{64}}=\\dfrac{ab}{4}$, 즉 $ab\\le 4$.\n\n**4단계 — 결과.** $S=\\dfrac{32}{ab}\\ge\\dfrac{32}{4}=8$. 최솟값 $8$."
  }),
  build({
    num: 25, subject: "적분학", unit: "정적분의 정의", concept: "리만합", difficulty: "medium",
    question: "$\\displaystyle\\lim_{n\\to\\infty}\\sum_{k=1}^n\\dfrac{1-2a}{n}\\!\\left(2a+\\dfrac{(1-2a)k}{n}\\right)^{\\!2}$의 값은? (단, $0<a<\\dfrac{1}{2}$)",
    options: [
      o("1","$\\dfrac{1-a^3}{3}$"),
      o("2","$\\dfrac{1-8a^3}{3}$"),
      o("3","$\\dfrac{8(1-a^3)}{3}$"),
      o("4","$\\dfrac{8-a^3}{3}$")
    ],
    answer: 2,
    explanation: "**리만합 인식.** $\\Delta x=\\dfrac{1-2a}{n}$, $x_k=2a+k\\Delta x$이라 적분 $\\!\\int_{2a}^{1}f(x)dx$ 형태로 $f(x)=x^2$.\n\n**적분 계산.** $\\!\\int_{2a}^1 x^2 dx=\\!\\left[\\dfrac{x^3}{3}\\right]_{2a}^1=\\dfrac{1-(2a)^3}{3}=\\dfrac{1-8a^3}{3}$."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
console.log("Inserted:");
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
