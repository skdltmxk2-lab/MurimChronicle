# ???? CBT 저장소 프로젝트 인수인계 문서

작성 기준일: 2026-06-14

> 먼저 알아야 할 핵심: 이 저장소에는 서로 다른 세 프로그램이 한 루트에 섞여 있습니다.
>
> 1. `index.html`: 저장소 이름과 일치하는 단일 파일 웹 게임 **무림전기(Murim Chronicle)**
> 2. `app/`, `src/`, `package.json`: 현재 가장 큰 비중을 차지하는 Next.js 교육 서비스 **루트편입**
> 3. `streamlit_app.py`: 편입수학 문제 수집·검색용 Python/Streamlit 프로토타입
>
> `npm run dev`로 실행되는 것은 무림전기가 아니라 루트편입입니다. 이 점을 구분하지 않으면 검토 대상과 실행 결과가 완전히 달라집니다.
>
> **2026-06-14 우선순위 변경:** 출시 예정이 최소 1개월 이상 남아 있으므로 1차 수정은 보안/RLS/서버 재채점보다 AI 문제 이미지 인식률, 선택 박스 정확도, PDF·클립보드 원본 보존, 한컴오피스 호환성을 우선합니다. 보안 문제는 아래 위험 목록에 유지하되 이번 단계의 구현 범위에서는 제외합니다.

## 1. 프로그램의 목적

### 1-1. 루트편입 Next.js 서비스

이 저장소의 현재 주 개발 대상은 편입수학·편입영어 학습용 웹 서비스입니다. 실제 서비스명은 코드와 메타데이터 기준으로 `루트편입`, 운영 도메인은 `https://routrans.com`입니다.

주요 목적은 다음과 같습니다.

- 편입 준비생이 수학 문제를 단원별·과목별·실전형으로 풀 수 있게 한다.
- 시험 응시 결과와 오답을 저장하고 최근 오답 및 취약 단원을 분석한다.
- 사용자의 누적 풀이 데이터를 바탕으로 25문항 취약유형 모의고사를 자동 생성한다.
- 문제 이미지를 Gemini로 인식하여 유사 문제, AI 풀이, AI 튜터를 제공한다.
- 편입영어 단어 학습, 단어 테스트, 틀린 단어 복습을 제공한다.
- 관리자에게 문제·시험·데일리 테스트·회원·공지·문의·영단어 관리 기능을 제공한다.

주 사용자는 다음과 같습니다.

- 학생: 편입수학·편입영어를 학습하는 수험생
- 관리자: 문제 DB, 모의고사, 회원 등급, 공지와 문의를 관리하는 운영자

해결하려는 문제는 여러 교재와 시험지에 흩어진 편입 문제를 한 곳에서 CBT로 풀고, 수작업으로 하기 어려운 오답 누적·취약 분석·맞춤 출제를 자동화하는 것입니다.

### 1-2. 무림전기 단일 HTML 게임

루트 `index.html`은 외부 프레임워크 없이 HTML/CSS/JavaScript만으로 작성된 무협 RPG 데모입니다.

- 성별과 이름을 선택해 게임을 시작한다.
- 키보드로 맵을 이동하고 적과 조우한다.
- 기본 공격, 방어, 무공, 회복약, 내공단, 도주를 사용한다.
- 전투 승리로 경험치·은화·명성을 얻고 레벨업한다.
- 마을에서 전투, 수련, 상점, 주막을 이용한다.
- 스테이지와 보스를 진행하고 엔딩을 본다.

게임 상태는 서버나 DB에 저장되지 않으며 페이지를 새로고침하면 초기화됩니다.

### 1-3. Streamlit 문제 검색 프로토타입

`streamlit_app.py`는 PDF/이미지에서 편입수학 문제를 잘라 저장하고 유사 문제를 검색하는 로컬 운영 도구입니다.

- PDF 페이지 렌더링, 이미지 업로드, 클립보드 붙여넣기
- 문제 영역 자동/수동 분리
- Tesseract OCR
- 규칙 기반 또는 Gemini/OpenAI 기반 문제 분류
- 이미지 특징, OCR 텍스트, 태그를 조합한 유사 문제 검색
- SQLite와 로컬 파일시스템에 문제·해설 저장

이 프로토타입의 목적 일부가 현재 Next.js/Supabase 서비스의 문제 DB와 AI 검색 기능으로 옮겨간 것으로 보입니다.

## 2. 전체 구조

### 2-1. 기술 스택

#### 루트편입

- 언어: TypeScript, TSX, SQL, 일부 JavaScript/Node.js 스크립트
- 프레임워크: Next.js 15 App Router, React 19
- UI: Tailwind CSS 3, 전역 CSS, 반응형·다크 모드
- 수식: KaTeX
- 차트: Recharts
- 인증·DB·Realtime: Supabase Auth, PostgreSQL, Row Level Security, Supabase Realtime
- AI: Google Gemini (`@google/genai`)
- 벡터 검색: PostgreSQL `pgvector`, `gemini-embedding-001`, `match_questions` RPC
- 배포 관련: Vercel Analytics, Next.js 메타데이터·OG 이미지·sitemap·robots
- 별도 백엔드 서버: 없음. Next.js Route Handler가 백엔드 역할을 함.
- 결제 API: 없음. PRO 가입은 카카오톡 문의 후 관리자가 등급을 수동 변경하는 방식

#### 무림전기

- HTML, CSS, Vanilla JavaScript
- Canvas 2D
- Web Audio API
- 외부 라이브러리, 서버, DB 없음

#### Streamlit 프로토타입

- Python
- Streamlit
- PyMuPDF, Pillow, NumPy, scikit-learn, pytesseract
- OpenAI SDK, Google GenAI SDK
- SQLite와 로컬 파일 저장

### 2-2. 주요 폴더 구조

