"use client";

import { supabase } from "@/lib/supabase/client";
import type { MockUser, UserTier } from "@/types/auth";
import type { IAuthRepository } from "@/lib/auth/IAuthRepository";

function normalizeTier(value: unknown): UserTier {
  return value === "go" || value === "plus" || value === "pro" || value === "max"
    ? value
    : "free";
}

// 1-B에서 폐기된 routeroute 모드의 잔재 키. 한 번씩 청소만 한다.
const LEGACY_ADMIN_USER_KEY = "cbt:auth:admin:v1";
const STUDENT_USER_KEY = "cbt:auth:student:v1";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function clearLegacyAdminKey() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(LEGACY_ADMIN_USER_KEY);
}

function saveToStorage(key: string, value: unknown) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function removeFromStorage(key: string) {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(key);
}

async function loadProfile(userId: string): Promise<{ name: string; tier: string; is_admin: boolean } | null> {
  // 일부 사용자(ex. 마이그레이션 직전 가입)는 profiles row가 없을 수 있다.
  // .single()은 row 없으면 throw 하므로 .maybeSingle()로 안전하게.
  const { data } = await supabase
    .from("profiles")
    .select("name, tier, is_admin")
    .eq("id", userId)
    .maybeSingle();
  if (!data) return null;
  return {
    name: (data.name as string) ?? "",
    tier: (data.tier as string) ?? "free",
    is_admin: Boolean(data.is_admin),
  };
}

function buildUser(authUser: { id: string; email?: string | null }, profile: { name: string; tier: string; is_admin: boolean } | null): MockUser {
  const name = profile?.name || authUser.email?.split("@")[0] || "학생";
  const tier = normalizeTier(profile?.tier);
  const role: "student" | "admin" = profile?.is_admin ? "admin" : "student";
  return {
    id: authUser.id,
    name,
    role,
    tier,
    email: authUser.email ?? undefined,
  };
}

export const supabaseAuthRepo: IAuthRepository = {
  async getCurrentUser(): Promise<MockUser | null> {
    // legacy routeroute 모드의 잔재 키가 있으면 청소만 하고 무시.
    clearLegacyAdminKey();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        removeFromStorage(STUDENT_USER_KEY);
        return null;
      }
      const profile = await loadProfile(session.user.id);
      const user = buildUser(session.user, profile);
      saveToStorage(STUDENT_USER_KEY, user);
      return user;
    } catch (e) {
      console.error("[auth] getCurrentUser failed", e);
      return null;
    }
  },

  async registerStudent(params: { name: string; email: string; password: string; currentProgress?: string; studyMethod?: string }) {
    const name = params.name.trim();
    const email = params.email.trim();
    const password = params.password;

    if (!name || !email || !password) {
      return { ok: false, message: "이름, 이메일, 비밀번호를 모두 입력해주세요." };
    }
    if (password.length < 6) {
      return { ok: false, message: "비밀번호는 6자 이상으로 입력해주세요." };
    }

    clearLegacyAdminKey();
    removeFromStorage(STUDENT_USER_KEY);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          current_progress: params.currentProgress ?? "",
          study_method: params.studyMethod ?? ""
        }
      }
    });
    if (error) {
      if (error.message.includes("already registered") || error.message.includes("already been registered")) {
        return { ok: false, message: "이미 가입된 이메일입니다." };
      }
      return { ok: false, message: error.message };
    }
    if (!data.user) {
      return { ok: false, message: "회원가입 중 오류가 발생했습니다." };
    }
    if (data.user.identities && data.user.identities.length === 0) {
      return { ok: false, message: "이미 가입된 이메일입니다." };
    }

    await supabase.from("profiles").upsert({ id: data.user.id, name });

    const user: MockUser = {
      id: data.user.id,
      name,
      role: "student",
      tier: "free",
      email,
    };
    saveToStorage(STUDENT_USER_KEY, user);
    return { ok: true, user };
  },

  async loginStudent(params: { email: string; password: string }) {
    clearLegacyAdminKey();
    removeFromStorage(STUDENT_USER_KEY);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: params.email,
      password: params.password
    });

    if (error || !data.user) {
      const msg = error?.message?.includes("Email not confirmed")
        ? "이메일 인증이 완료되지 않았습니다. 가입 시 받은 메일의 인증 링크를 클릭해 주세요."
        : "이메일 또는 비밀번호가 올바르지 않습니다.";
      return { ok: false, message: msg };
    }

    const profile = await loadProfile(data.user.id);
    const user = buildUser(data.user, profile);
    saveToStorage(STUDENT_USER_KEY, user);
    return { ok: true, user };
  },

  loginAdmin(_password: string): MockUser | null {
    // routeroute 비번 가드는 1-B에서 폐기. 관리자 권한은 본인 학생 계정으로
    // 로그인 후 DB profiles.is_admin = true 인 경우 자동 부여된다.
    return null;
  },

  async logout(): Promise<void> {
    clearLegacyAdminKey();
    removeFromStorage(STUDENT_USER_KEY);
    await supabase.auth.signOut();
  }
};
