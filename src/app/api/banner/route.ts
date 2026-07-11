import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const banner = await prisma.broadcastMessage.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(banner ? { message: banner.message, id: banner.id } : null);
  } catch {
    return NextResponse.json(null);
  }
}
