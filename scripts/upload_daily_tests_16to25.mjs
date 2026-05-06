// Upload Daily TEST 16~25 (60 problems) to Supabase.
// All tagged "daily", difficulty restricted to easy / easyMedium per policy.
// Usage: node scripts/upload_daily_tests_16to25.mjs
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
  // ============== Daily TEST 16 (테일러 급수 응용) ==============
  build({
    testNo: 16, num: 1, unit: "Taylor급수", concept: "테일러 급수", difficulty: "easyMedium",
    question: "함수 $f(x)=\\dfrac{\\sin x}{\\sqrt{1-x^2}}$의 테일러급수 $\\sum_{n=0}^\\infty a_n x^n$에서 $a_0+a_1+a_2+a_3$의 값은?",
    options: [
      o("1", "$1$"),
      o("2", "$\\dfrac{4}{3}$"),
      o("3", "$\\dfrac{7}{6}$"),
      o("4", "$\\dfrac{5}{6}$"),
      o("5", "$2$")
    ],
    answer: "2",
    explanation: "$\\sin x=x-\\dfrac{x^3}{3!}+\\cdots$, $\\dfrac{1}{\\sqrt{1-x^2}}=1+\\dfrac{1}{2}x^2+\\cdots$. 곱하면 $a_0=0, a_1=1, a_2=0, a_3=\\dfrac{1}{2}-\\dfrac{1}{3!}=\\dfrac{1}{3}$. 합 $=\\dfrac{4}{3}$."
  }),
  build({
    testNo: 16, num: 2, unit: "Taylor급수", concept: "매클로린 급수", difficulty: "easyMedium",
    question: "$f(x)=\\dfrac{1}{2+x^2}$에 대하여 $f^{(6)}(0)$의 값은?",
    options: [
      o("1", "$-45$"),
      o("2", "$45$"),
      o("3", "$-90$"),
      o("4", "$90$"),
      o("5", "$0$")
    ],
    answer: "1",
    explanation: "$\\dfrac{1}{2+x^2}=\\dfrac{1}{2}\\sum_{n=0}^\\infty(-1)^n\\!\\left(\\dfrac{x^2}{2}\\right)^n$. $x^6$ 계수 ($n=3$): $\\dfrac{1}{2}\\cdot(-1)^3\\cdot\\dfrac{1}{8}=-\\dfrac{1}{16}$. $f^{(6)}(0)=6!\\cdot\\!\\left(-\\dfrac{1}{16}\\right)=-45$."
  }),
  build({
    testNo: 16, num: 3, unit: "Taylor급수", concept: "매클로린 급수", difficulty: "easyMedium",
    question: "$f(x)=\\sqrt{1+x^2}+\\sqrt{1-x^2}$에서 $f^{(4)}(0)$의 값은?",
    options: [
      o("1", "$-6$"),
      o("2", "$6$"),
      o("3", "$-3$"),
      o("4", "$3$"),
      o("5", "$0$")
    ],
    answer: "1",
    explanation: "$(1+u)^{1/2}=1+\\dfrac{u}{2}-\\dfrac{u^2}{8}+\\cdots$. $f$에서 $x^4$ 계수 $=-\\dfrac{1}{8}-\\dfrac{1}{8}=-\\dfrac{1}{4}$. $f^{(4)}(0)=4!\\cdot\\!\\left(-\\dfrac{1}{4}\\right)=-6$."
  }),
  build({
    testNo: 16, num: 4, unit: "Taylor급수", concept: "매클로린 급수", difficulty: "easyMedium",
    question: "$S(x)=\\begin{cases}\\dfrac{\\sin x}{x},&x\\ne 0\\\\1,&x=0\\end{cases}$일 때, $S^{(8)}(0)+S^{(9)}(0)+S^{(10)}(0)$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{99}$"),
      o("2", "$\\dfrac{2}{99}$"),
      o("3", "$\\dfrac{1}{9}$"),
      o("4", "$-\\dfrac{1}{11}$"),
      o("5", "$0$")
    ],
    answer: "2",
    explanation: "$S(x)=\\sum_{n=0}^\\infty\\dfrac{(-1)^n x^{2n}}{(2n+1)!}$. 짝수 차수만 존재 → $S^{(9)}(0)=0$. $S^{(8)}(0)=\\dfrac{8!}{9!}=\\dfrac{1}{9}$, $S^{(10)}(0)=-\\dfrac{10!}{11!}=-\\dfrac{1}{11}$. 합 $=\\dfrac{1}{9}-\\dfrac{1}{11}=\\dfrac{2}{99}$."
  }),
  build({
    testNo: 16, num: 5, unit: "Taylor급수", concept: "매클로린 급수", difficulty: "easyMedium",
    question: "$f(x)=e^{-x}\\sin(x^2)$일 때, $f^{(5)}(0)$의 값은?",
    options: [
      o("1", "$-20$"),
      o("2", "$20$"),
      o("3", "$-30$"),
      o("4", "$0$"),
      o("5", "$5!$")
    ],
    answer: "1",
    explanation: "$e^{-x}=1-x+\\dfrac{x^2}{2!}-\\cdots$, $\\sin(x^2)=x^2-\\dfrac{x^6}{3!}+\\cdots$. 곱에서 $x^5$ 계수: $-\\dfrac{1}{3!}$ ($e^{-x}$의 $-x^3$ 항? 아님 — 정밀 계산: $e^{-x}\\sin(x^2)$의 $x^5$ 계수 $=-\\dfrac{1}{3!}$). $f^{(5)}(0)=5!\\cdot\\!\\left(-\\dfrac{1}{3!}\\right)=-20$."
  }),
  build({
    testNo: 16, num: 6, unit: "Taylor급수", concept: "매클로린 급수", difficulty: "easyMedium",
    question: "$f(x)=x(x+1)e^{-x}$에 대하여 $f^{(7)}(0)+f^{(8)}(0)$의 값은?",
    options: [
      o("1", "$13$"),
      o("2", "$-13$"),
      o("3", "$0$"),
      o("4", "$26$"),
      o("5", "$1$")
    ],
    answer: "1",
    explanation: "$(x^2+x)\\sum\\dfrac{(-1)^n}{n!}x^n$의 $x^7$, $x^8$ 계수를 $f^{(7)}(0)/7!$, $f^{(8)}(0)/8!$로 환산. $f^{(7)}(0)+f^{(8)}(0)=\\!\\left(-\\dfrac{7!}{5!}+\\dfrac{7!}{6!}\\right)+\\!\\left(\\dfrac{8!}{6!}-\\dfrac{8!}{7!}\\right)=13$."
  }),

  // ============== Daily TEST 17 (테일러 급수 ②) ==============
  build({
    testNo: 17, num: 1, unit: "Taylor급수", concept: "매클로린 급수", difficulty: "easy",
    question: "$|x|<\\dfrac{1}{2}$인 모든 실수 $x$에 대하여 $\\dfrac{1}{1+x+2x^2}=\\sum_{n=0}^\\infty a_n x^n$이라 하자. $a_0+a_3$의 값은?",
    options: [
      o("1", "$2$"),
      o("2", "$3$"),
      o("3", "$4$"),
      o("4", "$5$"),
      o("5", "$1$")
    ],
    answer: "3",
    explanation: "$\\dfrac{1}{1+(x+2x^2)}=1-(x+2x^2)+(x+2x^2)^2-(x+2x^2)^3+\\cdots=1-x-x^2+3x^3+\\cdots$. $a_0=1, a_3=3$이므로 $a_0+a_3=4$."
  }),
  build({
    testNo: 17, num: 2, unit: "Taylor급수", concept: "매클로린 급수", difficulty: "easyMedium",
    question: "함수 $f(x)=\\ln(1+\\sin x)=ax+bx^2+cx^3+\\cdots$로 나타낼 수 있다. 이때 $3(a+b+c)$의 값은?",
    options: [
      o("1", "$1$"),
      o("2", "$2$"),
      o("3", "$\\dfrac{1}{2}$"),
      o("4", "$0$"),
      o("5", "$3$")
    ],
    answer: "2",
    explanation: "$\\ln(1+\\sin x)=\\sin x-\\dfrac{(\\sin x)^2}{2}+\\dfrac{(\\sin x)^3}{3}-\\cdots=x-\\dfrac{x^2}{2}+\\dfrac{x^3}{6}+\\cdots$. $a=1, b=-\\dfrac{1}{2}, c=\\dfrac{1}{6}$. $3(a+b+c)=3\\!\\left(1-\\dfrac{1}{2}+\\dfrac{1}{6}\\right)=2$."
  }),
  build({
    testNo: 17, num: 3, unit: "Taylor급수", concept: "테일러 다항식", difficulty: "easy",
    question: "$0$을 중심으로 한 함수 $f(x)=\\sqrt{1-x^2}$의 2차 테일러 다항식은?",
    options: [
      o("1", "$1-\\dfrac{x^2}{2}$"),
      o("2", "$1+\\dfrac{x^2}{2}$"),
      o("3", "$1-x^2$"),
      o("4", "$1-\\dfrac{x^2}{4}$"),
      o("5", "$1$")
    ],
    answer: "1",
    explanation: "$(1+u)^{1/2}=1+\\dfrac{u}{2}+\\cdots$. $u=-x^2$이므로 $\\sqrt{1-x^2}=1-\\dfrac{x^2}{2}+\\cdots$. 2차까지 $=1-\\dfrac{x^2}{2}$."
  }),
  build({
    testNo: 17, num: 4, unit: "Taylor급수", concept: "테일러 다항식", difficulty: "easyMedium",
    question: "$x=0$에서 $f(x)=\\dfrac{\\cos x}{1+x^2+x^4}$의 5차 테일러 다항식을 $p(x)=a_0+a_1x+a_2x^2+a_3x^3+a_4x^4+a_5x^5$이라 할 때, $a_0+a_1+a_2+a_3+a_4+a_5$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{24}$"),
      o("2", "$\\dfrac{13}{24}$"),
      o("3", "$1$"),
      o("4", "$-\\dfrac{1}{24}$"),
      o("5", "$\\dfrac{3}{2}$")
    ],
    answer: "1",
    explanation: "$\\cos x=1-\\dfrac{x^2}{2!}+\\dfrac{x^4}{4!}-\\cdots$, $\\dfrac{1}{1+(x^2+x^4)}=1-(x^2+x^4)+(x^2+x^4)^2-\\cdots$. 곱하면 $1-\\dfrac{3}{2}x^2+\\dfrac{13}{24}x^4-\\cdots$. 계수 합 $=1-\\dfrac{3}{2}+\\dfrac{13}{24}=\\dfrac{1}{24}$."
  }),
  build({
    testNo: 17, num: 5, unit: "Taylor급수", concept: "테일러 다항식", difficulty: "easyMedium",
    question: "$f(x)=e^{\\sin x}$의 $x=0$에서의 3차 테일러 다항식을 구하라.",
    options: [
      o("1", "$1+x+\\dfrac{x^2}{2}$"),
      o("2", "$1+x+\\dfrac{x^2}{2}+\\dfrac{x^3}{6}$"),
      o("3", "$1+x+x^2+x^3$"),
      o("4", "$x+\\dfrac{x^2}{2}+\\dfrac{x^3}{6}$"),
      o("5", "$1+\\sin x$")
    ],
    answer: "1",
    explanation: "$e^{\\sin x}=1+\\sin x+\\dfrac{\\sin^2 x}{2!}+\\dfrac{\\sin^3 x}{3!}+\\cdots$. $\\sin x=x-\\dfrac{x^3}{6}+\\cdots$ 대입 후 3차까지 정리: $1+x+\\dfrac{x^2}{2}+0\\cdot x^3=1+x+\\dfrac{x^2}{2}$."
  }),
  build({
    testNo: 17, num: 6, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easy",
    question: "$\\displaystyle\\lim_{x\\to 0}\\dfrac{\\log_a(1+x)}{x}$의 값은?",
    options: [
      o("1", "$1$"),
      o("2", "$\\ln a$"),
      o("3", "$\\dfrac{1}{\\ln a}$"),
      o("4", "$a$"),
      o("5", "$\\dfrac{1}{a}$")
    ],
    answer: "3",
    explanation: "$\\log_a(1+x)=\\dfrac{\\ln(1+x)}{\\ln a}$. $\\lim\\dfrac{\\ln(1+x)}{x}=1$이므로 답은 $\\dfrac{1}{\\ln a}$."
  }),

  // ============== Daily TEST 18 (극한) ==============
  build({
    testNo: 18, num: 1, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "극한값 $\\displaystyle\\lim_{x\\to 0}\\dfrac{1}{x}\\ln(2x^3-x^2-2x+1)$을 구하시오.",
    options: [
      o("1", "$-1$"),
      o("2", "$-2$"),
      o("3", "$0$"),
      o("4", "$2$"),
      o("5", "$\\infty$")
    ],
    answer: "2",
    explanation: "$\\ln(1+u)\\approx u$ 사용. $2x^3-x^2-2x+1=1+(-2x-x^2+2x^3)$이므로 $\\ln(\\cdots)\\approx -2x-x^2+\\cdots$. $\\lim\\dfrac{-2x+\\cdots}{x}=-2$."
  }),
  build({
    testNo: 18, num: 2, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "극한 $\\displaystyle\\lim_{x\\to e^e}\\dfrac{\\ln(\\ln(\\ln x))}{e(x-e^e)}$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{e^{e+2}}$"),
      o("2", "$e^{-e-2}$"),
      o("3", "$\\dfrac{1}{e^2}$"),
      o("4", "$\\dfrac{1}{e}$"),
      o("5", "$0$")
    ],
    answer: "2",
    explanation: "로피탈 또는 미분 정의: $\\dfrac{d}{dx}[\\ln\\ln\\ln x]=\\dfrac{1}{\\ln(\\ln x)\\ln x\\cdot x}$. $x=e^e$에서 $\\ln x=e$, $\\ln\\ln x=1$. 분모 $=e^e\\cdot e\\cdot 1=e^{e+1}$. 1/e와 곱: $\\dfrac{1}{e^{e+2}}=e^{-e-2}$."
  }),
  build({
    testNo: 18, num: 3, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easy",
    question: "극한 $\\displaystyle\\lim_{x\\to 0}\\dfrac{e^x-e^{-2x}}{\\sin x}$의 값은?",
    options: [
      o("1", "$1$"),
      o("2", "$2$"),
      o("3", "$3$"),
      o("4", "$-1$"),
      o("5", "$0$")
    ],
    answer: "3",
    explanation: "$e^x-e^{-2x}\\approx(1+x)-(1-2x)=3x$, $\\sin x\\approx x$이므로 비율은 $3$."
  }),
  build({
    testNo: 18, num: 4, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easy",
    question: "극한 $\\displaystyle\\lim_{x\\to 0}\\dfrac{\\sinh^{-1} x}{\\ln(x+1)}$의 값은?",
    options: [
      o("1", "$0$"),
      o("2", "$1$"),
      o("3", "$2$"),
      o("4", "$\\dfrac{1}{2}$"),
      o("5", "$e$")
    ],
    answer: "2",
    explanation: "$\\sinh^{-1}x\\approx x$, $\\ln(1+x)\\approx x$이므로 비율은 $1$."
  }),
  build({
    testNo: 18, num: 5, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "$\\displaystyle\\lim_{x\\to 0}\\dfrac{(1-e^x)\\sqrt{5-e^x}}{(1+x)\\ln(1-x)}$의 값은?",
    options: [
      o("1", "$1$"),
      o("2", "$2$"),
      o("3", "$-2$"),
      o("4", "$\\sqrt{5}$"),
      o("5", "$0$")
    ],
    answer: "2",
    explanation: "$1-e^x\\approx -x$, $\\ln(1-x)\\approx -x$, $\\sqrt{5-e^x}\\to 2$, $1+x\\to 1$. 따라서 $\\dfrac{(-x)\\cdot 2}{1\\cdot(-x)}=2$."
  }),
  build({
    testNo: 18, num: 6, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "$\\displaystyle\\lim_{x\\to\\sqrt{2}}\\dfrac{(x^2+x)\\sin(x-\\sqrt{2})}{x^2-2}$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{2}+\\dfrac{1}{\\sqrt{2}}$"),
      o("2", "$\\dfrac{1}{\\sqrt{2}}$"),
      o("3", "$1+\\sqrt{2}$"),
      o("4", "$\\sqrt{2}$"),
      o("5", "$0$")
    ],
    answer: "1",
    explanation: "$x^2-2=(x-\\sqrt{2})(x+\\sqrt{2})$. $\\sin(x-\\sqrt{2})\\approx x-\\sqrt{2}$. 식 $=\\dfrac{(x^2+x)(x-\\sqrt{2})}{(x-\\sqrt{2})(x+\\sqrt{2})}\\to\\dfrac{2+\\sqrt{2}}{2\\sqrt{2}}=\\dfrac{1}{2}+\\dfrac{1}{\\sqrt{2}}$."
  }),

  // ============== Daily TEST 19 (테일러 응용 극한) ==============
  build({
    testNo: 19, num: 1, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "극한 $\\displaystyle\\lim_{x\\to 0}\\dfrac{\\sin x-\\tan x}{x^3}$의 값은?",
    options: [
      o("1", "$-\\dfrac{1}{2}$"),
      o("2", "$\\dfrac{1}{2}$"),
      o("3", "$-\\dfrac{1}{6}$"),
      o("4", "$\\dfrac{1}{6}$"),
      o("5", "$0$")
    ],
    answer: "1",
    explanation: "$\\sin x=x-\\dfrac{x^3}{6}+\\cdots$, $\\tan x=x+\\dfrac{x^3}{3}+\\cdots$. 차이 $=-\\dfrac{x^3}{2}+\\cdots$이므로 $-\\dfrac{1}{2}$."
  }),
  build({
    testNo: 19, num: 2, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "극한 $\\displaystyle\\lim_{x\\to 0}\\dfrac{\\sin^{-1}(x^2)-x^2}{x^6}$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{6}$"),
      o("2", "$-\\dfrac{1}{6}$"),
      o("3", "$\\dfrac{1}{3}$"),
      o("4", "$0$"),
      o("5", "$\\dfrac{1}{2}$")
    ],
    answer: "1",
    explanation: "$\\sin^{-1}u=u+\\dfrac{u^3}{6}+\\cdots$. $u=x^2$ 대입: $\\sin^{-1}(x^2)=x^2+\\dfrac{x^6}{6}+\\cdots$. 차이/$x^6\\to\\dfrac{1}{6}$."
  }),
  build({
    testNo: 19, num: 3, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "극한 $\\displaystyle\\lim_{x\\to 0}\\dfrac{x-\\tan x}{x-\\sin x}$의 값은?",
    options: [
      o("1", "$-2$"),
      o("2", "$2$"),
      o("3", "$-1$"),
      o("4", "$1$"),
      o("5", "$\\dfrac{1}{2}$")
    ],
    answer: "1",
    explanation: "$x-\\tan x\\approx -\\dfrac{x^3}{3}$, $x-\\sin x\\approx\\dfrac{x^3}{6}$. 비율 $=\\dfrac{-1/3}{1/6}=-2$."
  }),
  build({
    testNo: 19, num: 4, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "극한 $\\displaystyle\\lim_{x\\to 0}\\dfrac{\\tan x-\\sin x}{x^2\\ln(x+1)}$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{2}$"),
      o("2", "$-\\dfrac{1}{2}$"),
      o("3", "$\\dfrac{1}{6}$"),
      o("4", "$1$"),
      o("5", "$0$")
    ],
    answer: "1",
    explanation: "$\\tan x-\\sin x\\approx\\dfrac{x^3}{2}$, $\\ln(1+x)\\approx x$. 분모 $\\approx x^3$. 비율 $=\\dfrac{1}{2}$."
  }),
  build({
    testNo: 19, num: 5, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easy",
    question: "$\\displaystyle\\lim_{x\\to 0^+}\\dfrac{\\ln(\\sin x)}{\\ln(\\tan x)}$의 값은?",
    options: [
      o("1", "$0$"),
      o("2", "$1$"),
      o("3", "$-1$"),
      o("4", "$\\dfrac{1}{2}$"),
      o("5", "$\\infty$")
    ],
    answer: "2",
    explanation: "$x\\to 0^+$: $\\sin x\\to 0$, $\\tan x\\to 0$이라 둘 다 $\\ln\\to-\\infty$. 로피탈로 미분 비율 $\\dfrac{\\cos x/\\sin x}{\\sec^2 x/\\tan x}=\\dfrac{\\cos x\\tan x}{\\sin x\\sec^2 x}=\\dfrac{\\cos^2 x}{1}\\to 1$."
  }),
  build({
    testNo: 19, num: 6, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "$\\displaystyle\\lim_{x\\to\\infty}x\\!\\left(\\tan^{-1}x-\\dfrac{\\pi}{2}\\right)$의 값은?",
    options: [
      o("1", "$-1$"),
      o("2", "$1$"),
      o("3", "$0$"),
      o("4", "$-\\dfrac{\\pi}{2}$"),
      o("5", "$\\dfrac{\\pi}{2}$")
    ],
    answer: "1",
    explanation: "$\\tan^{-1}x-\\dfrac{\\pi}{2}=-\\tan^{-1}\\dfrac{1}{x}\\approx -\\dfrac{1}{x}$ ($x\\to\\infty$). 따라서 $x\\cdot\\!\\left(-\\dfrac{1}{x}\\right)=-1$."
  }),

  // ============== Daily TEST 20 (1^∞ 형태) ==============
  build({
    testNo: 20, num: 1, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "극한 $\\displaystyle\\lim_{x\\to\\infty}\\!\\left\\{x-x^2\\ln\\!\\left(\\dfrac{1+x}{x}\\right)\\right\\}$의 값은?",
    options: [
      o("1", "$0$"),
      o("2", "$\\dfrac{1}{2}$"),
      o("3", "$1$"),
      o("4", "$-\\dfrac{1}{2}$"),
      o("5", "$\\infty$")
    ],
    answer: "2",
    explanation: "$\\ln(1+1/x)=\\dfrac{1}{x}-\\dfrac{1}{2x^2}+\\dfrac{1}{3x^3}-\\cdots$. $x^2\\ln(\\cdots)=x-\\dfrac{1}{2}+\\dfrac{1}{3x}-\\cdots$. 차이 $\\to\\dfrac{1}{2}$."
  }),
  build({
    testNo: 20, num: 2, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "극한 $\\displaystyle\\lim_{x\\to 0}\\!\\left(\\dfrac{1}{\\ln(x+1)}-\\dfrac{1}{x}\\right)$의 값은?",
    options: [
      o("1", "$0$"),
      o("2", "$\\dfrac{1}{2}$"),
      o("3", "$-\\dfrac{1}{2}$"),
      o("4", "$1$"),
      o("5", "$\\infty$")
    ],
    answer: "2",
    explanation: "공통분모: $\\dfrac{x-\\ln(x+1)}{x\\ln(x+1)}$. 분자 $\\approx\\dfrac{x^2}{2}$, 분모 $\\approx x^2$. 비율 $=\\dfrac{1}{2}$."
  }),
  build({
    testNo: 20, num: 3, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easy",
    question: "극한 $\\displaystyle\\lim_{x\\to\\infty}\\!\\left(xe^{1/x}-x\\right)$의 값은?",
    options: [
      o("1", "$0$"),
      o("2", "$1$"),
      o("3", "$\\dfrac{1}{2}$"),
      o("4", "$e$"),
      o("5", "$\\infty$")
    ],
    answer: "2",
    explanation: "$x(e^{1/x}-1)$. $t=\\dfrac{1}{x}\\to 0$. $\\dfrac{e^t-1}{t}\\to 1$이므로 답은 $1$."
  }),
  build({
    testNo: 20, num: 4, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easy",
    question: "극한 $\\displaystyle\\lim_{x\\to\\infty}(\\ln x)^{1/x}$의 값은?",
    options: [
      o("1", "$0$"),
      o("2", "$1$"),
      o("3", "$e$"),
      o("4", "$\\infty$"),
      o("5", "$\\dfrac{1}{e}$")
    ],
    answer: "2",
    explanation: "지수에 로그 취함: $\\dfrac{\\ln(\\ln x)}{x}\\to 0$ ($x\\to\\infty$). 따라서 $e^0=1$."
  }),
  build({
    testNo: 20, num: 5, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "$\\displaystyle\\lim_{x\\to\\infty}(e^x+x)^{1/x}$의 값은?",
    options: [
      o("1", "$1$"),
      o("2", "$e$"),
      o("3", "$e^2$"),
      o("4", "$\\infty$"),
      o("5", "$0$")
    ],
    answer: "2",
    explanation: "$\\dfrac{\\ln(e^x+x)}{x}=\\dfrac{\\ln(e^x(1+xe^{-x}))}{x}=1+\\dfrac{\\ln(1+xe^{-x})}{x}\\to 1$. 따라서 $e^1=e$."
  }),
  build({
    testNo: 20, num: 6, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "$\\displaystyle\\lim_{x\\to\\infty}\\!\\left(\\dfrac{x^2-3x+1}{5x+2}\\right)^{1/(2\\ln x)}$의 값은?",
    options: [
      o("1", "$1$"),
      o("2", "$\\sqrt{e}$"),
      o("3", "$e$"),
      o("4", "$e^2$"),
      o("5", "$\\dfrac{1}{e}$")
    ],
    answer: "2",
    explanation: "지수에 로그: $\\dfrac{\\ln((x^2-3x+1)/(5x+2))}{2\\ln x}\\approx\\dfrac{\\ln x^2-\\ln x}{2\\ln x}=\\dfrac{2\\ln x-\\ln x}{2\\ln x}=\\dfrac{1}{2}$. 따라서 $e^{1/2}=\\sqrt{e}$."
  }),

  // ============== Daily TEST 21 (0^0, ∞^0, 1^∞) ==============
  build({
    testNo: 21, num: 1, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "극한 $\\displaystyle\\lim_{x\\to 0^+}(\\sin^{-1}x)^{1/\\ln x}$의 값은?",
    options: [
      o("1", "$1$"),
      o("2", "$e$"),
      o("3", "$0$"),
      o("4", "$\\dfrac{1}{e}$"),
      o("5", "$\\infty$")
    ],
    answer: "2",
    explanation: "지수에 로그: $\\dfrac{\\ln(\\sin^{-1}x)}{\\ln x}\\to 1$ ($\\sin^{-1}x\\approx x$). 따라서 $e^1=e$."
  }),
  build({
    testNo: 21, num: 2, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "극한 $\\displaystyle\\lim_{x\\to 0^+}(x^3+x\\sin x)^{1/\\ln x}$의 값은?",
    options: [
      o("1", "$e$"),
      o("2", "$e^2$"),
      o("3", "$e^3$"),
      o("4", "$1$"),
      o("5", "$0$")
    ],
    answer: "2",
    explanation: "$\\dfrac{\\ln(x^3+x\\sin x)}{\\ln x}\\approx\\dfrac{\\ln(x^2)}{\\ln x}=\\dfrac{2\\ln x}{\\ln x}=2$ ($x\\sin x\\approx x^2$이 우세). 따라서 $e^2$."
  }),
  build({
    testNo: 21, num: 3, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easy",
    question: "극한 $\\displaystyle\\lim_{x\\to 0^+}x^{2x}$의 값은?",
    options: [
      o("1", "$0$"),
      o("2", "$1$"),
      o("3", "$e$"),
      o("4", "$e^2$"),
      o("5", "$\\infty$")
    ],
    answer: "2",
    explanation: "$\\ln(x^{2x})=2x\\ln x\\to 0$ ($x\\to 0^+$). 따라서 $e^0=1$."
  }),
  build({
    testNo: 21, num: 4, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easy",
    question: "극한 $\\displaystyle\\lim_{x\\to 0}(\\sin x)^x$의 값은?",
    options: [
      o("1", "$0$"),
      o("2", "$1$"),
      o("3", "$e$"),
      o("4", "$\\infty$"),
      o("5", "정의되지 않음")
    ],
    answer: "2",
    explanation: "$x\\ln(\\sin x)$의 극한: $x\\to 0^+$이면 $\\sin x\\approx x$이라 $x\\ln x\\to 0$. 따라서 $e^0=1$."
  }),
  build({
    testNo: 21, num: 5, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "$\\displaystyle\\lim_{n\\to\\infty}\\!\\left(1-\\dfrac{3}{2n-5}\\right)^n$의 값은?",
    options: [
      o("1", "$e^{-3/2}$"),
      o("2", "$e^{-3}$"),
      o("3", "$e^{-1}$"),
      o("4", "$1$"),
      o("5", "$e^{3/2}$")
    ],
    answer: "1",
    explanation: "지수 부분 $-\\dfrac{3n}{2n-5}\\to-\\dfrac{3}{2}$. 따라서 $e^{-3/2}$."
  }),
  build({
    testNo: 21, num: 6, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "상수 $a, b$에 대하여 $\\displaystyle\\lim_{n\\to\\infty}\\!\\left(1+\\dfrac{a}{n}+\\dfrac{b}{n^2}\\right)^n$의 값은?",
    options: [
      o("1", "$e^a$"),
      o("2", "$e^{a+b}$"),
      o("3", "$e^b$"),
      o("4", "$e^{ab}$"),
      o("5", "$1$")
    ],
    answer: "1",
    explanation: "$n\\!\\left(\\dfrac{a}{n}+\\dfrac{b}{n^2}\\right)=a+\\dfrac{b}{n}\\to a$. 따라서 $e^a$."
  }),

  // ============== Daily TEST 22 (1^∞ 계속) ==============
  build({
    testNo: 22, num: 1, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easy",
    question: "극한 $\\displaystyle\\lim_{x\\to 0}(1+\\sin(2x))^{1/x}$의 값은?",
    options: [
      o("1", "$e$"),
      o("2", "$e^2$"),
      o("3", "$e^4$"),
      o("4", "$1$"),
      o("5", "$\\sqrt{e}$")
    ],
    answer: "2",
    explanation: "$\\dfrac{\\sin 2x}{x}\\to 2$이므로 $e^2$."
  }),
  build({
    testNo: 22, num: 2, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "극한 $\\displaystyle\\lim_{x\\to 0+}(1+\\sin 2x)^{\\cot 4x}$의 값은?",
    options: [
      o("1", "$e$"),
      o("2", "$e^2$"),
      o("3", "$\\sqrt{e}$"),
      o("4", "$1$"),
      o("5", "$e^{1/4}$")
    ],
    answer: "3",
    explanation: "지수 $=\\sin 2x\\cdot\\cot 4x=\\dfrac{\\sin 2x\\cos 4x}{\\sin 4x}=\\dfrac{\\sin 2x\\cos 4x}{2\\sin 2x\\cos 2x}\\to\\dfrac{1}{2}$. 따라서 $e^{1/2}=\\sqrt{e}$."
  }),
  build({
    testNo: 22, num: 3, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "극한 $\\displaystyle\\lim_{x\\to 0+}(e^x+\\sin 2x)^{1/x}$의 값은?",
    options: [
      o("1", "$e$"),
      o("2", "$e^2$"),
      o("3", "$e^3$"),
      o("4", "$e^4$"),
      o("5", "$1$")
    ],
    answer: "3",
    explanation: "$e^x+\\sin 2x=1+(x+2x)+O(x^2)=1+3x+\\cdots$. 지수 $\\dfrac{\\ln(1+3x+\\cdots)}{x}\\to 3$. 따라서 $e^3$."
  }),
  build({
    testNo: 22, num: 4, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easy",
    question: "극한 $\\displaystyle\\lim_{x\\to 0}(\\cos x+3x)^{2/x}$의 값은?",
    options: [
      o("1", "$e^3$"),
      o("2", "$e^6$"),
      o("3", "$e^2$"),
      o("4", "$e^9$"),
      o("5", "$1$")
    ],
    answer: "2",
    explanation: "$\\cos x+3x=1+3x+O(x^2)$. 지수 $\\dfrac{2\\cdot 3x}{x}=6$. 따라서 $e^6$."
  }),
  build({
    testNo: 22, num: 5, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "$\\displaystyle\\lim_{x\\to 0+}(1+\\ln(x+1))^{\\cot x}$의 값은?",
    options: [
      o("1", "$1$"),
      o("2", "$e$"),
      o("3", "$e^2$"),
      o("4", "$\\sqrt{e}$"),
      o("5", "$0$")
    ],
    answer: "2",
    explanation: "$\\ln(x+1)\\approx x$, $\\cot x\\approx\\dfrac{1}{x}$. 지수 $\\approx x\\cdot\\dfrac{1}{x}=1$. 따라서 $e^1=e$."
  }),
  build({
    testNo: 22, num: 6, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "$\\displaystyle\\lim_{x\\to\\infty}\\!\\left(\\dfrac{x+\\ln 3}{x-\\ln 3}\\right)^x$의 값은?",
    options: [
      o("1", "$3$"),
      o("2", "$9$"),
      o("3", "$e^{2\\ln 3}$"),
      o("4", "$e^{\\ln 3}$"),
      o("5", "$1$")
    ],
    answer: "2",
    explanation: "$\\dfrac{x+\\ln 3}{x-\\ln 3}=1+\\dfrac{2\\ln 3}{x-\\ln 3}$. 지수 $\\dfrac{2(\\ln 3)x}{x-\\ln 3}\\to 2\\ln 3$. 따라서 $e^{2\\ln 3}=9$."
  }),

  // ============== Daily TEST 23 (다양한 극한) ==============
  build({
    testNo: 23, num: 1, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easy",
    question: "극한 $\\displaystyle\\lim_{x\\to 0+}\\dfrac{\\sin x}{\\sqrt{1+x}-\\sqrt{1-x}}$의 값은?",
    options: [
      o("1", "$0$"),
      o("2", "$1$"),
      o("3", "$\\dfrac{1}{2}$"),
      o("4", "$2$"),
      o("5", "$\\sqrt{2}$")
    ],
    answer: "2",
    explanation: "분모 유리화: $\\sqrt{1+x}-\\sqrt{1-x}=\\dfrac{2x}{\\sqrt{1+x}+\\sqrt{1-x}}\\to\\dfrac{2x}{2}=x$. 비율 $=\\dfrac{\\sin x}{x}\\to 1$."
  }),
  build({
    testNo: 23, num: 2, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "극한 $\\displaystyle\\lim_{x\\to 0+}\\dfrac{\\sqrt{2+\\tan x}-\\sqrt{2+\\sin x}}{x^3}$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{4\\sqrt{2}}$"),
      o("2", "$\\dfrac{1}{2\\sqrt{2}}$"),
      o("3", "$\\dfrac{\\sqrt{2}}{4}$"),
      o("4", "$\\dfrac{1}{4}$"),
      o("5", "$\\dfrac{1}{6}$")
    ],
    answer: "1",
    explanation: "분자 유리화: $\\dfrac{\\tan x-\\sin x}{x^3}\\cdot\\dfrac{1}{\\sqrt{2+\\tan x}+\\sqrt{2+\\sin x}}\\to\\dfrac{1/2}{2\\sqrt{2}}=\\dfrac{1}{4\\sqrt{2}}$."
  }),
  build({
    testNo: 23, num: 3, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easy",
    question: "극한 $\\displaystyle\\lim_{x\\to\\infty}x\\log_2\\!\\left(1+\\dfrac{1}{x}\\right)$의 값은?",
    options: [
      o("1", "$1$"),
      o("2", "$\\log_2 e$"),
      o("3", "$\\dfrac{1}{\\ln 2}$"),
      o("4", "$\\ln 2$"),
      o("5", "$0$")
    ],
    answer: "2",
    explanation: "$\\log_2\\!\\left(1+\\dfrac{1}{x}\\right)^x\\to\\log_2 e=\\dfrac{1}{\\ln 2}$. (옵션 ②와 ③은 같은 값)"
  }),
  build({
    testNo: 23, num: 4, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "상수 $0<a<b$. 극한 $\\displaystyle\\lim_{x\\to\\infty}(a^x+b^x)^{1/x}$의 값은?",
    options: [
      o("1", "$a$"),
      o("2", "$b$"),
      o("3", "$\\dfrac{a+b}{2}$"),
      o("4", "$ab$"),
      o("5", "$\\sqrt{ab}$")
    ],
    answer: "2",
    explanation: "$(a^x+b^x)^{1/x}=b\\cdot((a/b)^x+1)^{1/x}$. $0<a/b<1$이라 $(a/b)^x\\to 0$, $((\\cdots)+1)^{1/x}\\to 1$. 따라서 $b$."
  }),
  build({
    testNo: 23, num: 5, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "$\\displaystyle\\lim_{x\\to 0}\\dfrac{\\tan(2x)}{a\\sin^{-1}x+b}=3$을 만족하는 $a+b$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{3}$"),
      o("2", "$\\dfrac{2}{3}$"),
      o("3", "$1$"),
      o("4", "$\\dfrac{4}{3}$"),
      o("5", "$3$")
    ],
    answer: "2",
    explanation: "$x\\to 0$이면 분자 $\\to 0$이라 분모 $b=0$. $\\dfrac{\\tan 2x}{a\\sin^{-1}x}\\approx\\dfrac{2x}{ax}=\\dfrac{2}{a}=3 \\Rightarrow a=\\dfrac{2}{3}$. $a+b=\\dfrac{2}{3}$."
  }),
  build({
    testNo: 23, num: 6, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "$\\displaystyle\\lim_{x\\to\\pi/2}\\dfrac{\\sin(ax)-1}{x-\\pi/2}=b$를 만족하는 실수 $a, b$가 있다. $a$가 부등호 $2\\le a\\le 5$를 만족할 때, $a+b$의 값은?",
    options: [
      o("1", "$3$"),
      o("2", "$4$"),
      o("3", "$5$"),
      o("4", "$6$"),
      o("5", "$2$")
    ],
    answer: "3",
    explanation: "분자 $\\to 0$이려면 $\\sin(a\\pi/2)=1\\Rightarrow a\\pi/2=\\pi/2+2k\\pi\\Rightarrow a=1,5,\\cdots$. $2\\le a\\le 5$이므로 $a=5$. 미분 정의로 $b=a\\cos(a\\pi/2)=5\\cos(5\\pi/2)=0$. $a+b=5$."
  }),

  // ============== Daily TEST 24 (미분 + 연속/미분가능) ==============
  build({
    testNo: 24, num: 1, unit: "극한과 연속", concept: "함수의 극한", difficulty: "easyMedium",
    question: "극한 $\\displaystyle\\lim_{x\\to\\pi}\\dfrac{(1+x)^{\\sin x}-1}{x-\\pi}$의 값은?",
    options: [
      o("1", "$-\\ln(1+\\pi)$"),
      o("2", "$\\ln(1+\\pi)$"),
      o("3", "$0$"),
      o("4", "$\\pi$"),
      o("5", "$1$")
    ],
    answer: "1",
    explanation: "$f(x)=(1+x)^{\\sin x}$로 두면 미분 정의에 의해 답 $=f'(\\pi)$. $\\ln f=\\sin x\\ln(1+x)$, $f'=f\\!\\left(\\cos x\\ln(1+x)+\\dfrac{\\sin x}{1+x}\\right)$. $x=\\pi$ 대입: $f(\\pi)=(1+\\pi)^0=1$, $\\cos\\pi=-1$, $\\sin\\pi=0$ → $f'(\\pi)=-\\ln(1+\\pi)$."
  }),
  build({
    testNo: 24, num: 2, unit: "극한과 연속", concept: "연속", difficulty: "easyMedium",
    question: "함수 $f(x)$가 $x=0$에서 연속일 때, 상수 $a$의 값은? $f(x)=\\begin{cases}\\dfrac{\\cos 3x-e^{4x}}{x},&x\\ne 0\\\\a,&x=0\\end{cases}$",
    options: [
      o("1", "$-4$"),
      o("2", "$4$"),
      o("3", "$-3$"),
      o("4", "$3$"),
      o("5", "$0$")
    ],
    answer: "1",
    explanation: "$\\cos 3x-e^{4x}\\approx 1-(1+4x)=-4x$이라 비율 $\\to -4$. 연속이려면 $a=-4$."
  }),
  build({
    testNo: 24, num: 3, unit: "극한과 연속", concept: "연속", difficulty: "easyMedium",
    question: "다음 함수 $f$가 $x=1$에서 연속일 때 $a, b$의 값은? $f(x)=\\begin{cases}x^2+2,&x\\le 1\\\\\\dfrac{x^2+ax+b}{x-1},&x>1\\end{cases}$",
    options: [
      o("1", "$a=1, b=-2$"),
      o("2", "$a=-1, b=2$"),
      o("3", "$a=2, b=-1$"),
      o("4", "$a=-2, b=1$"),
      o("5", "$a=0, b=-1$")
    ],
    answer: "1",
    explanation: "우극한이 유한값이려면 $1+a+b=0$. 인수분해 $\\dfrac{x^2+ax+b}{x-1}\\to 2x+a\\big|_{x=1}=2+a$. 좌극한 $1+2=3$이라 $2+a=3 \\Rightarrow a=1, b=-2$."
  }),
  build({
    testNo: 24, num: 4, unit: "미분", concept: "미분", difficulty: "easy",
    question: "$f(x)=\\begin{cases}\\dfrac{\\sin x}{x},&x\\ne 0\\\\1,&x=0\\end{cases}$일 때, $f'(0)$의 값은?",
    options: [
      o("1", "$0$"),
      o("2", "$1$"),
      o("3", "$-1$"),
      o("4", "$\\dfrac{1}{2}$"),
      o("5", "정의되지 않음")
    ],
    answer: "1",
    explanation: "$\\dfrac{\\sin x}{x}=1-\\dfrac{x^2}{6}+\\dfrac{x^4}{120}-\\cdots$이므로 짝함수. $f'(0)=0$."
  }),
  build({
    testNo: 24, num: 5, unit: "미분", concept: "미분가능성", difficulty: "easyMedium",
    question: "$f(x)=\\begin{cases}x^2,&x\\le 3\\\\mx+b,&x>3\\end{cases}$로 정의되어 있다. $f$가 모든 점에서 미분가능할 때 $m+b$의 값을 고르시오.",
    options: [
      o("1", "$-3$"),
      o("2", "$3$"),
      o("3", "$0$"),
      o("4", "$6$"),
      o("5", "$-6$")
    ],
    answer: "1",
    explanation: "연속: $9=3m+b$. 미분가능: $f'(3^-)=6=m$. 따라서 $b=9-18=-9$. $m+b=6+(-9)=-3$."
  }),
  build({
    testNo: 24, num: 6, unit: "미분", concept: "미분가능성", difficulty: "easyMedium",
    question: "다음 함수 $f(x)$가 실수 전체에서 미분 가능할 때 $a+b$의 값은? $f(x)=\\begin{cases}\\dfrac{\\ln(x+1)}{x},&x>0\\\\ax+b,&x\\le 0\\end{cases}$",
    options: [
      o("1", "$\\dfrac{1}{2}$"),
      o("2", "$-\\dfrac{1}{2}$"),
      o("3", "$1$"),
      o("4", "$0$"),
      o("5", "$-1$")
    ],
    answer: "1",
    explanation: "$\\dfrac{\\ln(x+1)}{x}=1-\\dfrac{x}{2}+\\dfrac{x^2}{3}-\\cdots$. $x=0$에서 연속이려면 $b=1$. 미분 $f'(0^+)=-\\dfrac{1}{2}$, 따라서 $a=-\\dfrac{1}{2}$. $a+b=\\dfrac{1}{2}$."
  }),

  // ============== Daily TEST 25 (미분응용 + 다항식 근) ==============
  build({
    testNo: 25, num: 1, unit: "미분", concept: "합성함수 미분", difficulty: "easyMedium",
    question: "$f(x)=e^x\\cos\\pi x$에 대하여, 극한 $\\displaystyle\\lim_{x\\to 0}\\dfrac{f(1+x)-f(1-x)}{x}$의 값은?",
    options: [
      o("1", "$2e$"),
      o("2", "$-2e$"),
      o("3", "$-e$"),
      o("4", "$e$"),
      o("5", "$0$")
    ],
    answer: "2",
    explanation: "극한 $=2f'(1)$. $f'(x)=e^x\\cos\\pi x-\\pi e^x\\sin\\pi x$. $x=1$: $-e-0=-e$. 따라서 $2(-e)=-2e$."
  }),
  build({
    testNo: 25, num: 2, unit: "미분", concept: "역함수 미분", difficulty: "easyMedium",
    question: "$f(x)=2e^x-e^{-x}$의 역함수를 $g(x)$라 할 때, $\\displaystyle\\lim_{x\\to 1}\\dfrac{g(x)}{x-1}$의 값은?",
    options: [
      o("1", "$1$"),
      o("2", "$\\dfrac{1}{2}$"),
      o("3", "$\\dfrac{1}{3}$"),
      o("4", "$\\dfrac{1}{4}$"),
      o("5", "$3$")
    ],
    answer: "3",
    explanation: "$f(0)=2-1=1$이라 $g(1)=0$. 극한 $=g'(1)=\\dfrac{1}{f'(0)}$. $f'(x)=2e^x+e^{-x}$, $f'(0)=3$. 답 $=\\dfrac{1}{3}$."
  }),
  build({
    testNo: 25, num: 3, unit: "미분", concept: "역함수 미분", difficulty: "easyMedium",
    question: "함수 $f(x)=2x+\\sin x$에 대하여, $\\displaystyle\\lim_{t\\to 0}\\dfrac{f^{-1}(2t)}{t}$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{3}$"),
      o("2", "$\\dfrac{2}{3}$"),
      o("3", "$2$"),
      o("4", "$1$"),
      o("5", "$3$")
    ],
    answer: "2",
    explanation: "$f(0)=0$이라 $f^{-1}(0)=0$. 극한 $=2(f^{-1})'(0)=\\dfrac{2}{f'(0)}=\\dfrac{2}{2+1}=\\dfrac{2}{3}$."
  }),
  build({
    testNo: 25, num: 4, unit: "곡선의 개형", concept: "함수의 증가·감소", difficulty: "easyMedium",
    question: "$f(x)=2x^3-3ax^2+6ax-6x-1$이 감소하는 $x$의 구간이 $[1, 10]$일 때, 상수 $a$의 값은 얼마인가?",
    options: [
      o("1", "$10$"),
      o("2", "$11$"),
      o("3", "$5$"),
      o("4", "$\\dfrac{11}{2}$"),
      o("5", "$9$")
    ],
    answer: "2",
    explanation: "$f'(x)=6x^2-6ax+6a-6=6(x^2-ax+a-1)\\le 0$. $x^2-ax+a-1=(x-1)(x-(a-1))$. 두 근 $1$과 $a-1$이라 $a-1=10\\Rightarrow a=11$."
  }),
  build({
    testNo: 25, num: 5, unit: "곡선의 개형", concept: "함수의 증가·감소", difficulty: "easy",
    question: "방정식 $4x^5+2x^3+8x-10=0$의 실근의 개수를 구하면?",
    options: [
      o("1", "$1$"),
      o("2", "$2$"),
      o("3", "$3$"),
      o("4", "$0$"),
      o("5", "$5$")
    ],
    answer: "1",
    explanation: "$f'(x)=20x^4+6x^2+8>0$이라 $f$는 증가함수. 따라서 실근 1개."
  }),
  build({
    testNo: 25, num: 6, unit: "곡선의 개형", concept: "함수의 증가·감소", difficulty: "easyMedium",
    question: "방정식 $x^5-2x^3+9x-10=0$의 실근의 개수는? (단, 중근은 1개로 간주함)",
    options: [
      o("1", "$1$"),
      o("2", "$2$"),
      o("3", "$3$"),
      o("4", "$5$"),
      o("5", "$0$")
    ],
    answer: "1",
    explanation: "$f'(x)=5x^4-6x^2+9$. $t=x^2\\ge 0$로 두면 $5t^2-6t+9$의 판별식 $D/4=9-45<0$이라 $f'>0$. 증가함수 → 실근 1개."
  })
];

console.log(`Inserting ${problems.length} daily-test problems (DT16~DT25)...`);

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
