// Upload 적분학 Daily TEST 1~10 (60 problems) to Supabase.
// All tagged "daily" + "daily-test-int-{N}", subject="적분학", difficulty=easy/easyMedium.
// Usage: node scripts/upload_daily_tests_int_1to10.mjs
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
  const id = `q-daily-int-r${testNo}-${num}`;
  const tagSet = new Set(["daily", `daily-test-int-${testNo}`, "적분학", unit, concept].filter(Boolean));
  const tags = Array.from(tagSet);
  return {
    id,
    subject: "적분학",
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
  // ============== Daily TEST 1 (적분) — 기본 적분 ==============
  build({
    testNo: 1, num: 1, unit: "정적분의 계산", concept: "기본 적분", difficulty: "easy",
    question: "$\\displaystyle\\int_0^1\\dfrac{1}{\\sqrt{1-x^2}}\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{\\pi}{6}$"),
      o("2", "$\\dfrac{\\pi}{4}$"),
      o("3", "$\\dfrac{\\pi}{3}$"),
      o("4", "$\\dfrac{\\pi}{2}$"),
      o("5", "$\\pi$")
    ],
    answer: "4",
    explanation: "$\\int\\dfrac{1}{\\sqrt{1-x^2}}\\,dx=\\sin^{-1}x+C$. $[\\sin^{-1}x]_0^1=\\dfrac{\\pi}{2}-0=\\dfrac{\\pi}{2}$."
  }),
  build({
    testNo: 1, num: 2, unit: "정적분의 계산", concept: "기본 적분", difficulty: "easy",
    question: "$\\displaystyle\\int_0^1\\dfrac{1}{\\sqrt{1+x^2}}\\,dx$의 값을 구하면?",
    options: [
      o("1", "$\\ln 2$"),
      o("2", "$\\ln(1+\\sqrt{2})$"),
      o("3", "$\\sinh^{-1}(2)$"),
      o("4", "$\\dfrac{\\pi}{4}$"),
      o("5", "$\\sqrt{2}$")
    ],
    answer: "2",
    explanation: "$\\int\\dfrac{1}{\\sqrt{1+x^2}}\\,dx=\\ln(x+\\sqrt{x^2+1})+C$. $[\\ln(x+\\sqrt{x^2+1})]_0^1=\\ln(1+\\sqrt{2})$."
  }),
  build({
    testNo: 1, num: 3, unit: "정적분의 계산", concept: "삼각함수 적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^{\\pi/4}(\\tan\\theta-\\theta)\\,d\\theta$의 값은?",
    options: [
      o("1", "$\\ln\\sqrt{2}-\\dfrac{\\pi^2}{32}$"),
      o("2", "$\\ln 2-\\dfrac{\\pi^2}{16}$"),
      o("3", "$\\ln\\sqrt{2}+\\dfrac{\\pi^2}{32}$"),
      o("4", "$1-\\dfrac{\\pi^2}{32}$"),
      o("5", "$\\dfrac{\\pi}{4}$")
    ],
    answer: "1",
    explanation: "$\\int\\tan\\theta\\,d\\theta=\\ln|\\sec\\theta|+C$. $[\\ln|\\sec\\theta|-\\dfrac{\\theta^2}{2}]_0^{\\pi/4}=\\ln\\sqrt{2}-\\dfrac{\\pi^2}{32}$."
  }),
  build({
    testNo: 1, num: 4, unit: "정적분의 계산", concept: "치환적분", difficulty: "easy",
    question: "$\\displaystyle\\int_4^{12}\\dfrac{1}{\\sqrt{1+2x}}\\,dx$의 값은?",
    options: [
      o("1", "$1$"),
      o("2", "$2$"),
      o("3", "$3$"),
      o("4", "$4$"),
      o("5", "$\\sqrt{2}$")
    ],
    answer: "2",
    explanation: "$\\int(1+2x)^{-1/2}\\,dx=\\sqrt{1+2x}+C$. $[\\sqrt{1+2x}]_4^{12}=5-3=2$."
  }),
  build({
    testNo: 1, num: 5, unit: "정적분의 계산", concept: "치환적분", difficulty: "easy",
    question: "$\\displaystyle\\int_3^4\\dfrac{x}{\\sqrt{x^2-4}}\\,dx$의 값은?",
    options: [
      o("1", "$2\\sqrt{3}-\\sqrt{5}$"),
      o("2", "$\\sqrt{12}+\\sqrt{5}$"),
      o("3", "$\\sqrt{5}-2\\sqrt{3}$"),
      o("4", "$\\sqrt{12}$"),
      o("5", "$1$")
    ],
    answer: "1",
    explanation: "$\\int\\dfrac{x}{\\sqrt{x^2-4}}\\,dx=\\sqrt{x^2-4}+C$. $[\\sqrt{x^2-4}]_3^4=\\sqrt{12}-\\sqrt{5}=2\\sqrt{3}-\\sqrt{5}$."
  }),
  build({
    testNo: 1, num: 6, unit: "정적분의 계산", concept: "치환적분", difficulty: "easy",
    question: "$\\displaystyle\\int_0^{\\sqrt{3}}x\\sqrt{x^2+1}\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{7}{3}$"),
      o("2", "$\\dfrac{8}{3}$"),
      o("3", "$\\dfrac{1}{3}$"),
      o("4", "$2\\sqrt{3}$"),
      o("5", "$\\dfrac{14}{3}$")
    ],
    answer: "1",
    explanation: "$u=x^2+1$ 치환: $\\dfrac{1}{2}\\cdot\\dfrac{2}{3}[(x^2+1)^{3/2}]_0^{\\sqrt{3}}=\\dfrac{1}{3}(8-1)=\\dfrac{7}{3}$."
  }),

  // ============== Daily TEST 2 (적분) — 치환적분 응용 ==============
  build({
    testNo: 2, num: 1, unit: "정적분의 계산", concept: "치환적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_{1/2}^{e/2}\\dfrac{\\ln(2x)}{x}\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{4}$"),
      o("2", "$\\dfrac{1}{2}$"),
      o("3", "$1$"),
      o("4", "$\\ln 2$"),
      o("5", "$e-1$")
    ],
    answer: "2",
    explanation: "$t=\\ln(2x)$, $dt=\\dfrac{1}{x}dx$. 구간 $[0, 1]$. $\\int_0^1 t\\,dt=\\dfrac{1}{2}$."
  }),
  build({
    testNo: 2, num: 2, unit: "정적분의 계산", concept: "치환적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_1^{e^\\pi}\\dfrac{\\sin(\\ln x)}{x}\\,dx$의 값은?",
    options: [
      o("1", "$0$"),
      o("2", "$1$"),
      o("3", "$2$"),
      o("4", "$\\pi$"),
      o("5", "$\\dfrac{\\pi}{2}$")
    ],
    answer: "3",
    explanation: "$t=\\ln x$, $dt=\\dfrac{1}{x}dx$. 구간 $[0, \\pi]$. $\\int_0^\\pi\\sin t\\,dt=[-\\cos t]_0^\\pi=2$."
  }),
  build({
    testNo: 2, num: 3, unit: "정적분의 계산", concept: "치환적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^1 x\\sin(x^2+1)\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{\\cos 1-\\cos 2}{2}$"),
      o("2", "$\\dfrac{\\cos 2-\\cos 1}{2}$"),
      o("3", "$\\sin 1-\\sin 2$"),
      o("4", "$\\dfrac{\\sin 2}{2}$"),
      o("5", "$0$")
    ],
    answer: "1",
    explanation: "$u=x^2+1$, $du=2x\\,dx$. $\\dfrac{1}{2}\\int_1^2\\sin u\\,du=\\dfrac{1}{2}[-\\cos u]_1^2=\\dfrac{\\cos 1-\\cos 2}{2}$."
  }),
  build({
    testNo: 2, num: 4, unit: "정적분의 계산", concept: "치환적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_{1/2}^{\\sqrt{3}/2}\\dfrac{1}{\\sqrt{1-x^2}\\,\\sin^{-1}x}\\,dx$의 값은?",
    options: [
      o("1", "$\\ln 2$"),
      o("2", "$\\ln 3$"),
      o("3", "$\\dfrac{1}{2}\\ln 2$"),
      o("4", "$\\ln\\dfrac{3}{2}$"),
      o("5", "$1$")
    ],
    answer: "1",
    explanation: "$t=\\sin^{-1}x$, $dt=\\dfrac{1}{\\sqrt{1-x^2}}dx$. 구간 $[\\pi/6, \\pi/3]$. $\\int\\dfrac{1}{t}dt=[\\ln t]_{\\pi/6}^{\\pi/3}=\\ln 2$."
  }),
  build({
    testNo: 2, num: 5, unit: "정적분의 성질", concept: "기우함수 적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_{-1/2}^{1/2}\\dfrac{x^2\\sin^{-1}x-6\\cos^{-1}x}{\\sqrt{1-x^2}}\\,dx$의 값은?",
    options: [
      o("1", "$0$"),
      o("2", "$-\\pi$"),
      o("3", "$\\pi$"),
      o("4", "$-\\pi^2$"),
      o("5", "$\\pi^2$")
    ],
    answer: "2",
    explanation: "$\\dfrac{x^2\\sin^{-1}x}{\\sqrt{1-x^2}}$은 기함수 → 적분 0. $-6\\int_{-1/2}^{1/2}\\dfrac{\\cos^{-1}x}{\\sqrt{1-x^2}}dx=-6\\cdot 2\\int_0^{1/2}\\dfrac{\\pi/2}{\\sqrt{1-x^2}}dx=-\\pi$."
  }),
  build({
    testNo: 2, num: 6, unit: "정적분의 계산", concept: "치환적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^{1/2}\\dfrac{e^{\\sin^{-1}x}}{\\sqrt{1-x^2}}\\,dx$의 값은?",
    options: [
      o("1", "$e^{\\pi/6}-1$"),
      o("2", "$e^{\\pi/6}+1$"),
      o("3", "$e^{\\pi/3}-1$"),
      o("4", "$1-e^{-\\pi/6}$"),
      o("5", "$1$")
    ],
    answer: "1",
    explanation: "$t=\\sin^{-1}x$. $\\int_0^{\\pi/6}e^t\\,dt=[e^t]_0^{\\pi/6}=e^{\\pi/6}-1$."
  }),

  // ============== Daily TEST 3 (적분) — 정적분 성질 + 치환 ==============
  build({
    testNo: 3, num: 1, unit: "정적분의 계산", concept: "치환적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_{1/2}^{1/\\sqrt{2}}\\dfrac{x}{\\sqrt{1-4x^4}}\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{\\pi}{12}$"),
      o("2", "$\\dfrac{\\pi}{6}$"),
      o("3", "$\\dfrac{\\pi}{4}$"),
      o("4", "$\\dfrac{\\pi}{8}$"),
      o("5", "$\\dfrac{\\pi}{24}$")
    ],
    answer: "1",
    explanation: "$t=2x^2$, $dt=4x\\,dx$. $\\dfrac{1}{4}\\int_{1/2}^1\\dfrac{1}{\\sqrt{1-t^2}}dt=\\dfrac{1}{4}[\\sin^{-1}t]_{1/2}^1=\\dfrac{1}{4}(\\dfrac{\\pi}{2}-\\dfrac{\\pi}{6})=\\dfrac{\\pi}{12}$."
  }),
  build({
    testNo: 3, num: 2, unit: "정적분의 성질", concept: "치환과 정적분", difficulty: "easyMedium",
    question: "함수 $f(x)$가 연속이고 $\\displaystyle\\int_0^8 f(x)\\,dx=3$을 만족할 때, $\\displaystyle\\int_0^2 x^2 f(x^3)\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{2}$"),
      o("2", "$\\dfrac{2}{3}$"),
      o("3", "$1$"),
      o("4", "$\\dfrac{3}{2}$"),
      o("5", "$3$")
    ],
    answer: "3",
    explanation: "$t=x^3$, $dt=3x^2\\,dx$. $\\int_0^2 x^2 f(x^3)\\,dx=\\dfrac{1}{3}\\int_0^8 f(t)\\,dt=\\dfrac{1}{3}\\cdot 3=1$."
  }),
  build({
    testNo: 3, num: 3, unit: "정적분의 성질", concept: "구간 가법성", difficulty: "easyMedium",
    question: "연속함수 $f(x)$에 대하여 $\\displaystyle\\int_0^2 f(x)dx=3$, $\\displaystyle\\int_2^6 f(x)dx=9$, $\\displaystyle\\int_4^6 f(x)dx=2$일 때, $\\displaystyle\\int_0^2 f(2x)\\,dx$의 값은?",
    options: [
      o("1", "$3$"),
      o("2", "$5$"),
      o("3", "$7$"),
      o("4", "$10$"),
      o("5", "$12$")
    ],
    answer: "2",
    explanation: "$\\int_0^6 f=3+9=12$. $\\int_0^4 f=12-2=10$. $\\int_0^2 f(2x)dx=\\dfrac{1}{2}\\int_0^4 f(u)du=5$."
  }),
  build({
    testNo: 3, num: 4, unit: "정적분의 계산", concept: "삼각치환", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^{1/2}\\sqrt{1-x^2}\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{\\pi}{12}+\\dfrac{\\sqrt{3}}{8}$"),
      o("2", "$\\dfrac{\\pi}{6}+\\dfrac{\\sqrt{3}}{4}$"),
      o("3", "$\\dfrac{\\pi}{12}-\\dfrac{\\sqrt{3}}{8}$"),
      o("4", "$\\dfrac{\\pi}{4}$"),
      o("5", "$\\dfrac{\\sqrt{3}}{8}$")
    ],
    answer: "1",
    explanation: "$x=\\sin\\theta$. $\\int_0^{\\pi/6}\\cos^2\\theta\\,d\\theta=\\dfrac{1}{2}[\\theta+\\dfrac{\\sin 2\\theta}{2}]_0^{\\pi/6}=\\dfrac{\\pi}{12}+\\dfrac{\\sqrt{3}}{8}$."
  }),
  build({
    testNo: 3, num: 5, unit: "정적분의 계산", concept: "삼각치환", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^{1/2}\\dfrac{x^2}{\\sqrt{1-x^2}}\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{\\pi}{12}+\\dfrac{\\sqrt{3}}{8}$"),
      o("2", "$\\dfrac{\\pi}{12}-\\dfrac{\\sqrt{3}}{8}$"),
      o("3", "$\\dfrac{\\pi}{6}$"),
      o("4", "$\\dfrac{\\sqrt{3}}{4}$"),
      o("5", "$\\dfrac{\\pi}{4}-\\dfrac{\\sqrt{3}}{8}$")
    ],
    answer: "2",
    explanation: "$x=\\sin\\theta$. $\\int_0^{\\pi/6}\\sin^2\\theta\\,d\\theta=\\dfrac{1}{2}[\\theta-\\dfrac{\\sin 2\\theta}{2}]_0^{\\pi/6}=\\dfrac{\\pi}{12}-\\dfrac{\\sqrt{3}}{8}$."
  }),
  build({
    testNo: 3, num: 6, unit: "정적분의 계산", concept: "삼각치환", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^{2\\sqrt{3}}\\dfrac{x^3}{\\sqrt{16-x^2}}\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{40}{3}$"),
      o("2", "$\\dfrac{20}{3}$"),
      o("3", "$\\dfrac{16}{3}$"),
      o("4", "$\\dfrac{8}{3}$"),
      o("5", "$\\dfrac{32}{3}$")
    ],
    answer: "1",
    explanation: "$x=4\\sin\\theta$, $\\int_0^{\\pi/3}\\dfrac{64\\sin^3\\theta}{4\\cos\\theta}\\cdot 4\\cos\\theta\\,d\\theta=64\\int_0^{\\pi/3}\\sin^3\\theta\\,d\\theta=64[-\\cos\\theta+\\cos^3\\theta/3]_0^{\\pi/3}=\\dfrac{40}{3}$."
  }),

  // ============== Daily TEST 4 (적분) — 부분분수 + 부분적분 ==============
  build({
    testNo: 4, num: 1, unit: "정적분의 계산", concept: "선형 분리", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^{1/2}\\dfrac{3x+2}{\\sqrt{1-x^2}}\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{3(2-\\sqrt{3})}{2}+\\dfrac{\\pi}{3}$"),
      o("2", "$3(2-\\sqrt{3})+\\dfrac{\\pi}{6}$"),
      o("3", "$\\dfrac{3\\sqrt{3}}{2}+\\dfrac{\\pi}{3}$"),
      o("4", "$\\dfrac{\\pi}{3}+1$"),
      o("5", "$\\dfrac{\\pi}{6}$")
    ],
    answer: "1",
    explanation: "$\\int\\dfrac{3x}{\\sqrt{1-x^2}}=-3\\sqrt{1-x^2}$, $\\int\\dfrac{2}{\\sqrt{1-x^2}}=2\\sin^{-1}x$. $[-3\\sqrt{1-x^2}+2\\sin^{-1}x]_0^{1/2}=\\dfrac{3(2-\\sqrt{3})}{2}+\\dfrac{\\pi}{3}$."
  }),
  build({
    testNo: 4, num: 2, unit: "정적분의 계산", concept: "삼각치환", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^1\\dfrac{x+1}{(x^2+1)^2}\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{\\pi}{8}+\\dfrac{1}{2}$"),
      o("2", "$\\dfrac{\\pi}{8}+\\dfrac{1}{4}$"),
      o("3", "$\\dfrac{\\pi}{4}+\\dfrac{1}{2}$"),
      o("4", "$\\dfrac{\\pi}{8}$"),
      o("5", "$\\dfrac{1}{2}$")
    ],
    answer: "1",
    explanation: "$\\int\\dfrac{x}{(x^2+1)^2}=-\\dfrac{1}{2(x^2+1)}$, 합: $[-\\dfrac{1}{2(x^2+1)}]_0^1+\\int_0^1\\dfrac{1}{(x^2+1)^2}dx$. 두 번째는 $x=\\tan\\theta$로 $\\int_0^{\\pi/4}\\cos^2\\theta\\,d\\theta=\\dfrac{\\pi}{8}+\\dfrac{1}{4}$. 합 $=\\dfrac{1}{4}+\\dfrac{\\pi}{8}+\\dfrac{1}{4}=\\dfrac{\\pi}{8}+\\dfrac{1}{2}$."
  }),
  build({
    testNo: 4, num: 3, unit: "정적분의 계산", concept: "삼각치환", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_{-2}^{-1}\\dfrac{x}{(x^2+4x+5)^2}\\,dx$의 값은?",
    options: [
      o("1", "$-\\dfrac{\\pi+1}{4}$"),
      o("2", "$\\dfrac{\\pi+1}{4}$"),
      o("3", "$-\\dfrac{\\pi}{4}$"),
      o("4", "$-\\dfrac{1}{4}$"),
      o("5", "$0$")
    ],
    answer: "1",
    explanation: "$x+2=\\tan\\theta$. 식 $=\\int_{-\\pi/4}^0\\dfrac{\\tan\\theta-2}{\\sec^4\\theta}\\sec^2\\theta\\,d\\theta=\\int_{-\\pi/4}^0(\\tan\\theta\\cos^2\\theta-2\\cos^2\\theta)\\,d\\theta=-\\dfrac{1}{4}-\\dfrac{\\pi}{4}=-\\dfrac{\\pi+1}{4}$."
  }),
  build({
    testNo: 4, num: 4, unit: "정적분의 계산", concept: "부분적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^1 x^2 e^{-x}\\,dx$의 값은?",
    options: [
      o("1", "$2-\\dfrac{5}{e}$"),
      o("2", "$\\dfrac{5}{e}-2$"),
      o("3", "$2+\\dfrac{5}{e}$"),
      o("4", "$1-\\dfrac{2}{e}$"),
      o("5", "$\\dfrac{1}{e}$")
    ],
    answer: "1",
    explanation: "두 번 부분적분. $[-x^2e^{-x}-2xe^{-x}-2e^{-x}]_0^1=-e^{-1}-2e^{-1}-2e^{-1}+2=-5e^{-1}+2$."
  }),
  build({
    testNo: 4, num: 5, unit: "정적분의 계산", concept: "부분적분", difficulty: "easy",
    question: "$\\displaystyle\\int_0^\\pi(x+1)\\sin x\\,dx$의 값은?",
    options: [
      o("1", "$\\pi+1$"),
      o("2", "$\\pi+2$"),
      o("3", "$\\pi$"),
      o("4", "$2\\pi$"),
      o("5", "$2$")
    ],
    answer: "2",
    explanation: "$u=x+1$, $dv=\\sin x\\,dx$. $[-(x+1)\\cos x+\\sin x]_0^\\pi=(\\pi+1)+1=\\pi+2$."
  }),
  build({
    testNo: 4, num: 6, unit: "정적분의 계산", concept: "부분적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_{\\pi/2}^\\pi x\\cos 3x\\,dx=\\dfrac{\\pi}{a}+\\dfrac{1}{b}$일 때, $a+b$의 값은?",
    options: [
      o("1", "$15$"),
      o("2", "$-3$"),
      o("3", "$3$"),
      o("4", "$0$"),
      o("5", "$-15$")
    ],
    answer: "2",
    explanation: "부분적분: $[\\dfrac{x\\sin 3x}{3}+\\dfrac{\\cos 3x}{9}]_{\\pi/2}^\\pi=\\dfrac{\\pi}{6}-\\dfrac{1}{9}$이므로 $a=6, b=-9$. $a+b=-3$."
  }),

  // ============== Daily TEST 5 (적분) — 부분적분 ==============
  build({
    testNo: 5, num: 1, unit: "정적분의 계산", concept: "부분적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^{1/2}\\cos^{-1}x\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{\\pi}{6}+1-\\dfrac{\\sqrt{3}}{2}$"),
      o("2", "$\\dfrac{\\pi}{6}-1+\\dfrac{\\sqrt{3}}{2}$"),
      o("3", "$\\dfrac{\\pi}{12}$"),
      o("4", "$\\dfrac{\\pi}{3}-\\dfrac{\\sqrt{3}}{2}$"),
      o("5", "$1$")
    ],
    answer: "1",
    explanation: "$u=\\cos^{-1}x$, $dv=dx$. $[x\\cos^{-1}x]_0^{1/2}+\\int_0^{1/2}\\dfrac{x}{\\sqrt{1-x^2}}dx=\\dfrac{\\pi}{6}+[-\\sqrt{1-x^2}]_0^{1/2}=\\dfrac{\\pi}{6}+1-\\dfrac{\\sqrt{3}}{2}$."
  }),
  build({
    testNo: 5, num: 2, unit: "정적분의 계산", concept: "부분적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^{1/2}\\!\\left(\\sin^{-1}x+\\dfrac{x}{\\sqrt{1-x^2}}\\right)dx$의 값은?",
    options: [
      o("1", "$\\dfrac{\\pi}{12}$"),
      o("2", "$\\dfrac{\\pi}{6}$"),
      o("3", "$\\dfrac{\\pi}{4}$"),
      o("4", "$\\dfrac{\\pi}{12}+1$"),
      o("5", "$1$")
    ],
    answer: "1",
    explanation: "$\\int\\sin^{-1}x\\,dx=x\\sin^{-1}x+\\sqrt{1-x^2}$. 그리고 $\\int\\dfrac{x}{\\sqrt{1-x^2}}dx=-\\sqrt{1-x^2}$. 합치면 $[x\\sin^{-1}x]_0^{1/2}=\\dfrac{1}{2}\\cdot\\dfrac{\\pi}{6}=\\dfrac{\\pi}{12}$."
  }),
  build({
    testNo: 5, num: 3, unit: "정적분의 계산", concept: "부분적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^1\\tan^{-1}x\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{\\pi}{4}-\\dfrac{1}{2}\\ln 2$"),
      o("2", "$\\dfrac{\\pi}{4}+\\dfrac{1}{2}\\ln 2$"),
      o("3", "$\\dfrac{\\pi}{4}-\\ln 2$"),
      o("4", "$\\dfrac{\\pi}{2}-\\ln 2$"),
      o("5", "$1$")
    ],
    answer: "1",
    explanation: "$u=\\tan^{-1}x$, $dv=dx$. $[x\\tan^{-1}x]_0^1-\\int_0^1\\dfrac{x}{1+x^2}dx=\\dfrac{\\pi}{4}-\\dfrac{1}{2}\\ln 2$."
  }),
  build({
    testNo: 5, num: 4, unit: "정적분의 계산", concept: "부분적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^{\\pi/2}e^{2x}\\sin x\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{1+2e^\\pi}{5}$"),
      o("2", "$\\dfrac{2+e^\\pi}{5}$"),
      o("3", "$\\dfrac{e^\\pi-1}{5}$"),
      o("4", "$\\dfrac{1+e^\\pi}{2}$"),
      o("5", "$\\dfrac{1}{5}$")
    ],
    answer: "1",
    explanation: "공식 $\\int e^{ax}\\sin bx\\,dx=\\dfrac{e^{ax}}{a^2+b^2}(a\\sin bx-b\\cos bx)$. $[\\dfrac{e^{2x}}{5}(2\\sin x-\\cos x)]_0^{\\pi/2}=\\dfrac{e^\\pi\\cdot 2}{5}-\\dfrac{-1}{5}=\\dfrac{1+2e^\\pi}{5}$."
  }),
  build({
    testNo: 5, num: 5, unit: "정적분의 계산", concept: "부분적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_\\pi^0 2e^x\\cos x\\,dx$의 값은?",
    options: [
      o("1", "$1+e^\\pi$"),
      o("2", "$1-e^\\pi$"),
      o("3", "$-(1+e^\\pi)$"),
      o("4", "$e^\\pi$"),
      o("5", "$1$")
    ],
    answer: "1",
    explanation: "$\\int e^x\\cos x\\,dx=\\dfrac{e^x}{2}(\\cos x+\\sin x)$. $\\int_\\pi^0 2e^x\\cos x\\,dx=[e^x(\\cos x+\\sin x)]_\\pi^0=1-(-e^\\pi)=1+e^\\pi$."
  }),
  build({
    testNo: 5, num: 6, unit: "정적분의 계산", concept: "부분적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_1^4\\sqrt{x}\\ln x\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{32}{3}\\ln 2-\\dfrac{28}{9}$"),
      o("2", "$\\dfrac{16}{3}\\ln 2-\\dfrac{14}{9}$"),
      o("3", "$\\dfrac{32}{3}\\ln 2$"),
      o("4", "$\\dfrac{14}{9}$"),
      o("5", "$\\dfrac{28}{9}\\ln 2$")
    ],
    answer: "1",
    explanation: "$u=\\ln x$, $dv=x^{1/2}\\,dx$. $[\\dfrac{2}{3}x^{3/2}\\ln x-\\dfrac{4}{9}x^{3/2}]_1^4=\\dfrac{16}{3}\\ln 4-\\dfrac{32-4}{9}=\\dfrac{32}{3}\\ln 2-\\dfrac{28}{9}$."
  }),

  // ============== Daily TEST 6 (적분) — 부정적분 + 정적분 활용 ==============
  build({
    testNo: 6, num: 1, unit: "정적분의 계산", concept: "부분적분", difficulty: "easyMedium",
    question: "실수 $a, b$에 대하여 $(1, \\infty)$에서 정의된 함수 $f$는 $f'(x)=\\dfrac{1}{x^2\\ln x}$, $f(e)=a$, $f(e^e)=b$를 만족한다. $\\displaystyle\\int_e^{e^e} f(x)\\,dx$의 값은?",
    options: [
      o("1", "$be^e-ae-1$"),
      o("2", "$be^e-ae$"),
      o("3", "$be^e+ae-1$"),
      o("4", "$ae^e-be-1$"),
      o("5", "$0$")
    ],
    answer: "1",
    explanation: "부분적분: $[xf(x)]_e^{e^e}-\\int_e^{e^e}xf'(x)dx=e^e b-ea-\\int_e^{e^e}\\dfrac{1}{x\\ln x}dx=e^e b-ea-[\\ln(\\ln x)]_e^{e^e}=be^e-ae-1$."
  }),
  build({
    testNo: 6, num: 2, unit: "정적분의 계산", concept: "부분적분", difficulty: "easyMedium",
    question: "구간 $[0, 3]$에서 $f, f'$이 연속이고 $f(3)=-2$, $\\displaystyle\\int_0^3 [f(x)]^2\\,dx=5$일 때, $\\displaystyle\\int_0^3 xf(x)f'(x)\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{7}{2}$"),
      o("2", "$\\dfrac{5}{2}$"),
      o("3", "$3$"),
      o("4", "$\\dfrac{9}{2}$"),
      o("5", "$\\dfrac{1}{2}$")
    ],
    answer: "1",
    explanation: "$u=x$, $dv=f(x)f'(x)dx$ → $v=\\dfrac{1}{2}f^2$. $\\dfrac{1}{2}[xf^2]_0^3-\\dfrac{1}{2}\\int_0^3 f^2dx=\\dfrac{1}{2}\\cdot 3\\cdot 4-\\dfrac{5}{2}=\\dfrac{7}{2}$."
  }),
  build({
    testNo: 6, num: 3, unit: "부정적분", concept: "삼각함수 적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int\\sin 5x\\sin 3x\\,dx$의 값은?",
    options: [
      o("1", "$-\\dfrac{\\sin 8x}{16}+\\dfrac{\\sin 2x}{4}+C$"),
      o("2", "$\\dfrac{\\sin 8x}{16}-\\dfrac{\\sin 2x}{4}+C$"),
      o("3", "$\\dfrac{\\cos 8x}{16}+\\dfrac{\\cos 2x}{4}+C$"),
      o("4", "$-\\dfrac{\\cos 5x\\cos 3x}{15}+C$"),
      o("5", "$\\dfrac{\\sin 8x-\\sin 2x}{2}+C$")
    ],
    answer: "1",
    explanation: "곱-합 공식: $\\sin A\\sin B=\\dfrac{1}{2}(\\cos(A-B)-\\cos(A+B))$. $\\sin 5x\\sin 3x=\\dfrac{1}{2}(\\cos 2x-\\cos 8x)$. 적분 $=\\dfrac{\\sin 2x}{4}-\\dfrac{\\sin 8x}{16}+C$."
  }),
  build({
    testNo: 6, num: 4, unit: "정적분의 계산", concept: "삼각함수 적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^{2\\pi}\\cos 2x\\cos^2 x\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{\\pi}{2}$"),
      o("2", "$\\pi$"),
      o("3", "$0$"),
      o("4", "$2\\pi$"),
      o("5", "$-\\dfrac{\\pi}{2}$")
    ],
    answer: "1",
    explanation: "$\\cos^2 x=\\dfrac{1+\\cos 2x}{2}$. $\\cos 2x\\cos^2 x=\\dfrac{\\cos 2x+\\cos^2 2x}{2}=\\dfrac{\\cos 2x}{2}+\\dfrac{1+\\cos 4x}{4}$. 적분 $\\int_0^{2\\pi}=\\dfrac{1}{4}\\cdot 2\\pi=\\dfrac{\\pi}{2}$."
  }),
  build({
    testNo: 6, num: 5, unit: "정적분의 성질", concept: "역삼각함수 합", difficulty: "easy",
    question: "$\\displaystyle\\int_0^{1/2}(\\sin^{-1}x+\\cos^{-1}x)\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{\\pi}{4}$"),
      o("2", "$\\dfrac{\\pi}{2}$"),
      o("3", "$\\dfrac{\\pi}{8}$"),
      o("4", "$\\pi$"),
      o("5", "$\\dfrac{\\pi}{6}$")
    ],
    answer: "1",
    explanation: "$\\sin^{-1}x+\\cos^{-1}x=\\dfrac{\\pi}{2}$ (상수). $\\int_0^{1/2}\\dfrac{\\pi}{2}\\,dx=\\dfrac{\\pi}{4}$."
  }),
  build({
    testNo: 6, num: 6, unit: "정적분의 성질", concept: "역삼각함수 합", difficulty: "easy",
    question: "$\\displaystyle\\int_{-1}^1(\\cos^{-1}x+\\cos^{-1}(-x))\\,dx$의 값은?",
    options: [
      o("1", "$\\pi$"),
      o("2", "$2\\pi$"),
      o("3", "$\\dfrac{\\pi}{2}$"),
      o("4", "$\\dfrac{3\\pi}{2}$"),
      o("5", "$0$")
    ],
    answer: "2",
    explanation: "$\\cos^{-1}(-x)=\\pi-\\cos^{-1}x$이므로 $\\cos^{-1}x+\\cos^{-1}(-x)=\\pi$. $\\int_{-1}^1\\pi\\,dx=2\\pi$."
  }),

  // ============== Daily TEST 7 (적분) — 삼각함수 + 부분분수 ==============
  build({
    testNo: 7, num: 1, unit: "정적분의 계산", concept: "삼각함수 적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^{\\pi/2}\\sin 2x\\cos^9 x\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{11}$"),
      o("2", "$\\dfrac{2}{11}$"),
      o("3", "$\\dfrac{1}{5}$"),
      o("4", "$\\dfrac{2}{5}$"),
      o("5", "$\\dfrac{1}{10}$")
    ],
    answer: "2",
    explanation: "$\\sin 2x=2\\sin x\\cos x$. $\\int_0^{\\pi/2}2\\sin x\\cos^{10}x\\,dx=-\\dfrac{2}{11}[\\cos^{11}x]_0^{\\pi/2}=\\dfrac{2}{11}$."
  }),
  build({
    testNo: 7, num: 2, unit: "정적분의 계산", concept: "삼각함수 적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_{\\pi/4}^{\\pi/3}\\!\\left[(\\tan x)^{-2}\\sec^4 x+\\tan^3 x(\\sec x)^{-1}\\right]dx$의 값은?",
    options: [
      o("1", "$\\dfrac{2\\sqrt{3}}{3}+\\dfrac{5}{2}-\\dfrac{3\\sqrt{2}}{2}$"),
      o("2", "$\\dfrac{2\\sqrt{3}}{3}+\\dfrac{5}{2}+\\dfrac{3\\sqrt{2}}{2}$"),
      o("3", "$\\dfrac{\\sqrt{3}}{3}+\\dfrac{5}{2}$"),
      o("4", "$\\dfrac{\\sqrt{3}}{3}-\\dfrac{3\\sqrt{2}}{2}$"),
      o("5", "$1$")
    ],
    answer: "1",
    explanation: "$\\dfrac{(\\tan^2x+1)\\sec^2x}{\\tan^2x}+\\dfrac{(\\sec^2x-1)\\tan x}{\\sec x}=\\sec^2x+\\csc^2x+\\sec x\\tan x-\\sin x$. 적분: $\\dfrac{2\\sqrt{3}}{3}+\\dfrac{5}{2}-\\dfrac{3\\sqrt{2}}{2}$."
  }),
  build({
    testNo: 7, num: 3, unit: "정적분의 계산", concept: "삼각함수 적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^{\\pi/3}\\tan^3 x\\sec^5 x\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{418}{35}$"),
      o("2", "$\\dfrac{209}{35}$"),
      o("3", "$\\dfrac{32}{7}-\\dfrac{32}{5}$"),
      o("4", "$\\dfrac{2^7-1}{7}+\\dfrac{2^5-1}{5}$"),
      o("5", "$\\dfrac{2^7}{7}$")
    ],
    answer: "1",
    explanation: "$\\tan^3 x\\sec^5 x=(\\sec^2 x-1)\\sec^4 x\\cdot(\\sec x\\tan x)$. $u=\\sec x$. $\\int_1^2(u^6-u^4)du=\\dfrac{2^7-1}{7}-\\dfrac{2^5-1}{5}=\\dfrac{418}{35}$."
  }),
  build({
    testNo: 7, num: 4, unit: "정적분의 계산", concept: "부분분수", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_2^3\\dfrac{x^5+2}{x^2-1}\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{75}{4}+\\dfrac{1}{2}\\ln 6$"),
      o("2", "$\\dfrac{75}{4}-\\dfrac{1}{2}\\ln 6$"),
      o("3", "$\\dfrac{75}{4}+\\ln 2$"),
      o("4", "$\\ln 6$"),
      o("5", "$\\dfrac{75}{4}$")
    ],
    answer: "1",
    explanation: "다항식 나눗셈: $x^3+x+\\dfrac{x+2}{x^2-1}$. 부분분수: $\\dfrac{3/2}{x-1}-\\dfrac{1/2}{x+1}$. 적분: $\\dfrac{x^4}{4}+\\dfrac{x^2}{2}+\\dfrac{3}{2}\\ln|x-1|-\\dfrac{1}{2}\\ln|x+1|]_2^3=\\dfrac{75}{4}+\\dfrac{1}{2}\\ln 6$."
  }),
  build({
    testNo: 7, num: 5, unit: "정적분의 계산", concept: "부분분수", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^1\\dfrac{5x+7}{x^2+3x+2}\\,dx$의 값은?",
    options: [
      o("1", "$3\\ln 3-\\ln 2$"),
      o("2", "$\\ln 3+\\ln 2$"),
      o("3", "$3\\ln 2$"),
      o("4", "$2\\ln 3$"),
      o("5", "$\\ln 6$")
    ],
    answer: "1",
    explanation: "$x^2+3x+2=(x+1)(x+2)$. 부분분수: $\\dfrac{2}{x+1}+\\dfrac{3}{x+2}$. $[2\\ln|x+1|+3\\ln|x+2|]_0^1=2\\ln 2+3\\ln 3-3\\ln 2=3\\ln 3-\\ln 2$."
  }),
  build({
    testNo: 7, num: 6, unit: "정적분의 계산", concept: "부분분수", difficulty: "easy",
    question: "$\\displaystyle\\int_3^4\\dfrac{1}{x^2-4}\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{4}\\ln\\dfrac{5}{3}$"),
      o("2", "$\\dfrac{1}{4}\\ln\\dfrac{3}{5}$"),
      o("3", "$\\dfrac{1}{2}\\ln\\dfrac{5}{3}$"),
      o("4", "$\\ln\\dfrac{5}{3}$"),
      o("5", "$\\dfrac{1}{2}\\ln 2$")
    ],
    answer: "1",
    explanation: "$\\int\\dfrac{1}{x^2-a^2}dx=\\dfrac{1}{2a}\\ln\\!\\left|\\dfrac{x-a}{x+a}\\right|+C$. $a=2$: $\\dfrac{1}{4}[\\ln\\!\\left|\\dfrac{x-2}{x+2}\\right|]_3^4=\\dfrac{1}{4}(\\ln\\dfrac{2}{6}-\\ln\\dfrac{1}{5})=\\dfrac{1}{4}\\ln\\dfrac{5}{3}$."
  }),

  // ============== Daily TEST 8 (적분) — 부분분수 + 치환 ==============
  build({
    testNo: 8, num: 1, unit: "정적분의 계산", concept: "부분분수", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^1\\dfrac{x^2-x}{(x+1)(x^2+1)}\\,dx$의 값은?",
    options: [
      o("1", "$\\ln 2-\\dfrac{\\pi}{4}$"),
      o("2", "$\\ln 2+\\dfrac{\\pi}{4}$"),
      o("3", "$\\dfrac{\\pi}{4}$"),
      o("4", "$\\ln 2$"),
      o("5", "$0$")
    ],
    answer: "1",
    explanation: "부분분수: $\\dfrac{1}{x+1}+\\dfrac{-1}{x^2+1}$. $[\\ln|x+1|-\\tan^{-1}x]_0^1=\\ln 2-\\dfrac{\\pi}{4}$."
  }),
  build({
    testNo: 8, num: 2, unit: "정적분의 계산", concept: "완전제곱", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_1^2\\dfrac{4}{x^2-2x+2}\\,dx$의 값은?",
    options: [
      o("1", "$\\pi$"),
      o("2", "$\\dfrac{\\pi}{2}$"),
      o("3", "$\\dfrac{\\pi}{4}$"),
      o("4", "$2\\pi$"),
      o("5", "$4\\pi$")
    ],
    answer: "1",
    explanation: "$x^2-2x+2=(x-1)^2+1$. $\\int\\dfrac{4}{(x-1)^2+1}dx=4\\tan^{-1}(x-1)$. $[4\\tan^{-1}(x-1)]_1^2=4\\cdot\\dfrac{\\pi}{4}=\\pi$."
  }),
  build({
    testNo: 8, num: 3, unit: "정적분의 계산", concept: "선형 분리", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^{1/2}\\dfrac{2-8x}{1+4x^2}\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{\\pi}{4}-\\ln 2$"),
      o("2", "$\\dfrac{\\pi}{4}+\\ln 2$"),
      o("3", "$\\dfrac{\\pi}{2}-\\ln 2$"),
      o("4", "$-\\ln 2$"),
      o("5", "$\\dfrac{\\pi}{4}$")
    ],
    answer: "1",
    explanation: "$\\int\\dfrac{2}{1+4x^2}dx=\\tan^{-1}(2x)$, $\\int\\dfrac{-8x}{1+4x^2}dx=-\\ln(1+4x^2)$. $[\\tan^{-1}(2x)-\\ln(1+4x^2)]_0^{1/2}=\\dfrac{\\pi}{4}-\\ln 2$."
  }),
  build({
    testNo: 8, num: 4, unit: "정적분의 계산", concept: "치환적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^1(1+x)\\sqrt{1-x}\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{14}{15}$"),
      o("2", "$\\dfrac{8}{15}$"),
      o("3", "$\\dfrac{4}{5}$"),
      o("4", "$\\dfrac{2}{3}$"),
      o("5", "$1$")
    ],
    answer: "1",
    explanation: "$t=\\sqrt{1-x}$, $1-x=t^2$, $-dx=2t\\,dt$. $\\int_1^0(2-t^2)t\\cdot(-2t)dt=\\int_0^1(4t^2-2t^4)dt=\\dfrac{4}{3}-\\dfrac{2}{5}=\\dfrac{14}{15}$."
  }),
  build({
    testNo: 8, num: 5, unit: "정적분의 계산", concept: "치환적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^1 3x^5\\sqrt{x^3+1}\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{4(\\sqrt{2}+1)}{15}$"),
      o("2", "$\\dfrac{4(\\sqrt{2}-1)}{15}$"),
      o("3", "$\\dfrac{2(\\sqrt{2}+1)}{15}$"),
      o("4", "$\\dfrac{2}{15}$"),
      o("5", "$\\dfrac{4}{5}$")
    ],
    answer: "1",
    explanation: "$\\sqrt{x^3+1}=t$, $x^3+1=t^2$, $3x^2dx=2t\\,dt$. $\\int_1^{\\sqrt{2}}(t^2-1)t\\cdot 2t\\,dt=2[\\dfrac{t^5}{5}-\\dfrac{t^3}{3}]_1^{\\sqrt{2}}=\\dfrac{4(\\sqrt{2}+1)}{15}$."
  }),
  build({
    testNo: 8, num: 6, unit: "정적분의 계산", concept: "치환적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_4^9\\dfrac{1}{(x-1)\\sqrt{x}}\\,dx$의 값은?",
    options: [
      o("1", "$\\ln\\dfrac{3}{2}$"),
      o("2", "$\\ln\\dfrac{2}{3}$"),
      o("3", "$\\ln 2$"),
      o("4", "$\\ln 3$"),
      o("5", "$\\dfrac{1}{2}\\ln\\dfrac{3}{2}$")
    ],
    answer: "1",
    explanation: "$t=\\sqrt{x}$, $dx=2t\\,dt$. $\\int_2^3\\dfrac{2}{t^2-1}dt=[\\ln\\!\\left|\\dfrac{t-1}{t+1}\\right|]_2^3=\\ln\\dfrac{1/2}{1/3}=\\ln\\dfrac{3}{2}$."
  }),

  // ============== Daily TEST 9 (적분) — 삼각치환 + 쌍곡선치환 ==============
  build({
    testNo: 9, num: 1, unit: "정적분의 계산", concept: "삼각치환", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^1\\dfrac{1}{\\sqrt{4x-x^2}}\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{\\pi}{6}$"),
      o("2", "$\\dfrac{\\pi}{3}$"),
      o("3", "$\\dfrac{\\pi}{4}$"),
      o("4", "$\\dfrac{\\pi}{2}$"),
      o("5", "$\\pi$")
    ],
    answer: "2",
    explanation: "$4x-x^2=4-(x-2)^2$. $\\int\\dfrac{1}{\\sqrt{4-(x-2)^2}}dx=\\sin^{-1}\\dfrac{x-2}{2}$. $[\\sin^{-1}\\dfrac{x-2}{2}]_0^1=\\sin^{-1}(-\\dfrac{1}{2})-\\sin^{-1}(-1)=-\\dfrac{\\pi}{6}+\\dfrac{\\pi}{2}=\\dfrac{\\pi}{3}$."
  }),
  build({
    testNo: 9, num: 2, unit: "정적분의 계산", concept: "삼각치환", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^1\\dfrac{x}{\\sqrt{3-2x-x^2}}\\,dx$의 값은?",
    options: [
      o("1", "$\\sqrt{3}-\\dfrac{\\pi}{3}$"),
      o("2", "$\\sqrt{3}+\\dfrac{\\pi}{3}$"),
      o("3", "$\\dfrac{\\pi}{3}-\\sqrt{3}$"),
      o("4", "$\\sqrt{3}$"),
      o("5", "$\\dfrac{\\pi}{6}$")
    ],
    answer: "1",
    explanation: "$3-2x-x^2=4-(x+1)^2$. $x+1=2\\sin\\theta$, $\\theta\\in[\\pi/6, \\pi/2]$. $\\int_{\\pi/6}^{\\pi/2}\\dfrac{2\\sin\\theta-1}{2\\cos\\theta}\\cdot 2\\cos\\theta\\,d\\theta=\\int(2\\sin\\theta-1)d\\theta=[-2\\cos\\theta-\\theta]=\\sqrt{3}-\\dfrac{\\pi}{3}$."
  }),
  build({
    testNo: 9, num: 3, unit: "정적분의 계산", concept: "삼각치환", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_1^5\\dfrac{1}{\\sqrt{t^2-6t+13}}\\,dt$의 값은?",
    options: [
      o("1", "$\\ln(3+2\\sqrt{2})$"),
      o("2", "$\\ln(1+\\sqrt{2})$"),
      o("3", "$\\ln 2$"),
      o("4", "$\\sinh^{-1}(2)$"),
      o("5", "$\\dfrac{\\pi}{4}$")
    ],
    answer: "1",
    explanation: "$t^2-6t+13=(t-3)^2+4$. $t-3=2\\tan\\theta$. $\\int\\sec\\theta\\,d\\theta=\\ln|\\sec\\theta+\\tan\\theta|$. 결과 $\\ln(3+2\\sqrt{2})-\\ln(\\sqrt{2}-1)$ 정리시 $\\ln(3+2\\sqrt{2})$."
  }),
  build({
    testNo: 9, num: 4, unit: "정적분의 계산", concept: "치환적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^{\\pi^2}\\cos\\sqrt{t}\\,dt$의 값은?",
    options: [
      o("1", "$-4$"),
      o("2", "$-2$"),
      o("3", "$0$"),
      o("4", "$2$"),
      o("5", "$4$")
    ],
    answer: "1",
    explanation: "$\\sqrt{t}=x$, $t=x^2$, $dt=2x\\,dx$. $\\int_0^\\pi\\cos x\\cdot 2x\\,dx$. 부분적분: $[2x\\sin x+2\\cos x]_0^\\pi=-2-2=-4$."
  }),
  build({
    testNo: 9, num: 5, unit: "정적분의 계산", concept: "치환적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_{\\ln 2}^{\\ln 5}\\dfrac{e^x}{2e^x-1}\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{2}\\ln 3$"),
      o("2", "$\\dfrac{1}{2}\\ln\\dfrac{9}{3}$"),
      o("3", "$\\ln 3$"),
      o("4", "$\\ln 2$"),
      o("5", "$1$")
    ],
    answer: "1",
    explanation: "$t=e^x$, $dt=e^x dx$. $\\int_2^5\\dfrac{1}{2t-1}dt=\\dfrac{1}{2}[\\ln|2t-1|]_2^5=\\dfrac{1}{2}(\\ln 9-\\ln 3)=\\dfrac{1}{2}\\ln 3$."
  }),
  build({
    testNo: 9, num: 6, unit: "정적분의 계산", concept: "쌍곡선함수 적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^1\\dfrac{1}{1+\\sinh^2 x}\\,dx$의 값은?",
    options: [
      o("1", "$\\dfrac{e^2-1}{e^2+1}$"),
      o("2", "$\\dfrac{e^2+1}{e^2-1}$"),
      o("3", "$\\tanh 1$"),
      o("4", "$\\dfrac{1}{e+1}$"),
      o("5", "$1$")
    ],
    answer: "1",
    explanation: "$1+\\sinh^2 x=\\cosh^2 x$. $\\int\\dfrac{1}{\\cosh^2 x}dx=\\tanh x$. $\\tanh 1=\\dfrac{e-e^{-1}}{e+e^{-1}}=\\dfrac{e^2-1}{e^2+1}$. (옵션 ①, ③ 둘 다 같은 값)"
  }),

  // ============== Daily TEST 10 (적분) — 절댓값/가우스/역함수 ==============
  build({
    testNo: 10, num: 1, unit: "정적분의 계산", concept: "절댓값 적분", difficulty: "easy",
    question: "$\\displaystyle\\int_0^2|x^2-x|\\,dx$의 값은?",
    options: [
      o("1", "$1$"),
      o("2", "$\\dfrac{1}{2}$"),
      o("3", "$\\dfrac{2}{3}$"),
      o("4", "$\\dfrac{4}{3}$"),
      o("5", "$2$")
    ],
    answer: "1",
    explanation: "$x^2-x\\le 0$ on $[0,1]$. $\\int_0^1(x-x^2)dx+\\int_1^2(x^2-x)dx=(\\dfrac{1}{2}-\\dfrac{1}{3})+(\\dfrac{8}{3}-2-\\dfrac{1}{3}+\\dfrac{1}{2})=\\dfrac{1}{6}+\\dfrac{5}{6}=1$."
  }),
  build({
    testNo: 10, num: 2, unit: "정적분의 계산", concept: "절댓값 적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^\\pi x|\\cos x|\\,dx$의 값은?",
    options: [
      o("1", "$\\pi$"),
      o("2", "$\\dfrac{\\pi}{2}$"),
      o("3", "$2\\pi$"),
      o("4", "$\\pi-1$"),
      o("5", "$2$")
    ],
    answer: "1",
    explanation: "$|\\cos x|$: $[0, \\pi/2]$에서 $\\cos x$, $[\\pi/2, \\pi]$에서 $-\\cos x$. 부분적분으로 $\\int_0^{\\pi/2}x\\cos x\\,dx+\\int_{\\pi/2}^\\pi(-x\\cos x)dx=(\\dfrac{\\pi}{2}-1)+(\\dfrac{\\pi}{2}+1)=\\pi$."
  }),
  build({
    testNo: 10, num: 3, unit: "정적분의 성질", concept: "가우스 함수", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^{100}(2x-[x])\\,dx$의 값은?",
    options: [
      o("1", "$5050$"),
      o("2", "$10000$"),
      o("3", "$10050$"),
      o("4", "$4950$"),
      o("5", "$\\dfrac{99\\cdot 100}{2}$")
    ],
    answer: "1",
    explanation: "$\\int_0^{100}2x\\,dx=10000$. $\\int_0^{100}[x]dx=\\sum_{k=0}^{99}k=\\dfrac{99\\cdot 100}{2}=4950$. 차이 $=10000-4950=5050$."
  }),
  build({
    testNo: 10, num: 4, unit: "정적분의 계산", concept: "가우스 함수", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_1^2[x^2]\\,dx$의 값은?",
    options: [
      o("1", "$5-\\sqrt{2}-\\sqrt{3}$"),
      o("2", "$\\sqrt{3}+\\sqrt{2}-3$"),
      o("3", "$3$"),
      o("4", "$2$"),
      o("5", "$5$")
    ],
    answer: "1",
    explanation: "$[x^2]=1$ on $[1,\\sqrt{2})$, $=2$ on $[\\sqrt{2},\\sqrt{3})$, $=3$ on $[\\sqrt{3}, 2)$. $1\\cdot(\\sqrt{2}-1)+2(\\sqrt{3}-\\sqrt{2})+3(2-\\sqrt{3})=5-\\sqrt{2}-\\sqrt{3}$."
  }),
  build({
    testNo: 10, num: 5, unit: "정적분의 성질", concept: "역함수 적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^{1/2}\\sin^{-1}x\\,dx+\\int_0^{\\pi/6}\\sin y\\,dy$의 값은?",
    options: [
      o("1", "$\\dfrac{\\pi}{12}$"),
      o("2", "$\\dfrac{\\pi}{6}$"),
      o("3", "$\\dfrac{\\pi}{4}$"),
      o("4", "$\\dfrac{1}{2}$"),
      o("5", "$\\dfrac{\\sqrt{3}}{6}$")
    ],
    answer: "1",
    explanation: "역함수 적분 합 공식: $\\int_0^a f^{-1}+\\int_0^{f(a)}f=a\\cdot f(a)$. $f(y)=\\sin y$, $a=\\pi/6$, $f(a)=1/2$. 합 $=\\dfrac{\\pi}{6}\\cdot\\dfrac{1}{2}=\\dfrac{\\pi}{12}$."
  }),
  build({
    testNo: 10, num: 6, unit: "정적분의 성질", concept: "역함수 적분", difficulty: "easyMedium",
    question: "$f$가 단조증가이고 $f(1)=2$, $f(3)=5$, $\\displaystyle\\int_1^3 f(x)dx=\\dfrac{9}{2}$의 조건을 만족할 때, $f$의 역함수 정적분 $\\displaystyle\\int_2^5 f^{-1}(y)\\,dy$의 값은?",
    options: [
      o("1", "$\\dfrac{17}{2}$"),
      o("2", "$\\dfrac{15}{2}$"),
      o("3", "$\\dfrac{13}{2}$"),
      o("4", "$10$"),
      o("5", "$\\dfrac{9}{2}$")
    ],
    answer: "1",
    explanation: "역함수 적분 공식: $\\int_a^b f+\\int_{f(a)}^{f(b)}f^{-1}=b\\cdot f(b)-a\\cdot f(a)$. $\\dfrac{9}{2}+\\int_2^5 f^{-1}=3\\cdot 5-1\\cdot 2=13$. $\\int_2^5 f^{-1}=13-\\dfrac{9}{2}=\\dfrac{17}{2}$."
  })
];

console.log(`Inserting ${problems.length} 적분학 daily-test problems (DT1~DT10)...`);

const { error } = await supabase.from("questions").insert(problems);
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}

console.log(`Done. ${problems.length} problems inserted.`);
const byTest = {};
for (const p of problems) {
  const m = p.id.match(/^q-daily-int-r(\d+)/);
  const k = m ? `DT${m[1]}` : "?";
  byTest[k] = (byTest[k] || 0) + 1;
}
console.log("By test:", byTest);
