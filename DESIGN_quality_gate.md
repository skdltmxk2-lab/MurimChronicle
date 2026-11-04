# 출제 시점 품질 게이트 — 설계서

작성: 2026-11-04. 대상: 코칭 스튜디오(단원 모고·학교별 모고·관련문제)와 그 주변 저장 경로.
상태: **설계 확정 전 — §13 결정 사항 5개 + §2.3 오류 표본 수집이 끝나야 구현 착수.**

---

## 0. 목표

코칭 스튜디오에서 문제지를 만들 때, 뽑힌 문항을 **AI 없이 코드로** 검사한다.

1. **고칠 수 있는 오류**(의미가 절대 안 바뀌는 기계적 오류)는 그 자리에서 고쳐 DB에 반영한다. 원본은 로그에 남긴다.
2. **고칠 수 없는 오류**는 문항을 격리(`quarantined`)하고 사유를 남긴다. 같은 조건의 다른 문항으로 즉시 교체한다.
3. 격리된 문항은 관리자 화면에서 사유별로 모아 보고, 다음 업데이트 때 **한꺼번에** 고친다.
4. 알고리즘이 못 보는 오류(정답 자체가 틀림, 그림 내용 오류 등)는 선생님이 미리보기에서 **한 번 클릭으로 신고**하면 같은 흐름(격리 → 교체 → 마킹)을 탄다.

비목표: 문제은행 전체를 지금 일괄 수정하는 것. 일괄 *마킹*은 §11의 선택 단계로 둔다.

---

## 1. 현재 상태 (설계 근거, 코드·데이터 실측)

### 1.1 이미 있는 재료

| 재료 | 위치 | 쓰임 |
|---|---|---|
| 검사기 약 70종 (P0~P3, 자동수정 등급 safe/guarded/manual 포함) | `scripts/audit_*_readonly.mjs` 10개 | 지금은 오프라인 리포트 전용. 규칙 로직을 그대로 옮겨 온다 |
| 렌더 파이프라인 사본 | `scripts/lib/render_pipeline.mjs` (`inspectRender`, `normalizeContent`, `splitRenderBlocks`, `isWideMath` …) | KaTeXRenderer의 텍스트 처리를 그대로 흉내 낸 **수기 사본** |
| 기계적 자동수정 | `scripts/lib/content_fixes.mjs` (`autoFix`: 자모 라벨·도 기호·공백) | 안전 수정 일부 재사용 |
| 품질 상태 칸 | `questions.quality_status`(pending/approved/quarantined) · `quality_reasons[]` · `validated_at` · `validator_version` | 격리 마킹. **모든 출제·검색 쿼리가 이미 `approved`만 읽으므로**, 격리하면 학생 화면에서도 자동으로 빠진다 |
| 격리 배지 | `AdminQuestionsClient.tsx`의 `qualityStatusMeta` ("격리") | 관리자 목록 표시는 이미 있음, 필터는 없음 |
| 사람 판정 보존 규약 | `scripts/audit_review_queue_merge.mjs` (`contentFingerprint`, `disposition`) | "오탐 해제는 내용이 바뀌면 무효"라는 원칙을 그대로 채택 |
| 수치 비교기 | `schoolMockCore.mjs`의 `evalClosedForm` · `compareAnswers` · `isClosedScalarAnswer` | 새 규칙 N3(해설 답 ↔ 정답 대조)에 재사용 |
| 설정 저장소 | `app_settings` 테이블 (검색 엔진 설정이 이미 사용) | 게이트 모드 플래그(off/shadow/enforce) |

### 1.2 코칭의 문항 출입구 (게이트를 걸 지점)

| 경로 | 문항을 고르는 곳 | 비고 |
|---|---|---|
| 단원 모고 생성·**교체** | `app/api/admin/coaching/unit-mock/route.ts` → `loadSectionPool` → `selectUnitMockCandidates` (+ `widen` 단계) | 1문항 교체도 같은 라우트(`widen:true` + `excludeIds`) |
| 학교별 모고 기출·유사 | `school-mock/select/route.ts` (`loadQuestions` + `match_questions`) | 미커밋 작업 |
| 학교별 모고 AI 신규 | `school-mock/generate-ai/route.ts` | 저장 직전에 검사 |
| 관련문제 | `related/route.ts` (`match_questions`) | |
| 쌍둥이 | `twin/route.ts` (AI 생성 후 `questions` 저장) | 저장 직전에 검사 |
| 숙제(생성 문제지) | `src/lib/homework/generated.ts` | 새로 고르지 않음. 이미 고른 id를 **`updated_at` 버전 대조**로 다시 읽는다 → §6.4 |

공용 로더는 `src/lib/admin/coachingQuestionPool.ts`의 `loadQuestions` 하나(`quality_status='approved'`만 읽음). 모든 관리자 라우트는 `requireAdmin`이 돌려주는 **service-role 클라이언트**를 쓰므로 RLS 제약 없이 쓰기 가능하다.

### 1.3 결정적 관찰 — 기존 검사기는 이미 "소진"됐다

2026-08-25 전체 감사 결과(`tmp/audit/*_report.json`, 5,533문항):

| 감사 | 라이브 문항 결과 |
|---|---|
| questions_audit (구조: 답 없음·정답 id 이탈·빈 선지…) | P0~P2 **0건** (P3 중복 지문 22건뿐) |
| render_breakage (실제 렌더 깨짐) | **1건** |
| question_quality · missing_context · subject_hierarchy | **0건** |
| render_readability | 283건 중 대부분 P3 `hangul_in_text_macro` — 사람 판정 217건이 `no_action_needed`(오탐) |

**→ 사용자가 지금 보는 오류는 대부분 기존 규칙이 못 잡는 종류다.** 따라서

- 기존 규칙만 옮기면 **새로 들어오거나 수정되는 문항의 회귀 방지**용으로만 쓸모가 있다. 이것도 필요하다.
- 실제 효과는 ① **새 규칙**(§3.3)과 ② **수동 신고 경로**(§7)에서 나온다.
- 새 규칙의 정밀도는 실제 오류 표본 없이는 보장할 수 없다 → §2.3.

(그 뒤 8/26 이후 추가·수정된 문항, 예를 들어 AI 생성이나 숙제 경로로 들어온 문항은 감사를 거치지 않았다. 8/26 시점 뱅크 5,533문항 이후의 증감은 실DB 확인이 필요하다 — §11 단계 0.)

---

## 2. 설계 원칙

### 2.1 네 가지 등급 (tier)

모든 규칙은 정확히 하나의 등급을 가진다.

| 등급 | 의미 | 게이트 동작 |
|---|---|---|
| **fix** | 의미가 절대 바뀌지 않는 기계적 수정이 가능 | 수정 → 재검사 → 불변식(§4.2) 통과 시 DB 저장 + 로그. 하나라도 실패하면 원래 문제의 등급으로 처리 |
| **block** | 확실한 오류 (오탐 0을 목표로 하는 고정밀 규칙만) | 격리 + 사유 + 로그 → 이번 문제지에서 교체 |
| **suspect** | 의심 (오탐이 있을 수 있는 휴리스틱) | **격리하지 않음**(학생 화면 유지). 이번 문제지에서는 깨끗한 후보를 우선하고, 대체 후보가 없을 때만 배지를 붙여 사용. 검토 목록에 1회 기록 |
| **warn** | 인쇄 품질 경고 (내용은 정상) | 문항 유지, 미리보기에 배지만 |

**block 등급 승격 조건:** 전체 뱅크 dry-run(§11 단계 2)에서 그 규칙이 잡은 문항을 **전부** 사람이 확인해 오탐 0. 이걸 통과하지 못한 규칙은 suspect에 머문다. 기존 감사의 P0 분류를 그대로 믿지 않는다.

### 2.2 알고리즘 우선, AI 0회

게이트는 순수 함수 + KaTeX만 쓴다. 외부 호출은 이미지 존재 확인(HEAD 요청) 하나뿐이다. 비용 0, 결정적이고 테스트 가능하다.

