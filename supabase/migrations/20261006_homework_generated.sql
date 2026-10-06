-- Unit mock PDF materials and reversible library deletion.
-- Existing assignments/submissions continue to reference archived materials and their PDF snapshots.
BEGIN;
ALTER TABLE public.homework_materials ADD COLUMN IF NOT EXISTS archived_at timestamptz;
ALTER TABLE public.homework_materials ADD COLUMN IF NOT EXISTS source_kind text NOT NULL DEFAULT 'pdf';
ALTER TABLE public.homework_materials ADD COLUMN IF NOT EXISTS source_question_ids text[] NOT NULL DEFAULT ARRAY[]::text[];
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'homework_materials_source_kind_check') THEN
    ALTER TABLE public.homework_materials ADD CONSTRAINT homework_materials_source_kind_check CHECK (source_kind IN ('pdf','unit_mock'));
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS homework_materials_active_idx ON public.homework_materials(created_at DESC) WHERE archived_at IS NULL;

CREATE OR REPLACE FUNCTION public.homework_create_generated_material(
  p_upload_id uuid,p_actor_id uuid,p_title text,p_kind text,p_subject text,p_description text,
  p_question_ids text[],p_question_updated_ats text[],p_reference jsonb
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,pg_temp AS $$
DECLARE ticket public.homework_uploads%ROWTYPE; result_id uuid; numbers text[]; reference_snapshot jsonb;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_actor_id AND is_admin = true) THEN RAISE EXCEPTION 'HOMEWORK_FORBIDDEN' USING ERRCODE = '42501'; END IF;
  IF coalesce(cardinality(p_question_ids),0) NOT BETWEEN 1 AND 60
    OR cardinality(p_question_updated_ats) IS DISTINCT FROM cardinality(p_question_ids)
    OR (SELECT count(DISTINCT x) FROM unnest(p_question_ids) AS t(x)) <> cardinality(p_question_ids)
    OR EXISTS (SELECT 1 FROM unnest(p_question_ids) AS t(x) WHERE x IS NULL OR btrim(x) = '')
    OR p_reference IS NULL OR jsonb_typeof(p_reference) <> 'array'
  THEN RAISE EXCEPTION 'HOMEWORK_QUESTIONS_CHANGED'; END IF;
  IF jsonb_array_length(p_reference) <> cardinality(p_question_ids) THEN RAISE EXCEPTION 'HOMEWORK_QUESTIONS_CHANGED'; END IF;
  SELECT * INTO ticket FROM public.homework_uploads WHERE id = p_upload_id FOR UPDATE;
  IF NOT FOUND OR ticket.owner_id <> p_actor_id OR ticket.purpose <> 'material' OR ticket.consumed_at IS NOT NULL OR ticket.created_at < now() - interval '2 hours' THEN RAISE EXCEPTION 'HOMEWORK_UPLOAD_INVALID'; END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_reference) AS reference_rows(f)
    WHERE jsonb_typeof(f) <> 'object' OR CASE WHEN jsonb_typeof(f->'sourcePages') = 'array' THEN jsonb_array_length(f->'sourcePages') ELSE 0 END = 0
  ) THEN RAISE EXCEPTION 'HOMEWORK_QUESTIONS_CHANGED'; END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_reference) AS reference_rows(f),jsonb_array_elements(f->'sourcePages') AS page_rows(p)
    WHERE jsonb_typeof(p) <> 'number' OR (p #>> '{}')::integer NOT BETWEEN 1 AND ticket.pdf_pages
  ) THEN RAISE EXCEPTION 'HOMEWORK_QUESTIONS_CHANGED'; END IF;

  -- Lock the source rows in a stable order and recheck versions inside the ticket-consumption transaction.
  -- A question edit after PDF rendering cannot silently attach a different answer snapshot.
  PERFORM id FROM public.questions WHERE id = ANY(p_question_ids) ORDER BY id FOR SHARE;
  IF (SELECT count(*) FROM public.questions WHERE id = ANY(p_question_ids)) <> cardinality(p_question_ids)
    OR EXISTS (
      SELECT 1 FROM unnest(p_question_ids) WITH ORDINALITY AS chosen(id,position)
      JOIN public.questions q ON q.id = chosen.id
      WHERE coalesce(q.quality_status,'') <> 'approved'
        OR q.updated_at::timestamptz IS DISTINCT FROM nullif(p_question_updated_ats[position::integer],'')::timestamptz
    ) THEN RAISE EXCEPTION 'HOMEWORK_QUESTIONS_CHANGED'; END IF;
  SELECT array_agg(position::text ORDER BY position) INTO numbers FROM unnest(p_question_ids) WITH ORDINALITY AS chosen(id,position);
  SELECT jsonb_agg(f || jsonb_build_object('questionNumber',position::text,'needsReview',true) ORDER BY position)
    INTO reference_snapshot FROM jsonb_array_elements(p_reference) WITH ORDINALITY AS reference_rows(f,position);
  INSERT INTO public.homework_materials(title,kind,subject,description,question_numbers,pdf_path,pdf_name,pdf_size,pdf_pages,created_by,reference,reference_status,reference_revision,source_kind,source_question_ids)
  VALUES (p_title,p_kind,p_subject,p_description,numbers,ticket.pdf_path,ticket.pdf_name,ticket.pdf_size,ticket.pdf_pages,p_actor_id,reference_snapshot,'draft',1,'unit_mock',p_question_ids)
  RETURNING id INTO result_id;
  UPDATE public.homework_uploads SET consumed_at = now() WHERE id = ticket.id;
  RETURN result_id;
