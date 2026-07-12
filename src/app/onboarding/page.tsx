"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const SOURCES = [
  "Google Search",
  "YouTube",
  "Instagram",
  "Facebook",
  "Twitter / X",
  "Friend or Family",
  "College Notice Board",
  "WhatsApp / Telegram",
  "Other Social Media",
  "Other",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [referralSource, setReferralSource] = useState("");
  const [customSource, setCustomSource] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.onboardingCompleted) router.push("/dashboard");
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const source = referralSource === "Other" ? customSource.trim() : referralSource;
    if (!source) {
      setError("Please select or enter how you found us");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralSource: source }),
      });
      if (!res.ok) throw new Error();
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (user.onboardingCompleted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Redirecting...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 mb-5">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to AdmitFlow!</h1>
          <p className="text-sm text-gray-500 mt-2">Help us improve by answering one quick question.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-8 shadow-xl dark:bg-gray-900 dark:border-gray-800 space-y-5">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-3.5 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-3">How did you hear about us?</label>
            <div className="space-y-2">
              {SOURCES.map((source) => (
                <label
                  key={source}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                    referralSource === source
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-600"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="source"
                    value={source}
                    checked={referralSource === source}
                    onChange={(e) => setReferralSource(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    referralSource === source ? "border-indigo-600" : "border-gray-300 dark:border-gray-600"
                  }`}>
                    {referralSource === source && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                  </div>
                  <span className="text-sm">{source}</span>
                </label>
              ))}
            </div>
            {referralSource === "Other" && (
              <input
                type="text"
                value={customSource}
                onChange={(e) => setCustomSource(e.target.value)}
                placeholder="Please specify..."
                className="mt-2 w-full rounded-xl border bg-white/50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/25"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>Finish <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
