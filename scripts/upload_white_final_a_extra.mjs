// Build and upload THE 앤드 화이트 Final A additional questions.
// Source: Mathpix MMD outputs under tmp/pdfs/white_mathpix.
// Usage:
//   node scripts/upload_white_final_a_extra.mjs --dry-run
//   node scripts/upload_white_final_a_extra.mjs
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import katex from "katex";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const mmdDir = resolve(root, "tmp", "pdfs", "white_mathpix");
const previewPath = resolve(root, "tmp", "pdfs", "white_final_a_preview.json");
const dryRun = process.argv.includes("--dry-run");

const RANGES = {
  1: [16, 20],
  2: [26, 30],
  3: [21, 25],
  4: [21, 25],
  5: [21, 25],
  6: [21, 25],
  7: [21, 25],
  8: [26, 30],
  9: [16, 20],
  10: [26, 30],
  11: [26, 30],
  12: [16, 20],
  13: [26, 30],
  14: [26, 30],
};

const ANSWERS = {
  "1-16": "5", "1-17": "4", "1-18": "3", "1-19": "3", "1-20": "1",
  "2-26": "5", "2-27": "5", "2-28": "4", "2-29": "3", "2-30": "2",
  "3-21": "4", "3-22": "1", "3-23": "3", "3-24": "3", "3-25": "1",
  "4-21": "2", "4-22": "2", "4-23": "4", "4-24": "4", "4-25": "3",
  "5-21": "3", "5-22": "3", "5-23": "4", "5-24": "4", "5-25": "4",
  "6-21": "2", "6-22": "4", "6-23": "4", "6-24": "2", "6-25": "2",
  "7-21": "3", "7-22": "4", "7-23": "5", "7-24": "3", "7-25": "3",
  "8-26": "1", "8-27": "4", "8-28": "1", "8-29": "4", "8-30": "2",
  "9-16": "2", "9-17": "3", "9-18": "4", "9-19": "5", "9-20": "3",
  "10-26": "5", "10-27": "3", "10-28": "4", "10-29": "2", "10-30": "3",
  "11-26": "4", "11-27": "4", "11-28": "2", "11-29": "2", "11-30": "1",
  "12-16": "2", "12-17": "1", "12-18": "5", "12-19": "5", "12-20": "5",
  "13-26": "4", "13-27": "2", "13-28": "5", "13-29": "4", "13-30": "1",
  "14-26": "4", "14-27": "3", "14-28": "4", "14-29": "2", "14-30": "1",
};

const SPLIT_OVERRIDES = {
  "2-30": /\n벡터장\s+\$F\(x,\s*y,\s*z\)=/,
  "10-30": /\n두 곡면\s+\$\\rho=/,
  "11-30": /\n\$T:\s*\\mathbb\{R\}\^\{2\}/,
  "13-30": /\n함수\s+\$f\(x\)=/,
};

const COMMON_IMAGE = {
  "7-23": "/white/final-a-7-23-25-diagram.png",
  "7-24": "/white/final-a-7-23-25-diagram.png",
  "7-25": "/white/final-a-7-23-25-diagram.png",
};

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

function normalizeMmd(text) {
  return text
    .replace(/^\uFEFF/, "")
    .replace(/\r/g, "")
    .replace(/（/g, "(")
    .replace(/）/g, ")")
    .replace(/，/g, ",")
    .replace(/？/g, "?")
    .replace(/．/g, ".")
    .replace(/〈/g, "<")
    .replace(/〉/g, ">")
    .replace(/\\section\*\{([^}]*)\}/g, (_, title) => {
      const trimmed = title.trim();
      const numeric = trimmed.match(/^(\d{1,2})/);
      return numeric ? `\n@@SECTION{${numeric[1]}}\n` : `\n${trimmed}\n`;
    });
}

function stripImages(text) {
  return text.replace(/!\[[^\]]*\]\([^)]+\)\s*/g, "");
}

