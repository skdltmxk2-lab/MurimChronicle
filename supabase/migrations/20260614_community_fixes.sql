-- 커뮤니티 보안/무결성 보완
-- Supabase SQL 에디터에서 실행하세요. (community.sql 적용 이후 누적 마이그레이션)
--
-- 1) category CHECK 에 'free'(자유게시판) 추가 — UI/서버는 이미 'free'를 허용하는데
--    기존 CHECK 는 ('question','info')만 허용해 자유게시판 글 작성이 실패하던 문제 수정.
-- 2) posts_update_own 정책의 'OR true' 제거 — 누구나 남의 글을 UPDATE 할 수 있던 구멍.
--    좋아요/댓글 카운터 갱신은 아래 RPC/트리거(SECURITY DEFINER)로 옮겨 더 이상 클라이언트
--    UPDATE 가 필요 없으므로 작성자 본인만 UPDATE 하도록 잠근다.
-- 3) 좋아요 토글을 단일 RPC 로 원자화 — 'count 읽고 +1 UPDATE' 동시성 유실 방지.
-- 4) 댓글 수를 트리거로 원자화 — INSERT/DELETE 시 자동 증감, API 의 수동 갱신 제거.

-- 1) 카테고리 CHECK 갱신 ---------------------------------------------------------
ALTER TABLE community_posts DROP CONSTRAINT IF EXISTS community_posts_category_check;
ALTER TABLE community_posts
  ADD CONSTRAINT community_posts_category_check
  CHECK (category IN ('question', 'info', 'free'));

-- 2) UPDATE 정책에서 OR true 제거(작성자 본인만) -------------------------------
DROP POLICY IF EXISTS "posts_update_own" ON community_posts;
CREATE POLICY "posts_update_own" ON community_posts
  FOR UPDATE USING (auth.uid() = user_id);

-- 3) 좋아요 토글 RPC(원자적) ----------------------------------------------------
-- 반환: { liked: boolean, like_count: integer }
CREATE OR REPLACE FUNCTION toggle_post_like(p_post_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  now_liked boolean;
  did_change boolean;
  cnt integer;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'auth required';
  END IF;

  -- 이미 좋아요한 상태면 DELETE 가 성공(FOUND=true) → 좋아요 취소
  DELETE FROM community_post_likes WHERE user_id = uid AND post_id = p_post_id;
  IF FOUND THEN
    now_liked := false;
    did_change := true;
  ELSE
    INSERT INTO community_post_likes (user_id, post_id)
    VALUES (uid, p_post_id)
    ON CONFLICT DO NOTHING;
    now_liked := true;
    did_change := FOUND; -- 동시 중복 INSERT(이중 클릭) 시 FALSE → 카운터 중복 증가 방지
  END IF;

  IF did_change AND now_liked THEN
    UPDATE community_posts SET like_count = like_count + 1
      WHERE id = p_post_id RETURNING like_count INTO cnt;
  ELSIF did_change THEN
    UPDATE community_posts SET like_count = GREATEST(0, like_count - 1)
      WHERE id = p_post_id RETURNING like_count INTO cnt;
  ELSE
    SELECT like_count INTO cnt FROM community_posts WHERE id = p_post_id;
  END IF;

  RETURN json_build_object('liked', now_liked, 'like_count', COALESCE(cnt, 0));
END;
$$;

-- 4) 댓글 수 동기화 트리거(원자적) ---------------------------------------------
CREATE OR REPLACE FUNCTION sync_post_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_comment_count ON community_comments;
CREATE TRIGGER trg_comment_count
AFTER INSERT OR DELETE ON community_comments
FOR EACH ROW EXECUTE FUNCTION sync_post_comment_count();

-- 기존 데이터의 comment_count 를 실제 댓글 수로 1회 보정(권장) -------------------
UPDATE community_posts p
SET comment_count = COALESCE(c.cnt, 0)
FROM (
  SELECT post_id, COUNT(*) AS cnt FROM community_comments GROUP BY post_id
) c
WHERE p.id = c.post_id;
UPDATE community_posts p
SET comment_count = 0
WHERE NOT EXISTS (SELECT 1 FROM community_comments c WHERE c.post_id = p.id);
