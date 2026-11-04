-- 출제 시점 품질 게이트 (설계: DESIGN_quality_gate.md §5)
-- Supabase SQL 에디터에서 실행하세요. 여러 번 실행해도 안전합니다.
--
-- 1) question_quality_events     — 변경 불가 로그. 자동수정 원본(before)·격리 근거·의심 기록·수동 신고
-- 2) question_quality_clearances — 사람이 "오탐"으로 해제한 (문항, 규칙, 내용 지문)
-- 3) RPC 3개 — 상태 변경과 로그 기록을 한 트랜잭션으로 묶는다 (로그 없는 수정·격리 방지)
-- 4) app_settings.quality_gate_mode — off | shadow | enforce (기본 shadow: 검사·보고만)
--
-- 테이블·함수는 service_role(서버 관리자 라우트)만 접근한다 — homework 마이그레이션과 같은 방식.

CREATE TABLE IF NOT EXISTS public.question_quality_events (
  id BIGSERIAL PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  event TEXT NOT NULL CHECK (event IN (
    'autofix', 'quarantine', 'suspect', 'report', 'clear', 'release', 'revert', 'proposal_applied'
  )),
  codes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  details JSONB NOT NULL DEFAULT '{}'::JSONB,
  fingerprint TEXT NOT NULL,
  gate_version TEXT NOT NULL,
  context TEXT NOT NULL,
  actor_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_question_quality_events_question
  ON public.question_quality_events (question_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_question_quality_events_event
  ON public.question_quality_events (event, created_at DESC);
-- 같은 내용(지문)에 대한 의심 기록은 한 번만
CREATE UNIQUE INDEX IF NOT EXISTS uq_question_quality_events_suspect
  ON public.question_quality_events (question_id, event, fingerprint)
  WHERE event = 'suspect';

CREATE TABLE IF NOT EXISTS public.question_quality_clearances (
  question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  cleared_by UUID,
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (question_id, code, fingerprint)
);

ALTER TABLE public.question_quality_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_quality_clearances ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.question_quality_events, public.question_quality_clearances FROM anon, authenticated;
GRANT ALL ON public.question_quality_events, public.question_quality_clearances TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.question_quality_events_id_seq TO service_role;

-- 의심 기록 (같은 지문이면 무시). 새로 기록했으면 TRUE.
CREATE OR REPLACE FUNCTION public.quality_gate_record_suspect(
  p_question_id TEXT,
  p_codes TEXT[],
  p_details JSONB,
  p_fingerprint TEXT,
  p_version TEXT,
  p_context TEXT,
  p_actor UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.question_quality_events (question_id, event, codes, details, fingerprint, gate_version, context, actor_id)
  VALUES (p_question_id, 'suspect', COALESCE(p_codes, ARRAY[]::TEXT[]), COALESCE(p_details, '{}'::JSONB),
          p_fingerprint, p_version, p_context, p_actor)
  ON CONFLICT (question_id, event, fingerprint) WHERE event = 'suspect' DO NOTHING;
  RETURN FOUND;
END;
$$;

-- 격리: 승인 상태인 문항만 격리하고 같은 트랜잭션에서 로그를 남긴다. 격리했으면 TRUE.
-- p_event 는 'quarantine'(게이트) 또는 'report'(수동 신고).
CREATE OR REPLACE FUNCTION public.quality_gate_quarantine(
  p_question_id TEXT,
  p_codes TEXT[],
  p_details JSONB,
  p_fingerprint TEXT,
  p_version TEXT,
  p_context TEXT,
  p_actor UUID,
  p_event TEXT DEFAULT 'quarantine'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_event NOT IN ('quarantine', 'report') THEN
    RAISE EXCEPTION 'invalid event %', p_event USING ERRCODE = '22023';
  END IF;

  UPDATE public.questions
  SET quality_status = 'quarantined',
      quality_reasons = COALESCE(p_codes, ARRAY[]::TEXT[]),
      validated_at = NOW(),
      validator_version = p_version
  WHERE id = p_question_id
    AND quality_status = 'approved';

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.question_quality_events (question_id, event, codes, details, fingerprint, gate_version, context, actor_id)
  VALUES (p_question_id, p_event, COALESCE(p_codes, ARRAY[]::TEXT[]), COALESCE(p_details, '{}'::JSONB),
          p_fingerprint, p_version, p_context, p_actor);
  RETURN TRUE;
END;
$$;

-- 안전 자동수정: updated_at 이 읽은 값과 같을 때만(CAS) 바꾸고, 바꾼 필드의 before/after 를
-- 같은 트랜잭션에서 로그에 남긴다. 성공하면 새 updated_at, 충돌·상태 변경이면 NULL.
-- p_patch 키: question | explanation | answer_text | options (있는 키만 바꾼다)
CREATE OR REPLACE FUNCTION public.quality_gate_autofix(
  p_question_id TEXT,
  p_expected_updated_at TEXT,
  p_patch JSONB,
  p_details JSONB,
  p_fingerprint TEXT,
  p_version TEXT,
  p_context TEXT,
  p_actor UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_updated TEXT;
BEGIN
  IF p_patch IS NULL OR p_patch = '{}'::JSONB THEN
    RETURN NULL;
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_object_keys(p_patch) AS k(key)
    WHERE k.key NOT IN ('question', 'explanation', 'answer_text', 'options')
  ) THEN
    RAISE EXCEPTION 'patch may only touch question, explanation, answer_text, options' USING ERRCODE = '22023';
  END IF;

  UPDATE public.questions
  SET question = CASE WHEN p_patch ? 'question' THEN p_patch->>'question' ELSE question END,
      explanation = CASE WHEN p_patch ? 'explanation' THEN p_patch->>'explanation' ELSE explanation END,
      answer_text = CASE WHEN p_patch ? 'answer_text' THEN p_patch->>'answer_text' ELSE answer_text END,
      options = CASE WHEN p_patch ? 'options' THEN p_patch->'options' ELSE options END,
      updated_at = NOW(),
      validated_at = NOW(),
      validator_version = p_version
  WHERE id = p_question_id
    AND quality_status = 'approved'
    AND updated_at::TIMESTAMPTZ IS NOT DISTINCT FROM NULLIF(p_expected_updated_at, '')::TIMESTAMPTZ
  RETURNING updated_at::TEXT INTO v_updated;

  IF v_updated IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.question_quality_events (question_id, event, codes, details, fingerprint, gate_version, context, actor_id)
  VALUES (p_question_id, 'autofix', ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_details->'codes', '[]'::JSONB))),
          COALESCE(p_details, '{}'::JSONB), p_fingerprint, p_version, p_context, p_actor);
  RETURN v_updated;
END;
$$;

REVOKE ALL ON FUNCTION public.quality_gate_record_suspect(TEXT, TEXT[], JSONB, TEXT, TEXT, TEXT, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.quality_gate_quarantine(TEXT, TEXT[], JSONB, TEXT, TEXT, TEXT, UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.quality_gate_autofix(TEXT, TEXT, JSONB, JSONB, TEXT, TEXT, TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.quality_gate_record_suspect(TEXT, TEXT[], JSONB, TEXT, TEXT, TEXT, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.quality_gate_quarantine(TEXT, TEXT[], JSONB, TEXT, TEXT, TEXT, UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.quality_gate_autofix(TEXT, TEXT, JSONB, JSONB, TEXT, TEXT, TEXT, UUID) TO service_role;

-- 게이트 모드 기본값: 검사·보고만 (enforce 로 바꾸기 전에 shadow 리포트를 확인)
INSERT INTO public.app_settings (key, value) VALUES ('quality_gate_mode', 'shadow')
  ON CONFLICT (key) DO NOTHING;
