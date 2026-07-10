import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const visitors = await prisma.visitor.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json(visitors);
  } catch (err) {
    console.error("List visitors error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
