# 채팅 자료와 전자공학실험 사이트를 연결하는 방법

이 기능은 두 입력 경로에서 같은 회로 데이터와 배치·검증 엔진을 사용한다. 지원하는 선형 회로는 사이트와 관리자 API에서 같은 수치 모델로 계산할 수 있다.

1. 사이트에 PDF·사진·조건을 입력한다. 파일 선택과 클립보드 붙여넣기를 지원하며, 사용자가 ‘자료 분석 · 전체 설계’를 실행하면 `/api/admin/electronics/analyze`가 서버의 Gemini 설정으로 회로 연결 정보를 추출한다.
2. 사용자가 채팅으로 자료를 보내면, 연결된 에이전트가 자료와 문장 조건을 읽고 카탈로그에 맞는 회로 JSON을 만든다. 관리자 화면의 **ChatGPT 설계 가져오기**로 입력하거나 인증된 `/api/admin/electronics/design` API로 배치한다. 이 경로는 Gemini 키 없이 사용할 수 있다.

## 채팅에서 사이트까지의 작업 흐름

1. 에이전트가 PDF·사진의 대상 실험과 회로, 부품값, 전원, 계측 연결, 문장으로 지정한 변경사항을 확인한다.
2. 현재 사이트의 소자 카탈로그와 핀 번호를 읽는다. 인증된 `GET /api/admin/electronics/design`에서 카탈로그·요청 제한·필드를 조회할 수 있다.
3. `Circuit` JSON을 작성한다. 근거는 `provenance`와 `notes`에, 불명확한 핀·접점·설계값은 `reviewItems`에 기록한다. 미지원 소자를 임의로 다른 소자로 교체하지 않는다.
4. 관리자 화면의 **ChatGPT 설계 가져오기**에 JSON을 붙여 넣거나 JSON 파일을 연다. 사이트가 동일한 엔진으로 전체 소자 배치와 점퍼선을 생성한다.
5. 원문과 소자 이름·핀·연결을 비교하고, 배선 검사 오류와 미해결 확인 항목을 검토한다. 필요한 부분은 수정 후 다시 배치한다.
6. 지원 모델에 해당하면 ‘파형·계측’에서 CH1/CH2를 실제 빵판 구멍에 연결하고 입력·GND·전원 조건을 확인한 뒤 실행한다. 시간 파형, AC 이득/위상, DC 전압·전류를 검토한다. 배선 오류와 미지원 소자는 계산 전에 해결해야 한다.
7. 관리자가 로그인한 계정의 비공개 프로젝트로 저장한다. `POST /api/admin/electronics/projects`는 원래 수동 배치를 보존하고 구조와 연결을 다시 검사한다. 현재 프로젝트 형식에는 시뮬레이션 설정·계산 결과가 저장되지 않으므로 결과가 필요하면 CSV를 별도로 내보낸다.

에이전트가 사이트에 직접 입력하고 저장하려면, **현재 채팅 세션에서 해당 관리자 페이지를 열고 조작할 수 있는 브라우저 연결과 사용자의 관리자 로그인 상태**가 필요하다. 파일을 채팅에 보냈다는 사실만으로 사이트 접근 권한이나 로그인 상태가 생기지는 않는다. 연결이 없는 경우에는 가져올 수 있는 JSON을 전달하고, 사이트 입력·저장이 실제로 완료됐다고 표시하지 않는다. 관리자 토큰을 채팅에 붙여 넣을 필요는 없다.

## 클립보드 자료 입력

자료 창의 붙여넣기 영역을 클릭하고 Ctrl+V(맥은 ⌘+V)를 누르거나 ‘클립보드에서 붙여넣기’를 누른다. PNG·JPG·WebP 이미지와 브라우저가 파일로 제공하는 PDF는 첨부 목록에, 일반 텍스트는 추가 조건에 들어간다. 버튼 읽기가 거부되거나 지원되지 않으면 키보드 붙여넣기 또는 파일 선택을 사용한다. 입력란 안에서는 일반 텍스트 붙여넣기 동작을 유지한다.

