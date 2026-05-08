-- 취약유형 모의고사 기능 — Phase 1 (데이터 레이어)
-- 작성일: 2026-05-09
--
-- 1) exam_attempts에 시험 종류(exam_type) 컬럼 추가 (BEFORE INSERT 트리거가
--    examId 패턴 기준으로 자동 분류).
-- 2) profiles에 last_weakness_exam_at, weakness_exam_count 컬럼 추가.
-- 3) user_unit_stats: 사용자×과목×단원별 풀이/오답 누적 통계.
-- 4) user_problem_history: 사용자×문제별 시도/오답 누적.
-- 5) weakness_exam_snapshots: 취약유형 시험 출제 의도(tier_breakdown +
--    응시 직전 사용자 상태) 저장.
-- 6) AFTER INSERT 트리거: exam_attempts insert 시 result.items[]를 펼쳐
--    user_unit_stats / user_problem_history bulk upsert + weakness 시험은
--    profiles 갱신.

-- ============================================================
-- 1. exam_attempts.exam_type
-- ============================================================
ALTER TABLE public.exam_attempts
  ADD COLUMN IF NOT EXISTS exam_type TEXT NOT NULL DEFAULT 'standard';
-- 'standard' | 'weakness' | 'daily'

-- BEFORE INSERT: examId 패턴으로 자동 분류
CREATE OR REPLACE FUNCTION public.exam_attempts_classify_type()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- 명시 지정이 있으면 그대로 사용 (단 'standard' 디폴트는 재분류 시도)
  IF NEW.exam_type IS NULL OR NEW.exam_type = 'standard' THEN
    IF NEW.exam_id LIKE 'weakness-%' THEN
      NEW.exam_type := 'weakness';
    ELSIF NEW.exam_id LIKE 'unit-daily-%' OR NEW.exam_id LIKE 'daily-%' THEN
      NEW.exam_type := 'daily';
    ELSE
      NEW.exam_type := 'standard';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_exam_attempts_classify ON public.exam_attempts;
CREATE TRIGGER trg_exam_attempts_classify
  BEFORE INSERT ON public.exam_attempts
  FOR EACH ROW EXECUTE FUNCTION public.exam_attempts_classify_type();

-- 기존 레코드도 한 번 분류
UPDATE public.exam_attempts
SET exam_type = CASE
  WHEN exam_id LIKE 'weakness-%' THEN 'weakness'
  WHEN exam_id LIKE 'unit-daily-%' OR exam_id LIKE 'daily-%' THEN 'daily'
  ELSE 'standard'
END
WHERE exam_type = 'standard';

-- ============================================================
-- 2. profiles 컬럼
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_weakness_exam_at TIMESTAMPTZ NULL;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS weakness_exam_count INT NOT NULL DEFAULT 0;

-- ============================================================
-- 3. user_unit_stats
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_unit_stats (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  unit TEXT NOT NULL,
  total INT NOT NULL DEFAULT 0,
  wrong INT NOT NULL DEFAULT 0,
  accuracy NUMERIC GENERATED ALWAYS AS (
    CASE WHEN total = 0 THEN NULL
         ELSE (total - wrong)::numeric / total END
  ) STORED,
  last_attempt_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, subject, unit)
);
CREATE INDEX IF NOT EXISTS idx_uus_user_acc
  ON public.user_unit_stats(user_id, accuracy);

-- ============================================================
-- 4. user_problem_history
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_problem_history (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  wrongs INT NOT NULL DEFAULT 0,
  last_correct BOOLEAN,
  last_attempt_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, problem_id)
);
CREATE INDEX IF NOT EXISTS idx_uph_user_wrong
  ON public.user_problem_history(user_id) WHERE wrongs > 0;

