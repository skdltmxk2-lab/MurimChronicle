import type { CircuitComponent, ComponentDefinition } from "./types";

export const BC109C_FORMED_PROFILE = "bc109c-to18-formed-v1" as const;
export const BC109C_DEFINITION_ID = "bjt-bc109c-philips-to18";

// Application-defined lead forming. Philips SOT18 specifies the original lead
// circle and E1/B2/C3 pinout, but does not specify this breadboard adaptation.
export const BC109C_FORMED_GUIDANCE = "성형 조건 · 빵판의 행 A가 위쪽, 열 1이 왼쪽이 되게 놓고 위에서 내려다본 방향입니다(데이터시트의 핀 쪽 그림과는 거울상). 탭은 왼쪽 위, 1번 E는 왼쪽, 3번 C(금속 캔)는 오른쪽, 2번 B는 가운데 한 행 아래입니다. E–C 간격 5.08 mm, B는 두 핀의 중간에서 2.54 mm 아래로 성형해 독립된 3개 열에 꽂습니다. 실제 리드 길이와 절연을 확인하고 금속 캔을 보드 위로 띄워 다른 핀·점퍼와 닿지 않게 하세요. 앱이 정한 성형 패턴입니다.";

export function supportsBc109cForming(definition: ComponentDefinition): boolean {
  return definition.id === BC109C_DEFINITION_ID && definition.kind === "transistor" &&
    definition.package === "TO-18 SOT18" && definition.pinoutStatus === "datasheet" &&
    definition.pins.length === 3 && ["E", "B", "C / CASE"].every((label, index) =>
      definition.pins.some(pin => pin.id === String(index + 1) && pin.label === label));
}

export function hasBc109cFormedProfile(component: CircuitComponent, definition: ComponentDefinition): boolean {
  return component.definitionId === definition.id && component.physicalProfile === BC109C_FORMED_PROFILE && supportsBc109cForming(definition);
}
