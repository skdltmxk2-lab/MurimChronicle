import { NextResponse } from "next/server";
import { gemini, GEMINI_MODEL } from "@/lib/ai/gemini";
import { requireTier } from "@/lib/auth/requireTier";

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

  // Gemini는 assistant 역할을 "model"로 표기한다. 문제 맥락은 systemInstruction에 고정.
  const contents = clean.map((t) => ({
    role: t.role === "assistant" ? "model" : "user",
    parts: [{ text: t.content }],
  }));

  try {
    const result = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: `${TUTOR_SYSTEM}\n\n${buildProblemContext(body.problem)}`,
        maxOutputTokens: 2000,
      },
    });
    const answer = (result.text ?? "").trim();
    return NextResponse.json({
      ok: true,
      answer: answer || "답변을 생성하지 못했어요. 다시 질문해 주세요.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "AI 튜터 응답에 실패했습니다.";
    return NextResponse.json({ ok: false, message: `AI 튜터 오류: ${message}` }, { status: 502 });
  }
}
