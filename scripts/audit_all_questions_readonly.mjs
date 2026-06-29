// Read-only full DB audit for questions and generated exams.
// Usage:
//   node scripts/audit_all_questions_readonly.mjs
//
// Outputs:
//   tmp/audit/questions_audit_report.json
//   tmp/audit/questions_audit_issues.csv
//   tmp/audit/questions_audit_review_queue_p0_p1.json
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import katex from "katex";

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
const now = new Date().toISOString();

// KaTeX prints font warnings for Hangul inside text mode. They are noisy for an audit run.
console.warn = () => {};

async function fetchAll(table, select) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb
      .from(table)
      .select(select)
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows;
}

function normalizeWhitespace(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function excerpt(value, max = 180) {
  const text = normalizeWhitespace(value);
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function csvCell(value) {
  const text = value == null ? "" : typeof value === "string" ? value : JSON.stringify(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function countDollars(text) {
  return (String(text ?? "").match(/(?<!\\)\$/g) ?? []).length;
}

function splitMath(content) {
  const segments = [];
  const text = String(content ?? "");
  const pattern = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g;
  let lastIndex = 0;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ math: false, text: text.slice(lastIndex, match.index), display: false });
    }
    const token = match[0];
    const display = token.startsWith("$$");
    segments.push({
      math: true,
      display,
      text: display ? token.slice(2, -2) : token.slice(1, -1),
    });
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) segments.push({ math: false, text: text.slice(lastIndex), display: false });
  return segments;
}

function outsideMath(content) {
  return splitMath(content)
    .filter((segment) => !segment.math)
    .map((segment) => segment.text)
    .join(" ");
}

function fieldList(q) {
  const opts = Array.isArray(q.options) ? q.options : [];
  return [
    { field: "question", text: q.question ?? "" },
    ...opts.map((option) => ({ field: `option:${option?.id ?? "?"}`, text: option?.text ?? "" })),
    { field: "explanation", text: q.explanation ?? "" },
    { field: "answer_text", text: q.answer_text ?? "" },
  ];
}

function localPublicExists(imagePath) {
  if (!imagePath || typeof imagePath !== "string") return false;
  if (!imagePath.startsWith("/")) return true;
  return existsSync(join(root, "public", imagePath.replace(/^\/+/, "")));
}

function mapAnswerToken(token) {
  const text = String(token ?? "").trim();
  const circled = "①②③④⑤⑥⑦⑧⑨";
  const idx = circled.indexOf(text);
  if (idx >= 0) return String(idx + 1);
  return text.replace(/[()]/g, "").trim();
}

function extractExplanationAnswer(explanation) {
  const text = String(explanation ?? "");
  const rx = /(?:\uC815\uB2F5|\uB2F5)\s*[:：]\s*\(?\s*([1-9][0-9]?|[①②③④⑤⑥⑦⑧⑨])\s*\)?/g;
  const answers = [...text.matchAll(rx)].map((match) => mapAnswerToken(match[1]));
  return answers.length ? answers[answers.length - 1] : "";
}

function normalizedOptionText(option) {
  return normalizeWhitespace(option?.text ?? "")
    .replace(/^\$|\$$/g, "")
    .replace(/\s+/g, "");
}

function normalizeQuestionForDuplicate(question) {
  return normalizeWhitespace(question)
    .replace(/\$\$/g, "$")
    .replace(/\s+/g, "")
    .slice(0, 2000);
}

function severityRank(severity) {
  return { P0: 0, P1: 1, P2: 2, P3: 3 }[severity] ?? 9;
}

const issues = [];
function addIssue({ severity, code, table = "questions", id, field = "", message, excerpt: issueExcerpt = "", meta = {} }) {
  issues.push({
    severity,
    code,
    table,
    id: String(id ?? ""),
    field,
    message,
    excerpt: issueExcerpt,
    meta,
  });
}

function validateLatex(q, field, text) {
  const value = String(text ?? "");
  if (!value) return;
  const dollarCount = countDollars(value);
  if (dollarCount % 2 !== 0) {
    addIssue({
      severity: "P0",
      code: "latex_odd_dollar",
      id: q.id,
      field,
      message: "Unmatched dollar delimiter count.",
      excerpt: excerpt(value),
      meta: { dollarCount },
    });
    return;
  }
  for (const segment of splitMath(value)) {
    if (!segment.math || !segment.text.trim()) continue;
    try {
      katex.renderToString(segment.text, {
        displayMode: segment.display,
        throwOnError: true,
        strict: false,
      });
    } catch (error) {
      addIssue({
        severity: "P0",
        code: "latex_render_error",
        id: q.id,
        field,
        message: error.message,
        excerpt: excerpt(segment.text),
        meta: { display: segment.display },
      });
    }
  }
}

