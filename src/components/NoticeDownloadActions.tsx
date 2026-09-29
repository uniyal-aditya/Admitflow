"use client";

import { Download, ExternalLink } from "lucide-react";
import { getNoticeSourceUrl } from "@/lib/utils";
import { addDownload } from "@/lib/store";
import { Notice } from "@/types";

// Client island for notice actions that touch localStorage (download
// tracking) or window.open. The rest of the notice detail page is a server
// component.

export function NoticeDownloadActions({ notice }: { notice: Notice }) {
  const trackDownload = () => {
    // Local record is immediate; the DB record syncs for signed-in users
    // (fire-and-forget — a failure must not block the download).
    addDownload({
      id: `${Date.now()}`,
      noticeId: notice.id,
      noticeTitle: notice.title,
      collegeName: notice.collegeShortName ?? notice.collegeId,
      downloadedAt: new Date().toISOString(),
    });
    fetch("/api/user/downloads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        noticeId: notice.id,
        noticeTitle: notice.title,
        collegeName: notice.collegeShortName ?? notice.collegeId,
      }),
    }).catch(() => {});
  };

  const handleDownloadSummary = () => {
    trackDownload();

    const content = [
      `${notice.title}`,
      `College: ${notice.collegeShortName ?? notice.collegeId}`,
      `Published: ${notice.publishedDate}`,
      notice.lastDate ? `Last Date: ${notice.lastDate}` : "",
      "",
      notice.summary,
      "",
      "",
      "Important Dates:",
      ...notice.importantDates.map((d) => `  ${d.label}: ${d.date}`),
      "",
      "Deadlines:",
      ...notice.deadlines.map((d) => `  ${d.label}: ${d.date}`),
      "",
      `Eligibility: ${notice.eligibility}`,
      "",
      "Documents Required:",
      ...notice.documentsRequired.map((d) => `  - ${d}`),
      `\nSource: ${notice.sourceUrl}`,
    ]
      .filter(Boolean)
      .join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${notice.id}-summary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <a
        href={getNoticeSourceUrl(notice)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
      >
        <Download className="h-4 w-4" />
        Official Notice
      </a>
      <button
        onClick={handleDownloadSummary}
        className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
      >
        <Download className="h-4 w-4" />
        Download Summary
      </button>
      <a
        href={getNoticeSourceUrl(notice)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
      >
        <ExternalLink className="h-4 w-4" />
        College Website
      </a>
    </>
  );
}
