import { COMPONENT_CATALOG } from "./catalog";
import { buildLab5ReferenceCase } from "./lab5-reference";
import type { Lab5WorkerRequest, Lab5WorkerResponse } from "./lab5-reference";
import { runSimulation } from "./simulation";

// A separate, explicitly schematic-only tool. The breadboard worker and its
// physical validation remain unchanged; this accepts only built-in case IDs.
const scope = self as unknown as { onmessage: ((event: MessageEvent<Lab5WorkerRequest>) => void) | null; postMessage: (message: Lab5WorkerResponse) => void };
scope.onmessage = event => {
  const request = event.data;
  if (!request || request.type !== "run" || !Number.isSafeInteger(request.requestId)) return;
  try {
    const { circuit, config } = buildLab5ReferenceCase(request.caseId, request.ratio);
    scope.postMessage({ type: "result", requestId: request.requestId, result: runSimulation(circuit, COMPONENT_CATALOG, config) });
  } catch (error) { scope.postMessage({ type: "error", requestId: request.requestId, message: error instanceof Error ? error.message : "Lab 5 계산을 완료하지 못했습니다." }); }
};