function auditQuestion(q) {
  const optionsValidArray = Array.isArray(q.options);
  const options = optionsValidArray ? q.options : [];
  const optionIds = options.map((option) => String(option?.id ?? ""));
  const nonEmptyOptionIds = optionIds.filter(Boolean);
  const idSet = new Set(nonEmptyOptionIds);
  const questionType = q.question_type ?? "multiple_choice";
  const isSubjective = questionType === "subjective" || (options.length === 0 && normalizeWhitespace(q.answer_text));

  if (!normalizeWhitespace(q.question) && !q.question_image) {
    addIssue({
      severity: "P0",
      code: "missing_question",
      id: q.id,
      field: "question",
      message: "Question text and question image are both empty.",
    });
  }

  if (!optionsValidArray) {
    addIssue({
      severity: "P0",
      code: "invalid_options_json",
      id: q.id,
      field: "options",
      message: "Options is not an array.",
      excerpt: excerpt(q.options),
    });
  }

  if (nonEmptyOptionIds.length !== idSet.size) {
    addIssue({
      severity: "P0",
      code: "duplicate_option_id",
      id: q.id,
      field: "options",
      message: "Duplicate option IDs.",
      meta: { optionIds },
    });
  }

  if (isSubjective) {
    if (!normalizeWhitespace(q.answer_text)) {
      addIssue({
        severity: "P0",
        code: "missing_subjective_answer",
        id: q.id,
        field: "answer_text",
        message: "Subjective question has no answer_text.",
      });
    }
  } else if (options.length > 0) {
    const correct = String(q.correct_option_id ?? "").trim();
    if (!correct) {
      addIssue({
        severity: "P0",
        code: "missing_correct_option",
        id: q.id,
        field: "correct_option_id",
        message: "Multiple-choice question has no correct option ID.",
        meta: { optionIds },
      });
    } else if (!idSet.has(correct)) {
      addIssue({
        severity: "P0",
        code: "correct_option_not_in_options",
        id: q.id,
        field: "correct_option_id",
        message: "correct_option_id is outside the actual option IDs.",
        meta: { correct, optionIds },
      });
    }
  } else if (!normalizeWhitespace(q.answer_text)) {
    addIssue({
      severity: "P0",
      code: "missing_answer",
      id: q.id,
      field: "correct_option_id",
      message: "Question has no options and no answer_text.",
      meta: { questionType },
    });
  }

  if (!isSubjective && options.length > 0 && (options.length < 2 || options.length > 8)) {
    addIssue({
      severity: "P1",
      code: "unusual_option_count",
      id: q.id,
      field: "options",
      message: "Option count is unusual. This is not automatically wrong.",
      meta: { count: options.length, optionIds },
    });
  }

  if (!isSubjective && options.length === 0) {
    addIssue({
      severity: "P1",
      code: "objective_options_missing",
      id: q.id,
      field: "options",
      message: "Question is not marked subjective but has no options.",
      meta: { questionType },
    });
  }

  for (const option of options) {
    if (!normalizeWhitespace(option?.text) && !normalizeWhitespace(option?.image)) {
      addIssue({
        severity: "P0",
        code: "empty_option",
        id: q.id,
        field: `option:${option?.id ?? "?"}`,
        message: "Option text and image are both empty.",
      });
    }
  }

  const optionTextGroups = new Map();
  for (const option of options) {
    const key = normalizedOptionText(option);
    if (!key) continue;
    if (!optionTextGroups.has(key)) optionTextGroups.set(key, []);
    optionTextGroups.get(key).push(String(option.id ?? ""));
  }
  for (const [key, ids] of optionTextGroups.entries()) {
    if (ids.length > 1) {
      addIssue({
        severity: "P1",
        code: "duplicate_option_text",
        id: q.id,
        field: "options",
        message: "Two or more options have the same normalized text.",
        excerpt: key.slice(0, 120),
        meta: { optionIds: ids },
      });
    }
  }

  const explanationAnswer = extractExplanationAnswer(q.explanation);
  const correct = String(q.correct_option_id ?? "").trim();
  if (!isSubjective && explanationAnswer && correct && explanationAnswer !== correct) {
    addIssue({
      severity: "P1",
      code: "explanation_answer_mismatch",
      id: q.id,
      field: "explanation",
      message: "Answer marker in explanation differs from correct_option_id.",
      meta: { correct_option_id: correct, explanationAnswer },
    });
  }

  const artifactRx = /!\[[^\]]*\]\(|cdn\.mathpix|@@SECTION|\\section\*|\\begin\{tabular\}/;
  for (const item of fieldList(q)) {
    const text = String(item.text ?? "");
    if (artifactRx.test(text)) {
      addIssue({
        severity: "P1",
        code: "ocr_artifact",
        id: q.id,
        field: item.field,
        message: "OCR or source artifact remains in content.",
        excerpt: excerpt(text),
      });
    }
    validateLatex(q, item.field, text);

    const outside = outsideMath(text);
    const outsideLatex = outside.match(/\\(?:frac|sqrt|sum|int|lim|left|right|begin|end|theta|pi|alpha|beta|gamma|infty|mathbb|vec|overrightarrow)\b/);
    if (outsideLatex) {
      addIssue({
        severity: "P2",
        code: "latex_command_outside_math",
        id: q.id,
        field: item.field,
        message: "A LaTeX command appears outside $...$ delimiters.",
        excerpt: excerpt(outside.slice(Math.max(0, outsideLatex.index - 60), outsideLatex.index + 120)),
        meta: { command: outsideLatex[0] },
      });
    }
  }

  if (!normalizeWhitespace(q.explanation)) {
    addIssue({
      severity: "P2",
      code: "missing_explanation",
      id: q.id,
      field: "explanation",
      message: "Explanation is empty.",
    });
  } else if (normalizeWhitespace(q.explanation).length < 30) {
    addIssue({
      severity: "P2",
      code: "thin_explanation",
      id: q.id,
      field: "explanation",
      message: "Explanation is very short.",
      excerpt: excerpt(q.explanation),
      meta: { length: normalizeWhitespace(q.explanation).length },
    });
  }

  if ((q.content_type === "image" || q.content_type === "mixed") && !q.question_image) {
    addIssue({
      severity: normalizeWhitespace(q.question) ? "P1" : "P0",
      code: "question_image_missing",
      id: q.id,
      field: "question_image",
      message: "content_type expects a question image, but question_image is empty.",
      meta: { content_type: q.content_type },
    });
  }
  if ((q.explanation_content_type === "image" || q.explanation_content_type === "mixed") && !q.explanation_image) {
    addIssue({
      severity: normalizeWhitespace(q.explanation) ? "P1" : "P0",
      code: "explanation_image_missing",
      id: q.id,
      field: "explanation_image",
      message: "explanation_content_type expects an image, but explanation_image is empty.",
      meta: { explanation_content_type: q.explanation_content_type },
    });
  }
  if (q.question_image && !localPublicExists(q.question_image)) {
    addIssue({
      severity: "P0",
      code: "question_image_file_missing",
      id: q.id,
      field: "question_image",
      message: "Local question image path does not exist under public/.",
      excerpt: q.question_image,
    });
  }
  if (q.explanation_image && !localPublicExists(q.explanation_image)) {
    addIssue({
      severity: "P0",
      code: "explanation_image_file_missing",
      id: q.id,
      field: "explanation_image",
      message: "Local explanation image path does not exist under public/.",
      excerpt: q.explanation_image,
    });
  }
  if (q.question_image && !["image", "mixed"].includes(q.content_type ?? "")) {
    addIssue({
      severity: "P2",
      code: "question_image_content_type_mismatch",
      id: q.id,
      field: "content_type",
      message: "question_image exists but content_type is not image or mixed.",
      meta: { content_type: q.content_type, question_image: q.question_image },
    });
  }
  if (q.explanation_image && !["image", "mixed"].includes(q.explanation_content_type ?? "")) {
    addIssue({
      severity: "P2",
      code: "explanation_image_content_type_mismatch",
      id: q.id,
      field: "explanation_content_type",
      message: "explanation_image exists but explanation_content_type is not image or mixed.",
      meta: { explanation_content_type: q.explanation_content_type, explanation_image: q.explanation_image },
    });
  }

  const pictureHint = /(아래\s*그림|위\s*그림|다음\s*그림|그림과\s*같이|그림에|<\s*그림\s*>)/;
  if (!q.question_image && pictureHint.test(q.question ?? "")) {
    addIssue({
      severity: "P2",
      code: "possible_missing_question_image",
      id: q.id,
      field: "question_image",
      message: "Question mentions a figure but has no question_image.",
      excerpt: excerpt(q.question),
    });
  }
}

