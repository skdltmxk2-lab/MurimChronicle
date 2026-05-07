export type MockUserRole = "student" | "admin";

export type UserTier = "go" | "plus" | "pro" | "max";

export const USER_TIER_ORDER: UserTier[] = ["go", "plus", "pro", "max"];

export const USER_TIER_LABELS: Record<UserTier, string> = {
  go: "Go",
  plus: "Plus",
  pro: "Pro",
  max: "Max",
};

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
