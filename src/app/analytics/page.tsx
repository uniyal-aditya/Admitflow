import {
  BarChart3, Bell, CalendarDays, Download, GraduationCap,
  Megaphone, TrendingUp, AlertTriangle, Star, BookOpen,
} from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { getNotices, getColleges } from "@/lib/services/admission";
import { noticeTypeLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [notices, colleges] = await Promise.all([getNotices(), getColleges()]);

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const active = notices.filter((n) => n.status === "active");
  const thisWeek = notices.filter((n) => n.publishedDate && new Date(n.publishedDate) >= weekAgo);

  const collegeNoticeCounts = colleges
    .map((c) => ({
      name: c.shortName,
      count: notices.filter((n) => n.collegeId === c.id).length,
    }))
    .sort((a, b) => b.count - a.count);
  const mostActive = collegeNoticeCounts[0];

  const typeDistribution = Object.entries(
    notices.reduce<Record<string, number>>((map, n) => {
      map[n.type] = (map[n.type] ?? 0) + 1;
      return map;
    }, {})
  )
    .map(([type, count]) => ({ type, count, label: noticeTypeLabel(type) }))
    .sort((a, b) => b.count - a.count);

  const maxTypeCount = Math.max(...typeDistribution.map((t) => t.count), 1);
  const maxCollegeCount = Math.max(...collegeNoticeCounts.map((c) => c.count), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Admission statistics and insights at a glance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Notices" value={notices.length} icon={<Megaphone className="h-5 w-5" />} description="All time" />
        <StatsCard title="Active Notices" value={active.length} icon={<Bell className="h-5 w-5" />} />
        <StatsCard title="This Week" value={thisWeek.length} icon={<TrendingUp className="h-5 w-5" />} description="New notices" />
        <StatsCard title="Colleges" value={colleges.length} icon={<GraduationCap className="h-5 w-5" />} description="Supported" />
        <StatsCard title="Upcoming Deadlines" value={notices.filter((n) => n.lastDate && new Date(n.lastDate) > now).length} icon={<CalendarDays className="h-5 w-5" />} />
        <StatsCard title="Spot Rounds" value={notices.filter((n) => n.type === "spot_round").length} icon={<AlertTriangle className="h-5 w-5" />} />
        <StatsCard title="Vacant Seat Notices" value={notices.filter((n) => n.type === "vacant_seat").length} icon={<Star className="h-5 w-5" />} />
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
            {collegeNoticeCounts.slice(0, 12).map((item) => (
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
            {mostActive?.name.charAt(0) ?? "-"}
          </div>
          <div>
            <p className="font-semibold text-lg">{mostActive?.name ?? "-"}</p>
            <p className="text-sm text-gray-500">{mostActive?.count ?? 0} notices published</p>
          </div>
        </div>
      </div>
    </div>
  );
}
