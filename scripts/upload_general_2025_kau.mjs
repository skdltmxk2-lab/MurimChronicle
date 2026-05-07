// Upload 2025년도 항공대 편입수학 기출 20문항 (4지선다)
// Usage: node scripts/upload_general_2025_kau.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SCHOOL = "항공대"; const YEAR = "2025";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-kau-${String(num).padStart(2, "0")}`;
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
    num: 1, subject: "공학수학", unit: "미분방정식", concept: "Cauchy-Euler 방정식", difficulty: "easyMedium",
    question: "함수 $y(x)$가 미분 방정식 $x^2 y''-2xy'+2y=0$에 대하여 조건 $y(1)=1$과 $y'(1)=3$을 만족할 때, $y(2)$의 값은?",
    options: [o("1","$1$"), o("2","$3$"), o("3","$4$"), o("4","$6$")],
    answer: 4,
    explanation: "보조방정식 $r^2-3r+2=0\\Rightarrow r=1,2$. 일반해 $y=C_1 x+C_2 x^2$. $y(1)=C_1+C_2=1$, $y'(1)=C_1+2C_2=3\\Rightarrow C_1=-1,\\,C_2=2$. $y(2)=-2+8=6$."
  }),
  build({
    num: 2, subject: "공학수학", unit: "미분방정식", concept: "베르누이 방정식", difficulty: "easyMedium",
    question: "함수 $y(x)$가 미분 방정식 $y'=2xy^2$에 대하여 조건 $y(1)=\\dfrac{1}{2}$을 만족할 때, $y(3)$의 값은?",
    options: [o("1","$-\\dfrac{1}{9}$"), o("2","$-\\dfrac{1}{6}$"), o("3","$-\\dfrac{1}{4}$"), o("4","$-\\dfrac{1}{2}$")],
    answer: 2,
    explanation: "$y^{-2}y'=2x$에서 $-(1/y)'=2x$, 적분: $-1/y=x^2+C$. $y(1)=1/2$이라 $-2=1+C$, $C=-3$. $y=\\dfrac{1}{3-x^2}$. $y(3)=-\\dfrac{1}{6}$."
  }),
  build({
    num: 3, subject: "선형대수", unit: "고유치와 대각화", concept: "대각화 가능성 판정", difficulty: "easyMedium",
    question: "다음 중 대각화가 불가능한 행렬은?",
    options: [o("1","$\\begin{pmatrix}1&2\\\\4&1\\end{pmatrix}$"), o("2","$\\begin{pmatrix}2&2\\\\0&-3\\end{pmatrix}$"), o("3","$\\begin{pmatrix}2&-1\\\\1&4\\end{pmatrix}$"), o("4","$\\begin{pmatrix}1&2\\\\0&4\\end{pmatrix}$")],
    answer: 3,
    explanation: "(1) 고유값 $1\\pm 2\\sqrt{2}$ 서로 다름 → 가능. (2) 상삼각, 고유값 $2,-3$ → 가능. (3) 특성방정식 $\\lambda^2-6\\lambda+9=0$, $\\lambda=3$ 중근이지만 $A-3I=\\begin{pmatrix}-1&-1\\\\1&1\\end{pmatrix}$의 rank가 1이라 기하적 중복도 1<2 → **대각화 불가**. (4) 상삼각, 고유값 $1,4$ → 가능."
  }),
  build({
    num: 4, subject: "선형대수", unit: "행렬", concept: "행렬식 계산", difficulty: "medium",
    question: "행렬 $\\begin{pmatrix}1&2&3&4\\\\2&3&1&5\\\\3&4&5&2\\\\4&5&6&2\\end{pmatrix}$의 행렬식 값은?",
    options: [o("1","$-24$"), o("2","$-18$"), o("3","$-12$"), o("4","$-6$")],
    answer: 4,
    explanation: "$R_2\\to R_2-2R_1,\\,R_3\\to R_3-3R_1,\\,R_4\\to R_4-4R_1$ 후 $\\det=\\begin{vmatrix}-1&-5&-3\\\\-2&-4&-10\\\\-3&-6&-14\\end{vmatrix}$. 첫 행 전개: $-1\\cdot(56-60)-(-5)\\cdot(28-30)+(-3)\\cdot(12-12)=4-10+0=-6$."
  }),
  build({
    num: 5, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "유계영역 최대/최소", difficulty: "medium",
    question: "영역 $D=\\{(x,y)\\mid 4x^2+y^2\\le 16\\}$에서의 이변수 함수 $f(x,y)=8x^2+4y$의 최댓값을 $M$, 최솟값을 $m$이라 할 때, $\\dfrac{m}{M}$의 값은?",
    options: [o("1","$-\\dfrac{11}{34}$"), o("2","$-\\dfrac{8}{17}$"), o("3","$-\\dfrac{21}{34}$"), o("4","$-\\dfrac{13}{17}$")],
    answer: 2,
    explanation: "내부 임계점: $f_x=16x=0,\\,f_y=4=0$ 모순이라 없음. 경계 $4x^2+y^2=16$에서 $8x^2=32-2y^2$이므로 $f=32-2y^2+4y=-2(y-1)^2+34$, $y\\in[-4,4]$. $y=1$: $M=34$. $y=-4$: $m=-16$. $m/M=-16/34=-8/17$."
  }),
  build({
    num: 6, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "급수 수렴 판정", difficulty: "medium",
    question: "$\\langle$보기$\\rangle$의 급수 중 수렴하는 급수의 개수는?\n\n$\\langle$보기$\\rangle$\n\n㉠ $\\displaystyle\\sum_{n=2}^{\\infty}\\!\\left(\\dfrac{n}{\\ln n}\\right)^{\\!n}\\quad$ ㉡ $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{2\\cdot 5\\cdot 8\\cdots(3n-1)}{3\\cdot 7\\cdot 11\\cdots(4n-1)}\\quad$ ㉢ $\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{1}{n\\ln n}$",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$")],
    answer: 2,
    explanation: "㉠ $n$승근 판정: $\\sqrt[n]{(n/\\ln n)^n}=n/\\ln n\\to\\infty$ 발산. ㉡ 비율판정: $\\dfrac{a_{n+1}}{a_n}=\\dfrac{3n+2}{4n+3}\\to\\tfrac{3}{4}<1$ 수렴. ㉢ 적분비교 $\\!\\int dx/(x\\ln x)=\\ln(\\ln x)$ 발산. 수렴은 ㉡ 1개."
  }),
  build({
    num: 7, subject: "미분학", unit: "극한과 연속", concept: "Taylor 전개 극한", difficulty: "medium",
    question: "극한 $\\displaystyle\\lim_{x\\to 0}\\dfrac{x\\cos x-\\sin x}{2x^2\\sin x}$의 값은?",
    options: [o("1","$-6$"), o("2","$-\\dfrac{1}{6}$"), o("3","$-\\dfrac{1}{4}$"), o("4","$-4$")],
    answer: 2,
    explanation: "$x\\cos x=x-\\tfrac{x^3}{2}+\\cdots$, $\\sin x=x-\\tfrac{x^3}{6}+\\cdots$. 분자 $=-\\tfrac{x^3}{2}+\\tfrac{x^3}{6}+\\cdots=-\\tfrac{x^3}{3}+\\cdots$. 분모 $=2x^2(x+\\cdots)=2x^3+\\cdots$. 극한 $=-\\dfrac{1}{6}$."
  }),
  build({
    num: 8, subject: "공학수학", unit: "미분방정식", concept: "완전미분방정식", difficulty: "medium",
    question: "미분 방정식 $(3x^2 y+2y^3)\\,dx+(x^3+6xy^2)\\,dy=0$의 일반해를 $ax^m y^n+bx^v y^w=C$라 할 때, $\\dfrac{a}{b}(m+n+v+w)$의 값으로 가능한 것은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$4$"), o("4","$8$")],
    answer: 3,
    explanation: "$\\partial P/\\partial y=3x^2+6y^2=\\partial Q/\\partial x$이라 완전미분. $F(x,y)=x^3 y+2xy^3=C$. $a=1,m=3,n=1,b=2,v=1,w=3$. $\\dfrac{a}{b}(m+n+v+w)=\\dfrac{1}{2}\\cdot 8=4$."
  }),
  build({
    num: 9, subject: "공학수학", unit: "라플라스 변환", concept: "적분방정식(라플라스)", difficulty: "medium",
    question: "함수 $y(t)$가 미분 방정식 $\\dfrac{dy}{dt}+y-6\\!\\int_0^t y(\\tau)\\,d\\tau=5$에 대하여 조건 $y(0)=5$를 만족할 때, $y(\\ln 2)$의 값은?",
    options: [o("1","$\\dfrac{49}{4}$"), o("2","$\\dfrac{65}{8}$"), o("3","$\\dfrac{33}{8}$"), o("4","$\\dfrac{17}{4}$")],
    answer: 1,
    explanation: "라플라스: $sY-5+Y-\\tfrac{6}{s}Y=\\tfrac{5}{s}$. 정리: $Y\\dfrac{s^2+s-6}{s}=\\dfrac{5(1+s)}{s}$, $Y=\\dfrac{5(s+1)}{(s-2)(s+3)}=\\dfrac{2}{s+3}+\\dfrac{3}{s-2}$. $y=2e^{-3t}+3e^{2t}$. $y(\\ln 2)=2\\cdot\\tfrac{1}{8}+3\\cdot 4=\\dfrac{49}{4}$."
  }),
  build({
    num: 10, subject: "선형대수", unit: "행렬", concept: "행렬 진위 판정", difficulty: "medium",
    question: "영행렬이 아닌 $n\\times n$ 행렬 $A$와 $B$에 대하여 $\\langle$보기$\\rangle$ 중 참인 명제는 모두 몇 개인가?\n\n$\\langle$보기$\\rangle$\n\n㉠ $A$가 대칭행렬이고 $B$가 대각행렬이면 $AB=BA$이다.\n\n㉡ $AA^T$는 대칭행렬이다.\n\n㉢ $\\mathrm{tr}(A)\\ge\\mathrm{tr}(B)$이면 $\\mathrm{tr}(A^2)\\ge\\mathrm{tr}(B^2)$이다.\n\n㉣ $\\det(A)\\ge\\det(B)$이면 $\\det(A^2)\\ge\\det(B^2)$이다.",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 1,
    explanation: "㉠ X. 반례 $A=\\begin{pmatrix}1&2\\\\2&1\\end{pmatrix},\\,B=\\begin{pmatrix}1&0\\\\0&2\\end{pmatrix}$이면 $AB\\ne BA$. ㉡ O. $(AA^T)^T=AA^T$. ㉢ X. $\\mathrm{tr}(A)=0,\\,\\mathrm{tr}(B)=-1$인데 $\\mathrm{tr}(A^2)<\\mathrm{tr}(B^2)$ 가능. ㉣ X. $|A|=1,\\,|B|=-2$이면 $|A^2|=1<4=|B^2|$. 참은 ㉡ 1개."
  }),
  build({
    num: 11, subject: "공학수학", unit: "미분방정식", concept: "미정계수법", difficulty: "medium",
    question: "미분방정식 $y''-y'-6y=xe^x$의 해를 $y(x)=c_1 e^{ax}+c_2 e^{bx}+Axe^x+Be^x$이라 할 때, $\\dfrac{abA}{B}$의 값은?",
    options: [o("1","$-6$"), o("2","$-12$"), o("3","$-36$"), o("4","$-48$")],
    answer: 3,
    explanation: "특성방정식 $r^2-r-6=0\\Rightarrow r=-2,3$이므로 $ab=-6$. $y_p=(Ax+B)e^x$ 대입하면 $-6Ax+(A-6B)=x$. $A=-\\tfrac{1}{6},\\,B=-\\tfrac{1}{36}$. $\\dfrac{abA}{B}=\\dfrac{(-6)(-1/6)}{-1/36}=\\dfrac{1}{-1/36}=-36$."
  }),
  build({
    num: 12, subject: "적분학", unit: "정적분의 계산", concept: "치환적분(완전제곱)", difficulty: "medium",
    question: "정적분 $\\displaystyle\\int_0^1\\dfrac{x}{\\sqrt{3-2x-x^2}}\\,dx$의 값은?",
    options: [o("1","$\\sqrt{3}-\\dfrac{\\pi}{3}$"), o("2","$\\sqrt{3}-\\dfrac{\\pi}{4}$"), o("3","$\\sqrt{3}+\\dfrac{\\pi}{4}$"), o("4","$\\sqrt{3}+\\dfrac{\\pi}{3}$")],
    answer: 1,
    explanation: "$3-2x-x^2=4-(x+1)^2$. $u=x+1$ 치환: $\\!\\int_1^2\\dfrac{u-1}{\\sqrt{4-u^2}}du=[-\\sqrt{4-u^2}]_1^2-[\\sin^{-1}(u/2)]_1^2=\\sqrt 3-(\\tfrac{\\pi}{2}-\\tfrac{\\pi}{6})=\\sqrt 3-\\dfrac{\\pi}{3}$."
  }),
  build({
    num: 13, subject: "미분학", unit: "추가내용", concept: "미적분학 기본정리(합성)", difficulty: "medium",
    question: "함수 $g(x)=\\displaystyle\\int_0^{\\cos x}\\sqrt{1+\\sin t+\\cos t}\\,dt$에 대하여 함수 $f(x)=\\displaystyle\\int_1^{g(x)}\\dfrac{1}{\\sqrt{1+t^3}}\\,dt$일 때, $f'\\!\\left(\\dfrac{\\pi}{2}\\right)$의 값은?",
    options: [o("1","$-\\dfrac{\\pi}{2}$"), o("2","$-\\sqrt{2}$"), o("3","$-\\dfrac{\\pi}{3}$"), o("4","$-\\dfrac{\\sqrt{2}}{2}$")],
    answer: 2,
    explanation: "$f'(x)=\\dfrac{g'(x)}{\\sqrt{1+g(x)^3}}$. $g(\\pi/2)=\\!\\int_0^0\\cdots=0$. $g'(x)=\\sqrt{1+\\sin(\\cos x)+\\cos(\\cos x)}\\cdot(-\\sin x)$. $g'(\\pi/2)=\\sqrt{1+0+1}\\cdot(-1)=-\\sqrt 2$. $f'(\\pi/2)=-\\sqrt 2$."
  }),
  build({
    num: 14, subject: "적분학", unit: "정적분의 응용", concept: "극좌표 영역 넓이", difficulty: "mediumHard",
    question: "극좌표로 정의된 두 곡선 $r=\\cos 2\\theta$와 $r=\\dfrac{1}{2}$로 만들어지는 영역 중 색칠된 영역(꽃잎 안쪽의 $r=1/2$ 바깥 부분)의 넓이는?",
    options: [o("1","$\\dfrac{3\\sqrt{3}+\\pi}{48}$"), o("2","$\\dfrac{-4+\\sqrt{3}+\\pi}{16}$"), o("3","$\\dfrac{-8+3\\sqrt{3}+\\pi}{16}$"), o("4","$\\dfrac{3\\sqrt{3}-\\pi}{48}$")],
    answer: 4,
    explanation: "교점 $\\cos 2\\theta=1/2\\Rightarrow\\theta=\\pi/6$. 대칭으로 $S=2\\cdot\\tfrac{1}{2}\\!\\int_{\\pi/6}^{\\pi/4}\\!\\left(\\tfrac{1}{4}-\\cos^2 2\\theta\\right)d\\theta$. 계산: $\\tfrac{1}{4}\\cdot\\tfrac{\\pi}{12}-\\tfrac{1}{2}\\!\\int_{\\pi/3}^{\\pi/2}\\cos^2 t\\,dt=\\tfrac{\\pi}{48}-\\tfrac{1}{2}\\!\\left(\\tfrac{\\pi}{12}-\\tfrac{\\sqrt 3}{8}\\right)=\\dfrac{3\\sqrt 3-\\pi}{48}$."
  }),
  build({
    num: 15, subject: "다변수함수", unit: "선적분과 면적분", concept: "발산정리(Gauss)", difficulty: "mediumHard",
    question: "벡터장 $\\mathbf{F}(x,y,z)=z\\sin^{-1}(y^3)\\mathbf{i}+z^3\\ln(x^{100}+1)\\mathbf{j}+z^2\\mathbf{k}$에 대하여, 포물면 $z=3-x^2-y^2$과 평면 $z=2$로 둘러싸인 영역에서의 선다발(flux)을 구하면? (단, 영역의 방향은 바깥쪽 방향이다.)",
    options: [o("1","$\\dfrac{7}{3}\\pi$"), o("2","$\\dfrac{13}{3}\\pi$"), o("3","$\\dfrac{19}{3}\\pi$"), o("4","$\\dfrac{25}{3}\\pi$")],
    answer: 1,
    explanation: "$\\nabla\\cdot\\mathbf{F}=2z$. 영역 $T:\\,2\\le z\\le 3-x^2-y^2,\\,x^2+y^2\\le 1$. $\\!\\iiint_T 2z\\,dV=\\!\\iint_D[(3-r^2)^2-4]\\,dA=2\\pi\\!\\int_0^1(5r-6r^3+r^5)dr=2\\pi\\cdot\\tfrac{7}{6}=\\dfrac{7\\pi}{3}$."
  }),
  build({
    num: 16, subject: "다변수함수", unit: "선적분과 면적분", concept: "Green 정리(특이점)", difficulty: "mediumHard",
    question: "벡터장 $\\mathbf{F}(x,y)=\\!\\left(\\dfrac{x^5+x^3y^2-y}{x^2+y^2}\\right)\\!\\mathbf{i}+\\!\\left(\\dfrac{x^2\\cos y+y^2\\cos y+x}{x^2+y^2}\\right)\\!\\mathbf{j}$에 대하여 선적분 $\\displaystyle\\oint_C\\mathbf{F}\\cdot d\\mathbf{r}$를 구하면? (단, $C$는 타원 $\\dfrac{x^2}{4}+\\dfrac{y^2}{9}=1$이며 양의 방향의 곡선이다.)",
    options: [o("1","$\\pi$"), o("2","$2\\pi$"), o("3","$3\\pi$"), o("4","$4\\pi$")],
    answer: 2,
    explanation: "$\\mathbf{F}=(x^3,\\cos y)+\\!\\left(-\\dfrac{y}{x^2+y^2},\\dfrac{x}{x^2+y^2}\\right)$. 첫 항은 완전(폐적분 $0$). 둘째 항은 원점만 둘러싸는 폐곡선 적분 $=2\\pi$. 합 $=2\\pi$."
  }),
  build({
    num: 17, subject: "선형대수", unit: "추가내용", concept: "이차형식 최적화", difficulty: "mediumHard",
    question: "행렬 $A=\\begin{pmatrix}2&5\\\\-1&8\\end{pmatrix}$, 벡터 $\\mathbf{b}=\\begin{pmatrix}-2\\\\4\\end{pmatrix}$와 모든 성분이 실수인 벡터 $X$에 대하여 $X^T AX+X^T\\mathbf{b}$가 최소가 되게 하는 벡터 $X$의 모든 성분의 합은?",
    options: [o("1","$\\dfrac{3}{2}$"), o("2","$-\\dfrac{5}{2}$"), o("3","$-\\dfrac{3}{2}$"), o("4","$\\dfrac{1}{2}$")],
    answer: 4,
    explanation: "$g(X)=X^T AX+X^T b$. $\\nabla g=(A+A^T)X+b=0$. $A+A^T=\\begin{pmatrix}4&4\\\\4&16\\end{pmatrix}$, 역행렬 $\\dfrac{1}{48}\\begin{pmatrix}16&-4\\\\-4&4\\end{pmatrix}$. $X=-\\tfrac{1}{48}\\begin{pmatrix}16&-4\\\\-4&4\\end{pmatrix}\\begin{pmatrix}-2\\\\4\\end{pmatrix}=-\\tfrac{1}{48}(-48,24)^T=(1,-1/2)^T$. 합 $=1/2$."
  }),
  build({
    num: 18, subject: "선형대수", unit: "고유치와 대각화", concept: "고유값과 행렬 거듭제곱", difficulty: "medium",
    question: "고윳값으로 $2$와 $3$을 갖는 $3\\times 3$ 행렬 $A$에 대하여, 고윳값 $2$에 대한 고유벡터는 $\\begin{pmatrix}1\\\\2\\\\-2\\end{pmatrix}$이고 고윳값 $3$에 대한 고유벡터는 $\\begin{pmatrix}2\\\\1\\\\-3\\end{pmatrix}$일 때, $A^3\\!\\begin{pmatrix}0\\\\3\\\\1\\end{pmatrix}$의 모든 성분의 합은?",
    options: [o("1","$16$"), o("2","$27$"), o("3","$35$"), o("4","$42$")],
    answer: 1,
    explanation: "$\\begin{pmatrix}0\\\\3\\\\1\\end{pmatrix}=2\\begin{pmatrix}1\\\\2\\\\-2\\end{pmatrix}-\\begin{pmatrix}2\\\\1\\\\-3\\end{pmatrix}$로 분해. $A^3$를 적용하면 $2\\cdot 2^3\\!\\begin{pmatrix}1\\\\2\\\\-2\\end{pmatrix}-3^3\\!\\begin{pmatrix}2\\\\1\\\\-3\\end{pmatrix}=(16,32,-32)+(-54,-27,81)=(-38,5,49)$. 성분합 $=-38+5+49=16$."
  }),
  build({
    num: 19, subject: "다변수함수", unit: "중적분", concept: "적분순서 변경", difficulty: "medium",
    question: "반복적분 $\\displaystyle\\int_0^1\\!\\!\\int_{\\sin^{-1}y}^{\\pi/2}\\cos x\\,\\sqrt{3+\\cos^2 x}\\,dx\\,dy$의 값은?",
    options: [o("1","$\\dfrac{4}{3}-\\sqrt{2}$"), o("2","$\\dfrac{8}{3}-\\sqrt{2}$"), o("3","$\\dfrac{4}{3}-\\sqrt{3}$"), o("4","$\\dfrac{8}{3}-\\sqrt{3}$")],
    answer: 4,
    explanation: "순서 변경: $0\\le x\\le\\pi/2,\\,0\\le y\\le\\sin x$. $\\!\\int_0^{\\pi/2}\\sin x\\cos x\\,\\sqrt{3+\\cos^2 x}\\,dx$. $u=3+\\cos^2 x$ 치환: $-\\tfrac{1}{2}\\!\\int_4^3\\sqrt u\\,du=\\tfrac{1}{2}\\cdot\\tfrac{2}{3}[u^{3/2}]_3^4=\\tfrac{1}{3}(8-3\\sqrt 3)=\\dfrac{8}{3}-\\sqrt 3$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "경도 및 방향도함수", concept: "방향도함수와 단위벡터 자취", difficulty: "mediumHard",
    question: "점 $P(0,0,1)\\in\\mathbb{R}^3$에서 삼변수함수 $f(x,y,z)=3z+e^{x^2-y^2}$의 최대 변화율을 $M$이라 하자. 점 $P$에서의 $f$의 방향도함수의 값이 $\\dfrac{M}{3}$이 되는 모든 단위벡터 $\\mathbf{u}=\\dfrac{\\mathbf{v}}{|\\mathbf{v}|}$에 대하여, $\\mathbf{u}$의 끝점이 만드는 도형의 둘레의 길이는?",
    options: [o("1","$\\pi$"), o("2","$\\dfrac{2\\sqrt{2}}{3}\\pi$"), o("3","$\\dfrac{4\\sqrt{2}}{3}\\pi$"), o("4","$\\dfrac{8}{9}\\pi$")],
    answer: 3,
    explanation: "$\\nabla f=(2xe^{x^2-y^2},-2ye^{x^2-y^2},3)$, $P$에서 $(0,0,3)$. $M=\\|\\nabla f\\|=3$. 단위벡터 $\\mathbf{u}=(a,b,c)$가 $\\nabla f\\cdot\\mathbf{u}=3c=M/3=1\\Rightarrow c=1/3$. $a^2+b^2=1-1/9=8/9$. $\\mathbf{u}$의 끝점은 $z=1/3$ 평면에서 반지름 $\\tfrac{2\\sqrt 2}{3}$인 원. 둘레 $=2\\pi\\cdot\\tfrac{2\\sqrt 2}{3}=\\dfrac{4\\sqrt 2}{3}\\pi$."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
console.log("Inserted:");
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
