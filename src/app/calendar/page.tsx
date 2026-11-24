import Link from "next/link";
import { getNotices, getCollegeShortNames } from "@/lib/services/admission";
import { CalendarGrid } from "./CalendarGrid";
import { PageHeading } from "@/components/gov/PageHeading";
import { Notice } from "@/types";

export const dynamic = "force-dynamic";

interface CalendarEvent { date: string; notice: Notice; label?: string }

export default async function CalendarPage() {
  const [notices, collegeNames] = await Promise.all([getNotices(), getCollegeShortNames()]);

  const events: CalendarEvent[] = [];
  notices.forEach((n) => {
    if (n.publishedDate) events.push({ date: n.publishedDate, notice: n, label: "Notice published" });
    if (n.lastDate) events.push({ date: n.lastDate, notice: n, label: "Last date" });
    n.importantDates.forEach((d) => events.push({ date: d.date, notice: n, label: d.label }));
    n.deadlines.forEach((d) => events.push({ date: d.date, notice: n, label: d.label }));
  });
  events.sort((a, b) => a.date.localeCompare(b.date));

  // Upcoming = today or later, excluding "published" entries (those are history, not things to act on).
  const todayStr = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.label !== "Notice published" && e.date.slice(0, 10) >= todayStr).slice(0, 10);

  return (
    <div>
      <PageHeading
        title="Admission calendar"
        crumbs={[{ label: "Calendar" }]}
        description="Published notices, last dates and important dates in one calendar."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <CalendarGrid events={events} />

        <aside className="space-y-6">
          <section className="rounded-md border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 inline-block border-b-2 border-saffron-500 pb-1 font-serif text-lg font-bold text-indigo-900 dark:text-white">Coming up</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-gray-700 dark:text-gray-300">No upcoming dates have been published yet.</p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((e, i) => {
                  const d = new Date(e.date);
                  return (
                    <li key={i}>
                      <Link href={`/notices/${e.notice.id}`} className="flex items-start gap-3 rounded-md border border-gray-200 p-3 hover:bg-indigo-50 dark:border-gray-700 dark:hover:bg-gray-800">
                        <span className="flex h-12 w-11 shrink-0 flex-col items-center justify-center rounded bg-indigo-800 text-white">
                          <span className="font-serif text-lg font-bold leading-none">{d.getDate()}</span>
                          <span className="text-xs">{d.toLocaleString("en-IN", { month: "short" })}</span>
                        </span>
                        <span className="min-w-0">
                          <span className="line-clamp-2 block text-sm font-semibold text-indigo-900 dark:text-white">{e.notice.title}</span>
                          <span className="block text-xs text-gray-700 dark:text-gray-300">
                            {e.notice.collegeShortName ?? collegeNames[e.notice.collegeId] ?? e.notice.collegeId}
                            {e.label ? `, ${e.label}` : ""}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
