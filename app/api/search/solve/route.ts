import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";
import { gemini, GEMINI_MODEL } from "@/lib/ai/gemini";
import { getDailyUsage, bumpDailyUsage } from "@/lib/ai/usage";

const SOLVE_LIMIT = 10;

/** 업로드한 문제에 대한 Gemini 상세 풀이 생성 (인식 직후 표시용). */
export async function POST(request: Request) {
  const auth = await requireTier(request, "pro");
  if (!auth.ok) return auth.response;

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { ok: false, message: "AI 풀이가 아직 설정되지 않았습니다. (서버 키 미설정)" },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { problem?: { problemText?: string; subject?: string; unit?: string } }
    | null;
  const p = body?.problem;
  if (!p?.problemText) {
    return NextResponse.json({ ok: false, message: "문제 정보가 필요합니다." }, { status: 400 });
  }

  if (!auth.isAdmin) {
    const used = await getDailyUsage(auth.supabase, auth.userId, "solve");
    if (used >= SOLVE_LIMIT) {
      return NextResponse.json(
        { ok: false, message: `오늘 AI 풀이 한도(${SOLVE_LIMIT}회)를 모두 사용했어요. 내일 다시 이용해 주세요.` },
        { status: 429 }
      );
    }
  }

  try {
    const result = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                "다음 편입수학 문제를 자세히 풀어줘. 핵심 개념을 짚고 단계별로 근거를 들어 설명한 뒤 최종 답을 명확히 제시해.\n" +
                "한국어 설명은 일반 텍스트로 쓰고, 수식만 $...$(인라인)·$$...$$(블록)로 감싼다. 한국어를 \\text{}로 감싸지 마.\n\n" +
                `[과목/단원] ${p.subject ?? ""} ${p.unit ?? ""}\n[문제] ${p.problemText}`,
            },
          ],
        },
      ],
      config: { maxOutputTokens: 4000 },
    });
    const solution = (result.text ?? "").trim();
    if (!auth.isAdmin) await bumpDailyUsage(auth.supabase, auth.userId, "solve");
    return NextResponse.json({ ok: true, solution: solution || "풀이를 생성하지 못했어요." });
  } catch (e) {
    const message = e instanceof Error ? e.message : "AI 풀이 생성에 실패했습니다.";
    return NextResponse.json({ ok: false, message: `AI 풀이 오류: ${message}` }, { status: 502 });
  }
}
