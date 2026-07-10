"use client";

import { UserSettings, DownloadRecord, NotificationItem, CollegeType, NoticeType } from "@/types";

const KEYS = {
  FAVORITES: "ahq_favorites",
  SETTINGS: "ahq_settings",
  DOWNLOADS: "ahq_downloads",
  NOTIFICATIONS: "ahq_notifications",
  READ_NOTICES: "ahq_read_notices",
};

const defaultSettings: UserSettings = {
  favoriteColleges: [],
  notificationTypes: ["admission", "registration", "counselling", "spot_round", "vacant_seat", "merit_list"],
  scanFrequency: 6,
  downloadLocation: "downloads",
  theme: "system",
  language: "en",
  startOnBoot: false,
  email: "",
  emailNotifications: false,
  deviceNotifications: false,
};

// Favorites
export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS.FAVORITES);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function setFavorites(ids: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.FAVORITES, JSON.stringify(ids));
}

export function toggleFavorite(id: string): boolean {
  const faves = getFavorites();
  const idx = faves.indexOf(id);
  if (idx >= 0) { faves.splice(idx, 1); setFavorites(faves); return false; }
  else { faves.push(id); setFavorites(faves); return true; }
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}

// Settings
export function getSettings(): UserSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch { return defaultSettings; }
}

export function setSettings(s: Partial<UserSettings>): void {
  if (typeof window === "undefined") return;
  const current = getSettings();
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify({ ...current, ...s }));
}

// Downloads
export function getDownloads(): DownloadRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS.DOWNLOADS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function addDownload(record: DownloadRecord): void {
  const list = getDownloads();
  list.unshift(record);
  if (list.length > 200) list.length = 200;
  localStorage.setItem(KEYS.DOWNLOADS, JSON.stringify(list));
}

// Notifications
export function getNotifications(): NotificationItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS.NOTIFICATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function addNotification(item: NotificationItem): void {
  const list = getNotifications();
  list.unshift(item);
  if (list.length > 100) list.length = 100;
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
}

export function markNotificationRead(id: string): void {
  const list = getNotifications().map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
}

export function markAllNotificationsRead(): void {
  const list = getNotifications().map((n) => ({ ...n, read: true }));
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
}

export function getUnreadCount(): number {
  return getNotifications().filter((n) => !n.read).length;
}

// Suggested colleges
export interface SuggestedCollege {
  id: string;
  name: string;
  type: CollegeType;
  location: string;
  district: string;
  website: string;
  suggestedAt: string;
  suggestedBy?: string;
  status: "pending" | "approved" | "rejected";
}

export function getSuggestedColleges(): SuggestedCollege[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("ahq_suggested");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function addSuggestedCollege(c: Omit<SuggestedCollege, "id" | "suggestedAt" | "status">): void {
  const list = getSuggestedColleges();
  list.unshift({
    ...c,
    id: `suggested-${Date.now()}`,
    suggestedAt: new Date().toISOString(),
    status: "pending",
  });
  localStorage.setItem("ahq_suggested", JSON.stringify(list));
}

// Read notices tracking
export function isNoticeRead(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(KEYS.READ_NOTICES);
    const list: string[] = raw ? JSON.parse(raw) : [];
    return list.includes(id);
  } catch { return false; }
}

export function markNoticeRead(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEYS.READ_NOTICES);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(KEYS.READ_NOTICES, JSON.stringify(list));
    }
  } catch {}
}
