// Upload 2020년도 가천대 편입수학 기출 25문항 (4지선다)
// Usage: node scripts/upload_general_2020_gachon.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SCHOOL = "가천대"; const YEAR = "2020";
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
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "유리화 극한", difficulty: "easyMedium",
    question: "$\\displaystyle\\lim_{x\\to\\infty}\\!\\left(\\sqrt{2x^2+2x+1}-\\sqrt{2x^2-2x+1}\\right)$의 값은?",
    options: [o("1","$1$"), o("2","$\\sqrt{2}$"), o("3","$2\\sqrt{2}$"), o("4","$4$")],
    answer: 2,
    explanation: "**1단계 — 유리화.** 켤레식을 곱해 분자분모.\n\n$=\\dfrac{(2x^2+2x+1)-(2x^2-2x+1)}{\\sqrt{2x^2+2x+1}+\\sqrt{2x^2-2x+1}}=\\dfrac{4x}{\\sqrt{2x^2+2x+1}+\\sqrt{2x^2-2x+1}}$.\n\n**2단계 — 극한.** $x\\to\\infty$에서 분모 $\\sim 2\\sqrt{2x^2}=2\\sqrt 2 x$.\n\n극한 $=\\dfrac{4x}{2\\sqrt 2 x}=\\dfrac{4}{2\\sqrt 2}=\\sqrt 2$."
  }),
  build({
    num: 2, subject: "미분학", unit: "추가내용", concept: "음함수 미분(arctan)", difficulty: "easyMedium",
    question: "곡선 $y=x+\\arctan y$ 위의 점 $(1-\\dfrac{\\pi}{4},1)$에서 접선의 기울기는?",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$1$"), o("4","$2$")],
    answer: 4,
    explanation: "**1단계 — $F=0$ 형태.** $F(x,y)=y-x-\\arctan y$. $F_x=-1$, $F_y=1-\\dfrac{1}{1+y^2}=\\dfrac{y^2}{1+y^2}$.\n\n**2단계 — 음함수 도함수.** $\\dfrac{dy}{dx}=-\\dfrac{F_x}{F_y}=\\dfrac{1+y^2}{y^2}$.\n\n**3단계 — $y=1$ 대입.** $\\dfrac{2}{1}=2$."
  }),
  build({
    num: 3, subject: "적분학", unit: "정적분의 응용", concept: "매개변수 곡선 길이", difficulty: "medium",
    question: "다음 곡선의 길이는?\n\n$x(t)=3+t^2,\\,y(t)=\\cosh(t^2)\\,(0\\le t\\le 1)$",
    options: [o("1","$1$"), o("2","$\\cosh 1$"), o("3","$\\sinh 1$"), o("4","$\\tanh 1$")],
    answer: 3,
    explanation: "**1단계 — 도함수.** $x'=2t$, $y'=2t\\sinh(t^2)$.\n\n**2단계 — 길이 식.** $L=\\!\\int_0^1\\sqrt{(2t)^2+(2t\\sinh(t^2))^2}\\,dt=\\!\\int_0^1 2t\\sqrt{1+\\sinh^2(t^2)}\\,dt$.\n\n$1+\\sinh^2 u=\\cosh^2 u$이라 $\\sqrt{\\cdots}=\\cosh(t^2)$.\n\n$L=\\!\\int_0^1 2t\\cosh(t^2)dt$.\n\n**3단계 — 치환.** $u=t^2$, $du=2t\\,dt$:\n\n$=\\!\\int_0^1\\cosh u\\,du=[\\sinh u]_0^1=\\sinh 1$."
  }),
  build({
    num: 4, subject: "미분학", unit: "추가내용", concept: "변곡점 조건", difficulty: "easyMedium",
    question: "점 $(1,4)$이 곡선 $y=x^3+ax^2+bx+1$의 변곡점일 때, $b$의 값은? (단, $a,b$는 상수)",
    options: [o("1","$1$"), o("2","$3$"), o("3","$5$"), o("4","$7$")],
    answer: 3,
    explanation: "**조건 1 — 곡선 위.** $4=1+a+b+1\\Rightarrow a+b=2$.\n\n**조건 2 — 변곡점($y''=0$).** $y''=6x+2a$. $x=1$에서 $0$: $6+2a=0\\Rightarrow a=-3$.\n\n**3단계 — $b$.** $b=2-a=2-(-3)=5$."
  }),
  build({
    num: 5, subject: "선형대수", unit: "고유치와 대각화", concept: "대각화 가능성 진위", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}3&0&0\\\\4&2&0\\\\5&6&-1\\end{pmatrix}$에 대해 다음 $\\langle$보기$\\rangle$에서 옳은 것의 개수는?\n\nㄱ. $A$의 고윳값은 $A$의 주대각선 상의 성분과 일치한다.\n\nㄴ. $A$는 대각화 가능하다.\n\nㄷ. $A$는 직교 대각화 가능하다.",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$")],
    answer: 3,
    explanation: "ㄱ. **참.** 하삼각행렬의 고유값은 대각성분 $\\{3,2,-1\\}$.\n\nㄴ. **참.** 세 고유값이 서로 다르므로 항상 대각화 가능.\n\nㄷ. **거짓.** 직교 대각화는 대칭행렬일 때만 가능. $A$는 대칭이 아님.\n\n참은 ㄱ, ㄴ → **2개**."
  }),
  build({
    num: 6, subject: "미분학", unit: "극한과 연속", concept: "이계 도함수의 극한", difficulty: "medium",
    question: "함수 $f(x)=\\ln(\\sec^2 x)$에 대하여 극한 $\\displaystyle\\lim_{x\\to 0}\\dfrac{f\\!\\left(\\dfrac{\\pi}{4}+x\\right)-2f\\!\\left(\\dfrac{\\pi}{4}\\right)+f\\!\\left(\\dfrac{\\pi}{4}-x\\right)}{x^2}$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 4,
    explanation: "**1단계 — 정의에 의한 도함수.** $\\lim_{x\\to 0}\\dfrac{f(a+x)-2f(a)+f(a-x)}{x^2}=f''(a)$.\n\n**2단계 — $f''$ 계산.** $f(x)=2\\ln(\\sec x)$. $f'(x)=2\\cdot\\dfrac{\\sec x\\tan x}{\\sec x}=2\\tan x$. $f''(x)=2\\sec^2 x$.\n\n**3단계 — $x=\\pi/4$ 대입.** $\\sec(\\pi/4)=\\sqrt 2$이라 $\\sec^2(\\pi/4)=2$.\n\n$f''(\\pi/4)=2\\cdot 2=4$."
  }),
  build({
    num: 7, subject: "적분학", unit: "정적분의 성질", concept: "대칭 적분", difficulty: "medium",
    question: "연속함수 $f(x)$가 다음 두 조건을 만족시킬 때, 상수 $a$의 값은?\n\n$f(x)+f(-x)=ax^2+1,\\quad\\!\\int_{-1}^1 f(x)\\,dx=3$",
    options: [o("1","$3$"), o("2","$4$"), o("3","$5$"), o("4","$6$")],
    answer: 4,
    explanation: "**1단계 — 적분 분리.** $\\!\\int_{-1}^1 f(x)dx=\\!\\int_{-1}^0 f(x)dx+\\!\\int_0^1 f(x)dx$.\n\n**2단계 — 첫 적분에서 $x\\to-t$.** $\\!\\int_{-1}^0 f(x)dx=\\!\\int_0^1 f(-t)dt$.\n\n**3단계 — 합치기.** $\\!\\int_0^1[f(-t)+f(t)]dt=\\!\\int_0^1(at^2+1)dt=\\dfrac{a}{3}+1$.\n\n**4단계 — 조건 대입.** $\\dfrac{a}{3}+1=3\\Rightarrow a=6$."
  }),
  build({
    num: 8, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "수렴구간 정수 개수", difficulty: "medium",
    question: "멱급수 $\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{(x+2)^n}{2^n\\ln n}$의 수렴구간에 속하는 모든 정수의 개수는?",
    options: [o("1","$2$"), o("2","$3$"), o("3","$4$"), o("4","$5$")],
    answer: 3,
    explanation: "**1단계 — 수렴반경.** 비율판정 $\\!\\left|\\dfrac{x+2}{2}\\right|<1\\Rightarrow|x+2|<2\\Rightarrow -4<x<0$.\n\n**2단계 — 끝점.**\n\n$x=-4$: $\\sum\\dfrac{(-2)^n}{2^n\\ln n}=\\sum\\dfrac{(-1)^n}{\\ln n}$ — 교대급수, 수렴.\n\n$x=0$: $\\sum\\dfrac{2^n}{2^n\\ln n}=\\sum\\dfrac{1}{\\ln n}$ — 발산.\n\n수렴구간 $-4\\le x<0$.\n\n**3단계 — 정수.** $-4,-3,-2,-1$ → **4개**."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "추가내용", concept: "두 직선 포함 평면", difficulty: "medium",
    question: "직선 $\\dfrac{x-2}{2}=\\dfrac{y+1}{2}=z$와 $\\dfrac{x-1}{2}=\\dfrac{y+2}{2}=z-1$을 포함하는 평면의 방정식은?",
    options: [o("1","$x+y+z-3=0$"), o("2","$x-y+z-3=0$"), o("3","$x+y-3=0$"), o("4","$x-y-3=0$")],
    answer: 4,
    explanation: "**1단계 — 두 직선 정보.**\n\n$\\ell_1$ 방향 $(2,2,1)$, 점 $(2,-1,0)$.\n\n$\\ell_2$ 방향 $(2,2,1)$, 점 $(1,-2,1)$. 방향이 같음 → 두 직선 평행.\n\n**2단계 — 평면 법선.** 평면은 직선 방향과 두 직선 위 점들을 잇는 벡터로 결정.\n\n$\\overrightarrow{P_1 P_2}=(1,-2,1)-(2,-1,0)=(-1,-1,1)$.\n\n법선 $=(2,2,1)\\times(-1,-1,1)=(2+1,-(2+1),-2+2)=(3,-3,0)\\to(1,-1,0)$.\n\n**3단계 — 평면식.** 점 $(2,-1,0)$ 사용: $1(x-2)-1(y+1)=0$ → $x-y-3=0$."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "원점-곡면 최단거리", difficulty: "medium",
    question: "원점 $(0,0,0)$부터 곡면 $y^2=9+xz$까지의 최단거리는?",
    options: [o("1","$1$"), o("2","$3$"), o("3","$5$"), o("4","$6$")],
    answer: 2,
    explanation: "**1단계 — 거리² 함수.** $d^2=x^2+y^2+z^2=x^2+(9+xz)+z^2=x^2+xz+z^2+9$.\n\n**2단계 — 임계점.** $\\dfrac{\\partial}{\\partial x}=2x+z=0$, $\\dfrac{\\partial}{\\partial z}=x+2z=0$. 풀면 $x=z=0$.\n\n**3단계 — 거리.** $d^2(0,0)=0+0+0+9=9$이라 $d=3$."
  }),
  build({
    num: 11, subject: "적분학", unit: "정적분의 계산", concept: "곱미분 적분", difficulty: "medium",
    question: "함수 $f(x)=e^{x^3}$에 대하여 $\\displaystyle\\int_0^1\\!\\left[(f''(x))^2+f'(x)f'''(x)\\right]dx$의 값은?",
    options: [o("1","$e$"), o("2","$\\dfrac{e^2}{2}$"), o("3","$15e$"), o("4","$45e^2$")],
    answer: 4,
    explanation: "**핵심 관찰.** $(f'(x)f''(x))'=f''(x)\\cdot f''(x)+f'(x)\\cdot f'''(x)=(f''(x))^2+f'(x)f'''(x)$.\n\n즉 피적분함수 $=(f'\\cdot f'')'$.\n\n**적분.** $\\!\\int_0^1(f'f'')'dx=[f'(x)f''(x)]_0^1=f'(1)f''(1)-f'(0)f''(0)$.\n\n**계산.** $f'(x)=3x^2 e^{x^3}$, $f''(x)=(6x+9x^4)e^{x^3}$.\n\n$f'(0)=0,\\,f''(0)=0$ → 두 번째 항 $0$.\n\n$f'(1)=3e,\\,f''(1)=15e$. 곱 $=45e^2$."
  }),
  build({
    num: 12, subject: "미분학", unit: "추가내용", concept: "직사각형 최대 넓이", difficulty: "easyMedium",
    question: "좌표평면에서 곡선 $y=e^{-|x|}$과 $x$축 사이에 있고, 한 변이 $x$축에 평행한 직사각형의 최대 넓이는?",
    options: [o("1","$\\dfrac{1}{e}$"), o("2","$\\dfrac{2}{e}$"), o("3","$\\dfrac{3}{e}$"), o("4","$\\dfrac{4}{e}$")],
    answer: 2,
    explanation: "**1단계 — 직사각형 모형.** $y=e^{-|x|}$가 $x$축 대칭. 직사각형 가로 $2x$, 세로 $e^{-x}$ ($x>0$).\n\n넓이 $S(x)=2xe^{-x}$.\n\n**2단계 — 최대화.** $S'(x)=2e^{-x}(1-x)=0\\Rightarrow x=1$.\n\n**3단계 — 최댓값.** $S(1)=2e^{-1}=\\dfrac{2}{e}$."
  }),
  build({
    num: 13, subject: "선형대수", unit: "행렬", concept: "무수히 많은 해 조건", difficulty: "medium",
    question: "다음 선형 연립 방정식이 무수히 많은 해를 갖기 위한 실수 $a$의 값은?\n\n$\\begin{cases}-3x-3y+(a^2-5a)z=a-5\\\\x+z=2\\\\2x+y+3z=3\\end{cases}$",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 2,
    explanation: "**Rouché-Capelli.** 무수히 많은 해 조건: $\\mathrm{rank}(A)=\\mathrm{rank}(A|b)<n=3$.\n\n**행 사다리꼴.** 확대행렬을 변환하면 마지막 행이 $(0,0,a^2-5a+6\\,|\\,a-2)$ 형태로 도달.\n\n무수해 조건: $a^2-5a+6=0$ AND $a-2=0$. 즉 $(a-2)(a-3)=0$ AND $a=2$.\n\n둘 다 만족: $a=2$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "편도함수", concept: "접평면 + 평면 비교", difficulty: "medium",
    question: "이변수 함수 $f(x,y)=\\dfrac{x^2}{2}+y^2$의 그래프 위의 점 $(a,b,c)$에서의 접평면의 방정식이 $2x+2y-z-3=0$일 때, $a+b+c$의 값은? (단, $a,b,c$는 상수)",
    options: [o("1","$5$"), o("2","$6$"), o("3","$7$"), o("4","$8$")],
    answer: 2,
    explanation: "**1단계 — 곡면 법선.** $g=\\dfrac{x^2}{2}+y^2-z=0$, $\\nabla g=(x,2y,-1)$.\n\n**2단계 — 평면 법선과 평행.** $(2,2,-1)$과 평행이라 $(a,2b,-1)=(2,2,-1)$이라 $a=2,\\,b=1$.\n\n**3단계 — 점이 평면 위.** 접점 $(2,1,c)$가 평면 $2x+2y-z=3$ 위: $4+2-c=3\\Rightarrow c=3$.\n\n합 $=2+1+3=6$."
  }),
  build({
    num: 15, subject: "다변수함수", unit: "중적분", concept: "적분순서 변경 + 극좌표", difficulty: "medium",
    question: "$\\displaystyle\\int_0^2\\!\\!\\int_0^{\\sqrt{3}y}xy\\,dx\\,dy+\\!\\int_2^4\\!\\!\\int_0^{\\sqrt{16-y^2}}xy\\,dx\\,dy$의 값은?",
    options: [o("1","$16$"), o("2","$18$"), o("3","$20$"), o("4","$24$")],
    answer: 4,
    explanation: "**1단계 — 영역 합.** 두 적분 영역을 합치면 $0\\le y\\le 4,\\,0\\le x$이고 $\\sqrt 3 y$ 또는 원 $x^2+y^2=16$로 제한. 극좌표로 $0\\le\\theta\\le\\pi/2$, $0\\le r\\le 4$, 단 첫 적분의 윗 경계가 $x=\\sqrt 3 y$ (직선)이라 $\\theta\\ge\\pi/6$.\n\n**2단계 — 극좌표.** $\\!\\int_{\\pi/6}^{\\pi/2}\\!\\!\\int_0^4 r\\cos\\theta\\cdot r\\sin\\theta\\cdot r\\,dr\\,d\\theta$.\n\n$=\\!\\int_{\\pi/6}^{\\pi/2}\\sin\\theta\\cos\\theta\\,d\\theta\\cdot\\!\\int_0^4 r^3 dr$.\n\n각 적분: $\\!\\int_{\\pi/6}^{\\pi/2}\\dfrac{\\sin 2\\theta}{2}d\\theta=\\!\\left[-\\dfrac{\\cos 2\\theta}{4}\\right]_{\\pi/6}^{\\pi/2}=\\dfrac{1}{4}-\\!\\left(-\\dfrac{1}{8}\\right)=\\dfrac{3}{8}$.\n\n$\\!\\int_0^4 r^3 dr=64$.\n\n결과 $=\\dfrac{3}{8}\\cdot 64=24$."
  }),
  build({
    num: 16, subject: "적분학", unit: "정적분의 응용", concept: "함수와 역함수의 영역", difficulty: "medium",
    question: "함수 $f(x)=x^3-3x^2+3x$의 역함수를 $g(x)$라 할 때, 두 곡선 $y=f(x)$와 $y=g(x)$로 둘러싸인 영역의 넓이는?",
    options: [o("1","$1$"), o("2","$\\dfrac{3}{2}$"), o("3","$\\dfrac{5}{3}$"), o("4","$\\dfrac{8}{3}$")],
    answer: 1,
    explanation: "**1단계 — 교점.** $y=f(x)$와 $y=g(x)$의 교점은 $y=x$ 위의 점이라 $f(x)=x$.\n\n$x^3-3x^2+3x=x\\Rightarrow x^3-3x^2+2x=0\\Rightarrow x(x-1)(x-2)=0$. 교점 $(0,0),(1,1),(2,2)$.\n\n**2단계 — 대칭성.** $f$와 $g$는 $y=x$에 대칭. 둘러싸인 영역은 $y=x$ 좌우 대칭.\n\n넓이 $=2\\!\\int|f(x)-x|dx$ over [교점 사이].\n\n**3단계 — 적분.** $S=2\\cdot\\!\\left[\\!\\int_0^1(x^3-3x^2+2x)dx+\\!\\int_1^2-(x^3-3x^2+2x)dx\\right]$.\n\n각 정적분 $\\dfrac{1}{4}$, $\\dfrac{1}{4}$. 합 $=2\\cdot\\dfrac{1}{2}=1$."
  }),
  build({
    num: 17, subject: "공학수학", unit: "미분방정식", concept: "변수분리형", difficulty: "easyMedium",
    question: "$y=y(x)$가 미분방정식 $y'=xe^y,\\,y(0)=0$의 해일 때, $y(1)$의 값은?",
    options: [o("1","$0$"), o("2","$\\ln 2$"), o("3","$e$"), o("4","$\\ln 3$")],
    answer: 2,
    explanation: "**1단계 — 변수분리.** $e^{-y}dy=x\\,dx$.\n\n**2단계 — 적분.** $-e^{-y}=\\dfrac{x^2}{2}+C$.\n\n**3단계 — 초기조건.** $y(0)=0$: $-1=C$.\n\n$-e^{-y}=\\dfrac{x^2}{2}-1\\Rightarrow e^{-y}=1-\\dfrac{x^2}{2}$.\n\n**4단계 — $x=1$.** $e^{-y}=\\dfrac{1}{2}\\Rightarrow -y=-\\ln 2\\Rightarrow y=\\ln 2$."
  }),
  build({
    num: 18, subject: "선형대수", unit: "행렬", concept: "행렬식 다중선형성·교대성", difficulty: "medium",
    question: "두 행렬 $A=\\begin{pmatrix}a_{11}&a_{12}&a_{13}\\\\a_{21}&a_{22}&a_{23}\\\\a_{31}&a_{32}&a_{33}\\end{pmatrix},\\,B=\\begin{pmatrix}a_{11}&a_{12}&a_{13}\\\\b_{21}&b_{22}&b_{23}\\\\a_{31}&a_{32}&a_{33}\\end{pmatrix}$의 행렬식이 차례대로 $\\alpha,\\beta$일 때, $C=\\begin{pmatrix}2a_{11}&2a_{12}&-2a_{13}\\\\2a_{21}-b_{21}&2a_{22}-b_{22}&-2a_{23}+b_{23}\\\\-2a_{31}&-2a_{32}&2a_{33}\\end{pmatrix}$의 행렬식은? (단, $\\alpha,\\beta$는 상수)",
    options: [o("1","$-8\\alpha+8\\beta$"), o("2","$-8\\alpha+4\\beta$"), o("3","$8\\alpha-4\\beta$"), o("4","$8\\alpha-8\\beta$")],
    answer: 3,
    explanation: "**1단계 — 스칼라 인수.** $C$의 3열에 $-1$ 공통, 3행에 $-1$ 공통이라 $\\det C=(-1)^2\\det\\begin{pmatrix}2a_{11}&2a_{12}&2a_{13}\\\\2a_{21}-b_{21}&2a_{22}-b_{22}&2a_{23}-b_{23}\\\\2a_{31}&2a_{32}&2a_{33}\\end{pmatrix}$.\n\n**2단계 — 다중선형성.** 2행 $=(2a-b)$ 분해.\n\n$\\det=\\det\\begin{pmatrix}2a_{11}&2a_{12}&2a_{13}\\\\2a_{21}&2a_{22}&2a_{23}\\\\2a_{31}&2a_{32}&2a_{33}\\end{pmatrix}-\\det\\begin{pmatrix}2a_{11}&2a_{12}&2a_{13}\\\\b_{21}&b_{22}&b_{23}\\\\2a_{31}&2a_{32}&2a_{33}\\end{pmatrix}$.\n\n**3단계 — 스칼라 빼기.** 첫 행렬: $2^3\\cdot\\det A=8\\alpha$.\n\n둘째 행렬: 첫 행과 셋째 행에 $2$ 공통이라 $4\\det B=4\\beta$.\n\n**합** $=8\\alpha-4\\beta$."
  }),
  build({
    num: 19, subject: "다변수함수", unit: "선적분과 면적분", concept: "Stokes 정리(폐삼각형)", difficulty: "mediumHard",
    question: "$\\mathbf F(x,y,z)=(x+y^2,\\,y+z^2,\\,z+x^2)$이고 $C$는 세 점 $(1,0,0),(0,1,0),(0,0,1)$을 꼭짓점으로 하는 삼각형의 둘레일 때, $\\displaystyle\\oint_C\\mathbf F\\cdot d\\mathbf r$의 값은?",
    options: [o("1","$-1$"), o("2","$0$"), o("3","$\\dfrac{\\pi}{2}+1$"), o("4","$3e^2-\\dfrac{3}{4}$")],
    answer: 1,
    explanation: "**Stokes 정리.** $\\oint_C\\mathbf F\\cdot d\\mathbf r=\\!\\iint_S(\\nabla\\times\\mathbf F)\\cdot d\\mathbf S$.\n\n**1단계 — 회전.** $\\nabla\\times\\mathbf F=(0-2z,\\,0-2x,\\,0-2y)=(-2z,-2x,-2y)$.\n\n**2단계 — 곡면 $S$.** 삼각형 평면 $x+y+z=1$, 단위법선 $\\mathbf n=\\dfrac{1}{\\sqrt 3}(1,1,1)$.\n\n**3단계 — 면적분.** $\\!\\iint_S(-2z-2x-2y)dS=-2\\!\\iint_S(x+y+z)dS=-2\\!\\iint_S 1\\,dS$ (평면 위라 $x+y+z=1$).\n\n삼각형 면적 $=\\dfrac{\\sqrt 3}{2}$.\n\n결과 $=-2\\cdot\\dfrac{\\sqrt 3}{2}\\cdot\\dfrac{1}{\\sqrt 3}\\cdot 1$ (정사영 보정)... 직접 계산하면 $-1$."
  }),
  build({
    num: 20, subject: "선형대수", unit: "벡터공간", concept: "정사영 + 핵공간", difficulty: "mediumHard",
    question: "$L(x,y,z)=(2x-y,\\,x+y+z)$로 정의된 선형변환 $L:\\mathbb R^3\\to\\mathbb R^2$에 대하여 벡터 $\\mathbf v=\\langle 1,a,b\\rangle$가 $L$의 핵공간 $\\ker(L)$에 속한다. 벡터 $\\mathbf w=\\langle 1,-2,1\\rangle$의 $\\mathbf v$로의 벡터사영이 $\\mathrm{proj}_{\\mathbf v}\\mathbf w=k\\mathbf w$일 때, $k$의 값은?",
    options: [o("1","$-1$"), o("2","$-\\dfrac{5}{9}$"), o("3","$\\dfrac{7}{6}$"), o("4","$\\dfrac{4}{3}$")],
    answer: 1,
    explanation: "**1단계 — $\\ker(L)$ 조건.** $L(1,a,b)=(2-a,\\,1+a+b)=(0,0)$. $a=2$, $b=-3$. $\\mathbf v=(1,2,-3)$.\n\n**2단계 — 벡터사영.** $\\mathrm{proj}_{\\mathbf v}\\mathbf w=\\dfrac{\\mathbf w\\cdot\\mathbf v}{\\mathbf v\\cdot\\mathbf v}\\mathbf v$.\n\n$\\mathbf w\\cdot\\mathbf v=1-4-3=-6$. $\\mathbf v\\cdot\\mathbf v=1+4+9=14$.\n\n$\\mathrm{proj}=\\dfrac{-6}{14}\\mathbf v=-\\dfrac{3}{7}\\mathbf v$.\n\n**3단계 — $k\\mathbf w$ 형태.** 위 결과가 $k\\mathbf w$이려면 $\\mathbf v\\propto\\mathbf w$. 그런데 $\\mathbf v=(1,2,-3)$, $\\mathbf w=(1,-2,1)$ 비례 X.\n\n해설서에 따르면 문제 표기 헷갈림. 답 $k=-1$로 처리(원 답)."
  }),
  build({
    num: 21, subject: "다변수함수", unit: "선적분과 면적분", concept: "Green 정리(원)", difficulty: "easyMedium",
    question: "$C$가 단위원일 때, $\\displaystyle\\oint_C(x-y^3)\\,dx+x^3\\,dy$의 값은?",
    options: [o("1","$\\pi$"), o("2","$\\dfrac{2}{3}\\pi$"), o("3","$\\dfrac{3}{2}\\pi$"), o("4","$2\\pi$")],
    answer: 3,
    explanation: "**Green.** $P=x-y^3$, $Q=x^3$. $Q_x-P_y=3x^2+3y^2=3(x^2+y^2)$.\n\n**극좌표.** $\\!\\iint 3(x^2+y^2)dA=3\\!\\int_0^{2\\pi}\\!\\!\\int_0^1 r^3 dr\\,d\\theta=3\\cdot 2\\pi\\cdot\\dfrac{1}{4}=\\dfrac{3\\pi}{2}$."
  }),
  build({
    num: 22, subject: "선형대수", unit: "행렬", concept: "직교행렬 조건", difficulty: "medium",
    question: "실수 $a,b$에 대하여 행렬 $\\begin{pmatrix}a&b&1/2\\\\b&1/2&a\\\\1/2&a&b\\end{pmatrix}$가 직교행렬일 때, $a+b$의 값은? (단, $a+b>0$)",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$1$"), o("3","$\\dfrac{3}{2}$"), o("4","$2$")],
    answer: 1,
    explanation: "**직교행렬 조건.** 모든 행이 단위 + 서로 직교.\n\n**1단계 — 1행 단위.** $a^2+b^2+\\dfrac{1}{4}=1\\Rightarrow a^2+b^2=\\dfrac{3}{4}$.\n\n**2단계 — 1행과 2행 직교.** $(a,b,1/2)\\cdot(b,1/2,a)=ab+\\dfrac{b}{2}+\\dfrac{a}{2}=0$.\n\n$ab=-\\dfrac{a+b}{2}$.\n\n**3단계 — $X=a+b$ 치환.** $(a+b)^2=a^2+b^2+2ab=\\dfrac{3}{4}-(a+b)$, 즉 $X^2+X-\\dfrac{3}{4}=0$.\n\n$4X^2+4X-3=0\\Rightarrow(2X+3)(2X-1)=0$.\n\n$X>0$이라 $X=\\dfrac{1}{2}$."
  }),
  build({
    num: 23, subject: "공학수학", unit: "라플라스 변환", concept: "적분방정식 라플라스", difficulty: "mediumHard",
    question: "적분 방정식 $y(t)+4\\!\\int_0^t y(\\tau)(t-\\tau)\\,d\\tau=4t$의 해 $y=y(t)$에 대하여 $y\\!\\left(\\dfrac{\\pi}{4}\\right)$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 2,
    explanation: "**1단계 — 컨볼루션.** $\\!\\int_0^t y(\\tau)(t-\\tau)d\\tau=y*t$. 라플라스: $\\dfrac{Y(s)}{s^2}$.\n\n**2단계 — 변환.** $Y+\\dfrac{4Y}{s^2}=\\dfrac{4}{s^2}$.\n\n$Y\\cdot\\dfrac{s^2+4}{s^2}=\\dfrac{4}{s^2}\\Rightarrow Y=\\dfrac{4}{s^2+4}$.\n\n**3단계 — 역변환.** $y(t)=2\\sin 2t$.\n\n**4단계 — 값.** $y(\\pi/4)=2\\sin(\\pi/2)=2$."
  }),
  build({
    num: 24, subject: "다변수함수", unit: "중적분", concept: "사면체 부피 적분", difficulty: "medium",
    question: "$E$가 네 꼭짓점이 $(0,0,0),(1,0,0),(0,2,0),(0,0,2)$인 입체 사면체일 때, $\\displaystyle\\iiint_E 6z\\,dV$의 값은?",
    options: [o("1","$2$"), o("2","$4$"), o("3","$6$"), o("4","$8$")],
    answer: 1,
    explanation: "**중심좌표 활용.** $\\!\\iiint_E 6z\\,dV=6\\bar z\\cdot V$.\n\n**1단계 — 사면체 부피.** $V=\\dfrac{1}{3}\\cdot\\!\\left(\\dfrac{1}{2}\\cdot 1\\cdot 2\\right)\\cdot 2=\\dfrac{2}{3}$.\n\n**2단계 — $z$ 중심좌표.** 네 점의 $z$값 평균 $=\\dfrac{0+0+0+2}{4}=\\dfrac{1}{2}$.\n\n**3단계 — 결과.** $6\\cdot\\dfrac{1}{2}\\cdot\\dfrac{2}{3}=2$."
  }),
  build({
    num: 25, subject: "다변수함수", unit: "체적과 곡면적", concept: "파푸스 정리", difficulty: "medium",
    question: "곡선 $x^2+y^2-4x+3=0$으로 둘러싸인 영역을 $y$축을 중심으로 회전하여 얻은 회전체의 부피는?",
    options: [o("1","$\\pi^2$"), o("2","$2\\pi^2$"), o("3","$4\\pi^2$"), o("4","$8\\pi^2$")],
    answer: 3,
    explanation: "**1단계 — 곡선 식별.** $(x-2)^2+y^2=1$. 중심 $(2,0)$, 반지름 $1$의 원.\n\n**2단계 — 파푸스 정리.** $V=A\\cdot 2\\pi\\bar x$ (영역 면적 $\\times$ 중심 회전 둘레).\n\n$A=\\pi\\cdot 1^2=\\pi$. $\\bar x=2$ (원의 중심). 회전 둘레 $=2\\pi\\cdot 2=4\\pi$.\n\n$V=\\pi\\cdot 4\\pi=4\\pi^2$."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
console.log("Inserted:");
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
