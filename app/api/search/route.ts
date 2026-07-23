import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";
import { GEMINI_MODEL, ALLOWED_IMAGE_TYPES, extractJson, generateWithRetry, friendlyAiError } from "@/lib/ai/gemini";
import { reserveDailyUsage, refundDailyUsage } from "@/lib/ai/usage";
import { embedOne, EMBED_DIM } from "@/lib/ai/embed";
import { SUBJECTS, SUBJECT_UNITS, isKnownSubject } from "@/lib/taxonomy";
import type { SupabaseClient } from "@supabase/supabase-js";

const SELECT =
  "id, subject, unit, concept, difficulty, question, content_type, question_image, options, correct_option_id, explanation, explanation_content_type, explanation_image, question_type, answer_text";

// 비전 호출은 건당 과금이라 PRO라도 하루 횟수를 제한한다(관리자는 예외).
const SEARCH_LIMIT = 10;

type Extracted = {
  rawTranscription: string;
  problemText: string;
  options: Array<{ label: string; text: string }>;
  figureDescription: string;
  subject: string;
  unit: string;
  concept: string;
  difficulty: string;
  keywords: string[];
  recognition: {
    complete: boolean;
    confidence: number;
    visibleOptionCount: number;
    missingParts: string[];
    notes: string;
  };
};

function buildPrompt(retryReason = ""): string {
  const subjectList = SUBJECTS.map((s) => s.name).join(", ");
  const unitList = Object.entries(SUBJECT_UNITS)
    .map(([s, units]) => `- ${s}: ${units.join(", ")}`)
    .join("\n");
  return [
    "너는 수학 시험지 원본을 정밀 판독하는 비전 OCR 분석가다.",
    "먼저 이미지 전체를 위에서 아래, 왼쪽에서 오른쪽으로 확인하고 보이는 내용을 빠짐없이 전사한 뒤 문제 정보를 구조화해라.",
    "설명/코드펜스 없이 JSON 객체 하나만 출력할 것.",
    "추측으로 누락 부분을 만들지 말고, 흐리거나 잘린 부분은 [불명확]으로 남겨라.",
    retryReason ? `이전 판독의 문제점: ${retryReason}. 이미지를 처음부터 다시 세밀하게 확인해라.` : "",
    "",
    "필드:",
    "- rawTranscription: 문제 번호, 지문, 조건, 모든 보기, 각주, 그림·표 안의 글자를 이미지에 보이는 순서대로 최대한 그대로 전사한다.",
    "- problemText: 문제 번호와 본문 및 조건을 구조화한다. 보기는 options에도 분리하되 본문의 조건을 생략하지 않는다.",
    '- options: 객관식 보기를 [{"label":"①","text":"..."}, ...] 형태로 모두 기록한다. 보기가 없으면 빈 배열이다.',
    "- figureDescription: 그래프, 도형, 표, 박스, 화살표와 그 안의 값 및 관계를 풀이에 쓸 수 있을 정도로 설명한다. 없으면 빈 문자열이다.",
    "- 일반 텍스트는 원문 언어로 쓰고, 수식은 가능한 한 LaTeX $...$ 또는 $$...$$로 보존한다.",
    "- 수식 판독이 애매하면 LaTeX 뒤에 [원문: ...] 형태로 보이는 문자도 함께 남긴다.",
    "- 문제 번호, ①②③④⑤, 조건식, 범위, 첨자, 지수, 적분 구간, 행렬, 표의 행·열을 절대 임의로 생략하지 않는다.",
    `- subject: 다음 중 하나로만. [${subjectList}]`,
    "- unit: 아래 과목별 단원 목록 중 가장 가까운 것 하나.",
    "- concept: 핵심 개념(짧은 한국어 구).",
    "- difficulty: 하 | 중하 | 중 | 중상 | 상 | 킬러 중 하나(체감 난이도).",
    "- keywords: 검색에 쓸 핵심 키워드 2~5개의 배열(한국어).",
    "- recognition: {complete, confidence, visibleOptionCount, missingParts, notes}. confidence는 0~1 숫자이고, 잘림·흐림·누락 가능성을 정직하게 기록한다.",
    "",
    "과목별 단원:",
    unitList,
    "",
    '출력 예: {"rawTranscription":"12. 유리함수 ... ① -3 ② -1 ③ 1 ④ 2 ⑤ 3","problemText":"12. 유리함수 $f(x)=\\\\dfrac{ax}{3x+1}$와 그 역함수 $f^{-1}(x)$가 서로 같을 때, 상수 $a$의 값은?","options":[{"label":"①","text":"$-3$"},{"label":"②","text":"$-1$"},{"label":"③","text":"$1$"},{"label":"④","text":"$2$"},{"label":"⑤","text":"$3$"}],"figureDescription":"","subject":"미분학","unit":"함수","concept":"역함수","difficulty":"중","keywords":["역함수","유리함수"],"recognition":{"complete":true,"confidence":0.98,"visibleOptionCount":5,"missingParts":[],"notes":""}}',
  ]
    .filter(Boolean)
    .join("\n");
}

