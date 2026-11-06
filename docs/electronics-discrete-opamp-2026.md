# 2026 설계과제 — 이산 BJT Op-Amp 템플릿

작성 2026-11-06. 2026 설계과제 공지(Lab1~5 회로를 바탕으로 Op-Amp를 직접 설계)에 맞춘 사용자 설계안이다. 수업 원회로나 정답이 아니며 실물 성능은 아직 측정하지 않았다.

## 회로

| 블록 | 소자 | 바탕 |
|---|---|---|
| 입력단 | Q1·Q2·Q3 BC109C(TO-18 성형), RC1·RC2 1 kΩ, RB1 82 kΩ, RB2 22 kΩ, REE 1 kΩ | Lab5 회로1, Lab3 차동증폭 |
| 이득단 | Q4 BC556B, CC 1 nF + RZ 47 Ω | Lab1 CE |
| 바이어스 | D1·D2 1N4148, RL2 10 kΩ | Lab2 회로2 |
| 출력단 | Q5 BC109C, Q6 BC556B, RE5·RE6 100 Ω | Lab2 회로2 |

전원 ±9 V. myDAQ ±15 V에서는 RB2 12 kΩ. 템플릿은 같은 코어에 응용 회로만 다르다.

- `discrete-opamp-noninverting`: RF 10 kΩ, RG 1 kΩ, 1 kHz · 100 mV peak
- `discrete-opamp-comparator`: 반전 입력 82 kΩ/2 kΩ 분압(약 0.21 V), 1 kHz · 500 mV peak
- `discrete-opamp-sallen-key`: R=1 kΩ(입력은 2 kΩ 두 개로 두 발생기 합성), C=100 nF, RF 5.6 kΩ/RG 10 kΩ. VIN(신호 500 Hz)과 VNOISE(잡음 8 kHz) 각 600 mV peak, 기본 7.5 ms · 4096 표본

세 템플릿 모두 "VIN · VOUT 자동 설정"이 기본 발생기 입력과 OUT을 고른다. LPF는 처음에 입력 노드를 `LPIN_LO`로 이름 지었다가, 자동 설정이 "LO"를 믹서 국부발진기로 읽어 8 kHz 발생기를 기본 입력으로 고르고 500 Hz를 빼 버리는 문제가 있어 `VIN`/`VNOISE`로 바꿨다. CH2 프로브도 중간 노드 대신 VIN에 둔다(중간 노드는 OUT과 출력 후보 점수가 같아 알파벳 순으로 선택됐다).

## 엔진 변경(이 템플릿을 실행하기 위한 범위)

1. `SimulationConfig.timeStepPolicy = "damp-fast-rc"`(선택 사항). 기본값은 기존과 같고, 이 정책일 때만 RC 추정 시상수의 1/100 제한을 빼고 입력 표본 한도만 적용한다. CC 1 nF와 RZ 47 Ω의 추정 시상수 47 ns 때문에 1 kHz 파형이 내부 단계 한도(65,536)를 넘던 문제를 푼다. 빠른 RC 성분은 후진 오일러로 감쇠되며, 결과에 경고 문구를 붙인다. `defaultSimulationConfig`는 `discrete-opamp-` 템플릿에만 켠다.
2. Newton DC 동작점: 기존 고정 10단계 source stepping이 실패한 경우에만 적응형 source stepping과 gmin 단계 축소를 추가로 시도한다. 최종 해는 원래 전원과 gmin 0에서 수렴해야 한다. 기존에 수렴하던 회로의 경로는 바뀌지 않는다.

## 검증 결과

사이트 엔진(교육용 Ebers–Moll, Early 효과·접합 용량 없음):

| 항목 | 사이트 엔진 | 독립 ngspice(공개 근사 모델) |
|---|---|---|
| 배치·연결 검사 | 1장 830홀, split·continuous 모두 통과 | 별도 830홀 검사기 통과 |
| 비반전 ×11 이득 | 10.96 | 10.95 |
| 비반전 출력 DC | −0.10 V | −0.026 V(입력 오프셋 −2.4 mV ×11) |
| 비교기 출력 | +8.24 / −8.18 V | +8.24 / −8.27 V |
| LPF 500 Hz 성분(입력 환산 0.3 V) | 0.464 V | 300 Hz에서 0.467 V |
| LPF 8 kHz 성분 | 0.018 V | 0.018 V |

시간 간격을 2배로 줄여도(표본 2048→4096) 이득·포화 전압이 같았다. `tests/test_electronics_discrete_opamp.mjs`가 핀-넷 표, 배치 검증, 정책 범위, 세 응용의 수치 범위를 고정한다.

## 남은 확인

- 키트의 PNP·저항 실제 수량과 값, 실제 β, 빵판 레일 분할 여부
- 실측 개방루프 이득·오프셋·슬루율. 사이트 모델에는 Early 효과와 접합 용량이 없어 개방루프 대역과 슬루율은 ngspice 결과를 참고한다.
- 수업 `Transistors.lib` 모델로 재계산