function auditGeneratedExam(exam, questionIds) {
  const problems = Array.isArray(exam.problems) ? exam.problems : [];
  const sourceIds = Array.isArray(exam.source_question_ids) ? exam.source_question_ids : [];
  const problemIds = problems.map((problem) => String(problem?.id ?? "")).filter(Boolean);
  const problemById = new Map(problems.map((problem) => [String(problem?.id ?? ""), problem]));
  const sourceSet = new Set(sourceIds.map(String));
  const problemSet = new Set(problemIds);

  function hasUsableSnapshot(problem) {
    if (!problem) return false;
    const opts = Array.isArray(problem?.options) ? problem.options : [];
    const correct = normalizeWhitespace(problem?.correctOptionId ?? problem?.correct_option_id ?? "");
    const answer = normalizeWhitespace(problem?.answerText ?? problem?.answer_text ?? "");
    return Boolean(normalizeWhitespace(problem?.question) && (answer || (opts.length >= 2 && correct)));
  }

  for (const id of [...new Set([...sourceSet, ...problemSet])]) {
    if (!questionIds.has(id)) {
      const problem = problemById.get(id);
      if (hasUsableSnapshot(problem)) {
        addIssue({
          severity: "P2",
          code: "generated_exam_stale_question_reference",
          table: "generated_exams",
          id: exam.id,
          field: "problems",
          message: "Generated exam has a usable problem snapshot, but its original question ID is not present in questions.",
          meta: { questionId: id },
        });
        continue;
      }
      addIssue({
        severity: "P0",
        code: "generated_exam_missing_question",
        table: "generated_exams",
        id: exam.id,
        field: "problems",
        message: "Generated exam references a question ID not present in questions.",
        meta: { questionId: id },
      });
    }
  }

  if (problemIds.length !== problemSet.size) {
    addIssue({
      severity: "P1",
      code: "generated_exam_duplicate_problem",
      table: "generated_exams",
      id: exam.id,
      field: "problems",
      message: "Generated exam contains duplicated problem IDs.",
      meta: { problemIds },
    });
  }

  const missingFromProblems = sourceIds.map(String).filter((id) => !problemSet.has(id));
  const missingFromSource = problemIds.filter((id) => !sourceSet.has(id));
  if (missingFromProblems.length || missingFromSource.length) {
    addIssue({
      severity: "P1",
      code: "generated_exam_source_problem_mismatch",
      table: "generated_exams",
      id: exam.id,
      field: "source_question_ids",
      message: "source_question_ids and problems IDs differ.",
      meta: { missingFromProblems, missingFromSource },
    });
  }

  for (const problem of problems) {
    const opts = Array.isArray(problem?.options) ? problem.options : [];
    const correct = String(problem?.correctOptionId ?? problem?.correct_option_id ?? "").trim();
    if (opts.length > 0 && correct && !opts.some((option) => String(option?.id ?? "") === correct)) {
      addIssue({
        severity: "P0",
        code: "generated_exam_correct_not_in_options",
        table: "generated_exams",
        id: exam.id,
        field: `problem:${problem?.id ?? "?"}`,
        message: "Problem correctOptionId is outside its option IDs.",
        meta: { correctOptionId: correct, optionIds: opts.map((option) => option?.id) },
      });
    }
  }
}

