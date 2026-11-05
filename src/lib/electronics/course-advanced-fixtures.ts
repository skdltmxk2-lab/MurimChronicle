import type { Circuit, CircuitComponent } from "./types";
import type { SimulationConfig, SimulationResult } from "./simulation-types";
import { ensureReferenceConnections } from "./reference-connections";

export type AdvancedAnalogCase = {
  id: string;
  experimentId: "project-2025" | "project-2023" | "project-2022";
  title: string;
  year: 2025 | 2023 | 2022;
  rfPeak: number;
  localOscillatorHz: number;
  intermediateFrequencyHz: number;
  targetGain: number;
  modulation: "none" | "am" | "dsb";
  modulationFrequencyHz?: number;
};

const yearConditions = {
  2025: { localOscillatorHz: 4000, intermediateFrequencyHz: 3000, targetGain: 15 },
  2023: { localOscillatorHz: 7000, intermediateFrequencyHz: 6000, targetGain: 19.5 },
  2022: { localOscillatorHz: 5000, intermediateFrequencyHz: 4000, targetGain: 17.5 },
} as const;

export const ADVANCED_ANALOG_CASES: readonly AdvancedAnalogCase[] = ([2025, 2023, 2022] as const).flatMap(year => {
  const amplitudes = year === 2025 ? [0.01] : [0.008, 0.01, 0.012];
  const common = { year, experimentId: `project-${year}` as AdvancedAnalogCase["experimentId"], ...yearConditions[year] };
  return [
    ...amplitudes.map(rfPeak => ({ ...common, id: `project-${year}-rf-${Math.round(rfPeak * 1000)}mv`, title: `${year} 원문 믹서 초기값 · RF ${Math.round(rfPeak * 1000)} mV`, rfPeak, modulation: "none" as const })),
    { ...common, id: `project-${year}-modulated`, title: `${year} 원문 믹서 초기값 · ${year === 2023 ? "AM" : "억압반송파"} 입력`, rfPeak: 0.01, modulation: year === 2023 ? "am" as const : "dsb" as const, modulationFrequencyHz: year === 2023 ? 300 : year === 2025 ? 200 : 100 },
  ];
});

const resistor = (id: string, value: string, a: string, b: string): CircuitComponent => ({ id, definitionId: "resistor-axial", value, pinNets: { 1: a, 2: b } });
const capacitor = (id: string, value: string, a: string, b: string): CircuitComponent => ({ id, definitionId: "capacitor-ceramic", value, pinNets: { 1: a, 2: b } });
const transistor = (id: string, collector: string, base: string, emitter: string): CircuitComponent => ({ id, definitionId: "bjt-bc109c-philips-to18", value: "BC109C", pinNets: { 1: emitter, 2: base, 3: collector } });

/** Figures p2 plus the explicit capacitor-drive amendment on p1 of each notice. */
export function buildAdvancedAnalogCase(id: string, loAmplitudePeak = 0.005): {
  definition: AdvancedAnalogCase;
  circuit: Circuit;
  config: SimulationConfig;
} {
  const definition = ADVANCED_ANALOG_CASES.find(item => item.id === id);
  if (!definition) throw new Error("지원하지 않는 프로젝트 비교 조건입니다.");
  if (!Number.isFinite(loAmplitudePeak) || loAmplitudePeak <= 0 || loAmplitudePeak > 0.1) throw new Error("LO 각 채널 진폭은 0~100 mV 범위에서 지정하세요.");
  const components = [
    transistor("Q1", "OUT1", "B1", "TAIL"), transistor("Q2", "OUT2", "B2", "TAIL"), transistor("Q3", "TAIL", "B3", "E3"),
    resistor("RC1", "10 kΩ", "VCC", "OUT1"), resistor("RC2", "10 kΩ", "VCC", "OUT2"),
    resistor("RBB3", "82 kΩ", "VCC", "B3"), resistor("RBB4", "12 kΩ", "B3", "GND"), resistor("REE", "1 kΩ", "E3", "GND"),
    resistor("RB11", "62 kΩ", "VCC", "B1"), resistor("RB12", "30 kΩ", "B1", "GND"),
    resistor("RB21", "62 kΩ", "VCC", "B2"), resistor("RB22", "30 kΩ", "B2", "GND"),
    capacitor("CE", "100 µF", "E3", "GND"), capacitor("CIN", "100 µF", "RF", "B3"),
    capacitor("CLO1", "1 µF", "LO_PLUS", "B1"), capacitor("CLO2", "1 µF", "LO_MINUS", "B2"),
  ];
  const nets = [...new Set(components.flatMap(component => Object.values(component.pinNets)))];
  const circuit: Circuit = {
    id, title: definition.title, description: "BC109C 3개와 독립 베이스 바이어스, 두 커패시터로 구동하는 차동 LO",
    components, instruments: [], netNames: Object.fromEntries(nets.map(net => [net, net === "VCC" ? "+9 V" : net])),
    notes: [
      "저항은 공식 공지의 초기값입니다. 목표 이득에 맞춘 저항 설계 결과는 별도로 평가합니다.",
      "LO 커플링 1 µF 두 개는 공지에서 참조한 실험3 회로3 조건을 적용한 구현 선택입니다.",
      "LO는 두 이상 전압원의 180° 대칭 구동입니다. 실제 B1−B2 진폭을 결과에서 측정합니다.",
      "100 µF 비극성 기호는 수치 계산용입니다. 실물 커패시터와 TO-18 리드 배치는 별도 검수합니다.",
    ],
    reviewItems: [{ id: "project-design-target", message: `${definition.intermediateFrequencyHz} Hz 성분 이득>${definition.targetGain}, 키트 재고·실측 성능 검증`, resolved: false }],
    provenance: `${definition.year} 설계과제 공지 1~2쪽. 개인정보를 포함하지 않은 수치 검증 회로.`,
  };
  const config: SimulationConfig = {
    groundNetId: "GND",
    source: { netId: "RF", waveform: definition.modulation === "none" ? "sine" : definition.modulation,
      frequencyHz: 1000, amplitudePeak: definition.rfPeak, offset: 0, phaseDegrees: 90,
      ...(definition.modulationFrequencyHz ? { modulationFrequencyHz: definition.modulationFrequencyHz } : {}),
      ...(definition.modulation === "am" ? { modulationDepth: 0.2 } : {}),
    },
    extraSources: [
      { netId: "LO_PLUS", waveform: "sine", frequencyHz: definition.localOscillatorHz, amplitudePeak: loAmplitudePeak, offset: 0, phaseDegrees: 90 },
      { netId: "LO_MINUS", waveform: "sine", frequencyHz: definition.localOscillatorHz, amplitudePeak: loAmplitudePeak, offset: 0, phaseDegrees: 270 },
    ],
    supplies: [{ netId: "VCC", voltage: 9 }], durationSeconds: 0.015, sampleCount: 4096,
    acStartHz: 1000, acStopHz: 1000, acPoints: 2, opampModel: "ideal", startupPerturbationVolts: 0,
  };
  return { definition, circuit: ensureReferenceConnections(circuit, config), config };
}

