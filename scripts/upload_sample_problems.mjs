// One-off script to upload 6 hand-curated 미분학 problems to Supabase.
// Usage: node scripts/upload_sample_problems.mjs
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

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Supabase URL/KEY missing in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });

const problems = [
  {
    concept: "합성함수 미분",
    difficulty: "medium",
    school: "인하대",
    question:
      "미분가능한 함수 $f$가 $-\\dfrac{\\pi}{2} < x < \\dfrac{\\pi}{2}$일 때, $f(\\sin x) = x^2 + 1$을 만족한다. $f'\\!\\left(\\dfrac{1}{2}\\right)$의 값은?",
    options: [
      o("1", "$-\\dfrac{2\\sqrt{3}\\,\\pi}{9}$"),
      o("2", "$-\\dfrac{\\sqrt{3}\\,\\pi}{9}$"),
      o("3", "$0$"),
      o("4", "$\\dfrac{\\sqrt{3}\\,\\pi}{9}$"),
      o("5", "$\\dfrac{2\\sqrt{3}\\,\\pi}{9}$"),
    ],
    correctOptionId: "5",
    explanation:
      "양변을 $x$에 대해 미분하면 $f'(\\sin x)\\cos x = 2x$이므로 $f'(\\sin x) = \\dfrac{2x}{\\cos x}$. $\\sin x = \\dfrac{1}{2}$이고 $-\\dfrac{\\pi}{2} < x < \\dfrac{\\pi}{2}$이면 $x = \\dfrac{\\pi}{6}$, $\\cos x = \\dfrac{\\sqrt{3}}{2}$. 따라서 $f'\\!\\left(\\dfrac{1}{2}\\right) = \\dfrac{2 \\cdot \\frac{\\pi}{6}}{\\frac{\\sqrt{3}}{2}} = \\dfrac{2\\sqrt{3}\\,\\pi}{9}$.",
  },
  {
    concept: "합성함수 미분",
    difficulty: "medium",
    school: "인하대",
    question:
      "미분가능한 함수 $f$가 $-\\dfrac{\\pi}{2} < x < \\dfrac{\\pi}{2}$일 때, $f(\\tan x) = \\sin x$를 만족한다. $f'(1)$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{4}$"),
      o("2", "$\\dfrac{\\sqrt{2}}{4}$"),
      o("3", "$\\dfrac{1}{2}$"),
      o("4", "$\\dfrac{\\sqrt{2}}{2}$"),
      o("5", "$1$"),
    ],
    correctOptionId: "2",
    explanation:
      "양변을 $x$에 대해 미분하면 $f'(\\tan x)\\sec^2 x = \\cos x$이므로 $f'(\\tan x) = \\dfrac{\\cos x}{\\sec^2 x} = \\cos^3 x$. $\\tan x = 1$이고 $-\\dfrac{\\pi}{2} < x < \\dfrac{\\pi}{2}$이면 $x = \\dfrac{\\pi}{4}$, $\\cos x = \\dfrac{\\sqrt{2}}{2}$. 따라서 $f'(1) = \\left(\\dfrac{\\sqrt{2}}{2}\\right)^3 = \\dfrac{\\sqrt{2}}{4}$.",
  },
  {
    concept: "역함수 미분",
    difficulty: "medium",
    school: "인하대",
    question:
      "미분가능한 함수 $f$가 모든 실수 $x$에 대하여 $\\tan f(x) = e^x$을 만족할 때, $f'(0)$의 값은?",
    options: [
      o("1", "$\\dfrac{1}{5}$"),
      o("2", "$\\dfrac{1}{4}$"),
      o("3", "$\\dfrac{1}{3}$"),
      o("4", "$\\dfrac{1}{2}$"),
      o("5", "$1$"),
    ],
    correctOptionId: "4",
    explanation:
      "양변을 $x$에 대해 미분하면 $\\sec^2(f(x))\\cdot f'(x) = e^x$이므로 $f'(x) = e^x \\cos^2(f(x))$. $x = 0$일 때 $\\tan f(0) = 1$이므로 $f(0) = \\dfrac{\\pi}{4}$, $\\cos^2\\dfrac{\\pi}{4} = \\dfrac{1}{2}$. 따라서 $f'(0) = 1 \\cdot \\dfrac{1}{2} = \\dfrac{1}{2}$.",
  },
  {
    concept: "합성함수 미분",
    difficulty: "medium",
    school: "아주대",
    question:
      "실수 전체에서 정의된 미분가능한 함수 $f$에 대하여 $g(x) = \\sqrt{3e^x + (f(x))^2}$라 하자. $f(0) = 1$, $f'(0) = -5$이면 $g'(0)$의 값은?",
    options: [
      o("1", "$-\\dfrac{9}{4}$"),
      o("2", "$-\\dfrac{7}{4}$"),
      o("3", "$1$"),
      o("4", "$\\dfrac{7}{4}$"),
      o("5", "$\\dfrac{9}{4}$"),
    ],
    correctOptionId: "2",
    explanation:
      "$g(x) = (3e^x + f(x)^2)^{1/2}$이므로 $g'(x) = \\dfrac{3e^x + 2f(x)f'(x)}{2\\sqrt{3e^x + f(x)^2}}$. $x=0$에서 분모는 $2\\sqrt{3 + 1} = 4$, 분자는 $3 + 2 \\cdot 1 \\cdot (-5) = -7$. 따라서 $g'(0) = -\\dfrac{7}{4}$.",
  },
  {
    concept: "로그함수 미분",
    difficulty: "easy",
    school: "건국대",
    question: "$f(x) = \\ln(2x^2 + 1)$일 때 $f'(1)$의 값은?",
    options: [
      o("1", "$\\dfrac{2}{3}$"),
      o("2", "$\\dfrac{4}{3}$"),
      o("3", "$\\dfrac{5}{2}$"),
      o("4", "$\\dfrac{5}{3}$"),
      o("5", "$\\dfrac{5}{4}$"),
    ],
    correctOptionId: "2",
    explanation:
      "$f'(x) = \\dfrac{4x}{2x^2 + 1}$이므로 $f'(1) = \\dfrac{4}{3}$.",
  },
  {
    concept: "로그함수 미분",
    difficulty: "medium",
    school: "동덕여대",
    question:
      "$f(x) = \\ln\\!\\left(\\dfrac{2x+1}{\\sqrt{x-1}}\\right)$의 도함수 $f'(x)$를 구하시오.",
    options: [
      o("1", "$-\\dfrac{3}{2(x-1)(2x+1)}$"),
      o("2", "$\\dfrac{2\\sqrt{x-1} - 2x - 1}{(2x+1)\\sqrt{x-1}}$"),
      o("3", "$-\\dfrac{3}{(2x+1)\\sqrt{x-1}}$"),
      o("4", "$\\dfrac{2x - 5}{2(2x+1)(x-1)}$"),
    ],
    correctOptionId: "4",
    explanation:
      "$f(x) = \\ln(2x+1) - \\dfrac{1}{2}\\ln(x-1)$이므로 $f'(x) = \\dfrac{2}{2x+1} - \\dfrac{1}{2(x-1)} = \\dfrac{4(x-1) - (2x+1)}{2(2x+1)(x-1)} = \\dfrac{2x - 5}{2(2x+1)(x-1)}$.",
  },
];

const now = new Date().toISOString();
const records = problems.map((p, i) => ({
  id: `q-sample-${Date.now()}-${i}`,
  subject: "미분학",
  unit: "미분",
  concept: p.concept,
  difficulty: p.difficulty,
  source_type: "imported",
  question: p.question,
  content_type: "latex",
  question_image: null,
  options: p.options,
  correct_option_id: p.correctOptionId,
  explanation: p.explanation,
  explanation_content_type: "latex",
  explanation_image: null,
  tags: Array.from(new Set(["미분", p.concept, p.school].filter(Boolean))),
  created_at: now,
  updated_at: now,
}));

console.log(`Inserting ${records.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(records).select("id, subject, concept");
if (error) {
  console.error("Insert failed:", error);
  process.exit(1);
}
console.log("Inserted:");
for (const row of data ?? []) {
  console.log(`  - ${row.id}  [${row.subject}/${row.concept}]`);
}