기존 첨부와 읽는 중인 자료를 합해 최대 4개, 총 2,900,000바이트(2.9MB)를 허용한다. 추가 조건은 전체 20,000자 이하다. 이미지 미리보기와 조건을 확인한 다음 분석 버튼을 눌러야 서버 분석이 시작된다. 클립보드 HTML을 화면에 삽입하거나 링크를 자동으로 가져오지 않는다.

## 설계 API

`POST /api/admin/electronics/design`

요청 헤더:

```text
Authorization: Bearer <ADMIN_ACCESS_TOKEN>
Content-Type: application/json
```

`design-request.json`의 최소 RC 예제:

```json
{
  "circuit": {
    "id": "chat-rc-lowpass",
    "title": "RC 저역통과 회로",
    "description": "입력과 출력 사이 저항, 출력과 접지 사이 커패시터",
    "components": [
      { "id": "R1", "definitionId": "resistor-axial", "value": "10 kΩ", "pinNets": { "1": "IN", "2": "OUT" } },
      { "id": "C1", "definitionId": "capacitor-ceramic", "value": "10 nF", "pinNets": { "1": "OUT", "2": "GND" } }
    ],
    "netNames": { "IN": "입력", "OUT": "출력", "GND": "공통 기준" },
    "instruments": [
      { "id": "fg-signal", "instrument": "함수발생기", "port": "출력", "netId": "IN", "setting": "실험 조건에 맞게 설정" },
      { "id": "fg-ground", "instrument": "함수발생기", "port": "기준", "netId": "GND" },
      { "id": "osc-tip", "instrument": "오실로스코프", "port": "CH1 프로브", "netId": "OUT" },
      { "id": "osc-ground", "instrument": "오실로스코프", "port": "CH1 기준", "netId": "GND" }
    ],
    "notes": ["예제 값입니다. 업로드 자료에서 확인한 최종 설계가 아닙니다."],
    "reviewItems": [{ "id": "source-check", "message": "실험 원문·부품값·계측 설정을 확인하세요.", "resolved": false }],
    "provenance": "API 형식 설명용 예제"
  },
  "boardOptions": { "boards": 1, "railMode": "split" }
}
```

Windows 명령 예시(꺾쇠 안 값은 실제 실행 환경에서 대체):

```powershell
curl.exe --request POST "https://<CBT_SITE>/api/admin/electronics/design" --header "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" --header "Content-Type: application/json" --data-binary "@design-request.json"
```

응답은 `{ ok, circuit, layout, validation, steps }`이다. `ok: true`는 요청을 처리했다는 뜻이며, `validation.valid`, `validation.issues`, `circuit.reviewItems`를 따로 확인한다. 배치 공간 부족이나 미지원 외형 등으로 자동 배치를 완성하지 못한 경우에도 진단 결과를 받는다. 형식·핀·참조 오류는 HTTP 400, 용량 초과는 413, 인증·권한 오류는 401/403이다.

요청 본문은 1MB 이하이며 최대 소자 80개, 연결 256개, 계측기 단자 32개를 허용한다. 현재 빵판 모델은 일반 830홀 보드 1장/2장과 전원 레일 분할/연속 설정이다. 수업용 1600홀 실물의 홀·레일 구조는 별도 확인해야 한다.

## 파형·계측과 시뮬레이션 API

사이트에서는 ‘파형·계측’의 CH1/CH2를 누른 뒤 실제 구멍 또는 소자/계측기 접점을 선택한다. 측정 노드는 보드 내부 연결과 실제 점퍼 양 끝을 따라 해석한다. 두 채널은 설정한 GND를 공통 기준으로 사용한다. 입력 노드, 사인파·사각파·삼각파·DC, 피크 진폭, 오프셋, 주파수, 추가 DC 전원과 시간/AC 범위를 확인한다. DC 입력은 오프셋 값을 사용하고, AC 응답은 입력 진폭과 별개인 단위 AC 입력 대비 전압비이다.

계산은 별도 Worker에서 실행되며 취소할 수 있고 20초를 넘기면 중단된다. 회로·배치·프로브·설정 변경 시 진행 중 계산을 취소한다. 이미 계산한 결과는 이전 조건으로 표시하고 CSV 내보내기를 막으므로 변경 후 다시 실행해야 한다. 계산 모델에 포함되지 않은 노드를 0V로 대신 그리지 않는다.

