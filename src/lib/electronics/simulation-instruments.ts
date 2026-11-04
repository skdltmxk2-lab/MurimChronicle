import type { Circuit, ComponentDefinition } from "./types";
import type { SimulationConfig, SimulationResult } from "./simulation-types";
import { parseSimulationValue } from "./simulation";
import { buildNonlinearDevices, getNonlinearModel, NONLINEAR_THERMAL_VOLTAGE } from "./simulation-models";

export type MultimeterMode = "dc-voltage" | "ac-voltage" | "dc-current" | "ac-current" | "resistance" | "continuity" | "diode";
export type MultimeterSettings = {
  mode: MultimeterMode;
  power: "on" | "off";
  redNetId?: string;
  blackNetId?: string;
  branch?: { componentId: string; terminal: string };
  startTimeSeconds?: number;
  endTimeSeconds?: number;
  continuityThresholdOhms?: number;
};
export type MultimeterReading = {
  mode: MultimeterMode;
  status: "ok" | "open" | "unsupported" | "invalid";
  value: number | null;
  unit: "V" | "A" | "Ω";
  message: string;
  warnings: string[];
  continuity?: boolean;
  testCurrentAmps?: number;
  statistics?: { mean: number; acRms: number; totalRms: number; durationSeconds: number; sampleCount: number };
  /** Step values apply on [time[i], time[i+1]); the last value repeats the last interval. */
  waveform?: { time: number[]; values: number[]; interpolation: "linear" | "step" };
};
export type MultimeterInput = {
  circuit: Circuit;
  definitions: ComponentDefinition[];
  /** Pass the immutable circuit/config snapshot that produced result. */
  config?: SimulationConfig;
  result?: SimulationResult;
  settings: MultimeterSettings;
};

