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
        {/* 응시 중 답안은 제출 전까지 이 브라우저의 localStorage에만 있다. 서버 보관을 약속하지 않는다. */}
        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
          {"응시 중이었다면 지금까지 고른 답안은 이 브라우저에 자동 저장되어 있습니다.\n같은 브라우저에서 시험을 다시 열면 이어서 풀 수 있습니다."}
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
