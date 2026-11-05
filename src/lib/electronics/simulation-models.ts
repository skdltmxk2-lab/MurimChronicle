import type { Circuit, ComponentDefinition } from "./types";
import { hasBc109cFormedProfile } from "./physical-profiles";

/** Currents are positive INTO each terminal. Voltages and rows follow pinLabels. */
export type NonlinearDevice = {
  id: string;
  pins: string[];
  pinLabels: string[];
  evaluate(voltages: number[]): { currents: number[]; jacobian: number[][] };
  /** Reject accepted solutions that rely on a numerical trial-only continuation. */
  validateFinal(voltages: number[]): void;
};
type DiodeParameters = { family: "shockley"; saturationCurrent: number; emissionCoefficient: number };
type BjtParameters = { family: "ebers-moll"; polarity: "npn" | "pnp"; saturationCurrent: number; betaForward: number; betaReverse: number };
type MosParameters = { family: "level-1"; polarity: "nmos" | "pmos"; thresholdVoltage: number; beta: number; channelLengthModulation: number; bodySaturationCurrent: number; bodyEmissionCoefficient: number };
export type NonlinearModel = {
  definitionId: string;
  label: string;
  educational: true;
  componentKind: "diode" | "transistor" | "mosfet";
  package: string;
  /** Expected labels in physical pin-ID order, not solver terminal order. */
  pinLabels: string[];
  rolePinIds: string[];
  physicalPlacement: "direct" | "external-only";
  pinoutSources: { title: string; url?: string; file?: string }[];
  parameterBasis: string;
  parameters: DiodeParameters | BjtParameters | MosParameters;
  limitations: string[];
};
export const NONLINEAR_TEMPERATURE_K = 300;
export const NONLINEAR_THERMAL_VOLTAGE = 8.617333262145e-5 * NONLINEAR_TEMPERATURE_K;
export const NONLINEAR_MODEL_REFERENCE = "https://ngspice.sourceforge.io/docs/ngspice-manual.pdf";
const courseLibrary = "수업 제공 MyDac 매뉴얼/시뮬레이션 library/Transistors.lib";
const bjtLimitations = ["교육용 정적 Ebers–Moll 근사이며 제조사 SPICE 모델의 재현이 아닙니다.", "Early 효과, 고주입, 접합 용량·전하 저장, 항복, 발열을 계산하지 않습니다."];
const mosLimitations = ["교육용 정적 Level-1 제곱법칙과 바디 다이오드 근사이며 제조사 SPICE 모델의 재현이 아닙니다.", "게이트·접합 용량, 직렬 저항, 서브스레시홀드, 항복, 발열을 계산하지 않습니다. 벌크는 소스에 연결된 3단자 모델입니다."];
const bjt = (definitionId: string, label: string, pinLabels: string[], polarity: "npn" | "pnp", saturationCurrent: number, betaForward: number, betaReverse: number, source: string, parameterBasis: string, pkg = "TO-92"): NonlinearModel => ({
  definitionId, label: `${label} · 교육용 Ebers–Moll`, educational: true, componentKind: "transistor", package: pkg, pinLabels,
  rolePinIds: ["C", "B", "E"].map(role => String(pinLabels.findIndex(pin => pin === role || pin.startsWith(`${role} /`)) + 1)),
  physicalPlacement: pkg === "TO-18 SOT18" ? "external-only" : "direct",
  pinoutSources: source.startsWith("https:") ? [{ title: `${label} 제조사 핀맵`, url: source }] : [{ title: "Philips BC107/108/109, 1997-09-03, p.2", file: source }],
  parameterBasis, parameters: { family: "ebers-moll", polarity, saturationCurrent, betaForward, betaReverse }, limitations: bjtLimitations,
});
const mos = (definitionId: string, label: string, pinLabels: string[], polarity: "nmos" | "pmos", thresholdVoltage: number, beta: number, channelLengthModulation: number, source: string, parameterBasis: string, pkg = "TO-92", bodySaturationCurrent = 1e-12, bodyEmissionCoefficient = 1.3): NonlinearModel => ({
  definitionId, label: `${label} · 교육용 Level-1`, educational: true, componentKind: "mosfet", package: pkg, pinLabels,
  rolePinIds: ["D", "G", "S"].map(role => String(pinLabels.indexOf(role) + 1)), physicalPlacement: "direct",
  pinoutSources: [{ title: `${label} 제조사 핀맵`, url: source }], parameterBasis,
  parameters: { family: "level-1", polarity, thresholdVoltage, beta, channelLengthModulation, bodySaturationCurrent, bodyEmissionCoefficient }, limitations: mosLimitations,
});

