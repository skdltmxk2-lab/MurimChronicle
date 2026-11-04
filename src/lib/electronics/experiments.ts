import type { Experiment } from "./types";

const exp = (id: string, number: string, title: string, mode: Experiment["mode"], summary: string, topics: string[], settings: [string, string][], procedure: string[], templateIds: string[], future: string[]): Experiment => ({ id, number, title, mode, summary, topics, settings: settings.map(([label, value]) => ({ label, value })), procedure, templateIds, future });

/** Course instructions are separate from the submitted reports' answers and measurements. */
export const EXPERIMENTS: Experiment[] = [
  exp("lab-0", "0", "NI myDAQ 및 계측기 기초", "mixed", "가상 DMM·함수발생기·오실로스코프로 RC 응답을 측정합니다. 실제 myDAQ 제어와 전류계 직렬 삽입은 별도입니다.",
    ["DMM", "FGEN", "OSC", "RC", "Bode"],
    [["RC", "R=62 kΩ, C=1 nF"], ["입력", "1 Vpp · 1 kHz 정현파 / duty 50% 구형파"], ["RC 주파수", "0.1 / 1 / 2 / 3 / 4 / 5 / 10 kHz"], ["Bode", "10 Hz~20 kHz, 10 steps/decade"], ["루프백", "AO0→AI0+, AGND→AI0−"]],
    ["전원 +15 V/−15 V/+5 V와 200 Ω/1 kΩ/10 kΩ 저항을 측정합니다.", "전압계는 병렬, 전류계는 직렬로 연결하는 단계를 각각 확인합니다.", "FGEN 신호를 루프백으로 관찰하고 trigger·timebase·수직 범위를 조정합니다.", "RC를 조립하고 커패시터 양단과 저항 양단의 측정 위치를 구분합니다.", "Bode 입력/출력 및 공통 기준을 연결해 주파수 응답을 기록합니다."], ["rc-lowpass", "divider"],
    ["myDAQ 직접 제어·실제 전류계 직렬 연결 단계", "측정 파일 가져오기·장비별 Bode 설정 재현", "장비별 전류 제한·정격 자동 검증"]),
  exp("lab-1", "1", "소신호 증폭기", "circuit", "CE와 CE+CC 증폭기, 바이패스 제거·부하 변경·주파수 응답을 비교합니다.",
    ["BC549C", "공통 이미터", "이미터 팔로워", "부하", "마이크"],
    [["전원", "+9 V"], ["기본 입력", "10 mV peak · 1 kHz"], ["CE 부하", "100 kΩ / 10 kΩ / 1 kΩ"], ["CE+CC 부하", "100 kΩ / 10 kΩ / 1 kΩ / 100 Ω"], ["진폭 비교", "25 / 50 / 100 mV peak"]],
    ["입력과 부하를 분리한 DC 조건에서 VB/VC/VE를 측정합니다.", "CE 바이패스 커패시터 유무에 따른 입력·출력 파형을 비교합니다.", "부하를 바꾸고 출력저항 및 이득을 분석합니다.", "CE 뒤에 CC 버퍼를 붙인 뒤 같은 항목을 측정합니다.", "실험실 장비의 주파수 sweep과 myDAQ의 최대 20 kHz 범위를 분리합니다.", "마이크 바이어스 설계는 별도 입력 회로로 검토합니다."], ["ce-amplifier", "ce-cc-amplifier"],
    ["입력·부하 미연결 DC 단계와 주파수 전범위 검수", "마이크 극성·바이어스와 음성 입력", "제조사 고주파 모델·부품 편차·실측 비교"]),
  exp("lab-2", "2", "전력 증폭기", "circuit", "단일전원 741과 상보 출력단의 일반 예제는 교육용 동적 모델로 실행합니다. 수업 BC109C 원부품 검증과 양전원 741 기초 예제는 구분합니다.",
    ["UA741", "BC109C", "BC556B", "1N4148", "푸시풀", "효율"],
    [["수업 전원", "0/+9 V 단일전원"], ["출력 부하", "8.2 Ω, 출력 결합 C=100 µF"], ["입력", "회로1:100 mV peak / 회로2:2 V peak / 결합:0.1 V peak, 1 kHz"], ["설계 목표", "출력 DC 3 V, AC 이득 크기 6"]],
    ["중간 바이어스 노드를 실제 GND와 구분합니다.", "741 입력·출력 DC 전압을 확인합니다.", "NPN/PNP와 다이오드 바이어스 및 이미터 저항을 검수합니다.", "전압 증폭기와 출력단을 결합하고 피드백 위치 VMI/VMO를 비교합니다.", "부하 전압·공급 전류를 측정해 전력과 효율을 계산합니다."], ["ua741-inverting", "push-pull-stage", "ua741-push-pull"],
    ["BC109C 원부품·단일전원 741 단독회로 재현", "VMI/VMO 피드백 변형·목표 DC/AC 설계", "실제 출력전류·소모전력·열·부하 정격 검증"]),
  exp("lab-3", "3", "MOSFET 바이어스 및 차동 증폭기", "circuit", "전류 미러, 공통모드 입력 범위, AC 차동 증폭을 단계별로 다룹니다.",
    ["2N7000", "전류 미러", "차동 증폭", "공통모드"],
    [["실험실 조건", "VDD=6 V, IREF=20±2 mA"], ["myDAQ 대안", "VDD=5 V, IREF=27 mA — 별도 프로필"], ["RREF 탐색", "50~450 Ω, 50 Ω 간격"], ["VX sweep", "0~1 V:0.1 V / 1~6 V:0.5 V"], ["AC 입력", "50 mV peak · 10 kHz"]],
    ["두 MOS의 핀 S/G/D를 제조사 데이터시트와 대조합니다.", "기준 전류를 측정하며 RREF를 조정합니다.", "VX를 바꾸어 출력전류와 출력저항을 분석합니다.", "차동쌍을 추가하고 공통 입력을 0~6 V로 바꿉니다.", "두 입력 바이어스와 커플링을 조립해 VD1/VD2 및 단일 출력 VO1을 측정합니다."], ["mos-current-mirror", "mos-differential"],
    ["수업 도면과 시뮬레이션의 부하 연결 충돌 검수", "개별 소자의 문턱전압·매칭 모델", "전류 목표에 따른 저항 자동 설계"]),
  exp("lab-4", "4", "발진기 및 신호 발생기", "circuit", "Wien·RC 발진과 슈미트 예제를 교육용 동적 741 모델로 실행합니다. 발진 시동 외란과 실제 741의 한계를 구분합니다.",
    ["UA741", "Wien bridge", "히스테리시스", "RC 발진"],
    [["전원", "±9 V"], ["Wien 선별망", "10 kΩ 두 개, 1 nF 두 개"], ["Wien 이득 저항", "14~30 kΩ, 2 kΩ 간격"], ["슈미트 sweep", "−9→+9 V 및 +9→−9 V, 1 V 간격"], ["RC 조합", "5/6.8 kΩ 및 0.22/0.1 µF"], ["설계", "구형파 기본주파수 10 kHz"]],
    ["수동 RC 선별망의 주파수 응답을 측정합니다.", "741 전원 핀과 피드백을 연결하고 저항 변화에 따른 발진을 관찰합니다.", "슈미트 입력의 상승·하강 방향을 보존해 문턱을 기록합니다.", "구형파 발생기의 커패시터와 피드백 값을 변경합니다.", "출력 포화·slew rate·측정점 차이를 검토합니다."], ["wien-bridge", "schmitt-inverting", "schmitt-noninverting", "relaxation-oscillator"],
    ["원문 전체 RC·이득저항 조합과 실물 진폭 안정화", "원문 R1 양단 측정·감쇠기 변형·DC 스윕", "10 kHz 조건 자동 설계"]),
  exp("lab-5", "5", "Multiplier", "mixed", "BJT 3개 회로의 입력 위치와 센터탭 트랜스 유무에 따라 세 가지 구성을 비교합니다.",
    ["BC109C", "차동쌍", "센터탭 변압기", "혼합", "DSA"],
    [["전원", "+9 V"], ["회로1", "20 mV peak · 1 kHz"], ["회로2", "10 mV peak · 10 kHz"], ["회로3", "vM:10 mV peak/1 kHz, vC:10 mV peak/10 kHz"], ["출력", "VOUT1−VOUT2"], ["설계", "곱 항 계수 b를 1.2배로 변경"]],
    ["원본 BC109C의 실제 패키지와 변압기 단자를 확인합니다.", "입력 미인가 DC 상태와 입력 인가 상태를 분리합니다.", "VB1/VB2/VB3/VS/VOUT1/VOUT2를 측정합니다.", "두 출력은 오실로스코프 Math 또는 검증된 차동 측정으로 뺍니다.", "주파수 성분을 분석한 뒤 저항 변경 설계를 비교합니다."], ["bjt-mixer"],
    ["BC109C TO-18 물리 배치", "센터탭 트랜스 실제 단자·권선 모델", "전체 SPICE 모델의 사이트 엔진 통합", "원문 곱 항 계수 b의 1.2배 설계 검증"]),
  exp("lab-6", "6", "PC/Matlab 음성 입출력 · DSA", "mixed", "본 실험은 음성 데이터 처리이며, 별도 DSA 실습은 myDAQ 단자 루프백입니다.",
    ["WAV", "음계", "음색", "스펙트로그램", "DSA"],
    [["DSA 연결", "AO0→AI0+, AGND→AI0−"], ["기본 신호", "1 Vpp · 1 kHz 정현파/50% 구형파"], ["DSA 기본", "span 40,000 / resolution 400 / window none"], ["비교", "span 20k/40k/80k, resolution 200/400/800"], ["구형파 DSA", "span 8,000 / resolution 800"]],
    ["마이크 녹음과 WAV 저장, 음계의 주파수 비교를 수행합니다.", "악보를 신호로 합성하고 하모닉 비율로 음색을 변경합니다.", "DSA 루프백을 연결해 정현파와 구형파를 측정합니다.", "span·resolution·window를 각각 바꾸어 결과를 묶어 기록합니다.", "기본파·고조파·PSD의 단위를 구분합니다."], [],
    ["오디오 녹음·재생", "WAV 가져오기·음계 합성", "오디오 FFT·PSD·스펙트로그램", "myDAQ 장비 연결 그림"]),
  exp("lab-7", "7", "Sampling/Aliasing · AWG", "mixed", "샘플링과 재생률 변경을 구분하고, AWG의 두 채널 파형을 비교합니다.",
    ["샘플링", "aliasing", "하모닉", "AWG"],
    [["예비", "1 kHz 음, 1초; fs=2/4/3/1.8/1.6 kHz"], ["악보", "fs=8 kHz, 4분음표 0.5초"], ["하모닉", "기본파+2/3/4차"], ["AWG", "1 Vpp · 1 kHz; sample rate 1/5/20 kS/s"], ["출력률 비교", "sample rate 20 kS/s, update rate 5/20/100 kS/s"], ["2채널", "AO0=Editor, AO1=MATLAB; 20/200 kS/s"]],
    ["샘플링 주파수를 바꾸어 시간파형·소리·스펙트로그램을 비교합니다.", "하모닉을 포함한 곡과 원 신호를 비교합니다.", "지정 음원 10초 구간의 샘플링 조건을 기록합니다.", "AWG의 생성 sample rate와 출력 update rate를 별도로 설정합니다.", "두 채널 출력은 샘플 수를 동일하게 맞춥니다. AWG와 FGEN은 동시에 사용하지 않습니다."], [],
    ["샘플 데이터·WDT 가져오기", "재생률 변경/재생성/리샘플링 구분", "음원·파형 비교", "AWG 직접 제어"]),
  exp("lab-8", "8", "Digital filter design · AWG 2", "mixed", "디지털 필터와 오디오 대역 분리 과제입니다. 빵판의 아날로그 필터로 자동 치환하지 않습니다.",
    ["FIR", "LPF/BPF", "음악 합성", "AWG2"],
    [["대역", "0~1 / 1~2 / 2~3 / 3~4 / 4~5 kHz"], ["악보", "분반·조별 지정곡 2악절 또는 8마디"], ["AWG2", "100 Hz · 1 Vpp · 0.05초; 500/1,000 S/s"], ["저장 데이터 LPF", "fs=50,000 Hz, fpass=200 Hz, fstop=300 Hz"], ["스펙트로그램", "0~2 kHz 비교"]],
    ["주파수 응답을 확인하며 디지털 LPF/BPF를 설계합니다.", "지정 음원 약 10초를 다섯 대역으로 분리합니다.", "악보의 기본파·2/3/4차 하모닉 성분을 분리하고 비율을 달리해 합성합니다.", "AWG2의 sample/update rate를 맞추어 출력·측정합니다.", "OSC 저장 데이터에 MATLAB 필터를 적용합니다. 출력률과 측정 샘플링률은 별개입니다."], [],
    ["FIR 설계·계수 저장", "음원 필터링·대역 재합성", "측정 TXT/MAT 파일 파싱", "시간파형·스펙트로그램"]),
  exp("lab-9", "9", "Modulation", "signal", "Hilbert 경로와 SSB 측대역, 좌우 오디오 변조를 다루는 신호처리 실험입니다.",
    ["DSB", "SSB", "Hilbert", "AWG/DSA"],
    [["예비 합성", "500/750/1,000 Hz, fs=10 kHz"], ["예비 반송파", "2.5 kHz"], ["분반 반송파", "월16 / 화17 / 수18 / 목19 / 금22 kHz"], ["오디오", "left/right 분리, 필요시 5 kHz 이하 LPF"]],
    ["기본 신호와 DSB 신호의 시간·주파수 특성을 비교합니다.", "Hilbert 변환으로 analytic signal을 구성합니다.", "USB/LSB 및 실수 SSB를 비교합니다.", "좌·우 오디오를 서로 다른 측대역에 배치하고 합성합니다.", "AWG/DSA 측정 설정을 신호처리 조건과 연결합니다."], [],
    ["Hilbert·변조 연산", "블록 다이어그램", "오디오 채널 분리", "분반 조건 충돌 확인"]),
  exp("lab-10", "10", "Demodulation · Music synthesis", "signal", "실험9의 신호를 복조하고 악기 음색을 분석·합성합니다.",
    ["복조", "FFT", "배음", "piano/flute", "음악 합성"],
    [["입력", "실험9 bandpass 신호"], ["악기 자료", "piano_A4.wav, flute_A4.wav 및 비교 음원"], ["악보", "실험8 분반·조별 지정곡"]],
    ["실험9 신호를 기저대역으로 복조해 좌·우 채널을 복원합니다.", "악기 WAV의 시간파형·FFT·스펙트로그램을 확인합니다.", "배음의 크기·위상을 분석해 유사한 소리를 합성합니다.", "지정곡에 piano/flute 음색을 입히고 두 곡을 결합합니다."], [],
    ["원본 음원 입력", "복조·배음 분석", "악기 음색 합성", "실험8→9→10 파일 의존성 관리"]),
  exp("project-2025", "P25", "2025 설계 — BJT 믹서·디지털 필터", "mixed", "공식 조건은 트랜스를 쓰지 않고 두 커패시터로 LO를 인가합니다. 일반 믹서 예제와 원본 설계 검수를 구분합니다.",
    ["BC109C 3개", "차동 출력", "키트 제한", "IF", "디지털 필터"],
    [["전원", "+9 V"], ["RF", "10 mV peak · 1 kHz"], ["LO", "4 kHz, B1−B2 차동 진폭 10 mV"], ["목표", "3 kHz 성분의 전압이득 >15"], ["출력", "VO1−VO2"], ["스펙트럼", "0~20 kHz"]],
    ["그림의 트랜스를 문장 조건에 따라 제거하고 LO 결합을 설계합니다.", "허용 키트 안에서 RBB3/RBB4/REE/RC1/RC2를 설계합니다.", "DC 바이어스와 실제 차동 입력 진폭을 확인합니다.", "두 출력의 차를 측정하고 IF 성분을 검증합니다.", "입력 변형 0.01cos(2π·200t)cos(2π·1000t)를 비교합니다.", "저장 파형에 디지털 필터를 적용합니다."], ["bjt-mixer"],
    ["BC109C 실물 배치", "채널 수·LO 구동 방식 확정", "키트 저항 조합으로 3 kHz 목표 이득 자동 설계", "측정 파일 가져오기·디지털 필터·데이터 내보내기"]),
  exp("project-2024", "P24", "2024 사례 — 개별 BJT OP AMP", "mixed", "학생 설계 사례의 6 BJT OP AMP와 적분기를 별도 유형으로 보존합니다. 공식 과제 정답으로 취급하지 않습니다.",
    ["BC547B/BC558B/BC556B", "6 BJT", "비교기", "적분기"], [["전원", "±15 V"], ["자료 상태", "학생 보고서, 해당 연도 공식 공지 미확인"]],
    ["6 BJT 하위 회로의 부품·연결을 원본과 대조합니다.", "비교기와 비반전 증폭기 동작을 확인합니다.", "적분기 피드백을 구성하고 구형파 응답을 측정합니다.", "저장 데이터의 이동평균·피크·골짜기를 분석합니다."], [],
    ["다단 BJT 하위 회로", "복합 블록과 펼친 부품 동기화", "원회로 핀맵·배선 검수", "적분기·측정 데이터 분석"]),
  exp("project-2023", "P23", "2023 변형 — 믹서 설계", "mixed", "공식 공지의 RF 1 kHz·LO 7 kHz 조건과 AM 입력 수식을 확인했습니다. 함수발생기의 AM 입력은 수치 검증했으며 2023 전용 원회로와 목표 이득은 별도입니다.", ["믹서", "AM 발생기", "연도별 조건"], [["주파수", "RF 1 kHz / LO 7 kHz / IF 6 kHz"], ["목표", "전압이득 >19.5"], ["입력 진폭", "8 / 10 / 12 mV 비교"], ["변조 입력", "0.01(1+0.2cos(2π·300t))cos(2π·1000t)"], ["AM 설정", "반송파 1 kHz · 10 mV peak · 위상 90° · 변조 300 Hz · 깊이 0.2"]], ["트랜스 대신 두 커패시터로 LO를 인가하고 B1−B2 진폭을 확인합니다.", "해당 연도 목표에 맞춰 부품값과 측정 조건을 설정합니다.", "AM 설정으로 원문 입력 수식을 만들고 반송파와 양쪽 측파대를 확인합니다. 입력 검증과 믹서 출력 성능 검증을 구분합니다."], [], ["2023 전용 원회로·목표 이득 검증", "6 kHz 디지털 필터"]),
  exp("project-2022", "P22", "2022 변형 — 믹서 설계", "mixed", "RF/LO/IF와 목표 이득이 다른 과거 설계 변형입니다.", ["믹서", "진폭 sweep"], [["주파수", "RF 1 kHz / LO 5 kHz / IF 4 kHz"], ["목표", "전압이득 >17.5"], ["입력 진폭", "8 / 10 / 12 mV 비교"]], ["2022 공식 공지의 회로와 신호를 검수합니다.", "진폭별 특성과 변조 신호·필터 조건을 비교합니다."], [], ["2022 원회로 검수", "이득·진폭 비교", "변조 신호·디지털 필터"]),
];

