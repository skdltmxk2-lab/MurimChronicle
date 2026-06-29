// Audit whether question subject/unit classification matches the required topic hierarchy.
//
// Hierarchy rule:
//   미분학 < 적분학 < 선형대수 < 다변수함수 < 공학수학
//
// A question may use concepts from earlier subjects, but should not be placed in a
// lower subject when it requires a later subject. For example, an 적분학 question can
// use 미분학 ideas, but should be flagged if it requires 선형대수/다변수/공학수학.
//
// Output:
//   tmp/audit/subject_hierarchy_report.json
//   tmp/audit/subject_hierarchy_issues.csv
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

const SUBJECTS = [
  { subject: "미분학", rank: 1 },
  { subject: "적분학", rank: 2 },
  { subject: "선형대수", rank: 3 },
  { subject: "다변수함수", rank: 4 },
  { subject: "공학수학", rank: 5 },
];
const RANK_TO_SUBJECT = Object.fromEntries(SUBJECTS.map(({ subject, rank }) => [rank, subject]));
const SUBJECT_RANK = Object.fromEntries(SUBJECTS.map(({ subject, rank }) => [subject, rank]));

const CANONICAL_SUBJECTS = new Set(SUBJECTS.map((entry) => entry.subject));
const SUBJECT_ALIASES = new Map([
  ["벡터해석", "공학수학"],
  ["편입수학", null],
]);

const SUBJECT_UNITS = {
  미분학: [
    "함수",
    "극한과 연속",
    "미분",
    "도함수의 응용",
    "접선의 방정식",
    "평균값의 정리 및 로피탈 정리",
    "Taylor급수",
    "곡선의 개형",
    "최대/최소",
    "순간 변화율",
    "추가내용",
  ],
  적분학: [
    "부정적분",
    "정적분의 계산",
    "정적분과 무한급수",
    "정적분의 성질",
    "특이적분",
    "Maclaurin급수의 응용",
    "급수의 수렴/발산",
    "정적분의 응용",
    "극좌표와 응용",
    "추가내용",
  ],
  선형대수: [
    "행렬",
    "벡터와 공간도형",
    "벡터공간",
    "고유치와 대각화",
    "선형사상",
    "추가내용",
  ],
  다변수함수: [
    "편도함수",
    "경도 및 방향도함수",
    "곡선과 곡면",
    "Taylor급수와 최대/최소",
    "중적분",
    "체적과 곡면적",
    "삼중적분과 극좌표계",
    "무한급수",
    "선적분과 면적분",
    "추가내용",
  ],
  공학수학: [
    "복소수",
    "미분방정식",
    "Laplace변환",
    "푸리에(Fourier) 급수",
    "벡터해석",
    "추가내용",
  ],
};

const UNIT_TO_SUBJECTS = new Map();
for (const [subject, units] of Object.entries(SUBJECT_UNITS)) {
  for (const unit of units) {
    const subjects = UNIT_TO_SUBJECTS.get(unit) ?? [];
    subjects.push(subject);
    UNIT_TO_SUBJECTS.set(unit, subjects);
  }
}

