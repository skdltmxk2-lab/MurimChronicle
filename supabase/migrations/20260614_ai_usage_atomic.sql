-- AI 일일 사용량 한도 원자화
-- Supabase SQL 에디터에서 실행하세요. (20260526_ai_usage_limits.sql 이후)
--
-- 기존 흐름: getDailyUsage(읽기) → 한도검사 → AI호출 → increment_ai_usage(+1).
-- 읽기와 증가 사이가 비원자적이라 동시 요청이 같은 카운트를 읽고 한도를 우회할 수 있었다.
--
-- consume_ai_usage: 행 잠금(FOR UPDATE) 하에 '한도 미만이면 +1' 을 원자적으로 수행.
--   - 반환값 >= 0 : 선점 성공(증가 후의 새 count)
--   - 반환값  -1 : 한도 도달(증가하지 않음)
-- refund_ai_usage: AI 호출 실패 시 선점분을 1 되돌린다(실패한 요청은 과금하지 않음).

CREATE OR REPLACE FUNCTION consume_ai_usage(p_user_id uuid, p_action text, p_limit integer)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  cur integer;
  today date := (now() AT TIME ZONE 'utc')::date;
BEGIN
  -- 행이 없으면 0으로 생성(이후 FOR UPDATE 로 잠글 대상 확보)
  INSERT INTO ai_usage (user_id, used_on, action, count)
  VALUES (p_user_id, today, p_action, 0)
  ON CONFLICT (user_id, used_on, action) DO NOTHING;

  SELECT count INTO cur
  FROM ai_usage
  WHERE user_id = p_user_id AND used_on = today AND action = p_action
  FOR UPDATE;

  IF cur >= p_limit THEN
    RETURN -1; -- 한도 도달: 증가하지 않음
  END IF;

  UPDATE ai_usage SET count = count + 1
  WHERE user_id = p_user_id AND used_on = today AND action = p_action
  RETURNING count INTO cur;

  RETURN cur;
END;
$$;

CREATE OR REPLACE FUNCTION refund_ai_usage(p_user_id uuid, p_action text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  today date := (now() AT TIME ZONE 'utc')::date;
BEGIN
  UPDATE ai_usage SET count = GREATEST(0, count - 1)
  WHERE user_id = p_user_id AND used_on = today AND action = p_action;
END;
$$;