EXCEPTION WHEN invalid_text_representation OR invalid_datetime_format OR datetime_field_overflow THEN RAISE EXCEPTION 'HOMEWORK_QUESTIONS_CHANGED';
END $$;

CREATE OR REPLACE FUNCTION public.homework_archive_material(p_material_id uuid,p_actor_id uuid,p_restore boolean)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,pg_temp AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_actor_id AND is_admin = true) THEN RAISE EXCEPTION 'HOMEWORK_FORBIDDEN' USING ERRCODE = '42501'; END IF;
  UPDATE public.homework_materials SET archived_at = CASE WHEN p_restore THEN NULL ELSE coalesce(archived_at,now()) END,updated_at = now() WHERE id = p_material_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'HOMEWORK_NOT_FOUND'; END IF;
  RETURN p_material_id;
END $$;

-- Creating an assignment holds a shared material lock, serialized with archive/restore updates.
CREATE OR REPLACE FUNCTION public.homework_create_assignment(
  p_actor_id uuid,p_material_id uuid,p_student_ids uuid[],p_instructions text,p_due_at timestamptz,p_ai_enabled boolean,p_release_mode text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public,pg_temp AS $$
DECLARE result_id uuid; unique_ids uuid[]; archive_time timestamptz;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_actor_id AND is_admin = true) THEN RAISE EXCEPTION 'HOMEWORK_FORBIDDEN' USING ERRCODE = '42501'; END IF;
  SELECT archived_at INTO archive_time FROM public.homework_materials WHERE id = p_material_id FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'HOMEWORK_NOT_FOUND'; END IF;
  IF archive_time IS NOT NULL THEN RAISE EXCEPTION 'HOMEWORK_MATERIAL_ARCHIVED'; END IF;
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
REVOKE ALL ON FUNCTION public.homework_create_generated_material(uuid,uuid,text,text,text,text,text[],text[],jsonb),public.homework_archive_material(uuid,uuid,boolean),public.homework_create_assignment(uuid,uuid,uuid[],text,timestamptz,boolean,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.homework_create_generated_material(uuid,uuid,text,text,text,text,text[],text[],jsonb),public.homework_archive_material(uuid,uuid,boolean),public.homework_create_assignment(uuid,uuid,uuid[],text,timestamptz,boolean,text) TO service_role;
COMMIT;
