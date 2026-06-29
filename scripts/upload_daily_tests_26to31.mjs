// Upload Daily TEST 26~31 (36 problems) — final 미분학 daily set.
// All tagged "daily", difficulty restricted to easy / easyMedium per policy.
// Usage: node scripts/upload_daily_tests_26to31.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(here, "..", ".env.local");
const envText = readFileSync(envPath, "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const [k, ...rest] = line.split("=");
      return [k.trim(), rest.join("=").trim()];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });

function build({ testNo, num, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-daily-r${testNo}-${num}`;
  const tagSet = new Set(["daily", `daily-test-${testNo}`, "미분학", unit, concept].filter(Boolean));
  const tags = Array.from(tagSet);
  return {
    id,
    subject: "미분학",
    unit,
    concept,
    difficulty,
    source_type: "imported",
    question,
    content_type: "latex",
    question_image: null,
    options,
    correct_option_id: answer,
    explanation,
    explanation_content_type: "latex",
    explanation_image: null,
    tags,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

const problems = [
  // ============== Daily TEST 26 (변곡점 / 극값 / 방정식 실근) ==============
  build({
    testNo: 26, num: 1, unit: "미분", concept: "변곡점", difficulty: "easyMedium",
    question: "곡선 $y=x^4+ax^2+bx$ ($a, b$는 상수)의 한 변곡점이 $(1, 3)$일 때, $ab$의 값은?",
    options: [
      o("1", "$-48$"),
      o("2", "$48$"),
      o("3", "$-24$"),
      o("4", "$24$"),
      o("5", "$0$")
    ],
    answer: "1",
    explanation: "$f''(x)=12x^2+2a$. $f''(1)=12+2a=0\\Rightarrow a=-6$. $f(1)=1+a+b=3\\Rightarrow b=8$. $ab=-48$."
  }),
  build({
    testNo: 26, num: 2, unit: "미분", concept: "변곡점", difficulty: "easyMedium",
    question: "$f(x)=x^3 e^{-kx}$가 $x=1$에서 변곡점을 갖게 하는 모든 $k$의 값들의 곱은?",
    options: [
      o("1", "$3$"),
      o("2", "$6$"),
      o("3", "$12$"),
      o("4", "$-6$"),
      o("5", "$0$")
    ],
    answer: "2",
    explanation: "$f''(x)=e^{-kx}(k^2 x^3-6kx^2+6x)\\cdot\\dots$ 정리 후 $f''(1)=e^{-k}(k^2-6k+6)=0$. $k^2-6k+6=0$의 두 근의 곱은 (근과 계수의 관계) $6$."
  }),
  build({
    testNo: 26, num: 3, unit: "미분", concept: "극값", difficulty: "easy",
    question: "$y=x^3+ax^2+bx+1$이 $x=1$에서 극솟값 $0$을 갖는다. 이때 상수 $a+b$의 값은?",
    options: [
      o("1", "$-2$"),
      o("2", "$2$"),
      o("3", "$-3$"),
      o("4", "$3$"),
      o("5", "$0$")
    ],
    answer: "1",
    explanation: "$y(1)=1+a+b+1=0\\Rightarrow a+b=-2$. (참고: $y'(1)=3+2a+b=0$도 만족함)"
  }),
  build({
    testNo: 26, num: 4, unit: "곡선의 개형", concept: "극값", difficulty: "easyMedium",
    question: "구간 $[0, 2\\pi]$에서 함수 $f(x)=\\sin x(1+\\cos x)$의 극댓값과 극솟값의 합은?",
    options: [
      o("1", "$0$"),
      o("2", "$\\dfrac{3\\sqrt{3}}{2}$"),
      o("3", "$-\\dfrac{3\\sqrt{3}}{2}$"),
      o("4", "$3$"),
      o("5", "$\\pi$")
    ],
    answer: "1",
    explanation: "$f'(x)=(\\cos x+1)(2\\cos x-1)=0$. $\\cos x=\\dfrac{1}{2}$에서 극값: $f(\\pi/3)=\\dfrac{3\\sqrt{3}}{4}$ (극대), $f(5\\pi/3)=-\\dfrac{3\\sqrt{3}}{4}$ (극소). 합 $=0$."
  }),
  build({
    testNo: 26, num: 5, unit: "곡선의 개형", concept: "극값", difficulty: "easyMedium",
    question: "함수 $f(x)=\\dfrac{1}{3}x^{2/3}(5-2x)$의 극솟점은?",
    options: [
      o("1", "$(0, 0)$"),
      o("2", "$(1, 1)$"),
      o("3", "$\\!\\left(\\dfrac{5}{2}, 0\\right)$"),
      o("4", "$\\!\\left(1, \\dfrac{2}{3}\\right)$"),
      o("5", "$(-1, 1)$")
    ],
    answer: "1",
    explanation: "$f'(x)=\\dfrac{2}{9}x^{-1/3}(5-2x)+\\dfrac{1}{3}x^{2/3}(-2)=\\dfrac{10}{9}x^{-1/3}(1-x)$. $f'$가 부호 바뀌는 곳: $x=0$(미분 불가), $x=1$. $x=0$에서 $f'(0^-)<0$, $f'(0^+)>0$이라 극소. $f(0)=0$."
  }),
  build({
    testNo: 26, num: 6, unit: "곡선의 개형", concept: "방정식의 실근", difficulty: "easyMedium",
    question: "방정식 $x^4+4x^3-8x^2+n=0$이 서로 다른 네 실근을 갖게 하는 정수 $n$은 몇 개인가?",
    options: [
      o("1", "$1$"),
      o("2", "$2$"),
      o("3", "$3$"),
      o("4", "$4$"),
      o("5", "$5$")
    ],
    answer: "2",
    explanation: "$g(x)=x^4+4x^3-8x^2$의 극값 분석. $g'(x)=4x(x+4)(x-1)$. 극값: $g(-4)=-128+\\cdots$, $g(0)=0$, $g(1)=-3$. 부호 변화로부터 $0<n<3$이어야 네 실근 → 정수 $n=1, 2$ (2개)."
  }),

  // ============== Daily TEST 27 (불연속점 / 교점 / 최댓값-최솟값) ==============
  build({
    testNo: 27, num: 1, unit: "극한과 연속", concept: "연속", difficulty: "easyMedium",
    question: "열린구간 $(-2, 2)$에서 $f(x)=[x^3-3x]$의 불연속인 점의 개수는? (단, $[\\,]$는 최대정수함수)",
    options: [
      o("1", "$8$"),
      o("2", "$9$"),
      o("3", "$10$"),
      o("4", "$11$"),
      o("5", "$12$")
    ],
    answer: "3",
    explanation: "$y=x^3-3x$의 극값: $x=-1$에서 극대 $2$, $x=1$에서 극소 $-2$. $(-2, 2)$에서 $y$좌표가 정수인 점은 11개이고, 이 중 $x=1$에서는 연속. 따라서 불연속 점은 $10$개."
  }),
  build({
    testNo: 27, num: 2, unit: "곡선의 개형", concept: "방정식의 실근", difficulty: "easyMedium",
    question: "곡선 $y=x^3$과 직선 $y=3x+k$가 2개 이상의 교점을 갖도록 하는 정수 $k$의 개수는?",
    options: [
      o("1", "$3$"),
      o("2", "$4$"),
      o("3", "$5$"),
      o("4", "$6$"),
      o("5", "$7$")
    ],
    answer: "3",
    explanation: "$x^3-3x-k=0$의 두 개 이상의 실근. 극값 $x=\\pm 1$에서 $f(\\pm 1)=\\mp 2-k$. 두 극값의 곱 $\\le 0$ 조건: $-2\\le k\\le 2$. 정수 $-2, -1, 0, 1, 2$의 5개."
  }),
  build({
    testNo: 27, num: 3, unit: "곡선의 개형", concept: "방정식의 실근", difficulty: "easyMedium",
    question: "$x^3-3cx-54=0$이 서로 다른 세 실근을 갖게 되는 정수 $c$의 값 중 최솟값은?",
    options: [
      o("1", "$9$"),
      o("2", "$10$"),
      o("3", "$11$"),
      o("4", "$12$"),
      o("5", "$13$")
    ],
    answer: "2",
    explanation: "$f(x)=x^3-3cx-54$의 극값 곱 $<0$. $f'(x)=3x^2-3c=0\\Rightarrow x=\\pm\\sqrt{c}$. $f(\\sqrt{c})f(-\\sqrt{c})<0$ 조건 정리하면 $c^3>3^6/4$. 정수 최솟값 $c=10$."
  }),
  build({
    testNo: 27, num: 4, unit: "최대/최소", concept: "최댓값·최솟값", difficulty: "easyMedium",
    question: "$f(x)=xe^{-x^2}$, 구간 $[-1, 1]$에서의 최솟값과 최댓값은?",
    options: [
      o("1", "$-\\dfrac{1}{\\sqrt{2e}},\\ \\dfrac{1}{\\sqrt{2e}}$"),
      o("2", "$-\\dfrac{1}{\\sqrt{e}},\\ \\dfrac{1}{\\sqrt{e}}$"),
      o("3", "$-1,\\ 1$"),
      o("4", "$-\\dfrac{1}{e},\\ \\dfrac{1}{e}$"),
      o("5", "$0,\\ \\dfrac{1}{\\sqrt{2e}}$")
    ],
    answer: "1",
    explanation: "$f'(x)=e^{-x^2}(1-2x^2)=0\\Rightarrow x=\\pm\\dfrac{1}{\\sqrt{2}}$. $f(1/\\sqrt{2})=\\dfrac{1}{\\sqrt{2e}}$, $f(-1/\\sqrt{2})=-\\dfrac{1}{\\sqrt{2e}}$. 양 끝값보다 큼."
  }),
  build({
    testNo: 27, num: 5, unit: "최대/최소", concept: "최댓값·최솟값", difficulty: "easyMedium",
    question: "$0\\le x\\le\\pi$에서 함수 $f(x)=x+2\\sin x$의 최댓값은?",
    options: [
      o("1", "$\\dfrac{2\\pi}{3}+\\sqrt{3}$"),
      o("2", "$\\dfrac{\\pi}{3}+\\sqrt{3}$"),
      o("3", "$\\dfrac{2\\pi}{3}$"),
      o("4", "$\\pi+1$"),
      o("5", "$\\dfrac{\\pi}{2}+2$")
    ],
    answer: "1",
    explanation: "$f'(x)=1+2\\cos x=0\\Rightarrow\\cos x=-\\dfrac{1}{2}\\Rightarrow x=\\dfrac{2\\pi}{3}$. $f(2\\pi/3)=\\dfrac{2\\pi}{3}+2\\cdot\\dfrac{\\sqrt{3}}{2}=\\dfrac{2\\pi}{3}+\\sqrt{3}$. 끝값과 비교 시 최댓값."
  }),
  build({
    testNo: 27, num: 6, unit: "최대/최소", concept: "최댓값·최솟값", difficulty: "easyMedium",
    question: "$f(x)=\\tan^{-1}\\!\\left(\\dfrac{2}{x}\\right)+\\tan^{-1}\\!\\left(\\dfrac{5}{3-x}\\right)$에 대하여 $0<x<3$일 때, $f(x)$가 최소가 되는 $x$는?",
    options: [
      o("1", "$-2+2\\sqrt{5}$"),
      o("2", "$2-2\\sqrt{5}$"),
      o("3", "$\\dfrac{3}{2}$"),
      o("4", "$\\sqrt{5}$"),
      o("5", "$1$")
    ],
    answer: "1",
    explanation: "$f'(x)=\\dfrac{-2/x^2}{1+(2/x)^2}+\\dfrac{5/(3-x)^2}{1+(5/(3-x))^2}=\\dfrac{-2}{x^2+4}+\\dfrac{5}{x^2-6x+34}=0$. 정리: $x^2+4x-16=0\\Rightarrow x=-2+2\\sqrt{5}$ ($0<x<3$ 만족)."
  }),

  // ============== Daily TEST 28 (최댓값-최솟값 응용) ==============
  build({
    testNo: 28, num: 1, unit: "최대/최소", concept: "최댓값·최솟값", difficulty: "easyMedium",
    question: "함수 $f(x)=\\sqrt{4x-x^2}-\\sqrt{6x-x^2-8}$의 최댓값은?",
    options: [
      o("1", "$1$"),
      o("2", "$2$"),
      o("3", "$3$"),
      o("4", "$4$"),
      o("5", "$2\\sqrt{2}$")
    ],
    answer: "2",
    explanation: "정의역: $4x-x^2\\ge 0$ 그리고 $6x-x^2-8\\ge 0$ → $2\\le x\\le 4$. $f'(x)=0$ 풀면 $x=8/3$. $f(8/3)=2\\sqrt{2}/\\dots$ 정리하면 최댓값 $2$."
  }),
  build({
    testNo: 28, num: 2, unit: "최대/최소", concept: "최댓값·최솟값", difficulty: "easyMedium",
    question: "$1\\le x\\le 3$에서 정의된 함수 $f(x)=2\\!\\left(x-\\dfrac{3}{x}\\right)^3-15\\!\\left(x-\\dfrac{3}{x}\\right)^2+36\\!\\left(x-\\dfrac{3}{x}\\right)-50$의 최댓값과 최솟값의 차는?",
    options: [
      o("1", "$100$"),
      o("2", "$150$"),
      o("3", "$176$"),
      o("4", "$200$"),
      o("5", "$220$")
    ],
    answer: "3",
    explanation: "$t=x-\\dfrac{3}{x}$로 두면 $1\\le x\\le 3$에서 $-2\\le t\\le 2$ ($t$는 증가함수). $f(t)=2t^3-15t^2+36t-50$. $f'(t)=6(t-2)(t-3)=0$에서 $t=2$. $f(-2)=-198$ (최소), $f(2)=-22$ (최대). 차 $=176$."
  }),
  build({
    testNo: 28, num: 3, unit: "최대/최소", concept: "최댓값·최솟값", difficulty: "easyMedium",
    question: "함수 $f(x)=x\\ln x+(1-x)\\ln(1-x)$의 최솟값은?",
    options: [
      o("1", "$-\\ln 2$"),
      o("2", "$\\ln 2$"),
      o("3", "$-\\dfrac{1}{2}$"),
      o("4", "$0$"),
      o("5", "$-e$")
    ],
    answer: "1",
    explanation: "정의역 $0<x<1$. $f'(x)=\\ln x+1-\\ln(1-x)-1=0\\Rightarrow\\ln x=\\ln(1-x)\\Rightarrow x=\\dfrac{1}{2}$. $f(1/2)=2\\cdot\\dfrac{1}{2}\\ln\\dfrac{1}{2}=-\\ln 2$."
  }),
  build({
    testNo: 28, num: 4, unit: "곡선의 개형", concept: "변곡점", difficulty: "easy",
    question: "곡선 $y=3-9x+6x^2-x^3$ 위의 접선의 기울기는 $x=a$일 때 최대이다. $a$의 값은?",
    options: [
      o("1", "$1$"),
      o("2", "$2$"),
      o("3", "$3$"),
      o("4", "$0$"),
      o("5", "$-1$")
    ],
    answer: "2",
    explanation: "$y'=-9+12x-3x^2$의 최댓값을 갖는 $x$를 찾는 문제. $y''=12-6x=0\\Rightarrow x=2$. (변곡점에서 $y'$이 극값을 가짐)"
  }),
  build({
    testNo: 28, num: 5, unit: "최대/최소", concept: "최댓값·최솟값", difficulty: "easy",
    question: "$x^2+y^2=1$일 때, $f(x, y)=xy$의 최댓값은?",
    options: [
      o("1", "$\\dfrac{1}{4}$"),
      o("2", "$\\dfrac{1}{2}$"),
      o("3", "$1$"),
      o("4", "$\\dfrac{\\sqrt{2}}{2}$"),
      o("5", "$2$")
    ],
    answer: "2",
    explanation: "산술-기하 평균: $\\dfrac{x^2+y^2}{2}\\ge\\sqrt{x^2 y^2}=|xy|$이므로 $|xy|\\le\\dfrac{1}{2}$. 최댓값 $\\dfrac{1}{2}$ ($x=y=\\pm\\dfrac{1}{\\sqrt{2}}$)."
  }),
  build({
    testNo: 28, num: 6, unit: "최대/최소", concept: "최적화", difficulty: "easyMedium",
    question: "빗변의 길이가 $10$인 직각삼각형 중에서 넓이가 최대인 것의 다른 두 변의 길이의 합은?",
    options: [
      o("1", "$10$"),
      o("2", "$10\\sqrt{2}$"),
      o("3", "$5\\sqrt{2}$"),
      o("4", "$20$"),
      o("5", "$5$")
    ],
    answer: "2",
    explanation: "다른 두 변을 $x, y$라 하면 $x^2+y^2=100$, $S=\\dfrac{xy}{2}$. 산술-기하: $xy\\le\\dfrac{x^2+y^2}{2}=50$, 등호 $x=y=\\sqrt{50}$. 합 $=2\\sqrt{50}=10\\sqrt{2}$."
  }),

  // ============== Daily TEST 29 (도형 내접 최적화) ==============
  build({
    testNo: 29, num: 1, unit: "최대/최소", concept: "최적화", difficulty: "easyMedium",
    question: "포물선 $y=9-x^2$과 $x$축으로 둘러싸인 도형에 내접하는 직사각형의 최대 넓이는?",
    options: [
      o("1", "$6\\sqrt{3}$"),
      o("2", "$12\\sqrt{3}$"),
      o("3", "$18\\sqrt{3}$"),
      o("4", "$24$"),
      o("5", "$36$")
    ],
    answer: "2",
    explanation: "위쪽 두 꼭짓점을 $(\\pm x, 9-x^2)$로 두면 $S=2x(9-x^2)=18x-2x^3$. $S'=18-6x^2=0\\Rightarrow x=\\sqrt{3}$. $S=12\\sqrt{3}$."
  }),
  build({
    testNo: 29, num: 2, unit: "최대/최소", concept: "최적화", difficulty: "easyMedium",
    question: "곡선 $x^2+2y=10$과 $x$축으로 둘러싸인 영역에 내접하는 직사각형의 최대 둘레의 길이는?",
    options: [
      o("1", "$12$"),
      o("2", "$14$"),
      o("3", "$16$"),
      o("4", "$20$"),
      o("5", "$10\\sqrt{2}$")
    ],
    answer: "2",
    explanation: "꼭짓점 $(x, 5-x^2/2)$. 둘레 $l=4x+2(5-x^2/2)=4x+10-x^2$. $l'=4-2x=0\\Rightarrow x=2$. $l=8+10-4=14$."
  }),
  build({
    testNo: 29, num: 3, unit: "최대/최소", concept: "최적화", difficulty: "easyMedium",
    question: "타원 $\\dfrac{x^2}{16}+\\dfrac{y^2}{9}=1$에 내접하면서 면적이 최대가 되는 직사각형의 면적은?",
    options: [
      o("1", "$18$"),
      o("2", "$24$"),
      o("3", "$36$"),
      o("4", "$48$"),
      o("5", "$12$")
    ],
    answer: "2",
    explanation: "1사분면 꼭짓점 $(x, y)$로 면적 $S=4xy$. 산술-기하: $\\dfrac{x^2/16+y^2/9}{2}\\ge\\sqrt{\\dfrac{x^2 y^2}{144}}\\Rightarrow xy\\le 6$. 최대 $S=24$."
  }),
  build({
    testNo: 29, num: 4, unit: "최대/최소", concept: "최적화", difficulty: "easyMedium",
    question: "곡선 $y=\\sqrt{4-x^2}$과 $x$축으로 둘러싸인 부분에 내접하고 한 변이 $x$축에 놓여 있는 직사각형의 넓이의 최댓값은?",
    options: [
      o("1", "$2$"),
      o("2", "$3$"),
      o("3", "$4$"),
      o("4", "$2\\sqrt{2}$"),
      o("5", "$8$")
    ],
    answer: "3",
    explanation: "원 $x^2+y^2=4$의 위쪽 반원. 꼭짓점 $(\\pm x, \\sqrt{4-x^2})$. 면적 $S=2x\\sqrt{4-x^2}$. $S^2=4x^2(4-x^2)$ 최댓값은 $x^2=2$일 때 $16$이므로 $S=4$."
  }),
  build({
    testNo: 29, num: 5, unit: "최대/최소", concept: "최적화", difficulty: "easyMedium",
    question: "반지름이 $3\\,\\text{m}$이고 높이가 $6\\,\\text{m}$인 직원뿔에 내접하는 원기둥의 부피가 최대인 것의 높이는?",
    options: [
      o("1", "$1$"),
      o("2", "$2$"),
      o("3", "$3$"),
      o("4", "$4$"),
      o("5", "$5$")
    ],
    answer: "2",
    explanation: "원기둥 반지름 $x$, 높이 $h$라 하면 닮음으로 $x:h=3:6$ (부분비), 즉 $h=2(3-x)$ 또는 $y=6-2x$. 부피 $V=\\pi x^2(6-2x)$. $V'=0\\Rightarrow x=2$, $h=6-2\\cdot 2=2$."
  }),
  build({
    testNo: 29, num: 6, unit: "최대/최소", concept: "최적화", difficulty: "easyMedium",
    question: "어떤 공장에서 부피가 $27\\,\\text{cm}^3$인 알루미늄 컵을 만들려고 한다. 알루미늄판을 가장 적게 사용해서 컵을 만들려면 높이를 어떻게 하여야 할까? (윗면 없는 원기둥)",
    options: [
      o("1", "$\\dfrac{3}{\\sqrt[3]{\\pi}}$"),
      o("2", "$\\dfrac{3}{\\sqrt[3]{2\\pi}}$"),
      o("3", "$\\sqrt[3]{\\dfrac{27}{\\pi}}$"),
      o("4", "$3\\sqrt[3]{\\pi}$"),
      o("5", "$3$")
    ],
    answer: "1",
    explanation: "$V=\\pi r^2 h=27\\Rightarrow h=\\dfrac{27}{\\pi r^2}$. 윗면 없는 표면적 $S=\\pi r^2+2\\pi rh=\\pi r^2+\\dfrac{54}{r}$. $S'=2\\pi r-\\dfrac{54}{r^2}=0\\Rightarrow r^3=\\dfrac{27}{\\pi}\\Rightarrow r=\\dfrac{3}{\\sqrt[3]{\\pi}}$. $h=r=\\dfrac{3}{\\sqrt[3]{\\pi}}$."
  }),

  // ============== Daily TEST 30 (부피 최적화 / 거리 최소) ==============
  build({
    testNo: 30, num: 1, unit: "최대/최소", concept: "최적화", difficulty: "easyMedium",
    question: "부피가 $54\\pi\\,\\text{cm}^3$인 원기둥 모양의 통조림 캔을 만들 때, 재료가 가장 적게 들도록 하는 밑면의 반지름 $r$과 높이 $h$에 대하여 $\\dfrac{r}{h}$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{4}$"),
      o("2", "$\\dfrac{1}{2}$"),
      o("3", "$1$"),
      o("4", "$2$"),
      o("5", "$\\dfrac{\\sqrt{2}}{2}$")
    ],
    answer: "2",
    explanation: "$V=\\pi r^2 h=54\\pi$. 표면적(양면) $S=2\\pi rh+2\\pi r^2$. 최소 조건: $h=2r\\Rightarrow\\dfrac{r}{h}=\\dfrac{1}{2}$."
  }),
  build({
    testNo: 30, num: 2, unit: "최대/최소", concept: "최적화", difficulty: "easyMedium",
    question: "부피가 $100\\,\\text{cm}^3$인 원기둥 모양의 통조림통을 만들려고 한다. 통조림통 제작에 소요되는 철판의 넓이를 최소화할 때, 통조림통의 반지름은 얼마인가?",
    options: [
      o("1", "$\\sqrt[3]{\\dfrac{50}{\\pi}}$"),
      o("2", "$\\sqrt[3]{\\dfrac{100}{\\pi}}$"),
      o("3", "$\\sqrt[3]{\\dfrac{25}{\\pi}}$"),
      o("4", "$\\sqrt[3]{\\dfrac{200}{\\pi}}$"),
      o("5", "$\\sqrt[3]{\\dfrac{\\pi}{50}}$")
    ],
    answer: "1",
    explanation: "최적 조건 $h=2r$일 때 $V=2\\pi r^3=100\\Rightarrow r^3=\\dfrac{50}{\\pi}\\Rightarrow r=\\sqrt[3]{\\dfrac{50}{\\pi}}$."
  }),
  build({
    testNo: 30, num: 3, unit: "최대/최소", concept: "최적화", difficulty: "easyMedium",
    question: "윗면이 없는 직육면체형 상자를 넓이 $24\\,\\text{m}^2$의 종이로 만들고자 한다. 이 상자의 부피의 최댓값은?",
    options: [
      o("1", "$4\\sqrt{2}$"),
      o("2", "$8\\sqrt{2}$"),
      o("3", "$16$"),
      o("4", "$12$"),
      o("5", "$8$")
    ],
    answer: "2",
    explanation: "밑면 $x\\times y$, 높이 $z$. 표면적 $S=xy+2yz+2xz=24$. 산술-기하: $\\dfrac{xy+2yz+2xz}{3}\\ge\\sqrt[3]{4(xyz)^2}\\Rightarrow 8\\ge\\sqrt[3]{4V^2}\\Rightarrow V\\le 8\\sqrt{2}$."
  }),
  build({
    testNo: 30, num: 4, unit: "최대/최소", concept: "거리 최소", difficulty: "easy",
    question: "점 $(1, 2)$에서 직선 $y=x-1$ 위의 점까지의 최소거리는?",
    options: [
      o("1", "$1$"),
      o("2", "$\\sqrt{2}$"),
      o("3", "$2$"),
      o("4", "$2\\sqrt{2}$"),
      o("5", "$\\dfrac{1}{\\sqrt{2}}$")
    ],
    answer: "2",
    explanation: "직선 $x-y-1=0$과 점 $(1,2)$ 사이 거리 $=\\dfrac{|1-2-1|}{\\sqrt{1^2+1^2}}=\\dfrac{2}{\\sqrt{2}}=\\sqrt{2}$."
  }),
  build({
    testNo: 30, num: 5, unit: "최대/최소", concept: "거리 최소", difficulty: "easy",
    question: "원 $x^2+y^2=1$과 직선 $4x+3y=20$ 위의 점 사이의 최단거리는?",
    options: [
      o("1", "$1$"),
      o("2", "$2$"),
      o("3", "$3$"),
      o("4", "$4$"),
      o("5", "$5$")
    ],
    answer: "3",
    explanation: "원의 중심 $(0,0)$에서 직선까지 거리 $=\\dfrac{|-20|}{\\sqrt{16+9}}=4$. 원의 반지름 $1$을 빼면 최단거리 $=3$."
  }),
  build({
    testNo: 30, num: 6, unit: "최대/최소", concept: "거리 최소", difficulty: "easyMedium",
    question: "점 $(1, 32)$에 가장 가까운 포물선 $y^2=2x$ 상의 점을 $(x_1, y_1)$이라 할 때, $x_1+y_1$의 값은 얼마인가?",
    options: [
      o("1", "$10$"),
      o("2", "$11$"),
      o("3", "$12$"),
      o("4", "$13$"),
      o("5", "$14$")
    ],
    answer: "3",
    explanation: "$x=y^2/2$이므로 거리 제곱 $f(y)=(y^2/2-1)^2+(y-32)^2$. $f'(y)=2(y^2/2-1)y+2(y-32)=0\\Rightarrow y^3=64\\Rightarrow y=4$, $x=8$. $x_1+y_1=12$."
  }),

  // ============== Daily TEST 31 (거리 최소 / 평균값정리 / 선형근사 / 뉴턴법) ==============
  build({
    testNo: 31, num: 1, unit: "최대/최소", concept: "거리 최소", difficulty: "easyMedium",
    question: "점 $(2, 0)$과 곡선 $y=\\sqrt{2x-1}$ 사이의 최소거리는?",
    options: [
      o("1", "$1$"),
      o("2", "$\\sqrt{2}$"),
      o("3", "$2$"),
      o("4", "$\\sqrt{3}$"),
      o("5", "$\\dfrac{1}{2}$")
    ],
    answer: "2",
    explanation: "$l^2=(x-2)^2+y^2=(x-2)^2+2x-1$. $f(x)=(x-2)^2+2x-1$, $f'(x)=2(x-2)+2=0\\Rightarrow x=1$. $l=\\sqrt{(1-2)^2+1}=\\sqrt{2}$."
  }),
  build({
    testNo: 31, num: 2, unit: "최대/최소", concept: "거리 최소", difficulty: "easyMedium",
    question: "점 $P$는 포물선 $y=x^2+2$ 위의 점이고 점 $Q$는 직선 $y=2x-1$ 위의 점이다. 두 점 $P$와 $Q$ 사이의 거리의 최솟값은?",
    options: [
      o("1", "$\\dfrac{1}{\\sqrt{5}}$"),
      o("2", "$\\dfrac{2}{\\sqrt{5}}$"),
      o("3", "$\\dfrac{3}{\\sqrt{5}}$"),
      o("4", "$\\sqrt{5}$"),
      o("5", "$2$")
    ],
    answer: "2",
    explanation: "곡선 위의 접선 기울기 $y'=2x=2\\Rightarrow x=1, y=3$. 점 $(1, 3)$과 직선 $2x-y-1=0$ 사이 거리 $=\\dfrac{|2-3-1|}{\\sqrt{5}}=\\dfrac{2}{\\sqrt{5}}$."
  }),
  build({
    testNo: 31, num: 3, unit: "최대/최소", concept: "거리 최소", difficulty: "easyMedium",
    question: "점 $P$는 곡선 $x^2-xy+y^2=1$ 위의 점이고 점 $Q$는 직선 $y=2x-4$ 위의 점이다. 두 점 $P$와 $Q$ 사이의 거리의 최솟값은?",
    options: [
      o("1", "$\\dfrac{1}{\\sqrt{5}}$"),
      o("2", "$\\dfrac{2}{\\sqrt{5}}$"),
      o("3", "$\\dfrac{3}{\\sqrt{5}}$"),
      o("4", "$\\sqrt{5}$"),
      o("5", "$\\dfrac{6}{\\sqrt{5}}$")
    ],
    answer: "2",
    explanation: "음함수 미분: $\\dfrac{dy}{dx}=\\dfrac{2x-y}{x-2y}$. 기울기 $2$인 곳: $2x-y=2(x-2y)\\Rightarrow y=0, x=\\pm 1$. 점 $(1, 0)$과 직선 $2x-y-4=0$ 사이 거리 $=\\dfrac{|2-4|}{\\sqrt{5}}=\\dfrac{2}{\\sqrt{5}}$."
  }),
  build({
    testNo: 31, num: 4, unit: "평균값의 정리 및 로피탈 정리", concept: "평균값의 정리", difficulty: "easyMedium",
    question: "$f(1)=-3$이고 구간 $(1, 3)$의 모든 점 $x$에서 $f'(x)\\le 5$일 때, 함숫값 $f(3)$이 가질 수 있는 가장 큰 값은?",
    options: [
      o("1", "$5$"),
      o("2", "$7$"),
      o("3", "$10$"),
      o("4", "$13$"),
      o("5", "$15$")
    ],
    answer: "2",
    explanation: "평균값 정리: $\\dfrac{f(3)-f(1)}{3-1}=f'(c)\\le 5\\Rightarrow f(3)-f(1)\\le 10\\Rightarrow f(3)\\le -3+10=7$."
  }),
  build({
    testNo: 31, num: 5, unit: "미분", concept: "선형근사", difficulty: "easyMedium",
    question: "$\\sqrt[3]{26.7}$의 근삿값을 계산하면?",
    options: [
      o("1", "$\\dfrac{269}{90}$"),
      o("2", "$\\dfrac{27}{10}$"),
      o("3", "$\\dfrac{8}{3}$"),
      o("4", "$\\dfrac{81}{30}$"),
      o("5", "$\\dfrac{90}{269}$")
    ],
    answer: "1",
    explanation: "$f(x)=x^{1/3}$, $x=27$에서 선형근사. $f'(x)=\\dfrac{1}{3}x^{-2/3}$, $f'(27)=\\dfrac{1}{27}$. $\\sqrt[3]{26.7}\\approx 3+\\dfrac{1}{27}(-0.3)=3-\\dfrac{0.3}{27}=\\dfrac{269}{90}$."
  }),
  build({
    testNo: 31, num: 6, unit: "미분", concept: "뉴턴법", difficulty: "easyMedium",
    question: "함수 $f(x)=e^x+x+a$에 대하여, $f(x)=0$의 해를 뉴턴의 방법을 적용하여 구하려고 한다. 첫 번째 근삿값이 $0$일 때, 두 번째 근삿값이 $0.5$라면 $a$의 값은?",
    options: [
      o("1", "$-2$"),
      o("2", "$-1$"),
      o("3", "$0$"),
      o("4", "$1$"),
      o("5", "$2$")
    ],
    answer: "1",
    explanation: "뉴턴법: $x_2=x_1-\\dfrac{f(x_1)}{f'(x_1)}$. $x_1=0$, $f(0)=1+a$, $f'(0)=2$. $0.5=0-\\dfrac{1+a}{2}\\Rightarrow 1+a=-1\\Rightarrow a=-2$."
  })
];

console.log(`Inserting ${problems.length} daily-test problems (DT26~DT31)...`);

const { error } = await supabase.from("questions").insert(problems);
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}

console.log(`Done. ${problems.length} problems inserted.`);
const byTest = {};
for (const p of problems) {
  const m = p.id.match(/^q-daily-r(\d+)/);
  const k = m ? `DT${m[1]}` : "?";
  byTest[k] = (byTest[k] || 0) + 1;
}
console.log("By test:", byTest);
