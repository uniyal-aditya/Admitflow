import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, field, suggestedFix, category, item } = await req.json();
    if (!id || !field || !suggestedFix || !category) {
      return NextResponse.json({ error: "Missing required fields: id, field, suggestedFix, category" }, { status: 400 });
    }

    if (category === "college") {
      const existing = await prisma.college.findUnique({ where: { id } });
      if (!existing) return NextResponse.json({ error: "College not found" }, { status: 404 });

      const updateData: any = {};
      if (field === "established") updateData.established = parseInt(suggestedFix) || suggestedFix;
      else if (field === "ownership") updateData.ownership = suggestedFix;
      else if (field === "type") updateData.type = suggestedFix;
      else if (field === "location") updateData.location = suggestedFix;
      else if (field === "district") updateData.district = suggestedFix;
      else if (field === "website") updateData.website = suggestedFix;
      else if (field === "name") updateData.name = suggestedFix;
      else if (field === "shortName") updateData.shortName = suggestedFix;
      else return NextResponse.json({ error: `Unsupported college field: ${field}` }, { status: 400 });

      await prisma.college.update({ where: { id }, data: updateData });
    } else if (category === "notice") {
      const existing = await prisma.notice.findUnique({ where: { id } });
      if (!existing) return NextResponse.json({ error: "Notice not found" }, { status: 404 });

      const updateData: any = {};
      if (field === "title") updateData.title = suggestedFix;
      else if (field === "type") updateData.type = suggestedFix;
      else if (field === "status") updateData.status = suggestedFix;
      else if (field === "publishedDate") updateData.publishedDate = suggestedFix;
      else if (field === "lastDate") updateData.lastDate = suggestedFix;
      else if (field === "summary") updateData.summary = suggestedFix;
      else return NextResponse.json({ error: `Unsupported notice field: ${field}` }, { status: 400 });

      await prisma.notice.update({ where: { id }, data: updateData });
    } else {
      return NextResponse.json({ error: `Unsupported category: ${category}` }, { status: 400 });
    }

    await prisma.adminLog.create({
      data: {
        action: "apply_fix",
        details: `Applied fix for ${category} ${id} (${item}): ${field} → ${suggestedFix}`,
        adminEmail: admin.email,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Fix error:", err);
    return NextResponse.json({ error: err.message || "Failed to apply fix" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
