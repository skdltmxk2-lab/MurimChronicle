"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authRepo } from "@/lib/auth/mockAuth";
import { useAuth } from "@/lib/auth/AuthContext";

export function AdminHeader() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  async function logout() {
    try {
      await authRepo.logout();
    } catch {
      // 무시
    } finally {
      setUser(null);
      router.replace("/student/exams");
    }
  }

  return (
    <header className="border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-col gap-3 px-5 py-3 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-ink text-sm font-black text-white">
            AD
          </span>
          <span>
            <span className="block text-sm font-black text-ink">관리자 콘솔</span>
            <span className="block text-xs text-slate-500">루트편입</span>
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/student/exams"
            className="rounded-md border border-line bg-white px-3 py-2 text-xs font-black text-slate-600 hover:border-brand-600 hover:text-brand-700"
          >
            학생 화면 →
          </Link>
          {user ? (
            <>
              <span className="rounded-md bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">
                {user.name}님
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-md border border-line px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50"
              >
                로그아웃
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
