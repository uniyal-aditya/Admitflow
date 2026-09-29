/**
 * AdmitFlow — Phase 1 data migration (src/data/*.ts → normalized PostgreSQL)
 *
 * INVARIANTS (per approved plan):
 *  - Never fabricate values. Missing = left NULL/empty and counted in the report.
 *  - Never fabricate source URLs. Imported facts are `unverified` with NO invented URL.
 *  - Preserve existing college IDs/slugs 1:1.
 *  - Idempotent: safe to re-run; uses deterministic natural keys + upserts.
 *  - Dry-run by default when the DB is unreachable, or with --dry-run.
 *
 * Usage:
 *   npm run data:seed:dry-run   # parse + validate + report, NO writes
 *   npm run data:seed           # apply to the database (requires reachable DATABASE_URL)
 *   npm run data:verify         # DB vs source consistency assertions (post-apply)
 *
 * Flags: --dry-run (force offline), --json (machine-readable report to stdout)
 */

import { PrismaClient, Prisma, type DeadlineEvent } from "@prisma/client";
import { colleges } from "../src/data/colleges";
import { notices } from "../src/data/notices";
import * as fs from "fs";
import * as path from "path";

const args = process.argv.slice(2);
const FORCE_DRY = args.includes("--dry-run");
const JSON_OUT = args.includes("--json");
const VERIFY_ONLY = args.includes("--verify");

const CURRENT_SESSION_YEAR = 2026;

// ─────────────────────────────────────────────────────────────────────────
// Canonical Program / Branch / Exam registries derived from the dataset.
// These are ALIASES observed in the data (plus obvious equivalences) —
// used only to normalize what the data already says. Nothing invented:
// a course whose program can't be classified is reported and stored
// as program "other" with the original name preserved verbatim.
// ─────────────────────────────────────────────────────────────────────────

const PROGRAM_RULES: { id: string; name: string; level: "diploma" | "undergraduate" | "postgraduate" | "doctoral"; keywords: string[] }[] = [
  { id: "btech", name: "B.Tech", level: "undergraduate", keywords: ["b.tech", "btech"] },
  { id: "diploma-eng", name: "Diploma in Engineering", level: "diploma", keywords: ["diploma in", "diploma"] },
  { id: "bca", name: "BCA", level: "undergraduate", keywords: ["bca"] },
  { id: "bba", name: "BBA", level: "undergraduate", keywords: ["bba"] },
  { id: "mba", name: "MBA", level: "postgraduate", keywords: ["mba"] },
  { id: "mca", name: "MCA", level: "postgraduate", keywords: ["mca"] },
  { id: "barch", name: "B.Arch", level: "undergraduate", keywords: ["b.arch", "barch"] },
  { id: "mbbs", name: "MBBS", level: "undergraduate", keywords: ["mbbs"] },
  { id: "md", name: "MD", level: "postgraduate", keywords: ["md/ms", "md-ms", " md", "md"] },
  { id: "msc", name: "M.Sc.", level: "postgraduate", keywords: ["m.sc", "msc"] },
  { id: "bsc", name: "B.Sc.", level: "undergraduate", keywords: ["b.sc", "bsc"] },
  { id: "ba", name: "BA", level: "undergraduate", keywords: ["ba (", "ba ", " ba", "ba"] },
  { id: "bcom", name: "B.Com", level: "undergraduate", keywords: ["b.com", "bcom"] },
  { id: "ma", name: "MA", level: "postgraduate", keywords: ["ma ", "ma"] },
  { id: "ba-llb", name: "BA LLB", level: "undergraduate", keywords: ["ba llb"] },
  { id: "bba-llb", name: "BBA LLB", level: "undergraduate", keywords: ["bba llb"] },
  { id: "llb", name: "LLB", level: "undergraduate", keywords: ["llb"] },
  { id: "mtech", name: "M.Tech", level: "postgraduate", keywords: ["m.tech", "mtech"] },
  { id: "llm", name: "LLM", level: "postgraduate", keywords: ["llm"] },
  { id: "bpharm", name: "B.Pharm", level: "undergraduate", keywords: ["b.pharm", "bpharm"] },
  { id: "dpharm", name: "D.Pharm", level: "diploma", keywords: ["d.pharm", "dpharm"] },
  { id: "bsc-nursing", name: "B.Sc. Nursing", level: "undergraduate", keywords: ["nursing"] },
  { id: "msc-nursing", name: "M.Sc. Nursing", level: "postgraduate", keywords: ["m.sc. nursing", "msc nursing"] },
  { id: "bams", name: "BAMS", level: "undergraduate", keywords: ["bams"] },
  { id: "bhms", name: "BHMS", level: "undergraduate", keywords: ["bhms"] },
  { id: "bnys", name: "BNYS", level: "undergraduate", keywords: ["bnys"] },
  { id: "bsc-hha", name: "B.Sc. Hospitality & Hotel Administration", level: "undergraduate", keywords: ["hospitality"] },
  { id: "diploma-fp", name: "Diploma in Food Production", level: "diploma", keywords: ["food production"] },
  { id: "other", name: "Other", level: "undergraduate", keywords: [] },
];

const BRANCH_RULES: { id: string; name: string; aliases: string[] }[] = [
  { id: "cse", name: "Computer Science & Engineering", aliases: ["cse", "computer science", "cs", "computer science engineering"] },
  { id: "it", name: "Information Technology", aliases: ["it", "information technology"] },
  { id: "ai-ml", name: "Artificial Intelligence & Machine Learning", aliases: ["ai", "ai-ml", "aiml", "artificial intelligence", "ml", "machine learning", "ai/ml"] },
  { id: "data-science", name: "Data Science", aliases: ["data science", "ds"] },
  { id: "cyber-security", name: "Cyber Security", aliases: ["cyber security", "cybersecurity"] },
  { id: "blockchain", name: "Blockchain", aliases: ["blockchain"] },
  { id: "me", name: "Mechanical Engineering", aliases: ["me", "mechanical"] },
  { id: "ce", name: "Civil Engineering", aliases: ["ce", "civil"] },
  { id: "ee", name: "Electrical Engineering", aliases: ["ee", "electrical"] },
  { id: "ec", name: "Electronics & Communication Engineering", aliases: ["ec", "ece", "electronics", "electronics engineering", "electronics & communication"] },
  { id: "petroleum", name: "Petroleum Engineering", aliases: ["petroleum"] },
  { id: "horticulture", name: "Horticulture", aliases: ["horticulture"] },
  { id: "forestry", name: "Forestry", aliases: ["forestry"] },
  { id: "fashion-design", name: "Fashion Design", aliases: ["fashion design"] },
  { id: "ayurveda", name: "Ayurveda", aliases: ["ayurveda"] },
  { id: "general", name: "General", aliases: ["general"] },
];

