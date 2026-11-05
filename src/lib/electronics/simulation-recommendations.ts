import { defaultSimulationConfig, fitSimulationTimeRange, parseSimulationConfig } from "./simulation";
import { sourceSamplingLimits, SOURCE_DEFAULTS } from "./simulation-source";
import { getPowerNetRole } from "./power";
import { circuitSimulationNets } from "./simulation-controls";
import { createSimulationLayoutIndex } from "./simulation-layout";
import type { ProbeHoles } from "./simulation-probes";
import type { Circuit, CircuitLayout, ComponentDefinition } from "./types";
import type { SimulationConfig } from "./simulation-types";

export type SimulationRecommendation = { sourceNetId: string | null; groundNetId: string | null; inputNetId: string | null; outputNetId: string | null; config: SimulationConfig | null; reasons: string[]; assumptions: string[]; confidence: "high" | "medium" | "low"; captureNote?: string };

/** Fit the capture to the configured signals without changing any source or probe. */
export function fitSimulationSampling(input: SimulationConfig, circuit?: Circuit, definitions?: ComponentDefinition[]): { durationSeconds: number; sampleCount: number; note: string; limited: boolean } {
  // A blank duration/sample field can be repaired, but other invalid settings
  // must still be corrected by the user before choosing a sampling interval.
  const config = parseSimulationConfig({ ...input, durationSeconds: 0.005, sampleCount: 1024 });
  const sources = [config.source, ...config.extraSources ?? []].filter(source => source.waveform !== "dc" && source.amplitudePeak > 0);
  let durationSeconds = Number.isFinite(input.durationSeconds) && input.durationSeconds >= 1e-9 && input.durationSeconds <= 60 ? input.durationSeconds : 0.005;
  let sampleCount = Number.isInteger(input.sampleCount) && input.sampleCount >= 32 && input.sampleCount <= 4096 ? input.sampleCount : 1024;
  let note = "DC 입력의 시간 범위를 유지했습니다. 자율 발진·과도 응답의 관측 시간은 회로에 맞게 조정하세요.";
  let limited = false;
  const frequencies = sources.flatMap(source => source.waveform === "am" && (source.modulationDepth ?? SOURCE_DEFAULTS.modulationDepth) > 0
    ? [source.frequencyHz, source.modulationFrequencyHz ?? SOURCE_DEFAULTS.modulationFrequencyHz]
    : [source.frequencyHz]);
  if (sources.length) {
    const desiredDuration = 5 / Math.min(...frequencies);
    const step = Math.min(...sources.map(source => sourceSamplingLimits(source).maximumOutputStepSeconds)) / 2;
    durationSeconds = Math.min(60, desiredDuration, step * 4095);
    sampleCount = Math.min(4096, Math.max(1024, Math.ceil(durationSeconds / step) + 1));
    limited = durationSeconds < desiredDuration * (1 - 1e-12);
    note = "가장 느린 입력·AM 포락선의 5주기를 표시하도록 시간 범위와 샘플 수를 맞췄습니다.";
    if (limited) note = durationSeconds === 60
      ? "관측 시간 상한인 60초로 맞췄습니다. 가장 느린 입력은 5주기보다 짧게 표시됩니다."
      : "빠른 신호와 짧은 펄스를 구분하도록 시간 범위를 줄였습니다. 느린 신호·AM 포락선은 5주기보다 짧게 표시됩니다.";
  }
  if (circuit && definitions) {
    const fitted = fitSimulationTimeRange(circuit, definitions, { ...config, durationSeconds, sampleCount });
    durationSeconds = fitted.durationSeconds; sampleCount = fitted.sampleCount;
    if (fitted.limited) {
      limited = true;
      const cycles = sources.length ? ` 가장 느린 입력·AM 포락선의 ${Number((durationSeconds * Math.min(...frequencies)).toPrecision(3))}주기만 표시됩니다.` : " 발진·과도 응답의 일부 구간만 관측합니다.";
      note = `회로의 빠른 RC·연산증폭기 응답과 계산량 한도에 맞춰 관측 시간을 ${Number((durationSeconds * 1000).toPrecision(4))} ms로 줄였습니다.${cycles}`;
    }
  }
  return { durationSeconds, sampleCount, note, limited };
}
const groundText = /(?:\b(?:gnd|ground|agnd|dgnd|com)\b|접지|공통\s*기준|그라운드|^\s*0\s*v\s*$)/i;
const negativePort = /(?:ground|gnd|com|기준|접지|ch\s*\d+\s*[-−]|^\s*[-−]\s*$)/i;
const generatorText = /(?:function\s*gen|signal\s*gen|\bfgen\b|\bfg\b|\bawg\b|함수\s*발생|신호\s*발생|입력원|발생기|vsrc)/i;
const scopeText = /(?:oscillo|\bscope\b|오실로|스코프)/i;
const supplyText = /(?:power\s*supply|dc\s*supply|전원|\bvcc\b|\bvdd\b|\bvee\b)/i;
const inputText = /(?:\b(?:v?in(?:put)?|rf|vsrc|src|signal)(?:\d+)?\b|입력|발생기)/i;
const outputText = /(?:\b(?:v?out(?:put)?\d*|drain|collector)\b|출력|컬렉터|드레인)/i;
type Candidate = { net: string; score: number; reason: string };
function best(candidates: Candidate[], exclude: (string | null)[] = []): Candidate | undefined {
  return candidates.filter(item => !exclude.includes(item.net)).sort((a, b) => b.score - a.score || a.net.localeCompare(b.net))[0];
}
const voltageIn = (text: string): number | undefined => {
  const match = /^\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\s*V(?:\s*DC)?\s*$/i.exec(text.replace(/−/g, "-"));
  return match ? Number(match[1]) : undefined;
};

