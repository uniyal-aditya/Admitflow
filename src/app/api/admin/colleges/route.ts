import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const colleges = await prisma.college.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(colleges);
  } catch (error) {
    console.error("Error fetching colleges:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, name, shortName, type, ownership, location, district } = body;

    if (!id || !name || !shortName || !type || !ownership || !location || !district) {
      return NextResponse.json({ error: "Missing required fields: id, name, shortName, type, ownership, location, district" }, { status: 400 });
    }

    // Allowlist only real College columns (admissionPortal/courses were
    // dropped in Phase 5; blind spreads now fail schema validation).
    const college = await prisma.college.create({
      data: {
        id,
        name,
        shortName,
        type,
        ownership,
        location,
        district,
        website: body.website || null,
        contactPhone: body.contactPhone || null,
        contactEmail: body.contactEmail || null,
        description: body.description || null,
        established:
          body.established !== undefined && body.established !== null && body.established !== ""
            ? parseInt(body.established, 10) || null
            : null,
        accreditation: body.accreditation || null,
        affiliation: body.affiliation || null,
        principal: body.principal || null,
        imageUrl: body.imageUrl || null,
      },
    });
    return NextResponse.json(college, { status: 201 });
  } catch (error) {
    console.error("Error creating college:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
