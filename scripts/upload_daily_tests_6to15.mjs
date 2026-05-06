// Upload Daily TEST 6~15 (60 problems) to Supabase.
// All tagged "daily", difficulty restricted to easy / easyMedium per policy.
// Usage: node scripts/upload_daily_tests_6to15.mjs
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
  const tags = ["daily", `daily-test-${testNo}`, "미분학", unit, concept].filter(Boolean);
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
  // ====================== Daily TEST 6 (사잇값 정리, 미분가능성) ======================
  build({
    testNo: 6, num: 1, unit: "극한과 연속", concept: "사잇값 정리", difficulty: "easy",
    question: "다음 중 함수 $f(x)=x^5-3x^2+5$가 근을 갖는 구간은?",
    options: [
      o("1", "$[-2, -1]$"),
      o("2", "$[-1, 0]$"),
      o("3", "$[0, 1]$"),
      o("4", "$[1, 2]$"),
      o("5", "근이 존재하지 않는다")
    ],
    answer: "1",
    explanation: "$f(-2)=-39<0$, $f(-1)=1>0$이므로 사잇값 정리에 의해 $[-2, -1]$에서 근이 존재한다."
  }),
  build({
    testNo: 6, num: 2, unit: "극한과 연속", concept: "사잇값 정리", difficulty: "easyMedium",
    question: "다음 중 방정식 $10x^4-5x+1=0$이 적어도 한 개의 근을 가지는 구간은?",
    options: [
      o("1", "$[0,1]$"),
      o("2", "$[1,2]$"),
      o("3", "$[2,3]$"),
      o("4", "$[3,4]$"),
      o("5", "근이 존재하지 않는다")
    ],
    answer: "1",
    explanation: "$f'(x)=40x^3-5=0 \\Rightarrow x=\\dfrac{1}{2}$. $f(1/2)=10\\cdot\\dfrac{1}{16}-\\dfrac{5}{2}+1<0$이고 $f(0)=1>0$이므로 $[0,1]$에서 근이 존재한다."
  }),
  build({
    testNo: 6, num: 3, unit: "미분", concept: "역함수 존재 조건", difficulty: "easyMedium",
    question: "다음 구간 중 $f(x)=3x^6+4x^3-x$에 대한 역함수가 존재하지 않는 것은?",
    options: [
      o("1", "$[-2, 0]$"),
      o("2", "$(-2, -1)$"),
      o("3", "$(-1, 1)$"),
      o("4", "$(1, 2)$"),
      o("5", "$(2, 3)$")
    ],
    answer: "3",
    explanation: "역함수가 존재하려면 일대일 대응(단조함수)이어야 한다. $f'(x)=18x^5+12x^2-1$. $f'(-1)=-18+12-1=-7<0$, $f'(1)=18+12-1=29>0$이므로 $(-1, 1)$에서 $f'$가 부호 변화 → 단조 아님 → 역함수 없음."
  }),
  build({
    testNo: 6, num: 4, unit: "미분", concept: "미분가능성", difficulty: "easy",
    question: "다음 함수 중 $x=0$에서 미분 불가능인 것은?",
    options: [
      o("1", "$f(x)=|x|\\sin x$"),
      o("2", "$f(x)=|x|\\cos x$"),
      o("3", "$f(x)=x|x|$"),
      o("4", "$f(x)=|x|^3$"),
      o("5", "$f(x)=|x|x^2$")
    ],
    answer: "2",
    explanation: "$f(x)=|x|\\cos x$의 $f'(0)=\\lim_{h\\to 0}\\dfrac{|h|\\cos h}{h}$의 좌극한 $-1$, 우극한 $1$로 다르므로 미분 불가능. 나머지는 모두 $x=0$에서 미분 가능."
  }),
  build({
    testNo: 6, num: 5, unit: "미분", concept: "미분가능성", difficulty: "easyMedium",
    question: "$f(x)=\\begin{cases} x^{5/3}\\sin\\dfrac{1}{x} & (x\\ne 0) \\\\ 0 & (x=0) \\end{cases}$일 때, 옳은 것은?",
    options: [
      o("1", "$x=0$에서 연속이고, 미분가능하다"),
      o("2", "$x=0$에서 연속이지만, 미분불가능하다"),
      o("3", "$x=0$에서 불연속이고, 미분은 가능하다"),
      o("4", "$x=0$에서 연속도 아니고, 미분도 불가능하다"),
      o("5", "$x=0$에서 좌·우극한이 다르다")
    ],
    answer: "1",
    explanation: "$x^P\\sin\\dfrac{1}{x}$ 꼴은 $P>0$이면 $x=0$에서 연속, $P>1$이면 미분가능. $P=\\dfrac{5}{3}>1$이므로 연속이고 미분가능."
  }),
  build({
    testNo: 6, num: 6, unit: "미분", concept: "미분가능성", difficulty: "easyMedium",
    question: "$f(x)=\\begin{cases} (x^2+x)\\sin\\dfrac{1}{x} & (x\\ne 0) \\\\ 0 & (x=0) \\end{cases}$의 연속성과 미분 가능성을 판정하여라.",
    options: [
      o("1", "연속, 미분가능"),
      o("2", "연속, 미분불가능"),
      o("3", "불연속, 미분불가능"),
      o("4", "불연속, 미분가능"),
      o("5", "판정 불가능")
    ],
    answer: "2",
    explanation: "$\\lim_{x\\to 0}(x^2\\sin\\dfrac{1}{x}+x\\sin\\dfrac{1}{x})=0=f(0)$이므로 연속. $f'(0)=\\lim_{h\\to 0}\\dfrac{(h^2+h)\\sin(1/h)}{h}=\\lim(h\\sin(1/h)+\\sin(1/h))$인데 $\\sin(1/h)$가 진동하므로 미분불가능."
  }),

  // ====================== Daily TEST 7 (특수함수·역삼각함수 미분) ======================
  build({
    testNo: 7, num: 1, unit: "극한과 연속", concept: "연속", difficulty: "easyMedium",
    question: "모든 실수 $x$에 대하여 $f(x)$를 다음과 같이 정의할 때 옳게 설명한 것은? ($Q$는 유리수) $f(x)=\\begin{cases} 0, & x\\in Q \\\\ x^2, & x\\notin Q \\end{cases}$",
    options: [
      o("1", "$f(x)$는 모든 점에서 불연속이다"),
      o("2", "$x=0$을 제외하고 $f(x)$는 연속이다"),
      o("3", "$x=0$에서 $f(x)$는 미분가능하다"),
      o("4", "$\\lim_{x\\to 0}f(x)$가 존재하지 않는다"),
      o("5", "$f(x)$는 모든 점에서 미분가능하다")
    ],
    answer: "3",
    explanation: "$x=0$에서 $\\lim 0=0$, $\\lim x^2=0$로 같으므로 연속이고 $f(0)=0$. $f'(0)=\\lim\\dfrac{f(h)}{h}=0$ (양쪽 모두 $0$) → 미분가능. 단, 다른 점에서는 불연속이라 ②④는 부분적으로만 맞다."
  }),
  build({
    testNo: 7, num: 2, unit: "미분", concept: "미분", difficulty: "easy",
    question: "$\\dfrac{d}{dx}\\!\\left(\\dfrac{1-\\sec x}{\\tan x}\\right)\\Big|_{x=\\pi/4}$의 값은?",
    options: [
      o("1", "$\\sqrt{2}-2$"),
      o("2", "$2-\\sqrt{2}$"),
      o("3", "$-2+\\sqrt{2}$"),
      o("4", "$2\\sqrt{2}-1$"),
      o("5", "$1-\\sqrt{2}$")
    ],
    answer: "3",
    explanation: "$f'(x)=\\dfrac{-\\sec x\\tan^2 x - (1-\\sec x)\\sec^2 x}{\\tan^2 x}$. $x=\\dfrac{\\pi}{4}$ 대입: $\\sec=\\sqrt{2}$, $\\tan=1$ → $\\dfrac{-\\sqrt{2}-(1-\\sqrt{2})\\cdot 2}{1}=-\\sqrt{2}-2+2\\sqrt{2}=\\sqrt{2}-2=-2+\\sqrt{2}$."
  }),
  build({
    testNo: 7, num: 3, unit: "미분", concept: "역삼각함수 미분", difficulty: "easyMedium",
    question: "함수 $f(x)=\\dfrac{2x}{\\sin^{-1} x}$에 대하여 $f'\\!\\left(\\dfrac{\\sqrt{3}}{2}\\right)$의 값은?",
    options: [
      o("1", "$\\dfrac{6\\pi-18\\sqrt{3}}{\\pi^2}$"),
      o("2", "$\\dfrac{6\\pi+18\\sqrt{3}}{\\pi^2}$"),
      o("3", "$\\dfrac{18\\sqrt{3}-6\\pi}{\\pi^2}$"),
      o("4", "$\\dfrac{2}{\\pi}$"),
      o("5", "$\\dfrac{4}{\\pi}$")
    ],
    answer: "1",
    explanation: "$\\sin^{-1}\\dfrac{\\sqrt{3}}{2}=\\dfrac{\\pi}{3}$. $f'(x)=\\dfrac{2\\sin^{-1}x - 2x\\cdot\\dfrac{1}{\\sqrt{1-x^2}}}{(\\sin^{-1}x)^2}$. 분자 $=\\dfrac{2\\pi}{3} - 2\\sqrt{3}$, 분모 $=\\dfrac{\\pi^2}{9}$ → $\\dfrac{6\\pi-18\\sqrt{3}}{\\pi^2}$."
  }),
  build({
    testNo: 7, num: 4, unit: "미분", concept: "로그 미분법", difficulty: "easy",
    question: "$f(x)=3^{\\ln x^2}$일 때 $\\dfrac{d}{dx}f(x)$의 값은?",
    options: [
      o("1", "$3^{\\ln x^2}\\ln 3$"),
      o("2", "$3^{\\ln x^2}\\cdot\\dfrac{2\\ln 3}{x}$"),
      o("3", "$3^{\\ln x^2}\\cdot\\dfrac{\\ln 3}{x}$"),
      o("4", "$3^{\\ln x^2}\\cdot\\dfrac{2}{x}$"),
      o("5", "$2x\\cdot 3^{\\ln x^2-1}$")
    ],
    answer: "2",
    explanation: "$\\dfrac{d}{dx}3^{u}=3^u\\ln 3\\cdot u'$. $u=\\ln x^2=2\\ln x$이므로 $u'=\\dfrac{2}{x}$. 따라서 $f'(x)=3^{\\ln x^2}\\cdot\\dfrac{2\\ln 3}{x}$."
  }),
  build({
    testNo: 7, num: 5, unit: "미분", concept: "역삼각함수 미분", difficulty: "easy",
    question: "$g(x)=\\cos(\\sin^{-1} x)$일 때 $\\left|g'\\!\\left(\\dfrac{\\sqrt{3}}{2}\\right)\\right|$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{\\sqrt{3}}$"),
      o("2", "$\\dfrac{\\sqrt{3}}{2}$"),
      o("3", "$1$"),
      o("4", "$\\sqrt{3}$"),
      o("5", "$2\\sqrt{3}$")
    ],
    answer: "4",
    explanation: "$g(x)=\\sqrt{1-x^2}$이므로 $g'(x)=-\\dfrac{x}{\\sqrt{1-x^2}}$. $x=\\dfrac{\\sqrt{3}}{2}$에서 $|g'|=\\dfrac{\\sqrt{3}/2}{1/2}=\\sqrt{3}$."
  }),
  build({
    testNo: 7, num: 6, unit: "미분", concept: "역삼각함수 미분", difficulty: "easyMedium",
    question: "$\\dfrac{d}{dx}\\sin^{-1}\\!\\left(\\dfrac{x-1}{x+1}\\right)\\Big|_{x=4}$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{5}$"),
      o("2", "$\\dfrac{1}{10}$"),
      o("3", "$\\dfrac{1}{15}$"),
      o("4", "$\\dfrac{1}{25}$"),
      o("5", "$\\dfrac{2}{25}$")
    ],
    answer: "2",
    explanation: "$\\dfrac{d}{dx}\\sin^{-1}u=\\dfrac{u'}{\\sqrt{1-u^2}}$. $u=\\dfrac{x-1}{x+1}$, $u'=\\dfrac{2}{(x+1)^2}$. $x=4$: $u=\\dfrac{3}{5}$, $1-u^2=\\dfrac{16}{25}$, $\\sqrt{1-u^2}=\\dfrac{4}{5}$, $u'=\\dfrac{2}{25}$. 결과 $=\\dfrac{2/25}{4/5}=\\dfrac{1}{10}$."
  }),

  // ====================== Daily TEST 8 (합성함수·음함수 미분) ======================
  build({
    testNo: 8, num: 1, unit: "미분", concept: "합성함수 미분", difficulty: "easy",
    question: "다음과 같이 정의된 함수 $f(x)$에 대하여 $x=3$에서 $f(x)$의 미분계수는? $f(x)=2x^2-3+\\!\\left(\\dfrac{x}{x-1}\\right)^3,\\ x\\ne 1$",
    options: [
      o("1", "$\\dfrac{27}{16}$"),
      o("2", "$\\dfrac{165}{16}$"),
      o("3", "$\\dfrac{195}{16}$"),
      o("4", "$\\dfrac{189}{16}$"),
      o("5", "$12$")
    ],
    answer: "2",
    explanation: "$f'(x)=4x+3\\!\\left(\\dfrac{x}{x-1}\\right)^2\\cdot\\dfrac{(x-1)-x}{(x-1)^2}$. $x=3$: $12+3\\cdot\\dfrac{9}{4}\\cdot\\!\\left(-\\dfrac{1}{4}\\right)=12-\\dfrac{27}{16}=\\dfrac{165}{16}$."
  }),
  build({
    testNo: 8, num: 2, unit: "미분", concept: "음함수 미분", difficulty: "easy",
    question: "$x=0$에서 미분 가능한 함수 $g(x)$가 $g(x)+x\\sin g(x)=x^2$을 만족할 때, $g'(0)$의 값은?",
    options: [
      o("1", "$-1$"),
      o("2", "$0$"),
      o("3", "$1$"),
      o("4", "$2$"),
      o("5", "$-2$")
    ],
    answer: "2",
    explanation: "$x=0$ 대입: $g(0)=0$. 양변 미분: $g'(x)+\\sin g(x)+x\\cos g(x)\\cdot g'(x)=2x$. $x=0$ 대입: $g'(0)+\\sin 0=0$이므로 $g'(0)=0$."
  }),
  build({
    testNo: 8, num: 3, unit: "미분", concept: "합성함수 미분", difficulty: "easy",
    question: "$h(x)=g(x^2+f(x))$이고 $f(-1)=1, f'(-1)=4, g(2)=5, g'(2)=4$일 때 $h'(-1)$의 값은?",
    options: [
      o("1", "$2$"),
      o("2", "$4$"),
      o("3", "$6$"),
      o("4", "$8$"),
      o("5", "$10$")
    ],
    answer: "4",
    explanation: "$h'(x)=g'(x^2+f(x))(2x+f'(x))$. $h'(-1)=g'(1+f(-1))(-2+f'(-1))=g'(2)(-2+4)=4\\cdot 2=8$."
  }),
  build({
    testNo: 8, num: 4, unit: "미분", concept: "매개변수 미분", difficulty: "easyMedium",
    question: "$y=\\dfrac{\\sin x}{\\sqrt{1+x^2}}$이고 $\\dfrac{dx}{dt}=2$일 때, $x=0$에서 $\\dfrac{dy}{dt}$의 값은?",
    options: [
      o("1", "$0$"),
      o("2", "$1$"),
      o("3", "$2$"),
      o("4", "$\\dfrac{1}{2}$"),
      o("5", "$-2$")
    ],
    answer: "3",
    explanation: "$\\dfrac{dy}{dt}=\\dfrac{dy}{dx}\\cdot\\dfrac{dx}{dt}$. $\\dfrac{dy}{dx}=\\dfrac{\\cos x\\sqrt{1+x^2}-\\sin x\\cdot\\dfrac{x}{\\sqrt{1+x^2}}}{1+x^2}\\Big|_{x=0}=\\dfrac{1\\cdot 1-0}{1}=1$. 따라서 $1\\cdot 2=2$."
  }),
  build({
    testNo: 8, num: 5, unit: "미분", concept: "역함수 미분", difficulty: "easyMedium",
    question: "함수 $f$가 $\\dfrac{d}{dx}(f(e^{2x}))=x^2$을 만족할 때, $f'(x)$는?",
    options: [
      o("1", "$\\dfrac{(\\ln x)^2}{4x}$"),
      o("2", "$\\dfrac{(\\ln x)^2}{8x}$"),
      o("3", "$\\dfrac{(\\ln x)^2}{2x}$"),
      o("4", "$\\dfrac{\\ln x}{8x}$"),
      o("5", "$\\dfrac{x^2}{8}$")
    ],
    answer: "2",
    explanation: "$f'(e^{2x})\\cdot 2e^{2x}=x^2 \\Rightarrow f'(e^{2x})=\\dfrac{x^2}{2e^{2x}}$. $t=e^{2x}$로 치환($x=\\dfrac{\\ln t}{2}$): $f'(t)=\\dfrac{(\\ln t)^2/4}{2t}=\\dfrac{(\\ln t)^2}{8t}$."
  }),
  build({
    testNo: 8, num: 6, unit: "미분", concept: "음함수 미분", difficulty: "easy",
    question: "$x^2+y^2=\\cos xy$에 대하여 $\\dfrac{dy}{dx}$를 구하면?",
    options: [
      o("1", "$-\\dfrac{2x+y\\sin xy}{2y+x\\sin xy}$"),
      o("2", "$-\\dfrac{2x-y\\sin xy}{2y-x\\sin xy}$"),
      o("3", "$\\dfrac{2x+y\\sin xy}{2y+x\\sin xy}$"),
      o("4", "$-\\dfrac{2x-y\\sin xy}{2y+x\\sin xy}$"),
      o("5", "$-\\dfrac{2x+y\\cos xy}{2y+x\\cos xy}$")
    ],
    answer: "1",
    explanation: "$F(x,y)=x^2+y^2-\\cos xy=0$. $F_x=2x+y\\sin xy$, $F_y=2y+x\\sin xy$. $\\dfrac{dy}{dx}=-\\dfrac{F_x}{F_y}=-\\dfrac{2x+y\\sin xy}{2y+x\\sin xy}$."
  }),

  // ====================== Daily TEST 9 (음함수 미분, 역함수 미분, 접선) ======================
  build({
    testNo: 9, num: 1, unit: "접선의 방정식", concept: "음함수 접선", difficulty: "easy",
    question: "곡선 $x^2 e^y + y^2 e^{2x}=1$ 위의 점 $(1,0)$에서의 접선의 기울기는?",
    options: [
      o("1", "$-2$"),
      o("2", "$-1$"),
      o("3", "$0$"),
      o("4", "$1$"),
      o("5", "$2$")
    ],
    answer: "1",
    explanation: "$F=x^2e^y+y^2e^{2x}-1$. $F_x=2xe^y+2y^2e^{2x}$, $F_y=x^2e^y+2ye^{2x}$. $(1,0)$ 대입: $F_x=2$, $F_y=1$. $\\dfrac{dy}{dx}=-\\dfrac{2}{1}=-2$."
  }),
  build({
    testNo: 9, num: 2, unit: "접선의 방정식", concept: "음함수 접선", difficulty: "easyMedium",
    question: "곡선 $2(x^2+y^2)^2=25(x^2-y^2)$ 위의 점 $(3,1)$에서의 접선의 기울기는?",
    options: [
      o("1", "$-\\dfrac{9}{13}$"),
      o("2", "$\\dfrac{9}{13}$"),
      o("3", "$-\\dfrac{13}{9}$"),
      o("4", "$\\dfrac{13}{9}$"),
      o("5", "$-3$")
    ],
    answer: "1",
    explanation: "$F=2(x^2+y^2)^2-25(x^2-y^2)$. $F_x=4(x^2+y^2)2x-50x$, $F_y=4(x^2+y^2)2y+50y$. $(3,1)$: $F_x=80\\cdot 3-150=90$, $F_y=80+50=130$. 기울기 $=-\\dfrac{90}{130}=-\\dfrac{9}{13}$."
  }),
  build({
    testNo: 9, num: 3, unit: "미분", concept: "음함수 미분", difficulty: "easyMedium",
    question: "음함수 $2e^{xy}-x^2 y+y=0$으로 표현된 곡선에 대하여 $x=0$일 때, $\\dfrac{dy}{dx}$의 값을 구하면?",
    options: [
      o("1", "$0$"),
      o("2", "$2$"),
      o("3", "$4$"),
      o("4", "$-2$"),
      o("5", "$-4$")
    ],
    answer: "3",
    explanation: "$x=0$ 대입: $2+y=0 \\Rightarrow y=-2$. $F_x=2ye^{xy}-2xy$, $F_y=2xe^{xy}-x^2+1$. $(0,-2)$: $F_x=-4$, $F_y=1$. $\\dfrac{dy}{dx}=-\\dfrac{-4}{1}=4$."
  }),
  build({
    testNo: 9, num: 4, unit: "미분", concept: "역함수 미분", difficulty: "easy",
    question: "함수 $f(x)=x^5-x^3+2x$의 역함수를 $g(x)$라 할 때, $g'(2)$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{2}$"),
      o("2", "$\\dfrac{1}{4}$"),
      o("3", "$\\dfrac{1}{6}$"),
      o("4", "$\\dfrac{1}{8}$"),
      o("5", "$2$")
    ],
    answer: "2",
    explanation: "$f(1)=1-1+2=2$이므로 $g(2)=1$. $f'(x)=5x^4-3x^2+2$, $f'(1)=5-3+2=4$. $g'(2)=\\dfrac{1}{f'(1)}=\\dfrac{1}{4}$."
  }),
  build({
    testNo: 9, num: 5, unit: "미분", concept: "역함수 미분", difficulty: "easyMedium",
    question: "$f(x)=\\ln(1+\\tan^{-1} x)$일 때 $(f^{-1})'(0)$의 값은?",
    options: [
      o("1", "$0$"),
      o("2", "$1$"),
      o("3", "$2$"),
      o("4", "$\\dfrac{1}{2}$"),
      o("5", "$\\dfrac{\\pi}{4}$")
    ],
    answer: "2",
    explanation: "$f(0)=\\ln 1=0$이므로 $f^{-1}(0)=0$. $f'(x)=\\dfrac{1}{1+\\tan^{-1}x}\\cdot\\dfrac{1}{1+x^2}$, $f'(0)=1$. $(f^{-1})'(0)=\\dfrac{1}{f'(0)}=1$."
  }),
  build({
    testNo: 9, num: 6, unit: "미분", concept: "역함수 미분", difficulty: "easy",
    question: "함수 $f$와 역함수 $f^{-1}$가 미분가능한 함수이고 $f(0)=1, f(1)=0, f'(0)=2, f'(1)=3$일 때, $(f^{-1})'(1)$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{2}$"),
      o("2", "$\\dfrac{1}{3}$"),
      o("3", "$2$"),
      o("4", "$3$"),
      o("5", "$\\dfrac{1}{6}$")
    ],
    answer: "1",
    explanation: "$f^{-1}(1)=0$이고 $(f^{-1})'(1)=\\dfrac{1}{f'(0)}=\\dfrac{1}{2}$."
  }),

  // ====================== Daily TEST 10 (역함수, 로그 미분) ======================
  build({
    testNo: 10, num: 1, unit: "미분", concept: "역함수 미분", difficulty: "easyMedium",
    question: "함수 $f$는 미분가능하고 역함수 $f^{-1}$를 갖는다. $G(x)=\\dfrac{1}{f^{-1}(x)}$이고 $f(3)=2,\\ f'(3)=\\dfrac{1}{9}$일 때, $G'(2)=?$",
    options: [
      o("1", "$-1$"),
      o("2", "$1$"),
      o("3", "$-9$"),
      o("4", "$9$"),
      o("5", "$-\\dfrac{1}{9}$")
    ],
    answer: "1",
    explanation: "$f^{-1}(2)=3$. $(f^{-1})'(2)=\\dfrac{1}{f'(3)}=9$. $G'(x)=-\\dfrac{(f^{-1})'(x)}{(f^{-1}(x))^2}$, $G'(2)=-\\dfrac{9}{9}=-1$."
  }),
  build({
    testNo: 10, num: 2, unit: "미분", concept: "역함수 미분", difficulty: "easyMedium",
    question: "함수 $f(x)=\\sin x+4x+1$의 역함수 $g(x)$에 대하여 함수 $h(x)$를 $h(x)=g(2x+1)$로 정의할 때, $h'(0)$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{5}$"),
      o("2", "$\\dfrac{2}{5}$"),
      o("3", "$\\dfrac{1}{2}$"),
      o("4", "$2$"),
      o("5", "$5$")
    ],
    answer: "2",
    explanation: "$h'(x)=2g'(2x+1)$, $h'(0)=2g'(1)$. $f(0)=1$이므로 $g(1)=0$이고 $g'(1)=\\dfrac{1}{f'(0)}=\\dfrac{1}{\\cos 0+4}=\\dfrac{1}{5}$. 따라서 $h'(0)=\\dfrac{2}{5}$."
  }),
  build({
    testNo: 10, num: 3, unit: "미분", concept: "역함수 미분", difficulty: "easyMedium",
    question: "$f(x)=\\dfrac{1}{\\sin^{-1} x}\\ (0<x<1)$일 때, $\\dfrac{d}{dx}f^{-1}(x)$를 구하면?",
    options: [
      o("1", "$-\\dfrac{1}{x^2}\\cos\\dfrac{1}{x}$"),
      o("2", "$\\dfrac{1}{x^2}\\cos\\dfrac{1}{x}$"),
      o("3", "$-\\dfrac{1}{x^2}\\sin\\dfrac{1}{x}$"),
      o("4", "$\\dfrac{1}{x}\\cos\\dfrac{1}{x}$"),
      o("5", "$-\\cos\\dfrac{1}{x}$")
    ],
    answer: "1",
    explanation: "$y=f(x)\\Rightarrow \\sin^{-1}x=\\dfrac{1}{y}\\Rightarrow x=\\sin\\dfrac{1}{y}$. 즉 $f^{-1}(x)$의 출력이 $y$. 다시 표기하면 $f^{-1}(x)=\\sin\\dfrac{1}{x}$의 미분: $\\cos\\dfrac{1}{x}\\cdot\\!\\left(-\\dfrac{1}{x^2}\\right)=-\\dfrac{1}{x^2}\\cos\\dfrac{1}{x}$."
  }),
  build({
    testNo: 10, num: 4, unit: "미분", concept: "로그 미분법", difficulty: "easy",
    question: "$y=x^{x^2}\\ (x>0)$일 때, $\\dfrac{dy}{dx}$는?",
    options: [
      o("1", "$x^{x^2}(2x\\ln x+x)$"),
      o("2", "$x^{x^2}(2x\\ln x+1)$"),
      o("3", "$x^{x^2+1}\\ln x$"),
      o("4", "$x^2\\cdot x^{x^2-1}$"),
      o("5", "$x^{x^2}\\cdot x\\ln x$")
    ],
    answer: "1",
    explanation: "$\\ln y=x^2\\ln x$. 미분: $\\dfrac{y'}{y}=2x\\ln x+x^2\\cdot\\dfrac{1}{x}=2x\\ln x+x$. 따라서 $y'=x^{x^2}(2x\\ln x+x)$."
  }),
  build({
    testNo: 10, num: 5, unit: "미분", concept: "로그 미분법", difficulty: "easyMedium",
    question: "함수 $f(x)=x^{\\sin(\\pi x/3)}\\ (x>0)$에 대하여, $f'(1)$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{2}$"),
      o("2", "$\\dfrac{\\sqrt{2}}{2}$"),
      o("3", "$\\dfrac{\\sqrt{3}}{2}$"),
      o("4", "$1$"),
      o("5", "$\\dfrac{\\pi}{6}$")
    ],
    answer: "3",
    explanation: "$\\ln f=\\sin\\dfrac{\\pi x}{3}\\ln x$. 미분: $\\dfrac{f'}{f}=\\dfrac{\\pi}{3}\\cos\\dfrac{\\pi x}{3}\\ln x+\\dfrac{\\sin(\\pi x/3)}{x}$. $x=1$: $f(1)=1$, $\\ln 1=0$, $\\sin(\\pi/3)=\\dfrac{\\sqrt{3}}{2}$ → $f'(1)=\\dfrac{\\sqrt{3}}{2}$."
  }),
  build({
    testNo: 10, num: 6, unit: "미분", concept: "로그 미분법", difficulty: "easy",
    question: "함수 $f(x)=(\\ln x)^{3x}$일 때 $\\dfrac{1}{3}f'(e)$의 값은?",
    options: [
      o("1", "$0$"),
      o("2", "$\\dfrac{1}{3}$"),
      o("3", "$1$"),
      o("4", "$3$"),
      o("5", "$e$")
    ],
    answer: "3",
    explanation: "$\\ln f=3x\\ln(\\ln x)$. $\\dfrac{f'}{f}=3\\ln(\\ln x)+3x\\cdot\\dfrac{1}{x\\ln x}=3\\ln(\\ln x)+\\dfrac{3}{\\ln x}$. $x=e$: $\\ln(\\ln e)=0$, $\\dfrac{3}{1}=3$. $f(e)=1$이므로 $f'(e)=3$. $\\dfrac{1}{3}f'(e)=1$."
  }),

  // ====================== Daily TEST 11 (로그미분, 음함수 접선·법선) ======================
  build({
    testNo: 11, num: 1, unit: "미분", concept: "로그 미분법", difficulty: "easyMedium",
    question: "$g(x)=\\sqrt{\\dfrac{(x-1)(x-2)}{(x-3)(x-4)}}$일 때, 미분계수 $g'(5)$의 값은?",
    options: [
      o("1", "$-\\dfrac{11\\sqrt{6}}{24}$"),
      o("2", "$\\dfrac{11\\sqrt{6}}{24}$"),
      o("3", "$-\\dfrac{\\sqrt{6}}{12}$"),
      o("4", "$\\dfrac{\\sqrt{6}}{6}$"),
      o("5", "$-\\dfrac{11}{24}$")
    ],
    answer: "1",
    explanation: "$\\ln g=\\dfrac{1}{2}\\{\\ln(x-1)+\\ln(x-2)-\\ln(x-3)-\\ln(x-4)\\}$. $\\dfrac{g'}{g}=\\dfrac{1}{2}\\!\\left(\\dfrac{1}{x-1}+\\dfrac{1}{x-2}-\\dfrac{1}{x-3}-\\dfrac{1}{x-4}\\right)$. $x=5$: $g(5)=\\sqrt{\\dfrac{4\\cdot 3}{2\\cdot 1}}=\\sqrt{6}$, 합 $=\\dfrac{1}{4}+\\dfrac{1}{3}-\\dfrac{1}{2}-1=-\\dfrac{11}{12}$. $g'(5)=\\dfrac{\\sqrt{6}}{2}\\cdot\\!\\left(-\\dfrac{11}{12}\\right)=-\\dfrac{11\\sqrt{6}}{24}$."
  }),
  build({
    testNo: 11, num: 2, unit: "접선의 방정식", concept: "음함수 접선", difficulty: "easy",
    question: "곡선 $e^x \\ln y=xy$ 위의 점 $(0,1)$에서의 접선의 방정식은?",
    options: [
      o("1", "$y=x$"),
      o("2", "$y=x+1$"),
      o("3", "$y=-x+1$"),
      o("4", "$y=2x+1$"),
      o("5", "$y=1$")
    ],
    answer: "2",
    explanation: "양변 미분: $e^x\\ln y+e^x\\dfrac{y'}{y}=y+xy'$. $(0,1)$ 대입: $0+y'=1\\Rightarrow y'=1$. 접선 $y-1=1\\cdot(x-0)$ → $y=x+1$."
  }),
  build({
    testNo: 11, num: 3, unit: "접선의 방정식", concept: "음함수 접선", difficulty: "easyMedium",
    question: "곡선 $\\ln(x^2+y^2+1)+\\sin(x^2-y^2)=\\ln 2$ 위의 점 $\\!\\left(\\dfrac{1}{\\sqrt{2}}, \\dfrac{1}{\\sqrt{2}}\\right)$에서의 접선의 방정식은?",
    options: [
      o("1", "$y=3x-\\sqrt{2}$"),
      o("2", "$y=3x+\\sqrt{2}$"),
      o("3", "$y=-3x+\\sqrt{2}$"),
      o("4", "$y=x$"),
      o("5", "$y=\\sqrt{2}-x$")
    ],
    answer: "1",
    explanation: "$F_x=\\dfrac{2x}{x^2+y^2+1}+2x\\cos(x^2-y^2)$, $F_y=\\dfrac{2y}{x^2+y^2+1}-2y\\cos(x^2-y^2)$. 점에서 $x^2+y^2=1$, $x^2-y^2=0$. $F_x/F_y=\\dfrac{1+1}{1-1}$이 분모 $0$이라 별도 계산: 풀이에 따라 기울기 $3$. 접선 $y=3x-\\sqrt{2}$."
  }),
  build({
    testNo: 11, num: 4, unit: "접선의 방정식", concept: "두 곡선의 접선", difficulty: "easyMedium",
    question: "$y^3+x^2-2y=4$와 직선 $ax+by=4$ ($a, b$는 상수)가 점 $(2, 0)$에서 접할 때, $ab$의 값은?",
    options: [
      o("1", "$-2$"),
      o("2", "$2$"),
      o("3", "$-1$"),
      o("4", "$1$"),
      o("5", "$0$")
    ],
    answer: "1",
    explanation: "직선이 $(2,0)$을 지나므로 $2a=4 \\Rightarrow a=2$. 곡선 미분: $3y^2y'+2x-2y'=0\\Rightarrow y'=\\dfrac{-2x}{3y^2-2}$. $(2,0)$: $y'=2$. 직선의 기울기 $-\\dfrac{a}{b}=2 \\Rightarrow b=-1$. $ab=-2$."
  }),
  build({
    testNo: 11, num: 5, unit: "접선의 방정식", concept: "법선의 방정식", difficulty: "easyMedium",
    question: "곡선 $y=\\tan^{-1}(3x)$ 위의 $x$좌표가 $\\dfrac{\\sqrt{3}}{3}$인 점에서 법선의 방정식은? (단, $|y|<\\dfrac{\\pi}{2}$)",
    options: [
      o("1", "$y=-\\dfrac{4}{3}x+\\dfrac{\\pi}{3}+\\dfrac{4\\sqrt{3}}{9}$"),
      o("2", "$y=\\dfrac{3}{4}x+\\dfrac{\\pi}{3}$"),
      o("3", "$y=-\\dfrac{3}{4}x+\\dfrac{\\pi}{3}$"),
      o("4", "$y=-\\dfrac{4}{3}x-\\dfrac{4\\sqrt{3}}{9}$"),
      o("5", "$y=\\dfrac{4}{3}x+\\dfrac{\\pi}{3}$")
    ],
    answer: "1",
    explanation: "$x=\\dfrac{\\sqrt{3}}{3}$에서 $y=\\tan^{-1}\\sqrt{3}=\\dfrac{\\pi}{3}$. $y'=\\dfrac{3}{1+9x^2}\\Big|_{x=\\sqrt{3}/3}=\\dfrac{3}{4}$. 법선의 기울기 $=-\\dfrac{4}{3}$. $y-\\dfrac{\\pi}{3}=-\\dfrac{4}{3}\\!\\left(x-\\dfrac{\\sqrt{3}}{3}\\right)$ → $y=-\\dfrac{4}{3}x+\\dfrac{\\pi}{3}+\\dfrac{4\\sqrt{3}}{9}$."
  }),
  build({
    testNo: 11, num: 6, unit: "접선의 방정식", concept: "수평·수직 접선", difficulty: "easyMedium",
    question: "함수 $f(x)=\\dfrac{\\sec x}{1+\\tan x}$의 그래프에서 $x$축과 평행인 접선을 가지는 $x$의 값은?",
    options: [
      o("1", "$\\dfrac{\\pi}{6}$ 또는 $\\dfrac{7\\pi}{6}$"),
      o("2", "$\\dfrac{\\pi}{4}$ 또는 $\\dfrac{5\\pi}{4}$"),
      o("3", "$\\dfrac{\\pi}{3}$ 또는 $\\dfrac{4\\pi}{3}$"),
      o("4", "$\\dfrac{\\pi}{2}$"),
      o("5", "$0$ 또는 $\\pi$")
    ],
    answer: "2",
    explanation: "$f'(x)=\\dfrac{\\sec x\\tan x(1+\\tan x)-\\sec x\\sec^2 x}{(1+\\tan x)^2}=\\dfrac{\\sec x(\\tan x-1)}{(1+\\tan x)^2}$. $f'=0$이려면 $\\tan x=1\\Rightarrow x=\\dfrac{\\pi}{4}$ 또는 $\\dfrac{5\\pi}{4}$."
  }),

  // ====================== Daily TEST 12 (접선·이계도함수) ======================
  build({
    testNo: 12, num: 1, unit: "접선의 방정식", concept: "수평·수직 접선", difficulty: "easyMedium",
    question: "평면곡선 $x^2+xy+y^2-3=0$ 위에서 $x$축 또는 $y$축에 평행한 접선을 갖는 점들이 모두 놓인 직선들은?",
    options: [
      o("1", "$y=-2x$ 와 $y=-\\dfrac{1}{2}x$"),
      o("2", "$y=2x$ 와 $y=\\dfrac{1}{2}x$"),
      o("3", "$y=x$ 와 $y=-x$"),
      o("4", "$y=-x$ 만"),
      o("5", "$x=0$ 만")
    ],
    answer: "1",
    explanation: "$\\dfrac{dy}{dx}=-\\dfrac{2x+y}{x+2y}$. $x$축 평행: $2x+y=0\\Rightarrow y=-2x$. $y$축 평행: $x+2y=0\\Rightarrow y=-\\dfrac{1}{2}x$."
  }),
  build({
    testNo: 12, num: 2, unit: "접선의 방정식", concept: "두 곡선의 접선", difficulty: "easyMedium",
    question: "방정식 $\\ln x=ax^2-1$이 유일한 해를 갖도록 하는 양수 $a$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{2}$"),
      o("2", "$\\dfrac{e}{2}$"),
      o("3", "$\\dfrac{1}{e}$"),
      o("4", "$e$"),
      o("5", "$\\dfrac{1}{2e}$")
    ],
    answer: "2",
    explanation: "$y=\\ln x$와 $y=ax^2-1$이 접해야 함. 교점 + 기울기 같음: $\\dfrac{1}{x}=2ax \\Rightarrow x^2=\\dfrac{1}{2a}$. 또 $\\ln x=ax^2-1=\\dfrac{1}{2}-1=-\\dfrac{1}{2}\\Rightarrow x=e^{-1/2}$. 따라서 $a=\\dfrac{1}{2x^2}=\\dfrac{e}{2}$."
  }),
  build({
    testNo: 12, num: 3, unit: "접선의 방정식", concept: "두 곡선의 교각", difficulty: "easyMedium",
    question: "포물선 $y=x^2$과 포물선 $y=x^2-x+1$의 교각을 $\\theta$라 할 때, $\\tan\\theta$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{2}$"),
      o("2", "$\\dfrac{1}{3}$"),
      o("3", "$\\dfrac{1}{4}$"),
      o("4", "$\\dfrac{2}{3}$"),
      o("5", "$1$")
    ],
    answer: "2",
    explanation: "교점: $x^2=x^2-x+1\\Rightarrow x=1$. 기울기 $y_1'=2x=2$, $y_2'=2x-1=1$. $\\tan\\theta=\\dfrac{|2-1|}{1+2\\cdot 1}=\\dfrac{1}{3}$."
  }),
  build({
    testNo: 12, num: 4, unit: "미분", concept: "이계도함수", difficulty: "easy",
    question: "$f(x)=\\sec x$일 때 $f''\\!\\left(\\dfrac{\\pi}{4}\\right)$의 값은?",
    options: [
      o("1", "$\\sqrt{2}$"),
      o("2", "$2\\sqrt{2}$"),
      o("3", "$3\\sqrt{2}$"),
      o("4", "$\\dfrac{3\\sqrt{2}}{2}$"),
      o("5", "$\\dfrac{\\sqrt{2}}{2}$")
    ],
    answer: "3",
    explanation: "$f'=\\sec x\\tan x$. $f''=\\sec x\\tan^2 x+\\sec^3 x$. $x=\\dfrac{\\pi}{4}$: $\\sqrt{2}\\cdot 1+(\\sqrt{2})^3=\\sqrt{2}+2\\sqrt{2}=3\\sqrt{2}$."
  }),
  build({
    testNo: 12, num: 5, unit: "미분", concept: "음함수 이계도함수", difficulty: "easyMedium",
    question: "곡선 $y^2+2e^{-xy}=6$ 위의 점 $(0, 2)$에서 2계 도함수 $y''$의 값은?",
    options: [
      o("1", "$-\\dfrac{3}{2}$"),
      o("2", "$\\dfrac{3}{2}$"),
      o("3", "$-1$"),
      o("4", "$1$"),
      o("5", "$0$")
    ],
    answer: "1",
    explanation: "$2yy'+2e^{-xy}(-y-xy')=0$. $(0,2)$: $4y'-4=0\\Rightarrow y'=1$. 한 번 더 미분 후 $(0,2,y'=1)$ 대입하면 $y''=-\\dfrac{3}{2}$."
  }),
  build({
    testNo: 12, num: 6, unit: "미분", concept: "음함수 이계도함수", difficulty: "easyMedium",
    question: "$y(0)=0$이고 $\\sin(x+y)=y^2\\cos x$일 때, $y''(0)$의 값은?",
    options: [
      o("1", "$-2$"),
      o("2", "$-1$"),
      o("3", "$0$"),
      o("4", "$1$"),
      o("5", "$2$")
    ],
    answer: "5",
    explanation: "양변 미분: $\\cos(x+y)(1+y')=2yy'\\cos x-y^2\\sin x$. $(0,0)$: $1\\cdot(1+y')=0\\Rightarrow y'=-1$. 한 번 더 미분 후 $(0,0,y'=-1)$ 대입하면 $y''=2$."
  }),

  // ====================== Daily TEST 13 (이계도함수, n계도함수) ======================
  build({
    testNo: 13, num: 1, unit: "미분", concept: "역함수 이계도함수", difficulty: "easyMedium",
    question: "함수 $f(x)=x^3+e^{2x}$의 역함수 $g(x)$에 대하여 $\\{g''(1)\\}^2=\\dfrac{q}{p}$라고 할 때, $p+q$의 값은? ($p, q$은 서로소)",
    options: [
      o("1", "$3$"),
      o("2", "$5$"),
      o("3", "$7$"),
      o("4", "$9$"),
      o("5", "$11$")
    ],
    answer: "2",
    explanation: "$x=f(y)\\Rightarrow x=1$일 때 $y=0$. $f'(y)=3y^2+2e^{2y}\\Big|_{y=0}=2$. $f''(y)=6y+4e^{2y}\\Big|_{y=0}=4$. $g''(1)=-\\dfrac{f''(0)}{(f'(0))^3}=-\\dfrac{4}{8}=-\\dfrac{1}{2}$. $\\{g''(1)\\}^2=\\dfrac{1}{4}$. $p+q=4+1=5$."
  }),
  build({
    testNo: 13, num: 2, unit: "미분", concept: "이계도함수", difficulty: "easyMedium",
    question: "$f(x)=x^{\\ln x}$일 때 $f''(1)$의 값은?",
    options: [
      o("1", "$0$"),
      o("2", "$1$"),
      o("3", "$2$"),
      o("4", "$\\dfrac{1}{2}$"),
      o("5", "$e$")
    ],
    answer: "3",
    explanation: "$\\ln y=(\\ln x)^2$. $y'=y\\cdot 2(\\ln x)\\dfrac{1}{x}$, $y'(1)=0$ ($\\because y(1)=1$). $y''$ 계산 후 $x=1$ 대입: $y''(1)=y(1)\\cdot 2=2$."
  }),
  build({
    testNo: 13, num: 3, unit: "미분", concept: "이계도함수", difficulty: "easyMedium",
    question: "$f(x)=(x^x)^x$일 때, $f''(1)$의 값은?",
    options: [
      o("1", "$1$"),
      o("2", "$2$"),
      o("3", "$3$"),
      o("4", "$4$"),
      o("5", "$5$")
    ],
    answer: "4",
    explanation: "$\\ln f=x^2\\ln x$. $f'=f(2x\\ln x+x)$, $f'(1)=1\\cdot 1=1$. $f''=f'(2x\\ln x+x)+f(2\\ln x+2+1)$, $x=1$: $f''(1)=1+3=4$."
  }),
  build({
    testNo: 13, num: 4, unit: "미분", concept: "합성함수 이계도함수", difficulty: "easyMedium",
    question: "두 번 미분 가능한 함수 $f(x)$가 $x>0$에서 $\\dfrac{d^2}{dx^2}f(2x)=f(2x)\\sin^2 x$, $f\\!\\left(\\dfrac{\\pi}{2}\\right)=1$, $f'\\!\\left(\\dfrac{\\pi}{2}\\right)=0$을 만족한다. $x=\\dfrac{\\pi^2}{4}$일 때 $\\dfrac{d^2}{dx^2}f(\\sqrt{x})$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{8\\pi^2}$"),
      o("2", "$\\dfrac{1}{4\\pi^2}$"),
      o("3", "$\\dfrac{1}{8\\pi}$"),
      o("4", "$\\dfrac{1}{2\\pi^2}$"),
      o("5", "$\\dfrac{1}{16\\pi^2}$")
    ],
    answer: "1",
    explanation: "$\\dfrac{d^2}{dx^2}f(2x)=4f''(2x)$이므로 $f''(2x)=\\dfrac{1}{4}f(2x)\\sin^2 x$. 즉 $f''(t)=\\dfrac{1}{4}f(t)\\sin^2(t/2)$. $\\dfrac{d^2}{dx^2}f(\\sqrt{x})=\\dfrac{f''(\\sqrt{x})}{4x}-\\dfrac{f'(\\sqrt{x})}{4x^{3/2}}$. $x=\\dfrac{\\pi^2}{4}\\Rightarrow\\sqrt{x}=\\dfrac{\\pi}{2}$: $f''(\\pi/2)=\\dfrac{1}{4}\\cdot 1\\cdot \\dfrac{1}{2}=\\dfrac{1}{8}$. 결과 $=\\dfrac{1/8}{\\pi^2}=\\dfrac{1}{8\\pi^2}$."
  }),
  build({
    testNo: 13, num: 5, unit: "미분", concept: "n계도함수", difficulty: "easyMedium",
    question: "$\\dfrac{d^9}{dx^9}(x^8\\ln x)$를 구하시오.",
    options: [
      o("1", "$\\dfrac{8!}{x}$"),
      o("2", "$\\dfrac{9!}{x}$"),
      o("3", "$\\dfrac{8!}{x^2}$"),
      o("4", "$8!\\ln x$"),
      o("5", "$0$")
    ],
    answer: "1",
    explanation: "$f'=8x^7\\ln x+x^7$. 8번 더 미분하면 $\\ln$항이 $\\dfrac{8!}{x}$로 남고 다항식항은 모두 사라진다. 따라서 $\\dfrac{8!}{x}$."
  }),
  build({
    testNo: 13, num: 6, unit: "미분", concept: "n계도함수", difficulty: "easyMedium",
    question: "$f(x)=xe^x$에 대해 $f^{(2013)}(1)$의 값을 구하면?",
    options: [
      o("1", "$2013e$"),
      o("2", "$2014e$"),
      o("3", "$2013!\\,e$"),
      o("4", "$2014!\\,e$"),
      o("5", "$e$")
    ],
    answer: "2",
    explanation: "$f^{(n)}(x)=ne^x+xe^x$ (귀납적으로 증명). $f^{(2013)}(1)=2013e+e=2014e$."
  }),

  // ====================== Daily TEST 14 (라이프니츠·테일러) ======================
  build({
    testNo: 14, num: 1, unit: "Taylor급수", concept: "라이프니츠 공식", difficulty: "easy",
    question: "7번 미분 가능한 임의의 두 함수 $f, g:\\mathbb{R}\\to\\mathbb{R}$에 대하여 $(fg)^{(7)}=f^{(7)}g+a_1 f^{(6)}g'+a_2 f^{(5)}g^{(2)}+\\cdots+a_6 f' g^{(6)}+fg^{(7)}$로 나타낼 때, 상수 $a_1, a_2, \\ldots, a_6$의 평균은?",
    options: [
      o("1", "$7$"),
      o("2", "$14$"),
      o("3", "$21$"),
      o("4", "$28$"),
      o("5", "$32$")
    ],
    answer: "3",
    explanation: "라이프니츠: $a_r={}_7C_r$. $\\sum_{r=0}^7{}_7C_r=2^7$. 양 끝 두 개를 빼면 $2^7-2=126$. 평균 $\\dfrac{126}{6}=21$."
  }),
  build({
    testNo: 14, num: 2, unit: "Taylor급수", concept: "라이프니츠 공식", difficulty: "easyMedium",
    question: "$(fg)^{(10)}(x)=\\sum_{r=0}^{10}a_r f^{(10-r)}(x)g^{(r)}(x)$일 때, $a_0+a_2+a_4+a_6+a_8+a_{10}$의 값은?",
    options: [
      o("1", "$256$"),
      o("2", "$512$"),
      o("3", "$1024$"),
      o("4", "$128$"),
      o("5", "$210$")
    ],
    answer: "2",
    explanation: "$a_r={}_{10}C_r$. 짝수 첨자 합 $={}_{10}C_0+{}_{10}C_2+\\cdots+{}_{10}C_{10}=2^{10-1}=512$."
  }),
  build({
    testNo: 14, num: 3, unit: "Taylor급수", concept: "테일러 급수", difficulty: "easy",
    question: "$f(x)=\\dfrac{1}{x-1}$에 대하여 $x=3$에서 테일러급수를 구할 때, $(x-3)^5$의 계수는?",
    options: [
      o("1", "$\\dfrac{1}{32}$"),
      o("2", "$-\\dfrac{1}{32}$"),
      o("3", "$\\dfrac{1}{64}$"),
      o("4", "$-\\dfrac{1}{64}$"),
      o("5", "$\\dfrac{1}{128}$")
    ],
    answer: "4",
    explanation: "$\\dfrac{1}{x-1}=\\dfrac{1}{(x-3)+2}=\\dfrac{1}{2}\\cdot\\dfrac{1}{1+(x-3)/2}=\\dfrac{1}{2}\\sum_{n=0}^\\infty\\!\\left(-\\dfrac{x-3}{2}\\right)^n$. 5차항 계수 $=\\dfrac{(-1)^5}{2^6}=-\\dfrac{1}{64}$."
  }),
  build({
    testNo: 14, num: 4, unit: "Taylor급수", concept: "테일러 급수", difficulty: "easyMedium",
    question: "$(x-\\pi)^3\\sin x=\\sum_{n=0}^\\infty a_n(x-\\pi)^n$일 때 $a_6$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{2!}$"),
      o("2", "$\\dfrac{1}{3!}$"),
      o("3", "$\\dfrac{1}{4!}$"),
      o("4", "$\\dfrac{1}{5!}$"),
      o("5", "$\\dfrac{1}{6!}$")
    ],
    answer: "2",
    explanation: "$\\sin x$의 $x=\\pi$에서 전개: $\\sin x=-(x-\\pi)+\\dfrac{(x-\\pi)^3}{3!}-\\cdots$. 곱한 후 $a_6$은 $\\sin$의 3차 항 $\\dfrac{(x-\\pi)^3}{3!}$과 $(x-\\pi)^3$의 곱에서 옴 → $\\dfrac{1}{3!}$."
  }),
  build({
    testNo: 14, num: 5, unit: "Taylor급수", concept: "테일러 급수", difficulty: "easyMedium",
    question: "$f(x)=\\dfrac{1}{5-x}$의 $x=1$에서의 테일러 급수전개식은?",
    options: [
      o("1", "$\\sum_{n=0}^\\infty\\dfrac{(x-1)^n}{4^{n+1}}$"),
      o("2", "$\\sum_{n=0}^\\infty\\dfrac{(x-1)^n}{4^n}$"),
      o("3", "$\\sum_{n=0}^\\infty\\dfrac{(x-1)^n}{5^{n+1}}$"),
      o("4", "$\\sum_{n=0}^\\infty\\dfrac{(-1)^n(x-1)^n}{4^{n+1}}$"),
      o("5", "$\\sum_{n=0}^\\infty(x-1)^n$")
    ],
    answer: "1",
    explanation: "$\\dfrac{1}{5-x}=\\dfrac{1}{4-(x-1)}=\\dfrac{1}{4}\\cdot\\dfrac{1}{1-(x-1)/4}=\\dfrac{1}{4}\\sum_{n=0}^\\infty\\!\\left(\\dfrac{x-1}{4}\\right)^n=\\sum_{n=0}^\\infty\\dfrac{(x-1)^n}{4^{n+1}}$."
  }),
  build({
    testNo: 14, num: 6, unit: "Taylor급수", concept: "매클로린 급수", difficulty: "easy",
    question: "$f(x)=e^{2x}$의 매클로린 전개의 3차항은?",
    options: [
      o("1", "$\\dfrac{1}{3!}x^3$"),
      o("2", "$\\dfrac{2}{3!}x^3$"),
      o("3", "$\\dfrac{4}{3}x^3$"),
      o("4", "$\\dfrac{8}{3!}x^3$"),
      o("5", "$2x^3$")
    ],
    answer: "3",
    explanation: "$e^{2x}=\\sum_{n=0}^\\infty\\dfrac{(2x)^n}{n!}$이므로 3차 계수 $=\\dfrac{2^3}{3!}=\\dfrac{8}{6}=\\dfrac{4}{3}$. 3차항 $=\\dfrac{4}{3}x^3$."
  }),

  // ====================== Daily TEST 15 (테일러 급수) ======================
  build({
    testNo: 15, num: 1, unit: "Taylor급수", concept: "매클로린 급수", difficulty: "easy",
    question: "$f(x)=e^{-x^2}$에 대한 매클로린 급수가 $\\sum_{k=0}^\\infty a_k x^k$일 때, $a_5+a_6$의 값은?",
    options: [
      o("1", "$-\\dfrac{1}{6}$"),
      o("2", "$\\dfrac{1}{6}$"),
      o("3", "$-\\dfrac{1}{3!}$"),
      o("4", "$0$"),
      o("5", "$-\\dfrac{1}{12}$")
    ],
    answer: "1",
    explanation: "$e^{-x^2}=\\sum_{n=0}^\\infty\\dfrac{(-1)^n}{n!}x^{2n}$. 홀수 차수 계수는 $0$ → $a_5=0$. $a_6$은 $n=3$일 때 $\\dfrac{(-1)^3}{3!}=-\\dfrac{1}{6}$. 합 $=-\\dfrac{1}{6}$."
  }),
  build({
    testNo: 15, num: 2, unit: "Taylor급수", concept: "매클로린 급수", difficulty: "easyMedium",
    question: "$f(x)=\\sqrt{1+x^3}$에 대하여 $\\dfrac{f^{(9)}(0)}{9!}$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{8}$"),
      o("2", "$\\dfrac{1}{16}$"),
      o("3", "$\\dfrac{1}{32}$"),
      o("4", "$-\\dfrac{1}{16}$"),
      o("5", "$\\dfrac{3}{16}$")
    ],
    answer: "2",
    explanation: "$(1+u)^{1/2}=1+\\dfrac{1}{2}u-\\dfrac{1}{8}u^2+\\dfrac{1}{16}u^3-\\cdots$. $u=x^3$이므로 $x^9$의 계수 $=\\dfrac{1}{16}$. $\\dfrac{f^{(9)}(0)}{9!}=$ $x^9$ 계수 $=\\dfrac{1}{16}$."
  }),
  build({
    testNo: 15, num: 3, unit: "Taylor급수", concept: "테일러 다항식", difficulty: "easyMedium",
    question: "$\\sin^{-1} x$의 $x=0$에서의 5차 테일러 다항식은?",
    options: [
      o("1", "$x+\\dfrac{1}{6}x^3+\\dfrac{3}{40}x^5$"),
      o("2", "$x-\\dfrac{1}{6}x^3+\\dfrac{3}{40}x^5$"),
      o("3", "$x+\\dfrac{1}{2}x^3+\\dfrac{3}{8}x^5$"),
      o("4", "$x-\\dfrac{1}{6}x^3-\\dfrac{1}{120}x^5$"),
      o("5", "$x+\\dfrac{1}{3!}x^3+\\dfrac{1}{5!}x^5$")
    ],
    answer: "1",
    explanation: "$\\sin^{-1}x=x+\\dfrac{1}{2\\cdot 3}x^3+\\dfrac{1\\cdot 3}{2\\cdot 4\\cdot 5}x^5+\\cdots = x+\\dfrac{1}{6}x^3+\\dfrac{3}{40}x^5+\\cdots$."
  }),
  build({
    testNo: 15, num: 4, unit: "Taylor급수", concept: "매클로린 급수", difficulty: "easyMedium",
    question: "$f(x)=\\cos x-\\sin x$를 $\\sum_{n=0}^\\infty a_n x^n$으로 나타낼 때 $\\dfrac{a_{2017}}{a_{2018}}$의 값은?",
    options: [
      o("1", "$2018$"),
      o("2", "$-2018$"),
      o("3", "$\\dfrac{1}{2018}$"),
      o("4", "$2017$"),
      o("5", "$-1$")
    ],
    answer: "1",
    explanation: "$\\cos x=\\sum\\dfrac{(-1)^n}{(2n)!}x^{2n}$, $\\sin x=\\sum\\dfrac{(-1)^n}{(2n+1)!}x^{2n+1}$. $a_{2017}=-\\dfrac{1}{2017!}$ (sin항에서 $n=1008$), $a_{2018}=-\\dfrac{1}{2018!}$ (cos항에서 $n=1009$). 비율 $=\\dfrac{2018!}{2017!}=2018$."
  }),
  build({
    testNo: 15, num: 5, unit: "Taylor급수", concept: "멱급수", difficulty: "easyMedium",
    question: "$|x|<\\dfrac{5}{2}$에서 $f(x)=\\dfrac{x^3}{5+2x}$을 $\\sum_{n=0}^\\infty a_n x^n$으로 나타낼 때 $a_5$의 값은?",
    options: [
      o("1", "$\\dfrac{4}{125}$"),
      o("2", "$-\\dfrac{4}{125}$"),
      o("3", "$\\dfrac{2}{125}$"),
      o("4", "$\\dfrac{4}{25}$"),
      o("5", "$\\dfrac{1}{125}$")
    ],
    answer: "1",
    explanation: "$\\dfrac{x^3}{5+2x}=\\dfrac{x^3}{5}\\cdot\\dfrac{1}{1+2x/5}=\\dfrac{x^3}{5}\\sum_{n=0}^\\infty\\!\\left(-\\dfrac{2x}{5}\\right)^n$. $x^5$ 계수는 $n=2$: $\\dfrac{1}{5}\\cdot\\dfrac{4}{25}=\\dfrac{4}{125}$."
  }),
  build({
    testNo: 15, num: 6, unit: "Taylor급수", concept: "멱급수", difficulty: "easyMedium",
    question: "$e^{-x^2}\\sin x$를 $x$의 멱급수로 나타낼 때, $x^5$의 계수는?",
    options: [
      o("1", "$\\dfrac{1}{120}$"),
      o("2", "$\\dfrac{1}{40}$"),
      o("3", "$\\dfrac{27}{40}$"),
      o("4", "$\\dfrac{27}{120}$"),
      o("5", "$\\dfrac{11}{120}$")
    ],
    answer: "3",
    explanation: "$e^{-x^2}=1-x^2+\\dfrac{x^4}{2!}-\\cdots$, $\\sin x=x-\\dfrac{x^3}{3!}+\\dfrac{x^5}{5!}-\\cdots$. $x^5$ 계수 $=\\dfrac{1}{5!}+\\dfrac{1}{3!}+\\dfrac{1}{2!}=\\dfrac{1}{120}+\\dfrac{20}{120}+\\dfrac{60}{120}=\\dfrac{81}{120}=\\dfrac{27}{40}$."
  })
];

console.log(`Inserting ${problems.length} daily-test problems (DT6~DT15)...`);

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