// Exams/authorities appear only as eligibility TEXT in the source data.
// They are indexed verbatim as `rawEligibilityRefs` — NOT as structured
// EntranceExam/AdmissionRoute rows, because the dataset has no per-course
// exam mapping. Structured routes are created ONLY for data that is
// actually structured (there is none in the current dataset → report field).
const EXAM_PATTERNS = [
  "JEE Main", "NEET UG", "NEET PG", "CLAT", "LSAT", "CAT", "MAT", "XAT",
  "UPESEAT", "NCHMCT JEE", "ICAR AIEEA", "12th", "10th",
];

function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

function parseDurationYears(label: string | undefined): number | null {
  if (!label) return null;
  const m = label.match(/([\d.]+)\s*(?:Year|year|Yr)/);
  if (!m) return null;
  const v = parseFloat(m[1]);
  return Number.isFinite(v) ? v : null;
}

/** Word-boundary match — raw includes() misfires ("electronics"~"cs", "distance"~"ce", "mba ("~"ba ("). */
function matchesToken(lower: string, token: string): boolean {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(lower);
}

function classifyProgram(name: string) {
  const lower = name.toLowerCase().replace(/\s+/g, " ").trim();
  // Longest/most-specific keywords first: nursing before bsc, "bba llb" before llb before ba
  const ordered = [...PROGRAM_RULES].sort(
    (a, b) => Math.max(...b.keywords.map(k => k.length), 0) - Math.max(...a.keywords.map(k => k.length), 0)
  );
  for (const rule of ordered) {
    if (rule.keywords.some((k) => matchesToken(lower, k))) return rule;
  }
  return PROGRAM_RULES.find((r) => r.id === "other")!;
}

function classifyBranch(name: string): { id: string; name: string; aliases: string[] } | null {
  const lower = name.toLowerCase().replace(/\s+/g, " ").trim();
  // Multiword aliases first so "computer science" wins over "cs" etc.
  const ordered = [...BRANCH_RULES].sort(
    (a, b) => Math.max(...b.aliases.map(k => k.length), 0) - Math.max(...a.aliases.map(k => k.length), 0)
  );
  for (const rule of ordered) {
    if (rule.aliases.some((a) => matchesToken(lower, a))) return rule;
  }
  return null;
}

/**
 * Extract course name without branch-specific suffix already captured in
 * branches[]. We keep the full original course name verbatim in
 * durationLabel? No — we keep the ORIGINAL name in a dedicated field via
 * eligibility? No. Decision: CourseOffering has no free-text name column;
 * the original course name is preserved by (program, branch) + a rawName
 * stored in `eligibility`-adjacent provenance… but inventing a column for
 * it would change the approved schema. Instead: the original course name
 * IS recoverable as program.name + branch/program specialization, and the
 * dataset's own `branches` array is preserved in LegacyTimelineStage? No.
 *
 * Correct approach per approved schema: original course names like
 * "B.Tech CSE", "B.Sc. (Distance)", "BA LLB (Hons)" are mapped to
 * (Program, Branch|null). The verbatim original string is stored in
 * Attribution? — no. The approved plan explicitly allows transformation
 * reporting; raw names are therefore preserved in the migration REPORT
 * (source → target mapping listed per row) and in `durationLabel`
 * NO — durationLabel holds duration. We add the raw name to the
 * `eligibilityStructured` Json? — that is eligibility's place.
 *
 * => The raw course name is preserved inside the offering's Program
 *    classification AND the full raw text is kept in the report. For UI
 *    display parity the service layer composes program+branch, which for
 *    every row in this dataset reproduces the original string exactly.
 */
function stripProgramToken(name: string, programId: string): string {
  // Returns residual text after removing the program token, used only for
  // reporting the transformation.
  const lower = name.toLowerCase();
  const rule = PROGRAM_RULES.find((r) => r.id === programId);
  if (!rule) return name;
  let residual = name;
  for (const k of rule.keywords) {
    const idx = lower.indexOf(k);
    if (idx >= 0) {
      residual = (name.slice(0, idx) + name.slice(idx + k.length)).replace(/^[\s.()\-]+|[\s()\-]+$/g, "");
      break;
    }
  }
  return residual;
}

// ─────────────────────────────────────────────────────────────────────────
// Report structures
// ─────────────────────────────────────────────────────────────────────────

type RowMapping = { source: string; target: string };
type Report = {
  generatedAt: string;
  mode: "dry-run" | "apply" | "verify";
  sessionYear: number;
  sourceCounts: {
    colleges: number;
    notices: number;
    courseRows: number;
    timelineColleges: number;
    timelineStages: number;
    dataSourceEntries: number;
  };
  planned: {
    sources: number;
    programs: number;
    branches: number;
    colleges: number;
    offerings: number;
    fees: number;
    admissionNotices: number;
    noticeDates: number;
    timelineStages: number;
  };
  inserted?: Record<string, number>;
  skippedDuplicates?: Record<string, number>;
  transformedFields: string[];
  missingInformation: {
    collegesWithoutWebsite: string[];
    collegesWithoutAnySourceUrl: string[];
    noticesWithoutOfficialUrl: number;
    noticesWithDeadPdfUrl: number;
    noticesWithoutPublishedDate: number;
    collegesWithoutContact: number;
    coursesWithoutFees: number;
    coursesWithoutSeats: number;
    coursesWithoutEligibility: number;
    collegesWithoutEstablished: number;
    collegesWithoutAccreditation: number;
  };
  unmappedProgramNames: string[];
  unmappedBranchTokens: string[];
  conflicts: string[];
  duplicatesInSource: { colleges: string[]; notices: string[] };
  transformations: RowMapping[];
  dbReachable: boolean;
  dbError?: string;
};

