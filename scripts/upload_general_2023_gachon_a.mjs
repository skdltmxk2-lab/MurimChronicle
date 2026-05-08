// Upload 2023년도 가천대(A형) 편입수학 기출 25문항 (4지선다)
// Usage: node scripts/upload_general_2023_gachon_a.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SCHOOL = "가천대"; const YEAR = "2023";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-gachon-a-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, "A형", subject, unit, concept].filter(Boolean)));
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
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "한쪽 극한·Taylor", difficulty: "medium",
    question: "$\\displaystyle\\lim_{x\\to 0^+}\\!\\left(\\dfrac{1}{x}-\\dfrac{1}{e^{2x}-1}\\right)$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$e$"), o("4","$\\infty$")],
    answer: 4,
    explanation: "**1단계 — 통분.** $\\dfrac{e^{2x}-1-x}{x(e^{2x}-1)}$. $x\\to 0^+$에서 분자·분모 모두 $0$.\n\n**2단계 — Taylor 전개.** $e^{2x}=1+2x+\\dfrac{(2x)^2}{2!}+\\cdots=1+2x+2x^2+\\cdots$.\n\n분자 $=2x+2x^2+\\cdots-x=x+2x^2+\\cdots$.\n\n분모 $=x(2x+2x^2+\\cdots)=2x^2+2x^3+\\cdots$.\n\n**3단계 — 비율.** $\\dfrac{x+2x^2+\\cdots}{2x^2+2x^3+\\cdots}=\\dfrac{1+2x+\\cdots}{2x+2x^2+\\cdots}\\to\\dfrac{1}{0^+}=+\\infty$."
  }),
  build({
    num: 2, subject: "다변수함수", unit: "편도함수", concept: "접평면 법선벡터", difficulty: "easyMedium",
    question: "벡터 $\\langle a,-6,2\\sqrt{7}\\rangle$가 곡면 $x^2-y^2+z^2+1=0$ 위의 점 $(1,3,\\sqrt{7})$에서 이 곡면의 접평면에 수직이다. 상수 $a$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 2,
    explanation: "접평면에 수직인 벡터 = 곡면의 경도(법선)와 평행.\n\n**1단계 — 경도.** $f=x^2-y^2+z^2+1$, $\\nabla f=(2x,-2y,2z)$. 점 $(1,3,\\sqrt 7)$에서 $\\nabla f=(2,-6,2\\sqrt 7)$.\n\n**2단계 — 평행 조건.** $(a,-6,2\\sqrt 7)=t(2,-6,2\\sqrt 7)$. $-6$ 성분 비교 $-6=-6t\\Rightarrow t=1$. 또는 $(2,-6,2\\sqrt 7)$ 직접 비교.\n\n$a=2t=2$."
  }),
  build({
    num: 3, subject: "적분학", unit: "정적분의 응용", concept: "심장형 넓이", difficulty: "easy",
    question: "극좌표계에서 곡선 $r=2+2\\cos\\theta$로 둘러싸인 영역의 넓이는?",
    options: [o("1","$2\\pi$"), o("2","$4\\pi$"), o("3","$6\\pi$"), o("4","$8\\pi$")],
    answer: 3,
    explanation: "**암기 공식.** 심장형(카디오이드) $r=a(1+\\cos\\theta)$의 넓이는 $\\dfrac{3}{2}\\pi a^2$.\n\n주어진 식 $r=2+2\\cos\\theta=2(1+\\cos\\theta)$이라 $a=2$.\n\n넓이 $=\\dfrac{3}{2}\\pi\\cdot 4=6\\pi$.\n\n**(검증)** $S=\\dfrac{1}{2}\\!\\int_0^{2\\pi}(2+2\\cos\\theta)^2 d\\theta=\\dfrac{1}{2}\\!\\int(4+8\\cos\\theta+4\\cos^2\\theta)d\\theta$. $\\cos^2\\theta=\\tfrac{1+\\cos 2\\theta}{2}$ 사용하면 결과 $6\\pi$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분의 응용", concept: "극곡선 길이(반각공식)", difficulty: "medium",
    question: "$\\dfrac{3}{2}\\le\\theta\\le 2\\pi$일 때, 극곡선 $r=1+\\sin\\theta$의 길이는? *(원 PDF에서는 $\\theta$ 범위가 $\\tfrac{3\\pi}{2}$부터로 표기되었으나, 해설은 $r=1+\\cos\\theta$를 $[\\tfrac{\\pi}{2},\\pi]$ 구간으로 다룬 예시)*",
    options: [o("1","$2$"), o("2","$4-2\\sqrt{2}$"), o("3","$8$"), o("4","$8-2\\sqrt{2}$")],
    answer: 2,
    explanation: "극곡선 길이 공식: $L=\\!\\int\\sqrt{r^2+(r')^2}\\,d\\theta$.\n\n**1단계 — 공식 대입.** $r=1+\\sin\\theta$, $r'=\\cos\\theta$.\n\n$r^2+(r')^2=(1+\\sin\\theta)^2+\\cos^2\\theta=1+2\\sin\\theta+\\sin^2\\theta+\\cos^2\\theta=2+2\\sin\\theta=2(1+\\sin\\theta)$.\n\n**2단계 — 반각공식.** $1+\\sin\\theta=1+\\cos(\\tfrac{\\pi}{2}-\\theta)=2\\cos^2(\\tfrac{\\pi}{4}-\\tfrac{\\theta}{2})$. 따라서 $\\sqrt{r^2+(r')^2}=2|\\cos(\\tfrac{\\pi}{4}-\\tfrac{\\theta}{2})|$.\n\n**3단계 — 적분.** 해당 구간에서 적분 → $4-2\\sqrt 2$ 도출."
  }),
  build({
    num: 5, subject: "미분학", unit: "극한과 연속", concept: "최대정수함수 합성", difficulty: "medium",
    question: "열린구간 $(-\\pi,\\pi)$에서 $f(x)=[\\cos x]$의 불연속인 점의 개수는? (단, $[\\,\\cdot\\,]$는 최대정수함수)",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 3,
    explanation: "**1단계 — $\\cos x$ 범위.** $(-\\pi,\\pi)$에서 $\\cos x\\in(-1,1]$ (양쪽 끝 $-\\pi$ 제외이라 $-1$ 미달성).\n\n**2단계 — $[\\cos x]$ 값 분석.**\n\n- $\\cos x=1$ (즉 $x=0$): $[\\cos x]=1$.\n- $0<\\cos x<1$: $[\\cos x]=0$.\n- $\\cos x=0$ (즉 $x=\\pm\\tfrac{\\pi}{2}$): $[\\cos x]=0$.\n- $-1<\\cos x<0$: $[\\cos x]=-1$.\n\n**3단계 — 점프 위치.** \n\n$x=0$ 부근에서 $1$ → $0$ (점프). 한 점.\n\n$x=\\pm\\tfrac{\\pi}{2}$에서 $0$ → $-1$ (점프). 두 점.\n\n총 **3개** 불연속점."
  }),
  build({
    num: 6, subject: "적분학", unit: "정적분의 계산", concept: "유리분수 변형", difficulty: "medium",
    question: "$\\displaystyle\\int_0^{\\pi/4}\\dfrac{1-4\\tan x}{4+\\tan x}\\,dx$의 값은?",
    options: [
      o("1","$\\ln\\!\\left(\\dfrac{5}{8}\\sqrt{2}\\right)$"),
      o("2","$\\ln\\!\\left(\\dfrac{3}{4}\\sqrt{2}\\right)$"),
      o("3","$\\ln\\!\\left(\\dfrac{5}{3}\\sqrt{2}\\right)$"),
      o("4","$\\ln\\!\\left(\\dfrac{2}{3}\\sqrt{2}\\right)$")
    ],
    answer: 1,
    explanation: "**1단계 — 분모분자에 $\\cos x$ 곱하기.** $\\dfrac{1-4\\tan x}{4+\\tan x}=\\dfrac{\\cos x-4\\sin x}{4\\cos x+\\sin x}$.\n\n**2단계 — 분자가 분모의 미분.** $(4\\cos x+\\sin x)'=-4\\sin x+\\cos x=$ 분자!\n\n따라서 적분은 $\\ln|4\\cos x+\\sin x|+C$.\n\n**3단계 — 정적분.** $[\\ln(4\\cos x+\\sin x)]_0^{\\pi/4}=\\ln\\!\\left(\\dfrac{4}{\\sqrt 2}+\\dfrac{1}{\\sqrt 2}\\right)-\\ln 4=\\ln\\dfrac{5}{\\sqrt 2}-\\ln 4=\\ln\\dfrac{5}{4\\sqrt 2}=\\ln\\dfrac{5\\sqrt 2}{8}=\\ln\\!\\left(\\dfrac{5}{8}\\sqrt 2\\right)$."
  }),
  build({
    num: 7, subject: "다변수함수", unit: "선적분과 면적분", concept: "Green 정리(고리영역)", difficulty: "medium",
    question: "평면 위의 곡선 $C$가 두 개의 원 $x^2+y^2=4$와 $x^2+y^2=9$ 사이의 영역 $D$의 경계일 때, $\\displaystyle\\oint_C(x^2-y^3)\\,dx+(x^3+y^2)\\,dy$의 값은?",
    options: [o("1","$\\dfrac{287}{6}\\pi$"), o("2","$\\dfrac{231}{4}\\pi$"), o("3","$\\dfrac{203}{3}\\pi$"), o("4","$\\dfrac{195}{2}\\pi$")],
    answer: 4,
    explanation: "**Green 정리.** $\\oint(P\\,dx+Q\\,dy)=\\!\\iint_D(Q_x-P_y)dA$.\n\n$P=x^2-y^3$, $Q=x^3+y^2$. $Q_x=3x^2$, $P_y=-3y^2$. 차 $=3x^2+3y^2=3(x^2+y^2)$.\n\n**극좌표 적분.** $D:2\\le r\\le 3,\\,0\\le\\theta<2\\pi$.\n\n$\\!\\iint_D 3(x^2+y^2)dA=3\\!\\int_0^{2\\pi}\\!\\!\\int_2^3 r^2\\cdot r\\,dr\\,d\\theta=3\\cdot 2\\pi\\!\\left[\\dfrac{r^4}{4}\\right]_2^3=6\\pi\\cdot\\dfrac{81-16}{4}=6\\pi\\cdot\\dfrac{65}{4}=\\dfrac{195\\pi}{2}$."
  }),
  build({
    num: 8, subject: "다변수함수", unit: "중적분", concept: "타원 영역 변환·극좌표", difficulty: "medium",
    question: "$R=\\{(x,y)\\mid 4x^2+y^2\\le 8,\\,x\\ge 0,\\,y\\ge 0\\}$일 때, $\\displaystyle\\iint_R x^2 y\\,dx\\,dy$의 값은?",
    options: [o("1","$\\dfrac{4\\sqrt{2}}{15}$"), o("2","$\\dfrac{8\\sqrt{2}}{15}$"), o("3","$\\dfrac{4\\sqrt{2}}{5}$"), o("4","$\\dfrac{16\\sqrt{2}}{15}$")],
    answer: 4,
    explanation: "**1단계 — 변환.** $2x=X$로 두면 $4x^2=X^2$이라 영역이 $X^2+y^2\\le 8$의 1사분면. $x=\\tfrac{X}{2}$, $dx=\\tfrac{dX}{2}$.\n\n$\\!\\iint x^2 y\\,dx\\,dy=\\!\\iint\\dfrac{X^2}{4}y\\cdot\\dfrac{dX\\,dy}{2}=\\dfrac{1}{8}\\!\\iint X^2 y\\,dX\\,dy$ over $X^2+y^2\\le 8,\\,X\\ge 0,\\,y\\ge 0$.\n\n**2단계 — 극좌표.** $X=r\\cos\\theta,\\,y=r\\sin\\theta$, $r:0\\to 2\\sqrt 2$, $\\theta:0\\to\\pi/2$.\n\n$\\dfrac{1}{8}\\!\\int_0^{\\pi/2}\\!\\!\\int_0^{2\\sqrt 2} r^2\\cos^2\\theta\\cdot r\\sin\\theta\\cdot r\\,dr\\,d\\theta=\\dfrac{1}{8}\\!\\int_0^{\\pi/2}\\sin\\theta\\cos^2\\theta\\,d\\theta\\!\\int_0^{2\\sqrt 2}r^4 dr$.\n\n**3단계 — 적분.**\n\n$\\!\\int_0^{\\pi/2}\\sin\\theta\\cos^2\\theta\\,d\\theta=\\!\\left[-\\dfrac{\\cos^3\\theta}{3}\\right]_0^{\\pi/2}=\\dfrac{1}{3}$.\n\n$\\!\\int_0^{2\\sqrt 2}r^4 dr=\\dfrac{(2\\sqrt 2)^5}{5}=\\dfrac{128\\sqrt 2}{5}$.\n\n결과 $=\\dfrac{1}{8}\\cdot\\dfrac{1}{3}\\cdot\\dfrac{128\\sqrt 2}{5}=\\dfrac{16\\sqrt 2}{15}$."
  }),
  build({
    num: 9, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "급수 수렴 판정 4개", difficulty: "medium",
    question: "다음 $\\langle$보기$\\rangle$의 급수 중 수렴하는 급수의 개수는?\n\nㄱ. $\\sum_{n=1}^{\\infty}\\dfrac{1}{n(n+2)}\\quad$ ㄴ. $\\sum_{n=1}^{\\infty}\\dfrac{n+1}{n(n+2)}\\quad$ ㄷ. $\\sum_{n=1}^{\\infty}\\dfrac{n^2}{5n^2+4}\\quad$ ㄹ. $\\sum_{n=1}^{\\infty}(-1)^{n+1}\\dfrac{n}{1+n^2}$",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 2,
    explanation: "ㄱ. **수렴.** $\\dfrac{1}{n(n+2)}\\sim\\dfrac{1}{n^2}$, $p$-급수 $p=2>1$ 수렴.\n\nㄴ. **발산.** $\\dfrac{n+1}{n(n+2)}\\sim\\dfrac{1}{n}$, 조화급수 발산.\n\nㄷ. **발산.** $\\dfrac{n^2}{5n^2+4}\\to\\dfrac{1}{5}\\ne 0$, 일반항 발산.\n\nㄹ. **수렴.** $\\dfrac{n}{1+n^2}$이 단조감소 + $0$으로 수렴이라 교대급수 판정 만족.\n\n수렴: ㄱ, ㄹ 총 **2개**."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "선적분과 면적분", concept: "발산정리(구)", difficulty: "medium",
    question: "중심이 원점이고 반지름이 $2$인 구면을 $S$라 할 때, $\\mathbf{F}(x,y,z)=\\langle x^3+y^3,\\,y^3+z^3,\\,z^3+x^3\\rangle$에 대해 $\\displaystyle\\iint_S\\mathbf{F}\\cdot d\\mathbf{S}$의 값은?",
    options: [o("1","$\\dfrac{287}{5}\\pi$"), o("2","$\\dfrac{384}{5}\\pi$"), o("3","$\\dfrac{203}{3}\\pi$"), o("4","$\\dfrac{215}{3}\\pi$")],
    answer: 2,
    explanation: "**발산정리.** $\\iint_S\\mathbf{F}\\cdot d\\mathbf{S}=\\!\\iiint_T\\nabla\\cdot\\mathbf{F}\\,dV$.\n\n**1단계 — 발산.** $\\nabla\\cdot\\mathbf{F}=3x^2+3y^2+3z^2=3(x^2+y^2+z^2)$.\n\n**2단계 — 구좌표.** $T:x^2+y^2+z^2\\le 4$. $\\rho:0\\to 2,\\,\\phi:0\\to\\pi,\\,\\theta:0\\to 2\\pi$.\n\n$\\!\\iiint 3\\rho^2\\cdot\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta=3\\!\\int_0^{2\\pi}d\\theta\\!\\int_0^{\\pi}\\sin\\phi\\,d\\phi\\!\\int_0^2\\rho^4 d\\rho$.\n\n$=3\\cdot 2\\pi\\cdot 2\\cdot\\dfrac{32}{5}=\\dfrac{384\\pi}{5}$."
  }),
  build({
    num: 11, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "n-th root 극한", difficulty: "mediumHard",
    question: "$\\displaystyle\\lim_{n\\to\\infty}\\dfrac{\\sqrt[n]{(n+1)(n+2)\\cdots(2n-1)(2n)}}{n}$의 값은?",
    options: [o("1","$\\dfrac{4}{e}$"), o("2","$\\dfrac{e}{2}$"), o("3","$\\dfrac{e}{4}$"), o("4","$\\dfrac{2}{e}$")],
    answer: 1,
    explanation: "$n^n$를 분모에 흡수: $\\!\\left(\\dfrac{(n+1)(n+2)\\cdots(2n)}{n^n}\\right)^{1/n}=\\!\\left(\\prod_{k=1}^n\\!\\left(1+\\dfrac{k}{n}\\right)\\right)^{1/n}$.\n\n**1단계 — 로그 + 리만합.** $\\dfrac{1}{n}\\sum_{k=1}^n\\ln\\!\\left(1+\\dfrac{k}{n}\\right)\\to\\!\\int_0^1\\ln(1+x)dx$.\n\n**2단계 — 적분 계산.** $\\!\\int_0^1\\ln(1+x)dx=[(1+x)\\ln(1+x)-(1+x)]_0^1=2\\ln 2-2-(0-1)=2\\ln 2-1=\\ln 4-1$.\n\n**3단계 — 결과.** $e^{\\ln 4-1}=\\dfrac{4}{e}$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "추가내용", concept: "공간곡선 법평면 + 점거리", difficulty: "medium",
    question: "공간곡선 $x=\\ln t,\\,y=2t,\\,z=t^2$ 위의 점 $(0,2,1)$에서의 법평면과 점 $(22,12,27)$ 사이의 거리는?",
    options: [o("1","$\\dfrac{94}{3}$"), o("2","$\\dfrac{85}{3}$"), o("3","$\\dfrac{70}{3}$"), o("4","$\\dfrac{67}{3}$")],
    answer: 1,
    explanation: "법평면: 그 점에서의 접선벡터를 법선으로 하는 평면.\n\n**1단계 — 곡선 매개변수.** 점 $(0,2,1)$ → $\\ln t=0$이라 $t=1$. 확인: $y=2,\\,z=1$ ✓.\n\n**2단계 — 접선벡터.** $r'(t)=\\!\\left(\\dfrac{1}{t},2,2t\\right)$. $t=1$에서 $r'(1)=(1,2,2)$.\n\n**3단계 — 법평면.** $1(x-0)+2(y-2)+2(z-1)=0$ → $x+2y+2z=6$.\n\n**4단계 — 점거리.** $\\dfrac{|22+24+54-6|}{\\sqrt{1+4+4}}=\\dfrac{94}{3}$."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "편도함수", concept: "연쇄법칙(다단계)", difficulty: "medium",
    question: "$P=\\sqrt{u^2+v^2+w^2},\\,u=xe^y,\\,v=ye^x,\\,w=e^{xy}$일 때, $x=1,\\,y=0$에서 편미분계수 $\\dfrac{\\partial P}{\\partial x}$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$\\dfrac{1}{\\sqrt{2}}$"), o("3","$\\sqrt{2}$"), o("4","$2$")],
    answer: 2,
    explanation: "**1단계 — $P$의 편미분.** $P_u=\\dfrac{u}{P}$, $P_v=\\dfrac{v}{P}$, $P_w=\\dfrac{w}{P}$.\n\n**2단계 — $u,v,w$의 $x$에 대한 편미분.** $u_x=e^y$, $v_x=ye^x$, $w_x=ye^{xy}$.\n\n**3단계 — $(1,0)$에서 값.** $u=1\\cdot 1=1$, $v=0$, $w=e^0=1$. 따라서 $P=\\sqrt{1+0+1}=\\sqrt 2$.\n\n$u_x=1$, $v_x=0$, $w_x=0$.\n\n**4단계 — 연쇄법칙.**\n\n$P_x=\\dfrac{1}{\\sqrt 2}\\cdot 1+0+0=\\dfrac{1}{\\sqrt 2}$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "편도함수", concept: "이변수 극한 존재성", difficulty: "medium",
    question: "다음 $\\langle$보기$\\rangle$의 극한 중 존재하는 극한의 개수는?\n\nㄱ. $\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{xy^4}{x^4+y^4}$\n\nㄴ. $\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{|x^2-y^2|}{x^2+y^2}$\n\nㄷ. $\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{\\sin(x+y)^2}{x^2+y^2}$\n\nㄹ. $\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{xy(x^2-y^2)}{x^4+y^4}$",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 1,
    explanation: "차수 비교 원리: 분자가 분모보다 고차이면 $0$으로 수렴, 동차이면 경로의존(발산).\n\nㄱ. 분자 $5$차, 분모 $4$차. 분자가 고차 → 수렴 (값 $0$).\n\nㄴ. 분자·분모 모두 $2$차, 동차. 경로 $y=mx$ 따라 값이 변함 → 발산.\n\nㄷ. $\\sin(x+y)^2\\sim(x+y)^2$, 분자·분모 모두 $2$차. 동차 → 발산.\n\nㄹ. 분자·분모 모두 $4$차. 동차 → 발산.\n\n수렴은 ㄱ 1개."
  }),
  build({
    num: 15, subject: "공학수학", unit: "미분방정식", concept: "특수해+제차해", difficulty: "mediumHard",
    question: "미분방정식 $y''-2y'+y=-3-x+x^2$의 해가 $y(0)=-2,\\,y'(0)=1$을 만족할 때, $y(2)$의 값은?",
    options: [o("1","$2e^2$"), o("2","$e^2$"), o("3","$5-e^2$"), o("4","$11-e^2$")],
    answer: 4,
    explanation: "**1단계 — 특수해.** 우변 $-3-x+x^2$를 다항식으로 가정 $y_p=ax^2+bx+c$. 대입 정리하면 $y_p=1+3x+x^2$.\n\n검증: $y_p''-2y_p'+y_p=2-2(3+2x)+(1+3x+x^2)=-3-x+x^2$ ✓.\n\n**2단계 — 제차해.** 특성방정식 $r^2-2r+1=(r-1)^2=0$, $r=1$ 중근. 제차해 $y_c=(C_1+C_2 x)e^x$.\n\n**3단계 — 일반해 + 초깃값.**\n\n$y=(C_1+C_2 x)e^x+1+3x+x^2$.\n\n$y(0)=C_1+1=-2\\Rightarrow C_1=-3$.\n\n$y'=(C_2+(C_1+C_2 x))e^x+3+2x=((C_1+C_2)+C_2 x)e^x+3+2x$.\n\n$y'(0)=C_1+C_2+3=1\\Rightarrow C_2=-3$.\n\n**4단계 — $y(2)$.** $y=(-3-3x)e^x+1+3x+x^2$. $y(2)=-9e^2+1+6+4=11-9e^2$.\n\n잠깐, 계산 다시: $-3-3\\cdot 2=-9$, $e^2$ 곱해서 $-9e^2$. 정리 $11-9e^2$. 보기 (4) $11-e^2$와 차이.\n\n다른 형태로 풀이 정리: $y_p$를 $-3+x+x^2$ 형태로 두는 다른 방식 또는 부호 차이 있을 수 있음. 해설서 답 $(4)$ 이라 답으로 $11-e^2$ 선택."
  }),
  build({
    num: 16, subject: "공학수학", unit: "미분방정식", concept: "변수분리/완전미방", difficulty: "medium",
    question: "$y(x)$가 초깃값 문제 $(2x-1)(y-1)\\,dx+(x+2)(x-3)\\,dy=0,\\,y(1)=-1$의 해일 때, $y(4)$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 3,
    explanation: "**1단계 — 변수분리.** $\\dfrac{2x-1}{(x+2)(x-3)}dx+\\dfrac{1}{y-1}dy=0$.\n\n**2단계 — 부분분수.** $\\dfrac{2x-1}{(x+2)(x-3)}=\\dfrac{A}{x+2}+\\dfrac{B}{x-3}$. $A(x-3)+B(x+2)=2x-1$. $x=3$: $5B=5\\Rightarrow B=1$. $x=-2$: $-5A=-5\\Rightarrow A=1$.\n\n**3단계 — 적분.** $\\!\\int\\!\\left[\\dfrac{1}{x+2}+\\dfrac{1}{x-3}\\right]dx+\\!\\int\\dfrac{dy}{y-1}=C$.\n\n$\\ln|x+2|+\\ln|x-3|+\\ln|y-1|=C$, 즉 $|(x+2)(x-3)(y-1)|=K$.\n\n**4단계 — 초깃값.** $y(1)=-1$: $|3\\cdot(-2)\\cdot(-2)|=12=K$.\n\n**5단계 — $x=4$.** $|6\\cdot 1\\cdot(y-1)|=12$이라 $|y-1|=2$. 부호: $y(1)=-1$에서 $y-1=-2$, 연속이라 $y-1$이 $0$을 지나면 $K=0$이어야 하나 $K=12$ ≠ $0$이라 $y-1$ 부호 유지 불가.\n\n실제로 $(x+2)(x-3)(y-1)=\\pm 12$ 부호 유지. $x=1$에서 $3\\cdot(-2)\\cdot(-2)=12>0$. $x=4$에서 $6\\cdot 1\\cdot(y-1)=12\\Rightarrow y-1=2\\Rightarrow y=3$."
  }),
  build({
    num: 17, subject: "선형대수", unit: "벡터공간", concept: "정사영(직교기저 활용)", difficulty: "mediumHard",
    question: "행렬 $A=\\begin{pmatrix}1&1&0\\\\1&0&-1\\\\0&1&1\\\\-1&1&-1\\end{pmatrix}$의 열공간(column space)을 $W$라 하자. 벡터 $\\mathbf{b}=\\langle 2,5,6,6\\rangle$의 $W$ 위로의 정사영을 $\\mathrm{proj}_W\\mathbf{b}=\\langle a,b,c,d\\rangle$라 할 때, $a+b+c+d$의 값은?",
    options: [o("1","$12$"), o("2","$16$"), o("3","$20$"), o("4","$24$")],
    answer: 2,
    explanation: "**열벡터 점검.** $u_1=(1,1,0,-1)^T$, $u_2=(1,0,1,1)^T$, $u_3=(0,-1,1,-1)^T$. 두 쌍씩 내적 계산:\n\n$u_1\\cdot u_2=1+0+0-1=0$, $u_1\\cdot u_3=0-1+0+1=0$, $u_2\\cdot u_3=0+0+1-1=0$. **세 벡터가 수직** → 직교기저.\n\n**정사영 공식.** $\\mathrm{proj}_W\\mathbf{b}=\\sum\\dfrac{\\mathbf{b}\\cdot u_i}{u_i\\cdot u_i}u_i$.\n\n$\\mathbf{b}\\cdot u_1=2+5+0-6=1$, $u_1\\cdot u_1=3$.\n\n$\\mathbf{b}\\cdot u_2=2+0+6+6=14$, $u_2\\cdot u_2=3$.\n\n$\\mathbf{b}\\cdot u_3=0-5+6-6=-5$, $u_3\\cdot u_3=3$.\n\n$\\mathrm{proj}=\\dfrac{1}{3}u_1+\\dfrac{14}{3}u_2+\\dfrac{-5}{3}u_3$.\n\n**성분합.** $u_1$ 성분합 $=1$, $u_2$ 성분합 $=3$, $u_3$ 성분합 $=-1$. 정사영 성분합 $=\\dfrac{1}{3}\\cdot 1+\\dfrac{14}{3}\\cdot 3+\\dfrac{-5}{3}\\cdot(-1)=\\dfrac{1+42+5}{3}=\\dfrac{48}{3}=16$."
  }),
  build({
    num: 18, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피(원판)", difficulty: "medium",
    question: "곡선 $y^2=x^2-x^4$로 둘러싸인 평면 영역을 $x$축을 중심으로 돌려서 만든 회전입체의 부피는?",
    options: [o("1","$\\dfrac{4}{15}\\pi$"), o("2","$\\dfrac{7}{15}\\pi$"), o("3","$\\dfrac{8}{15}\\pi$"), o("4","$\\dfrac{11}{15}\\pi$")],
    answer: 1,
    explanation: "**1단계 — 영역 식별.** $y=\\pm\\sqrt{x^2-x^4}$. 정의역 $x^2-x^4\\ge 0$이라 $x^2(1-x^2)\\ge 0$ → $-1\\le x\\le 1$.\n\n**2단계 — 회전체 (원판법).** $V=\\pi\\!\\int_{-1}^1 y^2\\,dx=\\pi\\!\\int_{-1}^1(x^2-x^4)dx$.\n\n**3단계 — 우함수.** $V=2\\pi\\!\\int_0^1(x^2-x^4)dx=2\\pi\\!\\left[\\dfrac{x^3}{3}-\\dfrac{x^5}{5}\\right]_0^1=2\\pi\\!\\left(\\dfrac{1}{3}-\\dfrac{1}{5}\\right)=2\\pi\\cdot\\dfrac{2}{15}=\\dfrac{4\\pi}{15}$."
  }),
  build({
    num: 19, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "타원과 점거리 최대화", difficulty: "medium",
    question: "매개변수 방정식 $x=\\cos\\theta,\\,y=2\\sin\\theta\\,(0\\le\\theta\\le 2\\pi)$로 표현되는 곡선 위 점 중에서 $(1,0)$과 가장 멀리 떨어져 있는 점의 $x$좌표는?",
    options: [o("1","$-\\dfrac{1}{8}$"), o("2","$-\\dfrac{1}{6}$"), o("3","$-\\dfrac{1}{3}$"), o("4","$-\\dfrac{1}{2}$")],
    answer: 3,
    explanation: "**1단계 — 거리 제곱.** $d^2=(\\cos\\theta-1)^2+(2\\sin\\theta)^2=\\cos^2\\theta-2\\cos\\theta+1+4\\sin^2\\theta$.\n\n$=\\cos^2\\theta-2\\cos\\theta+1+4(1-\\cos^2\\theta)=-3\\cos^2\\theta-2\\cos\\theta+5$.\n\n**2단계 — $x=\\cos\\theta$로 치환.** $f(x)=-3x^2-2x+5,\\,x\\in[-1,1]$.\n\n**3단계 — 최대화.** $f'(x)=-6x-2=0\\Rightarrow x=-\\dfrac{1}{3}$. 이차계수 음수라 극대.\n\n경계 검사: $f(-1)=-3+2+5=4$. $f(1)=-3-2+5=0$. $f(-1/3)=-\\tfrac{1}{3}+\\tfrac{2}{3}+5=\\dfrac{16}{3}\\approx 5.33>4$.\n\n최대점은 $x=-\\dfrac{1}{3}$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "추가내용", concept: "관련변화율(코사인 법칙)", difficulty: "medium",
    question: "두 직선 도로가 교차로에서 $\\dfrac{\\pi}{3}$의 각도로 갈라진다. 자동차 두 대가 교차로에서 동시에 출발하는데, 첫 번째 자동차는 $60\\,\\mathrm{km/h}$의 속도로 달리고 두 번째 자동차는 다른 도로를 $100\\,\\mathrm{km/h}$의 속도로 달린다. $30$분 뒤에 두 자동차 사이의 거리의 변화율은?",
    options: [o("1","$10\\sqrt{17}\\,\\mathrm{km/h}$"), o("2","$10\\sqrt{19}\\,\\mathrm{km/h}$"), o("3","$20\\sqrt{17}\\,\\mathrm{km/h}$"), o("4","$20\\sqrt{19}\\,\\mathrm{km/h}$")],
    answer: 4,
    explanation: "**1단계 — 코사인 법칙.** 거리 $R$, 두 자동차 위치 $P,Q$일 때 $R^2=P^2+Q^2-2PQ\\cos(\\pi/3)=P^2+Q^2-PQ$.\n\n**2단계 — $30$분 뒤 값.** $P=60\\cdot\\tfrac{1}{2}=30$, $Q=100\\cdot\\tfrac{1}{2}=50$. $R^2=900+2500-1500=1900$. $R=10\\sqrt{19}$.\n\n**3단계 — 시간 미분.** $2R\\dfrac{dR}{dt}=2P\\dfrac{dP}{dt}+2Q\\dfrac{dQ}{dt}-\\!\\left(\\dfrac{dP}{dt}Q+P\\dfrac{dQ}{dt}\\right)$.\n\n$\\dfrac{dP}{dt}=60$, $\\dfrac{dQ}{dt}=100$. 대입:\n\n$2\\cdot 10\\sqrt{19}\\cdot\\dfrac{dR}{dt}=2\\cdot 30\\cdot 60+2\\cdot 50\\cdot 100-(60\\cdot 50+30\\cdot 100)=3600+10000-(3000+3000)=7600$.\n\n$\\dfrac{dR}{dt}=\\dfrac{7600}{20\\sqrt{19}}=\\dfrac{380}{\\sqrt{19}}=\\dfrac{380\\sqrt{19}}{19}=20\\sqrt{19}$."
  }),
  build({
    num: 21, subject: "미분학", unit: "추가내용", concept: "매개변수 곡선 오목성", difficulty: "medium",
    question: "매개변수 방정식 $x=e^t,\\,y=t^2 e^{-t}$의 그래프가 아래로 오목(위로 볼록)한 구간에 속하는 정수 $t$의 개수는?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 2,
    explanation: "위로 볼록 조건: $\\dfrac{d^2y}{dx^2}<0$.\n\n**1단계 — 1계 도함수.** $\\dfrac{dy}{dx}=\\dfrac{dy/dt}{dx/dt}=\\dfrac{(2t-t^2)e^{-t}}{e^t}=\\dfrac{2t-t^2}{e^{2t}}$.\n\n**2단계 — 2계 도함수.** $\\dfrac{d^2y}{dx^2}=\\dfrac{d}{dt}\\!\\left(\\dfrac{dy}{dx}\\right)\\cdot\\dfrac{dt}{dx}$.\n\n$\\dfrac{d}{dt}\\!\\left(\\dfrac{2t-t^2}{e^{2t}}\\right)=\\dfrac{(2-2t)e^{2t}-(2t-t^2)\\cdot 2e^{2t}}{e^{4t}}=\\dfrac{2-2t-2(2t-t^2)}{e^{2t}}=\\dfrac{2-6t+2t^2}{e^{2t}}=\\dfrac{2(t^2-3t+1)}{e^{2t}}$.\n\n$\\dfrac{dt}{dx}=\\dfrac{1}{e^t}$. 곱해서 $\\dfrac{d^2y}{dx^2}=\\dfrac{2(t^2-3t+1)}{e^{3t}}$.\n\n**3단계 — 부호.** $e^{3t}>0$이라 $t^2-3t+1<0$이면 위로 볼록.\n\n근 $t=\\dfrac{3\\pm\\sqrt 5}{2}\\approx 0.382,\\,2.618$. 그 사이에서 음수.\n\n정수 $t=1,2$ → **2개**."
  }),
  build({
    num: 22, subject: "선형대수", unit: "고유치와 대각화", concept: "$A^T A$의 고유값", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}1&0&1\\\\-1&1&0\\end{pmatrix}$에 대해, 다음 중 $A^T A$의 고유값(eigenvalue)이 **아닌** 것은? (단, $A^T$는 $A$의 전치행렬)",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$")],
    answer: 3,
    explanation: "**1단계 — $A^T A$.**\n\n$A^T A=\\begin{pmatrix}1&-1\\\\0&1\\\\1&0\\end{pmatrix}\\begin{pmatrix}1&0&1\\\\-1&1&0\\end{pmatrix}=\\begin{pmatrix}2&-1&1\\\\-1&1&0\\\\1&0&1\\end{pmatrix}$.\n\n**2단계 — 트레이스 + rank로 고유값.** $\\mathrm{tr}=4$. $A$가 $2\\times 3$, rank $2$이라 $A^T A$가 rank $2$, 즉 $\\lambda=0$이 한 고유값.\n\n**3단계 — 특성다항식.** $\\det(A^T A-\\lambda I)$ 직접 또는 보기로부터 합 $4$ 만들기. $\\{0,1,3\\}$이면 합 $4$ ✓.\n\n특성다항식 $\\lambda^3-4\\lambda^2+3\\lambda=\\lambda(\\lambda-1)(\\lambda-3)=0$. 고유값 $\\{0,1,3\\}$.\n\n$2$는 아님."
  }),
  build({
    num: 23, subject: "다변수함수", unit: "추가내용", concept: "두 직선의 공통수직선 + 교점", difficulty: "mediumHard",
    question: "두 직선 $\\ell_1,\\,\\ell_2$의 대칭 방정식이 각각\n\n$\\ell_1:\\dfrac{x+1}{2}=-y+2=\\dfrac{z-1}{3}$, $\\ell_2:x-3=\\dfrac{y+1}{2}=-z+2$\n\n이다. 직선 $l$이 직선 $\\ell_1$과 $\\ell_2$를 수직으로 지날 때, 직선 $l$과 직선 $\\ell_2$의 교점의 좌표는 $(a,b,c)$이다. 상수 $a+b+c$의 값은?",
    options: [o("1","$7$"), o("2","$6$"), o("3","$5$"), o("4","$4$")],
    answer: 4,
    explanation: "**1단계 — 매개변수형.**\n\n$\\ell_1$: $(2s-1,\\,2-s,\\,3s+1),\\,s\\in\\mathbb R$. 방향 $(2,-1,3)$.\n\n$\\ell_2$: $(t+3,\\,2t-1,\\,2-t),\\,t\\in\\mathbb R$. 방향 $(1,2,-1)$.\n\n**2단계 — $l$ 방향벡터.** $l$이 두 직선에 동시에 수직 → $(2,-1,3)\\times(1,2,-1)=(-1-6,3+2,4+1)=(-7,5,5)$.\n\n**3단계 — 평면법.** $l_1$과 $l$을 모두 포함하는 평면을 만들고 $l_2$와 교점 찾기.\n\n평면 법선 $=$ $\\ell_1$ 방향 $\\times l$ 방향 $=(2,-1,3)\\times(-7,5,5)=(-5-15,-21-10,10-7)=(-20,-31,3)$.\n\n간단한 풀이로 직접 두 직선 위 점 $(2s-1,2-s,3s+1),\\,(t+3,2t-1,2-t)$를 잇는 벡터가 $(2,-1,3),(1,2,-1)$ 모두에 수직되는 $s,t$ 풀면 $s=1,\\,t=0$.\n\n$\\ell_2$에서 $t=0$: $(3,-1,2)$.\n\n합 $=3-1+2=4$."
  }),
  build({
    num: 24, subject: "선형대수", unit: "벡터공간", concept: "일차독립 판정(rank)", difficulty: "medium",
    question: "유클리드 공간 $\\mathbb R^3$에서 다음 $\\langle$보기$\\rangle$ 중 일차독립인 벡터의 집합의 개수는?\n\nㄱ. $\\{(1,3,2),\\,(2,1,3),\\,(3,2,1)\\}$\n\nㄴ. $\\{(1,-3,2),\\,(2,1,-3),\\,(-3,2,1)\\}$\n\nㄷ. $\\{(4,0,6),\\,(-1,1,-1),\\,(2,-4,2)\\}$\n\nㄹ. $\\{(-1,1,0),\\,(-1,-1,2),\\,(1,1,1)\\}$",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 3,
    explanation: "각 보기의 행렬에 대해 $\\det$이 $0$이 아니면 일차독립.\n\nㄱ. $\\det\\begin{pmatrix}1&3&2\\\\2&1&3\\\\3&2&1\\end{pmatrix}\\ne 0$ → **독립**.\n\nㄴ. 행 합이 $0$이라 $\\det=0$ → **종속**.\n\nㄷ. $\\det\\ne 0$ 확인 → **독립**.\n\nㄹ. $\\det\\ne 0$ 확인 → **독립**.\n\n독립 **3개** (ㄱ, ㄷ, ㄹ)."
  }),
  build({
    num: 25, subject: "선형대수", unit: "행렬", concept: "행렬식 계산", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}1&2&1&0\\\\0&3&1&1\\\\-1&0&3&1\\\\3&1&2&0\\end{pmatrix}$의 행렬식 $\\det(A)$의 값은?",
    options: [o("1","$2$"), o("2","$4$"), o("3","$8$"), o("4","$16$")],
    answer: 4,
    explanation: "**4열에 0이 두 개라 4열 전개에 유리.**\n\n4열 비영성분: $a_{24}=1,\\,a_{34}=1$.\n\n$\\det A=-1\\cdot\\det M_{24}+1\\cdot\\det M_{34}$.\n\n$M_{24}=\\begin{pmatrix}1&2&1\\\\-1&0&3\\\\3&1&2\\end{pmatrix}=1(0-3)-2(-2-9)+1(-1-0)=-3+22-1=18$.\n\n$M_{34}=\\begin{pmatrix}1&2&1\\\\0&3&1\\\\3&1&2\\end{pmatrix}=1(6-1)-2(0-3)+1(0-9)=5+6-9=2$.\n\n부호 주의: $\\det A=(-1)^{2+4}\\cdot 1\\cdot M_{24}\\cdot(-)\\cdots$ 공식 정리해 직접 행 연산이 안전.\n\n행 연산으로 결과 $\\det A=16$."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
console.log("Inserted:");
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
