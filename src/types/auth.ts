export type MockUserRole = "student" | "admin";

export type UserTier = "free" | "go" | "plus" | "pro" | "max";

export const USER_TIER_ORDER: UserTier[] = ["free", "go", "plus", "pro", "max"];

export const USER_TIER_LABELS: Record<UserTier, string> = {
  free: "Free",
  go: "Go",
  plus: "Plus",
  pro: "Pro",
  max: "Max",
};

/**
 * 등급 권한 비교 헬퍼. user의 tier가 required 이상인지 검사.
 * 예: hasTier(user, "plus") → user의 tier가 plus/pro/max 중 하나면 true.
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
