import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { requireTier } from "@/lib/auth/requireTier";
import { anthropic, AI_MODEL, ALLOWED_IMAGE_TYPES, extractJson, type ImageMediaType } from "@/lib/ai/anthropic";
import { SUBJECTS, SUBJECT_UNITS, isKnownSubject } from "@/lib/taxonomy";

// 비전 호출은 건당 과금이라 PRO라도 하루 횟수를 제한한다(관리자는 예외).
const DAILY_LIMIT = 20;

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
    '- problemText: 문제 본문을 LaTeX로. 인라인 수식은 $...$, 블록 수식은 $$...$$ 사용.',
    `- subject: 다음 중 하나로만. [${subjectList}]`,
    "- unit: 아래 과목별 단원 목록 중 가장 가까운 것 하나.",
    "- concept: 핵심 개념(짧은 한국어 구).",
    "- difficulty: 하 | 중하 | 중 | 중상 | 상 | 킬러 중 하나(체감 난이도).",
    "- keywords: 검색에 쓸 핵심 키워드 2~5개의 배열(한국어).",
    "",
    "과목별 단원:",
    unitList,
    "",
    '출력 예: {"problemText":"$\\\\int_0^1 x^2\\\\,dx$ 의 값은?","subject":"적분학","unit":"정적분의 계산","concept":"정적분 계산","difficulty":"하","keywords":["정적분","다항함수"]}',
  ].join("\n");
}

export async function POST(request: Request) {
  const auth = await requireTier(request, "pro");
  if (!auth.ok) return auth.response;

  if (!process.env.ANTHROPIC_API_KEY) {
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
      { ok: false, message: "PNG·JPG·WEBP·GIF 이미지만 지원합니다." },
      { status: 400 }
    );
  }

  // 일일 한도 체크 (관리자 예외)
  const today = new Date().toISOString().slice(0, 10);
  if (!auth.isAdmin) {
    const { data: usage } = await auth.supabase
      .from("ai_search_usage")
      .select("count")
      .eq("user_id", auth.userId)
      .eq("used_on", today)
      .maybeSingle();
    const used = (usage?.count as number | undefined) ?? 0;
    if (used >= DAILY_LIMIT) {
      return NextResponse.json(
        { ok: false, message: `오늘 AI 검색 한도(${DAILY_LIMIT}회)를 모두 사용했어요. 내일 다시 이용해 주세요.` },
        { status: 429 }
      );
    }
  }

  // 1) 비전으로 문제 추출
  let extracted: Extracted | null = null;
  try {
    const messages: Anthropic.MessageParam[] = [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: body.mediaType as ImageMediaType,
              data: body.imageBase64,
            },
          },
          { type: "text", text: buildPrompt() },
        ],
      },
    ];
    const resp = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 1500,
      messages,
    });
    const text = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    extracted = extractJson<Extracted>(text);
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

  // 2) 추출 결과로 우리 DB에서 유사 문제 매칭 (과목+단원 → 과목 순으로 broaden)
  const SELECT =
    "id, subject, unit, concept, difficulty, question, content_type, question_image, options, correct_option_id, explanation, explanation_content_type, explanation_image, question_type, answer_text";
  const matches: Record<string, unknown>[] = [];
  const subjectOk = isKnownSubject(extracted.subject);
  if (subjectOk) {
    const units = SUBJECT_UNITS[extracted.subject as keyof typeof SUBJECT_UNITS] as readonly string[];
    const unitOk = units.includes(extracted.unit);
    if (unitOk) {
      const { data } = await auth.supabase
        .from("questions")
        .select(SELECT)
        .eq("subject", extracted.subject)
        .eq("unit", extracted.unit)
        .limit(6);
      if (data) matches.push(...data);
    }
    if (matches.length < 3) {
      const { data } = await auth.supabase
        .from("questions")
        .select(SELECT)
        .eq("subject", extracted.subject)
        .limit(6);
      if (data) {
        for (const row of data) {
          if (!matches.some((m) => m.id === row.id)) matches.push(row);
          if (matches.length >= 6) break;
        }
      }
    }
  }

  // 3) 사용량 증가 (성공 시, best-effort)
  if (!auth.isAdmin) {
    await auth.supabase.rpc("increment_ai_search_usage", { p_user_id: auth.userId });
  }

  return NextResponse.json({
    ok: true,
    extracted,
    matches: matches.slice(0, 6),
  });
}