/** Whole-course coverage, distinct from whether an individual example can run.
 * Source: docs/electronics-course-coverage.md. "partial" never means that every
 * source variant, physical part, performance target, or measurement is verified.
 */
export type CourseSupportScope = {
  id: string;
  status: "partial" | "guide";
  available: string[];
  remaining: string[];
};

export const COURSE_SUPPORT_SCOPE: CourseSupportScope[] = [
  { id: "lab-0", status: "partial", available: ["62 kΩ·1 nF RC 배치·시간파형·주파수 응답", "가상 DMM 전압·가지 전류·무전원 저항/도통/분리 다이오드", "스코프 트리거·V/div·시간축·커서와 7종 함수발생기"], remaining: ["실제 전류계 직렬 삽입·장비 부하 모델", "myDAQ 포트별 연결 변형·실제 제어", "원문 전체 계측 조건·장비 전류 제한 검증"] },
  { id: "lab-1", status: "partial", available: ["원문 주요 값과 연결을 대조한 CE·CE+CC 예제", "CE Ce 유무·100 kΩ/10 kΩ/1 kΩ 부하와 CC 100 Ω까지 수치 검증", "1 kHz·25/50/100 mV의 포화·이득 압축 검증", "가상 스코프·B/C/E 단자 전류·구간 평균/AC RMS 측정"], remaining: ["입력·부하 미연결 DC 단계·주파수 전범위", "마이크 바이어스·음성 입력", "제조사 고주파 모델·실물 성능 검증"] },
  { id: "lab-2", status: "partial", available: ["단일전원 741·푸시풀 일반 예제의 시간파형·AC 실행", "NPN·PNP·다이오드와 741 교육용 동적 모델", "+9 V·1 kHz·100 mV 입력의 출력 범위 검증", "부하 전압·지원 소자 단자 전류의 구간 평균/AC RMS"], remaining: ["수업 BC109C 원부품 배치·피드백 변형", "실제 741 출력전류·부하별 포화·전력·효율", "출력 DC 3 V·이득 6 설계 검증"] },
  { id: "lab-3", status: "partial", available: ["2N7000 미러·차동쌍 일반 예제와 장비 조건 분리", "교육 모델 RREF 50~450 Ω·VX 0~6 V 스윕 수치 검증", "공통모드 8개 대표 조건의 대칭·전류 보존 검증"], remaining: ["RREF·VX·공통모드 자동 스윕 UI", "RL1 원문 연결 충돌 확인", "실제 MOS 편차·목표 전류 검증"] },
  { id: "lab-4", status: "partial", available: ["Wien·RC 발진의 명시적 시동·주파수 관계 검증", "반전 슈미트의 삼각파 히스테리시스·비반전 예제 실행", "741 교육용 유한이득·대역폭·슬루율·전원 제한", "스코프 상승/하강 트리거·커서·신뢰 가능한 반복 주파수 측정"], remaining: ["원문 전체 저항·C 조합과 ±9 V DC 스윕", "실제 741 진폭 안정화·측정점·감쇠기 검증", "10 kHz 자동 설계·실측 검증"] },
  { id: "lab-5", status: "partial", available: ["원문 세 회로·다섯 조건의 별도 수치 비교 화면", "BC109C 축약 모델·이상 센터탭 변압기와 권선비 가정", "PDF DC·진폭·9/10/11 kHz 성분 대조 및 독립 SPICE 교차 검증"], remaining: ["BC109C·센터탭 트랜스 실물 배치 검수", "전체 SPICE 모델의 사이트 엔진 통합과 실제 변압기 파라미터", "곱 항 계수 b의 1.2배 설계"] },
  { id: "lab-6", status: "guide", available: ["음성·음계·음색 실험 조건", "myDAQ DSA 연결과 설정 안내"], remaining: ["WAV 녹음·재생·음계 합성", "오디오 FFT·PSD·스펙트로그램", "실제 myDAQ 입출력"] },
  { id: "lab-7", status: "guide", available: ["샘플링·aliasing 조건", "AWG sample rate·update rate 구분"], remaining: ["오디오 리샘플링·하모닉 합성", "WDT·표본 파일 입출력", "AWG 파형 비교 실행"] },
  { id: "lab-8", status: "guide", available: ["FIR·다섯 대역·재합성 조건", "AWG2·측정 데이터 LPF 절차"], remaining: ["FIR 설계·계수·필터링 실행", "음원 대역 분리·재합성", "측정 파일 파싱·스펙트로그램"] },
  { id: "lab-9", status: "guide", available: ["DSB·SSB·Hilbert 과제 안내", "분반별 반송파 조건"], remaining: ["Hilbert·USB/LSB 연산", "좌우 오디오 변조·합성", "샘플링률·측대역 분석"] },
  { id: "lab-10", status: "guide", available: ["복조·배음·음악 합성 절차", "실험 8·9 입력 의존성 안내"], remaining: ["오디오 복조·배음 분석", "piano·flute 음색 합성", "원본 음원·WAV 입출력"] },
  { id: "project-2025", status: "partial", available: ["공식 RF 1 kHz·LO 4 kHz·IF 3 kHz 조건", "일반 BJT 믹서·차동 출력·주파수 성분 분석", "독립 발생기·스코프·DMM 및 배선 검증 후 측정 API"], remaining: ["BC109C 원부품·실제 LO 구동 검수", "키트 제약에서 IF 이득 >15 자동 설계", "억압반송파 곱 입력·측정 파일·디지털 필터"] },
  { id: "project-2024", status: "guide", available: ["6 BJT OPAMP·비교기·증폭기·적분기 유형 안내", "학생 사례와 공식 조건 구분"], remaining: ["6 BJT 원회로·핀맵·소자값 검수", "다단 회로와 포화·적분 동작 검증", "측정 데이터 분석"] },
  { id: "project-2023", status: "partial", available: ["공식 RF 1 kHz·LO 7 kHz·IF 6 kHz 확인", "AM 발생기 10 mV peak·1 kHz·위상 90°·변조 300 Hz·깊이 0.2", "원문 입력 수식·700/1000/1300 Hz 성분 진폭 수치 검증"], remaining: ["2023 전용 원회로·BC109C 실물 검수", "실제 차동 LO 진폭·IF 이득 >19.5 설계", "6 kHz 디지털 필터"] },
  { id: "project-2022", status: "guide", available: ["공식 RF 1 kHz·LO 5 kHz·IF 4 kHz 확인", "입력 진폭·변조 조건 안내"], remaining: ["연도별 BC109C 원회로 검수", "IF 이득 >17.5 설계", "4 kHz 디지털 필터"] },
];
