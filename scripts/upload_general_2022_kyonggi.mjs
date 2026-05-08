// Upload 2022년도 경기대 편입수학 기출 20문항 (26~45번, 4지선다)
// Usage: node scripts/upload_general_2022_kyonggi.mjs
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

const SCHOOL = "경기대";
const YEAR = "2022";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });

function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-kyonggi-${String(num).padStart(2, "0")}`;
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
    num: 26, subject: "미분학", unit: "극한과 연속", concept: "유계×0/발산 판정", difficulty: "easy",
    question: "다음 중 극한값이 존재하지 않는 것은? (1) $\\displaystyle\\lim_{x\\to 0} x\\cos\\dfrac{1}{x}$  (2) $\\displaystyle\\lim_{x\\to 0} x\\sin\\dfrac{1}{x}$  (3) $\\displaystyle\\lim_{x\\to 0}\\dfrac{1}{x}\\cos x$  (4) $\\displaystyle\\lim_{x\\to 0}\\dfrac{1}{x}\\sin x$",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)")],
    answer: 3,
    explanation: "(1) $x\\to 0$이고 $\\cos\\tfrac{1}{x}$ 유계 → $0\\times$유계 = 0. (2) 같은 이유 → 0. (3) $\\dfrac{1}{x}\\to\\pm\\infty$이고 $\\cos x\\to 1$ → 발산(존재 X). (4) $\\dfrac{\\sin x}{x}\\to 1$ (표준 극한). 정답 (3)."
  }),
  build({
    num: 27, subject: "미분학", unit: "추가내용", concept: "역쌍곡함수 정의", difficulty: "easy",
    question: "다음 중 역쌍곡함수 $\\sinh^{-1} x$와 같은 함수는?",
    options: [o("1","$\\ln(x+\\sqrt{x^2+1})$"), o("2","$\\ln(x+\\sqrt{x^2-1})$"), o("3","$\\ln(-x+\\sqrt{x^2+1})$"), o("4","$\\ln(-x+\\sqrt{x^2-1})$")],
    answer: 1,
    explanation: "$y=\\sinh^{-1}x$이면 $x=\\sinh y = \\dfrac{e^y - e^{-y}}{2}$. $u=e^y$로 두면 $2x=u-\\tfrac{1}{u} \\Rightarrow u^2-2xu-1=0$. 근의 공식: $u=\\dfrac{2x+\\sqrt{4x^2+4}}{2}=x+\\sqrt{x^2+1}$ (양수). $y=\\ln u = \\ln(x+\\sqrt{x^2+1})$."
  }),
  build({
    num: 28, subject: "다변수함수", unit: "추가내용", concept: "두 접평면 사이 각", difficulty: "medium",
    question: "곡면 $xy+yz+zx=3$에 대하여 점 $(1,1,1)$에서의 접평면과 점 $(3,3,-1)$에서의 접평면이 이루는 각은?",
    options: [o("1","$\\cos^{-1}\\dfrac{5}{\\sqrt{33}}$"), o("2","$\\cos^{-1}\\dfrac{5}{\\sqrt{57}}$"), o("3","$\\cos^{-1}\\dfrac{5}{2\\sqrt{33}}$"), o("4","$\\cos^{-1}\\dfrac{5}{2\\sqrt{57}}$")],
    answer: 1,
    explanation: "$f(x,y,z)=xy+yz+zx-3$로 두면 $\\nabla f = (y+z, z+x, x+y)$. $(1,1,1)$에서 $\\vec u=(2,2,2)\\to(1,1,1)$. $(3,3,-1)$에서 $\\vec v=(2,2,6)\\to(1,1,3)$. 두 평면이 이루는 각의 코사인 = $\\dfrac{|\\vec u\\cdot\\vec v|}{|\\vec u||\\vec v|} = \\dfrac{|1+1+3|}{\\sqrt 3\\sqrt{11}} = \\dfrac{5}{\\sqrt{33}}$."
  }),
  build({
    num: 29, subject: "다변수함수", unit: "체적과 곡면적", concept: "회전곡면 면적(성망형)", difficulty: "medium",
    question: "$xy$평면 위의 곡선 $x^{2/3}+y^{2/3}=1\\ (x\\ge 0,\\ y\\ge 0)$을 $x$축으로 회전시켜 얻은 곡면의 넓이는?",
    options: [o("1","$\\dfrac{3}{5}\\pi$"), o("2","$\\dfrac{4}{5}\\pi$"), o("3","$\\pi$"), o("4","$\\dfrac{6}{5}\\pi$")],
    answer: 4,
    explanation: "성망형(아스트로이드) $x^{2/3}+y^{2/3}=a^{2/3}$의 회전체 곡면적 공식: $S=\\dfrac{12\\pi a^2}{5}$ (전체). $a=1$ → 전체 $S=\\dfrac{12\\pi}{5}$. 1사분면 부분만의 곡선을 $x$축 회전한 곡면적은 전체의 절반이므로 $\\dfrac{6\\pi}{5}$."
  }),
  build({
    num: 30, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "쌍곡코사인 급수", difficulty: "easy",
    question: "급수 $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{1}{(2n)!}$의 값은?",
    options: [o("1","$\\dfrac{e-e^{-1}}{2}$"), o("2","$\\dfrac{e+e^{-1}}{2}$"), o("3","$e-e^{-1}$"), o("4","$e+e^{-1}$")],
    answer: 2,
    explanation: "쌍곡함수 급수: $\\cosh x = \\sum_{n=0}^{\\infty}\\dfrac{x^{2n}}{(2n)!}$. $x=1$ 대입: $\\cosh 1 = \\sum\\dfrac{1}{(2n)!} = \\dfrac{e+e^{-1}}{2}$."
  }),
  build({
    num: 31, subject: "선형대수", unit: "벡터공간", concept: "일차종속/기저 정의", difficulty: "medium",
    question: "벡터공간 $V$의 부분집합 $A=\\{v_1,v_2,\\cdots,v_n\\}$에 대한 설명 중 옳지 않은 것은? (1) $A$가 일차종속이면 $v_1$은 $v_2,\\cdots,v_n$의 일차결합이다. (2) $n>\\dim(V)$이면 $A$는 일차종속이다. (3) $A$의 원소의 모든 일차결합의 집합은 $V$의 부분공간이다. (4) $A$가 일차독립이면 $\\dim(V)\\ge n$이다.",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)")],
    answer: 1,
    explanation: "(1) 거짓. 일차종속이면 '어떤 한 벡터'가 나머지의 일차결합이지만, 반드시 $v_1$이라는 보장 없음. 반례: $v_1=(1,0,0),\\ v_2=(1,1,1),\\ v_3=(1,1,1)$이면 $v_2=v_3$로 종속이지만 $v_1$은 다른 둘의 결합으로 안 됨. (2),(3),(4)는 모두 참(차원 정의 직접 적용)."
  }),
  build({
    num: 32, subject: "선형대수", unit: "행렬", concept: "행렬식 곱(연립)", difficulty: "medium",
    question: "실 정사각행렬 $A,B$에 대하여 $\\det(ABA)=9,\\ \\det(BAB)=-3$일 때, $\\det(A)+\\det(B)$의 값은?",
    options: [o("1","$1$"), o("2","$-1$"), o("3","$2$"), o("4","$-2$")],
    answer: 4,
    explanation: "$|A|=a, |B|=b$로 두면 $\\det(ABA)=a^2 b = 9$, $\\det(BAB)=ab^2=-3$. 첫 식에서 $b=\\dfrac{9}{a^2}$. 둘째에 대입: $a\\cdot\\dfrac{81}{a^4}=-3 \\Rightarrow \\dfrac{81}{a^3}=-3 \\Rightarrow a^3=-27 \\Rightarrow a=-3$. 따라서 $b=\\dfrac{9}{9}=1$. $a+b=-2$."
  }),
  build({
    num: 33, subject: "선형대수", unit: "행렬", concept: "행동치(행환산형 같음)", difficulty: "medium",
    question: "다음 <보기> 중 행렬 $\\begin{pmatrix}1&1&1\\\\1&2&3\\\\3&2&1\\end{pmatrix}$과 행동치인 것을 모두 고르면? 가. $\\begin{pmatrix}-1&-1&-1\\\\-1&-2&-3\\\\-3&-2&-1\\end{pmatrix}$  나. $\\begin{pmatrix}1&1&1\\\\3&2&1\\\\1&2&3\\end{pmatrix}$  다. $\\begin{pmatrix}1&1&1\\\\4&4&4\\\\3&2&1\\end{pmatrix}$  라. $\\begin{pmatrix}0&0&0\\\\1&2&3\\\\3&2&1\\end{pmatrix}$",
    options: [o("1","가, 나"), o("2","나, 다"), o("3","가, 나, 다"), o("4","가, 나, 다, 라")],
    answer: 4,
    explanation: "행동치(row equivalent)란 행 환산을 통해 같은 기약 행 사다리꼴이 되는 관계. 원래 행렬을 환산하면 $\\begin{pmatrix}1&1&1\\\\0&1&2\\\\0&0&0\\end{pmatrix}$. 가/나/다/라 모두 같은 행공간을 가져 같은 기약 형태에 도달. (가는 -1배, 나는 행 교환, 다는 행 + 4배 행, 라는 0행 추가형으로 모두 행동치). 정답 가, 나, 다, 라."
  }),
  build({
    num: 34, subject: "선형대수", unit: "벡터공간", concept: "선형사상 조건($f(0)=0$)", difficulty: "easy",
    question: "벡터공간 $V$의 각 원소 $v\\in V$에 대하여 사상 $f:V\\to V$를 아래와 같이 정의할 때 선형사상이 아닌 것은? (1) $f(v)=0$ (단, $0$은 $V$의 영벡터) (2) $f(v)=2v$ (3) $f(v)=v+w$ (단, $w\\in V$는 주어진 영이 아닌 벡터) (4) $f(v)=-v$",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)")],
    answer: 3,
    explanation: "선형사상이려면 $f(0)=0$이어야 함. (1) $f(0)=0$ ✓, $f(\\alpha v+\\beta u)=0=\\alpha f(v)+\\beta f(u)$ ✓. (2) $f(0)=0$ ✓, 선형. (4) 같은 이유로 선형. (3) $f(0)=0+w=w\\ne 0$ ✗. 정답 (3)."
  }),
  build({
    num: 35, subject: "선형대수", unit: "행렬", concept: "Neumann 급수(역행렬)", difficulty: "medium",
    question: "정사각행렬 $A$가 어떤 자연수 $n$에 대하여 $A^n=O$을 만족할 때, $\\displaystyle\\sum_{k=0}^{n-1} A^k$의 역행렬은? (단, $A^0$은 단위행렬 $I$로 정의한다.)",
    options: [o("1","$I+A$"), o("2","$I-A$"), o("3","$-I+A$"), o("4","$-I-A$")],
    answer: 2,
    explanation: "기하급수 행렬 항등식: $(I-A)(I+A+A^2+\\cdots+A^{n-1})=I-A^n=I-O=I$. 따라서 $\\displaystyle\\sum_{k=0}^{n-1}A^k$의 역행렬은 $I-A$."
  }),
  build({
    num: 36, subject: "미분학", unit: "도함수의 응용", concept: "주기함수 임계점", difficulty: "medium",
    question: "주기가 $c>0$인 미분가능한 주기함수 $f:\\mathbb R\\to\\mathbb R$에 대하여 다음 <보기>에서 항상 참인 것을 모두 고르면? 가. $f(a)$가 폐구간 $[0,c]$에서 $f$의 최댓값이어도 $f'(a)\\ne 0$일 수 있다. 나. $f(b)$가 $f$의 극솟값이면 $f(b)$는 개구간 $\\!\\left(b-\\dfrac{c}{2},b+\\dfrac{c}{2}\\right)$에서 $f$의 최솟값이다. 다. $f'(x)=0$인 $x$가 폐구간 $[0,c]$에 2개 이상 존재한다.",
    options: [o("1","가, 나"), o("2","다"), o("3","가, 다"), o("4","가, 나, 다")],
    answer: 2,
    explanation: "가. 거짓. 미분가능한 함수의 폐구간 내부 최댓값은 $f'=0$이어야 함. 나. 거짓. 극솟값이 그 작은 근방에서만 최소이지, 한 주기 내 다른 위치에 더 작은 값이 있을 수 있음. 다. 참. 미분가능한 주기함수는 한 주기 안에 극대점·극소점이 적어도 하나씩 → $f'=0$ 점이 2개 이상. 정답 다만."
  }),
  build({
    num: 37, subject: "다변수함수", unit: "중적분", concept: "리만합 → 적분 + 역함수 미분", difficulty: "mediumHard",
    question: "정의역 $x>1$에서 정의된 함수 $f(x)=\\displaystyle\\lim_{n\\to\\infty}\\sum_{k=1}^n \\dfrac{x-2}{n}\\ln\\!\\left(2+\\dfrac{x-2}{n}k\\right)$의 역함수를 $g$라고 할 때, $g'(0)$의 값은?",
    options: [o("1","$\\ln 2$"), o("2","$-\\ln 2$"), o("3","$\\dfrac{1}{\\ln 2}$"), o("4","$-\\dfrac{1}{\\ln 2}$")],
    answer: 3,
    explanation: "리만합 형태: $\\dfrac{1}{n}\\to dt$, $\\dfrac{k}{n}\\to t$로 보면 $f(x)=(x-2)\\int_0^1 \\ln(2+(x-2)t)dt$. 또는 변수 치환 $u=2+(x-2)t$로 $f(x)=\\int_2^x \\ln u\\,du$. 미분: $f'(x)=\\ln x$. $f(2)=0$이므로 $g(0)=2$, $g'(0)=\\dfrac{1}{f'(g(0))}=\\dfrac{1}{f'(2)}=\\dfrac{1}{\\ln 2}$."
  }),
  build({
    num: 38, subject: "적분학", unit: "추가내용", concept: "극좌표 이중적분(영역)", difficulty: "mediumHard",
    question: "극좌표로 주어진 곡선 $r=3+2\\sin\\theta$의 내부와 $r=2$의 외부에 놓여 있는 영역을 $D$라 할 때, 이중적분 $\\displaystyle\\iint_D \\dfrac{1}{\\sqrt{x^2+y^2}}\\,dx\\,dy$의 값은?",
    options: [o("1","$\\dfrac{4}{3}\\pi$"), o("2","$\\dfrac{4}{3}\\pi+\\dfrac{\\sqrt 3}{2}$"), o("3","$\\dfrac{4}{3}\\pi+\\sqrt 3$"), o("4","$\\dfrac{4}{3}\\pi+2\\sqrt 3$")],
    answer: 4,
    explanation: "교점 $3+2\\sin\\theta=2 \\Rightarrow \\sin\\theta=-\\tfrac{1}{2} \\Rightarrow \\theta=-\\tfrac{\\pi}{6}, \\dfrac{7\\pi}{6}$. 영역은 두 구간 $[-\\tfrac{\\pi}{6},\\tfrac{7\\pi}{6}]$에 걸침(원의 밖, 카디오이드 안). 극좌표 $\\dfrac{1}{r}\\cdot r\\,dr\\,d\\theta = dr\\,d\\theta$이므로 $\\iint_D \\dfrac{1}{r}\\,dA = \\int_{-\\pi/6}^{7\\pi/6}\\int_2^{3+2\\sin\\theta} dr\\,d\\theta = \\int (3+2\\sin\\theta-2)d\\theta = \\int (1+2\\sin\\theta)d\\theta = [\\theta-2\\cos\\theta]_{-\\pi/6}^{7\\pi/6} = (\\tfrac{7\\pi}{6}-2\\cos\\tfrac{7\\pi}{6})-(-\\tfrac{\\pi}{6}-2\\cos\\tfrac{-\\pi}{6}) = \\tfrac{4\\pi}{3}+\\sqrt 3+\\sqrt 3 = \\dfrac{4\\pi}{3}+2\\sqrt 3$."
  }),
  build({
    num: 39, subject: "다변수함수", unit: "추가내용", concept: "삼엽 장미선 접선 수직", difficulty: "mediumHard",
    question: "삼엽장미곡선의 매개변수함수 $\\vec v(\\theta)=(\\cos 3\\theta\\cos\\theta,\\ \\cos 3\\theta\\sin\\theta)\\ (0\\le\\theta\\le\\pi)$에 대하여 $\\vec v(\\theta)\\cdot\\vec v'(\\theta)=0$을 만족하는 곡선 위의 점의 개수는? (단, $\\cdot$은 내적기호이다.)",
    options: [o("1","$3$"), o("2","$4$"), o("3","$5$"), o("4","$6$")],
    answer: 2,
    explanation: "$\\vec v\\cdot\\vec v'=0$은 위치벡터와 접선벡터가 수직임. (i) 장미선의 꼭짓점(곡선이 원점에서 멀리 뻗은 끝점)에서 위치벡터와 접선이 수직 → 삼엽이라 3개. (ii) 또한 원점에서 $\\vec v=\\vec 0$이라 영벡터의 내적은 0 → 1개 추가. 합계 $3+1=4$."
  }),
  build({
    num: 40, subject: "적분학", unit: "급수의 수렴/발산", concept: "수렴반지름 끝점 행동", difficulty: "medium",
    question: "멱급수 $\\sum_{n=0}^{\\infty} a_n x^n$의 수렴반지름이 $R>0$일 때 $f(x)=\\sum_{n=0}^{\\infty} a_n x^n$로 정의되는 함수 $f$에 대하여 다음 <보기>에서 항상 참인 것을 모두 고르면? 가. $f$는 개구간 $(-R,R)$에서 미분가능하다. 나. 이상적분 $\\int_{-R}^R f(x)dx$가 존재한다. 다. $a_n>0$이면 좌극한 $\\displaystyle\\lim_{x\\to R^-} f(x)$이 존재한다.",
    options: [o("1","가, 다"), o("2","나, 다"), o("3","가, 나"), o("4","가")],
    answer: 4,
    explanation: "가. 참. 멱급수는 수렴 개구간 안에서 항별 미분 가능하며 무한히 미분가능. 나. 거짓. 반례: $f(x)=\\dfrac{1}{1-x}$, $R=1$, $\\int_{-1}^1\\dfrac{1}{1-x}dx$ 발산. 다. 거짓. 반례: $f(x)=\\dfrac{1}{1-x}$, $a_n=1>0$이지만 $x\\to 1^-$에서 발산. 정답 가만."
  }),
  build({
    num: 41, subject: "선형대수", unit: "행렬", concept: "rank/열공간 차원", difficulty: "easyMedium",
    question: "행렬 $\\begin{pmatrix}1&0&1&0\\\\0&2&0&2\\\\6&7&6&7\\\\6&7&8&9\\end{pmatrix}$의 열공간의 차원은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 3,
    explanation: "열공간 차원 = rank. 행 환산: $R_3\\to R_3-6R_1: (0,7,0,7)$. $R_3\\to R_3-\\tfrac{7}{2}R_2: (0,0,0,0)$. $R_4\\to R_4-6R_1: (0,7,2,9)$. $R_4\\to R_4-\\tfrac{7}{2}R_2: (0,0,2,2)$. 환산 결과 $\\begin{pmatrix}1&0&1&0\\\\0&2&0&2\\\\0&0&0&0\\\\0&0&2&2\\end{pmatrix}$. Rank=3 (1,2,4행이 일차독립)."
  }),
  build({
    num: 42, subject: "선형대수", unit: "벡터공간", concept: "내적공간 부분공간", difficulty: "mediumHard",
    question: "다음 중 내적공간 $(V,\\cdot)$의 부분공간이 아닐 수 있는 것은? (1) $0$이 $V$의 영벡터일 때, 집합 $\\{0\\}$ (2) $S\\subset V$일 때, 집합 $\\{v\\in V\\,|\\,$모든 $w\\in S$에 대하여 $v\\cdot w=0\\}$ (3) $S\\subset V$일 때, 집합 $\\{a v_1+b v_2\\,|\\,a,b$는 스칼라, $v_1\\cdot v_2\\in S\\}$ (4) $V$의 부분공간 $V_n\\ (n=1,2,3,\\ldots)$에 대하여 집합 $\\bigcap_{n=1}^{\\infty}V_n$",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)")],
    answer: 3,
    explanation: "(1) $\\{0\\}$은 항상 부분공간. (2) $S$의 모든 원소와 직교하는 벡터들 ($S^\\perp$)은 부분공간. (4) 부분공간들의 교집합은 부분공간. (3) 조건 '$v_1\\cdot v_2\\in S$'가 일반 부분공간 정의(벡터의 합·스칼라곱에 닫힘)와 일치하지 않음. 두 벡터 쌍의 내적이 스칼라 집합 $S$에 속한다는 조건은 일차결합 닫힘을 보장하지 못함. 정답 (3)."
  }),
  build({
    num: 43, subject: "선형대수", unit: "고유치와 대각화", concept: "닮음 분해 $A=PDP^T$", difficulty: "mediumHard",
    question: "다음과 같이 정의된 행렬 $A=\\begin{pmatrix}\\cos\\tfrac{\\pi}{4} & \\sin\\tfrac{\\pi}{4}\\\\-\\sin\\tfrac{\\pi}{4} & \\cos\\tfrac{\\pi}{4}\\end{pmatrix}\\!\\begin{pmatrix}1 & 0\\\\0 & -1\\end{pmatrix}\\!\\begin{pmatrix}\\cos\\tfrac{\\pi}{4} & -\\sin\\tfrac{\\pi}{4}\\\\\\sin\\tfrac{\\pi}{4} & \\cos\\tfrac{\\pi}{4}\\end{pmatrix}$의 고유벡터는?",
    options: [o("1","$\\binom{1}{-1}$"), o("2","$\\binom{1}{0}$"), o("3","$\\binom{2}{1}$"), o("4","$\\binom{0}{-1}$")],
    answer: 1,
    explanation: "$A=PDP^T$ 형태. $P$의 1열 = $\\binom{\\cos\\pi/4}{-\\sin\\pi/4} = \\binom{1/\\sqrt 2}{-1/\\sqrt 2} \\sim \\binom{1}{-1}$. 이는 고유치 $\\lambda=1$에 대응하는 고유벡터. $P$의 2열 = $\\binom{\\sin\\pi/4}{\\cos\\pi/4}\\sim\\binom{1}{1}$ (고유치 $-1$). 보기에서 $\\binom{1}{-1}$이 (1)에 있으므로 정답 (1)."
  }),
  build({
    num: 44, subject: "선형대수", unit: "행렬", concept: "직교행렬 고유치", difficulty: "medium",
    question: "실 직교행렬 $A$에 대한 설명 중 옳지 않은 것은? (1) $A^T A=I$이다. (단, $I$는 단위행렬) (2) $A$의 실 고윳값이 적어도 하나 존재한다. (3) $\\det(A)$는 $1$ 또는 $-1$이다. (4) $\\lambda$가 $A$의 실 고윳값이면 $\\lambda$는 $1$ 또는 $-1$이다.",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)")],
    answer: 2,
    explanation: "(1) 직교행렬 정의. 참. (3) $|\\det A|=1$. 참. (4) 실 고윳값은 $\\pm 1$ (직교행렬의 고윳값은 단위원 위에 있음). 참. (2) 거짓. 반례: 회전행렬 $\\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix}$의 고윳값은 $\\pm i$로 모두 복소수, 실 고윳값 없음. 정답 (2)."
  }),
  build({
    num: 45, subject: "선형대수", unit: "고유치와 대각화", concept: "대칭행렬 성질", difficulty: "medium",
    question: "$n\\times n$ 실 대칭행렬 $A$에 대한 다음 명제 중 거짓은? (1) $A$는 서로 다른 $n$개의 고윳값을 갖는다. (2) $A$의 서로 다른 고윳값에 대응하는 고유벡터들은 서로 수직이다. (3) $A$는 항상 대각화 가능하다. (4) 모든 $n\\times 1$ 실 벡터 $v$와 $w$에 대하여 $Av\\cdot w=v\\cdot Aw$이다.",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)")],
    answer: 1,
    explanation: "(1) 거짓. 반례: 단위행렬 $I_n$은 대칭이지만 모든 고윳값이 1로 같음. (2) 참. 대칭행렬 성질. (3) 참. 대칭행렬은 항상 직교 대각화 가능. (4) 참. $Av\\cdot w = v\\cdot A^T w = v\\cdot Aw$ (대칭이라 $A^T=A$). 정답 (1)."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error(error); process.exit(1); }
console.log("Inserted:");
for (const r of data) console.log(`  - ${r.id}  [${r.subject}/${r.unit}/${r.difficulty}]`);
