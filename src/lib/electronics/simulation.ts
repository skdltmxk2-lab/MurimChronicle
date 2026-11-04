import type { Circuit, ComponentDefinition } from "./types";
import type { SimulationConfig, SimulationResult, SimulationWaveform } from "./simulation-types";
import { getPowerNetRole } from "./power";

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
function object(value: unknown, keys: string[], label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label}: 객체 형식이 필요합니다.`);
  const item = value as Record<string, unknown>;
  if (Object.keys(item).some(key => !keys.includes(key)) || keys.some(key => !Object.prototype.hasOwnProperty.call(item, key))) fail(`${label}: 필수 항목이 없거나 알 수 없는 항목이 있습니다.`);
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
  const item = object(value, ["groundNetId", "source", "supplies", "durationSeconds", "sampleCount", "acStartHz", "acStopHz", "acPoints"], "시뮬레이션 설정");
  const source = object(item.source, ["netId", "waveform", "frequencyHz", "amplitudePeak", "offset"], "입력 신호");
  if (!["sine", "square", "triangle", "dc"].includes(source.waveform as string)) fail("지원하지 않는 입력 파형입니다.");
  if (!Array.isArray(item.supplies) || item.supplies.length > 8) fail("독립 DC 전원은 최대 8개입니다.");
  const config: SimulationConfig = {
    groundNetId: netName(item.groundNetId, "기준 접지"),
    source: { netId: netName(source.netId, "입력 노드"), waveform: source.waveform as SimulationWaveform,
      frequencyHz: finite(source.frequencyHz, 0.001, 1e7, "입력 주파수"), amplitudePeak: finite(source.amplitudePeak, 0, 1e4, "입력 피크 진폭"), offset: finite(source.offset, -1e4, 1e4, "입력 DC 오프셋") },
    supplies: item.supplies.map((value, index) => { const supply = object(value, ["netId", "voltage"], `DC 전원 ${index + 1}`); return { netId: netName(supply.netId, "전원 노드"), voltage: finite(supply.voltage, -1e4, 1e4, "전원 전압") }; }),
    durationSeconds: finite(item.durationSeconds, 1e-9, 60, "시간 범위"), sampleCount: finite(item.sampleCount, 32, 4096, "출력 표본 수", true),
    acStartHz: finite(item.acStartHz, 0.001, 1e9, "AC 시작 주파수"), acStopHz: finite(item.acStopHz, 0.001, 1e9, "AC 끝 주파수"), acPoints: finite(item.acPoints, 2, 512, "AC 주파수 점 수", true),
  };
  if (config.acStopHz < config.acStartHz) fail("AC 끝 주파수는 시작 주파수 이상이어야 합니다.");
  const driven = [config.source.netId, ...config.supplies.map(supply => supply.netId)];
  if (driven.includes(config.groundNetId)) fail("기준 접지 노드에 입력 신호나 독립 전원을 연결할 수 없습니다.");
  if (new Set(driven).size !== driven.length) fail("하나의 노드에 입력 신호와 DC 전원을 중복 지정할 수 없습니다.");
  if (Math.abs(config.source.offset) + config.source.amplitudePeak > 1e4) fail("입력 오프셋과 진폭의 합이 계산 전압 범위(10 kV)를 넘습니다.");
  return config;
}

/** Deliberately accepts only explicit SI values, never a digit prefix of a label. */
export function parseSimulationValue(value: string, kind: "resistor" | "capacitor"): number {
  if (typeof value !== "string" || value.length > 80) fail("소자 값은 명시적인 SI 수치여야 합니다.");
  const text = value.trim().replace(/[μµ]/g, "u").replace(/Ω/g, "Ω");
  const match = /^([+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)\s*(meg|[fpnumkKMG]?)\s*(Ω|[oO][hH][mM][sS]?|F)?$/.exec(text);
  if (!match || (match[3] && (kind === "resistor" ? match[3] === "F" : match[3] !== "F"))) fail(`${value}: ${kind === "resistor" ? "10 kΩ" : "100 nF"}처럼 단위가 맞는 소자 값을 입력하세요.`);
  const factors: Record<string, number> = { "": 1, f: 1e-15, p: 1e-12, n: 1e-9, u: 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, meg: 1e6, G: 1e9 };
  const result = Number(match[1]) * factors[match[2]];
  return finite(result, kind === "resistor" ? 1e-3 : 1e-15, kind === "resistor" ? 1e12 : 1, `${value}의 SI 값`);
}

export function defaultSimulationConfig(circuit: Circuit): SimulationConfig {
  const nets = [...new Set(circuit.components.flatMap(component => Object.values(component.pinNets)))];
  const groundNetId = nets.find(net => getPowerNetRole(circuit, net) === "ground") ?? "GND";
  const generator = circuit.instruments.find(connection => connection.id === "fg-signal" && nets.includes(connection.netId) && !getPowerNetRole(circuit, connection.netId));
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
  return { groundNetId, source: { netId: sourceNet, waveform: signal ? "sine" : "dc", frequencyHz, amplitudePeak, offset: signal ? 0 : voltage(sourceNet) },
    supplies: nets.filter(net => net !== groundNetId && net !== sourceNet && ["positive", "negative"].includes(getPowerNetRole(circuit, net) ?? "")).map(net => ({ netId: net, voltage: voltage(net) })).slice(0, 8),
    durationSeconds: Math.min(60, 5 / frequencyHz), sampleCount: 1024, acStartHz: 10, acStopHz: 100000, acPoints: 96 };
}

type Passive = { id: string; kind: "resistor" | "capacitor"; a: string; b: string; value: number; polarized: boolean };
type Opamp = { id: string; minus: string; plus: string; out: string; low: string; high: string };
type Drive = { net: string; voltage: number };

function prepare(circuit: Circuit, definitions: ComponentDefinition[], config: SimulationConfig) {
  if (!Array.isArray(circuit.components) || !circuit.components.length || circuit.components.length > 80) fail("수치 시뮬레이션은 1~80개 소자를 지원합니다.");
  const defs = new Map(definitions.map(definition => [definition.id, definition]));
  const passives: Passive[] = [], opamps: Opamp[] = [], nets = new Set<string>(), ids = new Set<string>();
  const uses = new Map<string, number>();
  for (const component of circuit.components) for (const net of Object.values(component.pinNets)) uses.set(net, (uses.get(net) ?? 0) + 1);
  const drives: Drive[] = [{ net: config.source.netId, voltage: config.source.offset }, ...config.supplies.map(supply => ({ net: supply.netId, voltage: supply.voltage }))];
  const fixed = new Map([[config.groundNetId, 0], ...drives.map(drive => [drive.net, drive.voltage] as [string, number])]);
  for (const component of circuit.components) {
    if (ids.has(component.id)) fail(`${component.id}: 소자 식별자가 중복되었습니다.`); ids.add(component.id);
    const definition = defs.get(component.definitionId);
    if (!definition) fail(`${component.id}: 소자 정의를 찾을 수 없습니다.`);
    if (definition.mounting !== "direct") fail(`${component.id}: 어댑터·외부 소자는 현재 수치 모델에 없습니다.`);
    const pin = (id: string) => { const net = netName(component.pinNets[id], `${component.id}.${id}`); nets.add(net); return net; };
    if (Object.keys(component.pinNets).some(id => !definition.pins.some(pin => pin.id === id))) fail(`${component.id}: 정의에 없는 핀 연결입니다.`);
    if (["resistor", "capacitor", "electrolytic"].includes(definition.kind)) {
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
      if (!fixed.has(op.low) || !fixed.has(op.high) || op.low === config.source.netId || op.high === config.source.netId || fixed.get(op.high)! <= fixed.get(op.low)!) fail(`${component.id}: V+·V− 핀에 서로 구분된 DC 전원(또는 0 V 기준)을 지정하세요.`);
      opamps.push(op);
    } else fail(`${component.id}: ${definition.name}(${definition.kind})의 수치 모델은 아직 지원하지 않습니다. 지원하지 않는 회로의 파형을 생성하지 않습니다.`);
  }
  if (!nets.has(config.groundNetId)) fail("선택한 기준 접지가 모델의 실제 소자 핀에 연결되어 있지 않습니다.");
  for (const drive of drives) if (!nets.has(drive.net)) fail(`${drive.net}: 입력·전원 노드가 모델의 실제 소자 핀에 없습니다.`);
  if (nets.size > 128) fail("수치 모델의 연결 노드는 최대 128개입니다. 회로를 나누세요.");
  const adjacency = new Map<string, Set<string>>();
  for (const part of passives) { if (!adjacency.has(part.a)) adjacency.set(part.a, new Set()); if (!adjacency.has(part.b)) adjacency.set(part.b, new Set()); adjacency.get(part.a)!.add(part.b); adjacency.get(part.b)!.add(part.a); }
  const feedbackPath = (start: string, target: string) => {
    if (start === target) return true;
    const seen = new Set([start]), pending = [start];
    while (pending.length) for (const next of adjacency.get(pending.pop()!) ?? []) {
      if (fixed.has(next) || seen.has(next)) continue;
      if (next === target) return true;
      seen.add(next); pending.push(next);
    }
    return false;
  };
  for (const op of opamps) {
    if (fixed.has(op.out) || !feedbackPath(op.out, op.minus)) fail(`${op.id}: 출력에서 반전 입력으로 가는 음의 피드백 경로가 필요합니다. 개방루프·비교기 회로는 지원하지 않습니다.`);
    if (feedbackPath(op.out, op.plus)) fail(`${op.id}: 양의 피드백·발진기·Schmitt 회로는 이상적 선형 모델로 시뮬레이션하지 않습니다.`);
  }
  // Local negative feedback does not prove that a loop through several amplifiers
  // is stable. Support feed-forward cascades; conservatively reject any inter-amp
  // cycle instead of returning an unstable equilibrium as an operating waveform.
  const dependencies = new Map(opamps.map(op => [op.id, opamps.filter(other => other !== op && (feedbackPath(op.out, other.plus) || feedbackPath(op.out, other.minus))).map(other => other.id)]));
  const visiting = new Set<string>(), visited = new Set<string>();
  const visit = (id: string) => {
    if (visiting.has(id)) fail("여러 연산증폭기를 거치는 순환 피드백은 현재 선형 모델의 지원 범위 밖입니다. 개별 음의 피드백 증폭기와 순방향 연결만 지원합니다.");
    if (visited.has(id)) return;
    visiting.add(id);
    for (const next of dependencies.get(id) ?? []) visit(next);
    visiting.delete(id); visited.add(id);
  };
  for (const op of opamps) visit(op.id);
  const names = [...nets].filter(net => net !== config.groundNetId), index = new Map(names.map((net, i) => [net, i]));
  const size = names.length + drives.length + opamps.length;
  if (size > 128) fail("MNA 연립방정식은 최대 128개 미지수를 지원합니다. 회로를 나누세요.");
  return { passives, opamps, drives, names, index, size };
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

function wave(config: SimulationConfig, time: number): number {
  const source = config.source;
  if (source.waveform === "dc") return source.offset;
  const cycle = (time * source.frequencyHz) % 1;
  const normalized = source.waveform === "sine" ? Math.sin(TAU * cycle) : source.waveform === "square" ? (cycle < 0.5 ? 1 : -1) : 2 / Math.PI * Math.asin(Math.sin(TAU * cycle));
  return source.offset + source.amplitudePeak * normalized;
}

/** Pure numerical analysis. Physical breadboard/probe validation belongs to the caller. */
export function runSimulation(circuit: Circuit, definitions: ComponentDefinition[], input: SimulationConfig): SimulationResult {
  const config = parseSimulationConfig(input), model = prepare(circuit, definitions, config);
  const { passives, opamps, drives, names, index, size } = model;
  const outputStep = config.durationSeconds / (config.sampleCount - 1);
  const dynamic = config.source.waveform !== "dc" && config.source.amplitudePeak > 0;
  if (dynamic && outputStep * config.source.frequencyHz > 1 / 32) fail("파형 표본이 부족합니다. 입력 한 주기당 최소 32개 표본이 필요하므로 시간 범위를 줄이거나 표본 수를 늘리세요.");
  let minTau = Infinity;
  for (const cap of passives.filter(part => part.kind === "capacitor")) {
    const conductance = passives.filter(part => part.kind === "resistor" && (part.a === cap.a || part.b === cap.a || part.a === cap.b || part.b === cap.b)).reduce((sum, part) => sum + 1 / part.value, 0);
    if (conductance) minTau = Math.min(minTau, cap.value / conductance);
  }
  const maximumStep = dynamic ? Math.min(1 / config.source.frequencyHz / 128, minTau / 100) : outputStep;
  const subdivisions = Math.max(1, Math.ceil(outputStep / maximumStep)), totalSteps = subdivisions * (config.sampleCount - 1);
  if (subdivisions > 128 || totalSteps > 65536) fail("빠른 RC 응답을 계산하기에 시간 범위가 너무 큽니다. 시간 범위를 줄이세요(내부 시간 단계 최대 65,536개).");
  const work = 2 * size ** 3 + 2 * totalSteps * size ** 2 + config.acPoints * 4 * size ** 3 / 3;
  if (work > MAX_WORK) fail("회로 크기와 시간·AC 표본의 조합이 계산량 한도를 넘습니다. 표본 수·AC 점 수·시간 범위를 줄이거나 회로를 나누세요.");
  const step = outputStep / subdivisions;
  const base = matrix(size);
  for (const part of passives) if (part.kind === "resistor") stamp(base, index.get(part.a), index.get(part.b), 1 / part.value);
  drives.forEach((drive, i) => { const row = names.length + i, node = index.get(drive.net)!; base[node][row] = 1; base[row][node] = 1; });
  opamps.forEach((op, i) => {
    const row = names.length + drives.length + i, out = index.get(op.out), plus = index.get(op.plus), minus = index.get(op.minus);
    if (out !== undefined) base[out][row] += 1;
    if (plus !== undefined) base[row][plus] += 1;
    if (minus !== undefined) base[row][minus] -= 1;
  });
  const rhs = new Float64Array(size);
  drives.forEach((drive, i) => { rhs[names.length + i] = drive.voltage; });
  const dcState = factor(base)(rhs).real;
  const valueAt = (state: Float64Array, net: string) => { const i = index.get(net); return i === undefined ? 0 : state[i]; };
  const dc = { nodeVoltages: record<number>(), componentCurrents: record<number>(), sourceCurrents: record<number>() };
  dc.nodeVoltages[config.groundNetId] = 0;
  names.forEach((net, i) => { dc.nodeVoltages[net] = dcState[i]; });
  drives.forEach((drive, i) => { dc.sourceCurrents[drive.net] = dcState[names.length + i]; });
  for (const part of passives) dc.componentCurrents[part.id] = part.kind === "resistor" ? (valueAt(dcState, part.a) - valueAt(dcState, part.b)) / part.value : 0;
  const time = Array.from({ length: config.sampleCount }, (_, i) => i * outputStep);
  const nodeVoltages = record<number[]>();
  for (const net of [config.groundNetId, ...names]) nodeVoltages[net] = [dc.nodeVoltages[net]];
  const transient = base.map(row => row.slice());
  const capacitors = passives.filter(part => part.kind === "capacitor").map(part => ({ ...part, aIndex: index.get(part.a), bIndex: index.get(part.b), conductance: part.value / step }));
  for (const cap of capacitors) stamp(transient, cap.aIndex, cap.bIndex, cap.conductance);
  const transientSolve = factor(transient);
  let state = dcState;
  for (let sample = 1; sample < config.sampleCount; sample++) {
    for (let sub = 1; sub <= subdivisions; sub++) {
      const next = rhs.slice();
      next[names.length] = wave(config, (sample - 1) * outputStep + sub * step);
      for (const cap of capacitors) inject(next, cap.aIndex, cap.bIndex, cap.conductance * (valueAt(state, cap.a) - valueAt(state, cap.b)));
      state = transientSolve(next).real;
    }
    nodeVoltages[config.groundNetId].push(0);
    names.forEach((net, i) => nodeVoltages[net].push(state[i]));
  }
  const frequenciesHz = Array.from({ length: config.acPoints }, (_, i) => config.acStartHz * (config.acStopHz / config.acStartHz) ** (i / (config.acPoints - 1)));
  const nodeGainMagnitude = record<number[]>(), nodePhaseDegrees = record<number[]>();
  for (const net of [config.groundNetId, ...names]) { nodeGainMagnitude[net] = []; nodePhaseDegrees[net] = []; }
  for (const frequency of frequenciesHz) {
    const imaginary = matrix(size);
    for (const cap of capacitors) stamp(imaginary, cap.aIndex, cap.bIndex, TAU * frequency * cap.value);
    const excitation = new Float64Array(size); excitation[names.length] = 1;
    const solution = factor(base, imaginary)(excitation);
    nodeGainMagnitude[config.groundNetId].push(0); nodePhaseDegrees[config.groundNetId].push(0);
    names.forEach((net, i) => { const real = solution.real[i], imag = solution.imaginary![i]; nodeGainMagnitude[net].push(Math.hypot(real, imag)); nodePhaseDegrees[net].push(real === 0 && imag === 0 ? 0 : Math.atan2(imag, real) * 180 / Math.PI); });
  }
  const warnings = [LIMIT_WARNING, "시간 응답은 입력 DC 오프셋의 정상상태에서 시작하며 backward Euler 내부 시간 적분을 사용합니다. AC 결과는 단위 소신호 입력에 대한 비율입니다."];
  if (config.source.waveform === "dc" && config.source.amplitudePeak) warnings.push("DC 파형에서는 피크 진폭을 사용하지 않고 오프셋 전압만 인가합니다.");
  if (opamps.length) warnings.push(OPAMP_WARNING);
  for (const op of opamps) {
    const low = dc.nodeVoltages[op.low], high = dc.nodeVoltages[op.high];
    if (nodeVoltages[op.out].some(value => value < low || value > high)) warnings.push(`${op.id}: 계산된 출력이 전원 레일(${low}~${high} V)을 벗어납니다. 실제 UA741은 이 파형을 낼 수 없으며 현재 모델은 포화를 반영하지 않습니다.`);
    if (nodeVoltages[op.plus].some(value => value < low || value > high) || nodeVoltages[op.minus].some(value => value < low || value > high)) warnings.push(`${op.id}: 계산된 입력 전압이 전원 레일 밖입니다. 실제 입력 공통모드 범위·정격을 검증하지 않은 결과입니다.`);
  }
  for (const part of passives) if (part.polarized && nodeVoltages[part.a].some((value, i) => value - nodeVoltages[part.b][i] < -1e-9)) warnings.push(`${part.id}: 전해 커패시터 1번(+)에서 2번(−)으로의 전압이 음수입니다. 역극성 위험을 확인하세요. 모델은 극성 손상을 계산하지 않습니다.`);
  return { model: "linear-ideal", transientMethod: "backward-euler", time, nodeVoltages, dc, ac: { frequenciesHz, nodeGainMagnitude, nodePhaseDegrees }, warnings };
}
