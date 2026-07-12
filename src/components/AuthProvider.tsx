"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  createdAt?: string;
  onboardingCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  googleLogin: (credential: string) => Promise<{ error?: string }>;
  updateProfile: (name: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: true,
  googleLogin: async () => ({}),
  updateProfile: async () => ({ error: "Not ready" }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/me", { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => { setUser(data.user); setLoading(false); })
      .catch(() => { if (!controller.signal.aborted) { setUser(null); setLoading(false); } });
    return () => controller.abort();
  }, []);

  const setFromRes = useCallback(async (res: Response) => {
    const data = await res.json();
    if (res.ok) { setUser(data.user); return {}; }
    return { error: data.error };
  }, []);

  const googleLogin = useCallback(async (credential: string) =>
    setFromRes(await fetch("/api/auth/google", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    })), [setFromRes]);

  const updateProfile = useCallback(async (name: string) => {
    const res = await fetch("/api/auth/profile", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (res.ok) { setUser(data.user); return {}; }
    return { error: data.error };
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, googleLogin, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
