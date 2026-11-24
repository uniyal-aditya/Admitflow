"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Notice } from "@/types";

interface CalendarEvent { date: string; notice: Notice; label?: string }

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const pad = (n: number) => String(n).padStart(2, "0");

export function CalendarGrid({ events }: { events: CalendarEvent[] }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState<number | null>(null);

  // Dates are compared as "YYYY-MM-DD" text on both sides, so a notice dated the 1st
  // can never slip into the previous month because of the viewer's time zone.
  const monthPrefix = `${viewYear}-${pad(viewMonth + 1)}`;
  const monthEvents = useMemo(() => events.filter((e) => e.date.startsWith(monthPrefix)), [events, monthPrefix]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const shift = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewMonth(d.getMonth());
    setViewYear(d.getFullYear());
    setSelected(null);
  };

  const eventsFor = (day: number) => monthEvents.filter((e) => e.date.startsWith(`${monthPrefix}-${pad(day)}`));
  const selectedEvents = selected ? eventsFor(selected) : [];

  return (
    <section aria-label="Month calendar" className="rounded-md border border-gray-200 bg-white p-4 md:p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => shift(-1)} className="rounded-md border border-gray-300 p-2 text-indigo-900 hover:bg-indigo-50 dark:border-gray-700 dark:text-indigo-200 dark:hover:bg-gray-800" aria-label="Previous month">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="font-serif text-xl font-bold text-indigo-900 dark:text-white" aria-live="polite">{MONTHS[viewMonth]} {viewYear}</h2>
        <button onClick={() => shift(1)} className="rounded-md border border-gray-300 p-2 text-indigo-900 hover:bg-indigo-50 dark:border-gray-700 dark:text-indigo-200 dark:hover:bg-gray-800" aria-label="Next month">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded border border-gray-200 bg-gray-200 dark:border-gray-700 dark:bg-gray-700">
        {DAYS.map((d) => (
          <div key={d} className="bg-indigo-900 py-2 text-center text-xs font-semibold text-white">{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="min-h-14 bg-gray-50 md:min-h-24 dark:bg-gray-950" />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const list = eventsFor(day);
          const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
          const isSel = selected === day;
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelected(isSel ? null : day)}
              aria-pressed={isSel}
              aria-label={`${day} ${MONTHS[viewMonth]}${list.length ? `, ${list.length} event${list.length > 1 ? "s" : ""}` : ""}`}
              className={`min-h-14 p-1 text-left align-top md:min-h-24 ${isSel ? "bg-saffron-50 dark:bg-saffron-700/20" : "bg-white hover:bg-indigo-50 dark:bg-gray-900 dark:hover:bg-gray-800"}`}
            >
              <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm ${isToday ? "bg-indigo-800 font-bold text-white" : "text-gray-900 dark:text-gray-100"}`}>{day}</span>
              {list.length > 0 && (
                <>
                  <span className="mt-1 hidden truncate rounded bg-indigo-100 px-1 py-0.5 text-xs font-medium text-indigo-900 md:block dark:bg-indigo-900/50 dark:text-indigo-100">{list[0].notice.title}</span>
                  {list.length > 1 && <span className="hidden text-xs text-gray-700 md:block dark:text-gray-300">+{list.length - 1} more</span>}
                  <span className="mt-1 block h-2 w-2 rounded-full bg-saffron-500 md:hidden" aria-hidden />
                </>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4" aria-live="polite">
        {selected ? (
          <>
            <h3 className="font-serif text-lg font-semibold text-indigo-900 dark:text-white">{selected} {MONTHS[viewMonth]} {viewYear}</h3>
            {selectedEvents.length === 0 ? (
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">No events on this day.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {selectedEvents.map((e, i) => (
                  <li key={i}>
                    <Link href={`/notices/${e.notice.id}`} className="block rounded-md border border-gray-200 border-l-4 border-l-saffron-500 p-3 text-sm hover:bg-indigo-50 dark:border-gray-700 dark:border-l-saffron-500 dark:hover:bg-gray-800">
                      <span className="block font-semibold text-indigo-900 dark:text-white">{e.notice.title}</span>
                      {e.label && <span className="block text-gray-700 dark:text-gray-300">{e.label}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300">Select a date to see its events.</p>
        )}
      </div>
    </section>
  );
}
