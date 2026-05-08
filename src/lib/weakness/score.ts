// 취약유형 모의고사 — 통계/가중치 계산
// 모든 함수는 service-role supabase client를 받아 RLS를 우회한다.

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  UnitStat,
  ProblemHistory,
  WeaknessWeight,
  UserStateSnapshot,
} from "@/lib/weakness/types";

const MIN_SAMPLES_FOR_WEAKNESS = 5; // 표본 5개 미만 unit은 노이즈 방지로 제외
const SOFTMAX_TEMPERATURE = 0.7;    // softmax 온도 (낮을수록 약점에 집중)

// ============================================================
// fetchers
// ============================================================
export async function fetchUnitStats(
  supabase: SupabaseClient,
  userId: string
): Promise<UnitStat[]> {
  const { data, error } = await supabase
    .from("user_unit_stats")
    .select("subject, unit, total, wrong, accuracy, last_attempt_at")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    subject: r.subject as string,
    unit: r.unit as string,
    total: r.total as number,
    wrong: r.wrong as number,
    accuracy: (r.accuracy as number | null) ?? 0,
    lastAttemptAt: (r.last_attempt_at as string | null) ?? null,
  }));
}

export async function fetchProblemHistory(
  supabase: SupabaseClient,
  userId: string
): Promise<ProblemHistory[]> {
  const { data, error } = await supabase
    .from("user_problem_history")
    .select("problem_id, attempts, wrongs, last_correct, last_attempt_at")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    problemId: r.problem_id as string,
    attempts: r.attempts as number,
    wrongs: r.wrongs as number,
    lastCorrect: (r.last_correct as boolean | null) ?? null,
    lastAttemptAt: (r.last_attempt_at as string | null) ?? null,
  }));
}

// ============================================================
// 종합 통계
// ============================================================
export function totalAttemptsFromUnitStats(stats: UnitStat[]): number {
  return stats.reduce((sum, s) => sum + s.total, 0);
}

export function overallAccuracy(stats: UnitStat[]): number {
  const total = totalAttemptsFromUnitStats(stats);
  if (total === 0) return 0;
  const correct = stats.reduce((sum, s) => sum + (s.total - s.wrong), 0);
  return correct / total;
}

// ============================================================
// 약점 가중치 (softmax)
// ============================================================
/**
 * 표본 5+ 이상의 unit만 후보로 두고 (1 - accuracy)에 softmax 적용.
 * temperature=0.7 → 약점 단원에 더 집중된 분포.
 *
 * 결과는 weight 합 = 1.
 */
export function computeWeaknessWeights(stats: UnitStat[]): WeaknessWeight[] {
  const candidates = stats.filter((s) => s.total >= MIN_SAMPLES_FOR_WEAKNESS);
  if (candidates.length === 0) return [];

  // 점수 = 오답률 = 1 - accuracy
  const scores = candidates.map((s) => 1 - s.accuracy);
  // softmax with temperature
  const maxScore = Math.max(...scores);
  const exps = scores.map((s) => Math.exp((s - maxScore) / SOFTMAX_TEMPERATURE));
  const sum = exps.reduce((a, b) => a + b, 0);
  return candidates.map((s, i) => ({
    subject: s.subject,
    unit: s.unit,
    weight: exps[i] / sum,
  }));
}

/**
 * 가중치를 N문항으로 분배 (정수, 반올림 + 보정).
 * 합이 N이 되도록 잔차를 가중치 큰 순으로 +1/-1 보정.
 */
export function distributeByWeight(
  weights: WeaknessWeight[],
  totalCount: number
): Array<{ subject: string; unit: string; count: number }> {
  if (weights.length === 0 || totalCount <= 0) return [];
  const raw = weights.map((w) => w.weight * totalCount);
  const floored = raw.map((r) => Math.floor(r));
  let assigned = floored.reduce((a, b) => a + b, 0);
  const remainders = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r), weight: weights[i].weight }))
    .sort((a, b) => b.frac - a.frac || b.weight - a.weight);
  let idx = 0;
  while (assigned < totalCount && idx < remainders.length) {
    floored[remainders[idx].i] += 1;
    assigned += 1;
    idx += 1;
  }
  return weights.map((w, i) => ({
    subject: w.subject,
    unit: w.unit,
    count: floored[i],
  }));
}

// ============================================================
// 응시 직전 스냅샷 (snapshot용)
// ============================================================
export function buildUserStateSnapshot(stats: UnitStat[]): UserStateSnapshot {
  return {
    totalAttempts: totalAttemptsFromUnitStats(stats),
    overallAccuracy: overallAccuracy(stats),
    unitStats: stats,
  };
}

// ============================================================
// helpers
// ============================================================
export function topWeakUnits(stats: UnitStat[], n = 5): UnitStat[] {
  return stats
    .filter((s) => s.total >= MIN_SAMPLES_FOR_WEAKNESS)
    .slice() // 원본 변형 방지
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, n);
}

export function strongUnits(stats: UnitStat[], threshold = 0.7): UnitStat[] {
  return stats
    .filter((s) => s.total >= MIN_SAMPLES_FOR_WEAKNESS && s.accuracy >= threshold)
    .slice()
    .sort((a, b) => b.accuracy - a.accuracy);
}

export function subjectAccuracy(stats: UnitStat[]): Array<{ subject: string; accuracy: number; total: number }> {
  const bySubject = new Map<string, { total: number; correct: number }>();
  for (const s of stats) {
    const cur = bySubject.get(s.subject) ?? { total: 0, correct: 0 };
    cur.total += s.total;
    cur.correct += s.total - s.wrong;
    bySubject.set(s.subject, cur);
  }
  return Array.from(bySubject.entries()).map(([subject, v]) => ({
    subject,
    total: v.total,
    accuracy: v.total > 0 ? v.correct / v.total : 0,
  }));
}
