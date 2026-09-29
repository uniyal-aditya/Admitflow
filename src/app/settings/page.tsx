"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Bell, Mail, Smartphone, Globe, Clock, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useNotification } from "@/components/NotificationProvider";
import { getSettings, setSettings as persistSettings } from "@/lib/store";
import type { UserSettings } from "@/types";

const fadeSlide = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
} as const;

const noticeTypeLabels: Record<string, string> = {
  admission: "Admission", registration: "Registration", counselling: "Counselling",
  spot_round: "Spot Round", vacant_seat: "Vacant Seat", merit_list: "Merit List",
  waiting_list: "Waiting List", fee_payment: "Fee Payment", reporting: "Reporting",
  extension: "Extension", general: "General",
};

const noticeTypes = Object.keys(noticeTypeLabels);

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { isSubscribed, subscribe, unsubscribe } = useNotification();
  const [settings, setSettings] = useState<UserSettings>(getSettings());
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState("");
  const [dbSynced, setDbSynced] = useState(false);

  // On mount: local settings render instantly; signed-in users then adopt
  // their DB settings as the source of truth.
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.email) setEmail(d.email); })
      .catch(() => {});
    (async () => {
      try {
        const res = await fetch("/api/user/state", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setSettings((prev) => ({
              ...prev,
              notificationTypes: data.settings.notificationTypes,
              scanFrequency: data.settings.scanFrequency,
              language: data.settings.language,
              emailNotifications: data.settings.emailNotifications,
              deviceNotifications: data.settings.deviceNotifications,
            }));
            setDbSynced(true);
          }
        }
      } catch {
        /* guest: local settings only */
      }
    })();
  }, []);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (settings.deviceNotifications) fetch("/api/notifications/check", { method: "POST" }).catch(() => {});
    }, 300000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [settings.deviceNotifications]);

  function update(key: keyof UserSettings, value: any) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    persistSettings(next);
    // Signed-in: persist the server-side subset to the DB (local persist
    // stays authoritative for view prefs like theme + startOnBoot).
    if (dbSynced) {
      void syncDbSettings(next);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function syncDbSettings(s: UserSettings) {
    try {
      await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationTypes: s.notificationTypes,
          scanFrequency: s.scanFrequency,
          language: s.language,
          emailNotifications: s.emailNotifications,
          deviceNotifications: s.deviceNotifications,
        }),
      });
    } catch {
      /* offline: local persists; DB catches up on next change */
    }
  }

  function toggleNoticeType(type: string) {
    const current = settings.notificationTypes || [];
    const next = current.includes(type as any)
      ? current.filter((t) => t !== type)
      : [...current, type];
    update("notificationTypes", next);
  }

  async function handlePushToggle(enable: boolean) {
    if (enable) {
      const ok = await subscribe();
      if (ok) update("deviceNotifications", true);
    } else {
      await unsubscribe();
      update("deviceNotifications", false);
    }
  }

  const sections = [
    {
      id: "appearance",
      title: "Appearance",
      icon: theme === "dark" ? Moon : Sun,
      content: (
        <div className="flex flex-wrap gap-2">
          {["light", "dark", "system"].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                theme === t
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              {t === "light" ? <Sun className="h-4 w-4" /> : t === "dark" ? <Moon className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      ),
    },
    {
      id: "channels",
      title: "Notification Channels",
      icon: Bell,
      content: (
        <div className="space-y-4">
          <label className="flex items-start gap-3 rounded-lg border p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors dark:border-gray-700">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => update("emailNotifications", e.target.checked)}
              className="mt-1 rounded"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="text-sm font-medium">Email Notifications</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Receive alerts at {email || "your email"}</p>
            </div>
          </label>
          <label className="flex items-start gap-3 rounded-lg border p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors dark:border-gray-700">
            <input
              type="checkbox"
              checked={settings.deviceNotifications}
              onChange={(e) => handlePushToggle(e.target.checked)}
              className="mt-1 rounded"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-indigo-500 shrink-0" />
                <span className="text-sm font-medium">Push Notifications</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{isSubscribed ? "Subscribed" : "Not subscribed"} to push notifications</p>
            </div>
          </label>
        </div>
      ),
    },
    {
      id: "types",
      title: "Notice Types",
      icon: Bell,
      content: (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {noticeTypes.map((type) => {
            const enabled = settings.notificationTypes?.includes(type as any);
            return (
              <button
                key={type}
                onClick={() => toggleNoticeType(type)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all ${
                  enabled
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                <div className={`h-2 w-2 rounded-full shrink-0 ${enabled ? "bg-indigo-500" : "bg-gray-300"}`} />
                {noticeTypeLabels[type]}
              </button>
            );
          })}
        </div>
      ),
    },
    {
      id: "scan",
      title: "Scan Frequency",
      icon: Clock,
      content: (
        <div className="flex flex-wrap gap-2">
          {[1, 3, 6, 12, 24].map((h) => (
            <button
              key={h}
              onClick={() => update("scanFrequency", h)}
              className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                settings.scanFrequency === h
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              Every {h}h
            </button>
          ))}
        </div>
      ),
    },
    {
      id: "language",
      title: "Language & Region",
      icon: Globe,
      content: (
        <div className="flex flex-wrap gap-2">
          {["en", "hi"].map((lang) => (
            <button
              key={lang}
              onClick={() => update("language", lang)}
              className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                settings.language === lang
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              {lang === "en" ? "English" : "हिन्दी"}
            </button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Customize your AdmitFlow experience</p>
        </div>
        {saved && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full dark:bg-green-950/30 dark:text-green-400">
            <Check className="h-3.5 w-3.5" /> Saved
          </motion.div>
        )}
      </div>

      {sections.map((section, i) => {
        const Icon = section.icon;
        return (
          <motion.div
            key={section.id}
            variants={fadeSlide}
            initial="initial"
            animate="animate"
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800"
          >
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <Icon className="h-5 w-5" />
              {section.title}
            </h2>
            {section.content}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
