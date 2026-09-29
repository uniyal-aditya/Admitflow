import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarDays, Clock,
  Megaphone, TrendingUp, AlertTriangle,
  ArrowRight, Sparkles,
} from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { NoticeCard } from "@/components/NoticeCard";
import { SearchBar } from "@/components/SearchBar";
import { getNotices, getCollegeShortNames } from "@/lib/services/admission";
import { DashboardPersonalWatchlist, DashboardPersonalAlerts, DownloadsStat } from "./DashboardPersonal";
import { daysUntil } from "@/lib/utils";

export const dynamic = "force-dynamic";

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
} as const;

const fadeSlide = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
} as const;

export default async function DashboardPage() {
  const [notices, collegeNames] = await Promise.all([getNotices(), getCollegeShortNames()]);

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const activeNotices = notices.filter((n) => n.status === "active");
  const upcomingDeadlines = notices
    .filter((n) => n.lastDate && new Date(n.lastDate) > now)
    .sort((a, b) => new Date(a.lastDate!).getTime() - new Date(b.lastDate!).getTime());
  const recentNotices = notices.filter((n) => n.publishedDate && new Date(n.publishedDate) >= weekAgo);
  const latestNotices = activeNotices.length > 0 ? activeNotices : notices;

  const stats = [
    {
      title: "Active Notices", value: activeNotices.length,
      icon: <Megaphone className="h-5 w-5" />,
      description: "Across all colleges",
    },
    {
      title: "Upcoming Deadlines", value: upcomingDeadlines.length,
      icon: <Clock className="h-5 w-5" />,
    },
    {
      title: "New This Week", value: recentNotices.length,
      icon: <TrendingUp className="h-5 w-5" />,
      description: "New notices in 7 days",
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

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}>
            <StatsCard {...s} />
          </motion.div>
        ))}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
          <DownloadsStat />
        </motion.div>
      </div>

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
            {latestNotices.slice(0, 5).map((notice, i) => (
              <motion.div key={notice.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                <NoticeCard notice={notice} collegeNames={collegeNames} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeSlide} className="space-y-6">
          <DashboardPersonalWatchlist />

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
                        {n.collegeShortName ?? collegeNames[n.collegeId] ?? n.collegeId} &middot;{" "}
                        {daysUntil(n.lastDate!)} days left
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <DashboardPersonalAlerts />
        </motion.div>
      </div>
    </motion.div>
  );
}
