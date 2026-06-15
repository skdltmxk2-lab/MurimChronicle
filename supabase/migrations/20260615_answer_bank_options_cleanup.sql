-- Convert imported answer-bank rows with oversized option arrays into subjective rows.
-- These rows came from exams where several problems shared a common answer table.
-- Keeping the full answer bank on each standalone question breaks CBT/PDF rendering.

with oversized as (
  select
    q.id,
    coalesce(
      (
        select opt.value ->> 'text'
        from jsonb_array_elements(q.options) as opt(value)
        where opt.value ->> 'id' = q.correct_option_id
           or opt.value ->> 'label' = q.correct_option_id
        limit 1
      ),
      q.answer_text,
      ''
    ) as resolved_answer
  from public.questions q
  where q.question_type <> 'subjective'
    and jsonb_typeof(q.options) = 'array'
    and jsonb_array_length(q.options) > 5
)
update public.questions q
set
  question_type = 'subjective',
  options = '[]'::jsonb,
  correct_option_id = '',
  answer_text = oversized.resolved_answer,
  updated_at = now()
from oversized
where q.id = oversized.id;
