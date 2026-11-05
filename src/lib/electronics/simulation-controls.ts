import { parseSimulationConfig } from "./simulation";
import { assertSafeData } from "./schema";
import type { Circuit } from "./types";
import type { SimulationConfig, SimulationWaveform } from "./simulation-types";

export type SimulationResultTab = "time" | "spectrum" | "ac" | "dc" | "meter";
export type SimulationAssistantAction = {
  kind: "auto_setup" | "configure" | "run" | "stop" | "undo";
  settings?: { sourceNetId?: string; groundNetId?: string; outputNetId?: string; frequencyHz?: number; amplitudePeak?: number; offset?: number; phaseDegrees?: number; modulationFrequencyHz?: number; modulationDepth?: number; dutyCyclePercent?: number; waveform?: SimulationWaveform; durationSeconds?: number; sampleCount?: number };
  run?: boolean;
  resultTab?: SimulationResultTab;
};
export type SimulationContext = { config: SimulationConfig; probeNetIds: [string | null, string | null]; status: "idle" | "running" | "complete" | "error"; message?: string };
export class SimulationControlError extends Error { constructor(message: string) { super(message); this.name = "SimulationControlError"; } }
const fail = (message: string): never => { throw new SimulationControlError(message); };
const own = (object: object, key: string) => Object.prototype.hasOwnProperty.call(object, key);
function object(value: unknown, fields: string[]): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail("파형 조작 데이터는 객체여야 합니다.");
  const result = value as Record<string, unknown>;
  if (Object.keys(result).some(key => !fields.includes(key))) fail("파형 조작 데이터에 허용하지 않는 항목이 있습니다.");
  return result;
}
export function circuitSimulationNets(circuit: Circuit): string[] {
  return [...new Set([...circuit.components.flatMap(part => Object.values(part.pinNets)), ...circuit.instruments.map(port => port.netId)])];
}
function knownNet(value: unknown, circuit: Circuit): string {
  if (typeof value !== "string" || !circuitSimulationNets(circuit).includes(value)) fail("파형 조작에 지정된 연결이 현재 회로에 없습니다.");
  return value as string;
}

/** JSON boundary shared by chat and UI. No coercion and no executable text. */
export function parseSimulationAction(value: unknown, circuit: Circuit): SimulationAssistantAction {
  try { assertSafeData(value); } catch { fail("파형 조작 데이터 구조가 올바르지 않습니다."); }
  const raw = object(value, ["kind", "settings", "run", "resultTab"]);
  if (!["auto_setup", "configure", "run", "stop", "undo"].includes(raw.kind as string)) fail("지원하지 않는 파형 조작입니다.");
  const kind = raw.kind as SimulationAssistantAction["kind"];
  const configurable = kind === "auto_setup" || kind === "configure";
  if (!configurable && (own(raw, "settings") || own(raw, "run"))) fail("이 파형 조작에는 설정값을 함께 지정할 수 없습니다.");
  if ((kind === "stop" || kind === "undo") && own(raw, "resultTab")) fail("중단·되돌리기 조작에는 결과 탭을 지정할 수 없습니다.");
  const result: SimulationAssistantAction = { kind };
  if (own(raw, "run")) { if (typeof raw.run !== "boolean") fail("계산 실행 여부는 참 또는 거짓이어야 합니다."); result.run = raw.run as boolean; }
  if (own(raw, "resultTab")) {
    if (!["time", "spectrum", "ac", "dc", "meter"].includes(raw.resultTab as string)) fail("지원하지 않는 파형 결과 탭입니다.");
    result.resultTab = raw.resultTab as SimulationResultTab;
  }
  if (own(raw, "settings")) {
    const settings = object(raw.settings, ["sourceNetId", "groundNetId", "outputNetId", "frequencyHz", "amplitudePeak", "offset", "phaseDegrees", "modulationFrequencyHz", "modulationDepth", "dutyCyclePercent", "waveform", "durationSeconds", "sampleCount"]);
    if (!Object.keys(settings).length) fail("변경할 파형 설정을 하나 이상 지정하세요.");
    const output: NonNullable<SimulationAssistantAction["settings"]> = {};
    for (const key of ["sourceNetId", "groundNetId", "outputNetId"] as const) if (own(settings, key)) output[key] = knownNet(settings[key], circuit);
    for (const [key, min, max, integer] of [["frequencyHz", 0.001, 1e7, false], ["amplitudePeak", 0, 1e4, false], ["offset", -1e4, 1e4, false], ["phaseDegrees", -360, 360, false], ["modulationFrequencyHz", 0.001, 1e7, false], ["modulationDepth", 0, 1, false], ["dutyCyclePercent", 1, 99, false], ["durationSeconds", 1e-9, 60, false], ["sampleCount", 32, 4096, true]] as const) {
      if (!own(settings, key)) continue;
      const number = settings[key];
      if (typeof number !== "number" || !Number.isFinite(number) || number < min || number > max || (integer && !Number.isInteger(number))) fail("파형 설정의 숫자 범위 또는 정수 형식이 올바르지 않습니다.");
      output[key] = number as number;
    }
    if (own(settings, "waveform")) {
      if (!["sine", "square", "triangle", "dc", "pulse", "sawtooth", "am", "dsb"].includes(settings.waveform as string)) fail("지원하지 않는 발생기 파형입니다.");
      output.waveform = settings.waveform as SimulationWaveform;
    }
    if (output.sourceNetId && output.sourceNetId === output.groundNetId) fail("입력 연결과 기준 접지는 서로 달라야 합니다.");
    result.settings = output;
  } else if (kind === "configure") fail("설정 변경 조작에 변경할 설정이 없습니다.");
  return result;
}

