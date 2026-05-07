import { tierAtLeast, USER_TIER_LABELS, type MockUser, type UserTier } from "@/types/auth";

/**
 * 사용자가 required 등급 이상의 권한을 가지는지 검사.
 * - 관리자(role==='admin')는 등급과 무관하게 항상 true.
 * - 비로그인 사용자는 false.
 */
export function canUseTier(user: MockUser | null, required: UserTier): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  return tierAtLeast(user.tier, required);
}

export function tierLockMessage(required: UserTier): string {
  return `${USER_TIER_LABELS[required]} 등급부터 이용 가능합니다`;
}
