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

    const college = await prisma.college.create({ data: body });
    return NextResponse.json(college, { status: 201 });
  } catch (error) {
    console.error("Error creating college:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
