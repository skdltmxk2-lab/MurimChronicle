CREATE TABLE IF NOT EXISTS public.student_wrong_question_completions (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, problem_id)
);

CREATE INDEX IF NOT EXISTS idx_student_wrong_completions_user_completed
  ON public.student_wrong_question_completions (user_id, completed_at DESC);

ALTER TABLE public.student_wrong_question_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "student wrong completions select own" ON public.student_wrong_question_completions;
CREATE POLICY "student wrong completions select own"
  ON public.student_wrong_question_completions
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "student wrong completions insert own" ON public.student_wrong_question_completions;
CREATE POLICY "student wrong completions insert own"
  ON public.student_wrong_question_completions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "student wrong completions update own" ON public.student_wrong_question_completions;
CREATE POLICY "student wrong completions update own"
  ON public.student_wrong_question_completions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "student wrong completions delete own" ON public.student_wrong_question_completions;
CREATE POLICY "student wrong completions delete own"
  ON public.student_wrong_question_completions
  FOR DELETE
  USING (auth.uid() = user_id);
