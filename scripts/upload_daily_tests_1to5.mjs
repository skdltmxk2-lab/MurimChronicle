// Upload Daily TEST 1~5 (30 problems) to Supabase.
// All tagged "daily", difficulty restricted to easy / easyMedium.
// Usage: node scripts/upload_daily_tests_1to5.mjs
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

// Helper: build option object
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });

// Helper: build a question record
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
  // ====================== Daily TEST 1 (역삼각함수) ======================
  build({
    testNo: 1, num: 1, unit: "함수", concept: "역삼각함수", difficulty: "easy",
    question: "$a_n = \\tan^{-1} n$, $b_n = \\tan^{-1} \\dfrac{1}{n}$일 때, 다음 중 모든 자연수 $n$에 대하여 옳은 것은?",
    options: [
      o("1", "$a_n + b_n = \\dfrac{\\pi}{2}$"),
      o("2", "$a_n - b_n = \\dfrac{\\pi}{4}$"),
      o("3", "$a_n b_n = 1$"),
      o("4", "$a_n b_n = \\dfrac{\\pi}{4}$"),
      o("5", "$\\dfrac{a_n}{b_n} = n$")
    ],
    answer: "1",
    explanation: "$x>0$일 때 $\\tan^{-1}x + \\tan^{-1}\\dfrac{1}{x} = \\dfrac{\\pi}{2}$이므로 $a_n + b_n = \\dfrac{\\pi}{2}$."
  }),
  build({
    testNo: 1, num: 2, unit: "함수", concept: "역삼각함수", difficulty: "easy",
    question: "$\\tan^{-1} 2 + \\cot^{-1} 2$의 값은?",
    options: [
      o("1", "$\\dfrac{\\pi}{6}$"),
      o("2", "$\\dfrac{\\pi}{4}$"),
      o("3", "$\\dfrac{\\pi}{3}$"),
      o("4", "$\\dfrac{\\pi}{2}$"),
      o("5", "$\\pi$")
    ],
    answer: "4",
    explanation: "모든 실수 $x$에 대하여 $\\tan^{-1}x + \\cot^{-1}x = \\dfrac{\\pi}{2}$이다."
  }),
  build({
    testNo: 1, num: 3, unit: "함수", concept: "역삼각함수", difficulty: "easy",
    question: "$\\cos^{-1}\\dfrac{4}{5} + \\cos^{-1}\\dfrac{3}{5}$의 값은?",
    options: [
      o("1", "$\\dfrac{\\pi}{6}$"),
      o("2", "$\\dfrac{\\pi}{4}$"),
      o("3", "$\\dfrac{\\pi}{3}$"),
      o("4", "$\\dfrac{\\pi}{2}$"),
      o("5", "$\\pi$")
    ],
    answer: "4",
    explanation: "$x^2+y^2=r^2$이면 $\\cos^{-1}\\dfrac{x}{r} + \\cos^{-1}\\dfrac{y}{r} = \\dfrac{\\pi}{2}$. $4^2+3^2=5^2$이므로 합은 $\\dfrac{\\pi}{2}$."
  }),
  build({
    testNo: 1, num: 4, unit: "함수", concept: "역삼각함수", difficulty: "easy",
    question: "$\\cos\\!\\left(\\tan^{-1}\\dfrac{2}{3}\\right)$의 값은?",
    options: [
      o("1", "$\\dfrac{2}{\\sqrt{13}}$"),
      o("2", "$\\dfrac{3}{\\sqrt{13}}$"),
      o("3", "$\\dfrac{\\sqrt{13}}{2}$"),
      o("4", "$\\dfrac{\\sqrt{13}}{3}$"),
      o("5", "$\\dfrac{2}{3}$")
    ],
    answer: "2",
    explanation: "$\\tan^{-1}\\dfrac{2}{3}=\\alpha$라 하면 $\\tan\\alpha=\\dfrac{2}{3}$, 빗변 $=\\sqrt{13}$이므로 $\\cos\\alpha=\\dfrac{3}{\\sqrt{13}}$."
  }),
  build({
    testNo: 1, num: 5, unit: "함수", concept: "역삼각함수", difficulty: "easy",
    question: "$\\cos\\!\\left(\\sin^{-1}\\!\\left(-\\dfrac{1}{4}\\right)\\right)$의 값은?",
    options: [
      o("1", "$-\\dfrac{\\sqrt{15}}{4}$"),
      o("2", "$-\\dfrac{1}{4}$"),
      o("3", "$\\dfrac{1}{4}$"),
      o("4", "$\\dfrac{\\sqrt{15}}{4}$"),
      o("5", "$\\dfrac{15}{16}$")
    ],
    answer: "4",
    explanation: "$\\sin^{-1}\\!\\left(-\\dfrac{1}{4}\\right)=\\alpha$라 하면 $\\sin\\alpha=-\\dfrac{1}{4}$ (4사분면각)이고 $\\cos\\alpha=\\dfrac{\\sqrt{15}}{4}>0$."
  }),
  build({
    testNo: 1, num: 6, unit: "함수", concept: "역삼각함수", difficulty: "easy",
    question: "$\\sin^2\\!\\left(\\cos^{-1}\\dfrac{2}{3}\\right)$의 값은?",
    options: [
      o("1", "$\\dfrac{4}{9}$"),
      o("2", "$\\dfrac{5}{9}$"),
      o("3", "$\\dfrac{\\sqrt{5}}{3}$"),
      o("4", "$\\dfrac{2}{3}$"),
      o("5", "$\\dfrac{5}{6}$")
    ],
    answer: "2",
    explanation: "$\\cos\\alpha=\\dfrac{2}{3}$이므로 $\\sin^2\\alpha = 1 - \\cos^2\\alpha = 1 - \\dfrac{4}{9} = \\dfrac{5}{9}$."
  }),

  // ====================== Daily TEST 2 (역삼각함수 + 쌍곡선함수) ======================
  build({
    testNo: 2, num: 1, unit: "함수", concept: "역삼각함수", difficulty: "easyMedium",
    question: "$\\tan^{-1}\\dfrac{1}{2} + \\tan^{-1}\\dfrac{1}{3}$의 값은?",
    options: [
      o("1", "$\\dfrac{\\pi}{6}$"),
      o("2", "$\\dfrac{\\pi}{4}$"),
      o("3", "$\\dfrac{\\pi}{3}$"),
      o("4", "$\\dfrac{\\pi}{2}$"),
      o("5", "$\\pi$")
    ],
    answer: "2",
    explanation: "$\\tan^{-1}\\dfrac{1}{2}=\\alpha$, $\\tan^{-1}\\dfrac{1}{3}=\\beta$라 하면 $\\tan(\\alpha+\\beta)=\\dfrac{\\frac{1}{2}+\\frac{1}{3}}{1-\\frac{1}{2}\\cdot\\frac{1}{3}}=1$. 따라서 $\\alpha+\\beta=\\dfrac{\\pi}{4}$."
  }),
  build({
    testNo: 2, num: 2, unit: "함수", concept: "역삼각함수", difficulty: "easyMedium",
    question: "$\\tan(\\tan^{-1} 11 - \\tan^{-1} 9)$의 값은?",
    options: [
      o("1", "$2$"),
      o("2", "$\\dfrac{1}{2}$"),
      o("3", "$\\dfrac{1}{20}$"),
      o("4", "$\\dfrac{1}{50}$"),
      o("5", "$\\dfrac{1}{100}$")
    ],
    answer: "4",
    explanation: "$\\tan(\\alpha-\\beta)=\\dfrac{\\tan\\alpha - \\tan\\beta}{1+\\tan\\alpha\\tan\\beta}=\\dfrac{11-9}{1+11\\cdot 9}=\\dfrac{2}{100}=\\dfrac{1}{50}$."
  }),
  build({
    testNo: 2, num: 3, unit: "함수", concept: "역삼각함수", difficulty: "easy",
    question: "$\\sin(\\sin^{-1} x) = x$가 성립하는 $x$의 범위는?",
    options: [
      o("1", "$-1 \\le x \\le 1$"),
      o("2", "$-\\dfrac{\\pi}{2} \\le x \\le \\dfrac{\\pi}{2}$"),
      o("3", "$0 \\le x \\le 1$"),
      o("4", "$0 \\le x \\le \\pi$"),
      o("5", "모든 실수")
    ],
    answer: "1",
    explanation: "$\\sin^{-1}$의 정의역이 $[-1,1]$이므로 $\\sin(\\sin^{-1}x)=x$는 $-1 \\le x \\le 1$에서 성립한다."
  }),
  build({
    testNo: 2, num: 4, unit: "함수", concept: "역삼각함수", difficulty: "easyMedium",
    question: "$\\sin^{-1}\\!\\left(\\sin\\dfrac{5\\pi}{7}\\right)$의 값은?",
    options: [
      o("1", "$-\\dfrac{2\\pi}{7}$"),
      o("2", "$\\dfrac{2\\pi}{7}$"),
      o("3", "$\\dfrac{5\\pi}{7}$"),
      o("4", "$-\\dfrac{5\\pi}{7}$"),
      o("5", "$\\dfrac{\\pi}{7}$")
    ],
    answer: "2",
    explanation: "$\\sin^{-1}(\\sin x)=x$의 정의역은 $-\\dfrac{\\pi}{2} \\le x \\le \\dfrac{\\pi}{2}$이고, $\\sin\\dfrac{5\\pi}{7}=\\sin\\dfrac{2\\pi}{7}$이므로 $\\sin^{-1}\\!\\left(\\sin\\dfrac{5\\pi}{7}\\right)=\\dfrac{2\\pi}{7}$."
  }),
  build({
    testNo: 2, num: 5, unit: "함수", concept: "쌍곡선함수", difficulty: "easy",
    question: "$f(x) = \\sinh 2x$일 때, $f(\\ln 2)$의 값은?",
    options: [
      o("1", "$\\dfrac{3}{4}$"),
      o("2", "$\\dfrac{15}{8}$"),
      o("3", "$\\dfrac{17}{8}$"),
      o("4", "$\\dfrac{33}{16}$"),
      o("5", "$4$")
    ],
    answer: "2",
    explanation: "$\\sinh(2\\ln 2)=\\dfrac{e^{2\\ln 2}-e^{-2\\ln 2}}{2}=\\dfrac{4-\\frac{1}{4}}{2}=\\dfrac{15}{8}$."
  }),
  build({
    testNo: 2, num: 6, unit: "함수", concept: "쌍곡선함수", difficulty: "easyMedium",
    question: "$e^x \\sinh x = 2$의 해가 $a$일 때, $\\operatorname{sech} 2a$의 값은?",
    options: [
      o("1", "$\\dfrac{5}{12}$"),
      o("2", "$\\dfrac{5}{13}$"),
      o("3", "$\\dfrac{12}{13}$"),
      o("4", "$\\dfrac{13}{12}$"),
      o("5", "$\\dfrac{13}{5}$")
    ],
    answer: "2",
    explanation: "$e^x\\cdot\\dfrac{e^x-e^{-x}}{2}=\\dfrac{1}{2}(e^{2x}-1)=2 \\Rightarrow e^{2x}=5$. $\\operatorname{sech}2x=\\dfrac{2}{e^{2x}+e^{-2x}}=\\dfrac{2}{5+\\frac{1}{5}}=\\dfrac{5}{13}$."
  }),

  // ====================== Daily TEST 3 (쌍곡선함수 + 수열의 극한) ======================
  build({
    testNo: 3, num: 1, unit: "함수", concept: "쌍곡선함수", difficulty: "easy",
    question: "$\\tanh x = 1$, $\\tanh y = -1$일 때, $\\tanh(x-y)$의 값은?",
    options: [
      o("1", "$-1$"),
      o("2", "$0$"),
      o("3", "$\\dfrac{1}{2}$"),
      o("4", "$1$"),
      o("5", "정의되지 않음")
    ],
    answer: "4",
    explanation: "$\\tanh(x-y)=\\dfrac{\\tanh x-\\tanh y}{1-\\tanh x\\tanh y}=\\dfrac{1-(-1)}{1-1\\cdot(-1)}=\\dfrac{2}{2}=1$."
  }),
  build({
    testNo: 3, num: 2, unit: "함수", concept: "쌍곡선함수", difficulty: "easy",
    question: "$\\sinh x = \\dfrac{1}{2}$일 때, $\\tanh x$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{\\sqrt{3}}$"),
      o("2", "$\\dfrac{1}{\\sqrt{5}}$"),
      o("3", "$\\dfrac{\\sqrt{5}}{2}$"),
      o("4", "$\\sqrt{5}$"),
      o("5", "$\\dfrac{1}{2}$")
    ],
    answer: "2",
    explanation: "$\\cosh^2 x - \\sinh^2 x = 1$이므로 $\\cosh x=\\sqrt{1+\\tfrac{1}{4}}=\\dfrac{\\sqrt{5}}{2}$. 따라서 $\\tanh x=\\dfrac{\\sinh x}{\\cosh x}=\\dfrac{1/2}{\\sqrt{5}/2}=\\dfrac{1}{\\sqrt{5}}$."
  }),
  build({
    testNo: 3, num: 3, unit: "함수", concept: "쌍곡선함수", difficulty: "easyMedium",
    question: "$\\sinh^{-1}\\!\\left(\\dfrac{1}{\\sqrt{3}}\\right)$의 값은?",
    options: [
      o("1", "$\\ln 2$"),
      o("2", "$\\ln\\sqrt{3}$"),
      o("3", "$\\ln 3$"),
      o("4", "$\\dfrac{\\pi}{6}$"),
      o("5", "$\\dfrac{\\pi}{3}$")
    ],
    answer: "2",
    explanation: "$\\sinh^{-1}x=\\ln\\!\\left(x+\\sqrt{x^2+1}\\right)$. $x=\\dfrac{1}{\\sqrt{3}}$일 때 $\\sqrt{x^2+1}=\\dfrac{2}{\\sqrt{3}}$이므로 $\\ln\\!\\left(\\dfrac{1+2}{\\sqrt{3}}\\right)=\\ln\\sqrt{3}$."
  }),
  build({
    testNo: 3, num: 4, unit: "극한과 연속", concept: "수열의 극한", difficulty: "easy",
    question: "$\\displaystyle\\lim_{n\\to\\infty}\\dfrac{7-2n+4n^2}{3n-n^2}$의 값은?",
    options: [
      o("1", "$-4$"),
      o("2", "$-2$"),
      o("3", "$0$"),
      o("4", "$\\dfrac{4}{3}$"),
      o("5", "$4$")
    ],
    answer: "1",
    explanation: "분자·분모를 $n^2$로 나누면 $\\dfrac{7/n^2 - 2/n + 4}{3/n - 1} \\to \\dfrac{4}{-1} = -4$."
  }),
  build({
    testNo: 3, num: 5, unit: "극한과 연속", concept: "수열의 극한", difficulty: "easyMedium",
    question: "$\\displaystyle\\lim_{n\\to\\infty}\\dfrac{1}{\\sqrt{3n+\\sqrt{2n}}-\\sqrt{3n}}$의 값은?",
    options: [
      o("1", "$\\sqrt{2}$"),
      o("2", "$\\sqrt{3}$"),
      o("3", "$\\sqrt{6}$"),
      o("4", "$2\\sqrt{3}$"),
      o("5", "$\\infty$")
    ],
    answer: "3",
    explanation: "분모를 유리화: $\\dfrac{1}{\\sqrt{3n+\\sqrt{2n}}-\\sqrt{3n}}=\\dfrac{\\sqrt{3n+\\sqrt{2n}}+\\sqrt{3n}}{\\sqrt{2n}}\\approx\\dfrac{2\\sqrt{3n}}{\\sqrt{2n}}=\\sqrt{6}$."
  }),
  build({
    testNo: 3, num: 6, unit: "극한과 연속", concept: "수열의 극한", difficulty: "easy",
    question: "$\\displaystyle\\lim_{n\\to\\infty}\\dfrac{\\sin n\\theta}{n}$의 값은?",
    options: [
      o("1", "$-1$"),
      o("2", "$0$"),
      o("3", "$1$"),
      o("4", "$\\sin\\theta$"),
      o("5", "발산")
    ],
    answer: "2",
    explanation: "$-1 \\le \\sin n\\theta \\le 1$이므로 $-\\dfrac{1}{n} \\le \\dfrac{\\sin n\\theta}{n} \\le \\dfrac{1}{n}$. 스퀴즈 정리로 극한값은 $0$."
  }),

  // ====================== Daily TEST 4 (극한) ======================
  build({
    testNo: 4, num: 1, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "$\\displaystyle\\lim_{x\\to 0}\\dfrac{1}{4+3^{1/x}}$의 값은?",
    options: [
      o("1", "$0$"),
      o("2", "$\\dfrac{1}{4}$"),
      o("3", "$\\dfrac{1}{7}$"),
      o("4", "$1$"),
      o("5", "존재하지 않는다")
    ],
    answer: "5",
    explanation: "$x\\to 0^+$이면 $3^{1/x}\\to\\infty$이라 극한은 $0$. $x\\to 0^-$이면 $3^{1/x}\\to 0$이라 극한은 $\\dfrac{1}{4}$. 좌·우극한이 다르므로 존재하지 않는다."
  }),
  build({
    testNo: 4, num: 2, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easy",
    question: "$\\displaystyle\\lim_{x\\to 5^+}\\dfrac{5-x}{2|x-5|}$의 값은?",
    options: [
      o("1", "$-1$"),
      o("2", "$-\\dfrac{1}{2}$"),
      o("3", "$0$"),
      o("4", "$\\dfrac{1}{2}$"),
      o("5", "$1$")
    ],
    answer: "2",
    explanation: "$x \\to 5^+$이면 $|x-5|=x-5$이므로 $\\dfrac{5-x}{2(x-5)}=-\\dfrac{1}{2}$."
  }),
  build({
    testNo: 4, num: 3, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easy",
    question: "$\\displaystyle\\lim_{x\\to\\infty}\\!\\left(\\tanh x + \\dfrac{\\cosh x}{1+\\sinh^2 x}\\right)$의 값은?",
    options: [
      o("1", "$0$"),
      o("2", "$\\dfrac{1}{2}$"),
      o("3", "$1$"),
      o("4", "$2$"),
      o("5", "발산")
    ],
    answer: "3",
    explanation: "$1+\\sinh^2 x=\\cosh^2 x$이므로 식 $=\\tanh x + \\dfrac{1}{\\cosh x}$. $x\\to\\infty$이면 $\\tanh x \\to 1$, $\\dfrac{1}{\\cosh x}\\to 0$이라 합은 $1$."
  }),
  build({
    testNo: 4, num: 4, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "$\\displaystyle\\lim_{x\\to 0}\\dfrac{\\sqrt{x^3+x^2}}{\\csc\\dfrac{\\pi}{x}}$의 값은?",
    options: [
      o("1", "$-1$"),
      o("2", "$0$"),
      o("3", "$\\dfrac{1}{\\pi}$"),
      o("4", "$1$"),
      o("5", "발산")
    ],
    answer: "2",
    explanation: "$\\dfrac{\\sqrt{x^3+x^2}}{\\csc(\\pi/x)}=\\sqrt{x^3+x^2}\\cdot\\sin\\dfrac{\\pi}{x}$. $\\sqrt{x^3+x^2}\\to 0$이고 $\\sin$항은 유계이므로 스퀴즈 정리로 $0$."
  }),
  build({
    testNo: 4, num: 5, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "$\\displaystyle\\lim_{x\\to-2^+}f(x)$가 존재하고 $\\dfrac{x^2+x-1}{x+3} \\le \\dfrac{f(x)}{x^2} \\le \\dfrac{x^2+2x+1}{x+3}$이 성립할 때, $\\displaystyle\\lim_{x\\to-2^+}f(x)$의 값은?",
    options: [
      o("1", "$0$"),
      o("2", "$1$"),
      o("3", "$2$"),
      o("4", "$4$"),
      o("5", "$\\dfrac{1}{4}$")
    ],
    answer: "4",
    explanation: "$x\\to-2^+$에서 양쪽 극한 모두 $\\dfrac{1}{1}=1$이므로 스퀴즈 정리에 의해 $\\lim\\dfrac{f(x)}{x^2}=1$. 따라서 $\\lim f(x) = (-2)^2 \\cdot 1 = 4$."
  }),
  build({
    testNo: 4, num: 6, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easy",
    question: "$\\displaystyle\\lim_{x\\to 4^+}\\dfrac{[x]^2-16}{x-4}$의 값은? (단, $[x]$는 $x$를 넘지 않는 최대정수이다.)",
    options: [
      o("1", "$0$"),
      o("2", "$4$"),
      o("3", "$8$"),
      o("4", "$\\infty$"),
      o("5", "존재하지 않는다")
    ],
    answer: "1",
    explanation: "$x\\to 4^+$에서 $[x]=4$이므로 분자 $=16-16=0$, 분모 $\\to 0^+$. 따라서 $\\dfrac{0}{x-4}=0$이고 극한은 $0$."
  }),

  // ====================== Daily TEST 5 (극한 + 연속) ======================
  build({
    testNo: 5, num: 1, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "$\\displaystyle\\lim_{x\\to 0^+}\\dfrac{x}{2}\\!\\left[\\dfrac{3}{x}\\right]$의 값은? (단, $[x]$는 $x$를 넘지 않는 최대정수이다.)",
    options: [
      o("1", "$0$"),
      o("2", "$1$"),
      o("3", "$\\dfrac{3}{2}$"),
      o("4", "$3$"),
      o("5", "$\\infty$")
    ],
    answer: "3",
    explanation: "$\\dfrac{3}{x}-1 < \\left[\\dfrac{3}{x}\\right] \\le \\dfrac{3}{x}$이므로 $\\dfrac{x}{2}\\!\\left(\\dfrac{3}{x}-1\\right) < \\dfrac{x}{2}\\!\\left[\\dfrac{3}{x}\\right] \\le \\dfrac{3}{2}$. 양쪽 모두 $\\dfrac{3}{2}$로 수렴."
  }),
  build({
    testNo: 5, num: 2, unit: "극한과 연속", concept: "연속", difficulty: "easy",
    question: "$f(x) = x\\sin\\dfrac{1}{x} + 2x + 3 \\ (x\\ne 0)$이 모든 실수에서 연속이 되도록 함수값 $f(0)$을 정의하면?",
    options: [
      o("1", "$0$"),
      o("2", "$1$"),
      o("3", "$2$"),
      o("4", "$3$"),
      o("5", "정의 불가능")
    ],
    answer: "4",
    explanation: "$\\sin(1/x)$은 유계이고 $x\\to 0$이면 $x\\sin(1/x)\\to 0$ (스퀴즈). 따라서 $\\lim_{x\\to 0}f(x)=0+0+3=3$이므로 $f(0)=3$."
  }),
  build({
    testNo: 5, num: 3, unit: "극한과 연속", concept: "연속", difficulty: "easy",
    question: "다음 함수 $f(x)$가 구간 $(-\\infty, \\infty)$에서 연속이 되기 위한 상수 $c$의 값은? $f(x) = \\begin{cases} x^2-c^2 & (x<4) \\\\ cx+20 & (x\\ge 4) \\end{cases}$",
    options: [
      o("1", "$-4$"),
      o("2", "$-2$"),
      o("3", "$0$"),
      o("4", "$2$"),
      o("5", "$4$")
    ],
    answer: "2",
    explanation: "$x=4$에서 좌극한 $16-c^2$, 우극한 $4c+20$. 같아야 하므로 $16-c^2=4c+20 \\Rightarrow c^2+4c+4=0 \\Rightarrow (c+2)^2=0 \\Rightarrow c=-2$."
  }),
  build({
    testNo: 5, num: 4, unit: "극한과 연속", concept: "연속", difficulty: "easyMedium",
    question: "$f(x) = [3x]$, $g(x) = \\!\\left[\\dfrac{x}{3}\\right]$에 대해서, 개구간 $(-1, 1)$에서 함수 $f(x)$의 불연속인 점의 개수를 $A$, 함수 $g(x)$의 불연속인 점의 개수를 $B$라 할 때, $A-B$의 값은? (단, $[x]$는 $x$를 넘지 않는 최대정수이다.)",
    options: [
      o("1", "$1$"),
      o("2", "$2$"),
      o("3", "$3$"),
      o("4", "$4$"),
      o("5", "$5$")
    ],
    answer: "4",
    explanation: "$-1<x<1$에서 $-3<3x<3$이므로 $[3x]$의 불연속점 $x=-2/3,-1/3,0,1/3,2/3$의 5개($A=5$). $-1/3<x/3<1/3$이라 $[x/3]$의 불연속점은 $x=0$의 1개($B=1$). $A-B=4$."
  }),
  build({
    testNo: 5, num: 5, unit: "극한과 연속", concept: "연속", difficulty: "easy",
    question: "$f(x)=\\sin x - [\\sin x]$에 대하여 $0 < x < 2\\pi$에서 불연속인 점의 개수는? (단, $[x]$는 $x$를 넘지 않는 최대정수이다.)",
    options: [
      o("1", "$0$"),
      o("2", "$1$"),
      o("3", "$2$"),
      o("4", "$3$"),
      o("5", "$4$")
    ],
    answer: "3",
    explanation: "$[\\sin x]$는 $\\sin x$가 정수가 되는 점에서 불연속. $0<x<2\\pi$에서 $\\sin x=1$ ($x=\\pi/2$), $\\sin x=0$ ($x=\\pi$)에서 불연속. $\\sin x=-1$ ($x=3\\pi/2$)에서는 좌·우 모두 $-1$로 연속. 총 2개."
  }),
  build({
    testNo: 5, num: 6, unit: "극한과 연속", concept: "연속", difficulty: "easyMedium",
    question: "모든 실수 집합에서 정의된 함수 $f(x) = \\cos x + x^2$에 대해 $f(c) = 5$가 성립하는 실수 $c$가 존재하는 구간은?",
    options: [
      o("1", "$[-2, 0]$"),
      o("2", "$[-1, 3]$"),
      o("3", "$(5, 8)$"),
      o("4", "$(3, 5)$"),
      o("5", "존재하지 않는다")
    ],
    answer: "2",
    explanation: "$g(x)=\\cos x+x^2-5$로 두면 $g$는 연속. $g(-1)=\\cos(-1)+1-5<0$, $g(3)=\\cos 3+9-5>0$이므로 사잇값 정리에 의해 $[-1,3]$에 해가 존재한다."
  })
];

console.log(`Inserting ${problems.length} daily-test problems...`);

const { error } = await supabase.from("questions").insert(problems);
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}

console.log(`Done. ${problems.length} problems inserted.`);
console.log("By test:");
const byTest = {};
for (const p of problems) {
  const m = p.id.match(/^q-daily-r(\d+)/);
  const k = m ? `Daily TEST ${m[1]}` : "?";
  byTest[k] = (byTest[k] || 0) + 1;
}
for (const [k, v] of Object.entries(byTest)) console.log(` - ${k}: ${v}`);
