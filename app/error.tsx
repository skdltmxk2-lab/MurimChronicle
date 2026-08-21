"use client";

import Link from "next/link";

export default function RootError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <section className="rounded-lg border border-line bg-white p-8 text-center shadow-soft">
        <div className="mb-4 text-4xl">⚠️</div>
        <h1 className="text-xl font-black text-ink">화면을 불러오지 못했습니다</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          일시적인 오류일 수 있습니다. 다시 시도해도 같은 화면이 나오면 잠시 후 접속해 주세요.
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
            href="/"
            className="rounded-md border border-line px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            홈으로
          </Link>
        </div>
      </section>
    </main>
  );
}
