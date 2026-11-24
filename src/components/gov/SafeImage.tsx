"use client";

import { useState } from "react";

/**
 * <img> that degrades to a plain navy panel when the file is missing,
 * so the layout holds before you have added every photo.
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
  const [failed, setFailed] = useState(false);
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
      src={src}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
