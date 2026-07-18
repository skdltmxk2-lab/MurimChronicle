// Convert the six Ajou passage-series rows into complete standalone questions.
// Also synchronizes any generated_exams snapshots containing those question IDs.
// Usage: node scripts/fix_ajou_bundle_questions_20260718.mjs

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const env = Object.fromEntries(
  readFileSync(resolve(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return [key.trim(), rest.join("=").trim()];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing Supabase service-role credentials in .env.local");

const sb = createClient(url, key);
const updatedAt = new Date().toISOString();
const fixes = [
  {
    id: "q-2019-ajou-48",
    update: { concept: "가우시안 적분의 극좌표 변환" },
  },
  {
    id: "q-2019-ajou-49",
    update: {
      concept: "$\\sin^2\\cos^2$ 적분",
      question:
        "$\\sin^2\\theta\\cos^2\\theta=\\alpha+\\beta\\cos\\gamma\\theta$일 때 $\\displaystyle\\int_0^{a}(\\alpha+\\beta\\cos\\gamma\\theta)d\\theta=c$라 하자. $a=\\pi/2$일 때 $c$의 값은?",
    },
  },
  {
    id: "q-2019-ajou-50",
    update: {
      concept: "가우시안 적분 계산",
      explanation:
        "$I=\\displaystyle\\int_0^{\\infty}x^2e^{-x^2}dx$라 하자. $I^2=\\iint_{x,y\\ge0}x^2y^2e^{-(x^2+y^2)}dxdy=\\left(\\int_0^{\\infty}r^5e^{-r^2}dr\\right)\\left(\\int_0^{\\pi/2}\\sin^2\\theta\\cos^2\\theta\\,d\\theta\\right)$.\n$r^2=u$로 치환하면 첫 적분은 $\\dfrac12\\int_0^{\\infty}u^2e^{-u}du=1$이고, 두 번째 적분은 $\\dfrac{\\pi}{16}$이다. 따라서 $I^2=\\dfrac{\\pi}{16}$이며 $I>0$이므로 $I=\\dfrac{\\sqrt{\\pi}}{4}$.",
    },
  },
  {
    id: "q-2020-ajou-48",
    update: { concept: "지수형 이상적분의 제곱 완성" },
  },
  {
    id: "q-2020-ajou-49",
    update: { concept: "지수형 극한" },
  },
  {
    id: "q-2020-ajou-50",
    update: {
      concept: "지수형 이상적분 계산",
      explanation:
        "$I=\\displaystyle\\int_0^{\\infty}e^{-(x^2+4x^{-2})}dx$라 하자. $x=2/t$로 치환하면 $I=\\int_0^{\\infty}2x^{-2}e^{-(x^2+4x^{-2})}dx$이므로, 두 식을 더해 $2I=\\int_0^{\\infty}(1+2x^{-2})e^{-(x^2+4x^{-2})}dx$를 얻는다.\n$x^2+4x^{-2}=(x-2x^{-1})^2+4$이고 $u=x-2x^{-1}$이면 $du=(1+2x^{-2})dx$이다. 따라서 $2I=e^{-4}\\int_{-\\infty}^{\\infty}e^{-u^2}du=e^{-4}\\sqrt{\\pi}$, 즉 $I=\\dfrac{\\sqrt{\\pi}}{2}e^{-4}$.",
    },
  },
];

function toSnapshot(row) {
  return {
    id: row.id,
    subject: row.subject,
    unit: row.unit,
    concept: row.concept,
    difficulty: row.difficulty,
    question: row.question,
    contentType: row.content_type,
    questionImage: row.question_image,
    questionType: row.question_type,
    options: row.options,
    correctOptionId: row.correct_option_id,
    answerText: row.answer_text,
    explanation: row.explanation,
    explanationContentType: row.explanation_content_type,
    explanationImage: row.explanation_image,
    tags: row.tags,
  };
}

const fixedIds = fixes.map((fix) => fix.id);
const { data: currentRows, error: currentRowsError } = await sb
  .from("questions")
  .select("id, tags")
  .in("id", fixedIds);
if (currentRowsError) throw currentRowsError;
const tagsById = new Map((currentRows ?? []).map((row) => [row.id, row.tags ?? []]));

for (const fix of fixes) {
  const tags = [
    ...new Set([
      ...(tagsById.get(fix.id) ?? []).filter((tag) => !/(?:공통\s*)?지문\s*\d+/.test(tag)),
      fix.update.concept,
    ]),
  ];
  const { data, error } = await sb
    .from("questions")
    .update({ ...fix.update, tags, updated_at: updatedAt })
    .eq("id", fix.id)
    .select("id");
  if (error) throw new Error(`${fix.id}: ${error.message}`);
  if (data?.length !== 1) throw new Error(`${fix.id}: expected one row, updated ${data?.length ?? 0}`);
  console.log(`updated question ${fix.id}`);
}

const { data: fixedRows, error: fixedRowsError } = await sb
  .from("questions")
  .select(
    "id, subject, unit, concept, difficulty, question, content_type, question_image, question_type, options, correct_option_id, answer_text, explanation, explanation_content_type, explanation_image, tags",
  )
  .in("id", fixedIds);
if (fixedRowsError) throw fixedRowsError;
if (fixedRows?.length !== fixes.length) {
  throw new Error(`Expected ${fixes.length} repaired rows, found ${fixedRows?.length ?? 0}`);
}

const snapshots = new Map(fixedRows.map((row) => [row.id, toSnapshot(row)]));
const { data: exams, error: examError } = await sb
  .from("generated_exams")
  .select("id, problems")
  .limit(1000);
if (examError) throw examError;

let syncedExams = 0;
for (const exam of exams ?? []) {
  if (!Array.isArray(exam.problems)) continue;
  let changed = false;
  const problems = exam.problems.map((problem) => {
    const snapshot = snapshots.get(String(problem?.id ?? ""));
    if (!snapshot) return problem;
    changed = true;
    return snapshot;
  });
  if (!changed) continue;
  const { error } = await sb.from("generated_exams").update({ problems }).eq("id", exam.id);
  if (error) throw new Error(`${exam.id}: ${error.message}`);
  syncedExams += 1;
  console.log(`synced generated_exam ${exam.id}`);
}

console.log(`done: ${fixes.length} questions, ${syncedExams} generated exams`);
