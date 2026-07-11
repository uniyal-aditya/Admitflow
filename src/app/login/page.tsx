"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, ArrowLeft, Loader } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const safeRedirect = redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/dashboard";
  const { googleLogin, user } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.push(safeRedirect);
  }, [user, router, safeRedirect]);

  if (user) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <Loader className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const google = (window as any).google;
      if (!google?.accounts?.id) {
        setError("Google Sign-In is not available. Please try again.");
        setLoading(false);
        return;
      }
      google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: async (response: { credential: string }) => {
          const result = await googleLogin(response.credential);
          setLoading(false);
          if (result.error) {
            setError(result.error);
          } else {
            router.push(safeRedirect);
          }
        },
      });
      google.accounts.id.prompt();
    } catch {
      setError("Failed to initialize Google Sign-In.");
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl font-bold">Sign In</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to your AdmitFlow account</p>
          </div>

          {error && <div role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">{error}</div>}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full rounded-xl border px-4 py-3 text-sm font-medium flex items-center justify-center gap-3 hover:bg-gray-50 disabled:opacity-50 transition-colors dark:border-gray-700 dark:hover:bg-gray-800"
          >
            {loading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {loading ? "Signing in..." : "Sign in with Google"}
          </button>

          <p className="mt-6 text-center text-xs text-gray-400">
            By signing in, you agree to our{" "}
            <Link href="/tos" className="underline hover:text-gray-600">Terms</Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