-- ============================================================
-- 5. weakness_exam_snapshots
-- ============================================================
CREATE TABLE IF NOT EXISTS public.weakness_exam_snapshots (
  attempt_id TEXT PRIMARY KEY REFERENCES public.exam_attempts(attempt_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_breakdown JSONB NOT NULL,
  user_state_before JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wes_user_created
  ON public.weakness_exam_snapshots(user_id, created_at DESC);

-- ============================================================
-- 6. RLS
-- ============================================================
ALTER TABLE public.user_unit_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_problem_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weakness_exam_snapshots ENABLE ROW LEVEL SECURITY;

-- 본인 데이터는 SELECT 가능
DROP POLICY IF EXISTS "own_unit_stats_select" ON public.user_unit_stats;
CREATE POLICY "own_unit_stats_select" ON public.user_unit_stats
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_problem_history_select" ON public.user_problem_history;
CREATE POLICY "own_problem_history_select" ON public.user_problem_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_snapshots_select" ON public.weakness_exam_snapshots;
CREATE POLICY "own_snapshots_select" ON public.weakness_exam_snapshots
  FOR SELECT USING (auth.uid() = user_id);

-- 관리자는 모두 가능
DROP POLICY IF EXISTS "admin_unit_stats_all" ON public.user_unit_stats;
CREATE POLICY "admin_unit_stats_all" ON public.user_unit_stats
  FOR ALL USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
  );

DROP POLICY IF EXISTS "admin_problem_history_all" ON public.user_problem_history;
CREATE POLICY "admin_problem_history_all" ON public.user_problem_history
  FOR ALL USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
  );

DROP POLICY IF EXISTS "admin_snapshots_all" ON public.weakness_exam_snapshots;
CREATE POLICY "admin_snapshots_all" ON public.weakness_exam_snapshots
  FOR ALL USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
  );

-- ============================================================
-- 7. AFTER INSERT 트리거: exam_attempts insert 시 통계 자동 갱신
-- ============================================================
-- 동작:
--  - result.items[]를 풀어 각 item의 problem_id로 questions의 subject/unit
--    을 join 후 user_unit_stats / user_problem_history에 bulk upsert.
--  - exam_type='weakness'면 profiles.last_weakness_exam_at, count 갱신.
CREATE OR REPLACE FUNCTION public.exam_attempts_update_stats()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_submitted TIMESTAMPTZ;
BEGIN
  -- result.submittedAt이 있으면 그걸 사용, 없으면 now()
  BEGIN
    v_submitted := COALESCE(
      (NEW.result->>'submittedAt')::timestamptz,
      NOW()
    );
  EXCEPTION WHEN OTHERS THEN
    v_submitted := NOW();
  END;

  -- (A) user_unit_stats 갱신: items × questions join
  INSERT INTO public.user_unit_stats (user_id, subject, unit, total, wrong, last_attempt_at, updated_at)
  SELECT
    NEW.user_id,
    q.subject,
    q.unit,
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE NOT (it->>'isCorrect')::boolean) AS wrong,
    v_submitted,
    NOW()
  FROM jsonb_array_elements(COALESCE(NEW.result->'items', '[]'::jsonb)) it
  JOIN public.questions q ON q.id = it->>'problemId'
  GROUP BY q.subject, q.unit
  ON CONFLICT (user_id, subject, unit) DO UPDATE SET
    total = public.user_unit_stats.total + EXCLUDED.total,
    wrong = public.user_unit_stats.wrong + EXCLUDED.wrong,
    last_attempt_at = GREATEST(
      COALESCE(public.user_unit_stats.last_attempt_at, '1970-01-01'::timestamptz),
      EXCLUDED.last_attempt_at
    ),
    updated_at = NOW();

  -- (B) user_problem_history 갱신
  INSERT INTO public.user_problem_history (user_id, problem_id, attempts, wrongs, last_correct, last_attempt_at)
  SELECT
    NEW.user_id,
    it->>'problemId',
    1,
    CASE WHEN (it->>'isCorrect')::boolean THEN 0 ELSE 1 END,
    (it->>'isCorrect')::boolean,
    v_submitted
  FROM jsonb_array_elements(COALESCE(NEW.result->'items', '[]'::jsonb)) it
  ON CONFLICT (user_id, problem_id) DO UPDATE SET
    attempts = public.user_problem_history.attempts + 1,
    wrongs = public.user_problem_history.wrongs + EXCLUDED.wrongs,
    last_correct = EXCLUDED.last_correct,
    last_attempt_at = EXCLUDED.last_attempt_at;

  -- (C) weakness 시험인 경우 profiles 갱신
  IF NEW.exam_type = 'weakness' THEN
    UPDATE public.profiles
    SET
      last_weakness_exam_at = v_submitted,
      weakness_exam_count = COALESCE(weakness_exam_count, 0) + 1
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_exam_attempts_update_stats ON public.exam_attempts;
CREATE TRIGGER trg_exam_attempts_update_stats
  AFTER INSERT ON public.exam_attempts
  FOR EACH ROW EXECUTE FUNCTION public.exam_attempts_update_stats();
