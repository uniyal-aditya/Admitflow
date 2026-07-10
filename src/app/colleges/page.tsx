"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { colleges } from "@/data/colleges";
import { CollegeCard } from "@/components/CollegeCard";
import {
  Search, Building2, GraduationCap, University, HeartPulse,
  Layers, Scale, Pill, Briefcase, Sparkles, Lightbulb, SlidersHorizontal, X,
} from "lucide-react";
import type { CollegeType, Ownership } from "@/types";

type TabType = CollegeType | "all";

const tabs: { label: string; value: TabType; icon: React.ElementType }[] = [
  { label: "All", value: "all", icon: Building2 },
  { label: "Universities", value: "university", icon: University },
  { label: "Engineering", value: "engineering", icon: GraduationCap },
  { label: "Medical", value: "medical", icon: HeartPulse },
  { label: "Degree (Arts/Sci/Com)", value: "degree", icon: Layers },
  { label: "Polytechnic", value: "polytechnic", icon: Sparkles },
  { label: "Law", value: "law", icon: Scale },
  { label: "Pharmacy", value: "pharmacy", icon: Pill },
  { label: "Management", value: "management", icon: Briefcase },
  { label: "Other", value: "other", icon: Sparkles },
];

const ownerships: { label: string; value: Ownership | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Government", value: "government" },
  { label: "Private", value: "private" },
  { label: "Deemed", value: "deemed" },
  { label: "Autonomous", value: "autonomous" },
  { label: "Aided", value: "aided" },
];

const districts = [...new Set(colleges.map((c) => c.district))].sort();

export default function CollegesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TabType>("all");
  const [ownershipFilter, setOwnershipFilter] = useState<Ownership | "all">("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return colleges.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !c.name.toLowerCase().includes(q) &&
          !c.shortName.toLowerCase().includes(q) &&
          !c.location.toLowerCase().includes(q) &&
          !c.district.toLowerCase().includes(q)
        ) return false;
      }
      if (typeFilter !== "all" && c.type !== typeFilter) return false;
      if (ownershipFilter !== "all" && c.ownership !== ownershipFilter) return false;
      if (districtFilter !== "all" && c.district !== districtFilter) return false;
      return true;
    });
  }, [search, typeFilter, ownershipFilter, districtFilter]);

  const activeFilters = [typeFilter !== "all", ownershipFilter !== "all", districtFilter !== "all"].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">College Profiles</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Browse {colleges.length} Uttarakhand colleges
          </p>
        </div>
        <Link
          href="/suggest"
          className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
        >
          <Lightbulb className="h-4 w-4" />
          Suggest Missing College
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search colleges by name, location..."
              className="w-full rounded-xl border bg-white/50 py-2.5 pl-10 pr-4 text-sm backdrop-blur-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900/50 dark:border-gray-700"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
              showFilters || activeFilters > 0
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-800 dark:text-indigo-300"
                : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilters > 0 && (
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-600 text-white text-xs">{activeFilters}</span>
            )}
          </button>
        </div>

        {/* Type tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.value}
                onClick={() => setTypeFilter(t.value)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors ${
                  typeFilter === t.value
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "border bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="rounded-xl border bg-white p-4 space-y-4 dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Advanced Filters</span>
              <button
                onClick={() => { setOwnershipFilter("all"); setDistrictFilter("all"); setTypeFilter("all"); }}
                className="text-xs text-indigo-600 hover:underline"
              >
                Clear all
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Ownership</label>
                <div className="flex flex-wrap gap-1.5">
                  {ownerships.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => setOwnershipFilter(o.value)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                        ownershipFilter === o.value
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">District</label>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full rounded-lg border bg-white px-3 py-1.5 text-xs dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="all">All Districts</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500">
        Showing {filtered.length} of {colleges.length} colleges
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Building2 className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">No colleges found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((college) => (
            <CollegeCard key={college.id} college={college} />
          ))}
        </div>
      )}
    </div>
  );
}
