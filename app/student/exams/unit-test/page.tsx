import { Suspense } from "react";
import { UnitTestRunnerPage } from "@/components/exam/UnitTestRunnerPage";

function LoadingFallback() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <section className="rounded-lg border border-line bg-white p-6 text-sm font-bold text-slate-600 shadow-soft">
        문제를 불러오는 중입니다...
      </section>
    </main>
  );
}

export default function UnitTestPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UnitTestRunnerPage />
    </Suspense>
  );
}
