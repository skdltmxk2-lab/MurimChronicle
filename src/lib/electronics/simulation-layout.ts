import { createBoard, validateLayout } from "./engine";
import { assertSafeData, CIRCUIT_LIMITS } from "./schema";
import type { BoardOptions, Circuit, CircuitLayout, ComponentDefinition, ValidationIssue, ValidationReport } from "./types";

export class SimulationLayoutError extends Error {
  constructor(public readonly code: string, message: string, public readonly issues: ValidationIssue[] = []) {
    super(message); this.name = "SimulationLayoutError";
  }
}
function bad(message: string): never { throw new SimulationLayoutError("INVALID_LAYOUT_DATA", message); }
function object(value: unknown, fields: readonly string[]): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) bad("빵판 배치 데이터는 객체여야 합니다.");
  const result = value as Record<string, unknown>;
  if (Object.keys(result).some(key => !fields.includes(key))) bad("빵판 배치에 지원하지 않는 항목이 있습니다.");
  return result;
}
function list(value: unknown, max: number): unknown[] {
  if (!Array.isArray(value) || value.length > max) bad("빵판 배치의 개수 제한을 초과했거나 배열이 아닙니다.");
  return value;
}
function identifier(value: unknown): string {
  if (typeof value !== "string" || value.length > 64 || !/^[A-Za-z0-9][A-Za-z0-9_.:+-]*$/.test(value)) bad("배치 식별자 형식이 올바르지 않습니다.");
  return value;
}

export function parseSimulationBoardOptions(value: unknown): BoardOptions {
  const options = object(value, ["boards", "railMode"]);
  if ((options.boards !== 1 && options.boards !== 2) || (options.railMode !== "split" && options.railMode !== "continuous")) bad("지원하지 않는 빵판 설정입니다.");
  return { boards: options.boards, railMode: options.railMode };
}

