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
        setAuthChecked(true);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        try {
          const u = await authRepo.getCurrentUser();
          setUser(u);
        } catch (e) {
          console.error("[auth] onAuthStateChange getCurrentUser failed", e);
          setUser(null);
        }
        setAuthChecked(true);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setAuthChecked(true);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, authChecked }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
