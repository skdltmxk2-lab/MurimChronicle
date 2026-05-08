// Upload 2023년도 경기대 편입수학 기출 20문항 (26~45번, 4지선다)
// Usage: node scripts/upload_general_2023_kyonggi.mjs
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
const YEAR = "2023";
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
    num: 26, subject: "미분학", unit: "극한과 연속", concept: "구분 함수의 연속", difficulty: "easyMedium",
    question: "함수 $f(x)=\\begin{cases} a\\cosh x & x\\le 0 \\\\ \\dfrac{x}{\\sqrt{3x^2+3x+1}} & x>0 \\end{cases}$가 $x=0$에서 연속일 때, 실수 $a$의 값은?",
    options: [o("1","$0$"), o("2","$\\dfrac{1}{\\sqrt 3}$"), o("3","$\\dfrac{2}{\\sqrt 3}$"), o("4","$\\sqrt 3$")],
    answer: 1,
    explanation: "$x=0$에서 연속 조건: 좌극한 = 우극한 = $f(0)$. 좌극한 = $\\lim_{x\\to 0^-} a\\cosh x = a\\cdot 1 = a$. 우극한 = $\\lim_{x\\to 0^+}\\dfrac{x}{\\sqrt{3x^2+3x+1}} = \\dfrac{0}{1}=0$. 따라서 $a=0$."
  }),
  build({
    num: 27, subject: "다변수함수", unit: "중적분", concept: "이중적분(대칭성)", difficulty: "easyMedium",
    question: "영역 $D=\\{(x,y)\\in\\mathbb R^2\\,|\\,-1\\le x\\le 1,\\ -1\\le y\\le 1\\}$에서 이중적분 $\\displaystyle\\iint_D (x^4+3x^2 y^2+y^4)\\,dA$의 값은?",
    options: [o("1","$\\dfrac{32}{15}$"), o("2","$\\dfrac{44}{15}$"), o("3","$\\dfrac{64}{15}$"), o("4","$\\dfrac{88}{15}$")],
    answer: 2,
    explanation: "피적분함수가 $x,y$ 모두에 대해 우함수. 1사분면 적분의 4배: $4\\int_0^1\\!\\int_0^1 (x^4+3x^2 y^2+y^4)dx\\,dy = 4\\!\\left(\\dfrac{1}{5}+\\dfrac{1}{3}+\\dfrac{1}{5}\\right) = 4\\cdot\\dfrac{11}{15}=\\dfrac{44}{15}$. ($\\int_0^1 x^4 dx=\\tfrac{1}{5}$, $\\int_0^1\\int_0^1 3x^2 y^2 = 3\\cdot\\tfrac{1}{3}\\cdot\\tfrac{1}{3}=\\tfrac{1}{3}$ 등)."
  }),
  build({
    num: 28, subject: "미분학", unit: "도함수의 응용", concept: "극값 정리(반례)", difficulty: "medium",
    question: "함수 $f:\\mathbb R\\to\\mathbb R$가 $c\\in\\mathbb R$의 근방에서 연속인 2계 도함수를 가질 때, <보기>의 명제 중 항상 참인 것을 모두 고르면? 가. $f$가 $c$에서 극값을 가지면 $f'(c)=0$이다. 나. $f'(c)=0$이면 $f$는 $c$에서 극댓값 또는 극솟값을 갖는다. 다. $f'(c)=0$이고 $f''(c)>0$이면 $f$는 $c$에서 극댓값을 갖는다.",
    options: [o("1","가"), o("2","가, 나"), o("3","가, 나, 다"), o("4","가, 다")],
    answer: 1,
    explanation: "가. 참(극값의 필요조건). 나. 거짓 (반례: $f(x)=x^3$, $f'(0)=0$이지만 변곡점일 뿐 극값 아님). 다. 거짓 ($f''(c)>0$이면 아래로 볼록 → 극솟값. 극댓값은 $f''(c)<0$일 때). 정답 가만."
  }),
  build({
    num: 29, subject: "다변수함수", unit: "추가내용", concept: "곡면 법선벡터", difficulty: "easy",
    question: "다음 중 곡면 $z=x^2 y$ 위의 점 $(1,1,1)$에서의 법선벡터는?",
    options: [o("1","$(1,1,1)$"), o("2","$(1,1,-1)$"), o("3","$(2,1,1)$"), o("4","$(2,1,-1)$")],
    answer: 4,
    explanation: "$f(x,y,z)=x^2 y - z = 0$로 두면 곡면의 법선벡터는 $\\nabla f = (2xy,\\ x^2,\\ -1)$. $(1,1,1)$ 대입: $(2,1,-1)$."
  }),
  build({
    num: 30, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피 비교", difficulty: "easyMedium",
    question: "<보기>에서 주어진 각 함수를 $0\\le x\\le \\pi$에서 $x$축을 회전축으로 회전시킬 때 얻어지는 입체의 부피가 큰 것부터 순서대로 나열한 것은? 가. $\\sin x$  나. $e^{\\sin x}$  다. $e^x$",
    options: [o("1","가, 나, 다"), o("2","나, 다, 가"), o("3","다, 가, 나"), o("4","다, 나, 가")],
    answer: 4,
    explanation: "$0\\le x\\le \\pi$에서 세 함수의 크기 비교: $\\sin x \\le 1\\le e^{\\sin x}\\le e\\le e^x$ (단, $x\\ge 1$ 영역에서). 회전체 부피는 $\\pi\\int_0^\\pi y^2 dx$이므로 함숫값이 클수록 부피도 큼. 따라서 $e^x > e^{\\sin x} > \\sin x$ → 다, 나, 가."
  }),
  build({
    num: 31, subject: "선형대수", unit: "행렬", concept: "기약 행 사다리꼴 판정", difficulty: "easyMedium",
    question: "<보기>에서 기약행사다리꼴(row reduced echelon form) 행렬을 모두 고르면? 가. $\\begin{pmatrix}1&0&1\\\\0&1&1\\\\0&0&1\\end{pmatrix}$  나. $\\begin{pmatrix}1&0&1\\\\0&1&1\\\\0&0&0\\end{pmatrix}$  다. $\\begin{pmatrix}1&0&0\\\\0&0&1\\\\0&1&0\\end{pmatrix}$  라. $\\begin{pmatrix}1&0&1\\\\0&1&0\\\\0&0&0\\end{pmatrix}$",
    options: [o("1","가, 나, 라"), o("2","나, 라"), o("3","다, 라"), o("4","가, 나, 다, 라")],
    answer: 2,
    explanation: "기약 행 사다리꼴 조건: ① 선도 1, ② 선도 1 위·아래는 0, ③ 0이 아닌 행은 위쪽, 0행은 아래쪽, ④ 선도 1은 오른쪽 아래로 이동. 가. (3,3) 위치 1 위에 (1,3),(2,3)에 1이 있어 위반. 나. 모든 조건 만족 ✓. 다. 두 번째 행의 선도가 셋째 열, 세 번째 행 선도가 둘째 열이라 순서 위반. 라. 모든 조건 만족 ✓. 정답 나, 라."
  }),
  build({
    num: 32, subject: "선형대수", unit: "벡터공간", concept: "벡터공간 판정(닫힘)", difficulty: "medium",
    question: "<보기>에서 주어진 집합이 행렬의 덧셈과 스칼라곱에 대하여 벡터공간인 것을 모두 고르면? (단, $M_{n\\times n}$은 n차 실정사각행렬의 집합이다.) 가. $\\{A\\in M_{n\\times n}\\,|\\,A=A^T\\}$  나. $\\{A\\in M_{n\\times n}\\,|\\,A$는 가역행렬$\\}$  다. $\\{A\\in M_{n\\times n}\\,|\\,A$는 상삼각행렬$\\}$",
    options: [o("1","가, 나"), o("2","가, 다"), o("3","나, 다"), o("4","가, 나, 다")],
    answer: 2,
    explanation: "벡터공간 조건: ① 영원소 포함, ② 덧셈과 스칼라곱에 대해 닫힘. 가. 영행렬은 대칭. 두 대칭행렬의 합·스칼라곱도 대칭 → 벡터공간 ✓. 나. 영행렬은 가역이 아니므로 위반 ✗. 다. 영행렬은 상삼각. 두 상삼각의 합·스칼라곱도 상삼각 → 벡터공간 ✓. 정답 가, 다."
  }),
  build({
    num: 33, subject: "선형대수", unit: "고유치와 대각화", concept: "고유치 동치 조건", difficulty: "medium",
    question: "$\\lambda$가 실수이고 $A$가 $n\\times n$ 실 행렬일 때, 다음 중 나머지 셋과 동치가 아닌 것은? (1) $\\lambda$는 $A$의 고윳값이다. (2) $\\det(\\lambda I_n - A)=0$이다. (3) 집합 $\\{x\\in\\mathbb R^n\\,|\\,Ax=\\lambda x\\}$는 $\\mathbb R^n$의 부분공간이다. (4) 선형연립방정식 $(\\lambda I_n - A)x=0$은 비자명해(nontrivial solution)을 갖는다.",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)")],
    answer: 3,
    explanation: "(1)(2)(4)는 모두 '$\\lambda$가 $A$의 고윳값'과 동치. (3) 집합 $\\{x\\,|\\,Ax=\\lambda x\\}$는 $\\lambda$가 고윳값이든 아니든 항상 영벡터 $0$을 포함하므로 부분공간이다(고윳값이 아니면 $\\{0\\}$만, 고윳값이면 고유공간 = $\\{0\\} \\cup$ 고유벡터). 즉 (3)은 항상 참이라 (1)(2)(4)와 동치가 아님 (다른 셋은 동치이고 (3)은 더 약한 항상 참 명제). 정답 (3)."
  }),
  build({
    num: 34, subject: "선형대수", unit: "행렬", concept: "rank 행 환산", difficulty: "easyMedium",
    question: "행렬 $A=\\begin{pmatrix}4&3&2&1\\\\5&4&3&2\\\\6&5&4&3\\\\7&6&5&4\\end{pmatrix}$의 계수(위수) $\\text{rank}(A)$는?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 2,
    explanation: "각 행의 차이가 일정한 등차 패턴. $R_2-R_1=(1,1,1,1)$, $R_3-R_2=(1,1,1,1)$, $R_4-R_3=(1,1,1,1)$. 행 환산하면 $R_1=(4,3,2,1)$ 외에 $(1,1,1,1)$ 한 행만 독립. Rank=2."
  }),
  build({
    num: 35, subject: "선형대수", unit: "고유치와 대각화", concept: "닮음/고유치 평행 이동", difficulty: "medium",
    question: "실행렬 $A$와 행렬 $\\begin{pmatrix}2&-2&2\\\\0&2&-2\\\\0&0&2\\end{pmatrix}$가 닮음일 때, 행렬 $A-I_3$의 모든 고윳값의 곱은? (단, $I_3$은 3차 단위 행렬이다.)",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$8$")],
    answer: 1,
    explanation: "닮은 행렬은 같은 고윳값. 상삼각행렬의 고윳값 = 대각원소 = $2,2,2$. 따라서 $A$의 고윳값도 $2,2,2$. $A-I_3$의 고윳값은 각각 $-1$ 만큼 평행이동: $1,1,1$. 곱 = $1$."
  }),
  build({
    num: 36, subject: "미분학", unit: "도함수의 응용", concept: "절댓값 함수의 미분가능성", difficulty: "medium",
    question: "함수 $f(x)=|x^3-6x^2+12x-k|$가 모든 실수 $x$에서 미분가능일 때, 실수 $k$의 값은?",
    options: [o("1","$4$"), o("2","$6$"), o("3","$8$"), o("4","$10$")],
    answer: 3,
    explanation: "$g(x)=x^3-6x^2+12x-k$로 두면 $g'(x)=3x^2-12x+12=3(x-2)^2\\ge 0$. 따라서 $g$는 단조증가, $g$의 그래프가 $x$축과 한 번만 만남(또는 접함). $|g(x)|$가 모든 점에서 미분가능하려면 $g$가 $x$축과 만나는 점에서 접해야 함(접선의 기울기 0이라 절댓값 영향 없음). $g'(x)=0$의 해는 $x=2$이고 그 점에서 $g(2)=0$이어야 함: $8-24+24-k=0 \\Rightarrow k=8$."
  }),
  build({
    num: 37, subject: "선형대수", unit: "벡터공간", concept: "두 직선 사이 거리", difficulty: "medium",
    question: "두 직선 $\\dfrac{x-1}{1}=\\dfrac{y-1}{2}=\\dfrac{z}{2}$와 $\\dfrac{x-1}{2}=\\dfrac{y-5}{5}=\\dfrac{z+2}{6}$ 사이의 최단 거리는?",
    options: [o("1","$3$"), o("2","$\\dfrac{10}{3}$"), o("3","$\\dfrac{11}{3}$"), o("4","$4$")],
    answer: 2,
    explanation: "두 직선이 꼬인 직선이라 가정. $L_1$ 한 점 $(1,1,0)$, 방향 $\\vec u=(1,2,2)$. $L_2$ 한 점 $(1,5,-2)$, 방향 $\\vec v=(2,5,6)$. 외적 $\\vec u\\times\\vec v = (12-10,4-6,5-4) = (2,-2,1)$, 크기 $3$. 두 점을 잇는 벡터 $\\vec w=(0,4,-2)$. 거리 = $\\dfrac{|\\vec w\\cdot(\\vec u\\times\\vec v)|}{|\\vec u\\times\\vec v|} = \\dfrac{|0-8-2|}{3}=\\dfrac{10}{3}$."
  }),
  build({
    num: 38, subject: "적분학", unit: "정적분의 응용", concept: "함수 부등식 + 적분 최댓값", difficulty: "mediumHard",
    question: "$-2x\\le f(x)\\le x\\sqrt{1+x^2},\\ 0\\le x\\le 2$를 만족하는 모든 적분가능 함수 $f$에 대하여 $\\displaystyle\\int_0^2 |f(x)|\\,dx$의 최댓값은?",
    options: [o("1","$\\dfrac{1}{3}(5\\sqrt 5-1)$"), o("2","$4$"), o("3","$\\dfrac{1}{3}(5\\sqrt 5+1)$"), o("4","$\\dfrac{10}{3}$")],
    answer: 3,
    explanation: "$|f(x)|$가 최대가 되도록 $f(x)$를 잡으면, 두 경계 함수 $-2x$와 $x\\sqrt{1+x^2}$ 중 절댓값이 큰 쪽을 따라가야 한다. 두 곡선 교점: $-2x = x\\sqrt{1+x^2}$ (음수=양수는 불가). 따라서 $|{-2x}| = 2x$와 $|x\\sqrt{1+x^2}|=x\\sqrt{1+x^2}$ 비교: $2x = x\\sqrt{1+x^2} \\Rightarrow 4=1+x^2 \\Rightarrow x=\\sqrt 3$. $0\\le x\\le \\sqrt 3$에서 $2x \\ge x\\sqrt{1+x^2}$이므로 $f(x)=-2x$ 선택, $\\sqrt 3\\le x\\le 2$에서 $f(x)=x\\sqrt{1+x^2}$ 선택. 최댓값 = $\\int_0^{\\sqrt 3} 2x\\,dx + \\int_{\\sqrt 3}^2 x\\sqrt{1+x^2}\\,dx = [x^2]_0^{\\sqrt 3} + \\left[\\dfrac{(1+x^2)^{3/2}}{3}\\right]_{\\sqrt 3}^2 = 3 + \\dfrac{5\\sqrt 5 - 8}{3} = \\dfrac{9+5\\sqrt 5-8}{3} = \\dfrac{5\\sqrt 5+1}{3}$."
  }),
  build({
    num: 39, subject: "다변수함수", unit: "선적분과 면적분", concept: "보존장(완전미분)", difficulty: "medium",
    question: "$C$가 점 $(0,0)$에서 점 $(0,\\pi)$까지의 선분과 점 $(0,\\pi)$에서 점 $(1,\\pi)$까지의 선분이 이어진 곡선일 때, 선적분 $\\displaystyle\\int_C e^x(\\cos(xy)-y\\sin(xy))dx - x e^x \\sin(xy)dy$의 값은?",
    options: [o("1","$-e-1$"), o("2","$-e+\\dfrac{1}{2}$"), o("3","$e-1$"), o("4","$e-\\dfrac{1}{2}$")],
    answer: 1,
    explanation: "$M=e^x(\\cos(xy)-y\\sin(xy)),\\ N=-x e^x\\sin(xy)$. $M_y = e^x(-x\\sin(xy)-\\sin(xy)-xy\\cos(xy))$, $N_x = -e^x\\sin(xy)-x e^x\\sin(xy)-x e^x\\cdot y\\cos(xy)$. 정리하면 $M_y=N_x$이므로 보존장. 母함수 $\\phi$: $\\phi_x=M$, 시도해 보면 $\\phi=e^x\\cos(xy)$. 검증: $\\phi_x = e^x\\cos(xy) + e^x\\cdot(-y\\sin(xy)) = e^x(\\cos(xy)-y\\sin(xy))$ ✓. $\\phi_y = e^x\\cdot(-x\\sin(xy)) = -x e^x\\sin(xy)$ ✓. 시점 $(0,0)$, 종점 $(1,\\pi)$. 적분 = $\\phi(1,\\pi)-\\phi(0,0) = e\\cos\\pi - 1 = -e-1$."
  }),
  build({
    num: 40, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "교대급수 합($\\ln(1+x)$)", difficulty: "medium",
    question: "함수 $f$가 $f(x)=\\displaystyle\\sum_{n=1}^{\\infty}(-1)^{n-1}\\dfrac{x^{2n}}{n}$로 주어질 때, $f\\!\\left(\\dfrac{1}{2}\\right)$의 값은?",
    options: [o("1","$\\sin\\dfrac{1}{2}$"), o("2","$\\cos\\dfrac{1}{2}$"), o("3","$\\sqrt e$"), o("4","$\\ln\\dfrac{5}{4}$")],
    answer: 4,
    explanation: "공식 $\\ln(1+u) = \\sum_{n=1}^{\\infty}(-1)^{n-1}\\dfrac{u^n}{n}$. $u=x^2$ 대입: $f(x)=\\sum(-1)^{n-1}\\dfrac{(x^2)^n}{n}=\\ln(1+x^2)$. $x=\\tfrac{1}{2}$ 대입: $\\ln(1+\\tfrac{1}{4})=\\ln\\dfrac{5}{4}$."
  }),
  build({
    num: 41, subject: "선형대수", unit: "벡터공간", concept: "코시-슈바르츠/내적 최댓값", difficulty: "medium",
    question: "함수 $f$가 $\\mathbb R^4$의 원점을 제외한 모든 점에서 $f(x_1,x_2,x_3,x_4)=\\dfrac{3x_1+2x_2+x_3+4x_4}{\\sqrt{x_1^2+x_2^2+x_3^2+x_4^2}}$로 주어질 때, $f$의 최댓값은?",
    options: [o("1","$30$"), o("2","$10$"), o("3","$\\sqrt{30}$"), o("4","$\\sqrt{10}$")],
    answer: 3,
    explanation: "코시-슈바르츠 부등식: $(3x_1+2x_2+x_3+4x_4)^2 \\le (9+4+1+16)(x_1^2+x_2^2+x_3^2+x_4^2)$. 즉 $(3x_1+\\cdots+4x_4)^2 \\le 30\\cdot(x_1^2+\\cdots+x_4^2)$. 양변 제곱근: $|f| \\le \\sqrt{30}$. 등호는 $\\vec x$가 $(3,2,1,4)$와 평행할 때 성립. 최댓값 $\\sqrt{30}$."
  }),
  build({
    num: 42, subject: "선형대수", unit: "행렬", concept: "직교행렬 성질", difficulty: "medium",
    question: "$A$가 $n\\times n$ 실 행렬일 때, 다음 중 항상 참은 아닌 것은? (1) $A$가 직교행렬이면 $A$의 행벡터들은 정규직교이다. (2) $A$가 직교행렬이면 $A$의 열벡터들은 정규직교이다. (3) $A$가 가역행렬이면 $A^{-1}A^T$는 직교행렬이다. (4) $A$가 직교행렬이면 모든 정수 $k$에 대하여 $A^k$도 직교행렬이다. (단, $A^0$은 $n$차 단위행렬이다.)",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)")],
    answer: 3,
    explanation: "(1)(2): 직교행렬의 정의. (4): $A$가 직교행렬이면 $A^T A=I$이고, $A^{-1}=A^T$. $A^k$가 직교행렬임은 귀납적으로 증명 가능 → 참. (3): $B=A^{-1}A^T$가 직교행렬이려면 $B^T B = I$. $B^T = A(A^{-1})^T = A(A^T)^{-1}$. $B^T B = A(A^T)^{-1}A^{-1}A^T = A(A^T)^{-1}\\cdot A^{-1}A^T$. 일반적으로 $I$가 아님(반례 가능). 정답 (3)."
  }),
  build({
    num: 43, subject: "선형대수", unit: "벡터공간", concept: "직선 대칭변환 행렬", difficulty: "mediumHard",
    question: "$0<\\theta<\\dfrac{\\pi}{2}$인 실수 $\\theta$에 대하여 $T:\\mathbb R^2\\to\\mathbb R^2$가 직선 $y=(\\tan\\theta)x$에 대한 대칭변환일 때, 모든 $\\binom{x_1}{x_2}\\in\\mathbb R^2$에 대하여 $T\\binom{x_1}{x_2}=A\\binom{x_1}{x_2}$를 만족하는 2차 정사각행렬 $A$는?",
    options: [
      o("1","$\\begin{pmatrix}\\cos\\theta&-\\sin\\theta\\\\\\sin\\theta&\\cos\\theta\\end{pmatrix}$"),
      o("2","$\\begin{pmatrix}\\cos\\theta&\\sin\\theta\\\\\\sin\\theta&-\\cos\\theta\\end{pmatrix}$"),
      o("3","$\\begin{pmatrix}\\cos 2\\theta&-\\sin 2\\theta\\\\\\sin 2\\theta&\\cos 2\\theta\\end{pmatrix}$"),
      o("4","$\\begin{pmatrix}\\cos 2\\theta&\\sin 2\\theta\\\\\\sin 2\\theta&-\\cos 2\\theta\\end{pmatrix}$")
    ],
    answer: 4,
    explanation: "원점을 지나는 직선 $y=mx$에 대한 대칭변환의 표준 행렬: $A=\\dfrac{1}{1+m^2}\\begin{pmatrix}1-m^2 & 2m\\\\ 2m & m^2-1\\end{pmatrix}$. $m=\\tan\\theta$ 대입: $1+m^2=\\sec^2\\theta$이므로 $\\dfrac{1-\\tan^2\\theta}{\\sec^2\\theta}=\\cos^2\\theta-\\sin^2\\theta=\\cos 2\\theta$, $\\dfrac{2\\tan\\theta}{\\sec^2\\theta}=2\\sin\\theta\\cos\\theta=\\sin 2\\theta$. 결과 $A=\\begin{pmatrix}\\cos 2\\theta & \\sin 2\\theta\\\\\\sin 2\\theta & -\\cos 2\\theta\\end{pmatrix}$."
  }),
  build({
    num: 44, subject: "선형대수", unit: "벡터공간", concept: "직교사영(정규직교 기저)", difficulty: "medium",
    question: "두 벡터 $(1,1,1,1)$와 $(-1,1,1,-1)$에 의하여 생성되는 $\\mathbb R^4$의 부분 공간을 $W$라 할 때, 벡터 $x=(3,2,1,4)$의 $W$로의 직교사영 $\\text{proj}_W x$는?",
    options: [
      o("1","$\\!\\left(\\dfrac{7}{2},\\dfrac{3}{2},\\dfrac{3}{2},\\dfrac{7}{2}\\right)$"),
      o("2","$\\!\\left(\\dfrac{3}{2},\\dfrac{7}{2},\\dfrac{7}{2},\\dfrac{3}{2}\\right)$"),
      o("3","$\\!\\left(-\\dfrac{7}{2},-\\dfrac{3}{2},-\\dfrac{3}{2},-\\dfrac{7}{2}\\right)$"),
      o("4","$\\!\\left(-\\dfrac{3}{2},-\\dfrac{7}{2},-\\dfrac{7}{2},-\\dfrac{3}{2}\\right)$")
    ],
    answer: 1,
    explanation: "두 기저 벡터 $\\vec u_1=(1,1,1,1),\\ \\vec u_2=(-1,1,1,-1)$ 확인: $\\vec u_1\\cdot\\vec u_2=-1+1+1-1=0$이라 직교. 직교사영 = $\\dfrac{x\\cdot u_1}{u_1\\cdot u_1}u_1 + \\dfrac{x\\cdot u_2}{u_2\\cdot u_2}u_2 = \\dfrac{3+2+1+4}{4}(1,1,1,1) + \\dfrac{-3+2+1-4}{4}(-1,1,1,-1) = \\dfrac{10}{4}(1,1,1,1) + \\dfrac{-4}{4}(-1,1,1,-1) = (\\tfrac{5}{2},\\tfrac{5}{2},\\tfrac{5}{2},\\tfrac{5}{2})+(1,-1,-1,1) = (\\dfrac{7}{2},\\dfrac{3}{2},\\dfrac{3}{2},\\dfrac{7}{2})$."
  }),
  build({
    num: 45, subject: "선형대수", unit: "벡터공간", concept: "열공간(선형결합)", difficulty: "medium",
    question: "$A$가 $n\\times n$ 실 행렬이고 $x,b\\in\\mathbb R^n$가 열벡터라 하자. $Ax=b$일 때, 다음 중 항상 참인 것은? (1) $x$와 $b$가 일차종속이면 $x$를 고유벡터로 갖는 $A$의 고윳값이 존재한다. (2) $x$는 $A$의 영공간에 속한다. (3) $b^T$는 $A$의 행공간에 속한다. (4) $b$는 $A$의 열공간에 속한다.",
    options: [o("1","(1)"), o("2","(2)"), o("3","(3)"), o("4","(4)")],
    answer: 4,
    explanation: "(4) $Ax=b$이면 $b$는 $A$의 열들의 선형결합 ($b = x_1\\vec a_1 + x_2\\vec a_2 + \\cdots + x_n\\vec a_n$, $\\vec a_i$는 $A$의 $i$번째 열)이므로 정의상 $b$는 $A$의 열공간에 속한다. 항상 참. (1) $x=0$이면 일차종속이지만 고유벡터는 영벡터를 제외하므로 반례. (2) 일반적으로 $Ax=b\\ne 0$이면 영공간에 속하지 않음. (3) 차원이 안 맞음 ($b^T$는 행벡터이지만 행공간 내 위치는 별개 문제)."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error(error); process.exit(1); }
console.log("Inserted:");
for (const r of data) console.log(`  - ${r.id}  [${r.subject}/${r.unit}/${r.difficulty}]`);
