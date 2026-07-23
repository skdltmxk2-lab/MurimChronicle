// 취약유형 모의고사 — 4-tier 추출 + spillover
//
// 출력은 Problem ID 배열 + 어느 tier로 골랐는지 메타.
// 실제 문제 본문 join은 호출자가 questions 테이블에서 별도로 한다.

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  UnitStat,
  ProblemHistory,
  WeaknessWeight,
  TierAssignment,
  TierBreakdown,
  SnapshotTierBreakdown,
} from "@/lib/weakness/types";
import {
  computeWeaknessWeights,
  distributeByWeight,
  strongUnits,
} from "@/lib/weakness/score";
import { isStandaloneQuestion } from "@/lib/questions/standalone";

// 25문항 기준 비율
const TARGET_TOTAL = 25;
const RATIO_NORMAL: TierBreakdown = { tier1: 11, tier2: 7, tier3: 4, tier4: 3 };
const RATIO_COLD_START: TierBreakdown = { tier1: 9, tier2: 10, tier3: 3, tier4: 3 };

const DIFFICULTY_ORDER = ["easy", "easyMedium", "medium", "mediumHard", "hard", "killer"] as const;
type Difficulty = (typeof DIFFICULTY_ORDER)[number];
const DIFFICULTY_INDEX: Record<Difficulty, number> = {
  easy: 0, easyMedium: 1, medium: 2, mediumHard: 3, hard: 4, killer: 5,
};

const RECENT_30D_MS = 30 * 86400_000;
const TIER3_COOLDOWN_MS = 7 * 86400_000;

// ============================================================
// 후보 풀 조회 helpers
// ============================================================
type Candidate = {
  id: string;
  subject: string;
  unit: string;
  concept: string;
  question: string;
  explanation: string;
  tags: string[];
  difficulty: Difficulty;
};

async function fetchQuestionsByUnits(
  supabase: SupabaseClient,
  units: Array<{ subject: string; unit: string }>
): Promise<Candidate[]> {
  if (units.length === 0) return [];
  const subjects = Array.from(new Set(units.map((u) => u.subject)));
  const unitNames = Array.from(new Set(units.map((u) => u.unit)));
  const { data, error } = await supabase
    .from("questions")
    .select("id, subject, unit, concept, question, explanation, tags, difficulty")
    .in("subject", subjects)
    .in("unit", unitNames)
    .eq("quality_status", "approved");
  if (error) throw error;
  // subject/unit pair 정확히 일치하는 것만 필터링
  const pairSet = new Set(units.map((u) => `${u.subject}|${u.unit}`));
  return (data ?? [])
    .map((q) => ({
      id: q.id as string,
      subject: q.subject as string,
      unit: q.unit as string,
      concept: q.concept as string,
      question: q.question as string,
      explanation: q.explanation as string,
      tags: (q.tags ?? []) as string[],
      difficulty: q.difficulty as Difficulty,
    }))
    .filter((q) => pairSet.has(`${q.subject}|${q.unit}`) && isStandaloneQuestion(q));
}

async function fetchAllQuestions(
  supabase: SupabaseClient
): Promise<Candidate[]> {
  const PAGE = 1000;
  const all: Candidate[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("questions")
      .select("id, subject, unit, concept, question, explanation, tags, difficulty")
      .eq("quality_status", "approved")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const q of data) {
      all.push({
        id: q.id as string,
        subject: q.subject as string,
        unit: q.unit as string,
        concept: q.concept as string,
        question: q.question as string,
        explanation: q.explanation as string,
        tags: (q.tags ?? []) as string[],
        difficulty: q.difficulty as Difficulty,
      });
    }
    if (data.length < PAGE) break;
  }
  return all.filter(isStandaloneQuestion);
}