```text
???? CBT/
├─ app/                         Next.js App Router 페이지와 API
│  ├─ student/                 학생 화면
│  ├─ admin/                   관리자 화면
│  ├─ api/                     서버 Route Handler
│  ├─ auth/                    이메일 확인·비밀번호 재설정
│  └─ legal/                   약관·개인정보처리방침
├─ src/
│  ├─ components/              화면별 React 클라이언트 컴포넌트
│  ├─ lib/                     인증, 저장소, 채점, 출제, AI, 취약분석 로직
│  ├─ types/                   도메인 타입
│  └─ data/mockData.ts         로컬 샘플 시험 2개
├─ supabase/
│  ├─ migrations/              추가 기능용 SQL 마이그레이션
│  └─ community.sql            커뮤니티 테이블·RLS 수동 설치 SQL
├─ scripts/                    문제 업로드·검수·정제·감사 스크립트
├─ public/                     검색엔진 소유권 확인 파일
├─ streamlit_app.py            로컬 문제 수집·검색 프로토타입
├─ paste_image_component/      Streamlit 이미지 붙여넣기 커스텀 컴포넌트
├─ problem_search_data/        Streamlit 로컬 DB와 이미지 약 723MB, Git 제외
├─ index.html                  무림전기 단일 파일 게임
├─ package.json                루트편입 실행·의존성 정의
├─ requirements.txt            Streamlit 도구 Python 의존성
└─ README_problem_search.md    Streamlit 도구 실행 설명
```

현재 조사 기준으로 `scripts/`는 약 1,246개 파일/71MB, `problem_search_data/`는 약 2,787개 파일/723MB입니다. 특히 `scripts/_tmp_pdf_imgs/` 등 대량 임시 파일과 미추적 파일이 작업 트리에 남아 있습니다.

### 2-3. 핵심 파일

#### 공통 진입점과 레이아웃

- `app/page.tsx`: 랜딩 페이지 서버 컴포넌트. 가입자·문항 수 조회 후 `LandingClient`에 전달
- `app/layout.tsx`: 전역 메타데이터, 테마 초기화, `AuthProvider`, Vercel Analytics
- `app/student/layout.tsx`: 학생 헤더·푸터·알림·구독 문의 모달
- `src/components/layout/StudentHeader.tsx`: 로그인, 로그아웃, 수학/영어 전환, 학생 메뉴
- `src/lib/auth/AuthContext.tsx`: 현재 사용자 상태, 세션 초기화, 30초 heartbeat

#### 인증과 권한

- `src/lib/auth/SupabaseAuthRepository.ts`: 회원가입, 로그인, 로그아웃, profile 조회
- `src/lib/auth/requireUser.ts`: API의 Bearer 토큰 검증
- `src/lib/auth/requireTier.ts`: Free/Pro 등급 및 만료일 검증
- `src/lib/auth/requireAdmin.ts`: `profiles.is_admin` 검증
- `src/lib/api/adminFetch.ts`: Supabase access token을 자동으로 붙이는 fetch 래퍼

#### 시험과 문제

- `app/student/exams/page.tsx`: 시험 목록, 단원/과목/실전/데일리/취약 시험 진입 UI
- `src/components/exam/UnitTestRunnerPage.tsx`: 쿼리스트링에 따라 데일리·단원별·과목별 시험 구성
- `src/components/exam/ExamRunner.tsx`: 타이머, 답안 자동저장, 제출, 결과 페이지 이동
- `src/lib/exam/grading.ts`: 객관식·단답형 채점
- `src/lib/exam/SupabaseAttemptRepository.ts`: 진행 답안은 localStorage, 완료 결과는 Supabase 저장
- `src/lib/questions/SupabaseQuestionRepository.ts`: 문제 CRUD, 필터, 1,000행 단위 페이지 조회
- `src/lib/exams/SupabaseExamRepository.ts`: 생성 시험 CRUD
- `src/lib/examGenerator.ts`: 관리자 모의고사 난이도 비율·중복 회피 출제
- `src/lib/exam/buildSubjectMockRounds.ts`: 과목별 모의고사 3회차를 단원·난이도 기준으로 결정적 분배

#### 취약 분석

- `src/lib/weakness/score.ts`: 단원 통계, 문제 이력, 취약 가중치 계산
- `src/lib/weakness/select.ts`: 4개 tier를 조합해 25문항 취약 시험 선발
- `src/lib/weakness/report.ts`: 시험 전후 상태와 결과 리포트 생성
- `app/api/weakness/exam/generate/route.ts`: 자격 검증, 시험 생성, 스냅샷 저장
- `app/api/weakness/analysis/route.ts`: 누적 학습 분석 API
- `app/api/weakness/report/route.ts`: 취약 시험 결과 리포트 API

#### AI 검색

- `src/components/student/AiSearchClient.tsx`: 이미지·PDF·클립보드 입력, PDF 페이지 이동, 검색, 풀이, 튜터 UI
- `src/components/student/ProblemImageEditor.tsx`: 원본 픽셀 기준 선택 박스, 이동·8방향 리사이즈, crop/전처리 미리보기와 개발 디버그 패널
- `src/lib/images/problemImage.ts`: 좌표 변환, clamp, 이미지 정규화·전처리·회전, base64 변환, PDF.js 240 DPI 페이지 렌더링
- `app/api/search/route.ts`: Gemini Vision 전체 전사·구조화, 품질 검사·재시도 후 개념 또는 임베딩 검색
- `app/api/search/solve/route.ts`: 업로드 문제 AI 풀이
- `app/api/search/ask/route.ts`: 문제 맥락 기반 AI 튜터
- `src/lib/ai/gemini.ts`: 모델, 재시도, fallback, 오류 정규화
- `src/lib/ai/embed.ts`: 768차원 임베딩
- `src/lib/ai/usage.ts`: AI 기능별 일일 사용량

#### 영어 학습

- `app/student/english/page.tsx`: 영어 기능 홈. 단어 외 유형은 준비 중 표시
- `src/components/english/EnglishWordLearnClient.tsx`: Day별 단어 카드·목록 학습
- `src/components/english/EnglishWordTestClient.tsx`: 세트/Day 단어 테스트
- `src/components/english/EnglishDailyClient.tsx`: 날짜별 10단어 테스트
- `app/api/english/*.ts`: 단어 조회, 테스트 생성, 진도, 틀린 단어 API

