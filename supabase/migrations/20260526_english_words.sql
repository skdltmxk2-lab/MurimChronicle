-- 편입영어: 단어 테이블 + 틀린 단어 컬렉션(문제 오답과 별개)
-- Supabase SQL 에디터에서 실행하세요.

CREATE TABLE IF NOT EXISTS english_words (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  word text NOT NULL UNIQUE,
  meaning text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE english_words ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "english_words_read_all" ON english_words;
CREATE POLICY "english_words_read_all" ON english_words FOR SELECT USING (true);
-- 쓰기(등록/삭제)는 service_role(관리자 라우트)만.

CREATE TABLE IF NOT EXISTS english_wrong_words (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id bigint REFERENCES english_words(id) ON DELETE CASCADE,
  wrong_count int NOT NULL DEFAULT 1,
  last_wrong_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, word_id)
);
ALTER TABLE english_wrong_words ENABLE ROW LEVEL SECURITY;
-- 서버(service_role)만 접근.

-- 단어 테스트용 무작위 단어 추출
CREATE OR REPLACE FUNCTION random_english_words(p_count int)
RETURNS SETOF english_words
LANGUAGE sql STABLE
AS $$
  SELECT * FROM english_words ORDER BY random() LIMIT p_count;
$$;

-- 틀린 단어 기록(누적)
CREATE OR REPLACE FUNCTION record_wrong_word(p_user_id uuid, p_word_id bigint)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO english_wrong_words (user_id, word_id, wrong_count, last_wrong_at)
  VALUES (p_user_id, p_word_id, 1, now())
  ON CONFLICT (user_id, word_id)
  DO UPDATE SET wrong_count = english_wrong_words.wrong_count + 1, last_wrong_at = now();
END;
$$;