### 2.3 표본 없이 새 규칙을 확정하지 않는다

단계 0에서 사용자가 실제로 본 오류 문항 **10~20개**(문항 id 또는 화면 캡처 + 무엇이 틀렸는지 한 줄)를 모은다. 각 표본은

- 기존 규칙으로 잡히는지 → 안 잡히면 왜 안 잡히는지 분류
- 새 규칙의 **양성 테스트 픽스처**가 됨
- 알고리즘으로 원리상 못 잡는 종류면 수동 신고 사유 칩(§7)에 반영

### 2.4 사람의 판정을 존중한다

"오탐 — 해제" 판정은 `(문항, 규칙 코드, 내용 지문)` 단위로 저장한다. 내용이 바뀌면 판정은 자동으로 무효가 된다(`audit_review_queue_merge.mjs`와 같은 원칙). 기존 큐의 `no_action_needed` 판정은 시드로 이관한다(§5.3).

---

## 3. 검사 규칙 목록 (v1)

필드 범위: 본문(question) · 선지(options) · 정답(correct_option_id / answer_text) · 해설(explanation) · 이미지 4종.
해설도 코칭 **해답지에 그대로 인쇄**되므로(`AdminCoachingClient`의 `coaching-answer-explanation`), 해설 렌더 깨짐도 block 대상이다.

### 3.1 block 후보 (기존 규칙 이관 — dry-run으로 오탐 0 확인 후 확정)

| 코드 | 판정 | 출처 |
|---|---|---|
| `missing_question` | 본문 텍스트·이미지 모두 비어 있음 | audit_all |
| `stem_visually_empty` | 렌더 후 보이는 글자가 없음 | readability |
| `invalid_options_json` / `duplicate_option_id` | 선지 배열 파손 / id 중복 | audit_all |
| `missing_correct_option` / `correct_option_not_in_options` | 객관식 정답 id 없음 / 선지 밖 | audit_all |
| `missing_subjective_answer` / `missing_answer` | 주관식 답 없음 / 선지도 답도 없음 | audit_all |
| `empty_option` | 선지 텍스트·이미지 모두 빈 칸 | audit_all, render_breakage |
| `unbalanced_math_delimiter` | `$` 짝이 안 맞음 (렌더 기준) | readability |
| `math_parse_error` | `normalizeContent` 후 KaTeX 컴파일 실패 → 앱이 원문을 그대로 찍음 | render_breakage |
| `latex_macro_outside_math` | `\frac` 등이 수식 밖에서 그대로 보임 | render_breakage |
| `replacement_char` / `mojibake_sequence` | 깨진 글자(�, 잘못 디코딩된 바이트) | readability |
| `content_type_image_without_image` / `explanation_content_type_without_image` | 이미지 유형인데 이미지 없음 → 빈 칸 렌더 | render_breakage |
| `image_unreachable` (**신규 구현**) | 이미지 URL이 404/403 (HEAD). 네트워크 오류·타임아웃은 block이 아니라 warn | §3.3 N7 |

### 3.2 suspect (기존 규칙 이관)

`duplicate_option_text` · `explanation_answer_mismatch`(해설의 "정답: ③"과 정답 id 불일치) · `figure_reference_without_image` · `view_reference_without_view_block` · `stem_ends_mid_expression` · `stem_missing_question_ending` · `options_inlined_in_stem` · `next_stem_inside_option` · `question_prompt_inside_option` · `hangul_inside_math` · `math_missing_glyph` · `ocr_artifact` / `placeholder_artifact` · `authoring_note_visible` · `markdown_table_in_text` · `backslash_break_outside_math` · `content_type_hides_image`(이미지가 있는데 유형이 latex라 안 보임)

P2~P3 가독성 규칙(`hangul_in_text_macro` 등)은 **게이트에서 제외**한다. 오탐률이 높고(217/226) 출제 가치를 해치지 않는다.

### 3.3 신규 규칙 (표본으로 보정 — 처음엔 전부 suspect로 시작)

사용자가 말한 오류 유형("깨짐 / 답이 없음 / 선지·박스가 잘못됨")을 겨냥한다.

| # | 코드 | 알고리즘 | 겨냥 |
|---|---|---|---|
| N1 | `view_label_missing` | 선지가 보기 라벨 조합(ㄱ,ㄴ,ㄷ… / 가,나,다…)을 참조하는데, 본문 보기 블록(`splitRenderBlocks`의 view 블록)에 그 라벨 문장이 없음. 예: 선지에 "ㄱ, ㄹ"이 있는데 ㄹ 문장이 없다 | 박스·보기 오류. 구조적으로 확실 → 표본 확인 후 block 승격 1순위 |
| N2 | `view_block_not_detected` | 본문에 보기형 문장 라벨이 2개 이상인데 렌더 결과 view 블록이 0개 (한 줄로 뭉개지거나 박스 없이 출력) | 박스 렌더 오류 |
| N3 | `answer_key_vs_explanation_value` | 해설 마지막 답 표현(“따라서 …= 값”, “답: 값”)을 `evalClosedForm`으로 계산하고, 각 선지도 수치화. ① 정확히 한 선지와 일치하는데 그게 정답 id가 아님 → `answer_key_mismatch_numeric` ② 선지가 전부 닫힌 수치인데 어느 것과도 일치하지 않음 → `no_option_matches_explanation` | "답이 없다", 정답 표기 오류 |
| N4 | `option_kind_outlier` | 객관식 4~5개 중 하나만 성격이 다름 (나머지는 짧은 수식인데 하나만 한글 15자 이상 / 다른 문항 번호 패턴) | 다음 문항 본문이 선지로 섞임 |
| N5 | `option_count_label_mismatch` | 본문이나 선지 텍스트에 ①~⑤ 라벨이 남아 있는데 실제 선지 개수와 다르거나 순서가 어긋남 | 선지 밀림 |
| N6 | `print_clip_risk` (**warn**) | `isWideMath` / `inlineMathNeedsScroll`이 참인 수식. 웹에서는 가로 스크롤이 되지만 인쇄(`window.print`)에서는 잘린다 | 인쇄본에서만 깨지는 수식 |
| N7 | `image_unreachable` | 뽑힌 문항의 이미지 URL만 HEAD 요청 (병렬 6, 각 3초, 요청당 총 8초 상한). 404/403 → block, 그 외 실패 → warn | 그림 누락 |
| N8 | `subjective_answer_unparsable` | `normalizeAnswer(answer_text)`가 빈 문자열이거나 원문 그대로 남는 비정상 형태 → 학생 채점 불가 | 주관식 답 오류 |

표본에서 나오는 유형에 따라 N9 이후를 추가하고, 원리상 못 잡는 유형은 §7 신고 칩으로 돌린다.

### 3.4 fix (안전 자동수정 — v1 화이트리스트)

| 코드 | 수정 | 근거 |
|---|---|---|
| `html_entity_in_text` | `&amp; &lt; &gt; &nbsp; &quot; &#39;` → 문자 (수식 밖만) | readability: safe |
| `zero_width_char` | U+200B~U+200D, U+FEFF 제거 | safe |
| `nbsp_or_exotic_space` | 특수 공백 → 일반 공백 | safe |
| `blank_line_run` | 연속 빈 줄 3개 이상 → 2개 | safe |
| `empty_math_span` | `$ $`, `$$ $$` 제거 | safe |
| `escaped_special_outside_math` | 수식 밖 `\%`, `\&`, `\#`, `\<`, `\>` → 문자 | safe (8/25 fix 스크립트에서 서강대 14건으로 검증된 변환) |
| `choseong_jamo` / `whitespace_tidy` | `content_fixes.mjs`의 `normalizeChoseongJamo` · `tidyWhitespace` | 기존 autoFix 일부 |

