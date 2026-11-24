"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, Building2, Lightbulb, SlidersHorizontal, X } from "lucide-react";
import { CollegeCard } from "@/components/CollegeCard";
import { PageHeading } from "@/components/gov/PageHeading";
import type { College, CollegeType, Ownership } from "@/types";

type TabType = CollegeType | "all";

const typeOptions: { label: string; value: TabType }[] = [
  { label: "All types", value: "all" },
  { label: "Universities", value: "university" },
  { label: "Engineering", value: "engineering" },
  { label: "Medical", value: "medical" },
  { label: "Degree (Arts, Science, Commerce)", value: "degree" },
  { label: "Polytechnic", value: "polytechnic" },
  { label: "Law", value: "law" },
  { label: "Pharmacy", value: "pharmacy" },
  { label: "Management", value: "management" },
  { label: "Other", value: "other" },
];

const ownershipOptions: { label: string; value: Ownership | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Government", value: "government" },
  { label: "Private", value: "private" },
  { label: "Deemed", value: "deemed" },
  { label: "Autonomous", value: "autonomous" },
  { label: "Aided", value: "aided" },
];

const PAGE_SIZE = 24;

export function CollegesBrowser({ colleges, districts }: { colleges: College[]; districts: string[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TabType>("all");
  const [ownershipFilter, setOwnershipFilter] = useState<Ownership | "all">("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [sort, setSort] = useState<"name" | "oldest" | "newest">("name");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [panelOpen, setPanelOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = colleges.filter((c) => {
      if (q && ![c.name, c.shortName, c.location, c.district].some((f) => f.toLowerCase().includes(q))) return false;
      if (typeFilter !== "all" && c.type !== typeFilter) return false;
      if (ownershipFilter !== "all" && c.ownership !== ownershipFilter) return false;
      if (districtFilter !== "all" && c.district !== districtFilter) return false;
      return true;
    });
    return [...list].sort((a, b) =>
      sort === "name" ? a.name.localeCompare(b.name)
        : sort === "oldest" ? (a.established || 9999) - (b.established || 9999)
          : (b.established || 0) - (a.established || 0),
    );
  }, [colleges, search, typeFilter, ownershipFilter, districtFilter, sort]);

  useEffect(() => setVisible(PAGE_SIZE), [search, typeFilter, ownershipFilter, districtFilter, sort]);

  const typeCounts = useMemo(() => {
    const m: Record<string, number> = { all: colleges.length };
    colleges.forEach((c) => { m[c.type] = (m[c.type] ?? 0) + 1; });
    return m;
  }, [colleges]);

  const activeFilters = [typeFilter !== "all", ownershipFilter !== "all", districtFilter !== "all"].filter(Boolean).length;
  const reset = () => { setTypeFilter("all"); setOwnershipFilter("all"); setDistrictFilter("all"); setSearch(""); };

  const field = "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white";
  const legend = "mb-2 font-serif text-base font-semibold text-indigo-900 dark:text-white";

  const filters = (
    <div className="space-y-6">
      <fieldset>
        <legend className={legend}>College type</legend>
        <div className="space-y-1.5">
          {typeOptions.filter((o) => o.value === "all" || typeCounts[o.value]).map((o) => (
            <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="radio" name="type" checked={typeFilter === o.value} onChange={() => setTypeFilter(o.value)} className="h-4 w-4 accent-indigo-800" />
              <span className="flex-1">{o.label}</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">{typeCounts[o.value] ?? 0}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={legend}>Ownership</legend>
        <div className="space-y-1.5">
          {ownershipOptions.map((o) => (
            <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="radio" name="ownership" checked={ownershipFilter === o.value} onChange={() => setOwnershipFilter(o.value)} className="h-4 w-4 accent-indigo-800" />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="district" className={`block ${legend}`}>District</label>
        <select id="district" value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)} className={field}>
          <option value="all">All districts</option>
          {districts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {activeFilters > 0 && (
        <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-800 underline dark:text-indigo-200">
          <X className="h-4 w-4" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div>
      <PageHeading
        title="College profiles"
        crumbs={[{ label: "Colleges" }]}
        description={`Browse ${colleges.length} colleges across Uttarakhand. Use the filters to narrow the list by type, ownership or district.`}
        action={
          <Link href="/suggest" className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-indigo-900 hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-900 dark:text-indigo-200 dark:hover:bg-gray-800">
            <Lightbulb className="h-4 w-4" /> Suggest a missing college
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
        {/* Desktop filter panel */}
        <aside aria-label="Filters" className="hidden h-fit rounded-md border border-gray-200 bg-white p-5 lg:block dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 border-b-2 border-saffron-500 pb-2 text-lg font-bold text-indigo-900 dark:text-white">Refine results</h2>
          {filters}
        </aside>

        <div className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <label htmlFor="college-search" className="sr-only">Search colleges</label>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input id="college-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by college name, city or district" className={`${field} pl-9`} />
            </div>
            <div className="flex gap-3">
              <label htmlFor="sort" className="sr-only">Sort colleges</label>
              <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={`${field} sm:w-48`}>
                <option value="name">Name (A to Z)</option>
                <option value="oldest">Oldest first</option>
                <option value="newest">Newest first</option>
              </select>
              <button type="button" onClick={() => setPanelOpen((v) => !v)} aria-expanded={panelOpen} className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-indigo-900 lg:hidden dark:border-gray-700 dark:bg-gray-900 dark:text-indigo-200">
                <SlidersHorizontal className="h-4 w-4" /> Filters{activeFilters > 0 && ` (${activeFilters})`}
              </button>
            </div>
          </div>

          {panelOpen && <div className="rounded-md border border-gray-200 bg-white p-5 lg:hidden dark:border-gray-800 dark:bg-gray-900">{filters}</div>}

          <p role="status" aria-live="polite" className="text-sm text-gray-700 dark:text-gray-300">
            Showing <strong>{Math.min(visible, filtered.length)}</strong> of <strong>{filtered.length}</strong> colleges
          </p>

          {filtered.length === 0 ? (
            <div className="rounded-md border border-dashed border-gray-300 bg-white py-14 text-center dark:border-gray-700 dark:bg-gray-900">
              <Building2 className="mx-auto mb-3 h-10 w-10 text-gray-400" />
              <p className="font-serif text-lg font-semibold">No colleges match your search</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Check the spelling or clear some filters.</p>
              <button type="button" onClick={reset} className="mt-4 rounded-md bg-indigo-800 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-900">Clear all filters</button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.slice(0, visible).map((c) => <CollegeCard key={c.id} college={c} />)}
              </div>
              {visible < filtered.length && (
                <div className="pt-2 text-center">
                  <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className="rounded-md border border-indigo-800 px-6 py-2.5 text-sm font-semibold text-indigo-800 hover:bg-indigo-50 dark:border-indigo-300 dark:text-indigo-200 dark:hover:bg-gray-800">
                    Show {Math.min(PAGE_SIZE, filtered.length - visible)} more colleges
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
