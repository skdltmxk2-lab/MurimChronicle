-- 회원 등급(tier) + 관리자 권한(is_admin)을 profiles 테이블에 추가한다.
-- tier: 결제 등급. go/plus/pro/max. 가입 시 기본 'go'.
-- is_admin: routeroute 비밀번호 가드를 대체할 관리자 플래그.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'go',
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- tier 값 검증 (이미 존재하면 무시되도록 DO $$ ... $$ 블록 사용)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_tier_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_tier_check
      CHECK (tier IN ('go', 'plus', 'pro', 'max'));
  END IF;
END $$;

-- 관리자 조회용 부분 인덱스
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin
  ON public.profiles (is_admin)
  WHERE is_admin = true;

-- 첫 관리자 셋업: 본인 계정에 직접 권한 부여
-- 아래 줄의 이메일을 본인 것으로 바꾸고 한 번만 실행하세요.
-- UPDATE public.profiles SET is_admin = true
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'skdltmxk2@gmail.com');
