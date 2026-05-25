import { NextResponse } from "next/server";
import { requireTier } from "@/lib/auth/requireTier";

/**
 * 게시글 삭제 — 작성자 본인 또는 관리자만. 서비스롤로 처리(RLS 우회)하되 권한은 코드에서 검증.
 * community_comments / community_post_likes 는 FK ON DELETE CASCADE 로 함께 삭제됨.
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireTier(request, "free");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, message: "게시글 ID가 필요합니다." }, { status: 400 });

  const { data: post } = await auth.supabase
    .from("community_posts")
    .select("user_id")
    .eq("id", id)
    .maybeSingle();
  if (!post) return NextResponse.json({ ok: false, message: "게시글을 찾을 수 없습니다." }, { status: 404 });

  if (post.user_id !== auth.userId && !auth.isAdmin) {
    return NextResponse.json({ ok: false, message: "삭제 권한이 없습니다." }, { status: 403 });
  }

  const { error } = await auth.supabase.from("community_posts").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
