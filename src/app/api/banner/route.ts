import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const banners = await prisma.broadcastMessage.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(banners.map((b) => ({ id: b.id, message: b.message })));
  } catch {
    return NextResponse.json([]);
  }
}