`GET /api/admin/electronics/simulate`는 인증 후 지원 모델, 필수 필드와 제한을 반환한다. `POST /api/admin/electronics/simulate`도 설계 API와 같은 관리자 Bearer 인증 및 `Content-Type: application/json`을 사용한다. Gemini 설정은 필요하지 않다.

POST 본문 구조:

```text
{
  circuit: 설계 API에서 반환한 회로,
  boardOptions: { boards: 1, railMode: "split" },
  layout: 현재 편집한 실제 빵판 배치,
  config: 아래 계산 조건,
  probeHoleIds: ["B1:B1", "B1:B5"]
}
```

`probeHoleIds`는 선택 항목이며 최대 16개다. 예시 구멍을 그대로 사용하지 말고 현재 `layout.placements`/`layout.terminals`에서 원하는 측정 접점을 확인한다. `boardOptions`와 `layout`도 현재 작업을 사용한다.

RC 예제의 `config`:

```json
{
  "groundNetId": "GND",
  "source": {
    "netId": "IN",
    "waveform": "sine",
    "frequencyHz": 1000,
    "amplitudePeak": 0.1,
    "offset": 0
  },
  "supplies": [],
  "durationSeconds": 0.005,
  "sampleCount": 1024,
  "acStartHz": 10,
  "acStopHz": 100000,
  "acPoints": 96
}
```

응답은 `{ ok, result, validation, probes }`이다. `probes`는 요청한 구멍의 실제 `holeId`/`netId`이고, `result`에는 `time`, 노드별 `nodeVoltages`, `dc.nodeVoltages`/`componentCurrents`/`sourceCurrents`, AC 주파수·노드별 이득 비율·위상, `warnings`가 포함된다. 소자 DC 전류의 양의 방향은 1번 핀→2번 핀, 이상 전압원 전류는 구동 노드→전원이다. `warnings`를 함께 검토한다.

요청은 1,000,000바이트 이하이며 시간 샘플 32~4096개, AC 지점 2~512개를 사용한다. 회로 크기와 시간 범위의 조합에는 별도 계산량 제한이 있다. 형식 오류는 400, 본문 용량 초과는 413, JSON 외 형식은 415, 배선 오류·미지원 모델·부유 노드 등 계산 불가는 422, 인증·권한 오류는 401/403이다. 클라이언트가 보낸 검사 결과나 홀 도통 정보는 신뢰하지 않고 보드 프로필에서 다시 구성해 검사한다.

지원 범위는 2핀 저항·일반/전해 커패시터와 검증된 UA741 핀맵의 **이상적 선형 모델**이다. 실제 소자의 포화·대역폭·슬루율·공차·기생성분과 계측기 부하는 반영하지 않는다. 다이오드·LED·BJT·MOSFET 등의 비선형 모델, 다른 IC, DSP/MATLAB 실행과 실장비 제어는 후속 범위다. 미지원 소자를 생략해 계산하지 않는다. 이 기능이 모든 수업 회로의 원문 검수나 실제 성능 검증을 대신하지 않는다.

## 저장 API

`POST /api/admin/electronics/projects`에 다음 프로젝트 구조를 보낸다. `circuit`과 `layout`은 설계 API의 반환값을 사용한다.

```text
{
  version: 1,
  id: "새 UUID",
  title: "프로젝트 이름",
  updatedAt: "ISO 8601 시각",
  circuit,
  boardOptions,
  layout,
  completedSteps: []
}
```

저장과 조회 모두 동일한 관리자 인증을 사용한다. 프로젝트는 인증된 관리자 ID 아래 비공개 파일로 저장되며, 요청에서 다른 사용자의 경로를 지정할 수 없다. `GET /api/admin/electronics/projects`는 본인 최근 프로젝트를 최대 30개 반환한다.

회로 연결 검증, 원문 확인, 부품 핀맵 확인, 실제 성능 검증은 별개 상태다. 채팅이나 API에서 작성한 설계에도 동일하게 적용한다.
