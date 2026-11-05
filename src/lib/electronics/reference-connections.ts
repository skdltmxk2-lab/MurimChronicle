import { SOURCE_DEFAULTS } from "./simulation-source";
import type { Circuit, InstrumentConnection } from "./types";
import type { SimulationConfig, SimulationSource } from "./simulation-types";

const GENERATED_PREFIX = "reference-connection-";
const NOTE_PREFIX = "계측 연결 · ";
const LEGACY_DRIVE_INSTRUMENTS = new Set(["DC 전원", "별도 DC 전원", "함수발생기", "RF 발생기", "대칭 LO 발생기"]);

function quantity(value: number, unit: string): string {
  const magnitude = Math.abs(value);
  const scale = magnitude >= 1000 ? { factor: 1000, prefix: "k" }
    : magnitude > 0 && magnitude < 0.001 ? { factor: 0.000001, prefix: "µ" }
      : magnitude > 0 && magnitude < 1 ? { factor: 0.001, prefix: "m" } : { factor: 1, prefix: "" };
  return `${Number((value / scale.factor).toPrecision(6))} ${scale.prefix}${unit}`;
}

function sourceSetting(source: SimulationSource): string {
  if (source.waveform === "dc") return `${source.offset} V DC`;
  const waveform = { sine: "사인파", square: "사각파", triangle: "삼각파", pulse: "펄스", sawtooth: "톱니파", am: "AM", dsb: "DSB-SC" }[source.waveform];
  const settings = [waveform, quantity(source.frequencyHz, "Hz"), `${quantity(source.amplitudePeak, "V")} peak`, `offset ${quantity(source.offset, "V")}`, `위상 ${source.phaseDegrees ?? 0}°`];
  if (source.waveform === "pulse") settings.push(`duty ${source.dutyCyclePercent ?? SOURCE_DEFAULTS.dutyCyclePercent}%`);
  if (source.waveform === "square") settings.push("duty 50%");
  if (source.waveform === "am" || source.waveform === "dsb") settings.push(`변조 ${quantity(source.modulationFrequencyHz ?? SOURCE_DEFAULTS.modulationFrequencyHz, "Hz")}`);
  if (source.waveform === "am") settings.push(`변조 깊이 ${source.modulationDepth ?? SOURCE_DEFAULTS.modulationDepth}`);
  return settings.join(" · ");
}

/** Reconstruct external drives for reviewed reference fixtures from their exact config. */
export function ensureReferenceConnections(original: Circuit, config: SimulationConfig): Circuit {
  const circuit = structuredClone(original);
  // Direct DAQ loopbacks have no breadboard circuit. Their separate blocked scope
  // is retained rather than manufacturing component or breadboard endpoints.
  if (!circuit.components.length) return circuit;
  circuit.instruments = circuit.instruments.filter(connection =>
    !connection.id.startsWith(GENERATED_PREFIX) && !LEGACY_DRIVE_INSTRUMENTS.has(connection.instrument));
  circuit.notes = circuit.notes.filter(note => !note.startsWith(NOTE_PREFIX));
  const connections: InstrumentConnection[] = [{
    id: `${GENERATED_PREFIX}ground`, instrument: "공통 기준", port: "GND · 0 V", netId: config.groundNetId, setting: "0 V",
  }];
  const addOutput = (id: string, instrument: string, netId: string, setting: string) => {
    connections.push({ id: `${GENERATED_PREFIX}${id}-output`, instrument, port: "출력", netId, setting });
    connections.push({ id: `${GENERATED_PREFIX}${id}-return`, instrument, port: "COM · GND 기준", netId: config.groundNetId, setting: "0 V" });
  };
  let generatorCount = 0, dcInputCount = 0;
  for (const [index, source] of [config.source, ...(config.extraSources ?? [])].entries()) {
    if (source.netId === config.groundNetId && source.offset === 0 && source.amplitudePeak === 0) continue;
    const instrument = source.waveform === "dc" ? `DC 입력 전원 ${++dcInputCount}` : `FG${++generatorCount} · 함수발생기`;
    addOutput(`source-${index}`, instrument, source.netId, sourceSetting(source));
  }
  config.supplies.forEach((supply, index) => addOutput(`supply-${index}`, `DC 전원 ${index + 1}`, supply.netId, `${supply.voltage} V DC`));
  circuit.instruments.push(...connections);
  circuit.netNames[config.groundNetId] = "공통 기준 0 V";
  for (const connection of connections) circuit.netNames[connection.netId] ??= connection.netId;
  circuit.notes.push(`${NOTE_PREFIX}각 출력과 COM 단자를 표시한 홀에 연결하고 모든 COM은 ${config.groundNetId} 기준으로 연결합니다. 음전원 출력도 표시된 전압의 별도 출력이며 COM은 0 V입니다.`);
  if (generatorCount > 1) circuit.notes.push(`${NOTE_PREFIX}FG1~FG${generatorCount}은 ${generatorCount}개의 독립 출력 채널입니다. 각 출력의 주파수·진폭·위상을 설정하고 공통 기준과 채널 간 동기 조건을 유지하세요.`);
  // NI myDAQ Specifications 373061g p.4 gives two ground-referenced AO channels.
  // https://download.ni.com/support/manuals/373061g.pdf
  if (generatorCount > 2) circuit.notes.push(`${NOTE_PREFIX}파형 출력 ${generatorCount}개가 동시에 필요합니다. myDAQ 한 대의 AO0·AO1 두 채널만으로는 이 구동을 구성할 수 없어 추가 동기 출력 장비가 필요합니다. LO_PLUS와 LO_MINUS는 각각의 출력에 연결하세요.`);
  return circuit;
}
