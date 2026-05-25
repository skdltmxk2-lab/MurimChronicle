-- 추천 엔진 설정 + 임베딩(벡터검색) 인프라
-- Supabase SQL 에디터에서 실행하세요. (pgvector 확장 필요)

-- 1) 앱 전역 설정 (검색 엔진 선택 등)
CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
-- service_role(서버)만 접근. 검색/관리 라우트 모두 service_role 사용 → RLS 우회.

INSERT INTO app_settings (key, value) VALUES ('search_engine', 'concept')
  ON CONFLICT (key) DO NOTHING;

-- 2) pgvector + 임베딩 컬럼
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS embedding vector(768);

-- (선택) 데이터가 많아지면 인덱스 추가 권장 — 백필 이후 실행:
-- CREATE INDEX IF NOT EXISTS questions_embedding_idx
--   ON questions USING hnsw (embedding vector_cosine_ops);

-- 3) 벡터 유사도 검색 함수 (id + 유사도만 반환 → 라우트에서 본문 조회)
CREATE OR REPLACE FUNCTION match_questions(
  query_embedding vector(768),
  match_count int DEFAULT 5,
  p_subject text DEFAULT NULL
)
RETURNS TABLE (id text, similarity float)
LANGUAGE sql STABLE
AS $$
  SELECT q.id::text AS id,
         1 - (q.embedding <=> query_embedding) AS similarity
  FROM questions q
  WHERE q.embedding IS NOT NULL
    AND (p_subject IS NULL OR q.subject = p_subject)
  ORDER BY q.embedding <=> query_embedding
  LIMIT match_count;
$$;
