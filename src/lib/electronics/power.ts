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
  // Rebuild conductive group identities from the supported profile instead of trusting stored topology.
  for (let board = 1; board <= layout.board.options.boards; board++) {
    for (const row of "ABCDEFGHIJ") for (let column = 1; column <= 63; column++) {
      groups.set(`B${board}:${row}${column}`, `B${board}:strip:${"ABCDE".includes(row) ? "top" : "bottom"}:${column}`);
    }
    for (const row of ["T+", "T-", "B+", "B-"]) for (let column = 1; column <= 50; column++) {
      const segment = layout.board.options.railMode === "continuous" ? "all" : column <= 25 ? "left" : "right";
      const group = `B${board}:rail:${row}:${segment}`;
      groups.set(`B${board}:${row}${column}`, group); rails.set(group, { board, row });
    }
  }
  const parents = new Map<string, string>();
  const find = (group: string): string => {
    const parent = parents.get(group);
    if (!parent || parent === group) return group;
    const root = find(parent); parents.set(group, root); return root;
  };
  for (const wire of layout.jumpers) {
    const from = groups.get(wire.from), to = groups.get(wire.to);
    if (from && to) parents.set(find(from), find(to));
  }
  const nets = new Map<string, Set<string>>();
  const endpoint = (holeId: string, net: string | undefined) => {
    const group = groups.get(holeId);
    if (!group || !net) return;
    const root = find(group);
    if (!nets.has(root)) nets.set(root, new Set());
    nets.get(root)!.add(net);
  };
  for (const placement of layout.placements) {
    const component = circuit.components.find(item => item.id === placement.componentId);
    if (component) for (const [pin, holeId] of Object.entries(placement.pins)) endpoint(holeId, component.pinNets[pin]);
  }
  for (const terminal of layout.terminals) endpoint(terminal.holeId, circuit.instruments.find(item => item.id === terminal.connectionId)?.netId);
  return [...rails].flatMap(([group, { board, row }]) => {
    const netIds = [...(nets.get(find(group)) ?? [])].sort();
    return netIds.length ? [{ group, board, row, netIds, role: netIds.length === 1 ? getPowerNetRole(circuit, netIds[0]) : null }] : [];
  });
}
