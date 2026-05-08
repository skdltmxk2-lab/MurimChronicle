// Upload 2025년도 숭실대 편입수학 기출 25문항 (4지선다, 26~50번)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SCHOOL = "숭실대"; const YEAR = "2025";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-soongsil-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "도함수", concept: "도함수 정의", difficulty: "easyMedium",
    question: "극한 $\\displaystyle\\lim_{h\\to 0}\\dfrac{1}{h}\\!\\left[8\\!\\left(\\dfrac{1}{2}+h\\right)^{\\!8}-\\dfrac{1}{32}\\right]$의 값을 구하시오.",
    options: [o("1","$0$"), o("2","$\\dfrac{1}{2}$"), o("3","$1$"), o("4","$\\infty$")],
    answer: 2,
    explanation: "$f(x)=8x^8$, $f'(x)=64x^7$. 도함수 정의: 극한 $=f'(\\tfrac{1}{2})=64\\cdot\\tfrac{1}{2^7}=\\dfrac{1}{2}$."
  }),
  build({
    num: 2, subject: "미분학", unit: "극한과 연속", concept: "유리화 극한", difficulty: "easyMedium",
    question: "함수 $f(x)=\\dfrac{\\sqrt{2x+5}-\\sqrt{x+7}}{x-2}$ $(x\\ne 2)$가 $x=2$에서 연속이 되도록 $f(2)$의 값을 정의하시오.",
    options: [o("1","$f(2)=0$"), o("2","$f(2)=\\dfrac{1}{6}$"), o("3","$f(2)=\\dfrac{1}{3}$"), o("4","$f(2)=1$")],
    answer: 2,
    explanation: "분자 유리화: $\\dfrac{x-2}{(x-2)(\\sqrt{2x+5}+\\sqrt{x+7})}\\to\\dfrac{1}{3+3}=\\dfrac{1}{6}$."
  }),
  build({
    num: 3, subject: "적분학", unit: "정적분의 계산", concept: "정적분 비교", difficulty: "easyMedium",
    question: "$A=\\displaystyle\\int_0^1\\sin\\!\\left(\\dfrac{\\pi x}{2}\\right)\\!dx$이고 $B=\\displaystyle\\int_0^1 2xe^x\\,dx$일 때, 다음 중 가장 큰 값을 찾으시오.",
    options: [o("1","$A+B$"), o("2","$AB$"), o("3","$A/B$"), o("4","$B/A$")],
    answer: 4,
    explanation: "$A=\\dfrac{2}{\\pi}\\approx 0.64$, $B=2[xe^x-e^x]_0^1=2$. $A+B\\approx 2.64,\\,AB\\approx 1.27,\\,A/B\\approx 0.32,\\,B/A\\approx 3.14$. 최대 $B/A$."
  }),
  build({
    num: 4, subject: "적분학", unit: "급수", concept: "수렴 판정", difficulty: "medium",
    question: "다음 중 수렴하는 급수를 모두 고르시오.\n\n(가) $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{\\cos n}{n(n+1)}$\\quad (나) $\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{1}{\\ln n}$\\quad (다) $\\displaystyle\\sum_{n=1}^{\\infty}\\!\\left(1+\\dfrac{1}{2n}\\right)^{\\!n^2}$\\quad (라) $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{\\ln n}{n^2}$",
    options: [o("1","(가), (나)"), o("2","(나), (다)"), o("3","(가), (라)"), o("4","(가), (다), (라)")],
    answer: 3,
    explanation: "(가) 디리클레 판정 수렴. (나) $1/\\ln n>1/n$ 발산. (다) 일반항 $\\to e^{1/2}\\ne 0$ 발산. (라) 적분 비교 수렴."
  }),
  build({
    num: 5, subject: "공학수학", unit: "미분방정식", concept: "2계 동차(중근)", difficulty: "easyMedium",
    question: "미분방정식 $y''-2y'+y=0$의 일반해를 구하시오.",
    options: [o("1","$y=Ce^{2x}+De^{-x}$"), o("2","$y=Ce^x+De^{-x}$"), o("3","$y=(C+Dx)e^x$"), o("4","$y=(C+Dx)e^{-x}$")],
    answer: 3,
    explanation: "특성방정식 $r^2-2r+1=0$ → $r=1$ 중근. 일반해 $y=(C+Dx)e^x$."
  }),
  build({
    num: 6, subject: "선형대수", unit: "고유치와 대각화", concept: "특성다항식", difficulty: "medium",
    question: "행렬 $\\begin{pmatrix}3 & 0 & 0\\\\ 2 & 1 & 4\\\\ 1 & 0 & a\\end{pmatrix}$의 특성다항식이 $-x^3+bx^2-19x+12$일 때, 상수 $b$의 값을 구하시오.",
    options: [o("1","$-8$"), o("2","$-4$"), o("3","$4$"), o("4","$8$")],
    answer: 4,
    explanation: "특성다항식 $x^3-(a+4)x^2+(4a+3)x-3a=0$. 양변에 $-1$ 곱: $-x^3+(a+4)x^2-(4a+3)x+3a$. 상수항 $3a=12\\Rightarrow a=4$. $b=a+4=8$."
  }),
  build({
    num: 7, subject: "다변수함수", unit: "편도함수", concept: "음함수 미분", difficulty: "easyMedium",
    question: "곡선 $x^2-xy-y^2=1$ $(x,y\\ge 0)$ 위의 점 $(2,y_0)$에서의 변화율 $\\dfrac{dy}{dx}$의 값을 구하시오.",
    options: [o("1","$-\\dfrac{7}{4}$"), o("2","$-\\dfrac{3}{4}$"), o("3","$\\dfrac{3}{4}$"), o("4","$\\dfrac{7}{4}$")],
    answer: 3,
    explanation: "$(2,y_0)$ 대입: $4-2y_0-y_0^2=1$, $y_0=1$. $f=x^2-xy-y^2-1$, $f_x=2x-y,\\,f_y=-x-2y$. $\\dfrac{dy}{dx}=-\\dfrac{f_x}{f_y}=\\dfrac{2x-y}{x+2y}=\\dfrac{4-1}{2+2}=\\dfrac{3}{4}$."
  }),
  build({
    num: 8, subject: "미분학", unit: "도함수의 응용", concept: "함수 그래프 분석", difficulty: "medium",
    question: "$x$축 위에서 움직이는 점 $P$의 시간 $t>0$에서의 속도가 $v(t)=-\\dfrac{\\ln t}{t^2}$일 때, 이 점의 운동에 대한 설명으로 옳은 것을 모두 고르시오.\n\n(가) 점 $P$의 속도 $v(t)$의 최댓값이 존재한다.\n(나) 점 $P$의 속도 $v(t)$의 최솟값이 존재한다.\n(다) 점 $P$의 속도 $v(t)$의 부호는 정확히 한 번 바뀐다.\n(라) 점 $P$의 가속도 $v'(t)$의 부호는 정확히 한 번 바뀐다.",
    options: [o("1","(가), (나)"), o("2","(나), (라)"), o("3","(다), (라)"), o("4","(나), (다), (라)")],
    answer: 4,
    explanation: "$v(t)\\to\\infty\\,(t\\to 0+)$, $v(t)\\to 0\\,(t\\to\\infty)$. $v'(t)=0\\Rightarrow t=\\sqrt e$, 극소 $-\\tfrac{1}{2e}$. (가)최댓값 X, (나)최솟값 O, (다)부호 $t=1$에서 한 번 바뀜, (라)$v'$ 부호 $t=\\sqrt e$에서 한 번 바뀜."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "극좌표", concept: "극곡선 접선 기울기", difficulty: "medium",
    question: "극좌표로 정의된 곡선 $r=1+\\cos\\theta$ 위의 점 $Q(r,\\theta)$에서의 접선의 기울기가 $1$일 때, 다음 중 $Q$의 $\\theta$좌표가 될 수 있는 값을 고르시오.",
    options: [o("1","$\\theta=\\dfrac{3\\pi}{2}$"), o("2","$\\theta=\\dfrac{5\\pi}{3}$"), o("3","$\\theta=\\dfrac{7\\pi}{4}$"), o("4","$\\theta=\\dfrac{11\\pi}{6}$")],
    answer: 4,
    explanation: "$\\tan\\alpha=\\tfrac{\\tan\\theta+\\tan\\phi}{1-\\tan\\theta\\tan\\phi}$, $\\tan\\phi=\\tfrac{r}{r'}=\\tfrac{1+\\cos\\theta}{-\\sin\\theta}$. 각 $\\theta$ 대입 후 $\\tan\\alpha=1$인 것은 $\\theta=\\tfrac{11\\pi}{6}$."
  }),
  build({
    num: 10, subject: "적분학", unit: "정적분의 계산", concept: "기하적 정적분", difficulty: "medium",
    question: "정적분 $\\displaystyle\\int_0^2\\sqrt{-x^2+8x}\\,dx$의 값을 구하시오.",
    options: [o("1","$\\dfrac{4\\pi}{3}-2\\sqrt{3}$"), o("2","$\\dfrac{8\\pi}{3}-2\\sqrt{3}$"), o("3","$\\dfrac{2\\pi}{3}$"), o("4","$4$")],
    answer: 2,
    explanation: "$y=\\sqrt{16-(x-4)^2}$의 일부, 중심 $(4,0)$, 반지름 $4$ 원. 평행이동: $\\int_{-4}^{-2}\\sqrt{16-x^2}dx=\\int_2^4\\sqrt{16-x^2}dx$. 부채꼴($r=4,\\theta=\\pi/3$) - 삼각형 = $\\tfrac{8\\pi}{3}-2\\sqrt 3$."
  }),
  build({
    num: 11, subject: "적분학", unit: "정적분의 계산", concept: "리만합", difficulty: "medium",
    question: "$T_n=\\displaystyle\\sum_{k=1}^{n}\\dfrac{n}{(k+n)(k+2n)}$일 때, $\\displaystyle\\lim_{n\\to\\infty}e^{T_n}$의 값을 구하시오.",
    options: [o("1","$\\dfrac{1}{3}$"), o("2","$\\dfrac{2}{3}$"), o("3","$\\dfrac{4}{3}$"), o("4","$3$")],
    answer: 3,
    explanation: "리만합: $T_n\\to\\!\\int_0^1\\dfrac{1}{(x+1)(x+2)}dx=\\!\\int_0^1(\\tfrac{1}{x+1}-\\tfrac{1}{x+2})dx=\\ln\\tfrac{4}{3}$. $e^{T_n}\\to\\dfrac{4}{3}$."
  }),
  build({
    num: 12, subject: "미분학", unit: "도함수", concept: "FTC와 접선", difficulty: "medium",
    question: "$F(x)=\\displaystyle\\int_{3x-5}^{2x^2-7}e^{-t^2}dt$일 때, 곡선 $y=F(x)$의 $x=2$에서의 접선의 방정식을 구하시오.",
    options: [o("1","$5x-ey=10$"), o("2","$5x-y=10$"), o("3","$ex+y=2e$"), o("4","$ex-5y=e$")],
    answer: 1,
    explanation: "$F(2)=\\!\\int_1^1=0$. $F'(x)=e^{-(2x^2-7)^2}\\cdot 4x-e^{-(3x-5)^2}\\cdot 3$. $F'(2)=8e^{-1}-3e^{-1}=5/e$. 접선 $y=\\tfrac{5}{e}(x-2)$ → $5x-ey=10$."
  }),
  build({
    num: 13, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피 비교", difficulty: "medium",
    question: "$x$축과 $y$축, $x=1$, 곡선 $y=\\dfrac{2}{x+1}$로 둘러싸인 영역을 $x$축을 중심으로 회전시킨 입체의 부피를 $V_x$라고 하고 $y$축을 중심으로 회전시킨 입체의 부피를 $V_y$라고 할 때, 두 부피의 비율 $V_y/V_x$의 값을 구하시오.",
    options: [o("1","$1-\\ln 2$"), o("2","$2-\\ln 4$"), o("3","$1$"), o("4","$\\dfrac{e}{2}$")],
    answer: 2,
    explanation: "$V_x=\\pi\\!\\int_0^1\\!(2/(x+1))^2 dx=2\\pi$. $V_y=2\\pi\\!\\int_0^1\\!x\\cdot\\tfrac{2}{x+1}dx=4\\pi(1-\\ln 2)$. 비 $=2(1-\\ln 2)=2-\\ln 4$."
  }),
  build({
    num: 14, subject: "적분학", unit: "급수", concept: "수렴반경", difficulty: "easyMedium",
    question: "멱급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n!\\,x^n}{1\\cdot 3\\cdots(2n+1)}$의 수렴반경을 구하시오.",
    options: [o("1","$0$"), o("2","$\\dfrac{1}{2}$"), o("3","$2$"), o("4","$\\infty$")],
    answer: 3,
    explanation: "$|a_n/a_{n+1}|=\\tfrac{n!}{1\\cdot 3\\cdots(2n+1)}\\cdot\\tfrac{1\\cdot 3\\cdots(2n+3)}{(n+1)!}=\\tfrac{2n+3}{n+1}\\to 2$."
  }),
  build({
    num: 15, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "Taylor 전개", difficulty: "medium",
    question: "함수 $f(x)=\\displaystyle\\int_0^x\\dfrac{\\cos u}{1-u}du$의 $x=0$에서의 4차 테일러 다항식을 구하시오.",
    options: [o("1","$x+\\dfrac{x^2}{2}+\\dfrac{x^3}{6}+\\dfrac{x^4}{8}$"), o("2","$x+\\dfrac{x^2}{2}+\\dfrac{x^3}{3}+\\dfrac{x^4}{4}$"), o("3","$x+\\dfrac{x^2}{2}+\\dfrac{x^3}{2}+\\dfrac{x^4}{2}$"), o("4","$x+x^2+x^3+x^4$")],
    answer: 1,
    explanation: "$f'(x)=\\dfrac{\\cos x}{1-x}=(1-\\tfrac{x^2}{2}+\\tfrac{x^4}{24}-\\cdots)(1+x+x^2+x^3+x^4+\\cdots)=1+x+\\tfrac{x^2}{2}+\\tfrac{x^3}{2}+\\cdots$. 적분 후 상수 0: $f(x)=x+\\tfrac{x^2}{2}+\\tfrac{x^3}{6}+\\tfrac{x^4}{8}+\\cdots$."
  }),
  build({
    num: 16, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "급수의 함숫값", difficulty: "easyMedium",
    question: "함수 $g(x)=e^x$에 대하여 $g\\!\\left(\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-1)^n}{n\\cdot 3^n}\\right)$의 값을 구하시오.",
    options: [o("1","$0$"), o("2","$\\dfrac{1}{3}$"), o("3","$\\dfrac{3}{4}$"), o("4","$\\dfrac{4}{3}$")],
    answer: 3,
    explanation: "$\\sum\\tfrac{(-1)^n}{n\\cdot 3^n}=-\\sum\\tfrac{(-1/3)^{n+1}}{n+...}$ 사실 $-\\ln(1+1/3)=-\\ln\\tfrac{4}{3}$. $g(-\\ln\\tfrac{4}{3})=e^{-\\ln 4/3}=\\dfrac{3}{4}$."
  }),
  build({
    num: 17, subject: "선형대수", unit: "추가내용", concept: "연립방정식 진위", difficulty: "medium",
    question: "상수 $c$와 $d$에 의하여 정의되는 연립방정식 $\\begin{cases}x+2y+3z=1\\\\ x+3y+5z=0\\\\ y+cz=d\\end{cases}$에 대한 설명으로 올바른 것을 모두 고르시오.\n\n(가) 해가 무한히 많이 존재하도록 하는 $c$와 $d$를 찾을 수 있다.\n(나) $c=2$이면 해가 존재하지 않는다.\n(다) $cd=-2$이면 해가 반드시 존재한다.",
    options: [o("1","(가), (나)"), o("2","(가), (다)"), o("3","(나), (다)"), o("4","(가), (나), (다)")],
    answer: 2,
    explanation: "(가) $c=2,d=-1$이면 무한해. (나) $c=2,d\\ne -1$이면 해 X이지만 일반적으로 X. (다) $c\\ne 2$ 또는 $cd=-2$ 만족하는 경우 해 존재."
  }),
  build({
    num: 18, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "임계점 분류", difficulty: "easyMedium",
    question: "함수 $G(x,y)=x^3+y^3+3xy$의 극점을 모두 구하고 각 극점의 종류를 판별하시오.",
    options: [o("1","$(0,0)$: 안장점, $(-1,-1)$: 극대점"), o("2","$(0,0)$: 안장점, $(-1,-1)$: 극소점"), o("3","$(0,0)$: 극소점, $(1,1)$: 극대점"), o("4","$(0,0)$: 극소점, $(1,-1)$: 안장점")],
    answer: 1,
    explanation: "$G_x=3x^2+3y=0,\\,G_y=3y^2+3x=0$ → $(0,0),(-1,-1)$. $\\Delta=G_{xx}G_{yy}-G_{xy}^2=36xy-9$. $(0,0)$: $\\Delta=-9<0$ 안장점. $(-1,-1)$: $\\Delta=27>0,\\,G_{xx}=-6<0$ 극대점."
  }),
  build({
    num: 19, subject: "공학수학", unit: "미분방정식", concept: "분리변수형 ODE", difficulty: "medium",
    question: "미분방정식 $\\dfrac{dy}{dx}=y\\ln y$의 해 $y=f(x)$가 $f(0)=\\dfrac{1}{e}$을 만족할 때, $x=\\ln 2$에서 $y=f(x)$에 접하는 접선의 기울기를 구하시오.",
    options: [o("1","$-e^2$"), o("2","$-\\dfrac{2}{e^2}$"), o("3","$\\dfrac{1}{e^2}$"), o("4","$\\dfrac{e^2}{2}$")],
    answer: 2,
    explanation: "$\\!\\int\\tfrac{dy}{y\\ln y}=\\!\\int dx$ → $\\ln|\\ln y|=x+C$. $y(0)=1/e$ → $C=0$. $\\ln y=-e^x,\\,y=e^{-e^x}$. $y'=-e^x e^{-e^x}$. $x=\\ln 2$: $y'=-2 e^{-2}=-\\dfrac{2}{e^2}$."
  }),
  build({
    num: 20, subject: "적분학", unit: "이상적분", concept: "수렴 조건", difficulty: "medium",
    question: "이상적분 $A=\\displaystyle\\int_0^{\\infty}\\!\\left(\\dfrac{x}{x^2+1}-\\dfrac{B}{2x+4}\\right)dx$가 수렴할 때 $AB$의 값을 구하시오.",
    options: [o("1","$\\ln 2$"), o("2","$\\ln 4$"), o("3","$\\ln 6$"), o("4","$\\ln 8$")],
    answer: 2,
    explanation: "발산을 상쇄: $B=2$. $A=\\!\\left[\\ln\\tfrac{\\sqrt{x^2+1}}{2x+4}\\right]_0^{\\infty}=\\ln\\tfrac{1}{2}-\\ln\\tfrac{1}{4}=\\ln 2$. $AB=2\\ln 2=\\ln 4$."
  }),
  build({
    num: 21, subject: "다변수함수", unit: "중적분", concept: "타원기둥과 부피 등분", difficulty: "mediumHard",
    question: "세 곡면 $z=0,\\,2x^2+y^2=R^2,\\,z=10$으로 둘러싸인 기둥이 곡면 $z=2x^2+y^2+1$에 의하여 부피가 똑같은 두 조각으로 나누어질 때 $R$의 값을 구하시오.",
    options: [o("1","$2\\sqrt{2}$"), o("2","$4$"), o("3","$4\\sqrt{2}$"), o("4","$8$")],
    answer: 1,
    explanation: "타원기둥 부피 $=\\pi\\cdot\\tfrac{R}{\\sqrt 2}\\cdot R\\cdot 10=\\tfrac{10\\pi R^2}{\\sqrt 2}=5\\sqrt 2\\pi R^2$. 절반 $=\\tfrac{5\\sqrt 2 \\pi R^2}{2}$. 곡면 아래 부피: $\\iint(2x^2+y^2+1)dA=\\tfrac{1}{\\sqrt 2}(\\tfrac{\\pi R^4}{2}+R^2\\pi)$. 등식 정리하면 $R^2=8$ → $R=2\\sqrt 2$."
  }),
  build({
    num: 22, subject: "다변수함수", unit: "선적분과 면적분", concept: "그린정리(절댓값)", difficulty: "medium",
    question: "곡선 $C:x^2+y^2=1$ $(x,y\\ge 0)$ 위에서 계산한 적분의 절댓값 $\\left|\\displaystyle\\int_C xy\\,dx+y(x-x^2)\\,dy\\right|$의 값을 구하시오.",
    options: [o("1","$\\dfrac{1}{4}$"), o("2","$\\dfrac{1}{2}$"), o("3","$1$"), o("4","$\\dfrac{5}{4}$")],
    answer: 1,
    explanation: "그린정리(폐곡선 추가): $Q_x-P_y=y-2xy-x$. $\\iint(y-2xy-x)dA$. 1사분면 사분원에서 대칭 $\\iint y dA=\\iint x dA$이므로 $-2\\iint xy dA=-2\\!\\int_0^{\\pi/2}\\!\\!\\int_0^1 r^3\\sin\\theta\\cos\\theta\\,dr\\,d\\theta=-\\tfrac{1}{4}$. 추가선 적분 0이라 절댓값 $\\tfrac{1}{4}$."
  }),
  build({
    num: 23, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "임계점", difficulty: "mediumHard",
    question: "함수 $F(x,y)=e^{\\frac{1}{2}x^2-y^2}(x+2\\sqrt{2}y)$의 임계점을 $(x_1,y_1)$이라 할 때, $3|x_1+y_1|$의 값을 구하시오.",
    options: [o("1","$\\sqrt{6}-\\sqrt{3}$"), o("2","$\\sqrt{2}-1$"), o("3","$\\sqrt{2}+1$"), o("4","$\\sqrt{6}+\\sqrt{3}$")],
    answer: 1,
    explanation: "$F_x=F_y=0$ 풀면 $x^2+2\\sqrt 2 xy+1=0,\\,xy+2\\sqrt 2 y^2-\\sqrt 2=0$. 두 식 더해 정리하면 $(x+2\\sqrt 2 y)^2=3$. $x=\\pm\\sqrt 3-2\\sqrt 2 y$. 대입 후 임계점 $(\\sqrt 3/3,-\\sqrt 6/3)$ 또는 $(-\\sqrt 3/3,\\sqrt 6/3)$. $3|x_1+y_1|=|\\sqrt 3-\\sqrt 6|=\\sqrt 6-\\sqrt 3$."
  }),
  build({
    num: 24, subject: "선형대수", unit: "벡터공간", concept: "선형사상 값 결정", difficulty: "medium",
    question: "선형사상 $T:\\mathbb{R}^2\\to\\mathbb{R}$이 $T(2,1)=\\sin\\theta$, $T(1,3)=\\cos\\theta$를 만족한다고 하자. $\\!\\left(0\\le\\theta\\le\\dfrac{\\pi}{2}\\right)$, $T(1,-1)=0$일 때, $T(2,3)$의 값을 구하시오.",
    options: [o("1","$\\dfrac{16}{25}$"), o("2","$\\dfrac{24}{25}$"), o("3","$1$"), o("4","$\\dfrac{7}{5}$")],
    answer: 3,
    explanation: "$(1,-1)=\\tfrac{4}{5}(2,1)-\\tfrac{3}{5}(1,3)$이고 $T(1,-1)=\\tfrac{4}{5}\\sin\\theta-\\tfrac{3}{5}\\cos\\theta=0$ → $\\tan\\theta=\\tfrac{3}{4}$, $\\sin\\theta=\\tfrac{3}{5},\\cos\\theta=\\tfrac{4}{5}$. $(2,3)=\\tfrac{3}{5}(2,1)+\\tfrac{4}{5}(1,3)$이라 $T(2,3)=\\tfrac{3}{5}\\cdot\\tfrac{3}{5}+\\tfrac{4}{5}\\cdot\\tfrac{4}{5}=1$."
  }),
  build({
    num: 25, subject: "공학수학", unit: "미분방정식", concept: "비동차 ODE(공명)", difficulty: "mediumHard",
    question: "미분방정식 $y''+4y=12\\sin 2x$의 해가 $y(0)=0,\\,y\\!\\left(\\dfrac{\\pi}{4}\\right)=0$을 만족할 때, $y\\!\\left(\\dfrac{\\pi}{6}\\right)$의 값을 구하시오.",
    options: [o("1","$-\\dfrac{\\sqrt{3}\\pi}{4}$"), o("2","$-\\dfrac{\\pi}{4}$"), o("3","$\\dfrac{\\pi}{4}$"), o("4","$\\dfrac{\\sqrt{3}\\pi}{4}$")],
    answer: 2,
    explanation: "동차해 $c_1\\cos 2x+c_2\\sin 2x$. 공명 → 특수해 $-3x\\cos 2x$. 일반해 $y=c_1\\cos 2x+c_2\\sin 2x-3x\\cos 2x$. $y(0)=c_1=0$, $y(\\pi/4)=c_2=0$. $y=-3x\\cos 2x$. $y(\\pi/6)=-\\tfrac{\\pi}{2}\\cos(\\pi/3)=-\\dfrac{\\pi}{4}$."
  }),
];

console.log(`Inserting ${problems.length} questions...`);
const { data, error } = await sb.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