const MODES: MultimeterMode[] = ["dc-voltage", "ac-voltage", "dc-current", "ac-current", "resistance", "continuity", "diode"];
const OFF_MODES = new Set<MultimeterMode>(["resistance", "continuity", "diode"]);
const CURRENT_MODES = new Set<MultimeterMode>(["dc-current", "ac-current"]);
const unitFor = (mode: MultimeterMode): MultimeterReading["unit"] => CURRENT_MODES.has(mode) ? "A" : mode === "resistance" || mode === "continuity" ? "Ω" : "V";
function object(value: unknown, allowed: string[], label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label}: 객체가 필요합니다.`);
  if (Object.keys(value).some(key => !allowed.includes(key))) throw new Error(`${label}: 알 수 없는 항목이 있습니다.`);
  return value as Record<string, unknown>;
}
function name(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim() || value !== value.trim() || value.length > 120) throw new Error(`${label}: 유효한 이름이 필요합니다.`);
  return value;
}
function number(value: unknown, min: number, max: number, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) throw new Error(`${label}: ${min}~${max} 범위의 유한한 수가 필요합니다.`);
  return value;
}

/** Shared strict JSON boundary for the UI and measurement API; never coerces numbers. */
export function parseMultimeterSettings(value: unknown): MultimeterSettings {
  const input = object(value, ["mode", "power", "redNetId", "blackNetId", "branch", "startTimeSeconds", "endTimeSeconds", "continuityThresholdOhms"], "멀티미터 설정");
  if (!MODES.includes(input.mode as MultimeterMode)) throw new Error("지원하지 않는 멀티미터 모드입니다.");
  if (input.power !== "on" && input.power !== "off") throw new Error("측정 또는 무전원 시험 해석 모드를 선택하세요.");
  const settings: MultimeterSettings = { mode: input.mode as MultimeterMode, power: input.power };
  if (input.redNetId !== undefined) settings.redNetId = name(input.redNetId, "빨간 프로브");
  if (input.blackNetId !== undefined) settings.blackNetId = name(input.blackNetId, "검은 프로브");
  if (input.branch !== undefined) {
    const branch = object(input.branch, ["componentId", "terminal"], "전류 프로브");
    settings.branch = { componentId: name(branch.componentId, "소자"), terminal: name(branch.terminal, "소자 단자") };
  }
  if (CURRENT_MODES.has(settings.mode)) { if (!settings.branch) throw new Error("전류를 측정할 소자와 단자를 선택하세요."); }
  else if (!settings.redNetId || !settings.blackNetId) throw new Error("빨간 프로브와 검은 프로브의 연결을 선택하세요.");
  if (input.startTimeSeconds !== undefined) settings.startTimeSeconds = number(input.startTimeSeconds, 0, 60, "측정 시작 시간");
  if (input.endTimeSeconds !== undefined) settings.endTimeSeconds = number(input.endTimeSeconds, 0, 60, "측정 종료 시간");
  if (settings.startTimeSeconds !== undefined && settings.endTimeSeconds !== undefined && settings.endTimeSeconds <= settings.startTimeSeconds) throw new Error("측정 종료 시간은 시작 시간보다 커야 합니다.");
  if (input.continuityThresholdOhms !== undefined) settings.continuityThresholdOhms = number(input.continuityThresholdOhms, 0, 1000, "도통 임계 저항");
  return settings;
}

function answer(settings: MultimeterSettings, status: MultimeterReading["status"], message: string, warnings: string[] = []): MultimeterReading {
  return { mode: settings.mode, status, value: null, unit: unitFor(settings.mode), message, warnings };
}
function capture(result: SimulationResult | undefined, config?: SimulationConfig) {
  if (!result || !Array.isArray(result.time) || result.time.length < 2 || result.time.length > 65536 || result.time.some((time, i) => !Number.isFinite(time) || time < 0 || (i > 0 && time <= result.time[i - 1]))) throw new Error("유효한 시간 응답 캡처가 필요합니다.");
  if (config && (config.sampleCount !== result.time.length || Math.abs(result.time.at(-1)! - config.durationSeconds) > Math.max(1e-12, config.durationSeconds * 1e-9))) throw new Error("측정 설정과 캡처의 시간 범위가 다릅니다. 새로 실행한 캡처를 선택하세요.");
  const voltage = (net: string) => {
    const values = Object.prototype.hasOwnProperty.call(result.nodeVoltages, net) ? result.nodeVoltages[net] : undefined;
    if (!Array.isArray(values) || values.length !== result.time.length || values.some(value => !Number.isFinite(value))) throw new Error(`${net}: 이 캡처에 유효한 노드 파형이 없습니다. 미연결 노드를 0 V로 간주하지 않습니다.`);
    return values;
  };
  return { time: result.time, voltage };
}

function windowSeries(time: number[], values: number[], settings: MultimeterSettings, interpolation: "linear" | "step") {
  const start = settings.startTimeSeconds ?? time[0], end = settings.endTimeSeconds ?? time.at(-1)!;
  if (start < time[0] || end > time.at(-1)! || end <= start) throw new Error(`측정 구간은 캡처의 ${time[0]}~${time.at(-1)} s 안에 있어야 합니다.`);
  const at = (x: number) => {
    let low = 0, high = time.length - 1;
    while (high - low > 1) { const mid = (low + high) >> 1; if (time[mid] <= x) low = mid; else high = mid; }
    return interpolation === "step" ? values[low] : values[low] + (values[high] - values[low]) * (x - time[low]) / (time[high] - time[low]);
  };
  const selectedTime = [start], selectedValues = [at(start)];
  for (let i = 1; i < time.length - 1; i++) if (time[i] > start && time[i] < end) { selectedTime.push(time[i]); selectedValues.push(values[i]); }
  selectedTime.push(end); selectedValues.push(at(end));
  return { time: selectedTime, values: selectedValues, interpolation };
}

/** Time-weighted integration; the centered second pass avoids subtracting two large squared DC values. */
function statistics(waveform: NonNullable<MultimeterReading["waveform"]>): NonNullable<MultimeterReading["statistics"]> {
  const { time, values, interpolation } = waveform, durationSeconds = time.at(-1)! - time[0];
  const integrate = (center: number, square: boolean) => {
    let sum = 0, correction = 0;
    for (let i = 0; i < time.length - 1; i++) {
      const a = values[i] - center, b = values[i + 1] - center, width = time[i + 1] - time[i];
      const area = width * (interpolation === "step" ? square ? a * a : a : square ? (a * a + a * b + b * b) / 3 : (a + b) / 2);
      const adjusted = area - correction, next = sum + adjusted; correction = (next - sum) - adjusted; sum = next;
    }
    return sum / durationSeconds;
  };
  const mean = integrate(0, false), acRms = Math.sqrt(Math.max(0, integrate(mean, true)));
  const totalRms = Math.hypot(mean, acRms);
  if (![mean, acRms, totalRms].every(Number.isFinite)) throw new Error("측정 통계의 수치 범위를 벗어났습니다.");
  return { mean, acRms, totalRms, durationSeconds, sampleCount: time.length };
}

function powered(input: MultimeterInput, settings: MultimeterSettings): MultimeterReading {
  if (settings.power !== "on") return answer(settings, "invalid", "전압·전류는 실행한 캡처에서 측정합니다. 무전원 시험 해석을 해제하세요.");
  const data = capture(input.result, input.config), warnings = ["저장된 시뮬레이션 캡처와 선택 시간 구간을 측정합니다. 표본 사이의 빠른 변화·기생성분·실물 계측기 오차는 재현하지 않습니다."];
  let values: number[], interpolation: "linear" | "step" = "linear";
  if (!CURRENT_MODES.has(settings.mode)) {
    const red = data.voltage(settings.redNetId!), black = data.voltage(settings.blackNetId!);
    values = red.map((value, i) => value - black[i]);
    warnings.push("전압계의 입력 임피던스는 무한대로 가정하며 회로 부하를 추가하지 않습니다. 표시 극성은 빨간 프로브 전압 − 검은 프로브 전압입니다.");
  } else {
    const branch = settings.branch!, component = input.circuit.components.find(component => component.id === branch.componentId);
    const definition = component && input.definitions.find(definition => definition.id === component.definitionId);
    if (!component || !definition) return answer(settings, "invalid", "전류 프로브에 지정한 소자 정의를 찾을 수 없습니다.");
    const pin = definition.pins.find(pin => pin.id === branch.terminal || pin.label === branch.terminal);
    if (!pin) return answer(settings, "invalid", `${component.id}: 선택한 단자가 없습니다.`);
    warnings.push("전류는 선택한 소자 단자로 유입되는 방향이 양수인 가상 전류 프로브입니다. 회로를 끊어 실제 전류계를 직렬 삽입하거나 burden 전압을 추가하지 않습니다.");
    if (["resistor", "capacitor", "electrolytic"].includes(definition.kind)) {
      if (definition.pins.length !== 2 || !["1", "2"].includes(pin.id) || !component.pinNets[1] || !component.pinNets[2]) return answer(settings, "unsupported", "이 소자의 2단자 전류 모델을 지원하지 않습니다.");
      const first = data.voltage(component.pinNets[1]), second = data.voltage(component.pinNets[2]), polarity = pin.id === "1" ? 1 : -1;
      if (definition.kind === "resistor") {
        const resistance = parseSimulationValue(component.value, "resistor");
        values = first.map((value, i) => polarity * (value - second[i]) / resistance);
      } else {
        const capacitance = parseSimulationValue(component.value, "capacitor");
        values = first.slice(0, -1).map((value, i) => polarity * capacitance * ((first[i + 1] - second[i + 1]) - (value - second[i])) / (data.time[i + 1] - data.time[i]));
        values.push(values.at(-1)!); interpolation = "step";
        warnings.push("커패시터 전류는 C·ΔV/Δt로 재구성한 표시 표본 구간의 평균 전류입니다. 내부 적분 단계의 순간 전류·이상적 스텝의 충격 전류와 같지 않으며 파형 해상도에 영향을 받습니다.");
      }
    } else {
      const model = getNonlinearModel(definition);
      if (!model) return answer(settings, "unsupported", `${definition.name}: 단자 전류 측정 모델이 없습니다. op-amp의 출력·전원 전류를 임의로 추정하지 않습니다.`, warnings);
      const role = model.rolePinIds.indexOf(pin.id);
      if (role < 0) return answer(settings, "unsupported", `${component.id}: 해당 단자 전류 모델이 없습니다.`, warnings);
      const { devices, warnings: modelWarnings } = buildNonlinearDevices({ ...input.circuit, components: [component] }, input.definitions);
      const device = devices[0]; if (!device) return answer(settings, "unsupported", "해당 소자의 전류 모델이 없습니다.", warnings);
      const voltages = device.pins.map(net => data.voltage(net));
      values = data.time.map((_, i) => { const sample = voltages.map(values => values[i]); device.validateFinal(sample); return device.evaluate(sample).currents[role]; });
      warnings.push(...modelWarnings, "반도체 단자 전류는 캡처 전압에 동일한 교육용 정적 소자 모델을 적용해 재구성합니다. 접합 용량·전하 저장에 의한 전류는 포함하지 않습니다.");
    }
  }
  if (values.some(value => !Number.isFinite(value))) return answer(settings, "invalid", "측정 파형의 수치 범위를 벗어났습니다.", warnings);
  const waveform = windowSeries(data.time, values, settings, interpolation), summary = statistics(waveform);
  const ac = settings.mode.startsWith("ac-");
  return { ...answer(settings, "ok", ac ? "선택 구간의 DC 평균을 제거한 AC true-RMS입니다." : "선택 시간 구간의 평균값입니다. DC 동작점 표와는 구분됩니다.", warnings),
    value: ac ? summary.acRms : summary.mean, statistics: summary, waveform };
}

type Resistor = { a: string; b: string; value: number };
function passiveResistance(input: MultimeterInput, settings: MultimeterSettings): MultimeterReading {
  const warnings = ["무전원 시험 해석입니다. 외부 전압원은 분리(개방), 커패시터는 정상상태 개방으로 두고 독립 시험 전류로 계산합니다.", "이상 저항망의 계산값이며 프로브·리드 저항, 시험 전압 한계, 실물 멀티미터의 분해능·자동 범위·오차는 모델링하지 않습니다."];
  const { circuit, definitions } = input, red = settings.redNetId!, black = settings.blackNetId!, defs = new Map(definitions.map(definition => [definition.id, definition]));
  const nets = new Set(circuit.components.flatMap(component => Object.values(component.pinNets)));
  if (!nets.has(red) || !nets.has(black)) return answer(settings, "open", "프로브가 회로 노드에 연결되어 있지 않습니다.", warnings);
  const threshold = settings.continuityThresholdOhms ?? 50;
  const finish = (value: number): MultimeterReading => ({ ...answer(settings, "ok", settings.mode === "continuity" ? `도통 기준은 ${threshold} Ω 이하입니다.` : "독립 시험 전류로 구한 두 프로브 사이의 등가 저항입니다.", warnings), value, testCurrentAmps: 0.001, ...(settings.mode === "continuity" ? { continuity: value <= threshold } : {}) });
  if (red === black) return finish(0);
  const resistors: Resistor[] = [], unsupported: { name: string; nets: string[] }[] = [], graph = new Map<string, Set<string>>();
  for (const component of circuit.components) {
    const definition = defs.get(component.definitionId); if (!definition) throw new Error(`${component.id}: 소자 정의가 없습니다.`);
    if (["capacitor", "electrolytic"].includes(definition.kind)) continue;
    if (definition.kind !== "resistor") { unsupported.push({ name: component.id, nets: Object.values(component.pinNets) }); continue; }
    if (definition.pins.length !== 2 || !definition.pins.some(pin => pin.id === "1") || !definition.pins.some(pin => pin.id === "2")) throw new Error(`${component.id}: 검증할 수 없는 저항 단자 정의입니다.`);
    const a = name(component.pinNets[1], `${component.id}.1`), b = name(component.pinNets[2], `${component.id}.2`);
    const value = parseSimulationValue(component.value, "resistor"); resistors.push({ a, b, value });
    if (!graph.has(a)) graph.set(a, new Set()); if (!graph.has(b)) graph.set(b, new Set()); graph.get(a)!.add(b); graph.get(b)!.add(a);
  }
  const reachable = (start: string) => { const seen = new Set([start]), pending = [start]; while (pending.length) for (const next of graph.get(pending.pop()!) ?? []) if (!seen.has(next)) { seen.add(next); pending.push(next); } return seen; };
  const connected = reachable(red), touched = new Set([...connected, ...reachable(black)]);
  const active = unsupported.find(part => part.nets.some(net => touched.has(net)));
  if (active) return answer(settings, "unsupported", `${active.name}: 시험망에 저항·커패시터 외 소자가 연결되어 있습니다. 독립된 수동 저항망으로 분리해야 하며 임의 저항값을 표시하지 않습니다.`, warnings);
  if (!connected.has(black)) return { ...answer(settings, "open", "두 프로브 사이에 DC 저항 경로가 없습니다. 커패시터는 개방으로 취급합니다.", warnings), ...(settings.mode === "continuity" ? { continuity: false } : {}) };
  const nodes = [...connected].filter(net => net !== black), index = new Map(nodes.map((net, i) => [net, i]));
  if (nodes.length > 160) throw new Error("저항 시험망의 노드 수 한도를 넘었습니다.");
  const matrix = nodes.map(() => new Float64Array(nodes.length)), rhs = new Float64Array(nodes.length), current = 0.001;
  rhs[index.get(red)!] = current;
  for (const resistor of resistors) {
    if (!connected.has(resistor.a) || !connected.has(resistor.b) || resistor.a === resistor.b) continue;
    const a = index.get(resistor.a), b = index.get(resistor.b), conductance = 1 / resistor.value;
    if (a !== undefined) matrix[a][a] += conductance; if (b !== undefined) matrix[b][b] += conductance;
    if (a !== undefined && b !== undefined) { matrix[a][b] -= conductance; matrix[b][a] -= conductance; }
  }
  for (let row = 0; row < nodes.length; row++) {
    const scale = Math.max(...matrix[row]); if (!(scale > 0)) throw new Error("저항 시험망을 풀 수 없습니다.");
    for (let column = 0; column < nodes.length; column++) matrix[row][column] /= scale; rhs[row] /= scale;
  }
  for (let column = 0; column < nodes.length; column++) {
    let pivot = column;
    for (let row = column + 1; row < nodes.length; row++) if (Math.abs(matrix[row][column]) > Math.abs(matrix[pivot][column])) pivot = row;
    if (Math.abs(matrix[pivot][column]) < 1e-13) throw new Error("저항비가 너무 크거나 수치적으로 특이하여 정확한 등가 저항을 계산할 수 없습니다.");
    [matrix[column], matrix[pivot]] = [matrix[pivot], matrix[column]]; [rhs[column], rhs[pivot]] = [rhs[pivot], rhs[column]];
    for (let row = column + 1; row < nodes.length; row++) {
      const multiplier = matrix[row][column] / matrix[column][column];
      for (let j = column; j < nodes.length; j++) matrix[row][j] -= multiplier * matrix[column][j]; rhs[row] -= multiplier * rhs[column];
    }
  }
  const solution = new Float64Array(nodes.length);
  for (let row = nodes.length - 1; row >= 0; row--) { let value = rhs[row]; for (let column = row + 1; column < nodes.length; column++) value -= matrix[row][column] * solution[column]; solution[row] = value / matrix[row][row]; }
  const equivalent = solution[index.get(red)!] / current;
  if (!Number.isFinite(equivalent) || equivalent < 0) throw new Error("등가 저항의 수치 해가 유효하지 않습니다.");
  return finish(equivalent);
}

function diodeTest(input: MultimeterInput, settings: MultimeterSettings): MultimeterReading {
  const red = settings.redNetId!, black = settings.blackNetId!, warnings = ["무전원 시험 해석에서 분리된 1N4148에 이상적인 1 mA 시험 전류를 가정합니다. 제조사 실측값·실제 멀티미터 compliance·항복 모델이 아닙니다."];
  if (red === black) return answer(settings, "invalid", "다이오드 양단의 서로 다른 노드에 프로브를 연결하세요.", warnings);
  const attached = input.circuit.components.filter(component => Object.values(component.pinNets).some(net => net === red || net === black));
  if (!attached.length) return answer(settings, "open", "연결된 다이오드가 없습니다.", warnings);
  if (attached.length !== 1) return answer(settings, "unsupported", "다이오드 시험은 다른 소자와 분리된 1N4148 하나만 지원합니다.", warnings);
  const component = attached[0], definition = input.definitions.find(definition => definition.id === component.definitionId);
  const model = definition && getNonlinearModel(definition);
  if (!definition || !model || model.definitionId !== "diode-1n4148-vishay-do35" || model.parameters.family !== "shockley") return answer(settings, "unsupported", "핀맵이 검증된 1N4148 Shockley 교육 모델만 다이오드 시험을 지원합니다.", warnings);
  const anode = component.pinNets[model.rolePinIds[0]], cathode = component.pinNets[model.rolePinIds[1]];
  if (!anode || !cathode || anode === cathode || !((red === anode && black === cathode) || (red === cathode && black === anode))) return answer(settings, "open", "프로브를 다이오드의 두 단자에 연결하세요.", warnings);
  if (red === cathode) return answer(settings, "open", "역방향입니다. 1 mA 정전류 해가 없으며 항복은 모델링하지 않습니다.", warnings);
  const current = 0.001, voltage = model.parameters.emissionCoefficient * NONLINEAR_THERMAL_VOLTAGE * Math.log1p(current / model.parameters.saturationCurrent);
  const device = buildNonlinearDevices({ ...input.circuit, components: [component] }, input.definitions).devices[0];
  device.validateFinal([voltage, 0]);
  return { ...answer(settings, "ok", "1 mA 정전류 시험의 순방향 전압입니다.", warnings), value: voltage, testCurrentAmps: current };
}

/** No circuit mutation or implicit rewiring. Malformed/inapplicable measurements return an explicit unavailable reading. */
export function measureMultimeter(input: MultimeterInput): MultimeterReading {
  let settings: MultimeterSettings;
  try { settings = parseMultimeterSettings(input.settings); }
  catch (error) {
    const mode = MODES.includes(input.settings?.mode) ? input.settings.mode : "dc-voltage";
    return answer({ mode, power: "on" }, "invalid", error instanceof Error ? error.message : "잘못된 멀티미터 설정입니다.");
  }
  try {
    if (!input.circuit || !Array.isArray(input.circuit.components) || input.circuit.components.length > 80 || !Array.isArray(input.definitions)) throw new Error("측정할 회로·소자 정의가 필요하며 소자는 최대 80개입니다.");
    if (!OFF_MODES.has(settings.mode)) return powered(input, settings);
    if (settings.power !== "off") return answer(settings, "invalid", "저항·도통·다이오드 측정은 무전원 시험 해석에서만 실행합니다.");
    return settings.mode === "diode" ? diodeTest(input, settings) : passiveResistance(input, settings);
  } catch (error) { return answer(settings, "invalid", error instanceof Error ? error.message : "측정 결과를 계산할 수 없습니다."); }
}
