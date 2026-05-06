"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function AuthConfirmPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    });
  }, []);

  if (status === "loading") return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 to-white px-5">
      <section className="w-full max-w-md rounded-2xl border border-line bg-white p-10 text-center shadow-soft">
        {status === "success" ? (
          <>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-brand-50 text-3xl">
              ✅
            </div>
            <h1 className="text-2xl font-black text-ink">이메일 인증 완료!</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              인증이 성공적으로 완료되었습니다.
              <br />
              이제 로그인하고 공부를 시작해보세요!
            </p>
            <Link
              href="/student/exams"
              className="mt-6 inline-block w-full rounded-md bg-brand-600 px-4 py-3 text-sm font-black text-white hover:bg-brand-700"
            >
              로그인하러 가기 →
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-slate-50 text-3xl">
              🔗
            </div>
            <h1 className="text-2xl font-black text-ink">인증 링크를 확인해주세요</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              이메일에서 인증 링크를 클릭하면
              <br />
              자동으로 인증이 완료됩니다.
            </p>
            <Link
              href="/student/exams"
              className="mt-6 inline-block w-full rounded-md bg-brand-600 px-4 py-3 text-sm font-black text-white hover:bg-brand-700"
            >
              사이트로 돌아가기
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
