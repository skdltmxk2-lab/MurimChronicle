import type { QuestionRecord } from "@/types/question";
import type { Difficulty } from "@/types/exam";
import { DIFFICULTY_KEYS } from "@/lib/taxonomy";

const DIFFICULTY_INDEX: Record<Difficulty, number> = Object.fromEntries(
  DIFFICULTY_KEYS.map((d, i) => [d, i])
) as Record<Difficulty, number>;

function compareByDifficulty(a: QuestionRecord, b: QuestionRecord): number {
  const da = DIFFICULTY_INDEX[a.difficulty] ?? 99;
  const db = DIFFICULTY_INDEX[b.difficulty] ?? 99;
  if (da !== db) return da - db;
  return a.id.localeCompare(b.id);
}

/**
 * Split a question pool into N fixed rounds.
 *
 * Rules:
 * - Group by difficulty (하 → 킬러).
 * - For each difficulty bucket, distribute its questions to rounds round-robin
 *   so each round gets a similar count of every difficulty (난이도 합 균형).
 * - Within each round, sort by difficulty ascending (하 → 킬러), then id.
 * - Each round is capped at `perRound`. Empty rounds are dropped.
 *
 * The output is deterministic for a given pool ordering, so all students who
 * see "{subject} 1회" get the same questions without DB persistence.
 */
export function buildSubjectMockRounds(
  pool: QuestionRecord[],
  options: { rounds: number; perRound: number }
): QuestionRecord[][] {
  const { rounds, perRound } = options;
  if (rounds <= 0 || perRound <= 0 || pool.length === 0) return [];

  // Group by difficulty using DIFFICULTY_KEYS order. Within a bucket sort by id
  // for determinism (same pool → same rounds across users).
  const buckets: QuestionRecord[][] = DIFFICULTY_KEYS.map(() => []);
  for (const q of pool) {
    const idx = DIFFICULTY_INDEX[q.difficulty];
    if (idx === undefined) continue;
    buckets[idx].push(q);
  }
  for (const b of buckets) b.sort((a, c) => a.id.localeCompare(c.id));

  // Round-robin distribute each difficulty bucket across rounds.
  const draft: QuestionRecord[][] = Array.from({ length: rounds }, () => []);
  for (const bucket of buckets) {
    bucket.forEach((q, i) => {
      const targetRound = i % rounds;
      if (draft[targetRound].length < perRound) {
        draft[targetRound].push(q);
      }
    });
  }

  // Sort each round by difficulty ascending, drop empties.
  return draft
    .map((round) => round.slice().sort(compareByDifficulty))
    .filter((round) => round.length > 0);
}
