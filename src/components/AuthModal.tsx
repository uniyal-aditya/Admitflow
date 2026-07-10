"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Eye, EyeOff, Loader, X } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

declare global {
  interface Window {
    google?: { accounts: { id: { initialize: (c: { client_id: string; callback: (r: { credential: string }) => void }) => void; renderButton: (e: HTMLElement | null, c: Record<string, string>) => void } } };
  }
}

type Mode = "login" | "signup" | "otp" | "forgot" | "reset";

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { login, googleLogin, sendEmailOtp, verifyEmailOtp, forgotPassword, resetPassword, user } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const gRef = useRef<HTMLDivElement>(null);
  const gInit = useRef(false);
  const gcRef = useRef<(c: string) => void>(undefined);

  const hGC = async (cred: string) => { setError(""); setLoading(true); const r = await googleLogin(cred); setLoading(false); if (r.error) setError(r.error); else { onClose(); router.push("/dashboard"); } };
  gcRef.current = hGC;

  useEffect(() => {
    if (user) { onClose(); router.push("/dashboard"); }
  }, [user, router, onClose]);

  useEffect(() => {
    if (!open || gInit.current) return;
    if (mode !== "login" && mode !== "signup") return;
    gInit.current = true;
    if (document.querySelector("script[src*='accounts.google.com/gsi/client']")) {
      if (window.google && gRef.current) {
        window.google.accounts.id.initialize({ client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "", callback: (r) => gcRef.current?.(r.credential) });
        try { window.google.accounts.id.renderButton(gRef.current, { theme: "outline", size: "large", text: "continue_with", shape: "rectangular", width: "380" }); } catch {}
      }
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client"; s.async = true; s.defer = true;
    s.onload = () => {
      if (window.google && gRef.current) {
        window.google.accounts.id.initialize({ client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "", callback: (r) => gcRef.current?.(r.credential) });
        window.google.accounts.id.renderButton(gRef.current, { theme: "outline", size: "large", text: "continue_with", shape: "rectangular", width: "380" });
      }
    };
    document.body.appendChild(s);
  }, [open, mode]);

  useEffect(() => { if (!open) { setMode("login"); setError(""); setEmail(""); setPassword(""); setName(""); setOtpValue(""); setNewPassword(""); } }, [open]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!email || !password) { setError("Fill in all fields"); return; }
    setLoading(true);
    const r = await login(email, password);
    setLoading(false);
    if (r.error) setError(r.error); else { onClose(); router.push("/dashboard"); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!name || !email || !password) { setError("Fill in all fields"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    const r = await sendEmailOtp(email);
    setLoading(false);
    if (r.error) setError(r.error); else setMode("otp");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (otpValue.length !== 6) { setError("Enter the 6-digit code"); return; }
    setLoading(true);
    const r = await verifyEmailOtp(email, otpValue, name, password);
    setLoading(false);
    if (r.error) setError(r.error); else { onClose(); router.push("/dashboard"); }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!email) { setError("Enter your email"); return; }
    setLoading(true);
    const r = await forgotPassword(email);
    setLoading(false);
    if (r.error) setError(r.error); else setMode("reset");
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (otpValue.length !== 6 || !newPassword) { setError("Fill in all fields"); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    const r = await resetPassword(email, otpValue, newPassword);
    setLoading(false);
    if (r.error) setError(r.error); else { onClose(); router.push("/dashboard"); }
  };

  const resetState = (m: Mode) => { setMode(m); setError(""); setOtpValue(""); setNewPassword(""); };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="relative rounded-2xl border bg-white p-8 shadow-xl dark:bg-gray-900 dark:border-gray-800">
          <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors">
            <X className="h-5 w-5" />
          </button>
          <div className="text-center mb-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold">{mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : mode === "otp" ? "Verify Email" : "Reset Password"}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {mode === "login" ? "Welcome back to AdmitFlow" : mode === "signup" ? "Join AdmitFlow" : mode === "otp" ? "Check your email for the code" : "Enter the code sent to your email"}
            </p>
          </div>

          {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">{error}</div>}

          {(mode === "login" || mode === "signup") && (
            <div className="space-y-4">
              <div ref={gRef} className="flex justify-center min-h-[40px]" />
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t dark:border-gray-700" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500 dark:bg-gray-900">or</span></div>
              </div>
            </div>
          )}

          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" autoFocus
                  className="w-full rounded-xl border bg-white/50 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
                    className="w-full rounded-xl border bg-white/50 px-4 py-2.5 pr-10 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
              </div>
              <div className="flex justify-end text-sm">
                <button type="button" onClick={() => resetState("forgot")} className="text-indigo-600 hover:underline">Forgot password?</button>
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader className="h-4 w-4 animate-spin" />} Sign In</button>
              <p className="text-center text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => resetState("signup")} className="text-indigo-600 hover:underline font-medium">Sign up</button>
              </p>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoFocus
                  className="w-full rounded-xl border bg-white/50 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu"
                  className="w-full rounded-xl border bg-white/50 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters"
                    className="w-full rounded-xl border bg-white/50 px-4 py-2.5 pr-10 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader className="h-4 w-4 animate-spin" />} Create Account</button>
              <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <button type="button" onClick={() => resetState("login")} className="text-indigo-600 hover:underline font-medium">Sign in</button>
              </p>
            </form>
          )}

          {mode === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-gray-500 text-center">We sent a code to <strong>{email}</strong></p>
              <div>
                <input type="text" inputMode="numeric" maxLength={6} value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000" autoFocus
                  className="w-full text-center text-2xl tracking-[0.5em] rounded-xl border bg-white/50 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader className="h-4 w-4 animate-spin" />} Verify & Sign In</button>
              <button type="button" onClick={() => { resetState("signup"); setOtpValue(""); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Change email or name</button>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-4">
              <p className="text-sm text-gray-500">Enter your email and we&apos;ll send a reset code.</p>
              <div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" autoFocus
                  className="w-full rounded-xl border bg-white/50 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader className="h-4 w-4 animate-spin" />} Send Reset Code</button>
              <button type="button" onClick={() => resetState("login")}
                className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Back to sign in</button>
            </form>
          )}

          {mode === "reset" && (
            <form onSubmit={handleReset} className="space-y-4">
              <p className="text-sm text-gray-500 text-center">Enter the code sent to <strong>{email}</strong></p>
              <div>
                <input type="text" inputMode="numeric" maxLength={6} value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000" autoFocus
                  className="w-full text-center text-2xl tracking-[0.5em] rounded-xl border bg-white/50 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters"
                  className="w-full rounded-xl border bg-white/50 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader className="h-4 w-4 animate-spin" />} Reset Password</button>
              <button type="button" onClick={() => resetState("login")}
                className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Back to sign in</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
