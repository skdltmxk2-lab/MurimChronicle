import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";

/** 댓글 삭제 — 작성자 본인 또는 관리자만. 삭제 후 게시글 댓글수 감소(best-effort). */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireTier(request, "free");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, message: "댓글 ID가 필요합니다." }, { status: 400 });

  const { data: comment } = await auth.supabase
    .from("community_comments")
    .select("user_id, post_id")
    .eq("id", id)
    .maybeSingle();
  if (!comment) return NextResponse.json({ ok: false, message: "댓글을 찾을 수 없습니다." }, { status: 404 });

  if (comment.user_id !== auth.userId && !auth.isAdmin) {
    return NextResponse.json({ ok: false, message: "삭제 권한이 없습니다." }, { status: 403 });
  }

  const { error } = await auth.supabase.from("community_comments").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  // 댓글수 감소 (best-effort)
  const { data: post } = await auth.supabase
    .from("community_posts")
    .select("comment_count")
    .eq("id", comment.post_id)
    .maybeSingle();
  if (post) {
    await auth.supabase
      .from("community_posts")
      .update({ comment_count: Math.max(0, ((post.comment_count as number) ?? 1) - 1) })
      .eq("id", comment.post_id);
  }

  return NextResponse.json({ ok: true });
}