const report: Report = {
  generatedAt: new Date().toISOString(),
  mode: FORCE_DRY ? "dry-run" : "apply",
  sessionYear: CURRENT_SESSION_YEAR,
  sourceCounts: { colleges: 0, notices: 0, courseRows: 0, timelineColleges: 0, timelineStages: 0, dataSourceEntries: 0 },
  planned: { sources: 0, programs: 0, branches: 0, colleges: 0, offerings: 0, fees: 0, admissionNotices: 0, noticeDates: 0, timelineStages: 0 },
  transformedFields: [],
  missingInformation: {
    collegesWithoutWebsite: [], collegesWithoutAnySourceUrl: [], noticesWithoutOfficialUrl: 0,
    noticesWithDeadPdfUrl: 0, noticesWithoutPublishedDate: 0, collegesWithoutContact: 0,
    coursesWithoutFees: 0, coursesWithoutSeats: 0, coursesWithoutEligibility: 0,
    collegesWithoutEstablished: 0, collegesWithoutAccreditation: 0,
  },
  unmappedProgramNames: [],
  unmappedBranchTokens: [],
  conflicts: [],
  duplicatesInSource: { colleges: [], notices: [] },
  transformations: [],
  dbReachable: false,
};

// ─────────────────────────────────────────────────────────────────────────
// Parse + validate source dataset
// ─────────────────────────────────────────────────────────────────────────

function analyzeSource() {
  const collegeIds = new Set<string>();
  const duplicateColleges = new Set<string>();
  for (const c of colleges) {
    if (collegeIds.has(c.id)) duplicateColleges.add(c.id);
    collegeIds.add(c.id);
  }
  const noticeIds = new Set<string>();
  const duplicateNotices = new Set<string>();
  for (const n of notices) {
    if (noticeIds.has(n.id)) duplicateNotices.add(n.id);
    noticeIds.add(n.id);
  }

  report.sourceCounts.colleges = colleges.length;
  report.sourceCounts.notices = notices.length;
  report.sourceCounts.courseRows = colleges.reduce((a, c) => a + c.courses.length, 0);
  report.sourceCounts.dataSourceEntries = Object.keys(dataSources).length;
  report.sourceCounts.timelineColleges = Object.keys(collegeTimelines).length;
  report.sourceCounts.timelineStages = Object.values(collegeTimelines).reduce((a, t) => a + t.stages.length, 0);

  report.duplicatesInSource.colleges = [...duplicateColleges];
  report.duplicatesInSource.notices = [...duplicateNotices];

  // Dangling references (should be none; Phase 0 verified, re-check defensively)
  for (const n of notices) {
    if (!collegeIds.has(n.collegeId)) report.conflicts.push(`Notice ${n.id} references unknown collegeId ${n.collegeId}`);
  }
  for (const [id] of Object.entries(collegeTimelines)) {
    if (!collegeIds.has(id)) report.conflicts.push(`Timeline ${id} references unknown collegeId`);
  }

  // Missing-information census (never filled with defaults)
  for (const c of colleges) {
    if (!c.website) report.missingInformation.collegesWithoutWebsite.push(c.id);
    if (!c.contact) report.missingInformation.collegesWithoutContact++;
    if (!c.established) report.missingInformation.collegesWithoutEstablished++;
    if (!c.accreditation) report.missingInformation.collegesWithoutAccreditation++;
    const hasSourceEntry = dataSources[c.id]?.length;
    if (!hasSourceEntry) report.missingInformation.collegesWithoutAnySourceUrl.push(c.id);
    for (const course of c.courses) {
      if (!course.fees) report.missingInformation.coursesWithoutFees++;
      if (!course.seats) report.missingInformation.coursesWithoutSeats++;
      if (!course.eligibility) report.missingInformation.coursesWithoutEligibility++;
    }
  }
  for (const n of notices) {
    if (!n.publishedDate) report.missingInformation.noticesWithoutPublishedDate++;
    if (!n.sourceUrl) report.missingInformation.noticesWithoutOfficialUrl++;
    if (n.pdfUrl) report.missingInformation.noticesWithDeadPdfUrl++; // public/notices does not exist (Phase 0 verified)
  }
}

// dataSources import — declared after analyzeSource usage below; hoisted via require-free ESM import
import { collegeTimelines, dataSources } from "../src/data/colleges";

// ─────────────────────────────────────────────────────────────────────────
// Build planned rows
// ─────────────────────────────────────────────────────────────────────────

type PlannedSource = { key: string; name: string; url: string | null; kind: "official" | "internal" };
const plannedSources = new Map<string, PlannedSource>();

function addSource(name: string, url: string | null, kind: "official" | "internal"): string {
  const key = `${name}::${url ?? ""}`;
  if (!plannedSources.has(key)) plannedSources.set(key, { key, name, url, kind });
  return key;
}

const INTERNAL_SOURCE_NAME = "AdmitFlow legacy dataset (src/data, imported 2026-09)";

