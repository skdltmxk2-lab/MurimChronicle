"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase/client";
import { authRepo } from "@/lib/auth/mockAuth";
import type { MockUser } from "@/types/auth";

type AuthContextType = {
  user: MockUser | null;
  setUser: (user: MockUser | null) => void;
  authChecked: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  authChecked: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // SupabaseAuthRepository 안에서도 타임아웃을 걸지만,
    // repo 자체가 어떤 이유로 응답을 안 줘도 화면이 멈추지 않게
    // AuthContext에서 한 번 더 강제 안전망을 둔다 (5초).
    const safety = setTimeout(() => {
      if (cancelled) return;
      setAuthChecked((prev) => (prev ? prev : true));
    }, 5000);

    authRepo
      .getCurrentUser()
      .then((u) => {
        if (cancelled) return;
        setUser(u);
      })
      .catch((e) => {
        console.error("[auth] initial getCurrentUser failed", e);
        if (cancelled) return;
        setUser(null);
      })
      .finally(() => {
        if (cancelled) return;
        clearTimeout(safety);
        setAuthChecked(true);
      });

    // SIGNED_IN/TOKEN_REFRESHED 처리는 loginStudent 호출자가 setUser로 직접
    // 채우므로 굳이 또 fetch하지 않는다 (중복 query로 로그인 체감속도가 느려짐).
    // 여기서는 SIGNED_OUT만 책임지고 user/authChecked를 정리한다.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setAuthChecked(true);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // 로그인된 사용자의 last_seen_at을 30초마다 갱신.
  // 관리자 화면의 "현재 접속 중" 표시에 사용.
  useEffect(() => {
    if (!user) return;
    let stopped = false;
    const sendHeartbeat = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token || stopped) return;
        await fetch("/api/auth/heartbeat", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          keepalive: true,
        });
      } catch {
        // best-effort: heartbeat 실패는 조용히 무시
      }
    };
    sendHeartbeat();
    const id = setInterval(sendHeartbeat, 30 * 1000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, authChecked }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