// ============================================================
// 사용자 상태 인덱스 (빠른 조회용)
// ============================================================
type UserIndex = {
  solvedIds: Set<string>;             // 한 번이라도 푼 적 있는 문제 (맞건 틀리건)
  correctIds: Set<string>;            // 맞춘 적 있는 문제 (Tier 1/2/4 영구 제외)
  wrongIds: Set<string>;              // 틀린 적 있는 문제 (Tier 3 후보)
  problemHistoryById: Map<string, ProblemHistory>;
  recent30dIds: Set<string>;          // 30일 내 본 문제 (Tier 3 제외하고 모두 차단)
  recentTier3CooldownIds: Set<string>; // 7일 내 Tier 3에서 본 문제 차단용
  unitsTouched: Set<string>;          // "subject|unit" — 해본 적 있는 unit
  conceptsTouched: Set<string>;       // "subject|unit|concept" — 해본 적 있는 개념
};

function buildUserIndex(
  history: ProblemHistory[],
  questions: Candidate[]
): UserIndex {
  const ix: UserIndex = {
    solvedIds: new Set(),
    correctIds: new Set(),
    wrongIds: new Set(),
    problemHistoryById: new Map(),
    recent30dIds: new Set(),
    recentTier3CooldownIds: new Set(),
    unitsTouched: new Set(),
    conceptsTouched: new Set(),
  };

  const qById = new Map<string, Candidate>();
  for (const q of questions) qById.set(q.id, q);

  const now = Date.now();
  for (const h of history) {
    ix.problemHistoryById.set(h.problemId, h);
    ix.solvedIds.add(h.problemId);

    // 가장 최근 시도가 정답이면 correctIds (한번이라도 맞췄다고 봐도 OK)
    // 명세: '맞춘 문제 ID는 영구 제외'. 이력상 wrongs<attempts이거나 last_correct=true이면 한번 이상 맞춘 것.
    const everCorrect = (h.attempts - h.wrongs) > 0 || h.lastCorrect === true;
    if (everCorrect) ix.correctIds.add(h.problemId);
    if (h.wrongs > 0) ix.wrongIds.add(h.problemId);

    if (h.lastAttemptAt) {
      const ts = Date.parse(h.lastAttemptAt);
      if (now - ts <= RECENT_30D_MS) ix.recent30dIds.add(h.problemId);
      if (now - ts <= TIER3_COOLDOWN_MS) ix.recentTier3CooldownIds.add(h.problemId);
    }

    const q = qById.get(h.problemId);
    if (q) {
      ix.unitsTouched.add(`${q.subject}|${q.unit}`);
      ix.conceptsTouched.add(`${q.subject}|${q.unit}|${q.concept}`);
    }
  }
  return ix;
}

// ============================================================
// Tier별 후보 풀 추출
// ============================================================

// Tier 1 — 약점 단원의 신규 쉬운 문제
function tier1Candidates(
  questions: Candidate[],
  ix: UserIndex,
  weights: WeaknessWeight[]
): Map<string, Candidate[]> {
  // unit별 후보 (한 번도 안 푼 + 30일 내 노출 안 된 + 난이도 asc)
  const byUnit = new Map<string, Candidate[]>();
  for (const w of weights) {
    const key = `${w.subject}|${w.unit}`;
    const list = questions
      .filter(
        (q) =>
          q.subject === w.subject &&
          q.unit === w.unit &&
          !ix.solvedIds.has(q.id) &&
          !ix.recent30dIds.has(q.id)
      )
      .sort((a, b) => DIFFICULTY_INDEX[a.difficulty] - DIFFICULTY_INDEX[b.difficulty]);
    byUnit.set(key, list);
  }
  return byUnit;
}

function pickTier1(
  weights: WeaknessWeight[],
  byUnit: Map<string, Candidate[]>,
  count: number
): TierAssignment[] {
  const distribution = distributeByWeight(weights, count);
  const result: TierAssignment[] = [];
  // 1차: 분배 비율대로
  for (const d of distribution) {
    const key = `${d.subject}|${d.unit}`;
    const pool = byUnit.get(key) ?? [];
    for (let i = 0; i < d.count && i < pool.length; i++) {
      result.push({ tier: 1, problemId: pool[i].id, intent: `weak unit: ${key}` });
    }
  }
  // 2차: 부족하면 같은 subject 내 다른 weak unit으로 fallback
  const need = count - result.length;
  if (need > 0) {
    const taken = new Set(result.map((r) => r.problemId));
    const flat = weights
      .flatMap((w) => byUnit.get(`${w.subject}|${w.unit}`) ?? [])
      .filter((q) => !taken.has(q.id));
    for (let i = 0; i < need && i < flat.length; i++) {
      result.push({ tier: 1, problemId: flat[i].id, intent: "weak unit fallback" });
    }
  }
  return result;
}

