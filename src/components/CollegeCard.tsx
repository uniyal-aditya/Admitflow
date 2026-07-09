"use client";

import Link from "next/link";
import { Star, MapPin, ExternalLink } from "lucide-react";
import { College } from "@/types";
import { useSyncFavorite } from "@/hooks/useSyncFavorite";
import { collegeTypeLabel } from "@/lib/utils";
import { CollegeLogo } from "@/components/CollegeLogo";

export function CollegeCard({ college }: { college: College }) {
  const [isFav, toggleFav] = useSyncFavorite(college.id);

  return (
    <div className="group rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <CollegeLogo collegeId={college.id} name={college.shortName} size="md" />
          <div>
            <Link
              href={`/colleges/${college.id}`}
              className="font-semibold text-lg hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {college.shortName}
            </Link>
            <p className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="h-3 w-3" />
              {college.location}
            </p>
          </div>
        </div>
        <button
          onClick={toggleFav}
          className={`rounded-lg p-1.5 transition-colors ${
            isFav
              ? "text-yellow-500 hover:text-yellow-600"
              : "text-gray-300 hover:text-gray-400 dark:text-gray-600"
          }`}
        >
          <Star className={`h-5 w-5 ${isFav ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
          {collegeTypeLabel(college.type, college.ownership)}
        </span>
        <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950/50 dark:text-green-300">
          {college.district}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span>{college.courses.length} Courses</span>
        <span>Est. {college.established}</span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Link
          href={`/colleges/${college.id}`}
          className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          View Profile
        </Link>
        <a
          href={college.website}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
