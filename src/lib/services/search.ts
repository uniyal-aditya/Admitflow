// ─────────────────────────────────────────────────────────────────────────
// Search & filter engine (Phase 3)
//
// DB-backed search over the normalized domain tables. One implementation is
// shared by /search and /colleges so results cannot drift between pages.
// All filters are enforced server-side via Prisma `where` clauses — filters
// are constraints, not post-hoc array filtering.
//
// Search semantics: case-insensitive substring matching on trimmed input;
// diacritics folded (ü → u) before comparison. Empty/whitespace queries
// return the unfiltered browse view rather than zero rows.
// ─────────────────────────────────────────────────────────────────────────

import { Prisma, type Branch, type Program, type NoticeTypeEnum } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  collegeRowToViewModel,
  collegeInclude,
  noticeRowToViewModel,
  noticeInclude,
} from "@/lib/services/admission";
import type { College, Notice, CollegeType, Ownership } from "@/types";

/** Fold diacritics + lowercase for accent-insensitive matching. */
function normalize(q: string): string {
  return q.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export interface CollegeFilters {
  q?: string;
  type?: CollegeType;
  ownership?: Ownership;
  district?: string;
  /** Match on program/branch names too (normalized tables make this cheap). */
  course?: string;
  limit?: number;
}

export interface CollegeFilterCounts {
  total: number;
  byType: Record<string, number>;
  byOwnership: Record<string, number>;
  byDistrict: Record<string, number>;
}

function collegeWhere(f: CollegeFilters): Prisma.CollegeWhereInput {
  const where: Prisma.CollegeWhereInput = {};
  const q = f.q ? normalize(f.q) : "";
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { shortName: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
      { district: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { affiliation: { contains: q, mode: "insensitive" } },
      // Course-level search across the normalized offerings.
      {
        offerings: {
          some: {
            OR: [
              { program: { name: { contains: q, mode: "insensitive" } } },
              { branch: { name: { contains: q, mode: "insensitive" } } },
            ],
          },
        },
      },
    ];
  }
  if (f.type) where.type = f.type;
  if (f.ownership) where.ownership = f.ownership;
  if (f.district) where.district = f.district;
  if (f.course) {
    const c = normalize(f.course);
    where.offerings = {
      some: {
        OR: [
          { program: { name: { contains: c, mode: "insensitive" } } },
          { branch: { name: { contains: c, mode: "insensitive" } } },
        ],
      },
    };
  }
  return where;
}

/** Same conversion as the admission service's offeringsToCourses. */
function offeringRowsToCourses(offerings: {
  program: { name: string };
  branch: { name: string } | null;
  durationLabel: string | null;
  totalSeats: number | null;
  eligibility: string | null;
  fees: { amountPaise: number }[];
}[]) {
  return offerings.map((o) => ({
    name: o.branch ? `${o.program.name} ${o.branch.name}` : o.program.name,
    duration: o.durationLabel ?? "",
    seats: o.totalSeats ?? 0,
    fees: o.fees[0] ? Math.round(o.fees[0].amountPaise / 100) : 0,
    eligibility: o.eligibility ?? "",
  }));
}

export async function searchColleges(f: CollegeFilters): Promise<College[]> {
  const rows = await prisma.college.findMany({
    where: collegeWhere(f),
    orderBy: { name: "asc" },
    take: f.limit,
    include: collegeInclude,
  });
  return rows.map((r) => collegeRowToViewModel(r, offeringRowsToCourses(r.offerings)));
}

export async function countColleges(f: CollegeFilters): Promise<number> {
  return prisma.college.count({ where: collegeWhere(f) });
}

/** Facet counts for the filter UI (counts after q/course, per facet value). */
export async function getCollegeFacets(f: CollegeFilters): Promise<CollegeFilterCounts> {
  const base = collegeWhere(f);
  delete base.type;
  delete base.ownership;
  delete base.district;
  const group = async (field: "type" | "ownership" | "district") => {
    const rows = await prisma.college.groupBy({
      by: [field],
      where: base,
      _count: { _all: true },
    });
    return Object.fromEntries(rows.map((r) => [String(r[field]), r._count._all]));
  };
  const [byType, byOwnership, byDistrict, total] = await Promise.all([
    group("type"),
    group("ownership"),
    group("district"),
    countColleges(f),
  ]);
  return { total, byType, byOwnership, byDistrict };
}

export interface NoticeFilters {
  q?: string;
  type?: string;
  collegeId?: string;
  publishedAfter?: Date;
  publishedBefore?: Date;
  limit?: number;
}

function noticeWhere(f: NoticeFilters): Prisma.AdmissionNoticeWhereInput {
  const where: Prisma.AdmissionNoticeWhereInput = {};
  const q = f.q ? normalize(f.q) : "";
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { summary: { contains: q, mode: "insensitive" } },
      { college: { name: { contains: q, mode: "insensitive" } } },
      { college: { shortName: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (f.type) where.type = f.type as NoticeTypeEnum;
  if (f.collegeId) where.collegeId = f.collegeId;
  if (f.publishedAfter || f.publishedBefore) {
    where.publishedAt = {};
    if (f.publishedAfter) where.publishedAt.gte = f.publishedAfter;
    if (f.publishedBefore) where.publishedAt.lte = f.publishedBefore;
  }
  return where;
}

export async function searchNotices(f: NoticeFilters): Promise<Notice[]> {
  const rows = await prisma.admissionNotice.findMany({
    where: noticeWhere(f),
    orderBy: { publishedAt: "desc" },
    take: f.limit,
    include: noticeInclude,
  });
  return rows.map(noticeRowToViewModel);
}

export async function countNotices(f: NoticeFilters): Promise<number> {
  return prisma.admissionNotice.count({ where: noticeWhere(f) });
}

/** Programs + branches for search suggestion chips. */
export async function getSearchSuggestions(): Promise<{
  programs: Pick<Program, "id" | "name">[];
  branches: Pick<Branch, "id" | "name">[];
}> {
  const [programs, branches] = await Promise.all([
    prisma.program.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.branch.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  return { programs, branches };
}
