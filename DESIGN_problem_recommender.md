# 편입수학 문제 추천 프로그램 설계

## 1. 목표

여러 문제집 PDF, 이미지, 문서 파일을 업로드하면 문제 단위로 분리하고, 각 문제에 대해 이미지, OCR 텍스트, 과목/단원/유형/난이도 추천값을 만든다. 자동 추천값은 바로 확정 저장하지 않고, 사용자가 검토/수정한 뒤 최종 문제 DB에 저장한다.

검색/추천 단계에서는 문제 이미지, OCR 텍스트, 단원/유형 태그, 난이도, 풀이 아이디어, 공식, 이미지 구조 유사도를 함께 사용해 관련 문제를 추천한다.

핵심 원칙:

- 원본 문제 이미지는 반드시 저장한다.
- OCR과 자동 분류는 확정값이 아니라 추천값이다.
- 문제 하나는 여러 단원/태그에 걸칠 수 있다.
- 사용자의 수정 이력은 다음 자동 추천에 반영한다.
- 문제집 원본 순서와 단원별 재정렬 순서를 모두 보존한다.

## 2. 전체 구조

```text
파일 업로드
  -> 원본 저장
  -> PDF/문서 페이지 이미지 변환
  -> 문제 자동/수동 분리
  -> 문제 이미지 crop 저장
  -> OCR 텍스트 추출
  -> 이미지 feature 생성
  -> 자동 분류 추천
  -> staged_problems에 임시 저장
  -> 자동 분류 검토 화면
  -> 사용자가 수정/확정
  -> problems에 최종 저장
  -> 검색/추천/관리 화면에서 사용
```

권장 앱 구조:

```text
app/
  main.py
  pages/
    upload.py
    review.py
    manage.py
    search.py
    detail.py
  core/
    ingest.py
    ocr.py
    segmentation.py
    classifier.py
    image_similarity.py
    recommender.py
    taxonomy.py
  db/
    database.py
    models.py
    migrations.py
  storage/
    originals/
    pages/
    problems/
    solutions/
```

MVP에서는 Streamlit + SQLite로 충분하다. 데이터가 커지면 FastAPI + PostgreSQL + pgvector 또는 Qdrant/Chroma로 분리한다.

## 3. 데이터베이스 구조

### problems

최종 확정된 문제만 저장한다.

```sql
CREATE TABLE problems (
  id TEXT PRIMARY KEY,
  subject TEXT,
  chapter TEXT,
  section TEXT,
  topic_tags_json TEXT,
  related_units_json TEXT,
  is_composite INTEGER DEFAULT 0,
  difficulty_level INTEGER,
  difficulty_label TEXT,
  difficulty_reason TEXT,
  calculation_load INTEGER,
  concept_importance INTEGER,
  frequency_score INTEGER,
  importance_score INTEGER,
  source_file_name TEXT,
  source_file_path TEXT,
  source_page INTEGER,
  source_order INTEGER,
  problem_number TEXT,
  problem_image_path TEXT NOT NULL,
  ocr_text TEXT,
  clean_text TEXT,
  answer TEXT,
  solution_text TEXT,
  solution_image_path TEXT,
  formulas_json TEXT,
  concepts_json TEXT,
  solving_method TEXT,
  common_mistakes_json TEXT,
  image_feature_json TEXT,
  text_embedding_json TEXT,
  created_at TEXT,
  updated_at TEXT
);
```

### staged_problems

업로드 후 자동 추천값을 임시 보관한다. 사용자가 저장하기 전까지 최종 DB에 들어가지 않는다.

```sql
CREATE TABLE staged_problems (
  id TEXT PRIMARY KEY,
  upload_batch_id TEXT,
  source_file_name TEXT,
  source_file_path TEXT,
  source_page INTEGER,
  source_order INTEGER,
  problem_number TEXT,
  problem_image_path TEXT NOT NULL,
  ocr_text TEXT,
  suggested_subject TEXT,
  suggested_chapter TEXT,
  suggested_section TEXT,
  suggested_topic_tags_json TEXT,
  suggested_difficulty_level INTEGER,
  suggested_difficulty_reason TEXT,
  suggested_related_units_json TEXT,
  suggested_is_composite INTEGER,
  suggestion_reason TEXT,
  confidence_score REAL,
  needs_review INTEGER DEFAULT 1,
  image_feature_json TEXT,
  created_at TEXT
);
```