/** Validate untrusted references and rebuild all conductive groups from the board profile. */
export function parseSimulationLayout(value: unknown, circuit: Circuit, definitions: readonly ComponentDefinition[], boardOptions: BoardOptions): CircuitLayout {
  assertSafeData(value);
  const input = object(value, ["board", "placements", "jumpers", "terminals", "issues"]);
  const board = createBoard(parseSimulationBoardOptions(boardOptions));
  const holes = new Set(board.holes.map(hole => hole.id));
  const hole = (value: unknown): string => { if (typeof value !== "string" || !holes.has(value)) bad("존재하지 않는 빵판 홀을 참조합니다."); return value; };
  const net = (value: unknown): string => { const id = identifier(value); if (!Object.hasOwn(circuit.netNames, id)) bad("회로에 없는 연결 이름을 참조합니다."); return id; };
  const byComponent = new Map(circuit.components.map(component => [component.id, component]));
  const byDefinition = new Map(definitions.map(definition => [definition.id, definition]));
  const seenComponents = new Set<string>();
  const placements = list(input.placements, CIRCUIT_LIMITS.components).map(value => {
    const p = object(value, ["componentId", "pins"]);
    const componentId = identifier(p.componentId);
    const component = byComponent.get(componentId);
    const definition = component && byDefinition.get(component.definitionId);
    if (!definition || seenComponents.has(componentId)) bad("소자 배치가 중복되었거나 회로에 없는 소자입니다.");
    seenComponents.add(componentId);
    const expected = definition.pins.map(pin => pin.id);
    const supplied = object(p.pins, expected);
    if (Object.keys(supplied).length !== expected.length) bad("소자의 물리 핀 배치가 누락되었습니다.");
    return { componentId, pins: Object.fromEntries(expected.map(pin => [pin, hole(supplied[pin])])) };
  });
  const seenJumpers = new Set<string>();
  const jumpers = list(input.jumpers, 1200).map(value => {
    const p = object(value, ["id", "netId", "from", "to", "color"]);
    const id = identifier(p.id);
    if (seenJumpers.has(id)) bad("점퍼선 식별자가 중복되었습니다.");
    if (typeof p.color !== "string" || !/^#[a-f0-9]{6}$/i.test(p.color)) bad("점퍼선 색상 형식이 올바르지 않습니다.");
    seenJumpers.add(id);
    return { id, netId: net(p.netId), from: hole(p.from), to: hole(p.to), color: p.color };
  });
  const byConnection = new Map(circuit.instruments.map(connection => [connection.id, connection]));
  const seenTerminals = new Set<string>();
  const terminals = list(input.terminals, CIRCUIT_LIMITS.instruments).map(value => {
    const p = object(value, ["connectionId", "holeId", "netId"]);
    const connectionId = identifier(p.connectionId);
    const connection = byConnection.get(connectionId);
    if (!connection || seenTerminals.has(connectionId) || p.netId !== connection.netId) bad("계측기 연결이 중복되었거나 목표 회로와 다릅니다.");
    seenTerminals.add(connectionId);
    return { connectionId, holeId: hole(p.holeId), netId: net(p.netId) };
  });
  return { board, placements, jumpers, terminals, issues: [] };
}

export type SimulationLayoutIndex = {
  layout: CircuitLayout;
  validation: ValidationReport;
  netIds: string[];
  netForHole: (holeId: string) => string;
};

/** Refuses invalid wiring. Probe identity follows actual holes/strips/wires, never wire labels. */
export function createSimulationLayoutIndex(circuit: Circuit, definitions: readonly ComponentDefinition[], suppliedLayout: CircuitLayout): SimulationLayoutIndex {
  const options = parseSimulationBoardOptions(suppliedLayout?.board?.options);
  const layout = parseSimulationLayout(suppliedLayout, circuit, definitions, options);
  const validation = validateLayout(circuit, [...definitions], layout);
  layout.issues = validation.issues;
  if (!validation.valid) {
    const errors = validation.issues.filter(issue => issue.severity === "error");
    throw new SimulationLayoutError("LAYOUT_INVALID", `현재 빵판 연결을 먼저 수정하세요. ${errors.slice(0, 3).map(issue => issue.message).join(" ")}`, errors);
  }
  const parent = new Map(layout.board.holes.map(hole => [hole.id, hole.id]));
  const find = (id: string): string => {
    let root = id;
    while (parent.get(root) !== root) root = parent.get(root)!;
    while (id !== root) { const next = parent.get(id)!; parent.set(id, root); id = next; }
    return root;
  };
  const union = (a: string, b: string) => { parent.set(find(a), find(b)); };
  const firstByGroup = new Map<string, string>();
  for (const hole of layout.board.holes) {
    const first = firstByGroup.get(hole.group);
    if (first) union(first, hole.id); else firstByGroup.set(hole.group, hole.id);
  }
  for (const jumper of layout.jumpers) union(jumper.from, jumper.to);
  const netsByRoot = new Map<string, Set<string>>();
  const addNet = (holeId: string, netId: string) => {
    const root = find(holeId);
    const nets = netsByRoot.get(root) ?? new Set<string>(); nets.add(netId); netsByRoot.set(root, nets);
  };
  const byComponent = new Map(circuit.components.map(component => [component.id, component]));
  for (const placement of layout.placements) {
    const component = byComponent.get(placement.componentId)!;
    for (const [pinId, holeId] of Object.entries(placement.pins)) addNet(holeId, component.pinNets[pinId]);
  }
  const byConnection = new Map(circuit.instruments.map(connection => [connection.id, connection]));
  for (const terminal of layout.terminals) addNet(terminal.holeId, byConnection.get(terminal.connectionId)!.netId);
  const netIds = [...new Set([...netsByRoot.values()].flatMap(nets => [...nets]))];
  return { layout, validation, netIds, netForHole(holeId: string) {
    if (!parent.has(holeId)) throw new SimulationLayoutError("UNKNOWN_PROBE_HOLE", `${holeId}: 존재하지 않는 프로브 구멍입니다.`);
    const nets = netsByRoot.get(find(holeId));
    if (!nets?.size) throw new SimulationLayoutError("ISOLATED_PROBE_HOLE", `${holeId}: 회로에 연결되지 않은 구멍입니다. 연결된 소자 다리나 같은 내부 연결 줄에 프로브를 놓으세요.`);
    if (nets.size > 1) throw new SimulationLayoutError("PROBE_NET_CONFLICT", `${holeId}: 서로 다른 연결이 단락되어 측정 대상을 정할 수 없습니다 (${[...nets].join(", ")}).`);
    return [...nets][0];
  } };
}

export function resolveProbeNet(circuit: Circuit, definitions: readonly ComponentDefinition[], layout: CircuitLayout, holeId: string): string {
  return createSimulationLayoutIndex(circuit, definitions, layout).netForHole(holeId);
}