function normalizeExtracted(value: Partial<Extracted> | null): Extracted | null {
  const problemText = typeof value?.problemText === "string" ? value.problemText.trim() : "";
  if (!problemText) return null;
  const options = Array.isArray(value?.options)
    ? value.options
        .filter((option) => option && typeof option.label === "string" && typeof option.text === "string")
        .map((option) => ({ label: option.label.trim(), text: option.text.trim() }))
        .filter((option) => option.label || option.text)
        .slice(0, 10)
    : [];
  const recognition = value?.recognition;
  return {
    rawTranscription:
      typeof value?.rawTranscription === "string" && value.rawTranscription.trim()
        ? value.rawTranscription.trim()
        : [problemText, ...options.map((option) => `${option.label} ${option.text}`)].join("\n"),
    problemText,
    options,
    figureDescription:
      typeof value?.figureDescription === "string" ? value.figureDescription.trim() : "",
    subject: typeof value?.subject === "string" ? value.subject.trim() : "",
    unit: typeof value?.unit === "string" ? value.unit.trim() : "",
    concept: typeof value?.concept === "string" ? value.concept.trim() : "",
    difficulty: typeof value?.difficulty === "string" ? value.difficulty.trim() : "",
    keywords: Array.isArray(value?.keywords)
      ? value.keywords.filter((keyword): keyword is string => typeof keyword === "string").slice(0, 8)
      : [],
    recognition: {
      complete: recognition?.complete === true,
      confidence:
        typeof recognition?.confidence === "number"
          ? Math.max(0, Math.min(1, recognition.confidence))
          : 0.5,
      visibleOptionCount:
        typeof recognition?.visibleOptionCount === "number"
          ? Math.max(0, Math.round(recognition.visibleOptionCount))
          : options.length,
      missingParts: Array.isArray(recognition?.missingParts)
        ? recognition.missingParts.filter((part): part is string => typeof part === "string").slice(0, 8)
        : [],
      notes: typeof recognition?.notes === "string" ? recognition.notes.trim() : "",
    },
  };
}

function extractionIssues(extracted: Extracted): string[] {
  const issues: string[] = [];
  const visibleMarks = new Set(extracted.rawTranscription.match(/[①②③④⑤]/g) ?? []).size;
  const expectedOptions = Math.max(extracted.recognition.visibleOptionCount, visibleMarks);
  if (extracted.rawTranscription.length < 35 || extracted.problemText.length < 20) {
    issues.push("인식된 텍스트가 지나치게 짧음");
  }
  if (expectedOptions > extracted.options.length) {
    issues.push(`보이는 보기 ${expectedOptions}개 중 ${extracted.options.length}개만 구조화됨`);
  }
  if (!extracted.recognition.complete) issues.push("모델이 판독 불완전을 보고함");
  if (extracted.recognition.confidence < 0.62) issues.push("판독 신뢰도가 낮음");
  if (extracted.recognition.missingParts.length > 0) {
    issues.push(`누락 가능 부분: ${extracted.recognition.missingParts.join(", ")}`);
  }
  return issues;
}

function extractionScore(extracted: Extracted): number {
  const issues = extractionIssues(extracted);
  return (
    Math.min(300, extracted.rawTranscription.length) +
    Math.min(300, extracted.problemText.length) +
    extracted.options.length * 45 +
    extracted.recognition.confidence * 100 -
    issues.length * 40
  );
}

async function extractProblemImage(
  imageBase64: string,
  mediaType: string,
  retryReason = ""
): Promise<Extracted | null> {
  const result = await generateWithRetry({
    model: GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: mediaType, data: imageBase64 } },
          { text: buildPrompt(retryReason) },
        ],
      },
    ],
    config: { responseMimeType: "application/json", maxOutputTokens: 8192 },
  });
  return normalizeExtracted(extractJson<Partial<Extracted>>(result.text ?? ""));
}