#### 커뮤니티와 운영

- `src/components/community/CommunityClient.tsx`: 게시글 목록·작성·좋아요
- `src/components/community/PostDetailClient.tsx`: 상세·댓글·삭제
- `src/components/chat/LiveChatPanel.tsx`: Supabase Realtime 채팅
- `src/lib/moderation/badWords.ts`: 문자열 정규화 기반 금칙어 필터
- `src/lib/moderation/rateLimit.ts`: DB count 기반 도배 제한
- `src/components/admin/**`: 관리자 화면
- `app/api/admin/**`: 관리자 전용 서버 API

#### 기타 실행 단위

- `index.html`: 무림전기 전체 코드. `startGame`, `loop`, `startBattle`, `doAct`, `winBattle`, `openShop`, `train`, `tryBoss`, `showEnding` 등이 핵심
- `streamlit_app.py`: Streamlit 전체 코드. `connect_db`, `render_pdf_pages`, `run_ocr`, `ai_classify_problem_*`, `search_problems`, `ingest_tab`, `search_tab`, `library_tab`, `main`

## 3. 실행 방법

### 3-1. 루트편입 로컬 실행

Node 버전 고정 파일은 없습니다. Next.js 15를 안정적으로 실행하려면 Node.js 20 LTS 이상을 권장합니다.

```powershell
cd "C:\Users\yubin\Desktop\?????\???? CBT"
npm.cmd ci
npm.cmd run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

현재 Windows는 PowerShell 스크립트 실행 정책 때문에 `npm`이 `npm.ps1`에서 차단될 수 있습니다. 이 환경에서는 `npm.cmd`를 사용하면 됩니다.

검증 명령:

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd run lint
npm.cmd audit --omit=dev
```

현재 상태:

- `npm.cmd run typecheck`: 통과
- `npm.cmd run build`: 통과, 76개 페이지 생성
- `npm.cmd run lint`: ESLint 설정이 없어 대화형 설정 화면에서 중단
- 자동화된 단위/E2E 테스트: 없음

### 3-2. 환경변수

Next.js가 실제로 요구하는 값:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_ADS_ENABLED=false
```

- `NEXT_PUBLIC_*`: 브라우저 Supabase 연결
- `SUPABASE_SERVICE_ROLE_KEY`: 서버 API의 관리자 권한 DB 접근. 절대 클라이언트에 노출하면 안 됨
- `GEMINI_API_KEY`: AI 검색·풀이·튜터·임베딩 생성
- `NEXT_PUBLIC_ADS_ENABLED`: `"true"`일 때만 광고 슬롯 표시

현재 `.env.local`에는 Supabase 키와 Mathpix 키 이름은 있으나 `GEMINI_API_KEY`는 없습니다. 빌드 중에도 Gemini API 키 미설정 경고가 발생합니다. `.env.example`은 없습니다.

데이터 가공 스크립트에서 추가로 사용하는 값:

```dotenv
MATHPIX_APP_ID=
MATHPIX_APP_KEY=
```

### 3-3. Supabase 준비

현재 저장소만으로 새 Supabase 프로젝트를 완전히 재현할 수 없습니다.

- `profiles`
- `questions`
- `generated_exams`
- `exam_attempts`

위 핵심 테이블의 최초 생성 마이그레이션이 저장소에 없습니다. 현재 `supabase/migrations/`는 이미 존재한다고 가정한 테이블에 컬럼과 기능을 추가하는 SQL이 중심입니다.

또한 `supabase/config.toml`이 없고 SQL 주석도 대부분 “Supabase SQL 에디터에서 실행” 방식입니다. 새 환경에서는 기존 운영 DB의 전체 schema dump가 먼저 필요합니다.

적용 순서는 대체로 파일명의 날짜 순서이며, `supabase/community.sql`도 별도로 실행해야 합니다. `20260526_chat_retention.sql`은 `pg_cron`, 임베딩 SQL은 `vector` 확장이 필요합니다.

### 3-4. 테스트 계정과 예시 입력

저장소에 테스트 학생/관리자 계정은 없습니다.

1. `/student/register`에서 이메일·이름·6자 이상 비밀번호로 가입
2. Supabase 인증 메일 확인
3. 관리자 계정은 DB에서 해당 사용자의 `profiles.is_admin = true` 설정
4. PRO 테스트는 `profiles.tier = 'pro'`로 설정

로컬 샘플 시험은 DB 없이도 코드에 존재합니다.

- `/student/exams/calc-basic-01`
- `/student/exams/linear-basic-01`

단, 시험 화면은 로그인 사용자를 요구합니다.

### 3-5. 무림전기 실행

별도 설치는 필요 없습니다.

```powershell
cd "C:\Users\yubin\Desktop\?????\???? CBT"
python -m http.server 8080
```

`http://localhost:8080/index.html`을 엽니다. 파일을 직접 열어도 대부분 동작하지만 로컬 HTTP 서버가 브라우저 제약을 줄여줍니다.

### 3-6. Streamlit 프로토타입 실행

```powershell
cd "C:\Users\yubin\Desktop\?????\???? CBT"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
streamlit run streamlit_app.py
```

OCR을 쓰려면 Windows에 Tesseract 본체와 한국어·영어 언어팩을 설치해야 합니다. 기본 탐색 경로는 `C:\Program Files\Tesseract-OCR\tesseract.exe`입니다.

Streamlit 데이터는 `problem_search_data/`의 SQLite와 이미지 파일에 저장됩니다.

## 4. 주요 기능 흐름

### 4-1. 첫 실행과 인증