/** Pinout identity is manufacturer-specific; all numerical profiles remain educational. */
export const NONLINEAR_MODEL_REGISTRY: readonly NonlinearModel[] = [
  { definitionId: "diode-1n4148-vishay-do35", label: "1N4148 · 교육용 Shockley", educational: true, componentKind: "diode", package: "DO-35", pinLabels: ["A", "K"], rolePinIds: ["1", "2"], physicalPlacement: "direct", pinoutSources: [{ title: "Vishay 1N4148: 검은 띠=K", url: "https://www.vishay.com/docs/81857/1n4148.pdf" }], parameterBasis: "Is=2 nA, n=1.9를 교육용으로 선택: 300 K, 1 mA에서 약 0.645 V. 데이터시트 곡선의 정밀 피팅이나 제조사 SPICE 값이 아닙니다.", parameters: { family: "shockley", saturationCurrent: 2e-9, emissionCoefficient: 1.9 }, limitations: ["정적 Shockley 교육 모델이며 직렬 저항·접합 용량·역회복·항복·발열을 계산하지 않습니다."] },
  bjt("bjt-bc549c-onsemi-to92", "BC549C", ["C", "B", "E"], "npn", 7.049e-15, 493.2, 2.886, "https://www.onsemi.com/pdf/datasheet/bc550-d.pdf", `${courseLibrary}의 Philips BC549C Is/Bf/Br만 사용한 축소 모델입니다. onsemi 실물 핀맵과 Philips 교육 파라미터의 출처가 다릅니다.`),
  bjt("bjt-bc556b-onsemi-to92", "BC556B", ["C", "B", "E"], "pnp", 1.02e-15, 306.5, 7.437, "https://www.onsemi.com/pdf/datasheet/bc556b-d.pdf", `${courseLibrary}의 Philips BC556B Is/Bf/Br만 사용한 축소 모델입니다. onsemi 실물 특성의 보증값이 아닙니다.`),
  bjt("bjt-bc109c-philips-to18", "BC109C", ["E", "B", "C / CASE"], "npn", 7.049e-15, 677, 2.209, "generalNPN_BC109.pdf", `${courseLibrary}의 BC109C Is/Bf/Br만 사용합니다. 빵판 시뮬레이션은 명시한 TO-18 성형 프로필과 물리 연결 검증을 사용합니다. 원형 리드는 성형 프로필을 선택하기 전까지 미배치로 유지합니다.`, "TO-18 SOT18"),
  bjt("bjt-2n3904-onsemi-to92", "2N3904", ["E", "B", "C"], "npn", 1e-14, 200, 4, "https://www.onsemi.com/pdf/datasheet/2n3903-d.pdf", "소신호 범용 NPN 교육값 Is=10 fA, βF=200, βR=4. 특정 제조사 곡선 피팅 없이 극성·증폭·포화 학습용으로 선택했습니다."),
  bjt("bjt-2n3906-onsemi-to92", "2N3906", ["E", "B", "C"], "pnp", 1e-14, 200, 4, "https://www.onsemi.com/pdf/datasheet/2n3906-d.pdf", "소신호 범용 PNP 교육값 Is=10 fA, βF=200, βR=4. 2N3904 교육 프로파일의 극성 대칭이며 실물 상보쌍의 일치 보증이 아닙니다."),
  bjt("bjt-bc547b-onsemi-to92", "BC547B", ["C", "B", "E"], "npn", 1e-14, 300, 4, "https://www.onsemi.com/pdf/datasheet/bc550-d.pdf", "B 등급 학습용 고정 βF=300, Is=10 fA, βR=4. 실물 전류·온도별 hFE 변화를 재현하지 않습니다."),
  bjt("bjt-bc557b-onsemi-to92", "BC557B", ["C", "B", "E"], "pnp", 1e-14, 300, 4, "https://www.onsemi.com/pdf/datasheet/bc556b-d.pdf", "B 등급 학습용 고정 βF=300, Is=10 fA, βR=4. 실물 전류·온도별 hFE 변화를 재현하지 않습니다."),
  mos("mosfet-2n7000ta-onsemi-to92", "2N7000TA", ["S", "G", "D"], "nmos", 2.474, 0.296, 267e-6, "https://www.onsemi.com/download/data-sheet/pdf/2n7000ta-d.pdf", `${courseLibrary}의 Zetex 2N7000 VTO/KP/LAMBDA와 바디 다이오드 Is/N만 가져온 축소 교육 모델입니다. W/L=1로 간주하며 RG/RS/C 및 병렬 RL은 생략합니다. onsemi 핀맵과 Zetex 수치 출처가 다릅니다.`, "TO-92", 1.254e-13, 1.0207),
  mos("mosfet-bs170-onsemi-to92", "BS170", ["D", "G", "S"], "nmos", 2.1, 0.05, 0.02, "https://www.onsemi.com/pdf/datasheet/mmbf170-d.pdf", "교육 선택값 Vth=2.1 V, β=0.05 A/V², λ=0.02/V. 낮은 VDS·VGS=10 V에서 약 2.53 Ω인 단순 소신호 예제이며 데이터시트 피팅값이 아닙니다."),
  mos("mosfet-irf540n-infineon-to220", "IRF540N", ["G", "D", "S"], "nmos", 3, 3, 0.005, "https://www.infineon.com/assets/row/public/documents/24/49/infineon-irf540n-datasheet-en.pdf", "교육 선택값 Vth=3 V, β=3 A/V², λ=0.005/V. VGS=10 V의 낮은 VDS에서 약 48 mΩ가 되도록 고른 근사이며 전력·열 설계용 모델이 아닙니다.", "TO-220"),
  mos("mosfet-irf9540n-infineon-to220", "IRF9540N", ["G", "D", "S"], "pmos", 3, 1.2, 0.005, "https://www.infineon.com/assets/row/public/documents/24/49/infineon-irf9540n-datasheet-en.pdf", "P채널 교육 선택값 |Vth|=3 V, β=1.2 A/V², λ=0.005/V. VGS=-10 V의 낮은 |VDS|에서 약 119 mΩ인 근사이며 실물 곡선 피팅·전력 검증이 아닙니다.", "TO-220"),
];

