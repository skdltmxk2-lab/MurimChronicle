import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { COMPONENT_CATALOG } from "@/lib/electronics/catalog";
import { assertSafeData, parseCircuit, CircuitValidationError } from "@/lib/electronics/schema";
import { createBoard, createAssemblySteps, validateLayout } from "@/lib/electronics/engine";
import type { BoardOptions, Circuit, CircuitLayout, SavedProject } from "@/lib/electronics/types";

export const runtime = "nodejs";
export const maxDuration = 60;
const BUCKET = "electronics-projects";
const MAX_BYTES = 1_000_000;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
type Authorized = Extract<Awaited<ReturnType<typeof requireAdmin>>, { ok: true }>;
class ProjectError extends Error {
  constructor(public status: number, message: string) { super(message); this.name = "ProjectError"; }
}
function invalid(message: string): never { throw new ProjectError(400, message); }
function object(value: unknown, fields: string[]): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid("프로젝트 데이터 형식을 확인해 주세요.");
  const result = value as Record<string, unknown>;
  if (Object.keys(result).some((key) => !fields.includes(key))) invalid("프로젝트에 지원하지 않는 데이터 항목이 있습니다.");
  return result;
}
function text(value: unknown, max = 160): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) invalid("프로젝트의 이름·식별자 형식을 확인해 주세요.");
  return value.trim();
}
function identifier(value: unknown): string {
  const result = text(value, 64);
  if (!/^[A-Za-z0-9][A-Za-z0-9_.:+-]*$/.test(result)) invalid("식별자 형식이 올바르지 않습니다.");
  return result;
}
function array(value: unknown, max: number): unknown[] {
  if (!Array.isArray(value) || value.length > max) invalid("프로젝트 데이터의 개수 제한을 초과했거나 배열이 아닙니다.");
  return value;
}
function options(value: unknown): BoardOptions {
  const o = object(value, ["boards", "railMode"]);
  if ((o.boards !== 1 && o.boards !== 2) || (o.railMode !== "split" && o.railMode !== "continuous")) invalid("지원하지 않는 빵판 설정입니다.");
  return { boards: o.boards, railMode: o.railMode };
}
function normalizeLayout(value: unknown, circuit: Circuit, boardOptions: BoardOptions): CircuitLayout {
  const input = object(value, ["board", "placements", "jumpers", "terminals", "issues"]);
  const suppliedBoard = object(input.board, ["holes", "width", "height", "options"]);
  const suppliedOptions = options(suppliedBoard.options);
  if (suppliedOptions.boards !== boardOptions.boards || suppliedOptions.railMode !== boardOptions.railMode) invalid("프로젝트와 배치도의 빵판 설정이 다릅니다.");
  if (!Array.isArray(suppliedBoard.holes) || suppliedBoard.holes.length > 1660) invalid("빵판 홀 데이터가 올바르지 않습니다.");
  // Client coordinates, conductive groups and prior validation results never become authoritative.
  const board = createBoard(boardOptions);
  const holes = new Set(board.holes.map((hole) => hole.id));
  const hole = (value: unknown): string => { const id = text(value, 32); if (!holes.has(id)) invalid("존재하지 않는 빵판 홀입니다."); return id; };
  const net = (value: unknown): string => { const id = identifier(value); if (!Object.hasOwn(circuit.netNames, id)) invalid("정의되지 않은 연결을 참조합니다."); return id; };
  const seenComponents = new Set<string>();
  const placements = array(input.placements, 80).map((value) => {
    const p = object(value, ["componentId", "pins"]);
    const componentId = identifier(p.componentId);
    const component = circuit.components.find((c) => c.id === componentId);
    const definition = component && COMPONENT_CATALOG.find((d) => d.id === component.definitionId);
    if (!definition || seenComponents.has(componentId)) invalid("배치된 소자가 없거나 중복되었습니다.");
    seenComponents.add(componentId);
    const pinIds = definition.pins.map((pin) => pin.id);
    const rawPins = object(p.pins, pinIds);
    if (Object.keys(rawPins).length !== pinIds.length) invalid("소자의 삽입 핀이 누락되었습니다.");
    const pins: Record<string, string> = {};
    for (const id of pinIds) pins[id] = hole(rawPins[id]);
    return { componentId, pins };
  });
  const seenWires = new Set<string>();
  const jumpers = array(input.jumpers, 1200).map((value) => {
    const w = object(value, ["id", "netId", "from", "to", "color"]);
    const id = identifier(w.id);
    if (seenWires.has(id)) invalid("점퍼 ID가 중복되었습니다.");
    seenWires.add(id);
    const color = text(w.color, 7);
    if (!/^#[a-f0-9]{6}$/i.test(color)) invalid("점퍼 색상 형식이 올바르지 않습니다.");
    return { id, netId: net(w.netId), from: hole(w.from), to: hole(w.to), color };
  });
  const seenTerminals = new Set<string>();
  const terminals = array(input.terminals, 32).map((value) => {
    const t = object(value, ["connectionId", "holeId", "netId"]);
    const connectionId = identifier(t.connectionId);
    const connection = circuit.instruments.find((c) => c.id === connectionId);
    if (!connection || seenTerminals.has(connectionId) || connection.netId !== t.netId) invalid("계측기 단자 연결이 없거나 중복·변경되었습니다.");
    seenTerminals.add(connectionId);
    return { connectionId, holeId: hole(t.holeId), netId: net(t.netId) };
  });
  const layout: CircuitLayout = { board, placements, jumpers, terminals, issues: [] };
  // Editing drafts may have electrical errors; preserve the draft with freshly computed issues.
  layout.issues = validateLayout(circuit, COMPONENT_CATALOG, layout).issues;
  return layout;
}
function normalizeProject(value: unknown, saving: boolean): SavedProject {
  assertSafeData(value);
  const p = object(value, ["version", "id", "title", "updatedAt", "circuit", "boardOptions", "layout", "completedSteps", "experimentId"]);
  if (p.version !== 1) invalid("지원하지 않는 프로젝트 버전입니다.");
  const id = text(p.id, 36);
  if (!UUID.test(id)) invalid("프로젝트 ID는 UUID 형식이어야 합니다.");
  const updated = text(p.updatedAt, 40);
  if (!Number.isFinite(Date.parse(updated))) invalid("프로젝트 수정 시각이 올바르지 않습니다.");
  const circuit = parseCircuit(p.circuit, COMPONENT_CATALOG);
  const boardOptions = options(p.boardOptions);
  const layout = p.layout !== undefined ? normalizeLayout(p.layout, circuit, boardOptions) : undefined;
  const validSteps = new Set(layout ? createAssemblySteps(circuit, COMPONENT_CATALOG, layout).map((step) => step.id)
    : [...circuit.components.map((c) => `component:${c.id}`), ...circuit.instruments.map((c) => `terminal:${c.id}`)]);
  const completedSteps = array(p.completedSteps, 1400).map((value) => {
    const step = text(value, 100); if (!validSteps.has(step)) invalid("존재하지 않는 조립 단계입니다."); return step;
  });
  if (new Set(completedSteps).size !== completedSteps.length) invalid("완료한 조립 단계가 중복되었습니다.");
  return { version: 1, id, title: text(p.title), updatedAt: saving ? new Date().toISOString() : new Date(updated).toISOString(), circuit, boardOptions,
    ...(layout ? { layout } : {}), completedSteps, ...(p.experimentId !== undefined ? { experimentId: identifier(p.experimentId) } : {}) };
}
function isMissing(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const value = error as { status?: number | string; statusCode?: number | string };
  return String(value.statusCode ?? value.status) === "404";
}
async function ensurePrivateBucket(supabase: Authorized["supabase"]): Promise<void> {
  const existing = await supabase.storage.getBucket(BUCKET);
  if (existing.error) {
    if (!isMissing(existing.error)) throw new ProjectError(503, "프로젝트 저장소를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    const created = await supabase.storage.createBucket(BUCKET, { public: false, fileSizeLimit: MAX_BYTES, allowedMimeTypes: ["application/json"] });
    if (!created.error) return;
    // Another request can create the same bucket between getBucket and createBucket.
    const retry = await supabase.storage.getBucket(BUCKET);
    if (retry.error || !retry.data) throw new ProjectError(503, "비공개 프로젝트 저장소를 준비하지 못했습니다.");
    if (retry.data.public === false) return;
  } else if (existing.data?.public === false) return;
  const updated = await supabase.storage.updateBucket(BUCKET, { public: false, fileSizeLimit: MAX_BYTES, allowedMimeTypes: ["application/json"] });
  if (updated.error) throw new ProjectError(503, "저장소의 비공개 설정을 확인하지 못했습니다.");
}
function ownerPrefix(auth: Authorized): string {
  if (!UUID.test(auth.userId)) throw new ProjectError(503, "관리자 계정을 확인하지 못했습니다.");
  return auth.userId;
}
async function readBody(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new ProjectError(415, "JSON 형식으로 요청해 주세요.");
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BYTES) throw new ProjectError(413, "프로젝트는 1MB 이하로 저장할 수 있습니다.");
  if (!request.body) invalid("저장할 프로젝트가 없습니다.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) { await reader.cancel(); throw new ProjectError(413, "프로젝트는 1MB 이하로 저장할 수 있습니다."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { invalid("프로젝트 JSON을 읽지 못했습니다."); }
}
function errorResponse(error: unknown) {
  const status = error instanceof ProjectError ? error.status : error instanceof CircuitValidationError ? 400 : 503;
  const message = error instanceof ProjectError || error instanceof CircuitValidationError ? error.message : "프로젝트 저장소를 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.";
  return NextResponse.json({ ok: false, message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
    const prefix = ownerPrefix(auth);
    const project = normalizeProject(await readBody(request), true);
    const encoded = Buffer.from(JSON.stringify(project), "utf8");
    if (encoded.length > MAX_BYTES) throw new ProjectError(413, "프로젝트는 1MB 이하로 저장할 수 있습니다.");
    await ensurePrivateBucket(auth.supabase);
    const { error } = await auth.supabase.storage.from(BUCKET).upload(`${prefix}/${project.id}.json`, encoded, { contentType: "application/json", cacheControl: "0", upsert: true });
    if (error) throw new ProjectError(503, "프로젝트를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    return NextResponse.json({ ok: true, project }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
    const prefix = ownerPrefix(auth);
    await ensurePrivateBucket(auth.supabase);
    const bucket = auth.supabase.storage.from(BUCKET);
    const { data, error } = await bucket.list(prefix, { limit: 30, sortBy: { column: "updated_at", order: "desc" } });
    if (error) throw new ProjectError(503, "프로젝트 목록을 불러오지 못했습니다.");
    const files = (data ?? []).filter((file) => file.name.endsWith(".json") && UUID.test(file.name.slice(0, -5)));
    let skipped = 0;
    const loaded = await Promise.all(files.map(async (file): Promise<SavedProject | null> => {
      if (Number(file.metadata?.size ?? 0) > MAX_BYTES) { skipped++; return null; }
      const result = await bucket.download(`${prefix}/${file.name}`);
      if (result.error || !result.data) throw new ProjectError(503, "저장된 프로젝트를 불러오지 못했습니다.");
      if (result.data.size > MAX_BYTES) { skipped++; return null; }
      try {
        const project = normalizeProject(JSON.parse(await result.data.text()), false);
        if (`${project.id}.json` !== file.name) { skipped++; return null; }
        return project;
      } catch { skipped++; return null; }
    }));
    const projects = loaded.filter((project): project is SavedProject => project !== null).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return NextResponse.json({ ok: true, projects, skipped }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
