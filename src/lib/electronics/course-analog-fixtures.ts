import { CIRCUIT_TEMPLATES } from "./templates";
import { defaultSimulationConfig } from "./simulation";
import { ensureReferenceConnections } from "./reference-connections";
import type { Circuit, CircuitComponent } from "./types";
import type { SimulationConfig } from "./simulation-types";

export type CourseAnalogSource = { label: string; pages: number[] };
export type CourseAnalogReference = {
  label: string;
  metric: string;
  expected: number;
  unit: string;
  relativeTolerance: number;
  absoluteTolerance: number;
  basis: "pdf-simulation" | "pdf-measured" | "independent-equation" | "assignment-target";
  source: CourseAnalogSource;
};
export type CourseAnalogCase = {
  id: string;
  experimentId: string;
  title: string;
  kind: "analog";
  source: CourseAnalogSource[];
  sourcePages: string[];
  conditions: string[];
  circuit: Circuit;
  config: SimulationConfig;
  probes: string[];
  references: CourseAnalogReference[];
  notes: string[];
  blockedReason?: string;
};

const source = (lab: number, pages: number[], measured = false): CourseAnalogSource => ({ label: `실험 ${lab} ${measured ? "결과" : "예비"} 보고서`, pages });
const reference = (label: string, metric: string, expected: number, unit: string, provenance: CourseAnalogSource, basis: CourseAnalogReference["basis"] = "pdf-simulation", relativeTolerance = 0.05, absoluteTolerance = 1e-6): CourseAnalogReference => ({ label, metric, expected, unit, relativeTolerance, absoluteTolerance, basis, source: provenance });
const component = (id: string, definitionId: string, value: string, nets: string[]): CircuitComponent => ({ id, definitionId, value, pinNets: Object.fromEntries(nets.map((net, i) => [String(i + 1), net])) });
const resistor = (id: string, value: number, a: string, b: string) => component(id, "resistor-axial", `${value} Ω`, [a, b]);
const capacitor = (id: string, value: string, a: string, b: string) => component(id, "capacitor-ceramic", value, [a, b]);
const cloneTemplate = (id: string): Circuit => structuredClone(CIRCUIT_TEMPLATES.find(item => item.id === id)!);
function setValue(circuit: Circuit, id: string, value: string | number) {
  const part = circuit.components.find(item => item.id === id);
  if (!part) throw new Error(`Course fixture component missing: ${id}`);
  part.value = typeof value === "number" ? `${value} Ω` : value;
}
function remove(circuit: Circuit, ids: string[]) { circuit.components = circuit.components.filter(part => !ids.includes(part.id)); }
function rawCircuit(id: string, components: CircuitComponent[]): Circuit {
  return { id, title: id, description: "수업 원문 회로의 수치 검증 조건", components, instruments: [], netNames: {}, notes: [], reviewItems: [], provenance: "실험 0~4 예비·결과 보고서의 지정 페이지" };
}
function tidy(circuit: Circuit): Circuit {
  const nets = [...new Set(circuit.components.flatMap(part => Object.values(part.pinNets)))];
  circuit.instruments = circuit.instruments.filter(port => nets.includes(port.netId));
  circuit.netNames = Object.fromEntries(nets.map(net => [net, net === "GND" ? "공통 기준 0 V" : net]));
  return circuit;
}
function configuration(circuit: Circuit, input = "IN", frequency = 1000, amplitude = 0.01, voltage = 9): SimulationConfig {
  return { ...defaultSimulationConfig(circuit), groundNetId: "GND", source: { netId: input, waveform: "sine", frequencyHz: frequency, amplitudePeak: amplitude, offset: 0, phaseDegrees: 0 }, supplies: circuit.components.some(part => Object.values(part.pinNets).includes("VCC")) ? [{ netId: "VCC", voltage }] : [], extraSources: [], durationSeconds: 5 / frequency, sampleCount: 1025, acStartHz: frequency, acStopHz: frequency, acPoints: 2 };
}
function dcConfiguration(circuit: Circuit, net = "VCC", voltage = 9): SimulationConfig {
  const config = configuration(circuit, net);
  return { ...config, source: { ...config.source, waveform: "dc", amplitudePeak: 0, offset: voltage }, supplies: config.supplies.filter(item => item.netId !== net), durationSeconds: 0.001, sampleCount: 32 };
}
const cases: CourseAnalogCase[] = [];
function add(lab: number, id: string, title: string, circuit: Circuit, config: SimulationConfig, pages: number[], conditions: string[], probes: string[], references: CourseAnalogReference[] = [], notes: string[] = [], blockedReason?: string) {
  tidy(circuit);
  circuit.id = id; circuit.title = title;
  circuit.notes = [...notes];
  circuit.provenance = `실험 ${lab} 예비 보고서 p.${pages.join(", ")}. 원문 조건과 현재 수치 모델의 비교용 회로.`;
  const primary = source(lab, pages);
  const sources = [primary, ...references.map(item => item.source)].filter((item, index, all) => all.findIndex(other => JSON.stringify(other) === JSON.stringify(item)) === index);
  cases.push({ id, experimentId: `lab-${lab}`, title, kind: "analog", source: sources, sourcePages: sources.map(item => `${item.label} p.${item.pages.join(", ")}`), conditions, circuit, config, probes, references, notes, ...(blockedReason ? { blockedReason } : {}) });
}

