import { ThinkingLevel, type GenerateContentConfig } from "@google/genai";

// Keep the electronics model independent from the CBT question-generation model.
// Gemini 3.8 supports LOW/MEDIUM/HIGH thinking. Sampling parameters and MINIMAL
// are intentionally omitted. No environment override or automatic model fallback.
// https://aistudio.google.com/docs/whats-new-gemini-3.8#migrate-to-gemini-3-8-flash
export const ELECTRONICS_GEMINI_MODEL = "gemini-3.8-flash";

export const ELECTRONICS_RECOGNITION_CONFIG = {
  thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
} satisfies GenerateContentConfig;

export const ELECTRONICS_CHAT_CONFIG = {
  thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
} satisfies GenerateContentConfig;
