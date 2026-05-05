"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authRepo } from "@/lib/auth/mockAuth";

export function StudentRegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== passwordConfirm) {
      setError("비밀번호가 서로 다릅니다.");
      return;
    }

    setLoading(true);
    setError("");

    const result = await authRepo.registerStudent({ name, email, password });

    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.push("/student/exams");
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <section className="mx-auto max-w-xl rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">
          Student Sign Up
        </p>
        <h1 className="mt-1 text-3xl font-black text-ink">학생 회원가입</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          계정 정보는 Supabase에 저장됩니다.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-black text-slate-600">이름</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-3 text-sm outline-none focus:border-brand-600"
              placeholder="예: 홍길동"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black text-slate-600">이메일</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-3 text-sm outline-none focus:border-brand-600"
              placeholder="예: example@email.com"
              type="email"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black text-slate-600">비밀번호</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-3 text-sm outline-none focus:border-brand-600"
              placeholder="6자 이상"
              type="password"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black text-slate-600">비밀번호 확인</span>
            <input
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              className="mt-1 w-full rounded-md border border-line px-3 py-3 text-sm outline-none focus:border-brand-600"
              placeholder="비밀번호 다시 입력"
              type="password"
            />
          </label>

          {error ? (
            <div className="rounded-md bg-coral-50 px-4 py-3 text-sm font-bold text-coral-600">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-brand-600 px-4 py-3 text-sm font-black text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? "가입 중..." : "회원가입"}
            </button>
            <Link
              href="/student/exams"
              className="flex-1 rounded-md border border-line px-4 py-3 text-center text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              시험 목록으로
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
