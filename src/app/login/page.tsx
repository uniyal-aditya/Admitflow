"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GraduationCap, ArrowLeft, Sparkles, Check } from "lucide-react";

function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookieConsent")) setShow(true);
  }, []);

  function accept() {
    localStorage.setItem("cookieConsent", "true");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-900 border-t shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This site uses cookies for authentication and analytics. By continuing, you agree to our use of cookies.
        </p>
        <button
          onClick={accept}
          className="shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const errorParam = searchParams.get("error");
  const safeRedirect = redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/dashboard";
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (errorParam === "config") setError("Authentication configuration error.");
    else if (errorParam === "denied") setError("Sign in was cancelled.");
    else if (errorParam === "auth_failed") setError("Authentication failed. Please try again.");
    else if (errorParam === "server") setError("A server error occurred. Please try again.");
  }, [errorParam]);

  const authUrl = `/api/auth/google/authorize?redirect=${encodeURIComponent(safeRedirect)}`;

  return (
    <>
      <script src="https://accounts.google.com/gsi/client" async defer></script>
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
              {acceptedTerms ? (
                <a
                  href={authUrl}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 px-5 py-3 text-sm font-semibold flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-gray-900 dark:text-gray-100"
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </a>
              ) : (
                <button
                  disabled
                  className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 px-5 py-3 text-sm font-semibold flex items-center justify-center gap-3 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
              )}

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                    acceptedTerms
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-300 dark:border-gray-600 group-hover:border-gray-400"
                  }`}>
                    {acceptedTerms && <Check size={14} className="text-white" />}
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  I have read and agree to the{" "}
                  <Link href="/tos" className="text-blue-600 hover:underline">Terms of Service</Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                </span>
              </label>
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
      <CookieConsent />
    </>
  );
}