**guarded**(결정적이지만 사람이 diff를 봐야 하는 수정: `won_sign_for_backslash` ₩→\, `double_escaped_macro`, `raw_html_tag` `<u>`→`**`, `control_char_in_text`, `fullwidth_ascii`)는 v1에서 **자동 적용하지 않는다**. 원래 등급(block/suspect)으로 처리하되, **수정안(before/after)을 로그에 함께 저장**한다. 그러면 관리자 화면에서 "수정안 일괄 적용"을 한 번에 누를 수 있다(§8) — "다음 업데이트 때 한꺼번에"의 실체가 이것이다. → 결정 D1.

---

## 4. 공용 코어 모듈

### 4.1 파일 구성

```
src/lib/render/pipeline.mjs          ← scripts/lib/render_pipeline.mjs 를 이동 (단일 진실원)
                                        scripts/lib/render_pipeline.mjs 는 re-export 한 줄로 남김
src/lib/questions/qualityGateCore.mjs  (+ .d.mts 수기 타입, TS 배럴 qualityGate.ts)
tests/test_quality_gate_core.mjs
```

`standaloneCore.mjs` · `unitMockSelectionCore.mjs`와 같은 패턴이다. import는 `katex`와 `../render/pipeline.mjs`만 쓰고, node:assert로 직접 테스트한다.

**전제 리팩터:** 렌더 검사가 학생이 실제로 보는 화면과 같으려면 `KaTeXRenderer.tsx`가 같은 파이프라인을 써야 한다. 지금은 수기 사본 두 벌이다. v1에서는 **파이프라인 이동 + 동등성 테스트**(같은 입력에 대해 `KaTeXRenderer`의 텍스트 전처리 결과와 `pipeline.mjs` 결과가 같은지 확인)까지만 하고, KaTeXRenderer가 직접 import하도록 바꾸는 일은 미커밋 KaTeXRenderer 재작성(§12)이 정리된 뒤로 미룬다.

### 4.2 API

```js
export const QUALITY_GATE_VERSION = "gate-20261104-v1";

inspectQuestion(q, { context }) -> {
  fingerprint,                 // 내용 지문 (아래)
  issues: [{ code, tier, field, message, evidence, fix?: { field, before, after, class } }],
  worstTier,                   // "block" | "suspect" | "warn" | "fixable" | "clean"
}

applySafeFixes(q, issues) -> { fixed: q', applied: [{code, field, before, after}] } | null
  // null = 불변식 실패 → 수정하지 않음

checkFixInvariants(before, after) -> { ok, violations[] }
  // ① 선지 개수·id·순서 동일 ② correct_option_id 동일 ③ normalizeAnswer(answer_text) 동일
  // ④ 수식 서명 동일: 모든 수식 구간을 공백 제거해 이어 붙인 문자열 (수식 밖 수정만 허용)
  //    단, empty_math_span 은 빈 구간만 제거되었음을 별도로 확인
  // ⑤ 수식 밖 숫자열 동일 ⑥ 수정 대상 필드 외 변화 없음
  // ⑦ 수정 후 재검사에서 block 0건 + 이슈 수 감소 ⑧ 멱등: applySafeFixes(after) 가 추가 변경 없음

contentFingerprint(q) -> string
  // question, content_type, question_image, options(id,text,image), correct_option_id,
  // answer_text, explanation, explanation_content_type, explanation_image 의 정규 JSON → cyrb53 64bit hex
  // (import 0 유지를 위해 순수 JS 해시. 보안 용도가 아닌 변경 감지용)

partitionForSelection(results, clearances) -> { clean, fixable, suspect, blocked, warnOnly }
  // clearances: Set("questionId|code|fingerprint") — 해제된 (문항,코드,지문) 이슈는 무시
```

### 4.3 성능

- 전체 후보 풀을 미리 검사하지 않는다(과목 전체 약 1,500문항 × 수식 약 20개). **뽑힌 문항만 검사(lazy)** 하고, 요청 안에서 `Map<id, result>`로 메모한다.
- 문항당 KaTeX 컴파일 수 ms → 60문항 + 교체분까지 1초 미만. 이미지 HEAD는 §3.3 N7 상한을 따른다.
- 영속 캐시(검사 결과 DB 저장)는 v1에서 하지 않는다. 필요해지면 `validator_version` + 지문으로 추가한다.

---

## 5. 데이터 (마이그레이션 1건)

`supabase/migrations/2026MMDD_question_quality_gate.sql`

### 5.1 `question_quality_events` — 변경 불가 로그(append-only)

```sql
id            bigserial PK
question_id   text NOT NULL REFERENCES questions(id) ON DELETE CASCADE
event         text NOT NULL CHECK (event IN
                ('autofix','quarantine','suspect','report','clear','release','revert','proposal_applied'))
codes         text[] NOT NULL DEFAULT '{}'
details       jsonb  NOT NULL DEFAULT '{}'   -- {fields:[{field,before,after}], evidence, proposedFixes:[...], note}
fingerprint   text   NOT NULL                -- 이벤트 시점 내용 지문 (autofix면 수정 전 지문)
gate_version  text   NOT NULL
context       text   NOT NULL                -- 'unit-mock'|'school-mock'|'related'|'twin'|'school-ai'|'save'|'sweep'|'manual'
actor_id      uuid                            -- 관리자 id (sweep 은 null)
created_at    timestamptz NOT NULL DEFAULT now()

INDEX (question_id, created_at DESC); INDEX (event, created_at DESC)
UNIQUE (question_id, event, fingerprint) WHERE event = 'suspect'   -- 같은 내용의 의심 기록 중복 방지
```

### 5.2 `question_quality_clearances` — 오탐 해제

```sql
question_id text REFERENCES questions(id) ON DELETE CASCADE,
code text, fingerprint text, cleared_by uuid, note text, created_at timestamptz DEFAULT now(),
PRIMARY KEY (question_id, code, fingerprint)
```

두 테이블 모두 RLS enable + 관리자만(`profiles.is_admin`) select/insert. 서버 라우트는 service-role로 접근한다.

### 5.3 기존 칸의 의미

- `quality_status='quarantined'` + `quality_reasons = [코드…]` + `validated_at=now()` + `validator_version=QUALITY_GATE_VERSION`. 코드 이름은 기존 standalone 사유와 같은 평면 문자열을 쓴다(접두어 없음, 출처는 events에 있음).
- CHECK 제약(pending/approved/quarantined)은 그대로 둔다. suspect는 **상태가 아니라 이벤트**다.
- 시드: `render_readability`·`structural_collapse` 큐의 `no_action_needed` 판정 중, **현재 내용으로 같은 코드가 다시 잡히는 것만** 현재 지문으로 clearances에 넣는 1회 스크립트를 둔다. 게이트 대상에서 빠진 P3 코드는 이관하지 않는다.

---

## 6. 출제 라우트 통합

### 6.1 공통 래퍼 — `selectWithGate`

```
selectWithGate({ candidates, select, count, inspect, persist, mode }):
  rejected = Set(), reserve = []   // reserve = suspect
  loop:
    picked = select(candidates − rejected − reserve, count − kept.length)
    if picked 비어 있음: break
    for q in picked (아직 검사 안 한 것만):
      r = inspect(q)
      clean/warnOnly → keep
      fixable        → fixed = persist.autofix(q, r) ; 성공 시 keep(fixed) / 실패 시 원래 등급으로 재분류
      blocked        → persist.quarantine(q, r) ; rejected.add
      suspect        → persist.suspect(q, r) ; reserve.push ; rejected.add
    kept.length === count 이면 종료
  부족분은 reserve 에서 채움(결정 D2) — 원래 선택 순서 유지, suspectUsed 로 보고
  종료 증명: 매 반복마다 rejected 가 단조 증가하고 후보는 유한 → 최대 |candidates| 회
```

- `select`는 기존 `selectUnitMockCandidates`를 그대로 쓴다(단원 라운드로빈·난이도 폴백 의미 유지). 이미 고른 문항은 다시 고르지 않도록 `count − kept` 만큼만 추가로 요청한다.
- `widen` 단계마다 같은 래퍼를 적용하고, `rejected`는 섹션 전체에서 공유한다.
- **`mode`(app_settings `quality_gate_mode`):** `off` = 래퍼 우회 / `shadow` = 검사·보고만 하고 쓰기·교체 없음 / `enforce` = 전체 동작. 기본값 `shadow`.

