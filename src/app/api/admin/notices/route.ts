import { NextRequest, NextResponse } from "next/server";
import { Prisma, NoticeTypeEnum, EditorialStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin";

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

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, collegeId, title, type, summary, officialUrl, pdfUrl, editorialStatus } = body;

    if (!id || !collegeId || !title || !type) {
      return NextResponse.json(
        { error: "Missing required fields: id, collegeId, title, type" },
        { status: 400 },
      );
    }
    if (!NOTICE_TYPES.has(type)) {
      return NextResponse.json({ error: `Invalid notice type: ${type}` }, { status: 400 });
    }
    if (editorialStatus && !(editorialStatus in EditorialStatus)) {
      return NextResponse.json({ error: `Invalid editorial status: ${editorialStatus}` }, { status: 400 });
    }

    const college = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!college) return NextResponse.json({ error: "College not found" }, { status: 404 });

    let mapped;
    try {
      mapped = mapNoticeDates(body);
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 });
    }

    const sessionId = await resolveSessionId(body.sessionId);

    const notice = await prisma.notice.create({
      data: {
        id,
        collegeId,
        sessionId,
        title,
        type,
        summary: summary || null,
        officialUrl: officialUrl || null,
        pdfUrl: pdfUrl || null,
        status: (editorialStatus as EditorialStatus) ?? "published",
        documentsRequired: Array.isArray(body.documentsRequired)
          ? body.documentsRequired.filter(Boolean)
          : [],
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

    return NextResponse.json(notice, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A notice with this id already exists" }, { status: 409 });
    }
    console.error("Error creating notice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
