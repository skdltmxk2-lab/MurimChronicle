BEGIN;

ALTER TABLE public.school_mock_problem_sheets
  ADD COLUMN IF NOT EXISTS exam jsonb CHECK (exam IS NULL OR jsonb_typeof(exam) = 'object');

-- Keep the legacy policies for other exams. Native school attempts are written
-- only by the authenticated grading endpoint and read only by their owner.
DO $policies$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'exam_attempts' AND policyname = 'konkuk_attempts_owner_select') THEN
    CREATE POLICY konkuk_attempts_owner_select ON public.exam_attempts AS RESTRICTIVE
      FOR SELECT TO anon, authenticated USING (
        (coalesce(exam_id, '') NOT LIKE 'school-konkuk-%'
          AND coalesce(result->>'examId', '') NOT LIKE 'school-konkuk-%')
        OR user_id::text = (select auth.uid())::text
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'exam_attempts' AND policyname = 'konkuk_attempts_server_insert') THEN
    CREATE POLICY konkuk_attempts_server_insert ON public.exam_attempts AS RESTRICTIVE
      FOR INSERT TO anon, authenticated WITH CHECK (
        coalesce(exam_id, '') NOT LIKE 'school-konkuk-%'
        AND coalesce(result->>'examId', '') NOT LIKE 'school-konkuk-%'
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'exam_attempts' AND policyname = 'konkuk_attempts_server_update') THEN
    CREATE POLICY konkuk_attempts_server_update ON public.exam_attempts AS RESTRICTIVE
      FOR UPDATE TO anon, authenticated USING (
        coalesce(exam_id, '') NOT LIKE 'school-konkuk-%'
        AND coalesce(result->>'examId', '') NOT LIKE 'school-konkuk-%'
      ) WITH CHECK (
        coalesce(exam_id, '') NOT LIKE 'school-konkuk-%'
        AND coalesce(result->>'examId', '') NOT LIKE 'school-konkuk-%'
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'exam_attempts' AND policyname = 'konkuk_attempts_server_delete') THEN
    CREATE POLICY konkuk_attempts_server_delete ON public.exam_attempts AS RESTRICTIVE
      FOR DELETE TO anon, authenticated USING (
        coalesce(exam_id, '') NOT LIKE 'school-konkuk-%'
        AND coalesce(result->>'examId', '') NOT LIKE 'school-konkuk-%'
      );
  END IF;
END;
$policies$;

NOTIFY pgrst, 'reload schema';

COMMIT;