### 6.2 DB 쓰기 규칙 (persist)

- **autofix:** `UPDATE questions SET <필드들>, updated_at=now(), validated_at=now(), validator_version=$v WHERE id=$id AND updated_at=$읽은값 RETURNING *` (CAS). 0행이면 다시 읽어 1회 재검사하고, 그래도 충돌하면 이번 요청에서 그 문항을 제외한다(쓰기 없음). 성공하면 events에 `autofix`(필드별 before/after)를 남기고, **RETURNING 된 새 레코드를 응답에 넣는다**(새 `updated_at` → 숙제 버전 대조 통과, §6.4).
- **quarantine:** `UPDATE … SET quality_status='quarantined', quality_reasons=$codes … WHERE id=$id AND quality_status='approved'` + events `quarantine`(evidence + guarded 수정안). 이미 격리된 경우는 무시(멱등).
- **suspect:** RPC `record_quality_event(...)`로 INSERT … ON CONFLICT DO NOTHING (같은 지문이면 1회만). supabase-js의 `upsert`는 부분 유니크 인덱스 조건을 지정할 수 없으므로, 기존 `record_coaching_student_question_usage`처럼 SQL 함수로 감싼다. 이 RPC는 마이그레이션에 포함한다.
- 모든 쓰기는 응답 전에 끝낸다. 쓰기가 실패해도 선택 결과에는 영향 없음(실패한 문항은 이번 문제지에서 제외만) — 실패 건수는 `qualityGate.writeErrors`로 보고.

### 6.3 응답 계약 추가 (unit-mock · school-mock/select · related 공통)

```ts
qualityGate: {
  mode: "off" | "shadow" | "enforce";
  version: string;
  inspected: number;
  autoFixed:     { id: string; codes: string[] }[];
  quarantined:   { id: string; codes: string[] }[];   // 교체된 문항
  suspectSkipped:{ id: string; codes: string[] }[];
  suspectUsed:   { id: string; codes: string[] }[];   // 대체 후보가 없어 배지 달고 사용
  warnings:      { id: string; codes: string[] }[];   // print_clip_risk, image_check_failed
  shadowWouldChange?: {...}                           // shadow 모드에서 enforce였다면 했을 일
  writeErrors: number;
}
```

기존 필드(`available`, `breakdown` …)의 의미는 바꾸지 않는다. 후보 수는 "검사 전" 수치임을 UI에 명시한다. `breakdown.selectedCount` 합계 = 반환 문항 수라는 불변식은 유지한다.

### 6.4 주변 경로와의 상호작용 (반드시 처리)

| 상호작용 | 처리 |
|---|---|
| 숙제 생성의 `updated_at` 대조 (`generated.ts`) | autofix가 응답 전에 끝나고 새 레코드를 돌려주므로 정상 흐름은 통과. 문제지를 연 뒤 **다른 사람이** 같은 문항을 수정하면 기존 409("다시 생성") 동작 그대로 — 의도된 보호 |
| 사용 이력 기록 | 교체로 빠진 문항은 시트에 없으므로 기록되지 않음. 변경 불필요 |
| 학생 화면 | 격리되면 `approved` 필터로 단원 학습·과목 모고·데일리·취약 분석·검색에서 자동 제외. 미래 날짜 `daily_assignments`에 든 문항은 그날 문항 수가 줄어든다 → 격리 응답에 "데일리 배정 포함" 경고 표시 |
| 기존 스냅샷 (`generated_exams.problems`, `exam_attempts.result.examSnapshot`, 숙제 PDF) | 자동수정·격리가 **전파되지 않는다**(이미 치른 시험을 조용히 바꾸지 않는 기존 원칙). 필요하면 8/25 fix 스크립트처럼 같은 변환을 스냅샷에 미러링하는 일괄 스크립트를 별도로 둔다 |
| AI 생성 저장 (twin, school-ai) | 저장 직전 `inspectQuestion` → block이면 저장하지 않고 "생성 실패" 처리(school-ai는 다음 라운드). safe fix는 저장 전에 적용 |
| 관리자 문항 저장·대량 업로드 (`serverQuestionRepository`) | 지금은 저장 시 무조건 `approved`. 변경: 저장 시 게이트 실행 → block 남으면 **저장은 하되 `quarantined` + 경고 반환**(작업 손실 방지). 격리 문항을 고쳐 저장했는데 깨끗하면 `approved` + `release` 이벤트 — "고치면 자동 복귀" |
| 동시성 | §6.2 CAS. DB 잠금은 도입하지 않는다 |
| Vercel 시간 한도 | 게이트 추가분은 검사 1초 미만 + 이미지 8초 상한. 학교 모고 generate-ai의 라운드 예산(50초)에 이미지 검사는 넣지 않는다(저장 문항은 이미지 없음) |

---

## 7. 수동 신고 (알고리즘의 사각지대)

인쇄 미리보기의 각 문항(교체·삭제 버튼 옆, `SHEET_EDITABLE_SOURCES` 시트)에 **"오류 신고"** 버튼을 단다.

- 모달: 사유 칩(복수 선택) — `깨짐` · `답 없음/정답 오류` · `선지 오류` · `보기·박스 오류` · `그림 오류` · `조건 누락` · `기타` + 메모(선택). 칩 목록은 §2.3 표본으로 최종 조정한다.
- `POST /api/admin/questions/[id]/quality { action: "report", codes, note }` → `quarantined` + `quality_reasons=["report:<칩>"…]` + events `report` → 응답 성공 시 클라이언트가 **기존 교체 핸들러**로 그 자리를 자동 교체한다.
- 결정 D3: 신고 = 즉시 격리(추천) vs 마킹만.

---

## 8. 관리자 검토 화면 (나중에 한꺼번에 고치기)

`AdminQuestionsClient` 확장 — 새 페이지를 만들지 않는다.

- 필터: 품질 상태(`승인/검수대기/격리`) + "의심 기록 있음" + 사유 코드별 묶음 + 문항 수
- 상세 패널: 이벤트 타임라인 — autofix는 필드별 diff, quarantine은 근거(evidence)와 guarded 수정안 diff
- 동작:
  - **수정 후 저장** — 기존 QuestionModal. 저장 시 게이트 재검사(§6.4), 깨끗하면 자동 복귀
  - **수정안 적용** — guarded 수정안 1개 / 체크한 여러 개 일괄 적용. 불변식(§4.2) 재확인 후 저장 + `proposal_applied`
  - **오탐 — 해제** — clearances 추가 + `approved` 복귀 + `clear`
  - **자동수정 되돌리기** — 로그의 before로 복원 + `revert` (이후 같은 코드에 대해 되돌린 내용의 지문으로 clearance 자동 추가 — 같은 수정이 반복 적용되지 않게)
- `GET /api/admin/questions/quality?status=&code=&page=` (목록 + 최신 이벤트), `POST /api/admin/questions/[id]/quality { action: report|clear|release|revert|apply_proposal }`

---

## 9. 코칭 UI 변경 (최소)

- 생성·교체 결과 알림에 한 줄 추가: `검사 N · 자동수정 a · 오류로 교체 b · 의심 제외 c` (0인 항목은 숨김). 기존 `classifyUnitMockReplacements` 요약과 **겹쳐 세지 않는다**. 게이트 교체는 별도 줄.
- 문항 배지: `자동 수정됨`(호버 시 무엇을 고쳤는지) · `의심: <사유>`(suspectUsed) · `인쇄 잘림 주의`(warn)
- 오류 신고 버튼(§7)
- shadow 모드에서는 배지 대신 미리보기 상단에 "검사만 하는 모드: 실제였다면 교체 b건" 표시

---

## 10. 테스트

`tests/test_quality_gate_core.mjs` → `package.json`에 `test:quality-gate` 추가, prebuild 체인 끝에 편입.

