"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Bell, ArrowRight, MapPin } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { NoticeCard } from "@/components/NoticeCard";
import { PageHeading } from "@/components/gov/PageHeading";
import { useCollegeLookup } from "@/hooks/useCollegeLookup";
import { getNotifications, markAllNotificationsRead } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { Notice } from "@/types";

interface DbNotification {
  id: string;
  title: string;
  message: string;
  collegeName: string;
  read: boolean;
  createdAt: string;
}

// Watchlist interactivity: favorites come from the DB for signed-in users
// (localStorage for guests) via the shared useFavorites hook; notification
// history reads the DB via /api/notifications with a localStorage fallback.

export function WatchlistClient({
  notices,
  collegeNames,
}: {
  notices: Notice[];
  collegeNames: Record<string, string>;
}) {
  const { favorites, ready } = useFavorites();
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [usingDbNotifications, setUsingDbNotifications] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setNotifications(
              (Array.isArray(data) ? data : []).map((n: { id: string; title: string; message: string; collegeName: string; read: boolean; createdAt: string }) => ({
                id: n.id,
                title: n.title,
                message: n.message,
                collegeName: n.collegeName,
                read: n.read,
                createdAt: n.createdAt,
              })),
            );
            setUsingDbNotifications(true);
          }
          return;
        }
      } catch {
        /* guest / offline → local */
      }
      if (!cancelled) setNotifications(getNotifications());
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => setMounted(true), []);

  const favNotices = notices.filter((n) => favorites.includes(n.collegeId) && n.status !== "expired");
  const favDeadlines = favNotices
    .filter((n) => n.lastDate && new Date(n.lastDate) > new Date())
    .sort((a, b) => new Date(a.lastDate!).getTime() - new Date(b.lastDate!).getTime());

  const handleMarkAllRead = async () => {
    if (usingDbNotifications) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markAllRead: true }),
        });
        const res = await fetch("/api/notifications", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
          return;
        }
      } catch {
        /* fall through to local */
      }
    }
    markAllNotificationsRead();
    setNotifications(getNotifications());
  };

  if (!mounted || !ready) return null;

  const h2 = "mb-3 inline-block border-b-2 border-saffron-500 pb-1 text-xl font-bold text-indigo-900 dark:text-white";

  return (
    <div>
      <PageHeading
        title="Your watchlist"
        crumbs={[{ label: "Watchlist" }]}
        description="The colleges you follow, with their open notices and upcoming deadlines."
        action={favorites.length > 0 ? (
          <Link href="/colleges" className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-indigo-900 hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-900 dark:text-indigo-200 dark:hover:bg-gray-800">Add more colleges</Link>
        ) : undefined}
      />

      {favorites.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-300 bg-white py-14 text-center dark:border-gray-700 dark:bg-gray-900">
          <Star className="mx-auto mb-3 h-10 w-10 text-gray-400" />
          <p className="font-serif text-xl font-semibold">Your watchlist is empty</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-gray-700 dark:text-gray-300">Select the star on a college to follow it. Its notices and deadlines will be collected on this page.</p>
          <Link href="/colleges" className="mt-5 inline-flex items-center gap-2 rounded-md bg-indigo-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-900">
            Browse colleges <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <FavoriteCollegeGrid favorites={favorites} />

          {favDeadlines.length > 0 && (
            <section>
              <h2 className={h2}>Upcoming deadlines</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {favDeadlines.map((n) => <NoticeCard key={n.id} notice={n} collegeNames={collegeNames} />)}
              </div>
            </section>
          )}

          {favNotices.length > favDeadlines.length && (
            <section>
              <h2 className={h2}>Notices from your colleges</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {favNotices.slice(0, 6).map((n) => <NoticeCard key={n.id} notice={n} collegeNames={collegeNames} />)}
              </div>
            </section>
          )}

          {favNotices.length === 0 && (
            <p className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
              No open notices from these colleges right now. Check each college&apos;s official website for the latest news.
            </p>
          )}

          {notifications.length > 0 && (
            <section>
              <div className="flex items-end justify-between">
                <h2 className={h2}>Notification history</h2>
                <button onClick={() => void handleMarkAllRead()} className="mb-3 text-sm font-semibold text-indigo-800 underline dark:text-indigo-200">Mark all as read</button>
              </div>
              <ul className="space-y-2">
                {notifications.slice(0, 10).map((n) => (
                  <li key={n.id} className={`flex items-start gap-3 rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 ${!n.read ? "border-l-4 border-l-saffron-500" : ""}`}>
                    <Bell className="mt-0.5 h-5 w-5 shrink-0 text-saffron-600" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-indigo-900 dark:text-white">{n.title}</p>
                      <p className="mt-0.5 text-sm text-gray-800 dark:text-gray-200">{n.message}</p>
                      <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">{n.collegeName} &middot; {formatDate(n.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

/** Followed colleges. Details come from the database (not the static seed file). */
function FavoriteCollegeGrid({ favorites }: { favorites: string[] }) {
  const { colleges, loaded } = useCollegeLookup();
  if (!loaded) return null;

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {favorites.map((id) => {
        const c = colleges[id];
        return (
          <li key={id}>
            <Link href={`/colleges/${id}`} className="block h-full rounded-md border border-gray-200 border-t-4 border-t-indigo-800 bg-white p-4 hover:shadow-md dark:border-gray-800 dark:border-t-indigo-500 dark:bg-gray-900">
              <p className="font-serif text-lg font-semibold leading-snug text-indigo-900 dark:text-white">{c?.shortName ?? id}</p>
              {c ? (
                <>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"><MapPin className="h-3.5 w-3.5" />{c.location}</p>
                  <p className="mt-2 text-xs text-gray-700 dark:text-gray-300">{c.coursesCount} courses listed</p>
                </>
              ) : (
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">This college is no longer listed.</p>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
