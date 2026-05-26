-- 편입영어 학습 시스템: 단어 학습 진척도 + 정렬·일별 RPC
-- Supabase SQL 에디터에서 실행하세요.

-- 사용자별 단어 학습 진척도(현재 day, 1부터 시작)
CREATE TABLE IF NOT EXISTS english_word_progress (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_day int NOT NULL DEFAULT 1,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE english_word_progress ENABLE ROW LEVEL SECURITY;
-- service_role(서버 라우트)만 접근.

-- 등록 순서(id ASC) 기준 슬라이스
CREATE OR REPLACE FUNCTION english_words_slice(p_offset int, p_limit int)
RETURNS SETOF english_words
LANGUAGE sql STABLE
AS $$
  SELECT * FROM english_words ORDER BY id ASC OFFSET GREATEST(p_offset, 0) LIMIT GREATEST(p_limit, 0);
$$;

-- 등록된 단어 총 개수
CREATE OR REPLACE FUNCTION english_words_total()
RETURNS int
LANGUAGE sql STABLE
AS $$
  SELECT COUNT(*)::int FROM english_words;
$$;

-- 오답 후보(주어진 id 제외, 무작위) — 객관식 distractor용
CREATE OR REPLACE FUNCTION english_words_distractors(p_exclude bigint[], p_limit int)
RETURNS SETOF english_words
LANGUAGE sql STABLE
AS $$
  SELECT *
  FROM english_words
  WHERE p_exclude IS NULL OR NOT (id = ANY(p_exclude))
  ORDER BY random()
  LIMIT GREATEST(p_limit, 0);
$$;
