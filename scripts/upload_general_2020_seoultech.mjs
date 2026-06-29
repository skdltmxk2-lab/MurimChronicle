// Upload 2020년도 서울과기대 편입수학 기출 20문항 (4지 선다형)
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
const YEAR = "2020";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-seoultech-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "도함수", concept: "역쌍곡함수 미분", difficulty: "easy",
    question: "함수 $y=\\sinh^{-1}x$의 도함수와 같은 것은?",
    options: [
      o("1","$\\sin(\\tan^{-1}x)$"),
      o("2","$\\cos(\\tan^{-1}x)$"),
      o("3","$\\dfrac{1}{\\sqrt{1-x^2}}$"),
      o("4","$\\dfrac{1}{\\sqrt{x^2-1}}$")
    ],
    answer: 2,
    explanation: "$(\\sinh^{-1}x)'=\\dfrac{1}{\\sqrt{1+x^2}}$.\n$\\cos(\\tan^{-1}x)$: $\\tan\\alpha=x$일 때 $\\cos\\alpha=\\dfrac{1}{\\sqrt{1+x^2}}$ ✓."
  }),
  build({
    num: 2, subject: "미분학", unit: "도함수", concept: "위치·속도·가속도(이동거리)", difficulty: "medium",
    question: "어떤 물체의 시각 $t$일 때 위치가 $f(t)=\\cos t+\\sqrt 3\\sin t$이다. 이 물체의 가속도가 최소에서 최대로 될 때까지 이동한 거리가 될 수 있는 것은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$4$"), o("4","$6$")],
    answer: 3,
    explanation: "$f(t)=2\\sin(t+\\pi/6)$. $f'(t)=2\\cos(t+\\pi/6)$. $f''(t)=-2\\sin(t+\\pi/6)$.\n가속도 극소 $t=\\pi/3$, 극대 $t=4\\pi/3$.\n이동거리 $=\\!\\int_{\\pi/3}^{4\\pi/3}|f'(t)|dt=4$."
  }),
  build({
    num: 3, subject: "공학수학", unit: "수치해석", concept: "뉴턴 방법", difficulty: "medium",
    question: "뉴턴의 방법을 이용하여 $\\sqrt[3]3$의 근사값을 구할 때 $x_1=1$이면 $x_3$의 값은?",
    options: [o("1","$\\dfrac{5}{3}$"), o("2","$\\dfrac{13}{9}$"), o("3","$\\dfrac{331}{225}$"), o("4","$\\dfrac{487}{325}$")],
    answer: 3,
    explanation: "$f(x)=x^3-3$, $f'(x)=3x^2$. $x_{n+1}=x_n-\\dfrac{f(x_n)}{f'(x_n)}$.\n$x_1=1$: $x_2=1-\\dfrac{-2}{3}=\\dfrac{5}{3}$.\n$x_2=\\dfrac{5}{3}$: $f(5/3)=125/27-3=44/27$, $f'(5/3)=25/3$. $x_3=\\dfrac{5}{3}-\\dfrac{44/27}{25/3}=\\dfrac{5}{3}-\\dfrac{44}{225}=\\dfrac{331}{225}$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분", concept: "치환적분 $x^5 e^{x^2}$", difficulty: "medium",
    question: "정적분 $\\!\\displaystyle\\int_0^1 x^5 e^{x^2}\\,dx$의 값은?",
    options: [o("1","$\\dfrac{1}{2}e-1$"), o("2","$\\dfrac{1}{2}e$"), o("3","$e-1$"), o("4","$e$")],
    answer: 1,
    explanation: "$x^2=t$ 치환, $x\\,dx=\\dfrac{1}{2}dt$. $x:0\\to 1$ ⇒ $t:0\\to 1$.\n$\\dfrac{1}{2}\\!\\int_0^1 t^2 e^t\\,dt=\\dfrac{1}{2}[t^2 e^t-2te^t+2e^t]_0^1=\\dfrac{1}{2}(e-2)=\\dfrac{1}{2}e-1$."
  }),
  build({
    num: 5, subject: "적분학", unit: "정적분", concept: "심장곡선 넓이×길이", difficulty: "medium",
    question: "극곡선 $r=1+\\sin\\theta$에 의해 둘러싸인 영역의 넓이를 $a$, 둘레의 길이를 $b$라 할 때 $ab$의 값은?",
    options: [o("1","$16\\pi$"), o("2","$16\\pi^2$"), o("3","$12\\pi$"), o("4","$12\\pi^2$")],
    answer: 3,
    explanation: "심장곡선 $r=a(1+\\sin\\theta)$의 넓이 $=\\dfrac{3\\pi}{2}a^2$, 길이 $=8a$. $a=1$: 넓이 $\\dfrac{3\\pi}{2}$, 길이 $8$. 곱 $=12\\pi$."
  }),
  build({
    num: 6, subject: "적분학", unit: "급수", concept: "테일러 부등식·오차한계", difficulty: "medium",
    question: "구간 $[3,5]$에서 함수 $f(x)=\\sqrt x$의 근삿값을 $a=4$에서의 $2$차 테일러 다항식을 이용하여 구할 때 테일러 부등식에 의한 오차의 한계로 가장 적절한 것은?\n\n(단, $\\dfrac{1}{3^{5/2}}\\approx 0.064,\\;\\dfrac{1}{4^{5/2}}\\approx 0.031,\\;\\dfrac{1}{5^{5/2}}\\approx 0.018$)",
    options: [o("1","$0.003$"), o("2","$0.004$"), o("3","$0.005$"), o("4","$0.006$")],
    answer: 2,
    explanation: "$|R_3(x)|\\le\\dfrac{M}{3!}|x-4|^3$, $M=\\max|f'''|$.\n$f'''(x)=\\dfrac{3}{8}x^{-5/2}$. 구간 $[3,5]$에서 최대는 $x=3$: $\\dfrac{3}{8}\\cdot 0.064=0.024$.\n오차한계 $=\\dfrac{0.024}{6}\\cdot 1^3=0.004$."
  }),
  build({
    num: 7, subject: "다변수함수", unit: "공간도형", concept: "두 직선 사이의 거리(꼬임 직선)", difficulty: "medium",
    question: "다음 두 직선 사이의 거리는?\n\n$L_1: x=\\dfrac{y-3}{4}=z+3,\\;L_2:\\dfrac{x-1}{2}=y+2=\\dfrac{z-4}{2}$",
    options: [o("1","$3\\sqrt 2$"), o("2","$4\\sqrt 2$"), o("3","$6$"), o("4","$8$")],
    answer: 1,
    explanation: "$L_1$ 방향 $(1,4,1)$, 점 $(0,3,-3)$. $L_2$ 방향 $(2,1,2)$, 점 $(1,-2,4)$.\n$L_1\\times L_2=(8-1,2-2,1-8)=(7,0,-7)$.\n평면 $7x-7z=21$, 즉 $x-z=3$.\n$L_2$ 위의 점 $(1,-2,4)$와 평면 거리 $=\\dfrac{|1-4-3|}{\\sqrt 2}=\\dfrac{6}{\\sqrt 2}=3\\sqrt 2$."
  }),
  build({
    num: 8, subject: "다변수함수", unit: "편미분", concept: "타원·산술기하 부등식", difficulty: "medium",
    question: "곡선 $4x^2+y^2=8$에서 정의된 함수 $f(x,y)=xy$의 최댓값과 최솟값의 곱은?",
    options: [o("1","$-2\\sqrt 2$"), o("2","$-4$"), o("3","$-4\\sqrt 2$"), o("4","$-8$")],
    answer: 2,
    explanation: "AM-GM: $4x^2+y^2\\ge 2\\sqrt{4x^2 y^2}=4|xy|$ ⇒ $|xy|\\le 2$, $-2\\le xy\\le 2$.\n곱 $=2\\cdot(-2)=-4$."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "중적분", concept: "평행사변형 영역·치환", difficulty: "medium",
    question: "네 점 $(0,0),(1,1),(2,0),(1,-1)$을 꼭짓점으로 하는 사각형의 경계와 내부를 $D$라 할 때 $\\!\\displaystyle\\iint_D(x+y)e^{x^2-y^2}\\,dA$의 값은?",
    options: [
      o("1","$\\dfrac{1}{8}(e^4-5)$"),
      o("2","$\\dfrac{1}{4}(e^4-5)$"),
      o("3","$\\dfrac{1}{2}(e^4-5)$"),
      o("4","$e^4-5$")
    ],
    answer: 2,
    explanation: "$u=x-y,\\,v=x+y$ 치환. 사각형 변: $x-y=0,2$; $x+y=0,2$. ⇒ $0\\le u\\le 2,\\,0\\le v\\le 2$.\n야코비안 $=\\dfrac{1}{2}$. $x^2-y^2=uv$.\n$\\!\\iint v e^{uv}\\cdot\\dfrac{1}{2}du\\,dv=\\dfrac{1}{2}\\!\\int_0^2[e^{uv}]_0^2 dv=\\dfrac{1}{2}\\!\\int_0^2(e^{2v}-1)dv=\\dfrac{1}{2}\\!\\left[\\dfrac{e^4-1}{2}-2\\right]=\\dfrac{e^4-5}{4}$."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "중적분", concept: "구면좌표 삼중적분", difficulty: "medium",
    question: "다음 반복적분의 값은?\n\n$\\!\\displaystyle\\int_{-1}^{1}\\!\\!\\int_{-\\sqrt{1-x^2}}^{\\sqrt{1-x^2}}\\!\\!\\int_{\\sqrt{3(x^2+y^2)}}^{\\sqrt{4-x^2-y^2}}(x^2+y^2+z^2)\\,dz\\,dy\\,dx$",
    options: [
      o("1","$\\dfrac{8}{3}(2-\\sqrt 3)\\pi$"),
      o("2","$\\dfrac{8}{9}\\pi^2$"),
      o("3","$\\dfrac{32}{5}(2-\\sqrt 3)\\pi$"),
      o("4","$\\dfrac{4}{3}\\pi^2$")
    ],
    answer: 3,
    explanation: "구면좌표: $\\rho\\le 2$, $\\phi\\le\\pi/6$ (원뿔 $z=\\sqrt{3r^2}$).\n$\\!\\int_0^{2\\pi}\\!\\!\\int_0^{\\pi/6}\\!\\!\\int_0^2\\rho^2\\cdot\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta=2\\pi\\cdot(1-\\tfrac{\\sqrt 3}{2})\\cdot\\dfrac{32}{5}=\\dfrac{32}{5}(2-\\sqrt 3)\\pi$."
  }),
  build({
    num: 11, subject: "공학수학", unit: "벡터적분", concept: "평행이동·벡터장 선적분", difficulty: "medium",
    question: "네 점 $(10,10),(-10,10),(-10,-10),(10,-10)$을 꼭짓점으로 하는 사각형의 경계를 반시계방향으로 한 바퀴 도는 곡선 $C$와 벡터장\n\n$\\vec F=\\dfrac{1}{(x-1)^2+(y-1)^2}\\langle 1-y,x-1\\rangle+\\dfrac{1}{(x+1)^2+(y+1)^2}\\langle -1-y,x+1\\rangle$\n\n에 대하여 $\\!\\displaystyle\\int_C\\vec F\\cdot d\\vec r$의 값은?",
    options: [o("1","$0$"), o("2","$2\\pi$"), o("3","$-2\\pi$"), o("4","$4\\pi$")],
    answer: 4,
    explanation: "각 항은 $(1,1)$, $(-1,-1)$ 중심에서 반시계 단위벡터장 $\\dfrac{1}{r^2}(-y,x)$의 평행이동. 각각 닫힌 경로 적분 $=2\\pi$.\n합 $=2\\pi+2\\pi=4\\pi$."
  }),
  build({
    num: 12, subject: "공학수학", unit: "벡터적분", concept: "구면 유량·발산정리", difficulty: "mediumHard",
    question: "곡면 $S$가 중심이 원점이고 반지름 $1$인 구면일 때 벡터장 $\\vec F=e^{-x^2-y^2-z^2}\\langle x,y,z\\rangle$가 곡면 $S$를 빠져나가는 유량 $\\!\\displaystyle\\iint_S\\vec F\\cdot d\\vec S$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{e}$"), o("2","$\\dfrac{4\\pi}{3e}$"), o("3","$\\dfrac{2\\pi}{e}$"), o("4","$\\dfrac{4\\pi}{e}$")],
    answer: 4,
    explanation: "단위 외향벡터 $\\vec n=(x,y,z)$ ($S$ 위에서 $|\\vec n|=1$).\n$\\vec F\\cdot\\vec n=e^{-1}(x^2+y^2+z^2)=e^{-1}\\cdot 1=e^{-1}$ (S 위).\n$\\!\\iint_S e^{-1}\\,dS=e^{-1}\\cdot 4\\pi=\\dfrac{4\\pi}{e}$."
  }),
  build({
    num: 13, subject: "공학수학", unit: "미분방정식", concept: "농도 변화 1계 선형", difficulty: "medium",
    question: "용량이 $100L$인 탱크에 $15kg$의 소금이 녹아있는 소금물이 $50L$ 들어있다. $L$당 $0.5kg$의 소금이 녹아있는 소금물이 분당 $4L$씩 탱크 안으로 들어가서 완전히 섞인 후 반대쪽으로 분당 $2L$씩 탱크 밖으로 흘러나간다. 소금물이 탱크에 가득 차는 순간 탱크 안의 소금의 양은?",
    options: [o("1","$25kg$"), o("2","$40kg$"), o("3","$45kg$"), o("4","$50kg$")],
    answer: 3,
    explanation: "$y(t)$: 소금량. $y'=2-\\dfrac{2}{50+2t}y$. $V=50+2t=100$ ⇒ $t=25$.\n적분인자 $50+2t$: $y'+\\dfrac{1}{25+t}y=2$.\n해 $y(t)=\\dfrac{1}{t+25}[50t+t^2+C]$. $y(0)=15$ ⇒ $C=375$.\n$y(25)=\\dfrac{1}{50}(1250+625+375)=\\dfrac{2250}{50}=45$."
  }),
  build({
    num: 14, subject: "공학수학", unit: "미분방정식", concept: "3계 상수계수(라플라스)", difficulty: "mediumHard",
    question: "초기값 문제 $y'''-2y''+y'-2y=0,\\;y(0)=5,\\;y'(0)=3,\\;y''(0)=5$에 대하여 $y\\!\\left(\\dfrac{\\pi}{2}\\right)$의 값은?",
    options: [o("1","$2e^\\pi-2$"), o("2","$2e^\\pi-1$"), o("3","$2e^\\pi+2$"), o("4","$2e^\\pi+3$")],
    answer: 2,
    explanation: "특성: $s^3-2s^2+s-2=(s-2)(s^2+1)=0$.\n$y=Ae^{2t}+B\\cos t+C\\sin t$. 초기값: $A+B=5,\\;2A+C=3,\\;4A-B=5$ ⇒ $A=2,B=3,C=-1$.\n$y=2e^{2t}+3\\cos t-\\sin t$. $y(\\pi/2)=2e^\\pi+0-1=2e^\\pi-1$."
  }),
  build({
    num: 15, subject: "공학수학", unit: "라플라스변환", concept: "라플라스 명제 참/거짓", difficulty: "medium",
    question: "라플라스 변환에 대한 다음 식 중 맞는 것의 개수는?\n\nㄱ. $\\mathcal{L}(\\cos 2t)=\\dfrac{2}{s^2+4}$\nㄴ. $\\mathcal{L}^{-1}\\!\\left(\\dfrac{1}{s(s-3)}\\right)=\\!\\int_0^t e^{3\\tau}d\\tau$\nㄷ. $\\mathcal{L}(e^{2t}t^3)=\\dfrac{6}{(s-2)^4}$\nㄹ. $\\mathcal{L}^{-1}\\!\\left(\\dfrac{1}{s^2+4}e^{-\\pi s}\\right)=\\dfrac{1}{2}\\sin 2t$\nㅁ. $\\mathcal{L}(\\delta(t-a))=e^{as}$",
    options: [o("1","$2$개"), o("2","$3$개"), o("3","$4$개"), o("4","$5$개")],
    answer: 1,
    explanation: "ㄱ 거짓: $\\dfrac{s}{s^2+4}$.\nㄴ 참.\nㄷ 참.\nㄹ 거짓: $\\dfrac{1}{2}\\sin(2(t-\\pi))U(t-\\pi)=\\dfrac{1}{2}\\sin 2t\\cdot U(t-\\pi)$.\nㅁ 거짓: $e^{-as}$.\n참: ㄴ,ㄷ → $2$개."
  }),
  build({
    num: 16, subject: "공학수학", unit: "미분방정식", concept: "연립 1계 ODE", difficulty: "mediumHard",
    question: "연립미분방정식 $y_1'=y_1-4y_2,\\;y_2'=y_1+5y_2,\\;y_1(0)=4,\\;y_2(0)=-3$에 대하여 $y_1+y_2$는?",
    options: [o("1","$-2e^{3t}$"), o("2","$2te^{3t}$"), o("3","$(t+1)e^{3t}$"), o("4","$(2t+1)e^{3t}$")],
    answer: 4,
    explanation: "$u=y_1+y_2$, $u'=y_1'+y_2'=2y_1+y_2$. 다시 정리 후 $u''-6u'+9u=0$.\n특성 $(s-3)^2=0$. $u(0)=1,\\,u'(0)=2y_1(0)+y_2(0)=5$.\n$u=(c_1+c_2 t)e^{3t}$. $c_1=1,3+c_2=5⇒c_2=2$.\n$u=(1+2t)e^{3t}=(2t+1)e^{3t}$."
  }),
  build({
    num: 17, subject: "선형대수", unit: "행렬", concept: "행렬다항식·고유값", difficulty: "medium",
    question: "행렬 $A=\\!\\begin{pmatrix}1&4\\\\2&3\\end{pmatrix}$에 대하여 $A^3-3A+2I$의 고유값의 합은?",
    options: [o("1","$107$"), o("2","$112$"), o("3","$116$"), o("4","$134$")],
    answer: 3,
    explanation: "$A$의 특성 $\\lambda^2-4\\lambda-5=0$ ⇒ $\\lambda=-1,5$.\n$\\lambda=-1$: $-1-3(-1)+2=4$.\n$\\lambda=5$: $125-15+2=112$.\n합 $=116$."
  }),
  build({
    num: 18, subject: "선형대수", unit: "행렬", concept: "비제차 연립방정식 해 조건", difficulty: "mediumHard",
    question: "연립방정식 $\\!\\begin{pmatrix}2&6&6&4\\\\2&6&9&5\\\\-1&-3&3&0\\end{pmatrix}\\!\\begin{pmatrix}x_1\\\\x_2\\\\x_3\\\\x_4\\end{pmatrix}=\\!\\begin{pmatrix}b_1\\\\b_2\\\\b_3\\end{pmatrix}$이 모든 $b_1,b_2,b_3$에 대해서 근을 가질 필요충분조건이 $\\alpha b_1+\\beta b_2+2b_3=0$일 때 $\\alpha+\\beta$의 값은?",
    options: [o("1","$-1$"), o("2","$1$"), o("3","$-2$"), o("4","$2$")],
    answer: 2,
    explanation: "계수행렬의 열공간 한 원소 $(2,2,-1)$을 조건식에 대입: $2\\alpha+2\\beta-2=0$ ⇒ $\\alpha+\\beta=1$."
  }),
  build({
    num: 19, subject: "선형대수", unit: "행렬", concept: "대각화 불가능 조건(중근)", difficulty: "medium",
    question: "행렬 $\\!\\begin{pmatrix}2&2\\\\c&-1\\end{pmatrix}$이 대각화가능하지 않게 되는 상수 $c$의 값은?",
    options: [o("1","$\\dfrac{7}{4}$"), o("2","$-\\dfrac{7}{8}$"), o("3","$\\dfrac{9}{4}$"), o("4","$-\\dfrac{9}{8}$")],
    answer: 4,
    explanation: "특성: $\\lambda^2-\\lambda-(2+2c)=0$. 중근 조건 $D=1+4(2+2c)=9+8c=0$ ⇒ $c=-\\dfrac{9}{8}$."
  }),
  build({
    num: 20, subject: "선형대수", unit: "행렬", concept: "영공간 벡터", difficulty: "easy",
    question: "다음 행렬의 영공간(null space)에 있는 벡터는?\n\n$\\!\\begin{pmatrix}1&0&0\\\\1&-1&1\\\\2&-1&1\\end{pmatrix}$",
    options: [
      o("1","$\\!\\begin{pmatrix}1\\\\0\\\\0\\end{pmatrix}$"),
      o("2","$\\!\\begin{pmatrix}1\\\\1\\\\0\\end{pmatrix}$"),
      o("3","$\\!\\begin{pmatrix}0\\\\1\\\\0\\end{pmatrix}$"),
      o("4","$\\!\\begin{pmatrix}0\\\\1\\\\1\\end{pmatrix}$")
    ],
    answer: 4,
    explanation: "$A\\vec v=\\vec 0$ 검증: $(0,1,1)^T$ 대입 ⇒ $(0,0,0)^T$ ✓ ($1\\cdot 0+0\\cdot 1+0\\cdot 1=0$; $1\\cdot 0-1\\cdot 1+1\\cdot 1=0$; $2\\cdot 0-1\\cdot 1+1\\cdot 1=0$)."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 서울과기대):`, data.map((d) => d.id).join(", "));
