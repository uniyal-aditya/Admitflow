import { NextRequest, NextResponse } from "next/server";
import { Prisma, EditorialStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin";

// PATCH accepts a partial allowlist of scalar fields and replaces the
// structured NoticeDate rows wholesale. There is no writable
// active/upcoming/expired status: live status is derived from dates by the
// deadline engine; editorial state (draft/published/archived) is the only
// admin-set status.

const EDITORIAL = new Set<string>(["draft", "published", "archived"]);
const NOTICE_TYPES = new Set<string>([
  "admission", "registration", "counselling", "spot_round", "vacant_seat",
  "merit_list", "waiting_list", "fee_payment", "reporting", "extension", "general",
]);

interface DateInput {
  kind: string;
  label: string;
  date: string;
}

function mapDates(dates: DateInput[]): { kind: string; label: string; date: Date }[] {
  return dates.map((d) => {
    if (d.kind !== "deadline" && d.kind !== "important_date") {
      throw new Error(`Invalid date kind: ${d.kind} (expected deadline or important_date)`);
    }
    if (!d.label?.trim()) throw new Error("Every date needs a label");
    const date = new Date(d.date);
    if (Number.isNaN(date.getTime())) throw new Error(`Invalid date for "${d.label}"`);
    return { kind: d.kind, label: d.label.trim(), date };
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const notice = await prisma.notice.findUnique({
      where: { id },
      include: {
        dates: { orderBy: { date: "asc" } },
        college: { select: { id: true, name: true, shortName: true } },
      },
    });
    if (!notice) return NextResponse.json({ error: "Notice not found" }, { status: 404 });

    return NextResponse.json(notice);
  } catch (error) {
    console.error("Error fetching notice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const data: Prisma.NoticeUpdateInput = {};

    if (body.title !== undefined) data.title = body.title;
    if (body.summary !== undefined) data.summary = body.summary || null;
    if (body.officialUrl !== undefined) data.officialUrl = body.officialUrl || null;
    if (body.pdfUrl !== undefined) data.pdfUrl = body.pdfUrl || null;
    if (body.type !== undefined) {
      if (!NOTICE_TYPES.has(body.type)) {
        return NextResponse.json({ error: `Invalid notice type: ${body.type}` }, { status: 400 });
      }
      data.type = body.type;
    }
    if (body.editorialStatus !== undefined) {
      if (!EDITORIAL.has(body.editorialStatus)) {
        return NextResponse.json(
          { error: `Invalid editorial status: ${body.editorialStatus}` },
          { status: 400 },
        );
      }
      data.status = body.editorialStatus;
    }
    if (body.collegeId !== undefined) {
      const college = await prisma.college.findUnique({ where: { id: body.collegeId } });
      if (!college) return NextResponse.json({ error: "College not found" }, { status: 404 });
      data.college = { connect: { id: body.collegeId } };
    }
    if (body.publishedDate !== undefined) {
      const d = new Date(body.publishedDate);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid publishedDate" }, { status: 400 });
      }
      data.publishedAt = d;
    }
    if (body.dates !== undefined) {
      if (!Array.isArray(body.dates)) {
        return NextResponse.json({ error: "dates must be an array" }, { status: 400 });
      }
      let mapped;
      try {
        mapped = mapDates(body.dates);
      } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 400 });
      }
      // Wholesale replacement runs BEFORE lastDate handling so a legacy-form
      // "Last Date" row sent alongside `dates` survives this step.
      await prisma.noticeDate.deleteMany({ where: { noticeId: id } });
      if (mapped.length) {
        await prisma.noticeDate.createMany({
          data: mapped.map((d) => ({ ...d, noticeId: id })),
        });
      }
    }
    if (body.lastDate !== undefined) {
      // Delete-then-create: POST may have created the row with a cuid, so an
      // id-based upsert would silently duplicate the "Last Date" deadline.
      await prisma.noticeDate.deleteMany({
        where: { noticeId: id, kind: "deadline", label: "Last Date" },
      });
      if (body.lastDate !== null && body.lastDate !== "") {
        const d = new Date(body.lastDate);
        if (Number.isNaN(d.getTime())) {
          return NextResponse.json({ error: "Invalid lastDate" }, { status: 400 });
        }
        await prisma.noticeDate.create({
          data: { noticeId: id, kind: "deadline", label: "Last Date", date: d },
        });
      }
    }

    const notice = await prisma.notice.update({ where: { id }, data });

    await prisma.adminLog.create({
      data: {
        action: "update_notice",
        details: `Updated notice "${notice.title}" (${id})`,
        adminEmail: admin.email,
      },
    });

    return NextResponse.json(notice);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Notice not found" }, { status: 404 });
    }
    console.error("Error updating notice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const notice = await prisma.notice.findUnique({
      where: { id },
      include: { college: { select: { shortName: true } } },
    });
    if (!notice) return NextResponse.json({ error: "Notice not found" }, { status: 404 });

    await prisma.notice.delete({ where: { id } });

    await prisma.adminLog.create({
      data: {
        action: "delete_notice",
        details: `Deleted notice "${notice.title}" (${id}) for college ${notice.college?.shortName || notice.collegeId}`,
        adminEmail: admin.email,
      },
    });

    return NextResponse.json({ message: "Notice deleted" });
  } catch (error) {
    console.error("Error deleting notice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
