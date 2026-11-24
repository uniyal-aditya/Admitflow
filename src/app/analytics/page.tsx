import { Bell, CalendarDays, GraduationCap, Megaphone, TrendingUp, AlertTriangle, Star } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { PageHeading } from "@/components/gov/PageHeading";
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

  const card = "rounded-md border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900";
  const h2 = "mb-4 inline-block border-b-2 border-saffron-500 pb-1 font-serif text-lg font-bold text-indigo-900 dark:text-white";

  const Bars = ({ rows, max }: { rows: { key: string; label: string; count: number }[]; max: number }) => (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-gray-800 dark:text-gray-200">{r.label}</span>
            <span className="font-semibold">{r.count}</span>
          </div>
          <div className="h-2.5 rounded bg-gray-200 dark:bg-gray-800" aria-hidden>
            <div className="h-2.5 rounded bg-indigo-700 dark:bg-indigo-400" style={{ width: `${(r.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      <PageHeading
        title="Analytics"
        crumbs={[{ label: "Analytics" }]}
        description="Counts of notices and deadlines across the colleges listed on AdmitFlow."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total notices" value={notices.length} icon={<Megaphone className="h-5 w-5" />} description="All time" />
        <StatsCard title="Open notices" value={active.length} icon={<Bell className="h-5 w-5" />} />
        <StatsCard title="This week" value={thisWeek.length} icon={<TrendingUp className="h-5 w-5" />} description="New notices" />
        <StatsCard title="Colleges" value={colleges.length} icon={<GraduationCap className="h-5 w-5" />} description="Listed" />
        <StatsCard title="Upcoming deadlines" value={notices.filter((n) => n.lastDate && new Date(n.lastDate) > now).length} icon={<CalendarDays className="h-5 w-5" />} />
        <StatsCard title="Spot round notices" value={notices.filter((n) => n.type === "spot_round").length} icon={<AlertTriangle className="h-5 w-5" />} />
        <StatsCard title="Vacant seat notices" value={notices.filter((n) => n.type === "vacant_seat").length} icon={<Star className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className={card}>
          <h2 className={h2}>Notices by type</h2>
          {typeDistribution.length === 0 ? <p className="text-sm text-gray-700 dark:text-gray-300">No notices to chart yet.</p> : (
            <Bars rows={typeDistribution.map((t) => ({ key: t.type, label: t.label, count: t.count }))} max={maxTypeCount} />
          )}
        </section>

        <section className={card}>
          <h2 className={h2}>Notices by college</h2>
          {collegeNoticeCounts.every((c) => c.count === 0) ? <p className="text-sm text-gray-700 dark:text-gray-300">No notices to chart yet.</p> : (
            <Bars rows={collegeNoticeCounts.filter((c) => c.count > 0).slice(0, 12).map((c) => ({ key: c.name, label: c.name, count: c.count }))} max={maxCollegeCount} />
          )}
          <p className="mt-4 text-xs text-gray-700 dark:text-gray-300">Only colleges with at least one published notice are shown.</p>
        </section>
      </div>

      <section className={`${card} mt-6`}>
        <h2 className={h2}>College with the most notices</h2>
        {mostActive && mostActive.count > 0 ? (
          <p className="text-gray-800 dark:text-gray-200"><span className="font-serif text-xl font-semibold text-indigo-900 dark:text-white">{mostActive.name}</span> has published {mostActive.count} notices.</p>
        ) : (
          <p className="text-gray-700 dark:text-gray-300">No notices have been published yet.</p>
        )}
      </section>
    </div>
  );
}
