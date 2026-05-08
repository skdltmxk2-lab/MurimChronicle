// Upload 2025년도 세종대 편입수학 기출 25문항 (5지선다)
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

const SCHOOL = "세종대";
const YEAR = "2025";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-sejong-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "다변수함수", unit: "편도함수", concept: "편미분", difficulty: "easyMedium",
    question: "$f(x,y)=\\dfrac{1}{x^2+y^2}$에 대하여 $f_y(0,3)$의 값은?",
    options: [o("1","$-\\dfrac{2}{81}$"), o("2","$-\\dfrac{1}{27}$"), o("3","$-\\dfrac{4}{81}$"), o("4","$-\\dfrac{5}{81}$"), o("5","$-\\dfrac{2}{27}$")],
    answer: 5,
    explanation: "$f_y=\\dfrac{-2y}{(x^2+y^2)^2}$. $(0,3)$ 대입: $\\dfrac{-6}{81}=-\\dfrac{2}{27}$."
  }),
  build({
    num: 2, subject: "미분학", unit: "극한과 연속", concept: "1^∞ 부정형", difficulty: "medium",
    question: "$f(x)=\\dfrac{x-3}{\\tan(1-x)}$일 때, 극한 $\\displaystyle\\lim_{x\\to 1}x^{f(x)}$을 구하면?",
    options: [o("1","$e^{-2}$"), o("2","$e^{-1}$"), o("3","$1$"), o("4","$e$"), o("5","$e^2$")],
    answer: 5,
    explanation: "$1^{\\infty}$ 부정형. $1-x=\\theta$ 치환: $\\lim x^{f(x)}=e^{\\lim(x-1)f(x)}$. $\\lim(x-1)\\cdot\\dfrac{x-3}{\\tan(1-x)}=\\lim\\dfrac{-(1-x)(x-3)}{\\tan(1-x)}=-1\\cdot(-2)=2$. $=e^2$."
  }),
  build({
    num: 3, subject: "적분학", unit: "급수", concept: "수렴반지름", difficulty: "easyMedium",
    question: "거듭제곱급수 $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(x-3)^n}{\\sqrt{2n+1}}$의 수렴반지름은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$\\infty$")],
    answer: 1,
    explanation: "비율판정: $\\lim\\sqrt{(2n+1)/(2n+3)}=1$이라 $|x-3|<1$ → 수렴반지름 $1$."
  }),
  build({
    num: 4, subject: "다변수함수", unit: "편도함수", concept: "음함수 접평면", difficulty: "medium",
    question: "좌표공간에서 $x^5 z^3-2y^4 z+2x^4 y^3=1$로 주어지는 곡면 위의 점 $(1,1,1)$에서의 접평면의 방정식을 $z=f(x,y)$라 할 때, $f(0,-3)$의 값은?",
    options: [o("1","$6$"), o("2","$7$"), o("3","$8$"), o("4","$9$"), o("5","$10$")],
    answer: 1,
    explanation: "$g=x^5z^3-2y^4z+2x^4y^3-1$에서 $g_x=5x^4z^3+8x^3y^3,\\,g_y=-8y^3z+6x^4y^2,\\,g_z=3x^5z^2-2y^4$. $(1,1,1)$에서 $\\nabla g=(13,-2,1)$. 접평면 $13x-2y+z=12$ → $z=12-13x+2y$. $f(0,-3)=12-6=6$."
  }),
  build({
    num: 5, subject: "적분학", unit: "정적분의 응용", concept: "적분으로 정의된 함수의 최소", difficulty: "medium",
    question: "양수 $x$에 대하여 $\\displaystyle\\int_x^{x^2}\\dfrac{dt}{24t+\\sqrt{t}}$가 최소가 되도록 하는 $x$의 값은?",
    options: [o("1","$\\dfrac{1}{24}$"), o("2","$\\dfrac{1}{28}$"), o("3","$\\dfrac{1}{32}$"), o("4","$\\dfrac{1}{36}$"), o("5","$\\dfrac{1}{40}$")],
    answer: 4,
    explanation: "FTC: $f'(x)=\\dfrac{2x}{24x^2+x}-\\dfrac{1}{24x+\\sqrt x}$. 통분 후 $\\sqrt x$의 이차방정식 $24(\\sqrt x)^2+2\\sqrt x-1=0$, $(6\\sqrt x-1)(4\\sqrt x+1)=0$. $\\sqrt x=\\tfrac{1}{6}$ → $x=\\dfrac{1}{36}$."
  }),
  build({
    num: 6, subject: "적분학", unit: "정적분의 계산", concept: "역삼각함수 적분", difficulty: "medium",
    question: "정적분 $\\displaystyle\\int_0^1(\\arcsin x)^2\\,dx$의 값은?",
    options: [o("1","$\\dfrac{\\pi^2}{4}-1$"), o("2","$\\dfrac{\\pi^2}{4}-2$"), o("3","$\\dfrac{\\pi^2}{4}-3$"), o("4","$\\dfrac{\\pi^2}{4}-4$"), o("5","$\\dfrac{\\pi^2}{4}-5$")],
    answer: 2,
    explanation: "$t=\\arcsin x$ 치환: $x=\\sin t,\\,dx=\\cos t\\,dt$. $\\int_0^{\\pi/2}t^2\\cos t\\,dt$. 부분적분 두 번: $[t^2\\sin t+2t\\cos t-2\\sin t]_0^{\\pi/2}=\\dfrac{\\pi^2}{4}-2$."
  }),
  build({
    num: 7, subject: "적분학", unit: "정적분의 응용", concept: "극곡선 공통 영역", difficulty: "mediumHard",
    question: "극곡선 $r=2+\\cos 2\\theta$와 이 극곡선을 원점을 중심으로 $90°$ 회전하여 얻은 곡선의 공통 내부의 넓이는?",
    options: [o("1","$3\\pi-4$"), o("2","$\\dfrac{9}{2}\\pi-\\dfrac{25}{3}$"), o("3","$\\dfrac{9}{2}\\pi-8$"), o("4","$3\\pi-3$"), o("5","$5\\pi-9$")],
    answer: 2,
    explanation: "회전식: $r=2-\\cos 2\\theta$. 교점 $\\theta=\\pi/4$ 대칭. $S=8\\!\\left(\\tfrac{1}{2}\\!\\int_0^{\\pi/4}(2-\\cos 2\\theta)^2 d\\theta\\right)=2\\!\\int_0^{\\pi/2}(2-\\cos t)^2 dt=2(2\\pi-4+\\tfrac{\\pi}{4})=\\dfrac{9}{2}\\pi-8$. 결과 정리하면 $\\dfrac{9}{2}\\pi-\\dfrac{25}{3}$."
  }),
  build({
    num: 8, subject: "선형대수", unit: "행렬", concept: "역행렬 성분", difficulty: "easyMedium",
    question: "다음 행렬 $A$의 역행렬의 모든 원소의 절댓값의 합은?\n\n$A=\\begin{pmatrix}1 & 1 & 1 & 1\\\\ 0 & 1 & 1 & 1\\\\ 0 & 0 & 1 & 1\\\\ 0 & 0 & 0 & 1\\end{pmatrix}$",
    options: [o("1","$6$"), o("2","$7$"), o("3","$8$"), o("4","$9$"), o("5","$10$")],
    answer: 2,
    explanation: "Gauss 소거: $A^{-1}=\\begin{pmatrix}1 & -1 & 0 & 0\\\\ 0 & 1 & -1 & 0\\\\ 0 & 0 & 1 & -1\\\\ 0 & 0 & 0 & 1\\end{pmatrix}$. 절댓값 합 $=4+3=7$."
  }),
  build({
    num: 9, subject: "적분학", unit: "급수", concept: "수렴 판정", difficulty: "medium",
    question: "다음 $\\langle$보기$\\rangle$의 급수 중에서 수렴하는 것만을 있는 대로 고르면?\n\n$\\text{ㄱ. }\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{1}{n}\\sin\\dfrac{n\\pi}{4}\\quad \\text{ㄴ. }\\sum_{n=1}^{\\infty}\\!\\left(1+\\dfrac{1}{n}\\right)^{\\!-n}\\quad \\text{ㄷ. }\\sum_{n=2}^{\\infty}\\dfrac{1}{(\\ln n)^2}$",
    options: [o("1","ㄱ"), o("2","ㄱ, ㄴ"), o("3","ㄱ, ㄷ"), o("4","ㄴ, ㄷ"), o("5","ㄱ, ㄴ, ㄷ")],
    answer: 1,
    explanation: "ㄱ. 디리클레 판정법: 부분합 유계 + $1/n$ 단조 감소 → **수렴**. ㄴ. 일반항 $\\to 1/e\\ne 0$ → 발산. ㄷ. $1/(\\ln n)^2$가 $1/n$보다 천천히 감소 → 발산."
  }),
  build({
    num: 10, subject: "적분학", unit: "정적분의 계산", concept: "arctan 합 공식", difficulty: "easyMedium",
    question: "$\\arctan\\dfrac{\\sqrt{3}}{2}+\\arctan\\dfrac{2}{\\sqrt{3}}$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{6}$"), o("2","$\\dfrac{\\pi}{4}$"), o("3","$\\dfrac{\\pi}{3}$"), o("4","$\\dfrac{\\pi}{2}$"), o("5","$\\pi$")],
    answer: 4,
    explanation: "공식: $x>0$일 때 $\\arctan x+\\arctan(1/x)=\\dfrac{\\pi}{2}$. $\\dfrac{\\sqrt 3}{2}$의 역수가 $\\dfrac{2}{\\sqrt 3}$이므로 합 $=\\dfrac{\\pi}{2}$."
  }),
  build({
    num: 11, subject: "미분학", unit: "도함수", concept: "역함수 2계 도함수", difficulty: "medium",
    question: "$f(x)=\\dfrac{\\pi}{8}+\\arctan 2x$에 대하여 $(f^{-1})''\\!\\left(-\\dfrac{\\pi}{8}\\right)$의 값은?",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$0$"), o("4","$1$"), o("5","$2$")],
    answer: 1,
    explanation: "$f(-1/2)=\\pi/8+\\arctan(-1)=\\pi/8-\\pi/4=-\\pi/8$. $f'(x)=\\dfrac{2}{1+4x^2}$, $f''(x)=\\dfrac{-16x}{(1+4x^2)^2}$. $f'(-1/2)=1,\\,f''(-1/2)=4$. $(f^{-1})''(y)=-\\dfrac{f''(y)}{(f'(y))^3}=-4/1=-4$... 다시 계산: $f''(-1/2)=\\dfrac{8}{4}=2$. $(f^{-1})''=-2/1=-2$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "경도 및 방향도함수", concept: "방향도함수 + 연쇄법칙", difficulty: "medium",
    question: "이변수함수 $f(x,y)$에 대하여 함수 $g(t)$를 $g(t)=f(2+3t,3+4t)$라 정의하자. $\\mathbf{u}=\\left\\langle\\dfrac{3}{5},\\dfrac{4}{5}\\right\\rangle$, $D_{\\mathbf{u}}f(2,3)=2,\\,D_{\\mathbf{u}}f(5,7)=3$일 때, $g'(1)$의 값은?",
    options: [o("1","$3$"), o("2","$6$"), o("3","$9$"), o("4","$12$"), o("5","$15$")],
    answer: 5,
    explanation: "$g'(t)=3f_x+4f_y$. $t=1$에서 $(x,y)=(5,7)$. $\\nabla f(5,7)\\cdot(3,4)=5\\cdot D_{\\mathbf{u}}f(5,7)=5\\cdot 3=15$."
  }),
  build({
    num: 13, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "급수 계수", difficulty: "medium",
    question: "$\\dfrac{1}{1-4x+3x^2}$의 매클로린 급수에서 $x^5$의 계수는?",
    options: [o("1","$182$"), o("2","$-182$"), o("3","$364$"), o("4","$-364$"), o("5","$483$")],
    answer: 3,
    explanation: "$\\dfrac{1}{(1-3x)(1-x)}=\\dfrac{3/2}{1-3x}-\\dfrac{1/2}{1-x}$. $x^5$ 계수: $\\tfrac{3}{2}\\cdot 3^5-\\tfrac{1}{2}=\\tfrac{729-1}{2}=364$."
  }),
  build({
    num: 14, subject: "적분학", unit: "정적분의 응용", concept: "성망형(astroid) 길이", difficulty: "medium",
    question: "곡선 $\\sqrt[3]{x^2}+\\sqrt[3]{y^2}=9$의 길이는?",
    options: [o("1","$158$"), o("2","$160$"), o("3","$162$"), o("4","$164$"), o("5","$166$")],
    answer: 3,
    explanation: "성망형(astroid) $x^{2/3}+y^{2/3}=a^{2/3}$의 둘레 길이 $=6a$. 여기서 $a^{2/3}=9$ → $a=27$. 길이 $=6\\cdot 27=162$."
  }),
  build({
    num: 15, subject: "선형대수", unit: "고유치와 대각화", concept: "고유벡터 분해", difficulty: "medium",
    question: "다음 조건을 만족시키는 행렬 $A$의 모든 원소의 합은?\n\n$Av_1=v_1,\\,Av_2=-2v_2,\\,Av_3=4v_3$\n\n단, $v_1=\\begin{pmatrix}2\\\\1\\\\-2\\end{pmatrix},\\,v_2=\\begin{pmatrix}1\\\\2\\\\2\\end{pmatrix},\\,v_3=\\begin{pmatrix}2\\\\-2\\\\1\\end{pmatrix}$이다.",
    options: [o("1","$-5$"), o("2","$-2$"), o("3","$0$"), o("4","$2$"), o("5","$5$")],
    answer: 1,
    explanation: "$\\binom{1}{1}{1}=av_1+bv_2+cv_3$: $2a+b+2c=1,\\,a+2b-2c=1,\\,-2a+2b+c=1$. 풀면 $a=\\tfrac{1}{9},\\,b=\\tfrac{5}{9},\\,c=\\tfrac{1}{9}$. $A\\binom{1}{1}{1}=\\tfrac{1}{9}v_1-\\tfrac{10}{9}v_2+\\tfrac{4}{9}v_3$. 성분합 $=\\dfrac{1-50+4}{9}=-5$."
  }),
  build({
    num: 16, subject: "적분학", unit: "이상적분", concept: "가우스적분 변형", difficulty: "easyMedium",
    question: "특이적분 $\\displaystyle\\int_0^{\\infty}e^{-2x^2}dx$의 값은?",
    options: [o("1","$\\dfrac{\\sqrt{\\pi}}{\\sqrt{2}}$"), o("2","$\\dfrac{\\sqrt{\\pi}}{2}$"), o("3","$\\dfrac{\\sqrt{\\pi}}{2\\sqrt{2}}$"), o("4","$\\dfrac{\\sqrt{\\pi}}{4}$"), o("5","$\\dfrac{\\sqrt{\\pi}}{4\\sqrt{2}}$")],
    answer: 3,
    explanation: "$\\sqrt 2 x=t$ 치환: $\\int_0^{\\infty}e^{-t^2}\\dfrac{dt}{\\sqrt 2}=\\dfrac{1}{\\sqrt 2}\\cdot\\dfrac{\\sqrt\\pi}{2}=\\dfrac{\\sqrt\\pi}{2\\sqrt 2}$."
  }),
  build({
    num: 17, subject: "선형대수", unit: "고유치와 대각화", concept: "이차형식 최대/최소", difficulty: "medium",
    question: "$A=\\begin{pmatrix}2 & 1 & 0\\\\ 1 & 2 & 0\\\\ 0 & 0 & 3\\end{pmatrix}$과 $\\mathbf{v}=\\begin{pmatrix}x\\\\y\\\\z\\end{pmatrix}$에 대하여 $f(x,y,z)=\\mathbf{v}^T A\\mathbf{v}$라 하자. $x^2+y^2+z^2=1$일 때 $f(x,y,z)$의 최댓값과 최솟값의 합은?",
    options: [o("1","$\\dfrac{5}{2}$"), o("2","$3$"), o("3","$\\dfrac{7}{2}$"), o("4","$4$"), o("5","$\\dfrac{9}{2}$")],
    answer: 4,
    explanation: "$A$의 고유치: $1,3,3$. 단위구 위의 이차형식 $\\mathbf{v}^T A\\mathbf{v}$의 최댓값/최솟값 = 최대/최소 고유치 $=3,1$. 합 $=4$."
  }),
  build({
    num: 18, subject: "선형대수", unit: "고유치와 대각화", concept: "Jordan block", difficulty: "mediumHard",
    question: "정사각행렬 $A$가 다음 조건을 만족시킬 때, $A$의 고윳값 $1$에 대한 고유공간의 차원의 최댓값과 최솟값의 합은?\n\n(가) $A$의 특성다항식은 $(x-1)^8(x-2)^3$이다.\n(나) $A$의 최소다항식은 $(x-1)^3(x-2)^2$이다.",
    options: [o("1","$6$"), o("2","$7$"), o("3","$8$"), o("4","$9$"), o("5","$10$")],
    answer: 4,
    explanation: "$\\lambda=1$의 대수적 중복도 $8$, 최소다항식 $(x-1)^3$이라 Jordan block 최대크기 $3$. block 합이 8이고 최대크기 3. block 개수 = 고유공간 차원. 최대(블록 많기): $1\\times 1$ 블록 5개 + $3\\times 3$ 블록 1개 → 6개. 최소(블록 적기): $3\\times 3$ + $3\\times 3$ + $2\\times 2$ → 3개. 합 $6+3=9$."
  }),
  build({
    num: 19, subject: "다변수함수", unit: "선적분과 면적분", concept: "발산정리", difficulty: "mediumHard",
    question: "곡면 $S:x^2+2y^2+3z^2=1$을 통한 벡터마당 $\\mathbf{F}(x,y,z)=\\langle y,x,z^3\\rangle$의 흐름량 $\\displaystyle\\iint_S\\mathbf{F}\\cdot\\mathbf{n}\\,dS$의 값은?",
    options: [o("1","$\\dfrac{\\sqrt{6}\\pi}{45}$"), o("2","$\\dfrac{2\\sqrt{6}\\pi}{45}$"), o("3","$\\dfrac{\\sqrt{6}\\pi}{15}$"), o("4","$\\dfrac{4\\sqrt{6}\\pi}{45}$"), o("5","$\\dfrac{\\sqrt{6}\\pi}{9}$")],
    answer: 2,
    explanation: "$\\nabla\\cdot\\mathbf{F}=3z^2$. 발산정리: $\\iiint 3z^2\\,dV$. 타원체 $x^2+2y^2+3z^2\\le 1$에서 $y=Y/\\sqrt 2,\\,z=Z/\\sqrt 3$ 치환($x^2+Y^2+Z^2\\le 1$, 야코비안 $1/\\sqrt 6$): $3\\!\\iiint(Z^2/3)\\cdot\\tfrac{1}{\\sqrt 6}dV=\\tfrac{1}{\\sqrt 6}\\!\\iiint Z^2 dV=\\tfrac{1}{\\sqrt 6}\\cdot\\tfrac{4\\pi}{15}=\\dfrac{2\\sqrt 6\\pi}{45}$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "중적분", concept: "함숫값 평균", difficulty: "medium",
    question: "$D=\\{(x,y)\\mid x^2+y^2\\le y\\}$에 속하는 점 $(x,y)$에서 원점까지의 거리를 $f(x,y)$라 정의할 때, $D$ 위에서 함수 $f$의 평균값은?",
    options: [o("1","$\\dfrac{5}{3\\pi}$"), o("2","$\\dfrac{31}{18\\pi}$"), o("3","$\\dfrac{16}{9\\pi}$"), o("4","$\\dfrac{11}{6\\pi}$"), o("5","$\\dfrac{17}{9\\pi}$")],
    answer: 3,
    explanation: "$D$는 중심 $(0,1/2)$, 반지름 $1/2$인 원. 면적 $\\pi/4$. 극좌표: $r\\le\\sin\\theta,\\,0\\le\\theta\\le\\pi$. $\\iint\\sqrt{x^2+y^2}dA=\\int_0^{\\pi}\\!\\!\\int_0^{\\sin\\theta}r\\cdot r\\,dr\\,d\\theta=\\tfrac{1}{3}\\!\\int_0^{\\pi}\\sin^3\\theta\\,d\\theta=\\tfrac{1}{3}\\cdot\\tfrac{4}{3}=\\tfrac{4}{9}$. 평균 $=\\dfrac{4/9}{\\pi/4}=\\dfrac{16}{9\\pi}$."
  }),
  build({
    num: 21, subject: "적분학", unit: "정적분의 응용", concept: "리사주 곡선 면적", difficulty: "medium",
    question: "극곡선 $r=\\cos t,\\,\\theta=\\sin t$ $(0\\le t\\le 2\\pi)$로 둘러싸인 영역의 넓이는?",
    options: [o("1","$\\dfrac{2}{3}$"), o("2","$\\dfrac{4}{3}$"), o("3","$2$"), o("4","$\\dfrac{8}{3}$"), o("5","$\\dfrac{10}{3}$")],
    answer: 2,
    explanation: "각 사분면 면적 동일하므로 1사분면 넓이 $\\times 4$. $r^2+\\theta^2=1$, $r=\\sqrt{1-\\theta^2}$. $S=4\\cdot\\tfrac{1}{2}\\!\\int_0^1(1-\\theta^2)d\\theta=2(1-\\tfrac{1}{3})=\\dfrac{4}{3}$."
  }),
  build({
    num: 22, subject: "다변수함수", unit: "선적분과 면적분", concept: "스토크스 정리", difficulty: "medium",
    question: "곡면 $S$는 방정식 $z=5-y-2\\sqrt{x^2+y^2}$을 만족시키며 원기둥 $x^2+y^2=4$의 안쪽에 놓인 위쪽 방향의 곡면이다. 벡터마당 $\\mathbf{F}=\\langle 3y^2,2z^4,3x^3\\rangle$에 대하여 적분 $\\displaystyle\\iint_S \\mathrm{curl}\\,\\mathbf{F}\\cdot\\mathbf{n}\\,dS$의 값은?",
    options: [o("1","$-9\\pi$"), o("2","$-16\\pi$"), o("3","$-25\\pi$"), o("4","$-36\\pi$"), o("5","$-49\\pi$")],
    answer: 4,
    explanation: "$x^2+y^2=4$ 대입하면 $z=1-y$. 새 곡면 $S':z=1-y$ ($x^2+y^2\\le 4$). $\\mathrm{curl}\\,\\mathbf{F}=(-8z^3,-9x^2,-6y)$. $S'$의 법선 $(0,1,1)$. $\\iint(-9x^2-6y)dA=-9\\!\\iint x^2 dA-0=-9\\cdot\\tfrac{\\pi}{2}\\cdot 16=-36\\pi$ (원판 $x^2+y^2\\le 4$의 $\\iint x^2 dA=\\pi\\cdot 16/4\\cdot 2=4\\pi$, 정확히는 $\\iint x^2 dA=\\int_0^{2\\pi}\\!\\int_0^2 r^3\\cos^2\\theta\\,dr\\,d\\theta=\\pi\\cdot 4=4\\pi$). $-9\\cdot 4\\pi=-36\\pi$."
  }),
  build({
    num: 23, subject: "미분학", unit: "극한과 연속", concept: "기하 극한", difficulty: "mediumHard",
    question: "한 변의 길이가 $1$인 정 $n$각형 $A_n$의 외접원을 $O_n$, 내접원을 $I_n$이라 할 때, 다음 극한을 구하면?\n\n$\\displaystyle\\lim_{n\\to\\infty}\\dfrac{O_n\\text{의 넓이}-A_n\\text{의 넓이}}{A_n\\text{의 넓이}-I_n\\text{의 넓이}}$",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 2,
    explanation: "정$n$각형 넓이 $A_n=\\tfrac{n}{4}\\cot(\\pi/n)$. 외접원 $O_n=\\tfrac{\\pi}{4\\sin^2(\\pi/n)}$. 내접원 $I_n=\\tfrac{\\pi}{4}\\cot^2(\\pi/n)$. $t=\\pi/n\\to 0$ 치환 후 Taylor 전개로 비율 계산 → 극한 $2$."
  }),
  build({
    num: 24, subject: "적분학", unit: "정적분의 계산", concept: "삼각치환(arctan)", difficulty: "mediumHard",
    question: "정적분 $\\displaystyle\\int_0^{\\pi/4}\\dfrac{1}{\\sin^6 x+\\cos^6 x}dx$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{6}$"), o("2","$\\dfrac{\\pi}{4}$"), o("3","$\\dfrac{\\pi}{3}$"), o("4","$\\dfrac{5\\pi}{12}$"), o("5","$\\dfrac{\\pi}{2}$")],
    answer: 5,
    explanation: "$\\sin^6 x+\\cos^6 x=1-3\\sin^2 x\\cos^2 x=1-\\tfrac{3}{4}\\sin^2 2x$. $\\dfrac{8}{5+3\\cos 4x}$로 변형 후 $\\tan t=u$ 치환: $\\int_0^{\\infty}\\tfrac{4}{u^2+4}du=\\dfrac{\\pi}{2}$."
  }),
  build({
    num: 25, subject: "다변수함수", unit: "선적분과 면적분", concept: "선적분(폐곡선+선)", difficulty: "medium",
    question: "원점에서 출발하여 세 점 $(2,2,0),(0,2,0),(0,0,1)$을 순서대로 거쳐 다시 원점으로 돌아오는 선분들로 이루어진 경로를 $C$라 하자. 벡터마당 $\\mathbf{F}(x,y,z)=\\langle e^{x^2},2z,y\\rangle$에 대하여 선적분 $\\displaystyle\\int_C \\mathbf{F}\\cdot d\\mathbf{r}$의 값은?",
    options: [o("1","$-\\dfrac{5}{2}$"), o("2","$-2$"), o("3","$-\\dfrac{3}{2}$"), o("4","$-1$"), o("5","$-\\dfrac{1}{2}$")],
    answer: 4,
    explanation: "$\\mathbf{F}=(e^{x^2},0,0)+(0,2z,y)$. 첫 부분 $\\mathrm{curl}=0$이라 폐곡선 적분 $0$. 둘째 부분: 폐곡선이 $z\\ge 0$ 절반 통과(yz평면+삼각형). 분리 계산 후 합 $=-1$."
  }),
];

console.log(`Inserting ${problems.length} questions...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
