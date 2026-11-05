import { COMPONENT_CATALOG } from "./catalog";
import { getVerificationInput } from "./course-verification";
import type { VerificationWorkerRequest, VerificationWorkerResponse } from "./course-verification";
import { runSimulation } from "./simulation";

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<VerificationWorkerRequest>) => void) | null;
  postMessage: (message: VerificationWorkerResponse) => void;
};
scope.onmessage = event => {
  const request = event.data;
  if (!request || request.type !== "run" || !Number.isSafeInteger(request.requestId) || typeof request.caseId !== "string") return;
  try {
    const input = getVerificationInput(request.caseId);
    if (!input || input.blockedReason) throw new Error(input?.blockedReason ?? "등록된 실험 조건을 선택하세요.");
    const result = runSimulation(input.circuit, COMPONENT_CATALOG, input.config);
    scope.postMessage({ type: "result", requestId: request.requestId, caseId: request.caseId, result });
  } catch (error) {
    scope.postMessage({ type: "error", requestId: request.requestId, caseId: request.caseId, message: error instanceof Error ? error.message : "실험 회로 계산을 완료하지 못했습니다." });
  }
};
