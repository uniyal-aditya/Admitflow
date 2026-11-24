"use client";

import { X, Share, MoreVertical, Download, PlusSquare } from "lucide-react";
import type { Platform } from "@/hooks/useInstallApp";

const STEPS: Record<Platform, { title: string; steps: string[] }> = {
  ios: {
    title: "Install on iPhone / iPad",
    steps: [
      "Open this site in Safari (not inside another app's browser).",
      "Tap the Share button at the bottom of the screen.",
      "Scroll down and tap “Add to Home Screen”.",
      "Tap “Add”. AdmitFlow now opens like an app.",
    ],
  },
  android: {
    title: "Install on Android",
    steps: [
      "Open this site in Chrome.",
      "Tap the ⋮ menu at the top right.",
      "Tap “Install app” (or “Add to Home screen”).",
      "Confirm. AdmitFlow appears in your app drawer.",
    ],
  },
  desktop: {
    title: "Install on computer",
    steps: [
      "Use Chrome or Edge.",
      "Click the install icon at the right end of the address bar, or open the ⋮ menu and choose “Install AdmitFlow”.",
      "Confirm. AdmitFlow opens in its own window.",
    ],
  },
};

export function InstallGuide({ open, platform, onClose }: { open: boolean; platform: Platform; onClose: () => void }) {
  if (!open) return null;
  const { title, steps } = STEPS[platform];
  const Icon = platform === "ios" ? Share : platform === "android" ? MoreVertical : Download;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        <ol className="space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <PlusSquare className="h-3.5 w-3.5" /> Already installed? Open AdmitFlow from your home screen or app list.
        </p>
      </div>
    </div>
  );
}
