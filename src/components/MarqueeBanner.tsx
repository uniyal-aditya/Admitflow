"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Megaphone } from "lucide-react";

const STORAGE_KEY = "af_banner_dismissed";

function useSessionState<T>(key: string, defaultValue: T): [T, (v: T) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = sessionStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setAndPersist = (value: T) => {
    setState(value);
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {}
  };

  return [state, setAndPersist];
}

export function MarqueeBanner() {
  const [banners, setBanners] = useState<{ id: string; message: string }[]>([]);
  const [dismissed, setDismissed] = useSessionState(STORAGE_KEY, false);

  useEffect(() => {
    fetch("/api/banner")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setBanners(data);
      })
      .catch(() => {});
  }, []);

  const renderText = () => (
    <>
      {banners.map((b, i) => (
        <span key={i}>
          <span>{b.message}</span>
          {i < banners.length - 1 && (
            <span className="mx-4 text-white/40">•</span>
          )}
        </span>
      ))}
    </>
  );

  const textContent = renderText();

  return (
    <AnimatePresence>
      {!dismissed && banners.length > 0 && (
        <motion.div
          key="banner"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="relative w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm overflow-hidden"
          aria-live="polite"
        >
          <div className="mx-auto flex items-center max-w-7xl px-2 md:px-4">
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white/10 font-medium text-xs">
              <Megaphone className="h-3.5 w-3.5" />
              Announcement
            </div>
            <div
              className="flex-1 overflow-hidden py-2 relative min-w-0"
              style={{ maskImage: "linear-gradient(90deg,transparent 0,#000 16px,#000 98%,transparent 100%)" }}
            >
              <div
                className="whitespace-nowrap"
                style={{
                  display: "inline-block",
                  animation: "marquee-fast 3s linear infinite",
                  willChange: "transform",
                }}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} className={i > 0 ? "ml-4" : ""}>{textContent}</span>
                ))}
              </div>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 px-3 py-2 hover:bg-white/10 transition-colors"
              aria-label="Dismiss announcement"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
