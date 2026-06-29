-- 커뮤니티 테이블 생성
-- Supabase SQL 에디터에서 실행하세요.

CREATE TABLE IF NOT EXISTS community_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'question' CHECK (category IN ('question', 'info', 'free')),
  like_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_post_likes (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- RLS 활성화
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;

-- 전체 읽기 허용
CREATE POLICY "posts_read_all" ON community_posts FOR SELECT USING (true);
CREATE POLICY "comments_read_all" ON community_comments FOR SELECT USING (true);
CREATE POLICY "likes_read_all" ON community_post_likes FOR SELECT USING (true);

-- 로그인 사용자만 작성
CREATE POLICY "posts_insert_auth" ON community_posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "posts_delete_own" ON community_posts FOR DELETE USING (auth.uid() = user_id);
-- 작성자 본인만 UPDATE. 좋아요/댓글 카운터는 toggle_post_like RPC 와 댓글 트리거가 갱신한다.
-- (20260614_community_fixes.sql 참고)
CREATE POLICY "posts_update_own" ON community_posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "comments_insert_auth" ON community_comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "comments_delete_own" ON community_comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "likes_insert_auth" ON community_post_likes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "likes_delete_own" ON community_post_likes FOR DELETE USING (auth.uid() = user_id);
