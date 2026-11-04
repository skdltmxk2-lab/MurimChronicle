import type { ProjectSource, ProjectSourceAttachment } from "./types";

export const SOURCE_ATTACHMENT_MAX_BYTES = 300_000;
const BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export class ProjectSourceValidationError extends Error {
  constructor(message: string) { super(message); this.name = "ProjectSourceValidationError"; }
}
function invalid(message: string): never { throw new ProjectSourceValidationError(message); }
function object(value: unknown, allowed: readonly string[]): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid("설계 출처의 데이터 형식을 확인해 주세요.");
  const result = value as Record<string, unknown>;
  if (Object.keys(result).some(key => !allowed.includes(key))) invalid("설계 출처에 지원하지 않는 항목이 있습니다.");
  return result;
}
function attachment(value: unknown): ProjectSourceAttachment {
  const image = object(value, ["name", "mimeType", "data"]);
  if (typeof image.name !== "string" || !image.name.trim() || image.name.length > 200 || /[\u0000-\u001f\u007f]/.test(image.name)) invalid("원본 이미지의 파일 이름을 확인해 주세요.");
  if (image.mimeType !== "image/png" && image.mimeType !== "image/jpeg" && image.mimeType !== "image/webp") invalid("보존할 원본은 PNG, JPG, WebP 이미지만 지원합니다.");
  const data = image.data;
  if (typeof data !== "string" || !data.length || data.length > 4 * Math.ceil(SOURCE_ATTACHMENT_MAX_BYTES / 3)) invalid("원본 이미지는 300KB 이하로 첨부해 주세요.");
  if (data.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(data)) invalid("원본 이미지의 인코딩을 확인해 주세요.");
  const padding = data.endsWith("==") ? 2 : data.endsWith("=") ? 1 : 0;
  const bytes = data.length / 4 * 3 - padding;
  if (bytes <= 0 || bytes > SOURCE_ATTACHMENT_MAX_BYTES) invalid("원본 이미지는 300KB 이하로 첨부해 주세요.");
  // Check unused pad bits too: permissive decoders accept multiple encodings of
  // the same bytes. Keep one canonical encoding without allocating the image.
  const last = BASE64.indexOf(data[data.length - padding - 1]);
  if ((padding === 2 && (last & 15) !== 0) || (padding === 1 && (last & 3) !== 0)) invalid("원본 이미지의 인코딩을 확인해 주세요.");
  const header: number[] = [];
  for (let i = 0; i < Math.min(data.length, 16); i += 4) {
    const bits = (BASE64.indexOf(data[i]) << 18) | (BASE64.indexOf(data[i + 1]) << 12)
      | (Math.max(0, BASE64.indexOf(data[i + 2])) << 6) | Math.max(0, BASE64.indexOf(data[i + 3]));
    header.push((bits >>> 16) & 255);
    if (data[i + 2] !== "=") header.push((bits >>> 8) & 255);
    if (data[i + 3] !== "=") header.push(bits & 255);
  }
  const starts = (expected: number[], offset = 0) => expected.every((byte, i) => header[offset + i] === byte);
  const matches = image.mimeType === "image/png" ? starts([137, 80, 78, 71, 13, 10, 26, 10])
    : image.mimeType === "image/jpeg" ? starts([255, 216, 255])
    : starts([82, 73, 70, 70]) && starts([87, 69, 66, 80], 8);
  if (!matches) invalid("원본 이미지의 내용과 파일 형식이 일치하지 않습니다.");
  return { name: image.name.trim(), mimeType: image.mimeType, data };
}

/** Missing metadata remains valid for projects saved before source channels existed. */
export function parseProjectSource(value: unknown): ProjectSource | undefined {
  if (value === undefined) return undefined;
  const source = object(value, ["channel", "provider", "attachment"]);
  const origin = source.channel === "gemini" && source.provider === "gemini"
    ? { channel: "gemini", provider: "gemini" } as const
    : source.channel === "assistant" && (source.provider === "chatgpt" || source.provider === "claude")
      ? { channel: "assistant", provider: source.provider } as const
      : invalid("설계 경로와 제공자가 일치하지 않습니다.");
  return { ...origin, ...(source.attachment !== undefined ? { attachment: attachment(source.attachment) } : {}) };
}

export function isProjectSource(value: unknown): value is ProjectSource {
  try { return parseProjectSource(value) !== undefined; } catch { return false; }
}

export function getSourceLabel(source?: ProjectSource): string {
  if (!source) return "출처 미지정";
  return source.channel === "gemini" ? "Gemini 분석" : source.provider === "chatgpt" ? "ChatGPT · Codex 설계" : "Claude 설계";
}
