import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";
import { checkBadWords } from "@/lib/moderation/badWords";
import { checkRateLimit } from "@/lib/moderation/rateLimit";

const MAX_LEN = 300;

// 실시간 채팅 메시지 전송. 욕설 필터 + 10초에 5건 도배 방지.
export async function POST(request: Request) {
  const auth = await requireTier(request, "free");
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as
    | { content?: string; userName?: string }
    | null;
  const content = body?.content?.trim() ?? "";
  const userName = body?.userName?.trim() ?? "";

  if (!content) {
    return NextResponse.json({ ok: false, message: "메시지를 입력해 주세요." }, { status: 400 });
  }
  if (!userName) {
    return NextResponse.json({ ok: false, message: "이름이 필요합니다." }, { status: 400 });
  }
  const trimmed = content.slice(0, MAX_LEN);

  const bw = checkBadWords(trimmed);
  if (!bw.ok) {
    return NextResponse.json(
      { ok: false, message: `욕설·비방으로 감지되어 전송할 수 없습니다. (감지: "${bw.matched}")` },
      { status: 422 }
    );
  }

  const rl = await checkRateLimit(auth.supabase, {
    table: "chat_messages",
    userId: auth.userId,
    windowSec: 10,
    limit: 5,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, message: "메시지를 너무 빠르게 보내고 있어요. 잠시 후 다시 시도해 주세요." },
      { status: 429 }
    );
  }

  const { error } = await auth.supabase.from("chat_messages").insert({
    user_id: auth.userId,
    user_name: userName,
    content: trimmed,
  });
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
