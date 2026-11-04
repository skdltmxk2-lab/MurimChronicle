import { createAssemblySteps, createBoard, createLayout, validateLayout } from "./engine";
import { assertSafeData, CIRCUIT_LIMITS, parseCircuit } from "./schema";
import { isSavedProjectMetadata } from "./storage";
import type { Circuit, CircuitLayout, ComponentDefinition, SavedProject } from "./types";

function invalid(): never { throw new Error("프로젝트의 배치·연결 데이터 형식을 확인해 주세요."); }
function object(value: unknown, fields: readonly string[]): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  const result = value as Record<string, unknown>;
  if (Object.keys(result).some(key => !fields.includes(key))) invalid();
  return result;
}
function list(value: unknown, max: number): unknown[] {
  if (!Array.isArray(value) || value.length > max) invalid();
  return value;
}
function identifier(value: unknown): string {
  if (typeof value !== "string" || value.length > 64 || !/^[A-Za-z0-9][A-Za-z0-9_.:+-]*$/.test(value)) invalid();
  return value;
}

function parseLayout(value: unknown, circuit: Circuit, definitions: ComponentDefinition[], project: SavedProject): CircuitLayout {
  const input = object(value, ["board", "placements", "jumpers", "terminals", "issues"]);
  // Saved coordinates, conductive groups and validation results are never trusted.
  const board = createBoard(project.boardOptions);
  const holes = new Set(board.holes.map(hole => hole.id));
  const hole = (value: unknown): string => { if (typeof value !== "string" || !holes.has(value)) invalid(); return value; };
  const net = (value: unknown): string => { const id = identifier(value); if (!Object.hasOwn(circuit.netNames, id)) invalid(); return id; };
  const seenComponents = new Set<string>();
  const placements = list(input.placements, CIRCUIT_LIMITS.components).map(value => {
    const input = object(value, ["componentId", "pins"]);
    const componentId = identifier(input.componentId);
    const component = circuit.components.find(item => item.id === componentId);
    const definition = component && definitions.find(item => item.id === component.definitionId);
    if (!definition || seenComponents.has(componentId)) invalid();
    seenComponents.add(componentId);
    const pinIds = definition.pins.map(pin => pin.id);
    const rawPins = object(input.pins, pinIds);
    if (Object.keys(rawPins).length !== pinIds.length) invalid();
    return { componentId, pins: Object.fromEntries(pinIds.map(id => [id, hole(rawPins[id])])) };
  });
  const seenJumpers = new Set<string>();
  const jumpers = list(input.jumpers, 1200).map(value => {
    const input = object(value, ["id", "netId", "from", "to", "color"]);
    const id = identifier(input.id);
    if (seenJumpers.has(id) || typeof input.color !== "string" || !/^#[a-f0-9]{6}$/i.test(input.color)) invalid();
    seenJumpers.add(id);
    return { id, netId: net(input.netId), from: hole(input.from), to: hole(input.to), color: input.color };
  });
  const seenTerminals = new Set<string>();
  const terminals = list(input.terminals, CIRCUIT_LIMITS.instruments).map(value => {
    const input = object(value, ["connectionId", "holeId", "netId"]);
    const connectionId = identifier(input.connectionId);
    const connection = circuit.instruments.find(item => item.id === connectionId);
    if (!connection || seenTerminals.has(connectionId) || connection.netId !== input.netId) invalid();
    seenTerminals.add(connectionId);
    return { connectionId, holeId: hole(input.holeId), netId: net(input.netId) };
  });
  const layout: CircuitLayout = { board, placements, jumpers, terminals, issues: [] };
  // An electrically incorrect edit remains a usable draft with current error details.
  layout.issues = validateLayout(circuit, definitions, layout).issues;
  return layout;
}

/** Prepare the entire imported project before committing any workspace state. */
export function parseProjectForWorkspace(value: unknown, definitions: ComponentDefinition[]): SavedProject & { layout: CircuitLayout } {
  assertSafeData(value);
  if (!isSavedProjectMetadata(value)) invalid();
  const circuit = parseCircuit(value.circuit, definitions);
  const boardOptions = { boards: value.boardOptions.boards, railMode: value.boardOptions.railMode };
  const layout = value.layout === undefined ? createLayout(circuit, definitions, boardOptions) : parseLayout(value.layout, circuit, definitions, value);
  const validSteps = new Set(createAssemblySteps(circuit, definitions, layout).map(step => step.id));
  if (new Set(value.completedSteps).size !== value.completedSteps.length || value.completedSteps.some(step => !validSteps.has(step))) invalid();
  return { ...value, circuit, boardOptions, layout, completedSteps: [...value.completedSteps] };
}
