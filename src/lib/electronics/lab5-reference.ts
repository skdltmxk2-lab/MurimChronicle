import type { Circuit, CircuitComponent } from "./types";
import type { SimulationConfig, SimulationResult } from "./simulation-types";

export type Lab5CaseId = "c1-dc" | "c1-drive" | "c2-dc" | "c2-drive" | "c3-mix";
export type Lab5Ratio = "1:1" | "2:1";
export type Lab5Case = { id: Lab5CaseId; circuitNumber: 1 | 2 | 3; label: string; condition: string; sourcePages: string };
export function lab5TimeSettings(circuitNumber: 1 | 2 | 3) {
  return circuitNumber === 1 ? { durationSeconds: 0.01, sampleCount: 2001, measurementStart: 0.0045, measurementEnd: 0.0055 }
    : circuitNumber === 2 ? { durationSeconds: 0.0005, sampleCount: 1001, measurementStart: 0.0003, measurementEnd: 0.0005 }
    : { durationSeconds: 0.005, sampleCount: 2561, measurementStart: 0.003, measurementEnd: 0.005 };
}
export const LAB5_REFERENCE_CASES: readonly Lab5Case[] = [
  { id: "c1-dc", circuitNumber: 1, label: "회로 1 · DC 동작점", condition: "+9 V, 입력 신호 없음", sourcePages: "예비 1–2쪽 · 결과 1–2쪽" },
  { id: "c1-drive", circuitNumber: 1, label: "회로 1 · 1 kHz 증폭", condition: "B3 입력 20 mV peak · 1 kHz", sourcePages: "예비 3–4쪽 · 결과 3–6쪽" },
  { id: "c2-dc", circuitNumber: 2, label: "회로 2 · DC 동작점", condition: "+9 V, 변압기 입력 신호 없음", sourcePages: "예비 4–5쪽 · 결과 6–7쪽" },
  { id: "c2-drive", circuitNumber: 2, label: "회로 2 · 10 kHz 차동쌍", condition: "변압기 입력 10 mV peak · 10 kHz", sourcePages: "예비 5–6쪽 · 결과 8–9쪽" },
  { id: "c3-mix", circuitNumber: 3, label: "회로 3 · 두 신호 혼합", condition: "VM 10 mV peak · 1 kHz / VC 10 mV peak · 10 kHz", sourcePages: "예비 7–9쪽 · 결과 10–14쪽" },
];
const resistor = (id: string, value: string, a: string, b: string): CircuitComponent => ({ id, definitionId: "resistor-axial", value, pinNets: { 1: a, 2: b } });
// Original drawings use non-polarized symbols; preserve those in the netlist.
const capacitor = (id: string, a: string, b: string): CircuitComponent => ({ id, definitionId: "capacitor-ceramic", value: "100 µF", pinNets: { 1: a, 2: b } });
const bjt = (id: string, collector: string, base: string, emitter: string): CircuitComponent => ({ id, definitionId: "bjt-bc109c-philips-to18", value: "BC109C", pinNets: { 1: emitter, 2: base, 3: collector } });

