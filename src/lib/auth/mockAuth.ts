"use client";

import type { MockUser } from "@/types/auth";
import type { IAuthRepository } from "@/lib/auth/IAuthRepository";
import { supabaseAuthRepo } from "@/lib/auth/SupabaseAuthRepository";

export type { MockUser, MockUserRole } from "@/types/auth";
export { ADMIN_PASSWORD } from "@/lib/auth/constants";

export function isAdminUser(user: MockUser | null): boolean {
  return user?.role === "admin";
}

export const authRepo: IAuthRepository = supabaseAuthRepo;
