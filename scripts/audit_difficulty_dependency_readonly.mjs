// Read-only audit for question difficulty labels and external dependencies.
//
// Usage:
//   node scripts/audit_difficulty_dependency_readonly.mjs
//
// Outputs:
//   tmp/audit/difficulty_dependency_audit_report.json
//   tmp/audit/difficulty_dependency_issues.csv
//   tmp/audit/difficulty_dependency_review_queue.json
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
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

const DIFFICULTY_ORDER = ["easy", "easyMedium", "medium", "mediumHard", "hard", "killer"];
const DIFFICULTY_LABEL = {
  easy: "하",
  easyMedium: "중하",
  medium: "중",
  mediumHard: "중상",
  hard: "상",
  killer: "킬러",
};
const DIFFICULTY_INDEX = Object.fromEntries(DIFFICULTY_ORDER.map((key, index) => [key, index]));

const UNIT_BASE = new Map(
  Object.entries({
    "미분학|함수": 1,
    "미분학|극한과 연속": 1,
    "미분학|미분": 1,
    "미분학|도함수의 응용": 2,
    "미분학|접선의 방정식": 1,
    "미분학|평균값의 정리 및 로피탈 정리": 2,
    "미분학|Taylor급수": 3,
    "미분학|곡선의 개형": 2,
    "미분학|최대/최소": 2,
    "미분학|순간 변화율": 1,
    "적분학|부정적분": 1,
    "적분학|정적분의 계산": 2,
    "적분학|정적분과 무한급수": 3,
    "적분학|정적분의 성질": 2,
    "적분학|특이적분": 3,
    "적분학|Maclaurin급수의 응용": 3,
    "적분학|급수의 수렴/발산": 3,
    "적분학|정적분의 응용": 3,
    "적분학|극좌표와 응용": 3,
    "선형대수|행렬": 2,
    "선형대수|벡터와 공간도형": 2,
    "선형대수|벡터공간": 3,
    "선형대수|고유치와 대각화": 3,
    "선형대수|선형사상": 3,
    "다변수함수|편도함수": 2,
    "다변수함수|경도 및 방향도함수": 3,
    "다변수함수|곡선과 곡면": 3,
    "다변수함수|Taylor급수와 최대/최소": 4,
    "다변수함수|중적분": 3,
    "다변수함수|체적과 곡면적": 4,
    "다변수함수|삼중적분과 극좌표계": 4,
    "다변수함수|무한급수": 3,
    "다변수함수|선적분과 면적분": 4,
    "공학수학|복소수": 2,
    "공학수학|미분방정식": 3,
    "공학수학|Laplace변환": 3,
    "공학수학|푸리에(Fourier) 급수": 4,
    "공학수학|벡터해석": 4,
  }),
);

const HIGH_KEYWORDS = [
  /킬러|고난도|심화/,
  /라그랑주\s*승수|음함수\s*정리|역함수\s*정리/,
  /Jordan|조르당|최소다항식|Cayley[-\s]*Hamilton|케일리/,
  /Stokes|스토크스|Green\s*정리|그린\s*정리|발산\s*정리|Gauss\s*정리/,
  /푸리에|Fourier|PDE|편미분방정식|유수|residue|해석함수/,
  /\\iiint|\\iint|\\nabla|curl|div|rot/,
];

const MID_KEYWORDS = [
  /매개변수|극좌표|극방정식|특이적분|이상적분/,
  /고유값|고유치|대각화|벡터공간|선형사상|선형변환/,
  /중적분|삼중적분|선적분|면적분|곡면적|방향도함수|경도/,
  /라플라스|Laplace|미분방정식|Maclaurin|Taylor/,
];

const EASY_KEYWORDS = [
  /정의에\s*의하여|기본\s*공식|직접\s*계산|계산하면/,
  /다음\s*(?:극한값|미분계수|도함수|부정적분)을?\s*구하/,
];

const VISUAL_STRONG = [
  /(?:아래|위|다음|오른쪽|왼쪽)\s*(?:그림|그래프|표)/,
  /그림(?:에서|처럼|과\s*같이|와\s*같이|에\s*나타낸|을\s*보|를\s*보)/,
  /그래프(?:처럼|와\s*같이|과\s*같이|에\s*나타낸|가\s*주어|를\s*보|을\s*보)/,
  /(?<!좌)(?<!부)표(?:에서|와\s*같이|과\s*같이|에\s*나타낸|를\s*이용|를\s*보|을\s*보)/,
  /색칠한\s*(?:부분|영역)|음영\s*(?:부분|영역)/,
  /좌표평면\s*위의\s*(?:그림|영역)|평면\s*위의\s*(?:그림|영역)/,
];

