// Build and upload THE 앤드 화이트 Final A full CBT set.
// Sources:
// - tmp/pdfs/white_mathpix/THE 앤드 화이트.mmd for the main booklet
// - tmp/pdfs/white_mathpix/Final A N회(...번).mmd for appended question ranges
// - Final A N회 해설.pdf for authoritative answer keys
// - tmp/pdfs/white_mathpix/Final A N회 해설.mmd for explanations
//
// Usage:
//   node scripts/upload_white_final_a_full.mjs --dry-run
//   node scripts/upload_white_final_a_full.mjs
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import katex from "katex";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const mmdDir = resolve(root, "tmp", "pdfs", "white_mathpix");
const previewPath = resolve(root, "tmp", "pdfs", "white_final_a_full_preview.json");
const legacyPreviewPath = resolve(root, "tmp", "pdfs", "white_final_a_preview.json");
const imageDir = resolve(root, "public", "white", "final-a-full");
const dryRun = process.argv.includes("--dry-run");

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

const ANSWER_PDF_DIR =
  "C:\\Users\\yubin\\Desktop\\편입\\편수\\7_추가자료\\화이트 완\\화이트 완";

const ROUND_COUNTS = {
  1: 20,
  2: 30,
  3: 25,
  4: 25,
  5: 25,
  6: 25,
  7: 25,
  8: 30,
  9: 20,
  10: 30,
  11: 30,
  12: 20,
  13: 30,
  14: 30,
};

const MAIN_RANGES = {
  1: [1, 15],
  2: [1, 25],
  3: [1, 20],
  4: [1, 20],
  5: [1, 20],
  6: [1, 20],
  7: [1, 20],
  8: [1, 25],
  9: [1, 15],
  10: [1, 25],
  11: [1, 25],
  12: [1, 15],
  13: [1, 25],
  14: [1, 25],
};

const APPEND_RANGES = {
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

const QUESTION_MARKER_FIXES = {
  "1:8:2": 9,
  "3:17:1": 7,
  "4:16:1": 6,
  "6:14:1": 4,
  "6:88:1": 8,
  "7:17:1": 7,
  "7:18:1": 8,
  "14:19:1": 9,
};

const MANUAL_MAIN_QUESTIONS = {
  "14-4": {
    question:
      "세 점 $(0,0),(4,0),(2,3)$을 꼭짓점으로 갖는 삼각형의 경계를 $C$라고 할 때, 아래 주어진 벡터장 $F$가 곡선 $C$를 시계반대방향으로 따라가며 한 일의 양은?\n\n$$F(x,y)=(xy-e^{\\sin x})\\vec{i}+(3xy-\\sqrt{4-y^{2}})\\vec{j}$$",
    options: [
      { id: "1", label: "1", text: "6", contentType: "latex", image: "" },
      { id: "2", label: "2", text: "4", contentType: "latex", image: "" },
      { id: "3", label: "3", text: "3", contentType: "latex", image: "" },
      { id: "4", label: "4", text: "2", contentType: "latex", image: "" },
      { id: "5", label: "5", text: "1", contentType: "latex", image: "" },
    ],
  },
  "14-12": {
    question:
      "함수 $f(x,y)=\\int_{xy}^{x^{2}+y^{2}} e^{-(t-1)^{2}}\\,dt$ 위의 한 점 $(1,0)$에서 $\\vec{u}=(3,4)$로의 방향미분계수는?",
    options: [
      { id: "1", label: "1", text: "$\\frac{1}{5}(6-4e^{-1})$", contentType: "latex", image: "" },
      { id: "2", label: "2", text: "$\\frac{1}{5}(6-2e^{-1})$", contentType: "latex", image: "" },
      { id: "3", label: "3", text: "$\\frac{1}{5}(6-4e)$", contentType: "latex", image: "" },
      { id: "4", label: "4", text: "$\\frac{6}{5}$", contentType: "latex", image: "" },
      { id: "5", label: "5", text: "$\\frac{1}{5}(6+2e^{-1})$", contentType: "latex", image: "" },
    ],
  },
};

const legacyRecords = existsSync(legacyPreviewPath)
  ? JSON.parse(readFileSync(legacyPreviewPath, "utf8")).records ?? []
  : [];
const legacyById = new Map(legacyRecords.map((record) => [record.id, record]));

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
      return `\n${trimmed}\n`;
    })
    .replace(/\bR\^/g, "\\mathbb{R}^")
    .replace(/\bR\{/g, "\\mathbb{R}{")
    .replace(/\bR\s*\^\s*\{/g, "\\mathbb{R}^{")
    .replace(/d i v/g, "\\operatorname{div}")
    .replace(/c u r l/g, "\\operatorname{curl}")
    .replace(/n u l l i t y/g, "\\operatorname{nullity}")
    .replace(/\bnullity\b/g, "\\operatorname{nullity}");
}

function tidyText(text) {
  return normalizeMmd(text)
    .replace(/@@SECTION\{\d+\}/g, "")
    .replace(/\n\s*\\section\*\{THE[\s\S]*$/i, "")
    .replace(/\n\s*THE\s*[\s\S]*FINAL A[\s\S]*$/i, "")
    .replace(/^\s*\d{1,2}\s*\n+/, "")
    .replace(/^\s*\\section\*\{[^}]*학교별[^}]*\}\s*$/gm, "")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function questionFileForAppend(round) {
  const re = new RegExp(`^Final A ${round}(?!\\d).*\\([^)]*\\)\\.mmd$`);
  const file = readdirSync(mmdDir).find((name) => re.test(name));
  if (!file) throw new Error(`Appended question MMD not found for round ${round}`);
  return join(mmdDir, file);
}

function solutionFile(round) {
  const re = new RegExp(`^Final A ${round}(?!\\d).*\\.mmd$`);
  const file = readdirSync(mmdDir).find((name) => re.test(name) && !name.includes("("));
  if (!file) throw new Error(`Solution MMD not found for round ${round}`);
  return join(mmdDir, file);
}

function originalMmdFile() {
  const file = readdirSync(mmdDir).find((name) => name.startsWith("THE") && name.endsWith(".mmd"));
  if (!file) throw new Error("Original THE 앤드 화이트 MMD not found");
  return join(mmdDir, file);
}

function findRoundStarts(lines) {
  const starts = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (/^\s*(?:\\section\*\{)?0?1\}?\s*$/.test(lines[i])) starts.push(i);
  }
  const deduped = [];
  for (const start of starts) {
    if (!deduped.length || start - deduped[deduped.length - 1] > 5) deduped.push(start);
  }
  if (deduped.length !== 14) throw new Error(`Expected 14 round starts, got ${deduped.length}`);
  return deduped;
}

