"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Download } from "lucide-react";
import { CollegeLogo } from "@/components/CollegeLogo";
import { useFavorites } from "@/hooks/useFavorites";
import { useCollegeLookup } from "@/hooks/useCollegeLookup";
import { getDownloads, getNotifications } from "@/lib/store";
import { formatDate } from "@/lib/utils";

// Client island for the personal slice of the dashboard. Signed-in users
// read favorites/downloads from the DB (via /api/user/state and the shared
// useFavorites hook); guests fall back to localStorage.

/** Downloads counter: DB for signed-in users, localStorage for guests. */
export function DownloadsStat() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/user/state", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setCount(data.downloads.length);
          return;
        }
      } catch {
        /* fall through to local */
      }
      if (!cancelled) setCount(getDownloads().length);
    })();
    return () => {
      cancelled = true;
    };
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
    <div className="rounded-md border border-gray-200 border-t-4 border-t-indigo-800 bg-white p-4 dark:border-gray-800 dark:border-t-indigo-500 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</p>
        <div className="rounded-full bg-indigo-100 p-2 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200">{icon}</div>
      </div>
      <p className="mt-2 font-serif text-3xl font-bold text-indigo-900 dark:text-white">{value}</p>
      {description && <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">{description}</p>}
    </div>
  );
}

const heading = "mb-3 inline-block border-b-2 border-saffron-500 pb-1 text-xl font-bold text-indigo-900 dark:text-white";

/** Watchlist summary. College names come from the database, so edits made in the admin panel show up here. */
export function DashboardPersonalWatchlist() {
  const { favorites, ready } = useFavorites();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !ready) return null;

  return (
    <section aria-labelledby="watchlist-h">
      <h2 id="watchlist-h" className={heading}>Your watchlist</h2>
      {favorites.length === 0 ? (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          You are not following any college yet. Open a <Link href="/colleges" className="font-semibold text-indigo-800 underline dark:text-indigo-200">college profile</Link> and select the star to add it here.
        </p>
      ) : (
        <ul className="space-y-2">
          {favorites.slice(0, 3).map((id) => <li key={id}><WatchlistRow id={id} /></li>)}
          {favorites.length > 3 && (
            <li><Link href="/watchlist" className="block pt-1 text-sm font-semibold text-indigo-800 hover:underline dark:text-indigo-200">See all {favorites.length} colleges</Link></li>
          )}
        </ul>
      )}
    </section>
  );
}

function WatchlistRow({ id }: { id: string }) {
  const { colleges } = useCollegeLookup();
  const c = colleges[id];
  return (
    <Link href={`/colleges/${id}`} className="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-3 hover:bg-indigo-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800">
      <CollegeLogo collegeId={id} name={c?.shortName ?? id} size="sm" />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-indigo-900 dark:text-white">{c?.shortName ?? id}</span>
        {c?.location && <span className="block text-xs text-gray-700 dark:text-gray-300">{c.location}</span>}
      </span>
    </Link>
  );
}

interface AlertItem { id: string; title: string; collegeName: string; read: boolean; createdAt: string }

/** Recent alerts: from the account (database) when signed in, otherwise from this device. */
export function DashboardPersonalAlerts() {
  const [items, setItems] = useState<AlertItem[]>([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setItems(Array.isArray(data) ? data : []);
          return;
        }
      } catch { /* fall back to this device */ }
      if (!cancelled) setItems(getNotifications() as AlertItem[]);
    })().finally(() => { if (!cancelled) setMounted(true); });
    return () => { cancelled = true; };
  }, []);
  if (!mounted) return null;

  return (
    <section aria-labelledby="alerts-h">
      <h2 id="alerts-h" className={heading}>Recent alerts</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-700 dark:text-gray-300">No alerts yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.slice(0, 5).map((n) => (
            <li key={n.id} className={`rounded-md border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900 ${!n.read ? "border-l-4 border-l-saffron-500" : ""}`}>
              <p className="flex items-start gap-2 text-sm font-semibold text-indigo-900 dark:text-white"><Bell className="mt-0.5 h-4 w-4 shrink-0 text-saffron-600" />{n.title}</p>
              <p className="mt-0.5 pl-6 text-xs text-gray-700 dark:text-gray-300">{n.collegeName} &middot; {formatDate(n.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
