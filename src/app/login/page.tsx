"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, ArrowLeft, Loader, Sparkles } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const errorParam = searchParams.get("error");
  const safeRedirect = redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/dashboard";
  const { googleLogin, user, loading: authLoading } = useAuth();
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!authLoading && user) router.push(safeRedirect);
  }, [user, authLoading, router, safeRedirect]);

  useEffect(() => {
    if (errorParam === "config") setError("Authentication configuration error. Please try again later.");
    else if (errorParam === "denied") setError("Sign in was cancelled.");
    else if (errorParam === "auth_failed" || errorParam === "no_token" || errorParam === "invalid_token") setError("Authentication failed. Please try again.");
    else if (errorParam === "server") setError("A server error occurred. Please try again.");
  }, [errorParam]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (signingIn || error) return;
    const timer = setTimeout(() => {
      const google = (window as any).google;
      if (!google?.accounts?.id) return;

      google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        cancel_on_tap_outside: false,
        callback: async (response: { credential: string }) => {
          if (!mountedRef.current) return;
          setSigningIn(true);
          setError("");
          const result = await googleLogin(response.credential);
          if (!mountedRef.current) return;
          setSigningIn(false);
          if (result.error) setError(result.error);
        },
      });

      google.accounts.id.prompt();

      const btn = document.getElementById("google-signin-btn");
      if (btn) {
        google.accounts.id.renderButton(btn, {
          type: "standard",
          shape: "pill",
          theme: "outline",
          text: "signin_with",
          size: "large",
          width: btn.offsetWidth || 320,
          logo_alignment: "left",
        });
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      try { if ((window as any).google?.accounts?.id) (window as any).google.accounts.id.cancel(); } catch {}
    };
  }, [googleLogin, signingIn, error]);

  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="rounded-2xl border bg-white p-8 shadow-xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-center mb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 mb-5">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Welcome to AdmitFlow</h1>
            <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
              Track Uttarakhand college admissions, notices, and deadlines — all in one place.
            </p>
          </div>

          {error && (
            <div role="alert" className="mb-5 rounded-xl bg-red-50 border border-red-100 p-3.5 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400 flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0">&#x26A0;&#xFE0F;</span>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div id="google-signin-btn" className="w-full flex justify-center min-h-[44px]"></div>

            <a
              href={`/api/auth/google/authorize?redirect=${encodeURIComponent(safeRedirect)}`}
              className={`w-full rounded-xl border-2 px-5 py-3 text-sm font-semibold flex items-center justify-center gap-3 hover:bg-gray-50 disabled:opacity-50 transition-all dark:border-gray-700 dark:hover:bg-gray-800 ${signingIn ? "pointer-events-none opacity-50" : ""}`}
            >
              {signingIn ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              {signingIn ? "Signing in..." : "Continue with Google"}
            </a>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t dark:border-gray-700"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-gray-400 dark:bg-gray-900">Free forever — no email or password needed</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
            {[
              "Track 30+ colleges",
              "Real-time notices",
              "AI summaries",
              "Deadline alerts",
            ].map((f) => (
              <div key={f} className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-indigo-500 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          By signing in, you agree to our{" "}
          <Link href="/tos" className="underline hover:text-gray-600 dark:hover:text-gray-300">Terms of Service</Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-gray-600 dark:hover:text-gray-300">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
