-- ───────────────────────────────────────────────────────────────
-- 출시 대비 성능 인덱스 (questions 핫패스)
-- Supabase SQL 에디터에서 실행하세요.
--
-- 배경: 학생이 시험을 시작할 때 타는 쿼리들이 인덱스 없이 풀스캔(seq scan)으로
--       동작 중. 현재 4,800여 행에선 빠르지만, 문항·동시접속이 늘면 느려진다.
--       아래 인덱스로 핫패스를 인덱스 스캔으로 전환한다.
--
-- 행 수가 적어(<수만) 잠금 시간이 밀리초 수준이라 일반 CREATE INDEX로 충분.
-- (수십만 행 이상에서 무중단이 필요하면 CONCURRENTLY 사용)
-- ───────────────────────────────────────────────────────────────

-- 1) 태그 배열 컨테인먼트(@>) — countByTag('daily'), listByTag(tag)
--    PostgREST 의 .contains("tags",[tag]) → SQL: tags @> ARRAY['tag']
CREATE INDEX IF NOT EXISTS idx_questions_tags_gin
  ON public.questions USING gin (tags);

-- 2) 과목 + 최신순 — listBySubject(subject): eq(subject) + order(created_at desc)
CREATE INDEX IF NOT EXISTS idx_questions_subject_created
  ON public.questions (subject, created_at DESC);

-- 3) 과목 + 단원 + 최신순 — listByUnits(subject, units): eq(subject) + in(unit) + order
CREATE INDEX IF NOT EXISTS idx_questions_subject_unit_created
  ON public.questions (subject, unit, created_at DESC);

-- 4) 전체 최신순 — 관리자 list() / 일반 정렬
CREATE INDEX IF NOT EXISTS idx_questions_created
  ON public.questions (created_at DESC);

-- 5) 사용자별 시험기록 — exam_attempts.eq("user_id") (결과 페이지·취약 리포트).
--    시험 응시마다 행이 쌓이므로 user_id 인덱스 필수. (이미 있으면 IF NOT EXISTS로 무시)
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user
  ON public.exam_attempts (user_id);

-- 6) (선택) 임베딩 검색을 실제로 쓸 때만 — 백필 완료 후 실행.
--    추천 엔진을 'embedding' 으로 바꾸면 match_questions() 가 정렬 스캔하므로 ANN 인덱스 권장.
-- CREATE INDEX IF NOT EXISTS idx_questions_embedding_hnsw
--   ON public.questions USING hnsw (embedding vector_cosine_ops);

-- 통계 갱신(선택) — 인덱스 생성 직후 플래너가 바로 활용하도록.
ANALYZE public.questions;
