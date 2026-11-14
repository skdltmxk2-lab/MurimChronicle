import type { Circuit, CircuitComponent, InstrumentConnection } from "./types";

const c = (id: string, definitionId: string, value: string, nets: string[]): CircuitComponent => ({ id, definitionId, value, pinNets: Object.fromEntries(nets.map((net, i) => [String(i + 1), net])) });
const r = (id: string, value: string, a: string, b: string) => c(id, "resistor-axial", value, [a, b]);
const cap = (id: string, value: string, a: string, b: string) => c(id, "capacitor-ceramic", value, [a, b]);
const el = (id: string, value: string, plus: string, minus: string) => c(id, "capacitor-electrolytic", value, [plus, minus]);
const bjt = (id: string, collector: string, base: string, emitter: string) => c(id, "bjt-bc549c-onsemi-to92", "BC549C", [collector, base, emitter]);
const mos = (id: string, source: string, gate: string, drain: string) => c(id, "mosfet-2n7000ta-onsemi-to92", "2N7000TA", [source, gate, drain]);
const op = (minus: string, plus: string, out = "OUT") => c("U1", "opamp-ua741cn-st-dip8", "UA741CN", ["U1_OPEN_1", minus, plus, "VEE", "U1_OPEN_5", out, "VCC", "U1_OPEN_8"]);
const port = (id: string, instrument: string, name: string, netId: string, setting?: string): InstrumentConnection => ({ id, instrument, port: name, netId, setting });
const supply = (voltage = "+9 V", bipolar = false): InstrumentConnection[] => [port("ps-positive", "DC 전원", "+", "VCC", voltage), port("ps-ground", "DC 전원", "공통 기준", "GND", "0 V"), ...(bipolar ? [port("ps-negative", "DC 전원", "−", "VEE", "−9 V")] : [])];
const input = (setting = "1 kHz · 10 mV peak", net = "IN"): InstrumentConnection[] => [port("fg-signal", "함수발생기", "출력", net, setting), port("fg-ground", "함수발생기", "기준", "GND")];
const probe = (net = "OUT"): InstrumentConnection[] => [port("osc-tip", "오실로스코프", "CH1 프로브", net), port("osc-ground", "오실로스코프", "CH1 기준", "GND")];
const decoupling = () => [cap("CD1", "100 nF", "VCC", "GND"), cap("CD2", "100 nF", "VEE", "GND")];
const make = (id: string, title: string, description: string, components: CircuitComponent[], instruments: InstrumentConnection[], notes: string[], provenance = "일반 교육 예제. 수업 원회로의 검수 완료본이 아닙니다."): Circuit => ({
  id, title, description, components, instruments, netNames: Object.fromEntries([...new Set([...components.flatMap((x) => Object.values(x.pinNets)), ...instruments.map((x) => x.netId)])].map((n) => [n, n === "GND" ? "공통 기준 0 V" : n.startsWith("U1_OPEN") ? "미연결 핀 — 점퍼 금지" : n])),
  notes: ["핀 연결 목록에 따른 조립 예제입니다. 연결 검증은 시뮬레이션·성능·실물 검증을 의미하지 않습니다.", ...notes],
  reviewItems: [{ id: `${id}-physical`, message: "실물 부품의 제조사·패키지·극성과 빵판 레일 구조를 확인하세요.", resolved: false }], provenance,
});

const ceCore = () => [r("RB1", "33 kΩ", "VCC", "BASE"), r("RB2", "10 kΩ", "BASE", "GND"), r("RC", "22 kΩ", "VCC", "COLLECTOR"), r("RE", "10 kΩ", "EMITTER", "GND"), bjt("Q1", "COLLECTOR", "BASE", "EMITTER"), el("CIN", "100 µF", "BASE", "IN"), el("CE", "100 µF", "EMITTER", "GND")];

const pushPullCore = () => [
  r("RBN", "2.2 kΩ", "VCC", "BN"), r("RBP", "2.2 kΩ", "BP", "GND"),
  c("D1", "diode-1n4148-vishay-do35", "1N4148", ["BN", "DRIVE"]), c("D2", "diode-1n4148-vishay-do35", "1N4148", ["DRIVE", "BP"]),
  bjt("QN", "VCC", "BN", "EN"), c("QP", "bjt-bc556b-onsemi-to92", "BC556B", ["GND", "BP", "EP"]),
  r("REN", "4.7 Ω", "EN", "POWER_OUT"), r("REP", "4.7 Ω", "POWER_OUT", "EP"),
  el("COUT", "100 µF", "POWER_OUT", "OUT"), r("RL", "8.2 Ω", "OUT", "GND"),
];

