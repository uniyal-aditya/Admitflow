"use client";

import { useEffect, useState } from "react";
import { X, Megaphone } from "lucide-react";

export function MarqueeBanner() {
  const [message, setMessage] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("af_banner_dismissed");
    if (stored === "true") { setDismissed(true); return; }

    fetch("/api/banner")
      .then((r) => r.json())
      .then((data) => {
        if (data?.message) setMessage(data.message);
      })
      .catch(() => {});
  }, []);

  if (!message || dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm overflow-hidden">
      <div className="flex items-center">
        <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white/10 font-medium text-xs">
          <Megaphone className="h-3.5 w-3.5" />
          Announcement
        </div>
        <div className="flex-1 overflow-hidden py-2">
          <div className="animate-marquee whitespace-nowrap">
            <span className="inline-block px-4">{message}</span>
          </div>
        </div>
        <button
          onClick={() => { setDismissed(true); sessionStorage.setItem("af_banner_dismissed", "true"); }}
          className="shrink-0 px-3 py-2 hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
