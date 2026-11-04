import type {
  AssemblyStep, BoardGeometry, BoardHole, BoardOptions, Circuit, CircuitComponent,
  CircuitLayout, ComponentDefinition, PlacedComponent, ValidationIssue, ValidationReport,
} from "./types";

const PITCH = 18;
const ROWS = "ABCDEFGHIJ";
const ROW_Y = [72, 90, 108, 126, 144, 198, 216, 234, 252, 270];
const BOARD_HEIGHT = 360;
const COLORS = ["#7c3aed", "#0891b2", "#d97706", "#16a34a", "#db2777", "#4f46e5"];

/** A generic 830-contact board, not a claim about an unidentified physical product. */
export function createBoard(options: BoardOptions): BoardGeometry {
  if (![1, 2].includes(options.boards) || !["split", "continuous"].includes(options.railMode)) {
    throw new Error("지원하지 않는 빵판 설정입니다.");
  }
  const holes: BoardHole[] = [];
  for (let board = 1; board <= options.boards; board++) {
    const offset = (board - 1) * BOARD_HEIGHT;
    for (let column = 1; column <= 63; column++) {
      for (let row = 0; row < ROWS.length; row++) {
        holes.push({ id: `B${board}:${ROWS[row]}${column}`, board, row: ROWS[row], column,
          x: 54 + (column - 1) * PITCH, y: offset + ROW_Y[row],
          group: `B${board}:strip:${row < 5 ? "top" : "bottom"}:${column}` });
      }
    }
    for (const [row, y] of [["T+", 28], ["T-", 46], ["B+", 308], ["B-", 326]] as const) {
      for (let column = 1; column <= 50; column++) {
        const position = Math.floor((column - 1) / 5) * 6 + (column - 1) % 5 + 1;
        const segment = options.railMode === "continuous" ? "all" : column <= 25 ? "left" : "right";
        holes.push({ id: `B${board}:${row}${column}`, board, row, column,
          x: 54 + position * PITCH, y: offset + y, group: `B${board}:rail:${row}:${segment}` });
      }
    }
  }
  return { holes, width: 1224, height: options.boards * BOARD_HEIGHT, options: { ...options } };
}

class UnionFind {
  private parents = new Map<string, string>();
  find(value: string): string {
    const parent = this.parents.get(value);
    if (!parent) { this.parents.set(value, value); return value; }
    if (parent === value) return value;
    const root = this.find(parent); this.parents.set(value, root); return root;
  }
  union(a: string, b: string): void { const x = this.find(a), y = this.find(b); if (x !== y) this.parents.set(x, y); }
}

type Footprint = "dip" | "two" | "three" | "unsupported";
function footprint(definition: ComponentDefinition): Footprint {
  if (definition.mounting !== "direct") return "unsupported";
  if (/\b(?:P?DIP|DIL)[ -]?\d*/i.test(definition.package)) {
    const count = definition.pins.length;
    return count >= 4 && count <= 40 && count % 2 === 0 &&
      Array.from({ length: count }, (_, i) => String(i + 1)).every(id => definition.pins.some(pin => pin.id === id))
      ? "dip" : "unsupported";
  }
  if (definition.pins.length === 2) return "two";
  if (definition.pins.length === 3) return "three";
  return "unsupported";
}

function pinNet(component: CircuitComponent, pinId: string): string {
  // Unspecified physical pins remain isolated. They are never silently attached to ground.
  return component.pinNets[pinId] || `__unconnected:${component.id}:${pinId}`;
}

