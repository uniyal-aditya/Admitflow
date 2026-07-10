"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, ArrowLeft, Loader } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement | null, config: Record<string, string>) => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { sendEmailOtp, verifyEmailOtp, googleLogin, user } = useAuth();
  const [mode, setMode] = useState<"select" | "email" | "otp">("select");
  const [email, setEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const gsiRef = useRef(false);
  const cbRef = useRef<(c: string) => void>(undefined);

  const handleGoogleCredential = async (credential: string) => {
    setError("");
    setLoading(true);
    const r = await googleLogin(credential);
    setLoading(false);
    if (r.error) setError(r.error);
    else router.push("/dashboard");
  };
  cbRef.current = handleGoogleCredential;

  useEffect(() => {
    if (user) { router.push("/dashboard"); return; }
    if (!googleButtonRef.current || gsiRef.current) return;
    gsiRef.current = true;
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true; s.defer = true;
    s.onload = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
          callback: (r) => cbRef.current?.(r.credential),
        });
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline", size: "large", text: "continue_with", shape: "rectangular", width: "400",
        });
      }
    };
    document.body.appendChild(s);
  }, [user, router]);

  if (user) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email"); return; }
    setLoading(true);
    const r = await sendEmailOtp(email);
    setLoading(false);
    if (r.error) setError(r.error);
    else setMode("otp");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otpValue.length !== 6) { setError("Enter the 6-digit OTP"); return; }
    setLoading(true);
    const r = await verifyEmailOtp(email, otpValue);
    setLoading(false);
    if (r.error) setError(r.error);
    else router.push("/dashboard");
  };

  const handleBack = () => { setMode("select"); setError(""); };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="rounded-2xl border bg-white p-8 shadow-lg dark:bg-gray-900 dark:border-gray-800">
          <div className="text-center mb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Welcome to AdmitFlow</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to track your college admissions</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">{error}</div>
          )}

          {mode === "select" && (
            <div className="space-y-4">
              <div ref={googleButtonRef} className="flex justify-center min-h-[40px]" />

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t dark:border-gray-700" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500 dark:bg-gray-900">or</span>
                </div>
              </div>

              <button onClick={() => setMode("email")}
                className="w-full flex items-center justify-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              >
                <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Continue with Email
              </button>

              <p className="text-center text-xs text-gray-400 mt-6">
                By continuing, you agree to our{" "}
                <span className="text-indigo-600 cursor-pointer hover:underline">Terms</span> and{" "}
                <span className="text-indigo-600 cursor-pointer hover:underline">Privacy Policy</span>
              </p>

              <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4 dark:from-indigo-950/30 dark:to-purple-950/30">
                <p className="text-xs text-gray-500 text-center dark:text-gray-400">
                  Your data is stored securely in our database
                </p>
              </div>
            </div>
          )}

          {mode === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu" autoFocus
                  className="w-full rounded-xl border bg-white/50 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                Send OTP
              </button>
              <button type="button" onClick={handleBack}
                className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >Back to all options</button>
            </form>
          )}

          {mode === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Enter the code sent to</p>
                <p className="text-sm font-medium">{email}</p>
                <button type="button" onClick={() => { setOtpValue(""); setMode("email"); }}
                  className="text-xs text-indigo-600 hover:underline"
                >Change email</button>
              </div>
              <div>
                <input type="text" inputMode="numeric" maxLength={6} value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000" autoFocus
                  className="w-full text-center text-2xl tracking-[0.5em] rounded-xl border bg-white/50 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                Verify & Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
