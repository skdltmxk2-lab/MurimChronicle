// Upload 2019년도 서울과기대 편입수학 기출 20문항 (4지 선다형, 100분)
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

const SCHOOL = "서울과기대";
const YEAR = "2019";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-seoultech-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "적분학", unit: "정적분", concept: "삼각치환·유리함수 변형", difficulty: "medium",
    question: "적분 $\\!\\displaystyle\\int_0^{\\sqrt 5}\\dfrac{x^3}{\\sqrt{x^2+4}}\\,dx$의 값은?",
    options: [o("1","$\\dfrac{1}{3}$"), o("2","$\\dfrac{4}{3}$"), o("3","$\\dfrac{7}{3}$"), o("4","$\\dfrac{10}{3}$")],
    answer: 3,
    explanation: "$\\sqrt{x^2+4}=t$ 치환. $x^2=t^2-4$, $x\\,dx=t\\,dt$. $x:0\\to\\sqrt 5$ ⇒ $t:2\\to 3$.\n$\\!\\int_2^3\\dfrac{(t^2-4)t}{t}\\,dt=\\!\\int_2^3(t^2-4)dt=\\!\\left[\\dfrac{t^3}{3}-4t\\right]_2^3=(9-12)-(\\tfrac{8}{3}-8)=\\dfrac{7}{3}$."
  }),
  build({
    num: 2, subject: "공학수학", unit: "수치해석", concept: "심프슨 공식", difficulty: "easy",
    question: "$n=4$일 때 $\\!\\displaystyle\\int_1^5\\dfrac{1}{x}\\,dx$를 심프슨 공식으로 구한 근삿값은?",
    options: [o("1","$\\dfrac{73}{45}$"), o("2","$\\dfrac{76}{45}$"), o("3","$\\dfrac{79}{45}$"), o("4","$\\dfrac{82}{45}$")],
    answer: 1,
    explanation: "$h=1$, 점 $x=1,2,3,4,5$, $f=1,\\dfrac{1}{2},\\dfrac{1}{3},\\dfrac{1}{4},\\dfrac{1}{5}$.\n심프슨: $\\dfrac{h}{3}(f_0+4f_1+2f_2+4f_3+f_4)=\\dfrac{1}{3}\\!\\left(1+2+\\dfrac{2}{3}+1+\\dfrac{1}{5}\\right)$.\n$=\\dfrac{1}{3}\\!\\left(\\dfrac{15+30+10+15+3}{15}\\right)=\\dfrac{73}{45}$."
  }),
  build({
    num: 3, subject: "적분학", unit: "정적분", concept: "성망형(아스트로이드) 길이", difficulty: "easy",
    question: "다음 곡선의 길이는? $x=2\\cos^3\\theta,\\;y=2\\sin^3\\theta\\;(0\\le\\theta\\le\\dfrac{\\pi}{2})$",
    options: [o("1","$\\sqrt 2$"), o("2","$\\sqrt 3$"), o("3","$2$"), o("4","$3$")],
    answer: 4,
    explanation: "성망형 $x^{2/3}+y^{2/3}=2^{2/3}$의 전체길이 $=6a=12$ ($a=2$). 1사분면은 $\\dfrac{1}{4}$ ⇒ $3$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분", concept: "극곡선 영역 넓이", difficulty: "medium",
    question: "$r=3\\sin\\theta$의 내부와 $r=1+\\sin\\theta$의 외부에 놓인 영역의 넓이는?",
    options: [o("1","$\\dfrac{\\pi}{3}$"), o("2","$\\dfrac{2\\pi}{3}$"), o("3","$\\pi$"), o("4","$\\dfrac{4\\pi}{3}$")],
    answer: 3,
    explanation: "교점: $3\\sin\\theta=1+\\sin\\theta$ ⇒ $\\sin\\theta=\\dfrac{1}{2}$ ⇒ $\\theta=\\dfrac{\\pi}{6},\\dfrac{5\\pi}{6}$.\n$S=\\!\\dfrac{1}{2}\\!\\int_{\\pi/6}^{5\\pi/6}\\{(3\\sin\\theta)^2-(1+\\sin\\theta)^2\\}d\\theta=\\dfrac{1}{2}\\!\\int(8\\sin^2\\theta-2\\sin\\theta-1)d\\theta$\n계산하면 $\\pi$."
  }),
  build({
    num: 5, subject: "적분학", unit: "급수", concept: "급수 합($\\sum n(n+1)x^n$)", difficulty: "medium",
    question: "급수 $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n(n+1)}{2^n}$의 합은?",
    options: [o("1","$4$"), o("2","$8$"), o("3","$12$"), o("4","$16$")],
    answer: 2,
    explanation: "$\\!\\sum n(n+1)x^n=\\!\\sum n^2 x^n+\\!\\sum nx^n=\\dfrac{x(1+x)}{(1-x)^3}+\\dfrac{x}{(1-x)^2}=\\dfrac{2x}{(1-x)^3}$.\n$x=\\dfrac{1}{2}$: $\\dfrac{1}{(1/2)^3}=8$."
  }),
  build({
    num: 6, subject: "다변수함수", unit: "공간도형", concept: "두 곡면 교선의 접선벡터", difficulty: "medium",
    question: "곡면 $xyz=1$과 $x^2+2y^2+3z^2=6$의 교선 위의 점 $(1,1,1)$에서 접선의 방향벡터는?",
    options: [o("1","$\\langle 1,2,1\\rangle$"), o("2","$\\langle 1,-2,1\\rangle$"), o("3","$\\langle 1,2,2\\rangle$"), o("4","$\\langle 1,-2,2\\rangle$")],
    answer: 2,
    explanation: "$\\nabla f=(yz,xz,xy)|_{(1,1,1)}=(1,1,1)$.\n$\\nabla g=(2x,4y,6z)|_{(1,1,1)}=(2,4,6)$.\n접선 방향 $=\\nabla f\\times\\nabla g=\\!\\begin{vmatrix}i&j&k\\\\1&1&1\\\\2&4&6\\end{vmatrix}=(6-4,2-6,4-2)=(2,-4,2)\\to(1,-2,1)$."
  }),
  build({
    num: 7, subject: "다변수함수", unit: "공간곡선", concept: "공간곡선 곡률", difficulty: "mediumHard",
    question: "곡선 $\\vec r(t)=(e^t\\cos t,\\;e^t\\sin t),\\;0\\le t\\le 2\\pi$ 위의 점 $(1,0)$으로부터 곡선의 길이가 $\\sqrt 2$가 되는 점에서의 곡률은?",
    options: [o("1","$\\dfrac{1}{2\\sqrt 2}$"), o("2","$\\dfrac{1}{2}$"), o("3","$\\dfrac{\\sqrt 2}{2}$"), o("4","$1$")],
    answer: 1,
    explanation: "$|\\vec r'(t)|=\\sqrt 2 e^t$. $\\!\\int_0^a\\sqrt 2 e^t dt=\\sqrt 2(e^a-1)=\\sqrt 2$ ⇒ $a=\\ln 2$.\n$\\vec r'(t)=(e^t(\\cos t-\\sin t),e^t(\\sin t+\\cos t))$.\n$\\vec r''(t)=(-2e^t\\sin t,2e^t\\cos t)$.\n$|\\vec r'\\times\\vec r''|=2e^{2t}$. 곡률 $\\kappa=\\dfrac{|\\vec r'\\times\\vec r''|}{|\\vec r'|^3}=\\dfrac{2e^{2t}}{(\\sqrt 2 e^t)^3}=\\dfrac{1}{\\sqrt 2 e^t}$. $t=\\ln 2$: $\\dfrac{1}{2\\sqrt 2}$."
  }),
  build({
    num: 8, subject: "다변수함수", unit: "편미분", concept: "원판 영역 최대/최소", difficulty: "medium",
    question: "영역 $x^2+y^2\\le 10$ 위에서 함수 $f(x,y)=x^2+2y^2-2x+3$의 최댓값과 최솟값의 합은?",
    options: [o("1","$22$"), o("2","$24$"), o("3","$26$"), o("4","$28$")],
    answer: 3,
    explanation: "내부 임계: $f_x=2x-2=0,\\;f_y=4y=0$ ⇒ $(1,0)$. $f(1,0)=1-2+3=2$.\n경계 $x^2+y^2=10$ ⇒ $y^2=10-x^2$: $f=x^2+2(10-x^2)-2x+3=-x^2-2x+23=-(x+1)^2+24$.\n$x\\in[-\\sqrt{10},\\sqrt{10}]$. 최대 $x=-1$: $24$. 최소 $x=\\sqrt{10}$: $13-2\\sqrt{10}$ (≈$6.7$).\n결국 최대 $24$, 최소 $2$. 합 $26$."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "중적분", concept: "원기둥 좌표·부피", difficulty: "medium",
    question: "$z=\\sqrt{x^2+y^2}$ 아래 평면 위, 원기둥 $x^2+y^2=2y$ 내부에 놓여 있는 입체의 부피는?",
    options: [o("1","$\\dfrac{29}{9}$"), o("2","$\\dfrac{32}{9}$"), o("3","$\\dfrac{35}{9}$"), o("4","$\\dfrac{38}{9}$")],
    answer: 2,
    explanation: "$x^2+y^2=2y$ ⇒ 극좌표 $r=2\\sin\\theta$.\n$V=\\!\\iint\\sqrt{x^2+y^2}dA=\\!\\int_0^{\\pi}\\!\\!\\int_0^{2\\sin\\theta}r\\cdot r\\,dr\\,d\\theta=\\!\\int_0^{\\pi}\\dfrac{(2\\sin\\theta)^3}{3}d\\theta$\n$=\\dfrac{8}{3}\\!\\int_0^{\\pi}\\sin^3\\theta\\,d\\theta=\\dfrac{8}{3}\\cdot\\dfrac{4}{3}=\\dfrac{32}{9}$."
  }),
  build({
    num: 10, subject: "공학수학", unit: "벡터적분", concept: "그린 정리", difficulty: "easy",
    question: "곡선 $C$가 $x^2+y^2=9$일 때 $\\!\\displaystyle\\oint_C(3y+e^{\\sin x})dx+(7x-\\sqrt{y^4+1})dy$는?",
    options: [o("1","$9\\pi$"), o("2","$18\\pi$"), o("3","$27\\pi$"), o("4","$36\\pi$")],
    answer: 4,
    explanation: "그린: $\\!\\iint_D(Q_x-P_y)dA=\\!\\iint_D(7-3)dA=4\\cdot\\pi\\cdot 9=36\\pi$."
  }),
  build({
    num: 11, subject: "다변수함수", unit: "편미분", concept: "법선 방향·회전곡면", difficulty: "medium",
    question: "점 $(0,0,2)$와 회전 추면 $z^2=x^2+y^2$ 위의 한 점 $P$를 연결한 벡터가 점 $P$에서의 회전 추면 법선벡터와 방향이 같게 되는 점 $P$의 $z$축 좌표는?",
    options: [o("1","$z=1$"), o("2","$z=\\sqrt 2$"), o("3","$z=2$"), o("4","$z=2\\sqrt 2$")],
    answer: 1,
    explanation: "$F=x^2+y^2-z^2=0$. $\\nabla F=(2x,2y,-2z)$.\n점 $(a,b,c)$에서 법선 $(2a,2b,-2c)$ ∥ $(a,b,c-2)$.\n$\\dfrac{a}{2a}=\\dfrac{c-2}{-2c}$ ⇒ $-c=c-2$ ⇒ $c=1$."
  }),
  build({
    num: 12, subject: "공학수학", unit: "벡터적분", concept: "벡터 미적분 항등식", difficulty: "medium",
    question: "스칼라 함수 $f,g$와 벡터함수 $\\vec F$에 대해 다음 중 옳은 것은?",
    options: [
      o("1","$\\text{div}(f\\vec F)=f\\,\\text{div}\\vec F+\\vec F\\nabla f$"),
      o("2","$\\text{div}(f\\nabla g)=f\\nabla^2 g+g\\nabla^2 f$"),
      o("3","$\\text{curl}(f\\vec F)=\\nabla f\\times\\vec F+f\\,\\text{curl}\\vec F$"),
      o("4","$\\nabla^2 f=f(\\nabla f)$")
    ],
    answer: 3,
    explanation: "곱 미분 항등식: $\\text{curl}(f\\vec F)=\\nabla f\\times\\vec F+f\\,\\text{curl}\\vec F$ ✓.\n(1) 좌변=$f\\,\\text{div}\\vec F+\\vec F\\cdot\\nabla f$ (점곱 누락).\n(2) 좌변=$\\nabla f\\cdot\\nabla g+f\\nabla^2 g$.\n(4) $\\nabla^2 f$는 스칼라."
  }),
  build({
    num: 13, subject: "공학수학", unit: "벡터적분", concept: "발산정리", difficulty: "medium",
    question: "$S$는 포물면 $z=x^2+y^2$과 평면 $z=1$로 둘러싸인 곡면이고 $\\vec F=\\langle 3y,x^2,2z^2\\rangle$일 때 $\\!\\displaystyle\\iint_S\\vec F\\cdot d\\vec S$는? (단, 곡면 $S$의 법선벡터는 외부 방향)",
    options: [o("1","$\\dfrac{\\pi}{3}$"), o("2","$\\dfrac{2\\pi}{3}$"), o("3","$\\pi$"), o("4","$\\dfrac{4\\pi}{3}$")],
    answer: 4,
    explanation: "발산정리: $\\text{div}\\vec F=0+0+4z=4z$.\n$\\!\\iiint_V 4z\\,dV=\\!\\int_0^{2\\pi}\\!\\!\\int_0^1\\!\\!\\int_{r^2}^1 4z\\cdot r\\,dz\\,dr\\,d\\theta=2\\pi\\!\\int_0^1 2r(1-r^4)dr=2\\pi(1-\\tfrac{1}{3})\\cdot\\dotsb$\n$=4\\pi\\!\\int_0^1(r-r^5)dr=4\\pi(\\tfrac{1}{2}-\\tfrac{1}{6})=\\dfrac{4\\pi}{3}$."
  }),
  build({
    num: 14, subject: "공학수학", unit: "미분방정식", concept: "완전미분방정식", difficulty: "medium",
    question: "다음 미분방정식의 해는? $(2xy-\\sec^2 x)dx+(x^2+3y^2)dy=0,\\;y(0)=-1$",
    options: [o("1","$x^2 y-\\tan x+y^3=-1$"), o("2","$x^2 y+\\tan x-y^3=1$"), o("3","$xy^2-\\tan x+y^3=-1$"), o("4","$x^2 y+\\tan x-y^3=-1$")],
    answer: 1,
    explanation: "$M_y=2x=N_x$ ⇒ 완전.\n$F=\\!\\int(2xy-\\sec^2 x)dx=x^2 y-\\tan x+g(y)$. $F_y=x^2+g'(y)=x^2+3y^2$ ⇒ $g=y^3$.\n해: $x^2 y-\\tan x+y^3=C$. $(0,-1)$: $-1=C$.\n$x^2 y-\\tan x+y^3=-1$."
  }),
  build({
    num: 15, subject: "공학수학", unit: "미분방정식", concept: "코시-오일러(복소근)", difficulty: "mediumHard",
    question: "다음 미분방정식에서 $y(e^{\\pi/4})$은?\n\n$4x^2 y''+8xy'+5y=0,\\;y(1)=e^{\\pi},\\;y(e^{\\pi/2})=e^{3\\pi/4}$",
    options: [
      o("1","$\\dfrac{1}{\\sqrt 2}e^{-7\\pi/8}$"),
      o("2","$\\sqrt 2 e^{-7\\pi/8}$"),
      o("3","$\\dfrac{1}{\\sqrt 2}e^{7\\pi/8}$"),
      o("4","$\\sqrt 2 e^{7\\pi/8}$")
    ],
    answer: 4,
    explanation: "보조: $4t(t-1)+8t+5=4t^2+4t+5=0$ ⇒ $t=\\dfrac{-1\\pm 2i}{2}$.\n$y=x^{-1/2}\\{c_1\\cos(\\ln x)+c_2\\sin(\\ln x)\\}$.\n$y(1)=c_1=e^\\pi$. $y(e^{\\pi/2})=e^{-\\pi/4}\\{c_1\\cos(\\pi/2)+c_2\\sin(\\pi/2)\\}=e^{-\\pi/4}c_2=e^{3\\pi/4}$ ⇒ $c_2=e^\\pi$.\n$y(e^{\\pi/4})=e^{-\\pi/8}\\cdot e^\\pi\\{\\cos(\\pi/4)+\\sin(\\pi/4)\\}=e^{7\\pi/8}\\cdot\\sqrt 2=\\sqrt 2 e^{7\\pi/8}$."
  }),
  build({
    num: 16, subject: "공학수학", unit: "미분방정식", concept: "3계 비제차(라플라스)", difficulty: "mediumHard",
    question: "다음 미분방정식에서 $y(1)$은?\n\n$y'''+3y''+3y'+y=30 e^{-x},\\;y(0)=3,\\;y'(0)=-3,\\;y''(0)=-47$",
    options: [o("1","$-23e^{-1}$"), o("2","$-17e^{-1}$"), o("3","$e^{-1}$"), o("4","$5e^{-1}$")],
    answer: 2,
    explanation: "특성: $(s+1)^3=0$ 삼중근. 우변 $30e^{-x}$도 공명.\n라플라스: $(s+1)^3 Y-3s^2-3s+47-3(3s+47)+3(\\dots)\\dotsb$ ... 풀면\n$y(x)=e^{-x}(5x^3+3-25x^2)$. $y(1)=e^{-1}(5+3-25)=-17e^{-1}$."
  }),
  build({
    num: 17, subject: "공학수학", unit: "라플라스변환", concept: "역라플라스·부분분수", difficulty: "easy",
    question: "$\\mathcal{L}^{-1}\\!\\left\\{\\dfrac{s}{s^2+8s+7}\\right\\}$은?",
    options: [
      o("1","$-\\dfrac{1}{8}(e^{-t}-7e^{-7t})$"),
      o("2","$\\dfrac{1}{8}(e^{t}-7e^{7t})$"),
      o("3","$-\\dfrac{1}{6}(e^{-t}-7e^{-7t})$"),
      o("4","$\\dfrac{1}{6}(e^{t}-7e^{7t})$")
    ],
    answer: 3,
    explanation: "$\\dfrac{s}{(s+1)(s+7)}=\\dfrac{-1/6}{s+1}+\\dfrac{7/6}{s+7}$.\n역변환: $-\\dfrac{1}{6}e^{-t}+\\dfrac{7}{6}e^{-7t}=-\\dfrac{1}{6}(e^{-t}-7e^{-7t})$."
  }),
  build({
    num: 18, subject: "선형대수", unit: "행렬", concept: "대각화·고유값 곱(=det)", difficulty: "easy",
    question: "행렬 $A=\\!\\begin{pmatrix}2&0&-2\\\\1&3&2\\\\0&0&3\\end{pmatrix}$를 $A=QDQ^{-1}$의 형태로 표현할 때 대각행렬 $D$의 모든 대각원소들의 곱은?",
    options: [o("1","$0$"), o("2","$6$"), o("3","$-12$"), o("4","$18$")],
    answer: 4,
    explanation: "고유값의 곱 $=\\det A=2(9-0)-0+(-2)(0-0)=18$ ($D$ 대각원소가 고유값)."
  }),
  build({
    num: 19, subject: "선형대수", unit: "행렬", concept: "선형대수 명제 참/거짓", difficulty: "medium",
    question: "다음 명제 중에서 참인 것의 개수는?\n\n(ㄱ) 벡터 $(4,2,3),(1,-2,1),(0,2,-2)$들은 1차 독립이다.\n(ㄴ) 행렬 $B$의 역행렬이 존재하지 않으면 $B$는 대각화될 수 없다.\n(ㄷ) 동일한 고윳값으로부터 유도되는 서로 다른 두 개의 고유벡터는 항상 1차 종속이다.\n(ㄹ) 행렬 $\\!\\begin{pmatrix}1&5&13\\\\2&1&-1\\\\3&9&21\\end{pmatrix}$의 계수(rank)는 $2$이다.",
    options: [o("1","$1$개"), o("2","$2$개"), o("3","$3$개"), o("4","$4$개")],
    answer: 2,
    explanation: "(ㄱ) 행렬식 계산: $4(4-2)-2(-2-3)+3(2-0)=8+10+6=24\\ne 0$ ⇒ 독립 [참].\n(ㄴ) 영행렬도 대각화 가능 [거짓].\n(ㄷ) 같은 고윳값의 서로 다른 고유벡터는 일반적으로 독립 [거짓].\n(ㄹ) $R_3=3R_1-2R_2$ 형태 확인 → rank 2 [참].\n참: 2개."
  }),
  build({
    num: 20, subject: "선형대수", unit: "행렬", concept: "고유벡터·놈", difficulty: "medium",
    question: "행렬 $\\!\\begin{pmatrix}-1&1/3\\\\-3&-1\\end{pmatrix}$이 고유벡터 $\\vec e=[1\\;b]^T$를 가질 때 $\\vec e$의 노름(norm)은?",
    options: [o("1","$\\sqrt 8$"), o("2","$8$"), o("3","$\\sqrt{10}$"), o("4","$10$")],
    answer: 3,
    explanation: "특성: $\\lambda^2+2\\lambda+2=0$ ⇒ $\\lambda=-1\\pm i$.\n$\\lambda=-1+i$일 때 고유벡터: $(A-\\lambda I)\\vec e=0$ ⇒ 비례식 $1:b=1/3:-i$... 풀면 $b=\\pm 3i$.\n$\\|(1,\\pm 3i)\\|=\\sqrt{1+9}=\\sqrt{10}$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 서울과기대):`, data.map((d) => d.id).join(", "));
