import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";
import { gemini, GEMINI_MODEL, ALLOWED_IMAGE_TYPES, extractJson } from "@/lib/ai/gemini";
import { getDailyUsage, bumpDailyUsage } from "@/lib/ai/usage";
import { embedOne, EMBED_DIM } from "@/lib/ai/embed";
import { SUBJECTS, SUBJECT_UNITS, isKnownSubject } from "@/lib/taxonomy";
import type { SupabaseClient } from "@supabase/supabase-js";

const SELECT =
  "id, subject, unit, concept, difficulty, question, content_type, question_image, options, correct_option_id, explanation, explanation_content_type, explanation_image, question_type, answer_text";

// 비전 호출은 건당 과금이라 PRO라도 하루 횟수를 제한한다(관리자는 예외).
const SEARCH_LIMIT = 10;

type Extracted = {
  problemText: string;
  subject: string;
  unit: string;
  concept: string;
  difficulty: string;
  keywords: string[];
};

function buildPrompt(): string {
  const subjectList = SUBJECTS.map((s) => s.name).join(", ");
  const unitList = Object.entries(SUBJECT_UNITS)
    .map(([s, units]) => `- ${s}: ${units.join(", ")}`)
    .join("\n");
  return [
    "너는 편입수학 문제를 분석하는 도우미야. 첨부된 이미지에 있는 수학 문제를 읽고 아래 JSON만 출력해.",
    "설명/코드펜스 없이 JSON 객체 하나만 출력할 것.",
    "",
    "필드:",
    "- problemText: 문제 본문. 한국어 등 일반 텍스트는 그대로 쓰고, 수식만 $...$(인라인)·$$...$$(블록)로 감싼다. 한국어를 \\text{}로 감싸지 말 것.",
    `- subject: 다음 중 하나로만. [${subjectList}]`,
    "- unit: 아래 과목별 단원 목록 중 가장 가까운 것 하나.",
    "- concept: 핵심 개념(짧은 한국어 구).",
    "- difficulty: 하 | 중하 | 중 | 중상 | 상 | 킬러 중 하나(체감 난이도).",
    "- keywords: 검색에 쓸 핵심 키워드 2~5개의 배열(한국어).",
    "",
    "과목별 단원:",
    unitList,
    "",
    '출력 예: {"problemText":"유리함수 $f(x)=\\\\dfrac{ax}{3x+1}$와 그 역함수 $f^{-1}(x)$가 서로 같을 때, 상수 $a$의 값은?","subject":"미분학","unit":"함수","concept":"역함수","difficulty":"중","keywords":["역함수","유리함수"]}',
  ].join("\n");
}

/**
 * 같은 과목+단원 안에서, 이 문제에 가장 맞는 '개념(가장 작은 분류)'을 DB 개념 목록 중 하나로 선택.
 * 적절한 게 없으면 null → 추천 없음(엉뚱한 유형 추천 방지).
 */
async function pickConcept(problemText: string, concepts: string[]): Promise<string | null> {
  try {
    const result = await gemini.models.generateContent({
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
    .not("concept", "is", null)
    .limit(1000);
  const concepts = Array.from(
    new Set((conceptRows ?? []).map((r) => ((r.concept as string) ?? "").trim()).filter(Boolean))
  );
  const concept = concepts.length > 0 ? await pickConcept(extracted.problemText, concepts) : null;
  if (!concept) return [];
  const { data } = await supabase
    .from("questions")
    .select(SELECT)
    .eq("subject", extracted.subject)
    .eq("unit", extracted.unit)
    .eq("concept", concept)
    .limit(5);
  return data ?? [];
}

// 임베딩(벡터) 기반 매칭: 전체 DB에서 의미가 가까운 문제 추천 (같은 과목으로 한정)
async function embeddingMatch(supabase: SupabaseClient, extracted: Extracted): Promise<Record<string, unknown>[]> {
  try {
    const vec = await embedOne(`${extracted.subject} ${extracted.unit}\n${extracted.problemText}`, "RETRIEVAL_QUERY");
    if (vec.length !== EMBED_DIM) return [];
    const { data: ids } = await supabase.rpc("match_questions", {
      query_embedding: vec,
      match_count: 5,
      p_subject: isKnownSubject(extracted.subject) ? extracted.subject : null,
    });
    const idList = ((ids ?? []) as { id: string }[]).map((r) => r.id);
    if (idList.length === 0) return [];
    const { data } = await supabase.from("questions").select(SELECT).in("id", idList);
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
    | { imageBase64?: string; mediaType?: string }
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

  // 일일 한도 체크 (관리자 예외)
  if (!auth.isAdmin) {
    const used = await getDailyUsage(auth.supabase, auth.userId, "search");
    if (used >= SEARCH_LIMIT) {
      return NextResponse.json(
        { ok: false, message: `오늘 AI 검색 한도(${SEARCH_LIMIT}회)를 모두 사용했어요. 내일 다시 이용해 주세요.` },
        { status: 429 }
      );
    }
  }

  // 1) 비전으로 문제 추출
  let extracted: Extracted | null = null;
  try {
    const result = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: body.mediaType, data: body.imageBase64 } },
            { text: buildPrompt() },
          ],
        },
      ],
      config: { responseMimeType: "application/json" },
    });
    extracted = extractJson<Extracted>(result.text ?? "");
  } catch (e) {
    const message = e instanceof Error ? e.message : "AI 분석에 실패했습니다.";
    return NextResponse.json({ ok: false, message: `AI 분석 오류: ${message}` }, { status: 502 });
  }

  if (!extracted || !extracted.problemText) {
    return NextResponse.json(
      { ok: false, message: "이미지에서 문제를 인식하지 못했어요. 더 또렷한 사진으로 시도해 주세요." },
      { status: 422 }
    );
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

  // 3) 사용량 증가 (성공 시, best-effort)
  if (!auth.isAdmin) {
    await bumpDailyUsage(auth.supabase, auth.userId, "search");
  }

  return NextResponse.json({
    ok: true,
    extracted,
    matches: matches.slice(0, 5),
  });
}
