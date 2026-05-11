// 취약유형 모의고사 — 응시 후 분석 리포트 생성
//
// 입력: attemptId
// 출력: tier별 정답률 + 개선 영역 + 다음 응시 권장

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AttemptResult } from "@/types/exam";
import type {
  SnapshotTierBreakdown,
  UserStateSnapshot,
  UnitStat,
} from "@/lib/weakness/types";
import { fetchUnitStats, subjectAccuracy, topWeakUnits } from "@/lib/weakness/score";

export type WeaknessReport = {
  attemptId: string;
  examTitle: string;
  score: { correct: number; total: number; percent: number };
  elapsedSec: number;
  submittedAt: string;
  tierResults: {
    tier1: TierResult;
    tier2: TierResult;
    tier3: TierResult;
    tier4: TierResult;
  };
  improvements: Array<{
    subject: string;
    unit: string;
    before: number;
    after: number;
    delta: number;
  }>;
  needsReview: Array<{
    subject: string;
    unit: string;
    accuracy: number;
    reason: string;
  }>;
  nextExam: {
    requiredQuestions: number;
    suggestedUnits: Array<{ subject: string; unit: string }>;
  };
};

export type TierResult = {
  target: number; // 출제 의도 (원래 11/7/4/3 또는 재분배 결과)
  total: number;  // 실제 채점에 잡힌 문항 수 (= acc.total)
  correct: number;
  percent: number; // correct / total × 100
  units: Array<{ subject: string; unit: string; accuracyInExam: number }>;
};

const TIER_TARGETS_NORMAL = { tier1: 11, tier2: 7, tier3: 4, tier4: 3 };

export async function generateReport(
  supabase: SupabaseClient,
  userId: string,
  attemptId: string
): Promise<WeaknessReport | { error: string }> {
  // 1) attempt 조회
  const { data: attempt } = await supabase
    .from("exam_attempts")
    .select("attempt_id, exam_id, result")
    .eq("attempt_id", attemptId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!attempt) return { error: "응시 기록이 없습니다." };

  // 2) snapshot은 exam_id 기준으로 조회 (attempt_id link 트리거가 갱신하지만
  //    exam_id로 직접 lookup하는 게 더 안전)
  const { data: snap } = await supabase
    .from("weakness_exam_snapshots")
    .select("exam_id, tier_breakdown, user_state_before")
    .eq("exam_id", attempt.exam_id as string)
    .eq("user_id", userId)
    .maybeSingle();
  if (!snap) return { error: "이 시험은 취약유형 모의고사가 아닙니다." };

  const result = attempt.result as AttemptResult;
  const breakdown = snap.tier_breakdown as SnapshotTierBreakdown;
  const before = snap.user_state_before as UserStateSnapshot;

  // 2) questions 메타 조인 (한 번에)
  const ids = result.items.map((it) => it.problemId);
  const { data: questions } = await supabase
    .from("questions")
    .select("id, subject, unit")
    .in("id", ids);
  const meta = new Map<string, { subject: string; unit: string }>();
  for (const q of questions ?? []) {
    meta.set(q.id as string, { subject: q.subject as string, unit: q.unit as string });
  }

  // 3) tier 분류
  const tier3Set = new Set(breakdown.tier3?.problemIds ?? []);
  const tier1UnitSet = new Set(
    (breakdown.tier1?.units ?? []).map((u) => `${u.subject}|${u.unit}`)
  );
  const tier2UnitSet = new Set(
    (breakdown.tier2?.units ?? []).map((u) => `${u.subject}|${u.unit}`)
  );
  const tier4UnitSet = new Set(
    (breakdown.tier4?.units ?? []).map((u) => `${u.subject}|${u.unit}`)
  );

  type TierAcc = {
    total: number;
    correct: number;
    perUnit: Map<string, { total: number; correct: number; subject: string; unit: string }>;
  };
  const t1: TierAcc = { total: 0, correct: 0, perUnit: new Map() };
  const t2: TierAcc = { total: 0, correct: 0, perUnit: new Map() };
  const t3: TierAcc = { total: 0, correct: 0, perUnit: new Map() };
  const t4: TierAcc = { total: 0, correct: 0, perUnit: new Map() };

  for (const it of result.items) {
    const m = meta.get(it.problemId);
    if (!m) continue;
    const key = `${m.subject}|${m.unit}`;

    let target: TierAcc | null = null;
    if (tier3Set.has(it.problemId)) target = t3;
    else if (tier1UnitSet.has(key)) target = t1;
    else if (tier2UnitSet.has(key)) target = t2;
    else if (tier4UnitSet.has(key)) target = t4;

    if (!target) continue;
    target.total += 1;
    if (it.isCorrect) target.correct += 1;
    const cur = target.perUnit.get(key) ?? { total: 0, correct: 0, subject: m.subject, unit: m.unit };
    cur.total += 1;
    if (it.isCorrect) cur.correct += 1;
    target.perUnit.set(key, cur);
  }

  function toTierResult(acc: TierAcc, target: number): TierResult {
    const percent = acc.total > 0 ? Math.round((acc.correct / acc.total) * 100) : 0;
    return {
      target,
      total: acc.total,
      correct: acc.correct,
      percent,
      units: Array.from(acc.perUnit.values()).map((u) => ({
        subject: u.subject,
        unit: u.unit,
        accuracyInExam: u.total > 0 ? u.correct / u.total : 0,
      })),
    };
  }

  // 4) 시험 후 새 통계와 비교한 개선 영역
  const afterStats = await fetchUnitStats(supabase, userId);
  const beforeMap = new Map<string, number>();
  for (const s of before.unitStats ?? []) {
    beforeMap.set(`${s.subject}|${s.unit}`, s.accuracy);
  }
  const improvements: WeaknessReport["improvements"] = [];
  for (const s of afterStats) {
    const key = `${s.subject}|${s.unit}`;
    const beforeAcc = beforeMap.get(key);
    if (beforeAcc === undefined) continue;
    const delta = s.accuracy - beforeAcc;
    if (delta >= 0.2) {
      improvements.push({
        subject: s.subject,
        unit: s.unit,
        before: beforeAcc,
        after: s.accuracy,
        delta,
      });
    }
  }
  improvements.sort((a, b) => b.delta - a.delta);

  // 5) 추가 복습 권장 영역 (이번 시험에서 정답률 ≤ 0.6인 unit)
  const needsReview: WeaknessReport["needsReview"] = [];
  for (const acc of [t1, t2, t3, t4]) {
    for (const u of acc.perUnit.values()) {
      if (u.total === 0) continue;
      const ratio = u.correct / u.total;
      if (ratio <= 0.6) {
        needsReview.push({
          subject: u.subject,
          unit: u.unit,
          accuracy: ratio,
          reason: ratio === 0 ? "0% — 집중 학습 필요" : "정답률 60% 이하",
        });
      }
    }
  }
  // 중복 제거 (같은 unit이 여러 tier에 있을 수 있어)
  const dedupKeys = new Set<string>();
  const uniqueReview = needsReview.filter((n) => {
    const k = `${n.subject}|${n.unit}`;
    if (dedupKeys.has(k)) return false;
    dedupKeys.add(k);
    return true;
  });

  // 6) 다음 시험 추천
  const weakNow = topWeakUnits(afterStats, 5);
  const nextSuggested = weakNow.map((s) => ({ subject: s.subject, unit: s.unit }));

  return {
    attemptId,
    examTitle: result.examTitle ?? "취약유형 모의고사",
    score: result.score,
    elapsedSec: result.elapsedSec,
    submittedAt: result.submittedAt,
    tierResults: {
      tier1: toTierResult(t1, breakdown.tier1?.count ?? TIER_TARGETS_NORMAL.tier1),
      tier2: toTierResult(t2, breakdown.tier2?.count ?? TIER_TARGETS_NORMAL.tier2),
      tier3: toTierResult(t3, breakdown.tier3?.count ?? TIER_TARGETS_NORMAL.tier3),
      tier4: toTierResult(t4, breakdown.tier4?.count ?? TIER_TARGETS_NORMAL.tier4),
    },
    improvements,
    needsReview: uniqueReview,
    nextExam: {
      requiredQuestions: 100,
      suggestedUnits: nextSuggested,
    },
  };
}