// Lab 0. Ideal source calculations are kept separate from myDAQ load regulation.
for (const [voltage, resistance] of [[15, 10000], [15, 1000], [15, 200], [-15, 10000], [5, 10000], [1, 1000], [1, 200]]) {
  const circuit = rawCircuit("lab0-load", [resistor("RL", resistance, "IN", "GND")]);
  const refs = [reference("이상 전원 부하 전압", "dc:IN", voltage, "V", source(0, [3, 6, 7], true), "independent-equation", 1e-8), reference("옴의 법칙 전류", "resistorCurrent:RL", voltage / resistance, "A", source(0, [6], true), "independent-equation", 1e-8, 1e-10)];
  add(0, `l0-dc-${voltage}v-${resistance}ohm`, `DC ${voltage} V · ${resistance} Ω`, circuit, dcConfiguration(circuit, "IN", voltage), [1], [`전압 ${voltage} V`, `부하 ${resistance} Ω`], ["IN"], refs, ["전원 출력저항·전류제한과 DMM 부담전압은 현재 모델에 없습니다. 실험0 결과 p.4·7의 부하에 따른 전압강하와 별도입니다."]);
}
for (const waveform of ["sine", "square"] as const) {
  const circuit = rawCircuit("lab0-loopback", []), config = configuration(circuit, "IN", 1000, 0.5);
  config.source.waveform = waveform;
  add(0, `l0-loopback-${waveform}`, `myDAQ 직접 루프백 · ${waveform}`, circuit, config, [1, 2], ["AO0→AI0+, AGND→AI0−", "1 Vpp · 1 kHz", "사각파 duty 50%"], ["IN"], [reference("발생기 Vpp", "vpp:IN", 1, "V", source(0, [9, 11], true), "assignment-target")], [], "직접 장비 루프백에는 빵판 소자가 없으며 현재 회로 엔진은 실제 소자 핀의 노드를 요구합니다. 발생기 파형과 계측기 직접 연결 실행은 별도 검증이 필요합니다.");
}
const rcFrequencies = [100, 1000, 2000, 3000, 4000, 5000, 10000];
const rcMeasuredC = [0.98244, 0.87037, 0.74128, 0.64377, 0.55652, 0.48247, 0.28219];
const rcMeasuredR = [0.04602, 0.32001, 0.54093, 0.67714, 0.77157, 0.83147, 0.93479];
rcFrequencies.forEach((frequency, i) => {
  const circuit = cloneTemplate("rc-lowpass"), omegaRC = 2 * Math.PI * frequency * 62000 * 1e-9;
  const config = configuration(circuit, "IN", frequency, 0.5);
  if (frequency === 100) config.durationSeconds = 4 / frequency;
  add(0, `l0-rc-${frequency}hz`, `RC 주파수 ${frequency} Hz`, circuit, config, [4, 5, 6], ["R=62 kΩ, C=1 nF", "1 Vpp", "R 양단은 IN−OUT 차동 측정"], ["IN", "OUT", "IN-OUT"], [
    reference("C 양단 AC 이득·독립 전달식", "gain:OUT", 1 / Math.hypot(1, omegaRC), "V/V", source(0, [4, 5, 6]), "independent-equation", 1e-7),
    reference("C 양단 Vpp·실측", "vpp:OUT", rcMeasuredC[i], "V", source(0, [15], true), "pdf-measured"),
    reference("R 양단 Vpp·실측", "vpp:IN-OUT", rcMeasuredR[i], "V", source(0, [15], true), "pdf-measured"),
  ]);
});
{
  const circuit = cloneTemplate("rc-lowpass"), config = configuration(circuit, "IN", 1000, 0.5);
  config.acStartHz = 10; config.acStopHz = 20000; config.acPoints = 35;
  add(0, "l0-bode", "RC Bode 10 Hz~20 kHz", circuit, config, [4, 5, 6], ["R=62 kΩ, C=1 nF", "10 steps/decade 지시", "35점 로그 sweep은 끝점 포함 근사이며 원 계측기 샘플 파일은 미제공"], ["IN", "OUT"], [], ["이상 차단주파수 1/(2πRC)=2567.015 Hz. 원문 결과 p.16~18은 화면 그림이므로 숫자 원시 데이터와 직접 비교하지 않았습니다."]);
}

