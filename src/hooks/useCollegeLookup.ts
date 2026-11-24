"use client";

import { useEffect, useState } from "react";

export interface CollegeLite {
  id: string;
  shortName: string;
  name: string;
  location: string;
  website?: string;
  type: string;
  ownership: string;
  coursesCount: number;
}

let cache: Record<string, CollegeLite> | null = null;
let inflight: Promise<Record<string, CollegeLite>> | null = null;

/** Loads colleges from the database once per page load (not from the static seed file). */
function load(): Promise<Record<string, CollegeLite>> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch("/api/colleges", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: { colleges: { id: string; shortName: string; name: string; location: string; website?: string; type: string; ownership: string; courses: unknown[] }[] }) => {
        const map: Record<string, CollegeLite> = {};
        for (const c of data.colleges) {
          map[c.id] = { id: c.id, shortName: c.shortName, name: c.name, location: c.location, website: c.website, type: c.type, ownership: c.ownership, coursesCount: c.courses.length };
        }
        cache = map;
        return map;
      })
      .finally(() => { inflight = null; });
  }
  return inflight;
}

export function useCollegeLookup() {
  const [colleges, setColleges] = useState<Record<string, CollegeLite>>(cache ?? {});
  const [loaded, setLoaded] = useState(cache !== null);
  useEffect(() => {
    let alive = true;
    load().then((m) => { if (alive) { setColleges(m); setLoaded(true); } }).catch(() => { if (alive) setLoaded(true); });
    return () => { alive = false; };
  }, []);
  return { colleges, loaded };
}
