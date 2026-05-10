-- 단답형(주관식) 문제 지원
-- question_type: 'multiple_choice' (객관식) | 'subjective' (단답형)
-- answer_text: 단답형의 정답 텍스트 (LaTeX 포함). 객관식은 NULL.

ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS question_type TEXT NOT NULL DEFAULT 'multiple_choice',
  ADD COLUMN IF NOT EXISTS answer_text TEXT;

-- 기존 데이터: subjective 태그를 가진 문제는 question_type='subjective'로 전환
UPDATE public.questions
SET
  question_type = 'subjective',
  answer_text = (options -> 0 ->> 'text')
WHERE 'subjective' = ANY(tags)
  AND question_type = 'multiple_choice';

-- 제약: subjective는 answer_text 필수, multiple_choice는 NULL 허용
ALTER TABLE public.questions
  DROP CONSTRAINT IF EXISTS questions_question_type_check,
  ADD CONSTRAINT questions_question_type_check
    CHECK (question_type IN ('multiple_choice', 'subjective'));

ALTER TABLE public.questions
  DROP CONSTRAINT IF EXISTS questions_subjective_answer_required,
  ADD CONSTRAINT questions_subjective_answer_required
    CHECK (
      question_type = 'multiple_choice'
      OR (question_type = 'subjective' AND answer_text IS NOT NULL AND length(trim(answer_text)) > 0)
    );

CREATE INDEX IF NOT EXISTS questions_question_type_idx
  ON public.questions (question_type);
