// Read-only audit for questions that cannot be presented without another passage or problem.
// Usage: node scripts/audit_standalone_questions_readonly.mjs

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
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error("Missing Supabase credentials in .env.local");

const sb = createClient(url, key);
const PAGE = 1000;
const BUNDLE_MARKER = /(?:\(|\[)?\s*(?:공통\s*)?지문\s*\d+\s*(?:\)|\])?/;
const NUMBERED_EXTERNAL_REFERENCE =
  /(?:지문|문제|문항)\s*(?:제\s*)?\d+\s*(?:번)?\s*(?:의|에서|와|과|를|을|결과|변환)|\d+\s*번\s*(?:문제|문항)?\s*(?:의|에서|와|과|를|을)/;
const RELATIVE_EXTERNAL_REFERENCE =
  /(?:앞|이전)(?:의|에서|서)?\s*(?:지문|문제|문항|결과|조건|설명)|(?:앞|전)\s*문항/;

function normalize(value) {
  return String(value ?? "").replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").trim();
}

function startsMidSentence(question) {
  const text = normalize(question)
    .replace(/^\s*(?:\d+[.)]\s*)?/, "")
    .replace(/^\s*(?:\\\(|\\\[|\$+)\s*/, "")
    .trim();
  return /^(?:라|라고|이라|이라고)\s*(?:할|하|놓|두)/.test(text);
}

function projectionSpaceIsUndefined(question) {
  const text = normalize(question).replace(/\$/g, "");
  const mentionsProjection = /정사영|orthogonal\s*projection|P_?\{?W\}?/i.test(text);
  const mentionsW = /(?:^|[^A-Za-z])W(?:[^A-Za-z]|$)/.test(text);
  if (!mentionsProjection || !mentionsW) return false;
  return !(
    /W\s*(?:=|:=|는|은|를|을|라|라고|:)/.test(text) ||
    /(?:부분공간|공간|열공간|해공간|평면|직교여공간)(?:을|를)?\s*W\s*(?:라|라고|로|으로|는|은)/.test(
      text,
    ) ||
    /부분공간\s*W|subspace\s*W|공간\s*W|집합\s*W/i.test(text)
  );
}

function classify(problem) {
  const concept = normalize(problem?.concept);
  const question = normalize(problem?.question);
  const metadata = [concept, ...(Array.isArray(problem?.tags) ? problem.tags : [])]
    .map(normalize)
    .join("\n");
  if (BUNDLE_MARKER.test(metadata)) return "bundle_marker";
  if (NUMBERED_EXTERNAL_REFERENCE.test(question) || RELATIVE_EXTERNAL_REFERENCE.test(question)) {
    return "external_question_reference";
  }
  if (startsMidSentence(question)) return "stem_starts_mid_sentence";
  if (projectionSpaceIsUndefined(question)) return "undefined_projection_space";
  return null;
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

const questions = await fetchAll("questions", "id, subject, unit, concept, question, tags");
const exams = await fetchAll("generated_exams", "id, title, problems");
const issues = [];

for (const question of questions) {
  const code = classify(question);
  if (!code) continue;
  issues.push({
    table: "questions",
    rowId: question.id,
    problemId: question.id,
    code,
    concept: question.concept,
    question: normalize(question.question).slice(0, 280),
  });
}

for (const exam of exams) {
  if (!Array.isArray(exam.problems)) continue;
  exam.problems.forEach((problem, index) => {
    const code = classify(problem);
    if (!code) return;
    issues.push({
      table: "generated_exams",
      rowId: exam.id,
      problemId: problem?.id ?? "",
      problemIndex: index + 1,
      code,
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
