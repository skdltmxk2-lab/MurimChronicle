BEGIN;

-- Extend the existing restrictive policies while leaving unrelated exam IDs
-- subject to the same policies as before.
ALTER POLICY konkuk_attempts_owner_select ON public.exam_attempts USING (
  (coalesce(exam_id, '') !~ '^school-(konkuk|kyunghee|ewha)-'
    AND coalesce(result->>'examId', '') !~ '^school-(konkuk|kyunghee|ewha)-')
  OR user_id::text = (select auth.uid())::text
);

ALTER POLICY konkuk_attempts_server_insert ON public.exam_attempts WITH CHECK (
  coalesce(exam_id, '') !~ '^school-(konkuk|kyunghee|ewha)-'
  AND coalesce(result->>'examId', '') !~ '^school-(konkuk|kyunghee|ewha)-'
);

ALTER POLICY konkuk_attempts_server_update ON public.exam_attempts USING (
  coalesce(exam_id, '') !~ '^school-(konkuk|kyunghee|ewha)-'
  AND coalesce(result->>'examId', '') !~ '^school-(konkuk|kyunghee|ewha)-'
) WITH CHECK (
  coalesce(exam_id, '') !~ '^school-(konkuk|kyunghee|ewha)-'
  AND coalesce(result->>'examId', '') !~ '^school-(konkuk|kyunghee|ewha)-'
);

ALTER POLICY konkuk_attempts_server_delete ON public.exam_attempts USING (
  coalesce(exam_id, '') !~ '^school-(konkuk|kyunghee|ewha)-'
  AND coalesce(result->>'examId', '') !~ '^school-(konkuk|kyunghee|ewha)-'
);

COMMIT;