function tidyText(text) {
  return stripImages(text)
    .replace(/@@SECTION\{\d+\}/g, "")
    .replace(/^\s*\d{1,2}\s*\n+/, "")
    .replace(/\n\s*\d{1,2}\s*\n(?=[^\n]*[가-힣A-Za-z$])/g, "\n")
    .replace(/\bR\^/g, "\\mathbb{R}^")
    .replace(/d i v/g, "\\operatorname{div}")
    .replace(/c u r l/g, "\\operatorname{curl}")
    .replace(/n u l l i t y/g, "\\operatorname{nullity}")
    .replace(/\bnullity\b/g, "\\operatorname{nullity}")
    .replace(/\brankA\b/g, "\\operatorname{rank} A")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function findQuestionFile(round) {
  const re = new RegExp(`^Final A ${round}(?!\\d).*\\(`);
  const file = readdirSync(mmdDir).find((name) => re.test(name));
  if (!file) throw new Error(`Question MMD not found for round ${round}`);
  return join(mmdDir, file);
}

function findSolutionFile(round) {
  const re = new RegExp(`^Final A ${round}(?!\\d).*해설\\.mmd$`);
  const file = readdirSync(mmdDir).find((name) => re.test(name));
  if (!file) throw new Error(`Solution MMD not found for round ${round}`);
  return join(mmdDir, file);
}

function findMarkers(text, maxNumber = 30) {
  const markers = [];
  const rx = /(^|\n)\s*(?:@@SECTION\{\s*(\d{1,2})\s*\}|(?:\$\$)?\s*(?:&\s*)?(?:\\text\s*\{\s*)?(\d{1,2})\)|(\d{1,2})\s*(?=\n))/g;
  let match;
  while ((match = rx.exec(text)) !== null) {
    const n = Number(match[2] || match[3] || match[4]);
    if (n >= 1 && n <= maxNumber) {
      markers.push({ n, index: match.index + match[1].length });
    }
  }
  const deduped = [];
  for (const marker of markers) {
    const prev = deduped[deduped.length - 1];
    if (prev && prev.n === marker.n && marker.index - prev.index < 40) continue;
    deduped.push(marker);
  }
  return deduped;
}

function extractCommonRound7(text) {
  const match = text.match(/\[23~25\][\s\S]*?(?=\n@@SECTION\{22\})/);
  if (!match) return { common: "", text };
  const common = tidyText(match[0]).replace(/\[23~25\]\s*/, "공통 지문\n");
  return { common, text: text.replace(match[0], "\n") };
}

function splitMissingLastQuestion(round, chunks) {
  for (const [key, pattern] of Object.entries(SPLIT_OVERRIDES)) {
    if (!key.startsWith(`${round}-`)) continue;
    const missingNum = Number(key.split("-")[1]);
    const previousNum = missingNum - 1;
    const previous = chunks.get(previousNum);
    if (!previous || chunks.has(missingNum)) continue;
    const match = previous.match(pattern);
    if (!match) throw new Error(`Could not split missing question ${key}`);
    const before = previous.slice(0, match.index).trim();
    const after = previous.slice(match.index).trim();
    chunks.set(previousNum, before);
    chunks.set(missingNum, after);
  }
}

function extractRawChunks(text, round, rangeOnly = true) {
  let normalized = normalizeMmd(text);
  let common = "";
  if (round === 7) {
    const extracted = extractCommonRound7(normalized);
    normalized = extracted.text;
    common = extracted.common;
  }

  const [start, end] = RANGES[round];
  const markers = findMarkers(normalized)
    .filter((m) => !rangeOnly || (m.n >= start && m.n <= end))
    .sort((a, b) => a.index - b.index);
  const chunks = new Map();
  for (let i = 0; i < markers.length; i += 1) {
    const marker = markers[i];
    if (rangeOnly && (marker.n < start || marker.n > end)) continue;
    if (chunks.has(marker.n)) continue;
    const next = markers.find((candidate, j) => j > i && candidate.index > marker.index);
    const endIndex = next ? next.index : normalized.length;
    chunks.set(marker.n, normalized.slice(marker.index, endIndex).trim());
  }
  splitMissingLastQuestion(round, chunks);
  if (round === 7 && common) {
    for (const num of [23, 24, 25]) {
      chunks.set(num, `${common}\n\n${chunks.get(num) ?? ""}`);
    }
  }
  return chunks;
}

function parseQuestionChunk(round, num, raw) {
  const cleaned = tidyText(raw);
  const optionRx = /(^|\n)\(\s*([1-5])\s*\)/g;
  const optionMatches = [];
  let match;
  while ((match = optionRx.exec(cleaned)) !== null) {
    const markerIndex = match.index + match[1].length;
    optionMatches.push({ id: match[2], index: markerIndex, end: optionRx.lastIndex });
  }
  if (optionMatches.length < 5) {
    throw new Error(`Expected 5 options for ${round}-${num}, got ${optionMatches.length}`);
  }
  const firstFive = optionMatches.slice(0, 5);
  const question = cleaned.slice(0, firstFive[0].index).trim();
  const options = firstFive.map((item, index) => {
    const next = firstFive[index + 1];
    const text = cleaned.slice(item.end, next ? next.index : cleaned.length).trim();
    return { id: item.id, label: item.id, text, contentType: "latex", image: "" };
  });
  return { question, options };
}

function extractExplanations(round) {
  const text = normalizeMmd(readFileSync(findSolutionFile(round), "utf8"));
  const markers = findMarkers(text, 30).sort((a, b) => a.index - b.index);
  const chunks = new Map();
  for (let i = 0; i < markers.length; i += 1) {
    const marker = markers[i];
    if (chunks.has(marker.n)) continue;
    const next = markers.find((candidate, j) => j > i && candidate.index > marker.index);
    chunks.set(marker.n, text.slice(marker.index, next ? next.index : text.length).trim());
  }
  return chunks;
}

function paraphraseExplanation(text, answer) {
  const withoutAnswer = tidyText(text)
    .replace(/^(답|정답)\s*[:：]\s*\(?[1-5]\)?\s*$/gm, "")
    .replace(/답\s*[:：]\s*\(?[1-5]\)?/g, "")
    .replace(/정답\s*[:：]\s*\(?[1-5]\)?/g, "")
    .replace(/구하면 된다/g, "계산하면 된다")
    .replace(/알 수 있다/g, "확인할 수 있다")
    .replace(/만족해야한다/g, "만족해야 한다")
    .replace(/발 산정 리/g, "발산정리")
    .replace(/발산정 리/g, "발산정리")
    .replace(/적 분순서 변 경/g, "적분순서 변경")
    .replace(/부분적분법/g, "부분적분")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return `${withoutAnswer}\n\n정답: (${answer})`.trim();
}

function classify(question) {
  const q = question.replace(/\s+/g, " ");
  if (/라플라스|Laplace|\\mathscr\{L\}|\\mathcal\{L\}/.test(q)) {
    return ["공학수학", "Laplace변환", "Laplace변환"];
  }
  if (/Fourier|푸리에/.test(q)) return ["공학수학", "푸리에(Fourier) 급수", "Fourier급수"];
  if (/미분방정식|연립 미분방정식|연립미분방정식|초기값 문제|y\^\{\\prime/.test(q)) {
    return ["공학수학", "미분방정식", "미분방정식"];
  }
  if (/복소행렬/.test(q)) return ["공학수학", "복소수", "복소행렬"];
  if (/행렬|고윳값|고유|기저|선형사상|선형변환|치역|영공간|정사영 행렬|벡터공간/.test(q)) {
    if (/고윳값|고유|대각화/.test(q)) return ["선형대수", "고유치와 대각화", "고유치와 대각화"];
    if (/선형사상|선형변환|치역|기저/.test(q)) return ["선형대수", "선형사상", "선형사상"];
    if (/벡터공간|영공간/.test(q)) return ["선형대수", "벡터공간", "벡터공간"];
    return ["선형대수", "행렬", "행렬"];
  }
  if (/선적분|면적분|벡터장|curl|유량|그린정리|스톡스|외향단위법벡터/.test(q)) {
    return ["다변수함수", "선적분과 면적분", "선적분과 면적분"];
  }
  if (/이중적분|삼중|질량|밀도함수|원기둥|구면좌표|부피|입체|곡면|영역 D|영역 E|경계곡면/.test(q)) {
    if (/질량|밀도함수/.test(q)) return ["다변수함수", "중적분", "질량"];
    if (/곡면|구면좌표|입체|부피/.test(q)) return ["다변수함수", "삼중적분과 극좌표계", "삼중적분"];
    return ["다변수함수", "중적분", "중적분"];
  }
  if (/방향도함수|헤세|Hessian|편도|극솟값|최댓값|최솟값|경도/.test(q)) {
    if (/방향도함수|경도/.test(q)) return ["다변수함수", "경도 및 방향도함수", "방향도함수"];
    return ["다변수함수", "Taylor급수와 최대/최소", "최대/최소"];
  }
  if (/급수|수렴|수렴반경|Maclaurin/.test(q)) {
    if (/Maclaurin|수렴반경/.test(q)) return ["적분학", "Maclaurin급수의 응용", "Maclaurin급수"];
    return ["적분학", "급수의 수렴/발산", "급수의 수렴/발산"];
  }
  if (/정적분|이상적분|적분/.test(q)) return ["적분학", "정적분의 계산", "정적분"];
  if (/극한/.test(q)) return ["미분학", "극한과 연속", "극한"];
  if (/도함수|미분|변화율/.test(q)) return ["미분학", "도함수의 응용", "도함수의 응용"];
  return ["미분학", "추가내용", "Final A"];
}

function splitMath(content) {
  const segments = [];
  const pattern = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g;
  let lastIndex = 0;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ math: false, text: content.slice(lastIndex, match.index) });
    }
    const token = match[0];
    segments.push({
      math: true,
      display: token.startsWith("$$"),
      text: token.startsWith("$$") ? token.slice(2, -2) : token.slice(1, -1),
    });
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < content.length) segments.push({ math: false, text: content.slice(lastIndex) });
  return segments;
}