// Lab 1. A disconnected output coupling capacitor is omitted, never tied to ground.
{
  const circuit = cloneTemplate("ce-amplifier"); remove(circuit, ["CIN", "COUT", "RL"]);
  add(1, "l1-ce-dc-open", "CE 입력·부하 미연결 DC", circuit, dcConfiguration(circuit), [1, 2], ["BC549C", "+9 V", "33k/10k/22k/10k Ω", "입력원·출력 부하 미연결"], ["BASE", "COLLECTOR", "EMITTER"], [
    ...[["BASE", 2.091], ["COLLECTOR", 5.751], ["EMITTER", 1.480]].map(([net, value]) => reference(`${net} DC`, `dc:${net}`, Number(value), "V", source(1, [2]), "pdf-simulation", 0.02, 0.01)),
    reference("Q1 컬렉터 DC 전류", "current:Q1:C", 147.7e-6, "A", source(1, [2]), "pdf-simulation", 0.05, 1e-6),
    reference("VC 실측", "dc:COLLECTOR", 5.16803, "V", source(1, [2], true), "pdf-measured", 0.02, 0.01),
  ], ["결합 C의 미연결 끝을 임의 부하로 접지하지 않았습니다."]);
}
for (const bypass of [true, false]) {
  const circuit = cloneTemplate("ce-amplifier"); remove(circuit, ["COUT", "RL", ...(bypass ? [] : ["CE"])]);
  add(1, `l1-ce-open-${bypass ? "bypass" : "unbypassed"}`, `CE 무부하 · Ce ${bypass ? "있음" : "제거"}`, circuit, configuration(circuit), [2, 3, 4], ["10 mV peak · 1 kHz", "RL 미연결", `Ce ${bypass ? "100 µF" : "제거"}`], ["BASE", "COLLECTOR"], [reference("컬렉터 Vpp", "vpp:COLLECTOR", bypass ? 2.259 : 0.042882, "V", source(1, [3, 4])), reference("이득 크기", "transientGain:COLLECTOR", bypass ? 113 : 2.144, "V/V", source(1, [3, 4]))]);
}
for (const [index, load] of [100000, 10000, 1000].entries()) {
  for (const bypass of [true, false]) {
    const circuit = cloneTemplate("ce-amplifier"); setValue(circuit, "RL", load); if (!bypass) remove(circuit, ["CE"]);
    add(1, `l1-ce-load-${load}-${bypass ? "bypass" : "unbypassed"}`, `CE · RL ${load} Ω · Ce ${bypass ? "있음" : "제거"}`, circuit, configuration(circuit), [5, 6], ["10 mV peak · 1 kHz", "출력 결합 C 100 µF"], ["IN", "OUT"], bypass ? [reference("부하별 전압이득 크기", "transientGain:OUT", [94.425, 38.296, 5.516][index], "V/V", source(1, [6]))] : [], bypass ? [] : ["Ce 제거와 부하 변경을 교차한 추가 조건입니다. 해당 조합의 보고서 수치표는 없습니다."]);
  }
}
for (const [index, load] of [100000, 10000, 1000, 100].entries()) {
  const circuit = cloneTemplate("ce-cc-amplifier"); setValue(circuit, "RL", load);
  add(1, `l1-cecc-load-${load}`, `CE+CC · RL ${load} Ω`, circuit, configuration(circuit), [7, 8, 9], ["BC549C 2개", "Q1 C→Q2 B 직접 결합", "10 mV peak · 1 kHz"], ["IN", "OUT"], [reference("부하별 전압이득 크기", "transientGain:OUT", [109.32, 109.17, 104.34, 44.31][index], "V/V", source(1, [9]))], ["원문 1 kΩ 이득의 양수 표기는 크기로 비교합니다. 100 Ω는 원문에서 클리핑을 보고했습니다."]);
}
for (const [index, frequency] of [1, 10, 100, 1000, 10000, 100000, 1000000, 20000].entries()) {
  const circuit = cloneTemplate("ce-cc-amplifier");
  const refs = index < 7 ? [reference("주파수별 이득 크기", "transientGain:OUT", [12.696, 82.83, 106.76, 109.17, 109.59, 109.33, 87.87][index], "V/V", source(1, [10]))] : [];
  add(1, `l1-frequency-${frequency}`, `CE+CC 주파수 ${frequency} Hz`, circuit, configuration(circuit, "IN", frequency), [10, 11, 12], ["10 mV peak", "RL=10 kΩ", "최종 3주기에서 Vpp 이득 측정"], ["IN", "OUT"], refs, ["교육용 BJT 모델은 접합 커패시턴스·전하 저장·Early 효과를 생략합니다. 고주파 숫자가 생성되어도 1 MHz 원품 대역폭 재현을 보증하지 않습니다.", "실측 보고서 p.20은 비정상 파형 때문에 경향성 위주로 작성했음을 명시합니다."]);
}
for (const amplitude of [0.025, 0.05, 0.1]) {
  const circuit = cloneTemplate("ce-cc-amplifier");
  add(1, `l1-clipping-${amplitude}`, `CE+CC 입력 ${amplitude * 1000} mV peak`, circuit, configuration(circuit, "IN", 1000, amplitude), [13, 14], ["1 kHz", "RL=10 kΩ", "포화·차단에 따른 왜곡"], ["IN", "COLLECTOR", "OUT"], [], ["원문 파형은 그림으로만 제시됩니다. 비교 가능한 진폭 숫자를 임의 판독해 통과 기준으로 만들지 않았습니다."]);
}
{
  const circuit = cloneTemplate("ce-cc-amplifier");
  add(1, "l1-microphone", "CE+CC 일렉트릿 마이크 입력", circuit, configuration(circuit), [14, 15], ["마이크 바이어스 저항 10 kΩ 제안"], ["OUT"], [], ["결과 보고서 p.28은 마이크 실패 후 1 kHz·10 mV 발생기로 대체했음을 명시합니다."], "마이크의 전기·음향 변환 모델과 실제 입력 음성 데이터가 없습니다. 발생기 대체 실험을 마이크 검증 성공으로 표시하지 않습니다.");
}