function isInsideDisplayMath(text, index) {
  return (text.slice(0, index).match(/(?<!\\)\$\$/g) ?? []).length % 2 === 1;
}

function findQuestionMarkers(segment, round) {
  const rx = /(^|\n)\s*(?:\\section\*\{\s*(\d{1,2})\s*\}|(\d{1,2})\s*(?=\n))/g;
  const raw = [];
  let match;
  while ((match = rx.exec(segment)) !== null) {
    const rawNumber = Number(match[2] || match[3]);
    if (rawNumber < 1 || rawNumber > 99) continue;
    const index = match.index + (match[1]?.length ?? 0);
    if (isInsideDisplayMath(segment, index)) continue;
    raw.push({ rawNumber, number: rawNumber, index });
  }

  raw.sort((a, b) => a.index - b.index);
  const deduped = [];
  for (const marker of raw) {
    const prev = deduped[deduped.length - 1];
    if (prev && prev.rawNumber === marker.rawNumber && marker.index - prev.index < 120) continue;
    deduped.push(marker);
  }

  const fixedCounts = new Map();
  for (const marker of deduped) {
    const occurrence = (fixedCounts.get(marker.rawNumber) ?? 0) + 1;
    fixedCounts.set(marker.rawNumber, occurrence);
    const fixed = QUESTION_MARKER_FIXES[`${round}:${marker.rawNumber}:${occurrence}`];
    if (fixed) marker.number = fixed;
  }

  const filtered = [];
  for (let i = 0; i < deduped.length; i += 1) {
    const start = deduped[i].index;
    const end = i + 1 < deduped.length ? deduped[i + 1].index : segment.length;
    const chunk = segment.slice(start, end);
    const optionCount = (chunk.match(/(^|\n)\s*\(\s*[1-5]\s*\)/g) ?? []).length;
    if (optionCount >= 5) filtered.push(deduped[i]);
  }
  return filtered;
}

