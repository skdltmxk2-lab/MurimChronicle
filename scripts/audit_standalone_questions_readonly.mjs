// Read-only audit for questions that cannot be presented without another passage or problem.
// Usage: node scripts/audit_standalone_questions_readonly.mjs

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { getStandaloneQuestionIssue } from "../src/lib/questions/standaloneCore.mjs";

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
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error("Missing Supabase credentials in .env.local");

const sb = createClient(url, key);
const PAGE = 1000;

function normalize(value) {
  return String(value ?? "").replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").trim();
}

async function fetchAll(table, select, orderBy = "id") {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb
      .from(table)
      .select(select)
      .order(orderBy, { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows;
}

const questions = await fetchAll(
  "questions",
  "id, subject, unit, concept, question, explanation, tags",
);
const exams = await fetchAll("generated_exams", "id, title, problems");
const issues = [];

for (const question of questions) {
  const issue = getStandaloneQuestionIssue(question);
  if (!issue) continue;
  issues.push({
    table: "questions",
    rowId: question.id,
    problemId: question.id,
    code: issue.code,
    message: issue.message,
    concept: question.concept,
    question: normalize(question.question).slice(0, 280),
  });
}

for (const exam of exams) {
  if (!Array.isArray(exam.problems)) continue;
  exam.problems.forEach((problem, index) => {
    const issue = getStandaloneQuestionIssue(problem);
    if (!issue) return;
    issues.push({
      table: "generated_exams",
      rowId: exam.id,
      problemId: problem?.id ?? "",
      problemIndex: index + 1,
      code: issue.code,
      message: issue.message,
      concept: problem?.concept ?? "",
      question: normalize(problem?.question).slice(0, 280),
    });
  });
}

const codeCounts = Object.fromEntries(
  [...new Set(issues.map((issue) => issue.code))]
    .sort()
    .map((code) => [code, issues.filter((issue) => issue.code === code).length]),
);
console.log(
  JSON.stringify(
    {
      summary: {
        questionCount: questions.length,
        generatedExamCount: exams.length,
        issueCount: issues.length,
        codeCounts,
      },
      issues,
    },
    null,
    2,
  ),
);
if (issues.length > 0) process.exitCode = 1;
