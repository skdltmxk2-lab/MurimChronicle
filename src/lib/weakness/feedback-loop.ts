// 취약유형 모의고사 — 직전 회차 결과를 다음 출제에 반영하는 룰 엔진
//
// 룰:
//  - 직전 Tier 1 unit 정답률 ≥ 80% → 해당 unit을 Tier 4 후보로 이동
//  - 직전 Tier 1 unit 정답률 ≤ 50% → 해당 unit Tier 1 유지 + 비중 ↑
//  - 직전 Tier 2 unit 정답률 ≤ 50% → Tier 1으로 승격 (확정 약점)
//  - 직전 Tier 3 정답률 ≥ 75% → 다음 Tier 3 난이도 +1
//  - 직전 Tier 3 정답률 ≤ 40% → 동일 영역, 난이도 유지
//  - 직전 Tier 4 정답률 ≥ 70% → 다음 Tier 4 난이도 +1
//
// MVP 단계에서는 통계 기반 자연 적응(약점 unit이 다음 회차에 자연스럽게 가중치
// 상승, 강점 unit은 약화)이 이미 작동하므로 직접 추가 가중치는 작게 둔다.
// 본 모듈은 hint를 산출해 select.ts/score.ts가 참고하게 한다.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AttemptResult } from "@/types/exam";
import type { SnapshotTierBreakdown } from "@/lib/weakness/types";

export type FeedbackHints = {
  // Tier 2에서 Tier 1으로 승격할 unit
  promoteToTier1: Array<{ subject: string; unit: string }>;
  // Tier 1에서 Tier 4로 강등할 unit (약점 졸업)
  demoteToTier4: Array<{ subject: string; unit: string }>;
  // Tier 3 다음 회차 난이도 시프트 (-1, 0, +1)
  tier3DifficultyShift: number;
  // Tier 4 다음 회차 난이도 시프트
  tier4DifficultyShift: number;
};

/**
 * 직전 weakness 시험의 attempt + snapshot을 보고 다음 회차에 반영할 hint 생성.
 * 만약 직전 시험이 없거나 매칭 실패면 모든 hint를 비워 둔다(중립).
 */
export async function deriveFeedbackHints(
  supabase: SupabaseClient,
  userId: string
): Promise<FeedbackHints> {
  const empty: FeedbackHints = {
    promoteToTier1: [],
    demoteToTier4: [],
    tier3DifficultyShift: 0,
    tier4DifficultyShift: 0,
  };

  // 가장 최근 weakness 시험 snapshot + attempt 조회
  const { data: snap } = await supabase
    .from("weakness_exam_snapshots")
    .select("exam_id, attempt_id, tier_breakdown")
    .eq("user_id", userId)
    .not("attempt_id", "is", null) // 응시 완료된 것만
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!snap) return empty;

  const { data: attempt } = await supabase
    .from("exam_attempts")
    .select("result")
    .eq("attempt_id", snap.attempt_id as string)
    .maybeSingle();
  if (!attempt) return empty;

  const result = attempt.result as AttemptResult | null;
  if (!result?.items) return empty;
  const breakdown = snap.tier_breakdown as SnapshotTierBreakdown;

  // 시험 안에서 problem_id → tier 매핑 (snapshot tier3 problem_ids 활용 가능)
  // 그 외 tier 식별은 snapshot의 unit 기반으로 대략 매핑한다.
  // (정확한 tier 매핑이 필요하면 snapshot에 problem_id별 tier를 저장해야 하나
  //  현재 v1 스펙에서는 unit-based 추정으로 충분.)
  const tier3Set = new Set(breakdown.tier3?.problemIds ?? []);

  // 시험 안에서 사용된 questions 메타 (subject/unit) 한 번에 조회
  const ids = result.items.map((it) => it.problemId);
  const { data: questions } = await supabase
    .from("questions")
    .select("id, subject, unit")
    .in("id", ids);
  const meta = new Map<string, { subject: string; unit: string }>();
  for (const q of questions ?? []) {
    meta.set(q.id as string, { subject: q.subject as string, unit: q.unit as string });
  }

  // tier1 unit 정답률 집계
  const tier1Units = new Set(
    (breakdown.tier1?.units ?? []).map((u) => `${u.subject}|${u.unit}`)
  );
  const tier2Units = new Set(
    (breakdown.tier2?.units ?? []).map((u) => `${u.subject}|${u.unit}`)
  );
  const tier4Units = new Set(
    (breakdown.tier4?.units ?? []).map((u) => `${u.subject}|${u.unit}`)
  );

  const accumulator = new Map<string, { total: number; correct: number; tier: 1 | 2 | 3 | 4 }>();
  let tier3Total = 0;
  let tier3Correct = 0;
  let tier4Total = 0;
  let tier4Correct = 0;

  for (const it of result.items) {
    const m = meta.get(it.problemId);
    if (!m) continue;
    const key = `${m.subject}|${m.unit}`;

    let tier: 1 | 2 | 3 | 4 | null = null;
    if (tier3Set.has(it.problemId)) tier = 3;
    else if (tier1Units.has(key)) tier = 1;
    else if (tier2Units.has(key)) tier = 2;
    else if (tier4Units.has(key)) tier = 4;

    if (!tier) continue;

    if (tier === 3) {
      tier3Total += 1;
      if (it.isCorrect) tier3Correct += 1;
      continue;
    }
    if (tier === 4) {
      tier4Total += 1;
      if (it.isCorrect) tier4Correct += 1;
      continue;
    }

    const cur = accumulator.get(key) ?? { total: 0, correct: 0, tier };
    cur.total += 1;
    if (it.isCorrect) cur.correct += 1;
    cur.tier = tier;
    accumulator.set(key, cur);
  }

  const promoteToTier1: Array<{ subject: string; unit: string }> = [];
  const demoteToTier4: Array<{ subject: string; unit: string }> = [];

  for (const [key, v] of accumulator) {
    if (v.total === 0) continue;
    const acc = v.correct / v.total;
    const [subject, unit] = key.split("|");
    if (v.tier === 1) {
      if (acc >= 0.8) demoteToTier4.push({ subject, unit });
      // ≤ 0.5는 자연히 다음 회차의 weights에서 가중치가 더 높게 잡혀 별도 hint 불필요.
    } else if (v.tier === 2) {
      if (acc <= 0.5) promoteToTier1.push({ subject, unit });
    }
  }

  let tier3Shift = 0;
  if (tier3Total > 0) {
    const acc = tier3Correct / tier3Total;
    if (acc >= 0.75) tier3Shift = 1;
    else if (acc <= 0.4) tier3Shift = 0; // 동일 유지
  }

  let tier4Shift = 0;
  if (tier4Total > 0) {
    const acc = tier4Correct / tier4Total;
    if (acc >= 0.7) tier4Shift = 1;
  }

  return {
    promoteToTier1,
    demoteToTier4,
    tier3DifficultyShift: tier3Shift,
    tier4DifficultyShift: tier4Shift,
  };
}
