"use client";

import { useState, useMemo } from "react";
import { NoticeCard } from "@/components/NoticeCard";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { NoticeType } from "@/types";
import { noticeTypeLabel } from "@/lib/utils";

const noticeTypes: NoticeType[] = [
  "admission", "registration", "counselling", "spot_round",
  "vacant_seat", "merit_list", "waiting_list", "fee_payment",
  "reporting", "extension", "general",
];

export function NoticesBrowser({
  notices,
  collegeNames,
  colleges,
}: {
  notices: import("@/types").Notice[];
  collegeNames: Record<string, string>;
  colleges: { id: string; shortName: string }[];
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [collegeFilter, setCollegeFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return notices.filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.summary.toLowerCase().includes(search.toLowerCase()) ||
        n.coursesAffected.some((c) => c.toLowerCase().includes(search.toLowerCase()));
      const matchesType = typeFilter === "all" || n.type === typeFilter;
      // Status is engine-derived server-side (notice.status); client-side
      // re-derivation parity is handled inside NoticeCard.
      const matchesStatus = statusFilter === "all" || n.status === statusFilter;
      const matchesCollege = collegeFilter === "all" || n.collegeId === collegeFilter;
      return matchesSearch && matchesType && matchesStatus && matchesCollege;
    });
  }, [notices, search, typeFilter, statusFilter, collegeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notice Center</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Every notice from every college in one place
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notices by title, summary, course..."
          className="w-full rounded-xl border bg-white/50 py-2.5 pl-10 pr-4 text-sm backdrop-blur-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900/50 dark:border-gray-700"
        />
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-4 rounded-xl border bg-white/50 p-4 dark:bg-gray-900/50 dark:border-gray-800">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Notice Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
            >
              <option value="all">All Types</option>
              {noticeTypes.map((t) => (
                <option key={t} value={t}>{noticeTypeLabel(t)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">College</label>
            <select
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
              className="rounded-lg border bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
            >
              <option value="all">All Colleges</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>{c.shortName}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Filter className="h-4 w-4" />
        {filtered.length} notice{filtered.length !== 1 ? "s" : ""} found
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Search className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">No notices found</p>
          <p className="text-sm">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} collegeNames={collegeNames} />
          ))}
        </div>
      )}
    </div>
  );
}
