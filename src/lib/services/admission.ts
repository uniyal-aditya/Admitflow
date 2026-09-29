// ─────────────────────────────────────────────────────────────────────────
// Admission service layer (Phase 2)
//
// Single server-side gateway to the normalized admission domain tables
// (Phase 1). UI pages must never query Prisma directly — they call these
// functions. Adapters below map normalized rows onto the existing UI view
// models (@/types) so Phase 6's redesign can change presentation without
// touching data access.
//
// Facts come from the DB (seeded losslessly from src/data by
// scripts/migrate-seed.ts). Missing facts stay null/undefined — nothing is
// invented here.
// ─────────────────────────────────────────────────────────────────────────

import { prisma } from "@/lib/db/prisma";
import { deriveNoticeStatus, deriveTimelineStages, deriveCurrentStage } from "@/lib/services/deadline";
import type {
  College,
  Course,
  Notice,
  TimelineData,
  TimelineStage,
  CollegeType,
  Ownership,
} from "@/types";

// ─── Colleges ────────────────────────────────────────────────────────────

/** Reconstruct the legacy `courses` view model from normalized offerings. */
function offeringsToCourses(
  offerings: {
    program: { name: string };
    branch: { name: string } | null;
    durationLabel: string | null;
    totalSeats: number | null;
    eligibility: string | null;
    fees: { amountPaise: number }[];
  }[],
): Course[] {
  return offerings.map((o) => ({
    name: o.branch ? `${o.program.name} ${o.branch.name}` : o.program.name,
    duration: o.durationLabel ?? "",
    seats: o.totalSeats ?? 0,
    // fees are stored in paise (per_year tuition); UI expects ₹ integer
    fees: o.fees[0] ? Math.round(o.fees[0].amountPaise / 100) : 0,
    eligibility: o.eligibility ?? "",
  }));
}

export function collegeRowToViewModel(
  row: {
    id: string;
    name: string;
    shortName: string;
    type: string;
    ownership: string;
    location: string;
    district: string;
    website: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    description: string | null;
    established: number | null;
    accreditation: string | null;
    affiliation: string | null;
    principal: string | null;
    imageUrl: string | null;
    _count?: { offerings: number };
  },
  courses: Course[],
): College {
  return {
    id: row.id,
    name: row.name,
    shortName: row.shortName,
    type: row.type as CollegeType,
    ownership: row.ownership as Ownership,
    location: row.location,
    district: row.district,
    website: row.website ?? "",
    // Pattern-generated admission portals were dropped in Phase 1 (never
    // invented); the view model keeps the field so legacy UI compiles, but it
    // stays empty until an admin verifies a real portal URL.
    admissionPortal: "",
    contact: row.contactPhone || row.contactEmail
      ? { phone: row.contactPhone ?? "", email: row.contactEmail ?? "" }
      : undefined,
    courses,
    imageUrl: row.imageUrl ?? undefined,
    description: row.description ?? "",
    established: row.established ?? 0,
    accreditation: row.accreditation ?? undefined,
    affiliation: row.affiliation ?? undefined,
    principal: row.principal ?? undefined,
  };
}

export const collegeInclude = {
  offerings: {
    include: {
      program: { select: { name: true } },
      branch: { select: { name: true } },
      fees: { select: { amountPaise: true } },
    },
  },
} as const;

export async function getColleges(): Promise<College[]> {
  const rows = await prisma.college.findMany({
    orderBy: { name: "asc" },
    include: collegeInclude,
  });
  return rows.map((r) => collegeRowToViewModel(r, offeringsToCourses(r.offerings)));
}

export async function getCollegeById(id: string): Promise<College | null> {
  const row = await prisma.college.findUnique({
    where: { id },
    include: collegeInclude,
  });
  if (!row) return null;
  return collegeRowToViewModel(row, offeringsToCourses(row.offerings));
}

export async function getDistricts(): Promise<string[]> {
  const rows = await prisma.college.findMany({
    select: { district: true },
    distinct: ["district"],
    orderBy: { district: "asc" },
  });
  return rows.map((r) => r.district);
}

// ─── Notices ─────────────────────────────────────────────────────────────

