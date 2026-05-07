-- tier에 'free'를 추가해 5등급(free/go/plus/pro/max) 체계로 확장.
-- 기본 등급도 'free'로 변경(기존 사용자는 그대로 유지).

-- 1) 새 가입자의 기본 tier를 'free'로
ALTER TABLE public.profiles
  ALTER COLUMN tier SET DEFAULT 'free';

-- 2) CHECK 제약 갱신: free 추가
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_tier_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_tier_check
  CHECK (tier IN ('free', 'go', 'plus', 'pro', 'max'));
