"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, ArrowLeft, Eye, EyeOff, Loader } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) { router.push("/dashboard"); return null; }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!email || !password) { setError("Fill in all fields"); return; }
    setLoading(true);
    const r = await login(email, password);
    setLoading(false);
    if (r.error) setError(r.error); else router.push("/dashboard");
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

          {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">{error}</div>}

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
            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader className="h-4 w-4 animate-spin" />} Sign In</button>
          </form>
        </div>
      </div>
    </div>
  );
}