console.log("Fetching questions...");
const questions = await fetchAll(
  "questions",
  "id, subject, unit, concept, difficulty, source_type, pool, question, content_type, question_image, question_type, options, correct_option_id, answer_text, explanation, explanation_content_type, explanation_image, tags, created_at, updated_at",
);
console.log(`Fetched ${questions.length} questions.`);

console.log("Fetching generated_exams...");
const generatedExams = await fetchAll(
  "generated_exams",
  "id, title, tags, problems, source_question_ids, created_at, generation_summary",
);
console.log(`Fetched ${generatedExams.length} generated exams.`);

const questionIds = new Set(questions.map((q) => String(q.id)));
const questionDuplicateMap = new Map();
const optionCountDistribution = {};
const questionTypeDistribution = {};
const contentTypeDistribution = {};

for (const q of questions) {
  auditQuestion(q);
  const options = Array.isArray(q.options) ? q.options : [];
  optionCountDistribution[options.length] = (optionCountDistribution[options.length] ?? 0) + 1;
  questionTypeDistribution[q.question_type ?? "null"] = (questionTypeDistribution[q.question_type ?? "null"] ?? 0) + 1;
  contentTypeDistribution[q.content_type ?? "null"] = (contentTypeDistribution[q.content_type ?? "null"] ?? 0) + 1;
  const key = normalizeQuestionForDuplicate(q.question);
  if (key.length >= 40) {
    if (!questionDuplicateMap.has(key)) questionDuplicateMap.set(key, []);
    questionDuplicateMap.get(key).push(q.id);
  }
}

