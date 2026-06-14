import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  ALLOWED_IMAGE_TYPES,
  GEMINI_MODEL,
  extractJson,
  friendlyAiError,
  generateWithRetry,
} from "@/lib/ai/gemini";
import { SUBJECTS, SUBJECT_UNITS } from "@/lib/taxonomy";
import type { CoachingExtractedProblem } from "@/types/coaching";

const MAX_IMAGES = 8;
const MAX_TOTAL_BASE64_LENGTH = 48_000_000;

type ImageInput = {
  id?: string;
  imageBase64?: string;
  mediaType?: string;
  sourceLabel?: string;
};

type RawExtractedProblem = Partial<Omit<CoachingExtractedProblem, "id" | "sourceLabel">>;

function stripDataUrl(value: string): string {
  const comma = value.indexOf(",");
  return value.startsWith("data:") && comma >= 0 ? value.slice(comma + 1) : value;
}

function buildPrompt(sourceLabel: string): string {
  const subjectList = SUBJECTS.map((s) => s.name).join(", ");
  const unitList = Object.entries(SUBJECT_UNITS)
    .map(([subject, units]) => `- ${subject}: ${units.join(", ")}`)
    .join("\n");

  return [
    "너는 편입수학 시험지 이미지를 문제 단위로 분리하는 비전 OCR 분석가다.",
    `이미지 출처: ${sourceLabel}`,
    "한 이미지에 여러 문제가 있으면 문제 번호 기준으로 모두 분리한다.",
    "두 단/여러 열 배치라면 한국 시험지 독해 순서대로 왼쪽 위에서 오른쪽 아래로 정렬한다.",
    "설명/코드펜스 없이 JSON 객체 하나만 출력한다.",
    "잘리거나 흐린 부분은 추측하지 말고 [불명확]으로 남긴다.",
    "",
    "출력 형식:",
    '{"problems":[{"problemNumber":"1","rawTranscription":"...","problemText":"...","options":[{"label":"①","text":"..."}],"figureDescription":"...","subject":"미분학","unit":"최대/최소","concept":"폐구간 최대최소","difficulty":"중","keywords":["최대최소"],"recognition":{"complete":true,"confidence":0.95,"missingParts":[],"notes":""}}]}',
    "",
    "필드 규칙:",
    "- rawTranscription: 문제 번호, 본문, 조건, 보기, 그림/표 내부 글자를 보이는 대로 전사한다.",
    "- problemText: 문제 본문과 조건을 정리한다. 보기는 options에도 분리하되 본문 조건은 생략하지 않는다.",
    '- options: 객관식 보기를 [{"label":"①","text":"..."}] 형태로 기록한다. 보기가 없으면 빈 배열.',
    "- figureDescription: 그래프, 도형, 표, 박스가 있으면 풀이에 필요한 관계와 값을 설명한다. 없으면 빈 문자열.",
    "- 수식은 가능한 LaTeX $...$ 또는 $$...$$로 보존한다.",
    `- subject: 다음 중 가장 가까운 하나. [${subjectList}]`,
    "- unit: 아래 과목별 단원 목록 중 가장 가까운 하나.",
    "- difficulty: 하 | 중하 | 중 | 중상 | 상 | 킬러 중 하나.",
    "- confidence는 0~1 숫자.",
    "",
    "과목별 단원:",
    unitList,
  ].join("\n");
}