1. `/`에서 `app/page.tsx`가 Supabase의 가입자·문항 수를 서버에서 집계합니다.
2. `LandingClient`는 로그인 사용자가 있으면 `/student/exams`로 이동시킵니다.
3. 비로그인 사용자는 랜딩, 요금제, 회원가입을 볼 수 있습니다.
4. 회원가입은 `StudentRegisterForm` → `authRepo.registerStudent` → Supabase Auth `signUp` 순서입니다.
5. 인증 메일 링크는 `/auth/confirm`, 비밀번호 재설정은 `/student/forgot-password` → `/auth/reset-password` 흐름입니다.
6. 로그인 시 `StudentHeader.submitStudent`가 `authRepo.loginStudent`를 호출합니다.
7. `SupabaseAuthRepository.loadProfile`이 이름, tier, 만료일, 관리자 여부를 읽어 `MockUser`를 만듭니다.
8. 관리자는 로그인 직후 `/admin`, 일반 학생은 학습 화면에 남습니다.

### 4-2. 시험 선택과 응시

시험 목록의 핵심 메뉴:

- 최근 틀린 문제
- 데일리 테스트
- 취약유형 분석/모의고사
- 단원별 학습
- 과목별 모의고사
- 실전 모의고사
- 응시 결과

단원별·과목별·데일리 시험:

1. `app/student/exams/page.tsx`가 쿼리스트링을 만들어 `/student/exams/unit-test`로 이동합니다.
2. `UnitTestRunnerPage`가 `mode`, `subject`, `units`, `count`, `date`, `round`를 읽습니다.
3. `questionRepo`에서 문제를 가져옵니다.
4. 단원별 학습은 이미 본 문제를 뒤로 보내고, 관리자 모의고사 전용 문제의 중복을 제한합니다.
5. 과목별 모의고사는 `buildSubjectMockRounds`로 20문항×3회차를 구성합니다.
6. 데일리는 관리자 지정 `daily_assignments`를 우선하고, 없으면 날짜 기반 결정적 로테이션을 사용합니다.
7. 구성한 `MockExam`을 `ExamRunner`에 전달합니다.

응시:

1. `ExamRunner`가 `attemptRepo.getStartedAt`과 `loadAnswers`로 localStorage 상태를 복구합니다.
2. 답을 고를 때마다 `saveAnswers`로 자동 저장합니다.
3. 1초 타이머가 제한시간을 계산하며 만료 시 강제 제출합니다.
4. 제출 시 `gradeExam`이 브라우저에서 채점합니다.
5. `attemptRepo.saveResult`가 localStorage에 먼저 저장한 뒤 `/api/exam-attempts`로 전송합니다.
6. 일반 시험은 `/student/results/[attemptId]`, 취약 시험은 `/student/exams/weakness/report/[attemptId]`로 이동합니다.

### 4-3. 오답과 취약 분석

- `/api/student/recent-wrong`은 사용자의 모든 `exam_attempts`를 읽고 Free 7일, Pro 30일 범위로 필터링합니다.
- 같은 문제를 여러 번 틀렸으면 가장 최근 오답만 남기고 `questions`와 조합합니다.
- DB 트리거 `exam_attempts_update_stats()`가 제출 결과를 `user_unit_stats`, `user_problem_history`에 누적합니다.
- 첫 취약 시험은 200문항 풀이 후 가능하며, 재응시는 3일 경과와 추가 100문항 풀이가 필요합니다.
- `assembleWeaknessExam`은 취약 단원, 미체험 유형, 오답 복습, 강점 심화를 4개 tier로 조합합니다.
- 생성 시험과 `weakness_exam_snapshots`를 함께 저장하고, 응시 후 `generateReport`가 전후 변화를 계산합니다.

### 4-4. AI 문제 검색

1. Pro 또는 관리자가 `/student/search`에 진입합니다.
2. 이미지/PDF를 선택하거나 Ctrl+V로 붙여넣습니다. HWP/HWPX 원본은 PDF 또는 이미지로 내보내야 합니다.
3. PDF는 PDF.js로 현재 페이지를 240 DPI 수준에서 렌더링하고, 일반 이미지와 클립보드 blob은 방향·투명 배경을 정규화합니다.
4. `ProblemImageEditor`가 화면 좌표를 원본 픽셀 좌표로 변환해 선택 영역을 자르고 작은 글씨 확대, 흰 배경, 약한 대비, 안전 여백을 적용합니다.
5. 사용자는 실제 AI 전송 이미지를 미리 본 뒤 `AiSearchClient.runSearch`로 해당 blob의 base64와 MIME type을 `/api/search`에 보냅니다.
6. Gemini는 원본 전체 전사 후 본문, 보기, 그림/표, 과목, 단원, 개념, 난이도, 키워드와 판독 품질을 JSON으로 추출합니다.
7. 텍스트가 짧거나 보기가 누락됐거나 신뢰도가 낮으면 같은 이미지로 한 번 재시도하고, 여전히 불완전하면 사용자 경고를 표시합니다.
8. `app_settings.search_engine` 값에 따라 개념 정확 일치 또는 pgvector 임베딩 검색을 수행하고 필요하면 개념 검색으로 fallback합니다.
9. `/api/search/solve`와 `/api/search/ask`에는 구조화된 보기, 그림/표 설명, 원본 전사도 함께 전달합니다.
10. 일반 Pro 사용자는 검색 10회/일, 풀이 10회/일, 질문 20회/일 제한입니다.

### 4-5. 영어 학습

- 단어 학습: `english_words_slice` RPC로 등록순 50개씩 Day 구성
- 학습 진도: `english_word_progress.current_day`
- 단어 테스트: 세트 또는 Day의 단어를 정답으로 사용하고 다른 뜻을 오답 보기로 구성
- 데일리 테스트: UTC epoch day 기반으로 매일 10개를 결정적으로 선택
- 틀린 단어: `english_wrong_words`, `record_wrong_word` RPC
- 단어·논리·문법·독해 중 현재 완성된 축은 단어 학습입니다.

### 4-6. 커뮤니티와 채팅

- 게시글·댓글 작성은 서버 API에서 금칙어와 rate limit를 검사합니다.
- 목록 조회, 좋아요, Realtime 채팅 조회는 브라우저 Supabase 클라이언트가 직접 수행합니다.
- 채팅은 10초 5건, 댓글은 10초 3건, 글은 60초 1건으로 제한합니다.
- `pg_cron`이 설정되면 6시간이 지난 채팅을 10분마다 삭제합니다.

