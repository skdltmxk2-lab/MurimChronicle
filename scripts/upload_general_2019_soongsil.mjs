// Upload 2019년도 숭실대 편입수학 기출 25문항 (4지 선다, 90분, 원본 26~50번)
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

const SCHOOL = "숭실대";
const YEAR = "2019";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-soongsil-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "선형대수", unit: "행렬", concept: "동차계 해공간 차원", difficulty: "medium",
    question: "행렬 $A$에 대하여 연립방정식 $A\\vec x=0$의 해집합을 $N_A$라고 할 때 다음 중 $N_A$가 직선을 포함하지 않는 행렬 $A$는?",
    options: [
      o("1","$A=\\!\\begin{pmatrix}1&-1&1\\\\2&-2&2\\\\3&-3&3\\end{pmatrix}$"),
      o("2","$A=\\!\\begin{pmatrix}1&-1&1\\\\0&1&0\\\\2&-2&2\\end{pmatrix}$"),
      o("3","$A=\\!\\begin{pmatrix}1&1&0\\\\0&1&-1\\\\1&0&1\\end{pmatrix}$"),
      o("4","$A=\\!\\begin{pmatrix}1&-1&1\\\\0&1&0\\\\1&0&0\\end{pmatrix}$")
    ],
    answer: 4,
    explanation: "(1) rank $=1$, 해공간 차원 $=2$. (2) rank $=2$, 차원 $=1$. (3) rank $=2$, 차원 $=1$. (4) rank $=3$, 차원 $=0$ ⇒ 영벡터만 ⇒ 직선 미포함."
  }),
  build({
    num: 2, subject: "적분학", unit: "급수", concept: "텔레스코핑 급수", difficulty: "easy",
    question: "급수 $\\!\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{2}{n^2-1}$의 합은?",
    options: [o("1","$\\dfrac{3}{2}$"), o("2","$2$"), o("3","$\\dfrac{5}{2}$"), o("4","$4$")],
    answer: 1,
    explanation: "$\\dfrac{2}{n^2-1}=\\dfrac{1}{n-1}-\\dfrac{1}{n+1}$. 텔레스코핑: $1+\\dfrac{1}{2}=\\dfrac{3}{2}$."
  }),
  build({
    num: 3, subject: "미분학", unit: "도함수", concept: "로그미분법", difficulty: "easy",
    question: "$f(x)=(3x-2)^{\\sqrt x}$일 때 미분계수 $f'(1)$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$")],
    answer: 4,
    explanation: "$\\ln f=\\sqrt x\\ln(3x-2)$. $\\dfrac{f'}{f}=\\dfrac{\\ln(3x-2)}{2\\sqrt x}+\\sqrt x\\cdot\\dfrac{3}{3x-2}$.\n$x=1$: $f(1)=1$, $\\dfrac{f'(1)}{1}=0+3=3$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분", concept: "극곡선 접선 기울기", difficulty: "medium",
    question: "극좌표계의 점 $\\!\\left(\\dfrac{3}{2},\\dfrac{\\pi}{3}\\right)$에서 극곡선 $r=1+\\cos\\theta$의 접선의 기울기는?",
    options: [o("1","$0$"), o("2","$-1$"), o("3","$\\dfrac{1}{4}$"), o("4","$-\\dfrac{1}{2}$")],
    answer: 1,
    explanation: "$\\dfrac{dy}{dx}=\\dfrac{r'\\sin\\theta+r\\cos\\theta}{r'\\cos\\theta-r\\sin\\theta}$. $r'=-\\sin\\theta$.\n$\\theta=\\pi/3,\\,r=3/2$: 분자 $=-\\dfrac{\\sqrt 3}{2}\\cdot\\dfrac{\\sqrt 3}{2}+\\dfrac{3}{2}\\cdot\\dfrac{1}{2}=-\\dfrac{3}{4}+\\dfrac{3}{4}=0$. 기울기 $=0$."
  }),
  build({
    num: 5, subject: "다변수함수", unit: "편미분", concept: "접평면", difficulty: "easy",
    question: "다음 중 곡면 $x^2-xy^2 z+z^2=1$ 위의 점 $(1,1,1)$에서의 접평면에 속하는 점은?",
    options: [o("1","$(2,1,3)$"), o("2","$(1,-2,1)$"), o("3","$(1,-1,1)$"), o("4","$(3,3,3)$")],
    answer: 4,
    explanation: "$\\nabla F=(2x-y^2 z,\\,-2xyz,\\,-xy^2+2z)|_{(1,1,1)}=(1,-2,1)$.\n접평면 $(x-1)-2(y-1)+(z-1)=0$ ⇒ $x-2y+z=0$.\n$(3,3,3)$: $3-6+3=0$ ✓."
  }),
  build({
    num: 6, subject: "적분학", unit: "정적분", concept: "치환 적분", difficulty: "easy",
    question: "정적분 $\\!\\displaystyle\\int_0^1\\dfrac{\\sqrt x}{x+1}dx$의 값은?",
    options: [o("1","$\\ln 2$"), o("2","$\\dfrac{1}{2}\\ln 2$"), o("3","$2-\\dfrac{\\pi}{2}$"), o("4","$1-\\dfrac{\\pi}{4}$")],
    answer: 3,
    explanation: "$\\sqrt x=t$ 치환: $\\!\\int_0^1\\dfrac{t}{t^2+1}\\cdot 2t\\,dt=2\\!\\int_0^1\\!\\!\\left(1-\\dfrac{1}{t^2+1}\\right)dt=2-\\dfrac{\\pi}{2}$."
  }),
  build({
    num: 7, subject: "미분학", unit: "극한과 연속", concept: "$1^\\infty$ 극한", difficulty: "medium",
    question: "극한 $\\!\\displaystyle\\lim_{x\\to\\infty}\\!\\left(\\sin\\dfrac{2}{x}+\\cos\\dfrac{3}{x}\\right)^x$의 값은?",
    options: [o("1","$\\dfrac{1}{e^2}$"), o("2","$e^2$"), o("3","$\\dfrac{1}{e^3}$"), o("4","$e^3$")],
    answer: 2,
    explanation: "$1/x=t$ 치환: $\\!\\lim_{t\\to 0}(\\sin 2t+\\cos 3t)^{1/t}=e^{\\lim(\\sin 2t+\\cos 3t-1)/t}=e^{\\lim(2\\cos 2t-3\\sin 3t)}=e^2$."
  }),
  build({
    num: 8, subject: "선형대수", unit: "행렬", concept: "행렬 명제(참/거짓)", difficulty: "medium",
    question: "$n\\times n$ 행렬 $A,B$에 대하여 다음 중 옳은 것을 모두 고른 것은?\n\n(가) $AB$가 영행렬이면 $A$ 또는 $B$가 영행렬이다.\n(나) $AB$가 가역행렬이면 $A$와 $B$는 모두 가역행렬이다.\n(다) $AB$가 단위행렬이면 $BA$는 단위행렬이다.",
    options: [o("1","(가), (나)"), o("2","(가), (다)"), o("3","(나), (다)"), o("4","(가), (나), (다)")],
    answer: 3,
    explanation: "(가) 거짓: 영인자 존재 가능.\n(나) 참: $|AB|\\ne 0$이면 $|A|,|B|\\ne 0$.\n(다) 참: 정사각행렬에서 $AB=I$이면 $BA=I$."
  }),
  build({
    num: 9, subject: "공학수학", unit: "미분방정식", concept: "1계 선형미방", difficulty: "easy",
    question: "초깃값 문제 $\\dfrac{dy}{dt}=k(y-7),\\,y(0)=30$에서 $y(3)=20$이 되는 $k$의 값은?",
    options: [
      o("1","$\\ln\\!\\dfrac{23}{13}$"),
      o("2","$\\dfrac{1}{3}\\ln\\!\\dfrac{13}{23}$"),
      o("3","$\\dfrac{1}{3}\\ln\\!\\dfrac{23}{13}$"),
      o("4","$\\ln\\!\\dfrac{13}{23}$")
    ],
    answer: 2,
    explanation: "$y-7=Ce^{kt}$. $y(0)=30$: $C=23$. $y(3)=7+23e^{3k}=20$ ⇒ $e^{3k}=13/23$ ⇒ $k=\\dfrac{1}{3}\\ln(13/23)$."
  }),
  build({
    num: 10, subject: "공학수학", unit: "미분방정식", concept: "2계 상수계수(중근)", difficulty: "medium",
    question: "초깃값 문제 $y''-4y'+4y=0,\\,y(0)=1,\\,y'(0)=1$에서 $y(2)$의 값은?",
    options: [o("1","$-e^4$"), o("2","$-2e^4$"), o("3","$e^4$"), o("4","$2e^4$")],
    answer: 1,
    explanation: "특성: $(s-2)^2=0$. $y=(c_1+c_2 t)e^{2t}$. $y(0)=c_1=1$. $y'(0)=2c_1+c_2=1$ ⇒ $c_2=-1$.\n$y=(1-t)e^{2t}$. $y(2)=-e^4$."
  }),
  build({
    num: 11, subject: "적분학", unit: "정적분", concept: "변수상한 적분 명제", difficulty: "medium",
    question: "구간 $[0,1]$에서 연속인 함수 $f(x)$에 대하여 다음 중 옳은 것을 모두 고른 것은?\n\n(가) $F(x)=\\!\\displaystyle\\int_0^x f(t)dt$는 $(0,1)$에서 미분가능.\n(나) $\\!\\displaystyle\\int_0^1 f(x)dx=0$이면 $f(c)=0$이 되는 $c$가 $[0,1]$에 존재.\n(다) $[0,1]$의 모든 $x$에 대하여 $\\!\\displaystyle\\int_0^x f(t)dt=0$이면 $[0,1]$의 모든 $x$에서 $f(x)=0$.",
    options: [o("1","(가), (나)"), o("2","(가), (다)"), o("3","(나), (다)"), o("4","(가), (나), (다)")],
    answer: 4,
    explanation: "(가) 적분기본정리 ⇒ 참.\n(나) 적분 평균값 정리 ⇒ 참.\n(다) 미분하면 $f=0$ ⇒ 참."
  }),
  build({
    num: 12, subject: "적분학", unit: "급수", concept: "수렴 급수 명제(옳지 않은 것)", difficulty: "medium",
    question: "고정된 양의 실수 $y$에 대해 급수 $\\!\\displaystyle\\sum_{n=0}^{\\infty}a_n y^n$이 수렴할 때 다음 중 옳지 않은 것은?",
    options: [
      o("1","$\\!\\lim_{n\\to\\infty}a_n y^n=0$이다."),
      o("2","$\\!\\sum_{n=0}^{\\infty}a_n(-y)^n$은 수렴한다."),
      o("3","$-y<x<y$일 때 $\\!\\sum_{n=0}^{\\infty}a_n x^n$은 수렴한다."),
      o("4","$-y<x<y$일 때 $\\!\\sum_{n=1}^{\\infty}na_n x^n$은 수렴한다.")
    ],
    answer: 2,
    explanation: "(1) 발산판정역 ⇒ 참.\n(2) 거짓: 반례 $a_n=(-1)^n/n,\\,y=1$이면 수렴이지만 $y=-1$이면 발산.\n(3),(4) 멱급수 수렴구간 내부 ⇒ 참."
  }),
  build({
    num: 13, subject: "적분학", unit: "급수", concept: "멱급수 수렴반경", difficulty: "medium",
    question: "멱급수 $\\!\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(-2)^n x^{2n+1}}{\\sqrt{n^2+n+1}}$의 수렴반경은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$\\dfrac{1}{\\sqrt 2}$"), o("3","$\\dfrac{1}{4}$"), o("4","$2$")],
    answer: 2,
    explanation: "$a_n=\\dfrac{(-2)^n}{\\sqrt{n^2+n+1}}$. $\\!\\lim|a_n/a_{n+1}|=\\dfrac{1}{2}$. $|x^2|<\\dfrac{1}{2}$ ⇒ $|x|<\\dfrac{1}{\\sqrt 2}$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "편미분", concept: "온도 가장 빠른 감소 방향", difficulty: "medium",
    question: "공간에서의 온도 함수가 $T(x,y,z)=\\pi e^{xy}-\\sin(\\pi yz)$일 때 다음 벡터 중 점 $(0,1,-1)$에서 온도가 가장 빠르게 낮아지는 방향을 나타내는 것은?",
    options: [
      o("1","$\\langle-1,1,-1\\rangle$"),
      o("2","$\\langle 1,-1,1\\rangle$"),
      o("3","$\\langle 2,1,-1\\rangle$"),
      o("4","$\\langle-2,1,1\\rangle$")
    ],
    answer: 1,
    explanation: "$\\nabla T=(\\pi y e^{xy},\\,\\pi xe^{xy}-\\pi z\\cos(\\pi yz),\\,-\\pi y\\cos(\\pi yz))|_{(0,1,-1)}=(\\pi,-\\pi,\\pi)$.\n$-\\nabla T=(-\\pi,\\pi,-\\pi)$ 방향과 평행 ⇒ $\\langle-1,1,-1\\rangle$."
  }),
  build({
    num: 15, subject: "다변수함수", unit: "편미분", concept: "임계점 극값 판정", difficulty: "medium",
    question: "$f(x,y)=x^2+y^3-6xy$일 때 다음 중 옳은 것은?",
    options: [
      o("1","$f$는 $(0,0)$에서 극댓값을 갖는다."),
      o("2","$f$는 $\\mathbb R^2$에서 최댓값을 갖는다."),
      o("3","$f$는 $(18,6)$에서 극솟값을 갖는다."),
      o("4","$f$는 $\\mathbb R^2$에서 최솟값을 갖는다.")
    ],
    answer: 3,
    explanation: "$f_x=2x-6y=0,\\,f_y=3y^2-6x=0$. 풀면 $(0,0),(18,6)$.\n$(0,0)$: $\\Delta<0$ 안장점.\n$(18,6)$: $\\Delta>0,f_{xx}>0$ 극솟점.\n$\\mathbb R^2$ 최댓값/최솟값 존재 안 함."
  }),
  build({
    num: 16, subject: "다변수함수", unit: "공간곡선", concept: "두 곡면 교선 접선벡터", difficulty: "medium",
    question: "곡면 $z=x^2+y^2$과 $2x^2+y^2+\\dfrac{3}{2}z^2=9$가 만나서 이루는 곡선을 $C$라 할 때 다음 중 $C$ 위의 점 $(1,-1,2)$에서의 접선에 평행한 벡터는?",
    options: [
      o("1","$\\langle 3,4,-1\\rangle$"),
      o("2","$\\langle 4,3,-1\\rangle$"),
      o("3","$\\langle 7,8,-2\\rangle$"),
      o("4","$\\langle 8,7,-2\\rangle$")
    ],
    answer: 3,
    explanation: "$\\nabla f=(2x,2y,-1)|=(2,-2,-1)$. $\\nabla g=(4x,2y,3z)|=(4,-2,6)$.\n$\\nabla f\\times\\nabla g=(-14,-16,4)\\to(7,8,-2)$."
  }),
  build({
    num: 17, subject: "적분학", unit: "정적분", concept: "이상적분 수렴 판정", difficulty: "medium",
    question: "다음 특이적분 중 수렴하는 것은?",
    options: [
      o("1","$\\!\\int_0^{\\infty}\\dfrac{x}{1+x^2}dx$"),
      o("2","$\\!\\int_1^{\\infty}\\dfrac{1}{x\\ln x}dx$"),
      o("3","$\\!\\int_0^1\\ln x\\,dx$"),
      o("4","$\\!\\int_1^{\\infty}\\dfrac{1}{x-1}dx$")
    ],
    answer: 3,
    explanation: "(1) $\\sim 1/x$ 발산.\n(2) $\\ln\\ln x$ 발산.\n(3) $=-1$ 수렴.\n(4) $x=1$에서 발산."
  }),
  build({
    num: 18, subject: "다변수함수", unit: "중적분", concept: "원형 영역 적분", difficulty: "easy",
    question: "이중적분 $\\!\\displaystyle\\int_0^1\\!\\!\\int_0^{\\sqrt{y-y^2}}1\\,dx\\,dy$의 값은?",
    options: [o("1","$\\pi$"), o("2","$\\dfrac{\\pi}{2}$"), o("3","$\\dfrac{\\pi}{4}$"), o("4","$\\dfrac{\\pi}{8}$")],
    answer: 4,
    explanation: "$x=\\sqrt{y-y^2}=\\sqrt{1/4-(y-1/2)^2}$. 반원 영역(상반).\n$\\!\\int_0^1\\sqrt{1/4-(y-1/2)^2}dy=\\dfrac{1}{2}\\cdot\\pi\\cdot(1/2)^2=\\dfrac{\\pi}{8}$."
  }),
  build({
    num: 19, subject: "선형대수", unit: "행렬", concept: "고유값 합·곱(특수행렬)", difficulty: "medium",
    question: "행렬 $M=\\!\\begin{pmatrix}0&1&0\\\\0&0&1\\\\4&5&6\\end{pmatrix}$의 고유값을 $\\lambda_1,\\lambda_2,\\lambda_3$이라 할 때 고유값들의 합 $a=\\lambda_1+\\lambda_2+\\lambda_3$와 고유값들의 곱 $b=\\lambda_1\\lambda_2\\lambda_3$은?",
    options: [o("1","$a=6,b=4$"), o("2","$a=6,b=0$"), o("3","$a=4,b=6$"), o("4","$a=0,b=6$")],
    answer: 1,
    explanation: "$a=\\text{tr}(M)=0+0+6=6$. $b=\\det M=$ 1행 전개 $=-1\\cdot(0\\cdot 6-1\\cdot 4)=4$."
  }),
  build({
    num: 20, subject: "적분학", unit: "급수", concept: "테일러 전개·특정 계수", difficulty: "medium",
    question: "$0<x<2$에서 $\\dfrac{x}{x-2}=\\!\\displaystyle\\sum_{n=0}^{\\infty}a_n(x-1)^n$일 때 $a_7$의 값은?",
    options: [o("1","$-2$"), o("2","$0$"), o("3","$\\dfrac{1}{7!}$"), o("4","$\\dfrac{2}{7!}$")],
    answer: 1,
    explanation: "$x\\to x+1$ 평행이동: $\\dfrac{x+1}{x-1}=1-\\dfrac{2}{1-x}=1-2(1+x+x^2+\\cdots)$.\n$x^7$ 계수 $=-2$."
  }),
  build({
    num: 21, subject: "미분학", unit: "도함수", concept: "변수상한 적분·로피탈", difficulty: "medium",
    question: "$f(x)=\\!\\displaystyle\\int_0^{2x}\\dfrac{1}{\\sqrt{1+t^3}}dt$일 때 극한 $\\!\\displaystyle\\lim_{h\\to 0}\\dfrac{f(1+3h)-f(1-h)}{h}$의 값은?",
    options: [o("1","$\\dfrac{2}{3}$"), o("2","$\\dfrac{4}{3}$"), o("3","$\\dfrac{8}{3}$"), o("4","$\\dfrac{16}{3}$")],
    answer: 3,
    explanation: "극한 $=f'(1)\\cdot 3-f'(1)\\cdot(-1)=4f'(1)$.\n$f'(x)=\\dfrac{2}{\\sqrt{1+8x^3}}$, $f'(1)=\\dfrac{2}{3}$.\n$4f'(1)=\\dfrac{8}{3}$."
  }),
  build({
    num: 22, subject: "다변수함수", unit: "편미분", concept: "방향 평균 극한", difficulty: "mediumHard",
    question: "이변수함수 $f(x,y)=x^3-y^3+xy+2x-4y+1$에 대하여 극한 $\\!\\displaystyle\\lim_{r\\to 0}\\dfrac{1}{2\\pi r}\\!\\int_0^{2\\pi}f(r\\cos\\theta,r\\sin\\theta)\\cos\\theta\\,d\\theta$의 값은?",
    options: [o("1","$-1$"), o("2","$1$"), o("3","$-2$"), o("4","$2$")],
    answer: 2,
    explanation: "로피탈: $\\!\\lim\\dfrac{1}{2\\pi}\\!\\int_0^{2\\pi}\\nabla f\\cdot(\\cos\\theta,\\sin\\theta)\\cos\\theta d\\theta=\\dfrac{f_x(0,0)}{2\\pi}\\cdot\\pi=\\dfrac{2}{2}=1$."
  }),
  build({
    num: 23, subject: "다변수함수", unit: "중적분", concept: "역함수 적분 변환", difficulty: "medium",
    question: "$f(x)=1+x+x^3$일 때 $\\!\\displaystyle\\int_1^3\\pi[f^{-1}(y)]^2 dy$의 값은?",
    options: [o("1","$\\dfrac{5}{4}\\pi$"), o("2","$\\dfrac{10}{4}\\pi$"), o("3","$\\dfrac{7}{15}\\pi$"), o("4","$\\dfrac{14}{15}\\pi$")],
    answer: 4,
    explanation: "$f^{-1}(y)=x$ 두면 $y=f(x),\\,dy=f'(x)dx$. $y:1\\to 3$ ⇒ $x:0\\to 1$.\n$\\!\\int_0^1\\pi x^2(1+3x^2)dx=\\pi(\\dfrac{1}{3}+\\dfrac{3}{5})=\\dfrac{14\\pi}{15}$."
  }),
  build({
    num: 24, subject: "다변수함수", unit: "중적분", concept: "구면좌표 삼중적분", difficulty: "medium",
    question: "삼중적분 $\\!\\displaystyle\\int_{-1}^1\\!\\!\\int_{-\\sqrt{1-x^2}}^{\\sqrt{1-x^2}}\\!\\!\\int_{\\sqrt{x^2+y^2}}^1(x^2+y^2)dz\\,dy\\,dx$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{20}$"), o("2","$\\dfrac{\\pi}{10}$"), o("3","$\\dfrac{\\pi}{8}$"), o("4","$\\dfrac{\\pi}{4}$")],
    answer: 2,
    explanation: "원기둥좌표: $\\!\\int_0^{2\\pi}\\!\\!\\int_0^1\\!\\!\\int_r^1 r^2\\cdot r\\,dz\\,dr\\,d\\theta=2\\pi\\!\\int_0^1 r^3(1-r)dr=2\\pi(\\tfrac{1}{4}-\\tfrac{1}{5})=\\dfrac{\\pi}{10}$."
  }),
  build({
    num: 25, subject: "다변수함수", unit: "편미분", concept: "혼합 편미분 불연속(고전 예)", difficulty: "mediumHard",
    question: "이변수 함수 $f(x,y)=\\begin{cases}\\dfrac{xy^3}{x^2+y^2},&(x,y)\\ne(0,0)\\\\0,&(x,y)=(0,0)\\end{cases}$의 이계 편도함수 $f_{xy}(x,y)$에 대하여 $f_{xy}(0,0)$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$-1$"), o("4","$2$")],
    answer: 2,
    explanation: "$f_x(0,y)=\\!\\lim_{h\\to 0}\\dfrac{f(h,y)-f(0,y)}{h}=\\!\\lim\\dfrac{hy^3/(h^2+y^2)}{h}=\\dfrac{y^3}{y^2}=y$ ($y\\ne 0$).\n$f_{xy}(0,0)=\\dfrac{\\partial}{\\partial y}[y]|_{y=0}=1$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 숭실대):`, data.map((d) => d.id).join(", "));
