// Upload 2025년도 가천대 편입수학 기출 25문항 (일반 문제)
// Usage: node scripts/upload_general_2025_gachon.mjs
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

const SCHOOL = "가천대";
const YEAR = "2025";
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
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "샌드위치 정리", difficulty: "easyMedium",
    question: "$\\displaystyle\\lim_{x\\to 0}\\dfrac{x^3\\sin\\!\\left(\\dfrac{1}{x}\\right)}{\\sin x}$의 값은?",
    options: [o("1","$-1$"), o("2","$0$"), o("3","$1$"), o("4","존재하지 않는다.")],
    answer: 2,
    explanation: "$\\dfrac{x^3\\sin(1/x)}{\\sin x}=\\dfrac{x}{\\sin x}\\cdot x^2\\sin(1/x)$. $\\dfrac{x}{\\sin x}\\to 1$, $|x^2\\sin(1/x)|\\le x^2\\to 0$이므로 샌드위치 정리에 의해 극한값은 $0$."
  }),
  build({
    num: 2, subject: "다변수함수", unit: "경도 및 방향도함수", concept: "경도(gradient)", difficulty: "easyMedium",
    question: "점 $(2,1)$에서 함수 $f(x,y)=x^2 y+\\sqrt{y}$의 값이 가장 빨리 증가하는 방향의 단위벡터를 $\\mathbf{u}$라 할 때, 방향도함수 $D_{\\mathbf{u}}f(2,1)$의 값은?",
    options: [o("1","$\\dfrac{\\sqrt{145}}{2}$"), o("2","$\\dfrac{\\sqrt{155}}{2}$"), o("3","$7$"), o("4","$\\dfrac{17}{2}$")],
    answer: 1,
    explanation: "$\\nabla f=(2xy,\\,x^2+\\tfrac{1}{2\\sqrt{y}})$이므로 $\\nabla f(2,1)=(4,\\tfrac{9}{2})$. 최댓값은 $|\\nabla f(2,1)|=\\sqrt{16+\\tfrac{81}{4}}=\\sqrt{\\tfrac{145}{4}}=\\dfrac{\\sqrt{145}}{2}$."
  }),
  build({
    num: 3, subject: "다변수함수", unit: "선적분과 면적분", concept: "발산정리(Gauss)", difficulty: "medium",
    question: "중심이 원점이고 반지름이 $2$인 구면을 $S$라 할 때, $\\mathbf{F}=\\langle xz,\\,yz,\\,z^3\\rangle$에 대해 $\\displaystyle\\iint_S \\mathbf{F}\\cdot\\mathbf{n}\\,dS$의 값은? (단, $\\mathbf{n}$은 곡면 $S$에 대해 밖으로 향하는 단위 법선벡터)",
    options: [o("1","$\\dfrac{83}{10}\\pi$"), o("2","$\\dfrac{97}{10}\\pi$"), o("3","$\\dfrac{104}{5}\\pi$"), o("4","$\\dfrac{128}{5}\\pi$")],
    answer: 4,
    explanation: "발산정리: $\\nabla\\cdot\\mathbf{F}=z+z+3z^2=2z+3z^2$. 구좌표에서 $\\iiint_V(2z+3z^2)dV$. 대칭성으로 $\\iiint 2z\\,dV=0$. $\\iiint 3z^2\\,dV=3\\cdot\\tfrac{1}{3}\\iiint(x^2+y^2+z^2)dV=\\int_0^2 r^2\\cdot 4\\pi r^2 dr=\\dfrac{128\\pi}{5}$."
  }),
  build({
    num: 4, subject: "다변수함수", unit: "체적과 곡면적", concept: "회전곡면의 넓이", difficulty: "mediumHard",
    question: "극곡선 $r^2=5\\cos 2\\theta$을 $y$축에 대하여 회전시켜 얻은 곡면의 넓이는?",
    options: [o("1","$10\\pi$"), o("2","$10\\sqrt{2}\\,\\pi$"), o("3","$10(2-\\sqrt{2})\\pi$"), o("4","$25\\sqrt{2}\\,\\pi$")],
    answer: 2,
    explanation: "극곡선 $r=r(\\theta)$를 $y$축 회전한 곡면의 넓이 $=2\\pi\\int x\\,ds=2\\pi\\int r\\cos\\theta\\sqrt{r^2+(r')^2}\\,d\\theta$. $r^2=5\\cos 2\\theta\\Rightarrow rr'=-5\\sin 2\\theta$, $r^2+(r')^2=\\dfrac{25}{r^2}$. 정리하면 $\\sqrt{r^2+(r')^2}=\\dfrac{5}{r}$. 따라서 $S=2\\pi\\int_{-\\pi/4}^{\\pi/4} 5\\cos\\theta\\,d\\theta=2\\pi\\cdot 10\\sin(\\pi/4)=10\\sqrt{2}\\,\\pi$."
  }),
  build({
    num: 5, subject: "다변수함수", unit: "편도함수", concept: "연쇄법칙(2계 편미분)", difficulty: "medium",
    question: "$P=\\dfrac{x+y}{y+z}$, $x=u+\\cos v+4\\sin w$, $y=u-\\cos v+4\\sin w$, $z=u+\\cos v-4\\sin w$일 때 $u=2$, $v=\\tfrac{\\pi}{3}$, $w=\\tfrac{\\pi}{2}$에서 $\\dfrac{\\partial^2 P}{\\partial w\\,\\partial u}$의 값은?",
    options: [o("1","$-1$"), o("2","$0$"), o("3","$1$"), o("4","$\\sqrt{3}$")],
    answer: 2,
    explanation: "$x+y=2u+8\\sin w$, $y+z=2u-2\\cdot 4\\sin w\\cdot 0+\\cdots$ 단순화하면 $y+z=2u+(-\\cos v+4\\sin w)+(\\cos v-4\\sin w)=2u$. 따라서 $P=\\dfrac{2u+8\\sin w}{2u}=1+\\dfrac{4\\sin w}{u}$. $P_u=-\\dfrac{4\\sin w}{u^2}$, $P_{uw}=-\\dfrac{4\\cos w}{u^2}$. $w=\\tfrac{\\pi}{2}$에서 $\\cos w=0$이므로 값은 $0$."
  }),
  build({
    num: 6, subject: "선형대수", unit: "추가내용", concept: "특이값(SVD)", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix} 3 & 2 & 2 \\\\ 2 & 3 & -2 \\end{pmatrix}$의 모든 특이값(singular value)의 합은?",
    options: [o("1","$34$"), o("2","$25$"), o("3","$16$"), o("4","$8$")],
    answer: 4,
    explanation: "$AA^T=\\begin{pmatrix}17 & 8\\\\8 & 17\\end{pmatrix}$의 고유값은 $17\\pm 8=25,9$. 특이값은 $\\sqrt{25}=5$, $\\sqrt{9}=3$. 합 $=8$."
  }),
  build({
    num: 7, subject: "공학수학", unit: "미분방정식", concept: "Cauchy-Euler 방정식", difficulty: "medium",
    question: "미분방정식 $2(x-1)^2 y''+(x-1)y'-3y=0$, $y(2)=3$, $y'(2)=2$의 해 $y=y(x)$에 대하여 $y(5)$의 값은?",
    options: [o("1","$\\dfrac{61}{4}$"), o("2","$\\dfrac{63}{4}$"), o("3","$\\dfrac{65}{4}$"), o("4","$\\dfrac{67}{4}$")],
    answer: 3,
    explanation: "$t=x-1$로 치환: $2t^2 y''+ty'-3y=0$. $y=t^m$ 대입 $\\Rightarrow 2m(m-1)+m-3=0\\Rightarrow 2m^2-m-3=0\\Rightarrow m=\\tfrac{3}{2},-1$. $y=At^{3/2}+Bt^{-1}$. $y(2)$:$t=1$이므로 $A+B=3$, $y'=\\tfrac{3A}{2}t^{1/2}-Bt^{-2}$, $y'(2)$:$\\tfrac{3A}{2}-B=2$. 두 식에서 $A=2,B=1$. $x=5$:$t=4$, $y=2\\cdot 8+\\tfrac{1}{4}=\\dfrac{65}{4}$."
  }),
  build({
    num: 8, subject: "다변수함수", unit: "중적분", concept: "극좌표 변환", difficulty: "medium",
    question: "$\\displaystyle\\int_{1/2}^{1}\\!\\!\\int_{\\sqrt{1-x^2}}^{\\sqrt{3}\\,x}\\!\\arctan\\!\\dfrac{y}{x}\\,dy\\,dx+\\int_{1}^{2}\\!\\!\\int_{0}^{\\sqrt{4-x^2}}\\!\\arctan\\!\\dfrac{y}{x}\\,dy\\,dx$의 값은?",
    options: [o("1","$1$"), o("2","$\\dfrac{\\pi}{2}$"), o("3","$\\dfrac{\\pi^2}{9}$"), o("4","$\\dfrac{\\pi^2}{12}$")],
    answer: 4,
    explanation: "두 영역을 합치면 극좌표에서 $1\\le r\\le 2$, $0\\le\\theta\\le\\tfrac{\\pi}{3}$. $\\arctan(y/x)=\\theta$. $\\int_0^{\\pi/3}\\theta\\,d\\theta\\cdot\\int_1^2 r\\,dr=\\dfrac{\\pi^2}{18}\\cdot\\dfrac{3}{2}=\\dfrac{\\pi^2}{12}$."
  }),
  build({
    num: 9, subject: "선형대수", unit: "행렬", concept: "행렬식", difficulty: "medium",
    question: "다음 $\\langle$보기$\\rangle$의 모든 행렬들의 행렬식의 값의 합은?\n\n$\\text{ㄱ.}\\begin{pmatrix}1&1&1\\\\0&1&1\\\\1&0&1\\end{pmatrix},\\quad \\text{ㄴ.}\\begin{pmatrix}1&1&1&1&1\\\\0&1&1&1&1\\\\1&0&1&1&1\\\\1&1&0&1&1\\\\1&1&1&0&1\\end{pmatrix},\\quad \\text{ㄷ.}\\begin{pmatrix}1&1&1&1&1&1&1\\\\0&1&1&1&1&1&1\\\\1&0&1&1&1&1&1\\\\1&1&0&1&1&1&1\\\\1&1&1&0&1&1&1\\\\1&1&1&1&0&1&1\\\\1&1&1&1&1&0&1\\end{pmatrix}$",
    options: [o("1","$-1$"), o("2","$1$"), o("3","$3$"), o("4","$9$")],
    answer: 3,
    explanation: "각 행렬은 모두 대각이 $1$이고, 첫 열이 $(1,0,1,1,\\dots,1)^T$, 두 번째 열부터는 $i$번째 행에서 $i-1$번째 열만 $0$인 패턴. 첫 행을 기준으로 다른 행에서 빼주면(또는 행 연산으로 상삼각화) 각 행렬식이 모두 $1$이 됨을 확인할 수 있다. 따라서 ㄱ+ㄴ+ㄷ$=1+1+1=3$."
  }),
  build({
    num: 10, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "멱급수 수렴구간", difficulty: "medium",
    question: "급수 $\\displaystyle\\sum_{n=1}^{\\infty}(-1)^n\\dfrac{(x+2)^n}{n\\,2^n}$이 수렴하는 정수 $x$의 개수는?",
    options: [o("1","$3$"), o("2","$4$"), o("3","$5$"), o("4","$6$")],
    answer: 2,
    explanation: "수렴반경: $\\lim|a_{n+1}/a_n|=|x+2|/2<1\\Rightarrow|x+2|<2\\Rightarrow -4<x<0$. 끝점: $x=-4$일 때 $\\sum 1/n$ 발산, $x=0$일 때 $\\sum(-1)^n/n$ 수렴. 따라서 $-3\\le x\\le 0$, 정수는 $-3,-2,-1,0$ — 4개."
  }),
  build({
    num: 11, subject: "선형대수", unit: "벡터공간", concept: "부분공간 정사영", difficulty: "medium",
    question: "유클리드 공간 $\\mathbb{R}^4$의 부분공간 $E=\\{(x_1,x_2,x_3,x_4)^T\\in\\mathbb{R}^4\\mid x_2=x_1+x_3+x_4\\}$에 대하여 벡터 $\\mathbf{u}=(1,0,-1,2)^T$의 $E$ 위로의 정사영을 $\\mathrm{proj}_E\\mathbf{u}=(a,b,c,d)^T$라 하자. $a+2b+3c+4d$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 3,
    explanation: "$E$의 직교여공간 $E^\\perp=\\mathrm{span}\\{(1,-1,1,1)\\}$ (제약 $x_1-x_2+x_3+x_4=0$의 법선). $\\mathbf{u}\\cdot(1,-1,1,1)=1-0-1+2=2$, 노름$^2=4$. $\\mathrm{proj}_{E^\\perp}\\mathbf{u}=\\tfrac{2}{4}(1,-1,1,1)=(\\tfrac12,-\\tfrac12,\\tfrac12,\\tfrac12)$. $\\mathrm{proj}_E\\mathbf{u}=(\\tfrac12,\\tfrac12,-\\tfrac32,\\tfrac32)$. $a+2b+3c+4d=\\tfrac12+1-\\tfrac92+6=3$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "라그랑주 승수법", difficulty: "mediumHard",
    question: "타원면 $x^2+\\dfrac{y^2}{2}+\\dfrac{z^2}{3}=1$ 위에서 $f(x,y,z)=\\ln(6x^2+1)+\\ln(3y^2+1)+\\ln(2z^2+1)$의 최댓값을 $M$, 최솟값을 $m$이라 할 때 $M+m$의 값은?",
    options: [o("1","$\\ln 432$"), o("2","$\\ln 189$"), o("3","$\\ln 34$"), o("4","$\\ln 7$")],
    answer: 2,
    explanation: "라그랑주 승수법. $\\nabla f=\\lambda\\nabla g$에서 $\\dfrac{12x}{6x^2+1}=\\lambda\\cdot 2x$, $\\dfrac{6y}{3y^2+1}=\\lambda\\cdot y$, $\\dfrac{4z}{2z^2+1}=\\lambda\\cdot\\tfrac{2z}{3}$. 정리하면 모두 $\\lambda=\\dfrac{6}{6x^2+1}=\\dfrac{6}{3y^2+1}=\\dfrac{6}{2z^2+1}$, 즉 $6x^2=3y^2=2z^2=:k$. 제약식에 대입: $\\tfrac{k}{6}+\\tfrac{k}{6}+\\tfrac{k}{6}=1\\Rightarrow k=2$, $x^2=\\tfrac13,\\,y^2=\\tfrac23,\\,z^2=1$. 이 점에서 $f=3\\ln 3=\\ln 27$. 한편 경계점($x^2=1,y=z=0$ 등)에서는 $f=\\ln 7$. 따라서 $M=\\ln 27$, $m=\\ln 7$, $M+m=\\ln(27\\cdot 7)=\\ln 189$."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "체적과 곡면적", concept: "곡면 넓이(투영)", difficulty: "medium",
    question: "$xy$평면에서 직사각형 $[0,\\sqrt{3}]\\times[0,3]$이 있다. 이 직사각형 위에 놓인 곡면 $x^2+z^2=4$의 넓이는?",
    options: [o("1","$1$"), o("2","$\\dfrac{\\pi}{2}$"), o("3","$\\pi$"), o("4","$2\\pi$")],
    answer: 4,
    explanation: "$z=\\sqrt{4-x^2}$, $dS=\\dfrac{2}{\\sqrt{4-x^2}}\\,dA$. $\\int_0^{\\sqrt 3}\\!\\!\\int_0^3\\dfrac{2}{\\sqrt{4-x^2}}dy\\,dx=3\\cdot 2\\cdot\\arcsin(x/2)\\Big|_0^{\\sqrt 3}=6\\cdot\\tfrac{\\pi}{3}=2\\pi$."
  }),
  build({
    num: 14, subject: "적분학", unit: "정적분의 응용", concept: "곡선과 직선 사이 넓이", difficulty: "mediumHard",
    question: "$f(x)=\\dfrac{2x^4+8x^3-x^2-30x}{24}$에 대하여 $g(x)=f(-|x|-1)$이라 하자. 함수 $g(x)$의 최솟값을 $k$라 할 때, $g(x)$의 그래프와 직선 $y=k$로 둘러싸인 부분의 넓이는?",
    options: [o("1","$\\dfrac{971}{320}$"), o("2","$\\dfrac{971}{160}$"), o("3","$\\dfrac{17}{10}$"), o("4","$\\dfrac{3}{10}$")],
    answer: 4,
    explanation: "$t=-|x|-1\\le -1$로 두면 $g(x)=f(t)$이고 $g$는 $|x|$에 대한 우대칭 함수. $f'(t)=\\dfrac{4t^3+12t^2-t-15}{12}=\\dfrac{(2t+5)(2t+3)(t-1)}{12}$이므로 임계점은 $t=-\\tfrac52,-\\tfrac32,1$. $t\\le -1$ 범위 내 임계점은 $t=-\\tfrac52,-\\tfrac32$. 함숫값 비교하면 $f(-\\tfrac52)=-\\tfrac{325}{192}$(극소), $f(-\\tfrac32)=\\tfrac{207}{192}$(극대). 따라서 $g$의 최솟값 $k=f(-\\tfrac52)$는 $|x|=\\tfrac32$ 즉 $x=\\pm\\tfrac32$에서 달성. $y=k$와 $g$로 둘러싸인 부분은 $-\\tfrac32\\le x\\le\\tfrac32$ 구간이고, 대칭성으로 넓이 $=2\\int_0^{3/2}\\!(g(x)-k)\\,dx=2\\int_{-5/2}^{-1}\\!(f(t)-k)\\,dt$. 적분 계산 후 $\\dfrac{3}{10}$."
  }),
  build({
    num: 15, subject: "공학수학", unit: "미분방정식", concept: "1계 선형 ODE", difficulty: "medium",
    question: "미분방정식 $\\dfrac{dr}{d\\theta}+r\\tan\\theta=2\\cos^2\\theta\\sin\\theta$, $r\\!\\left(\\tfrac{\\pi}{6}\\right)=0$의 해 $r=r(\\theta)$에 대하여 $r\\!\\left(\\tfrac{\\pi}{4}\\right)$의 값은?",
    options: [o("1","$\\dfrac{\\sqrt{2}}{2}$"), o("2","$\\dfrac{\\sqrt{3}}{4}$"), o("3","$\\dfrac{\\sqrt{2}}{8}$"), o("4","$\\dfrac{\\sqrt{3}}{12}$")],
    answer: 3,
    explanation: "적분인자 $\\mu=\\sec\\theta$. $(r\\sec\\theta)'=2\\cos\\theta\\sin\\theta=\\sin 2\\theta$. 적분: $r\\sec\\theta=-\\tfrac{1}{2}\\cos 2\\theta+C$. $\\theta=\\tfrac{\\pi}{6}$, $r=0$: $0=-\\tfrac{1}{2}\\cdot\\tfrac{1}{2}+C\\Rightarrow C=\\tfrac{1}{4}$. $\\theta=\\tfrac{\\pi}{4}$: $r\\sqrt{2}=0+\\tfrac{1}{4}\\Rightarrow r=\\dfrac{\\sqrt{2}}{8}$."
  }),
  build({
    num: 16, subject: "공학수학", unit: "미분방정식", concept: "미정계수법", difficulty: "mediumHard",
    question: "미분방정식 $\\dfrac{d^2 y}{dx^2}-2\\dfrac{dy}{dx}-3y=2e^x-10\\sin x$, $y(0)=2$, $y'(0)=4$의 해가 $y(x)=ae^{3x}+be^{-x}+ce^x+p\\sin x+q\\cos x$일 때, $a\\times b\\times c\\times p\\times q$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$")],
    answer: 4,
    explanation: "특성방정식 $r^2-2r-3=0\\Rightarrow r=3,-1$ → 동차해 $ae^{3x}+be^{-x}$. (i) $2e^x$ 매칭: $y_{p1}=ce^x$ 대입 $c-2c-3c=-4c=2\\Rightarrow c=-\\tfrac12$. (ii) $-10\\sin x$ 매칭: $y_{p2}=p\\sin x+q\\cos x$ 대입하면 $(-4p+2q)\\sin x+(-2p-4q)\\cos x=-10\\sin x$ → $-4p+2q=-10$, $-2p-4q=0$. 풀면 $p=2,\\,q=-1$. 초기조건 $y(0)=a+b-\\tfrac12-1=2\\Rightarrow a+b=\\tfrac72$, $y'(0)=3a-b-\\tfrac12+2=4\\Rightarrow 3a-b=\\tfrac52$. 풀면 $a=\\tfrac32,\\,b=2$. $a\\cdot b\\cdot c\\cdot p\\cdot q=\\tfrac32\\cdot 2\\cdot(-\\tfrac12)\\cdot 2\\cdot(-1)=3$."
  }),
  build({
    num: 17, subject: "선형대수", unit: "고유치와 대각화", concept: "행렬 다항식의 고유값", difficulty: "mediumHard",
    question: "임의의 정사각형 $V$의 모든 고윳값으로 이루어진 집합을 $E_V$라 하자. 행렬 $S=\\begin{pmatrix}1&2&-1\\\\1&0&1\\\\4&-4&5\\end{pmatrix}$와 다음 $\\langle$보기$\\rangle$에 대하여 $D=E_A\\cup E_B\\cup E_C$라 할 때, 집합 $D$의 모든 원소의 합은?\n\n$\\langle$보기$\\rangle$ $\\text{ㄱ. } A=S,\\quad \\text{ㄴ. } B=S^3,\\quad \\text{ㄷ. } C=S^{-1}$ (단, $A^{-1}$은 $A$의 역행렬)",
    options: [o("1","$\\dfrac{251}{6}$"), o("2","$\\dfrac{263}{6}$"), o("3","$\\dfrac{251}{3}$"), o("4","$\\dfrac{263}{3}$")],
    answer: 1,
    explanation: "$S$의 고윳값을 $\\lambda_i$라 하면 행렬다항식 성질에서 $S^3$의 고윳값은 $\\lambda_i^3$, $S^{-1}$은 $1/\\lambda_i$. 특성방정식: $\\mathrm{tr}(S)=6$, $\\det(S)=6$, 2차 합 $=11$, 따라서 $\\lambda^3-6\\lambda^2+11\\lambda-6=(\\lambda-1)(\\lambda-2)(\\lambda-3)=0$ → $\\lambda=1,2,3$. $E_A=\\{1,2,3\\}$, $E_B=\\{1,8,27\\}$, $E_C=\\{1,\\tfrac12,\\tfrac13\\}$. 중복 제거한 합집합 $D=\\{1,2,3,8,27,\\tfrac12,\\tfrac13\\}$. 합 $=41+\\tfrac56=\\dfrac{251}{6}$."
  }),
  build({
    num: 18, subject: "미분학", unit: "추가내용", concept: "근과 계수의 관계 + 무한급수", difficulty: "hard",
    question: "자연수 $n(n\\ge 3)$에 대하여 직선 $y=x+n$이 함수 $y=\\dfrac{1}{x^2-1}$의 그래프와 만나는 서로 다른 세 점의 $x$좌표를 각각 $\\alpha_n,\\beta_n,\\gamma_n$이라 하자. $\\alpha_n+\\beta_n+\\gamma_n=a_n$, $\\alpha_n\\beta_n+\\beta_n\\gamma_n+\\gamma_n\\alpha_n=b_n$, $\\alpha_n\\beta_n\\gamma_n=c_n$이라 할 때, $\\displaystyle\\sum_{n=k}^{\\infty}\\dfrac{1}{a_n^3+b_n^3+c_n^3}=\\dfrac{1}{2025}$를 만족시키는 $k$의 값은?",
    options: [o("1","$675$"), o("2","$729$"), o("3","$813$"), o("4","$905$")],
    answer: 1,
    explanation: "$x+n=\\tfrac{1}{x^2-1}$ ⇒ $(x+n)(x^2-1)=1$ ⇒ $x^3+nx^2-x-(n+1)=0$. 비에타: $a_n=-n$, $b_n=-1$, $c_n=n+1$. $a_n^3+b_n^3+c_n^3=-n^3-1+(n+1)^3=3n^2+3n=3n(n+1)$. $\\sum_{n=k}^{\\infty}\\tfrac{1}{3n(n+1)}=\\tfrac{1}{3k}$. $\\tfrac{1}{3k}=\\tfrac{1}{2025}\\Rightarrow k=675$."
  }),
  build({
    num: 19, subject: "선형대수", unit: "고유치와 대각화", concept: "직교대각화", difficulty: "mediumHard",
    question: "행렬 $P=\\begin{pmatrix} a & 1/\\sqrt{3} & p \\\\ b & 1/\\sqrt{3} & q \\\\ c & 1/\\sqrt{3} & 0 \\end{pmatrix}$가 행렬 $A=\\begin{pmatrix}1&1&1\\\\1&1&1\\\\1&1&1\\end{pmatrix}$을 직교대각화한다. $a+2b+c+p+3q$의 값은? (단, $a,p$는 음수)",
    options: [o("1","$\\dfrac{\\sqrt{6}}{6}+\\sqrt{2}$"), o("2","$\\sqrt{2}$"), o("3","$-\\dfrac{\\sqrt{6}}{6}+\\sqrt{2}$"), o("4","$0$")],
    answer: 3,
    explanation: "$A=\\mathbf{1}\\mathbf{1}^T$ (rank 1)이므로 고윳값은 $3,0,0$. $\\tfrac{1}{\\sqrt 3}(1,1,1)$가 $\\lambda=3$ 고유벡터(이미 $P$의 2열). $\\lambda=0$ 고유공간은 $(1,1,1)$의 직교평면. (1) 3열 $(p,q,0)$: 단위 + $(1,1,1)$에 직교 → $p+q=0,\\,p^2+q^2=1\\Rightarrow p=\\mp\\tfrac{1}{\\sqrt 2},\\,q=\\pm\\tfrac{1}{\\sqrt 2}$. $p<0$이라 $p=-\\tfrac{1}{\\sqrt 2},\\,q=\\tfrac{1}{\\sqrt 2}$. (2) 1열 $(a,b,c)$: $(1,1,1)$에 직교, 3열에 직교 → $a-b=0$ → $a=b$, $2a+c=0$. 단위 $\\Rightarrow 6a^2=1$. $a<0$이라 $a=b=-\\tfrac{1}{\\sqrt 6},\\,c=\\tfrac{2}{\\sqrt 6}$. 대입: $a+2b+c+p+3q=-\\tfrac{3}{\\sqrt 6}+\\tfrac{2}{\\sqrt 6}+\\tfrac{2}{\\sqrt 2}=-\\tfrac{1}{\\sqrt 6}+\\sqrt 2=-\\dfrac{\\sqrt 6}{6}+\\sqrt 2$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "선적분과 면적분", concept: "Green 정리(특이점)", difficulty: "mediumHard",
    question: "$xy$평면에서 시계 반대 방향으로 도는 원 $C$가 $x^2+y^2=1$일 때, $\\displaystyle\\oint_C \\dfrac{-y}{4x^2+9y^2}\\,dx+\\dfrac{x}{4x^2+9y^2}\\,dy$의 값은?",
    options: [o("1","$0$"), o("2","$\\dfrac{\\pi}{3}$"), o("3","$\\dfrac{\\pi}{2}$"), o("4","$\\pi$")],
    answer: 2,
    explanation: "$P=\\dfrac{-y}{4x^2+9y^2}$, $Q=\\dfrac{x}{4x^2+9y^2}$. 직접 계산하면 $\\dfrac{\\partial Q}{\\partial x}=\\dfrac{\\partial P}{\\partial y}=\\dfrac{-4x^2+9y^2}{(4x^2+9y^2)^2}$ (원점 제외). 따라서 원점만 둘러싸는 임의의 폐곡선에서 적분값이 같다. 계산이 쉬운 타원 $4x^2+9y^2=\\varepsilon^2$로 변형, 매개화 $x=\\tfrac{\\varepsilon}{2}\\cos\\theta,\\,y=\\tfrac{\\varepsilon}{3}\\sin\\theta$. 대입하면 $4x^2+9y^2=\\varepsilon^2$이고 $P\\,dx+Q\\,dy=\\tfrac{1}{6}\\,d\\theta$. $\\oint=\\int_0^{2\\pi}\\tfrac{1}{6}\\,d\\theta=\\dfrac{\\pi}{3}$."
  }),
  build({
    num: 21, subject: "적분학", unit: "정적분의 계산", concept: "치환적분", difficulty: "medium",
    question: "$\\displaystyle\\int_1^e \\dfrac{\\ln x^{\\,2}}{(1+\\ln x)^2}\\,dx$의 값은?",
    options: [o("1","$\\dfrac{e}{2}-1$"), o("2","$\\dfrac{e}{2}-\\dfrac{1}{2}$"), o("3","$e-2$"), o("4","$e-1$")],
    answer: 3,
    explanation: "분자 $\\ln x^2=2\\ln x$. $t=\\ln x$ 치환: $dx=e^t\\,dt$, 구간 $0\\le t\\le 1$. 적분 $=\\int_0^1\\dfrac{2t\\,e^t}{(1+t)^2}\\,dt$. 핵심 관찰: $\\dfrac{d}{dt}\\!\\left[\\dfrac{e^t}{1+t}\\right]=\\dfrac{e^t}{1+t}-\\dfrac{e^t}{(1+t)^2}=\\dfrac{t\\,e^t}{(1+t)^2}$. 따라서 적분 $=2\\left[\\dfrac{e^t}{1+t}\\right]_0^1=2\\left(\\dfrac{e}{2}-1\\right)=e-2$."
  }),
  build({
    num: 22, subject: "적분학", unit: "정적분의 계산", concept: "역삼각함수 적분", difficulty: "medium",
    question: "$\\displaystyle\\int_{-\\sqrt 3}^{-1} 2\\tan^{-1}x\\,dx+\\int_{-\\sqrt 3}^{-1}\\sin^{-1}\\!\\left(\\dfrac{2x}{1+x^2}\\right)dx$의 값은?",
    options: [o("1","$\\pi(1-\\sqrt{3})$"), o("2","$\\pi(\\sqrt{3}-1)$"), o("3","$\\pi(1-\\sqrt{3})+\\ln 4$"), o("4","$\\pi(\\sqrt{3}-1)+\\ln 4$")],
    answer: 1,
    explanation: "$\\tan^{-1}x=\\theta$로 두면 $\\sin 2\\theta=\\dfrac{2\\tan\\theta}{1+\\tan^2\\theta}=\\dfrac{2x}{1+x^2}$. $\\sin^{-1}$의 치역은 $[-\\tfrac{\\pi}{2},\\tfrac{\\pi}{2}]$인 반면, $x<-1$이면 $\\theta\\in(-\\tfrac{\\pi}{2},-\\tfrac{\\pi}{4})$이므로 $2\\theta\\in(-\\pi,-\\tfrac{\\pi}{2})$로 치역 밖. 보정 공식 $\\sin^{-1}(\\sin 2\\theta)=-\\pi-2\\theta$. 즉 $\\sin^{-1}\\!\\dfrac{2x}{1+x^2}=-\\pi-2\\tan^{-1}x$. 두 적분 더하면 $\\int_{-\\sqrt 3}^{-1}[2\\tan^{-1}x+(-\\pi-2\\tan^{-1}x)]dx=-\\pi\\int_{-\\sqrt 3}^{-1}dx=-\\pi(\\sqrt 3-1)=\\pi(1-\\sqrt 3)$."
  }),
  build({
    num: 23, subject: "선형대수", unit: "추가내용", concept: "최소제곱해", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}3&2&-1\\\\1&-4&3\\\\1&10&-7\\end{pmatrix}$, 벡터 $\\mathbf{b}=\\begin{pmatrix}2\\\\-2\\\\1\\end{pmatrix}$에 대하여 $A\\mathbf{x}=\\mathbf{b}$의 최소제곱해를 $\\hat{\\mathbf{x}}$이라 하자. $\\mathbf{b}-A\\hat{\\mathbf{x}}$의 모든 성분의 합은?",
    options: [o("1","$-\\dfrac{2}{3}$"), o("2","$-\\dfrac{5}{3}$"), o("3","$-\\dfrac{5}{6}$"), o("4","$-\\dfrac{7}{6}$")],
    answer: 2,
    explanation: "$A$의 행을 보면 $\\text{row}_1=2\\,\\text{row}_2+\\text{row}_3$이라 $\\det(A)=0$, $\\mathrm{rank}(A)=2$. 잔차 $r=\\mathbf{b}-A\\hat{\\mathbf{x}}$는 열공간에 직교하므로 $r\\in N(A^T)$. $A^T\\mathbf{u}=0$ 풀면 $\\mathbf{u}=(-1,2,1)$. 잔차는 $\\mathbf{b}$를 $N(A^T)$에 정사영한 것: $r=\\dfrac{\\mathbf{b}\\cdot\\mathbf{u}}{|\\mathbf{u}|^2}\\mathbf{u}$. $\\mathbf{b}\\cdot\\mathbf{u}=2(-1)+(-2)(2)+1(1)=-5$, $|\\mathbf{u}|^2=6$. $r=\\tfrac{-5}{6}(-1,2,1)=\\left(\\tfrac{5}{6},-\\tfrac{10}{6},-\\tfrac{5}{6}\\right)$. 성분합 $=\\tfrac{5-10-5}{6}=-\\dfrac{5}{3}$."
  }),
  build({
    num: 24, subject: "적분학", unit: "정적분의 성질", concept: "대칭성 적분", difficulty: "mediumHard",
    question: "다항함수 $f(x)$가 다음 조건을 만족시킬 때, $\\displaystyle\\int_{-\\pi/2}^{\\pi/2}\\dfrac{f(x)\\sin x}{1+e^{-f(x)}}\\,dx$의 값은? (가) 모든 실수 $a$에 대하여 $\\displaystyle\\lim_{x\\to a}\\dfrac{f(x)+f(-x)}{x-a}$의 값이 존재한다. (나) $\\displaystyle\\lim_{x\\to 0}\\dfrac{f(x)}{2x}=-1$. (다) $\\displaystyle\\lim_{x\\to\\infty}\\dfrac{2x^3-16}{f(x)-f(0)}=\\dfrac{1}{2}$.",
    options: [o("1","$3\\pi^2-26$"), o("2","$3\\pi^2-24$"), o("3","$4\\pi^2-26$"), o("4","$4\\pi^2-24$")],
    answer: 1,
    explanation: "**1단계 — $f$ 결정.** (가)에서 $f(x)+f(-x)$가 모든 $a$에서 $(x-a)$로 나누어 떨어져야 하므로 $f(x)+f(-x)\\equiv 0$, 즉 $f$는 홀함수. (나)에서 $f(0)=0$, $f'(0)=-2$. (다)에서 $\\dfrac{2x^3}{f(x)}\\to\\tfrac12$ → 최고차항 $4x^3$. 홀함수+조건 종합: $f(x)=4x^3-2x$.\n\n**2단계 — 대칭 트릭.** $I=\\int_{-\\pi/2}^{\\pi/2}\\dfrac{f(x)\\sin x}{1+e^{-f(x)}}dx$. $x\\to -x$ 치환하고 $f$가 홀함수임을 쓰면 $I=\\int\\dfrac{f(x)\\sin x}{1+e^{f(x)}}dx$. 두 식 더하면 $\\tfrac{1}{1+e^{-f}}+\\tfrac{1}{1+e^{f}}=1$이므로 $2I=\\int_{-\\pi/2}^{\\pi/2}f(x)\\sin x\\,dx$.\n\n**3단계 — 적분 계산.** 피적분함수가 짝함수: $2I=2\\int_0^{\\pi/2}(4x^3-2x)\\sin x\\,dx$. 부분적분으로 $\\int(4x^3-2x)\\sin x\\,dx=-4x^3\\cos x+12x^2\\sin x+26x\\cos x-26\\sin x$. $x=\\tfrac{\\pi}{2}$에서 $3\\pi^2-26$, $x=0$에서 $0$. 따라서 $2I=2(3\\pi^2-26)$, $I=3\\pi^2-26$."
  }),
  build({
    num: 25, subject: "미분학", unit: "극한과 연속", concept: "Taylor 전개", difficulty: "medium",
    question: "$\\displaystyle\\lim_{x\\to 0}\\!\\left(\\csc^2 x-\\dfrac{1}{x^2}\\right)$의 값은?",
    options: [o("1","$0$"), o("2","$\\dfrac{1}{6}$"), o("3","$\\dfrac{1}{4}$"), o("4","$\\dfrac{1}{3}$")],
    answer: 4,
    explanation: "$\\sin x=x-\\tfrac{x^3}{6}+\\cdots$. $\\sin^2 x=x^2-\\tfrac{x^4}{3}+\\cdots$. $\\csc^2 x=\\tfrac{1}{x^2-x^4/3+\\cdots}=\\tfrac{1}{x^2}(1+\\tfrac{x^2}{3}+\\cdots)$. $\\csc^2 x-\\tfrac{1}{x^2}\\to\\dfrac{1}{3}$."
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
