-- 회원 등급 만료일 컬럼.
-- NULL이면 영구(만료 없음). 값이 있고 now()를 지나면 애플리케이션 레이어에서
-- 자동으로 'free'로 회귀시킨다. (DB 컬럼은 그대로 둬 관리자가 이력을 볼 수 있게 함.)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tier_expires_at TIMESTAMPTZ NULL;

-- 관리자 회원관리에서 곧 만료될 회원을 빠르게 찾기 위한 부분 인덱스.
CREATE INDEX IF NOT EXISTS idx_profiles_tier_expires_at
  ON public.profiles (tier_expires_at)
  WHERE tier_expires_at IS NOT NULL;