/** Suggestions use labels, instrument roles and terminal topology, never template IDs alone. */
export function deriveSimulationRecommendation(circuit: Circuit, definitions: ComponentDefinition[]): SimulationRecommendation {
  const nets = circuitSimulationNets(circuit), candidates = { ground: [] as Candidate[], source: [] as Candidate[], input: [] as Candidate[], output: [] as Candidate[] };
  const label = (net: string) => `${net.replace(/_/g, " ")} ${circuit.netNames[net] ?? ""}`;
  const add = (kind: keyof typeof candidates, net: string, score: number, reason: string) => { if (nets.includes(net)) candidates[kind].push({ net, score, reason }); };
  const supplies = new Map<string, number>();
  const assumptions: string[] = [], reasons: string[] = [];
  const uses = new Map<string, number>();
  for (const part of circuit.components) for (const net of Object.values(part.pinNets)) uses.set(net, (uses.get(net) ?? 0) + 1);
  for (const net of nets) {
    const role = getPowerNetRole(circuit, net);
    if (role === "ground" || groundText.test(label(net))) add("ground", net, 90, "GND·0 V·접지 표기");
    if (role === "positive" || role === "negative") {
      const voltage = voltageIn(circuit.netNames[net] ?? "") ?? voltageIn(net);
      supplies.set(net, voltage ?? (role === "negative" ? -9 : 9));
      if (voltage === undefined) assumptions.push(`${net}: 전원 전압이 명시되지 않아 ${role === "negative" ? "−9" : "9"} V를 시작값으로 제안합니다.`);
    }
    if (inputText.test(label(net))) add("source", net, /(?:src|rf|발생기)/i.test(label(net)) ? 85 : 65, "입력·RF·신호원 이름");
    if (outputText.test(label(net))) add("output", net, /(?:out\s*1\b|out1\b)/i.test(label(net)) ? 85 : 80, "출력·컬렉터·드레인 이름");
  }
  for (const port of circuit.instruments) {
    const name = `${port.instrument} ${port.id.replace(/[_-]/g, " ")}`, description = `${port.port} ${label(port.netId)}`;
    if (negativePort.test(port.port) && groundText.test(`${port.port} ${port.setting ?? ""}`)) add("ground", port.netId, 110, "계측기의 공통 기준·GND 단자");
    if (generatorText.test(name) && !negativePort.test(port.port) && !groundText.test(label(port.netId))) {
      // A mixer's LO remains an additional drive. Alphabetical net ordering
      // must not replace the RF input with one side of a differential LO.
      const roleText = `${name} ${description}`;
      const score = /\b(?:rf|vsrc|vin)\b|기본\s*입력/i.test(roleText) ? 140 : /\blo\b|국부\s*발진/i.test(roleText) ? 110 : 130;
      add("source", port.netId, score, "신호 발생기의 출력 단자");
    }
    if (scopeText.test(name) && !negativePort.test(port.port)) {
      if (outputText.test(description) || /ch\s*2|채널\s*2/i.test(port.port)) add("output", port.netId, 125, "오실로스코프 출력 측정 단자");
      else if (inputText.test(description) || /ch\s*1|채널\s*1/i.test(port.port)) add("input", port.netId, 115, "오실로스코프 입력 측정 단자");
    }
    if (supplyText.test(name)) {
      const voltage = voltageIn(port.setting ?? "");
      if (voltage !== undefined && voltage !== 0) { supplies.set(port.netId, voltage); }
    }
  }
  const ground = best(candidates.ground);
  const powerNets = [...supplies.keys()];
  const defs = new Map(definitions.map(definition => [definition.id, definition]));
  const activeInputs = new Set<string>();
  for (const part of circuit.components) {
    const definition = defs.get(part.definitionId);
    for (const pin of definition?.pins ?? []) {
      const net = part.pinNets[pin.id], terminal = pin.label.toUpperCase();
      if (["B", "G", "IN+", "IN−", "IN-"].includes(terminal)) activeInputs.add(net);
      if (definition?.kind === "opamp" && terminal === "OUT") add("output", net, 70, "연산증폭기 OUT 핀");
      if ((definition?.kind === "transistor" && /^C(?:\s*\/|$)/.test(terminal)) || (definition?.kind === "mosfet" && terminal === "D")) {
        const loaded = circuit.components.some(other => defs.get(other.definitionId)?.kind === "resistor" && Object.values(other.pinNets).includes(net) && Object.values(other.pinNets).some(otherNet => powerNets.includes(otherNet)));
        if (loaded) add("output", net, 60, "전원 부하 저항에 연결된 C/D 단자");
      }
    }
  }
  for (const part of circuit.components) {
    const kind = defs.get(part.definitionId)?.kind, [a, b] = Object.values(part.pinNets);
    if ((kind === "capacitor" || kind === "electrolytic") && a && b) {
      for (const [end, other] of [[a, b], [b, a]]) if (uses.get(end) === 1 && activeInputs.has(other)) add("source", end, 75, "능동소자 입력으로 들어가는 결합 커패시터의 바깥 단자");
    }
    if (kind === "resistor" && a && b) for (const [end, other] of [[a, b], [b, a]]) {
      if (uses.get(end) === 1 && !powerNets.includes(end)) add("source", end, 30, "수동 입력 저항의 끝단 후보");
      if ((other === ground?.net || powerNets.includes(other)) && (uses.get(end) ?? 0) > 1) add("output", end, 25, "저항 분압·필터의 중간 노드 후보");
    }
  }
  let source = best(candidates.source, [ground?.net ?? null, ...powerNets]);
  const isSignal = Boolean(source);
  if (!source && powerNets.length) source = { net: powerNets[0], score: 45, reason: "독립 입력 후보가 없어 DC 전원 구동을 제안" };
  const input = best(candidates.input, [ground?.net ?? null]) ?? source;
  const output = best(candidates.output, [ground?.net ?? null, ...powerNets, source?.net ?? null]);
  for (const [name, choice] of [["입력원", source], ["VIN", input], ["VOUT", output], ["GND", ground]] as const) if (choice) reasons.push(`${name}: ${choice.net} — ${choice.reason}`);
  if (!ground) assumptions.push("GND를 식별할 근거가 없습니다. 기준 연결을 직접 선택해야 합니다.");
  if (!source) assumptions.push("입력원 연결을 식별하지 못했습니다. 입력 연결을 직접 선택해야 합니다.");
  if (!output) assumptions.push("출력 측정 지점을 확정하지 못했습니다. VOUT을 직접 선택하세요.");
  let config: SimulationConfig | null = null;
  let captureNote: string | undefined;
  if (source && ground && source.net !== ground.net) {
    const base = defaultSimulationConfig(circuit);
    for (const supply of base.supplies) if (!supplies.has(supply.netId) && nets.includes(supply.netId)) supplies.set(supply.netId, supply.voltage);
    const port = circuit.instruments.find(port => port.netId === source!.net && generatorText.test(`${port.instrument} ${port.id.replace(/[_-]/g, " ")}`) && !negativePort.test(port.port));
    const setting = port?.setting ?? "";
    const frequencyMatches = [...setting.matchAll(/(?<![\w.+-])([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\s*(MHz|kHz|Hz)\b/gi)];
    const amplitudeMatches = [...setting.matchAll(/(?<![\w.+-])([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\s*(mV|uV|µV|μV|V)\s*(peak-to-peak|p-p|pp|peak|피크|첨두)(?![a-z-])/gi)];
    const unknown = /미기재|미지정|알\s*수\s*없|확인\s*필요|unknown|unspecified/i.test(setting);
    const frequency = !unknown && frequencyMatches.length === 1 ? Number(frequencyMatches[0][1]) * (/MHz/i.test(frequencyMatches[0][2]) ? 1e6 : /kHz/i.test(frequencyMatches[0][2]) ? 1e3 : 1) : 1000;
    const amplitudes = amplitudeMatches.map(match => Number(match[1]) * (/mV/i.test(match[2]) ? 1e-3 : /[uµμ]V/i.test(match[2]) ? 1e-6 : 1) / (/pp|p-p|peak-to-peak/i.test(match[3]) ? 2 : 1));
    const explicitAmplitude = !unknown && amplitudes.length > 0 && amplitudes.every(value => Math.abs(value - amplitudes[0]) < 1e-12);
    const amplitudePeak = explicitAmplitude ? amplitudes[0] : 0.01;
    const offsetMatch = /(?<![\w.+-])([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\s*V\s*(?:DC\s*)?(?:offset|오프셋)/i.exec(setting);
    const offset = !unknown && offsetMatch ? Number(offsetMatch[1]) : 0;
    if (isSignal) {
      if (unknown || frequencyMatches.length !== 1) assumptions.push("입력 주파수 미확인: 교육용 시작값 1 kHz이며 원자료에서 확인한 값이 아닙니다.");
      if (!explicitAmplitude) assumptions.push("입력 진폭 미확인: 교육용 시작값 10 mV peak이며 원자료에서 확인한 값이 아닙니다.");
      if (!offsetMatch || unknown) assumptions.push("입력 DC 오프셋 미확인: 0 V를 시작값으로 제안합니다.");
    }
    const extraSources = (base.extraSources ?? []).filter(extra => extra.netId !== source!.net && extra.netId !== ground.net);
    const waveform = isSignal ? /square|구형/i.test(setting) ? "square" : /triangle|삼각/i.test(setting) ? "triangle" : "sine" : "dc";
    try {
      config = parseSimulationConfig({ ...base, groundNetId: ground.net,
        source: { ...base.source, netId: source.net, waveform, frequencyHz: frequency, amplitudePeak: isSignal ? amplitudePeak : 0, offset: isSignal ? offset : supplies.get(source.net) ?? 0, phaseDegrees: 0 },
        extraSources, supplies: [...supplies].filter(([net]) => net !== source.net && net !== ground.net && !extraSources.some(extra => extra.netId === net)).slice(0, 8).map(([netId, voltage]) => ({ netId, voltage })),
      });
      try {
        const timing = fitSimulationSampling(config, circuit, definitions);
        config = { ...config, durationSeconds: timing.durationSeconds, sampleCount: timing.sampleCount };
        if (timing.limited) captureNote = timing.note;
      } catch (failure) {
        captureNote = `관측 시간 자동 맞춤 전에 회로 모델을 확인하세요. ${failure instanceof Error ? failure.message : "지원 모델과 소자 값을 확인하세요."}`;
      }
    } catch { assumptions.push("추천된 입력 조건이 계산 범위를 벗어납니다. 직접 확인하여 수정하세요."); }
  }
  return { sourceNetId: source?.net ?? null, groundNetId: ground?.net ?? null, inputNetId: input?.net ?? null, outputNetId: output?.net ?? null, config, reasons, assumptions: [...new Set(assumptions)], confidence: !config || !output ? "low" : assumptions.length ? "medium" : "high", ...(captureNote ? { captureNote } : {}) };
}

/** Suggested probes still require electrically valid physical holes. */
export function resolveSimulationProbeHoles(circuit: Circuit, definitions: ComponentDefinition[], layout: CircuitLayout, nets: [string | null, string | null]): { holes: ProbeHoles; blockedReason: string } {
  try {
    const index = createSimulationLayoutIndex(circuit, definitions, layout);
    const holes = nets.map(net => {
      if (!net) return null;
      const candidates = [
        ...layout.terminals.filter(port => port.netId === net).map(port => port.holeId),
        ...layout.placements.flatMap(placement => Object.entries(placement.pins).filter(([pin]) => circuit.components.find(part => part.id === placement.componentId)?.pinNets[pin] === net).map(([, hole]) => hole)),
      ];
      return candidates.find(hole => { try { return index.netForHole(hole) === net; } catch { return false; } }) ?? null;
    }) as ProbeHoles;
    return { holes, blockedReason: nets.some((net, i) => net && !holes[i]) ? "선택한 연결에 검증된 빵판 구멍이 없습니다. 소자와 배치를 확인하세요." : "" };
  } catch (error) {
    return { holes: [null, null], blockedReason: error instanceof Error ? error.message : "빵판 연결 검증을 통과해야 실행할 수 있습니다." };
  }
}

export function simulationSamplingWarning(config: SimulationConfig): string {
  if (!Number.isFinite(config.durationSeconds) || !Number.isFinite(config.sampleCount) || config.sampleCount < 2) return "시간 범위와 샘플 수를 확인하세요.";
  const sources = [config.source, ...config.extraSources ?? []].filter(source => source.waveform !== "dc" && source.amplitudePeak > 0);
  const step = config.durationSeconds / (config.sampleCount - 1);
  if (sources.some(source => !Number.isFinite(source.frequencyHz) || source.frequencyHz <= 0)) return "입력 주파수를 확인하세요.";
  if (sources.some(source => step > sourceSamplingLimits(source).maximumOutputStepSeconds * (1 + 1e-12))) return "샘플이 부족해 고주파 성분을 놓칠 수 있습니다. 시간 범위를 줄이거나 샘플 수를 늘리세요. 계산기는 한 주기당 최소 32개 표본을 요구합니다.";
  if (sources.some(source => config.durationSeconds * source.frequencyHz < 2)) return "두 주기보다 짧은 시간 범위입니다. 주파수·이득 비교를 위해 표시 시간을 늘려보세요.";
  return "";
}
