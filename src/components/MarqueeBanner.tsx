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

  const count = banners.length;

  const renderText = () => (
    <>
      {banners.map((b, i) => (
        <span key={i}>
          <span>{b.message}</span>
          {i < banners.length - 1 && (
            <span className="mx-2 md:mx-8 text-white/40">•</span>
          )}
        </span>
      ))}
    </>
  );

  return (
    <AnimatePresence>
      {!dismissed && banners.length > 0 && (
        <motion.div
          key="banner"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm overflow-hidden"
          aria-live="polite"
        >
          <div className="flex items-center">
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white/10 font-medium text-xs">
              <Megaphone className="h-3.5 w-3.5" />
              Announcement
            </div>
            <div
              className="flex-1 overflow-hidden py-2 relative"
              style={{ maskImage: "linear-gradient(90deg,transparent 0,#000 32px,#000 98%,transparent 100%)" }}
            >
              <div
                className="whitespace-nowrap"
                style={{
                  display: "inline-block",
                  animation: `marquee ${count <= 2 ? 5 : 10}s linear infinite`,
                  willChange: "transform",
                }}
              >
                <span>{renderText()}</span>
                <span className="ml-2 md:ml-4">{renderText()}</span>
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
