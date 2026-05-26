"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (submitting || !trimmed) return;
    setSubmitting(true);
    setError("");
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/auth/confirm` : undefined;
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo,
    });
    setSubmitting(false);
    if (resetErr) {
      setError(resetErr.message);
      return;
    }
    setSent(true);
  }

  return (
    <main className="flex min-h-[calc(100vh-200px)] items-center justify-center px-5 py-10">
      <section className="w-full max-w-md rounded-2xl border border-line bg-white p-8 shadow-soft">
        {sent ? (
          <div className="text-center">
            <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-brand-50 text-3xl">
              📧
            </div>
            <h1 className="text-2xl font-black text-ink">메일 발송 완료</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              <b className="text-ink">{email}</b> 으로
              <br />
              비밀번호 재설정 링크를 보냈어요.
            </p>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              메일이 안 보이면 <b>스팸함</b>도 확인해주세요.<br />
              그래도 안 온다면 <b>가입 여부</b>를 확인해주세요.<br />
              링크는 1시간 동안 유효해요.
            </p>
            <Link
              href="/student/exams"
              className="mt-6 inline-block w-full rounded-md bg-brand-600 px-4 py-3 text-sm font-black text-white hover:bg-brand-700"
            >
              사이트로 돌아가기
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black text-ink">비밀번호 찾기</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              가입하신 이메일을 입력하면 재설정 링크를 보내드릴게요.
            </p>
            <form onSubmit={submit} className="mt-6 space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일"
                required
                autoFocus
                className="w-full rounded-md border border-line px-3 py-3 text-sm outline-none focus:border-brand-600"
              />
              {error ? (
                <p className="text-xs font-bold text-coral-600">{error}</p>
              ) : null}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-brand-600 py-3 text-sm font-black text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {submitting ? "보내는 중..." : "재설정 링크 보내기"}
              </button>
            </form>
            <p className="mt-4 text-center text-xs text-slate-500">
              계정이 기억나면{" "}
              <Link href="/student/exams" className="font-black text-brand-700 hover:underline">
                로그인
              </Link>
              {" · "}
              <Link href="/student/register" className="font-black text-brand-700 hover:underline">
                회원가입
              </Link>
            </p>
          </>
        )}
      </section>
    </main>
  );
}
