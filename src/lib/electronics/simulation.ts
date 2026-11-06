import type { Circuit, ComponentDefinition } from "./types";
import type { SimulationConfig, SimulationResult, SimulationSource, SimulationWaveform } from "./simulation-types";
import { getPowerNetRole } from "./power";
import { buildNonlinearDevices } from "./simulation-models";
import { createNewtonSolver, NewtonConvergenceError } from "./simulation-newton";
import { createEducationalOpamp, EDUCATIONAL_OPAMP } from "./simulation-opamp";
import { sourceVoltage, sourceSamplingLimits, SOURCE_DEFAULTS } from "./simulation-source";
import { buildIdealCenterTap, IDEAL_CENTER_TAP_ID, IDEAL_TRANSFORMER_WARNING, type IdealCenterTap } from "./simulation-transformer";
import { parseExplicitComponentValue } from "./component-values";
export { sourceVoltage, sourceSamplingLimits } from "./simulation-source";

const TAU = 2 * Math.PI;
const MAX_WORK = 180_000_000;
const LIMIT_WARNING = "이상적 선형 R/C·연산증폭기 모델입니다. 실제 부품의 공차·누설·온도·정격·기생성분과 계측기 부하는 반영하지 않습니다.";
const OPAMP_WARNING = "UA741 핀맵만 확인한 이상적 연산증폭기입니다. 입력전류·유한이득·대역폭·슬루율·출력전류·포화·발진 안정성은 모델링하지 않으며 파형을 임의로 클리핑하지 않습니다.";
const record = <T>(): Record<string, T> => Object.create(null) as Record<string, T>;
export class SimulationError extends Error {
  readonly code = "SIMULATION_REJECTED";
  constructor(message: string) { super(message); this.name = "SimulationError"; }
}
function fail(message: string): never { throw new SimulationError(message); }
function object(value: unknown, keys: string[], label: string, optional: string[] = []): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label}: 객체 형식이 필요합니다.`);
  const item = value as Record<string, unknown>;
  if (Object.keys(item).some(key => !keys.includes(key) && !optional.includes(key)) || keys.some(key => !Object.prototype.hasOwnProperty.call(item, key))) fail(`${label}: 필수 항목이 없거나 알 수 없는 항목이 있습니다.`);
  return item;
}
function finite(value: unknown, min: number, max: number, label: string, integer = false): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) fail(`${label}: ${min}~${max} 범위의 ${integer ? "정수" : "유한한 수"}를 입력하세요.`);
  return value;
}
function netName(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim() || value !== value.trim() || value.length > 120 || value.startsWith("__unconnected:")) fail(`${label}: 유효한 연결 이름이 필요합니다.`);
  return value;
}

/** Strict JSON boundary, shared by browser workers and the HTTP API. No coercion. */
export function parseSimulationConfig(value: unknown): SimulationConfig {
  const item = object(value, ["groundNetId", "source", "supplies", "durationSeconds", "sampleCount", "acStartHz", "acStopHz", "acPoints"], "시뮬레이션 설정", ["extraSources", "opampModel", "startupPerturbationVolts", "timeStepPolicy"]);
  const parseSource = (value: unknown): SimulationSource => {
    const source = object(value, ["netId", "waveform", "frequencyHz", "amplitudePeak", "offset"], "입력 신호", ["phaseDegrees", "dutyCyclePercent", "modulationFrequencyHz", "modulationDepth"]);
    if (!["sine", "square", "triangle", "dc", "pulse", "sawtooth", "am", "dsb"].includes(source.waveform as string)) fail("지원하지 않는 입력 파형입니다.");
    const result: SimulationSource = { netId: netName(source.netId, "입력 노드"), waveform: source.waveform as SimulationWaveform,
      frequencyHz: finite(source.frequencyHz, 0.001, 1e7, "입력 주파수"), amplitudePeak: finite(source.amplitudePeak, 0, 1e4, "입력 피크 진폭"), offset: finite(source.offset, -1e4, 1e4, "입력 DC 오프셋"),
      phaseDegrees: source.phaseDegrees === undefined ? 0 : finite(source.phaseDegrees, -360, 360, "입력 위상") };
    if (source.dutyCyclePercent !== undefined || result.waveform === "pulse") result.dutyCyclePercent = source.dutyCyclePercent === undefined ? SOURCE_DEFAULTS.dutyCyclePercent : finite(source.dutyCyclePercent, 1, 99, "펄스 듀티 비율");
    if (source.modulationFrequencyHz !== undefined || result.waveform === "am" || result.waveform === "dsb") result.modulationFrequencyHz = source.modulationFrequencyHz === undefined ? SOURCE_DEFAULTS.modulationFrequencyHz : finite(source.modulationFrequencyHz, 0.001, 1e7, "변조 주파수");
    if (source.modulationDepth !== undefined || result.waveform === "am") result.modulationDepth = source.modulationDepth === undefined ? SOURCE_DEFAULTS.modulationDepth : finite(source.modulationDepth, 0, 1, "AM 변조 깊이");
    const envelopePeak = result.amplitudePeak * (result.waveform === "am" ? 1 + result.modulationDepth! : 1);
    if (Math.abs(result.offset) + envelopePeak > 1e4) fail("입력 오프셋과 최대 진폭(AM 포락선 포함)의 합이 계산 전압 범위(10 kV)를 넘습니다.");
    return result;
  };
  if (!Array.isArray(item.supplies) || item.supplies.length > 8) fail("독립 DC 전원은 최대 8개입니다.");
  if (item.extraSources !== undefined && (!Array.isArray(item.extraSources) || item.extraSources.length > 3)) fail("추가 입력 신호는 최대 3개입니다.");
  if (item.opampModel !== undefined && !["ideal", "educational-dynamic"].includes(item.opampModel as string)) fail("지원하지 않는 연산증폭기 모델입니다.");
  if (item.timeStepPolicy !== undefined && item.timeStepPolicy !== "damp-fast-rc") fail("지원하지 않는 내부 시간 간격 정책입니다.");
  const config: SimulationConfig = {
    groundNetId: netName(item.groundNetId, "기준 접지"),
    source: parseSource(item.source), extraSources: (item.extraSources as unknown[] | undefined ?? []).map(parseSource),
    opampModel: item.opampModel === "educational-dynamic" ? "educational-dynamic" : "ideal",
    startupPerturbationVolts: item.startupPerturbationVolts === undefined ? 0 : finite(item.startupPerturbationVolts, 0, 0.01, "시동 외란 전압"),
    ...(item.timeStepPolicy === "damp-fast-rc" ? { timeStepPolicy: "damp-fast-rc" as const } : {}),
    supplies: item.supplies.map((value, index) => { const supply = object(value, ["netId", "voltage"], `DC 전원 ${index + 1}`); return { netId: netName(supply.netId, "전원 노드"), voltage: finite(supply.voltage, -1e4, 1e4, "전원 전압") }; }),
    durationSeconds: finite(item.durationSeconds, 1e-9, 60, "시간 범위"), sampleCount: finite(item.sampleCount, 32, 4096, "출력 표본 수", true),
    acStartHz: finite(item.acStartHz, 0.001, 1e9, "AC 시작 주파수"), acStopHz: finite(item.acStopHz, 0.001, 1e9, "AC 끝 주파수"), acPoints: finite(item.acPoints, 2, 512, "AC 주파수 점 수", true),
  };
  if (config.acStopHz < config.acStartHz) fail("AC 끝 주파수는 시작 주파수 이상이어야 합니다.");
  const driven = [config.source.netId, ...config.extraSources!.map(source => source.netId), ...config.supplies.map(supply => supply.netId)];
  if (driven.includes(config.groundNetId)) fail("기준 접지 노드에 입력 신호나 독립 전원을 연결할 수 없습니다.");
  if (new Set(driven).size !== driven.length) fail("하나의 노드에 입력 신호와 DC 전원을 중복 지정할 수 없습니다.");
  return config;
}

/** Deliberately accepts only explicit SI values, never a digit prefix of a label. */
export function parseSimulationValue(value: string, kind: "resistor" | "capacitor"): number {
  if (typeof value !== "string" || value.length > 80) fail("소자 값은 명시적인 SI 수치여야 합니다.");
  const result = parseExplicitComponentValue(value, kind);
  if (result === null) fail(`${value}: ${kind === "resistor" ? "10 kΩ" : "100 nF"}처럼 단위가 맞는 소자 값을 입력하세요.`);
  return finite(result, kind === "resistor" ? 1e-3 : 1e-15, kind === "resistor" ? 1e12 : 1, `${value}의 SI 값`);
}

export function defaultSimulationConfig(circuit: Circuit): SimulationConfig {
  const nets = [...new Set(circuit.components.flatMap(component => Object.values(component.pinNets)))];
  const groundNetId = nets.find(net => getPowerNetRole(circuit, net) === "ground") ?? "GND";
  const generator = circuit.instruments.find(connection => ["fg-signal", "rf"].includes(connection.id) && nets.includes(connection.netId) && !getPowerNetRole(circuit, connection.netId));
  const signal = generator?.netId ?? nets.find(net => /^(?:IN|INPUT|VIN|SIGNAL)$/i.test(net));
  const sourceNet = signal ?? nets.find(net => getPowerNetRole(circuit, net) === "positive") ?? nets.find(net => net !== groundNetId) ?? "IN";
  let frequencyHz = 1000, amplitudePeak = signal ? 0.1 : 0;
  // Only a complete, unambiguous generator preset is used. Instructions such as
  // "start low" and unspecified amplitudes are not interpreted as measurements.
  const preset = /^\s*(\d+(?:\.\d+)?)\s*(Hz|kHz|MHz)\s*·\s*(\d+(?:\.\d+)?)\s*(V|mV|uV|µV|μV)\s*(pp|peak)\s*$/.exec(generator?.setting ?? "");
  if (preset) {
    const frequency = Number(preset[1]) * (preset[2] === "MHz" ? 1e6 : preset[2] === "kHz" ? 1e3 : 1);
    const peak = Number(preset[3]) * (preset[4] === "V" ? 1 : preset[4] === "mV" ? 1e-3 : 1e-6) / (preset[5] === "pp" ? 2 : 1);
    if (frequency >= 0.001 && frequency <= 1e7 && peak >= 0 && peak <= 1e4) { frequencyHz = frequency; amplitudePeak = peak; }
  }
  const voltage = (net: string) => {
    const name = circuit.netNames[net] ?? net;
    const match = /^([+-]?\d+(?:\.\d+)?)\s*V$/i.exec(name.trim().replace(/−/g, "-"));
    if (match) return Number(match[1]);
    const setting = circuit.instruments.find(connection => connection.netId === net)?.setting ?? "";
    const preset = /^([+-]?\d+(?:\.\d+)?)\s*V$/i.exec(setting.trim().replace(/−/g, "-"));
    return preset ? Number(preset[1]) : getPowerNetRole(circuit, net) === "negative" ? -9 : 9;
  };
  const discreteOpamp = circuit.id.startsWith("discrete-opamp-"), lowpassTones = circuit.id === "discrete-opamp-sallen-key" && nets.includes("VNOISE");
  const extraSources: SimulationSource[] = lowpassTones ? [
    { netId: "VNOISE", waveform: "sine", frequencyHz: 8000, amplitudePeak: 0.6, offset: 0, phaseDegrees: 0 },
  ] : circuit.id === "bjt-mixer" && nets.includes("LO_PLUS") && nets.includes("LO_MINUS") ? [
    { netId: "LO_PLUS", waveform: "sine", frequencyHz: 4000, amplitudePeak: 0.005, offset: 0, phaseDegrees: 0 },
    { netId: "LO_MINUS", waveform: "sine", frequencyHz: 4000, amplitudePeak: 0.005, offset: 0, phaseDegrees: 180 },
  ] : [];
  const supplies = nets.filter(net => net !== groundNetId && net !== sourceNet && ["positive", "negative"].includes(getPowerNetRole(circuit, net) ?? "")).map(net => ({ netId: net, voltage: voltage(net) })).slice(0, 8);
  if (circuit.id === "mos-current-mirror" && nets.includes("DRAIN") && sourceNet !== "DRAIN") supplies.push({ netId: "DRAIN", voltage: 3 });
  const schmitt = circuit.id.startsWith("schmitt-"), autonomous = ["wien-bridge", "relaxation-oscillator"].includes(circuit.id);
  return { groundNetId, source: { netId: sourceNet, waveform: schmitt ? "triangle" : signal ? "sine" : "dc", frequencyHz, amplitudePeak: schmitt ? 4 : amplitudePeak, offset: signal ? 0 : voltage(sourceNet), phaseDegrees: 0 }, extraSources, supplies,
    opampModel: autonomous || schmitt || circuit.id === "ua741-push-pull" ? "educational-dynamic" : "ideal", startupPerturbationVolts: autonomous ? 0.001 : 0,
    ...(discreteOpamp ? { timeStepPolicy: "damp-fast-rc" as const } : {}),
    durationSeconds: circuit.id === "wien-bridge" ? 0.003 : autonomous ? 0.004 : lowpassTones ? 0.0075 : Math.min(60, 5 / frequencyHz), sampleCount: autonomous || lowpassTones ? 4096 : 1024, acStartHz: 10, acStopHz: discreteOpamp ? 1000000 : 100000, acPoints: 96 };
}

type Passive = { id: string; kind: "resistor" | "capacitor"; a: string; b: string; value: number; polarized: boolean };
type Opamp = { id: string; minus: string; plus: string; out: string; low: string; high: string };
type Drive = { net: string; voltage: number };

function prepare(circuit: Circuit, definitions: ComponentDefinition[], config: SimulationConfig) {
  if (!Array.isArray(circuit.components) || !circuit.components.length || circuit.components.length > 80) fail("수치 시뮬레이션은 1~80개 소자를 지원합니다.");
  const defs = new Map(definitions.map(definition => [definition.id, definition]));
  const passives: Passive[] = [], opamps: Opamp[] = [], transformers: IdealCenterTap[] = [], nets = new Set<string>(), ids = new Set<string>();
  let nonlinear: ReturnType<typeof buildNonlinearDevices>;
  try { nonlinear = buildNonlinearDevices(circuit, definitions); }
  catch (error) { fail(error instanceof Error ? error.message : "비선형 소자 모델을 만들 수 없습니다."); }
  const nonlinearById = new Map(nonlinear.devices.map(device => [device.id, device]));
  const uses = new Map<string, number>();
  for (const component of circuit.components) for (const net of Object.values(component.pinNets)) uses.set(net, (uses.get(net) ?? 0) + 1);
  const signals = [config.source, ...config.extraSources ?? []];
  const drives: Drive[] = [...signals.map(source => ({ net: source.netId, voltage: source.offset })), ...config.supplies.map(supply => ({ net: supply.netId, voltage: supply.voltage }))];
  const fixed = new Map([[config.groundNetId, 0], ...drives.map(drive => [drive.net, drive.voltage] as [string, number])]);
  for (const component of circuit.components) {
    if (ids.has(component.id)) fail(`${component.id}: 소자 식별자가 중복되었습니다.`); ids.add(component.id);
    const definition = defs.get(component.definitionId);
    if (!definition) fail(`${component.id}: 소자 정의를 찾을 수 없습니다.`);
    const nonlinearDevice = nonlinearById.get(component.id);
    // Numerical availability does not grant a physical footprint. The caller's
    // breadboard validator still rejects external devices without verified leads.
    if (definition.mounting !== "direct" && !nonlinearDevice && definition.id !== IDEAL_CENTER_TAP_ID) fail(`${component.id}: 어댑터·외부 소자는 현재 수치 모델에 없습니다.`);
    const pin = (id: string) => { const net = netName(component.pinNets[id], `${component.id}.${id}`); nets.add(net); return net; };
    if (Object.keys(component.pinNets).some(id => !definition.pins.some(pin => pin.id === id))) fail(`${component.id}: 정의에 없는 핀 연결입니다.`);
    if (nonlinearDevice) {
      for (const net of nonlinearDevice.pins) nets.add(netName(net, component.id));
    } else if (definition.kind === "transformer") {
      for (const id of ["1", "2", "3", "4", "5"]) pin(id);
      try { transformers.push(buildIdealCenterTap(component, definition)); }
      catch (error) { fail(error instanceof Error ? error.message : "변압기 모델을 만들 수 없습니다."); }
    } else if (["resistor", "capacitor", "electrolytic"].includes(definition.kind)) {
      if (definition.pins.length !== 2 || !definition.pins.some(pin => pin.id === "1") || !definition.pins.some(pin => pin.id === "2")) fail(`${component.id}: 지원하지 않는 2핀 소자 핀맵입니다.`);
      const kind = definition.kind === "resistor" ? "resistor" : "capacitor";
      passives.push({ id: component.id, kind, a: pin("1"), b: pin("2"), value: parseSimulationValue(component.value, kind), polarized: definition.kind === "electrolytic" });
    } else if (definition.kind === "opamp") {
      // ST UA741 datasheet, top view: 2 IN-, 3 IN+, 4 V-, 6 OUT, 7 V+.
      // https://www.st.com/resource/en/datasheet/ua741.pdf
      const labels = ["OFFSET 1", "IN−", "IN+", "V−", "OFFSET 2", "OUT", "V+", "NC"];
      if (definition.id !== "opamp-ua741cn-st-dip8" || definition.pinoutStatus !== "datasheet" || !/^DIP[ -]?8$/i.test(definition.package) || definition.pins.length !== 8 || labels.some((label, index) => definition.pins.find(pin => pin.id === String(index + 1))?.label !== label)) fail(`${component.id}: 검증된 ST UA741CN DIP8 핀맵만 이상적 op-amp 모델로 지원합니다.`);
      for (const id of ["1", "5", "8"]) {
        const net = component.pinNets[id];
        if (net && ((uses.get(net) ?? 0) > 1 || fixed.has(net) || circuit.instruments.some(connection => connection.netId === net))) fail(`${component.id}.${id}: 오프셋·NC 핀의 외부 연결은 모델링하지 않습니다. 이 핀은 독립 미연결이어야 합니다.`);
      }
      const op = { id: component.id, minus: pin("2"), plus: pin("3"), low: pin("4"), out: pin("6"), high: pin("7") };
      if (!fixed.has(op.low) || !fixed.has(op.high) || signals.some(signal => (signal.netId === op.low || signal.netId === op.high) && signal.waveform !== "dc" && signal.amplitudePeak > 0) || fixed.get(op.high)! <= fixed.get(op.low)!) fail(`${component.id}: V+·V− 핀에 서로 구분된 DC 전원(또는 0 V 기준)을 지정하세요.`);
      opamps.push(op);
    } else fail(`${component.id}: ${definition.name}(${definition.kind})의 수치 모델은 아직 지원하지 않습니다. 지원하지 않는 회로의 파형을 생성하지 않습니다.`);
  }
  if (!nets.has(config.groundNetId)) fail("선택한 기준 접지가 모델의 실제 소자 핀에 연결되어 있지 않습니다.");
  for (const drive of drives) if (!nets.has(drive.net)) fail(`${drive.net}: 입력·전원 노드가 모델의 실제 소자 핀에 없습니다.`);
  if (nets.size > 128) fail("수치 모델의 연결 노드는 최대 128개입니다. 회로를 나누세요.");
  const adjacency = new Map<string, Set<string>>();
  for (const part of passives) { if (!adjacency.has(part.a)) adjacency.set(part.a, new Set()); if (!adjacency.has(part.b)) adjacency.set(part.b, new Set()); adjacency.get(part.a)!.add(part.b); adjacency.get(part.b)!.add(part.a); }
  // A winding is conductive; primary and secondary remain galvanically isolated.
  for (const transformer of transformers) for (const winding of [[transformer.primaryPlus, transformer.primaryMinus], [transformer.secondaryPlus, transformer.centerTap, transformer.secondaryMinus]]) for (const from of winding) for (const to of winding) if (from !== to) {
    if (!adjacency.has(from)) adjacency.set(from, new Set()); adjacency.get(from)!.add(to);
  }
  const passiveAdjacency = new Map([...adjacency].map(([net, connected]) => [net, new Set(connected)]));
  for (const device of nonlinear.devices) for (const from of device.pins) for (const to of device.pins) if (from !== to) {
    if (!adjacency.has(from)) adjacency.set(from, new Set()); adjacency.get(from)!.add(to);
  }
  const feedbackPath = (start: string, target: string, graph = adjacency) => {
    if (start === target) return true;
    const seen = new Set([start]), pending = [start];
    while (pending.length) for (const next of graph.get(pending.pop()!) ?? []) {
      if (fixed.has(next) || seen.has(next)) continue;
      if (next === target) return true;
      seen.add(next); pending.push(next);
    }
    return false;
  };
  const active = nonlinear.devices.filter(device => device.pinLabels.includes("B") || device.pinLabels.includes("G"));
  const activeEdges = new Map(active.map(device => [device.id, active.filter(other => other !== device && !fixed.has(device.pins[0]) && feedbackPath(device.pins[0], other.pins[1], passiveAdjacency)).map(other => other.id)]));
  const activeVisited = new Set<string>(), activeVisiting = new Set<string>();
  const visitActive = (id: string) => {
    if (activeVisiting.has(id)) fail("트랜지스터 사이의 순환 피드백·래치·자율 발진은 현재 교육용 모델의 지원 범위 밖입니다. DC 평형의 수렴만으로 안정 동작을 보증할 수 없습니다.");
    if (activeVisited.has(id)) return;
    activeVisiting.add(id); for (const next of activeEdges.get(id) ?? []) visitActive(next); activeVisiting.delete(id); activeVisited.add(id);
  };
  for (const device of active) visitActive(device.id);
  const dynamicOpamps = config.opampModel === "educational-dynamic";
  let positiveFeedback = false;
  for (const op of opamps) {
    if (fixed.has(op.out)) fail(`${op.id}: 연산증폭기 출력에 이상적 전압원을 중복 연결할 수 없습니다.`);
    if (!feedbackPath(op.out, op.minus)) { positiveFeedback = true; if (!dynamicOpamps) fail(`${op.id}: 출력에서 반전 입력으로 가는 음의 피드백 경로가 필요합니다. 개방루프·비교기 회로는 이상 모델로 지원하지 않습니다.`); }
    if (feedbackPath(op.out, op.plus)) { positiveFeedback = true; if (!dynamicOpamps) fail(`${op.id}: 양의 피드백·발진기·Schmitt 회로는 이상적 선형 모델로 시뮬레이션하지 않습니다.`); }
  }
  // Local negative feedback does not prove that a loop through several amplifiers
  // is stable. Support feed-forward cascades; conservatively reject any inter-amp
  // cycle instead of returning an unstable equilibrium as an operating waveform.
  const dependencies = new Map(opamps.map(op => [op.id, opamps.filter(other => other !== op && (feedbackPath(op.out, other.plus) || feedbackPath(op.out, other.minus))).map(other => other.id)]));
  const visiting = new Set<string>(), visited = new Set<string>();
  const visit = (id: string) => {
    if (visiting.has(id)) { positiveFeedback = true; if (!dynamicOpamps) fail("여러 연산증폭기를 거치는 순환 피드백은 현재 선형 모델의 지원 범위 밖입니다. 개별 음의 피드백 증폭기와 순방향 연결만 지원합니다."); return; }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const next of dependencies.get(id) ?? []) visit(next);
    visiting.delete(id); visited.add(id);
  };
  for (const op of opamps) visit(op.id);
  const names = [...nets].filter(net => net !== config.groundNetId), index = new Map(names.map((net, i) => [net, i]));
  const size = names.length + drives.length + opamps.length + 2 * transformers.length;
  if (size > 128) fail("MNA 연립방정식은 최대 128개 미지수를 지원합니다. 회로를 나누세요.");
  return { passives, opamps, transformers, drives, names, index, size, signals, nonlinear, dynamicOpamps, positiveFeedback, fixed };
}

/** Shared deterministic timestep/work budget for execution and capture fitting. */
function simulationTimePlan(model: ReturnType<typeof prepare>, config: SimulationConfig) {
  const { passives, opamps, drives, signals, dynamicOpamps, positiveFeedback, size } = model;
  const outputStep = config.durationSeconds / (config.sampleCount - 1);
  const dynamicSignals = signals.filter(source => source.waveform !== "dc" && source.amplitudePeak > 0);
  const samplingLimits = dynamicSignals.map(sourceSamplingLimits);
  let minTau = Infinity;
  const prescribed = new Set([config.groundNetId, ...drives.map(drive => drive.net)]);
  for (const cap of passives.filter(part => part.kind === "capacitor")) {
    const freeTerminals = [cap.a, cap.b].filter(net => !prescribed.has(net));
    if (!freeTerminals.length) continue;
    const conductance = passives.filter(part => part.kind === "resistor" && (freeTerminals.includes(part.a) || freeTerminals.includes(part.b))).reduce((sum, part) => sum + 1 / part.value, 0);
    if (conductance) minTau = Math.min(minTau, cap.value / conductance);
  }
  const opampStep = dynamicOpamps && opamps.length ? positiveFeedback ? 0.5 / (TAU * EDUCATIONAL_OPAMP.gainBandwidthHz) : 1e-6 : Infinity;
  // The default resolves each RC estimate. The opt-in policy keeps only the source
  // sampling limits, so backward Euler damps faster RC modes instead of tracing them.
  const rcStep = config.timeStepPolicy === "damp-fast-rc" ? Infinity : minTau / 100;
  const maximumStep = Math.min(dynamicSignals.length ? Math.min(...samplingLimits.map(limit => limit.maximumInternalStepSeconds), rcStep) : outputStep, opampStep, dynamicOpamps && opamps.length ? rcStep : Infinity);
  const maximumOutputStep = Math.min(...samplingLimits.map(limit => limit.maximumOutputStepSeconds));
  const subdivisions = Math.max(1, Math.ceil(outputStep / maximumStep));
  const totalSteps = subdivisions * (config.sampleCount - 1);
  const fixedWork = 2 * size ** 3 + config.acPoints * 4 * size ** 3 / 3;
  const workPerStep = 2 * size ** 2;
  return { outputStep, dynamicSignals, samplingLimits, maximumStep, maximumOutputStep, subdivisions, totalSteps, fixedWork, workPerStep, work: fixedWork + totalSteps * workPerStep };
}

/** Fits known model/time limits only; nonlinear convergence remains an execution check. */
export function fitSimulationTimeRange(circuit: Circuit, definitions: ComponentDefinition[], input: SimulationConfig): { durationSeconds: number; sampleCount: number; limited: boolean } {
  const config = parseSimulationConfig(input);
  const plan = simulationTimePlan(prepare(circuit, definitions, config), config);
  const { maximumStep, maximumOutputStep } = plan;
  if (plan.subdivisions <= 128 && plan.totalSteps <= 65536 && plan.work <= MAX_WORK && plan.outputStep <= maximumOutputStep * (1 + 1e-12)) {
    return { durationSeconds: config.durationSeconds, sampleCount: config.sampleCount, limited: false };
  }
  const maximumSteps = Math.min(65536, Math.floor((MAX_WORK - plan.fixedWork) / plan.workPerStep));
  if (maximumSteps < 31) fail("현재 회로와 AC 지점 수가 최소 시간 표본의 계산량 한도를 넘습니다. AC 지점 수를 줄이거나 회로를 나누세요.");
  const targetDuration = Math.min(config.durationSeconds, maximumSteps * maximumStep);
  const neededIntervals = Math.max(Math.ceil(targetDuration / maximumStep / 128), Math.ceil(targetDuration / maximumOutputStep));
  const sampleCount = Math.min(4096, maximumSteps + 1, Math.max(config.sampleCount, neededIntervals + 1));
  const intervals = sampleCount - 1;
  const subdivisions = Math.min(128, Math.floor(maximumSteps / intervals));
  // Leave room for floating-point division and Math.ceil at an exact step boundary.
  const maximumDuration = Math.min(maximumStep * subdivisions * intervals, maximumOutputStep * intervals) * (1 - 32 * Number.EPSILON);
  const durationSeconds = Math.min(config.durationSeconds, maximumDuration);
  if (durationSeconds < 1e-9) fail("이 회로의 빠른 응답은 최소 관측 시간 1 ns에서도 계산량 한도를 넘습니다. 소자 값과 회로 구성을 확인하세요.");
  return { durationSeconds, sampleCount, limited: durationSeconds < config.durationSeconds * (1 - 1e-12) };
}

type Matrix = Float64Array[];
function matrix(size: number): Matrix { return Array.from({ length: size }, () => new Float64Array(size)); }
function stamp(matrix: Matrix, a: number | undefined, b: number | undefined, value: number) {
  if (a !== undefined) matrix[a][a] += value;
  if (b !== undefined) matrix[b][b] += value;
  if (a !== undefined && b !== undefined) { matrix[a][b] -= value; matrix[b][a] -= value; }
}
function inject(rhs: Float64Array, a: number | undefined, b: number | undefined, value: number) {
  if (a !== undefined) rhs[a] += value;
  if (b !== undefined) rhs[b] -= value;
}

/** Row-scaled partial-pivot LU. One transient factorization is reused for all steps. */
function factor(real: Matrix, imaginary?: Matrix) {
  const n = real.length, re = real.map(row => row.slice()), im = imaginary?.map(row => row.slice()), scale = new Float64Array(n), swaps = new Int32Array(n);
  for (let row = 0; row < n; row++) {
    let norm = 0;
    for (let column = 0; column < n; column++) norm = Math.max(norm, Math.hypot(re[row][column], im?.[row][column] ?? 0));
    if (!(norm > 0) || !Number.isFinite(norm)) fail("회로 연립방정식이 특이합니다. DC 경로 없는 부유 노드·전원 충돌·피드백을 확인하세요.");
    scale[row] = norm;
    for (let column = 0; column < n; column++) { re[row][column] /= norm; if (im) im[row][column] /= norm; }
  }
  for (let k = 0; k < n; k++) {
    let pivot = k, largest = 0;
    for (let row = k; row < n; row++) { const value = Math.hypot(re[row][k], im?.[row][k] ?? 0); if (value > largest) { largest = value; pivot = row; } }
    if (largest < 1e-13 || !Number.isFinite(largest)) fail("회로가 부유하거나 특이/수치적으로 불안정합니다. 접지·DC 귀환 경로와 소자 값 범위를 확인하세요.");
    swaps[k] = pivot;
    if (pivot !== k) { [re[k], re[pivot]] = [re[pivot], re[k]]; if (im) [im[k], im[pivot]] = [im[pivot], im[k]]; }
    for (let row = k + 1; row < n; row++) {
      if (!im) {
        const multiplier = re[row][k] / re[k][k]; re[row][k] = multiplier;
        if (multiplier) for (let column = k + 1; column < n; column++) re[row][column] -= multiplier * re[k][column];
      } else {
        const denominator = re[k][k] ** 2 + im[k][k] ** 2;
        const mr = (re[row][k] * re[k][k] + im[row][k] * im[k][k]) / denominator;
        const mi = (im[row][k] * re[k][k] - re[row][k] * im[k][k]) / denominator;
        re[row][k] = mr; im[row][k] = mi;
        if (mr || mi) for (let column = k + 1; column < n; column++) {
          re[row][column] -= mr * re[k][column] - mi * im[k][column];
          im[row][column] -= mr * im[k][column] + mi * re[k][column];
        }
      }
    }
  }
  return (rhs: Float64Array) => {
    const xr = Float64Array.from(rhs, (value, i) => value / scale[i]), xi = im ? new Float64Array(n) : undefined;
    for (let k = 0; k < n; k++) {
      const pivot = swaps[k];
      if (pivot !== k) { [xr[k], xr[pivot]] = [xr[pivot], xr[k]]; if (xi) [xi[k], xi[pivot]] = [xi[pivot], xi[k]]; }
    }
    for (let row = 0; row < n; row++) for (let column = 0; column < row; column++) {
      xr[row] -= re[row][column] * xr[column] - (im && xi ? im[row][column] * xi[column] : 0);
      if (im && xi) xi[row] -= re[row][column] * xi[column] + im[row][column] * xr[column];
    }
    for (let row = n - 1; row >= 0; row--) {
      for (let column = row + 1; column < n; column++) {
        xr[row] -= re[row][column] * xr[column] - (im && xi ? im[row][column] * xi[column] : 0);
        if (im && xi) xi[row] -= re[row][column] * xi[column] + im[row][column] * xr[column];
      }
      if (!im || !xi) xr[row] /= re[row][row];
      else { const denominator = re[row][row] ** 2 + im[row][row] ** 2, r = xr[row], i = xi[row]; xr[row] = (r * re[row][row] + i * im[row][row]) / denominator; xi[row] = (i * re[row][row] - r * im[row][row]) / denominator; }
      if (!Number.isFinite(xr[row]) || Math.abs(xr[row]) > 1e12 || (xi && (!Number.isFinite(xi[row]) || Math.abs(xi[row]) > 1e12))) fail("수치 해가 발산하거나 계산 범위를 넘었습니다. 결과 파형을 생성하지 않습니다.");
    }
    return { real: xr, imaginary: xi };
  };
}

/** Pure numerical analysis. Physical breadboard/probe validation belongs to the caller. */
export function runSimulation(circuit: Circuit, definitions: ComponentDefinition[], input: SimulationConfig): SimulationResult {
  const config = parseSimulationConfig(input), model = prepare(circuit, definitions, config);
  const { passives, opamps, transformers, drives, names, index, size, signals, nonlinear, dynamicOpamps, positiveFeedback, fixed } = model;
  if (!dynamicOpamps && config.startupPerturbationVolts) fail("시동 외란은 교육용 동적 op-amp 모델에서만 사용할 수 있습니다.");
  if (!opamps.length && config.startupPerturbationVolts) fail("시동 외란을 적용할 연산증폭기가 회로에 없습니다.");
  const { outputStep, dynamicSignals, samplingLimits, subdivisions, totalSteps, work } = simulationTimePlan(model, config);
  const dynamic = dynamicSignals.length > 0;
  samplingLimits.forEach((limit, index) => {
    if (outputStep > limit.maximumOutputStepSeconds * (1 + 1e-12)) fail(`${dynamicSignals[index].netId}: 파형 표본이 부족합니다. 가장 빠른 주파수(AM·DSB-SC는 반송파+변조 주파수) 한 주기당 32개, 펄스의 짧은 high/low 구간당 4개 표본이 필요합니다. 현재 시간 범위에는 최소 ${Math.ceil(config.durationSeconds / limit.maximumOutputStepSeconds) + 1}개가 필요합니다(최대 4,096개). 시간 범위를 줄이거나 표본 수를 늘리세요.`);
  });
  if (subdivisions > 128 || totalSteps > 65536) fail("입력 파형·빠른 RC 응답을 계산하기에 시간 범위가 너무 큽니다. 시간 범위를 줄이세요(출력 구간당 내부 최대 128단계, 전체 최대 65,536단계).");
  if (work > MAX_WORK) fail("회로 크기와 시간·AC 표본의 조합이 계산량 한도를 넘습니다. 표본 수·AC 점 수·시간 범위를 줄이거나 회로를 나누세요.");
  let workUsed = work;
  const charge = (additional: number) => { workUsed += additional; if (workUsed > MAX_WORK) fail("비선형 반복 계산량 한도를 넘었습니다. 시간 범위·표본 수·회로 크기를 줄이세요."); };
  const nonlinearCall = <T>(operation: () => T, label: string): T => {
    try { return operation(); } catch (error) { if (error instanceof SimulationError) throw error; fail(`${label}: ${error instanceof Error ? error.message : "수렴하지 않았습니다."} 미수렴 파형은 표시하지 않습니다.`); }
  };
  const step = outputStep / subdivisions;
  const base = matrix(size);
  for (const part of passives) if (part.kind === "resistor") stamp(base, index.get(part.a), index.get(part.b), 1 / part.value);
  drives.forEach((drive, i) => { const row = names.length + i, node = index.get(drive.net)!; base[node][row] = 1; base[row][node] = 1; });
  opamps.forEach((op, i) => {
    const row = names.length + drives.length + i, out = index.get(op.out), plus = index.get(op.plus), minus = index.get(op.minus);
    if (out !== undefined) base[out][row] += 1;
    if (!dynamicOpamps) {
      if (plus !== undefined) base[row][plus] += 1;
      if (minus !== undefined) base[row][minus] -= 1;
    }
  });
  const transformerRow = (i: number) => names.length + drives.length + opamps.length + 2 * i;
  transformers.forEach((part, i) => {
    // Branch currents iU: S+ -> CT, iL: CT -> S-. The constraints
    // VsU = h*Vp and VsL = h*Vp share h=Ns/(2*Np). Symmetric stamps
    // reflect Ip=-h*(iU+iL), so every instantaneous port power sums to zero.
    const h = 1 / (2 * part.turnsRatio);
    const windings = [[part.secondaryPlus, part.centerTap], [part.centerTap, part.secondaryMinus]];
    windings.forEach(([a, b], winding) => {
      const row = transformerRow(i) + winding;
      for (const [net, coefficient] of [[a, 1], [b, -1], [part.primaryPlus, -h], [part.primaryMinus, h]] as [string, number][]) {
        const node = index.get(net);
        if (node !== undefined) { base[node][row] += coefficient; base[row][node] += coefficient; }
      }
    });
  });
  const rhs = new Float64Array(size);
  drives.forEach((drive, i) => { rhs[names.length + i] = drive.voltage; });
  const newtonIndex = new Map(index);
  const dynamicModels = dynamicOpamps ? opamps.map((op, i) => {
    let equationNet = `__mna:${op.id}`; while (newtonIndex.has(equationNet)) equationNet += ":";
    newtonIndex.set(equationNet, names.length + drives.length + i);
    return nonlinearCall(() => createEducationalOpamp(op.id, op.out, op.plus, op.minus, fixed.get(op.low)!, fixed.get(op.high)!, equationNet), op.id);
  }) : [];
  const allDevices = [...nonlinear.devices, ...dynamicModels.map(model => model.device)];
  const newton = allDevices.length ? createNewtonSolver(allDevices, newtonIndex, names.length, (matrix, rhs) => factor(matrix)(rhs).real, charge, drives.map(drive => index.get(drive.net)!)) : null;
  const validateFinal = (state: Float64Array) => nonlinearCall(() => { for (const device of allDevices) device.validateFinal(device.pins.map(net => { const i = newtonIndex.get(net); return i === undefined ? 0 : state[i]; })); }, "모델 적용 범위");
  const dcState = newton ? nonlinearCall(() => newton.operatingPoint(base, rhs), "DC 동작점") : factor(base)(rhs).real;
  validateFinal(dcState);
  const valueAt = (state: Float64Array, net: string) => { const i = index.get(net); return i === undefined ? 0 : state[i]; };
  for (const part of transformers) if (Math.abs(valueAt(dcState, part.primaryPlus) - valueAt(dcState, part.primaryMinus)) > 1e-9) fail(`${part.id}: 이상 변압기에 DC 전압차를 인가할 수 없습니다. 1차 양단의 DC 동작점을 같게 설정하세요. 자화·포화를 생략한 모델로 DC 변압 파형을 만들지 않습니다.`);
  const dc: SimulationResult["dc"] = { nodeVoltages: record<number>(), componentCurrents: record<number>(), sourceCurrents: record<number>() };
  dc.nodeVoltages[config.groundNetId] = 0;
  names.forEach((net, i) => { dc.nodeVoltages[net] = dcState[i]; });
  drives.forEach((drive, i) => { dc.sourceCurrents[drive.net] = dcState[names.length + i]; });
  for (const part of passives) dc.componentCurrents[part.id] = part.kind === "resistor" ? (valueAt(dcState, part.a) - valueAt(dcState, part.b)) / part.value : 0;
  if (nonlinear.devices.length || transformers.length) {
    dc.deviceCurrents = record<Record<string, number>>();
    for (const device of nonlinear.devices) {
      const currents = device.evaluate(device.pins.map(net => valueAt(dcState, net))).currents;
      dc.deviceCurrents[device.id] = Object.fromEntries(device.pinLabels.map((pin, i) => [pin, currents[i]]));
    }
    transformers.forEach((part, i) => {
      const upper = dcState[transformerRow(i)], lower = dcState[transformerRow(i) + 1];
      const primary = -(upper + lower) / (2 * part.turnsRatio);
      dc.deviceCurrents![part.id] = { "P+": primary, "P−": -primary, "S+": upper, CT: lower - upper, "S−": -lower };
    });
  }
  let initialState = dcState;
  if (dynamicModels.length && config.startupPerturbationVolts) {
    dynamicModels.forEach((model, i) => model.initial(valueAt(dcState, model.out) + config.startupPerturbationVolts! * (i % 2 ? -1 : 1)));
    initialState = nonlinearCall(() => newton!.solve(base, rhs, dcState, 60), "시동 초기조건");
    validateFinal(initialState);
  }
  const time = Array.from({ length: config.sampleCount }, (_, i) => i * outputStep);
  const nodeVoltages = record<number[]>();
  for (const net of [config.groundNetId, ...names]) nodeVoltages[net] = [valueAt(initialState, net)];
  const transient = base.map(row => row.slice());
  const capacitors = passives.filter(part => part.kind === "capacitor").map(part => ({ ...part, aIndex: index.get(part.a), bIndex: index.get(part.b), conductance: part.value / step }));
  for (const cap of capacitors) stamp(transient, cap.aIndex, cap.bIndex, cap.conductance);
  const transientSolve = newton ? null : factor(transient);
  const transientMatrices = new Map<number, Matrix>([[step, transient]]);
  let acceptedSteps = 0;
  const advanceNonlinear = (previous: Float64Array, start: number, interval: number, depth = 0): Float64Array => {
    let matrix = transientMatrices.get(interval);
    if (!matrix) {
      matrix = base.map(row => row.slice());
      for (const cap of capacitors) stamp(matrix, cap.aIndex, cap.bIndex, cap.value / interval);
      transientMatrices.set(interval, matrix);
    }
    const next = rhs.slice();
    signals.forEach((source, i) => { next[names.length + i] = sourceVoltage(source, start + interval); });
    for (const cap of capacitors) inject(next, cap.aIndex, cap.bIndex, cap.value / interval * (valueAt(previous, cap.a) - valueAt(previous, cap.b)));
    dynamicModels.forEach(model => model.transient(valueAt(previous, model.out), interval));
    let result: Float64Array;
    try { result = newton!.solve(matrix, next, previous, 30); }
    catch (error) {
      if (!(error instanceof NewtonConvergenceError)) throw error;
      if (depth >= 6) fail(`${(start + interval).toPrecision(5)} s: 시간 단계를 64분의 1까지 줄여도 수렴하지 않았습니다. 미수렴 파형은 표시하지 않습니다.`);
      const middle = advanceNonlinear(previous, start, interval / 2, depth + 1);
      return advanceNonlinear(middle, start + interval / 2, interval / 2, depth + 1);
    }
    validateFinal(result);
    if (++acceptedSteps > 65536) fail("수렴을 위한 추가 시간 단계가 65,536개를 넘었습니다. 시간 범위를 줄이세요.");
    return result;
  };
  let state = initialState;
  const evolving = dynamic || Boolean(config.startupPerturbationVolts && dynamicModels.length);
  for (let sample = 1; sample < config.sampleCount; sample++) {
    for (let sub = 1; sub <= subdivisions; sub++) {
      const next = rhs.slice();
      signals.forEach((source, i) => { next[names.length + i] = sourceVoltage(source, (sample - 1) * outputStep + sub * step); });
      for (const cap of capacitors) inject(next, cap.aIndex, cap.bIndex, cap.conductance * (valueAt(state, cap.a) - valueAt(state, cap.b)));
      state = !evolving ? dcState : newton ? advanceNonlinear(state, (sample - 1) * outputStep + (sub - 1) * step, step) : transientSolve!(next).real;
    }
    nodeVoltages[config.groundNetId].push(0);
    names.forEach((net, i) => nodeVoltages[net].push(state[i]));
  }
  const acUnavailableReason = dynamicModels.length && positiveFeedback ? "양의 피드백·비교기·자율 발진 회로의 DC 평형은 안정성이 보장되지 않아 AC 전달함수를 제공하지 않습니다. 시간 응답과 주파수 스펙트럼을 확인하세요." : undefined;
  const frequenciesHz = acUnavailableReason ? [] : Array.from({ length: config.acPoints }, (_, i) => config.acStartHz * (config.acStopHz / config.acStartHz) ** (i / (config.acPoints - 1)));
  const nodeGainMagnitude = record<number[]>(), nodePhaseDegrees = record<number[]>();
  dynamicModels.forEach(model => model.dc());
  const acBase = newton ? newton.linearize(base, dcState) : base;
  for (const net of [config.groundNetId, ...names]) { nodeGainMagnitude[net] = []; nodePhaseDegrees[net] = []; }
  for (const frequency of frequenciesHz) {
    const imaginary = matrix(size);
    for (const cap of capacitors) stamp(imaginary, cap.aIndex, cap.bIndex, TAU * frequency * cap.value);
    dynamicModels.forEach(model => { imaginary[newtonIndex.get(model.equationNet)!][index.get(model.out)!] += TAU * frequency / model.pole; });
    const excitation = new Float64Array(size); excitation[names.length] = 1;
    const solution = factor(acBase, imaginary)(excitation);
    nodeGainMagnitude[config.groundNetId].push(0); nodePhaseDegrees[config.groundNetId].push(0);
    names.forEach((net, i) => { const real = solution.real[i], imag = solution.imaginary![i]; nodeGainMagnitude[net].push(Math.hypot(real, imag)); nodePhaseDegrees[net].push(real === 0 && imag === 0 ? 0 : Math.atan2(imag, real) * 180 / Math.PI); });
  }
  const warnings = [allDevices.length ? "R/C는 이상 소자이며 능동 소자는 명시된 교육용 근사 모델입니다. 실제 공차·누설·온도·정격·계측기 부하와 제조사 SPICE 모델을 재현하지 않습니다." : LIMIT_WARNING, ...nonlinear.warnings, "시간 응답은 모든 입력 DC 오프셋의 동작점에서 시작하며 backward Euler 내부 시간 적분을 사용합니다. AC는 이 동작점에서 주 입력만 단위 소신호로 선형화한 결과이며 추가 입력의 AC 성분은 0입니다."];
  if (transformers.length) warnings.push(IDEAL_TRANSFORMER_WARNING);
  if (nonlinear.devices.length) warnings.push("BJT·MOSFET·다이오드는 교육용 비선형 모델입니다. 제조사 SPICE의 기생 커패시턴스·온도·항복·정격 모델이 아니며 Newton 잔차와 전압 변화가 모두 수렴한 결과만 표시합니다.");
  if (circuit.id === "mos-current-mirror") warnings.push("전류 미러의 DRAIN 전원 기본값 3 V는 자료의 0~6 V sweep 중간값으로 선택한 시작 설정입니다. 실제 목표·계측 조건에 맞게 바꾸세요.");
  if (config.timeStepPolicy === "damp-fast-rc") warnings.push("내부 시간 간격 정책 damp-fast-rc: 입력 표본 한도만 지키고 빠른 RC 시상수(예: 보상 커패시터와 작은 직렬 저항)는 후진 오일러로 감쇠시켜 건너뜁니다. 수십 ns 이하의 과도 성분은 실제보다 매끄럽게 보일 수 있습니다.");
  if (circuit.id === "bjt-mixer") warnings.push("LO 기본값은 각 5 mV peak, 0°/180°의 대칭 구동입니다. 자료의 B1−B2 차동 입력은 실제 연결과 부하에서 다시 확인하세요.");
  if (config.source.waveform === "dc" && config.source.amplitudePeak) warnings.push("DC 파형에서는 피크 진폭을 사용하지 않고 오프셋 전압만 인가합니다.");
  if (dynamicSignals.some(source => ["square", "pulse", "sawtooth"].includes(source.waveform))) warnings.push("구형파·펄스·톱니파는 상승·하강 시간이 0인 이상적 발생기입니다. 주기당 출력 32표본/내부 128단계, 펄스의 짧은 high/low 구간당 출력 4표본/내부 16단계 이상을 요구하지만 무한 고조파·실제 발생기의 대역폭과 에지는 재현하지 않습니다.");
  if (dynamicSignals.some(source => source.waveform === "dsb" && (source.modulationFrequencyHz ?? SOURCE_DEFAULTS.modulationFrequencyHz) >= source.frequencyHz)) warnings.push("DSB-SC의 변조 주파수가 반송파 이상입니다. 하측파대 fc−fm이 0 Hz 이하로 접혀 DC 또는 반전 성분이 되므로 두 측파대가 분리된 억압반송파 파형으로 해석하지 마세요.");
  if (dynamicSignals.some(source => source.waveform === "dsb")) warnings.push("DSB-SC 입력은 진폭 × cos(2πfmt) × sin(2πfct+위상)입니다. 진폭은 곱의 계수이고 각 측파대의 peak는 그 절반입니다. AC 해석은 주 입력의 소신호 응답이며 주파수 변환 이득은 시간 파형에서 측정하세요.");
  if (dynamicSignals.some(source => source.waveform === "am")) warnings.push("AM 진폭은 반송파의 V peak이며 포락선 최대값은 진폭×(1+변조 깊이)입니다. 변조 위상은 cos 기준 0°, 입력 위상은 반송파에 적용합니다. AC 해석은 AM 측파대 변환 이득이 아닙니다.");
  if (opamps.length) warnings.push(dynamicModels.length ? "UA741 교육용 동적 모델: A0=200,000, GBW=1 MHz의 단일 극, slew rate=0.5 V/µs. 출력은 상태 방정식 안에서 각 전원으로부터 1.5 V의 가정된 headroom으로 제한합니다. 실제 부하별 swing·출력전류·추가 극·포화 회복·입력 공통모드 동작을 재현하지 않습니다." : OPAMP_WARNING);
  if (opamps.length) warnings.push("op-amp 출력 부하 전류를 VCC/VEE 전원 전류로 반영하지 않으므로 소비전력·효율을 계산할 수 없습니다. 피드백 연결 경로 검사와 AC 결과는 일반 회로의 안정성 증명이 아닙니다.");
  if (dynamicModels.length && config.startupPerturbationVolts) warnings.push(`시동 초기조건으로 op-amp 출력에 ${config.startupPerturbationVolts} V의 결정적 외란을 적용했습니다. 잡음·실물 부품 편차를 모델링한 발진 시동이 아닙니다.`);
  if (acUnavailableReason) warnings.push(acUnavailableReason, "DC 수렴은 평형의 안정성을 의미하지 않습니다. 시동 외란과 초기조건에 따라 시간 응답이 달라질 수 있습니다.");
  if (dynamicSignals.length > 1) warnings.push("다중 신호 회로의 AC 결과는 주기적 혼합·주파수 변환 이득을 계산하지 않습니다. 실제 혼합 성분은 시간 응답의 스펙트럼에서 확인하세요.");
  for (const op of opamps) {
    const low = dc.nodeVoltages[op.low], high = dc.nodeVoltages[op.high];
    if (nodeVoltages[op.out].some(value => value < low || value > high)) warnings.push(`${op.id}: 계산된 출력이 전원 레일(${low}~${high} V)을 벗어납니다. 실제 UA741은 이 파형을 낼 수 없으며 현재 모델은 포화를 반영하지 않습니다.`);
    if (nodeVoltages[op.plus].some(value => value < low || value > high) || nodeVoltages[op.minus].some(value => value < low || value > high)) warnings.push(`${op.id}: 계산된 입력 전압이 전원 레일 밖입니다. 실제 입력 공통모드 범위·정격을 검증하지 않은 결과입니다.`);
  }
  for (const part of passives) if (part.polarized && nodeVoltages[part.a].some((value, i) => value - nodeVoltages[part.b][i] < -1e-9)) warnings.push(`${part.id}: 전해 커패시터 1번(+)에서 2번(−)으로의 전압이 음수입니다. 역극성 위험을 확인하세요. 모델은 극성 손상을 계산하지 않습니다.`);
  return { model: allDevices.length ? "nonlinear-educational" : "linear-ideal", transientMethod: "backward-euler", time, nodeVoltages, dc, ac: { frequenciesHz, nodeGainMagnitude, nodePhaseDegrees }, ...(acUnavailableReason ? { acUnavailableReason } : {}), warnings };
}