// Tier 2 — 미체험 유형 (unit 미체험 70%, concept 미체험 30%)
function pickTier2(
  questions: Candidate[],
  ix: UserIndex,
  count: number
): TierAssignment[] {
  if (count <= 0) return [];
  const aTarget = Math.round(count * 0.7);
  const bTarget = count - aTarget;

  // 2-A: unit 미체험 — medium 위주, 5과목 분산
  const aPool = questions.filter(
    (q) =>
      !ix.unitsTouched.has(`${q.subject}|${q.unit}`) &&
      !ix.recent30dIds.has(q.id)
  );
  // 난이도 medium 우선
  aPool.sort((a, b) => Math.abs(DIFFICULTY_INDEX[a.difficulty] - DIFFICULTY_INDEX.medium)
                       - Math.abs(DIFFICULTY_INDEX[b.difficulty] - DIFFICULTY_INDEX.medium));
  const aPicked = balancedPickBySubject(aPool, aTarget);

  // 2-B: 푼 unit 안에서 concept 미체험
  const taken = new Set(aPicked.map((p) => p.id));
  const bPool = questions.filter(
    (q) =>
      ix.unitsTouched.has(`${q.subject}|${q.unit}`) &&
      !ix.conceptsTouched.has(`${q.subject}|${q.unit}|${q.concept}`) &&
      !ix.solvedIds.has(q.id) &&
      !ix.recent30dIds.has(q.id) &&
      !taken.has(q.id)
  );
  bPool.sort((a, b) => Math.abs(DIFFICULTY_INDEX[a.difficulty] - DIFFICULTY_INDEX.medium)
                       - Math.abs(DIFFICULTY_INDEX[b.difficulty] - DIFFICULTY_INDEX.medium));
  const bPicked = balancedPickBySubject(bPool, bTarget);

  return [
    ...aPicked.map((q): TierAssignment => ({ tier: 2, problemId: q.id, intent: "unfamiliar unit" })),
    ...bPicked.map((q): TierAssignment => ({ tier: 2, problemId: q.id, intent: "unfamiliar concept" })),
  ];
}

function balancedPickBySubject(pool: Candidate[], n: number): Candidate[] {
  if (n <= 0 || pool.length === 0) return [];
  const bySubject = new Map<string, Candidate[]>();
  for (const q of pool) {
    const list = bySubject.get(q.subject) ?? [];
    list.push(q);
    bySubject.set(q.subject, list);
  }
  // 라운드로빈
  const subjects = Array.from(bySubject.keys());
  const result: Candidate[] = [];
  let i = 0;
  while (result.length < n) {
    let progressed = false;
    for (const s of subjects) {
      if (result.length >= n) break;
      const list = bySubject.get(s) ?? [];
      if (i < list.length) {
        result.push(list[i]);
        progressed = true;
      }
    }
    if (!progressed) break;
    i++;
  }
  return result;
}

// Tier 3 — 오답 재출제. 어려운 것 우선, 7일 cooldown 통과한 것만.
function pickTier3(
  questions: Candidate[],
  ix: UserIndex,
  history: ProblemHistory[],
  count: number
): TierAssignment[] {
  if (count <= 0) return [];
  const qById = new Map<string, Candidate>();
  for (const q of questions) qById.set(q.id, q);

  const wrongs = history
    .filter((h) => h.wrongs > 0)
    .filter((h) => !ix.recentTier3CooldownIds.has(h.problemId));

  const sorted = wrongs
    .map((h) => ({ h, q: qById.get(h.problemId) }))
    .filter((x): x is { h: ProblemHistory; q: Candidate } => x.q !== undefined)
    .sort((a, b) => {
      // 난이도 desc, 그 다음 wrongs desc
      const di = DIFFICULTY_INDEX[b.q.difficulty] - DIFFICULTY_INDEX[a.q.difficulty];
      if (di !== 0) return di;
      return b.h.wrongs - a.h.wrongs;
    });

  return sorted.slice(0, count).map(
    (x): TierAssignment => ({ tier: 3, problemId: x.q.id, intent: "review wrong" })
  );
}