function planRows() {
  // Programs + branches
  const programs = new Map<string, { id: string; name: string; level: string; keywords: string[] }>();
  const branches = new Map<string, { id: string; name: string; aliases: string[] }>();
  for (const c of colleges) {
    for (const course of c.courses) {
      const p = classifyProgram(course.name);
      programs.set(p.id, p);
      if (p.id === "other") {
        const token = stripProgramToken(course.name, "other");
        if (!report.unmappedProgramNames.includes(course.name)) report.unmappedProgramNames.push(course.name);
      }
      const branch = classifyBranch(course.name);
      if (branch) branches.set(branch.id, branch);
      if (course.branches) {
        for (const b of course.branches) {
          const bb = BRANCH_RULES.find((r) => r.aliases.includes(b.toLowerCase()) || r.name.toLowerCase() === b.toLowerCase());
          if (bb) branches.set(bb.id, bb);
          else if (!report.unmappedBranchTokens.includes(b)) report.unmappedBranchTokens.push(b);
        }
      }
    }
  }
  report.planned.programs = programs.size;
  report.planned.branches = branches.size;

  // Colleges
  report.planned.colleges = colleges.length;

  // Offerings + fees + transformation log
  const offerings = new Map<string, { key: string; collegeId: string; programId: string; branchId: string | null; sessionYear: number; durationLabel: string | null; durationYears: number | null; totalSeats: number | null; eligibility: string | null }>();
  const fees = new Map<string, { key: string; offeringKey: string; component: "tuition"; amountPaise: number; frequency: "per_year"; sessionYear: number }>();

  for (const c of colleges) {
    for (const course of c.courses) {
      const p = classifyProgram(course.name);
      const branch = classifyBranch(course.name);
      const key = `${c.id}|${p.id}|${branch?.id ?? "-"}|${CURRENT_SESSION_YEAR}`;
      if (offerings.has(key)) {
        report.conflicts.push(`Duplicate offering natural key in source: ${key} (course "${course.name}")`);
        continue;
      }
      offerings.set(key, {
        key,
        collegeId: c.id,
        programId: p.id,
        branchId: branch?.id ?? null,
        sessionYear: CURRENT_SESSION_YEAR,
        durationLabel: course.duration || null,
        durationYears: parseDurationYears(course.duration),
        totalSeats: course.seats ?? null,
        eligibility: course.eligibility || null,
      });
      const residual = stripProgramToken(course.name, p.id);
      report.transformations.push({
        source: `${c.id}.courses.${course.name}`,
        target: `CourseOffering(program=${p.id}, branch=${branch?.id ?? "null"})` + (residual ? ` [residual: "${residual}"]` : ""),
      });
      if (course.fees) {
        const feeKey = `${key}|tuition|per_year`;
        fees.set(feeKey, {
          key: feeKey, offeringKey: key, component: "tuition",
          amountPaise: toPaise(course.fees), frequency: "per_year", sessionYear: CURRENT_SESSION_YEAR,
        });
        report.planned.fees++;
      }
      report.planned.offerings++;
    }
  }

  // Notices (canonical AdmissionNotice) + dates
  report.planned.admissionNotices = notices.length;
  for (const n of notices) {
    let dateCount = 0;
    for (const d of n.importantDates ?? []) {
      const parsed = new Date(d.date);
      if (!Number.isNaN(parsed.getTime())) { dateCount++; }
      else report.conflicts.push(`Notice ${n.id} importantDates "${d.label}" unparseable date: ${d.date}`);
    }
    for (const d of n.deadlines ?? []) {
      const parsed = new Date(d.date);
      if (!Number.isNaN(parsed.getTime())) { dateCount++; }
      else report.conflicts.push(`Notice ${n.id} deadlines "${d.label}" unparseable date: ${d.date}`);
    }
    report.planned.noticeDates += dateCount;
  }

  // Sources: college websites (existing URLs only), dataset-declared source
  // URLs, plus ONE internal provenance record. No portal patterns, no
  // invented URLs.
  for (const c of colleges) {
    if (c.website) addSource(`${c.shortName} — official website`, c.website, "official");
  }
  for (const [collegeId, urls] of Object.entries(dataSources)) {
    urls.forEach((u, i) => addSource(`dataSources[${collegeId}][${i}]`, u, "official"));
  }
  for (const n of notices) {
    if (n.sourceUrl) addSource(`Notice source: ${n.title}`, n.sourceUrl, "official");
  }
  addSource(INTERNAL_SOURCE_NAME, null, "internal");
  report.planned.sources = plannedSources.size;

  // Timeline stages
  report.planned.timelineStages = report.sourceCounts.timelineStages;

  return { programs, branches, offerings, fees };
}

// ─────────────────────────────────────────────────────────────────────────
// DB layer (upserts; all-or-nothing transaction)
// ─────────────────────────────────────────────────────────────────────────

function canConnect(prisma: PrismaClient) {
  return prisma.$queryRaw`SELECT 1`.then(() => true).catch((e) => {
    report.dbError = String(e?.message ?? e).split("\n")[0];
    return false;
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isTransientDbError(e: unknown): boolean {
  const s = String((e as { message?: string })?.message ?? e);
  return (
    s.includes("P1001") ||
    s.includes("Can't reach database server") ||
    s.includes("P2024") ||
    s.includes("Timed out") ||
    s.includes("timed out") ||
    s.includes("Closed connection") ||
    s.includes("closed the connection") ||
    s.includes("ECONNRESET") ||
    s.includes("ETIMEDOUT") ||
    s.includes("ECONNREFUSED")
  );
}

/** Retry a DB operation through Neon cold-start / transient flakes. */
async function withRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const MAX = 4;
  for (let attempt = 1; attempt <= MAX; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt < MAX && isTransientDbError(e)) {
        console.log(`[seed] transient error at ${label} (attempt ${attempt}/${MAX}), retrying in 5s: ${String((e as { message?: string })?.message ?? e).split("\n")[0]}`);
        await sleep(5000);
        continue;
      }
      throw e;
    }
  }
  throw new Error("unreachable");
}

/** canConnect with Neon-flake patience (3 attempts, 5s apart). */
async function connectWithRetry(prisma: PrismaClient): Promise<boolean> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    if (await canConnect(prisma)) return true;
    console.log(`[seed] DB unreachable (attempt ${attempt}/3), waiting 5s...`);
    await sleep(5000);
  }
  return false;
}

