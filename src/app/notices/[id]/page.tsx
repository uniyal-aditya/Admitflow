import Link from "next/link";
import {
  ArrowLeft, Calendar, Clock,
  FileText, CheckCircle, AlertTriangle, Info, BookOpen,
  Users, GraduationCap, ChevronRight,
} from "lucide-react";
import { getNoticeById, getNotices } from "@/lib/services/admission";
import { NoticeCard } from "@/components/NoticeCard";
import { NoticeDownloadActions } from "@/components/NoticeDownloadActions";
import {
  noticeTypeColor, noticeTypeLabel, formatDate, daysUntil, isDatePassed,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [notice, allNotices] = await Promise.all([getNoticeById(id), getNotices()]);

  if (!notice) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <FileText className="h-16 w-16 mb-4" />
        <p className="text-xl font-medium">Notice not found</p>
        <Link href="/notices" className="mt-4 text-indigo-600 hover:underline">Back to notices</Link>
      </div>
    );
  }

  const related = allNotices.filter((n) => notice.relatedNoticeIds.includes(n.id));
  const days = notice.lastDate ? daysUntil(notice.lastDate) : null;
  const computedStatus = notice.status;
  const collegeId = notice.collegeId;
  const collegeShortName = notice.collegeShortName;

  return (
    <div className="space-y-8 max-w-4xl">
      <Link
        href="/notices"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Notices
      </Link>

      <div className="rounded-2xl border bg-white p-6 md:p-8 shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${noticeTypeColor(notice.type)}`}>
            {noticeTypeLabel(notice.type)}
          </span>
          <span className="text-sm text-gray-400">
            via{" "}
            <Link href={`/colleges/${collegeId}`} className="text-indigo-600 hover:underline dark:text-indigo-400">
              {collegeShortName ?? collegeId}
            </Link>
          </span>
          {computedStatus === "active" ? (
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950/50 dark:text-green-300">
              <CheckCircle className="h-3 w-3" /> Active
            </span>
          ) : computedStatus === "expired" ? (
            <span className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-950/50 dark:text-red-300">
              <AlertTriangle className="h-3 w-3" /> Expired
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300">
              <Info className="h-3 w-3" /> Upcoming
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold">{notice.title}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Published: {formatDate(notice.publishedDate)}
          </span>
          {notice.lastDate && (
            <span className={`flex items-center gap-1.5 ${isDatePassed(notice.lastDate) ? "text-red-500" : "text-orange-600 dark:text-orange-400"}`}>
              <Clock className="h-4 w-4" />
              {isDatePassed(notice.lastDate) ? "Passed:" : "Deadline:"} {formatDate(notice.lastDate)}
              {days !== null && days > 0 && ` (${days} days left)`}
            </span>
          )}
        </div>

        <p className="mt-6 text-gray-600 dark:text-gray-300 leading-relaxed">
          {notice.summary}
        </p>

        {notice.highlights.length > 0 && (
          <div className="mt-6 rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/30">
            <h3 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-2">Key Highlights</h3>
            <ul className="space-y-1.5">
              {notice.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-indigo-600 dark:text-indigo-400">
                  <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <NoticeDownloadActions notice={notice} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
          <h3 className="font-semibold text-sm mb-3">Important Dates</h3>
          <div className="space-y-2">
            {notice.importantDates.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{d.label}</span>
                <span className="font-medium">{formatDate(d.date)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
          <h3 className="font-semibold text-sm mb-3">Deadlines</h3>
          <div className="space-y-2">
            {notice.deadlines.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{d.label}</span>
                <span className="font-medium">{formatDate(d.date)}</span>
              </div>
            ))}
            {notice.deadlines.length === 0 && (
              <p className="text-sm text-gray-400">No deadlines specified</p>
            )}
          </div>
        </div>

        {notice.documentsRequired.length > 0 && (
          <div className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" />
              Documents Required
            </h3>
            <ul className="space-y-1">
              {notice.documentsRequired.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gray-400" />
            Eligibility
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{notice.eligibility}</p>
        </div>

        {notice.coursesAffected.length > 0 && (
          <div className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-gray-400" />
              Courses Affected
            </h3>
            <div className="flex flex-wrap gap-2">
              {notice.coursesAffected.map((c) => (
                <span key={c} className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {notice.branchesAffected.length > 0 && (
          <div className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              Branches Affected
            </h3>
            <div className="flex flex-wrap gap-2">
              {notice.branchesAffected.map((b) => (
                <span key={b} className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {collegeId && (
        <div className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
          <h3 className="font-semibold text-sm mb-2">College Information</h3>
          <Link
            href={`/colleges/${collegeId}`}
            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            View {collegeShortName ?? collegeId} profile
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {related.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Related Notices</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {related.map((n) => (
              <NoticeCard key={n.id} notice={n} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