// Tier 4 — 강점 단원 심화
function pickTier4(
  questions: Candidate[],
  ix: UserIndex,
  stats: UnitStat[],
  count: number
): TierAssignment[] {
  if (count <= 0) return [];
  const strong = strongUnits(stats, 0.7);
  if (strong.length === 0) return [];

  const result: TierAssignment[] = [];
  const taken = new Set<string>();

  // unit별 평균 난이도 추정 (사용자가 푼 문제의 평균)
  // 간단히는 평균 medium → +1 단계 hard 출제, mediumHard → hard/killer
  for (const s of strong) {
    if (result.length >= count) break;
    // 사용자가 푼 그 unit의 문제들의 평균 난이도
    const solvedInUnit = questions.filter(
      (q) => q.subject === s.subject && q.unit === s.unit && ix.solvedIds.has(q.id)
    );
    if (solvedInUnit.length === 0) continue;
    const avgIdx =
      solvedInUnit.reduce((sum, q) => sum + DIFFICULTY_INDEX[q.difficulty], 0) /
      solvedInUnit.length;
    const targetMin = Math.min(5, Math.max(0, Math.round(avgIdx + 1)));
    const targetMax = Math.min(5, Math.max(targetMin, Math.round(avgIdx + 2)));

    // 같은 unit 안에서 대상 난이도, 안 푼 문제, 30일 내 노출 안 된 문제
    const pool = questions.filter(
      (q) =>
        q.subject === s.subject &&
        q.unit === s.unit &&
        !ix.solvedIds.has(q.id) &&
        !ix.recent30dIds.has(q.id) &&
        !taken.has(q.id) &&
        DIFFICULTY_INDEX[q.difficulty] >= targetMin &&
        DIFFICULTY_INDEX[q.difficulty] <= targetMax
    );
    if (pool.length === 0) continue;
    const pick = pool[0]; // 그 unit에서 첫 번째 (정렬 유지된 순서)
    result.push({ tier: 4, problemId: pick.id, intent: `strong unit deep: ${s.subject}|${s.unit}` });
    taken.add(pick.id);
  }
  return result;
}

// ============================================================
// 메인 조립 함수
// ============================================================
export type AssembleResult =
  | {
      ok: true;
      assignments: TierAssignment[];
      breakdown: SnapshotTierBreakdown;
      ratio: TierBreakdown;
    }
  | { ok: false; reason: string };

export type AssembleOptions = {
  isFirstWeaknessExam?: boolean; // true면 cold start 비율 사용
};

