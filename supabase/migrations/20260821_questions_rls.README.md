# 20260821_questions_rls.sql 적용 런북

> ## 🛑 아직 적용하지 말 것
>
> `scripts/` 아래 **140개 스크립트가 anon 키로 `questions`에 직접 쓴다**
> (service_role 폴백 없음). 일회성 `_` 접두사 13개를 빼도 **127개**가
> 상시 사용되는 콘텐츠 투입·정비 도구다 — `upload_general_*.mjs`(기출 업로드),
> `upload_daily_tests_*.mjs`, `dedupe_questions.mjs`, `reclassify_questions.mjs` 등.
>
> 이 SQL을 실행하면 그 스크립트들이 전부 쓰기에 실패한다. 그리고 UPDATE/DELETE는
> **에러 없이 0행 처리**되므로 스크립트는 성공한 것처럼 끝난다.
>
> 추가로 CSV 일괄 등록(`AdminImportsClient`)도 아직 서버 API로 못 옮겼다 —
> 이미지를 base64로 담기 때문에 Vercel 요청 본문 4.5MB 제한에 걸린다.
> Supabase Storage 경유로 바꾸는 선행 작업이 필요하다.
>
> **선행 작업 목록은 `20260821_questions_rls.sql` 헤더의 "적용 차단 사유" 참고.**

무엇을 하는가: `public.questions`에 RLS를 켜고 **공개 SELECT 정책 1개만** 만든다.
INSERT/UPDATE/DELETE 정책은 만들지 않으므로 anon 키의 쓰기는 전부 거부되고,
service_role 키(=`/api/admin/*` 라우트)만 쓰기가 가능해진다.

---

## (a) 적용 전 — 현재 RLS 상태 확인

Supabase 대시보드:

1. **Database → Tables → `questions`** — 목록의 `RLS` 배지가 *Disabled*(또는 "Unrestricted")인지 확인.
   지금 상태라면 Disabled가 정상이다.
2. **Authentication → Policies → `questions`** — 정책이 0개인지 확인.

또는 **SQL Editor**에서:

```sql
-- RLS 켜져 있는가? (적용 전 f, 적용 후 t)
SELECT relrowsecurity FROM pg_class WHERE oid = 'public.questions'::regclass;

-- 이미 붙어 있는 정책이 있는가? (적용 전 0행)
SELECT policyname, cmd, qual FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'questions';
```

이미 정책이 있거나 RLS가 켜져 있으면 **멈추고** 누가 언제 켰는지 먼저 확인할 것.
(이 마이그레이션은 재실행 안전하지만, 남이 만든 정책을 덮어쓰지는 않는다.)

## (b) 적용 순서 — 순서를 바꾸지 말 것

1. **먼저 앱을 배포한다.** `AdminDailyClient` / `AdminImportsClient`가
   `questionRepo.update()` · `questionRepo.appendMany()`(브라우저 anon 키 직접 쓰기)
   대신 서버 API(`/api/admin/questions`, `PUT`/`POST`)를 호출하도록 바꾼 코드가
   **프로덕션에 반영된 뒤**여야 한다.
   (이 코드 변경 자체는 이미 작업 트리에 들어와 있다 — 커밋·배포만 남았다.)
2. 배포된 프로덕션에서 두 화면의 저장/업로드가 정상 동작하는지 먼저 확인한다.
   (이 시점엔 아직 RLS가 꺼져 있으므로, 실패하면 곧바로 코드 문제다.)
3. 그 다음 Supabase **SQL Editor**에 `20260821_questions_rls.sql` 전체를 붙여넣고 실행한다.
4. 실행 직후 위 (a)의 SQL을 다시 돌려 `relrowsecurity = t`,
   정책이 `questions_public_read` (cmd = `SELECT`, qual = `true`) **1개뿐**인지 확인한다.
   INSERT/UPDATE/DELETE 정책이 보이면 잘못 실행된 것이다.

> 순서를 뒤집으면(=SQL 먼저) 관리자 화면의 쓰기가 실패한다.
> 단, **실패 방식이 명령마다 다르다는 점에 주의**한다.
> - INSERT는 `42501`로 명시적으로 에러가 난다.
> - UPDATE/DELETE는 **에러가 나지 않는다.** 정책상 대상 행이 보이지 않아
>   0행 처리되고 정상 종료되므로, 화면은 "저장됨"으로 보이고 실제로는 아무것도 안 바뀐다.
>
> 따라서 "에러가 안 떴으니 정상"이라는 판단은 여기서 틀린다.

