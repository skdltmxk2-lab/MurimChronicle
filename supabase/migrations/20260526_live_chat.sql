-- 실시간 채팅 (전체 단일 채팅방)
-- Supabase SQL 에디터에서 실행하세요.

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name text NOT NULL,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 300),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages (created_at DESC);

-- RLS 활성화
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 전체 읽기 허용 (비로그인 포함)
DROP POLICY IF EXISTS "chat_read_all" ON chat_messages;
CREATE POLICY "chat_read_all" ON chat_messages FOR SELECT USING (true);

-- 로그인 사용자만, 본인 user_id로만 작성
DROP POLICY IF EXISTS "chat_insert_auth" ON chat_messages;
CREATE POLICY "chat_insert_auth" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 본인 메시지 삭제, 관리자는 전체 삭제 가능
DROP POLICY IF EXISTS "chat_delete_own_or_admin" ON chat_messages;
CREATE POLICY "chat_delete_own_or_admin" ON chat_messages FOR DELETE USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);

-- Realtime 발행에 테이블 등록 (이미 등록돼 있으면 건너뜀)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
  END IF;
END $$;
