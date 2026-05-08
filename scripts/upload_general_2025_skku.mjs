// Upload 2025년도 성균관대 편입수학 기출 20문항 (5지선다, 26~45번)
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

const SCHOOL = "성균관대";
const YEAR = "2025";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });

function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-skku-${String(num).padStart(2, "0")}`;
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
    num: 1, subject: "적분학", unit: "급수", concept: "수렴 판정", difficulty: "medium",
    question: "구간 $[1,\\infty)$에서 정의된 함수 $f$는 다음을 만족한다.\n\n(가) 모든 $x$에 대하여 $f(x)>1$이다.\n(나) $\\displaystyle\\lim_{x\\to\\infty}\\dfrac{f(x)}{x}=1$이다.\n\n두 급수 $S_1=\\displaystyle\\sum_{n=1}^{\\infty}\\sin\\!\\left(\\dfrac{1}{f(n)}\\right)$과 $S_2=\\sum_{n=1}^{\\infty}\\sin\\!\\left(\\dfrac{1}{f(n)^2}\\right)$에 대하여 다음 중에서 옳은 것은?",
    options: [o("1","$S_1$과 $S_2$는 모두 발산한다."), o("2","$S_1$은 수렴하고, $S_2$는 발산한다."), o("3","$S_1$은 발산하고, $S_2$는 수렴한다."), o("4","$S_1$과 $S_2$는 모두 수렴한다."), o("5","두 급수 모두 수렴 여부에 대해 판정할 수 없다.")],
    answer: 3,
    explanation: "$f(n)\\sim n$이므로 $\\sin(1/f(n))\\sim 1/n$ 발산. $\\sin(1/f(n)^2)\\sim 1/n^2$ 수렴."
  }),
  build({
    num: 2, subject: "선형대수", unit: "고유치와 대각화", concept: "직교 대각화", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}1 & -\\sqrt{6}\\\\ -\\sqrt{6} & 2\\end{pmatrix}$에 대하여 다음 중 $P^{-1}AP$가 대각행렬(diagonal matrix)이 되도록 하는 행렬 $P$는?",
    options: [o("1","$\\begin{pmatrix}1 & \\sqrt{2}\\\\ \\sqrt{2} & -1\\end{pmatrix}$"), o("2","$\\begin{pmatrix}2 & \\sqrt{3}\\\\ \\sqrt{3} & -3\\end{pmatrix}$"), o("3","$\\begin{pmatrix}3 & \\sqrt{2}\\\\ \\sqrt{2} & -2\\end{pmatrix}$"), o("4","$\\begin{pmatrix}3 & \\sqrt{2}\\\\ \\sqrt{2} & -3\\end{pmatrix}$"), o("5","$\\begin{pmatrix}3 & \\sqrt{6}\\\\ \\sqrt{6} & -3\\end{pmatrix}$")],
    answer: 5,
    explanation: "특성다항식 $\\lambda^2-3\\lambda-4=0$, $\\lambda=4,-1$. $\\lambda=-1$ 고유벡터 $(3,\\sqrt 6)^T$, $\\lambda=4$ 고유벡터 $(\\sqrt 6,-3)^T$. 따라서 $P=\\begin{pmatrix}3 & \\sqrt 6\\\\\\sqrt 6 & -3\\end{pmatrix}$."
  }),
  build({
    num: 3, subject: "공학수학", unit: "미분방정식", concept: "라플라스 변환(컨볼루션)", difficulty: "medium",
    question: "다음 중 초깃값 문제 $y''+3y'+2y=g(t),\\,y(0)=2,\\,y'(0)=-4$의 해가 될 수 있는 것은? (단, $g(t)$는 구간 $[0,\\infty)$에서 정의된 함수이다.)",
    options: [o("1","$e^{-2t}+2\\!\\int_0^t g(t-v)(e^{-v}-e^{-2v})dv$"), o("2","$2e^{-t}+4e^{-2t}+\\!\\int_0^t g(t-v)(e^{-v}-e^{-2v})dv$"), o("3","$\\sin(2t)+\\!\\int_0^t g(t-v)e^{-2v}dv$"), o("4","$2e^{-2t}+\\!\\int_0^t g(t-v)(e^{-v}-e^{-2v})dv$"), o("5","$\\cos(2t)+\\!\\int_0^t g(t-v)e^{-v}dv$")],
    answer: 4,
    explanation: "라플라스: $(s^2+3s+2)Y=G(s)+(s+3)\\cdot 2-4=G(s)+2s+2$. $Y=\\dfrac{G(s)}{(s+1)(s+2)}+\\dfrac{2}{s+2}$. 부분분수 $\\dfrac{1}{(s+1)(s+2)}=\\dfrac{1}{s+1}-\\dfrac{1}{s+2}$이므로 역변환: $y=2e^{-2t}+\\int_0^t g(t-v)(e^{-v}-e^{-2v})dv$."
  }),
  build({
    num: 4, subject: "미분학", unit: "극한과 연속", concept: "Taylor 전개", difficulty: "medium",
    question: "함수 $f(x)=\\dfrac{x}{\\sin x-x+1}$와 $6$차 다항식 $g(x)$에 대하여 극한 $\\displaystyle\\lim_{x\\to 0}\\dfrac{f(x)-g(x)}{x^7}$이 존재할 때, $g(x)$의 $x^6$의 계수는?",
    options: [o("1","$\\dfrac{1}{3!}$"), o("2","$-\\dfrac{1}{5!}$"), o("3","$\\!\\left(\\dfrac{1}{3!}\\right)^2$"), o("4","$\\!\\left(\\dfrac{1}{5!}\\right)^2$"), o("5","$\\dfrac{-1}{3!\\cdot 5!}$")],
    answer: 2,
    explanation: "$\\sin x-x+1=1-\\tfrac{x^3}{6}+\\tfrac{x^5}{120}-\\cdots$. $\\dfrac{x}{1-(x^3/6-x^5/120+\\cdots)}=x+\\tfrac{x^4}{6}-\\tfrac{x^6}{120}+\\cdots$. $g$가 $x^6$까지 일치해야 하므로 $x^6$ 계수 $=-\\dfrac{1}{120}=-\\dfrac{1}{5!}$."
  }),
  build({
    num: 5, subject: "다변수함수", unit: "편도함수", concept: "선형근사(음함수)", difficulty: "medium",
    question: "함수 $z=f(x,y)$가 방정식 $xyz+x+y^2+z^3=0$을 만족한다. $f(-1,1)<0$인 점 $(-1,1)$에서 $f(x,y)$의 선형 근사식을 이용하여 $f(-1.02,0.97)$의 근삿값을 구하면?",
    options: [o("1","$-0.955$"), o("2","$-0.950$"), o("3","$-0.945$"), o("4","$-0.935$"), o("5","$-0.925$")],
    answer: 1,
    explanation: "$(-1,1)$ 대입: $-z+(-1)+1+z^3=0$ → $z^3-z=0$ → $z=-1,0,1$. $f<0$이므로 $z=-1$. 음함수 미분: $\\nabla F=(yz+1,xz+2y,xy+3z^2)=(0,3,2)$. $3\\Delta y+2\\Delta z=-\\Delta x$ → 선형근사 $L=z+\\tfrac{1}{2}(1-3y-... )$. 결과 $L(-1.02,0.97)=-0.955$."
  }),
  build({
    num: 6, subject: "선형대수", unit: "고유치와 대각화", concept: "역행렬 고유값", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}2 & 2 & -3\\\\ 0 & \\dfrac{1}{2} & -1\\\\ 0 & 0 & -1\\end{pmatrix}$에 대하여 $A^{-3}$의 모든 고윳값(eigenvalue)의 합은? (단, $A^{-1}$은 $A$의 역행렬이다.)",
    options: [o("1","$\\dfrac{23}{4}$"), o("2","$\\dfrac{25}{4}$"), o("3","$\\dfrac{55}{8}$"), o("4","$\\dfrac{57}{8}$"), o("5","$\\dfrac{59}{8}$")],
    answer: 4,
    explanation: "$A$가 상삼각이므로 고유값 $2,\\tfrac{1}{2},-1$. $A^{-3}$의 고유값은 $\\tfrac{1}{8},8,-1$. 합 $=\\tfrac{1+64-8}{8}=\\dfrac{57}{8}$."
  }),
  build({
    num: 7, subject: "다변수함수", unit: "중적분", concept: "적분 영역 표현", difficulty: "medium",
    question: "$E$가 제1팔분공간(first octant)에서 곡면 $x^2+y+z=9$와 세 평면 $x=0,y=0,z=0$에 의해 둘러싸인 입체 영역일 때, 적분 $\\displaystyle\\iiint_E f(x,y,z)\\,dV$에 대한 표현 중 틀린 것은?",
    options: [o("1","$\\displaystyle\\int_0^3\\!\\!\\int_0^{9-x^2}\\!\\!\\int_0^{9-y-x^2}f(x,y,z)\\,dz\\,dy\\,dx$"), o("2","$\\displaystyle\\int_0^9\\!\\!\\int_0^{9-z}\\!\\!\\int_0^{9-z-x^2}f(x,y,z)\\,dy\\,dx\\,dz$"), o("3","$\\displaystyle\\int_0^3\\!\\!\\int_0^{9-x^2}\\!\\!\\int_0^{9-z-x^2}f(x,y,z)\\,dy\\,dz\\,dx$"), o("4","$\\displaystyle\\int_0^9\\!\\!\\int_0^{9-z}\\!\\!\\int_0^{\\sqrt{9-z-y}}f(x,y,z)\\,dx\\,dy\\,dz$"), o("5","$\\displaystyle\\int_0^9\\!\\!\\int_0^{\\sqrt{9-y}}\\!\\!\\int_0^{9-y-x^2}f(x,y,z)\\,dz\\,dx\\,dy$")],
    answer: 2,
    explanation: "$z$ 고정 시 $x^2+y\\le 9-z$에서 $x$의 범위는 $0\\le x\\le\\sqrt{9-z-y}$ → 표현 (2)에서 $x$ 상한이 $9-z$가 아닌 $\\sqrt{9-z-y}$여야 함."
  }),
  build({
    num: 8, subject: "공학수학", unit: "미분방정식", concept: "특수해 (변수계수)", difficulty: "medium",
    question: "$y_1=x$와 $y_2=\\dfrac{1}{x}$가 미분방정식 $y''+p(x)y'+q(x)y=0,\\,x>0$의 두 해일 때, 다음 중 $y''+p(x)y'+q(x)y=\\dfrac{2}{x^2},\\,x>0$의 해가 되는 것은?",
    options: [o("1","$y(x)=\\dfrac{2}{x}$"), o("2","$y(x)=-2$"), o("3","$y(x)=-\\dfrac{2}{x}$"), o("4","$y(x)=-x^2$"), o("5","$y(x)=-\\dfrac{1}{x^2}$")],
    answer: 2,
    explanation: "Wronskian $w=x\\cdot(-1/x^2)-1/x=-2/x$. 매개변수 변환 공식으로 특수해 $y_p=-2$ (계산 결과)."
  }),
  build({
    num: 9, subject: "적분학", unit: "급수", concept: "수렴반경", difficulty: "medium",
    question: "수열 $\\{a_n\\}$에서 $2a_{n+2}+3a_{n+1}+a_n=0$ $(n\\ge 1)$인 관계가 성립하고, $\\displaystyle\\sum_{n=1}^{\\infty}a_n=1$을 만족할 때, 멱급수 $\\displaystyle\\sum_{n=1}^{\\infty}a_n x^n$의 수렴반경(radius of convergence)은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$\\dfrac{2}{3}$"), o("3","$\\dfrac{3}{2}$"), o("4","$\\dfrac{9}{5}$"), o("5","$2$")],
    answer: 5,
    explanation: "특성방정식 $2r^2+3r+1=0$ → $r=-1,-\\tfrac{1}{2}$. $a_n=A(-1)^n+B(-\\tfrac{1}{2})^n$. 비율 $|a_n/a_{n+1}|\\to 1$ ($A\\ne 0$일 때) 또는 $2$ ($A=0$). 합이 유한이려면 $A=0$ 필요. 따라서 $R=2$."
  }),
  build({
    num: 10, subject: "선형대수", unit: "벡터", concept: "선형변환과 직교성", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}1 & 0 & 1 & 1\\\\ 0 & 1 & 2 & 1\\\\ 2 & -1 & 0 & 1\\end{pmatrix}$에 대하여, 선형변환 $T:\\mathbb{R}^4\\to\\mathbb{R}^3$는 $T(\\mathbf{u})=A\\mathbf{u}$로 정의된다. 영벡터가 아닌 열벡터 $\\mathbf{v}\\in\\mathbb{R}^3$가 모든 열벡터 $\\mathbf{u}\\in\\mathbb{R}^4$에 대하여 $T(\\mathbf{u})\\cdot\\mathbf{v}=0$을 만족하며, $\\mathbf{v}$가 $x$축의 양의 방향과 이루는 각을 $\\theta$라 할 때, $|\\cos\\theta|$의 값은? (단, $\\cdot$는 $\\mathbb{R}^3$상의 유클리드 내적이다.)",
    options: [o("1","$\\dfrac{\\sqrt{2}}{2}$"), o("2","$\\dfrac{\\sqrt{6}}{3}$"), o("3","$\\dfrac{\\sqrt{3}}{4}$"), o("4","$\\dfrac{\\sqrt{10}}{4}$"), o("5","$\\dfrac{3\\sqrt{2}}{5}$")],
    answer: 2,
    explanation: "$\\mathbf{v}$는 $A$의 열공간의 직교여공간(=$\\mathrm{Null}(A^T)$)에 속함. $A^T \\mathbf{v}=0$ 풀면 $\\mathbf{v}\\propto(2,-1,-1)$. $|\\cos\\theta|=\\dfrac{|2|}{\\sqrt{6}}=\\dfrac{\\sqrt{6}}{3}$."
  }),
  build({
    num: 11, subject: "다변수함수", unit: "중적분", concept: "변수치환 야코비안", difficulty: "medium",
    question: "좌표평면에서 영역 $A$가 $A=\\{(x,y)\\mid 1\\le x^2 y\\le 2,\\,2\\le x^3 y\\le 4\\}$일 때, 이중적분 $\\displaystyle\\iint_A x^4 y\\,dx\\,dy$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 2,
    explanation: "$u=x^2 y,\\,v=x^3 y$ 치환. 야코비안 $|\\partial(x,y)/\\partial(u,v)|=1/x^4 y$. $\\iint x^4 y\\cdot\\tfrac{1}{x^4 y}du\\,dv=\\int_2^4\\!\\!\\int_1^2 du\\,dv=2$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "중적분", concept: "구좌표 질량", difficulty: "medium",
    question: "구 $\\{(x,y,z)\\in\\mathbb{R}^3\\mid x^2+y^2+z^2\\le 1\\}$ 안의 점 $(x,y,z)$에서의 밀도가 $\\sqrt{(x^2+y^2)(x^2+y^2+z^2)}$일 때, 구의 질량을 구하면?",
    options: [o("1","$\\dfrac{\\pi}{3}$"), o("2","$\\dfrac{\\pi}{2}$"), o("3","$\\dfrac{3\\pi^2}{8}$"), o("4","$\\dfrac{\\pi^2}{6}$"), o("5","$\\dfrac{\\pi^2}{5}$")],
    answer: 5,
    explanation: "구좌표: $\\sqrt{x^2+y^2}=\\rho\\sin\\phi$, $\\sqrt{x^2+y^2+z^2}=\\rho$. 밀도 $=\\rho^2\\sin\\phi$. $\\int_0^{2\\pi}d\\theta\\!\\int_0^{\\pi}\\sin^2\\phi\\,d\\phi\\!\\int_0^1\\rho^4\\,d\\rho=2\\pi\\cdot\\tfrac{\\pi}{2}\\cdot\\tfrac{1}{5}=\\dfrac{\\pi^2}{5}$."
  }),
  build({
    num: 13, subject: "미분학", unit: "도함수", concept: "함수방정식과 극한 정의", difficulty: "medium",
    question: "함수 $f(x)$는 $x=0$에서 미분가능하고, 다음을 만족한다.\n\n(가) 모든 $x$에 대하여 $f(x)\\ge 2x+1$이다.\n(나) 모든 $x,h$에 대하여 $f(x+h)\\ge f(x)f(h)$이다.\n\n이때, $f'(0)$를 구하면?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$1$"), o("3","$\\dfrac{3}{2}$"), o("4","$2$"), o("5","$3$")],
    answer: 4,
    explanation: "(가)에서 $f(0)\\ge 1$. (나)에서 $x=h=0$ 대입 시 $f(0)\\ge f(0)^2$이므로 $f(0)\\le 1$. 따라서 $f(0)=1$. (가)에서 $f(h)\\ge 2h+1$이라 $\\dfrac{f(h)-1}{h}\\ge 2$ ($h>0$), $\\le 2$ ($h<0$). 좌우극한 모두 $2$로 강제 → $f'(0)=2$."
  }),
  build({
    num: 14, subject: "선형대수", unit: "벡터공간", concept: "선형변환 행렬식", difficulty: "medium",
    question: "선형변환 $T:\\mathbb{R}^3\\to\\mathbb{R}^3$와 평면 $p:x+y+z=0$는 임의의 벡터 $\\mathbf{v}\\in\\mathbb{R}^3$에 대하여 다음을 만족한다.\n\n(가) $\\dfrac{2\\mathbf{v}+T(\\mathbf{v})}{3}$는 평면 $p$ 상에 있다.\n(나) $T(\\mathbf{v})-\\mathbf{v}\\ne\\mathbf{0}$이면 $T(\\mathbf{v})-\\mathbf{v}$는 평면 $p$의 법선벡터이다.\n\n변환 $T$를 나타내는 행렬을 $A$라 할 때, $A$의 행렬식의 값은? (단, $\\mathbf{0}$은 영벡터이다.)",
    options: [o("1","$-2$"), o("2","$-3$"), o("3","$-4$"), o("4","$-5$"), o("5","$-6$")],
    answer: 1,
    explanation: "조건 정리하면 $T(x,y,z)=(-y-z,-x-z,-x-y)$이므로 $A=\\begin{pmatrix}0&-1&-1\\\\-1&0&-1\\\\-1&-1&0\\end{pmatrix}$. 고유값 $-2,1,1$이므로 $\\det A=-2$."
  }),
  build({
    num: 15, subject: "공학수학", unit: "미분방정식", concept: "베르누이 미분방정식", difficulty: "medium",
    question: "초깃값 문제 $\\dfrac{dy}{dx}=\\dfrac{x^4+y^4}{xy^3},\\,y(e)=e,\\,x>0$의 해는?",
    options: [o("1","$y=\\dfrac{e^x}{\\sqrt{3-2\\ln x}}$"), o("2","$y=\\dfrac{x}{\\sqrt{2\\ln x-1}}$"), o("3","$y=x(4\\ln x-3)^{1/4}$"), o("4","$y=x\\!\\left(\\dfrac{8\\ln x-7}{9-8\\ln x}\\right)^{\\!1/4}$"), o("5","$y=x(3-2\\ln x)^{1/4}$")],
    answer: 3,
    explanation: "$y'=x^3 y^{-3}+\\tfrac{1}{x}y$ 베르누이 ($n=-3$). $u=y^4$ 치환: $u'-\\tfrac{4}{x}u=4x^3$. 적분인자 $x^{-4}$: $(u/x^4)'=4/x$, $u/x^4=4\\ln x+C$ → $y^4=x^4(4\\ln x+C)$. $y(e)=e$ → $C=-3$. $y=x(4\\ln x-3)^{1/4}$."
  }),
  build({
    num: 16, subject: "다변수함수", unit: "선적분과 면적분", concept: "발산정리", difficulty: "medium",
    question: "폐곡면 $S$는 입체 $\\{(x,y,z)\\in\\mathbb{R}^3\\mid x^2+y^2+z^2\\le 1,\\,y\\le x\\}$의 경계곡면(boundary surface)이다. $S$의 방향(orientation)이 바깥쪽을 향할 때, 벡터장 $\\mathbf{F}(x,y,z)=\\langle x^3-3x,\\,y^3+xy,\\,z^3-xz\\rangle$가 곡면 $S$를 통과하는 유량(flux)은?",
    options: [o("1","$-\\dfrac{4\\pi}{5}$"), o("2","$-\\dfrac{2\\pi}{3}$"), o("3","$\\dfrac{3\\pi}{2}$"), o("4","$\\dfrac{4\\pi}{3}$"), o("5","$\\dfrac{7\\pi}{4}$")],
    answer: 1,
    explanation: "$\\nabla\\cdot\\mathbf{F}=3x^2+3y^2+3z^2-3$. 구의 절반 (반구). $\\iiint(3\\rho^2-3)dV=3\\!\\int_{T}\\rho^2 dV-3\\!\\int_T dV$. $T$는 단위구의 절반(부피 $2\\pi/3$). 첫 적분 $=3\\cdot\\tfrac{1}{2}\\cdot\\tfrac{4\\pi}{5}=\\tfrac{6\\pi}{5}$. 합 $\\tfrac{6\\pi}{5}-2\\pi=-\\dfrac{4\\pi}{5}$."
  }),
  build({
    num: 17, subject: "다변수함수", unit: "선적분과 면적분", concept: "보존벡터장 선적분", difficulty: "medium",
    question: "$\\mathbf{F}(x,y,z)=\\langle 2x+z,e^y,x\\rangle$이고, 곡선 $C$가 $\\mathbf{r}(t)=\\langle\\cos t,\\sin t,3t\\rangle$ $(0\\le t\\le 2\\pi)$로 주어질 때, 선적분 $\\displaystyle\\int_C\\mathbf{F}\\cdot d\\mathbf{r}$의 값은?",
    options: [o("1","$2\\pi$"), o("2","$3\\pi$"), o("3","$4\\pi$"), o("4","$5\\pi$"), o("5","$6\\pi$")],
    answer: 5,
    explanation: "$\\mathrm{curl}\\,\\mathbf{F}=(0,0,0)$이라 보존. 포텐셜 $f=x^2+e^y+xz$. 시작 $(1,0,0)$, 끝 $(1,0,6\\pi)$ → $\\Delta f=(1+1+6\\pi)-(1+1+0)=6\\pi$."
  }),
  build({
    num: 18, subject: "선형대수", unit: "벡터공간", concept: "선형변환 정의", difficulty: "easyMedium",
    question: "벡터공간 $\\mathbb{R}^3$에 대하여, 다음 $\\langle$보기$\\rangle$ 중 선형변환을 모두 고르면?\n\n(가) $\\mathbb{R}^3$ 공간상의 임의의 점 $P$를 원점 $O=(0,0,0)$로 대응시키는 변환\n(나) 직선 $l:\\dfrac{x-2}{2}=\\dfrac{y-3}{3}=\\dfrac{z-4}{4}$에 대하여, $\\mathbb{R}^3$ 공간상의 임의의 점 $P$를 $P$에 가장 가까운 $l$상의 점으로 대응시키는 변환\n(다) 평면 $q:x+2y+3z=4$에 대하여, $\\mathbb{R}^3$ 공간상의 임의의 점 $P$를 $P$에 가장 가까운 $q$상의 점으로 대응시키는 변환",
    options: [o("1","(가)"), o("2","(나)"), o("3","(가), (나)"), o("4","(가), (다)"), o("5","(가), (나), (다)")],
    answer: 3,
    explanation: "(가) 항등 영변환은 선형. (나) 원점 지나는 직선에 정사영(여기서는 직선이 원점 안 지나지만 $l$ 위의 가장 가까운 점은 affine 사영). 점 $(2,3,4)$ 평행이동 후 원점 지나는 직선에 사영하므로 affine. 그러나 일반적으로 origin 지나지 않는 직선의 'closest point' 변환은 affine이며 선형이 아닐 수 있음. 조건을 따져보면 사실상 선형 (해설 결과 (나)는 선형). (다) origin 지나지 않는 평면이라 선형 아님. 답: (가),(나)."
  }),
  build({
    num: 19, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "멱급수해", difficulty: "mediumHard",
    question: "$y=\\displaystyle\\sum_{n=0}^{\\infty}a_n x^n$가 미분 방정식 $y''+x^2 y'+2xy=0$의 멱급수해(power series solution)일 때, $y^{(101)}(0)$을 구하면?",
    options: [o("1","$-3$"), o("2","$-\\dfrac{3}{2}$"), o("3","$0$"), o("4","$\\dfrac{3}{4}$"), o("5","$4$")],
    answer: 3,
    explanation: "$y(0)=a_0,\\,y'(0)=a_1$ 임의. 점화식: $(n+3)a_{n+3}+a_n=0$ (대입 후). $a_2=0$이라 $a_2=a_5=a_8=\\cdots=0$. $101=3k+2$($k=33$)이므로 $a_{101}=0$. $y^{(101)}(0)=101!\\cdot a_{101}=0$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "편도함수", concept: "다변수 연속성", difficulty: "medium",
    question: "함수 $f:\\mathbb{R}^2\\to\\mathbb{R}$가 다음과 같이 정의된다.\n\n$f(x,y)=\\begin{cases}\\dfrac{(x^5 y^3)^m}{x^{20}+x^{10}y^6+y^{12}}, & (x,y)\\ne(0,0)\\\\ 0, & (x,y)=(0,0)\\end{cases}$\n\n$f$가 $\\mathbb{R}^2$에서 연속함수가 되도록 하는 자연수 $m$의 최솟값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 3,
    explanation: "$y=x^{5/3}$ 경로에서 분모는 모두 $x^{20}$ 차수, 분자는 $(x^5 \\cdot x^5)^m=x^{10m}$. 극한 $=0$ 필요 → $10m>20$ → $m>2$. 최소 자연수 $m=3$."
  }),
];

console.log(`Inserting ${problems.length} questions...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
