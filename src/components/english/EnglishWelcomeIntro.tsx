"use client";

import { useRouter } from "next/navigation";

export const ENGLISH_INTRO_KEY = "cbt:english:intro:v1";

export function EnglishWelcomeIntro({
  name,
  onClose,
}: {
  name?: string;
  onClose: () => void;
}) {
  const router = useRouter();

  function markSeen() {
    try {
      localStorage.setItem(ENGLISH_INTRO_KEY, "1");
    } catch {
      // 무시
    }
  }

  function start() {
    markSeen();
    onClose();
    router.push("/student/english/words");
  }

  function dismiss() {
    markSeen();
    onClose();
  }

  return (
    <div className="animate-intro-backdrop fixed inset-0 z-[60] flex items-center justify-center overflow-hidden px-5">
      {/* 움직이는 그라데이션 배경 */}
      <div className="animate-intro-gradient absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-600 to-mint-600" />
      {/* 떠다니는 광택 오브 */}
      <div className="animate-intro-orb pointer-events-none absolute -left-20 top-8 size-72 rounded-full bg-white/15 blur-3xl" />
      <div
        className="animate-intro-orb pointer-events-none absolute -right-12 bottom-0 size-80 rounded-full bg-mint-200/25 blur-3xl"
        style={{ animationDelay: "-3s" }}
      />
      <div
        className="animate-intro-orb pointer-events-none absolute left-1/3 -bottom-16 size-64 rounded-full bg-brand-100/20 blur-3xl"
        style={{ animationDelay: "-6s" }}
      />

      {/* 내용 */}
      <div className="relative w-full max-w-md text-center text-white">
        <div className="animate-intro-pop mx-auto mb-7 w-fit">
          <div className="animate-intro-float grid size-24 place-items-center rounded-[28px] bg-white/15 text-6xl shadow-2xl ring-1 ring-inset ring-white/25 backdrop-blur">
            📚
          </div>
        </div>

        <p
          className="animate-intro-rise text-[11px] font-black uppercase tracking-[0.32em] text-white/70"
          style={{ animationDelay: "0.1s" }}
        >
          ROUTE · 편입영어
        </p>
        <h1
          className="animate-intro-rise mt-3 text-3xl font-black leading-tight sm:text-4xl"
          style={{ animationDelay: "0.2s" }}
        >
          {name ? `${name}님, 환영해요!` : "환영해요!"}
        </h1>
        <p
          className="animate-intro-rise mx-auto mt-5 max-w-sm text-[15px] leading-7 text-white/90"
          style={{ animationDelay: "0.32s" }}
        >
          편입영어는 아직 <b className="font-black text-white">개발 중인 단계</b>예요.
          <br />
          우선 <b className="font-black text-white">단어 학습</b>부터 진행해 주세요.
          <br />
          얼른 더 많은 기능과 문제를 추가하겠습니다! 🙏
        </p>

        <div
          className="animate-intro-rise mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animationDelay: "0.46s" }}
        >
          <button
            type="button"
            onClick={start}
            className="w-full rounded-full bg-white px-7 py-3.5 text-sm font-black text-brand-700 shadow-xl transition hover:scale-[1.04] sm:w-auto"
          >
            단어 학습 시작하기 →
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="w-full rounded-full border border-white/40 px-7 py-3.5 text-sm font-black text-white/90 transition hover:bg-white/10 sm:w-auto"
          >
            둘러볼게요
          </button>
        </div>
      </div>
    </div>
  );
}