### 4-7. 관리자

관리자 홈에서 다음으로 이동합니다.

- 문제 관리: 문제 CRUD, pool/학교/연도/난이도 필터
- 모의고사 생성: 조건·난이도 비율·문항 수로 시험 생성
- 데일리 관리: 데일리 pool과 날짜별 배정
- 대량 업로드: CSV/JSON 파싱 후 문제 추가
- 영어 관리: 영단어 추가
- AI 설정: 개념/임베딩 검색 엔진 변경, 임베딩 백필
- 회원 관리: Free/Pro, 만료 개월, 관리자, 학생 그룹 변경
- 공지·메시지·문의 관리

회원·공지·문의 등은 `app/api/admin/**`에서 `requireAdmin`을 거치지만, 문제와 생성 시험 CRUD 일부는 브라우저가 `questionRepo`/`examRepo`를 통해 Supabase에 직접 씁니다.

### 4-8. 무림전기 게임

1. 인트로에서 성별과 이름 선택
2. `startGame`이 플레이어와 맵 상태 초기화
3. `requestAnimationFrame(loop)`이 이동·적 AI·렌더링 반복
4. 적 근접 또는 마을 전투 선택 시 `startBattle`
5. `doAct`가 공격·방어·무공·아이템·도주 처리
6. `enemyTurn` 후 승패 판정
7. `winBattle`, `checkLevel`, `rollDrop`으로 성장
8. `tryBoss`, `bossCutscene`, `showEnding`으로 보스와 엔딩 처리

## 5. 코드 구조 설명

### 5-1. Repository 패턴

문제, 시험, 응시, 인증은 인터페이스와 구현을 분리했습니다.

- `IQuestionRepository` → `SupabaseQuestionRepository`
- `IExamRepository` → `SupabaseExamRepository`
- `IAttemptRepository` → `SupabaseAttemptRepository`
- `IAuthRepository` → `SupabaseAuthRepository`

장점은 구현 교체가 쉽다는 점이지만 현재 export 파일명이 `mockAuth.ts`, `generatedExamRepository.ts`처럼 과거 mock 시절 이름을 유지해 실제 역할을 오해하기 쉽습니다.

### 5-2. 데이터 모델

핵심 TypeScript 타입:

- `Problem`: 시험에 포함되는 문제 스냅샷
- `QuestionRecord`: 문제은행 원본
- `MockExam`: 시험 제목·시간·태그·문제 배열
- `GeneratedExam`: DB에 저장되는 관리자 생성 시험
- `AttemptResult`: 답안, 점수, 문제별 정오, 시험 스냅샷
- `MockUser`: Supabase 사용자를 화면에서 쓰기 위한 단순화 모델

문제 본문과 풀이는 `latex | image | mixed`, 문제 형식은 `multiple_choice | subjective`입니다. `ContentRenderer`가 이미지와 `KaTeXRenderer`를 조합합니다.

### 5-3. 수정 시 주의할 로직

- `src/lib/taxonomy.ts`의 과목·단원 이름은 DB 값, 업로드 스크립트, AI prompt와 일치해야 합니다.
- `src/lib/ai/embed.ts`의 `EMBED_DIM = 768`은 DB `vector(768)`과 `match_questions` 함수와 동시에 변경해야 합니다.
- `src/lib/exam/normalize.ts`는 단답형 정답 비교에 사용되므로 수식 정규화 변경 시 오채점 위험이 있습니다.
- `src/lib/examGenerator.ts`는 난이도 목표 점수, 인접 난이도 대체, 시험 간 중복 회피를 함께 처리합니다.
- `src/lib/weakness/select.ts`와 DB 트리거는 문제 ID 및 단원 통계 형식에 강하게 결합되어 있습니다.
- `ExamRunner`의 timer는 비동기 localStorage 복원 이후에만 시작해야 합니다. 순서를 바꾸면 진입 즉시 자동 제출될 수 있습니다.
- `SupabaseAuthRepository.loadProfile`은 마이그레이션이 덜 적용된 DB를 위한 fallback query가 있습니다. 스키마 정리 전 제거하면 구환경 로그인이 깨질 수 있습니다.
- `questions`, `generated_exams`를 브라우저에서 직접 수정하는 현재 구조를 유지한다면 RLS 검증이 필수입니다.
- `supabase/community.sql`은 실제 코드와 불일치하므로 그대로 새 DB에 적용하면 커뮤니티 일부가 실패합니다.

### 5-4. 큰 파일과 결합도

유지보수 부담이 큰 대표 파일:

- `src/components/admin/exams/AdminExamsClient.tsx`: 약 884줄
- `app/student/exams/page.tsx`: 약 875줄
- `src/components/admin/daily/AdminDailyClient.tsx`: 약 695줄
- `src/components/admin/questions/QuestionModal.tsx`: 약 667줄
- `src/components/admin/users/AdminUsersClient.tsx`: 약 604줄
- `src/components/english/EnglishWordLearnClient.tsx`: 약 602줄
- `src/lib/weakness/select.ts`: 약 506줄
- `src/components/student/AiSearchClient.tsx`: 약 500줄
- `streamlit_app.py`: 약 2,073줄
- `index.html`: 약 1,549줄

화면 상태, API 호출, 도메인 로직이 한 파일에 함께 있는 경우가 많아 기능 추가 시 회귀 범위가 큽니다.

## 6. 현재 구현된 기능

### 6-1. 완성되어 동작하는 범위

