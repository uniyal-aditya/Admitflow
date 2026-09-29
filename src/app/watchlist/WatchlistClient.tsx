"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Heart, Bell, ArrowRight, BookOpen } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { NoticeCard } from "@/components/NoticeCard";
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

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500 fill-current" />
            Your Watchlist
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Your favourite colleges with priority updates
          </p>
        </div>
        {favorites.length > 0 && (
          <Link
            href="/colleges"
            className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Browse Colleges
          </Link>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Heart className="h-16 w-16 mb-4" />
          <p className="text-xl font-medium">Your watchlist is empty</p>
          <p className="text-sm mt-2">Add colleges to your watchlist to get priority updates</p>
          <Link
            href="/colleges"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Browse Colleges
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          <FavoriteCollegeGrid favorites={favorites} />

          {favDeadlines.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-500" />
                Upcoming Deadlines from Watchlist
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {favDeadlines.map((n) => (
                  <NoticeCard key={n.id} notice={n} collegeNames={collegeNames} />
                ))}
              </div>
            </div>
          )}

          {favNotices.length > favDeadlines.length && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Notices from Watchlist</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {favNotices.slice(0, 6).map((n) => (
                  <NoticeCard key={n.id} notice={n} collegeNames={collegeNames} />
                ))}
              </div>
            </div>
          )}

          {notifications.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Notification History</h2>
                <button
                  onClick={() => void handleMarkAllRead()}
                  className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Mark all as read
                </button>
              </div>
              <div className="space-y-2">
                {notifications.slice(0, 10).map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 rounded-xl border bg-white p-4 dark:bg-gray-900 dark:border-gray-800 ${
                      !n.read ? "border-l-4 border-l-indigo-500" : ""
                    }`}
                  >
                    <Bell className="h-5 w-5 shrink-0 text-indigo-500 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{n.collegeName} &middot; {formatDate(n.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Favorite college cards; names resolve from the shared static dataset client-side. */
function FavoriteCollegeGrid({ favorites }: { favorites: string[] }) {
  const [colleges, setColleges] = useState<{ id: string; shortName: string; location: string; website: string; type: string; ownership: string; coursesCount: number }[]>([]);

  useEffect(() => {
    import("@/data/colleges").then(({ colleges }) => {
      setColleges(
        favorites
          .map((id) => colleges.find((c) => c.id === id))
          .filter(Boolean)
          .map((c) => ({
            id: c!.id,
            shortName: c!.shortName,
            location: c!.location,
            website: c!.website,
            type: c!.type,
            ownership: c!.ownership,
            coursesCount: c!.courses.length,
          }))
      );
    });
  }, [favorites]);

  if (colleges.length === 0) return null;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {colleges.map((c) => (
        <a
          key={c.id}
          href={`/colleges/${c.id}`}
          className="rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md dark:bg-gray-900 dark:border-gray-800"
        >
          <p className="font-semibold">{c.shortName}</p>
          <p className="text-xs text-gray-400 mt-1">{c.location}</p>
          <p className="text-xs text-gray-400 mt-2">{c.coursesCount} courses</p>
        </a>
      ))}
    </div>
  );
}
