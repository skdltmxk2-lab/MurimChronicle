// Upload 2024년도 세종대 편입수학 기출 25문항 (5지선다)
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
const YEAR = "2024";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-sejong-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "다변수함수", unit: "편도함수", concept: "편미분 (sinh)", difficulty: "easy",
    question: "함수 $f(x,y)=\\sinh(x^2+y)$에 대하여 편미분계수 $f_x(1,0)$을 구하면?",
    options: [o("1","$\\dfrac{1}{e}-e$"), o("2","$\\dfrac{1}{e}$"), o("3","$e-\\dfrac{1}{e}$"), o("4","$e$"), o("5","$e+\\dfrac{1}{e}$")],
    answer: 5,
    explanation: "$x$에 대한 편미분: $f_x(x,y)=\\cosh(x^2+y)\\cdot\\dfrac{\\partial}{\\partial x}(x^2+y)=2x\\cosh(x^2+y)$.\n점 $(1,0)$ 대입: $f_x(1,0)=2\\cdot 1\\cdot\\cosh(1)=2\\cdot\\dfrac{e+e^{-1}}{2}=e+e^{-1}=e+\\dfrac{1}{e}$."
  }),
  build({
    num: 2, subject: "적분학", unit: "급수", concept: "수렴반지름", difficulty: "easy",
    question: "거듭제곱급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(x-1)^{2n}}{4^n}$의 수렴반지름은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$4$"), o("5","$\\infty$")],
    answer: 3,
    explanation: "비율판정법: $\\displaystyle\\lim_{n\\to\\infty}\\left|\\dfrac{a_{n+1}}{a_n}\\right|=\\lim\\dfrac{|x-1|^{2(n+1)}/4^{n+1}}{|x-1|^{2n}/4^n}=\\dfrac{|x-1|^2}{4}$.\n수렴 조건: $\\dfrac{|x-1|^2}{4}<1\\Rightarrow|x-1|<2$. 따라서 수렴반지름 $R=2$."
  }),
  build({
    num: 3, subject: "미분학", unit: "극한과 연속", concept: "$\\infty^0$ 부정형", difficulty: "easyMedium",
    question: "극한 $\\displaystyle\\lim_{x\\to\\infty}(e^x+x^2)^{1/x}$의 값을 구하면?",
    options: [o("1","$e$"), o("2","$e+\\dfrac{1}{e}$"), o("3","$1+e$"), o("4","$e^2$"), o("5","$1+e^2$")],
    answer: 1,
    explanation: "$\\infty^0$ 꼴이므로 로그 후 로피탈.\n$L=\\lim_{x\\to\\infty}(e^x+x^2)^{1/x}$, $\\ln L=\\lim\\dfrac{\\ln(e^x+x^2)}{x}\\stackrel{\\text{L'H}}{=}\\lim\\dfrac{e^x+2x}{e^x+x^2}$.\n분자·분모를 $e^x$로 나누면 $\\dfrac{1+2x/e^x}{1+x^2/e^x}\\to\\dfrac{1+0}{1+0}=1$.\n따라서 $\\ln L=1$, $L=e$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분의 정의", concept: "리만합", difficulty: "easyMedium",
    question: "극한 $\\displaystyle\\lim_{n\\to\\infty}\\sum_{k=1}^{n}\\dfrac{k^5+k^4}{n^6+n}$의 값을 구하면?",
    options: [o("1","$\\dfrac{1}{12}$"), o("2","$\\dfrac{1}{6}$"), o("3","$\\dfrac{1}{4}$"), o("4","$\\dfrac{1}{3}$"), o("5","$\\dfrac{1}{2}$")],
    answer: 2,
    explanation: "분모·분자를 $n^6$으로 나누어 리만합 형태로 변형:\n$\\displaystyle\\sum_{k=1}^{n}\\dfrac{k^5+k^4}{n^6+n}=\\dfrac{1}{1+1/n^5}\\sum_{k=1}^{n}\\dfrac{1}{n}\\!\\left[\\!\\left(\\dfrac{k}{n}\\right)^{\\!5}+\\dfrac{1}{n}\\!\\left(\\dfrac{k}{n}\\right)^{\\!4}\\right]$.\n$n\\to\\infty$이면 앞 인수는 $1$, $\\dfrac{1}{n}$이 곱해진 두 번째 항은 사라지고 첫 항만 적분으로 수렴:\n$\\displaystyle\\int_0^1 x^5\\,dx=\\dfrac{1}{6}$."
  }),
  build({
    num: 5, subject: "적분학", unit: "정적분의 계산", concept: "우함수·기함수 분리", difficulty: "medium",
    question: "정적분 $\\displaystyle\\int_{-1}^{1}\\dfrac{1+2|x|+\\tan x}{1+|x|+x^2}\\,dx$의 값을 구하면?",
    options: [o("1","$\\ln 3$"), o("2","$\\ln 5$"), o("3","$2\\ln 3$"), o("4","$2\\ln 5$"), o("5","$3\\ln 3$")],
    answer: 3,
    explanation: "분모 $1+|x|+x^2$은 우함수.\n① 우함수 부분 $\\displaystyle\\int_{-1}^{1}\\dfrac{1+2|x|}{1+|x|+x^2}dx=2\\int_0^1\\dfrac{1+2x}{1+x+x^2}dx$.\n분자 $1+2x$가 분모의 도함수와 정확히 일치하므로 $=2\\bigl[\\ln(1+x+x^2)\\bigr]_0^1=2(\\ln 3-0)=2\\ln 3$.\n② 기함수 부분 $\\displaystyle\\int_{-1}^{1}\\dfrac{\\tan x}{1+|x|+x^2}dx=0$ (피적분함수가 기함수).\n합: $2\\ln 3$."
  }),
  build({
    num: 6, subject: "미분학", unit: "도함수", concept: "로지스틱 함수 미분", difficulty: "easyMedium",
    question: "함수 $f(x)=\\dfrac{1}{1+e^{-x}}$에 대하여 방정식 $f(x)=\\dfrac{2}{3}$의 해를 $x=\\alpha$라 할 때, $f'(\\alpha)$의 값은?",
    options: [o("1","$\\dfrac{1}{9}$"), o("2","$\\dfrac{2}{9}$"), o("3","$\\dfrac{1}{3}$"), o("4","$\\dfrac{4}{9}$"), o("5","$\\dfrac{5}{9}$")],
    answer: 2,
    explanation: "① $\\alpha$ 구하기: $\\dfrac{1}{1+e^{-\\alpha}}=\\dfrac{2}{3}\\Rightarrow 1+e^{-\\alpha}=\\dfrac{3}{2}\\Rightarrow e^{-\\alpha}=\\dfrac{1}{2}$.\n② $f'(x)$ 구하기: 로지스틱 함수 항등식 $f'(x)=f(x)\\bigl(1-f(x)\\bigr)$.\n③ 대입: $f'(\\alpha)=\\dfrac{2}{3}\\cdot\\dfrac{1}{3}=\\dfrac{2}{9}$."
  }),
  build({
    num: 7, subject: "미분학", unit: "역삼각함수", concept: "주치 보정", difficulty: "medium",
    question: "$\\arcsin\\dfrac{\\sqrt{3}}{2}+\\arctan\\!\\left(\\tan\\dfrac{5\\pi}{9}\\right)$의 값은?",
    options: [o("1","$-\\dfrac{5\\pi}{18}$"), o("2","$-\\dfrac{\\pi}{9}$"), o("3","$\\dfrac{4\\pi}{9}$"), o("4","$\\dfrac{13\\pi}{18}$"), o("5","$\\dfrac{8\\pi}{9}$")],
    answer: 2,
    explanation: "① $\\arcsin\\dfrac{\\sqrt{3}}{2}=\\dfrac{\\pi}{3}$.\n② $\\arctan(\\tan\\theta)$의 치역은 $\\left(-\\dfrac{\\pi}{2},\\dfrac{\\pi}{2}\\right)$.\n$\\dfrac{5\\pi}{9}$는 $\\dfrac{\\pi}{2}=\\dfrac{4.5\\pi}{9}$보다 크므로 주치 범위 밖. 주기 $\\pi$ 빼면 $\\dfrac{5\\pi}{9}-\\pi=-\\dfrac{4\\pi}{9}$ ($\\in\\left(-\\dfrac{\\pi}{2},\\dfrac{\\pi}{2}\\right)$).\n따라서 $\\arctan\\!\\left(\\tan\\dfrac{5\\pi}{9}\\right)=-\\dfrac{4\\pi}{9}$.\n③ 합: $\\dfrac{\\pi}{3}-\\dfrac{4\\pi}{9}=\\dfrac{3\\pi-4\\pi}{9}=-\\dfrac{\\pi}{9}$."
  }),
  build({
    num: 8, subject: "적분학", unit: "급수", concept: "급수 수렴·발산 판정", difficulty: "medium",
    question: "다음 급수 중 발산하는 것은?\n\n$(1)\\ \\displaystyle\\sum_{n=1}^{\\infty}\\!\\left(\\dfrac{n}{n+1}\\right)^{\\!n^2}$\n$(2)\\ \\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{1}{n(\\ln n)^2}$\n$(3)\\ \\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{\\ln n}{n^2}$\n$(4)\\ \\displaystyle\\sum_{n=1}^{\\infty}\\tan\\!\\left(\\dfrac{1}{n^2}\\right)$\n$(5)\\ \\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{1}{\\sqrt{n}(\\ln n)^3}$",
    options: [o("1","$(1)$ 수렴"), o("2","$(2)$ 수렴"), o("3","$(3)$ 수렴"), o("4","$(4)$ 수렴"), o("5","$(5)$ 발산")],
    answer: 5,
    explanation: "(1) 근판정: $\\sqrt[n]{a_n}=\\!\\left(\\dfrac{n}{n+1}\\right)^{\\!n}\\to e^{-1}<1$ → 수렴.\n(2) Cauchy 응축: $\\displaystyle\\sum\\dfrac{1}{n(\\ln n)^2}$는 $p=2>1$의 비교로 수렴.\n(3) $\\dfrac{\\ln n}{n^2}\\le\\dfrac{1}{n^{1.5}}$ ($n$ 충분히 클 때) → 수렴.\n(4) $\\tan(1/n^2)\\sim 1/n^2$, $\\sum 1/n^2$ 수렴 → 수렴.\n(5) $t=\\ln n$ 치환·적분판정: $\\displaystyle\\int_2^{\\infty}\\dfrac{dx}{\\sqrt{x}(\\ln x)^3}=\\int_{\\ln 2}^{\\infty}\\dfrac{e^{t/2}}{t^3}dt$, $e^{t/2}/t^3\\to\\infty$이므로 발산."
  }),
  build({
    num: 9, subject: "적분학", unit: "특이적분", concept: "특이적분의 수렴 판정", difficulty: "medium",
    question: "다음 특이적분 중에서 수렴하는 것만을 있는 대로 고르면?\n\n(ㄱ) $\\displaystyle\\int_{-\\infty}^{\\infty}\\dfrac{x}{1+x^4}dx$\n(ㄴ) $\\displaystyle\\int_1^{e}\\dfrac{1}{\\ln x}dx$\n(ㄷ) $\\displaystyle\\int_{-1}^{1}\\dfrac{1}{x}dx$",
    options: [o("1","ㄱ"), o("2","ㄱ,ㄴ"), o("3","ㄱ,ㄷ"), o("4","ㄴ,ㄷ"), o("5","없음")],
    answer: 1,
    explanation: "(ㄱ) 수렴: 피적분함수 $\\dfrac{x}{1+x^4}$는 기함수이고 $|x|\\to\\infty$에서 $\\sim 1/x^3$ ($p=3>1$)이므로 절대수렴.\n(ㄴ) 발산: $x\\to 1^+$에서 $\\ln x\\sim(x-1)$, 따라서 $\\dfrac{1}{\\ln x}\\sim\\dfrac{1}{x-1}$. $\\displaystyle\\int_1\\dfrac{dx}{x-1}$이 발산하므로 발산.\n(ㄷ) 발산: $1/x$가 $x=0$에서 무한대(좌·우 양쪽), $\\displaystyle\\int_0^1\\dfrac{dx}{x}=\\infty$. 적분불가.\n수렴: ㄱ만."
  }),
  build({
    num: 10, subject: "선형대수", unit: "고유치와 대각화", concept: "대각화·트레이스", difficulty: "mediumHard",
    question: "행렬 $A=\\begin{pmatrix}1 & 0 & 0\\\\ 0 & 2 & -2\\\\ 0 & 6 & -5\\end{pmatrix}$와 자연수 $n$에 대하여 $f(n)=\\operatorname{tr}(A^n)$이라 하자. $f(n+1)-f(n)\\ge 2024$를 만족시키는 최소의 자연수 $n$을 구하면?",
    options: [o("1","$9$"), o("2","$10$"), o("3","$11$"), o("4","$12$"), o("5","$13$")],
    answer: 3,
    explanation: "① $A$의 고유치: $1$ + 우하단 $\\begin{pmatrix}2 & -2\\\\ 6 & -5\\end{pmatrix}$의 고유치.\n특성방정식 $\\lambda^2+3\\lambda+2=(\\lambda+1)(\\lambda+2)=0\\Rightarrow\\lambda=-1,-2$.\n따라서 $A^n$의 고유치 $1^n,(-1)^n,(-2)^n$ → $f(n)=1+(-1)^n+(-2)^n$.\n② $f(n+1)-f(n)=-2(-1)^n-3(-2)^n$.\n• $n$ 짝수: $-2-3\\cdot 2^n<0$ → 부등식 불성립.\n• $n$ 홀수: $2+3\\cdot 2^n\\ge 2024\\Rightarrow 2^n\\ge 674$.\n$2^9=512<674<1024=2^{10}$이므로 $n\\ge 10$. 홀수 조건 더하면 최소 $n=11$."
  }),
  build({
    num: 11, subject: "미분학", unit: "지수극한", concept: "$1^\\infty$ 부정형 + 미분", difficulty: "medium",
    question: "함수 $f(x)=\\displaystyle\\lim_{n\\to\\infty}\\!\\left(1-\\dfrac{x^2}{2n}+\\dfrac{x^3}{n\\sqrt{n}}\\right)^{\\!n}$에 대하여 $f'(2)$의 값은?",
    options: [o("1","$-\\dfrac{2}{e^2}$"), o("2","$-\\dfrac{1}{e}$"), o("3","$2$"), o("4","$e$"), o("5","$2e^2$")],
    answer: 1,
    explanation: "$1^{\\infty}$ 부정형. $a_n=-\\dfrac{x^2}{2n}+\\dfrac{x^3}{n^{3/2}}\\to 0$이므로\n$\\displaystyle\\lim(1+a_n)^n=\\exp\\!\\left(\\lim n\\cdot a_n\\right)$.\n$n\\cdot a_n=-\\dfrac{x^2}{2}+\\dfrac{x^3}{\\sqrt{n}}\\to-\\dfrac{x^2}{2}$.\n따라서 $f(x)=e^{-x^2/2}$.\n$f'(x)=-x\\,e^{-x^2/2}$, $f'(2)=-2e^{-2}=-\\dfrac{2}{e^2}$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "극값", concept: "이변수함수 극값", difficulty: "easyMedium",
    question: "함수 $f(x,y)=-2x^2-3y^2+4xy+4x+1$의 극값에 대한 설명으로 옳은 것은?",
    options: [o("1","극솟값은 $5$이다."), o("2","극댓값은 $5$이다."), o("3","극솟값은 $7$이다."), o("4","극댓값은 $7$이다."), o("5","극값은 없다.")],
    answer: 4,
    explanation: "① 임계점: $f_x=-4x+4y+4=0$, $f_y=-6y+4x=0$.\n$f_y=0$에서 $x=\\dfrac{3y}{2}$. $f_x=0$에 대입: $-6y+4y+4=0\\Rightarrow y=2$, $x=3$.\n② 헤시안: $f_{xx}=-4$, $f_{yy}=-6$, $f_{xy}=4$.\n$\\Delta=f_{xx}f_{yy}-f_{xy}^2=24-16=8>0$이고 $f_{xx}<0$이므로 $(3,2)$에서 극대.\n③ 극댓값: $f(3,2)=-18-12+24+12+1=7$."
  }),
  build({
    num: 13, subject: "미분학", unit: "고차도함수", concept: "고차도함수 (테일러 계수)", difficulty: "medium",
    question: "함수 $f(x)=\\sin^3 x$에 대하여 $f^{(7)}(0)$의 값은?",
    options: [o("1","$532$"), o("2","$539$"), o("3","$546$"), o("4","$553$"), o("5","$560$")],
    answer: 3,
    explanation: "삼배각 공식: $\\sin^3 x=\\dfrac{3\\sin x-\\sin 3x}{4}$.\n$\\sin^{(7)}(0)=\\sin\\!\\left(0+\\dfrac{7\\pi}{2}\\right)=-1$.\n사슬규칙: $\\dfrac{d^7}{dx^7}\\sin(3x)=3^7\\sin^{(7)}(3x)$, $x=0$에서 $3^7\\cdot(-1)=-2187$.\n따라서 $f^{(7)}(0)=\\dfrac{1}{4}\\bigl[3\\cdot(-1)-(-2187)\\bigr]=\\dfrac{2184}{4}=546$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "방향도함수", concept: "방향도함수 부호", difficulty: "easyMedium",
    question: "함수 $f(x,y,z)=2x^2+2y^2+3z^2+2xy+2yz-2xz$가 있다. 다음 보기의 벡터 $v_i$ 중 점 $(1,1,-1)$에서 $v_i$ 방향으로 이동하는 순간 함숫값이 감소하는 방향이 되는 벡터의 개수는?\n\n$v_1=(1,-1,1),\\ v_2=(2,1,4),\\ v_3=(-1,-1,1),\\ v_4=(1,2,2)$",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$"), o("5","$4$")],
    answer: 4,
    explanation: "감소 조건: $\\nabla f\\cdot v_i<0$.\n$\\nabla f=(4x+2y-2z,\\,4y+2x+2z,\\,6z+2y-2x)$.\n점 $(1,1,-1)$에서 $\\nabla f=(8,4,-6)$.\n• $v_1$: $8-4-6=-2<0$ ✓\n• $v_2$: $16+4-24=-4<0$ ✓\n• $v_3$: $-8-4-6=-18<0$ ✓\n• $v_4$: $8+8-12=+4>0$ ✗\n조건을 만족하는 벡터 개수: $3$개."
  }),
  build({
    num: 15, subject: "선형대수", unit: "행렬식", concept: "행렬식 성질 (스칼라배·거듭제곱)", difficulty: "medium",
    question: "가역행렬 $A$가 다음 두 조건을 만족시킬 때, $\\det(A^{-2})$의 값은?\n\n$16\\det(2A)=\\det(4A)$, $\\det(\\sqrt{2}\\,A)=\\det(A^3)$",
    options: [o("1","$\\dfrac{1}{4}$"), o("2","$\\dfrac{1}{2}$"), o("3","$1$"), o("4","$2$"), o("5","$4$")],
    answer: 1,
    explanation: "$A$를 $n$차 정방행렬, $|A|=d$.\n① $16\\cdot 2^n d=4^n d\\Rightarrow 2^{4+n}=2^{2n}\\Rightarrow n=4$.\n② $(\\sqrt{2})^4 d=d^3\\Rightarrow 4d=d^3\\Rightarrow d^2=4$.\n$\\det(A^{-2})=\\dfrac{1}{|A|^2}=\\dfrac{1}{4}$."
  }),
  build({
    num: 16, subject: "다변수함수", unit: "삼중적분", concept: "구면좌표 (반구껍질)", difficulty: "medium",
    question: "영역 $E=\\{(x,y,z)\\mid 1\\le x^2+y^2+z^2\\le 4,\\ z\\ge 0\\}$에 대하여 삼중적분 $\\displaystyle\\iiint_E z\\,dV$의 값을 구하면?",
    options: [o("1","$15\\pi$"), o("2","$\\dfrac{15\\pi}{2}$"), o("3","$5\\pi$"), o("4","$\\dfrac{15\\pi}{4}$"), o("5","$3\\pi$")],
    answer: 4,
    explanation: "구면좌표 $z=\\rho\\cos\\phi$, $dV=\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta$, 영역: $1\\le\\rho\\le 2$, $0\\le\\phi\\le\\pi/2$, $0\\le\\theta\\le 2\\pi$.\n$\\displaystyle\\iiint_E z\\,dV=\\int_0^{2\\pi}\\!d\\theta\\int_0^{\\pi/2}\\!\\cos\\phi\\sin\\phi\\,d\\phi\\int_1^{2}\\!\\rho^3\\,d\\rho$\n$=2\\pi\\cdot\\dfrac{1}{2}\\cdot\\dfrac{15}{4}=\\dfrac{15\\pi}{4}$."
  }),
  build({
    num: 17, subject: "적분학", unit: "정적분의 계산", concept: "부분분수 + 역탄젠트 차이", difficulty: "mediumHard",
    question: "정적분 $\\displaystyle\\int_{1/2}^{2}\\dfrac{x-2}{x(x^2+1)}dx$의 값을 구하면?",
    options: [o("1","$\\arctan\\dfrac{1}{4}-\\ln 4$"), o("2","$\\arctan\\dfrac{1}{2}+\\ln 4$"), o("3","$\\arctan\\dfrac{1}{2}-\\ln 4$"), o("4","$\\arctan\\dfrac{3}{4}+\\ln 4$"), o("5","$\\arctan\\dfrac{3}{4}-\\ln 4$")],
    answer: 5,
    explanation: "부분분수: $\\dfrac{x-2}{x(x^2+1)}=\\dfrac{-2}{x}+\\dfrac{2x+1}{x^2+1}$.\n적분: $-2\\ln|x|+\\ln(x^2+1)+\\arctan x$.\n$x=2$에서 $-2\\ln 2+\\ln 5+\\arctan 2$, $x=\\dfrac{1}{2}$에서 $\\ln 5+\\arctan\\dfrac{1}{2}$ (정리 후).\n차: $-2\\ln 2+\\arctan 2-\\arctan\\dfrac{1}{2}$.\n$\\arctan a-\\arctan b=\\arctan\\dfrac{a-b}{1+ab}$ (조건 충족) 적용: $\\arctan 2-\\arctan\\dfrac{1}{2}=\\arctan\\dfrac{3/2}{1+1}=\\arctan\\dfrac{3}{4}$.\n결과: $\\arctan\\dfrac{3}{4}-\\ln 4$."
  }),
  build({
    num: 18, subject: "다변수함수", unit: "면적분", concept: "구면 위 면적분 (대칭성)", difficulty: "medium",
    question: "곡면 $S:\\,x^2+y^2+z^2=1$에서의 면적분 $\\displaystyle\\iint_S(x^2+y^2+z^3)\\,dS$의 값을 구하면?",
    options: [o("1","$\\dfrac{5\\pi}{3}$"), o("2","$2\\pi$"), o("3","$\\dfrac{7\\pi}{3}$"), o("4","$\\dfrac{8\\pi}{3}$"), o("5","$3\\pi$")],
    answer: 4,
    explanation: "단위구 위에서는 $x^2+y^2+z^2=1$이므로 $x^2+y^2=1-z^2$.\n$\\displaystyle\\iint_S(1-z^2+z^3)\\,dS=\\iint_S 1\\,dS-\\iint_S z^2\\,dS+\\iint_S z^3\\,dS$.\n• $\\iint_S 1\\,dS=4\\pi$ (구의 표면적).\n• 대칭성으로 $\\iint x^2 dS=\\iint y^2 dS=\\iint z^2 dS=\\dfrac{1}{3}\\iint(x^2+y^2+z^2)dS=\\dfrac{4\\pi}{3}$.\n• $z^3$은 $z$에 대해 기함수, $S$가 $z\\to-z$ 대칭이므로 $\\iint z^3 dS=0$.\n합: $4\\pi-\\dfrac{4\\pi}{3}+0=\\dfrac{8\\pi}{3}$."
  }),
  build({
    num: 19, subject: "다변수함수", unit: "면적분", concept: "스토크스 정리", difficulty: "mediumHard",
    question: "위쪽 방향의 곡면 $S:\\,x^2+y^2+4z^2=1$ ($y\\ge 0,\\,z\\ge 0$)과 벡터마당 $F(x,y,z)=(y^3,z^2,x^2)$에 대하여 면적분 $\\displaystyle\\iint_S \\operatorname{curl}F\\cdot n\\,dS$의 값을 구하면?",
    options: [o("1","$-\\dfrac{\\pi}{8}$"), o("2","$-\\dfrac{3\\pi}{8}$"), o("3","$-\\dfrac{5\\pi}{8}$"), o("4","$-\\dfrac{7\\pi}{8}$"), o("5","$-\\dfrac{9\\pi}{8}$")],
    answer: 2,
    explanation: "스토크스 정리: $\\displaystyle\\iint_S\\operatorname{curl}F\\cdot n\\,dS=\\oint_{\\partial S}F\\cdot dr$.\n$\\partial S$ 두 조각:\n• $C_1$: $z=0$, $x^2+y^2=1$, $y\\ge 0$. 매개변수 $r(t)=(\\cos t,\\sin t,0)$, $t:0\\to\\pi$ ($+z$ 방향에서 보아 시계반대방향).\n  $F\\cdot dr=(\\sin^3 t)(-\\sin t)+0+0=-\\sin^4 t$.\n  $\\int_0^{\\pi}-\\sin^4 t\\,dt=-\\dfrac{3\\pi}{8}$ (월리스 공식).\n• $C_2$: $y=0$, $x^2+4z^2=1$, $z\\ge 0$. 그린의 정리식 결과로 $0$ ($\\cos^3$ 적분이 $0$).\n합: $-\\dfrac{3\\pi}{8}$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "극좌표·극곡선", concept: "장미곡선 면적", difficulty: "mediumHard",
    question: "곡선 $(x^2+y^2)^{3/2}=2xy$로 둘러싸인 영역의 넓이를 구하면?",
    options: [o("1","$\\dfrac{\\pi}{3}$"), o("2","$\\dfrac{\\pi}{4}$"), o("3","$\\dfrac{\\pi}{6}$"), o("4","$\\dfrac{\\pi}{8}$"), o("5","$\\dfrac{\\pi}{12}$")],
    answer: 2,
    explanation: "극좌표 변환 $x=r\\cos\\theta$, $y=r\\sin\\theta$:\n$(r^2)^{3/2}=2r^2\\cos\\theta\\sin\\theta\\Rightarrow r^3=r^2\\sin 2\\theta\\Rightarrow r=\\sin 2\\theta$.\n원래식이 $2xy\\ge 0$을 요구하므로 $\\sin 2\\theta\\ge 0$, 즉 $\\theta\\in[0,\\pi/2]\\cup[\\pi,3\\pi/2]$ → 1·3사분면 두 잎.\n잎 하나의 넓이: $\\dfrac{1}{2}\\!\\int_0^{\\pi/2}\\!\\sin^2 2\\theta\\,d\\theta=\\dfrac{\\pi}{8}$.\n두 잎 합: $\\dfrac{\\pi}{4}$."
  }),
  build({
    num: 21, subject: "다변수함수", unit: "면적분", concept: "발산정리 (폐곡면)", difficulty: "medium",
    question: "입체 $E=\\{(x,y,z)\\mid y^2\\le z\\le 1,\\ x^2\\le y\\}$의 양의 방향의 경계 곡면을 $S$라 할 때, 벡터마당 $F(x,y,z)=(6x,7y,8z)$에 대한 면적분 $\\displaystyle\\iint_S F\\cdot n\\,dS$의 값을 구하면?",
    options: [o("1","$16$"), o("2","$19$"), o("3","$22$"), o("4","$25$"), o("5","$28$")],
    answer: 1,
    explanation: "Gauss 발산정리: $\\displaystyle\\iint_S F\\cdot n\\,dS=\\iiint_E\\!\\nabla\\cdot F\\,dV=\\iiint_E 21\\,dV=21\\,V(E)$.\n부피: $0\\le y\\le 1$ ($y\\ge x^2\\ge 0$, $y^2\\le 1$ 필요), $-\\sqrt{y}\\le x\\le\\sqrt{y}$, $y^2\\le z\\le 1$.\n$\\displaystyle V=\\int_0^1\\!\\int_{-\\sqrt{y}}^{\\sqrt{y}}\\!\\int_{y^2}^{1}dz\\,dx\\,dy=\\int_0^1 2\\sqrt{y}(1-y^2)\\,dy$\n$=2\\!\\left[\\dfrac{2}{3}-\\dfrac{2}{7}\\right]=2\\cdot\\dfrac{8}{21}=\\dfrac{16}{21}$.\n결과: $21\\cdot\\dfrac{16}{21}=16$."
  }),
  build({
    num: 22, subject: "다변수함수", unit: "벡터와 공간도형", concept: "사면체 부피 (스칼라 삼중적)", difficulty: "mediumHard",
    question: "좌표공간의 세 점 $P(2,\\sec t,-1),\\ Q(\\sec t,-1,2),\\ R(2,\\sec t,0)$에 대하여, 꼭짓점이 $O,P,Q,R$인 사면체의 부피의 최솟값은? (단, $-\\dfrac{\\pi}{2}<t<\\dfrac{\\pi}{2}$이고, $O$는 원점이다.)",
    options: [o("1","$\\dfrac{1}{3}$"), o("2","$\\dfrac{1}{2}$"), o("3","$1$"), o("4","$\\dfrac{3}{2}$"), o("5","$2$")],
    answer: 2,
    explanation: "사면체 부피: $V=\\dfrac{1}{6}\\bigl|\\det[\\vec{OP},\\vec{OQ},\\vec{OR}]\\bigr|$.\n행렬식 $\\det\\begin{pmatrix}2 & \\sec t & -1\\\\ \\sec t & -1 & 2\\\\ 2 & \\sec t & 0\\end{pmatrix}$를 스칼라 삼중적 $\\vec{OR}\\cdot(\\vec{OP}\\times\\vec{OQ})$로 계산:\n$\\vec{OP}\\times\\vec{OQ}=\\bigl(2\\sec t-1,\\ -(4),\\ \\sec^2 t+2\\bigr)\\!=\\!(2\\sec t-1,-4,\\sec^2 t+2)$.\n내적: $2(2\\sec t-1)+\\sec t(-4)+0=4\\sec t-2-4\\sec t=-2-\\sec^2 t$.\n행렬식의 절댓값: $2+\\sec^2 t$.\n부피: $V=\\dfrac{1}{6}(2+\\sec^2 t)$. $\\sec^2 t\\ge 1$이고 $t=0$에서 등호. 최솟값 $V=\\dfrac{1}{6}\\cdot 3=\\dfrac{1}{2}$."
  }),
  build({
    num: 23, subject: "다변수함수", unit: "이차곡면", concept: "포물면에 대한 사영 최솟값", difficulty: "mediumHard",
    question: "좌표공간에 이차곡면 $S:\\,z=\\dfrac{x^2}{4}+\\dfrac{y^2}{2}+1$과 점 $P(2,0,1)$이 있다. 곡면 $S$ 위를 움직이는 점 $Q(x,y,z)$에 대하여 $\\dfrac{\\vec{OP}\\cdot\\vec{OQ}}{|\\vec{OQ}|}$의 최솟값은? (단, $O$는 원점이다.)",
    options: [o("1","$\\sqrt{2}$"), o("2","$\\dfrac{\\sqrt{2}}{2}$"), o("3","$0$"), o("4","$-\\sqrt{2}$"), o("5","$-\\dfrac{\\sqrt{2}}{2}$")],
    answer: 5,
    explanation: "$\\dfrac{\\vec{OP}\\cdot\\vec{OQ}}{|\\vec{OQ}|}=|\\vec{OP}|\\cos\\theta=\\sqrt{5}\\cos\\theta$ (단, $\\theta$는 두 벡터 사잇각).\n최솟값은 $\\cos\\theta$가 최소(=가장 음수). 즉 $\\theta$ 최대. $\\vec{OQ}$가 곡면에 접하는 방향에서 후보 발생.\n조건: $\\vec{OQ}\\perp\\nabla(z-x^2/4-y^2/2-1)$ at $Q$ — $\\vec{OQ}$와 곡면 $S$의 접평면이 만남.\n$\\bigl(\\dfrac{x}{2},y,-1\\bigr)\\cdot(x,y,z)=0\\Rightarrow\\dfrac{x^2}{2}+y^2-z=0$.\n곡면식과 연립: $\\dfrac{x^2}{2}+y^2=\\dfrac{x^2}{4}+\\dfrac{y^2}{2}+1\\Rightarrow\\dfrac{x^2}{4}+\\dfrac{y^2}{2}=1$, $z=2$.\n$\\vec{OQ}=(-2,0,2)$가 $\\vec{OP}=(2,0,1)$과 가장 큰 각.\n$\\dfrac{\\vec{OP}\\cdot\\vec{OQ}}{|\\vec{OQ}|}=\\dfrac{-4+0+2}{2\\sqrt{2}}=\\dfrac{-2}{2\\sqrt{2}}=-\\dfrac{\\sqrt{2}}{2}$."
  }),
  build({
    num: 24, subject: "선형대수", unit: "이차형식", concept: "고유치로 타원 단축 구하기", difficulty: "medium",
    question: "좌표평면에서 부등식의 영역 $2x^2+2\\sqrt{2}\\,xy+3y^2\\le 36$에 포함되는 원의 반지름의 최댓값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 3,
    explanation: "이차형식 $2x^2+2\\sqrt{2}xy+3y^2=(x\\ y)\\!\\begin{pmatrix}2 & \\sqrt{2}\\\\ \\sqrt{2} & 3\\end{pmatrix}\\!\\binom{x}{y}$.\n행렬의 고유치: $\\lambda^2-5\\lambda+(6-2)=0\\Rightarrow\\lambda^2-5\\lambda+4=0\\Rightarrow\\lambda=1,4$.\n주축 좌표 $X,Y$로는 $X^2+4Y^2\\le 36$, 즉 반축 $a=6,b=3$인 타원.\n포함되는 원의 최대 반지름 = 타원의 단축 = $\\min(a,b)=3$."
  }),
  build({
    num: 25, subject: "선형대수", unit: "최적화", concept: "두 이차곡면 교선 + 코시-슈바르츠", difficulty: "mediumHard",
    question: "다음 두 타원면의 교선 위의 점 $P(x,y,z)$에 대하여 $x^2$의 최댓값을 구하면?\n\n$x^2+2y^2+3z^2=14,\\quad x^2+2(y-3)^2+3(z-4)^2=25$",
    options: [o("1","$\\dfrac{53}{24}$"), o("2","$\\dfrac{55}{24}$"), o("3","$\\dfrac{19}{8}$"), o("4","$\\dfrac{59}{24}$"), o("5","$\\dfrac{61}{24}$")],
    answer: 5,
    explanation: "두 식의 차로 평면 방정식 도출:\n$2(y^2-(y-3)^2)+3(z^2-(z-4)^2)=14-25=-11$\n$\\Rightarrow 6(2y-3)+12(2z-4)=-11\\Rightarrow 12y+24z=55$.\n교선은 평면 $12y+24z=55$ 위의 점들.\n$x^2$ 최대 $\\Leftrightarrow 2y^2+3z^2$ 최소 (제약 $14-x^2=2y^2+3z^2$).\n코시-슈바르츠: $\\bigl((6\\sqrt{2})^2+(8\\sqrt{3})^2\\bigr)(2y^2+3z^2)\\ge\\bigl(6\\sqrt{2}\\cdot\\sqrt{2}\\,y+8\\sqrt{3}\\cdot\\sqrt{3}\\,z\\bigr)^2=(12y+24z)^2=55^2$.\n$(72+192)(2y^2+3z^2)\\ge 3025\\Rightarrow 2y^2+3z^2\\ge\\dfrac{3025}{264}=\\dfrac{275}{24}$.\n따라서 $x^2\\le 14-\\dfrac{275}{24}=\\dfrac{336-275}{24}=\\dfrac{61}{24}$."
  }),
];

console.log(`Uploading ${problems.length} problems for ${SCHOOL} ${YEAR}...`);

const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
console.log(`✅ Inserted ${data?.length ?? 0} questions for ${SCHOOL} ${YEAR}`);
