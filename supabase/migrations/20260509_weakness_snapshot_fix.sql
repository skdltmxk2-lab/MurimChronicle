-- 취약유형 모의고사 — weakness_exam_snapshots 키 수정
--
-- 처음 명세대로 attempt_id PK로 만들었는데, 실제 동작 흐름에서는
--   1) generate 시점에 exam_id 발급 + 스냅샷 저장이 먼저 일어나고
--   2) 응시 완료 후 별도 attempt_id가 생성됨
-- 즉 generate 시점에는 attempt_id를 알 수 없어 FK 제약을 만족할 수 없다.
--
-- 해결: 키를 exam_id로 변경. attempt_id는 응시 후 별도 link 컬럼으로.

ALTER TABLE public.weakness_exam_snapshots
  DROP CONSTRAINT IF EXISTS weakness_exam_snapshots_pkey CASCADE;

ALTER TABLE public.weakness_exam_snapshots
  RENAME COLUMN attempt_id TO exam_id;

ALTER TABLE public.weakness_exam_snapshots
  ADD COLUMN IF NOT EXISTS attempt_id TEXT NULL; -- 응시 후 link

ALTER TABLE public.weakness_exam_snapshots
  ADD CONSTRAINT weakness_exam_snapshots_pkey PRIMARY KEY (exam_id);

CREATE INDEX IF NOT EXISTS idx_wes_attempt
  ON public.weakness_exam_snapshots(attempt_id) WHERE attempt_id IS NOT NULL;

-- 응시 완료 시 weakness 시험 attempt와 스냅샷을 자동 연결하는 트리거
-- exam_type='weakness'인 attempt insert 시 weakness_exam_snapshots.attempt_id 갱신
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
