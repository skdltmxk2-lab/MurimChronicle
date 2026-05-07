"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authRepo } from "@/lib/auth/mockAuth";
import { supabase } from "@/lib/supabase/client";
import type { MockUser } from "@/types/auth";
import type { CommunityPost, PostCategory } from "@/types/community";
import { CATEGORY_LABEL, CATEGORY_STYLE } from "@/types/community";

type Tab = "all" | "popular" | "question" | "info" | "free";

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

export function CommunityClient() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<PostCategory>("question");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    authRepo.getCurrentUser().then(setUser);
    fetchPosts("all");
  }, []);

  async function fetchPosts(activeTab: Tab) {
    setLoading(true);
    setDbError(false);
    try {
      let query = supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (activeTab === "popular") {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = supabase
          .from("community_posts")
          .select("*")
          .gte("created_at", yesterday.toISOString())
          .lt("created_at", today.toISOString())
          .order("like_count", { ascending: false })
          .limit(20);
      } else if (activeTab === "question" || activeTab === "info" || activeTab === "free") {
        query = supabase
          .from("community_posts")
          .select("*")
          .eq("category", activeTab)
          .order("created_at", { ascending: false })
          .limit(50);
      }

      const { data, error } = await query;
      if (error) { setDbError(true); return; }

      let postsData = (data ?? []) as CommunityPost[];

      // Check which posts the current user liked
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && postsData.length > 0) {
        const { data: likedRows } = await supabase
          .from("community_post_likes")
          .select("post_id")
          .eq("user_id", session.user.id)
          .in("post_id", postsData.map((p) => p.id));
        const likedSet = new Set((likedRows ?? []).map((r: { post_id: string }) => r.post_id));
        postsData = postsData.map((p) => ({ ...p, liked_by_me: likedSet.has(p.id) }));
      }

      setPosts(postsData);
    } catch {
      setDbError(true);
    } finally {
      setLoading(false);
    }
  }

  function switchTab(t: Tab) {
    setTab(t);
    fetchPosts(t);
  }

  async function toggleLike(post: CommunityPost) {
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
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, liked_by_me: false, like_count: Math.max(0, p.like_count - 1) }
            : p
        )
      );
    } else {
      await supabase
        .from("community_post_likes")
        .insert({ user_id: session.user.id, post_id: post.id });
      await supabase
        .from("community_posts")
        .update({ like_count: post.like_count + 1 })
        .eq("id", post.id);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, liked_by_me: true, like_count: p.like_count + 1 }
            : p
        )
      );
    }
  }

  async function submitPost() {
    if (!newTitle.trim() || !newContent.trim()) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user || !user) { alert("로그인 후 이용해 주세요."); return; }

    setSubmitting(true);
    const { error } = await supabase.from("community_posts").insert({
      user_id: session.user.id,
      user_name: user.name,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      like_count: 0,
      comment_count: 0,
    });

    if (error) { alert("글 작성에 실패했습니다."); }
    else {
      setNewTitle("");
      setNewContent("");
      setNewCategory("question");
      setShowCreate(false);
      fetchPosts(tab);
    }
    setSubmitting(false);
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: "all", label: "전체글" },
    { key: "popular", label: "🔥 인기글" },
    { key: "question", label: "질문" },
    { key: "info", label: "정보공유" },
    { key: "free", label: "자유게시판" },
  ];

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-0">
      {/* 헤더 배너 */}
      <div className="-mx-4 mb-4 bg-[#0D1F3C] px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📖</span>
          <h1 className="text-xl font-black text-white">커뮤니티</h1>
        </div>
      </div>

      {/* 경고 */}
      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        ⚠ 욕설·비방·광고성 글은 경고 없이 삭제됩니다.
      </div>

      {/* 글쓰기 버튼 */}
      {user?.role === "student" ? (
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="mb-4 w-full rounded-xl bg-brand-600 py-4 text-base font-black text-white hover:bg-brand-700"
        >
          + 글 쓰기
        </button>
      ) : (
        <div className="mb-4 rounded-xl border border-dashed border-line py-4 text-center text-sm text-slate-400">
          로그인 후 글을 작성할 수 있습니다.
        </div>
      )}

      {/* 탭 */}
      <div className="mb-1 flex border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => switchTab(t.key)}
            className={`px-4 py-3 text-sm font-black transition ${
              tab === t.key
                ? "border-b-2 border-brand-600 text-brand-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 포스트 목록 */}
      {dbError ? (
        <div className="py-12 text-center">
          <div className="text-3xl">🚧</div>
          <p className="mt-2 text-sm font-bold text-slate-500">커뮤니티 서비스를 준비 중입니다.</p>
          <p className="mt-1 text-xs text-slate-400">잠시 후 다시 시도해 주세요.</p>
        </div>
      ) : loading ? (
        <div className="py-12 text-center text-sm text-slate-400">불러오는 중...</div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-3xl">
            {tab === "popular" ? "🔥" : "✏️"}
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {tab === "popular" ? "어제 인기글이 아직 없습니다." : "첫 글을 작성해 보세요!"}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-line">
          {posts.map((post) => (
            <article key={post.id} className="py-5">
              <div className="mb-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${CATEGORY_STYLE[post.category]}`}
                >
                  {CATEGORY_LABEL[post.category]}
                </span>
              </div>
              <Link href={`/student/community/${post.id}`}>
                <h2 className="text-base font-black text-ink hover:text-brand-600">
                  {post.title}
                </h2>
              </Link>
              <p className="mt-1 text-xs text-slate-400">
                {post.user_name} · {formatTimeAgo(post.created_at)}
              </p>
              <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                <span>댓글 {post.comment_count}</span>
                <button
                  type="button"
                  onClick={() => toggleLike(post)}
                  className={`flex items-center gap-1 transition hover:text-brand-600 ${
                    post.liked_by_me ? "font-black text-brand-600" : ""
                  }`}
                >
                  <span>{post.liked_by_me ? "❤️" : "🤍"}</span>
                  <span>좋아요 {post.like_count}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* 글쓰기 모달 */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-4 pb-0 sm:items-center sm:pb-0"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-2xl bg-white p-6 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-black text-ink">글 쓰기</h2>

            {/* 카테고리 */}
            <div className="mb-3 flex gap-2">
              {(["question", "info", "free"] as PostCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setNewCategory(cat)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                    newCategory === cat
                      ? "bg-brand-600 text-white"
                      : "border border-line bg-white text-slate-600 hover:border-brand-400"
                  }`}
                >
                  {CATEGORY_LABEL[cat]}
                </button>
              ))}
            </div>

            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="mb-3 w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-brand-600"
              placeholder="제목"
              maxLength={100}
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="mb-4 h-36 w-full resize-none rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-brand-600"
              placeholder="내용을 입력하세요..."
              maxLength={2000}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="flex-1 rounded-lg border border-line py-3 text-sm font-black text-slate-600 hover:bg-slate-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={submitPost}
                disabled={submitting || !newTitle.trim() || !newContent.trim()}
                className="flex-1 rounded-lg bg-brand-600 py-3 text-sm font-black text-white hover:bg-brand-700 disabled:opacity-40"
              >
                {submitting ? "등록 중..." : "등록"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
