"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authRepo, type MockUser } from "@/lib/auth/mockAuth";

export function AdminHeader() {
  const router = useRouter();
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    authRepo.getCurrentUser().then(setUser);
  }, []);

  async function logout() {
    await authRepo.logout();
    setUser(null);
    router.push("/student/exams");
  }

  return (
    <header className="border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-col gap-3 px-5 py-3 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/admin/questions" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-ink text-sm font-black text-white">
            AD
          </span>
          <span>
            <span className="block text-sm font-black text-ink">관리자 콘솔</span>
            <span className="block text-xs text-slate-500">문제은행 관리</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/admin/questions">
            문제 관리
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/admin/exams">
            모의고사 생성
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/admin/imports">
            대량 업로드
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/admin/daily">
            데일리 테스트
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/student/exams">
            학생 화면
          </Link>
          {user ? (
            <>
              <span className="rounded-md bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">
                {user.name}님 안녕하세요!
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
        </nav>
      </div>
    </header>
  );
}