for (const [key, ids] of questionDuplicateMap.entries()) {
  if (ids.length > 1) {
    for (const id of ids) {
      addIssue({
        severity: "P3",
        code: "duplicate_question_text",
        id,
        field: "question",
        message: "Question text duplicates another row after normalization.",
        excerpt: key.slice(0, 160),
        meta: { duplicateIds: ids },
      });
    }
  }
}

for (const exam of generatedExams) auditGeneratedExam(exam, questionIds);

issues.sort((a, b) => {
  const bySeverity = severityRank(a.severity) - severityRank(b.severity);
  if (bySeverity) return bySeverity;
  const byCode = a.code.localeCompare(b.code);
  if (byCode) return byCode;
  return a.id.localeCompare(b.id);
});

const severityCounts = {};
const codeCounts = {};
for (const issue of issues) {
  severityCounts[issue.severity] = (severityCounts[issue.severity] ?? 0) + 1;
  codeCounts[issue.code] = (codeCounts[issue.code] ?? 0) + 1;
}

const summary = {
  generatedAt: now,
  questionCount: questions.length,
  generatedExamCount: generatedExams.length,
  issueCount: issues.length,
  severityCounts,
  codeCounts,
  optionCountDistribution,
  questionTypeDistribution,
  contentTypeDistribution,
};

const issuesById = new Map();
for (const issue of issues.filter((item) => item.severity === "P0" || item.severity === "P1")) {
  if (!issuesById.has(issue.id)) issuesById.set(issue.id, []);
  issuesById.get(issue.id).push(issue);
}
const questionById = new Map(questions.map((q) => [q.id, q]));
const reviewQueue = [...issuesById.entries()]
  .filter(([id]) => questionById.has(id))
  .map(([id, rowIssues]) => {
    const q = questionById.get(id);
    return {
      id,
      severities: [...new Set(rowIssues.map((issue) => issue.severity))].sort(),
      codes: [...new Set(rowIssues.map((issue) => issue.code))].sort(),
      issues: rowIssues,
      question: q.question,
      options: q.options,
      correct_option_id: q.correct_option_id,
      answer_text: q.answer_text,
      explanation: q.explanation,
      question_image: q.question_image,
      explanation_image: q.explanation_image,
      tags: q.tags,
    };
  });

const reportPath = join(outDir, "questions_audit_report.json");
const csvPath = join(outDir, "questions_audit_issues.csv");
const queuePath = join(outDir, "questions_audit_review_queue_p0_p1.json");

writeFileSync(reportPath, JSON.stringify({ summary, issues }, null, 2), "utf8");
writeFileSync(
  csvPath,
  [
    ["severity", "code", "table", "id", "field", "message", "excerpt", "meta"].map(csvCell).join(","),
    ...issues.map((issue) =>
      [
        issue.severity,
        issue.code,
        issue.table,
        issue.id,
        issue.field,
        issue.message,
        issue.excerpt,
        issue.meta,
      ].map(csvCell).join(","),
    ),
  ].join("\n"),
  "utf8",
);
writeFileSync(queuePath, JSON.stringify(reviewQueue, null, 2), "utf8");

console.log("\n=== Audit Summary ===");
console.log(JSON.stringify(summary, null, 2));
console.log("\nTop issue codes:");
for (const [code, count] of Object.entries(codeCounts).sort((a, b) => b[1] - a[1]).slice(0, 20)) {
  console.log(`- ${code}: ${count}`);
}
console.log(`\nReport: ${reportPath}`);
console.log(`CSV: ${csvPath}`);
console.log(`P0/P1 review queue: ${queuePath}`);
