import type { AssemblyStep, Circuit, CircuitLayout, ComponentDefinition, ComponentKind } from "./types";

/** Display layers never change the circuit, placements, or electrical validation. */
export type BoardLayer = "resistor" | "capacitor" | "opamp" | "semiconductor" | "ic" | "other" | "jumper" | "instrument";

export const BOARD_LAYERS: readonly { id: BoardLayer; label: string }[] = [
  { id: "resistor", label: "저항" },
  { id: "capacitor", label: "커패시터" },
  { id: "opamp", label: "OP AMP" },
  { id: "semiconductor", label: "반도체" },
  { id: "ic", label: "기타 IC" },
  { id: "other", label: "기타 소자" },
  { id: "jumper", label: "점퍼선" },
  { id: "instrument", label: "계측기" },
];
export const ALL_BOARD_LAYERS: readonly BoardLayer[] = BOARD_LAYERS.map(layer => layer.id);

export function componentLayer(kind: ComponentKind): BoardLayer {
  if (kind === "resistor" || kind === "potentiometer") return "resistor";
  if (kind === "capacitor" || kind === "electrolytic") return "capacitor";
  if (kind === "opamp") return "opamp";
  if (["diode", "led", "transistor", "mosfet"].includes(kind)) return "semiconductor";
  return kind === "ic" ? "ic" : "other";
}

/** Counts only items actually placed on the board, matching what filters can show. */
export function countBoardLayers(circuit: Circuit, definitions: readonly ComponentDefinition[], layout: CircuitLayout): Record<BoardLayer, number> {
  const counts = Object.fromEntries(ALL_BOARD_LAYERS.map(layer => [layer, 0])) as Record<BoardLayer, number>;
  const defs = new Map(definitions.map(definition => [definition.id, definition]));
  const placed = new Set(layout.placements.map(placement => placement.componentId));
  for (const component of circuit.components) {
    const definition = defs.get(component.definitionId);
    if (placed.has(component.id) && definition) counts[componentLayer(definition.kind)]++;
  }
  counts.jumper = layout.jumpers.length;
  counts.instrument = layout.terminals.length;
  return counts;
}

export function isBoardSelectionVisible(
  selection: { type: "component" | "jumper" | "terminal" | "hole"; id: string } | null,
  circuit: Circuit,
  definitions: readonly ComponentDefinition[],
  visibleLayers: readonly BoardLayer[],
): boolean {
  if (!selection || selection.type === "hole") return true;
  if (selection.type === "jumper") return visibleLayers.includes("jumper");
  if (selection.type === "terminal") return visibleLayers.includes("instrument");
  const component = circuit.components.find(item => item.id === selection.id);
  const definition = definitions.find(item => item.id === component?.definitionId);
  return !!definition && visibleLayers.includes(componentLayer(definition.kind));
}

export function layerForAssemblyStep(step: AssemblyStep | undefined, circuit: Circuit, definitions: readonly ComponentDefinition[]): BoardLayer | null {
  if (!step) return null;
  if (step.jumperId) return "jumper";
  if (step.connectionId) return "instrument";
  const component = circuit.components.find(item => item.id === step.componentId);
  const definition = definitions.find(item => item.id === component?.definitionId);
  return definition ? componentLayer(definition.kind) : null;
}