const DETECTORS = [
  {
    rank: 5,
    topic: "공학수학",
    patterns: [
      /미분방정식|ODE\b|초깃값\s*문제|초기값\s*문제|분리변수|코시[-\s]*오일러|오일러[-\s]*코시|연립\s*ODE/i,
      /라플라스\s*(?:변환|역변환)|역\s*라플라스|Laplace\s*(?:transform|변환|역변환)|역\s*Laplace|\\math(?:cal|scr)\{L\}/i,
      /푸리에|Fourier|복소\s*푸리에|편미분방정식|PDE\b/i,
      /복소평면|복소\s*(?:경로|적분|함수)|해석함수|코시\s*적분|잔여|유수|residue/i,
    ],
  },
  {
    rank: 4,
    topic: "다변수함수",
    patterns: [
      /편도함수|편미분|\\partial|∂|전미분|방향도함수|경도|gradient|그래디언트|라그랑주\s*승수|이변수|다변수|접평면|최대\s*변화율/,
      /이중적분|삼중적분|중적분|다중적분|\\iint|\\iiint/,
      /선적분|면적분|곡면적분|공간곡선|벡터장/,
      /회전장|보존장|스칼라장|벡터마당/,
      /\\nabla|\\vec\s*\{?F\}?|\\mathbf\{F\}/,
      /영역\s*[DR]\b|폐곡선|경계\s*곡선/,
      /f\s*\(\s*x\s*,\s*y\s*\)|f\s*\(\s*x\s*,\s*y\s*,\s*z\s*\)|z\s*=\s*f\s*\(\s*x\s*,\s*y\s*\)/,
    ],
  },
  {
    rank: 3,
    topic: "선형대수",
    patterns: [
      /행렬|행렬식|역행렬|정방행렬|대각화|고유값|고유치|고유벡터|특성다항식|특성방정식/,
      /rank|\\mathrm\{rank\}|trace|\\mathrm\{tr\}|tr\s*\(|det|\\det/,
      /벡터공간|부분공간|선형독립|일차독립|선형종속|선형결합|span|생성\s*공간/,
      /선형사상|선형변환|일차변환|핵공간|상공간|영공간|상태전이행렬/,
      /LU\s*분해|QR\s*분해|내적공간|직교정사영|정규직교|고윳값/,
    ],
  },
  {
    rank: 2,
    topic: "적분학",
    patterns: [
      /정적분|부정적분|이상적분|특이적분|리만합|상적분|하적분|원시함수|미적분학의\s*기본정리|적분으로\s*정의/,
      /\\int/,
    ],
  },
  {
    rank: 1,
    topic: "미분학",
    patterns: [
      /극한|연속|미분|도함수|미분계수|접선|법선|평균값|로피탈|최댓값|최솟값|극대|극소/,
      /\\lim|f'\s*\(|f\^\{\s*\\prime|\\frac\{d\}\{dx\}|\\dfrac\{d\}\{dx\}|\\frac\{dy\}\{dx\}|\\dfrac\{dy\}\{dx\}/,
    ],
  },
];

const UNIT_RANK_RULES = Object.entries(SUBJECT_UNITS).flatMap(([subject, units]) =>
  units.map((unit) => ({ rank: SUBJECT_RANK[subject], subject, unit })),
);

const WHITELIST = [
  // Maclaurin expansion of 1 / (1 + x^2); not a complex-analysis problem.
  { id: "q-2024-soongsil-20", allowedRank: 5 },
  // One-variable polar-coordinate arc/area questions are often intentionally in 적분학.
  { subject: "적분학", unitPattern: /극좌표/, allowedRank: 4, textPattern: /극방정식|극곡선|r\s*=/ },
];

function normalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function optionsText(options) {
  if (!Array.isArray(options)) return "";
  return options.map((option) => option?.text ?? "").join("\n");
}

function detectFromUnit(q) {
  const matches = [];
  if (SUBJECT_UNITS[q.subject]?.includes(q.unit)) {
    matches.push({ rank: SUBJECT_RANK[q.subject], topic: q.subject, source: "unit", pattern: q.unit });
    return matches;
  }
  const possibleSubjects = UNIT_TO_SUBJECTS.get(q.unit) ?? [];
  for (const subject of possibleSubjects) {
    matches.push({ rank: SUBJECT_RANK[subject], topic: subject, source: "unit", pattern: q.unit });
  }
  return matches;
}

function detectFromContent(q) {
  const contentText = normalizeText([
    q.concept,
    q.question,
    optionsText(q.options),
    q.answer_text,
  ].join("\n"));

  // Avoid common same-word false positives:
  // - 라플라스 전개 is determinant expansion, not Laplace transform.
  // - 발산정리 in 급수 context is a series divergence test, not vector calculus.
  const laplaceExpansionOnly =
    /라플라스\s*전개/.test(contentText) &&
    !/라플라스\s*(?:변환|역변환)|역\s*라플라스|Laplace\s*(?:transform|변환|역변환)|역\s*Laplace|\\math(?:cal|scr)\{L\}/i.test(contentText);

  const matches = [];
  for (const detector of DETECTORS) {
    for (const pattern of detector.patterns) {
      if (laplaceExpansionOnly && detector.topic === "공학수학" && /라플라스|Laplace|\\math/.test(String(pattern))) {
        continue;
      }
      if (pattern.test(contentText)) {
        matches.push({
          rank: detector.rank,
          topic: detector.topic,
          source: "content",
          pattern: String(pattern),
        });
        break;
      }
    }
  }
  return matches;
}

function isWhitelisted(q, detectedRank) {
  const text = normalizeText(`${q.question ?? ""}\n${q.explanation ?? ""}`);
  return WHITELIST.some((rule) => {
    if (rule.id && q.id !== rule.id) return false;
    if (rule.subject && q.subject !== rule.subject) return false;
    if (rule.unitPattern && !rule.unitPattern.test(q.unit ?? "")) return false;
    if (detectedRank !== rule.allowedRank) return false;
    if (!rule.textPattern) return true;
    return rule.textPattern.test(text);
  });
}

function excerpt(value, max = 220) {
  const text = normalizeText(value);
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

async function fetchAllQuestions() {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb
      .from("questions")
      .select("id, subject, unit, concept, difficulty, question, content_type, question_type, options, correct_option_id, answer_text, explanation, tags")
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows;
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

console.log("Fetching questions...");
const questions = await fetchAllQuestions();
console.log(`Fetched ${questions.length} questions.`);

const issues = [];
const subjectCounts = {};
const comboCounts = {};

for (const q of questions) {
  subjectCounts[q.subject] = (subjectCounts[q.subject] ?? 0) + 1;
  const combo = `${q.subject}|${q.unit}`;
  comboCounts[combo] = (comboCounts[combo] ?? 0) + 1;

  const subjectRank = SUBJECT_RANK[q.subject] ?? null;
  const alias = SUBJECT_ALIASES.get(q.subject);
  if (!CANONICAL_SUBJECTS.has(q.subject)) {
    issues.push({
      severity: "P1",
      code: "noncanonical_subject",
      id: q.id,
      subject: q.subject,
      unit: q.unit,
      concept: q.concept,
      expectedSubject: alias ?? "manual_review",
      detectedRank: alias ? SUBJECT_RANK[alias] : null,
      message: "Subject is outside the canonical five-subject hierarchy.",
      reasons: [`subject=${q.subject}`],
      excerpt: excerpt(q.question),
    });
  }

  if (CANONICAL_SUBJECTS.has(q.subject) && !SUBJECT_UNITS[q.subject]?.includes(q.unit)) {
    const possibleSubjects = UNIT_TO_SUBJECTS.get(q.unit) ?? [];
    issues.push({
      severity: "P1",
      code: "unknown_unit",
      id: q.id,
      subject: q.subject,
      unit: q.unit,
      concept: q.concept,
      expectedSubject: possibleSubjects[0] ?? q.subject,
      detectedRank: possibleSubjects[0] ? SUBJECT_RANK[possibleSubjects[0]] : null,
      message: "Unit is outside the app taxonomy for this subject.",
      reasons: [`unit=${q.unit}`],
      excerpt: excerpt(q.question),
    });
  }

  const unitMatches = detectFromUnit(q);
  const contentMatches = detectFromContent(q);
  const matches = [...unitMatches, ...contentMatches];
  const maxRank = matches.reduce((rank, match) => Math.max(rank, match.rank), subjectRank ?? 0);

  if (subjectRank && maxRank > subjectRank && !isWhitelisted(q, maxRank)) {
    const gap = maxRank - subjectRank;
    issues.push({
      severity: gap >= 2 ? "P1" : "P2",
      code: "subject_underclassified",
      id: q.id,
      subject: q.subject,
      unit: q.unit,
      concept: q.concept,
      expectedSubject: RANK_TO_SUBJECT[maxRank],
      detectedRank: maxRank,
      message: `Question appears to require ${RANK_TO_SUBJECT[maxRank]}, which is later than ${q.subject}.`,
      reasons: matches
        .filter((match) => match.rank === maxRank)
        .map((match) => `${match.source}:${match.topic}:${match.pattern}`)
        .slice(0, 4),
      excerpt: excerpt(q.question),
    });
  }
}

const summary = {
  generatedAt: new Date().toISOString(),
  hierarchy: SUBJECTS.map((entry) => entry.subject),
  questionCount: questions.length,
  issueCount: issues.length,
  severityCounts: issues.reduce((acc, issue) => {
    acc[issue.severity] = (acc[issue.severity] ?? 0) + 1;
    return acc;
  }, {}),
  codeCounts: issues.reduce((acc, issue) => {
    acc[issue.code] = (acc[issue.code] ?? 0) + 1;
    return acc;
  }, {}),
  subjectCounts,
  topSubjectUnitCombos: Object.entries(comboCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 120)
    .map(([key, count]) => ({ key, count })),
};

const report = { summary, issues };
const reportPath = resolve(outDir, "subject_hierarchy_report.json");
const csvPath = resolve(outDir, "subject_hierarchy_issues.csv");
writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

const csvRows = [
  ["severity", "code", "id", "subject", "unit", "concept", "expectedSubject", "message", "reasons", "excerpt"],
  ...issues.map((issue) => [
    issue.severity,
    issue.code,
    issue.id,
    issue.subject,
    issue.unit,
    issue.concept,
    issue.expectedSubject,
    issue.message,
    issue.reasons.join(" | "),
    issue.excerpt,
  ]),
];
writeFileSync(csvPath, csvRows.map((row) => row.map(csvEscape).join(",")).join("\n"), "utf8");

console.log("\n=== Subject Hierarchy Audit ===");
console.log(JSON.stringify(summary, null, 2));
console.log(`\nReport: ${reportPath}`);
console.log(`CSV: ${csvPath}`);

console.log("\nTop issues:");
for (const issue of issues.slice(0, 60)) {
  console.log(`- [${issue.severity}] ${issue.id} ${issue.subject}|${issue.unit} -> ${issue.expectedSubject}: ${issue.reasons[0] ?? issue.message}`);
}