function searchableProblemText(extracted: Extracted): string {
  return [
    extracted.problemText,
    ...extracted.options.map((option) => `${option.label} ${option.text}`),
    extracted.figureDescription,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * 같은 과목+단원 안에서, 이 문제에 가장 맞는 '개념(가장 작은 분류)'을 DB 개념 목록 중 하나로 선택.
 * 적절한 게 없으면 null → 추천 없음(엉뚱한 유형 추천 방지).
 */
async function pickConcept(problemText: string, concepts: string[]): Promise<string | null> {
  try {
    const result = await generateWithRetry({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                "다음 수학 문제와 가장 일치하는 '개념'을 아래 목록에서 정확히 하나만 골라 JSON으로 답해.\n" +
                `문제: ${problemText}\n` +
                `개념 목록: ${JSON.stringify(concepts)}\n` +
                '반드시 목록에 있는 문자열을 그대로 사용하고, 적절한 것이 없으면 "NONE"으로 답한다.\n' +
                '형식: {"concept":"..."}',
            },
          ],
        },
      ],
      config: { responseMimeType: "application/json" },
    });
    const parsed = extractJson<{ concept?: string }>(result.text ?? "");
    const c = parsed?.concept?.trim();
    return c && c !== "NONE" && concepts.includes(c) ? c : null;
  } catch {
    return null;
  }
}

async function getSearchEngine(supabase: SupabaseClient): Promise<"concept" | "embedding"> {
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "search_engine")
    .maybeSingle();
  return data?.value === "embedding" ? "embedding" : "concept";
}

// 개념(태그) 기반 매칭: 과목+단원 안에서 개념 1개를 골라 정확 일치 문제만
async function conceptMatch(supabase: SupabaseClient, extracted: Extracted): Promise<Record<string, unknown>[]> {
  if (!isKnownSubject(extracted.subject)) return [];
  const units = SUBJECT_UNITS[extracted.subject as keyof typeof SUBJECT_UNITS] as readonly string[];
  if (!units.includes(extracted.unit)) return [];
  const { data: conceptRows } = await supabase
    .from("questions")
    .select("concept")
    .eq("subject", extracted.subject)
    .eq("unit", extracted.unit)
    .eq("quality_status", "approved")
    .not("concept", "is", null)
    .limit(1000);
  const concepts = Array.from(
    new Set((conceptRows ?? []).map((r) => ((r.concept as string) ?? "").trim()).filter(Boolean))
  );
  const concept = concepts.length > 0 ? await pickConcept(searchableProblemText(extracted), concepts) : null;
  if (!concept) return [];
  const { data } = await supabase
    .from("questions")
    .select(SELECT)
    .eq("subject", extracted.subject)
    .eq("unit", extracted.unit)
    .eq("concept", concept)
    .eq("quality_status", "approved")
    .limit(5);
  return data ?? [];
}

