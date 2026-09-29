"use client";

import { Star } from "lucide-react";
import { useSyncFavorite } from "@/hooks/useSyncFavorite";

/** Favorite toggle for server-rendered pages (localStorage-backed for now;
 *  Phase 7 moves favorites into the DB). */
export function FavoriteStar({ id }: { id: string }) {
  const [isFav, toggleFav] = useSyncFavorite(id);

  return (
    <button
      onClick={toggleFav}
      className={`rounded-xl p-2.5 transition-colors ${
        isFav
          ? "text-yellow-500 hover:text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30"
          : "text-gray-300 hover:text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
      aria-label={isFav ? "Remove from watchlist" : "Add to watchlist"}
    >
      <Star className={`h-6 w-6 ${isFav ? "fill-current" : ""}`} />
    </button>
  );
}
