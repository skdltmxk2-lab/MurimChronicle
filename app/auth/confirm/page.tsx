"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { EmailOtpType } from "@supabase/supabase-js";

const ALLOWED_TYPES: EmailOtpType[] = ["signup", "recovery", "invite", "magiclink", "email", "email_change"];

function AuthConfirmInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    (async () => {
      const tokenHash = searchParams.get("token_hash");
      const typeParam = searchParams.get("type");

      // 신규 token-hash 흐름
      if (tokenHash && typeParam && (ALLOWED_TYPES as string[]).includes(typeParam)) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: typeParam as EmailOtpType
        });
        if (error) {
          setErrorMsg(error.message);
          setStatus("error");
          return;
        }
        // 비밀번호 재설정 흐름이면 새 비밀번호 입력 페이지로 바로 이동
        if (typeParam === "recovery") {
          router.replace("/auth/reset-password");
          return;
        }
        setStatus("success");
        return;
      }

      // 폴백: 구 PKCE 흐름이나 이미 콜백 완료된 경우 세션 존재 여부로 판단
      const { data: { session } } = await supabase.auth.getSession();
      setStatus(session ? "success" : "error");
    })();
  }, [searchParams]);

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
            <h1 className="text-2xl font-black text-ink">인증에 실패했습니다</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {errorMsg ? (
                <>
                  사유: {errorMsg}
                  <br />
                  링크가 만료되었거나 이미 사용되었을 수 있어요.
                </>
              ) : (
                <>
                  이메일에서 인증 링크를 클릭하면
                  <br />
                  자동으로 인증이 완료됩니다.
                </>
              )}
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

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={null}>
      <AuthConfirmInner />
    </Suspense>
  );
}
