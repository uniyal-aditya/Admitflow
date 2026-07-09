"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays, ChevronLeft, ChevronRight, Bell,
  ArrowRight,
} from "lucide-react";
import { notices } from "@/data/notices";
import { formatDate, getCollegeShortName, noticeTypeColor, noticeTypeLabel } from "@/lib/utils";
import { Notice } from "@/types";

interface CalendarEvent { date: string; notice: Notice; label?: string }

function getEvents(): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  notices.forEach((n) => {
    events.push({ date: n.publishedDate, notice: n });
    if (n.lastDate) events.push({ date: n.lastDate, notice: n });
    n.importantDates.forEach((d) => {
      events.push({ date: d.date, notice: n, label: d.label });
    });
    n.deadlines.forEach((d) => {
      events.push({ date: d.date, notice: n, label: d.label });
    });
  });
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const events = useMemo(() => getEvents(), []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const monthEvents = useMemo(() => {
    return events.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
    });
  }, [events, viewMonth, viewYear]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => new Date(e.date) >= now)
      .slice(0, 10);
  }, [events]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else { setViewMonth(viewMonth - 1); }
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else { setViewMonth(viewMonth + 1); }
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return monthEvents.filter((e) => e.date.startsWith(dateStr));
  };

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
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold">
                {MONTHS[viewMonth]} {viewYear}
              </h2>
              <button
                onClick={nextMonth}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">
                  {d}
                </div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[80px] p-1" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const isToday =
                  day === today.getDate() &&
                  viewMonth === today.getMonth() &&
                  viewYear === today.getFullYear();

                return (
                  <div
                    key={day}
                    className={`min-h-[80px] rounded-lg border p-1 transition-colors ${
                      isToday
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-400"
                        : "border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    }`}
                  >
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        isToday
                          ? "bg-indigo-600 text-white font-bold"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 2).map((e, idx) => (
                        <Link
                          key={idx}
                          href={`/notices/${e.notice.id}`}
                          className="block truncate rounded px-1 py-0.5 text-[10px] font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300"
                        >
                          {e.notice.title.slice(0, 20)}
                        </Link>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="block px-1 text-[10px] text-gray-400">
                          +{dayEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
                        {MONTHS[new Date(e.date).getMonth()].slice(0, 3)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium line-clamp-1">{e.notice.title}</p>
                      <p className="text-[11px] text-gray-400">
                        {getCollegeShortName(e.notice.collegeId)}
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