## (c) 적용 후 확인 — 이것만은 손으로 눌러볼 것

학생(로그인 상태, 일반 계정):

- `/student/exams` 진입 → 상단 문항 수 카운트가 0이 아닌 실제 숫자로 뜨는지.
- 단원별 학습 시작(`/student/exams/unit-test?...`) → 문제가 로드되고 채점·결과 저장까지 되는지.
- 등록 모의고사 1개 응시(`/student/exams/{examId}`) → 제출 후 결과 페이지가 뜨는지.
- **로그아웃 상태**로 `/student/exams` 진입 → 문항 수 카운트가 0이 아닌 실제 값으로 뜨는지.
  (RLS가 SELECT를 막아도 HTTP 401/403이 아니라 **200 + 빈 배열**이 온다.
   콘솔 에러로는 확인되지 않으므로, 반드시 화면에 찍히는 숫자로 확인한다.)
  (공개 SELECT 정책을 둔 이유가 이 경로다.)

관리자:

- **데일리 관리**(`/admin/daily`) — 문항 목록 로드 + 문항 수정 저장 + 랜덤 배정.
- **가져오기**(`/admin/imports`) — 파일 업로드 후 문항이 실제로 늘어나는지.
- 문제 관리(`/admin/questions`), 시험 관리(`/admin/exams`)도 한 번씩 열어 목록이 뜨는지.

실패 시 브라우저 콘솔/네트워크 탭에서 PostgREST 에러 코드를 본다.
`42501 (new row violates row-level security policy)` 이면
그 경로가 아직 anon 키로 쓰기를 하고 있다는 뜻 → 해당 코드를 서버 API로 옮기거나 (d)로 롤백.

## (d) 롤백

```sql
ALTER TABLE public.questions DISABLE ROW LEVEL SECURITY;
```

즉시 적용되며 데이터 변경은 없다. 정책(`questions_public_read`)은 남지만
RLS가 꺼진 상태에서는 무시되므로 그대로 둬도 무방하다. 완전히 지우려면:

```sql
DROP POLICY IF EXISTS questions_public_read ON public.questions;
```

---

## ⚠️ 알려진 미해결 문제 (KNOWN REMAINING GAP)

**이 마이그레이션은 정답 유출을 막지 못한다.**

RLS는 이름 그대로 **행(row) 단위** 보안이다. 컬럼을 숨기지 않는다.
`questions_public_read`가 걸린 뒤에도 브라우저(또는 anon 키를 가진 누구든)는

```
GET /rest/v1/questions?select=id,correct_option_id,answer_text
```

로 **정답 컬럼을 그대로 읽을 수 있다.** 시험 중인 학생이 개발자도구만 열면
정답을 볼 수 있다는 뜻이고, 이 SQL은 그 상태를 조금도 바꾸지 않는다.

지금은 이게 **의도된 동작**이다. 채점이 클라이언트에서 돌기 때문이다:

- `src/lib/exam/grading.ts` — `problem.correctOptionId` / `problem.answerText`로 정오답 판정
- `src/components/exam/ExamRunner.tsx` — 제출 시 `gradeExam()` 호출 후 결과를 저장
- `src/lib/questions/SupabaseQuestionRepository.ts` — `QUESTION_LIST_COLUMNS`에
  `correct_option_id`, `answer_text` 포함 (브라우저가 실제로 이 컬럼을 받아 씀)

즉 **브라우저가 오늘 정답을 진짜로 필요로 한다.** 정답 컬럼을 막는 SELECT 정책이나
뷰를 지금 끼워 넣으면 채점이 통째로 깨진다. 그래서 이 마이그레이션은
"정답을 가리는 척하는 SQL"을 일부러 넣지 않았다.

이 구멍을 닫으려면 SQL이 아니라 앱을 고쳐야 한다 — 별도 작업:

1. 채점을 서버로 이동(예: `POST /api/exam/grade`, service_role로 정답 조회 후 결과만 반환)
2. 그 다음 브라우저가 받는 컬럼에서 `correct_option_id` / `answer_text` 제거
   (정답 컬럼을 뺀 뷰 + `security_invoker`, 또는 컬럼 GRANT 회수)
3. 해설 노출 시점(제출 후)만 별도 API로 허용

그 전까지 이 마이그레이션이 실제로 막는 것은 **쓰기(문제은행 변조·삭제)** 뿐이다.
