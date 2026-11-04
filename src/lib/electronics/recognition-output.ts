import { assertSafeData, parseCircuit, CIRCUIT_LIMITS, CircuitValidationError } from "./schema";
import type { Circuit, ComponentDefinition } from "./types";

const UNSAFE_IDS = new Set(["__proto__", "prototype", "constructor"]);
function fail(message: string): never { throw new CircuitValidationError(message); }
function object(value: unknown, fields: readonly string[], label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label}: 객체가 필요합니다.`);
  const item = value as Record<string, unknown>;
  if (Object.keys(item).some(key => !fields.includes(key))) fail(`${label}: 알 수 없는 항목이 있습니다.`);
  if (fields.some(key => !Object.hasOwn(item, key))) fail(`${label}: 필수 항목이 누락되었습니다.`);
  return item;
}
function list(value: unknown, maximum: number, label: string): unknown[] {
  if (!Array.isArray(value) || value.length > maximum) fail(`${label}: 배열 형식 또는 개수 제한을 확인하세요.`);
  return value;
}
function identifier(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length > 64) fail(`${label}: 식별자 형식을 확인하세요.`);
  const id = value.trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9_.:+-]*$/.test(id) || UNSAFE_IDS.has(id)) fail(`${label}: 허용하지 않는 식별자입니다.`);
  return id;
}
function text(value: unknown, maximum: number, label: string): string {
  if (typeof value !== "string" || !value.trim() || value.length > maximum) fail(`${label}: 문자열 형식을 확인하세요.`);
  return value.trim();
}

/**
 * Provider-only arrays make every generated object property explicit. Convert
 * only after validating duplicate/unsafe keys so Object.fromEntries cannot hide
 * conflicting connectivity. Public Circuit JSON remains unchanged and is checked
 * again by the same parser used for imported and manually edited circuits.
 */
export function parseRecognitionOutput(value: unknown, definitions: readonly ComponentDefinition[]): Circuit {
  assertSafeData(value);
  const source = object(value, ["id", "title", "description", "components", "nets", "instruments", "notes", "reviewItems", "provenance"], "AI 회로 출력");
  const definitionById = new Map(definitions.map(definition => [definition.id, definition]));
  const netIds = new Set<string>();
  const nets = list(source.nets, CIRCUIT_LIMITS.nets, "AI 연결 목록").map(value => {
    const entry = object(value, ["id", "name"], "AI 연결 항목");
    const id = identifier(entry.id, "AI 연결 ID");
    if (netIds.has(id)) fail("AI 연결 목록에 중복된 연결 ID가 있습니다.");
    netIds.add(id);
    return [id, text(entry.name, 120, "AI 연결 이름")] as const;
  });
  const componentIds = new Set<string>();
  const components = list(source.components, CIRCUIT_LIMITS.components, "AI 소자 목록").map(value => {
    const item = object(value, ["id", "definitionId", "value", "pinConnections"], "AI 소자 항목");
    const id = identifier(item.id, "AI 소자 ID");
    if (componentIds.has(id)) fail("AI 소자 목록에 중복된 소자 ID가 있습니다.");
    componentIds.add(id);
    const definitionId = identifier(item.definitionId, "AI 부품 ID"), definition = definitionById.get(definitionId);
    if (!definition) fail("AI가 카탈로그에 없는 부품 ID를 반환했습니다.");
    const expectedPins = new Set(definition.pins.map(pin => pin.id));
    const entries = list(item.pinConnections, expectedPins.size, "AI 핀 연결 목록");
    if (entries.length !== expectedPins.size) fail("AI 핀 연결 목록에 부품의 필수 핀이 누락되었습니다.");
    const pinIds = new Set<string>();
    const connections = entries.map(value => {
      const pin = object(value, ["pinId", "netId"], "AI 핀 연결 항목");
      const pinId = identifier(pin.pinId, "AI 핀 ID"), netId = identifier(pin.netId, "AI 핀의 연결 ID");
      if (!expectedPins.has(pinId)) fail("AI 핀 연결의 핀 ID가 부품의 핀맵과 다릅니다.");
      if (pinIds.has(pinId)) fail("AI 핀 연결 목록에 중복된 핀 ID가 있습니다.");
      if (!netIds.has(netId)) fail("AI 핀 연결이 정의되지 않은 연결을 참조합니다.");
      pinIds.add(pinId);
      return [pinId, netId] as const;
    });
    return { id, definitionId, value: item.value, connections };
  });
  // Bound the remaining arrays before allocating the internal maps. Their exact
  // fields, unique IDs, string limits and references are validated by parseCircuit.
  list(source.instruments, CIRCUIT_LIMITS.instruments, "AI 계측기 목록");
  list(source.notes, 40, "AI 참고 사항");
  list(source.reviewItems, CIRCUIT_LIMITS.reviews, "AI 확인 항목");
  return parseCircuit({ id: source.id, title: source.title, description: source.description, provenance: source.provenance,
    components: components.map(({ connections, ...component }) => ({ ...component, pinNets: Object.fromEntries(connections) })), netNames: Object.fromEntries(nets),
    instruments: source.instruments, notes: source.notes, reviewItems: source.reviewItems }, definitions);
}
