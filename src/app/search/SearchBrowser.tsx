"use client";

import { Suspense, useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X, Filter } from "lucide-react";
import { NoticeCard } from "@/components/NoticeCard";
import { CollegeCard } from "@/components/CollegeCard";
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
      <div>
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Search across all notices, colleges, courses, and branches
        </p>
      </div>

      <div className="relative max-w-2xl">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search anything — CSE, Spot Round, GBPIET..."
          autoFocus
          className="w-full rounded-xl border bg-white/50 py-3 pl-12 pr-12 text-base backdrop-blur-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-900/50 dark:border-gray-700"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {query.trim() && (
        <>
          <div className="flex gap-1 rounded-xl border bg-white/50 p-1 dark:bg-gray-900/50 dark:border-gray-800 max-w-md">
            {tabs.map((t) => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  tab === t.value
                    ? "bg-white text-indigo-700 shadow-sm dark:bg-gray-800 dark:text-indigo-300"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
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
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Notices ({notices.length})
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
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
                  <h2 className="text-lg font-semibold flex items-center gap-2">
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
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Search className="h-16 w-16 mb-4" />
          <p className="text-lg font-medium">Search anything</p>
          <p className="text-sm max-w-md text-center">
            Try searching for &quot;CSE&quot;, &quot;Spot Round&quot;, &quot;GBPIET&quot;, or &quot;Registration&quot;
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
