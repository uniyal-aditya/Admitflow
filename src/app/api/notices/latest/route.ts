import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

/** Newest published notices for the "Latest updates" ticker. */
export async function GET() {
  try {
    const rows = await prisma.notice.findMany({
      where: { status: "published" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 6,
      select: { id: true, title: true, college: { select: { shortName: true } } },
    });
    return NextResponse.json(
      rows.map((n) => ({ id: n.id, title: n.title, college: n.college?.shortName ?? null })),
    );
  } catch {
    return NextResponse.json([]);
  }
}
