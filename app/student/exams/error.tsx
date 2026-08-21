"use client";

import Link from "next/link";

export default function StudentExamsError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <section className="rounded-lg border border-line bg-white p-8 text-center shadow-soft">
        <div className="mb-4 text-4xl">📝</div>
        <h1 className="text-xl font-black text-ink">시험 화면을 불러오지 못했습니다</h1>
        {/*
          이 경계는 /student/exams 목록·단원테스트·취약유형까지 모두 덮는다.
          그래서 "이어서 풀 수 있다"고 약속하면 안 된다 — 단원테스트는 마운트마다
          exam.id를 Date.now()로 새로 만들어(UnitTestRunnerPage) 답안이 이어지지 않고,
          목록 화면에는 애초에 답안이 없다. 어느 경로에서나 참인 것만 쓴다.
        */}
        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
          {"이미 제출한 시험 결과는 안전하게 보관되어 있습니다.\n결과 기록에서 확인할 수 있습니다."}
        </p>
        {error.digest ? <p className="mt-4 text-xs text-slate-400">오류 코드: {error.digest}</p> : null}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md bg-brand-600 px-5 py-3 text-sm font-black text-white hover:bg-brand-700"
          >
            다시 시도
          </button>
          <Link
            href="/student/exams"
            className="rounded-md border border-line px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            시험 목록으로
          </Link>
        </div>
      </section>
    </main>
  );
}
