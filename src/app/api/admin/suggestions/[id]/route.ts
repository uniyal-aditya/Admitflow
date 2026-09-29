import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json({ error: "Status must be 'approved' or 'rejected'" }, { status: 400 });
    }

    const suggestion = await prisma.suggestion.findUnique({ where: { id } });
    if (!suggestion) return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });

    if (suggestion.status !== "pending") {
      return NextResponse.json({ error: "Suggestion has already been reviewed" }, { status: 400 });
    }

    await prisma.suggestion.update({ where: { id }, data: { status } });

    if (status === "approved") {
      const slug = suggestion.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      await prisma.college.create({
        data: {
          id: slug,
          name: suggestion.name,
          shortName: suggestion.name,
          type: suggestion.type || "Unknown",
          ownership: "Unknown",
          location: suggestion.location || "Unknown",
          district: suggestion.district || "Unknown",
          website: suggestion.website || undefined,
        },
      });
    }

    const updated = await prisma.suggestion.findUnique({ where: { id } });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating suggestion:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
