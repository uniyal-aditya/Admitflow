"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell, BookOpen, CalendarDays, Clock, Download,
  GraduationCap, Megaphone, Star, TrendingUp, AlertTriangle,
  ArrowRight, Sparkles,
} from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { CollegeLogo } from "@/components/CollegeLogo";
import { NoticeCard } from "@/components/NoticeCard";
import { CollegeCard } from "@/components/CollegeCard";
import { SearchBar } from "@/components/SearchBar";
import { colleges } from "@/data/colleges";
import { getActiveNotices, getUpcomingDeadlines, getRecentNotices } from "@/data/notices";
import { getFavorites, getDownloads, getNotifications } from "@/lib/store";
import { formatDate, daysUntil, getCollegeName } from "@/lib/utils";

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
} as const;

const fadeSlide = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
} as const;

export default function DashboardPage() {
  const [favorites] = useState(getFavorites());
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetch("/api/notifications/check", { method: "POST" }).catch(() => {});
  }, []);

  const activeNotices = getActiveNotices();
  const upcomingDeadlines = getUpcomingDeadlines();
  const recentNotices = getRecentNotices(7);
  const favColleges = favorites.map((id) => colleges.find((c) => c.id === id)).filter(Boolean) as typeof colleges;
  const downloads = getDownloads();
  const notifications = getNotifications().slice(0, 5);

  if (!mounted) return null;

  const stats = [
    {
      title: "Active Notices", value: activeNotices.length,
      icon: <Megaphone className="h-5 w-5" />,
      description: "Across all colleges",
    },
    {
      title: "Upcoming Deadlines", value: upcomingDeadlines.length,
      icon: <Clock className="h-5 w-5" />,
      trend: { value: 3, positive: true },
    },
    {
      title: "New This Week", value: recentNotices.length,
      icon: <TrendingUp className="h-5 w-5" />,
      description: "New notices in 7 days",
    },
    {
      title: "Downloads", value: downloads.length,
      icon: <Download className="h-5 w-5" />,
      description: "Total downloads",
    },
  ];

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-8">
      <motion.div variants={fadeSlide}>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back! Here&apos;s what&apos;s happening with Uttarakhand college admissions.
        </p>
      </motion.div>

      <motion.div variants={fadeSlide} className="max-w-xl">
        <SearchBar />
      </motion.div>

      <motion.div variants={fadeSlide} className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}>
            <StatsCard {...s} />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={fadeSlide} className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Latest Notices
            </h2>
            <Link
              href="/notices"
              className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {activeNotices.slice(0, 5).map((notice, i) => (
              <motion.div key={notice.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                <NoticeCard notice={notice} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeSlide} className="space-y-6">
          {favorites.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                Your Watchlist
              </h2>
              <div className="space-y-2">
                {favColleges.slice(0, 3).map((c) => (
                  <Link
                    key={c.id}
                    href={`/colleges/${c.id}`}
                    className="flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm hover:shadow-md dark:bg-gray-900 dark:border-gray-800 transition-all"
                  >
                    <CollegeLogo collegeId={c.id} name={c.shortName} size="sm" />
                    <div>
                      <p className="text-sm font-medium">{c.shortName}</p>
                      <p className="text-xs text-gray-400">{c.location}</p>
                    </div>
                  </Link>
                ))}
                {favColleges.length > 3 && (
                  <Link
                    href="/watchlist"
                    className="block text-center text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 pt-1"
                  >
                    +{favColleges.length - 3} more
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-orange-500" />
              Upcoming Deadlines
            </h2>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-gray-400">No upcoming deadlines</p>
            ) : (
              <div className="space-y-2">
                {upcomingDeadlines.slice(0, 4).map((n) => (
                  <Link
                    key={n.id}
                    href={`/notices/${n.id}`}
                    className="flex items-start gap-3 rounded-xl border bg-white p-3 shadow-sm hover:shadow-md dark:bg-gray-900 dark:border-gray-800 transition-all"
                  >
                    <AlertTriangle className="h-5 w-5 shrink-0 text-orange-500 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{n.title}</p>
                      <p className="text-xs text-gray-400">
                        {getCollegeName(n.collegeId)} &middot; {n.lastDate ? daysUntil(n.lastDate) : "?"} days left
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-500" />
              Recent Alerts
            </h2>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400">No new notifications</p>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
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
        </motion.div>
      </div>
    </motion.div>
  );
}
