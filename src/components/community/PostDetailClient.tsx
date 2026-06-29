"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authRepo } from "@/lib/auth/mockAuth";
import { supabase } from "@/lib/supabase/client";
import { adminFetch } from "@/lib/api/adminFetch";
import { checkBadWords } from "@/lib/moderation/badWords";
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
  const router = useRouter();
  const [user, setUser] = useState<MockUser | null>(null);
  const [post, setPost] = useState<CommunityPost | null | undefined>(undefined);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [nickname, setNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [realNames, setRealNames] = useState<Record<string, string>>({});
  const [deletingPost, setDeletingPost] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  useEffect(() => {
    authRepo.getCurrentUser().then(setUser);
    fetchPost();
    fetchComments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  useEffect(() => {
    if (!user) return;
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("cbt:community:nickname") : null;
    setNickname(saved || user.name || "");
  }, [user]);

  // 관리자: 글/댓글 작성자 실명 매핑
  useEffect(() => {
    if (user?.role !== "admin") return;
    const ids = Array.from(
      new Set([post?.user_id, ...comments.map((c) => c.user_id)].filter((x): x is string => !!x))
    );
    if (ids.length === 0) return;
    adminFetch("/api/admin/community/names", { method: "POST", body: JSON.stringify({ ids }) })
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setRealNames(j.names ?? {});
      })
      .catch(() => {});
  }, [user, post, comments]);

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

    // 좋아요 추가/취소 + 카운터 증감을 서버에서 원자적으로 처리(toggle_post_like RPC).
    const { data, error } = await supabase.rpc("toggle_post_like", { p_post_id: post.id });
    if (error) return;
    const liked = !!(data as { liked?: boolean } | null)?.liked;
    const likeCount = (data as { like_count?: number } | null)?.like_count ?? post.like_count;
    setPost({ ...post, liked_by_me: liked, like_count: likeCount });
  }

  async function submitComment() {
    if (!newComment.trim() || !post || !user) return;
    const nick = nickname.trim() || user.name;

    const bw = checkBadWords(newComment, nick);
    if (!bw.ok) {
      alert(`욕설·비방으로 감지되어 등록할 수 없습니다. (감지: "${bw.matched}")`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminFetch("/api/community/comments", {
        method: "POST",
        body: JSON.stringify({
          postId: post.id,
          content: newComment.trim(),
          userName: nick,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        alert(json.message ?? "댓글 작성에 실패했습니다.");
        return;
      }
      try { window.localStorage.setItem("cbt:community:nickname", nick); } catch { /* 무시 */ }
      setPost({ ...post, comment_count: post.comment_count + 1 });
      setNewComment("");
      fetchComments();
    } catch {
      alert("댓글 작성 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  function displayName(name: string, userId: string | null): string {
    if (user?.role === "admin" && userId && realNames[userId]) {
      return `${name} (${realNames[userId]})`;
    }
    return name;
  }

  async function deletePost() {
    if (!post) return;
    if (!window.confirm("이 글을 삭제할까요? 댓글도 함께 삭제됩니다.")) return;
    setDeletingPost(true);
    try {
      const res = await adminFetch(`/api/community/posts/${post.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) { alert(json.message ?? "삭제에 실패했습니다."); return; }
      router.push("/student/community");
    } catch {
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingPost(false);
    }
  }

  async function deleteComment(c: CommunityComment) {
    if (!window.confirm("이 댓글을 삭제할까요?")) return;
    setDeletingCommentId(c.id);
    try {
      const res = await adminFetch(`/api/community/comments/${c.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) { alert(json.message ?? "삭제에 실패했습니다."); return; }
      setComments((prev) => prev.filter((x) => x.id !== c.id));
      if (post) setPost({ ...post, comment_count: Math.max(0, post.comment_count - 1) });
    } catch {
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingCommentId(null);
    }
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
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <p className="text-xs text-slate-400">
            {displayName(post.user_name, post.user_id)} · {formatTimeAgo(post.created_at)}
          </p>
          {user && (user.id === post.user_id || user.role === "admin") ? (
            <button
              type="button"
              onClick={deletePost}
              disabled={deletingPost}
              className="shrink-0 text-xs font-bold text-red-500 hover:text-red-600 disabled:opacity-50"
            >
              {deletingPost ? "삭제 중..." : "글 삭제"}
            </button>
          ) : null}
        </div>
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
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-slate-500">
                  {displayName(c.user_name, c.user_id)} · {formatTimeAgo(c.created_at)}
                </p>
                {user && (user.id === c.user_id || user.role === "admin") ? (
                  <button
                    type="button"
                    onClick={() => deleteComment(c)}
                    disabled={deletingCommentId === c.id}
                    className="shrink-0 text-xs font-bold text-red-400 hover:text-red-600 disabled:opacity-50"
                  >
                    {deletingCommentId === c.id ? "삭제 중..." : "삭제"}
                  </button>
                ) : null}
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-slate-700">{c.content}</p>
            </div>
          ))}
        </div>

        {/* 댓글 작성 */}
        {user?.role === "student" ? (
          <div className="mt-4">
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              placeholder="닉네임"
              className="mb-2 w-44 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
            />
            <div className="flex gap-2">
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