- 규칙별 양성·음성 픽스처 (§2.3 표본 포함. 표본은 문항 id와 최소 필드만 픽스처로 복사)
- 기존 감사의 판정 회귀: `no_action_needed`로 판정된 사례가 게이트에서 block/suspect를 내지 않음
- autofix 불변식: 모든 fix 규칙에 대해 ① 멱등 ② 수식 서명 불변 ③ 선지·정답 불변 ④ 재검사 block 0
- `selectWithGate` 성질 테스트: 반환 수 ≤ count, 중복 없음, rejected는 절대 반환하지 않음, 종료, suspect는 clean이 바닥났을 때만 사용, `breakdown` 합계 불변식
- 지문: 필드 하나만 바뀌어도 지문이 바뀜 / 키 순서와 무관
- 파이프라인 동등성(§4.1)

---

## 11. 구현 단계

| 단계 | 내용 | 완료 기준 |
|---|---|---|
| **0** | ① 오류 표본 10~20개 수집(사용자) ② 미커밋 작업 정리(§12) ③ 실DB 현황 확인(문항 수, 8/26 이후 추가분, 이미지 URL 형식) | 표본 목록 + 현황 기록 |
| 1 | 파이프라인 이동 + `qualityGateCore` + 테스트 (기존 규칙 이관 + N1~N8) | `test:quality-gate` 통과, 기존 테스트 전부 통과 |
| 2 | **전체 뱅크 dry-run** `scripts/quality_gate_sweep_readonly.mjs` (DB 쓰기 0, 리포트만) | 규칙별 적중 수 · 표본 재현율. **block 후보 적중을 전부 사람이 확인 → 오탐 0인 규칙만 block 확정** |
| 3 | 마이그레이션 + clearances 시드 | 스테이징 적용, RLS 확인 |
| 4 | unit-mock에 `selectWithGate` (shadow 기본) + 응답 계약 + UI 알림 | shadow 리포트가 dry-run과 일치 |
| 5 | 수동 신고 + 검토 화면 | 신고 → 교체 → 검토 → 수정 → 복귀 전 흐름 수동 검증 |
| 6 | enforce 전환 (unit-mock) → school-mock select · related → twin/school-ai 저장 · 관리자 저장 경로 | 경로별 수동 검증, 숙제 생성 409 회귀 없음 |
| 7 (선택) | sweep `--apply`: 전체 뱅크 **마킹만**(safe fix + 격리) 일괄 실행 → 코칭 밖 학생 경로도 즉시 정화 | 결정 D4 |
| 8 | 배포 — AGENTS.md 절차(관련 파일만 커밋 → push → Vercel success 확인) | |

---

## 12. 선행 조건과 위험

- **미커밋 작업이 많다.** 학교별 모고 탭 전체, `KaTeXRenderer.tsx`(약 1,400줄 변경), `ContentRenderer`, 렌더 파이프라인, unit-mock 라우트가 커밋되지 않았다. 이 기능은 unit-mock 라우트와 렌더 파이프라인을 건드리므로 **먼저 커밋 범위를 정리해야 충돌·혼입이 없다.** `package.json`의 prebuild가 미추적 테스트 파일(`test_coaching_replacement_summary`, `test_school_mock_core`)을 참조하니 함께 커밋해야 빌드가 깨지지 않는다.
- **렌더 사본 불일치:** 게이트가 학생 화면과 다른 파이프라인으로 검사하면 엉뚱한 판정이 난다. 동등성 테스트로 막고, 장기적으로 단일 모듈화한다.
- **정답 자체가 틀린 문제는 여전히 못 잡는다.** N3는 해설과 정답이 서로 어긋날 때만 잡는다. 해설도 같이 틀렸으면 못 잡는다 → 수동 신고가 유일한 방어선이다.
- **격리의 파급:** 격리는 학생 화면에서도 빠진다. block 규칙 오탐 0 원칙(§2.1)과 shadow 기간이 이를 통제한다.
- **이미지 검사의 외부 의존:** 스토리지 일시 장애 시 대량 격리가 나지 않도록 404/403만 block, 나머지는 warn으로 둔다.
- **스냅샷 비전파**는 의도된 한계다(§6.4).

---

## 13. 결정 사항 (구현 전 확정 필요)

| # | 질문 | 추천 |
|---|---|---|
| D1 | guarded 수정(₩→\ 등)을 자동 적용할까? | **아니오** — 수정안만 저장, 검토 화면에서 일괄 적용 |
| D2 | 깨끗한 대체 후보가 없을 때 의심 문항을 배지 달고 쓸까, 빈칸으로 둘까? | **배지 달고 사용** + 알림 |
| D3 | 수동 신고 = 즉시 격리? | **즉시 격리 + 자동 교체** |
| D4 | 단계 7(전체 뱅크 일괄 마킹)을 할까? | dry-run(단계 2) 결과를 보고 결정 |
| D5 | 마이그레이션 1건(테이블 2개) 추가 승인 | 필요 — 원본 백업과 오탐 해제 기록이 없으면 "되돌리기·한꺼번에 고치기"가 성립하지 않는다 |

결정 기록 (2026-11-04): D1·D2·D3·D5는 추천안으로 진행. D4는 단계 2 dry-run 결과를 본 뒤 결정.

---

## 14. 구현 기록

### 14.1 단계 1 완료 (2026-11-04)

| 파일 | 내용 |
|---|---|
| `src/lib/questions/qualityGateCore.mjs` (+ `.d.mts`, 배럴 `qualityGate.ts`) | 규칙 카탈로그 `GATE_RULES`, `inspectQuestion`, `applySafeFixes`/`checkFixInvariants`, `guardedProposals`/`applyProposal`, `contentFingerprint`, `checkImages`(fetch 주입), `selectWithGate`(off/shadow/enforce) |
| `tests/test_quality_gate_core.mjs` | 52케이스. `npm run test:quality-gate`, prebuild 체인 끝에 편입 |
| `scripts/quality_gate_sweep_readonly.mjs` | 전체 뱅크 dry-run (DB 쓰기 0). `npm run questions:gate-sweep`, `--ids a,b` 표본 상세, `--images` 이미지 HEAD, `--all-status` |

검증: 기존 테스트 5종과 신규 테스트가 모두 통과했고, `tsc --noEmit`도 통과했다. 아직 어떤 라우트도 코어를 import하지 않으므로 **사이트 동작 변화는 0**이다.

설계 대비 변경점:
- **렌더 파이프라인 이동 보류(§4.1):** `scripts/lib/render_pipeline.mjs`에 미커밋 변경이 507줄 있어서, 지금 옮기면 KaTeX 재작성 작업과 섞인다. 코어가 기존 경로를 직접 import하고, 이동은 그 작업이 커밋된 뒤에 한다.
- **코어가 `src/lib/admin/schoolMockCore.mjs`(미커밋)의 `evalClosedForm`을 import한다.** 따라서 게이트는 학교별 모고 작업과 같이, 또는 그 뒤에 커밋해야 한다.
- **`$` 홀수 처리 세분화:** 렌더러(`normalizeMathDelimiters`)가 고아 `$` 하나를 지워 복구하므로 홀수라도 화면에 `$`가 안 남는 경우가 있다. 이 경우는 `math_delimiter_repaired`(suspect)로 두고, 화면에 실제로 `$`가 보일 때만 `unbalanced_math_delimiter`(block)로 본다. 복구로 생기는 `^`·`_` 노출은 `sub_sup_outside_math`(suspect)로 잡는다.
- **수식 구간 검사는 정규화(렌더) 결과 기준**으로 한다. 저장값 기준으로 보면 렌더러가 고치는 것까지 오류로 잡혀 오탐이 난다.
- **N8(주관식 답 형식)은 제외했다.** 서술형 정답이 정상인 문항과 구분할 근거가 없다.
- **guarded 수정안 추가:** N1 → 짝 라벨 오타 교정(예: `다`→`ㄷ`), N2 → 첫 진술 앞에 `<보기>` 줄 삽입(삽입 결과가 실제 보기 박스로 렌더될 때만). 둘 다 자동 적용하지 않고 검토 화면에서 승인한다.
- **자동수정은 반드시 DB 행 기준**으로 저장한다. `fromQuestionDb`가 주관식 선지를 비우므로, 레코드로 만든 패치를 쓰면 원래 선지가 지워질 수 있다. 코어 JSDoc에 명시했다.

