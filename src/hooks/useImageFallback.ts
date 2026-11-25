"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tries a list of image addresses in order and reports when none of them load.
 *
 * It also checks images that already failed BEFORE the page became interactive:
 * a server-rendered <img> can fail while React is still starting, and its onError
 * handler would never run, leaving a broken-image icon on screen.
 */
export function useImageFallback(candidates: string[]) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLImageElement>(null);
  const key = candidates.join("|");

  useEffect(() => { setIndex(0); }, [key]);

  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setIndex((i) => i + 1);
  }, [index, key]);

  const onError = useCallback(() => setIndex((i) => i + 1), []);

  return { ref, src: candidates[index], failed: index >= candidates.length, onError };
}