export function getNonlinearModel(definition: ComponentDefinition): NonlinearModel | undefined {
  const model = NONLINEAR_MODEL_REGISTRY.find(item => item.definitionId === definition.id);
  if (!model) return undefined;
  if (definition.kind !== model.componentKind || definition.package !== model.package || definition.pinoutStatus !== "datasheet" || definition.pins.length !== model.pinLabels.length || model.pinLabels.some((label, index) => definition.pins.find(pin => pin.id === String(index + 1))?.label !== label)) {
    throw new Error(`${definition.name}: 등록된 제조사 패키지·핀맵과 일치하지 않아 시뮬레이션을 중단합니다.`);
  }
  return model;
}

// Forward-mode automatic differentiation keeps Newton and AC derivatives identical.
type Dual = { v: number; d: number[] };
const constant = (v: number, n: number): Dual => ({ v, d: Array(n).fill(0) });
const add = (a: Dual, b: Dual): Dual => ({ v: a.v + b.v, d: a.d.map((x, i) => x + b.d[i]) });
const scale = (a: Dual, k: number): Dual => ({ v: a.v * k, d: a.d.map(x => x * k) });
const subtract = (a: Dual, b: Dual) => add(a, scale(b, -1));
const multiply = (a: Dual, b: Dual): Dual => ({ v: a.v * b.v, d: a.d.map((x, i) => x * b.v + a.v * b.d[i]) });
function expMinusOne(a: Dual): Dual {
  // C1 linear continuation only above 40 thermal voltages prevents overflow in Newton trials.
  const exp = Math.exp(Math.min(a.v, 40));
  return { v: a.v <= 40 ? Math.expm1(a.v) : exp * (1 + a.v - 40) - 1, d: a.d.map(x => x * exp) };
}
const diodeCurrent = (voltage: Dual, saturationCurrent: number, emissionCoefficient: number) => scale(expMinusOne(scale(voltage, 1 / (emissionCoefficient * NONLINEAR_THERMAL_VOLTAGE))), saturationCurrent);

