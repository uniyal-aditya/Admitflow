"use client";

import Link from "next/link";
import { ExternalLink, Clock } from "lucide-react";
import { Notice } from "@/types";
import { noticeTypeColor, noticeTypeLabel, formatDate, getCollegeShortName, daysUntil, getComputedStatus, getNoticeSourceUrl } from "@/lib/utils";

const statusStyle: Record<string, { label: string; cls: string }> = {
  active: { label: "Open", cls: "bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-200" },
  upcoming: { label: "Upcoming", cls: "bg-saffron-100 text-saffron-700 dark:bg-saffron-700/30 dark:text-saffron-100" },
  expired: { label: "Closed", cls: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200" },
};

export function NoticeCard({
  notice,
  collegeNames,
}: {
  notice: Notice;
  /** Service-resolved id→shortName map (preferred). Falls back to legacy static data. */
  collegeNames?: Record<string, string>;
}) {
  const status = statusStyle[getComputedStatus(notice)];
  const collegeName = notice.collegeShortName ?? collegeNames?.[notice.collegeId] ?? getCollegeShortName(notice.collegeId);
  const days = notice.lastDate ? daysUntil(notice.lastDate) : null;
  const pub = new Date(notice.publishedDate);
  const hasDate = !Number.isNaN(pub.getTime());

  return (
    <article className="flex h-full gap-4 rounded-md border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      {hasDate && (
        <time dateTime={pub.toISOString()} className="hidden h-16 w-14 shrink-0 flex-col items-center justify-center rounded bg-indigo-800 text-white sm:flex" aria-label={formatDate(notice.publishedDate)}>
          <span className="font-serif text-2xl font-bold leading-none">{pub.getDate()}</span>
          <span className="mt-1 text-xs">{pub.toLocaleString("en-IN", { month: "short" })} {String(pub.getFullYear()).slice(2)}</span>
        </time>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className={`rounded px-2 py-0.5 ${noticeTypeColor(notice.type)}`}>{noticeTypeLabel(notice.type)}</span>
          {status && <span className={`rounded px-2 py-0.5 ${status.cls}`}>{status.label}</span>}
          <span className="text-gray-600 dark:text-gray-400">{collegeName}</span>
        </div>
        <h3 className="font-serif text-base font-semibold leading-snug">
          <Link href={`/notices/${notice.id}`} className="text-indigo-900 hover:underline dark:text-white">{notice.title}</Link>
        </h3>
        {notice.summary && <p className="mt-1.5 line-clamp-2 text-sm text-gray-700 dark:text-gray-300">{notice.summary}</p>}
        {notice.highlights.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {notice.highlights.slice(0, 3).map((h, i) => (
              <li key={i} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200">{h}</li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 text-sm">
          {days !== null && days > 0 && (
            <span className="inline-flex items-center gap-1 font-medium text-saffron-700 dark:text-saffron-400"><Clock className="h-3.5 w-3.5" />{days} {days === 1 ? "day" : "days"} left</span>
          )}
          <Link href={`/notices/${notice.id}`} className="font-semibold text-indigo-800 hover:underline dark:text-indigo-200">Read details</Link>
          <a href={getNoticeSourceUrl(notice)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gray-700 hover:underline dark:text-gray-300">
            Official notice <ExternalLink className="h-3.5 w-3.5" /><span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>
    </article>
  );
}