// Lab 2. Preserve BC109C E/B/C numbering, single-supply bias, and feedback endpoints.
function convertToBc109(circuit: Circuit) {
  const part = circuit.components.find(item => item.id === "QN")!;
  const [collector, base, emitter] = [part.pinNets["1"], part.pinNets["2"], part.pinNets["3"]];
  part.definitionId = "bjt-bc109c-philips-to18"; part.value = "BC109C"; part.pinNets = { 1: emitter, 2: base, 3: collector };
}
function voltageAmplifier(): Circuit {
  const circuit = cloneTemplate("ua741-push-pull");
  circuit.components = circuit.components.filter(part => ["U1", "RREF1", "RREF2", "CREF", "CIN", "RIN", "RF"].includes(part.id));
  circuit.components.find(part => part.id === "RF")!.pinNets["1"] = "DRIVE";
  return circuit;
}
const opampNotes = ["UA741는 A0=200000, GBW=1 MHz, slew=0.5 V/µs, headroom=1.5 V의 교육 모델입니다. 출력전류 제한·입력 공통모드 범위·부하별 출력 스윙·발열을 생략합니다."];
for (const mode of ["dc", "ac", "low-load"] as const) {
  const circuit = voltageAmplifier(), config = configuration(circuit, "IN", 1000, mode === "dc" ? 0 : 0.1); config.opampModel = "educational-dynamic";
  if (mode === "low-load") circuit.components.push(capacitor("COUT", "100 µF", "DRIVE", "OUT"), resistor("RL", 8.2, "OUT", "GND"));
  const refs = mode === "dc" ? [reference("VINM DC", "dc:SUM", 4.499, "V", source(2, [2]), "pdf-simulation", 0.02, 0.01), reference("VOUT DC", "dc:DRIVE", 4.507, "V", source(2, [2]), "pdf-simulation", 0.02, 0.01)] : mode === "ac" ? [reference("VOUT Vpp", "vpp:DRIVE", 1.9998, "V", source(2, [3]))] : [reference("741 출력 Vpp", "vpp:DRIVE", 0.809448, "V", source(2, [4])), reference("8.2 Ω 부하 Vpp", "vpp:OUT", 0.665821, "V", source(2, [5]))];
  add(2, `l2-voltage-${mode}`, `단일전원 UA741 · ${mode}`, circuit, config, mode === "low-load" ? [4, 5] : [1, 2, 3], ["0/+9 V", "RIN=10 kΩ, RF=100 kΩ", "22 kΩ/22 kΩ 바이어스", "100 µF 결합·바이어스 C", "100 mV peak · 1 kHz 또는 DC 단계"], mode === "low-load" ? ["DRIVE", "OUT"] : ["IN", "DRIVE"], refs, opampNotes);
}
for (const dc of [true, false]) {
  const circuit = cloneTemplate("push-pull-stage"); convertToBc109(circuit);
  const config = configuration(circuit, "IN", 1000, dc ? 0 : 2);
  const refs = dc ? [reference("VMI DC", "dc:DRIVE", 4.5, "V", source(2, [6]), "pdf-simulation", 0.02, 0.01), reference("VMO DC", "dc:POWER_OUT", 4.526, "V", source(2, [6]), "pdf-simulation", 0.02, 0.01), reference("NPN 컬렉터 DC 전류", "current:QN:C", 0.1192e-3, "A", source(2, [7]), "pdf-simulation", 0.05, 1e-6), reference("전원 DC 전류", "supplyCurrent:VCC", 1.877e-3, "A", source(2, [7]))] : [reference("VOUT Vpp", "vpp:OUT", 2.0758, "V", source(2, [7])), reference("부하 평균 전력", "power:RL", 65.685e-3, "W", source(2, [8]))];
  add(2, `l2-pushpull-${dc ? "dc" : "2v"}`, `BC109C·BC556B 푸시풀 ${dc ? "DC" : "2 V peak"}`, circuit, config, [6, 7, 8, 9, 10], ["+9 V", "RC1/RC2=2.2 kΩ", "RE1/RE2=4.7 Ω", "RL=8.2 Ω", "1N4148 2개", "100 µF 입출력 결합 C"], ["IN", "DRIVE", "POWER_OUT", "OUT", "EN-POWER_OUT", "VCC-BN"], refs, ["보고서 평균 공급전력은 half-sine 근사식입니다. 이 검증은 부하 v(t)²/R의 시간 평균을 사용합니다.", "트랜지스터·다이오드는 축소 비선형 모델이며 실제 정격·열은 포함하지 않습니다."]);
}
for (const feedback of ["POWER_OUT", "DRIVE"]) {
  const circuit = cloneTemplate("ua741-push-pull"); convertToBc109(circuit); remove(circuit, ["CD1"]);
  circuit.components.find(part => part.id === "RF")!.pinNets["1"] = feedback;
  const config = configuration(circuit, "IN", 1000, 0.1); config.opampModel = "educational-dynamic";
  add(2, `l2-combined-${feedback.toLowerCase()}`, `전압+전력 증폭 · ${feedback === "POWER_OUT" ? "VMO" : "VMI"} 피드백`, circuit, config, [11, 12, 13, 14, 16], ["0.1 V peak · 1 kHz", "RL=8.2 Ω", `RF 끝점 ${feedback}`], ["IN", "DRIVE", "POWER_OUT", "OUT"], feedback === "POWER_OUT" ? [reference("출력 Vpp", "vpp:OUT", 1.9637, "V", source(2, [13])), reference("부하 평균 전력", "power:RL", 58.782e-3, "W", source(2, [13]))] : [reference("VMI 피드백 출력 Vpp", "vpp:OUT", 1.022, "V", source(2, [24], true), "pdf-simulation"), reference("VMI 피드백 이득 크기", "transientGain:OUT", 5.11, "V/V", source(2, [24], true), "pdf-simulation")], opampNotes);
}
{
  const circuit = voltageAmplifier(); setValue(circuit, "RF", 60000); setValue(circuit, "RREF1", 2000); setValue(circuit, "RREF2", 1000);
  const config = configuration(circuit, "IN", 1000, 0.1); config.opampModel = "educational-dynamic";
  add(2, "l2-design-dc3-gain6", "단일전원 설계 · DC 3 V / 이득 6", circuit, config, [14, 15, 16], ["학생 제안 RF=60 kΩ, RIN=10 kΩ", "분압 2 kΩ/1 kΩ", "+9 V 유지"], ["IN", "DRIVE"], [reference("출력 DC 목표", "dc:DRIVE", 3, "V", source(2, [14]), "assignment-target", 0.01, 0.01), reference("이득 크기 목표", "transientGain:DRIVE", 6, "V/V", source(2, [14]), "assignment-target", 0.01), reference("제출 시뮬레이션 Vpp", "vpp:DRIVE", 1.1999, "V", source(2, [16]))], [...opampNotes, "60 kΩ은 키트 30 kΩ 두 개 직렬로 구현 가능한 선택안입니다."]);
}

