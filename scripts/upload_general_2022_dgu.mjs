// Upload 2022년도 동국대 편입수학 기출 20문항 (5지 선다형, 90분)
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

const SCHOOL = "동국대";
const YEAR = "2022";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-dgu-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "극한 존재 판정(가우스 함수)", difficulty: "medium",
    question: "다음 보기 중 극한이 존재하는 것을 모두 고르면? (단, $[x]$는 $x$를 넘지 않는 최대 정수)\n\nA. $\\!\\displaystyle\\lim_{x\\to 1^+}\\dfrac{\\sqrt{x-1}}{2x+1}$\nB. $\\!\\displaystyle\\lim_{x\\to 0}\\dfrac{\\sin x}{x}$\nC. $\\!\\displaystyle\\lim_{x\\to 0}\\dfrac{x}{|x|}$\nD. $\\!\\displaystyle\\lim_{x\\to 2^+}\\dfrac{(x^2+1)[x]}{(3x-1)^2}$",
    options: [o("1","A, B"), o("2","B"), o("3","B, C"), o("4","A, D"), o("5","A, B, D")],
    answer: 5,
    explanation: "A: $=0$ 존재.\nB: $=1$ 존재.\nC: 좌극한 $-1$, 우극한 $1$ ⇒ 발산.\nD: $x\\to 2^+$, $[x]=2$ ⇒ $\\dfrac{5\\cdot 2}{25}=\\dfrac{2}{5}$ 존재.\n수렴: A, B, D."
  }),
  build({
    num: 2, subject: "미분학", unit: "극한과 연속", concept: "다항식 함수 결정", difficulty: "medium",
    question: "다항식 $P(x)$로 정의된 함수 $f(x)=\\dfrac{P(x)}{x^2+x-2}$가 $\\!\\displaystyle\\lim_{x\\to 1}f(x)=1,\\;\\!\\displaystyle\\lim_{x\\to\\infty}f(x)=2$를 만족할 때 $f(0)$의 값은?",
    options: [o("1","$-2$"), o("2","$-\\dfrac{1}{2}$"), o("3","$0$"), o("4","$\\dfrac{1}{2}$"), o("5","$2$")],
    answer: 4,
    explanation: "$x=1$에서 분모 $=0$ → $P(1)=0$. 로피탈: $P'(1)=3$.\n$\\!\\lim_{x\\to\\infty}=2$ ⇒ $P$ 2차, 최고차 $2$. $P(x)=2x^2+ax+b$. $P(1)=2+a+b=0$, $P'(1)=4+a=3$ ⇒ $a=-1,b=-1$.\n$P(0)=-1$. $f(0)=\\dfrac{-1}{-2}=\\dfrac{1}{2}$."
  }),
  build({
    num: 3, subject: "적분학", unit: "정적분", concept: "쉘 회전체 부피", difficulty: "medium",
    question: "포물선 $y=2x^2$의 위쪽, 포물선 $y=3-x^2$의 아래쪽 영역을 $y$축으로 회전하여 생기는 입체의 부피는?",
    options: [o("1","$\\dfrac{3\\pi}{2}$"), o("2","$\\dfrac{2\\pi}{3}$"), o("3","$2\\pi$"), o("4","$\\pi$"), o("5","$\\dfrac{\\pi}{2}$")],
    answer: 1,
    explanation: "교점: $2x^2=3-x^2$ ⇒ $x=\\pm 1$. 쉘: $V=2\\pi\\!\\int_0^1 x\\{(3-x^2)-2x^2\\}dx=2\\pi\\!\\int_0^1(3x-3x^3)dx=2\\pi\\!\\left(\\dfrac{3}{2}-\\dfrac{3}{4}\\right)=\\dfrac{3\\pi}{2}$."
  }),
  build({
    num: 4, subject: "미분학", unit: "도함수", concept: "역함수 미분", difficulty: "easy",
    question: "함수 $f(x)=2x^3+x-3$일 때 $(f^{-1})'(0)$의 값은?",
    options: [o("1","$\\dfrac{1}{7}$"), o("2","$\\dfrac{1}{5}$"), o("3","$\\dfrac{1}{3}$"), o("4","$1$"), o("5","$3$")],
    answer: 1,
    explanation: "$f(1)=0$ ⇒ $f^{-1}(0)=1$. $f'(x)=6x^2+1$, $f'(1)=7$.\n$(f^{-1})'(0)=\\dfrac{1}{f'(1)}=\\dfrac{1}{7}$."
  }),
  build({
    num: 5, subject: "미분학", unit: "도함수", concept: "평균값 정리", difficulty: "easy",
    question: "함수 $f(x)=x+\\dfrac{1}{x}$가 구간 $[1,4]$에서 미분의 평균값 정리를 만족하는 $c$의 값은?",
    options: [o("1","$\\dfrac{3}{2}$"), o("2","$2$"), o("3","$\\dfrac{5}{2}$"), o("4","$3$"), o("5","$\\dfrac{7}{2}$")],
    answer: 2,
    explanation: "$\\dfrac{f(4)-f(1)}{3}=\\dfrac{17/4-2}{3}=\\dfrac{3}{4}$.\n$f'(c)=1-\\dfrac{1}{c^2}=\\dfrac{3}{4}$ ⇒ $c^2=4$ ⇒ $c=2$."
  }),
  build({
    num: 6, subject: "적분학", unit: "정적분", concept: "질량중심(1차원)", difficulty: "medium",
    question: "선분 $0\\le x\\le 10$ 모양 철사의 점 $x$에서 질량 밀도 함수가 $\\delta(x)=\\sqrt x$일 때 질량 중심의 위치는?",
    options: [o("1","$4$"), o("2","$5$"), o("3","$6$"), o("4","$7$"), o("5","$8$")],
    answer: 3,
    explanation: "$\\bar x=\\dfrac{\\!\\int_0^{10}x\\sqrt x\\,dx}{\\!\\int_0^{10}\\sqrt x\\,dx}=\\dfrac{(2/5)\\cdot 10^{5/2}}{(2/3)\\cdot 10^{3/2}}=\\dfrac{3}{5}\\cdot 10=6$."
  }),
  build({
    num: 7, subject: "미분학", unit: "도함수", concept: "음함수 접선", difficulty: "medium",
    question: "곡선 $\\cos(xy)=x+y$ 위의 점 $P(0,1)$에서 접선의 방정식은?",
    options: [o("1","$y=-2x+1$"), o("2","$y=-x+1$"), o("3","$y=\\dfrac{1}{2}x+1$"), o("4","$y=x+1$"), o("5","$y=2x+1$")],
    answer: 2,
    explanation: "$F=\\cos(xy)-x-y$. $F_x=-y\\sin(xy)-1,\\,F_y=-x\\sin(xy)-1$.\n$(0,1)$: $F_x=-1,F_y=-1$. $y'=-\\dfrac{F_x}{F_y}=-1$.\n접선: $y-1=-1\\cdot x$ ⇒ $y=-x+1$."
  }),
  build({
    num: 8, subject: "적분학", unit: "정적분", concept: "변수상한 적분 미분", difficulty: "medium",
    question: "정적분의 미분 $\\dfrac{d}{dx}\\!\\left(\\!\\displaystyle\\int_x^{2x^2}\\sqrt{t^2+2}\\,dt\\right)$을 구하면?",
    options: [
      o("1","$\\sqrt{4x^4+2}-\\sqrt{x^2+2}$"),
      o("2","$2x\\sqrt{4x^4+2}-\\sqrt{x^2+2}$"),
      o("3","$4x\\sqrt{4x^4+2}-\\sqrt{x^2+2}$"),
      o("4","$2x^2\\sqrt{4x^4+2}-\\sqrt{x^2+2}$"),
      o("5","$4x^2\\sqrt{4x^4+2}-\\sqrt{x^2+2}$")
    ],
    answer: 3,
    explanation: "$=\\sqrt{(2x^2)^2+2}\\cdot 4x-\\sqrt{x^2+2}\\cdot 1=4x\\sqrt{4x^4+2}-\\sqrt{x^2+2}$."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "편미분", concept: "방향도함수", difficulty: "easy",
    question: "함수 $f(x,y)=x^2+xy-2y^2$에 대하여 점 $P(1,1)$에서 벡터 $\\vec v=\\!\\left(\\dfrac{4}{5},\\dfrac{3}{5}\\right)$ 방향으로 방향도함수는?",
    options: [o("1","$-\\dfrac{1}{5}$"), o("2","$0$"), o("3","$\\dfrac{1}{5}$"), o("4","$\\dfrac{2}{5}$"), o("5","$\\dfrac{3}{5}$")],
    answer: 5,
    explanation: "$\\nabla f=(2x+y,\\,x-4y)|_{(1,1)}=(3,-3)$.\n$\\nabla f\\cdot\\vec v=3\\cdot\\dfrac{4}{5}+(-3)\\cdot\\dfrac{3}{5}=\\dfrac{12-9}{5}=\\dfrac{3}{5}$."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "최댓값/최솟값", concept: "원점과 곡면 최단거리", difficulty: "medium",
    question: "3차원 공간에서 원점과 곡면 $x^2-y^2 z^2-4=0$ 사이의 거리는?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 2,
    explanation: "$d^2=x^2+y^2+z^2=4+y^2 z^2+y^2+z^2$ (제약 $x^2=4+y^2 z^2$).\n$y=0,z=0$일 때 최소: $d^2=4$ ⇒ $d=2$."
  }),
  build({
    num: 11, subject: "다변수함수", unit: "중적분", concept: "반원 영역 이중적분 표현", difficulty: "medium",
    question: "$x^2+y^2\\le 1,\\,y\\ge 0$으로 정의된 영역 $S$에서 적분가능한 함수 $f(x,y)$에 대해 다음 보기 중 이중적분 $\\!\\displaystyle\\iint_S f(x,y)dA$와 같은 것을 모두 고르면?\n\nA. $\\!\\int_{-1}^1\\!\\!\\int_0^{\\sqrt{1-x^2}}f(x,y)dy\\,dx$\nB. $\\!\\int_0^1\\!\\!\\int_{-\\sqrt{1-y^2}}^{\\sqrt{1-y^2}}f(x,y)dx\\,dy$\nC. $\\!\\int_0^\\pi\\!\\!\\int_0^1 f(r\\cos\\theta,r\\sin\\theta)dr\\,d\\theta$",
    options: [o("1","A"), o("2","B"), o("3","A, B"), o("4","B, C"), o("5","A, B, C")],
    answer: 3,
    explanation: "A 참 (수직 슬라이스).\nB 참 (수평 슬라이스).\nC 거짓 (극좌표 야코비안 $r$ 누락)."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "공간도형", concept: "점과 직선 거리(공간)", difficulty: "medium",
    question: "3차원 공간에서 점 $P(3,0,-1)$과 직선 $x-2=\\dfrac{y-1}{2}=z$ 사이의 거리는?",
    options: [o("1","$\\sqrt{\\dfrac{2}{3}}$"), o("2","$\\sqrt{\\dfrac{4}{3}}$"), o("3","$\\sqrt{\\dfrac{5}{3}}$"), o("4","$\\sqrt{\\dfrac{7}{3}}$"), o("5","$\\sqrt{\\dfrac{8}{3}}$")],
    answer: 4,
    explanation: "직선 $(2+t,1+2t,t)$. $\\vec{PQ}=(t-1,2t+1,t+1)$. 방향벡터 $(1,2,1)$.\n수직: $(t-1)+(4t+2)+(t+1)=6t+2=0$ ⇒ $t=-1/3$.\n$|\\vec{PQ}|=\\sqrt{(-4/3)^2+(1/3)^2+(2/3)^2}=\\sqrt{21/9}=\\sqrt{7/3}$."
  }),
  build({
    num: 13, subject: "선형대수", unit: "연립방정식", concept: "일반해 매개변수", difficulty: "medium",
    question: "연립일차방정식 $\\begin{cases}x_1+3x_2-2x_3=3\\\\ 2x_1+6x_2-2x_3+4x_4=18\\\\ x_2+x_3+3x_4=10\\end{cases}$의 일반해를 매개변수 $t$를 이용하여 표현하면?",
    options: [
      o("1","$x_1=3-t,\\,x_2=4-t,\\,x_3=6-2t,\\,x_4=t$"),
      o("2","$x_1=3+t,\\,x_2=4-t,\\,x_3=6-2t,\\,x_4=t$"),
      o("3","$x_1=3-t,\\,x_2=4+t,\\,x_3=6-2t,\\,x_4=t$"),
      o("4","$x_1=3-t,\\,x_2=4-t,\\,x_3=6+2t,\\,x_4=t$"),
      o("5","$x_1=3+t,\\,x_2=4+t,\\,x_3=6+2t,\\,x_4=t$")
    ],
    answer: 1,
    explanation: "행 축약: 세 번째 행에서 $x_3+2x_4=6$ ⇒ $x_3=6-2t$.\n둘째 행에서 $x_2+x_3+3x_4=10$ ⇒ $x_2=10-3t-(6-2t)=4-t$.\n첫째 행에서 $x_1+3(4-t)-2(6-2t)=3$ ⇒ $x_1=3-t$."
  }),
  build({
    num: 14, subject: "선형대수", unit: "행렬", concept: "고유값 합(trace)", difficulty: "easy",
    question: "행렬 $A=\\!\\begin{pmatrix}2&-1&-2\\\\2&-2&-1\\\\3&-2&-2\\end{pmatrix}$의 세 고유값의 합은?",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$0$"), o("4","$1$"), o("5","$2$")],
    answer: 1,
    explanation: "고유값 합 $=\\text{tr}(A)=2+(-2)+(-2)=-2$."
  }),
  build({
    num: 15, subject: "선형대수", unit: "행렬", concept: "rank 계산", difficulty: "medium",
    question: "행렬 $A=\\!\\begin{pmatrix}1&-1&0&0&1\\\\2&0&2&0&0\\\\0&0&0&0&3\\\\0&1&1&0&1\\end{pmatrix}$의 계수(rank)는?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 3,
    explanation: "행 축약하면 독립된 행 3개 ⇒ rank $=3$."
  }),
  build({
    num: 16, subject: "적분학", unit: "정적분", concept: "역쌍곡함수·완전제곱", difficulty: "medium",
    question: "적분 $\\!\\displaystyle\\int_1^3\\dfrac{dx}{\\sqrt{x^2-2x+5}}$의 값은?",
    options: [
      o("1","$\\ln(\\sqrt 2-1)$"),
      o("2","$\\ln(2+\\sqrt 2)$"),
      o("3","$\\ln(2-\\sqrt 2)$"),
      o("4","$\\ln(\\sqrt 2+1)$"),
      o("5","$\\ln(2\\sqrt 2+1)$")
    ],
    answer: 4,
    explanation: "$\\sqrt{(x-1)^2+4}$. $u=x-1$: $\\!\\int_0^2\\dfrac{du}{\\sqrt{u^2+4}}=[\\sinh^{-1}(u/2)]_0^2=\\sinh^{-1}1=\\ln(1+\\sqrt 2)$."
  }),
  build({
    num: 17, subject: "적분학", unit: "정적분", concept: "부분분수 적분", difficulty: "medium",
    question: "부정적분 $\\!\\displaystyle\\int\\dfrac{3x^2-x+4}{x^3-x^2-x+1}\\,dx$를 계산하면?",
    options: [
      o("1","$\\ln(x+1)^2|x-1|+\\dfrac{2}{x-1}+C$"),
      o("2","$\\ln(x+1)^2|x-1|+\\dfrac{1}{x-1}+C$"),
      o("3","$\\ln(x+1)^2|x-1|-\\dfrac{1}{x-1}+C$"),
      o("4","$\\ln(x+1)^2|x-1|-\\dfrac{2}{x-1}+C$"),
      o("5","$\\ln(x+1)^2|x-1|-\\dfrac{3}{x-1}+C$")
    ],
    answer: 5,
    explanation: "분모 $=(x+1)(x-1)^2$. 부분분수: $\\dfrac{2}{x+1}+\\dfrac{1}{x-1}+\\dfrac{3}{(x-1)^2}$.\n적분: $2\\ln|x+1|+\\ln|x-1|-\\dfrac{3}{x-1}+C=\\ln(x+1)^2|x-1|-\\dfrac{3}{x-1}+C$."
  }),
  build({
    num: 18, subject: "다변수함수", unit: "편미분", concept: "극좌표 합성·편미분", difficulty: "mediumHard",
    question: "$x=r\\cos\\theta,\\,y=r\\sin\\theta$일 때 함수 $f(x,y)=\\theta+\\ln r$에 대해 $\\dfrac{\\partial f}{\\partial x}(x,y)$는?",
    options: [
      o("1","$\\dfrac{2(x+y)}{x^2+y^2}$"),
      o("2","$\\dfrac{2(x-y)}{x^2+y^2}$"),
      o("3","$\\dfrac{x+y}{x^2+y^2}$"),
      o("4","$\\dfrac{x-y}{x^2+y^2}$"),
      o("5","$\\dfrac{x+y}{2(x^2+y^2)}$")
    ],
    answer: 4,
    explanation: "$r=\\sqrt{x^2+y^2},\\,\\theta=\\tan^{-1}(y/x)$.\n$f=\\tan^{-1}(y/x)+\\dfrac{1}{2}\\ln(x^2+y^2)$.\n$f_x=\\dfrac{-y/x^2}{1+(y/x)^2}+\\dfrac{x}{x^2+y^2}=\\dfrac{-y+x}{x^2+y^2}=\\dfrac{x-y}{x^2+y^2}$."
  }),
  build({
    num: 19, subject: "다변수함수", unit: "편미분", concept: "타원 영역 최대-최소(스칼라 변환)", difficulty: "mediumHard",
    question: "영역 $x^2+2y^2\\le 9$에서 함수 $f(x,y)=\\dfrac{x^2}{2}+y^2-2x-2y$의 최댓값과 최솟값의 합은?",
    options: [
      o("1","$3\\sqrt 6-\\dfrac{3}{2}$"),
      o("2","$3\\sqrt 6-\\dfrac{1}{2}$"),
      o("3","$3\\sqrt 6$"),
      o("4","$3\\sqrt 6+\\dfrac{1}{2}$"),
      o("5","$3\\sqrt 6+\\dfrac{3}{2}$")
    ],
    answer: 5,
    explanation: "$y=Y/\\sqrt 2$ 치환 ⇒ $x^2+Y^2\\le 9$에서 $g(x,Y)=\\dfrac{x^2}{2}+\\dfrac{Y^2}{2}-2x-\\sqrt 2 Y$.\n$g=k$ 꼴 원: $(x-2)^2+(Y-\\sqrt 2)^2=2k+6$. 중심 $(2,\\sqrt 2)$ ($|.|=\\sqrt 6$).\n최소 $k=-3$ (반지름 0), 최대 $\\sqrt{2k+6}=3+\\sqrt 6$ ⇒ $k=\\dfrac{9}{2}+3\\sqrt 6$.\n합 $=\\dfrac{3}{2}+3\\sqrt 6$."
  }),
  build({
    num: 20, subject: "공학수학", unit: "벡터적분", concept: "그린 정리", difficulty: "medium",
    question: "단위원 $x^2+y^2=1$을 반시계 방향으로 매개화한 곡선 $C$에 대해 선적분 $\\!\\displaystyle\\oint_C x^2(x-y)dx+y^2(x-y)dy$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{4}$"), o("2","$\\dfrac{\\pi}{2}$"), o("3","$\\pi$"), o("4","$2\\pi$"), o("5","$4\\pi$")],
    answer: 2,
    explanation: "그린: $\\!\\iint_D(Q_x-P_y)dA=\\!\\iint_D(y^2+x^2)dA$.\n극좌표: $\\!\\int_0^{2\\pi}\\!\\int_0^1 r^2\\cdot r\\,dr\\,d\\theta=2\\pi\\cdot\\dfrac{1}{4}=\\dfrac{\\pi}{2}$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 동국대):`, data.map((d) => d.id).join(", "));
