-- Prevent unreviewed or context-dependent questions from entering automatic exams.

DO $$
DECLARE
  quality_gate_already_installed BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'questions'
      AND column_name = 'quality_status'
  )
  INTO quality_gate_already_installed;

  ALTER TABLE public.questions
    ADD COLUMN IF NOT EXISTS quality_status TEXT NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS quality_reasons TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS validator_version TEXT;

  -- Preserve rows that were already serving before the gate was installed, then
  -- quarantine the context-dependent rows found by the first full-bank audit.
  IF NOT quality_gate_already_installed THEN
    UPDATE public.questions
    SET quality_status = 'approved',
        quality_reasons = ARRAY[]::TEXT[],
        validated_at = NOW(),
        validator_version = '20260723-backfill';

    UPDATE public.questions
    SET quality_status = 'quarantined',
        quality_reasons = ARRAY['external_question_reference']::TEXT[],
        validated_at = NOW(),
        validator_version = '20260723-v2'
    WHERE id IN (
      'q-2022-hanyang-14',
      'q-2023-hanyang-14',
      'q-2024-hanyang-14'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'questions_quality_status_check'
      AND conrelid = 'public.questions'::regclass
  ) THEN
    ALTER TABLE public.questions
      ADD CONSTRAINT questions_quality_status_check
      CHECK (quality_status IN ('pending', 'approved', 'quarantined'));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_questions_quality_status
  ON public.questions (quality_status);

CREATE OR REPLACE FUNCTION public.match_questions(
  query_embedding vector(768),
  match_count INT DEFAULT 5,
  p_subject TEXT DEFAULT NULL
)
RETURNS TABLE (id TEXT, similarity FLOAT)
LANGUAGE SQL STABLE
AS $$
  SELECT q.id::TEXT AS id,
         1 - (q.embedding <=> query_embedding) AS similarity
  FROM public.questions q
  WHERE q.embedding IS NOT NULL
    AND q.quality_status = 'approved'
    AND (p_subject IS NULL OR q.subject = p_subject)
  ORDER BY q.embedding <=> query_embedding
  LIMIT match_count;
$$;