function parseQuestionChunk(raw) {
  const cleaned = tidyText(raw);
  const optionRx = /(^|\n)\(\s*([1-5])\s*\)/g;
  const optionMatches = [];
  let match;
  while ((match = optionRx.exec(cleaned)) !== null) {
    const markerIndex = match.index + match[1].length;
    optionMatches.push({ id: match[2], index: markerIndex, end: optionRx.lastIndex });
  }
  if (optionMatches.length < 5) {
    throw new Error(`Expected 5 options, got ${optionMatches.length}: ${cleaned.slice(0, 160)}`);
  }
  const firstFive = optionMatches.slice(0, 5);
  const question = cleaned.slice(0, firstFive[0].index).trim();
  const options = firstFive.map((item, index) => {
    const next = firstFive[index + 1];
    const text = cleaned
      .slice(item.end, next ? next.index : cleaned.length)
      .replace(/\n+\$\\boldsymbol\{\\forall[\s\S]*$/g, "")
      .replace(/\n+!\[[\s\S]*$/g, "")
      .trim();
    return { id: item.id, label: item.id, text, contentType: "latex", image: "" };
  });
  return { question, options };
}

function extractCommonRound7(text) {
  const match = text.match(/\[23~25\][\s\S]*?(?=\n@@SECTION\{22\})/);
  if (!match) return { common: "", text };
  const common = tidyText(match[0]).replace(/\[23~25\]\s*/, "공통 지문\n");
  return { common, text: text.replace(match[0], "\n") };
}

function splitMissingLastQuestion(round, chunks) {
  const overrides = {
    "2-30": /벡터장\s+\$F\(x,\s*y,\s*z\)=/,
    "10-30": /두 곡면\s+\$\\rho=/,
    "11-30": /\$T:\s*\\mathbb\{R\}\^\{2\}/,
    "13-30": /함수\s+\$f\(x\)=/,
  };
  for (const [key, pattern] of Object.entries(overrides)) {
    if (!key.startsWith(`${round}-`)) continue;
    const missingNum = Number(key.split("-")[1]);
    const previousNum = missingNum - 1;
    const previous = chunks.get(previousNum);
    if (!previous || chunks.has(missingNum)) continue;
    const match = previous.match(pattern);
    if (!match) throw new Error(`Could not split missing appended question ${key}`);
    chunks.set(previousNum, previous.slice(0, match.index).trim());
    chunks.set(missingNum, previous.slice(match.index).trim());
  }
}

function extractAppendChunks(round) {
  let text = normalizeMmd(readFileSync(questionFileForAppend(round), "utf8"));
  let common = "";
  if (round === 7) {
    const extracted = extractCommonRound7(text);
    text = extracted.text;
    common = extracted.common;
  }
  const [start, end] = APPEND_RANGES[round];
  const markers = [];
  const rx = /(^|\n)\s*(?:@@SECTION\{\s*(\d{1,2})\s*\}|(?:\$\$)?\s*(?:&\s*)?(?:\\text\s*\{\s*)?(\d{1,2})\)|(\d{1,2})\s*(?=\n))/g;
  let match;
  while ((match = rx.exec(text)) !== null) {
    const n = Number(match[2] || match[3] || match[4]);
    if (n >= start && n <= end) markers.push({ n, index: match.index + (match[1]?.length ?? 0) });
  }
  markers.sort((a, b) => a.index - b.index);
  const deduped = [];
  for (const marker of markers) {
    const prev = deduped[deduped.length - 1];
    if (prev && prev.n === marker.n && marker.index - prev.index < 80) continue;
    deduped.push(marker);
  }
  const chunks = new Map();
  for (let i = 0; i < deduped.length; i += 1) {
    const marker = deduped[i];
    if (chunks.has(marker.n)) continue;
    const next = deduped.find((candidate, j) => j > i && candidate.index > marker.index);
    chunks.set(marker.n, text.slice(marker.index, next ? next.index : text.length).trim());
  }
  splitMissingLastQuestion(round, chunks);
  if (round === 7 && common) {
    for (const num of [23, 24, 25]) {
      chunks.set(num, `${common}\n\n${chunks.get(num) ?? ""}`);
    }
  }
  return chunks;
}

function extractMainChunks() {
  const text = normalizeMmd(readFileSync(originalMmdFile(), "utf8"));
  const lines = text.split(/\n/);
  const starts = findRoundStarts(lines);
  const chunksByRound = new Map();
  for (let round = 1; round <= 14; round += 1) {
    const segment = lines.slice(starts[round - 1], round < 14 ? starts[round] : lines.length).join("\n");
    const markers = findQuestionMarkers(segment, round);
    const chunks = new Map();
    for (let i = 0; i < markers.length; i += 1) {
      const marker = markers[i];
      const next = markers.find((candidate, j) => j > i && candidate.index > marker.index);
      chunks.set(marker.number, segment.slice(marker.index, next ? next.index : segment.length).trim());
    }
    for (const [key, parsed] of Object.entries(MANUAL_MAIN_QUESTIONS)) {
      const [manualRound, manualNum] = key.split("-").map(Number);
      if (manualRound !== round) continue;
      const synthetic = `${String(manualNum).padStart(2, "0")}\n${parsed.question}\n${parsed.options.map((option) => `(${option.id}) ${option.text}`).join("\n")}`;
      chunks.set(manualNum, synthetic);
    }
    const [start, end] = MAIN_RANGES[round];
    for (let num = start; num <= end; num += 1) {
      if (!chunks.has(num)) throw new Error(`Missing main question ${round}-${num}`);
    }
    chunksByRound.set(round, chunks);
  }
  return chunksByRound;
}

function findAnswerPdf(round) {
  const re = new RegExp(`^Final A ${round}(?!\\d).*\\.pdf$`);
  const file = readdirSync(ANSWER_PDF_DIR).find((name) => re.test(name) && !name.includes("("));
  if (!file) throw new Error(`Answer PDF not found for round ${round}`);
  return join(ANSWER_PDF_DIR, file);
}

async function loadAnswers() {
  const code = String.raw`
import json, os, re, fitz
answer_dir = os.environ["ANSWER_PDF_DIR"]
pat = "\uB2F5\\s*[:\uFF1A]\\s*([\u2460-\u2464])"
out = {}
for round_no in range(1, 15):
    rx = re.compile(rf"^Final A {round_no}(?!\d).*\.pdf$")
    files = [name for name in os.listdir(answer_dir) if rx.match(name) and "(" not in name]
    if not files:
        raise SystemExit(f"missing answer pdf {round_no}")
    doc = fitz.open(os.path.join(answer_dir, files[0]))
    text = "\n".join(page.get_text("text") for page in doc)
    answers = [str(ord(item) - 0x2460 + 1) for item in re.findall(pat, text)]
    out[str(round_no)] = answers
print(json.dumps(out, ensure_ascii=False))
`;
  const { execFileSync } = await import("node:child_process");
  const stdout = execFileSync("python", ["-c", code], {
    cwd: root,
    env: { ...process.env, ANSWER_PDF_DIR },
    encoding: "utf8",
    maxBuffer: 1024 * 1024,
  });
  const raw = JSON.parse(stdout);
  const answers = new Map();
  for (const [roundText, list] of Object.entries(raw)) {
    const round = Number(roundText);
    if (list.length !== ROUND_COUNTS[round]) {
      throw new Error(`Round ${round}: expected ${ROUND_COUNTS[round]} answers, got ${list.length}`);
    }
    for (let i = 0; i < list.length; i += 1) answers.set(`${round}-${i + 1}`, list[i]);
  }
  return answers;
}

function findExplanationMarkers(text, maxNumber) {
  const markers = [];
  const rx = /(^|\n)\s*(?:@@SECTION\{\s*(\d{1,2})\s*\}|(?:\\section\*\{\s*)?(?:\\text\s*\{\s*)?(\d{1,2})\s*\)|(\d{1,2})\s*(?=\n))/g;
  let match;
  while ((match = rx.exec(text)) !== null) {
    const n = Number(match[2] || match[3] || match[4]);
    if (n >= 1 && n <= maxNumber) markers.push({ n, index: match.index + (match[1]?.length ?? 0) });
  }
  markers.sort((a, b) => a.index - b.index);
  const firstByNumber = new Map();
  for (const marker of markers) {
    if (!firstByNumber.has(marker.n)) firstByNumber.set(marker.n, marker);
  }
  return [...firstByNumber.values()].sort((a, b) => a.index - b.index);
}

function extractExplanations(round) {
  const text = normalizeMmd(readFileSync(solutionFile(round), "utf8"));
  const markers = findExplanationMarkers(text, ROUND_COUNTS[round]);
  const chunks = new Map();
  for (let i = 0; i < markers.length; i += 1) {
    const marker = markers[i];
    const next = markers.find((candidate, j) => j > i && candidate.index > marker.index);
    chunks.set(marker.n, text.slice(marker.index, next ? next.index : text.length).trim());
  }
  return chunks;
}

function paraphraseExplanation(text, answer) {
  const withoutAnswer = tidyText(text)
    .replace(/\uB2F5\s*[:：]\s*\(?[1-5]\)?/g, "")
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
  return `${withoutAnswer || "해설은 원본 답지를 기준으로 확인했습니다."}\n\n정답: (${answer})`.trim();
}

function classify(question) {
  const q = question.replace(/\s+/g, " ");
  if (/라플라스|Laplace|\\mathscr\{L\}|\\mathcal\{L\}/.test(q)) return ["공학수학", "Laplace변환", "Laplace변환"];
  if (/Fourier|푸리에/.test(q)) return ["공학수학", "푸리에(Fourier) 급수", "Fourier급수"];
  if (/미분방정식|연립 미분방정식|연립미분방정식|초기값 문제|y\^\{\\prime/.test(q)) return ["공학수학", "미분방정식", "미분방정식"];
  if (/복소행렬/.test(q)) return ["공학수학", "복소수", "복소행렬"];
  if (/행렬|고윳값|고유|기저|선형사상|선형변환|치역|영공간|정사영 행렬|벡터공간|최소제곱/.test(q)) {
    if (/고윳값|고유|대각화/.test(q)) return ["선형대수", "고유치와 대각화", "고유치와 대각화"];
    if (/선형사상|선형변환|치역|기저/.test(q)) return ["선형대수", "선형사상", "선형사상"];
    if (/벡터공간|영공간/.test(q)) return ["선형대수", "벡터공간", "벡터공간"];
    return ["선형대수", "행렬", "행렬"];
  }
  if (/선적분|면적분|벡터장|curl|유량|그린정리|스톡스|외향단위법벡터/.test(q)) return ["다변수함수", "선적분과 면적분", "선적분과 면적분"];
  if (/이중적분|삼중|질량|밀도함수|원기둥|구면좌표|부피|입체|곡면|영역 D|영역 E|경계곡면/.test(q)) {
    if (/질량|밀도함수/.test(q)) return ["다변수함수", "중적분", "질량"];
    if (/곡면|구면좌표|입체|부피/.test(q)) return ["다변수함수", "삼중적분과 극좌표계", "삼중적분"];
    return ["다변수함수", "중적분", "중적분"];
  }
  if (/방향도함수|방향미분|헤세|Hessian|편도|극솟값|최댓값|최솟값|경도/.test(q)) {
    if (/방향도함수|방향미분|경도/.test(q)) return ["다변수함수", "경도 및 방향도함수", "방향도함수"];
    return ["다변수함수", "Taylor급수와 최대/최소", "최대/최소"];
  }
  if (/급수|수렴|수렴반경|Maclaurin|매클로린/.test(q)) {
    if (/Maclaurin|매클로린|수렴반경/.test(q)) return ["적분학", "Maclaurin급수의 응용", "Maclaurin급수"];
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
    if (match.index > lastIndex) segments.push({ math: false, text: content.slice(lastIndex, match.index) });
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

function extractImagesAndClean(text) {
  const urls = [];
  const cleaned = text.replace(/!\[[^\]]*\]\((https:\/\/cdn\.mathpix\.com\/cropped\/[^)]+)\)\s*/g, (_, url) => {
    urls.push(url.replace(/\\&/g, "&"));
    return "";
  });
  return { text: cleaned.trim(), urls };
}

async function downloadImage(url, round, num, index) {
  mkdirSync(imageDir, { recursive: true });
  const extMatch = new URL(url).pathname.match(/\.(jpg|jpeg|png)$/i);
  const ext = extMatch ? extMatch[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
  const fileName = `r${String(round).padStart(2, "0")}-q${String(num).padStart(2, "0")}-${index}.${ext}`;
  const localPath = join(imageDir, fileName);
  if (!existsSync(localPath)) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Image download failed ${res.status}: ${url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(localPath, buf);
  }
  return `/white/final-a-full/${fileName}`;
}

async function buildRecords() {
  const mainChunksByRound = extractMainChunks();
  const answers = await loadAnswers();
  const records = [];
  const exams = [];
  const now = Date.now();

  for (let round = 1; round <= 14; round += 1) {
    const mainChunks = mainChunksByRound.get(round);
    const appendChunks = extractAppendChunks(round);
    const explanationChunks = extractExplanations(round);
    const roundRecords = [];
    const count = ROUND_COUNTS[round];

    for (let num = 1; num <= count; num += 1) {
      const key = `${round}-${num}`;
      const sourceChunk = mainChunks.get(num) ?? appendChunks.get(num);
      if (!sourceChunk) throw new Error(`Missing question ${key}`);
      const answer = answers.get(key);
      if (!answer) throw new Error(`Missing answer ${key}`);
      const manual = MANUAL_MAIN_QUESTIONS[key];
      const legacyId = `q-white-final-a-r${String(round).padStart(2, "0")}-${num}`;
      const legacy = round === 7 && num >= 23 && num <= 25 ? legacyById.get(legacyId) : null;
      let parsed;
      try {
        parsed = legacy
          ? { question: legacy.question, options: legacy.options }
          : manual ?? parseQuestionChunk(sourceChunk);
      } catch (error) {
        throw new Error(`Question parse failed ${key}: ${error.message}`);
      }
      const images = extractImagesAndClean(parsed.question);
      const questionImage = legacy?.question_image ?? (images.urls.length
        ? await downloadImage(images.urls[0], round, num, 1)
        : null);
      const question = images.text;
      const explanationRaw = paraphraseExplanation(explanationChunks.get(num) ?? "", answer);
      const explanationImages = extractImagesAndClean(explanationRaw);
      const explanationImage = explanationImages.urls.length
        ? await downloadImage(explanationImages.urls[0], round, num, 101)
        : null;
      const [subject, unit, concept] = classify(question);
      const id = `q-white-final-a-r${String(round).padStart(2, "0")}-${num}`;
      const tags = Array.from(new Set([
        "THE 앤드 화이트",
        "Final A",
        `Final A ${round}회`,
        "추가문제",
        "유형3",
        subject,
        unit,
        concept,
      ].filter(Boolean)));
      const record = {
        id,
        subject,
        unit,
        concept,
        difficulty: "hard",
        source_type: "imported",
        pool: "self_mock",
        question,
        content_type: questionImage ? "mixed" : "latex",
        question_image: questionImage,
        question_type: "multiple_choice",
        options: parsed.options,
        correct_option_id: answer,
        answer_text: null,
        explanation: explanationImages.text,
        explanation_content_type: explanationImage ? "mixed" : "latex",
        explanation_image: explanationImage,
        tags,
        created_at: new Date(now - round * 1000).toISOString(),
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
      description: `THE 앤드 화이트 Final A ${round}회 ${roundRecords.length}문항`,
      mode: "selected",
      time_limit_sec: Math.max(12 * 60, roundRecords.length * 120),
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
  const expectedCount = Object.values(ROUND_COUNTS).reduce((sum, count) => sum + count, 0);
  if (records.length !== expectedCount) throw new Error(`Expected ${expectedCount} records, got ${records.length}`);
  if (exams.length !== 14) throw new Error(`Expected 14 exams, got ${exams.length}`);
  const byRound = new Map();
  for (const record of records) {
    if (record.options.length !== 5) throw new Error(`${record.id}: expected 5 options`);
    if (!["1", "2", "3", "4", "5"].includes(record.correct_option_id)) {
      throw new Error(`${record.id}: invalid answer ${record.correct_option_id}`);
    }
    const round = Number(record.id.match(/r(\d{2})-/)?.[1]);
    byRound.set(round, (byRound.get(round) ?? 0) + 1);
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
  for (const [roundText, count] of Object.entries(ROUND_COUNTS)) {
    const round = Number(roundText);
    if (byRound.get(round) !== count) {
      throw new Error(`Round ${round}: expected ${count}, got ${byRound.get(round) ?? 0}`);
    }
  }
}

async function upload(records, exams) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase credentials in .env.local");
  const sb = createClient(url, key);
  const { error: questionError } = await sb.from("questions").upsert(records, { onConflict: "id" });
  if (questionError) throw questionError;
  const { error: examError } = await sb.from("generated_exams").upsert(exams, { onConflict: "id" });
  if (examError) throw examError;
}

const { records, exams } = await buildRecords();
writeFileSync(previewPath, JSON.stringify({ records, exams }, null, 2), "utf8");
validate(records, exams);
console.log(`Built ${records.length} questions and ${exams.length} generated exams.`);
console.log(`Preview written: ${previewPath}`);
for (const exam of exams) {
  console.log(`- ${exam.title}: ${exam.source_question_ids.length} questions`);
}
if (dryRun) {
  console.log("Dry run only. No Supabase writes.");
} else {
  await upload(records, exams);
  console.log("Upload complete.");
}
