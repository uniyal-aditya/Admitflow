import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const college = await prisma.college.findUnique({ where: { id } });
    if (!college) return NextResponse.json({ error: "College not found" }, { status: 404 });

    return NextResponse.json(college);
  } catch (error) {
    console.error("Error fetching college:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    // Allowlist only real College columns (admissionPortal/courses were
    // dropped in Phase 5; blind spreads now fail schema validation).
    const data: Record<string, unknown> = {};
    for (const field of [
      "name", "shortName", "type", "ownership", "location", "district",
      "website", "contactPhone", "contactEmail", "description",
      "accreditation", "affiliation", "principal", "imageUrl",
    ]) {
      if (body[field] !== undefined) data[field] = body[field];
    }
    if (body.established !== undefined) {
      data.established =
        body.established === null || body.established === ""
          ? null
          : parseInt(body.established, 10) || body.established;
    }

    const college = await prisma.college.update({ where: { id }, data });
    return NextResponse.json(college);
  } catch (error) {
    console.error("Error updating college:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const college = await prisma.college.findUnique({ where: { id } });
    if (!college) return NextResponse.json({ error: "College not found" }, { status: 404 });

    await prisma.college.delete({ where: { id } });

    await prisma.adminLog.create({
      data: {
        action: "delete_college",
        details: `Deleted college "${college.name}" (${id})`,
        adminEmail: admin.email,
      },
    });

    return NextResponse.json({ message: "College deleted" });
  } catch (error) {
    console.error("Error deleting college:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