### classification_feedback

사용자가 자동 추천을 수정한 기록이다. 이후 비슷한 문제 자동 추천에 반영한다.

```sql
CREATE TABLE classification_feedback (
  id TEXT PRIMARY KEY,
  problem_id TEXT,
  staged_problem_id TEXT,
  image_feature_json TEXT,
  ocr_text TEXT,
  predicted_subject TEXT,
  corrected_subject TEXT,
  predicted_chapter TEXT,
  corrected_chapter TEXT,
  predicted_section TEXT,
  corrected_section TEXT,
  predicted_tags_json TEXT,
  corrected_tags_json TEXT,
  predicted_difficulty_level INTEGER,
  corrected_difficulty_level INTEGER,
  created_at TEXT
);
```

### taxonomy

단원 체계는 코드 상수로 시작하고, 나중에는 DB 테이블로 옮긴다.

```python
TAXONOMY = {
    "미분학": {
        "함수": ["함수 합성", "역함수"],
        "극한과 연속": ["극한 계산", "연속성 판정"],
        "미분": ["미분계수 정의", "도함수 계산"],
        "접선의 방정식": ["접선 방정식"],
        "평균값의 정리 및 로피탈 정리": ["로피탈 정리"],
        "Taylor급수": ["Taylor 전개"],
        "곡선의 개형": ["그래프 개형"],
        "최대/최소": ["최대최소"],
        "순간변화율": [],
        "추가내용": [],
    },
    "적분학": {
        "부정적분": ["치환적분", "부분적분", "삼각치환"],
        "정적분의 계산": ["정적분 계산"],
        "특이적분": ["특이적분"],
        "정적분의 응용": ["넓이", "부피"],
        "극좌표와 응용": ["극좌표"],
    },
    "선형대수": {
        "행렬": ["행렬식", "역행렬", "rank"],
        "고유치와 대각화": ["고유치", "대각화"],
        "선형사상": ["선형변환"],
    },
    "다변수함수": {
        "편도함수": ["편미분"],
        "경도 및 방향도함수": ["방향도함수"],
        "Taylor급수와 최대/최소": ["다변수 Taylor", "최대최소"],
        "중적분": ["중적분", "극좌표"],
    },
    "공학수학 I": {
        "미분방정식": ["1계 미분방정식", "2계 미분방정식"],
        "Laplace변환": ["Laplace 변환", "Laplace 역변환"],
        "Fourier급수": ["Fourier 급수"],
    },
}
```

## 4. 자동 분류 추천 알고리즘

자동 분류는 점수 기반으로 시작한다.

입력:

- OCR 텍스트
- 이미지 구조 feature
- 문제 원본 파일명
- 원본 페이지 주변 문맥
- 사용자가 이전에 수정한 feedback
- 수식/키워드 패턴

출력:

```python
ClassificationSuggestion {
  subject_candidates: list[str]
  chapter_candidates: list[str]
  section_candidates: list[str]
  topic_tags: list[str]
  difficulty_level: int
  difficulty_reason: str
  related_units: list[str]
  is_composite: bool
  reason: str
  confidence: float
  needs_review: bool
}
```

### 과목/단원/태그 추천

규칙 예시:

- `lim`, `극한`, `연속`, `로피탈` -> 미분학 / 극한과 연속 또는 평균값의 정리 및 로피탈 정리
- `Taylor`, `Maclaurin`, `전개` -> 미분학 Taylor급수 또는 적분학 Maclaurin급수의 응용
- `∫`, `적분`, `부분적분`, `치환` -> 적분학
- `det`, `rank`, `행렬`, `고유치`, `대각화` -> 선형대수
- `편미분`, `gradient`, `방향도함수`, `중적분` -> 다변수함수
- `Laplace`, `Fourier`, `미분방정식` -> 공학수학 I

여러 단원 점수가 비슷하면 확정하지 않는다.

```text
최고 점수와 2위 점수 차이가 작음
  -> 복합단원 또는 확인 필요
  -> 추천 과목: 미분학 또는 다변수함수
  -> 신뢰도: 낮음
```

