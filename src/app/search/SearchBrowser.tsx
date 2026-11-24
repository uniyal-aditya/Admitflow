"use client";

import { Suspense, useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X, Filter } from "lucide-react";
import { NoticeCard } from "@/components/NoticeCard";
import { CollegeCard } from "@/components/CollegeCard";
import { PageHeading } from "@/components/gov/PageHeading";
import type { College, Notice } from "@/types";

type TabType = "all" | "notices" | "colleges";

function SearchContent({
  initialQuery,
  colleges: initialColleges,
  notices: initialNotices,
}: {
  initialQuery: string;
  colleges: College[];
  notices: Notice[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState<TabType>("all");
  const [colleges, setColleges] = useState(initialColleges);
  const [notices, setNotices] = useState(initialNotices);
  const [isSearching, setIsSearching] = useState(false);
  const firstRender = useRef(true);

  // Keep URL shareable; server re-queries on navigation.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const t = setTimeout(() => {
      setIsSearching(true);
      router.replace(`/search?q=${encodeURIComponent(query)}`, { scroll: false });
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((data) => {
          setColleges(data.colleges.results);
          setNotices(data.notices.results);
        })
        .catch(() => {/* keep last good results */})
        .finally(() => setIsSearching(false));
    }, 350);
    return () => clearTimeout(t);
  }, [query, router]);

  // Reset local results when the server sends new ones (URL-driven nav).
  useEffect(() => {
    setColleges(initialColleges);
    setNotices(initialNotices);
  }, [initialColleges, initialNotices, searchParams]);

  const totalResults = colleges.length + notices.length;

  const tabs: { label: string; value: TabType; count: number }[] = [
    { label: "All", value: "all", count: totalResults },
    { label: "Notices", value: "notices", count: notices.length },
    { label: "Colleges", value: "colleges", count: colleges.length },
  ];

  return (
    <div className="space-y-6">
      <PageHeading
        title="Search"
        crumbs={[{ label: "Search" }]}
        description="Search across notices, colleges, courses and branches."
      />

      <form role="search" onSubmit={(e) => e.preventDefault()} className="max-w-2xl">
        <label htmlFor="main-search" className="mb-1 block text-sm font-semibold text-indigo-900 dark:text-indigo-200">What are you looking for?</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
          <input
            id="main-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="For example: CSE, spot round, GBPIET"
            autoFocus
            className="w-full rounded-md border border-gray-300 bg-white py-3 pl-11 pr-11 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {query.trim() && (
        <>
          <div role="tablist" aria-label="Result type" className="flex max-w-md border-b-2 border-gray-200 dark:border-gray-800">
            {tabs.map((t) => (
              <button
                key={t.value}
                role="tab"
                aria-selected={tab === t.value}
                onClick={() => setTab(t.value)}
                className={`-mb-0.5 flex-1 border-b-4 px-4 py-2 text-sm font-semibold ${
                  tab === t.value
                    ? "border-saffron-500 text-indigo-900 dark:text-white"
                    : "border-transparent text-gray-700 hover:text-indigo-900 dark:text-gray-300 dark:hover:text-white"
                }`}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>

          {totalResults === 0 && !isSearching ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Search className="h-16 w-16 mb-4" />
              <p className="text-lg font-medium">No results for &quot;{query}&quot;</p>
              <p className="text-sm">Try different keywords or check your spelling</p>
            </div>
          ) : (
            <div className={`space-y-8 transition-opacity ${isSearching ? "opacity-60" : ""}`}>
              {(tab === "all" || tab === "notices") && notices.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-indigo-900 dark:text-white flex items-center gap-2">
                    <Filter className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Notices ({notices.length})
                  </h2>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {notices.slice(0, tab === "notices" ? undefined : 6).map((notice) => (
                      <NoticeCard key={notice.id} notice={notice} />
                    ))}
                  </div>
                  {tab === "all" && notices.length > 6 && (
                    <button
                      onClick={() => setTab("notices")}
                      className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      View all {notices.length} notices
                    </button>
                  )}
                </div>
              )}

              {(tab === "all" || tab === "colleges") && colleges.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-indigo-900 dark:text-white flex items-center gap-2">
                    <Filter className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Colleges ({colleges.length})
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {colleges.map((college) => (
                      <CollegeCard key={college.id} college={college} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!query.trim() && (
        <div className="rounded-md border border-dashed border-gray-300 bg-white py-12 text-center text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
          <Search className="mx-auto mb-3 h-10 w-10 text-gray-400" />
          <p className="font-serif text-lg font-semibold">Type a word to start</p>
          <p className="mx-auto mt-1 max-w-md text-sm">
            Try &quot;CSE&quot;, &quot;spot round&quot;, &quot;GBPIET&quot; or &quot;registration&quot;.
          </p>
        </div>
      )}
    </div>
  );
}

export function SearchBrowser(props: React.ComponentProps<typeof SearchContent>) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Search className="h-8 w-8 text-gray-400 animate-pulse" /></div>}>
      <SearchContent {...props} />
    </Suspense>
  );
}
