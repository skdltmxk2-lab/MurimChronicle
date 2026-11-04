import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { COMPONENT_CATALOG } from "@/lib/electronics/catalog";
import { assertSafeData, CIRCUIT_LIMITS, CircuitValidationError, parseCircuit } from "@/lib/electronics/schema";
import { createSimulationLayoutIndex, parseSimulationBoardOptions, parseSimulationLayout, SimulationLayoutError } from "@/lib/electronics/simulation-layout";
import { parseSimulationConfig, runSimulation, SimulationError } from "@/lib/electronics/simulation";
import { NONLINEAR_MODEL_REGISTRY } from "@/lib/electronics/simulation-models";

export const runtime = "nodejs";
export const maxDuration = 60;
const MAX_BYTES = 1_000_000;
const MAX_PROBES = 16;
class SimulationRequestError extends Error {
  constructor(public readonly status: number, message: string) { super(message); this.name = "SimulationRequestError"; }
}
function bad(message: string): never { throw new SimulationRequestError(400, message); }

async function readInput(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new SimulationRequestError(415, "시뮬레이션 요청을 JSON 형식으로 보내주세요.");
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BYTES) throw new SimulationRequestError(413, "시뮬레이션 요청은 1MB 이하로 보내주세요.");
  if (!request.body) bad("시뮬레이션할 회로와 현재 빵판 배치가 필요합니다.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    for (;;) {
      if (request.signal.aborted) throw new SimulationRequestError(499, "시뮬레이션 요청이 취소되었습니다.");
      const { done, value } = await reader.read(); if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) { await reader.cancel(); throw new SimulationRequestError(413, "시뮬레이션 요청은 1MB 이하로 보내주세요."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { bad("시뮬레이션 JSON을 읽지 못했습니다."); }
}

function errorResponse(error: unknown) {
  const status = error instanceof SimulationRequestError ? error.status : error instanceof CircuitValidationError ? 400
    : error instanceof SimulationLayoutError ? error.code === "INVALID_LAYOUT_DATA" ? 400 : 422
      : error instanceof SimulationError ? 422 : 503;
  const known = error instanceof SimulationRequestError || error instanceof CircuitValidationError || error instanceof SimulationLayoutError || error instanceof SimulationError;
  return NextResponse.json({ ok: false, message: known ? error.message : "시뮬레이션을 계산하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    ...(error instanceof SimulationLayoutError ? { code: error.code, issues: error.issues } : {}),
    ...(error instanceof SimulationError ? { code: error.code } : {}),
  }, { status, headers: { "Cache-Control": "no-store" } });
}

/** Runs the same bounded numerical model as the browser, after checking actual live wiring. */
export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
    const input = await readInput(request);
    assertSafeData(input);
    if (!input || typeof input !== "object" || Array.isArray(input)) bad("시뮬레이션 요청 형식을 확인해 주세요.");
    const value = input as Record<string, unknown>;
    if (Object.keys(value).some(key => !["circuit", "boardOptions", "layout", "config", "probeHoleIds"].includes(key))) bad("시뮬레이션 요청에 알 수 없는 항목이 있습니다.");
    const circuit = parseCircuit(value.circuit, COMPONENT_CATALOG);
    const boardOptions = parseSimulationBoardOptions(value.boardOptions);
    const layout = parseSimulationLayout(value.layout, circuit, COMPONENT_CATALOG, boardOptions);
    const config = parseSimulationConfig(value.config);
    const index = createSimulationLayoutIndex(circuit, COMPONENT_CATALOG, layout);
    if (value.probeHoleIds !== undefined && (!Array.isArray(value.probeHoleIds) || value.probeHoleIds.length > MAX_PROBES || value.probeHoleIds.some(hole => typeof hole !== "string" || hole.length > 32))) bad("프로브 구멍은 최대 16개 문자열로 지정하세요.");
    const probes = ((value.probeHoleIds ?? []) as string[]).map(holeId => ({ holeId, netId: index.netForHole(holeId) }));
    if (request.signal.aborted) throw new SimulationRequestError(499, "시뮬레이션 요청이 취소되었습니다.");
    const result = runSimulation(circuit, COMPONENT_CATALOG, config);
    return NextResponse.json({ ok: true, result, validation: index.validation, probes }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
    return NextResponse.json({ ok: true, method: "POST", endpoint: "/api/admin/electronics/simulate",
      required: ["circuit", "boardOptions", "layout", "config"], optional: ["probeHoleIds"],
      limits: { requestBytes: MAX_BYTES, probes: MAX_PROBES, signalSources: 4, dcSupplies: 8, ...CIRCUIT_LIMITS },
      analyses: ["dc", "transient", "ac"], models: ["linear-ideal", "nonlinear-educational"], transientMethod: "backward-euler",
      supported: ["2핀 저항", "2핀 커패시터·전해커패시터", "검증된 UA741 핀맵의 이상적/교육용 동적 연산증폭기", "등록된 NPN/PNP Ebers–Moll", "등록된 N/P MOS Level-1", "1N4148 Shockley"],
      nonlinearModels: NONLINEAR_MODEL_REGISTRY,
      waveforms: ["sine", "square", "triangle", "dc", "pulse", "sawtooth", "am"],
      measurementEndpoint: "/api/admin/electronics/measure",
      configExtensions: { dutyCyclePercent: "pulse · 1~99% · 기본 50%", modulationFrequencyHz: "AM · 0.001~10000000 Hz · 기본 100 Hz", modulationDepth: "AM · 0~1 · 기본 0.2", extraSources: "선택 · 기본 source와 같은 형식 · 최대 3개", phaseDegrees: "각 source에 선택 · -360~360° · 기본 0°", opampModel: ["ideal", "educational-dynamic"], startupPerturbationVolts: "동적 모델의 시동 조건 · 0~0.01 V · 기본 0 V" },
      notes: ["동적 UA741은 유한 대역폭·슬루율·출력 제한을 포함한 교육용 근사입니다. 양의 피드백 회로는 AC 대신 acUnavailableReason과 빈 AC 배열을 반환합니다.", "현재 빵판의 소자 핀·점퍼·장비 연결이 목표 회로와 일치해야 계산합니다.", "미지원 소자, 부유 노드, 잘못된 값, 수렴 실패는 결과 대신 오류를 반환합니다.", "프로브는 실제 내부 연결 줄과 점퍼 양 끝을 따라 해석합니다. 점퍼의 표시 이름이나 저장된 검사 결과를 신뢰하지 않습니다.", "AC는 DC 동작점 주변의 기본 입력 1 V 소신호 응답이며 추가 입력은 AC 0 V입니다. 믹서 변환 이득은 시간 파형의 스펙트럼을 사용하세요.", "반도체 모델은 교육용 축소 모델입니다. 실제 소자 정격·고주파 기생성분·열·파형의 실측 검증은 별도이며 physicalPlacement가 external-only인 BC109C는 현재 빵판 배치에서 보류합니다."],
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