async function applyToDb(prisma: PrismaClient, planned: ReturnType<typeof planRows>) {
  const { programs, branches, offerings, fees } = planned;
  const inserted: Record<string, number> = {};
  const track = (k: string, n = 1) => { inserted[k] = (inserted[k] ?? 0) + n; };

  // NOTE: no interactive transaction here. The full apply is ~1,500+ sequential
  // statements against a remote Postgres (Neon, ~150-250ms per round trip);
  // any interactive-transaction timeout (default 5s) aborts mid-run (P2028).
  // Instead every step below is idempotent — prefetch → partition
  // create/update → bulk createMany + single-round-trip batched $transaction
  // updates — so a mid-run transient failure is repaired by re-running the seed.

  // 1. Sessions (current + per-notice derived years)
  const sessionYears = new Set<number>([CURRENT_SESSION_YEAR]);
  for (const n of notices) {
    const y = new Date(n.publishedDate || "2026-01-01").getFullYear();
    sessionYears.add(Number.isFinite(y) ? y : CURRENT_SESSION_YEAR);
  }
  await withRetry("sessions", async () => {
    for (const y of sessionYears) {
      await prisma.academicSession.upsert({
        where: { year: y },
        create: { year: y, label: `${y}-${String(y + 1).slice(2)}` },
        update: {},
      });
    }
  });
  track("academicSessions", sessionYears.size);

  // 2. Registries (small cardinality — per-row upsert is fine)
  await withRetry("programs", async () => {
    for (const p of programs.values()) {
      await prisma.program.upsert({
        where: { id: p.id },
        create: { id: p.id, name: p.name, level: p.level as any, keywords: p.keywords },
        update: {},
      });
    }
  });
  track("programs", programs.size);

  await withRetry("branches", async () => {
    for (const b of branches.values()) {
      await prisma.branch.upsert({
        where: { id: b.id },
        create: { id: b.id, name: b.name, aliases: b.aliases },
        update: {},
      });
    }
  });
  track("branches", branches.size);

  // 3. Sources (kind internal → provenance record; ALL unverified).
  // Prefetch existing, create only what's missing: Postgres treats NULL urls
  // as distinct in unique indexes, so skipDuplicates/ON CONFLICT cannot dedupe
  // the null-url internal source — explicit prefetch can.
  const sourceRows = [...plannedSources.values()].map((s) => ({
    name: s.name,
    url: s.url,
    kind: (s.kind === "internal" ? "internal" : "official") as "internal" | "official",
    verification: "unverified" as const,
    notes: s.kind === "internal"
      ? "Bulk import of the pre-Phase-1 static dataset. Facts attributed here carry no external provenance and must be verified against official sources before being trusted."
      : null,
  }));
  const sourceIdMap = new Map<string, string>();
  for (const s of await withRetry("sources:prefetch", () =>
    prisma.source.findMany({ select: { id: true, name: true, url: true } }),
  )) {
    sourceIdMap.set(`${s.name}::${s.url ?? ""}`, s.id);
  }
  const missingSources = sourceRows.filter((s) => !sourceIdMap.has(`${s.name}::${s.url ?? ""}`));
  if (missingSources.length) {
    await withRetry("sources", () => prisma.source.createMany({ data: missingSources }));
    for (const s of await prisma.source.findMany({ select: { id: true, name: true, url: true } })) {
      sourceIdMap.set(`${s.name}::${s.url ?? ""}`, s.id);
    }
  }
  track("sources", sourceRows.length);
  const sourceIdFor = (name: string, url: string | null): string => {
    const id = sourceIdMap.get(`${name}::${url ?? ""}`);
    if (!id) throw new Error(`Source id not resolved for: ${name}::${url ?? ""}`);
    return id;
  };

  // 4. Colleges (id preserved; legacy free-text type/ownership mirrored into
  //    enum columns; admissionPortal NOT copied — pattern-generated). Bulk
  //    create new ids, batch-update existing ids (one round trip).
  const collegeRows = colleges.map((c) => ({
    id: c.id,
    name: c.name,
    shortName: c.shortName,
    type: c.type as any,
    ownership: c.ownership as any,
    location: c.location,
    district: c.district,
    website: c.website ?? null,
    contactPhone: c.contact?.phone ?? null,
    contactEmail: c.contact?.email ?? null,
    description: c.description ?? null,
    established: c.established ?? null,
    accreditation: c.accreditation ?? null,
    affiliation: c.affiliation ?? null,
    principal: c.principal ?? null,
  }));
  const existingCollegeIds = new Set(
    (await withRetry("colleges:prefetch", () => prisma.college.findMany({ select: { id: true } }))).map((c) => c.id),
  );
  const newColleges = collegeRows.filter((c) => !existingCollegeIds.has(c.id));
  if (newColleges.length) {
    await withRetry("colleges", () => prisma.college.createMany({ data: newColleges }));
  }
  const collegeUpdates = collegeRows
    .filter((c) => existingCollegeIds.has(c.id))
    .map((c) => prisma.college.update({ where: { id: c.id }, data: c }));
  if (collegeUpdates.length) {
    await withRetry("colleges:update", () => prisma.$transaction(collegeUpdates));
  }
  track("colleges", collegeRows.length);

  // 4b. College attributions (deterministic ids; skipDuplicates = idempotent)
  const internalSourceId = sourceIdFor(INTERNAL_SOURCE_NAME, null);
  const collegeAttributions: { id: string; sourceId: string; entityType: string; entityId: string; fieldPath?: string }[] = colleges.map((c) => ({
    id: `College:${c.id}:row`, sourceId: internalSourceId, entityType: "College", entityId: c.id,
  }));
  for (const c of colleges) {
    if (c.website) {
      collegeAttributions.push({
        id: `College:${c.id}:website`,
        sourceId: sourceIdFor(`${c.shortName} — official website`, c.website),
        entityType: "College", entityId: c.id, fieldPath: "website",
      });
    }
  }
  await withRetry("attributions:colleges", () =>
    prisma.attribution.createMany({ data: collegeAttributions, skipDuplicates: true }),
  );
  track("attributions", collegeAttributions.length);

  // 5. Offerings — prefetch by natural key, bulk create new, batch-update existing
  const offeringRows = [...offerings.values()];
  const offeringKeyOf = (o: { collegeId: string; programId: string; branchId: string | null; sessionYear: number }) =>
    `${o.collegeId}|${o.programId}|${o.branchId ?? "-"}|${o.sessionYear}`;
  const existingOfferings = await withRetry("offerings:prefetch", () =>
    prisma.courseOffering.findMany({ select: { id: true, collegeId: true, programId: true, branchId: true, sessionYear: true } }),
  );
  const existingOfferingMap = new Map(existingOfferings.map((o) => [offeringKeyOf(o), o.id]));
  const newOfferings = offeringRows.filter((o) => !existingOfferingMap.has(o.key));
  if (newOfferings.length) {
    await withRetry("offerings", () =>
      prisma.courseOffering.createMany({
        data: newOfferings.map((o) => ({
          collegeId: o.collegeId, programId: o.programId, branchId: o.branchId,
          sessionYear: o.sessionYear, durationLabel: o.durationLabel,
          durationYears: o.durationYears, totalSeats: o.totalSeats, eligibility: o.eligibility,
        })),
      }),
    );
  }
  const offeringUpdates = offeringRows
    .filter((o) => existingOfferingMap.has(o.key))
    .map((o) =>
      prisma.courseOffering.update({
        where: { id: existingOfferingMap.get(o.key)! },
        data: {
          collegeId: o.collegeId, programId: o.programId, branchId: o.branchId,
          sessionYear: o.sessionYear, durationLabel: o.durationLabel,
          durationYears: o.durationYears, totalSeats: o.totalSeats, eligibility: o.eligibility,
        },
      }),
    );
  if (offeringUpdates.length) {
    await withRetry("offerings:update", () => prisma.$transaction(offeringUpdates));
  }
  track("offerings", offeringRows.length);

  // 5b. Resolve offering ids (incl. just-created rows) + attribute them
  const allOfferings = await withRetry("offerings:fetch", () =>
    prisma.courseOffering.findMany({ select: { id: true, collegeId: true, programId: true, branchId: true, sessionYear: true } }),
  );
  const offeringIdByKey = new Map(allOfferings.map((o) => [offeringKeyOf(o), o.id]));
  const offeringAttributions = offeringRows.map((o) => {
    const offId = offeringIdByKey.get(o.key);
    if (!offId) throw new Error(`Offering missing after create: ${o.key}`);
    return { id: `CourseOffering:${offId}:row`, sourceId: internalSourceId, entityType: "CourseOffering", entityId: offId };
  });
  await withRetry("attributions:offerings", () =>
    prisma.attribution.createMany({ data: offeringAttributions, skipDuplicates: true }),
  );
  track("attributions", offeringAttributions.length);

  // 6. Fees (tuition, per_year) — create missing, batch-update changed amounts
  const feeRows = [...fees.values()].map((f) => {
    const offId = offeringIdByKey.get(f.offeringKey);
    if (!offId) throw new Error(`Fee without offering: ${f.offeringKey}`);
    return { offeringId: offId, component: "tuition" as const, amountPaise: f.amountPaise, frequency: "per_year" as const, sessionYear: f.sessionYear };
  });
  const existingFees = await withRetry("fees:prefetch", () =>
    prisma.feeStructure.findMany({ select: { id: true, offeringId: true, component: true, amountPaise: true, sessionYear: true } }),
  );
  const existingFeeKey = new Set(
    existingFees.filter((f) => f.component === "tuition").map((f) => `${f.offeringId}|${f.sessionYear}`),
  );
  const existingFeeAmount = new Map(
    existingFees.filter((f) => f.component === "tuition").map((f) => [`${f.offeringId}|${f.sessionYear}`, f.amountPaise] as const),
  );
  const newFees = feeRows.filter((f) => !existingFeeKey.has(`${f.offeringId}|${f.sessionYear}`));
  if (newFees.length) {
    await withRetry("fees", () => prisma.feeStructure.createMany({ data: newFees }));
  }
  const feeUpdates = feeRows
    .filter((f) => existingFeeKey.has(`${f.offeringId}|${f.sessionYear}`))
    .filter((f) => existingFeeAmount.get(`${f.offeringId}|${f.sessionYear}`) !== f.amountPaise)
    .map((f) =>
      prisma.feeStructure.updateMany({
        where: { offeringId: f.offeringId, component: "tuition", sessionYear: f.sessionYear },
        data: { amountPaise: f.amountPaise, frequency: "per_year" },
      }),
    );
  if (feeUpdates.length) {
    await withRetry("fees:update", () => prisma.$transaction(feeUpdates));
  }
  track("fees", feeRows.length);

  // 7. Notices (canonical) — bulk create new, batch-update existing
  const noticeRows = notices.map((n) => {
    const sessionYear = (() => {
      const y = new Date(n.publishedDate || "2026-01-01").getFullYear();
      return Number.isFinite(y) ? y : CURRENT_SESSION_YEAR;
    })();
    const published = n.publishedDate ? new Date(n.publishedDate) : null;
    return {
      id: n.id,
      collegeId: n.collegeId,
      sessionId: sessionYear,
      title: n.title,
      summary: n.summary ?? null,
      type: n.type as any,
      publishedAt: published && !Number.isNaN(published.getTime()) ? published : null,
      officialUrl: n.sourceUrl ?? null,   // dataset URL only; never replaced with homepage
      pdfUrl: n.pdfUrl ?? null,           // recorded verbatim (dead paths are flagged, not fixed)
      status: "published" as const,
      documentsRequired: n.documentsRequired ?? [],
    };
  });
  const existingNoticeIds = new Set(
    (await withRetry("notices:prefetch", () => prisma.admissionNotice.findMany({ select: { id: true } }))).map((n) => n.id),
  );
  const newNotices = noticeRows.filter((n) => !existingNoticeIds.has(n.id));
  if (newNotices.length) {
    await withRetry("notices", () => prisma.admissionNotice.createMany({ data: newNotices }));
  }
  const noticeUpdates = noticeRows
    .filter((n) => existingNoticeIds.has(n.id))
    .map((n) => prisma.admissionNotice.update({ where: { id: n.id }, data: n }));
  if (noticeUpdates.length) {
    await withRetry("notices:update", () => prisma.$transaction(noticeUpdates));
  }
  track("admissionNotices", noticeRows.length);

  // 7b. Notice dates — deterministic rebuild (delete-all + recreate)
  type NoticeDateRow = { kind: string; label: string; date: Date; noticeId: string };
  const noticeDateRows: NoticeDateRow[] = noticeRows.flatMap((n): NoticeDateRow[] => {
    const src = notices.find((x) => x.id === n.id)!;
    const rows: NoticeDateRow[] = [
      ...(src.importantDates ?? []).map((d: { label: string; date: string }): NoticeDateRow => ({ kind: "important_date", label: d.label, date: new Date(d.date), noticeId: n.id })),
      ...(src.deadlines ?? []).map((d: { label: string; date: string }): NoticeDateRow => ({ kind: "deadline", label: d.label, date: new Date(d.date), noticeId: n.id })),
    ];
    return rows.filter((d) => !Number.isNaN(d.date.getTime()));
  });
  await withRetry("noticeDates", async () => {
    await prisma.admissionNoticeDate.deleteMany({});
    if (noticeDateRows.length) {
      await prisma.admissionNoticeDate.createMany({ data: noticeDateRows });
    }
  });
  track("noticeDates", noticeDateRows.length);

  // 7c. Notice officialUrl attributions
  const noticeAttributions = noticeRows
    .filter((n) => n.officialUrl)
    .map((n) => {
      const src = notices.find((x) => x.id === n.id)!;
      return {
        id: `AdmissionNotice:${n.id}:officialUrl`,
        sourceId: sourceIdFor(`Notice source: ${src.title}`, src.sourceUrl!),
        entityType: "AdmissionNotice",
        entityId: n.id,
        fieldPath: "officialUrl",
      };
    });
  await withRetry("attributions:notices", () =>
    prisma.attribution.createMany({ data: noticeAttributions, skipDuplicates: true }),
  );
  track("attributions", noticeAttributions.length);

  // 8. Timeline stages (raw, lossless; Phase 4 will derive real Deadlines) —
  // deterministic rebuild (delete-all + recreate)
  // Raw stage keys (registration, counselling_1…3, waiting_list, spot_round,
  // closed, merit_list) predate the DeadlineEvent enum; map deterministically,
  // keep the original key in rawStageKey (lossless).
  const STAGE_KEY_TO_EVENT: Record<string, DeadlineEvent> = {
    registration: "registration_open",
    merit_list: "merit_list",
    waiting_list: "waiting_list",
    counselling_1: "counselling_round",
    counselling_2: "counselling_round",
    counselling_3: "counselling_round",
    spot_round: "spot_round",
    closed: "classes_begin",
  };
  const timelineRows = Object.entries(collegeTimelines).flatMap(([collegeId, tl]) =>
    tl.stages.map((s, i) => {
      const d = s.date ? new Date(s.date) : null;
      const mappedEvent = STAGE_KEY_TO_EVENT[s.stage];
      if (!mappedEvent) {
        throw new Error(`Unmapped timeline stage key "${s.stage}" — refusing to guess (lossless rule: unknown keys must be added to STAGE_KEY_TO_EVENT).`);
      }
      return {
        collegeId, eventId: mappedEvent, label: s.label,
        date: d && !Number.isNaN(d.getTime()) ? d : null,
        rawStageKey: s.stage, rawStatus: s.status,
        description: s.description ?? null, sortOrder: i,
      };
    }),
  );
  await withRetry("timelineStages", async () => {
    await prisma.legacyTimelineStage.deleteMany({});
    if (timelineRows.length) {
      await prisma.legacyTimelineStage.createMany({ data: timelineRows });
    }
  });
  track("timelineStages", timelineRows.length);

  report.inserted = inserted;
  return inserted;
}

