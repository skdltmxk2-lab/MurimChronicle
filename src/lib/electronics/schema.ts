import type { Circuit, ComponentDefinition } from "./types";

export const CIRCUIT_LIMITS = { components: 80, nets: 256, instruments: 32, reviews: 80 } as const;
const UNSAFE_KEYS = new Set(["__proto__", "prototype", "constructor"]);

export class CircuitValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CircuitValidationError";
  }
}

function fail(message: string): never { throw new CircuitValidationError(message); }

/** Also used for imported project JSON. No server-only or AI dependencies. */
export function assertSafeData(value: unknown, depth = 0): void {
  if (depth > 20) fail("데이터 구조가 너무 깊습니다.");
  if (value === null || typeof value !== "object") return;
  for (const key of Object.keys(value)) {
    if (UNSAFE_KEYS.has(key)) fail("허용하지 않는 데이터 키가 있습니다.");
    assertSafeData((value as Record<string, unknown>)[key], depth + 1);
  }
}

function record(value: unknown, label: string, allowed?: string[]): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label}: 객체가 필요합니다.`);
  const result = value as Record<string, unknown>;
  if (allowed && Object.keys(result).some((key) => !allowed.includes(key))) fail(`${label}: 알 수 없는 항목이 있습니다.`);
  return result;
}

function str(value: unknown, label: string, max = 200, empty = false): string {
  if (typeof value !== "string" || value.length > max || (!empty && !value.trim())) fail(`${label}: 문자열 형식을 확인하세요.`);
  return value.trim();
}

function identifier(value: unknown, label: string): string {
  const result = str(value, label, 64);
  if (!/^[A-Za-z0-9][A-Za-z0-9_.:+-]*$/.test(result) || UNSAFE_KEYS.has(result)) fail(`${label}: 식별자 형식을 확인하세요.`);
  return result;
}

function list(value: unknown, label: string, max: number): unknown[] {
  if (!Array.isArray(value) || value.length > max) fail(`${label}: 최대 ${max}개까지 허용됩니다.`);
  return value;
}

export function parseCircuit(value: unknown, definitions: readonly ComponentDefinition[]): Circuit {
  assertSafeData(value);
  const source = record(value, "회로", ["id", "title", "description", "components", "netNames", "instruments", "notes", "reviewItems", "provenance"]);
  const definitionById = new Map(definitions.map((item) => [item.id, item]));
  const netObject = record(source.netNames, "연결 이름");
  if (Object.keys(netObject).length > CIRCUIT_LIMITS.nets) fail("회로의 연결 수가 너무 많습니다.");
  const netNames: Record<string, string> = {};
  for (const [key, name] of Object.entries(netObject)) netNames[identifier(key, "연결 ID")] = str(name, "연결 이름", 120);
  const requireNet = (value: unknown): string => {
    const id = identifier(value, "연결 ID");
    if (!Object.hasOwn(netNames, id)) fail("정의되지 않은 연결을 참조합니다.");
    return id;
  };
  const componentIds = new Set<string>();
  const components = list(source.components, "소자", CIRCUIT_LIMITS.components).map((item) => {
    const c = record(item, "소자", ["id", "definitionId", "value", "pinNets"]);
    const id = identifier(c.id, "소자 ID");
    if (componentIds.has(id)) fail("중복된 소자 ID가 있습니다.");
    componentIds.add(id);
    const definitionId = identifier(c.definitionId, "부품 ID");
    const definition = definitionById.get(definitionId);
    if (!definition) fail("라이브러리에 없는 부품입니다. 지원 부품을 선택하거나 확인 항목으로 남겨주세요.");
    const pins = record(c.pinNets, "핀 연결");
    const expected = new Set(definition.pins.map((pin) => pin.id));
    if (Object.keys(pins).length !== expected.size || Object.keys(pins).some((key) => !expected.has(key))) fail("부품의 핀 번호가 누락되었거나 맞지 않습니다.");
    const pinNets: Record<string, string> = {};
    for (const pin of definition.pins) {
      if (!Object.hasOwn(pins, pin.id)) fail("부품의 핀 연결이 누락되었습니다.");
      pinNets[pin.id] = requireNet(pins[pin.id]);
    }
    return { id, definitionId, value: str(c.value, "소자 값", 160, true), pinNets };
  });
  const instrumentIds = new Set<string>();
  const instruments = list(source.instruments, "계측기 연결", CIRCUIT_LIMITS.instruments).map((item) => {
    const c = record(item, "계측기 연결", ["id", "instrument", "port", "netId", "setting"]);
    const id = identifier(c.id, "계측기 연결 ID");
    if (instrumentIds.has(id)) fail("중복된 계측기 연결 ID가 있습니다.");
    instrumentIds.add(id);
    return { id, instrument: str(c.instrument, "계측기", 100), port: str(c.port, "단자", 100), netId: requireNet(c.netId), ...(c.setting !== undefined ? { setting: str(c.setting, "계측기 설정", 500, true) } : {}) };
  });
  const reviewIds = new Set<string>();
  const reviewItems = list(source.reviewItems, "확인 항목", CIRCUIT_LIMITS.reviews).map((item) => {
    const r = record(item, "확인 항목", ["id", "message", "resolved"]);
    const id = identifier(r.id, "확인 항목 ID");
    if (reviewIds.has(id)) fail("중복된 확인 항목 ID가 있습니다.");
    reviewIds.add(id);
    if (typeof r.resolved !== "boolean") fail("확인 상태는 참/거짓이어야 합니다.");
    return { id, message: str(r.message, "확인 내용", 1200), resolved: r.resolved };
  });
  if (!components.length && !instruments.length && !reviewItems.length) fail("회로나 확인할 내용이 없습니다.");
  return {
    id: identifier(source.id, "회로 ID"), title: str(source.title, "회로 이름", 160),
    description: str(source.description, "설명", 3000, true), components, netNames, instruments,
    notes: list(source.notes, "참고 사항", 40).map((item) => str(item, "참고 사항", 1200)), reviewItems,
    ...(source.provenance !== undefined ? { provenance: str(source.provenance, "출처", 2000, true) } : {}),
  };
}
