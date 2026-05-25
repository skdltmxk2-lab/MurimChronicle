import { gemini } from "./gemini";

// 임베딩 모델/차원 — DB의 vector(768) 및 match_questions와 반드시 일치해야 함.
export const EMBED_MODEL = "gemini-embedding-001";
export const EMBED_DIM = 768;

type TaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

/** 여러 텍스트를 한 번에 임베딩 (백필용). 입력 순서와 동일한 순서로 반환. */
export async function embedTexts(texts: string[], taskType: TaskType): Promise<number[][]> {
  if (texts.length === 0) return [];
  const res = await gemini.models.embedContent({
    model: EMBED_MODEL,
    contents: texts,
    config: { outputDimensionality: EMBED_DIM, taskType },
  });
  return (res.embeddings ?? []).map((e) => e.values ?? []);
}

/** 단일 텍스트 임베딩 (검색 쿼리용). */
export async function embedOne(text: string, taskType: TaskType): Promise<number[]> {
  const [vec] = await embedTexts([text], taskType);
  return vec ?? [];
}
