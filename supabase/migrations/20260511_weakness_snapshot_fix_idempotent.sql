-- weakness_exam_snapshots를 attempt_id 기반에서 exam_id 기반으로 재구성 (idempotent).
--
-- 배경:
--   처음 마이그레이션(20260509_weakness_exam.sql)에서 attempt_id를 PK + FK로
--   만들었으나, 실제 흐름은
--     1) generate 시점: exam_id 발급 + 스냅샷 저장
--     2) 응시 완료 후: attempt_id 생성 (스냅샷보다 나중)
--   이라 generate 시점에는 attempt_id가 존재할 수 없어 FK 제약이 위반된다.
--
--   기존 fix 마이그레이션(20260509_weakness_snapshot_fix.sql)이 production에
--   적용되지 않은 환경이 있어, 어떤 상태에서도 안전하게 정상 상태로 수렴하도록
--   idempotent하게 재작성한다.

-- ============================================================
-- 1) exam_id 컬럼 보장 (없으면 attempt_id를 rename, 그것도 없으면 새 컬럼)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'weakness_exam_snapshots'
      AND column_name = 'exam_id'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'weakness_exam_snapshots'
        AND column_name = 'attempt_id'
    ) THEN
      ALTER TABLE public.weakness_exam_snapshots RENAME COLUMN attempt_id TO exam_id;
    ELSE
      ALTER TABLE public.weakness_exam_snapshots ADD COLUMN exam_id TEXT;
    END IF;
  END IF;
END $$;

-- ============================================================
-- 2) PK/FK 정리 — attempt_id 기반 제약 제거 후 exam_id를 PK로
-- ============================================================
ALTER TABLE public.weakness_exam_snapshots
  DROP CONSTRAINT IF EXISTS weakness_exam_snapshots_pkey CASCADE;

ALTER TABLE public.weakness_exam_snapshots
  DROP CONSTRAINT IF EXISTS weakness_exam_snapshots_attempt_id_fkey;

DO $$
BEGIN
  -- exam_id가 PK가 아니면 부여 (이미 있으면 예외 무시)
  ALTER TABLE public.weakness_exam_snapshots
    ADD CONSTRAINT weakness_exam_snapshots_pkey PRIMARY KEY (exam_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN duplicate_table THEN NULL;
  WHEN invalid_table_definition THEN NULL;
END $$;

-- ============================================================
-- 3) attempt_id를 nullable link 컬럼으로 보장
-- ============================================================
ALTER TABLE public.weakness_exam_snapshots
  ADD COLUMN IF NOT EXISTS attempt_id TEXT NULL;

-- 혹시 NOT NULL이 남아있으면 풀어준다.
ALTER TABLE public.weakness_exam_snapshots
  ALTER COLUMN attempt_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_wes_attempt
  ON public.weakness_exam_snapshots(attempt_id) WHERE attempt_id IS NOT NULL;

-- ============================================================
-- 4) 응시 후 attempt_id link 트리거 (idempotent 재정의)
-- ============================================================
CREATE OR REPLACE FUNCTION public.exam_attempts_link_weakness_snapshot()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.exam_type = 'weakness' THEN
    UPDATE public.weakness_exam_snapshots
    SET attempt_id = NEW.attempt_id
    WHERE exam_id = NEW.exam_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_exam_attempts_link_snapshot ON public.exam_attempts;
CREATE TRIGGER trg_exam_attempts_link_snapshot
  AFTER INSERT ON public.exam_attempts
  FOR EACH ROW EXECUTE FUNCTION public.exam_attempts_link_weakness_snapshot();
