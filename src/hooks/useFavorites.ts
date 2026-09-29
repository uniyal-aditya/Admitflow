"use client";

import { useCallback, useEffect, useState } from "react";

// Session-aware favorites. Signed-in users read/write the DB via
// /api/user/favorites; guests keep using localStorage. On first signed-in
// load, guest favorites migrate into the DB (and localStorage is cleared) so
// nobody loses their watchlist when accounts enter the picture.

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/user/state", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (cancelled) return;
          setSignedIn(true);
          // Migrate guest favorites once, then prefer the DB list.
          const local = getLocalFavorites();
          if (local.length > 0) {
            const merged = [...new Set([...data.favorites, ...local])];
            await Promise.all(
              local
                .filter((id) => !data.favorites.includes(id))
                .map((id) =>
                  fetch("/api/user/favorites", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ collegeId: id, action: "add" }),
                  })
                )
            );
            if (!cancelled) {
              setFavorites(merged);
              setLocalFavorites([]); // migrated
            }
          } else {
            setFavorites(data.favorites);
          }
        } else {
          if (cancelled) return;
          setSignedIn(false);
          setFavorites(getLocalFavorites());
        }
      } catch {
        if (!cancelled) setFavorites(getLocalFavorites());
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback(
    async (collegeId: string): Promise<boolean> => {
      const prev = favorites;
      const isFav = prev.includes(collegeId);
      const next = isFav ? prev.filter((id) => id !== collegeId) : [...prev, collegeId];
      setFavorites(next); // optimistic

      if (!signedIn) {
        setLocalFavorites(next);
        return !isFav;
      }

      try {
        const res = await fetch("/api/user/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collegeId }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        setFavorites(data.favorites);
        return data.favorite;
      } catch {
        setFavorites(prev); // revert on failure
        return isFav;
      }
    },
    [favorites, signedIn]
  );

  return { favorites, ready, signedIn, toggle };
}

function getLocalFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("ahq_favorites");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalFavorites(ids: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("ahq_favorites", JSON.stringify(ids));
}
