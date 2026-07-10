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
  login: (email: string, password: string) => Promise<{ error?: string }>;
  googleLogin: (credential: string) => Promise<{ error?: string }>;
  sendEmailOtp: (email: string) => Promise<{ error?: string }>;
  verifyEmailOtp: (email: string, otp: string, name?: string, password?: string) => Promise<{ error?: string; user?: User }>;
  forgotPassword: (email: string) => Promise<{ error?: string }>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error?: string }>;
  updateProfile: (name: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: true,
  login: async () => ({}),
  googleLogin: async () => ({}),
  sendEmailOtp: async () => ({ error: "Not ready" }),
  verifyEmailOtp: async () => ({ error: "Not ready" }),
  forgotPassword: async () => ({ error: "Not ready" }),
  resetPassword: async () => ({ error: "Not ready" }),
  changePassword: async () => ({ error: "Not ready" }),
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

  const login = useCallback(async (email: string, password: string) =>
    setFromRes(await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })), [setFromRes]);

  const googleLogin = useCallback(async (credential: string) =>
    setFromRes(await fetch("/api/auth/google", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    })), [setFromRes]);

  const sendEmailOtp = useCallback(async (email: string) => {
    const res = await fetch("/api/auth/send-email-otp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    return res.ok ? {} : { error: data.error };
  }, []);

  const verifyEmailOtp = useCallback(async (email: string, otp: string, name?: string, password?: string) => {
    const res = await fetch("/api/auth/verify-email-otp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, name, password }),
    });
    const data = await res.json();
    if (res.ok) { setUser(data.user); return { user: data.user }; }
    return { error: data.error };
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    return res.ok ? {} : { error: data.error };
  }, []);

  const resetPassword = useCallback(async (email: string, otp: string, newPassword: string) =>
    setFromRes(await fetch("/api/auth/reset-password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    })), [setFromRes]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const res = await fetch("/api/auth/change-password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    return res.ok ? {} : { error: data.error };
  }, []);

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
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, sendEmailOtp, verifyEmailOtp, forgotPassword, resetPassword, changePassword, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
