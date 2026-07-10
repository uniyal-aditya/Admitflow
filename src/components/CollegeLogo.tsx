const logoColors: Record<string, string> = {
  "doon-university": "#4f46e5",
  uktech: "#059669",
  "kumaun-university": "#ca8a04",
  "ssj-university": "#7c3aed",
  "sdsu-telri": "#0891b2",
  "uou-haldwani": "#db2777",
  "uuhf-bharsar": "#e11d48",
  gbpiet: "#dc2626",
  "thdc-ihet": "#0891b2",
  "git-gopeshwar": "#ca8a04",
  "git-uttarkashi": "#7c3aed",
  "git-tanakpur": "#db2777",
  "wit-dehradun": "#e11d48",
  "gp-dehradun": "#4f46e5",
  "gp-roorkee": "#059669",
  geu: "#2563eb",
  upes: "#059669",
  "dit-university": "#7c3aed",
  "icfai-dehradun": "#2563eb",
  "himgiri-zee": "#db2777",
  srhu: "#0891b2",
  "devbhoomi-uk": "#0891b2",
  "quantum-university": "#ca8a04",
  "tulas-institute": "#4f46e5",
  bfit: "#dc2626",
  "heritage-institute": "#059669",
  "dronacharya-group": "#ca8a04",
  "grd-imt": "#4f46e5",
  "govt-degree-college-nainital": "#7c3aed",
  "govt-degree-college-haldwani": "#db2777",
  "govt-degree-college-roorkee": "#e11d48",
  "government-medical-college-haldwani": "#059669",
  "aiims-rishikesh": "#2563eb",
};

export function CollegeLogo({
  collegeId,
  name,
  size = "md",
}: {
  collegeId: string;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const bg = logoColors[collegeId] || "#4f46e5";
  const letter = name.charAt(0).toUpperCase();
  const dimClass = size === "sm" ? "h-10 w-10 text-sm" : size === "lg" ? "h-20 w-20 text-2xl" : "h-16 w-16 text-xl";

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
