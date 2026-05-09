import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export type UserCheckResult =
  | { ok: true; userId: string; supabase: SupabaseClient }
  | { ok: false; response: NextResponse };

/**
 * 일반 회원 인증. Authorization: Bearer {access_token} 검사 후
 * 검증된 userId와 service-role supabase client를 반환한다.
 * 호출하는 라우트에서 user_id 필터를 직접 걸어야 한다.
 */
export async function requireUser(request: Request): Promise<UserCheckResult> {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "로그인이 필요합니다." },
        { status: 401 }
      ),
    };
  }
  const token = auth.slice(7).trim();
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "로그인이 필요합니다." },
        { status: 401 }
      ),
    };
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "세션이 만료되었습니다. 다시 로그인해 주세요." },
        { status: 401 }
      ),
    };
  }

  return { ok: true, userId: user.id, supabase };
}
