import Anthropic from "@anthropic-ai/sdk";

/**
 * AI 기능(문제검색 비전 추출 + 튜터 채팅)에 쓰는 단일 모델.
 * - 기본값 Opus 4.7: 최고 품질 + 고해상도 비전(수식 사진 판독에 유리).
 * - 비용을 낮추려면 "claude-sonnet-4-6"(중간) 또는 "claude-haiku-4-5"(저비용)로 교체하면 된다.
 *   (이 한 줄만 바꾸면 두 라우트 모두 적용됨)
 */
export const AI_MODEL = "claude-opus-4-7";

/**
 * 서버 전용 Anthropic 클라이언트. ANTHROPIC_API_KEY 환경변수를 사용한다.
 * (Vercel 프로젝트 환경변수에 ANTHROPIC_API_KEY 를 등록해야 실제 호출이 동작한다.)
 */
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

export const ALLOWED_IMAGE_TYPES: ReadonlySet<string> = new Set<ImageMediaType>([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

/**
 * 모델 응답 텍스트에서 JSON 객체를 안전하게 추출한다.
 * 코드펜스(```json ... ```)나 앞뒤 잡텍스트가 섞여 있어도 첫 {} 블록을 파싱한다.
 */
export function extractJson<T = Record<string, unknown>>(text: string): T | null {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