- 이메일 회원가입, 인증, 로그인, 로그아웃, 비밀번호 재설정, 회원탈퇴
- Free/Pro 등급과 만료일, 관리자 권한
- 단원별 학습, 과목별 모의고사, 데일리 테스트
- 관리자 생성 실전 모의고사
- 객관식·단답형 응시, 타이머, 자동 답안 저장, 채점, 결과 조회
- 최근 오답 7일/30일 복습
- 누적 통계 기반 취약 분석과 25문항 취약 시험
- AI 이미지 문제 인식, 유사 문제 검색, AI 풀이, AI 튜터
- 영단어 Day 학습, 세트/Day 테스트, 데일리 테스트, 틀린 단어
- 커뮤니티, 댓글, 좋아요, 실시간 채팅, 금칙어·도배 제한
- 관리자 문제·시험·데일리·영단어·회원·공지·문의 관리
- SEO 메타데이터, sitemap, robots, OG 이미지, Vercel Analytics
- 다크 모드와 수학/영어 트랙 전환
- 무림전기 게임의 기본 전투·성장·상점·수련·보스·엔딩
- Streamlit 문제 수집·OCR·검색·로컬 DB

### 6-2. 부분 구현

- 편입영어: 단어 기능만 실사용 가능. 단어 문제·논리·문법·독해는 “준비 중”
- 결제: 가격과 약관은 있으나 PG 연동·자동 구독·웹훅·환불 시스템 없음
- 광고: `AdSlot`과 플래그는 있으나 실제 광고 공급자 연동은 확인되지 않음
- AI 임베딩: 관리자가 임베딩을 백필하고 설정을 바꿔야 하며 ANN 인덱스는 SQL에서 주석 처리됨
- 프로필 취약 분석: 별도 취약 분석 화면은 구현되어 있지만 프로필에는 100문항 이후에도 “준비 중” 문구 표시
- 관리자 라우트 보호: 각 클라이언트와 API에서 개별 확인하며 중앙 middleware/layout 서버 가드는 없음
- 데이터베이스 설치: 추가 마이그레이션은 있으나 baseline schema가 없음

### 6-3. 미구현 또는 운영상 수동

- 자동 결제·구독 갱신·해지
- 테스트 계정·seed 명령
- 자동화 테스트
- CI/CD 설정
- 표준 ESLint 설정
- `.env.example`
- Supabase 로컬 개발 설정과 전체 schema migration
- 오류 추적 서비스, 구조화 로깅, 운영 모니터링
- 무림전기 저장/불러오기, 모바일 터치 조작, 모듈 분리

### 6-4. 하드코딩·임시 코드

- `src/lib/stats/displayed.ts`: 문항 수 최소 `7,500+`, 가입자 수를 실제보다 2~2.5배 표시
- `src/components/student/PricingClient.tsx`: Pro 월 29,900원과 카카오 오픈채팅 URL
- 랜딩·상담 컴포넌트의 카카오 채널/오픈채팅 URL
- `src/lib/auth/constants.ts`: 사용되지 않는 과거 관리자 비밀번호 `"routeroute"`
- `src/lib/ai/gemini.ts`: `gemini-2.5-flash`, fallback 모델명 고정
- AI 일일 한도, 오답 보관 기간, 취약 시험 자격 문항 수가 코드 상수
- `app/layout.tsx`, sitemap, robots, legal 정보에 운영 도메인·운영자 정보 고정
- `src/data/mockData.ts`: 샘플 시험 2개
- 대량 업로드 스크립트에 학교·연도·문제 데이터가 파일별로 반복 하드코딩

## 7. 현재 문제점

### 7-1. 즉시 수정해야 할 보안·무결성 문제

1. **커뮤니티 게시글 UPDATE RLS가 전체 허용**

   `supabase/community.sql`의 정책:

   ```sql
   USING (auth.uid() = user_id OR true)
   ```

   `OR true` 때문에 인증 여부나 작성자와 무관하게 UPDATE 조건이 항상 참입니다. 좋아요 카운터 갱신을 허용하려 넣은 것으로 보이지만 게시글 전체 컬럼 변조 가능성이 생깁니다.

2. **시험 결과를 클라이언트가 채점하고 서버가 그대로 신뢰**

   `ExamRunner` → `gradeExam` → `/api/exam-attempts` 흐름에서 서버는 `attemptId`, `examId`, `items` 존재만 검사합니다. 사용자가 `isCorrect`, 점수, 문제 ID를 조작해 제출할 수 있고 DB 트리거가 이를 취약 통계에 반영합니다. 채점과 통계용 정오 판정은 서버에서 문제 DB를 기준으로 다시 계산해야 합니다.

3. **관리자 문제·시험 변경이 브라우저 직접 DB 쓰기**

   `AdminQuestionsClient`, `AdminExamsClient`, `AdminDailyClient`, `AdminImportsClient`가 anon 클라이언트의 `questionRepo`/`examRepo`로 직접 INSERT/UPDATE/DELETE합니다. 실제 운영 DB RLS가 완벽하지 않으면 일반 사용자가 같은 요청을 만들 수 있습니다. 관리자 mutation을 `app/api/admin/**`로 이동해야 합니다.

4. **핵심 테이블 RLS와 baseline schema가 저장소에 없음**

   새 환경 재현이 어렵고 실제 보안 정책을 코드 리뷰로 검증할 수 없습니다. 운영 DB와 Git의 스키마 차이가 누적될 위험이 큽니다.

5. **취약한 프레임워크 버전**

   2026-06-14 로컬 `npm audit --omit=dev` 결과는 high 1건, moderate 2건입니다. 설치된 Next.js는 빌드 출력 기준 15.5.15이며 감사 결과가 안내한 수정 범위보다 낮습니다. 최소 15.5.18 이상 호환 버전으로 올린 뒤 회귀 테스트가 필요합니다.

### 7-2. 실제 기능 불일치와 버그

