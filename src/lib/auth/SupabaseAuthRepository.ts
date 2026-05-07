"use client";

import { supabase } from "@/lib/supabase/client";
import { ADMIN_PASSWORD } from "@/lib/auth/constants";
import type { MockUser, UserTier } from "@/types/auth";
import type { IAuthRepository } from "@/lib/auth/IAuthRepository";

function normalizeTier(value: unknown): UserTier {
  return value === "plus" || value === "pro" || value === "max" ? value : "go";
}

const ADMIN_USER_KEY = "cbt:auth:admin:v1";
const STUDENT_USER_KEY = "cbt:auth:student:v1";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function loadFromStorage<T>(key: string): T | null {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function saveToStorage(key: string, value: unknown) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function removeFromStorage(key: string) {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(key);
}

export const supabaseAuthRepo: IAuthRepository = {
  async getCurrentUser(): Promise<MockUser | null> {
    const admin = loadFromStorage<MockUser>(ADMIN_USER_KEY);
    if (admin) return admin;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      removeFromStorage(STUDENT_USER_KEY);
      return null;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, tier, is_admin")
      .eq("id", session.user.id)
      .single();

    const name = profile?.name ?? session.user.email?.split("@")[0] ?? "학생";
    const tier = normalizeTier(profile?.tier);
    const role: "student" | "admin" = profile?.is_admin ? "admin" : "student";
    const user: MockUser = {
      id: session.user.id,
      name,
      role,
      tier,
      email: session.user.email,
    };
    saveToStorage(STUDENT_USER_KEY, user);
    return user;
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

    removeFromStorage(ADMIN_USER_KEY);
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
      tier: "go",
      email,
    };
    removeFromStorage(ADMIN_USER_KEY);
    saveToStorage(STUDENT_USER_KEY, user);
    return { ok: true, user };
  },

  async loginStudent(params: { email: string; password: string }) {
    removeFromStorage(ADMIN_USER_KEY);
    removeFromStorage(STUDENT_USER_KEY);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: params.email,
      password: params.password
    });

    if (error || !data.user) {
      return { ok: false, message: "이메일 또는 비밀번호가 올바르지 않습니다." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, tier, is_admin")
      .eq("id", data.user.id)
      .single();

    const name = profile?.name ?? data.user.email?.split("@")[0] ?? "학생";
    const tier = normalizeTier(profile?.tier);
    const role: "student" | "admin" = profile?.is_admin ? "admin" : "student";
    const user: MockUser = {
      id: data.user.id,
      name,
      role,
      tier,
      email: data.user.email,
    };
    removeFromStorage(ADMIN_USER_KEY);
    saveToStorage(STUDENT_USER_KEY, user);
    return { ok: true, user };
  },

  loginAdmin(password: string): MockUser | null {
    // 1-A 임시: 마이그레이션 완료 후에도 routeroute 비번을 유지해 별도 admin
    // localStorage 키로 진입 가능하게 둔다. 1-B에서 DB의 is_admin 기반으로
    // 완전히 대체할 예정.
    if (password !== ADMIN_PASSWORD) return null;
    const user: MockUser = { name: "관리자", role: "admin", tier: "max" };
    removeFromStorage(STUDENT_USER_KEY);
    saveToStorage(ADMIN_USER_KEY, user);
    return user;
  },

  async logout(): Promise<void> {
    removeFromStorage(ADMIN_USER_KEY);
    removeFromStorage(STUDENT_USER_KEY);
    await supabase.auth.signOut();
  }
};
