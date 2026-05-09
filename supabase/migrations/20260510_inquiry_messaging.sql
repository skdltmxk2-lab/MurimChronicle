-- 문의하기 + 전체공지 + 1대1 메시지 기능.
-- 1. inquiries           — 회원 → 관리자 문의 (사진 선택)
-- 2. announcements       — 관리자가 띄우는 전체공지
-- 3. announcement_reads  — 회원이 공지를 닫았는지 추적
-- 4. direct_messages     — 관리자 → 특정 회원 1대1 메시지

-- ============ 1. inquiries ============
CREATE TABLE IF NOT EXISTS public.inquiries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category      TEXT NOT NULL CHECK (category IN ('complaint','suggestion','bug','other')),
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  image_url     TEXT,
  status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  admin_reply   TEXT,
  admin_reply_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_inquiries_user ON public.inquiries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status, created_at DESC);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inquiries_self_select ON public.inquiries;
CREATE POLICY inquiries_self_select ON public.inquiries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS inquiries_self_insert ON public.inquiries;
CREATE POLICY inquiries_self_insert ON public.inquiries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 관리자/admin 전체 접근은 service_role 통한 API에서 처리하므로 별도 정책 없음.

-- ============ 2. announcements ============
CREATE TABLE IF NOT EXISTS public.announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.announcements(created_at DESC);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 모든 인증 사용자가 만료되지 않은 공지를 읽을 수 있음
DROP POLICY IF EXISTS announcements_authenticated_read ON public.announcements;
CREATE POLICY announcements_authenticated_read ON public.announcements FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============ 3. announcement_reads ============
CREATE TABLE IF NOT EXISTS public.announcement_reads (
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  announcement_id  UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  dismissed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, announcement_id)
);

ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS announcement_reads_self_all ON public.announcement_reads;
CREATE POLICY announcement_reads_self_all ON public.announcement_reads FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ 4. direct_messages ============
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  -- 수신자
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,           -- 발신 admin
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dm_user ON public.direct_messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_unread ON public.direct_messages(user_id, read_at) WHERE read_at IS NULL;

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS direct_messages_self_select ON public.direct_messages;
CREATE POLICY direct_messages_self_select ON public.direct_messages FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS direct_messages_self_update_read ON public.direct_messages;
CREATE POLICY direct_messages_self_update_read ON public.direct_messages FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
