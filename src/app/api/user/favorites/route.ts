import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.id },
      select: { collegeId: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ favorites: favorites.map((f) => f.collegeId) });
  } catch (err) {
    console.error("GET favorites error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST { collegeId, action? } — toggles by default; action: "add" | "remove"
 * for explicit one-way updates. College ids are validated against the
 * canonical College table.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { collegeId, action } = await req.json();
    if (!collegeId || typeof collegeId !== "string") {
      return NextResponse.json({ error: "collegeId is required" }, { status: 400 });
    }

    const college = await prisma.college.findUnique({
      where: { id: collegeId },
      select: { id: true },
    });
    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_collegeId: { userId: session.id, collegeId } },
    });

    const shouldAdd =
      action === "add" ? true : action === "remove" ? false : !existing;

    if (shouldAdd && !existing) {
      await prisma.favorite.create({ data: { userId: session.id, collegeId } });
    } else if (!shouldAdd && existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.id },
      select: { collegeId: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({
      favorite: shouldAdd,
      favorites: favorites.map((f) => f.collegeId),
    });
  } catch (err) {
    console.error("POST favorites error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
