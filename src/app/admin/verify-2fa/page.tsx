"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield, KeyRound } from "lucide-react";

export default function Verify2FAPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/admin/2fa/status")
      .then((r) => r.json())
      .then((d) => {
        if (!d.enabled) router.push("/admin");
      })
      .finally(() => setChecking(false));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (token.trim().length !== 6) return;
    setVerifying(true);
    setError("");
    const res = await fetch("/api/admin/2fa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token.trim() }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      const err = await res.json();
      setError(err.error || "Invalid code");
    }
    setVerifying(false);
  }

  if (checking) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border bg-white p-8 shadow-xl dark:bg-gray-900 dark:border-gray-800">
          <div className="text-center mb-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 mb-4">
              <Shield className="h-7 w-7 text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold">Two-Factor Authentication</h1>
            <p className="text-sm text-gray-500 mt-2">Enter the code from your authenticator app</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400 text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="2fa-code" className="sr-only">Authentication code</label>
              <input
                id="2fa-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full rounded-xl border px-4 py-3 text-2xl font-mono tracking-[0.5em] text-center focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-800 dark:border-gray-700"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={verifying || token.length !== 6}
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              {verifying ? "Verifying..." : "Verify"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
