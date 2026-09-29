"use client";

import { useFavorites } from "@/hooks/useFavorites";

/**
 * Compatibility shim over useFavorites for call sites that only need a
 * single id's state. New code should use useFavorites directly so one
 * subscription serves the whole page.
 */
export function useSyncFavorite(id: string): [boolean, () => void] {
  const { favorites, ready, toggle } = useFavorites();
  const isFav = ready ? favorites.includes(id) : false;
  return [isFav, () => void toggle(id)];
}
