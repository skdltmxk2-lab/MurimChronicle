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

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Gemini의 일시적 오류(과부하/속도제한/일시 장애)인지 판별. */
export function isTransientAiError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return /(503|502|500|429|UNAVAILABLE|overloaded|high demand|RESOURCE_EXHAUSTED|INTERNAL|deadline|timeout)/i.test(msg);
}

// 기본 모델이 과부하일 때 자동 전환할 보조 모델(더 한가함). 임베딩에는 적용하지 않음(벡터 호환성).
export const GEMINI_FALLBACK_MODEL = "gemini-2.5-flash-lite";

type GenParams = Parameters<typeof gemini.models.generateContent>[0];

/**
 * 일시적 오류 시 지수 백오프로 재시도하며 generateContent 호출.
 * 기본 모델에서 재시도가 소진되면 보조 모델(flash-lite)로 한 번 더 시도한다.
 */
export async function generateWithRetry(
  params: GenParams,
  retries = 1
): Promise<Awaited<ReturnType<typeof gemini.models.generateContent>>> {
  const primary = params.model;
  const models = primary === GEMINI_FALLBACK_MODEL ? [primary] : [primary, GEMINI_FALLBACK_MODEL];
  let last: unknown;
  for (const model of models) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await gemini.models.generateContent({ ...params, model });
      } catch (e) {
        last = e;
        if (!isTransientAiError(e)) throw e; // 일시적 오류가 아니면 폴백하지 않음
        if (attempt < retries) {
          await sleep(500 * 2 ** attempt + Math.floor(Math.random() * 250));
          continue;
        }
        break; // 이 모델 재시도 소진 → 다음(보조) 모델로
      }
    }
  }
  throw last;
}

/** 사용자에게 보여줄 친절한 오류 메시지(원시 JSON 노출 방지). */
export function friendlyAiError(e: unknown): string {
  if (isTransientAiError(e)) return "AI가 잠시 혼잡해요. 잠시 후 다시 시도해 주세요.";
  return e instanceof Error ? e.message : "AI 처리 중 오류가 발생했습니다.";
}
