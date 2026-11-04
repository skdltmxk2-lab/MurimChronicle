import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { COMPONENT_CATALOG } from "@/lib/electronics/catalog";
import { assertSafeData, CircuitValidationError, parseCircuit } from "@/lib/electronics/schema";
import { createSimulationLayoutIndex, parseSimulationBoardOptions, parseSimulationLayout, SimulationLayoutError } from "@/lib/electronics/simulation-layout";
import { parseSimulationConfig, runSimulation, SimulationError } from "@/lib/electronics/simulation";
import { measureMultimeter, parseMultimeterSettings } from "@/lib/electronics/simulation-instruments";

export const runtime = "nodejs";
export const maxDuration = 60;
const MAX_BYTES = 1_000_000;
class MeasurementRequestError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
const respond = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
async function readInput(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new MeasurementRequestError(415, "JSON 형식으로 측정을 요청하세요.");
  if (Number(request.headers.get("content-length") || 0) > MAX_BYTES) throw new MeasurementRequestError(413, "측정 요청은 1MB 이하로 보내주세요.");
  if (!request.body) throw new MeasurementRequestError(400, "측정할 회로와 현재 배치가 필요합니다.");
  const reader = request.body.getReader(), chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    for (;;) {
      if (request.signal.aborted) throw new MeasurementRequestError(499, "측정 요청이 취소되었습니다.");
      const { done, value } = await reader.read(); if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) { await reader.cancel(); throw new MeasurementRequestError(413, "측정 요청은 1MB 이하로 보내주세요."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown; }
  catch { throw new MeasurementRequestError(400, "측정 JSON을 읽을 수 없습니다."); }
}

/** Measurements never trust a caller-provided result, wiring graph, or validation flag. */
export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
    const input = await readInput(request); assertSafeData(input);
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new MeasurementRequestError(400, "측정 요청 형식을 확인하세요.");
    const data = input as Record<string, unknown>;
    if (Object.keys(data).some(key => !["circuit", "boardOptions", "layout", "config", "settings"].includes(key))) throw new MeasurementRequestError(400, "측정 요청에 알 수 없는 항목이 있습니다.");
    const circuit = parseCircuit(data.circuit, COMPONENT_CATALOG);
    const boardOptions = parseSimulationBoardOptions(data.boardOptions);
    const layout = parseSimulationLayout(data.layout, circuit, COMPONENT_CATALOG, boardOptions);
    const index = createSimulationLayoutIndex(circuit, COMPONENT_CATALOG, layout);
    let settings: ReturnType<typeof parseMultimeterSettings>;
    try { settings = parseMultimeterSettings(data.settings); }
    catch (error) { throw new MeasurementRequestError(400, error instanceof Error ? error.message : "멀티미터 설정을 확인하세요."); }
    const config = data.config === undefined ? undefined : parseSimulationConfig(data.config);
    if (settings.power === "on" && !config) throw new MeasurementRequestError(400, "전압·전류 측정에는 회로 계산 조건 config가 필요합니다.");
    if (request.signal.aborted) throw new MeasurementRequestError(499, "측정 요청이 취소되었습니다.");
    const result = settings.power === "on" ? runSimulation(circuit, COMPONENT_CATALOG, config!) : undefined;
    const reading = measureMultimeter({ circuit, definitions: COMPONENT_CATALOG, config, result, settings });
    return respond({ ok: reading.status === "ok" || reading.status === "open", reading, validation: index.validation }, reading.status === "invalid" || reading.status === "unsupported" ? 422 : 200);
  } catch (error) {
    const known = error instanceof MeasurementRequestError || error instanceof CircuitValidationError || error instanceof SimulationLayoutError || error instanceof SimulationError;
    const status = error instanceof MeasurementRequestError ? error.status : error instanceof CircuitValidationError ? 400 : error instanceof SimulationLayoutError ? error.code === "INVALID_LAYOUT_DATA" ? 400 : 422 : error instanceof SimulationError ? 422 : 503;
    return respond({ ok: false, message: known ? error.message : "측정을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.", ...(error instanceof SimulationLayoutError ? { code: error.code, issues: error.issues } : {}) }, status);
  }
}

export async function GET(request: Request) {
  try {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  return respond({ ok: true, endpoint: "/api/admin/electronics/measure", required: ["circuit", "boardOptions", "layout", "settings"], config: "power=on 전압·전류 측정 시 필수", requestBytes: MAX_BYTES,
    modes: ["dc-voltage", "ac-voltage", "dc-current", "ac-current", "resistance", "continuity", "diode"],
    settings: { mode: "측정 모드", power: "on 또는 off", redNetId: "빨강 프로브 노드", blackNetId: "COM 노드", branch: { componentId: "전류 측정 소자 ID", terminal: "단자 이름 (1/2, C/B/E, D/G/S, A/K)" }, startTimeSeconds: "선택 구간 시작 · 생략하면 전체", endTimeSeconds: "선택 구간 끝 · 생략하면 전체", continuityThresholdOhms: "도통 저항 기준" },
    notes: ["현재 빵판 배선을 검증하고 서버에서 직접 계산합니다. 사용자가 보낸 수치 결과는 받지 않습니다.", "전압·전류 DC는 선택 구간 평균, AC는 평균 DC를 제거한 true RMS입니다.", "전류는 단자로 유입되는 가지 전류이며 회로를 끊지 않는 가상 전류 프로브입니다.", "저항·도통·다이오드는 무전원 시험 모델입니다. 지원하지 않는 회로에는 추정값을 표시하지 않습니다.", "오실로스코프 표시·트리거·커서는 /simulate의 실제 시간 표본에서 계산합니다."],
  });
  } catch { return respond({ ok: false, message: "측정 규약을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." }, 503); }
}
