"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";

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
    <div role="region" aria-label="Cookie notice" className="fixed inset-x-0 bottom-0 z-50 border-t-4 border-saffron-500 bg-white p-4 shadow-lg dark:bg-gray-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-800 dark:text-gray-200">
          This site uses cookies to keep you signed in and to measure how the site is used. By continuing, you agree to this.
        </p>
        <button onClick={accept} className="shrink-0 rounded-md bg-indigo-800 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-900">Accept</button>
      </div>
    </div>
  );
}

const GoogleMark = () => (
  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

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

  const features = ["College profiles across Uttarakhand", "Latest admission notices", "Watchlist for colleges you follow", "Deadline alerts"];

  return (
    <>
      <div className="grid min-h-screen md:grid-cols-[1fr_1.1fr]">
        <aside className="hidden flex-col justify-between bg-indigo-900 p-10 text-white md:flex">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="" className="h-12 w-12" />
            <span className="font-serif text-2xl font-bold">AdmitFlow</span>
          </Link>
          <div>
            <h2 className="max-w-sm text-3xl font-bold leading-tight text-white">Uttarakhand college admissions, in one place</h2>
            <ul className="mt-6 space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-white/90"><Check className="h-5 w-5 shrink-0 text-saffron-400" />{f}</li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-white/70">An independent student information service. Not an official government website.</p>
        </aside>

        <main id="main-content" className="flex items-center justify-center bg-white px-4 py-12 dark:bg-gray-950">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-indigo-800 hover:underline dark:text-indigo-200">
              <ArrowLeft className="h-4 w-4" /> Back to home
            </Link>

            <h1 className="border-b-4 border-saffron-500 pb-1 text-3xl font-bold text-indigo-900 dark:text-white inline-block">Sign in</h1>
            <p className="mt-4 text-gray-700 dark:text-gray-300">Use your Google account. There is no separate password and the service is free.</p>

            {error && (
              <div role="alert" className="mt-5 rounded-md border-l-4 border-red-700 bg-red-50 p-3 text-sm text-red-900 dark:bg-red-950/40 dark:text-red-200">{error}</div>
            )}

            <div className="mt-6 space-y-5">
              <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-800 dark:text-gray-200">
                <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-indigo-800" />
                <span>
                  I have read and agree to the <Link href="/tos" className="font-semibold text-indigo-800 underline dark:text-indigo-200">Terms of Service</Link> and <Link href="/privacy" className="font-semibold text-indigo-800 underline dark:text-indigo-200">Privacy Policy</Link>.
                </span>
              </label>

              {acceptedTerms ? (
                <a href={authUrl} className="flex w-full items-center justify-center gap-3 rounded-md border-2 border-indigo-800 bg-white px-5 py-3 text-sm font-semibold text-indigo-900 hover:bg-indigo-50 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800">
                  <GoogleMark /> Continue with Google
                </a>
              ) : (
                <>
                  <button disabled aria-describedby="terms-hint" className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-md border-2 border-gray-300 bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                    <GoogleMark /> Continue with Google
                  </button>
                  <p id="terms-hint" className="text-xs text-gray-700 dark:text-gray-300">Tick the box above to enable sign-in.</p>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
      <CookieConsent />
    </>
  );
}
