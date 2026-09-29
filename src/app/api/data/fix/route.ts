import { NextResponse } from "next/server";
import { NoticeTypeEnum } from "@prisma/client";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db/prisma";

async function applySingleFix(admin: { email: string }, fix: { id: string; field: string; suggestedFix: string; category: string; item?: string }) {
  const { id, field, suggestedFix: value, category, item } = fix;

  if (category === "college") {
    const existing = await prisma.college.findUnique({ where: { id } });
    if (!existing) return { error: "College not found" };

    const updateData: any = {};
    if (field === "established") updateData.established = parseInt(value) || value;
    else if (["ownership", "type", "location", "district", "website", "name", "shortName"].includes(field)) updateData[field] = value;
    else return { error: `Unsupported college field: ${field}` };

    await prisma.college.update({ where: { id }, data: updateData });
  } else if (category === "notice") {
    // Canonical Notice model: dates are structured (publishedAt + NoticeDate
    // rows) and live status is derived, never stored.
    const existing = await prisma.notice.findUnique({ where: { id } });
    if (!existing) return { error: "Notice not found" };

    if (field === "title" || field === "summary") {
      await prisma.notice.update({ where: { id }, data: { [field]: value } });
    } else if (field === "type") {
      await prisma.notice.update({ where: { id }, data: { type: value as NoticeTypeEnum } });
    } else if (field === "publishedDate") {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return { error: `Invalid date for publishedDate: ${value}` };
      await prisma.notice.update({ where: { id }, data: { publishedAt: d } });
    } else if (field === "lastDate") {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return { error: `Invalid date for lastDate: ${value}` };
      await prisma.noticeDate.deleteMany({ where: { noticeId: id, kind: "deadline", label: "Last Date" } });
      await prisma.noticeDate.create({
        data: { noticeId: id, kind: "deadline", label: "Last Date", date: d },
      });
    } else if (field === "status") {
      return {
        error:
          "Notice status is derived from dates (deadline engine) and cannot be set; adjust publishedDate/lastDate instead",
      };
    } else {
      return { error: `Unsupported notice field: ${field}` };
    }
  } else {
    return { error: `Unsupported category: ${category}` };
  }

  await prisma.adminLog.create({
    data: {
      action: "apply_fix",
      details: `Applied fix for ${category} ${id} (${item || id}): ${field} → ${value}`,
      adminEmail: admin.email,
    },
  });

  return { success: true };
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    if (Array.isArray(body)) {
      // Batch: apply DB fixes sequentially.
      const errors: { issue: string; error: string }[] = [];
      let applied = 0;

      for (const fix of body) {
        try {
          const result = await applySingleFix(admin, fix);
          if (result.success) applied++;
          else errors.push({ issue: fix.item || fix.id, error: result.error || "Unknown" });
        } catch (e: any) {
          errors.push({ issue: fix.item || fix.id, error: e.message || "Unknown" });
        }
      }

      return NextResponse.json({ success: applied > 0, applied, errors });
    }

    const result = await applySingleFix(admin, body);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Fix error:", err);
    return NextResponse.json({ error: err.message || "Failed to apply fix" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