/** Exact 5–15 ms endpoints preserve complete 100 Hz tone cycles in each year. */
function tonePeak(result: SimulationResult, values: number[], frequencyHz: number): number {
  const start = 0.005, end = 0.015;
  if (values.length !== result.time.length || result.time[0] > start || result.time.at(-1)! < end - 1e-12) throw new Error("프로젝트 비교에는 0~15 ms의 시간 표본이 필요합니다.");
  const sampleAt = (target: number) => {
    const index = result.time.findIndex(time => time >= target);
    if (index < 0) return values.at(-1)!;
    if (index === 0 || result.time[index] === target) return values[index];
    const fraction = (target - result.time[index - 1]) / (result.time[index] - result.time[index - 1]);
    return values[index - 1] + fraction * (values[index] - values[index - 1]);
  };
  const points = [{ t: start, v: sampleAt(start) }];
  result.time.forEach((time, index) => { if (time > start && time < end) points.push({ t: time, v: values[index] }); });
  points.push({ t: end, v: sampleAt(end) });
  let real = 0, imaginary = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i], width = (b.t - a.t) / 2;
    real += width * (a.v * Math.cos(2 * Math.PI * frequencyHz * a.t) + b.v * Math.cos(2 * Math.PI * frequencyHz * b.t));
    imaginary += width * (a.v * Math.sin(2 * Math.PI * frequencyHz * a.t) + b.v * Math.sin(2 * Math.PI * frequencyHz * b.t));
  }
  return 2 * Math.hypot(real, imaginary) / (end - start);
}

export function measureAdvancedAnalogCase(definition: AdvancedAnalogCase, result: SimulationResult): Record<string, number> {
  const metrics: Record<string, number> = {};
  for (const net of ["OUT1", "OUT2", "TAIL", "B1", "B2", "B3"]) metrics[`dc_${net}_V`] = result.dc.nodeVoltages[net];
  const difference = (a: string, b: string) => result.nodeVoltages[a].map((value, index) => value - result.nodeVoltages[b][index]);
  const output = difference("OUT1", "OUT2");
  metrics.lo_base_peak_V = tonePeak(result, difference("B1", "B2"), definition.localOscillatorHz);
  metrics.if_output_peak_V = tonePeak(result, output, definition.intermediateFrequencyHz);
  if (definition.modulation === "none") metrics.if_gain_V_per_V = metrics.if_output_peak_V / definition.rfPeak;
  if (definition.modulationFrequencyHz) {
    metrics.if_lower_peak_V = tonePeak(result, output, definition.intermediateFrequencyHz - definition.modulationFrequencyHz);
    metrics.if_upper_peak_V = tonePeak(result, output, definition.intermediateFrequencyHz + definition.modulationFrequencyHz);
  }
  if (Object.values(metrics).some(value => !Number.isFinite(value))) throw new Error("프로젝트 비교 측정값이 유한하지 않습니다.");
  return metrics;
}
