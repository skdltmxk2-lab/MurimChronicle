"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authRepo, isAdminUser } from "@/lib/auth/mockAuth";
import { useAuth } from "@/lib/auth/AuthContext";

function RouteMathIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g fill="#1E3A8A">
        {/* 가로 길쭉한 spike (좌우) */}
        <ellipse cx="50" cy="50" rx="48" ry="7" />
        {/* 세로 길쭉한 spike (상하) */}
        <ellipse cx="50" cy="50" rx="7" ry="48" />
        {/* 작은 4-point star (대각선 spike) */}
        <polygon points="50,18 54,46 82,50 54,54 50,82 46,54 18,50 46,46" />
      </g>
    </svg>
  );
}

export function StudentHeader() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [error, setError] = useState("");

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

  async function logout() {
    await authRepo.logout();
    setUser(null);
    setError("");
    router.replace("/student/exams");
  }

  return (
    <header className="border-b border-line bg-white/85 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-col gap-3 px-5 py-3 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/student/exams" className="flex items-center gap-3">
          <RouteMathIcon className="size-9 shrink-0" />
          <span>
            <span className="block text-sm font-black text-ink">루트매쓰 CBT</span>
            <span className="block text-xs text-slate-500">편입수학 맞춤 학습</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600">
          <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/student/community">
            커뮤니티
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/student/search">
            문제검색
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
              <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/admin/users">
                회원 관리
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
              <Link
                href="/student/profile"
                className="rounded-md border border-brand-200 px-3 py-2 text-xs font-black text-brand-700 hover:bg-brand-50"
              >
                내정보
              </Link>
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
              <form onSubmit={submitStudent} className="flex min-w-0 flex-wrap gap-2">
                <input
                  value={studentEmail}
                  onChange={(event) => setStudentEmail(event.target.value)}
                  className="min-w-0 flex-1 basis-40 rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
                  placeholder="이메일"
                  type="email"
                />
                <input
                  value={studentPassword}
                  onChange={(event) => setStudentPassword(event.target.value)}
                  className="min-w-0 flex-1 basis-32 rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
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
            </div>
          )}
          {error ? <p className="text-xs font-bold text-coral-600">{error}</p> : null}
        </div>
      </div>
    </header>
  );
}
