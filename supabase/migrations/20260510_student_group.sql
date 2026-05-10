-- 회원 분류(소속) 컬럼.
-- 'external' = 외부 (기본값)
-- 'private'  = 우리 개인과외 학생
-- 'routemath'= 루트매쓰 등록 학생
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS student_group TEXT NOT NULL DEFAULT 'external';

-- 허용값 제약. (이미 있을 수 있으므로 가드)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_student_group_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_student_group_check
      CHECK (student_group IN ('external', 'private', 'routemath'));
  END IF;
END$$;

-- 분류별 빠른 조회용 인덱스.
CREATE INDEX IF NOT EXISTS idx_profiles_student_group
  ON public.profiles (student_group);
