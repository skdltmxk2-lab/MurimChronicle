// Upload 2025년도 한양대 편입수학 기출 객관식 20문항 (37~56번, 5지선다)
// 57~61번은 주관식(서답형)이라 업로드에서 제외
// Usage: node scripts/upload_general_2025_hanyang.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SCHOOL = "한양대"; const YEAR = "2025";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-hanyang-${String(num).padStart(2, "0")}`;
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
    num: 1, subject: "미분학", unit: "추가내용", concept: "타원의 정의(초점거리)", difficulty: "medium",
    question: "좌표평면 위에 두 점 $F(a,0),\\ F'(-a,0)\\ (a>0)$을 초점으로 하는 타원 $\\dfrac{x^2}{25}+\\dfrac{y^2}{9}=1$이 있다. 점 $A(-8,9)$와 타원 위의 점 $P$에 대하여 $\\overline{AP}-\\overline{PF'}$의 최솟값은?",
    options: [o("1","$4$"), o("2","$2\\sqrt{5}$"), o("3","$2\\sqrt{6}$"), o("4","$5$"), o("5","$3\\sqrt{3}$")],
    answer: 4,
    explanation: "타원에서 $a^2=25,\\,b^2=9$이므로 $c=4$, 즉 $F(4,0),\\,F'(-4,0)$. 타원 정의 $\\overline{PF}+\\overline{PF'}=10$이므로 $\\overline{PF'}=10-\\overline{PF}$. 따라서 $\\overline{AP}-\\overline{PF'}=\\overline{AP}+\\overline{PF}-10\\ge \\overline{AF}-10$. $\\overline{AF}=\\sqrt{(-8-4)^2+9^2}=\\sqrt{144+81}=15$. 최솟값 $=15-10=5$."
  }),
  build({
    num: 2, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "이항급수 계수비", difficulty: "medium",
    question: "$x=0$에서 함수 $f(x)=\\dfrac{1}{\\sqrt{4+3x}}$의 테일러 급수가 $\\displaystyle\\sum_{n=0}^{\\infty}a_n x^n$이다. $\\dfrac{a_{11}}{a_{10}}$의 값은?",
    options: [o("1","$-\\dfrac{3}{4}$"), o("2","$-\\dfrac{129}{176}$"), o("3","$-\\dfrac{63}{88}$"), o("4","$-\\dfrac{123}{176}$"), o("5","$-\\dfrac{15}{12}$")],
    answer: 3,
    explanation: "$f(x)=\\tfrac{1}{2}(1+\\tfrac{3}{4}x)^{-1/2}$. $(1+u)^p$의 이항급수에서 $a_n=\\tfrac{1}{2}\\binom{-1/2}{n}(\\tfrac{3}{4})^n$. 비율 $\\dfrac{a_{n+1}}{a_n}=\\dfrac{p-n}{n+1}\\cdot\\tfrac{3}{4}=-\\dfrac{3(2n+1)}{8(n+1)}$. $n=10$: $-\\dfrac{3\\cdot 21}{8\\cdot 11}=-\\dfrac{63}{88}$."
  }),
  build({
    num: 3, subject: "다변수함수", unit: "경도 및 방향도함수", concept: "방향도함수+접평면", difficulty: "medium",
    question: "점 $(1,2)$에서 미분가능한 함수 $f(x,y)$의 두 단위벡터 $\\mathbf{u}=\\left(\\dfrac{3}{5},-\\dfrac{4}{5}\\right)$, $\\mathbf{v}=\\left(-\\dfrac{12}{13},\\dfrac{5}{13}\\right)$에 대한 방향도함수의 값이 각각 $D_{\\mathbf{u}}f(1,2)=\\dfrac{26}{5}$, $D_{\\mathbf{v}}f(1,2)=-\\dfrac{82}{13}$이다. 곡면 $z=f(x,y)$ 위의 점 $(1,2,f(1,2))$에서의 접평면이 점 $(3,5,3)$을 지날 때, $\\|\\nabla f(1,2)\\|^2+f(1,2)$의 값은?",
    options: [o("1","$34$"), o("2","$37$"), o("3","$40$"), o("4","$43$"), o("5","$46$")],
    answer: 2,
    explanation: "$\\nabla f(1,2)=(a,b)$라 하면 $3a-4b=26$, $-12a+5b=-82$. 풀면 $a=6,\\,b=-2$. $\\|\\nabla f\\|^2=40$. 접평면 $z-f(1,2)=6(x-1)-2(y-2)$, 점 $(3,5,3)$ 대입: $3-f(1,2)=12-6=6$, $f(1,2)=-3$. 합 $=40-3=37$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분의 응용", concept: "적분방정식", difficulty: "medium",
    question: "연속 함수 $f(x)$가 모든 실수 $x$에 대하여 $\\displaystyle f(x)\\times\\int_0^x f(t)\\,dt=e^x+3x-1$을 만족시킬 때, $\\displaystyle f(0)^2+\\!\\left(\\int_0^2 f(x)\\,dx\\right)^{\\!2}$의 값은?",
    options: [o("1","$2e^2+6$"), o("2","$2e^2+8$"), o("3","$2e^2+10$"), o("4","$2e^2+12$"), o("5","$2e^2+14$")],
    answer: 3,
    explanation: "$g(x)=\\!\\int_0^x f$라 하면 $fg=e^x+3x-1$이고 $g'=f$이므로 $\\tfrac{1}{2}(g^2)'=fg=e^x+3x-1$. 적분: $g^2=2e^x+3x^2-2x+C$. $g(0)=0$이므로 $C=-2$. 양변 미분 후 $x=0$ 대입: $f'(0)g(0)+f(0)^2=4$, $f(0)^2=4$. $g(2)^2=2e^2+12-4-2=2e^2+6$. 합 $=4+2e^2+6=2e^2+10$."
  }),
  build({
    num: 5, subject: "다변수함수", unit: "중적분", concept: "적분순서 변경", difficulty: "medium",
    question: "$\\displaystyle\\int_0^1\\!\\!\\int_{y^{1/3}}^{1}\\cos(\\pi x^2)\\,dx\\,dy$의 값은?",
    options: [o("1","$-\\dfrac{1}{2\\pi^2}$"), o("2","$-\\dfrac{1}{\\pi^2}$"), o("3","$-\\dfrac{3}{2\\pi^2}$"), o("4","$-\\dfrac{2}{\\pi^2}$"), o("5","$-\\dfrac{5}{2\\pi^2}$")],
    answer: 2,
    explanation: "순서 변경: $0\\le x\\le 1,\\,0\\le y\\le x^3$. $\\!\\int_0^1\\!\\!\\int_0^{x^3}\\cos(\\pi x^2)\\,dy\\,dx=\\!\\int_0^1 x^3\\cos(\\pi x^2)\\,dx$. $u=\\pi x^2$ 치환: $=\\dfrac{1}{2\\pi^2}\\!\\int_0^{\\pi}u\\cos u\\,du=\\dfrac{1}{2\\pi^2}[u\\sin u+\\cos u]_0^{\\pi}=\\dfrac{-2}{2\\pi^2}=-\\dfrac{1}{\\pi^2}$."
  }),
  build({
    num: 6, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "급수 수렴 판정", difficulty: "medium",
    question: "$\\langle$보기$\\rangle$에서 수렴하는 급수를 모두 고른 것은?\n\n$\\langle$보기$\\rangle$\n\nㄱ. $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n^2+n+3}{n^3\\{\\ln(n+2)\\}^2}\\quad$ ㄴ. $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{2^n n!}{(n+1)^n}\\quad$ ㄷ. $\\displaystyle\\sum_{n=1}^{\\infty}\\!\\left(2-n\\sin\\dfrac{2}{n}\\right)$",
    options: [o("1","ㄱ"), o("2","ㄷ"), o("3","ㄱ, ㄴ"), o("4","ㄴ, ㄷ"), o("5","ㄱ, ㄴ, ㄷ")],
    answer: 5,
    explanation: "ㄱ. 일반항 $\\sim\\dfrac{1}{n(\\ln n)^2}$ → 적분비교 수렴. ㄴ. 비율판정 $\\dfrac{a_{n+1}}{a_n}=2\\!\\left(\\tfrac{n+1}{n+2}\\right)^{\\!n+1}\\to\\tfrac{2}{e}<1$ → 수렴. ㄷ. $n\\sin(2/n)=2-\\tfrac{4}{3n^2}+O(n^{-4})$이므로 $2-n\\sin(2/n)\\sim\\tfrac{4}{3n^2}$ → 수렴. 모두 수렴."
  }),
  build({
    num: 7, subject: "다변수함수", unit: "선적분과 면적분", concept: "Green 정리", difficulty: "medium",
    question: "$\\mathbf{r}(t)=\\langle 3\\cos t,\\sin t\\rangle\\ (0\\le t\\le 2\\pi)$로 나타내어지는 곡선 $C$와 벡터장 $\\mathbf{F}(x,y)=\\langle e^x+xy,\\,\\sin y+x\\rangle$에 대하여 선적분 $\\displaystyle\\int_C\\mathbf{F}\\cdot d\\mathbf{r}$의 값은?",
    options: [o("1","$\\dfrac{3\\pi}{2}$"), o("2","$2\\pi$"), o("3","$\\dfrac{5\\pi}{2}$"), o("4","$3\\pi$"), o("5","$\\dfrac{7\\pi}{2}$")],
    answer: 4,
    explanation: "Green 정리: $\\oint=\\!\\iint_D(Q_x-P_y)dA=\\!\\iint_D(1-x)dA$. 영역 $D:\\,\\tfrac{x^2}{9}+y^2\\le 1$. 대칭성으로 $\\iint x\\,dA=0$. $\\iint dA=\\pi\\cdot 3\\cdot 1=3\\pi$. 따라서 $3\\pi$."
  }),
  build({
    num: 8, subject: "선형대수", unit: "행렬", concept: "행렬식 성질", difficulty: "medium",
    question: "$3\\times 3$ 행렬 $A$와 $B$에 대하여 $A^3=B^2$이고 $\\det(B)=27$일 때, $\\det(2A^T BA^{-1}B^{-1}A)$의 값은? (단, $A^T$는 $A$의 전치 행렬이다.)",
    options: [o("1","$18$"), o("2","$24$"), o("3","$54$"), o("4","$72$"), o("5","$96$")],
    answer: 4,
    explanation: "$\\det(A)^3=\\det(B)^2=729\\Rightarrow\\det(A)=9$. $\\det(2A^T BA^{-1}B^{-1}A)=2^3\\det(A)\\det(B)\\det(A)^{-1}\\det(B)^{-1}\\det(A)=8\\det(A)=72$."
  }),
  build({
    num: 9, subject: "선형대수", unit: "고유치와 대각화", concept: "행렬 종합 진위", difficulty: "mediumHard",
    question: "$\\langle$보기$\\rangle$에서 옳은 것을 모두 고른 것은?\n\n$\\langle$보기$\\rangle$\n\nㄱ. 행렬 $A=\\begin{pmatrix}0&a+b&c+2\\\\a&2&c\\\\4&a+b&4\\end{pmatrix}$가 대칭행렬일 때, 행렬 $B=\\begin{pmatrix}b&a&-2\\\\b-a&0&1\\\\c&-1&b\\end{pmatrix}$는 반대칭행렬(skew symmetric matrix)이다.\n\nㄴ. 벡터 $\\begin{pmatrix}5\\\\1\\\\1\\end{pmatrix}$은 행렬 $\\begin{pmatrix}1&2&3\\\\0&-1&3\\\\0&0&2\\end{pmatrix}$의 가장 큰 고윳값에 대응하는 고유벡터이다.\n\nㄷ. $\\lambda=1$이 행렬 $A=\\begin{pmatrix}3&a\\\\b&-5\\end{pmatrix}$의 고윳값이면, $\\lambda=-3$도 $A$의 고윳값이다.\n\nㄹ. 두 행렬 $\\begin{pmatrix}1&0&-2\\\\0&5&0\\\\-2&0&4\\end{pmatrix}$와 $\\begin{pmatrix}0&0&0\\\\0&5&0\\\\0&0&5\\end{pmatrix}$은 닮은 행렬이다.",
    options: [o("1","ㄱ, ㄴ, ㄷ"), o("2","ㄱ, ㄴ, ㄹ"), o("3","ㄱ, ㄷ, ㄹ"), o("4","ㄴ, ㄷ, ㄹ"), o("5","ㄱ, ㄴ, ㄷ, ㄹ")],
    answer: 5,
    explanation: "ㄱ. 대칭조건 $a+b=a,\\,c+2=4,\\,c=a+b$로부터 $a=2,b=0,c=2$. $B=\\begin{pmatrix}0&2&-2\\\\-2&0&1\\\\2&-1&0\\end{pmatrix}$, $B^T=-B$ ✓. ㄴ. 상삼각이라 고윳값 $1,-1,2$. 가장 큰 $2$에 $(5,1,1)^T$ 대입 검증 OK. ㄷ. $\\mathrm{tr}=-2$이므로 한 고윳값이 $1$이면 다른 하나 $-3$ ✓. ㄹ. 첫 행렬 고윳값 $0,5,5$ (대칭이라 대각화 가능) → 두 번째와 닮음. 모두 옳음."
  }),
  build({
    num: 10, subject: "선형대수", unit: "벡터공간", concept: "외적과 평행사변형 넓이", difficulty: "mediumHard",
    question: "벡터 $\\mathbf{v}_1=(2,1,1)$과 $\\mathbf{v}_2=(-1,2,3)$으로 생성되는 $\\mathbb{R}^3$의 부분 공간 $U$에 대하여 $\\{\\mathbf{u}_1,\\mathbf{u}_2\\}$는 $U$의 직교 기저(orthogonal basis)이다. $\\|\\mathbf{u}_1\\|=\\dfrac{5}{3},\\,\\|\\mathbf{u}_2\\|=\\dfrac{1}{3}$이고 $\\mathbf{v}_1=a_1\\mathbf{u}_1+a_2\\mathbf{u}_2$, $\\mathbf{v}_2=b_1\\mathbf{u}_1+b_2\\mathbf{u}_2$일 때, $|a_1 b_2-a_2 b_1|$의 값은?",
    options: [o("1","$3\\sqrt{3}$"), o("2","$3\\sqrt{5}$"), o("3","$5\\sqrt{3}$"), o("4","$5\\sqrt{5}$"), o("5","$9\\sqrt{3}$")],
    answer: 5,
    explanation: "$\\mathbf{v}_1\\times\\mathbf{v}_2=(1,-7,5)$, $\\|\\mathbf{v}_1\\times\\mathbf{v}_2\\|=\\sqrt{75}=5\\sqrt{3}$. 직교이므로 $\\|\\mathbf{u}_1\\times\\mathbf{u}_2\\|=\\|\\mathbf{u}_1\\|\\|\\mathbf{u}_2\\|=\\tfrac{5}{9}$. 좌표 변환식 $\\binom{\\mathbf{v}_1}{\\mathbf{v}_2}=\\binom{a_1\\,a_2}{b_1\\,b_2}\\binom{\\mathbf{u}_1}{\\mathbf{u}_2}$에서 $\\|\\mathbf{v}_1\\times\\mathbf{v}_2\\|=|a_1 b_2-a_2 b_1|\\cdot\\|\\mathbf{u}_1\\times\\mathbf{u}_2\\|$. $5\\sqrt{3}=|a_1 b_2-a_2 b_1|\\cdot\\tfrac{5}{9}$ → $9\\sqrt{3}$."
  }),
  build({
    num: 11, subject: "선형대수", unit: "벡터공간", concept: "Rank와 열공간", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}2&1&0&4\\\\2&1&1&2\\\\4&2&3&2\\end{pmatrix}$에 대하여 $A\\mathbf{v}=\\begin{pmatrix}2\\\\3\\\\r\\end{pmatrix}$을 만족하는 벡터 $\\mathbf{v}$가 존재할 때, $\\mathrm{Rank}(A)\\times r$의 값은?",
    options: [o("1","$6$"), o("2","$8$"), o("3","$10$"), o("4","$12$"), o("5","$14$")],
    answer: 5,
    explanation: "행 연산 후 $A\\sim\\begin{pmatrix}2&1&0&4\\\\0&0&1&-2\\\\0&0&0&0\\end{pmatrix}$이라 $\\mathrm{Rank}(A)=2$. 열공간은 $\\{(1,1,2),(0,1,3)\\}$ 생성. 두 벡터를 포함하는 평면 $x-3y+z=0$에 $(2,3,r)$이 있어야 하므로 $2-9+r=0$, $r=7$. $2\\times 7=14$."
  }),
  build({
    num: 12, subject: "선형대수", unit: "추가내용", concept: "최소제곱(부분공간 정사영)", difficulty: "mediumHard",
    question: "행렬 $A=\\begin{pmatrix}1&1\\\\0&-1\\\\2&0\\\\1&1\\end{pmatrix}$의 열공간을 $V$라 할 때 벡터 $\\mathbf{a}=\\begin{pmatrix}1\\\\2\\\\-1\\\\0\\end{pmatrix}$의 $V$로의 정사영 $\\mathrm{proj}_V\\mathbf{a}$는?",
    options: [
      o("1","$\\left(-\\dfrac{5}{14},\\,\\dfrac{2}{7},\\,-\\dfrac{1}{7},\\,-\\dfrac{5}{14}\\right)^{\\!T}$"),
      o("2","$\\left(\\dfrac{5}{14},\\,-\\dfrac{2}{7},\\,-\\dfrac{1}{7},\\,-\\dfrac{5}{14}\\right)^{\\!T}$"),
      o("3","$\\left(-\\dfrac{5}{14},\\,-\\dfrac{2}{7},\\,\\dfrac{1}{7},\\,-\\dfrac{5}{14}\\right)^{\\!T}$"),
      o("4","$\\left(\\dfrac{5}{14},\\,\\dfrac{2}{7},\\,-\\dfrac{1}{7},\\,\\dfrac{5}{14}\\right)^{\\!T}$"),
      o("5","$\\left(\\dfrac{5}{14},\\,-\\dfrac{2}{7},\\,\\dfrac{1}{7},\\,\\dfrac{5}{14}\\right)^{\\!T}$")
    ],
    answer: 1,
    explanation: "최소제곱: $A^T A=\\begin{pmatrix}6&2\\\\2&3\\end{pmatrix}$, $A^T\\mathbf{a}=(-1,-1)^T$. $(A^T A)^{-1}A^T\\mathbf{a}=\\tfrac{1}{14}\\begin{pmatrix}3&-2\\\\-2&6\\end{pmatrix}\\!\\binom{-1}{-1}=\\tfrac{1}{14}(-1,-4)^T$. $\\mathrm{proj}_V\\mathbf{a}=A\\cdot\\!\\left(-\\tfrac{1}{14},-\\tfrac{2}{7}\\right)^{\\!T}=\\!\\left(-\\tfrac{5}{14},\\tfrac{2}{7},-\\tfrac{1}{7},-\\tfrac{5}{14}\\right)^{\\!T}$."
  }),
  build({
    num: 13, subject: "선형대수", unit: "고유치와 대각화", concept: "행렬다항식 행렬식", difficulty: "medium",
    question: "고윳값이 $1,-1,2$인 $3\\times 3$ 행렬 $A$에 대하여 $B=A^3-5A^2$일 때, $\\det(B)$의 값은?",
    options: [o("1","$-288$"), o("2","$-144$"), o("3","$-72$"), o("4","$-48$"), o("5","$-24$")],
    answer: 1,
    explanation: "$B$의 고윳값은 $\\lambda^3-5\\lambda^2$. $\\lambda=1: -4$, $\\lambda=-1: -6$, $\\lambda=2: -12$. $\\det(B)=(-4)(-6)(-12)=-288$."
  }),
  build({
    num: 14, subject: "선형대수", unit: "추가내용", concept: "특이값 분해(SVD)", difficulty: "hard",
    question: "행렬 $A=\\begin{pmatrix}1&1&-1\\\\1&1&-1\\end{pmatrix}$의 특이값 분해(singular value decomposition)가\n\n$A=\\begin{pmatrix}u_{11}&u_{12}\\\\u_{21}&-\\dfrac{1}{\\sqrt{2}}\\end{pmatrix}\\!\\begin{pmatrix}\\sqrt{6}&\\sigma_{12}&\\sigma_{13}\\\\\\sigma_{21}&0&\\sigma_{23}\\end{pmatrix}\\!\\begin{pmatrix}\\dfrac{1}{\\sqrt{3}}&v_{12}&v_{13}\\\\v_{21}&-\\dfrac{1}{\\sqrt{2}}&v_{23}\\\\v_{31}&0&\\dfrac{2}{\\sqrt{6}}\\end{pmatrix}^{\\!T}$\n\n일 때, $u_{11}^2+(\\sigma_{12}^2+\\sigma_{13}^2+\\sigma_{21}^2+\\sigma_{23}^2)+(v_{12}^2+v_{23}^2+v_{31}^2)$의 값은?",
    options: [o("1","$\\dfrac{7}{6}$"), o("2","$\\dfrac{4}{3}$"), o("3","$\\dfrac{3}{2}$"), o("4","$\\dfrac{5}{3}$"), o("5","$\\dfrac{11}{6}$")],
    answer: 3,
    explanation: "$U$는 직교: 2열 단위 $u_{12}^2+1/2=1\\Rightarrow u_{12}^2=1/2$. 1행 단위 $u_{11}^2+u_{12}^2=1\\Rightarrow u_{11}^2=1/2$. $\\Sigma$의 대각외 성분은 $0$이라 합 $=0$. $V$ 직교: 2열 $v_{12}^2+1/2=1\\Rightarrow v_{12}^2=1/2$. 3행 $v_{31}^2+(2/\\sqrt 6)^2=1\\Rightarrow v_{31}^2=1/3$. 1열 $1/3+v_{21}^2+v_{31}^2=1\\Rightarrow v_{21}^2=1/3$. 2행 $v_{21}^2+1/2+v_{23}^2=1\\Rightarrow v_{23}^2=1/6$. 합 $=\\tfrac{1}{2}+0+\\tfrac{1}{2}+\\tfrac{1}{6}+\\tfrac{1}{3}=\\dfrac{3}{2}$."
  }),
  build({
    num: 15, subject: "공학수학", unit: "라플라스 변환", concept: "라플라스 역변환", difficulty: "easyMedium",
    question: "$F(s)=\\dfrac{s-1}{(s+2)^2}$의 라플라스 역변환을 $f(t)$라 할 때, $f(1)$의 값은?",
    options: [o("1","$-2e^{-2}$"), o("2","$-e^{-2}$"), o("3","$e^{-2}$"), o("4","$2e^{-2}$"), o("5","$3e^{-2}$")],
    answer: 1,
    explanation: "$F=\\dfrac{(s+2)-3}{(s+2)^2}=\\dfrac{1}{s+2}-\\dfrac{3}{(s+2)^2}$. $f(t)=e^{-2t}-3te^{-2t}$. $f(1)=e^{-2}-3e^{-2}=-2e^{-2}$."
  }),
  build({
    num: 16, subject: "공학수학", unit: "미분방정식", concept: "라플라스 변환(공명)", difficulty: "medium",
    question: "미분방정식 $\\dfrac{d^2y}{dt^2}+5\\dfrac{dy}{dt}+4y=6e^{-t}$의 해 $y(t)$가 $y(0)=2,\\,y'(0)=3$을 만족할 때, $y(1)$의 값은?",
    options: [o("1","$3e^{-1}-e^{-4}$"), o("2","$5e^{-1}-e^{-4}$"), o("3","$3e^{-1}-2e^{-4}$"), o("4","$-3e^{-1}+e^{-4}$"), o("5","$-5e^{-1}+e^{-4}$")],
    answer: 2,
    explanation: "특성방정식은 $(\\lambda+1)(\\lambda+4)=0$이고 우변 $6e^{-t}$가 제차해의 $e^{-t}$와 겹치므로 특수해를 $y_p=Cte^{-t}$로 둔다. 대입하면 $C=2$라서 $y_p=2te^{-t}$이다. 제차해 $Ae^{-t}+Be^{-4t}$에 초기조건을 넣으면 $A+B=2,\\ -A-4B+2=3$이므로 $A=3,\\ B=-1$이다. 따라서 $y(1)=3e^{-1}-e^{-4}+2e^{-1}=5e^{-1}-e^{-4}$이다."
  }),
  build({
    num: 17, subject: "공학수학", unit: "미분방정식", concept: "Cauchy-Euler 복소근", difficulty: "medium",
    question: "미분방정식 $x^2 y''-15xy'+68y=0\\ (x>0)$의 해 $y(x)$가 $y(1)=3,\\,y'(1)=30$을 만족할 때, $y\\!\\left(e^{\\pi/8}\\right)$의 값은?",
    options: [o("1","$\\sqrt{2}\\,e^{\\pi}$"), o("2","$2\\sqrt{2}\\,e^{\\pi}$"), o("3","$3\\sqrt{2}\\,e^{\\pi}$"), o("4","$4\\sqrt{2}\\,e^{\\pi}$"), o("5","$5\\sqrt{2}\\,e^{\\pi}$")],
    answer: 3,
    explanation: "$r(r-1)-15r+68=0\\Rightarrow r^2-16r+68=0$, $r=8\\pm 2i$. $y=x^8(C_1\\cos(2\\ln x)+C_2\\sin(2\\ln x))$. $y(1)=C_1=3$. $y'(1)=8C_1+2C_2=30\\Rightarrow C_2=3$. $y(e^{\\pi/8})=e^{\\pi}\\!\\left(3\\cos\\tfrac{\\pi}{4}+3\\sin\\tfrac{\\pi}{4}\\right)=3\\sqrt{2}\\,e^{\\pi}$."
  }),
  build({
    num: 18, subject: "공학수학", unit: "미분방정식", concept: "연립 1계 ODE", difficulty: "medium",
    question: "연립미분방정식 $\\begin{cases}x'(t)=x(t)+y(t)\\\\y'(t)=-x(t)+y(t)\\end{cases}$의 해 $\\binom{x(t)}{y(t)}$가 $\\binom{x(0)}{y(0)}=\\binom{2}{4}$를 만족할 때, $x(\\pi)$의 값은?",
    options: [o("1","$2e^{\\pi}$"), o("2","$e^{\\pi}$"), o("3","$-e^{\\pi}$"), o("4","$-2e^{\\pi}$"), o("5","$-3e^{\\pi}$")],
    answer: 4,
    explanation: "$y$ 소거: $x''-2x'+2x=0$. $\\lambda=1\\pm i$, $x=e^t(A\\cos t+B\\sin t)$. $x(0)=A=2$, $x'(0)=A+B=x(0)+y(0)=6$ → $B=4$. $x(\\pi)=e^{\\pi}(2\\cos\\pi+4\\sin\\pi)=-2e^{\\pi}$."
  }),
  build({
    num: 19, subject: "공학수학", unit: "미분방정식", concept: "매개변수변환법", difficulty: "mediumHard",
    question: "미분방정식 $y''+y=\\sec x$의 해 $y(x)$가 $y(0)=\\ln 2,\\,y\\!\\left(\\dfrac{\\pi}{3}\\right)=\\dfrac{\\sqrt{3}}{6}\\pi$를 만족할 때, $y\\!\\left(\\dfrac{\\pi}{4}\\right)$의 값은? (단, $-\\tfrac{\\pi}{2}<x<\\tfrac{\\pi}{2}$)",
    options: [
      o("1","$\\dfrac{\\sqrt{2}}{4}\\ln 2+\\dfrac{\\sqrt{2}}{8}\\pi$"),
      o("2","$\\dfrac{\\sqrt{2}}{4}\\ln 2+\\dfrac{\\sqrt{2}}{6}\\pi$"),
      o("3","$\\dfrac{\\sqrt{2}}{2}\\ln 2+\\dfrac{\\sqrt{2}}{8}\\pi$"),
      o("4","$\\dfrac{\\sqrt{2}}{2}\\ln 2+\\dfrac{\\sqrt{2}}{6}\\pi$"),
      o("5","$\\dfrac{\\sqrt{2}}{6}\\ln 2+\\dfrac{\\sqrt{2}}{8}\\pi$")
    ],
    answer: 1,
    explanation: "Wronskian $w=1$. $u_1=\\!\\int(-\\tan x)dx=\\ln|\\cos x|$, $u_2=\\!\\int 1\\,dx=x$. 일반해 $y=C_1\\cos x+C_2\\sin x+\\cos x\\,\\ln(\\cos x)+x\\sin x$. $y(0)=C_1=\\ln 2$. $y(\\pi/3)$ 대입하면 $C_2=0$. $y(\\pi/4)=\\tfrac{\\sqrt 2}{2}\\ln 2+\\tfrac{\\sqrt 2}{2}\\ln(\\tfrac{1}{\\sqrt 2})+\\tfrac{\\pi}{4}\\cdot\\tfrac{\\sqrt 2}{2}=\\tfrac{\\sqrt 2}{4}\\ln 2+\\tfrac{\\sqrt 2}{8}\\pi$."
  }),
  build({
    num: 20, subject: "공학수학", unit: "미분방정식", concept: "급수해법(가변계수 ODE)", difficulty: "hard",
    question: "미분방정식 $(x^2-x)y''+(3x-1)y'+y=0\\ (0<x<1)$의 해 $y(x)$가 $y\\!\\left(\\dfrac{1}{2}\\right)=0,\\ y'\\!\\left(\\dfrac{1}{2}\\right)=-12$를 만족할 때, $y\\!\\left(\\dfrac{1}{4}\\right)$의 값은?",
    options: [o("1","$\\ln 2$"), o("2","$2\\ln 2$"), o("3","$3\\ln 2$"), o("4","$4\\ln 2$"), o("5","$5\\ln 2$")],
    answer: 4,
    explanation: "$(x^2-x)y''+(2x-1)y'+xy'+y=\\big[(x^2-x)y'\\big]'+(xy)'=0$이라 $(x^2-x)y'+xy=C$. 초기조건 대입하면 $C=3$. $y'+\\dfrac{y}{x-1}=\\dfrac{3}{x(x-1)}$. 적분인자 $\\mu=|x-1|=1-x$. $((1-x)y)'=-3/x$, 적분: $(1-x)y=-3\\ln x+C'$. $y(1/2)=0$에서 $C'=-3\\ln 2$. $y(1/4)=\\dfrac{-3(\\ln(1/4)+\\ln 2)}{3/4}=\\dfrac{3\\ln 2}{3/4}=4\\ln 2$."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
console.log("Inserted:");
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
