"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authRepo } from "@/lib/auth/mockAuth";
import { supabase } from "@/lib/supabase/client";
import type { MockUser } from "@/types/auth";
import type { CommunityComment, CommunityPost } from "@/types/community";
import { CATEGORY_LABEL, CATEGORY_STYLE } from "@/types/community";

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR");
}

export function PostDetailClient({ postId }: { postId: string }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [post, setPost] = useState<CommunityPost | null | undefined>(undefined);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    authRepo.getCurrentUser().then(setUser);
    fetchPost();
    fetchComments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function fetchPost() {
    const { data } = await supabase
      .from("community_posts")
      .select("*")
      .eq("id", postId)
      .single();
    if (!data) { setPost(null); return; }

    let postData = data as CommunityPost;
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: likeRow } = await supabase
        .from("community_post_likes")
        .select("post_id")
        .match({ user_id: session.user.id, post_id: postId })
        .single();
      postData = { ...postData, liked_by_me: !!likeRow };
    }
    setPost(postData);
  }

  async function fetchComments() {
    const { data } = await supabase
      .from("community_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    setComments((data ?? []) as CommunityComment[]);
  }

  async function toggleLike() {
    if (!post) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { alert("로그인 후 이용해 주세요."); return; }

    if (post.liked_by_me) {
      await supabase
        .from("community_post_likes")
        .delete()
        .match({ user_id: session.user.id, post_id: post.id });
      await supabase
        .from("community_posts")
        .update({ like_count: Math.max(0, post.like_count - 1) })
        .eq("id", post.id);
      setPost({ ...post, liked_by_me: false, like_count: Math.max(0, post.like_count - 1) });
    } else {
      await supabase
        .from("community_post_likes")
        .insert({ user_id: session.user.id, post_id: post.id });
      await supabase
        .from("community_posts")
        .update({ like_count: post.like_count + 1 })
        .eq("id", post.id);
      setPost({ ...post, liked_by_me: true, like_count: post.like_count + 1 });
    }
  }

  async function submitComment() {
    if (!newComment.trim() || !post) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user || !user) { alert("로그인 후 이용해 주세요."); return; }

    setSubmitting(true);
    const { error } = await supabase.from("community_comments").insert({
      post_id: post.id,
      user_id: session.user.id,
      user_name: user.name,
      content: newComment.trim(),
    });
    if (!error) {
      await supabase
        .from("community_posts")
        .update({ comment_count: post.comment_count + 1 })
        .eq("id", post.id);
      setPost({ ...post, comment_count: post.comment_count + 1 });
      setNewComment("");
      fetchComments();
    }
    setSubmitting(false);
  }

  if (post === undefined) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-slate-400">불러오는 중...</p>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 text-center">
        <div className="text-3xl">🔍</div>
        <p className="mt-2 text-sm text-slate-500">게시글을 찾을 수 없습니다.</p>
        <Link href="/student/community" className="mt-4 inline-block text-sm font-black text-brand-600 hover:underline">
          커뮤니티로 돌아가기
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-0">
      {/* 헤더 배너 */}
      <div className="-mx-4 mb-4 bg-[#0D1F3C] px-6 py-4">
        <Link href="/student/community" className="flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white">
          ← 커뮤니티
        </Link>
      </div>

      {/* 글 본문 */}
      <article className="mb-6">
        <div className="mb-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${CATEGORY_STYLE[post.category]}`}>
            {CATEGORY_LABEL[post.category]}
          </span>
        </div>
        <h1 className="text-xl font-black text-ink">{post.title}</h1>
        <p className="mt-1.5 text-xs text-slate-400">
          {post.user_name} · {formatTimeAgo(post.created_at)}
        </p>
        <div className="mt-5 min-h-24 whitespace-pre-wrap text-sm leading-7 text-slate-700">
          {post.content}
        </div>

        {/* 좋아요 */}
        <div className="mt-6 flex items-center gap-4 border-t border-line pt-4">
          <button
            type="button"
            onClick={toggleLike}
            className={`flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-bold transition ${
              post.liked_by_me
                ? "border-brand-400 bg-brand-50 text-brand-700"
                : "border-line bg-white text-slate-600 hover:border-brand-400"
            }`}
          >
            <span>{post.liked_by_me ? "❤️" : "🤍"}</span>
            <span>좋아요 {post.like_count}</span>
          </button>
          <span className="text-xs text-slate-400">댓글 {post.comment_count}</span>
        </div>
      </article>

      {/* 댓글 */}
      <section>
        <h2 className="mb-4 text-sm font-black text-ink">댓글 {comments.length}</h2>
        <div className="divide-y divide-line">
          {comments.map((c) => (
            <div key={c.id} className="py-4">
              <p className="text-xs font-bold text-slate-500">{c.user_name} · {formatTimeAgo(c.created_at)}</p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-slate-700">{c.content}</p>
            </div>
          ))}
        </div>

        {/* 댓글 작성 */}
        {user?.role === "student" ? (
          <div className="mt-4 flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 resize-none rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-brand-600"
              placeholder="댓글을 입력하세요..."
              rows={2}
              maxLength={500}
            />
            <button
              type="button"
              onClick={submitComment}
              disabled={submitting || !newComment.trim()}
              className="shrink-0 self-end rounded-lg bg-brand-600 px-4 py-3 text-sm font-black text-white hover:bg-brand-700 disabled:opacity-40"
            >
              등록
            </button>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-line py-4 text-center text-sm text-slate-400">
            로그인 후 댓글을 작성할 수 있습니다.
          </div>
        )}
      </section>
    </main>
  );
}
