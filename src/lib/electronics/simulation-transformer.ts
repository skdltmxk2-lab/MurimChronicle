import type { CircuitComponent, ComponentDefinition } from "./types";

/** Schematic terminals, not a claim about any physical transformer's lead order. */
export const IDEAL_CENTER_TAP_ID = "transformer-ideal-center-tap";
export const IDEAL_CENTER_TAP_PACKAGE = "Ideal center-tapped transformer";
export const IDEAL_CENTER_TAP_LABELS = ["P+", "P−", "S+", "CT", "S−"] as const;

export type IdealCenterTap = {
  id: string;
  primaryPlus: string;
  primaryMinus: string;
  secondaryPlus: string;
  centerTap: string;
  secondaryMinus: string;
  /** Primary turns / TOTAL secondary turns (not primary / half winding). */
  turnsRatio: number;
};

export function parseTransformerRatio(value: string): number {
  if (typeof value !== "string" || value.length > 80) throw new Error("이상 변압기 권선비는 Np:Ns(전체 2차) 형식의 양수 두 개여야 합니다. 예: 1:1, 2:1.");
  const match = /^\s*(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)\s*$/.exec(value);
  const numerator = Number(match?.[1]), denominator = Number(match?.[2]);
  const ratio = numerator / denominator;
  if (!match || !Number.isFinite(numerator) || !Number.isFinite(denominator) || numerator <= 0 || denominator <= 0 || !Number.isFinite(ratio) || ratio < 0.001 || ratio > 1000) {
    throw new Error("이상 변압기 권선비는 Np:Ns(전체 2차), 0.001~1000 범위로 명시하세요. 예: 1:1, 2:1. 임피던스비와 권선비는 다릅니다.");
  }
  return ratio;
}

export function buildIdealCenterTap(component: CircuitComponent, definition: ComponentDefinition): IdealCenterTap {
  if (definition.id !== IDEAL_CENTER_TAP_ID || definition.kind !== "transformer" || definition.package !== IDEAL_CENTER_TAP_PACKAGE || definition.mounting !== "external" || definition.pinoutStatus !== "generic" || definition.pins.length !== 5 || IDEAL_CENTER_TAP_LABELS.some((label, i) => definition.pins.find(pin => pin.id === String(i + 1))?.label !== label)) {
    throw new Error(`${component.id}: 명시된 5단자 이상 변압기 회로도 모델만 지원합니다. 실물 CS195의 핀맵·권선비를 추정하지 않습니다.`);
  }
  const [primaryPlus, primaryMinus, secondaryPlus, centerTap, secondaryMinus] = IDEAL_CENTER_TAP_LABELS.map((_, i) => component.pinNets[String(i + 1)]);
  if (primaryPlus === primaryMinus || new Set([secondaryPlus, centerTap, secondaryMinus]).size !== 3) throw new Error(`${component.id}: 이상 변압기의 동일 권선 단자를 서로 단락할 수 없습니다.`);
  return { id: component.id, primaryPlus, primaryMinus, secondaryPlus, centerTap, secondaryMinus, turnsRatio: parseTransformerRatio(component.value) };
}

export const IDEAL_TRANSFORMER_WARNING = "센터탭 변압기는 회로도 전용 이상 모델입니다. Np:Ns는 1차:전체 2차 권선비이며 각 반권선 전압은 1/(2×권선비)입니다. 양측 부하와 전류는 MNA 방정식으로 연동됩니다. 권선저항·자화/누설 인덕턴스·철손·포화·주파수 특성·실물 핀 배치는 모델링하지 않습니다. 입력의 DC 전압차는 허용하지 않으며 이 모델은 CS195/Multisim 모델의 동일성이나 실제 빵판 연결을 검증하지 않습니다.";
