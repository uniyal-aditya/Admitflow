import Link from "next/link";
import { CalendarDays, Clock, Megaphone, TrendingUp, ArrowRight } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { NoticeCard } from "@/components/NoticeCard";
import { PageHeading } from "@/components/gov/PageHeading";
import { getNotices, getCollegeShortNames } from "@/lib/services/admission";
import { DashboardPersonalWatchlist, DashboardPersonalAlerts, DownloadsStat } from "./DashboardPersonal";
import { daysUntil } from "@/lib/utils";

export const dynamic = "force-dynamic";

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
    { title: "Open notices", value: activeNotices.length, icon: <Megaphone className="h-5 w-5" />, description: "Across all colleges" },
    { title: "Upcoming deadlines", value: upcomingDeadlines.length, icon: <Clock className="h-5 w-5" /> },
    { title: "New this week", value: recentNotices.length, icon: <TrendingUp className="h-5 w-5" />, description: "Published in the last 7 days" },
  ];

  const h2 = "mb-3 inline-block border-b-2 border-saffron-500 pb-1 text-xl font-bold text-indigo-900 dark:text-white";

  return (
    <div>
      <PageHeading
        title="Dashboard"
        crumbs={[{ label: "Dashboard" }]}
        description="A summary of notices and deadlines across Uttarakhand colleges, plus the colleges you follow."
      />

      <section aria-label="Summary" className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => <StatsCard key={s.title} {...s} />)}
        <DownloadsStat />
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <section aria-labelledby="latest" className="space-y-4 lg:col-span-2">
          <div className="flex items-end justify-between">
            <h2 id="latest" className={h2}>Latest notices</h2>
            <Link href="/notices" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-indigo-800 hover:underline dark:text-indigo-200">
              View all notices <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {latestNotices.length === 0 ? (
            <p className="rounded-md border border-dashed border-gray-300 bg-white p-6 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
              No notices have been published yet. Browse <Link href="/colleges" className="font-semibold text-indigo-800 underline dark:text-indigo-200">colleges</Link> to find official links.
            </p>
          ) : (
            <div className="space-y-3">
              {latestNotices.slice(0, 5).map((n) => <NoticeCard key={n.id} notice={n} collegeNames={collegeNames} />)}
            </div>
          )}
        </section>

        <div className="space-y-8">
          <DashboardPersonalWatchlist />

          <section aria-labelledby="deadlines">
            <h2 id="deadlines" className={h2}>Upcoming deadlines</h2>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-gray-700 dark:text-gray-300">No upcoming deadlines right now.</p>
            ) : (
              <ul className="space-y-2">
                {upcomingDeadlines.slice(0, 4).map((n) => (
                  <li key={n.id}>
                    <Link href={`/notices/${n.id}`} className="flex items-start gap-3 rounded-md border border-gray-200 border-l-4 border-l-saffron-500 bg-white p-3 hover:bg-indigo-50 dark:border-gray-800 dark:border-l-saffron-500 dark:bg-gray-900 dark:hover:bg-gray-800">
                      <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-saffron-600" />
                      <span className="min-w-0">
                        <span className="line-clamp-1 block text-sm font-semibold text-indigo-900 dark:text-white">{n.title}</span>
                        <span className="block text-xs text-gray-700 dark:text-gray-300">
                          {n.collegeShortName ?? collegeNames[n.collegeId] ?? n.collegeId}, {daysUntil(n.lastDate!)} days left
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <DashboardPersonalAlerts />
        </div>
      </div>
    </div>
  );
}
