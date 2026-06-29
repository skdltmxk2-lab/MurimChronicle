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

  // 게시글 댓글수는 community_comments 트리거(trg_comment_count)가 원자적으로 -1 한다.
  return NextResponse.json({ ok: true });
}