function validateFinal(model: NonlinearModel, voltages: number[]) {
  if (voltages.length !== model.rolePinIds.length || voltages.some(value => !Number.isFinite(value))) throw new Error("소자 단자 전압의 개수 또는 값이 올바르지 않습니다.");
  const p = model.parameters;
  let exponents: number[];
  if (p.family === "shockley") exponents = [(voltages[0] - voltages[1]) / (p.emissionCoefficient * NONLINEAR_THERMAL_VOLTAGE)];
  else if (p.family === "ebers-moll") {
    const sign = p.polarity === "npn" ? 1 : -1;
    exponents = [sign * (voltages[1] - voltages[2]) / NONLINEAR_THERMAL_VOLTAGE, sign * (voltages[1] - voltages[0]) / NONLINEAR_THERMAL_VOLTAGE];
  } else {
    const sign = p.polarity === "nmos" ? 1 : -1;
    exponents = [sign * (voltages[2] - voltages[0]) / (p.bodyEmissionCoefficient * NONLINEAR_THERMAL_VOLTAGE)];
  }
  if (exponents.some(value => value > 40 + 1e-10)) throw new Error(`${model.label}: 접합 전압이 교육용 지수 모델의 계산 범위를 넘었습니다. Newton 반복용 접선 연장 구간의 해를 실제 파형으로 표시하지 않습니다. 입력·바이어스·전류제한 저항을 확인하세요.`);
}

