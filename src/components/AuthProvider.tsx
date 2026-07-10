"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  googleLogin: (credential: string) => Promise<{ error?: string }>;
  sendEmailOtp: (email: string) => Promise<{ error?: string }>;
  verifyEmailOtp: (email: string, otp: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  googleLogin: async () => ({}),
  sendEmailOtp: async () => ({ error: "Not ready" }),
  verifyEmailOtp: async () => ({ error: "Not ready" }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/me", { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setUser(null);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  const googleLogin = useCallback(async (credential: string) => {
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      return {};
    }
    return { error: data.error };
  }, []);

  const sendEmailOtp = useCallback(async (email: string) => {
    const res = await fetch("/api/auth/send-email-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) return {};
    return { error: data.error };
  }, []);

  const verifyEmailOtp = useCallback(async (email: string, otp: string) => {
    const res = await fetch("/api/auth/verify-email-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      return {};
    }
    return { error: data.error };
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, googleLogin, sendEmailOtp, verifyEmailOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
