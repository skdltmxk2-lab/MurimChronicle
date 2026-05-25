import { GoogleGenAI } from "@google/genai";

/**
 * AI 기능(문제검색 비전 추출 + 튜터 채팅)에 쓰는 단일 모델.
 * - 기본값 Gemini 2.5 Flash: 저렴 + 비전/수학에 강함.
 * - 더 저렴: "gemini-2.5-flash-lite" / 품질↑: "gemini-2.5-pro" 로 이 한 줄만 교체.
 *   (정확한 최신 모델명은 Google AI Studio에서 확인 가능)
 */
export const GEMINI_MODEL = "gemini-2.5-flash";

/**
 * 서버 전용 Gemini 클라이언트. GEMINI_API_KEY 환경변수를 사용한다.
 * (Vercel 프로젝트 환경변수에 GEMINI_API_KEY 를 등록해야 실제 호출이 동작한다.)
 */
export const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

export const ALLOWED_IMAGE_TYPES: ReadonlySet<string> = new Set([
  "image/jpeg",
  "image/png",
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