### 14.2 오프라인 사전 측정 (2026-08-25 뱅크 텍스트 스냅샷 `tmp/scratch/bank.json`, 5,533문항)

스냅샷에는 정답 id·이미지·콘텐츠 유형이 없다. 그래서 그 필드에 의존하는 규칙은 제외하고 텍스트·렌더 규칙만 측정했다. 실DB dry-run(단계 2)이 최종 판단 근거다.

- 속도: **1.1~1.6 ms/문항** (60문항 문제지 기준 0.1초 미만)
- text·render block 규칙 적중 **0건** → 이 규칙들은 실데이터에서 오탐 0
- `print_clip_risk`(warn) 177 · `option_label_position_mismatch` 1
- **N1 `view_label_missing` 1건 — 진짜 오류:** `q-white-final-a-r04-10` 선지②가 `ㄱ,다`(→ `ㄱ,ㄷ`). 수정안이 정확히 나온다
- **N2 `view_block_not_detected` 31건**(30건 수정안 있음): 보기 진술이 박스 없이 줄글로 렌더됨. 국민대(2019~2021)·경희대·숙명여대 기출과 데일리 선형대수가 많다. 이미지 유무를 모르는 상태의 상한값이므로 실DB에서는 줄 수 있다
- `figure_reference_without_image` 17 (상한값, 이미지 정보 없음)

**해석:** 기존 감사처럼 텍스트 렌더 깨짐은 거의 없다. 사용자가 본 "박스·선지 오류"는 N1·N2가 겨냥한 구조 오류와 맞아떨어진다. 나머지는 실DB dry-run과 표본으로 확인한다.

### 14.3 실DB dry-run (2026-11-04, 승인 문항 5,515, `tmp/run_gate_sweep.cmd`로 사용자 PC에서 실행)

- 8.2초 (1.5 ms/문항). **block 0건**, 자동수정 대상 0건. 이미지 116개(외부 경로 43 + 내장 data URL 73) 모두 정상
- 보정 과정:
  1. N3 첫 판 → 해설 괄호 안 곁가지 메모·개수형 해설 때문에 오탐 다수 → 괄호 깊이 0 수식만, `참고` 뒤 제외, 진술형·"답: n" 표기 해설 제외
  2. `schoolMockCore.normalizeMathText`의 근호 버그 발견: `\sqrt 2+1`을 √(2+1)로, `\sqrt 2\pi`를 √(2π)로 읽음 → 게이트 쪽 `evalValue` 전처리로 우회. **학교별 모고 AI 정답 비교기에도 같은 버그가 있다(별도 수정 필요)**
  3. 신규 규칙 `explanation_backtrack`(suspect): "정정:", "답지에 따라", "결과 정리하면", "$…$? 다시" 같은 초안 흔적
- 최종 suspect 적중과 1차 판정 (`tmp/audit/quality_gate_suspect_review.json`, verdict 칸):

| 규칙 | 적중 | 오류 추정 | 오탐 추정 | 확인 필요 |
|---|---|---|---|---|
| explanation_backtrack | 12 | 11 | 0 | 1 |
| answer_key_mismatch_numeric | 6 | 4 | 2 | 0 |
| no_option_matches_explanation | 17 | 5 | 9 | 3 |
| view_label_missing | 1 | 1 | 0 | 0 |
| view_block_not_detected | 30 | — | — | 30 (박스 없는 렌더 — 사용자 확인) |
| option_label_position_mismatch | 1 | — | — | 1 |

- 대표 실오류: 선지 오타 `q-white-final-a-r04-10`(ㄱ,다)·`q-ryu-self-warmup-r03-14`(37/√37), 정답 키 의심 `q-ryu-self-warmup-r13-19`·`q-daily-mv-r30-4`·`q-daily-int-r30-5`, 해설 자기모순 `q-2025-sejong-07`·`q-2022am-dankook-49` 외
- `explanation_backtrack`은 정밀도가 높다(11/12). 이 규칙은 학생 화면에 초안 문구가 그대로 보이는 문제이므로 block 승격 후보다 — 사용자 결정

### 14.4 2단계 — 단원 모고 연결 (2026-11-04)

| 파일 | 내용 |
|---|---|
| `supabase/migrations/20261104_question_quality_gate.sql` | events·clearances 테이블, RPC 3개(`quality_gate_record_suspect`·`quality_gate_quarantine`·`quality_gate_autofix` — 상태 변경과 로그를 한 트랜잭션으로), service_role 전용, `app_settings.quality_gate_mode='shadow'` 기본값. **아직 DB에 적용하지 않음** |
| `src/lib/questions/qualityGateServer.ts` | `createQualityGateSession`: 모드 조회, 오탐 해제 목록, 이미지 확인(요청당 8초 예산), enforce 쓰기(DB 행 재조회 → CAS 자동수정 / 격리 / 의심 기록). enforce인데 로그 테이블이 없으면 **자동으로 shadow로 내려감**(`downgradeReason: "migration_missing"`) |
| `src/lib/questions/qualityGateSummary.mjs` | 알림용 한 줄 요약. import 없음 — 클라이언트 번들에 코어·KaTeX가 끌려오지 않게 분리 |
| `app/api/admin/coaching/unit-mock/route.ts` | 섹션 선택과 widen 단계를 `gate.select`로 감쌈. 응답에 `qualityGate` 추가 (기존 필드 의미 불변) |
| `AdminCoachingClient.tsx` | 생성·교체 알림 끝에 게이트 요약 (예: `품질 검사(검사만) 12문항 · 의심 1`) |

검증:
- 테스트 6종 통과, `tsc --noEmit` 통과
- 실DB 스냅샷 + 실제 `selectUnitMockCandidates`로 시뮬레이션 30회(5과목 × 난이도 3 × shadow/enforce):
  - shadow는 기존 선택과 **완전히 같음**
  - enforce는 문항 수가 같고, block 문항을 반환하지 않으며, suspect 2건을 피해 대체함
  - 1회 2초 이내, 실제로 검사하는 문항은 회당 약 10개(뽑힌 것만)
- 실제 HTTP 호출 검증은 배포 후(또는 PC에서 `npm run dev`)에 한다. 이 작업 환경에서는 Supabase에 접속할 수 없다

현재 동작: 마이그레이션 전이라 모드 조회가 실패하므로 **shadow(검사·보고만)**. DB 쓰기는 0이다.

### 14.5 최신 master로 포팅 (2026-11-04)

배포 직전에 확인해 보니, 이 기능을 만든 폴더는 GitHub master보다 6커밋 뒤처진 옛 사본이었다. 원격에는 `fbeaae00 Fix question boxes and narrow-screen math overflow`(11/2)가 들어가 있었다. 이 커밋은 KaTeXRenderer를 재작성하고 보기 박스 판정을 `src/lib/math/viewBlocks.mjs`로 분리했다. 그래서 다음처럼 정리했다:

