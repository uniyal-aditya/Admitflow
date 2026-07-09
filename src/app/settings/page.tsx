"use client";

import { useState, useEffect } from "react";
import {
  Settings,   Bell, Moon, Sun, Globe, Download,
  Heart, Clock, RefreshCw, Trash2, Info, Gamepad2, Mail,
  Smartphone,
} from "lucide-react";
import { useTheme } from "next-themes";
import { getSettings, setSettings, getFavorites, getDownloads, getNotifications } from "@/lib/store";
import { UserSettings, NoticeType } from "@/types";
import { noticeTypeLabel } from "@/lib/utils";
import { usePixel } from "@/components/PixelProvider";
import { useNotification } from "@/components/NotificationProvider";

const allNoticeTypes: NoticeType[] = [
  "admission", "registration", "counselling", "spot_round",
  "vacant_seat", "merit_list", "waiting_list", "fee_payment",
  "reporting", "extension", "general",
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { pixelMode, togglePixel } = usePixel();
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
          <Gamepad2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Pixel Theme
        </h2>
        <div className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Retro Pixel Mode</p>
              <p className="text-sm text-gray-500">Turn on the 8-bit pixel aesthetic</p>
            </div>
            <button
              onClick={togglePixel}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                pixelMode ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  pixelMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
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
            <p className="text-sm text-gray-500 mb-4">Select which notice types you want to be notified about</p>
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

          <div className="border-t pt-4 dark:border-gray-700">
            <p className="font-medium mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Notifications
            </p>
            <div className="space-y-3">
              <input
                type="email"
                value={settings.email || ""}
                onChange={(e) => update({ email: e.target.value })}
                placeholder="your@email.com"
                className="w-full rounded-lg border bg-white/50 px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
              />
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => update({ emailNotifications: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm">Send email alerts for selected notice types</span>
              </label>
            </div>
          </div>

          <div className="border-t pt-4 dark:border-gray-700">
            <p className="font-medium mb-3 flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Device Notifications
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {isSubscribed
                    ? "Push notifications are active"
                    : notifStatus === "denied"
                      ? "Notifications blocked — update browser settings"
                      : !swReady
                        ? "Initializing..."
                        : "Allow browser notifications for real-time alerts"}
                </p>
              </div>
              {!isSubscribed && notifStatus !== "denied" && swReady && (
                <button
                  onClick={requestDeviceNotif}
                  disabled={subscribing}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {subscribing ? "Enabling..." : "Enable"}
                </button>
              )}
            </div>
            {isSubscribed && (
              <label className="flex items-center gap-3 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.deviceNotifications}
                  onChange={(e) => toggleDeviceNotif(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm">Show push notifications for new notices</span>
              </label>
            )}
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