const VISUAL_WEAK = [
  /영역\s*[DR]\b|폐영역\s*[DR]\b|곡선\s*[C]\b|곡면\s*[S]\b/,
  /(?:아래|위|다음|오른쪽|왼쪽)\s*도형|두\s*그래프/,
];

const CONTEXT_STRONG = [
  /앞(?:의|에서|서)\s*(?:문제|결과|조건|설명)/,
  /위(?:의|에서)\s*(?:문제|결과|조건|설명|식)/,
  /이전\s*(?:문제|결과|조건)/,
  /(?:문제|문항)\s*\d+\s*(?:에서|의|과|를|을)/,
  /\d+\s*번\s*(?:문제|문항)?\s*(?:에서|의|과|를|을)/,
  /다음\s*물음에\s*답하시오/,
];

const CONTEXT_WEAK = [
  /연계|묶음\s*문제|공통\s*조건/,
  /위\s*식|위와\s*같이|위의\s*함수|앞서/,
  /\((?:가|나|다)\)\s*(?:에서|의\s*결과)/,
];

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

function excerpt(value, max = 220) {
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
  return [q.concept, q.question, optionsText(q), q.answer_text, q.explanation].join("\n");
}

function hasQuestionVisual(q) {
  if (normalize(q.question_image)) return true;
  return options(q).some((option) => normalize(option?.image));
}

function hasInlineVisualData(text) {
  return /\\begin\{(?:array|tabular|matrix|pmatrix|bmatrix|vmatrix)\}|(?:\|[^|\n]+){3,}\||\\begin\{cases\}/.test(text);
}

function localPublicExists(imagePath) {
  if (!imagePath || typeof imagePath !== "string") return false;
  if (!imagePath.startsWith("/")) return true;
  return existsSync(join(root, "public", imagePath.replace(/^\/+/, "")));
}

function matchPatterns(text, patterns) {
  return patterns.filter((pattern) => pattern.test(text)).map(String);
}

function hasInlineContext(text) {
  // If a shared stem is visibly present inside the same row, avoid over-flagging.
  return /(?:다음|아래)\s*(?:조건|설명|자료|표|보기|식을|함수|행렬|벡터|미분방정식)/.test(text);
}

function estimateDifficulty(q) {
  const text = fullText(q);
  const normalized = normalize(text);
  const base = UNIT_BASE.get(`${q.subject}|${q.unit}`) ?? 2;
  let score = base;
  const reasons = [`unitBase=${base}`];

  const highHits = matchPatterns(normalized, HIGH_KEYWORDS);
  const midHits = matchPatterns(normalized, MID_KEYWORDS);
  const easyHits = matchPatterns(normalized, EASY_KEYWORDS);
  if (highHits.length) {
    score += 1;
    reasons.push(`highKeyword=${highHits.slice(0, 2).join("|")}`);
  }
  if (midHits.length >= 2) {
    score += 1;
    reasons.push(`multipleMidKeywords=${midHits.slice(0, 3).join("|")}`);
  }
  if (/옳은\s*것을?\s*모두|참인\s*것을?\s*모두|<\s*보기\s*>|ㄱ\.|ㄴ\.|ㄷ\./.test(normalized)) {
    score += 1;
    reasons.push("multiStatement");
  }
  if (q.question_type === "subjective") {
    score += 0.5;
    reasons.push("subjective");
  }
  const lengthScore =
    normalize(q.question).length +
    options(q).reduce((sum, option) => sum + normalize(option?.text).length, 0) +
    Math.min(700, normalize(q.explanation).length);
  if (lengthScore > 1600) {
    score += 1;
    reasons.push(`longContent=${lengthScore}`);
  } else if (lengthScore > 950) {
    score += 0.5;
    reasons.push(`mediumLongContent=${lengthScore}`);
  }
  const mathDensity = (compact(text).match(/\\frac|\\dfrac|\\sqrt|\\sum|\\int|\\lim|\\begin|\\det|\\partial|\^/g) ?? []).length;
  if (mathDensity >= 12) {
    score += 1;
    reasons.push(`mathDensity=${mathDensity}`);
  } else if (mathDensity >= 7) {
    score += 0.5;
    reasons.push(`mathDensity=${mathDensity}`);
  }
  if (easyHits.length && lengthScore < 500 && mathDensity <= 5 && score <= 2.5) {
    score -= 0.5;
    reasons.push(`easyKeyword=${easyHits[0]}`);
  }

  const predictedIndex = Math.max(0, Math.min(5, Math.round(score)));
  return { predictedIndex, predicted: DIFFICULTY_ORDER[predictedIndex], reasons };
}

function hasDifficultyEvidence(reasons) {
  return reasons.some((reason) => !reason.startsWith("unitBase="));
}