function evaluate(model: NonlinearModel, voltages: number[]) {
  if (voltages.length !== model.rolePinIds.length || voltages.some(value => !Number.isFinite(value))) throw new Error("소자 단자 전압의 개수 또는 값이 올바르지 않습니다.");
  const n = voltages.length;
  const v = voltages.map((value, index): Dual => ({ v: value, d: Array.from({ length: n }, (_, j) => Number(index === j)) }));
  const p = model.parameters;
  let result: Dual[];
  if (p.family === "shockley") {
    const current = diodeCurrent(subtract(v[0], v[1]), p.saturationCurrent, p.emissionCoefficient);
    result = [current, scale(current, -1)];
  } else if (p.family === "ebers-moll") {
    const sign = p.polarity === "npn" ? 1 : -1;
    const alphaF = p.betaForward / (p.betaForward + 1), alphaR = p.betaReverse / (p.betaReverse + 1);
    const forward = diodeCurrent(scale(subtract(v[1], v[2]), sign), p.saturationCurrent / alphaF, 1);
    const reverse = diodeCurrent(scale(subtract(v[1], v[0]), sign), p.saturationCurrent / alphaR, 1);
    const collector = scale(subtract(scale(forward, alphaF), reverse), sign);
    const emitter = scale(subtract(scale(reverse, alphaR), forward), sign);
    result = [collector, scale(add(collector, emitter), -1), emitter];
  } else {
    const sign = p.polarity === "nmos" ? 1 : -1;
    const [drain, gate, source] = v.map(value => scale(value, sign));
    const normal = drain.v >= source.v;
    const channelSource = normal ? source : drain;
    const vds = normal ? subtract(drain, source) : subtract(source, drain);
    const overdrive = subtract(subtract(gate, channelSource), constant(p.thresholdVoltage, n));
    let channel = constant(0, n);
    if (overdrive.v > 0) {
      const squareLaw = vds.v < overdrive.v ? subtract(multiply(overdrive, vds), scale(multiply(vds, vds), 0.5)) : scale(multiply(overdrive, overdrive), 0.5);
      channel = scale(multiply(squareLaw, add(constant(1, n), scale(vds, p.channelLengthModulation))), p.beta * (normal ? 1 : -1));
    }
    // Bulk remains tied to the PHYSICAL source, including reverse-channel operation.
    const body = diodeCurrent(subtract(source, drain), p.bodySaturationCurrent, p.bodyEmissionCoefficient);
    const current = scale(subtract(channel, body), sign);
    result = [current, constant(0, n), scale(current, -1)];
  }
  if (result.some(item => !Number.isFinite(item.v) || item.d.some(value => !Number.isFinite(value)))) throw new Error("교육용 비선형 모델의 계산 범위를 초과했습니다.");
  return { currents: result.map(item => item.v), jacobian: result.map(item => item.d) };
}

export function buildNonlinearDevices(circuit: Circuit, definitions: ComponentDefinition[]): { devices: NonlinearDevice[]; warnings: string[] } {
  const devices: NonlinearDevice[] = [], warnings = new Set<string>();
  for (const component of circuit.components) {
    const definition = definitions.find(item => item.id === component.definitionId);
    if (!definition || !["diode", "led", "transistor", "mosfet"].includes(definition.kind)) continue;
    const model = getNonlinearModel(definition);
    if (!model) throw new Error(`${component.id} ${definition.name}: 확인된 핀맵과 교육용 비선형 모델이 등록되지 않았습니다. 다른 품번으로 자동 치환하지 않습니다.`);
    const netIds = model.rolePinIds.map(id => component.pinNets[id]);
    if (netIds.some(id => typeof id !== "string" || !id.trim())) throw new Error(`${component.id}: 시뮬레이션에 필요한 단자 연결이 누락되었습니다.`);
    const pinLabels = model.parameters.family === "shockley" ? ["A", "K"] : model.parameters.family === "ebers-moll" ? ["C", "B", "E"] : ["D", "G", "S"];
    devices.push({ id: component.id, pins: netIds, pinLabels, evaluate: voltages => evaluate(model, voltages), validateFinal: voltages => validateFinal(model, voltages) });
    warnings.add(`${model.label}: ${model.parameterBasis}`);
    model.limitations.forEach(message => warnings.add(message));
    if (model.physicalPlacement === "external-only") warnings.add(hasBc109cFormedProfile(component, definition)
      ? `${definition.name}: 명시한 TO-18 성형 패턴으로 배치합니다. 실제 리드 성형·금속 캔 절연 조건은 조립 안내를 확인하세요.`
      : `${definition.name}: 수치 모델은 있으나 TO-18 원형 리드의 빵판 배치는 성형 프로필 적용이 필요합니다.`);
  }
  if (devices.length) warnings.add("모든 비선형 모델은 300 K 고정 온도입니다. 지수 인자 40 초과의 접선 연장은 반복 중에만 허용하며 해당 구간의 최종해는 거부합니다. 실물 정격·고주파·열 성능 검증용이 아닙니다.");
  return { devices, warnings: [...warnings] };
}