1. `app/api/community/posts/route.ts`와 UI는 카테고리 `"free"`를 허용하지만 `supabase/community.sql`의 CHECK는 `('question', 'info')`만 허용합니다. 해당 SQL 그대로인 DB에서는 자유게시판 글 작성이 실패합니다.
2. 좋아요와 댓글 수는 현재 값 SELECT 후 `+1/-1` UPDATE 방식이라 동시 요청에서 증가분이 유실될 수 있습니다. DB RPC 또는 trigger의 원자적 증가가 필요합니다.
3. 프로필은 “비밀번호 분실 시 회원탈퇴 후 재가입”이라고 안내하지만 실제 비밀번호 찾기 기능이 이미 있습니다.
4. 프로필의 취약 분석 영역은 100문항 이후에도 “준비 중”을 표시하지만 전용 취약 분석 기능은 별도로 구현되어 있습니다.
5. `.env.local`에 `GEMINI_API_KEY`가 없어 AI 기능은 현재 로컬에서 503을 반환합니다.
6. `npm run lint`가 자동 실행되지 않고 설정 질문에서 멈춥니다.
7. 현재 작업 트리에는 `UnitTestRunnerPage.tsx`의 미커밋 변경과 매우 많은 미추적 업로드/검수 파일이 있습니다. 변경 단위를 구분하기 어렵습니다.

### 7-3. 성능 문제

- `/api/student/recent-wrong`이 사용자의 전체 시험 결과 JSON을 모두 가져온 뒤 서버 메모리에서 기간 필터링합니다. `submitted_at`을 별도 컬럼과 인덱스로 두어 DB에서 필터링해야 합니다.
- 관리자 문제 화면은 전체 문제를 1,000행씩 모두 브라우저로 가져온 후 필터링합니다. 데이터가 커질수록 초기 로딩·메모리·KaTeX 처리 비용이 커집니다.
- `SupabaseQuestionRepository`의 여러 list 함수가 `select("*")`를 반복합니다. 용도별 필요한 컬럼만 조회하는 편이 낫습니다.
- `questions.embedding`의 HNSW 인덱스가 주석 처리되어 있어 문제 수가 커지면 벡터 검색이 느려질 수 있습니다.
- 취약 분석 페이지의 첫 로드 JS가 빌드 결과 약 283kB로 상대적으로 큽니다.
- OG 이미지가 빌드/요청 시 외부 CDN에서 2MB가 넘는 폰트를 가져오며 Next 데이터 캐시 크기 경고가 발생합니다.

### 7-4. 유지보수 문제

- 하나의 Git 루트에 무림전기, 루트편입, Streamlit 도구가 섞여 프로젝트 정체성과 배포 단위가 불명확합니다.
- 큰 클라이언트 컴포넌트에 데이터 로딩, 권한 확인, 상태, UI가 함께 있습니다.
- 82개 이상의 빈 `catch` 또는 best-effort 무시 경로가 있어 장애 원인 추적이 어렵습니다.
- `mockAuth.ts`, `MockUser`, `generatedExamRepository.ts` 등 과거 이름이 실제 Supabase 구현과 맞지 않습니다.
- 업로드·수정 스크립트가 학교/연도별 복제 파일로 급증했습니다.
- 설정값이 DB, 상수, UI 문구에 분산되어 정책 변경 시 불일치하기 쉽습니다.
- 테스트가 없어 출제·채점·권한·RLS 변경의 회귀를 자동으로 발견할 수 없습니다.

### 7-5. 운영·법무·데이터 문제

- 표시 가입자 수를 실제보다 배수로 늘리고 문항 수에 marketing floor를 적용합니다. 서비스 지표의 신뢰성과 표시 기준을 검토해야 합니다.
- 약관에는 월 정기 구독과 결제가 기재되어 있지만 실제 결제 시스템은 수동 문의 방식입니다.
- 법적 문서는 코드 주석상 표준 초안이며 별도 검토가 필요합니다.
- service role 키를 사용하는 API가 많으므로 사용자 ID 필터 누락 하나가 전체 데이터 노출로 이어질 수 있습니다.

## 8. 앞으로 보완하면 좋은 점

### 8-1. 현재 1차 우선순위: 문제 이미지 인식 품질

1. `src/components/student/AiSearchClient.tsx`의 이미지·PDF·클립보드 입력 흐름과 실제 AI 전송 이미지를 일치시킴
2. `src/components/student/ProblemImageEditor.tsx`와 `src/lib/images/problemImage.ts`에서 화면 좌표를 원본 픽셀 좌표로 일관되게 변환하고 crop 미리보기·리사이즈·clamp 제공
3. 작은 이미지 확대, 투명 배경 제거, 흰 배경·대비·여백 보정 후 Gemini로 전송
4. 한컴오피스에서 복사한 비표준 clipboard blob과 Hancom PDF를 안정적으로 이미지화
5. Gemini가 본문보다 먼저 전체 원문, 수식, 보기, 표·그림을 전사하게 하고 누락 가능 시 재시도·경고
6. 일반 PNG/JPG, 클립보드, Hancom PDF, 수식·표·객관식, 부분/전체 crop, 브라우저 확대 상태를 반복 검증

현재 추가된 핵심 구현은 `ProblemImageEditor`, `problemImage.ts`, `pdfjs-dist`, `/api/search`의 인식 품질 검사와 재시도, `streamlit_app.py`의 288 DPI PDF 렌더링·이미지 전처리입니다.

### 8-2. 출시 전 반드시 돌아와야 할 보안·저장소 정상화

1. 저장소를 최소 `murim-game`, `routrans-web`, `problem-ingestion-tool`로 분리하거나 명시적인 monorepo workspace로 재구성
2. 운영 Supabase 전체 schema를 migration으로 dump하고 새 DB에서 처음부터 재현
3. `community.sql`의 `OR true` 제거, `"free"` 카테고리 CHECK 수정
4. 시험 제출 API에서 서버 재채점
5. 모든 관리자 mutation을 서버 API로 이동
6. Next.js와 취약 transitive dependency 업데이트
7. `.env.example`, Node 버전 파일, 설치 README 추가

### 8-3. 테스트

가장 먼저 추가할 테스트:

- `answersMatch`, `gradeExam`의 객관식·단답형 경계값
- `buildSubjectMockRounds`의 회차별 중복·문항 수·결정성
- `generateExamFromQuestionBank`의 난이도 비율과 부족한 pool fallback
- `computeWeaknessWeights`, `assembleWeaknessExam`
- Free/Pro/Admin 권한 API 통합 테스트
- 다른 사용자의 시험·게시글·문의에 접근할 수 없는 RLS 테스트
- 회원가입 → 시험 응시 → 결과 → 오답 → 취약 시험 E2E

