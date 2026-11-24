"use client";

import Link from "next/link";
import { Star, MapPin, ExternalLink } from "lucide-react";
import { College } from "@/types";
import { useFavorites } from "@/hooks/useFavorites";
import { collegeTypeLabel } from "@/lib/utils";
import { CollegeLogo } from "@/components/CollegeLogo";

export function CollegeCard({ college }: { college: College }) {
  const { favorites, toggle } = useFavorites();
  const isFav = favorites.includes(college.id);

  return (
    <article className="flex h-full flex-col rounded-md border border-gray-200 border-t-4 border-t-indigo-800 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-800 dark:border-t-indigo-500 dark:bg-gray-900">
      <div className="flex items-start gap-3">
        <CollegeLogo collegeId={college.id} name={college.shortName} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-lg font-semibold leading-snug">
            <Link href={`/colleges/${college.id}`} className="text-indigo-900 hover:underline dark:text-white">{college.name}</Link>
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{college.location}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => void toggle(college.id)}
          aria-pressed={isFav}
          aria-label={isFav ? `Remove ${college.shortName} from watchlist` : `Add ${college.shortName} to watchlist`}
          className={`rounded p-1.5 ${isFav ? "text-saffron-600" : "text-gray-400 hover:text-saffron-600"}`}
        >
          <Star className={`h-5 w-5 ${isFav ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
        <span className="rounded bg-indigo-50 px-2 py-0.5 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200">{collegeTypeLabel(college.type, college.ownership)}</span>
        <span className="rounded bg-gray-100 px-2 py-0.5 capitalize text-gray-800 dark:bg-gray-800 dark:text-gray-200">{college.ownership}</span>
        <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-800 dark:bg-gray-800 dark:text-gray-200">{college.district}</span>
      </div>

      <dl className="mt-3 flex gap-6 text-sm">
        <div><dt className="text-xs text-gray-600 dark:text-gray-400">Courses</dt><dd className="font-semibold">{college.courses.length}</dd></div>
        <div><dt className="text-xs text-gray-600 dark:text-gray-400">Established</dt><dd className="font-semibold">{college.established || "-"}</dd></div>
      </dl>

      <div className="mt-auto flex items-center gap-2 pt-4">
        <Link href={`/colleges/${college.id}`} className="flex-1 rounded-md bg-indigo-800 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-900">View profile</Link>
        {college.website && (
          <a href={college.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-indigo-900 hover:bg-indigo-50 dark:border-gray-700 dark:text-indigo-200 dark:hover:bg-gray-800">
            Website <ExternalLink className="h-3.5 w-3.5" /><span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </div>
    </article>
  );
}
