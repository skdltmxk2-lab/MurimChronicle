import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export type AdminCheckResult =
  | { ok: true; userId: string; supabase: SupabaseClient }
  | { ok: false; response: NextResponse };

/**
 * API 라우트에서 관리자 권한을 검증한다.
 * - Authorization: Bearer {access_token} 헤더로 받은 Supabase 세션 토큰으로
 *   사용자를 조회 후 profiles.is_admin = true 인지 확인.
 * - 통과 시 service-role supabase client를 함께 반환.
 */
export async function requireAdmin(request: Request): Promise<AdminCheckResult> {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "관리자 권한이 필요합니다." },
        { status: 401 }
      ),
    };
  }
  const token = auth.slice(7).trim();
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "관리자 권한이 필요합니다." },
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "관리자 권한이 필요합니다." },
        { status: 403 }
      ),
    };
  }

  return { ok: true, userId: user.id, supabase };
}
