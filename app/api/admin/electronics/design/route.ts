import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { COMPONENT_CATALOG } from "@/lib/electronics/catalog";
import { assertSafeData, parseCircuit, CIRCUIT_LIMITS, CircuitValidationError } from "@/lib/electronics/schema";
import { createAssemblySteps, createLayout, validateLayout } from "@/lib/electronics/engine";
import type { BoardOptions } from "@/lib/electronics/types";

export const runtime = "nodejs";
export const maxDuration = 60;
const MAX_BYTES = 1_000_000;
class DesignError extends Error {
  constructor(public status: number, message: string) { super(message); this.name = "DesignError"; }
}
function bad(message: string): never { throw new DesignError(400, message); }

async function readInput(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new DesignError(415, "회로 데이터를 JSON 형식으로 보내주세요.");
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BYTES) throw new DesignError(413, "설계 요청은 1MB 이하로 보내주세요.");
  if (!request.body) bad("설계할 회로가 없습니다.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) { await reader.cancel(); throw new DesignError(413, "설계 요청은 1MB 이하로 보내주세요."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { bad("회로 JSON을 읽지 못했습니다."); }
}

function parseOptions(value: unknown): BoardOptions {
  if (!value || typeof value !== "object" || Array.isArray(value)) bad("빵판 설정이 필요합니다.");
  const options = value as Record<string, unknown>;
  if (Object.keys(options).some((key) => !["boards", "railMode"].includes(key)) ||
    (options.boards !== 1 && options.boards !== 2) ||
    (options.railMode !== "split" && options.railMode !== "continuous")) bad("지원하지 않는 빵판 설정입니다.");
  return { boards: options.boards, railMode: options.railMode };
}

function errorResponse(error: unknown) {
  const status = error instanceof DesignError ? error.status : error instanceof CircuitValidationError ? 400 : 503;
  const message = error instanceof DesignError || error instanceof CircuitValidationError ? error.message : "회로 배치를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.";
  return NextResponse.json({ ok: false, message }, { status, headers: { "Cache-Control": "no-store" } });
}

/** Executes a reviewed netlist without a model call or an AI-provider credential. */
export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const input = await readInput(request);
    assertSafeData(input);
    if (!input || typeof input !== "object" || Array.isArray(input)) bad("요청 형식을 확인해 주세요.");
    const value = input as Record<string, unknown>;
    if (Object.keys(value).some((key) => !["circuit", "boardOptions"].includes(key))) bad("설계 요청에 알 수 없는 항목이 있습니다.");
    const circuit = parseCircuit(value.circuit, COMPONENT_CATALOG);
    const options = parseOptions(value.boardOptions);
    const layout = createLayout(circuit, COMPONENT_CATALOG, options);
    const validation = validateLayout(circuit, COMPONENT_CATALOG, layout);
    layout.issues = validation.issues;
    const steps = createAssemblySteps(circuit, COMPONENT_CATALOG, layout);
    return NextResponse.json({ ok: true, circuit, layout, validation, steps }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}

/** Authenticated discovery for a connected agent or an API client. */
export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    return NextResponse.json({
      ok: true,
      purpose: "구조화한 회로를 자동 배치하고 실제 홀 연결을 검증합니다. Gemini 호출 없이 동작합니다.",
      method: "POST", endpoint: "/api/admin/electronics/design", required: ["circuit", "boardOptions"],
      limits: { requestBytes: MAX_BYTES, ...CIRCUIT_LIMITS },
      boardOptions: { boards: [1, 2], railMode: ["split", "continuous"], description: "일반 830홀 빵판 프로필. 사용자 실물 1600홀 제품을 검증한 프로필은 아닙니다." },
      circuitFields: ["id", "title", "description", "components", "netNames", "instruments", "notes", "reviewItems", "provenance"],
      catalog: COMPONENT_CATALOG.map(({ id, name, package: packageName, pins, mounting, pinoutStatus }) => ({ id, name, package: packageName, pins, mounting, pinoutStatus })),
      notes: ["부품의 모든 물리 핀을 pinNets에 기재하고 참조한 모든 net을 netNames에 정의하세요.", "불확실한 인식·부품·조건은 reviewItems에 resolved:false로 남기세요.", "ok는 API 처리 성공을 뜻합니다. validation.valid와 확인 항목을 별도로 검사하세요.", "배선 검증은 목표 연결과의 일치 검사이며 원문 인식·실물 동작·파형 성능을 보증하지 않습니다."],
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