function hasStrongDifficultyEvidence(reasons) {
  return reasons.some((reason) =>
    reason.startsWith("highKeyword=") ||
    reason === "multiStatement" ||
    /^mathDensity=(?:1[2-9]|[2-9]\d)/.test(reason) ||
    /^longContent=/.test(reason)
  );
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function groupKey(q, level) {
  if (level === "concept") return `${q.subject}|${q.unit}|${q.concept}`;
  return `${q.subject}|${q.unit}`;
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

console.log("Fetching questions...");
const questions = await fetchAllQuestions();
console.log(`Fetched ${questions.length} questions.`);

const issues = [];
const addIssue = (issue) => issues.push(issue);

for (const q of questions) {
  const qText = normalize(q.question);
  const allText = normalize(fullText(q));
  const visualStrong = matchPatterns(qText, VISUAL_STRONG);
  const visualWeak = matchPatterns(qText, VISUAL_WEAK);
  const contextStrong = matchPatterns(qText, CONTEXT_STRONG);
  const contextWeak = matchPatterns(qText, CONTEXT_WEAK);
  const hasVisual = hasQuestionVisual(q);
  const inlineVisualData = hasInlineVisualData(qText);

  if ((q.content_type === "image" || q.content_type === "mixed") && !normalize(q.question_image)) {
    addIssue({
      severity: normalize(q.question) ? "P1" : "P0",
      category: "dependency",
      code: "declared_question_image_missing",
      ...issueBase(q),
      message: "content_type expects a question image, but question_image is empty.",
      reasons: [`content_type=${q.content_type}`],
    });
  }
  if (normalize(q.question_image) && !localPublicExists(q.question_image)) {
    addIssue({
      severity: "P0",
      category: "dependency",
      code: "question_image_file_missing",
      ...issueBase(q),
      message: "question_image path does not exist under public/.",
      reasons: [q.question_image],
    });
  }
  if (visualStrong.length && !hasVisual && !inlineVisualData) {
    addIssue({
      severity: "P1",
      category: "dependency",
      code: "likely_missing_visual",
      ...issueBase(q),
      message: "Question wording strongly depends on a figure/graph/table, but no question visual is attached.",
      reasons: visualStrong.slice(0, 4),
    });
  } else if (visualWeak.length && !hasVisual && !inlineVisualData && !/영역\s*[DR]\s*[:=]|[DR]\s*=\s*\{/.test(qText)) {
    addIssue({
      severity: "P2",
      category: "dependency",
      code: "possible_missing_visual",
      ...issueBase(q),
      message: "Question may depend on a visual or previously defined region.",
      reasons: visualWeak.slice(0, 4),
    });
  }

  if (contextStrong.length && !hasInlineContext(qText)) {
    addIssue({
      severity: "P1",
      category: "dependency",
      code: "likely_missing_shared_context",
      ...issueBase(q),
      message: "Question appears to reference previous/shared context.",
      reasons: contextStrong.slice(0, 4),
    });
  } else if (contextWeak.length && !hasInlineContext(qText)) {
    addIssue({
      severity: "P2",
      category: "dependency",
      code: "possible_missing_shared_context",
      ...issueBase(q),
      message: "Question may reference previous/shared context.",
      reasons: contextWeak.slice(0, 4),
    });
  }

  const current = DIFFICULTY_INDEX[q.difficulty];
  if (current == null) {
    addIssue({
      severity: "P1",
      category: "difficulty",
      code: "unknown_difficulty",
      ...issueBase(q),
      message: "Difficulty value is outside the app scale.",
      reasons: [`difficulty=${q.difficulty}`],
    });
    continue;
  }

  const estimated = estimateDifficulty(q);
  const delta = estimated.predictedIndex - current;
  const hasEvidence = hasDifficultyEvidence(estimated.reasons);
  const hasStrongEvidence = hasStrongDifficultyEvidence(estimated.reasons);
  if (Math.abs(delta) >= 4 || (Math.abs(delta) >= 3 && (hasEvidence || delta < 0))) {
    addIssue({
      severity: "P1",
      category: "difficulty",
      code: delta > 0 ? "difficulty_probably_too_low" : "difficulty_probably_too_high",
      ...issueBase(q),
      message: `Heuristic estimate is ${DIFFICULTY_LABEL[estimated.predicted]} but current is ${DIFFICULTY_LABEL[q.difficulty]}.`,
      reasons: estimated.reasons,
      meta: { currentIndex: current, predictedIndex: estimated.predictedIndex, delta },
    });
  } else if (Math.abs(delta) >= 3 || (Math.abs(delta) === 2 && hasStrongEvidence)) {
    addIssue({
      severity: "P2",
      category: "difficulty",
      code: delta > 0 ? "difficulty_maybe_too_low" : "difficulty_maybe_too_high",
      ...issueBase(q),
      message: `Heuristic estimate differs from current difficulty.`,
      reasons: estimated.reasons,
      meta: { currentIndex: current, predictedIndex: estimated.predictedIndex, delta },
    });
  }

  // Make sure very obvious dependency language in non-question fields is still visible.
  const explanationVisual = matchPatterns(normalize(q.explanation), VISUAL_STRONG);
  if (explanationVisual.length && !hasVisual && !visualStrong.length) {
    addIssue({
      severity: "P3",
      category: "dependency",
      code: "explanation_mentions_visual_without_question_visual",
      ...issueBase(q),
      message: "Explanation references a visual while no question visual is attached.",
      reasons: explanationVisual.slice(0, 3),
    });
  }

  if (/^\s*(?:이때|따라서|그러므로)\b/.test(allText) && normalize(q.question).length < 80) {
    addIssue({
      severity: "P2",
      category: "dependency",
      code: "short_question_starts_with_context_connector",
      ...issueBase(q),
      message: "Short question starts with a connector that often depends on missing context.",
      reasons: ["startsWithContextConnector"],
    });
  }
}

for (const level of ["concept", "unit"]) {
  const groups = new Map();
  for (const q of questions) {
    const idx = DIFFICULTY_INDEX[q.difficulty];
    if (idx == null) continue;
    const key = groupKey(q, level);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ q, idx });
  }

  for (const [key, rows] of groups.entries()) {
    const minSize = level === "concept" ? 6 : 12;
    if (rows.length < minSize) continue;
    const med = median(rows.map((row) => row.idx));
    for (const { q, idx } of rows) {
      const delta = idx - med;
      if (Math.abs(delta) < 3) continue;
      addIssue({
        severity: level === "concept" ? "P2" : "P3",
        category: "difficulty",
        code: delta > 0 ? `${level}_difficulty_outlier_high` : `${level}_difficulty_outlier_low`,
        ...issueBase(q),
        message: `Difficulty is an outlier inside ${level} group.`,
        reasons: [`group=${key}`, `groupSize=${rows.length}`, `median=${med}`, `current=${idx}`],
        meta: { groupLevel: level, groupKey: key, groupSize: rows.length, median: med, currentIndex: idx },
      });
    }
  }
}

const severityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
issues.sort((a, b) => {
  const bySeverity = (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9);
  if (bySeverity) return bySeverity;
  const byCategory = a.category.localeCompare(b.category);
  if (byCategory) return byCategory;
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

const questionById = new Map(questions.map((q) => [q.id, q]));
const issuesByQuestion = new Map();
for (const issue of issues) {
  if (!issuesByQuestion.has(issue.id)) issuesByQuestion.set(issue.id, []);
  issuesByQuestion.get(issue.id).push(issue);
}

const reviewQueue = [...issuesByQuestion.entries()].map(([id, rowIssues]) => {
  const q = questionById.get(id);
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
  difficultyDistribution: countBy(questions, (q) => q.difficulty ?? "null"),
  subjectDistribution: countBy(questions, (q) => q.subject ?? "null"),
};

const reportPath = join(outDir, "difficulty_dependency_audit_report.json");
const csvPath = join(outDir, "difficulty_dependency_issues.csv");
const queuePath = join(outDir, "difficulty_dependency_review_queue.json");

writeFileSync(reportPath, JSON.stringify({ summary, issues }, null, 2), "utf8");
writeFileSync(
  csvPath,
  [
    ["severity", "category", "code", "id", "subject", "unit", "concept", "difficulty", "message", "reasons", "excerpt", "meta"].map(csvCell).join(","),
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
        issue.message,
        issue.reasons,
        issue.excerpt,
        issue.meta ?? {},
      ].map(csvCell).join(","),
    ),
  ].join("\n"),
  "utf8",
);
writeFileSync(queuePath, JSON.stringify(reviewQueue, null, 2), "utf8");

console.log("\n=== Difficulty / Dependency Audit ===");
console.log(JSON.stringify(summary, null, 2));
console.log("\nTop issue codes:");
for (const [code, count] of Object.entries(summary.codeCounts).sort((a, b) => b[1] - a[1]).slice(0, 20)) {
  console.log(`- ${code}: ${count}`);
}
console.log("\nTop P0/P1 issues:");
for (const issue of issues.filter((item) => item.severity === "P0" || item.severity === "P1").slice(0, 40)) {
  console.log(`- [${issue.severity}] ${issue.code} ${issue.id} ${issue.subject}/${issue.unit} ${issue.reasons?.[0] ?? ""}`);
}
console.log(`\nReport: ${reportPath}`);
console.log(`CSV: ${csvPath}`);
console.log(`Review queue: ${queuePath}`);
