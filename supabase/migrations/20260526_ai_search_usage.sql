-- AI 문제검색 일일 사용량(비전 호출 비용 통제용)
-- Supabase SQL 에디터에서 실행하세요.

CREATE TABLE IF NOT EXISTS ai_search_usage (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  used_on date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, used_on)
);

ALTER TABLE ai_search_usage ENABLE ROW LEVEL SECURITY;

-- 서버(service_role)만 접근한다. 일반 클라이언트 정책은 두지 않음(기본 차단).
-- requireTier는 service_role 키로 접속하므로 RLS를 우회한다.

-- 하루치 카운트를 1 증가시키고 갱신 후 값을 반환하는 헬퍼.
CREATE OR REPLACE FUNCTION increment_ai_search_usage(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  new_count integer;
  today date := (now() AT TIME ZONE 'utc')::date;
BEGIN
  INSERT INTO ai_search_usage (user_id, used_on, count)
  VALUES (p_user_id, today, 1)
  ON CONFLICT (user_id, used_on)
  DO UPDATE SET count = ai_search_usage.count + 1
  RETURNING count INTO new_count;
  RETURN new_count;
END;
$$;