const powerTemplates: Circuit[] = [
  make("push-pull-stage", "상보 푸시풀 출력단", "다이오드 바이어스·이미터 저항·출력 결합 커패시터", [...pushPullCore(), el("CIN", "100 µF", "DRIVE", "IN")], [...supply(), ...input("1 kHz · 50 mV peak부터 저진폭 확인"), ...probe(), port("power-dc", "DMM", "DC 측정 +", "POWER_OUT")], ["BC549C/BC556B로 구성한 일반 예제입니다. 수업 BC109C 원부품을 자동 대체한 검증 회로가 아닙니다.", "8.2 Ω 부하는 작은 출력에서도 큰 전류를 요구합니다. 정격·바이어스 전류·발열을 검증하기 전 과제의 2 V 진폭을 그대로 인가하지 않습니다.", "D1/D2의 방향과 NPN/PNP의 C/B/E를 각각 확인합니다. 출력 부하에 DC가 직접 걸리지 않도록 COUT을 포함합니다."], "실험 2 상보 출력단 토폴로지 참고. 핀 연결 예제이며 동작·전력·원본 일치 검증 전."),
  make("ua741-push-pull", "단일전원 741 + 푸시풀", "중간 기준전압과 출력단을 포함한 음의 피드백", [...pushPullCore(), c("U1", "opamp-ua741cn-st-dip8", "UA741CN", ["U1_OPEN_1", "SUM", "VREF", "GND", "U1_OPEN_5", "DRIVE", "VCC", "U1_OPEN_8"]), r("RREF1", "22 kΩ", "VCC", "VREF"), r("RREF2", "22 kΩ", "VREF", "GND"), el("CREF", "100 µF", "VREF", "GND"), el("CIN", "100 µF", "INPUT_AC", "IN"), r("RIN", "10 kΩ", "INPUT_AC", "SUM"), r("RF", "100 kΩ", "POWER_OUT", "SUM"), cap("CD1", "100 nF", "VCC", "GND")], [...supply(), ...input("1 kHz · 5 mV peak부터 저진폭 확인"), ...probe(), port("drive-probe", "오실로스코프", "CH2 프로브", "DRIVE")], ["741의 4번 핀은 GND이고 7번은 +9 V입니다. VREF는 중간 바이어스이며 접지와 연결하지 않습니다.", "피드백은 커패시터 전의 POWER_OUT에서 가져옵니다. DRIVE로 옮기는 실험은 별도 변형입니다.", "루프 안정성·출력전류·소모전력·741 입력범위는 아직 검증하지 않았습니다. 작은 신호에서 동작점을 확인하는 예제입니다.", "BC109C 원부품 대신 BC549C를 쓴 일반 예제로, 수업 원회로·이득 목표를 만족하는 최종 설계가 아닙니다."], "실험 2 전압+전력 증폭 회로군 참고. 단일전원·피드백 위치를 명시한 일반 예제, 성능 검증 전."),
 ];

/**
 * 2026 design project: discrete BJT op-amp built from the Lab1~5 blocks, run
 * from an NI myDAQ only. Input pair + tail source (Lab5), PNP CE gain stage with
 * Miller Cc + Rz (Lab1), diode bias (Lab2) and complementary push-pull output
 * (Lab2). The op-amp runs from ±9 V made by a separate emitter-follower block
 * on the myDAQ ±15 V terminals: ±15 V directly would put about 29 V across the
 * BC109C output transistor in comparator saturation (VCEO 20 V), and the AO
 * terminals are limited to 2 mA. Only the application network changes between
 * the three op-amp templates.
 */
