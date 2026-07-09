"use client";

import { useState, useCallback } from "react";
import { isFavorite, toggleFavorite } from "@/lib/store";

export function useSyncFavorite(id: string): [boolean, () => void] {
  const [fav, setFav] = useState(() => isFavorite(id));

  const toggle = useCallback(() => {
    const now = toggleFavorite(id);
    setFav(now);
  }, [id]);

  return [fav, toggle];
}