function validateLatex(label, content) {
  const dollarCount = (content.match(/(?<!\\)\$/g) ?? []).length;
  if (dollarCount % 2 !== 0) throw new Error(`${label}: odd number of $ delimiters`);
  for (const segment of splitMath(content)) {
    if (!segment.math) continue;
    katex.renderToString(segment.text, {
      displayMode: Boolean(segment.display),
      throwOnError: true,
      strict: false,
    });
  }
}

function buildRecords() {
  const records = [];
  const exams = [];
  const now = Date.now();

  for (const round of Object.keys(RANGES).map(Number)) {
    const [start, end] = RANGES[round];
    const questionChunks = extractRawChunks(
      readFileSync(findQuestionFile(round), "utf8"),
      round,
      true,
    );
    const explanationChunks = extractExplanations(round);
    const roundRecords = [];

    for (let num = start; num <= end; num += 1) {
      const key = `${round}-${num}`;
      const answer = ANSWERS[key];
      if (!answer) throw new Error(`Missing answer for ${key}`);
      const rawQuestion = questionChunks.get(num);
      if (!rawQuestion) throw new Error(`Missing question chunk for ${key}`);
      const rawExplanation = explanationChunks.get(num) ?? "";
      const parsed = parseQuestionChunk(round, num, rawQuestion);
      const [subject, unit, concept] = classify(parsed.question);
      const image = COMMON_IMAGE[key] ?? null;
      const id = `q-white-final-a-r${String(round).padStart(2, "0")}-${num}`;
      const tags = Array.from(
        new Set([
          "THE 앤드 화이트",
          "Final A",
          `Final A ${round}회`,
          "추가문제",
          "유형3",
          subject,
          unit,
          concept,
        ].filter(Boolean)),
      );
      const createdAt = new Date(now - round * 1000).toISOString();
      const record = {
        id,
        subject,
        unit,
        concept,
        difficulty: "hard",
        source_type: "imported",
        pool: "self_mock",
        question: parsed.question,
        content_type: image ? "mixed" : "latex",
        question_image: image,
        question_type: "multiple_choice",
        options: parsed.options,
        correct_option_id: answer,
        answer_text: null,
        explanation: paraphraseExplanation(rawExplanation, answer),
        explanation_content_type: "latex",
        explanation_image: null,
        tags,
        created_at: createdAt,
        updated_at: new Date().toISOString(),
      };
      records.push(record);
      roundRecords.push(record);
    }

    const difficultyCounts = {
      easy: 0,
      easyMedium: 0,
      medium: 0,
      mediumHard: 0,
      hard: roundRecords.length,
      killer: 0,
    };
    exams.push({
      id: `white-final-a-r${String(round).padStart(2, "0")}-extra`,
      title: `Final A ${round}회 추가문제`,
      description: "THE 앤드 화이트 Final A 추가문제 5문항",
      mode: "selected",
      time_limit_sec: 12 * 60,
      tags: ["유형3", "Final A", "THE 앤드 화이트", "추가문제", `Final A ${round}회`],
      problems: roundRecords.map((q) => ({
        id: q.id,
        subject: q.subject,
        unit: q.unit,
        concept: q.concept,
        difficulty: q.difficulty,
        question: q.question,
        contentType: q.content_type,
        questionImage: q.question_image ?? undefined,
        questionType: q.question_type,
        options: q.options,
        correctOptionId: q.correct_option_id,
        explanation: q.explanation,
        explanationContentType: q.explanation_content_type,
        explanationImage: q.explanation_image ?? undefined,
      })),
      created_at: new Date(now - round * 1000).toISOString(),
      source_question_ids: roundRecords.map((q) => q.id),
      generation_summary: {
        requestedCount: roundRecords.length,
        matchedCount: roundRecords.length,
        selectedCount: roundRecords.length,
        difficultyCounts,
        warnings: [],
      },
    });
  }

  return { records, exams };
}