- **게이트만** 최신 master 기반 워크트리(`.wt/quality-gate`, 브랜치 `quality-gate`)로 옮겼다. 옛 폴더의 미커밋 렌더러 재작성과 학교별 모고 작업은 포함하지 않는다(학교 모고는 나중에 별도로 포팅).
- 학교 모고 코어 의존을 제거했다. `evalClosedForm`/`normalizeMathText`를 `src/lib/questions/closedForm.mjs`로 옮기면서 근호 파싱 버그(`\sqrt 2+1` → √(2+1))도 고쳤다. 원본 `schoolMockCore.mjs`에는 이 버그가 아직 남아 있어서, 학교 모고를 포팅할 때 같이 고쳐야 한다.
- 최신 렌더러 기준으로 동작이 바뀐 부분:
  - 홀수 `$`를 렌더러가 복구하지 않고 그대로 찍는다. 그래서 `unbalanced_math_delimiter`(block)로 판정한다. 실DB 적중은 0건이다.
  - "보기" 단어 없이 줄글로 쓴 보기 진술도 박스로 그린다. 그래서 N2 적중이 **30 → 0**이 됐다(박스 오류는 원격 커밋으로 해결).
  - `inspectRender`가 폭 추정(layouts)을 주지 않는다. 그래서 N6(`print_clip_risk`)는 동작하지 않는다(좁은 화면 넘침은 원격 렌더러가 처리).
- 테스트는 렌더러 판본에 관계없이 "렌더러가 박스를 만들면 이슈 없음, 못 만들면 이슈"를 확인하도록 고쳤다.
- 검증: `tsc --noEmit` 통과, 기존 테스트(standalone·unit-mock·render·electronics)와 게이트 53케이스 통과, 실DB 스냅샷 시뮬레이션 30회 문제 0건.
- 최신 렌더러 기준 실DB suspect: explanation_backtrack 12 · no_option_matches_explanation 17 · answer_key_mismatch_numeric 6 · view_label_missing 1 · option_label_position_mismatch 1. block 0.

### 14.6 배포 후 독립 검토와 후속 패치 (2026-11-04)

`1efe6a77` 배포 후 읽기 전용 독립 검토를 했다(4개 관점, 중간 등급 지적은 반박 검증). 현재 데이터 기준으로 서비스를 막거나 데이터를 망가뜨릴 문제는 없었다. 아래 게이트 오류는 깨진 값이 들어올 때만 터지는 잠재 결함이었다.

- shadow: 이전·새 라우트를 같은 입력으로 1,640회 비교했다. 응답은 `qualityGate` 외에 같고, DB 쓰기는 0이다.
- 입력 경로: 승인 문항 5,515건 전부 sweep 경로와 실제 `fromQuestionDb` 경로의 판정이 같다. block 0 · fix 0 · warn 0 · suspect 35.
- 한계: 가짜 Supabase와 2026-11-04 02:41 스냅샷 기준이다. 실제 DB와 Next 번들은 타지 않았다.

이 패치에서 고친 것:

| 항목 | 내용 |
|---|---|
| 게이트 오류 격리 | `selectWithGate`가 검사기·쓰기 콜백의 예외를 잡아 `report.gateFailed`로 보고하고 출제를 계속한다. 판정하지 못한 문항은 이슈 없는 문항으로 취급한다. `checkImages`의 `new URL()`도 try 안으로 옮겼다. 전에는 이미지 값이 `//`처럼 깨진 문항이 뽑히면 요청 전체가 500이었다 |
| 결과 로그 | 문항을 1개 이상 검사하고 정상 응답한 요청마다 `gate.response()`가 `[quality-gate]` JSON 한 줄을 남긴다. 문항 id, 규칙 코드, 모드·버전·건수, 오류 단계와 오류 메시지가 들어가고 문항 본문은 없다. DB 쓰기는 여전히 0이다 |
| 경고 문구 | 모든 경고가 `인쇄 잘림 주의`로 나오던 것을 사유별로 표시한다(`해설 없음 n`, `이미지 확인 실패 n`). 게이트 오류는 `검사 오류 n` |

Vercel 런타임 로그는 보관 기간이 짧다(Hobby 1시간, Pro 1일, Observability Plus 30일). 며칠 치 판단 자료로는 `npm run questions:gate-sweep`(뱅크 전체 점검, 읽기 전용)이 더 정확하다.

enforce 전에 알아둘 것 (이 패치에서 고치지 않음):

- `enforce` 값은 마이그레이션 뒤에 넣는다. 마이그레이션이 `ON CONFLICT DO NOTHING`이라 미리 넣은 값을 그대로 두고, 적용 즉시 enforce가 켜진다.
- 이미지 확인은 설계의 "병렬 6, 요청당 총 8초 상한"과 달리 순차이고, 8초 검사는 문항을 시작할 때만 한다. 현재 데이터(이미지 문항 43건, 문항당 1장) 기준으로 이미지 서버가 응답하지 않으면 요청이 9~11초까지 늘어날 수 있다(평소 +0.1~0.2초). 문항당 이미지가 늘면 더 길어진다.
- HEAD 403/404/410은 block이고, 오탐 해제 목록은 이미지 이슈에 적용되지 않는다. 방화벽이 HEAD를 403으로 막으면 정상 이미지 문항도 격리된다.
- 격리 문항을 관리자 화면에서 저장하거나 `scripts/validate_question_quality.mjs --apply --all`을 돌리면 재검사 없이 `approved`로 돌아간다. §6.4의 저장 시 재검사는 아직 구현하지 않았다.
- shadow 보고는 block 문항의 fix·warn도 함께 센다. 그래서 `자동 수정 대상`이 enforce 때보다 많게 나올 수 있다.

### 14.7 운영 런북 — 마이그레이션 적용 · enforce 전환 · 되돌리기

독립 검토에서 마이그레이션 SQL을 읽고 작성한 초안이다. **실제 DB에서 실행해 본 적 없다.** 코드 블록은 하나씩 따로 실행한다. 여러 블록을 붙여서 실행하면 안 된다. 특히 5번의 블록들은 서로 다른 상황을 위한 선택지다. 함께 실행하면 모드 변경이 취소되거나 격리가 전부 풀릴 수 있다.

설계 §11의 clearances 시드는 스크립트가 없어서 이 절차에 넣지 않았다. 사람이 이미 오탐으로 판단한 결과는 넘어오지 않는다.

#### 1. 사전 확인

기대값은 주석에 있다. 모드가 `enforce`로 나오면 5번의 "쓰기 멈춤" 문장으로 먼저 `shadow`로 바꾼다. 그대로 마이그레이션을 적용하면 적용 즉시 enforce가 켜진다.

```sql
select table_name, column_name, data_type from information_schema.columns where table_schema='public' and ((table_name='questions' and column_name in ('id','updated_at','options','question','explanation','answer_text','quality_status','quality_reasons','validated_at','validator_version')) or (table_name='app_settings' and column_name in ('key','value','updated_at'))) order by 1,2;
-- expect questions.id text, updated_at timestamp with time zone, options jsonb, app_settings.value text
select tgname from pg_trigger where tgrelid='public.questions'::regclass and not tgisinternal;  -- expect 0 rows
select value from public.app_settings where key='quality_gate_mode';  -- expect 0 rows or shadow
```

#### 2. 마이그레이션 적용

사용이 적은 시간에 `supabase/migrations/20261104_question_quality_gate.sql`을 SQL 에디터에서 실행한다. `questions` 외래키를 만들 때 짧은 잠금이 걸린다. 그다음 결과를 확인한다.

```sql
-- if the app shows PGRST202/205: notify pgrst, 'reload schema';
select to_regclass('public.question_quality_events') is not null as events, to_regclass('public.question_quality_clearances') is not null as clearances, (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'quality\_gate\_%') as rpcs, (select value from public.app_settings where key='quality_gate_mode') as mode;  -- true,true,3,shadow
select p.proname, has_function_privilege('anon',p.oid,'EXECUTE') anon, has_function_privilege('authenticated',p.oid,'EXECUTE') auth, has_function_privilege('service_role',p.oid,'EXECUTE') svc from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'quality\_gate\_%';  -- f,f,t x3
select c.relname, c.relrowsecurity rls_on, has_table_privilege('anon',c.oid,'SELECT') anon, has_table_privilege('authenticated',c.oid,'SELECT') auth, has_table_privilege('service_role',c.oid,'SELECT') svc from pg_class c where c.oid in ('public.question_quality_events'::regclass,'public.question_quality_clearances'::regclass);  -- t,f,f,t
```

