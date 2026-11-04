# 채팅 자료와 전자공학실험 사이트를 연결하는 방법

이 기능은 두 입력 경로에서 같은 회로 데이터와 배치·검증 엔진을 사용한다. 지원하는 R/C·UA741 및 등록된 교육용 BJT·MOSFET·1N4148 회로는 사이트와 관리자 API에서 같은 수치 모델로 계산할 수 있다. 실험별 원문 조건과 미지원 항목은 [전체 지원 매핑](electronics-course-coverage.md)을 먼저 확인한다.

1. 사이트에 PDF·사진·조건을 입력한다. 파일 선택과 클립보드 붙여넣기를 지원하며, 사용자가 ‘자료 분석 · 전체 설계’를 실행하면 `/api/admin/electronics/analyze`가 서버의 Gemini 설정으로 회로 연결 정보를 추출한다.
2. 사용자가 채팅으로 자료를 보내면, 연결된 에이전트가 자료와 문장 조건을 읽고 카탈로그에 맞는 회로 JSON을 만든다. 관리자 화면의 **ChatGPT 설계 가져오기**로 입력하거나 인증된 `/api/admin/electronics/design` API로 배치한다. 이 경로는 Gemini 키 없이 사용할 수 있다.

## 채팅에서 사이트까지의 작업 흐름

1. 에이전트가 PDF·사진의 대상 실험과 회로, 부품값, 전원, 계측 연결, 문장으로 지정한 변경사항을 확인한다.
2. 현재 사이트의 소자 카탈로그와 핀 번호를 읽는다. 인증된 `GET /api/admin/electronics/design`에서 카탈로그·요청 제한·필드를 조회할 수 있다.
3. `Circuit` JSON을 작성한다. 근거는 `provenance`와 `notes`에, 불명확한 핀·접점·설계값은 `reviewItems`에 기록한다. 미지원 소자를 임의로 다른 소자로 교체하지 않는다.
4. 관리자 화면의 **ChatGPT 설계 가져오기**에 JSON을 붙여 넣거나 JSON 파일을 연다. 사이트가 동일한 엔진으로 전체 소자 배치와 점퍼선을 생성한다.
5. 원문과 소자 이름·핀·연결을 비교하고, 배선 검사 오류와 미해결 확인 항목을 검토한다. 필요한 부분은 수정 후 다시 배치한다.
6. 지원 모델에 해당하면 ‘파형·계측’에서 CH1/CH2를 실제 빵판 구멍에 연결하고 입력·GND·전원 조건을 확인한 뒤 실행한다. 시간 파형, AC 이득/위상, DC 전압·단자 전류를 검토한다. 차동 출력은 MATH CH1−CH2를 사용하고 믹서 합·차 주파수는 시간 파형의 ‘주파수 성분’으로 확인한다. 배선 오류와 미지원 소자는 계산 전에 해결해야 한다.
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

사이트에서는 ‘파형·계측’의 CH1/CH2를 누른 뒤 실제 구멍 또는 소자/계측기 접점을 선택한다. 측정 노드는 보드 내부 연결과 실제 점퍼 양 끝을 따라 해석한다. 두 채널은 설정한 GND를 공통 기준으로 사용한다. 입력 노드, 사인파·사각파·삼각파·DC, 피크 진폭, 오프셋, 주파수, 위상, 추가 DC 전원과 시간/AC 범위를 확인한다. 기본 입력과 추가 입력 최대 3개를 함께 사용하며, 입력별 `phaseDegrees`는 −360~360°이고 생략하면 0°다. DC 입력은 오프셋만 사용한다. 입력·전원의 동일 노드 중복 구동과 GND 구동은 금지한다.

시간 응답은 모든 입력의 DC 오프셋으로 구한 동작점에서 시작한다. AC는 그 동작점 주변에서 **기본 `source`만 1 V 소신호**, `extraSources`는 AC 0 V로 계산한다. 입력의 시간영역 진폭·위상이나 실제 LO의 주기 동작을 AC sweep에 그대로 적용하는 방식이 아니다. 믹서 변환 이득은 시간영역 결과에서 필요한 주파수 성분을 측정한다.