function validate(records, exams) {
  if (records.length !== 70) throw new Error(`Expected 70 records, got ${records.length}`);
  if (exams.length !== 14) throw new Error(`Expected 14 exams, got ${exams.length}`);
  for (const record of records) {
    if (record.options.length !== 5) throw new Error(`${record.id}: expected 5 options`);
    if (!["1", "2", "3", "4", "5"].includes(record.correct_option_id)) {
      throw new Error(`${record.id}: invalid answer ${record.correct_option_id}`);
    }
    const fields = [
      ["question", record.question],
      ["explanation", record.explanation],
      ...record.options.map((option) => [`option ${option.id}`, option.text]),
    ];
    for (const [name, value] of fields) {
      if (/!\[|cdn\.mathpix|@@SECTION|\\section\*/.test(value)) {
        throw new Error(`${record.id} ${name}: unclean MMD artifact`);
      }
      validateLatex(`${record.id} ${name}`, value);
    }
  }
}

async function upload(records, exams) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase credentials in .env.local");
  const sb = createClient(url, key);

  const { error: questionError } = await sb
    .from("questions")
    .upsert(records, { onConflict: "id" });
  if (questionError) throw questionError;

  const { error: examError } = await sb
    .from("generated_exams")
    .upsert(exams, { onConflict: "id" });
  if (examError) throw examError;
}

const { records, exams } = buildRecords();
writeFileSync(previewPath, JSON.stringify({ records, exams }, null, 2), "utf8");
validate(records, exams);

console.log(`Built ${records.length} questions and ${exams.length} generated exams.`);
console.log(`Preview written: ${previewPath}`);
for (const exam of exams) {
  console.log(`- ${exam.title}: ${exam.source_question_ids.join(", ")}`);
}

if (dryRun) {
  console.log("Dry run only. No Supabase writes.");
} else {
  await upload(records, exams);
  console.log("Upload complete.");
}
