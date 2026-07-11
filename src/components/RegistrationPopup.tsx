"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
      await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          referralSource: referralSource || null,
          customSource: referralSource === "Other" ? customSource.trim() || null : null,
        }),
      });
      localStorage.setItem(STORAGE_KEY, "1");
      setDone(true);
      setTimeout(() => setOpen(false), 1500);
    } catch {} finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900 overflow-y-auto max-h-[90vh]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold">Welcome to AdmitFlow!</h2>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Help us improve. Share a bit about yourself (optional).
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name *" required className="w-full rounded-lg border px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-800 dark:border-gray-700" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" className="w-full rounded-lg border px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-800 dark:border-gray-700" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="w-full rounded-lg border px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-800 dark:border-gray-700" />
              <select value={referralSource} onChange={(e) => setReferralSource(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700">
                <option value="">How did you find us? (optional)</option>
                {referralOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
              </select>
              {referralSource === "Other" && (
                <input type="text" value={customSource} onChange={(e) => setCustomSource(e.target.value)} placeholder="Please specify..." className="w-full rounded-lg border px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-800 dark:border-gray-700" />
              )}
              <button type="submit" disabled={submitting || !name.trim()} className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                {submitting ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : done ? "You're all set!" : "Submit"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
