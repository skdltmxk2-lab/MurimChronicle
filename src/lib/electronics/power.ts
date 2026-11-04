import type { Circuit, CircuitLayout } from "./types";

export type PowerNetRole = "positive" | "negative" | "ground";
export type RailUsage = { group: string; board: number; row: string; netIds: string[]; role: PowerNetRole | null };

function namedRole(value: string): PowerNetRole | null {
  const name = value.trim().replace(/[−–]/g, "-").replace(/\s+/g, " ").toUpperCase();
  if (/^(?:GND|GROUND|AGND|DGND|PGND)(?:[_:][A-Z0-9_.-]+)?$/.test(name) || /^(?:[+-]?0(?:\.0+)?(?:\s*V)?|접지|그라운드|공통 기준(?:\s*0(?:\.0+)?\s*V)?|GND\s*\(0(?:\.0+)?\s*V\))$/.test(name)) return "ground";
  if (/^(?:VCC|VDD|V\+|VS\+|VBAT)(?:[_:]\d+(?:[._]\d+)?V?)?$/.test(name) || /^\+?\d+(?:\.\d+)?\s*V$/.test(name)) return "positive";
  if (/^(?:VEE|V-|VS-)(?:[_:]\d+(?:[._]\d+)?V?)?$/.test(name) || /^-\d+(?:\.\d+)?\s*V$/.test(name)) return "negative";
  return null;
}

/** Only explicit net names identify rails; a differential '-' port and VSS are ambiguous. */
export function getPowerNetRole(circuit: Circuit, netId: string): PowerNetRole | null {
  const idRole = namedRole(netId), displayRole = namedRole(circuit.netNames[netId] ?? "");
  return idRole && displayRole && idRole !== displayRole ? null : idRole ?? displayRole;
}

/** Infer rail labels from physical connectivity, never from a jumper's claimed netId. */
export function getRailUsage(circuit: Circuit, layout: CircuitLayout): RailUsage[] {
  const groups = new Map<string, string>();
  const rails = new Map<string, { board: number; row: string }>();
  // Derive only the contacts actually used, from the canonical profile rather
  // than stored topology. Empty holes no longer need indexing on every render.
  const groupFor = (holeId: string): string | undefined => {
    const cached = groups.get(holeId);
    if (cached) return cached;
    const match = /^B([1-9]\d*):([A-J]|[TB][+-])([1-9]\d?)$/.exec(holeId);
    if (!match) return undefined;
    const board = Number(match[1]), row = match[2], column = Number(match[3]);
    if (board > layout.board.options.boards || column > (row.length === 1 ? 63 : 50)) return undefined;
    const segment = layout.board.options.railMode === "continuous" ? "all" : column <= 25 ? "left" : "right";
    const group = row.length === 1 ? `B${board}:strip:${"ABCDE".includes(row) ? "top" : "bottom"}:${column}` : `B${board}:rail:${row}:${segment}`;
    groups.set(holeId, group);
    return group;
  };
  for (let board = 1; board <= layout.board.options.boards; board++) {
    for (const row of ["T+", "T-", "B+", "B-"]) for (const segment of layout.board.options.railMode === "continuous" ? ["all"] : ["left", "right"]) {
      const group = `B${board}:rail:${row}:${segment}`;
      rails.set(group, { board, row });
    }
  }
  const parents = new Map<string, string>();
  const find = (group: string): string => {
    const parent = parents.get(group);
    if (!parent || parent === group) return group;
    const root = find(parent); parents.set(group, root); return root;
  };
  for (const wire of layout.jumpers) {
    const from = groupFor(wire.from), to = groupFor(wire.to);
    if (from && to) parents.set(find(from), find(to));
  }
  const nets = new Map<string, Set<string>>();
  const endpoint = (holeId: string, net: string | undefined) => {
    const group = groupFor(holeId);
    if (!group || !net) return;
    const root = find(group);
    if (!nets.has(root)) nets.set(root, new Set());
    nets.get(root)!.add(net);
  };
  const components = new Map<string, Circuit["components"][number]>(), connections = new Map<string, Circuit["instruments"][number]>();
  for (const component of circuit.components) if (!components.has(component.id)) components.set(component.id, component);
  for (const connection of circuit.instruments) if (!connections.has(connection.id)) connections.set(connection.id, connection);
  for (const placement of layout.placements) {
    const component = components.get(placement.componentId);
    if (component) for (const [pin, holeId] of Object.entries(placement.pins)) endpoint(holeId, component.pinNets[pin]);
  }
  for (const terminal of layout.terminals) endpoint(terminal.holeId, connections.get(terminal.connectionId)?.netId);
  return [...rails].flatMap(([group, { board, row }]) => {
    const netIds = [...(nets.get(find(group)) ?? [])].sort();
    return netIds.length ? [{ group, board, row, netIds, role: netIds.length === 1 ? getPowerNetRole(circuit, netIds[0]) : null }] : [];
  });
}
