"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Download, Star } from "lucide-react";
import { CollegeLogo } from "@/components/CollegeLogo";
import { getFavorites, getDownloads, getNotifications } from "@/lib/store";
import { formatDate } from "@/lib/utils";

// Client island for the personal slice of the dashboard. Data lives in
// localStorage today; Phase 7 moves favorites/settings to the user record and
// this island's data source changes, not its slots.

/** Downloads counter from localStorage (per-browser, not per-user yet). */
export function DownloadsStat() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    setCount(getDownloads().length);
  }, []);
  return (
    <StatsCardShell
      title="Downloads"
      value={count ?? "…"}
      icon={<Download className="h-5 w-5" />}
      description="Total downloads"
    />
  );
}

function StatsCardShell({ title, value, icon, description }: { title: string; value: string | number; icon: React.ReactNode; description?: string }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      {description && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>}
    </div>
  );
}

/** Favorites watchlist; resolves names via the static dataset fallback until Phase 7 wires DB favorites. */
export function DashboardPersonalWatchlist() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setFavorites(getFavorites());
    setMounted(true);
  }, []);
  if (!mounted || favorites.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-lg flex items-center gap-2">
        <Star className="h-5 w-5 text-yellow-500 fill-current" />
        Your Watchlist
      </h2>
      <WatchlistRows favorites={favorites} />
    </div>
  );
}


function WatchlistRows({ favorites }: { favorites: string[] }) {
  return (
    <div className="space-y-2">
      {favorites.slice(0, 3).map((id) => (
        <WatchlistRow key={id} id={id} />
      ))}
      {favorites.length > 3 && (
        <Link
          href="/watchlist"
          className="block text-center text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 pt-1"
        >
          +{favorites.length - 3} more
        </Link>
      )}
    </div>
  );
}

function WatchlistRow({ id }: { id: string }) {
  // Names resolve client-side from the shared colleges data module — the same
  // source legacy pages used — because localStorage ids have no server fetch.
  const [name, setName] = useState(id);
  const [location, setLocation] = useState("");
  useEffect(() => {
    import("@/data/colleges").then(({ colleges }) => {
      const c = colleges.find((x) => x.id === id);
      if (c) { setName(c.shortName); setLocation(c.location); }
    });
  }, [id]);
  return (
    <Link
      href={`/colleges/${id}`}
      className="flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm hover:shadow-md dark:bg-gray-900 dark:border-gray-800 transition-all"
    >
      <CollegeLogo collegeId={id} name={name} size="sm" />
      <div>
        <p className="text-sm font-medium">{name}</p>
        {location && <p className="text-xs text-gray-400">{location}</p>}
      </div>
    </Link>
  );
}

/** Recent local notifications with mark-all-read. */
export function DashboardPersonalAlerts() {
  const [notifications, setNotifications] = useState<ReturnType<typeof getNotifications>>([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setNotifications(getNotifications());
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-lg flex items-center gap-2">
        <Bell className="h-5 w-5 text-purple-500" />
        Recent Alerts
      </h2>
      {notifications.length === 0 ? (
        <p className="text-sm text-gray-400">No new notifications</p>
      ) : (
        <div className="space-y-2">
          {notifications.slice(0, 5).map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border bg-white p-3 shadow-sm dark:bg-gray-900 dark:border-gray-800 ${
                !n.read ? "border-l-4 border-l-indigo-500" : ""
              }`}
            >
              <p className="text-sm font-medium">{n.title}</p>
              <p className="text-xs text-gray-400">{n.collegeName} &middot; {formatDate(n.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