export function buildLab5ReferenceCircuit(number: 1 | 2 | 3, ratio: Lab5Ratio): Circuit {
  if (![1, 2, 3].includes(number) || !["1:1", "2:1"].includes(ratio)) throw new Error("지원하지 않는 Lab 5 회로 또는 권선비입니다.");
  const components = [bjt("Q1", "OUT1", "B1", "TAIL"), bjt("Q2", "OUT2", "B2", "TAIL"), bjt("Q3", "TAIL", "B3", "E3"),
    resistor("RC1", "10 kΩ", "VCC", "OUT1"), resistor("RC2", "10 kΩ", "VCC", "OUT2"), resistor("RB31", "82 kΩ", "VCC", "B3"),
    resistor("RB32", "12 kΩ", "B3", "GND"), resistor("REE", "1 kΩ", "E3", "GND"), capacitor("CE", "E3", "GND")];
  if (number < 3) components.push(resistor("RB11", "62 kΩ", "VCC", "B1"), resistor("RB12", "30 kΩ", "B1", "GND"));
  if (number === 1) components.push(resistor("RB21", "62 kΩ", "VCC", "B2"), resistor("RB22", "30 kΩ", "B2", "GND"));
  else components.push(resistor("RBCT1", "62 kΩ", "VCC", "CT"), resistor("RBCT2", "30 kΩ", "CT", "GND"),
    { id: "T1", definitionId: "transformer-ideal-center-tap", value: ratio, pinNets: { 1: "LO", 2: "GND", 3: "B2", 4: "CT", 5: "B1" } });
  if (number !== 2) components.push(capacitor("CIN", "RF", "B3"));
  const nets = [...new Set(components.flatMap(part => Object.values(part.pinNets)))];
  return { id: `lab5-reference-circuit-${number}`, title: `Lab 5 원문 회로 ${number}`, description: number === 1 ? "두 베이스를 독립 분압 바이어스한 3 BJT 회로" : number === 2 ? "B1 분압기를 유지하고 별도 분압기로 센터탭을 바이어스한 회로" : "B1 분압기를 제거하고 두 입력을 동시에 인가한 믹서",
    components, netNames: Object.fromEntries(nets.map(net => [net, net === "VCC" ? "+9 V" : net === "TAIL" ? "S · 공통 이미터" : net])), instruments: [],
    notes: ["회로도 기준 수치 비교이며 실제 빵판 배치·핀 방향을 검증한 회로가 아닙니다.", "BC109C를 다른 품번으로 치환하지 않습니다. 현재 계산은 수업 모델을 축약한 300 K Ebers–Moll 모델입니다.",
      ...(number > 1 ? [`변압기 권선비 ${ratio}는 명시적 가정입니다. PDF에 권선비·인덕턴스·결합계수·권선저항이 없어 원본 파라미터로 확정할 수 없습니다.`] : []),
      "100 µF 커패시터는 원문 비극성 회로 기호를 수치 모델로 옮겼습니다. 세라믹 100 µF 실물 선택이나 조립을 권장하는 뜻이 아닙니다."],
    reviewItems: [{ id: "schematic-only", message: "BC109C TO-18 및 변압기 실제 리드 배치 검증 전", resolved: false }], provenance: `사용자가 지정한 Lab 5 예비·결과 보고서의 회로 ${number}. 작성자 식별정보는 웹 데이터에 포함하지 않음.` };
}

export function buildLab5ReferenceCase(id: Lab5CaseId, ratio: Lab5Ratio): { definition: Lab5Case; circuit: Circuit; config: SimulationConfig } {
  const definition = LAB5_REFERENCE_CASES.find(item => item.id === id);
  if (!definition) throw new Error("지원하지 않는 Lab 5 비교 조건입니다.");
  const circuit = buildLab5ReferenceCircuit(definition.circuitNumber, ratio);
  const dc = id.endsWith("dc"), carrierOnly = definition.circuitNumber === 2;
  const config: SimulationConfig = { groundNetId: "GND", source: { netId: carrierOnly ? "LO" : "RF", waveform: dc ? "dc" : "sine", frequencyHz: carrierOnly ? 10000 : 1000,
    amplitudePeak: dc ? 0 : definition.circuitNumber === 1 ? 0.02 : 0.01, offset: 0, phaseDegrees: 0 },
    extraSources: definition.circuitNumber === 3 ? [{ netId: "LO", waveform: "sine", frequencyHz: 10000, amplitudePeak: 0.01, offset: 0, phaseDegrees: 0 }] : [],
    supplies: [{ netId: "VCC", voltage: 9 }], durationSeconds: lab5TimeSettings(definition.circuitNumber).durationSeconds, sampleCount: lab5TimeSettings(definition.circuitNumber).sampleCount, acStartHz: 10, acStopHz: 100000, acPoints: 12, opampModel: "ideal", startupPerturbationVolts: 0 };
  return { definition, circuit, config };
}

