import type { ContentType, Difficulty, ProblemOption } from "@/types/exam";
import type { QuestionDraft } from "@/types/question";

export type ImportRowResult =
  | {
      ok: true;
      rowNumber: number;
      draft: QuestionDraft;
    }
  | {
      ok: false;
      rowNumber: number;
      message: string;
    };

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
}

export function parseCsv(csv: string) {
  const lines = csv
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line, index) => {
    const cells = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, headerIndex) => {
      row[header] = cells[headerIndex] ?? "";
    });
    return {
      rowNumber: index + 2,
      row
    };
  });
}

function parseDifficulty(value: string): Difficulty | null {
  const normalized = value.trim();
  if (normalized === "easy" || normalized === "하") return "easy";
  if (normalized === "easyMedium" || normalized === "중하") return "easyMedium";
  if (normalized === "medium" || normalized === "중") return "medium";
  if (normalized === "mediumHard" || normalized === "중상") return "mediumHard";
  if (normalized === "hard" || normalized === "상") return "hard";
  if (normalized === "killer" || normalized === "킬러") return "killer";
  return null;
}

function normalizeTags(value: string) {
  return value
    .split(/[;|]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function optionFromRow(
  row: Record<string, string>,
  imageMap: Map<string, string>,
  index: number
): ProblemOption {
  const label = String(index);
  const text = row[`option_${index}`] ?? "";
  const imageName = row[`option_${index}_image`] ?? "";
  const image = imageName ? imageMap.get(imageName) ?? "" : "";
  const contentType: ContentType = image && text ? "mixed" : image ? "image" : "latex";

  return {
    id: label,
    label,
    text,
    image,
    contentType
  };
}

export function buildQuestionDraftsFromCsv(params: {
  csv: string;
  imageMap: Map<string, string>;
}): ImportRowResult[] {
  const rows = parseCsv(params.csv);

  return rows.map(({ rowNumber, row }) => {
    const difficulty = parseDifficulty(row.difficulty ?? "");
    if (!row.subject || !row.unit) {
      return { ok: false, rowNumber, message: "subject 또는 unit이 없습니다." };
    }
    if (!difficulty) {
      return { ok: false, rowNumber, message: "difficulty 값이 올바르지 않습니다." };
    }

    const answer = String(row.answer ?? row.correct_option ?? "").trim();
    if (!["1", "2", "3", "4"].includes(answer)) {
      return { ok: false, rowNumber, message: "answer는 1~4여야 합니다." };
    }

    const questionImageName = row.question_image ?? "";
    const questionImage = questionImageName ? params.imageMap.get(questionImageName) ?? "" : "";
    if (questionImageName && !questionImage) {
      return { ok: false, rowNumber, message: `문제 이미지 파일을 찾을 수 없습니다: ${questionImageName}` };
    }

    const explanationImageName = row.explanation_image ?? "";
    const explanationImage = explanationImageName
      ? params.imageMap.get(explanationImageName) ?? ""
      : "";
    if (explanationImageName && !explanationImage) {
      return {
        ok: false,
        rowNumber,
        message: `해설 이미지 파일을 찾을 수 없습니다: ${explanationImageName}`
      };
    }

    const options = [1, 2, 3, 4].map((index) => optionFromRow(row, params.imageMap, index));
    const missingOption = options.find((option) => !option.text && !option.image);
    if (missingOption) {
      return { ok: false, rowNumber, message: `${missingOption.label}번 보기가 없습니다.` };
    }

    const questionText = row.question ?? "";
    if (!questionText && !questionImage) {
      return { ok: false, rowNumber, message: "문제 텍스트 또는 문제 이미지가 없습니다." };
    }

    const explanationText = row.explanation ?? "";
    const draft: QuestionDraft = {
      subject: row.subject,
      unit: row.unit,
      concept: row.concept ?? "",
      difficulty,
      sourceType: "imported",
      question: questionText,
      contentType: questionImage && questionText ? "mixed" : questionImage ? "image" : "latex",
      questionImage,
      options,
      correctOptionId: answer,
      explanation: explanationText,
      explanationContentType:
        explanationImage && explanationText ? "mixed" : explanationImage ? "image" : "latex",
      explanationImage,
      tags: normalizeTags(row.tags ?? "")
    };

    return { ok: true, rowNumber, draft };
  });
}