// 임베딩(벡터) 기반 매칭: 전체 DB에서 의미가 가까운 문제 추천 (같은 과목으로 한정)
async function embeddingMatch(supabase: SupabaseClient, extracted: Extracted): Promise<Record<string, unknown>[]> {
  try {
    const vec = await embedOne(
      `${extracted.subject} ${extracted.unit}\n${searchableProblemText(extracted)}`,
      "RETRIEVAL_QUERY"
    );
    if (vec.length !== EMBED_DIM) return [];
    const { data: ids } = await supabase.rpc("match_questions", {
      query_embedding: vec,
      match_count: 5,
      p_subject: isKnownSubject(extracted.subject) ? extracted.subject : null,
    });
    const idList = ((ids ?? []) as { id: string }[]).map((r) => r.id);
    if (idList.length === 0) return [];
    const { data } = await supabase
      .from("questions")
      .select(SELECT)
      .in("id", idList)
      .eq("quality_status", "approved");
    const rows = (data ?? []) as Record<string, unknown>[];
    const byId = new Map(rows.map((d) => [String(d.id), d]));
    return idList
      .map((id) => byId.get(String(id)))
      .filter((x): x is Record<string, unknown> => Boolean(x));
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  const auth = await requireTier(request, "pro");
  if (!auth.ok) return auth.response;

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { ok: false, message: "AI 검색이 아직 설정되지 않았습니다. (서버 키 미설정)" },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | {
        imageBase64?: string;
        mediaType?: string;
        debug?: {
          selection?: unknown;
          cropSize?: unknown;
          outputSize?: unknown;
          preprocessing?: unknown;
        };
      }
    | null;
  if (!body?.imageBase64 || !body?.mediaType) {
    return NextResponse.json({ ok: false, message: "이미지가 필요합니다." }, { status: 400 });
  }
  if (!ALLOWED_IMAGE_TYPES.has(body.mediaType)) {
    return NextResponse.json(
      { ok: false, message: "PNG·JPG·WEBP 이미지만 지원합니다." },
      { status: 400 }
    );
  }
  if (body.imageBase64.length > 20_000_000) {
    return NextResponse.json(
      { ok: false, message: "선택한 이미지가 너무 큽니다. 문제 영역을 조금 더 좁게 선택해 주세요." },
      { status: 413 }
    );
  }

  // 일일 한도를 원자적으로 선점 (관리자 예외). 인식 실패 시 아래에서 환불.
  const billed = !auth.isAdmin;
  if (billed) {
    const reserved = await reserveDailyUsage(auth.supabase, auth.userId, "search", SEARCH_LIMIT);
    if (!reserved.ok) {
      return NextResponse.json(
        { ok: false, message: `오늘 AI 검색 한도(${SEARCH_LIMIT}회)를 모두 사용했어요. 내일 다시 이용해 주세요.` },
        { status: 429 }
      );
    }
  }

  // 1) 비전으로 문제 추출
  let extracted: Extracted | null = null;
  let recognitionWarning = "";
  try {
    const first = await extractProblemImage(body.imageBase64, body.mediaType);
    if (first) {
      const firstIssues = extractionIssues(first);
      if (firstIssues.length > 0) {
        extracted = first;
        try {
          const second = await extractProblemImage(
            body.imageBase64,
            body.mediaType,
            firstIssues.join("; ")
          );
          if (second && extractionScore(second) >= extractionScore(first)) extracted = second;
        } catch {
          // 첫 판독 결과는 사용할 수 있으므로 재시도 실패만으로 검색 전체를 실패시키지 않는다.
        }
      } else {
        extracted = first;
      }
    }
  } catch (e) {
    if (billed) await refundDailyUsage(auth.supabase, auth.userId, "search");
    return NextResponse.json({ ok: false, message: friendlyAiError(e) }, { status: 502 });
  }

  if (!extracted || !extracted.problemText) {
    if (billed) await refundDailyUsage(auth.supabase, auth.userId, "search");
    return NextResponse.json(
      { ok: false, message: "이미지에서 문제를 인식하지 못했어요. 더 또렷한 사진으로 시도해 주세요." },
      { status: 422 }
    );
  }
  const remainingIssues = extractionIssues(extracted);
  if (remainingIssues.length > 0) {
    recognitionWarning =
      "이미지 일부가 흐리거나 잘려 인식이 불완전할 수 있습니다. 전송 미리보기에서 본문·보기·수식이 모두 포함됐는지 확인해 주세요.";
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[AI search recognition]", {
      mimeType: body.mediaType,
      approximateBytes: Math.round((body.imageBase64.length * 3) / 4),
      clientDebug: body.debug,
      transcriptionLength: extracted.rawTranscription.length,
      problemTextLength: extracted.problemText.length,
      optionCount: extracted.options.length,
      confidence: extracted.recognition.confidence,
      issues: remainingIssues,
    });
  }

  // 2) 추천 엔진(관리자 설정)에 따라 매칭. 임베딩이 비어있거나 결과 없으면 개념매칭으로 폴백.
  const engine = await getSearchEngine(auth.supabase);
  let matches: Record<string, unknown>[] = [];
  if (engine === "embedding") {
    matches = await embeddingMatch(auth.supabase, extracted);
    if (matches.length === 0) matches = await conceptMatch(auth.supabase, extracted);
  } else {
    matches = await conceptMatch(auth.supabase, extracted);
  }

  // 사용량은 위에서 이미 원자적으로 선점했다(인식 실패 시에만 환불). 여기서는 추가 증가 없음.
  return NextResponse.json({
    ok: true,
    extracted,
    recognitionWarning,
    matches: matches.slice(0, 5),
  });
}
