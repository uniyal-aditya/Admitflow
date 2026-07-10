"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, GraduationCap } from "lucide-react";

export default function AdminSetupPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [exists, setExists] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/admin/setup")
      .then((r) => r.json())
      .then((d) => {
        if (d.exists) setExists(true);
        setAdminEmail(d.email || "adityarb200789@gmail.com");
        setLoading(false);
      })
      .catch(() => {
        setError("Could not check account status.");
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create account");
      setSubmitting(false);
      return;
    }
    setDone(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="rounded-full bg-green-100 p-3 w-16 h-16 mx-auto flex items-center justify-center dark:bg-green-900/30">
            <GraduationCap className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold">Account created!</h1>
          <p className="text-gray-500">You are now logged in.</p>
          <button onClick={() => router.push("/admin")} className="rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm hover:bg-indigo-700 transition-colors">
            Go to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (exists) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <GraduationCap className="h-12 w-12 text-indigo-600 mx-auto" />
          <h1 className="text-xl font-bold">Account already exists</h1>
          <p className="text-gray-500"><a href="/login" className="text-indigo-600 underline">Log in here</a> to access the admin panel.</p>
          <button onClick={() => router.push("/login")} className="rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm hover:bg-indigo-700 transition-colors">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-sm rounded-xl border bg-white p-6 dark:bg-gray-900 dark:border-gray-800">
        <div className="text-center mb-6">
          <GraduationCap className="h-10 w-10 text-indigo-600 mx-auto" />
          <h1 className="text-lg font-bold mt-2">Claim Admin Account</h1>
          <p className="text-sm text-gray-500 mt-1">One-time setup for the owner</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Admin Email</label>
            <input type="email" value={adminEmail} disabled
              className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Set Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              placeholder="At least 6 characters"
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 py-2 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {submitting ? "Creating..." : "Create Admin Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
