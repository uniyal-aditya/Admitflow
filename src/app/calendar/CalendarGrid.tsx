"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Notice } from "@/types";

interface CalendarEvent { date: string; notice: Notice; label?: string }

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGrid({ events }: { events: CalendarEvent[] }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const monthEvents = useMemo(() => {
    return events.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
    });
  }, [events, viewMonth, viewYear]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

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
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold">
          {MONTHS[viewMonth]} {viewYear}
        </h2>
        <button
          onClick={nextMonth}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Next month"
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
  );
}
