"use client";

import { useEffect, useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";

/**
 * Favorite star backed by the DB for signed-in users (localStorage for
 * guests). `initial` renders before the session-aware state loads so the
 * server HTML is stable; it self-corrects after hydration.
 */
export function FavoriteStar({ id, initial = false }: { id: string; initial?: boolean }) {
  const { favorites, ready, toggle } = useFavorites();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const isFav = ready ? favorites.includes(id) : initial;
  if (!hydrated) {
    return (
      <span
        className="p-1 text-gray-300"
        aria-hidden
        title="Sign in to sync favorites"
      >
        ★
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      aria-pressed={isFav}
      aria-label={isFav ? `Remove ${id} from watchlist` : `Add ${id} to watchlist`}
      className={`p-1 text-xl leading-none transition-colors ${
        isFav
          ? "text-yellow-500 hover:text-yellow-600"
          : "text-gray-300 hover:text-yellow-500 dark:text-gray-600 dark:hover:text-yellow-500"
      }`}
    >
      ★
    </button>
  );
}
