import Link from "next/link";
import { Calendar, Clock, FileText, CheckCircle, ChevronRight } from "lucide-react";
import { getNoticeById, getNotices } from "@/lib/services/admission";
import { NoticeCard } from "@/components/NoticeCard";
import { NoticeDownloadActions } from "@/components/NoticeDownloadActions";
import { PageHeading } from "@/components/gov/PageHeading";
import { noticeTypeColor, noticeTypeLabel, formatDate, daysUntil, isDatePassed } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusChip = {
  active: { label: "Open", cls: "bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-200" },
  upcoming: { label: "Upcoming", cls: "bg-saffron-100 text-saffron-700 dark:bg-saffron-700/30 dark:text-saffron-100" },
  expired: { label: "Closed", cls: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200" },
} as const;

const card = "rounded-md border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900";
const h2 = "mb-3 inline-block border-b-2 border-saffron-500 pb-1 font-serif text-lg font-bold text-indigo-900 dark:text-white";

function DateTable({ rows }: { rows: { label: string; date: string }[] }) {
  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map((d, i) => (
          <tr key={i} className="border-b border-gray-200 last:border-0 dark:border-gray-800">
            <th scope="row" className="py-2 pr-4 text-left font-normal text-gray-700 dark:text-gray-300">{d.label}</th>
            <td className="py-2 text-right font-semibold">{formatDate(d.date)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [notice, allNotices] = await Promise.all([getNoticeById(id), getNotices()]);

  if (!notice) {
    return (
      <div className="mx-auto max-w-md rounded-md border border-dashed border-gray-300 bg-white py-14 text-center dark:border-gray-700 dark:bg-gray-900">
        <FileText className="mx-auto mb-3 h-10 w-10 text-gray-400" />
        <h1 className="font-serif text-xl font-bold">Notice not found</h1>
        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">It may have been removed or the link is incorrect.</p>
        <Link href="/notices" className="mt-4 inline-block rounded-md bg-indigo-800 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-900">Back to notices</Link>
      </div>
    );
  }

  const related = allNotices.filter((n) => notice.relatedNoticeIds.includes(n.id));
  const days = notice.lastDate ? daysUntil(notice.lastDate) : null;
  const status = statusChip[notice.status as keyof typeof statusChip];
  const collegeName = notice.collegeShortName ?? notice.collegeId;

  return (
    <div className="max-w-5xl">
      <PageHeading
        title={notice.title}
        crumbs={[{ label: "Notices", href: "/notices" }, { label: noticeTypeLabel(notice.type) }]}
      />

      <div className="space-y-6">
        <section className={card}>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className={`rounded px-2 py-0.5 ${noticeTypeColor(notice.type)}`}>{noticeTypeLabel(notice.type)}</span>
            {status && <span className={`rounded px-2 py-0.5 ${status.cls}`}>{status.label}</span>}
            {notice.collegeId && (
              <Link href={`/colleges/${notice.collegeId}`} className="font-semibold text-indigo-800 underline dark:text-indigo-200">{collegeName}</Link>
            )}
          </div>

          <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-700 dark:text-indigo-300" />
              <dt className="text-gray-700 dark:text-gray-300">Published</dt>
              <dd className="font-semibold">{formatDate(notice.publishedDate)}</dd>
            </div>
            {notice.lastDate && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-saffron-600" />
                <dt className="text-gray-700 dark:text-gray-300">{isDatePassed(notice.lastDate) ? "Last date (passed)" : "Last date"}</dt>
                <dd className="font-semibold">
                  {formatDate(notice.lastDate)}
                  {days !== null && days > 0 && <span className="ml-1 font-medium text-saffron-700 dark:text-saffron-400">({days} {days === 1 ? "day" : "days"} left)</span>}
                </dd>
              </div>
            )}
          </dl>

          {notice.summary && <p className="mt-5 max-w-prose leading-relaxed text-gray-800 dark:text-gray-200">{notice.summary}</p>}

          {notice.highlights.length > 0 && (
            <div className="mt-5 rounded-md border-l-4 border-indigo-800 bg-indigo-50 p-4 dark:bg-indigo-950/40">
              <h2 className="mb-2 font-serif text-base font-bold text-indigo-900 dark:text-indigo-100">Key points</h2>
              <ul className="space-y-1.5">
                {notice.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-900 dark:text-gray-100">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-gov-green-600" /><span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3"><NoticeDownloadActions notice={notice} /></div>
          <p className="mt-4 text-xs text-gray-600 dark:text-gray-400">
            This page summarises the official notice. Dates and conditions can change, so always confirm them in the official document before you act.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          {notice.importantDates.length > 0 && (
            <section className={card}><h2 className={h2}>Important dates</h2><DateTable rows={notice.importantDates} /></section>
          )}
          <section className={card}>
            <h2 className={h2}>Deadlines</h2>
            {notice.deadlines.length > 0 ? <DateTable rows={notice.deadlines} /> : <p className="text-sm text-gray-700 dark:text-gray-300">No deadlines are listed in this notice.</p>}
          </section>

          {notice.eligibility && (
            <section className={card}><h2 className={h2}>Eligibility</h2><p className="text-sm text-gray-800 dark:text-gray-200">{notice.eligibility}</p></section>
          )}
          {notice.documentsRequired.length > 0 && (
            <section className={card}>
              <h2 className={h2}>Documents required</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-gray-800 dark:text-gray-200">
                {notice.documentsRequired.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </section>
          )}
          {notice.coursesAffected.length > 0 && (
            <section className={card}>
              <h2 className={h2}>Courses covered</h2>
              <ul className="flex flex-wrap gap-2">{notice.coursesAffected.map((c) => <li key={c} className="rounded bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100">{c}</li>)}</ul>
            </section>
          )}
          {notice.branchesAffected.length > 0 && (
            <section className={card}>
              <h2 className={h2}>Branches covered</h2>
              <ul className="flex flex-wrap gap-2">{notice.branchesAffected.map((b) => <li key={b} className="rounded bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-900 dark:bg-indigo-900/40 dark:text-indigo-100">{b}</li>)}</ul>
            </section>
          )}
        </div>

        {notice.collegeId && (
          <Link href={`/colleges/${notice.collegeId}`} className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-800 hover:underline dark:text-indigo-200">
            View the {collegeName} college profile <ChevronRight className="h-4 w-4" />
          </Link>
        )}

        {related.length > 0 && (
          <section>
            <h2 className={h2}>Related notices</h2>
            <div className="grid gap-4 lg:grid-cols-2">{related.map((n) => <NoticeCard key={n.id} notice={n} />)}</div>
          </section>
        )}
      </div>
    </div>
  );
}
