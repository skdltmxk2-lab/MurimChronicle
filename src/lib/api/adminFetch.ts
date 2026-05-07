"use client";

import { supabase } from "@/lib/supabase/client";

/**
 * 관리자 API 호출용 fetch 래퍼.
 * 현재 Supabase 세션의 access_token을 Authorization 헤더에 자동으로 실어 보낸다.
 * 서버는 이 토큰으로 사용자를 식별하고 profiles.is_admin 을 검증한다.
 */
export async function adminFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, { ...init, headers });
}