MATH CH1−CH2는 시간영역 값을 빼고 AC는 두 복소 위상자를 뺀다. 두 빵판 출력 사이에 점퍼를 추가하지 않는다. ‘주파수 성분’은 계산된 시간 표본 전체(초기 과도응답 포함)의 평균 DC를 제거하고 Hann 창을 적용한 단측 FFT이며 V peak로 표시한다. 실제 관측 분해능은 샘플률/관측 표본 수다. 0 채움은 표시 주파수 간격만 좁히고 관측 분해능을 높이지 않는다. 정상상태 분리·주파수 누설·표본 사이의 고주파 앨리어싱을 자동으로 해결하지 않으므로 시간 범위와 샘플 수를 검토한다. 시간·AC·DC·스펙트럼은 각각 CSV로 저장하며 차동 채널도 포함할 수 있다.

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
    "offset": 0,
    "phaseDegrees": 0
  },
  "extraSources": [],
  "supplies": [],
  "durationSeconds": 0.005,
  "sampleCount": 1024,
  "acStartHz": 10,
  "acStopHz": 100000,
  "acPoints": 96
}
```

`extraSources`는 선택 항목이며 기본 `source`와 같은 형식으로 최대 3개를 넣는다. 예를 들어 LO_PLUS/LO_MINUS를 서로 다른 노드에 연결하고 각 5 mV peak, 위상 0°/180°로 구동할 수 있다. 이 설정만으로 실제 B1−B2가 10 mV라는 조건을 충족했다고 판단하지 말고 두 베이스에 프로브를 놓아 차동 진폭을 확인한다. 추가 DC 전원 `supplies`는 최대 8개다.

응답은 `{ ok, result, validation, probes }`이다. `probes`는 요청한 구멍의 실제 `holeId`/`netId`이고, `result`에는 `time`, 노드별 `nodeVoltages`, `dc.nodeVoltages`/`componentCurrents`/`sourceCurrents`, 비선형 소자가 있으면 `dc.deviceCurrents`, AC 주파수·노드별 이득 비율·위상, `warnings`가 포함된다. `result.model`은 현재 `linear-ideal` 또는 `nonlinear-educational`이다. 차동과 FFT는 반환된 표본/복소 AC 응답에서 사이트가 계산하는 측정값이며 API가 허구의 추가 입력 파형을 생성하지 않는다.

전류 방향을 구분한다. 저항의 `componentCurrents`는 1번 핀→2번 핀이 양수이고 커패시터 DC 전류는 0이다. 비선형 `deviceCurrents`는 예를 들어 `Q1: { C, B, E }`, `M1: { D, G, S }`, `D1: { A, K }` 형태이며 각 값은 해당 단자로 **유입되는 전류**가 양수다. 이상 전압원 `sourceCurrents`는 구동 노드→전원 방향이다. 세 단자 전류를 저항의 1→2 전류처럼 해석하지 않는다. 모든 결과의 `warnings`를 함께 검토한다.

요청은 1,000,000바이트 이하이며 시간 샘플 32~4096개, AC 지점 2~512개를 사용한다. 회로 크기와 시간 범위의 조합에는 별도 계산량 제한이 있다. 형식 오류는 400, 본문 용량 초과는 413, JSON 외 형식은 415, 배선 오류·미지원 모델·부유 노드 등 계산 불가는 422, 인증·권한 오류는 401/403이다. 클라이언트가 보낸 검사 결과나 홀 도통 정보는 신뢰하지 않고 보드 프로필에서 다시 구성해 검사한다.

카탈로그는 총 147개이고 제조사 데이터시트 핀 확인 41개, 범용 물리 모델 8개, 미검증 98개다. 이 수는 시뮬레이션 지원 모델 수가 아니다. 비선형 레지스트리에는 다음 12개가 있고, 직접 실장 가능한 모델은 BC109C를 제외한 11개다. `GET /api/admin/electronics/simulate`의 `nonlinearModels`에서 정확한 제조사별 `definitionId`, `rolePinIds`, 출처, 교육 파라미터, 제한과 `physicalPlacement`를 읽는다.

| 모델 | 제조사·패키지 및 핀 번호 순서 | 수치 방식 / 실장 |
| --- | --- | --- |
| 1N4148 | Vishay DO-35: A/K | Shockley / 직접 |
| BC549C, BC547B | onsemi TO-92: C/B/E | NPN Ebers–Moll / 직접 |
| BC556B, BC557B | onsemi TO-92: C/B/E | PNP Ebers–Moll / 직접 |
| 2N3904, 2N3906 | onsemi TO-92: E/B/C | NPN/PNP Ebers–Moll / 직접 |
| 2N7000TA | onsemi TO-92: S/G/D | N-MOS Level-1 / 직접 |
| BS170 | onsemi TO-92: D/G/S | N-MOS Level-1 / 직접 |
| IRF540N, IRF9540N | Infineon TO-220: G/D/S, 금속 탭=D | N/P-MOS Level-1 / 직접 |
| BC109C | Philips TO-18: E/B/C 및 케이스=C | NPN 수치 모델 등록 / 외부 실장 보류 |

BC549C·BC556B·BC109C는 수업 `Transistors.lib`의 Is/Bf/Br을 사용한 축소 Ebers–Moll이고, 2N7000은 같은 파일의 Zetex VTO/KP/LAMBDA와 바디 다이오드 값 일부를 사용한다. 제조사 핀맵 확인과 이 교육 파라미터의 출처는 다를 수 있다. 나머지는 명시적으로 선택한 교육값이다. 어느 것도 제조사 전체 SPICE 모델을 가져와 동일하게 재현했다는 뜻이 아니다. 모델은 300 K 고정이며 BJT Early 효과·고주입·접합 전하, MOS/다이오드 기생 용량·직렬 저항, 항복·열을 생략한다. Newton 반복용 지수 접선 연장 구간의 최종값은 정상 파형으로 사용하지 않는다.

CE, CE+CC, 푸시풀, MOS 전류 미러·차동쌍, 커패시터 LO BJT 믹서의 기본 템플릿 계산을 회귀 검증했다. 수업 BC109C를 일반 예제의 BC549C로 바꾸어 원본 재현을 완료했다고 표시하지 않는다. CS195 센터탭 변압기 핀/권선비, 마이크·음성원, 미등록 반도체/다른 IC, 변조·임의파형, DSP/MATLAB과 실장비 제어는 남은 범위다. UA741은 `opampModel: "educational-dynamic"`으로 유한이득·GBW·슬루율·출력 제한 교육 모델을 선택할 수 있다. 생략 시 기존 `ideal` 모델을 유지한다. `startupPerturbationVolts`는 0~0.01 V이며 기본 0 V다. 자율 발진 예제 기본값은 0.001 V의 결정적 초기조건이며 잡음을 재현하지 않는다. 양의 피드백 회로에는 `acUnavailableReason`과 빈 AC 배열을 반환한다. 이때 시간 파형·FFT를 사용하며 빈 AC를 0 이득으로 해석하지 않는다. 실제 출력전류·공통모드·열·포화 회복은 재현하지 않는다. 미지원 소자를 생략해 계산하지 않는다. 모든 수업 원회로의 판독·성능 검증이 완료된 상태는 아니다.

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

UA741 모델의 출력 부하 전류는 VCC/VEE 공급 전류로 반영하지 않으므로 소비전력·효율을 산출할 수 없다. 피드백 연결 경로 검사와 AC 결과는 일반 회로의 안정성 증명이 아니다.
