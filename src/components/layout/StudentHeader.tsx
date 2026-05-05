"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { authRepo, isAdminUser, type MockUser } from "@/lib/auth/mockAuth";

export function StudentHeader() {
  const router = useRouter();
  const [user, setUser] = useState<MockUser | null>(null);
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    authRepo.getCurrentUser().then(setUser);
  }, []);

  async function submitStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await authRepo.loginStudent({
      email: studentEmail,
      password: studentPassword
    });
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setUser(result.user);
    setStudentEmail("");
    setStudentPassword("");
    setError("");
  }

  function submitAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const admin = authRepo.loginAdmin(adminPassword);
    if (!admin) {
      setError("관리자 비밀번호가 올바르지 않습니다.");
      return;
    }
    setUser(admin);
    setAdminPassword("");
    setError("");
    router.push("/admin/questions");
  }

  async function logout() {
    await authRepo.logout();
    setUser(null);
    setError("");
  }

  return (
    <header className="border-b border-line bg-white/85 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-col gap-3 px-5 py-3 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/student/exams" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-brand-600 text-sm font-black text-white">
            CBT
          </span>
          <span>
            <span className="block text-sm font-black text-ink">루트편입 CBT</span>
            <span className="block text-xs text-slate-500">편입수학 맞춤 학습</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600">
          <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/student/exams">
            시험 목록
          </Link>
          {isAdminUser(user) ? (
            <>
              <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/admin/questions">
                문제 관리
              </Link>
              <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/admin/exams">
                모의고사 생성
              </Link>
              <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/admin/imports">
                대량 업로드
              </Link>
            </>
          ) : null}
        </nav>

        <div className="flex flex-1 flex-col gap-2 lg:max-w-3xl lg:items-end">
          {user ? (
            <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
              <span className="rounded-md bg-brand-50 px-3 py-2 text-sm font-black text-brand-700">
                {user.name}님 안녕하세요!
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-md border border-line px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
              <form onSubmit={submitStudent} className="flex min-w-0 gap-2">
                <input
                  value={studentEmail}
                  onChange={(event) => setStudentEmail(event.target.value)}
                  className="w-40 rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
                  placeholder="이메일"
                  type="email"
                />
                <input
                  value={studentPassword}
                  onChange={(event) => setStudentPassword(event.target.value)}
                  className="w-32 rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
                  placeholder="비밀번호"
                  type="password"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-md border border-brand-600 px-3 py-2 text-sm font-black text-brand-700 hover:bg-brand-50"
                >
                  로그인
                </button>
                <Link
                  href="/student/register"
                  className="shrink-0 rounded-md bg-brand-600 px-3 py-2 text-sm font-black text-white hover:bg-brand-700"
                >
                  회원가입
                </Link>
              </form>
              <form onSubmit={submitAdmin} className="flex min-w-0 gap-2">
                <input
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  className="w-44 rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ink"
                  placeholder="관리자 비밀번호"
                  type="password"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-md bg-ink px-3 py-2 text-sm font-black text-white hover:bg-slate-700"
                >
                  관리자 로그인
                </button>
              </form>
            </div>
          )}
          {error ? <p className="text-xs font-bold text-coral-600">{error}</p> : null}
        </div>
      </div>
    </header>
  );
}
