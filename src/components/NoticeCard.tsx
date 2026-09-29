"use client";

import Link from "next/link";
import { Download, ExternalLink, Calendar, Clock } from "lucide-react";
import { Notice } from "@/types";
import { noticeTypeColor, noticeTypeLabel, formatDate, getCollegeShortName, daysUntil, getComputedStatus, getNoticeSourceUrl } from "@/lib/utils";

export function NoticeCard({
  notice,
  collegeNames,
}: {
  notice: Notice;
  /** Service-resolved id→shortName map (preferred). Falls back to legacy static data. */
  collegeNames?: Record<string, string>;
}) {
  const computedStatus = getComputedStatus(notice);
  const collegeName =
    notice.collegeShortName ?? collegeNames?.[notice.collegeId] ?? getCollegeShortName(notice.collegeId);
  const days = notice.lastDate ? daysUntil(notice.lastDate) : null;

  return (
    <div className="group rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${noticeTypeColor(notice.type)}`}>
              {noticeTypeLabel(notice.type)}
            </span>
            <span className="text-xs text-gray-400">via {collegeName}</span>
          </div>
          <Link
            href={`/notices/${notice.id}`}
            className="font-semibold text-base hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2"
          >
            {notice.title}
          </Link>
        </div>
        {computedStatus === "active" && (
          <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950/50 dark:text-green-300">
            Active
          </span>
        )}
      </div>

      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
        {notice.summary}
      </p>

      {notice.highlights.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {notice.highlights.slice(0, 3).map((h, i) => (
            <span
              key={i}
              className="rounded-md bg-gray-50 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            >
              {h}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(notice.publishedDate)}
          </span>
          {days !== null && days > 0 && (
            <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
              <Clock className="h-3 w-3" />
              {days} days left
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/notices/${notice.id}`}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-gray-800"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
          <a
            href={getNoticeSourceUrl(notice)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-gray-800"
          >
            <Download className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
