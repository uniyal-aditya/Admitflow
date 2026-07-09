"use client";

import { useMemo, useState, useEffect } from "react";
import {
  BarChart3, Bell, CalendarDays, Download, GraduationCap,
  Megaphone, TrendingUp, AlertTriangle, Star, BookOpen,
} from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { notices } from "@/data/notices";
import { colleges } from "@/data/colleges";
import { getDownloads } from "@/lib/store";
import { noticeTypeLabel, getComputedStatus } from "@/lib/utils";

export default function AnalyticsPage() {
  const downloads = getDownloads();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const stats = useMemo(() => {
    const active = notices.filter((n) => getComputedStatus(n) === "active");
    const thisWeek = notices.filter((n) => {
      const d = new Date(n.publishedDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    });
    const spotRounds = notices.filter((n) => n.type === "spot_round");
    const vacantSeats = notices.filter((n) => n.type === "vacant_seat");

    const collegeNoticeCounts = colleges.map((c) => ({
      name: c.shortName,
      count: notices.filter((n) => n.collegeId === c.id).length,
    }));
    collegeNoticeCounts.sort((a, b) => b.count - a.count);
    const mostActive = collegeNoticeCounts[0];

    return {
      totalNotices: notices.length,
      activeNotices: active.length,
      noticesThisWeek: thisWeek.length,
      mostActiveCollege: mostActive?.name ?? "-",
      mostActiveCount: mostActive?.count ?? 0,
      upcomingDeadlines: notices.filter((n) => n.lastDate && new Date(n.lastDate) > new Date()).length,
      spotRoundsConducted: spotRounds.length,
      vacantSeatNotices: vacantSeats.length,
      downloadCount: downloads.length,
      totalColleges: colleges.length,
    };
  }, [downloads]);

  const typeDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    notices.forEach((n) => {
      map[n.type] = (map[n.type] || 0) + 1;
    });
    return Object.entries(map)
      .map(([type, count]) => ({ type, count, label: noticeTypeLabel(type) }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const collegeDistribution = useMemo(() => {
    return colleges
      .map((c) => ({
        name: c.shortName,
        count: notices.filter((n) => n.collegeId === c.id).length,
      }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const maxTypeCount = Math.max(...typeDistribution.map((t) => t.count), 1);
  const maxCollegeCount = Math.max(...collegeDistribution.map((c) => c.count), 1);

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Admission statistics and insights at a glance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Notices" value={stats.totalNotices} icon={<Megaphone className="h-5 w-5" />} description="All time" />
        <StatsCard title="Active Notices" value={stats.activeNotices} icon={<Bell className="h-5 w-5" />} trend={{ value: 12, positive: true }} />
        <StatsCard title="This Week" value={stats.noticesThisWeek} icon={<TrendingUp className="h-5 w-5" />} description="New notices" />
        <StatsCard title="Downloads" value={stats.downloadCount} icon={<Download className="h-5 w-5" />} />
        <StatsCard title="Colleges" value={stats.totalColleges} icon={<GraduationCap className="h-5 w-5" />} description="Supported" />
        <StatsCard title="Upcoming Deadlines" value={stats.upcomingDeadlines} icon={<CalendarDays className="h-5 w-5" />} trend={{ value: 3, positive: true }} />
        <StatsCard title="Spot Rounds" value={stats.spotRoundsConducted} icon={<AlertTriangle className="h-5 w-5" />} />
        <StatsCard title="Vacant Seat Notices" value={stats.vacantSeatNotices} icon={<Star className="h-5 w-5" />} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Notices by Type
          </h2>
          <div className="space-y-3">
            {typeDistribution.map((item) => (
              <div key={item.type} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-2 rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${(item.count / maxTypeCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Notices by College
          </h2>
          <div className="space-y-3">
            {collegeDistribution.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-2 rounded-full bg-purple-500 transition-all"
                    style={{ width: `${(item.count / maxCollegeCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <h2 className="font-semibold mb-2 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Most Active College
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
            {stats.mostActiveCollege.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-lg">{stats.mostActiveCollege}</p>
            <p className="text-sm text-gray-500">{stats.mostActiveCount} notices published</p>
          </div>
        </div>
      </div>
    </div>
  );
}

