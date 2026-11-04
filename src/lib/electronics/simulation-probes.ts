import { createSimulationLayoutIndex } from "./simulation-layout";
import type { Circuit, CircuitLayout, ComponentDefinition } from "./types";

export type SimulationProbe = { holeId: string | null; netId: string | null };
export type ProbeHoles = [string | null, string | null];

/** Initial channel positions only. Subsequent edits keep the probes at their holes. */
export function defaultProbeHoles(circuit: Circuit, layout: CircuitLayout): ProbeHoles {
  const pairedOutput = Object.hasOwn(circuit.netNames, "OUT1") && Object.hasOwn(circuit.netNames, "OUT2");
  const input = pairedOutput ? "OUT1" : circuit.instruments.find(connection => connection.id === "fg-signal")?.netId || ["IN", "RF", "BIAS", "VCC"].find(net => Object.hasOwn(circuit.netNames, net)) || "IN";
  const output = pairedOutput ? "OUT2" : ["OUT", "DRAIN", "D1"].find(net => Object.hasOwn(circuit.netNames, net)) || input;
  const atNet = (netId: string) => {
    const terminal = layout.terminals.find(terminal => circuit.instruments.find(connection => connection.id === terminal.connectionId)?.netId === netId);
    if (terminal) return terminal.holeId;
    for (const placement of layout.placements) {
      const component = circuit.components.find(component => component.id === placement.componentId);
      const pin = component && Object.keys(placement.pins).find(pin => component.pinNets[pin] === netId);
      if (pin) return placement.pins[pin];
    }
    return null;
  };
  return [atNet(input), atNet(output)];
}

export function resolveSimulationProbes(circuit: Circuit, definitions: ComponentDefinition[], layout: CircuitLayout, holes: ProbeHoles): [SimulationProbe, SimulationProbe] {
  let index: ReturnType<typeof createSimulationLayoutIndex>;
  try { index = createSimulationLayoutIndex(circuit, definitions, layout); }
  catch { return holes.map(holeId => ({ holeId, netId: null })) as [SimulationProbe, SimulationProbe]; }
  return holes.map(holeId => {
    try { return { holeId, netId: holeId ? index.netForHole(holeId) : null }; }
    catch { return { holeId, netId: null }; }
  }) as [SimulationProbe, SimulationProbe];
}