// Lab 3. Report-selected RREF is preserved even when the reduced model misses 20 mA.
const mirrorReference = [58.431, 32.626, 22.847, 17.646, 14.403, 12.182, 10.563, 9.329, 8.356];
function mirror(resistance: number, vx: number, vdd = 6) {
  const circuit = cloneTemplate("mos-current-mirror"); setValue(circuit, "RREF", resistance);
  const config = dcConfiguration(circuit, "DRAIN", vx); config.supplies = [{ netId: "VCC", voltage: vdd }];
  return { circuit, config };
}
for (let i = 0; i < 9; i++) {
  const resistance = 50 * (i + 1), { circuit, config } = mirror(resistance, 6);
  add(3, `l3-rref-${resistance}`, `MOS 미러 RREF ${resistance} Ω`, circuit, config, [1, 2, 3], ["VDD=VX=6 V", "2N7000 2개"], ["BIAS", "DRAIN"], [reference("IREF", "current:M1:D", mirrorReference[i] * 1e-3, "A", source(3, [2]))], ["실제 보고서 SPICE 모델과 축소 MOS 파라미터의 차이를 그대로 비교합니다."]);
}
for (const [profile, resistance, voltage, measured] of [["report-simulation", 177.273, 6, false], ["report-physical", 197.139, 6, true], ["mydaq", 100, 5, false]] as const) {
  const { circuit, config } = mirror(resistance, voltage, voltage);
  add(3, `l3-mirror-${profile}`, `MOS 미러 · ${profile}`, circuit, config, [1, 2, 3, 11], [`RREF=${resistance} Ω`, `VDD=VX=${voltage} V`, profile === "mydaq" ? "목표 IREF 27 mA" : "목표 IREF 20±2 mA"], ["BIAS", "DRAIN"], [reference("IREF 목표", "current:M1:D", profile === "mydaq" ? 0.027 : 0.020, "A", source(3, [2, 11]), "assignment-target", 0, 0.002), ...(profile === "mydaq" ? [] : [reference("게이트 DC", "dc:BIAS", measured ? 1.99337 : 2.512, "V", source(3, [2, 3], measured), measured ? "pdf-measured" : "pdf-simulation", 0.02, 0.01)])], ["소자 모델 편차를 숨기려고 원문 RREF를 모델 최적값으로 바꾸지 않습니다."]);
}
const vxValues = [...Array.from({ length: 11 }, (_, i) => i / 10), ...Array.from({ length: 10 }, (_, i) => 1.5 + i * 0.5)];
const vxReference = [0, 4.598, 8.598, 11.992, 14.776, 16.942, 18.485, 19.398, 19.675, 19.675, 19.675, 19.675, 19.675, 19.675, 19.675, 19.675, 19.674, 19.674, 19.674, 19.674, 19.674];
vxValues.forEach((vx, i) => {
  const { circuit, config } = mirror(177.273, vx);
  add(3, `l3-compliance-${vx}`, `MOS 미러 VX ${vx} V`, circuit, config, [3, 4, 5], ["VDD=6 V", "RREF=177.273 Ω · 원문 시뮬레이션 선택값"], ["BIAS", "DRAIN"], [reference("ISS", "current:M2:D", vxReference[i] * 1e-3, "A", source(3, [3, 4]), "pdf-simulation", 0.05, 1e-6)], ["원문 p.3 일부 셀의 V 표기는 표 제목 ISS(mA)에 따라 mA로 해석합니다."]);
});
function commonMode(input: number, resistance = 177.273, voltage = 6) {
  const circuit = cloneTemplate("mos-differential");
  circuit.components = circuit.components.filter(part => ["RREF", "MREF", "MTAIL", "M1", "M2", "RD1", "RD2"].includes(part.id));
  setValue(circuit, "RREF", resistance);
  for (const part of circuit.components) if (["M1", "M2"].includes(part.id)) part.pinNets["2"] = "CM";
  const config = dcConfiguration(circuit, "CM", input); config.supplies = [{ netId: "VCC", voltage }];
  return { circuit, config };
}
const cmD = [6, 6, 6, 6, 5.716, 4.726, 4.049, 4.033, 4.033, 4.033, 4.033];
const cmS = [5.107e-6, 5.107e-6, 5.107e-6, 5.107e-6, 0.060114, 0.324953, 0.719436, 1.217, 1.717, 2.217, 2.717];
for (let i = 0; i <= 12; i++) {
  const input = i / 2, { circuit, config } = commonMode(input);
  add(3, `l3-common-${input}`, `MOS 공통모드 ${input} V`, circuit, config, [6, 7, 8, 9], ["4 MOS", "VDD=6 V", "RREF=177.273 Ω", "RD1=RD2=200 Ω", "두 게이트에 DC 직접 인가"], ["CM", "D1", "D2", "TAIL"], i < cmD.length ? [reference("VD1", "dc:D1", cmD[i], "V", source(3, [7]), "pdf-simulation", 0.02, 0.01), reference("VS", "dc:TAIL", cmS[i], "V", source(3, [7]), "pdf-simulation", 0.02, 0.01)] : [], ["원문 지시는 6 V까지이며 제공 표의 숫자는 5 V까지 있습니다."]);
}
{
  const { circuit, config } = commonMode(4, 100, 5);
  add(3, "l3-common-mydaq", "MOS 공통모드 · myDAQ 5 V", circuit, config, [6], ["VDD=5 V, Vin=4 V", "RREF=100 Ω", "IREF 목표 27 mA"], ["D1", "D2", "TAIL"], [reference("IREF 목표", "current:MREF:D", 0.027, "A", source(3, [6]), "assignment-target", 0, 0.002)]);
}
for (const loadRail of ["GND", "VCC"]) for (const dc of [true, false]) {
  const circuit = cloneTemplate("mos-differential"); setValue(circuit, "RREF", 177.273);
  circuit.components.find(part => part.id === "RL")!.pinNets["2"] = loadRail;
  const config = configuration(circuit, "IN", 10000, dc ? 0 : 0.05, 6);
  const refs = dc ? [reference("VD1", "dc:D1", 4.05, "V", source(3, [11]), "pdf-simulation", 0.02, 0.01), reference("VS", "dc:TAIL", 0.7194, "V", source(3, [11]), "pdf-simulation", 0.02, 0.01)] : [reference("VG1 Vpp", "vpp:G1", 0.0999, "V", source(3, [12])), reference("VD1 Vpp", "vpp:D1", 0.3681, "V", source(3, [13])), reference("VD2 Vpp", "vpp:D2", 0.3317, "V", source(3, [13])), reference("VS Vpp", "vpp:TAIL", 0.046893, "V", source(3, [14])), reference("차동 출력 Vpp", "vpp:D1-D2", 0.6998, "V", source(3, [14]))];
  add(3, `l3-diff-${loadRail.toLowerCase()}-${dc ? "dc" : "ac"}`, `MOS 차동 · RL→${loadRail} · ${dc ? "DC" : "10 kHz"}`, circuit, config, [10, 11, 12, 13, 14], ["RREF=177.273 Ω", "게이트 분압 10 kΩ/10 kΩ", "Cin1/Cin2=1 µF, Cout=10 µF", "RL=10 kΩ", dc ? "입력 진폭 0 V" : "50 mV peak · 10 kHz"], ["G1", "G2", "D1", "D2", "TAIL", "OUT", "D1-D2"], refs, ["원문 제공 도면의 RL은 VDD에, 학생 시뮬레이션의 RL은 GND에 연결됩니다. 두 토폴로지를 분리했습니다.", "RL 연결 충돌은 AC에서 같아 보여도 OUT DC·전해 C 극성을 바꿉니다."]);
}
for (const loadRail of ["GND", "VCC"]) {
  for (const [profile, lowerResistance, outputCapacitance, voltage, resistance] of [["allowed-15k-1u", 15000, "1 µF", 6, 177.273], ["mydaq-5v", 10000, "10 µF", 5, 100]] as const) {
    const circuit = cloneTemplate("mos-differential");
    setValue(circuit, "RREF", resistance); setValue(circuit, "RG12", lowerResistance); setValue(circuit, "RG22", lowerResistance); setValue(circuit, "RL", lowerResistance); setValue(circuit, "COUT", outputCapacitance);
    circuit.components.find(part => part.id === "RL")!.pinNets["2"] = loadRail;
    const config = configuration(circuit, "IN", 10000, 0.05, voltage);
    add(3, `l3-diff-${profile}-${loadRail.toLowerCase()}`, `MOS 차동 ${profile} · RL→${loadRail}`, circuit, config, [10, 11], [`VDD=${voltage} V, RREF=${resistance} Ω`, `RGG12/RGG22/RL=${lowerResistance} Ω`, `Cout=${outputCapacitance}`, "50 mV peak · 10 kHz"], ["G1", "G2", "D1", "D2", "TAIL", "OUT", "D1-D2"], profile === "mydaq-5v" ? [reference("IREF 목표", "current:MREF:D", 0.027, "A", source(3, [11]), "assignment-target", 0, 0.002)] : [], ["원문이 허용한 10~15 kΩ 및 1~10 µF 범위의 끝값 조합입니다. 연속 범위의 모든 값을 실행했다는 의미는 아닙니다.", "RL 원문 연결 충돌에 따라 두 버전을 유지합니다."]);
  }
}

