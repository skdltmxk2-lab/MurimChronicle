"use client";

import { supabase } from "@/lib/supabase/client";

/** Bind the captured workspace data to the same authenticated account before sending it. */
export async function electronicsAdminFetch(expectedUserId: string, input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!expectedUserId || !session?.access_token) throw new Error("관리자 로그인이 필요합니다.");
  if (session.user.id !== expectedUserId) throw new Error("관리자 계정이 변경되었습니다. 현재 계정에서 다시 시도해 주세요.");
  if (init.signal?.aborted) throw new DOMException("요청을 취소했습니다.", "AbortError");
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${session.access_token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(input, { ...init, headers });
}
