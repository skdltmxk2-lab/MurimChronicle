// Upload 다변수함수 Daily TEST 21~36 (89 problems).
// Usage: node scripts/upload_daily_tests_mv_21to36.mjs
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

const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ testNo, num, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-daily-mv-r${testNo}-${num}`;
  const tags = Array.from(new Set(["daily", `daily-test-mv-${testNo}`, "다변수함수", unit, concept].filter(Boolean)));
  return {
    id, subject: "다변수함수", unit, concept, difficulty,
    source_type: "imported", question, content_type: "latex", question_image: null,
    options, correct_option_id: answer, explanation, explanation_content_type: "latex",
    explanation_image: null, tags,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  };
}

const problems = [
  // ========== DT21 극값 ==========
  build({ testNo: 21, num: 1, unit: "Taylor급수와 최대/최소", concept: "극값 판정", difficulty: "easyMedium",
    question: "함수 $f(x,y)=x^3-y^3+3xy$의 극솟값을 구하면?",
    options: [o("1","$-1$"),o("2","$0$"),o("3","$1$"),o("4","$2$"),o("5","$-2$")],
    answer: "1",
    explanation: "$f_x=3x^2+3y=0,\\ f_y=-3y^2+3x=0$. 임계점 $(0,0),(1,-1)$. $D(1,-1)>0,f_{xx}>0$ 극소. $f(1,-1)=1+1-3=-1$." }),
  build({ testNo: 21, num: 2, unit: "Taylor급수와 최대/최소", concept: "극값 판정", difficulty: "easyMedium",
    question: "$f(x,y)=x^2y-8xy+\\dfrac{1}{3}y^3+3$이 극댓값을 갖는 점의 좌표는?",
    options: [o("1","$(0,0)$"),o("2","$(8,0)$"),o("3","$(4,4)$"),o("4","$(4,-4)$"),o("5","$(2,2)$")],
    answer: "4",
    explanation: "$f_x=2xy-8y=0,\\ f_y=x^2-8x+y^2=0$. 임계점 $(0,0),(8,0),(4,4),(4,-4)$. $D(4,-4)>0,f_{xx}<0$ 극대." }),
  build({ testNo: 21, num: 3, unit: "Taylor급수와 최대/최소", concept: "극값 판정", difficulty: "easyMedium",
    question: "$f(x,y)=x^2+y^4$이 점 $(a,b)$에서 극값 $c$를 가질 때 $a+b+c$를 구하시오.",
    options: [o("1","$0$"),o("2","$1$"),o("3","$2$"),o("4","$3$"),o("5","$-1$")],
    answer: "1",
    explanation: "임계점 $(0,0)$, $D(0,0)=0$이라 판정 불가지만 그래프 개형상 $(0,0)$에서 극소 $0$. $a+b+c=0$." }),
  build({ testNo: 21, num: 4, unit: "Taylor급수와 최대/최소", concept: "극값 판정", difficulty: "easyMedium",
    question: "함수 $f(x,y)=x^3-2y^2-2y^4+3x^2y$에 대한 설명 중 옳지 않은 것은?",
    options: [
      o("1","$f$의 임계점은 $(0,0),(-1,1/2),(-2,1)$"),
      o("2","$f$는 $(0,0)$에서 극솟값"),
      o("3","$(-1,1/2)$은 안장점"),
      o("4","$f$는 $(-2,1)$에서 극댓값"),
      o("5","$f$는 임계점이 3개")
    ], answer: "2",
    explanation: "$D(0,0)=0$이라 판정 불가지만 극솟값은 아님. ②가 틀림." }),
  build({ testNo: 21, num: 5, unit: "Taylor급수와 최대/최소", concept: "극값 판정", difficulty: "easyMedium",
    question: "함수 $f(x,y)=x^4+y^4-4xy$의 최솟값은?",
    options: [o("1","$-2$"),o("2","$-1$"),o("3","$0$"),o("4","$1$"),o("5","$2$")],
    answer: "1",
    explanation: "$f_x=4x^3-4y=0,f_y=4y^3-4x=0\\Rightarrow y=x^3,x^9=x$. 임계점 $(0,0),(1,1),(-1,-1)$. $f(1,1)=f(-1,-1)=-2$." }),
  build({ testNo: 21, num: 6, unit: "Taylor급수와 최대/최소", concept: "극값 판정", difficulty: "easyMedium",
    question: "함수 $F:R^2\\to R$이 $F(x,y)=x^2+y^2+xy-4x-5y$로 정의될 때 $F$는 점 $(a,b)$에서 최솟값 $c$를 갖는다. $a+b+c$의 값은?",
    options: [o("1","$-7$"),o("2","$-4$"),o("3","$0$"),o("4","$3$"),o("5","$7$")],
    answer: "2",
    explanation: "$F_x=2x+y-4=0,F_y=2y+x-5=0\\Rightarrow x=1,y=2$. $F(1,2)=1+4+2-4-10=-7$. $a+b+c=1+2-7=-4$." }),

  // ========== DT22 극값 (라그랑주, AM-GM) ==========
  build({ testNo: 22, num: 1, unit: "Taylor급수와 최대/최소", concept: "극값(라그랑주)", difficulty: "easyMedium",
    question: "$x^2+y^2=1$일 때 $f(x,y)=xy$의 최댓값은?",
    options: [o("1","$\\dfrac{1}{4}$"),o("2","$\\dfrac{1}{2}$"),o("3","$1$"),o("4","$\\dfrac{\\sqrt 2}{2}$"),o("5","$2$")],
    answer: "2",
    explanation: "AM-GM: $\\frac{x^2+y^2}{2}\\ge|xy|\\Rightarrow|xy|\\le\\frac{1}{2}$. 최댓값 $1/2$." }),
  build({ testNo: 22, num: 2, unit: "Taylor급수와 최대/최소", concept: "극값(AM-GM)", difficulty: "easyMedium",
    question: "곡면 $x^2+2y^2+3z^2=18$ 위 $P(x,y,z)$에서 $f(x,y,z)=xyz$의 최댓값은?",
    options: [o("1","$3$"),o("2","$6$"),o("3","$9$"),o("4","$12$"),o("5","$18$")],
    answer: "2",
    explanation: "AM-GM: $\\frac{x^2+2y^2+3z^2}{3}\\ge\\sqrt[3]{6(xyz)^2}\\Rightarrow 6\\ge\\sqrt[3]{6(xyz)^2}\\Rightarrow xyz\\le 6$." }),
  build({ testNo: 22, num: 3, unit: "Taylor급수와 최대/최소", concept: "극값(AM-GM)", difficulty: "medium",
    question: "타원체면 $\\dfrac{x^2}{4}+y^2+z^2=1$ 위 $(\\pm a,\\pm b,\\pm c)$를 꼭짓점으로 하는 직육면체 부피의 최댓값은?",
    options: [
      o("1","$\\dfrac{8}{3\\sqrt 3}$"),
      o("2","$\\dfrac{16}{3\\sqrt 3}$"),
      o("3","$\\dfrac{4}{3}$"),
      o("4","$8$"),
      o("5","$2\\sqrt 3$")
    ], answer: "2",
    explanation: "$V=8xyz$. $\\frac{x^2/4+y^2+z^2}{3}\\ge\\sqrt[3]{\\frac{x^2 y^2 z^2}{4}}\\Rightarrow xyz\\le\\frac{2}{3\\sqrt 3}$. $V\\le\\frac{16}{3\\sqrt 3}$." }),
  build({ testNo: 22, num: 4, unit: "Taylor급수와 최대/최소", concept: "내접 직육면체", difficulty: "medium",
    question: "타원면 $x^2+2y^2+4z^2=9$ 안에 내접하는 직육면체의 최대 부피는?",
    options: [o("1","$3\\sqrt 6$"),o("2","$6\\sqrt 6$"),o("3","$9\\sqrt 6$"),o("4","$12$"),o("5","$24$")],
    answer: "2",
    explanation: "$\\frac{x^2}{9}+\\frac{2y^2}{9}+\\frac{4z^2}{9}=1$. 반축 $3,3/\\sqrt 2,3/2$. $V=\\frac{8}{3\\sqrt 3}\\cdot 3\\cdot 3/\\sqrt 2\\cdot 3/2=6\\sqrt 6$." }),
  build({ testNo: 22, num: 5, unit: "Taylor급수와 최대/최소", concept: "코시-슈바르츠", difficulty: "easyMedium",
    question: "구면 $x^2+y^2+z^2=1$에서 $f(x,y,z)=x+y$의 최댓값은?",
    options: [o("1","$1$"),o("2","$\\sqrt 2$"),o("3","$\\sqrt 3$"),o("4","$2$"),o("5","$\\dfrac{1}{\\sqrt 2}$")],
    answer: "2",
    explanation: "$(x+y)^2\\le(1^2+1^2)(x^2+y^2+z^2)=2$. 최댓값 $\\sqrt 2$." }),
  build({ testNo: 22, num: 6, unit: "Taylor급수와 최대/최소", concept: "코시-슈바르츠", difficulty: "easyMedium",
    question: "곡면 $x^2+y^2+4z^2=4$ 위에서 $f(x,y,z)=x+y-z$의 최솟값을 $m$, 최댓값을 $M$이라 할 때 $M-m$의 값은?",
    options: [o("1","$3$"),o("2","$6$"),o("3","$\\sqrt 6$"),o("4","$2\\sqrt 6$"),o("5","$9$")],
    answer: "2",
    explanation: "$(x+y-z)^2\\le(1+1+1/4)(x^2+y^2+4z^2)=9/4\\cdot 4=9$. $-3\\le f\\le 3$. $M-m=6$." }),

  // ========== DT23 코시-슈바르츠 / 라그랑주 (4문항) ==========
  build({ testNo: 23, num: 1, unit: "Taylor급수와 최대/최소", concept: "코시-슈바르츠", difficulty: "easyMedium",
    question: "타원면 $x^2+y^2+2z^2=16$ 위에서 $f(x,y,z)=x-y+2z$의 최솟값을 $\\alpha$, 최댓값을 $\\beta$라 할 때 $\\beta-\\alpha$의 값은?",
    options: [o("1","$8$"),o("2","$12$"),o("3","$16$"),o("4","$20$"),o("5","$24$")],
    answer: "3",
    explanation: "$(x-y+2z)^2\\le(1+1+2)(x^2+y^2+2z^2)=4\\cdot 16=64$. $|f|\\le 8$. $\\beta-\\alpha=16$." }),
  build({ testNo: 23, num: 2, unit: "Taylor급수와 최대/최소", concept: "행렬식 / 최솟값", difficulty: "medium",
    question: "행렬식 $\\begin{vmatrix}x&y&z&10\\\\1&0&0&10\\\\0&2&0&10\\\\0&0&3&10\\end{vmatrix}=0$일 때 $x^2+y^2+z^2$의 최솟값은?",
    options: [
      o("1","$\\dfrac{36}{49}$"),
      o("2","$\\dfrac{1}{7}$"),
      o("3","$1$"),
      o("4","$\\dfrac{6}{7}$"),
      o("5","$\\dfrac{36}{14}$")
    ], answer: "1",
    explanation: "행렬식=0 조건에서 평면 $6x+3y+2z=6$. 코시: $36\\le 49(x^2+y^2+z^2)\\Rightarrow x^2+y^2+z^2\\ge\\frac{36}{49}$." }),
  build({ testNo: 23, num: 3, unit: "Taylor급수와 최대/최소", concept: "코시-슈바르츠", difficulty: "easyMedium",
    question: "$x^2+y^2+z^2=35$에서 정의된 함수 $f(x,y,z)=2x+6y+10z$의 최댓값이 $f(a,b,c)=M$일 때 $a+b+c+M$의 값은?",
    options: [o("1","$70$"),o("2","$75$"),o("3","$79$"),o("4","$84$"),o("5","$90$")],
    answer: "3",
    explanation: "$(2x+6y+10z)^2\\le 140\\cdot 35\\Rightarrow|f|\\le 70$. 등호조건 $x:y:z=2:6:10\\Rightarrow t=1/2$. $(a,b,c)=(1,3,5)$. $1+3+5+70=79$." }),
  build({ testNo: 23, num: 4, unit: "Taylor급수와 최대/최소", concept: "라그랑주 승수", difficulty: "medium",
    question: "$x+y+z=11$을 만족하는 실수 $x,y,z$에 대해 $x^2+2y^2+3z^2-4x+4y+6z$의 최솟값은?",
    options: [o("1","$50$"),o("2","$53$"),o("3","$57$"),o("4","$60$"),o("5","$70$")],
    answer: "3",
    explanation: "라그랑주: $2x-4=2y+4=6z+6=\\lambda$. $x=8,y=2,z=1$. 대입 $f(8,2,1)=64+8+3-32+8+6=57$." }),

  // ========== DT24 라그랑주 ==========
  build({ testNo: 24, num: 1, unit: "Taylor급수와 최대/최소", concept: "라그랑주(2 제약)", difficulty: "medium",
    question: "평면 $x+y+z=12$와 포물면 $z=x^2+y^2$의 교선 $C$ 위에서 원점과 가장 가까운 점의 좌표 $(a,b,c)$일 때 $abc$의 값은?",
    options: [o("1","$8$"),o("2","$16$"),o("3","$24$"),o("4","$32$"),o("5","$54$")],
    answer: "4",
    explanation: "$f=x^2+y^2+z^2$ 최소화. 라그랑주 풀이로 $(2,2,8)$. $abc=32$." }),
  build({ testNo: 24, num: 2, unit: "Taylor급수와 최대/최소", concept: "매개화", difficulty: "easyMedium",
    question: "$R^3$에서 원기둥 $x^2+z^2=2$와 평면 $x+y=1$의 교집합 점 $(x,y,z)$에 대해 $f(x,y,z)=x+y+z$의 최댓값을 $a$, 최솟값을 $b$라 할 때 $a+b$의 값은?",
    options: [o("1","$0$"),o("2","$1$"),o("3","$2$"),o("4","$3$"),o("5","$-2$")],
    answer: "3",
    explanation: "$x=\\sqrt 2\\cos t,z=\\sqrt 2\\sin t,y=1-\\sqrt 2\\cos t$. $f=1+\\sqrt 2\\sin t$. 최대 $1+\\sqrt 2$, 최소 $1-\\sqrt 2$. 합 $2$." }),
  build({ testNo: 24, num: 3, unit: "Taylor급수와 최대/최소", concept: "최대/최소 비율", difficulty: "easyMedium",
    question: "함수 $f(x,y)=x^2-y^2$이 $xy$평면의 원 $x^2+y^2=9$ 위에서 정의될 때 (함수의 최댓값)/(함수의 최솟값)을 구하면?",
    options: [o("1","$-1$"),o("2","$1$"),o("3","$0$"),o("4","$9$"),o("5","$-9$")],
    answer: "1",
    explanation: "$y^2=9-x^2$, $f=2x^2-9$ ($-3\\le x\\le 3$). 최대 $9$, 최소 $-9$. 비율 $-1$." }),
  build({ testNo: 24, num: 4, unit: "Taylor급수와 최대/최소", concept: "라그랑주", difficulty: "easyMedium",
    question: "$x+2y=1$을 만족하는 실수 $(x,y)$에 대해 $x^2+xy+y^2$의 최솟값을 구하시오.",
    options: [
      o("1","$\\dfrac{1}{4}$"),
      o("2","$\\dfrac{1}{2}$"),
      o("3","$1$"),
      o("4","$\\dfrac{1}{8}$"),
      o("5","$\\dfrac{3}{4}$")
    ], answer: "1",
    explanation: "$x=1-2y$ 대입: $f=3y^2-3y+1$. $y=1/2$에서 최솟값 $1/4$." }),
  build({ testNo: 24, num: 5, unit: "Taylor급수와 최대/최소", concept: "매개화", difficulty: "easyMedium",
    question: "$x^2+y^2=1$일 때 $4x+y^3$의 최댓값은 얼마인가?",
    options: [o("1","$2$"),o("2","$3$"),o("3","$4$"),o("4","$5$"),o("5","$1$")],
    answer: "3",
    explanation: "$x=\\cos t,y=\\sin t$. $f=4\\cos t+\\sin^3 t$. 미분 $-4\\sin t+3\\sin^2 t\\cos t=0\\Rightarrow \\sin t=0$ or 다른. $t=0$: $f=4$." }),
  build({ testNo: 24, num: 6, unit: "Taylor급수와 최대/최소", concept: "매개화", difficulty: "easyMedium",
    question: "단위원 $x^2+y^2=1$ 위에서 $f(x,y)=xy+y$의 최댓값을 $M$, 최솟값을 $m$이라 할 때 $M-m$의 값은?",
    options: [
      o("1","$\\dfrac{3\\sqrt 3}{2}$"),
      o("2","$\\sqrt 3$"),
      o("3","$3$"),
      o("4","$2$"),
      o("5","$\\dfrac{\\sqrt 3}{2}$")
    ], answer: "1",
    explanation: "$x=\\cos t,y=\\sin t$. $f=\\cos t\\sin t+\\sin t$. 미분 후 $\\cos t=1/2$ 또는 $\\cos t=-1$. $f(\\pi/3)=3\\sqrt 3/4,f(5\\pi/3)=-3\\sqrt 3/4$. $M-m=3\\sqrt 3/2$." }),

  // ========== DT25 영역 최대/최소 (4문항) ==========
  build({ testNo: 25, num: 1, unit: "Taylor급수와 최대/최소", concept: "영역 최대/최소", difficulty: "medium",
    question: "영역 $R=\\{(x,y)|x^2+y^2\\le 1\\}$에서 $f(x,y)=xy^2$의 최댓값 $M$과 최솟값 $m$은?",
    options: [
      o("1","$M=\\dfrac{2\\sqrt 3}{9},m=-\\dfrac{2\\sqrt 3}{9}$"),
      o("2","$M=1,m=-1$"),
      o("3","$M=\\dfrac{\\sqrt 3}{9},m=-\\dfrac{\\sqrt 3}{9}$"),
      o("4","$M=\\dfrac{1}{2},m=-\\dfrac{1}{2}$"),
      o("5","$M=0,m=0$")
    ], answer: "1",
    explanation: "내부 임계점은 모두 $f=0$. 경계 $y^2=1-x^2$에서 $f=x-x^3$, $x=\\pm 1/\\sqrt 3$에서 극값 $\\pm 2\\sqrt 3/9$." }),
  build({ testNo: 25, num: 2, unit: "Taylor급수와 최대/최소", concept: "영역 최대/최소", difficulty: "medium",
    question: "영역 $\\{(x,y)|x^2+y^2\\le 9\\}$에서 $f(x,y)=x^2+2y^2-4y+1$의 최댓값과 최솟값의 합은?",
    options: [o("1","$10$"),o("2","$20$"),o("3","$30$"),o("4","$40$"),o("5","$50$")],
    answer: "3",
    explanation: "내부 임계점 $(0,1),f=-1$. 경계 $f=y^2-4y+10$, $y=-3$에서 31, $y=2$에서 6. 합 $31+(-1)=30$." }),
  build({ testNo: 25, num: 3, unit: "Taylor급수와 최대/최소", concept: "영역 최대/최소", difficulty: "medium",
    question: "$D=\\{(x,y)\\in R^2:x^2+2y^2\\le 2\\}$에서 $f(x,y)=x^2+xy+2y^2$의 최댓값과 최솟값의 차는?",
    options: [
      o("1","$2+\\dfrac{1}{\\sqrt 2}$"),
      o("2","$\\dfrac{1}{\\sqrt 2}$"),
      o("3","$2$"),
      o("4","$1$"),
      o("5","$\\sqrt 2$")
    ], answer: "1",
    explanation: "내부 임계점 $(0,0),f=0$. 경계 $f=2+xy$, AM-GM으로 $|xy|\\le 1/\\sqrt 2$. 최대 $2+1/\\sqrt 2$, 최소 $0$. 차 $2+1/\\sqrt 2$." }),
  build({ testNo: 25, num: 4, unit: "Taylor급수와 최대/최소", concept: "영역 최대/최소", difficulty: "medium",
    question: "영역 $D=\\{(x,y)|0\\le x\\le 3,0\\le y\\le 2\\}$에서 $f(x,y)=x^2-2xy+2y$의 최댓값은?",
    options: [o("1","$3$"),o("2","$5$"),o("3","$7$"),o("4","$9$"),o("5","$11$")],
    answer: "4",
    explanation: "내부 임계점 $(1,1),f=1$. 경계 검사: $y=0,x=3$: $f=9$. 최대 $9$." }),

  // ========== DT26 거리 + 이중적분 ==========
  build({ testNo: 26, num: 1, unit: "Taylor급수와 최대/최소", concept: "점-곡면 거리", difficulty: "easyMedium",
    question: "점 $(1,-2,0)$에서 곡면 $z=\\sqrt{x^2+y^2}$ 사이의 최소거리는?",
    options: [
      o("1","$1$"),
      o("2","$\\sqrt 2$"),
      o("3","$\\dfrac{\\sqrt{10}}{2}$"),
      o("4","$\\sqrt 5$"),
      o("5","$\\dfrac{1}{\\sqrt 2}$")
    ], answer: "3",
    explanation: "원뿔까지 점-거리 최소화. 풀이로 $\\sqrt{5/2}=\\sqrt{10}/2$." }),
  build({ testNo: 26, num: 2, unit: "Taylor급수와 최대/최소", concept: "점-곡면 거리", difficulty: "easyMedium",
    question: "점 $(1,1,0)$에서 포물면 $z=x^2+y^2$까지의 최단거리는?",
    options: [
      o("1","$\\dfrac{\\sqrt 3}{2}$"),
      o("2","$\\dfrac{1}{2}$"),
      o("3","$\\dfrac{\\sqrt 2}{2}$"),
      o("4","$1$"),
      o("5","$\\sqrt 2$")
    ], answer: "1",
    explanation: "라그랑주로 $(1/2,1/2,1/2)$. 거리 $\\sqrt{3/4}=\\sqrt 3/2$." }),
  build({ testNo: 26, num: 3, unit: "중적분", concept: "이중적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^\\pi\\int_1^2 y\\sin(xy)\\,dx\\,dy$의 값은?",
    options: [o("1","$0$"),o("2","$1$"),o("3","$\\pi$"),o("4","$2$"),o("5","$-1$")],
    answer: "1",
    explanation: "내부 적분 $[-\\cos(xy)]_1^2=-\\cos(2y)+\\cos y$. $\\int_0^\\pi(-\\cos 2y+\\cos y)dy=0+0=0$." }),
  build({ testNo: 26, num: 4, unit: "중적분", concept: "이중적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_{-3}^{3}\\int_0^{\\pi/2}(y+y^2\\cos x)dxdy$의 값은?",
    options: [o("1","$9$"),o("2","$12$"),o("3","$15$"),o("4","$18$"),o("5","$21$")],
    answer: "4",
    explanation: "$\\int(y\\pi/2+y^2)dy = [\\pi y^2/4+y^3/3]_{-3}^{3}=0+18=18$." }),
  build({ testNo: 26, num: 5, unit: "중적분", concept: "감마함수", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^\\infty\\int_{-\\sqrt y}^{\\sqrt y}e^{-y}\\,dx\\,dy$의 값은?",
    options: [o("1","$\\sqrt\\pi$"),o("2","$\\pi$"),o("3","$1$"),o("4","$\\sqrt 2$"),o("5","$2$")],
    answer: "1",
    explanation: "내부 $2\\sqrt y$. $\\int_0^\\infty 2\\sqrt y e^{-y}dy=2\\Gamma(3/2)=\\sqrt\\pi$." }),
  build({ testNo: 26, num: 6, unit: "중적분", concept: "이중적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^1\\int_0^1\\dfrac{x}{xy+2}dxdy$의 값은?",
    options: [
      o("1","$3\\ln 3-3\\ln 2-1$"),
      o("2","$\\ln 3$"),
      o("3","$\\ln 2$"),
      o("4","$1$"),
      o("5","$\\ln 6$")
    ], answer: "1",
    explanation: "$x$ 적분 어렵, $y$ 먼저: $\\int_0^1\\ln|xy+2|dx=\\int_0^1[\\ln|x+2|-\\ln 2]dx=3\\ln 3-3\\ln 2-1$." }),

  // ========== DT27 적분 순서 변경 (5문항) ==========
  build({ testNo: 27, num: 1, unit: "중적분", concept: "적분 순서 변경", difficulty: "medium",
    question: "$\\displaystyle\\int_\\pi^{2\\pi}\\int_{2y-2\\pi}^{2\\pi}\\dfrac{\\sin^2 x}{x}dxdy$의 값은?",
    options: [
      o("1","$\\dfrac{\\pi}{2}$"),
      o("2","$\\pi$"),
      o("3","$\\dfrac{\\pi}{4}$"),
      o("4","$1$"),
      o("5","$\\dfrac{1}{2}$")
    ], answer: "1",
    explanation: "순서 바꾸면 $\\int_0^{2\\pi}\\frac{\\sin^2 x}{x}\\cdot\\frac{x}{2}dx=\\frac{1}{2}\\int_0^{2\\pi}\\sin^2 x dx=\\pi/2$." }),
  build({ testNo: 27, num: 2, unit: "중적분", concept: "적분 순서 변경", difficulty: "medium",
    question: "$\\displaystyle\\int_0^1\\int_{e^x}^e\\dfrac{1}{\\ln y}dydx$의 값은?",
    options: [o("1","$e-1$"),o("2","$e$"),o("3","$\\ln 2$"),o("4","$1$"),o("5","$2(e-1)$")],
    answer: "1",
    explanation: "순서 바꾸면 $\\int_1^e\\int_0^{\\ln y}\\frac{1}{\\ln y}dxdy=\\int_1^e 1dy=e-1$." }),
  build({ testNo: 27, num: 3, unit: "중적분", concept: "적분 순서 변경", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^1\\int_{\\sin^{-1}x}^{\\pi/2}e^{\\cos y}dydx$의 값은?",
    options: [o("1","$e-1$"),o("2","$e$"),o("3","$1$"),o("4","$2(e-1)$"),o("5","$\\pi$")],
    answer: "1",
    explanation: "순서 바꾸면 $\\int_0^{\\pi/2}\\int_0^{\\sin y}e^{\\cos y}dxdy=\\int_0^{\\pi/2}e^{\\cos y}\\sin y dy=[-e^{\\cos y}]_0^{\\pi/2}=e-1$." }),
  build({ testNo: 27, num: 4, unit: "중적분", concept: "적분 순서 변경", difficulty: "medium",
    question: "$\\displaystyle\\int_0^1\\int_0^{\\cos^{-1}y}\\sin x\\sqrt{1+\\sin^2 x}dxdy$의 값은?",
    options: [
      o("1","$\\dfrac{2\\sqrt 2-1}{3}$"),
      o("2","$\\dfrac{\\sqrt 2}{3}$"),
      o("3","$1$"),
      o("4","$\\dfrac{1}{3}$"),
      o("5","$\\dfrac{2}{3}$")
    ], answer: "1",
    explanation: "순서 바꾸면 $\\int_0^{\\pi/2}\\sin x\\sqrt{1+\\sin^2 x}\\cos x dx=\\frac{1}{3}(2\\sqrt 2-1)$." }),
  build({ testNo: 27, num: 5, unit: "중적분", concept: "적분 순서 변경", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^8\\int_1^{\\sqrt{x+1}}f(x,y)dydx=\\int_a^b\\int_{y^2-1}^8 f(x,y)dxdy$일 때 $a+b$의 값은?",
    options: [o("1","$2$"),o("2","$3$"),o("3","$4$"),o("4","$5$"),o("5","$6$")],
    answer: "3",
    explanation: "$0\\le x\\le 8,1\\le y\\le\\sqrt{x+1}\\Leftrightarrow 1\\le y\\le 3,y^2-1\\le x\\le 8$. $a+b=1+3=4$." }),

  // ========== DT28 반복적분 ==========
  build({ testNo: 28, num: 1, unit: "중적분", concept: "적분 순서 변경", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^1\\int_y^1 e^{x^2}dxdy$의 값은?",
    options: [
      o("1","$\\dfrac{e-1}{2}$"),
      o("2","$e-1$"),
      o("3","$\\dfrac{e}{2}$"),
      o("4","$1$"),
      o("5","$e$")
    ], answer: "1",
    explanation: "순서 바꾸면 $\\int_0^1\\int_0^x e^{x^2}dydx=\\int_0^1 xe^{x^2}dx=(e-1)/2$." }),
  build({ testNo: 28, num: 2, unit: "중적분", concept: "적분 순서 변경", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^{\\pi/2}\\int_y^{\\pi/2}\\dfrac{\\sin x}{x}dxdy$를 계산하면?",
    options: [o("1","$0$"),o("2","$1$"),o("3","$\\pi/2$"),o("4","$\\pi$"),o("5","$2$")],
    answer: "2",
    explanation: "순서 바꾸면 $\\int_0^{\\pi/2}\\int_0^x\\frac{\\sin x}{x}dydx=\\int_0^{\\pi/2}\\sin x dx=1$." }),
  build({ testNo: 28, num: 3, unit: "중적분", concept: "적분 순서 변경", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^4\\int_{\\sqrt y}^2\\dfrac{1}{1+x^3}dxdy$의 값은?",
    options: [
      o("1","$\\dfrac{2}{3}\\ln 3$"),
      o("2","$\\dfrac{1}{3}\\ln 3$"),
      o("3","$\\ln 9$"),
      o("4","$\\dfrac{2}{3}\\ln 2$"),
      o("5","$\\ln 3$")
    ], answer: "1",
    explanation: "순서 바꾸면 $\\int_0^2\\int_0^{x^2}\\frac{1}{1+x^3}dydx=\\int_0^2\\frac{x^2}{1+x^3}dx=\\frac{1}{3}\\ln 9=\\frac{2}{3}\\ln 3$." }),
  build({ testNo: 28, num: 4, unit: "중적분", concept: "이중적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^1\\int_{\\sqrt x}^1 (1+7y^3)^{1/3}dydx$의 값은?",
    options: [
      o("1","$\\dfrac{15}{28}$"),
      o("2","$\\dfrac{1}{4}$"),
      o("3","$\\dfrac{1}{2}$"),
      o("4","$1$"),
      o("5","$\\dfrac{3}{4}$")
    ], answer: "1",
    explanation: "순서 바꾸면 $\\int_0^1\\int_0^{y^2}(1+7y^3)^{1/3}dxdy=\\int_0^1 y^2(1+7y^3)^{1/3}dy=15/28$." }),
  build({ testNo: 28, num: 5, unit: "중적분", concept: "적분 순서 변경", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^2\\int_{y^2}^4 e^{\\sqrt x}dxdy$의 값은?",
    options: [
      o("1","$\\dfrac{2}{3}(e^8-1)$"),
      o("2","$\\dfrac{2}{3}(e^4-1)$"),
      o("3","$\\dfrac{1}{3}(e^4-1)$"),
      o("4","$e^4-1$"),
      o("5","$2e^4$")
    ], answer: "2",
    explanation: "순서 바꾸면 $\\int_0^4\\int_0^{\\sqrt x}e^{\\sqrt x}dydx=\\int_0^4\\sqrt x e^{\\sqrt x}dx=\\frac{2}{3}(e^2)^2-... = 2/3(e^4-1)$. 답지: $2(e^4-1)/3$." }),
  build({ testNo: 28, num: 6, unit: "중적분", concept: "적분 순서 변경", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^1\\int_{x^{1/3}}^1\\dfrac{4\\pi\\sin(\\pi y^2)}{y^2}dydx$의 값은?",
    options: [o("1","$0$"),o("2","$2$"),o("3","$4$"),o("4","$\\pi$"),o("5","$2\\pi$")],
    answer: "3",
    explanation: "순서 바꾸면 $\\int_0^1\\int_0^{y^3}\\frac{4\\pi\\sin(\\pi y^2)}{y^2}dxdy=\\int_0^1 4\\pi y\\sin(\\pi y^2)dy=4$." }),

  // ========== DT29 이중적분 극좌표 ==========
  build({ testNo: 29, num: 1, unit: "중적분", concept: "적분 순서 변경", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^{2\\sqrt{\\ln 3}}\\int_{y/2}^{\\sqrt{\\ln 3}}e^{x^2}dxdy$의 값은?",
    options: [o("1","$2$"),o("2","$3$"),o("3","$1$"),o("4","$e$"),o("5","$\\ln 3$")],
    answer: "1",
    explanation: "순서 바꾸면 $\\int_0^{\\sqrt{\\ln 3}}\\int_0^{2x}e^{x^2}dydx=\\int_0^{\\sqrt{\\ln 3}}2xe^{x^2}dx=e^{\\ln 3}-1=2$." }),
  build({ testNo: 29, num: 2, unit: "중적분", concept: "극좌표", difficulty: "easyMedium",
    question: "$D=\\{(x,y)|x^2+y^2\\le 1\\}$일 때 $\\iint_D\\sqrt{1-x^2-y^2}dxdy$의 값은?",
    options: [
      o("1","$\\dfrac{\\pi}{3}$"),
      o("2","$\\dfrac{2\\pi}{3}$"),
      o("3","$\\pi$"),
      o("4","$\\dfrac{\\pi}{2}$"),
      o("5","$\\dfrac{4\\pi}{3}$")
    ], answer: "2",
    explanation: "극좌표: $\\int_0^{2\\pi}\\int_0^1\\sqrt{1-r^2}r drd\\theta=2\\pi\\cdot 1/3=2\\pi/3$." }),
  build({ testNo: 29, num: 3, unit: "중적분", concept: "극좌표", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_{-2}^{2}\\int_0^{\\sqrt{4-x^2}}(x^2+y^2)^{3/2}dydx$의 값은?",
    options: [
      o("1","$\\dfrac{16\\pi}{5}$"),
      o("2","$\\dfrac{32\\pi}{5}$"),
      o("3","$\\dfrac{32\\pi}{3}$"),
      o("4","$\\dfrac{16\\pi}{3}$"),
      o("5","$\\pi$")
    ], answer: "2",
    explanation: "반원 영역, 극좌표: $\\int_0^\\pi\\int_0^2 r^3\\cdot r drd\\theta=\\pi\\cdot 32/5$." }),
  build({ testNo: 29, num: 4, unit: "중적분", concept: "극좌표", difficulty: "easyMedium",
    question: "$D$가 반원 $x=\\sqrt{1-y^2}$과 $y$축에 의해 유계된 영역일 때 $\\iint_D e^{-x^2-y^2}dA$의 값은?",
    options: [
      o("1","$\\dfrac{\\pi}{2}(1-e^{-1})$"),
      o("2","$\\pi(1-e^{-1})$"),
      o("3","$\\dfrac{\\pi}{4}(1-e^{-1})$"),
      o("4","$1-e^{-1}$"),
      o("5","$e^{-1}$")
    ], answer: "1",
    explanation: "반원 영역, 극좌표: $\\int_{-\\pi/2}^{\\pi/2}\\int_0^1 e^{-r^2}r drd\\theta=\\pi\\cdot 1/2(1-e^{-1})=\\pi(1-e^{-1})/2$." }),
  build({ testNo: 29, num: 5, unit: "중적분", concept: "극좌표", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^2\\int_0^{\\sqrt{4-x^2}}\\sin(x^2+y^2)dydx$의 값은?",
    options: [
      o("1","$\\dfrac{\\pi(1-\\cos 4)}{4}$"),
      o("2","$\\dfrac{\\pi(1-\\cos 4)}{2}$"),
      o("3","$1-\\cos 4$"),
      o("4","$\\pi$"),
      o("5","$\\sin 4$")
    ], answer: "1",
    explanation: "1사분원 극좌표: $\\int_0^{\\pi/2}\\int_0^2\\sin r^2\\cdot r drd\\theta=\\pi/4(1-\\cos 4)$." }),
  build({ testNo: 29, num: 6, unit: "중적분", concept: "극좌표", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^1\\int_{-\\sqrt{1-y^2}}^0\\cos(x^2+y^2)dxdy$의 값은?",
    options: [
      o("1","$\\dfrac{\\sin 1}{4}\\pi$"),
      o("2","$\\dfrac{\\pi}{4}$"),
      o("3","$\\sin 1$"),
      o("4","$\\dfrac{\\pi(1-\\cos 1)}{4}$"),
      o("5","$\\dfrac{\\pi}{2}$")
    ], answer: "1",
    explanation: "$\\pi/2\\le\\theta\\le\\pi,0\\le r\\le 1$. $\\pi/2\\cdot\\sin 1/2=\\pi\\sin 1/4$." }),

  // ========== DT30 이중적분 극좌표 ==========
  build({ testNo: 30, num: 1, unit: "중적분", concept: "극좌표", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^2\\int_x^{\\sqrt{8-x^2}}\\dfrac{1}{5+x^2+y^2}dydx$의 값은?",
    options: [
      o("1","$\\dfrac{\\pi}{8}\\ln\\dfrac{13}{5}$"),
      o("2","$\\dfrac{\\pi}{8}$"),
      o("3","$\\dfrac{\\pi}{4}\\ln 2$"),
      o("4","$\\ln 13$"),
      o("5","$\\dfrac{\\pi}{2}\\ln 5$")
    ], answer: "1",
    explanation: "극좌표 $\\pi/4\\le\\theta\\le\\pi/2,0\\le r\\le 2\\sqrt 2$. $\\pi/8(\\ln 13-\\ln 5)$." }),
  build({ testNo: 30, num: 2, unit: "중적분", concept: "극좌표", difficulty: "easyMedium",
    question: "영역 $D=\\{(x,y)|x^2+y^2\\le 1,|x|\\le y\\}$에서 $\\iint_D\\sqrt{x^2+y^2}dA$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{6}$"),o("2","$\\dfrac{\\pi}{3}$"),o("3","$\\dfrac{\\pi}{4}$"),o("4","$\\pi$"),o("5","$\\dfrac{\\pi}{12}$")],
    answer: "1",
    explanation: "$\\pi/4\\le\\theta\\le 3\\pi/4,0\\le r\\le 1$. $\\pi/2\\cdot 1/3=\\pi/6$." }),
  build({ testNo: 30, num: 3, unit: "중적분", concept: "극좌표", difficulty: "easyMedium",
    question: "$D=\\{(x,y)|16\\le x^2+y^2\\le 81\\}\\cap\\{(x,y)|x\\le-y\\}$에서 $\\iint_D\\dfrac{1}{\\sqrt{x^2+y^2}}dxdy$의 값은?",
    options: [o("1","$\\pi$"),o("2","$3\\pi$"),o("3","$5\\pi$"),o("4","$7\\pi$"),o("5","$2\\pi$")],
    answer: "3",
    explanation: "$3\\pi/4\\le\\theta\\le 7\\pi/4$ 사이의 절반, $4\\le r\\le 9$. $\\pi\\cdot 5=5\\pi$." }),
  build({ testNo: 30, num: 4, unit: "중적분", concept: "극좌표", difficulty: "easyMedium",
    question: "$R=\\{(x,y)|1\\le x^2+y^2\\le 4,0\\le y\\le\\sqrt 3 x\\}$에서 $\\iint_R(x^2+y^2)^{3/2}dxdy$의 값은?",
    options: [
      o("1","$\\dfrac{\\pi}{4}$"),
      o("2","$\\dfrac{\\pi}{3}$"),
      o("3","$\\dfrac{\\pi}{2}$"),
      o("4","$\\dfrac{31\\pi}{30}$"),
      o("5","$\\pi$")
    ], answer: "4",
    explanation: "$0\\le\\theta\\le\\pi/3,1\\le r\\le 2$. $\\pi/3\\cdot[r^5/5]_1^2=\\pi/3\\cdot 31/5=31\\pi/15$." }),
  build({ testNo: 30, num: 5, unit: "중적분", concept: "극좌표", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^2\\int_0^{\\sqrt{4-x^2}}\\sin(x^2+y^2)dydx$의 값을 구하면?",
    options: [
      o("1","$\\dfrac{\\pi(1-\\cos 4)}{4}$"),
      o("2","$\\dfrac{\\pi}{2}\\sin 4$"),
      o("3","$\\sin 4$"),
      o("4","$\\dfrac{\\pi}{4}$"),
      o("5","$\\pi$")
    ], answer: "1",
    explanation: "1사분원: $\\pi/4(1-\\cos 4)$." }),
  build({ testNo: 30, num: 6, unit: "중적분", concept: "극좌표", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^{\\sqrt 2}\\int_y^{\\sqrt{4-y^2}}x^2 dxdy$의 값은?",
    options: [
      o("1","$\\dfrac{\\pi+2}{2}$"),
      o("2","$\\dfrac{\\pi}{2}$"),
      o("3","$2$"),
      o("4","$\\dfrac{\\pi}{4}+1$"),
      o("5","$\\pi+1$")
    ], answer: "1",
    explanation: "극좌표 $0\\le\\theta\\le\\pi/4,0\\le r\\le 2$. $\\int_0^2 r^3 dr\\int_0^{\\pi/4}\\cos^2\\theta d\\theta=4\\cdot(\\pi/8+1/4)=(\\pi+2)/2$." }),

  // ========== DT31 무한 영역 / 극좌표 ==========
  build({ testNo: 31, num: 1, unit: "중적분", concept: "무한 적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_{-\\infty}^\\infty\\int_{-\\infty}^\\infty e^{-(x^2+y^2)}dydx$의 값은?",
    options: [o("1","$\\sqrt\\pi$"),o("2","$\\pi$"),o("3","$2\\pi$"),o("4","$\\pi^2$"),o("5","$1$")],
    answer: "2",
    explanation: "극좌표: $\\int_0^{2\\pi}\\int_0^\\infty e^{-r^2}r drd\\theta=2\\pi\\cdot 1/2=\\pi$." }),
  build({ testNo: 31, num: 2, unit: "중적분", concept: "무한 적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_{-\\infty}^\\infty\\int_{-\\infty}^\\infty\\dfrac{1}{(x^2+y^2+1)^2}dxdy$의 값은?",
    options: [o("1","$\\sqrt\\pi$"),o("2","$\\pi$"),o("3","$2\\pi$"),o("4","$\\pi/2$"),o("5","$1$")],
    answer: "2",
    explanation: "극좌표: $2\\pi\\int_0^\\infty\\frac{r}{(r^2+1)^2}dr=2\\pi\\cdot 1/2=\\pi$." }),
  build({ testNo: 31, num: 3, unit: "중적분", concept: "무한 적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^\\infty\\int_0^\\infty\\dfrac{dxdy}{(1+x^2+y^2)^2}$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{4}$"),o("2","$\\dfrac{\\pi}{2}$"),o("3","$\\pi$"),o("4","$1$"),o("5","$\\dfrac{\\pi}{8}$")],
    answer: "1",
    explanation: "1사분 극좌표: $\\pi/2\\cdot 1/2=\\pi/4$." }),
  build({ testNo: 31, num: 4, unit: "중적분", concept: "이중적분", difficulty: "easyMedium",
    question: "곡선 $y=x^2$과 $y=\\sqrt x$로 둘러싸인 영역 $D$에서 $\\iint_D 4xy dA$의 값은?",
    options: [
      o("1","$\\dfrac{1}{3}$"),
      o("2","$\\dfrac{1}{2}$"),
      o("3","$1$"),
      o("4","$\\dfrac{2}{3}$"),
      o("5","$\\dfrac{1}{6}$")
    ], answer: "1",
    explanation: "$0\\le x\\le 1,x^2\\le y\\le\\sqrt x$. $\\int_0^1 2x[x-x^4]dx=2/3-1/3=1/3$." }),
  build({ testNo: 31, num: 5, unit: "중적분", concept: "이중적분", difficulty: "easyMedium",
    question: "직선 $y=x-1$과 포물선 $y^2=2x+6$으로 둘러싸인 영역 $D$에서 $\\iint_D y dA$의 값은?",
    options: [o("1","$12$"),o("2","$15$"),o("3","$18$"),o("4","$24$"),o("5","$36$")],
    answer: "3",
    explanation: "$y$ 적분 형태: $-2\\le y\\le 4$. $\\int_{-2}^4 y[y+1-(y^2/2-3)]dy=18$." }),
  build({ testNo: 31, num: 6, unit: "중적분", concept: "극좌표", difficulty: "medium",
    question: "$\\displaystyle\\int_{1/2}^1\\int_{\\sqrt{1-x^2}}^{\\sqrt 3 x}e^{x^2+y^2}dydx+\\int_1^2\\int_0^{\\sqrt{4-x^2}}e^{x^2+y^2}dydx$의 값은?",
    options: [
      o("1","$\\dfrac{\\pi}{6}(e^4-e)$"),
      o("2","$\\dfrac{\\pi}{4}(e^4-1)$"),
      o("3","$\\dfrac{\\pi}{6}e^4$"),
      o("4","$\\pi(e^4-e)$"),
      o("5","$e^4-e$")
    ], answer: "1",
    explanation: "극좌표 결합 영역: $0\\le\\theta\\le\\pi/3,1\\le r\\le 2$. $\\pi/3\\cdot 1/2(e^4-e)=\\pi(e^4-e)/6$." }),

  // ========== DT32 이중적분으로 정의된 함수, 부피 ==========
  build({ testNo: 32, num: 1, unit: "중적분", concept: "이중적분으로 정의된 함수", difficulty: "easyMedium",
    question: "$f(x)=\\displaystyle\\int_0^{x^2}\\int_1^x e^{t^2}dtdy$로 정의된 함수에 대해 $f'(1)$의 값은?",
    options: [o("1","$0$"),o("2","$1$"),o("3","$e$"),o("4","$2e$"),o("5","$e-1$")],
    answer: "3",
    explanation: "$f(x)=x^2\\int_1^x e^{t^2}dt$. $f'(x)=2x\\int_1^x e^{t^2}dt+x^2 e^{x^2}$. $f'(1)=0+e=e$." }),
  build({ testNo: 32, num: 2, unit: "중적분", concept: "이중적분으로 정의된 함수", difficulty: "easyMedium",
    question: "양의 실수 $t$에 대해 $f(t)=\\displaystyle\\int_0^{2t}\\int_x^{2t}\\dfrac{\\sin y}{y}dydx$. $f'(\\pi/4)$의 값은?",
    options: [o("1","$0$"),o("2","$1$"),o("3","$2$"),o("4","$\\sqrt 2$"),o("5","$\\pi/2$")],
    answer: "3",
    explanation: "순서 바꾸면 $f(t)=\\int_0^{2t}\\sin y dy=1-\\cos 2t$. $f'(t)=2\\sin 2t$. $f'(\\pi/4)=2$." }),
  build({ testNo: 32, num: 3, unit: "체적과 곡면적", concept: "포물면 부피", difficulty: "easyMedium",
    question: "포물면 $z=9-x^2-y^2$과 $xy$평면으로 둘러싸인 입체의 부피는?",
    options: [
      o("1","$\\dfrac{81\\pi}{4}$"),
      o("2","$\\dfrac{81\\pi}{2}$"),
      o("3","$81\\pi$"),
      o("4","$\\dfrac{27\\pi}{2}$"),
      o("5","$27\\pi$")
    ], answer: "2",
    explanation: "$V=\\int_0^{2\\pi}\\int_0^3(9-r^2)rdrd\\theta=2\\pi[9r^2/2-r^4/4]_0^3=81\\pi/2$." }),
  build({ testNo: 32, num: 4, unit: "체적과 곡면적", concept: "두 곡면 부피", difficulty: "easyMedium",
    question: "두 곡면 $z=8-x^2-y^2,\\ z=x^2+y^2$으로 둘러싸인 영역의 부피는?",
    options: [o("1","$8\\pi$"),o("2","$12\\pi$"),o("3","$16\\pi$"),o("4","$24\\pi$"),o("5","$32\\pi$")],
    answer: "3",
    explanation: "교선 $x^2+y^2=4$. $V=\\int_0^{2\\pi}\\int_0^2(8-2r^2)rdrd\\theta=2\\pi[4r^2-r^4/2]_0^2=16\\pi$." }),
  build({ testNo: 32, num: 5, unit: "체적과 곡면적", concept: "구-실린더 부피", difficulty: "medium",
    question: "구 $x^2+y^2+z^2=4$의 내부와 실린더 $y^2+z^2=1$의 외부인 영역의 부피는?",
    options: [o("1","$2\\sqrt 3\\pi$"),o("2","$4\\sqrt 3\\pi$"),o("3","$8\\sqrt 3\\pi$"),o("4","$\\dfrac{8\\pi}{3}$"),o("5","$\\dfrac{16\\pi}{3}$")],
    answer: "2",
    explanation: "원기둥 좌표: $V=2\\int_0^{2\\pi}\\int_1^2 \\sqrt{4-r^2}rdrd\\theta=4\\sqrt 3\\pi$." }),
  build({ testNo: 32, num: 6, unit: "체적과 곡면적", concept: "원기둥-평면 부피", difficulty: "easyMedium",
    question: "원주면 $x^2+y^2=1$과 두 평면 $z=0,3x+z=4$에 의해 둘러싸인 영역의 체적은?",
    options: [o("1","$\\pi$"),o("2","$2\\pi$"),o("3","$3\\pi$"),o("4","$4\\pi$"),o("5","$5\\pi$")],
    answer: "4",
    explanation: "$V=\\iint(4-3x)dA=\\int_0^{2\\pi}\\int_0^1(4-3r\\cos\\theta)rdrd\\theta=2\\pi\\cdot 2=4\\pi$." }),

  // ========== DT33 입체 부피, 곡면적 ==========
  build({ testNo: 33, num: 1, unit: "체적과 곡면적", concept: "입체 부피", difficulty: "easyMedium",
    question: "원기둥 $x^2+y^2=1$, 평면 $z=2x,xy$평면으로 둘러싸이고 $z\\ge 0$을 만족하는 점들로 이루어진 영역의 부피는?",
    options: [
      o("1","$\\dfrac{2}{3}$"),
      o("2","$\\dfrac{4}{3}$"),
      o("3","$1$"),
      o("4","$2$"),
      o("5","$\\dfrac{1}{3}$")
    ], answer: "2",
    explanation: "$V=\\iint 2xdA$ (오른쪽 반원). $\\int_{-\\pi/2}^{\\pi/2}\\int_0^1 2r\\cos\\theta\\cdot rdrd\\theta=2\\cdot 2/3=4/3$." }),
  build({ testNo: 33, num: 2, unit: "체적과 곡면적", concept: "두 원기둥 교차", difficulty: "medium",
    question: "두 원기둥 $x^2+y^2=1,\\ y^2+z^2=1$로 갇힌 입체의 부피는?",
    options: [
      o("1","$\\dfrac{8}{3}$"),
      o("2","$\\dfrac{16}{3}$"),
      o("3","$\\dfrac{32}{3}$"),
      o("4","$8$"),
      o("5","$16$")
    ], answer: "2",
    explanation: "Steinmetz solid: $V=2\\int_{-1}^1 2(1-y^2)dy=8\\cdot 2/3=16/3$." }),
  build({ testNo: 33, num: 3, unit: "체적과 곡면적", concept: "두 곡면 부피", difficulty: "medium",
    question: "두 곡면 $z=2x^2+2y^2,\\ x^2+y^2=2x,$ 그리고 평면 $z=0$으로 둘러싸인 부분의 부피는?",
    options: [o("1","$\\pi$"),o("2","$2\\pi$"),o("3","$3\\pi$"),o("4","$4\\pi$"),o("5","$6\\pi$")],
    answer: "3",
    explanation: "원 $x^2+y^2=2x$ → 극좌표 $r=2\\cos\\theta$. $V=2\\int_0^{\\pi/2}\\int_0^{2\\cos\\theta}2r^2\\cdot rdrd\\theta=3\\pi$." }),
  build({ testNo: 33, num: 4, unit: "체적과 곡면적", concept: "포물면 부피", difficulty: "medium",
    question: "포물면 $z=x^2+4y^2$과 $xy$평면 그리고 두 포물주면 $y^2=x,x^2=y$에 의해 둘러싸인 입체 영역의 부피를 구하시오.",
    options: [o("1","$\\dfrac{1}{7}$"),o("2","$\\dfrac{2}{7}$"),o("3","$\\dfrac{3}{7}$"),o("4","$\\dfrac{4}{7}$"),o("5","$1$")],
    answer: "3",
    explanation: "$0\\le x\\le 1,x^2\\le y\\le\\sqrt x$. 적분 결과 $3/7$." }),
  build({ testNo: 33, num: 5, unit: "체적과 곡면적", concept: "매개곡면 표면적", difficulty: "medium",
    question: "$S:\\vec X(u,v)=(\\rho+\\cos v)\\cos u\\vec i+(\\rho+\\cos v)\\sin u\\vec j+\\sin v\\vec k\\ (0\\le u\\le 2\\pi,0\\le v\\le 2\\pi,\\rho>1)$의 표면적은?",
    options: [o("1","$2\\pi^2\\rho$"),o("2","$4\\pi^2\\rho$"),o("3","$\\pi^2\\rho$"),o("4","$4\\pi\\rho$"),o("5","$2\\pi\\rho$")],
    answer: "2",
    explanation: "Torus 표면적: $|x_u\\times x_v|=\\rho+\\cos v$. $\\int_0^{2\\pi}\\int_0^{2\\pi}(\\rho+\\cos v)dudv=4\\pi^2\\rho$." }),
  build({ testNo: 33, num: 6, unit: "체적과 곡면적", concept: "곡면적", difficulty: "medium",
    question: "$R^3$에서 원기둥 $x^2+y^2=3$과 곡면 $z=xy$이 만날 때 원기둥 내부에 있는 곡면의 면적은?",
    options: [
      o("1","$\\dfrac{14\\pi}{3}$"),
      o("2","$\\dfrac{28\\pi}{3}$"),
      o("3","$2\\pi$"),
      o("4","$8\\pi$"),
      o("5","$4\\pi$")
    ], answer: "1",
    explanation: "$S=\\iint\\sqrt{1+y^2+x^2}dA$. 극좌표: $\\int_0^{2\\pi}\\int_0^{\\sqrt 3}\\sqrt{1+r^2}rdrd\\theta=14\\pi/3$." }),

  // ========== DT34 곡면적, 적분 순서 변경, 원기둥 ==========
  build({ testNo: 34, num: 1, unit: "체적과 곡면적", concept: "포물면 곡면적", difficulty: "medium",
    question: "평면 $z=4$ 아래에 있는 곡면 $z=x^2+y^2$의 곡면적은?",
    options: [
      o("1","$\\dfrac{\\pi}{6}(17\\sqrt{17}-1)$"),
      o("2","$\\dfrac{\\pi}{6}\\cdot 17\\sqrt{17}$"),
      o("3","$\\dfrac{\\pi}{4}(17\\sqrt{17}-1)$"),
      o("4","$4\\pi$"),
      o("5","$\\pi$")
    ], answer: "1",
    explanation: "$S=\\int_0^{2\\pi}\\int_0^2\\sqrt{1+4r^2}rdrd\\theta=\\frac{\\pi}{6}(17\\sqrt{17}-1)$." }),
  build({ testNo: 34, num: 2, unit: "체적과 곡면적", concept: "경계곡면 표면적", difficulty: "medium",
    question: "영역 $\\{(x,y,z)|x^2+y^2\\le z,0\\le z\\le 1\\}$의 경계곡면의 표면적은?",
    options: [
      o("1","$\\dfrac{5\\pi}{6}(\\sqrt 5+1)$"),
      o("2","$\\dfrac{\\pi}{6}(5\\sqrt 5-1)$"),
      o("3","$\\pi$"),
      o("4","$5\\pi$"),
      o("5","$\\dfrac{\\pi}{3}(\\sqrt 5+1)$")
    ], answer: "1",
    explanation: "옆면 $\\frac{\\pi}{6}(5\\sqrt 5-1)$ + 윗면 $\\pi$. 합 $\\frac{5\\pi}{6}(\\sqrt 5+1)$." }),
  build({ testNo: 34, num: 3, unit: "삼중적분과 극좌표계", concept: "삼중적분", difficulty: "medium",
    question: "$\\displaystyle\\int_0^1\\int_{\\sqrt x}^1\\int_0^{1+y^2}\\dfrac{1}{\\sqrt z}dzdydx$의 값을 구하여라.",
    options: [
      o("1","$\\dfrac{8\\sqrt 2}{9}-\\dfrac{4}{9}$"),
      o("2","$\\dfrac{4}{9}(2\\sqrt 2-1)$"),
      o("3","$\\dfrac{8}{9}$"),
      o("4","$\\dfrac{4\\sqrt 2}{9}$"),
      o("5","$1$")
    ], answer: "2",
    explanation: "내부 $z$: $2\\sqrt{1+y^2}$. 순서 바꿔 $\\int_0^1\\int_0^{y^2}2\\sqrt{1+y^2}dxdy=2\\int_0^1 y^2\\sqrt{1+y^2}\\cdot 1$ 후 $4(2\\sqrt 2-1)/9$." }),
  build({ testNo: 34, num: 4, unit: "삼중적분과 극좌표계", concept: "원기둥좌표", difficulty: "medium",
    question: "$\\displaystyle\\int_{-1}^1\\int_{-\\sqrt{1-x^2}}^{\\sqrt{1-x^2}}\\int_{x^2+y^2}^{3-x^2-y^2}(x^2+y^2)^{3/2}dzdydx$의 값은?",
    options: [
      o("1","$\\dfrac{22\\pi}{35}$"),
      o("2","$\\dfrac{\\pi}{4}$"),
      o("3","$\\pi$"),
      o("4","$\\dfrac{2\\pi}{7}$"),
      o("5","$\\dfrac{22\\pi}{5}$")
    ], answer: "1",
    explanation: "원기둥좌표: $\\int_0^{2\\pi}\\int_0^1 r^3(3-2r^2)rdrd\\theta=2\\pi\\cdot 11/35=22\\pi/35$." }),
  build({ testNo: 34, num: 5, unit: "삼중적분과 극좌표계", concept: "원기둥좌표", difficulty: "medium",
    question: "$\\displaystyle\\int_{-3}^3\\int_{-\\sqrt{9-x^2}}^{\\sqrt{9-x^2}}\\int_{\\sqrt{x^2+y^2}}^3\\sqrt{x^2+y^2}dzdydx$의 값은?",
    options: [
      o("1","$\\dfrac{27\\pi}{2}$"),
      o("2","$\\dfrac{27\\pi}{4}$"),
      o("3","$9\\pi$"),
      o("4","$27\\pi$"),
      o("5","$\\dfrac{81\\pi}{2}$")
    ], answer: "1",
    explanation: "원기둥좌표: $\\int_0^{2\\pi}\\int_0^3 r(3-r)rdrd\\theta=2\\pi[r^3-r^4/4]_0^3=27\\pi/2$." }),
  build({ testNo: 34, num: 6, unit: "삼중적분과 극좌표계", concept: "원기둥좌표", difficulty: "medium",
    question: "평면 $z=2$와 곡면 $z=\\sqrt{x^2+y^2}$로 둘러싸인 입체 $E$에서 $\\iiint_E\\sqrt{x^2+y^2}dV$의 값은?",
    options: [
      o("1","$\\dfrac{8\\pi}{3}$"),
      o("2","$\\dfrac{16\\pi}{3}$"),
      o("3","$\\dfrac{8\\pi}{5}$"),
      o("4","$\\dfrac{4\\pi}{3}$"),
      o("5","$2\\pi$")
    ], answer: "1",
    explanation: "원기둥좌표 $r\\le z\\le 2,0\\le r\\le 2$. $\\int_0^{2\\pi}\\int_0^2 r^2(2-r)drd\\theta=2\\pi[2r^3/3-r^4/4]_0^2=8\\pi/3$." }),

  // ========== DT35 삼중적분 (구좌표/원기둥좌표) ==========
  build({ testNo: 35, num: 1, unit: "삼중적분과 극좌표계", concept: "원기둥좌표", difficulty: "medium",
    question: "원기둥면 $x^2+y^2=4$, 포물면 $z=x^2+y^2$, 그리고 $xy$평면으로 둘러싸인 영역 $S$에서 $\\iiint_S z dxdydz$를 구하면?",
    options: [
      o("1","$\\dfrac{16\\pi}{3}$"),
      o("2","$\\dfrac{32\\pi}{3}$"),
      o("3","$8\\pi$"),
      o("4","$16\\pi$"),
      o("5","$\\dfrac{64\\pi}{3}$")
    ], answer: "2",
    explanation: "원기둥좌표: $\\int_0^{2\\pi}\\int_0^2\\int_0^{r^2}zrdzdrd\\theta=2\\pi\\int_0^2\\frac{r^5}{2}dr=2\\pi\\cdot\\frac{32}{12}=\\frac{32\\pi}{3}$." }),
  build({ testNo: 35, num: 2, unit: "삼중적분과 극좌표계", concept: "구면좌표", difficulty: "medium",
    question: "$B=\\{(x,y,z)|x^2+y^2+z^2\\le 1\\}$일 때 $\\iiint_B(x^2+y^2+z^2)dV$의 값은?",
    options: [
      o("1","$\\dfrac{4\\pi}{5}$"),
      o("2","$\\dfrac{4\\pi}{3}$"),
      o("3","$\\dfrac{2\\pi}{5}$"),
      o("4","$\\pi$"),
      o("5","$\\dfrac{\\pi}{5}$")
    ], answer: "1",
    explanation: "구좌표: $\\int_0^{2\\pi}\\int_0^\\pi\\int_0^1\\rho^4\\sin\\phi d\\rho d\\phi d\\theta=2\\pi\\cdot 2\\cdot 1/5=4\\pi/5$." }),
  build({ testNo: 35, num: 3, unit: "삼중적분과 극좌표계", concept: "구면좌표", difficulty: "medium",
    question: "$B=\\{(x,y,z)\\in R^3|x^2+y^2+z^2\\le 1\\}$일 때 $\\iiint_B\\dfrac{dxdydz}{1+x^2+y^2+z^2}$의 값은?",
    options: [o("1","$\\pi$"),o("2","$2\\pi$"),o("3","$4\\pi-\\pi^2$"),o("4","$4\\pi$"),o("5","$\\pi^2$")],
    answer: "3",
    explanation: "구좌표: $\\int_0^{2\\pi}\\int_0^\\pi\\int_0^1\\frac{\\rho^2\\sin\\phi}{1+\\rho^2}d\\rho d\\phi d\\theta=4\\pi[1-\\pi/4]=4\\pi-\\pi^2$." }),
  build({ testNo: 35, num: 4, unit: "삼중적분과 극좌표계", concept: "구면좌표", difficulty: "medium",
    question: "영역 $E=\\{(x,y,z)|x^2+y^2+z^2\\le 1,z\\ge 0\\}$일 때 $\\iiint_E\\sqrt{x^2+y^2+z^2}dV$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{4}$"),o("2","$\\dfrac{\\pi}{2}$"),o("3","$\\pi$"),o("4","$\\dfrac{2\\pi}{3}$"),o("5","$\\dfrac{\\pi}{3}$")],
    answer: "2",
    explanation: "구좌표 반구: $\\int_0^{2\\pi}\\int_0^{\\pi/2}\\int_0^1\\rho^3\\sin\\phi d\\rho d\\phi d\\theta=2\\pi\\cdot 1\\cdot 1/4=\\pi/2$." }),
  build({ testNo: 35, num: 5, unit: "삼중적분과 극좌표계", concept: "구면좌표", difficulty: "medium",
    question: "$z=\\sqrt{(x^2+y^2)/3}$의 위쪽이며 $x^2+y^2+z^2=1$의 안쪽에 놓이는 영역 $E$에서 $\\iiint_E 8ze^{x^2+y^2+z^2}dV$의 값은?",
    options: [o("1","$\\pi$"),o("2","$2\\pi$"),o("3","$3\\pi$"),o("4","$4\\pi$"),o("5","$6\\pi$")],
    answer: "3",
    explanation: "구좌표 $0\\le\\phi\\le\\pi/3,0\\le\\rho\\le 1$. 적분 결과 $3\\pi$." }),
  build({ testNo: 35, num: 6, unit: "삼중적분과 극좌표계", concept: "구면좌표", difficulty: "medium",
    question: "$\\displaystyle\\int_{-2}^2\\int_0^{\\sqrt{4-y^2}}\\int_{-\\sqrt{4-x^2-y^2}}^{\\sqrt{4-x^2-y^2}}y^2\\sqrt{x^2+y^2+z^2}dzdxdy$의 값은?",
    options: [
      o("1","$\\dfrac{32\\pi}{9}$"),
      o("2","$\\dfrac{64\\pi}{9}$"),
      o("3","$\\dfrac{64\\pi}{3}$"),
      o("4","$\\dfrac{32\\pi}{3}$"),
      o("5","$\\dfrac{128\\pi}{9}$")
    ], answer: "2",
    explanation: "구좌표 반구: $\\int_{-\\pi/2}^{\\pi/2}\\int_0^\\pi\\int_0^2\\rho^5\\sin^3\\phi\\sin^2\\theta d\\rho d\\phi d\\theta=64\\pi/9$." }),

  // ========== DT36 구좌표 (4문항) ==========
  build({ testNo: 36, num: 1, unit: "삼중적분과 극좌표계", concept: "변수변환", difficulty: "medium",
    question: "영역 $R=\\{(x,y,z)|9x^2+4y^2+z^2\\le 1\\}$에 대해 $\\iiint_R(9x^2+4y^2+z^2)^2 dxdydz$의 값은?",
    options: [
      o("1","$\\dfrac{2\\pi}{21}$"),
      o("2","$\\dfrac{\\pi}{21}$"),
      o("3","$\\dfrac{\\pi}{7}$"),
      o("4","$\\dfrac{\\pi}{3}$"),
      o("5","$\\dfrac{2\\pi}{7}$")
    ], answer: "1",
    explanation: "$3x=X,2y=Y,z=Z$. Jacobian $1/6$. 구좌표 적분 결과 $2\\pi/21$." }),
  build({ testNo: 36, num: 2, unit: "삼중적분과 극좌표계", concept: "원뿔-구 부피", difficulty: "medium",
    question: "원뿔면 $z=\\sqrt{x^2+y^2}$ 위와 구면 $x^2+y^2+z^2=2$의 내부에 놓이는 입체의 부피는?",
    options: [
      o("1","$\\dfrac{4\\pi}{3}(\\sqrt 2-1)$"),
      o("2","$\\dfrac{2\\pi}{3}(\\sqrt 2-1)$"),
      o("3","$\\dfrac{4\\pi}{3}$"),
      o("4","$2\\pi$"),
      o("5","$\\dfrac{8\\pi}{3}$")
    ], answer: "1",
    explanation: "구좌표 $0\\le\\phi\\le\\pi/4,0\\le\\rho\\le\\sqrt 2$. $V=2\\pi\\cdot(1-\\sqrt 2/2)\\cdot 2\\sqrt 2/3=\\frac{4\\pi}{3}(\\sqrt 2-1)$." }),
  build({ testNo: 36, num: 3, unit: "삼중적분과 극좌표계", concept: "원뿔-구 부피", difficulty: "medium",
    question: "원뿔 $z=\\sqrt{3(x^2+y^2)}$의 윗부분과 구 $x^2+y^2+z^2=2z$로 둘러싸인 영역의 부피는?",
    options: [
      o("1","$\\dfrac{7\\pi}{12}$"),
      o("2","$\\dfrac{\\pi}{12}$"),
      o("3","$\\dfrac{\\pi}{6}$"),
      o("4","$\\dfrac{\\pi}{3}$"),
      o("5","$\\pi$")
    ], answer: "1",
    explanation: "구 중심 (0,0,1), 반경 1. 구좌표 $\\rho=2\\cos\\phi$. 적분 결과 $7\\pi/12$." }),
  build({ testNo: 36, num: 4, unit: "삼중적분과 극좌표계", concept: "구좌표 질량", difficulty: "medium",
    question: "밀도함수 $\\mu(x,y,z)=3/(x^2+y^2+z^2)$일 때 입체 $E=\\{(x,y,z)\\in R^3|z\\ge 0,x^2+y^2+z^2\\le 4,x^2+y^2\\ge 1\\}$의 질량은?",
    options: [
      o("1","$2\\pi(3\\sqrt 3-\\pi)$"),
      o("2","$\\pi(3\\sqrt 3-\\pi)$"),
      o("3","$6\\pi$"),
      o("4","$\\pi^2$"),
      o("5","$3\\sqrt 3\\pi$")
    ], answer: "1",
    explanation: "구좌표: $m=\\int_0^{2\\pi}\\int_{\\pi/6}^{\\pi/2}\\int_{\\csc\\phi}^2\\frac{3}{\\rho^2}\\rho^2\\sin\\phi d\\rho d\\phi d\\theta=2\\pi(3\\sqrt 3-\\pi)$." }),
];

console.log(`총 ${problems.length}문항 업로드 시작...`);

let success = 0, fail = 0;
for (const p of problems) {
  const { error } = await supabase.from("questions").upsert(p, { onConflict: "id" });
  if (error) { console.error(`❌ ${p.id}:`, error.message); fail++; }
  else { success++; }
}
console.log(`\n✅ 성공: ${success}, ❌ 실패: ${fail}`);