const formed109 = (id: string, collector: string, base: string, emitter: string): CircuitComponent => ({ ...c(id, "bjt-bc109c-philips-to18", "BC109C", [emitter, base, collector]), physicalProfile: "bc109c-to18-formed-v1" });
const pnp556 = (id: string, collector: string, base: string, emitter: string) => c(id, "bjt-bc556b-onsemi-to92", "BC556B", [collector, base, emitter]);
const discreteOpampCore = () => [
  formed109("Q1", "C1", "INM", "E12"), formed109("Q2", "C2", "INP", "E12"), formed109("Q3", "E12", "B3", "E3"),
  r("RC1", "1 kΩ", "VCC", "C1"), r("RC2", "1 kΩ", "VCC", "C2"), r("RB1", "82 kΩ", "GND", "B3"), r("RB2", "22 kΩ", "B3", "VEE"), r("REE", "1 kΩ", "E3", "VEE"),
  pnp556("Q4", "N5", "C2", "VCC"), r("RZ", "51 Ω", "C2", "NZ"), cap("CC", "1 nF", "NZ", "N5"),
  c("D1", "diode-1n4148-vishay-do35", "1N4148", ["N5", "NM"]), c("D2", "diode-1n4148-vishay-do35", "1N4148", ["NM", "N6"]), r("RL2", "10 kΩ", "N6", "VEE"),
  formed109("Q5", "VCC", "N5", "E5"), pnp556("Q6", "VEE", "N6", "E6"), r("RE5", "100 Ω", "E5", "OUT"), r("RE6", "100 Ω", "E6", "OUT"),
  cap("CD1", "0.22 µF", "VCC", "GND"), cap("CD2", "0.22 µF", "VEE", "GND"),
];
/** NI myDAQ screw terminals. The ELVISmx FGEN drives AO0 only; two tones use the ARB on AO0 and AO1. AI0−/AI1− go to AGND. */
const fromSupplyBlock = (): InstrumentConnection[] => [
  port("ps-positive", "±9 V 전원부", "+9 V 출력 (VP9)", "VCC", "+9 V"), port("ps-ground", "±9 V 전원부", "GND · myDAQ AGND", "GND", "0 V"), port("ps-negative", "±9 V 전원부", "−9 V 출력 (VN9)", "VEE", "−9 V"),
];
const mydaqGenerator = (instrument: string, channel: "AO0" | "AO1", net: string, setting: string, id = "fg"): InstrumentConnection[] => [
  port(`${id}-signal`, `${instrument} · ${channel}`, channel, net, setting), port(`${id}-ground`, `${instrument} · ${channel}`, "AGND", "GND"),
];
const mydaqScope = (inputNet: string): InstrumentConnection[] => [
  port("osc-input", "myDAQ 오실로스코프", "AI0+ (사이트 CH1 · 입력)", inputNet), port("osc-input-ref", "myDAQ 오실로스코프", "AI0− · AGND", "GND"),
  port("osc-tip", "myDAQ 오실로스코프", "AI1+ (사이트 CH2 · 출력)", "OUT"), port("osc-ground", "myDAQ 오실로스코프", "AI1− · AGND", "GND"),
];
const discreteOpampNotes = [
  "myDAQ만 사용합니다. 전원은 ‘myDAQ ±9 V 전원부’ 예제의 VP9·VN9·GND를 이 보드의 +9 V(VCC)·−9 V(VEE)·GND 레일에 연결합니다. 입력은 AO0(·AO1), 측정은 AI0(입력, 사이트 CH1)·AI1(출력, 사이트 CH2)이며 AI0−·AI1−는 AGND에 연결합니다. 두 채널을 함께 측정하면 채널당 최대 샘플률은 절반(100 kS/s)입니다.",
  "블록 구성: Q1·Q2 차동쌍 + Q3 전류원(Lab5), Q4 PNP 공통이미터 이득단과 Miller 보상 CC 1 nF + RZ 51 Ω(Lab1), D1·D2 바이어스(Lab2), Q5·Q6 푸시풀 출력단(Lab2). INP(Q2 베이스)가 비반전, INM(Q1 베이스)이 반전 입력입니다.",
  "BC109C 4개는 TO-18 성형 프로필로 배치합니다. 부품 값은 수업 실험 부품 목록 2세트 안에서 골랐습니다(RZ는 목록 표기 50 Ω, 실물 키트 51 Ω. CD1·CD2 0.22 µF). Op-Amp에 NPN 4·PNP 2·1N4148 2, 전원부에 NPN 1·PNP 1이 들어가 BC109C 5개·BC556B 3개가 필요합니다.",
  "myDAQ ±15 V를 이 보드에 직접 넣지 않습니다. 비교기처럼 출력이 −14 V까지 내려가면 Q5(BC109C)에 약 29 V가 걸려 VCEO 20 V를 넘습니다. ±9 V에서는 최대 약 17.3 V입니다.",
  "이득단·출력단까지 꽂은 뒤에는 피드백을 연결한 상태로 전원을 넣습니다. 개방루프 DC는 입력 오프셋이 약 2500배 증폭되어 포화합니다(비교기 예제는 의도된 포화).",
  "이 보드의 계산은 VCC·VEE를 전원부 출력값 ±9 V로 고정합니다. 전원부 자체(약 ±9.0 V)는 ‘myDAQ ±9 V 전원부’ 예제에서 따로 계산합니다. 수치 결과는 교육용 Ebers–Moll 모델(Early 효과·접합 용량 없음)과 damp-fast-rc 시간 정책의 근사입니다. 독립 ngspice(공개 근사 모델) 기준 개방루프 이득 약 2500, 단위이득 주파수 약 1.7 MHz, 슬루율 약 0.5 V/µs이며 실측으로 확인해야 합니다.",
];
const discreteProvenance = "2026 설계과제 공지(Lab1~5 회로 기반 Op-Amp 설계)에 맞춘 사용자 설계안, myDAQ 단독 구성. 수업 원회로나 정답이 아니며 실물 성능은 미검증입니다.";
const mydaqSupplyTemplate = (): Circuit => {
  const circuit = make("discrete-opamp-mydaq-supply", "myDAQ ±9 V 전원부 (Op-Amp용)", "myDAQ +15V·−15V 단자에서 이미터 팔로워 두 개로 VP9≈+9 V, VN9≈−9 V를 만듭니다",
    [formed109("QRP", "VCC", "BRP", "VP9"), r("RRP1", "12 kΩ", "VCC", "BRP"), r("RRP2", "22 kΩ", "BRP", "GND"), cap("CRP", "1 nF", "BRP", "GND"),
      pnp556("QRN", "VEE", "BRN", "VN9"), r("RRN1", "22 kΩ", "GND", "BRN"), r("RRN2", "12 kΩ", "BRN", "VEE"), cap("CRN", "1 nF", "BRN", "GND"),
      r("RTP", "6.8 kΩ", "VP9", "GND"), r("RTN", "6.8 kΩ", "VN9", "GND")],
    [port("mydaq-p15", "myDAQ 전원", "+15V 단자", "VCC", "+15 V"), port("mydaq-agnd", "myDAQ 전원", "AGND", "GND", "0 V"), port("mydaq-n15", "myDAQ 전원", "−15V 단자", "VEE", "−15 V"),
      port("osc-input", "myDAQ 오실로스코프", "AI0+ (사이트 CH1 · +9 V)", "VP9"), port("osc-input-ref", "myDAQ 오실로스코프", "AI0− · AGND", "GND"),
      port("osc-tip", "myDAQ 오실로스코프", "AI1+ (사이트 CH2 · −9 V)", "VN9"), port("osc-ground", "myDAQ 오실로스코프", "AI1− · AGND", "GND")],
    ["myDAQ +15V·−15V·AGND 단자만 씁니다. 이 보드의 +15 V(VCC)·−15 V(VEE) 레일은 myDAQ 전원이고, 출력 VP9·VN9를 Op-Amp 보드의 +9 V·−9 V 레일에 연결합니다. GND는 myDAQ AGND와 Op-Amp 보드 GND를 함께 묶습니다. AI 범위가 ±10 V라 ±15 V 레일은 AI로 재지 않습니다(DMM 사용).",
      "분압: 15 V×22 kΩ/34 kΩ≈9.71 V가 QRP·QRN 베이스에 걸리고, VBE 약 0.68 V만큼 낮아진(음전원은 높아진) 약 ±9.0 V가 출력됩니다. CRP·CRN 1 nF는 베이스를 고주파에서 접지해 myDAQ 전원의 빠른 잡음을 거릅니다.",
      "RTP·RTN 6.8 kΩ은 시험 부하(레일당 약 1.3 mA)입니다. 먼저 이 상태로 VP9·VN9를 확인한 뒤 시험 부하를 빼고 Op-Amp 보드에 연결합니다. Op-Amp를 연결하면 레일당 약 2.3 mA가 흐릅니다.",
      "AO 단자를 전원으로 쓰지 않는 이유: AO는 채널당 최대 2 mA라 Op-Amp 전류를 감당하지 못하고 전압이 처집니다. ±15 V 단자는 각각 32 mA까지 공급합니다.",
      "소비전력: Op-Amp 하나를 연결하면 ±15 V에서 각각 약 2.6 mA(약 80 mW)입니다. myDAQ 전원·AO·DIO 합계 한도는 500 mW(typical), 최소 100 mW입니다.",
      "myDAQ ±15 V가 14.0~15.3 V로 변하면 출력은 약 ±8.4~±9.2 V로 따라 변합니다(ngspice 공개 근사 모델). QRP·QRN은 VCE가 약 6 V라 다른 소신호 NPN·PNP로 바꿔도 됩니다."], discreteProvenance);
  circuit.netNames = { ...circuit.netNames, VCC: "+15 V", VEE: "−15 V", VP9: "VP9 (+9 V)", VN9: "VN9 (−9 V)" };
  return circuit;
};
const ninePlusMinus = (circuit: Circuit): Circuit => ({ ...circuit, netNames: { ...circuit.netNames, VCC: "+9 V", VEE: "−9 V" } });
const discreteOpampTemplates: Circuit[] = [
  mydaqSupplyTemplate(),
  ...[make("discrete-opamp-noninverting", "이산 BJT Op-Amp · 비반전 증폭기 ×11 (myDAQ)", "Lab1~5 블록으로 만든 Op-Amp에 RF 10 kΩ/RG 1 kΩ 피드백. 전원 ±9 V 전원부, 입력 AO0, 측정 AI0·AI1",
    [...discreteOpampCore(), r("RF", "10 kΩ", "OUT", "INM"), r("RG", "1 kΩ", "INM", "GND"), r("RL", "10 kΩ", "OUT", "GND")],
    [...fromSupplyBlock(), ...mydaqGenerator("myDAQ FGEN", "AO0", "INP", "1 kHz · 200 mVpp"), ...mydaqScope("INP")],
    [...discreteOpampNotes, "FGEN: 사인파, 1 kHz, 200 mVpp(100 mV peak), DC offset 0. 이상 이득 1+RF/RG=11, 유한 개방루프 이득을 넣으면 약 10.95라 출력은 약 2.19 Vpp입니다. 부하 RL 10 kΩ은 기준 부하입니다."], discreteProvenance),
  make("discrete-opamp-comparator", "이산 BJT Op-Amp · 비교기 (myDAQ)", "개방루프, 반전 입력에 82 kΩ/2 kΩ 분압 기준 약 0.21 V. 전원 ±9 V 전원부, 입력 AO0, 측정 AI0·AI1",
    [...discreteOpampCore(), r("RV1", "82 kΩ", "VCC", "INM"), r("RV2", "2 kΩ", "INM", "GND"), r("RL", "10 kΩ", "OUT", "GND")],
    [...fromSupplyBlock(), ...mydaqGenerator("myDAQ FGEN", "AO0", "INP", "1 kHz · 1 Vpp"), ...mydaqScope("INP")],
    [...discreteOpampNotes, "FGEN: 사인파, 1 kHz, 1 Vpp(500 mV peak). 기준 전압 9 V×2 kΩ/84 kΩ≈0.21 V. 입력이 기준보다 높으면 출력은 양의 포화(약 +8.2 V), 낮으면 음의 포화(약 −8.3 V)이며 myDAQ AI 범위 ±10 V 안입니다. 전환 속도는 슬루율로 제한됩니다."], discreteProvenance),
  make("discrete-opamp-sallen-key", "이산 BJT Op-Amp · Sallen-Key 2차 LPF (myDAQ)", "fc≈1.59 kHz, K≈1.51. AO0(500 Hz)·AO1(8 kHz)을 2 kΩ 두 개로 합성. 전원 ±9 V 전원부, 측정 AI0·AI1",
    [...discreteOpampCore(), r("R1A", "2 kΩ", "VIN", "LPA"), r("R1B", "2 kΩ", "VNOISE", "LPA"), r("R2", "1 kΩ", "LPA", "INP"), cap("C1", "100 nF", "LPA", "OUT"), cap("C2", "100 nF", "INP", "GND"),
      r("RF", "5.1 kΩ", "OUT", "INM"), r("RG", "10 kΩ", "INM", "GND"), r("RL", "10 kΩ", "OUT", "GND")],
    [...fromSupplyBlock(), ...mydaqGenerator("myDAQ ARB", "AO0", "VIN", "500 Hz · 1.2 Vpp"), ...mydaqGenerator("myDAQ ARB", "AO1", "VNOISE", "8 kHz · 1.2 Vpp", "fg2"), ...mydaqScope("VIN")],
    [...discreteOpampNotes, "ELVISmx FGEN은 AO0 하나만 쓰므로 두 신호는 ARB(임의 파형 발생기)로 냅니다. AO0=500 Hz, AO1=8 kHz 사인파를 각각 1.2 Vpp로 두고, 두 채널을 같은 범위(±10 V)·같은 갱신률(예: 200 kS/s)로 설정합니다.",
      "R1 1 kΩ 자리를 2 kΩ 두 개의 병렬 합성(테브난 1 kΩ)으로 바꿔 VIN(신호 500 Hz)과 VNOISE(잡음 8 kHz)를 더합니다. 각 0.6 V peak 입력은 합성 노드 기준 각 0.3 V peak에 해당하며 AO 전류는 채널당 0.5 mA 이하입니다.",
      "fc=1/(2πRC)=1.59 kHz, K=1+5.1/10=1.51, Q=1/(3−K)≈0.67. 8 kHz는 통과대역 대비 약 −28 dB입니다. RF는 키트에 5.6 kΩ이 없어 5.1 kΩ을 씁니다."], discreteProvenance),
  ].map(ninePlusMinus),
];

