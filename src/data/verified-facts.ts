/**
 * Phase 3 research registry.
 *
 * Every entry below was read from the named source on RESEARCH_DATE. These facts are
 * loaded as "researched, awaiting admin confirmation": an admin must open the source and
 * confirm each one in Admin > Verification before the public site shows it as checked.
 *
 * Rules: never add a value that is not on one of the listed sources. If a figure cannot be
 * confirmed (fees, seats, accreditation), leave it out rather than estimate it.
 */

export const RESEARCH_DATE = "2026-11-24";

export interface FactSource { name: string; url: string }

export interface ResearchedFact {
  field: "name" | "established" | "website" | "location" | "district" | "contactPhone" | "contactEmail";
  value: string | number;
  sources: FactSource[];
  note?: string;
}

export interface NewCollege {
  id: string; name: string; shortName: string; type: string; ownership: string;
  location: string; district: string; website: string; established: number; description: string;
}

export interface Correction {
  collegeId: string;
  field: "affiliation" | "accreditation" | "contactPhone" | "contactEmail";
  from: string;
  to: string | null;
  reason: string;
}

export interface ResearchedCollege {
  id: string;
  create?: NewCollege;
  facts: ResearchedFact[];
}

const AIIMS_PDF: FactSource = {
  name: "AIIMS Rishikesh: MBBS reporting guidelines, session 2026 (official PDF)",
  url: "https://aiimsrishikesh.edu.in/images/upload_documents/Reporting%20guidelines%20for%20round%201%20for%20MBBS%20admission%20Session%202026.pdf",
};

export const researched: ResearchedCollege[] = [
  {
    id: "aiims-rishikesh",
    facts: [
      { field: "website", value: "https://aiimsrishikesh.edu.in", sources: [AIIMS_PDF], note: "Official PDF is hosted on this domain." },
      { field: "contactPhone", value: "0135-2462932", sources: [AIIMS_PDF], note: "Listed for MBBS admission queries." },
      { field: "contactEmail", value: "mbbs.admission@aiimsrishikesh.edu.in", sources: [AIIMS_PDF], note: "Listed for MBBS admission queries." },
    ],
  },
  {
    id: "iit-roorkee",
    create: {
      id: "iit-roorkee",
      name: "Indian Institute of Technology Roorkee",
      shortName: "IIT Roorkee",
      type: "engineering",
      ownership: "government",
      location: "Roorkee",
      district: "Haridwar",
      website: "https://www.iitr.ac.in",
      established: 1847,
      description:
        "IIT Roorkee is a public technical institution in Roorkee, Haridwar district. It began in 1847 as a college of civil engineering and became an Indian Institute of Technology in 2001.",
    },
    facts: [
      { field: "established", value: 1847, sources: [
        { name: "Central Water Commission (gov.in): IIT Roorkee academic session notice", url: "https://cwc.gov.in/sites/default/files/iit-roorkee-academic-session-2024-25.pdf" },
        { name: "Grace's Guide: Roorkee College", url: "https://gracesguide.co.uk/Roorkee_College" },
      ], note: "Some listing sites wrongly show 2001, the year it became an IIT." },
      { field: "website", value: "https://www.iitr.ac.in", sources: [{ name: "WHED: IIT Roorkee", url: "https://whed.net/institutions/IAU-007788" }] },
      { field: "location", value: "Roorkee", sources: [{ name: "WHED: IIT Roorkee", url: "https://whed.net/institutions/IAU-007788" }], note: "Haridwar Highway, Roorkee, PIN 247667." },
      { field: "district", value: "Haridwar", sources: [{ name: "Central Water Commission (gov.in): IIT Roorkee academic session notice", url: "https://cwc.gov.in/sites/default/files/iit-roorkee-academic-session-2024-25.pdf" }] },
    ],
  },
  {
    id: "nit-uttarakhand",
    create: {
      id: "nit-uttarakhand",
      name: "National Institute of Technology Uttarakhand",
      shortName: "NIT Uttarakhand",
      type: "engineering",
      ownership: "government",
      location: "Srinagar (Garhwal)",
      district: "Pauri Garhwal",
      website: "https://www.nituk.ac.in",
      established: 2009,
      description:
        "NIT Uttarakhand was established in 2009 under an Act of Parliament and is an Institute of National Importance. It currently runs from a temporary campus at the Government Polytechnic in Srinagar (Garhwal); a permanent campus is planned at Sumari.",
    },
    facts: [
      { field: "established", value: 2009, sources: [
        { name: "Ministry of Education: NIT Uttarakhand compendium entry (gov.in)", url: "https://education.gov.in/sites/upload_files/mhrd/files/ebook/universirt-compendium/uttrakhand/National-Institute-of-Technology-Uttarakhand.pdf" },
        { name: "NIT Uttarakhand: official event brochure", url: "https://nituk.ac.in/oldwebsite/teqip3/office orders/events/Smart Materials.pdf" },
      ] },
      { field: "website", value: "https://www.nituk.ac.in", sources: [{ name: "NIT Uttarakhand: official admission notice", url: "https://www.nituk.ac.in/uploads/topics/16910639862705.pdf" }] },
      { field: "location", value: "Srinagar (Garhwal)", sources: [{ name: "NIT Uttarakhand: About NITUK (official)", url: "https://nituk.ac.in/oldwebsite/aboutnituk.php" }], note: "Temporary campus at the Government Polytechnic; PIN 246174." },
      { field: "district", value: "Pauri Garhwal", sources: [{ name: "NIT Uttarakhand: official admission notice", url: "https://www.nituk.ac.in/uploads/topics/16905438715667.pdf" }] },
    ],
  },
];

/** Values in the existing data that conflict with what the research found or could not be confirmed. */
export const corrections: Correction[] = [
  { collegeId: "aiims-rishikesh", field: "affiliation", from: "AIIMS, MCI", to: null,
    reason: "The Medical Council of India was replaced by the National Medical Commission in 2020. Add the correct body after checking the official site." },
  { collegeId: "aiims-rishikesh", field: "accreditation", from: "NAAC A+", to: null,
    reason: "Could not be confirmed on any official source during research, so it is hidden until an admin verifies it." },
  { collegeId: "aiims-rishikesh", field: "contactPhone", from: "0135-2462170", to: "0135-2462932",
    reason: "The official 2026 MBBS reporting guidelines list this number for admission queries." },
  { collegeId: "aiims-rishikesh", field: "contactEmail", from: "director@aiimsrishikesh.edu.in", to: "mbbs.admission@aiimsrishikesh.edu.in",
    reason: "The official 2026 MBBS reporting guidelines list this address for admission queries." },
];

/** Course-level problems found in the seed data. These need an admin to fix in the course editor. */
export const courseIssues = [
  { collegeId: "aiims-rishikesh", course: "MBBS", issue: "Fee ₹16,000/yr is not supported. Listing sites show ₹5,000 to ₹7,000 a year and disagree with each other; the official fee annexure could not be read. Leave blank until confirmed." },
  { collegeId: "aiims-rishikesh", course: "MBBS", issue: "Eligibility 'NEET UG 50%' is incomplete. The official notice says admission is through NEET UG and MCC counselling." },
  { collegeId: "aiims-rishikesh", course: "B.Sc. Nursing", issue: "Seats 60 conflicts with a listing site showing 100. Confirm on the official site." },
  { collegeId: "aiims-rishikesh", course: "MD/MS", issue: "Seats 60 and fee ₹20,000 are unsupported. PG admission is through the national INI-CET exam." },
];
