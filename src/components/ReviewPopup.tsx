"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const LS_DISMISSED = "ahq_review_dismissed";
const LS_LAST_SHOWN = "ahq_review_last_shown";
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

export function ReviewPopup() {
  const { user, loading } = useAuth();
  const [visible, setVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading || !user) return;
    try {
      if (localStorage.getItem(LS_DISMISSED) === "true") return;
      const lastShown = localStorage.getItem(LS_LAST_SHOWN);
      if (lastShown && Date.now() - Number(lastShown) < ONE_WEEK) return;
      setVisible(true);
    } catch {}
  }, [user, loading]);

  useEffect(() => {
    if (!visible) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        handleClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [visible]);

  function handleClose() {
    if (dontAskAgain) {
      try { localStorage.setItem(LS_DISMISSED, "true"); } catch {}
    } else {
      try { localStorage.setItem(LS_LAST_SHOWN, String(Date.now())); } catch {}
    }
    setVisible(false);
  }

  async function handleSubmit() {
    if (rating < 1) return;
    setSubmitting(true);
    try {
      await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || null }),
      });
    } catch {}
    if (dontAskAgain) {
      try { localStorage.setItem(LS_DISMISSED, "true"); } catch {}
    } else {
      try { localStorage.setItem(LS_LAST_SHOWN, String(Date.now())); } catch {}
    }
    setSubmitting(false);
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
        >
          <motion.div
            ref={ref}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border dark:border-gray-800 p-6 w-80"
          >
            <button onClick={handleClose} className="absolute top-3 right-3 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <X className="h-4 w-4" />
            </button>

            <div className="text-center mb-5">
              <Star className="h-8 w-8 mx-auto text-yellow-400 mb-2" />
              <h3 className="font-semibold">How's your experience?</h3>
              <p className="text-sm text-gray-500 mt-1">Your feedback helps us improve</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(n)}
                    className="p-1 transition-colors"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        n <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Any feedback? (optional)"
                rows={3}
                className="w-full rounded-xl border bg-white/50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900 dark:border-gray-700 resize-none"
              />

              <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontAskAgain}
                  onChange={(e) => setDontAskAgain(e.target.checked)}
                  className="rounded"
                />
                Don't ask again
              </label>

              <div className="flex gap-2">
                <button
                  onClick={handleClose}
                  className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Later
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || rating < 1}
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Submit"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
