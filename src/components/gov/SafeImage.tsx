"use client";

import { useMemo } from "react";
import { useImageFallback } from "@/hooks/useImageFallback";

const ALT_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG"];

/** The address itself first, then the same name with other common extensions (Linux servers are case-sensitive). */
function candidatesFor(src: string): string[] {
  const base = src.replace(/\.[A-Za-z0-9]+$/, "");
  return [...new Set([src, ...ALT_EXTENSIONS.map((e) => base + e)])];
}

/**
 * <img> that tolerates the wrong extension (photo.jpeg vs photo.jpg) and falls back to a
 * plain navy panel when no file is found, so the layout holds before every photo is added.
 */
export function SafeImage({
  src, alt, className = "", fallbackClassName = "", priority = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  priority?: boolean;
}) {
  const list = useMemo(() => (src ? candidatesFor(src) : []), [src]);
  const { ref, src: current, failed, onError } = useImageFallback(list);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`bg-gradient-to-br from-indigo-800 via-indigo-700 to-indigo-900 ${className} ${fallbackClassName}`}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={current}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={onError}
    />
  );
}