function sourceIssues(circuit: Circuit, definitions: ComponentDefinition[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seen = new Set<string>();
  for (const component of circuit.components) {
    const componentId = component.id;
    if (seen.has(componentId)) issues.push({ severity: "error", code: "DUPLICATE_COMPONENT", componentId, message: `${componentId}: 소자 식별자가 중복되었습니다.` });
    seen.add(componentId);
    const definition = definitions.find(item => item.id === component.definitionId);
    if (!definition) { issues.push({ severity: "error", code: "UNKNOWN_DEFINITION", componentId, message: `${componentId}: 소자 정의를 찾을 수 없습니다.` }); continue; }
    if (definition.mounting !== "direct") issues.push({ severity: "error", code: "UNSUPPORTED_MOUNTING", componentId,
      message: `${componentId}: ${definition.mounting === "adapter" ? "어댑터" : "외부 연결"}가 필요한 소자입니다. 현재 자동 삽입 엔진에서는 지원하지 않습니다.` });
    else if (footprint(definition) === "unsupported") issues.push({ severity: "error", code: "UNSUPPORTED_FOOTPRINT", componentId, message: `${componentId}: ${definition.package}의 물리 핀 배치를 지원하지 않습니다.` });
    if (new Set(definition.pins.map(pin => pin.id)).size !== definition.pins.length) issues.push({ severity: "error", code: "DUPLICATE_PIN_DEFINITION", componentId, message: `${componentId}: 물리 핀 번호가 중복되었습니다.` });
    if (definition.pinoutStatus === "unverified") issues.push({ severity: "warning", code: "PINOUT_UNVERIFIED", componentId, message: `${componentId}: 실제 품번·패키지의 핀 순서를 확인해야 합니다.` });
    for (const [pinId, net] of Object.entries(component.pinNets)) {
      if (!definition.pins.some(pin => pin.id === pinId)) issues.push({ severity: "error", code: "UNKNOWN_PIN", componentId, message: `${componentId}: 정의에 없는 핀 ${pinId}입니다.` });
      if (typeof net !== "string" || !net.trim() || net.startsWith("__unconnected:")) issues.push({ severity: "error", code: "INVALID_NET", componentId, message: `${componentId}.${pinId}: 연결 이름이 올바르지 않습니다.` });
    }
  }
  const connections = new Set<string>();
  for (const connection of circuit.instruments) {
    if (connections.has(connection.id)) issues.push({ severity: "error", code: "DUPLICATE_CONNECTION", message: `${connection.id}: 계측기 연결 식별자가 중복되었습니다.` });
    connections.add(connection.id);
    if (!connection.netId?.trim() || connection.netId.startsWith("__unconnected:")) issues.push({ severity: "error", code: "INVALID_NET", message: `${connection.id}: 계측기 연결 이름이 올바르지 않습니다.` });
  }
  for (const item of circuit.reviewItems) if (!item.resolved) issues.push({ severity: "warning", code: "REVIEW_REQUIRED", message: item.message });
  return issues;
}

type Box = { x1: number; x2: number; y1: number; y2: number; componentId: string };
function bodyBox(placement: PlacedComponent, holes: Map<string, BoardHole>): Box | null {
  const points = Object.values(placement.pins).map(id => holes.get(id)).filter((hole): hole is BoardHole => Boolean(hole));
  if (!points.length) return null;
  return { x1: Math.min(...points.map(p => p.x)) - 7, x2: Math.max(...points.map(p => p.x)) + 7,
    y1: Math.min(...points.map(p => p.y)) - 7, y2: Math.max(...points.map(p => p.y)) + 7, componentId: placement.componentId };
}
function overlaps(a: Box, b: Box): boolean { return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1; }

function candidatePlacement(component: CircuitComponent, definition: ComponentDefinition, board: number, column: number, bottom: boolean): PlacedComponent {
  const pins: Record<string, string> = {};
  const kind = footprint(definition);
  if (kind === "dip") {
    const half = definition.pins.length / 2;
    // Top view, notch to the left: pin 1 at F, last pin at E.
    for (let index = 0; index < half; index++) {
      pins[String(index + 1)] = `B${board}:F${column + index}`;
      pins[String(definition.pins.length - index)] = `B${board}:E${column + index}`;
    }
  } else {
    const row = kind === "three" ? (bottom ? "H" : "C") : (bottom ? "I" : "B");
    const span = kind === "three" || (definition.kind === "connector" && /2\.54\s*mm/i.test(definition.package))
      ? 1 : ["resistor", "diode", "inductor"].includes(definition.kind) ? 4 : 2;
    definition.pins.forEach((pin, index) => { pins[pin.id] = `B${board}:${row}${column + index * span}`; });
  }
  return { componentId: component.id, pins };
}

function reservedGroups(placement: PlacedComponent, holes: Map<string, BoardHole>): string[] {
  const points = Object.values(placement.pins).map(id => holes.get(id)).filter((hole): hole is BoardHole => Boolean(hole));
  const groups = new Set<string>();
  if (!points.length) return [];
  const halves = new Set(points.map(point => ROWS.indexOf(point.row) < 5 ? "top" : "bottom"));
  for (const half of halves) for (let column = Math.min(...points.map(p => p.column)); column <= Math.max(...points.map(p => p.column)); column++) {
    groups.add(`B${points[0].board}:strip:${half}:${column}`);
  }
  return [...groups];
}

function netColor(netId: string, index: number): string {
  if (/^(?:gnd|ground|agnd|0)$/i.test(netId)) return "#334155";
  if (/^(?:vcc|vdd|v\+|\+)/i.test(netId)) return "#dc2626";
  if (/^(?:vee|vss|v-|\-)/i.test(netId)) return "#2563eb";
  return COLORS[index % COLORS.length];
}

/** Deterministic conservative placement, followed by a capacity-aware minimum spanning tree. */
export function createLayout(circuit: Circuit, definitions: ComponentDefinition[], options: BoardOptions): CircuitLayout {
  const board = createBoard(options);
  const layout: CircuitLayout = { board, placements: [], jumpers: [], terminals: [], issues: sourceIssues(circuit, definitions) };
  const holes = new Map(board.holes.map(hole => [hole.id, hole]));
  const groups = new Map<string, BoardHole[]>();
  for (const hole of board.holes) groups.set(hole.group, [...(groups.get(hole.group) ?? []), hole]);
  const occupied = new Set<string>(), blocked = new Set<string>();
  const netGroups = new Map<string, Set<string>>();
  const netPoints = new Map<string, BoardHole[]>();
  const addEndpoint = (net: string, hole: BoardHole) => {
    occupied.add(hole.id);
    if (!netGroups.has(net)) netGroups.set(net, new Set());
    netGroups.get(net)!.add(hole.group);
    netPoints.set(net, [...(netPoints.get(net) ?? []), hole]);
  };
  const ordered = [...circuit.components].sort((a, b) => {
    const da = definitions.find(d => d.id === a.definitionId), db = definitions.find(d => d.id === b.definitionId);
    return Number(db && footprint(db) === "dip") - Number(da && footprint(da) === "dip");
  });
  const placedIds = new Set<string>();
  for (const component of ordered) {
    const definition = definitions.find(item => item.id === component.definitionId);
    if (!definition || footprint(definition) === "unsupported" || placedIds.has(component.id)) continue;
    let best: { placement: PlacedComponent; groups: string[]; score: number } | undefined;
    for (let boardNumber = 1; boardNumber <= options.boards; boardNumber++) {
      for (const bottom of footprint(definition) === "dip" ? [false] : [false, true]) {
        for (let column = 1; column <= 63; column++) {
          const placement = candidatePlacement(component, definition, boardNumber, column, bottom);
          if (Object.values(placement.pins).some(id => !holes.has(id))) continue;
          const reserved = reservedGroups(placement, holes);
          if (reserved.some(group => blocked.has(group))) continue;
          let score = boardNumber * 0.01 + column * 0.0001 + Number(bottom) * 0.00001;
          for (const [pinId, holeId] of Object.entries(placement.pins)) {
            const point = holes.get(holeId)!;
            const prior = netPoints.get(pinNet(component, pinId));
            if (prior?.length) score += Math.min(...prior.map(other => Math.abs(point.x - other.x) + Math.abs(point.y - other.y)));
          }
          if (!best || score < best.score) best = { placement, groups: reserved, score };
        }
      }
    }
    if (!best) { layout.issues.push({ severity: "error", code: "PLACEMENT_CAPACITY", componentId: component.id, message: `${component.id}: 현재 보드에 간격을 확보하지 못했습니다. 보드를 추가하거나 회로를 나누세요.` }); continue; }
    placedIds.add(component.id); layout.placements.push(best.placement);
    best.groups.forEach(group => blocked.add(group));
    for (const [pinId, holeId] of Object.entries(best.placement.pins)) addEndpoint(pinNet(component, pinId), holes.get(holeId)!);
  }
  const seenConnections = new Set<string>();
  for (const connection of circuit.instruments) {
    if (seenConnections.has(connection.id)) continue;
    seenConnections.add(connection.id);
    const prior = netPoints.get(connection.netId) ?? [];
    const candidates = board.holes.filter(hole => (hole.row === "A" || hole.row === "J") && !blocked.has(hole.group));
    candidates.sort((a, b) => {
      const distance = (point: BoardHole) => prior.length ? Math.min(...prior.map(p => Math.abs(point.x - p.x) + Math.abs(point.y - p.y))) : point.board * 10000 + point.column;
      return distance(a) - distance(b);
    });
    const selected = candidates[0];
    if (!selected) { layout.issues.push({ severity: "error", code: "TERMINAL_CAPACITY", message: `${connection.instrument} ${connection.port}: 연결할 빈 구역이 없습니다.` }); continue; }
    blocked.add(selected.group); addEndpoint(connection.netId, selected);
    layout.terminals.push({ connectionId: connection.id, netId: connection.netId, holeId: selected.id });
  }
  const boxes = layout.placements.map(p => bodyBox(p, holes)).filter((box): box is Box => Boolean(box));
  const available = (group: string) => (groups.get(group) ?? []).filter(hole => !occupied.has(hole.id) &&
    !boxes.some(box => hole.x > box.x1 && hole.x < box.x2 && hole.y > box.y1 && hole.y < box.y2));
  let colorIndex = 0;
  for (const [netId, groupSet] of netGroups) {
    const members = [...groupSet];
    if (members.length < 2) continue;
    const edges: { a: string; b: string; distance: number }[] = [];
    for (let a = 0; a < members.length; a++) for (let b = a + 1; b < members.length; b++) {
      const left = groups.get(members[a])![0], right = groups.get(members[b])![0];
      edges.push({ a: members[a], b: members[b], distance: Math.abs(left.x - right.x) + Math.abs(left.y - right.y) });
    }
    edges.sort((a, b) => a.distance - b.distance || a.a.localeCompare(b.a) || a.b.localeCompare(b.b));
    const tree = new UnionFind();
    let count = 0;
    for (const edge of edges) {
      if (tree.find(edge.a) === tree.find(edge.b)) continue;
      let pair: { from: BoardHole; to: BoardHole; distance: number } | undefined;
      for (const from of available(edge.a)) for (const to of available(edge.b)) {
        const distance = Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
        if (!pair || distance < pair.distance) pair = { from, to, distance };
      }
      if (!pair) continue;
      occupied.add(pair.from.id); occupied.add(pair.to.id); tree.union(edge.a, edge.b); count++;
      layout.jumpers.push({ id: `W${layout.jumpers.length + 1}`, netId, from: pair.from.id, to: pair.to.id, color: netColor(netId, colorIndex) });
      if (count === members.length - 1) break;
    }
    if (count !== members.length - 1) layout.issues.push({ severity: "error", code: "ROUTING_CAPACITY", message: `${circuit.netNames[netId] ?? netId}: 점퍼를 꽂을 빈 홀이 부족하여 연결을 완성하지 못했습니다.` });
    colorIndex++;
  }
  return layout;
}

/** Reconstruct electrical connectivity from holes and actual wires; net labels cannot prove a connection. */
export function validateLayout(circuit: Circuit, definitions: ComponentDefinition[], layout: CircuitLayout): ValidationReport {
  const issues = sourceIssues(circuit, definitions);
  const board = createBoard(layout.board.options);
  const holes = new Map(board.holes.map(hole => [hole.id, hole]));
  const supplied = new Map(layout.board.holes.map(hole => [hole.id, hole]));
  if (supplied.size !== board.holes.length || layout.board.holes.length !== board.holes.length || board.holes.some(hole => {
    const stored = supplied.get(hole.id);
    return !stored || stored.group !== hole.group || stored.row !== hole.row || stored.column !== hole.column || stored.board !== hole.board || stored.x !== hole.x || stored.y !== hole.y;
  })) issues.push({ severity: "error", code: "BOARD_GEOMETRY", message: "빵판의 홀 또는 내부 연결 정보가 선택한 보드 프로필과 다릅니다." });
  const graph = new UnionFind(), first = new Map<string, string>(), occupants = new Map<string, string[]>();
  for (const hole of board.holes) { const prior = first.get(hole.group); if (prior) graph.union(prior, hole.id); else first.set(hole.group, hole.id); }
  const occupy = (holeId: string, owner: string, componentId?: string) => {
    if (!holes.has(holeId)) { issues.push({ severity: "error", code: "UNKNOWN_HOLE", componentId, message: `${owner}: 존재하지 않는 홀 ${holeId}입니다.` }); return false; }
    occupants.set(holeId, [...(occupants.get(holeId) ?? []), owner]); return true;
  };
  const endpoints: { net: string; holeId: string }[] = [];
  const placementIds = new Set<string>();
  for (const placement of layout.placements) {
    if (placementIds.has(placement.componentId)) issues.push({ severity: "error", code: "DUPLICATE_PLACEMENT", componentId: placement.componentId, message: `${placement.componentId}: 소자가 두 번 배치되었습니다.` });
    placementIds.add(placement.componentId);
    const component = circuit.components.find(item => item.id === placement.componentId);
    const definition = component && definitions.find(item => item.id === component.definitionId);
    if (!component || !definition) { issues.push({ severity: "error", code: "UNKNOWN_PLACEMENT", componentId: placement.componentId, message: `${placement.componentId}: 회로에 없는 소자 배치입니다.` }); continue; }
    for (const pin of definition.pins) if (!placement.pins[pin.id]) issues.push({ severity: "error", code: "MISSING_PIN", componentId: component.id, message: `${component.id}.${pin.id}: 물리 핀의 삽입 위치가 없습니다.` });
    for (const [pinId, holeId] of Object.entries(placement.pins)) {
      if (!definition.pins.some(pin => pin.id === pinId)) issues.push({ severity: "error", code: "UNKNOWN_PIN", componentId: component.id, message: `${component.id}.${pinId}: 정의에 없는 핀 배치입니다.` });
      if (occupy(holeId, `${component.id}.${pinId}`, component.id)) endpoints.push({ net: pinNet(component, pinId), holeId });
    }
    // A directly mounted package must retain its physical pin geometry.
    const placedHoles = Object.values(placement.pins).map(id => holes.get(id));
    if (placedHoles.every(Boolean) && placedHoles.length === definition.pins.length && footprint(definition) !== "unsupported") {
      const points = placedHoles as BoardHole[];
      const start = Math.min(...points.map(point => point.column));
      const bottom = ROWS.indexOf(points[0].row) >= 5;
      const expected = candidatePlacement(component, definition, points[0].board, start, bottom);
      if (Object.keys(expected.pins).some(pin => expected.pins[pin] !== placement.pins[pin])) issues.push({ severity: "error", code: "PIN_GEOMETRY", componentId: component.id, message: `${component.id}: 핀 간격·순서 또는 DIP 중앙골 배치가 맞지 않습니다.` });
    }
  }
  for (const component of circuit.components) if (!placementIds.has(component.id)) issues.push({ severity: "error", code: "MISSING_PLACEMENT", componentId: component.id, message: `${component.id}: 소자가 빵판에 배치되지 않았습니다.` });
  const terminalIds = new Set<string>();
  for (const terminal of layout.terminals) {
    if (terminalIds.has(terminal.connectionId)) issues.push({ severity: "error", code: "DUPLICATE_TERMINAL", message: `${terminal.connectionId}: 계측기 단자가 중복 배치되었습니다.` });
    terminalIds.add(terminal.connectionId);
    const connection = circuit.instruments.find(item => item.id === terminal.connectionId);
    if (!connection) { issues.push({ severity: "error", code: "UNKNOWN_TERMINAL", message: `${terminal.connectionId}: 회로에 없는 계측기 연결입니다.` }); continue; }
    if (terminal.netId !== connection.netId) issues.push({ severity: "error", code: "TERMINAL_NET_MISMATCH", message: `${terminal.connectionId}: 계측기 연결 이름이 목표 회로와 다릅니다.` });
    if (occupy(terminal.holeId, `${connection.instrument} ${connection.port}`)) endpoints.push({ net: connection.netId, holeId: terminal.holeId });
  }
  for (const connection of circuit.instruments) if (!terminalIds.has(connection.id)) issues.push({ severity: "error", code: "MISSING_TERMINAL", message: `${connection.instrument} ${connection.port}: 연결 위치가 없습니다.` });
  const wireIds = new Set<string>();
  for (const wire of layout.jumpers) {
    if (wireIds.has(wire.id)) issues.push({ severity: "error", code: "DUPLICATE_JUMPER", message: `${wire.id}: 점퍼 식별자가 중복되었습니다.` });
    wireIds.add(wire.id);
    const from = occupy(wire.from, `${wire.id} 시작`), to = occupy(wire.to, `${wire.id} 끝`);
    if (from && to) graph.union(wire.from, wire.to);
  }
  for (const [holeId, owners] of occupants) if (owners.length > 1) issues.push({ severity: "error", code: "OCCUPIED_HOLE", message: `${holeId}: ${owners.join(", ")}가 같은 홀을 사용합니다.` });
  const byRoot = new Map<string, Set<string>>(), byNet = new Map<string, Set<string>>();
  for (const endpoint of endpoints) {
    const root = graph.find(endpoint.holeId);
    if (!byRoot.has(root)) byRoot.set(root, new Set()); byRoot.get(root)!.add(endpoint.net);
    if (!byNet.has(endpoint.net)) byNet.set(endpoint.net, new Set()); byNet.get(endpoint.net)!.add(root);
  }
  for (const nets of byRoot.values()) if (nets.size > 1) issues.push({ severity: "error", code: "SHORT_CIRCUIT", message: `서로 다른 연결이 이어져 있습니다: ${[...nets].map(net => circuit.netNames[net] ?? net).join(", ")}` });
  for (const [net, roots] of byNet) if (roots.size > 1) issues.push({ severity: "error", code: "OPEN_CIRCUIT", message: `${circuit.netNames[net] ?? net}: ${roots.size}개로 끊어져 있습니다.` });
  for (const wire of layout.jumpers) {
    const actual = holes.has(wire.from) ? byRoot.get(graph.find(wire.from)) : undefined;
    if (actual?.size === 1 && !actual.has(wire.netId)) issues.push({ severity: "error", code: "JUMPER_NET_MISMATCH", message: `${wire.id}: 실제 연결과 점퍼의 표시 이름이 다릅니다.` });
    if (!actual?.size) issues.push({ severity: "warning", code: "UNUSED_JUMPER", message: `${wire.id}: 소자나 계측기와 연결되지 않은 점퍼입니다.` });
  }
  const boxes = layout.placements.map(placement => bodyBox(placement, holes)).filter((box): box is Box => Boolean(box));
  for (let a = 0; a < boxes.length; a++) for (let b = a + 1; b < boxes.length; b++) if (overlaps(boxes[a], boxes[b])) issues.push({ severity: "error", code: "BODY_COLLISION", componentId: boxes[b].componentId, message: `${boxes[a].componentId}와 ${boxes[b].componentId}의 장착 영역이 겹칩니다.` });
  return { valid: !issues.some(issue => issue.severity === "error"), issues,
    checkedPins: layout.placements.reduce((sum, placement) => sum + Object.keys(placement.pins).length, 0),
    checkedNets: [...byNet.keys()].filter(net => !net.startsWith("__unconnected:")).length };
}

export function createAssemblySteps(circuit: Circuit, definitions: ComponentDefinition[], layout: CircuitLayout): AssemblyStep[] {
  const steps: AssemblyStep[] = [];
  for (const placement of layout.placements) {
    const component = circuit.components.find(item => item.id === placement.componentId);
    const definition = component && definitions.find(item => item.id === component.definitionId);
    if (!component || !definition) continue;
    const pins = definition.pins.map(pin => `${pin.id}번 ${pin.label} → ${placement.pins[pin.id] ?? "미배치"}`).join(", ");
    steps.push({ id: `component:${component.id}`, componentId: component.id,
      title: `${component.id} · ${definition.name}${component.value ? ` · ${component.value}` : ""}`,
      description: `${pins}.${footprint(definition) === "dip" ? " 위에서 보았을 때 홈은 왼쪽, 1번 핀은 중앙골 아래쪽입니다." : " 핀 순서와 극성을 확인하고 꽂으세요."}`,
      holes: Object.values(placement.pins) });
  }
  for (const wire of layout.jumpers) steps.push({ id: `jumper:${wire.id}`, jumperId: wire.id, title: `${wire.id} · ${circuit.netNames[wire.netId] ?? wire.netId}`,
    description: `${wire.from}에서 ${wire.to}까지 점퍼를 연결하세요.`, holes: [wire.from, wire.to] });
  for (const terminal of layout.terminals) {
    const connection = circuit.instruments.find(item => item.id === terminal.connectionId);
    if (!connection) continue;
    steps.push({ id: `terminal:${connection.id}`, connectionId: connection.id, title: `${connection.instrument} · ${connection.port}`,
      description: `${terminal.holeId}에 연결하세요.${connection.setting ? ` 설정: ${connection.setting}.` : ""} 전원·출력을 켜기 전에 전체 연결을 확인하세요.`, holes: [terminal.holeId] });
  }
  return steps;
}
