"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { colleges } from "@/data/colleges";
import { CollegeCard } from "@/components/CollegeCard";
import { Search, Filter, Building2, GraduationCap, University, Lightbulb } from "lucide-react";
import { CollegeType } from "@/types";

type FilterType = CollegeType | "all";

export default function CollegesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");

  const filtered = useMemo(() => {
    return colleges.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.shortName.toLowerCase().includes(search.toLowerCase()) ||
        c.location.toLowerCase().includes(search.toLowerCase()) ||
        c.district.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || c.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [search, typeFilter]);

  const filters: { label: string; value: FilterType; icon: typeof Building2 }[] = [
    { label: "All", value: "all", icon: Building2 },
    { label: "Universities", value: "university", icon: University },
    { label: "Engineering", value: "engineering", icon: GraduationCap },
  ];

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

      <div className="flex flex-col sm:flex-row gap-4">
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
        <div className="flex gap-2">
          {filters.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  typeFilter === f.value
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "border bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

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