export const CIRCUIT_TEMPLATES: Circuit[] = [
  make("divider", "저항 분압기", "두 저항의 중간 전압을 확인하는 기본 회로", [r("R1", "10 kΩ", "VCC", "OUT"), r("R2", "10 kΩ", "OUT", "GND")], [...supply("+5 V"), ...probe()], ["같은 저항을 사용할 때 무부하 출력은 전원 전압의 절반입니다. 계측기 입력저항에 따른 부하 효과는 별도입니다."]),
  make("rc-lowpass", "RC 저역통과 필터", "실험 0의 RC 계측에 사용할 기본 연결", [r("R1", "62 kΩ", "IN", "OUT"), cap("C1", "1 nF", "OUT", "GND")], [...input("1 kHz · 1 Vpp"), ...probe(), port("osc-input", "오실로스코프", "CH2 프로브", "IN")], ["출력은 커패시터 양단입니다. 저항 양단 측정은 별도의 차동 계측 연결이 필요합니다."], "실험 0 자료의 R=62 kΩ, C=1 nF 조건을 반영한 기본 RC 예제. 계측기 연결 변형은 별도 검수."),
  make("rc-highpass", "RC 고역통과 필터", "커패시터 직렬·저항 접지 연결", [cap("C1", "100 nF", "IN", "OUT"), r("R1", "10 kΩ", "OUT", "GND")], [...input("1 kHz · 1 Vpp"), ...probe()], ["출력은 저항 양단입니다. 커패시터는 비극성 모델을 사용합니다."]),
  make("led-series", "LED 전류제한", "직렬 저항과 LED의 극성을 확인", [r("R1", "1 kΩ", "VCC", "LED_A"), c("D1", "led-5mm", "적색 LED", ["LED_A", "GND"])], supply("+5 V"), ["LED의 A/K와 실물 표시를 확인합니다. 저항 없이 전원을 연결하지 않습니다."]),
  make("ce-amplifier", "BJT 공통 이미터 증폭기", "바이어스·바이패스·입출력 커플링을 포함한 CE 예제", [...ceCore(), el("COUT", "100 µF", "COLLECTOR", "OUT"), r("RL", "10 kΩ", "OUT", "GND")], [...supply(), ...input(), ...probe()], ["CE를 제거한 경우는 바이패스 효과 비교 실험입니다. RL 교체와 입력 진폭 변경은 별도 실험 상태로 기록하세요.", "DC 측정은 입력 신호를 끈 상태에서 BASE/COLLECTOR/EMITTER를 측정합니다."], "실험 1의 BC549C·9 V·33 kΩ/10 kΩ/22 kΩ/10 kΩ 조건 기반. 수업 원본 모든 연결과 실물 동작은 추가 검수 필요."),
  make("ce-cc-amplifier", "CE + 이미터 팔로워", "CE 전압 증폭 뒤에 CC 버퍼를 연결", [...ceCore(), bjt("Q2", "VCC", "COLLECTOR", "BUFFER"), r("RE2", "2 kΩ", "BUFFER", "GND"), el("COUT", "100 µF", "BUFFER", "OUT"), r("RL", "10 kΩ", "OUT", "GND")], [...supply(), ...input(), ...probe()], ["Q1 컬렉터가 Q2 베이스를 바이어스합니다. 출력 커패시터의 +는 BUFFER 쪽입니다.", "100 Ω 부하 시험은 출력전류와 동작점을 검토한 뒤 별도 조건으로 진행합니다."], "실험 1 CE+CC 회로군의 일반 구현 예제. 제출 보고서의 실측 이득을 정답으로 사용하지 않음."),
  make("ua741-inverting", "UA741 반전 증폭기", "양전원 반전 증폭기의 일반 예제", [op("SUM", "GND"), r("RIN", "10 kΩ", "IN", "SUM"), r("RF", "100 kΩ", "OUT", "SUM"), ...decoupling()], [...supply("+9 V", true), ...input("1 kHz · 100 mV peak"), ...probe()], ["이 예제는 ±9 V 양전원입니다. 실험 2의 0/+9 V 단일전원·중간 바이어스 회로와 다릅니다.", "1·5·8번은 각각 독립된 미연결 노드로 둡니다. 741 출력 스윙과 입력 범위를 확인합니다."]),
  make("schmitt-inverting", "반전 슈미트 트리거", "반전 입력과 양의 피드백", [op("IN", "THRESHOLD"), r("RF", "10 kΩ", "OUT", "THRESHOLD"), r("RG", "5 kΩ", "THRESHOLD", "GND"), ...decoupling()], [...supply("+9 V", true), ...input("DC 입력을 서서히 증가/감소"), ...probe()], ["입력 상승·하강 순서를 보존해 히스테리시스를 측정합니다.", "실제 문턱값은 이상적인 ±9 V가 아닌 실제 출력 포화전압에 영향을 받습니다."], "실험 4 회로군 참고. UA741 일반 슈미트 예제, 원본 그림별 저항 위치 검수 전."),
  make("schmitt-noninverting", "비반전 슈미트 트리거", "입력과 양의 피드백이 비반전 단자에서 합쳐짐", [op("GND", "THRESHOLD"), r("RIN", "5 kΩ", "IN", "THRESHOLD"), r("RF", "10 kΩ", "OUT", "THRESHOLD"), ...decoupling()], [...supply("+9 V", true), ...input("DC 입력 증가/감소"), ...probe()], ["입력은 RIN을 거쳐 3번 핀으로 연결합니다. 반전 입력 2번은 GND입니다."], "실험 4 비반전 슈미트 회로군 참고, 일반 예제."),
  make("wien-bridge", "Wien bridge 발진기", "RC 선별망과 비반전 증폭기로 구성", [op("FEEDBACK", "WIEN"), r("RF", "22 kΩ", "OUT", "FEEDBACK"), r("RG", "10 kΩ", "FEEDBACK", "GND"), r("RS", "10 kΩ", "OUT", "RC_SERIES"), cap("CS", "1 nF", "RC_SERIES", "WIEN"), r("RP", "10 kΩ", "WIEN", "GND"), cap("CP", "1 nF", "WIEN", "GND"), ...decoupling()], [...supply("+9 V", true), ...probe()], ["외부 주기 신호를 넣지 않습니다. 진폭 안정화 소자가 없는 기본 예제로 출력이 포화될 수 있습니다.", "부품 오차·741 대역폭·시동 조건을 포함한 발진 성능은 아직 시뮬레이션 검증하지 않았습니다."], "실험 4의 10 kΩ/1 nF 선별망과 저항 이득 조절 조건을 참고한 교육 예제."),
  make("relaxation-oscillator", "UA741 RC 구형파 발생기", "슈미트 트리거와 커패시터 충방전", [op("RAMP", "THRESHOLD"), r("RT", "1 kΩ", "OUT", "RAMP"), cap("CT", "100 nF", "RAMP", "GND"), r("RF", "10 kΩ", "OUT", "THRESHOLD"), r("RG", "5 kΩ", "THRESHOLD", "GND"), ...decoupling()], [...supply("+9 V", true), ...probe(), port("ramp-probe", "오실로스코프", "CH2 프로브", "RAMP")], ["시간상수와 피드백 비율이 주기를 결정합니다. 실제 741의 slew rate·포화 회복으로 이상적인 구형파와 달라집니다."], "실험 4 RC 발진기 회로군의 일반 예제. 원문 R1/R2/R3 표기와 물리 연결 대응은 추가 검수."),
  make("mos-current-mirror", "2N7000 전류 미러", "다이오드 접속 기준 MOS와 출력 MOS", [r("RREF", "220 Ω", "VCC", "BIAS"), mos("M1", "GND", "BIAS", "BIAS"), mos("M2", "GND", "BIAS", "DRAIN")], [...supply("+6 V"), port("ps-vx", "별도 DC 전원", "VX +", "DRAIN", "0~6 V sweep"), port("ps-vx-gnd", "별도 DC 전원", "VX 기준", "GND")], ["220 Ω는 시작값 예제이며 IREF=20 mA 달성을 보증하지 않습니다. 개별 VGS 차이에 맞춰 RREF를 조정합니다.", "실험실 6 V/20 mA 조건과 myDAQ 대안 5 V/27 mA 조건을 혼합하지 마세요."], "실험 3 전류 미러 토폴로지 참고. 목표 전류·출력저항은 측정/모델 검증 필요."),
  make("mos-differential", "MOS 전류미러 + 차동 증폭기", "4개의 nMOS, 두 입력 바이어스 및 단일 출력", [r("RREF", "220 Ω", "VCC", "BIAS"), mos("MREF", "GND", "BIAS", "BIAS"), mos("MTAIL", "GND", "BIAS", "TAIL"), mos("M1", "TAIL", "G1", "D1"), mos("M2", "TAIL", "G2", "D2"), r("RD1", "200 Ω", "VCC", "D1"), r("RD2", "200 Ω", "VCC", "D2"), r("RG11", "10 kΩ", "VCC", "G1"), r("RG12", "10 kΩ", "G1", "GND"), r("RG21", "10 kΩ", "VCC", "G2"), r("RG22", "10 kΩ", "G2", "GND"), cap("CIN1", "1 µF", "IN", "G1"), cap("CIN2", "1 µF", "G2", "GND"), el("COUT", "10 µF", "D1", "OUT"), r("RL", "10 kΩ", "OUT", "GND")], [...supply("+6 V"), ...input("10 kHz · 50 mV peak"), ...probe()], ["정확한 목표 전류는 RREF 조정과 실물 MOS 매칭에 달려 있습니다.", "원문 회로와 시뮬레이션 그림의 RL 연결이 충돌해 이 예제는 출력 커플링 뒤 부하를 명시적으로 선택했습니다."], "실험 3 회로군 참고. 원문 충돌 항목 검수 전인 일반 배선 예제."),
  make("bjt-mixer", "BJT 믹서 — 커패시터 LO 예제", "3개의 BJT, RF 입력과 대칭 LO 입력", [bjt("Q1", "OUT1", "B1", "TAIL"), bjt("Q2", "OUT2", "B2", "TAIL"), bjt("Q3", "TAIL", "B3", "E3"), r("RC1", "10 kΩ", "VCC", "OUT1"), r("RC2", "10 kΩ", "VCC", "OUT2"), r("RB31", "82 kΩ", "VCC", "B3"), r("RB32", "12 kΩ", "B3", "GND"), r("RE", "1 kΩ", "E3", "GND"), el("CE", "100 µF", "E3", "GND"), el("CRF", "100 µF", "B3", "RF"), r("RB11", "62 kΩ", "VCC", "B1"), r("RB12", "30 kΩ", "B1", "GND"), r("RB21", "62 kΩ", "VCC", "B2"), r("RB22", "30 kΩ", "B2", "GND"), cap("CLO1", "1 µF", "LO_PLUS", "B1"), cap("CLO2", "1 µF", "LO_MINUS", "B2")], [...supply(), port("rf", "RF 발생기", "출력", "RF", "1 kHz · 10 mV peak"), port("rf-gnd", "RF 발생기", "기준", "GND"), port("lo1", "대칭 LO 발생기", "+위상", "LO_PLUS", "4 kHz · B1−B2 차동 진폭 10 mV로 조정"), port("lo2", "대칭 LO 발생기", "−위상", "LO_MINUS", "4 kHz · 180° 반대 위상"), port("lo-gnd", "대칭 LO 발생기", "기준", "GND"), port("out1", "오실로스코프", "CH1 프로브", "OUT1"), port("out2", "오실로스코프", "CH2 프로브", "OUT2"), port("osc-gnd", "오실로스코프", "공통 기준", "GND")], ["일반 배치 예제로 BC549C를 사용합니다. 수업/프로젝트의 BC109C를 무검증 대체한 최종 설계가 아닙니다.", "LO 입력은 서로 반대 위상의 두 단자입니다. 실제 발생기 채널 수와 구동 방법을 확인해야 합니다.", "출력은 CH1−CH2입니다. OUT1과 OUT2를 점퍼로 연결하거나 한 출력을 접지하지 않습니다.", "2025 프로젝트의 3 kHz 성분 이득 >15와 키트 제한은 이 예제로 보증하지 않습니다. 저항값을 검증·설계해야 합니다."], "실험 5 BJT 믹서 및 2025 프로젝트의 트랜스 제외 조건을 참고한 일반 예제. 원본 BC109C·실물/성능 검수 전."),
  ...powerTemplates,
  ...discreteOpampTemplates,
];
