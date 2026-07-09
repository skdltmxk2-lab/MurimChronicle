// Read-only audit for question correctness and explanation quality.
//
// Usage:
//   node scripts/audit_question_quality_readonly.mjs
//
// Outputs:
//   tmp/audit/question_quality_audit_report.json
//   tmp/audit/question_quality_issues.csv
//   tmp/audit/question_quality_review_queue.json
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const outDir = resolve(root, "tmp", "audit");
mkdirSync(outDir, { recursive: true });

const envText = readFileSync(resolve(root, ".env.local"), "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return [key.trim(), rest.join("=").trim()];
    }),
);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) throw new Error("Missing Supabase credentials in .env.local");

const sb = createClient(supabaseUrl, supabaseKey);
const PAGE = 1000;

async function fetchAllQuestions() {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb
      .from("questions")
      .select("id, subject, unit, concept, difficulty, source_type, pool, question, content_type, question_image, question_type, options, correct_option_id, answer_text, explanation, explanation_content_type, explanation_image, tags, created_at, updated_at")
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows;
}

function normalize(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function compact(value) {
  return normalize(value).replace(/\s+/g, "");
}

function excerpt(value, max = 240) {
  const text = normalize(value);
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function csvCell(value) {
  const text = value == null ? "" : typeof value === "string" ? value : JSON.stringify(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function options(q) {
  return Array.isArray(q.options) ? q.options : [];
}

function optionsText(q) {
  return options(q).map((option) => option?.text ?? "").join("\n");
}

function fullText(q) {
  return [q.question, optionsText(q), q.answer_text, q.explanation].join("\n");
}

function mathDensity(text) {
  return (compact(text).match(/\\frac|\\dfrac|\\sqrt|\\sum|\\int|\\lim|\\begin|\\det|\\partial|\\nabla|\\Gamma|\^|_/g) ?? []).length;
}

function mapAnswerToken(token) {
  const text = String(token ?? "").trim();
  const circled = "①②③④⑤⑥⑦⑧⑨";
  const circledIndex = circled.indexOf(text);
  if (circledIndex >= 0) return String(circledIndex + 1);
  return text.replace(/[()]/g, "").trim();
}

function extractAnswerMarkers(text) {
  return [
    ...String(text ?? "").matchAll(/(?:정답|답)\s*[:：]\s*\(?\s*([1-9][0-9]?|[①②③④⑤⑥⑦⑧⑨])\s*\)?/g),
  ].map((match) => mapAnswerToken(match[1]));
}

function issueBase(q) {
  return {
    id: q.id,
    subject: q.subject,
    unit: q.unit,
    concept: q.concept,
    difficulty: q.difficulty,
    excerpt: excerpt(q.question),
  };
}

const PROCESS_ARTIFACTS = [
  /잠깐/,
  /다시\s*보면/,
  /^\s*음[,\.…]/m,
  /그놈/,
  /류갓티비/,
  /출제\s*의도상/,
  /확인\s*필요|TODO|FIXME|임시|미완|모름|불명/,
];

const ERROR_WORDS = [
  /정답\s*오류|문제\s*오류|해설\s*오류/,
  /오타\s*의심|틀린\s*해설/,
  /보기\s*오류|선지\s*오류/,
];

const NON_EXPLANATION = [
  /^답\s*[:：]?\s*(?:[1-9][0-9]?|[①②③④⑤⑥⑦⑧⑨]|[-+]?[\w\\{}^_/$]+)\.?$/,
  /^정답\s*[:：]?\s*(?:[1-9][0-9]?|[①②③④⑤⑥⑦⑧⑨]|[-+]?[\w\\{}^_/$]+)\.?$/,
  /^계산하면\s*(?:된다|끝)\.?$/,
  /^공식\s*적용\.?$/,
];

function hasPattern(text, patterns) {
  return patterns.filter((pattern) => pattern.test(text)).map(String);
}

console.log("Fetching questions...");
const questions = await fetchAllQuestions();
console.log(`Fetched ${questions.length} questions.`);

const issues = [];
function addIssue(issue) {
  issues.push(issue);
}

for (const q of questions) {
  const explanation = normalize(q.explanation);
  const question = normalize(q.question);
  const allText = normalize(fullText(q));
  const opts = options(q);
  const isSubjective =
    q.question_type === "subjective" || (opts.length === 0 && normalize(q.answer_text));
  const currentCorrect = normalize(q.correct_option_id);
  const qMathDensity = mathDensity([q.question, optionsText(q)].join("\n"));
  const explanationMathDensity = mathDensity(q.explanation);
  const complexityScore =
    qMathDensity +
    (question.length > 450 ? 4 : question.length > 260 ? 2 : 0) +
    (opts.length >= 5 ? 1 : 0) +
    (/(옳은\s*것|모두|보기|ㄱ\.|ㄴ\.|ㄷ\.|가\)|나\)|다\))/.test(allText) ? 3 : 0);

  if (explanation) {
    const processHits = hasPattern(explanation, PROCESS_ARTIFACTS);
    if (processHits.length) {
      addIssue({
        severity: "P1",
        category: "quality",
        code: "explanation_process_artifact",
        ...issueBase(q),
        message: "Explanation contains draft/process wording that should not be shown to students.",
        reasons: processHits,
        field: "explanation",
        evidence: excerpt(q.explanation),
      });
    }

    const errorHits = hasPattern(allText, ERROR_WORDS);
    if (errorHits.length) {
      addIssue({
        severity: "P1",
        category: "quality",
        code: "content_mentions_possible_error",
        ...issueBase(q),
        message: "Question content mentions a possible problem, answer, or explanation error.",
        reasons: errorHits,
        field: "question/explanation",
        evidence: excerpt(allText),
      });
    }

    const answerMarkers = extractAnswerMarkers(q.explanation);
    const distinctMarkers = [...new Set(answerMarkers)];
    if (!isSubjective && currentCorrect && distinctMarkers.length > 0) {
      const finalMarker = distinctMarkers.at(-1);
      if (finalMarker !== currentCorrect) {
        addIssue({
          severity: "P1",
          category: "answer",
          code: "explanation_answer_marker_mismatch",
          ...issueBase(q),
          message: "Explanation answer marker differs from correct_option_id.",
          reasons: [`correct=${currentCorrect}`, `markers=${distinctMarkers.join(",")}`],
          field: "explanation",
          evidence: excerpt(q.explanation),
        });
      } else if (distinctMarkers.length > 1) {
        addIssue({
          severity: "P2",
          category: "answer",
          code: "explanation_multiple_answer_markers",
          ...issueBase(q),
          message: "Explanation contains multiple answer markers.",
          reasons: [`correct=${currentCorrect}`, `markers=${distinctMarkers.join(",")}`],
          field: "explanation",
          evidence: excerpt(q.explanation),
        });
      }
    }

    if (NON_EXPLANATION.some((pattern) => pattern.test(explanation))) {
      addIssue({
        severity: "P2",
        category: "quality",
        code: "explanation_answer_only",
        ...issueBase(q),
        message: "Explanation appears to contain only an answer, not reasoning.",
        reasons: [`length=${explanation.length}`],
        field: "explanation",
        evidence: excerpt(q.explanation),
      });
    } else if (explanation.length < 40 && complexityScore >= 7) {
      addIssue({
        severity: "P2",
        category: "quality",
        code: "explanation_too_thin_for_complexity",
        ...issueBase(q),
        message: "Explanation is short compared with the problem complexity.",
        reasons: [`length=${explanation.length}`, `complexity=${complexityScore}`, `questionMathDensity=${qMathDensity}`],
        field: "explanation",
        evidence: excerpt(q.explanation),
      });
    } else if (
      (explanation.length < 70 && complexityScore >= 7) ||
      (explanation.length < 45 && (qMathDensity >= 5 || question.length >= 220))
    ) {
      addIssue({
        severity: "P3",
        category: "quality",
        code: "explanation_maybe_thin",
        ...issueBase(q),
        message: "Explanation may be too short.",
        reasons: [`length=${explanation.length}`, `questionMathDensity=${qMathDensity}`],
        field: "explanation",
        evidence: excerpt(q.explanation),
      });
    }

    if (complexityScore >= 9 && explanationMathDensity === 0 && explanation.length < 160) {
      addIssue({
        severity: "P3",
        category: "quality",
        code: "complex_problem_low_math_explanation",
        ...issueBase(q),
        message: "Complex math problem has an explanation with little mathematical detail.",
        reasons: [`complexity=${complexityScore}`, `explanationMathDensity=${explanationMathDensity}`],
        field: "explanation",
        evidence: excerpt(q.explanation),
      });
    }
  } else {
    addIssue({
      severity: "P2",
      category: "quality",
      code: "missing_explanation",
      ...issueBase(q),
      message: "Explanation is empty.",
      reasons: [],
      field: "explanation",
    });
  }
}

const severityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
issues.sort((a, b) => {
  const bySeverity = (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9);
  if (bySeverity) return bySeverity;
  const byCode = a.code.localeCompare(b.code);
  if (byCode) return byCode;
  return a.id.localeCompare(b.id);
});

const countBy = (items, keyFn) =>
  items.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

const questionsById = new Map(questions.map((q) => [q.id, q]));
const issuesByQuestion = new Map();
for (const issue of issues) {
  if (!issuesByQuestion.has(issue.id)) issuesByQuestion.set(issue.id, []);
  issuesByQuestion.get(issue.id).push(issue);
}

const reviewQueue = [...issuesByQuestion.entries()].map(([id, rowIssues]) => {
  const q = questionsById.get(id);
  return {
    id,
    severities: [...new Set(rowIssues.map((issue) => issue.severity))].sort(),
    categories: [...new Set(rowIssues.map((issue) => issue.category))].sort(),
    codes: [...new Set(rowIssues.map((issue) => issue.code))].sort(),
    issues: rowIssues,
    subject: q?.subject,
    unit: q?.unit,
    concept: q?.concept,
    difficulty: q?.difficulty,
    question: q?.question,
    options: q?.options,
    correct_option_id: q?.correct_option_id,
    answer_text: q?.answer_text,
    explanation: q?.explanation,
    question_image: q?.question_image,
    explanation_image: q?.explanation_image,
    tags: q?.tags,
  };
});

const summary = {
  generatedAt: new Date().toISOString(),
  questionCount: questions.length,
  issueCount: issues.length,
  reviewQuestionCount: reviewQueue.length,
  severityCounts: countBy(issues, (issue) => issue.severity),
  categoryCounts: countBy(issues, (issue) => issue.category),
  codeCounts: countBy(issues, (issue) => issue.code),
};

writeFileSync(
  resolve(outDir, "question_quality_audit_report.json"),
  `${JSON.stringify({ summary, issues }, null, 2)}\n`,
);
writeFileSync(
  resolve(outDir, "question_quality_review_queue.json"),
  `${JSON.stringify(reviewQueue, null, 2)}\n`,
);
writeFileSync(
  resolve(outDir, "question_quality_issues.csv"),
  [
    [
      "severity",
      "category",
      "code",
      "id",
      "subject",
      "unit",
      "concept",
      "difficulty",
      "field",
      "message",
      "reasons",
      "excerpt",
      "evidence",
    ].map(csvCell).join(","),
    ...issues.map((issue) =>
      [
        issue.severity,
        issue.category,
        issue.code,
        issue.id,
        issue.subject,
        issue.unit,
        issue.concept,
        issue.difficulty,
        issue.field,
        issue.message,
        issue.reasons,
        issue.excerpt,
        issue.evidence,
      ].map(csvCell).join(",")
    ),
  ].join("\n"),
);

console.log("\n=== Question Quality Audit ===");
console.log(JSON.stringify(summary, null, 2));
console.log("\nTop issue codes:");
for (const [code, count] of Object.entries(summary.codeCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`- ${code}: ${count}`);
}
console.log(`\nReport: ${resolve(outDir, "question_quality_audit_report.json")}`);
console.log(`CSV: ${resolve(outDir, "question_quality_issues.csv")}`);
console.log(`Review queue: ${resolve(outDir, "question_quality_review_queue.json")}`);
