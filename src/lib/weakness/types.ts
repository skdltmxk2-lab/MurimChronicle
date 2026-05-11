// 취약유형 모의고사 — 공통 타입

export type UnitStat = {
  subject: string;
  unit: string;
  total: number;
  wrong: number;
  accuracy: number; // 0~1
  lastAttemptAt: string | null;
};

export type ProblemHistory = {
  problemId: string;
  attempts: number;
  wrongs: number;
  lastCorrect: boolean | null;
  lastAttemptAt: string | null;
};

export type WeaknessWeight = {
  subject: string;
  unit: string;
  weight: number; // softmax 결과 (합 1)
};

export type TierBreakdown = {
  tier1: number;
  tier2: number;
  tier3: number;
  tier4: number;
};

export type TierAssignment = {
  tier: 1 | 2 | 3 | 4;
  problemId: string;
  // 디버깅/리포트용 메타
  intent?: string;
};

// 출제 의도 스냅샷 (weakness_exam_snapshots.tier_breakdown)
//
// 각 tier에 problemIds 필드를 추가해 report가 problemId 기반으로 정확히 분류한다
// (spillover로 추가된 문제도 누락 없이 분류). units는 표시용으로 유지.
export type SnapshotTierBreakdown = {
  tier1: {
    count: number;
    units: Array<{ subject: string; unit: string; accuracy: number }>;
    problemIds?: string[]; // 신규: 실제 출제된 problem 직접 매핑
  };
  tier2: {
    count: number;
    units: Array<{ subject: string; unit: string; type: "unit" | "concept" }>;
    problemIds?: string[];
  };
  tier3: { count: number; problemIds: string[] };
  tier4: {
    count: number;
    units: Array<{ subject: string; unit: string; difficulty: string }>;
    problemIds?: string[];
  };
};

// 응시 직전 사용자 상태 스냅샷 (user_state_before)
export type UserStateSnapshot = {
  totalAttempts: number;
  overallAccuracy: number;
  unitStats: UnitStat[];
};
