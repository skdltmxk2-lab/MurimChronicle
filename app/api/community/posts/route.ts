import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";
import { checkBadWords } from "@/lib/moderation/badWords";
import { checkRateLimit } from "@/lib/moderation/rateLimit";

const VALID_CATEGORIES = new Set(["question", "info", "free"]);

// 새 게시글 작성. 욕설 필터 + 60초 1건 레이트 리밋.
export async function POST(request: Request) {
  const auth = await requireTier(request, "free");
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as
    | { title?: string; content?: string; category?: string; userName?: string }
    | null;
  const title = body?.title?.trim() ?? "";
  const content = body?.content?.trim() ?? "";
  const category = body?.category ?? "";
  const userName = body?.userName?.trim() ?? "";

  if (!title || !content) {
    return NextResponse.json({ ok: false, message: "제목과 내용을 입력해 주세요." }, { status: 400 });
  }
  if (title.length > 100 || content.length > 2000) {
    return NextResponse.json({ ok: false, message: "글자 수 제한을 초과했어요." }, { status: 400 });
  }
  if (!VALID_CATEGORIES.has(category)) {
    return NextResponse.json({ ok: false, message: "카테고리가 올바르지 않습니다." }, { status: 400 });
  }
  if (!userName) {
    return NextResponse.json({ ok: false, message: "닉네임을 입력해 주세요." }, { status: 400 });
  }

  // 욕설/비방 검사
  const bw = checkBadWords(title, content, userName);
  if (!bw.ok) {
    return NextResponse.json(
      { ok: false, message: `욕설·비방으로 감지되어 등록할 수 없습니다. (감지: "${bw.matched}")` },
      { status: 422 }
    );
  }

  // 레이트 리밋: 60초에 1건
  const rl = await checkRateLimit(auth.supabase, {
    table: "community_posts",
    userId: auth.userId,
    windowSec: 60,
    limit: 1,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, message: `잠깐만요. ${rl.retryAfterSec}초 후에 다시 작성해 주세요.` },
      { status: 429 }
    );
  }

  const { data, error } = await auth.supabase
    .from("community_posts")
    .insert({
      user_id: auth.userId,
      user_name: userName,
      title,
      content,
      category,
      like_count: 0,
      comment_count: 0,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data?.id });
}