// Lab 4. Autonomous cases use a declared initial perturbation, with no AC source.
const wienGains = [62.83e-6, 628.5e-6, 6.283e-3, 61.981e-3, 0.317, 0.146, 16.1e-3];
const wienPhases = [89.989, 89.892, 88.920, 79.284, 17.081, -63.901, -87.266];
for (const [i, frequency] of [1, 10, 100, 1000, 10000, 100000, 1000000].entries()) {
  const circuit = rawCircuit("wien-network", [resistor("RS", 10000, "IN", "SERIES"), capacitor("CS", "1 nF", "SERIES", "OUT"), resistor("RP", 10000, "OUT", "GND"), capacitor("CP", "1 nF", "OUT", "GND")]);
  const config = configuration(circuit, "IN", frequency, 1);
  const conditions = ["10 kΩ×2, 1 nF×2", "원문 입력 1 V peak · AC 단위입력 전달함수 비교"];
  if (frequency <= 1000) {
    config.source.waveform = "dc"; config.source.amplitudePeak = 0; config.durationSeconds = 0.001; config.sampleCount = 32;
    conditions.push("저주파는 AC 해석만 비교. 장시간 TRAN의 계산량 제한 때문에 시간 응답은 DC 동작점으로 표시");
  }
  add(4, `l4-wien-network-${frequency}`, `Wien RC망 AC ${frequency} Hz`, circuit, config, [1, 2, 3], conditions, ["IN", "OUT"], [reference("AC 이득 크기", "gain:OUT", wienGains[i], "V/V", source(4, [2])), reference("AC 위상", "phase:OUT", wienPhases[i], "deg", source(4, [2]), "pdf-simulation", 0, 2)], ["제공 그림과 학생 시뮬레이션은 RF2=10 kΩ만 표시합니다. 지시문의 별도 RL=10 kΩ은 연결을 확정할 수 없어 추가하지 않았습니다."]);
}
function autonomous(templateId: string) {
  const circuit = cloneTemplate(templateId); remove(circuit, ["CD1", "CD2"]);
  if (templateId === "wien-bridge") circuit.components.push(resistor("RL", 10000, "OUT", "GND"));
  const config = dcConfiguration(circuit); config.supplies = [{ netId: "VEE", voltage: -9 }]; config.opampModel = "educational-dynamic"; config.startupPerturbationVolts = 0.001; config.durationSeconds = templateId === "wien-bridge" ? 0.003 : 0.004; config.sampleCount = 4096;
  return { circuit, config };
}
const wienFrequencies = [10989, 9969, 9999, 9259, 8940], wienMeasured = [12200, 10600, 9800, 9260, 8770];
for (let resistance = 14000; resistance <= 30000; resistance += 2000) {
  const { circuit, config } = autonomous("wien-bridge"); setValue(circuit, "RF", resistance);
  const i = (resistance - 22000) / 2000;
  const refs = i < 0 ? [reference("발진 없음", "oscillating:OUT", 0, "boolean", source(4, [4, 5]), "pdf-simulation", 0, 0)] : [reference("발진 주파수·SPICE", "frequency:OUT", wienFrequencies[i], "Hz", source(4, [4])), reference("출력 Vpp·SPICE", "vpp:OUT", i === 0 ? 17.622 : 17.632, "V", source(4, [5])), reference("발진 주파수·실측", "frequency:OUT", wienMeasured[i], "Hz", source(4, [5], true), "pdf-measured")];
  add(4, `l4-wien-rf-${resistance}`, `Wien 발진기 RF ${resistance} Ω`, circuit, config, [4, 5, 6, 7, 8], ["±9 V", "RG=10 kΩ, RC망=10 kΩ/1 nF", "외부 반복 입력 없음", "출력 초기 외란 1 mV", "3 ms · 4096점"], ["OUT", "WIEN"], refs, [...opampNotes, "초기 외란은 시동 조건을 명시하기 위한 수치 가정입니다. 3 ms 관찰 구간의 발진 유무를 기록합니다."]);
}
{
  const { circuit, config } = autonomous("wien-bridge"); setValue(circuit, "RF", 24000); remove(circuit, ["RL"]); circuit.components.push(resistor("ATT1", 1000, "OUT", "MEASURE"), resistor("ATT2", 1000, "MEASURE", "GND"));
  add(4, "l4-wien-attenuator", "Wien 24 kΩ · 1 kΩ/1 kΩ 측정 감쇠", circuit, config, [4, 7, 8], ["R2=24 kΩ", "원문 출력 부하 10 kΩ을 1 kΩ 두 개로 교체", "출력 1/2 분압"], ["OUT", "MEASURE"], [], ["p.4 학생 시뮬레이션의 출력 10 kΩ 부하와 본문의 교체 지시를 반영했습니다.", ...opampNotes]);
}
for (const topology of ["inverting", "noninverting"]) {
  const circuit = cloneTemplate(`schmitt-${topology}`); remove(circuit, ["CD1", "CD2"]);
  const config = configuration(circuit, "IN", 1000, 9); config.source.waveform = "triangle"; config.supplies.push({ netId: "VEE", voltage: -9 }); config.opampModel = "educational-dynamic"; config.durationSeconds = 0.002; config.sampleCount = 4096;
  add(4, `l4-schmitt-${topology}-triangle`, `슈미트 ${topology} · 양방향 연속 입력`, circuit, config, topology === "inverting" ? [8, 9, 10] : [10, 11, 12, 13], ["±9 V 전원", "−9~+9 V 삼각파 1 kHz", "R=5 kΩ/10 kΩ"], ["IN", "OUT", "THRESHOLD"], [], ["상태를 유지하는 연속 과도응답입니다. 원문 1 V 간격 계단 DC sweep과 구분합니다.", ...opampNotes]);
  for (const direction of ["up", "down"]) {
    add(4, `l4-schmitt-${topology}-dc-${direction}`, `슈미트 ${topology} · DC ${direction === "up" ? "상향" : "하향"}`, structuredClone(circuit), structuredClone(config), topology === "inverting" ? [9] : [11, 12], [direction === "up" ? "−9→+9 V, 1 V 간격" : "+9→−9 V, 1 V 간격", "앞 단계 상태 유지 필요"], ["IN", "OUT"], [], ["독립 DC 해석을 19번 반복하면 양의 피드백 상태가 보존되지 않습니다."], "현재 엔진 입력원에는 상태를 유지하는 계단 DC sweep/PWL 및 이전 최종 상태의 다음 계산 전달 API가 없습니다. 독립 DC 점을 히스테리시스 결과로 대체하지 않습니다.");
  }
}
const relaxSettings = [[5000, "220 nF", 2500, 5.8717, 3050, 5.28], [5000, "100 nF", 5000, 5.875, 5380, 5.28], [6800, "220 nF", 2000, 7.134, 2690, 6.32], [6800, "100 nF", 4000, 7.134, 5000, 6.32]] as const;
for (const [resistance, capacitance, frequency, amplitude, measuredFrequency, measuredAmplitude] of relaxSettings) {
  const { circuit, config } = autonomous("relaxation-oscillator"); setValue(circuit, "RG", resistance); setValue(circuit, "CT", capacitance);
  add(4, `l4-relax-${resistance}-${capacitance.replace(" ", "")}`, `RC 발진 R1 ${resistance} Ω · C1 ${capacitance}`, circuit, config, [13, 14, 15, 16, 17, 18], ["R3=1 kΩ, R2=10 kΩ", "±9 V", "R1 양단 THRESHOLD 측정", "출력 초기 외란 1 mV"], ["THRESHOLD", "RAMP", "OUT"], [reference("R1 주파수·SPICE", "frequency:THRESHOLD", frequency, "Hz", source(4, [16])), reference("R1 Vpp·SPICE", "vpp:THRESHOLD", amplitude, "V", source(4, [16])), reference("R1 주파수·실측", "frequency:THRESHOLD", measuredFrequency, "Hz", source(4, [22], true), "pdf-measured"), reference("R1 Vpp·실측", "vpp:THRESHOLD", measuredAmplitude, "V", source(4, [22], true), "pdf-measured")], opampNotes);
}
for (const resistance of [100, 50]) {
  const { circuit, config } = autonomous("relaxation-oscillator"); setValue(circuit, "RG", resistance); setValue(circuit, "CT", "220 nF");
  add(4, `l4-design-${resistance}`, `10 kHz 설계 · R1 ${resistance} Ω`, circuit, config, [19, 20], ["R2=10 kΩ, R3=1 kΩ, C1=0.22 µF", resistance === 100 ? "학생 SPICE 튜닝값" : "학생 실물 튜닝값"], ["THRESHOLD", "RAMP", "OUT"], [reference("기본주파수 목표", "frequency:THRESHOLD", 10000, "Hz", source(4, resistance === 100 ? [20] : [27], resistance === 50), resistance === 100 ? "pdf-simulation" : "pdf-measured")], [...opampNotes, "단순 RC 주기식과 741의 slew 제한에서 나오는 주파수가 다릅니다. 목표 숫자에 맞춰 모델을 조정하지 않았습니다."]);
}

export const COURSE_ANALOG_CASES: CourseAnalogCase[] = cases.map(item => ({ ...item, circuit: ensureReferenceConnections(item.circuit, item.config) }));