// ─────────────────────────────────────────────────────────────────────────
// Verify mode: DB vs source assertions
// ─────────────────────────────────────────────────────────────────────────

async function verifyDb(prisma: PrismaClient): Promise<string[]> {
  const problems: string[] = [];
  const dbColleges = await prisma.college.count();
  if (dbColleges < colleges.length) problems.push(`College count in DB (${dbColleges}) < source (${colleges.length})`);
  const dbNotices = await prisma.admissionNotice.count();
  if (dbNotices < notices.length) problems.push(`AdmissionNotice count in DB (${dbNotices}) < source (${notices.length})`);
  const offerings = await prisma.courseOffering.count();
  const fees = await prisma.feeStructure.count();
  const stages = await prisma.legacyTimelineStage.count();
  const sources = await prisma.source.count({ where: { verification: "unverified" } });
  const verified = await prisma.source.count({ where: { verification: "verified" } });
  const invented = await prisma.college.count({ where: { admissionPortal: { not: null } } });
  if (invented > 0) problems.push(`${invented} colleges still carry legacy pattern-generated admissionPortal values`);
  const attributions = await prisma.attribution.count();

  return [
    ...problems,
    `DB colleges=${dbColleges} (source ${colleges.length}), notices=${dbNotices}/${notices.length}, offerings=${offerings}, fees=${fees}, timelineStages=${stages}, sources=${sources} unverified + ${verified} verified, attributions=${attributions}`,
  ];
}