### 난이도 추천

점수 요소:

- 개념 수: 태그 개수, 관련 단원 개수
- 계산량: 수식 길이, 적분/행렬/미분 연산 개수
- 풀이 단계: 조건 수, 문장 복잡도
- 발상 필요: 증명, 보이라, 적당한 치환, 특수 공식
- 실수 유발: 절댓값, 특이점, 극한-적분 교환, 행렬 계산
- 복합단원 여부

예시:

```python
raw = (
    1
    + concept_count * 0.7
    + calculation_load * 0.5
    + multi_step_score * 0.5
    + insight_score * 0.8
    + mistake_risk * 0.4
    + composite_bonus
)
difficulty = clamp(round(raw), 1, 5)
```

## 5. 사용자 수정 반영

처음에는 간단한 k-NN 방식으로 충분하다.

1. 사용자가 추천값을 수정한다.
2. 수정 전/후를 `classification_feedback`에 저장한다.
3. 새 문제 자동 추천 시 이미지 feature와 OCR 텍스트가 비슷한 feedback을 찾는다.
4. 비슷한 feedback의 corrected 값에 가중치를 준다.

예:

```text
새 문제: Taylor 전개 수식이 있음
규칙 기반 추천: 로피탈 정리 0.55, Taylor급수 0.50
과거 feedback: 비슷한 문제를 사용자가 Taylor급수로 수정함
최종 추천: Taylor급수 0.72, 로피탈 정리 0.45
```

## 6. 추천 알고리즘

추천 점수는 규칙 점수 + 유사도 점수를 섞는다.

```text
score =
  subject_match * 10
  + chapter_match * 20
  + section_match * 25
  + tag_overlap_count * 10
  + solving_method_match * 20
  + formula_overlap_count * 15
  + difficulty_similarity * 10
  + text_similarity * 10
  + image_similarity * 10
  + adjacent_difficulty_bonus
  + learning_sequence_bonus
```

추천 등급:

1. 거의 같은 유형: section + 태그 + 이미지/수식 구조가 모두 가까움
2. 같은 개념 유사 문제: chapter/section 또는 공식이 같음
3. 같은 단원 기본 문제: 같은 chapter, 난이도 낮음
4. 같은 단원 고난도 문제: 같은 chapter, 난이도 높음
5. 연결 단원 응용 문제: related_units에 걸림

추천 이유는 점수 구성에서 자동 생성한다.

예:

```text
추천 이유: 같은 소단원(부분적분)이고, 유형 태그(부분적분, 정적분 계산)가 겹치며,
이미지상 적분식 구조가 유사합니다. 난이도는 한 단계 높아 응용 연습용입니다.
```

## 7. 화면 구성

### 업로드 화면

- PDF/이미지/문서 업로드
- 붙여넣기 이미지 입력
- 업로드 batch 표시
- 페이지 변환 상태
- 문제 자동 분리 상태
- OCR 상태
- 자동 추천 상태
- `자동 분류 검토로 이동` 버튼

### 자동 분류 검토 화면

staged_problems를 카드로 보여준다.

각 카드:

- 문제 이미지
- OCR 텍스트
- 추천 과목
- 추천 대단원
- 추천 소단원
- 추천 난이도
- 추천 유형 태그
- 추천 이유
- 신뢰도 점수
- 확인 필요 여부

수정 가능:

- 과목
- 대단원
- 소단원
- 난이도
- 유형 태그
- 정답
- 풀이
- 메모

버튼:

- `저장`
- `건너뛰기`
- `삭제`
- `비슷한 수정 사례 보기`

### 문제 관리 화면

- 과목/단원 트리
- 난이도 필터
- 태그 필터
- 출제 빈도/중요도 필터
- 문제 카드 목록
- 메타데이터 수정
- 원본 순서 보기 / 단원별 정렬 보기 전환

### 문제 검색 화면

- 문제 이미지 붙여넣기/업로드
- 문제 텍스트 입력
- 과목/단원/유형 직접 선택
- 이미지 유사도 반영 비율
- 태그/난이도 필터

### 추천 결과 화면

