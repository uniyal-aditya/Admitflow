"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Megaphone } from "lucide-react";

export function MarqueeBanner() {
  const [banners, setBanners] = useState<{ id: string; message: string }[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("af_banner_dismissed");
    if (stored === "true") { setDismissed(true); return; }

    fetch("/api/banner")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setBanners(data);
      })
      .catch(() => {});
  }, []);

  if (banners.length === 0 || dismissed) return null;

  const count = banners.length;
  const speed = count <= 2 ? 20 : count <= 4 ? 35 : 50;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm overflow-hidden"
      >
        <div className="flex items-center">
          <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white/10 font-medium text-xs">
            <Megaphone className="h-3.5 w-3.5" />
            Announcement
          </div>
          <div className="flex-1 overflow-hidden py-2">
            <div
              className="whitespace-nowrap"
              style={{
                animation: `marquee ${speed}s linear infinite`,
                display: "inline-block",
              }}
            >
              {banners.map((b, i) => (
                <span key={b.id} className="inline-block px-4">
                  {i > 0 && <span className="mx-2 opacity-50">•</span>}
                  {b.message}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => { setDismissed(true); sessionStorage.setItem("af_banner_dismissed", "true"); }}
            className="shrink-0 px-3 py-2 hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
