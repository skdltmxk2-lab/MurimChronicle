-- 사용자의 마지막 활동 시각. 로그인된 사용자가 페이지에 머무르는 동안
-- 클라이언트가 주기적으로 /api/auth/heartbeat 를 호출해 갱신한다.
-- 관리자 화면에서 "현재 접속 중" 별 표시에 사용.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_last_seen_at
  ON public.profiles (last_seen_at DESC);
