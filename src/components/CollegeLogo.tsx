"use client";

import { useImageFallback } from "@/hooks/useImageFallback";

const sizes = {
  sm: "h-10 w-10 text-sm",
  md: "h-16 w-16 text-xl",
  lg: "h-20 w-20 text-2xl",
} as const;

/**
 * College logo from /public/logos/<college-id>.png (or .svg / .jpg).
 * Falls back to a navy tile with the first letter when no logo file exists.
 */
export function CollegeLogo({
  collegeId, name, size = "md",
}: {
  collegeId: string;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const { ref, src, failed, onError } = useImageFallback([
    `/logos/${collegeId}.png`,
    `/logos/${collegeId}.svg`,
    `/logos/${collegeId}.jpg`,
    `/logos/${collegeId}.webp`,
  ]);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={`${name} (no logo available)`}
        className={`flex shrink-0 items-center justify-center rounded-md bg-indigo-800 font-serif font-bold text-white ${sizes[size]}`}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={`${name} logo`}
      onError={onError}
      loading="lazy"
      decoding="async"
      className={`shrink-0 rounded-md border border-gray-200 bg-white object-contain p-1 ${sizes[size]}`}
    />
  );
}
