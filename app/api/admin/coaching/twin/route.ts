import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  ALLOWED_IMAGE_TYPES,
  GEMINI_MODEL,
  extractJson,
  friendlyAiError,
  generateWithRetry,
} from "@/lib/ai/gemini";
import { embedOne, EMBED_DIM } from "@/lib/ai/embed";
import { createCoachingQuestion, questionSearchText } from "@/lib/admin/coaching";
import { DIFFICULTY_KEYS, SUBJECT_NAMES, unitsForSubject } from "@/lib/taxonomy";
import type { ContentType, Difficulty, QuestionType } from "@/types/exam";
import type { QuestionDraft } from "@/types/question";

const DIFFICULTY_BY_LABEL: Record<string, Difficulty> = {
  하: "easy",
  중하: "easyMedium",
  중: "medium",
  중상: "mediumHard",
  상: "hard",
  킬러: "killer",
};

type TwinBody = {
  imageBase64?: string;
  mediaType?: string;
  sourceText?: string;
  instruction?: string;
  save?: boolean;
};

function stripDataUrl(value: string): string {
  const comma = value.indexOf(",");
  return value.startsWith("data:") && comma >= 0 ? value.slice(comma + 1) : value;
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function normalizeDifficulty(value: unknown): Difficulty {
  if (typeof value === "string") {
    if ((DIFFICULTY_KEYS as string[]).includes(value)) return value as Difficulty;
    if (DIFFICULTY_BY_LABEL[value]) return DIFFICULTY_BY_LABEL[value];
  }
  return "medium";
}

function normalizeContentType(value: unknown): ContentType {
  return value === "image" || value === "mixed" ? value : "latex";
}

function normalizeQuestionType(value: unknown, optionCount: number): QuestionType {
  if (value === "subjective") return "subjective";
  if (value === "multiple_choice") return "multiple_choice";
  return optionCount > 0 ? "multiple_choice" : "subjective";
}

function normalizeDraft(raw: Partial<QuestionDraft> | null): QuestionDraft | null {
  if (!raw || typeof raw.question !== "string" || !raw.question.trim()) return null;

  const rawSubject = typeof raw.subject === "string" ? raw.subject : "";
  const subject = SUBJECT_NAMES.includes(rawSubject as (typeof SUBJECT_NAMES)[number])
    ? rawSubject
    : SUBJECT_NAMES[0];
  const unitOptions = unitsForSubject(subject);
  const unit =
    typeof raw.unit === "string" && unitOptions.includes(raw.unit)
      ? raw.unit
      : unitOptions[0] ?? "추가내용";

  const rawOptions = Array.isArray(raw.options) ? raw.options : [];
  const options = rawOptions
    .filter((option) => option && typeof option.text === "string" && option.text.trim())
    .map((option, index) => ({
      id: option.id || String(index + 1),
      label: option.label || String(index + 1),
      text: option.text.trim(),
      contentType: normalizeContentType(option.contentType),
      image: option.image,
    }))
    .slice(0, 8);
  const questionType = normalizeQuestionType(raw.questionType, options.length);
  const correctOptionId =
    questionType === "multiple_choice" && options.length > 0
      ? options.find((option) => option.id === raw.correctOptionId)?.id ??
        options.find((option) => option.label === raw.correctOptionId)?.id ??
        options[0].id
      : "";

  return {
    subject,
    unit,
    concept: typeof raw.concept === "string" && raw.concept.trim() ? raw.concept.trim() : "쌍둥이 문제",
    difficulty: normalizeDifficulty(raw.difficulty),
    sourceType: "ai",
    pool: raw.pool ?? "general",
    question: raw.question.trim(),
    contentType: normalizeContentType(raw.contentType),
    questionImage: raw.questionImage,
    questionType,
    options: questionType === "multiple_choice" ? options : [],
    correctOptionId,
    answerText:
      questionType === "subjective"
        ? typeof raw.answerText === "string"
          ? raw.answerText.trim()
          : ""
        : undefined,
    explanation:
      typeof raw.explanation === "string" && raw.explanation.trim()
        ? raw.explanation.trim()
        : "풀이를 입력해 주세요.",
    explanationContentType: normalizeContentType(raw.explanationContentType),
    explanationImage: raw.explanationImage,
    tags: unique([...(Array.isArray(raw.tags) ? raw.tags : []), unit, "쌍둥이", "AI생성"]),
  };
}

function buildPrompt(sourceText: string, instruction: string): string {
  const subjectList = SUBJECT_NAMES.join(", ");
  const unitList = SUBJECT_NAMES.map((subject) => `- ${subject}: ${unitsForSubject(subject).join(", ")}`).join("\n");

  return [
    "너는 편입수학 강사용 문제 제작자다.",
    "원문 문제의 핵심 개념과 풀이 구조를 유지하되, 요청한 부분은 반드시 바꾼 쌍둥이 문제를 만든다.",
    "저작권 보호를 위해 문장과 수치, 조건을 그대로 복사하지 말고 동형 문제로 재작성한다.",
    "설명/코드펜스 없이 JSON 객체 하나만 출력한다.",
    "",
    "사용자 변경 요청:",
    instruction,
    "",
    sourceText ? `원문 텍스트:\n${sourceText}` : "원문은 첨부 이미지에서 판독한다.",
    "",
    "반드시 아래 형식으로 출력한다:",
    '{"draft":{"subject":"미분학","unit":"최대/최소","concept":"폐구간 최대최소","difficulty":"medium","sourceType":"ai","pool":"general","question":"...","contentType":"latex","questionType":"multiple_choice","options":[{"id":"1","label":"①","text":"...","contentType":"latex"}],"correctOptionId":"3","answerText":"","explanation":"...","explanationContentType":"latex","tags":["최대/최소","쌍둥이"]}}',
    "",
    "규칙:",
    `- subject는 다음 중 하나: ${subjectList}`,
    "- unit은 아래 단원 목록 중 하나.",
    "- difficulty는 easy, easyMedium, medium, mediumHard, hard, killer 중 하나.",
    "- 객관식이면 options는 4~5개, correctOptionId는 options의 id 중 하나.",
    "- 단답형이면 questionType은 subjective, options는 빈 배열, answerText에 정답을 쓴다.",
    "- 수식은 LaTeX로 작성한다.",
    "- explanation에는 정답이 왜 맞는지 검산 가능한 풀이를 포함한다.",
    "",
    "단원 목록:",
    unitList,
  ].join("\n");
}

async function generateTwinDraft(body: TwinBody): Promise<QuestionDraft | null> {
  const sourceText = typeof body.sourceText === "string" ? body.sourceText.trim() : "";
  const instruction = typeof body.instruction === "string" ? body.instruction.trim() : "";
  const imageBase64 = typeof body.imageBase64 === "string" ? stripDataUrl(body.imageBase64) : "";
  const mediaType = typeof body.mediaType === "string" ? body.mediaType : "";

  const parts =
    imageBase64 && ALLOWED_IMAGE_TYPES.has(mediaType)
      ? [
          { inlineData: { mimeType: mediaType, data: imageBase64 } },
          { text: buildPrompt(sourceText, instruction) },
        ]
      : [{ text: buildPrompt(sourceText, instruction) }];

  const result = await generateWithRetry({
    model: GEMINI_MODEL,
    contents: [{ role: "user", parts }],
    config: { responseMimeType: "application/json", maxOutputTokens: 16384 },
  });

  const parsed = extractJson<{ draft?: Partial<QuestionDraft> }>(result.text ?? "");
  return normalizeDraft(parsed?.draft ?? null);
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

  const body = (await request.json().catch(() => null)) as TwinBody | null;
  const instruction = typeof body?.instruction === "string" ? body.instruction.trim() : "";
  const sourceText = typeof body?.sourceText === "string" ? body.sourceText.trim() : "";
  const imageBase64 = typeof body?.imageBase64 === "string" ? stripDataUrl(body.imageBase64) : "";
  const mediaType = typeof body?.mediaType === "string" ? body.mediaType : "";

  if (!instruction) {
    return NextResponse.json({ ok: false, message: "어떤 부분을 바꿀지 입력해 주세요." }, { status: 400 });
  }
  if (!sourceText && !imageBase64) {
    return NextResponse.json({ ok: false, message: "원문 문제 텍스트 또는 이미지가 필요합니다." }, { status: 400 });
  }
  if (imageBase64 && !ALLOWED_IMAGE_TYPES.has(mediaType)) {
    return NextResponse.json({ ok: false, message: "PNG/JPG/WEBP 이미지만 지원합니다." }, { status: 400 });
  }
  if (imageBase64.length > 20_000_000) {
    return NextResponse.json({ ok: false, message: "이미지가 너무 큽니다. 문제 영역만 잘라 업로드해 주세요." }, { status: 413 });
  }

  try {
    const draft = await generateTwinDraft(body ?? {});
    if (!draft) {
      return NextResponse.json({ ok: false, message: "쌍둥이 문제를 구조화하지 못했습니다." }, { status: 422 });
    }

    if (!body?.save) {
      return NextResponse.json({ ok: true, draft });
    }

    const question = await createCoachingQuestion(auth.supabase, draft);
    let embedded = false;
    try {
      const vec = await embedOne(questionSearchText(question), "RETRIEVAL_DOCUMENT");
      if (vec.length === EMBED_DIM) {
        await auth.supabase.from("questions").update({ embedding: vec }).eq("id", question.id);
        embedded = true;
      }
    } catch {
      embedded = false;
    }

    return NextResponse.json({ ok: true, draft, question, embedded });
  } catch (error) {
    return NextResponse.json({ ok: false, message: friendlyAiError(error) }, { status: 502 });
  }
}
