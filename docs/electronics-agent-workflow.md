# 채팅 자료와 전자공학실험 사이트를 연결하는 방법

이 기능은 두 입력 경로에서 같은 회로 데이터와 배치·검증 엔진을 사용한다.

1. 사이트에 PDF·사진·조건을 입력한다. `/api/admin/electronics/analyze`가 서버의 Gemini 설정을 사용해 회로 연결 정보를 추출한다.
2. 사용자가 채팅으로 자료를 보내면, 연결된 에이전트가 자료와 문장 조건을 읽고 카탈로그에 맞는 회로 JSON을 만든다. 관리자 화면의 **ChatGPT 설계 가져오기**로 입력하거나 인증된 `/api/admin/electronics/design` API로 배치한다. 이 경로는 Gemini 키 없이 사용할 수 있다.

## 채팅에서 사이트까지의 작업 흐름

1. 에이전트가 PDF·사진의 대상 실험과 회로, 부품값, 전원, 계측 연결, 문장으로 지정한 변경사항을 확인한다.
2. 현재 사이트의 소자 카탈로그와 핀 번호를 읽는다. 인증된 `GET /api/admin/electronics/design`에서 카탈로그·요청 제한·필드를 조회할 수 있다.
3. `Circuit` JSON을 작성한다. 근거는 `provenance`와 `notes`에, 불명확한 핀·접점·설계값은 `reviewItems`에 기록한다. 미지원 소자를 임의로 다른 소자로 교체하지 않는다.
4. 관리자 화면의 **ChatGPT 설계 가져오기**에 JSON을 붙여 넣거나 JSON 파일을 연다. 사이트가 동일한 엔진으로 전체 소자 배치와 점퍼선을 생성한다.
5. 원문과 소자 이름·핀·연결을 비교하고, 배선 검사 오류와 미해결 확인 항목을 검토한다. 필요한 부분은 수정 후 다시 배치한다.
6. 관리자가 로그인한 계정의 비공개 프로젝트로 저장한다. `POST /api/admin/electronics/projects`는 원래 수동 배치를 보존하고 구조와 연결을 다시 검사한다.

에이전트가 사이트에 직접 입력하고 저장하려면, **현재 채팅 세션에서 해당 관리자 페이지를 열고 조작할 수 있는 브라우저 연결과 사용자의 관리자 로그인 상태**가 필요하다. 파일을 채팅에 보냈다는 사실만으로 사이트 접근 권한이나 로그인 상태가 생기지는 않는다. 연결이 없는 경우에는 가져올 수 있는 JSON을 전달하고, 사이트 입력·저장이 실제로 완료됐다고 표시하지 않는다. 관리자 토큰을 채팅에 붙여 넣을 필요는 없다.

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
