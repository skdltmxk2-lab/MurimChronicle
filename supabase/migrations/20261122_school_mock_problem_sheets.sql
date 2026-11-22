BEGIN;

CREATE TABLE IF NOT EXISTS public.school_mock_problem_sheets (
  school_code text NOT NULL CHECK (school_code ~ '^[a-z][a-z0-9-]*$'),
  round smallint NOT NULL CHECK (round BETWEEN 1 AND 999),
  object_name text NOT NULL CHECK (object_name ~ ('^round-' || round || '(-v[1-9][0-9]*)?[.]pdf$')),
  PRIMARY KEY (school_code, round),
  UNIQUE (school_code, object_name)
);

ALTER TABLE public.school_mock_problem_sheets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.school_mock_problem_sheets FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.school_mock_problem_sheets TO service_role;

INSERT INTO public.school_mock_problem_sheets (school_code, round, object_name)
VALUES
  ('konkuk', 1, 'round-1.pdf'),
  ('konkuk', 2, 'round-2-v2.pdf'),
  ('konkuk', 3, 'round-3.pdf'),
  ('konkuk', 4, 'round-4.pdf')
ON CONFLICT (school_code, round) DO NOTHING;

NOTIFY pgrst, 'reload schema';

COMMIT;
