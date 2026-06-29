import { NextResponse } from "next/server";
import { GEMINI_MODEL, generateWithRetry, friendlyAiError } from "@/lib/ai/gemini";
import { requireTier } from "@/lib/auth/requireTier";
import { reserveDailyUsage, refundDailyUsage } from "@/lib/ai/usage";

const MAX_TURNS = 20;
const ASK_LIMIT = 20;

type Recommendation = { n: number; question: string; answer?: string; explanation?: string };

type ProblemContext = {
  problemText?: string;
  rawTranscription?: string;
  options?: string;
  figureDescription?: string;
  explanation?: string;
  answerText?: string;
  subject?: string;
  unit?: string;
  solution?: string;
  recommendations?: Recommendation[];
};

type ChatTurn = { role: "user" | "assistant"; content: string };

const TUTOR_SYSTEM =
  "너는 편입수학 전문 과외 선생님이야. 학생이 특정 문제의 풀이에 대해 물으면 친절하고 단계적으로 설명해. " +
  "한국어 설명은 일반 텍스트로 쓰고, 수식만 $...$(인라인)·$$...$$(블록)로 감싼다. 한국어를 \\text{}로 감싸지 마. " +
  "학생이 'n번 문제'라고 하면 아래 [추천 문제 목록]의 해당 번호 문제를 가리킨다. " +
  "모르는 건 모른다고 말하고, 한국어로 답해. 주어진 문제 맥락을 벗어난 질문에는 정중히 범위를 안내해.";

function buildProblemContext(p: ProblemContext): string {
  const parts: string[] = ["다음은 학생이 보고 있는 문제와 풀이 정보다."];
  if (p.subject || p.unit) parts.push(`[과목/단원] ${p.subject ?? ""} ${p.unit ?? ""}`.trim());
  if (p.problemText) parts.push(`[문제]\n${p.problemText}`);
  if (p.options) parts.push(`[보기]\n${p.options}`);
  if (p.figureDescription) parts.push(`[그림/표]\n${p.figureDescription}`);
  if (p.rawTranscription) parts.push(`[원본 전사 참고]\n${p.rawTranscription}`);
  if (p.answerText) parts.push(`[정답]\n${p.answerText}`);
  if (p.explanation) parts.push(`[공식 해설]\n${p.explanation}`);
  if (p.solution) parts.push(`[이 문제의 AI 풀이]\n${p.solution}`);
  if (Array.isArray(p.recommendations) && p.recommendations.length > 0) {
    const list = p.recommendations
      .map((r) => `${r.n}번: ${r.question}${r.answer ? `\n  정답: ${r.answer}` : ""}${r.explanation ? `\n  해설: ${r.explanation}` : ""}`)
      .join("\n\n");
    parts.push(`[추천 문제 목록]\n${list}`);
  }
  return parts.join("\n\n");
}

export async function POST(request: Request) {
  const auth = await requireTier(request, "pro");
  if (!auth.ok) return auth.response;

  if (!process.env.GEMINI_API_KEY) {
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

  // 대화 정규화: user/assistant만, 마지막은 user, 길이 제한
  const clean: ChatTurn[] = turns
    .filter(
      (t) =>
        (t.role === "user" || t.role === "assistant") &&
        typeof t.content === "string" &&
        t.content.trim()
    )
    .slice(-MAX_TURNS);
  if (clean.length === 0 || clean[clean.length - 1].role !== "user") {
    return NextResponse.json({ ok: false, message: "질문이 필요합니다." }, { status: 400 });
  }

  // 한도를 원자적으로 선점한다. AI 호출 실패 시 catch 에서 환불.
  if (!auth.isAdmin) {
    const reserved = await reserveDailyUsage(auth.supabase, auth.userId, "ask", ASK_LIMIT);
    if (!reserved.ok) {
      return NextResponse.json(
        { ok: false, message: `오늘 AI 튜터 질문 한도(${ASK_LIMIT}회)를 모두 사용했어요. 내일 다시 이용해 주세요.` },
        { status: 429 }
      );
    }
  }

  // Gemini는 assistant 역할을 "model"로 표기한다. 문제 맥락은 systemInstruction에 고정.
  const contents = clean.map((t) => ({
    role: t.role === "assistant" ? "model" : "user",
    parts: [{ text: t.content }],
  }));

  try {
    const result = await generateWithRetry({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: `${TUTOR_SYSTEM}\n\n${buildProblemContext(body.problem)}`,
        // gemini-2.5-flash는 thinking 토큰도 이 한도에 포함되므로 답변이 잘리지 않게 넉넉히.
        maxOutputTokens: 8192,
      },
    });
    const answer = (result.text ?? "").trim();
    return NextResponse.json({
      ok: true,
      answer: answer || "답변을 생성하지 못했어요. 다시 질문해 주세요.",
    });
  } catch (e) {
    if (!auth.isAdmin) await refundDailyUsage(auth.supabase, auth.userId, "ask");
    return NextResponse.json({ ok: false, message: friendlyAiError(e) }, { status: 502 });
  }
}