function normalizeProblem(
  raw: RawExtractedProblem,
  sourceLabel: string,
  index: number
): CoachingExtractedProblem | null {
  const problemText = typeof raw.problemText === "string" ? raw.problemText.trim() : "";
  const rawTranscription =
    typeof raw.rawTranscription === "string" && raw.rawTranscription.trim()
      ? raw.rawTranscription.trim()
      : problemText;
  if (!problemText && !rawTranscription) return null;

  const options = Array.isArray(raw.options)
    ? raw.options
        .filter((option) => option && typeof option.label === "string" && typeof option.text === "string")
        .map((option) => ({ label: option.label.trim(), text: option.text.trim() }))
        .filter((option) => option.label || option.text)
        .slice(0, 10)
    : [];
  const recognition = raw.recognition;

  return {
    id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    sourceLabel,
    problemNumber: typeof raw.problemNumber === "string" ? raw.problemNumber.trim() : undefined,
    rawTranscription,
    problemText: problemText || rawTranscription,
    options,
    figureDescription:
      typeof raw.figureDescription === "string" ? raw.figureDescription.trim() : "",
    subject: typeof raw.subject === "string" ? raw.subject.trim() : "",
    unit: typeof raw.unit === "string" ? raw.unit.trim() : "",
    concept: typeof raw.concept === "string" ? raw.concept.trim() : "",
    difficulty: typeof raw.difficulty === "string" ? raw.difficulty.trim() : "",
    keywords: Array.isArray(raw.keywords)
      ? raw.keywords.filter((keyword): keyword is string => typeof keyword === "string").slice(0, 8)
      : [],
    recognition: {
      complete: recognition?.complete === true,
      confidence:
        typeof recognition?.confidence === "number"
          ? Math.max(0, Math.min(1, recognition.confidence))
          : 0.5,
      missingParts: Array.isArray(recognition?.missingParts)
        ? recognition.missingParts.filter((part): part is string => typeof part === "string").slice(0, 8)
        : [],
      notes: typeof recognition?.notes === "string" ? recognition.notes.trim() : "",
    },
  };
}

async function extractFromImage(input: Required<ImageInput>, indexOffset: number) {
  const result = await generateWithRetry({
    model: GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: input.mediaType, data: stripDataUrl(input.imageBase64) } },
          { text: buildPrompt(input.sourceLabel) },
        ],
      },
    ],
    config: { responseMimeType: "application/json", maxOutputTokens: 16384 },
  });

  const parsed = extractJson<{ problems?: RawExtractedProblem[] }>(result.text ?? "");
  const problems = Array.isArray(parsed?.problems) ? parsed.problems : [];
  return problems
    .map((problem, index) => normalizeProblem(problem, input.sourceLabel, indexOffset + index))
    .filter((problem): problem is CoachingExtractedProblem => Boolean(problem));
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { ok: false, message: "AI API 키가 설정되지 않았습니다. GEMINI_API_KEY를 확인해 주세요." },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as { images?: ImageInput[] } | null;
  const images = Array.isArray(body?.images) ? body.images : [];
  if (images.length === 0) {
    return NextResponse.json({ ok: false, message: "분석할 PDF/이미지 페이지가 없습니다." }, { status: 400 });
  }
  if (images.length > MAX_IMAGES) {
    return NextResponse.json(
      { ok: false, message: `한 번에 최대 ${MAX_IMAGES}페이지까지만 분석할 수 있습니다.` },
      { status: 400 }
    );
  }

  const normalized: Required<ImageInput>[] = [];
  let totalLength = 0;
  for (const [index, image] of images.entries()) {
    const imageBase64 = typeof image.imageBase64 === "string" ? stripDataUrl(image.imageBase64) : "";
    const mediaType = typeof image.mediaType === "string" ? image.mediaType : "";
    if (!imageBase64 || !ALLOWED_IMAGE_TYPES.has(mediaType)) {
      return NextResponse.json(
        { ok: false, message: "PNG/JPG/WEBP로 변환된 페이지 이미지만 분석할 수 있습니다." },
        { status: 400 }
      );
    }
    totalLength += imageBase64.length;
    normalized.push({
      id: image.id || String(index + 1),
      imageBase64,
      mediaType,
      sourceLabel: image.sourceLabel || `페이지 ${index + 1}`,
    });
  }
  if (totalLength > MAX_TOTAL_BASE64_LENGTH) {
    return NextResponse.json(
      { ok: false, message: "업로드 이미지가 너무 큽니다. 페이지 수를 줄이거나 더 작게 캡처해 주세요." },
      { status: 413 }
    );
  }

  try {
    const problems: CoachingExtractedProblem[] = [];
    for (const [index, image] of normalized.entries()) {
      const extracted = await extractFromImage(image, problems.length + index * 100);
      problems.push(...extracted);
    }
    return NextResponse.json({ ok: true, problems, count: problems.length });
  } catch (error) {
    return NextResponse.json({ ok: false, message: friendlyAiError(error) }, { status: 502 });
  }
}
