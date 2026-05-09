-- 문제 풀(pool) 분리: general / daily / self_mock
-- 1. 컬럼 추가 + CHECK 제약
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS pool TEXT NOT NULL DEFAULT 'general';

-- CHECK 제약은 별도로 추가 (이미 존재할 수 있어 DO block으로 안전 처리)
DO $$ BEGIN
  ALTER TABLE public.questions
    ADD CONSTRAINT questions_pool_check
    CHECK (pool IN ('general','daily','self_mock'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. 백필: 'daily' 태그가 있는 문제를 pool='daily'로 이관
UPDATE public.questions
SET pool = 'daily'
WHERE pool = 'general' AND tags @> ARRAY['daily']::text[];

-- 3. 인덱스 (자주 풀로 필터하므로)
CREATE INDEX IF NOT EXISTS idx_questions_pool ON public.questions(pool);
