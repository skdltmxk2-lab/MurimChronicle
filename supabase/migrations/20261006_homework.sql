-- PDF homework: server-only tables, immutable submission attempts and atomic release.
-- Apply this file in the existing project's Supabase SQL Editor before enabling the UI.
BEGIN;

CREATE TABLE IF NOT EXISTS public.homework_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  kind text NOT NULL DEFAULT 'homework' CHECK (kind IN ('homework','daily')),
  subject text NOT NULL DEFAULT '', description text NOT NULL DEFAULT '',
  question_numbers text[] NOT NULL CHECK (cardinality(question_numbers) BETWEEN 1 AND 60),
  pdf_path text NOT NULL UNIQUE, pdf_name text NOT NULL,
  pdf_size integer NOT NULL CHECK (pdf_size BETWEEN 5 AND 15728640),
  pdf_pages integer NOT NULL CHECK (pdf_pages BETWEEN 1 AND 50),
  reference jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(reference) = 'array'),
  reference_status text NOT NULL DEFAULT 'pending' CHECK (reference_status IN ('pending','processing','draft','approved','failed')),
  reference_error text, reference_revision integer NOT NULL DEFAULT 0,
  reference_lock_token uuid, reference_started_at timestamptz, reference_approved_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.homework_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES public.homework_materials(id),
  instructions text NOT NULL DEFAULT '', due_at timestamptz,
  ai_enabled boolean NOT NULL DEFAULT true,
  release_mode text NOT NULL DEFAULT 'review' CHECK (release_mode IN ('review','auto')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.homework_recipients (
  assignment_id uuid NOT NULL REFERENCES public.homework_assignments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latest_submission_id uuid, assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (assignment_id,user_id)
);
CREATE TABLE IF NOT EXISTS public.homework_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL, user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_number integer NOT NULL CHECK (attempt_number > 0),
  pdf_path text NOT NULL UNIQUE, pdf_name text NOT NULL,
  pdf_size integer NOT NULL CHECK (pdf_size BETWEEN 5 AND 15728640),
  pdf_pages integer NOT NULL CHECK (pdf_pages BETWEEN 1 AND 50),
  ai_status text NOT NULL DEFAULT 'pending' CHECK (ai_status IN ('pending','processing','draft','failed','disabled')),
  ai_error text, ai_model text, ai_lock_token uuid, ai_started_at timestamptz,
  reference_revision integer, settings_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  draft_feedback jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(draft_feedback) = 'array'),
  published_feedback jsonb, published_at timestamptz,
  published_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  feedback_revision integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assignment_id,user_id,attempt_number),
  FOREIGN KEY (assignment_id,user_id) REFERENCES public.homework_recipients(assignment_id,user_id) ON DELETE CASCADE
);
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'homework_recipients_latest_fk') THEN
    ALTER TABLE public.homework_recipients ADD CONSTRAINT homework_recipients_latest_fk
      FOREIGN KEY (latest_submission_id) REFERENCES public.homework_submissions(id) ON DELETE SET NULL;
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS public.homework_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purpose text NOT NULL CHECK (purpose IN ('material','submission')),
  assignment_id uuid REFERENCES public.homework_assignments(id) ON DELETE CASCADE,
  pdf_path text NOT NULL UNIQUE, pdf_name text NOT NULL,
  pdf_size integer NOT NULL CHECK (pdf_size BETWEEN 5 AND 15728640),
  pdf_pages integer NOT NULL CHECK (pdf_pages BETWEEN 1 AND 50),
  consumed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((purpose = 'material' AND assignment_id IS NULL) OR (purpose = 'submission' AND assignment_id IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS homework_recipients_user_idx ON public.homework_recipients(user_id,assigned_at DESC);
CREATE INDEX IF NOT EXISTS homework_submissions_assignment_idx ON public.homework_submissions(assignment_id,created_at DESC);
CREATE INDEX IF NOT EXISTS homework_submissions_pending_idx ON public.homework_submissions(ai_status,created_at);
CREATE INDEX IF NOT EXISTS homework_uploads_owner_idx ON public.homework_uploads(owner_id,created_at);
INSERT INTO public.app_settings(key,value)
VALUES ('homework_ai_settings','{"aiEnabled":true,"tone":"polite","depth":"hint","styleGuide":"구체적으로 잘한 점을 짚고, 처음 틀린 단계와 다음에 확인할 것을 차분히 알려주세요. 학생을 비난하거나 실력을 단정하지 마세요.","examples":""}')
ON CONFLICT (key) DO NOTHING;

-- No browser policies or grants: auth is checked in the APIs, which return explicit projections.
ALTER TABLE public.homework_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_uploads ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.homework_materials,public.homework_assignments,public.homework_recipients,public.homework_submissions,public.homework_uploads FROM anon,authenticated;
GRANT ALL ON public.homework_materials,public.homework_assignments,public.homework_recipients,public.homework_submissions,public.homework_uploads TO service_role;

INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES ('homework-pdfs','homework-pdfs',false,15728640,ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET public = false,file_size_limit = EXCLUDED.file_size_limit,allowed_mime_types = EXCLUDED.allowed_mime_types;
-- Restrictive policy protects this bucket even if older permissive policies allow all objects.
-- Storage's signed upload endpoint validates its token and then writes asSuperUser.
-- Existing policies still determine access to other buckets.
DROP POLICY IF EXISTS homework_pdfs_server_only ON storage.objects;
CREATE POLICY homework_pdfs_server_only ON storage.objects AS RESTRICTIVE FOR ALL TO anon,authenticated
  USING (bucket_id <> 'homework-pdfs') WITH CHECK (bucket_id <> 'homework-pdfs');

CREATE OR REPLACE FUNCTION public.homework_issue_upload(
  p_upload_id uuid,p_actor_id uuid,p_purpose text,p_assignment_id uuid,p_pdf_path text,p_pdf_name text,p_pdf_size integer,p_pdf_pages integer
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,pg_temp AS $$
DECLARE admin_user boolean;
BEGIN
  SELECT coalesce(is_admin,false) INTO admin_user FROM public.profiles WHERE id = p_actor_id;
  admin_user := coalesce(admin_user,false);
  IF p_purpose = 'material' THEN
    IF NOT admin_user THEN RAISE EXCEPTION 'HOMEWORK_FORBIDDEN' USING ERRCODE = '42501'; END IF;
  ELSIF p_purpose = 'submission' THEN
    IF NOT EXISTS (SELECT 1 FROM public.homework_recipients WHERE assignment_id = p_assignment_id AND user_id = p_actor_id) THEN RAISE EXCEPTION 'HOMEWORK_FORBIDDEN' USING ERRCODE = '42501'; END IF;
  ELSE RAISE EXCEPTION 'HOMEWORK_UPLOAD_INVALID'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('homework-upload:' || p_actor_id::text,0));
  IF (SELECT count(*) FROM public.homework_uploads WHERE owner_id = p_actor_id AND created_at >= ((now() AT TIME ZONE 'Asia/Seoul')::date::timestamp AT TIME ZONE 'Asia/Seoul')) >= (CASE WHEN admin_user THEN 500 ELSE 30 END)
    OR (NOT admin_user AND (SELECT count(*) FROM public.homework_uploads WHERE owner_id = p_actor_id AND created_at > now() - interval '1 hour') >= 10)
  THEN RAISE EXCEPTION 'HOMEWORK_UPLOAD_RATE'; END IF;
  INSERT INTO public.homework_uploads(id,owner_id,purpose,assignment_id,pdf_path,pdf_name,pdf_size,pdf_pages)
  VALUES (p_upload_id,p_actor_id,p_purpose,p_assignment_id,p_pdf_path,p_pdf_name,p_pdf_size,p_pdf_pages);
  RETURN p_upload_id;
END $$;

CREATE OR REPLACE FUNCTION public.homework_create_material(
  p_upload_id uuid,p_actor_id uuid,p_title text,p_kind text,p_subject text,p_description text,p_question_numbers text[]
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,pg_temp AS $$
DECLARE ticket public.homework_uploads%ROWTYPE; result_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_actor_id AND is_admin = true) THEN RAISE EXCEPTION 'HOMEWORK_FORBIDDEN' USING ERRCODE = '42501'; END IF;
  SELECT * INTO ticket FROM public.homework_uploads WHERE id = p_upload_id FOR UPDATE;
  IF NOT FOUND OR ticket.owner_id <> p_actor_id OR ticket.purpose <> 'material' OR ticket.consumed_at IS NOT NULL OR ticket.created_at < now() - interval '2 hours' THEN RAISE EXCEPTION 'HOMEWORK_UPLOAD_INVALID'; END IF;
  INSERT INTO public.homework_materials(title,kind,subject,description,question_numbers,pdf_path,pdf_name,pdf_size,pdf_pages,created_by)
  VALUES (p_title,p_kind,p_subject,p_description,p_question_numbers,ticket.pdf_path,ticket.pdf_name,ticket.pdf_size,ticket.pdf_pages,p_actor_id) RETURNING id INTO result_id;
  UPDATE public.homework_uploads SET consumed_at = now() WHERE id = ticket.id;
  RETURN result_id;
END $$;

CREATE OR REPLACE FUNCTION public.homework_create_assignment(
  p_actor_id uuid,p_material_id uuid,p_student_ids uuid[],p_instructions text,p_due_at timestamptz,p_ai_enabled boolean,p_release_mode text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,pg_temp AS $$
DECLARE result_id uuid; unique_ids uuid[];
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_actor_id AND is_admin = true) THEN RAISE EXCEPTION 'HOMEWORK_FORBIDDEN' USING ERRCODE = '42501'; END IF;
  SELECT array_agg(DISTINCT x) INTO unique_ids FROM unnest(p_student_ids) AS t(x) WHERE x IS NOT NULL;
  IF coalesce(cardinality(unique_ids),0) NOT BETWEEN 1 AND 1000 OR EXISTS (
    SELECT 1 FROM unnest(unique_ids) AS t(x) LEFT JOIN auth.users u ON u.id = x LEFT JOIN public.profiles p ON p.id = x
    WHERE u.id IS NULL OR coalesce(p.is_admin,false)
  ) THEN RAISE EXCEPTION 'HOMEWORK_STUDENTS_INVALID'; END IF;
  INSERT INTO public.homework_assignments(material_id,instructions,due_at,ai_enabled,release_mode,created_by)
  VALUES (p_material_id,p_instructions,p_due_at,p_ai_enabled,p_release_mode,p_actor_id) RETURNING id INTO result_id;
  INSERT INTO public.homework_recipients(assignment_id,user_id) SELECT result_id,x FROM unnest(unique_ids) AS t(x);
  RETURN result_id;
END $$;

CREATE OR REPLACE FUNCTION public.homework_finalize_submission(p_upload_id uuid,p_actor_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,pg_temp AS $$
DECLARE ticket public.homework_uploads%ROWTYPE; recipient public.homework_recipients%ROWTYPE; next_attempt integer; result_id uuid;
BEGIN
  SELECT * INTO ticket FROM public.homework_uploads WHERE id = p_upload_id FOR UPDATE;
  IF NOT FOUND OR ticket.owner_id <> p_actor_id OR ticket.purpose <> 'submission' OR ticket.consumed_at IS NOT NULL OR ticket.created_at < now() - interval '2 hours' THEN RAISE EXCEPTION 'HOMEWORK_UPLOAD_INVALID'; END IF;
  -- Serialize a student's submissions across different assignments for the daily limit.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_actor_id::text,0));
  SELECT * INTO recipient FROM public.homework_recipients WHERE assignment_id = ticket.assignment_id AND user_id = p_actor_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'HOMEWORK_FORBIDDEN' USING ERRCODE = '42501'; END IF;
  IF EXISTS (SELECT 1 FROM public.homework_submissions WHERE assignment_id = ticket.assignment_id AND user_id = p_actor_id AND created_at > now() - interval '60 seconds')
    OR (SELECT count(*) FROM public.homework_submissions WHERE user_id = p_actor_id AND created_at >= ((now() AT TIME ZONE 'Asia/Seoul')::date::timestamp AT TIME ZONE 'Asia/Seoul')) >= 20
  THEN RAISE EXCEPTION 'HOMEWORK_SUBMISSION_RATE'; END IF;
  SELECT coalesce(max(attempt_number),0) + 1 INTO next_attempt FROM public.homework_submissions WHERE assignment_id = ticket.assignment_id AND user_id = p_actor_id;
  INSERT INTO public.homework_submissions(assignment_id,user_id,attempt_number,pdf_path,pdf_name,pdf_size,pdf_pages)
  VALUES (ticket.assignment_id,p_actor_id,next_attempt,ticket.pdf_path,ticket.pdf_name,ticket.pdf_size,ticket.pdf_pages) RETURNING id INTO result_id;
  UPDATE public.homework_recipients SET latest_submission_id = result_id WHERE assignment_id = ticket.assignment_id AND user_id = p_actor_id;
  UPDATE public.homework_uploads SET consumed_at = now() WHERE id = ticket.id;
  RETURN result_id;
END $$;

CREATE OR REPLACE FUNCTION public.homework_claim_reference(p_material_id uuid,p_lock_token uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,pg_temp AS $$
BEGIN
  IF p_lock_token IS NULL THEN RETURN false; END IF;
  UPDATE public.homework_materials SET reference_status = 'processing',reference_lock_token = p_lock_token,reference_started_at = now(),reference_error = NULL,updated_at = now()
  WHERE id = p_material_id AND (reference_status IN ('pending','failed') OR (reference_status = 'processing' AND reference_started_at < now() - interval '15 minutes'));
  RETURN FOUND;
END $$;
CREATE OR REPLACE FUNCTION public.homework_claim_submission(p_submission_id uuid,p_lock_token uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,pg_temp AS $$
BEGIN
  IF p_lock_token IS NULL THEN RETURN false; END IF;
  UPDATE public.homework_submissions s SET ai_status = 'processing',ai_lock_token = p_lock_token,ai_started_at = now(),ai_error = NULL
  WHERE s.id = p_submission_id AND s.published_at IS NULL
    AND (s.ai_status IN ('pending','failed','disabled') OR (s.ai_status = 'processing' AND s.ai_started_at < now() - interval '15 minutes'))
    AND EXISTS (SELECT 1 FROM public.homework_recipients r WHERE r.assignment_id = s.assignment_id AND r.user_id = s.user_id AND r.latest_submission_id = s.id);
  RETURN FOUND;
END $$;

CREATE OR REPLACE FUNCTION public.homework_feedback_ready(p_feedback jsonb,p_numbers text[])
RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path = public,pg_temp AS $$
BEGIN
  IF p_feedback IS NULL OR jsonb_typeof(p_feedback) <> 'array' OR jsonb_array_length(p_feedback) <> cardinality(p_numbers) THEN RETURN false; END IF;
  RETURN NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_feedback) f
    WHERE coalesce(btrim(f->>'comment'),'') = '' OR coalesce(f->>'needsReview','true') <> 'false' OR coalesce(f->>'verified','false') <> 'true'
      OR NOT (f->>'questionNumber' = ANY(p_numbers))
  ) AND (SELECT count(DISTINCT f->>'questionNumber') FROM jsonb_array_elements(p_feedback) f) = cardinality(p_numbers);
END $$;

CREATE OR REPLACE FUNCTION public.homework_save_feedback(
  p_submission_id uuid,p_actor_id uuid,p_feedback jsonb,p_expected_revision integer,p_publish boolean
) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,pg_temp AS $$
DECLARE item public.homework_submissions%ROWTYPE; latest_id uuid; numbers text[];
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_actor_id AND is_admin = true) THEN RAISE EXCEPTION 'HOMEWORK_FORBIDDEN' USING ERRCODE = '42501'; END IF;
  -- Always lock recipient before submission, matching finalize and automatic publish.
  SELECT r.latest_submission_id INTO latest_id FROM public.homework_recipients r JOIN public.homework_submissions s ON s.assignment_id = r.assignment_id AND s.user_id = r.user_id WHERE s.id = p_submission_id FOR UPDATE OF r;
  SELECT * INTO item FROM public.homework_submissions WHERE id = p_submission_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'HOMEWORK_NOT_FOUND'; END IF;
  IF item.feedback_revision <> p_expected_revision THEN RAISE EXCEPTION 'HOMEWORK_REVISION_CONFLICT' USING ERRCODE = '40001'; END IF;
  IF jsonb_typeof(p_feedback) <> 'array' THEN RAISE EXCEPTION 'HOMEWORK_FEEDBACK_INVALID'; END IF;
  IF p_publish THEN
    SELECT m.question_numbers INTO numbers FROM public.homework_assignments a JOIN public.homework_materials m ON m.id = a.material_id WHERE a.id = item.assignment_id;
    IF latest_id IS DISTINCT FROM item.id THEN RAISE EXCEPTION 'HOMEWORK_STALE_SUBMISSION' USING ERRCODE = '40001'; END IF;
    IF NOT public.homework_feedback_ready(p_feedback,numbers) THEN RAISE EXCEPTION 'HOMEWORK_FEEDBACK_NOT_READY'; END IF;
  END IF;
  UPDATE public.homework_submissions SET draft_feedback = p_feedback,feedback_revision = feedback_revision + 1,ai_status = 'draft',ai_lock_token = NULL,ai_error = NULL,
    published_feedback = CASE WHEN p_publish THEN p_feedback ELSE published_feedback END,
    published_at = CASE WHEN p_publish THEN now() ELSE published_at END,
    published_by = CASE WHEN p_publish THEN p_actor_id ELSE published_by END
  WHERE id = item.id;
  RETURN item.feedback_revision + 1;
END $$;

CREATE OR REPLACE FUNCTION public.homework_publish_feedback(
  p_submission_id uuid,p_expected_revision integer,p_lock_token uuid,p_reference_revision integer
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,pg_temp AS $$
DECLARE item public.homework_submissions%ROWTYPE; assignment public.homework_assignments%ROWTYPE; material public.homework_materials%ROWTYPE; latest_id uuid; global_enabled boolean; current_settings jsonb;
BEGIN
  IF p_lock_token IS NULL OR p_expected_revision IS NULL OR p_reference_revision IS NULL THEN RETURN false; END IF;
  SELECT r.latest_submission_id INTO latest_id FROM public.homework_recipients r JOIN public.homework_submissions s ON s.assignment_id = r.assignment_id AND s.user_id = r.user_id WHERE s.id = p_submission_id FOR UPDATE OF r;
  SELECT * INTO item FROM public.homework_submissions WHERE id = p_submission_id FOR UPDATE;
  IF NOT FOUND OR latest_id IS DISTINCT FROM item.id OR item.feedback_revision <> p_expected_revision OR item.ai_lock_token IS DISTINCT FROM p_lock_token OR item.ai_status <> 'draft' OR item.published_at IS NOT NULL THEN RETURN false; END IF;
  SELECT * INTO assignment FROM public.homework_assignments WHERE id = item.assignment_id FOR SHARE;
  SELECT * INTO material FROM public.homework_materials WHERE id = assignment.material_id FOR SHARE;
  SELECT value::jsonb INTO current_settings FROM public.app_settings WHERE key = 'homework_ai_settings' FOR SHARE;
  global_enabled := coalesce((current_settings->>'aiEnabled')::boolean,false);
  -- Missing/malformed settings fail closed; the migration inserts the initial settings row.
  IF NOT global_enabled OR NOT assignment.ai_enabled OR assignment.release_mode <> 'auto' OR material.reference_status <> 'approved'
    OR item.settings_snapshot IS DISTINCT FROM current_settings
    OR material.reference_revision <> p_reference_revision OR item.reference_revision IS DISTINCT FROM p_reference_revision
    OR NOT public.homework_feedback_ready(item.draft_feedback,material.question_numbers) THEN RETURN false; END IF;
  -- Automatic release is stricter than a teacher's manual review of missing/unreadable work.
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(item.draft_feedback) WITH ORDINALITY AS feedback(f,position)
    WHERE coalesce(f->>'verdict','') NOT IN ('correct','partial','incorrect') OR coalesce(btrim(f->>'studentWork'),'') = ''
      OR f->>'questionNumber' IS DISTINCT FROM material.question_numbers[position::integer]
      OR CASE WHEN jsonb_typeof(f->'sourcePages') = 'array' THEN jsonb_array_length(f->'sourcePages') ELSE 0 END = 0
  ) THEN RETURN false; END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(item.draft_feedback) AS feedback(f),jsonb_array_elements(f->'sourcePages') AS pages(p)
    WHERE jsonb_typeof(p) <> 'number' OR (p #>> '{}')::integer NOT BETWEEN 1 AND item.pdf_pages
  ) THEN RETURN false; END IF;
  UPDATE public.homework_submissions SET published_feedback = draft_feedback,published_at = now(),published_by = NULL,ai_lock_token = NULL WHERE id = item.id;
  RETURN true;
EXCEPTION WHEN invalid_text_representation THEN RETURN false;
END $$;

REVOKE ALL ON FUNCTION public.homework_issue_upload(uuid,uuid,text,uuid,text,text,integer,integer),public.homework_create_material(uuid,uuid,text,text,text,text,text[]),public.homework_create_assignment(uuid,uuid,uuid[],text,timestamptz,boolean,text),public.homework_finalize_submission(uuid,uuid),public.homework_claim_reference(uuid,uuid),public.homework_claim_submission(uuid,uuid),public.homework_feedback_ready(jsonb,text[]),public.homework_save_feedback(uuid,uuid,jsonb,integer,boolean),public.homework_publish_feedback(uuid,integer,uuid,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.homework_issue_upload(uuid,uuid,text,uuid,text,text,integer,integer),public.homework_create_material(uuid,uuid,text,text,text,text,text[]),public.homework_create_assignment(uuid,uuid,uuid[],text,timestamptz,boolean,text),public.homework_finalize_submission(uuid,uuid),public.homework_claim_reference(uuid,uuid),public.homework_claim_submission(uuid,uuid),public.homework_feedback_ready(jsonb,text[]),public.homework_save_feedback(uuid,uuid,jsonb,integer,boolean),public.homework_publish_feedback(uuid,integer,uuid,integer) TO service_role;

COMMIT;
