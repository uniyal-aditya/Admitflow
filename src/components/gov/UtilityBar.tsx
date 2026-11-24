"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Download, Moon, Sun, LogIn, Lightbulb } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/AuthProvider";
import { useInstallApp } from "@/hooks/useInstallApp";
import { InstallGuide } from "@/components/InstallGuide";
import { START_TOUR_EVENT } from "@/components/gov/GuidedTour";

const SIZES = [
  { key: "sm", label: "A-", title: "Smaller text" },
  { key: "md", label: "A", title: "Normal text" },
  { key: "lg", label: "A+", title: "Larger text" },
] as const;

export function UtilityBar() {
  const { theme, setTheme } = useTheme();
  const { user, loading } = useAuth();
  const { install, isStandalone, platform, guideOpen, closeGuide } = useInstallApp();
  const [size, setSize] = useState<string>("md");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("af_text_size");
      if (saved) { setSize(saved); document.documentElement.dataset.textSize = saved; }
    } catch {}
  }, []);

  const applySize = (key: string) => {
    setSize(key);
    document.documentElement.dataset.textSize = key;
    try { localStorage.setItem("af_text_size", key); } catch {}
  };

  const btn = "rounded px-2 py-1 text-xs font-semibold text-white/90 hover:bg-white/15";

  return (
    <div className="bg-indigo-950 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5 text-xs">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <p className="hidden sm:block text-white/80">Uttarakhand college admission information</p>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <div data-tour="accessibility" className="flex items-center gap-0.5" role="group" aria-label="Text size">
            {SIZES.map((s) => (
              <button
                key={s.key}
                type="button"
                title={s.title}
                aria-label={s.title}
                aria-pressed={size === s.key}
                onClick={() => applySize(s.key)}
                className={`${btn} ${size === s.key ? "bg-white/20" : ""}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(START_TOUR_EVENT))}
            className={`${btn} inline-flex items-center gap-1`}
            aria-label="Start the guided tour"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`${btn} inline-flex items-center gap-1`}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
          </button>

          {!isStandalone && (
            <button type="button" data-tour="install" onClick={() => { void install(); }} className={`${btn} inline-flex items-center gap-1`}>
              <Download className="h-3.5 w-3.5" />
              <span>Get the app</span>
            </button>
          )}

          {!loading && !user && (
            <Link href="/login" data-tour="account" className="inline-flex items-center gap-1 rounded bg-saffron-500 px-3 py-1 font-semibold text-white hover:bg-saffron-600">
              <LogIn className="h-3.5 w-3.5" /> Sign in
            </Link>
          )}
        </div>
      </div>
      <InstallGuide open={guideOpen} platform={platform} onClose={closeGuide} />
    </div>
  );
}
