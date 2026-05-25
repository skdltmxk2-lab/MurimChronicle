import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { requireTier } from "@/lib/auth/requireTier";
import { anthropic, AI_MODEL } from "@/lib/ai/anthropic";

const MAX_TURNS = 20;

type ProblemContext = {
  problemText?: string;
  options?: string;
  explanation?: string;
  answerText?: string;
  subject?: string;
  unit?: string;
};

type ChatTurn = { role: "user" | "assistant"; content: string };

const TUTOR_SYSTEM =
  "너는 편입수학 전문 과외 선생님이야. 학생이 특정 문제의 풀이에 대해 물으면 친절하고 단계적으로 설명해. " +
  "수식은 LaTeX로 작성하고 인라인은 $...$, 블록은 $$...$$ 를 사용해. 모르는 건 모른다고 말하고, 한국어로 답해. " +
  "주어진 문제와 해설 맥락을 벗어난 질문에는 정중히 범위를 안내해.";

function buildProblemContext(p: ProblemContext): string {
  const parts: string[] = ["다음은 학생이 보고 있는 문제와 풀이 정보다."];
  if (p.subject || p.unit) parts.push(`[과목/단원] ${p.subject ?? ""} ${p.unit ?? ""}`.trim());
  if (p.problemText) parts.push(`[문제]\n${p.problemText}`);
  if (p.options) parts.push(`[보기]\n${p.options}`);
  if (p.answerText) parts.push(`[정답]\n${p.answerText}`);
  if (p.explanation) parts.push(`[공식 해설]\n${p.explanation}`);
  return parts.join("\n\n");
}

export async function POST(request: Request) {
  const auth = await requireTier(request, "pro");
  if (!auth.ok) return auth.response;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { ok: false, message: "AI 튜터가 아직 설정되지 않았습니다. (서버 키 미설정)" },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { problem?: ProblemContext; messages?: ChatTurn[] }
    | null;
  const turns = Array.isArray(body?.messages) ? body!.messages : [];
  if (!body?.problem || turns.length === 0) {
    return NextResponse.json({ ok: false, message: "질문이 필요합니다." }, { status: 400 });
  }

  // 대화 길이 제한 + 형식 정규화 (user로 시작/끝, 교대)
  const clean: ChatTurn[] = turns
    .filter((t) => (t.role === "user" || t.role === "assistant") && typeof t.content === "string" && t.content.trim())
    .slice(-MAX_TURNS);
  if (clean.length === 0 || clean[clean.length - 1].role !== "user") {
    return NextResponse.json({ ok: false, message: "질문이 필요합니다." }, { status: 400 });
  }

  // 문제 맥락은 대화 내내 고정 → 프롬프트 캐싱 대상으로 둔다(맥락이 충분히 길면 캐시 적중).
  const system: Anthropic.TextBlockParam[] = [
    { type: "text", text: TUTOR_SYSTEM },
    {
      type: "text",
      text: buildProblemContext(body.problem),
      cache_control: { type: "ephemeral" },
    },
  ];

  const messages: Anthropic.MessageParam[] = clean.map((t) => ({
    role: t.role,
    content: t.content,
  }));

  try {
    const resp = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 2000,
      system,
      messages,
    });
    const answer = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return NextResponse.json({ ok: true, answer: answer || "답변을 생성하지 못했어요. 다시 질문해 주세요." });
  } catch (e) {
    const message = e instanceof Error ? e.message : "AI 튜터 응답에 실패했습니다.";
    return NextResponse.json({ ok: false, message: `AI 튜터 오류: ${message}` }, { status: 502 });
  }
}
