import { runSimulation } from "./simulation";
import { createSimulationLayoutIndex } from "./simulation-layout";
import type { SimulationConfig, SimulationResult } from "./simulation-types";
import type { Circuit, CircuitLayout, ComponentDefinition } from "./types";

export type SimulationWorkerRequest = {
  type: "run";
  requestId: number;
  input: { circuit: Circuit; definitions: ComponentDefinition[]; layout: CircuitLayout; config: SimulationConfig };
};
export type SimulationWorkerResponse =
  | { type: "result"; requestId: number; result: SimulationResult }
  | { type: "error"; requestId: number; message: string };

// A dedicated worker keeps matrix solving off the editor's interaction thread.
// Terminating the worker cancels a run, including one already solving a matrix.
const scope = self as unknown as {
  onmessage: ((event: MessageEvent<SimulationWorkerRequest>) => void) | null;
  postMessage: (message: SimulationWorkerResponse) => void;
};
scope.onmessage = event => {
  const request = event.data;
  if (!request || request.type !== "run" || !Number.isSafeInteger(request.requestId)) return;
  try {
    const { circuit, definitions, layout, config } = request.input;
    createSimulationLayoutIndex(circuit, definitions, layout);
    const result = runSimulation(circuit, definitions, config);
    scope.postMessage({ type: "result", requestId: request.requestId, result });
  } catch (error) {
    scope.postMessage({ type: "error", requestId: request.requestId, message: error instanceof Error ? error.message : "회로 계산을 완료하지 못했습니다." });
  }
};
