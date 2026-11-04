"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authRepo, isAdminUser } from "@/lib/auth/mockAuth";
import { useAuth } from "@/lib/auth/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { InquiryModal } from "@/components/inquiry/InquiryModal";
import { TrackToggle } from "@/components/layout/TrackToggle";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useTrack } from "@/lib/useTrack";

// ROUTE 편입 — Logo Concept A (SPARK).
// 8-point spike: 카디널 4방향(상/하/좌/우) 긴 spike + 대각 4방향 짧은 spike.
function RouteMathIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g fill="currentColor">
        {/* 카디널 spike — 길쭉한 첨예형 4방향 */}
        <ellipse cx="50" cy="50" rx="48" ry="6" />
        <ellipse cx="50" cy="50" rx="6" ry="48" />
        {/* 대각 spike — 카디널의 약 65% 길이 */}
        <ellipse cx="50" cy="50" rx="5" ry="32" transform="rotate(45 50 50)" />
        <ellipse cx="50" cy="50" rx="5" ry="32" transform="rotate(-45 50 50)" />
      </g>
    </svg>
  );
}

export function StudentHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, authChecked } = useAuth();
  const track = useTrack();
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const showResend = error.includes("이메일 인증") && !!studentEmail;

  async function resendConfirmation() {
    if (resending || !studentEmail) return;
    setResending(true);
    try {
      const { error: resendErr } = await supabase.auth.resend({
        type: "signup",
        email: studentEmail,
        options: {
          emailRedirectTo:
            typeof window !== "undefined" ? `${window.location.origin}/auth/confirm` : undefined
        }
      });
      if (resendErr) {
        setError(`재발송 실패: ${resendErr.message}`);
      } else {
        setResendDone(true);
        setError("");
      }
    } finally {
      setResending(false);
    }
  }

  async function submitStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    setResendDone(false);
    try {
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
      if (isAdminUser(result.user)) {
        router.replace("/admin");
      }
    } catch (e) {
      console.error("[auth] loginStudent threw", e);
      setError("로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  async function logout() {
    try {
      await authRepo.logout();
    } catch (e) {
      console.error("[auth] logout threw", e);
    } finally {
      setUser(null);
      setError("");
      router.replace("/student/exams");
    }
  }

  return (
    <header className="tz-header" aria-busy={!authChecked}>
      <div className={`tz-header__inner ${user ? "tz-header__inner--member" : "tz-header__inner--guest"}`}>
        <Link href="/student/exams" className="tz-header__brand">
          <RouteMathIcon className="tz-header__mark" />
          <span className="tz-header__identity">
            <span className="tz-header__wordmark">루트편입</span>
            <span className="tz-header__subtitle">{track === "english" ? "편입영어 맞춤 학습" : "편입수학 맞춤 학습"}</span>
          </span>
        </Link>

        <nav className="tz-header__nav" aria-label="학습 메뉴">
          {user ? <TrackToggle /> : null}
          {user ? <Link className="tz-header__nav-link" aria-current={pathname.startsWith("/student/homework") ? "page" : undefined} href="/student/homework">내 숙제</Link> : null}
          {user ? <Link className="tz-header__nav-link" aria-current={pathname.startsWith("/student/community") ? "page" : undefined} href="/student/community">커뮤니티</Link> : null}
          {user && track === "math" ? <Link className="tz-header__nav-link" aria-current={pathname.startsWith("/student/search") ? "page" : undefined} href="/student/search">문제검색</Link> : null}
          <Link className="tz-header__nav-link" aria-current={pathname === "/student/pricing" ? "page" : undefined} href="/student/pricing">요금제</Link>
        </nav>

        <div className="tz-header__tools">
          <ThemeToggle />
          <details className="tz-header__access" suppressHydrationWarning key={`${user?.id ?? "guest"}:${pathname}`}>
            <summary className="tz-header__summary">
              <span>{user ? `${user.name}님` : "로그인"}</span>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
            </summary>
            <div className="tz-header__popover">
              {user ? (
                <div className="tz-header__member">
                  <p className="tz-header__greeting">{user.name}님 안녕하세요!</p>
                  <button type="button" onClick={() => setInquiryOpen(true)} className="tz-header__account-link">문의하기</button>
                  <Link href="/student/profile" className="tz-header__account-link">내정보</Link>
                  {isAdminUser(user) ? <Link href="/admin" className="tz-header__account-link">관리자 모드</Link> : null}
                  <button type="button" onClick={logout} className="tz-header__account-link tz-header__account-link--logout">로그아웃</button>
                </div>
              ) : (
                <div className="tz-header__login">
                  <form onSubmit={submitStudent} className="tz-header__login-form" aria-label="학생 로그인">
                    <label className="tz-header__label" htmlFor="student-login-email">이메일</label>
                    <input id="student-login-email" name="email" autoComplete="email" value={studentEmail} onChange={(event) => setStudentEmail(event.target.value)} className="tz-header__input" placeholder="이메일" type="email" />
                    <label className="tz-header__label" htmlFor="student-login-password">비밀번호</label>
                    <input id="student-login-password" name="password" autoComplete="current-password" value={studentPassword} onChange={(event) => setStudentPassword(event.target.value)} className="tz-header__input" placeholder="비밀번호" type="password" />
                    <button type="submit" disabled={submitting} aria-busy={submitting} className="tz-header__button tz-header__button--primary">{submitting ? "로그인 중..." : "로그인"}</button>
                  </form>
                  <Link href="/student/forgot-password" className="tz-header__forgot">비밀번호 찾기</Link>
                </div>
              )}
              {error ? (
                <div className="tz-header__feedback" role="alert">
                  <p>{error}</p>
                  {showResend ? <button type="button" onClick={resendConfirmation} disabled={resending} className="tz-header__resend">{resending ? "재발송 중..." : "인증 메일 다시 보내기"}</button> : null}
                </div>
              ) : null}
              {resendDone ? <p className="tz-header__success" role="status">인증 메일을 다시 보냈습니다. 메일함을 확인해 주세요.</p> : null}
            </div>
          </details>
          {!user ? <Link href="/student/register" className="tz-header__button tz-header__button--primary tz-header__signup">회원가입</Link> : null}
        </div>
      </div>
      {inquiryOpen ? <InquiryModal onClose={() => setInquiryOpen(false)} /> : null}
    </header>
  );
}