// analysis API에서 쓰는 가벼운 종합 통계
export type WeaknessAnalysis = {
  ready: boolean; // 200문항+
  totalAttempts: number;
  overallAccuracy: number;
  unitStats: UnitStat[];
  topWeakUnits: UnitStat[];
  subjectAccuracy: Array<{ subject: string; accuracy: number; total: number }>;
  recentTrend: Array<{ weekStart: string; accuracy: number }>;
};

export async function buildAnalysis(
  supabase: SupabaseClient,
  userId: string
): Promise<WeaknessAnalysis> {
  const stats = await fetchUnitStats(supabase, userId);
  const totalAttempts = stats.reduce((sum, s) => sum + s.total, 0);
  const totalCorrect = stats.reduce((sum, s) => sum + (s.total - s.wrong), 0);
  const overall = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;

  // 최근 4주 정답률 추이: exam_attempts에서 result.submittedAt 기준 집계
  const trend = await computeRecentTrend(supabase, userId);

  return {
    ready: totalAttempts >= 200,
    totalAttempts,
    overallAccuracy: overall,
    unitStats: stats,
    topWeakUnits: topWeakUnits(stats, 5),
    subjectAccuracy: subjectAccuracy(stats),
    recentTrend: trend,
  };
}

async function computeRecentTrend(
  supabase: SupabaseClient,
  userId: string
): Promise<Array<{ weekStart: string; accuracy: number }>> {
  const since = new Date(Date.now() - 28 * 86400_000);
  const { data } = await supabase
    .from("exam_attempts")
    .select("result")
    .eq("user_id", userId);
  if (!data) return [];
  type Bucket = { total: number; correct: number };
  const buckets = new Map<string, Bucket>();
  for (const row of data) {
    const r = row.result as AttemptResult | null;
    if (!r?.submittedAt || !r.items) continue;
    const ts = Date.parse(r.submittedAt);
    if (ts < since.getTime()) continue;
    const d = new Date(ts);
    // 주 시작(일요일) 기준
    const day = d.getDay();
    const weekStartTs = ts - day * 86400_000;
    const weekStart = new Date(weekStartTs).toISOString().slice(0, 10);
    const cur = buckets.get(weekStart) ?? { total: 0, correct: 0 };
    for (const it of r.items) {
      cur.total += 1;
      if (it.isCorrect) cur.correct += 1;
    }
    buckets.set(weekStart, cur);
  }
  const arr = Array.from(buckets.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([weekStart, b]) => ({
      weekStart,
      accuracy: b.total > 0 ? b.correct / b.total : 0,
    }));
  return arr.slice(-4);
}