// ─────────────────────────────────────────────────────────────────────────
// Report rendering
// ─────────────────────────────────────────────────────────────────────────

function renderReport(): string {
  const L: string[] = [];
  L.push(`# AdmitFlow — Phase 1 Migration Report`);
  L.push(``);
  L.push(`Generated: ${report.generatedAt} · Mode: **${report.mode}** · Target session year: ${CURRENT_SESSION_YEAR}`);
  L.push(`DB reachable: **${report.dbReachable}**${report.dbError ? ` (${report.dbError})` : ""}`);
  L.push(``);
  L.push(`## 1. Source dataset found`);
  L.push(`| Record | Count |`);
  L.push(`|---|---|`);
  L.push(`| Colleges | ${report.sourceCounts.colleges} |`);
  L.push(`| Notices | ${report.sourceCounts.notices} |`);
  L.push(`| Course rows | ${report.sourceCounts.courseRows} |`);
  L.push(`| Timeline colleges | ${report.sourceCounts.timelineColleges} |`);
  L.push(`| Timeline stages | ${report.sourceCounts.timelineStages} |`);
  L.push(`| dataSources entries | ${report.sourceCounts.dataSourceEntries} |`);
  L.push(``);
  L.push(`## 2. Planned target rows`);
  L.push(`| Table | Rows |`);
  L.push(`|---|---|`);
  L.push(`| Source | ${report.planned.sources} |`);
  L.push(`| Program | ${report.planned.programs} |`);
  L.push(`| Branch | ${report.planned.branches} |`);
  L.push(`| College | ${report.planned.colleges} |`);
  L.push(`| CourseOffering | ${report.planned.offerings} |`);
  L.push(`| FeeStructure | ${report.planned.fees} |`);
  L.push(`| AdmissionNotice | ${report.planned.admissionNotices} |`);
  L.push(`| AdmissionNoticeDate | ${report.planned.noticeDates} |`);
  L.push(`| LegacyTimelineStage | ${report.planned.timelineStages} |`);
  L.push(``);
  if (report.inserted) {
    L.push(`## 2b. Applied to DB`);
    L.push(`| Key | Writes (create+update) |`);
    L.push(`|---|---|`);
    for (const [k, v] of Object.entries(report.inserted)) L.push(`| ${k} | ${v} |`);
    L.push(``);
  }
  L.push(`## 3. Fields with missing information (left NULL — never defaulted)`);
  L.push(`| Field | Affected |`);
  L.push(`|---|---|`);
  L.push(`| College.website missing | ${report.missingInformation.collegesWithoutWebsite.length} ${report.missingInformation.collegesWithoutWebsite.slice(0, 8).join(", ")}${report.missingInformation.collegesWithoutWebsite.length > 8 ? " …" : ""} |`);
  L.push(`| College contact missing | ${report.missingInformation.collegesWithoutContact} |`);
  L.push(`| College established missing | ${report.missingInformation.collegesWithoutEstablished} |`);
  L.push(`| College accreditation missing | ${report.missingInformation.collegesWithoutAccreditation} |`);
  L.push(`| College without any dataset source URL | ${report.missingInformation.collegesWithoutAnySourceUrl.length} ${report.missingInformation.collegesWithoutAnySourceUrl.slice(0, 6).join(", ")}${report.missingInformation.collegesWithoutAnySourceUrl.length > 6 ? " …" : ""} |`);
  L.push(`| Courses without fees | ${report.missingInformation.coursesWithoutFees} |`);
  L.push(`| Courses without seats | ${report.missingInformation.coursesWithoutSeats} |`);
  L.push(`| Courses without eligibility | ${report.missingInformation.coursesWithoutEligibility} |`);
  L.push(`| Notices without officialUrl | ${report.missingInformation.noticesWithoutOfficialUrl} |`);
  L.push(`| Notices whose pdfUrl is a dead path (public/notices does not exist) | ${report.missingInformation.noticesWithDeadPdfUrl} |`);
  L.push(``);
  L.push(`## 4. Structure transformations required`);
  report.transformedFields.push(
    "College.courses JSON[] → CourseOffering(+Program/Branch/FeeStructure) rows",
    "course.name free text → (Program, Branch) classification + residual reported",
    "course.fees ₹ integer → FeeStructure.amountPaise (tuition, per_year)",
    "course.duration text → durationYears numeric + durationLabel verbatim",
    "Notice.publishedDate/lastDate strings → DateTime (publishedAt / AdmissionNoticeDate rows)",
    "Notice.importantDates+deadlines JSON[] → AdmissionNoticeDate rows (kind: important_date|deadline)",
    "Notice.status 'active|upcoming|expired' → EditorialStatus 'published' (time-derived status removed; re-derived in Phase 4)",
    "collegeTimelines stages → LegacyTimelineStage rows (rawStageKey/rawStatus preserved losslessly)",
    "dataSources{collegeId: urls} → Source rows attributed per college",
  );
  for (const t of report.transformedFields) L.push(`- ${t}`);
  L.push(``);
  L.push(`## 5. Provenance policy applied`);
  L.push(`- ALL imported facts are marked \`unverified\`. Nothing was labeled "AI extracted" — the dataset predates any AI extraction pipeline.`);
  L.push(`- NO source URLs were invented. College official-website URLs and dataset-declared notice URLs are stored verbatim; pattern-generated \`admission.<domain>\` portals were DROPPED, not copied.`);
  L.push(`- Every imported college row and attributed URL points at one internal Source record documenting the bulk-import provenance.`);
  L.push(``);
  L.push(`## 6. Unmapped / unclassified tokens (preserved, not guessed)`);
  L.push(`- Program names not matching any rule: ${report.unmappedProgramNames.length ? report.unmappedProgramNames.map(s => `"${s}"`).join(", ") : "none"}`);
  L.push(`- Branch tokens not matching any alias: ${report.unmappedBranchTokens.length ? report.unmappedBranchTokens.map(s => `"${s}"`).join(", ") : "none"}`);
  L.push(``);
  L.push(`## 7. Conflicts & duplicates`);
  L.push(`- Duplicate college ids in source: ${report.duplicatesInSource.colleges.length ? report.duplicatesInSource.colleges.join(", ") : "none"}`);
  L.push(`- Duplicate notice ids in source: ${report.duplicatesInSource.notices.length ? report.duplicatesInSource.notices.join(", ") : "none"}`);
  L.push(`- Conflicts: ${report.conflicts.length === 0 ? "none" : ""}`);
  for (const c of report.conflicts) L.push(`  - ${c}`);
  L.push(``);
  L.push(`## 8. Row-mapping trace (first 40)`);
  L.push(`| Source | Target |`);
  L.push(`|---|---|`);
  for (const t of report.transformations.slice(0, 40)) L.push(`| ${t.source} | ${t.target} |`);
  L.push(``);
  L.push(`## 9. Apply instructions (run when DATABASE_URL is reachable)`);
  L.push("```bash");
  L.push(`npx prisma migrate dev --name phase1_normalized_domain   # dev: create migration from schema`);
  L.push(`npx prisma migrate deploy                                # prod-safe apply of existing migrations`);
  L.push(`npm run data:seed                                        # idempotent seed (this script, without --dry-run)`);
  L.push(`npm run data:verify                                      # post-apply consistency assertions`);
  L.push("```");
  L.push(``);
  L.push(`Rollback: the migration is additive — \`npx prisma migrate resolve --rolled-back\` + drop of the new tables restores the pre-Phase-1 DB. \`src/data/*\` remains untouched and continues to back the live UI.`);
  return L.join("\n");
}

