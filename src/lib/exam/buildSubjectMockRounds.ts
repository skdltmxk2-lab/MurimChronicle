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
 * 한 과목 풀을 고정 N개 회차로 나눈다.
 *
 * 균등 출제 규칙:
 * 1) 단원별로 그룹화한다.
 * 2) 회차당 각 단원에서 floor(perRound / unitCount)문제를 가져와 모든 단원이
 *    균등하게 등장하게 한다 (예: 5단원 · 20문항 → 단원당 4문항).
 * 3) perRound가 단원수로 나누어떨어지지 않으면 풀이 큰 단원부터 1문제씩 더
 *    채워서 회차당 정확히 perRound문제를 맞춘다.
 * 4) 단원 안에서는 난이도 오름차순(하 → 킬러)으로 정렬해 슬라이스. 회차 N은
 *    각 단원 풀의 (N-1)*k ~ N*k 구간을 가져가므로 회차마다 다른 문제가 나온다.
 * 5) 회차 내 문제 순서는 난이도 오름차순 → 회차 간 난이도 합도 비슷.
 *
 * 같은 풀에 대해 출력은 deterministic이다 (모든 학생 동일 회차 = 같은 문제).
 */
export function buildSubjectMockRounds(
  pool: QuestionRecord[],
  options: { rounds: number; perRound: number }
): QuestionRecord[][] {
  const { rounds, perRound } = options;
  if (rounds <= 0 || perRound <= 0 || pool.length === 0) return [];

  // 1) 단원별 그룹 + 난이도 asc 정렬
  const byUnit = new Map<string, QuestionRecord[]>();
  for (const q of pool) {
    const list = byUnit.get(q.unit);
    if (list) list.push(q);
    else byUnit.set(q.unit, [q]);
  }
  for (const arr of byUnit.values()) {
    arr.sort(compareByDifficulty);
  }

  const units = [...byUnit.keys()].sort();
  const unitCount = units.length;
  if (unitCount === 0) return [];

  const perUnitPerRound = Math.floor(perRound / unitCount);
  const extra = perRound - perUnitPerRound * unitCount;

  // 풀이 큰 단원부터 extra slot 배정 (id로 tie-break)
  const extraOrder = units
    .slice()
    .sort((a, b) => {
      const diff = (byUnit.get(b)!.length) - (byUnit.get(a)!.length);
      return diff !== 0 ? diff : a.localeCompare(b);
    });

  const result: QuestionRecord[][] = [];
  for (let r = 0; r < rounds; r++) {
    const round: QuestionRecord[] = [];
    const usedIndexByUnit = new Map<string, number>();

    // 단원별 균등 슬라이스
    if (perUnitPerRound > 0) {
      for (const unit of units) {
        const arr = byUnit.get(unit)!;
        const start = r * perUnitPerRound;
        const slice = arr.slice(start, start + perUnitPerRound);
        round.push(...slice);
        usedIndexByUnit.set(unit, start + slice.length);
      }
    } else {
      for (const unit of units) usedIndexByUnit.set(unit, r);
    }

    // 나머지 extra만큼 풀이 큰 단원부터 추가
    for (let i = 0; i < extra; i++) {
      const unit = extraOrder[i % unitCount];
      const arr = byUnit.get(unit)!;
      const idx = usedIndexByUnit.get(unit) ?? 0;
      if (idx < arr.length) {
        round.push(arr[idx]);
        usedIndexByUnit.set(unit, idx + 1);
      }
    }

    if (round.length > 0) result.push(round.slice().sort(compareByDifficulty));
  }
  return result.filter((round) => round.length > 0);
}
