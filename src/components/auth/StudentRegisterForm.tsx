"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { authRepo } from "@/lib/auth/mockAuth";
import { SUBJECT_NAMES } from "@/lib/taxonomy";

const PROGRESS_OPTIONS: readonly string[] = SUBJECT_NAMES;
const STUDY_OPTIONS = ["독학", "김영편입", "해커스", "에듀윌", "기타"];

export function StudentRegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [currentProgress, setCurrentProgress] = useState("");
  const [studyMethod, setStudyMethod] = useState("");
  const [studyMethodOther, setStudyMethodOther] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== passwordConfirm) {
      setError("비밀번호가 서로 다릅니다.");
      return;
    }
    if (!currentProgress) {
      setError("현재 진도를 선택해주세요.");
      return;
    }
    if (!studyMethod) {
      setError("학습 방법을 선택해주세요.");
      return;
    }
    if (studyMethod === "기타" && !studyMethodOther.trim()) {
      setError("기타 학습 방법을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    const finalStudyMethod = studyMethod === "기타" ? studyMethodOther.trim() : studyMethod;
    const result = await authRepo.registerStudent({
      name,
      email,
      password,
      currentProgress,
      studyMethod: finalStudyMethod
    });

    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem("cbt:welcome:pending", "true");
      try {
        window.sessionStorage.setItem("cbt:promo:inquiry:show", "1");
      } catch {
        // 무시.
      }
    }
    setRegistered(true);
  }

  if (registered) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-8">
        <section className="mx-auto max-w-xl rounded-lg border border-line bg-white p-6 shadow-soft text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-brand-50 text-3xl">
            ✉️
          </div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">
            회원가입 완료
          </p>
          <h1 className="mt-1 text-2xl font-black text-ink">이메일을 확인해 주세요!</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            <span className="font-bold text-ink">{email}</span> 으로 인증 메일을 보냈어요.
            <br />
            메일함에서 인증 링크를 클릭한 뒤,
            <br />
            아래 버튼을 눌러 로그인해 주세요.
          </p>
          <Link
            href="/student/exams"
            className="mt-6 inline-block w-full rounded-md bg-brand-600 px-4 py-3 text-sm font-black text-white hover:bg-brand-700"
          >
            로그인하러 가기
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <section className="mx-auto max-w-xl rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">
          Student Sign Up
        </p>
        <h1 className="mt-1 text-3xl font-black text-ink">학생 회원가입</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          루트편입 CBT에서 맞춤형 편입수학 공부를 시작하세요!
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

          <div className="rounded-md border border-line p-4">
            <p className="text-xs font-black text-slate-600">현재 진도가 어디신가요?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PROGRESS_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCurrentProgress(option)}
                  className={`rounded-full px-4 py-2 text-sm font-black transition ${
                    currentProgress === option
                      ? "bg-brand-600 text-white"
                      : "border border-line bg-white text-slate-600 hover:border-brand-400"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-line p-4">
            <p className="text-xs font-black text-slate-600">어떻게 공부 중이신가요?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {STUDY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStudyMethod(option)}
                  className={`rounded-full px-4 py-2 text-sm font-black transition ${
                    studyMethod === option
                      ? "bg-brand-600 text-white"
                      : "border border-line bg-white text-slate-600 hover:border-brand-400"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {studyMethod === "기타" && (
              <input
                value={studyMethodOther}
                onChange={(event) => setStudyMethodOther(event.target.value)}
                className="mt-3 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
                placeholder="학습 방법을 입력해주세요"
                autoFocus
              />
            )}
          </div>

          {error ? (
            <div className="rounded-md bg-coral-50 px-4 py-3 text-sm font-bold text-coral-600">
              {error}
            </div>
          ) : null}

          <p className="text-center text-xs leading-5 text-slate-500">
            회원가입 시{" "}
            <Link href="/legal/terms" target="_blank" className="font-bold text-brand-700 underline">
              이용약관
            </Link>
            {" "}및{" "}
            <Link href="/legal/privacy" target="_blank" className="font-bold text-brand-700 underline">
              개인정보처리방침
            </Link>
            에 동의하는 것으로 간주됩니다.
          </p>

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
