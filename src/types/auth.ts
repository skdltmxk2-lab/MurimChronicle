export type MockUserRole = "student" | "admin";

// 요금제는 무료(free)와 단일 유료(pro) 2단계로 운영한다.
// 과거 go/plus/max 등급은 더 이상 사용하지 않으며, DB에 남아있는 값은
// normalizeTier로 free/pro에 매핑한다 (유료였던 등급은 모두 pro로 승계).
export type UserTier = "free" | "pro";

export const USER_TIER_ORDER: UserTier[] = ["free", "pro"];

export const USER_TIER_LABELS: Record<UserTier, string> = {
  free: "Free",
  pro: "Pro",
};

/**
 * DB/외부에서 들어온 등급 문자열을 현재 2단계 체계(free/pro)로 정규화한다.
 * - "free"(또는 알 수 없는 값) → "free"
 * - 과거 유료 등급(go/plus/pro/max) → "pro" (기존 유료 회원의 권한 승계)
 */
export function normalizeTier(value: unknown): UserTier {
  return value === "go" ||
    value === "plus" ||
    value === "pro" ||
    value === "max"
    ? "pro"
    : "free";
}

/**
 * 등급 권한 비교 헬퍼. user의 tier가 required 이상인지 검사.
 * 예: tierAtLeast(tier, "pro") → tier가 pro면 true.
 */
export function tierAtLeast(userTier: UserTier, required: UserTier): boolean {
  return USER_TIER_ORDER.indexOf(userTier) >= USER_TIER_ORDER.indexOf(required);
}

export type MockUser = {
  id?: string;
  name: string;
  role: MockUserRole;
  tier: UserTier;
  email?: string;
};

export type StudentAccount = {
  username: string;
  password: string;
  name: string;
  createdAt: string;
};