- 추천 순위
- 문제 이미지
- 관련도 점수
- 이미지 유사도 / 개념 유사도
- 추천 이유
- 과목/대단원/소단원
- 난이도
- 유형 태그
- 원본 파일/페이지/문제 번호
- 정답/풀이 보기 버튼

### 문제 상세 화면

- 문제 이미지
- OCR 텍스트
- clean text
- 정답
- 풀이
- 관련 문제
- 같은 단원 문제
- 같은 유형 문제
- 원본 페이지 보기

## 8. 정렬

문제 목록 정렬 옵션:

- 단원순
- 난이도순
- 관련도순
- 출제 빈도순
- 최근 업로드순
- 원본 문제집 순서
- 추천 학습 순서

단원 내부 기본 정렬:

1. Lv.1 개념 확인
2. Lv.2 기본 계산
3. Lv.3 대표 유형
4. Lv.4 응용 문제
5. Lv.5 고난도 / 킬러 문제
6. 복합단원 문제

## 9. MVP 구현 순서

### MVP 1

- 현재 Streamlit 앱 유지
- 문제 이미지 전체 저장
- OCR 텍스트 선택 저장
- 과목/대단원/소단원/난이도/태그 수동 입력
- 문제 목록 보기
- 단원별 정렬

### MVP 2

- `staged_problems` 추가
- 업로드 후 바로 최종 저장하지 않고 검토 큐에 넣기
- 자동 분류 추천값 생성
- 자동 분류 검토 화면 추가
- 사용자가 수정 후 최종 저장

### MVP 3

- OCR 텍스트 검색
- 태그/난이도 필터
- 이미지 유사도 검색
- 관련도 점수 계산
- 추천 이유 자동 생성

### MVP 4

- 풀이/정답 관리
- classification_feedback 저장
- 사용자의 수정 이력 기반 추천 보정
- 유사 문제 세트 생성
- 학습 순서 추천

### MVP 5

- Mathpix 또는 OpenAI Vision 기반 수식/LaTeX 추출
- 벡터 DB 도입
- 학생별 약점 단원 추천
- FastAPI/PostgreSQL 분리

## 10. 바로 구현할 코드 구조 예시

```python
@dataclass
class ClassificationSuggestion:
    subject: str
    chapter: str
    section: str
    topic_tags: list[str]
    difficulty_level: int | None
    difficulty_reason: str
    related_units: list[str]
    is_composite: bool
    reason: str
    confidence: float
    needs_review: bool


def suggest_classification(
    ocr_text: str,
    source_file_name: str,
    image_feature: dict | None,
    feedback_examples: list[dict],
) -> ClassificationSuggestion:
    scores = score_taxonomy_by_keywords(ocr_text, source_file_name)
    scores = apply_feedback_boost(scores, ocr_text, image_feature, feedback_examples)
    tags = suggest_topic_tags(ocr_text)
    difficulty, difficulty_reason = suggest_difficulty(ocr_text, tags, scores)
    top = pick_top_candidates(scores)

    return ClassificationSuggestion(
        subject=top.subject,
        chapter=top.chapter,
        section=top.section,
        topic_tags=tags,
        difficulty_level=difficulty,
        difficulty_reason=difficulty_reason,
        related_units=top.related_units,
        is_composite=top.is_ambiguous,
        reason=build_suggestion_reason(top, tags, difficulty_reason),
        confidence=top.confidence,
        needs_review=top.confidence < 0.7 or top.is_ambiguous,
    )
```

저장 흐름:

```python
def ingest_problem_candidate(problem_image, source_info):
    ocr_text = run_ocr(problem_image)
    feature = image_feature(problem_image)
    suggestion = suggest_classification(
        ocr_text=ocr_text,
        source_file_name=source_info.file_name,
        image_feature=feature,
        feedback_examples=load_feedback_examples(),
    )
    save_staged_problem(problem_image, ocr_text, feature, suggestion, source_info)


def confirm_staged_problem(staged_id, user_edited_metadata):
    staged = load_staged_problem(staged_id)
    problem_id = save_final_problem(staged, user_edited_metadata)
    save_classification_feedback(staged, user_edited_metadata, problem_id)
    mark_staged_as_confirmed(staged_id)
```
