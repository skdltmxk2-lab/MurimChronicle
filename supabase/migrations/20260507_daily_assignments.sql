-- 데일리 테스트: 날짜별 강제 할당 + 라운드 로빈 사용 이력
-- Supabase SQL Editor에서 한 번 실행하세요.

-- 1. 날짜별 데일리 할당 (관리자가 직접 지정한 경우)
CREATE TABLE IF NOT EXISTS daily_assignments (
  date DATE PRIMARY KEY,
  question_ids TEXT[] NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 데일리 사용 이력 (라운드 로빈: 사용 횟수 적은 문제 우선)
CREATE TABLE IF NOT EXISTS daily_usage (
  question_id TEXT PRIMARY KEY,
  last_used_date DATE NOT NULL,
  use_count INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: 모두 읽기 가능, 쓰기는 service role만 (서버 API 통해서)
ALTER TABLE daily_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone can read daily_assignments" ON daily_assignments;
CREATE POLICY "anyone can read daily_assignments"
  ON daily_assignments FOR SELECT
  USING (true);

ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone can read daily_usage" ON daily_usage;
CREATE POLICY "anyone can read daily_usage"
  ON daily_usage FOR SELECT
  USING (true);

-- 인덱스: 라운드 로빈 정렬 가속화
CREATE INDEX IF NOT EXISTS idx_daily_usage_use_count ON daily_usage (use_count, last_used_date);
