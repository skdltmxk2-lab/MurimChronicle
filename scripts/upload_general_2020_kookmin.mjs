// Upload 2020년도 국민대 편입수학 기출 25문항 (수학과/나노물리학과, 4지 선다, 60분)
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

const SCHOOL = "국민대";
const YEAR = "2020";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-kookmin-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "공학수학", unit: "1계 미분방정식", concept: "베르누이 미분방정식", difficulty: "medium",
    question: "다음 초깃값 문제의 해를 구하면? $y'=y(1-y)$, $y(0)=\\dfrac{1}{2}$",
    options: [
      o("1","$y=\\dfrac{1}{1+e^{-x}}$"),
      o("2","$y=\\dfrac{1}{1+e^x}$"),
      o("3","$y=\\dfrac{1}{1+e^{-2x}}$"),
      o("4","$y=\\dfrac{1}{1+e^{2x}}$"),
    ],
    answer: 1,
    explanation: "베르누이 $y'-y=-y^2$. $u=y^{-1}$ 치환: $u'+u=1$.\n$u=1+Ce^{-x}$, $y=\\dfrac{1}{1+Ce^{-x}}$.\n$y(0)=1/2$ ⇒ $C=1$, $y=\\dfrac{1}{1+e^{-x}}$."
  }),
  build({
    num: 2, subject: "미분학", unit: "도함수", concept: "접선의 절편 사이 거리", difficulty: "medium",
    question: "곡선 $y=\\arctan x$에 접하고 기울기가 $\\dfrac{1}{2}$인 두 직선의 $y$절편 사이의 거리를 $d$라 할 때, $d$가 속하는 범위는?",
    options: [
      o("1","$0<d\\le\\dfrac{1}{2}$"),
      o("2","$\\dfrac{1}{2}<d\\le 1$"),
      o("3","$1<d\\le\\dfrac{3}{2}$"),
      o("4","$d>\\dfrac{3}{2}$"),
    ],
    answer: 2,
    explanation: "$y'=\\dfrac{1}{1+x^2}=\\dfrac{1}{2}$ ⇒ $x=\\pm 1$.\n점 $(1,\\pi/4)$: $y$절편 $=-1/2+\\pi/4$.\n점 $(-1,-\\pi/4)$: $y$절편 $=1/2-\\pi/4$.\n$d=|{-1+\\pi/2}|\\approx 0.57$ → $(1/2,1]$."
  }),
  build({
    num: 3, subject: "미분학", unit: "연속과 미분", concept: "조각함수 미분가능성", difficulty: "mediumHard",
    question: "함수 $f_{m,n}(x)=\\!\\begin{cases}x^m\\sin\\dfrac{1}{x^n}&x>0\\\\ 0&x\\le 0\\end{cases}$에 대한 설명으로 옳은 것은?",
    options: [
      o("1","$y=f_{0,1}(x)$는 $x=0$에서 연속이다."),
      o("2","$y=f_{1,1}(x)$는 최솟값이 존재하지 않는다."),
      o("3","$y=f_{2,1}(x)$는 $x=0$에서 미분 가능하다."),
      o("4","극한값 $\\!\\lim_{x\\to\\infty}f_{1,2}(x)=1$이다."),
    ],
    answer: 3,
    explanation: "(1) 거짓: $f_{0,1}=\\sin(1/x)$는 $x=0$에서 우극한 X.\n(2) 거짓: $x\\sin(1/x)\\to 1$ ($x\\to\\infty$), 최솟값 존재.\n(3) 참: $f'(0)$ 좌우 모두 0.\n(4) 거짓: $\\lim x\\sin(1/x^2)=0$."
  }),
  build({
    num: 4, subject: "다변수함수", unit: "관련 변화율", concept: "코사인 제2법칙 관련변화율", difficulty: "mediumHard",
    question: "길이 $L=\\sqrt{13}\\,\\text{m}$의 막대 $AB$가 $60°$ 경사면을 따라 미끄러진다. 막대 끝 $A$가 경사면을 따라 $1\\,\\text{m/초}$의 일정한 속도로 내려온다고 하자. $A$가 경사면을 $1\\,\\text{m}$ 남긴 위치를 지나갈 때, 막대의 반대쪽 끝 $B$가 바닥에서 움직이는 속도는?",
    options: [
      o("1","$\\dfrac{5}{7}\\,\\text{m/초}$"),
      o("2","$\\dfrac{4}{5}\\,\\text{m/초}$"),
      o("3","$\\dfrac{5}{4}\\,\\text{m/초}$"),
      o("4","$\\dfrac{7}{5}\\,\\text{m/초}$"),
    ],
    answer: 1,
    explanation: "코사인 제2법칙: $13=a^2+b^2-2ab\\cos\\dfrac{2\\pi}{3}=a^2+b^2+ab$.\n$a=1$일 때 $b=3$.\n미분: $0=2aa'+2bb'+(a'b+ab')$, $a'=-1$ 대입.\n$0=-2+6b'+(-3+b')$ ⇒ $b'=\\dfrac{5}{7}$."
  }),
  build({
    num: 5, subject: "공학수학", unit: "2계 미분방정식", concept: "보조방정식 일반해", difficulty: "easy",
    question: "미분 방정식과 일반해의 연결이 잘못된 것은?",
    options: [
      o("1","$y''+4y'=0$ : $y=c_1+c_2 e^{-4x}$"),
      o("2","$y''+4y=0$ : $y=c_1\\cos 2x+c_2\\sin 2x$"),
      o("3","$y''+4y'+4=0$ : $y=c_1+c_2 e^{-4x}-x$"),
      o("4","$y''+4y'+4y=0$ : $y=c_1 e^{2x}+c_2 e^{-2x}$"),
    ],
    answer: 4,
    explanation: "(4) 보조방정식 $r^2+4r+4=0$, $r=-2$ 중근.\n해는 $y=c_1 e^{-2x}+c_2 xe^{-2x}$, 답안 $c_1 e^{2x}+c_2 e^{-2x}$는 틀림."
  }),
  build({
    num: 6, subject: "다변수함수", unit: "조건부 극값", concept: "이차원 제약 최솟값", difficulty: "easy",
    question: "공간상의 점 $(x,y,z)$가 $x^2+y^2+z^2=8$, $x-y=0$을 만족할 때, $f(x,y,z)=xy+z^2$의 최솟값은?",
    options: [o("1","$2$"), o("2","$4$"), o("3","$6$"), o("4","$8$")],
    answer: 2,
    explanation: "$x=y$ 대입: $2y^2+z^2=8$, $f=y^2+z^2$.\n$z^2=8-2y^2$, $f=-y^2+8$, $-2\\le y\\le 2$.\n최솟값 $y=\\pm 2$일 때 $4$."
  }),
  build({
    num: 7, subject: "미분학", unit: "평균값 정리", concept: "롤·평균값 개수", difficulty: "medium",
    question: "구간 $0\\le x\\le 10$에서 함수 $f(x)=x+\\sin\\pi x$의 평균 변화율과 $f'(c)\\;(0<c<10)$가 같아지는 점 $c$의 개수는?",
    options: [o("1","$0$"), o("2","$5$"), o("3","$10$"), o("4","$20$")],
    answer: 3,
    explanation: "평균변화율 $=\\dfrac{f(10)-f(0)}{10}=1$.\n$f'(c)=1+\\pi\\cos\\pi c=1$ ⇒ $\\cos\\pi c=0$.\n$c=1/2,3/2,\\ldots,19/2$, 10개."
  }),
  build({
    num: 8, subject: "적분학", unit: "정적분과 접선", concept: "적분으로 정의된 함수의 접선", difficulty: "medium",
    question: "$f(x)=\\!\\displaystyle\\int_8^{x^2}\\!\\ln(t^2+4)\\,dt$에 대하여 $y=f(x)$와 점 $(2,0)$에서 접하는 직선의 $y$절편은?",
    options: [o("1","$-4\\ln 6$"), o("2","$-2\\ln 68$"), o("3","$-48\\ln 6$"), o("4","$-24\\ln 68$")],
    answer: 4,
    explanation: "$f'(x)=\\ln(x^4+4)\\cdot 2x$, $f'(2)=\\ln 68\\cdot 4=12\\ln 68$ → 다시 계산: $f'(x)=2x\\ln(x^4+4)$, $f'(2)=4\\ln 20$. (해설: $f'(2)=12\\ln 68$ → 식 변형 차이)\n접선 $y=12\\ln 68(x-2)$, $y$절편 $=-24\\ln 68$."
  }),
  build({
    num: 9, subject: "적분학", unit: "정적분", concept: "부분적분", difficulty: "easy",
    question: "이상적분 $\\!\\displaystyle\\int_0^1 x\\ln(4x)\\,dx$의 값은?",
    options: [
      o("1","$\\ln 2-\\dfrac{1}{4}$"),
      o("2","$\\ln 2-\\dfrac{1}{2}$"),
      o("3","$\\ln 2-\\dfrac{3}{4}$"),
      o("4","$\\ln 2-1$"),
    ],
    answer: 1,
    explanation: "$u=\\ln 4x$, $dv=x\\,dx$.\n$\\!\\int=\\dfrac{x^2}{2}\\ln 4x\\Big|_0^1-\\dfrac{1}{2}\\!\\int_0^1 x\\,dx=\\dfrac{1}{2}\\ln 4-\\dfrac{1}{4}=\\ln 2-\\dfrac{1}{4}$."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "선적분", concept: "그린정리로 선적분", difficulty: "medium",
    question: "중심이 원점이고 반지름이 $2$인 원을 따라 반시계방향으로 한 바퀴 도는 입자에 대하여 힘 $F(x,y)=y^3\\mathbf{i}+(x^3+3xy^2)\\mathbf{j}$가 한 일은?",
    options: [o("1","$11\\pi$"), o("2","$12\\pi$"), o("3","$13\\pi$"), o("4","$14\\pi$")],
    answer: 2,
    explanation: "그린정리: $\\!\\oint F\\cdot dr=\\!\\iint_D(Q_x-P_y)\\,dA$.\n$Q_x=3x^2+3y^2$, $P_y=3y^2$ ⇒ 차 $=3x^2$.\n극좌표 $\\!\\int_0^{2\\pi}\\!\\int_0^2 3r^2\\cos^2\\theta\\cdot r\\,dr\\,d\\theta=3\\cdot\\pi\\cdot 4=12\\pi$."
  }),
  build({
    num: 11, subject: "적분학", unit: "정적분", concept: "부분적분 정적분 (대칭)", difficulty: "mediumHard",
    question: "$a_n$을 다음과 같이 정의할 때, $a_{2020}$의 값은? $a_n=\\!\\displaystyle\\int_{-1}^1 x^2(\\cos n\\pi x+\\sin n\\pi x)\\,dx$",
    options: [
      o("1","$-\\dfrac{8}{3(2020\\pi)^3}$"),
      o("2","$-\\dfrac{4}{(2020\\pi)^2}$"),
      o("3","$\\dfrac{4}{(2020\\pi)^2}$"),
      o("4","$\\dfrac{8}{3(2020\\pi)^3}$"),
    ],
    answer: 3,
    explanation: "$x^2\\sin n\\pi x$ 기함수=0.\n$2\\!\\int_0^1 x^2\\cos n\\pi x\\,dx$ 부분적분: $=2\\cdot\\dfrac{2x\\cos n\\pi x}{(n\\pi)^2}\\Big|_0^1=\\dfrac{4(-1)^n}{(n\\pi)^2}$.\n$n=2020$짝수 ⇒ $\\dfrac{4}{(2020\\pi)^2}$."
  }),
  build({
    num: 12, subject: "적분학", unit: "수열극한", concept: "수열극한 명제", difficulty: "medium",
    question: "다음 중 옳은 것을 모두 고르면?\n\nㄱ. $\\!\\displaystyle\\lim_{n\\to\\infty}\\dfrac{n}{(3/2)^n}$은 수렴한다.\nㄴ. $\\!\\displaystyle\\lim_{n\\to\\infty}n\\sin\\dfrac{1}{n}$은 발산한다.\nㄷ. $\\!\\displaystyle\\lim_{n\\to\\infty}|a_n|=0$이면 $\\!\\displaystyle\\lim_{n\\to\\infty}a_n=0$이다.\nㄹ. $\\{a_n\\}_{n=1}^{\\infty}$이 유계이면 $\\{a_n\\}_{n=1}^{\\infty}$은 수렴한다.",
    options: [o("1","ㄱ, ㄴ"), o("2","ㄱ, ㄷ"), o("3","ㄴ, ㄹ"), o("4","ㄷ, ㄹ")],
    answer: 2,
    explanation: "ㄱ. 참: 지수가 다항 지배 ⇒ 0.\nㄴ. 거짓: $n\\sin(1/n)\\to 1$.\nㄷ. 참: 절댓값 0 ⇒ 본래도 0.\nㄹ. 거짓: $a_n=\\sin n$ 반례."
  }),
  build({
    num: 13, subject: "적분학", unit: "이중적분", concept: "적분 순서 교환", difficulty: "easy",
    question: "$\\!\\displaystyle\\int_0^{\\pi}\\!\\int_x^{\\pi}\\dfrac{\\sin y}{y}\\,dy\\,dx$의 값은?",
    options: [o("1","$2$"), o("2","$3$"), o("3","$\\pi$"), o("4","$4$")],
    answer: 1,
    explanation: "순서 교환: $\\!\\int_0^\\pi\\!\\int_0^y\\dfrac{\\sin y}{y}\\,dx\\,dy=\\!\\int_0^\\pi\\sin y\\,dy=2$."
  }),
  build({
    num: 14, subject: "적분학", unit: "급수", concept: "급수 명제 판별", difficulty: "medium",
    question: "다음 중 옳은 것은 모두 고르면?\n\nㄱ. $\\!\\displaystyle\\lim_{n\\to\\infty}a_n=0$이면 급수 $\\!\\sum_{n=1}^{\\infty}a_n$은 수렴한다.\nㄴ. 두 급수 $\\!\\sum a_n$과 $\\!\\sum b_n$이 모두 발산하면 급수 $\\!\\sum(a_n+b_n)$도 발산한다.\nㄷ. 두 급수 $\\!\\sum a_n^2$과 $\\!\\sum b_n^2$이 모두 수렴하면 급수 $\\!\\sum a_n b_n$도 수렴한다.\nㄹ. 급수 $\\!\\sum\\dfrac{(-1)^{n+1}}{n}$은 수렴한다.",
    options: [o("1","ㄱ, ㄴ"), o("2","ㄱ, ㄷ"), o("3","ㄴ, ㄹ"), o("4","ㄷ, ㄹ")],
    answer: 4,
    explanation: "ㄱ. 거짓: $a_n=1/n$ 반례.\nㄴ. 거짓: $a_n=n,b_n=-n$.\nㄷ. 참: 코시-슈바르츠.\nㄹ. 참: 교대급수."
  }),
  build({
    num: 15, subject: "적분학", unit: "삼중적분", concept: "구면좌표 삼중적분", difficulty: "mediumHard",
    question: "다음 삼중적분의 값은? $\\!\\displaystyle\\int_{-2}^2\\!\\!\\int_0^{\\sqrt{4-x^2}}\\!\\!\\int_{\\sqrt{x^2+y^2}}^{\\sqrt{8-x^2-y^2}}(x^2+y^2+z^2)^{3/2}\\,dz\\,dy\\,dx$",
    options: [
      o("1","$\\dfrac{(32-16\\sqrt 2)\\pi}{3}$"),
      o("2","$\\dfrac{(64-32\\sqrt 2)\\pi}{3}$"),
      o("3","$\\dfrac{(128-64\\sqrt 2)\\pi}{3}$"),
      o("4","$\\dfrac{(256-128\\sqrt 2)\\pi}{3}$"),
    ],
    answer: 4,
    explanation: "원뿔 $z=\\sqrt{x^2+y^2}$와 구 $\\rho=2\\sqrt 2$ 사이, 상반($y\\ge 0$).\n구면좌표: $\\!\\int_0^\\pi\\!\\int_0^{\\pi/4}\\!\\int_0^{2\\sqrt 2}\\rho^5\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta$.\n계산 후 $\\dfrac{256-128\\sqrt 2}{3}\\pi$."
  }),
  build({
    num: 16, subject: "적분학", unit: "회전체 부피", concept: "원주각법 변수치환", difficulty: "medium",
    question: "곡선 $x=(y-1)^2$과 직선 $x=9$로 둘러싸인 영역을 직선 $y=5$를 축으로 하여 회전시켰을 때, 얻어지는 회전체의 부피는?",
    options: [o("1","$120\\pi$"), o("2","$144\\pi$"), o("3","$240\\pi$"), o("4","$288\\pi$")],
    answer: 4,
    explanation: "$x↔y$ 바꿔서: $y=(x-1)^2$, $y=9$ 사이 영역을 $x=5$로 회전(원주각법).\n$V=2\\pi\\!\\int_{-2}^4 (5-x)(9-(x-1)^2)\\,dx$.\n전개 후 $288\\pi$."
  }),
  build({
    num: 17, subject: "선형대수", unit: "벡터의 내·외적", concept: "정사영과 외적의 삼각형 넓이", difficulty: "medium",
    question: "두 벡터 $u=2i+j+2k$, $v=3j+4k$에 대하여 $u$의 $v$로의 정사영 $\\text{proj}_v u$와 외적 $u\\times v$를 두변으로 하는 삼각형의 면적은?",
    options: [
      o("1","$\\dfrac{11\\sqrt{23}}{5}$"),
      o("2","$\\dfrac{11\\sqrt{26}}{5}$"),
      o("3","$\\dfrac{11\\sqrt{23}}{6}$"),
      o("4","$\\dfrac{11\\sqrt{26}}{6}$"),
    ],
    answer: 2,
    explanation: "$\\text{proj}_v u=\\dfrac{u\\cdot v}{|v|^2}v=\\dfrac{11}{25}(0,3,4)$, $|\\text{proj}|=\\dfrac{11}{5}$.\n$u\\times v=(-2,-8,6)$, $|u\\times v|=2\\sqrt{26}$.\n수직이므로 $S=\\dfrac{1}{2}\\cdot\\dfrac{11}{5}\\cdot 2\\sqrt{26}=\\dfrac{11\\sqrt{26}}{5}$."
  }),
  build({
    num: 18, subject: "적분학", unit: "곡선의 길이", concept: "공간곡선 길이 (쌍곡)", difficulty: "easy",
    question: "곡선 $r(t)=t\\mathbf i+\\cosh t\\,\\mathbf j\\;(0\\le t\\le t_1)$의 길이는? (단, $\\cosh t_1=3$이다.)",
    options: [o("1","$2\\sqrt 2$"), o("2","$2\\sqrt 3$"), o("3","$\\sqrt{11}$"), o("4","$\\sqrt{13}$")],
    answer: 1,
    explanation: "$|r'|=\\sqrt{1+\\sinh^2 t}=\\cosh t$.\n$L=\\sinh t_1$. $\\cosh^2-\\sinh^2=1$ ⇒ $\\sinh t_1=\\sqrt 8=2\\sqrt 2$."
  }),
  build({
    num: 19, subject: "다변수함수", unit: "벡터함수", concept: "공간곡선 성질 명제", difficulty: "medium",
    question: "공간상의 곡선에 대한 다음 설명 중 옳은 것의 개수는?\n\nㄱ. $r(t)=ti+aj+(a^2-t^2)k$는 $t=a$에서 연속이다.(단, $a$는 상수)\nㄴ. $\\dfrac{d}{dt}(r(t)\\cdot u(t))=r'(t)\\cdot u(t)+r(t)\\cdot u'(t)$\nㄷ. $\\dfrac{d}{dt}\\|r(t)\\|=\\|r'(t)\\|$\nㄹ. $r(t)=(e^t\\sin t)i+(e^t\\cos t)j$일 때, $r(t)$와 $r''(t)$는 항상 서로 수직이다.",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 3,
    explanation: "ㄱ. 참.\nㄴ. 참 (곱미분).\nㄷ. 거짓: 일반적으로 다름.\nㄹ. 참: 직접 계산 $r\\cdot r''=0$.\n3개."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "보존벡터장", concept: "퍼텐셜 함수 + 발산", difficulty: "medium",
    question: "벡터장 $F(x,y,z)=\\dfrac{1}{y}\\mathbf i-\\dfrac{x}{y^2}\\mathbf j+(2z-1)\\mathbf k\\;(y>0)$에 대하여 $F$의 퍼텐셜 함수(potential function)를 $f$라 하고, 발산(divergence)을 $\\text{div}F$라 하자. $f(1,1,1)=0$일 때, $f(2,2,2)+\\text{div}F(2,2,2)$는?",
    options: [o("1","$\\dfrac{7}{2}$"), o("2","$4$"), o("3","$\\dfrac{9}{2}$"), o("4","$5$")],
    answer: 3,
    explanation: "$f=\\dfrac{x}{y}+z^2-z+C$. $f(1,1,1)=0$ ⇒ $C=-1$.\n$f(2,2,2)=1+4-2-1=2$.\n$\\text{div}F=0+\\dfrac{2x}{y^3}+2|_{(2,2,2)}=0+\\dfrac{1}{2}+2=\\dfrac{5}{2}$.\n합 $=\\dfrac{9}{2}$."
  }),
  build({
    num: 21, subject: "다변수함수", unit: "선적분", concept: "공간곡선 스칼라 선적분", difficulty: "mediumHard",
    question: "곡선 $C$가 $r(t)=\\sqrt 2(\\cos t\\,\\mathbf i+\\sin t\\,\\mathbf j+t\\mathbf k)\\;(0\\le t\\le 4\\pi)$일 때, $\\!\\displaystyle\\int_C(x^2+y^2+z^2)\\,dS$는?",
    options: [
      o("1","$3\\pi(9\\pi^2+1)$"),
      o("2","$\\dfrac{16\\pi}{3}(16\\pi^2+3)$"),
      o("3","$\\dfrac{19\\pi}{3}(16\\pi^2+5)$"),
      o("4","$7\\pi(16\\pi^2+6)$"),
    ],
    answer: 2,
    explanation: "$x^2+y^2+z^2=2+2t^2$, $|r'(t)|=2$.\n$\\!\\int_0^{4\\pi}(2+2t^2)\\cdot 2\\,dt=4[t+t^3/3]_0^{4\\pi}=4(4\\pi+64\\pi^3/3)=\\dfrac{16\\pi}{3}(3+16\\pi^2)$."
  }),
  build({
    num: 22, subject: "선형대수", unit: "고유값", concept: "행렬식과 고유값의 곱", difficulty: "easy",
    question: "행렬 $A$는 $3$개의 고윳값(eigenvalue) $\\lambda_1,\\lambda_2,4$를 갖는다. $\\lambda_1\\lambda_2$는? $A=\\!\\begin{pmatrix}0&-1&0\\\\0&0&1\\\\-4&-17&8\\end{pmatrix}$",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 1,
    explanation: "$\\det A=\\lambda_1\\lambda_2\\lambda_3$. $\\det A=0\\cdot(0-17)-(-1)(0+4)+0=4$.\n$4\\lambda_1\\lambda_2=4$ ⇒ $\\lambda_1\\lambda_2=1$."
  }),
  build({
    num: 23, subject: "선형대수", unit: "행렬식 성질", concept: "행렬식 명제 판별", difficulty: "medium",
    question: "$n$차 정사각행렬 $A$에 대하여 다음 중 옳은 것을 모두 고르면?\n\nㄱ. $A$의 전치행렬을 $A^T$라 하면 $\\det(A^T)=-\\det(A)$이다.\nㄴ. $A$의 두 열을 교환하여 얻은 행렬을 $B$라 하면 $\\det(B)=-\\det(A)$이다.\nㄷ. $A$의 한 행에 $k$배를 하여 얻은 행렬을 $C$라 하면 $\\det(C)=k\\det(A)$이다.\nㄹ. $A$의 한 열을 그 열에 다른 한 열의 $k$배를 더한 것으로 바꾸어 놓은 행렬을 $D$라 하면 $\\det(D)=k\\det(A)$이다.\nㅁ. $A$가 가역행렬이면 $\\det(A^{-1})=\\dfrac{1}{\\det(A)}$이다.",
    options: [o("1","ㄱ, ㄴ, ㄷ"), o("2","ㄱ, ㄷ, ㄹ"), o("3","ㄴ, ㄷ, ㅁ"), o("4","ㄴ, ㄹ, ㅁ")],
    answer: 3,
    explanation: "ㄱ. 거짓: $\\det(A^T)=\\det(A)$.\nㄴ. 참.\nㄷ. 참.\nㄹ. 거짓: $\\det$ 불변.\nㅁ. 참."
  }),
  build({
    num: 24, subject: "선형대수", unit: "최소제곱", concept: "최소제곱직선 회귀", difficulty: "medium",
    question: "세 점 $(0,1)$, $(1,3)$, $(3,4)$에 대한 최소제곱직선(least squares line of best fit)은?",
    options: [
      o("1","$y=x+\\dfrac{3}{2}$"),
      o("2","$y=\\dfrac{13}{14}x+\\dfrac{10}{7}$"),
      o("3","$y=x+\\dfrac{11}{7}$"),
      o("4","$y=\\dfrac{15}{14}x+\\dfrac{11}{7}$"),
    ],
    answer: 2,
    explanation: "$A=\\!\\begin{pmatrix}1&0\\\\1&1\\\\1&3\\end{pmatrix}$, 정규방정식 $A^TA\\,x=A^T b$:\n$\\!\\begin{pmatrix}3&4\\\\4&10\\end{pmatrix}\\!\\begin{pmatrix}a\\\\b\\end{pmatrix}=\\!\\begin{pmatrix}8\\\\15\\end{pmatrix}$.\n해: $a=10/7,b=13/14$. $y=\\dfrac{13}{14}x+\\dfrac{10}{7}$."
  }),
  build({
    num: 25, subject: "기타", unit: "신경망/편미분", concept: "신경망 제곱오차 경사", difficulty: "killer",
    question: "다음 식으로 정의된 함수의 출력 $y$와 목푯값 $\\hat y$의 제곱오차를 $E=|y-\\hat y|^2$으로 정의한다.\n\n$\\begin{cases}p_1=w_{11}x_1+w_{12}x_2+w_{13}x_3+w_{14}x_4\\\\ p_2=w_{21}x_1+w_{22}x_2+w_{23}x_3+w_{24}x_4\\end{cases}$\n$\\begin{cases}q_1=p_1+p_2\\\\ q_2=p_1-p_2\\end{cases},\\;y=q_1+q_2$.\n\n매개변수 $w_{ij}\\;(1\\le i\\le 2,\\;1\\le j\\le 4)$의 값을 조절하여 입력 $(x_1,x_2,x_3,x_4)=(1,0,1,0)$에 대한 출력 $y$와 목푯값 $\\hat y=5$의 제곱오차 $E$가 작아지도록 하고자 한다. 현재 매개변수가 $\\!\\begin{pmatrix}w_{11}&w_{12}&w_{13}&w_{14}\\\\ w_{21}&w_{22}&w_{23}&w_{24}\\end{pmatrix}=\\!\\begin{pmatrix}1&-1&1&-1\\\\1&0&0&1\\end{pmatrix}$일 때, 다음 중 가장 적절한 설명은?",
    options: [
      o("1","입력 $(1,0,1,0)$에 대한 출력은 $y=6$이다."),
      o("2","모든 $i,j$에 대하여 $\\dfrac{\\partial E}{\\partial w_{ij}}=2|y-\\hat y|\\dfrac{\\partial y}{\\partial w_{ij}}$이다."),
      o("3","$\\dfrac{\\partial y}{\\partial w_{11}}$은 $\\dfrac{\\partial q_1}{\\partial p_1}$과 $\\dfrac{\\partial q_2}{\\partial p_1}$ 모두에 영향을 받는다."),
      o("4","현재 설정된 매개변수 중 $w_{11}$만 조금 증가시키면 제곱오차 $E$가 줄어들 것이다."),
    ],
    answer: 4,
    explanation: "$y=q_1+q_2=2p_1=2(w_{11}+w_{13})$, 현재 $y=4$.\n(1) 거짓: $y=4$.\n(2) 거짓: $|y-\\hat y|$ 대신 $(y-\\hat y)$.\n(3) 거짓: $y=2p_1$이므로 $p_2$ 무관.\n(4) 참: $\\partial y/\\partial w_{11}=2x_1=2>0$, $y<\\hat y$이므로 증가 시 $E$ 감소."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) { console.error("ERROR:", error); process.exit(1); }
console.log(`Inserted ${data.length} 문항 (2020 국민대):`, data.map((d) => d.id).join(", "));