권장 도구는 Vitest 또는 Jest + Testing Library, Playwright, Supabase 로컬 테스트입니다.

### 8-4. 코드 리팩토링

- `app/student/exams/page.tsx`를 시험 유형별 카드/모달/훅으로 분리
- 관리자 대형 컴포넌트를 목록, 필터, 편집 폼, API hook으로 분리
- `UnitTestRunnerPage`의 출제 로직을 순수 함수와 서비스로 이동
- 영어 학습의 공통 fetch/auth/error 패턴을 hook으로 통합
- `adminFetch`를 인증 API 전반에 맞게 `authenticatedFetch`로 이름 변경
- legacy `ADMIN_PASSWORD`, `loginAdmin`, `MockUser` 명칭 제거
- 정책 상수를 환경설정 또는 `app_settings`로 모으고 서버에서 검증
- 업로드 스크립트를 학교·연도별 데이터 파일 + 공통 uploader로 통합

### 8-5. 데이터 구조

- `exam_attempts`에 `submitted_at`, `score_percent`, `exam_type` 등 조회용 정규 컬럼 추가
- 문제별 응시 결과를 별도 `attempt_items` 테이블로 정규화하는 방안 검토
- 좋아요·댓글 카운터를 trigger/RPC로 원자적 관리
- `generated_exams`에 owner/admin scope와 공개 상태 추가
- AI 사용량 증가를 check-and-increment 단일 RPC로 만들어 동시 요청 한도 우회 방지
- 문제 school/year를 tags가 아닌 정규 컬럼으로 이동
- 실제 사용 중인 RLS 정책을 migration과 테스트로 고정

### 8-6. UI/UX

- 프로필의 비밀번호·취약분석 안내를 실제 기능과 일치시킴
- 비로그인/권한 없음/DB 오류 화면을 공통 컴포넌트로 통일
- 관리자 페이지를 layout 수준에서 서버 보호하고 잘못된 접근은 즉시 redirect
- AI 이미지 파일 크기 제한과 클라이언트 리사이즈 추가
- 시험 제출 전 미응답 문항 수 표시
- 네트워크 저장 실패 시 “로컬에만 저장됨”을 사용자에게 표시
- 영어 준비 중 기능에 로드맵 또는 알림 신청 제공
- 무림전기에 저장/불러오기, 모바일 터치, 접근성 추가

### 8-7. 배포

- CI에서 `npm ci`, typecheck, lint, unit test, build, migration 검증 수행
- Vercel 환경변수를 Preview/Production으로 분리
- Supabase staging 프로젝트 추가
- Sentry 등 오류 추적과 구조화 서버 로그 추가
- CSP, 보안 헤더, 요청 body 크기 제한 설정
- service role 키 회전 절차와 운영 문서 작성
- DB 백업·복구 연습, pg_cron/extension 상태 모니터링
- OG 폰트를 로컬 asset으로 포함해 외부 CDN 의존과 캐시 경고 제거

## 9. ChatGPT에게 넘길 때 필요한 요약

[프로젝트 한 줄 요약]  
한 저장소에 단일 HTML 무협 게임, Next.js 기반 편입 학습 SaaS, Streamlit 문제 수집 도구가 혼재하며 현재 주 개발 대상은 루트편입 Next.js 서비스입니다.

[기술 스택]  
Next.js 15, React 19, TypeScript, Tailwind CSS, Supabase Auth/PostgreSQL/RLS/Realtime, Gemini, pgvector, KaTeX, Recharts, 별도 Python Streamlit/SQLite 도구.

[핵심 파일]  
`src/components/student/AiSearchClient.tsx`, `src/components/student/ProblemImageEditor.tsx`, `src/lib/images/problemImage.ts`, `app/api/search/route.ts`, `app/api/search/solve/route.ts`, `app/api/search/ask/route.ts`, `streamlit_app.py`, `paste_image_component/frontend/main.js`, `app/student/exams/page.tsx`, `src/components/exam/ExamRunner.tsx`.

[가장 중요한 기능]  
사용자가 문제 이미지·PDF를 업로드하거나 붙여넣고 정확한 문제 영역을 선택하면 Gemini가 본문·수식·보기·표/그림을 인식해 유사 문제, 풀이, 튜터 문맥으로 연결하는 흐름.

[현재 가장 큰 문제]  
1차 목표 기준으로는 한컴오피스 클립보드·PDF 등 다양한 원본에서의 실제 브라우저 인식 품질을 더 검증해야 하고 Gemini API 키가 없는 로컬 환경에서는 실호출 전사 정확도를 확인할 수 없습니다. 보안/RLS/서버 채점 위험도 출시 전 별도로 해결해야 합니다.

[우선 수정해야 할 부분]  
문제 이미지 선택·전처리 실사용 검증 → Hancom PDF/클립보드 회귀 샘플 확보 → Gemini 전사 품질 지표와 재시도 기준 조정 → 회전 자동 감지 검토. 이후 보안/RLS/서버 재채점 작업으로 복귀.

[ChatGPT가 먼저 봐야 할 파일]  
`PROJECT_HANDOFF.md` → `src/components/student/AiSearchClient.tsx` → `src/components/student/ProblemImageEditor.tsx` → `src/lib/images/problemImage.ts` → `app/api/search/route.ts` → `app/api/search/solve/route.ts` → `app/api/search/ask/route.ts` → `streamlit_app.py` → `paste_image_component/frontend/main.js`.

[실행 방법 요약]  
루트편입은 `.env.local`과 기존 Supabase schema 준비 후 `npm.cmd ci && npm.cmd run dev`, 무림전기는 `python -m http.server 8080`, Streamlit 도구는 가상환경에서 `pip install -r requirements.txt && streamlit run streamlit_app.py`.
