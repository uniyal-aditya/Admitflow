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
  "doon-medical-college": "#7c3aed",
  "vcsggms-ri": "#ca8a04",
  "ssj-government-institute-medical": "#db2777",
  "government-medical-college-haridwar": "#0891b2",
  "himalayan-institute-medical-sciences": "#4f46e5",
  "sgrr-institute-medical-health": "#dc2626",
  "gautam-buddha-chikitsa": "#059669",
  "geu-medical-sciences": "#2563eb",
  "upes-school-of-law": "#7c3aed",
  "ims-unison-law": "#ca8a04",
  "uttaranchal-university-law": "#db2777",
  "geu-school-of-law": "#e11d48",
  "icfai-law-school": "#4f46e5",
  "kumaun-university-law": "#059669",
  "govt-girls-degree-college-haldwani": "#db2777",
  "govt-pg-college-tehri": "#7c3aed",
  "govt-degree-college-karanprayag": "#ca8a04",
  "govt-degree-college-kashipur": "#e11d48",
  "govt-degree-college-kotdwar": "#2563eb",
  "govt-degree-college-vikasnagar": "#0891b2",
  "govt-degree-college-bageshwar": "#4f46e5",
  "apb-govt-pg-college": "#059669",
  "gp-kashipur": "#7c3aed",
  "gp-girls-dehradun": "#db2777",
  "gp-aamwala": "#e11d48",
  "gp-barkot": "#ca8a04",
  "gp-berinag": "#2563eb",
  "gp-girls-nainital": "#4f46e5",
  "grd-pharmacy": "#0891b2",
  "himalayan-pharmacy": "#059669",
  "sgrr-pharmacy": "#7c3aed",
  "ims-dehradun": "#ca8a04",
  "amrapali-management": "#db2777",
  "doon-business-school": "#e11d48",
  "rishikul-ayush-university": "#4f46e5",
  "patanjali-ayurveda": "#2563eb",
  "aiims-nursing": "#0891b2",
  "ihm-dehradun": "#059669",
  "uttaranchal-university": "#7c3aed",
  "sardar-bhagwan-singh-university": "#ca8a04",
  "amrapali-university": "#db2777",
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
