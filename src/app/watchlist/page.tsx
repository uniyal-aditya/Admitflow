"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Heart, Bell, ArrowRight, BookOpen } from "lucide-react";
import { colleges } from "@/data/colleges";
import { getActiveNotices, getUpcomingDeadlines } from "@/data/notices";
import { getFavorites, getNotifications, markAllNotificationsRead } from "@/lib/store";
import { NoticeCard } from "@/components/NoticeCard";
import { CollegeCard } from "@/components/CollegeCard";
import { formatDate, getCollegeShortName } from "@/lib/utils";

export default function WatchlistPage() {
  const [favorites] = useState(getFavorites());
  const [notifications, setNotifications] = useState(getNotifications());
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const favColleges = favorites.map((id) => colleges.find((c) => c.id === id)).filter(Boolean) as typeof colleges;
  const favNotices = getActiveNotices().filter((n) => favorites.includes(n.collegeId));
  const favDeadlines = getUpcomingDeadlines().filter((n) => favorites.includes(n.collegeId));

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    setNotifications(getNotifications());
  };

  if (!mounted) return null;

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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favColleges.map((c) => (
              <CollegeCard key={c.id} college={c} />
            ))}
          </div>

          {favDeadlines.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-500" />
                Upcoming Deadlines from Watchlist
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {favDeadlines.map((n) => (
                  <NoticeCard key={n.id} notice={n} />
                ))}
              </div>
            </div>
          )}

          {favNotices.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Active Notices from Watchlist</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {favNotices.slice(0, 6).map((n) => (
                  <NoticeCard key={n.id} notice={n} />
                ))}
              </div>
            </div>
          )}

          {notifications.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Notification History</h2>
                <button
                  onClick={handleMarkAllRead}
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
