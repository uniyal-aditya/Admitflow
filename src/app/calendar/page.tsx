import Link from "next/link";
import { CalendarDays, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { getNotices, getCollegeShortNames } from "@/lib/services/admission";
import { CalendarGrid } from "./CalendarGrid";
import { Notice } from "@/types";

export const dynamic = "force-dynamic";

interface CalendarEvent { date: string; notice: Notice; label?: string }

export default async function CalendarPage() {
  const [notices, collegeNames] = await Promise.all([
    getNotices(),
    getCollegeShortNames(),
  ]);

  const events: CalendarEvent[] = [];
  notices.forEach((n) => {
    if (n.publishedDate) events.push({ date: n.publishedDate, notice: n });
    if (n.lastDate) events.push({ date: n.lastDate, notice: n });
    n.importantDates.forEach((d) => events.push({ date: d.date, notice: n, label: d.label }));
    n.deadlines.forEach((d) => events.push({ date: d.date, notice: n, label: d.label }));
  });
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const now = new Date();
  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= now)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          Admission Calendar
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          All upcoming admission events, deadlines, and important dates
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CalendarGrid events={events} />
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-white p-5 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              Upcoming Events
            </h3>
            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-gray-400">No upcoming events</p>
              ) : (
                upcomingEvents.map((e, i) => (
                  <Link
                    key={i}
                    href={`/notices/${e.notice.id}`}
                    className="flex items-start gap-3 rounded-lg border bg-gray-50 p-3 hover:shadow-sm dark:bg-gray-800/50 dark:border-gray-700 transition-all"
                  >
                    <div className="flex flex-col items-center justify-center min-w-[36px]">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {new Date(e.date).getDate()}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(e.date).toLocaleString("en", { month: "short" })}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium line-clamp-1">{e.notice.title}</p>
                      <p className="text-[11px] text-gray-400">
                        {e.notice.collegeShortName ?? collegeNames[e.notice.collegeId] ?? e.notice.collegeId}
                        {e.label ? ` · ${e.label}` : ""}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <h3 className="font-semibold mb-2">Legend</h3>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-indigo-500" />
                <span>Event/Deadline</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-indigo-600" />
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
