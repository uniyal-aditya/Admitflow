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
  "bfit": "#dc2626",
  "dronacharya-group": "#ca8a04",
  "graphic-era-hill": "#db2777",
  "graphic-era": "#e11d48",
  "tula-institute": "#4f46e5",
  "himgiri-zee": "#059669",
  "shivalik-college": "#d97706",
  "uttaranchal-university": "#7c3aed",
  "icfai-dehradun": "#2563eb",
  "iitm-dehradun": "#0891b2",
  "sanskriti-university": "#dc2626",
  "quantum-university": "#ca8a04",
  "sgrr-university": "#db2777",
  "upes": "#059669",
};

function getInitials(name: string): string {
  return name
    .replace(/[-/]/g, " ")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

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
  const dims = { sm: 48, md: 64, lg: 80 };
  const px = dims[size];
  const initials = getInitials(name);
  const fontSize = size === "sm" ? 16 : size === "lg" ? 28 : 22;

  return (
    <svg
      width={px}
      height={px}
      viewBox={`0 0 ${px} ${px}`}
      className={`shrink-0 rounded-2xl ${
        size === "sm" ? "h-10 w-10" : size === "lg" ? "h-20 w-20" : "h-16 w-16"
      }`}
      aria-label={name}
      role="img"
    >
      <rect width={px} height={px} rx={px * 0.25} fill={bg} />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#ffffff"
        fontSize={fontSize}
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
      >
        {initials}
      </text>
    </svg>
  );
}
