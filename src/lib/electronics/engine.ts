import type {
  AssemblyStep, BoardGeometry, BoardHole, BoardOptions, Circuit, CircuitComponent,
  CircuitLayout, ComponentDefinition, PlacedComponent, TerminalPlacement, ValidationIssue, ValidationReport,
} from "./types";
import { getPowerNetRole, type PowerNetRole } from "./power";
import { BC109C_FORMED_GUIDANCE, hasBc109cFormedProfile, supportsBc109cForming } from "./physical-profiles";

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

type Footprint = "dip" | "two" | "three" | "to18-formed" | "unsupported";
function footprint(definition: ComponentDefinition, component?: CircuitComponent): Footprint {
  if (component?.physicalProfile !== undefined) return hasBc109cFormedProfile(component, definition) ? "to18-formed" : "unsupported";
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

// Preserve Array.find's first match even when malformed input contains duplicate IDs.
function indexById<T extends { id: string }>(items: T[]): Map<string, T> {
  const indexed = new Map<string, T>();
  for (const item of items) if (!indexed.has(item.id)) indexed.set(item.id, item);
  return indexed;
}

function nearestDistance(point: BoardHole, others: BoardHole[]): number {
  let distance = Infinity;
  for (const other of others) distance = Math.min(distance, Math.abs(point.x - other.x) + Math.abs(point.y - other.y));
  return distance;
}

function sourceIssues(circuit: Circuit, definitions: Map<string, ComponentDefinition>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const railPlan = assignPowerRails(circuit);
  for (const netId of railPlan.overflow) issues.push({ severity: "warning", code: "POWER_RAIL_CAPACITY", message: `${circuit.netNames[netId] ?? netId}: 독립 전원·접지 레일 4개를 초과하여 일반 점퍼로 연결합니다. 서로 다른 전원이나 접지를 같은 레일에 합치지 마세요.` });
  const seen = new Set<string>();
  for (const component of circuit.components) {
    const componentId = component.id;
    if (seen.has(componentId)) issues.push({ severity: "error", code: "DUPLICATE_COMPONENT", componentId, message: `${componentId}: 소자 식별자가 중복되었습니다.` });
    seen.add(componentId);
    const definition = definitions.get(component.definitionId);
    if (!definition) { issues.push({ severity: "error", code: "UNKNOWN_DEFINITION", componentId, message: `${componentId}: 소자 정의를 찾을 수 없습니다.` }); continue; }
    if (component.physicalProfile !== undefined && !hasBc109cFormedProfile(component, definition)) issues.push({ severity: "error", code: "INVALID_PHYSICAL_PROFILE", componentId, message: `${componentId}: 부품의 물리 배치 프로필과 핀 정의가 맞지 않습니다.` });
    else if (hasBc109cFormedProfile(component, definition)) issues.push({ severity: "warning", code: "LEAD_FORMING_REQUIRED", componentId, message: `${componentId}: ${BC109C_FORMED_GUIDANCE}` });
    else if (definition.mounting !== "direct") issues.push({ severity: "error", code: "UNSUPPORTED_MOUNTING", componentId,
      message: supportsBc109cForming(definition)
        ? `${componentId}: 원형 BC109C 리드는 빵판에 직접 꽂지 않습니다. 'BC109C 성형 적용'으로 앱이 정한 1번 E·2번 B·3번 C 성형 배치를 적용하면 자동 배치합니다.`
        : `${componentId}: ${definition.mounting === "adapter" ? "어댑터가" : "외부 연결이"} 필요한 소자입니다. 현재 자동 삽입 엔진에서는 지원하지 않습니다.` });
    else if (footprint(definition) === "unsupported") issues.push({ severity: "error", code: "UNSUPPORTED_FOOTPRINT", componentId, message: `${componentId}: ${definition.package}의 물리 핀 배치를 지원하지 않습니다.` });
    if (new Set(definition.pins.map(pin => pin.id)).size !== definition.pins.length) issues.push({ severity: "error", code: "DUPLICATE_PIN_DEFINITION", componentId, message: `${componentId}: 물리 핀 번호가 중복되었습니다.` });
    if (definition.pinoutStatus === "unverified") issues.push({ severity: "error", code: "PINOUT_UNVERIFIED", componentId, message: `${componentId}: 실제 품번·패키지의 핀 순서를 확인해야 합니다.` });
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
function bodyBox(placement: PlacedComponent, holes: Map<string, BoardHole>, component?: CircuitComponent, definition?: ComponentDefinition): Box | null {
  const points = Object.values(placement.pins).map(id => holes.get(id)).filter((hole): hole is BoardHole => Boolean(hole));
  if (!points.length) return null;
  if (component && definition && hasBc109cFormedProfile(component, definition)) {
    const emitter = holes.get(placement.pins["1"]), collector = holes.get(placement.pins["3"]);
    if (!emitter || !collector) return null;
    const x = (emitter.x + collector.x) / 2, y = emitter.y;
    // 5.45 mm flange + tab + working clearance, enclosing the formed leads.
    return { x1: x - 25, x2: x + 25, y1: y - 25, y2: y + 25, componentId: placement.componentId };
  }
  return { x1: Math.min(...points.map(p => p.x)) - 7, x2: Math.max(...points.map(p => p.x)) + 7,
    y1: Math.min(...points.map(p => p.y)) - 7, y2: Math.max(...points.map(p => p.y)) + 7, componentId: placement.componentId };
}
function overlaps(a: Box, b: Box): boolean { return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1; }

function candidatePlacement(component: CircuitComponent, definition: ComponentDefinition, board: number, column: number, bottom: boolean): PlacedComponent {
  const pins: Record<string, string> = {};
  const kind = footprint(definition, component);
  if (kind === "dip") {
    const half = definition.pins.length / 2;
    // Top view, notch to the left: pin 1 at F, last pin at E.
    for (let index = 0; index < half; index++) {
      pins[String(index + 1)] = `B${board}:F${column + index}`;
      pins[String(definition.pins.length - index)] = `B${board}:E${column + index}`;
    }
  } else if (kind === "to18-formed") {
    const row = bottom ? "H" : "C", baseRow = bottom ? "I" : "D";
    pins["1"] = `B${board}:${row}${column}`;
    pins["2"] = `B${board}:${baseRow}${column + 1}`;
    pins["3"] = `B${board}:${row}${column + 2}`;
  } else {
    const row = kind === "three" ? (bottom ? "H" : "C") : (bottom ? "I" : "B");
    const span = kind === "three" || (definition.kind === "connector" && /2\.54\s*mm/i.test(definition.package))
      ? 1 : ["resistor", "diode", "inductor"].includes(definition.kind) ? 4 : 2;
    definition.pins.forEach((pin, index) => { pins[pin.id] = `B${board}:${row}${column + index * span}`; });
  }
  return { componentId: component.id, pins };
}

function flexibleLeadSpan(definition: ComponentDefinition): { min: number; max: number } | null {
  if (footprint(definition) !== "two") return null;
  if (["resistor", "diode", "inductor"].includes(definition.kind)) return { min: 2, max: 8 };
  if (["capacitor", "electrolytic", "led"].includes(definition.kind)) return { min: 1, max: 4 };
  return null;
}

function nominalPlacementMatches(component: CircuitComponent, definition: ComponentDefinition, placement: PlacedComponent, points: BoardHole[]): boolean {
  const expected = candidatePlacement(component, definition, points[0].board, Math.min(...points.map(point => point.column)), ROWS.indexOf(points[0].row) >= 5);
  if (footprint(definition) !== "dip") {
    for (const pin of definition.pins) expected.pins[pin.id] = expected.pins[pin.id].replace(/:[A-J]/, `:${points[0].row}`);
  }
  return definition.pins.every(pin => expected.pins[pin.id] === placement.pins[pin.id]);
}

function physicalPlacementMatches(component: CircuitComponent, definition: ComponentDefinition, placement: PlacedComponent, holes: Map<string, BoardHole>): boolean {
  if (footprint(definition, component) === "unsupported" || placement.componentId !== component.id || Object.keys(placement.pins).length !== definition.pins.length) return false;
  const points = definition.pins.map(pin => holes.get(placement.pins[pin.id]));
  if (!points.length || points.some(point => !point)) return false;
  const existing = points as BoardHole[];
  if (existing.some(point => point.board !== existing[0].board || !ROWS.includes(point.row) || point.row.length !== 1)) return false;
  if (hasBc109cFormedProfile(component, definition)) {
    const emitter = holes.get(placement.pins["1"])!, base = holes.get(placement.pins["2"])!, collector = holes.get(placement.pins["3"])!;
    const row = ROWS.indexOf(emitter.row);
    return base.column === emitter.column + 1 && collector.column === emitter.column + 2 &&
      collector.row === emitter.row && ROWS.indexOf(base.row) === row + 1 &&
      (row < 5) === (ROWS.indexOf(base.row) < 5);
  }
  const span = flexibleLeadSpan(definition);
  if (span) {
    const [a, b] = existing;
    // Conservative lead-forming allowance, not a claim about an individual part's
    // lead length. Never insert both leads into one connected five-hole strip.
    if (a.group === b.group || (ROWS.indexOf(a.row) < 5) !== (ROWS.indexOf(b.row) < 5)) return false;
    const distanceSquared = ((a.x - b.x) / PITCH) ** 2 + ((a.y - b.y) / PITCH) ** 2;
    return distanceSquared >= span.min ** 2 && distanceSquared <= span.max ** 2;
  }
  return nominalPlacementMatches(component, definition, placement, existing);
}

/** Move only one flexible lead. Other packages must be moved by their body. */
export function moveComponentPinPlacement(component: CircuitComponent, definition: ComponentDefinition, current: PlacedComponent, targetHoleId: string, pinId: string, board: BoardGeometry): PlacedComponent {
  const span = flexibleLeadSpan(definition);
  if (!span) throw new Error("이 소자는 핀 간격이 고정된 패키지입니다. DIP·헤더·3핀 소자는 다리 하나를 옮길 수 없으므로 몸통을 끌어 전체 이동하세요.");
  const canonical = createBoard(board.options);
  const holes = new Map(canonical.holes.map(hole => [hole.id, hole]));
  if (!physicalPlacementMatches(component, definition, current, holes)) throw new Error("현재 소자의 물리 핀 배치가 올바르지 않습니다. 전체 자동 배치 후 이동하세요.");
  if (!definition.pins.some(pin => pin.id === pinId)) throw new Error("소자에 존재하지 않는 핀입니다.");
  const moved = { componentId: component.id, pins: { ...current.pins, [pinId]: targetHoleId } };
  if (!physicalPlacementMatches(component, definition, moved, holes)) throw new Error(`한 핀 이동은 같은 보드의 같은 A–E 또는 F–J 영역에서만 가능합니다. 두 핀은 서로 다른 연결 열에 ${span.min}~${span.max}칸 거리로 놓으세요. 전원 레일·중앙골 건너편·같은 연결 열에는 옮길 수 없습니다.`);
  return moved;
}

/** Translate the whole footprint, preserving any supported lead-forming shape. */
export function moveComponentPlacement(component: CircuitComponent, definition: ComponentDefinition, current: PlacedComponent, targetAnchorHoleId: string, anchorPinId: string, board: BoardGeometry): PlacedComponent {
  const canonical = createBoard(board.options);
  const holes = new Map(canonical.holes.map(hole => [hole.id, hole]));
  if (!physicalPlacementMatches(component, definition, current, holes)) throw new Error("현재 소자의 물리 핀 배치가 올바르지 않습니다. 전체 자동 배치 후 이동하세요.");
  const anchor = holes.get(current.pins[anchorPinId]), target = holes.get(targetAnchorHoleId);
  if (!anchor || !target || target.row.length !== 1 || !ROWS.includes(target.row)) throw new Error("소자의 핀과 일반 연결 구멍을 선택하세요. 소자 몸체는 전원 레일에 놓을 수 없습니다.");
  const dip = footprint(definition) === "dip";
  if (dip && target.row !== anchor.row) throw new Error("DIP 소자는 중앙골을 가로질러야 합니다. 선택한 핀을 같은 E/F 행에서 이동하세요.");
  const delta = target.column - anchor.column;
  const rowDelta = ROWS.indexOf(target.row) - ROWS.indexOf(anchor.row);
  const moved: PlacedComponent = { componentId: component.id, pins: Object.fromEntries(definition.pins.map(pin => {
    const before = holes.get(current.pins[pin.id])!;
    const row = dip ? before.row : ROWS[ROWS.indexOf(before.row) + rowDelta];
    return [pin.id, `B${target.board}:${row}${before.column + delta}`];
  })) };
  if (!physicalPlacementMatches(component, definition, moved, holes)) throw new Error("소자의 핀이 빵판 범위를 벗어나거나 핀 간격을 유지할 수 없습니다.");
  return moved;
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

function netColor(circuit: Circuit, netId: string, index: number): string {
  const role = getPowerNetRole(circuit, netId);
  if (role === "ground") return "#334155";
  if (role === "positive") return "#dc2626";
  if (role === "negative") return "#2563eb";
  return COLORS[index % COLORS.length];
}

function assignPowerRails(circuit: Circuit, reserved = new Map<string, string>()): { rows: Map<string, string>; overflow: string[] } {
  const nets = [...new Set([...circuit.components.flatMap(component => Object.values(component.pinNets)), ...circuit.instruments.map(connection => connection.netId)])];
  const netRoles = new Map(nets.map(net => [net, getPowerNetRole(circuit, net)]));
  const roles: PowerNetRole[] = ["ground", "positive", "negative"];
  const preferred: Record<PowerNetRole, string[]> = { ground: ["T-", "B-", "B+", "T+"], positive: ["T+", "B+", "T-", "B-"], negative: ["B-", "T-", "B+", "T+"] };
  const rows = new Map<string, string>(reserved), used = new Set<string>(reserved.values());
  // Reserve each role's usual row first, then allocate extra domains without merging them.
  for (const role of roles) {
    const net = nets.find(net => netRoles.get(net) === role);
    const row = preferred[role].find(row => !used.has(row));
    if (net && !rows.has(net) && row) { rows.set(net, row); used.add(row); }
  }
  const overflow: string[] = [];
  for (const net of nets) {
    const role = netRoles.get(net);
    if (!role || rows.has(net)) continue;
    const row = preferred[role].find(row => !used.has(row));
    if (row) { rows.set(net, row); used.add(row); } else overflow.push(net);
  }
  return { rows, overflow };
}

/** Deterministic conservative placement, followed by a capacity-aware minimum spanning tree. */
export type LayoutConstraints = { fixedPlacements?: PlacedComponent[]; fixedTerminals?: TerminalPlacement[] };

export function createLayout(circuit: Circuit, definitions: ComponentDefinition[], options: BoardOptions, constraints: LayoutConstraints = {}): CircuitLayout {
  const board = createBoard(options);
  const definitionById = indexById(definitions), componentById = indexById(circuit.components), connectionById = indexById(circuit.instruments);
  const layout: CircuitLayout = { board, placements: [], jumpers: [], terminals: [], issues: sourceIssues(circuit, definitionById) };
  const holes = new Map(board.holes.map(hole => [hole.id, hole]));
  const groups = new Map<string, BoardHole[]>();
  const railHoles = new Map<string, BoardHole[]>(), terminalHoles: BoardHole[] = [];
  for (const hole of board.holes) {
    if (!groups.has(hole.group)) groups.set(hole.group, []);
    groups.get(hole.group)!.push(hole);
    if (hole.row.length > 1) {
      if (!railHoles.has(hole.row)) railHoles.set(hole.row, []);
      railHoles.get(hole.row)!.push(hole);
    } else if (hole.row === "A" || hole.row === "J") terminalHoles.push(hole);
  }
  const occupied = new Set<string>(), blocked = new Set<string>();
  const fixedTerminals = constraints.fixedTerminals ?? [];
  const fixedPlacements = constraints.fixedPlacements ?? [];
  const reservedRails = new Map<string, string>();
  const fixedConnectionIds = new Set<string>();
  for (const terminal of fixedTerminals) {
    const connection = connectionById.get(terminal.connectionId), hole = holes.get(terminal.holeId);
    if (!connection || !hole || terminal.netId !== connection.netId || fixedConnectionIds.has(terminal.connectionId)) throw new Error("고정할 계측기 단자 또는 구멍 정보가 올바르지 않습니다.");
    fixedConnectionIds.add(terminal.connectionId);
    if (hole.group.includes(":rail:")) {
      if ([...reservedRails].some(([net, row]) => row === hole.row && net !== terminal.netId) || (reservedRails.has(terminal.netId) && reservedRails.get(terminal.netId) !== hole.row)) throw new Error("고정한 단자들이 같은 레일에 서로 다른 연결을 요구하거나 한 전원을 여러 레일에 중복 지정했습니다.");
      reservedRails.set(terminal.netId, hole.row);
    }
  }
  const railRows = assignPowerRails(circuit, reservedRails).rows;
  const netGroups = new Map<string, Set<string>>();
  const netPoints = new Map<string, BoardHole[]>();
  const addEndpoint = (net: string, hole: BoardHole) => {
    occupied.add(hole.id);
    if (!netGroups.has(net)) netGroups.set(net, new Set());
    netGroups.get(net)!.add(hole.group);
    if (!netPoints.has(net)) netPoints.set(net, []);
    netPoints.get(net)!.push(hole);
  };
  for (const terminal of fixedTerminals) {
    const hole = holes.get(terminal.holeId)!;
    if (occupied.has(hole.id) || (!hole.group.includes(":rail:") && blocked.has(hole.group))) throw new Error("고정한 계측기 단자의 삽입 위치가 서로 겹칩니다.");
    if (!hole.group.includes(":rail:")) blocked.add(hole.group);
    layout.terminals.push({ ...terminal }); addEndpoint(terminal.netId, hole);
  }
  const placedIds = new Set<string>();
  for (const placement of fixedPlacements) {
    const component = componentById.get(placement.componentId);
    const definition = component && definitionById.get(component.definitionId);
    if (!component || !definition || placedIds.has(placement.componentId) || !physicalPlacementMatches(component, definition, placement, holes)) throw new Error("고정할 소자의 핀 순서·간격·삽입 위치가 올바르지 않습니다.");
    const reserved = reservedGroups(placement, holes);
    if (reserved.some(group => blocked.has(group)) || Object.values(placement.pins).some(id => occupied.has(id))) throw new Error("고정한 소자의 장착 영역이 다른 고정 소자나 계측기와 겹칩니다.");
    const copy = { componentId: placement.componentId, pins: { ...placement.pins } };
    layout.placements.push(copy); placedIds.add(component.id); reserved.forEach(group => blocked.add(group));
    for (const [pinId, holeId] of Object.entries(copy.pins)) addEndpoint(pinNet(component, pinId), holes.get(holeId)!);
  }
  const ordered = [...circuit.components].sort((a, b) => {
    const da = definitionById.get(a.definitionId), db = definitionById.get(b.definitionId);
    return Number(db && footprint(db) === "dip") - Number(da && footprint(da) === "dip");
  });
  type Candidate = { pins: Record<string, string>; points: [string, BoardHole][]; groups: string[]; bias: number };
  // Identical packages share the same physical candidates. Net scores and occupancy
  // are still evaluated afresh, so fixed anchors and routing remain deterministic.
  const candidateCache = new Map<string, Candidate[]>();
  const candidatesFor = (component: CircuitComponent, definition: ComponentDefinition): Candidate[] => {
    const cacheKey = `${definition.id}:${component.physicalProfile ?? "original"}`;
    const cached = candidateCache.get(cacheKey);
    if (cached) return cached;
    const candidates: Candidate[] = [];
    for (let boardNumber = 1; boardNumber <= options.boards; boardNumber++) {
      for (const bottom of footprint(definition) === "dip" ? [false] : [false, true]) {
        for (let column = 1; column <= 63; column++) {
          const placement = candidatePlacement(component, definition, boardNumber, column, bottom);
          if (Object.values(placement.pins).some(id => !holes.has(id))) continue;
          candidates.push({ pins: placement.pins, points: Object.entries(placement.pins).map(([pin, id]) => [pin, holes.get(id)!]),
            groups: reservedGroups(placement, holes), bias: boardNumber * 0.01 + column * 0.0001 + Number(bottom) * 0.00001 });
        }
      }
    }
    candidateCache.set(cacheKey, candidates);
    return candidates;
  };
  for (const component of ordered) {
    const definition = definitionById.get(component.definitionId);
    if (!definition || footprint(definition, component) === "unsupported" || placedIds.has(component.id)) continue;
    let best: Candidate | undefined, bestScore = Infinity;
    const priorPoints = new Map(definition.pins.map(pin => [pin.id, netPoints.get(pinNet(component, pin.id))]));
    for (const candidate of candidatesFor(component, definition)) {
      if (candidate.groups.some(group => blocked.has(group))) continue;
      let score = candidate.bias;
      for (const [pin, point] of candidate.points) {
        const prior = priorPoints.get(pin);
        if (prior?.length) score += nearestDistance(point, prior);
      }
      if (score < bestScore) { best = candidate; bestScore = score; }
    }
    if (!best) { layout.issues.push({ severity: "error", code: "PLACEMENT_CAPACITY", componentId: component.id, message: `${component.id}: 현재 보드에 간격을 확보하지 못했습니다. 보드를 추가하거나 회로를 나누세요.` }); continue; }
    const placement = { componentId: component.id, pins: { ...best.pins } };
    placedIds.add(component.id); layout.placements.push(placement);
    best.groups.forEach(group => blocked.add(group));
    for (const [pin, point] of best.points) addEndpoint(pinNet(component, pin), point);
  }
  const seenConnections = new Set<string>(fixedConnectionIds);
  for (const connection of circuit.instruments) {
    if (seenConnections.has(connection.id)) continue;
    seenConnections.add(connection.id);
    const prior = netPoints.get(connection.netId) ?? [];
    const railRow = railRows.get(connection.netId);
    let selected: BoardHole | undefined, bestDistance = Infinity;
    for (const point of railRow ? railHoles.get(railRow) ?? [] : terminalHoles) {
      if (railRow ? occupied.has(point.id) : blocked.has(point.group)) continue;
      const distance = prior.length ? nearestDistance(point, prior) : point.board * 10000 + point.column;
      // Strict comparison preserves the old stable-sort tie order.
      if (distance < bestDistance) { selected = point; bestDistance = distance; }
    }
    if (!selected) { layout.issues.push({ severity: "error", code: "TERMINAL_CAPACITY", message: `${connection.instrument} ${connection.port}: 연결할 빈 구역이 없습니다.` }); continue; }
    if (!railRow) blocked.add(selected.group);
    addEndpoint(connection.netId, selected);
    layout.terminals.push({ connectionId: connection.id, netId: connection.netId, holeId: selected.id });
  }
  const boxes = layout.placements.map(p => { const c = componentById.get(p.componentId); return bodyBox(p, holes, c, c && definitionById.get(c.definitionId)); }).filter((box): box is Box => Boolean(box));
  const exposed = new Map<string, BoardHole[]>();
  const available = (group: string) => {
    let contacts = exposed.get(group);
    if (!contacts) {
      contacts = (groups.get(group) ?? []).filter(hole => !boxes.some(box => hole.x > box.x1 && hole.x < box.x2 && hole.y > box.y1 && hole.y < box.y2));
      exposed.set(group, contacts);
    }
    return contacts.filter(hole => !occupied.has(hole.id));
  };
  let colorIndex = 0;
  for (const [netId, groupSet] of netGroups) {
    let members = [...groupSet];
    const row = railRows.get(netId);
    const color = netColor(circuit, netId, colorIndex);
    const connect = (from: BoardHole, to: BoardHole) => {
      occupied.add(from.id); occupied.add(to.id);
      layout.jumpers.push({ id: `W${layout.jumpers.length + 1}`, netId, from: from.id, to: to.id, color });
    };
    if (row) {
      const railGroups = new Set(members.filter(group => group.includes(":rail:")));
      // Feed every occupied component strip from its bus, instead of daisy-chaining supply pins.
      for (const group of members.filter(group => !group.includes(":rail:"))) {
        let pair: { from: BoardHole; to: BoardHole; distance: number } | undefined;
        const railCandidates = (railHoles.get(row) ?? []).filter(hole => !occupied.has(hole.id));
        const spare = new Map([...new Set(railCandidates.map(hole => hole.group))].map(group => [group, available(group).length]));
        for (const from of available(group)) {
          for (const to of railCandidates.filter(hole => hole.board === from.board)) {
            // Reserve contacts for split-rail and cross-board bridges.
            if ((spare.get(to.group) ?? 0) <= 2) continue;
            const distance = Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
            if (!pair || distance < pair.distance) pair = { from, to, distance };
          }
        }
        if (!pair) { layout.issues.push({ severity: "error", code: "ROUTING_CAPACITY", message: `${circuit.netNames[netId] ?? netId}: 전원 레일로 연결할 빈 홀이 부족합니다.` }); continue; }
        connect(pair.from, pair.to); railGroups.add(pair.to.group);
      }
      // Only segments actually used by a pin or terminal need a physical bridge.
      members = [...railGroups];
    }
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
      const fromContacts = available(edge.a), toContacts = available(edge.b);
      for (const from of fromContacts) for (const to of toContacts) {
        const distance = Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
        if (!pair || distance < pair.distance) pair = { from, to, distance };
      }
      if (!pair) continue;
      connect(pair.from, pair.to); tree.union(edge.a, edge.b); count++;
      if (count === members.length - 1) break;
    }
    if (count !== members.length - 1) layout.issues.push({ severity: "error", code: "ROUTING_CAPACITY", message: `${circuit.netNames[netId] ?? netId}: 점퍼를 꽂을 빈 홀이 부족하여 연결을 완성하지 못했습니다.` });
    colorIndex++;
  }
  return layout;
}

/** Reconstruct electrical connectivity from holes and actual wires; net labels cannot prove a connection. */
export function validateLayout(circuit: Circuit, definitions: ComponentDefinition[], layout: CircuitLayout): ValidationReport {
  const definitionById = indexById(definitions), componentById = indexById(circuit.components), connectionById = indexById(circuit.instruments);
  const issues = sourceIssues(circuit, definitionById);
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
    if (!occupants.has(holeId)) occupants.set(holeId, []);
    occupants.get(holeId)!.push(owner); return true;
  };
  const endpoints: { net: string; holeId: string }[] = [];
  const placementIds = new Set<string>();
  for (const placement of layout.placements) {
    if (placementIds.has(placement.componentId)) issues.push({ severity: "error", code: "DUPLICATE_PLACEMENT", componentId: placement.componentId, message: `${placement.componentId}: 소자가 두 번 배치되었습니다.` });
    placementIds.add(placement.componentId);
    const component = componentById.get(placement.componentId);
    const definition = component && definitionById.get(component.definitionId);
    if (!component || !definition) { issues.push({ severity: "error", code: "UNKNOWN_PLACEMENT", componentId: placement.componentId, message: `${placement.componentId}: 회로에 없는 소자 배치입니다.` }); continue; }
    for (const pin of definition.pins) if (!placement.pins[pin.id]) issues.push({ severity: "error", code: "MISSING_PIN", componentId: component.id, message: `${component.id}.${pin.id}: 물리 핀의 삽입 위치가 없습니다.` });
    for (const [pinId, holeId] of Object.entries(placement.pins)) {
      if (!definition.pins.some(pin => pin.id === pinId)) issues.push({ severity: "error", code: "UNKNOWN_PIN", componentId: component.id, message: `${component.id}.${pinId}: 정의에 없는 핀 배치입니다.` });
      if (occupy(holeId, `${component.id}.${pinId}`, component.id)) endpoints.push({ net: pinNet(component, pinId), holeId });
    }
    // A directly mounted package must retain its physical pin geometry.
    const placedHoles = Object.values(placement.pins).map(id => holes.get(id));
    if (placedHoles.every(Boolean) && placedHoles.length === definition.pins.length && footprint(definition, component) !== "unsupported") {
      if (!physicalPlacementMatches(component, definition, placement, holes)) issues.push({ severity: "error", code: "PIN_GEOMETRY", componentId: component.id, message: `${component.id}: 핀 간격·순서 또는 DIP 중앙골 배치가 맞지 않습니다.` });
      else if (flexibleLeadSpan(definition) && !nominalPlacementMatches(component, definition, placement, definition.pins.map(pin => holes.get(placement.pins[pin.id])!))) issues.push({ severity: "warning", code: "LEAD_FORMING_REQUIRED", componentId: component.id, message: `${component.id}: 기본 핀 간격을 변경했습니다. 실제 소자의 리드 길이·몸체 크기·절연 간격을 확인한 뒤 다리를 성형하세요.` });
    }
  }
  for (const component of circuit.components) if (!placementIds.has(component.id)) issues.push({ severity: "error", code: "MISSING_PLACEMENT", componentId: component.id, message: `${component.id}: 소자가 빵판에 배치되지 않았습니다.` });
  const terminalIds = new Set<string>();
  for (const terminal of layout.terminals) {
    if (terminalIds.has(terminal.connectionId)) issues.push({ severity: "error", code: "DUPLICATE_TERMINAL", message: `${terminal.connectionId}: 계측기 단자가 중복 배치되었습니다.` });
    terminalIds.add(terminal.connectionId);
    const connection = connectionById.get(terminal.connectionId);
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
  const railRoots = new Set(board.holes.filter(hole => hole.group.includes(":rail:")).map(hole => graph.find(hole.id)));
  const plannedRails = assignPowerRails(circuit).rows;
  for (const [net, roots] of byNet) if (plannedRails.has(net) && [...roots].some(root => !railRoots.has(root))) {
    issues.push({ severity: "warning", code: "POWER_RAIL_UNUSED", message: `${circuit.netNames[net] ?? net}: 전원·접지 연결 중 레일을 사용하지 않는 구역이 있습니다. 전체 자동 배치로 레일 배선을 만들 수 있습니다.` });
  }
  for (const wire of layout.jumpers) {
    const actual = holes.has(wire.from) ? byRoot.get(graph.find(wire.from)) : undefined;
    if (actual?.size === 1 && !actual.has(wire.netId)) issues.push({ severity: "error", code: "JUMPER_NET_MISMATCH", message: `${wire.id}: 실제 연결과 점퍼의 표시 이름이 다릅니다.` });
    if (!actual?.size) issues.push({ severity: "warning", code: "UNUSED_JUMPER", message: `${wire.id}: 소자나 계측기와 연결되지 않은 점퍼입니다.` });
  }
  const boxes = layout.placements.map(placement => { const c = componentById.get(placement.componentId); return bodyBox(placement, holes, c, c && definitionById.get(c.definitionId)); }).filter((box): box is Box => Boolean(box));
  for (let a = 0; a < boxes.length; a++) for (let b = a + 1; b < boxes.length; b++) if (overlaps(boxes[a], boxes[b])) issues.push({ severity: "error", code: "BODY_COLLISION", componentId: boxes[b].componentId, message: `${boxes[a].componentId}와 ${boxes[b].componentId}의 장착 영역이 겹칩니다.` });
  const connectionHoles = [...layout.terminals.map(terminal => terminal.holeId), ...layout.jumpers.flatMap(wire => [wire.from, wire.to])];
  for (const box of boxes) {
    const component = componentById.get(box.componentId), definition = component && definitionById.get(component.definitionId);
    if (!component || !definition || !hasBc109cFormedProfile(component, definition)) continue;
    if (connectionHoles.some(id => { const hole = holes.get(id); return hole && hole.x > box.x1 && hole.x < box.x2 && hole.y > box.y1 && hole.y < box.y2; })) {
      issues.push({ severity: "error", code: "BODY_CLEARANCE", componentId: component.id, message: `${component.id}: TO-18 금속 캔의 여유 영역에 점퍼 또는 계측기 삽입점이 있습니다. 같은 연결 열의 노출된 구멍으로 옮기세요.` });
    }
  }
  return { valid: !issues.some(issue => issue.severity === "error"), issues,
    checkedPins: layout.placements.reduce((sum, placement) => sum + Object.keys(placement.pins).length, 0),
    checkedNets: [...byNet.keys()].filter(net => !net.startsWith("__unconnected:")).length };
}

export function createAssemblySteps(circuit: Circuit, definitions: ComponentDefinition[], layout: CircuitLayout): AssemblyStep[] {
  const steps: AssemblyStep[] = [];
  const definitionById = indexById(definitions), componentById = indexById(circuit.components), connectionById = indexById(circuit.instruments);
  for (const placement of layout.placements) {
    const component = componentById.get(placement.componentId);
    const definition = component && definitionById.get(component.definitionId);
    if (!component || !definition) continue;
    const pins = definition.pins.map(pin => `${pin.id}번 ${pin.label} → ${placement.pins[pin.id] ?? "미배치"}`).join(", ");
    steps.push({ id: `component:${component.id}`, componentId: component.id,
      title: `${component.id} · ${definition.name}${component.value ? ` · ${component.value}` : ""}`,
      description: `${pins}. ${hasBc109cFormedProfile(component, definition) ? BC109C_FORMED_GUIDANCE : footprint(definition) === "dip" ? "위에서 보았을 때 홈은 왼쪽, 1번 핀은 중앙골 아래쪽입니다." : "핀 순서와 극성을 확인하고 꽂으세요."}`,
      holes: Object.values(placement.pins) });
  }
  const holes = new Map(layout.board.holes.map(hole => [hole.id, hole]));
  const railEnds = (wire: CircuitLayout["jumpers"][number]) => [holes.get(wire.from), holes.get(wire.to)].filter(hole => hole?.group.includes(":rail:")).length;
  const wires = [...layout.jumpers].sort((a, b) => railEnds(b) - railEnds(a));
  for (const wire of wires) {
    const role = getPowerNetRole(circuit, wire.netId);
    const label = role === "ground" ? "GND 기준" : role === "positive" ? "+전원" : role === "negative" ? "−전원 (GND와 별도)" : "";
    const from = holes.get(wire.from), to = holes.get(wire.to);
    const railCount = railEnds(wire);
    const action = railCount === 2 ? from?.board !== to?.board ? "보드 간 레일 연결" : from?.row !== to?.row ? "레일 사이 연결" : "분리 레일 연결" : railCount === 1 ? "레일 연결" : "점퍼 연결";
    steps.push({ id: `jumper:${wire.id}`, jumperId: wire.id, title: `${wire.id} · ${circuit.netNames[wire.netId] ?? wire.netId} · ${action}`,
      description: `${wire.from}에서 ${wire.to}까지 점퍼를 연결하세요.${label ? ` ${label} 배선입니다.` : ""}${railCount === 2 ? " 같은 전원·접지의 분리 구간만 이어주세요. 일반 830홀 모델에서는 이 점퍼가 없으면 레일 구간이 서로 연결되지 않습니다. 실물 빵판의 레일이 중간에서 끊겨 있는지 조립 전에 도통을 확인하세요." : ""}`, holes: [wire.from, wire.to] });
  }
  const terminalOrder = (netId: string) => { const role = getPowerNetRole(circuit, netId); return role === "ground" ? 0 : role ? 2 : 1; };
  for (const terminal of [...layout.terminals].sort((a, b) => terminalOrder(a.netId) - terminalOrder(b.netId))) {
    const connection = connectionById.get(terminal.connectionId);
    if (!connection) continue;
    const role = getPowerNetRole(circuit, connection.netId);
    const rail = holes.get(terminal.holeId)?.group.includes(":rail:");
    steps.push({ id: `terminal:${connection.id}`, connectionId: connection.id, title: `${connection.instrument} · ${connection.port}`,
      description: `${terminal.holeId}${rail ? ` ${role === "ground" ? "GND 기준" : role === "negative" ? "−전원" : role === "positive" ? "+전원" : circuit.netNames[connection.netId] ?? connection.netId} 레일` : ""}에 연결하세요.${connection.setting ? ` 설정: ${connection.setting}.` : ""}${role === "negative" ? " −전원은 GND(0 V)와 다릅니다." : ""} 전원·신호 출력을 끈 상태로 연결하고, 전체 배선 확인 후 켜세요.`, holes: [terminal.holeId] });
  }
  return steps;
}