function isoDate(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

/**
 * Canonical AdmissionNotice → legacy Notice view model.
 * - `lastDate` is derived as the latest deadline date on the notice (the
 *   normalized model stores structured dates instead of a scalar lastDate).
 * - `status` is time-derived by the Phase 4 deadline engine at request time;
 *   it is authoritative (the UI no longer re-derives it).
 */
export function noticeRowToViewModel(row: {
  id: string;
  collegeId: string | null;
  title: string;
  type: string;
  publishedAt: Date | null;
  summary: string | null;
  pdfUrl: string | null;
  officialUrl: string | null;
  documentsRequired: string[];
  dates: { kind: string; label: string; date: Date }[];
}): Notice {
  const deadlines = row.dates
    .filter((d) => d.kind === "deadline")
    .map((d) => ({ label: d.label, date: isoDate(d.date) }));
  const importantDates = row.dates
    .filter((d) => d.kind === "important_date")
    .map((d) => ({ label: d.label, date: isoDate(d.date) }));
  const lastDate = deadlines.length
    ? deadlines.map((d) => d.date).sort().at(-1)!
    : undefined;
  return {
    id: row.id,
    collegeId: row.collegeId ?? "",
    title: row.title,
    type: row.type as Notice["type"],
    publishedDate: isoDate(row.publishedAt),
    lastDate,
    status: deriveNoticeStatus(row.publishedAt, lastDate),
    summary: row.summary ?? "",
    highlights: [],
    pdfUrl: row.pdfUrl ?? "",
    sourceUrl: row.officialUrl ?? "",
    coursesAffected: [],
    branchesAffected: [],
    deadlines,
    documentsRequired: row.documentsRequired,
    eligibility: "",
    importantDates,
    relatedNoticeIds: [],
  };
}

export const noticeInclude = {
  dates: { select: { kind: true, label: true, date: true }, orderBy: { date: "asc" as const } },
} as const;

export async function getNotices(): Promise<Notice[]> {
  const rows = await prisma.admissionNotice.findMany({
    orderBy: { publishedAt: "desc" },
    include: noticeInclude,
  });
  return rows.map(noticeRowToViewModel);
}

export async function getNoticesByCollege(collegeId: string): Promise<Notice[]> {
  const rows = await prisma.admissionNotice.findMany({
    where: { collegeId },
    orderBy: { publishedAt: "desc" },
    include: noticeInclude,
  });
  return rows.map(noticeRowToViewModel);
}

export async function getNoticeById(id: string): Promise<Notice | null> {
  const row = await prisma.admissionNotice.findUnique({
    where: { id },
    include: noticeInclude,
  });
  return row ? noticeRowToViewModel(row) : null;
}

// ─── Timeline ────────────────────────────────────────────────────────────

/**
 * LegacyTimelineStage rows → TimelineData view model. Raw stage keys and
 * statuses are preserved losslessly by the seeder; stage statuses are
 * re-derived from dates at request time by the Phase 4 deadline engine
 * (a dataset "current" marker still wins as an override).
 */
export async function getTimeline(collegeId: string): Promise<TimelineData | undefined> {
  const rows = await prisma.legacyTimelineStage.findMany({
    where: { collegeId },
    orderBy: { sortOrder: "asc" },
  });
  if (rows.length === 0) return undefined;
  const raw = rows.map((s) => ({
    stage: s.rawStageKey as TimelineStage,
    label: s.label,
    date: s.date ? isoDate(s.date) : undefined,
    status: s.rawStatus ?? "upcoming",
    description: s.description ?? undefined,
  }));
  const stages = deriveTimelineStages(raw);
  const currentStage = deriveCurrentStage(stages, stages.at(-1)!.stage) as TimelineStage;
  return { currentStage, stages };
}

// ─── Aggregates for pages ────────────────────────────────────────────────

export interface CollegeDetailPayload {
  college: College;
  notices: Notice[];
  timeline?: TimelineData;
}

export async function getCollegeDetail(id: string): Promise<CollegeDetailPayload | null> {
  const college = await getCollegeById(id);
  if (!college) return null;
  const [notices, timeline] = await Promise.all([
    getNoticesByCollege(id),
    getTimeline(id),
  ]);
  return { college, notices, timeline };
}
