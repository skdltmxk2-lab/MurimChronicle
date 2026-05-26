"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // 비밀번호 재설정 메일 링크를 클릭하면 /auth/confirm 에서 verifyOtp(type=recovery)로
  // 세션을 만든 뒤 이쪽으로 라우팅된다. 그래서 도착 시 세션이 있어야 정상.
  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setHasSession(!!session);
      setReady(true);
    })();
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError("");
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    setSubmitting(true);
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (updateErr) {
      setError(updateErr.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.replace("/student/exams"), 1600);
  }

  if (!ready) return null;

  return (
    <main className="flex min-h-[calc(100vh-200px)] items-center justify-center px-5 py-10">
      <section className="w-full max-w-md rounded-2xl border border-line bg-white p-8 shadow-soft">
        {done ? (
          <div className="text-center">
            <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-brand-50 text-3xl">
              ✅
            </div>
            <h1 className="text-2xl font-black text-ink">비밀번호 변경 완료</h1>
            <p className="mt-3 text-sm text-slate-600">잠시 후 사이트로 이동합니다.</p>
          </div>
        ) : !hasSession ? (
          <div className="text-center">
            <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-slate-50 text-3xl">
              🔗
            </div>
            <h1 className="text-2xl font-black text-ink">링크가 만료되었어요</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              비밀번호 재설정 링크는 1시간 동안만 유효해요.
              <br />
              메일에서 새로 발급받아 주세요.
            </p>
            <Link
              href="/student/forgot-password"
              className="mt-6 inline-block w-full rounded-md bg-brand-600 px-4 py-3 text-sm font-black text-white hover:bg-brand-700"
            >
              재설정 메일 다시 받기
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black text-ink">새 비밀번호 설정</h1>
            <p className="mt-2 text-sm text-slate-600">
              새로 쓸 비밀번호를 입력해주세요. (6자 이상)
            </p>
            <form onSubmit={submit} className="mt-6 space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="새 비밀번호"
                required
                minLength={6}
                autoFocus
                className="w-full rounded-md border border-line px-3 py-3 text-sm outline-none focus:border-brand-600"
              />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="새 비밀번호 확인"
                required
                minLength={6}
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
                {submitting ? "변경 중..." : "비밀번호 변경"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