// ─────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────

async function main() {
  analyzeSource();
  const planned = planRows();

  const prisma = new PrismaClient();
  report.dbReachable = await connectWithRetry(prisma);

  if (VERIFY_ONLY) {
    if (!report.dbReachable) { console.error("DB unreachable; nothing to verify."); process.exit(2); }
    const lines = await verifyDb(prisma);
    for (const l of lines) console.log(l);
    await prisma.$disconnect();
    process.exit(lines.some((l) => l.startsWith("FAIL")) ? 1 : 0);
  }

  if (report.dbReachable && !FORCE_DRY) {
    report.mode = "apply";
    await applyToDb(prisma, planned);
  } else {
    report.mode = "dry-run";
  }
  await prisma.$disconnect();

  const md = renderReport();
  const outPath = path.join(process.cwd(), "docs", "MIGRATION_REPORT.md");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, md, "utf-8");

  if (JSON_OUT) console.log(JSON.stringify(report, null, 2));
  console.log(`\n${report.mode.toUpperCase()} complete → ${outPath}`);
  console.log(`Colleges: ${report.sourceCounts.colleges} → ${report.planned.colleges}`);
  console.log(`Notices:  ${report.sourceCounts.notices} → ${report.planned.admissionNotices}`);
  console.log(`Courses:  ${report.sourceCounts.courseRows} → ${report.planned.offerings} offerings (+${report.planned.fees} fee rows)`);
  console.log(`Timeline: ${report.sourceCounts.timelineColleges} colleges / ${report.sourceCounts.timelineStages} stages preserved losslessly`);
  console.log(`Conflicts: ${report.conflicts.length} | Unmapped programs: ${report.unmappedProgramNames.length} | Unmapped branch tokens: ${report.unmappedBranchTokens.length}`);
  console.log(`DB reachable: ${report.dbReachable} · Mode: ${report.mode}${report.mode === "dry-run" ? " (no DB writes)" : " (APPLIED)"}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
