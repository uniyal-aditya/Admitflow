import { NextRequest, NextResponse } from "next/server";
import { Prisma, NoticeTypeEnum, EditorialStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin";
import { after } from "next/server";
import { notifyFollowers } from "@/lib/services/notice-fanout";
import {
  NoticeValidationError, cleanTitle, cleanSummary, cleanOptionalUrl, cleanList, checkDateOrder, makeNoticeId,
} from "@/lib/notice-validation";

// ─── Shared validation / mapping ─────────────────────────────────────────
// The canonical Notice model stores structured dates in NoticeDate rows and
// derives live status from those dates (deadline engine) — there is no
// writable "active/upcoming/expired" status and no AI-generated summary.
// Editorial state (draft/published/archived) is the only admin-set status.

interface DateInput {
  kind: string;
  label: string;
  date: string;
}

function mapNoticeDates(body: {
  publishedDate?: string;
  lastDate?: string;
  dates?: DateInput[];
}): { publishedAt: Date | null; dates: { kind: string; label: string; date: Date }[] } {
  const dates: { kind: string; label: string; date: Date }[] = [];

  for (const d of body.dates ?? []) {
    if (d.kind !== "deadline" && d.kind !== "important_date") {
      throw new Error(`Invalid date kind: ${d.kind} (expected deadline or important_date)`);
    }
    if (!d.label?.trim()) throw new Error("Every date needs a label");
    const date = new Date(d.date);
    if (Number.isNaN(date.getTime())) throw new Error(`Invalid date for "${d.label}"`);
    dates.push({ kind: d.kind, label: d.label.trim(), date });
  }

  if (body.lastDate) {
    const date = new Date(body.lastDate);
    if (Number.isNaN(date.getTime())) throw new Error("Invalid lastDate");
    // Keep the latest deadline as-is in the UI; label mirrors the legacy form.
    dates.push({ kind: "deadline", label: "Last Date", date });
  }

  const publishedAt = body.publishedDate ? new Date(body.publishedDate) : null;
  if (body.publishedDate && Number.isNaN(publishedAt!.getTime())) {
    throw new Error("Invalid publishedDate");
  }

  return { publishedAt, dates };
}

const NOTICE_TYPES = new Set<string>(Object.values(NoticeTypeEnum));

async function resolveSessionId(requested: unknown): Promise<number> {
  if (typeof requested === "number" && Number.isInteger(requested)) return requested;
  const latest = await prisma.academicSession.findFirst({
    orderBy: { year: "desc" },
    select: { year: true },
  });
  if (!latest) throw new Error("No academic session exists; create one first");
  return latest.year;
}

// ─── GET /api/admin/notices ──────────────────────────────────────────────

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const notices = await prisma.notice.findMany({
      orderBy: { publishedAt: "desc" },
      include: { college: { select: { id: true, name: true, shortName: true } } },
    });
    return NextResponse.json(notices);
  } catch (error) {
    console.error("Error fetching notices:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── POST /api/admin/notices ─────────────────────────────────────────────

/** "<college>-<slug>", with -2, -3 ... added if that id is taken. */
async function uniqueNoticeId(collegeId: string, title: string): Promise<string> {
  const base = makeNoticeId(collegeId, title);
  for (let n = 1; n < 50; n++) {
    const candidate = n === 1 ? base : `${base.slice(0, 96)}-${n}`;
    if (!(await prisma.notice.findUnique({ where: { id: candidate }, select: { id: true } }))) return candidate;
  }
  throw new Error("Could not create a unique notice id");
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { collegeId, type, editorialStatus } = body;

    if (!collegeId || !type) {
      return NextResponse.json({ error: "Choose a college and a notice type." }, { status: 400 });
    }
    if (!NOTICE_TYPES.has(type)) {
      return NextResponse.json({ error: `Invalid notice type: ${type}` }, { status: 400 });
    }
    if (editorialStatus && !(editorialStatus in EditorialStatus)) {
      return NextResponse.json({ error: `Invalid editorial status: ${editorialStatus}` }, { status: 400 });
    }

    let title: string, summary: string | null, officialUrl: string | null, pdfUrl: string | null, documentsRequired: string[];
    let mapped: ReturnType<typeof mapNoticeDates>;
    try {
      title = cleanTitle(body.title);
      summary = cleanSummary(body.summary);
      officialUrl = cleanOptionalUrl(body.officialUrl, "The official notice link");
      pdfUrl = cleanOptionalUrl(body.pdfUrl, "The PDF link");
      documentsRequired = cleanList(body.documentsRequired, "Documents required");
      mapped = mapNoticeDates(body);
      const lastDeadline = mapped.dates.filter((d) => d.kind === "deadline").map((d) => d.date).sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
      checkDateOrder(mapped.publishedAt, lastDeadline);
    } catch (e) {
      if (e instanceof NoticeValidationError || e instanceof Error) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
      throw e;
    }

    const college = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!college) return NextResponse.json({ error: "College not found" }, { status: 404 });

    const sessionId = await resolveSessionId(body.sessionId);

    // Same college, same title, same session: almost certainly an accidental second entry.
    const duplicate = await prisma.notice.findFirst({
      where: { collegeId, sessionId, title: { equals: title, mode: "insensitive" } },
      select: { id: true },
    });
    if (duplicate && !body.allowDuplicate) {
      return NextResponse.json(
        { error: "A notice with this title already exists for this college.", duplicateOf: duplicate.id },
        { status: 409 },
      );
    }

    const id = await uniqueNoticeId(collegeId, title);
    const status = (editorialStatus as EditorialStatus) ?? "published";

    const notice = await prisma.notice.create({
      data: {
        id, collegeId, sessionId, title, type,
        summary, officialUrl, pdfUrl, status, documentsRequired,
        publishedAt: mapped.publishedAt ?? new Date(),
        dates: { create: mapped.dates },
      },
      include: { dates: true },
    });

    await prisma.adminLog.create({
      data: {
        action: "create_notice",
        details: `Created notice "${notice.title}" (${id}) for college ${college.shortName}`,
        adminEmail: admin.email,
      },
    });

    // Tell the college's followers after the response has been sent.
    if (status === "published") after(() => notifyFollowers(notice.id));

    return NextResponse.json(notice, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A notice with this id already exists" }, { status: 409 });
    }
    console.error("Error creating notice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