export async function assembleWeaknessExam(
  supabase: SupabaseClient,
  userId: string,
  unitStats: UnitStat[],
  history: ProblemHistory[],
  opts: AssembleOptions = {}
): Promise<AssembleResult> {
  const ratio = opts.isFirstWeaknessExam ? RATIO_COLD_START : RATIO_NORMAL;

  const allQuestions = await fetchAllQuestions(supabase);
  const ix = buildUserIndex(history, allQuestions);
  const weights = computeWeaknessWeights(unitStats);

  // 후보 풀 조회 (Tier 1)
  const tier1ByUnit = tier1Candidates(allQuestions, ix, weights);

  // 1차 배치
  let tier1 = pickTier1(weights, tier1ByUnit, ratio.tier1);
  let tier2 = pickTier2(allQuestions, ix, ratio.tier2);
  let tier3 = pickTier3(allQuestions, ix, history, ratio.tier3);
  let tier4 = pickTier4(allQuestions, ix, unitStats, ratio.tier4);

  // 중복 제거 (전 Tier 합집합)
  const dedupe = (assignments: TierAssignment[]) => {
    const seen = new Set<string>();
    const out: TierAssignment[] = [];
    for (const a of assignments) {
      if (seen.has(a.problemId)) continue;
      seen.add(a.problemId);
      out.push(a);
    }
    return out;
  };
  let combined = dedupe([...tier1, ...tier2, ...tier3, ...tier4]);

  // Spillover: 부족분 보충
  // Tier 1 부족 → Tier 4 후보에서 가져와 Tier 1로 이동
  // Tier 2 부족 → Tier 1으로 흡수
  // Tier 3 부족 → Tier 4로 흡수
  // Tier 4 부족 → Tier 2로 흡수
  // 단순화: 최종 25문항을 못 채울 때 Tier 1/2의 후보를 추가로 넣어 채운다.
  const taken = new Set(combined.map((a) => a.problemId));
  const need = TARGET_TOTAL - combined.length;
  if (need > 0) {
    // 약점 단원 / 미체험 유형 / 일반 미풀이 순으로 보충
    const tier1Pool = Array.from(tier1ByUnit.values()).flat().filter((q) => !taken.has(q.id));
    for (const q of tier1Pool) {
      if (combined.length >= TARGET_TOTAL) break;
      combined.push({ tier: 1, problemId: q.id, intent: "spillover→tier1" });
      taken.add(q.id);
    }
    if (combined.length < TARGET_TOTAL) {
      const remaining = allQuestions.filter(
        (q) => !taken.has(q.id) && !ix.correctIds.has(q.id) && !ix.recent30dIds.has(q.id)
      );
      for (const q of remaining) {
        if (combined.length >= TARGET_TOTAL) break;
        combined.push({ tier: 2, problemId: q.id, intent: "spillover→tier2" });
        taken.add(q.id);
      }
    }
  }

  if (combined.length < TARGET_TOTAL) {
    return {
      ok: false,
      reason: `25문항을 채울 수 없습니다 (현재 ${combined.length}). 더 많은 학습 후 재시도해 주세요.`,
    };
  }

  // 25개로 잘라낸 후 tier별로 다시 재집계
  combined = combined.slice(0, TARGET_TOTAL);
  const finalBreakdown: TierBreakdown = {
    tier1: combined.filter((a) => a.tier === 1).length,
    tier2: combined.filter((a) => a.tier === 2).length,
    tier3: combined.filter((a) => a.tier === 3).length,
    tier4: combined.filter((a) => a.tier === 4).length,
  };

  // SnapshotTierBreakdown
  const qById = new Map<string, Candidate>();
  for (const q of allQuestions) qById.set(q.id, q);
  const tier1Ids = combined.filter((a) => a.tier === 1).map((a) => a.problemId);
  const tier2Ids = combined.filter((a) => a.tier === 2).map((a) => a.problemId);
  const tier3Ids = combined.filter((a) => a.tier === 3).map((a) => a.problemId);
  const tier4Ids = combined.filter((a) => a.tier === 4).map((a) => a.problemId);
  const snapshot: SnapshotTierBreakdown = {
    tier1: {
      count: finalBreakdown.tier1,
      units: weights.slice(0, 5).map((w) => {
        const stat = unitStats.find((s) => s.subject === w.subject && s.unit === w.unit);
        return { subject: w.subject, unit: w.unit, accuracy: stat?.accuracy ?? 0 };
      }),
      problemIds: tier1Ids,
    },
    tier2: {
      count: finalBreakdown.tier2,
      units: combined
        .filter((a) => a.tier === 2)
        .map((a) => {
          const q = qById.get(a.problemId);
          return q
            ? {
                subject: q.subject,
                unit: q.unit,
                type: a.intent === "unfamiliar unit" ? ("unit" as const) : ("concept" as const),
              }
            : null;
        })
        .filter((x): x is { subject: string; unit: string; type: "unit" | "concept" } => x !== null),
      problemIds: tier2Ids,
    },
    tier3: {
      count: finalBreakdown.tier3,
      problemIds: tier3Ids,
    },
    tier4: {
      count: finalBreakdown.tier4,
      units: combined
        .filter((a) => a.tier === 4)
        .map((a): { subject: string; unit: string; difficulty: string } | null => {
          const q = qById.get(a.problemId);
          return q ? { subject: q.subject, unit: q.unit, difficulty: q.difficulty } : null;
        })
        .filter((x): x is { subject: string; unit: string; difficulty: string } => x !== null),
      problemIds: tier4Ids,
    },
  };

  return { ok: true, assignments: combined, breakdown: snapshot, ratio: finalBreakdown };
}
