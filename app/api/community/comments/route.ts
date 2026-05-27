import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";
import { checkBadWords } from "@/lib/moderation/badWords";
import { checkRateLimit } from "@/lib/moderation/rateLimit";

// 새 댓글 작성. 욕설 필터 + 10초에 3건 레이트 리밋. 작성 후 게시글 댓글수 +1.
export async function POST(request: Request) {
  const auth = await requireTier(request, "free");
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as
    | { postId?: string; content?: string; userName?: string }
    | null;
  const postId = body?.postId?.trim() ?? "";
  const content = body?.content?.trim() ?? "";
  const userName = body?.userName?.trim() ?? "";

  if (!postId || !content) {
    return NextResponse.json({ ok: false, message: "내용을 입력해 주세요." }, { status: 400 });
  }
  if (content.length > 500) {
    return NextResponse.json({ ok: false, message: "댓글은 500자 이내로 작성해 주세요." }, { status: 400 });
  }
  if (!userName) {
    return NextResponse.json({ ok: false, message: "닉네임이 필요합니다." }, { status: 400 });
  }

  const bw = checkBadWords(content, userName);
  if (!bw.ok) {
    return NextResponse.json(
      { ok: false, message: `욕설·비방으로 감지되어 등록할 수 없습니다. (감지: "${bw.matched}")` },
      { status: 422 }
    );
  }

  const rl = await checkRateLimit(auth.supabase, {
    table: "community_comments",
    userId: auth.userId,
    windowSec: 10,
    limit: 3,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, message: "댓글을 너무 자주 작성하고 있어요. 잠시 후 다시 시도해 주세요." },
      { status: 429 }
    );
  }

  const { error } = await auth.supabase.from("community_comments").insert({
    post_id: postId,
    user_id: auth.userId,
    user_name: userName,
    content,
  });
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  // 게시글 댓글수 +1 (best-effort)
  const { data: post } = await auth.supabase
    .from("community_posts")
    .select("comment_count")
    .eq("id", postId)
    .maybeSingle();
  if (post) {
    await auth.supabase
      .from("community_posts")
      .update({ comment_count: ((post.comment_count as number) ?? 0) + 1 })
      .eq("id", postId);
  }

  return NextResponse.json({ ok: true });
}