export function parseSimulationContext(value: unknown, circuit: Circuit): SimulationContext {
  try { assertSafeData(value); } catch { fail("현재 파형 상태의 데이터 구조가 올바르지 않습니다."); }
  const raw = object(value, ["config", "probeNetIds", "status", "message"]);
  let config: SimulationConfig;
  try { config = parseSimulationConfig(raw.config); } catch { return fail("현재 파형 설정의 형식이 올바르지 않습니다."); }
  for (const net of [config.groundNetId, config.source.netId, ...(config.extraSources ?? []).map(source => source.netId), ...config.supplies.map(supply => supply.netId)]) knownNet(net, circuit);
  if (!Array.isArray(raw.probeNetIds) || raw.probeNetIds.length !== 2) fail("현재 프로브 연결은 두 채널이어야 합니다.");
  const probeNetIds = (raw.probeNetIds as unknown[]).map(net => net === null ? null : knownNet(net, circuit)) as SimulationContext["probeNetIds"];
  if (!["idle", "running", "complete", "error"].includes(raw.status as string)) fail("현재 파형 계산 상태가 올바르지 않습니다.");
  if (own(raw, "message") && (typeof raw.message !== "string" || raw.message.length > 800)) fail("현재 파형 상태 설명의 형식이 올바르지 않습니다.");
  return { config, probeNetIds, status: raw.status as SimulationContext["status"], ...(raw.message !== undefined ? { message: raw.message as string } : {}) };
}

/** A patch never removes unrelated supplies or extra sources to hide a conflict. */
export function applySimulationSettings(config: SimulationConfig, settings: SimulationAssistantAction["settings"]): SimulationConfig {
  const patch = settings ?? {};
  const source = { ...config.source, ...(patch.sourceNetId !== undefined ? { netId: patch.sourceNetId } : {}) };
  for (const key of ["frequencyHz", "amplitudePeak", "offset", "phaseDegrees", "modulationFrequencyHz", "modulationDepth", "dutyCyclePercent", "waveform"] as const) if (patch[key] !== undefined) Object.assign(source, { [key]: patch[key] });
  return parseSimulationConfig({ ...config, source,
    ...(patch.groundNetId !== undefined ? { groundNetId: patch.groundNetId } : {}),
    ...(patch.durationSeconds !== undefined ? { durationSeconds: patch.durationSeconds } : {}),
    ...(patch.sampleCount !== undefined ? { sampleCount: patch.sampleCount } : {}),
  });
}
