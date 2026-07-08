-- 코칭 스튜디오 단원별 모고 PDF 생성/교체 사용 이력
-- 문제별 전역 사용 횟수를 기록해 재사용 여부 표시와 미사용 문제 우선 출제를 지원한다.

CREATE TABLE IF NOT EXISTS public.coaching_unit_mock_usage (
  question_id TEXT PRIMARY KEY REFERENCES public.questions(id) ON DELETE CASCADE,
  use_count INTEGER NOT NULL DEFAULT 0 CHECK (use_count >= 0),
  last_used_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.coaching_unit_mock_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_coaching_unit_mock_usage_all" ON public.coaching_unit_mock_usage;
CREATE POLICY "admin_coaching_unit_mock_usage_all"
  ON public.coaching_unit_mock_usage
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_coaching_unit_mock_usage_count
  ON public.coaching_unit_mock_usage (use_count, last_used_at);

CREATE OR REPLACE FUNCTION public.record_coaching_unit_mock_usage(p_question_ids text[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.coaching_unit_mock_usage (question_id, use_count, last_used_at, updated_at)
  SELECT DISTINCT question_id, 1, NOW(), NOW()
  FROM unnest(COALESCE(p_question_ids, ARRAY[]::text[])) AS question_id
  WHERE question_id IS NOT NULL AND question_id <> ''
  ON CONFLICT (question_id) DO UPDATE SET
    use_count = public.coaching_unit_mock_usage.use_count + 1,
    last_used_at = NOW(),
    updated_at = NOW();
END;
$$;
