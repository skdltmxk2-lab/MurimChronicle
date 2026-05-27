-- 욕설/도배 필터의 레이트 리밋 카운트(user_id 기준 최근 N초) 가속을 위한 인덱스.
-- Supabase SQL 에디터에서 실행하세요.

CREATE INDEX IF NOT EXISTS chat_messages_user_created_idx
  ON chat_messages (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS community_posts_user_created_idx
  ON community_posts (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS community_comments_user_created_idx
  ON community_comments (user_id, created_at DESC);
