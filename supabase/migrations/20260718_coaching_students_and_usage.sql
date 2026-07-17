-- 코칭 스튜디오 학생 명단과 학생별 문제 사용 이력
-- 각 관리자(선생님)는 본인이 등록한 학생과 그 학생의 이력만 관리한다.

CREATE TABLE IF NOT EXISTS public.coaching_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 40),
  memo TEXT NOT NULL DEFAULT '' CHECK (char_length(memo) <= 200),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (teacher_id, id)
);

ALTER TABLE public.coaching_students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teachers_manage_own_coaching_students" ON public.coaching_students;
CREATE POLICY "teachers_manage_own_coaching_students"
  ON public.coaching_students
  FOR ALL
  USING (
    teacher_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  )
  WITH CHECK (
    teacher_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE INDEX IF NOT EXISTS idx_coaching_students_teacher_active
  ON public.coaching_students (teacher_id, is_active, name);

CREATE TABLE IF NOT EXISTS public.coaching_student_question_usage (
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  use_count INTEGER NOT NULL DEFAULT 0 CHECK (use_count >= 0),
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (teacher_id, student_id, question_id),
  CONSTRAINT coaching_usage_owned_student_fk
    FOREIGN KEY (teacher_id, student_id)
    REFERENCES public.coaching_students (teacher_id, id)
    ON DELETE CASCADE
);

ALTER TABLE public.coaching_student_question_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teachers_manage_own_coaching_usage" ON public.coaching_student_question_usage;
CREATE POLICY "teachers_manage_own_coaching_usage"
  ON public.coaching_student_question_usage
  FOR ALL
  USING (
    teacher_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  )
  WITH CHECK (
    teacher_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE INDEX IF NOT EXISTS idx_coaching_student_usage_student
  ON public.coaching_student_question_usage (teacher_id, student_id, use_count, last_used_at);

CREATE INDEX IF NOT EXISTS idx_coaching_student_usage_question
  ON public.coaching_student_question_usage (question_id);

CREATE OR REPLACE FUNCTION public.record_coaching_student_question_usage(
  p_teacher_id UUID,
  p_student_id UUID,
  p_question_ids TEXT[]
)
RETURNS TABLE (
  question_id TEXT,
  use_count INTEGER,
  last_used_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.coaching_students AS student
    JOIN public.profiles AS profile ON profile.id = student.teacher_id
    WHERE student.id = p_student_id
      AND student.teacher_id = p_teacher_id
      AND student.is_active = TRUE
      AND profile.is_admin = TRUE
  ) THEN
    RAISE EXCEPTION '선택한 학생을 찾을 수 없거나 접근 권한이 없습니다.'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.coaching_student_question_usage (
    teacher_id,
    student_id,
    question_id,
    use_count,
    last_used_at,
    created_at,
    updated_at
  )
  SELECT
    p_teacher_id,
    p_student_id,
    source.question_id,
    1,
    NOW(),
    NOW(),
    NOW()
  FROM (
    SELECT DISTINCT source_value.question_id
    FROM unnest(COALESCE(p_question_ids, ARRAY[]::TEXT[])) AS source_value(question_id)
    WHERE source_value.question_id IS NOT NULL AND btrim(source_value.question_id) <> ''
  ) AS source
  ON CONFLICT ON CONSTRAINT coaching_student_question_usage_pkey DO UPDATE SET
    use_count = public.coaching_student_question_usage.use_count + 1,
    last_used_at = NOW(),
    updated_at = NOW();

  RETURN QUERY
  SELECT
    usage.question_id,
    usage.use_count,
    usage.last_used_at
  FROM public.coaching_student_question_usage AS usage
  WHERE usage.teacher_id = p_teacher_id
    AND usage.student_id = p_student_id
    AND usage.question_id = ANY(COALESCE(p_question_ids, ARRAY[]::TEXT[]));
END;
$$;

REVOKE ALL ON FUNCTION public.record_coaching_student_question_usage(UUID, UUID, TEXT[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_coaching_student_question_usage(UUID, UUID, TEXT[]) FROM anon;
REVOKE ALL ON FUNCTION public.record_coaching_student_question_usage(UUID, UUID, TEXT[]) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.record_coaching_student_question_usage(UUID, UUID, TEXT[]) TO service_role;

-- 이전 전역 기록 함수도 브라우저에서 직접 호출할 수 없도록 제한한다.
DO $$
BEGIN
  IF to_regprocedure('public.record_coaching_unit_mock_usage(text[])') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.record_coaching_unit_mock_usage(TEXT[]) FROM PUBLIC';
    EXECUTE 'REVOKE ALL ON FUNCTION public.record_coaching_unit_mock_usage(TEXT[]) FROM anon';
    EXECUTE 'REVOKE ALL ON FUNCTION public.record_coaching_unit_mock_usage(TEXT[]) FROM authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.record_coaching_unit_mock_usage(TEXT[]) TO service_role';
  END IF;
END;
$$;
