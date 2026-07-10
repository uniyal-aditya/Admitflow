"use client";

import { useState, useEffect } from "react";
import { X, GraduationCap, Send, Loader2 } from "lucide-react";

const STORAGE_KEY = "af_registered";

const referralOptions = [
  "Google Search",
  "Friend / Word of Mouth",
  "Social Media",
  "College / Teacher",
  "WhatsApp / Telegram",
  "Other",
];

export function RegistrationPopup() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [customSource, setCustomSource] = useState("");

  useEffect(() => {
    const already = localStorage.getItem(STORAGE_KEY);
    if (!already) {
      const timer = setTimeout(() => setOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const isPwa = window.matchMedia("(display-mode: standalone)").matches;
      await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          referralSource: referralSource === "Other" ? customSource.trim() : referralSource,
          isPwaUser: isPwa,
          userAgent: navigator.userAgent,
        }),
      });
      localStorage.setItem(STORAGE_KEY, "true");
      setDone(true);
      setTimeout(() => setOpen(false), 2000);
    } catch {} finally {
      setSubmitting(false);
    }
  }

  function handleSkip() {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 mb-3">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold">Welcome to AdmitFlow</h2>
          <p className="text-sm text-gray-500 mt-1">Help us improve — tell us a bit about yourself</p>
        </div>

        {done ? (
          <div className="text-center py-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600 mb-3">
              <Send className="h-6 w-6" />
            </div>
            <p className="font-medium text-green-700 dark:text-green-400">Thanks, {name}!</p>
            <p className="text-sm text-gray-500 mt-1">You're all set.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                className="w-full rounded-lg border px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-lg border px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="w-full rounded-lg border px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">How did you find us?</label>
              <select
                value={referralSource}
                onChange={(e) => setReferralSource(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="">Select...</option>
                {referralOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {referralSource === "Other" && (
                <input
                  type="text"
                  value={customSource}
                  onChange={(e) => setCustomSource(e.target.value)}
                  placeholder="Tell us how..."
                  className="w-full rounded-lg border px-3 py-2.5 text-sm mt-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-800 dark:border-gray-700"
                />
              )}
            </div>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? "Submitting..." : "Get Started"}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="w-full text-xs text-gray-400 hover:text-gray-600 py-1"
            >
              Skip for now
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