스모크 테스트는 따로 실행한다. 값을 보여 주려고 일부러 예외로 끝나며, 변경 내용은 모두 롤백된다.

```sql
do $$ declare qid text; ts text; body text; s1 boolean; s2 boolean; a1 text; a2 text; q1 boolean; q2 boolean;
begin
  select id, updated_at::text, explanation into qid, ts, body from public.questions where quality_status='approved' and explanation is not null order by id limit 1;
  s1 := public.quality_gate_record_suspect(qid, array['smoke'], '{}'::jsonb, 'smoke-fp', 'smoke', 'manual', null);
  s2 := public.quality_gate_record_suspect(qid, array['smoke'], '{}'::jsonb, 'smoke-fp', 'smoke', 'manual', null);
  a1 := public.quality_gate_autofix(qid, ts, jsonb_build_object('explanation', body), '{"codes":["smoke"],"fields":[]}'::jsonb, 'smoke-fp', 'smoke', 'manual', null);
  a2 := public.quality_gate_autofix(qid, ts, jsonb_build_object('explanation', body), '{"codes":["smoke"],"fields":[]}'::jsonb, 'smoke-fp', 'smoke', 'manual', null);
  q1 := public.quality_gate_quarantine(qid, array['smoke'], '{}'::jsonb, 'smoke-fp', 'smoke', 'manual', null, 'quarantine');
  q2 := public.quality_gate_quarantine(qid, array['smoke'], '{}'::jsonb, 'smoke-fp', 'smoke', 'manual', null, 'quarantine');
  raise exception 'SMOKE (rolled back) suspect=%/% autofix=%/% quarantine=%/%  expect t/f, <timestamp>/<null>, t/f', s1, s2, a1, a2, q1, q2;
end $$;
```

아직 shadow인 상태로 문제지를 만들어, 알림이 `품질 검사(검사만)`으로 유지되는지 본다.

#### 3. enforce 전환

값에 따옴표가 들어가면 안 된다. `exact`가 `t`이고 알림에서 `(검사만)`이 사라지면 된다.

```sql
insert into public.app_settings (key, value) values ('quality_gate_mode','enforce') on conflict (key) do update set value=excluded.value, updated_at=now();
select value, value='enforce' as exact from public.app_settings where key='quality_gate_mode';  -- exact = t
```

#### 4. 관찰

알림의 `기록 실패 n`은 RPC 오류다.

```sql
select event, count(*) n, max(created_at) last_at from public.question_quality_events group by event order by n desc;
select q.id, q.quality_reasons, e.created_at, e.context, e.details->'issues'->0->>'evidence' as evidence from public.questions q join lateral (select * from public.question_quality_events x where x.question_id=q.id and x.event in ('quarantine','report') order by x.created_at desc limit 1) e on true where q.quality_status='quarantined' and q.validator_version like 'gate-%' order by e.created_at desc;
select e.created_at, e.question_id, e.codes, jsonb_pretty(e.details->'fields') as changes from public.question_quality_events e where e.event='autofix' order by e.created_at desc limit 50;
select e.question_id, e.codes, e.details->'issues'->0->>'evidence' as evidence from public.question_quality_events e where e.event='suspect' order by e.created_at desc;
```

#### 5. 되돌리기

문제가 생기면 **먼저 쓰기를 멈춘다.** 이 문장만 단독으로 실행한다. 모드 변경은 다음 요청부터 적용된다. `shadow` 대신 `off`를 넣으면 게이트를 완전히 끈다.

```sql
insert into public.app_settings (key, value) values ('quality_gate_mode','shadow') on conflict (key) do update set value=excluded.value, updated_at=now();
```

그다음 필요한 것만 골라 실행한다. `Q_ID`, `EVENT_ID`는 실제 값으로 바꾼다. 아래 되돌리기는 이벤트 로그에 남지 않는다.

오탐 한 건을 풀고 다시 격리되지 않게 하기. 이미지 이슈에는 해제 목록이 듣지 않는다(§14.6).

```sql
insert into public.question_quality_clearances (question_id, code, fingerprint, note) select e.question_id, c.code, e.fingerprint, 'false positive' from (select distinct on (question_id) * from public.question_quality_events where event='quarantine' and question_id='Q_ID' order by question_id, created_at desc) e cross join lateral unnest(e.codes) as c(code) on conflict do nothing;
update public.questions set quality_status='approved', quality_reasons='{}', validated_at=now(), validator_version='manual-release' where id='Q_ID' and quality_status='quarantined';
```

자동수정 한 건 되돌리기. `option:N` 필드는 `details->'fields'`의 before 값을 손으로 옮긴다. 해제 목록도 넣어야 enforce에서 같은 수정이 다시 적용되지 않는다.

```sql
update public.questions q set question=coalesce((select f->>'before' from jsonb_array_elements(e.details->'fields') f where f->>'field'='question' limit 1), q.question), explanation=coalesce((select f->>'before' from jsonb_array_elements(e.details->'fields') f where f->>'field'='explanation' limit 1), q.explanation), answer_text=coalesce((select f->>'before' from jsonb_array_elements(e.details->'fields') f where f->>'field'='answer_text' limit 1), q.answer_text), updated_at=now() from public.question_quality_events e where e.id=EVENT_ID and e.event='autofix' and q.id=e.question_id;
insert into public.question_quality_clearances (question_id, code, fingerprint, note) select e.question_id, c.code, e.fingerprint, 'autofix reverted' from public.question_quality_events e cross join lateral unnest(e.codes) as c(code) where e.id=EVENT_ID and e.event='autofix' on conflict do nothing;
```

게이트 격리 전부 풀기. 게이트를 포기할 때만 쓴다.

```sql
update public.questions q set quality_status='approved', quality_reasons='{}', validated_at=now(), validator_version='gate-rollback' where q.quality_status='quarantined' and q.validator_version like 'gate-%' and exists (select 1 from public.question_quality_events e where e.question_id=q.id and e.event in ('quarantine','report'));
```

### 14.8 첫 품질 점검 (2026-11-04 19:53)

`questions:gate-sweep --dump --images`를 워크트리 코드로 돌렸다. 승인 문항 5,515건에서 block 0 · fix 0 · warn 0 · suspect 35(이슈 37건)가 나왔다. 02:41 스냅샷과 비교해 바뀐 문항과 새로 잡힌 문항은 없었다.

의심 35건은 정답을 보기 전에 직접 풀어서 정답 키와 대조했다. 고칠 결론이 나온 16건은 다른 풀이자가 앞선 결론을 모른 채 다시 풀었고, 전부 일치했다.

| 결과 | 건수 |
|---|---|
| 오탐 (정답·해설 정상) | 14 |
| 해설에 초안 문구 | 5 |
| 해설 오류 (정답은 맞음) | 4 |
| 정답 키 오류 | 3 |
| 선지 오류 | 3 |
| 지문 오류 (그대로는 맞는 선지가 없음) | 6 |

오탐 14건 중 3건은 `closedForm`이 지수 중괄호를 버리던 버그(`10^{3/2}` → `10^3/2`)였고 이번에 고쳤다. 전 문항 비교에서 그 3건만 사라지고 새로 잡힌 문항은 없었다. 같은 버그가 `schoolMockCore.mjs`에도 있으니 학교 모고를 포팅할 때 함께 고친다. 나머지 11건은 해설의 마지막 수식이 답이 아닌 경우처럼 문항별 사정이라, 규칙을 고치지 않고 마이그레이션 뒤 `question_quality_clearances`로 해제한다.

지문 오류 6건의 복원안은 정답 키에서 거꾸로 추정한 것이다. 저장소에 시험지 원본이 없어서 대조 전에는 적용하지 않는다.

결과 원본은 `tmp/audit/sweep_20261104_1953/`에 있다(커밋하지 않음). 워크트리에서 sweep을 돌릴 때는 `.env.local`을 임시 하드링크로 연결하고, 끝나면 지운다. 결과 파일은 `tmp/` 아래에 생기므로 커밋 전에 옮긴다.