export const LAB5_DC_REFERENCE = {
  simulated: { OUT1: 6.553, OUT2: 6.553, TAIL: 2.298, B3: 1.137, B1: 2.923, B2: 2.923 },
  measured1: { OUT1: 6.735, OUT2: 5.767, TAIL: 2.333, B3: 1.15, B1: 2.909, B2: 2.917 },
  measured2: { OUT1: 6.342, OUT2: 6.142, TAIL: 2.332, B3: 1.15, B1: 2.914, B2: 2.914 },
};
export const LAB5_AMPLITUDE_REFERENCE = {
  "c1-drive": { inputNode: "B3", simulatedInputPeak: 0.02, simulatedOutputHalfVpp: 1.8815, simulatedGain: -94.075, measuredInputPeak: 0.024, measuredOutputHalfVpp: 1.82, measuredGain: -75.83 },
  "c2-drive": { inputNode: "B1", simulatedInputPeak: 0.002492, simulatedOutputHalfVpp: 0.43212, simulatedGain: -173.39, measuredInputPeak: 0.0072, measuredOutputHalfVpp: 2.3, measuredGain: -319.4 },
};

/** Projection over complete tone cycles, with trapezoidal endpoint weights. */
export function lab5TonePeak(time: number[], values: number[], frequencyHz: number, windowStart = 0.003, windowEnd = 0.005): number {
  const start = time.findIndex(value => value >= windowStart - 1e-12), end = time.findIndex(value => value >= windowEnd - 1e-12), duration = time[end] - time[start];
  if (start < 0 || values.length !== time.length || !(duration > 0)) throw new Error("Lab 5 주파수 비교 표본이 올바르지 않습니다.");
  let cosine = 0, sine = 0;
  for (let i = start + 1; i <= end; i++) {
    const dt = time[i] - time[i - 1], a = 2 * Math.PI * frequencyHz * time[i - 1], b = 2 * Math.PI * frequencyHz * time[i];
    cosine += dt / 2 * (values[i - 1] * Math.cos(a) + values[i] * Math.cos(b));
    sine += dt / 2 * (values[i - 1] * Math.sin(a) + values[i] * Math.sin(b));
  }
  return 2 * Math.hypot(cosine, sine) / duration;
}
export function lab5Measurements(result: SimulationResult, caseId: Lab5CaseId) {
  const definition = LAB5_REFERENCE_CASES.find(item => item.id === caseId);
  if (!definition) throw new Error("지원하지 않는 Lab 5 비교 조건입니다.");
  const { measurementStart, measurementEnd } = lab5TimeSettings(definition.circuitNumber);
  const start = result.time.findIndex(value => value >= measurementStart - 1e-12), end = result.time.findIndex(value => value >= measurementEnd - 1e-12);
  const halfVpp = (net: string) => { const samples = result.nodeVoltages[net]?.slice(start, end + 1) ?? []; return samples.length ? (Math.max(...samples) - Math.min(...samples)) / 2 : 0; };
  const differential = result.nodeVoltages.OUT1.map((value, i) => value - result.nodeVoltages.OUT2[i]);
  return { measurementWindow: [measurementStart, measurementEnd], halfVpp: Object.fromEntries(["B1", "B2", "B3", "OUT1", "OUT2"].map(net => [net, halfVpp(net)])), differential,
    tonePeak: Object.fromEntries(caseId === "c3-mix" ? [9000, 10000, 11000].map(frequency => [String(frequency), lab5TonePeak(result.time, differential, frequency, measurementStart, measurementEnd)]) : []) };
}

export type Lab5WorkerRequest = { type: "run"; requestId: number; caseId: Lab5CaseId; ratio: Lab5Ratio };
export type Lab5WorkerResponse = { type: "result"; requestId: number; result: SimulationResult } | { type: "error"; requestId: number; message: string };
