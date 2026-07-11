"use client";

import { useState, useEffect } from "react";
import {
  Bell, Moon, Sun, Globe, Heart, Clock,
  RefreshCw, Info, Mail, Smartphone,
} from "lucide-react";
import { useTheme } from "next-themes";
import { getSettings, setSettings, getFavorites, getDownloads, getNotifications } from "@/lib/store";
import { UserSettings, NoticeType } from "@/types";
import { noticeTypeLabel } from "@/lib/utils";
import { useNotification } from "@/components/NotificationProvider";

const allNoticeTypes: NoticeType[] = [
  "admission", "registration", "counselling", "spot_round",
  "vacant_seat", "merit_list", "waiting_list", "fee_payment",
  "reporting", "extension", "general",
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [settings, setLocalSettings] = useState<UserSettings>(getSettings());
  const { isSubscribed, swReady, subscribe, unsubscribe } = useNotification();
  const [notifStatus, setNotifStatus] = useState<NotificationPermission | "">("");
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setNotifStatus(Notification.permission);
    }
  }, []);

  const update = (partial: Partial<UserSettings>) => {
    const updated = { ...settings, ...partial };
    setLocalSettings(updated);
    setSettings(partial);
  };

  const toggleNotifType = (type: NoticeType) => {
    const list = settings.notificationTypes.includes(type)
      ? settings.notificationTypes.filter((t) => t !== type)
      : [...settings.notificationTypes, type];
    update({ notificationTypes: list });
  };

  const requestDeviceNotif = async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setNotifStatus(result);
    if (result === "granted") {
      setSubscribing(true);
      const ok = await subscribe();
      if (ok) update({ deviceNotifications: true });
      setSubscribing(false);
    }
  };

  const toggleDeviceNotif = async (checked: boolean) => {
    if (checked) {
      if (notifStatus !== "granted") {
        const result = await Notification.requestPermission();
        setNotifStatus(result);
        if (result !== "granted") return;
      }
      setSubscribing(true);
      const ok = await subscribe();
      if (ok) update({ deviceNotifications: true });
      setSubscribing(false);
    } else {
      await unsubscribe();
      update({ deviceNotifications: false });
    }
  };

  useEffect(() => {
    if (!settings.deviceNotifications && !settings.emailNotifications) return;
    const check = async () => {
      try {
        await fetch("/api/notifications/check", { method: "POST" });
      } catch {}
    };
    check();
    const interval = setInterval(check, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [settings.deviceNotifications, settings.emailNotifications]);

  if (!mounted) return null;

  const stats = [
    { label: "Favourite Colleges", value: getFavorites().length },
    { label: "Total Downloads", value: getDownloads().length },
    { label: "Notifications", value: getNotifications().length },
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Customize your AdmitFlow experience
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-white p-4 text-center dark:bg-gray-900 dark:border-gray-800">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sun className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Appearance
        </h2>
        <div className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-gray-500">Choose your preferred theme</p>
            </div>
            <div className="flex gap-2">
              {[
                { value: "light", label: "Light", icon: Sun },
                { value: "dark", label: "Dark", icon: Moon },
                { value: "system", label: "System", icon: RefreshCw },
              ].map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      theme === opt.value
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                        : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:border-gray-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Notification Preferences
        </h2>
        <div className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800 space-y-6">

          <div>
            <p className="font-medium mb-3 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-indigo-600" />
              Notification Channels
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={`rounded-lg border p-4 ${settings.emailNotifications ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/20" : "border-gray-200 dark:border-gray-700"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${settings.emailNotifications ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200" : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>
                    {settings.emailNotifications ? "Active" : "Inactive"}
                  </span>
                </div>
                <input
                  type="email"
                  value={settings.email || ""}
                  onChange={(e) => update({ email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full rounded-lg border bg-white/50 px-3 py-1.5 text-xs mb-2 dark:bg-gray-900 dark:border-gray-700"
                />
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => update({ emailNotifications: e.target.checked })}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Receive email alerts
                </label>
              </div>
              <div className={`rounded-lg border p-4 ${settings.deviceNotifications ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/20" : "border-gray-200 dark:border-gray-700"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Smartphone className="h-4 w-4" />
                    Push
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${settings.deviceNotifications ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200" : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>
                    {settings.deviceNotifications ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {isSubscribed
                    ? "Push subscription active"
                    : notifStatus === "denied"
                      ? "Blocked — update browser settings"
                      : !swReady
                        ? "Initializing..."
                        : "Get real-time alerts"}
                </p>
                {!isSubscribed && notifStatus !== "denied" && swReady && (
                  <button
                    onClick={requestDeviceNotif}
                    disabled={subscribing}
                    className="w-full rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {subscribing ? "Enabling..." : "Enable Push"}
                  </button>
                )}
                {isSubscribed && (
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={settings.deviceNotifications}
                      onChange={(e) => toggleDeviceNotif(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Show push notifications
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-4 dark:border-gray-700">
            <p className="font-medium mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4 text-indigo-600" />
              Notice Types
            </p>
            <p className="text-sm text-gray-500 mb-4">Select which notice types trigger notifications</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allNoticeTypes.map((type) => (
                <label
                  key={type}
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    settings.notificationTypes.includes(type)
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-700"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={settings.notificationTypes.includes(type)}
                    onChange={() => toggleNotifType(type)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm">{noticeTypeLabel(type)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Language & Region
        </h2>
        <div className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Language</p>
              <p className="text-sm text-gray-500">UI language preference</p>
            </div>
            <select
              value={settings.language}
              onChange={(e) => update({ language: e.target.value as "en" | "hi" })}
              className="rounded-lg border bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Scan Settings
        </h2>
        <div className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Scan Frequency</p>
              <p className="text-sm text-gray-500">How often to check for new notices</p>
            </div>
            <select
              value={settings.scanFrequency}
              onChange={(e) => update({ scanFrequency: Number(e.target.value) })}
              className="rounded-lg border bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
            >
              <option value={1}>Every hour</option>
              <option value={3}>Every 3 hours</option>
              <option value={6}>Every 6 hours</option>
              <option value={12}>Every 12 hours</option>
              <option value={24}>Once a day</option>
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Heart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          About
        </h2>
        <div className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">License</span>
              <span className="font-medium">MIT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Region</span>
              <span className="font-medium">Uttarakhand, India</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
