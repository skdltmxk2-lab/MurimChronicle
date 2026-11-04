"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authRepo } from "@/lib/auth/mockAuth";
import { useAuth } from "@/lib/auth/AuthContext";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

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
    <header className="tz-admin-header">
      <div className="tz-admin-header__inner">
        <Link href="/admin" className="tz-admin-header__brand">
          <span className="tz-admin-header__mark" aria-hidden="true">
            <svg viewBox="0 0 100 100" width="34" height="34" fill="currentColor">
              <ellipse cx="50" cy="50" rx="48" ry="6" />
              <ellipse cx="50" cy="50" rx="6" ry="48" />
              <ellipse cx="50" cy="50" rx="5" ry="32" transform="rotate(45 50 50)" />
              <ellipse cx="50" cy="50" rx="5" ry="32" transform="rotate(-45 50 50)" />
            </svg>
          </span>
          <span className="tz-admin-header__wordmark">
            <span>루트편입</span>
            <span>관리자 콘솔</span>
          </span>
        </Link>
        <div className="tz-admin-header__actions">
          <ThemeToggle />
          <Link href="/admin/appearance" className="tz-admin-header__logout">디자인</Link>
          <Link
            href="/student/exams"
            className="tz-admin-header__student"
          >
            학생 화면
          </Link>
          {user ? (
            <>
              <span className="tz-admin-header__user" title={`${user.name}님`}>
                {user.name}님
              </span>
              <button
                type="button"
                onClick={logout}
                className="tz-admin-header__logout"
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
