"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, Phone, Chrome, ArrowLeft, Eye, EyeOff, Loader } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, googleLogin, user } = useAuth();
  const [mode, setMode] = useState<"select" | "email" | "phone" | "signup">("select");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    router.push("/dashboard");
    return null;
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.error) setError(result.error);
    else router.push("/dashboard");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    const result = await signup(email, password, name || undefined);
    setLoading(false);
    if (result.error) setError(result.error);
    else router.push("/dashboard");
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    // Demo Google auth — in production, use a real OAuth flow
    const result = await googleLogin(
      "demo@google.com",
      "Demo User",
      `google-${Date.now()}`
    );
    setLoading(false);
    if (result.error) setError(result.error);
    else router.push("/dashboard");
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
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
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {mode === "select" && (
            <div className="space-y-4">
              <button
                onClick={() => setMode("email")}
                className="w-full flex items-center justify-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              >
                <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Continue with Email
              </button>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Chrome className="h-5 w-5 text-blue-500" />
                )}
                Continue with Google
              </button>

              <button
                onClick={() => setMode("phone")}
                className="w-full flex items-center justify-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              >
                <Phone className="h-5 w-5 text-green-500" />
                Continue with Phone
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500 dark:bg-gray-900">or</span>
                </div>
              </div>

              <button
                onClick={() => setMode("signup")}
                className="w-full text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Create a new account
              </button>

              <p className="text-center text-xs text-gray-400">
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
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  className="w-full rounded-xl border bg-white/50 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border bg-white/50 px-4 py-2.5 pr-10 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-gray-500">Remember me</span>
                </label>
                <span className="text-indigo-600 cursor-pointer hover:underline">Forgot password?</span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("select")}
                className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Back to all options
              </button>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name (optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border bg-white/50 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  className="w-full rounded-xl border bg-white/50 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border bg-white/50 px-4 py-2.5 pr-10 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setMode("select")}
                className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Already have an account? Sign in
              </button>
            </form>
          )}

          {mode === "phone" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone Number</label>
                <div className="flex gap-2">
                  <select className="w-24 rounded-xl border bg-white/50 px-3 py-2.5 text-sm dark:bg-gray-900 dark:border-gray-700">
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    className="flex-1 rounded-xl border bg-white/50 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
              </div>
              <button className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 transition-colors">
                Send OTP
              </button>
              <p className="text-xs text-gray-400 text-center">
                We&apos;ll send a one-time password via SMS
              </p>
              <button
                onClick={() => setMode("select")}
                className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Back to all options
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
