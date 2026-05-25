-- AI 기능 일일 사용량 (action별: search / solve / ask)
-- Supabase SQL 에디터에서 실행하세요. (기존 ai_search_usage 는 더 이상 사용하지 않음)

CREATE TABLE IF NOT EXISTS ai_usage (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  used_on date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  action text NOT NULL,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, used_on, action)
);

ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
-- 서버(service_role)만 접근 → 별도 정책 없이 기본 차단(서비스롤은 RLS 우회).

-- action별 하루치 카운트를 1 증가시키고 갱신 후 값을 반환.
CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id uuid, p_action text)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  new_count integer;
  today date := (now() AT TIME ZONE 'utc')::date;
BEGIN
  INSERT INTO ai_usage (user_id, used_on, action, count)
  VALUES (p_user_id, today, p_action, 1)
  ON CONFLICT (user_id, used_on, action)
  DO UPDATE SET count = ai_usage.count + 1
  RETURNING count INTO new_count;
  RETURN new_count;
END;
$$;
