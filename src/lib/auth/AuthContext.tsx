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
    authRepo.getCurrentUser().then((u) => {
      setUser(u);
      setAuthChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        const u = await authRepo.getCurrentUser();
        setUser(u);
        setAuthChecked(true);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setAuthChecked(true);
      }
    });

    return () => subscription.unsubscribe();
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
