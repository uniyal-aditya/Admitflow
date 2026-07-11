"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader, CheckCircle } from "lucide-react";

const STORAGE_KEY = "af_reg_popup_done";

export function RegistrationPopup() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", referralSource: "", customSource: "" });

  useEffect(() => {
    const already = localStorage.getItem(STORAGE_KEY);
    if (already === "true") return;
    const timer = setTimeout(() => setOpen(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const body: Record<string, string> = { name: form.name, email: form.email, phone: form.phone };
      if (form.referralSource === "other" && form.customSource) {
        body.referralSource = form.customSource;
      } else if (form.referralSource) {
        body.referralSource = form.referralSource;
      }
      const res = await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save");
      setDone(true);
      localStorage.setItem(STORAGE_KEY, "true");
      timerRef.current = setTimeout(() => setOpen(false), 1500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleDismiss(); }}
          role="dialog"
          aria-modal="true"
          aria-label="Stay updated with AdmitFlow"
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Stay Updated</h2>
              <button onClick={handleDismiss} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            {done ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="text-lg font-medium text-green-700 dark:text-green-400">You&apos;re all set!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">{error}</div>}
                <div>
                  <label htmlFor="popup-name" className="sr-only">Name</label>
                  <input id="popup-name" type="text" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-label="Name" className="w-full rounded-xl border bg-white/50 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-800 dark:border-gray-700" />
                </div>
                <div>
                  <label htmlFor="popup-email" className="sr-only">Email</label>
                  <input id="popup-email" type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-label="Email" className="w-full rounded-xl border bg-white/50 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-800 dark:border-gray-700" />
                </div>
                <div>
                  <label htmlFor="popup-phone" className="sr-only">Phone</label>
                  <input id="popup-phone" type="tel" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} aria-label="Phone" className="w-full rounded-xl border bg-white/50 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-800 dark:border-gray-700" />
                </div>
                <div>
                  <label htmlFor="popup-source" className="sr-only">How did you hear about us?</label>
                  <select id="popup-source" value={form.referralSource} onChange={(e) => setForm({ ...form, referralSource: e.target.value })} aria-label="How did you hear about us?" className="w-full rounded-xl border bg-white/50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-800 dark:border-gray-700">
                    <option value="">How did you hear about us?</option>
                    <option value="google">Google Search</option>
                    <option value="social">Social Media</option>
                    <option value="friend">Friend</option>
                    <option value="college">College</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {form.referralSource === "other" && (
                  <div>
                    <label htmlFor="popup-custom-source" className="sr-only">Please specify</label>
                    <input id="popup-custom-source" type="text" placeholder="Please specify" value={form.customSource} onChange={(e) => setForm({ ...form, customSource: e.target.value })} aria-label="Please specify" className="w-full rounded-xl border bg-white/50 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-800 dark:border-gray-700" />
                  </div>
                )}
                <button type="submit" disabled={saving} className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader className="h-4 w-4 animate-spin" />}
                  {saving ? "Saving..." : "Notify Me"}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
