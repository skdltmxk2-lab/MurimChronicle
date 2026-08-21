import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <section className="rounded-lg border border-line bg-white p-8 text-center shadow-soft">
        <div className="mb-4 text-4xl">🧭</div>
        <h1 className="text-2xl font-black text-ink">페이지를 찾을 수 없습니다</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          주소가 바뀌었거나 삭제된 페이지입니다. 아래에서 이동할 곳을 골라 주세요.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            href="/student/exams"
            className="rounded-md bg-brand-600 px-5 py-3 text-sm font-black text-white hover:bg-brand-700"
          >
            시험 목록으로
          </Link>
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
