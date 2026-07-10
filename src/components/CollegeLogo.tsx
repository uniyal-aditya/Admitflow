"use client";

import Image from "next/image";
import { useState } from "react";

const logoColors: Record<string, string> = {
  "doon-university": "#4f46e5",
  uktech: "#059669",
  gbpiet: "#dc2626",
  "thdc-ihet": "#0891b2",
  "git-gopeshwar": "#ca8a04",
  "git-uttarkashi": "#7c3aed",
  "git-tanakpur": "#db2777",
  "wit-dehradun": "#e11d48",
  "aiims-rishikesh": "#2563eb",
  "govt-medical-haldwani": "#059669",
  "ssj-campus": "#d97706",
  "mbpg-college-haldwani": "#4f46e5",
  "dav-pg-college-dehradun": "#2563eb",
  "dit-university": "#7c3aed",
  "devbhoomi-uk": "#0891b2",
  bfit: "#dc2626",
  "dronacharya-group": "#ca8a04",
  "graphic-era-hill": "#db2777",
  "graphic-era": "#e11d48",
  "tulas-institute": "#4f46e5",
  "himgiri-zee": "#059669",
  "shivalik-college": "#d97706",
  "uttaranchal-university": "#7c3aed",
  "icfai-dehradun": "#2563eb",
  "iitm-dehradun": "#0891b2",
  "sanskriti-university": "#dc2626",
  "quantum-university": "#ca8a04",
  "sgrr-university": "#db2777",
  upes: "#059669",
};

const logosAvailable: Set<string> = new Set([
  "aiims-rishikesh",
  "bfit",
  "devbhoomi-uk",
  "dit-university",
  "doon-university",
  "gbpiet",
  "geu",
  "govt-degree-college-haldwani",
  "icfai-dehradun",
  "quantum-university",
  "srhu",
  "tulas-institute",
  "uktech",
  "uou-haldwani",
  "upes",
  "uuhf-bharsar",
  "wit-dehradun",
]);

export function CollegeLogo({
  collegeId,
  name,
  size = "md",
}: {
  collegeId: string;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const [imgError, setImgError] = useState(false);
  const bg = logoColors[collegeId] || "#4f46e5";
  const letter = name.charAt(0).toUpperCase();
  const dimClass = size === "sm" ? "h-10 w-10 text-sm" : size === "lg" ? "h-20 w-20 text-2xl" : "h-16 w-16 text-xl";
  const imgSize = size === "sm" ? 40 : size === "lg" ? 80 : 64;

  if (!imgError && logosAvailable.has(collegeId)) {
    return (
      <div className={`relative shrink-0 overflow-hidden rounded-2xl ${dimClass}`} style={{ backgroundColor: bg }}>
        <Image
          src={`/logos/${collegeId}.png`}
          alt={name}
          fill
          className="object-contain p-1"
          sizes={imgSize + "px"}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl font-bold text-white ${dimClass}`}
      style={{ backgroundColor: bg }}
      aria-label={name}
    >
      {letter}
    </div>
  );
}
