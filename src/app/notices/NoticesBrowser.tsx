"use client";

import { useState, useMemo } from "react";
import { Search, FileText } from "lucide-react";
import { NoticeCard } from "@/components/NoticeCard";
import { PageHeading } from "@/components/gov/PageHeading";
import { NoticeType } from "@/types";
import { noticeTypeLabel } from "@/lib/utils";

const noticeTypes: NoticeType[] = [
  "admission", "registration", "counselling", "spot_round",
  "vacant_seat", "merit_list", "waiting_list", "fee_payment",
  "reporting", "extension", "general",
];

const PAGE_SIZE = 20;

export function NoticesBrowser({
  notices,
  collegeNames,
  colleges,
  initialCollege = "all",
}: {
  notices: import("@/types").Notice[];
  collegeNames: Record<string, string>;
  colleges: { id: string; shortName: string }[];
  initialCollege?: string;
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [collegeFilter, setCollegeFilter] = useState(initialCollege);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notices.filter((n) => {
      const matchesSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        n.coursesAffected.some((c) => c.toLowerCase().includes(q));
      return (
        matchesSearch &&
        (typeFilter === "all" || n.type === typeFilter) &&
        (statusFilter === "all" || n.status === statusFilter) &&
        (collegeFilter === "all" || n.collegeId === collegeFilter)
      );
    });
  }, [notices, search, typeFilter, statusFilter, collegeFilter]);

  const hasFilters = search || typeFilter !== "all" || statusFilter !== "all" || collegeFilter !== "all";
  const reset = () => { setSearch(""); setTypeFilter("all"); setStatusFilter("all"); setCollegeFilter("all"); setVisible(PAGE_SIZE); };

  const field = "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white";
  const label = "mb-1 block text-sm font-semibold text-indigo-900 dark:text-indigo-200";
  const onChange = (set: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { set(e.target.value); setVisible(PAGE_SIZE); };

  return (
    <div>
      <PageHeading
        title="Notice center"
        crumbs={[{ label: "Notices" }]}
        description="Admission notices from colleges across Uttarakhand. Open a notice for dates, documents and the link to the official source."
      />

      <form role="search" onSubmit={(e) => e.preventDefault()} className="mb-5 grid gap-4 rounded-md border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="sm:col-span-2 lg:col-span-4">
          <label htmlFor="notice-search" className={label}>Search notices</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input id="notice-search" type="search" value={search} onChange={onChange(setSearch)} placeholder="Title, summary or course" className={`${field} pl-9`} />
          </div>
        </div>
        <div>
          <label htmlFor="f-type" className={label}>Notice type</label>
          <select id="f-type" value={typeFilter} onChange={onChange(setTypeFilter)} className={field}>
            <option value="all">All types</option>
            {noticeTypes.map((t) => <option key={t} value={t}>{noticeTypeLabel(t)}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-status" className={label}>Status</label>
          <select id="f-status" value={statusFilter} onChange={onChange(setStatusFilter)} className={field}>
            <option value="all">All</option>
            <option value="active">Open</option>
            <option value="upcoming">Upcoming</option>
            <option value="expired">Closed</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="f-college" className={label}>College</label>
          <select id="f-college" value={collegeFilter} onChange={onChange(setCollegeFilter)} className={field}>
            <option value="all">All colleges</option>
            {colleges.map((c) => <option key={c.id} value={c.id}>{c.shortName}</option>)}
          </select>
        </div>
      </form>

      <div className="mb-4 flex items-center justify-between gap-3 text-sm text-gray-700 dark:text-gray-300">
        <p role="status" aria-live="polite"><strong>{filtered.length}</strong> notice{filtered.length !== 1 ? "s" : ""} found</p>
        {hasFilters && <button type="button" onClick={reset} className="font-semibold text-indigo-800 underline dark:text-indigo-200">Clear all filters</button>}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-300 bg-white py-14 text-center dark:border-gray-700 dark:bg-gray-900">
          <FileText className="mx-auto mb-3 h-10 w-10 text-gray-400" />
          <p className="font-serif text-lg font-semibold">No notices match these filters</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-gray-600 dark:text-gray-400">
            Not every college has published notices here yet. Clear the filters, or check the college&apos;s official website for the latest news.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {filtered.slice(0, visible).map((n) => <NoticeCard key={n.id} notice={n} collegeNames={collegeNames} />)}
          </div>
          {visible < filtered.length && (
            <div className="pt-6 text-center">
              <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className="rounded-md border border-indigo-800 px-6 py-2.5 text-sm font-semibold text-indigo-800 hover:bg-indigo-50 dark:border-indigo-300 dark:text-indigo-200 dark:hover:bg-gray-800">
                Show more notices
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
